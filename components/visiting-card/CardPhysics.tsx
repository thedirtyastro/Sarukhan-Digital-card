'use client';

import { useEffect, useRef } from 'react';
import { BallCollider, CuboidCollider, RigidBody, interactionGroups } from '@react-three/rapier';
import type { MotionValue } from 'framer-motion';
import type { Group } from 'three';
import { ANCHOR_POS, CARD_H, CARD_POS, CARD_W, CONNECTOR_POS, HitRegion } from '@/lib/cardLayout';
import { PHYSICS, PhysicsFrame, useCardPhysics } from '@/hooks/useCardPhysics';
import { createDragState, useCardInteraction } from '@/hooks/useCardInteraction';
import type { CardTextures } from '@/hooks/useCardTextures';
import { CardLanyard } from './CardLanyard';
import { CardFlip } from './CardFlip';

const NO_COLLISIONS = interactionGroups(0, []); // joints only — nothing should ever collide

interface Props {
  flip: MotionValue<number>;
  textures: CardTextures;
  frame: { current: PhysicsFrame };
  reduced: boolean;
  onToggle: () => void;
  onReady: () => void;
}

/**
 * Hierarchy:  fixed anchor → connector body → card body (physics group)
 *                                              └ CardFlip (inner flip group) → faces + edges
 * Visuals are driven from raw body state (one snapshot per frame) so strap, hardware and
 * card can never drift apart.
 */
export function CardPhysics({ flip, textures, frame, reduced, onToggle, onReady }: Props) {
  const drag = useRef(createDragState());
  const hover = useRef<HitRegion | null>(null);
  const cardGroup = useRef<Group>(null);

  const bodies = useCardPhysics({ frame, drag, cardGroup });
  const handlers = useCardInteraction({ drag, hover, regions: textures.regions, cardGroup, onToggle });

  useEffect(() => {
    onReady();
    if (reduced) return;
    // tiny natural swing on load, which then settles under damping
    const id = window.setTimeout(() => {
      bodies.card.current?.applyImpulse({ x: 1.1, y: 0, z: 0 }, true);
      bodies.card.current?.applyTorqueImpulse({ x: 0, y: 0, z: -0.25 }, true);
    }, 700);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <>
      <RigidBody ref={bodies.anchor} type="fixed" position={ANCHOR_POS} colliders={false} />

      <RigidBody
        ref={bodies.connector}
        position={CONNECTOR_POS}
        colliders={false}
        canSleep={false}
        enabledTranslations={[true, true, false]}
        linearDamping={PHYSICS.connectorLinearDamping}
        angularDamping={PHYSICS.connectorAngularDamping}
      >
        <BallCollider args={[0.1]} mass={PHYSICS.connectorMass} collisionGroups={NO_COLLISIONS} />
      </RigidBody>

      <RigidBody
        ref={bodies.card}
        position={CARD_POS}
        colliders={false}
        canSleep={false}
        enabledTranslations={[true, true, false]}
        linearDamping={PHYSICS.cardLinearDamping}
        angularDamping={PHYSICS.cardAngularDamping}
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.06]} mass={PHYSICS.cardMass} collisionGroups={NO_COLLISIONS} />
      </RigidBody>

      <CardLanyard frame={frame} />

      <group ref={cardGroup} position={CARD_POS} {...handlers}>
        <CardFlip flip={flip} textures={textures} hover={hover} />
      </group>
    </>
  );
}
