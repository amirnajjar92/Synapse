// Theme configuration for the app

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    card: string;
    cardAlt: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    border: string;
    borderAlt: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      background: '#2C2C2C',
      card: '#000000',
      cardAlt: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#9CA3AF',
      textMuted: '#6B7280',
      primary: '#3B63CF',
      border: '#3B3B3B',
      borderAlt: '#4B5563',
    },
  },
  {
    id: 'light',
    name: 'Light Mode',
    colors: {
      background: '#F3F4F6',
      card: '#FFFFFF',
      cardAlt: '#F9FAFB',
      text: '#111827',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF',
      primary: '#3B63CF',
      border: '#E5E7EB',
      borderAlt: '#D1D5DB',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      background: '#0F172A',
      card: '#1E293B',
      cardAlt: '#334155',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      primary: '#60A5FA',
      border: '#334155',
      borderAlt: '#475569',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      background: '#14532D',
      card: '#166534',
      cardAlt: '#15803D',
      text: '#F0FDF4',
      textSecondary: '#86EFAC',
      textMuted: '#4ADE80',
      primary: '#22C55E',
      border: '#166534',
      borderAlt: '#15803D',
    },
  },
  {
    id: 'purple',
    name: 'Purple Haze',
    colors: {
      background: '#3B0764',
      card: '#581C87',
      cardAlt: '#6B21A8',
      text: '#FAF5FF',
      textSecondary: '#D8B4FE',
      textMuted: '#C084FC',
      primary: '#A855F7',
      border: '#6B21A8',
      borderAlt: '#7C3AED',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      background: '#082F49',
      card: '#0C4A6E',
      cardAlt: '#075985',
      text: '#F0F9FF',
      textSecondary: '#7DD3FC',
      textMuted: '#38BDF8',
      primary: '#0EA5E9',
      border: '#0C4A6E',
      borderAlt: '#0369A1',
    },
  },
];

export const getTheme = (themeId: string): Theme => {
  return themes.find(t => t.id === themeId) || themes[0];
};

export const saveTheme = (themeId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('synapse_theme', themeId);
  }
};

export const loadTheme = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('synapse_theme') || 'dark';
  }
  return 'dark';
};
