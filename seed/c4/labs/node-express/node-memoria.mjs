import fs from 'node:fs'; import os from 'node:os'; import crypto from 'node:crypto'; import { execFileSync } from 'node:child_process';
const arq = os.tmpdir() + '/c41-grande.bin'; const chunk = crypto.randomBytes(1048576);
const fd = fs.openSync(arq, 'w'); for (let i = 0; i < 200; i++) fs.writeSync(fd, chunk); fs.closeSync(fd);
console.log('arquivo de', (fs.statSync(arq).size / 1048576).toFixed(0), 'MiB (cada leitura em um processo Node separado)');
for (const modo of ['readFile', 'stream']) process.stdout.write(execFileSync('node', [new URL('./mem-arquivo.mjs', import.meta.url).pathname, modo, arq]).toString());
fs.unlinkSync(arq);
