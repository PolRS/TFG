<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Inicia sessió</h1>
      <button @click="$emit('onGoogleLogin')" class="google-button">

        Continua amb Google
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  props: {
    errorMessage: { type: String, default: "" }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f3f4f6;
}

.login-card {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 24rem;
  text-align: center;
}

.login-card h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: #4285f4;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.google-button:hover {
  background-color: #357ae8;
}

.google-logo {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 1rem;
}
</style>
