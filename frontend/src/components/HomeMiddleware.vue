<template>
  <div>
    <HomePage
      :user="user"
      :carpetes="carpetes"
      @creaCarpeta="handleCreaCarpeta"
      @logout="$emit('logout')"
    />
  </div>
</template>

<script>
import axios from "axios"
import HomePage from '@/base_components/HomePage.vue';

export default {
  name: "HomeMiddleware",
  components: { HomePage },
  props: {
    user: { type: Object, required: true }
  },
  data() {
    return {
      carpetes: []
    }
  },
  async mounted() {
    await this.fetchCarpetes()
  },
  methods: {
    async fetchCarpetes() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/home`, {
          headers: { Authorization: `Bearer ${this.user.token}` }
        });
        this.carpetes = res.data.carpetes || []
      } catch (err) {
        console.error("Error carregant carpetes:", err)
      }
    },
    async handleCreaCarpeta(nom) {
      if (!nom) return

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/home`,
          { nom },
          { headers: { Authorization: `Bearer ${this.user.token}` } }
        )
        this.folders.unshift(res.data.carpeta)
      } catch (err) {
        console.error("Error creant carpeta:", err)
      }
    }
  }
};
</script>
