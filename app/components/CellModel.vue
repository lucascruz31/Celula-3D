<template>
  <v-container fluid class="pa-0">
    <v-card class="mx-auto mt-5" max-width="800" elevation="10">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Visualizador 3D: Célula Animal</v-toolbar-title>
      </v-toolbar>

      <div ref="canvasContainer" class="canvas-container"></div>

      <v-card-text class="text-center bg-grey-darken-4">
        <v-chip color="secondary" class="ma-2">Núcleo</v-chip>
        <v-chip color="orange" class="ma-2">Mitocondrias</v-chip>
        <v-chip color="cyan" class="ma-2">Membrana</v-chip>
        <p class="text-caption mt-2 text-white">Usa el mouse para rotar y zoom</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const canvasContainer = ref(null);
let renderer, scene, camera, controls, animationId;

const initThree = () => {
  // 1. Escena y Cámara
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121212);

  const width = canvasContainer.value.clientWidth;
  const height = 500; // Altura fija para el visor

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 8;

  // 2. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  canvasContainer.value.appendChild(renderer.domElement);

  // 3. Controles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 4. Luces
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(5, 5, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040, 2));

  // 5. Organelos
  // Membrana (Esfera exterior)
  const cellGeo = new THREE.SphereGeometry(4, 32, 32);
  const cellMat = new THREE.MeshPhongMaterial({ 
    color: 0x00bcd4, 
    transparent: true, 
    opacity: 0.25 
  });
  const cell = new THREE.Mesh(cellGeo, cellMat);
  scene.add(cell);

  // Núcleo
  const nucleusGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const nucleusMat = new THREE.MeshPhongMaterial({ color: 0x9c27b0 });
  const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
  scene.add(nucleus);

  // Mitocondrias (Generación aleatoria)
  const createMito = () => {
    const geo = new THREE.CapsuleGeometry(0.2, 0.5, 4, 8);
    const mat = new THREE.MeshPhongMaterial({ color: 0xff5722 });
    const mito = new THREE.Mesh(geo, mat);
    mito.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );
    scene.add(mito);
  };

  for(let i=0; i<6; i++) createMito();

  // 6. Loop de Animación
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    cell.rotation.y += 0.002;
    renderer.render(scene, camera);
  };

  animate();
};

// Manejo del redimensionamiento
const handleResize = () => {
  if (!canvasContainer.value) return;
  const width = canvasContainer.value.clientWidth;
  const height = 500;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

onMounted(() => {
  initThree();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  cancelAnimationFrame(animationId);
  renderer.dispose();
});
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 500px;
  cursor: grab;
}
.canvas-container:active {
  cursor: grabbing;
}
</style>