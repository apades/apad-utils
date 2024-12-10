import type { FC } from 'react'
import { wait } from '@pkgs/utils/src/utils'
import { makeAutoObservable, observe } from 'mobx'
import { observer } from 'mobx-react'
import ReactDOM from 'react-dom/client'
import { initSetting } from '../../src'
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
  mobx: {
    makeAutoObservable,
    observer,
    observe,
  },
})

window.configStore = configStore

const ObservePanel: FC = observer(() => {
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
      <div style={{ marginTop: 24 }}></div>
      <ObservePanel />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(<App /> as any)
