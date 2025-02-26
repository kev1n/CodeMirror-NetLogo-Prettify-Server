// build-prod.js
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Get dependencies from package.json to mark as external
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const external = Object.keys(pkg.dependencies || {});

async function buildProd() {
  console.log('Building production version...');

  try {
    const result = await build({
      entryPoints: ['src/server.ts'],
      bundle: true,
      platform: 'node',
      target: 'node16',
      outfile: 'dist/server-bundle.js',
      sourcemap: true,
      minify: true,
      format: 'esm',
      metafile: true,
      external,
    });

    console.log('Build completed successfully!');

    // Write the meta file for analysis
    writeFileSync(join(__dirname, 'dist', 'meta.json'), JSON.stringify(result.metafile));

    // Create a launcher script
    const launcherScript = `#!/usr/bin/env node
import { createRequire } from 'module';
global.require = createRequire(import.meta.url);
import './server-bundle.js';
`;

    writeFileSync(join(__dirname, 'dist', 'launcher.mjs'), launcherScript);
    console.log('Launcher script created.');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

buildProd();
