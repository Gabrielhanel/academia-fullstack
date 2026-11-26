// Gerador de carga do laboratório: node loadgen.mjs <porta> <duracaoS> <rps> <pctErro>
const [porta, dur, rps, pct] = process.argv.slice(2).map(Number);
const cont = {}; let i = 0; const ps = [];
const t = setInterval(() => {
  const rota = (i++ % 100) < pct ? '/erro' : '/ok';
  ps.push(fetch(`http://127.0.0.1:${porta}${rota}`).then((r) => { cont[r.status] = (cont[r.status] || 0) + 1; return r.arrayBuffer(); }).catch(() => { cont.falha = (cont.falha || 0) + 1; }));
}, 1000 / rps);
setTimeout(async () => { clearInterval(t); await Promise.all(ps); console.log(`carga ${dur}s a ${rps} rps, ${pct}% erro:`, JSON.stringify(cont)); }, dur * 1000);
