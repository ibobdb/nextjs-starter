# DB Studio Overview

## Metadata
- **Nama Aplikasi**: DB Studio
- **Versi**: 1.0.0 (Internal Dashboard)
- **Tech Stack**: Next.js 15 (App Router), TypeScript, Prisma ORM, PostgreSQL, better-auth, SWR (Data Fetching), shadcn/ui, Tailwind CSS.
- **Tipe**: Internal Tool & Centralized Dashboard Entry Point.

## Tujuan Aplikasi
DB Studio dibangun sebagai **dashboard internal dan entry point tersentralisasi** untuk seluruh aplikasi dan tool yang dikembangkan untuk tim internal. Aplikasi ini didesain secara modular, memungkinkan tools seperti TrendScout beroperasi secara seamless di dalam satu ekosistem tanpa perlu mengelola autentikasi dan otorisasi secara terpisah. Di masa depan, berbagai alat baru dapat dengan mudah diregistrasikan dan diintegrasikan ke dalam ekosistem DB Studio.

## Integrasi Aplikasi
1. **Autentikasi Pusat**: Menggunakan `better-auth` yang telah dikustomisasi untuk mendukung pengelolaan pengguna berskala, otentikasi dua faktor (2FA), serta Passkey.
2. **Database & ORM**: Menggunakan Prisma terhubung ke PostgreSQL untuk menyimpan pengaturan sistem, data user, role, permission, metadata module, hingga data audit logs.
3. **Background Worker / API Eksternal**: Memiliki jalur komunikasi dua-arah (REST API dan Webhook) dengan sistem worker (seperti TrendScout API) yang dikoordinasikan secara asinkron menggunakan job UUID dan callback notification.

## Fitur Base Dashboard
Base aplikasi sudah memiliki fondasi kuat layaknya software enterprise:
- **Authentication & Security**: Email/Password, 2FA, Passkeys, Session Management lengkap dengan revocation.
- **Role-Based Access Control (RBAC)**: Pengelolaan User, Team, Role, beserta granular permission per entitas.
- **Dynamic Module Registry**: Kemampuan untuk mengaktifkan atau menonaktifkan tool (contoh: modul TrendScout) langsung melalui Dashboard / System Settings.
- **Log & Audit**: Semua aksi sensitif (CREATE, UPDATE, DELETE) tercatat rapi di System Audit Logs page.
- **System Configs & Notifications**: Parameter sistem yang bersifat dinamis untuk production dapat diubah tanpa rebuild, serta fitur Broadcast Message untuk semua user di modul tertentu.
- **Standard UI Component**: Penggunaan data-loader, blank-state, app-table dan toast management global.

## Integrasi dengan Worker (TrendScout Module)
Modul TrendScout adalah bukti dari konsep modular DB Studio. Beberapa integrasi utamanya meliputi:
- **Data Source & Pipeline Management**: Dashboard untuk mendaftarkan dan memicu pipeline di server TrendScout.
- **Topic Trends & Clustering**: Monitoring topik curhatan, memproses clustering AI, dan generate brief secara latar belakang lewat **Task Service**.
- **Draft & Content Manager**: UI untuk review, edit, branch variasi (intent), serta audit SEO untuk artikel yang telah dihasilkan worker.
- **Callback Tester**: Endpoint verifikasi untuk memastikan Webhook komunikasi dari Worker ke DB Studio berfungsi dengan baik.

## Saran dan Rekomendasi Selanjutnya
1. **End-to-End (E2E) dan Unit Testing**: 
   - Karena interaksi Dashboard dan Worker sangat krusial, sangat direkomendasikan membuat E2E Testing (dengan Cypress atau Playwright) untuk memastikan callback system dan otorisasi berjalan persis dengan rencana.
2. **Observabilitas (Monitoring & Error Tracking)**:
   - Integasikan dengan tools seperti Sentry atau Datadog untuk memonitor kegagalan pada proses routing atau timeout request dari Worker/API.
3. **Optimasi Container/Docker untuk Production**:
   - Pastikan variabel lingkungan (env globals) pada production sudah tersuntik sempurna saat kontainer dijalankan (Runtime variables vs Build-time variables). Konfigurasi *System Configs* yang dinamis melalui database sudah merupakan langkah yang sangat efisien untuk meminimalkan restart kontainer.
4. **Task/Job Queue System di sisi DB Studio**:
   - Jika endpoint callback DB Studio menahan beban tinggi ketika menerima banyak hasil AI secara serentak, pertimbangkan menggunakan in-memory queue (seperti BullMQ berbasis Redis) agar DB tidak overloaded saat write log dan notifikasi bersamaan.
