<!--
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
-->

<template>
  <div>
    <LoginPage
      :errorMessage="errorMessage"
      @onGoogleLogin="handleGoogleLogin"
    />
  </div>
</template>

<script>
import axios from "axios";
import LoginPage from "@/base_components/LoginPage.vue";

export default {
  name: "LoginMiddleware",
  components: { LoginPage },
  data() {
    return {
      errorMessage: ""
    };
  },
  mounted() {
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      })
    })
  },
  methods: {
    async handleGoogleLogin() {
      try {
        const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`;
        window.location.href = googleAuthUrl;
      } catch (err) {
        console.error('Error iniciant sessió amb Google:', err);
        this.$emit('onLoginError', 'Error iniciant sessió amb Google');
      }
    },
    async handleOAuthCallback(code) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/google/callback`,
          { code }
        );
        const { access_token, refresh_token, user } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        this.$emit("onLoginSuccess", user);
      } catch (err) {
        console.error('Error validant credencials:', err);
        this.$emit("onLoginError", "Error validant credencials amb Google.");
      }
    }
  }
};
</script>

