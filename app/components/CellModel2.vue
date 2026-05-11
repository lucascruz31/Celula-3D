<template>
  <div class="cell-wrapper">
    <div ref="canvasContainer" class="canvas-container"></div>


    <!-- Leyenda inferior -->
    <div class="legend-box">
      <div class="legend-title">Leyenda</div>
      <div class="legend-item"><span class="dot nucleus"></span>Núcleo / Nucleolo</div>
      <div class="legend-item"><span class="dot chloroplast"></span>Cloroplasto</div>
      <div class="legend-item"><span class="dot vacuole"></span>Vacuola</div>
      <div class="legend-item"><span class="dot energy"></span>Mitocondrias</div>
      <div class="legend-item"><span class="dot cell-wall"></span>Pared celular</div>
    </div>

    <v-dialog v-model="dialog" max-width="520" transition="dialog-bottom-transition">
      <v-card class="dialog-card rounded-xl">
        <div class="dialog-accent" :style="{ background: dialogColor }"></div>
        <v-toolbar color="transparent" density="compact" flat>
          <v-toolbar-title class="text-button dialog-title-text">{{ info.title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
        </v-toolbar>
        
        <v-card-text class="text-body-1 pa-6 dialog-body">
          {{ info.description }}
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="tonal" color="primary" rounded="lg" @click="dialog = false">Entendido</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, reactive } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const dialog = ref(false);
const info = reactive({ title: '', description: '' });
const dialogColor = ref('#00e5ff');
const canvasContainer = ref(null);

let renderer, labelRenderer, scene, camera, controls, animationId;
let animatedObjects = [];

const concepts = {
  'Pared celular': 'Confiere forma y rigidez a la célula. Contiene celulosa.',
  'Membrana celular': 'Capa de proteína y grasa que envuelve, da forma y protege a la célula.',
  'Núcleo': 'Principal orgánulo y que caracteriza a las células eucariotas. Realiza dos funciones principales: contiene el ADN que transmite la herencia de las células y dirige las actividades de la célula. Se encuentra protegido por la membrana nuclear.',
  'Nucleolo': 'Región densa en el interior del Núcleo que produce y ensambla el ARN.',
  'Vacuola': 'Depósito temporal de alimento y sustancias de desecho. De gran tamaño en la célula vegetal.',
  'Cloroplasto': 'Contiene la clorofila que proporciona el color verdoso a las plantas. Almacena energía solar y produce ATP y glúcidos.',
  'Retículo endoplasmático liso y rugoso': 'Sintetizan y transportan grandes cantidades de sustancias. El rugoso tiene ribosomas adheridos.',
  'Aparato o complejo de Golgi': 'Se encarga, entre otras cosas, de la modificación, compactación y envío de gran número de diversas macromoléculas necesarias para la vida, por ejemplo, las proteínas.',
  'Mitocondrias': 'Son centrales energéticas en las que se degradan moléculas como la glucosa y así obtener energía para las actividades de la célula. Estas moléculas se almacenan como ATP.',
  'Lisosomas': 'Degradan proteínas y lípidos en componentes más sencillos. Aquí es donde la digestión de los nutrientes celulares se lleva a cabo. Son producidas en el Complejo o Aparato de Golgi.',
  'Centriolos': 'Son estructuras que forman parte del citoesqueleto, similares a cilindros huecos, que intervienen en la división celular.',
  'Ribosomas': 'Orgánulos muy abundantes que ayudan a sintetizar las proteínas.',
  'Plasmodesmos': 'Conductos que permiten el intercambio entre células vegetales.'
};

const conceptColors = {
  'Pared celular': '#2e7d32',
  'Membrana celular': '#00e5ff',
  'Núcleo': '#9c27b0',
  'Nucleolo': '#ba68c8',
  'Vacuola': '#4fc3f7',
  'Cloroplasto': '#4caf50',
  'Retículo endoplasmático liso y rugoso': '#3f51b5',
  'Aparato o complejo de Golgi': '#ff9800',
  'Mitocondrias': '#ff5722',
  'Lisosomas': '#fdd835',
  'Centriolos': '#9e9e9e',
  'Ribosomas': '#ffffff',
  'Plasmodesmos': '#81c784'
};

const openInfo = (name) => {
  info.title = name;
  info.description = concepts[name];
  dialogColor.value = conceptColors[name] || '#00e5ff';
  dialog.value = true;
};

const createLabelWithPointer = (text, targetPos, labelPos, color) => {
  const group = new THREE.Group();

  const div = document.createElement('div');
  div.className = 'interactive-label';
  div.innerHTML = `<span>${text}</span>`;
  div.style.setProperty('--label-color', color);
  div.style.borderLeft = `3px solid ${color}`;
  div.onclick = () => openInfo(text);
  
  const label = new CSS2DObject(div);
  label.position.copy(labelPos);
  group.add(label);

  const points = [targetPos, labelPos];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineDashedMaterial({ 
    color: color, 
    transparent: true, 
    opacity: 0.35,
    dashSize: 0.4,
    gapSize: 0.2,
  });
  const line = new THREE.Line(lineGeo, lineMat);
  line.computeLineDistances();
  group.add(line);

  const dotGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: color });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.copy(targetPos);
  group.add(dot);

  return group;
};

