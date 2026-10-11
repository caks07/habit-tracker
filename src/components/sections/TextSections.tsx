import { X } from 'lucide-react';
import type { AutoMetric, ProgressItem } from '../../types';
import { useStore } from '../../store';
import { computeAuto, pct } from '../../lib/sections';
import { uid } from '../../lib/util';
import { AddInput, AutoText } from '../ui';
import type { SectionProps } from './types';

export function NoteSection({ section, readOnly, set }: SectionProps) {
  return (
    <AutoText
      readOnly={readOnly}
      value={section.meta?.text ?? ''}
      onChange={(text) => set({ meta: { ...(section.meta || {}), text } })}
      placeholder="Tulis apa saja. Refleksi, ide, atau catatan minggu ini."
      className="min-h-[80px] whitespace-pre-wrap text-[13px]"
    />
  );
}

function Bar({ label, value, max, onChange, onRemove }: AutoMetric & { onChange?: (v: number) => void; onRemove?: () => void }) {
  const p = pct(value, max);
  return (
    <div className="group">
      <div className="mb-1 flex items-baseline gap-2 text-[13px]">
        <span className="flex-1 truncate">{label}</span>
        <span className="tabular-nums text-dm">{max === 100 ? `${value}%` : `${value}/${max}`}</span>
        {onRemove && (
          <button type="button" aria-label="Hapus metrik" onClick={onRemove} className="text-dm opacity-0 hover:text-bd group-hover:opacity-100">
            <X size={13} />
          </button>
        )}
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-hv">
        <div className="h-full rounded-full bg-nt" style={{ width: `${p}%` }} />
      </div>
      {onChange && (
        <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`Ubah ${label}`} className="mt-1 h-1 w-full cursor-pointer accent-[var(--nt)] opacity-0 group-hover:opacity-100 focus:opacity-100" />
      )}
    </div>
  );
}

export function ProgressSection({ section, readOnly, set }: SectionProps) {
  const live = useStore((s) => s.sections);
  const items = Array.isArray(section.items) ? (section.items as ProgressItem[]) : [];
  const auto: AutoMetric[] = section.meta?.auto ? (readOnly ? section.meta?.frozen ?? [] : computeAuto(live)) : [];
  const all = [...auto, ...items];
  const overall = all.length ? Math.round(all.reduce((a, m) => a + pct(m.value, m.max), 0) / all.length) : 0;
  const save = (next: ProgressItem[]) => set({ items: next });

  return (
    <div>
      <div className="mb-4 flex items-end gap-3">
        <span className="text-[34px] font-semibold leading-none tabular-nums">{overall}%</span>
        <span className="pb-1 text-[12px] text-dm">rata-rata semua metrik</span>
      </div>
      <div className="space-y-3">
        {auto.map((m) => <Bar key={m.label} {...m} />)}
        {items.map((m) => (
          <Bar key={m.id} {...m}
            onChange={readOnly ? undefined : (v) => save(items.map((x) => (x.id === m.id ? { ...x, value: v } : x)))}
            onRemove={readOnly ? undefined : () => save(items.filter((x) => x.id !== m.id))} />
        ))}
      </div>
      {all.length === 0 && <p className="text-[13px] text-dm">Tambah habit, tugas, atau jadwal. Progress terhitung otomatis.</p>}
      {!readOnly && (
        <div className="mt-2 flex items-center gap-3">
          <AddInput placeholder="+ Tambah metrik manual" onAdd={(label) => save([...items, { id: uid(), label, value: 0, max: 100 }])} />
          <label className="flex shrink-0 items-center gap-1.5 text-[12px] text-dm">
            <input type="checkbox" checked={!!section.meta?.auto} onChange={(e) => set({ meta: { ...(section.meta || {}), auto: e.target.checked } })} className="accent-[var(--nt)]" />
            Otomatis
          </label>
        </div>
      )}
    </div>
  );
}

/* ---------------- Heading Content Block ---------------- */
export function HeadingSection({ section, readOnly, set }: SectionProps) {
  const text = section.meta?.text ?? section.title ?? 'Heading';
  return (
    <div className="py-2 border-b border-ln/60">
      <input
        className="bare text-xl font-bold tracking-tight text-tx placeholder:text-dm/60"
        value={text}
        readOnly={readOnly}
        placeholder="Judul Heading..."
        onChange={(e) => set({ meta: { ...(section.meta || {}), text: e.target.value }, title: e.target.value })}
      />
    </div>
  );
}

/* ---------------- Callout Content Block ---------------- */
export function CalloutSection({ section, readOnly, set }: SectionProps) {
  const text = section.meta?.text ?? 'Catatan penting atau fokus utama minggu ini.';
  const icon = section.meta?.icon ?? '💡';

  return (
    <div className="flex items-start gap-3 rounded-lg border-l-3 border-nt bg-nv/20 p-4 text-[13px] leading-relaxed text-tx">
      <span className="text-base select-none shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <AutoText
          readOnly={readOnly}
          value={text}
          onChange={(t) => set({ meta: { ...(section.meta || {}), text: t } })}
          placeholder="Tulis pesan callout penting..."
          className="bare text-[13px] leading-relaxed"
        />
      </div>
    </div>
  );
}

/* ---------------- Bookmark Content Block ---------------- */
export function BookmarkSection({ section, readOnly, set }: SectionProps) {
  const url = section.meta?.url ?? '';
  const title = section.meta?.title ?? 'Tautan Web / Bookmark';
  const desc = section.meta?.desc ?? 'Klik untuk membuka tautan eksternal';

  return (
    <div className="rounded-lg border border-ln/70 bg-pn/40 p-3 flex flex-col gap-1.5 hover:border-nt transition-colors">
      <div className="flex items-center justify-between gap-2">
        <input
          className="bare font-semibold text-tx text-[13px]"
          value={title}
          readOnly={readOnly}
          placeholder="Judul Bookmark"
          onChange={(e) => set({ meta: { ...(section.meta || {}), title: e.target.value } })}
        />
        {url && (
          <a
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-nt hover:underline shrink-0"
          >
            Buka ↗
          </a>
        )}
      </div>
      <input
        className="bare text-[12px] text-dm"
        value={desc}
        readOnly={readOnly}
        placeholder="Deskripsi singkat..."
        onChange={(e) => set({ meta: { ...(section.meta || {}), desc: e.target.value } })}
      />
      <input
        className="bare text-[11px] text-nt/80 pt-1 border-t border-ln/40"
        value={url}
        readOnly={readOnly}
        placeholder="https://example.com"
        onChange={(e) => set({ meta: { ...(section.meta || {}), url: e.target.value } })}
      />
    </div>
  );
}

/* ---------------- Spacer Content Block ---------------- */
export function SpacerSection({ section }: SectionProps) {
  const height = section.meta?.height ?? 32;
  return <div style={{ height: `${height}px` }} className="w-full" />;
}

