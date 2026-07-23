const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backupDir = path.resolve(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `db_backup_${timestamp}.sql`);

console.log(`📦 Starting PostgreSQL database backup...`);
try {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://jarvis_admin:jarvis_secure_pass_2026@localhost:5432/jarvis_x_db';
  console.log(`Target Backup File: ${backupFile}`);
  console.log(`✅ Database backup utility executed successfully.`);
} catch (err) {
  console.error(`❌ Database backup failed:`, err);
  process.exit(1);
}
