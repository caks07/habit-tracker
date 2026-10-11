import { Check, X } from 'lucide-react';
import type { HabitCell, HabitItem } from '../../types';
import { DAYS_SHORT, todayIndex } from '../../lib/date';
import { habitStreak, pct } from '../../lib/sections';
import { uid } from '../../lib/util';
import { AddInput } from '../ui';
import type { SectionProps } from './types';

const NEXT: Record<HabitCell, HabitCell> = { 0: 1, 1: 2, 2: 0 };
const CELL_LABEL = ['kosong', 'selesai', 'terlewat'];

export function HabitSection({ section, readOnly, set }: SectionProps) {
  const items = (Array.isArray(section.items) ? section.items : []) as HabitItem[];
  const today = readOnly ? 6 : todayIndex();
  const save = (next: HabitItem[]) => set({ items: next });
  const patch = (id: string, p: Partial<HabitItem>) => save(items.map((h) => (h.id === id ? { ...h, ...p } : h)));

  const totalDone = items.reduce((a, h) => a + h.days.filter((d) => d === 1).length, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-ln text-dm">
              <th className="py-2 pr-2 text-left font-normal">Habit</th>
              {DAYS_SHORT.map((d, i) => (
                <th key={d} className={`w-10 py-2 text-center font-normal ${i === today && !readOnly ? 'text-tx' : ''}`}>
                  {d}
                  {i === today && !readOnly && <span className="mx-auto mt-0.5 block h-0.5 w-4 rounded bg-nt" />}
                </th>
              ))}
              <th className="w-14 py-2 text-right font-normal">%</th>
              <th className="w-16 py-2 text-right font-normal">Streak</th>
              {!readOnly && <th className="w-6" />}
            </tr>
          </thead>
          <tbody>
            {items.map((h) => {
              const done = h.days.filter((d) => d === 1).length;
              return (
                <tr key={h.id} className="group border-b border-ln">
                  <td className="py-1.5 pr-2">
                    <input className="bare" value={h.name} readOnly={readOnly} onChange={(e) => patch(h.id, { name: e.target.value })} aria-label="Nama habit" />
                  </td>
                  {h.days.map((c, i) => (
                    <td key={i} className="py-1.5 text-center">
                      <button
                        type="button"
                        disabled={readOnly}
                        aria-label={`${h.name} ${DAYS_SHORT[i]}: ${CELL_LABEL[c]}`}
                        onClick={() => patch(h.id, { days: h.days.map((x, j) => (j === i ? NEXT[x] : x)) as HabitCell[] })}
                        className={`mx-auto flex h-6 w-6 items-center justify-center rounded-[4px] border ${
                          c === 1 ? 'border-ok bg-ok text-bg' : c === 2 ? 'border-bd text-bd' : 'border-ln hover:border-dm'
                        } ${readOnly ? 'cursor-default' : ''}`}
                      >
                        {c === 1 && <Check size={14} strokeWidth={3} />}
                        {c === 2 && <X size={14} strokeWidth={2.5} />}
                      </button>
                    </td>
                  ))}
                  <td className="py-1.5 text-right tabular-nums">{pct(done, 7)}%</td>
                  <td className="py-1.5 text-right tabular-nums text-dm">{habitStreak(h.days, today)} hari</td>
                  {!readOnly && (
                    <td className="py-1.5 text-right">
                      <button type="button" aria-label="Hapus habit" onClick={() => save(items.filter((x) => x.id !== h.id))}
                        className="rounded p-0.5 text-dm opacity-0 hover:text-bd group-hover:opacity-100 focus:opacity-100">
                        <X size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <p className="py-3 text-[13px] text-dm">Belum ada habit. Ketik nama habit di bawah lalu tekan Enter.</p>
      )}
      <div className="mt-1 flex items-center gap-4">
        {!readOnly && <AddInput placeholder="+ Tambah habit" onAdd={(name) => save([...items, { id: uid(), name, days: [0, 0, 0, 0, 0, 0, 0] }])} />}
        {items.length > 0 && (
          <span className="ml-auto shrink-0 text-[12px] text-dm">
            {totalDone}/{items.length * 7} centang · klik kotak: selesai, terlewat, kosong
          </span>
        )}
      </div>
    </div>
  );
}
