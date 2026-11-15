'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { PointLight, SpotLight } from 'three';

function SpotLightTopRight() {
  const light = useRef<SpotLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.target.position.set(-0.5, -0.5, 0);
    scene.add(l.target);
    return () => { scene.remove(l.target); };
  }, [scene]);

  return (
    <spotLight
      ref={light}
      position={[5, 6, 8]}
      angle={0.32}
      penumbra={0.8}
      intensity={280}
      decay={2}
      color="#f4e4bd"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0004}
      shadow-radius={8}
      shadow-camera-near={4}
      shadow-camera-far={22}
    />
  );
}

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
      <SpotLightTopRight />
      {/* rope lights — soft golden */}
      <pointLight position={[-1.4, 5.0, 1.2]} intensity={8} distance={4.0} decay={2} color="#c9a84c" />
      <pointLight position={[1.4, 5.0, 1.2]} intensity={8} distance={4.0} decay={2} color="#c9a84c" />
      <pointLight position={[0, 2.8, 1.5]} intensity={6} distance={3.5} decay={2} color="#b8923a" />
      {/* fill from top-left */}
      <directionalLight position={[-4, 6, 7]} intensity={0.6} color="#fff5e0" />
      <directionalLight position={[-6, 3, -3]} intensity={1.4} color="#6f86a8" />
      <directionalLight position={[6, 1, -4]} intensity={1.0} color="#B49A62" />
      <pointLight ref={sweep} position={[0, 0.3, 3.2]} intensity={0} color="#f1e2b8" decay={2} />
    </>
  );
}
