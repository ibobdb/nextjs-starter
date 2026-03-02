# DB STUDIO - Dokumentasi Sistem Internal & Arsitektur

## 1. Identitas & Meta Data
- **Nama Aplikasi**: DB STUDIO (Berbasis kerangka kerja DBStudio Core)
- **Versi Platform**: 1.0.0
- **Pengembang**: Internal Team / Trendscout
- **Stack Teknologi Utama**: 
  - Framework: Next.js 15 (App Router, Server Components)
  - Bahasa: TypeScript
  - Database: PostgreSQL (via Prisma ORM)
  - Autentikasi: Better-Auth (2FA, Passkeys, Session Management)
  - UI/Styling: Tailwind CSS, shadcn/ui, Lucide React
- **Lokasi Codebase Utama**: `/src/app/dashboard`

## 2. Tujuan Aplikasi
DB STUDIO dirancang secara khusus untuk menjadi **Dashboard Internal Terpusat (Entry Point Tunggal)** bagi seluruh perangkat lunak (tools) dan sub-aplikasi yang akan dikembangkan untuk kebutuhan operasional tim internal (salah satunya adalah Trendscout, dan tool-tool spesifik lain ke depannya). 
Dengan adanya satu gerbang portal ini, tim internal hanya perlu melakuan registrasi dan masuk (*login*) satu kali saja untuk dapat mengakses dan mengendalikan semua alat operasional yang berbeda, dengan perlindungan kerangka kerja otoritas manajemen hak akses yang konsisten tingkat tinggi.

## 3. Integrasi Aplikasi
DB STUDIO bertindak sebagai orkestrator (*API Gateway / Frontend Gateway*) yang berkomunikasi dengan layanan infrastruktur pokok:
- **Database Terpusat (PostgreSQL)**: Sebagai jantung penyimpanan untuk manajemen profil karyawan, autentikasi sesi, sistem perizinan (RBAC), pengaturan preferensi global (System Configs), serta metadata sub-aplikasi.
- **Provider Email Transaksional (Resend API)**: Diintegrasikan untuk mengirimkan pemulihan akun (*magic link* / *reset password*), autentikasi sekunder, dan pesan sistem untuk tim internal.
- **Worker / Mesin Terpisah Eksternal**: Berintegrasi kokoh melalui HTTP API dan REST dengan kumpulan mesin pendukung latar belakang spesifik tiap aplikasi (Contoh: Node.js worker/Python microservice untuk menambang data (scraping) aset operasi).

## 4. Fitur Base Dashboard (Saat Ini)
Saat ini sebagai fondasi platform "Super-App" tim internal, DB STUDIO telah diperlengkapi dengan berbagai modul "Base" berstandar korporat yang kokoh:
- **Sistem Autentikasi Mutakhir & Super Aman**: Dukungan Login tradisional, opsi tanpa kata sandi via WebAuthn (Passkeys), Autentikasi Dua Faktor (2FA authenticator apps), manajemen sesi perangkat aktif, dan fitur *Force Logout* multi-divisi dari dasbor kendali.
- **Hierarki Keamanan Granular (RBAC API Guard & Route Guard)**: Modul kontrol akses yang sangat bisa disesuaikan. Izin akses tidak terbatas hanya pada "Jabatan User" (Sistem Role), namun diturunkan secara kaku ke hak fungsi tindakan individual (Permissions seperti `user.read`, `settings.update`, `trendscout.execute`).
- **Dynamic Module Registry (Plug & Play System)**: Kemampuan sakelar ajaib bagi Super Admin untuk mematikan dan menghidupkan seluruh aplikasi internal (sub-modul) secara seketika melalui dasbor, yang langsung meniadakan atau memunculkan Modul tersebut dari pandangan (tampilan *Sidebar*) seluruh pekerja tim tanpa harus restart server.
- **Dynamic System Configuration**: Pengaturan global identitas instansi (APP_NAME, Deskripsi Meta, Logo URL, Email Keys) ditarik dinamis dari basis data dan bisa divariasikan lansgung dari UI Dasbor (*White-label ready*).
- **Core Entity Management**: Manajemen komprehensif profil internal staff, pemisahan tim organisasi (Teams), dan pemantauan pergerakan peran pengguna.
- **Background Task Monitor Center**: Infrastruktur antar-muka (*Active Tasks Center*) asinkronus untuk mendengarkan lalu lintas permintaan (request) berat API (*polling HTTP 202*) ke latar belakang dan memberikan laporan balik ping status berhasil/mati kepada agen tanpa menyebabkan tab jendela *browser freezes/hang*.
- **Sistem Sentral Webhook (Symphony API)**: Terdapat pusaran *endpoint* Webhook Listener di (`/api/webhooks/tasks/`) yang telah aktif beroperasi penuh untuk menelan *Payload Callbacks* eksternal dari berbagai Worker secara asinkron.
- **Global Audit Logs & Telemetri Interaktif**: Infrastruktur *logging* di bawah model `AuditLog` sudah siap memotret rekam jejak mutasi data dan otorisasi API krusial oleh *Staff*, merekam detail pengguna, IP, hingga modifikasi Payload secara transparan (*Compliance Ready*).
- **Smart SWR Data Fetching**: Metode caching data pintar berbasis utilitas kustom, meminimalkan efek *loading* berlebih dan menghaluskan animasi antar layar antar-muka Dasbor.

