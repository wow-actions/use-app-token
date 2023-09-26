import * as core from '@actions/core'
import * as util from './util'

export async function run() {
  try {
    const { token, slug } = await util.getAppInfo()
    const appSlugName = util.getAppSlugName()
    const appTokenName = util.getAppTokenName()

    const saveToSecret = core.getBooleanInput('secret')
    if (saveToSecret) {
      await util.createSecret(token, appSlugName, slug)
      await util.createSecret(token, appTokenName, token)
      core.info(`Secrets "${appSlugName}" and "${appTokenName}" was created`)
    }

    core.setSecret(token)

    core.setOutput('BOT_NAME', slug)
    core.setOutput('BOT_TOKEN', token)
    // save token in state to be used in cleanup
    core.saveState('token', token)

    core.exportVariable(appSlugName, slug)
    core.exportVariable(appTokenName, token)
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

export async function cleanup() {
  try {
    const clean = core.getBooleanInput('clean')
    const saveToSecret = core.getBooleanInput('secret')
    const token = core.getState('token');
    if (clean) {
      if (saveToSecret) {
        const { token } = await util.getAppInfo()
        const appSlugName = util.getAppSlugName()
        const appTokenName = util.getAppTokenName()
        await util.deleteSecret(token, appSlugName)
        await util.deleteSecret(token, appTokenName)
        core.info(`Secrets "${appSlugName}" and "${appTokenName}" were removed`)
      }
      await util.deleteToken(token);
      core.info("Token revoked");
    }
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}
