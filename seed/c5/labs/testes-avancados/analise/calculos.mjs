// Módulo-alvo da cobertura e da mutação: três regras pequenas com fronteiras.
export function faixaDeDesconto(total) {
  if (total >= 1000) return 0.15;
  if (total >= 500) return 0.1;
  if (total > 0) return 0.05;
  return 0;
}
export function ehMaiorDeIdade(idade) { return idade >= 18; }
export function frete(peso, expresso) {
  if (peso <= 0) throw new Error('peso inválido');
  const base = peso <= 5 ? 10 : 10 + (peso - 5) * 2;
  return expresso ? base * 2 : base;
}
export function formatarMoeda(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }
