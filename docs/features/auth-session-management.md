---
# Auth — Session Management

## Overview
Session dikelola oleh Better Auth. Custom session plugin di `src/lib/auth.ts` meng-inject `roles[]`, `permissions[]`, dan `teams[]` ke setiap session. Client-side session di-cache via SWR di `src/hooks/use-session.ts`.

## Status
✅ Done — 85%

## Completeness Checklist
- [x] Session expiry: 24 jam (`expiresIn: 86400`)
- [x] Session refresh: setiap 1 jam (`updateAge: 3600`)
- [x] Session enrichment dengan roles + permissions + teams per request (fresh dari DB)
- [x] Per-request deduplication via React `cache()` — bukan persistent cache
- [x] Secure cookies di production
- [x] Session tracking: IP address dan user agent tersimpan di `Session` model
- [ ] Logout dari semua device (revoke semua session) — belum ada UI/endpoint
- [ ] Session impersonation oleh super admin — schema ada (`Session.impersonatedBy`), endpoint tidak ada
- [ ] Real-time session invalidation saat role/permission dicabut
- [ ] "Remember me" (persistent session lebih dari 24 jam) belum diexpose ke UI

## Flexibility Checklist
- [ ] Session expiry hardcoded di `src/lib/auth.ts:159` — baiknya via env var `SESSION_EXPIRY`
- [x] Custom session fields: extend `customSession` plugin di `src/lib/auth.ts` dan update `ExtendedUser` di `src/lib/rbac/types.ts`
- [x] SWR dedup window (5 detik) dikonfigurasi di `src/hooks/use-session.ts:50`
- [ ] Menu dedup window (5 menit) hardcoded di `RouteGuard.tsx:31`

## Known Issues
- 🟡 **Delay revocation**: Ketika role user dicabut, session client-side masih valid selama ~5 detik (SWR dedup window). Untuk keamanan tinggi, perlu force-refresh session setelah role change.
- 🟡 **Logout all devices**: Tidak ada endpoint/UI untuk revoke semua session user. Berguna untuk kasus akun compromised.
- 🔵 **Session expiry hardcoded**: `expiresIn: 60 * 60 * 24` di `src/lib/auth.ts:159` — pindahkan ke env var untuk fleksibilitas per-project.

## Cara Customize untuk Project Baru
1. Ubah `expiresIn` dan `updateAge` di `src/lib/auth.ts` untuk session duration yang berbeda
2. Untuk tambah data custom di session: edit `customSession` di `src/lib/auth.ts` dan `ExtendedUser` di `src/lib/rbac/types.ts`
3. Logout all devices: implement `auth.revokeAllSessions(userId)` dari Better Auth

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
