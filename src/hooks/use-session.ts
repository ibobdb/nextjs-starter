'use client';

/**
 * useSession — Centralized session hook (DBStudio Base)
 *
 * Single SWR instance untuk session. Semua komponen yang membutuhkan
 * data user / roles / permissions cukup memanggil hook ini.
 * SWR akan deduplicate request secara otomatis sehingga tidak ada
 * multiple getSession() calls meskipun hook dipanggil di banyak tempat.
 */

import useSWR from 'swr';
import { getSession } from '@/lib/auth-client';

const SESSION_KEY = 'session';

async function sessionFetcher() {
  const res = await getSession();
  return res?.data ?? null;
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  roles: string[];
  permissions: string[];
};

export type SessionData = {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
  };
};

export function useSession() {
  const { data, isLoading, error, mutate } = useSWR<SessionData | null>(
    SESSION_KEY,
    sessionFetcher,
    {
      // Refresh saat window kembali focus agar session tidak stale
      revalidateOnFocus: true,
      // Jangan retry berlebihan saat error auth
      shouldRetryOnError: false,
      // Deduplicate dalam 5 detik
      dedupingInterval: 5000,
    }
  );

  return {
    /** Full session object (user + session metadata) */
    session: data,
    /** Shortcut ke user object (id, name, email, image, roles, permissions) */
    user: data?.user ?? null,
    /** True saat initial load */
    isLoading,
    /** Error jika fetch gagal */
    error,
    /** Panggil untuk refresh session (misal setelah login/logout) */
    refresh: mutate,
    /** Apakah user sudah login */
    isAuthenticated: !!data?.user,
  };
}
