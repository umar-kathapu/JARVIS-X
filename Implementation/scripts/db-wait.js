const { Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://jarvis_admin:jarvis_secure_pass_2026@localhost:5432/jarvis_x_db';

async function waitForDb() {
  const client = new Client({ connectionString });
  let retries = 10;

  while (retries > 0) {
    try {
      await client.connect();
      console.log('✅ PostgreSQL Database is ready!');
      await client.end();
      process.exit(0);
    } catch (err) {
      retries--;
      console.log(`Waiting for database... (${retries} retries left)`);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  console.error('❌ Database failed to become ready in time.');
  process.exit(1);
}

waitForDb();
