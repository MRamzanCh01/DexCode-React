import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('        DEXCODE ENVIRONMENT & PROJECT CHECK         ');
console.log('====================================================\n');

let errors = 0;
let warnings = 0;

function checkFile(relPath, required = true) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  [OK] Found file: ${relPath}`);
    return true;
  } else {
    if (required) {
      console.error(`  [FAIL] Missing required file: ${relPath}`);
      errors++;
    } else {
      console.warn(`  [WARN] Optional file missing: ${relPath}`);
      warnings++;
    }
    return false;
  }
}

console.log('1. Verifying Core Project Files...');
checkFile('package.json');
checkFile('tsconfig.json');
checkFile('vite.config.ts');
checkFile('metadata.json');
checkFile('server.ts');
checkFile('electron/main.js');
checkFile('electron/preload.js');
checkFile('src/main.tsx');
checkFile('src/App.tsx');

console.log('\n2. Verifying Package Dependencies...');
const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const reqDeps = ['react', 'react-dom', '@monaco-editor/react', 'lucide-react', 'express', '@google/genai', 'motion'];
  reqDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      console.log(`  [OK] Dependency present: ${dep} (${pkg.dependencies[dep]})`);
    } else {
      console.error(`  [FAIL] Missing dependency: ${dep}`);
      errors++;
    }
  });

  console.log('\n3. Checking DexCode Build Commands in package.json...');
  const reqScripts = ['dev', 'dev:web', 'check', 'build', 'build:all', 'build:win', 'build:mac', 'build:linux', 'server'];
  reqScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`  [OK] Command configured: npm run ${script}`);
    } else {
      console.error(`  [FAIL] Missing npm script: ${script}`);
      errors++;
    }
  });
}

console.log('\n4. Checking DexCode Plugin & Desktop API Compatibility...');
checkFile('src/services/pluginSystem.ts');
checkFile('src/services/fileSystem.ts');
checkFile('src/services/themeManager.ts');
checkFile('src/services/workspaceManager.ts');

console.log('\n====================================================');
if (errors === 0) {
  console.log(`SUCCESS: DexCode validation passed cleanly! (${warnings} warnings)`);
  console.log('DexCode is ready for development & cross-platform build.');
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error(`FAILED: DexCode validation found ${errors} error(s) and ${warnings} warning(s).`);
  console.log('====================================================\n');
  process.exit(1);
}
