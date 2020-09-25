import { context, getOctokit } from '@actions/github'
import { getInput } from '@actions/core'
import { Octokit } from '@octokit/core'
import { App } from '@octokit/app'
import isBase64 from 'is-base64'
import sodium from 'tweetsodium'

export namespace Util {
  export async function getAppToken() {
    const id = Number(getInput('APP_ID', { required: true }))
    const privateKeyInput = getInput('PRIVATE_KEY', { required: true })
    const privateKey = isBase64(privateKeyInput)
      ? Buffer.from(privateKeyInput, 'base64').toString('utf8')
      : privateKeyInput
    const app = new App({ id, privateKey })
    const jwt = app.getSignedJsonWebToken()
    const octokit = getOctokit(jwt)
    const {
      data: { id: installationId },
    } = await octokit.apps.getRepoInstallation(context.repo)

    return app.getInstallationAccessToken({
      installationId,
    })
  }

  export async function saveAppTokenToSecret(
    secretName: string,
    token: string,
  ) {
    if (secretName) {
      return createOrUpdateRepoSecret(token, secretName, token)
    }
  }

  export async function removeAppTokenFromSecret(secretName: string) {
    if (secretName) {
      const token = await getAppToken()
      return Util.deleteSecret(token, secretName)
    }
  }

  export async function createSecret(octokit: Octokit, value: string) {
    const repo = context.repo
    const res = await octokit.request(
      'GET /repos/:owner/:repo/actions/secrets/public-key',
      repo,
    )

    const key = res.data.key

    // Convert the message and key to Uint8Array's
    const messageBytes = Buffer.from(value)
    const keyBytes = Buffer.from(key, 'base64')

    // Encrypt using LibSodium.
    const encryptedBytes = sodium.seal(messageBytes, keyBytes)

    return {
      key_id: res.data.key_id,
      // Base64 the encrypted secret
      encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
    }
  }

  export async function createOrUpdateRepoSecret(
    token: string,
    name: string,
    value: string,
  ) {
    const octokit = new Octokit({ auth: token })
    const secret = await createSecret(octokit, value)
    await octokit.request(
      'PUT /repos/:owner/:repo/actions/secrets/:secret_name',
      {
        ...context.repo,
        secret_name: name,
        data: secret,
      },
    )
  }

  export async function deleteSecret(token: string, name: string) {
    const octokit = new Octokit({ auth: token })
    await octokit.request(
      'DELETE /repos/:owner/:repo/actions/secrets/:secret_name',
      {
        ...context.repo,
        secret_name: name,
      },
    )
  }
}
