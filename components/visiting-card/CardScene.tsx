'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import type { MotionValue } from 'framer-motion';
import { MathUtils, PerspectiveCamera } from 'three';
import { CARD_W, VIEW_HEIGHT } from '@/lib/cardLayout';
import { createPhysicsFrame } from '@/hooks/useCardPhysics';
import { useCardTextures } from '@/hooks/useCardTextures';
import { CardPhysics } from './CardPhysics';
import { CardLighting } from './CardLighting';
import { CardEnvironment } from './CardEnvironment';

export interface CardSceneProps {
  flip: MotionValue<number>;
  onToggle: () => void;
  onReady: () => void;
  reduced: boolean;
  compact: boolean;
}

/** Fits the card to any viewport, eases in on load, adds slight pointer parallax, and nudges closer on the back. */
function CardCamera({ flip, reduced }: { flip: MotionValue<number>; reduced: boolean }) {
  useFrame((state, dt) => {
    const cam = state.camera as PerspectiveCamera;
    const tan = Math.tan(MathUtils.degToRad(cam.fov / 2));
    const aspect = state.size.width / state.size.height;
    const p = MathUtils.clamp(flip.get() / Math.PI, 0, 1);
    const zHeight = VIEW_HEIGHT / 2 / tan;
    const zWidth = (CARD_W / 2 + 0.16) / (tan * aspect);
    const zTarget = Math.max(zHeight * (1 - 0.1 * p), zWidth);
    const par = reduced ? 0 : 1;
    const baseY = 0.1 - 0.22 * p;
    cam.position.x = MathUtils.damp(cam.position.x, state.pointer.x * 0.22 * par, 3, dt);
    cam.position.y = MathUtils.damp(cam.position.y, baseY + state.pointer.y * 0.1 * par, 3, dt);
    cam.position.z = MathUtils.damp(cam.position.z, zTarget, reduced ? 20 : 2.5, dt);
    cam.lookAt(0, baseY, 0);
  });
  return null;
}

export default function CardScene({ flip, onToggle, onReady, reduced, compact }: CardSceneProps) {
  const textures = useCardTextures(compact ? 1.5 : 2);
  const frame = useRef(createPhysicsFrame());

  return (
    <Canvas
      shadows
      dpr={[1, compact ? 1.5 : 1.75]}
      camera={{ fov: 25, position: [0, 0.1, 18], near: 0.5, far: 90 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ touchAction: 'none' }}
      aria-hidden
    >
      <fog attach="fog" args={['#050608', 26, 46]} />
      <CardCamera flip={flip} reduced={reduced} />
      <CardLighting flip={flip} />
      <CardEnvironment particleCount={compact ? 50 : 140} reduced={reduced} />
      <Suspense fallback={null}>
        {textures && (
          <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} interpolate={false}>
            <CardPhysics flip={flip} textures={textures} frame={frame} reduced={reduced} onToggle={onToggle} onReady={onReady} />
          </Physics>
        )}
      </Suspense>
    </Canvas>
  );
}
