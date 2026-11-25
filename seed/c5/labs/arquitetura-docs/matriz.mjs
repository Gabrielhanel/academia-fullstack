// Matriz de decisão ponderada: critérios com pesos, notas de 1 a 5 por alternativa, total e ranking.
export function avaliar(criterios, alternativas) {
  const soma = criterios.reduce((s, c) => s + c.peso, 0);
  if (soma !== 100) throw new Error('os pesos devem somar 100 (soma atual: ' + soma + ')');
  const ranking = Object.entries(alternativas).map(([nome, notas]) => {
    let total = 0;
    for (const c of criterios) {
      const n = notas[c.nome];
      if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('nota inválida para ' + nome + ' em ' + c.nome);
      total += (n * c.peso) / 100;
    }
    return { nome, total: Math.round(total * 100) / 100 };
  }).sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
  const margem = ranking.length > 1 ? Math.round((ranking[0].total - ranking[1].total) * 100) / 100 : null;
  return { ranking, margem };
}
