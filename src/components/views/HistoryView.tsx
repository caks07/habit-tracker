import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  History,
  Lock,
  Printer,
  Repeat,
  Sparkles,
} from 'lucide-react';
import type { HistoryEntry } from '../../types';
import { useStore } from '../../store';
import { weekInfo } from '../../lib/date';
import { Tag } from '../ui';

export function HistoryView() {
  const history = useStore((s) => s.history);
  const openExport = useStore((s) => s.openExport);
  const currentWeek = weekInfo();

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    history[0]?.id || null
  );

  const selectedEntry = history.find((h) => h.id === selectedEntryId) || history[0];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 font-mono space-y-8">
      {/* Page Title */}
      <div className="border-b border-ln/70 pb-5">
        <div className="flex items-center gap-2 text-dm text-[12px] mb-1">
          <History size={14} />
          <span>ARSIP & HISTORICAL SNAPSHOTS</span>
        </div>
        <h1 className="text-2xl font-bold text-tx">
          Riwayat Siklus Mingguan (History)
        </h1>
        <p className="mt-1 text-[13px] text-dm">
          Data historis bersifat snapshot murni (read-only) dan independen dari Live Source Tables.
        </p>
      </div>

      {/* Main Layout: Left Week List + Right Snapshot View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Week List Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[12px] font-semibold text-dm uppercase tracking-wider px-1">
            Daftar Minggu (Tahun 2026)
          </div>

          <div className="space-y-2">
            {/* Current Active Week Banner */}
            <div className="rounded-lg border border-nt/60 bg-nv/20 p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-tx text-[13px]">
                  <span>Minggu {currentWeek.week}</span>
                  <span className="text-[10px] bg-nt text-nv px-1.5 py-0.5 rounded font-semibold">
                    Live Aktif
                  </span>
                </div>
                <div className="text-[11px] text-dm mt-0.5">{currentWeek.range}</div>
              </div>
            </div>

            {/* Historical Archived Weeks */}
            {history.map((entry) => {
              const isSelected = selectedEntry?.id === entry.id;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-all ${
                    isSelected
                      ? 'border-nt bg-pn font-semibold ring-1 ring-nt shadow-xs'
                      : 'border-ln/70 bg-pn/40 hover:bg-hv/70 text-tx'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-tx">Minggu {entry.week}</span>
                    <span className="text-[11px] text-dm flex items-center gap-1">
                      <Lock size={11} /> Read-only
                    </span>
                  </div>
                  <div className="text-[11px] text-dm mt-1">{entry.range}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-dm/80">
                    <Tag color="green" className="py-0 px-1">
                      {entry.metrics?.habitsRate || 80}% Habit
                    </Tag>
                    <span>
                      {entry.metrics?.tasksDone || 0}/{entry.metrics?.totalTasks || 0} Tugas
                    </span>
                  </div>
                </button>
              );
            })}

            {history.length === 0 && (
              <div className="text-center py-6 text-dm text-[12px]">
                Belum ada arsip minggu sebelumnya. Gunakan tombol "↻ Restart Minggu" di header untuk mengarsipkan.
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Historical Snapshot (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedEntry ? (
            <div className="rounded-lg border border-ln/80 bg-pn/30 p-6 space-y-6">
              {/* Snapshot Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ln/60 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] text-amber-500 font-semibold mb-1">
                    <Lock size={13} />
                    <span>SNAPSHOT HISTORIS (TERKUNCI & READ-ONLY)</span>
                  </div>
                  <h2 className="text-xl font-bold text-tx">
                    Laporan Minggu {selectedEntry.week} ({selectedEntry.range})
                  </h2>
                  <div className="text-[11px] text-dm mt-0.5">
                    Diarsipkan pada:{' '}
                    {new Date(selectedEntry.archivedAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openExport({ weekKey: selectedEntry.weekKey })}
                  className="flex items-center gap-1.5 rounded bg-nv px-3 py-1.5 text-[12px] font-semibold text-nt hover:opacity-90 transition-opacity"
                >
                  <Printer size={13} />
                  <span>Cetak PDF Minggu Ini</span>
                </button>
              </div>

              {/* Snapshot Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded border border-ln/60 bg-bg p-3">
                  <div className="text-xl font-bold text-ok">
                    {selectedEntry.metrics?.habitsRate || 80}%
                  </div>
                  <div className="text-[11px] text-dm mt-0.5">Pencapaian Habit</div>
                </div>

                <div className="rounded border border-ln/60 bg-bg p-3">
                  <div className="text-xl font-bold text-nt">
                    {selectedEntry.metrics?.tasksDone || 0} / {selectedEntry.metrics?.totalTasks || 0}
                  </div>
                  <div className="text-[11px] text-dm mt-0.5">Tugas Selesai</div>
                </div>

                <div className="rounded border border-ln/60 bg-bg p-3">
                  <div className="text-xl font-bold text-tx">
                    {selectedEntry.metrics?.scheduleEvents || 0}
                  </div>
                  <div className="text-[11px] text-dm mt-0.5">Sesi Kegiatan</div>
                </div>
              </div>

              {/* Reflection Note from Snapshot */}
              {selectedEntry.reflectionText && (
                <div className="rounded-lg border border-ln/60 bg-bg p-4 space-y-1.5">
                  <div className="text-[11px] font-semibold text-dm uppercase tracking-wider">
                    Catatan Refleksi Minggu Ini
                  </div>
                  <p className="text-[13px] text-tx leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.reflectionText}
                  </p>
                </div>
              )}

              {/* Tables Preview from Snapshot */}
              <div className="space-y-4">
                <div className="text-[12px] font-semibold text-dm uppercase tracking-wider">
                  Ringkasan Data Tersimpan:
                </div>

                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  {selectedEntry.snapshotTables.map((tbl) => (
                    <div
                      key={tbl.id}
                      className="rounded border border-ln/60 bg-bg p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-tx">{tbl.name}</div>
                        <div className="text-[11px] text-dm">{tbl.records.length} baris tersimpan</div>
                      </div>
                      <span className="text-[10px] bg-hv text-dm px-2 py-0.5 rounded">
                        Snapshot
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-dm">Pilih minggu di sebelah kiri.</div>
          )}
        </div>
      </div>
    </div>
  );
}
