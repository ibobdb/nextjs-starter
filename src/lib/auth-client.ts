import 'dotenv/config';
import { createAuthClient } from 'better-auth/react';
import { customSessionClient, twoFactorClient, adminClient } from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth';
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  plugins: [
    customSessionClient<typeof auth>(), 
    twoFactorClient(), 
    adminClient()
  ],
});
export const { signIn, signUp, signOut, useSession, getSession, twoFactor } = authClient;
