import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { VISIBILITY_STATE } from './types'

export default class VisibilityStateClient extends InjectorBase {
  static _VisibilityStateClient: VisibilityStateClient
  constructor(props: InjectorBaseProps) {
    if (!VisibilityStateClient._VisibilityStateClient) {
      super({
        category: VISIBILITY_STATE,
        ...props,
      })
      VisibilityStateClient._VisibilityStateClient = this
    }
    return VisibilityStateClient._VisibilityStateClient
  }
  init(): void {}
  protected onUnmount(): void {}

  alwaysVisible() {
    return this.send('alwaysVisible')
  }
  alwaysHidden() {
    return this.send('alwaysHidden')
  }
  restore() {
    return this.send('restore')
  }
}
