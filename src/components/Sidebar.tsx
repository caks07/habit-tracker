import {
  Activity,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Database,
  Film,
  Flame,
  History,
  LayoutDashboard,
  Plus,
  Repeat,
  Settings,
  Sun,
  Target,
  Zap,
} from 'lucide-react';
import { useStore, type View } from '../store';

export function Sidebar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const tables = useStore((s) => s.tables);
  const addSourceTable = useStore((s) => s.addSourceTable);
  const page = useStore((s) => s.page);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);

  const getTableIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'activities':
        return <Activity size={14} className="text-dm" />;
      case 'schedule':
        return <Calendar size={14} className="text-dm" />;
      case 'tasks':
        return <CheckSquare size={14} className="text-dm" />;
      case 'habits':
        return <Repeat size={14} className="text-dm" />;
      case 'entertainment':
        return <Film size={14} className="text-dm" />;
      case 'assignments':
        return <BookOpen size={14} className="text-dm" />;
      case 'goals':
        return <Target size={14} className="text-dm" />;
      default:
        return <Database size={14} className="text-dm" />;
    }
  };

  const handleAddTable = () => {
    const name = prompt('Nama Source Table baru (contoh: Project, Finansial, Belajar):');
    if (!name?.trim()) return;
    const newId = addSourceTable(name.trim());
    setView({ name: 'source-table', tableId: newId });
  };

  if (sidebarCollapsed) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-12 border-r border-ln/70 bg-pn/90 backdrop-blur-md flex flex-col items-center py-3 select-none">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          className="p-2 text-dm hover:text-tx hover:bg-hv rounded transition-colors"
          title="Buka sidebar"
        >
          <ChevronRight size={16} />
        </button>

        <div className="mt-4 flex flex-col gap-2 items-center">
          <button
            type="button"
            onClick={() => setView({ name: 'dashboard' })}
            className={`p-2 rounded transition-colors ${
              view.name === 'dashboard' ? 'bg-nv text-nt' : 'text-dm hover:text-tx hover:bg-hv'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard size={16} />
          </button>

          <button
            type="button"
            onClick={() => setView({ name: 'today' })}
            className={`p-2 rounded transition-colors ${
              view.name === 'today' ? 'bg-nv text-nt' : 'text-dm hover:text-tx hover:bg-hv'
            }`}
            title="Today"
          >
            <Zap size={16} />
          </button>

          <button
            type="button"
            onClick={() => setView({ name: 'history' })}
            className={`p-2 rounded transition-colors ${
              view.name === 'history' ? 'bg-nv text-nt' : 'text-dm hover:text-tx hover:bg-hv'
            }`}
            title="History"
          >
            <History size={16} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-ln/70 bg-pn flex flex-col justify-between font-mono text-[13px] select-none transition-all duration-200">
      {/* Top Workspace Header */}
      <div className="overflow-y-auto p-3 space-y-5">
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">🍃</span>
            <span className="font-bold text-tx tracking-tight">{page.title}</span>
            <span className="text-[10px] text-dm bg-hv px-1.5 py-0.5 rounded">Planner</span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="p-1 text-dm hover:text-tx hover:bg-hv rounded transition-colors"
            title="Sembunyikan sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Main Nav Group */}
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-[11px] font-semibold text-dm/80 uppercase tracking-wider">
            Navigasi Utama
          </div>

          <button
            type="button"
            onClick={() => setView({ name: 'dashboard' })}
            className={`flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left transition-colors ${
              view.name === 'dashboard'
                ? 'bg-nv text-nt font-semibold'
                : 'text-tx hover:bg-hv/70'
            }`}
          >
            <LayoutDashboard size={14} className={view.name === 'dashboard' ? 'text-nt' : 'text-dm'} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setView({ name: 'today' })}
            className={`flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left transition-colors ${
              view.name === 'today'
                ? 'bg-nv text-nt font-semibold'
                : 'text-tx hover:bg-hv/70'
            }`}
          >
            <Zap size={14} className={view.name === 'today' ? 'text-nt' : 'text-dm'} />
            <span>Today (Fokus)</span>
          </button>

          <button
            type="button"
            onClick={() => setView({ name: 'this-week' })}
            className={`flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left transition-colors ${
              view.name === 'this-week'
                ? 'bg-nv text-nt font-semibold'
                : 'text-tx hover:bg-hv/70'
            }`}
          >
            <Calendar size={14} className={view.name === 'this-week' ? 'text-nt' : 'text-dm'} />
            <span>This Week</span>
          </button>
        </div>

        {/* Source Tables (Database Induk) */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-dm/80 uppercase tracking-wider">
            <span>Source Tables</span>
            <button
              type="button"
              onClick={handleAddTable}
              className="text-dm hover:text-tx p-0.5"
              title="Buat Source Table baru"
            >
              <Plus size={12} />
            </button>
          </div>

          {Object.values(tables).map((t) => {
            const isCurrent = view.name === 'source-table' && view.tableId === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setView({ name: 'source-table', tableId: t.id })}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left transition-colors ${
                  isCurrent ? 'bg-nv text-nt font-semibold' : 'text-tx hover:bg-hv/70'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {getTableIcon(t.name)}
                  <span className="truncate">{t.name}</span>
                </div>
                <span className="text-[11px] text-dm/60 font-normal">
                  {t.records.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Archive & Cycle */}
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-[11px] font-semibold text-dm/80 uppercase tracking-wider">
            Siklus & Arsip
          </div>

          <button
            type="button"
            onClick={() => setView({ name: 'history' })}
            className={`flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left transition-colors ${
              view.name === 'history'
                ? 'bg-nv text-nt font-semibold'
                : 'text-tx hover:bg-hv/70'
            }`}
          >
            <History size={14} className={view.name === 'history' ? 'text-nt' : 'text-dm'} />
            <span>History (Arsip)</span>
          </button>
        </div>

        {/* System Settings */}
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-[11px] font-semibold text-dm/80 uppercase tracking-wider">
            Sistem
          </div>

          <button
            type="button"
            onClick={() => setView({ name: 'settings' })}
            className={`flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left transition-colors ${
              view.name === 'settings'
                ? 'bg-nv text-nt font-semibold'
                : 'text-tx hover:bg-hv/70'
            }`}
          >
            <Settings size={14} className={view.name === 'settings' ? 'text-nt' : 'text-dm'} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile Footer */}
      <div className="border-t border-ln/70 p-3 bg-pn/60">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <img
            src={page.avatar}
            alt={page.owner}
            className="h-8 w-8 rounded-full border border-ln object-cover"
          />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate font-semibold text-tx text-[13px]">{page.owner}</div>
            <div className="truncate text-dm text-[11px]">Yogyakarta, ID</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
