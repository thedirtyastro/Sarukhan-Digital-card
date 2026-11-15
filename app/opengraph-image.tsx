import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #050608 0%, #0e1018 40%, #1a1508 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* gold corner accents */}
        <div style={{ position: 'absolute', top: 32, left: 32, width: 60, height: 60, borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 32, right: 32, width: 60, height: 60, borderTop: '2px solid #c9a84c', borderRight: '2px solid #c9a84c', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 32, left: 32, width: 60, height: 60, borderBottom: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 32, right: 32, width: 60, height: 60, borderBottom: '2px solid #c9a84c', borderRight: '2px solid #c9a84c', display: 'flex' }} />

        {/* glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(201,168,76,0.18) 0%, transparent 70%)', display: 'flex' }} />

        {/* name */}
        <div style={{ fontSize: 72, fontWeight: 700, color: '#c9a84c', letterSpacing: '0.06em', marginBottom: 8, display: 'flex' }}>
          SARUKHAN
        </div>
        <div style={{ fontSize: 22, color: '#9aa6bb', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 48, display: 'flex' }}>
          Full Stack Developer
        </div>

        {/* divider */}
        <div style={{ width: 320, height: 1, background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', marginBottom: 48, display: 'flex' }} />

        {/* social platforms */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[
            { label: 'X / Twitter', handle: '@thedirtyastro',       color: '#e5dfd1' },
            { label: 'Instagram',   handle: '@thedirtyastro',       color: '#e1306c' },
            { label: 'WhatsApp',    handle: '+91 70929 78110',       color: '#25d366' },
            { label: 'GitHub',      handle: 'thedirtyastro',         color: '#9aa6bb' },
            { label: 'LinkedIn',    handle: 'sarukhan-muthuraman',   color: '#0a66c2' },
          ].map(({ label, handle, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 13, color: '#6b7280', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex' }}>{label}</div>
              <div style={{ fontSize: 15, color, fontFamily: 'monospace', display: 'flex' }}>{handle}</div>
            </div>
          ))}
        </div>

        {/* tagline */}
        <div style={{ position: 'absolute', bottom: 52, fontSize: 14, color: 'rgba(201,168,76,0.55)', letterSpacing: '0.25em', display: 'flex' }}>
          NEOPHILE • VAGABOND • ELEUTHEROMANIAC
        </div>
      </div>
    ),
    { ...size },
  );
}
