# @apad/setting-panel
out-of-the-box feature and ts hint support. design with signal pattern(like mobx), provide user interface and easy manage settings.

[中文](./readme-zh.md)

## easy to use
[playground](https://playcode.io/1680353)

config.ts
```ts
import { config, initSetting } from '@apad/setting-panel'

type FontSizeType = 'small' | 'middle' | 'big'

export const { configStore, openSettingPanel } = initSetting({
  settings: {
    bg: '#6cf',
    isDark: false,
    // support ts type check
    type: 'style-a' as 'style-a' | 'style-b',
    // arr type
    arr: ['a', 'b', 'c'],
    // complex config. add description, label
    lineHeight: {
      label: 'line height',
      desc: 'set text line height',
      defaultValue: 1,
    },
    // group select support
    fontSize: config<FontSizeType>({
      type: 'group',
      group: [
        'middle',
        'small',
        // complex config
        {
          value: 'big',
          label: 'BIG FONT!',
          desc: 'BIG BIG BIG',
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
// make component auto update when configStore change
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

## and more
### if you are using mobx
very good! You can replace my incomplete version mini-mobx to real mobx🤣

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
// use mobx-react
// import { observer } from '@apad/setting-panel/react'
import { observer } from 'mobx-react'

export default observer(() => {
  // ...
})
```
### you are not using react framework
I recommend to use preact version, It is smaller than the full react version
```ts
// import { initSetting, config } from '@apad/setting-panel'
import { config, initSetting } from '@apad/setting-panel/preact'

// ...
```
