# @apad/setting-panel

开箱即用设置面板，以mobx object为基础的状态管理

## 使用

### 如果你是非react/简单web应用用户
请使用压缩打包的min.js，该js已将react替换成preact以达到更小的效果
```ts
import { initSetting } from '@apad/setting-panel/lib/index.preact.min.js'
const { configStore, openSettingPanel} = initSetting({
    // ....
})
```
### 如果你是react(>=18.0)用户
直接引入该包
```ts
import { initSetting } from '@apad/setting-panel'
const { configStore, openSettingPanel} = initSetting({
    // ....
})
```

----- 

> 如果你在用mobx，推荐传入完整版mobx
```ts
import mobx from 'mobx'
const { configStore, openSettingPanel} = initSetting({
    mobx,
    // ....
})
```