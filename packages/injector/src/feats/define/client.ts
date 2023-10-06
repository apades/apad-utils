import { noop } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { DEFINE } from './types'

export default class DefineClient extends InjectorBase {
  static _DefineClient: DefineClient
  constructor(props: InjectorBaseProps) {
    if (!DefineClient._DefineClient) {
      super({
        category: DEFINE,
        ...props,
      })
      DefineClient._DefineClient = this
    }
    return DefineClient._DefineClient
  }
  init(): void {}
  protected onUnmount(): void {}

  addHook() {}
}
