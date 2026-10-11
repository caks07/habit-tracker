# CLAUDE.md — Modular Planner (nama kerja: "Scholar OS")

Dokumen ini adalah sumber kebenaran tunggal untuk proyek ini: konsep, UI, data model, aturan desain, dan aturan kerja Claude Code. Baca seluruhnya sebelum menulis kode. Kalau ada konflik dengan file lain, dokumen ini menang. Dokumen pendukung: `PRD___Modular_Personal_Planner___Weekly_Progress_Tracker.md` dan `konsep.txt`.

Bahasa UI: Indonesia. Bahasa kode, nama variabel, nama file, commit: Inggris.

---

## 1. Apa produk ini

Web app perencana personal yang tampilannya mirip halaman Notion "Scholar" milik Arga (dark, monospace, banner biru navy, board per hari, gallery, timeline, calendar), tetapi:

- menambah section cukup satu klik, tanpa konsep block / database / view / filter;
- satu section bisa ditampilkan sebagai tabel, board, gallery, timeline, atau calendar tanpa membuat ulang data;
- relasi antar tabel nyata seperti Notion, tapi dibuat lewat satu menu dan otomatis dua arah;
- setiap section bisa **Mulai ulang** (kosong lagi untuk minggu/siklus berikutnya) tanpa kehilangan data lama;
- semua data lama tersimpan di **Riwayat** dan bisa diekspor jadi **laporan PDF mingguan**.

Posisi produk: *modular personal planner yang mengubah aktivitas harian jadi riwayat performa mingguan.* Bukan clone Notion. Jangan menambah fitur yang membuat produk ini jadi editor dokumen umum.

Loop inti, semua keputusan desain harus melayani loop ini:

```
Rencanakan → Jalankan harian → Lacak progres → Review mingguan → Ekspor PDF → Arsipkan → Mulai ulang
```

Prinsip yang menentukan benar/salah:

> Pengguna harus lebih banyak mengerjakan rencananya daripada mengurus sistemnya.
> Menambah task butuh lebih dari 3 interaksi = UX salah.
> Mulai ulang minggu butuh input ulang data = arsitektur salah.
> Menyusun laporan manual = fitur laporan salah.

---

## 2. Referensi: apa yang ada di halaman Scholar

Setiap blok di halaman referensi harus punya padanan di app ini.

| Di Scholar (Notion) | Padanan di app | Catatan |
|---|---|---|
| Cover + ikon + judul "Scholar" | Header workspace: cover, ikon, judul | Cover dan ikon boleh diunggah / dipilih |
| Kutipan (quote block) | Section **Catatan** varian kutipan | Satu blok teks bergaris kiri |
| About me: foto + daftar `Name : Arga` | Section **Profil** | Foto + pasangan label/nilai, tanpa tabel |
| Widget cuaca & jam (Indify) | Section **Widget**: jam analog, cuaca | Pasca-MVP. Jam dulu, cuaca belakangan |
| Main Activity: gallery kartu bergambar | Section **Tabel** tampilan Gallery | Kartu = baris data, gambar = cover baris |
| Halaman baris: properti Event, Sesi, Achive + sub-tabel Schedule | **Halaman baris** + panel **Terkait** | Sub-tabel muncul otomatis dari relasi, tanpa setup filter |
| Schedule: board per hari dengan hitungan | Section **Jadwal** tampilan Board dikelompokkan per hari | Kolom hari punya warna sendiri |
| To do List Harian: board per hari, tag Olahraga/Hiburan/Skripsi/Kuliah, jam, status Not started/Canceled, tautan ke item lain | Section **Tugas harian** | Tag, jam, status, relasi |
| Milestone Skripsi: timeline Juli–Agustus | Tampilan **Timeline** | Bar berdasarkan rentang tanggal |
| Callout "Update setiap Minggu" + tabel Belajar Coding (Topik, Hari, Jam, Kategori, Status) | Section **Tabel** + Catatan varian callout | |
| Calendar bulan Oktober 2026, hari ini ditandai lingkaran koral | Tampilan **Calendar** | Hari ini = lingkaran koral |
| Tiap database punya tab view: Gallery/Table, Board/Table, Timeline/Table, Calendar/Table | **Tampilan** per section | Satu data, banyak tampilan, ganti lewat tab |

Intinya: satu halaman berisi banyak sistem sekaligus, tersusun dalam kolom, dan tiap sistem punya beberapa cara melihat data yang sama. Itu yang harus terasa.

