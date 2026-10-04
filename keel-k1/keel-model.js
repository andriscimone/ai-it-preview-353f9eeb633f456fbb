/*
 * Keel K-1 — procedural 3D model of a hypothetical gyro-stabilised electric two-wheeler.
 *
 * Units are metres. +X points forward, +Y up, +Z to the vehicle's right.
 * The ground is y = 0 and the origin sits midway between the two axles.
 *
 * buildKeel() returns the vehicle as a THREE.Group plus handles for every moving
 * part (doors, wheels, steering, gyro gimbals and rotors, landing legs), so the
 * viewer can animate it and the exporter can write it out as glTF.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PI = Math.PI;

export const K = {
  xNose: 1.39,
  xTail: -1.40,
  xFrontAxle: 0.93,
  xRearAxle: -0.93,
  wheelR: 0.31,
  rimR: 0.216,
  tyreWFront: 0.13,
  tyreWRear: 0.16,
  doorX0: -0.90,
  doorX1: 0.30,
  legX: 0.25,
  legHinge: { y: 0.30, z: 0.26 },
  legLength: 0.407,
};

const NOSE_R = 0.30;
const TAIL_R = 0.13;
const ARCH_F = 0.375;
const ARCH_R = 0.36;
const TH_LOW = 0.45;   // below the widest line: start of the graphite lower band
const TH_SILL = 0.30;  // below the widest line: bottom edge of the doors
const SEGS = [10, 6, 16, 12, 8, 12, 16, 6, 10];

// ---------------------------------------------------------------- profiles

// Monotone cubic (Fritsch–Carlson) interpolation, so profiles never overshoot.
function pchip(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const n = xs.length;
  const h = [];
  const d = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i];
    d[i] = (ys[i + 1] - ys[i]) / h[i];
  }
  const m = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i];
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}

const topP = pchip([
  [-1.40, 1.06], [-1.22, 1.25], [-0.98, 1.40], [-0.72, 1.47], [-0.42, 1.48], [-0.15, 1.47],
  [0.10, 1.41], [0.35, 1.26], [0.60, 1.06], [0.85, 0.91], [1.10, 0.82], [1.39, 0.75],
]);
const floorP = pchip([
  [-1.40, 0.66], [-1.26, 0.57], [-1.02, 0.32], [-0.62, 0.165], [0.58, 0.165], [0.98, 0.28],
  [1.24, 0.48], [1.39, 0.6],
]);
const halfWP = pchip([
  [-1.40, 0.27], [-1.18, 0.345], [-0.92, 0.395], [-0.55, 0.426], [-0.15, 0.43], [0.25, 0.42],
  [0.60, 0.375], [0.90, 0.31], [1.15, 0.245], [1.39, 0.19],
]);
// Vertical depth of the glazing below the roofline; zero means no glass at that station.
const glassDepthP = pchip([
  [-1.04, 0], [-0.94, 0.19], [-0.78, 0.33], [-0.48, 0.45], [-0.12, 0.50], [0.18, 0.50],
  [0.44, 0.45], [0.62, 0.33], [0.75, 0.15], [0.84, 0],
]);
// Half-width of the roof spine (roll hoop and gull-wing hinge); it fades out over the windscreen.
const spineP = pchip([[-1.2, 0.06], [0.12, 0.06], [0.42, 0]]);

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Lift the underside over a wheel: a circular arch around the axle, blended into the floor.
function archLift(x, floor, xc, r) {
  const dx = Math.abs(x - xc);
  const dyFloor = 0.31 - floor;
  const reach = Math.sqrt(Math.max(0, r * r - dyFloor * dyFloor));
  if (dx >= reach) return floor;
  const upper = 0.31 + Math.sqrt(Math.max(0, r * r - dx * dx));
  const b = smoothstep(reach, reach - 0.03, dx);
  return floor + (Math.max(floor, upper) - floor) * b;
}

function bottomAt(x) {
  let y = floorP(x);
  y = archLift(x, y, K.xFrontAxle, ARCH_F);
  y = archLift(x, y, K.xRearAxle, ARCH_R);
  return y;
}

function endRound(x) {
  if (x > K.xNose - NOSE_R) {
    const t = (x - (K.xNose - NOSE_R)) / NOSE_R;
    return Math.sqrt(Math.max(0, 1 - t * t));
  }
  if (x < K.xTail + TAIL_R) {
    const t = (K.xTail + TAIL_R - x) / TAIL_R;
    return Math.sqrt(Math.max(0, 1 - t * t));
  }
  return 1;
}

function profile(x) {
  const top = topP(x);
  const bot = bottomAt(x);
  const yw = bot + (top - bot) * 0.44;
  const s = endRound(x);
  // The lower half is a 2.4 superellipse, a rounded keel: it clears the road at 40° of lean.
  return { x, yw, w: halfWP(x) * s, hT: (top - yw) * s, hB: (yw - bot) * s, nT: 2.3, nB: 2.4, tumble: 0.06 };
}

// One point of a cross-section. th = 0 is the right flank, PI/2 the roof, PI the left flank.
function sectionYZ(p, th) {
  const c = Math.cos(th);
  const s = Math.sin(th);
  const up = s >= 0;
  const e = 2 / (up ? p.nT : p.nB);
  let z = p.w * Math.sign(c) * Math.pow(Math.abs(c), e);
  if (up) z *= 1 - p.tumble * s * s;
  const y = p.yw + (up ? p.hT : p.hB) * Math.sign(s) * Math.pow(Math.abs(s), e);
  return [y, z];
}

export function surfacePoint(x, th, out = new THREE.Vector3()) {
  const [y, z] = sectionYZ(profile(x), th);
  return out.set(x, y, z);
}

export function surfaceNormal(x, th, out = new THREE.Vector3()) {
  const h = 1e-3;
  const a = surfacePoint(x + h, th);
  const b = surfacePoint(x - h, th);
  const c = surfacePoint(x, th + h);
  const d = surfacePoint(x, th - h);
  const tu = a.sub(b);
  const tv = c.sub(d);
  return out.crossVectors(tu, tv).normalize();
}

// Bisection on the upper-right quadrant, where y rises and z falls with th.
function solveTheta(p, target, axis) {
  let lo = 0;
  let hi = PI / 2;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    const [y, z] = sectionYZ(p, mid);
    const below = axis === 'y' ? y < target : z > target;
    if (below) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function rowBreaks(p) {
  const top = p.yw + p.hT;
  const depth = glassDepthP(p.x);
  let tb = PI / 2;
  if (depth > 0.004) {
    const yb = Math.max(top - depth, p.yw + 0.05);
    tb = yb >= top ? PI / 2 : solveTheta(p, yb, 'y');
  }
  const sz = spineP(p.x);
  let ts = sz > 0.001 ? solveTheta(p, sz, 'z') : PI / 2;
  ts = Math.max(ts, tb);
  return [-PI / 2, -TH_LOW, -TH_SILL, tb, ts, PI - ts, PI - tb, PI + TH_SILL, PI + TH_LOW, 1.5 * PI];
}

function rowStations() {
  const raw = [];
  const N = 200;
  const L = K.xNose - K.xTail;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    raw.push(K.xTail + L * (0.8 * u + 0.2 * (1 - Math.cos(PI * u)) / 2));
  }
  // Sample the rounded nose and tail by angle so their curvature is resolved.
  for (let k = 1; k < 16; k++) {
    const a = (k / 16) * (PI / 2);
    raw.push(K.xNose - NOSE_R + NOSE_R * Math.sin(a));
    raw.push(K.xTail + TAIL_R - TAIL_R * Math.sin(a));
  }
  const exact = new Set([K.doorX0, K.doorX1, K.xNose, K.xTail]);
  raw.push(...exact);
  raw.sort((a, b) => a - b);
  const xs = [];
  for (const x of raw) {
    const last = xs[xs.length - 1];
    if (last === undefined || x - last > 0.0015) xs.push(x);
    else if (exact.has(x)) xs[xs.length - 1] = x;
  }
  return xs;
}

// ---------------------------------------------------------------- materials

function makeMaterials(forExport) {
  const shellSide = forExport ? THREE.DoubleSide : THREE.FrontSide;
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const M = {
    paint: phys({ name: 'Paint_Pearl', color: 0xe6e9ea, roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, side: shellSide }),
    lower: phys({ name: 'Paint_Graphite', color: 0x25292d, roughness: 0.42, metalness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.12, side: shellSide }),
    glass: phys({ name: 'Canopy_Electrochromic', color: 0x0a1016, roughness: 0.03, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.6, depthWrite: false, envMapIntensity: 1.5, side: THREE.DoubleSide }),
    trim: std({ name: 'Trim_Black', color: 0x0a0c0e, roughness: 0.5 }),
    interior: std({ name: 'Interior_Shell', color: 0x2a2e32, roughness: 0.85, side: THREE.BackSide }),
    seat: std({ name: 'Seat', color: 0x3c4146, roughness: 0.9 }),
    seatPanel: std({ name: 'Seat_Panel', color: 0x5a3a2a, roughness: 0.85 }),
    tyre: std({ name: 'Tyre', color: 0x161719, roughness: 0.92, side: THREE.DoubleSide }),
    rim: std({ name: 'Rim_Graphite', color: 0x30353a, roughness: 0.3, metalness: 0.75, side: THREE.DoubleSide }),
    disc: std({ name: 'Brake_Disc', color: 0x9aa0a6, roughness: 0.3, metalness: 1 }),
    caliper: std({ name: 'Caliper', color: 0xe2591c, roughness: 0.4, metalness: 0.2 }),
    arm: std({ name: 'Arm_Cast', color: 0x3a3f45, roughness: 0.38, metalness: 0.8 }),
    cable: std({ name: 'HV_Cable', color: 0xf06a1e, roughness: 0.55 }),
    lampFront: new THREE.MeshBasicMaterial({ name: 'Lamp_Front', color: 0xf3f7ff, toneMapped: false }),
    lampRear: new THREE.MeshBasicMaterial({ name: 'Lamp_Rear', color: 0xff2a2a, toneMapped: false }),
    lens: phys({ name: 'Sensor_Lens', color: 0x07090b, roughness: 0.08, metalness: 0.2, clearcoat: 1 }),
    battery: std({ name: 'Battery_SolidState', color: 0x3a4148, roughness: 0.5, metalness: 0.6, emissive: 0xff6a1f, emissiveIntensity: 0 }),
    cmgShell: phys({ name: 'CMG_Housing', color: 0x7f98b2, roughness: 0.25, metalness: 0.6, emissive: 0x3d8de0, emissiveIntensity: 0 }),
    rotor: std({ name: 'CMG_Rotor', color: 0xbac3cb, roughness: 0.22, metalness: 1, emissive: 0x3d8de0, emissiveIntensity: 0 }),
    rotorMark: std({ name: 'CMG_Rotor_Mark', color: 0x15191c, roughness: 0.6 }),
    motor: std({ name: 'Hub_Motor', color: 0x434a51, roughness: 0.35, metalness: 0.8, emissive: 0xff6a1f, emissiveIntensity: 0 }),
    compute: std({ name: 'Compute', color: 0x2f3a3a, roughness: 0.4, metalness: 0.5, emissive: 0x2fc4a8, emissiveIntensity: 0 }),
    leg: std({ name: 'Landing_Leg', color: 0x3a3f45, roughness: 0.35, metalness: 0.8, emissive: 0x3d8de0, emissiveIntensity: 0 }),
    rubber: std({ name: 'Rubber', color: 0x141516, roughness: 0.95 }),
    screen: new THREE.MeshBasicMaterial({ name: 'Dash_Display', color: 0x2c5a78, toneMapped: false }),
    volume: new THREE.LineBasicMaterial({ name: 'Volume_Outline', color: 0x9aa6ae, transparent: true, opacity: 0.8 }),
  };
  M.lens.userData.autonomy = true;
  return M;
}

// ---------------------------------------------------------------- body shell

function buildBody(M, forExport) {
  const xs = rowStations();
  const R = xs.length;
  const C = SEGS.reduce((a, b) => a + b, 0) + 1;
  const segStart = [];
  {
    let j = 0;
    for (const n of SEGS) { segStart.push(j); j += n; }
    segStart.push(j);
  }
  const P = new Float32Array(R * C * 3);
  for (let i = 0; i < R; i++) {
    const p = profile(xs[i]);
    const br = rowBreaks(p);
    let j = 0;
    for (let s = 0; s < SEGS.length; s++) {
      for (let k = 0; k < SEGS[s]; k++) {
        const th = br[s] + ((br[s + 1] - br[s]) * k) / SEGS[s];
        const [y, z] = sectionYZ(p, th);
        P.set([xs[i], y, z], (i * C + j) * 3);
        j++;
      }
    }
    const [y, z] = sectionYZ(p, br[SEGS.length]);
    P.set([xs[i], y, z], (i * C + j) * 3);
  }

  // Smooth normals from the whole grid, then weld the seam and the two tips.
  const idx = [];
  for (let i = 0; i < R - 1; i++) {
    for (let j = 0; j < C - 1; j++) {
      const a = i * C + j;
      const b = (i + 1) * C + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const full = new THREE.BufferGeometry();
  full.setAttribute('position', new THREE.BufferAttribute(P, 3));
  full.setIndex(idx);
  full.computeVertexNormals();
  const N = full.getAttribute('normal').array;
  for (let i = 0; i < R; i++) {
    const a = (i * C) * 3;
    const b = (i * C + C - 1) * 3;
    for (let k = 0; k < 3; k++) {
      const v = (N[a + k] + N[b + k]) / 2;
      N[a + k] = v;
      N[b + k] = v;
    }
  }
  for (const [i, sx] of [[0, -1], [R - 1, 1]]) {
    for (let j = 0; j < C; j++) N.set([sx, 0, 0], (i * C + j) * 3);
  }
  for (let v = 0; v < R * C; v++) {
    const l = Math.hypot(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]) || 1;
    N[v * 3] /= l; N[v * 3 + 1] /= l; N[v * 3 + 2] /= l;
  }
  full.dispose();

  const segOfCol = [];
  for (let s = 0; s < SEGS.length; s++) for (let k = 0; k < SEGS[s]; k++) segOfCol.push(s);

  const regionOf = (s, inDoor) => {
    switch (s) {
      case 0: case 8: return 'lower';
      case 1: case 7: return 'paint';
      case 2: return inDoor ? 'doorR_paint' : 'paint';
      case 3: return inDoor ? 'doorR_glass' : 'glass';
      case 4: return 'spine';
      case 5: return inDoor ? 'doorL_glass' : 'glass';
      case 6: return inDoor ? 'doorL_paint' : 'paint';
      default: return 'paint';
    }
  };

  const regions = {};
  for (let i = 0; i < R - 1; i++) {
    const xm = (xs[i] + xs[i + 1]) / 2;
    const inDoor = xm > K.doorX0 && xm < K.doorX1;
    for (let j = 0; j < C - 1; j++) {
      const key = regionOf(segOfCol[j], inDoor);
      (regions[key] ||= []).push(i * C + j);
    }
  }

  const makeGeo = (quads, offset) => {
    const map = new Map();
    const pos = [];
    const nor = [];
    const index = [];
    const vid = (g) => {
      let v = map.get(g);
      if (v === undefined) {
        v = pos.length / 3;
        map.set(g, v);
        pos.push(P[g * 3] - offset.x, P[g * 3 + 1] - offset.y, P[g * 3 + 2] - offset.z);
        nor.push(N[g * 3], N[g * 3 + 1], N[g * 3 + 2]);
      }
      return v;
    };
    for (const q of quads) {
      const a = vid(q);
      const b = vid(q + C);
      const c = vid(q + 1);
      const d = vid(q + C + 1);
      index.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setIndex(index);
    g.computeBoundingSphere();
    return g;
  };

  const gridPoint = (i, j) => new THREE.Vector3(P[(i * C + j) * 3], P[(i * C + j) * 3 + 1], P[(i * C + j) * 3 + 2]);
  const gridNormal = (i, j) => new THREE.Vector3(N[(i * C + j) * 3], N[(i * C + j) * 3 + 1], N[(i * C + j) * 3 + 2]);
  const iD0 = xs.indexOf(K.doorX0);
  const iD1 = xs.indexOf(K.doorX1);

  const group = new THREE.Group();
  group.name = 'Body';
  const zero = new THREE.Vector3();
  const matFor = { paint: M.paint, spine: M.paint, lower: M.lower, glass: M.glass };
  const names = { paint: 'Body_Shell', spine: 'Roof_Spine', lower: 'Body_Lower', glass: 'Canopy_Fixed' };
  for (const key of ['paint', 'spine', 'lower', 'glass']) {
    const geo = makeGeo(regions[key], zero);
    const mesh = new THREE.Mesh(geo, matFor[key]);
    mesh.name = names[key];
    mesh.castShadow = key !== 'glass';
    mesh.receiveShadow = key !== 'glass';
    group.add(mesh);
    if (key !== 'glass' && !forExport) {
      const inner = new THREE.Mesh(geo, M.interior);
      inner.name = names[key] + '_Inner';
      inner.userData.noExport = true;
      group.add(inner);
    }
  }

  // Gull-wing doors hinge on the edges of the roof spine.
  const doors = {};
  for (const side of ['L', 'R']) {
    const hingeCol = side === 'L' ? segStart[5] : segStart[4];
    const A = gridPoint(iD0, hingeCol);
    const B = gridPoint(iD1, hingeCol);
    const pivot = new THREE.Group();
    pivot.name = `Door_${side}`;
    pivot.position.copy(A);
    const paint = new THREE.Mesh(makeGeo(regions[`door${side}_paint`], A), M.paint);
    paint.name = `Door_${side}_Panel`;
    paint.castShadow = true;
    paint.receiveShadow = true;
    const glass = new THREE.Mesh(makeGeo(regions[`door${side}_glass`], A), M.glass);
    glass.name = `Door_${side}_Glass`;
    pivot.add(paint, glass);
    if (!forExport) {
      const inner = new THREE.Mesh(paint.geometry, M.interior);
      inner.userData.noExport = true;
      pivot.add(inner);
    }
    group.add(pivot);
    doors[side] = { pivot, axis: B.clone().sub(A).normalize(), sign: side === 'L' ? 1 : -1 };
  }

  // Shut lines around each door opening.
  const lineAround = (cols) => {
    const [cBot, cTop] = cols;
    const pts = [];
    const push = (i, j) => pts.push(gridPoint(i, j).addScaledVector(gridNormal(i, j), 0.0012));
    const step = (a, b) => (a < b ? 1 : -1);
    for (let j = cBot; j !== cTop; j += step(cBot, cTop)) push(iD0, j);
    for (let i = iD0; i <= iD1; i++) push(i, cTop);
    for (let j = cTop; j !== cBot; j += step(cTop, cBot)) push(iD1, j);
    for (let i = iD1; i > iD0; i--) push(i, cBot);
    const clean = pts.filter((p, k) => k === 0 || p.distanceTo(pts[k - 1]) > 1e-4);
    const curve = new THREE.CatmullRomCurve3(clean, true, 'centripetal');
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, clean.length * 2, 0.0028, 5, true), M.trim);
    tube.name = 'Shut_Line';
    return tube;
  };
  group.add(lineAround([segStart[2], segStart[4]]));
  group.add(lineAround([segStart[7], segStart[5]]));

  return { group, doors };
}

// ---------------------------------------------------------------- body furniture

// A light blade that runs along the widest line, wraps the tip and returns down the other flank.
function wrapCurve(xStart, xTip, n, lift) {
  const pts = [];
  const along = (k) => xStart + (xTip - xStart) * Math.sin((k / n) * (PI / 2));
  const at = (x, th) => surfacePoint(x, th).addScaledVector(surfaceNormal(x, th), lift);
  for (let k = 0; k < n; k++) pts.push(at(along(k), 0));
  pts.push(new THREE.Vector3(xTip + Math.sign(xTip) * lift, profile(xTip).yw, 0));
  for (let k = n - 1; k >= 0; k--) pts.push(at(along(k), PI));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

function buildLamps(M) {
  const g = new THREE.Group();
  g.name = 'Lamps';
  const front = new THREE.Mesh(new THREE.TubeGeometry(wrapCurve(1.0, K.xNose, 44, 0.003), 180, 0.011, 10), M.lampFront);
  front.name = 'Light_Blade_Front';
  const rear = new THREE.Mesh(new THREE.TubeGeometry(wrapCurve(-1.12, K.xTail, 44, 0.003), 180, 0.011, 10), M.lampRear);
  rear.name = 'Light_Blade_Rear';
  g.add(front, rear);
  return g;
}

function placeOnSurface(obj, x, th, lift = 0) {
  const p = surfacePoint(x, th);
  const n = surfaceNormal(x, th);
  obj.position.copy(p).addScaledVector(n, lift);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  return obj;
}

function buildSensors(M) {
  const g = new THREE.Group();
  g.name = 'Sensors';
  const lidar = (name, x) => {
    const puck = new THREE.Group();
    puck.name = name;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.03, 40), M.lens);
    base.position.y = 0.012;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.05, 0.012, 40), M.compute);
    band.position.y = 0.031;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.046, 32, 12, 0, PI * 2, 0, PI / 2), M.lens);
    cap.scale.y = 0.35;
    cap.position.y = 0.037;
    puck.add(base, band, cap);
    placeOnSurface(puck, x, PI / 2, -0.004);
    return puck;
  };
  const lidarF = lidar('Lidar_Front', 1.03);
  const lidarR = lidar('Lidar_Rear', -1.2);
  g.add(lidarF, lidarR);
  const cams = [[1.17, 0.42], [1.17, PI - 0.42], [0.62, 0.05], [0.62, PI - 0.05], [-1.24, 0.5], [-1.24, PI - 0.5], [-0.98, -0.1], [-0.98, PI + 0.1]];
  cams.forEach(([x, th], k) => {
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 10), M.lens);
    lens.name = `Camera_${k + 1}`;
    lens.scale.y = 0.55;
    placeOnSurface(lens, x, th, 0.002);
    g.add(lens);
  });
  const radar = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.08, 0.16, 2, 0.008), M.compute);
  radar.name = 'Imaging_Radar_Front';
  radar.position.set(1.27, 0.6, 0);
  g.add(radar);
  return { group: g, lidarF };
}

// ---------------------------------------------------------------- wheels and running gear

function makeWheel(name, tyreW, M) {
  const carrier = new THREE.Group();
  carrier.name = name;
  const spin = new THREE.Group();
  spin.name = `${name}_Spin`;
  carrier.add(spin);
  const R = K.wheelR;
  const Rr = K.rimR;

  const prof = [];
  for (let k = 0; k <= 28; k++) {
    const a = -PI / 2 + (PI * k) / 28;
    const c = Math.max(0, Math.cos(a));
    prof.push(new THREE.Vector2(Rr + (R - Rr) * Math.pow(c, 0.42), (tyreW / 2) * Math.sin(a)));
  }
  const tyreGeo = new THREE.LatheGeometry(prof, 80);
  tyreGeo.rotateX(PI / 2);
  const tyre = new THREE.Mesh(tyreGeo, M.tyre);
  tyre.name = `${name}_Tyre`;
  tyre.castShadow = true;

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(Rr - 0.004, Rr - 0.004, tyreW * 0.82, 56, 1, true).rotateX(PI / 2), M.rim);

  const dome = (depth) => {
    const pts = [[0.0005, depth], [0.05, depth * 0.94], [0.11, depth * 0.7], [0.17, depth * 0.35], [Rr - 0.002, 0]];
    return new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64).rotateX(PI / 2);
  };
  const aero = new THREE.Mesh(dome(0.02), M.rim);
  aero.name = `${name}_Aero_Disc`;
  aero.position.z = tyreW * 0.4;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 32).rotateX(PI / 2), M.paint);
  cap.position.z = tyreW * 0.4 + 0.021;
  spin.add(tyre, barrel, aero, cap);
  for (let k = 0; k < 3; k++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.009, 0.004), M.caliper);
    const a = (k / 3) * PI * 2;
    bar.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.12, tyreW * 0.4 + 0.014);
    bar.rotation.z = a;
    spin.add(bar);
  }

  // Arm side: hub motor, brake disc and caliper.
  const inner = new THREE.Mesh(dome(-0.012), M.rim);
  inner.position.z = -tyreW * 0.4;
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.05, 56).rotateX(PI / 2), M.motor);
  motor.name = `${name}_Hub_Motor`;
  motor.position.z = -tyreW * 0.32;
  const discProf = [[0.105, -0.0025], [0.172, -0.0025], [0.172, 0.0025], [0.105, 0.0025], [0.105, -0.0025]];
  const disc = new THREE.Mesh(new THREE.LatheGeometry(discProf.map(([r, y]) => new THREE.Vector2(r, y)), 64).rotateX(PI / 2), M.disc);
  disc.name = `${name}_Brake_Disc`;
  const zDisc = -(tyreW / 2 + 0.012);
  disc.position.z = zDisc;
  spin.add(inner, motor, disc);

  const caliper = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.05, 0.03, 2, 0.01), M.caliper);
  caliper.name = `${name}_Caliper`;
  const ca = PI * 0.75;
  caliper.position.set(Math.cos(ca) * 0.152, Math.sin(ca) * 0.152, zDisc);
  caliper.rotation.z = ca - PI / 2;
  carrier.add(caliper);
  return { carrier, spin, motor };
}

function makeArm(name, P, H, h0, h1, depth, M) {
  const L = Math.hypot(H.x - P.x, H.y - P.y);
  const ang = Math.atan2(H.y - P.y, H.x - P.x);
  const s = new THREE.Shape();
  s.moveTo(0, -h0 / 2);
  s.lineTo(L, -h1 / 2);
  s.absarc(L, 0, h1 / 2, -PI / 2, PI / 2, false);
  s.lineTo(0, h0 / 2);
  s.absarc(0, 0, h0 / 2, PI / 2, (3 * PI) / 2, false);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 14 });
  g.translate(0, 0, -depth / 2);
  g.rotateZ(ang);
  g.translate(P.x, P.y, P.z);
  const mesh = new THREE.Mesh(g, M.arm);
  mesh.name = name;
  mesh.castShadow = true;
  return mesh;
}

function cable(name, pts, M) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.011, 8), M.cable);
  m.name = name;
  return m;
}

function buildRunningGear(M) {
  const g = new THREE.Group();
  g.name = 'Running_Gear';
  const zF = -(K.tyreWFront / 2 + 0.055);
  const zR = -(K.tyreWRear / 2 + 0.055);

  const front = makeWheel('Wheel_Front', K.tyreWFront, M);
  const steer = new THREE.Group();
  steer.name = 'Steering';
  steer.position.set(K.xFrontAxle, K.wheelR, 0);
  steer.add(front.carrier);
  const kingpin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.13, 24), M.arm);
  kingpin.position.z = zF + 0.02;
  steer.add(kingpin);

  const rear = makeWheel('Wheel_Rear', K.tyreWRear, M);
  rear.carrier.position.set(K.xRearAxle, K.wheelR, 0);

  const armF = makeArm('Arm_Front_HubCentre', new THREE.Vector3(0.5, 0.215, zF), new THREE.Vector3(K.xFrontAxle, K.wheelR, zF), 0.1, 0.075, 0.035, M);
  const armR = makeArm('Arm_Rear_SingleSided', new THREE.Vector3(-0.5, 0.215, zR), new THREE.Vector3(K.xRearAxle, K.wheelR, zR), 0.11, 0.08, 0.04, M);

  const cables = [
    cable('HV_Cable_Front', [[0.45, 0.26, -0.1], [0.62, 0.3, zF - 0.012], [0.8, 0.335, zF - 0.012], [0.9, 0.33, zF + 0.035]], M),
    cable('HV_Cable_Rear', [[-0.45, 0.26, -0.1], [-0.62, 0.305, zR - 0.014], [-0.8, 0.34, zR - 0.014], [-0.9, 0.335, zR + 0.04]], M),
  ];
  g.add(steer, rear.carrier, armF, armR, ...cables);
  return { group: g, steer, spinF: front.spin, spinR: rear.spin, motorF: front.motor, motorR: rear.motor };
}

// ---------------------------------------------------------------- balance system

function makeCMG(name, M) {
  const unit = new THREE.Group();
  unit.name = name;
  const gimbal = new THREE.Group();
  gimbal.name = `${name}_Gimbal`;
  unit.add(gimbal);
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.1, 56, 1, false), M.cmgShell);
  housing.name = `${name}_Vacuum_Housing`;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.143, 0.011, 10, 56).rotateX(PI / 2), M.arm);
  const pins = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.33, 16).rotateX(PI / 2), M.arm);
  const rotor = new THREE.Group();
  rotor.name = `${name}_Rotor`;
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 56), M.rotor);
  rotor.add(disk);
  for (let k = 0; k < 4; k++) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.004, 0.012), M.rotorMark);
    mark.position.set(Math.cos((k * PI) / 2) * 0.06, 0.017, Math.sin((k * PI) / 2) * 0.06);
    mark.rotation.y = -(k * PI) / 2;
    rotor.add(mark);
  }
  rotor.position.y = 0.0;
  rotor.visible = false; // seen only in X-ray, through the housing
  gimbal.add(housing, ring, pins, rotor);
  return { unit, gimbal, rotor, housing };
}

function buildBalance(M) {
  const g = new THREE.Group();
  g.name = 'Balance_System';
  const cmgs = [];
  for (const [side, z] of [['L', -0.148], ['R', 0.148]]) {
    const c = makeCMG(`CMG_${side}`, M);
    c.unit.position.set(-0.28, 0.36, z);
    g.add(c.unit);
    cmgs.push(c);
  }
  const legs = [];
  for (const side of ['L', 'R']) {
    const sz = side === 'L' ? -1 : 1;
    const pivot = new THREE.Group();
    pivot.name = `Leg_${side}`;
    pivot.position.set(K.legX, K.legHinge.y, sz * K.legHinge.z);
    const blade = new THREE.Mesh(new RoundedBoxGeometry(0.06, K.legLength, 0.034, 2, 0.012), M.leg);
    blade.position.y = K.legLength / 2;
    blade.castShadow = true;
    const foot = new THREE.Group();
    foot.position.y = K.legLength;
    foot.rotation.x = sz * -(3 * PI) / 4; // flat on the ground when the leg is deployed
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.02, 32), M.rubber);
    pad.position.y = -0.006;
    pad.castShadow = true;
    foot.add(pad);
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 16).rotateZ(PI / 2), M.arm);
    pivot.add(blade, foot, hinge);
    g.add(pivot);
    legs.push({ pivot, blade, foot, sign: sz });
  }
  return { group: g, cmgs, legs };
}

// ---------------------------------------------------------------- energy, compute, cabin

// Battery modules are trapezoids in section so they follow the keel-shaped floor.
function trapezoidModule(len, y0, y1, half0, half1, mat, name) {
  const sh = new THREE.Shape();
  sh.moveTo(-half0, y0);
  sh.lineTo(half0, y0);
  sh.lineTo(half1, y1);
  sh.lineTo(-half1, y1);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 });
  g.translate(0, 0, -len / 2);
  g.rotateY(PI / 2); // extrusion now runs along X, section in Y-Z
  const m = new THREE.Mesh(g, mat);
  m.name = name;
  return m;
}

function buildEnergy(M) {
  const g = new THREE.Group();
  g.name = 'Battery_Pack';
  const n = 6;
  const x0 = -0.06;
  const x1 = 0.6;
  const len = (x1 - x0 - (n - 1) * 0.008) / n;
  for (let k = 0; k < n; k++) {
    const m = trapezoidModule(len - 0.012, 0.205, 0.35, 0.16, 0.315, M.battery, `Battery_Module_${k + 1}`);
    m.position.x = x0 + len / 2 + k * (len + 0.008);
    g.add(m);
  }
  const rearModule = trapezoidModule(0.14, 0.205, 0.42, 0.16, 0.33, M.battery, 'Battery_Module_7');
  rearModule.position.x = -0.5;
  g.add(rearModule);
  return g;
}

function rbox(w, h, d, r, mat, name) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
  m.name = name;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function buildCabin(M) {
  const g = new THREE.Group();
  g.name = 'Cabin';
  const seat = (name, hip, back, recline, height, width) => {
    const s = new THREE.Group();
    s.name = name;
    const cushion = rbox(hip.len, 0.07, width, 0.03, M.seat, `${name}_Cushion`);
    cushion.position.set(hip.x, hip.y, 0);
    cushion.rotation.z = 0.08;
    const dir = new THREE.Vector2(-Math.sin(recline), Math.cos(recline));
    const rest = rbox(0.075, height, width, 0.03, M.seat, `${name}_Back`);
    rest.position.set(back.x + dir.x * height / 2, back.y + dir.y * height / 2, 0);
    rest.rotation.z = recline;
    const panel = rbox(0.012, height * 0.7, width * 0.42, 0.005, M.seatPanel, `${name}_Panel`);
    panel.position.copy(rest.position).add(new THREE.Vector3(Math.cos(recline) * 0.04, Math.sin(recline) * 0.04, 0));
    panel.rotation.z = recline;
    const head = rbox(0.07, 0.14, width * 0.6, 0.03, M.seat, `${name}_Headrest`);
    head.position.set(back.x + dir.x * (height + 0.09), back.y + dir.y * (height + 0.09), 0);
    head.rotation.z = recline;
    s.add(cushion, rest, panel, head);
    return s;
  };
  g.add(seat('Seat_Front', { x: 0.26, y: 0.395, len: 0.4 }, { x: 0.05, y: 0.41 }, 0.42, 0.58, 0.4));
  g.add(seat('Seat_Rear', { x: -0.49, y: 0.545, len: 0.28 }, { x: -0.63, y: 0.56 }, 0.31, 0.5, 0.38));

  const dash = rbox(0.16, 0.05, 0.56, 0.02, M.trim, 'Dash');
  dash.position.set(0.66, 0.8, 0);
  dash.rotation.z = -0.35;
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.07, 0.28), M.screen);
  screen.name = 'Dash_Display';
  screen.position.set(0.6, 0.84, 0);
  screen.rotation.z = 0.5;
  const yoke = new THREE.Group();
  yoke.name = 'Yoke';
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.013, 8, 32, PI).rotateZ(PI).rotateY(PI / 2), M.trim);
  const grips = [-1, 1].map((s) => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.07, 12), M.rubber);
    grip.position.set(0, 0.03, s * 0.11);
    return grip;
  });
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 12).rotateZ(PI / 2 - 0.05), M.trim);
  column.position.set(0.1, -0.02, 0);
  yoke.add(rim, ...grips, column);
  yoke.position.set(0.44, 0.8, 0);
  yoke.rotation.z = -0.35;
  g.add(dash, screen, yoke);
  return g;
}

function buildCompute(M) {
  const g = new THREE.Group();
  g.name = 'AI_Compute';
  const box = rbox(0.18, 0.05, 0.24, 0.01, M.compute, 'AI_Compute_Dual_SoC');
  box.position.set(1.1, 0.7, 0);
  g.add(box);
  return g;
}

function buildVolumes(M) {
  const g = new THREE.Group();
  g.name = 'Volumes';
  const trunk = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.34, 0.42, 0.5)), M.volume);
  trunk.name = 'Trunk_70L';
  trunk.position.set(-1.08, 0.94, 0);
  g.add(trunk);
  g.userData.noExport = true;
  g.visible = false;
  return g;
}

// ---------------------------------------------------------------- assembly

export function buildKeel({ forExport = false } = {}) {
  const M = makeMaterials(forExport);
  const root = new THREE.Group();
  root.name = 'Keel_K1';
  root.rotation.order = 'YXZ';

  const body = buildBody(M, forExport);
  const lamps = buildLamps(M);
  const sensors = buildSensors(M);
  const gear = buildRunningGear(M);
  const balance = buildBalance(M);
  const energy = buildEnergy(M);
  const cabin = buildCabin(M);
  const compute = buildCompute(M);
  const volumes = buildVolumes(M);
  root.add(body.group, lamps, sensors.group, gear.group, balance.group, energy, cabin, compute, volumes);

  root.traverse((o) => {
    if (o.isMesh && o.castShadow === false && o.material !== M.glass && !o.material.isMeshBasicMaterial) o.castShadow = true;
  });

  const anchor = (name, x, y, z, parent = root) => {
    const a = new THREE.Object3D();
    a.name = name;
    a.position.set(x, y, z);
    a.userData.noExport = true;
    parent.add(a);
    return a;
  };
  const anchors = {
    battery: anchor('anchor_battery', 0.3, 0.35, 0),
    gyro: anchor('anchor_gyro', -0.28, 0.5, -0.15),
    motorRear: anchor('anchor_motor_rear', K.xRearAxle, K.wheelR, -0.11),
    motorFront: anchor('anchor_motor_front', K.xFrontAxle, K.wheelR, -0.09),
    compute: anchor('anchor_compute', 1.1, 0.73, 0),
    lidar: anchor('anchor_lidar', 1.03, 0.92, 0),
    legs: anchor('anchor_legs', K.legX, 0.16, -0.44),
    trunk: anchor('anchor_trunk', -1.08, 1.15, 0),
  };

  // Shell materials fade in X-ray mode; core systems glow in their system colour.
  const shells = [
    [M.paint, 0.1], [M.lower, 0.14], [M.glass, 0.05], [M.trim, 0.18], [M.tyre, 0.3], [M.rim, 0.3],
    [M.seat, 0.22], [M.seatPanel, 0.22], [M.arm, 0.5], [M.lens, 0.6], [M.disc, 0.4], [M.caliper, 0.5], [M.screen, 0.3], [M.rubber, 0.5],
    [M.cmgShell, 0.35],
  ];
  for (const [m] of shells) m.userData.baseOpacity = m.opacity;
  const cores = [M.battery, M.cmgShell, M.rotor, M.motor, M.compute, M.leg];
  const rotors = balance.cmgs.map((c) => c.rotor);

  function setXray(t) {
    for (const [m, xo] of shells) {
      const base = m.userData.baseOpacity;
      m.opacity = base + (xo - base) * t;
      const tr = t > 0.001 || base < 1;
      if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
      m.depthWrite = m === M.glass ? false : t < 0.5;
    }
    M.interior.visible = t < 0.02;
    for (const m of cores) m.emissiveIntensity = 0.85 * t;
    for (const r of rotors) r.visible = t > 0.02;
    volumes.visible = t > 0.5;
  }

  const kit = {
    root,
    materials: M,
    doors: body.doors,
    steer: gear.steer,
    spinF: gear.spinF,
    spinR: gear.spinR,
    cmgs: balance.cmgs,
    legs: balance.legs,
    anchors,
    setXray,
  };
  poseLegs(kit, 0);
  return kit;
}

// Pose helpers shared by the viewer and the exporter.
export function poseDoors(k, amount) {
  for (const d of Object.values(k.doors)) d.pivot.quaternion.setFromAxisAngle(d.axis, d.sign * amount * 1.3);
}

// The legs swing out and telescope: stowed they are half length, upright inside the side wall.
export function poseLegs(k, amount) {
  const f = 0.5 + 0.5 * amount;
  for (const l of k.legs) {
    l.pivot.rotation.x = l.sign * amount * ((3 * PI) / 4);
    l.blade.scale.y = f;
    l.blade.position.y = (K.legLength * f) / 2;
    l.foot.position.y = K.legLength * f;
  }
}

// A plain 1.75 m figure for scale.
export function buildFigure(color = 0x9aa3aa) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, transparent: true, opacity: 0.55 });
  const g = new THREE.Group();
  g.name = 'Scale_Figure_175cm';
  const cap = (r, len, x, y, z, rz = 0) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), mat);
    m.position.set(x, y, z);
    m.rotation.z = rz;
    m.castShadow = true;
    g.add(m);
  };
  cap(0.06, 0.74, 0, 0.43, -0.1);
  cap(0.06, 0.74, 0, 0.43, 0.1);
  cap(0.16, 0.36, 0, 1.18, 0);
  cap(0.045, 0.56, 0, 1.12, -0.24, 0.06);
  cap(0.045, 0.56, 0, 1.12, 0.24, -0.06);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 16), mat);
  head.position.set(0, 1.645, 0);
  head.scale.y = 1.12;
  head.castShadow = true;
  g.add(head);
  return g;
}
