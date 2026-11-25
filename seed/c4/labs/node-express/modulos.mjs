import { execFileSync, spawnSync } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os';
const dir = fs.mkdtempSync(os.tmpdir() + '/c41-mod-');
fs.writeFileSync(dir + '/lib.mjs', "export const soma = (a, b) => a + b; export default 'padrao';");
fs.writeFileSync(dir + '/usa-cjs.cjs', "const m = require('./lib.mjs'); console.log('require() de um módulo ESM síncrono:', m.soma(2, 3), '| default:', m.default);\nimport('./lib.mjs').then((x) => console.log('import() dinâmico em CJS:', x.soma(1, 1)));");
fs.writeFileSync(dir + '/top.mjs', "const x = await Promise.resolve(42); console.log('await no topo do módulo ESM:', x); try { console.log(__dirname); } catch (e) { console.log('__dirname no ESM:', e.name + ': ' + e.message); }");
fs.writeFileSync(dir + '/pkg-ext.js', "console.log('arquivo .js sem \"type\" no package.json é CommonJS:', typeof require === 'function' && typeof module === 'object');");
fs.writeFileSync(dir + '/package.json', JSON.stringify({ name: 'm', version: '1.0.0' }));
console.log('Node', process.version);
for (const f of ['usa-cjs.cjs', 'top.mjs', 'pkg-ext.js']) { const r = spawnSync('node', [dir + '/' + f], { encoding: 'utf8' }); process.stdout.write(r.stdout); if (r.stderr) console.log('stderr:', r.stderr.split('\n')[0]); }
fs.writeFileSync(dir + '/package.json', JSON.stringify({ name: 'm', version: '1.0.0', type: 'module' }));
const r = spawnSync('node', [dir + '/pkg-ext.js'], { encoding: 'utf8' }); console.log('com "type": "module", o mesmo .js:', (r.stderr || r.stdout).split('\n').find((l) => /ReferenceError|CommonJS|require/.test(l)) || r.stdout.trim());
fs.rmSync(dir, { recursive: true });
