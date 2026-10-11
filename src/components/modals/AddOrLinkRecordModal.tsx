import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Database,
  ExternalLink,
  Flame,
  Hash,
  Link2,
  Plus,
  Search,
  Tag as TagIcon,
  X,
} from 'lucide-react';
import type { PropertyType, SourceTable, TableProperty, TableRecord } from '../../types';
import { useStore } from '../../store';
import { Tag } from '../ui';
import { getSourceLabel } from '../../lib/normalization';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  availableDatabaseIds?: string[];
  defaultDatabaseId?: string;
  targetGroup?: { key: string; value: string } | null;
  onLinkExisting?: (sourceDbId: string, sourceRecordId: string, record: TableRecord) => void;
  onCreateNew?: (sourceDbId: string, newRecordId: string, values: Record<string, any>) => void;
}

export function AddOrLinkRecordModal({
  isOpen,
  onClose,
  availableDatabaseIds,
  defaultDatabaseId,
  targetGroup,
  onLinkExisting,
  onCreateNew,
}: Props) {
  const tables = useStore((s) => s.tables);
  const addRecord = useStore((s) => s.addRecord);
  const updateRecord = useStore((s) => s.updateRecord);
  const notify = useStore((s) => s.notify);

  // Available databases
  const allDbKeys = Object.keys(tables);
  const dbList = useMemo(() => {
    if (availableDatabaseIds && availableDatabaseIds.length > 0) {
      return availableDatabaseIds.filter((id) => tables[id]);
    }
    return allDbKeys;
  }, [availableDatabaseIds, allDbKeys, tables]);

  // Active tab: 'link' | 'create'
  const [activeTab, setActiveTab] = useState<'link' | 'create'>('link');

  // Selected database
  const initialDb = defaultDatabaseId && tables[defaultDatabaseId] ? defaultDatabaseId : dbList[0] || 'tasks';
  const [selectedDbId, setSelectedDbId] = useState<string>(initialDb);

  // Search input for Link Existing
  const [searchQuery, setSearchQuery] = useState('');

  // Form values for Create New
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const selectedTable: SourceTable | undefined = tables[selectedDbId];

  // Initialize form default values when database or group changes
  React.useEffect(() => {
    if (!selectedTable) return;
    const initial: Record<string, any> = {};
    const today = new Date().toISOString().split('T')[0];

    selectedTable.properties.forEach((p) => {
      if (p.type === 'status') {
        initial[p.key] = p.options?.[0]?.label || 'Active';
      } else if (p.type === 'date') {
        initial[p.key] = today;
      } else if (p.type === 'time') {
        initial[p.key] = '09:00';
      } else if (p.type === 'checkbox') {
        initial[p.key] = false;
      } else if (p.type === 'number') {
        initial[p.key] = 0;
      } else if (p.type === 'select' && p.options && p.options.length > 0) {
        initial[p.key] = p.options[0].label;
      }
    });

    // Apply target group context (e.g. day = 'Selasa')
    if (targetGroup) {
      initial[targetGroup.key] = targetGroup.value;
      if (targetGroup.key === 'day') {
        initial.day = targetGroup.value;
      } else if (targetGroup.key === 'status') {
        initial.status = targetGroup.value;
      }
    }

    setFormValues(initial);
  }, [selectedDbId, targetGroup, selectedTable]);

  if (!isOpen) return null;

  // Filtered records for Link Existing
  const filteredRecords = (selectedTable?.records || []).filter((rec) => {
    if (!searchQuery.trim()) return true;
    const titleProp = selectedTable?.properties.find((p) => p.type === 'title') || selectedTable?.properties[0];
    const titleVal = String(rec.values[titleProp?.key || 'title'] || '');
    const query = searchQuery.toLowerCase();
    const matchesTitle = titleVal.toLowerCase().includes(query);
    const matchesCategory = String(rec.values.category || '').toLowerCase().includes(query);
    return matchesTitle || matchesCategory;
  });

  const titleProp = selectedTable?.properties.find((p) => p.type === 'title') || selectedTable?.properties[0];

  // MODE 1: Handle Link Existing Record
  const handleSelectExisting = (record: TableRecord) => {
    if (!selectedTable) return;
    const recTitle = record.values[titleProp?.key || 'title'] || 'Record';

    // If targetGroup exists (e.g. day = 'Selasa' or status = 'In progress'), update the original record to reflect this view context!
    if (targetGroup) {
      updateRecord(selectedTable.id, record.id, {
        [targetGroup.key]: targetGroup.value,
        ...(targetGroup.key === 'day' ? { day: targetGroup.value } : {}),
        ...(targetGroup.key === 'status' ? { status: targetGroup.value } : {}),
      });
    }

    if (onLinkExisting) {
      onLinkExisting(selectedTable.id, record.id, record);
    }

    notify(`Record "${recTitle}" (${selectedTable.name}) berhasil ditautkan`);
    onClose();
  };

  // MODE 2: Handle Create New Record
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    const titleKey = titleProp?.key || 'title';
    const titleVal = formValues[titleKey];
    if (!titleVal || !String(titleVal).trim()) {
      notify('Judul record tidak boleh kosong');
      return;
    }

    const newId = addRecord(selectedTable.id, formValues);
    if (onCreateNew) {
      onCreateNew(selectedTable.id, newId, formValues);
    }

    notify(`Record baru dibuat di database master "${selectedTable.name}"`);
    onClose();
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
      case 'checkbox':
        return <CheckSquare size={13} className="text-dm" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs font-mono">
      <div className="w-full max-w-xl rounded-lg border border-ln bg-pn shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header with Mode Switcher */}
        <div className="border-b border-ln/70 p-4 pb-0 bg-pn/90">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Database size={15} className="text-nt" />
              <h2 className="text-sm font-bold text-tx">
                {targetGroup
                  ? `Tambah ke ${targetGroup.value}`
                  : 'Tambah / Tautkan Record'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-dm hover:text-tx hover:bg-hv transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Mode Tabs (Requirement 1) */}
          <div className="flex items-center gap-2 border-b border-transparent">
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'link'
                  ? 'border-nt text-nt font-semibold'
                  : 'border-transparent text-dm hover:text-tx'
              }`}
            >
              <Link2 size={13} />
              <span>Link Existing Record</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === 'create'
                  ? 'border-nt text-nt font-semibold'
                  : 'border-transparent text-dm hover:text-tx'
              }`}
            >
              <Plus size={13} />
              <span>Create New Record</span>
            </button>
          </div>
        </div>

        {/* Database Selector Row */}
        <div className="p-4 border-b border-ln/40 bg-hv/20">
          <label className="block text-[11px] font-semibold text-dm uppercase tracking-wider mb-2">
            Pilih Database Asal (Source Database):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {dbList.map((dbId) => {
              const tbl = tables[dbId];
              const isSelected = selectedDbId === dbId;
              return (
                <button
                  key={dbId}
                  type="button"
                  onClick={() => setSelectedDbId(dbId)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-nv text-nt font-semibold border border-nv/80'
                      : 'bg-pn/80 text-dm border border-ln/70 hover:text-tx hover:border-ln'
                  }`}
                >
                  <span>{tbl?.name || getSourceLabel(dbId)}</span>
                  <span className="text-[10px] text-dm/60">({tbl?.records.length || 0})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body content based on Active Tab */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* =============================================================== */}
          {/* TAB 1: LINK EXISTING RECORD                                     */}
          {/* =============================================================== */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-dm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari record di ${selectedTable?.name || 'database'}...`}
                  className="w-full rounded border border-ln bg-bg pl-9 pr-3 py-2 text-xs text-tx placeholder:text-dm/60 focus:border-nt outline-hidden"
                  autoFocus
                />
              </div>

              <div className="text-[11px] text-dm">
                Pilih record yang sudah ada di database <strong>{selectedTable?.name}</strong>.
                Sistem akan menghubungkan record tersebut tanpa menduplikasi data.
              </div>

              {/* List of existing records */}
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredRecords.map((rec) => {
                  const recTitle = rec.values[titleProp?.key || 'title'] || 'Tanpa Judul';
                  const catVal = rec.values.category || rec.values.type;
                  const statusVal = rec.values.status;
                  const timeVal = rec.values.time || rec.values.startTime;
                  const streakVal = rec.values.streak;

                  return (
                    <div
                      key={rec.id}
                      onClick={() => handleSelectExisting(rec)}
                      className="group flex items-center justify-between p-2.5 rounded border border-ln/60 bg-bg/50 hover:bg-hv/60 hover:border-nt cursor-pointer transition-all"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-tx text-xs group-hover:text-nt transition-colors truncate">
                          {recTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-dm">
                          {catVal && (
                            <span className="bg-pn px-1.5 py-0.5 rounded border border-ln/60">
                              {catVal}
                            </span>
                          )}
                          {timeVal && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {timeVal}
                            </span>
                          )}
                          {typeof streakVal === 'number' && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Flame size={10} />
                              {streakVal} hari
                            </span>
                          )}
                          <span className="text-dm/60">ID: {rec.id}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {statusVal && (
                          <Tag color="purple" className="text-[10px] py-0 px-1.5">
                            {statusVal}
                          </Tag>
                        )}
                        <span className="opacity-0 group-hover:opacity-100 text-[11px] text-nt font-semibold transition-opacity">
                          Tautkan →
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredRecords.length === 0 && (
                  <div className="py-8 text-center text-xs text-dm border border-dashed border-ln rounded">
                    Tidak ada record yang cocok dengan pencarian di "{selectedTable?.name}".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: CREATE NEW RECORD IN SOURCE DATABASE SCHEMA             */}
          {/* =============================================================== */}
          {activeTab === 'create' && selectedTable && (
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="text-[11px] text-dm">
                Membuat record baru di database master <strong>{selectedTable.name}</strong> dengan schema aslinya:
              </div>

              {selectedTable.properties.map((prop) => {
                const val = formValues[prop.key];

                if (prop.type === 'title') {
                  return (
                    <div key={prop.id} className="space-y-1">
                      <label className="block text-[11px] font-semibold text-dm">
                        {prop.name} *
                      </label>
                      <input
                        type="text"
                        value={val || ''}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [prop.key]: e.target.value })
                        }
                        placeholder={`Ketik ${prop.name.toLowerCase()}...`}
                        className="w-full rounded border border-ln bg-bg px-3 py-1.5 text-xs text-tx focus:border-nt outline-hidden"
                        autoFocus
                        required
                      />
                    </div>
                  );
                }

                if (prop.type === 'select' || prop.type === 'status') {
                  return (
                    <div key={prop.id} className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-dm">
                        {getPropIcon(prop.type)}
                        <span>{prop.name}</span>
                      </label>
                      <select
                        value={val || ''}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [prop.key]: e.target.value })
                        }
                        className="w-full rounded border border-ln bg-bg px-2.5 py-1.5 text-xs text-tx focus:border-nt outline-hidden"
                      >
                        {prop.options?.map((opt) => (
                          <option key={opt.id} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (prop.type === 'date') {
                  return (
                    <div key={prop.id} className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-dm">
                        <Calendar size={12} />
                        <span>{prop.name}</span>
                      </label>
                      <input
                        type="date"
                        value={val || ''}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [prop.key]: e.target.value })
                        }
                        className="w-full rounded border border-ln bg-bg px-2.5 py-1.5 text-xs text-tx focus:border-nt outline-hidden"
                      />
                    </div>
                  );
                }

                if (prop.type === 'time') {
                  return (
                    <div key={prop.id} className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-dm">
                        <Clock size={12} />
                        <span>{prop.name}</span>
                      </label>
                      <input
                        type="time"
                        value={val || ''}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [prop.key]: e.target.value })
                        }
                        className="w-full rounded border border-ln bg-bg px-2.5 py-1.5 text-xs text-tx focus:border-nt outline-hidden"
                      />
                    </div>
                  );
                }

                if (prop.type === 'number') {
                  return (
                    <div key={prop.id} className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-dm">
                        <Hash size={12} />
                        <span>{prop.name}</span>
                      </label>
                      <input
                        type="number"
                        value={val ?? 0}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [prop.key]: Number(e.target.value) })
                        }
                        className="w-full rounded border border-ln bg-bg px-2.5 py-1.5 text-xs text-tx focus:border-nt outline-hidden"
                      />
                    </div>
                  );
                }

                if (prop.type === 'checkbox') {
                  return (
                    <div key={prop.id} className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) =>
                          setFormValues({ ...formValues, [prop.key]: e.target.checked })
                        }
                        className="rounded border-ln text-nt"
                      />
                      <label className="text-[11px] font-semibold text-dm">{prop.name}</label>
                    </div>
                  );
                }

                // Default text / long-text
                return (
                  <div key={prop.id} className="space-y-1">
                    <label className="block text-[11px] font-semibold text-dm">{prop.name}</label>
                    <input
                      type="text"
                      value={val || ''}
                      onChange={(e) =>
                        setFormValues({ ...formValues, [prop.key]: e.target.value })
                      }
                      placeholder={`Isi ${prop.name.toLowerCase()}...`}
                      className="w-full rounded border border-ln bg-bg px-3 py-1.5 text-xs text-tx focus:border-nt outline-hidden"
                    />
                  </div>
                );
              })}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ln/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border border-ln bg-transparent px-3 py-1.5 text-xs text-dm hover:text-tx hover:bg-hv"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded bg-nv px-4 py-1.5 text-xs font-semibold text-nt hover:opacity-90 flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>Buat Record di {selectedTable.name}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
