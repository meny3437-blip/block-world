import * as THREE from 'three';

const seeded = (value) => {
  const n = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};

/** Adds a deterministic, mobile-budgeted End skyline, stars and aurora. */
export function createEndscape(scene, seed = 1, mobile = false) {
  const root = new THREE.Group();
  root.name = 'block-world-endscape';
  const random = (i) => seeded((seed || 1) * 0.001 + i * 19.19);
  const obsidian = new THREE.MeshStandardMaterial({
    color: 0x171025,
    roughness: 0.34,
    metalness: 0.18,
    emissive: 0x24103c,
    emissiveIntensity: 0.42
  });
  const crystal = new THREE.MeshStandardMaterial({
    color: 0x8e42c8,
    emissive: 0x9d42e8,
    emissiveIntensity: 1.35,
    roughness: 0.22
  });
  const towerCount = mobile ? 5 : 9;
  for (let i = 0; i < towerCount; i += 1) {
    const angle = random(i + 2) * Math.PI * 2;
    const distance = 19 + random(i + 21) * (mobile ? 24 : 42);
    const width = 1.7 + random(i + 42) * 1.9;
    const height = 15 + random(i + 64) * 25;
    const tower = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), obsidian);
    shaft.position.y = height / 2 - 0.5;
    shaft.castShadow = !mobile;
    shaft.receiveShadow = !mobile;
    tower.add(shaft);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(width * 1.08, 0.75, width * 1.08), obsidian);
    cap.position.y = height - 0.5;
    tower.add(cap);
    if (i % 2 === 0) {
      const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), crystal);
      beacon.position.y = height + 0.45;
      tower.add(beacon);
    }
    tower.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    root.add(tower);
  }

  const starCount = mobile ? 260 : 1100;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const angle = random(i + 100) * Math.PI * 2;
    const radius = 45 + random(i + 500) * 90;
    starPositions[i * 3] = Math.cos(angle) * radius;
    starPositions[i * 3 + 1] = 12 + random(i + 900) * 65;
    starPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
    color: 0xe8dfff,
    size: mobile ? 0.22 : 0.3,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.88,
    depthWrite: false
  }));
  root.add(stars);

  const auroraGeometry = new THREE.PlaneGeometry(115, 19, 36, 7);
  const positions = auroraGeometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setZ(i, Math.sin(x * 0.075 + seed * 0.01) * 2.3 + Math.cos(y * 0.24) * 1.1);
  }
  auroraGeometry.computeVertexNormals();
  const aurora = new THREE.Mesh(auroraGeometry, new THREE.MeshBasicMaterial({
    color: 0x9e56db,
    transparent: true,
    opacity: mobile ? 0.13 : 0.2,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
  aurora.position.set(0, 31, -48);
  root.add(aurora);
  const glow = new THREE.PointLight(0x9b50dc, mobile ? 0.7 : 1.15, 58);
  glow.position.set(0, 13, -9);
  root.add(glow);
  scene.add(root);

  return {
    dispose() {
      scene.remove(root);
      root.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
      });
      obsidian.dispose();
      crystal.dispose();
      stars.material.dispose();
      aurora.material.dispose();
      glow.dispose();
    }
  };
}
