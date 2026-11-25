// C5.1 — Clean Code e SOLID: exercícios, avaliação final e projeto.
// Medições reais do laboratório (Node 26.13.1, ESLint 10.15.0, jscpd 5.4.3); os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'cln-01': [
  { id: 'cln-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual destas é a melhor assinatura para uma função de cálculo com cinco dados de entrada?', options: ['proc(d, t, f, c, x)', 'calcularTotal({ itens, perfil, comFrete, uf, cupom })', 'calc(a, b, c, d, e)', 'total5(...args)'], answer: 1, explanation: 'O objeto nomeado revela a intenção e elimina a troca de ordem dos parâmetros (o legado tinha 5 parâmetros e 20 avisos).' },
  { id: 'cln-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Trocar == por === em código legado é sempre uma refatoração segura.', answer: false, explanation: 'No laboratório, o perfil "1" (texto) recebia desconto por causa do ==; trocar sem caracterizar mudaria o comportamento.' },
  { id: 'cln-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o problema do legado à regra do ESLint que o apontou.', pairs: [['Função com 14 caminhos', 'complexity'], ['Blocos aninhados em 5 níveis', 'max-depth'], ['0.9, 500 e 25 sem nome', 'no-magic-numbers'], ['Comparações com ==', 'eqeqeq']], explanation: 'Medido: 20 avisos no legado.' },
  { id: 'cln-01-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §calcularFrete(valor, uf)§ com constantes nomeadas: valor acima de §1000§ → §0§ (frete grátis); senão §SP§ → §10§, §RJ§ → §15§ e qualquer outro estado → §30§.', lang: 'javascript', starter: 'function calcularFrete(valor, uf) {\n  // seu código aqui\n}\n', hints: ['Use um objeto para a tabela por UF.', 'O limite é estritamente maior que 1000.'], tests: [{ name: 'tabela', code: R`assert.equal(calcularFrete(100, 'SP'), 10);
assert.equal(calcularFrete(100, 'RJ'), 15);
assert.equal(calcularFrete(100, 'MG'), 30);` }, { name: 'frete grátis', code: R`assert.equal(calcularFrete(1000, 'SP'), 10);
assert.equal(calcularFrete(1000.01, 'SP'), 0);
assert.equal(calcularFrete(5000, 'XX'), 0);` }], solution: R`const LIMITE_FRETE_GRATIS = 1000;
const FRETE_POR_UF = { SP: 10, RJ: 15 };
const FRETE_PADRAO = 30;
function calcularFrete(valor, uf) {
  if (valor > LIMITE_FRETE_GRATIS) return 0;
  return FRETE_POR_UF[uf] ?? FRETE_PADRAO;
}`, explanation: 'Constantes nomeadas e tabela no lugar de if/else aninhados.' },
  { id: 'cln-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Que comentários vale escrever e quais devem ser evitados? Dê dois exemplos de cada.', model: 'Vale comentar o porquê (uma restrição legal, um bug de biblioteca, um link para o ADR ou a issue), avisos de consequência (essa chamada é lenta) e a documentação pública de APIs. Evita-se repetir o código (i++ // incrementa), desculpar um nome ruim (// d = desconto: renomeie), manter código comentado (o Git guarda o histórico) e comentários desatualizados. Quando surgir vontade de comentar um bloco, extraia uma função com um bom nome.', rubric: ['Comentário do porquê', 'Avisos ou documentação pública', 'Comentário redundante ou desculpa de nome ruim', 'Código comentado ou desatualizado'], explanation: 'Resumo da aula.' },
  { id: 'cln-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §complexidade(codigo)§: devolve §1§ mais o número de ocorrências das palavras §if§, §for§, §while§, §case§, §catch§ e dos operadores §&&§, §||§ e §??§ no texto do código (ocorrências de cada palavra como palavra inteira). Ignore os demais símbolos.', lang: 'javascript', starter: 'function complexidade(codigo) {\n  // seu código aqui\n}\n', hints: ['Use uma expressão regular com \\b para as palavras.', 'Escape os operadores na expressão.'], tests: [{ name: 'sem decisões', code: R`assert.equal(complexidade('return a + b;'), 1);
assert.equal(complexidade(''), 1);` }, { name: 'com decisões', code: R`assert.equal(complexidade('if (a) { x(); } else if (b && c) { y(); }'), 4);
assert.equal(complexidade('for (const i of l) { while (k) { if (a || b) {} } }'), 5);
assert.equal(complexidade('switch (t) { case 1: break; case 2: break; } const v = a ?? 0;'), 4);
assert.equal(complexidade('verificar(difusao)'), 1);` }], solution: R`function complexidade(codigo) {
  const m = codigo.match(/\b(?:if|for|while|case|catch)\b|&&|\|\||\?\?/g);
  return 1 + (m ? m.length : 0);
}`, explanation: 'A complexidade ciclomática conta os caminhos independentes: cada decisão soma 1 (o ESLint conta de forma equivalente, com mais detalhes).' }
],
'cln-02': [
  { id: 'cln-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que define uma "responsabilidade" no SRP?', options: ['Fazer exatamente uma coisa', 'Ter um único motivo para mudar', 'Ter no máximo 20 linhas', 'Ter um só método'], answer: 1, explanation: 'Responsabilidade é um grupo de interesse que pede mudanças (financeiro, marketing, infraestrutura).' },
  { id: 'cln-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: um Quadrado que herda de Retângulo devolve a mesma área (20) que o Retângulo quando o cliente define largura 5 e altura 4.', answer: false, explanation: 'Devolve 16, porque cada setter muda as duas medidas: viola o LSP.' },
  { id: 'cln-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o princípio ao sintoma de violação.', pairs: [['SRP', 'Classe que calcula, formata e grava'], ['OCP', 'switch que cresce a cada tipo novo'], ['ISP', 'Método que lança "não suportado" em uma implementação'], ['DIP', 'new Date() criado dentro da regra de negócio']], explanation: 'Exemplos do laboratório.' },
  { id: 'cln-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarDescontos(inicial)§ (OCP): devolve §{ registrar(tipo, fn), aplicar(tipo, valor) }§. §aplicar§ usa a função registrada para o tipo; para tipo desconhecido devolve o valor sem alteração. §registrar§ de um tipo existente substitui a regra. §inicial§ é opcional e não deve ser alterado por §registrar§.', lang: 'javascript', starter: 'function criarDescontos(inicial) {\n  // seu código aqui\n}\n', hints: ['Copie o objeto inicial com spread.', 'Use ?? para a função padrão.'], tests: [{ name: 'regras', code: R`const d = criarDescontos({ vip: (v) => v * 0.8 });
assert.equal(d.aplicar('vip', 100), 80);
assert.equal(d.aplicar('estudante', 100), 100);
d.registrar('estudante', (v) => v * 0.5);
assert.equal(d.aplicar('estudante', 100), 50);
assert.equal(d.aplicar('vip', 100), 80);` }, { name: 'sem inicial e isolamento', code: R`const d1 = criarDescontos();
assert.equal(d1.aplicar('x', 7), 7);
const base = { a: (v) => v + 1 };
const d2 = criarDescontos(base);
d2.registrar('b', (v) => v * 3);
assert.equal('b' in base, false);
d2.registrar('a', (v) => v - 1);
assert.equal(d2.aplicar('a', 10), 9);` }], solution: R`function criarDescontos(inicial = {}) {
  const regras = { ...inicial };
  return {
    registrar(tipo, fn) { regras[tipo] = fn; },
    aplicar(tipo, valor) { return (regras[tipo] ?? ((v) => v))(valor); }
  };
}`, explanation: 'Novas regras entram sem editar as existentes.' },
  { id: 'cln-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a diferença entre injeção de dependência e inversão de dependência e mostre como o relógio injetado tornou o teste determinístico.', model: 'A inversão de dependência é o princípio: o código de negócio depende de abstrações que ele define (um relógio, um repositório), e os detalhes se adaptam a elas. A injeção é a técnica de receber as dependências de fora (construtor, parâmetro) em vez de criá-las. No laboratório, ServicoLembrete recebe { relogio, repositorio }; o teste passa () => new Date("2026-11-25T10:00:00Z"), e o resultado fica independente da data real; a versão acoplada usava new Date() e só funcionava com dados montados para o dia atual.', rubric: ['Define inversão como princípio', 'Define injeção como técnica', 'Relógio injetado e teste determinístico', 'Contraste com new Date() interno'], explanation: 'Resumo da aula.' },
  { id: 'cln-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §violaLsp(criarBase, criarSub, uso)§: cria uma instância de cada fábrica, aplica §uso§ a cada uma e devolve §true§ se os resultados forem diferentes (§!==§) ou se apenas um deles lançar exceção; devolve §false§ se os dois resultados forem iguais ou se os dois lançarem exceção.', lang: 'javascript', starter: 'function violaLsp(criarBase, criarSub, uso) {\n  // seu código aqui\n}\n', hints: ['Execute cada uso dentro de try/catch.', 'Compare também o fato de ter lançado exceção.'], tests: [{ name: 'quadrado x retângulo', code: R`class Ret { constructor(l, a) { this.l = l; this.a = a; } setL(l) { this.l = l; } setA(a) { this.a = a; } area() { return this.l * this.a; } }
class Quad extends Ret { setL(l) { this.l = l; this.a = l; } setA(a) { this.l = a; this.a = a; } }
const uso = (r) => { r.setL(5); r.setA(4); return r.area(); };
assert.equal(violaLsp(() => new Ret(1, 1), () => new Quad(1, 1), uso), true);` }, { name: 'substituível e exceções', code: R`class A { f() { return 1; } }
class B extends A { f() { return 1; } }
class C extends A { f() { throw new Error('não suportado'); } }
assert.equal(violaLsp(() => new A(), () => new B(), (x) => x.f()), false);
assert.equal(violaLsp(() => new A(), () => new C(), (x) => x.f()), true);
assert.equal(violaLsp(() => new C(), () => new C(), (x) => x.f()), false);` }], solution: R`function violaLsp(criarBase, criarSub, uso) {
  const executar = (fabrica) => { try { return { ok: true, v: uso(fabrica()) }; } catch (e) { return { ok: false }; } };
  const a = executar(criarBase); const b = executar(criarSub);
  if (a.ok !== b.ok) return true;
  return a.ok ? a.v !== b.v : false;
}`, explanation: 'O teste de contrato reutiliza o mesmo uso para o tipo base e para o subtipo.' }
],
'cln-03': [
  { id: 'cln-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que é refatoração?', options: ['Adicionar uma funcionalidade nova', 'Mudar a estrutura interna sem alterar o comportamento observável', 'Reescrever o sistema do zero', 'Corrigir um bug de segurança'], answer: 1, explanation: 'Os testes devem continuar iguais e verdes; correção de bug e novas funções são outros "chapéus".' },
  { id: 'cln-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: trocar > por >= no limite de 500 do código refatorado derrubou 1 teste de caracterização, mostrando que a rede protege a fronteira.', answer: true, explanation: 'Falhou o teste "exatamente 500 não desconta" (35 passaram, 1 falhou).' },
  { id: 'cln-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a refatoração ao seu uso.', pairs: [['Extrair função', 'Bloco com propósito nomeável'], ['Objeto de parâmetros', 'Quatro ou mais parâmetros'], ['Guard clauses', 'Pirâmide de ifs aninhados'], ['Adaptador com a assinatura antiga', 'Migrar chamadores aos poucos']], explanation: 'Catálogo básico.' },
  { id: 'cln-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §caracterizar(fn, entradas)§ (golden master): para cada entrada (lista de argumentos) devolve §{ entrada, saida }§ com o resultado de §fn(...entrada)§; se lançar exceção, devolve §{ entrada, erro: mensagem }§ no lugar de §saida§.', lang: 'javascript', starter: 'function caracterizar(fn, entradas) {\n  // seu código aqui\n}\n', hints: ['Use map e try/catch.', 'O erro deve ser a mensagem (e.message).'], tests: [{ name: 'saídas', code: R`const r = caracterizar((a, b) => a + b, [[1, 2], [3, 4]]);
assert.equal(JSON.stringify(r), '[{"entrada":[1,2],"saida":3},{"entrada":[3,4],"saida":7}]');` }, { name: 'erros', code: R`const r = caracterizar((x) => { if (x < 0) throw new Error('negativo'); return x; }, [[1], [-1]]);
assert.equal(JSON.stringify(r), '[{"entrada":[1],"saida":1},{"entrada":[-1],"erro":"negativo"}]');
assert.equal(JSON.stringify(caracterizar(() => 0, [])), '[]');` }], solution: R`function caracterizar(fn, entradas) {
  return entradas.map((entrada) => {
    try { return { entrada, saida: fn(...entrada) }; }
    catch (e) { return { entrada, erro: e.message }; }
  });
}`, explanation: 'Grava o comportamento atual, inclusive os erros, como referência.' },
  { id: 'cln-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Você precisa refatorar uma função sem testes. Descreva um plano seguro, citando caracterização, mutação e como migrar os chamadores.', model: 'Primeiro escrevo testes de caracterização (ou um golden master) com entradas variadas, incluindo fronteiras, para registrar o comportamento atual, inclusive o estranho. Verifico a força dos testes com uma mutação (por exemplo > por >=): se nenhum falhar, adiciono casos. Refatoro em passos pequenos (renomear, extrair função, constantes, guard clauses, objeto de parâmetros) rodando os testes a cada passo e fazendo commits separados. Mantenho um adaptador com a assinatura antiga para migrar os chamadores aos poucos e o removo ao final. Mudanças de comportamento ficam em outro commit.', rubric: ['Testes de caracterização', 'Verificação por mutação', 'Passos pequenos com testes verdes', 'Adaptador para migrar chamadores', 'Separar refatoração de mudança de comportamento'], explanation: 'Resumo da aula.' },
  { id: 'cln-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §equivalentes(a, b, entradas)§: executa as funções §a§ e §b§ com cada entrada (lista de argumentos) e devolve a lista dos índices das entradas em que o resultado difere. O resultado de cada execução é o valor devolvido ou, se lançar, §{ erro: mensagem }§; compare com §JSON.stringify§.', lang: 'javascript', starter: 'function equivalentes(a, b, entradas) {\n  // seu código aqui\n}\n', hints: ['Crie um helper que executa e captura o erro.', 'Colete o índice quando as strings JSON forem diferentes.'], tests: [{ name: 'diferenças', code: R`const legado = (x) => (x > 500 ? x - 25 : x);
const novo = (x) => (x >= 500 ? x - 25 : x);
assert.equal(JSON.stringify(equivalentes(legado, novo, [[100], [500], [501]])), '[1]');
assert.equal(JSON.stringify(equivalentes(legado, legado, [[1], [2]])), '[]');` }, { name: 'erros', code: R`const a = (x) => { if (x === 0) throw new Error('zero'); return x; };
const b = (x) => x;
assert.equal(JSON.stringify(equivalentes(a, b, [[1], [0]])), '[1]');
assert.equal(JSON.stringify(equivalentes(a, a, [[0]])), '[]');` }], solution: R`function equivalentes(a, b, entradas) {
  const exec = (f, args) => { try { return JSON.stringify(f(...args)); } catch (e) { return JSON.stringify({ erro: e.message }); } };
  const dif = [];
  entradas.forEach((args, i) => { if (exec(a, args) !== exec(b, args)) dif.push(i); });
  return dif;
}`, explanation: 'Compara as duas versões sobre as mesmas entradas, como no laboratório.' }
],
'cln-04': [
  { id: 'cln-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que é um code smell?', options: ['Um erro de compilação', 'Um indício de problema de design que pede investigação', 'Uma vulnerabilidade de segurança', 'Um teste que falha'], answer: 1, explanation: 'O código funciona, mas custa caro mudar.' },
  { id: 'cln-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o jscpd, sem informar limites, detectou os clones das três funções copiadas.', answer: false, explanation: 'Detectou 0 clones: os trechos diferem em um token; com 3 linhas e 15 tokens apareceram 4 clones (21 linhas, 75%).' },
  { id: 'cln-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o smell à refatoração.', pairs: [['Método longo', 'Extrair função'], ['Lista longa de parâmetros', 'Objeto de parâmetros'], ['Inveja de recurso', 'Mover função'], ['Obsessão por primitivos', 'Objeto de valor']], explanation: 'Catálogo básico.' },
  { id: 'cln-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §blocosDuplicados(linhas, tamanho)§: considere cada janela de §tamanho§ linhas consecutivas (comparando as linhas com §trim()§ e juntando com §"\\n"§); devolva o número de janelas distintas que aparecem em §2§ ou mais posições. Se houver menos linhas do que §tamanho§, devolva §0§.', lang: 'javascript', starter: 'function blocosDuplicados(linhas, tamanho) {\n  // seu código aqui\n}\n', hints: ['Use um Map de chave → contagem.', 'Percorra i de 0 até linhas.length - tamanho.'], tests: [{ name: 'sem duplicação', code: R`assert.equal(blocosDuplicados(['a', 'b', 'c'], 2), 0);
assert.equal(blocosDuplicados(['a'], 2), 0);` }, { name: 'com duplicação', code: R`assert.equal(blocosDuplicados(['x', 'y', 'z', 'x', 'y', 'w'], 2), 1);
assert.equal(blocosDuplicados(['a', 'b', 'x', ' a ', 'b '], 2), 1);
assert.equal(blocosDuplicados([' a', 'b', 'b', ' a'], 2), 0);
assert.equal(blocosDuplicados(['a', 'a', 'a', 'a'], 2), 1);
assert.equal(blocosDuplicados(['p', 'q', 'p', 'q', 'p', 'q'], 2), 2);` }], solution: R`function blocosDuplicados(linhas, tamanho) {
  const cont = new Map();
  for (let i = 0; i + tamanho <= linhas.length; i++) {
    const k = linhas.slice(i, i + tamanho).map((l) => l.trim()).join('\n');
    cont.set(k, (cont.get(k) || 0) + 1);
  }
  return [...cont.values()].filter((n) => n >= 2).length;
}`, explanation: 'É a ideia de um detector de clones por janela deslizante, simplificada (sem tokens).' },
  { id: 'cln-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando duplicação de código NÃO deve ser removida? Diferencie duplicação de conhecimento de duplicação acidental.', model: 'Duplicação de conhecimento é a mesma regra de negócio em dois lugares (por exemplo, "só pedidos pagos entram no total, em centavos"): deve ser unificada, pois tende a divergir. Duplicação acidental é código parecido hoje por coincidência, com razões diferentes para mudar: unificar cria acoplamento falso e abstrações cheias de parâmetros. A regra dos três recomenda duplicar duas vezes e abstrair na terceira, quando o padrão fica claro; abstrações prematuras (Yagni) custam mais do que a duplicação.', rubric: ['Define duplicação de conhecimento', 'Define duplicação acidental', 'Regra dos três ou Yagni', 'Acoplamento falso'], explanation: 'Resumo da aula.' },
  { id: 'cln-04-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §contarMagicos(codigo)§: conta os literais numéricos do texto que não estão em §[0, 1, -1, 2, 100]§ (ignore números dentro de texto entre aspas simples ou duplas e partes de identificadores como §a2§). Considere números como §0.9§ e §500§.', lang: 'javascript', starter: 'function contarMagicos(codigo) {\n  // seu código aqui\n}\n', hints: ['Remova primeiro os textos entre aspas.', 'Use lookbehind para não casar dígitos dentro de identificadores.'], tests: [{ name: 'básico', code: R`assert.equal(contarMagicos('r = r * 0.9 + 500'), 2);
assert.equal(contarMagicos('x = 0; y = 1; z = 2; w = 100'), 0);
assert.equal(contarMagicos('if (r > 1000) r -= 25'), 2);` }, { name: 'textos e identificadores', code: R`assert.equal(contarMagicos("msg = 'total 500'; a2 = 7"), 1);
assert.equal(contarMagicos('const T = "x 30 y"; f(3)'), 1);
assert.equal(contarMagicos(''), 0);` }], solution: R`function contarMagicos(codigo) {
  const sem = codigo.replace(/'[^']*'|"[^"]*"/g, ' ');
  const ok = new Set(['0', '1', '2', '100']);
  const m = sem.match(/(?<![\w.])\d+(?:\.\d+)?(?![\w.])/g) || [];
  return m.filter((n) => !ok.has(n)).length;
}`, explanation: 'Modela a regra no-magic-numbers do ESLint (que também aceita -1 por configuração; aqui o sinal fica de fora do literal).' }
],
'cln-05': [
  { id: 'cln-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que são os "juros" da dívida técnica?', options: ['O esforço de refazer o código', 'O custo recorrente de conviver com a dívida em cada mudança', 'A multa por atraso de entrega', 'O número de bugs corrigidos'], answer: 1, explanation: 'Principal é o esforço de pagar; juros são o custo recorrente.' },
  { id: 'cln-05-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'No modelo do laboratório, um módulo feio que ninguém altera tem payback infinito e não vale o esforço de refatorar agora.', answer: true, explanation: 'Juros = 0 h/mês: "nunca" se paga (dados hipotéticos).' },
  { id: 'cln-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o item (dados hipotéticos do laboratório) ao payback medido.', pairs: [['proc-legado-pedidos', '2 meses'], ['testes-lentos-ci', '2,7 meses'], ['relatorios-duplicados', '4 meses'], ['modulo-estavel-feio', 'nunca']], explanation: 'Saída do script de priorização.' },
  { id: 'cln-05-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §paybackMeses(item, horasPorDia)§: §item = { esforcoDias, mudancasPorMes, minutosExtraPorMudanca }§; juros por mês em horas = §mudancasPorMes * minutosExtraPorMudanca / 60§; payback = §esforcoDias * horasPorDia / juros§ arredondado a 1 casa decimal. Se os juros forem 0 devolva §null§. §horasPorDia§ padrão 8.', lang: 'javascript', starter: 'function paybackMeses(item, horasPorDia) {\n  // seu código aqui\n}\n', hints: ['Use um valor padrão para horasPorDia.', 'Arredonde com Math.round(x * 10) / 10.'], tests: [{ name: 'valores do curso', code: R`assert.equal(paybackMeses({ esforcoDias: 3, mudancasPorMes: 8, minutosExtraPorMudanca: 90 }), 2);
assert.equal(paybackMeses({ esforcoDias: 2, mudancasPorMes: 60, minutosExtraPorMudanca: 6 }), 2.7);
assert.equal(paybackMeses({ esforcoDias: 1, mudancasPorMes: 3, minutosExtraPorMudanca: 40 }), 4);` }, { name: 'zero e jornada', code: R`assert.equal(paybackMeses({ esforcoDias: 5, mudancasPorMes: 0, minutosExtraPorMudanca: 120 }), null);
assert.equal(paybackMeses({ esforcoDias: 1, mudancasPorMes: 4, minutosExtraPorMudanca: 30 }, 6), 3);` }], solution: R`function paybackMeses(item, horasPorDia = 8) {
  const juros = (item.mudancasPorMes * item.minutosExtraPorMudanca) / 60;
  if (juros === 0) return null;
  return Math.round(((item.esforcoDias * horasPorDia) / juros) * 10) / 10;
}`, explanation: 'Modelo simples e transparente: calibre com dados reais.' },
  { id: 'cln-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como convencer a gestão de produto a reservar tempo para pagar uma dívida técnica? Que dados e que opções você apresentaria?', model: 'Traduzo a dívida em tempo, risco e custo: por exemplo, cada mudança no módulo leva 90 minutos a mais e há 8 mudanças por mês, o que dá 12 horas por mês; corrigir custa 3 dias e se paga em 2 meses. Conecto a metas de produto (velocidade de entrega, incidentes, segurança, onboarding) e ofereço opções com consequências (pagar tudo, pagar metade ou conviver), usando dados do histórico e um incidente real como exemplo. Registro a dívida com tíquete e gatilho e sugiro capacidade fixa no ciclo ou pagar ao tocar o módulo.', rubric: ['Traduz juros em horas ou custo', 'Mostra esforço e payback', 'Conecta a metas do negócio', 'Oferece opções com consequências'], explanation: 'Resumo da aula.' },
  { id: 'cln-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §hotspots(arquivos, topo)§: §arquivos§ é uma lista de §{ nome, mudancas, complexidade }§. A pontuação é §mudancas * complexidade§. Devolva os nomes dos §topo§ arquivos com maior pontuação, em ordem decrescente (empate: ordem alfabética do nome); ignore os que têm pontuação 0.', lang: 'javascript', starter: 'function hotspots(arquivos, topo) {\n  // seu código aqui\n}\n', hints: ['Filtre pontuação > 0 e ordene.', 'Use slice(0, topo).'], tests: [{ name: 'ordem', code: R`const a = [{ nome: 'pedido.js', mudancas: 40, complexidade: 14 }, { nome: 'util.js', mudancas: 100, complexidade: 2 }, { nome: 'config.js', mudancas: 2, complexidade: 30 }, { nome: 'velho.js', mudancas: 0, complexidade: 50 }];
assert.equal(JSON.stringify(hotspots(a, 2)), '["pedido.js","util.js"]');
assert.equal(JSON.stringify(hotspots(a, 10)), '["pedido.js","util.js","config.js"]');` }, { name: 'empate e vazio', code: R`const b = [{ nome: 'b.js', mudancas: 2, complexidade: 5 }, { nome: 'a.js', mudancas: 5, complexidade: 2 }];
assert.equal(JSON.stringify(hotspots(b, 1)), '["a.js"]');
assert.equal(JSON.stringify(hotspots([], 3)), '[]');` }], solution: R`function hotspots(arquivos, topo) {
  return arquivos
    .map((a) => ({ nome: a.nome, p: a.mudancas * a.complexidade }))
    .filter((a) => a.p > 0)
    .sort((x, y) => y.p - x.p || (x.nome < y.nome ? -1 : x.nome > y.nome ? 1 : 0))
    .slice(0, topo)
    .map((a) => a.nome);
}`, explanation: 'Hotspots combinam frequência de mudança e complexidade.' }
]
};

