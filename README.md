# Use App Token

This GitHub Action can be used to impersonate a GitHub App when `secrets.GITHUB_TOKEN`'s limitations are too restrictive and a personal access token is not suitable.

[`secrets.GITHUB_TOKEN`](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) has limitations such as [not being able to triggering a new workflow from another workflow](https://github.community/t5/GitHub-Actions/Triggering-a-new-workflow-from-another-workflow/td-p/31676). A workaround is to use a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) from a [personal user/bot account](https://help.github.com/en/github/getting-started-with-github/types-of-github-accounts#personal-user-accounts). However, for organizations, GitHub Apps are [a more appropriate automation solution](https://developer.github.com/apps/differences-between-apps/#machine-vs-bot-accounts).

## Example Workflow

```yml
jobs:
  job:
    runs-on: ubuntu-latest
    steps:
      - name: Generate token
        id: generate_token
        uses: bubkoo/use-app-token@v1
        with:
          APP_ID: ${{ secrets.APP_ID }}
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
      - name: Needs More info # Use token in other actions
        uses: bubkoo/needs-more-info@v1
        with:
          # Use token in outpus of the 'generate_token' action
          GITHUB_TOKEN: ${{ steps.generate_token.outputs.token }}
          CONFIG_FILE: .github/workflows/config/needs-more-info.yml
```

### Options

- `APP_ID`: The ID of the GitHub App.
- `PRIVATE_KEY`: The private key of the GitHub App (can be Base64 encoded).
- `VARIABLE_NAME`: The name of generated token in exported variable. Specify a varable name will set an environment variable with specfiied name and valued with generated token, and can be use in next step with `${ VARIABLE_NAME }`.
- `SECRET_NAME`: The secret name created on current repository. Specify a secret name will add an secret on current repository with specfiied name and valued with generated token and can be use in next step with `${{ secrets.SECRET_NAME }}`.
- `CLEAN_SECRET`: Shoule clean the secret or not when the job completed. Only used when `SECRET_NAME` specfiied. Default `false`.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
