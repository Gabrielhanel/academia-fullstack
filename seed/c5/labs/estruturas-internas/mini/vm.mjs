// Estratégia B: compilar a AST para bytecode de pilha e executar em uma máquina virtual.
export function compilar(ast) {
  const codigo = []; const vars = new Map();
  const slot = (nome, criar) => { if (!vars.has(nome)) { if (!criar) throw new ReferenceError('variável não definida: ' + nome); vars.set(nome, vars.size); } return vars.get(nome); };
  const emit = (op, arg) => { codigo.push(arg === undefined ? [op] : [op, arg]); return codigo.length - 1; };
  const expr = (n) => {
    if (n.tipo === 'Num') emit('PUSH', n.valor);
    else if (n.tipo === 'Var') emit('LOAD', slot(n.nome, false));
    else { expr(n.esq); expr(n.dir); emit(n.op); }
  };
  const cmds = (lista) => { for (const c of lista) {
    if (c.tipo === 'Let') { expr(c.expr); emit('STORE', slot(c.nome, true)); }
    else if (c.tipo === 'Atrib') { expr(c.expr); emit('STORE', slot(c.nome, false)); }
    else if (c.tipo === 'Print') { expr(c.expr); emit('PRINT'); }
    else if (c.tipo === 'While') { const ini = codigo.length; expr(c.cond); const sai = emit('JZ', -1); cmds(c.corpo); emit('JMP', ini); codigo[sai][1] = codigo.length; }
    else if (c.tipo === 'If') { expr(c.cond); const jz = emit('JZ', -1); cmds(c.entao); const jmp = emit('JMP', -1); codigo[jz][1] = codigo.length; cmds(c.senao); codigo[jmp][1] = codigo.length; }
  } };
  cmds(ast.corpo); emit('HALT');
  return { codigo, nVars: vars.size, vars };
}
export function executarVM({ codigo, nVars }) {
  const pilha = []; const mem = new Array(nVars).fill(0); const saida = []; let pc = 0;
  for (;;) {
    const [op, arg] = codigo[pc++];
    switch (op) {
      case 'PUSH': pilha.push(arg); break;
      case 'LOAD': pilha.push(mem[arg]); break;
      case 'STORE': mem[arg] = pilha.pop(); break;
      case 'PRINT': saida.push(pilha.pop()); break;
      case 'JMP': pc = arg; break;
      case 'JZ': if (!pilha.pop()) pc = arg; break;
      case 'HALT': return saida;
      default: { const b = pilha.pop(), a = pilha.pop();
        pilha.push(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : op === '%' ? a % b : op === '<' ? +(a < b) : op === '>' ? +(a > b) : op === '<=' ? +(a <= b) : op === '>=' ? +(a >= b) : op === '==' ? +(a === b) : +(a !== b)); }
    }
  }
}
