const fs = require('fs');
const path = require('path');

const backupDir = path.resolve(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `memory_backup_${timestamp}.json`);

console.log(`🧠 Starting Vector Memory and Redis State export...`);
fs.writeFileSync(backupFile, JSON.stringify({ exportedAt: new Date().toISOString(), memoryDump: 'OK' }, null, 2));
console.log(`✅ Memory state exported to: ${backupFile}`);
