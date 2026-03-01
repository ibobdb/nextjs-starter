# Category 5: Navigation

> **Tanggal**: 2026-03-01  
> **Scope**: Sidebar user info dinamis, fix subItem dropdown, split nav per modul  
> **Kategori**: Base — berlaku untuk semua modul DBStudio

---

## Apa yang Berubah

### [MODIFY] `src/components/app-sidebar.tsx`

**Fix 1 — Dynamic user info**

**Sebelum**: Nama dan email user di footer sidebar hardcoded:
```tsx
<AvatarImage src="https://github.com/ibobdb.png" alt="Boby Nugraha" />
<span>Boby Nugraha</span>
<span>bobynugraha19@gmail.com</span>
```

**Sesudah**: Data diambil dari `useSession()` dengan skeleton loading:
```tsx
const { user, isLoading: sessionLoading } = useSession()
// Skeleton tampil saat loading, data user tampil setelah session ready
<AvatarImage src={user?.image ?? ''} alt={user?.name ?? 'User'} />
<span>{user?.name ?? 'Unknown User'}</span>
<span>{user?.email ?? ''}</span>
```

AvatarFallback menggunakan inisial dari nama user (misal "Boby Nugraha" → "BN").

---

**Fix 2 — subItem dropdown**

**Sebelum**: Setiap `subItem` membuat `<DropdownMenu>` terpisah — jika ada 3 subItem, ada 3 dropdown icon berbeda di satu nav item.

**Sesudah**: Semua `subItem` dari satu parent dikumpulkan dalam satu `<DropdownMenu>`:
```tsx
// Satu trigger MoreHorizontal → satu DropdownMenu berisi semua subItem
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <SidebarMenuAction><MoreHorizontal /></SidebarMenuAction>
  </DropdownMenuTrigger>
  <DropdownMenuContent side="right">
    {item.subItem.map(subitem => (
      <DropdownMenuItem key={subitem.url} asChild>
        <Link href={subitem.url}>{subitem.title}</Link>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

---

### [MODIFY] `src/data/siderbar.ts` → Aggregator

**Sebelum**: 131 baris berisi semua nav item hardcoded dalam satu file.

**Sesudah**: 22 baris — import dan gabungkan dari sub-files:
```ts
import { generalNav } from './nav/general'
import { trendscoutNav } from './nav/trendscout'
import { adminNav } from './nav/admin'

export const items = [...generalNav, ...trendscoutNav, ...adminNav]
```

**Cara menambah modul baru**: Buat `src/data/nav/[nama-modul].ts`, lalu import di `siderbar.ts`.

---

### [NEW] `src/data/nav/types.ts`
Shared TypeScript types: `NavGroup`, `NavItem`, `SubItem`.

### [NEW] `src/data/nav/general.ts`
Nav config grup "Dashboard" (Default page).

### [NEW] `src/data/nav/trendscout.ts`
Nav config grup "TrendScout" (Discovery, Topic & Trends, Clustering, Datasources, Content, Settings).

### [NEW] `src/data/nav/admin.ts`
Nav config grup "User & Access" (Users + subItem, Teams, Access Control).

---

## File yang Berubah

| File | Status | Keterangan |
|---|---|---|
| `src/components/app-sidebar.tsx` | Diperbarui | Dynamic user info, fix subItem dropdown |
| `src/data/siderbar.ts` | Diperbarui | Menjadi aggregator |
| `src/data/nav/types.ts` | **BARU** | Shared nav types |
| `src/data/nav/general.ts` | **BARU** | Dashboard nav |
| `src/data/nav/trendscout.ts` | **BARU** | TrendScout nav |
| `src/data/nav/admin.ts` | **BARU** | Admin nav |

---

## Verification Plan (Manual)

### Test 1 — User info di sidebar sesuai akun login

1. Login ke aplikasi
2. Perhatikan footer sidebar
3. ✅ **Ekspektasi**: Nama dan email menampilkan data akun yang sedang login (bukan "Boby Nugraha")
4. ✅ **Ekspektasi**: AvatarFallback menampilkan inisial nama (misal "AB" untuk "Ahmad Bachri")

---

### Test 2 — Skeleton loading di user info

1. Throttle network ke **Slow 3G**
2. Hard refresh dashboard
3. ✅ **Ekspektasi**: Footer sidebar menampilkan dua skeleton bar saat loading, kemudian diganti dengan nama dan email setelah session ready

---

### Test 3 — subItem dropdown berfungsi benar

1. Login sebagai `super_admin`
2. Hover nav item "Users" di sidebar
3. Klik icon `⋯` di kanan
4. ✅ **Ekspektasi**: Satu dropdown muncul berisi semua sub-items: "Create", "Roles & Permissions", "Activity" (bukan 3 dropdown terpisah)
5. Klik salah satu sub-item → halaman yang sesuai terbuka

---

### Test 4 — Sidebar nav sesuai role

1. Login sebagai `manager`
2. ✅ **Ekspektasi**: Grup "User & Access" tidak tampil di sidebar
3. Logout, login sebagai `super_admin`
4. ✅ **Ekspektasi**: Semua grup tampil termasuk "User & Access"

---

### Test 5 — Sidebar collapse masih berfungsi

1. Klik tombol collapse sidebar
2. ✅ **Ekspektasi**: Nav item tampil hanya icon, tooltip muncul saat hover
3. Footer sidebar shows Avatar saja (tanpa nama/email)
4. Expand kembali → nama dan email muncul lagi

---

> Docs ini bagian dari **DBStudio Base Project**.
