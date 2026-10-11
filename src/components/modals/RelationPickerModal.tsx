import { useState } from 'react';
import { Check, Database, Plus, Search, X } from 'lucide-react';
import type { SourceTable, TableRecord } from '../../types';
import { useStore } from '../../store';
import { Tag } from '../ui';

interface Props {
  title: string;
  targetTableId: string;
  selectedIds: string[];
  onSelect: (recordId: string) => void;
  onDeselect: (recordId: string) => void;
  onClose: () => void;
}

export function RelationPickerModal({
  title,
  targetTableId,
  selectedIds,
  onSelect,
  onDeselect,
  onClose,
}: Props) {
  const tables = useStore((s) => s.tables);
  const targetTable = tables[targetTableId];
  const [search, setSearch] = useState('');

  if (!targetTable) return null;

  const titleProp = targetTable.properties.find((p) => p.type === 'title') || targetTable.properties[0];

  const filteredRecords = targetTable.records.filter((rec) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const titleVal = String(rec.values[titleProp?.key || 'title'] || '').toLowerCase();
    const catVal = String(rec.values.category || '').toLowerCase();
    return titleVal.includes(q) || catVal.includes(q);
  });

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-mono"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-ln bg-pn shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ln/70 px-5 py-3.5 bg-pn/90 select-none">
          <div className="flex items-center gap-2 text-tx">
            <Database size={15} className="text-nt" />
            <h3 className="text-sm font-bold tracking-tight">{title}</h3>
            <span className="text-[11px] text-dm bg-hv px-2 py-0.5 rounded">
              {targetTable.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-dm hover:bg-hv hover:text-tx transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-ln/60 bg-bg/50">
          <div className="flex items-center gap-2 rounded border border-ln bg-bg px-3 py-2 text-[13px]">
            <Search size={14} className="text-dm shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari data dari ${targetTable.name}...`}
              className="bare"
              autoFocus
            />
          </div>
        </div>

        {/* Record list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredRecords.map((rec) => {
            const isSelected = selectedIds.includes(rec.id);
            const titleVal = rec.values[titleProp?.key || 'title'] || 'Tanpa Judul';
            const catVal = rec.values.category;
            const extraInfo = rec.values.startTime || rec.values.day || rec.values.dueDate;

            return (
              <div
                key={rec.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isSelected) {
                    onDeselect(rec.id);
                  } else {
                    onSelect(rec.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isSelected) onDeselect(rec.id);
                    else onSelect(rec.id);
                  }
                }}
                className={`flex items-center justify-between gap-3 p-2.5 rounded border transition-all cursor-pointer text-left select-none ${
                  isSelected
                    ? 'border-nt bg-nv/30 text-tx'
                    : 'border-transparent hover:border-ln hover:bg-hv/50 text-tx'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-nt bg-nt text-nv' : 'border-ln bg-bg'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[13px] truncate">{titleVal}</div>
                    {(catVal || extraInfo) && (
                      <div className="flex items-center gap-2 text-[11px] text-dm pt-0.5">
                        {catVal && <span>{catVal}</span>}
                        {catVal && extraInfo && <span>•</span>}
                        {extraInfo && <span>{extraInfo}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <span className="text-[11px] font-semibold text-nt shrink-0">
                    Terhubung
                  </span>
                )}
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="py-8 text-center text-[12px] text-dm">
              Tidak ada data yang cocok dengan "{search}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-ln/70 px-4 py-3 bg-pn/90 text-[12px]">
          <span className="text-dm">
            {selectedIds.length} item terhubung (ID stabil)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-nv px-3 py-1.5 text-nt font-semibold hover:opacity-90 transition-opacity"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