## 5. Integrasi Worker Lain (Studi Kasus: Trendscout)
Bukti nyata bahwa DB STUDIO difokuskan sebagai Hub Pusat adalah dilekatkannya instansi parsial (Modul Operasional) Trendscout:
- **Workspace Modul Trendscout**: Berada di folder terisolir `/dashboard/trendscout`, difungsikan penuh sebagai platform manajemen akuisisi sumber daya/talent-scouting tim HR/Riset.
- Arsitektur ini tidak memberatkan Main Engine DB STUDIO. DB STUDIO di sini sekadar menjalankan peran GUI (Graphical User Interface) canggih yang merakit komando tugas operasional lalu melemparkannya ke **Trendscout Worker API Server**.
- Dasbor ini siap memvisualisasikan data rumit seperti sinkronisasi `Datasources`, tabel eksekusi kandidat (Candidate Workbench), hingga menampilkan status riwayat (Logs) tumpang tindih antrean mesin yang sedang diselesaikan oleh perantara Worker di seberang server secara presisi real-time.

## 6. Saran Selanjutnya (Roadmap & Rekomendasi)
Karena basis peluncuran DB STUDIO disiapkan matang untuk menampung puluhan bahkan ratusan skema ekosistem aplikasi internal lanjutan ke depan, berikut adalah rekomendasi tajam untuk pembaruan fitur (Pipeline):
1. **Pemisahan Entitas Database (Namespace/Schema)**: Apabila dikemudian hari Modul Tooling internal beranak pinak dengan masif dalam satu repositori antarmuka ini, disarankan memakai skema prefix nama *table* di ORM Prisma (contoh penamaan: `sys_users`, `ts_candidates`, `hr_leave_request`, `fin_budgeting`) guna meniadakan resiko tabrakan data dan relasi yang kusut antar model independen dari masing-masing bisnis logik divisi lain.
2. **Push Notifications Engine (SSE/WebSockets)**: Sisipkan lonceng notifikasi (Notification Bell) berdetak dinamis di ujung pojok navigasi (*navbar*) atas. Terlebih, ketika *Trendscout Worker* kelar menarik data panjang dari Linkedin di *backend*, *staff* pengontrol di layar bisa langsung mendapatkan pemberitahuan *Flyout pop-up* real-time walau mereka tengah membuka Modul aplikasi internal lainnya di DB Studio.

## 7. Tambahan Lainnya
- **Maintainer Guardrail (Doktrin .cursorrules)**: Selalu baca panduan arsitektur kaku pengembangan yang bermukim mendalam di dalam `src/.cursorrules`. Berkas ini memuat peringatan tegas terhadap AI dan *Engineers* untuk membudayakan re-use komponen terpusat milik UI standar perusahaan dan pelarangan penggunaan teknik panggilan-data *fetch() native* manual, memastikan esensi "Panel Pusat" (Entry Point) DB STUDIO tetap ringkas, bersih (Dry code) serta stabil hingga 5-10 tahun ke depan.
