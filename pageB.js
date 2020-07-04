import vendor2 from 'vendor2'
import util2 from './util2'
import util3 from './util3'

export default () => {
  //懒加载
  import('./async1')
  import('./async2')
  console.log('pageB')
}
