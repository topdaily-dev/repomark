# Changelog

## [Unreleased]

## [0.2.0] - 2026-08-15

### Added

- `repomark fix` writes missing LICENSE, SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, Dependabot config, `.nvmrc`, and a starter CI workflow
- Checks for code of conduct, Dependabot, and Node version alignment (`.nvmrc` vs `engines.node`)
- Fixture repos under `test/fixtures/` for integration-style tests
- Documented `topdaily-dev/repomark-action` for CI

### Changed

- `repomark fix --dry-run` previews writes; omit the flag to apply safe templates

## [0.1.1] - 2026-08-11

### Fixed

- Ensure package is publicly visible on the npm registry

## [0.1.0] - 2026-08-11

### Added

- `repomark check` with weighted 0–100 score
- Checks for README, badges, license, contributing, security, package.json, CI, issue templates, topics reminder
- `repomark fix --dry-run` suggestion list
- `--json` and `--min` flags
- CI and npm publish workflows
