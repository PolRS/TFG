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
