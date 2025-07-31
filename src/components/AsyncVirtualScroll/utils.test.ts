import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DOMHeightCache, addIndex, wrapperScrollEl } from './utils'

describe('DOMHeightCache', () => {
  let cache: DOMHeightCache
  const list = [{ id: 1 }, { id: 2 }, { id: 3 }]

  beforeEach(() => {
    cache = new DOMHeightCache('id')
  })

  it('should fill cache with specified height', () => {
    cache.fill(list, 100)
    expect(cache.get('1')?.height).toBe(100)
    expect(cache.get('2')?.height).toBe(100)
    expect(cache.get('3')?.height).toBe(100)
    expect(cache.getAll().length).toBe(3)
  })

  it('should set and get height for a key', () => {
    cache.set('1', 150)
    expect(cache.get('1')?.height).toBe(150)
    cache.set('1', 200)
    expect(cache.get('1')?.height).toBe(200)
  })

  it('should calculate total height', () => {
    cache.fill(list, 50)
    expect(cache.total()).toBe(150)
    cache.set('2', 70)
    expect(cache.total()).toBe(170)
  })

  it('should get height by ids', () => {
    cache.fill(list, 30)
    cache.set('2', 60)
    expect(cache.getHeightByIds(['1', '2', '3'])).toBe(120)
    expect(cache.getHeightByIds(['2'])).toBe(60)
    expect(cache.getHeightByIds(['4'])).toBe(0)
  })

  it('should check existence of key', () => {
    cache.fill(list, 10)
    expect(cache.has('1')).toBe(true)
    expect(cache.has('4')).toBe(false)
  })

  it('should forEach over all items', () => {
    cache.fill(list, 5)
    const keys: string[] = []
    cache.forEach((dc) => keys.push(dc.key))
    expect(keys).toEqual(['1', '2', '3'])
  })

  it('should clear by keys', () => {
    cache.fill(list, 8)
    cache.clearByKeys(['2'])
    expect(cache.has('2')).toBe(false)
    expect(cache.getAll().length).toBe(2)
  })

  it('should empty all cache', () => {
    cache.fill(list, 9)
    cache.empty()
    expect(cache.getAll().length).toBe(0)
  })
})

describe('addIndex', () => {
  it('should add $_index to each item', () => {
    const arr = [{}, {}, {}]
    addIndex(arr)
    expect(arr[0]['$_index']).toBe(0)
    expect(arr[1]['$_index']).toBe(1)
    expect(arr[2]['$_index']).toBe(2)
  })

  it('should handle empty array', () => {
    const arr: any[] = []
    addIndex(arr)
    expect(arr.length).toBe(0)
  })
})

/* describe('wrapperScrollEl', () => {
  it('should wrap element with async-virtual-scroll-wrapper', () => {
    const parent = document.createElement('div')
    const el = document.createElement('div')
    parent.appendChild(el)
    wrapperScrollEl(el)
    expect(el.parentElement?.classList.contains('async-virtual-scroll-wrapper')).toBe(true)
    expect(el.parentElement?.style.position).toBe('relative')
  })

  it('should not wrap if already wrapped', () => {
    const wrapper = document.createElement('div')
    wrapper.className = 'async-virtual-scroll-wrapper'
    const el = document.createElement('div')
    wrapper.appendChild(el)
    const spy = vi.spyOn(document, 'createElement')
    wrapperScrollEl(el)
    expect(spy).not.toHaveBeenCalledWith('div')
    spy.mockRestore()
  })
})
 */
