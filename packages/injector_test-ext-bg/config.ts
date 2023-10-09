import { FeatEntryInitConfig } from '@pkgs/injector/src/feats/entry/types'

export const injectorConfig: FeatEntryInitConfig = {
  eval: true,
  domEvents: true,
  triggerEvents: true,
  fetch: true,
  route: true,
}
