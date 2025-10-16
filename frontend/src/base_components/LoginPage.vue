<template>
  <div id="loginWrapper">
    <div class="loginBox">
      <h1>Inicia sessió</h1>
      <a :href="googleLoginUrl" class="loginButton">Login amb Google</a>
      <p v-if="loading">Redirigint...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      googleLoginUrl: "http://localhost:3000/auth/google"
    };
  }
};
</script>

<style scoped>
#loginWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--screen-height);
  width: var(--screen-width);
}
.loginBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #222;
  padding: 40px;
  border-radius: 8px;
  color: white;
}
.loginButton {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
