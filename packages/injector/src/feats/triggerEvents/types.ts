export const TRIGGER_EVENTS = 'triggerEvents'

// ? 要不要弄次数
export type TriggerIntervalOption = number | {}
export type TriggerFunction<El = HTMLElement | string, Ext = any> = {
  /**只触发一次 */
  (el: El, ext?: Ext): void
  /**
   * 重复触发
   *
   * @returns {function} 停止触发
   */
  interval: (
    el: El,
    ext?: Ext,
    /**触发时间间隔，默认100ms */
    option?: number
  ) => {
    (): void
    uuid: string
  }
}

export enum MouseEvents {
  click = 'click',
  dblclick = 'dblclick',
  mousedown = 'mousedown',
  mouseover = 'mouseover',
  mousemove = 'mousemove',
  mouseout = 'mouseout',
  mouseenter = 'mouseenter',
  mouseleave = 'mouseleave',
  mousewheel = 'mousewheel',
  wheel = 'wheel',
  contextmenu = 'contextmenu',
}
export type MouseTrigger<El = HTMLElement | string> = {
  [K in MouseEvents]: TriggerFunction<El>
}

export enum KeyboardEvents {
  keydown = 'keydown',
  keyup = 'keyup',
  keypress = 'keypress',
  input = 'input',
}
export type KeyboardTrigger<El = HTMLElement | string> = {
  [K in KeyboardEvents]: TriggerFunction<El>
}
