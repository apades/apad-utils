import { initSetting, config } from '../src'

const {
  configStore,
  observe,
  closeSettingPanel,
  openSettingPanel,
} = initSetting({
  settings: {
    a1: { defaultValue: 1, category: 'a系列', desc: 'asdfadf' },
    a2: config<'adf' | 'bbb'>({ defaultValue: 'adf', category: 'a系列' }),
    a3: { defaultValue: 'a' as 'a' | 'b', category: 'a系列' },
    b1: { defaultValue: 11, category: 'b系列' },
    b2: {
      defaultValue: 11,
      category: 'b系列',
      type: 'group',
      group: [2, 1, 11, '33'],
    },
    un: { defaultValue: '111' },
  },
})

window.configStore_simple = configStore
observe('a1', (change) => {
  console.log('change', change.newValue)
  return () => {}
})
