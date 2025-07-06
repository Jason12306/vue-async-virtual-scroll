<template>
  <div class="test-container">
    <h2>禁用状态测试 300 条数据</h2>
    <div class="controls"></div>
    <div class="scroll-container" style="height: 50vh; overflow: auto">
      <OptimizeScroll v-model="show" :ban="ban" :data="items" :min-item-size="50">
        <template v-slot="{ item, dataUid }">
          <div class="list-item" :data-uid="dataUid">项目 {{ item.id }}</div>
        </template>
      </OptimizeScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const show = ref(false)
const ban = ref(true)
const items = ref([])

for (let i = 1; i <= 300; i++) {
  items.value.push({ id: i })
}

onMounted(() => {
  show.value = true
})
</script>

<style scoped>
.controls {
  margin-bottom: 15px;
}
.controls button {
  margin-right: 10px;
  padding: 5px 10px;
}
.list-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}
</style>
