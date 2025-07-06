<template>
  <div
    class="async-virtual-scroll"
    ref="optimizeScrollRef"
    :style="{ minHeight: wrapperHeight + 'px' }"
  >
    <div ref="startGuardRef" class="start" :style="{ height: `${startHeight}px` }"></div>
    <div ref="slotWrapperRef">
      <template v-for="item in renderData">
        <slot v-bind="{ item, index: item.$_index, dataUid: item[keyField] }"></slot>
      </template>
    </div>
    <div ref="endGuardRef" :style="{ height: `${endHeight}px` }" class="end"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, useTemplateRef, shallowRef } from 'vue'
import { addIndex, DOMHeightCache, wrapperScrollEl } from './utils'
import svgStr from './loading'

defineOptions({
  name: 'AsyncVirtualScroll',
})

// props
const props = withDefaults(
  defineProps<{
    value?: boolean
    ban?: boolean
    itemSize?: number
    minItemSize?: number
    data?: any[]
    buffer?: number[]
    keyField?: string
    dataUid?: string
    viewNum?: number
  }>(),
  {
    value: false,
    ban: false,
    itemSize: undefined,
    minItemSize: undefined,
    data: () => [],
    buffer: () => [200, 200],
    keyField: 'id',
    dataUid: 'data-uid',
    viewNum: 1,
  },
)

// vars
let $_itemsIntersectionObserver: IntersectionObserver | null = null
let $_guardIntersectionObserver: IntersectionObserver | null = null
let $_scrollEl: HTMLElement | undefined | null = null
let $_maxViewNum = 0
let $_lastDatalength = 0
let $_destroyed = true
let $_refreshTimer: number | undefined = undefined
let $_scrollTimer: number | undefined = undefined
let $_loadingTimer: number | undefined = undefined
let $_iOOptions: IntersectionObserverInit | null = null
let $_lastStartIndex = 0
let $_lastEndIndex = 0
let $_isInit = true
let $_startGuardEntry: IntersectionObserverEntry | null = null
let $_endGuardEntry: IntersectionObserverEntry | null = null
let $_loadingIO: IntersectionObserver | null = null

// refs

const optimizeScrollRef = shallowRef<HTMLElement | null>()
const startGuardRef = shallowRef<HTMLElement | null>()
const endGuardRef = shallowRef<HTMLElement | null>()
const slotWrapperRef = shallowRef<HTMLElement | null>()

const renderData = ref<any[]>([])
const startIndex = ref(0)
const endIndex = ref(0)
const domHeightCache = ref<DOMHeightCache | null>(null)
const wrapperHeight = ref(0)
const loading = ref(false)
const loadingEl = ref<HTMLElement | null>(null)

const useFixedItemSize = computed(() => props.itemSize && props.itemSize > 0)
const curItemSize = computed(() => props.itemSize || props.minItemSize || 0)
const startHeight = computed(() => {
  if (useFixedItemSize.value) {
    return startIndex.value * curItemSize.value
  }
  if (!domHeightCache.value) return 0
  const uids = props.data.slice(0, startIndex.value).map((item: any) => item[props.keyField])
  return domHeightCache.value.getHeightByIds(uids)
})
const endHeight = computed(() => {
  if (useFixedItemSize.value) {
    const itemsHeight = (endIndex.value - startIndex.value) * curItemSize.value
    return wrapperHeight.value - startHeight.value - itemsHeight
  }
  if (!domHeightCache.value) return 0
  const uids = props.data
    .slice(startIndex.value, endIndex.value)
    .map((item: any) => item[props.keyField])
  const itemsHeight = domHeightCache.value.getHeightByIds(uids)
  return wrapperHeight.value - startHeight.value - itemsHeight
})

const sliceIndex = computed(() => [startIndex.value, endIndex.value])

