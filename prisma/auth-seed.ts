import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@spencerdenim.com' },
    update: {},
    create: {
      email: 'admin@spencerdenim.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@spencerdenim.com' },
    update: {},
    create: {
      email: 'manager@spencerdenim.com',
      name: 'Manager User',
      password: managerPassword,
      role: 'manager',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@spencerdenim.com' },
    update: {},
    create: {
      email: 'user@spencerdenim.com',
      name: 'Regular User',
      password: userPassword,
      role: 'user',
    },
  });

  console.log('Seed data created:');
  console.log('Admin:', { email: admin.email, password: 'admin123' });
  console.log('Manager:', { email: manager.email, password: 'manager123' });
  console.log('User:', { email: user.email, password: 'user123' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
