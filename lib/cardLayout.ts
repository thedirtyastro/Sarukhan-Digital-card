/** Shared constants: card geometry (world units), texture space (px) and palette. */
export const TEX_W = 1010;
export const TEX_H = 1557;

export const CARD_H = 4.6;
export const CARD_W = (CARD_H * TEX_W) / TEX_H;
export const CARD_RADIUS = 0.13;
export const FACE_Z = 0.0535;

/** Distance from the connector clip to the eyelet hole on the card. */
export const HARDWARE_LENGTH = 1.1;
export const ATTACH_Y = CARD_H / 2 + 0.09;

export const ANCHOR_POS: [number, number, number] = [0, 3.35, 0];
export const CONNECTOR_POS: [number, number, number] = [0, 2.95, 0];
export const CARD_POS: [number, number, number] = [
  0,
  CONNECTOR_POS[1] - HARDWARE_LENGTH - ATTACH_Y,
  0,
];

/** World-units of vertical space the camera frames at rest. */
export const VIEW_HEIGHT = 6.8;

export const palette = {
  midnight: '#050608',
  charcoal: '#0A0C10',
  graphite: '#141820',
  gunmetal: '#292F38',
  gold: '#B49A62',
  goldDeep: '#806B43',
  ivory: '#E5DFD1',
  muted: '#858B96',
  shadow: '#000000',
} as const;

export type IconName =
  | 'mail' | 'phone' | 'pin' | 'github' | 'linkedin'
  | 'instagram' | 'x' | 'globe' | 'download' | 'send' | 'external';

export interface HitRegion {
  id: string;
  label: string;
  /** Rectangle in texture px (1010 × 1557 space). */
  x: number;
  y: number;
  w: number;
  h: number;
  href: string;
  kind: 'link' | 'mail' | 'tel' | 'download';
}

export function findRegion(regions: HitRegion[], x: number, y: number): HitRegion | null {
  return regions.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) ?? null;
}

export function activateRegion(region: HitRegion, downloadName = 'download.pdf') {
  if (region.kind === 'download') {
    const a = document.createElement('a');
    a.href = region.href;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else if (region.kind === 'mail' || region.kind === 'tel') {
    window.location.href = region.href;
  } else {
    window.open(region.href, '_blank', 'noopener,noreferrer');
  }
}
