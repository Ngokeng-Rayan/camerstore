const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const closerPassword = await bcrypt.hash('closer123', 10);

  // Créer l'administrateur
  const admin = await prisma.user.upsert({
    where: { email: 'admin@camerstore.com' },
    update: {},
    create: {
      email: 'admin@camerstore.com',
      name: 'Patron Camerstore',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Créer un closer pour tester
  const closer = await prisma.user.upsert({
    where: { email: 'marie.closer@camerstore.com' },
    update: {},
    create: {
      email: 'marie.closer@camerstore.com',
      name: 'Marie (Closer)',
      password: closerPassword,
      role: 'CLOSER',
    },
  });

  console.log('✅ Base de données initialisée avec les utilisateurs suivants :');
  console.log(`👤 Admin: ${admin.email} (mdp: admin123)`);
  console.log(`📞 Closer: ${closer.email} (mdp: closer123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
