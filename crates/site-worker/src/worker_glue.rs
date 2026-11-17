//! The Worker runtime adapter. Everything with a `worker::` type in it lives here, so the
//! rest of the crate runs, and is tested, on a laptop.

use std::{cell::RefCell, rc::Rc, time::Duration};

use futures_util::future::{Either, select};
use worker::{AbortController, Context, Date, Delay, Env, Fetch, Headers, Method, Request, RequestInit, Response, Result, event};

use crate::{
    handler::{Deps, Reply, respond, route},
    sanity::{Clock, FetchError, Guard, Sanity, Transport, default_origin},
    shell::Shell,
};

struct JsClock;
impl Clock for JsClock {
    fn now_ms(&self) -> u64 {
        Date::now().as_millis()
    }
}

/// `fetch` raced against a timer, with the request aborted when the timer wins.
struct WorkerTransport;
impl Transport for WorkerTransport {
    async fn get(&self, url: &str, timeout_ms: u64) -> std::result::Result<String, FetchError> {
        let headers = Headers::new();
        headers.set("Accept", "application/json").map_err(|_| FetchError::Network)?;
        let mut init = RequestInit::new();
        init.with_headers(headers);
        let request = Request::new_with_init(url, &init).map_err(|_| FetchError::Network)?;

        let controller = AbortController::default();
        let signal = controller.signal();
        let work = async {
            let mut response = Fetch::Request(request).send_with_signal(&signal).await.map_err(|_| FetchError::Network)?;
            let status = response.status_code();
            if !(200..300).contains(&status) {
                return Err(FetchError::Status(status));
            }
            response.text().await.map_err(|_| FetchError::Network)
        };
        let timer = Delay::from(Duration::from_millis(timeout_ms.max(1)));
        futures_util::pin_mut!(work, timer);
        match select(work, timer).await {
            Either::Left((result, _)) => result,
            Either::Right(_) => {
                controller.abort();
                Err(FetchError::Timeout)
            }
        }
    }
}

/// One breaker and one stale cache per isolate: the state `mzizi-resilience` keeps for us.
fn guard() -> &'static RefCell<Guard> {
    thread_local! {
        static GUARD: &'static RefCell<Guard> = Box::leak(Box::new(RefCell::new(Guard::new())));
    }
    GUARD.with(|g| *g)
}

thread_local! {
    static SHELL: RefCell<Option<Rc<Shell>>> = const { RefCell::new(None) };
}

/// The build's stylesheet, scripts and tokens, read once per isolate from the prerendered
/// 404 page. Not cached when it could not be read, so a transient failure heals.
async fn shell(env: &Env) -> Rc<Shell> {
    if let Some(s) = SHELL.with(|s| s.borrow().clone()) {
        return s;
    }
    match load_shell(env).await {
        Some(s) => {
            let s = Rc::new(s);
            SHELL.with(|c| *c.borrow_mut() = Some(s.clone()));
            s
        }
        None => Rc::new(Shell::bare()),
    }
}

async fn load_shell(env: &Env) -> Option<Shell> {
    let assets = env.assets("ASSETS").ok()?;
    let mut path = "/404".to_string();
    for _ in 0..3 {
        let request = Request::new(&format!("https://assets.invalid{path}"), Method::Get).ok()?;
        let mut response = assets.fetch_request(request).await.ok()?;
        if (300..400).contains(&response.status_code()) {
            // The asset layer redirects `/404.html` and friends; follow it by path only.
            let location = response.headers().get("Location").ok().flatten()?;
            path = location.strip_prefix("https://assets.invalid").unwrap_or(&location).to_string();
            if !path.starts_with('/') {
                return None;
            }
            continue;
        }
        return Shell::from_donor(&response.text().await.ok()?);
    }
    None
}

fn build(reply: Reply, head_only: bool) -> Result<Response> {
    let headers = Headers::new();
    for (k, v) in &reply.headers {
        headers.set(k, v)?;
    }
    let body = if head_only { String::new() } else { reply.body };
    Ok(Response::from_html(body)?.with_status(reply.status).with_headers(headers))
}

/// The last resort: a plain 503. The Worker answers; it does not throw.
fn plain_503() -> Result<Response> {
    let headers = Headers::new();
    headers.set("Cache-Control", "no-store")?;
    headers.set("Retry-After", "120")?;
    Ok(Response::error("Service temporarily unavailable", 503)?.with_headers(headers))
}

async fn answer(req: Request, env: &Env) -> Result<Response> {
    let method = req.method();
    if !matches!(method, Method::Get | Method::Head) {
        let headers = Headers::new();
        headers.set("Allow", "GET, HEAD")?;
        return Ok(Response::error("Method not allowed", 405)?.with_headers(headers));
    }
    let path = req.path();
    let route = route(&path);

    let origin = env.var("SANITY_ORIGIN").map(|v| v.to_string()).unwrap_or_else(|_| default_origin());
    let shell = shell(env).await;
    let (transport, clock) = (WorkerTransport, JsClock);
    let deps = Deps {
        sanity: Sanity { transport: &transport, clock: &clock, guard: guard(), origin: &origin },
        site: crate::site(),
        shell: &shell,
        year: crate::dates::year_of(clock.now_ms()),
    };

    match respond(&route, &deps).await {
        Some(reply) => build(reply, matches!(method, Method::Head)),
        // Not a blog route (a nested `/adventures/a/b`): the asset layer's 404 page.
        None => match env.assets("ASSETS") {
            Ok(assets) => assets.fetch_request(req).await,
            Err(_) => Ok(Response::error("Not found", 404)?),
        },
    }
}

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    match answer(req, &env).await {
        Ok(response) => Ok(response),
        Err(_) => plain_503(),
    }
}
