'use client';

import { Github, Globe, Instagram, Linkedin, Mail, RotateCw } from 'lucide-react';
import type { Profile } from '@/config/profile';
import { HitRegion, IconName, TEX_W, palette } from '@/lib/cardLayout';
import { drawIcon } from '@/lib/canvasUtils';

/**
 * The six icons on the card back: GitHub, LinkedIn, Email, X, Instagram, Portfolio.
 * An icon with no URL configured is drawn dimmed and is not clickable (no fake buttons).
 */
export function drawSocialIcons(ctx: CanvasRenderingContext2D, p: Profile): HitRegion[] {
  const items: { id: string; label: string; icon: IconName; href: string; kind: HitRegion['kind'] }[] = [
    { id: 'github', label: 'GitHub', icon: 'github', href: p.github, kind: 'link' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: p.linkedin, kind: 'link' },
    { id: 'mail', label: 'Email', icon: 'mail', href: p.email ? `mailto:${p.email}` : '', kind: 'mail' },
    { id: 'x', label: 'X', icon: 'x', href: p.x, kind: 'link' },
    { id: 'instagram', label: 'Instagram', icon: 'instagram', href: p.instagram, kind: 'link' },
    { id: 'portfolio', label: 'Portfolio', icon: 'globe', href: p.portfolio, kind: 'link' },
  ];
  const r = 46;
  const pitch = 146;
  const cy = 1330;
  const x0 = TEX_W / 2 - 2.5 * pitch;
  const regions: HitRegion[] = [];

  items.forEach((it, i) => {
    const cx = x0 + i * pitch;
    const active = Boolean(it.href);
    ctx.save();
    ctx.globalAlpha = active ? 1 : 0.32;
    const fill = ctx.createRadialGradient(cx, cy - 12, 4, cx, cy, r);
    fill.addColorStop(0, '#1d222b');
    fill.addColorStop(1, palette.graphite);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(180,154,98,0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 7, 0, Math.PI * 2);
    ctx.stroke();
    drawIcon(ctx, it.icon, cx, cy, 40, '#E2CB94', 1.9);
    ctx.restore();
    if (active) {
      regions.push({ id: it.id, label: it.label, x: cx - r - 8, y: cy - r - 8, w: 2 * (r + 8), h: 2 * (r + 8), href: it.href, kind: it.kind });
    }
  });
  return regions;
}

const linkClass =
  'flex items-center gap-2 rounded-md border border-gold/40 bg-graphite px-3 py-2 font-mono text-xs tracking-widest text-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-gold';

/**
 * Real HTML links for keyboard & screen-reader users. Visually hidden until it receives focus,
 * then appears top-left. Mirrors the icons drawn on the card.
 */
export function SocialLinks({ profile, flipped, onFlip }: { profile: Profile; flipped: boolean; onFlip: () => void }) {
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
  return (
    <nav
      aria-label="Contact and profile links"
      className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:left-3 focus-within:top-3 focus-within:z-30 focus-within:flex focus-within:max-w-[calc(100%-1.5rem)] focus-within:flex-wrap focus-within:gap-2"
    >
      <button type="button" onClick={onFlip} className={linkClass} aria-pressed={flipped}>
        <RotateCw size={14} aria-hidden /> {flipped ? 'SHOW FRONT' : 'SHOW BACK'}
      </button>
      {profile.github && (
        <a className={linkClass} href={profile.github} {...ext} aria-label="GitHub profile (opens in new tab)">
          <Github size={14} aria-hidden /> GITHUB
        </a>
      )}
      {profile.linkedin && (
        <a className={linkClass} href={profile.linkedin} {...ext} aria-label="LinkedIn profile (opens in new tab)">
          <Linkedin size={14} aria-hidden /> LINKEDIN
        </a>
      )}
      {profile.email && (
        <a className={linkClass} href={`mailto:${profile.email}`} aria-label="Send email">
          <Mail size={14} aria-hidden /> EMAIL
        </a>
      )}
      {profile.x && (
        <a className={linkClass} href={profile.x} {...ext} aria-label="X profile (opens in new tab)">
          <span aria-hidden className="w-3.5 text-center font-bold">X</span> X
        </a>
      )}
      {profile.instagram && (
        <a className={linkClass} href={profile.instagram} {...ext} aria-label="Instagram profile (opens in new tab)">
          <Instagram size={14} aria-hidden /> INSTAGRAM
        </a>
      )}
      {profile.portfolio && (
        <a className={linkClass} href={profile.portfolio} {...ext} aria-label="Portfolio website (opens in new tab)">
          <Globe size={14} aria-hidden /> PORTFOLIO
        </a>
      )}
    </nav>
  );
}
