/**
 * Premium Color System for Dynamic Tables
 * Automatically generates beautiful, consistent colors for tables and cards
 */

export interface ColorTheme {
  name: string;
  gradient: string;
  solid: string;
  light: string;
  hover: string;
  text: string;
  border: string;
  shadow: string;
  accent: string;
}

// Premium color themes with gradients and professional aesthetics
const premiumThemes: ColorTheme[] = [
  {
    name: 'Ocean Breeze',
    gradient: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
    solid: 'bg-blue-500',
    light: 'bg-blue-50',
    hover: 'hover:bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    shadow: 'shadow-blue-500/20',
    accent: 'bg-cyan-400'
  },
  {
    name: 'Sunset Glow',
    gradient: 'bg-gradient-to-br from-orange-400 via-pink-500 to-red-500',
    solid: 'bg-orange-500',
    light: 'bg-orange-50',
    hover: 'hover:bg-orange-600',
    text: 'text-orange-600',
    border: 'border-orange-200',
    shadow: 'shadow-orange-500/20',
    accent: 'bg-pink-400'
  },
  {
    name: 'Forest Essence',
    gradient: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600',
    solid: 'bg-green-500',
    light: 'bg-green-50',
    hover: 'hover:bg-green-600',
    text: 'text-green-600',
    border: 'border-green-200',
    shadow: 'shadow-green-500/20',
    accent: 'bg-emerald-400'
  },
  {
    name: 'Royal Purple',
    gradient: 'bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600',
    solid: 'bg-purple-500',
    light: 'bg-purple-50',
    hover: 'hover:bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-200',
    shadow: 'shadow-purple-500/20',
    accent: 'bg-violet-400'
  },
  {
    name: 'Rose Gold',
    gradient: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-400',
    solid: 'bg-rose-500',
    light: 'bg-rose-50',
    hover: 'hover:bg-rose-600',
    text: 'text-rose-600',
    border: 'border-rose-200',
    shadow: 'shadow-rose-500/20',
    accent: 'bg-pink-400'
  },
  {
    name: 'Golden Hour',
    gradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
    solid: 'bg-amber-500',
    light: 'bg-amber-50',
    hover: 'hover:bg-amber-600',
    text: 'text-amber-600',
    border: 'border-amber-200',
    shadow: 'shadow-amber-500/20',
    accent: 'bg-yellow-400'
  },
  {
    name: 'Midnight Blue',
    gradient: 'bg-gradient-to-br from-slate-600 via-blue-700 to-indigo-800',
    solid: 'bg-slate-600',
    light: 'bg-slate-50',
    hover: 'hover:bg-slate-700',
    text: 'text-slate-600',
    border: 'border-slate-200',
    shadow: 'shadow-slate-500/20',
    accent: 'bg-blue-500'
  },
  {
    name: 'Emerald Dreams',
    gradient: 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500',
    solid: 'bg-teal-500',
    light: 'bg-teal-50',
    hover: 'hover:bg-teal-600',
    text: 'text-teal-600',
    border: 'border-teal-200',
    shadow: 'shadow-teal-500/20',
    accent: 'bg-cyan-400'
  }
];

/**
 * Generate a consistent hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a consistent color theme for a table name
 * Same table name will always get the same beautiful color theme
 */
export function getTableColorTheme(tableName: string): ColorTheme {
  const hash = hashString(tableName.toLowerCase());
  const themeIndex = hash % premiumThemes.length;
  return premiumThemes[themeIndex];
}

/**
 * Get all available themes for preview or selection
 */
export function getAllColorThemes(): ColorTheme[] {
  return [...premiumThemes];
}

/**
 * Generate premium card styling classes
 */
export function getPremiumCardClasses(theme: ColorTheme): string {
  return `
    bg-white rounded-xl shadow-xl ${theme.shadow} border ${theme.border}
    backdrop-blur-sm hover:shadow-2xl transition-all duration-300
    hover:scale-[1.02] hover:-translate-y-1
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate premium header styling classes
 */
export function getPremiumHeaderClasses(theme: ColorTheme): string {
  return `
    ${theme.gradient} text-white rounded-t-xl px-6 py-4
    shadow-lg border-b border-white/20
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate premium button styling classes
 */
export function getPremiumButtonClasses(theme: ColorTheme, variant: 'primary' | 'secondary' = 'primary'): string {
  if (variant === 'primary') {
    return `
      ${theme.gradient} text-white px-4 py-2 rounded-lg
      shadow-md ${theme.shadow} hover:shadow-lg
      transition-all duration-200 hover:scale-105
      font-medium border border-white/20
    `.trim().replace(/\s+/g, ' ');
  } else {
    return `
      bg-white ${theme.text} border ${theme.border} px-4 py-2 rounded-lg
      shadow-sm hover:shadow-md ${theme.hover} hover:text-white
      transition-all duration-200 font-medium
    `.trim().replace(/\s+/g, ' ');
  }
}

/**
 * Generate premium table row styling classes
 */
export function getPremiumRowClasses(theme: ColorTheme, isEven: boolean = false): string {
  const baseClasses = `
    transition-all duration-200 hover:shadow-md hover:bg-gradient-to-r
    hover:from-${theme.light} hover:to-white border-b border-gray-100
  `.trim().replace(/\s+/g, ' ');
  
  return isEven ? `${baseClasses} bg-gray-50/50` : baseClasses;
}

/**
 * Generate premium form input styling classes
 */
export function getPremiumInputClasses(theme: ColorTheme): string {
  return `
    w-full px-4 py-3 border ${theme.border} rounded-lg
    focus:ring-2 focus:ring-${theme.solid}/20 focus:border-${theme.solid}
    transition-all duration-200 bg-white shadow-sm
    hover:shadow-md focus:shadow-lg
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate premium badge/status styling classes
 */
export function getPremiumBadgeClasses(theme: ColorTheme): string {
  return `
    inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
    ${theme.light} ${theme.text} border ${theme.border}
    shadow-sm
  `.trim().replace(/\s+/g, ' ');
}