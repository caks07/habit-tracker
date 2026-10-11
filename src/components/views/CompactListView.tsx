import { useState } from 'react';
import { Check, CheckCircle2, Circle, Flame, Plus, X } from 'lucide-react';
import type { HabitCell, SourceTable, TableRecord } from '../../types';
import { useStore } from '../../store';
import { DAYS_SHORT, todayIndex } from '../../lib/date';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';

interface Props {
  table: SourceTable;
  records: TableRecord[];
  defaultValuesForNew?: Record<string, any>;
  readOnly?: boolean;
}

export function CompactListView({
  table,
  records,
  defaultValuesForNew = {},
  readOnly = false,
}: Props) {
  const updateRecord = useStore((s) => s.updateRecord);
  const addRecord = useStore((s) => s.addRecord);

  const [activePeek, setActivePeek] = useState<TableRecord | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const isHabits = table.id === 'habits' || table.name.toLowerCase().includes('habit');
  const tIdx = todayIndex();

  const handleAddNew = () => {
    if (!newTitle.trim() || readOnly) return;
    const values = {
      ...defaultValuesForNew,
      title: newTitle.trim(),
      days: [0, 0, 0, 0, 0, 0, 0],
      streak: 0,
      status: 'Active',
    };
    addRecord(table.id, values);
    setNewTitle('');
  };

  const cycleHabitCell = (record: TableRecord, dayIdx: number) => {
    if (readOnly) return;
    const days: HabitCell[] = Array.isArray(record.values.days)
      ? [...record.values.days]
      : [0, 0, 0, 0, 0, 0, 0];
    const cur = days[dayIdx] || 0;
    // 0 (kosong) -> 1 (selesai) -> 2 (terlewat) -> 0
    const next: HabitCell = cur === 0 ? 1 : cur === 1 ? 2 : 0;
    days[dayIdx] = next;

    // Recalculate streak
    const completedCount = days.filter((d) => d === 1).length;
    const currentStreak = Number(record.values.streak || 0);

    updateRecord(table.id, record.id, {
      days,
      streak: next === 1 && dayIdx === tIdx ? currentStreak + 1 : currentStreak,
    });
  };

  const toggleSimpleDone = (record: TableRecord) => {
    if (readOnly) return;
    const isDone = record.values.status === 'Done' || record.values.status === 'Completed';
    updateRecord(table.id, record.id, { status: isDone ? 'Todo' : 'Done' });
  };

  // If it's a habit table, render the sleek Mon-Sun habit matrix
  if (isHabits) {
    return (
      <div className="w-full space-y-2 font-mono text-[12px]">
        {/* Habit Days Header */}
        <div className="grid grid-cols-[1fr_repeat(7,24px)_42px] items-center gap-1.5 px-2 pb-1.5 border-b border-ln/60 text-dm">
          <span className="text-[11px]">Kebiasaan</span>
          {DAYS_SHORT.map((d, i) => (
            <span
              key={d}
              className={`text-center text-[10px] ${
                i === tIdx ? 'font-bold text-nt' : 'text-dm/70'
              }`}
            >
              {d}
            </span>
          ))}
          <span className="text-right text-[10px] text-dm">Streak</span>
        </div>

        {/* Habit Rows */}
        <div className="space-y-1">
          {records.map((record) => {
            const title = record.values.title || 'Habit';
            const days: HabitCell[] = Array.isArray(record.values.days)
              ? record.values.days
              : [0, 0, 0, 0, 0, 0, 0];
            const streak = Number(record.values.streak || 0);

            return (
              <div
                key={record.id}
                className="grid grid-cols-[1fr_repeat(7,24px)_42px] items-center gap-1.5 px-2 py-1.5 rounded hover:bg-hv/40 transition-colors"
              >
                <span
                  onClick={() => setActivePeek(record)}
                  className="truncate text-tx cursor-pointer hover:text-nt pr-1"
                  title={title}
                >
                  {title}
                </span>

                {DAYS_SHORT.map((_, dayIdx) => {
                  const state = days[dayIdx] || 0;
                  const isCurrentDay = dayIdx === tIdx;

                  return (
                    <button
                      key={dayIdx}
                      type="button"
                      disabled={readOnly}
                      onClick={() => cycleHabitCell(record, dayIdx)}
                      className={`h-6 w-6 rounded flex items-center justify-center transition-all ${
                        isCurrentDay ? 'ring-1 ring-nt/40' : ''
                      } ${
                        state === 1
                          ? 'bg-ok text-white font-bold'
                          : state === 2
                          ? 'bg-bd/20 text-bd'
                          : 'bg-pn/70 text-dm/30 hover:bg-hv'
                      }`}
                      title={
                        state === 1
                          ? 'Selesai (klik untuk ubah)'
                          : state === 2
                          ? 'Terlewat (klik untuk ubah)'
                          : 'Belum diisi'
                      }
                    >
                      {state === 1 ? (
                        <Check size={12} strokeWidth={3} />
                      ) : state === 2 ? (
                        <X size={12} strokeWidth={3} />
                      ) : (
                        <span className="text-[9px]">•</span>
                      )}
                    </button>
                  );
                })}

                <div className="flex items-center justify-end gap-1 text-[11px] text-amber-500 font-semibold">
                  <Flame size={12} className="fill-amber-500" />
                  <span>{streak}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Habit */}
        {!readOnly && (
          <div className="pt-1.5 border-t border-ln/40 flex items-center gap-1.5 px-2 text-dm">
            <Plus size={12} />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              placeholder="+ Kebiasaan baru (tekan Enter)..."
              className="bare text-[12px] text-dm focus:text-tx placeholder:text-dm/60"
            />
          </div>
        )}

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

  // Generic compact list for non-habit tables
  return (
    <div className="w-full space-y-1.5 font-mono text-[12px]">
      <div className="divide-y divide-ln/50 rounded-md border border-ln/60 bg-bg">
        {records.map((record) => {
          const title = record.values.title || 'Item';
          const isDone = record.values.status === 'Done' || record.values.status === 'Completed';

          return (
            <div
              key={record.id}
              className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-hv/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleSimpleDone(record)}
                  className="text-dm hover:text-ok shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 size={14} className="text-ok fill-ok/20" />
                  ) : (
                    <Circle size={14} className="text-dm/60" />
                  )}
                </button>
                <span
                  onClick={() => setActivePeek(record)}
                  className={`truncate cursor-pointer hover:text-nt ${
                    isDone ? 'line-through text-dm' : 'text-tx'
                  }`}
                >
                  {title}
                </span>
              </div>

              {record.values.category && (
                <Tag color="gray" className="text-[10px] py-0 px-1 shrink-0">
                  {record.values.category}
                </Tag>
              )}
            </div>
          );
        })}

        {!readOnly && (
          <div className="flex items-center gap-2 px-3 py-2 text-dm">
            <Plus size={13} className="shrink-0" />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              placeholder="+ Tambah cepat..."
              className="bare text-[12px] text-dm focus:text-tx placeholder:text-dm/60"
            />
          </div>
        )}
      </div>

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
