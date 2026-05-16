---
# Auth — Register

## Overview
Registrasi user baru dengan email + password. Setelah register, email verifikasi otomatis dikirim. User auto-diberi role `user` via database hook di `src/lib/auth.ts`.

## Status
✅ Done — 90%

## Completeness Checklist
- [x] Form name + email + password + confirm password
- [x] Client-side validation dengan Zod (min 6 chars, password match)
- [x] Email verification wajib sebelum login
- [x] Auto-assign role `user` via `databaseHooks.user.create.after` (`src/lib/auth.ts`)
- [x] Failsafe: jika role tidak terassign, `customSession` auto-heal
- [ ] Password strength indicator di UI
- [ ] CAPTCHA / bot protection
- [ ] Invite-only registration mode

## Flexibility Checklist
- [x] Role default (`user`) bisa diubah di `src/lib/auth.ts` pada `databaseHooks`
- [ ] Min password length tidak konsisten: form validate 6 chars (`src/app/(auth)/register/page.tsx:34`), auth.ts enforce 5 chars — seharusnya sama
- [ ] Email template untuk verification hardcoded di Better Auth config, tidak mudah di-customize tanpa edit `src/lib/auth.ts`
- [x] Bisa tambah field custom di register dengan extend Better Auth

## Known Issues
- 🟡 **Inkonsistensi password minimum**: form Zod schema mensyaratkan 6 chars, tapi `auth.ts` set `minPasswordLength: 5`. Kedua nilai harus disamakan dan dinaikkan ke 8.
- 🟡 **Email verification end-to-end flow** belum diverifikasi sepenuhnya — perlu test dengan real RESEND_API_KEY.
- 🟢 **CAPTCHA** tidak ada. Untuk production dengan user publik, ini perlu ditambah.

## Cara Customize untuk Project Baru
1. Ubah Zod schema di `src/app/(auth)/register/page.tsx` untuk field custom
2. Ubah `databaseHooks.user.create.after` di `src/lib/auth.ts` untuk role default berbeda
3. Untuk invite-only: tambah middleware check di register route

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
