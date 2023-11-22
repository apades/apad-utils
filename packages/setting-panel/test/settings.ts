import { config } from '../src'

const aCate = 'a系列'
const aSet = {
  a1: { defaultValue: 1, category: aCate, desc: 'asdfadf' },
  a2: config<'a' | 'b'>({
    defaultValue: 'b',
    category: aCate,
    type: 'group',
    // TODO 支持复杂数据传入
    // group: { a: { value: 'a' }, b: 'b' },
    group: ['a', 'b'],
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

const settings = {
  ...aSet,
  ...bSet,
  ...cSet,
  ...dSet,
  un: { defaultValue: '111' },
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
}

window.settings = settings

export default settings
