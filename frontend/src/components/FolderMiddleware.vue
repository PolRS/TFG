<template>
  <FolderPage
    :carpeta="carpeta"
    :documents="documents"
    @uploadFile="handleUploadFile"
    @eliminaDocument="handleEliminaDocument"
  />
</template>

<script>
import api from "@/api.js";
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
        // 🟢 ara no cal posar headers, api ja afegeix el token automàticament
        const res = await api.get(`/carpeta/${this.carpeta.id}`);
        this.documents = res.data.documents || [];
      } catch (err) {
        console.error("Error carregant documents:", err);
      }
    },

    async handleUploadFile(event) {
      const fitxer = event.target.files[0];
      if (!fitxer) return;

      const formData = new FormData();
      formData.append("fitxer", fitxer);

      try {
        const res = await api.post(`/carpeta/${this.carpeta.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.documents.unshift(res.data.document);
      } catch (err) {
        console.error("Error pujant document:", err);
      }
    },

    async handleEliminaDocument(documentId) {
      if (!confirm("Segur que vols eliminar aquest document?")) return;

      try {
        await api.delete(`/carpeta/${this.carpeta.id}/${documentId}`);
        this.documents = this.documents.filter(d => d.id !== documentId);
      } catch (err) {
        console.error("Error eliminant document:", err);
      }
    }
  }
};
</script>
