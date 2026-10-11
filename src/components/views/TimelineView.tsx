import { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';
import type { SourceTable, TableRecord, TagColor } from '../../types';
import { useStore } from '../../store';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';

interface Props {
  table: SourceTable;
  records: TableRecord[];
  defaultValuesForNew?: Record<string, any>;
  readOnly?: boolean;
}

const TIME_SLOTS = [
  '06:00',
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
];

export function TimelineView({
  table,
  records,
  defaultValuesForNew = {},
  readOnly = false,
}: Props) {
  const [activePeek, setActivePeek] = useState<TableRecord | null>(null);
  const addRecord = useStore((s) => s.addRecord);

  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const catProp = table.properties.find((p) => p.key === 'category');

  const getTagColor = (cat: string): TagColor => {
    const opt = catProp?.options?.find((o) => o.label === cat);
    return opt?.color || 'gray';
  };

  const handleQuickAdd = (slotTime: string) => {
    if (readOnly) return;
    const title = prompt(`Aktivitas untuk jam ${slotTime}:`);
    if (!title?.trim()) return;

    addRecord(table.id, {
      ...defaultValuesForNew,
      [titleProp.key]: title.trim(),
      startTime: slotTime,
      status: 'Planned',
    });
  };

  return (
    <div className="w-full space-y-3 font-mono text-[13px]">
      <div className="relative border-l-2 border-ln/80 ml-4 pl-4 space-y-6">
        {TIME_SLOTS.map((slot) => {
          // Find records matching this time range
          const slotHour = parseInt(slot.split(':')[0], 10);
          const matchedRecords = records.filter((r) => {
            const time = r.values.startTime || r.values.time;
            if (!time) return false;
            const h = parseInt(time.split(':')[0], 10);
            return h >= slotHour && h < slotHour + 2;
          });

          return (
            <div key={slot} className="relative group">
              {/* Dot on the timeline */}
              <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-bg bg-dm group-hover:bg-nt transition-colors" />

              {/* Slot Header */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-[12px] font-semibold text-dm flex items-center gap-1.5">
                  <Clock size={12} />
                  {slot}
                </span>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(slot)}
                    className="opacity-0 group-hover:opacity-100 text-[11px] text-dm hover:text-nt flex items-center gap-1 transition-opacity"
                  >
                    <Plus size={12} /> Tambah di jam ini
                  </button>
                )}
              </div>

              {/* Slot Cards */}
              <div className="space-y-2 mt-1">
                {matchedRecords.map((record) => {
                  const title = record.values[titleProp.key] || 'Aktivitas';
                  const cat = record.values.category;
                  const isDone = record.values.status === 'Done';
                  const start = record.values.startTime || record.values.time || '';
                  const end = record.values.endTime || '';

                  return (
                    <div
                      key={record.id}
                      onClick={() => setActivePeek(record)}
                      className="cursor-pointer rounded-lg border border-ln/70 bg-bg p-3 shadow-xs hover:border-nt transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isDone && <CheckCircle2 size={15} className="text-ok shrink-0" />}
                          <span className={`font-medium ${isDone ? 'line-through text-dm' : 'text-tx'}`}>
                            {title}
                          </span>
                        </div>

                        {cat && <Tag color={getTagColor(cat)} className="text-[10px]">{cat}</Tag>}
                      </div>

                      {(start || end) && (
                        <div className="mt-1 text-[11px] text-dm flex items-center gap-1">
                          <Clock size={11} />
                          {start} {end ? `– ${end}` : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
