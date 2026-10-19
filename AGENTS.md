# ConfigDirector Code Scan

## Instruction scope

Read `../AGENTS.md` if it exists and has not already been loaded. These repository instructions take precedence over parent instructions where they differ.

Also follow the Workflow Rules, Code Design and Writing sections of `../config-director/AGENTS.md`; this repository keeps no copy of them.

`ConfigDirector/scan-code`, the GitHub Action listed on the Marketplace as **ConfigDirector Code Scan**: a composite action, `action.yml`, that runs `@configdirector/cli` with `npx`. The product definition is `product-documents/cli-definition.md` in the config-director repository, sections 3 and 10; the CLI's own repository is `../cli`.

## Commands

```bash
actionlint                                                                          # the workflows, and the action's inputs where a workflow uses it
yq '.runs.steps[] | select(has("run")) | .run' action.yml | shellcheck --shell=bash -  # the action's scripts
```

actionlint reads `action.yml` only through the workflows that use it with `uses: ./`, so the scripts inside the action need the shellcheck line. Install the three with `brew install actionlint shellcheck yq`; GitHub's Ubuntu runners include `yq` and `shellcheck`.

## Conventions

- Inputs and contexts reach a script through the step's `env`, never through `${{ }}` inside `run`, so a value is never read as shell code.
- The `upload-decision` step checks `upload` and `snippets` and decides whether the run uploads; later steps read its outputs and never re-read those inputs.
- Each `npx` call names the package as `@configdirector/cli@$CLI_VERSION`, from the `version` input.

## Tests

CI runs actionlint and shellcheck, then runs the action with `uses: ./` against the dev API, `https://api.configdirector-dev.com`, on the fixtures in `test/fixtures/`. They link the project `scan-code-ci` in the dev test organization, which holds the boolean config `scan-code-check`, served to server SDKs: `known-key` reads it and must pass, `unknown-key` reads a key no config has and must fail. The job needs the `CONFIGDIRECTOR_DEV_TOKEN` secret, a token with Projects: Read and Configs: Read, and is skipped with a warning without it, so pull requests from forks, which GitHub runs without secrets, stay green. CI never uploads; the upload is checked by hand in a throwaway repository.

## Releasing

- Every user-visible change gets an entry in `CHANGELOG.md` under `## [Unreleased]`, in Keep a Changelog sections (Added, Changed, Fixed), written from the user's side.
- To release, move the Unreleased entries under `## [<version>] - <date>`, commit, and run the `Release` workflow with the version, such as `v1.1.0`. It creates the GitHub release with that section as its notes and moves the major tag, such as `v1`, to the same commit. A change that breaks an input or what a run does gets a new major version.
- Publishing on the Marketplace is a human step: edit the release on GitHub and tick **Publish this Action to the GitHub Marketplace**, on every release so the listing shows it. The first time, the organization owner accepts the Marketplace Developer Agreement and chooses a category.
