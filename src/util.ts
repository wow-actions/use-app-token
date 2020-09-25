import * as core from '@actions/core'
import * as github from '@actions/github'
import sodium from 'tweetsodium'

export namespace Util {
  export function getOctokit() {
    const token = core.getInput('GITHUB_TOKEN', { required: true })
    return github.getOctokit(token)
  }

  export async function createSecret(
    octokit: ReturnType<typeof getOctokit>,
    value: string,
  ) {
    const repo = github.context.repo

    core.info(`Repo: ${JSON.stringify(repo, null, 2)}`)

    const oct = getOctokit()
    const rr = await oct.actions.getRepoPublicKey({
      ...github.context.repo,
    })

    core.info(`RR: ${JSON.stringify(rr, null, 2)}`)

    // Get publick key
    const ret = await octokit.request(
      'GET /:base/:repo/actions/secrets/public-key',
      {
        base: repo.owner,
        repo: repo.repo,
      },
    )

    core.info(`Ret: ${JSON.stringify(ret, null, 2)}`)

    const res = await octokit.actions.getRepoPublicKey({
      ...github.context.repo,
    })
    const key = res.data.key

    core.info(`Key: ${JSON.stringify(res.data, null, 2)}`)

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
    octokit: ReturnType<typeof github.getOctokit>,
    name: string,
    value: string,
  ) {
    try {
      const secret = await createSecret(octokit, value)
      core.info(`created secret: ${JSON.stringify(secret, null, 2)}`)

      await octokit.actions.createOrUpdateRepoSecret({
        ...github.context.repo,
        ...secret,
        secret_name: name,
      })
    } catch (e) {
      core.error(e)
      core.error(JSON.stringify(e, null, 2))
      core.setFailed(e.message)
    }
  }
}
