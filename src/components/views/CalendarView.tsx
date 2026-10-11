import { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Plus } from 'lucide-react';
import type { SourceTable, TableRecord, TagColor } from '../../types';
import { useStore } from '../../store';
import { DAYS, getTodayDateStr, todayIndex } from '../../lib/date';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';

interface Props {
  table: SourceTable;
  records: TableRecord[];
  defaultValuesForNew?: Record<string, any>;
  readOnly?: boolean;
}

export function CalendarView({
  table,
  records,
  defaultValuesForNew = {},
  readOnly = false,
}: Props) {
  const [activePeek, setActivePeek] = useState<TableRecord | null>(null);
  const addRecord = useStore((s) => s.addRecord);

  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const catProp = table.properties.find((p) => p.key === 'category');

  // Compute dates for current Monday-Sunday
  const now = new Date();
  const currentDayIdx = todayIndex(now);
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayIdx);

  const weekDays = DAYS.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    return {
      dayName,
      dayNumber: d.getDate(),
      dateStr,
      isToday: idx === currentDayIdx,
    };
  });

  const getTagColor = (cat: string): TagColor => {
    const opt = catProp?.options?.find((o) => o.label === cat);
    return opt?.color || 'gray';
  };

  const handleAddForDate = (dateStr: string) => {
    if (readOnly) return;
    const title = prompt(`Aktivitas untuk tanggal ${dateStr}:`);
    if (!title?.trim()) return;

    addRecord(table.id, {
      ...defaultValuesForNew,
      [titleProp.key]: title.trim(),
      date: dateStr,
      status: 'Planned',
    });
  };

  return (
    <div className="w-full overflow-x-auto pb-2 font-mono text-[13px]">
      <div className="grid grid-cols-7 gap-2 min-w-[750px]">
        {weekDays.map((wd) => {
          const dayRecords = records.filter((r) => r.values.date === wd.dateStr);

          return (
            <div
              key={wd.dateStr}
              className={`rounded-lg border p-2 flex flex-col gap-2 min-h-[140px] ${
                wd.isToday
                  ? 'border-nt bg-nv/10 shadow-xs'
                  : 'border-ln/60 bg-pn/30'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-ln/50 pb-1.5 px-0.5">
                <span className={`text-[11px] ${wd.isToday ? 'font-bold text-nt' : 'text-dm'}`}>
                  {wd.dayName}
                </span>
                <span
                  className={`text-[12px] font-semibold h-5 w-5 rounded-full flex items-center justify-center ${
                    wd.isToday ? 'bg-nv text-nt' : 'text-tx'
                  }`}
                >
                  {wd.dayNumber}
                </span>
              </div>

              {/* Day Records */}
              <div className="flex-1 space-y-1.5">
                {dayRecords.map((record) => {
                  const title = record.values[titleProp.key] || 'Item';
                  const cat = record.values.category;
                  const isDone = record.values.status === 'Done';

                  return (
                    <div
                      key={record.id}
                      onClick={() => setActivePeek(record)}
                      className="cursor-pointer rounded border border-ln/60 bg-bg p-1.5 text-[11px] hover:border-nt transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`truncate font-medium ${isDone ? 'line-through text-dm' : 'text-tx'}`}>
                          {title}
                        </span>
                        {isDone && <CheckCircle2 size={11} className="text-ok shrink-0" />}
                      </div>
                      {cat && (
                        <div className="mt-1">
                          <Tag color={getTagColor(cat)} className="text-[9px] py-0 px-1">
                            {cat}
                          </Tag>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add on day */}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleAddForDate(wd.dateStr)}
                  className="mt-auto text-[10px] text-dm hover:text-nt flex items-center gap-1 pt-1 border-t border-ln/30 transition-colors"
                >
                  <Plus size={11} /> Tambah
                </button>
              )}
            </div>
          );
        })}
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
