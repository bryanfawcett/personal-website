//! Reading Sanity, behind `mzizi-resilience`.
//!
//! The TypeScript `groq()` is one `fetch` with an 8 second timeout. This is the same call
//! with the three N5 decisions made by the Mzizi crate instead of by hand:
//!
//! * [`Deadline`] owns the time budget. The remaining budget, not a fresh 8 s, is what the
//!   transport is given as its timeout.
//! * [`Breaker`] decides whether Sanity may be called at all. After repeated failures it
//!   opens, and for the cooldown no request touches the network: the page falls straight to
//!   its stale copy or its 503 instead of every reader paying the timeout.
//! * [`chain::run`] picks the stage that serves: fresh, else the last good copy from this
//!   isolate (held for ten minutes: the "stale-if-error" the cache header only promised),
//!   else "unreachable". The answer says which stage served, which is the `X-Blog-Source`
//!   header.
//!
//! Sans-IO, as the crate intends: the clock is a trait, the network is a trait, and the
//! breaker's state lives in a value the host owns. The tests drive all three with a script.
//!
//! One adaptation worth knowing about: `chain::run` takes synchronous `FnOnce` stages, and a
//! fetch is async. So the I/O is awaited first and the stages close over its *outcome*;
//! the chain still makes the fresh-or-fallback decision and reports `stage` and `degraded`,
//! but it cannot sequence the network call itself. See docs/rust-blog-worker.md.

use std::collections::HashMap;

use mzizi_resilience::{
    breaker::{Admission, Breaker, Config},
    chain,
    deadline::Deadline,
};
use serde_json::Value;

use crate::queries::{API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID};

/// Total time one request may spend waiting on Sanity (the TypeScript's `timeout(8000)`).
pub const BUDGET_MS: u64 = 8_000;
/// Five failures inside thirty seconds open the breaker for thirty seconds.
pub const BREAKER: Config = Config { failure_threshold: 5, window_ms: 30_000, cooldown_ms: 30_000 };
/// How long a last-good answer may be served when Sanity cannot be reached.
pub const STALE_TTL_MS: u64 = 600_000;
const STALE_MAX_ENTRIES: usize = 64;

pub trait Clock {
    fn now_ms(&self) -> u64;
}

/// Why one attempt to read Sanity failed. Carries no payload text: nothing from a response
/// body or an error message can reach a log through this type (the crate's own rule).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FetchError {
    Timeout,
    Network,
    /// A non-2xx answer.
    Status(u16),
    /// A 2xx whose body was not the `{ "result": … }` envelope.
    BadBody,
}

impl FetchError {
    /// Does this say Sanity is unhealthy (so the breaker should count it)? A 4xx other than
    /// 429 means *our* query or URL is wrong, which is not a reason to stop calling Sanity.
    fn counts_against_breaker(self) -> bool {
        match self {
            FetchError::Timeout | FetchError::Network | FetchError::BadBody => true,
            FetchError::Status(s) => s >= 500 || s == 429,
        }
    }
}

#[allow(async_fn_in_trait)]
pub trait Transport {
    /// GET `url`, returning the body of a 2xx answer, giving up after `timeout_ms`.
    async fn get(&self, url: &str, timeout_ms: u64) -> Result<String, FetchError>;
}

/// Where an answer came from.
#[derive(Debug, Clone, PartialEq)]
pub enum Outcome {
    Fresh(Value),
    /// Sanity could not be read; this is the last good answer, at most [`STALE_TTL_MS`] old.
    Stale(Value),
    /// Nothing to serve. The page says so with a 503.
    Unavailable,
}

impl Outcome {
    pub fn source(&self) -> &'static str {
        match self {
            Outcome::Fresh(_) => "fresh",
            Outcome::Stale(_) => "stale",
            Outcome::Unavailable => "unavailable",
        }
    }
}

/// State that must outlive a request: the breaker and the last-good answers. The host
/// keeps one per isolate.
pub struct Guard {
    breaker: Breaker,
    stale: HashMap<String, (u64, Value)>,
}

impl Guard {
    pub fn new() -> Guard {
        Guard::with_config(BREAKER)
    }

    pub fn with_config(cfg: Config) -> Guard {
        // The constants above are valid; a bad config from a test is a test bug.
        Guard { breaker: Breaker::new(cfg).expect("breaker config"), stale: HashMap::new() }
    }

    pub fn breaker_state(&self, now: u64) -> mzizi_resilience::breaker::State {
        self.breaker.state(now)
    }

