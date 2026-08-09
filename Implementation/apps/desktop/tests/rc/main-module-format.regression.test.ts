import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Regression Test: Production Electron ESM/CommonJS Module Format Consistency', () => {
  const desktopRoot = path.resolve(__dirname, '../..');
  const pkgPath = path.join(desktopRoot, 'package.json');
  const mainDistDir = path.join(desktopRoot, 'dist/main');
  const preloadDistDir = path.join(desktopRoot, 'dist/preload');

  it('1. package.json "main" entrypoint must be explicitly CommonJS (.cjs) when package is "type": "module"', () => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.main).toBeDefined();

    const isPackageEsm = pkg.type === 'module';
    const mainExt = path.extname(pkg.main);

    if (isPackageEsm) {
      // If the package declares "type": "module", any CommonJS main bundle MUST have a .cjs extension
      // to prevent Node.js from throwing "ReferenceError: require is not defined in ES module scope"
      expect(mainExt).toBe('.cjs');
    }
  });

  it('2. Production main bundle must not execute CommonJS require() in an unescaped .js file when package is ESM', () => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const isPackageEsm = pkg.type === 'module';

    const mainFile = path.resolve(desktopRoot, pkg.main);
    if (fs.existsSync(mainFile)) {
      const content = fs.readFileSync(mainFile, 'utf-8');
      const hasRequireCalls = /require\(["']/.test(content);
      const isCjsExtension = mainFile.endsWith('.cjs');

      if (isPackageEsm && hasRequireCalls) {
        // Must use .cjs extension to guarantee CommonJS execution context in Node.js
        expect(isCjsExtension).toBe(true);
      }
    }
  });

  it('3. Preload script format must match main process loader reference', () => {
    const mainSrcPath = path.join(desktopRoot, 'src/main/index.ts');
    const mainSrc = fs.readFileSync(mainSrcPath, 'utf-8');

    // Main process bootstrap must reference ../preload/index.cjs (or matching extension)
    expect(mainSrc).toMatch(/preload\/index\.cjs/);
  });

  it('4. Build script outputs must be consistent with package.json entrypoints', () => {
    const buildScriptPath = path.join(desktopRoot, 'scripts/build.js');
    const buildScript = fs.readFileSync(buildScriptPath, 'utf-8');

    expect(buildScript).toMatch(/fileName:\s*\(\)\s*=>\s*['"]index\.cjs['"]/);
  });

  it('5. Main process bundle must bundle non-builtin dependencies (e.g. zod) without externalizing them', () => {
    const mainBundlePath = path.join(mainDistDir, 'index.cjs');
    if (fs.existsSync(mainBundlePath)) {
      const content = fs.readFileSync(mainBundlePath, 'utf-8');
      const requireRegex = /require\(["']([^"']+)["']\)/g;
      const matches = [];
      let m;
      while ((m = requireRegex.exec(content)) !== null) {
        matches.push(m[1]);
      }
      const uniqueRequires = [...new Set(matches)];

      const allowedBuiltins = new Set([
        'electron', 'child_process', 'fs', 'fs/promises', 'path', 'os',
        'crypto', 'events', 'util', 'stream', 'http', 'https', 'net',
        'tls', 'url', 'buffer', 'string_decoder', 'perf_hooks'
      ]);

      const externalNpmRequires = uniqueRequires.filter(
        (r) => !allowedBuiltins.has(r) && !r.startsWith('node:')
      );

      // Must not require unbundled npm packages like 'zod'
      expect(externalNpmRequires).toEqual([]);
    }
  });

  it('6. Preload script bundle must only require electron or built-ins', () => {
    const preloadBundlePath = path.join(preloadDistDir, 'index.cjs');
    if (fs.existsSync(preloadBundlePath)) {
      const content = fs.readFileSync(preloadBundlePath, 'utf-8');
      const requireRegex = /require\(["']([^"']+)["']\)/g;
      const matches = [];
      let m;
      while ((m = requireRegex.exec(content)) !== null) {
        matches.push(m[1]);
      }
      const uniqueRequires = [...new Set(matches)];

      const externalNpmRequires = uniqueRequires.filter(
        (r) => r !== 'electron' && !r.startsWith('node:')
      );

      expect(externalNpmRequires).toEqual([]);
    }
  });

  it('7. Renderer index.html must use relative asset paths and never root-absolute paths', () => {
    const rendererHtmlPath = path.join(desktopRoot, 'dist/renderer/index.html');
    if (fs.existsSync(rendererHtmlPath)) {
      const content = fs.readFileSync(rendererHtmlPath, 'utf-8');

      // Assert no root-absolute src="/assets/..." or href="/assets/..."
      expect(content).not.toMatch(/src=["']\/assets\//);
      expect(content).not.toMatch(/href=["']\/assets\//);

      // Assert relative paths are used
      expect(content).toMatch(/src=["']\.\/assets\//);
      expect(content).toMatch(/href=["']\.\/assets\//);
    }
  });

  it('8. Desktop vite.config.ts must specify base: "./" for Electron asset packaging', () => {
    const viteConfigPath = path.join(desktopRoot, 'vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');

    expect(content).toMatch(/base:\s*['"]\.\/['"]/);
  });
});

