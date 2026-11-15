# Gotham ID Card — 3D hanging identity card

Next.js (App Router) · React Three Fiber · Rapier · Framer Motion · Tailwind

## Run
```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

## Add before launch
- `public/images/profile-photo.png` — your portrait (a clean placeholder shows until it exists)
- `public/sounds/flip.mp3` — optional; the sound toggle only appears if this file exists

## Edit your details
Everything lives in `config/profile.ts`. `x` and `instagram` are empty: their icons stay dimmed and inert until you add URLs.

## How it works
- Faces are painted to canvas textures on top of `public/images/royal-card-texture.png` (artwork untouched), so
  fonts, engraving and layout are exact. `lib/cardLayout.ts` holds the texture-space hit regions.
- Back-face links are hit-tested from the raycast UV; hover glow is a separate additive mesh.
  `SocialLinks.tsx` also renders real HTML links (visible on keyboard focus) mirroring every action.
- Physics: fixed anchor → connector body → card body (rope joints, no collisions), plus a restoring
  torque and a mass-normalised pointer spring. All tuning is in `PHYSICS` in `hooks/useCardPhysics.ts`.
- Flip is a separate spring (`useCardFlip`) applied to an inner group, so it never disturbs the pendulum.
