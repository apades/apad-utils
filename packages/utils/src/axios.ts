import Axios, {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from 'axios'

export function createAxios<ResType = any>(
  config: CreateAxiosDefaults<any> &
    Partial<{
      getToken: () => Promise<string> | string
      /**默认是10s */
      timeout: 10000
    }> = {}
) {
  const { getToken, timeout = 10000, ..._config } = config

  const axiosBase = Axios.create(config)

  if (getToken) {
    axiosBase.interceptors.request.use(async (req) => {
      let token = await getToken()
      if (token) req.headers['Authorization'] = token
      return req
    })
  }

  type Key = 'get' | 'post' | 'delete' | 'put' | 'head'
  type data = {
    [k: string]: string | number | boolean
  }
  let requestProxy: {
    <T = any>(
      url: string,
      data?: data,
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

  let request = new Proxy(requestProxy, {
    get(target, key: Key) {
      return fn(key)
    },
    apply(
      target,
      thisArg,
      args: [string, Record<any, any>?, AxiosRequestConfig?]
    ) {
      return fn('get')(...args)
    },
  })

  let fn = (key: Key) => async (
    ...v: [string, Record<any, any>?, AxiosRequestConfig?]
  ): Promise<any> => {
    let url = v[0],
      reqData: Record<any, any> = v[1] ?? {},
      config: AxiosRequestConfig = v[2] ?? {}

    let res: AxiosResponse<any>

    try {
      let _config: AxiosRequestConfig = {
        method: key,
        url,
        ...config,
      }
      // get 请求v[1]值为query参数
      let _key: keyof AxiosRequestConfig = key === 'get' ? 'params' : 'data'
      _config[_key] = { ...(_config[_key] || {}), ...reqData }
      res = await axiosBase(_config)
    } catch (err) {
      return Promise.reject(err)
    }

    return res
  }

  return request
}

const axios = createAxios()
export default axios
