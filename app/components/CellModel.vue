<template>
  <div class="cell-wrapper">
    <div ref="canvasContainer" class="canvas-container"></div>
    
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// Importamos el renderizador de etiquetas CSS2D
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const canvasContainer = ref(null);
let renderer, labelRenderer, scene, camera, controls, animationId;

const createLabel = (text, position) => {
  const div = document.createElement('div');
  div.className = 'cell-label';
  div.textContent = text;
  
  const label = new CSS2DObject(div);
  label.position.set(position.x, position.y, position.z);
  return label;
};

const initThree = () => {
  // 1. Escena con fondo transparente o neutro
  scene = new THREE.Scene();
  // Puedes usar null para transparencia si el padre tiene color, 
  // o un gris muy oscuro para contraste.
  scene.background = new THREE.Color(0x0a0a0a); 

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
  camera.position.set(0, 5, 12);

  // 2. Renderizador WebGL (La Célula)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  canvasContainer.value.appendChild(renderer.domElement);

  // 3. Renderizador CSS2D (Las Etiquetas)
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(width, height);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none'; // Importante para que no bloquee los controles
  canvasContainer.value.appendChild(labelRenderer.domElement);

  // 4. Controles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 5. Luces
  const sunLight = new THREE.DirectionalLight(0xffffff, 2);
  sunLight.position.set(5, 10, 7);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x404040, 3));

  // --- MODELADO DE LA CÉLULA ---

  // Membrana
  const cellGeo = new THREE.SphereGeometry(5, 48, 48);
  const cellMat = new THREE.MeshPhongMaterial({ 
    color: 0x00e5ff, 
    transparent: true, 
    opacity: 0.2,
    shininess: 100 
  });
  const cell = new THREE.Mesh(cellGeo, cellMat);
  scene.add(cell);
  cell.add(createLabel('Membrana Plasmática', new THREE.Vector3(5.5, 0, 0)));

  // Núcleo
  const nucleusGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const nucleusMat = new THREE.MeshPhongMaterial({ color: 0xe91e63 });
  const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
  scene.add(nucleus);
  nucleus.add(createLabel('Núcleo', new THREE.Vector3(0, 2, 0)));

  // Mitocondrias (Ejemplo de varias con una sola etiqueta)
  const mitoGeo = new THREE.CapsuleGeometry(0.3, 0.6, 4, 12);
  const mitoMat = new THREE.MeshPhongMaterial({ color: 0xff9800 });
  
  for(let i = 0; i < 4; i++) {
    const mito = new THREE.Mesh(mitoGeo, mitoMat);
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
    );
    mito.position.copy(pos);
    mito.rotation.set(Math.random(), Math.random(), 0);
    scene.add(mito);
    
    if(i === 0) mito.add(createLabel('Mitocondria', new THREE.Vector3(0.5, 0.5, 0)));
  }

  // 6. Animación
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    
    // Rotación lenta general
    scene.rotation.y += 0.001;
    
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  animate();
};

const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
};

onMounted(() => {
  initThree();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
});
</script>

<style>
/* Estilos para las etiquetas (HTML puro) */
.cell-label {
  color: white;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  font-size: 14px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  border-left: 3px solid #00e5ff;
  pointer-events: none;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cell-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0a0a0a;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.main-title {
  position: absolute;
  top: 40px;
  left: 40px;
  color: white;
  pointer-events: none;
  border-bottom: 2px solid white;
}
</style>