import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { NormalizedRecordRow, SourceTable, TagColor } from '../../types';
import { useStore } from '../../store';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';
import { AddOrLinkRecordModal } from '../modals/AddOrLinkRecordModal';

interface Props {
  rows: NormalizedRecordRow[];
  tables: Record<string, SourceTable>;
  sourceDatabases: string[];
  readOnly?: boolean;
  onRemoveFromView?: (rowId: string) => void;
}

export function MultiSourceTableView({
  rows,
  tables,
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

  // Add Row Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetDbId, setTargetDbId] = useState<string>(sourceDatabases[0] || 'tasks');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newCategory, setNewCategory] = useState('');

  // Delete target modal
  const [deleteTarget, setDeleteTarget] = useState<NormalizedRecordRow | null>(null);

  const availableSources = sourceDatabases
    .map((id) => tables[id])
    .filter(Boolean);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || readOnly) return;

    const targetTable = tables[targetDbId];
    if (!targetTable) return;

    const initialValues: Record<string, any> = {
      title,
      status: 'Not started',
    };

    if (targetDbId.includes('schedule')) {
      initialValues.startTime = newStartTime;
      initialValues.endTime = newEndTime;
      initialValues.category = newCategory || 'Study';
      initialValues.date = newDate;
      initialValues.place = 'Online';
    } else if (targetDbId.includes('tasks')) {
      initialValues.time = `${newStartTime} - ${newEndTime}`;
      initialValues.category = newCategory || 'Kuliah';
      initialValues.dueDate = newDate;
      initialValues.subtasks = title;
    } else if (targetDbId.includes('activities')) {
      initialValues.category = newCategory || 'Bootcamp';
      initialValues.event = 'Program';
      initialValues.status = 'Active';
    } else if (targetDbId.includes('habits')) {
      initialValues.category = newCategory || 'Health';
      initialValues.days = [0, 0, 0, 0, 0, 0, 0];
      initialValues.streak = 0;
      initialValues.status = 'Active';
    } else if (targetDbId.includes('entertainment')) {
      initialValues.type = newCategory || 'Movie';
      initialValues.date = newDate;
      initialValues.time = newStartTime;
      initialValues.status = 'Wishlist';
    } else if (targetDbId.includes('assignments')) {
      initialValues.category = newCategory || 'Kuliah';
      initialValues.dueDate = newDate;
    }

    addRecord(targetTable.id, initialValues);
    notify(`Record baru dibuat di database master "${targetTable.name}"`);
    setShowAddModal(false);
    setNewTitle('');
  };

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

  const confirmDeleteRecord = (deleteOriginal: boolean) => {
    if (!deleteTarget) return;

    if (deleteOriginal) {
      removeRecord(deleteTarget.sourceDatabaseId, deleteTarget.sourceRecordId);
      notify(`Record dihapus dari database master "${deleteTarget.sourceLabel}"`);
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
    if (!status) return <span className="text-dm/60">—</span>;
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

  return (
    <div className="w-full space-y-3 font-mono text-[13px]">
      {/* Unified Table Container */}
      <div className="overflow-x-auto rounded border border-ln/70 bg-bg/40">
        <table className="w-full text-left text-[12px] border-collapse">
          <thead>
            <tr className="border-b border-ln/70 bg-pn/60 text-dm select-none">
              <th className="p-2.5 font-medium pl-3">Aktivitas / Judul</th>
              <th className="p-2.5 font-medium w-24">Source</th>
              <th className="p-2.5 font-medium w-24">Waktu</th>
              <th className="p-2.5 font-medium w-28">Hari / Tgl</th>
              <th className="p-2.5 font-medium w-24">Kategori</th>
              <th className="p-2.5 font-medium w-28">Status</th>
              <th className="p-2.5 font-medium">Catatan / Detail</th>
              {!readOnly && <th className="p-2.5 font-medium w-16 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setActivePeekRow(row)}
                className="border-b border-ln/30 hover:bg-hv/50 cursor-pointer group transition-colors"
              >
                {/* Title with Habit checkbox or Page link */}
                <td className="p-2.5 pl-3 font-medium text-tx">
                  <div className="flex items-center gap-2">
                    {row.isHabitOccurrence ? (
                      <button
                        type="button"
                        onClick={(e) => handleToggleHabit(row, e)}
                        className="shrink-0 hover:scale-125 transition-transform"
                        title="Tandai habit selesai/batal"
                      >
                        <CheckCircle2
                          size={14}
                          className={row.habitCompleted ? 'text-ok' : 'text-dm/50'}
                        />
                      </button>
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-nt shrink-0" />
                    )}
                    <span
                      className={`hover:text-nt transition-colors ${
                        row.habitCompleted ? 'line-through text-dm' : ''
                      }`}
                    >
                      {row.title}
                    </span>
                  </div>
                </td>

                {/* Source Badge (PART 7) */}
                <td className="p-2.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-tight uppercase ${getSourceBadgeColor(
                      row.sourceType
                    )}`}
                    title={`Database: ${row.sourceLabel}`}
                  >
                    {row.sourceLabel}
                  </span>
                </td>

                {/* Start / End Time */}
                <td className="p-2.5 text-dm font-mono">
                  {row.startTime ? (
                    <span className="text-tx font-medium">
                      {row.startTime}
                      {row.endTime ? `–${row.endTime}` : ''}
                    </span>
                  ) : (
                    <span className="text-dm/40">—</span>
                  )}
                </td>

                {/* Day / Date */}
                <td className="p-2.5 text-dm">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-tx font-medium">{row.day || '—'}</span>
                    {row.date && <span className="text-dm/70 text-[10px]">{row.date}</span>}
                  </div>
                </td>

                {/* Category */}
                <td className="p-2.5">
                  {row.category ? (
                    <Tag color={getCategoryColor(row.category)} className="text-[10px] px-2 py-0.5">
                      {row.category}
                    </Tag>
                  ) : (
                    <span className="text-dm/40">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="p-2.5">{getStatusBadge(row.status)}</td>

                {/* Notes / Subtasks / Place */}
                <td className="p-2.5 text-dm text-[11px] max-w-[200px] truncate">
                  {row.place && (
                    <span className="mr-2 inline-flex items-center gap-1 text-tx/80">
                      <MapPin size={10} className="text-dm" />
                      {row.place}
                    </span>
                  )}
                  {row.notes ? row.notes : <span className="text-dm/40">—</span>}
                </td>

                {/* Actions */}
                {!readOnly && (
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(row);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-dm hover:text-bd rounded transition-opacity"
                      title="Hapus / Sembunyikan baris ini"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-dm">
                  <p className="text-[13px]">Tidak ada data yang cocok dengan filter saat ini.</p>
                  <p className="text-[11px] text-dm/70 mt-1">
                    Gunakan tombol "+ Add row" di bawah untuk menambahkan record baru ke database.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Row Button (PART 12) */}
      {!readOnly && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              if (availableSources.length > 0) {
                setTargetDbId(availableSources[0].id);
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-ln/80 bg-pn/40 hover:border-nt hover:text-tx text-dm text-[12px] transition-colors"
          >
            <Plus size={14} className="text-nt" />
            <span>+ Add row (Pilih Sumber Database)</span>
          </button>

          <span className="text-[11px] text-dm">
            Menampilkan {rows.length} aktivitas dari {sourceDatabases.length} database
          </span>
        </div>
      )}

      {/* Add or Link Record Modal with 2 Workflows (PART 1: TEST A & TEST B) */}
      {showAddModal && (
        <AddOrLinkRecordModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          availableDatabaseIds={sourceDatabases}
        />
      )}

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
    </div>
  );
}
