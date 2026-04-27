<template>
  <v-model>
    <div class="page-wrapper">
      <div class="main-title text-h4 font-weight-bold">ACERCA DE</div>
      <div class="content">
        <h1 class="text-h3 font-weight-bold mb-4">Información</h1>
        <p class="text-body-1">Esta es una aplicación interactiva en 3D diseñada para la visualización de estructuras celulares, desarrollada con Vue 3 y Three.js.</p>
      </div>
      <options />
    </div>
  </v-model>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0a0a0a;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto', sans-serif;
}

.main-title {
  position: absolute;
  top: 40px;
  left: 40px;
  color: white;
  border-bottom: 2px solid white;
}

.content {
  text-align: center;
  max-width: 800px;
  padding: 30px;
  background: rgba(0, 0, 0, 0.6);
  border-left: 3px solid #00e5ff;
  border-radius: 4px;
}

.content h1 {
  color: #00e5ff;
}
</style>
