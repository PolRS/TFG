<template>
  <div class="home">
    <header class="topbar">
      <div class="user-info">
        <img :src="user.avatar_url" alt="Profile" class="avatar" />
        <span>{{ user.nom }}</span>
      </div>
      <button class="logout" @click="$emit('logout')">Tanca sessió</button>
    </header>

    <main class="content">
      <div class="header-row">
        <h2>Les meves carpetes</h2>
        <button class="add-folder" @click="createFolderPrompt">
          + Nova carpeta
        </button>
      </div>

      <div class="folders">
        <div
          v-for="carpeta in carpetes"
          :key="carpeta.id"
          class="folder-card"
        >
          <span class="folder-name" @click="$emit('obreCarpeta', carpeta)">
            {{ carpeta.nom }}
          </span>

        <!-- 🔴 Botó eliminar carpeta -->
        <button
          class="delete-folder-btn"
          @click.stop="$emit('eliminaCarpeta', carpeta)"
        >
          🗑️
        </button>
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
}

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

.logout {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.content {
  padding: 2rem;
}

/* 🔹 Títol + botó a la mateixa línia */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* 🔹 Botó de crear carpeta */
.add-folder {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.add-folder:hover {
  background: #2563eb;
}

/* 🔹 Llista de carpetes */
.folders {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.folder-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-folder-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #dc2626;
}

.delete-folder-btn:hover {
  color: #ef4444;
}

</style>
