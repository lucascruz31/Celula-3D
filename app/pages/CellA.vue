<template>
    <v-model>
      <div class="cell-wrapper">
        <div class="main-title text-h4 font-weight-bold">CÉLULA ANIMAL</div>
        <options />
      </div>
      <CellModel />
    </v-model>
</template>

<style scoped>
.cell-page-container {
  width: 100vw;
  height: 100vh;
  background-color: #0a0a0a;
  position: relative;
}

.main-title {
  position: absolute;
  top: 40px;
  left: 40px;
  color: white;
  pointer-events: none;
  border-bottom: 2px solid white;
}
.cell-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0a0a0a;
}
</style>