    fn remember(&mut self, url: &str, now: u64, value: &Value) {
        // A "not found" (null) answer is not a last-good page. Anyone can ask for a thousand slugs
        // that do not exist, and caching each would push the list's real last-good copy out of this
        // bounded map, leaving the next Sanity outage with nothing to serve.
        if value.is_null() {
            return;
        }
        if self.stale.len() >= STALE_MAX_ENTRIES && !self.stale.contains_key(url) {
            if let Some(oldest) = self.stale.iter().min_by_key(|(_, (t, _))| *t).map(|(k, _)| k.clone()) {
                self.stale.remove(&oldest);
            }
        }
        self.stale.insert(url.to_string(), (now, value.clone()));
    }

    fn recall(&self, url: &str, now: u64) -> Option<Value> {
        self.stale
            .get(url)
            .filter(|(at, _)| now.saturating_sub(*at) <= STALE_TTL_MS)
            .map(|(_, v)| v.clone())
    }
}

impl Default for Guard {
    fn default() -> Self {
        Guard::new()
    }
}

/// Percent-encode a query component (RFC 3986 unreserved stay).
fn encode(s: &str) -> String {
    let mut out = String::with_capacity(s.len() * 2);
    for b in s.bytes() {
        if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.' | b'~') {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

/// The query URL: `perspective=published`, string params JSON-quoted and `$`-prefixed (an
/// unquoted string param reads as an identifier and matches nothing).
pub fn query_url(origin: &str, query: &str, params: &[(&str, &str)]) -> String {
    let mut url = format!(
        "{origin}/v{API_VERSION}/data/query/{SANITY_DATASET}?query={}&perspective=published",
        encode(query)
    );
    for (key, value) in params {
        let quoted = Value::String((*value).to_string()).to_string();
        url.push_str(&format!("&${}={}", encode(key), encode(&quoted)));
    }
    url
}

/// The production origin. Tests and the local fixture run override it.
pub fn default_origin() -> String {
    format!("https://{SANITY_PROJECT_ID}.apicdn.sanity.io")
}

/// Open the `{ "result": … }` envelope.
pub fn parse_envelope(body: &str) -> Result<Value, FetchError> {
    let mut v: Value = serde_json::from_str(body).map_err(|_| FetchError::BadBody)?;
    match v.as_object_mut().and_then(|o| o.remove("result")) {
        Some(result) => Ok(result),
        None => Err(FetchError::BadBody),
    }
}

pub struct Sanity<'a, T: Transport, C: Clock> {
    pub transport: &'a T,
    pub clock: &'a C,
    pub guard: &'a std::cell::RefCell<Guard>,
    pub origin: &'a str,
}

impl<T: Transport, C: Clock> Sanity<'_, T, C> {
    /// Run a GROQ query. Never fails: every failure is an [`Outcome`].
    pub async fn groq(&self, query: &str, params: &[(&str, &str)]) -> Outcome {
        let url = query_url(self.origin, query, params);
        let start = self.clock.now_ms();
        // BUDGET_MS is a non-zero constant; fall back to the full budget rather than panic.
        let deadline = Deadline::new(start, BUDGET_MS).ok();

        // Admission first, with no borrow held across the await.
        let admission = self.guard.borrow_mut().breaker.acquire(start);

        let fresh: Result<Value, FetchError> = match admission {
            // Open, or a probe already out: do not touch the network at all.
            Admission::Open { .. } | Admission::ProbeInFlight => Err(FetchError::Network),
            Admission::Allowed(permit) => {
                let remaining = deadline.map_or(BUDGET_MS, |d| d.remaining_ms(self.clock.now_ms()));
                let attempt = if remaining == 0 {
                    Err(FetchError::Timeout)
                } else {
                    match self.transport.get(&url, remaining).await {
                        Ok(body) => parse_envelope(&body),
                        Err(e) => Err(e),
                    }
                };
                let now = self.clock.now_ms();
                let mut guard = self.guard.borrow_mut();
                match &attempt {
                    Ok(_) => guard.breaker.success(permit),
                    Err(e) if e.counts_against_breaker() => guard.breaker.failure(now, permit),
                    // Our own bad request: neither health nor sickness. Free a probe slot.
                    Err(_) => guard.breaker.release(permit),
                }
                attempt
            }
        };

        let now = self.clock.now_ms();
        // Stage 0 serves the fresh answer, stage 1 the last good one; the chain reports which.
        type Stage<'s> = Box<dyn FnOnce() -> Result<Value, ()> + 's>;
        let guard = &self.guard;
        let stages: Vec<Stage<'_>> = vec![
            Box::new(|| fresh.clone().map_err(|_| ())),
            Box::new(|| guard.borrow().recall(&url, now).ok_or(())),
        ];
        match chain::run(stages) {
            Ok(served) if !served.degraded => {
                self.guard.borrow_mut().remember(&url, now, &served.value);
                Outcome::Fresh(served.value)
            }
            Ok(served) => Outcome::Stale(served.value),
            Err(_) => Outcome::Unavailable,
        }
    }
}

