import { config, createConfigStore, initSetting } from '../src'
import { observe as _observe, observe } from 'mobx'
import { FC, useEffect } from 'react'
import UIComponent, { UISettings } from '../src/UI'
import { observer } from 'mobx-react'
import { wait } from '@pkgs/utils/src/utils'

const settings: UISettings = {
  a1: { defaultValue: 1, category: 'a系列', desc: 'asdfadf' },
  a2: config<'adf' | 'bbb'>({ defaultValue: 'adf', category: 'a系列' }),
  a3: { defaultValue: 'a' as 'a' | 'b', category: 'a系列' },
  b1: { defaultValue: false, category: 'b系列' },
  b2: {
    defaultValue: 11,
    category: 'b系列',
    // type: 'group',
    // group: [2, 1, 11, '33'],
  },
  un: { defaultValue: '111' },
}
window.settings = settings
const configStore = createConfigStore(settings)
window.configStore = configStore
observe(configStore, (change) => {
  console.log('change', change)
})

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
      <UIComponent
        settings={settings}
        configStore={configStore}
        changeConfigStoreWithSettingPanelChange
        autoSave
        autoSaveTriggerMs={500}
        savePosition="localStorage"
        saveInLocal
        onInitLoadConfig={async (config) => {
          await wait(2000)
          return { ...config, un: 'change 111' }
        }}
      />
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

export default App