function init() {
  $_destroyed = false
  $_lastDatalength = props.data.length

  addIndex(props.data)

  if (props.ban) {
    console.log('禁用', props.data)
    renderData.value = props.data
    return
  }

  $_scrollEl = optimizeScrollRef.value?.parentNode as HTMLElement

  if ($_scrollEl) {
    $_scrollEl.style.overflowAnchor = 'none'
    wrapperScrollEl($_scrollEl)
  }

  $_iOOptions = {
    root: $_scrollEl,
    rootMargin: `${props.buffer[0]}px 0px ${props.buffer[1]}px 0px`,
  }

  console.log('$_iOOptions', $_iOOptions)

  if (useFixedItemSize.value) {
    addGuardIntersectionObserver()
    $_guardIntersectionObserver!.observe(startGuardRef.value!)
    $_guardIntersectionObserver!.observe(endGuardRef.value!)
    wrapperHeight.value = props.data.length * curItemSize.value
  } else {
    domHeightCache.value = new DOMHeightCache(props.keyField)
    domHeightCache.value.fill(props.data, curItemSize.value)
    addItemsIntersectionObserver()
    addGuardIntersectionObserver()
  }

  addLoadingDOM()

  const viewHeight = getScrollElHeight()
  $_maxViewNum = Math.max(Math.ceil(viewHeight / curItemSize.value), props.viewNum)

  console.log('视图可容纳item数目 viewNum', $_maxViewNum)

  endIndex.value = $_maxViewNum
  $_scrollEl?.addEventListener('scroll', handleScroll)

  addLoadingIntersectionObserver()
}

function updateStartIndex() {
  console.log('updateStartIndex')
  startIndex.value = Math.max(0, startIndex.value - $_maxViewNum)
}

function updateEndIndex() {
  endIndex.value = Math.min(endIndex.value + $_maxViewNum, props.data.length)
}
// 增加 items 交叉观察器
// 观察 items 刷新缓存高度 更新 wrapperHeight
// item 消失时 更新 startIndex endIndex
function addItemsIntersectionObserver() {
  $_itemsIntersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement
          const uid = target.getAttribute(props.dataUid)!
          const cachedHeight = domHeightCache.value?.get(uid)?.height
          if (cachedHeight !== target.offsetHeight) {
            domHeightCache.value?.set(uid, target.offsetHeight)
          }
        }
      }
    },
    {
      ...$_iOOptions,
    },
  )
}

function addGuardIntersectionObserver() {
  $_guardIntersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === startGuardRef.value) {
          $_startGuardEntry = entry
          if (entry.isIntersecting) {
            const renderCount = endIndex.value - startIndex.value
            if (renderCount > $_maxViewNum) {
              endIndex.value = Math.min(startIndex.value + $_maxViewNum, props.data.length)
            }
            updateStartIndex()
          }
        } else if (entry.target === endGuardRef.value) {
          $_endGuardEntry = entry
          if (entry.isIntersecting) {
            if (endIndex.value === props.data.length) {
              return
            }
            const renderCount = endIndex.value - startIndex.value
            if (renderCount > $_maxViewNum) {
              startIndex.value = Math.max(endIndex.value - $_maxViewNum, 0)
            }
            updateEndIndex()
          }
        }
      }
    },
    {
      ...$_iOOptions,
    },
  )
}

function addLoadingIntersectionObserver() {
  $_loadingIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === startGuardRef.value && startIndex.value !== 0) {
          if (entry.isIntersecting) {
            loading.value = true
          }
        }
        if (entry.target === endGuardRef.value && endIndex.value !== props.data.length) {
          if (entry.isIntersecting) {
            loading.value = true
          }
        }
      }
    },
    {
      root: $_scrollEl,
    },
  )
}

function updateRenderData() {
  renderData.value = props.data.slice(startIndex.value, endIndex.value)
  if (useFixedItemSize.value) return
  nextTick(() => {
    const slotNodes = Array.from(slotWrapperRef.value?.children || [])
    for (const el of slotNodes) {
      $_itemsIntersectionObserver?.observe(el)
    }
  })
}

