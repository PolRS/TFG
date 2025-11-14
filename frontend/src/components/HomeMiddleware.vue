<template>
  <div>
    <HomePage
      :user="user"
      :carpetes="carpetes"
      @creaCarpeta="handleCreaCarpeta"
      @obreCarpeta="obreCarpeta"
      @eliminaCarpeta="eliminaCarpeta"
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

    async handleCreaCarpeta(nom) {
      if (!nom) return;
      try {
        const res = await api.post("/home", { nom });
        this.carpetes.unshift(res.data.carpeta);
      } catch (err) {
        console.error("Error creant carpeta:", err);
      }
    },

    obreCarpeta(carpeta) {
      this.$emit("obreCarpeta", carpeta);
    },

    async eliminaCarpeta(carpeta) {
      if (!confirm(`Vols eliminar la carpeta "${carpeta.nom}"?`)) return;

      try {
        await api.delete(`/home/${carpeta.id}`);
        this.carpetes = this.carpetes.filter(c => c.id !== carpeta.id);
      } catch (err) {
        console.error("Error eliminant carpeta:", err);
      }
    }
  }
};
</script>
