import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const sharedAliases = {
  '@': path.resolve(rootDir, 'src/renderer/src'),
  '@jarvis-x/ui': path.resolve(rootDir, '../../packages/ui/src/index.ts'),
  '@jarvis-x/shared': path.resolve(rootDir, '../../packages/shared/src/index.ts'),
  '@jarvis-x/types': path.resolve(rootDir, '../../packages/types/src/index.ts'),
  '@jarvis-x/utils': path.resolve(rootDir, '../../packages/utils/src/index.ts'),
};

async function buildDesktopApp() {
  console.log('🚀 Building JARVIS-X Desktop Application...');

  // 1. Build Main Process (src/main/index.ts -> dist/main/index.cjs)
  console.log('📦 Bundling Electron Main Process...');
  await build({
    configFile: false,
    root: rootDir,
    resolve: { alias: sharedAliases },
    build: {
      outDir: path.resolve(rootDir, 'dist/main'),
      emptyOutDir: true,
      target: 'node18',
      minify: false,
      lib: {
        entry: path.resolve(rootDir, 'src/main/index.ts'),
        formats: ['cjs'],
        fileName: () => 'index.cjs',
      },
      rollupOptions: {
        external: [
          'electron',
          'child_process',
          'fs',
          'fs/promises',
          'path',
          'os',
          'crypto',
          'events',
          'util',
          'stream',
          'http',
          'https',
          'net',
          'tls',
          'url',
          'buffer',
          'string_decoder',
          'perf_hooks',
        ],
      },
    },
  });

  // 2. Build Preload Script (src/preload/index.ts -> dist/preload/index.cjs)
  console.log('📦 Bundling Electron Preload Script...');
  await build({
    configFile: false,
    root: rootDir,
    resolve: { alias: sharedAliases },
    build: {
      outDir: path.resolve(rootDir, 'dist/preload'),
      emptyOutDir: true,
      target: 'node18',
      minify: false,
      lib: {
        entry: path.resolve(rootDir, 'src/preload/index.ts'),
        formats: ['cjs'],
        fileName: () => 'index.cjs',
      },
      rollupOptions: {
        external: ['electron'],
      },
    },
  });

  // 3. Build Renderer Process (src/renderer -> dist/renderer/)
  console.log('📦 Bundling React Renderer Application...');
  await build({
    configFile: path.resolve(rootDir, 'vite.config.ts'),
    root: rootDir,
    base: './',
    build: {
      outDir: path.resolve(rootDir, 'dist/renderer'),
      emptyOutDir: true,
    },
  });

  console.log('✅ JARVIS-X Desktop Application Build Completed Successfully!');
}

buildDesktopApp().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
