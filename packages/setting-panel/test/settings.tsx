import { config } from '../src'

const aCate = 'a系列'
const aSet = {
  a1: { defaultValue: 1, category: aCate, desc: 'asdfadf' },
  a2: config<'a' | 'b' | 'c'>({
    defaultValue: 'b',
    category: aCate,
    type: 'group',
    group: [
      { value: 'a', label: 'a属性', desc: 'adfadf' },
      'b',
      { value: 'c' },
    ],
  }),
  a3: { defaultValue: 'a' as 'a' | 'b', category: aCate },
}

const bCate = 'b系列'
const bSet = {
  b1: { defaultValue: false, category: bCate },
  b2: {
    defaultValue: 11,
    category: bCate,
    type: 'group',
    group: [2, 1, 11, '33'],
  },
  b3: {
    defaultValue: false,
    category: bCate,
    notRecommended: true,
  },
}

const cCate = 'c系列'
const cSet = {
  c1: { defaultValue: false, category: cCate },
  c2: {
    defaultValue: 11,
    category: cCate,
    type: 'group',
    group: [2, 1, 11, '33'],
  },
  c3: {
    defaultValue: false,
    category: cCate,
    notRecommended: true,
  },
}

const dCate = 'd系列'
const dSet = {
  d1: { defaultValue: false, category: dCate },
  d2: {
    defaultValue: 11,
    category: dCate,
    type: 'group',
    group: [2, 1, 11, '33'],
  },
  d3: {
    defaultValue: false,
    category: dCate,
    notRecommended: true,
  },
}

const defaultItem = {
  dagagagagagagag: 'aa',
  dasgagasdgadgdasgasg: 'val',
  num: 1,
}

const settings = {
  ...aSet,
  ...bSet,
  ...cSet,
  ...dSet,
  un: { defaultValue: '111' },
  unNumber: 111,
  noRec: config({ defaultValue: 'no rec', notRecommended: true }),
  noRel1: config({ defaultValue: false, notRecommended: true }),
  noRel2: config({
    defaultValue: '22',
    relateBy: 'noRel1',
    relateByValue: true,
    notRecommended: true,
  }),
  rel1: false,
  rel2: config({ defaultValue: '22', relateBy: 'rel1', relateByValue: true }),
  rel3: false,
  rel4: config({ defaultValue: false, relateBy: v => v.rel1 && !v.rel3 }),
  color: config({ type: 'color', defaultValue: '#66ccff' }),
  arr: [1, 2, 3],
  emptyArr: [] as any[],
  range: config({
    defaultValue: 0.5,
    type: 'range',
    range: [0, 1],
    desc: 'desc',
  }),
  rangeStep: config({
    defaultValue: 16,
    type: 'range',
    range: [12, 32],
    rangeStep: 1,
  }),
  // map结构
  mapSet: config<Record<string, typeof defaultItem>>({
    type: 'map',
    defaultValue: {
      a1: { dagagagagagagag: 'a1 val', num: 2, dasgagasdgadgdasgasg: 'a1 val' },
    },
    defaultItem,
  }),
  mapSetWithCusLabel: config<Record<string, typeof defaultItem>>({
    type: 'map',
    defaultValue: {},
    mapKeyLabel: '自定义key名',
    defaultItem: {
      ...defaultItem,
      dagagagagagagag: { defaultValue: defaultItem.dagagagagagagag, label: '自定义名字', desc: 'a' },
    },
  }),
  // mapArrSet: config<Record<string, typeof defaultItem[]>>({
  //   type: 'map',
  //   defaultValue: {},
  //   defaultItem: [defaultItem],
  // }),
  // arr extend
  arrAdv: config({
    defaultValue: [] as typeof defaultItem[],
  }),
  custom: config({
    defaultValue: 'Shift + ArrowRight',
    render: (val, onChange) => (
      <input
        value={val}
        onKeyDown={(e) => {
          e.preventDefault()
          const { key, shiftKey, ctrlKey } = e

          console.log('key', key, shiftKey, ctrlKey)
          const actions: string[] = []
          if (!key)
            return
          if (shiftKey && key !== 'Shift')
            actions.push('Shift')
          if (ctrlKey && key !== 'Control')
            actions.push('Ctrl')

          actions.push(key.length === 1
            ? key.toUpperCase()
            : key)
          onChange(
            actions.join(' + '),
          )
        }}
      />
    ),
  }),
}

window.settings = settings

export default settings
