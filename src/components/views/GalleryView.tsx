import { useState } from 'react';
import { Check, CheckCircle2, FileText, Flame, ImageOff, Plus } from 'lucide-react';
import type { SourceTable, TableRecord } from '../../types';
import { useStore } from '../../store';
import { RecordPeekModal } from './RecordPeekModal';
import { Tag } from '../ui';
import { getTodayDateStr, todayIndex } from '../../lib/date';
import { computeHabitStreak, parseHabitDays } from '../../lib/normalization';

interface Props {
  table: SourceTable;
  records: TableRecord[];
  defaultValuesForNew?: Record<string, any>;
  readOnly?: boolean;
}

export function GalleryView({
  table,
  records,
  defaultValuesForNew = {},
  readOnly = false,
}: Props) {
  const addRecord = useStore((s) => s.addRecord);
  const updateRecord = useStore((s) => s.updateRecord);
  const notify = useStore((s) => s.notify);

  const [activePeek, setActivePeek] = useState<TableRecord | null>(null);

  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const coverProp = table.properties.find((p) => p.key === 'cover');
  const eventProp = table.properties.find((p) => p.key === 'event');
  const sesiProp = table.properties.find((p) => p.key === 'sesi');
  const categoryProp = table.properties.find((p) => p.key === 'category');

  const isHabitsTable = table.id.toLowerCase().includes('habit');
  const todayIdx = todayIndex();
  const todayStr = getTodayDateStr();

  const handleAddNew = () => {
    if (readOnly) return;
    const initial: Record<string, any> = {
      ...defaultValuesForNew,
      [titleProp.key]: isHabitsTable ? 'Kebiasaan Baru' : 'New page',
    };
    if (isHabitsTable) {
      initial.days = [1, 1, 1, 1, 0, 0, 0];
      initial.streak = 0;
      initial.category = 'Study';
      initial.status = 'Active';
    }
    const newId = addRecord(table.id, initial);
    const updatedTable = useStore.getState().tables[table.id];
    const newRec = updatedTable?.records.find((r) => r.id === newId);
    if (newRec) setActivePeek(newRec);
  };

  const handleDoneToday = (record: TableRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;

    const daysArr = parseHabitDays(record.values.days);
    const currentStatus = daysArr[todayIdx] === 1;
    const nextStatus = !currentStatus;

    const newDays = [...daysArr];
    newDays[todayIdx] = nextStatus ? 1 : 0;

    const completions: string[] = Array.isArray(record.values.completions)
      ? [...record.values.completions]
      : [];

    if (nextStatus) {
      if (!completions.includes(todayStr)) {
        completions.push(todayStr);
      }
    } else {
      const idx = completions.indexOf(todayStr);
      if (idx !== -1) completions.splice(idx, 1);
    }

    const newStreak = computeHabitStreak(newDays, record.values.streak, completions);

    updateRecord(table.id, record.id, {
      days: newDays,
      completions,
      streak: newStreak,
    });

    notify(
      `Habit "${record.values[titleProp.key]}" ${nextStatus ? 'selesai hari ini! 🔥' : 'dibatalkan'}`
    );
  };

  return (
    <div className="w-full font-mono text-[13px]">
      <div className="gallery-grid">
        {records.map((record) => {
          const title = record.values[titleProp.key] || 'Tanpa judul';
          const cover = coverProp ? record.values[coverProp.key] : null;
          const eventVal = eventProp ? record.values[eventProp.key] : null;
          const sesiVal = sesiProp ? record.values[sesiProp.key] : null;
          const catVal = categoryProp ? record.values[categoryProp.key] : null;

          // ===============================================================
          // HABIT CARD DESIGN (REQUIREMENT 14)
          // ===============================================================
          if (isHabitsTable) {
            const daysArr = parseHabitDays(record.values.days);
            const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
            const activeDays = dayLabels.filter((_, idx) => daysArr[idx] === 1 || daysArr[idx] === 0);
            const activeDaysDisplay = activeDays.slice(0, 4).join(' · ');
            const isDoneToday = daysArr[todayIdx] === 1;
            const streak = computeHabitStreak(
              record.values.days,
              record.values.streak,
              record.values.completions
            );

            return (
              <div
                key={record.id}
                role="button"
                tabIndex={0}
                onClick={() => setActivePeek(record)}
                onKeyDown={(e) => e.key === 'Enter' && setActivePeek(record)}
                className="group flex flex-col justify-between rounded-lg border border-ln/70 bg-pn/90 p-4 text-left hover:border-nt hover:bg-hv/50 transition-all cursor-pointer shadow-xs min-h-[190px]"
              >
                <div className="space-y-3">
                  {/* Top: Title & Category */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-tx text-[14px] leading-snug line-clamp-2 group-hover:text-nt transition-colors">
                      {title}
                    </h3>
                    {catVal && (
                      <Tag color="purple" className="text-[10px] py-0.5 px-2 shrink-0">
                        {catVal}
                      </Tag>
                    )}
                  </div>

                  {/* Active Days */}
                  <div className="text-[11px] text-dm tracking-wide">
                    {activeDaysDisplay || 'Setiap Hari'}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 text-[11px] text-ok font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
                    <span>Active</span>
                  </div>
                </div>

                {/* Bottom: Streak & Done Today Button */}
                <div className="pt-3 border-t border-ln/50 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-dm uppercase font-semibold">Current streak</span>
                    <div className="flex items-center gap-1 text-[13px] font-bold text-amber-400">
                      <Flame size={13} className="fill-amber-400" />
                      <span>{streak} days</span>
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => handleDoneToday(record, e)}
                      className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                        isDoneToday
                          ? 'bg-ok/20 text-ok border border-ok/50 hover:bg-ok/30'
                          : 'bg-nv text-nt hover:opacity-90 shadow-xs'
                      }`}
                      title={isDoneToday ? 'Selesai hari ini' : 'Tandai selesai hari ini'}
                    >
                      <Check size={12} strokeWidth={2.5} />
                      <span>{isDoneToday ? 'Done today' : 'Done today'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // ===============================================================
          // STANDARD GALLERY CARD (Activities, Books, Entertainment, etc.)
          // ===============================================================
          return (
            <div
              key={record.id}
              role="button"
              tabIndex={0}
              onClick={() => setActivePeek(record)}
              onKeyDown={(e) => e.key === 'Enter' && setActivePeek(record)}
              className="group flex flex-col overflow-hidden rounded-md border border-ln/70 bg-pn/90 text-left hover:border-nt hover:bg-hv/70 transition-all cursor-pointer shadow-xs"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-hv/60">
                {cover ? (
                  <img
                    src={cover}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-dm/50">
                    <ImageOff size={22} />
                  </div>
                )}
                {catVal && (
                  <div className="absolute top-2 left-2">
                    <Tag color="purple" className="text-[10px] py-0 px-1.5 shadow-xs">
                      {catVal}
                    </Tag>
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                <div className="flex items-start gap-2">
                  <FileText size={14} className="mt-0.5 shrink-0 text-dm group-hover:text-nt transition-colors" />
                  <span className="font-semibold text-tx leading-snug line-clamp-2">
                    {title}
                  </span>
                </div>

                {(eventVal || sesiVal) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-dm">
                    {eventVal && (
                      <span className="truncate">{eventVal}</span>
                    )}
                    {eventVal && sesiVal && <span>•</span>}
                    {sesiVal && <span>Sesi {sesiVal}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* "+ New page" card like Notion */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddNew}
            className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ln/80 bg-pn/30 text-[13px] text-dm hover:border-nt hover:bg-pn hover:text-tx transition-all"
          >
            <Plus size={16} />
            <span>+ New page</span>
          </button>
        )}
      </div>

      {/* Record Peek / Edit Modal */}
      {activePeek && (
        <RecordPeekModal
          table={table}
          record={activePeek}
          onClose={() => setActivePeek(null)}
        />
      )}
    </div>
  );
}
