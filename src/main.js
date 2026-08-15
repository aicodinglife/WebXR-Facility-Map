import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import "./styles.css";

const copy = {
  en: {
    explore: "EXPLORE THE FACILITY", focus: "FOCUS ON MAP", interactive: "Interactive zone",
    route: "Main circulation", rotate: "Rotate", zoom: "Zoom", xrHint: "Point and select a zone",
    loading: "Preparing facility map…", navigation: "NAVIGATION", howTo: "How to explore",
    desktop: "Desktop", desktopHelp: "Drag to orbit, scroll to zoom, and click a colored zone for details.",
    quest: "Meta Quest", questHelp: "Select Enter VR, point either controller, and squeeze the trigger.",
    move: "Move", moveHelp: "Use the thumbstick to move around the facility in immersive mode.",
    area: "Area", status: "Status", open: "Open today",
  },
  ar: {
    explore: "استكشف المرفق", focus: "تحديد على الخريطة", interactive: "منطقة تفاعلية",
    route: "مسار الحركة الرئيسي", rotate: "تدوير", zoom: "تكبير", xrHint: "أشِر واختر منطقة",
    loading: "جارٍ تجهيز خريطة المرفق…", navigation: "التنقل", howTo: "كيفية الاستكشاف",
    desktop: "سطح المكتب", desktopHelp: "اسحب لتدوير الخريطة، ومرّر للتكبير، وانقر على أي منطقة ملوّنة.",
    quest: "ميتا كويست", questHelp: "اختر دخول الواقع الافتراضي، ثم أشِر بوحدة التحكم واضغط الزناد.",
    move: "الحركة", moveHelp: "استخدم عصا التحكم للتحرك داخل المرفق في وضع الواقع الافتراضي.",
    area: "المساحة", status: "الحالة", open: "مفتوح اليوم",
  },
};

const zones = [
  {
    id: "main-pool", number: "01", color: 0x27c4d9, position: [-4.1, 0.26, -1.1], size: [8.5, .42, 4.6],
    area: "1,250 m²", en: ["Main Competition Pool", "An eight-lane, 50-metre competition pool with adjustable starting blocks and spectator visibility."],
    ar: ["المسبح الرئيسي", "مسبح منافسات بطول 50 متراً وثمانية مسارات، مع منصات انطلاق وإطلالة واضحة للجمهور."],
  },
  {
    id: "training-pool", number: "02", color: 0x5ce5c2, position: [5.7, 0.24, -2.1], size: [5.6, .38, 3.2],
    area: "540 m²", en: ["Training Pool", "A flexible teaching and warm-up pool with a shallow entry and configurable activity zones."],
    ar: ["مسبح التدريب", "مسبح مرن للتعليم والإحماء، بمدخل ضحل ومناطق نشاط قابلة للتعديل."],
  },
  {
    id: "changing", number: "03", color: 0xf0a95d, position: [-5.7, .45, 4.6], size: [5.1, .85, 2.4],
    area: "620 m²", en: ["Changing Rooms", "Family, group and accessible changing suites with direct connections to the pool deck."],
    ar: ["غرف تبديل الملابس", "غرف عائلية وجماعية ومهيأة لسهولة الوصول، متصلة مباشرة بمنطقة المسابح."],
  },
  {
    id: "entrance", number: "04", color: 0xf6d36d, position: [5.8, .25, 6.9], size: [4.3, .42, 1.7],
    area: "310 m²", en: ["Main Entrance", "The primary public arrival point, connected to parking, drop-off and the central concourse."],
    ar: ["المدخل الرئيسي", "نقطة الوصول الرئيسية للجمهور، متصلة بمواقف السيارات ومنطقة النزول والممر المركزي."],
  },
  {
    id: "reception", number: "05", color: 0xc47bf4, position: [5.4, .46, 4.2], size: [4.7, .85, 2.1],
    area: "185 m²", en: ["Reception", "Welcome desk, ticketing and member services positioned with a clear view of all arrival routes."],
    ar: ["الاستقبال", "مكتب الترحيب والتذاكر وخدمات الأعضاء، بموقع يطل بوضوح على جميع مسارات الوصول."],
  },
  {
    id: "seating", number: "06", color: 0xf27896, position: [-8.9, .7, -1.2], size: [1.7, 1.3, 5.6],
    area: "480 seats", en: ["Spectator Seating", "Tiered seating overlooking the competition pool, with accessible viewing platforms."],
    ar: ["مدرجات الجمهور", "مدرجات متدرجة تطل على مسبح المنافسات، مع منصات مشاهدة مهيأة لسهولة الوصول."],
  },
];

