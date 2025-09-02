# env-tools 
easy read `.env` , `.env.*` to web bundler and use it in web

## exm
first, create `.env.dev` file in project root, config like
```text
str=adf
bool=true
num=1111
bignum=12345678901234567890
```

### bundler
webpack:
```js
import { getDefinesObject } from '@apad/env-tools/bundler'

module.export = {
    // ...
    plugins: [
        // will read .env.dev
        new webpack.DefinePlugin(getDefinesObject('dev'))
    ]
}
```

vite: 
```js
import { defineConfig } from 'vite'
import { getDefinesObject } from '@apad/env-tools/bundler'

export default defineConfig({
  define: getDefinesObject(),
})
```

tsup:
```js
import { defineConfig } from 'tsup'
import { getDefinesObject } from '@apad/env-tools/bundler'

export default defineConfig({
  define: getDefinesObject(),
})
```

esbuild:
```js
import { build } from 'esbuild'
import { getDefinesObject } from '@apad/env-tools/bundler'

build({
  define: getDefinesObject(),
})
```

### web
```js
import { getEnv } from '@apad/env-tools/env'

console.log(getEnv().str === 'adf')
console.log(process.env.num === 1111)
```

*if you have some env only want to use in own machine, create a `.env` file can cover every `.env.*`*

## some useful api
show quickly env configure modal
```js
import { showEnvConfigureModal, extendEnv } from '@apad/env-tools/web'

showEnvConfigureModal()
// if you want to show you own env in modal, use this extend
extendEnv({newA:111,newB:222})
```