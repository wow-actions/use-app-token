import * as core from '@actions/core'
import * as github from '@actions/github'
import { App } from '@octokit/app'
import isBase64 from 'is-base64'
import sodium from 'tweetsodium'

async function run() {
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

    await createOrUpdateTokenInSecret(octokit, token)
    core.setSecret(token)
    core.setOutput('token', token)
    core.info('Token generated successfully!')
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

async function encryptSecret(
  octokit: ReturnType<typeof github.getOctokit>,
  value: string,
) {
  // Get publick key
  const res = await octokit.actions.getRepoPublicKey({ ...github.context.repo })
  const key = res.data.key

  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(value)
  const publicKey = Buffer.from(key, 'base64')

  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, publicKey)

  // Base64 the encrypted secret
  return Buffer.from(encryptedBytes).toString('base64')
}

async function createOrUpdateTokenInSecret(
  octokit: ReturnType<typeof github.getOctokit>,
  token: string,
) {
  try {
    const name = core.getInput('SECRET_NAME')
    if (name) {
      const encryptedToken = await encryptSecret(octokit, token)
      core.info(`Encrypted Token: ${encryptedToken}`)
      return octokit.actions.createOrUpdateRepoSecret({
        ...github.context.repo,
        secret_name: name,
        encrypted_value: encryptedToken,
      })
    }
  } catch (error) {
    core.error(error)
    core.setFailed(error)
  }
}

void run()
