/**
 * Database Seed Script
 *
 * Seeds the database with initial data based on the current environment.
 *
 * Usage:
 *   pnpm db:seed              # Uses NODE_ENV (default: development)
 *   pnpm db:seed:dev          # Force development seeds
 *   pnpm db:seed:staging      # Force staging seeds
 *   pnpm db:seed:prod         # Force production seeds (minimal)
 *
 * Environment Variable:
 *   SEED_ENV=development|staging|production
 */

import { PrismaClient } from '@prisma/client';
import { seedUsers, seedProjects, seedNotes } from './seeds';

const prisma = new PrismaClient();

// ============================================
// Environment Configuration
// ============================================

type SeedEnvironment = 'development' | 'staging' | 'production';

function getSeedEnvironment(): SeedEnvironment {
  // Check for explicit SEED_ENV first
  const seedEnv = process.env.SEED_ENV;
  if (seedEnv && ['development', 'staging', 'production'].includes(seedEnv)) {
    return seedEnv as SeedEnvironment;
  }

  // Fall back to NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') return 'production';
  if (nodeEnv === 'test' || nodeEnv === 'staging') return 'staging';

  return 'development';
}

// ============================================
// Seed Functions by Environment
// ============================================

async function seedDevelopment(): Promise<void> {
  console.log('\n📦 Seeding DEVELOPMENT environment...\n');

  // Full seed with test data
  const users = await seedUsers(prisma);
  await seedProjects(prisma, users);
  await seedNotes(prisma, users);

  console.log('\n✅ Development seed complete!\n');
}

async function seedStaging(): Promise<void> {
  console.log('\n📦 Seeding STAGING environment...\n');

  // Moderate data set - users and some projects, fewer notes
  const users = await seedUsers(prisma);
  await seedProjects(prisma, users);

  // Only create notes for admin user in staging
  const adminUsers = users.filter((u) => u.accountType === 'ADMIN');
  if (adminUsers.length > 0) {
    await seedNotes(prisma, adminUsers);
  }

  console.log('\n✅ Staging seed complete!\n');
}

async function seedProduction(): Promise<void> {
  console.log('\n📦 Seeding PRODUCTION environment...\n');
  console.log('  ⚠ Production seeds are minimal for safety.\n');

  // Production: Only create system-level data if needed
  // DO NOT create test users, projects, or notes in production

  // Example: Seed system configuration, default categories, etc.
  // await seedSystemConfig(prisma);

  console.log('  ℹ No user data seeded in production.');
  console.log('  ℹ Users should sign up through the normal flow.\n');

  console.log('\n✅ Production seed complete!\n');
}

// ============================================
// Main Entry Point
// ============================================

async function main(): Promise<void> {
  const environment = getSeedEnvironment();

  console.log('═'.repeat(50));
  console.log(`🌱 Database Seed Script`);
  console.log(`   Environment: ${environment.toUpperCase()}`);
  console.log(`   Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}`);
  console.log('═'.repeat(50));

  switch (environment) {
    case 'development':
      await seedDevelopment();
      break;
    case 'staging':
      await seedStaging();
      break;
    case 'production':
      await seedProduction();
      break;
  }

  // Print summary
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.note.count({ where: { deletedAt: null } }),
  ]);

  console.log('═'.repeat(50));
  console.log('📊 Database Summary:');
  console.log(`   Users:    ${counts[0]}`);
  console.log(`   Projects: ${counts[1]}`);
  console.log(`   Notes:    ${counts[2]}`);
  console.log('═'.repeat(50));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
