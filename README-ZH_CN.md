# async-virtual-scroll - Vue3 异步虚拟滚动组件

> 高性能虚拟滚动组件，支持动态高度渲染，优化大数据列表展示性能

[react 版本](https://github.com/Jason12306/react-async-virtual-scroll)

## 特性

- 🚀 高效渲染海量数据
- 📏 支持固定高度和动态高度
- 🔍 自动计算可视区域内容
- 🔄 内置滚动优化和缓冲区机制
- ⏳ 智能加载状态管理
- 🔧 高度可定制化配置

## 安装与使用

### 安装组件

```bash
npm install @jason12306/vue-async-virtual-scroll
```

### 基础使用

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

## Props 配置

| 参数名      | 类型    | 是否必填                 | 默认值     | 说明                                              |
| ----------- | ------- | ------------------------ | ---------- | ------------------------------------------------- |
| v-model     | Boolean | 是                       | false      | 控制组件是否启用虚拟滚动（必须使用v-model绑定）   |
| ban         | Boolean | 否                       | false      | 是否禁用虚拟滚动（用于数据较少时情况）            |
| itemSize    | Number  | 固定高度-是，动态高度-否 | undefined  | 固定高度模式下的项目高度（单位：px）              |
| minItemSize | Number  | 动态高度-是，固定高度-否 | undefined  | 动态高度模式下的最小项目高度（单位：px）          |
| data        | Array   | 是                       | []         | 要渲染的数据数组                                  |
| buffer      | Array   | 否                       | [200, 200] | 上下缓冲区域大小 [上缓冲区, 下缓冲区]（单位：px） |
| keyField    | String  | 否                       | 'id'       | 数据项中作为唯一标识的字段名                      |
| dataUid     | String  | 否                       | 'data-uid' | DOM元素上存储数据唯一标识的属性名                 |
| viewNum     | Number  | 否                       | 1          | 可视区域内至少显示的项目数量（用于初始估算）      |

## 插槽 (Slots)

### default

组件的主要渲染插槽，用于定义每个项目的渲染内容

#### 插槽参数

| 参数名  | 类型   | 说明               |
| ------- | ------ | ------------------ |
| item    | Object | 当前数据项         |
| index   | Number | 项目在数据中的索引 |
| dataUid | String | 项目的唯一标识     |

## 使用场景说明

### 1. 固定高度模式

当所有项目高度相同时，使用固定高度模式可获得最佳性能：

```html
<async-virtual-scroll v-model="enabled" :data="largeList" :item-size="60">
  <!-- 模板内容 -->
</async-virtual-scroll>
```

### 2. 动态高度模式

当项目高度不一致时，使用动态高度模式：

```html
<async-virtual-scroll v-model="enabled" :data="varyingHeightList" :min-item-size="40">
  <!-- 模板内容 -->
</async-virtual-scroll>
```

### 3. 禁用虚拟滚动

在数据较少情况下禁用虚拟滚动：

```html
<async-virtual-scroll :data="list" :ban="list.length < 100">
  <!-- 模板内容 -->
</async-virtual-scroll>
```

### 4. 自定义缓冲区

根据需求调整缓冲区大小：

```html
<async-virtual-scroll :data="list" :buffer="[150, 300]">
  <!-- 模板内容 -->
</async-virtual-scroll>
```

## 注意事项

1. **必须绑定 v-model**

2. **动态高度模式要求**

   - 必须提供 `minItemSize` 属性作为初始高度估算
   - 项目高度变化时，组件会自动检测并更新布局

3. **性能优化建议**

   - 对于固定高度项目，优先使用 `itemSize`
   - 合理设置 `buffer` 值以平衡性能与体验
   - 避免在项目模板中使用复杂计算

4. **数据更新**
   - 数据变化时组件会自动更新布局
   - 数据量大幅变化时会自动调整渲染区域

## 为什么？

在处理大型数据集时，传统渲染方式会一次性创建所有DOM元素，这会导致：

1. **内存占用过高**：成千上万的DOM节点会消耗大量内存
2. **渲染性能下降**：浏览器需要处理大量布局和绘制操作
3. **交互响应延迟**：滚动和用户操作会出现明显卡顿

**异步虚拟滚动**通过以下方式解决这些问题：

- 🚀 **按需渲染**：只渲染可视区域内的元素
- ⏱ **延迟计算**：使用IntersectionObserver异步检测元素可见性
- 🔄 **智能缓冲**：预加载可视区域外的少量元素确保流畅滚动
- 📊 **高度缓存**：记录已渲染元素高度，避免重复计算

## 效果

https://github.com/user-attachments/assets/b84d2e26-de03-4e89-8f81-c0abb02aa8cc

## 许可证

MIT License
