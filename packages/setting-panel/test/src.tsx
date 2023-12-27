import { wait } from '@pkgs/utils/src/utils'
import * as mobx from 'mobx'
// import { observer } from 'mobx-react'
import { observer } from '../react'
import { FC } from 'react'
import ReactDOM from 'react-dom/client'
import { initSetting } from '../src'
import settings from './settings'

// 打包的
const { configStore, openSettingPanel } = initSetting({
  settings,
  // useShadowDom: false,
  onInitLoadConfig: async (config) => {
    await wait(2000)
    return { ...config, un: 'change 111' }
  },
  // mobx,
  // mobxObserver: observer,
})

// setTimeout(() => {
//   temporarySetConfigStore('b1', true)
// }, 300)
window.configStore = configStore

// configStore.b1 = true
const App: FC = () => {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        border: '1px solid #777',
        padding: 12,
        marginTop: 24,
      }}
    >
      <button onClick={() => openSettingPanel()}>open</button>
      <div style={{ marginTop: 24 }}></div>
      <ObservePanel />
    </div>
  )
}

const ObservePanel: FC = observer(() => {
  return (
    <div>
      <div>a1: {configStore.a1}</div>
    </div>
  )
})

ReactDOM.createRoot(document.getElementById('app')).render((<App />) as any)
