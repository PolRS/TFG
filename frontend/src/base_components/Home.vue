<template>
  <div id="homeWrapper">
    <h1>Benvingut, usuari!</h1>

    <div class="userActions">
      <button @click="$emit('logout')">Tancar sessió</button>
      <!-- Aquí més botons o accions de l'usuari -->
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  props: {
    token: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
#homeWrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: var(--screen-height);
  width: var(--screen-width);
  color: white;
  background-color: #222;
}
.userActions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
button {
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #357ae8;
}
</style>
