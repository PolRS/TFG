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

          <!-- Fonts -->
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

<script>
export default {
    name: "DocumentChatPage",
    props: {
        messages: { type: Array, default: () => [] },
        loading: { type: Boolean, default: false },
        error: { type: String, default: "" },
        documentTitles: { type: Array, default: () => [] }
    },
    data() {
        return {
            question: ""
        };
    },
    computed: {
        titleDisplay() {
            if (this.documentTitles.length === 1) return this.documentTitles[0];
            return `${this.documentTitles.length} documents`;
        }
    },
    methods: {
        sendQuestion() {
            if (!this.question.trim()) return;
            this.$emit('sendMessage', this.question);
            this.question = "";
        },
        handleKeydown(e) {
            if (e.key === "Enter") {
                if (e.shiftKey) return;
                e.preventDefault();
                this.sendQuestion();
            }
        }
    }
}
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
