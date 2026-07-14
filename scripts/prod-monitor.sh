#!/usr/bin/env bash
# prod-monitor.sh — Run a synthetic production check against all key routes.
#
# Usage:
#   bash scripts/prod-monitor.sh                              # check staging
#   PROD_URL=https://shipping-savior.vercel.app bash scripts/prod-monitor.sh  # check prod
#
# Requires: curl, jq (optional, for pretty JSON output)
set -euo pipefail

URL_BASE="${PROD_URL:-https://shipping-savior.vercel.app}"
URL_BASE="${URL_BASE%/}"

echo "============================================"
echo "  Shipping Savior — Prod Route Monitor"
echo "  Target: $URL_BASE"
echo "  Time:   $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "============================================"

PUBLIC_ROUTES=(
  "/"
  "/pricing"
  "/calculators"
  "/routes"
  "/port-finder"
  "/carrier-comparison"
  "/industries/cold-chain"
  "/industries/automotive"
  "/knowledge-base"
  "/platform-architecture"
  "/tech-spec"
  "/six-sigma"
  "/phases"
  "/demo"
  "/monetization"
)

API_ROUTES=(
  "/api/health:200"
  "/api/mobile/auth/session:401"
  "/api/mobile/devices:401"
)

PASS=0
FAIL=0
FAILURES=""

check_route() {
  local path="$1"
  local expected="$2"
  local url="${URL_BASE}${path}"

  local start
  start=$(date +%s%N 2>/dev/null || echo 0)

  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -L "$url" 2>/dev/null || echo "000")

  local duration_ms
  if [[ "$start" != "0" ]]; then
    local now
    now=$(date +%s%N 2>/dev/null || echo 0)
    duration_ms=$(( (now - start) / 1000000 ))
  else
    duration_ms="?"
  fi

  if [[ "$status" == "$expected" ]]; then
    echo "  ✓ $path → $status (${duration_ms}ms)"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $path → $status (expected $expected, ${duration_ms}ms)"
    FAIL=$((FAIL + 1))
    FAILURES="${FAILURES}  ✗ $path → $status (expected $expected)\n"
  fi
}

echo ""
echo "── Public routes ──"
for route in "${PUBLIC_ROUTES[@]}"; do
  check_route "$route" 200
done

echo ""
echo "── API routes ──"
for route in "${API_ROUTES[@]}"; do
  IFS=':' read -r path expected <<< "$route"
  check_route "$path" "$expected"
done

echo ""
echo "── Summary ──"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
TOTAL=$((PASS + FAIL))
echo "  Total:  $TOTAL"

if [[ "$FAIL" -gt 0 ]]; then
  echo ""
  echo "── Failures ──"
  echo -e "$FAILURES"
  exit 1
fi

echo "  All routes healthy."
echo ""