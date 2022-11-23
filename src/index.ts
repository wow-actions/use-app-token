import { isPost } from './state'
import { run, cleanup } from './action'

if (!isPost) {
  run()
} else {
  cleanup()
}
