import { useState } from 'react';
import { FileText, Plus, Trash2, X, ImageOff, UserRound } from 'lucide-react';
import type { GalleryItem, ProfileRow } from '../../types';
import { uid } from '../../lib/util';
import { AddInput, AutoText, CloseButton, ImagePicker, Modal } from '../ui';
import type { SectionProps } from './types';

/* ---------------- Galeri ---------------- */
export function GallerySection({ section, readOnly, set }: SectionProps) {
  const items = (Array.isArray(section.items) ? section.items : []) as GalleryItem[];
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((i) => i.id === openId);
  const save = (next: GalleryItem[]) => set({ items: next });
  const patch = (id: string, p: Partial<GalleryItem>) => save(items.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const addCard = () => {
    const id = uid();
    save([...items, { id, title: '', cover: '', props: [], body: '' }]);
    setOpenId(id);
  };

  return (
    <div>
      <div className="gallery-grid">
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => setOpenId(i.id)}
            className="group overflow-hidden rounded-md border border-ln bg-pn text-left hover:bg-hv"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-hv">
              {i.cover ? (
                <img src={i.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center text-dm"><ImageOff size={20} /></div>
              )}
            </div>
            <div className="flex items-start gap-2 px-3 py-2.5 text-[13px] leading-snug">
              <FileText size={14} className="mt-0.5 shrink-0 text-dm" />
              <span className={i.title ? '' : 'text-dm'}>{i.title || 'Tanpa judul'}</span>
            </div>
          </button>
        ))}
        {!readOnly && (
          <button type="button" onClick={addCard}
            className="flex min-h-[150px] items-center justify-center gap-2 rounded-md border border-dashed border-ln text-[13px] text-dm hover:bg-pn hover:text-tx">
            <Plus size={15} /> Kartu baru
          </button>
        )}
      </div>

      {open && (
        <Modal label="Halaman kartu" onClose={() => setOpenId(null)} width="max-w-3xl">
          <div className="relative">
            <div className="group/cover relative h-48 w-full overflow-hidden rounded-t-lg bg-hv">
              {open.cover && <img src={open.cover} alt="" className="h-full w-full object-cover" />}
              {!readOnly && (
                <ImagePicker
                  label={open.cover ? 'Ganti cover' : 'Tambah cover'}
                  onPick={(cover) => patch(open.id, { cover })}
                  className="absolute bottom-3 right-3 opacity-0 group-hover/cover:opacity-100 focus-within:opacity-100"
                />
              )}
            </div>
            <div className="absolute right-2 top-2 rounded bg-black/40"><CloseButton onClick={() => setOpenId(null)} /></div>
          </div>
          <div className="space-y-5 px-8 py-6 sm:px-14">
            <input
              className="bare text-[28px] font-bold leading-tight"
              value={open.title}
              readOnly={readOnly}
              onChange={(e) => patch(open.id, { title: e.target.value })}
              placeholder="Tanpa judul"
              autoFocus={!open.title}
            />
            <div className="space-y-1 text-[13px]">
              {open.props.map((p) => (
                <div key={p.id} className="group grid grid-cols-[150px_1fr_20px] items-center gap-3 rounded py-1">
                  <input className="bare text-dm" value={p.key} readOnly={readOnly} placeholder="Properti"
                    onChange={(e) => patch(open.id, { props: open.props.map((x) => (x.id === p.id ? { ...x, key: e.target.value } : x)) })} />
                  <input className="bare" value={p.value} readOnly={readOnly} placeholder="Kosong"
                    onChange={(e) => patch(open.id, { props: open.props.map((x) => (x.id === p.id ? { ...x, value: e.target.value } : x)) })} />
                  {!readOnly && (
                    <button type="button" aria-label="Hapus properti" onClick={() => patch(open.id, { props: open.props.filter((x) => x.id !== p.id) })}
                      className="text-dm opacity-0 hover:text-bd group-hover:opacity-100"><X size={13} /></button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <AddInput placeholder="+ Tambah properti (ketik nama, Enter)" onAdd={(key) => patch(open.id, { props: [...open.props, { id: uid(), key, value: '' }] })} />
              )}
            </div>
            <div className="border-t border-ln pt-5">
              <AutoText value={open.body} readOnly={readOnly} onChange={(body) => patch(open.id, { body })}
                placeholder="Tulis isi halaman…" className="min-h-[90px] text-[14px]" />
            </div>
          </div>
          {!readOnly && (
            <div className="flex justify-end border-t border-ln px-5 py-3">
              <button type="button" onClick={() => { save(items.filter((i) => i.id !== open.id)); setOpenId(null); }}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-bd hover:bg-hv">
                <Trash2 size={14} /> Hapus kartu
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Profil ---------------- */
export function ProfileSection({ section, readOnly, set }: SectionProps) {
  const rows = (Array.isArray(section.items) ? section.items : []) as ProfileRow[];
  const save = (next: ProfileRow[]) => set({ items: next });
  const photo: string = section.meta?.photo ?? '';
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="group relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-[4px] bg-hv sm:w-48">
        {photo ? <img src={photo} alt="Foto profil" className="h-full w-full object-cover" /> : (
          <div className="flex h-full items-center justify-center text-dm"><UserRound size={32} /></div>
        )}
        {!readOnly && (
          <ImagePicker label="Ganti foto" onPick={(p) => set({ meta: { ...(section.meta || {}), photo: p } })}
            className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2.5 pt-1 text-[13px]">
        {rows.map((r) => (
          <div key={r.id} className="group grid grid-cols-[110px_12px_1fr_16px] items-center gap-1">
            <input className="bare text-dm" value={r.key} readOnly={readOnly} onChange={(e) => save(rows.map((x) => (x.id === r.id ? { ...x, key: e.target.value } : x)))} aria-label="Label" />
            <span className="text-dm">:</span>
            <input className="bare" value={r.value} readOnly={readOnly} placeholder="Kosong" onChange={(e) => save(rows.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))} aria-label={r.key} />
            {!readOnly && (
              <button type="button" aria-label="Hapus baris" onClick={() => save(rows.filter((x) => x.id !== r.id))} className="text-dm opacity-0 hover:text-bd group-hover:opacity-100"><X size={13} /></button>
            )}
          </div>
        ))}
        {!readOnly && <AddInput placeholder="+ Tambah baris" onAdd={(key) => save([...rows, { id: uid(), key, value: '' }])} />}
      </div>
    </div>
  );
}

/* ---------------- Gambar (Independent Content Block - PART 12) ---------------- */
export function ImageSection({ section, readOnly, set }: SectionProps) {
  const meta = section.meta || section.config || {};
  const { src = '', caption = '', fit = 'cover', height = '340' } = meta;
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const handleApplyUrl = () => {
    if (!urlDraft.trim()) return;
    set({
      meta: { ...meta, src: urlDraft.trim() },
      config: { ...meta, src: urlDraft.trim() },
    });
    setUrlDraft('');
    setShowUrlInput(false);
  };

  const maxHeightStyle = height === 'auto' ? 'none' : `${height}px`;

  return (
    <figure className="space-y-2">
      <div className="group relative overflow-hidden rounded-md bg-hv/40 border border-ln/60">
        {src ? (
          <div
            style={{ maxHeight: maxHeightStyle }}
            className="w-full overflow-hidden flex items-center justify-center bg-black/10"
          >
            <img
              src={src}
              alt={caption}
              style={{ maxHeight: maxHeightStyle }}
              className={`w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-300`}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-[13px] text-dm">
            <ImageOff size={24} className="text-dm/60" />
            <span className="text-[12px]">Unggah gambar atau masukkan tautan URL</span>
            {!readOnly && (
              <div className="flex items-center gap-2 mt-1">
                <ImagePicker
                  label="Pilih File"
                  onPick={(s) => set({ meta: { ...meta, src: s }, config: { ...meta, src: s } })}
                />
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="rounded border border-ln bg-bg px-2.5 py-1 text-[11px] text-tx hover:border-nt transition-colors"
                >
                  Tempel URL
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hover Controls for Image Settings */}
        {!readOnly && src && (
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-md text-white text-[11px]">
            {/* Fit toggle */}
            <button
              type="button"
              onClick={() => {
                const nextFit = fit === 'cover' ? 'contain' : 'cover';
                set({ meta: { ...meta, fit: nextFit }, config: { ...meta, fit: nextFit } });
              }}
              className="px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors"
              title="Ubah mode gambar: Cover atau Contain"
            >
              Fit: {fit}
            </button>

            {/* Height toggle */}
            <button
              type="button"
              onClick={() => {
                const nextHeight = height === '200' ? '340' : height === '340' ? '460' : height === '460' ? 'auto' : '200';
                set({ meta: { ...meta, height: nextHeight }, config: { ...meta, height: nextHeight } });
              }}
              className="px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors"
              title="Ubah tinggi gambar"
            >
              H: {height === 'auto' ? 'Auto' : `${height}px`}
            </button>

            {/* Change image */}
            <ImagePicker
              label="Ganti"
              onPick={(s) => set({ meta: { ...meta, src: s }, config: { ...meta, src: s } })}
              className="px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer"
            />

            {/* Remove image */}
            <button
              type="button"
              onClick={() => set({ meta: { ...meta, src: '' }, config: { ...meta, src: '' } })}
              className="px-1.5 py-0.5 text-red-300 hover:bg-red-500/40 rounded transition-colors"
              title="Hapus gambar"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}

        {/* URL Input Form Modal / Popover */}
        {showUrlInput && (
          <div className="p-3 bg-pn border-t border-ln flex items-center gap-2">
            <input
              type="text"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
              placeholder="https://example.com/image.jpg"
              className="bare flex-1 rounded border border-ln bg-bg px-2.5 py-1 text-[12px]"
              autoFocus
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="rounded bg-nv px-2.5 py-1 text-[11px] font-semibold text-nt"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="text-dm hover:text-tx text-[11px] px-1"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Caption */}
      <figcaption className="text-center">
        <input
          className="bare text-[12px] text-dm text-center hover:text-tx focus:text-tx transition-colors"
          value={caption}
          readOnly={readOnly}
          placeholder="Tulis keterangan gambar (opsional)..."
          onChange={(e) =>
            set({
              meta: { ...meta, caption: e.target.value },
              config: { ...meta, caption: e.target.value },
            })
          }
        />
      </figcaption>
    </figure>
  );
}

/* ---------------- Divider Bergaris Diagonal (Screenshot 1 & 3) ---------------- */
export function DividerSection({ section }: SectionProps) {
  return (
    <div className="py-1">
      <div className="h-6 w-full rounded bg-[#243857]/90 text-[#4f9de0]/50 font-mono text-[13px] font-bold tracking-tight overflow-hidden flex items-center px-3 select-none">
        <span className="whitespace-nowrap overflow-hidden">
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        </span>
      </div>
    </div>
  );
}

/* ---------------- Clock Widget (Screenshot 4 & Today) ---------------- */
export function ClockSection({ section }: SectionProps) {
  const [time, setTime] = useState(new Date());

  useState(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="flex flex-col items-center justify-center py-4 select-none">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {/* Radar Arcs like Indify and Screenshot 4 */}
          <path
            d="M 50 10 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="var(--ln)"
            strokeWidth="1.2"
            strokeDasharray="2,2"
          />
          <path
            d="M 50 20 A 30 30 0 0 1 80 50"
            fill="none"
            stroke="var(--ln)"
            strokeWidth="1.2"
          />
          <path
            d="M 50 30 A 20 20 0 0 1 70 50"
            fill="none"
            stroke="var(--ln)"
            strokeWidth="1.2"
          />
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--ln)" strokeWidth="1" />
          
          {/* Hour hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 22 * Math.sin((hourDeg * Math.PI) / 180)}
            y2={50 - 22 * Math.cos((hourDeg * Math.PI) / 180)}
            stroke="var(--tx)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 34 * Math.sin((minuteDeg * Math.PI) / 180)}
            y2={50 - 34 * Math.cos((minuteDeg * Math.PI) / 180)}
            stroke="var(--tx)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Second hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 38 * Math.sin((secondDeg * Math.PI) / 180)}
            y2={50 - 38 * Math.cos((secondDeg * Math.PI) / 180)}
            stroke="#4f9de0"
            strokeWidth="1"
          />
          <circle cx="50" cy="50" r="2.5" fill="var(--tx)" />
        </svg>
      </div>

      <div className="mt-2 text-[15px] font-bold tracking-wider text-tx">
        {timeStr}
      </div>
      <div className="text-[11px] text-dm">Indify Clock Widget</div>
    </div>
  );
}

/* ---------------- Quote Section ---------------- */
export function QuoteSection({ section, readOnly, set }: SectionProps) {
  const quote = section.meta?.quote || 'You failed, it’s okay to fail, just admit it, whatever it is, but don’t fail twice in the same thing.';
  const author = section.meta?.author || 'Caks';

  return (
    <div className="border-l-2 border-nv pl-4 py-2 my-1">
      <blockquote className="text-[14px] text-tx italic leading-relaxed">
        "{quote}"
      </blockquote>
      <div className="mt-2 text-[12px] text-dm font-mono">— {author}</div>
    </div>
  );
}

