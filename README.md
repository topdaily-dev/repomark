<p align="center">
  <a href="https://www.npmjs.com/package/@topdaily-dev/repomark"><img src="https://img.shields.io/npm/v/@topdaily-dev/repomark.svg" alt="npm version"></a>
  <a href="https://github.com/topdaily-dev/repomark/actions/workflows/ci.yml"><img src="https://github.com/topdaily-dev/repomark/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node">
</p>

# repomark

<p align="center">
  <strong>Score README and OSS repo health from the terminal.</strong><br>
  Badges, license, docs, package.json metadata, and CI — one checklist score.
</p>

<p align="center">
  <a href="#quick-start"><strong>Quick start</strong></a> ·
  <a href="#what-it-checks"><strong>What it checks</strong></a> ·
  <a href="#pair-with-badgekit"><strong>badgekit</strong></a>
</p>

---

## Why repomark?

OSS repos quietly rot: missing license, no security policy, thin README, no badges. **repomark** gives you a 0–100 score and concrete next steps — no SaaS, no API key.

## Quick start

```bash
npx @topdaily-dev/repomark check .
npx @topdaily-dev/repomark check . --json
npx @topdaily-dev/repomark fix . --dry-run
```

Exit code is `1` when the score is below `--min` (default `70`) — useful in CI.

## What it checks

| Area | Notes |
|------|--------|
| README | Exists, `#` title, short description |
| Badges | shields.io / CI badge links |
| License | `LICENSE` file |
| Contributing | `CONTRIBUTING.md` or section |
| Security | `SECURITY.md` or section |
| package.json | name, description, license, repository, engines |
| CI | `.github/workflows` |
| Issue templates | `.github/ISSUE_TEMPLATE` |
| Topics | Reminder only (needs GitHub UI / API) |

## Pair with badgekit

Missing badges? Generate a paste-ready row:

```bash
npx @topdaily-dev/badgekit row ci npm license \
  --owner topdaily-dev \
  --repo repomark \
  --npm @topdaily-dev/repomark
```

## CLI

```bash
repomark check [dir] [--min N] [--json]
repomark fix [dir] --dry-run
```

`fix` in v0.1 only prints suggestions — it never writes files.

## Development

```bash
git clone https://github.com/topdaily-dev/repomark.git
cd repomark
npm test
node bin/repomark.mjs check .
```

## License

MIT — see [LICENSE](LICENSE).
