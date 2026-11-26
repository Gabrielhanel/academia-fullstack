// Linha do tempo pós-experimento: node linha.mjs <portaProm> <E0> <E1> <E3> <E4>  (marcas em ms; log do webhook em stdin)
import fs from 'node:fs';
const [porta, E0, E1, E3, E4] = process.argv.slice(2).map(Number);
const fim = Date.now() / 1000;
async function faixa(nome, estado, ini) {
  const u = `http://127.0.0.1:${porta}/api/v1/query_range?query=${encodeURIComponent(`ALERTS{alertname="${nome}",alertstate="${estado}"}`)}&start=${ini / 1000 - 5}&end=${fim}&step=1`;
  const r = await fetch(u).then((x) => x.json());
  const v = r.data.result.flatMap((s) => s.values.map((p) => p[0]));
  return v.length ? { primeiro: Math.min(...v), ultimo: Math.max(...v) } : null;
}
const rel = (t, base) => (t === undefined || t === null ? 'não observado' : `+${(t - base / 1000).toFixed(0)} s`);
const hook = fs.readFileSync(0, 'utf8').trim().split('\n').filter(Boolean).map((l) => { const m = /^(\S+) ALERTA status=(\w+) alertname=(\w+)/.exec(l); return m && { t: Date.parse(m[1]) / 1000, status: m[2], nome: m[3] }; }).filter(Boolean);
const ev = (nome, status) => hook.find((h) => h.nome === nome && h.status === status)?.t;
const p1 = await faixa('TaxaDeErroAlta', 'pending', E0), f1 = await faixa('TaxaDeErroAlta', 'firing', E0);
console.log('TaxaDeErroAlta (referência: início da injeção de erros)');
console.log('  pending a partir de', rel(p1?.primeiro, E0), '| firing a partir de', rel(f1?.primeiro, E0));
console.log('  webhook firing em', rel(ev('TaxaDeErroAlta', 'firing'), E0));
console.log('TaxaDeErroAlta (referência: início da recuperação, tráfego saudável)');
console.log('  última amostra firing em', rel(f1?.ultimo, E1), '| webhook resolved em', rel(ev('TaxaDeErroAlta', 'resolved'), E1));
const p2 = await faixa('AppForaDoAr', 'pending', E3), f2 = await faixa('AppForaDoAr', 'firing', E3);
console.log('AppForaDoAr (referência: docker stop)');
console.log('  pending a partir de', rel(p2?.primeiro, E3), '| firing a partir de', rel(f2?.primeiro, E3), '| webhook firing em', rel(ev('AppForaDoAr', 'firing'), E3));
console.log('AppForaDoAr (referência: docker start)');
console.log('  webhook resolved em', rel(ev('AppForaDoAr', 'resolved'), E4));
