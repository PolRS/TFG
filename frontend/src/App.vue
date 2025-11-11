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
      @obreCarpeta="handleObreCarpeta"
    />
  </div>
</template>

<script>
import api from "@/api.js";
import HomeMiddleware from "./components/HomeMiddleware.vue";
import LoginMiddleware from "./components/LoginMiddleware.vue";

export default {
  name: "App",
  components: { LoginMiddleware, HomeMiddleware },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null,
      errorMessage: "",
    };
  },
  async mounted() {
    console.log("🟢 [App.vue] montat");
    await this.checkSession();
  },
  methods: {
    async checkSession() {
      try {
        console.log("🔍 [App.vue] comprovant token...");
        const res = await api.get("/auth/verify");
        if (res.data.valid) {
          console.log("✅ [App.vue] token vàlid");
          const userRes = await api.get("/auth/user");
          this.user = userRes.data.user;
          localStorage.setItem("user", JSON.stringify(userRes.data.user));
        } else {
          this.handleLogout(false);
        }
      } catch {
        console.warn("❌ Cap sessió activa o token invàlid.");
        this.handleLogout(false);
      }
    },

    handleLoginSuccess(user) {
      console.log("✅ [App.vue] loginSuccess:", user);
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
      this.errorMessage = "";
    },

    handleLoginError(msg) {
      this.errorMessage = msg;
    },

    handleObreCarpeta(carpeta) {
      console.log("📁 Obrint carpeta:", carpeta);
    },

    async handleLogout(server = true) {
      console.log("🚪 [App.vue] logout cridat");
      try {
        if (server) await api.post("/auth/logout"); // elimina cookies al backend
      } catch (err) {
        console.warn("Error tancant sessió:", err);
      } finally {
        localStorage.removeItem("user");
        this.user = null;
      }
    },
  },
};
</script>
