import { config, createConfigStore, initSetting } from '../src'
import { observe as _observe } from 'mobx'
import { useEffect } from 'react'
import UIComponent, { UISettings } from '../src/UI'

const settings: UISettings = {
  a1: { defaultValue: 1, category: 'a系列', desc: 'asdfadf' },
  a2: config<'adf' | 'bbb'>({ defaultValue: 'adf', category: 'a系列' }),
  a3: { defaultValue: 'a' as 'a' | 'b', category: 'a系列' },
  b1: { defaultValue: false, category: 'b系列' },
  b2: {
    defaultValue: 11,
    category: 'b系列',
    type: 'group',
    group: [2, 1, 11, '33'],
  },
  un: { defaultValue: '111' },
}
const configStore = createConfigStore(settings)
window.configStore = configStore

export default function App() {
  // useEffect(() => {
  //   const {
  //     configStore,
  //     observe,
  //     closeSettingPanel,
  //     openSettingPanel,
  //   } = initSetting({
  //     settings: {
  //       a1: { defaultValue: 1, category: 'a系列', desc: 'asdfadf' },
  //       a2: config<'adf' | 'bbb'>({ defaultValue: 'adf', category: 'a系列' }),
  //       a3: { defaultValue: 'a' as 'a' | 'b', category: 'a系列' },
  //       b1: { defaultValue: 11, category: 'b系列' },
  //       b2: {
  //         defaultValue: 11,
  //         category: 'b系列',
  //         type: 'group',
  //         group: [2, 1, 11, '33'],
  //       },
  //       un: { defaultValue: '111' },
  //     },
  //   })

  //   window.configStore = configStore
  //   observe('a1', (change) => {
  //     console.log('change', change.newValue)
  //     return () => {}
  //   })
  //   console.log('configStore', configStore)

  //   openSettingPanel()
  //   return () => {
  //     closeSettingPanel()
  //   }
  // }, [])
  return <UIComponent settings={settings} configStore={configStore} />
}
