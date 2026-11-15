'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { AdditiveBlending, BufferAttribute, Points } from 'three';

interface DustProps {
  count: number;
  color: string;
  size: number;
  opacity: number;
  speed: number;
  animate: boolean;
}

function Dust({ count, color, size, opacity, speed, animate }: DustProps) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 16;
      a[i * 3 + 1] = (Math.random() - 0.5) * 9;
      a[i * 3 + 2] = -6 + Math.random() * 9;
    }
    return a;
  }, [count]);

  useFrame(({ clock }, dt) => {
    if (!animate || !ref.current) return;
    const attr = ref.current.geometry.attributes.position as BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += dt * speed * (0.4 + (i % 7) / 7);
      arr[i * 3] += Math.sin(t * 0.3 + i) * dt * 0.02;
      if (arr[i * 3 + 1] > 4.5) arr[i * 3 + 1] = -4.5;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={opacity} depthWrite={false} blending={AdditiveBlending} />
    </points>
  );
}

/** Everything around the card: IBL for metal, drifting dust, and a shadow-catching wall. */
export function CardEnvironment({ particleCount, reduced }: { particleCount: number; reduced: boolean }) {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#d9c18a" position={[0, 4, 4]} scale={[9, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#5c7aa3" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#8f7a4d" position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[5, 3, 1]} />
        <Lightformer form="ring" intensity={1} color="#aab4c6" position={[0, 2, -6]} scale={4} />
      </Environment>

      {/* invisible wall that only renders the card's soft shadow */}
      <mesh position={[0, 0, -1.6]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <shadowMaterial transparent opacity={0.6} />
      </mesh>

      <Dust count={particleCount} color="#9aa7bd" size={0.03} opacity={0.35} speed={0.05} animate={!reduced} />
      <Dust count={Math.round(particleCount / 4)} color="#B49A62" size={0.04} opacity={0.4} speed={0.035} animate={!reduced} />
    </>
  );
}
