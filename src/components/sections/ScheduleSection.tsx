import { useState } from 'react';
import { Check, Columns3, Table2, Trash2, MapPin, Clock } from 'lucide-react';
import type { ScheduleItem, ScheduleStatus, TagColor } from '../../types';
import { DAYS, DAY_COLORS, todayIndex } from '../../lib/date';
import { uid } from '../../lib/util';
import { AddInput, AutoText, CloseButton, Modal, Tag } from '../ui';
import type { SectionProps } from './types';

const STATUS: Record<ScheduleStatus, { label: string; color: TagColor }> = {
  todo: { label: 'Belum mulai', color: 'gray' },
  done: { label: 'Selesai', color: 'green' },
  canceled: { label: 'Batal', color: 'red' },
};
const COLORS: TagColor[] = ['gray', 'brown', 'orange', 'green', 'blue', 'purple', 'pink', 'red'];

export function StatusTag({ status }: { status: ScheduleStatus }) {
  const s = STATUS[status];
  return (
    <Tag color={s.color} className="!rounded-full gap-1.5 px-2">
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {s.label}
    </Tag>
  );
}

export function ScheduleSection({ section, readOnly, set }: SectionProps) {
  const items = (Array.isArray(section.items) ? section.items : []) as ScheduleItem[];
  const view: 'board' | 'table' = section.meta?.view ?? 'board';
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((i) => i.id === openId);
  const today = todayIndex();

  const save = (next: ScheduleItem[]) => set({ items: next });
  const patch = (id: string, p: Partial<ScheduleItem>) => save(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const add = (day: number, title: string) =>
    save([...items, { id: uid(), title, day, start: '', end: '', place: '', tag: '', tagColor: 'gray', status: 'todo', notes: '' }]);
  const toggleDone = (i: ScheduleItem) => patch(i.id, { status: i.status === 'done' ? 'todo' : 'done' });
  const byTime = (a: ScheduleItem, b: ScheduleItem) => a.start.localeCompare(b.start);

  return (
    <div>
      <div className="mb-3 flex items-center gap-1 text-[13px]">
        {(['board', 'table'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => set({ meta: { ...section.meta, view: v } })}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${view === v ? 'bg-hv text-tx' : 'text-dm hover:bg-hv'}`}
          >
            {v === 'board' ? <Columns3 size={14} /> : <Table2 size={14} />}
            {v === 'board' ? 'Board' : 'Table'}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-dm">
          {items.filter((i) => i.status === 'done').length}/{items.filter((i) => i.status !== 'canceled').length} terlaksana
        </span>
      </div>

      {view === 'board' ? (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {DAYS.map((day, d) => {
            const list = items.filter((i) => i.day === d).sort(byTime);
            const color = DAY_COLORS[d];
            return (
              <div key={day} className={`t-${color} col-tint flex w-[252px] shrink-0 flex-col gap-2 rounded-md p-2`}>
                <div className="flex items-center gap-2 px-1 pt-0.5">
                  <Tag color={color}>{day}</Tag>
                  <span className="text-[12px]" style={{ color: 'var(--t-fg)' }}>{list.length}</span>
                  {d === today && <span className="ml-auto text-[11px] text-dm">hari ini</span>}
                </div>
                {list.map((i) => (
                  <div
                    key={i.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => !readOnly && setOpenId(i.id)}
                    onKeyDown={(e) => e.key === 'Enter' && !readOnly && setOpenId(i.id)}
                    className={`t-${color} card-tint group relative rounded-md p-3 text-tx ${readOnly ? '' : 'cursor-pointer hover:brightness-110'} ${i.status === 'canceled' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <p className={`flex-1 text-[13px] leading-snug ${i.status === 'done' ? 'line-through opacity-70' : ''}`}>{i.title}</p>
                      {!readOnly && (
                        <button
                          type="button"
                          aria-label={i.status === 'done' ? 'Tandai belum selesai' : 'Tandai selesai'}
                          onClick={(e) => { e.stopPropagation(); toggleDone(i); }}
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${i.status === 'done' ? 'border-ok bg-ok text-bg' : 'border-current opacity-50 hover:opacity-100'}`}
                        >
                          {i.status === 'done' && <Check size={12} strokeWidth={3} />}
                        </button>
                      )}
                    </div>
                    {(i.start || i.end) && <p className="mt-2 text-[12px]">{i.start}{i.end && ` - ${i.end}`}</p>}
                    {i.place && <p className="mt-1 text-[12px] opacity-80">{i.place}</p>}
                    {(i.tag || i.status !== 'todo') && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {i.tag && <Tag color={i.tagColor}>{i.tag}</Tag>}
                        {i.status !== 'todo' && <StatusTag status={i.status} />}
                      </div>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <AddInput placeholder="+ Baru" onAdd={(v) => add(d, v)} className="px-2" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-ln text-left text-dm">
                <th className="py-2 pr-3 font-normal">Kegiatan</th>
                <th className="py-2 pr-3 font-normal">Hari</th>
                <th className="py-2 pr-3 font-normal">Jam</th>
                <th className="py-2 pr-3 font-normal">Tempat</th>
                <th className="py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...items].sort((a, b) => a.day - b.day || byTime(a, b)).map((i) => (
                <tr
                  key={i.id}
                  onClick={() => !readOnly && setOpenId(i.id)}
                  className={`border-b border-ln ${readOnly ? '' : 'cursor-pointer hover:bg-hv'}`}
                >
                  <td className="py-2 pr-3 font-medium">{i.title}</td>
                  <td className="py-2 pr-3"><Tag color={DAY_COLORS[i.day]}>{DAYS[i.day]}</Tag></td>
                  <td className="py-2 pr-3 text-dm">{i.start}{i.end && ` - ${i.end}`}</td>
                  <td className="py-2 pr-3 text-dm">{i.place}</td>
                  <td className="py-2"><StatusTag status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && <AddInput placeholder="+ Tambah kegiatan (masuk ke hari ini)" onAdd={(v) => add(today, v)} />}
        </div>
      )}

      {open && !readOnly && (
        <Modal label="Detail jadwal" onClose={() => setOpenId(null)} width="max-w-xl">
          <div className="flex items-center justify-between border-b border-ln px-5 py-2.5 text-[12px] text-dm">
            <span>{section.title || 'Jadwal'}</span>
            <CloseButton onClick={() => setOpenId(null)} />
          </div>
          <div className="space-y-4 p-6">
            <input
              className="bare text-[22px] font-bold"
              value={open.title}
              onChange={(e) => patch(open.id, { title: e.target.value })}
              placeholder="Tanpa judul"
              autoFocus
            />
            <dl className="grid grid-cols-[110px_1fr] items-center gap-x-3 gap-y-2.5 text-[13px]">
              <dt className="text-dm">Hari</dt>
              <dd className="flex flex-wrap gap-1">
                {DAYS.map((d, n) => (
                  <button key={d} type="button" onClick={() => patch(open.id, { day: n })}
                    className={`rounded-[3px] ${open.day === n ? '' : 'opacity-40 hover:opacity-80'}`}>
                    <Tag color={DAY_COLORS[n]}>{d}</Tag>
                  </button>
                ))}
              </dd>
              <dt className="flex items-center gap-1.5 text-dm"><Clock size={13} /> Jam</dt>
              <dd className="flex items-center gap-2">
                <input className="bare w-20 rounded bg-hv px-2 py-1" placeholder="19.00" value={open.start} onChange={(e) => patch(open.id, { start: e.target.value })} />
                <span className="text-dm">sampai</span>
                <input className="bare w-20 rounded bg-hv px-2 py-1" placeholder="21.00" value={open.end} onChange={(e) => patch(open.id, { end: e.target.value })} />
              </dd>
              <dt className="flex items-center gap-1.5 text-dm"><MapPin size={13} /> Tempat</dt>
              <dd><input className="bare" placeholder="Kosong" value={open.place} onChange={(e) => patch(open.id, { place: e.target.value })} /></dd>
              <dt className="text-dm">Tag</dt>
              <dd className="flex items-center gap-2">
                <input className="bare w-32" placeholder="Kosong" value={open.tag} onChange={(e) => patch(open.id, { tag: e.target.value })} />
                <div className="flex gap-1">
                  {COLORS.map((c) => (
                    <button key={c} type="button" aria-label={`Warna ${c}`} onClick={() => patch(open.id, { tagColor: c })}
                      className={`t-${c} tag h-4 w-4 rounded-full ${open.tagColor === c ? 'ring-2 ring-[var(--tx)] ring-offset-1 ring-offset-[var(--pn)]' : ''}`} />
                  ))}
                </div>
              </dd>
              <dt className="text-dm">Status</dt>
              <dd className="flex gap-1.5">
                {(Object.keys(STATUS) as ScheduleStatus[]).map((s) => (
                  <button key={s} type="button" onClick={() => patch(open.id, { status: s })} className={open.status === s ? '' : 'opacity-40 hover:opacity-80'}>
                    <StatusTag status={s} />
                  </button>
                ))}
              </dd>
            </dl>
            <div className="border-t border-ln pt-4">
              <AutoText value={open.notes} onChange={(v) => patch(open.id, { notes: v })} placeholder="Tulis catatan untuk kegiatan ini…" className="min-h-[60px] text-[13px]" />
            </div>
          </div>
          <div className="flex justify-end border-t border-ln px-5 py-3">
            <button type="button" onClick={() => { save(items.filter((i) => i.id !== open.id)); setOpenId(null); }}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-bd hover:bg-hv">
              <Trash2 size={14} /> Hapus kegiatan
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