---

## 3. Konsep inti

### 3.1 Istilah (pakai konsisten di UI dan kode)

| Istilah UI | Istilah kode | Arti |
|---|---|---|
| Section | `Section` | Satu kotak di dashboard |
| Jenis | `section.kind` | `table`, `habit`, `checklist`, `schedule`, `notes`, `profile`, `progress`, `widget` |
| Kolom | `Field` | Properti sebuah tabel |
| Baris | `Record` | Satu entri data |
| Tampilan | `View` | Tabel, board, gallery, timeline, calendar |
| Relasi | `Relation` | Tautan antar baris dari dua section |
| Periode | `Period` | Satu siklus (default 1 minggu, Senin–Minggu) |
| Mulai ulang | `restart` | Arsipkan periode aktif lalu buka periode baru |
| Riwayat | `History` | Periode terarsip, baca saja |

Jangan pakai kata "block", "database", "page", "property", "rollup" di UI. Itu bahasa Notion.

### 3.2 Section = data + tampilan

Section jenis `habit`, `checklist`, `schedule` adalah **tabel yang sudah dikonfigurasi** (kolom dan tampilan default terpasang). Section `table` adalah kanvas kosong. Satu mesin melayani semuanya; jenis baru = preset baru.

```
Section
├── kind, title, icon, cover
├── fields[]      kolom (skema)
├── records[]     baris (data)
├── views[]       tampilan tersimpan (tipe, pengelompokan, urutan, filter)
└── reset policy  aturan apa yang dikosongkan saat Mulai ulang
```

### 3.3 Struktur vs data periode (keputusan arsitektur, tidak boleh diubah)

```
Struktur (tetap)             Data periode (berganti)
Habit: Lari, Baca, SQL       Minggu 40: Lari 5/7, Baca 7/7, SQL 6/7
                             Minggu 41: kosong, siap diisi
```

Mulai ulang **bukan** hapus lalu buat ulang. Mulai ulang = snapshot → arsipkan → periode baru dengan struktur yang sama.

---

## 4. Layout engine (Section Builder)

### 4.1 Model

```
Canvas → Row[] → Column[] (span 1–12) → Section[] (ditumpuk vertikal)
```

```ts
type Layout = {
  rows: { id: string; cols: { id: string; span: number; sectionIds: string[] }[] }[]
}
```

Grid 12 kolom. Preset lebar: 25 / 33 / 50 / 66 / 75 / 100 persen. Di layar < 768px semua kolom menumpuk jadi satu.

### 4.2 Menambah section (harus lebih mudah dari Notion)

1. Tombol **Tambah section** di bawah canvas, dan garis **+** yang muncul di celah antar section ("sisipkan di sini").
2. Picker muncul dengan pratinjau kecil tiap jenis. Pilih → section langsung muncul dengan judul siap diketik. Tidak ada langkah konfigurasi wajib.
3. Pilihan: Tabel, Kebiasaan, Checklist, Jadwal, Catatan, Profil, Progres, Widget, Section kosong.
4. Tata letak cepat di atas picker: 1 kolom, 2 kolom, 3 kolom. Membuat baris dengan kolom kosong yang bisa diisi.
5. Seret section ke tepi kiri/kanan section lain untuk membuat kolom baru (seperti Notion), ke atas/bawah untuk menyisipkan baris.
6. `Ctrl/Cmd + K` membuka palet perintah (tambah section, buka riwayat, ekspor).

Aturan: dari klik "Tambah section" sampai bisa mengetik di section baru maksimal 2 klik.

### 4.3 Menu section (`⋮`, muncul saat hover/fokus)

Ganti nama, Tampilan, Lebar, Duplikat, Pindah, Arsipkan, **Mulai ulang**, Hapus. Mulai ulang dan Hapus dipisah garis; Hapus berwarna bahaya dan selalu minta konfirmasi.

### 4.4 Drag, resize

- dnd-kit. Indikator drop = garis biru 2px, bukan bayangan.
- Resize lewat gagang di tepi kolom (snap ke grid 12) atau preset di menu.
- Data section tidak boleh berubah saat dipindah.

---

## 5. Tabel, tampilan, dan relasi

### 5.1 Tipe kolom (MVP)

Teks, Angka, Pilih satu, Pilih banyak (tag), Tanggal, Rentang tanggal, Jam (mulai–selesai), Centang, Status, URL, Gambar (cover baris), **Relasi**, **Ringkasan**.

