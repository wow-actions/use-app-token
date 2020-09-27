import { getInput } from '@actions/core'
import { State } from './state'
import { Action } from './action'

if (!State.isPost) {
  Action.run()
} else {
  if (getInput('CLEAN_SECRET') === 'true') {
    Action.cleanup()
  }
}
