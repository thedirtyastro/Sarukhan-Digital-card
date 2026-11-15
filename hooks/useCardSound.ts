'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SRC = '/sounds/flip.mp3';

/** Off by default. The toggle only appears if a real /public/sounds/flip.mp3 exists. */
export function useCardSound() {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(SRC, { method: 'HEAD' })
      .then((r) => {
        const ok = r.ok && (r.headers.get('content-type') ?? '').startsWith('audio');
        if (alive && ok) {
          audio.current = new Audio(SRC);
          audio.current.volume = 0.35;
          setAvailable(true);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback(() => setEnabled((e) => !e), []);
  const play = useCallback(() => {
    if (!enabled || !audio.current) return;
    audio.current.currentTime = 0;
    void audio.current.play().catch(() => undefined);
  }, [enabled]);

  return { available, enabled, toggle, play };
}
