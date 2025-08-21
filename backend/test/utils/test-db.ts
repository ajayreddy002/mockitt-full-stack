import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Generate unique database URL for each test run
const generateDatabaseUrl = () => {
  const testId = uuidv4().substring(0, 8);
  return `postgresql://postgres:postgres@localhost:5432/mockitt_test_${testId}`;
};

let databaseUrl: string;

beforeAll(async () => {
  // Set up test database
  databaseUrl = generateDatabaseUrl();
  process.env.DATABASE_URL = databaseUrl;

  // Create test database
  const dbName = databaseUrl.split('/').pop();
  try {
    execSync(`createdb ${dbName}`, { stdio: 'inherit' });
  } catch (error) {
    // Database might already exist
    console.log(`Database ${dbName} might already exist`);
  }

  // Run migrations
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
});

beforeEach(async () => {
  // Clean database before each test
  await cleanDatabase();
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();

  const dbName = databaseUrl.split('/').pop();
  try {
    execSync(`dropdb ${dbName}`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`Failed to drop database ${dbName}`);
  }
});

async function cleanDatabase() {
  // Get all table names
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.log({ error });
  }
}

export { prisma, cleanDatabase };
