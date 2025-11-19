import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { customSession } from 'better-auth/plugins';
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from '@/utils/templates/';

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
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Reset your password',
          html: getPasswordResetEmailTemplate(url, user.name),
        });
      } catch (error) {
        throw error;
      }
    },
    // onPasswordReset: async ({ user }: any, request: any) => {
    //   console.log(`Password for user ${user.email} has been reset.`);
    // },
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
  plugins: [
    customSession(async ({ user, session }) => {
      const roles = await prisma.user.findFirst({
        where: { id: session.userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const permissionList: string[] =
        roles?.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name)
        ) ?? [];
      const role: string[] =
        roles?.userRoles.flatMap((r) => {
          return r.role.name;
        }) ?? [];
      return {
        user: {
          ...user,
          roles: role,
          permissions: permissionList,
        },
        session,
      };
    }),
  ],
});
