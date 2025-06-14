import type { Rec, ValueOf } from '@pkgs/utils/type'
import type { ReactNode } from 'entry'
import type mobx from 'mobx'
import type { IObjectDidChange, IValueDidChange, Lambda } from 'mobx'
import type { observer } from 'mobx-react'
import type en from './i18n/en.json'

export interface ConfigFieldBase<T, ext = any> {
  defaultValue?: T
  desc?: string
  /** 不填默认使用key作为label */
  label?: string
  notRecommended?: boolean
  /** 分类 */
  category?: string
  /** 与settings字段关联的 */
  relateBy?: string | ((settings: Rec) => boolean)
  /** 等于relateBy的值时，才显示该设置，默认defaultValue是boolean时为true */
  relateByValue?: any
  render?: (val: T, onChange: (val: T) => Promise<void>) => ReactNode
  ext?: ext
}
interface ConfigGroupField<T> {
  value: T
  desc?: string
  label?: string
}

export type ConfigField<T> =
  | ConfigFieldBase<T>
  | T
  | (ConfigFieldBase<T> & {
    type: 'group'
    group: (T | ConfigGroupField<T>)[]
  })
  | (ConfigFieldBase<T> & {
    type: 'color'
  })
  | (ConfigFieldBase<T> & {
    type: 'range'
    range: [number, number]
    rangeStep?: number
  })
  | (ConfigFieldBase<T> & {
    type: 'map'
    mapKeyLabel?: string
    defaultItem: ValueOf<T> | { [K in keyof ValueOf<T>]: ({ label?: string, defaultValue: any, desc?: string } | any) }
  })

export interface BaseMobx {
  makeAutoObservable: typeof mobx.makeAutoObservable
  observe: typeof mobx.observe
  observer: typeof observer
}

export interface InitOptions<Map extends Record<string, any>> {
  settings: {
    [K in keyof Map]: ConfigField<Map[K]>
  }
  /** 初始化时载入设置，saveInLocal为false时返回的是空object */
  onInitLoadConfig?: (config: Partial<Map>) => Promise<Partial<Map>> | Partial<Map>
  /** 保存时的数据，如果不关闭saveInLocal默认也会保存一份本地，可以返回新数据进行保存，注意不能delete */
  onSave?: (config: Partial<Map>) => Promise<void | Partial<Map>> | void | Partial<Map>
  /**
   * 保存的位置，默认用localStorage
   *
   * TODO indexedDB
   */
  savePosition?: 'localStorage' /* | 'indexedDB' */
  /** 保存到本地，默认为true */
  saveInLocal?: boolean
  /** 是否使用shadow dom，避免css污染，默认关闭 */
  useShadowDom?: boolean
  /** 默认为true，如果不想设置面板设置改动设置时修改configStore可以关闭 */
  changeConfigStoreWithSettingPanelChange?: boolean
  /** 默认为true，输入停止{autoSaveTriggerMs}(默认500ms)后自动触发onSave */
  autoSave?: boolean
  /** 默认500，自动保存用的 */
  autoSaveTriggerMs?: number
  /** 默认的mobx是自己魔改的残缺版本，需要完整功能请传入mobx的module */
  mobx: BaseMobx
  /** 针对 非打包工具 + useShadowDom:true 的用户 */
  styleHref?: string
  /** 默认为true */
  isModal?: boolean
  i18n?: I18n
}

export interface InitSettingReturn<Map extends Record<string, any>> {
  /** 从options.settings转化成的mobx结构数据 */
  configStore: Map
  /** 打开设置面板的UI */
  openSettingPanel: (
    /** 渲染的位置，不传默认是开全局modal */
    renderTarget?: HTMLElement | { category: string, renderTarget?: HTMLElement }
  ) => void
  closeSettingPanel: () => void
  /**
   * mobx的监听
   *
   * listener的return返回函数的话可以像react useEffect那样在重新触发listener时运行该函数，可以用来清除上一次函数里相关的挂载操作然后重新挂载相关数据
   */
  observe: Observe<Map>
  updateConfig: (
    /** 传入更新了的config map */
    savedConfig?: Partial<Map>
  ) => Promise<void>
  saveConfig: () => Promise<void>
}

export type I18n = typeof en

export interface Observe<Map extends Record<string, any>> {
  <Key extends keyof Map>(
    property: Key,
    listener: (change: IValueDidChange<Map[Key]>) => (() => void) | void,
    fireImmediately?: boolean
  ): Lambda
  (
    listener: (change: IObjectDidChange) => (() => void) | void,
    fireImmediately?: boolean
  ): Lambda
}
