/**
 * Single source of truth for every personal detail rendered on the card.
 * Empty strings are hidden automatically (e.g. instagram).
 */
export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  x: string;
  instagram: string;
  whatsapp: string;
  portfolio: string;
  resume: string;
  resumeFileName: string;
  photo: string;
  /** 1 = photo as-is, lower = darker. Tune if your portrait looks too bright or too dull. */
  photoExposure: number;
  texture: string;
  tagline: string;
  intro: string;
  about: string;
}

export const profile: Profile = {
  name: 'Sarukhan Muthuraman',
  title: 'Full Stack Developer',
  email: 's.saru7072@gmail.com',
  phone: '+91 7092978110',
  location: 'India',
  github: 'https://github.com/thedirtyastro',
  linkedin: 'https://linkedin.com/in/sarukhan-muthuraman',
  x: 'https://x.com/thedirtyastro', 
  instagram: 'http://instagram.com/thedirtyastro',
  whatsapp: 'https://wa.me/917092978110',
  portfolio: 'https://portfolio-weld-mu-dw8u3j4h6w.vercel.app/',
  resume: '/resume.pdf',
  resumeFileName: 'Saruk-Resume.pdf',
  photo: '/images/profile-photo.png',
  photoExposure: 0.65,
  texture: '/images/royal-card-texture.png',
  tagline: 'Neophile • Vagabond • Eleutheromaniac ✨',
  intro:
    'A heart that loves deeply, a mind that dreams wildly, eyes that seek beauty, and a soul that belongs to no boundaries.',
  about:
    'Developer by profession, neophile by nature, vagabond at heart, and a free spirit by choice. Passionate about photography, cinema, travel, music, emerging technologies, and social causes. A curious mind that loves learning, a creative soul that finds beauty in little things, and a heart that values genuine connections. Always chasing new experiences, collecting stories, questioning the ordinary, and finding my own way through life.',
};
