import * as core from '@actions/core'
import { Util } from './util'

export namespace Action {
  export async function run() {
    try {
      const token = await Util.getAppToken()
      await Util.saveAppTokenToSecret(token)
      core.setSecret(token)
      core.setOutput('token', token)
      core.info('Token generated successfully!')
    } catch (e) {
      core.error(e)
      core.setFailed(e.message)
    }
  }

  export async function cleanup() {
    try {
      await Util.removeAppTokenFromSecret()
    } catch (e) {
      core.error(e)
      core.setFailed(e.message)
    }
  }
}
