// Orçamento de erro e taxa de queima (burn rate) para SLOs de disponibilidade.
export const orcamentoEmMinutos = (slo, dias) => Math.round(dias * 24 * 60 * (1 - slo) * 100) / 100;
// arredonda a 6 casas: 1 - 0.999 em ponto flutuante vale 0.0010000000000000009 e a divisão sairia 0.9999999999999991
export const taxaDeQueima = (erros, total, slo) => (total === 0 ? 0 : Math.round(((erros / total) / (1 - slo)) * 1e6) / 1e6);
// Alertas de múltiplas janelas (Google SRE Workbook): 14,4x em 1 h (e 5 min) = 2% do orçamento de 30 dias; 6x em 6 h (e 30 min) = 5%
export function avaliarAlertas(janelas, slo) {
  const q = (j) => taxaDeQueima(j.erros, j.total, slo);
  const rapido = q(janelas.h1) >= 14.4 && q(janelas.m5) >= 14.4;
  const lento = q(janelas.h6) >= 6 && q(janelas.m30) >= 6;
  return { filas: rapido ? 'pagina agora' : lento ? 'abre chamado urgente' : 'ok', queima: { h1: +q(janelas.h1).toFixed(1), h6: +q(janelas.h6).toFixed(1) } };
}
export const orcamentoConsumidoPct = (taxa, horasNaJanela, diasDoSlo) => Math.round(((taxa * horasNaJanela) / (diasDoSlo * 24)) * 10000) / 100;
