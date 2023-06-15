import { useLocation } from 'react-router'

export const usePathReg = (reg: RegExp): boolean =>
  !!useLocation().pathname.match(reg)

export function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search)
}
