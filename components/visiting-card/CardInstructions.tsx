'use client';

import { motion } from 'framer-motion';

export function CardInstructions({ visible, touch }: { visible: boolean; touch: boolean }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ delay: 0.6, duration: 1 }}
      className="pointer-events-none absolute inset-x-0 bottom-[max(0.9rem,env(safe-area-inset-bottom))] z-10 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-muted"
    >
      DRAG TO SWING <span className="mx-2 text-gold">·</span> {touch ? 'TAP' : 'CLICK'} TO FLIP
    </motion.p>
  );
}
