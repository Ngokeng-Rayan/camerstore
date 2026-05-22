const { PrismaClient } = require('./prisma/generated/client/index.js');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@camerstore.com';
  const password = 'AdminPassword2026!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      name: 'Administrateur',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Compte admin prêt dans la base de données !`);
  console.log(`=============================================`);
  console.log(`Email: ${admin.email}`);
  console.log(`Mot de passe: ${password}`);
  console.log(`=============================================`);
}

main()
  .catch(e => {
    console.error('❌ Erreur lors de la création du compte :', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
