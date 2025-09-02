import { Rec } from '@pkgs/type-utils/lib'

export interface Env {}

export type EnvData = keyof Env extends never ? Rec : Env
