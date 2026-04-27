<template>
  <div class="cell-wrapper">
    <div ref="canvasContainer" class="canvas-container"></div>
    <div class="main-title text-h4 font-weight-bold">CÉLULA ANIMAL COMPLETA</div>
    
    <div class="legend">
      <div class="legend-item"><span class="dot nucleus"></span> Núcleo</div>
      <div class="legend-item"><span class="dot er"></span> Retículo Endoplasmático</div>
      <div class="legend-item"><span class="dot golgi"></span> Aparato de Golgi</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const canvasContainer = ref(null);
let renderer, labelRenderer, scene, camera, controls, animationId;

// Función auxiliar para crear etiquetas
const createLabel = (text, position, color = '#00e5ff') => {
  const div = document.createElement('div');
  div.className = 'cell-label';
  div.textContent = text;
  div.style.borderLeftColor = color;
  
  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
};

const initThree = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a); 

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
  camera.position.set(0, 8, 15);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  canvasContainer.value.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(width, height);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  canvasContainer.value.appendChild(labelRenderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Iluminación mejorada para resaltar texturas
  const mainLight = new THREE.DirectionalLight(0xffffff, 2);
  mainLight.position.set(10, 10, 10);
  scene.add(mainLight);
  scene.add(new THREE.AmbientLight(0x404040, 4));

  // --- MODELADO DE ORGANELOS ---

  // 1. MEMBRANA
  const cellGeo = new THREE.SphereGeometry(7, 48, 48);
  const cellMat = new THREE.MeshPhongMaterial({ 
    color: 0x00e5ff, transparent: true, opacity: 0.15, shininess: 80 
  });
  const cell = new THREE.Mesh(cellGeo, cellMat);
  scene.add(cell);
  cell.add(createLabel('Membrana Plasmática', new THREE.Vector3(7.2, 0, 0)));

  // 2. NÚCLEO Y NUCLÉOLO
  const nucleusGroup = new THREE.Group();
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x9c27b0 })
  );
  const nucleolus = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x4a148c })
  );
  nucleolus.position.set(0.5, 0.5, 0.5);
  nucleusGroup.add(nucleus, nucleolus);
  scene.add(nucleusGroup);
  nucleusGroup.add(createLabel('Núcleo / Nucléolo', new THREE.Vector3(0, 2.5, 0), '#9c27b0'));

  // 3. RETÍCULO ENDOPLASMÁTICO (Representado por anillos distorsionados)
  const erGeo = new THREE.TorusGeometry(3, 0.2, 8, 50);
  const erMat = new THREE.MeshPhongMaterial({ color: 0x3f51b5, transparent: true, opacity: 0.7 });
  for(let i=1; i<=3; i++) {
    const erPart = new THREE.Mesh(erGeo, erMat);
    erPart.scale.set(1, 1, 0.3 * i);
    erPart.rotation.x = Math.PI / 2 + (i * 0.2);
    scene.add(erPart);
    if(i === 3) erPart.add(createLabel('Retículo Endoplasmático', new THREE.Vector3(0, 0, 3.5), '#3f51b5'));
  }

  // 4. APARATO DE GOLGI (Discos aplanados)
  const golgiGroup = new THREE.Group();
  const golgiGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.15, 32);
  const golgiMat = new THREE.MeshPhongMaterial({ color: 0x4caf50 });
  for(let i=0; i<4; i++) {
    const layer = new THREE.Mesh(golgiGeo, golgiMat);
    layer.position.y = i * 0.3;
    layer.scale.x = 1 - (i * 0.1);
    golgiGroup.add(layer);
  }
  golgiGroup.position.set(-4, 2, -2);
  golgiGroup.rotation.z = 0.5;
  scene.add(golgiGroup);
  golgiGroup.add(createLabel('Aparato de Golgi', new THREE.Vector3(0, 1.5, 0), '#4caf50'));

  // 5. MITOCONDRIAS
  const mitoGeo = new THREE.CapsuleGeometry(0.3, 0.7, 4, 12);
  const mitoMat = new THREE.MeshPhongMaterial({ color: 0xff5722 });
  [ [4, -2, 3], [-3, 4, 2], [2, 3, -4] ].forEach((pos, i) => {
    const mito = new THREE.Mesh(mitoGeo, mitoMat);
    mito.position.set(...pos);
    mito.rotation.set(Math.random(), Math.random(), 0);
    scene.add(mito);
    if(i === 0) mito.add(createLabel('Mitocondria', new THREE.Vector3(0.5, 1, 0), '#ff5722'));
  });

  // 6. LISOSOMAS (Esferas pequeñas amarillas)
  const lisoGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const lisoMat = new THREE.MeshPhongMaterial({ color: 0xffeb3b });
  for(let i=0; i<5; i++) {
    const liso = new THREE.Mesh(lisoGeo, lisoMat);
    liso.position.set(Math.random()*8-4, Math.random()*8-4, Math.random()*8-4);
    scene.add(liso);
    if(i === 0) liso.add(createLabel('Lisosoma', new THREE.Vector3(0.5, 0.5, 0), '#ffeb3b'));
  }

  // 7. CENTRIOLOS (Cilindros perpendiculares)
  const centrioloGroup = new THREE.Group();
  const cGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 12);
  const cMat = new THREE.MeshPhongMaterial({ color: 0x9e9e9e });
  const c1 = new THREE.Mesh(cGeo, cMat);
  const c2 = new THREE.Mesh(cGeo, cMat);
  c2.rotation.z = Math.PI / 2;
  c2.position.x = 0.4;
  centrioloGroup.add(c1, c2);
  centrioloGroup.position.set(2, 2, 2);
  scene.add(centrioloGroup);
  centrioloGroup.add(createLabel('Centriolos', new THREE.Vector3(1, 0, 0), '#9e9e9e'));

  // 8. RIBOSOMAS (Puntos diminutos)
  const riboGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const riboMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  for(let i=0; i<30; i++) {
    const ribo = new THREE.Mesh(riboGeo, riboMat);
    ribo.position.set(Math.random()*10-5, Math.random()*10-5, Math.random()*10-5);
    scene.add(ribo);
  }

  // --- ANIMACIÓN ---
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    scene.rotation.y += 0.001; // Rotación lenta de la escena
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
.cell-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #0a0a0a;
  overflow: hidden;
}

.canvas-container { width: 100%; height: 100%; }

.cell-label {
  color: white;
  font-family: sans-serif;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-left: 3px solid #fff;
  white-space: nowrap;
  pointer-events: none;
}

.main-title {
  position: absolute;
  top: 30px;
  left: 30px;
  color: white;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  pointer-events: none;
}

.legend {
  position: absolute;
  bottom: 30px;
  left: 30px;
  color: #aaa;
  font-size: 12px;
  pointer-events: none;
}

.legend-item { display: flex; align-items: center; margin-bottom: 5px; }
.dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; }
.nucleus { background: #9c27b0; }
.er { background: #3f51b5; }
.golgi { background: #4caf50; }
</style>