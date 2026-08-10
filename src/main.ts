import { createModal } from '@kolirt/vue-modal'
import { createApp } from 'vue'
import App from './App.vue'
import { setup } from './firebase'
import './style.less'

createApp(App)
  .use(createModal({ groups: { default: {} } }))
  .use({
    install() {
      setup()
    }
  })
  .mount('#app')
