<template>
  <FolderPage
    :user="user"
    :carpeta="carpeta"
    :documents="documents"
    :selectedDocuments="selectedDocuments"
    @logout="$emit('logout')"
    @tancaCarpeta="$emit('tancaCarpeta')"
    @uploadFile="handleUploadFile"
    @eliminaDocument="handleEliminaDocument"
    @toggleDocumentSelection="handleToggleDocumentSelection"
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
    return {
      documents: [],
      selectedDocuments: []
    };
  },
  async mounted() {
    await this.fetchDocuments();
  },
  methods: {
    async fetchDocuments() {
      try {
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
        // Also remove from selection if present
        this.selectedDocuments = this.selectedDocuments.filter(d => d.id !== documentId);
      } catch (err) {
        console.error("Error eliminant document:", err);
      }
    },

    handleToggleDocumentSelection(doc) {
      const index = this.selectedDocuments.findIndex(d => d.id === doc.id);
      if (index >= 0) {
        this.selectedDocuments.splice(index, 1);
      } else {
        this.selectedDocuments.push(doc);
      }
    }
  }
};
</script>
