'use client';

import { RefObject, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, DynamicDrawUsage, Group, Mesh,
  MeshStandardMaterial, Quaternion, RepeatWrapping, SRGBColorSpace, Vector3,
} from 'three';
import { HARDWARE_LENGTH } from '@/lib/cardLayout';
import type { PhysicsFrame } from '@/hooks/useCardPhysics';
import { CardConnector } from './CardConnector';

const SEGMENTS = 28;
const TOP_X = 1.4; // strap tops sit above the viewport
const TOP_Y = 5.2;
const W_TOP = 0.56;
const W_END = 0.38;
const UV_REPEAT = 3.6;
const DOWN = new Vector3(0, -1, 0);

function createRibbonGeometry() {
  const g = new BufferGeometry();
  const pos = new Float32Array((SEGMENTS + 1) * 6);
  const uv = new Float32Array((SEGMENTS + 1) * 4);
  const nor = new Float32Array((SEGMENTS + 1) * 6);
  const index: number[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const v = (i / SEGMENTS) * UV_REPEAT;
    uv.set([0, v, 1, v], i * 4);
    nor.set([0, 0, 1, 0, 0, 1], i * 6);
    if (i < SEGMENTS) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const posAttr = new BufferAttribute(pos, 3);
  posAttr.setUsage(DynamicDrawUsage);
  g.setAttribute('position', posAttr);
  g.setAttribute('uv', new BufferAttribute(uv, 2));
  g.setAttribute('normal', new BufferAttribute(nor, 3));
  g.setIndex(index);
  return g;
}

/** Woven twill with edge binding and muted-gold stitching; tiles seamlessly along its length. */
function createStrapTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#16181e';
  g.fillRect(0, 0, 128, 256);
  g.lineWidth = 2.5;
  for (let k = -128; k < 256; k += 8) {
    g.strokeStyle = (k / 8) % 2 ? 'rgba(78,84,96,0.38)' : 'rgba(0,0,0,0.38)';
    g.beginPath();
    g.moveTo(0, k);
    g.lineTo(128, k + 128);
    g.stroke();
  }
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `rgba(120,126,140,${Math.random() * 0.12})`;
    g.fillRect(Math.random() * 128, Math.random() * 256, 1, 1);
  }
  g.fillStyle = '#0b0c0f';
  g.fillRect(0, 0, 8, 256);
  g.fillRect(120, 0, 8, 256);
  g.strokeStyle = '#806B43';
  g.lineWidth = 2;
  g.setLineDash([7, 6]);
  for (const x of [14, 114]) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 256);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.wrapT = RepeatWrapping;
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const p0 = new Vector3();
const p1 = new Vector3();
const end = new Vector3();
const along = new Vector3();
const nrm = new Vector3();
const dir = new Vector3();
const quat = new Quaternion();

function updateRibbon(g: BufferGeometry, a: Vector3, b: Vector3, c: Vector3) {
  const attr = g.attributes.position as BufferAttribute;
  const arr = attr.array as Float32Array;
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const m = 1 - t;
    const x = m * m * a.x + 2 * m * t * b.x + t * t * c.x;
    const y = m * m * a.y + 2 * m * t * b.y + t * t * c.y;
    const z = m * m * a.z + 2 * m * t * b.z + t * t * c.z;
    const tx = 2 * m * (b.x - a.x) + 2 * t * (c.x - b.x);
    const ty = 2 * m * (b.y - a.y) + 2 * t * (c.y - b.y);
    const len = Math.hypot(tx, ty) || 1;
    const w = (W_TOP + (W_END - W_TOP) * Math.pow(t, 0.7)) / 2;
    const nx = (-ty / len) * w;
    const ny = (tx / len) * w;
    arr[i * 6] = x + nx;
    arr[i * 6 + 1] = y + ny;
    arr[i * 6 + 2] = z;
    arr[i * 6 + 3] = x - nx;
    arr[i * 6 + 4] = y - ny;
    arr[i * 6 + 5] = z;
  }
  attr.needsUpdate = true;
}

/**
 * Two woven strap segments forming the neck loop, converging on the connector clip.
 * Hardware is aligned and stretched every frame so it always spans connector body → card eyelet.
 */
export function CardLanyard({ frame }: { frame: RefObject<PhysicsFrame> }) {
  const hardware = useRef<Group>(null);
  const left = useRef<Mesh>(null);
  const right = useRef<Mesh>(null);
  const rest = useRef<[number, number]>([0, 0]);

  const geos = useMemo(() => [createRibbonGeometry(), createRibbonGeometry()] as const, []);
  const material = useMemo(() => {
    const map = createStrapTexture();
    return new MeshStandardMaterial({
      map, bumpMap: map, bumpScale: 0.8, roughness: 0.95, metalness: 0,
      side: DoubleSide, envMapIntensity: 0.3,
    });
  }, []);

  useFrame(() => {
    const f = frame.current;
    const hw = hardware.current;
    if (!f.ready || !hw) return;

    dir.subVectors(f.attach, f.connPos);
    const dist = dir.length();
    if (dist < 1e-4) return;
    dir.divideScalar(dist);
    quat.setFromUnitVectors(DOWN, dir);
    hw.position.copy(f.connPos);
    hw.quaternion.copy(quat);
    hw.scale.set(1, Math.max(dist / HARDWARE_LENGTH, 0.6), 1); // never a gap, never a stretch

    ([-1, 1] as const).forEach((side, i) => {
      end.set(side * 0.2, -0.1, side < 0 ? 0.056 : 0.062).multiply(hw.scale).applyQuaternion(quat).add(f.connPos);
      p0.set(side * TOP_X, TOP_Y, side < 0 ? 0 : 0.012);
      along.subVectors(end, p0);
      const len = along.length();
      if (!rest.current[i]) rest.current[i] = len;
      const slack = Math.min(Math.max(((rest.current[i] - len) / rest.current[i]) * 5, 0), 0.5);
      nrm.set(-along.y, along.x, 0).normalize();
      if (nrm.x * side < 0) nrm.negate(); // bow outward
      p1.copy(p0).lerp(end, 0.5).addScaledVector(nrm, 0.16 + slack * 0.5);
      updateRibbon(geos[i], p0, p1, end);
    });
  }, -1);

  return (
    <>
      <CardConnector ref={hardware} />
      <mesh ref={left} geometry={geos[0]} material={material} frustumCulled={false} />
      <mesh ref={right} geometry={geos[1]} material={material} frustumCulled={false} />
    </>
  );
}
