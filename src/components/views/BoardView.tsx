import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MoreHorizontal,
  Plus,
  Tag as TagIcon,
  X,
} from 'lucide-react';
import type { SourceTable, TableRecord, TagColor } from '../../types';
import { useStore } from '../../store';
import { groupRecords } from '../../lib/filter-engine';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';

interface Props {
  table: SourceTable;
  records: TableRecord[];
  groupByKey?: string;
  defaultValuesForNew?: Record<string, any>;
  readOnly?: boolean;
}

const DAY_COLOR_MAP: Record<string, { tag: TagColor; colBg: string; cardBg: string }> = {
  Senin: { tag: 'green', colBg: 'bg-[#1d2a23]/70', cardBg: 'bg-[#25352c]/90' },
  Selasa: { tag: 'pink', colBg: 'bg-[#2d2024]/70', cardBg: 'bg-[#3b262c]/90' },
  Rabu: { tag: 'blue', colBg: 'bg-[#1b2430]/70', cardBg: 'bg-[#222f42]/90' },
  Kamis: { tag: 'brown', colBg: 'bg-[#2d201e]/70', cardBg: 'bg-[#43292a]/90' },
  Jumat: { tag: 'orange', colBg: 'bg-[#2c241c]/70', cardBg: 'bg-[#3d3023]/90' },
  Sabtu: { tag: 'purple', colBg: 'bg-[#26202e]/70', cardBg: 'bg-[#35293f]/90' },
  Minggu: { tag: 'gray', colBg: 'bg-[#1c2828]/70', cardBg: 'bg-[#243636]/90' },
};

