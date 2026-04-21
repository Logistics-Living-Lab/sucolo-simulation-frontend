import './assets/main.css'

import { createApp } from 'vue'
import App from './layouts/App.vue'

if (!window.config || !window.config.apiUrl) {
  console.error("❌ config.js was not loaded correctly!");
}

const app = createApp(App);

app.provide('apiUrl', window.config.apiUrl);

app.config.globalProperties.$apiUrl = window.config.apiUrl

app.mount('#app');
