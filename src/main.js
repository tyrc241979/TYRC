import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

const storyboard = [
  {
    id: 'prep',
    title: '1. PPE and aseptic preparation',
    body: 'Start outside the sterile field: put on lab coat, gloves, eye protection, and disinfect work surfaces. This scene introduces the learner objective and safety constraints before handling cultures.',
    position: [-3.6, 1.35, -1.55],
    color: 0x67e8f9,
  },
  {
    id: 'cabinet',
    title: '2. Biosafety cabinet workflow',
    body: 'Keep materials in the clean-air zone, avoid crossing sterile and waste paths, and use slow deliberate hand movements. The glowing sash marks the safe viewing and working height.',
    position: [-1.25, 1.55, -3.25],
    color: 0x93c5fd,
  },
  {
    id: 'microscope',
    title: '3. Inspect cell morphology',
    body: 'Use the inverted microscope station to evaluate confluence, contamination indicators, and morphology before media change or passaging decisions.',
    position: [1.75, 1.2, -2.35],
    color: 0xc4b5fd,
  },
  {
    id: 'incubator',
    title: '4. Incubation and labeling',
    body: 'Return flasks to a humidified incubator and verify labels, date, cell line, passage number, medium, and operator initials for traceability.',
    position: [3.4, 1.45, -0.85],
    color: 0x86efac,
  },
  {
    id: 'waste',
    title: '5. Decontamination and waste exit',
    body: 'Dispose of biological waste correctly, disinfect reusable surfaces, and document the outcome. The final station can be adapted to your attached storyboard assessment step.',
    position: [-3.15, 1.2, 2.25],
    color: 0xfda4af,
  },
];

const panel = document.querySelector('#info-panel');
const panelTitle = document.querySelector('#panel-title');
const panelBody = document.querySelector('#panel-body');
document.querySelector('#close-panel').addEventListener('click', () => panel.classList.remove('visible'));
document.querySelector('#start-tour').addEventListener('click', () => showStory(storyboard[0]));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 8, 22);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.65, 5.8);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);

const ambient = new THREE.HemisphereLight(0xbfeeff, 0x152032, 1.4);
scene.add(ambient);
const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(-3, 6, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
scene.add(keyLight);

const floorTexture = makeGridTexture('#213247', '#32475f');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 10),
  new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.72, metalness: 0.08 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

createRoom();
createLabBenches();
createBiosafetyCabinet();
createMicroscope();
createIncubator();
createWasteStation();
createStoryboardWall();

const hotspots = storyboard.map(createHotspot);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const move = { forward: false, back: false, left: false, right: false };
let yaw = 0;
let pitch = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;

window.addEventListener('pointerdown', (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
});
window.addEventListener('pointerup', (event) => {
  dragging = false;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(hotspots, false)[0];
  if (hit) showStory(hit.object.userData.story);
});
window.addEventListener('pointermove', (event) => {
  if (!dragging || renderer.xr.isPresenting) return;
  yaw -= (event.clientX - lastX) * 0.004;
  pitch -= (event.clientY - lastY) * 0.003;
  pitch = THREE.MathUtils.clamp(pitch, -0.9, 0.9);
  rig.rotation.y = yaw;
  camera.rotation.x = pitch;
  lastX = event.clientX;
  lastY = event.clientY;
});
window.addEventListener('keydown', (event) => setMove(event.code, true));
window.addEventListener('keyup', (event) => setMove(event.code, false));
window.addEventListener('resize', onResize);

const controllerFactory = new XRControllerModelFactory();
for (let i = 0; i < 2; i += 1) {
  const controller = renderer.xr.getController(i);
  controller.addEventListener('selectstart', onVrSelect);
  scene.add(controller);

  const grip = renderer.xr.getControllerGrip(i);
  grip.add(controllerFactory.createControllerModel(grip));
  scene.add(grip);
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  updateMovement(delta);
  hotspots.forEach((hotspot, index) => {
    hotspot.rotation.y += delta * 0.9;
    hotspot.position.y = storyboard[index].position[1] + Math.sin(clock.elapsedTime * 2 + index) * 0.04;
  });
  renderer.render(scene, camera);
});

function showStory(story) {
  panelTitle.textContent = story.title;
  panelBody.textContent = story.body;
  panel.classList.add('visible');
}

function createRoom() {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd9e4ee, roughness: 0.58 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 3.6, 0.16), wallMat);
  backWall.position.set(0, 1.8, -5);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.6, 10), wallMat);
  leftWall.position.set(-6, 1.8, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = 6;
  scene.add(rightWall);

  for (let x = -4.5; x <= 4.5; x += 3) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.05, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xe9fbff, emissive: 0xaeefff, emissiveIntensity: 1.2 })
    );
    light.position.set(x, 3.35, -0.5);
    scene.add(light);
  }
}

function createLabBenches() {
  createBench(-3.1, -1.2, 0.95, 2.3);
  createBench(1.5, -1.55, 2.7, 1.1);
  createBench(-2.8, 2.2, 1.8, 0.9);
  addGlassware(-3.5, 0.95, -1.25);
  addPipettes(0.65, 0.95, -1.65);
}

function createBench(x, z, width, depth) {
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.12, depth),
    new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.35, metalness: 0.1 })
  );
  top.position.set(x, 0.86, z);
  top.castShadow = top.receiveShadow = true;
  scene.add(top);
  for (const dx of [-width / 2 + 0.12, width / 2 - 0.12]) {
    for (const dz of [-depth / 2 + 0.12, depth / 2 - 0.12]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.86, 12), new THREE.MeshStandardMaterial({ color: 0x7d8da1, metalness: 0.7, roughness: 0.25 }));
      leg.position.set(x + dx, 0.43, z + dz);
      leg.castShadow = true;
      scene.add(leg);
    }
  }
}

