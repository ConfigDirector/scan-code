# ConfigDirector Code Scan

Checks the config keys your code reads against your [ConfigDirector](https://www.configdirector.com) project on every pull request, and on every push to your default branch uploads where each config is read, so the dashboard shows the code that reads a config and which configs no code reads.

The action runs the [ConfigDirector CLI](https://docs.configdirector.com/integrations/cli). `configdirector validate` runs every time and fails the job when the code reads a key no config has, the old key of a renamed config, a config as the wrong type, a config that is not served to that kind of SDK, or an enum value the config does not allow. `configdirector scan --upload` runs on pushes to the default branch.

## Usage

1. Link the repository to a project with `configdirector init --project <project-slug>`, as the [CLI docs](https://docs.configdirector.com/integrations/cli#link-the-repository-to-a-project) describe, and commit the `configdirector.json` it writes.
2. In the ConfigDirector dashboard, open **API tokens** and create a token used only by CI, with the [permissions](#token-permissions) below.
3. Add the token as a secret named `CONFIGDIRECTOR_TOKEN` under the repository's **Settings → Secrets and variables → Actions**.
4. Add this workflow:

```yaml
name: ConfigDirector

on:
  pull_request:
  push:
    branches: [main]

jobs:
  configdirector:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: ConfigDirector/scan-code@v1
        with:
          token: ${{ secrets.CONFIGDIRECTOR_TOKEN }}
```

## What runs when

| The workflow runs for                                           | `validate` | `scan --upload` |
| --------------------------------------------------------------- | ---------- | --------------- |
| A pull request                                                  | Yes        | No              |
| A push to the default branch                                    | Yes        | Yes             |
| Anything else, such as a push to another branch or a manual run | Yes        | No              |

That is what `upload: auto` does, the default. Uploading only from the default branch matters because each upload replaces everything the project held for the repository, so an upload from a feature branch would replace the default branch's code references with that branch's.

When `validate` finds a problem on the default branch, the upload still runs, so the dashboard shows the code as it is, and the job fails.

## Token permissions

| Step            | Permissions                                            |
| --------------- | ------------------------------------------------------ |
| `validate`      | Projects: Read, Configs: Read                          |
| `scan --upload` | Projects: Read, Configs: Read, Code references: Update |

With `upload: false`, the token needs only Projects: Read and Configs: Read, and it cannot change anything. A token belongs to the member who created it and stops working when that member leaves the organization.

## Inputs

| Input               | Default | What it does                                                                                                                                                                                                                                                                                   |
| ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token`             |         | Required. The API token, from a secret. It is sent only to the ConfigDirector API.                                                                                                                                                                                                             |
| `version`           | `beta`  | The version of `@configdirector/cli` to run, or an npm dist-tag, which `npx` downloads from npm. `beta` gets the newest beta; a version number from the [CLI changelog](https://github.com/ConfigDirector/cli/blob/main/CHANGELOG.md), `0.9.0-beta.1` or later, upgrades on your own schedule. |
| `working-directory` | `.`     | The directory that holds `configdirector.json`. The scan reads the files under it, so an upload sends nothing from outside it.                                                                                                                                                                 |
| `upload`            | `auto`  | When the scan is uploaded: `auto` on pushes to the default branch only, `true` on every run, `false` never. Without an upload, nothing from the repository leaves the runner.                                                                                                                  |
| `context-lines`     | `2`     | How many lines before and after each reference its uploaded snippet holds, from 0 to 5. `0` uploads the reference line alone.                                                                                                                                                                  |
| `snippets`          | `true`  | `false` uploads no code: each reference is uploaded with its file, line and key, but no snippet, and `context-lines` is not used.                                                                                                                                                              |

## What leaves your repository

`validate` sends nothing from the repository. It reads the project's configs from ConfigDirector and checks the code on the runner.

An upload sends the file and line of each reference and the config key it reads; for each SDK call, the SDK, the call's name, the key argument as written when it is not a plain string, and the in-code default value when it is a literal; whether each reference is in a test; the snippet of code around each reference, unless `snippets` is `false`; how many files the scan read; the repository's remote URL, without a user name and password; and the SHA of the commit that is checked out, without its changes, author or message. Nothing else from the repository is sent, as the [CLI docs](https://docs.configdirector.com/integrations/cli#what-leaves-your-repository) describe. An owner or an admin can also turn off **Store code snippets** in the **Code snippets** card of the project's **Project details** page, and then the project stores no code from any upload, whatever `snippets` says.

## Failures

The job fails when `validate` finds a problem, and when either command cannot run, for example because the token is missing or rejected, a permission is missing, or `configdirector.json` names a project that does not exist. The log says which.

GitHub does not pass secrets to a workflow run for a pull request from a fork, so on those the action has no token and fails with `No API token found`. To skip pull requests from forks, add this to the action's step:

```yaml
if: github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository
```

## Node.js

The action sets up Node.js 24 for the CLI, and the steps after it in the same job run with that Node.js too. If your job sets up another version for its own steps, give the action its own job, as in the workflow above, or put it after those steps.

## Versions

`@v1` follows the latest 1.x release of the action. To stay on one release, use its version, such as `@v1.0.0`, or its commit SHA. The version of the CLI the action runs is set separately, by the `version` input.

The [changelog](CHANGELOG.md) lists every release.

## License

[MIT](LICENSE)
