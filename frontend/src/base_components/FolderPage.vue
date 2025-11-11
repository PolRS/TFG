<template>
  <div class="folder-view">
    <aside class="sidebar">
      <h2>{{ carpeta.nom }}</h2>

      <h3>Documents</h3>
      <ul>
        <li v-for="doc in documents" :key="doc.id" class="document-item">
          <span class="doc-name" @click="$emit('openDocument', doc)">
            {{ doc.nom }}
          </span>
          <button class="delete-btn" @click="$emit('eliminaDocument', doc.id)">🗑️</button>
        </li>
      </ul>

      <input
        ref="fileInput"
        type="file"
        style="display:none"
        @change="$emit('uploadFile', $event)"
      />
      <button class="add-btn" @click="$refs.fileInput.click()">+ Pujar document</button>
    </aside>

    <main class="chat-panel">
      <div class="chat-placeholder">
        <h3>Xat amb IA</h3>
        <p>Aquí es mostrarà la conversa i les respostes sobre els documents.</p>
      </div>
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
</template>

<script>
export default {
  name: "FolderPage",
  props: {
    carpeta: { type: Object, required: true },
    documents: { type: Array, required: true }
  }
};
</script>

<style scoped>
.folder-view {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  height: 100vh;
}

.sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1rem;
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e2e8f0;
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 6px;
}

.doc-name {
  cursor: pointer;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s;
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
</style>
