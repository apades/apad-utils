# @apad/setting-panel
开箱即用，且支持ts提示和type检查的设置面板。以signal概念设计(像mobx这种)，且自带管理面板UI，在页面上非常容易的设置管理

[en](./readme.md)

## 易于使用
[playground](https://playcode.io/1680353)

config.ts
```ts
import { initSetting, config } from '@apad/setting-panel'
// 一些脚手架在开发环境会处理css文件，内部的css加载会出问题
// 请根据情况加这段代码，或者单纯的`import '@apad/setting-panel/lib/index.css'`
if(process.env.NODE_ENV == 'development'){
  import('@apad/setting-panel/lib/index.css');
}

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
      type: {configStore.type}
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
import { observer } from 'mobx-react'

initSetting({
    mobx,
    mobxObserver: observer,
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
推荐换preact版本，比起完整的react版本会节省更多空间
```ts
// import { initSetting, config } from '@apad/setting-panel'
import { initSetting, config } from '@apad/setting-panel/preact'

// ...
```