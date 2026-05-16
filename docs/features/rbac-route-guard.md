---
# RBAC — Route Guard

## Overview
Proteksi route di dashboard. Ada dua lapisan: (1) `RouteGuard` client component yang mount di dashboard layout, (2) tidak ada middleware server-side. RouteGuard fetch `/api/menus` lalu bandingkan pathname dengan URL yang user diizinkan akses.

## Status
✅ Done (client-side) — 90%
❌ Missing (server-side middleware) — 0%

## Completeness Checklist
- [x] `RouteGuard` client component di `src/lib/rbac/components/RouteGuard.tsx`
- [x] Whitelist routes yang selalu bisa diakses (`/dashboard/default`, `/dashboard/no-access`, `/dashboard/profile`)
- [x] Super admin bypass semua route check
- [x] Redirect ke `/dashboard/default` jika route tidak authorized
- [x] Integrasikan dengan dynamic menu system (hanya URL dari `/api/menus` yang diizinkan)
- [x] Skip saat session atau menu masih loading
- [ ] **Server-side middleware** (`src/middleware.ts`) — tidak ada
- [ ] Proteksi terhadap direct API call bypass (server guard)
- [ ] Flash of content sebelum redirect (client-side gap)
- [ ] Guard untuk route di luar `/dashboard`

## Flexibility Checklist
- [x] Route baru otomatis ter-protect jika ditambahkan ke menu DB (data-driven)
- [ ] Whitelist hardcoded di `RouteGuard.tsx` — perlu edit kode untuk tambah whitelist route baru
- [x] Tidak perlu ubah kode RouteGuard untuk tambah route yang di-protect — cukup tambah menu ke DB
- [ ] Tidak ada server-side enforcement — RouteGuard bisa di-bypass dengan disable JavaScript atau DevTools

## Known Issues
- 🔴 **Tidak ada middleware server-side**: `src/middleware.ts` tidak ada. User yang tidak login bisa mencoba akses `/dashboard` langsung tanpa redirect ke login — proteksi hanya di client-side. Ini gap serius untuk starter kit.
- 🟡 **Flash of content**: Ada jeda singkat sebelum RouteGuard redirect — user bisa melihat sekilas konten yang tidak diizinkan.
- 🔵 **Whitelist hardcoded**: Array `WHITELIST` di `RouteGuard.tsx` harus diedit di kode untuk tambah route baru yang boleh diakses tanpa permission.

## Cara Customize untuk Project Baru
1. Tambah route yang di-protect: tambah menu ke DB via seed atau UI admin
2. Tambah whitelist route: edit array `WHITELIST` di `src/lib/rbac/components/RouteGuard.tsx`
3. **[Recommended]** Tambah `src/middleware.ts` untuk server-side redirect unauthenticated users:
   ```typescript
   // src/middleware.ts (minimal)
   import { NextRequest, NextResponse } from 'next/server';
   import { getSessionCookie } from 'better-auth/cookies';
   
   export function middleware(req: NextRequest) {
     const session = getSessionCookie(req);
     if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
       return NextResponse.redirect(new URL('/login', req.url));
     }
   }
   
   export const config = {
     matcher: ['/dashboard/:path*']
   };
   ```

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
