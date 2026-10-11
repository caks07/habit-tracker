# web/CLAUDE.md — aturan UI (anti AI-slop)

Arah visual dari Notion "Scholar" milik Arga: gelap, font monospace, header section biru-navy, whitespace lega. Ikuti ini, jangan default generik.

## Wajib
- Satu keluarga font (IBM Plex Mono). Skala tipe jelas, panjang baris < 80 karakter.
- Warna dari token CSS (`--bg --pn --ln --tx --dm --nv --nt --ok --bd`). Dilarang hex baru di komponen. Dukung light dan dark.
- Header section navy adalah satu-satunya elemen khas. Elemen lain tenang.
- Teks UI: kalimat biasa, kata kerja aktif ("Tambah tugas", "Restart"), konsisten dari tombol sampai toast. Empty state menjelaskan langkah berikutnya.
- Fokus keyboard terlihat, hormati `prefers-reduced-motion`, responsif sampai mobile (grid jadi 1 kolom).

## Dilarang
- Label ALL-CAPS dengan letter-spacing lebar, eyebrow di atas tiap heading, penomoran 01/02/03 untuk konten non-urut.
- Emoji sebagai ikon, gradient dekoratif, bayangan abu sama di semua card, radius sama di semua elemen.
- Satu kata di heading diberi warna/italic berbeda. Tanda "→" di setiap tombol. Animasi fade-slide di tiap section.
- Latar krem + serif + aksen terracotta; hitam + hijau neon.

## Gerak
Hanya sebagai respons aksi pengguna (buka dialog, toggle). Tidak ada animasi otomatis saat load.

## Data
Tipe section didefinisikan satu tempat. State layout = JSON `{id, type, title, span(3-12), items}`. History read-only.
