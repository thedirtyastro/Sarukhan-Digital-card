'use client';

import { useEffect, useMemo } from 'react';
import type { BufferGeometry, Texture } from 'three';
import type { Profile } from '@/config/profile';
import { TEX_W, palette } from '@/lib/cardLayout';
import { createFaceMaterial } from '@/lib/cardGeometry';
import { ROYAL, drawBase, drawDivider, engravedText, fitFont, goldBody, metalFill, spacedText, wrapText } from '@/lib/canvasUtils';

export interface FaceAssets {
  art: HTMLImageElement | null;
  photo: HTMLImageElement | null;
}

type Ctx = CanvasRenderingContext2D;

export function drawEmblem(ctx: Ctx, cx: number, cy: number, s: number) {
  ctx.save();
  ctx.strokeStyle = palette.gold;
  ctx.fillStyle = palette.gold;
  ctx.lineWidth = 2.4;
  const diamond = (k: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * k);
    ctx.lineTo(cx + s * 0.72 * k, cy);
    ctx.lineTo(cx, cy + s * k);
    ctx.lineTo(cx - s * 0.72 * k, cy);
    ctx.closePath();
    ctx.stroke();
  };
  diamond(1);
  ctx.lineWidth = 1.6;
  diamond(0.55);
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dir * s * 1.0, cy);
    ctx.lineTo(cx + dir * s * 1.9, cy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPortrait(ctx: Ctx, img: HTMLImageElement | null, cx: number, cy: number, r: number, exposure: number) {
  const outer = r + 20;
  // cast shadow + dark metallic bezel
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  const bezel = ctx.createLinearGradient(cx - outer, cy - outer, cx + outer, cy + outer);
  bezel.addColorStop(0, '#454e5b');
  bezel.addColorStop(0.5, '#12161d');
  bezel.addColorStop(1, '#303844');
  ctx.fillStyle = bezel;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // gold rims
  ctx.save();
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, outer - 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = palette.goldDeep;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // photograph (or replaceable placeholder)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    const scale = Math.max((2 * r) / img.naturalWidth, (2 * r) / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, cx - dw / 2, cy - r - (dh - 2 * r) * 0.25, dw, dh);
    // pre-compensate for the card's emissive lift so bright photos don't clip
    ctx.fillStyle = `rgba(0,0,0,${Math.min(Math.max(1 - exposure, 0), 0.8)})`;
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  } else {
    const bg = ctx.createRadialGradient(cx, cy - 40, 20, cx, cy, r);
    bg.addColorStop(0, '#1d222b');
    bg.addColorStop(1, '#0b0d12');
    ctx.fillStyle = bg;
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.fillStyle = '#2a303b';
    ctx.beginPath();
    ctx.arc(cx, cy - 36, 66, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 205, 160, 135, 0, Math.PI, 0);
    ctx.fill();
  }
  // dramatic portrait lighting: warm key from top-left, vignette to the edge
  const warm = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.4, cy + r * 0.4);
  warm.addColorStop(0, 'rgba(210,180,115,0.07)');
  warm.addColorStop(1, 'rgba(210,180,115,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  const vig = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  ctx.restore();
}

export function drawCardFront(ctx: Ctx, assets: FaceAssets, p: Profile) {
  drawBase(ctx, assets.art);
  const cx = TEX_W / 2;

  drawEmblem(ctx, cx, 168, 40);
  ctx.save();
  ctx.font = `italic 600 30px ${ROYAL}`;
  ctx.fillStyle = metalFill(ctx, 215, 245);
  ctx.textBaseline = 'alphabetic';
  spacedText(ctx, 'Digital Identity', cx, 242, 5);
  ctx.restore();

  drawPortrait(ctx, assets.photo, cx, 560, 232, p.photoExposure);

  // name: engraved gold italic, auto-fitted so it never leaves the frame
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  const size = fitFont(ctx, p.name, '700', ROYAL, 112, 790);
  engravedText(ctx, p.name, cx, 955, 0, size * 0.7);
  ctx.font = `italic 600 38px ${ROYAL}`;
  ctx.fillStyle = metalFill(ctx, 1008, 1044);
  spacedText(ctx, p.tagline, cx, 1040, 0);
  ctx.restore();
  drawDivider(ctx, cx, 1092, 190);

  // introduction in the lower panel, centred both ways
  ctx.save();
  ctx.font = `italic 600 40px ${ROYAL}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const lines = wrapText(ctx, p.intro, 790);
  const lh = 56;
  const first = 1330 - ((lines.length - 1) * lh) / 2 + 12;
  ctx.fillStyle = goldBody(ctx, first - 36, first + lines.length * lh);
  lines.forEach((l, i) => ctx.fillText(l, cx, first + i * lh));
  ctx.restore();
}

export function CardFront({ texture, geometry }: { texture: Texture; geometry: BufferGeometry }) {
  const material = useMemo(() => createFaceMaterial(texture), [texture]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh geometry={geometry} material={material} castShadow userData={{ face: 'front' }} />;
}
