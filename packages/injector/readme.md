# @apad/injector

开箱即用的js注入器，注入/替换 系统API，方便调试底层API，支持插件的cs <-> world甚至bg <-> world方式

## 示例

### 插件cs <-> world

cs.js
```js
import { initClient } from '@apad/injector/client'

const injectorClient = initClient({ eval: true })
injectorClient.eval.run((a)=>a+1,[2])
```

world.js
```js
import { initInjector } from '@apad/injector/injector'

const injector = initInjector({ eval: true })
```

### 插件bg <-> world

cs.js
```js
import '@apad/injector/ext-bg-messager/content-script'
```

world.js
```js
import Messager from '@apad/injector/ext-bg-messager/window'
import { initInjector } from '@apad/injector/injector'

const injector = initInjector({ eval: true, Messager })
```

bg.js
```js
import Messager from '@apad/injector/ext-bg-messager/background'
import { initClient } from '@apad/injector/client'

const injectorClient = initClient({ eval: true, Messager })
// 默认的是发给当前的tab
injectorClient.eval.run((a)=>a+1,[2])
// 加tab()是发送给特定tab
const tabId = 114514
injectorClient.tab(tabId).eval.run((a)=>a+1,[2])
```