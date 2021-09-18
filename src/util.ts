import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
import isBase64 from 'is-base64'
import sodium from 'tweetsodium'

export namespace Util {
  export async function getAppToken() {
    const fallback = core.getInput('fallback')
    const required = fallback == null
    const appId = Number(core.getInput('app_id', { required }))
    const privateKeyInput = core.getInput('private_key', { required })
    if (appId == null || privateKeyInput == null) {
      return Promise.resolve(fallback)
    }

    const privateKey = isBase64(privateKeyInput)
      ? Buffer.from(privateKeyInput, 'base64').toString('utf8')
      : privateKeyInput

    core.info(`privateKey: ${privateKey}`)

    const auth = createAppAuth({
      appId,
      privateKey,
    })

    // 1. Retrieve JSON Web Token (JWT) to authenticate as app
    const { token: jwt } = await auth({ type: 'app' })
    // const app = new App({ id, privateKey })
    // const jwt = app.getSignedJsonWebToken()

    core.info(`jwt: ${jwt}`)

    // 2. Get installationId of the app
    const octokit = github.getOctokit(jwt)
    const {
      data: { id: installationId },
    } = await octokit.rest.apps.getRepoInstallation(github.context.repo)

    core.info(`installationId: ${installationId}`)

    // 3. Retrieve installation access token
    const { token } = await auth({
      installationId,
      type: 'installation',
    })

    return token
  }

  export async function createSecret(octokit: Octokit, value: string) {
    const { repo } = github.context
    const res = await octokit.request(
      'GET /repos/:owner/:repo/actions/secrets/public-key',
      repo,
    )

    const { key } = res.data

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
        ...github.context.repo,
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
        ...github.context.repo,
        secret_name: name,
      },
    )
  }

  export async function saveAppTokenToSecret(
    secretName: string,
    token: string,
  ) {
    if (secretName) {
      return createOrUpdateRepoSecret(token, secretName, token)
    }
    return null
  }

  export async function removeAppTokenFromSecret(secretName: string) {
    if (secretName) {
      const token = await getAppToken()
      return Util.deleteSecret(token, secretName)
    }
    return null
  }
}
