import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const app = readFileSync('src/app.html', 'utf8');
const engine = readFileSync('src/engine.js', 'utf8');
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', app.replace('/*__ENGINE__*/', () => engine));
console.log('dist/index.html', Math.round(readFileSync('dist/index.html').length / 1024), 'KB');