const P = 'clean-code-p';
export const assessment = {
  id: 'clean-code', title: 'Avaliação final — Clean Code e SOLID', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual prática reduz o aninhamento de condicionais?', options: ['Mais else', 'Retornos antecipados (guard clauses)', 'Variáveis globais', 'Comentários'], answer: 1, explanation: 'Trata o caso excepcional no início e segue em linha reta.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'No laboratório, a versão refatorada reduziu os avisos do ESLint de 20 para 1.', answer: true, explanation: 'O aviso restante é o adaptador com 5 parâmetros, mantido de propósito.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Leia o contrato do cliente e o resultado medido.', code: 'const usar = (r) => { r.setLargura(5); r.setAltura(4); return r.area(); };\nusar(new Retangulo(1, 1));  // 20\nusar(new Quadrado(1, 1));   // ?', lang: 'js', steps: [{ q: 'Qual é o resultado com o Quadrado, que muda as duas medidas em cada setter (use um número)?', answers: ['16'] }, { q: 'Qual princípio SOLID essa herança viola? (sigla)', answers: ['LSP', 'lsp'] }], explanation: 'O último setter define 4 nas duas medidas: área 16.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual é a melhor definição de responsabilidade no SRP?', options: ['Um método por classe', 'Um motivo para mudar', 'Um arquivo por função', 'Uma interface por módulo'], answer: 1, explanation: 'Define-se pelos grupos de interesse que pedem mudanças.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna o teste dependente da data real (viola o DIP).', code: 'class Lembretes {\n  constructor(repositorio) { this.repositorio = repositorio; }\n  deHoje() {\n    const hoje = new Date().toISOString().slice(0, 10);\n    return this.repositorio.todos().filter((l) => l.data === hoje);\n  }\n}', answer: 4, explanation: 'new Date() dentro da regra de negócio: injete um relógio.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a regra de design.', code: 'Função que altera o estado = comando\nFunção que devolve informação = [[0]]\nPrincípio: separação comando-[[1]]', answers: [['consulta'], ['consulta']], explanation: 'Separação comando-consulta.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o smell à sua família.', pairs: [['Método longo', 'Bloater'], ['Shotgun surgery', 'Impedidor de mudança'], ['Código duplicado', 'Dispensável'], ['Feature envy', 'Acoplador']], explanation: 'Famílias do catálogo.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido: o jscpd sem limites ajustados detectou quantos clones nas três funções copiadas?', options: ['4', '3', '0', '21'], answer: 2, explanation: 'Nenhum: os trechos diferem em um token; com 3 linhas e 15 tokens, 4 clones.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Priorizar a dívida técnica pelo maior número de linhas feias é a melhor estratégia.', answer: false, explanation: 'Priorize por juros e payback (hotspots): o módulo feio que ninguém altera nunca se paga.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual técnica permite migrar os chamadores de uma função aos poucos ao mudar sua assinatura?', options: ['Reescrever tudo', 'Adaptador com a assinatura antiga delegando à nova', 'Apagar os testes', 'Comentar o código antigo'], answer: 1, explanation: 'O adaptador é removido quando não houver mais usos.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Você herdou uma função de 200 linhas sem testes que precisa ganhar uma regra nova. Descreva como proceder (rede de segurança, refatoração, nova regra e dívida restante).', model: 'Escrevo testes de caracterização com entradas variadas (incluindo fronteiras e comportamentos estranhos) e verifico a força por mutação. Refatoro em passos pequenos, só o que preciso tocar (renomear, extrair funções, constantes, guard clauses, objeto de parâmetros), com testes verdes e commits separados, mantendo um adaptador se a assinatura mudar. Só então adiciono a regra nova com testes próprios, em outro commit. O que não toquei e o restante da dívida entram no backlog com tíquete, impacto e juros, para priorização por payback.', rubric: ['Testes de caracterização', 'Passos pequenos com testes verdes', 'Regra nova separada da refatoração', 'Registro da dívida restante'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que não unificar dois trechos parecidos por coincidência?', options: ['Porque o linter proíbe', 'Porque cria acoplamento falso entre razões de mudança diferentes', 'Porque é mais lento', 'Porque o Git não permite'], answer: 1, explanation: 'Duplicação acidental deve ser tolerada até a terceira ocorrência (regra dos três).' }
  ]
};

