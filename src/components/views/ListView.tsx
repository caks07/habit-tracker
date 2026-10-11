import { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Eye, Plus, Trash2 } from 'lucide-react';
import type { SourceTable, TableRecord } from '../../types';
import { useStore } from '../../store';
import { formatShortDate } from '../../lib/date';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';

interface Props {
  table: SourceTable;
  records: TableRecord[];
  defaultValuesForNew?: Record<string, any>;
  readOnly?: boolean;
}

export function ListView({
  table,
  records,
  defaultValuesForNew = {},
  readOnly = false,
}: Props) {
  const updateRecord = useStore((s) => s.updateRecord);
  const addRecord = useStore((s) => s.addRecord);
  const removeRecord = useStore((s) => s.removeRecord);

  const [activePeek, setActivePeek] = useState<TableRecord | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const categoryProp = table.properties.find((p) => p.key === 'category' || p.key === 'course' || p.key === 'type');
  const dateProp = table.properties.find((p) => p.type === 'date');
  const priorityProp = table.properties.find((p) => p.key === 'priority');

  const handleAddNew = () => {
    if (!newTitle.trim() || readOnly) return;
    const values = {
      ...defaultValuesForNew,
      [titleProp.key]: newTitle.trim(),
    };
    addRecord(table.id, values);
    setNewTitle('');
  };

  const toggleDone = (record: TableRecord) => {
    if (readOnly) return;
    const isDone = record.values.status === 'Done' || record.values.status === 'Completed';
    const nextStatus = isDone ? 'Todo' : 'Done';
    updateRecord(table.id, record.id, { status: nextStatus });
  };

  return (
    <div className="w-full space-y-1 font-mono text-[13px]">
      <div className="divide-y divide-ln/50 rounded-lg border border-ln/60 bg-bg">
        {records.map((record) => {
          const title = record.values[titleProp.key] || 'Tanpa Judul';
          const isDone = record.values.status === 'Done' || record.values.status === 'Completed';
          const catVal = categoryProp ? record.values[categoryProp.key] : null;
          const catOpt = categoryProp?.options?.find((o) => o.label === catVal);
          const dateVal = dateProp ? record.values[dateProp.key] : null;
          const prioVal = priorityProp ? record.values[priorityProp.key] : null;
          const prioOpt = priorityProp?.options?.find((o) => o.label === prioVal);

          return (
            <div
              key={record.id}
              className="group flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-hv/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Status Toggle Button */}
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleDone(record)}
                  className="text-dm hover:text-ok shrink-0 transition-colors"
                >
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-ok fill-ok/20" />
                  ) : (
                    <Circle size={16} className="text-dm/60" />
                  )}
                </button>

                {/* Title */}
                <span
                  onClick={() => setActivePeek(record)}
                  className={`truncate cursor-pointer hover:text-nt ${
                    isDone ? 'line-through opacity-60 text-dm' : 'text-tx font-medium'
                  }`}
                >
                  {title}
                </span>
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
                {catVal && (
                  <Tag color={catOpt?.color || 'gray'} className="text-[10px] py-0 px-1.5">
                    {catVal}
                  </Tag>
                )}

                {prioVal && (
                  <Tag color={prioOpt?.color || 'gray'} className="text-[10px] py-0 px-1.5">
                    {prioVal}
                  </Tag>
                )}

                {dateVal && (
                  <span className="flex items-center gap-1 text-dm text-[11px]">
                    <Calendar size={11} />
                    {formatShortDate(dateVal)}
                  </span>
                )}

                {!readOnly && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setActivePeek(record)}
                      className="p-1 text-dm hover:text-tx rounded"
                      title="Buka detail"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRecord(table.id, record.id)}
                      className="p-1 text-dm hover:text-bd rounded"
                      title="Hapus"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {records.length === 0 && (
          <div className="py-6 text-center text-dm text-[12px]">
            Belum ada item di daftar ini.
          </div>
        )}

        {/* Inline Add Row */}
        {!readOnly && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 text-dm">
            <Plus size={14} className="shrink-0 text-dm/70" />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              placeholder="+ Tambah tugas / item baru (tekan Enter)..."
              className="bare text-[13px] text-dm focus:text-tx placeholder:text-dm/60"
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