const createStarField = () => {
  const count = 600;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 80;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x334466,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
};

const createCytoplasmParticles = () => {
  const count = 150;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x88ffaa, // Un tono ligeramente más verdoso para la célula vegetal
    size: 0.05,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
};

const initThree = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030810);
  scene.fog = new THREE.FogExp2(0x030810, 0.012);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  canvasContainer.value.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = 'label-overlay-layer';
  canvasContainer.value.appendChild(labelRenderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 10;
  controls.maxDistance = 45;
  controls.autoRotate = false;

  scene.add(new THREE.AmbientLight(0x223344, 1.8));
  
  const keyLight = new THREE.DirectionalLight(0xeef4ff, 1.6);
  keyLight.position.set(15, 20, 15);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x6688cc, 0.5);
  fillLight.position.set(-15, 5, -10);
  scene.add(fillLight);

  const pLight1 = new THREE.PointLight(0x00aaff, 0.6, 40);
  pLight1.position.set(10, -5, 8);
  scene.add(pLight1);

  const pLight2 = new THREE.PointLight(0x4caf50, 0.4, 40); // Luz verdosa
  pLight2.position.set(-10, 8, -5);
  scene.add(pLight2);

  scene.add(createStarField());
  const cytoplasm = createCytoplasmParticles();
  scene.add(cytoplasm);

  // --- MODELADO Y ETIQUETADO EXTERIOR (Célula Vegetal) ---

  // 1. Pared Celular (Prisma Hexagonal)
  const wallGroup = new THREE.Group();
  const wallGeo = new THREE.CylinderGeometry(10, 10, 10, 6);
  const wallMat = new THREE.MeshPhysicalMaterial({
    color: 0x2e7d32,
    transparent: true,
    opacity: 0.12,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wallGroup.add(wall);

  const wallWire = new THREE.Mesh(
    new THREE.CylinderGeometry(10.1, 10.1, 10.1, 6),
    new THREE.MeshBasicMaterial({
      color: 0x4caf50,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
  );
  wallGroup.add(wallWire);
  scene.add(wallGroup);
  scene.add(createLabelWithPointer('Pared celular', new THREE.Vector3(10, 0, 0), new THREE.Vector3(14, -2, 0), '#2e7d32'));

  // 2. Membrana celular
  const membrane = new THREE.Mesh(
    new THREE.CylinderGeometry(9.7, 9.7, 9.8, 6),
    new THREE.MeshPhysicalMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
    })
  );
  scene.add(membrane);
  scene.add(createLabelWithPointer('Membrana celular', new THREE.Vector3(8.4, 2, -4.8), new THREE.Vector3(12, 6, -6), '#00e5ff'));

  // 3. Vacuola Central (Grande)
  const vacuole = new THREE.Mesh(
    new THREE.SphereGeometry(3.8, 48, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })
  );
  vacuole.scale.set(1.2, 0.9, 1.1);
  vacuole.position.set(-2, 1, 2);
  scene.add(vacuole);
  animatedObjects.push({ mesh: vacuole, type: 'pulse', base: 1.0, amp: 0.015, speed: 1.0 });
  scene.add(createLabelWithPointer('Vacuola', new THREE.Vector3(-2, 4, 2), new THREE.Vector3(-6, 10, 4), '#4fc3f7'));

  // 4. Núcleo y Nucleolo
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 48, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0x9c27b0,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x3a0050,
      emissiveIntensity: 0.4,
    })
  );
  nucleus.position.set(3.5, -1, -2.5);
  scene.add(nucleus);
  animatedObjects.push({ mesh: nucleus, type: 'pulse', base: 1.0, amp: 0.02, speed: 1.5 });
  scene.add(createLabelWithPointer('Núcleo', new THREE.Vector3(3.5, 1.2, -2.5), new THREE.Vector3(7, 8, -6), '#9c27b0'));

  const nucleolus = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x4a148c,
      emissive: 0x2a0060,
      emissiveIntensity: 0.6,
      roughness: 0.4,
    })
  );
  nucleolus.position.set(0.7, 0.7, 0.7);
  nucleus.add(nucleolus);
  scene.add(createLabelWithPointer('Nucleolo', new THREE.Vector3(4.2, -0.3, -1.8), new THREE.Vector3(9, 4, -2), '#ba68c8'));

  // 5. Retículo endoplasmático liso y rugoso
  for(let i=1; i<=3; i++) {
    const er = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.15, 12, 60),
      new THREE.MeshPhysicalMaterial({
        color: 0x3f51b5,
        transparent: true,
        opacity: 0.55,
        roughness: 0.5,
        emissive: 0x1a237e,
        emissiveIntensity: 0.25,
      })
    );
    er.position.copy(nucleus.position);
    er.rotation.x = Math.PI/2 + (i*0.2);
    er.scale.set(1, 1, 0.2*i);
    scene.add(er);
  }
  scene.add(createLabelWithPointer('Retículo endoplasmático liso y rugoso', new THREE.Vector3(3.5, -1, 0.5), new THREE.Vector3(8, -8, 2), '#3f51b5'));

  // 6. Cloroplastos
  const chloroGeo = new THREE.CapsuleGeometry(0.7, 1.2, 16, 16);
  const chloroMat = new THREE.MeshPhysicalMaterial({
    color: 0x4caf50,
    roughness: 0.4,
    emissive: 0x1b5e20,
    emissiveIntensity: 0.3,
  });
  const chloroPositions = [[-4, -2, -3], [5, 2, 3], [1, -3, 5], [-5, 3, 0]];
  chloroPositions.forEach((p, idx) => {
    const c = new THREE.Mesh(chloroGeo, chloroMat);
    c.scale.set(1, 0.5, 1);
    c.position.set(...p);
    c.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    scene.add(c);
    animatedObjects.push({ mesh: c, type: 'float', axis: 'y', amp: 0.1, speed: 0.5 + idx * 0.2, offset: idx });
  });
  scene.add(createLabelWithPointer('Cloroplasto', new THREE.Vector3(-4, -2, -3), new THREE.Vector3(-10, -5, -6), '#4caf50'));

  // 7. Aparato o complejo de Golgi
  const golgiGroup = new THREE.Group();
  for(let i=0; i<5; i++) {
    const layer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6 - i*0.1, 1.6 - i*0.1, 0.2, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xff9800,
        roughness: 0.4,
        metalness: 0.15,
        emissive: 0x824b00,
        emissiveIntensity: 0.2,
      })
    );
    layer.position.y = i * 0.3;
    golgiGroup.add(layer);
  }
  golgiGroup.position.set(-2.5, -3, -1);
  golgiGroup.rotation.z = Math.PI/4;
  scene.add(golgiGroup);
  scene.add(createLabelWithPointer('Aparato o complejo de Golgi', new THREE.Vector3(-2.5, -3, -1), new THREE.Vector3(-10, -10, -2), '#ff9800'));

  // 8. Mitocondrias
  const mitoGeo = new THREE.CapsuleGeometry(0.35, 0.8, 8, 16);
  const mitoMat = new THREE.MeshPhysicalMaterial({
    color: 0xff5722,
    roughness: 0.3,
    emissive: 0x7f1800,
    emissiveIntensity: 0.5,
  });
  const mitoPos = [[2, -3, 4], [-6, -1, 3], [1, 3, -4]];
  mitoPos.forEach((p, idx) => {
    const m = new THREE.Mesh(mitoGeo, mitoMat);
    m.position.set(...p);
    m.rotation.set(idx * 0.5, idx * 0.3, 0);
    scene.add(m);
    animatedObjects.push({ mesh: m, type: 'float', axis: 'y', amp: 0.15, speed: 0.8 + idx * 0.2, offset: idx });
  });
  scene.add(createLabelWithPointer('Mitocondrias', new THREE.Vector3(2, -3, 4), new THREE.Vector3(6, -6, 6), '#ff5722'));

  // 9. Lisosomas
  const lisoGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const lisoMat = new THREE.MeshPhysicalMaterial({
    color: 0xfdd835,
    roughness: 0.3,
    emissive: 0x8a7400,
    emissiveIntensity: 0.4,
  });
  for(let i=0; i<3; i++) {
    const l = new THREE.Mesh(lisoGeo, lisoMat);
    const px = Math.random()*6-3;
    const py = Math.random()*4-2;
    const pz = Math.random()*6-3;
    l.position.set(px, py, pz);
    scene.add(l);
    animatedObjects.push({ mesh: l, type: 'float', axis: 'y', amp: 0.1, speed: 1.0, offset: i * 1.5 });
    if(i===0) {
      scene.add(createLabelWithPointer('Lisosomas', new THREE.Vector3(px, py, pz), new THREE.Vector3(px+4, py+4, pz+4), '#fdd835'));
    }
  }

  // 10. Centriolos
  const centriolos = new THREE.Group();
  const cMat = new THREE.MeshPhysicalMaterial({ color: 0x90a4ae, roughness: 0.4, metalness: 0.5 });
  const cMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 12), cMat);
  const c2 = cMesh.clone();
  c2.rotation.z = Math.PI/2;
  c2.position.set(0.5, 0, 0);
  centriolos.add(cMesh, c2);
  centriolos.position.set(-1, -4, 2.5);
  scene.add(centriolos);
  scene.add(createLabelWithPointer('Centriolos', new THREE.Vector3(-1, -4, 2.5), new THREE.Vector3(-4, -8, 5), '#9e9e9e'));

  // 11. Ribosomas
  const riboGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const riboMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for(let i=0; i<50; i++) {
    const r = new THREE.Mesh(riboGeo, riboMat);
    r.position.set((Math.random()-0.5)*14, (Math.random()-0.5)*8, (Math.random()-0.5)*14);
    scene.add(r);
  }
  scene.add(createLabelWithPointer('Ribosomas', new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, -12, -4), '#ffffff'));

  // 12. Plasmodesmos
  const plasmoGroup = new THREE.Group();
  const pGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
  const pMat = new THREE.MeshBasicMaterial({ color: 0x81c784 });
  for(let i=0; i<3; i++) {
    const p = new THREE.Mesh(pGeo, pMat);
    p.rotation.z = Math.PI/2;
    p.position.set(9.8, -2 + i*2, 2);
    plasmoGroup.add(p);
  }
  scene.add(plasmoGroup);
  scene.add(createLabelWithPointer('Plasmodesmos', new THREE.Vector3(9.8, 0, 2), new THREE.Vector3(14, 2, 4), '#81c784'));

  // --- ANIMACIÓN ---
  const clock = new THREE.Clock();

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    controls.update();
    scene.rotation.y += 0.0008;

    animatedObjects.forEach((obj) => {
      if (obj.type === 'pulse') {
        const s = obj.base + Math.sin(elapsed * obj.speed) * obj.amp;
        obj.mesh.scale.set(s, s, s);
      }
      if (obj.type === 'float') {
        const delta = Math.sin(elapsed * obj.speed + obj.offset) * obj.amp;
        if (obj.axis === 'y') obj.mesh.position.y += delta * 0.01;
      }
    });

    cytoplasm.rotation.y = elapsed * 0.03;
    cytoplasm.rotation.x = Math.sin(elapsed * 0.01) * 0.1;

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };
  animate();
};