function checkStatusAfterScrollStop() {
  if ($_lastStartIndex === startIndex.value && $_lastEndIndex === endIndex.value) {
    return
  }
  const scrollEl = $_scrollEl as HTMLElement
  const scrollTop = scrollEl.scrollTop
  const viewHeight = scrollEl.clientHeight
  const buffer = props.buffer

  if (useFixedItemSize.value) {
    const itemSize = props.itemSize!
    const start = Math.max(0, Math.floor((scrollTop - buffer[0]) / itemSize))
    let end = Math.min(
      props.data.length,
      Math.ceil((scrollTop + viewHeight + buffer[1]) / itemSize),
    )
    if (end === start) {
      end = props.data.length
    }
    startIndex.value = start
    endIndex.value = end
    return
  }

  let sum = 0
  let start = 0
  for (let i = 0; i < props.data.length; i++) {
    const key = props.data[i][props.keyField]
    const h = domHeightCache.value?.get(key)?.height || 0
    if (sum + h >= scrollTop - buffer[0]) {
      start = i
      break
    }
    sum += h
  }

  let end = start
  let visibleSum = 0
  for (let i = start; i < props.data.length; i++) {
    const key = props.data[i][props.keyField]
    const h = domHeightCache.value?.get(key)?.height || 0
    visibleSum += h
    if (visibleSum >= viewHeight + buffer[1] + buffer[0]) {
      end = i + 1
      break
    }
  }
  if (end === start) {
    end = props.data.length
  }
  startIndex.value = start
  endIndex.value = end
}

async function afterScrollStopCompleted() {
  if ($_startGuardEntry?.isIntersecting || $_endGuardEntry?.isIntersecting) {
    checkStatusAfterScrollStop()
  }
  if (loading.value) {
    nextTick(() => {
      loading.value = false
    })
  }
}

function handleScroll(evt: Event) {
  window.requestAnimationFrame(() => {
    clearTimeout($_scrollTimer)
    if (!loading.value) {
      clearTimeout($_loadingTimer)
      $_loadingTimer = setTimeout(() => {
        clearTimeout($_loadingTimer)
        $_loadingTimer = undefined
        $_loadingIO?.observe(startGuardRef.value!)
        $_loadingIO?.observe(endGuardRef.value!)
      }, 150)
    }
    $_scrollTimer = setTimeout(() => {
      let idTimer: number = 0
      cancelIdleCallback(idTimer)
      idTimer = requestIdleCallback(
        () => {
          afterScrollStopCompleted()
        },
        {
          timeout: 500,
        },
      )
      $_scrollTimer = undefined
    }, 500)
  })
}

function addLoadingDOM() {
  loadingEl.value = document.createElement('div')
  loadingEl.value.className = 'async-virtual-scroll-loading'
  loadingEl.value.innerHTML = `<div class="async-virtual-scroll-loading-icon">${svgStr}</div>`
  $_scrollEl?.insertAdjacentElement('afterend', loadingEl.value)
}

function getScrollElHeight() {
  const bufferTop = props.buffer?.[0] || 0
  const bufferBottom = props.buffer?.[1] || 0
  let viewHeight = ($_scrollEl as HTMLElement).offsetHeight + bufferTop + bufferBottom
  const style = window.getComputedStyle($_scrollEl as HTMLElement)
  const maxHeight = parseFloat(style.maxHeight)
  if (!isNaN(maxHeight) && maxHeight > 0) {
    viewHeight = maxHeight + bufferTop + bufferBottom
  }
  return viewHeight
}

function clear() {
  $_scrollEl?.removeEventListener('scroll', handleScroll)
  if ($_scrollEl?.parentNode && loadingEl.value) {
    $_scrollEl.parentNode.removeChild(loadingEl.value)
  }
  $_scrollEl = undefined
  renderData.value = []
  startIndex.value = 0
  endIndex.value = $_maxViewNum || 1
  $_itemsIntersectionObserver?.disconnect()
  $_guardIntersectionObserver?.disconnect()
  $_itemsIntersectionObserver = null
  $_guardIntersectionObserver = null
  clearTimeout($_refreshTimer)
  clearTimeout($_scrollTimer)
  $_refreshTimer = undefined
  $_scrollTimer = undefined
  domHeightCache.value?.empty()
  domHeightCache.value = null
  wrapperHeight.value = 0
  $_loadingIO?.disconnect()
  $_loadingIO = null
}

