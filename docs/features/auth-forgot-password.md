---
# Auth — Forgot Password / Reset Password

## Overview
Flow reset password via email. User request reset → email dikirim dengan link → user klik link → set password baru. Dihandle oleh Better Auth built-in + halaman custom di `src/app/(auth)/forgot-password/` dan `src/app/(auth)/reset-password/`.

## Status
🔄 Partial — 60%

## Completeness Checklist
- [x] Halaman forgot-password ada (`src/app/(auth)/forgot-password/`)
- [x] Halaman reset-password ada (`src/app/(auth)/reset-password/`)
- [x] Better Auth `forgetPassword` plugin dikonfigurasi di `src/lib/auth.ts`
- [ ] Form component di forgot-password belum diverifikasi implementasinya lengkap
- [ ] Token expiry handling di reset-password page (show error jika token expired)
- [ ] Rate limiting khusus untuk forgot-password (hanya umum via apiGuard)
- [ ] Konfirmasi sukses yang clear setelah reset berhasil

## Flexibility Checklist
- [ ] Email template untuk reset password dikonfigurasi di Better Auth (`src/lib/auth.ts`) — perlu edit langsung untuk custom branding
- [x] Reset URL otomatis menggunakan `BETTER_AUTH_URL` env var
- [ ] Token expiry duration tidak terexpose sebagai env var — hardcoded di Better Auth default

## Known Issues
- 🟡 **Implementasi belum diverifikasi** — file ada, tapi belum dikonfirmasi form submit bekerja end-to-end dengan email delivery.
- 🟡 **Rate limiting** — endpoint forgot-password bisa di-abuse untuk spam email. Perlu rate limit lebih ketat (misal 3 req/hour per email).

## Cara Customize untuk Project Baru
1. Custom email template: edit konfigurasi `emailAndPassword.sendResetPasswordToken` di `src/lib/auth.ts`
2. Gunakan `RESEND_API_KEY` yang valid di `.env`
3. Set `BETTER_AUTH_URL` ke domain production untuk link yang benar

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
