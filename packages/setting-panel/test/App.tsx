import { config, createConfigStore } from '../src'
import { FC, useState } from 'react'
import UIComponent from '../src/UI'
import { wait } from '@pkgs/utils/src/utils'
import { observer } from '../src/react'
import en from '../src/i18n/en.json'
import settings from './settings'

const configStore = createConfigStore(settings)
window.configStore = configStore
// observe(configStore, (change) => {
//   console.log('change', change)
// })

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
        autoSave
        autoSaveTriggerMs={500}
        saveInLocal
        onInitLoadConfig={async (config) => {
          console.log('config', config)
          await wait(2000)
          return { ...config, un: 'change 111' }
        }}
        observer={observer}
      />
      <ObservePanel />
    </div>
  )
}

const ObservePanel: FC = observer(() => {
  let [isA2, setA2] = useState(false)
  return (
    <div>
      <div>
        切换A2
        <input
          type="checkbox"
          onChange={(e) => setA2((e.target as HTMLInputElement).checked)}
        />
      </div>
      <div>
        {isA2 ? (
          <div>a2: {configStore.a2}</div>
        ) : (
          <div>a1: {configStore.a1}</div>
        )}
      </div>
    </div>
  )
})

export default App
