'use client';

import { useEffect, useState } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { profile } from '@/config/profile';
import { HitRegion, TEX_H, TEX_W } from '@/lib/cardLayout';
import { loadFonts, loadImage } from '@/lib/canvasUtils';
import { drawCardFront } from '@/components/visiting-card/CardFront';
import { drawCardBack } from '@/components/visiting-card/CardBack';

export interface CardTextures {
  front: CanvasTexture;
  back: CanvasTexture;
  regions: HitRegion[];
}

function makeCanvas(scale: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(TEX_W * scale);
  canvas.height = Math.round(TEX_H * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement) {
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Waits for fonts + artwork, then paints both faces. `scale` is the texture resolution multiplier. */
export function useCardTextures(scale: number) {
  const [textures, setTextures] = useState<CardTextures | null>(null);

  useEffect(() => {
    let cancelled = false;
    let made: CardTextures | null = null;

    (async () => {
      await loadFonts();
      const [art, photo] = await Promise.all([loadImage(profile.texture), loadImage(profile.photo)]);
      if (cancelled) return;
      const assets = { art, photo };

      const f = makeCanvas(scale);
      drawCardFront(f.ctx, assets, profile);
      const b = makeCanvas(scale);
      const regions = drawCardBack(b.ctx, assets, profile);

      made = { front: toTexture(f.canvas), back: toTexture(b.canvas), regions };
      setTextures(made);
    })();

    return () => {
      cancelled = true;
      made?.front.dispose();
      made?.back.dispose();
    };
  }, [scale]);

  return textures;
}
