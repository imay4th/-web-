import type { BackgroundTheme, DiceTheme, AccentTheme } from './theme-types';

export const backgroundThemes: BackgroundTheme[] = [
  {
    id: 'mahogany',
    name: 'マホガニー',
    vars: {
      '--bg-table': '#3d2b1f',
      '--bg-table-dark': '#2a1a10',
      '--bg-table-light': '#5a3e2e',
    },
    bodyBackground:
      'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.03) 50px, rgba(0,0,0,0.03) 51px), repeating-linear-gradient(95deg, transparent, transparent 80px, rgba(0,0,0,0.02) 80px, rgba(0,0,0,0.02) 81px), radial-gradient(ellipse at 50% 30%, #5a3e2e 0%, #3d2b1f 40%, #2a1a10 100%)',
  },
  {
    id: 'felt',
    name: 'フェルト',
    vars: {
      '--bg-table': '#1a4a2e',
      '--bg-table-dark': '#0d3320',
      '--bg-table-light': '#2a6b45',
    },
    bodyBackground:
      'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px), radial-gradient(ellipse at 50% 30%, #2a6b45 0%, #1a4a2e 40%, #0d3320 100%)',
  },
  {
    id: 'night',
    name: 'ナイト',
    vars: {
      '--bg-table': '#0d1b2a',
      '--bg-table-dark': '#050e18',
      '--bg-table-light': '#1a2a40',
    },
    bodyBackground:
      'radial-gradient(circle at 30% 20%, rgba(50,80,140,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(50,80,140,0.1) 0%, transparent 40%), radial-gradient(ellipse at 50% 30%, #1a2a40 0%, #0d1b2a 40%, #050e18 100%)',
  },
  {
    id: 'ocean',
    name: 'オーシャン',
    vars: {
      '--bg-table': '#0a3456',
      '--bg-table-dark': '#042040',
      '--bg-table-light': '#145a80',
    },
    bodyBackground:
      'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px), radial-gradient(ellipse at 50% 30%, #145a80 0%, #0a3456 40%, #042040 100%)',
  },
];

export const diceThemes: DiceTheme[] = [
  {
    id: 'classic',
    name: 'クラシック',
    vars: {
      '--die-bg': 'linear-gradient(145deg, #ffffff, #f0ebe3)',
      '--die-border': '#d4c8b8',
      '--die-shadow':
        '0 4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.05)',
      '--dot-bg': 'radial-gradient(circle at 35% 35%, #444, #1a1a1a)',
      '--dot-shadow': 'inset 0 1px 2px rgba(0,0,0,0.3)',
    },
  },
  {
    id: 'ebony',
    name: 'エボニー',
    vars: {
      '--die-bg': 'linear-gradient(145deg, #3a3a3a, #1a1a1a)',
      '--die-border': '#555',
      '--die-shadow':
        '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.2)',
      '--dot-bg': 'radial-gradient(circle at 35% 35%, #fff, #ddd)',
      '--dot-shadow': 'inset 0 1px 2px rgba(0,0,0,0.1)',
    },
  },
  {
    id: 'wooden',
    name: 'ウッド',
    vars: {
      '--die-bg': 'linear-gradient(145deg, #c8a876, #a07840)',
      '--die-border': '#8a6530',
      '--die-shadow':
        '0 4px 8px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)',
      '--dot-bg': 'radial-gradient(circle at 35% 35%, #4a3520, #2a1a0a)',
      '--dot-shadow': 'inset 0 1px 2px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'neon',
    name: 'ネオン',
    vars: {
      '--die-bg': 'linear-gradient(145deg, #2a1a3a, #1a0a2a)',
      '--die-border': '#4a2a6a',
      '--die-shadow':
        '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2), inset 0 2px 0 rgba(100,50,150,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
      '--dot-bg': 'radial-gradient(circle at 35% 35%, #00e5ff, #0090a0)',
      '--dot-shadow': '0 0 6px rgba(0,229,255,0.6), inset 0 1px 2px rgba(0,0,0,0.2)',
    },
  },
  {
    id: 'eva01',
    name: 'EVA01',
    vars: {},
    imagePath: '/dice/eva01',
  },
  {
    id: 'eva00_blue',
    name: 'EVA00',
    vars: {},
    imagePath: '/dice/eva00_blue',
  },
  {
    id: 'eva00_yellow',
    name: 'EVA00-Re',
    vars: {},
    imagePath: '/dice/eva00_yellow',
  },
  {
    id: 'eva02',
    name: 'EVA02',
    vars: {},
    imagePath: '/dice/eva02',
  },
];

export const accentThemes: AccentTheme[] = [
  {
    id: 'gold',
    name: 'ゴールド',
    vars: {
      '--accent': '#c5a44e',
      '--accent-dark': '#a8892e',
      '--accent-light': '#dbc06a',
      '--accent-glow': 'rgba(197, 164, 78, 0.3)',
      '--btn-primary': '#c5a44e',
      '--btn-primary-hover': '#d4b35d',
      '--shadow-gold': '0 0 20px rgba(197, 164, 78, 0.2)',
      '--border-color': 'rgba(212, 160, 23, 0.2)',
      '--border-light': 'rgba(212, 160, 23, 0.1)',
      '--card-border': 'rgba(212, 160, 23, 0.15)',
    },
  },
  {
    id: 'silver',
    name: 'シルバー',
    vars: {
      '--accent': '#9aa0a8',
      '--accent-dark': '#7a8088',
      '--accent-light': '#b8bec6',
      '--accent-glow': 'rgba(154, 160, 168, 0.3)',
      '--btn-primary': '#9aa0a8',
      '--btn-primary-hover': '#b0b6be',
      '--shadow-gold': '0 0 20px rgba(154, 160, 168, 0.2)',
      '--border-color': 'rgba(154, 160, 168, 0.2)',
      '--border-light': 'rgba(154, 160, 168, 0.1)',
      '--card-border': 'rgba(154, 160, 168, 0.15)',
    },
  },
  {
    id: 'rose',
    name: 'ローズ',
    vars: {
      '--accent': '#c47a7a',
      '--accent-dark': '#a45a5a',
      '--accent-light': '#d89a9a',
      '--accent-glow': 'rgba(196, 122, 122, 0.3)',
      '--btn-primary': '#c47a7a',
      '--btn-primary-hover': '#d48a8a',
      '--shadow-gold': '0 0 20px rgba(196, 122, 122, 0.2)',
      '--border-color': 'rgba(196, 122, 122, 0.2)',
      '--border-light': 'rgba(196, 122, 122, 0.1)',
      '--card-border': 'rgba(196, 122, 122, 0.15)',
    },
  },
  {
    id: 'cyan',
    name: 'シアン',
    vars: {
      '--accent': '#00b4d8',
      '--accent-dark': '#0090b0',
      '--accent-light': '#48d1e8',
      '--accent-glow': 'rgba(0, 180, 216, 0.3)',
      '--btn-primary': '#00b4d8',
      '--btn-primary-hover': '#20c4e8',
      '--shadow-gold': '0 0 20px rgba(0, 180, 216, 0.2)',
      '--border-color': 'rgba(0, 180, 216, 0.2)',
      '--border-light': 'rgba(0, 180, 216, 0.1)',
      '--card-border': 'rgba(0, 180, 216, 0.15)',
    },
  },
];
