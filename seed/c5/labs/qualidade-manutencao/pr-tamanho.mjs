// Classificação do tamanho de uma mudança (heurística de revisão): linhas adicionadas + removidas.
export const LIMITES = [['XS', 10], ['S', 50], ['M', 200], ['L', 500]];
export function tamanhoDoPr(adicionadas, removidas) {
  const total = adicionadas + removidas;
  for (const [nome, max] of LIMITES) if (total <= max) return { total, tamanho: nome };
  return { total, tamanho: 'XL' };
}
export const recomendacao = (t) => ({ XS: 'revisão rápida', S: 'revisão rápida', M: 'revisão normal', L: 'considere dividir', XL: 'divida antes de revisar' })[t];
