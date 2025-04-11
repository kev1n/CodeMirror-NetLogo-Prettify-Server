// build-server.js
import { build } from 'esbuild';
import { readFileSync } from 'fs';

// Get dependencies from package.json to mark as external
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const external = Object.keys(pkg.dependencies || {}).filter((dep) => !dep.startsWith('@codemirror/'));

console.log('external', external);
// Build the server
build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: 'dist/server.js',
  sourcemap: true,
  format: 'esm',
  external,
  loader: {
    '.js': 'jsx', // Handle JSX in .js files
    '.ts': 'ts', // Handle TypeScript
  },
  resolveExtensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  alias: {
    // Add any specific module aliases if needed
  },
  banner: {
    js: `
      // Fix for CommonJS modules
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `,
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
