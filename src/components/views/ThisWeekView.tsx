import { Calendar, CheckCircle2, Clock, Eye, Flame, LayoutGrid, List, Repeat, Table as TableIcon } from 'lucide-react';
import { useStore } from '../../store';
import { weekInfo } from '../../lib/date';
import { LinkedViewRenderer } from './LinkedViewRenderer';

export function ThisWeekView() {
  const currentWeek = weekInfo();
  const tables = useStore((s) => s.tables);

  const schTable = tables['schedule'];
  const tasksTable = tables['tasks'];
  const habitsTable = tables['habits'];
  const entTable = tables['entertainment'];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 font-mono space-y-8">
      {/* Header */}
      <div className="border-b border-ln/70 pb-5">
        <div className="flex items-center gap-2 text-dm text-[12px] mb-1">
          <Calendar size={14} />
          <span>IKHTISAR MINGGUAN (THIS WEEK)</span>
        </div>
        <h1 className="text-2xl font-bold text-tx">
          Minggu {currentWeek.week} ({currentWeek.range})
        </h1>
        <p className="mt-1 text-[13px] text-dm">
          Halaman teragregasi otomatis menggunakan Linked Views dari Master Database Schedule, Tasks, Habits, dan Entertainment.
        </p>
      </div>

      {/* Row 1: Weekly Schedule (Board View) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-nt bg-nv px-2 py-0.5 rounded">
              Linked → Schedule
            </span>
            <h2 className="text-base font-bold text-tx">Weekly Schedule (Jadwal Minggu Ini)</h2>
          </div>
        </div>

        <div className="rounded-lg border border-ln/70 bg-pn/30 p-4">
          <LinkedViewRenderer
            config={{
              id: 'vw-week-sch',
              title: 'Weekly Schedule',
              sourceTableId: 'schedule',
              viewType: 'board',
              groupBy: 'category',
              filters: [{ id: 'f-week', property: 'date', operator: 'is_this_week' }],
              sorts: [{ property: 'startTime', direction: 'asc' }],
              span: 12,
            }}
          />
        </div>
      </div>

      {/* Row 2: Two Columns: Weekly Tasks (List) & Weekly Habits (Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Habits (span 7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-nt bg-nv px-2 py-0.5 rounded">
              Linked → Habits
            </span>
            <h2 className="text-base font-bold text-tx">Weekly Habits Matrix</h2>
          </div>

          <div className="rounded-lg border border-ln/70 bg-pn/30 p-4">
            <LinkedViewRenderer
              config={{
                id: 'vw-week-habits',
                title: 'Weekly Habits',
                sourceTableId: 'habits',
                viewType: 'compact-list',
                filters: [{ id: 'f-active', property: 'status', operator: 'equals', value: 'Active' }],
                sorts: [{ property: 'streak', direction: 'desc' }],
                span: 7,
              }}
            />
          </div>
        </div>

        {/* Weekly Tasks (span 5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-nt bg-nv px-2 py-0.5 rounded">
              Linked → Tasks
            </span>
            <h2 className="text-base font-bold text-tx">Weekly Tasks</h2>
          </div>

          <div className="rounded-lg border border-ln/70 bg-pn/30 p-4">
            <LinkedViewRenderer
              config={{
                id: 'vw-week-tasks',
                title: 'Weekly Tasks',
                sourceTableId: 'tasks',
                viewType: 'list',
                filters: [],
                sorts: [{ property: 'priority', direction: 'desc' }],
                span: 5,
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Entertainment (Completed vs Upcoming) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-nt bg-nv px-2 py-0.5 rounded">
            Linked → Entertainment
          </span>
          <h2 className="text-base font-bold text-tx">Entertainment & Rekreasi Minggu Ini</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-ln/70 bg-pn/30 p-4">
            <h3 className="text-[13px] font-semibold text-tx mb-3">Telah Selesai (Completed)</h3>
            <LinkedViewRenderer
              config={{
                id: 'vw-ent-done',
                title: 'Completed Entertainment',
                sourceTableId: 'entertainment',
                viewType: 'list',
                filters: [{ id: 'f-comp', property: 'status', operator: 'equals', value: 'Completed' }],
                sorts: [{ property: 'date', direction: 'desc' }],
                span: 6,
              }}
            />
          </div>

          <div className="rounded-lg border border-ln/70 bg-pn/30 p-4">
            <h3 className="text-[13px] font-semibold text-tx mb-3">Rencana & Sedang Berjalan</h3>
            <LinkedViewRenderer
              config={{
                id: 'vw-ent-plan',
                title: 'Upcoming Entertainment',
                sourceTableId: 'entertainment',
                viewType: 'list',
                filters: [{ id: 'f-plan', property: 'status', operator: 'not_equals', value: 'Completed' }],
                sorts: [{ property: 'date', direction: 'asc' }],
                span: 6,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
