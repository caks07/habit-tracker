import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Film,
  Flame,
  ListTodo,
} from 'lucide-react';
import { useStore } from '../../store';
import { DAYS, longToday, todayIndex } from '../../lib/date';
import { LinkedViewRenderer } from './LinkedViewRenderer';

export function TodayView() {
  const setView = useStore((s) => s.setView);
  const today = todayIndex();
  const dayName = DAYS[today];

  // Live Clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const timeStr = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Clock Hand Angles
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 font-mono space-y-8">
      {/* Header */}
      <div className="border-b border-ln/70 pb-4">
        <button
          type="button"
          onClick={() => setView({ name: 'dashboard' })}
          className="mb-2 flex items-center gap-1.5 text-[12px] text-dm hover:text-tx transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Dashboard Utama</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-tx">
              Fokus Hari Ini — {dayName}
            </h1>
            <p className="mt-1 text-[13px] text-dm">{longToday()}</p>
          </div>
          <div className="text-[15px] font-semibold text-nt bg-nv/30 px-3 py-1 rounded border border-nv">
            {timeStr}
          </div>
        </div>
      </div>

      {/* Grid: Clock Widget + Unified Multi-Source Daily Stream (PART 1, 20 & 21) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Indify Analog Clock Widget */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center rounded-lg border border-ln/70 bg-pn/40 p-6 text-center">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--ln)" strokeWidth="1.5" />
              {/* Hour hand */}
              <line
                x1="50"
                y1="50"
                x2={50 + 24 * Math.sin((hourDeg * Math.PI) / 180)}
                y2={50 - 24 * Math.cos((hourDeg * Math.PI) / 180)}
                stroke="var(--tx)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Minute hand */}
              <line
                x1="50"
                y1="50"
                x2={50 + 36 * Math.sin((minuteDeg * Math.PI) / 180)}
                y2={50 - 36 * Math.cos((minuteDeg * Math.PI) / 180)}
                stroke="var(--tx)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Second hand */}
              <line
                x1="50"
                y1="50"
                x2={50 + 40 * Math.sin((secondDeg * Math.PI) / 180)}
                y2={50 - 40 * Math.cos((secondDeg * Math.PI) / 180)}
                stroke="var(--nt)"
                strokeWidth="1"
              />
              <circle cx="50" cy="50" r="2.5" fill="var(--tx)" />
            </svg>
          </div>
          <div className="mt-4 text-[16px] font-bold tracking-wider text-tx">{timeStr}</div>
          <span className="mt-1 text-[11px] text-dm">Indify Clock • WIB</span>
        </div>

        {/* Right Column: Unified Multi-Source Daily Stream (FLAGSHIP TO DO LIST HARIAN) */}
        <div className="lg:col-span-9 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-nt bg-nv px-2 py-0.5 rounded">
                Multi-Source Linked View
              </span>
              <h2 className="text-base font-bold text-tx">To Do List Harian (Unified Stream)</h2>
            </div>
            <span className="text-[11px] text-dm">
              Gabungan Schedule, Tasks, Habits, Activities & Entertainment
            </span>
          </div>

          <div className="rounded-lg border border-ln/70 bg-pn/30 p-4">
            <LinkedViewRenderer
              config={{
                id: 'today-unified-multi-source',
                title: 'To Do List Harian',
                sourceDatabases: [
                  'schedule',
                  'tasks',
                  'habits',
                  'activities',
                  'entertainment',
                  'assignments',
                ],
                viewType: 'table',
                filters: [{ id: 'f-td', property: 'date', operator: 'is_today' }],
                sorts: [{ property: 'startTime', direction: 'asc' }],
                span: 12,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
