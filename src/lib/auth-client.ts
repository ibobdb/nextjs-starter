import 'dotenv/config';
import { createAuthClient } from 'better-auth/react';
import { customSessionClient } from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth';
export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
  plugins: [customSessionClient<typeof auth>()],
});
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
