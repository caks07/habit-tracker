/** @type {import('tailwindcss').Config} */
// Semua warna diambil dari token CSS (lihat src/index.css). Jangan tambah hex di komponen.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        pn: 'var(--pn)',
        hv: 'var(--hv)',
        ln: 'var(--ln)',
        tx: 'var(--tx)',
        dm: 'var(--dm)',
        nv: 'var(--nv)',
        nt: 'var(--nt)',
        ok: 'var(--ok)',
        bd: 'var(--bd)',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
