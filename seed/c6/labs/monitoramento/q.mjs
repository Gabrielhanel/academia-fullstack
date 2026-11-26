// Consulta instantânea ao Prometheus: node q.mjs <porta> "<expr>"  -> primeiro valor ou "vazio"
const [porta, expr] = process.argv.slice(2);
const r = await fetch(`http://127.0.0.1:${porta}/api/v1/query?query=${encodeURIComponent(expr)}`).then((x) => x.json());
const res = r.data.result;
console.log(res.length ? (+res[0].value[1]).toString() : 'vazio');
