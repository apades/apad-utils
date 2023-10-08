import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { INTERSECTION } from './types'

export default class IntersectionClient extends InjectorBase {
  static _IntersectionClient: IntersectionClient
  constructor(props: InjectorBaseProps) {
    if (!IntersectionClient._IntersectionClient) {
      super({
        category: INTERSECTION,
        ...props,
      })
      IntersectionClient._IntersectionClient = this
    }
    return IntersectionClient._IntersectionClient
  }
  init(): void {}
  protected onUnmount(): void {}

  interActive(el: string) {
    return this.send('interActive', { el })
  }
}
