import { useState, useRef, type MouseEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Copy,
  Database,
  Eye,
  GripVertical,
  LayoutGrid,
  List,
  MoreHorizontal,
  RefreshCw,
  Table as TableIcon,
  Trash2,
  Maximize2,
  MoveHorizontal,
} from 'lucide-react';
import type { DashboardBlock, ViewType } from '../types';
import { useStore } from '../store';
import { Popover, MenuItem } from './ui';
import { SectionRenderer } from './SectionRenderer';
import { DividerSection } from './sections/MediaSections';

interface Props {
  section: DashboardBlock;
}

export function SectionFrame({ section }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const tables = useStore((s) => s.tables);
  const updateSection = useStore((s) => s.updateSection);
  const removeSection = useStore((s) => s.removeSection);
  const duplicateSection = useStore((s) => s.duplicateSection);
  const updateLinkedConfig = useStore((s) => s.updateLinkedConfig);
  const updateBlockLayout = useStore((s) => s.updateBlockLayout);
  const restartSection = useStore((s) => s.restartSection);
  const ask = useStore((s) => s.ask);

  const [menuOpen, setMenuOpen] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeIndicator, setResizeIndicator] = useState<string | null>(null);

  // Layout span & height
  const currentSpan = section.layout?.w || section.span || 12;
  const currentHeight = section.layout?.h || 4; // row height units

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: resizing ? 'none' : transition,
    '--span': currentSpan,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.6 : 1,
  } as React.CSSProperties;

  const isLinked =
    (section.type === 'linked_database' ||
      section.type === 'linked_multi_database' ||
      section.type === 'linked-view') &&
    Boolean(
      section.linkedConfig ||
        (section.sourceDatabaseId && section.view) ||
        (section.sourceDatabases && section.sourceDatabases.length > 0)
    );
  const multiDbCount =
    section.sourceDatabases?.length || section.linkedConfig?.sourceDatabases?.length || 0;
  const linkedTableId = section.sourceDatabaseId || section.linkedConfig?.sourceTableId;
  const linkedTable = linkedTableId ? tables[linkedTableId] : null;

  // Handle span change (PART 8)
  const setSpan = (span: number) => {
    updateBlockLayout(section.id, { w: span });
    updateSection(section.id, { span });
    if (section.linkedConfig) {
      updateLinkedConfig(section.id, { span });
    }
    setMenuOpen(false);
  };

  // Handle view type change for linked view
  const setViewType = (viewType: ViewType) => {
    if (section.linkedConfig) {
      updateLinkedConfig(section.id, { viewType });
    }
    if (section.view) {
      updateSection(section.id, {
        view: { ...section.view, type: viewType },
      });
    }
  };

  // Change source database for linked view
  const changeSourceTable = (sourceTableId: string) => {
    const targetTable = tables[sourceTableId];
    if (!targetTable) return;
    updateLinkedConfig(section.id, {
      sourceTableId,
      title: `${targetTable.name} View`,
      filters: [],
      sorts: [],
    });
    updateSection(section.id, {
      sourceDatabaseId: sourceTableId,
      title: `${targetTable.name} View`,
    });
    setMenuOpen(false);
  };

  const handleRename = () => {
    const next = prompt('Ubah judul section:', section.title || '');
    if (next !== null && next.trim()) {
      updateSection(section.id, { title: next.trim() });
    }
    setMenuOpen(false);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    if (isLinked) {
      ask({
        title: `Hapus Linked View "${section.title}"?`,
        body: 'Tindakan ini hanya menghapus view dari dashboard. Data asli di database tetap aman.',
        confirmLabel: 'Hapus View',
        danger: true,
        onConfirm: () => removeSection(section.id),
      });
    } else {
      ask({
        title: `Hapus section "${section.title || section.label}"?`,
        body: 'Section ini akan dihapus dari dashboard.',
        confirmLabel: 'Hapus',
        danger: true,
        onConfirm: () => removeSection(section.id),
      });
    }
  };

  const handleRestart = () => {
    setMenuOpen(false);
    ask({
      title: `Restart section "${section.title || section.label}"?`,
      body: 'Snapshot kondisi saat ini akan disimpan ke History, lalu data progres section ini di-reset untuk siklus baru.',
      confirmLabel: '↻ Simpan & Restart',
      onConfirm: () => restartSection(section.id),
    });
  };

  // Helper setter for section children
  const setSectionPatch = (patch: Partial<DashboardBlock>) => updateSection(section.id, patch);

  // Interactive Edge Drag Resizing (PART 8 & 9)
  const handleResizeWidthStart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const startX = e.clientX;
    const startSpan = currentSpan;

    const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Step column per ~70px of drag
      const deltaCols = Math.round(deltaX / 70);
      const allowedSpans = [3, 4, 6, 8, 9, 12];
      let targetSpan = startSpan + deltaCols;
      targetSpan = Math.max(3, Math.min(12, targetSpan));
      // Snap to closest allowed span
      const closest = allowedSpans.reduce((prev, curr) =>
        Math.abs(curr - targetSpan) < Math.abs(prev - targetSpan) ? curr : prev
      );

      setResizeIndicator(`${closest} Kolom (Grid 12)`);
      updateBlockLayout(section.id, { w: closest });
      updateSection(section.id, { span: closest });
    };

    const onMouseUp = () => {
      setResizing(false);
      setResizeIndicator(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Minimal divider rendering
  if (section.type === 'divider' || section.contentSubtype === 'divider') {
    return (
      <div ref={setNodeRef} style={style} className="cell group relative my-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-dm/40 hover:text-dm rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Geser posisi divider"
          >
            <GripVertical size={13} />
          </button>
          <div className="flex-1">
            <DividerSection section={section} readOnly={false} set={setSectionPatch} />
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 text-dm/40 hover:text-bd opacity-0 group-hover:opacity-100 transition-opacity"
            title="Hapus divider"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cell group/canvas-block relative flex flex-col font-mono transition-all ${
        isDragging ? 'ring-2 ring-nt ring-offset-2 ring-offset-bg rounded-lg' : ''
      }`}
    >
      {/* ============================================================== */}
      {/* LIGHTWEIGHT EDITORIAL SECTION HEADER (PART 10 & 11)            */}
      {/* No heavy solid colored header, no cardboard boxes              */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between py-1.5 px-0.5 border-b border-ln/40 mb-3 select-none group/hdr">
        {/* Left: Drag affordance ⠿ + Source Identity / Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 text-dm/30 hover:text-tx hover:bg-hv/60 rounded opacity-0 group-hover/canvas-block:opacity-100 transition-opacity"
            title="Geser untuk mengatur posisi di Canvas"
          >
            <GripVertical size={14} />
          </button>

          <div className="flex items-center gap-2 truncate">
            {/* Database or Block Source Identity Badge */}
            {isLinked && multiDbCount > 1 ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-nt bg-nv/30 px-2 py-0.5 rounded border border-nv/50">
                <Database size={11} className="text-nt" />
                <span>Linked → Multi-Source ({multiDbCount} DB)</span>
              </span>
            ) : isLinked && linkedTable ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-nt bg-nv/30 px-2 py-0.5 rounded border border-nv/50">
                <Database size={11} className="text-nt" />
                <span>Linked → {linkedTable.name}</span>
              </span>
            ) : section.type === 'record_card' ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-nt bg-nv/30 px-2 py-0.5 rounded border border-nv/50">
                <span>Record Card</span>
              </span>
            ) : section.label ? (
              <span className="text-[11px] font-bold tracking-wider text-dm uppercase">
                {section.label}
              </span>
            ) : null}

            {/* Block Title */}
            {section.title && (
              <span className="font-bold text-tx text-[14px] tracking-tight truncate">
                {section.title}
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick View Switchers (if Linked DB) & Action Menu */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick View switcher buttons if Linked View */}
          {isLinked && (
            <div className="hidden sm:flex items-center gap-0.5 bg-hv/50 p-0.5 rounded text-dm">
              <button
                type="button"
                onClick={() => setViewType('table')}
                className={`p-1 rounded transition-colors ${
                  (section.linkedConfig?.viewType || section.view?.type) === 'table'
                    ? 'bg-nt text-nv font-bold shadow-2xs'
                    : 'hover:text-tx'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon size={12} />
              </button>
              <button
                type="button"
                onClick={() => setViewType('board')}
                className={`p-1 rounded transition-colors ${
                  (section.linkedConfig?.viewType || section.view?.type) === 'board'
                    ? 'bg-nt text-nv font-bold shadow-2xs'
                    : 'hover:text-tx'
                }`}
                title="Tampilan Board Kanban"
              >
                <LayoutGrid size={12} />
              </button>
              <button
                type="button"
                onClick={() => setViewType('gallery')}
                className={`p-1 rounded transition-colors ${
                  (section.linkedConfig?.viewType || section.view?.type) === 'gallery'
                    ? 'bg-nt text-nv font-bold shadow-2xs'
                    : 'hover:text-tx'
                }`}
                title="Tampilan Gallery Kartu"
              >
                <Eye size={12} />
              </button>
              <button
                type="button"
                onClick={() => setViewType('list')}
                className={`p-1 rounded transition-colors ${
                  (section.linkedConfig?.viewType || section.view?.type) === 'list'
                    ? 'bg-nt text-nv font-bold shadow-2xs'
                    : 'hover:text-tx'
                }`}
                title="Tampilan List"
              >
                <List size={12} />
              </button>
            </div>
          )}

          {/* Quick Span Selector on Header */}
          <div className="hidden md:flex items-center gap-0.5 text-[10px] text-dm opacity-0 group-hover/canvas-block:opacity-100 transition-opacity">
            {[4, 6, 8, 12].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpan(s)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  currentSpan === s ? 'bg-nv text-nt font-bold' : 'hover:bg-hv text-dm'
                }`}
                title={`Atur lebar ${s} kolom`}
              >
                {s}c
              </button>
            ))}
          </div>

          {/* Action Menu (···) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-dm hover:text-tx hover:bg-hv rounded transition-colors"
              title="Menu Blok"
            >
              <MoreHorizontal size={15} />
            </button>

            <Popover open={menuOpen} onClose={() => setMenuOpen(false)}>
              <div className="px-2 py-1 text-[11px] font-semibold text-dm uppercase tracking-wider">
                {isLinked ? 'Konfigurasi View' : 'Konfigurasi Blok'}
              </div>

              <MenuItem onClick={handleRename}>
                Ubah Judul ({section.title || section.label || 'Blok'})
              </MenuItem>

              {/* View Type Options if Linked */}
              {isLinked && (
                <>
                  <div className="my-1 border-t border-ln/50" />
                  <div className="px-2 py-1 text-[10px] text-dm uppercase">Pilih Tampilan:</div>
                  <MenuItem onClick={() => { setViewType('table'); setMenuOpen(false); }}>
                    Tampilan Table
                  </MenuItem>
                  <MenuItem onClick={() => { setViewType('board'); setMenuOpen(false); }}>
                    Tampilan Board (Kanban)
                  </MenuItem>
                  <MenuItem onClick={() => { setViewType('gallery'); setMenuOpen(false); }}>
                    Tampilan Gallery Kartu
                  </MenuItem>
                  <MenuItem onClick={() => { setViewType('list'); setMenuOpen(false); }}>
                    Tampilan List
                  </MenuItem>
                  <MenuItem onClick={() => { setViewType('calendar'); setMenuOpen(false); }}>
                    Tampilan Calendar
                  </MenuItem>

                  {/* Change Source Database */}
                  <div className="my-1 border-t border-ln/50" />
                  <div className="px-2 py-1 text-[10px] text-dm uppercase">Ganti Sumber Database:</div>
                  {Object.values(tables).map((t) => (
                    <MenuItem
                      key={t.id}
                      icon={Database}
                      onClick={() => changeSourceTable(t.id)}
                    >
                      {t.name} {linkedTableId === t.id ? '✓' : ''}
                    </MenuItem>
                  ))}
                </>
              )}

              {/* Grid Column Span Selector */}
              <div className="my-1 border-t border-ln/50" />
              <div className="px-2 py-1 text-[10px] text-dm uppercase">Lebar Kolom Canvas:</div>
              <div className="grid grid-cols-6 gap-1 px-2 py-1">
                {[3, 4, 6, 8, 9, 12].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpan(s)}
                    className={`rounded py-1 text-center text-[11px] font-mono transition-colors ${
                      currentSpan === s
                        ? 'bg-nt text-nv font-bold'
                        : 'bg-hv hover:bg-nv/30 text-tx'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="my-1 border-t border-ln/50" />
              <MenuItem
                icon={Copy}
                onClick={() => {
                  duplicateSection(section.id);
                  setMenuOpen(false);
                }}
              >
                Duplikasi Blok
              </MenuItem>

              <MenuItem icon={RefreshCw} onClick={handleRestart}>
                ↻ Simpan Snapshot & Restart
              </MenuItem>

              <MenuItem icon={Trash2} danger onClick={handleDelete}>
                {isLinked ? 'Hapus View' : 'Hapus Blok'}
              </MenuItem>
            </Popover>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION CONTENT BODY (CANVAS NATURAL PRESENTATION)            */}
      {/* ============================================================== */}
      <div className="flex-1 min-w-0">
        <SectionRenderer section={section} readOnly={false} set={setSectionPatch} />
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE RESIZE AFFORDANCE (PART 8 & 9)                     */}
      {/* Subtle edge handles with minimal size badge feedback           */}
      {/* ============================================================== */}
      <div
        onMouseDown={handleResizeWidthStart}
        className="absolute top-0 right-[-10px] bottom-0 w-3 cursor-col-resize opacity-0 group-hover/canvas-block:opacity-100 flex items-center justify-center transition-opacity z-20"
        title="Tarik horizontal untuk mengubah lebar kolom"
      >
        <div className="h-10 w-1 rounded-full bg-nt/40 hover:bg-nt transition-colors" />
      </div>

      {/* Resize Indicator Feedback Badge */}
      {resizeIndicator && (
        <div className="absolute bottom-2 right-2 bg-nv text-nt text-[11px] font-bold px-2 py-1 rounded shadow-md border border-nt z-40 animate-in fade-in duration-100">
          {resizeIndicator}
        </div>
      )}
    </div>
  );
}