#[cfg(test)]
pub mod testing {
    //! A fake clock and a scripted transport, shared by this module's tests and the
    //! handler's.
    use super::*;
    use std::cell::{Cell, RefCell};
    use std::collections::VecDeque;

    pub struct FakeClock(pub Cell<u64>);
    impl Clock for FakeClock {
        fn now_ms(&self) -> u64 {
            self.0.get()
        }
    }
    impl FakeClock {
        pub fn at(ms: u64) -> FakeClock {
            FakeClock(Cell::new(ms))
        }
        pub fn advance(&self, ms: u64) {
            self.0.set(self.0.get() + ms);
        }
    }

    /// Answers from a queue (the last answer repeats), counting calls and recording the
    /// timeout it was given.
    pub struct Script {
        answers: RefCell<VecDeque<Result<String, FetchError>>>,
        pub calls: Cell<u32>,
        pub timeouts: RefCell<Vec<u64>>,
        pub urls: RefCell<Vec<String>>,
        /// Time a call "takes": advances the shared clock, like a slow network.
        pub took_ms: Cell<u64>,
        pub clock: Option<std::rc::Rc<FakeClock>>,
    }
    impl Script {
        pub fn new(answers: Vec<Result<String, FetchError>>) -> Script {
            Script {
                answers: RefCell::new(answers.into()),
                calls: Cell::new(0),
                timeouts: RefCell::new(vec![]),
                urls: RefCell::new(vec![]),
                took_ms: Cell::new(0),
                clock: None,
            }
        }
        pub fn ok(json: &str) -> Result<String, FetchError> {
            Ok(format!("{{\"result\":{json}}}"))
        }
        pub fn replace(&self, answers: Vec<Result<String, FetchError>>) {
            *self.answers.borrow_mut() = answers.into();
        }
    }
    impl Transport for Script {
        async fn get(&self, url: &str, timeout_ms: u64) -> Result<String, FetchError> {
            self.calls.set(self.calls.get() + 1);
            self.timeouts.borrow_mut().push(timeout_ms);
            self.urls.borrow_mut().push(url.to_string());
            if let Some(c) = &self.clock {
                c.advance(self.took_ms.get());
            }
            let mut q = self.answers.borrow_mut();
            if q.len() > 1 { q.pop_front().unwrap() } else { q.front().cloned().unwrap_or(Err(FetchError::Network)) }
        }
    }

    /// Drive a future that never actually suspends (all the fakes complete at once).
    pub fn block_on<F: std::future::Future>(f: F) -> F::Output {
        use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};
        fn noop_raw() -> RawWaker {
            fn clone(_: *const ()) -> RawWaker { noop_raw() }
            fn noop(_: *const ()) {}
            static VT: RawWakerVTable = RawWakerVTable::new(clone, noop, noop, noop);
            RawWaker::new(std::ptr::null(), &VT)
        }
        let waker = unsafe { Waker::from_raw(noop_raw()) };
        let mut cx = Context::from_waker(&waker);
        let mut f = std::pin::pin!(f);
        match f.as_mut().poll(&mut cx) {
            Poll::Ready(v) => v,
            Poll::Pending => panic!("a fake future suspended"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::testing::*;
    use super::*;
    use mzizi_resilience::breaker::State;
    use std::cell::RefCell;
    use std::rc::Rc;

    fn sanity<'a>(t: &'a Script, c: &'a FakeClock, g: &'a RefCell<Guard>) -> Sanity<'a, Script, FakeClock> {
        Sanity { transport: t, clock: c, guard: g, origin: "https://example.test" }
    }

    #[test]
    fn url_matches_the_typescript_client() {
        let u = query_url("https://zsx9erk1.apicdn.sanity.io", "*[_type == \"a\" && slug.current == $slug][0]", &[("slug", "mana pools")]);
        assert!(u.starts_with("https://zsx9erk1.apicdn.sanity.io/v2025-02-19/data/query/production?query="));
        assert!(u.contains("&perspective=published"));
        // a string param arrives JSON-quoted: %22mana%20pools%22
        assert!(u.ends_with("&$slug=%22mana%20pools%22"), "{u}");
        assert!(!u.contains(' ') && !u.contains('"'));
    }

