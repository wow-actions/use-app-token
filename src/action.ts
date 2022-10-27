import * as core from '@actions/core'
import * as util from './util'

export async function run() {
  try {
    const token = await util.getAppToken()
    core.info('Token generated!')

    const secretName = core.getInput('secret_name')
    if (secretName) {
      await util.saveTokenToSecret(secretName, token)
      core.info(`Save token in secret "${secretName}"`)
    }

    core.setSecret(token)
    core.setOutput('token', token)

    const envName = core.getInput('env_name') || core.getInput('variable_name')
    if (envName) {
      core.exportVariable(envName, token)
    }
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

export async function cleanup() {
  try {
    const secretName = core.getInput('secret_name')
    if (secretName) {
      await util.removeTokenFromSecret(secretName)
      core.info(`Token in secret "${secretName}" was cleaned`)
    }
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}
