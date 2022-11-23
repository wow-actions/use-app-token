import * as core from '@actions/core'
import * as util from './util'

export async function run() {
  try {
    const token = await util.getAppToken()
    const loginName = util.getAppLoginName()
    const tokenName = util.getAppTokenName()

    const saveToSecret = core.getBooleanInput('secret')
    if (saveToSecret) {
      await util.createSecret(token, loginName, token)
      await util.createSecret(token, tokenName, token)
      core.info(`Secrets "${loginName}" and "${tokenName}" was created`)
    }

    core.setSecret(token)

    core.setOutput('bot_name', token)
    core.setOutput('bot_token', token)

    core.exportVariable(loginName, token)
    core.exportVariable(tokenName, token)
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

export async function cleanup() {
  try {
    const clean = core.getBooleanInput('clean')
    const saveToSecret = core.getBooleanInput('secret')
    if (saveToSecret && clean) {
      const token = await util.getAppToken()
      const loginName = util.getAppLoginName()
      const tokenName = util.getAppTokenName()
      await util.deleteSecret(token, loginName)
      await util.deleteSecret(token, tokenName)
      core.info(`Secrets "${loginName}" and "${tokenName}" was removed`)
    }
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}
