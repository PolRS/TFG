<template>
  <div class="folder-view">
    <!-- Panell esquerra -->
    <aside class="sidebar">
      <h3>Documents</h3>
      <ul>
        <li v-for="doc in documents" :key="doc.id" @click="$emit('openDocument', doc)">
          {{ doc.nom }}
        </li>
      </ul>
      <button @click="$emit('addDocument')">+ Afegeix document</button>
    </aside>

    <!-- Cos central -->
    <main class="chat-panel">
      <div class="chat-placeholder">
        <h3>Xat amb IA</h3>
        <p>Aquí es mostrarà la conversa i les respostes sobre els documents.</p>
      </div>
    </main>

    <!-- Panell dret -->
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

.chat-panel {
  display: flex;
  justify-content: center;
  align-items: center;
}

.options-panel {
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
  padding: 1rem;
}
</style>
