// Quatro métricas de entrega (DORA) calculadas sobre dados SINTÉTICOS de implantações e incidentes.
const mediana = (v) => { const o = [...v].sort((a, b) => a - b); const m = Math.floor(o.length / 2); return o.length ? (o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2) : null; };
const horas = (a, b) => (new Date(b) - new Date(a)) / 3600000;
export function calcularDora(implantacoes, incidentes, inicio, fim) {
  const dias = (new Date(fim) - new Date(inicio)) / 86400000;
  const leadTimes = implantacoes.map((d) => horas(d.commit, d.implantadoEm));
  const falhas = implantacoes.filter((d) => d.falhou).length;
  const restauracoes = incidentes.map((i) => horas(i.inicio, i.restaurado));
  const r1 = (x) => (x === null ? null : Math.round(x * 10) / 10);
  return {
    frequenciaPorSemana: r1((implantacoes.length / dias) * 7),
    leadTimeMedianoHoras: r1(mediana(leadTimes)),
    taxaDeFalhaPct: implantacoes.length ? r1((falhas / implantacoes.length) * 100) : null,
    tempoMedianoDeRestauracaoHoras: r1(mediana(restauracoes))
  };
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const { readFileSync } = await import('node:fs');
  const dados = JSON.parse(readFileSync(new URL('./dados/entrega-sintetica.json', import.meta.url)));
  console.log('Período:', dados.inicio, 'a', dados.fim, '| implantações:', dados.implantacoes.length, '| incidentes:', dados.incidentes.length, '(dados sintéticos)');
  console.log(JSON.stringify(calcularDora(dados.implantacoes, dados.incidentes, dados.inicio, dados.fim), null, 2));
}
