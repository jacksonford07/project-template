const { execSync } = require('child_process');

// Handle DATABASE_URL from Vercel or other platforms
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  console.error('ERROR: No DATABASE_URL found');
  process.exit(1);
}

try {
  console.log('Running database migrations...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  console.log('Migrations complete');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
