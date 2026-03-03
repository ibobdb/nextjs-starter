import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { customSession, twoFactor, admin } from 'better-auth/plugins';
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from '@/utils/templates/';

import { sendEmail } from '@/utils/resend';
import { logger } from './logger';

const prisma = new PrismaClient();
const authLogger = logger;

authLogger.info('Initializing Better Auth...');
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 5,
    maxPasswordLength: 128,
    requireEmailVerification: true,
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // 1. Assign 'user' role in our RBAC system
          const userRole = await prisma.roles.findFirst({
            where: { name: 'user' },
          });

          if (userRole) {
            await prisma.userRole.create({
              data: {
                userId: user.id,
                roleId: userRole.id,
              },
            });
          }

          // 2. Set the 'role' field for Better Auth Admin plugin compatibility
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'user' },
          });
        },
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          html: getVerificationEmailTemplate(url, user.name),
        });
      } catch (error) {
        authLogger.error(`Failed to send verification email to ${user.email}`, error);
        throw error;
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 1,
    updateAge: 60 * 60,
  },
  plugins: [
    twoFactor({
      issuer: 'DBStudio Dashboard',
    }),
    admin(),
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
