import { useMap } from 'ahooks'
import { isArray, isString } from 'lodash-es'
import { useEffect, useMemo, useRef } from 'react'

function useScrollSpy(
  qs: string | HTMLElement[] | HTMLElement,
  effect: any[] = []
) {
  const [enterMap, enterMapSetter] = useMap<
    HTMLElement,
    { el: HTMLElement; isEnter: boolean; index: number }
  >()
  // const [enter, setEnter] = useState<{ el: HTMLElement; index: number }>({
  //   el: null,
  //   index: -1,
  // })
  const els: HTMLElement[] = useMemo(() => {
    let els: HTMLElement[] = []
    if (isString(qs))
      els = Array.from(document.querySelectorAll(qs)) as HTMLElement[]
    else if (isArray(qs)) els = qs
    else els = [qs]

    els.forEach((el, i) => {
      enterMapSetter.set(el, { el, index: i, isEnter: false })
    })
    return els
  }, [qs, ...effect])
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      // console.log(
      //   'entries',
      //   entries,
      //   entries.map((e) => e.target)
      // )
      for (let i = 0; i < entries.length; i++) {
        let entry = entries[i]
        let el = entry.target as HTMLElement
        enterMapSetter.get(el) &&
          enterMapSetter.set(el, {
            ...enterMapSetter.get(el),
            isEnter: entry.isIntersecting,
          })
      }
    })

    // console.log('els', els)
    els.forEach((el) => el && observerRef.current.observe(el))
    return () => {
      // els.forEach((el) => observerRef.current.unobserve(el))
      observerRef.current.disconnect()
    }
  }, [els])

  return [...enterMap.values()].filter((v) => v.isEnter)
}

export default useScrollSpy
