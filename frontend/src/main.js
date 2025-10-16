import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import GSignInButton from 'vue-google-signin-button'

createApp(App)
  .use(router)
  .use(GSignInButton)
  .mount('#app');
