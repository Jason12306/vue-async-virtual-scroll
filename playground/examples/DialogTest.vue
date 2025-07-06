<template>
  <div>
    <button @click="show = true">打开 Dialog</button>
    <div v-show="show" class="dialog-mask" @click.self="show = false">
      <div class="dialog">
        <div class="dialog-header">
          <span>虚拟滚动 Dialog 测试</span>
          <button class="close-btn" @click="show = false">×</button>
        </div>
        <div class="dialog-body">
          <OptimizeScroll
            v-model="show"
            :data="items"
            :min-item-size="40"
            :buffer="[80, 80]"
            data-uid="data-uid1"
          >
            <template v-slot="{ item, dataUid }">
              <div :data-uid1="dataUid" class="list-item">{{ item.id }}. {{ item.text }}</div>
            </template>
          </OptimizeScroll>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)
const items = ref([])

for (let i = 1; i <= 500; i++) {
  items.value.push({
    id: i,
    text: `Dialog 项目 ${i}`,
  })
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  background: #fff;
  border-radius: 6px;
  width: 500px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.dialog-header {
  padding: 12px 20px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.dialog-body {
  padding: 0;
  height: 80vh;
  overflow: auto;
}
.list-item {
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  box-sizing: border-box;
}
</style>
