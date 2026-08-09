import { createModal } from '@kolirt/vue-modal'
import { createApp } from 'vue'
import App from './App.vue'
import './style.less'

createApp(App)
  .use(createModal({ groups: { default: {} } }))
  .mount('#app')
