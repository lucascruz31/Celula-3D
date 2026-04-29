<template>
  <div class="cell-wrapper">
    <div ref="canvasContainer" class="canvas-container"></div>
    
    <div class="ui-overlay">
      <h1 class="text-h4 font-weight-bold mb-1">CÉLULA ANIMAL INTERACTIVA</h1>
      <p class="text-caption text-grey-lighten-1">Haz clic en las etiquetas para ver los conceptos</p>
    </div>

    <v-dialog v-model="dialog" max-width="500" transition="dialog-bottom-transition">
      <v-card class="rounded-xl border-sm">
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title class="text-button">{{ info.title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        </v-toolbar>
        
        <v-card-text class="text-body-1 pa-6">
          {{ info.description }}
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" color="primary" @click="dialog = false">Entendido</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="legend-box">
      <div class="legend-item"><span class="dot nucleus"></span> Núcleo/Nucléolo</div>
      <div class="legend-item"><span class="dot energy"></span> Mitocondrias</div>
      <div class="legend-item"><span class="dot synthesis"></span> Síntesis y Transporte</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, reactive } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

// --- ESTADOS Y DATOS ---
const dialog = ref(false);
const info = reactive({ title: '', description: '' });
const canvasContainer = ref(null);

let renderer, labelRenderer, scene, camera, controls, animationId;

const concepts = {
  'Membrana Plasmática': 'Capa bicapa lipídica que delimita toda la célula, regulando el paso de sustancias y manteniendo el equilibrio entre el interior y el exterior.',
  'Núcleo': 'Orgánulo central que contiene el ADN. Es el "cerebro" que dicta las instrucciones para el funcionamiento y reproducción celular.',
  'Nucléolo': 'Región densa dentro del núcleo encargada de la biosíntesis de ribosomas.',
  'Mitocondria': 'Orgánulo donde se produce la respiración celular y se genera el ATP (energía química) necesario para la vida.',
  'Retículo Endoplasmático': 'Extensa red de canales que sintetizan proteínas (Rugoso) y lípidos (Liso), además de transportar sustancias.',
  'Aparato de Golgi': 'Actúa como una oficina de correos: procesa, empaqueta y distribuye proteínas y lípidos producidos en el retículo.',
  'Lisosoma': 'Vesículas que contienen enzimas digestivas; se encargan de reciclar materiales y digerir desechos o invasores.',
  'Centriolos': 'Estructuras cilíndricas que organizan los microtúbulos y son vitales durante la división celular o mitosis.',
  'Ribosomas': 'Pequeños complejos de ARN y proteínas donde se lleva a cabo la traducción y síntesis de nuevas proteínas.'
};

const openInfo = (name) => {
  info.title = name;
  info.description = concepts[name];
  dialog.value = true;
};

// --- CONSTRUCCIÓN DEL ESCENARIO ---
const createLabel = (text, position, color) => {
  const div = document.createElement('div');
  div.className = 'interactive-label';
  div.innerHTML = `<span>${text}</span>`;
  div.style.borderLeft = `4px solid ${color}`;
  div.onclick = () => openInfo(text);
  
  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
};

const initThree = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 18);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvasContainer.value.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = 'label-overlay-layer';
  canvasContainer.value.appendChild(labelRenderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Luces
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const spot = new THREE.SpotLight(0xffffff, 2);
  spot.position.set(20, 20, 20);
  scene.add(spot);

  // --- TODOS LOS ORGANELOS (MODELADO) ---

  // 1. Membrana
  const membrane = new THREE.Mesh(
    new THREE.SphereGeometry(8, 64, 64),
    new THREE.MeshPhongMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.1, shininess: 50 })
  );
  scene.add(membrane);
  membrane.add(createLabel('Membrana Plasmática', new THREE.Vector3(8.5, 0, 0), '#00e5ff'));

  // 2. Núcleo y Nucléolo
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x9c27b0 })
  );
  scene.add(nucleus);
  nucleus.add(createLabel('Núcleo', new THREE.Vector3(0, 3, 0), '#9c27b0'));

  const nucleolus = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x4a148c })
  );
  nucleolus.position.set(0.8, 0.8, 0.8);
  nucleus.add(nucleolus);
  nucleolus.add(createLabel('Nucléolo', new THREE.Vector3(1, 0, 0), '#ba68c8'));

  // 3. Retículo Endoplasmático (RE)
  for(let i=1; i<=3; i++) {
    const er = new THREE.Mesh(
      new THREE.TorusGeometry(3.5, 0.15, 8, 40),
      new THREE.MeshPhongMaterial({ color: 0x3f51b5, transparent: true, opacity: 0.6 })
    );
    er.rotation.x = Math.PI/2 + (i*0.15);
    er.scale.set(1, 1, 0.2*i);
    scene.add(er);
    if(i===3) er.add(createLabel('Retículo Endoplasmático', new THREE.Vector3(0, 0, 4), '#3f51b5'));
  }

  // 4. Aparato de Golgi
  const golgiGroup = new THREE.Group();
  for(let i=0; i<5; i++) {
    const layer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8 - i*0.1, 1.8 - i*0.1, 0.2, 32),
      new THREE.MeshPhongMaterial({ color: 0x4caf50 })
    );
    layer.position.y = i * 0.35;
    golgiGroup.add(layer);
  }
  golgiGroup.position.set(-4.5, 2.5, -2);
  golgiGroup.rotation.z = 0.6;
  scene.add(golgiGroup);
  golgiGroup.add(createLabel('Aparato de Golgi', new THREE.Vector3(0, 2, 0), '#4caf50'));

  // 5. Mitocondrias (3 unidades)
  const mitoGeo = new THREE.CapsuleGeometry(0.35, 0.8, 4, 16);
  const mitoMat = new THREE.MeshPhongMaterial({ color: 0xff5722 });
  const mitoPos = [[5,-3,2], [-2,5,3], [1,4,-5]];
  mitoPos.forEach((p, index) => {
    const m = new THREE.Mesh(mitoGeo, mitoMat);
    m.position.set(...p);
    m.rotation.set(Math.random(), Math.random(), 0);
    scene.add(m);
    if(index === 0) m.add(createLabel('Mitocondria', new THREE.Vector3(1, 1, 0), '#ff5722'));
  });

  // 6. Lisosomas
  const lisoGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const lisoMat = new THREE.MeshPhongMaterial({ color: 0xffeb3b });
  for(let i=0; i<4; i++) {
    const l = new THREE.Mesh(lisoGeo, lisoMat);
    l.position.set(Math.random()*10-5, Math.random()*10-5, Math.random()*10-5);
    scene.add(l);
    if(i === 0) l.add(createLabel('Lisosoma', new THREE.Vector3(0.5, 0.5, 0), '#fdd835'));
  }

  // 7. Centriolos
  const centriolos = new THREE.Group();
  const cMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 12), new THREE.MeshPhongMaterial({color: 0x757575}));
  const c2 = cMesh.clone();
  c2.rotation.z = Math.PI/2;
  c2.position.set(0.5, 0, 0);
  centriolos.add(cMesh, c2);
  centriolos.position.set(3, 4, 1);
  scene.add(centriolos);
  centriolos.add(createLabel('Centriolos', new THREE.Vector3(1, 1, 0), '#9e9e9e'));

  // 8. Ribosomas (Muchos puntos pequeños)
  const riboGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const riboMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  for(let i=0; i<40; i++) {
    const r = new THREE.Mesh(riboGeo, riboMat);
    r.position.set((Math.random()-0.5)*12, (Math.random()-0.5)*12, (Math.random()-0.5)*12);
    scene.add(r);
  }

  // Animación
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    scene.rotation.y += 0.001; 
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };
  animate();
};

