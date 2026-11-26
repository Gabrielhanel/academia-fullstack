// Mesmo laço em seis estratégias de execução. Uso: node mini/comparar.mjs
import { analisar } from './parser.mjs';
import { executarArvore } from './interpretador.mjs';
import { compilar, executarVM } from './vm.mjs';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const N = 1000000;
const src = 'let s = 0; let i = 1; while (i <= ' + N + ') { s = s + i * i % 7; i = i + 1; } print s;';
const ast = analisar(src); const prog = compilar(ast);
const nativo = () => { let s = 0; for (let i = 1; i <= N; i++) s = s + i * i % 7; return [s]; };
const med = (nome, fn, reps = 5) => { const r0 = fn(); const t = []; for (let i = 0; i < reps; i++) { const t0 = performance.now(); fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); return { nome, ms: t[Math.floor(reps / 2)], r: JSON.stringify(r0) }; };
const linhas = [med('interpretador de árvore (AST)', () => executarArvore(ast)), med('máquina virtual de bytecode', () => executarVM(prog)), med('JavaScript nativo (V8 com JIT)', nativo)];
const dir = mkdtempSync(join(tmpdir(), 'cmp-'));
writeFileSync(join(dir, 'a.c'), '#include <stdio.h>\n#include <time.h>\nint main(){ struct timespec a,b; clock_gettime(CLOCK_MONOTONIC,&a); volatile double s=0; for(long i=1;i<=' + N + ';i++) s = s + (double)(((long)i*i)%7); clock_gettime(CLOCK_MONOTONIC,&b); printf("%.0f %.3f\\n", (double)s, (b.tv_sec-a.tv_sec)*1000.0+(b.tv_nsec-a.tv_nsec)/1e6); return 0; }');
for (const o of ['-O0', '-O2']) { const c = spawnSync('gcc', [o, '-o', join(dir, 'a' + o), join(dir, 'a.c')]); const r = spawnSync(join(dir, 'a' + o), { encoding: 'utf8' }); const [s, ms] = r.stdout.trim().split(' '); linhas.push({ nome: 'C compilado com gcc ' + o + ' (volatile)', ms: Number(ms), r: '[' + s + ']' }); }
const py = spawnSync('python3', ['-c', 'import time\nt=time.perf_counter()\ns=0\nfor i in range(1,' + (N + 1) + '):\n    s = s + i*i%7\nprint(s, (time.perf_counter()-t)*1000)'], { encoding: 'utf8' }).stdout.trim().split(' ');
linhas.push({ nome: 'Python 3.14 (CPython, bytecode)', ms: Number(py[1]), r: '[' + py[0] + ']' });
const base = linhas[2].ms;
console.log('N =', N, '| resultado esperado idêntico em todos');
for (const l of linhas) console.log(l.nome.padEnd(40), l.ms.toFixed(1).padStart(9), 'ms', ('(' + (l.ms / base).toFixed(1) + 'x do nativo)').padStart(18), ' resultado', l.r);
