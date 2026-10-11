import type { SourceTable } from '../types';
import { DAYS_SHORT, formatShortDate } from '../lib/date';
import { useStore } from '../store';

export function PrintReport({
  title,
  owner,
  weekRange,
  tables,
}: {
  title: string;
  owner: string;
  weekRange: string;
  tables?: Record<string, SourceTable>;
}) {
  const storeTables = useStore((s) => s.tables);
  const activeTables = tables || storeTables;

  const habitsTable = activeTables['habits'];
  const tasksTable = activeTables['tasks'];
  const scheduleTable = activeTables['schedule'];
  const entTable = activeTables['entertainment'];
  const goalsTable = activeTables['goals'];
  const notesTable = activeTables['notes'];

  const habitRecords = habitsTable?.records || [];
  const taskRecords = tasksTable?.records || [];
  const scheduleRecords = scheduleTable?.records || [];
  const entRecords = entTable?.records || [];
  const goalRecords = goalsTable?.records || [];

  const tasksDoneCount = taskRecords.filter((t) => t.values.status === 'Done').length;
  const scheduleDoneCount = scheduleRecords.filter((s) => s.values.status === 'Done').length;

  return (
    <div id="print-root" className="p-8 font-mono text-[10pt] text-black bg-white max-w-[210mm] mx-auto">
      {/* Header Dokumen */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="text-[8pt] uppercase tracking-widest text-neutral-500 mb-1">
          Laporan Produktivitas Mingguan // Scholar Personal Operating System
        </div>
        <div className="flex items-baseline justify-between">
          <h1 className="text-[18pt] font-bold tracking-tight">
            {owner ? `${owner} — ` : ''}{title || 'Scholar'}
          </h1>
          <span className="text-[10pt] font-semibold text-neutral-700">
            {weekRange}
          </span>
        </div>
      </div>

      {/* Ringkasan Angka */}
      <div className="grid grid-cols-4 gap-3 mb-6 avoid-break text-center">
        <div className="border border-neutral-300 rounded p-2.5">
          <div className="text-[7.5pt] text-neutral-500 uppercase">Tugas Selesai</div>
          <div className="text-[13pt] font-bold mt-0.5">
            {tasksDoneCount} / {taskRecords.length}
          </div>
        </div>

        <div className="border border-neutral-300 rounded p-2.5">
          <div className="text-[7.5pt] text-neutral-500 uppercase">Jadwal Terlaksana</div>
          <div className="text-[13pt] font-bold mt-0.5">
            {scheduleDoneCount} / {scheduleRecords.length}
          </div>
        </div>

        <div className="border border-neutral-300 rounded p-2.5">
          <div className="text-[7.5pt] text-neutral-500 uppercase">Habit Aktif</div>
          <div className="text-[13pt] font-bold mt-0.5">
            {habitRecords.length} Kebiasaan
          </div>
        </div>

        <div className="border border-neutral-300 rounded p-2.5">
          <div className="text-[7.5pt] text-neutral-500 uppercase">Target / Goals</div>
          <div className="text-[13pt] font-bold mt-0.5">
            {goalRecords.length} Sasaran
          </div>
        </div>
      </div>

      {/* Habit Tracker Matrix */}
      {habitRecords.length > 0 && (
        <div className="mb-6 avoid-break">
          <div className="border-b border-black pb-1 mb-2 font-bold text-[9.5pt] uppercase tracking-wider">
            1. Habit Tracker (Matriks Kebiasaan)
          </div>
          <table className="w-full border-collapse text-[8.5pt]">
            <thead>
              <tr className="border-b border-neutral-300 text-left text-neutral-600">
                <th className="py-1">Kebiasaan</th>
                <th className="py-1 w-20">Kategori</th>
                {DAYS_SHORT.map((d) => (
                  <th key={d} className="py-1 text-center w-7">{d}</th>
                ))}
                <th className="py-1 text-right w-14">Streak</th>
              </tr>
            </thead>
            <tbody>
              {habitRecords.map((h) => {
                const days: number[] = Array.isArray(h.values.days) ? h.values.days : [0,0,0,0,0,0,0];
                return (
                  <tr key={h.id} className="border-b border-neutral-200">
                    <td className="py-1 font-medium">{h.values.title}</td>
                    <td className="py-1 text-neutral-600">{h.values.category || '-'}</td>
                    {days.map((c, i) => (
                      <td key={i} className="py-1 text-center font-bold">
                        {c === 1 ? '✓' : c === 2 ? '✕' : '·'}
                      </td>
                    ))}
                    <td className="py-1 text-right font-medium">{h.values.streak || 0} hari</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* To-Do List & Tasks */}
      {taskRecords.length > 0 && (
        <div className="mb-6 avoid-break">
          <div className="border-b border-black pb-1 mb-2 font-bold text-[9.5pt] uppercase tracking-wider">
            2. Checklist Tugas Mingguan
          </div>
          <table className="w-full border-collapse text-[8.5pt]">
            <thead>
              <tr className="border-b border-neutral-300 text-left text-neutral-600">
                <th className="py-1 w-10">Status</th>
                <th className="py-1">Tugas</th>
                <th className="py-1 w-24">Prioritas</th>
                <th className="py-1 w-28 text-right">Tenggat</th>
              </tr>
            </thead>
            <tbody>
              {taskRecords.map((t) => {
                const isDone = t.values.status === 'Done';
                return (
                  <tr key={t.id} className="border-b border-neutral-200">
                    <td className="py-1 font-bold">{isDone ? '[✓]' : '[ ]'}</td>
                    <td className={`py-1 ${isDone ? 'line-through text-neutral-500' : 'font-medium'}`}>
                      {t.values.title}
                    </td>
                    <td className="py-1 text-neutral-600">{t.values.priority || '-'}</td>
                    <td className="py-1 text-right text-neutral-600">
                      {formatShortDate(t.values.dueDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Jadwal Kegiatan */}
      {scheduleRecords.length > 0 && (
        <div className="mb-6 avoid-break">
          <div className="border-b border-black pb-1 mb-2 font-bold text-[9.5pt] uppercase tracking-wider">
            3. Jadwal Kegiatan & Waktu
          </div>
          <table className="w-full border-collapse text-[8.5pt]">
            <thead>
              <tr className="border-b border-neutral-300 text-left text-neutral-600">
                <th className="py-1 w-24">Tanggal / Waktu</th>
                <th className="py-1">Aktivitas</th>
                <th className="py-1 w-24">Kategori</th>
                <th className="py-1 w-20 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {scheduleRecords.map((s) => (
                <tr key={s.id} className="border-b border-neutral-200">
                  <td className="py-1 text-neutral-600">
                    {formatShortDate(s.values.date)} {s.values.startTime || ''}
                  </td>
                  <td className="py-1 font-medium">{s.values.title}</td>
                  <td className="py-1 text-neutral-600">{s.values.category || '-'}</td>
                  <td className="py-1 text-right font-medium">
                    {s.values.status || 'Planned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Goals & Milestones */}
      {goalRecords.length > 0 && (
        <div className="mb-6 avoid-break">
          <div className="border-b border-black pb-1 mb-2 font-bold text-[9.5pt] uppercase tracking-wider">
            4. Goals & Kemajuan
          </div>
          <div className="grid grid-cols-2 gap-3 text-[8.5pt]">
            {goalRecords.map((g) => (
              <div key={g.id} className="border border-neutral-300 rounded p-2">
                <div className="font-bold">{g.values.title}</div>
                <div className="flex justify-between text-neutral-600 mt-1">
                  <span>{g.values.category}</span>
                  <span className="font-semibold text-black">{g.values.progress}% Selesai</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entertainment & Review Notes */}
      {notesTable && notesTable.records.length > 0 && (
        <div className="mb-6 avoid-break">
          <div className="border-b border-black pb-1 mb-2 font-bold text-[9.5pt] uppercase tracking-wider">
            5. Catatan Refleksi & Evaluasi
          </div>
          <div className="space-y-2 text-[8.5pt] leading-relaxed">
            {notesTable.records.map((n) => (
              <div key={n.id} className="border-l-2 border-black pl-3 py-0.5">
                <div className="font-bold">{n.values.title}</div>
                <div className="text-neutral-700 whitespace-pre-wrap mt-0.5">{n.values.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-neutral-300 pt-3 mt-6 text-[7.5pt] text-neutral-500 flex justify-between avoid-break">
        <span>Dicetak dari Scholar — Modular Personal Planner</span>
        <span>Tanggal cetak: {new Date().toLocaleDateString('id-ID')}</span>
      </div>
    </div>
  );
}
