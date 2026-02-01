import { Roles } from '../src/modules/roles/roles.enum';
import { PrismaClient } from '../src/generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://user:password@192.168.68.113:5432/mydatabase',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedRoles() {
  const roles = Object.values(Roles);

  console.log(`🌱 Seeding ${roles.length} roles...`);

  let created = 0;
  let updated = 0;

  for (const role of roles) {
    const result = await prisma.role.upsert({
      where: { name: role },
      update: { updatedAt: new Date() },
      create: { name: role },
    });

    const isNew =
      Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000;
    isNew ? created++ : updated++;
  }

  console.log(`✔ Roles: ${created} created, ${updated} updated`);
}

async function main() {
  console.log('🚀 Starting database seed...\n');

  await seedRoles();

  console.log('\n✅ Database seeded successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
