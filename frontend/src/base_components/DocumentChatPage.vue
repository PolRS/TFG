<template>
  <div class="doc-chat">
    <div class="chat-header">
      <h2>{{ titleDisplay }}</h2>
      <div class="subtitle" v-if="documentTitles.length > 1">
          <small>{{ documentTitles.join(', ') }}</small>
      </div>
    </div>

    <div class="messages" ref="messageContainer">
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
                {{ s.nom }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Thinking indicator -->
      <div v-if="loading" class="message assistant thinking">
        <div class="bubble">
          <span class="role-label">IA</span>
          <p class="content thinking-text">Pensant...</p>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="question"
        placeholder="Escriu una pregunta sobre el document..."
        rows="1"
        @keydown="handleKeydown"
        :disabled="loading"
      ></textarea>

      <button :disabled="loading || !question.trim()" @click="sendQuestion" class="send-btn">
        <span v-if="!loading">Preguntar</span>
        <span v-else class="spinner-btn"></span>
      </button>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
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
    watch: {
        messages: {
            handler() {
                this.scrollToBottom();
            },
            deep: true
        },
        loading(newVal) {
            if (newVal) {
                this.scrollToBottom();
            }
        }
    },
    methods: {
        sendQuestion() {
            if (!this.question.trim() || this.loading) return;
            this.$emit('sendMessage', this.question);
            this.question = "";
        },
        handleKeydown(e) {
            if (e.key === "Enter") {
                if (e.shiftKey) return;
                e.preventDefault();
                this.sendQuestion();
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messageContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        }
    }
}
</script>

<style scoped>
.doc-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  min-height: 0;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.chat-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--bg-sidebar);
}

.message {
  display: flex;
  width: 100%;
}

.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }

.bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.5;
}

.message.user .bubble {
  background: var(--text-accent);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.message.assistant .bubble {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.role-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 4px;
  opacity: 0.7;
}

.content {
  margin: 0;
  white-space: pre-wrap;
}

.thinking-text {
  font-style: italic;
  color: var(--text-secondary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.sources {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  font-size: 0.8rem;
}

.sources-title {
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
  display: block;
}

.sources-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sources-list li {
  background: var(--bg-item-hover);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--text-primary);
}

.input-area {
  padding: 1.25rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

textarea {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-primary);
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  min-height: 48px;
  max-height: 150px;
}

textarea:focus {
  outline: none;
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.send-btn {
  background: var(--text-accent);
  color: white;
  border: none;
  width: 100px;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: var(--bg-item-hover);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.spinner-btn {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-msg {
  padding: 0 1.25rem 1.25rem;
  margin: 0;
  color: #fb7185;
  font-size: 0.85rem;
  text-align: center;
}
</style>
