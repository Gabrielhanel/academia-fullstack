// C2.8 — Arquitetura frontend: exercícios das aulas 5 a 7, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'arq-05': [
  { id: 'arq-05-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que React deve ser declarado como §singleton§ em §shared§ no Module Federation?', options: ['Para o build ficar menor apenas', 'Para haver uma única instância do React na página: duas instâncias quebram hooks e contextos', 'Porque o Vite exige', 'Para desativar o tree shaking'], answer: 1, explanation: 'Com duas cópias de React, hooks e contexto falham ("Invalid hook call"); singleton negocia uma única instância.' },
  { id: 'arq-05-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do laboratório (semver 7.8.6; @module-federation/vite 1.25.0 no Chrome 157).', code: '18.2.0 satisfaz ^18.0.0: ?\n19.0.0 satisfaz ^18.0.0: ?\n^18.0.0 e ^19.0.0 têm intersecção: ?\n0.3.0 satisfaz ^0.2.3: ?\nbotão do remote após o clique: "remoto ?"', lang: 'text', steps: [{ q: '18.2.0 satisfaz ^18.0.0 (true/false):', answers: ['true'] }, { q: '19.0.0 satisfaz ^18.0.0 (true/false):', answers: ['false'] }, { q: '^18 e ^19 têm intersecção (true/false):', answers: ['false'] }, { q: '0.3.0 satisfaz ^0.2.3 (true/false):', answers: ['false'] }, { q: 'Número exibido pelo botão do remote depois de um clique:', answers: ['1'] }], explanation: 'Em ^0.2.3 só valem versões 0.2.x; o remote renderizou e reagiu ao clique no Chrome.' },
  { id: 'arq-05-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Depois de publicar o remote, a página quebra com "Invalid hook call". Clique na linha provável da causa.', code: 'federation({\n  name: "remoto", filename: "remoteEntry.js",\n  exposes: { "./Botao": "./src/Botao.jsx" },\n  shared: { react: { singleton: false }, "react-dom": { singleton: false } }\n})', answer: 4, explanation: 'Sem singleton cada parte pode carregar a própria cópia de React, e hooks e contextos quebram. Use singleton: true com requiredVersion.' },
  { id: 'arq-05-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Carregar um remote de outra origem equivale a executar código externo na sua página, por isso deve vir apenas de origens confiáveis e com CSP restritiva.', answer: true, explanation: 'O código do remote roda com os privilégios da página: confiança, CSP, integridade e atenção à cadeia de suprimentos.' },
  { id: 'arq-05-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §satisfaz(versao, faixa)§ e §resolverShared(participantes)§ (versão **simplificada** do semver). §satisfaz§: §versao§ no formato §"M.m.p"§ (inválida → §Error("versão inválida: V")§); §faixa§ é uma ou mais condições separadas por espaço (todas devem valer): §"^M.m.p"§ (compatível: para M>0 → >=M.m.p e <(M+1).0.0; para M=0 e m>0 → >=0.m.p e <0.(m+1).0; para 0.0.p → exatamente 0.0.p), §"~M.m.p"§ (>=M.m.p e <M.(m+1).0), §">=M.m.p"§, §">M.m.p"§, §"<M.m.p"§, §"<=M.m.p"§, §"M.m.p"§ (exata) e §"*"§ (qualquer). Faixa inválida → §Error("faixa inválida: F")§. §resolverShared§: §participantes§ é uma lista de §{ nome, versao, faixa }§ (versão instalada e a faixa exigida). Entre as **versões instaladas distintas**, escolha a **maior** que satisfaça a faixa de **todos**; devolva §{ versao, conflitos: [] }§. Se nenhuma servir, devolva §{ versao: null, conflitos }§ com a lista (ordenada por nome) dos participantes cuja faixa **não** é satisfeita pela **maior** versão instalada, no formato §{ nome, faixa }§.', lang: 'javascript', starter: 'function satisfaz(versao, faixa) {\n  // seu código aqui\n}\nfunction resolverShared(participantes) {\n  // seu código aqui\n}\n', hints: ['Converta "M.m.p" em [M, m, p] e compare por partes.', 'Para cada condição calcule limite inferior e superior.'], tests: [{ name: 'faixas', code: R`assert.equal(satisfaz('18.2.0', '^18.0.0'), true);
assert.equal(satisfaz('19.0.0', '^18.0.0'), false);
assert.equal(satisfaz('17.9.9', '^18.0.0'), false);
assert.equal(satisfaz('0.2.9', '^0.2.3'), true);
assert.equal(satisfaz('0.3.0', '^0.2.3'), false);
assert.equal(satisfaz('0.0.3', '^0.0.3'), true); assert.equal(satisfaz('0.0.4', '^0.0.3'), false);
assert.equal(satisfaz('18.2.5', '~18.2.0'), true); assert.equal(satisfaz('18.3.0', '~18.2.0'), false);
assert.equal(satisfaz('19.3.1', '>=18.0.0 <20.0.0'), true);
assert.equal(satisfaz('20.0.0', '>=18.0.0 <20.0.0'), false);
assert.equal(satisfaz('1.2.3', '1.2.3'), true); assert.equal(satisfaz('1.2.4', '1.2.3'), false);
assert.equal(satisfaz('9.9.9', '*'), true);
assert.equal(satisfaz('1.0.0', '>1.0.0'), false); assert.equal(satisfaz('1.0.1', '>1.0.0'), true); assert.equal(satisfaz('1.0.0', '<=1.0.0'), true);` }, { name: 'erros', code: R`assert.throws(() => satisfaz('1.2', '^1.0.0'), 'versão inválida: 1.2');
assert.throws(() => satisfaz('1.2.3', '^x'), 'faixa inválida: ^x');
assert.throws(() => satisfaz('1.2.3', '=>1.0.0'), 'faixa inválida: =>1.0.0');` }, { name: 'resolver dependência compartilhada', code: R`const ok = resolverShared([{ nome: 'host', versao: '19.3.1', faixa: '^19.0.0' }, { nome: 'remoto', versao: '19.1.0', faixa: '^19.0.0' }]);
assert.deepEqual(ok, { versao: '19.3.1', conflitos: [] });
const mix = resolverShared([{ nome: 'host', versao: '18.3.1', faixa: '^18.0.0' }, { nome: 'remoto', versao: '18.0.0', faixa: '>=18.0.0 <19.0.0' }, { nome: 'outro', versao: '19.0.0', faixa: '^18.0.0' }]);
assert.deepEqual(mix, { versao: '18.3.1', conflitos: [] });
const conf = resolverShared([{ nome: 'host', versao: '18.3.1', faixa: '^18.0.0' }, { nome: 'remoto', versao: '19.0.0', faixa: '^19.0.0' }]);
assert.deepEqual(conf, { versao: null, conflitos: [{ nome: 'host', faixa: '^18.0.0' }] });` }], solution: R`function parse(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) throw new Error('versão inválida: ' + v);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
function satisfaz(versao, faixa) {
  const v = parse(versao);
  const condicoes = faixa.trim().split(/\s+/);
  return condicoes.every((c) => {
    if (c === '*') return true;
    const m = /^(\^|~|>=|>|<=|<)?(\d+\.\d+\.\d+)$/.exec(c);
    if (!m) throw new Error('faixa inválida: ' + c);
    const alvo = parse(m[2]);
    switch (m[1]) {
      case '^': {
        if (alvo[0] > 0) return cmp(v, alvo) >= 0 && cmp(v, [alvo[0] + 1, 0, 0]) < 0;
        if (alvo[1] > 0) return cmp(v, alvo) >= 0 && cmp(v, [0, alvo[1] + 1, 0]) < 0;
        return cmp(v, alvo) === 0;
      }
      case '~': return cmp(v, alvo) >= 0 && cmp(v, [alvo[0], alvo[1] + 1, 0]) < 0;
      case '>=': return cmp(v, alvo) >= 0;
      case '>': return cmp(v, alvo) > 0;
      case '<=': return cmp(v, alvo) <= 0;
      case '<': return cmp(v, alvo) < 0;
      default: return cmp(v, alvo) === 0;
    }
  });
}
function resolverShared(participantes) {
  const versoes = [...new Set(participantes.map((p) => p.versao))].sort((a, b) => cmp(parse(b), parse(a)));
  for (const v of versoes) if (participantes.every((p) => satisfaz(v, p.faixa))) return { versao: v, conflitos: [] };
  const maior = versoes[0];
  const conflitos = participantes.filter((p) => !satisfaz(maior, p.faixa)).map((p) => ({ nome: p.nome, faixa: p.faixa })).sort((a, b) => (a.nome < b.nome ? -1 : 1));
  return { versao: null, conflitos };
}
`, explanation: 'O runtime do Module Federation negocia uma versão que satisfaça as faixas de todos; sem intersecção há conflito, e o singleton pode quebrar.' }
],
'arq-06': [
  { id: 'arq-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual mecanismo é o contrato de navegação mais estável entre microfrontends?', options: ['Um objeto global em window', 'A URL (rota e parâmetros)', 'Variáveis do localStorage lidas por todos', 'Importar o código interno do outro'], answer: 1, explanation: 'A URL é pública, entendida por todos e sobrevive a recarregamentos e links.' },
  { id: 'arq-06-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade ao mecanismo mais adequado.', pairs: [['Dizer a qual item de uma lista a pessoa está olhando', 'URL (parâmetros)'], ['Avisar que um item foi adicionado ao carrinho sem conhecer os ouvintes', 'Evento publicar-assinar com contrato'], ['Encerrar a sessão em todas as abas', 'BroadcastChannel'], ['Dar o usuário autenticado ao microfrontend montado pelo shell', 'Props (ou contexto mínimo) fornecidas pelo shell']], explanation: 'Escolha o mecanismo menos acoplado que atende à necessidade.' },
  { id: 'arq-06-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O contador do cabeçalho dobra depois de navegar entre telas do microfrontend. Clique na linha que causa o vazamento.', code: 'function useSelo() {\n  const [n, setN] = useState(0);\n  useEffect(() => {\n    window.addEventListener("carrinho:item-adicionado", () => setN((x) => x + 1));\n  }, []);\n  return n;\n}', answer: 4, explanation: 'A assinatura nunca é cancelada e o ouvinte é uma função anônima: ao montar de novo, os ouvintes se acumulam. Devolva uma função de limpeza que remove o mesmo ouvinte.' },
  { id: 'arq-06-e4', type: 'open', difficulty: 3, points: 10, prompt: 'O campo §quantidade§ do evento §carrinho:item-adicionado§ precisa virar um objeto §{ valor, unidade }§. Descreva como fazer a mudança sem quebrar os consumidores.', model: 'A mudança é incompatível, então exige uma nova versão do contrato e um período de convivência. A equipe emite o evento v2 com o novo formato (carrinho:item-adicionado.v2 ou versao: 2) e continua emitindo a v1 com o formato antigo em paralelo; anuncia a depreciação da v1 com data de remoção e registra os consumidores (cabeçalho, analytics). Os consumidores migram para a v2 no seu ritmo, validando o payload, e os testes de contrato do emissor garantem que ambas as versões continuam sendo atendidas. Medem-se os usos da v1 (por exemplo, com logs ou métricas do barramento) e, quando ninguém mais a usa ou a data chega, remove-se a v1. Mudanças compatíveis (campos opcionais) não exigem versão nova.', rubric: ['Identifica a mudança como incompatível e propõe nova versão', 'Propõe emitir v1 e v2 em paralelo', 'Inclui depreciação com data, consumidores e testes de contrato', 'Prevê a medição do uso e a remoção da versão antiga'], explanation: 'Contratos evoluem com versões, convivência e depreciação planejada.' },
  { id: 'arq-06-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarBarramento()§ (barramento de eventos com contratos). Métodos: §registrar(nome, validador)§ (o validador recebe o payload e devolve §true§ se válido; nome já registrado → §Error("evento já registrado: N")§); §assinar(nome, fn)§ devolve uma função de **cancelamento** (nome não registrado → §Error("evento não registrado: N")§); §emitir(nome, payload)§ valida (não registrado → o mesmo erro; payload inválido → §Error("payload inválido para N")§) e chama os ouvintes **na ordem de assinatura**; um ouvinte que **lança** não impede os demais. Devolve §{ entregues, erros }§: §entregues§ é o número de ouvintes que terminaram **sem** erro; §erros§ a lista das **mensagens** dos erros lançados. §ouvintes(nome)§ devolve quantos ouvintes ativos o evento tem. Cancelar duas vezes não deve causar problema. Cancelar durante a emissão não afeta a emissão em curso (use uma cópia da lista).', lang: 'javascript', starter: 'function criarBarramento() {\n  // seu código aqui\n}\n', hints: ['Guarde validadores e listas de ouvintes em Maps.', 'Itere sobre uma cópia da lista de ouvintes e capture exceções com try/catch.'], tests: [{ name: 'contrato, ordem e entrega', code: R`const b = criarBarramento();
b.registrar('carrinho:item-adicionado', (p) => p && typeof p.quantidade === 'number' && p.quantidade >= 1);
const log = [];
b.assinar('carrinho:item-adicionado', (p) => log.push('a' + p.quantidade));
b.assinar('carrinho:item-adicionado', (p) => log.push('b' + p.quantidade));
const r = b.emitir('carrinho:item-adicionado', { quantidade: 2 });
assert.deepEqual(r, { entregues: 2, erros: [] });
assert.deepEqual(log, ['a2', 'b2']);
assert.equal(b.ouvintes('carrinho:item-adicionado'), 2);
assert.throws(() => b.emitir('carrinho:item-adicionado', { quantidade: 0 }), 'payload inválido para carrinho:item-adicionado');
assert.throws(() => b.emitir('outro', {}), 'evento não registrado: outro');
assert.throws(() => b.assinar('outro', () => {}), 'evento não registrado: outro');
assert.throws(() => b.registrar('carrinho:item-adicionado', () => true), 'evento já registrado: carrinho:item-adicionado');` }, { name: 'isolamento de falhas e cancelamento', code: R`const b = criarBarramento(); b.registrar('x', () => true);
const log = [];
b.assinar('x', () => { throw new Error('ouvinte quebrou'); });
const cancelar = b.assinar('x', () => log.push('segundo'));
const r = b.emitir('x', {});
assert.deepEqual(r, { entregues: 1, erros: ['ouvinte quebrou'] });
assert.deepEqual(log, ['segundo']);
cancelar(); cancelar();
assert.equal(b.ouvintes('x'), 1);
b.emitir('x', {}); assert.deepEqual(log, ['segundo']);` }, { name: 'cancelar durante a emissão', code: R`const b = criarBarramento(); b.registrar('y', () => true);
const log = []; let cancelarB;
b.assinar('y', () => { log.push('a'); cancelarB(); });
cancelarB = b.assinar('y', () => log.push('b'));
b.emitir('y', 1);
assert.deepEqual(log, ['a', 'b']);
b.emitir('y', 1);
assert.deepEqual(log, ['a', 'b', 'a']);` }], solution: R`function criarBarramento() {
  const validadores = new Map(), ouvintes = new Map();
  const exigir = (nome) => { if (!validadores.has(nome)) throw new Error('evento não registrado: ' + nome); };
  return {
    registrar(nome, validador) {
      if (validadores.has(nome)) throw new Error('evento já registrado: ' + nome);
      validadores.set(nome, validador); ouvintes.set(nome, []);
    },
    assinar(nome, fn) {
      exigir(nome);
      const item = { fn };
      ouvintes.get(nome).push(item);
      return () => { const l = ouvintes.get(nome); const i = l.indexOf(item); if (i >= 0) l.splice(i, 1); };
    },
    emitir(nome, payload) {
      exigir(nome);
      if (!validadores.get(nome)(payload)) throw new Error('payload inválido para ' + nome);
      let entregues = 0; const erros = [];
      for (const { fn } of ouvintes.get(nome).slice()) {
        try { fn(payload); entregues++; } catch (e) { erros.push(e && e.message ? e.message : String(e)); }
      }
      return { entregues, erros };
    },
    ouvintes: (nome) => (ouvintes.get(nome) || []).length
  };
}
`, explanation: 'O barramento torna o evento uma API: nome registrado, payload validado, ouvintes isolados e assinaturas canceláveis, sem acoplar emissor e consumidores.' }
],
'arq-07': [
  { id: 'arq-07-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'O que a lei de Conway sugere sobre a arquitetura de um frontend?', options: ['Que a arquitetura independe da organização', 'Que o sistema tende a copiar a estrutura de comunicação das equipes, e organizar equipes por domínio ajuda a ter módulos por domínio', 'Que microfrontends são sempre melhores', 'Que monorepos são proibidos'], answer: 1, explanation: 'Organizar as equipes como se quer a arquitetura (manobra inversa) é parte da decisão.' },
  { id: 'arq-07-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o gargalo medido à primeira alternativa a tentar.', pairs: [['Build e CI lentos em uma base compartilhada', 'Monorepo com cache e tarefas afetadas'], ['Código acoplado, importações cruzadas e ciclos', 'Monólito modular com regras de fronteira automatizadas'], ['Uma jornada precisa publicar com ritmo próprio, com poucas equipes', 'Aplicação separada por rota (multi-zonas)'], ['Muitas equipes bloqueadas por um deploy único e domínios independentes', 'Microfrontends com plataforma e governança']], explanation: 'Comece pelo menor passo que resolve o gargalo medido.' },
  { id: 'arq-07-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Uma empresa com duas equipes e um produto coeso se beneficia mais de microfrontends completos do que de um monólito modular em um monorepo.', answer: false, explanation: 'Com poucas equipes o custo de plataforma, de desempenho e de contratos supera o benefício; a alternativa mais simples costuma bastar.' },
  { id: 'arq-07-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Escreva os argumentos de um ADR que decide NÃO adotar microfrontends para uma empresa com três equipes e um produto coeso, e que alternativa adotar.', model: 'Contexto: três equipes, um produto com jornadas muito integradas, conflitos de merge e CI lenta. Decisão: manter um monólito modular em monorepo (Turborepo ou Nx), com features, camadas e API pública verificadas por dependency-cruiser, cache de tarefas e execução apenas dos projetos afetados, e CODEOWNERS por feature; deploy único com feature flags. Alternativas descartadas: microfrontends (custo de plataforma, de desempenho com dependências duplicadas, de consistência e de contratos desproporcional a três equipes) e manter o repositório como está (não resolve a CI lenta nem o acoplamento). Consequências: build mais rápido, menos conflitos, deploy simples; limitação de independência de implantação. Critérios de sucesso: tempo de CI abaixo de 10 minutos, queda de conflitos de merge, orçamento de JavaScript mantido. Revisão em 6 meses ou se o número de equipes passar de oito ou surgir necessidade de ritmos de deploy muito distintos.', rubric: ['Descreve o contexto com dados e a decisão', 'Cita as alternativas descartadas e o motivo', 'Lista consequências e critérios de sucesso mensuráveis', 'Define a data ou condição de revisão'], explanation: 'Uma decisão de não adotar também precisa ser registrada e revisada.' },
  { id: 'arq-07-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §recomendarArquitetura(ctx)§. §ctx§: §{ equipes, codigoCompartilhado?, dominiosIndependentes?, deployIndependente?, jornadasIntegradas?, plataforma?, migracaoGradual? }§ (booleanos opcionais valem §false§). Pontuação de cada alternativa: **monolito-modular** = §4§ + (§equipes <= 3§ ? 2 : 0) − (§equipes >= 8§ ? 3 : 0); **monorepo-pacotes** = §3§ + (§codigoCompartilhado§ ? 2 : 0) + (§equipes >= 2§ ? 1 : 0); **multi-zonas** = §1§ + (§deployIndependente§ ? 3 : 0) − (§jornadasIntegradas§ ? 2 : 0); **microfrontends** = (§equipes >= 8§ ? 3 : 0) + (§dominiosIndependentes§ ? 2 : 0) + (§deployIndependente§ ? 2 : 0) + (§plataforma§ ? 2 : −4) + (§migracaoGradual§ ? 1 : 0). Devolva §{ recomendada, ranking }§ em que §ranking§ é a lista §{ nome, pontos }§ ordenada por pontos **decrescentes** e, em empate, pelo nome em ordem alfabética, e §recomendada§ o nome do primeiro. §equipes§ que não seja inteiro positivo → §Error("equipes inválidas")§.', lang: 'javascript', starter: 'function recomendarArquitetura(ctx) {\n  // seu código aqui\n}\n', hints: ['Calcule as quatro pontuações e ordene.', 'Trate os booleanos ausentes como falsos com !!.'], tests: [{ name: 'poucas equipes', code: R`const r = recomendarArquitetura({ equipes: 2, codigoCompartilhado: true });
assert.deepEqual(r.ranking, [{ nome: 'monolito-modular', pontos: 6 }, { nome: 'monorepo-pacotes', pontos: 6 }, { nome: 'multi-zonas', pontos: 1 }, { nome: 'microfrontends', pontos: -4 }]);
assert.equal(r.recomendada, 'monolito-modular');
const e = recomendarArquitetura({ equipes: 4, deployIndependente: true, jornadasIntegradas: true });
assert.equal(e.recomendada, 'monolito-modular');
assert.equal(recomendarArquitetura({ equipes: 5, deployIndependente: true, codigoCompartilhado: true }).recomendada, 'monorepo-pacotes');` }, { name: 'muitas equipes, com e sem plataforma', code: R`const com = recomendarArquitetura({ equipes: 12, dominiosIndependentes: true, deployIndependente: true, plataforma: true });
assert.equal(com.recomendada, 'microfrontends');
assert.equal(com.ranking[0].pontos, 9);
const sem = recomendarArquitetura({ equipes: 12, dominiosIndependentes: true, deployIndependente: true, plataforma: false });
assert.equal(sem.recomendada, 'monorepo-pacotes');
assert.deepEqual(sem.ranking.map((x) => x.nome), ['monorepo-pacotes', 'multi-zonas', 'microfrontends', 'monolito-modular']);
assert.equal(sem.ranking.find((x) => x.nome === 'microfrontends').pontos, 3);` }, { name: 'entrada inválida', code: R`assert.throws(() => recomendarArquitetura({ equipes: 0 }), 'equipes inválidas');
assert.throws(() => recomendarArquitetura({ equipes: 2.5 }), 'equipes inválidas');
assert.throws(() => recomendarArquitetura({}), 'equipes inválidas');` }], solution: R`function recomendarArquitetura(ctx) {
  const n = ctx && ctx.equipes;
  if (!Number.isInteger(n) || n < 1) throw new Error('equipes inválidas');
  const f = (k) => !!ctx[k];
  const ranking = [
    { nome: 'monolito-modular', pontos: 4 + (n <= 3 ? 2 : 0) - (n >= 8 ? 3 : 0) },
    { nome: 'monorepo-pacotes', pontos: 3 + (f('codigoCompartilhado') ? 2 : 0) + (n >= 2 ? 1 : 0) },
    { nome: 'multi-zonas', pontos: 1 + (f('deployIndependente') ? 3 : 0) - (f('jornadasIntegradas') ? 2 : 0) },
    { nome: 'microfrontends', pontos: (n >= 8 ? 3 : 0) + (f('dominiosIndependentes') ? 2 : 0) + (f('deployIndependente') ? 2 : 0) + (f('plataforma') ? 2 : -4) + (f('migracaoGradual') ? 1 : 0) }
  ].sort((a, b) => b.pontos - a.pontos || (a.nome < b.nome ? -1 : 1));
  return { recomendada: ranking[0].nome, ranking };
}
`, explanation: 'A pontuação ponderada torna os critérios explícitos e mostra por que microfrontends só lideram com muitas equipes, domínios independentes, deploy independente e plataforma.' }
]
};

