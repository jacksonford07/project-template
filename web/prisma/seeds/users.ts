/**
 * User Seed Data
 *
 * Creates test users for development and staging environments.
 * Production should NOT seed users - they come from real signups.
 */

import { PrismaClient, AccountType } from '@prisma/client';

export interface SeededUser {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
}

export async function seedUsers(prisma: PrismaClient): Promise<SeededUser[]> {
  console.log('Seeding users...');

  const users: SeededUser[] = [];

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      accountType: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  users.push({
    id: admin.id,
    email: admin.email!,
    name: admin.name!,
    accountType: admin.accountType!,
  });
  console.log(`  ✓ Created admin: ${admin.email}`);

  // Regular users
  const regularUsers = [
    { email: 'alice@example.com', name: 'Alice Johnson' },
    { email: 'bob@example.com', name: 'Bob Smith' },
    { email: 'charlie@example.com', name: 'Charlie Brown' },
  ];

  for (const userData of regularUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        accountType: 'USER',
        emailVerified: new Date(),
      },
    });
    users.push({
      id: user.id,
      email: user.email!,
      name: user.name!,
      accountType: user.accountType!,
    });
    console.log(`  ✓ Created user: ${user.email}`);
  }

  // Guest user (for demo purposes)
  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      name: 'Guest User',
      accountType: 'GUEST',
      emailVerified: new Date(),
    },
  });
  users.push({
    id: guest.id,
    email: guest.email!,
    name: guest.name!,
    accountType: guest.accountType!,
  });
  console.log(`  ✓ Created guest: ${guest.email}`);

  console.log(`Seeded ${users.length} users`);
  return users;
}