const state = {
  language: "en",
  hovered: null,
  selected: null,
  pointer: new THREE.Vector2(),
  interactive: [],
  zoneObjects: new Map(),
  labels: [],
};

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x071d26);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071d26);
scene.fog = new THREE.FogExp2(0x071d26, 0.018);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.05, 140);
camera.position.set(18, 22, 25);

const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 16;
controls.maxDistance = 55;
controls.maxPolarAngle = Math.PI * .48;
controls.minPolarAngle = Math.PI * .18;

scene.add(new THREE.HemisphereLight(0xb9fff3, 0x061820, 2.2));
const sun = new THREE.DirectionalLight(0xeafff9, 3.5);
sun.position.set(12, 25, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -25;
sun.shadow.camera.right = 25;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
scene.add(sun);

const mapRoot = new THREE.Group();
mapRoot.rotation.y = -0.06;
scene.add(mapRoot);

const materials = {
  base: new THREE.MeshStandardMaterial({ color: 0x17343b, roughness: .88, metalness: .05 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x29464a, roughness: .8 }),
  route: new THREE.MeshStandardMaterial({ color: 0x426267, roughness: .9 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xd5e6df, roughness: .82 }),
  darkWall: new THREE.MeshStandardMaterial({ color: 0x607b78, roughness: .85 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x93d7d2, transparent: true, opacity: .19, roughness: .18, transmission: .25 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x74918e, roughness: .55, metalness: .42 }),
};

function roundedRectShape(width, depth, radius) {
  const x = -width / 2;
  const y = -depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function extrudedFloor(width, depth, height, colorMaterial = materials.floor, radius = .35) {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, depth, radius), {
    depth: height, bevelEnabled: true, bevelSize: .08, bevelThickness: .05, bevelSegments: 2,
  });
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, colorMaterial);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

const foundation = extrudedFloor(29, 19, .6, materials.base, 1.4);
foundation.position.y = -.55;
mapRoot.add(foundation);

const deck = extrudedFloor(26.8, 16.8, .18, materials.floor, .9);
deck.position.y = .01;
mapRoot.add(deck);

// Main concourse visually connects arrival, reception and pool deck.
const concourse = new THREE.Mesh(new THREE.BoxGeometry(3.1, .08, 13.8), materials.route);
concourse.position.set(1.5, .15, 1);
concourse.receiveShadow = true;
mapRoot.add(concourse);

for (let z = -4.8; z <= 7; z += 1.25) {
  const marker = new THREE.Mesh(new THREE.BoxGeometry(.06, .012, .5), new THREE.MeshBasicMaterial({ color: 0x6c8d8d }));
  marker.position.set(1.5, .205, z);
  mapRoot.add(marker);
}

function addWall(x, z, w, d, h = 1.7, material = materials.wall) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  wall.position.set(x, h / 2 + .15, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  mapRoot.add(wall);
  return wall;
}

// Perimeter fragments keep the map readable from the default isometric view.
addWall(0, -8.15, 26.2, .2, 1.35);
addWall(-13, .1, .2, 16.2, 1.35);
addWall(13, -.7, .2, 14.6, 1.35);
addWall(-9.5, 8.15, 7, .2, 1.35);
addWall(-2.8, 8.15, 3.1, .2, 1.35);
addWall(11.5, 8.15, 3, .2, 1.35);
addWall(1.5, -5.6, .16, 5.2, 1.05, materials.darkWall);
addWall(1.5, 3.4, .16, 2.6, 1.05, materials.darkWall);
addWall(-8.2, 3.15, 6.5, .14, .9, materials.darkWall);

function makeZoneMaterial(color, pool = false) {
  return pool
    ? new THREE.MeshPhysicalMaterial({
        color, emissive: color, emissiveIntensity: .13, roughness: .12, metalness: .02,
        transmission: .22, transparent: true, opacity: .83, thickness: .7,
      })
    : new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: .035, roughness: .62, metalness: .03,
      });
}

function addLaneLines(group, zone) {
  for (let i = -3; i <= 3; i++) {
    const lane = new THREE.Mesh(
      new THREE.BoxGeometry(zone.size[0] - .5, .018, .025),
      new THREE.MeshBasicMaterial({ color: i === 0 ? 0xf3ca5e : 0xdaf7f5, transparent: true, opacity: .7 })
    );
    lane.position.set(zone.position[0], zone.position[1] + zone.size[1] / 2 + .02, zone.position[2] + i * .5);
    group.add(lane);
  }
}

