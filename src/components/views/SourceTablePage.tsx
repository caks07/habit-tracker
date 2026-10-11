import { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Clock,
  Database,
  Eye,
  Hash,
  LayoutGrid,
  List,
  Plus,
  Settings2,
  Star,
  Table as TableIcon,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react';
import type { PropertyType, SourceTable, TableProperty, ViewType } from '../../types';
import { useStore } from '../../store';
import { TableView } from './TableView';
import { BoardView } from './BoardView';
import { GalleryView } from './GalleryView';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { Modal } from '../ui';
import { uid } from '../../lib/util';

interface Props {
  tableId: string;
}

export function SourceTablePage({ tableId }: Props) {
  const tables = useStore((s) => s.tables);
  const table = tables[tableId];

  const updateSourceTable = useStore((s) => s.updateSourceTable);
  const addProperty = useStore((s) => s.addProperty);
  const removeProperty = useStore((s) => s.removeProperty);
  const addSection = useStore((s) => s.addSection);
  const setView = useStore((s) => s.setView);
  const notify = useStore((s) => s.notify);

  const [activeViewType, setActiveViewType] = useState<ViewType>('table');
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PropertyType>('text');

  if (!table) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center font-mono">
        <h2 className="text-lg font-bold text-tx">Tabel tidak ditemukan</h2>
        <button
          type="button"
          onClick={() => setView({ name: 'dashboard' })}
          className="mt-4 rounded bg-nv px-4 py-2 text-[13px] text-nt hover:opacity-90"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const handleCreateLinkedView = () => {
    const sectionId = uid();
    addSection({
      id: sectionId,
      type: 'linked-view',
      label: 'linked view',
      title: `${table.name} View`,
      span: 12,
      linkedConfig: {
        id: uid(),
        title: `${table.name} View`,
        sourceTableId: table.id,
        viewType: 'table',
        filters: [],
        sorts: [],
        span: 12,
      },
    });
    notify(`Linked View untuk "${table.name}" berhasil ditambahkan ke Dashboard!`);
    setView({ name: 'dashboard' });
  };

  const handleAddPropertySubmit = () => {
    if (!newPropName.trim()) return;
    const propKey = newPropName.toLowerCase().replace(/\s+/g, '_');
    const newProp: TableProperty = {
      id: uid(),
      key: propKey,
      name: newPropName.trim(),
      type: newPropType,
      width: 130,
      options:
        newPropType === 'select' || newPropType === 'status'
          ? [
              { id: 'opt-1', label: 'Option 1', color: 'blue' },
              { id: 'opt-2', label: 'Option 2', color: 'green' },
            ]
          : undefined,
    };
    addProperty(table.id, newProp);
    setNewPropName('');
    setShowAddPropModal(false);
    notify(`Kolom "${newPropName}" berhasil ditambahkan`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 font-mono">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ln/70 pb-6">
        <div>
          <div className="flex items-center gap-2 text-dm text-[12px] mb-1">
            <Database size={14} />
            <span>SOURCE TABLE (DATABASE MASTER)</span>
          </div>
          <h1 className="text-2xl font-bold text-tx flex items-center gap-2">
            <span>{table.name}</span>
          </h1>
          {table.description && (
            <p className="mt-1 text-[13px] text-dm">{table.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddPropModal(true)}
            className="flex items-center gap-1.5 rounded border border-ln bg-pn px-3 py-1.5 text-[12px] text-tx hover:bg-hv transition-colors"
          >
            <Plus size={13} />
            <span>+ Tambah Kolom/Property</span>
          </button>

          <button
            type="button"
            onClick={handleCreateLinkedView}
            className="flex items-center gap-1.5 rounded bg-nv px-3 py-1.5 text-[12px] font-semibold text-nt hover:opacity-90 transition-opacity"
          >
            <Eye size={13} />
            <span>+ Buat Linked View di Dashboard</span>
          </button>
        </div>
      </div>

      {/* View Switcher Controls */}
      <div className="mt-6 flex items-center justify-between border-b border-ln/50 pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveViewType('table')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] transition-colors ${
              activeViewType === 'table' ? 'bg-nv text-nt font-semibold' : 'text-dm hover:text-tx'
            }`}
          >
            <TableIcon size={13} /> Table
          </button>
          <button
            type="button"
            onClick={() => setActiveViewType('board')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] transition-colors ${
              activeViewType === 'board' ? 'bg-nv text-nt font-semibold' : 'text-dm hover:text-tx'
            }`}
          >
            <LayoutGrid size={13} /> Board
          </button>
          <button
            type="button"
            onClick={() => setActiveViewType('gallery')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] transition-colors ${
              activeViewType === 'gallery' ? 'bg-nv text-nt font-semibold' : 'text-dm hover:text-tx'
            }`}
          >
            <Eye size={13} /> Gallery
          </button>
          <button
            type="button"
            onClick={() => setActiveViewType('list')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] transition-colors ${
              activeViewType === 'list' ? 'bg-nv text-nt font-semibold' : 'text-dm hover:text-tx'
            }`}
          >
            <List size={13} /> List
          </button>
          <button
            type="button"
            onClick={() => setActiveViewType('calendar')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] transition-colors ${
              activeViewType === 'calendar' ? 'bg-nv text-nt font-semibold' : 'text-dm hover:text-tx'
            }`}
          >
            <Calendar size={13} /> Calendar
          </button>
        </div>

        <span className="text-[12px] text-dm">
          Total: {table.records.length} baris data
        </span>
      </div>

      {/* Table Body Content */}
      <div className="mt-6 rounded-lg border border-ln/70 bg-pn/20 p-4">
        {activeViewType === 'table' && <TableView table={table} records={table.records} />}
        {activeViewType === 'board' && <BoardView table={table} records={table.records} />}
        {activeViewType === 'gallery' && <GalleryView table={table} records={table.records} />}
        {activeViewType === 'list' && <ListView table={table} records={table.records} />}
        {activeViewType === 'calendar' && <CalendarView table={table} records={table.records} />}
      </div>

      {/* Add Property Modal */}
      {showAddPropModal && (
        <Modal
          label="Tambah Kolom"
          onClose={() => setShowAddPropModal(false)}
          width="max-w-md"
        >
          <div className="p-5 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-ln/60 pb-3">
              <h3 className="font-bold text-tx text-[14px]">Tambah Kolom Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddPropModal(false)}
                className="text-dm hover:text-tx text-[12px]"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] text-dm mb-1">Nama Kolom</label>
                <input
                  type="text"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  placeholder="Contoh: Lokasi, Biaya, Dosen..."
                  className="w-full rounded border border-ln bg-bg px-3 py-1.5 text-[13px] text-tx"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[12px] text-dm mb-1">Tipe Data</label>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[
                    { type: 'text', label: 'Teks', icon: List },
                    { type: 'select', label: 'Select (Pilihan)', icon: TagIcon },
                    { type: 'date', label: 'Tanggal', icon: Calendar },
                    { type: 'time', label: 'Waktu', icon: Clock },
                    { type: 'number', label: 'Angka', icon: Hash },
                    { type: 'rating', label: 'Rating Bintang', icon: Star },
                    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setNewPropType(item.type as PropertyType)}
                      className={`flex items-center gap-2 rounded border p-2 text-left transition-colors ${
                        newPropType === item.type
                          ? 'border-nt bg-nv text-nt font-semibold'
                          : 'border-ln bg-bg text-tx hover:bg-hv'
                      }`}
                    >
                      <item.icon size={13} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ln/60">
              <button
                type="button"
                onClick={() => setShowAddPropModal(false)}
                className="rounded px-3 py-1.5 text-[12px] text-dm hover:text-tx"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddPropertySubmit}
                className="rounded bg-nv px-4 py-1.5 text-[12px] font-semibold text-nt hover:opacity-90"
              >
                Simpan Kolom
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
