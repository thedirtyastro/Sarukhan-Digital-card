import { ExtrudeGeometry, MeshPhysicalMaterial, Color, Path, Shape, ShapeGeometry, Texture } from 'three';
import { CARD_H, CARD_RADIUS, CARD_W } from './cardLayout';

export function roundedRectShape(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Rounded face with UVs normalised to 0‥1 so the texture keeps its exact aspect ratio. */
export function createFaceGeometry() {
  const g = new ShapeGeometry(roundedRectShape(CARD_W, CARD_H, CARD_RADIUS), 16);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + CARD_W / 2) / CARD_W, (pos.getY(i) + CARD_H / 2) / CARD_H);
  }
  uv.needsUpdate = true;
  return g;
}

/** Bevelled gunmetal slab that gives the card real thickness and metallic edges. */
export function createEdgeGeometry() {
  const g = new ExtrudeGeometry(roundedRectShape(CARD_W, CARD_H, CARD_RADIUS), {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 16,
  });
  g.translate(0, 0, -0.04);
  return g;
}

/** Metal tab with a hole; the lanyard loop passes through it. Hole centre sits 0.01 above tab centre. */
export function createEyeletGeometry() {
  const shape = roundedRectShape(0.36, 0.26, 0.09);
  const hole = new Path();
  hole.absarc(0, 0.01, 0.062, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new ExtrudeGeometry(shape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 20,
  });
  g.translate(0, 0, -0.03);
  return g;
}

export function createFaceMaterial(map: Texture) {
  return new MeshPhysicalMaterial({
    map,
    emissiveMap: map,
    emissive: new Color('#ffffff'),
    emissiveIntensity: 0.75, // shows the artwork faithfully, independent of scene lighting
    roughness: 0.6,
    metalness: 0.12,
    clearcoat: 0.1,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.25,
  });
}
