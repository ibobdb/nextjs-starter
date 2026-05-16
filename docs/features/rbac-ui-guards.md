---
# RBAC — UI Guards

## Overview
Komponen dan hooks untuk conditional rendering berbasis permission/role di sisi client. Mencakup `<Can>`, `<Role>`, `usePermission()`, dan `useRole()`.

## Status
✅ Done — 100%

## Completeness Checklist
- [x] `<Can permission="x.y">` component — `src/lib/rbac/components/can.tsx`
- [x] `<Role role="admin">` component — `src/lib/rbac/components/role.tsx`
- [x] `usePermission('x.y')` hook — `src/lib/rbac/hooks/usePermission.ts`
- [x] `useRole('admin')` hook — `src/lib/rbac/hooks/useRole.ts`
- [x] `fallback` prop untuk render saat tidak punya akses
- [x] `loading` prop untuk render saat session masih loading
- [x] Super admin bypass di semua hooks dan components (selalu `allowed: true`)
- [x] Multiple roles check (OR logic) di `useRole()` dan `<Role>`
- [x] `isLoading` return value untuk prevent flash of content

## Flexibility Checklist
- [x] Sepenuhnya generic — tidak ada permission string yang hardcoded di dalam komponen
- [x] Bisa dipakai di komponen manapun, tidak terikat ke halaman spesifik
- [x] Tidak perlu ubah core files untuk tambah permission atau role check baru
- [x] Pattern yang konsisten antara `<Can>` dan `usePermission()` — keduanya pakai sumber data yang sama

## Known Issues
- 🟢 **`<Can>` hanya support single permission**: `<Can permission="x.y">` hanya terima satu string. Untuk OR logic (cukup salah satu dari beberapa permission), user harus pakai `usePermission()` manual atau nested `<Can>`. Sebaiknya tambah prop `permissions={['x.y', 'a.b']}` dengan OR logic.

## Cara Customize untuk Project Baru
Tidak perlu customize — komponen ini sepenuhnya generic. Cukup gunakan:

```tsx
// Permission-based
<Can permission="invoice.create">
  <CreateButton />
</Can>

// Role-based
<Role role={['admin', 'super_admin']}>
  <AdminSection />
</Role>

// Dengan loading state
<Can permission="user.delete" loading={<Skeleton />} fallback={null}>
  <DeleteButton />
</Can>

// Hook
const { allowed, isLoading } = usePermission('user.create');
```

## Testing Notes
<!-- Kosongkan -->

## Changelog
- 2026-05-16 — initial audit
