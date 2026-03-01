# Category 2: UI Components

> **Tanggal**: 2026-03-01  
> **Scope**: Custom reusable UI components di `components/common/`  
> **Kategori**: Base — berlaku untuk semua modul DBStudio

---

## Apa yang Berubah

### [NEW] `src/components/common/page-header.tsx`

**Masalah sebelumnya**: Setiap halaman punya markup page-header sendiri dengan struktur yang berbeda-beda. `topic-trends/page.tsx` menggunakan struktur tertentu, `datasources/page.tsx` menggunakan struktur lain (bahkan dengan icon dan layout berbeda).

**Solusi**: Komponen `PageHeader` yang unified dengan props fleksibel.

```tsx
// Penggunaan minimal
<PageHeader title="Topic & Trends" />

// Dengan semua props
<PageHeader
  icon={Database}
  title="Data Sources"
  description="Monitor health data ingestion sources."
  actions={<Button>Trigger Pipeline</Button>}
/>
```

**Props**:
| Prop | Type | Default | Keterangan |
|---|---|---|---|
| `title` | `string` | — | Wajib |
| `description` | `string?` | — | Subtitle |
| `icon` | `LucideIcon?` | — | Icon di kiri judul |
| `actions` | `ReactNode?` | — | Buttons di kanan |
| `className` | `string?` | — | Override class |

---

### [NEW] `src/components/common/empty-state.tsx`

**Masalah sebelumnya**: Empty state inline di setiap tabel — teks berbeda, styling berbeda, tidak ada icon.

**Solusi**: Komponen `EmptyState` yang konsisten.

```tsx
<EmptyState
  icon={Search}
  title="Tidak ada hasil"
  description="Coba ubah filter pencarian."
  action={<Button variant="outline">Reset Filter</Button>}
/>
```

**Default icon**: `PackageOpen` dari lucide-react.

---

### [NEW] `src/components/common/error-state.tsx`

**Masalah sebelumnya**: Error state biasanya hanya `toast.error(...)` lalu data tidak tampil — user tidak tahu harus apa.

**Solusi**: Komponen dengan visual error + tombol "Coba Lagi".

```tsx
<ErrorState
  title="Gagal memuat data"
  description={error?.message}
  onRetry={() => mutate()}
/>
```

---

### [NEW] `src/components/common/status-badge.tsx`

**Masalah sebelumnya**: Logic warna badge berdasarkan status tersebar di tiap tabel. Di `CandidateTable` ada, di tabel lain ada lagi — tidak konsisten dan sulit di-maintain.

**Solusi**: Komponen `StatusBadge` dengan centralized color map.

```tsx
<StatusBadge status="approved" />   // → hijau
<StatusBadge status="rejected" />   // → merah
<StatusBadge status="pending" />    // → kuning
<StatusBadge status="generated" />  // → biru
<StatusBadge status="ignored" />    // → abu-abu
```

**Status yang di-support**:
- **Emerald**: `approved`, `active`, `success`, `online`, `running`, `done`
- **Rose**: `rejected`, `error`, `failed`, `offline`, `cancelled`
- **Amber**: `pending`, `waiting`, `queued`
- **Blue**: `generated`, `processing`, `evaluating`, `draft`
- **Slate**: `ignored`, `skipped`, `disabled`
- **Default (muted)**: status lain yang tidak terdaftar

---

## File yang Berubah

| File | Status | Keterangan |
|---|---|---|
| `src/components/common/page-header.tsx` | **BARU** | Unified page header |
| `src/components/common/empty-state.tsx` | **BARU** | Consistent empty state |
| `src/components/common/error-state.tsx` | **BARU** | Error state + retry |
| `src/components/common/status-badge.tsx` | **BARU** | Centralized status coloring |

---

## Verification Plan (Manual)

### Test 1 — PageHeader tampil benar

1. Buka halaman yang sudah menggunakan `<PageHeader>` (halaman baru)
2. ✅ **Ekspektasi**: 
   - Judul tampil di kiri, action button di kanan
   - Di mobile (`< sm`), action button turun ke bawah (flex wrap)
   - Jika ada `icon` prop, icon tampil dalam kotak rounded di kiri judul

---

### Test 2 — EmptyState tampil saat data kosong

1. Buka halaman yang menggunakan `<EmptyState>`
2. Pastikan data memang kosong (misal filter yang tidak menghasilkan apa-apa)
3. ✅ **Ekspektasi**:
   - Icon tampil di tengah dalam lingkaran muted
   - Judul dan deskripsi tampil di bawah icon
   - Jika ada `action` prop, button tampil di bawah deskripsi

---

### Test 3 — ErrorState tampil saat fetch gagal

1. Stop backend API (ts-worker)
2. Buka halaman yang menggunakan `<ErrorState>`
3. ✅ **Ekspektasi**:
   - Icon `AlertCircle` warna merah tampil
   - Tombol "Coba Lagi" tampil jika ada `onRetry` prop
   - Klik "Coba Lagi" → trigger refetch

---

### Test 4 — StatusBadge color accuracy

1. Buka halaman yang menampilkan `<StatusBadge>`
2. Verifikasi warna untuk setiap status:
   - ✅ `approved` → hijau
   - ✅ `rejected` → merah/rose
   - ✅ `pending` → amber/kuning
   - ✅ `generated` → biru
   - ✅ `ignored` → abu-abu
3. Dark mode: toggle theme → warna tetap terbaca (sudah ada `dark:` variant)

---

> Docs ini bagian dari **DBStudio Base Project** — komponen ini tersedia untuk semua modul DBStudio.
