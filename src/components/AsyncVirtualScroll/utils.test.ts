import { describe, test, it, expect, beforeEach } from 'vitest'
import { addIndex, wrapperScrollEl, DOMHeightCache } from './utils'

describe('test DOMHeightCache', () => {
  let domHeightCache: DOMHeightCache

  beforeEach(() => {
    console.log('beforeEach...')
    domHeightCache = new DOMHeightCache('myId')
  })

  test('init DOMHeightCache', () => {
    expect(domHeightCache.uniqueKey).toBe('myId')
  })

  test('fill fn', () => {
    const list = [{myId: 1},{myId: 2},{myId: 3}]
    domHeightCache.fill(list, 40)

    expect(domHeightCache.get('1')?.height).toBe(40)
    expect(domHeightCache.get('2')?.height).toBe(40)
    expect(domHeightCache.get('3')?.height).toBe(40)
    
  })

  test('getAll fn', () => {
    domHeightCache.fill([{myId: 1},{myId: 2},{myId: 3}], 10)
    const list = domHeightCache.getAll()
    const data = [{height: 10, myId: 1},{height: 10, myId: 2}, {height: 10, myId: 3}]
    // TODO


  })
  test('set fn', () => {})
  test('total fn', () => {})
  test('getHeightByIds fn', () => {})
  test('has fn', () => {})
  test('forEach fn', () => {})
  test('clearByKeys fn', () => {})
  test('empty fn', () => {})
})

describe('test addIndex', () => {
  test('empty', () => {
    const arr: any[] = []
    addIndex(arr)
    expect(arr.length).toBe(0)
  })

  test('add $_index for data', () => {
    const arr: any[] = [{}, {}, {}, {}]
    addIndex(arr)
    expect(arr[0].$_index).toBe(0)
    expect(arr[1].$_index).toBe(1)
    expect(arr[2].$_index).toBe(2)
  })
})

// @vitest-environment happy-dom
describe('test wrapperScrollEl', () => {
  test(`El don't have parent node.`, () => {
    const el = document.createElement('div')
    const result = wrapperScrollEl(el)
    expect(result).toBeUndefined()
  })

  test(`El's parent node has been contained classname 'async-virtual-scroll-wrapper'`, () => {
    // wrapperScrollEl()
    // console.log(document);

    const parent = document.createElement('div')
    const el = document.createElement('div')

    parent.appendChild(el)

    wrapperScrollEl(el)
    const result = wrapperScrollEl(el)

    expect(result).toBeUndefined()
  })

  test(`Adding 'async-virtual-scroll-wrapper' for el's parent node classname`, () => {
    const parent = document.createElement('div')
    const el = document.createElement('div')

    parent.appendChild(el)

    const wrapper = wrapperScrollEl(el)
    // 期望在el的父元素下存在一个div节点并classname中包含async-virtual-scroll-wrapper'
    expect(wrapper?.className.includes('async-virtual-scroll-wrapper')).toBeTruthy()

    expect(wrapper?.parentNode).toBe(parent)
  })
})
