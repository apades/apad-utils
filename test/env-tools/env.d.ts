import '@apad/env-tools'

declare module '@apad/env-tools' {
 export interface Env {
  str: string;
  bool: boolean;
  num: number;
  bignum: string;
 }
}
