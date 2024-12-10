# @apad/setting-panel
开箱即用，且支持ts提示和type检查的设置面板。以signal概念设计(像mobx这种)，且自带管理面板UI，在页面上非常容易的设置管理

[en](./readme.md)

## 易于使用
[playground](https://playcode.io/1680353)

config.ts
```ts
import { config, initSetting } from '@apad/setting-panel'
import { mobx } from '@apad/setting-panel/react'

type FontSizeType = 'small' | 'middle' | 'big'

export const { configStore, openSettingPanel } = initSetting({
  settings: {
    bg: '#6cf',
    isDark: false,
    // 支持ts type检查
    type: 'style-a' as 'style-a' | 'style-b',
    // 数组
    arr: ['a', 'b', 'c'],
    // 复杂配置，可以配置描述，key说明
    lineHeight: {
      label: '行高',
      desc: '设置字体行高',
      defaultValue: 1,
    },
    // 支持选择器
    fontSize: config<FontSizeType>({
      type: 'group',
      group: [
        'middle',
        'small',
        // 复杂配置
        {
          value: 'big',
          label: '大!`',
          desc: '大大大',
        },
      ],
      defaultValue: 'middle',
    }),
  },
  mobx,
})
```
App.tsx
```tsx
import { configStore, openSettingPanel } from './config'
// 在configStore更新时，组件自动更新
import { observer } from '@apad/setting-panel/react'

export default observer(() => {
  return (
    <div
      style={{ background: configStore.bg }}
      onClick={() => openSettingPanel()}
    >
      type:
      {' '}
      {configStore.type}
    </div>
  )
})
```

## 更多
### 如果你在用mobx
好！你可以把我的残缺版mini-mobx给换掉了🤣

config.ts
```ts
// ...
import * as mobx from 'mobx'

initSetting({
  mobx,
  // ...
})
```
App.tsx
```tsx
// 用mobx-react
// import { observer } from '@apad/setting-panel/react'
import { observer } from 'mobx-react'

export default observer(() => {
  // ...
})
```
### 如果你没在用react
> [!WARNING]
> 还不支持，请用^0.2版本

推荐换preact版本，比起完整的react版本会节省更多空间
```ts
// import { initSetting, config } from '@apad/setting-panel'
import { config, initSetting } from '@apad/setting-panel/preact'

// ...
```
