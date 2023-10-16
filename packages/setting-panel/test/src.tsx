import { wait } from '@pkgs/utils/src/utils'
import * as mobx from 'mobx'
import { observer } from 'mobx-react'
import { FC } from 'react'
import ReactDOM from 'react-dom/client'
import { config, initSetting } from '../src'

const settings = {
  a1: { defaultValue: 1, category: 'a系列', desc: 'asdfadf' },
  a2: config<'a' | 'b'>({
    defaultValue: 'a',
    category: 'a系列',
    type: 'group',
    // TODO 支持复杂数据传入
    // group: { a: { value: 'a' }, b: 'b' },
    group: ['a', 'b'],
  }),
  a3: { defaultValue: 'a' as 'a' | 'b', category: 'a系列' },
  b1: { defaultValue: false, category: 'b系列' },
  b2: {
    defaultValue: 11,
    category: 'b系列',
  },
  b3: true,
  un: { defaultValue: '111' },
  s1: 99999,
  rel1: config({ defaultValue: false }),
  rel2: config({ defaultValue: '22', relateBy: 'rel1', relateByValue: true }),
}
window.settings = settings
// 打包的
const { configStore, openSettingPanel, temporarySetConfigStore } = initSetting({
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

temporarySetConfigStore('b1', true)
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

ReactDOM.createRoot(document.getElementById('app')).render(<App />)