Status tetap: `Belum mulai` (abu), `Berjalan` (biru), `Selesai` (hijau), `Dibatalkan` (merah).

### 5.2 Tampilan

| Tampilan | Butuh | Contoh referensi |
|---|---|---|
| Tabel | apa saja | Belajar Coding |
| Board | kolom Pilih satu / Status sebagai pengelompok | Schedule per hari, To do per hari |
| Gallery | kolom Gambar (opsional) | Main Activity |
| Timeline | Rentang tanggal | Milestone Skripsi |
| Calendar | Tanggal | Calendar Oktober 2026 |

Ganti tampilan lewat tab di atas section (`Gallery | Tabel`). Jika kolom syarat belum ada, app menawarkan membuatnya satu klik ("Timeline butuh rentang tanggal. Tambah kolom Tanggal?"). Tidak ada layar kosong membingungkan.

Board per hari memakai kolom **Hari** (Senin…Minggu); kolom hari mendapat tint warna (§7.2).

### 5.3 Relasi (fitur pembeda utama, jangan disederhanakan jadi teks)

Tujuan: relasi nyata seperti Notion, tanpa membaca dokumentasi.

**Membuat relasi**
1. Di header kolom pilih tipe **Relasi**.
2. Muncul daftar section yang ada, plus **Buat section baru** (langsung membuat tabel baru dan menautkannya).
3. Satu toggle: **Tampilkan juga di section tujuan** (default menyala) → kolom balik dibuat otomatis, relasi selalu dua arah.
4. Selesai. Tidak ada konfigurasi lain.

**Mengisi relasi**
- Klik sel → popover dengan kotak cari dan daftar baris tujuan. Jika tidak ada, tombol **Buat "teks yang diketik"** membuat baris baru di section tujuan tanpa pindah halaman.
- Hasil tampil sebagai chip. Klik chip membuka halaman baris tujuan.
- Satu atau banyak tautan lewat satu pilihan di pengaturan kolom: "Boleh banyak".

**Terkait otomatis**
- Halaman baris punya panel **Terkait**: semua baris dari section lain yang menunjuk ke baris ini, dikelompokkan per section, dengan kolom penting dan tombol **Tambah**. Ini menggantikan "linked database + filter manual" Notion. Contoh: buka kartu "Bootcamp Data Analyst with Excel" → langsung terlihat jadwal Selasa dan Jumat yang terkait.

**Ringkasan (pengganti rollup)**
- Hanya pilihan siap pakai: Jumlah baris terkait, Jumlah selesai, Persen selesai, Total jam. Tanpa rumus bebas di MVP.
- Progres section dan laporan PDF memakai ringkasan ini.

**Aturan integritas**
- Hapus baris yang punya relasi: dialog menyebut berapa tautan yang akan terputus.
- Relasi menyimpan `record_id`, bukan teks. Ganti nama baris tujuan memperbarui semua chip.
- Saat snapshot, label relasi disalin sebagai teks supaya Riwayat tidak berubah ketika data tujuan diganti/dihapus.

---

## 6. Siklus mingguan, Mulai ulang, Riwayat

### 6.1 Periode

- Default: 1 minggu, Senin–Minggu, zona waktu `Asia/Jakarta`, nomor minggu ISO.
- Contoh: Minggu 40 = 28 Sep – 4 Okt 2026. Minggu 41 = 5 – 11 Okt 2026 (aktif pada 6 Okt 2026).
- Tiap section punya periode sendiri (`section.active_period_id`) agar **Mulai ulang per section** bisa dilakukan. Tombol **Mulai ulang semua** di header mengulang semua section sekaligus.

### 6.2 Kebijakan reset per kolom

Setiap kolom punya penanda `resets_on_restart`:

| Jenis kolom | Default saat Mulai ulang |
|---|---|
| Centang, Status, log kebiasaan | Kembali ke nilai awal |
| Catatan harian, Angka progres | Dikosongkan |
| Judul baris, Hari, Jam, Kategori, Relasi struktural | Dipertahankan |

Dialog menawarkan dua mode:

- **Reset progres saja** (default): struktur tetap, centang/status kembali kosong. Cocok untuk kebiasaan dan jadwal berulang.
- **Kosongkan semua baris**: tabel benar-benar kosong ("kosong lagi"). Cocok untuk daftar sekali pakai.

### 6.3 Alur Mulai ulang (atomik)

