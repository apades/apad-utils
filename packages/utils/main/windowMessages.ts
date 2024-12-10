import { isArray, isUndefined } from 'lodash-es'
import { tryit } from 'radash'
import { dq } from '../dom'
import Events2 from './Events2'

export function createWindowMessages<PostMessageProtocolMap extends Record<string, any>>(ID: string) {
  type PostMessageEvent = keyof PostMessageProtocolMap

  function postMessageToTop<
    T extends PostMessageEvent,
    Data extends PostMessageProtocolMap[T],
  >(...[type, data]: Data extends undefined ? [T] : [T, Data]) {
    return top?.postMessage(
      {
        ID,
        type,
        data,
      },
      '*',
    )
  }

  function postMessageToChild<
    T extends PostMessageEvent,
    Data extends PostMessageProtocolMap[T],
  >(
    ...[type, data, target]: Data extends undefined
      ? [T, undefined?, Window?]
      : [T, Data, Window?]
  ) {
    const targets = !isUndefined(target)
      ? isArray(target)
        ? target
        : [target]
      : dq('iframe').map(iframe => iframe.contentWindow!)

    const sendOk: Window[] = []
    targets.forEach((target) => {
      tryit(() => {
        target!.postMessage(
          {
            ID,
            type,
            data,
          },
          '*',
        )
        sendOk.push(target)
      })()
    })
    return sendOk
  }

  const eventSource = new Events2()
  window.addEventListener('message', (event) => {
    if (event.data?.ID !== ID)
      return
    eventSource.emit(event.data.type, {
      data: event.data.data,
      source: event.source,
    })
  })

  function onPostMessage<T extends PostMessageEvent>(
    type: T,
    callback: (data: PostMessageProtocolMap[T], source: Window) => void,
  ) {
    return eventSource.on2(type as any, ({ data, source }: any) =>
      callback(data, source))
  }

  return {
    onPostMessage,
    postMessageToChild,
    postMessageToTop,
  }
}
