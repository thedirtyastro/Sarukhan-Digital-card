import { IconName, TEX_H, TEX_W, palette } from './cardLayout';

type Ctx = CanvasRenderingContext2D;

/** Lucide-style stroke paths (24×24 grid). */
const ICONS: Record<IconName, string[]> = {
  mail: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
  ],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', 'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'],
  github: [
    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  ],
  linkedin: [
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
    'M2 9h4v12H2z',
    'M6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  ],
  instagram: [
    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
    'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
    'M17.5 6.5h.01',
  ],
  x: ['M4 4l11.733 16H20L8.267 4z', 'M4 20l6.768-6.768m2.46-2.46L20 4'],
  globe: [
    'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
    'M2 12h20',
    'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  ],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  send: ['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13'],
  external: ['M7 7h10v10', 'M7 17 17 7'],
};

export function drawIcon(ctx: Ctx, name: IconName, cx: number, cy: number, size: number, color: string, width = 2) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const d of ICONS[name]) ctx.stroke(new Path2D(d));
  ctx.restore();
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Royal italic serif used for every line of card type. */
export const ROYAL = '"Cormorant Garamond", "Playfair Display", Georgia, serif';

export async function loadFonts() {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load('italic 700 100px "Cormorant Garamond"', 'Sarukhan'),
      document.fonts.load('italic 600 40px "Cormorant Garamond"', 'Aa'),
      document.fonts.load('italic 500 40px "Cormorant Garamond"', 'Aa'),
    ]);
    await document.fonts.ready;
  } catch {
    /* fall back to system fonts */
  }
}

export function measureSpaced(ctx: Ctx, text: string, spacing: number) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return w - spacing;
}

/** Letter-spaced text (works in every browser, unlike ctx.letterSpacing). */
export function spacedText(ctx: Ctx, text: string, x: number, y: number, spacing: number, align: CanvasTextAlign = 'center') {
  if (spacing === 0) {
    const prevAlign = ctx.textAlign;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    const w = ctx.measureText(text).width;
    ctx.textAlign = prevAlign;
    return w;
  }
  const total = measureSpaced(ctx, text, spacing);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = prev;
  return total;
}

export function wrapText(ctx: Ctx, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function metalFill(ctx: Ctx, top: number, bottom: number) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, '#E6D3A0');
  g.addColorStop(0.5, '#B49A62');
  g.addColorStop(1, '#7A653F');
  return g;
}

/** Engraved look: dark undercut, soft highlight, then the metallic fill. */
export function engravedText(ctx: Ctx, text: string, x: number, y: number, spacing: number, capHeight: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  spacedText(ctx, text, x + 2.5, y + 3.5, spacing);
  ctx.fillStyle = 'rgba(255,236,190,0.28)';
  spacedText(ctx, text, x - 1, y - 1.2, spacing);
  ctx.fillStyle = metalFill(ctx, y - capHeight, y);
  spacedText(ctx, text, x, y, spacing);
  ctx.restore();
}

export function drawDivider(ctx: Ctx, cx: number, y: number, half: number) {
  ctx.save();
  for (const dir of [-1, 1]) {
    const g = ctx.createLinearGradient(cx, 0, cx + dir * half, 0);
    g.addColorStop(0, 'rgba(180,154,98,0.95)');
    g.addColorStop(1, 'rgba(180,154,98,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 16, y);
    ctx.lineTo(cx + dir * half, y);
    ctx.stroke();
  }
  ctx.fillStyle = palette.gold;
  ctx.beginPath();
  ctx.moveTo(cx, y - 6);
  ctx.lineTo(cx + 6, y);
  ctx.lineTo(cx, y + 6);
  ctx.lineTo(cx - 6, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawHeading(ctx: Ctx, text: string, cx: number, y: number) {
  ctx.save();
  ctx.font = `italic 700 54px ${ROYAL}`;
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = metalFill(ctx, y - 40, y + 10);
  spacedText(ctx, text, cx, y, 0);
  ctx.restore();
  drawDivider(ctx, cx, y + 34, 210);
}

/** Soft light-gold fill for body copy. */
export function goldBody(ctx: Ctx, top: number, bottom: number) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, '#EEDDAE');
  g.addColorStop(1, '#C8AC70');
  return g;
}

/** Shrinks the font size until `text` fits `maxWidth`. */
export function fitFont(ctx: Ctx, text: string, weight: string, family: string, start: number, maxWidth: number) {
  let size = start;
  ctx.font = `italic ${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 20) {
    size -= 2;
    ctx.font = `italic ${weight} ${size}px ${family}`;
  }
  return size;
}

/** Paints the supplied ornamental artwork untouched (graceful fallback if missing). */
export function drawBase(ctx: Ctx, art: HTMLImageElement | null) {
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (art) {
    ctx.drawImage(art, 0, 0, TEX_W, TEX_H);
  } else {
    ctx.fillStyle = palette.charcoal;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, TEX_W - 80, TEX_H - 80);
  }
  ctx.restore();
}
