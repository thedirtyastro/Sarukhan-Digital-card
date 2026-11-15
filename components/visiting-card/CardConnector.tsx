'use client';

import { forwardRef, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { Group, MeshStandardMaterial } from 'three';

/**
 * Hardware chain, local +Y up, origin = top of the strap clip, bottom loop centred at y = -1.1
 * (= HARDWARE_LENGTH). CardLanyard aligns & stretches this group between connector body and card.
 *   clip bar → neck → swivel barrel → stem → hook ring (gated) → loop ring → card eyelet
 */
export const CardConnector = forwardRef<Group>(function CardConnector(_, ref) {
  const { gun, black } = useMemo(
    () => ({
      gun: new MeshStandardMaterial({ color: '#2b313b', metalness: 1, roughness: 0.32, envMapIntensity: 1.3 }),
      black: new MeshStandardMaterial({ color: '#0c0d11', metalness: 1, roughness: 0.26, envMapIntensity: 1.5 }),
    }),
    [],
  );

  return (
    <group ref={ref}>
      {/* strap clip */}
      <RoundedBox args={[0.84, 0.2, 0.09]} radius={0.035} smoothness={4} position={[0, -0.1, 0]} material={gun} castShadow />
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, -0.1, 0]} material={black}>
          <boxGeometry args={[0.26, 0.05, 0.095]} />
        </mesh>
      ))}
      {/* neck + swivel barrel */}
      <mesh position={[0, -0.26, 0]} material={gun}>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
      </mesh>
      <mesh position={[0, -0.4, 0]} material={black} castShadow>
        <cylinderGeometry args={[0.085, 0.085, 0.2, 24]} />
      </mesh>
      {[-0.32, -0.48].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={gun}>
          <torusGeometry args={[0.09, 0.012, 8, 28]} />
        </mesh>
      ))}
      <mesh position={[0, -0.565, 0]} material={black}>
        <cylinderGeometry args={[0.04, 0.04, 0.13, 12]} />
      </mesh>
      {/* hook ring with a gap closed by a slim gate */}
      <mesh position={[0, -0.8, 0]} rotation={[0, 0, 1.36]} material={black} castShadow>
        <torusGeometry args={[0.2, 0.036, 14, 48, Math.PI * 1.8]} />
      </mesh>
      <mesh position={[0.0955, -0.635, 0]} rotation={[0, 0, 1.047]} material={gun}>
        <cylinderGeometry args={[0.022, 0.022, 0.13, 8]} />
      </mesh>
      {/* attachment loop: lies in the YZ plane so it threads the eyelet; bottom sits at the hole centre */}
      <mesh position={[0, -1.0, 0]} rotation={[0, Math.PI / 2, 0]} material={gun} castShadow>
        <torusGeometry args={[0.1, 0.028, 12, 32]} />
      </mesh>
    </group>
  );
});
