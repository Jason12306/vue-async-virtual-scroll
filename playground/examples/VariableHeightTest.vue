<template>
  <div class="test-container">
    <h2>可变高度项目测试</h2>
    <div class="controls">
      <button @click="toggleExpandAll">切换所有项目</button>
    </div>
    <div class="scroll-container" style="height: 500px; overflow: auto">
      <OptimizeScroll v-model="show" :data="items" :min-item-size="40" :buffer="[200, 200]">
        <template v-slot="{ item, dataUid }">
          <div
            :data-uid="dataUid"
            class="variable-item"
            :style="{ height: item.expanded ? '150px' : '50px' }"
            @click="toggleItem(item)"
          >
            <div class="item-header">项目 {{ item.id }}</div>
            <div v-if="item.expanded" class="item-content">展开的内容...<br />高度150px</div>
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

// 生成100项测试数据
for (let i = 1; i <= 100; i++) {
  items.value.push({
    id: i,
    expanded: false,
  })
}

function toggleItem(item) {
  item.expanded = !item.expanded
  // 强制更新
  items.value = [...items.value]
}

function toggleExpandAll() {
  const allExpanded = items.value.every((item) => item.expanded)
  items.value.forEach((item) => {
    item.expanded = !allExpanded
  })
  items.value = [...items.value]
}

onMounted(() => {
  show.value = true
})
</script>

<style scoped>
.variable-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
  transition: height 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  box-sizing: border-box;
}
.item-header {
  font-weight: bold;
  margin-bottom: 5px;
}
.item-content {
  padding: 10px;
  background-color: #eef;
}
</style>
