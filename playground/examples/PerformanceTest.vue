<template>
  <div class="test-container">
    <h2>性能极限测试 (1,000项)</h2>
    <div class="scroll-container">
      <OptimizeScroll v-model="show" :data="items" :min-item-size="40" :buffer="[200, 200]">
        <template v-slot="{ item, dataUid }">
          <div class="perf-item" :data-uid="dataUid">
            <div class="item-id">#{{ item.id }}</div>
            <div class="item-content">
              <div>名称: {{ item.name }}</div>
              <div>邮箱: {{ item.email }}</div>
              <div>地址: {{ item.address }}</div>
            </div>
          </div>
        </template>
      </OptimizeScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

function generateRandomData(count) {
  const data = []
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com']
  const streets = ['主街', '公园路', '橡树街', '枫叶大道', '中央大街']

  for (let i = 1; i <= count; i++) {
    const name = names[Math.floor(Math.random() * names.length)]
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const street = streets[Math.floor(Math.random() * streets.length)]

    data.push({
      id: i,
      name: `${name}${i}`,
      email: `${name.toLowerCase()}${i}@${domain}`,
      address: `${street} ${Math.floor(Math.random() * 1000)}号`,
    })
  }

  return data
}

const show = ref(false)
const items = ref([])

function loadData(count) {
  items.value = generateRandomData(count)
}

onMounted(() => {
  loadData(1000)
  show.value = true
})
</script>

<style scoped>
.scroll-container {
  height: 520px;
  border: 1px solid #ddd;
  overflow: auto;
}
.perf-item {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #eee;
  height: 80px;
  box-sizing: border-box;
}
.item-id {
  width: 50px;
  font-weight: bold;
  color: #666;
}
.item-content {
  flex: 1;
  font-size: 12px;
  line-height: 1.4;
}
.controls {
  margin-bottom: 15px;
}
.controls button {
  margin-right: 10px;
  padding: 5px 10px;
}
.info {
  margin-left: 15px;
  color: #666;
}
</style>