function addZone(zone) {
  const group = new THREE.Group();
  group.userData.zone = zone;
  const isPool = zone.id.includes("pool");
  const material = makeZoneMaterial(zone.color, isPool);
  const geometry = new THREE.BoxGeometry(...zone.size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...zone.position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.zone = zone;
  mesh.userData.baseY = zone.position[1];
  group.add(mesh);

  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: zone.color, transparent: true, opacity: .45 })
  );
  outline.position.copy(mesh.position);
  outline.userData.zone = zone;
  group.add(outline);

  if (isPool) addLaneLines(group, zone);
  state.interactive.push(mesh);
  state.zoneObjects.set(zone.id, { group, mesh, material, outline });
  mapRoot.add(group);
}

zones.forEach(addZone);

// Changing room partitions.
for (let i = 0; i < 4; i++) addWall(-7.6 + i * 1.25, 4.6, .07, 2.15, .68, materials.glass);
// Reception desk.
const desk = extrudedFloor(2.8, .65, .45, materials.wall, .28);
desk.position.set(5.15, .42, 4.2);
mapRoot.add(desk);
// Entrance portal.
addWall(3.8, 7.65, .18, 1.2, 2.1);
addWall(7.9, 7.65, .18, 1.2, 2.1);
addWall(5.85, 7.65, 4.2, .14, .24, materials.metal).position.y = 2.2;

// Tiered spectator stands.
for (let i = 0; i < 5; i++) {
  const tier = new THREE.Mesh(new THREE.BoxGeometry(.34, .18 + i * .17, 5.15), materials.darkWall);
  tier.position.set(-8.3 - i * .32, .28 + i * .085, -1.2);
  tier.castShadow = true;
  mapRoot.add(tier);
}

function createLabel(zone) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 128;
  const context = labelCanvas.getContext("2d");
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4.6, 1.15, 1);
  sprite.position.set(zone.position[0], 2.2, zone.position[2]);
  sprite.userData = { zone, labelCanvas, context, texture };
  mapRoot.add(sprite);
  state.labels.push(sprite);
  drawLabel(sprite);
}

function drawLabel(sprite) {
  const { zone, context, labelCanvas, texture } = sprite.userData;
  const title = zone[state.language][0].toUpperCase();
  context.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  context.fillStyle = "rgba(4, 24, 31, .88)";
  context.roundRect(28, 22, 456, 76, 8);
  context.fill();
  context.strokeStyle = `#${zone.color.toString(16).padStart(6, "0")}`;
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = "#ecfffb";
  context.font = `${state.language === "ar" ? "500 30px Arial" : "600 23px Arial"}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.direction = state.language === "ar" ? "rtl" : "ltr";
  context.fillText(title, 256, 60, 410);
  texture.needsUpdate = true;
}

zones.forEach(createLabel);

// Context buildings and trees make the model read as a campus.
const contextMaterial = new THREE.MeshStandardMaterial({ color: 0x102d35, roughness: .95 });
[
  [-17, -6, 4, 5, 1.4], [-17, 1, 3.5, 6, 2.2], [17, -4, 4, 6, 1.8],
  [17, 4.5, 4.5, 4, 1.2], [-8, -12, 5, 3, 1], [6, -12, 7, 3, 1.7],
].forEach(([x, z, w, d, h]) => {
  const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), contextMaterial);
  block.position.set(x, h / 2 - .25, z);
  mapRoot.add(block);
});

const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2c8b70, roughness: .9 });
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8a6b4c, roughness: 1 });
[
  [-14.7, -9], [-11.7, -10.2], [-4, -10.6], [12.8, -10], [15.2, -8.5],
  [15.7, 8.2], [10.8, 10.2], [3, 10.5], [-4, 10.6], [-14.8, 8.7],
].forEach(([x, z], index) => {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .65, 6), trunkMaterial);
  trunk.position.set(x, .05, z);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.42 + (index % 3) * .06, 1), treeMaterial);
  crown.position.set(x, .6, z);
  mapRoot.add(trunk, crown);
});

// Subtle grid grounds the floating architectural model.
const grid = new THREE.GridHelper(90, 90, 0x21404a, 0x133039);
grid.position.y = -.72;
grid.material.transparent = true;
grid.material.opacity = .32;
scene.add(grid);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(52, 64),
  new THREE.MeshBasicMaterial({ color: 0x091f28, transparent: true, opacity: .75, depthWrite: false })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -.75;
scene.add(ground);

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const clock = new THREE.Clock();

const xrInfoCanvas = document.createElement("canvas");
xrInfoCanvas.width = 768;
xrInfoCanvas.height = 512;
const xrInfoContext = xrInfoCanvas.getContext("2d");
const xrInfoTexture = new THREE.CanvasTexture(xrInfoCanvas);
xrInfoTexture.colorSpace = THREE.SRGBColorSpace;
const xrInfoPanel = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 1.2),
  new THREE.MeshBasicMaterial({ map: xrInfoTexture, transparent: true, depthTest: false })
);
xrInfoPanel.position.set(1.35, 1.35, -2.5);
xrInfoPanel.renderOrder = 100;
xrInfoPanel.visible = false;
rig.add(xrInfoPanel);

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
}

function updateXRInfoPanel(zone) {
  const [title, description] = zone[state.language];
  const color = `#${zone.color.toString(16).padStart(6, "0")}`;
  xrInfoContext.clearRect(0, 0, xrInfoCanvas.width, xrInfoCanvas.height);
  xrInfoContext.fillStyle = "rgba(4, 22, 29, .95)";
  xrInfoContext.roundRect(8, 8, 752, 496, 18);
  xrInfoContext.fill();
  xrInfoContext.strokeStyle = color;
  xrInfoContext.lineWidth = 5;
  xrInfoContext.stroke();
  xrInfoContext.textAlign = state.language === "ar" ? "right" : "left";
  xrInfoContext.direction = state.language === "ar" ? "rtl" : "ltr";
  const x = state.language === "ar" ? 700 : 68;
  xrInfoContext.fillStyle = color;
  xrInfoContext.font = "700 26px Arial";
  xrInfoContext.fillText(`${state.language === "ar" ? "منطقة" : "ZONE"} ${zone.number}`, x, 78);
  xrInfoContext.fillStyle = "#effffc";
  xrInfoContext.font = "600 48px Arial";
  wrapCanvasText(xrInfoContext, title, x, 150, 630, 58, 2);
  xrInfoContext.fillStyle = "#9eb8b6";
  xrInfoContext.font = "400 25px Arial";
  wrapCanvasText(xrInfoContext, description, x, 275, 630, 38, 4);
  xrInfoContext.fillStyle = color;
  xrInfoContext.font = "600 24px Arial";
  xrInfoContext.fillText(`${copy[state.language].area}: ${zone.area}`, x, 455);
  xrInfoTexture.needsUpdate = true;
  xrInfoPanel.visible = renderer.xr.isPresenting;
}

