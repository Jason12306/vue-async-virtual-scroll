<template>
  <div class="test-container">
    <h2>Fixed Height ItemSize Test ({{ num }} items, 40px each)</h2>
    <div class="scroll-container">
      <OptimizeScroll v-model="show" :data="items" :item-size="40" :buffer="[100, 100]">
        <template v-slot="{ item, dataUid }">
          <div class="list-item" :data-uid="dataUid" :style="{ backgroundColor: item.color }">
            {{ item.id }}. {{ item.text }}
          </div>
        </template>
      </OptimizeScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const show = ref(false)
const num = 1000
const items = ref([])

for (let i = 1; i <= num; i++) {
  items.value.push({
    id: i,
    text: `Item ${i}`,
    color: i % 2 ? '#f0f0f0' : '#ffffff',
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
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
}
</style>