```
Validasi periode aktif
   ↓
Snapshot JSON section (skema + baris + label relasi + ringkasan)
   ↓
Tandai periode lama archived
   ↓
Buat periode baru active
   ↓
Salin struktur, reset kolom sesuai kebijakan
   ↓
Kembalikan periode baru
```

Satu transaksi. Gagal di langkah mana pun = rollback total. Tidak pernah `DELETE` data periode lama.

Dialog konfirmasi:

```
Mulai ulang "Kebiasaan"?

Data minggu 41 (5 – 11 Okt) disimpan ke Riwayat.
Struktur tetap, progres dikosongkan.

( ) Reset progres saja     ( ) Kosongkan semua baris

[Batal]                    [Mulai ulang]
```

Setelah berhasil: toast "Kebiasaan dimulai ulang. Minggu 41 ada di Riwayat." dengan tombol **Lihat**. Tanpa tombol Undo palsu; Riwayat adalah jaring pengamannya.

### 6.4 Riwayat

- Sidebar: tahun → minggu. Klik minggu membuka snapshot.
- Read-only. Aksi: Ekspor PDF, Duplikat sebagai struktur; Bandingkan minggu (pasca-MVP).
- Aksi di minggu aktif tidak boleh mengubah snapshot.

---

## 7. Desain visual (arah: dark mengikuti Scholar)

Brief pengguna menetapkan tampilan mirip Scholar: dark + monospace. Dipatuhi penuh. PRD asli menyarankan latar putih; itu digantikan. Tema terang pasca-MVP; token dibuat agar bisa dibalik.

### 7.1 Karakter

Dark charcoal, tipografi monospace, banner section biru navy dengan teks miring huruf kecil (`about me . . .`, `activity`, `time table`), kartu gelap bersudut tumpul, warna dipakai sebagai **informasi** (hari, kategori, status), bukan hiasan. Gambar ilustrasi hangat milik pengguna menjadi satu-satunya "dekorasi".

Satu hal yang harus diingat orang: **banner navy huruf kecil miring + board per hari yang berwarna.** Sisanya tenang.

### 7.2 Token warna

```css
:root {
  --bg:        #191919;  /* kanvas */
  --surface:   #202020;  /* section, kartu */
  --surface-2: #272727;  /* kartu di dalam section, hover */
  --line:      #2f2f2f;  /* garis halus, hanya jika nada tidak cukup */

  --text:       #ebebea;
  --text-dim:   #8f8f8c;
  --text-faint: #5f5f5c;

  --banner:      #243857;  /* khas Scholar */
  --banner-text: #dfe8f7;

  --focus:  #4f9de0;
  --today:  #e5604f;  /* lingkaran hari ini */
  --danger: #d9534f;

  --st-todo: #5a5a58;  --st-doing: #3f7fc0;
  --st-done: #3f9c6a;  --st-cancel: #a8473f;

  /* tint hari: latar kolom / latar kartu / label */
  --d-senin-col:  #1d2a23;  --d-senin-card:  #25352c;  --d-senin-tag:  #3d7a5a;
  --d-selasa-col: #2d2024;  --d-selasa-card: #3b262c;  --d-selasa-tag: #8a4a68;
  --d-rabu-col:   #1b2430;  --d-rabu-card:   #222f42;  --d-rabu-tag:   #3f6ea3;
  --d-kamis-col:  #2d201e;  --d-kamis-card:  #43292a;  --d-kamis-tag:  #a8473f;
  --d-jumat-col:  #2c241c;  --d-jumat-card:  #3d3023;  --d-jumat-tag:  #8a6a45;
  --d-sabtu-col:  #26202e;  --d-sabtu-card:  #35293f;  --d-sabtu-tag:  #7a5a9a;
  --d-minggu-col: #1c2828;  --d-minggu-card: #243636;  --d-minggu-tag: #3f8a86;
}
```

Tag (Olahraga, Hiburan, Baca, Skripsi, Kuliah, Backend, ...) memakai 8 warna redup: coklat `#6b5545`, biru `#3b5f8a`, ungu `#6b4f86`, merah `#8f4a45`, hijau `#2f6b52`, abu `#4a4a48`, kuning `#7a6a2f`, pink `#7a4560`. Warna disimpan per opsi dan bisa diganti pengguna.

Kontras: teks utama pada `--surface` ≥ 7:1, `--text-dim` ≥ 4.5:1. Cek tiap tint hari sebelum dipakai.

### 7.3 Tipografi

