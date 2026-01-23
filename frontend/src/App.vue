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
<style>
:root {
  --bg-color: #0f172a;
  --bg-secondary: #1e293b;
  --bg-sidebar: #0f172a;
  --bg-item: #1e293b;
  --bg-item-hover: #334155;
  --bg-item-selected: rgba(59, 130, 246, 0.15);
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-accent: #3b82f6;
  
  --border-color: #334155;
  --border-accent: #3b82f6;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
