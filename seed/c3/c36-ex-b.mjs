// C3.6 — ORMs: Prisma e TypeORM: exercícios das aulas 4 a 6, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'orm-04': [
  { id: 'orm-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que synchronize: true é perigoso em produção?', options: ['Deixa o banco mais lento', 'Ajusta o banco às entidades e pode remover colunas e dados que não estão mais nas entidades', 'Impede conexões simultâneas', 'Só funciona com MySQL'], answer: 1, explanation: 'Medido: com a entidade sem o campo email, o plano incluiria DROP COLUMN "email".' },
  { id: 'orm-04-e2', type: 'trace', difficulty: 3, points: 10, prompt: 'TypeORM com 100 clientes e 500 pedidos (medido).', code: 'N+1 em laço                         → ? consultas\nfind({ relations })  (join, padrão)  → ? consulta(s)\ntake/skip com relations              → ? consultas', lang: 'text', steps: [{ q: 'Quantas consultas no N+1 em laço?', answers: ['101'] }, { q: 'Quantas consultas com relations em join?', answers: ['1'] }, { q: 'Quantas com take/skip e relations?', answers: ['2'] }], explanation: 'O take/skip com join precisa de uma consulta DISTINCT dos ids da página e outra com os dados.' },
  { id: 'orm-04-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'No TypeORM, a violação de unicidade chega como QueryFailedError com driverError.code igual a 23505 no PostgreSQL.', answer: true, explanation: 'Medido: QueryFailedError, código 23505 (e 23503 para chave estrangeira).' },
  { id: 'orm-04-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que deixa a gravação fora da transação.', code: 'await ds.transaction(async (manager) => {\n  await manager.getRepository("Cliente").insert({ nome: "A", email: "a@x" });\n  await ds.getRepository("Pedido").insert({ cliente: { id: 1 } });\n  throw new Error("falha");\n});', answer: 3, explanation: 'O ds.getRepository usa a conexão global, fora da transação: o pedido seria gravado mesmo com o rollback. Use manager.getRepository.' },
  { id: 'orm-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva uma estratégia segura de migrações com TypeORM para um sistema em produção, comparando com o synchronize.', model: 'Desligar o synchronize em produção e adotar migrações versionadas: gerar com migration:generate a partir da diferença entre entidades e banco, revisar cada arquivo (especialmente comandos destrutivos como DROP COLUMN e ALTER TYPE), testá-lo em uma cópia do banco com volume realista, versioná-lo no repositório e aplicá-lo no deploy com migration:run (ou migrationsRun), com plano de reversão (down) e, quando necessário, o padrão expandir e contrair. O synchronize pode ficar apenas em testes automatizados com bancos descartáveis. O resultado medido (DROP COLUMN "email") mostra o risco de deixá-lo ligado.', rubric: ['Desliga o synchronize em produção', 'Descreve gerar, revisar e aplicar migrações versionadas', 'Cita testar em cópia e ter reversão', 'Cita o risco medido ou o uso aceitável em testes'], explanation: 'Migrações são o caminho para mudanças de esquema controladas.' },
  { id: 'orm-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o **número de consultas** e o **tamanho do resultado**. Implemente §consultasEsperadas(config)§ com §config§ = §{ estrategia, n, relacoes }§ (§relacoes§ padrão 1): §"laco"§ → §1 + n * relacoes§; §"join"§ → §1§; §"query"§ → §1 + relacoes§; §"paginado-com-relacoes"§ → §2§. Estratégia desconhecida lança §Error("estratégia desconhecida: E")§. E §linhasDoJoin(filhosPorPai)§: recebe a lista com o número de filhos de cada pai e devolve o número de linhas de um **LEFT JOIN** (cada pai ocupa ao menos 1 linha: §max(1, filhos)§).', lang: 'javascript', starter: 'function consultasEsperadas(config) {\n  // seu código aqui\n}\nfunction linhasDoJoin(filhosPorPai) {\n}\n', hints: ['Um switch cobre as estratégias.', 'Use reduce com Math.max(1, filhos).'], tests: [{ name: 'consultas', code: R`assert.equal(consultasEsperadas({ estrategia: 'laco', n: 100 }), 101);
assert.equal(consultasEsperadas({ estrategia: 'join', n: 100 }), 1);
assert.equal(consultasEsperadas({ estrategia: 'query', n: 100, relacoes: 1 }), 2);
assert.equal(consultasEsperadas({ estrategia: 'query', n: 100, relacoes: 3 }), 4);
assert.equal(consultasEsperadas({ estrategia: 'laco', n: 100, relacoes: 2 }), 201);
assert.equal(consultasEsperadas({ estrategia: 'paginado-com-relacoes', n: 10 }), 2);
assert.throws(() => consultasEsperadas({ estrategia: 'preguica', n: 1 }), 'estratégia desconhecida: preguica');` }, { name: 'linhas do join', code: R`assert.equal(linhasDoJoin(Array(100).fill(5)), 500);
assert.equal(linhasDoJoin([5, 5, 0]), 11);
assert.equal(linhasDoJoin([]), 0);
assert.equal(linhasDoJoin([0, 0, 0]), 3);` }], solution: R`function consultasEsperadas(config) {
  const { estrategia, n, relacoes = 1 } = config;
  switch (estrategia) {
    case 'laco': return 1 + n * relacoes;
    case 'join': return 1;
    case 'query': return 1 + relacoes;
    case 'paginado-com-relacoes': return 2;
    default: throw new Error('estratégia desconhecida: ' + estrategia);
  }
}
function linhasDoJoin(filhosPorPai) {
  return filhosPorPai.reduce((soma, f) => soma + Math.max(1, f), 0);
}
`, explanation: 'O modelo reproduz as contagens medidas (101, 1, 2, 4 e 2). A explosão de linhas do join (500 linhas para 100 clientes) explica por que a estratégia de consultas separadas às vezes vence em relações profundas.' }
],
'orm-05': [
  { id: 'orm-05-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Como se caracteriza o problema N+1?', options: ['Uma consulta lenta em uma tabela grande', '1 consulta para a lista e N consultas, uma por item, para suas relações', 'N transações abertas ao mesmo tempo', 'Um índice duplicado'], answer: 1, explanation: 'Medido: 101 consultas para 100 clientes.' },
  { id: 'orm-05-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Uma única consulta com join de vários níveis é sempre mais rápida do que várias consultas pequenas e indexadas.', answer: false, explanation: 'Medido no Prisma: 1 consulta com join de 4 níveis levou ~142 ms; 4 consultas, ~61 ms.' },
  { id: 'orm-05-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Leitura de totais por cliente (100 clientes).', code: 'include aninhado e soma em JavaScript  →  ~94 ms\n_count / SQL agregado                  →  ~7 a 8 ms', lang: 'text', steps: [{ q: 'Aproximadamente quantas vezes o agregado no banco é mais rápido (arredonde para o inteiro mais próximo de 94/7,4)?', answers: ['13', '12', '12x', '13x'] }, { q: 'Onde o trabalho é feito na versão rápida (banco ou JavaScript)?', answers: ['banco', 'no banco'] }], explanation: 'A diferença não é "ORM x SQL": é agregar no banco ou trazer tudo para o JavaScript.' },
  { id: 'orm-05-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que gera o N+1.', code: 'const clientes = await prisma.cliente.findMany();\nconst resultado = await Promise.all(\n  clientes.map((c) => prisma.pedido.findMany({ where: { clienteId: c.id } }))\n);', answer: 3, explanation: 'Uma consulta por cliente dentro do map: 1 + N consultas, mesmo em paralelo.' },
  { id: 'orm-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Sua API passou a demorar 3 s em uma listagem. Descreva, em passos, como você investigaria se é N+1 e como provaria a correção.', model: 'Ativar o log de consultas (Prisma: log em evento; TypeORM: logging de query) e contar quantas consultas a requisição executa e se há o mesmo padrão de SQL repetido com ids diferentes; medir o tempo por consulta e total; reproduzir com dados em volume realista. Corrigir carregando as relações em lote (include, relations, IN), agregando no banco quando só se precisa de contagens e selecionando só os campos necessários, e conferir os índices nas chaves estrangeiras. Provar com um teste que afirma o número máximo de consultas e com a medição de tempo antes e depois, e comparar estratégias de carga (join x consultas separadas) com os dados reais.', rubric: ['Usa log e contagem de consultas', 'Reconhece o padrão repetido com parâmetros diferentes', 'Propõe carregar em lote, agregar e selecionar menos', 'Prova com teste de contagem e medição'], explanation: 'Detectar, corrigir e proteger.' },
  { id: 'orm-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §detectarNPlusUm(consultas, limiar)§: §consultas§ é a lista de textos SQL executados. **Normalize** cada texto: tudo em minúsculas, literais de texto entre aspas simples viram §?§, números inteiros ou decimais viram §?§, marcadores §$1§, §$2§... viram §?§, e espaços repetidos viram um só (com §trim§). Conte quantas vezes cada texto normalizado aparece e devolva, **só os que aparecem pelo menos §limiar§ vezes**, a lista §{ padrao, vezes }§ ordenada por §vezes§ decrescente e, em empate, pelo texto. Observação: números dentro de nomes entre aspas duplas também viram §?§ (simplificação).', lang: 'javascript', starter: 'function detectarNPlusUm(consultas, limiar) {\n  // seu código aqui\n}\n', hints: ['Encadeie replace com expressões regulares na ordem: aspas simples, marcadores $n, números.', 'Use um Map para contar.'], tests: [{ name: 'detecta o padrão repetido', code: R`const q = ['SELECT * FROM "Cliente"'];
for (let i = 1; i <= 100; i++) q.push('SELECT * FROM "Pedido" WHERE "clienteId" = ' + i);
const r = detectarNPlusUm(q, 10);
assert.deepEqual(r, [{ padrao: 'select * from "pedido" where "clienteid" = ?', vezes: 100 }]);` }, { name: 'literais e marcadores', code: R`const q = ["SELECT id FROM t WHERE nome = 'ana'", "SELECT  id FROM t WHERE nome = 'bruno'", 'select id from t where nome = $1', 'SELECT id FROM t WHERE nome = $2', 'UPDATE t SET x = 1.5'];
const r = detectarNPlusUm(q, 2);
assert.deepEqual(r, [{ padrao: 'select id from t where nome = ?', vezes: 4 }]);` }, { name: 'ordenação e limiar', code: R`const q = ['SELECT a FROM x WHERE id = 1', 'SELECT a FROM x WHERE id = 2', 'SELECT b FROM y WHERE id = 3', 'SELECT b FROM y WHERE id = 4', 'SELECT b FROM y WHERE id = 5'];
assert.deepEqual(detectarNPlusUm(q, 2), [{ padrao: 'select b from y where id = ?', vezes: 3 }, { padrao: 'select a from x where id = ?', vezes: 2 }]);
assert.deepEqual(detectarNPlusUm(q, 4), []);` }], solution: R`function detectarNPlusUm(consultas, limiar) {
  const normalizar = (s) => s.toLowerCase()
    .replace(/'[^']*'/g, '?')
    .replace(/\$\d+/g, '?')
    .replace(/\b\d+(\.\d+)?\b/g, '?')
    .replace(/\s+/g, ' ')
    .trim();
  const contagem = new Map();
  for (const c of consultas) {
    const p = normalizar(c);
    contagem.set(p, (contagem.get(p) || 0) + 1);
  }
  return [...contagem.entries()]
    .filter(([, vezes]) => vezes >= limiar)
    .map(([padrao, vezes]) => ({ padrao, vezes }))
    .sort((a, b) => b.vezes - a.vezes || (a.padrao < b.padrao ? -1 : 1));
}
`, explanation: 'O rastro do N+1 é o mesmo SQL repetido com parâmetros diferentes. Normalizar literais e números e contar padrões é a base de ferramentas como o pg_stat_statements.' },
  { id: 'orm-05-e7', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarMonitor(limite)§, um contador de consultas **por requisição**. Devolve §{ registrar, relatorio }§. §registrar(requisicaoId, sql)§ conta uma consulta para a requisição. §relatorio()§ devolve a lista das requisições com **mais de §limite§** consultas, como §{ requisicaoId, consultas }§, ordenada por §consultas§ decrescente (empate: pelo id, ordem alfabética). Requisições dentro do limite não aparecem.', lang: 'javascript', starter: 'function criarMonitor(limite) {\n  // seu código aqui\n}\n', hints: ['Um Map de requisicaoId para contagem.', 'Filtre com contagem > limite.'], tests: [{ name: 'relatório', code: R`const m = criarMonitor(3);
for (let i = 0; i < 101; i++) m.registrar('GET /clientes', 'SELECT ...');
for (let i = 0; i < 3; i++) m.registrar('GET /pedidos/1', 'SELECT ...');
for (let i = 0; i < 4; i++) m.registrar('GET /produtos', 'SELECT ...');
assert.deepEqual(m.relatorio(), [{ requisicaoId: 'GET /clientes', consultas: 101 }, { requisicaoId: 'GET /produtos', consultas: 4 }]);` }, { name: 'empate e vazio', code: R`const m = criarMonitor(1);
assert.deepEqual(m.relatorio(), []);
['b', 'b', 'a', 'a'].forEach((id) => m.registrar(id, 'x'));
assert.deepEqual(m.relatorio(), [{ requisicaoId: 'a', consultas: 2 }, { requisicaoId: 'b', consultas: 2 }]);` }], solution: R`function criarMonitor(limite) {
  const contagem = new Map();
  return {
    registrar(requisicaoId) { contagem.set(requisicaoId, (contagem.get(requisicaoId) || 0) + 1); },
    relatorio() {
      return [...contagem.entries()]
        .filter(([, n]) => n > limite)
        .map(([requisicaoId, consultas]) => ({ requisicaoId, consultas }))
        .sort((a, b) => b.consultas - a.consultas || (a.requisicaoId < b.requisicaoId ? -1 : 1));
    }
  };
}
`, explanation: 'Um contador por requisição, com alerta acima de um limite, transforma o N+1 em métrica observável em produção.' }
],
'orm-06': [
  { id: 'orm-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual abordagem é mais adequada para um relatório com funções de janela e CTE?', options: ['findMany com include aninhado e cálculos em JavaScript', 'SQL cru parametrizado, encapsulado em um repositório e testado', 'synchronize', 'Aumentar o pool'], answer: 1, explanation: 'Consultas analíticas complexas são o caso típico para SQL cru.' },
  { id: 'orm-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Para inserir 100 mil linhas, a abordagem mais eficiente é um laço de create, um por linha, no ORM.', answer: false, explanation: 'Medido (1.000 linhas): laço ~3,1 s, createMany ~217 ms, unnest ~37 ms. Para cargas grandes use lotes ou COPY.' },
  { id: 'orm-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o caso ao melhor caminho.', pairs: [['CRUD simples de cadastro', 'ORM'], ['Relatório com janelas e CTEs', 'SQL cru parametrizado'], ['Carga de 1 milhão de linhas', 'COPY ou lotes com unnest'], ['Totais por cliente', 'Agregação no banco (_count, groupBy ou SQL)']], explanation: 'A decisão é por caso de uso.' },
  { id: 'orm-06-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a inserção em lote com arrays como parâmetros.', code: 'INSERT INTO "Cliente" (nome, email)\nSELECT * FROM [[0]]($1::text[], $2::text[]);', answers: [['unnest']], explanation: 'unnest transforma os arrays em linhas (medido: ~37 ms para 1.000 linhas).' },
  { id: 'orm-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Defina uma política de equipe "ORM ou SQL" com cinco regras objetivas, incluindo testes, segurança e migrações.', model: 'Regras: (1) CRUD e relações simples usam o ORM; (2) relatórios, janelas, CTEs, recursão e caminhos de desempenho crítico usam SQL cru parametrizado dentro de repositórios, com tipos declarados; (3) nunca se concatena entrada do usuário (templates parametrizados ou parâmetros posicionais; identificadores por lista de permissão); (4) cargas e inserções em massa usam lotes (createMany, unnest ou COPY); (5) as migrações têm uma única ferramenta e fonte da verdade, com SQL revisado e sem synchronize em produção; (6) os repositórios têm testes de integração contra banco real e testes de contagem de consultas com dados realistas; (7) toda exceção à política é registrada em um ADR com a medição.', rubric: ['Define quando usar ORM e quando SQL', 'Inclui regra de segurança contra injeção', 'Inclui regra de migração única e revisada', 'Inclui testes e medição como critérios'], explanation: 'Políticas objetivas evitam discussões por dogma.' },
  { id: 'orm-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §escolherAbordagem(caso)§ com §caso§ = §{ operacao, registros, usaRecursoEspecifico }§. §operacao§: §"crud"§ → §"orm"§; §"relatorio"§ → §"sql-cru"§ se §usaRecursoEspecifico§ (janela, CTE, recursão), senão §"orm-agregacao"§; §"carga"§ → §"orm"§ se §registros <= 10§, §"orm-em-lote"§ se §registros <= 10000§, senão §"sql-copy"§. Operação desconhecida lança §Error("operação inválida: X")§. E §custoDoLaco(nConsultas, msPorConsulta, msPorLote)§: devolve §{ laco, lote, vezes }§ onde §laco = nConsultas * msPorConsulta§, §lote = msPorLote§ e §vezes§ é §laco / lote§ **arredondado para o inteiro mais próximo**.', lang: 'javascript', starter: 'function escolherAbordagem(caso) {\n  // seu código aqui\n}\nfunction custoDoLaco(nConsultas, msPorConsulta, msPorLote) {\n}\n', hints: ['Use um switch na operação.', 'Math.round para a razão.'], tests: [{ name: 'escolha', code: R`assert.equal(escolherAbordagem({ operacao: 'crud' }), 'orm');
assert.equal(escolherAbordagem({ operacao: 'relatorio', usaRecursoEspecifico: true }), 'sql-cru');
assert.equal(escolherAbordagem({ operacao: 'relatorio', usaRecursoEspecifico: false }), 'orm-agregacao');
assert.equal(escolherAbordagem({ operacao: 'carga', registros: 5 }), 'orm');
assert.equal(escolherAbordagem({ operacao: 'carga', registros: 1000 }), 'orm-em-lote');
assert.equal(escolherAbordagem({ operacao: 'carga', registros: 10000 }), 'orm-em-lote');
assert.equal(escolherAbordagem({ operacao: 'carga', registros: 10001 }), 'sql-copy');
assert.throws(() => escolherAbordagem({ operacao: 'magica' }), 'operação inválida: magica');` }, { name: 'custo', code: R`assert.deepEqual(custoDoLaco(1000, 3.141, 217), { laco: 3141, lote: 217, vezes: 14 });
assert.deepEqual(custoDoLaco(100, 2.25, 15), { laco: 225, lote: 15, vezes: 15 });
assert.deepEqual(custoDoLaco(10, 1, 100), { laco: 10, lote: 100, vezes: 0 });` }], solution: R`function escolherAbordagem(caso) {
  switch (caso.operacao) {
    case 'crud': return 'orm';
    case 'relatorio': return caso.usaRecursoEspecifico ? 'sql-cru' : 'orm-agregacao';
    case 'carga':
      if (caso.registros <= 10) return 'orm';
      if (caso.registros <= 10000) return 'orm-em-lote';
      return 'sql-copy';
    default: throw new Error('operação inválida: ' + caso.operacao);
  }
}
function custoDoLaco(nConsultas, msPorConsulta, msPorLote) {
  const laco = nConsultas * msPorConsulta;
  return { laco, lote: msPorLote, vezes: Math.round(laco / msPorLote) };
}
`, explanation: 'A política vira uma função testável e a razão laço/lote mostra, com os números do curso (3.141 ms contra 217 ms), por que o lote é obrigatório em cargas.' }
]
};

const P = 'orms-node-p';
export const assessment = {
  id: 'orms-node', title: 'Avaliação final — ORMs: Prisma e TypeORM', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'No Prisma 7, qual comando gera o cliente tipado a partir do esquema?', options: ['prisma migrate dev', 'prisma generate', 'prisma validate', 'prisma db push'], answer: 1, explanation: 'Medido: a pasta generated só existiu depois de prisma generate.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'O Prisma cria automaticamente um índice nas colunas de chave estrangeira em PostgreSQL.', answer: false, explanation: 'O índice existiu porque declaramos @@index([clienteId]).' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Listar 100 clientes e seus pedidos (500) no Prisma.', code: 'A: findMany() + findMany por cliente em laço\nB: findMany({ include: { pedidos: true } }) com join\nC: groupBy pedido por clienteId (contagens)', lang: 'text', steps: [{ q: 'Quantas consultas faz A?', answers: ['101'] }, { q: 'Quantas faz B?', answers: ['1'] }, { q: 'Qual abordagem usar se só preciso das contagens por cliente?', answers: ['C', 'c', 'groupBy'] }], explanation: 'A é o N+1; B carrega as relações; C agrega no banco.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual implementação de uma busca por nome é segura contra injeção de SQL no Prisma?', options: ['$queryRawUnsafe("... WHERE nome = \'" + nome + "\'")', '$queryRaw com template: ... WHERE nome = ${nome}', '$queryRawUnsafe com template interpolado em texto comum', 'Concatenar com replace de aspas'], answer: 1, explanation: 'Medido: o template parametrizado devolveu 0 linhas para a entrada maliciosa; a concatenação, 100.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que deixa de fazer parte da transação.', code: 'await prisma.$transaction(async (tx) => {\n  await tx.pedido.create({ data: { clienteId: 1 } });\n  await prisma.cliente.update({ where: { id: 1 }, data: { nome: "x" } });\n});', answer: 3, explanation: 'Usar prisma em vez de tx executa fora da transação.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a paginação por cursor.', code: 'await prisma.pedido.findMany({ orderBy: { id: "asc" }, [[0]]: { id: 401 }, [[1]]: 20 });', answers: [['cursor'], ['take']], explanation: 'cursor define o ponto de partida e take o tamanho da página.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o código à situação.', pairs: [['P2002', 'Violação de unicidade'], ['P2003', 'Violação de chave estrangeira'], ['P2025', 'Registro não encontrado'], ['23505 (QueryFailedError)', 'Violação de unicidade no TypeORM com PostgreSQL']], explanation: 'Medidos nos experimentos.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual risco o synchronize: true representa em produção?', options: ['Aumenta o tempo de conexão', 'Pode apagar colunas e dados ao alinhar o banco às entidades', 'Desativa as transações', 'Impede relações'], answer: 1, explanation: 'Medido: DROP COLUMN "email" ao remover o campo da entidade.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Uma única consulta com join de vários níveis é sempre mais rápida do que consultas separadas; por isso o relationLoadStrategy join deve ser sempre usado.', answer: false, explanation: 'Medido: join de 4 níveis ~142 ms; 4 consultas ~61 ms. Meça com seus dados.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Para importar 50 mil linhas de um arquivo, qual abordagem é a mais adequada?', options: ['Um create por linha em laço', 'createMany em lotes ou SQL com unnest/COPY', 'Uma transação interativa por linha', 'Um include por linha'], answer: 1, explanation: 'Medido (1.000 linhas): laço ~3,1 s; createMany ~217 ms; unnest ~37 ms.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Explique, com suas palavras, o que é o N+1, como detectá-lo em uma API Node.js e como corrigi-lo, citando números medidos no curso.', model: 'O N+1 ocorre quando o código faz uma consulta para a lista e uma consulta adicional por item para suas relações, normalmente em um laço. Medido: 100 clientes geraram 101 consultas (~225 ms no Prisma, ~241 ms no TypeORM), enquanto carregar a relação em lote levou 1 a 2 consultas (~12 a 18 ms). Detecta-se com o log de consultas, contando-as por requisição e observando o mesmo SQL repetido com ids diferentes, e com testes que afirmam um máximo de consultas com dados em volume realista. Corrige-se carregando as relações em lote (include, relations, IN), agregando no banco (groupBy, _count), selecionando só os campos necessários e conferindo os índices; e se mede, pois o join profundo (~142 ms) foi mais lento que 4 consultas (~61 ms).', rubric: ['Define o N+1 corretamente', 'Cita números medidos', 'Descreve a detecção por log, contagem ou teste', 'Descreve a correção e a necessidade de medir'], explanation: 'Resposta central da aula orm-05.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual política é a mais coerente para uma API Node.js com relatórios analíticos e CRUD?', options: ['Só ORM, inclusive para relatórios, somando em JavaScript', 'Só SQL cru em todo o código', 'ORM para o CRUD e SQL cru parametrizado, testado e encapsulado em repositórios para relatórios e cargas, tudo medido', 'Trocar de ORM a cada projeto'], answer: 2, explanation: 'A abordagem híbrida combina produtividade e desempenho com controle.' }
  ]
};

export const project = {
  id: 'api-catalogo-orm', name: 'API de catálogo com Prisma e SQL cru: migrações, relatórios, transações, N+1 medido e ADR', lv: 'M', stack: 'Node.js, TypeScript, PostgreSQL 17, Prisma 7 (opcional: TypeORM), Vitest', ds: ['orm'],
  desc: 'Construa uma **API de catálogo** (produtos, categorias, clientes e pedidos) em Node.js e PostgreSQL, usando o **Prisma** para o CRUD e **SQL cru parametrizado** para relatórios, com migrações, tratamento de erros, transações, **paginação por cursor**, **testes de integração** e um **teste de contagem de consultas**. Meça a **leitura** e a **escrita** com laço, lote e SQL, compare as **estratégias de carga de relações** e registre as decisões em um **ADR**.',
  rf: ['Esquema Prisma com índices nas chaves estrangeiras, ações referenciais justificadas e a migração inicial revisada', 'CRUD de produtos, categorias, clientes e pedidos com o Prisma, com select enxuto e DTOs de resposta', 'Três relatórios em SQL cru parametrizado (ranking com janela, receita por categoria com CTE e agregação por mês), encapsulados em repositórios com tipos de retorno', 'Paginação por cursor nas listagens e comparação medida com skip/take', 'Tratamento de erros P2002, P2003 e P2025 como respostas HTTP e repetição de 40001/40P01 nas transações de pedido', 'Importação em massa de produtos por createMany e por SQL com unnest, com medição', 'Teste que afirma o número máximo de consultas de uma listagem com volume realista', 'ADR com a decisão ORM ou SQL cru para cada caso de uso e o resultado das medições'],
  rnf: ['Versões fixas das dependências e do banco registradas', 'Nenhuma concatenação de entrada do usuário em SQL e uso de lista de permissão para ordenação', 'Migrações versionadas e sem db push ou synchronize em produção', 'Pool de conexões configurado e uma única instância do cliente', 'README com instruções, números medidos e limitações'],
  ac: ['A listagem de pedidos com clientes executa no máximo 3 consultas para 100 clientes e 500 pedidos', 'Um teste prova que a entrada maliciosa não altera o resultado das buscas', 'A medição mostra o ganho do lote sobre o laço e o do agregado no banco sobre o JavaScript', 'Os relatórios em SQL cru são cobertos por testes com dados conhecidos', 'O ADR justifica cada escolha com dados medidos'],
  ch: ['Implementar o mesmo módulo de produtos em TypeORM e comparar o SQL gerado e as medições', 'Adicionar segurança por linha (RLS) e testar o isolamento entre clientes', 'Avaliar um construtor tipado (Kysely ou Drizzle) para os relatórios', 'Habilitar pg_stat_statements e priorizar as consultas por tempo total', 'Planejar uma migração com expandir e contrair para renomear uma coluna sem parada']
};
