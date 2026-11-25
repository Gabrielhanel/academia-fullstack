// Modelo simples de dívida técnica: juros = tempo extra por mudança x mudanças por mês; payback = esforço / juros.
export function priorizar(itens, horasPorDia = 8) {
  return itens.map((i) => {
    const jurosHorasMes = (i.mudancasPorMes * i.minutosExtraPorMudanca) / 60;
    const esforcoHoras = i.esforcoDias * horasPorDia;
    const paybackMeses = jurosHorasMes === 0 ? Infinity : esforcoHoras / jurosHorasMes;
    return { id: i.id, jurosHorasMes: Math.round(jurosHorasMes * 100) / 100, esforcoHoras, paybackMeses: paybackMeses === Infinity ? null : Math.round(paybackMeses * 10) / 10 };
  }).sort((a, b) => (a.paybackMeses ?? Infinity) - (b.paybackMeses ?? Infinity) || a.id.localeCompare(b.id));
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const itens = [
    { id: 'proc-legado-pedidos', esforcoDias: 3, mudancasPorMes: 8, minutosExtraPorMudanca: 90 },
    { id: 'relatorios-duplicados', esforcoDias: 1, mudancasPorMes: 3, minutosExtraPorMudanca: 40 },
    { id: 'modulo-estavel-feio', esforcoDias: 5, mudancasPorMes: 0, minutosExtraPorMudanca: 120 },
    { id: 'testes-lentos-ci', esforcoDias: 2, mudancasPorMes: 60, minutosExtraPorMudanca: 6 }
  ];
  console.log('id'.padEnd(24), 'juros h/mês', 'esforço h', 'payback (meses)');
  for (const r of priorizar(itens)) console.log(r.id.padEnd(24), String(r.jurosHorasMes).padStart(11), String(r.esforcoHoras).padStart(9), String(r.paybackMeses ?? 'nunca').padStart(15));
}
