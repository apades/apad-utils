import type { FC } from 'react'
import { wait } from '@pkgs/utils/src/utils'
import ReactDOM from 'react-dom/client'
import { initSetting } from '../../src'
import mobx from '../../src/react'
import settings from '../settings'

// 打包的
const { configStore, openSettingPanel } = initSetting({
  settings,
  useShadowDom: false,
  autoSave: true,
  changeConfigStoreWithSettingPanelChange: true,
  autoSaveTriggerMs: 500,
  onInitLoadConfig: async (config) => {
    await wait(2000)
    return { ...config, un: 'change 111' }
  },
  mobx,
})

window.configStore = configStore

const ObservePanel: FC = mobx.observer(() => {
  return (
    <div>
      <div>
        a1:
        {configStore.a1}
      </div>
    </div>
  )
})

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
      <button onClick={() => openSettingPanel({ category: 'c系列' })}>c系列</button>
      <div style={{ marginTop: 24 }}></div>
      <ObservePanel />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(<App /> as any)
