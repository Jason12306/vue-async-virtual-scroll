<template>
  <div>
    <h2>虚拟滚动测试集合</h2>
    <div class="nav">
      <button v-for="(item, idx) in tests" :key="item.name" @click="current = idx">
        {{ item.title }}
      </button>
    </div>
    <component :is="tests[current].comp" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import BaseFixedTest from './examples/BaseFixedTest.vue'
import BaseTest from './examples/BaseTest.vue'
import DynamicDataTest from './examples/DynamicDataTest.vue'
import VariableHeightTest from './examples/VariableHeightTest.vue'
import DisabledTest from './examples/DisabledTest.vue'
import PerformanceTest from './examples/PerformanceTest.vue'
import DialogTest from './examples/DialogTest.vue'

const STORAGE_KEY = 'vue-virtual-scroll-current'

const tests = [
  { name: 'BaseFixedTest', title: '基础固定长列表', comp: BaseFixedTest },
  { name: 'BaseTest', title: '基础长列表', comp: BaseTest },
  { name: 'DynamicDataTest', title: '动态数据', comp: DynamicDataTest },
  { name: 'VariableHeightTest', title: '可变高度 TODO', comp: VariableHeightTest },
  { name: 'DisabledTest', title: '禁用状态', comp: DisabledTest },
  { name: 'PerformanceTest', title: '性能极限', comp: PerformanceTest },
  { name: 'DialogTest', title: 'Dialog弹窗', comp: DialogTest },
]

const current = ref(0)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) {
    const idx = parseInt(saved, 10)
    if (!isNaN(idx) && idx >= 0 && idx < tests.length) {
      current.value = idx
    }
  }
})

watch(current, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
})
</script>

<style scoped>
.nav {
  margin-bottom: 16px;
}
.nav button {
  margin-right: 8px;
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: #f7f7f7;
  cursor: pointer;
  border-radius: 4px;
}
.nav button:focus {
  outline: none;
  border-color: #409eff;
}
</style>
