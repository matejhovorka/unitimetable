// Curated color themes for course codes (Tailwind-compatible styling)
export interface CourseColorTheme {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  accent: string;
  rawHex: string;
}

const PALETTE: CourseColorTheme[] = [
  {
    bg: 'bg-indigo-950/70 hover:bg-indigo-900/80',
    border: 'border-indigo-500/50',
    text: 'text-indigo-200',
    badgeBg: 'bg-indigo-500/20 text-indigo-300',
    accent: '#6366f1',
    rawHex: '#4f46e5',
  },
  {
    bg: 'bg-emerald-950/70 hover:bg-emerald-900/80',
    border: 'border-emerald-500/50',
    text: 'text-emerald-200',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    accent: '#10b981',
    rawHex: '#059669',
  },
  {
    bg: 'bg-violet-950/70 hover:bg-violet-900/80',
    border: 'border-violet-500/50',
    text: 'text-violet-200',
    badgeBg: 'bg-violet-500/20 text-violet-300',
    accent: '#8b5cf6',
    rawHex: '#7c3aed',
  },
  {
    bg: 'bg-amber-950/70 hover:bg-amber-900/80',
    border: 'border-amber-500/50',
    text: 'text-amber-200',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    accent: '#f59e0b',
    rawHex: '#d97706',
  },
  {
    bg: 'bg-sky-950/70 hover:bg-sky-900/80',
    border: 'border-sky-500/50',
    text: 'text-sky-200',
    badgeBg: 'bg-sky-500/20 text-sky-300',
    accent: '#0284c7',
    rawHex: '#0284c7',
  },
  {
    bg: 'bg-rose-950/70 hover:bg-rose-900/80',
    border: 'border-rose-500/50',
    text: 'text-rose-200',
    badgeBg: 'bg-rose-500/20 text-rose-300',
    accent: '#f43f5e',
    rawHex: '#e11d48',
  },
  {
    bg: 'bg-teal-950/70 hover:bg-teal-900/80',
    border: 'border-teal-500/50',
    text: 'text-teal-200',
    badgeBg: 'bg-teal-500/20 text-teal-300',
    accent: '#14b8a6',
    rawHex: '#0d9488',
  },
  {
    bg: 'bg-fuchsia-950/70 hover:bg-fuchsia-900/80',
    border: 'border-fuchsia-500/50',
    text: 'text-fuchsia-200',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300',
    accent: '#d946ef',
    rawHex: '#c026d3',
  },
  {
    bg: 'bg-cyan-950/70 hover:bg-cyan-900/80',
    border: 'border-cyan-500/50',
    text: 'text-cyan-200',
    badgeBg: 'bg-cyan-500/20 text-cyan-300',
    accent: '#06b6d4',
    rawHex: '#0891b2',
  },
  {
    bg: 'bg-orange-950/70 hover:bg-orange-900/80',
    border: 'border-orange-500/50',
    text: 'text-orange-200',
    badgeBg: 'bg-orange-500/20 text-orange-300',
    accent: '#f97316',
    rawHex: '#ea580c',
  },
];

export function getCourseTheme(courseCode: string): CourseColorTheme {
  if (!courseCode) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = (hash << 5) - hash + courseCode.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
