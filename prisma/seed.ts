import { auth } from '../lib/auth';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

  const existing = await prisma.user.findFirst({
    where: { email: adminEmail },
  });
  if (existing) {
    console.log('Admin user already exists.');
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: 'Admin',
    },
  });

  if (result?.user?.id) {
    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: 'admin' },
    });
    console.log('Admin user created.');
  }
}

const EXPENSE_CATEGORIES = [
  { name: 'Moradia', color: '#EF4444', type: 'EXPENSE' as const },
  { name: 'Alimentação', color: '#F59E0B', type: 'EXPENSE' as const },
  { name: 'Transporte', color: '#3B82F6', type: 'EXPENSE' as const },
  { name: 'Saúde', color: '#10B981', type: 'EXPENSE' as const },
  { name: 'Educação', color: '#8B5CF6', type: 'EXPENSE' as const },
  { name: 'Entretenimento', color: '#EC4899', type: 'EXPENSE' as const },
  { name: 'Compras', color: '#6366F1', type: 'EXPENSE' as const },
  { name: 'Serviços', color: '#14B8A6', type: 'EXPENSE' as const },
  { name: 'Pessoal', color: '#F97316', type: 'EXPENSE' as const },
  { name: 'Investimentos', color: '#84CC16', type: 'EXPENSE' as const },
  { name: 'Outros', color: '#6B7280', type: 'EXPENSE' as const },
];

const INCOME_CATEGORIES = [
  { name: 'Salário', color: '#22C55E', type: 'INCOME' as const },
  { name: 'Freelance', color: '#06B6D4', type: 'INCOME' as const },
  { name: 'Investimentos', color: '#84CC16', type: 'INCOME' as const },
  { name: 'Aluguel recebido', color: '#A855F7', type: 'INCOME' as const },
  { name: 'Bônus', color: '#EAB308', type: 'INCOME' as const },
  { name: 'Outros', color: '#6B7280', type: 'INCOME' as const },
];

async function main() {
  await seedAdmin();
  for (const cat of [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: cat.name, type: cat.type },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          color: cat.color,
          type: cat.type,
          userId: null,
        },
      });
    }
  }
  console.log('Seed completed: default categories created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
