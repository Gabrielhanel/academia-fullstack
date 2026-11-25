import fs from 'node:fs';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
const modo = process.argv[2]; const arq = process.argv[3];
const mb = (b) => (b / 1048576).toFixed(0);
const antes = process.memoryUsage().rss; let pico = antes;
const t = setInterval(() => { pico = Math.max(pico, process.memoryUsage().rss); }, 5);
const t0 = performance.now(); let hash;
if (modo === 'readFile') hash = crypto.createHash('sha256').update(await fs.promises.readFile(arq)).digest('hex');
else { const h = crypto.createHash('sha256'); await pipeline(fs.createReadStream(arq), h); hash = h.digest('hex'); }
clearInterval(t); pico = Math.max(pico, process.memoryUsage().rss);
console.log(modo.padEnd(9), '| RSS antes', mb(antes), 'MiB | pico', mb(pico), 'MiB | tempo', (performance.now() - t0).toFixed(0), 'ms | hash', hash.slice(0, 12));
