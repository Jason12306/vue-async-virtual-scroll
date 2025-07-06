import { createApp } from 'vue'
import App from './App.vue'
import OptimizeScroll from '../src/components/AsyncVirtualScroll/AsyncVirtualScroll.vue'

const app = createApp(App)
app.component('OptimizeScroll', OptimizeScroll)
app.mount('#app')
