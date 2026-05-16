---
# Menu System — Dynamic Menu

## Overview
Menu tersimpan di DB (`menu` table) dengan hierarki parent-child. `/api/menus` memfilter berdasarkan role + permission user. Sidebar sepenuhnya data-driven dari response ini. Admin bisa CRUD menu via `/api/admin/menus`.

## Status
✅ Done — 95%

## Completeness Checklist
- [x] Schema: `Menu` dan `MenuRole` models di `prisma/schema.prisma`
- [x] Parent-child hierarchy (group → items)
- [x] Setiap menu item bisa punya `permissionId` yang dibutuhkan untuk melihat item tersebut
- [x] Role-based access via `MenuRole` join table
- [x] `GET /api/menus` — filter menu berdasarkan session user (role + permission)
- [x] Super admin bypass — lihat semua menu
- [x] `GET/POST/PUT/DELETE /api/admin/menus` — full CRUD untuk admin
- [x] Sidebar sepenuhnya data-driven dari API response
- [x] RouteGuard menggunakan URL list dari `/api/menus` untuk enforce access
- [x] Menu di-seed via `prisma/seed.ts` dengan 4 group default
- [ ] Drag-and-drop reorder menu via UI
- [ ] Icon picker via UI (saat ini icon harus diketik manual sebagai string Lucide)
- [ ] Preview menu sebelum save

## Flexibility Checklist
- [x] Tambah menu baru tanpa ubah kode — cukup insert ke DB atau tambah ke seed
- [x] Assign permission dan role ke setiap item menu secara independen
- [ ] Seed akan **delete semua menu** sebelum recreate — menu yang dibuat via UI admin akan hilang setelah seed ulang. Perlu dipertimbangkan untuk production.
- [ ] Icon list tidak di-validate — jika icon string salah, tidak ada error, hanya tidak tampil
- [x] Hierarki 2-level (group → items) sudah cukup untuk kebanyakan use case

## Known Issues
- 🟡 **Seed delete semua menu**: Setiap `npm run seed` mendelete dan recreate semua menu. Menu yang dibuat via UI admin akan hilang. Untuk production, pertimbangkan pisahkan seed menu dari seed awal atau gunakan upsert.
- 🟢 **Icon tidak divalidasi**: `menu.icon` adalah string bebas. Jika salah ketik nama icon Lucide, tidak ada error di server — icon hanya tidak muncul.
- 🔵 **APP_NAME & EMAIL_FROM hardcoded di seed**: `prisma/seed.ts:180` dan `prisma/seed.ts:184` berisi nilai yang seharusnya dari env var untuk project baru.

## Cara Customize untuk Project Baru
1. Edit `menuGroups` di `prisma/seed.ts` untuk struktur menu default project baru
2. Jalankan `npm run seed` — sidebar otomatis update
3. Untuk tambah menu tanpa re-seed: gunakan admin UI (tapi akan hilang jika seed ulang)
4. Icon: gunakan nama komponen Lucide (contoh: `"Settings"`, `"Users"`, `"Shield"`)

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
