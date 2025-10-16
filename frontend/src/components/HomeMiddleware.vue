<template>
  <div>
    <HomePage :token="token" @logout="handleLogout" />
  </div>
</template>

<script>
import HomePage from '@/base_components/Home.vue';

export default {
  name: "HomeMiddleware",
  components: { HomePage },
  props: {
    token: String
  },
  methods: {
    handleLogout() {
      // 1️⃣ Esborrem el token
      localStorage.removeItem("token");
      sessionStorage.setItem("skipAutoLogin", "true"); // bloqueja login automàtic temporal

      // 2️⃣ Emetem l'esdeveniment al parent (App.vue)
      this.$emit("logout");
    }
  }
};
</script>
