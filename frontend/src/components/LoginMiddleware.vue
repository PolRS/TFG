<template>
  <div>
    <LoginPage
      :loading="loading"
      @manualLogin="handleManualLogin"
    />
  </div>
</template>

<script>
import LoginPage from '@/base_components/LoginPage.vue';

export default {
  name: "LoginMiddleware",
  components: { LoginPage },
  data() {
    return {
      loading: false
    };
  },
  mounted() {
    const params = new URLSearchParams(window.location.search);
    const jwtToken = params.get("token");
    const skipAutoLogin = sessionStorage.getItem("skipAutoLogin");
    const storedToken = localStorage.getItem("token");

    // 1️⃣ Si ve del callback de Google
    if (jwtToken) {
      localStorage.setItem("token", jwtToken);
      this.$emit("loginSuccess", jwtToken);
      this.loading = true;
      sessionStorage.removeItem("skipAutoLogin");
      return;
    }

    // 2️⃣ Si hi ha token guardat i no hem fet logout recent
    if (storedToken && !skipAutoLogin) {
      this.$emit("loginSuccess", storedToken);
      this.loading = true;
    }

    // 3️⃣ Si hi havia flag de logout, l'esborrem
    if (skipAutoLogin) sessionStorage.removeItem("skipAutoLogin");
  },
  methods: {
    handleManualLogin(jwtToken) {
      localStorage.setItem("token", jwtToken);
      this.$emit("loginSuccess", jwtToken);
      sessionStorage.removeItem("skipAutoLogin");
      this.loading = false;
    }
  }
};
</script>
