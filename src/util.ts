import * as core from '@actions/core'
import * as github from '@actions/github'
import isBase64 from 'is-base64'
import sodium from 'libsodium-wrappers'
import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'

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

  const auth = createAppAuth({
    appId,
    privateKey,
  })

  // 1. Retrieve JSON Web Token (JWT) to authenticate as app
  const { token: jwt } = await auth({ type: 'app' })

  // 2. Get installationId of the app
  const octokit = github.getOctokit(jwt)
  const {
    data: { id: installationId },
  } = await octokit.rest.apps.getRepoInstallation({
    ...github.context.repo,
  })

  // 3. Retrieve installation access token
  const { token } = await auth({
    installationId,
    type: 'installation',
  })

  return token
}

async function createSecret(octokit: Octokit, value: string) {
  const { repo } = github.context
  const res = await octokit.request(
    'GET /repos/:owner/:repo/actions/secrets/public-key',
    repo,
  )

  const { key } = res.data

  await sodium.ready

  // Convert Secret & Base64 key to Uint8Array.
  const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
  const binsec = sodium.from_string(value)

  // Encrypt the secret using LibSodium
  const encryptedBytes = sodium.crypto_box_seal(binsec, binkey)

  return {
    key_id: res.data.key_id,
    // Base64 the encrypted secret
    encrypted_value: sodium.to_base64(
      encryptedBytes,
      sodium.base64_variants.ORIGINAL,
    ),
  }
}

async function createOrUpdateRepoSecret(
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

async function deleteSecret(token: string, name: string) {
  const octokit = new Octokit({ auth: token })
  await octokit.request(
    'DELETE /repos/:owner/:repo/actions/secrets/:secret_name',
    {
      ...github.context.repo,
      secret_name: name,
    },
  )
}

export async function saveTokenToSecret(secretName: string, token: string) {
  if (secretName) {
    return createOrUpdateRepoSecret(token, secretName, token)
  }
  return null
}

export async function removeTokenFromSecret(secretName: string) {
  if (secretName) {
    const token = await getAppToken()
    return deleteSecret(token, secretName)
  }
  return null
}
