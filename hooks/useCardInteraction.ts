'use client';

import { RefObject, useCallback, useEffect, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { HitRegion, TEX_H, TEX_W, activateRegion, findRegion } from '@/lib/cardLayout';
import { profile } from '@/config/profile';

type Face = 'front' | 'back' | 'edge';

export interface DragState {
  active: boolean;
  pointerId: number;
  grabLocal: Vector3;
  startX: number;
  startY: number;
  startT: number;
  face: Face;
  uv: { x: number; y: number } | null;
}

export const createDragState = (): DragState => ({
  active: false,
  pointerId: -1,
  grabLocal: new Vector3(),
  startX: 0,
  startY: 0,
  startT: 0,
  face: 'edge',
  uv: null,
});

interface Args {
  drag: RefObject<DragState>;
  hover: { current: HitRegion | null };
  regions: HitRegion[];
  cardGroup: RefObject<Group | null>;
  onToggle: () => void;
}

/** Drag-to-swing, tap-to-flip and back-face link hit-testing from a single pointer pipeline. */
export function useCardInteraction({ drag, hover, regions, cardGroup, onToggle }: Args) {
  const regionsRef = useRef(regions);
  const toggleRef = useRef(onToggle);
  useEffect(() => {
    regionsRef.current = regions;
    toggleRef.current = onToggle;
  }, [regions, onToggle]);

  useEffect(() => {
    const end = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d.active || ev.pointerId !== d.pointerId) return;
      d.active = false;
      document.body.style.cursor = '';
      if (ev.type === 'pointercancel') return;

      const moved = Math.hypot(ev.clientX - d.startX, ev.clientY - d.startY);
      if (moved < 10 && performance.now() - d.startT < 500) {
        const region =
          d.face === 'back' && d.uv ? findRegion(regionsRef.current, d.uv.x * TEX_W, (1 - d.uv.y) * TEX_H) : null;
        if (region) activateRegion(region, profile.resumeFileName);
        else toggleRef.current();
      }
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.body.style.cursor = '';
    };
  }, [drag]);

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const d = drag.current;
      if (d.active) return;
      d.active = true;
      d.pointerId = e.pointerId;
      d.startX = e.clientX;
      d.startY = e.clientY;
      d.startT = performance.now();
      d.face = (e.object.userData.face as Face | undefined) ?? 'edge';
      d.uv = e.uv ? { x: e.uv.x, y: e.uv.y } : null;
      cardGroup.current?.worldToLocal(d.grabLocal.copy(e.point));
      (e.target as Element).setPointerCapture?.(e.pointerId);
      hover.current = null;
      document.body.style.cursor = 'grabbing';
    },
    [drag, hover, cardGroup],
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (drag.current.active) return;
      e.stopPropagation();
      const region =
        e.object.userData.face === 'back' && e.uv
          ? findRegion(regionsRef.current, e.uv.x * TEX_W, (1 - e.uv.y) * TEX_H)
          : null;
      hover.current = region;
      document.body.style.cursor = region ? 'pointer' : 'grab';
    },
    [drag, hover],
  );

  const onPointerOut = useCallback(() => {
    if (drag.current.active) return;
    hover.current = null;
    document.body.style.cursor = '';
  }, [drag, hover]);

  return { onPointerDown, onPointerMove, onPointerOut };
}