onMounted(() => {
  initThree();
  window.addEventListener('resize', onResize);
});

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
};

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
  if(renderer) renderer.dispose();
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.cell-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 40% 50%, #0a1628 0%, #030810 70%);
  overflow: hidden;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.canvas-container { width: 100%; height: 100%; }

.label-overlay-layer {
  position: absolute;
  top: 0;
  pointer-events: none;
}

.interactive-label {
  pointer-events: auto;
  cursor: pointer;
  background: rgba(6, 12, 24, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.92);
  padding: 5px 14px;
  font-family: 'Inter', 'Roboto', sans-serif;
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  white-space: nowrap;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.interactive-label:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #0a0a0a;
  transform: scale(1.12) translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 200, 255, 0.2);
}

.ui-overlay {
  position: absolute;
  top: 80px;
  left: 36px;
  color: white;
  pointer-events: none;
  z-index: 10;
}

.title-glow {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 0 30px rgba(0, 180, 255, 0.35), 0 0 60px rgba(0, 100, 255, 0.15);
  margin: 0;
}

.subtitle-text {
  font-size: 12px;
  font-weight: 400;
  color: rgba(180, 200, 230, 0.55);
  margin-top: 6px;
  letter-spacing: 0.5px;
}

.legend-box {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(6, 14, 30, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(180, 200, 230, 0.7);
  font-size: 11px;
  pointer-events: none;
  z-index: 10;
}

.legend-title {
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}
.nucleus { background: #9c27b0; box-shadow: 0 0 6px rgba(156, 39, 176, 0.5); }
.chloroplast { background: #4caf50; box-shadow: 0 0 6px rgba(76, 175, 80, 0.5); }
.vacuole { background: #4fc3f7; box-shadow: 0 0 6px rgba(79, 195, 247, 0.5); }
.energy { background: #ff5722; box-shadow: 0 0 6px rgba(255, 87, 34, 0.5); }
.cell-wall { background: #2e7d32; box-shadow: 0 0 6px rgba(46, 125, 50, 0.5); }

.dialog-card {
  background: rgba(10, 18, 36, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  overflow: hidden;
}

.dialog-accent {
  height: 3px;
  width: 100%;
}

.dialog-title-text {
  color: rgba(255, 255, 255, 0.9) !important;
  letter-spacing: 1px;
}

.dialog-body {
  color: rgba(190, 210, 240, 0.8) !important;
  line-height: 1.7 !important;
  font-size: 14px !important;
}
</style>
