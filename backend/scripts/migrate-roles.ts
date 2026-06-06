import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, roles: true } });
  let updated = 0;

  for (const user of users) {
    const current = user.roles as string[];
    if (!current || !Array.isArray(current) || current.length === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roles: ['SOCIAL'] },
      });
      updated++;
    } else if (!current.includes('SOCIAL')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roles: [...current, 'SOCIAL'] },
      });
      updated++;
    }
  }
  console.log(`Updated ${updated} users — all have SOCIAL in their roles array`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