    #[test]
    fn a_healthy_sanity_is_fresh_and_remembered() {
        let (t, c, g) = (Script::new(vec![Script::ok("[1,2]")]), FakeClock::at(1_000), RefCell::new(Guard::new()));
        let out = block_on(sanity(&t, &c, &g).groq("q", &[]));
        assert_eq!(out, Outcome::Fresh(serde_json::json!([1, 2])));
        assert_eq!(out.source(), "fresh");
        assert_eq!(t.calls.get(), 1);
    }

    /// A clock that reads out a script of times, then stays on the last one.
    struct Seq(RefCell<std::collections::VecDeque<u64>>);
    impl Clock for Seq {
        fn now_ms(&self) -> u64 {
            let mut q = self.0.borrow_mut();
            if q.len() > 1 { q.pop_front().unwrap() } else { *q.front().unwrap() }
        }
    }

    #[test]
    fn the_transport_is_given_the_remaining_budget_not_a_fresh_one() {
        // start=1000, then 4000 when the call is made: 3 s of the 8 s are already gone.
        let c = Seq(RefCell::new([1_000, 4_000, 4_000].into()));
        let t = Script::new(vec![Script::ok("null")]);
        let g = RefCell::new(Guard::new());
        block_on(Sanity { transport: &t, clock: &c, guard: &g, origin: "o" }.groq("q", &[]));
        assert_eq!(*t.timeouts.borrow(), vec![BUDGET_MS - 3_000]);
    }

    #[test]
    fn an_empty_result_is_an_answer_not_a_failure() {
        let (t, c, g) = (Script::new(vec![Script::ok("[]")]), FakeClock::at(0), RefCell::new(Guard::new()));
        assert_eq!(block_on(sanity(&t, &c, &g).groq("q", &[])), Outcome::Fresh(serde_json::json!([])));
        let t = Script::new(vec![Script::ok("null")]);
        assert_eq!(block_on(sanity(&t, &c, &g).groq("q", &[])), Outcome::Fresh(Value::Null));
    }

