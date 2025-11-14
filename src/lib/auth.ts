import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { getVerificationEmailTemplate } from '@/utils/templates/verification-email';
import { sendEmail } from '@/utils/resend';
const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 5,
    maxPasswordLength: 128,
    requireEmailVerification: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          html: getVerificationEmailTemplate(url, user.name),
        });
      } catch (error) {
        throw error;
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 1,
    updateAge: 60 * 60,
  },
  // session: {
  //   expiresIn: 30,
  //   updateAge: 30,
  // },
});
