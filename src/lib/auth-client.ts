import 'dotenv/config';
import { createAuthClient } from 'better-auth/react';
import { customSessionClient, twoFactorClient, adminClient } from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth';
export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
  plugins: [
    customSessionClient<typeof auth>(), 
    twoFactorClient(), 
    adminClient()
  ],
});
export const { signIn, signUp, signOut, useSession, getSession, twoFactor } = authClient;
