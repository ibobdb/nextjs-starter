# Starter Kit — Gap Report

> Audit date: 2026-05-16

---

## 🔴 Critical Gaps

### 1. Tidak ada server-side middleware (`src/middleware.ts`)
- **Impact**: User yang tidak login bisa akses URL `/dashboard/*` langsung tanpa redirect ke login. Proteksi hanya di client-side `RouteGuard`, yang bisa di-bypass dengan disable JavaScript.
- **Fix**: Buat `src/middleware.ts` yang mengecek session cookie dan redirect ke `/login` jika tidak ada session.
- **Files**: Buat baru `src/middleware.ts`

### 2. User banning tidak dienforce
- **Impact**: User dengan `User.banned = true` di DB masih bisa login dan akses semua resource. Flag `banned` ada di schema tapi tidak dicek di `apiGuard()` maupun `auth.ts`.
- **Fix**: Tambah cek `session.user.banned` di `src/lib/api-guard.ts` — return 403 jika banned.
- **Files**: `src/lib/api-guard.ts`, `src/lib/auth.ts`

### 3. Default admin password terlalu lemah dan hardcoded
- **Impact**: `prisma/seed.ts:11` hardcode password `superadmin123`. Jika seed dijalankan di production tanpa ganti password, ini adalah akun backdoor.
- **Fix**: Gunakan env var `SEED_ADMIN_PASSWORD` atau generate random password dan print ke console sekali saja.
- **Files**: `prisma/seed.ts`

### 4. Missing `/api/access/sync-permissions` endpoint
- **Impact**: `src/services/access/api.ts:77` mendefinisikan fungsi `syncPermissions()` yang call endpoint ini. Jika dipanggil, akan 404. Jika ada UI yang menggunakannya, fitur tersebut broken.
- **Fix**: Implementasikan route handler atau hapus fungsi `syncPermissions()` dari service.
- **Files**: Buat baru `src/app/api/access/sync-permissions/route.ts` atau hapus dari `src/services/access/api.ts`

### 5. Rate limiting in-memory — tidak scale
- **Impact**: `src/lib/rate-limit.ts` menggunakan `Map` in-memory. Di deployment multi-instance (Vercel, Docker swarm, dll), setiap instance punya counter sendiri — rate limit tidak efektif. Data hilang saat server restart.
- **Fix**: Dokumentasikan batasan ini dengan jelas di README. Untuk production, ganti dengan Redis-backed solution atau Upstash.
- **Files**: `src/lib/rate-limit.ts`

---

## 🟡 Important Gaps

### 1. Inkonsistensi single vs multi-role design
- **Impact**: Schema DB mendukung banyak role per user (`UserRole` many-to-many), tapi batch endpoint enforce max 1 role (`src/app/api/users/[id]/roles/batch/route.ts:79`). Behavior tidak konsisten dan membingungkan developer yang extend starter kit ini.
- **Fix**: Tentukan design decision — pilih salah satu lalu enforce konsisten di semua endpoint dan UI.
- **Files**: `src/app/api/users/[id]/roles/batch/route.ts`

