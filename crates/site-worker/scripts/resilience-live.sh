#!/usr/bin/env bash
# Exercise the resilience wiring in the real Workers runtime (workerd, via wrangler dev),
# against the fixture Sanity, which can be told to fail.
#
#   node crates/site-worker/fixtures/server.mjs &                       # :4399
#   (cd crates/site-worker && npx wrangler@4.163.0 dev --port 8788 --var SANITY_ORIGIN:http://127.0.0.1:4399) &
#   crates/site-worker/scripts/resilience-live.sh
#
# Takes about a minute (it waits out the breaker's 30 s cooldown).
set -u
W=${WORKER:-http://127.0.0.1:8788}
F=${FIXTURE:-http://127.0.0.1:4399}
NAV='Sec-Fetch-Mode: navigate'

req() { # path -> one line: status, source, cache-control, retry-after
  local out
  out=$(curl -s -o /dev/null -D - -H "$NAV" "$W$1" | tr -d '\r')
  printf '%-34s %s | source=%s | cache=%s | retry-after=%s\n' "$1" \
    "$(echo "$out" | head -1 | cut -d' ' -f2)" \
    "$(echo "$out" | grep -i '^x-blog-source' | cut -d' ' -f2)" \
    "$(echo "$out" | grep -i '^cache-control' | cut -d' ' -f2-)" \
    "$(echo "$out" | grep -i '^retry-after' | cut -d' ' -f2)"
}
UNSEEN=/adventures/never-seen-$$   # a slug this isolate has no remembered answer for
hits() { curl -s "$F/__stats"; }

echo "--- 1. Sanity healthy: fresh, and the answer is remembered"
curl -s "$F/__mode?m=ok" >/dev/null
req /adventures

echo "--- 2. Sanity returns 503: the remembered list is served stale (200), a page never seen is a 503"
curl -s "$F/__mode?m=down" >/dev/null
req /adventures
req $UNSEEN

echo "--- 3. keep failing: the breaker opens after 5 failures and Sanity stops being called"
before=$(hits)
for _ in 1 2 3 4 5 6 7 8 9 10; do req $UNSEEN >/dev/null; done
after=$(hits)
echo "fixture received $((after - before)) queries for 10 requests (without a breaker: 10)"
req $UNSEEN
req /adventures

echo "--- 4. Sanity recovers; after the 30 s cooldown one probe closes the circuit"
curl -s "$F/__mode?m=ok" >/dev/null
sleep 31
req $UNSEEN      # Sanity answers, and there is no such adventure: a fresh, real 404
req /adventures/fixture-english-only

echo "--- 5. Sanity stalls past the 8 s budget: the Worker gives up and answers (stale if it has one)"
curl -s "$F/__mode?m=slow" >/dev/null
start=$(date +%s)
req /adventures/fixture-zambezi
req /adventures/never-seen-slow-$$
echo "two stalled requests took $(( $(date +%s) - start )) s (budget 8 s each)"
curl -s "$F/__mode?m=ok" >/dev/null
