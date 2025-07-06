/**
 * DOMHeightCache 用于缓存每个 item 的高度，提升虚拟滚动性能
 */
export class DOMHeightCache {
  uniqueKey: string
  bucket: Map<string, { height: number; key: string }>
  updateAt: number

  constructor(uniqueKey = 'id') {
    this.uniqueKey = uniqueKey
    this.bucket = new Map()
    this.updateAt = 0
  }

  /**
   * 用指定高度填充所有数据项
   */
  fill(list: any[], value: number) {
    this.bucket.clear()
    for (const d of list) {
      const key = String(d[this.uniqueKey])
      this.bucket.set(key, {
        height: value,
        key,
      })
    }
    this.updateAt = Date.now()
  }

  /**
   * 获取指定 key 的缓存高度对象
   */
  get(key: string) {
    return this.bucket.get(String(key))
  }

  /**
   * 获取所有缓存的高度对象
   */
  getAll() {
    return [...this.bucket.values()]
  }

  /**
   * 设置指定 key 的高度
   */
  set(key: string, value: number) {
    const _key = String(key)
    if (this.bucket.has(_key)) {
      const exist = this.bucket.get(_key)!
      this.bucket.set(_key, {
        ...exist,
        height: value,
      })
    } else {
      this.bucket.set(_key, {
        key: _key,
        height: value,
      })
    }
    this.updateAt = Date.now()
  }

  /**
   * 获取所有缓存高度的总和
   */
  total() {
    return this.getAll()
      .map((d) => d.height)
      .reduce((p, c) => p + c, 0)
  }

  /**
   * 根据一组 id 获取这些项的高度总和
   */
  getHeightByIds(ids: (string | number)[]) {
    const result: number[] = []
    for (const id of ids) {
      result.push(this.get(String(id))?.height || 0)
    }
    return result.reduce((p, v) => p + v, 0)
  }

  /**
   * 判断是否存在指定 key 的缓存
   */
  has(key: string) {
    return this.bucket.has(key)
  }

  /**
   * 遍历所有缓存项
   */
  forEach(cb: (dc: { height: number; key: string }) => void) {
    this.getAll().forEach((dc) => {
      cb(dc)
    })
  }

  /**
   * 清除指定 key 的缓存
   */
  clearByKeys(keys: (string | number)[]) {
    for (const k of keys) {
      this.bucket.delete(String(k))
    }
    this.updateAt = Date.now()
  }

  /**
   * 清空所有缓存
   */
  empty() {
    this.bucket.clear()
  }
}

/**
 * 给列表每一项添加 $_index 索引字段
 */
export function addIndex(list: any[]) {
  let index = 0
  for (const d of list) {
    d['$_index'] = index
    index++
  }
}

/**
 * 包裹滚动元素，添加 async-virtual-scroll-wrapper 容器
 */
export function wrapperScrollEl(el: HTMLElement) {
  if (
    el.parentNode &&
    (el.parentNode as HTMLElement).classList.contains('async-virtual-scroll-wrapper')
  ) {
    return
  }
  const wrapper = document.createElement('div')
  wrapper.className = 'async-virtual-scroll-wrapper'
  wrapper.style.position = 'relative'
  el.parentNode!.insertBefore(wrapper, el)
  wrapper.appendChild(el)
}
