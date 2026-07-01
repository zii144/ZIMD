#!/usr/bin/env bash
#
# ZIMD — full local verification.
# Runs the frontend and backend checks on THIS machine and writes everything to
# verify-report.txt (in the repo root) so it can be reviewed afterwards.
#
# Usage:
#   ./verify.sh            # checks + debug compile (fast)
#   ./verify.sh --bundle   # also builds the full installer (slow)
#
# Run this on the `verify/integration` branch to exercise every feature
# (including the Rust file-watcher and the cargo tests) in one pass.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT" || exit 1

REPORT="$ROOT/verify-report.txt"
# Mirror all output to the report file as well as the console.
exec > >(tee "$REPORT") 2>&1

FAILED=()

run() {
  local name="$1"; shift
  echo
  echo "──────── $name ────────"
  local start=$SECONDS
  if "$@"; then
    echo "✓ PASS: $name ($((SECONDS - start))s)"
  else
    local code=$?
    echo "✗ FAIL: $name (exit $code)"
    FAILED+=("$name")
  fi
}

# --- Step wrappers (subshells so cd doesn't leak) ---
npm_install()  { npm install --no-audit --no-fund; }
fe_tests()     { npm test; }
fe_check()     { npm run check; }
fe_build()     { npm run build:web; }
rs_test()      { ( cd "$ROOT/src-tauri" && cargo test ); }
rs_build()     { ( cd "$ROOT/src-tauri" && cargo build ); }
app_bundle()   { npx tauri build; }

echo "=================================================="
echo " ZIMD verification — $(date)"
echo "=================================================="
echo "Repo:    $ROOT"
echo "Branch:  $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'n/a')"
echo "Commit:  $(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
echo
echo "Toolchain:"
echo "  node   $(node -v 2>/dev/null || echo 'MISSING')"
echo "  npm    $(npm -v 2>/dev/null || echo 'MISSING')"
echo "  rustc  $(rustc --version 2>/dev/null || echo 'MISSING')"
echo "  cargo  $(cargo --version 2>/dev/null || echo 'MISSING')"

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
if [ "$branch" != "verify/integration" ]; then
  echo
  echo "⚠  Note: you're on '$branch', not 'verify/integration'."
  echo "   Some features (file-watcher, cargo tests) may not be present here."
fi

# --- Frontend ---
run "npm install"        npm_install
run "unit tests (vitest)" fe_tests
run "type check (svelte-check)" fe_check
run "frontend build (vite)"     fe_build

# --- Backend (Rust) ---
if command -v cargo >/dev/null 2>&1; then
  run "backend tests (cargo test)" rs_test
  run "backend compile (cargo build)" rs_build
  if [ "${1:-}" = "--bundle" ]; then
    run "full app bundle (tauri build)" app_bundle
  fi
else
  echo
  echo "✗ cargo not found — install Rust with:"
  echo "    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  echo "    source \"\$HOME/.cargo/env\""
  FAILED+=("cargo missing")
fi

# --- Summary ---
echo
echo "=================================================="
if [ ${#FAILED[@]} -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED"
else
  echo "❌ FAILURES (${#FAILED[@]}):"
  for f in "${FAILED[@]}"; do echo "   - $f"; done
fi
echo "Report written to: $REPORT"
echo "=================================================="

[ ${#FAILED[@]} -eq 0 ]