const modelValue = defineModel({ required: true })
// 监听
watch(modelValue, (newVal) => {
  if (newVal) {
    init()
  } else {
    $_destroyed = true
    clear()
  }
})

watch(sliceIndex, (newVal, oldVal) => {
  if ($_destroyed) return

  if (!props.ban) {
    $_lastStartIndex = oldVal[0]
    $_lastEndIndex = oldVal[1]
    updateRenderData()
  }
})

watch(
  () => domHeightCache.value?.updateAt,
  () => {
    if (props.itemSize) return
    if (!domHeightCache.value) {
      console.log('domHeightCache 已经销毁')
      return
    }
    wrapperHeight.value = domHeightCache.value.total() || 0

    const allHeight = domHeightCache.value.getAll()
    const updatedHeight = allHeight.filter((h) => h.height !== props.minItemSize)
    const len = updatedHeight.length

    // 计算 修正 $_maxViewNum 值
    if (len) {
      const heights = updatedHeight.map((item) => item.height).reduce((p, v) => p + v, 0)
      const avgHeight = Math.ceil(heights / len)
      const viewHeight = getScrollElHeight()
      $_maxViewNum = Math.max(Math.ceil(viewHeight / avgHeight), props.viewNum)
      if ($_isInit) {
        $_isInit = false
        console.log('修正后的', $_maxViewNum)
        $_guardIntersectionObserver!.observe(startGuardRef.value!)
        $_guardIntersectionObserver!.observe(endGuardRef.value!)
      }
    }
  },
)

watch(props.data, (newVal) => {
  console.log('props.data')

  if ($_destroyed || !modelValue.value) return
  console.log('数据发生了变化，长度旧->新', $_lastDatalength, newVal.length)

  addIndex(props.data)

  if (props.ban) {
    renderData.value = props.data
    return
  }

  if (!useFixedItemSize.value) {
    $_itemsIntersectionObserver?.disconnect()
  }

  const lastStartIndex = startIndex.value
  const lastEndIndex = endIndex.value
  const newLength = newVal.length
  const wasAtBottom = lastEndIndex === $_lastDatalength

  if (newLength > $_lastDatalength) {
    if (endIndex.value < $_maxViewNum) {
      endIndex.value = Math.min($_maxViewNum, newLength)
    } else if (wasAtBottom) {
      endIndex.value = newLength
    }
  } else if (newLength < $_lastDatalength) {
    if (startIndex.value >= newVal.length) {
      startIndex.value = 0
      endIndex.value = Math.min($_maxViewNum, newLength)
    } else if (endIndex.value > props.data.length) {
      endIndex.value = props.data.length
      const gap = endIndex.value - startIndex.value
      if (gap < $_maxViewNum) {
        startIndex.value = Math.max(0, startIndex.value - gap)
      }
    }
  }

  if (lastStartIndex === startIndex.value && lastEndIndex === endIndex.value) {
    updateRenderData()
  }

  $_lastDatalength = newVal.length

  if (!useFixedItemSize.value) {
    clearTimeout($_refreshTimer)
    $_refreshTimer = setTimeout(() => {
      console.log('这里要确保缓存刷新完成 watch data')
      for (const d of props.data) {
        const key = String(d[props.keyField])
        if (!domHeightCache.value!.has(key)) {
          domHeightCache.value!.set(key, props.minItemSize!)
        }
      }
      const uids = props.data.map((item) => String(item[props.keyField]))
      const delIds: string[] = []
      domHeightCache.value!.forEach((item) => {
        if (!uids.includes(item.key)) {
          delIds.push(item.key)
        }
      })
      domHeightCache.value!.clearByKeys(delIds)
      console.log(domHeightCache.value)
      $_refreshTimer = undefined
    }, 100)
  }
})

watch(loading, (val) => {
  if (loadingEl.value) {
    loadingEl.value.style.display = val ? 'flex' : 'none'
  }
})
</script>

<style>
.async-virtual-scroll-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  background-color: rgba(255, 255, 255, 0.9);
  display: none;
  align-items: center;
  justify-content: center;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(1turn);
  }
}

.async-virtual-scroll-loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  animation: rotating 2s linear infinite;
}
</style>
