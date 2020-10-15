# Use App Token

This GitHub Action can be used to impersonate a GitHub App when `secrets.GITHUB_TOKEN`'s limitations are too restrictive and a personal access token is not suitable.

[`secrets.GITHUB_TOKEN`](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) has limitations such as [not being able to triggering a new workflow from another workflow](https://github.community/t5/GitHub-Actions/Triggering-a-new-workflow-from-another-workflow/td-p/31676). A workaround is to use a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) from a [personal user/bot account](https://help.github.com/en/github/getting-started-with-github/types-of-github-accounts#personal-user-accounts). However, for organizations, GitHub Apps are [a more appropriate automation solution](https://developer.github.com/apps/differences-between-apps/#machine-vs-bot-accounts).

We can also use an app token to [custom an action's name and avatar](https://github.community/t/change-bots-name-avatar/18349).

![all links](https://github.com/bubkoo/use-app-token/blob/master/screenshot.jpg?raw=true)

## Usage

Use action's output in other actions.

```yml
name: Needs More Info
on:
  pull_request:
    types: [opened]
  issues:
    types: [opened]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Generate token
        id: generate_token
        uses: bubkoo/use-app-token@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.PRIVATE_KEY }}
      - name: Needs More info # Use token in other actions
        uses: bubkoo/needs-more-info@v1
        with:
          # Use token in outpus of the 'generate_token' action
          GITHUB_TOKEN: ${{ steps.generate_token.outputs.token }}
          CONFIG_FILE: .github/workflows/config/needs-more-info.yml
```

Or set an secret in you repo:

```yml
name: App Token
on:
  schedule:
    - cron: '0 1 * * *'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: bubkoo/use-app-token@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.PRIVATE_KEY }}
          # The secret name
          secret_name: APP_TOKEN
```

Then we can use the secret named `'APP_TOKEN'` in other ancitons:

```yml
name: Needs More Info
on:
  pull_request:
    types: [opened]
  issues:
    types: [opened]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Needs More info
        uses: bubkoo/needs-more-info@v1
        with:
          GITHUB_TOKEN: ${{ secrets.APP_TOKEN }}
          CONFIG_FILE: .github/workflows/config/needs-more-info.yml
```

### Inputs

> Note: [Workflow command and parameter names are not case-sensitive](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#about-workflow-commands).

- `app_id`: The ID of the GitHub App. [Create an secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `'APP_ID'` to store your app ID, then used by `${{ secrets.APP_ID }}`
- `private_key`: The private key of the GitHub App (can be Base64 encoded). [Create an secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `'PRIVATE_KEY'` to store your app private key, then used by `${{ secrets.APP_ID }}`
- `variable_name`: The name of generated token in exported variable. Specify a varable name will set an environment variable with specfiied name and valued with generated token, and can be use in next step with `${ private_key }`.
- `secret_name`: The secret name created on current repository. Specify a secret name will add an secret on current repository with specfiied name and valued with generated token and can be use in next step with `${{ secrets.xxx }}`.
- `clean_secret`: Shoule clean the secret or not when the job completed. Only used when `secret_name` specfiied. Default `false`.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