- Keluarga utama: **IBM Plex Mono** (400, 500, 700 + italic), karena sangat dekat dengan tampilan Scholar.
- Judul halaman 36–40px / 700. Judul section 20–22px / 700. Isi 14px / 400. Meta 12px (`--text-dim`).
- Teks banner: miring, 500, huruf kecil. Ini identitas, jangan diubah jadi kapital.
- Panjang baris isi ≤ 80 karakter; catatan panjang `max-width: 72ch`.
- Angka di tabel dan laporan: `font-variant-numeric: tabular-nums`.
- PDF memakai **IBM Plex Sans** untuk badan teks (lebih terbaca di kertas) dan Plex Mono untuk angka dan label tabel.

### 7.4 Bentuk dan kedalaman

- Tiga radius sesuai hierarki: banner 6px, kartu/section 10px, chip/tag 4px.
- **Tanpa bayangan.** Pemisahan lewat selisih nada (`--bg` → `--surface` → `--surface-2`).
- Jarak kelipatan 4px. Padding section 16–20px. Celah antar section 16px.
- Tanpa gradien dekoratif.

### 7.5 Komponen khas

- **Banner section**: bilah `--banner` setinggi 32px, teks miring huruf kecil. `⋮` dan Mulai ulang muncul di kanan saat hover/fokus (selalu terlihat di layar sentuh).
- **Tab tampilan**: tab aktif berlatar `--surface-2`, ikon + nama.
- **Kartu board**: latar tint hari, judul, jam (`19.00 - 21.00`), tag, status. Jumlah kartu di samping label hari.
- **Chip relasi**: teks bergaris bawah tipis, klik membuka baris.
- **Sel kebiasaan**: selesai (✓), gagal (✕), lewat (–), kosong (·); klik bergantian. Status tidak bergantung warna saja.
- **Halaman baris**: modal lebar di tengah (seperti screenshot "Bootcamp Data Analyst with Excel"): cover, judul besar, properti, panel Terkait.
- **Calendar**: hari ini lingkaran `--today`, hari di luar bulan diredupkan.
- **Indikator simpan**: teks kecil "Tersimpan" / "Menyimpan..." di header; tanpa tombol Simpan.

### 7.6 Gerak

- Hanya gerak yang menjawab aksi pengguna: buka modal/popover, kartu pindah saat drag, toast setelah Mulai ulang. 120–180ms.
- Tidak ada animasi masuk otomatis untuk section/kartu, tidak ada hover bergerak di setiap kartu.
- Hormati `prefers-reduced-motion`.

### 7.7 Checklist anti-slop (wajib lolos sebelum UI dianggap selesai)

- [ ] Tidak ada label kapital ber-tracking di atas setiap judul. (Label banner memang huruf kecil miring.)
- [ ] Tidak ada penomoran 01 / 02 / 03 untuk hal yang bukan urutan sungguhan.
- [ ] Tidak ada pola "KATA — pecahan" dengan em dash, string meta bertitik tengah (`A · B · C`), atau `→` di akhir tombol.
- [ ] Tidak ada hitam-tinted (`#0B0B0B`/`#111`); pakai token.
- [ ] Tidak ada satu radius dan satu bayangan abu yang sama di semua elemen.
- [ ] Tidak ada gradien dekoratif, glassmorphism, atau blob.
- [ ] Tidak ada hero "angka besar + label kecil + gradien". Dashboard dibuka dengan isi (jadwal hari ini).
- [ ] Sidebar memakai satu set ikon garis (Lucide) ukuran/tebal sama. Emoji hanya sebagai ikon halaman pilihan pengguna.
- [ ] Tidak ada aksen terakota/krem bawaan AI atau hijau neon di atas hitam.
- [ ] Tidak ada gambar stok. Placeholder = blok `--surface-2` dengan inisial.
- [ ] Data contoh nyata (SQL, Power BI, Laravel 12 Basic, Kampung Inggris Online, Skripsi), bukan "Task 1 / Lorem ipsum / John Doe".
- [ ] Setiap warna membawa arti (hari, kategori, status). Yang tidak, dibuang.
- [ ] Fokus keyboard terlihat (outline 2px `--focus`), semua kontrol terjangkau keyboard, target sentuh ≥ 40px di mobile.
- [ ] Satu "momen" bergaya; dekorasi lain yang tidak melayani brief dibuang. Sebelum selesai, hapus satu aksesori.

### 7.8 Aturan penulisan UI

