import { Download, Moon, RefreshCw, Sun, Trash2 } from 'lucide-react';
import { useStore } from '../../store';

export function SettingsView() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const resetDemo = useStore((s) => s.resetDemo);
  const page = useStore((s) => s.page);
  const setPage = useStore((s) => s.setPage);
  const ask = useStore((s) => s.ask);
  const notify = useStore((s) => s.notify);
  const tables = useStore((s) => s.tables);
  const sections = useStore((s) => s.sections);
  const history = useStore((s) => s.history);

  const handleExportJson = () => {
    const data = { page, tables, sections, history };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholar-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Backup JSON berhasil diunduh');
  };

  const handleReset = () => {
    ask({
      title: 'Reset seluruh data ke demo awal?',
      body: 'Semua perubahan pada Source Tables, Linked Views, dan History akan dikembalikan ke data default.',
      confirmLabel: 'Reset Demo',
      danger: true,
      onConfirm: resetDemo,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 font-mono space-y-8">
      {/* Header */}
      <div className="border-b border-ln/70 pb-4">
        <h1 className="text-2xl font-bold text-tx">Pengaturan Workspace</h1>
        <p className="mt-1 text-[13px] text-dm">
          Sesuaikan tema, kelola data, dan backup sistem personal planner.
        </p>
      </div>

      <div className="space-y-6 text-[13px]">
        {/* Workspace Info */}
        <div className="rounded-lg border border-ln/70 bg-pn/40 p-5 space-y-4">
          <h2 className="font-bold text-tx text-[14px]">Profil Workspace</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-dm mb-1">Nama Workspace</label>
              <input
                type="text"
                value={page.title}
                onChange={(e) => setPage({ title: e.target.value })}
                className="w-full rounded border border-ln bg-bg px-3 py-1.5 text-tx"
              />
            </div>
            <div>
              <label className="block text-[12px] text-dm mb-1">Nama Pemilik</label>
              <input
                type="text"
                value={page.owner}
                onChange={(e) => setPage({ owner: e.target.value })}
                className="w-full rounded border border-ln bg-bg px-3 py-1.5 text-tx"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-lg border border-ln/70 bg-pn/40 p-5 space-y-4">
          <h2 className="font-bold text-tx text-[14px]">Tampilan Tema</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 rounded border px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'border-nt bg-nv text-nt font-semibold'
                  : 'border-ln bg-bg text-tx hover:bg-hv'
              }`}
            >
              <Moon size={15} /> Dark Mode (Scholar Default)
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 rounded border px-4 py-2 transition-colors ${
                theme === 'light'
                  ? 'border-nt bg-nv text-nt font-semibold'
                  : 'border-ln bg-bg text-tx hover:bg-hv'
              }`}
            >
              <Sun size={15} /> Light Mode
            </button>
          </div>
        </div>

        {/* Data Management & Backup */}
        <div className="rounded-lg border border-ln/70 bg-pn/40 p-5 space-y-4">
          <h2 className="font-bold text-tx text-[14px]">Backup & Reset Data</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-2 rounded border border-ln bg-bg px-4 py-2 text-tx hover:bg-hv transition-colors"
            >
              <Download size={15} /> Ekspor Cadangan Data (JSON)
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded border border-bd/40 bg-bd/10 px-4 py-2 text-bd hover:bg-bd/20 transition-colors"
            >
              <RefreshCw size={15} /> Reset ke Data Awal Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
