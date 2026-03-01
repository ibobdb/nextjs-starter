# Category 3: Data Layer

> **Tanggal**: 2026-03-01  
> **Scope**: Hooks standar untuk data fetching dan state utilities  
> **Kategori**: Base — berlaku untuk semua modul DBStudio

---

## Apa yang Berubah

### [NEW] `src/hooks/use-data.ts`

**Masalah sebelumnya**: Setiap page/komponen mengimplementasi fetch sendiri dengan pattern yang berbeda-beda:

```ts
// Pattern lama yang berulang di setiap page (~40 baris per page):
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const fetchData = useCallback(async () => { ... }, [])
useEffect(() => { fetchData() }, [fetchData])
```

**Solusi**: Hook `useData<T>()` berbasis SWR — fetch sekali, cache otomatis.

```ts
// Pattern baru (1 baris):
const { data, isLoading, error, refetch } = useData('key', () => api.getData())
```

**Fitur utama**:
- `transform` option untuk reshape raw API response
- `refreshInterval` untuk auto-polling
- `null` key untuk skip fetch secara conditional
- Return `isError` boolean untuk convenience
- `refetch()` shorthand untuk `mutate()`

**Contoh dengan transform**:
```ts
const { data: growthData } = useData(
  'growth-metrics',
  () => statsApi.getGrowthMetrics(),
  {
    transform: (res) => res.data?.summary ?? []
  }
)
```

---

### [NEW] `src/hooks/use-pagination.ts`

Mengelola state pagination secara terstandarisasi.

```ts
const pagination = usePagination({ initialPage: 1, initialPageSize: 10 })

// State yang tersedia:
pagination.page        // halaman aktif (1-indexed)
pagination.pageSize    // items per page
pagination.offset      // (page - 1) * pageSize — untuk query
pagination.setPage(2)
pagination.changePageSize(20) // ubah pageSize dan reset ke page 1
pagination.reset()            // kembali ke halaman awal
```

---

### [NEW] `src/hooks/use-debounce.ts`

Menunda update nilai hingga user berhenti input. Penting untuk search agar tidak trigger fetch di setiap keystroke.

```ts
const [query, setQuery] = useState('')
const debouncedQuery = useDebounce(query, 400) // delay 400ms

// useData hanya re-fetch saat debouncedQuery berubah
const { data } = useData(
  `topics?q=${debouncedQuery}`,
  () => topicsApi.search(debouncedQuery)
)
```

---

## File yang Berubah

| File | Status | Keterangan |
|---|---|---|
| `src/hooks/use-data.ts` | **BARU** | Generic SWR data hook |
| `src/hooks/use-pagination.ts` | **BARU** | Pagination state manager |
| `src/hooks/use-debounce.ts` | **BARU** | Debounce utility hook |

---

## Verification Plan (Manual)

### Test 1 — Tidak ada double fetch dengan useData

1. Buka halaman yang menggunakan `useData`
2. NetDevTools → Network tab → amati request
3. ✅ **Ekspektasi**: Data hanya di-fetch sekali saat pertama mount. Navigasi keluar-masuk halaman yang sama: SWR return data dari cache, tidak ada request baru (kecuali cache expired)

---

### Test 2 — Refetch berfungsi

1. Klik tombol "Refresh" / "Retry" yang memanggil `refetch()`
2. ✅ **Ekspektasi**: Network request baru muncul, data di-update

---

### Test 3 — usePagination state management

1. Di halaman dengan `usePagination`, ganti halaman ke page 3
2. Ganti `pageSize`
3. ✅ **Ekspektasi**: Setelah `changePageSize()`, page kembali ke 1 secara otomatis

---

### Test 4 — useDebounce delay

1. Di search input, ketik cepat 5 karakter dalam < 400ms
2. ✅ **Ekspektasi**: Di Network tab, hanya ada 1 fetch request (bukan 5). Request baru muncul ~400ms setelah ketikan berhenti.

---

> Docs ini bagian dari **DBStudio Base Project**.
