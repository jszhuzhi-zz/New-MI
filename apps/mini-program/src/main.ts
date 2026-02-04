import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);

  // Install Pinia state management
  const pinia = createPinia();
  app.use(pinia);

  return {
    app,
    pinia,
  };
}
