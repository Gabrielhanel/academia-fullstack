// Ordem das tarefas no event loop em CommonJS e dentro de um callback de I/O (execute várias vezes).
const fs = require('fs');
const a = [];
setTimeout(() => a.push('setTimeout 0'), 0); setImmediate(() => a.push('setImmediate'));
process.nextTick(() => a.push('nextTick')); Promise.resolve().then(() => a.push('promise.then'));
a.push('código síncrono');
setTimeout(() => {
  console.log('módulo CJS:', a.join(' -> '));
  const b = [];
  fs.readFile(__filename, () => { setTimeout(() => b.push('setTimeout 0'), 0); setImmediate(() => b.push('setImmediate')); setTimeout(() => console.log('dentro de um callback de I/O:', b.join(' -> ')), 30); });
}, 50);
