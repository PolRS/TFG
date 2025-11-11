<template>
  <div>
    <LoginPage
      :errorMessage="errorMessage"
      @onGoogleLogin="handleGoogleLogin"
    />
  </div>
</template>

<script>
import api from "@/api.js";
import LoginPage from "@/base_components/LoginPage.vue";

export default {
  name: "LoginMiddleware",
  components: { LoginPage },
  data() {
    return { errorMessage: "" };
  },

  async mounted() {
    console.log("🟡 [LoginMiddleware] montat");
    try {
      //Comprovem si hi ha sessió vàlida (cookie)
      const res = await api.get("/auth/verify");
      if (res.data.valid) {
        console.log("✅ [LoginMiddleware] sessió vàlida, carregant usuari...")
        const userRes = await api.get("/auth/user");
        this.$emit("onLoginSuccess", userRes.data.user);
        return
      }
    } catch(err) {
      console.log("⚠️ [LoginMiddleware] error verificant sessió:", err.message)
      // No fem res, només mostrem el botó de login
    }
  },

  methods: {
    async handleGoogleLogin() {
      try {
        console.log("🔵 [LoginMiddleware] iniciant flux OAuth...");
        // 🔗 Redirigeix al backend (que alhora redirigeix a Google)
        const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`;
        window.location.href = googleAuthUrl;
      } catch (err) {
        console.error("Error iniciant sessió amb Google:", err);
        this.$emit("onLoginError", "Error iniciant sessió amb Google");
      }
    }
  }
};
</script>