function createBiosafetyCabinet() {
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.35, 0.78), new THREE.MeshStandardMaterial({ color: 0xb8c7d7, roughness: 0.32, metalness: 0.35 }));
  body.position.set(-1.25, 1.35, -4.55);
  body.castShadow = body.receiveShadow = true;
  scene.add(body);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.72, 0.04), new THREE.MeshPhysicalMaterial({ color: 0xa7e6ff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0, transmission: 0.45 }));
  glass.position.set(-1.25, 1.42, -4.13);
  scene.add(glass);
  const glow = new THREE.PointLight(0x9eeeff, 1.8, 3);
  glow.position.set(-1.25, 1.7, -4.1);
  scene.add(glow);
}

function createMicroscope() {
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x101827, roughness: 0.34, metalness: 0.45 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.45), baseMat);
  base.position.set(1.75, 0.98, -2.35);
  scene.add(base);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 16), baseMat);
  stand.position.set(1.75, 1.32, -2.35);
  stand.rotation.z = -0.25;
  scene.add(stand);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.45, 24), baseMat);
  head.position.set(1.88, 1.62, -2.35);
  head.rotation.z = Math.PI / 2;
  scene.add(head);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.035, 40), new THREE.MeshPhysicalMaterial({ color: 0xd8fbff, transparent: true, opacity: 0.55 }));
  dish.position.set(1.62, 1.07, -2.35);
  scene.add(dish);
}

function createIncubator() {
  const shell = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.78), new THREE.MeshStandardMaterial({ color: 0xe7edf4, roughness: 0.28, metalness: 0.22 }));
  shell.position.set(4.85, 1.0, -0.85);
  shell.castShadow = shell.receiveShadow = true;
  scene.add(shell);
  for (let y = 0.45; y < 1.65; y += 0.38) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.025, 0.62), new THREE.MeshStandardMaterial({ color: 0x99a9ba, metalness: 0.6, roughness: 0.2 }));
    shelf.position.set(4.85, y, -0.45);
    scene.add(shelf);
  }
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, 0.03), new THREE.MeshStandardMaterial({ color: 0x07111f, emissive: 0x135e84, emissiveIntensity: 0.9 }));
  panel.position.set(4.85, 1.78, -0.44);
  scene.add(panel);
}

function createWasteStation() {
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.75, 32), new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.42 }));
  bin.position.set(-4.75, 0.38, 2.25);
  bin.castShadow = true;
  scene.add(bin);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 }));
  lid.position.set(-4.75, 0.8, 2.25);
  scene.add(lid);
}

function createStoryboardWall() {
  const board = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.0, 0.08), new THREE.MeshStandardMaterial({ color: 0x0f2438, roughness: 0.42 }));
  board.position.set(1.2, 1.85, -4.89);
  scene.add(board);
  storyboard.forEach((step, index) => {
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.25, 0.06), new THREE.MeshStandardMaterial({ color: step.color, roughness: 0.38 }));
    card.position.set(-0.55 + index * 0.86, 1.85, -4.82);
    scene.add(card);
  });
}

function addGlassware(x, y, z) {
  for (let i = 0; i < 4; i += 1) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 18), new THREE.MeshPhysicalMaterial({ color: 0xc6f5ff, transparent: true, opacity: 0.55, roughness: 0.03 }));
    tube.position.set(x + i * 0.18, y + 0.22, z + Math.sin(i) * 0.08);
    tube.castShadow = true;
    scene.add(tube);
  }
}

function addPipettes(x, y, z) {
  for (let i = 0; i < 3; i += 1) {
    const pipette = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 12), new THREE.MeshStandardMaterial({ color: [0x60a5fa, 0xfacc15, 0xf472b6][i], roughness: 0.42 }));
    pipette.position.set(x + i * 0.18, y + 0.2, z);
    pipette.rotation.z = Math.PI / 2;
    scene.add(pipette);
  }
}

function createHotspot(story) {
  const group = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.18, 1),
    new THREE.MeshStandardMaterial({ color: story.color, emissive: story.color, emissiveIntensity: 0.75, roughness: 0.22 })
  );
  group.position.set(...story.position);
  group.userData.story = story;
  scene.add(group);
  const light = new THREE.PointLight(story.color, 1.2, 1.8);
  group.add(light);
  return group;
}

function onVrSelect(event) {
  const tempMatrix = new THREE.Matrix4();
  tempMatrix.identity().extractRotation(event.target.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(event.target.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  const hit = raycaster.intersectObjects(hotspots, false)[0];
  if (hit) showStory(hit.object.userData.story);
}

function setMove(code, state) {
  if (code === 'KeyW' || code === 'ArrowUp') move.forward = state;
  if (code === 'KeyS' || code === 'ArrowDown') move.back = state;
  if (code === 'KeyA' || code === 'ArrowLeft') move.left = state;
  if (code === 'KeyD' || code === 'ArrowRight') move.right = state;
}

function updateMovement(delta) {
  if (renderer.xr.isPresenting) return;
  const speed = 2.6 * delta;
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();
  const side = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
  if (move.forward) rig.position.addScaledVector(direction, speed);
  if (move.back) rig.position.addScaledVector(direction, -speed);
  if (move.left) rig.position.addScaledVector(side, speed);
  if (move.right) rig.position.addScaledVector(side, -speed);
  rig.position.x = THREE.MathUtils.clamp(rig.position.x, -4.8, 4.8);
  rig.position.z = THREE.MathUtils.clamp(rig.position.z, -3.8, 4.4);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function makeGridTexture(base, line) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = line;
  ctx.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
