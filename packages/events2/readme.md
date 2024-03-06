# @apad/events2
在原有的Events上改造，增加了许多功能

## API
### on2(eventName, handler)
on增强版，返回可以停止监听的函数
```js
const unlisten = events2.on2(eventName, handler)
// 停止监听
unlisten()
```
### onAssembly(key)
返回相似的Events2结构的对象，将监听集合起来，后面可以通过`offAssembly(key)`取消该key下所有的监听
```js
const assembly = events2.onAssembly(key)
assembly.on(eventName1, handler1)
assembly.on(eventName2, handler2)
// 停止监听集合
events2.offAssembly(key)
```
### offAssembly(key)
如上所述
### assemblyListeners(key)
类似于`listeners(eventName)`的效果
### async send(key, data)
带返回的`emit`，需要配合`onGet`使用
### onGet(key, handler:()=>Promise<res> | res)
监听`send`发送的key事件，返回对应的数据