### 2. Minimum password length terlalu lemah + inkonsisten
- **Impact**: `src/lib/auth.ts:89` set `minPasswordLength: 5`. Register form Zod schema set min 6. Login form test `min(8)`. Tiga nilai berbeda — user mendapat UX yang membingungkan.
- **Fix**: Standardkan ke 8 di semua tempat: `auth.ts`, register schema, login validation.
- **Files**: `src/lib/auth.ts`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/login/`

### 3. Forgot/reset password flow belum diverifikasi
- **Impact**: File halaman ada, tapi implementasi form belum dikonfirmasi bekerja end-to-end. User yang lupa password mungkin tidak bisa reset.
- **Fix**: Test end-to-end dengan RESEND_API_KEY yang valid di staging.
- **Files**: `src/app/(auth)/forgot-password/`, `src/app/(auth)/reset-password/`

### 4. Tidak ada audit log write dari API routes
- **Impact**: `AuditLog` model ada di schema, tapi tidak ada satu pun API route yang menulis ke tabel ini. Perubahan penting (role assignment, permission change, user ban) tidak tercatat.
- **Fix**: Tambah `auditLog.create()` di endpoint-endpoint critical.
- **Files**: `src/app/api/users/[id]/roles/route.ts`, `src/app/api/access/role-permissions/route.ts`

### 5. Logout dari semua device belum ada
- **Impact**: Tidak ada cara untuk revoke semua session user (misal: akun compromised). Schema `Session` model ada, Better Auth mendukung ini.
- **Fix**: Tambah endpoint `DELETE /api/users/[id]/sessions` dan UI di profile/user management.
- **Files**: Buat baru `src/app/api/users/[id]/sessions/route.ts`

### 6. Team management incomplete
- **Impact**: Team permission management (endpoint member dan permission) belum diverifikasi berjalan end-to-end. Fitur teams di sidebar mungkin partial.
- **Fix**: Verifikasi dan lengkapi semua endpoint teams.
- **Files**: `src/app/api/teams/`

### 7. Batch role update hanya check roleId pertama
- **Impact**: `src/app/api/users/[id]/roles/batch/route.ts:52-67` hanya validasi hierarchy untuk roleId pertama dalam array. Jika array berisi multiple roles, roles berikutnya tidak dicek.
- **Fix**: Loop hierarchy check untuk setiap roleId dalam array.
- **Files**: `src/app/api/users/[id]/roles/batch/route.ts`

---

## 🔵 Flexibility Gaps

### 1. Permission mapping routes hardcoded di kode
- **Impact**: `src/lib/rbac/permission.ts:73-88` berisi map route prefix → required permission yang hardcoded. Setiap route dashboard baru yang butuh server-side permission check harus diedit file ini.
- **Fix untuk starter kit**: Dokumentasikan bahwa ini adalah tempat yang perlu diedit saat tambah route. Atau pindahkan ke konfigurasi yang bisa diubah tanpa redeploy.
- **Files**: `src/lib/rbac/permission.ts`

### 2. Role hierarchy hardcoded di kode
- **Impact**: Level hierarchy di `src/lib/role-hierarchy.ts` (super_admin=1, admin=2, custom=3, user=4) tidak bisa diubah via UI atau config. Project yang butuh hierarchy berbeda harus edit kode.
- **Fix**: Tambah `level` field di `Role` model di Prisma schema, baca dari DB.
- **Files**: `src/lib/role-hierarchy.ts`, `prisma/schema.prisma`

### 3. APP_NAME dan EMAIL_FROM hardcoded di seed
- **Impact**: `prisma/seed.ts:180` berisi `'DB STUDIO Dashboard'` dan `:184` berisi `'noreply@ibobdb.com'`. Setiap project baru harus edit file seed langsung.
- **Fix**: Baca dari `process.env.APP_NAME` dan `process.env.EMAIL_FROM`.
- **Files**: `prisma/seed.ts`

### 4. Session expiry tidak bisa dikonfigurasi via env
- **Impact**: `src/lib/auth.ts:159` hardcode `expiresIn: 60 * 60 * 24` (24 jam). Project dengan kebutuhan session berbeda harus edit kode.
- **Fix**: Gunakan `parseInt(process.env.SESSION_EXPIRY_SECONDS ?? '86400')`.
- **Files**: `src/lib/auth.ts`

### 5. Admin UUID hardcoded di seed
- **Impact**: `prisma/seed.ts:10` berisi UUID admin yang hardcoded. Jika seed dijalankan di DB yang sudah punya user dengan ID lain, bisa conflict.
- **Fix**: Gunakan `crypto.randomUUID()` atau cek keberadaan admin via email sebelum insert.
- **Files**: `prisma/seed.ts`

### 6. Whitelist route di RouteGuard hardcoded
- **Impact**: Array `WHITELIST` di `src/lib/rbac/components/RouteGuard.tsx` harus diedit di kode untuk tambah route yang selalu bisa diakses.
- **Fix**: Baca dari env var atau konfigurasi. Atau dokumentasikan jelas sebagai "edit ini untuk whitelist route baru".
- **Files**: `src/lib/rbac/components/RouteGuard.tsx`

### 7. `<Can>` tidak mendukung multiple permissions (OR logic)
- **Impact**: `<Can permission="x.y">` hanya terima satu string. Untuk check "punya salah satu dari beberapa permission", developer harus nested `<Can>` atau pakai hook manual.
- **Fix**: Tambah prop `permissions?: string[]` dengan OR logic (mirip dengan `apiGuard` yang sudah support array).
- **Files**: `src/lib/rbac/components/can.tsx`

---

## 🟢 Nice to Have

1. **OAuth provider** (Google, GitHub, dll) — schema `Account` model sudah siap, tinggal tambah Better Auth plugin
2. **Session impersonation** — schema `Session.impersonatedBy` ada, tapi tidak ada implementasi. Berguna untuk support/debug
3. **Password strength indicator** di register form
4. **Remember me** toggle di login form — Better Auth mendukung `rememberMe` flag
5. **Rate limit headers** selalu dikirim (bukan hanya saat limit exceeded)
6. **Empty service stub dihapus** — `src/services/permission.ts` kosong, membingungkan
7. **CAPTCHA** di register dan forgot-password untuk bot protection
8. **OpenAPI/Swagger** spec untuk API documentation
9. **Drag-and-drop menu reorder** di admin UI
10. **Multi-tenant support** — saat ini schema tidak ada tenant isolation

---

## Rekomendasi Urutan Pengerjaan

### Phase 1 — Security & Stability (sebelum bisa dipakai)
1. 🔴 Buat `src/middleware.ts` — server-side redirect unauthenticated
2. 🔴 Fix `User.banned` enforcement di `apiGuard()`
3. 🔴 Ganti hardcoded admin password di seed ke env var
4. 🟡 Standardkan min password length ke 8 di semua tempat
5. 🔴 Fix atau hapus `syncPermissions()` service (404 risk)

### Phase 2 — Completeness (agar semua fitur yang ada berjalan)
6. 🟡 Verifikasi forgot/reset password flow end-to-end
7. 🟡 Fix batch role update hierarchy check (loop semua IDs)
8. 🟡 Verifikasi dan lengkapi team management endpoints
9. 🟡 Tambah logout-all-devices endpoint

### Phase 3 — Flexibility (agar starter kit benar-benar reusable)
10. 🔵 Pindahkan APP_NAME dan EMAIL_FROM ke env vars di seed
11. 🔵 Pindahkan session expiry ke env var
12. 🔵 Dokumentasikan role hierarchy — beri instruksi jelas cara ubah
13. 🔵 Tambah `permissions[]` OR logic ke `<Can>` component

### Phase 4 — Audit & Observability
14. 🟡 Tambah audit log write di endpoint critical (role assign, permission change)
15. 🟡 Dokumentasikan rate limiting limitation (in-memory) dengan rekomendasi Redis

### Phase 5 — Nice to Have
16. 🟢 OAuth provider setup guide
17. 🟢 Remember me toggle di login
18. 🟢 Password strength indicator
