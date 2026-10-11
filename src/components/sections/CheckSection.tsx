import { useState } from 'react';
import { Check, Link2, X, CalendarDays } from 'lucide-react';
import type { CheckItem, ScheduleItem } from '../../types';
import { DAYS_SHORT } from '../../lib/date';
import { uid } from '../../lib/util';
import { useStore } from '../../store';
import { AddInput, Popover } from '../ui';
import type { SectionProps } from './types';

export function CheckSection({ section, readOnly, set }: SectionProps) {
  const items = (Array.isArray(section.items) ? section.items : []) as CheckItem[];
  const save = (next: CheckItem[]) => set({ items: next });
  const patch = (id: string, p: Partial<CheckItem>) => save(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const done = items.filter((i) => i.done).length;

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-2 flex items-center gap-2 text-[12px] text-dm">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-hv">
            <div className="h-full bg-ok" style={{ width: `${(done / items.length) * 100}%` }} />
          </div>
          {done}/{items.length}
        </div>
      )}
      <ul>
        {items.map((i) => (
          <li key={i.id} className="group flex items-start gap-2 rounded py-1 hover:bg-hv/0">
            <button
              type="button"
              disabled={readOnly}
              aria-label={i.done ? 'Tandai belum selesai' : 'Tandai selesai'}
              onClick={() => patch(i.id, { done: !i.done })}
              className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${i.done ? 'border-nt bg-nt text-bg' : 'border-dm'}`}
            >
              {i.done && <Check size={12} strokeWidth={3} />}
            </button>
            <div className="min-w-0 flex-1">
              <input
                className={`bare text-[13px] leading-snug ${i.done ? 'text-dm line-through' : ''}`}
                value={i.text}
                readOnly={readOnly}
                onChange={(e) => patch(i.id, { text: e.target.value })}
                aria-label="Tugas"
              />
              {i.scheduleLabel && (
                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-dm">
                  <CalendarDays size={11} /> {i.scheduleLabel}
                </span>
              )}
            </div>
            {!readOnly && (
              <div className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                <LinkPicker item={i} onPick={(s) => patch(i.id, s ? { scheduleId: s.id, scheduleLabel: `${DAYS_SHORT[s.day]} · ${s.title}` } : { scheduleId: undefined, scheduleLabel: undefined })} />
                <button type="button" aria-label="Hapus tugas" onClick={() => save(items.filter((x) => x.id !== i.id))} className="rounded p-1 text-dm hover:text-bd">
                  <X size={14} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="py-2 text-[13px] text-dm">Belum ada tugas. Ketik di bawah lalu tekan Enter.</p>}
      {!readOnly && <AddInput placeholder="+ Tambah tugas" onAdd={(text) => save([...items, { id: uid(), text, done: false }])} />}
    </div>
  );
}

/** Relasi satu klik: hubungkan tugas ke item jadwal mana pun. */
function LinkPicker({ item, onPick }: { item: CheckItem; onPick: (s: ScheduleItem | null) => void }) {
  const [open, setOpen] = useState(false);
  const sections = useStore((s) => s.sections);
  const schedules = sections.filter((x) => x.type === 'schedule');
  return (
    <div className="relative">
      <button type="button" aria-label="Hubungkan ke jadwal" title="Hubungkan ke jadwal" onClick={() => setOpen(!open)}
        className={`rounded p-1 hover:text-tx ${item.scheduleId ? 'text-nt' : 'text-dm'}`}>
        <Link2 size={14} />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="max-h-72 w-72 overflow-y-auto">
        <p className="px-2 py-1 text-[11px] text-dm">Hubungkan ke jadwal</p>
        {schedules.flatMap((s) => s.items as ScheduleItem[]).length === 0 && (
          <p className="px-2 py-2 text-[12px] text-dm">Belum ada jadwal. Tambah section Jadwal dulu.</p>
        )}
        {schedules.map((s) =>
          (s.items as ScheduleItem[]).slice().sort((a, b) => a.day - b.day).map((it) => (
            <button key={it.id} type="button" onClick={() => { onPick(it); setOpen(false); }}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] hover:bg-hv ${item.scheduleId === it.id ? 'text-nt' : ''}`}>
              <span className="w-8 shrink-0 text-dm">{DAYS_SHORT[it.day]}</span>
              <span className="truncate">{it.title}</span>
            </button>
          )),
        )}
        {item.scheduleId && (
          <button type="button" onClick={() => { onPick(null); setOpen(false); }} className="mt-1 w-full border-t border-ln px-2 py-1.5 text-left text-[12px] text-bd hover:bg-hv">
            Lepas relasi
          </button>
        )}
      </Popover>
    </div>
  );
}
