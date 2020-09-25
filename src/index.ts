import { Action } from './action'

const isPost = !!process.env['STATE_isPost']

if (!isPost) {
  Action.run()
} else {
  Action.cleanup()
}
