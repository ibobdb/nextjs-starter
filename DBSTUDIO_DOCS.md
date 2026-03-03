# DB STUDIO - Dokumentasi Sistem Internal & Arsitektur

## 1. Identitas & Meta Data
- **Nama Aplikasi**: DB STUDIO (Berbasis kerangka kerja DBStudio Core)
- **Versi Platform**: 1.0.0
- **Pengembang**: Internal Team
- **Stack Teknologi Utama**: 
  - Framework: Next.js 15 (App Router, Server Components)
  - Bahasa: TypeScript
  - Database: PostgreSQL (via Prisma ORM)
  - Autentikasi: Better-Auth (2FA, Passkeys, Session Management)
  - UI/Styling: Tailwind CSS, shadcn/ui, Lucide React
- **Lokasi Codebase Utama**: `/src/app/dashboard`

## 2. Tujuan Aplikasi
DB STUDIO dirancang secara khusus untuk menjadi **Dashboard Internal Terpusat (Entry Point Tunggal)** bagi seluruh perangkat lunak (tools) dan sub-aplikasi yang akan dikembangkan untuk kebutuhan operasional tim internal. 
Dengan adanya satu gerbang portal ini, tim internal hanya perlu melakuan registrasi dan masuk (*login*) satu kali saja untuk dapat mengakses dan mengendalikan semua alat operasional yang berbeda, dengan perlindungan kerangka kerja otoritas manajemen hak akses yang konsisten tingkat tinggi.

## 3. Integrasi Aplikasi
DB STUDIO bertindak sebagai orkestrator (*API Gateway / Frontend Gateway*) yang berkomunikasi dengan layanan infrastruktur pokok:
- **Database Terpusat (PostgreSQL)**: Sebagai jantung penyimpanan untuk manajemen profil karyawan, autentikasi sesi, sistem perizinan (RBAC), pengaturan preferensi global (System Configs), serta metadata sub-aplikasi.
- **Provider Email Transaksional (Resend API)**: Diintegrasikan untuk mengirimkan pemulihan akun (*magic link* / *reset password*), autentikasi sekunder, dan pesan sistem untuk tim internal.
- **Worker / Mesin Terpisah Eksternal**: Berintegrasi kokoh melalui HTTP API dan REST dengan kumpulan mesin pendukung latar belakang spesifik tiap aplikasi.

## 4. Fitur Base Dashboard (Saat Ini)
Saat ini sebagai fondasi platform "Super-App" tim internal, DB STUDIO telah diperlengkapi dengan berbagai modul "Base" berstandar korporat yang kokoh:
- **Sistem Autentikasi Mutakhir & Super Aman**: Dukungan Login tradisional, opsi tanpa kata sandi via WebAuthn (Passkeys), Autentikasi Dua Faktor (2FA authenticator apps), manajemen sesi perangkat aktif, dan fitur *Force Logout* multi-divisi dari dasbor kendali.
- **Hierarki Keamanan Granular (RBAC API Guard & Route Guard)**: Modul kontrol akses yang sangat bisa disesuaikan. Izin akses tidak terbatas hanya pada "Jabatan User" (Sistem Role), namun diturunkan secara kaku ke hak fungsi tindakan individual (Permissions seperti `user.read`, `settings.update`, `admin.read`).
- **Dynamic System Configuration & Navigation**: Pengaturan global identitas instansi ditarik dinamis. Dilengkapi dengan **Admin Menu Manager** untuk mengatur struktur sidebar, ikon Lucide, dan hak akses menu secara visual langsung dari dashboard tanpa menyentuh kode.
- **Hierarki Keamanan Granular (RBAC API Guard & Route Guard)**: Modul kontrol akses tingkat tinggi. Hak fungsi tindakan individual (Permissions) diintegrasikan secara global ke UI menggunakan `usePermission` hook dan komponen `PermissionAlert`.
- **Core Entity & Team Management**: Manajemen komprehensif profil internal staff dan pemisahan organisasi (Teams).
- **System Broadcast Center**: Memungkinkan administrator mengirimkan notifikasi instan (dengan prioritas Info, Success, Warning, Error) kepada seluruh user atau role tertentu secara massal.
- **Background Task Monitor & Webhook Symphony**: Infrastruktur asinkronus untuk memantau proses berat di latar belakang dan menerima payload callback eksternal melalui sistem Webhook Listener yang aman di `/api/webhooks/tasks/`.
- **Global Audit Logs & Telemetri**: Rekam jejak mutasi data transparan (Compliance Ready) mencakup detail pengguna, IP, dan modifikasi payload.
- **Real-time Event Bus (SSE)**: Menggunakan Server-Sent Events untuk mengirimkan notifikasi broadcast dan status task ke client secara instan tanpa refresh.
- **Lab Dashboard (Developer Tools)**: Tooling internal untuk mensimulasikan callback webhook dan testing integrasi asinkronus secara mandiri.
- **Smart SWR Data Fetching**: Metode caching data pintar berbasis utilitas kustom, meminimalkan efek *loading* berlebih dan menghaluskan animasi antar layar antar-muka Dasbor.

## 5. Arsitektur Modul Asinkron
DB STUDIO difokuskan sebagai Hub Pusat untuk berbagai instansi parsial (Modul Operasional):
- **Workspace Modul Terisolir**: Setiap modul baru dapat ditempatkan di folder terpisah di bawah `/dashboard/`, memungkinkan pengembangan fitur yang independen namun tetap dalam satu ekosistem UI.
- **Worker-Driven Architecture**: Arsitektur ini tidak memberatkan Main Engine DB STUDIO. DB STUDIO di sini sekadar menjalankan peran GUI (Graphical User Interface) canggih yang merakit komando tugas operasional lalu melemparkannya ke **Worker API Server** eksternal.
- **Real-time Visualization**: Dasbor ini siap memvisualisasikan data rumit dari Worker eksternal secara presisi real-time.

## 6. Saran Selanjutnya (Roadmap & Rekomendasi)
Karena basis peluncuran DB STUDIO disiapkan matang untuk menampung berbagai skema ekosistem aplikasi internal lanjutan ke depan, berikut adalah rekomendasi tajam untuk pembaruan fitur (Pipeline):
1. **Pemisahan Entitas Database (Namespace/Schema)**: Gunakan prefix nama *table* di ORM Prisma (contoh: `hr_`, `fin_`) untuk meniadakan resiko tabrakan data antar divisi.
2. **Storage Service Integration**: Implementasi modul pusat untuk manajemen file/upload (menggunakan S3 atau Uploadthing) yang terhubung dengan `AuditLog`.
3. **API Documentation UI**: Integrasikan Swagger atau Scalar ke dalam `/dashboard/lab` untuk dokumentasi API interaktif.
4. **Internationalization (i18n)**: Dukungan multi-bahasa (ID/EN) untuk dashboard agar siap digunakan oleh tim lintas negara.

## 7. Tambahan Lainnya
- **Maintainer Guardrail (Doktrin .cursorrules)**: Selalu baca panduan arsitektur kaku pengembangan yang bermukim mendalam di dalam `src/.cursorrules`. Berkas ini memuat peringatan tegas terhadap AI dan *Engineers* untuk membudayakan re-use komponen terpusat milik UI standar perusahaan dan pelarangan penggunaan teknik panggilan-data *fetch() native* manual, memastikan esensi "Panel Pusat" (Entry Point) DB STUDIO tetap ringkas, bersih (Dry code) serta stabil hingga 5-10 tahun ke depan.
