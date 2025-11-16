<template>
  <div id="app">
    <LoginMiddleware
      v-if="!user"
      @onLoginSuccess="handleLoginSuccess"
      @onLoginError="handleLoginError"
    />

    <HomeMiddleware
      v-else-if="user && !carpetaSeleccionada"
      :user="user"
      @logout="handleLogout"
      @obreCarpeta="handleObreCarpeta"
      @tancaCarpeta="carpetaSeleccionada = null"
    />
    <FolderMiddleware
      v-else-if="user && carpetaSeleccionada"
      :user="user"
      :carpeta="carpetaSeleccionada"
      @tancaCarpeta="handleTancaCarpeta"
      @logout="handleLogout"
    />
  </div>
</template>

<script>
import api from "@/api.js";
import HomeMiddleware from "./components/HomeMiddleware.vue";
import LoginMiddleware from "./components/LoginMiddleware.vue";
import FolderMiddleware from "./components/FolderMiddleware.vue";

export default {
  name: "App",
  components: {
    LoginMiddleware,
    HomeMiddleware,
    FolderMiddleware
   },
  data() {
    return {
      user: null,
      carpetaSeleccionada: null,
      errorMessage: "",
    };
  },
  async mounted() {
    await this.checkSession();
  },
  methods: {
    async checkSession() {
      try {
        console.log("[App.vue] comprovant token...");
        const res = await api.get("/auth/verify");
        if (res.data.valid) {
          console.log("[App.vue] token vàlid");
          const userRes = await api.get("/auth/user");
          this.user = userRes.data.user;
        } else {
          this.handleLogout(false);
        }
      } catch {
        console.warn("Cap sessió activa o token invàlid.");
        this.handleLogout(false);
      }
    },

    handleLoginSuccess(user) {
      console.log("[App.vue] loginSuccess:", user);
      this.user = user;
      this.errorMessage = "";
    },

    handleLoginError(msg) {
      this.errorMessage = msg;
    },
    async handleLogout(server = true) {
      try {
        if (server)
          await api.post("/auth/logout");
      } catch (err) {
        console.warn("Error tancant sessió:", err);
      } finally {
        this.user = null;
      }
    },

    handleObreCarpeta(carpeta) {
      this.carpetaSeleccionada = carpeta;
    },

    handleTancaCarpeta() {
      this.carpetaSeleccionada = null;
    }
  },
};
</script>
