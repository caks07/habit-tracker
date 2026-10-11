import { useState } from 'react';
import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  ExternalLink,
  Flame,
  Hash,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  Plus,
  Share2,
  Star,
  Tag as TagIcon,
  Trash2,
  X,
} from 'lucide-react';
import type { PropertyType, SourceTable, TableProperty, TableRecord } from '../../types';
import { useStore } from '../../store';
import { AutoText, ImagePicker, Tag } from '../ui';
import { uid } from '../../lib/util';
import { formatShortDate } from '../../lib/date';
import { RelationPickerModal } from '../modals/RelationPickerModal';
import { computeHabitStreak, parseHabitDays } from '../../lib/normalization';

interface Props {
  table: SourceTable;
  record: TableRecord;
  onClose: () => void;
}

export function RecordPeekModal({ table, record, onClose }: Props) {
  const updateRecord = useStore((s) => s.updateRecord);
  const removeRecord = useStore((s) => s.removeRecord);
  const addProperty = useStore((s) => s.addProperty);
  const removeProperty = useStore((s) => s.removeProperty);
  const addRecord = useStore((s) => s.addRecord);
  const tables = useStore((s) => s.tables);
  const notify = useStore((s) => s.notify);

  const [values, setValues] = useState<Record<string, any>>({ ...record.values });
  const [deletePropConfirm, setDeletePropConfirm] = useState<TableProperty | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<string[]>(
    values._comments ? (Array.isArray(values._comments) ? values._comments : []) : []
  );
  const [showAddProp, setShowAddProp] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PropertyType>('text');

  const handleChange = (key: string, val: any) => {
    const next = { ...values, [key]: val };
    setValues(next);
    updateRecord(table.id, record.id, { [key]: val });
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const next = [...comments, commentInput.trim()];
    setComments(next);
    setCommentInput('');
    updateRecord(table.id, record.id, { _comments: next });
  };

  const handleDelete = () => {
    removeRecord(table.id, record.id);
    notify(`Record dihapus dari database ${table.name}`);
    onClose();
  };

  const handleAddProperty = () => {
    if (!newPropName.trim()) return;
    const key = newPropName.toLowerCase().replace(/\s+/g, '_');
    const newProp: TableProperty = {
      id: uid(),
      key,
      name: newPropName.trim(),
      type: newPropType,
      width: 130,
    };
    addProperty(table.id, newProp);
    setNewPropName('');
    setShowAddProp(false);
    notify(`Property "${newPropName}" ditambahkan ke ${table.name}`);
  };

  const getPropIcon = (type: PropertyType) => {
    switch (type) {
      case 'date':
        return <Calendar size={14} className="text-dm" />;
      case 'time':
        return <Clock size={14} className="text-dm" />;
      case 'select':
      case 'status':
        return <TagIcon size={14} className="text-dm" />;
      case 'number':
        return <Hash size={14} className="text-dm" />;
      case 'rating':
        return <Star size={14} className="text-dm" />;
      case 'checkbox':
        return <CheckSquare size={14} className="text-dm" />;
      default:
        return <span className="text-[12px] text-dm">Aa</span>;
    }
  };

  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const titleValue = values[titleProp?.key || 'title'] || 'Tanpa Judul';

  // ID-based Relation resolution (PART 2, PART 6 & PART 7)
  const isActivityRecord = table.id === 'activities' || table.id === 'entertainment';
  const scheduleTable = tables['schedule'];
  const tasksTable = tables['tasks'];
  const assignmentsTable = tables['assignments'];

  const [relationPicker, setRelationPicker] = useState<{
    targetTableId: string;
    title: string;
    fieldKey: string;
  } | null>(null);

  const [activeSubPeek, setActiveSubPeek] = useState<{
    table: SourceTable;
    record: TableRecord;
  } | null>(null);

  // 1. Linked Schedules (strictly by ID)
  const explicitScheduleIds: string[] = Array.isArray(values.scheduleIds) ? values.scheduleIds : [];
  const linkedSchedules = scheduleTable
    ? scheduleTable.records.filter(
        (r) => explicitScheduleIds.includes(r.id) || r.values.activityId === record.id
      )
    : [];

  // 2. Linked Tasks (strictly by ID)
  const explicitTaskIds: string[] = Array.isArray(values.taskIds) ? values.taskIds : [];
  const linkedTasks = tasksTable
    ? tasksTable.records.filter(
        (r) => explicitTaskIds.includes(r.id) || r.values.activityId === record.id
      )
    : [];

  // 3. Linked Assignments (strictly by ID)
  const explicitAssignmentIds: string[] = Array.isArray(values.assignmentIds)
    ? values.assignmentIds
    : [];
  const linkedAssignments = assignmentsTable
    ? assignmentsTable.records.filter(
        (r) =>
          explicitAssignmentIds.includes(r.id) ||
          r.values.course === record.id ||
          r.values.activityId === record.id
      )
    : [];

  const handleLinkRecord = (targetId: string, fieldKey: string) => {
    const current = Array.isArray(values[fieldKey]) ? values[fieldKey] : [];
    if (!current.includes(targetId)) {
      const next = [...current, targetId];
      handleChange(fieldKey, next);
    }
  };

  const handleUnlinkRecord = (targetId: string, fieldKey: string) => {
    const current = Array.isArray(values[fieldKey]) ? values[fieldKey] : [];
    const next = current.filter((id: string) => id !== targetId);
    handleChange(fieldKey, next);
  };

  const handleAddSubSchedule = () => {
    if (!scheduleTable) return;
    const newId = addRecord('schedule', {
      title: `${titleValue} (Sesi Baru)`,
      activityId: record.id,
      day: 'Selasa',
      startTime: '19:00',
      endTime: '21:30',
      place: 'Zoom',
      category: 'Study',
      status: 'Planned',
    });
    handleLinkRecord(newId, 'scheduleIds');
    notify(`Jadwal baru ditambahkan dengan ID stabil dan ditautkan ke "${titleValue}"`);
  };

  const handleAddSubTask = () => {
    if (!tasksTable) return;
    const newId = addRecord('tasks', {
      title: `Tugas untuk ${titleValue}`,
      activityId: record.id,
      category: 'Kuliah',
      status: 'Not started',
      dueDate: new Date().toISOString().split('T')[0],
    });
    handleLinkRecord(newId, 'taskIds');
    notify(`Task baru ditambahkan dengan ID stabil dan ditautkan ke "${titleValue}"`);
  };

  const handleAddSubAssignment = () => {
    if (!assignmentsTable) return;
    const newId = addRecord('assignments', {
      title: `Tugas Baru - ${titleValue}`,
      course: record.id,
      activityId: record.id,
      category: 'Bootcamp',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Not started',
    });
    handleLinkRecord(newId, 'assignmentIds');
    notify(`Assignment baru ditambahkan dengan ID stabil dan ditautkan ke "${titleValue}"`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-3 sm:p-6 pt-[4vh] pb-24 backdrop-blur-xs font-mono"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-4xl rounded-xl border border-ln bg-pn shadow-2xl overflow-hidden animate-in fade-in duration-150 mb-16"
        style={{ backgroundColor: 'var(--pn)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Top Notion-style App Toolbar */}
        <div
          className="flex items-center justify-between border-b border-ln/70 px-6 py-2.5 select-none"
          style={{ backgroundColor: 'var(--pn)' }}
        >
          <div className="flex items-center gap-2 text-[12px] text-dm">
            <span>Database:</span>
            <span className="font-semibold text-tx">{table.name}</span>
          </div>

          <div className="flex items-center gap-2 text-dm">
            <button
              type="button"
              onClick={handleDelete}
              title="Hapus baris ini dari database"
              className="rounded p-1.5 hover:bg-hv hover:text-bd transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <div className="w-px h-4 bg-ln/70" />
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 hover:bg-hv hover:text-tx transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Cover Image Banner (Screenshot 2) */}
        <div className="group/cover relative h-48 sm:h-56 w-full overflow-hidden bg-hv/60">
          {values.cover ? (
            <img
              src={values.cover}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-dm/40 text-[13px]">
              <span>Belum ada cover banner</span>
            </div>
          )}

          <div className="absolute bottom-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <ImagePicker
              label={values.cover ? 'Ganti Cover' : 'Tambah Cover'}
              onPick={(img) => handleChange('cover', img)}
            />
          </div>
        </div>

        {/* Modal Page Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Main Title Input (Screenshot 2: "Bootcamp Data Analyst with Excel") */}
          <div>
            <input
              type="text"
              value={titleValue}
              onChange={(e) => handleChange(titleProp?.key || 'title', e.target.value)}
              placeholder="Judul halaman..."
              className="bare text-2xl sm:text-3xl font-bold text-tx placeholder:text-dm leading-tight"
            />
          </div>

          {/* Properties Section (Screenshot 2: Event, Sesi, Achive, + Add a property) */}
          <div className="space-y-2 border-b border-ln/60 pb-6 text-[13px]">
            {table.properties
              .filter((p) => p.type !== 'title' && p.key !== 'cover')
              .map((prop) => {
                const isHabitDays =
                  prop.key === 'days' ||
                  prop.key === 'senin_minggu' ||
                  prop.name.toLowerCase().includes('weekly schedule') ||
                  prop.name.toLowerCase().includes('senin-minggu');

                // 1. Habit Weekly Schedule Days
                if (isHabitDays) {
                  const daysArr = parseHabitDays(values[prop.key]);
                  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                  return (
                    <div
                      key={prop.id}
                      className="grid grid-cols-[150px_1fr] items-center gap-3 py-1 group"
                    >
                      <div className="flex items-center justify-between text-dm pr-2">
                        <div className="flex items-center gap-2 truncate">
                          {getPropIcon(prop.type)}
                          <span className="truncate">{prop.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeletePropConfirm(prop)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-dm hover:text-bd rounded transition-opacity"
                          title={`Hapus kolom ${prop.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {dayLabels.map((lbl, dIdx) => {
                          const active = daysArr[dIdx] === 1;
                          return (
                            <button
                              key={dIdx}
                              type="button"
                              onClick={() => {
                                const updated = [...daysArr];
                                updated[dIdx] = active ? 0 : 1;
                                handleChange(prop.key, updated);
                                if ('streak' in values) {
                                  const newStreak = computeHabitStreak(
                                    updated,
                                    values.streak,
                                    values.completions
                                  );
                                  handleChange('streak', newStreak);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                                active
                                  ? 'bg-ac/25 text-ac font-semibold border border-ac/50 hover:bg-ac/35'
                                  : 'text-dm/40 hover:bg-hv hover:text-dm border border-transparent'
                              }`}
                              title={`${lbl}: ${active ? 'Aktif' : 'Belum'}`}
                            >
                              {active ? `✓ ${lbl}` : `· ${lbl}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // 2. Habit Streak (Auto-Computed)
                if (prop.key === 'streak') {
                  const streakComputed = computeHabitStreak(
                    values.days,
                    values[prop.key],
                    values.completions
                  );
                  return (
                    <div
                      key={prop.id}
                      className="grid grid-cols-[150px_1fr] items-center gap-3 py-1 group"
                    >
                      <div className="flex items-center justify-between text-dm pr-2">
                        <div className="flex items-center gap-2 truncate text-amber-400">
                          <Flame size={13} className="fill-amber-400" />
                          <span className="truncate">{prop.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeletePropConfirm(prop)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-dm hover:text-bd rounded transition-opacity"
                          title={`Hapus kolom ${prop.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[13px] font-medium text-amber-400">
                        <Flame size={13} className="fill-amber-400" />
                        <span>{streakComputed} hari (Otomatis)</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={prop.id}
                    className="grid grid-cols-[150px_1fr] items-center gap-3 py-1 group"
                  >
                    <div className="flex items-center justify-between text-dm pr-2">
                      <div className="flex items-center gap-2 truncate">
                        {getPropIcon(prop.type)}
                        <span className="truncate">{prop.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeletePropConfirm(prop)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-dm hover:text-bd rounded transition-opacity"
                        title={`Hapus kolom ${prop.name}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex items-center">
                      {prop.type === 'select' || prop.type === 'status' ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {prop.options?.map((opt) => {
                            const isSelected = values[prop.key] === opt.label;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleChange(prop.key, opt.label)}
                                className={`transition-all rounded-[3px] ${
                                  isSelected
                                    ? 'ring-1 ring-nt shadow-xs'
                                    : 'opacity-65 hover:opacity-100'
                                }`}
                              >
                                <Tag color={opt.color}>{opt.label}</Tag>
                              </button>
                            );
                          })}
                        </div>
                      ) : prop.type === 'date' ? (
                        <input
                          type="date"
                          value={values[prop.key] || ''}
                          onChange={(e) => handleChange(prop.key, e.target.value)}
                          className="bare rounded bg-hv/50 px-2 py-1 text-tx max-w-[150px]"
                        />
                      ) : prop.type === 'time' ? (
                        <input
                          type="time"
                          value={values[prop.key] || ''}
                          onChange={(e) => handleChange(prop.key, e.target.value)}
                          className="bare rounded bg-hv/50 px-2 py-1 text-tx max-w-[110px]"
                        />
                      ) : prop.type === 'number' ? (
                        <input
                          type="number"
                          value={values[prop.key] ?? ''}
                          onChange={(e) => handleChange(prop.key, Number(e.target.value))}
                          className="bare rounded bg-hv/50 px-2 py-1 text-tx max-w-[110px]"
                        />
                      ) : prop.type === 'rating' ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleChange(prop.key, star)}
                              className="p-0.5"
                            >
                              <Star
                                size={14}
                                className={
                                  (values[prop.key] || 0) >= star
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-dm/40'
                                }
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={values[prop.key] || ''}
                          onChange={(e) => handleChange(prop.key, e.target.value)}
                          placeholder="Kosong"
                          className="bare px-1 text-tx"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

            {/* "+ Add a property" row */}
            {!showAddProp ? (
              <button
                type="button"
                onClick={() => setShowAddProp(true)}
                className="mt-2 flex items-center gap-1.5 text-[12px] text-dm hover:text-tx transition-colors pt-1"
              >
                <Plus size={13} />
                <span>Add a property</span>
              </button>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded bg-hv/60 p-2 text-[12px]">
                <input
                  type="text"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  placeholder="Nama properti baru..."
                  className="bare bg-bg px-2 py-1 rounded text-tx"
                  autoFocus
                />
                <select
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value as PropertyType)}
                  className="rounded bg-bg px-2 py-1 text-tx border border-ln text-[12px]"
                >
                  <option value="text">Teks</option>
                  <option value="date">Tanggal</option>
                  <option value="time">Jam</option>
                  <option value="number">Angka</option>
                  <option value="rating">Rating</option>
                  <option value="select">Select</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddProperty}
                  className="rounded bg-nv px-2.5 py-1 text-nt font-semibold"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProp(false)}
                  className="text-dm hover:text-tx"
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          {/* Comments Section (Screenshot 2: Comments / Add a comment...) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-dm uppercase tracking-wider">
              <MessageSquare size={14} />
              <span>Comments</span>
            </div>

            {comments.map((comment, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded bg-hv/40 p-2.5 text-[12px]">
                <div className="h-6 w-6 rounded-full bg-nv text-nt flex items-center justify-center font-bold text-[11px] shrink-0">
                  M
                </div>
                <div className="text-tx leading-relaxed flex-1">{comment}</div>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-nv text-nt flex items-center justify-center font-bold text-[12px] shrink-0">
                M
              </div>
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="bare flex-1 rounded border border-ln/60 bg-bg/50 px-3 py-1.5 text-[12px] text-tx placeholder:text-dm"
              />
              {commentInput && (
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="rounded bg-nv px-3 py-1 text-[11px] font-semibold text-nt"
                >
                  Kirim
                </button>
              )}
            </div>
          </div>

          {/* Sub-Linked Databases (Screenshot 2: ↗ Schedule & ↗ Tasks & ↗ Assignment inside Page!) */}
          {isActivityRecord && (
            <div className="space-y-8 pt-4 border-t border-ln/70">
              {/* 1. ↗ Schedule Linked View */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-tx flex items-center gap-1.5">
                      <Clock size={14} className="text-nt" />
                      <span>Related Schedule</span>
                    </span>
                    <span className="text-[11px] text-dm">({linkedSchedules.length} sesi)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRelationPicker({
                          targetTableId: 'schedule',
                          title: 'Tautkan Jadwal ke ' + titleValue,
                          fieldKey: 'scheduleIds',
                        })
                      }
                      className="flex items-center gap-1 rounded border border-ln bg-hv/50 px-2.5 py-1 text-[11px] font-medium text-tx hover:border-nt transition-colors"
                      title="Pilih jadwal yang sudah ada dari database Schedule"
                    >
                      <Link2 size={12} className="text-nt" />
                      <span>Tautkan Schedule</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSubSchedule}
                      className="flex items-center gap-1 rounded bg-nv/40 border border-nv px-2.5 py-1 text-[11px] font-semibold text-nt hover:bg-nv transition-colors"
                    >
                      <Plus size={12} />
                      <span>New session</span>
                    </button>
                  </div>
                </div>

                {/* Sub-table Schedule */}
                <div className="overflow-x-auto rounded border border-ln/60 bg-bg/30">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-ln/60 text-dm">
                        <th className="p-2 font-normal">Sesi / Topik</th>
                        <th className="p-2 font-normal">Hari</th>
                        <th className="p-2 font-normal">Jam</th>
                        <th className="p-2 font-normal">Tempat</th>
                        <th className="p-2 font-normal w-12 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedSchedules.map((sch) => (
                        <tr
                          key={sch.id}
                          className="border-b border-ln/30 hover:bg-hv/40 cursor-pointer group/row"
                        >
                          <td
                            className="p-2 font-medium text-tx hover:text-nt"
                            onClick={() => scheduleTable && setActiveSubPeek({ table: scheduleTable, record: sch })}
                          >
                            {sch.values.title}
                          </td>
                          <td className="p-2">
                            <Tag color="purple" className="text-[10px]">
                              {sch.values.day || 'Senin'}
                            </Tag>
                          </td>
                          <td className="p-2 text-dm">
                            {sch.values.startTime || '19.00'} - {sch.values.endTime || '21.30'}
                          </td>
                          <td className="p-2 text-dm">{sch.values.place || 'Zoom'}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkRecord(sch.id, 'scheduleIds');
                              }}
                              className="text-dm hover:text-bd p-0.5 rounded opacity-0 group-hover/row:opacity-100 transition-opacity"
                              title="Putus relasi jadwal ini"
                            >
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {linkedSchedules.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-dm">
                            Belum ada jadwal tertaut. Gunakan "Tautkan Schedule" atau "+ New session".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. ↗ Related Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-tx flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-nt" />
                      <span>Related Tasks</span>
                    </span>
                    <span className="text-[11px] text-dm">({linkedTasks.length} tasks)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRelationPicker({
                          targetTableId: 'tasks',
                          title: 'Tautkan Task ke ' + titleValue,
                          fieldKey: 'taskIds',
                        })
                      }
                      className="flex items-center gap-1 rounded border border-ln bg-hv/50 px-2.5 py-1 text-[11px] font-medium text-tx hover:border-nt transition-colors"
                    >
                      <Link2 size={12} className="text-nt" />
                      <span>Tautkan Task</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSubTask}
                      className="flex items-center gap-1 rounded bg-nv/40 border border-nv px-2.5 py-1 text-[11px] font-semibold text-nt hover:bg-nv transition-colors"
                    >
                      <Plus size={12} />
                      <span>New task</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded border border-ln/60 bg-bg/30">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-ln/60 text-dm">
                        <th className="p-2 font-normal">Judul Tugas</th>
                        <th className="p-2 font-normal">Kategori</th>
                        <th className="p-2 font-normal">Tenggat</th>
                        <th className="p-2 font-normal">Status</th>
                        <th className="p-2 font-normal w-12 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedTasks.map((tsk) => (
                        <tr
                          key={tsk.id}
                          className="border-b border-ln/30 hover:bg-hv/40 cursor-pointer group/row"
                        >
                          <td
                            className="p-2 font-medium text-tx hover:text-nt"
                            onClick={() => tasksTable && setActiveSubPeek({ table: tasksTable, record: tsk })}
                          >
                            {tsk.values.title}
                          </td>
                          <td className="p-2">
                            <Tag color="blue" className="text-[10px]">
                              {tsk.values.category || 'General'}
                            </Tag>
                          </td>
                          <td className="p-2 text-dm">
                            {formatShortDate(tsk.values.dueDate)}
                          </td>
                          <td className="p-2">
                            <Tag
                              color={tsk.values.status === 'Done' ? 'green' : 'gray'}
                              className="text-[10px]"
                            >
                              {tsk.values.status || 'Not started'}
                            </Tag>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkRecord(tsk.id, 'taskIds');
                              }}
                              className="text-dm hover:text-bd p-0.5 rounded opacity-0 group-hover/row:opacity-100 transition-opacity"
                              title="Putus relasi tugas ini"
                            >
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {linkedTasks.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-dm">
                            Belum ada tugas tertaut. Gunakan "Tautkan Task" atau "+ New task".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. ↗ Assignment Linked View */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-tx flex items-center gap-1.5">
                      <ExternalLink size={14} className="text-nt" />
                      <span>Assignment</span>
                    </span>
                    <span className="text-[11px] text-dm">({linkedAssignments.length} tugas)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRelationPicker({
                          targetTableId: 'assignments',
                          title: 'Tautkan Assignment ke ' + titleValue,
                          fieldKey: 'assignmentIds',
                        })
                      }
                      className="flex items-center gap-1 rounded border border-ln bg-hv/50 px-2.5 py-1 text-[11px] font-medium text-tx hover:border-nt transition-colors"
                    >
                      <Link2 size={12} className="text-nt" />
                      <span>Tautkan Tugas</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSubAssignment}
                      className="flex items-center gap-1 rounded bg-nv/40 border border-nv px-2.5 py-1 text-[11px] font-semibold text-nt hover:bg-nv transition-colors"
                    >
                      <Plus size={12} />
                      <span>New assignment</span>
                    </button>
                  </div>
                </div>

                {/* Sub-table Assignment */}
                <div className="overflow-x-auto rounded border border-ln/60 bg-bg/30">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-ln/60 text-dm">
                        <th className="p-2 font-normal">Topik</th>
                        <th className="p-2 font-normal">Kategori</th>
                        <th className="p-2 font-normal">Deadline</th>
                        <th className="p-2 font-normal">Status</th>
                        <th className="p-2 font-normal w-12 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedAssignments.map((asg) => (
                        <tr
                          key={asg.id}
                          className="border-b border-ln/30 hover:bg-hv/40 cursor-pointer group/row"
                        >
                          <td
                            className="p-2 font-medium text-tx hover:text-nt"
                            onClick={() =>
                              assignmentsTable && setActiveSubPeek({ table: assignmentsTable, record: asg })
                            }
                          >
                            {asg.values.title}
                          </td>
                          <td className="p-2">
                            <Tag color="green" className="text-[10px]">
                              {asg.values.category || 'Bootcamp'}
                            </Tag>
                          </td>
                          <td className="p-2 text-dm">
                            {formatShortDate(asg.values.dueDate)}
                          </td>
                          <td className="p-2">
                            <Tag color="blue" className="text-[10px]">
                              {asg.values.status || 'In progress'}
                            </Tag>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkRecord(asg.id, 'assignmentIds');
                              }}
                              className="text-dm hover:text-bd p-0.5 rounded opacity-0 group-hover/row:opacity-100 transition-opacity"
                              title="Putus relasi tugas ini"
                            >
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {linkedAssignments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-dm">
                            Belum ada tugas tertaut. Gunakan "Tautkan Tugas" atau "+ New assignment".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Description & Page Body Notes */}
          <div className="space-y-2 border-t border-ln/60 pt-6">
            <div className="text-[12px] font-semibold text-dm uppercase tracking-wider">
              Deskripsi & Catatan
            </div>
            <AutoText
              value={values.notes || values.description || ''}
              onChange={(v) => handleChange('notes', v)}
              placeholder="Tulis deskripsi atau catatan detail untuk halaman ini..."
              className="min-h-[120px] rounded border border-ln/60 bg-bg/40 p-4 text-[13px] text-tx placeholder:text-dm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Relation Picker Modal */}
      {relationPicker && (
        <RelationPickerModal
          title={relationPicker.title}
          targetTableId={relationPicker.targetTableId}
          selectedIds={Array.isArray(values[relationPicker.fieldKey]) ? values[relationPicker.fieldKey] : []}
          onSelect={(recId) => handleLinkRecord(recId, relationPicker.fieldKey)}
          onDeselect={(recId) => handleUnlinkRecord(recId, relationPicker.fieldKey)}
          onClose={() => setRelationPicker(null)}
        />
      )}

      {/* Active Sub-Peek Modal */}
      {activeSubPeek && (
        <RecordPeekModal
          table={activeSubPeek.table}
          record={activeSubPeek.record}
          onClose={() => setActiveSubPeek(null)}
        />
      )}
      {/* Delete Property Confirmation Modal (TEST C & REQUIREMENT 5) */}
      {deletePropConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-ln bg-pn p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-tx">
                Hapus properti "{deletePropConfirm.name}"?
              </h3>
              <button
                type="button"
                onClick={() => setDeletePropConfirm(null)}
                className="text-dm hover:text-tx p-1"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-dm leading-relaxed">
              Tindakan ini akan menghapus properti <strong>"{deletePropConfirm.name}"</strong> dari database ini.
              Data baris (record) tidak akan dihapus.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletePropConfirm(null)}
                className="rounded border border-ln bg-transparent px-3 py-1.5 text-xs text-tx hover:bg-hv"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const propName = deletePropConfirm.name;
                  removeProperty(table.id, deletePropConfirm.id);
                  setDeletePropConfirm(null);
                  notify(`Properti "${propName}" berhasil dihapus dari ${table.name}`);
                }}
                className="rounded bg-bd px-3 py-1.5 text-xs font-semibold text-white hover:bg-bd/90"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