function zoneFromObject(object) {
  return object?.userData?.zone || null;
}

function setHovered(zone) {
  if (state.hovered?.id === zone?.id) return;
  state.hovered = zone;
  canvas.style.cursor = zone ? "pointer" : "grab";
  document.querySelector("#tooltip").classList.toggle("visible", Boolean(zone));
}

function selectZone(zone, focus = false) {
  if (!zone) return;
  state.selected = zone;
  const [title, description] = zone[state.language];
  document.querySelector("#info-kicker").textContent = `${state.language === "ar" ? "منطقة" : "ZONE"} ${zone.number}`;
  document.querySelector("#info-title").textContent = title;
  document.querySelector("#info-description").textContent = description;
  document.querySelector("#info-stats").innerHTML = `
    <div><dt>${copy[state.language].area}</dt><dd>${zone.area}</dd></div>
    <div><dt>${copy[state.language].status}</dt><dd>${copy[state.language].open}</dd></div>`;
  const panel = document.querySelector("#info-panel");
  panel.style.setProperty("--accent", `#${zone.color.toString(16).padStart(6, "0")}`);
  panel.classList.add("open");
  updateXRInfoPanel(zone);
  document.querySelectorAll(".zone-button").forEach((button) => button.classList.toggle("active", button.dataset.zone === zone.id));
  if (focus && !renderer.xr.isPresenting) focusZone(zone);
}

function focusZone(zone) {
  const target = new THREE.Vector3(zone.position[0], 0, zone.position[2]);
  const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(20);
  controls.target.copy(target);
  camera.position.copy(target).add(offset);
}

function renderZoneNavigation() {
  const nav = document.querySelector("#zone-nav");
  nav.innerHTML = "";
  zones.forEach((zone) => {
    const button = document.createElement("button");
    button.className = "zone-button";
    button.dataset.zone = zone.id;
    button.style.setProperty("--zone-color", `#${zone.color.toString(16).padStart(6, "0")}`);
    button.textContent = zone[state.language][0];
    button.addEventListener("click", () => selectZone(zone, true));
    nav.appendChild(button);
  });
}

function updateLanguage() {
  const ar = state.language === "ar";
  document.documentElement.lang = state.language;
  document.documentElement.dir = ar ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", ar);
  document.querySelector("#language-button").textContent = ar ? "EN" : "عربي";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = copy[state.language][element.dataset.i18n];
  });
  renderZoneNavigation();
  state.labels.forEach(drawLabel);
  if (state.selected) selectZone(state.selected);
}

