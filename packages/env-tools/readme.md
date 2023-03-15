# env-tools 
easy read `.env` , `.env.*` to web bundler and use it in web

## exm
first, create `.env.dev` file in project root, config like
```text
a=aaa
b=bbb
c=false
```

webpack config:
```js
import { getDefinesObject } from '@apad/env-tools/lib/bundler'

module.export = {
    // ...
    plugins: [
        // will read .env.dev
        new webpack.DefinePlugin(getDefinesObject('dev'))
    ]
}
```

web:
```js
import { getEnv } from '@apad/env-tools/lib/web'

console.log(getEnv().a)
console.log(process.env.b)
```

*if you have some env only want to use in own machine, create a `.env` file can cover every `.env.*`*

## some useful api
show quickly env configure modal
```js
import { showEnvConfigureModal, extendEnv } from '@apad/env-tools/lib/web'

showEnvConfigureModal()
// if you want to show you own env in modal, use this extend
extendEnv({newA:111,newB:222})
```