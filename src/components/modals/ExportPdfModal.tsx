import { useState } from 'react';
import { FileDown, Printer, Check } from 'lucide-react';
import { useStore } from '../../store';
import { Modal, CloseButton } from '../ui';
import { weekInfo } from '../../lib/date';
import type { Section } from '../../types';

export function ExportPdfModal() {
  const exportOpen = useStore((s) => s.exportOpen);
  const openExport = useStore((s) => s.openExport);
  const sections = useStore((s) => s.sections);
  const history = useStore((s) => s.history);
  const page = useStore((s) => s.page);

  const currentWeek = weekInfo();

  // Daftar opsi periode: Minggu ini + minggu dari history
  const historyWeeks = Array.from(new Set(history.map((h) => h.weekKey))).map((key) => {
    const entry = history.find((h) => h.weekKey === key)!;
    return { key, label: `Minggu ${entry.week} (${entry.range})`, isCurrent: false };
  });

  const periodOptions = [
    { key: 'current', label: `Minggu ini (${currentWeek.range})`, isCurrent: true },
    ...historyWeeks,
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  if (!exportOpen) return null;

  // Tentukan sections mana yang akan dicetak
  let printSections: Section[] = sections;
  let printRange = currentWeek.range;

  if (selectedPeriod !== 'current') {
    const matchingHistory = history.filter((h) => h.weekKey === selectedPeriod);
    if (matchingHistory.length > 0) {
      printSections = matchingHistory[0].snapshotSections || (matchingHistory[0].snapshot ? [matchingHistory[0].snapshot] : []);
      printRange = matchingHistory[0].range;
    }
  }

  const handlePrint = () => {
    openExport(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <Modal label="Export PDF" onClose={() => openExport(null)} width="max-w-xl">
      <div className="flex items-center justify-between border-b border-ln px-5 py-3 text-[13px] font-mono font-semibold">
        <div className="flex items-center gap-2">
          <FileDown size={15} className="text-nt" />
          <span>Export Laporan Mingguan ke PDF</span>
        </div>
        <CloseButton onClick={() => openExport(null)} />
      </div>

      <div className="p-6 font-mono text-[13px] space-y-5">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-dm mb-2">
            Pilih Periode Laporan
          </label>
          <div className="space-y-1.5">
            {periodOptions.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                  selectedPeriod === opt.key
                    ? 'border-nt bg-nv/40 text-tx font-medium'
                    : 'border-ln bg-bg text-dm hover:bg-hv'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="period"
                    value={opt.key}
                    checked={selectedPeriod === opt.key}
                    onChange={() => setSelectedPeriod(opt.key)}
                    className="accent-[var(--nt)]"
                  />
                  <span>{opt.label}</span>
                </div>
                {opt.isCurrent && (
                  <span className="text-[10px] rounded bg-nv px-1.5 py-0.5 text-nt uppercase">
                    Aktif
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Ringkasan isi laporan */}
        <div className="rounded border border-ln bg-bg p-4 space-y-2 text-[12px]">
          <div className="font-semibold text-tx">Data terstruktur yang akan dicetak:</div>
          <ul className="space-y-1 text-dm">
            <li className="flex items-center gap-2">
              <Check size={13} className="text-ok" />
              <span>Ringkasan angka habit, tugas, dan jadwal</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={13} className="text-ok" />
              <span>Matriks Habit Tracker Senin–Minggu</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={13} className="text-ok" />
              <span>To-do List harian & status checklist</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={13} className="text-ok" />
              <span>Jadwal kegiatan time-table per hari</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={13} className="text-ok" />
              <span>Catatan evaluasi & refleksi mingguan</span>
            </li>
          </ul>
          <p className="pt-1 text-[11px] text-dm italic">
            Format cetak diatur otomatis ke ukuran A4 rapi tanpa sidebar dan tombol web.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-ln px-5 py-3 font-mono text-[12px]">
        <button
          type="button"
          onClick={() => openExport(null)}
          className="rounded px-3 py-1.5 text-dm hover:text-tx hover:bg-hv"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded bg-nt px-4 py-1.5 font-semibold text-white hover:brightness-110"
        >
          <Printer size={13} />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>
    </Modal>
  );
}
