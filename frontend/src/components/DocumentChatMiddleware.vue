<template>
  <DocumentChatPage
    :messages="messages"
    :loading="loading"
    :error="error"
    :document-titles="documentTitles"
    @sendMessage="handleSendMessage"
  />
</template>

<script>
import api from "@/api.js";
import DocumentChatPage from "@/base_components/DocumentChatPage.vue";

export default {
  name: "DocumentChatMiddleware",
  components: { DocumentChatPage },
  props: {
    carpetaId: { type: Number, required: true },
    documentIds: { type: Array, required: true },
    documentTitles: { type: Array, default: () => [] }
  },
  data() {
    return {
      messages: [],
      error: "",
      loading: false
    };
  },
  watch: {
    carpetaId: {
      immediate: true,
      handler() {
        this.loadHistory();
      }
    }
  },
  mounted() {
    this.loadHistory();
  },
  methods: {
    async loadHistory() {
      // Reset state before loading
      this.error = "";
      this.messages = [];

      try {
        const res = await api.get("/chat/history", {
          params: { carpetaId: this.carpetaId }
        });
        this.messages = res.data.messages || [];
      } catch (err) {
        console.error("Error carregant historial:", err);
        this.error = err.response?.data?.error || "No s'ha pogut carregar l'historial";
      }
    },
    async handleSendMessage(text) {
      // Optimistic update to show user message immediately
      this.messages.push({
        role: "user",
        content: text,
        created_at: new Date().toISOString()
      });

      this.loading = true;
      this.error = "";

      try {
        const res = await api.post("/chat/query", {
          carpetaId: this.carpetaId,
          documentIds: this.documentIds,
          message: text
        });

        this.messages.push({
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources || [],
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error consultant el document:", err);
        this.error = err.response?.data?.error || "Error consultant el document";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
