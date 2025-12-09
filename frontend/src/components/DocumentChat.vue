<template>
  <div class="doc-chat">

    <h2>Consultant: {{ documentTitle }}</h2>

    <textarea
      v-model="question"
      placeholder="Escriu una pregunta sobre el document..."
      rows="3"
    ></textarea>

    <button :disabled="loading || !question.trim()" @click="sendQuestion">
      {{ loading ? "Consultant..." : "Preguntar" }}
    </button>

    <div v-if="answer" class="answer-box">
      <h3>Resposta:</h3>
      <p>{{ answer }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "@/api.js";

const props = defineProps({
  documentId: Number,
  documentTitle: String
});

const question = ref("");
const answer   = ref("");
const error    = ref("");
const loading  = ref(false);

async function sendQuestion() {
  loading.value = true;
  error.value = "";
  answer.value = "";

  try {
    const res = await api.post("/chat/query", {
      documentId: props.documentId,
      message: question.value
    });

    answer.value = res.data.answer;
  } catch (err) {
    error.value = err.response?.data?.error || "Error consultant el document";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.doc-chat {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
textarea {
  width: 100%;
  padding: 8px;
}
.answer-box {
  background: #eee;
  padding: 10px;
  border-radius: 6px;
}
.error {
  color: red;
}
</style>
