import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store';
import { Modal, CloseButton } from '../ui';

export function ConfirmModal() {
  const confirm = useStore((s) => s.confirm);
  const ask = useStore((s) => s.ask);

  if (!confirm) return null;

  return (
    <Modal label="Konfirmasi aksi" onClose={() => ask(null)} width="max-w-md">
      <div className="flex items-center justify-between border-b border-ln px-5 py-3 text-[13px] font-mono font-semibold">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className={confirm.danger ? 'text-bd' : 'text-nt'} />
          <span>{confirm.title}</span>
        </div>
        <CloseButton onClick={() => ask(null)} />
      </div>

      <div className="p-5 font-mono text-[13px] space-y-3 leading-relaxed">
        {confirm.body && <p className="text-tx">{confirm.body}</p>}

        {confirm.points && confirm.points.length > 0 && (
          <ul className="rounded bg-bg border border-ln p-3 space-y-1.5 text-[12px] text-dm">
            {confirm.points.map((pt, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-ok shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-ln px-5 py-3 font-mono text-[12px]">
        <button
          type="button"
          onClick={() => ask(null)}
          className="rounded px-3 py-1.5 text-dm hover:text-tx hover:bg-hv"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => {
            const act = confirm.onConfirm;
            ask(null);
            act();
          }}
          className={`rounded px-3.5 py-1.5 font-semibold text-white ${
            confirm.danger ? 'bg-bd hover:brightness-110' : 'bg-nt hover:brightness-110'
          }`}
        >
          {confirm.confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded border border-ln bg-pn px-3.5 py-2 font-mono text-[12px] text-tx shadow-lg animate-fade-in flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-ok" />
      <span>{toast}</span>
    </div>
  );
}
