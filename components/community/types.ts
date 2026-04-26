import type { ReactionType } from '../../services/communityReactions';

export type ThemeKey = 'gratitude' | 'healing' | 'release' | 'feedback';

export interface ThemeConfig {
  key: ThemeKey;
  label: string;
  icon: string;
  color: string;
  rgb: string;
}

export const THEMES: ReadonlyArray<ThemeConfig> = [
  { key: 'gratitude', label: 'Gratitud',   icon: 'spa',     color: '#8BA888', rgb: '139,168,136' },
  { key: 'healing',   label: 'Sanación',   icon: 'healing', color: '#C9A84C', rgb: '201,168,76'  },
  { key: 'release',   label: 'Soltar',     icon: 'air',     color: '#7B9BB5', rgb: '123,155,181' },
  { key: 'feedback',  label: 'Testimonio', icon: 'reviews', color: '#A78BFA', rgb: '167,139,250' },
] as const;

export const themeConfig = (theme: string): ThemeConfig =>
  THEMES.find((t) => t.key === theme) || THEMES[0];

export interface ReactionMeta {
  type: ReactionType;
  label: string;
  icon: string;
  color: string;
  rgb: string;
}

export const REACTIONS: ReadonlyArray<ReactionMeta> = [
  { type: 'love',       label: 'Te quiero',  icon: 'favorite',           color: '#F472B6', rgb: '244,114,182' },
  { type: 'hug',        label: 'Te abrazo',  icon: 'volunteer_activism', color: '#E8A87C', rgb: '232,168,124' },
  { type: 'accompany',  label: 'Te acompaño',icon: 'flutter_dash',       color: '#8BA888', rgb: '139,168,136' },
  { type: 'reverence',  label: 'Reverencia', icon: 'self_improvement',   color: '#C9A84C', rgb: '201,168,76'  },
] as const;

export const COMPOSE_PROMPTS: ReadonlyArray<string> = [
  '¿Qué carga estás soltando hoy?',
  '¿Qué te está sosteniendo en este momento?',
  '¿Qué necesitás compartir con la tribu?',
  '¿Qué mensaje del cuerpo estás escuchando?',
  '¿A qué le estás dando espacio?',
  '¿Qué gratitud florece en vos hoy?',
  '¿Qué intención plantás esta semana?',
  '¿Qué emoción te está visitando?',
] as const;

export const formatRelativeTime = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

// Sacred Noir palette
export const NAVY = '#060D1B';
export const PANEL = '#0E1420';
export const GOLD = '#C9A84C';
export const GOLD_GRAD = 'linear-gradient(135deg, #C9A84C, #F0D080, #C9A84C)';
export const CREMA = '#E8E0D0';
export const TEXT_MUTED = '#8B7A6A';
export const BORDER = 'rgba(255,255,255,0.06)';