- Sentence case, kata kerja aktif, tanpa basa-basi.
- Tombol menyebut hasilnya: **Simpan**, **Tambah kebiasaan**, **Mulai ulang**, **Ekspor PDF**. Bukan "Submit", "OK", "Lanjut".
- Satu aksi, satu nama di seluruh alur: tombol **Mulai ulang** → dialog "Mulai ulang ...?" → toast "... dimulai ulang".
- Keadaan kosong mengajak bertindak: "Belum ada kebiasaan. Tambahkan satu untuk mulai melacak. [Tambah kebiasaan]".
- Galat tidak meminta maaf dan tidak samar: "Perubahan belum tersimpan. Disimpan sementara di perangkat ini. [Coba lagi]". Gagal mulai ulang: "Mulai ulang gagal. Minggu ini tidak berubah. [Coba lagi]".
- Gunakan bahasa pengguna: "Kebiasaan", bukan "Habit entity".

---

## 8. Navigasi dan halaman

```
Sidebar (sempit, bisa dilipat)
├── Dashboard
├── Hari ini      item hari ini dari semua section
├── Minggu ini    ringkasan minggu aktif
├── Section       loncat ke posisi section
├── Riwayat       2026 → Minggu 41, 40, 39, ...
└── Pengaturan
```

Header: nama workspace, tanggal hari ini, nomor minggu, pencarian, indikator simpan, **Ekspor PDF**, tombol **+** cepat (Tambah task, kebiasaan, jadwal, catatan, section) tanpa membuka section dulu.

Halaman: Dashboard (cover, ikon, judul, kutipan, lalu kanvas section), Hari ini, Minggu ini (progres + review), detail Riwayat (baca saja), Pengaturan (nama, zona waktu, hari mulai minggu, tema, ekspor semua data).

Mobile: sidebar jadi drawer, kanvas satu kolom, board geser horizontal, `⋮` selalu terlihat.

---

## 9. Laporan PDF mingguan

Dibuat dari **data terstruktur snapshot**, bukan tangkapan layar.

```
Ekspor laporan

Periode     ( ) Minggu ini   ( ) Minggu 40 (28 Sep – 4 Okt)
Sertakan    [x] Ringkasan [x] Kebiasaan [x] Task [x] Jadwal
            [x] Progres   [x] Catatan   [x] Refleksi
Gaya        ( ) Profesional  ( ) Minimal
[Pratinjau]                    [Ekspor PDF]
```

Isi: sampul (nama, periode), ringkasan progres, kebiasaan (tabel 7 hari + hasil mis. `5 / 7`), task (selesai/tersisa), jadwal, pencapaian, catatan dan refleksi (apa yang berjalan baik / tidak sesuai rencana / perlu diperbaiki / fokus minggu depan), prioritas minggu depan.

Nama file: `Weekly_Report_2026_W40.pdf`.

Aturan: bisa dari minggu aktif atau Riwayat. Hanya section yang dicentang. Tabel lebar dipecah, bukan dipotong. Ada status loading. Desain PDF: latar putih, Plex Sans + Plex Mono, tanpa dekorasi.

Rumus progres:

```
Kebiasaan = log selesai / jumlah hari target      (5 dari 7 = 71,4%)
Task      = task selesai / task yang tidak dibatalkan
Overall   = rata-rata terbobot section Progres (default bobot sama)
```

`Dibatalkan` dan hari `lewat` tidak dihitung ke penyebut.

---

## 10. Data model

Generik, sebab section adalah tabel terkonfigurasi. PostgreSQL (JSONB untuk nilai sel).

```text
users(id, name, email, ...)
workspaces(id, user_id, name, timezone, week_start, layout jsonb)

sections(id, workspace_id, kind, title, icon, cover, position, settings jsonb,
         reset_mode, active_period_id)

fields(id, section_id, name, type, config jsonb, position, resets_on_restart)
  -- config: opsi Pilih/Status/warna tag, target relasi, "boleh banyak", jenis ringkasan

records(id, section_id, period_id, values jsonb, position, cover, created_at, updated_at)
  -- values: { field_id: value }

record_links(id, field_id, from_record_id, to_record_id)
  -- satu baris per tautan; kolom balik dibuat otomatis

views(id, section_id, type, name, config jsonb, position)
  -- config: group_by, sort, filter, field tampil

periods(id, section_id nullable, start_date, end_date, status[active|archived], archived_at)

snapshots(id, period_id, section_id, payload jsonb, created_at)
  -- skema + baris + label relasi (teks) + ringkasan; tidak pernah diedit
```

