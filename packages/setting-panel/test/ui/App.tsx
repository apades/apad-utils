import type { FC } from 'react'
import { wait } from '@pkgs/utils/src/utils'
import { useState } from 'react'
import { config, createConfigStore } from '../../src'
import en from '../../src/i18n/en.json'
import mobx, { observer } from '../../src/react'
import UIComponent from '../../src/UI'
import settings from '../settings'

const configStore = createConfigStore(settings, mobx)
window.configStore = configStore
// observe(configStore, (change) => {
//   console.log('change', change)
// })

const ObservePanel: FC = observer(() => {
  const [isA2, setA2] = useState(false)
  return (
    <div>
      <div>
        切换A2
        <input
          type="checkbox"
          onChange={e => setA2((e.target as HTMLInputElement).checked)}
        />
      </div>
      <div>
        {isA2
          ? (
              <div>
                a2:
                {configStore.a2}
              </div>
            )
          : (
              <div>
                a1:
                {configStore.a1}
              </div>
            )}
      </div>
    </div>
  )
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
        i18n={en}
        settings={settings}
        configStore={configStore}
        changeConfigStoreWithSettingPanelChange
        autoSave
        autoSaveTriggerMs={500}
        savePosition="localStorage"
        saveInLocal
        onInitLoadConfig={async (config) => {
          console.log('config', config)
          await wait(2000)
          return { ...config, un: 'change 111' }
        }}
        config={{ isLoading: false }}
        mobx={mobx}
        onClose={() => {}}
      />
      <ObservePanel />
    </div>
  )
}

export default App
