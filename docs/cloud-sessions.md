# Cloud sessions

Claude Code cloud sessions start in a fresh container with the repository cloned and nothing
installed. A SessionStart hook in `.claude/settings.json` runs `bin/cloud-setup.sh` when a new
session starts, so the first test run in a session works without manual setup.

## What the script does

1. Exits with no changes unless `CLAUDE_CODE_REMOTE` is `true`. Claude Code sets that variable in
   cloud sessions only, so local sessions skip the script.
2. Switches Node to the version in `.nvmrc` when the repository pins one and the container has
   nvm. With no `.nvmrc` the session uses the container's Node; production builds on Node 22
   per `nixpacks.toml`.
3. Runs `npm ci` when `node_modules` is missing or older than `package-lock.json`. The script
   uses npm to match `nixpacks.toml`; `bun.lock` plays no part.
4. Skips the Playwright step, since the repository has no browser specs.
5. Runs `vitest run` as a baseline, so a failing test later in the session points at the change
   under test.

The hook timeout is 600 seconds, which covers a cold `npm ci`.

## Cloud environment

The repository expects an environment with the Trusted network level and no environment
variables, API credentials, or setup script. Dependency installs happen in the repository
script, so one environment serves every repository that follows this pattern. The build reads
`GA4_MEASUREMENT_ID` in production only, so cloud sessions need no value for it.

## Failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hook exits non-zero during `npm ci` | `package-lock.json` is out of step with `package.json` | Run `npm install` locally and commit the lockfile. |
| Hook exits non-zero after the install | The baseline `vitest run` failed | The branch has a failing test. Fix it before starting new work. |

## Running it locally

`CLAUDE_CODE_REMOTE=true ./bin/cloud-setup.sh` runs the full cloud path on a workstation, which
is the quickest way to check a change to the script.
