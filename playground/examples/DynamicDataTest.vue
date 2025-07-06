<template>
  <div class="test-container">
    <h2>动态数据变化测试</h2>
    <div class="controls">
      <button @click="addItems(10)">添加10项</button>
      <button @click="removeItems(10)">移除10项</button>
      <button @click="updateItems">更新随机项</button>
    </div>
    <div class="scroll-container">
      <OptimizeScroll v-model="show" :data="items" :min-item-size="40">
        <!-- :buffer="[0, 0]" -->
        <template v-slot="{ item, dataUid }">
          <div class="list-item" :data-uid="dataUid">
            {{ item.id }}. {{ item.text }} (高度: {{ item.height }}px)
          </div>
        </template>
      </OptimizeScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const show = ref(false)
const items = ref([])
const nextId = ref(0)

function addItem() {
  const height = Math.floor(Math.random() * 100) + 50
  items.value.push({
    id: nextId.value++,
    text: `项目 ${nextId.value}`,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    height: height,
  })
}

function addItems(count) {
  for (let i = 0; i < count; i++) addItem()
}

function removeItems(count) {
  items.value.splice(0, count)
}

function updateItems() {
  // 随机更新5个项目
  for (let i = 0; i < 5; i++) {
    const index = Math.floor(Math.random() * items.value.length)
    items.value[index].color = `#${Math.floor(Math.random() * 16777215).toString(16)}`
    items.value[index].text = `更新项目 ${Date.now().toString().slice(-4)}`
    // 触发响应式
    items.value = [...items.value]
  }
}

// 初始50项
for (let i = 0; i < 50; i++) {
  addItem()
}

onMounted(() => {
  show.value = true
})
</script>

<style scoped>
.scroll-container {
  max-height: 50vh;
  overflow: auto;
}
.controls {
  margin-bottom: 15px;
}
.controls button {
  margin-right: 10px;
  padding: 5px 10px;
}
.list-item {
  padding: 15px;
  box-sizing: border-box;
}
</style>
