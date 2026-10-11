import {
  CalendarDays, CheckSquare, Flame, Image as ImageIcon, LayoutGrid, NotebookPen, BarChart3, UserRound,
  Clock, Minus, Quote,
  type LucideIcon,
} from 'lucide-react';
import type {
  AutoMetric, BlockType, CheckItem, HabitItem, ProgressItem, ScheduleItem, Section, SectionType,
} from '../types';
import { uid } from './util';

export interface SectionDef {
  name: string;
  desc: string;
  icon: LucideIcon;
  span: number;
  /** Bisa di-restart (punya progress yang dikosongkan) */
  restartable: boolean;
  create: () => Omit<Section, 'id' | 'type'>;
  /** Kosongkan progress, pertahankan struktur */
  reset: (s: Section) => Section;
}

const keep = (s: Section) => s;

export const SECTION_DEFS: Partial<Record<BlockType, SectionDef>> = {
  'linked-view': {
    name: 'Linked View',
    desc: 'Tampilkan data dari Source Table dalam view berbeda.',
    icon: LayoutGrid,
    span: 8,
    restartable: true,
    create: () => ({ label: 'linked view', title: 'Linked View', span: 8, items: [] }),
    reset: keep,
  },
  'source-table': {
    name: 'Source Table',
    desc: 'Tabel database induk.',
    icon: LayoutGrid,
    span: 12,
    restartable: false,
    create: () => ({ label: 'source table', title: 'Tabel Master', span: 12, items: [] }),
    reset: keep,
  },
  schedule: {
    name: 'Jadwal',
    desc: 'Board per hari, bisa dilihat sebagai tabel.',
    icon: CalendarDays,
    span: 12,
    restartable: true,
    create: () => ({ label: 'time table', title: 'Jadwal', span: 12, items: [], meta: { view: 'board' } }),
    reset: (s) => ({ ...s, items: ((s.items || []) as ScheduleItem[]).map((i) => ({ ...i, status: 'todo' })) }),
  },
  habit: {
    name: 'Habit tracker',
    desc: 'Centang harian Senin–Minggu, persen dan streak.',
    icon: Flame,
    span: 8,
    restartable: true,
    create: () => ({ label: 'habit', title: 'Habit minggu ini', span: 8, items: [], meta: {} }),
    reset: (s) => ({ ...s, items: ((s.items || []) as HabitItem[]).map((h) => ({ ...h, days: [0, 0, 0, 0, 0, 0, 0] })) }),
  },
  check: {
    name: 'Checklist',
    desc: 'Daftar tugas. Bisa dihubungkan ke item jadwal.',
    icon: CheckSquare,
    span: 4,
    restartable: true,
    create: () => ({ label: 'to do', title: 'Tugas', span: 4, items: [], meta: {} }),
    reset: (s) => ({ ...s, items: ((s.items || []) as CheckItem[]).map((i) => ({ ...i, done: false })) }),
  },
  note: {
    name: 'Catatan',
    desc: 'Teks bebas untuk refleksi atau ide.',
    icon: NotebookPen,
    span: 6,
    restartable: true,
    create: () => ({ label: 'notes', title: 'Catatan', span: 6, items: [], meta: { text: '' } }),
    reset: (s) => ({ ...s, meta: { ...(s.meta || {}), text: s.meta?.template ?? '' } }),
  },
  progress: {
    name: 'Progress',
    desc: 'Hitung otomatis dari habit, tugas, dan jadwal.',
    icon: BarChart3,
    span: 4,
    restartable: true,
    create: () => ({ label: 'progress', title: 'Progress minggu ini', span: 4, items: [], meta: { auto: true } }),
    reset: (s) => ({ ...s, items: ((s.items || []) as ProgressItem[]).map((p) => ({ ...p, value: 0 })) }),
  },
  gallery: {
    name: 'Galeri',
    desc: 'Kartu bergambar. Klik kartu untuk membuka halamannya.',
    icon: LayoutGrid,
    span: 12,
    restartable: false,
    create: () => ({ label: 'activity', title: 'Galeri', span: 12, items: [], meta: {} }),
    reset: keep,
  },
  profile: {
    name: 'Profil',
    desc: 'Foto dan daftar keterangan seperti "about me".',
    icon: UserRound,
    span: 8,
    restartable: false,
    create: () => ({ label: 'about me . . .', title: '', span: 8, items: [], meta: { photo: '' } }),
    reset: keep,
  },
  image: {
    name: 'Gambar',
    desc: 'Satu gambar dengan keterangan.',
    icon: ImageIcon,
    span: 4,
    restartable: false,
    create: () => ({ label: 'image', title: '', span: 4, items: [], meta: { src: '', caption: '' } }),
    reset: keep,
  },
  divider: {
    name: 'Divider',
    desc: 'Pemisah garis diagonal khas navy.',
    icon: Minus,
    span: 12,
    restartable: false,
    create: () => ({ label: 'divider', title: '', span: 12, items: [] }),
    reset: keep,
  },
  clock: {
    name: 'Analog Clock',
    desc: 'Widget jam radar analog Indify.',
    icon: Clock,
    span: 4,
    restartable: false,
    create: () => ({ label: 'widget', title: 'Analog Clock', span: 4, items: [] }),
    reset: keep,
  },
  quote: {
    name: 'Quote Block',
    desc: 'Kutipan inspirasi editorial.',
    icon: Quote,
    span: 12,
    restartable: false,
    create: () => ({ label: 'quote', title: '', span: 12, items: [], meta: { quote: '', author: '' } }),
    reset: keep,
  },
};

export const SECTION_ORDER: SectionType[] = [
  'linked-view',
  'source-table',
  'divider',
  'clock',
  'schedule',
  'habit',
  'check',
  'note',
  'progress',
  'gallery',
  'profile',
  'image',
  'quote',
];

/** Metrik otomatis dari section lain, dipakai section Progress dan laporan. */
export function computeAuto(sections: Section[]): AutoMetric[] {
  const out: AutoMetric[] = [];
  for (const s of sections) {
    if (s.type === 'habit') {
      const items = (s.items || []) as HabitItem[];
      if (!items.length) continue;
      const done = items.reduce((a, h) => a + h.days.filter((d: number) => d === 1).length, 0);
      out.push({ label: s.title || 'Habit', value: done, max: items.length * 7 });
    } else if (s.type === 'check') {
      const items = (s.items || []) as CheckItem[];
      if (!items.length) continue;
      out.push({ label: s.title || 'Tugas', value: items.filter((i) => i.done).length, max: items.length });
    } else if (s.type === 'schedule') {
      const items = ((s.items || []) as ScheduleItem[]).filter((i) => i.status !== 'canceled');
      if (!items.length) continue;
      out.push({ label: s.title || 'Jadwal', value: items.filter((i) => i.status === 'done').length, max: items.length });
    }
  }
  return out;
}

export const pct = (v: number, m: number) => (m > 0 ? Math.round((v / m) * 100) : 0);

export function habitStreak(days: number[], upTo: number) {
  let i = upTo;
  if (days[i] !== 1) i -= 1; // hari ini belum dicentang tidak memutus streak
  let n = 0;
  while (i >= 0 && days[i] === 1) { n++; i--; }
  return n;
}

export const newId = uid;
