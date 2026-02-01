import { createApp } from 'vue'
import App from './App.vue'
import GSignInButton from 'vue-google-signin-button'

createApp(App)
  .use(GSignInButton)
  .mount('#app');
