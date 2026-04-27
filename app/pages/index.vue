<template>
  <v-model>
    <div class="page-wrapper">
      <div class="main-title text-h4 font-weight-bold">INICIO</div>
      <div class="content">
        <h1 class="text-h2 font-weight-bold mb-4">Proyecto Célula 3D</h1>
        <p class="text-h6">Explora la anatomía celular en un formato interactivo tridimensional.</p>
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
