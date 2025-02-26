// pkgroll.config.js
export default {
  entries: {
    server: 'src/server.ts',
  },
  formats: ['esm'],
  platform: 'node',
  target: 'node16',
  external: Object.keys(JSON.parse(require('fs').readFileSync('./package.json', 'utf8')).dependencies || {}),
};
