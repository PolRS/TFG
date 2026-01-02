<template>
  <div class="doc-chat">
    <h2>Consultant: {{ titleDisplay }}</h2>
    <div class="subtitle" v-if="documentTitles.length > 1">
        <small>{{ documentTitles.join(', ') }}</small>
    </div>

    <div class="messages">
      <div
        v-for="(msg, index) in messages"
        :key="msg.id ?? index"
        :class="['message', msg.role]"
      >
        <div class="bubble">
          <span class="role-label">
            {{ msg.role === "user" ? "Tu" : "IA" }}
          </span>

          <p class="content">{{ msg.content }}</p>

          <!-- Fonts (només per missatges d'assistent) -->
          <div
            v-if="msg.role === 'assistant' && msg.sources && msg.sources.length"
            class="sources"
          >
            <span class="sources-title">Fonts:</span>
            <ul class="sources-list">
              <li v-for="(s, i) in msg.sources" :key="i">
                {{ s.nom }} (id: {{ s.documentId }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="question"
        placeholder="Escriu una pregunta sobre el document..."
        rows="3"
        @keydown="handleKeydown"
      ></textarea>

      <button :disabled="loading || !question.trim()" @click="sendQuestion">
        {{ loading ? "Consultant..." : "Preguntar" }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import api from "@/api.js";

const props = defineProps({
  carpetaId: { type: Number, required: true },
  documentIds: { type: Array, required: true }, // Array of numbers
  documentTitles: { type: Array, default: () => [] }
});

const question = ref("");
const messages = ref([]);
const error = ref("");
const loading = ref(false);

const titleDisplay = computed(() => {
    if (props.documentTitles.length === 1) return props.documentTitles[0];
    return `${props.documentTitles.length} documents`;
});

async function loadHistory() {
  error.value = "";
  // History is per folder, so we just load it.
  // Ideally we might want to filter history by selected docs, 
  // but current backend returns all messages for the folder.
  // We'll keep it simple as per plan.
  
  // NOTE: If we switch documents, we might want to clear local messages if they are not from history?
  // But since history is global for folder, it's fine.
  
  messages.value = [];

  try {
    const res = await api.get("/chat/history", {
      params: { carpetaId: props.carpetaId }
    });
    messages.value = res.data.messages || [];
  } catch (err) {
    console.error("Error carregant historial:", err);
    error.value = err.response?.data?.error || "No s'ha pogut carregar l'historial";
  }
}

async function sendQuestion() {
  if (!question.value.trim()) return;

  const text = question.value;

  // UX: afegim el missatge localment
  messages.value.push({
    role: "user",
    content: text,
    created_at: new Date().toISOString()
  });

  question.value = "";
  loading.value = true;
  error.value = "";

  try {
    const res = await api.post("/chat/query", {
      carpetaId: props.carpetaId,
      documentIds: props.documentIds,
      message: text
    });

    messages.value.push({
      role: "assistant",
      content: res.data.answer,
      sources: res.data.sources || [],
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error consultant el document:", err);
    error.value = err.response?.data?.error || "Error consultant el document";
  } finally {
    loading.value = false;
  }
}

function handleKeydown(e) {
  if (e.key === "Enter") {
    if (e.shiftKey) return;
    e.preventDefault();
    sendQuestion();
  }
}

onMounted(() => loadHistory());

watch(
  () => props.carpetaId,
  () => loadHistory()
);

// If selected documents change, we don't necessarily need to reload history 
// (since it's folder based), but maybe we want to visual cues?
// For now, no action needed on doc change other than reactive props.
</script>

<style scoped>
.doc-chat {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.message {
  display: flex;
  margin-bottom: 8px;
}

.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }

.bubble {
  max-width: 75%;
  padding: 8px 10px;
  border-radius: 12px;
}

.message.user .bubble {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 2px;
}

.message.assistant .bubble {
  background: #e5e7eb;
  border-bottom-left-radius: 2px;
}

.role-label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
  margin-bottom: 2px;
}

.content {
  margin: 0;
  white-space: pre-wrap;
}

.sources {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(0,0,0,0.1);
  font-size: 0.85rem;
}

.sources-title {
  font-weight: 600;
  display: inline-block;
  margin-bottom: 4px;
}

.sources-list {
  margin: 0;
  padding-left: 18px;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

textarea {
  width: 100%;
  padding: 8px;
  resize: vertical;
}

button {
  align-self: flex-end;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button[disabled] {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
