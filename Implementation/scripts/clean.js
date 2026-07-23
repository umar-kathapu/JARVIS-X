const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dirsToRemove = ['node_modules', 'dist', 'build', 'out', '.next', '.turbo', 'coverage'];

function removeDirRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned: ${dir}`);
  }
}

function scanAndClean(targetDir) {
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      if (dirsToRemove.includes(entry.name)) {
        removeDirRecursive(fullPath);
      } else if (entry.name !== '.git') {
        scanAndClean(fullPath);
      }
    }
  }
}

console.log('🧹 Cleaning monorepo build artifacts and caches...');
scanAndClean(rootDir);
console.log('✅ Clean complete.');
