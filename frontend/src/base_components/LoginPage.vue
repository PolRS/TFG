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
  background-color: var(--bg-color);
}

.login-card {
  background-color: var(--bg-secondary);
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  width: 26rem;
  text-align: center;
  border: 1px solid var(--border-color);
}

.login-card h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text-primary);
  letter-spacing: -0.025em;
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
