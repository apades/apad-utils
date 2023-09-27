/**
 * 将所有的dom事件方法重写达到禁用所有event效果
 */

import { onMessage_inject, sendMessage_inject } from './injectListener'

let originalAdd = HTMLElement.prototype.addEventListener

HTMLElement.prototype.addEventListener = function (...val: any) {
  this.eventMap = this.eventMap || {}
  this.eventMap[val[0]] = this.eventMap[val[0]] || []
  let eventList = this.eventMap[val[0]]
  let event = val[0]
  try {
    // 判断监听触发事件
    let onEventMatch = Object.entries(onEventAddMap).find(([key, val]) =>
      this.matches?.(key)
    )
    if (onEventMatch && onEventMatch[1].includes(event)) {
      sendMessage_inject('event-hacker:onEventAdd', {
        qs: onEventMatch[0],
        event,
      })
    }

    let disableMatch = Object.entries(disableMap).find(([key, val]) =>
      this.matches?.(key)
    )
    // 判断是否禁用
    if (disableMatch && disableMatch[1].includes(event)) {
      console.log('匹配到禁用query', disableMap, this)
    } else var rs = originalAdd.call(this, ...val)
    eventList.push({
      fn: val[1],
      state: val[2],
    })
  } catch (error) {
    console.error(error)
  }
  return rs
}

let originalRemove = HTMLElement.prototype.removeEventListener

HTMLElement.prototype.removeEventListener = function (...val: any) {
  let eventList = this.eventMap?.[val[0]] ?? []
  try {
    var rs = originalRemove.call(this, ...val)
    let index = eventList.findIndex(
      (ev: any) => ev.fn === val[1] && ev.state == val[2]
    )
    eventList.splice(index, 1)
  } catch (error) {
    console.error(error)
  }
  return rs
}

let disableMap: Record<string, string[]> = {}
onMessage_inject('event-hacker:disable', ({ qs, event }) => {
  let el = document.querySelector(qs)

  console.log('开始禁用事件', el, event)
  disableMap[qs] = disableMap[qs] || []
  disableMap[qs].push(event)

  if (!el) return console.warn(`没有找到${qs}的dom，将会在后续dom添加时不给add`)
  let eventList = (el as any).eventMap?.[event] ?? []

  eventList.forEach((ev: any) => {
    if (ev.state) originalRemove.call(el, event, ev.fn, ev.state)
    else originalRemove.call(el, event, ev.fn)
  })
})

onMessage_inject('event-hacker:enable', ({ qs, event }) => {
  console.log('开始启用事件', qs, event)
  if (!disableMap[qs]) return false
  disableMap[qs].slice(
    disableMap[qs].findIndex((e) => e == event),
    1
  )
  return true
})

let onEventAddMap: Record<string, string[]> = {}
onMessage_inject('event-hacker:listenEventAdd', ({ qs, event }) => {
  onEventAddMap[qs] = onEventAddMap[qs] || []
  onEventAddMap[qs].push(event)
})
