'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { AdditiveBlending, CanvasTexture, Group, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { CARD_H, CARD_W, FACE_Z, HitRegion, TEX_H, TEX_W } from '@/lib/cardLayout';
import { createEdgeGeometry, createEyeletGeometry, createFaceGeometry } from '@/lib/cardGeometry';
import type { CardTextures } from '@/hooks/useCardTextures';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(226,198,130,0.75)');
  grad.addColorStop(0.5, 'rgba(200,170,105,0.3)');
  grad.addColorStop(1, 'rgba(180,154,98,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Soft additive gold glow that slides to whichever back-face control is hovered. */
function HoverGlow({ hover }: { hover: { current: HitRegion | null } }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshBasicMaterial>(null);
  const texture = useMemo(makeGlowTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, dt) => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;
    const r = hover.current;
    if (r) {
      const tx = ((r.x + r.w / 2) / TEX_W - 0.5) * CARD_W;
      const ty = (0.5 - (r.y + r.h / 2) / TEX_H) * CARD_H;
      const sx = (r.w / TEX_W) * CARD_W * 1.7;
      const sy = (r.h / TEX_H) * CARD_H * 1.7;
      if (mt.opacity < 0.05) {
        m.position.set(tx, ty, 0.002);
        m.scale.set(sx, sy, 1);
      } else {
        m.position.x = MathUtils.damp(m.position.x, tx, 18, dt);
        m.position.y = MathUtils.damp(m.position.y, ty, 18, dt);
        m.scale.x = MathUtils.damp(m.scale.x, sx * 1.03, 14, dt); // subtle scale pop
        m.scale.y = MathUtils.damp(m.scale.y, sy * 1.03, 14, dt);
      }
    }
    mt.opacity = MathUtils.damp(mt.opacity, r ? 0.9 : 0, 10, dt);
  });

  return (
    <mesh ref={mesh} raycast={() => null} position={[0, 0, 0.002]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={mat} map={texture} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

interface Props {
  flip: MotionValue<number>;
  textures: CardTextures;
  hover: { current: HitRegion | null };
}

/**
 * Inner flip group — rotates only about the vertical axis through the eyelet, so the
 * pendulum body above it is never disturbed.  Front and back share one geometry; the back
 * is pre-rotated π so text never mirrors.
 */
export function CardFlip({ flip, textures, hover }: Props) {
  const group = useRef<Group>(null);
  const face = useMemo(createFaceGeometry, []);
  const edge = useMemo(createEdgeGeometry, []);
  const eyelet = useMemo(createEyeletGeometry, []);
  useEffect(() => () => { face.dispose(); edge.dispose(); eyelet.dispose(); }, [face, edge, eyelet]);

  useFrame(() => {
    if (group.current) group.current.rotation.y = flip.get();
  });

  return (
    <group ref={group}>
      <mesh geometry={edge} castShadow userData={{ face: 'edge' }}>
        <meshStandardMaterial color="#292F38" metalness={0.95} roughness={0.32} envMapIntensity={1.5} />
      </mesh>
      <mesh geometry={eyelet} position={[0, CARD_H / 2 + 0.08, 0]} castShadow userData={{ face: 'edge' }}>
        <meshStandardMaterial color="#2b313b" metalness={1} roughness={0.3} envMapIntensity={1.4} />
      </mesh>
      <group position={[0, 0, FACE_Z]}>
        <CardFront texture={textures.front} geometry={face} />
      </group>
      <group position={[0, 0, -FACE_Z]} rotation={[0, Math.PI, 0]}>
        <CardBack texture={textures.back} geometry={face} />
        <HoverGlow hover={hover} />
      </group>
    </group>
  );
}

