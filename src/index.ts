import { Action } from './action'

const isPost = !!process.env['STATE_isPost']

console.log(JSON.stringify(process.env, null, 2))

if (!isPost) {
  Action.run()
} else {
  Action.cleanup()
}
