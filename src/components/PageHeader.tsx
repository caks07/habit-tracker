import { useState } from 'react';
import {
  Calendar,
  Clock,
  FileDown,
  History,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Zap,
} from 'lucide-react';
import { useStore } from '../store';
import { ImagePicker } from './ui';
import { longToday, weekInfo } from '../lib/date';

export function PageHeader() {
  const page = useStore((s) => s.page);
  const setPage = useStore((s) => s.setPage);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const restartWeek = useStore((s) => s.restartWeek);
  const setAddOpen = useStore((s) => s.setAddOpen);
  const openExport = useStore((s) => s.openExport);
  const ask = useStore((s) => s.ask);
  const query = useStore((s) => s.query);
  const setQuery = useStore((s) => s.setQuery);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);

  const currentWeek = weekInfo();

  const handleRestartWeek = () => {
    ask({
      title: 'Restart & Arsipkan Minggu Ini ke History?',
      body: `Kondisi minggu ini (${currentWeek.range}) akan disimpan sebagai snapshot permanen di halaman History (read-only). Kemudian aktivitas mingguan seperti habit tracker dan checklist akan di-reset untuk memulai siklus minggu baru. Data Source Tables dan struktur Linked Views tetap utuh.`,
      points: [
        `Snapshot Minggu ${currentWeek.week} tersimpan di History (read-only)`,
        'Struktur Source Tables dan Linked Views tidak terhapus',
        'Centang habit & checklist mingguan dimulai dari awal',
      ],
      confirmLabel: '↻ Simpan Snapshot & Restart',
      onConfirm: () => restartWeek(),
    });
  };

  return (
    <div>
      {/* Top sticky bar */}
      <nav className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-ln bg-bg/95 px-4 backdrop-blur-md text-[13px] font-mono">
        {/* Left: Sidebar toggle + Breadcrumbs & View tabs */}
        <div className="flex items-center gap-2.5 min-w-0">
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 text-dm hover:text-tx hover:bg-hv rounded transition-colors mr-1"
              title="Buka sidebar navigasi"
            >
              <Menu size={15} />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-tx font-medium">
            <span className="text-base select-none">🍃</span>
            <span className="truncate">{page.title || 'Scholar'}</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-ln/80 mx-1" />

          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setView({ name: 'dashboard' })}
              className={`flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${
                view.name === 'dashboard'
                  ? 'bg-nv text-nt font-semibold'
                  : 'text-dm hover:text-tx hover:bg-hv/60'
              }`}
            >
              <LayoutDashboard size={13} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setView({ name: 'today' })}
              className={`flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${
                view.name === 'today'
                  ? 'bg-nv text-nt font-semibold'
                  : 'text-dm hover:text-tx hover:bg-hv/60'
              }`}
            >
              <Zap size={13} />
              <span>Today</span>
            </button>

            <button
              type="button"
              onClick={() => setView({ name: 'this-week' })}
              className={`flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${
                view.name === 'this-week'
                  ? 'bg-nv text-nt font-semibold'
                  : 'text-dm hover:text-tx hover:bg-hv/60'
              }`}
            >
              <Calendar size={13} />
              <span>This Week</span>
            </button>

            <button
              type="button"
              onClick={() => setView({ name: 'history' })}
              className={`flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${
                view.name === 'history'
                  ? 'bg-nv text-nt font-semibold'
                  : 'text-dm hover:text-tx hover:bg-hv/60'
              }`}
            >
              <History size={13} />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Search */}
          <div className="relative hidden md:flex items-center">
            <Search size={13} className="absolute left-2.5 text-dm pointer-events-none" />
            <input
              type="text"
              placeholder="Cari data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bare w-32 rounded bg-hv/80 py-1 pl-7 pr-2 text-[12px] text-tx placeholder:text-dm focus:w-48 transition-all"
            />
          </div>

          {/* Restart Minggu */}
          <button
            type="button"
            onClick={handleRestartWeek}
            title="Restart minggu ini: arsipkan ke History & kosongkan centang mingguan"
            className="flex items-center gap-1.5 rounded border border-ln bg-pn px-2.5 py-1 text-[12px] text-dm hover:text-tx hover:bg-hv transition-colors"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">↻ Restart minggu</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={() => openExport({})}
            title="Export laporan mingguan ke format PDF"
            className="flex items-center gap-1.5 rounded border border-ln bg-pn px-2.5 py-1 text-[12px] text-tx hover:bg-hv font-medium transition-colors"
          >
            <FileDown size={13} />
            <span>Export PDF</span>
          </button>

          {/* + Tambah Section */}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 rounded bg-nv px-2.5 py-1 text-[12px] font-semibold text-nt hover:brightness-110 transition-all shadow-xs"
          >
            <Plus size={13} />
            <span>+ Add Section</span>
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
              document.documentElement.setAttribute('data-theme', next);
            }}
            className="rounded p-1.5 text-dm hover:text-tx hover:bg-hv transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </nav>

      {/* Cover Image (Only displayed on Dashboard View) */}
      {view.name === 'dashboard' && (
        <div className="group relative h-48 sm:h-64 w-full overflow-hidden bg-hv">
          <img
            src={page.cover || '/img/cover.jpg'}
            alt="Cover Scholar"
            className="h-full w-full object-cover object-center"
          />
          <ImagePicker
            label="Ganti cover"
            onPick={(cover) => setPage({ cover })}
            className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
          />
        </div>
      )}

      {/* Page Identity Header */}
      {view.name === 'dashboard' && (
        <div className="mx-auto max-w-6xl px-6 pt-2">
          {/* Leaf Icon on the cover border */}
          <div className="-mt-8 mb-3 flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-ln bg-pn text-2xl shadow-lg select-none">
              🍃
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-dm">
              <span className="rounded bg-nv px-2 py-0.5 text-nt uppercase tracking-wider font-semibold">
                Personal OS
              </span>
              <span>·</span>
              <span>Minggu {currentWeek.week} ({currentWeek.range})</span>
            </div>
          </div>

          {/* Page Title */}
          <div className="mb-3">
            <input
              className="bare text-3xl sm:text-4xl font-bold font-mono tracking-tight text-tx"
              value={page.title}
              onChange={(e) => setPage({ title: e.target.value })}
              placeholder="Scholar"
              aria-label="Judul Halaman"
            />
          </div>

          {/* Monospace Quote Box */}
          <div className="mb-8 rounded-lg border border-ln bg-pn/60 p-4 font-mono text-[13px] leading-relaxed text-tx">
            <textarea
              className="bare resize-none italic"
              rows={3}
              value={page.quote}
              onChange={(e) => setPage({ quote: e.target.value })}
              placeholder="Tulis quote atau motivasi..."
              aria-label="Quote"
            />
            <div className="mt-1 text-right text-dm text-[12px]">
              —{' '}
              <input
                className="bare inline-block w-28 text-right font-medium text-tx"
                value={page.quoteBy}
                onChange={(e) => setPage({ quoteBy: e.target.value })}
                aria-label="Penulis Quote"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
