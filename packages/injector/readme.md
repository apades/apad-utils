# @apad/injector

开箱即用的js注入器，注入/替换 系统API，方便调试底层API，支持插件的cs <-> world甚至bg <-> world方式

## 示例

### 插件cs <-> world

cs.js
```js
import initClient from '@apad/injector/client'

const injectorClient = initClient()
injectorClient.eval.run((a)=>a+1,[2])
```

world.js

### 插件bg <-> world

比较特殊，在上面的示例基础上，需要一个cs引入消息中转站messageRelay

cs.js
```js
import relay from '@apad/injector/messageRelay'

relay({
  onMessageFromClient: (msg) => {
    return new Promise((res) => {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type != '@apad/injector') return
        res(msg.data)
      })
    })
  },
  sendMessageToClient: (msg) => {
    return chrome.runtime.sendMessage({ type: '@apad/injector', data: {
        type:'@apad/injector',
        data:msg
    } })
  },
})
```

bg(或者mv3的sw).js
```js
import initClient from '@apad/injector/client'

const injectorClient = initClient({
  onMessageFromInjector: (msg) => {
    return new Promise((res) => {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type != '@apad/injector') return
        res(msg.data)
      })
    })
  },
  sendMessageToInjector: (msg) => {
    return chrome.runtime.sendMessage({ type: '@apad/injector', data: {
        type:'@apad/injector',
        data:msg
    } })
  },
})

// 然后可以开始调用注入器了
injectorClient.eval.run((a)=>a+1,[2])
```