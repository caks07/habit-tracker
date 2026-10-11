import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  MoreHorizontal,
  Plus,
  Tag as TagIcon,
  Trash2,
  X,
} from 'lucide-react';
import type { NormalizedRecordRow, SourceTable, TagColor } from '../../types';
import { useStore } from '../../store';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';
import { DAYS } from '../../lib/date';
import { AddOrLinkRecordModal } from '../modals/AddOrLinkRecordModal';

interface Props {
  rows: NormalizedRecordRow[];
  tables: Record<string, SourceTable>;
  groupByKey?: string;
  sourceDatabases: string[];
  readOnly?: boolean;
  onRemoveFromView?: (rowId: string) => void;
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

export function MultiSourceBoardView({
  rows,
  tables,
  groupByKey = 'day',
  sourceDatabases,
  readOnly = false,
  onRemoveFromView,
}: Props) {
  const addRecord = useStore((s) => s.addRecord);
  const updateRecord = useStore((s) => s.updateRecord);
  const removeRecord = useStore((s) => s.removeRecord);
  const notify = useStore((s) => s.notify);

  // Active record to view/edit in peek modal
  const [activePeekRow, setActivePeekRow] = useState<NormalizedRecordRow | null>(null);

  // Add row states
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [selectedSourceForNew, setSelectedSourceForNew] = useState<string>('tasks');
  const [newTitle, setNewTitle] = useState('');

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<NormalizedRecordRow | null>(null);

  // Group rows (default: by day)
  const groupedRows: Record<string, NormalizedRecordRow[]> = {};

  if (groupByKey === 'day') {
    DAYS.forEach((d) => {
      groupedRows[d] = [];
    });
    rows.forEach((r) => {
      const g = r.day || 'Senin';
      if (!groupedRows[g]) groupedRows[g] = [];
      groupedRows[g].push(r);
    });
  } else if (groupByKey === 'source') {
    rows.forEach((r) => {
      const g = r.sourceLabel || 'Other';
      if (!groupedRows[g]) groupedRows[g] = [];
      groupedRows[g].push(r);
    });
  } else if (groupByKey === 'status') {
    ['Not started', 'In progress', 'Done', 'Canceled'].forEach((st) => {
      groupedRows[st] = [];
    });
    rows.forEach((r) => {
      const g = r.status || 'Not started';
      if (!groupedRows[g]) groupedRows[g] = [];
      groupedRows[g].push(r);
    });
  } else {
    rows.forEach((r) => {
      const g = (r as any)[groupByKey] || 'Lainnya';
      if (!groupedRows[g]) groupedRows[g] = [];
      groupedRows[g].push(r);
    });
  }

  // Handle adding a new record to the selected database
  const handleAddNewInGroup = (groupName: string) => {
    const text = newTitle.trim();
    if (!text || readOnly) return;

    const targetDbId = selectedSourceForNew;
    const targetTable = tables[targetDbId];
    if (!targetTable) {
      notify(`Database tujuan ${targetDbId} tidak ditemukan`);
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const initialValues: Record<string, any> = {
      title: text,
      status: 'Not started',
    };

    if (groupByKey === 'day') {
      initialValues.day = groupName;
      initialValues.date = todayDate;
    } else if (groupByKey === 'status') {
      initialValues.status = groupName;
      initialValues.day = 'Senin';
    }

    // Table-specific required properties
    if (targetDbId.includes('schedule')) {
      initialValues.startTime = '09:00';
      initialValues.endTime = '10:30';
      initialValues.category = 'Study';
      initialValues.place = 'Online';
    } else if (targetDbId.includes('tasks')) {
      initialValues.time = '09.00 - 10.30';
      initialValues.category = 'Kuliah';
      initialValues.dueDate = todayDate;
      initialValues.subtasks = text;
    } else if (targetDbId.includes('activities')) {
      initialValues.category = 'Bootcamp';
      initialValues.event = 'Program';
      initialValues.status = 'Active';
    } else if (targetDbId.includes('habits')) {
      initialValues.category = 'Health';
      initialValues.days = [0, 0, 0, 0, 0, 0, 0];
      initialValues.streak = 0;
      initialValues.status = 'Active';
    } else if (targetDbId.includes('entertainment')) {
      initialValues.type = 'Movie';
      initialValues.date = todayDate;
      initialValues.time = '20:00';
      initialValues.status = 'Wishlist';
    } else if (targetDbId.includes('assignments')) {
      initialValues.category = 'Kuliah';
      initialValues.dueDate = todayDate;
    }

    addRecord(targetTable.id, initialValues);
    notify(`Record baru dibuat di database master "${targetTable.name}"`);
    setNewTitle('');
    setAddingToGroup(null);
  };

  // Toggle habit occurrence completion directly from board
  const handleToggleHabit = (row: NormalizedRecordRow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!row.isHabitOccurrence || row.habitDayIndex === undefined) return;

    const habitTable = tables[row.sourceDatabaseId];
    if (!habitTable) return;

    const currentDays: number[] = Array.isArray(row.originalRecord.values.days)
      ? [...row.originalRecord.values.days]
      : [0, 0, 0, 0, 0, 0, 0];

    const currentVal = currentDays[row.habitDayIndex];
    const nextVal = currentVal === 1 ? 0 : 1;
    currentDays[row.habitDayIndex] = nextVal;

    updateRecord(habitTable.id, row.sourceRecordId, { days: currentDays });
    notify(`Habit "${row.title}" ${nextVal === 1 ? 'selesai' : 'dibatalkan'}`);
  };

  // Delete action handler
  const confirmDeleteRecord = (deleteOriginal: boolean) => {
    if (!deleteTarget) return;

    if (deleteOriginal) {
      removeRecord(deleteTarget.sourceDatabaseId, deleteTarget.sourceRecordId);
      notify(`Record dihapus permanen dari database master "${deleteTarget.sourceLabel}"`);
    } else {
      if (onRemoveFromView) {
        onRemoveFromView(deleteTarget.id);
        notify(`Record disembunyikan dari view ini`);
      }
    }
    setDeleteTarget(null);
  };

  const getSourceBadgeColor = (sourceType: string): string => {
    switch (sourceType) {
      case 'habit':
        return 'bg-ok/20 text-ok border-ok/40';
      case 'task':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'schedule':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'activity':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'entertainment':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      case 'assignment':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
      default:
        return 'bg-hv text-dm border-ln';
    }
  };

  const getCategoryColor = (cat: string | undefined): TagColor => {
    if (!cat) return 'gray';
    const c = cat.toLowerCase();
    if (c.includes('olahraga') || c.includes('health')) return 'brown';
    if (c.includes('hiburan') || c.includes('media') || c.includes('anime')) return 'blue';
    if (c.includes('skripsi')) return 'red';
    if (c.includes('kuliah')) return 'green';
    if (c.includes('inggris')) return 'orange';
    if (c.includes('bootcamp')) return 'purple';
    return 'gray';
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
    if (s === 'in progress' || s === 'doing' || s === 'berjalan' || s === 'active') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1c2c42] px-2 py-0.5 text-[10px] text-[#8ab4f8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8ab4f8]" />
          In progress
        </span>
      );
    }
    if (s === 'done' || s === 'selesai' || s === 'completed' || s === 'submitted') {
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

  // Available databases for the "+ Add" dropdown
  const availableSources = sourceDatabases
    .map((id) => tables[id])
    .filter(Boolean);

  return (
    <div className="w-full overflow-x-auto pb-4 text-[13px] font-mono">
      <div className="flex items-start gap-3 min-w-[900px]">
        {Object.entries(groupedRows).map(([groupName, groupRecordsList]) => {
          const dayStyle = DAY_COLOR_MAP[groupName] || {
            tag: 'gray',
            colBg: 'bg-pn/40',
            cardBg: 'bg-bg',
          };

          return (
            <div
              key={groupName}
              className={`flex-1 min-w-[210px] max-w-[280px] rounded-lg p-2.5 flex flex-col gap-2.5 transition-colors ${dayStyle.colBg}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pt-0.5 pb-0.5 select-none">
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
                    onClick={() => {
                      setAddingToGroup(addingToGroup === groupName ? null : groupName);
                      if (availableSources.length > 0) {
                        setSelectedSourceForNew(availableSources[0].id);
                      }
                    }}
                    className="p-1 text-dm hover:text-tx rounded transition-colors"
                    title={`Tambah aktivitas / tugas di ${groupName}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {/* Stack of Normalized Cards */}
              <div className="flex flex-col gap-2 min-h-[40px]">
                {groupRecordsList.map((row) => (
                  <div
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActivePeekRow(row)}
                    onKeyDown={(e) => e.key === 'Enter' && setActivePeekRow(row)}
                    className={`group cursor-pointer rounded-lg border border-ln/50 p-3 shadow-xs hover:border-nt hover:shadow-md transition-all ${dayStyle.cardBg} relative`}
                  >
                    {/* Top Row: New page & Subtle Source Indicator (PART 7) */}
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="flex items-center gap-1.5 text-dm group-hover:text-tx transition-colors">
                        <FileText size={12} className="text-dm" />
                        <span>New page</span>
                      </span>

                      {/* Small subtle Source Badge */}
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-mono tracking-tight uppercase ${getSourceBadgeColor(
                          row.sourceType
                        )}`}
                        title={`Database: ${row.sourceLabel}`}
                      >
                        {row.sourceLabel}
                      </span>
                    </div>

                    {/* Category Tag */}
                    {row.category && (
                      <div className="mb-2">
                        <Tag
                          color={getCategoryColor(row.category)}
                          className="text-[10px] py-0.5 px-2 font-medium"
                        >
                          {row.category}
                        </Tag>
                      </div>
                    )}

                    {/* Time text (06.00 - 07.00) */}
                    {row.timeDisplay && row.timeDisplay !== '—' && (
                      <div className="text-[11px] text-dm font-mono mb-2 flex items-center gap-1">
                        <Clock size={11} className="text-dm/70" />
                        <span>{row.timeDisplay}</span>
                      </div>
                    )}

                    {/* Title & Notes/Subtasks */}
                    <div className="space-y-1 mb-2.5">
                      <div className="flex items-start gap-1.5 text-tx font-medium leading-snug">
                        {row.isHabitOccurrence ? (
                          <button
                            type="button"
                            onClick={(e) => handleToggleHabit(row, e)}
                            className="mt-0.5 shrink-0 hover:scale-125 transition-transform"
                            title="Tandai habit selesai/batal"
                          >
                            <CheckCircle2
                              size={13}
                              className={row.habitCompleted ? 'text-ok' : 'text-dm/50'}
                            />
                          </button>
                        ) : (
                          <FileText size={12} className="shrink-0 mt-0.5 text-dm" />
                        )}
                        <span className={row.habitCompleted ? 'line-through text-dm' : ''}>
                          {row.title}
                        </span>
                      </div>

                      {row.notes && row.notes !== row.title && (
                        <div className="flex items-start gap-1.5 text-dm text-[11px] leading-snug">
                          <FileText size={11} className="shrink-0 mt-0.5 text-dm/60" />
                          <span className="truncate">{row.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom row: Status & Quick delete hover button */}
                    <div className="flex items-center justify-between pt-0.5">
                      {row.status ? getStatusBadge(row.status) : <div />}

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(row);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-dm hover:text-bd rounded transition-opacity"
                          title="Hapus / Sembunyikan baris ini"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Card Flow: Open AddOrLinkRecordModal (PART 1: TWO DISTINCT MODES) */}
              {!readOnly && (
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => setAddingToGroup(groupName)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-dm hover:text-tx hover:bg-hv/50 rounded transition-colors"
                  >
                    <Plus size={13} />
                    <span>New page</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete / Remove Confirmation Modal (PART 16) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-ln bg-pn p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-ln/60 pb-2">
              <h3 className="font-bold text-[13px] text-tx">Hapus Item dari Multi-Source View</h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-dm hover:text-tx"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[12px] text-dm leading-relaxed">
              Anda ingin menghapus <strong className="text-tx">"{deleteTarget.title}"</strong> (Sumber:{' '}
              <span className="text-nt font-semibold">{deleteTarget.sourceLabel}</span>).
              Tentukan tindakan yang diinginkan:
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => confirmDeleteRecord(true)}
                className="w-full flex items-center justify-between p-2.5 rounded border border-bd/40 bg-bd/10 hover:bg-bd/20 text-left text-[12px] text-bd font-medium transition-colors"
              >
                <span>Hapus Record Asli dari Database Master</span>
                <Trash2 size={14} />
              </button>

              <button
                type="button"
                onClick={() => confirmDeleteRecord(false)}
                className="w-full flex items-center justify-between p-2.5 rounded border border-ln hover:bg-hv/60 text-left text-[12px] text-tx transition-colors"
              >
                <span>Sembunyikan dari View Ini Saja</span>
                <span className="text-[10px] text-dm">Record tetap ada</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 text-[12px] text-dm hover:text-tx"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Peek / Edit Modal on Master Database (PART 15) */}
      {activePeekRow && (
        <RecordPeekModal
          table={activePeekRow.originalTable}
          record={activePeekRow.originalRecord}
          onClose={() => setActivePeekRow(null)}
        />
      )}

      {/* Add or Link Record Modal with 2 Workflows (PART 1: TEST A & TEST B) */}
      {addingToGroup && (
        <AddOrLinkRecordModal
          isOpen={Boolean(addingToGroup)}
          onClose={() => setAddingToGroup(null)}
          availableDatabaseIds={sourceDatabases}
          targetGroup={{ key: groupByKey, value: addingToGroup }}
        />
      )}
    </div>
  );
}
