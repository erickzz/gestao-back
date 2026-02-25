import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { admin, openAPI } from 'better-auth/plugins';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  trustedOrigins: [process.env.FRONTEND_URL!],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    openAPI(),
    admin({
      defaultRole: 'user',
      adminUserIds:
        process.env.ADMIN_USER_IDS?.split(',').filter(Boolean) ?? [],
    }),
  ],
});