    #[test]
    fn a_failure_with_a_last_good_copy_serves_it_stale() {
        let (t, c, g) = (Script::new(vec![Script::ok("[\"good\"]"), Err(FetchError::Timeout)]), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        assert!(matches!(block_on(s.groq("q", &[])), Outcome::Fresh(_)));
        c.advance(5_000);
        let out = block_on(s.groq("q", &[]));
        assert_eq!(out, Outcome::Stale(serde_json::json!(["good"])));
        assert_eq!(out.source(), "stale");
    }

    #[test]
    fn stale_expires_after_ten_minutes() {
        let (t, c, g) = (Script::new(vec![Script::ok("[1]"), Err(FetchError::Status(503))]), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        block_on(s.groq("q", &[]));
        c.advance(STALE_TTL_MS);
        assert!(matches!(block_on(s.groq("q", &[])), Outcome::Stale(_)));
        c.advance(1);
        assert_eq!(block_on(s.groq("q", &[])), Outcome::Unavailable);
    }

    #[test]
    fn requests_for_missing_pages_cannot_evict_the_last_good_list() {
        // One good list, then far more not-found lookups than the stale map holds.
        let mut script = vec![Script::ok("[1]")];
        for _ in 0..(STALE_MAX_ENTRIES * 3) {
            script.push(Script::ok("null"));
        }
        script.push(Err(FetchError::Network));
        let (t, c, g) = (Script::new(script), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        block_on(s.groq("list", &[]));
        for i in 0..(STALE_MAX_ENTRIES * 3) {
            block_on(s.groq("one", &[("slug", &format!("no-such-post-{i}"))]));
        }
        // Sanity goes down: the list is still served stale.
        assert_eq!(block_on(s.groq("list", &[])).source(), "stale");
    }

    #[test]
    fn stale_is_per_query_never_another_pages_answer() {
        let (t, c, g) = (Script::new(vec![Script::ok("[1]"), Err(FetchError::Network)]), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        block_on(s.groq("q", &[("slug", "a")]));
        assert_eq!(block_on(s.groq("q", &[("slug", "b")])), Outcome::Unavailable);
    }

    #[test]
    fn five_failures_open_the_breaker_and_the_network_is_left_alone() {
        let (t, c, g) = (Script::new(vec![Err(FetchError::Timeout)]), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        for _ in 0..5 {
            assert_eq!(block_on(s.groq("q", &[])), Outcome::Unavailable);
            c.advance(100);
        }
        assert_eq!(t.calls.get(), 5);
        assert_eq!(g.borrow().breaker_state(c.now_ms()), State::Open);
        // While open, requests do not reach the transport at all.
        for _ in 0..20 {
            assert_eq!(block_on(s.groq("q", &[])), Outcome::Unavailable);
        }
        assert_eq!(t.calls.get(), 5, "an open breaker must stop the hammering");
    }

    #[test]
    fn an_open_breaker_still_serves_stale() {
        let c = FakeClock::at(0);
        let t = Script::new(vec![Script::ok("[\"kept\"]"), Err(FetchError::Timeout)]);
        let g = RefCell::new(Guard::new());
        let s = sanity(&t, &c, &g);
        block_on(s.groq("q", &[]));
        for _ in 0..5 { block_on(s.groq("other", &[])); }
        assert_eq!(g.borrow().breaker_state(c.now_ms()), State::Open);
        let before = t.calls.get();
        assert_eq!(block_on(s.groq("q", &[])), Outcome::Stale(serde_json::json!(["kept"])));
        assert_eq!(t.calls.get(), before);
    }

    #[test]
    fn after_the_cooldown_one_probe_decides_and_success_closes_the_circuit() {
        let (t, c, g) = (Script::new(vec![Err(FetchError::Network)]), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        for _ in 0..5 { block_on(s.groq("q", &[])); }
        c.advance(BREAKER.cooldown_ms);
        assert_eq!(g.borrow().breaker_state(c.now_ms()), State::HalfOpen);
        t.replace(vec![Script::ok("[1]")]);
        let n = t.calls.get();
        assert!(matches!(block_on(s.groq("q", &[])), Outcome::Fresh(_)));
        assert_eq!(t.calls.get(), n + 1);
        assert_eq!(g.borrow().breaker_state(c.now_ms()), State::Closed);
        assert!(matches!(block_on(s.groq("q", &[])), Outcome::Fresh(_)));
    }

    #[test]
    fn a_failed_probe_reopens_for_another_cooldown() {
        let (t, c, g) = (Script::new(vec![Err(FetchError::Timeout)]), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        for _ in 0..5 { block_on(s.groq("q", &[])); }
        c.advance(BREAKER.cooldown_ms);
        let n = t.calls.get();
        assert_eq!(block_on(s.groq("q", &[])), Outcome::Unavailable);
        assert_eq!(t.calls.get(), n + 1, "exactly one probe");
        assert_eq!(block_on(s.groq("q", &[])), Outcome::Unavailable);
        assert_eq!(t.calls.get(), n + 1, "and open again");
    }

    #[test]
    fn our_own_bad_request_does_not_open_the_breaker() {
        let (t, c, g) = (Script::new(vec![Err(FetchError::Status(400))]), FakeClock::at(0), RefCell::new(Guard::new()));
        let s = sanity(&t, &c, &g);
        for _ in 0..10 { assert_eq!(block_on(s.groq("q", &[])), Outcome::Unavailable); }
        assert_eq!(t.calls.get(), 10);
        assert_eq!(g.borrow().breaker_state(c.now_ms()), State::Closed);
    }

    #[test]
    fn rate_limiting_and_5xx_count() {
        for status in [429u16, 500, 502, 503] {
            let (t, c, g) = (Script::new(vec![Err(FetchError::Status(status))]), FakeClock::at(0), RefCell::new(Guard::new()));
            let s = sanity(&t, &c, &g);
            for _ in 0..5 { block_on(s.groq("q", &[])); }
            assert_eq!(g.borrow().breaker_state(0), State::Open, "{status}");
        }
    }

    #[test]
    fn a_garbled_body_is_a_failure_not_a_panic() {
        for body in ["", "not json", "[]", "{}", "{\"result\":", "null"] {
            let (t, c, g) = (Script::new(vec![Ok(body.to_string())]), FakeClock::at(0), RefCell::new(Guard::new()));
            assert_eq!(block_on(sanity(&t, &c, &g).groq("q", &[])), Outcome::Unavailable, "{body:?}");
        }
    }

    #[test]
    fn a_spent_budget_never_calls_out() {
        // The clock jumps past the budget between acquire and the call.
        let c = Rc::new(FakeClock::at(0));
        struct Jump(Rc<FakeClock>);
        impl Clock for Jump {
            fn now_ms(&self) -> u64 {
                let n = self.0.now_ms();
                self.0.advance(BUDGET_MS); // every read of the clock costs a full budget
                n
            }
        }
        let t = Script::new(vec![Script::ok("[1]")]);
        let g = RefCell::new(Guard::new());
        let jc = Jump(c);
        let s = Sanity { transport: &t, clock: &jc, guard: &g, origin: "o" };
        assert_eq!(block_on(s.groq("q", &[])), Outcome::Unavailable);
        assert_eq!(t.calls.get(), 0);
    }
}
