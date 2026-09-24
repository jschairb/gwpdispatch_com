#!/usr/bin/env bash
# Prepares a Claude Code cloud session for test-first work: dependencies, the
# Playwright browser when the repo has e2e specs, and a baseline unit-test run so a
# red test means the change, not the box. Runs from the SessionStart hook in
# .claude/settings.json. Safe to rerun.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  echo "cloud-setup: local session, nothing to do"
  exit 0
fi

has_dep() { node -e "const p=require('./package.json');process.exit({...p.dependencies,...p.devDependencies}['$1']?0:1)"; }

# Node: match .nvmrc when the repo pins one and nvm is on the image.
if [ -f .nvmrc ]; then
  want="$(tr -d 'v[:space:]' < .nvmrc)"
  have="$(node -v 2>/dev/null | tr -d 'v' || true)"
  if [ "$have" != "$want" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$HOME/.nvm/nvm.sh"
    nvm install "$want" >/dev/null
    nvm use "$want" >/dev/null
    # Later shells in the session inherit this PATH through the hook env file.
    if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
      echo "export PATH=\"$(dirname "$(nvm which "$want")"):\$PATH\"" >> "$CLAUDE_ENV_FILE"
    fi
    have="$want"
  fi
  if [ "${have%%.*}" != "${want%%.*}" ]; then
    echo "cloud-setup: warning, node $have does not match .nvmrc $want" >&2
  fi
fi

# Package manager: the packageManager field decides; npm otherwise.
if grep -q '"packageManager": *"pnpm@' package.json; then
  corepack enable >/dev/null 2>&1 || npm install -g pnpm >/dev/null
  run() { pnpm "$@"; }
  pnpm install --frozen-lockfile
else
  run() { npx "$@"; }
  # Skip when node_modules already matches the lockfile.
  if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
    npm ci --no-audit --no-fund
  fi
fi

# Playwright: one browser, matching the single chromium project in playwright.config.ts.
if has_dep @playwright/test; then
  if ! run playwright install --with-deps chromium; then
    echo "cloud-setup: chromium install failed; e2e specs will not run." >&2
    echo "cloud-setup: the browser CDN may be outside this environment's network allowlist." >&2
  fi
fi

# Baseline: unit tests must pass before new work starts. `vitest run` exits after
# one pass even where the package's test script starts watch mode.
run vitest run

echo "cloud-setup: ready"
