'use client';

import { RefObject, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RapierRigidBody, useRopeJoint } from '@react-three/rapier';
import { Group, Plane, Quaternion, Raycaster, Vector3 } from 'three';
import { ATTACH_Y, HARDWARE_LENGTH } from '@/lib/cardLayout';
import type { DragState } from './useCardInteraction';

/** Tuned for a heavy, premium feel. Everything is mass-normalised, so retuning is safe. */
export const PHYSICS = {
  cardMass: 2.2,
  connectorMass: 0.25,
  cardLinearDamping: 0.7,
  cardAngularDamping: 3.0,
  connectorLinearDamping: 1.4,
  connectorAngularDamping: 6,
  anchorRope: 0.4,
  tiltStiffness: 1.6, // restoring torque toward upright (roll / pitch)
  yawStiffness: 6, // keeps the card facing the viewer
  dragStiffness: 38,
  dragDamping: 12,
  dragMaxReach: 1.25,
  dragTorqueScale: 0.6,
};

/** One consistent snapshot of the physics world per frame; every visual reads from this. */
export interface PhysicsFrame {
  ready: boolean;
  connPos: Vector3;
  cardPos: Vector3;
  cardQuat: Quaternion;
  attach: Vector3;
}

export const createPhysicsFrame = (): PhysicsFrame => ({
  ready: false,
  connPos: new Vector3(),
  cardPos: new Vector3(),
  cardQuat: new Quaternion(),
  attach: new Vector3(),
});

const useBody = () => useRef<RapierRigidBody>(null) as RefObject<RapierRigidBody>;

interface Args {
  frame: RefObject<PhysicsFrame>;
  drag: RefObject<DragState>;
  cardGroup: RefObject<Group | null>;
}

export function useCardPhysics({ frame, drag, cardGroup }: Args) {
  const anchor = useBody();
  const connector = useBody();
  const card = useBody();

  // fixed anchor ─ short slack rope ─ connector ─ hardware-length rope ─ card eyelet
  useRopeJoint(anchor, connector, [[0, 0, 0], [0, 0, 0], PHYSICS.anchorRope]);
  useRopeJoint(connector, card, [[0, 0, 0], [0, ATTACH_Y, 0], HARDWARE_LENGTH]);

  const tmp = useMemo(
    () => ({
      ray: new Raycaster(),
      plane: new Plane(new Vector3(0, 0, 1), 0),
      target: new Vector3(),
      grab: new Vector3(),
      delta: new Vector3(),
      r: new Vector3(),
    }),
    [],
  );

  // negative priority: runs before lanyard visuals, never takes over rendering
  useFrame((state, rawDt) => {
    const c = card.current;
    const k = connector.current;
    if (!c || !k) return;
    const dt = Math.min(rawDt, 1 / 30);

    const t = c.translation();
    const r = c.rotation();
    const kt = k.translation();
    const f = frame.current;
    f.cardPos.set(t.x, t.y, t.z);
    f.cardQuat.set(r.x, r.y, r.z, r.w);
    f.connPos.set(kt.x, kt.y, kt.z);
    f.attach.set(0, ATTACH_Y, 0).applyQuaternion(f.cardQuat).add(f.cardPos);
    f.ready = true;

    const g = cardGroup.current;
    if (g) {
      g.position.copy(f.cardPos);
      g.quaternion.copy(f.cardQuat);
    }

    // critically-damped-ish restoring torque: limits swing/twist, no snapping
    const s = r.w < 0 ? -2 : 2;
    c.applyTorqueImpulse(
      {
        x: -PHYSICS.tiltStiffness * r.x * s * dt,
        y: -PHYSICS.yawStiffness * r.y * s * dt,
        z: -PHYSICS.tiltStiffness * r.z * s * dt,
      },
      true,
    );

    // pointer spring: pulls the grabbed point toward the cursor; off-centre grabs create torque
    const d = drag.current;
    if (d.active) {
      tmp.ray.setFromCamera(state.pointer, state.camera);
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.target)) {
        tmp.grab.copy(d.grabLocal).applyQuaternion(f.cardQuat).add(f.cardPos);
        tmp.delta.subVectors(tmp.target, tmp.grab);
        tmp.delta.z = 0;
        const len = tmp.delta.length();
        if (len > PHYSICS.dragMaxReach) tmp.delta.multiplyScalar(PHYSICS.dragMaxReach / len);

        const v = c.linvel();
        const m = c.mass();
        const ax = PHYSICS.dragStiffness * tmp.delta.x - PHYSICS.dragDamping * v.x;
        const ay = PHYSICS.dragStiffness * tmp.delta.y - PHYSICS.dragDamping * v.y;
        c.applyImpulse({ x: m * ax * dt, y: m * ay * dt, z: 0 }, true);

        tmp.r.subVectors(tmp.grab, f.cardPos);
        const tz = (tmp.r.x * ay - tmp.r.y * ax) * m * dt * PHYSICS.dragTorqueScale;
        c.applyTorqueImpulse({ x: 0, y: 0, z: tz }, true);
      }
    }
  }, -2);

  return { anchor, connector, card };
}
