import { State } from './state'
import { Action } from './action'

if (!State.isPost()) {
  Action.run()
} else {
  Action.cleanup()
}
