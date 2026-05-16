---
# Auth — Login

## Overview
Login dengan email + password. Support two-factor authentication (TOTP) dan handling email belum terverifikasi. Diimplementasikan via Better Auth dengan form di `src/app/(auth)/login/`.

## Status
✅ Done — 95%

## Completeness Checklist
- [x] Email + password login
- [x] Error handling: invalid credentials
- [x] Redirect ke callbackUrl setelah login
- [x] Two-factor authentication (TOTP 6-digit)
- [x] Redirect ke halaman 2FA bila user punya 2FA enabled
- [x] Handling email belum terverifikasi (tampilkan pesan + tombol resend)
- [x] Resend verification email dari halaman login
- [ ] Remember me / persistent session (Better Auth support ada, belum diexpose ke UI)
- [ ] Rate limiting khusus untuk login endpoint (hanya general rate limit via apiGuard)

## Flexibility Checklist
- [x] OAuth provider bisa ditambah via Better Auth plugin (tidak perlu ubah login form)
- [ ] Min password length hardcoded di `src/lib/auth.ts:89` = 5 chars — sangat lemah, harus dinaikkan ke 8+
- [x] Redirect URL via `callbackUrl` param, configurable
- [ ] Error messages hardcoded di dalam form component, tidak i18n-ready

## Known Issues
- 🟡 **Min password length 5 chars** (`src/lib/auth.ts:89`) — terlalu lemah untuk production. Naikkan ke minimum 8.
- 🟢 **Remember me** — Better Auth mendukung `rememberMe` flag di `signIn.email()`, tapi form tidak expose opsi ini ke user.

## Cara Customize untuk Project Baru
1. Ganti `minPasswordLength` di `src/lib/auth.ts` ke nilai yang diinginkan (minimal 8)
2. Untuk tambah OAuth: tambah provider plugin di `src/lib/auth.ts` dan tombol di login form
3. Untuk custom redirect: pass `?callbackUrl=/target` di URL

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
