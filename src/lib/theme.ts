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
      background: '#F5F5F5',
      card: '#FFFFFF',
      cardAlt: '#FAFAFA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      primary: '#2563EB',
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
      background: '#0F2A1F',
      card: '#1B3A2F',
      cardAlt: '#2A4A3F',
      text: '#F0FDF4',
      textSecondary: '#BBF7D0',
      textMuted: '#86EFAC',
      primary: '#10B981',
      border: '#2A4A3F',
      borderAlt: '#3A5A4F',
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
  {
    id: 'volcanic',
    name: 'Volcanic',
    colors: {
      background: '#171717',
      card: '#171717',
      cardAlt: '#4D4D4D',
      text: '#DEDEDE',
      textSecondary: '#DEDEDE',
      textMuted: '#9CA3AF',
      primary: '#F25623',
      border: '#4D4D4D',
      borderAlt: '#6B7280',
    },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    colors: {
      background: '#000000',
      card: '#14213d',
      cardAlt: '#1a2a4a',
      text: '#E5E5E5',
      textSecondary: '#E5E5E5',
      textMuted: '#9CA3AF',
      primary: '#FCA311',
      border: '#14213d',
      borderAlt: '#2a3a5a',
    },
  },
  {
    id: 'crimson',
    name: 'Crimson Night',
    colors: {
      background: '#000000',
      card: '#131211',
      cardAlt: '#1a1918',
      text: '#F2EAE3',
      textSecondary: '#D0C9C3',
      textMuted: '#9CA3AF',
      primary: '#FF073A',
      border: '#1a1918',
      borderAlt: '#2a2928',
    },
  },
  {
    id: 'coffee',
    name: 'Coffee & Cream',
    colors: {
      background: '#3E2723',
      card: '#4E342E',
      cardAlt: '#5D4037',
      text: '#FFF8E1',
      textSecondary: '#FFECB3',
      textMuted: '#FFD54F',
      primary: '#FF6F00',
      border: '#5D4037',
      borderAlt: '#6D4C41',
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
