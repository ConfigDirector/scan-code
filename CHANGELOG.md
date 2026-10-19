# Changelog

All notable changes to the ConfigDirector Code Scan action are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html). `@v1` follows the latest 1.x release.

## [Unreleased]

## [1.3.0] - 2026-10-19

### Fixed

- The action runs the CLI version you asked for even when the repository's `.npmrc` sets `min-release-age`. Before, the job failed in the step **Find the CLI version to run** until that version was old enough.

## [1.2.0] - 2026-10-19

### Changed

- `version` defaults to `latest`, the newest release of `@configdirector/cli`, which is published without `-beta` from 0.11.0. A workflow that sets `version: beta` stays on 0.10.0-beta.1, the last beta; remove the line to keep getting new releases.

### Fixed

- When the repository's `.npmrc` sets `min-release-age`, the action runs the newest CLI release that is old enough. With the `beta` default, the job failed in the step **Find the CLI version to run** until the newest beta was that old.

## [1.1.0] - 2026-10-19

### Added

- The log shows which version of `@configdirector/cli` the run used, as in `This run uses @configdirector/cli 0.10.0-beta.1.`, in the step **Find the CLI version to run**.

### Fixed

- The check and the upload run the same version of the CLI, even when a new version is published to the `version` input's dist-tag while the action runs.

## [1.0.0] - 2026-10-18

### Added

- The action runs `configdirector validate` on every run, which fails the job when the code reads a key no config has, the old key of a renamed config, a config as the wrong type, a config that is not served to that kind of SDK, or an enum value the config does not allow. On a push to the repository's default branch, it then runs `configdirector scan --upload`, so the dashboard shows where each config is read and which configs no code reads; it uploads even when `validate` found a problem.
- Inputs: `token` (required), `version` (default `beta`) for the `@configdirector/cli` version or dist-tag, `0.9.0-beta.1` or later, `working-directory` (default `.`) for the directory that holds `configdirector.json`, `upload` (default `auto`: on pushes to the default branch only; `true` on every run, `false` never), `context-lines` (default `2`, from 0 to 5) and `snippets` (default `true`; `false` uploads no code). An `upload` or `snippets` value other than those listed fails the job before anything runs.