export function BoardView({
  table,
  records,
  groupByKey = 'day',
  defaultValuesForNew = {},
  readOnly = false,
}: Props) {
  const updateRecord = useStore((s) => s.updateRecord);
  const addRecord = useStore((s) => s.addRecord);

  const [activePeek, setActivePeek] = useState<TableRecord | null>(null);
  const [newTitleByGroup, setNewTitleByGroup] = useState<Record<string, string>>({});
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);

  const groupProp = table.properties.find((p) => p.key === groupByKey) || table.properties[0];
  const groups = groupRecords(records, groupProp.key, table.properties);

  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const categoryProp = table.properties.find((p) => p.key === 'category');
  const timeProp = table.properties.find((p) => p.key === 'time' || p.key === 'startTime');
  const statusProp = table.properties.find((p) => p.type === 'status');
  const subtasksProp = table.properties.find((p) => p.key === 'subtasks' || p.key === 'notes');

  const handleAddNewInGroup = (groupName: string) => {
    const text = (newTitleByGroup[groupName] || '').trim();
    if (!text || readOnly) return;

    const values: Record<string, any> = {
      ...defaultValuesForNew,
      [titleProp.key]: text,
      [groupProp.key]: groupName,
      status: 'Not started',
    };

    addRecord(table.id, values);
    setNewTitleByGroup((prev) => ({ ...prev, [groupName]: '' }));
    setAddingToGroup(null);
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s === 'canceled' || s === 'batal') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#3d1c1a] px-2 py-0.5 text-[10px] text-[#f28b82]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f28b82]" />
          Canceled
        </span>
      );
    }
    if (s === 'in progress' || s === 'doing' || s === 'berjalan') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1c2c42] px-2 py-0.5 text-[10px] text-[#8ab4f8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8ab4f8]" />
          In progress
        </span>
      );
    }
    if (s === 'done' || s === 'selesai' || s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1a3826] px-2 py-0.5 text-[10px] text-[#81c995]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#81c995]" />
          Done
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#333333] px-2 py-0.5 text-[10px] text-[#9aa0a6]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#9aa0a6]" />
        Not started
      </span>
    );
  };

  const getCategoryColor = (cat: string | undefined): TagColor => {
    if (!cat) return 'gray';
    const c = cat.toLowerCase();
    if (c.includes('olahraga')) return 'brown';
    if (c.includes('hiburan')) return 'blue';
    if (c.includes('skripsi')) return 'red';
    if (c.includes('kuliah')) return 'green';
    if (c.includes('inggris')) return 'orange';
    if (c.includes('bootcamp')) return 'purple';
    return 'gray';
  };

  return (
    <div className="w-full overflow-x-auto pb-4 text-[13px] font-mono">
      <div className="flex items-start gap-3 min-w-[900px]">
        {Object.entries(groups).map(([groupName, groupRecordsList]) => {
          const dayStyle = DAY_COLOR_MAP[groupName] || {
            tag: 'gray',
            colBg: 'bg-pn/40',
            cardBg: 'bg-bg',
          };

          return (
            <div
              key={groupName}
              className={`flex-1 min-w-[210px] max-w-[280px] rounded-lg p-2 flex flex-col gap-2.5 transition-colors ${dayStyle.colBg}`}
            >
              {/* Column Header (Screenshot 1: e.g. "Senin 7", "Selasa 8") */}
              <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
                <div className="flex items-center gap-2">
                  <Tag color={dayStyle.tag} className="font-bold text-[12px] px-2.5 py-0.5">
                    {groupName}
                  </Tag>
                  <span className="text-[12px] text-dm font-normal">
                    {groupRecordsList.length}
                  </span>
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setAddingToGroup(addingToGroup === groupName ? null : groupName)}
                    className="p-1 text-dm hover:text-tx rounded transition-colors"
                    title={`Tambah kartu di ${groupName}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {/* Cards Stack */}
              <div className="flex flex-col gap-2 min-h-[40px]">
                {groupRecordsList.map((record) => {
                  const title = record.values[titleProp.key] || 'Tanpa Judul';
                  const catVal = categoryProp ? record.values[categoryProp.key] : null;
                  const timeVal = timeProp ? record.values[timeProp.key] : null;
                  const statusVal = statusProp ? record.values[statusProp.key] : record.values.status;
                  const subVal = subtasksProp ? record.values[subtasksProp.key] : null;

                  return (
                    <div
                      key={record.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActivePeek(record)}
                      onKeyDown={(e) => e.key === 'Enter' && setActivePeek(record)}
                      className={`group cursor-pointer rounded-lg border border-ln/50 p-3 shadow-xs hover:border-nt hover:shadow-md transition-all ${dayStyle.cardBg}`}
                    >
                      {/* Top mini header: 📄 New page */}
                      <div className="flex items-center justify-between text-[11px] text-dm/80 mb-2">
                        <span className="flex items-center gap-1.5 group-hover:text-tx transition-colors">
                          <FileText size={12} className="text-dm" />
                          <span>New page</span>
                        </span>
                      </div>

                      {/* Category Tag */}
                      {catVal && (
                        <div className="mb-2">
                          <Tag
                            color={getCategoryColor(catVal)}
                            className="text-[10px] py-0.5 px-2 font-medium"
                          >
                            {catVal}
                          </Tag>
                        </div>
                      )}

                      {/* Time text */}
                      {timeVal && (
                        <div className="text-[11px] text-dm font-mono mb-2">
                          {timeVal}
                        </div>
                      )}

                      {/* Main Task Title & Subtasks */}
                      <div className="space-y-1 mb-2.5">
                        <div className="flex items-start gap-1.5 text-tx font-medium leading-snug">
                          <FileText size={12} className="shrink-0 mt-0.5 text-dm" />
                          <span>{title}</span>
                        </div>

                        {subVal && subVal !== title && (
                          <div className="flex items-start gap-1.5 text-dm text-[11px] leading-snug">
                            <FileText size={11} className="shrink-0 mt-0.5 text-dm/60" />
                            <span>{subVal}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Tag (Bottom) */}
                      {statusVal && <div>{getStatusBadge(statusVal)}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Add card prompt at bottom (Screenshot 1: + New page) */}
              {!readOnly && (
                <div className="mt-1">
                  {addingToGroup === groupName ? (
                    <div className="rounded border border-ln bg-bg p-2 space-y-2 animate-in fade-in">
                      <input
                        type="text"
                        value={newTitleByGroup[groupName] || ''}
                        onChange={(e) =>
                          setNewTitleByGroup({
                            ...newTitleByGroup,
                            [groupName]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewInGroup(groupName)}
                        placeholder="Nama kegiatan / tugas..."
                        className="bare text-[12px] text-tx"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAddingToGroup(null)}
                          className="px-2 py-0.5 text-[11px] text-dm hover:text-tx"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddNewInGroup(groupName)}
                          className="rounded bg-nv px-2.5 py-0.5 text-[11px] font-semibold text-nt"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingToGroup(groupName)}
                      className="flex w-full items-center gap-1.5 rounded py-1 px-2 text-[12px] text-dm hover:bg-hv/50 hover:text-tx transition-colors"
                    >
                      <Plus size={13} />
                      <span>New page</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Record Peek Modal */}
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
