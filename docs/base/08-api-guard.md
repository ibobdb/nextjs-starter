# API Route Guard (`api-guard.ts`)

`apiGuard` adalah helper function server-side yang digunakan untuk melindungi Next.js API Routes (`/api/...`) di dalam DBStudio. Helper ini memastikan bahwa setiap request diverifikasi _session_-nya dan (opsional) diperiksa _permission_-nya sebelum mengeksekusi logika utama.

## Lokasi File
`src/lib/api-guard.ts`

## Mengapa Dibutuhkan?
Meskipun `src/middleware.ts` (`proxy.ts`) sudah melindungi rute halaman frontend (`/dashboard/*`), ia sengaja dikonfigurasi untuk mengabaikan endpoint `/api/*`. Hal ini dilakukan agar API route dapat di-hit secara independen. Namun, ini berarti **setiap API route harus melakukan keamanan dan otorisasi sendiri**.

`apiGuard` mempermudah tugas ini dengan pendekatan yang standar, terpusat, dan *type-safe*.

---

## Penggunaan (Usage)

### 1. Perlindungan Dasar (Hanya Autentikasi)
Gunakan pemanggilan tanpa parameter jika Anda hanya ingin memastikan user sudah login.

```ts
import { NextResponse } from 'next/server';
import { apiGuard } from '@/lib/api-guard';

export async function GET() {
  const guard = await apiGuard();
  
  // Jika error (tidak login), kembalikan error response
  if (guard.error) return guard.error;

  // Jika lolos, Anda bisa mengakses data user yang request
  const user = guard.session.user;

  return NextResponse.json({ success: true, message: `Hello ${user.name}` });
}
```

### 2. Perlindungan dengan 1 Permission
Jika operasi tersebut membutuhkan permission spesifik (contoh: menulis data trendscout), berikan permission key sebagai string.

```ts
import { NextResponse } from 'next/server';
import { apiGuard } from '@/lib/api-guard';

export async function POST(request: Request) {
  // Hanya user dengan permission "trendscout.write" yang bisa lewat
  const guard = await apiGuard('trendscout.write');
  if (guard.error) return guard.error;

  const body = await request.json();
  // ... process write operation
}
```

### 3. Perlindungan dengan Beberapa Permission (OR)
Jika operasi mengizinkan salah satu dari beberapa permission, berikan array permission key. User lolos jika memiliki **minimal satu** di antaranya.

```ts
import { NextResponse } from 'next/server';
import { apiGuard } from '@/lib/api-guard';

export async function DELETE(request: Request) {
  // User dengan permission "user.delete" ATAU "super_admin" bisa menghapus data
  const guard = await apiGuard(['user.delete', 'super_admin']);
  if (guard.error) return guard.error;

  // ... process delete operation
}
```

---

## Type Return (`GuardResult`)

Fungsi `apiGuard` mereturn obyek dengan tipe diskriminan (discriminated union) `GuardResult`:

- **Jika Gagal (Unauthorized/Forbidden)**
  - `guard.error` bernilai `NextResponse` (langsung bisa di-return)
  - `guard.session` bernilai `null`

- **Jika Berhasil**
  - `guard.error` bernilai `null`
  - `guard.session` bernilai obyek session, dengan `guard.session.user` yang berisi profil lengkap dan array string `permissions` & `roles`.

---

## Tips & Best Practices
1. Selalu panggil `const guard = await apiGuard(...)` di baris **paling awal** dalam function handler route.
2. Selalu cek `if (guard.error) return guard.error;` segera setelah dipanggil.
3. Hindari menggunakan pengecekan manual (`getSession` dan manual check `.includes()`)—gunakan `apiGuard()` agar penanganan error status code (401 vs 403) seragam di seluruh aplikasi.
