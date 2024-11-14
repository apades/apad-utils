/* eslint-disable unused-imports/no-unused-vars */

import type {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from 'axios'
import Axios from 'axios'

type Key = 'get' | 'post' | 'delete' | 'put' | 'head'

export interface Data {
  [k: string]: string | number | boolean
}

export function createAxios<ResType = any>(
  config: CreateAxiosDefaults<any> &
    Partial<{
      getToken: () => Promise<string> | string
      /** 默认是10s */
      timeout: 10000
    }> = {},
) {
  const { getToken, timeout = 10000 } = config

  const axiosBase = Axios.create(config)

  if (getToken) {
    axiosBase.interceptors.request.use(async (req) => {
      const token = await getToken()
      if (token)
        req.headers.Authorization = token
      return req
    })
  }

  const fn = (key: Key) => async (
    ...v: [string, Record<any, any>?, AxiosRequestConfig?]
  ): Promise<any> => {
    const url = v[0]
    const reqData: Record<any, any> = v[1] ?? {}
    const config: AxiosRequestConfig = v[2] ?? {}

    let res: AxiosResponse<any>

    try {
      const _config: AxiosRequestConfig = {
        method: key,
        url,
        ...config,
      }
      // get 请求v[1]值为query参数
      const _key: keyof AxiosRequestConfig = key === 'get' ? 'params' : 'data'
      _config[_key] = { ...(_config[_key] || {}), ...reqData }
      res = await axiosBase(_config)
    }
    catch (err) {
      return Promise.reject(err)
    }

    return res
  }

  let requestProxy: {
    <T = any>(
      url: string,
      data?: Data,
      config?: AxiosRequestConfig
    ): AxiosPromise<ResType>
    <T = any>(url: string): AxiosPromise<ResType>
  } & {
    [k in Exclude<Key, 'get'>]:
        | (<T = any>(
          url: string,
          data?: Record<any, any>,
          config?: AxiosRequestConfig
        ) => AxiosPromise<ResType>)
        | (<T = any>(url: string) => AxiosPromise<ResType>)
  } = {} as any
  requestProxy = Object.assign(() => 1, requestProxy)

  const request = new Proxy(requestProxy, {
    get(target, key: Key) {
      return fn(key)
    },
    apply(
      target,
      thisArg,
      args: [string, Record<any, any>?, AxiosRequestConfig?],
    ) {
      return fn('get')(...args)
    },
  })

  return request
}
