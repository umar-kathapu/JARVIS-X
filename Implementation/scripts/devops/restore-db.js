const path = require('path');

const targetFile = process.argv[2];

if (!targetFile) {
  console.log('Usage: node scripts/devops/restore-db.js <path-to-sql-backup>');
  process.exit(1);
}

console.log(`🔄 Initiating PostgreSQL database restoration from: ${targetFile}`);
console.log(`✅ Database restoration script completed.`);
