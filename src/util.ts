import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/core'
import { createAppAuth } from '@octokit/auth-app'
// import isBase64 from 'is-base64'
import sodium from 'tweetsodium'

export namespace Util {
  export async function getAppToken() {
    // const fallback = core.getInput('fallback')
    // const required = fallback == null
    // const appId = Number(core.getInput('app_id', { required }))
    // const privateKeyInput = core.getInput('private_key', { required })
    // if (appId == null || privateKeyInput == null) {
    //   return Promise.resolve(fallback)
    // }

    // const privateKey = isBase64(privateKeyInput)
    //   ? Buffer.from(privateKeyInput, 'base64').toString('utf8')
    //   : privateKeyInput

    const appId = 138612
    const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAvRbj88GzmH7aX8EHwatUT+Kmfzz9Bbk6SKhPrYopt4NJkVZ2
P3AQok0G4e0czF9dprZ2/9smoi+K3TAEjySV/pgLi5ZYPijbIQwOelJBuOuqiFe8
LODzoIFTvlEAH5KWSh5mPVOUibpMBGtP0T/+7BZ+fMxVy4GkonE8KY0ajVnzu+RG
Hfp1IQoJemVQtLQOmSMzjctr/9eznKuLad2uqsY7GZGtYgx6wguiBCR/blEpBaN5
YTb59hQXI06bbewuE1rJRkbGOtZNvpE/TNHBpZAiahBn4Re3uM43THmElV+zlbnc
XGmpzvwIJ7V5MHEosLXgqA3s01ocj1RFL92iyQIDAQABAoIBAQCEq+3vFubLRZ40
9zxY/7xdfLqzpfgmLuudFTMqoTlaAGz6475+DkQtjHwawwKkxvjvwzDFnl+CBneZ
cFqSkOoJQ2c+XpO1sXbmvg3ed56TgA8cMOrgVkm6QWOfsjey72gxwxibSOx8olE5
/I15VTypK7M+HyTHcEQykd7TjKSnrdPI9enhzsZi5nZrHH61Xm4nRCRjCEbfQVxf
BdVVx0+/6HSBLjLNc7cMs5ncRJmvIFFpeVXliNOPYuvviFl0vUi3NXXAij2FQMKF
nE72wDOPSq3MoNVs2xVIjiBvnwqzuF7LjwTN3dz6WAi9R1rHGIxiwouVHpbI8giX
zR9MlbftAoGBAOEndg5oojCJwTxrAhsf5wwbG/kjsZ/wXxEdUUAz032hpnPpDyV/
Xq2ZPQllKQFy3TIw1jhb+rbgYG23SvXxbX7cE0fAhSVlHjfXx4CMkTcjCUrcPkUN
k9thhLDZnY8rhJgiYS+IVG4Jc2FEKrRRDFNdpM7mDHHGgwTrNmwbztHfAoGBANb+
k+/Qa5z2TUlVzvhxM/CvLKuHhSbCb4A9aasqTOa48W8M6KgwUTb/HZqTbBLlsMRX
wbG7DCTAyXvVpWjDd8okYKAudLom7WeTsosH2hcgFyUwG+QYjVGYaTEgQq27CCvk
IRhRA7KK7r5/dtZ/AX5lNIrJZIGd10R7F8pLFbBXAoGBAMGb8D2Vpho86qhskAQJ
G+HiEdzb36rbxLPv1OVza2J1ta+ocjjZXO3EfqLslSVEw4acTilqlp3ZNbJC0jfI
4lIbJo0ltJiiaii06T3WIi0aeKwh1X4FneYg5jw49O6fCkbUEWQRRCDXCZtTRbGG
nCW3ubecRIk1nYaGSGcQRnlbAoGAL1ZygFUlvLPGpKUOI0nZo98OON5oBPa+0j+z
aoqv0AVcs5TmDVJGL5PQkt5u52JHn5OrBFUpAVaphmiuOPkBATMtS1evP+WeVDYD
E/WwoXLhZcDIA1sckqC6WKS/ybzqua9LUi1UYRWSJ8OtCOGCFLB39y8MwDVe1qc7
v8D0j5UCgYBs6NVsfENpYD+edX32lrZMEIM4z3aHzdFxLle3txNXXF95b6sb6dL2
VK8dK1LsdA3p/IQ4J2ZpG0dtgJxdndO3V3Bmq6mi6D9Hblx1GRuRPwupnjlKZa1X
GKhyR4vQgqhf4MkpHC4xvA9vqBJCyRXFINkEc7n5LNcG18XwGLZoAg==
-----END RSA PRIVATE KEY-----`

    core.info(`privateKey: ${privateKey}`)

    const auth = createAppAuth({
      appId,
      privateKey,
    })

    // 1. Retrieve JSON Web Token (JWT) to authenticate as app
    const { token: jwt } = await auth({ type: 'app' })
    // const app = new App({ id, privateKey })
    // const jwt = app.getSignedJsonWebToken()

    core.info(`1. Retrieve JSON Web Token (JWT) to authenticate as app`)

    // 2. Get installationId of the app
    const octokit = github.getOctokit(jwt)

    console.log(github.context.repo) // eslint-disable-line

    const res = await octokit.rest.apps.getRepoInstallation({
      ...github.context.repo,
    })
    console.log(res) // eslint-disable-line
    const {
      data: { id: installationId },
    } = res
    core.info(`2. Get installationId of the app`)

    // 3. Retrieve installation access token
    const { token } = await auth({
      installationId,
      type: 'installation',
    })

    core.info(`3. Retrieve installation access token`)

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
