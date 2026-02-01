import { Roles } from '../src/modules/roles/roles.enum';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const roles = Object.values(Roles);

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  console.log(`✔ Seeded roles: ${roles.join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