function onPointerMove(event) {
  if (renderer.xr.isPresenting) return;
  state.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  state.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(state.pointer, camera);
  const hit = raycaster.intersectObjects(state.interactive, false)[0];
  const zone = zoneFromObject(hit?.object);
  setHovered(zone);
  const tooltip = document.querySelector("#tooltip");
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
  tooltip.textContent = zone ? zone[state.language][0] : "";
}

function onPointerDown(event) {
  if (event.button !== 0 || !state.hovered) return;
  selectZone(state.hovered);
}

canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointerleave", () => setHovered(null));
document.querySelector("#close-panel").addEventListener("click", () => {
  document.querySelector("#info-panel").classList.remove("open");
  state.selected = null;
  document.querySelectorAll(".zone-button").forEach((button) => button.classList.remove("active"));
});
document.querySelector("#focus-button").addEventListener("click", () => state.selected && focusZone(state.selected));
document.querySelector("#language-button").addEventListener("click", () => {
  state.language = state.language === "en" ? "ar" : "en";
  updateLanguage();
});

const helpDialog = document.querySelector("#help-dialog");
document.querySelector("#help-button").addEventListener("click", () => helpDialog.showModal());
document.querySelector("#close-help").addEventListener("click", () => helpDialog.close());
helpDialog.addEventListener("click", (event) => {
  if (event.target === helpDialog) helpDialog.close();
});

function setupXR() {
  const button = VRButton.createButton(renderer, {
    optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"],
  });
  button.id = "VRButton";
  document.body.appendChild(button);

  const controllerModelFactory = new XRControllerModelFactory();
  for (let i = 0; i < 2; i++) {
    const controller = renderer.xr.getController(i);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -8)]);
    const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0x55e6ca }));
    line.name = "ray";
    controller.add(line);
    controller.addEventListener("selectstart", () => {
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      const hit = raycaster.intersectObjects(state.interactive, false)[0];
      if (hit) selectZone(zoneFromObject(hit.object));
    });
    rig.add(controller);

    const grip = renderer.xr.getControllerGrip(i);
    grip.add(controllerModelFactory.createControllerModel(grip));
    rig.add(grip);
  }

  renderer.xr.addEventListener("sessionstart", () => {
    controls.enabled = false;
    rig.position.set(0, 1.65, 12);
    camera.position.set(0, 0, 0);
    if (state.selected) updateXRInfoPanel(state.selected);
    document.body.classList.add("in-xr");
  });
  renderer.xr.addEventListener("sessionend", () => {
    controls.enabled = true;
    rig.position.set(0, 0, 0);
    camera.position.set(18, 22, 25);
    controls.target.set(0, 0, 0);
    xrInfoPanel.visible = false;
    document.body.classList.remove("in-xr");
  });
}

function updateXRMovement(delta) {
  if (!renderer.xr.isPresenting) return;
  const session = renderer.xr.getSession();
  for (const source of session.inputSources) {
    if (!source.gamepad || source.handedness !== "left") continue;
    const axes = source.gamepad.axes;
    const x = axes.length >= 4 ? axes[2] : axes[0];
    const z = axes.length >= 4 ? axes[3] : axes[1];
    if (Math.abs(x) < .15 && Math.abs(z) < .15) continue;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
    rig.position.addScaledVector(direction, -z * delta * 2.4);
    rig.position.addScaledVector(right, x * delta * 2.4);
  }
}

function animateZoneStates(time) {
  zones.forEach((zone, index) => {
    const object = state.zoneObjects.get(zone.id);
    const active = state.hovered?.id === zone.id || state.selected?.id === zone.id;
    object.material.emissiveIntensity = THREE.MathUtils.lerp(object.material.emissiveIntensity, active ? .48 : (zone.id.includes("pool") ? .13 : .035), .12);
    object.outline.material.opacity = THREE.MathUtils.lerp(object.outline.material.opacity, active ? 1 : .45, .12);
    object.mesh.position.y = object.mesh.userData.baseY + (active ? Math.sin(time * 3 + index) * .035 + .06 : 0);
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onResize);

renderZoneNavigation();
updateLanguage();
setupXR();

renderer.setAnimationLoop((time) => {
  const delta = Math.min(clock.getDelta(), .05);
  controls.update();
  updateXRMovement(delta);
  animateZoneStates(time * .001);
  renderer.render(scene, camera);
});

requestAnimationFrame(() => {
  requestAnimationFrame(() => document.querySelector("#loading").classList.add("hidden"));
});