const P = 'arquitetura-frontend-p';
export const assessment = {
  id: 'arquitetura-frontend', title: 'Avaliação final — Arquitetura frontend, monorepos e microfrontends', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a prática à regra de arquitetura que ela garante.', pairs: [['Cada feature exporta um index.js e os demais arquivos são internos', 'API pública e encapsulamento'], ['shared não importa de features', 'Dependências sempre para as camadas inferiores'], ['dependency-cruiser na CI', 'Regras verificadas automaticamente'], ['Lista de exceções que só diminui', 'Migração gradual da dívida arquitetural']], explanation: 'Regras explícitas e executáveis mantêm a arquitetura.' },
    { id: P + '2', type: 'mc', difficulty: 2, points: 10, prompt: 'No laboratório com Turborepo (utils ← ui ← web; utils ← admin), o que ocorreu ao mudar apenas packages/ui?', options: ['Todos os 4 pacotes foram reconstruídos', 'Ficaram em cache utils e admin; ui e web foram reconstruídos', 'Nada foi reconstruído', 'Só o admin foi reconstruído'], answer: 1, explanation: 'Mudar uma folha invalida só ela e seus dependentes (medido: 2 em cache, 4,6 s).' },
    { id: P + '3', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido no laboratório, executar o build novamente sem mudanças no monorepo levou 90 ms graças ao cache de tarefas (FULL TURBO).', answer: true, explanation: 'O build frio levou 6,9 s; o repetido restaurou as saídas do cache em 90 ms.' },
    { id: P + '4', type: 'bug', difficulty: 3, points: 10, prompt: 'Após publicar o remote com React 19, o host (que declara ^18) quebra. Clique na linha cuja configuração exige a negociação correta de versão.', code: 'federation({\n  name: "host",\n  remotes: { carrinho: { type: "module", name: "carrinho", entry: urlDoCarrinho } },\n  shared: { react: { singleton: true, requiredVersion: "^18.0.0" } }\n})', answer: 4, explanation: 'A faixa ^18.0.0 não tem intersecção com a do remote (^19): a dependência singleton entra em conflito. Atualize as faixas de forma coordenada (e valide no pipeline).' },
    { id: P + '5', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do dependency-cruiser e do Module Federation no laboratório.', code: 'violações no mini projeto (ciclo, shared->features, interno de outra feature): ?\nbotão do remote carregado pelo host, antes e depois do clique: "remoto ?" -> "remoto ?"', lang: 'text', steps: [{ q: 'Número de violações apontadas:', answers: ['3'] }, { q: 'Valor antes do clique:', answers: ['0'] }, { q: 'Valor depois do clique:', answers: ['1'] }], explanation: 'O dependency-cruiser apontou 3 violações; o remote renderizou "remoto 0" e "remoto 1" após o clique.' },
    { id: P + '6', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a regra de dependência entre tarefas e a recepção do evento com limpeza.', code: '"build": { "dependsOn": ["[[0]]build"] }\nuseEffect(() => { window.addEventListener("x", f); return () => window.[[1]]("x", f); }, []);', answers: [['^'], ['removeEventListener']], explanation: '^build executa antes o build das dependências; a limpeza remove o mesmo ouvinte.' },
    { id: P + '7', type: 'mc', difficulty: 3, points: 10, prompt: 'DECISÃO — Uma empresa tem duas equipes, um produto coeso e a CI de 35 minutos. Qual é a primeira medida mais adequada?', options: ['Migrar para microfrontends', 'Adotar monorepo com cache de tarefas e execução apenas dos afetados e organizar o código em um monólito modular com regras de fronteira', 'Dividir o frontend em cinco repositórios', 'Reescrever em outro framework'], answer: 1, explanation: 'O gargalo medido é a CI lenta e o acoplamento; o cache, os afetados e as fronteiras atacam isso sem o custo dos microfrontends.' },
    { id: P + '8', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade de comunicação ao mecanismo.', pairs: [['Qual item está aberto, compartilhável por link', 'URL'], ['Avisar mudanças sem conhecer os ouvintes', 'Evento com contrato versionado'], ['Fornecer o usuário autenticado', 'Props ou contexto mínimo do shell'], ['Sincronizar o logout entre abas', 'BroadcastChannel']], explanation: 'Quanto menor o acoplamento, melhor.' },
    { id: P + '9', type: 'tf', difficulty: 2, points: 10, prompt: 'Para mudar o tipo de um campo de um evento entre microfrontends sem quebrar consumidores, basta alterar o emissor e avisar a equipe por mensagem.', answer: false, explanation: 'É uma mudança incompatível: exige nova versão, convivência (emitir v1 e v2), depreciação com data e testes de contrato.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'DECISÃO — Uma empresa com dez equipes, domínios de negócio bem separados, necessidade de deploy independente e uma equipe de plataforma dedicada. O que é mais coerente?', options: ['Monólito único sem fronteiras', 'Considerar microfrontends por domínio, com shell fino, design system compartilhado, contratos versionados, orçamento de JavaScript e ADR com critérios de sucesso', 'Cada equipe com seu framework e sem padrões', 'Estado global compartilhado entre todas as partes'], answer: 1, explanation: 'Os sinais combinados (muitas equipes, domínios, deploy independente e plataforma) justificam microfrontends, com governança.' },
    { id: P + '11', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual prática de migração reduz o risco ao sair de um legado para uma nova arquitetura?', options: ['Reescrever tudo e trocar em um único dia', 'Strangler fig: rotear fatia por fatia para a aplicação nova, com feature flag e possibilidade de voltar ao legado', 'Congelar o legado por um ano', 'Duplicar o legado sem medir nada'], answer: 1, explanation: 'Migrar por fatias, com reversibilidade e métricas, reduz o risco.' },
    { id: P + '12', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que a decisão entre monólito modular e microfrontends deve ser registrada em um ADR e cite quatro seções que ele deve ter.', model: 'A decisão afeta várias equipes por anos e seus motivos se perdem com a rotatividade; o ADR registra o contexto e os critérios, evita discussões repetidas, apoia o onboarding e permite revisar a decisão quando a organização mudar. Deve ter: contexto com dados (equipes, gargalos medidos), a decisão tomada, as alternativas consideradas e por que foram descartadas, as consequências positivas e negativas, critérios de sucesso mensuráveis e uma data ou condição de revisão (além do status).', rubric: ['Explica o valor do registro (memória, onboarding, revisão)', 'Cita contexto e decisão', 'Cita alternativas e consequências', 'Cita critérios de sucesso ou revisão'], explanation: 'Decisões documentadas e revisáveis evitam retrabalho e dependência de memória.' }
  ]
};

export const project = {
  id: 'monorepo-dois-apps', name: 'Monorepo com dois aplicativos e dois pacotes, regras de fronteira e um ADR que decide entre monólito modular e microfrontends', lv: 'A', stack: 'npm ou pnpm workspaces, Turborepo (ou Nx), React, dependency-cruiser e Vite com Module Federation (opcional)', ds: ['fe-arch', 'react'],
  desc: 'Monte um **monorepo** com **dois aplicativos** (por exemplo, loja e painel administrativo) e **dois pacotes compartilhados** (um **design system** e um pacote de **utilidades e contratos**), com **workspaces**, **Turborepo** (cache e tarefas afetadas), **regras de fronteira** automatizadas (dependency-cruiser ou lint), **observabilidade e erros padronizados** e uma **pequena integração em tempo de execução** (um remote carregado pelo host com Module Federation). Para um **cenário dado** (descrito no relatório), escreva um **ADR** que decide, com critérios ponderados e dados medidos, entre **monólito modular** e **microfrontends**.',
  rf: ['Monorepo com apps/loja, apps/painel, packages/ui e packages/contratos, workspaces e turbo.json com build, test e lint e dependsOn correto', 'Medição do cache: build frio, build repetido e build depois de mudar um pacote base e um pacote folha (tempos e pacotes em cache registrados)', 'Execução apenas dos projetos afetados por uma mudança (filter ou affected) e o plano de execução registrado', 'Organização por funcionalidade nos aplicativos, com camadas, API pública por feature e regras verificadas por dependency-cruiser (sem ciclos, shared sem features, API pública) na CI', 'Pacote de contratos com esquemas validados em tempo de execução, modelo de erros padronizado e redação de campos sensíveis nos logs', 'Um remote (por exemplo, um widget de avisos) exposto com Module Federation e carregado pelo host com fronteira de erro, fallback e shared singleton para React', 'Barramento ou eventos com contrato (nome, esquema, versão) entre o host e o remote, com testes de contrato', 'ADR com contexto e dados medidos, alternativas, pontuação ponderada, decisão, consequências, critérios de sucesso e data de revisão para o cenário dado'],
  rnf: ['Dependências declaradas em cada pacote e API pública via exports', 'Nenhum ciclo entre pacotes nem importação de internals entre features', 'TypeScript estrito e esquemas validados nas fronteiras', 'Logs sem dados sensíveis e erros com código estável', 'Orçamento de JavaScript por aplicativo verificado na CI', 'README com comandos, o grafo de pacotes, as regras e o que não foi testado'],
  ac: ['A segunda execução do build sem mudanças restaura 100% das tarefas do cache e o relatório mostra os tempos', 'Mudar o pacote base reconstrói todos os dependentes e mudar uma folha reconstrói apenas ela e seus dependentes (registrados com números)', 'A CI falha quando se introduz um ciclo ou uma importação do interior de outra feature (demonstrado por um commit)', 'O host carrega o remote em um navegador real, o remote é implantado de forma independente e há fallback quando ele está fora do ar', 'Um teste de contrato falha quando o emissor remove um campo do evento sem criar nova versão', 'O ADR cita pelo menos duas alternativas simples avaliadas antes dos microfrontends e mostra a pontuação ponderada', 'O relatório lista com honestidade o que foi e o que não foi medido (por exemplo, cache remoto, Nx, conflito de versões)'],
  ch: ['Adicionar cache remoto ao Turborepo e medir a CI', 'Repetir a configuração com Nx e comparar o grafo, as fronteiras por tags e os afetados', 'Testar o conflito de versões de React entre host e remote e registrar o comportamento', 'Extrair uma feature como aplicação separada por rota (multi-zonas) e comparar com o remote', 'Extensão: migrar uma tela do legado com strangler fig e feature flag, com métricas antes e depois']
};
