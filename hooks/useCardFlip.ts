'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

/** Flip state + a spring-driven rotation (radians). Kept apart from the pendulum physics on purpose. */
export function useCardFlip(reduced: boolean) {
  const [flipped, setFlipped] = useState(false);
  const rotation = useSpring(
    0,
    reduced ? { stiffness: 500, damping: 70 } : { stiffness: 62, damping: 13, mass: 1.15, restDelta: 0.001 },
  );

  useEffect(() => {
    rotation.set(flipped ? Math.PI : 0);
  }, [flipped, rotation]);

  const toggle = useCallback(() => setFlipped((f) => !f), []);
  return { flipped, toggle, rotation };
}
