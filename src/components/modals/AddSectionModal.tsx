import { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Columns,
  Database,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Film,
  Heading,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  List,
  Minus,
  Plus,
  Quote,
  Repeat,
  Search,
  Sparkles,
  Table as TableIcon,
  Target,
  Type,
  X,
  Zap,
} from 'lucide-react';
import type { DashboardBlock, FilterRule, ViewType } from '../../types';
import { useStore } from '../../store';
import { Modal, Tag } from '../ui';
import { uid } from '../../lib/util';

export function AddSectionModal() {
  const addOpen = useStore((s) => s.addOpen);
  const setAddOpen = useStore((s) => s.setAddOpen);
  const tables = useStore((s) => s.tables);
  const addSection = useStore((s) => s.addSection);
  const addSourceTable = useStore((s) => s.addSourceTable);
  const notify = useStore((s) => s.notify);

  // Workflow modes
  const [mode, setMode] = useState<
    | 'menu' // Top level: CONTENT vs DATABASE
    | 'linked_db_step1' // Select Database
    | 'linked_db_step2' // Select View & Configure
    | 'record_card_step1' // Select Database
    | 'record_card_step2' // Select Record
    | 'new_table' // Create brand new source table
  >('menu');

  // Form states
  const [selectedDbId, setSelectedDbId] = useState<string>('schedule');
  const [selectedDbIds, setSelectedDbIds] = useState<string[]>(['schedule']);
  const [selectedViewType, setSelectedViewType] = useState<ViewType>('table');
  const [selectedFilterPreset, setSelectedFilterPreset] = useState<
    'all' | 'today' | 'this_week' | 'active_only' | 'incomplete'
  >('all');
  const [selectedSpan, setSelectedSpan] = useState<number>(8);
  const [customTitle, setCustomTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Record card states
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');

  if (!addOpen) return null;

  const handleClose = () => {
    setMode('menu');
    setSearchQuery('');
    setCustomTitle('');
    setSelectedDbIds(['schedule']);
    setAddOpen(false);
  };

  const toggleDbSelection = (dbId: string) => {
    if (selectedDbIds.includes(dbId)) {
      if (selectedDbIds.length === 1) return; // Keep at least one
      setSelectedDbIds(selectedDbIds.filter((id) => id !== dbId));
    } else {
      setSelectedDbIds([...selectedDbIds, dbId]);
    }
  };

  const selectMultiSourcePreset = () => {
    const defaultMulti = ['tasks', 'activities', 'habits', 'schedule', 'entertainment', 'assignments'].filter(
      (id) => tables[id]
    );
    setSelectedDbIds(defaultMulti);
    setSelectedViewType('board');
    setCustomTitle('To Do List Harian');
    setSelectedSpan(12);
    setMode('linked_db_step2');
  };

  const getTableIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'activities':
        return <Activity size={15} />;
      case 'schedule':
        return <Calendar size={15} />;
      case 'tasks':
        return <CheckSquare size={15} />;
      case 'assignments':
        return <BookOpen size={15} />;
      case 'habits':
        return <Repeat size={15} />;
      case 'entertainment':
        return <Film size={15} />;
      case 'goals':
        return <Target size={15} />;
      case 'notes':
        return <FileText size={15} />;
      default:
        return <Database size={15} />;
    }
  };

  // Add Linked Database block (Single or Multi-Source)
  const handleConfirmLinkedDb = () => {
    const isMulti = selectedDbIds.length > 1;
    const primaryDbId = selectedDbIds[0] || 'schedule';
    const table = tables[primaryDbId];
    if (!table) return;

    const filters: FilterRule[] = [];
    if (selectedFilterPreset === 'today') {
      filters.push({ id: uid(), property: 'date', operator: 'is_today' });
    } else if (selectedFilterPreset === 'this_week') {
      filters.push({ id: uid(), property: 'date', operator: 'is_this_week' });
    } else if (selectedFilterPreset === 'incomplete') {
      filters.push({ id: uid(), property: 'status', operator: 'is_not_checked' });
    } else if (selectedFilterPreset === 'active_only') {
      filters.push({ id: uid(), property: 'status', operator: 'equals', value: 'Active' });
    }

    const defaultTitle = isMulti
      ? 'To Do List Harian (Multi-Source)'
      : `${selectedFilterPreset === 'today' ? "Today's " : selectedFilterPreset === 'this_week' ? "Weekly " : ''}${table.name}`;
    const title = customTitle.trim() || defaultTitle;

    const newBlock: DashboardBlock = {
      id: uid(),
      dashboardId: 'dashboard_main',
      type: isMulti ? 'linked_multi_database' : 'linked_database',
      sourceDatabaseId: primaryDbId,
      sourceDatabases: selectedDbIds,
      sourceRecordId: null,
      title,
      label: isMulti ? 'multi-source view' : 'linked view',
      span: selectedSpan,
      layout: { x: 0, y: 0, w: selectedSpan, h: 4 },
      view: {
        type: selectedViewType,
        filters,
        sorts: [],
      },
      linkedConfig: {
        id: uid(),
        title,
        sourceTableId: primaryDbId,
        sourceDatabases: selectedDbIds,
        viewType: selectedViewType,
        filters,
        sorts: [],
        span: selectedSpan,
      },
    };

    addSection(newBlock);
    notify(`${isMulti ? 'Multi-Source View' : 'Linked View'} "${title}" berhasil ditambahkan ke Canvas`);
    handleClose();
  };

  // Add Record Card block (PART 4 & PART 6)
  const handleConfirmRecordCard = () => {
    const table = tables[selectedDbId];
    if (!table || !selectedRecordId) return;

    const rec = table.records.find((r) => r.id === selectedRecordId);
    const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
    const recTitle = rec?.values[titleProp?.key || 'title'] || 'Record Card';

    const newBlock: DashboardBlock = {
      id: uid(),
      dashboardId: 'dashboard_main',
      type: 'record_card',
      sourceDatabaseId: table.id,
      sourceRecordId: selectedRecordId,
      title: recTitle,
      label: table.name.toLowerCase(),
      span: 6,
      layout: { x: 0, y: 0, w: 6, h: 4 },
      config: {
        showCover: true,
        showRelations: true,
      },
    };

    addSection(newBlock);
    notify(`Record Card "${recTitle}" ditambahkan ke Canvas`);
    handleClose();
  };

  // Add Content block (PART 12 & PART 13)
  const handleAddContentBlock = (type: string) => {
    const blockId = uid();
    if (type === 'text') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'note',
        title: 'Notes',
        label: 'notes',
        span: 6,
        layout: { x: 0, y: 0, w: 6, h: 4 },
        meta: { text: '' },
        config: { text: '' },
      });
      notify('Text block ditambahkan ke Canvas');
    } else if (type === 'heading') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'heading',
        title: 'Heading Section',
        label: 'heading',
        span: 12,
        layout: { x: 0, y: 0, w: 12, h: 2 },
        meta: { text: 'Heading Section' },
        config: { text: 'Heading Section' },
      });
      notify('Heading block ditambahkan');
    } else if (type === 'quote') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'quote',
        title: 'Kutipan',
        label: 'quote',
        span: 12,
        layout: { x: 0, y: 0, w: 12, h: 2 },
        meta: {
          quote: 'Fokus pada proses hari ini, bukan kekhawatiran esok.',
          author: 'Scholar',
        },
        config: {
          quote: 'Fokus pada proses hari ini, bukan kekhawatiran esok.',
          author: 'Scholar',
        },
      });
      notify('Quote block ditambahkan');
    } else if (type === 'callout') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'callout',
        title: '',
        label: 'callout',
        span: 12,
        layout: { x: 0, y: 0, w: 12, h: 2 },
        meta: {
          text: 'Fokus minggu ini: Evaluasi sprint dan konsisten habit belajar.',
          icon: '💡',
        },
        config: {
          text: 'Fokus minggu ini: Evaluasi sprint dan konsisten habit belajar.',
          icon: '💡',
        },
      });
      notify('Callout block ditambahkan');
    } else if (type === 'image') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'image',
        title: 'Inspiration Image',
        label: 'artwork',
        span: 6,
        layout: { x: 0, y: 0, w: 6, h: 4 },
        meta: { src: '', caption: '', fit: 'cover', height: '340' },
        config: { src: '', caption: '', fit: 'cover', height: '340' },
      });
      notify('Independent Image block ditambahkan (unggah atau masukkan URL)');
    } else if (type === 'divider') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'divider',
        title: '',
        label: 'divider',
        span: 12,
        layout: { x: 0, y: 0, w: 12, h: 1 },
      });
      notify('Divider garis diagonal ditambahkan');
    } else if (type === 'spacer') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'spacer',
        title: '',
        label: 'spacer',
        span: 12,
        layout: { x: 0, y: 0, w: 12, h: 1 },
        meta: { height: 40 },
        config: { height: 40 },
      });
      notify('Spacer vertikal ditambahkan');
    } else if (type === 'clock') {
      addSection({
        id: blockId,
        dashboardId: 'dashboard_main',
        type: 'content',
        contentSubtype: 'clock',
        title: 'Analog Clock',
        label: 'widget',
        span: 4,
        layout: { x: 0, y: 0, w: 4, h: 4 },
      });
      notify('Indify Radar Clock ditambahkan');
    }

    handleClose();
  };

  // Quick preset shortcuts from Menu
  const startLinkedDatabaseWithView = (view: ViewType) => {
    setSelectedViewType(view);
    setMode('linked_db_step1');
  };

  const filteredTables = Object.values(tables).filter((t) => {
    if (!searchQuery.trim()) return true;
    return t.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Modal label="Tambah Section Baru" onClose={handleClose} width="max-w-2xl">
      <div className="p-6 font-mono space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ln/60 pb-3 select-none">
          <div className="flex items-center gap-2">
            {mode !== 'menu' && (
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="p-1 text-dm hover:text-tx hover:bg-hv rounded transition-colors mr-1"
                title="Kembali ke menu"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-tx">
                {mode === 'menu' && 'Add Section / Block'}
                {mode === 'linked_db_step1' && 'Select Database'}
                {mode === 'linked_db_step2' && `Configure View (${tables[selectedDbId]?.name || ''})`}
                {mode === 'record_card_step1' && 'Select Database for Record Card'}
                {mode === 'record_card_step2' && `Select Record (${tables[selectedDbId]?.name || ''})`}
                {mode === 'new_table' && 'Buat Database Master Baru'}
              </h2>
              <p className="text-[12px] text-dm">
                {mode === 'menu' && 'Pilih tipe blok konten atau view terhubung di atas database.'}
                {mode === 'linked_db_step1' && 'Pilih sumber database untuk membuat linked view.'}
                {mode === 'linked_db_step2' && 'Atur jenis tampilan, filter, dan layout kolom.'}
                {mode === 'record_card_step1' && 'Pilih database sumber kartu record.'}
                {mode === 'record_card_step2' && 'Pilih record spesifik untuk ditampilkan sebagai kartu.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-dm hover:text-tx text-[12px] p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* ============================================================ */}
        {/* MODE: MENU (PART 5 - CONTENT vs DATABASE)                    */}
        {/* ============================================================ */}
        {mode === 'menu' && (
          <div className="space-y-6">
            {/* 1. DATABASE BLOCKS */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-nt uppercase bg-nv/30 px-2.5 py-1 rounded">
                <Database size={13} />
                <span>Database Blocks (Tampilan Realtime)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedViewType('table');
                    setMode('linked_db_step1');
                  }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/60 text-left transition-all group"
                >
                  <div className="p-2 rounded bg-nv/30 text-nt shrink-0 mt-0.5 group-hover:bg-nt group-hover:text-nv transition-colors">
                    <Link2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[13px] text-tx group-hover:text-nt flex items-center gap-1.5">
                      <span>Linked Database</span>
                      <span className="text-[10px] text-ok font-normal bg-ok/10 px-1 rounded">Recom</span>
                    </div>
                    <div className="text-[11px] text-dm pt-0.5 leading-snug">
                      Tautkan ke Schedule, Tasks, Habits, dll. dengan filter & konfigurasi view kustom.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('record_card_step1')}
                  className="flex items-start gap-3 p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/60 text-left transition-all group"
                >
                  <div className="p-2 rounded bg-nv/30 text-nt shrink-0 mt-0.5 group-hover:bg-nt group-hover:text-nv transition-colors">
                    <ExternalLink size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[13px] text-tx group-hover:text-nt">
                      Record Card
                    </div>
                    <div className="text-[11px] text-dm pt-0.5 leading-snug">
                      Kartu spesifik dari satu baris record (misal: Main Activity dengan relasi Schedule & Tasks).
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => startLinkedDatabaseWithView('table')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ln/60 bg-bg hover:border-nt hover:bg-hv/40 text-left transition-all text-tx"
                >
                  <TableIcon size={15} className="text-nt shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[12px]">Database Table</div>
                    <div className="text-[10px] text-dm">Tampilan tabel baris & kolom</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => startLinkedDatabaseWithView('board')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ln/60 bg-bg hover:border-nt hover:bg-hv/40 text-left transition-all text-tx"
                >
                  <LayoutGrid size={15} className="text-nt shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[12px]">Database Board (Kanban)</div>
                    <div className="text-[10px] text-dm">Kolom kartu berkelompok (Status/Hari)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => startLinkedDatabaseWithView('calendar')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ln/60 bg-bg hover:border-nt hover:bg-hv/40 text-left transition-all text-tx"
                >
                  <Calendar size={15} className="text-nt shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[12px]">Database Calendar</div>
                    <div className="text-[10px] text-dm">Kalender bulanan interaktif</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => startLinkedDatabaseWithView('gallery')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ln/60 bg-bg hover:border-nt hover:bg-hv/40 text-left transition-all text-tx"
                >
                  <Eye size={15} className="text-nt shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[12px]">Database Gallery</div>
                    <div className="text-[10px] text-dm">Grid kartu bergambar cover</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => startLinkedDatabaseWithView('list')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ln/60 bg-bg hover:border-nt hover:bg-hv/40 text-left transition-all text-tx"
                >
                  <List size={15} className="text-nt shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[12px]">Database List</div>
                    <div className="text-[10px] text-dm">Daftar item ringkas horizontal</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. CONTENT BLOCKS */}
            <div className="space-y-2.5 pt-2 border-t border-ln/60">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-dm uppercase bg-hv/50 px-2.5 py-1 rounded">
                <Sparkles size={13} />
                <span>Content Blocks (Konten Independen)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('image')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <ImageIcon size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Image</div>
                  <div className="text-[10px] text-dm">Upload / URL</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('text')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <Type size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Text / Note</div>
                  <div className="text-[10px] text-dm">Catatan bebas</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('heading')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <Heading size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Heading</div>
                  <div className="text-[10px] text-dm">Judul seksi</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('quote')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <Quote size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Quote</div>
                  <div className="text-[10px] text-dm">Kutipan mutiara</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('callout')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <Zap size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Callout</div>
                  <div className="text-[10px] text-dm">Kotak sorotan</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('divider')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <Minus size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Divider</div>
                  <div className="text-[10px] text-dm">Garis diagonal</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('clock')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <Clock size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Radar Clock</div>
                  <div className="text-[10px] text-dm">Jam analog</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('spacer')}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/50 text-center transition-all group"
                >
                  <Columns size={20} className="text-nt mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-[12px] text-tx">Spacer</div>
                  <div className="text-[10px] text-dm">Jarak spasi</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE: LINKED DB - STEP 1 (SELECT DATABASE: MULTI-SOURCE)     */}
        {/* ============================================================ */}
        {mode === 'linked_db_step1' && (
          <div className="space-y-4">
            {/* Quick Multi-Source Preset Button (PART 1, 20 & 24) */}
            <div className="p-3 rounded-lg border border-nt/40 bg-nv/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-ok bg-ok/20 px-1.5 py-0.5 rounded uppercase">
                    Rekomendasi
                  </span>
                  <span className="font-bold text-[13px] text-tx">To Do List Harian Terpadu</span>
                </div>
                <p className="text-[11px] text-dm">
                  Gabungkan Tasks, Activities, Habits, Schedule, dan Entertainment dalam 1 view.
                </p>
              </div>
              <button
                type="button"
                onClick={selectMultiSourcePreset}
                className="shrink-0 px-3 py-1.5 rounded bg-nt text-nv font-bold text-[12px] hover:opacity-90 transition-opacity"
              >
                Gunakan Preset Ini →
              </button>
            </div>

            {/* Search and Selection Helper */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex items-center gap-2 rounded border border-ln bg-bg px-3 py-2 text-[13px]">
                <Search size={14} className="text-dm shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari database..."
                  className="bare"
                  autoFocus
                />
              </div>
              <div className="text-[11px] text-dm whitespace-nowrap">
                <span className="font-bold text-nt">{selectedDbIds.length}</span> database dipilih
              </div>
            </div>

            {/* Multi-Database Checklist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredTables.map((t) => {
                const isSelected = selectedDbIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleDbSelection(t.id)}
                    className={`flex flex-col p-3 rounded-lg border text-left transition-all group relative ${
                      isSelected
                        ? 'border-nt bg-nv/30 ring-1 ring-nt/60'
                        : 'border-ln/70 bg-bg hover:border-nt/50 hover:bg-hv/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-dm group-hover:text-nt transition-colors">
                        {getTableIcon(t.name)}
                      </span>
                      {/* Checkbox indicator */}
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-nt border-nt text-nv'
                            : 'border-ln bg-bg text-transparent'
                        }`}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                    </div>
                    <span className="font-bold text-[13px] text-tx group-hover:text-nt">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-dm truncate pt-0.5">
                      {t.description || 'Database master'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-ln/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDbIds(Object.keys(tables))}
                  className="text-[11px] text-dm hover:text-tx underline"
                >
                  Pilih Semua
                </button>
                <span className="text-dm/40">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedDbIds(['tasks'])}
                  className="text-[11px] text-dm hover:text-tx underline"
                >
                  Pilih Tasks Saja
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMode('linked_db_step2')}
                className="px-4 py-2 rounded bg-nv text-nt font-bold text-[12px] hover:opacity-90 transition-opacity"
              >
                Lanjut ke Konfigurasi View ({selectedDbIds.length} DB) →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE: LINKED DB - STEP 2 (SELECT VIEW & CONFIGURE)           */}
        {/* ============================================================ */}
        {mode === 'linked_db_step2' && (
          <div className="space-y-5">
            {/* View Selector */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-dm uppercase">
                1. Pilih Tampilan (View Type)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'table', label: 'Table', icon: TableIcon },
                  { id: 'board', label: 'Board', icon: LayoutGrid },
                  { id: 'calendar', label: 'Calendar', icon: Calendar },
                  { id: 'gallery', label: 'Gallery', icon: Eye },
                  { id: 'list', label: 'List', icon: List },
                ].map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedViewType(v.id as ViewType)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-[12px] font-medium transition-all ${
                        selectedViewType === v.id
                          ? 'border-nt bg-nv text-nt font-bold ring-1 ring-nt'
                          : 'border-ln bg-bg text-tx hover:bg-hv'
                      }`}
                    >
                      <Icon size={16} className="mb-1" />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Preset */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-dm uppercase">
                2. Filter Awal
              </label>
              <div className="flex flex-wrap gap-2 text-[12px]">
                {[
                  { id: 'all', label: 'Semua Data' },
                  { id: 'today', label: 'Hari Ini (Today)' },
                  { id: 'this_week', label: 'Minggu Ini (This Week)' },
                  { id: 'active_only', label: 'Status: Active' },
                  { id: 'incomplete', label: 'Belum Selesai (Incomplete)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedFilterPreset(p.id as any)}
                    className={`px-3 py-1.5 rounded-md border transition-all ${
                      selectedFilterPreset === p.id
                        ? 'border-nt bg-nt text-nv font-bold'
                        : 'border-ln bg-bg text-tx hover:bg-hv'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Span */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-dm uppercase">
                3. Lebar Kolom Grid (12 Kolom Canvas)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[3, 4, 6, 8, 9, 12].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSpan(s)}
                    className={`py-1.5 rounded border text-[12px] font-mono text-center transition-all ${
                      selectedSpan === s
                        ? 'border-nt bg-nt text-nv font-bold'
                        : 'border-ln bg-bg text-tx hover:bg-hv'
                    }`}
                  >
                    {s} cols
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Title Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-dm uppercase">
                4. Judul Section (Opsional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={`Contoh: ${tables[selectedDbId]?.name || 'Database'} View`}
                className="bare rounded border border-ln bg-bg p-2 text-[13px]"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ln/60">
              <button
                type="button"
                onClick={() => setMode('linked_db_step1')}
                className="px-3 py-2 rounded text-[12px] text-dm hover:text-tx"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmLinkedDb}
                className="px-4 py-2 rounded bg-nv text-nt font-bold text-[13px] hover:opacity-90 transition-opacity"
              >
                + Tambahkan ke Canvas
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE: RECORD CARD - STEP 1 (SELECT DATABASE)                 */}
        {/* ============================================================ */}
        {mode === 'record_card_step1' && (
          <div className="space-y-4">
            <p className="text-[12px] text-dm">
              Pilih database yang memuat record yang ingin Anda tampilkan sebagai kartu detail:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(tables).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedDbId(t.id);
                    setMode('record_card_step2');
                  }}
                  className="flex flex-col p-3 rounded-lg border border-ln/70 bg-bg hover:border-nt hover:bg-hv/60 text-left transition-all group"
                >
                  <div className="flex items-center justify-between w-full mb-1 text-dm group-hover:text-nt">
                    {getTableIcon(t.name)}
                    <span className="text-[10px] text-dm/70 bg-hv px-1.5 py-0.5 rounded">
                      {t.records.length} items
                    </span>
                  </div>
                  <span className="font-bold text-[13px] text-tx group-hover:text-nt">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE: RECORD CARD - STEP 2 (SELECT RECORD)                   */}
        {/* ============================================================ */}
        {mode === 'record_card_step2' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded border border-ln bg-bg px-3 py-2 text-[13px]">
              <Search size={14} className="text-dm shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari record di ${tables[selectedDbId]?.name}...`}
                className="bare"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 p-1">
              {tables[selectedDbId]?.records
                .filter((r) => {
                  if (!searchQuery.trim()) return true;
                  const titleProp =
                    tables[selectedDbId].properties.find((p) => p.type === 'title') ||
                    tables[selectedDbId].properties[0];
                  const titleStr = String(r.values[titleProp?.key || 'title'] || '').toLowerCase();
                  return titleStr.includes(searchQuery.toLowerCase());
                })
                .map((r) => {
                  const titleProp =
                    tables[selectedDbId].properties.find((p) => p.type === 'title') ||
                    tables[selectedDbId].properties[0];
                  const title = r.values[titleProp?.key || 'title'] || 'Tanpa Judul';
                  const isSelected = selectedRecordId === r.id;

                  return (
                    <div
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedRecordId(r.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedRecordId(r.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-nt bg-nv/30 text-tx'
                          : 'border-transparent hover:border-ln hover:bg-hv/40 text-tx'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] truncate">{title}</div>
                        {r.values.category && (
                          <div className="text-[11px] text-dm">{r.values.category}</div>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-[11px] font-bold text-nt bg-nt/10 px-2 py-0.5 rounded">
                          Terpilih
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ln/60">
              <button
                type="button"
                onClick={() => setMode('record_card_step1')}
                className="px-3 py-2 rounded text-[12px] text-dm hover:text-tx"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={!selectedRecordId}
                onClick={handleConfirmRecordCard}
                className="px-4 py-2 rounded bg-nv text-nt font-bold text-[13px] hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                + Tambahkan Record Card
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
