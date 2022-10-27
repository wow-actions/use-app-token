import { getBooleanInput } from '@actions/core'
import { isPost } from './state'
import { run, cleanup } from './action'

if (!isPost) {
  run()
} else if (getBooleanInput('clean_secret')) {
  cleanup()
}
