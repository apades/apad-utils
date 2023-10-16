import { config, createConfigStore } from '../src'
import { FC, useState } from 'react'
import UIComponent from '../src/UI'
import { wait } from '@pkgs/utils/src/utils'
import { observer } from '../src/react'
import en from '../src/i18n/en.json'

const settings = {
  a1: { defaultValue: 1, category: 'a系列', desc: 'asdfadf' },
  a2: config<'a' | 'b'>({
    defaultValue: 'b',
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
    // type: 'group',
    // group: [2, 1, 11, '33'],
  },
  un: { defaultValue: '111' },
  noRec: config({ defaultValue: 'no rec', notRecommended: true }),
  noRel1: config({ defaultValue: false, notRecommended: true }),
  noRel2: config({
    defaultValue: '22',
    relateBy: 'noRel1',
    relateByValue: true,
    notRecommended: true,
  }),
  rel1: false,
  rel2: config({ defaultValue: '22', relateBy: 'rel1', relateByValue: true }),
  c1: true,
}
window.settings = settings
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
        isLoading={false}
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
