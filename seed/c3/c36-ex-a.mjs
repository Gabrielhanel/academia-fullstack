// C3.6 — ORMs: Prisma e TypeORM: exercícios das aulas 1 a 3.
// Os experimentos reais rodaram em Prisma 7.10.1, TypeORM 1.1.3 e PostgreSQL 17.12 (laboratório); os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsetsA = {
'orm-01': [
  { id: 'orm-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual padrão descreve um objeto que sabe se salvar e se carregar (por exemplo, usuario.save())?', options: ['Data Mapper', 'Active Record', 'Query builder', 'Repository'], answer: 1, explanation: 'No Active Record, a entidade carrega os métodos de persistência; no Data Mapper, um mapeador separado faz isso.' },
  { id: 'orm-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Usar um ORM dispensa conhecer SQL, pois ele gera consultas eficientes automaticamente.', answer: false, explanation: 'Medido: o N+1 gerou 101 consultas (~225 ms). É preciso ler o SQL gerado, medir e conhecer índices.' },
  { id: 'orm-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a ferramenta ao estilo.', pairs: [['Prisma', 'Esquema declarativo e cliente tipado gerado'], ['TypeORM com repositórios', 'Data Mapper com entidades e QueryBuilder'], ['Knex e Kysely', 'Construtores de consultas (query builders)'], ['node-postgres (pg)', 'Driver: SQL puro com parâmetros']], explanation: 'Do mais abstrato ao mais próximo do SQL.' },
  { id: 'orm-01-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Medições do curso para 1.000 inserções de clientes.', code: 'Prisma create em laço:   3141 ms\nPrisma createMany:         217 ms\npg INSERT ... unnest:       37 ms', lang: 'text', steps: [{ q: 'Qual é a abordagem mais rápida?', answers: ['unnest', 'pg unnest', 'INSERT unnest'] }, { q: 'O laço é aproximadamente quantas vezes mais lento que o createMany (arredonde: 14)?', answers: ['14', '14x', '14 vezes'] }], explanation: '3141 / 217 ≈ 14,5; o custo por comando domina.' },
  { id: 'orm-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique o "descompasso objeto-relacional" com três exemplos e diga como um ORM ajuda e onde falha.', model: 'Objetos e tabelas diferem em identidade (objetos com referências na memória x chaves no banco), em relacionamentos (referências navegáveis x chaves estrangeiras e junções), em herança e polimorfismo (inexistentes no modelo relacional) e em tipos (decimais, datas, JSON). O ORM mapeia classes a tabelas, gera SQL, converte tipos e oferece tipos seguros e parâmetros, o que acelera o CRUD. Falha quando a abstração vaza: navegar relações em laços dispara N+1, consultas complexas (janelas, CTEs) ficam mal expressas e operações em massa ingênuas são lentas; é preciso ler o SQL gerado e usar SQL cru quando for o caso.', rubric: ['Dá pelo menos três exemplos do descompasso', 'Explica o que o ORM automatiza', 'Cita N+1 ou outra falha da abstração', 'Cita ler o SQL e usar SQL cru'], explanation: 'Entender o problema ajuda a usar bem a ferramenta.' },
  { id: 'orm-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarTabela(modelo)§, que gera o SQL de criação (como o Prisma). §modelo§ = §{ nome, campos: [{ nome, tipo, id?, autoincrement?, unico?, opcional?, padrao?, precisao? }] }§. Mapeamento de tipos: §Int§ → §INTEGER§ (mas §SERIAL§ se §id§ e §autoincrement§), §String§ → §TEXT§, §Boolean§ → §BOOLEAN§, §DateTime§ → §TIMESTAMP(3)§, §Decimal§ com §precisao: [p, s]§ → §DECIMAL(p,s)§. Cada coluna é §    "nome" TIPO§ seguida de §NOT NULL§ (exceto se §opcional§) e, se houver §padrao§, de §DEFAULT§: padrão §{ now: true }§ → §CURRENT_TIMESTAMP§; texto → o texto entre aspas simples; número ou booleano → o literal. Devolva uma lista: o §CREATE TABLE§ (colunas separadas por §,\\n§, uma linha em branco e §    CONSTRAINT "Tabela_pkey" PRIMARY KEY ("id")§ no fim, dentro de §(...);§) e, para cada campo §unico§, §CREATE UNIQUE INDEX "Tabela_campo_key" ON "Tabela"("campo");§.', lang: 'javascript', starter: 'function criarTabela(modelo) {\n  // seu código aqui\n}\n', hints: ['Monte cada coluna com um template e junte com ",\\n".', 'A chave primária é a coluna com id: true.', 'O padrão de texto vai entre aspas simples.'], tests: [{ name: 'Cliente', code: R`const sql = criarTabela({ nome: 'Cliente', campos: [{ nome: 'id', tipo: 'Int', id: true, autoincrement: true }, { nome: 'nome', tipo: 'String' }, { nome: 'email', tipo: 'String', unico: true }] });
assert.equal(sql[0], 'CREATE TABLE "Cliente" (\n    "id" SERIAL NOT NULL,\n    "nome" TEXT NOT NULL,\n    "email" TEXT NOT NULL,\n\n    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")\n);');
assert.equal(sql[1], 'CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");');
assert.equal(sql.length, 2);` }, { name: 'padrões, opcionais e tipos', code: R`const sql = criarTabela({ nome: 'Pedido', campos: [{ nome: 'id', tipo: 'Int', id: true, autoincrement: true }, { nome: 'status', tipo: 'String', padrao: 'aberto' }, { nome: 'criadoEm', tipo: 'DateTime', padrao: { now: true } }, { nome: 'total', tipo: 'Decimal', precisao: [10, 2], opcional: true }, { nome: 'pago', tipo: 'Boolean', padrao: false }, { nome: 'qtd', tipo: 'Int', padrao: 1 }] });
assert.equal(sql[0], 'CREATE TABLE "Pedido" (\n    "id" SERIAL NOT NULL,\n    "status" TEXT NOT NULL DEFAULT \'aberto\',\n    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    "total" DECIMAL(10,2),\n    "pago" BOOLEAN NOT NULL DEFAULT false,\n    "qtd" INTEGER NOT NULL DEFAULT 1,\n\n    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")\n);');` }, { name: 'sem autoincremento', code: R`const sql = criarTabela({ nome: 'Produto', campos: [{ nome: 'id', tipo: 'Int', id: true }, { nome: 'sku', tipo: 'String', unico: true }, { nome: 'ean', tipo: 'String', unico: true }] });
assert.ok(sql[0].includes('"id" INTEGER NOT NULL,'));
assert.equal(sql.slice(1).join('|'), 'CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");|CREATE UNIQUE INDEX "Produto_ean_key" ON "Produto"("ean");');` }], solution: R`function criarTabela(modelo) {
  const tipoSQL = (c) => {
    if (c.tipo === 'Int') return c.id && c.autoincrement ? 'SERIAL' : 'INTEGER';
    if (c.tipo === 'String') return 'TEXT';
    if (c.tipo === 'Boolean') return 'BOOLEAN';
    if (c.tipo === 'DateTime') return 'TIMESTAMP(3)';
    if (c.tipo === 'Decimal') return 'DECIMAL(' + c.precisao[0] + ',' + c.precisao[1] + ')';
    throw new Error('tipo desconhecido: ' + c.tipo);
  };
  const padraoSQL = (p) => {
    if (p && typeof p === 'object' && p.now) return 'CURRENT_TIMESTAMP';
    if (typeof p === 'string') return "'" + p + "'";
    return String(p);
  };
  const colunas = modelo.campos.map((c) => {
    let l = '    "' + c.nome + '" ' + tipoSQL(c);
    if (!c.opcional) l += ' NOT NULL';
    if (c.padrao !== undefined) l += ' DEFAULT ' + padraoSQL(c.padrao);
    return l;
  });
  const pk = modelo.campos.find((c) => c.id);
  const create = 'CREATE TABLE "' + modelo.nome + '" (\n' + colunas.join(',\n') + ',\n\n    CONSTRAINT "' + modelo.nome + '_pkey" PRIMARY KEY ("' + pk.nome + '")\n);';
  const indices = modelo.campos.filter((c) => c.unico).map((c) => 'CREATE UNIQUE INDEX "' + modelo.nome + '_' + c.nome + '_key" ON "' + modelo.nome + '"("' + c.nome + '");');
  return [create, ...indices];
}
`, explanation: 'O modelo reproduz o formato do SQL gerado pelo Prisma na migração inicial (medido): SERIAL para id autoincrementado, restrição de chave primária nomeada e índices únicos com nome Tabela_campo_key.' }
],
'orm-02': [
  { id: 'orm-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'No Prisma 7, onde fica a URL do banco de dados?', options: ['No schema.prisma, em datasource db { url = ... }', 'No arquivo prisma.config.ts (datasource.url)', 'Dentro do cliente gerado', 'Em package.json'], answer: 1, explanation: 'Medido: "Loaded Prisma config from prisma.config.ts" e o datasource do esquema sem url.' },
  { id: 'orm-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'O Prisma cria automaticamente um índice na coluna de chave estrangeira clienteId do modelo Pedido no PostgreSQL.', answer: false, explanation: 'Medido: o índice Pedido_clienteId_idx existiu porque declaramos @@index([clienteId]).' },
  { id: 'orm-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o comando ao uso.', pairs: [['prisma migrate dev', 'Gerar e aplicar uma migração em desenvolvimento'], ['prisma migrate deploy', 'Aplicar migrações pendentes em produção e CI'], ['prisma generate', 'Gerar o cliente tipado a partir do esquema'], ['prisma db push', 'Sincronizar sem migração (protótipos)']], explanation: 'Cada comando tem seu ambiente.' },
  { id: 'orm-02-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que faz o cliente gerado ficar desatualizado depois de mudar o esquema.', code: '1. editar prisma/schema.prisma (novo campo)\n2. npx prisma migrate dev --name novo_campo\n3. rodar a aplicação sem outros comandos', answer: 3, explanation: 'No Prisma 7 é preciso rodar prisma generate: a pasta generated só foi criada depois dele no laboratório.' },
  { id: 'orm-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma migração gerada contém DROP COLUMN "telefone" porque o campo foi renomeado no esquema para "celular". O que há de errado e como corrigir?', model: 'O Prisma interpretou a renomeação como remover a coluna antiga e criar uma nova, o que apagaria os dados de telefone. É preciso revisar o SQL gerado e substituir o par DROP/ADD por ALTER TABLE ... RENAME COLUMN "telefone" TO "celular" antes de aplicar (ou criar a migração sem aplicar com --create-only e editar o arquivo). Para mudanças com compatibilidade entre versões de aplicação, usar expandir e contrair. Como a migração só deve ser alterada antes de aplicada em outros ambientes, a revisão deve ocorrer no desenvolvimento.', rubric: ['Identifica o risco de perda de dados', 'Propõe RENAME COLUMN no lugar de DROP e ADD', 'Cita revisar/editar o SQL antes de aplicar', 'Menciona o cuidado com migrações já aplicadas'], explanation: 'Migrações são código: revise.' },
  { id: 'orm-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o **diff de esquemas** de uma migração. Implemente §planoDeMigracao(atual, desejado)§: ambos são objetos §{ Tabela: { coluna: tipo } }§. Devolva a lista de passos §{ acao, tabela, coluna, destrutiva }§ nesta ordem: (1) §"CRIAR_TABELA"§ para cada tabela de §desejado§ que não existe em §atual§ (coluna §null§, §destrutiva: false§); (2) para cada tabela comum, na ordem de §desejado§: §"ADICIONAR_COLUNA"§ (§destrutiva: false§) para cada coluna nova, depois §"ALTERAR_TIPO"§ (§destrutiva: true§) para cada coluna cujo tipo mudou, depois §"REMOVER_COLUNA"§ (§destrutiva: true§) para cada coluna que sumiu; (3) §"REMOVER_TABELA"§ (coluna §null§, §destrutiva: true§) para cada tabela de §atual§ ausente em §desejado§. Dentro de cada grupo, siga a ordem das chaves.', lang: 'javascript', starter: 'function planoDeMigracao(atual, desejado) {\n  // seu código aqui\n}\n', hints: ['Percorra as tabelas de desejado e atual com Object.keys.', 'Para as tabelas comuns, faça três laços: adicionar, alterar e remover.'], tests: [{ name: 'tabelas novas e removidas', code: R`const r = planoDeMigracao({ A: { id: 'int' }, B: { id: 'int' } }, { A: { id: 'int' }, C: { id: 'int' } });
assert.deepEqual(r, [{ acao: 'CRIAR_TABELA', tabela: 'C', coluna: null, destrutiva: false }, { acao: 'REMOVER_TABELA', tabela: 'B', coluna: null, destrutiva: true }]);` }, { name: 'colunas', code: R`const r = planoDeMigracao({ Cliente: { id: 'int', nome: 'text', telefone: 'text', idade: 'int' } }, { Cliente: { id: 'int', nome: 'text', celular: 'text', idade: 'text' } });
assert.deepEqual(r, [
  { acao: 'ADICIONAR_COLUNA', tabela: 'Cliente', coluna: 'celular', destrutiva: false },
  { acao: 'ALTERAR_TIPO', tabela: 'Cliente', coluna: 'idade', destrutiva: true },
  { acao: 'REMOVER_COLUNA', tabela: 'Cliente', coluna: 'telefone', destrutiva: true }
]);` }, { name: 'sem mudanças', code: R`assert.deepEqual(planoDeMigracao({ A: { x: 'int' } }, { A: { x: 'int' } }), []);
assert.deepEqual(planoDeMigracao({}, {}), []);` }], solution: R`function planoDeMigracao(atual, desejado) {
  const plano = [];
  for (const t of Object.keys(desejado)) {
    if (!(t in atual)) plano.push({ acao: 'CRIAR_TABELA', tabela: t, coluna: null, destrutiva: false });
  }
  for (const t of Object.keys(desejado)) {
    if (!(t in atual)) continue;
    const novas = desejado[t], antigas = atual[t];
    for (const c of Object.keys(novas)) if (!(c in antigas)) plano.push({ acao: 'ADICIONAR_COLUNA', tabela: t, coluna: c, destrutiva: false });
    for (const c of Object.keys(novas)) if (c in antigas && antigas[c] !== novas[c]) plano.push({ acao: 'ALTERAR_TIPO', tabela: t, coluna: c, destrutiva: true });
    for (const c of Object.keys(antigas)) if (!(c in novas)) plano.push({ acao: 'REMOVER_COLUNA', tabela: t, coluna: c, destrutiva: true });
  }
  for (const t of Object.keys(atual)) {
    if (!(t in desejado)) plano.push({ acao: 'REMOVER_TABELA', tabela: t, coluna: null, destrutiva: true });
  }
  return plano;
}
`, explanation: 'O diff marca como destrutivos os passos que podem perder dados: é onde a revisão humana da migração é indispensável. Um renomear aparece como ADICIONAR e REMOVER, e precisa ser reescrito como RENAME.' }
],
'orm-03': [
  { id: 'orm-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual consulta do Prisma traz apenas as colunas id e nome?', options: ['findMany({ include: { nome: true } })', 'findMany({ select: { id: true, nome: true } })', 'findMany({ where: { id: true } })', 'findMany({ only: ["id","nome"] })'], answer: 1, explanation: 'Medido: SELECT "t0"."id", "t0"."nome" FROM "public"."Cliente".' },
  { id: 'orm-03-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o código de erro do Prisma à situação.', pairs: [['P2002', 'Violação de unicidade (e-mail duplicado)'], ['P2003', 'Violação de chave estrangeira (cliente inexistente)'], ['P2025', 'Registro não encontrado em update ou delete'], ['40001 / 40P01', 'Falha de serialização ou deadlock: repetir a transação']], explanation: 'Medidos nos experimentos.' },
  { id: 'orm-03-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha vulnerável à injeção de SQL.', code: 'const nome = req.query.nome;\nconst r = await prisma.$queryRawUnsafe(\n  "SELECT * FROM \\"Cliente\\" WHERE nome = \'" + nome + "\'"\n);', answer: 3, explanation: 'Medido: a entrada " OR 1=1 " devolveu todas as 100 linhas. Use $queryRaw com template ou parâmetros posicionais.' },
  { id: 'orm-03-e4', type: 'tf', difficulty: 2, points: 10, prompt: 'Dentro de prisma.$transaction(async (tx) => { ... }), as operações devem usar tx em vez do cliente prisma global.', answer: true, explanation: 'Só o tx participa da transação; o cliente global executa fora dela.' },
  { id: 'orm-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare a paginação com skip/take e com cursor no Prisma: o SQL gerado, o custo e quando usar cada uma.', model: 'skip/take gera ORDER BY ... LIMIT $1 OFFSET $2: o banco lê e descarta as linhas puladas, então o custo cresce com o deslocamento, mas permite pular para qualquer página e é simples. O cursor gera uma condição pela chave (id >= o id do cursor) com ORDER BY e LIMIT, que com um índice tem custo estável, ideal para listas longas e rolagem infinita, mas só avança a partir de uma referência. Em ambos é preciso um orderBy determinístico (por exemplo, pela chave). Para listas pequenas, skip/take basta; para grandes, prefira cursor (paginação por chave, aula pgm-07).', rubric: ['Cita LIMIT/OFFSET e o custo proporcional ao deslocamento', 'Cita a condição pela chave e o custo estável do cursor', 'Cita orderBy determinístico', 'Indica quando usar cada uma'], explanation: 'A paginação por chave é a mesma do curso de PostgreSQL.' },
  { id: 'orm-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente três utilitários. §mapearErro(codigo)§ devolve §{ status, mensagem, repetir }§: §"P2002"§ e §"23505"§ → §{ status: 409, mensagem: "valor duplicado", repetir: false }§; §"P2003"§ e §"23503"§ → §{ 422, "referência inválida", false }§; §"P2025"§ → §{ 404, "não encontrado", false }§; §"40001"§, §"40P01"§ e §"1213"§ → §{ 503, "conflito de concorrência, tente novamente", true }§; qualquer outro → §{ 500, "erro interno", false }§. §paginarPorCursor(registros, cursor, take)§: §registros§ são objetos com §id§ em ordem crescente; devolva §{ itens, proximoCursor }§ com até §take§ itens de §id > cursor§ (se §cursor§ for §null§, desde o início) e §proximoCursor§ = id do último item **se existirem mais registros depois**, senão §null§. §somaExata(valores)§: soma textos decimais de **até 2 casas** (por exemplo §"10.50"§) sem erro de ponto flutuante, devolvendo texto com 2 casas; texto inválido lança §Error("valor inválido: V")§.', lang: 'javascript', starter: 'function mapearErro(codigo) {\n  // seu código aqui\n}\nfunction paginarPorCursor(registros, cursor, take) {\n}\nfunction somaExata(valores) {\n}\n', hints: ['Use um switch para os códigos.', 'Para a soma, converta cada valor para centavos inteiros.', 'Valide o formato com uma expressão regular.'], tests: [{ name: 'mapearErro', code: R`assert.deepEqual(mapearErro('P2002'), { status: 409, mensagem: 'valor duplicado', repetir: false });
assert.deepEqual(mapearErro('23505'), { status: 409, mensagem: 'valor duplicado', repetir: false });
assert.deepEqual(mapearErro('P2003'), { status: 422, mensagem: 'referência inválida', repetir: false });
assert.deepEqual(mapearErro('P2025'), { status: 404, mensagem: 'não encontrado', repetir: false });
assert.deepEqual(mapearErro('40P01'), { status: 503, mensagem: 'conflito de concorrência, tente novamente', repetir: true });
assert.deepEqual(mapearErro('1213'), { status: 503, mensagem: 'conflito de concorrência, tente novamente', repetir: true });
assert.deepEqual(mapearErro('XX000'), { status: 500, mensagem: 'erro interno', repetir: false });` }, { name: 'cursor', code: R`const regs = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }));
assert.deepEqual(paginarPorCursor(regs, null, 2), { itens: [{ id: 1 }, { id: 2 }], proximoCursor: 2 });
assert.deepEqual(paginarPorCursor(regs, 2, 2), { itens: [{ id: 3 }, { id: 4 }], proximoCursor: 4 });
assert.deepEqual(paginarPorCursor(regs, 4, 2), { itens: [{ id: 5 }], proximoCursor: null });
assert.deepEqual(paginarPorCursor(regs, 5, 2), { itens: [], proximoCursor: null });
assert.deepEqual(paginarPorCursor(regs, 3, 2), { itens: [{ id: 4 }, { id: 5 }], proximoCursor: null });` }, { name: 'soma exata', code: R`assert.equal(somaExata(['0.1', '0.2']), '0.30');
assert.equal(somaExata(['10.50', '2', '0.05']), '12.55');
assert.equal(somaExata([]), '0.00');
assert.equal(somaExata(['19.99', '19.99', '19.99']), '59.97');
assert.throws(() => somaExata(['1.234']), 'valor inválido: 1.234');
assert.throws(() => somaExata(['abc']), 'valor inválido: abc');` }], solution: R`function mapearErro(codigo) {
  if (codigo === 'P2002' || codigo === '23505') return { status: 409, mensagem: 'valor duplicado', repetir: false };
  if (codigo === 'P2003' || codigo === '23503') return { status: 422, mensagem: 'referência inválida', repetir: false };
  if (codigo === 'P2025') return { status: 404, mensagem: 'não encontrado', repetir: false };
  if (['40001', '40P01', '1213'].includes(codigo)) return { status: 503, mensagem: 'conflito de concorrência, tente novamente', repetir: true };
  return { status: 500, mensagem: 'erro interno', repetir: false };
}
function paginarPorCursor(registros, cursor, take) {
  const depois = registros.filter((r) => cursor === null || r.id > cursor);
  const itens = depois.slice(0, take);
  const temMais = depois.length > take;
  return { itens, proximoCursor: temMais && itens.length ? itens[itens.length - 1].id : null };
}
function somaExata(valores) {
  let centavos = 0;
  for (const v of valores) {
    if (!/^\d+(\.\d{1,2})?$/.test(v)) throw new Error('valor inválido: ' + v);
    const [int, dec = ''] = v.split('.');
    centavos += Number(int) * 100 + Number(dec.padEnd(2, '0'));
  }
  const int = Math.floor(centavos / 100);
  const dec = String(centavos % 100).padStart(2, '0');
  return int + '.' + dec;
}
`, explanation: 'Os três utilitários traduzem o que o curso mediu: códigos de erro em respostas de negócio, paginação por cursor e decimais exatos (0,1 + 0,2 = 0,30) em vez de ponto flutuante.' }
]
};
