import type { IObjectDidChange, IValueDidChange, Lambda } from 'mobx'
import { EventEmitter } from 'events'
import { Rec } from '../../tsconfig/types/global'
import { cloneDeep, isString } from 'lodash-es'

const obverseMap = new Map<any, { eventEmitter: EventEmitter }>()

type EventProps = { oldValue: any; newValue: any; key: any }
export function makeAutoObservable<T extends Rec>(target: T): T {
  const _target = cloneDeep(target)

  const proxy = new Proxy(_target, {
    get(target, key: string, receiver) {
      return _target[key]
    },
    set(target, key: string, newValue, receiver) {
      obverseMap.get(proxy).eventEmitter.emit(`set`, {
        oldValue: _target[key],
        newValue,
        key,
      } as EventProps)
      ;(_target as any)[key] = newValue
      return true
    },
  })
  obverseMap.set(proxy, {
    eventEmitter: new EventEmitter(),
  })
  return proxy
}

type Observe<Map extends Rec> = {
  <Key extends keyof Map>(
    observableMap: Rec,
    property: Key,
    listener: (change: IValueDidChange<Map[Key]>) => (() => void) | void,
    fireImmediately?: boolean
  ): Lambda
  (
    observableMap: Rec,
    listener: (change: IObjectDidChange) => (() => void) | void,
    fireImmediately?: boolean
  ): Lambda
}
export const observe: Observe<Rec> = (...args: any) => {
  const eventEmitter = obverseMap.get(args[0]).eventEmitter
  let listener: (props: EventProps) => void
  if (isString(args[1])) {
    listener = (props) => {
      if (props.key !== args[1]) return
      const update: IValueDidChange = {
        debugObjectName: '---',
        newValue: props.newValue,
        oldValue: props.oldValue,
        object: args[0],
        type: 'update',
        observableKind: 'value',
      }
      args[2](update)
    }
  } else {
    listener = (props) => {
      const update: IObjectDidChange = {
        debugObjectName: '---',
        name: props.key,
        newValue: props.newValue,
        oldValue: props.oldValue,
        object: args[0],
        observableKind: 'object',
        type: 'update',
      }
      args[2](update)
    }
  }
  eventEmitter.addListener('set', listener)
  return () => {
    eventEmitter.removeListener('set', listener)
  }
}

export { IObjectDidChange, IValueDidChange, Lambda }
