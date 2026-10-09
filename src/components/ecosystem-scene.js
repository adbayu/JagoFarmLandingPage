import * as THREE from "three";
import { ecosystemConnections, ecosystemNodes } from "./ecosystem-flow.js";

const COLORS = { water: 0x269dc2, nutrient: 0xdb9b32, biomass: 0x6b9e45 };

export function createEcosystemScene({ canvas, viewport, pins, onError }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-7, 7, 6, -6, .1, 80);
  camera.position.set(3, 12, 16);
  camera.lookAt(0, .1, .4);
  const world = new THREE.Group();
  scene.add(world);
  const sky = new THREE.HemisphereLight(0xfff8e7, 0x526442, 2.5);
  const sun = new THREE.DirectionalLight(0xfff3d6, 3.2);
  sun.position.set(-5, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 35 });
  sun.shadow.normalBias = .04;
  sun.shadow.bias = -.0002;
  scene.add(sky, sun);

  const geometries = new Map();
  const materials = new Map();
  const geometry = (name, factory) => {
    if (!geometries.has(name)) geometries.set(name, factory());
    return geometries.get(name);
  };
  const material = (color) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .82 }));
    return materials.get(color);
  };
  const boxGeometry = geometry("box", () => new THREE.BoxGeometry(1, 1, 1));
  const leafGeometry = geometry("leaf", () => new THREE.SphereGeometry(1, 7, 5));
  const cylinderGeometry = geometry("cylinder", () => new THREE.CylinderGeometry(1, 1, 1, 40));
  const coneGeometry = geometry("cone", () => new THREE.ConeGeometry(1, 1, 12));
  const mesh = (parent, shape, color, position, scale = [1, 1, 1]) => {
    const object = new THREE.Mesh(shape, typeof color === "number" ? material(color) : color);
    object.position.set(...position);
    object.scale.set(...scale);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const box = (parent, color, position, size) => mesh(parent, boxGeometry, color, position, size);
  const cylinder = (parent, color, position, radius, height) => mesh(parent, cylinderGeometry, color, position, [radius, height, radius]);
  const sphere = (parent, color, position, scale) => mesh(parent, leafGeometry, color, position, scale);
  const beam = (parent, a, b, color = 0xd8d3bd, radius = .035) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const vector = end.clone().sub(start);
    const object = mesh(parent, cylinderGeometry, color, start.clone().add(end).multiplyScalar(.5).toArray(), [radius, vector.length(), radius]);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.normalize());
    return object;
  };
  const torus = (parent, radius, tube, color, y) => {
    const shape = geometry("torus-" + radius + "-" + tube, () => new THREE.TorusGeometry(radius, tube, 8, 48));
    const object = mesh(parent, shape, color, [0, y, 0]);
    object.rotation.x = Math.PI / 2;
    return object;
  };
  const plant = (parent, x, z, size = 1, y = .28, color = 0x54863b) => {
    const stem = new THREE.Group();
    stem.position.set(x, y, z);
    parent.add(stem);
    stem.scale.setScalar(size);
    cylinder(stem, 0x547145, [0, .23, 0], .025, .5);
    for (let j = 0; j < 5; j++) {
      const angle = j * Math.PI * 2 / 5;
      const leaf = sphere(stem, j % 2 ? color : 0x7ca847, [Math.cos(angle) * .14, .23 + (j % 2) * .1, Math.sin(angle) * .14], [.11, .26, .07]);
      leaf.rotation.z = Math.cos(angle) * -.7;
      leaf.rotation.x = Math.sin(angle) * .7;
    }
  };
  const tree = (parent, x, z, size = 1) => {
    cylinder(parent, 0x796043, [x, .62 * size, z], .075 * size, .85 * size);
    sphere(parent, 0x527e3f, [x, 1.2 * size, z], [.46 * size, .55 * size, .44 * size]);
    sphere(parent, 0x83a54b, [x - .19 * size, 1.35 * size, z + .07], [.34 * size, .34 * size, .32 * size]);
  };

  const islands = ecosystemNodes.map(({ position }, index) => {
    const island = new THREE.Group();
    island.position.set(...position);
    world.add(island);
    cylinder(island, 0xc9b990, [0, -.1, 0], index === 0 ? 1.62 : 1.48, .3);
    cylinder(island, 0xe7dcc0, [0, .065, 0], index === 0 ? 1.62 : 1.48, .07);
    cylinder(island, 0xa7b77b, [0, .105, 0], index === 0 ? 1.44 : 1.31, .03);
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6;
      const tile = box(island, k % 2 ? 0xd5c6a3 : 0xe3d6b6, [Math.cos(a) * 1.35, .15, Math.sin(a) * 1.35], [.3, .07, .24]);
      tile.rotation.y = -a;
    }
    return island;
  });

  const pond = islands[0];
  cylinder(pond, 0x607c74, [0, .54, 0], 1.15, .8);
  cylinder(pond, 0x177e9b, [0, .98, 0], 1.06, .035);
  torus(pond, 1.15, .12, 0xd7d7c7, 1.04);
  torus(pond, 1.16, .045, 0x84998a, .37);
  for (let i = 0; i < 18; i++) {
    const a = i * Math.PI / 9;
    const rib = box(pond, 0xaab7a3, [Math.cos(a) * 1.16, .66, Math.sin(a) * 1.16], [.075, .64, .07]);
    rib.rotation.y = -a;
  }
  const fish = [];
  for (let i = 0; i < 13; i++) {
    const body = new THREE.Group();
    pond.add(body);
    const color = i % 3 === 0 ? 0xfff2d3 : i % 3 === 1 ? 0xec9a47 : 0xe57b41;
    sphere(body, color, [0, 0, 0], [.16, .045, .065]).castShadow = false;
    const tail = mesh(body, coneGeometry, color, [-.17, 0, 0], [.07, .12, .025]);
    tail.rotation.z = -Math.PI / 2;
    tail.castShadow = false;
    fish.push({ body, phase: i * 2.39, radius: .35 + (i % 4) * .16, speed: .16 + (i % 3) * .035 });
  }
  for (let i = 0; i < 6; i++) plant(pond, Math.cos(i * .55 + 2.1) * 1.4, Math.sin(i * .55 + 2.1) * 1.4, .7);
  const ripple = torus(pond, .68, .008, 0x72c4c9, 1.01);

  const waste = islands[1];
  box(waste, 0x285e50, [-.3, .61, .15], [1.32, .87, 1.12]);
  box(waste, 0x328c8b, [-.3, 1.06, .15], [1.15, .035, .95]);
  for (const x of [-.99, .39]) box(waste, 0x9bac8f, [x, .83, .15], [.06, .55, 1.18]);
  for (const z of [-.44, .74]) box(waste, 0x9bac8f, [-.3, .83, z], [1.44, .55, .06]);
  cylinder(waste, 0x5b7660, [.84, .63, -.26], .32, .96);
  cylinder(waste, 0xb1baa0, [.84, 1.13, -.26], .35, .08);
  beam(waste, [.84, 1.18, -.26], [.84, 1.18, .45], 0xbbcabc, .075);
  beam(waste, [.84, 1.18, .45], [.18, 1.18, .45], 0xbbcabc, .075);
  box(waste, 0x937859, [-.18, 1.27, -.58], [1.15, .18, .48]);
  for (let i = 0; i < 16; i++) sphere(waste, i % 2 ? 0x786648 : 0xb29b65, [-.65 + (i % 5) * .22, 1.4, -.74 + Math.floor(i / 5) * .1], [.11, .08, .075]);
  tree(waste, .68, .87, .72);

  const bed = (parent, x, z, width, depth) => {
    box(parent, 0x6a5945, [x, .3, z], [width, .25, depth]);
    for (const side of [-1, 1]) {
      box(parent, 0xa6b5a4, [x + side * width / 2, .4, z], [.08, .3, depth + .1]);
      box(parent, 0xa6b5a4, [x, .4, z + side * depth / 2], [width, .3, .08]);
    }
  };
  const azolla = islands[2];
  bed(azolla, 0, 0, 1.96, 1.62);
  box(azolla, 0x298a85, [0, .44, 0], [1.86, .035, 1.52]);
  const azollaLeaves = new THREE.InstancedMesh(leafGeometry, material(0x8fb94e), 160);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 160; i++) {
    dummy.position.set(-.85 + (i % 16) * .112, .51 + Math.sin(i * 13) * .018, -.66 + Math.floor(i / 16) * .145);
    dummy.scale.set(.075, .034, .075);
    dummy.rotation.y = i * 1.2;
    dummy.updateMatrix();
    azollaLeaves.setMatrixAt(i, dummy.matrix);
  }
  azollaLeaves.castShadow = true;
  azolla.add(azollaLeaves);
  for (let i = 0; i < 4; i++) plant(azolla, -1.1, -.6 + i * .4, .65);
  box(azolla, 0x9a8060, [.8, .3, 1.02], [.5, .3, .36]);
  sphere(azolla, 0x6e5638, [.8, .5, 1.02], [.22, .12, .14]);

  const crops = islands[3];
  for (let row = 0; row < 2; row++) {
    const z = -.5 + row * .91;
    bed(crops, 0, z, 1.95, .68);
    for (let col = 0; col < 5; col++) plant(crops, -.75 + col * .37, z, .9 + row * .23, .46, row ? 0x4b8a3e : 0x739340);
  }
  tree(crops, -1.03, .85, .9);
  tree(crops, 1.02, -.91, .68);

  const garden = islands[4];
  box(garden, 0xd1c4a4, [0, .22, 0], [1.9, .18, 1.7]);
  for (const z of [-.7, 0, .7]) {
    beam(garden, [-.8, .3, z], [-.8, 1.45, z]);
    beam(garden, [.8, .3, z], [.8, 1.45, z]);
    beam(garden, [-.8, 1.45, z], [0, 2.05, z]);
    beam(garden, [0, 2.05, z], [.8, 1.45, z]);
  }
  for (const [x, y] of [[-.8, 1.45], [.8, 1.45], [0, 2.05]]) beam(garden, [x, y, -.78], [x, y, .78]);
  const glass = new THREE.MeshStandardMaterial({ color: 0xd0e7ce, transparent: true, opacity: .22, roughness: .35, side: THREE.DoubleSide, depthWrite: false });
  materials.set("glass", glass);
  for (const side of [-1, 1]) {
    box(garden, glass, [side * .8, .88, 0], [.02, 1.12, 1.5]).castShadow = false;
    const roof = box(garden, glass, [side * .4, 1.75, 0], [1, .025, 1.5]);
    roof.rotation.z = -side * .64;
    roof.castShadow = false;
    for (let i = 0; i < 3; i++) plant(garden, side * .42, -.48 + i * .46, .72, .32);
  }
  tree(garden, -1.05, -.66, .85);
  plant(garden, .95, .8, 1.1);

  const rings = islands.map((island, i) => {
    const ring = torus(island, i === 0 ? 1.69 : 1.55, .025, 0xb6c595, .1);
    ring.material = new THREE.MeshBasicMaterial({ color: 0x648749, transparent: true, opacity: .2 });
    materials.set("ring-" + i, ring.material);
    ring.castShadow = false;
    return ring;
  });

  const paths = ecosystemConnections.map((connection) => {
    const start = new THREE.Vector3(...ecosystemNodes[connection.from].position);
    const end = new THREE.Vector3(...ecosystemNodes[connection.to].position);
    const middle = new THREE.Vector3(...connection.bend);
    const a = start.clone().add(middle.clone().sub(start).normalize().multiplyScalar(1.55));
    const b = end.clone().add(middle.clone().sub(end).normalize().multiplyScalar(1.5));
    a.y = b.y = .28;
    middle.y = .45;
    const curve = new THREE.QuadraticBezierCurve3(a, middle, b);
    const shape = new THREE.TubeGeometry(curve, 28, .06, 7, false);
    geometries.set("path-" + pathsKey(connection), shape);
    const pathMaterial = new THREE.MeshStandardMaterial({ color: COLORS[connection.kind], roughness: .5, transparent: true, opacity: .78 });
    materials.set("path-" + pathsKey(connection), pathMaterial);
    mesh(world, shape, pathMaterial, [0, 0, 0]).castShadow = false;
    const arrow = mesh(world, coneGeometry, COLORS[connection.kind], curve.getPoint(.82).toArray(), [.16, .35, .16]);
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangent(.82).normalize());
    arrow.castShadow = false;
    const dot = sphere(world, 0xfff7d5, a.toArray(), [.07, .07, .07]);
    dot.castShadow = false;
    return { ...connection, curve, pathMaterial, dot };
  });

  const ground = mesh(world, geometry("ground", () => new THREE.CircleGeometry(6.6, 80)), new THREE.ShadowMaterial({ opacity: .14 }), [0, -.27, 0]);
  materials.set("shadow", ground.material);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  const anchors = ecosystemNodes.map(({ position }, i) => new THREE.Vector3(position[0], i === 4 ? 2.65 : 1.85, position[2]));
  const projected = new THREE.Vector3();
  let width = 0, height = 0, targetAngle = 0, angle = 0, selectedStage = 0;
  let frame = 0, visible = false, dead = false, lastFrame = 0;
  let pointer = null;

  function resize() {
    width = viewport.clientWidth;
    height = viewport.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const halfWidth = Math.max(6.4, 5.35 * aspect);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth / aspect;
    camera.bottom = -halfWidth / aspect;
    camera.updateProjectionMatrix();
    renderer.shadowMap.needsUpdate = true;
  }
  function setStage(index) {
    selectedStage = index;
    rings.forEach((ring, i) => { ring.material.opacity = i === index ? .95 : .16; });
    paths.forEach((path) => { path.pathMaterial.opacity = path.from === index || path.to === index ? 1 : .36; });
  }
  function render(now) {
    if (dead || !visible || document.hidden) { frame = 0; return; }
    frame = requestAnimationFrame(render);
    if (now - lastFrame < 32) return;
    lastFrame = now;
    const time = now * .001;
    angle += (targetAngle - angle) * .14;
    if (Math.abs(world.rotation.y - angle) > .0001) renderer.shadowMap.needsUpdate = true;
    world.rotation.y = angle;
    fish.forEach(({ body, phase, radius, speed }) => {
      const a = phase + time * speed;
      body.position.set(Math.cos(a) * radius, 1.008, Math.sin(a) * radius);
      body.rotation.y = -a - Math.PI / 2;
    });
    ripple.scale.setScalar(1 + Math.sin(time * .9) * .045);
    paths.forEach((path, index) => {
      path.dot.position.copy(path.curve.getPoint((time * .19 + index * .17) % 1));
      path.dot.visible = path.from === selectedStage || path.to === selectedStage;
    });
    world.updateMatrixWorld(true);
    anchors.forEach((anchor, index) => {
      const pin = pins[index];
      if (!pin) return;
      projected.copy(anchor).applyMatrix4(world.matrixWorld).project(camera);
      pin.style.left = Math.max(35, Math.min(width - 35, (projected.x * .5 + .5) * width)) + "px";
      pin.style.top = Math.max(45, Math.min(height - 35, (-projected.y * .5 + .5) * height)) + "px";
      pin.style.zIndex = String(20 - Math.round(projected.z * 10) + (index === selectedStage ? 20 : 0));
    });
    renderer.render(scene, camera);
  }
  function wake() {
    if (visible && !document.hidden && !frame && !dead) frame = requestAnimationFrame(render);
  }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }, { threshold: 0 });
  observer.observe(viewport);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  function updateTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    sky.intensity = dark ? 1.8 : 2.5;
    sun.intensity = dark ? 2.4 : 3.2;
    renderer.toneMappingExposure = dark ? .95 : 1.15;
  }
  function pointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
  }
  function pointerMove(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    targetAngle += (event.clientX - pointer.x) * .008;
    pointer.x = event.clientX;
  }
  function pointerUp(event) {
    if (pointer?.id !== event.pointerId) return;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    pointer = null;
    canvas.classList.remove("is-dragging");
  }
  function contextLost(event) {
    event.preventDefault();
    visible = false;
    cancelAnimationFrame(frame);
    frame = 0;
    onError();
  }
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("lostpointercapture", pointerUp);
  canvas.addEventListener("webglcontextlost", contextLost);
  document.addEventListener("visibilitychange", wake);
  resize();
  updateTheme();

  return {
    setStage,
    rotate(delta) { targetAngle += delta; },
    reset() { targetAngle = 0; },
    dispose() {
      dead = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", wake);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("lostpointercapture", pointerUp);
      canvas.removeEventListener("webglcontextlost", contextLost);
      geometries.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
      azollaLeaves.dispose();
      sun.shadow.dispose();
      renderer.dispose();
    },
  };
}

function pathsKey({ from, to }) {
  return from + "-" + to;
}
