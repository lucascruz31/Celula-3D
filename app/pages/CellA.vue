<template>
  <div class="cell-page-container">
    <div class="main-title text-h4 font-weight-bold">CÉLULA ANIMAL</div>
    <ClientOnly fallback-tag="span" fallback="Cargando modelo 3D...">
      <CellModel />
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
