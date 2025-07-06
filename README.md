# async-virtual-scroll - Vue3 Asynchronous Virtual Scroll Component

> High-performance virtual scroll component supporting dynamic height rendering, optimized for large data list display

[简体中文](https://github.com/Jason12306/vue-async-virtual-scroll/blob/main/README-ZH_CN.md)

## Features

- 🚀 Efficient rendering of massive datasets
- 📏 Supports fixed height and dynamic height
- 🔍 Automatically calculates visible area content
- 🔄 Built-in scroll optimization and buffer mechanism
- ⏳ Smart loading state management
- 🔧 Highly customizable configuration

## Installation & Usage

### Install

```bash
npm install @jason12306/vue-async-virtual-scroll
```

### Basic Usage

```html
<template>
  <div class="test-container">
    <div class="scroll-container">
      <async-virtual-scroll v-model="show" :data="items" :item-size="60">
        <template v-slot="{ item, dataUid }">
          <div class="list-item" :data-uid="dataUid" :style="{ backgroundColor: item.color }">
            {{ item.id }}. {{ item.text }}
          </div>
        </template>
      </async-virtual-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import AsyncVirtualScroll from '@jason12306/vue-async-virtual-scroll'
  import '@jason12306/vue-async-virtual-scroll/vue-async-virtual-scroll.css'

  const show = ref(false)
  const num = 500
  const items = ref([])

  for (let i = 1; i <= num; i++) {
    items.value.push({
      id: i,
      text: `Item ${i}`,
      color: i % 2 ? '#e0f7fa' : '#fffde7',
    })
  }

  onMounted(() => {
    show.value = true
  })
</script>

<style scoped>
  .test-container {
    padding: 20px;
  }
  .scroll-container {
    height: 500px;
    border: 1px solid #ddd;
    overflow: auto;
  }
  .list-item {
    height: 60px;
    line-height: 60px;
    padding: 0 16px;
    border-bottom: 1px solid #eee;
    box-sizing: border-box;
  }
</style>
```

## Props Configuration

| Name        | Type    | Required                    | Default    | Description                                                              |
| ----------- | ------- | --------------------------- | ---------- | ------------------------------------------------------------------------ |
| v-model     | Boolean | Yes                         | false      | Controls whether virtual scrolling is enabled (must use v-model binding) |
| ban         | Boolean | No                          | false      | Disable virtual scrolling (for small datasets)                           |
| itemSize    | Number  | Required for fixed height   | undefined  | Item height in fixed-height mode (px)                                    |
| minItemSize | Number  | Required for dynamic height | undefined  | Minimum item height in dynamic-height mode (px)                          |
| data        | Array   | Yes                         | []         | Data array to render                                                     |
| buffer      | Array   | No                          | [200, 200] | Buffer zone sizes [top buffer, bottom buffer] (px)                       |
| keyField    | String  | No                          | 'id'       | Field name for unique identifier in data items                           |
| dataUid     | String  | No                          | 'data-uid' | DOM attribute name for storing data unique identifier                    |
| viewNum     | Number  | No                          | 1          | Minimum number of items visible initially (for estimation)               |

## Slots

### default

Main rendering slot for defining each item's content

#### Slot Parameters

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| item      | Object | Current data item      |
| index     | Number | Item index in data     |
| dataUid   | String | Item unique identifier |

## Usage Scenarios

### 1. Fixed Height Mode

When all items have the same height, use fixed height mode for optimal performance:

```html
<async-virtual-scroll v-model="enabled" :data="largeList" :item-size="60">
  <!-- template content -->
</async-virtual-scroll>
```

### 2. Dynamic Height Mode

When items have varying heights, use dynamic height mode:

```html
<async-virtual-scroll v-model="enabled" :data="varyingHeightList" :min-item-size="40">
  <!-- template content -->
</async-virtual-scroll>
```

### 3. Disable Virtual Scrolling

Disable virtual scrolling for small datasets:

```html
<async-virtual-scroll :data="list" :ban="list.length < 100">
  <!-- template content -->
</async-virtual-scroll>
```

### 4. Custom Buffer Zone

Adjust buffer sizes as needed:

```html
<async-virtual-scroll :data="list" :buffer="[150, 300]">
  <!-- template content -->
</async-virtual-scroll>
```

## Important Notes

1. **Must bind v-model**

2. **Dynamic Height Mode Requirements**

   - Must provide `minItemSize` property for initial height estimation
   - Component automatically detects and updates layout when item heights change

3. **Performance Optimization Suggestions**

   - Prefer `itemSize` for fixed-height items
   - Set appropriate `buffer` values to balance performance and UX
   - Avoid complex computations in item templates

4. **Data Updates**
   - Layout automatically updates when data changes
   - Render area automatically adjusts for significant data changes

## Why?

Traditional rendering methods create all DOM elements at once for large datasets, causing:

1. **High Memory Usage**: Thousands of DOM nodes consume significant memory
2. **Reduced Rendering Performance**: Browser handles excessive layout and paint operations
3. **Interaction Lag**: Noticeable stuttering during scrolling and user interactions

**Asynchronous Virtual Scrolling** solves these issues by:

- 🚀 **On-demand Rendering**: Only renders elements in viewport
- ⏱ **Deferred Calculation**: Uses IntersectionObserver for async visibility detection
- 🔄 **Smart Buffering**: Preloads elements outside viewport for smooth scrolling
- 📊 **Height Caching**: Records rendered element heights to avoid recalculation

## Demo

https://github.com/user-attachments/assets/b84d2e26-de03-4e89-8f81-c0abb02aa8cc

## License

MIT License