export const project = {
  id: 'refatoracao-guiada', name: 'Refatoração guiada: do legado ao código limpo com testes de caracterização, SOLID e plano de dívida', lv: 'M', stack: 'JavaScript, Node.js test runner, ESLint, jscpd', ds: ['clean'],
  desc: 'Receba um **módulo legado** (cálculo de pedido, relatório ou parser) e **refatore-o com segurança**: **testes de caracterização**, **passos pequenos**, **funções com nomes de domínio**, **princípios SOLID** onde houver variação real, **medições** (ESLint, jscpd) **antes e depois**, **adaptador** para os chamadores e **plano de dívida técnica** com **juros e payback**.',
  rf: ['Escrever no mínimo 15 casos de caracterização (incluindo fronteiras e comportamentos estranhos) que passam no legado', 'Verificar a força dos testes com pelo menos 2 mutações manuais e registrar o resultado', 'Refatorar em passos pequenos, com commits separados e testes verdes a cada passo', 'Substituir números mágicos, flags, aninhamento e parâmetros longos por constantes, guard clauses e objeto nomeado', 'Aplicar SRP, OCP ou DIP onde houver variação real e justificar o que não foi abstraído (Yagni)', 'Manter um adaptador com a assinatura antiga e documentar o plano de migração', 'Registrar as medições antes e depois (ESLint e jscpd) com a configuração usada', 'Produzir um backlog de dívida com impacto, esforço, juros e payback para o que restou'],
  rnf: ['Nenhuma mudança de comportamento sem um commit e um teste próprios', 'Limites do ESLint documentados e justificados (não como meta)', 'README com comandos, resultados e limitações', 'Nomes no vocabulário do domínio e um idioma único'],
  ac: ['Os mesmos testes de caracterização passam no legado e no refatorado', 'Pelo menos uma mutação de fronteira é detectada por um teste', 'Os avisos do ESLint caem e os que restam são explicados', 'O jscpd (com limites calibrados) não encontra duplicação de conhecimento', 'O backlog de dívida prioriza por payback e justifica o que ficou'],
  ch: ['Rodar uma ferramenta de teste de mutação (Stryker) e comparar com as mutações manuais', 'Migrar o código para TypeScript mantendo os testes', 'Adicionar o ESLint e a verificação de duplicação ao CI como portão apenas para código novo', 'Aplicar a mesma técnica a um módulo real do seu projeto']
};
