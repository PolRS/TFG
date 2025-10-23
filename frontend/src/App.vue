<!--
<template>
  <div id="app">
    <LoginMiddleware
      v-if="!token"
      :key="loginKey"
      @loginSuccess="handleLoginSuccess"
    />
    <HomeMiddleware
      v-else
      :token="token"
      @logout="handleLogout"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LoginMiddleware from '@/components/LoginMiddleware.vue';
import HomeMiddleware from '@/components/HomeMiddleware.vue';

const token = ref(localStorage.getItem("token") || null);
const loginKey = ref(Date.now()); // permet remuntar LoginMiddleware

function handleLoginSuccess(jwtToken) {
  token.value = jwtToken;
  localStorage.setItem("token", jwtToken);
  sessionStorage.removeItem("skipAutoLogin"); // permet login automàtic
}

function handleLogout() {
  token.value = null;
  sessionStorage.setItem("skipAutoLogin", "true"); // bloqueja login automàtic temporal
  loginKey.value = Date.now(); // remunta LoginMiddleware
}
</script>
-->

<template>
  <div id="app">
    <LoginMiddleware
      v-if="!user"
      @onLoginSuccess="handleLoginSuccess"
      @onLoginError="handleLoginError"
    />
    <HomeMiddleware
      v-else
      :user="user"
      @logout="handleLogout"
    />
  </div>

</template>

<script>
import HomeMiddleware from './components/HomeMiddleware.vue';
import LoginMiddleware from './components/LoginMiddleware.vue';

export default {
  name: 'App',
  components: {
    LoginMiddleware,
    HomeMiddleware
  },
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      errorMessage: ''
    }
  },
  methods: {
    handleLoginSuccess(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
      this.errorMessage = ''
    },
    handleLoginError(msg) {
      this.errorMessage = msg
    },
    handleLogout() {
      this.user = null
      localStorage.removeItem('user')
    }
  }
}
</script>

<style scoped>
#error-message {
  color: #ef4444;
  margin-top: 1rem;
  text-align: center;
}
</style>
