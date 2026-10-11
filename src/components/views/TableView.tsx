import { useState } from 'react';
import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Copy,
  Eye,
  Flame,
  Hash,
  MoreHorizontal,
  Plus,
  Star,
  Tag as TagIcon,
  Trash2,
  X,
} from 'lucide-react';
import type { PropertyType, SourceTable, TableProperty, TableRecord } from '../../types';
import { useStore } from '../../store';
import { formatShortDate } from '../../lib/date';
import { Tag } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';
import { computeHabitStreak, parseHabitDays } from '../../lib/normalization';
import { uid } from '../../lib/util';

interface Props {
  table: SourceTable;
  records: TableRecord[];
  visiblePropertyKeys?: string[];
  defaultValuesForNew?: Record<string, any>;
  readOnly?: boolean;
}

export function TableView({
  table,
  records,
  visiblePropertyKeys,
  defaultValuesForNew = {},
  readOnly = false,
}: Props) {
  const updateRecord = useStore((s) => s.updateRecord);
  const addRecord = useStore((s) => s.addRecord);
  const removeRecord = useStore((s) => s.removeRecord);
  const addProperty = useStore((s) => s.addProperty);
  const updateProperty = useStore((s) => s.updateProperty);
  const removeProperty = useStore((s) => s.removeProperty);
  const notify = useStore((s) => s.notify);

  const [activePeek, setActivePeek] = useState<TableRecord | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [editingSelect, setEditingSelect] = useState<{
    recordId: string;
    propKey: string;
  } | null>(null);

  // Property column header menu states
  const [menuPropId, setMenuPropId] = useState<string | null>(null);
  const [renamingProp, setRenamingProp] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmProp, setDeleteConfirmProp] = useState<TableProperty | null>(null);

  const properties = visiblePropertyKeys
    ? table.properties.filter((p) => visiblePropertyKeys.includes(p.key))
    : table.properties;

  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];

  const handleCellChange = (recordId: string, propKey: string, value: any) => {
    if (readOnly) return;
    updateRecord(table.id, recordId, { [propKey]: value });
  };

  const handleAddNew = () => {
    if (readOnly || !newTitle.trim()) return;
    const values: Record<string, any> = {
      ...defaultValuesForNew,
      [titleProp.key]: newTitle.trim(),
    };
    addRecord(table.id, values);
    setNewTitle('');
  };

  const handleDuplicateProperty = (prop: TableProperty) => {
    const newProp: TableProperty = {
      ...prop,
      id: uid(),
      key: `${prop.key}_copy_${Date.now().toString().slice(-4)}`,
      name: `${prop.name} (Salinan)`,
    };
    addProperty(table.id, newProp);
    notify(`Kolom "${prop.name}" diduplikat`);
    setMenuPropId(null);
  };

  const getPropIcon = (type: PropertyType) => {
    switch (type) {
      case 'date':
        return <Calendar size={13} className="text-dm" />;
      case 'time':
        return <Clock size={13} className="text-dm" />;
      case 'select':
      case 'status':
        return <TagIcon size={13} className="text-dm" />;
      case 'number':
        return <Hash size={13} className="text-dm" />;
      case 'rating':
        return <Star size={13} className="text-dm" />;
      case 'checkbox':
        return <CheckSquare size={13} className="text-dm" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-auto text-[13px] font-mono">
      <table className="w-full border-collapse text-left">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-ln/70 text-dm text-[12px]">
            <th className="py-2.5 px-3 font-normal w-10 text-center">#</th>
            {properties.map((prop) => (
              <th
                key={prop.id}
                style={{ width: prop.width ? `${prop.width}px` : undefined }}
                className="py-2.5 px-3 font-normal select-none relative group/th"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getPropIcon(prop.type)}
                    <span className="truncate">{prop.name}</span>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuPropId(menuPropId === prop.id ? null : prop.id);
                      }}
                      className="opacity-0 group-hover/th:opacity-100 p-0.5 text-dm hover:text-tx hover:bg-hv rounded transition-opacity"
                      title={`Kelola kolom ${prop.name}`}
                    >
                      <MoreHorizontal size={13} />
                    </button>
                  )}
                </div>

                {/* Column Options Popover */}
                {menuPropId === prop.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-2 top-full mt-1 z-40 w-52 rounded-md border border-ln bg-pn p-1.5 text-[12px] shadow-2xl font-sans text-tx"
                  >
                    <div className="px-2 py-1 text-[11px] font-semibold text-dm uppercase tracking-wider border-b border-ln/50 mb-1 flex items-center justify-between">
                      <span className="truncate">Kolom: {prop.name}</span>
                      <button
                        type="button"
                        onClick={() => setMenuPropId(null)}
                        className="text-dm hover:text-tx"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRenamingProp({ id: prop.id, name: prop.name });
                        setMenuPropId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-hv transition-colors"
                    >
                      <span>Ubah Nama (Rename)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateProperty(prop)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-hv transition-colors"
                    >
                      <Copy size={12} />
                      <span>Duplikat Kolom</span>
                    </button>

                    {/* Change type submenu */}
                    <div className="py-1 border-t border-ln/40 my-1">
                      <div className="px-2 py-0.5 text-[10px] text-dm font-semibold uppercase">
                        Ubah Tipe Data
                      </div>
                      {[
                        { type: 'text', label: 'Teks' },
                        { type: 'number', label: 'Angka' },
                        { type: 'select', label: 'Pilihan (Select)' },
                        { type: 'date', label: 'Tanggal' },
                        { type: 'time', label: 'Waktu' },
                        { type: 'checkbox', label: 'Checkbox' },
                        { type: 'rating', label: 'Rating' },
                      ].map((t) => (
                        <button
                          key={t.type}
                          type="button"
                          onClick={() => {
                            updateProperty(table.id, prop.id, { type: t.type as PropertyType });
                            setMenuPropId(null);
                            notify(`Tipe kolom diubah ke ${t.label}`);
                          }}
                          className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-[11px] hover:bg-hv ${
                            prop.type === t.type ? 'text-nt font-semibold' : 'text-tx'
                          }`}
                        >
                          <span>{t.label}</span>
                          {prop.type === t.type && <Check size={11} className="text-nt" />}
                        </button>
                      ))}
                    </div>

                    {prop.type !== 'title' && (
                      <div className="pt-1 border-t border-ln/50">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmProp(prop);
                            setMenuPropId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-bd hover:bg-bd/10 transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Hapus Kolom</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </th>
            ))}
            {!readOnly && <th className="py-2.5 px-3 font-normal w-16 text-right">Aksi</th>}
          </tr>
        </thead>

        {/* Table Rows */}
        <tbody>
          {records.map((record, idx) => (
            <tr
              key={record.id}
              className="group border-b border-ln/40 hover:bg-hv/40 transition-colors"
            >
              {/* Row index */}
              <td className="py-2 px-3 text-center text-dm/60 text-[11px]">{idx + 1}</td>

              {/* Cells */}
              {properties.map((prop) => {
                const val = record.values[prop.key];

                // 1. Habit Weekly Schedule day toggles (SENIN - MINGGU)
                const isHabitDaysProp =
                  prop.key === 'days' ||
                  prop.key === 'senin_minggu' ||
                  prop.name.toLowerCase().includes('senin-minggu') ||
                  prop.name.toLowerCase().includes('weekly schedule');

                if (isHabitDaysProp) {
                  const daysArr = parseHabitDays(val);
                  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                  return (
                    <td key={prop.id} className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {dayLabels.map((lbl, dIdx) => {
                          const active = daysArr[dIdx] === 1;
                          return (
                            <button
                              key={dIdx}
                              type="button"
                              disabled={readOnly}
                              onClick={() => {
                                const updated = [...daysArr];
                                updated[dIdx] = active ? 0 : 1;
                                handleCellChange(record.id, prop.key, updated);
                                if ('streak' in record.values) {
                                  const newStreak = computeHabitStreak(
                                    updated,
                                    record.values.streak,
                                    record.values.completions
                                  );
                                  updateRecord(table.id, record.id, { streak: newStreak });
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                                active
                                  ? 'bg-ac/25 text-ac font-semibold border border-ac/50 hover:bg-ac/35'
                                  : 'text-dm/40 hover:bg-hv hover:text-dm border border-transparent'
                              }`}
                              title={`${lbl}: ${active ? 'Selesai / Aktif' : 'Belum'}`}
                            >
                              {active ? `✓ ${lbl}` : `· ${lbl}`}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  );
                }

                // 2. Computed Habit Streak
                if (prop.key === 'streak') {
                  const computedStreak = computeHabitStreak(
                    record.values.days,
                    val,
                    record.values.completions
                  );
                  return (
                    <td key={prop.id} className="py-2 px-3 whitespace-nowrap text-tx">
                      <div className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-400">
                        <Flame size={12} className="fill-amber-400 text-amber-400" />
                        <span>{computedStreak} hari</span>
                      </div>
                    </td>
                  );
                }

                if (prop.type === 'title') {
                  return (
                    <td key={prop.id} className="py-2 px-3 font-medium text-tx">
                      <div className="flex items-center justify-between gap-2">
                        {readOnly ? (
                          <span>{val || '-'}</span>
                        ) : (
                          <input
                            type="text"
                            value={val || ''}
                            onChange={(e) => handleCellChange(record.id, prop.key, e.target.value)}
                            className="bare focus:text-nt"
                            placeholder="Tanpa judul..."
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setActivePeek(record)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-dm hover:text-tx rounded transition-opacity"
                          title="Buka detail baris"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  );
                }

                if (prop.type === 'select' || prop.type === 'status') {
                  const opt = prop.options?.find((o) => o.label === val);
                  const isMenuOpen =
                    editingSelect?.recordId === record.id && editingSelect?.propKey === prop.key;

                  return (
                    <td key={prop.id} className="py-2 px-3 relative">
                      {readOnly ? (
                        opt ? <Tag color={opt.color}>{opt.label}</Tag> : <span className="text-dm">-</span>
                      ) : (
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingSelect(isMenuOpen ? null : { recordId: record.id, propKey: prop.key })
                            }
                            className="hover:opacity-80 transition-opacity"
                          >
                            {opt ? (
                              <Tag color={opt.color}>{opt.label}</Tag>
                            ) : (
                              <span className="text-dm/60 hover:text-dm">+ Pilih</span>
                            )}
                          </button>

                          {/* Options Popover */}
                          {isMenuOpen && (
                            <div className="absolute left-0 top-full mt-1 z-30 min-w-[140px] rounded-md border border-ln bg-pn p-1 shadow-lg">
                              {prop.options?.map((o) => (
                                <button
                                  key={o.id}
                                  type="button"
                                  onClick={() => {
                                    handleCellChange(record.id, prop.key, o.label);
                                    setEditingSelect(null);
                                  }}
                                  className="flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-[12px] hover:bg-hv"
                                >
                                  <Tag color={o.color}>{o.label}</Tag>
                                  {val === o.label && <Check size={12} className="text-nt" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                }

                if (prop.type === 'date') {
                  return (
                    <td key={prop.id} className="py-2 px-3 text-tx whitespace-nowrap">
                      {readOnly ? (
                        <span>{formatShortDate(val)}</span>
                      ) : (
                        <input
                          type="date"
                          value={val || ''}
                          onChange={(e) => handleCellChange(record.id, prop.key, e.target.value)}
                          className="bare text-[12px] text-tx"
                        />
                      )}
                    </td>
                  );
                }

                if (prop.type === 'time') {
                  return (
                    <td key={prop.id} className="py-2 px-3 text-tx whitespace-nowrap">
                      {readOnly ? (
                        <span>{val || '-'}</span>
                      ) : (
                        <input
                          type="time"
                          value={val || ''}
                          onChange={(e) => handleCellChange(record.id, prop.key, e.target.value)}
                          className="bare text-[12px] text-tx max-w-[90px]"
                        />
                      )}
                    </td>
                  );
                }

                if (prop.type === 'rating') {
                  return (
                    <td key={prop.id} className="py-2 px-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            disabled={readOnly}
                            type="button"
                            onClick={() => handleCellChange(record.id, prop.key, s)}
                            className="p-0.5"
                          >
                            <Star
                              size={13}
                              className={
                                (val || 0) >= s
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-dm/30'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </td>
                  );
                }

                if (prop.type === 'number') {
                  return (
                    <td key={prop.id} className="py-2 px-3 text-tx">
                      {readOnly ? (
                        <span>{val ?? '-'}</span>
                      ) : (
                        <input
                          type="number"
                          value={val ?? ''}
                          onChange={(e) => handleCellChange(record.id, prop.key, Number(e.target.value))}
                          className="bare text-tx max-w-[80px]"
                        />
                      )}
                    </td>
                  );
                }

                if (prop.type === 'checkbox') {
                  return (
                    <td key={prop.id} className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        disabled={readOnly}
                        onChange={(e) => handleCellChange(record.id, prop.key, e.target.checked)}
                        className="rounded border-ln text-nt focus:ring-0 cursor-pointer"
                      />
                    </td>
                  );
                }

                // Default text cell
                return (
                  <td key={prop.id} className="py-2 px-3 text-tx">
                    {readOnly ? (
                      <span>{val || '-'}</span>
                    ) : (
                      <input
                        type="text"
                        value={val || ''}
                        onChange={(e) => handleCellChange(record.id, prop.key, e.target.value)}
                        className="bare text-tx"
                        placeholder="-"
                      />
                    )}
                  </td>
                );
              })}

              {/* Action column */}
              {!readOnly && (
                <td className="py-2 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => removeRecord(table.id, record.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-dm hover:text-bd rounded transition-opacity"
                    title="Hapus baris"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              )}
            </tr>
          ))}

          {/* Inline Add Row */}
          {!readOnly && (
            <tr className="border-b border-transparent hover:bg-hv/30 transition-colors">
              <td className="py-2.5 px-3 text-center text-dm">
                <Plus size={13} className="mx-auto text-dm" />
              </td>
              <td colSpan={properties.length + 1} className="py-2.5 px-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                  placeholder="+ Tambah baris baru (ketik judul lalu tekan Enter)..."
                  className="bare text-[13px] text-dm focus:text-tx placeholder:text-dm/60"
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {records.length === 0 && (
        <div className="py-8 text-center text-dm text-[12px]">
          Tidak ada data yang cocok dengan filter saat ini.
        </div>
      )}

      {/* Delete Property Confirmation Modal (TEST C & REQUIREMENT 5) */}
      {deleteConfirmProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-ln bg-pn p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-tx">
                Hapus properti "{deleteConfirmProp.name}"?
              </h3>
              <button
                type="button"
                onClick={() => setDeleteConfirmProp(null)}
                className="text-dm hover:text-tx p-1"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-dm leading-relaxed">
              Tindakan ini akan menghapus properti <strong>"{deleteConfirmProp.name}"</strong> dari database ini.
              Data baris (record) tidak akan dihapus.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProp(null)}
                className="rounded border border-ln bg-transparent px-3 py-1.5 text-xs text-tx hover:bg-hv"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const propName = deleteConfirmProp.name;
                  removeProperty(table.id, deleteConfirmProp.id);
                  setDeleteConfirmProp(null);
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

      {/* Rename Property Modal */}
      {renamingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-ln bg-pn p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-tx">Ubah Nama Kolom</h3>
            <input
              type="text"
              value={renamingProp.name}
              onChange={(e) => setRenamingProp({ ...renamingProp, name: e.target.value })}
              className="w-full rounded border border-ln bg-bg px-3 py-1.5 text-xs text-tx focus:border-nt outline-hidden"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenamingProp(null)}
                className="rounded border border-ln bg-transparent px-3 py-1.5 text-xs text-tx hover:bg-hv"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (renamingProp.name.trim()) {
                    updateProperty(table.id, renamingProp.id, { name: renamingProp.name.trim() });
                    notify(`Nama kolom diubah menjadi "${renamingProp.name.trim()}"`);
                  }
                  setRenamingProp(null);
                }}
                className="rounded bg-nv px-3 py-1.5 text-xs font-semibold text-nt hover:opacity-90"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

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
