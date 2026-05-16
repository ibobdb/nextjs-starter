---
# RBAC — Team Management

## Overview
Teams memungkinkan pemberian permission tambahan ke sekelompok user tanpa mengubah role mereka. Team permissions di-union dengan role permissions di session. Schema ada di `prisma/schema.prisma`, API partial di `src/app/api/teams/`.

## Status
🔄 Partial — 50%

## Completeness Checklist
- [x] Schema: `Team`, `TeamMember`, `TeamPermission` models ada di `prisma/schema.prisma`
- [x] Team permissions di-union ke session via `customSession` di `src/lib/auth.ts`
- [x] List teams (GET `/api/teams`)
- [x] Buat team baru (`POST /api/teams`)
- [ ] Team member management — `GET/POST /api/teams/[id]/members` belum diverifikasi lengkap
- [ ] Team permission management — `GET/POST /api/teams/[id]/permissions` belum diverifikasi lengkap
- [ ] UI: halaman manage team members belum diverifikasi
- [ ] UI: assign permission ke team via UI belum diverifikasi
- [ ] Remove member dari team
- [ ] Delete team
- [ ] Transfer team leadership

## Flexibility Checklist
- [x] Team permissions hanya menambah akses, tidak bisa kurangi (union logic)
- [ ] `TeamMember.role` field adalah string `"LEADER"/"MEMBER"` — tidak extensible, harus edit schema untuk tambah role baru dalam tim
- [x] Team bisa punya permission apapun yang ada di `Permission` table
- [ ] Tidak ada limit berapa team yang bisa diikuti satu user

## Known Issues
- 🟡 **Implementasi team management incomplete**: Schema lengkap, tapi endpoint member dan permission management belum diverifikasi berjalan end-to-end.
- 🟡 **TeamMember.role tidak extensible**: Hanya `"LEADER"` dan `"MEMBER"`. Untuk project dengan struktur tim lebih kompleks, perlu refactor.
- 🟡 **Tidak ada audit log**: Perubahan team membership tidak tercatat.

## Cara Customize untuk Project Baru
1. Tambah team via UI `/dashboard/teams`
2. Assign permission ke team via UI → union otomatis ke session member
3. Untuk custom team roles: ubah `TeamMember.role` dari `String` ke enum di `prisma/schema.prisma`

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
