# CLAUDE.md — Modular Planner

Planner modular ala Notion untuk habit mingguan. Bukan clone Notion: fokusnya
Plan → Execute → Track → Restart → Archive → Review. Acuan: `PRD___Modular_Personal_Planner___Weekly_Progress_Tracker.md` dan `konsep.txt`.

## Aturan produk
- Semua fitur adalah **section** dengan `type` (check, habit, schedule, note, progress). Tipe baru = renderer baru, tanpa ubah engine.
- **Restart bukan delete.** Snapshot section masuk History (read-only), lalu progress dikosongkan. Struktur (daftar habit, jadwal) dipertahankan.
- Relasi antar tabel harus bisa dibuat dalam satu klik (contoh: tugas → item jadwal lewat dropdown), tanpa konfigurasi property.
- Tambah item maksimal: ketik + Enter. Tambah section maksimal 2 klik.
- Export PDF dibuat dari data terstruktur (bukan screenshot). Prototype memakai print CSS; versi final lewat Puppeteer.
- Aksi destruktif (restart, hapus) selalu pakai konfirmasi.

## Stack target
React + TypeScript + Vite + Tailwind, dnd-kit, Recharts, TanStack Query + Zustand. Backend Laravel + PostgreSQL. Lihat PRD §55–60.

## Urutan kerja
1. Prototype UI (`planner.html`) → 2. port ke React → 3. API + DB → 4. PDF server-side.

## Perintah
`npm run dev`, `npm run build`, `npm run lint` (setelah port ke Vite).
