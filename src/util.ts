import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/core'
import sodium from 'tweetsodium'

export namespace Util {
  export function getOctokit() {
    const token = core.getInput('GITHUB_TOKEN', { required: true })
    return github.getOctokit(token)
  }

  async function createSecret(octokit: Octokit, value: string) {
    const repo = github.context.repo
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
    try {
      const octokit = new Octokit({ auth: token })
      const secret = await createSecret(octokit, value)
      core.info(`created secret: ${JSON.stringify(secret, null, 2)}`)

      await octokit.request(
        'PUT /repos/:owner/:repo/actions/secrets/:secret_name',
        {
          ...github.context.repo,
          secret_name: name,
          data: secret,
        },
      )
    } catch (e) {
      core.error(e)
      core.error(JSON.stringify(e, null, 2))
      core.setFailed(e.message)
    }
  }
}
