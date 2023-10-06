export const ENTRY = 'entry'

export type InitConfig = Partial<{
  /**dom的addEventListener事件 */
  domEvents: boolean
  /**fetch + XMLHttpRequest */
  fetch: boolean
  /**SPA路由监听 */
  route: boolean
  triggerEvents: boolean
  eval: boolean
}>