- `records.period_id` memisahkan data per periode; struktur disalin ke periode baru sesuai `resets_on_restart`.
- Satu `periods.status = active` per section.
- Laporan PDF dan Riwayat dibaca dari `snapshots`.
- Kolom balik relasi menunjuk pasangan lewat `config.inverse_field_id`.

---

## 11. Fase, stack, struktur proyek

### 11.1 Fase

- **Fase 1 (sekarang): UI dulu.** Frontend saja, data contoh + persistensi lokal (Dexie/IndexedDB). Semua alur bisa diklik: Tambah section → isi → relasi → Mulai ulang → Riwayat. Prototype HTML awal ada di `planner.html`; ini hanya acuan eksplorasi, versi yang dikembangkan adalah proyek React. Tanpa backend.
- **Fase 2:** mesin laporan PDF dari snapshot, progres, pratinjau.
- **Fase 3:** backend Laravel 12 + PostgreSQL + Sanctum, sinkron data, auth.
- **Fase 4:** Calendar/Timeline lanjutan, widget jam/cuaca, perbandingan minggu, tema terang, template.

UX benar dulu, baru turunkan ke database. Jangan menulis backend sebelum UI fase 1 diterima.

### 11.2 Stack frontend

| Kebutuhan | Pilihan |
|---|---|
| Kerangka | React + TypeScript (strict) + Vite |
| Gaya | Tailwind CSS, token §7.2 sebagai CSS variables |
| Komponen dasar | shadcn/ui, dimodifikasi mengikuti token (jangan biarkan gaya bawaan) |
| Ikon | Lucide |
| Drag & drop | dnd-kit |
| State UI | Zustand |
| State server (fase 3) | TanStack Query |
| Penyimpanan lokal (fase 1) | Dexie (IndexedDB) |
| Teks kaya | TipTap, hanya di section Catatan |
| Grafik | Recharts, hanya untuk Progres |
| PDF | `@react-pdf/renderer` (fase 2); bisa pindah ke Puppeteer/Browsershot di backend nanti |
| Font | IBM Plex Mono, IBM Plex Sans (dihost lokal) |
| Tes | Vitest + Testing Library |

Jangan menambah dependensi tanpa alasan tertulis di commit.

### 11.3 Struktur

```
src/
├── app/                 shell, routing, sidebar, header
├── features/
│   ├── canvas/          layout engine, drag, resize, picker tambah section
│   ├── sections/        registry jenis section + preset
│   ├── table/           mesin tabel: field, record, cell editor
│   ├── views/           table, board, gallery, timeline, calendar
│   ├── relations/       picker relasi, chip, panel Terkait, ringkasan
│   ├── periods/         restart, snapshot, history
│   ├── report/          kalkulasi progres, dialog ekspor, template PDF
│   └── search/
├── components/ui/       komponen dasar bertoken
├── lib/                 tanggal (Asia/Jakarta), id, util
├── store/               Zustand
├── db/                  Dexie + (nanti) klien API
├── styles/tokens.css    token §7.2
└── mocks/seed.ts        data contoh dari referensi Scholar
```

Registry jenis section deklaratif:

```ts
registerSection({
  kind: 'habit',
  label: 'Kebiasaan',
  defaultFields: [/* ... */],
  defaultViews: [{ type: 'table' }],
  resetPolicy: 'progress-only',
})
```

---

## 12. Data contoh (seed) dari referensi

- **Profil**: Arga, Fresh Graduate, favorit: analytic, music, series.
- **Main Activity** (Gallery): Bootcamp Data Analyst with Excel (Event: Bootcamp DQ Lab, Sesi 5, Achive: 9 Packages), Bootcamp Business Intelligence Analyst with Power BI, Bahasa Inggris.
- **Schedule** (relasi ke Main Activity, Board per hari): Selasa/Jumat 19.00–21.30 Zoom (Excel), Rabu 19.00–21.00 (Power BI), Senin/Kamis 20.00–21.00 Kampung Inggris Online.
- **To do List Harian** (Board per hari): Olahraga 06.00–07.00 Jalan 45 menit; Hiburan 07.00–08.00 Baca; Skripsi 08.00–11.00; Kuliah 19.00–21.00; status Belum mulai / Dibatalkan.
- **Milestone Skripsi** (Timeline) dan **Belajar Coding** (Laravel 12 Basic, Senin, 21.30–24.00, Backend, Belum mulai).
- **Calendar** Oktober 2026, hari ini 6 Oktober.

---

