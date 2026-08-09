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
});
