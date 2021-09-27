<h1 align="center">🔑 Use App Token</h1>

<p align="center">Run GitHub Actions as a GitHub App by using the app's authentication token<strong></strong></p>

<p align="center">
  <a href="/wow-actions/use-app-token/blob/master/LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/wow-actions/use-app-token?style=flat-square"></a>
  <a href="https://www.typescriptlang.org" rel="nofollow"><img alt="Language" src="https://img.shields.io/badge/language-TypeScript-blue.svg?style=flat-square"></a>
  <a href="https://github.com/wow-actions/use-app-token/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" ></a>
  <a href="https://github.com/marketplace/actions/use-app-token" rel="nofollow"><img alt="website" src="https://img.shields.io/static/v1?label=&labelColor=505050&message=Marketplace&color=0076D6&style=flat-square&logo=google-chrome&logoColor=0076D6" ></a>
  <a href="https://github.com/wow-actions/use-app-token/actions/workflows/release.yml"><img alt="build" src="https://img.shields.io/github/workflow/status/wow-actions/use-app-token/Release/master?logo=github&style=flat-square" ></a>
  <a href="https://lgtm.com/projects/g/wow-actions/use-app-token/context:javascript" rel="nofollow"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/wow-actions/use-app-token.svg?logo=lgtm&style=flat-square" ></a>
</p>

This GitHub Action can be used to impersonate a GitHub App when `secrets.GITHUB_TOKEN`'s limitations are too restrictive and a personal access token is not suitable.

[`secrets.GITHUB_TOKEN`](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) has limitations such as [not being able to triggering a new workflow from another workflow](https://github.community/t5/GitHub-Actions/Triggering-a-new-workflow-from-another-workflow/td-p/31676). A workaround is to use a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) from a [personal user/bot account](https://help.github.com/en/github/getting-started-with-github/types-of-github-accounts#personal-user-accounts). However, for organizations, GitHub Apps are [a more appropriate automation solution](https://developer.github.com/apps/differences-between-apps/#machine-vs-bot-accounts).

We can also use an app token to [custom an action's name and avatar](https://github.community/t/change-bots-name-avatar/18349).

![screenshot](https://github.com/wow-actions/use-app-token/blob/master/screenshots/screenshot.jpg?raw=true)

## 🚀 Usage

Before staring, we should get our owned app's _"APP ID"_ and _"Private Key"_ in the app's setting page. For example, find the two values in my app's setting page [https://github.com/settings/apps/wow-actions-bot](https://github.com/settings/apps/wow-actions-bot).

Get your owned app's _"APP ID"_:

![get-app-id](https://github.com/wow-actions/use-app-token/blob/master/screenshots/get-app-id.jpg?raw=true)

Get or create a _"Private Key"_:

![get-private-key](https://github.com/wow-actions/use-app-token/blob/master/screenshots/get-private-key.jpg?raw=true)

**Do not have a Github App? Get a quick start with [probot](https://probot.github.io/).**

Then add _"APP ID"_ and _"Private Key"_ to the target [repo's secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets). For example, we can add two secrets named `APP_ID` and `PRIVATE_KEY` with corresponding value.

![secrets](https://github.com/wow-actions/use-app-token/blob/master/screenshots/secrets.jpg?raw=true)

Now we can config the action by three ways:

**Method 1**: Use action's output in the next steps.

```yml
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: wow-actions/use-app-token@v1
        id: generate_token
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.PRIVATE_KEY }}

      # Use token in next steps
      - uses: 'any other action'
        with:
          # Use token in outpus of the 'generate_token' step
          GITHUB_TOKEN: ${{ steps.generate_token.outputs.token }}
```

**Method 2**: Set an environment variable and used in the next step.

```yml
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: wow-actions/use-app-token@v1
        id: generate_token
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.PRIVATE_KEY }}
          # save app's token to the environment variable named "bot_token"
          env_name: bot_token

      # Use token in next steps
      - uses: 'any other action'
        with:
          # Use token in the environment variable named "bot_token"
          GITHUB_TOKEN: ${{ env.bot_token }}
```

**Method 3**: Add or update an secret in the target repo schedulely.

```yml
name: Use App Token
on:
  schedule:
    # add or update secret every hour
    - cron: '0 */1 * * *'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: wow-actions/use-app-token@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.PRIVATE_KEY }}
          # The secret name
          secret_name: BOT_TOKEN
```

Then we can use the secret named `'BOT_TOKEN'` in the next steps.

```yml
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: 'any other action'
        with:
          GITHUB_TOKEN: ${{ secrets.BOT_TOKEN }}
```

### 🎛️ Inputs

Various inputs are defined to let you configure the action:

> Note: [Workflow command and parameter names are not case-sensitive](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#about-workflow-commands).

| Name | Description | Default |
| --- | --- | :-: |
| `app_id` | The ID of the GitHub App. [Create an secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `'APP_ID'` to store your app ID, then used by `${{ secrets.APP_ID }}` | N/A |
| `private_key` | The private key of the GitHub App (can be Base64 encoded). [Create an secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `'PRIVATE_KEY'` to store your app private key, then used by `${{ secrets.APP_ID }}` | N/A |
| `fallback` | The fallback token when app token generate failed |  |
| `env_name` | The name of generated token in exported environment variable. Specify a varable name will set an environment variable with specfiied name and valued with generated token, and can be use in next step with `${{ env.env_name }}` |  |
| `secret_name` | The name of the secret created on current repository. Specify a secret name will add an secret on current repository with specfiied name and valued with generated token and can be use in next step with `${{ secrets.xxx }}` |  |
| `clean_secret` | Shoule clean the secret or not when the job completed. Only used when `secret_name` specfiied | `false` |

## ⚖️ License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
