<template>
  <FolderPage
    :carpeta="carpeta"
    :documents="documents"
    @addDocument="handleAddDocument"
    @openDocument="handleOpenDocument"
  />
</template>

<script>
import axios from "axios";
import FolderPage from "@/base_components/FolderPage.vue";

export default {
  name: "FolderMiddleware",
  components: { FolderPage },
  props: {
    user: { type: Object, required: true },
    carpeta: { type: Object, required: true }
  },
  data() {
    return { documents: [] };
  },
  async mounted() {
    await this.fetchDocuments();
  },
  methods: {
    async fetchDocuments() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/carpetes/${this.carpeta.id}/documents`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        this.documents = res.data.documents || [];
      } catch (err) {
        console.error("Error carregant documents:", err);
      }
    },
    async handleAddDocument() {
      const nom = prompt("Nom del document:");
      if (!nom) return;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/carpetes/${this.carpeta.id}/documents`,
          { nom },
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        this.documents.unshift(res.data.document);
      } catch (err) {
        console.error("Error creant document:", err);
      }
    }
  }
};
</script>
