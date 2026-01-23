<template>
  <div class="home">
    <header class="topbar">
      <div class="user-info">
        <img :src="user.avatar_url" alt="Profile" class="avatar" />
        <span class="user-name">{{ user.nom }}</span>
      </div>
      <button class="logout-btn" @click="$emit('logout')">Tanca sessió</button>
    </header>

    <main class="content">
      <div class="header-row">
        <h1>Les meves carpetes</h1>
        <button class="add-folder-btn" @click="createFolderPrompt">
          <span class="plus-icon">+</span> Nova carpeta
        </button>
      </div>

      <div class="folders-grid">
        <div
          v-for="carpeta in carpetes"
          :key="carpeta.id"
          class="folder-card"
          @click="$emit('obreCarpeta', carpeta)"
        >
          <div class="folder-icon-wrapper">
            <span class="folder-icon">📁</span>
          </div>
          <div class="folder-info">
            <span class="folder-name">{{ carpeta.nom }}</span>
            <span class="folder-stats">{{ carpeta.docCount ?? 0 }} documents</span>
          </div>

          <button
            class="delete-folder-btn"
            @click.stop="$emit('eliminaCarpeta', carpeta)"
            title="Eliminar carpeta"
          >
            🗑️
          </button>
        </div>
        
        <!-- Empty state helper -->
        <div v-if="carpetes.length === 0" class="empty-state">
          <span class="empty-icon">📂</span>
          <p>Encara no tens cap carpeta. Crea'n una per començar!</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  props: {
    user: { type: Object, required: true },
    carpetes: { type: Array, required: true }
  },
  methods: {
    createFolderPrompt() {
      const name = prompt("Nom de la nova carpeta:");
      if (name && name.trim() !== "") {
        this.$emit("creaCarpeta", name.trim());
      }
    }
  }
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.logout-btn {
  background-color: rgba(225, 29, 72, 0.1);
  color: #fb7185;
  border: 1px solid rgba(225, 29, 72, 0.2);
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: rgba(225, 29, 72, 0.2);
  border-color: rgba(225, 29, 72, 0.3);
}

.content {
  flex: 1;
  padding: 3rem 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.header-row h1 {
  font-size: 1.875rem;
  color: var(--text-primary);
  font-weight: 700;
  margin: 0;
}

.add-folder-btn {
  background: var(--text-accent);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-folder-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.plus-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.folder-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.folder-card:hover {
  border-color: var(--border-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.3);
}

.folder-icon-wrapper {
  width: 48px;
  height: 48px;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: background-color 0.2s;
}

.folder-card:hover .folder-icon-wrapper {
  background-color: rgba(59, 130, 246, 0.2);
}

.folder-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.folder-name {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.folder-stats {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.delete-folder-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0;
  transition: all 0.2s;
  padding: 8px;
  border-radius: 8px;
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--text-secondary);
}

.folder-card:hover .delete-folder-btn {
  opacity: 0.4;
}

.delete-folder-btn:hover {
  opacity: 1 !important;
  background-color: rgba(225, 29, 72, 0.1);
  color: #fb7185;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  color: var(--text-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

@media (max-width: 640px) {
  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .add-folder-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
