<template>
  <div class="folder">

    <!-- TOPBAR (igual que HomePage) -->
    <header class="topbar">
      <div class="user-info">
        <img :src="user.avatar_url" alt="Profile" class="avatar" />
        <span>{{ user.nom }}</span>
      </div>

      <div class="topbar-actions">
        <button class="back-btn" @click="$emit('tancaCarpeta')">← Enrere</button>
        <button class="logout" @click="$emit('logout')">Tanca sessió</button>
      </div>
    </header>

    <!-- COS PRINCIPAL -->
    <div class="folder-view">
      <aside class="sidebar">
        <h2>{{ carpeta.nom }}</h2>

        <h3>Documents</h3>
        <ul class="doc-list">
          <li
            v-for="doc in documents"
            :key="doc.id"
            class="document-item"
            :class="{ selected: selectedDocuments.some(d => d.id === doc.id) }"
          >
            <label class="doc-label">
              <input 
                type="checkbox" 
                :checked="selectedDocuments.some(d => d.id === doc.id)"
                @change="$emit('toggleDocumentSelection', doc)"
              />
              <span class="doc-name">{{ doc.nom }}</span>
            </label>
            <button class="delete-btn" @click.stop="$emit('eliminaDocument', doc.id)">
              🗑️
            </button>
          </li>
        </ul>

        <input
          ref="fileInput"
          type="file"
          style="display:none"
          @change="$emit('uploadFile', $event)"
        />
        <button class="add-btn" @click="$refs.fileInput.click()">
          + Pujar document
        </button>
      </aside>

      <main class="chat-panel">
        <div v-if="selectedDocuments.length === 0" class="chat-placeholder">
          <h3>Xat</h3>
          <p>Selecciona un o més documents per començar el Xat</p>
        </div>
        <DocumentChat
          v-else
          :carpeta-id="carpeta.id"
          :document-ids="selectedDocuments.map(d => d.id)"
          :document-titles="selectedDocuments.map(d => d.nom)"
        />
      </main>

      <aside class="options-panel">
        <h3>Eines</h3>
        <ul>
          <li>📄 Resums</li>
          <li>📊 Diagrames</li>
          <li>📝 Notes</li>
        </ul>
      </aside>
    </div>

  </div>
</template>

<script>
import DocumentChat from "@/components/DocumentChat.vue"
export default {
  name: "FolderPage",
  components: {
    DocumentChat
  },
  props: {
    user: { type: Object, required: true },
    carpeta: { type: Object, required: true },
    documents: { type: Array, required: true },
    selectedDocuments: { type: Array, required: false, default: () => [] }
  }
};
</script>

<style scoped>
.folder {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 🔵 TOPBAR */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.back-btn {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.back-btn:hover {
  background-color: #4b5563;
}

.folder-view {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  flex: 1;
}

/* 🔵 Sidebar */
.sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1rem;
}

.doc-list {
  list-style: none; /* Remove bullets */
  padding: 0;
  margin: 0;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e2e8f0;
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s;
}

.document-item.selected {
  background: #cbd5e1; /* Slightly darker when selected */
  border: 1px solid #94a3b8;
}

.doc-label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  overflow: hidden; /* Handle long names */
}

.doc-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.delete-btn:hover {
  color: #ef4444;
}

.add-btn {
  margin-top: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

/* 🔵 Chat panel */
.chat-panel {
  padding: 1rem;
  border-right: 1px solid #e2e8f0;
}

.chat-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-align: center;
}

/* 🔵 Options panel */
.options-panel {
  background: #f9fafb;
  padding: 1rem;
  border-left: 1px solid #e2e8f0;
}
</style>