onMounted(() => {
  initThree();
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  if(renderer) renderer.dispose();
});
</script>

<style>
.cell-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle, #1a1a1a 0%, #050505 100%);
  overflow: hidden;
}

.canvas-container { width: 100%; height: 100%; }

/* Capa de etiquetas: no bloquea rotación, pero permite clics en hijos */
.label-overlay-layer {
  position: absolute;
  top: 0;
  pointer-events: none;
}

.interactive-label {
  pointer-events: auto; /* IMPORTANTE: Habilita el clic */
  cursor: pointer;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 12px;
  font-family: 'Roboto', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  transition: all 0.3s ease;
  user-select: none;
}

.interactive-label:hover {
  background: #ffffff;
  color: #000;
  transform: scale(1.15) translateX(5px);
}

.ui-overlay {
  position: absolute;
  top: 40px;
  left: 40px;
  color: white;
  pointer-events: none;
}

.legend-box {
  position: absolute;
  bottom: 40px;
  right: 40px;
  background: rgba(255,255,255,0.05);
  padding: 15px;
  border-radius: 12px;
  color: #888;
  font-size: 11px;
  pointer-events: none;
}

.legend-item { display: flex; align-items: center; margin: 4px 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; }
.nucleus { background: #9c27b0; }
.energy { background: #ff5722; }
.synthesis { background: #3f51b5; }
</style>