import {createApp} from 'vue'
import App from './App.vue'
import {store} from "@/store";
import mitt from 'mitt'

const emitter = mitt()
const app = createApp(App)
app.use(store)
app.config.globalProperties.emitter = emitter
app.mount('#app')
