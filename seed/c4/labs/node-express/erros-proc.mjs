import { spawnSync } from 'node:child_process';
const run = (code) => { const r = spawnSync('node', ['-e', code], { encoding: 'utf8' }); return { status: r.status, erro: (r.stderr.split('\n').find((l) => l.trim()) || '').slice(0, 90) }; };
console.log('promessa rejeitada sem tratamento:', JSON.stringify(run("Promise.reject(new Error('x')); setTimeout(() => console.log('vivo'), 100)")));
console.log('com process.on(unhandledRejection):', JSON.stringify(run("process.on('unhandledRejection', (e) => { console.error('registrado:', e.message); }); Promise.reject(new Error('x')); setTimeout(() => console.log('vivo'), 100)")));
console.log('exceção não capturada:', JSON.stringify(run("setTimeout(() => { throw new Error('y'); }, 10)")));
