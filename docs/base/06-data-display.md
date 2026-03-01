# Category 6: Data Display

> **Tanggal**: 2026-03-01  
> **Scope**: Generic table wrapper reusable untuk semua modul  
> **Kategori**: Base — berlaku untuk semua modul DBStudio

---

## Apa yang Berubah

### [NEW] `src/components/common/app-table.tsx`

Wrapper komponen di atas **TanStack Table** yang sudah ada di project (`@tanstack/react-table`).

**Masalah sebelumnya**: Setiap tabel (kandidat, topic, datasource, dll.) mengimplementasi table sendiri dengan:
- Loading state berbeda-beda (ada yang pakai `animate-pulse` inline, `DataLoader`, dll.)
- Empty state berbeda-beda (ada yang pakai `TableCell colSpan` inline)
- Tidak ada error state
- Pagination tidak ada atau implementasi sendiri-sendiri

**Solusi**: `AppTable<TData>` yang menangani semua kondisi secara konsisten.

---

## Fitur AppTable

### 1. Built-in Loading State
Otomatis render `DataLoader variant="table"` saat `isLoading={true}`.

### 2. Built-in Empty State
Otomatis render `EmptyState` saat data kosong, dengan props kustomisasi:
```tsx
<AppTable
  emptyTitle="Tidak ada topik"
  emptyDescription="Coba ubah filter atau tambahkan topik baru."
  emptyIcon={Search}
  emptyAction={<Button>Tambah Topik</Button>}
/>
```

### 3. Built-in Error State
Otomatis render `ErrorState` saat ada `error` prop, dengan tombol "Coba Lagi":
```tsx
<AppTable error={error} onRetry={refetch} />
```

### 4. Optional Pagination
Built-in prev/next pagination yang terintegrasi dengan `usePagination` hook:
```tsx
const pagination = usePagination()
<AppTable pagination={{ ...pagination, total: 120 }} />
```

---

## Contoh Penggunaan Lengkap

```tsx
import { AppTable } from '@/components/common/app-table'
import { StatusBadge } from '@/components/common/status-badge'
import { useData } from '@/hooks/use-data'
import { usePagination } from '@/hooks/use-pagination'
import type { ColumnDef } from '@tanstack/react-table'

type Topic = { id: string; title: string; status: string }

const columns: ColumnDef<Topic>[] = [
  { accessorKey: 'title', header: 'Judul' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
]

export function TopicList() {
  const pagination = usePagination()
  const { data = [], isLoading, error, refetch } = useData(
    `topics?page=${pagination.page}`,
    () => topicsApi.getAll({ page: pagination.page })
  )

  return (
    <AppTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      pagination={{ ...pagination, total: 120 }}
      emptyTitle="Belum ada topik"
    />
  )
}
```

---

## File yang Berubah

| File | Status | Keterangan |
|---|---|---|
| `src/components/common/app-table.tsx` | **BARU** | Generic TanStack Table wrapper |

> [!NOTE]
> Komponen tabel yang sudah ada (`CandidateTable`, dll.) **tidak diubah** untuk menghindari regresi.  
> `AppTable` digunakan untuk halaman dan komponen **baru** mulai sekarang.

---

## Verification Plan (Manual)

### Test 1 — Loading state

1. Buat komponen yang menggunakan `AppTable` dengan `isLoading={true}`
2. ✅ **Ekspektasi**: Tampil skeleton table (baris abu-abu beranimasi)

---

### Test 2 — Empty state

1. Buat komponen yang menggunakan `AppTable` dengan `data={[]}` dan `isLoading={false}`
2. ✅ **Ekspektasi**: Tampil `EmptyState` dengan icon, title, dan description

---

### Test 3 — Error state

1. Buat komponen yang menggunakan `AppTable` dengan `error={new Error("Test error")}`
2. ✅ **Ekspektasi**: Tampil `ErrorState` dengan icon merah dan tombol "Coba Lagi"
3. Klik "Coba Lagi" → `onRetry` callback dipanggil

---

### Test 4 — Pagination

1. Buat `AppTable` dengan `pagination={{ page: 1, pageSize: 10, total: 35, setPage }}`
2. ✅ **Ekspektasi**: 
   - Tampil "Halaman 1 dari 4 (35 item)"
   - Tombol `<` disabled (di halaman 1)
   - Klik `>` → page berubah ke 2
3. Di halaman terakhir: tombol `>` disabled

---

### Test 5 — Data tampil dengan columns yang benar

1. Buat `AppTable` dengan `data` dan `columns` yang valid
2. ✅ **Ekspektasi**: Header tabel sesuai column definition, data di setiap baris sesuai `accessorKey`

---

> Docs ini bagian dari **DBStudio Base Project**.
