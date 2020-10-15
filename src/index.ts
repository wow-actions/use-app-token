import { getInput } from '@actions/core'
import { State } from './state'
import { Action } from './action'

if (!State.isPost) {
  Action.run()
} else {
  if (getInput('clean_secret') === 'true') {
    Action.cleanup()
  }
}
