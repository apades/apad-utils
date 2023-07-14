import ReactDOM from 'react-dom/client'
import UIComponent from '../src/UI'
import { config, initSetting } from '../src'
import { observe as _observe } from 'mobx'

ReactDOM.createRoot(document.getElementById('app')).render(<UIComponent />)

const { configStore, observe } = initSetting({
  settings: {
    a1: { defaultValue: 1 },
    a2: config<'adf' | 'bbb'>({ defaultValue: 'adf' }),
    a3: { defaultValue: 'a' as 'a' | 'b' },
  },
})

window.configStore = configStore
observe('a1', (change) => {
  console.log('change', change.newValue)
  return () => {}
})
console.log('configStore', configStore)
