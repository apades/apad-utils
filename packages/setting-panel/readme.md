# @apad/setting-panel

开箱即用设置面板，以mobx object为基础的状态管理，专门用来开发设置管理 + 前端页面控制设置

例如 env.ts
```tsx
import { initSetting } from '@apad/setting-panel'
export const { configStore, openSettingPanel,observe  } = initSetting({
    settings:{
        bg: { defaultValue: '#6cf', desc: '测试背景颜色' },
        type: { defaultValue: 'type1' as 'type1' | 'type2' },
        showDevConsole: { defaultValue: false },
    }
})
```
在react中
```tsx
import { configStore, openSettingPanel } from './env'
import { observer } from '@apad/setting-panel/lib/react'

export default observer(()=>{
    return <div style={{backgroundColor:configStore.bg}}>
        <button onClick={openSettingPanel}>openSettingPanel</button>
    </div>
})
```
在一些普通页面中
```ts
import { configStore, openSettingPanel,observe } from './env'

export default function ui(){
    const el = document.createElement('div')
    el.style.backgroundColor = newValue

    // 用来停止监听
    const unObserve = observe('bg',(change)=>{
        el.style.backgroundColor = change.newValue
    })

    return { el, unObserve }
}
```

## 使用

### 如果你是非react/简单web应用用户
推荐使用压缩打包的min.js，该js已将react替换成preact以达到更小的效果，相比原本减少了30kb+的react dist
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
import * as mobx from 'mobx'
const { configStore, openSettingPanel} = initSetting({
    // ....
    mobx,
})

// 然后之前的observer推荐替换成mobx-react
// import { observer } from '@apad/setting-panel/lib/react'
import { observer } from 'mobx-react'
```