#!/usr/bin/env bash
# Quick load smoke test for shipping-savior (AI-8783).
#
# Hits the homepage 100x at concurrency 10, then /pricing 50x at concurrency
# 5. Prints p50/p95/p99 latency + non-2xx error count.
#
# DOES NOT run in CI by default — it expects a deployed URL. Run manually:
#   npm run load:smoke
#   PLAYWRIGHT_BASE_URL=https://shipping-savior.vercel.app npm run load:smoke
#
# Requires: apache2-utils (provides `ab`). On Debian/Ubuntu:
#   sudo apt-get install -y apache2-utils
set -euo pipefail

URL_BASE="${PLAYWRIGHT_BASE_URL:-https://shipping-savior.vercel.app}"
URL_BASE="${URL_BASE%/}"

if ! command -v ab >/dev/null 2>&1; then
  echo "ERROR: apache2-utils (ab) not installed." >&2
  echo "  sudo apt-get install -y apache2-utils" >&2
  exit 1
fi

run_load() {
  local label="$1"
  local path="$2"
  local n="$3"
  local c="$4"
  echo "============================================================"
  echo "  $label"
  echo "  URL: $URL_BASE$path"
  echo "  Requests: $n  Concurrency: $c"
  echo "============================================================"
  # -k = keep-alive; quieter output via -q. Capture full report and grep
  # for the percentile + error lines that matter.
  local out
  out=$(ab -k -q -n "$n" -c "$c" "$URL_BASE$path" 2>&1) || true
  echo "$out" | grep -E '^(Time per request|Failed requests|Non-2xx responses|Requests per second|Percentage of the requests)' || true
  echo "$out" | awk '
    /Percentage of the requests served within a certain time/ { keep=1; next }
    keep && /^ +[0-9]+%/ { print "  " $0 }
  '
  echo
}

echo
echo "Shipping Savior — load smoke test"
echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo

run_load "Homepage" "/" 100 10
run_load "Pricing" "/pricing" 50 5

echo "Done."
