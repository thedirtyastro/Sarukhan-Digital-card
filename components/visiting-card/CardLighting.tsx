'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import type { PointLight } from 'three';

/** Soft blue-grey ambience, one warm gold key, cool + gold rims, and a light sweep while flipping. */
export function CardLighting({ flip }: { flip: MotionValue<number> }) {
  const sweep = useRef<PointLight>(null);

  useFrame(() => {
    const l = sweep.current;
    if (!l) return;
    const speed = Math.abs(flip.getVelocity());
    l.intensity = Math.min(speed * 6, 55);
    l.position.x = -Math.cos(flip.get()) * 2.2;
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#9aa6bb" />
      <hemisphereLight args={['#2a3447', '#050608', 0.5]} />
      <spotLight
        position={[1.8, 3.2, 8]}
        angle={0.42}
        penumbra={1}
        intensity={200}
        decay={2}
        color="#f4e4bd"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={8}
        shadow-camera-near={4}
        shadow-camera-far={22}
      />
      {/* natural sunlight from top-left */}
      <directionalLight position={[-4, 6, 7]} intensity={1.2} color="#fff5e0" />
      <directionalLight position={[-6, 3, -3]} intensity={1.4} color="#6f86a8" />
      <directionalLight position={[6, 1, -4]} intensity={1.0} color="#B49A62" />
      <pointLight ref={sweep} position={[0, 0.3, 3.2]} intensity={0} color="#f1e2b8" decay={2} />
    </>
  );
}
