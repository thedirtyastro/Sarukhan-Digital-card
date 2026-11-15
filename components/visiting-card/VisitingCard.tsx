'use client';

import dynamic from 'next/dynamic';
import { Component, ReactNode, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { profile } from '@/config/profile';
import { useCardFlip } from '@/hooks/useCardFlip';
import { useCardSound } from '@/hooks/useCardSound';
import { CardInstructions } from './CardInstructions';
import { SocialLinks } from './SocialLinks';

// Three.js / Rapier are browser-only: load lazily, never on the server.
const CardScene = dynamic(() => import('./CardScene'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.failed) {
      return (
        <div role="alert" className="absolute inset-0 grid place-items-center px-8 text-center font-mono text-xs tracking-[0.3em] text-muted">
          3D VIEW UNAVAILABLE — WEBGL IS NOT SUPPORTED ON THIS DEVICE. USE TAB TO REACH THE LINKS.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function VisitingCard() {
  const reduced = useReducedMotion() ?? false;
  const { flipped, toggle, rotation } = useCardFlip(reduced);
  const sound = useCardSound();
  const [mounted, setMounted] = useState(false);
  const [compact, setCompact] = useState(false);
  const [touch, setTouch] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompact(window.innerWidth < 768);
    setTouch(window.matchMedia('(pointer: coarse)').matches);
    setMounted(true);
  }, []);

  const playSound = sound.play;
  const handleToggle = useCallback(() => {
    toggle();
    playSound();
  }, [toggle, playSound]);
  const handleReady = useCallback(() => setReady(true), []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-midnight">
      {/* supplied gold cloud artwork, barely visible */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('/images/tag-background.webp')] bg-cover bg-center opacity-[0.28] mix-blend-screen" />
      {/* spotlight + muted gold light behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 55% 48% at 50% 46%, rgba(200,170,105,0.30) 0%, rgba(60,66,78,0.28) 40%, rgba(5,6,8,0) 72%)' }}
      />

      <div
        role="group"
        aria-label={`${profile.name} digital identity card. Press Enter to flip it.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className="absolute inset-0 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gold/40"
      >
        <SceneBoundary onError={handleReady}>
          {mounted && <CardScene flip={rotation} onToggle={handleToggle} onReady={handleReady} reduced={reduced} compact={compact} />}
        </SceneBoundary>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.78) 100%)' }}
      />

      <AnimatePresence>
        {!ready && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 z-20 grid place-items-center bg-midnight"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-gold">Authenticating identity</p>
              <div className="relative mx-auto mt-5 h-px w-40 overflow-hidden bg-gold/20">
                <div className="absolute inset-y-0 w-1/2 bg-gold" style={{ animation: 'scan 1.4s ease-in-out infinite' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SocialLinks profile={profile} flipped={flipped} onFlip={handleToggle} />
      <CardInstructions visible={ready} touch={touch} />

      {sound.available && (
        <button
          type="button"
          onClick={sound.toggle}
          aria-pressed={sound.enabled}
          aria-label={sound.enabled ? 'Mute card sounds' : 'Enable card sounds'}
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-graphite/80 text-gold transition hover:border-gold hover:shadow-[0_0_14px_rgba(180,154,98,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {sound.enabled ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        </button>
      )}
    </main>
  );
}
