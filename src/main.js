import './assets/main.css'

import { createApp } from 'vue'
import App from './layouts/App.vue'


// Check if config was loaded
if (!window.config || !window.config.apiUrl) {
  console.error("❌ config.js was not loaded correctly!");
}

const app = createApp(App);


// Pass the URL as a global variable (e.g., using provide/inject)
app.provide('apiUrl', window.config.apiUrl);

app.config.globalProperties.$apiUrl = window.config.apiUrl

app.mount('#app');
