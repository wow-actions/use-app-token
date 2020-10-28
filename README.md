# Use App Token

This GitHub Action can be used to impersonate a GitHub App when `secrets.GITHUB_TOKEN`'s limitations are too restrictive and a personal access token is not suitable.

[`secrets.GITHUB_TOKEN`](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) has limitations such as [not being able to triggering a new workflow from another workflow](https://github.community/t5/GitHub-Actions/Triggering-a-new-workflow-from-another-workflow/td-p/31676). A workaround is to use a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) from a [personal user/bot account](https://help.github.com/en/github/getting-started-with-github/types-of-github-accounts#personal-user-accounts). However, for organizations, GitHub Apps are [a more appropriate automation solution](https://developer.github.com/apps/differences-between-apps/#machine-vs-bot-accounts).

We can also use an app token to [custom an action's name and avatar](https://github.community/t/change-bots-name-avatar/18349).

![screenshot](https://github.com/bubkoo/use-app-token/blob/master/screenshots/screenshot.jpg?raw=true)

## Usage

Before staring, we should get our owned app's _"APP ID"_ and _"Private Key"_ in the app's setting page. For example, find the two values in my app's setting page [https://github.com/settings/apps/bubkoo-bot](https://github.com/settings/apps/bubkoo-bot).

Get your owned app's _"APP ID"_:

![get-app-id](https://github.com/bubkoo/use-app-token/blob/master/screenshots/get-app-id.jpg?raw=true)

Get or create a _"Private Key"_:

![get-private-key](https://github.com/bubkoo/use-app-token/blob/master/screenshots/get-private-key.jpg?raw=true)

**Do not have a Github App? Get a quick start with [probot](https://probot.github.io/).**

Then add _"APP ID"_ and _"Private Key"_ to the target [repo's secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets). For example, we can add two secrets named `APP_ID` and `PRIVATE_KEY` with corresponding value.

![secrets](https://github.com/bubkoo/use-app-token/blob/master/screenshots/secrets.jpg?raw=true)

Now we can config the action by three ways:

**Method 1**: Use action's output in the next steps.

```yml
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: bubkoo/use-app-token@v1
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
      - uses: bubkoo/use-app-token@v1
        id: generate_token
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.PRIVATE_KEY }}
          # save app's token to the environment variable named "bot_token"
          variable_name: bot_token

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
      - uses: bubkoo/use-app-token@v1
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

### Inputs

> Note: [Workflow command and parameter names are not case-sensitive](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#about-workflow-commands).

- `app_id`: The ID of the GitHub App. [Create an secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `'APP_ID'` to store your app ID, then used by `${{ secrets.APP_ID }}`
- `private_key`: The private key of the GitHub App (can be Base64 encoded). [Create an secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `'PRIVATE_KEY'` to store your app private key, then used by `${{ secrets.APP_ID }}`
- `variable_name`: The name of generated token in exported variable. Specify a varable name will set an environment variable with specfiied name and valued with generated token, and can be use in next step with `${{ env.variable_name }}`.
- `secret_name`: The secret name created on current repository. Specify a secret name will add an secret on current repository with specfiied name and valued with generated token and can be use in next step with `${{ secrets.xxx }}`.
- `clean_secret`: Shoule clean the secret or not when the job completed. Only used when `secret_name` specfiied. Default `false`.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
