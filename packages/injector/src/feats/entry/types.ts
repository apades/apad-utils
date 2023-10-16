import type { Messager } from '../../core/Messager'

export const ENTRY = 'entry'

export type FeatEntryInitConfig = Partial<{
  /**dom的addEventListener事件 */
  domEvents: boolean
  /**fetch + XMLHttpRequest */
  fetch: boolean
  /**SPA路由监听 */
  route: boolean
  triggerEvents: boolean
  eval: boolean
  visibilityState: boolean
}>

export type InjectorInitConfig = FeatEntryInitConfig &
  Partial<{ Messager: typeof Messager }>
