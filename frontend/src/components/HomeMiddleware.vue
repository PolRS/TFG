<template>
  <div>
    <HomePage
      :user="user"
      :carpetes="carpetes"
      @creaCarpeta="handleCreaCarpeta"
      @obreCarpeta="obreCarpeta"
      @logout="$emit('logout')"
    />
  </div>
</template>

<script>
import api from "@/api.js";
import HomePage from "@/base_components/HomePage.vue";

export default {
  name: "HomeMiddleware",
  components: { HomePage },
  props: {
    user: { type: Object, required: true }
  },
  data() {
    return {
      carpetes: []
    };
  },
  async mounted() {
    console.log("🔴 [HomeMiddleware] montat");
    await this.fetchCarpetes();
  },
  methods: {
    async fetchCarpetes() {
      try {
        const res = await api.get("/home"); // usa api.js que ja afegeix el token
        this.carpetes = res.data.carpetes || [];
      } catch (err) {
        console.error("Error carregant carpetes:", err);
      }
    },

    // 🔹 Crear una carpeta nova
    async handleCreaCarpeta(nom) {
      if (!nom) return;
      try {
        const res = await api.post("/home", { nom });
        this.carpetes.unshift(res.data.carpeta);
      } catch (err) {
        console.error("Error creant carpeta:", err);
      }
    },

    // 🔹 Obrir carpeta
    obreCarpeta(carpeta) {
      this.$emit("obreCarpeta", carpeta);
    }
  }
};
</script>
