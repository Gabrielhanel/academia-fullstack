// Refatoração com os 8 testes verdes: nomes e funções pequenas, mesmo comportamento.
const LIMITE = 1000;
const SEPARADORES_PADRAO = ',\n';
const escapar = (c) => c.replace(/[\\\]^-]/g, '\\$&');
function separarCabecalho(texto) {
  if (!texto.startsWith('//')) return { separadores: SEPARADORES_PADRAO, corpo: texto };
  const fim = texto.indexOf('\n');
  return { separadores: texto.slice(2, fim) + '\n', corpo: texto.slice(fim + 1) };
}
export function somar(texto) {
  if (texto === '') return 0;
  const { separadores, corpo } = separarCabecalho(texto);
  const numeros = corpo.split(new RegExp('[' + escapar(separadores) + ']')).map(Number);
  const negativos = numeros.filter((n) => n < 0);
  if (negativos.length) throw new Error('negativos não permitidos: ' + negativos.join(','));
  return numeros.filter((n) => n <= LIMITE).reduce((soma, n) => soma + n, 0);
}
