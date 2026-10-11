import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Link2, X } from 'lucide-react';
import { fileToDataUrl } from '../lib/util';
import { useStore } from '../store';
import type { TagColor } from '../types';

/* ---------- Tag ---------- */
export function Tag({ color, children, className = '' }: { color: TagColor; children: ReactNode; className?: string }) {
  return (
    <span className={`t-${color} tag inline-flex items-center rounded-[3px] px-1.5 py-[1px] text-[12px] leading-5 ${className}`}>
      {children}
    </span>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  onClose, children, width = 'max-w-lg', label,
}: { onClose: () => void; children: ReactNode; width?: string; label: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className={`w-full ${width} rounded-lg border border-ln bg-pn shadow-2xl`}>{children}</div>
    </div>
  );
}

/* ---------- Popover menu ---------- */
export function Popover({
  open, onClose, children, align = 'right', className = '',
}: { open: boolean; onClose: () => void; children: ReactNode; align?: 'left' | 'right'; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', h);
    window.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', h);
      window.removeEventListener('keydown', k);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={`absolute top-full z-40 mt-1 min-w-[220px] rounded-md border border-ln bg-pn p-1 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'} ${className}`}
    >
      {children}
    </div>
  );
}

export function MenuItem({
  icon: Icon, children, onClick, danger,
}: { icon?: any; children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[13px] hover:bg-hv ${danger ? 'text-bd' : 'text-tx'}`}
    >
      {Icon && <Icon size={15} className={danger ? '' : 'text-dm'} />}
      {children}
    </button>
  );
}

/* ---------- Tambah item: ketik + Enter ---------- */
export function AddInput({ placeholder, onAdd, className = '' }: { placeholder: string; onAdd: (v: string) => void; className?: string }) {
  const [v, setV] = useState('');
  return (
    <input
      className={`bare py-1.5 text-[13px] text-dm focus:text-tx ${className}`}
      placeholder={placeholder}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && v.trim()) {
          onAdd(v.trim());
          setV('');
        }
      }}
    />
  );
}

/* ---------- Pilih gambar: unggah atau URL ---------- */
export function ImagePicker({
  onPick, label = 'Ganti gambar', className = '',
}: { onPick: (src: string) => void; label?: string; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const notify = useStore((s) => s.notify);
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="flex items-center gap-1.5 rounded bg-black/55 px-2 py-1 text-[12px] text-white hover:bg-black/75"
      >
        <ImagePlus size={13} /> {label}
      </button>
      <button
        type="button"
        title="Pakai URL gambar"
        onClick={() => {
          const url = prompt('Tempel URL gambar');
          if (url?.trim()) onPick(url.trim());
        }}
        className="rounded bg-black/55 p-1.5 text-white hover:bg-black/75"
      >
        <Link2 size={13} />
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            onPick(await fileToDataUrl(f));
          } catch {
            notify('Gambar gagal dibaca. Coba file lain.');
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Tutup" className="rounded p-1 text-dm hover:bg-hv hover:text-tx">
      <X size={16} />
    </button>
  );
}

/** Textarea yang tingginya mengikuti isi */
export function AutoText({
  value, onChange, placeholder, className = '', readOnly,
}: { value: string; onChange?: (v: string) => void; placeholder?: string; className?: string; readOnly?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      readOnly={readOnly}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={`bare resize-none overflow-hidden leading-relaxed ${className}`}
    />
  );
}
