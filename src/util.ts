import { context } from '@actions/github'
import { Octokit } from '@octokit/core'
import sodium from 'tweetsodium'

export namespace Util {
  async function createSecret(octokit: Octokit, value: string) {
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
