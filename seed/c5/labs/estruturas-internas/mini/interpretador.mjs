// Estratégia A: interpretador que percorre a AST (tree-walking).
const BIN = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b, '%': (a, b) => a % b, '<': (a, b) => +(a < b), '>': (a, b) => +(a > b), '<=': (a, b) => +(a <= b), '>=': (a, b) => +(a >= b), '==': (a, b) => +(a === b), '!=': (a, b) => +(a !== b) };
export function executarArvore(ast, entrada = {}) {
  const amb = { ...entrada }; const saida = [];
  const avaliar = (n) => {
    switch (n.tipo) {
      case 'Num': return n.valor;
      case 'Var': if (!(n.nome in amb)) throw new ReferenceError('variável não definida: ' + n.nome); return amb[n.nome];
      case 'Bin': return BIN[n.op](avaliar(n.esq), avaliar(n.dir));
    }
  };
  const rodar = (cmds) => { for (const c of cmds) {
    switch (c.tipo) {
      case 'Let': case 'Atrib': if (c.tipo === 'Atrib' && !(c.nome in amb)) throw new ReferenceError('variável não definida: ' + c.nome); amb[c.nome] = avaliar(c.expr); break;
      case 'Print': saida.push(avaliar(c.expr)); break;
      case 'While': while (avaliar(c.cond)) rodar(c.corpo); break;
      case 'If': rodar(avaliar(c.cond) ? c.entao : c.senao); break;
    }
  } };
  rodar(ast.corpo);
  return saida;
}
