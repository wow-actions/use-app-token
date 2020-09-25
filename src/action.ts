import * as core from '@actions/core'
import { Util } from './util'

export namespace Action {
  export async function run() {
    try {
      const token = await Util.getAppToken()
      core.info('Token generated!')
      const secretName = core.getInput('SECRET_NAME')
      if (secretName) {
        await Util.saveAppTokenToSecret(secretName, token)
        core.info(`Token save in secret "${secretName}"`)
      }
      core.setSecret(token)
      core.setOutput('token', token)
    } catch (e) {
      core.error(e)
      core.setFailed(e.message)
    }
  }

  export async function cleanup() {
    try {
      const secretName = core.getInput('SECRET_NAME')
      if (secretName) {
        await Util.removeAppTokenFromSecret(secretName)
        core.info(`Token in secret "${secretName}" was cleaned`)
      }
    } catch (e) {
      core.error(e)
      core.setFailed(e.message)
    }
  }
}
