'use client';

import { useEffect, useMemo } from 'react';
import type { BufferGeometry, Texture } from 'three';
import type { Profile } from '@/config/profile';
import { HitRegion, TEX_W } from '@/lib/cardLayout';
import { createFaceMaterial } from '@/lib/cardGeometry';
import { ROYAL, drawBase, drawHeading, goldBody, wrapText } from '@/lib/canvasUtils';
import { FaceAssets, drawEmblem } from './CardFront';
import { drawSocialIcons } from './SocialLinks';

/** Draws the reverse side and returns every clickable region (texture px space). */
export function drawCardBack(ctx: CanvasRenderingContext2D, assets: FaceAssets, p: Profile): HitRegion[] {
  drawBase(ctx, assets.art);
  const cx = TEX_W / 2;

  drawEmblem(ctx, cx, 168, 40);
  drawHeading(ctx, 'About Me', cx, 305);

  ctx.save();
  ctx.font = `italic 600 46px ${ROYAL}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const lines = wrapText(ctx, p.about, 800);
  const lh = 68;
  const first = 740 - ((lines.length - 1) * lh) / 2 + 14;
  ctx.fillStyle = goldBody(ctx, first - 40, first + lines.length * lh);
  lines.forEach((l, i) => ctx.fillText(l, cx, first + i * lh));
  ctx.restore();

  return drawSocialIcons(ctx, p);
}

export function CardBack({ texture, geometry }: { texture: Texture; geometry: BufferGeometry }) {
  const material = useMemo(() => createFaceMaterial(texture), [texture]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh geometry={geometry} material={material} castShadow userData={{ face: 'back' }} />;
}
