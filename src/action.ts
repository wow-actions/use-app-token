import * as core from '@actions/core'
import * as github from '@actions/github'
import { App } from '@octokit/app'
import isBase64 from 'is-base64'
import { Util } from './util'

export namespace Action {
  export async function start() {
    try {
      const id = Number(core.getInput('APP_ID', { required: true }))
      const privateKeyInput = core.getInput('PRIVATE_KEY', { required: true })
      const privateKey = isBase64(privateKeyInput)
        ? Buffer.from(privateKeyInput, 'base64').toString('utf8')
        : privateKeyInput
      const app = new App({ id, privateKey })
      const jwt = app.getSignedJsonWebToken()
      const octokit = github.getOctokit(jwt)
      const {
        data: { id: installationId },
      } = await octokit.apps.getRepoInstallation(github.context.repo)
      const token = await app.getInstallationAccessToken({
        installationId,
      })

      core.info(`Token: ${token}`)

      const secretName = core.getInput('SECRET_NAME')
      if (secretName) {
        await Util.createOrUpdateRepoSecret(octokit, secretName, token)
      }

      core.setSecret(token)
      core.setOutput('token', token)
      core.info('Token generated successfully!')
    } catch (e) {
      core.error(e)
      core.setFailed(e.message)
    }
  }
}
