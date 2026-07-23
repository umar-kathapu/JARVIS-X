const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envFile = path.join(rootDir, '.env');
const envExampleFile = path.join(rootDir, '.env.example');

if (!fs.existsSync(envFile)) {
  if (fs.existsSync(envExampleFile)) {
    fs.copyFileSync(envExampleFile, envFile);
    console.log('✅ Created .env from .env.example');
  } else {
    console.warn('⚠️ .env.example missing!');
  }
} else {
  console.log('✅ .env exists');
}