## 13. Cakupan

### MVP (harus berfungsi mulus)

1. Buka dashboard.
2. Tambah section dari picker (Tabel, Kebiasaan, Checklist, Jadwal, Catatan, Profil, Progres).
3. Susun section dalam grid (1/2/3 kolom + drag + resize).
4. Buat kolom, baris, dan relasi antar section.
5. Ganti tampilan: Tabel, Board, Gallery (Timeline dan Calendar sebaiknya ikut).
6. Lacak aktivitas sepanjang minggu.
7. Lihat progres mingguan.
8. Mulai ulang per section.
9. Periode lama otomatis masuk Riwayat.
10. Buka minggu lama (baca saja).
11. Ekspor PDF dari minggu aktif atau Riwayat.
12. Data tersimpan otomatis.

Jika 12 alur ini mulus, produk layak. Sisanya sekunder.

### Bukan tujuan

Pengganti penuh Notion, kolaborasi real-time, manajemen proyek tim, editor dokumen kompleks, rumus bebas, gamifikasi berlebihan, AI di MVP.

### Pasca-MVP

Widget jam/cuaca, perbandingan antar minggu, tema terang, template workspace (Personal, Student, Career), pintasan keyboard (`N` task, `H` kebiasaan, `S` jadwal, `R` mulai ulang, `E` ekspor), notifikasi, integrasi Google Calendar, ringkasan mingguan dengan AI.

---

## 14. Aturan kerja untuk Claude Code

### Umum

- Kerjakan per fase. Sekarang fase 1; jangan menyentuh backend.
- Sebelum membangun UI baru: tulis rencana token/tata letak singkat, periksa terhadap §7.7, baru bangun. Setelah selesai, kritik hasil dengan checklist yang sama.
- Jangan memakai gaya bawaan shadcn/Tailwind jika bertentangan dengan token.
- Jangan membuat fitur di luar §13 tanpa persetujuan.
- Catat keputusan penting di §15.

### Kode

- TypeScript strict; tanpa `any` tanpa komentar alasan.
- Logika (progres, snapshot, layout, relasi) di `lib/` atau `features/*/model` agar bisa dites; komponen kecil.
- Semua tanggal di `Asia/Jakarta`; minggu mulai Senin.
- Aksesibilitas: label semua kontrol, urutan fokus logis, drag bisa lewat keyboard (sensor keyboard dnd-kit).
- Responsif sampai 360px.

### Tes wajib

- Progres kebiasaan (5/7 = 71,4%); task `Dibatalkan` tidak masuk penyebut.
- Mulai ulang: snapshot dibuat, periode lama archived, baru aktif, struktur tetap, progres kosong, tidak ada data lama dihapus.
- Mulai ulang gagal di tengah → tidak ada perubahan (rollback).
- Relasi: dua arah, ganti nama baris tujuan memperbarui chip, hapus baris tujuan memutus tautan dengan peringatan, snapshot menyimpan label teks.
- Layout: pindah section tidak mengubah data, resize snap ke grid 12.
- Riwayat tidak berubah saat data aktif diubah.

### Dilarang

- `DELETE` data periode lama saat Mulai ulang.
- Menyimpan relasi sebagai teks.
- Tombol Simpan manual untuk aksi biasa (autosave).
- `localStorage` untuk data utama (pakai IndexedDB); hanya untuk preferensi kecil.
- Mengubah token warna/tipografi tanpa memperbarui dokumen ini.
- Emoji sebagai dekorasi UI.

### Perintah

```bash
pnpm install
pnpm dev          # server pengembangan
pnpm test         # vitest
pnpm typecheck    # tsc --noEmit
pnpm lint
pnpm build
```

Sebelum menyatakan selesai: `pnpm typecheck && pnpm lint && pnpm test` hijau dan checklist §7.7 lolos.

---

## 15. Catatan keputusan

- Produk = planner modular, bukan clone Notion.
- Section = tabel terkonfigurasi (satu mesin untuk semua jenis).
- Struktur dipisah dari data periode; Mulai ulang = snapshot + arsip + periode baru.
- Mulai ulang tersedia per section dan untuk semua section.
- Relasi nyata dua arah dengan panel Terkait otomatis, tanpa filter manual.
- UI dark mengikuti Scholar; tema terang ditunda (menggantikan latar putih di PRD).
- Fase 1 tanpa backend; Laravel 12 + PostgreSQL di fase 3.
- PDF dari data snapshot, bukan tangkapan layar.
