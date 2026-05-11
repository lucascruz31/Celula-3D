<template>
  <div class="cell-page-container">
    <!-- Título flotante -->
    <div class="ui-overlay">
      <h1 class="title-glow">Célula Vegetal 3D</h1>
      <p class="subtitle-text">Haz clic en las etiquetas para explorar cada orgánulo</p>
    </div>
    <ClientOnly fallback-tag="span" fallback="Cargando modelo 3D...">
      <CellModel2 />
    </ClientOnly>
  </div>
</template>

<style scoped>
.cell-page-container {
  width: 100vw;
  height: 100vh;
  background-color: #0a0a0a;
  position: relative;
  overflow: hidden;
}

.main-title {
  position: absolute;
  top: 40px;
  left: 40px;
  color: white;
  pointer-events: none;
  border-bottom: 2px solid white;
  z-index: 10;
}
</style>
