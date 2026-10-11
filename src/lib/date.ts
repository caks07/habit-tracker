export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
export const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const DAY_COLORS = ['green', 'pink', 'blue', 'red', 'brown', 'purple', 'orange'] as const;

/** 0 = Senin … 6 = Minggu */
export const todayIndex = (d = new Date()) => (d.getDay() + 6) % 7;

export function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7);
  return { year: t.getUTCFullYear(), week };
}

const fmtDay = new Intl.DateTimeFormat('id-ID', { day: 'numeric' });
const fmtDayMonth = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
const fmtFull = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export function weekRange(d = new Date()) {
  const mon = new Date(d);
  mon.setDate(d.getDate() - todayIndex(d));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const sameMonth = mon.getMonth() === sun.getMonth();
  return `${sameMonth ? fmtDay.format(mon) : fmtDayMonth.format(mon)}–${fmtFull.format(sun)}`;
}

export function weekInfo(d = new Date()) {
  const { year, week } = isoWeek(d);
  return { year, week, key: `${year}-W${String(week).padStart(2, '0')}`, range: weekRange(d) };
}

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

export const longToday = () =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

export const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** YYYY-MM-DD string for today */
export function getTodayDateStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Check if dateStr (YYYY-MM-DD or formatted) is today */
export function isDateToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const today = getTodayDateStr();
  return dateStr === today || dateStr.startsWith(today);
}

/** Check if dateStr falls within current Monday-Sunday week */
export function isDateThisWeek(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - todayIndex(now));
  mon.setHours(0, 0, 0, 0);

  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);

  return d >= mon && d <= sun;
}

/** Format YYYY-MM-DD to Indonesian short format, e.g. "7 Okt" */
export function formatShortDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      return fmtDayMonth.format(d);
    }
  }
  return dateStr;
}
