// C3.3 — PostgreSQL e MySQL: exercícios das aulas 1 a 5.
// O SQL real foi executado no PostgreSQL 17.12 e no MySQL 8.4.13 (laboratório); os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsetsA = {
'pgm-01': [
  { id: 'pgm-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual comando do psql lista os esquemas do banco atual?', options: ['\\l', '\\dn', '\\dt', '\\timing'], answer: 1, explanation: '\\dn lista esquemas; \\l lista bancos; \\dt lista tabelas; \\timing mostra o tempo dos comandos.' },
  { id: 'pgm-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'No MySQL, database e schema são sinônimos; no PostgreSQL, schema é um espaço de nomes dentro de um banco.', answer: true, explanation: 'CREATE DATABASE e CREATE SCHEMA são equivalentes no MySQL; no PostgreSQL, uma conexão se liga a um banco e os esquemas organizam os objetos dentro dele.' },
  { id: 'pgm-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso ao seu papel.', pairs: [['pg_hba.conf', 'Define quem pode conectar, de onde e com qual método'], ['search_path', 'Lista de esquemas em que o PostgreSQL procura nomes não qualificados'], ['Menor privilégio', 'Conta da aplicação só com as permissões necessárias'], ['-p 127.0.0.1:55432:5432', 'Publicar a porta do contêiner apenas na própria máquina']], explanation: 'Cada item protege ou organiza o acesso ao servidor.' },
  { id: 'pgm-01-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que expõe o banco a toda a rede e usa uma tag que muda ao longo do tempo.', code: 'docker run -d --name banco \\\n  -e POSTGRES_PASSWORD=lab \\\n  -p 5432:5432 \\\n  postgres:latest', answer: 3, explanation: '-p 5432:5432 publica em todas as interfaces; use 127.0.0.1:porta. A tag latest (linha 4) também prejudica a reprodutibilidade, mas o ponto crítico de exposição é a publicação da porta.' },
  { id: 'pgm-01-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Liste os cuidados mínimos de segurança ao subir um banco em contêiner para estudos e explique por que cada um importa.', model: 'Publicar a porta só em 127.0.0.1 para que outras máquinas da rede não alcancem o banco; usar senha que não seja a padrão e nunca reaproveitá-la em ambientes reais; fixar a versão da imagem (por exemplo postgres:17) para reproduzir resultados e evitar mudanças inesperadas; não usar a conta superusuária na aplicação, criando um papel com menor privilégio; evitar passar a senha na linha de comando; e lembrar que os dados do contêiner são descartados ao removê-lo, a menos que haja volume.', rubric: ['Cita publicar a porta somente em 127.0.0.1', 'Cita fixar a versão da imagem', 'Cita menor privilégio e não usar o superusuário na aplicação', 'Cita cuidado com senhas'], explanation: 'Hábitos de segurança começam no ambiente de estudo.' },
  { id: 'pgm-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §auditarConfiguracao(cfg)§, que recebe §{ host, usuario, senha, imagem, metodoAuth }§ e devolve a **lista de problemas**, **nesta ordem**, usando estes códigos: §"porta-exposta"§ se §host§ for §"0.0.0.0"§; §"superusuario-na-aplicacao"§ se §usuario§ for §"postgres"§ ou §"root"§; §"senha-fraca"§ se a senha tiver **menos de 12 caracteres**; §"imagem-sem-versao"§ se §imagem§ terminar em §":latest"§ ou **não tiver tag** (sem §":"§); §"auth-trust"§ se §metodoAuth§ for §"trust"§. Uma configuração sem problemas devolve §[]§.', lang: 'javascript', starter: 'function auditarConfiguracao(cfg) {\n  // seu código aqui\n}\n', hints: ['Vá acrescentando códigos a uma lista na ordem pedida.', 'Para a imagem, verifique se não contém ":" ou se termina em ":latest".'], tests: [{ name: 'configuração de laboratório insegura', code: R`const cfg = { host: '0.0.0.0', usuario: 'postgres', senha: 'lab', imagem: 'postgres:latest', metodoAuth: 'trust' };
assert.deepEqual(auditarConfiguracao(cfg), ['porta-exposta', 'superusuario-na-aplicacao', 'senha-fraca', 'imagem-sem-versao', 'auth-trust']);` }, { name: 'configuração razoável', code: R`const cfg = { host: '127.0.0.1', usuario: 'app_pedidos', senha: 'uma-senha-longa-123', imagem: 'postgres:17', metodoAuth: 'scram-sha-256' };
assert.deepEqual(auditarConfiguracao(cfg), []);` }, { name: 'casos isolados', code: R`assert.deepEqual(auditarConfiguracao({ host: '127.0.0.1', usuario: 'root', senha: 'x'.repeat(12), imagem: 'mysql', metodoAuth: 'caching_sha2_password' }), ['superusuario-na-aplicacao', 'imagem-sem-versao']);
assert.deepEqual(auditarConfiguracao({ host: '0.0.0.0', usuario: 'app', senha: 'y'.repeat(20), imagem: 'mysql:8.4', metodoAuth: 'scram-sha-256' }), ['porta-exposta']);` }], solution: R`function auditarConfiguracao(cfg) {
  const p = [];
  if (cfg.host === '0.0.0.0') p.push('porta-exposta');
  if (cfg.usuario === 'postgres' || cfg.usuario === 'root') p.push('superusuario-na-aplicacao');
  if ((cfg.senha || '').length < 12) p.push('senha-fraca');
  if (!(cfg.imagem || '').includes(':') || cfg.imagem.endsWith(':latest')) p.push('imagem-sem-versao');
  if (cfg.metodoAuth === 'trust') p.push('auth-trust');
  return p;
}
`, explanation: 'Uma auditoria simples de configuração reúne os cuidados da aula: porta restrita, menor privilégio, senhas fortes, versão fixa e autenticação adequada.' }
],
'pgm-02': [
  { id: 'pgm-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual tipo é o mais adequado para guardar o valor de um pagamento em reais?', options: ['double precision', 'real', 'numeric(12,2)', 'text'], answer: 2, explanation: 'numeric (DECIMAL no MySQL) guarda o valor exato; ponto flutuante deu 0.30000000000000004 para 0,1 + 0,2.' },
  { id: 'pgm-02-e2', type: 'trace', difficulty: 3, points: 10, prompt: 'Sessão em America/Sao_Paulo: INSERT em colunas timestamp e timestamptz do valor "2026-03-01 12:00:00". Depois a sessão muda para UTC e as duas colunas são lidas.', code: 'SET TIME ZONE \'America/Sao_Paulo\';\nINSERT INTO t VALUES (\'2026-03-01 12:00:00\', \'2026-03-01 12:00:00\');\nSET TIME ZONE \'UTC\';\nSELECT sem_fuso, com_fuso FROM t;', lang: 'sql', steps: [{ q: 'Que hora aparece em sem_fuso (timestamp)?', answers: ['12:00:00', '12:00'] }, { q: 'Que hora aparece em com_fuso (timestamptz)?', answers: ['15:00:00', '15:00'] }], explanation: 'timestamp guarda o relógio de parede; timestamptz guarda o instante e o exibe no fuso da sessão (medido: 12:00 e 15:00+00).' },
  { id: 'pgm-02-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'No MySQL 8.4 com a collation padrão, WHERE nome = \'CANETA\' encontra linhas com "Caneta" e "caneta"; no PostgreSQL, a mesma comparação não as encontra.', answer: true, explanation: 'Medido: 2 linhas no MySQL (utf8mb4_0900_ai_ci) e 0 no PostgreSQL.' },
  { id: 'pgm-02-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que pode estourar em uma tabela com bilhões de linhas.', code: 'CREATE TABLE eventos (\n  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  criado timestamptz NOT NULL DEFAULT now(),\n  payload jsonb\n);', answer: 2, explanation: 'integer vai até 2.147.483.647; para tabelas que podem passar disso use bigint (medido: 2147483647::int + 1 falha com integer out of range).' },
  { id: 'pgm-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a diferença entre TIMESTAMP e DATETIME no MySQL e entre timestamp e timestamptz no PostgreSQL, e recomende como guardar o instante de um pagamento.', model: 'No PostgreSQL, timestamp guarda data e hora sem fuso (relógio de parede) e timestamptz guarda um instante, convertendo para UTC e exibindo no fuso da sessão. No MySQL, DATETIME guarda o valor como informado e TIMESTAMP converte para UTC e exibe no fuso da sessão (medido: ao trocar o time_zone, DATETIME ficou 12:00 e TIMESTAMP passou a 15:00). Para o instante de um pagamento, no PostgreSQL use timestamptz; no MySQL use TIMESTAMP ou DATETIME armazenados em UTC por convenção, convertendo na apresentação, atento à faixa do TIMESTAMP. Para datas de calendário (aniversário), use date.', rubric: ['Distingue relógio de parede de instante', 'Descreve o comportamento medido ao trocar o fuso', 'Recomenda timestamptz ou UTC por convenção', 'Menciona date para datas de calendário'], explanation: 'Fusos horários causam bugs caros; a convenção precisa ser explícita.' },
  { id: 'pgm-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §tipoRecomendado(campo)§ para o PostgreSQL. §campo§ tem §natureza§ (§"dinheiro"§, §"inteiro"§, §"instante"§, §"data"§, §"texto"§ ou §"identificador"§) e, quando for o caso, §maximo§ (maior valor esperado) e §distribuido§ (booleano). Regras: dinheiro → §"numeric"§; instante → §"timestamptz"§; data → §"date"§; texto → §"text"§; **inteiro** → §"smallint"§ se §maximo <= 32767§, §"integer"§ se §maximo <= 2147483647§, senão §"bigint"§; **identificador** → §"uuid"§ se §distribuido§ for verdadeiro, senão aplique a regra de inteiro. Natureza desconhecida lança §Error("natureza desconhecida: X")§.', lang: 'javascript', starter: 'function tipoRecomendado(campo) {\n  // seu código aqui\n}\n', hints: ['Crie uma função auxiliar para a regra de inteiro.', 'Use um switch na natureza.'], tests: [{ name: 'tipos simples', code: R`assert.equal(tipoRecomendado({ natureza: 'dinheiro' }), 'numeric');
assert.equal(tipoRecomendado({ natureza: 'instante' }), 'timestamptz');
assert.equal(tipoRecomendado({ natureza: 'data' }), 'date');
assert.equal(tipoRecomendado({ natureza: 'texto' }), 'text');` }, { name: 'faixas de inteiros', code: R`assert.equal(tipoRecomendado({ natureza: 'inteiro', maximo: 100 }), 'smallint');
assert.equal(tipoRecomendado({ natureza: 'inteiro', maximo: 32767 }), 'smallint');
assert.equal(tipoRecomendado({ natureza: 'inteiro', maximo: 32768 }), 'integer');
assert.equal(tipoRecomendado({ natureza: 'inteiro', maximo: 2147483647 }), 'integer');
assert.equal(tipoRecomendado({ natureza: 'inteiro', maximo: 2147483648 }), 'bigint');` }, { name: 'identificadores e erro', code: R`assert.equal(tipoRecomendado({ natureza: 'identificador', distribuido: true, maximo: 10 }), 'uuid');
assert.equal(tipoRecomendado({ natureza: 'identificador', maximo: 5000000000 }), 'bigint');
assert.equal(tipoRecomendado({ natureza: 'identificador', maximo: 1000000 }), 'integer');
assert.throws(() => tipoRecomendado({ natureza: 'cor' }), 'natureza desconhecida: cor');` }], solution: R`function tipoRecomendado(campo) {
  const inteiro = (m) => (m <= 32767 ? 'smallint' : m <= 2147483647 ? 'integer' : 'bigint');
  switch (campo.natureza) {
    case 'dinheiro': return 'numeric';
    case 'instante': return 'timestamptz';
    case 'data': return 'date';
    case 'texto': return 'text';
    case 'inteiro': return inteiro(campo.maximo);
    case 'identificador': return campo.distribuido ? 'uuid' : inteiro(campo.maximo);
    default: throw new Error('natureza desconhecida: ' + campo.natureza);
  }
}
`, explanation: 'A escolha de tipo segue perguntas simples (faixa, exatidão, fuso, distribuição). O código registra a política da equipe de forma testável.' }
],
'pgm-03': [
  { id: 'pgm-03-e1', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a consulta ao resultado medido em cada banco.', pairs: [['SELECT 5/2 no PostgreSQL', '2'], ['SELECT 5/2 no MySQL 8.4', '2,5000'], ['\'a\' || \'b\' no PostgreSQL', 'ab'], ['\'a\' || \'b\' no MySQL (sql_mode padrão)', '0']], explanation: 'O PostgreSQL faz divisão inteira e concatena com ||; o MySQL divide em decimal e trata || como OR.' },
  { id: 'pgm-03-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'O que acontece com uma tabela criada dentro de uma transação que termina em ROLLBACK?', options: ['Some nos dois bancos', 'Some no PostgreSQL (DDL transacional) e permanece no MySQL (commit implícito)', 'Permanece nos dois', 'Permanece no PostgreSQL e some no MySQL'], answer: 1, explanation: 'Medido: no PostgreSQL to_regclass devolveu NULL; no MySQL a tabela continuou existindo.' },
  { id: 'pgm-03-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'O MySQL 8.4 aceita FULL JOIN.', answer: false, explanation: 'Medido: erro de sintaxe (1064). Emule com UNION de um LEFT JOIN e um RIGHT JOIN.' },
  { id: 'pgm-03-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Tabela com os valores a, b e NULL.', code: 'SELECT x FROM t ORDER BY x;        -- PostgreSQL\nSELECT x FROM t ORDER BY x;        -- MySQL', lang: 'sql', steps: [{ q: 'Qual a última linha no PostgreSQL?', answers: ['NULL', 'null'] }, { q: 'Qual a primeira linha no MySQL?', answers: ['NULL', 'null'] }], explanation: 'Medido: PostgreSQL coloca NULL por último em ordem crescente; MySQL por primeiro.' },
  { id: 'pgm-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Sua equipe vai migrar um sistema de MySQL para PostgreSQL. Liste cinco verificações de equivalência que você faria nas consultas e nos dados, justificando com o que foi medido.', model: 'Verificar: (1) comparação de texto, pois o MySQL com a collation padrão ignora caixa e acentos e o PostgreSQL não, então chaves únicas e buscas podem mudar; (2) ordenação com NULL, que vem primeiro em ASC no MySQL e por último no PostgreSQL; (3) divisão e operadores (5/2 e ||), que mudam o resultado; (4) GROUP BY e modo estrito, datas inválidas e truncamentos, pois o MySQL fora do modo estrito aceita dados que o PostgreSQL recusa; (5) DDL e transações, pois o MySQL faz commit implícito e o PostgreSQL desfaz DDL; também RETURNING, upsert e tipos específicos. Rodar as consultas críticas nos dois e comparar resultados e planos.', rubric: ['Cita a comparação de texto e caixa', 'Cita a ordenação de NULL', 'Cita divisão e operadores ou modo estrito', 'Cita DDL e transações ou sintaxes específicas'], explanation: 'Migrar é testar equivalência, não só converter o esquema.' },
  { id: 'pgm-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele diferenças de dialeto. Implemente §ordenar(valores, opcoes)§ com §opcoes§ = §{ dialeto, desc }§ (§"postgres"§ ou §"mysql"§): ordena números e §null§, **sem alterar** a entrada. No PostgreSQL, §null§ é tratado como **o maior valor** (último em ASC, primeiro em DESC); no MySQL, como **o menor** (primeiro em ASC, último em DESC). Implemente também §dividir(a, b, dialeto)§ (§"postgres"§: se os dois forem inteiros, divisão inteira truncada; §"mysql"§: divisão decimal) e §textoIgual(a, b, dialeto)§ (§"postgres"§: comparação exata; §"mysql"§: ignorando maiúsculas e minúsculas). Dialeto desconhecido lança §Error("dialeto desconhecido: D")§.', lang: 'javascript', starter: 'function ordenar(valores, opcoes) {\n  // seu código aqui\n}\nfunction dividir(a, b, dialeto) {\n}\nfunction textoIgual(a, b, dialeto) {\n}\n', hints: ['Valide o dialeto no começo.', 'Para a ordenação, defina um peso para null conforme o dialeto e inverta para DESC.', 'Number.isInteger ajuda na divisão.'], tests: [{ name: 'NULL na ordenação', code: R`const v = [3, null, 1, 2];
assert.deepEqual(ordenar(v, { dialeto: 'postgres' }), [1, 2, 3, null]);
assert.deepEqual(ordenar(v, { dialeto: 'postgres', desc: true }), [null, 3, 2, 1]);
assert.deepEqual(ordenar(v, { dialeto: 'mysql' }), [null, 1, 2, 3]);
assert.deepEqual(ordenar(v, { dialeto: 'mysql', desc: true }), [3, 2, 1, null]);
assert.deepEqual(v, [3, null, 1, 2]);` }, { name: 'divisão e texto', code: R`assert.equal(dividir(5, 2, 'postgres'), 2);
assert.equal(dividir(5, 2, 'mysql'), 2.5);
assert.equal(dividir(5, 2.0, 'postgres'), 2);
assert.equal(dividir(5.5, 2, 'postgres'), 2.75);
assert.equal(textoIgual('Caneta', 'CANETA', 'mysql'), true);
assert.equal(textoIgual('Caneta', 'CANETA', 'postgres'), false);
assert.equal(textoIgual('abc', 'abc', 'postgres'), true);` }, { name: 'dialeto desconhecido', code: R`assert.throws(() => ordenar([1], { dialeto: 'oracle' }), 'dialeto desconhecido: oracle');
assert.throws(() => dividir(1, 2, 'sqlite'), 'dialeto desconhecido: sqlite');
assert.throws(() => textoIgual('a', 'a', 'x'), 'dialeto desconhecido: x');` }], solution: R`function valido(d) {
  if (d !== 'postgres' && d !== 'mysql') throw new Error('dialeto desconhecido: ' + d);
}
function ordenar(valores, opcoes) {
  const { dialeto, desc } = opcoes;
  valido(dialeto);
  const nuloMaior = dialeto === 'postgres';
  const cmp = (a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return nuloMaior ? 1 : -1;
    if (b === null) return nuloMaior ? -1 : 1;
    return a - b;
  };
  return valores.slice().sort((a, b) => (desc ? cmp(b, a) : cmp(a, b)));
}
function dividir(a, b, dialeto) {
  valido(dialeto);
  if (dialeto === 'mysql') return a / b;
  return Number.isInteger(a) && Number.isInteger(b) ? Math.trunc(a / b) : a / b;
}
function textoIgual(a, b, dialeto) {
  valido(dialeto);
  return dialeto === 'mysql' ? a.toLowerCase() === b.toLowerCase() : a === b;
}
`, explanation: 'O modelo captura três diferenças medidas: posição do NULL na ordenação, divisão de inteiros e comparação de texto. Na prática, teste as consultas críticas nos dois bancos.' }
],
'pgm-04': [
  { id: 'pgm-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual condição NÃO consegue usar um índice B-tree comum na coluna data?', options: ['WHERE data = DATE \'2026-03-01\'', 'WHERE data >= DATE \'2026-03-01\' AND data < DATE \'2026-03-02\'', 'WHERE date_trunc(\'day\', data::timestamp) = TIMESTAMP \'2026-03-01\'', 'WHERE data BETWEEN \'2026-03-01\' AND \'2026-03-31\''], answer: 2, explanation: 'Função aplicada à coluna impede o uso do índice (medido: Parallel Seq Scan); reescreva como intervalo.' },
  { id: 'pgm-04-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Um índice composto em (status, data) acelera bem a consulta WHERE data = ... sem filtrar status.', answer: false, explanation: 'O índice é ordenado primeiro por status; a consulta só por data não usa esse prefixo (medido: usou o índice separado em data).' },
  { id: 'pgm-04-e3', type: 'trace', difficulty: 3, points: 10, prompt: 'Medido em 500.000 linhas: a mesma consulta WHERE cliente_id = 123 (37 linhas).', code: 'sem índice: Parallel Seq Scan, 8512 blocos\ncom índice: Bitmap Index Scan, 40 blocos', lang: 'text', steps: [{ q: 'Quantas linhas as duas execuções devolvem?', answers: ['37'] }, { q: 'O índice fez a leitura de blocos cair de 8512 para quantos?', answers: ['40'] }], explanation: 'A resposta é a mesma; o trabalho cai drasticamente.' },
  { id: 'pgm-04-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede o uso do índice em codigo.', code: 'CREATE INDEX idx_codigo ON pedidos (codigo text_pattern_ops);\nSELECT id\nFROM pedidos\nWHERE codigo LIKE \'%abc\';', answer: 4, explanation: 'Curinga no início impede o uso do B-tree (medido: Seq Scan); LIKE \'abc%\' usou o índice.' },
  { id: 'pgm-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma tabela de pedidos recebe milhares de inserções por segundo e tem 8 índices. A equipe quer adicionar mais um. Que análise você faria antes?', model: 'Medir o custo de escrita: cada índice é mantido a cada INSERT, UPDATE de coluna indexada e DELETE (medido: 300 mil inserções levaram ~1,1 s sem índices e ~7,4 s com quatro). Verificar se algum índice existente é redundante ou não usado (pg_stat_user_indexes), se um índice composto ou parcial cobre o caso, qual consulta o novo índice atende, qual sua seletividade e quanto ela é frequente, e testar o ganho com EXPLAIN (ANALYZE, BUFFERS) antes e depois. Só adicionar se o ganho compensar o custo de escrita e de espaço.', rubric: ['Cita o custo de escrita e de espaço', 'Cita revisar índices redundantes ou não usados', 'Cita medir o benefício com EXPLAIN', 'Considera índice parcial ou composto em vez de um novo'], explanation: 'Índices têm custo; a decisão deve ser medida.' },
  { id: 'pgm-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a regra de uso de um **índice composto**. Implemente §colunasUsaveis(indice, condicoes)§: §indice§ é a lista ordenada de colunas (por exemplo §["status", "data"]§) e §condicoes§ é uma lista de §{ coluna, op }§ com §op§ em §"="§, §">"§, §">="§, §"<"§, §"<="§ ou §"BETWEEN"§. Percorra as colunas do índice **na ordem**: enquanto houver condição de **igualdade** (§"="§) para a coluna, ela é utilizável e a busca continua; ao encontrar uma coluna com condição de **intervalo** (qualquer outro operador), ela é utilizável e a busca **para**; se uma coluna não tem condição, **para** sem contá-la. Devolva a **quantidade** de colunas utilizáveis do índice.', lang: 'javascript', starter: 'function colunasUsaveis(indice, condicoes) {\n  // seu código aqui\n}\n', hints: ['Percorra o índice coluna a coluna procurando a condição dessa coluna.', 'Igualdade continua; intervalo conta e encerra; ausência encerra.'], tests: [{ name: 'igualdade e intervalo', code: R`const idx = ['status', 'data'];
assert.equal(colunasUsaveis(idx, [{ coluna: 'status', op: '=' }, { coluna: 'data', op: '>=' }]), 2);
assert.equal(colunasUsaveis(idx, [{ coluna: 'status', op: '=' }]), 1);
assert.equal(colunasUsaveis(idx, [{ coluna: 'status', op: '=' }, { coluna: 'data', op: '=' }]), 2);` }, { name: 'coluna inicial ausente', code: R`const idx = ['status', 'data'];
assert.equal(colunasUsaveis(idx, [{ coluna: 'data', op: '>=' }]), 0);
assert.equal(colunasUsaveis(idx, []), 0);` }, { name: 'intervalo encerra a busca', code: R`const idx = ['a', 'b', 'c'];
assert.equal(colunasUsaveis(idx, [{ coluna: 'a', op: '>' }, { coluna: 'b', op: '=' }]), 1);
assert.equal(colunasUsaveis(idx, [{ coluna: 'a', op: '=' }, { coluna: 'c', op: '=' }]), 1);
assert.equal(colunasUsaveis(idx, [{ coluna: 'a', op: '=' }, { coluna: 'b', op: 'BETWEEN' }, { coluna: 'c', op: '=' }]), 2);` }], solution: R`function colunasUsaveis(indice, condicoes) {
  let n = 0;
  for (const col of indice) {
    const c = condicoes.find((x) => x.coluna === col);
    if (!c) break;
    n++;
    if (c.op !== '=') break;
  }
  return n;
}
`, explanation: 'A regra do prefixo explica por que a ordem das colunas importa: igualdades primeiro, depois uma coluna de intervalo ou ordenação.' }
],
'pgm-05': [
  { id: 'pgm-05-e1', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a consulta ao tipo de índice mais adequado.', pairs: [['meta @> \'{"canal":"loja"}\' em jsonb', 'GIN'], ['codigo LIKE \'%abc12%\'', 'GIN com pg_trgm'], ['periodo && tstzrange(...) (sobreposição)', 'GiST'], ['Tabela de logs enorme, inseridos em ordem de data', 'BRIN']], explanation: 'O tipo de índice acompanha o operador da consulta.' },
  { id: 'pgm-05-e2', type: 'mc', difficulty: 3, points: 10, prompt: 'Ao criar EXCLUDE USING gist (sala WITH =, periodo WITH &&), ocorreu "data type integer has no default operator class for access method gist". Qual a solução?', options: ['Trocar o tipo de sala para texto', 'CREATE EXTENSION btree_gist', 'Criar um índice B-tree em sala', 'Usar UNIQUE em vez de EXCLUDE'], answer: 1, explanation: 'A extensão btree_gist fornece classes de operadores GiST para tipos comuns (medido).' },
  { id: 'pgm-05-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'O MySQL oferece restrições de exclusão equivalentes ao EXCLUDE do PostgreSQL.', answer: false, explanation: 'Não: a regra de sobreposição precisa ser garantida por lógica na aplicação ou estruturas auxiliares.' },
  { id: 'pgm-05-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o índice para buscas com LIKE \'%trecho%\'.', code: 'CREATE EXTENSION IF NOT EXISTS [[0]];\nCREATE INDEX idx_codigo_trgm ON pedidos USING [[1]] (codigo gin_trgm_ops);', answers: [['pg_trgm'], ['gin', 'GIN']], explanation: 'pg_trgm decompõe o texto em trigramas; o índice GIN os usa (medido: Bitmap Index Scan).' },
  { id: 'pgm-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que validar "sem sobreposição de reservas" apenas na aplicação é arriscado e como o banco resolve isso.', model: 'A validação na aplicação costuma ser "verificar se existe reserva sobreposta e, se não, inserir", o que deixa uma janela entre a verificação e a inserção: duas requisições simultâneas podem passar na verificação e inserir reservas conflitantes. Outros serviços e scripts também podem inserir sem passar pela validação. O PostgreSQL resolve com uma restrição EXCLUDE USING gist (sala WITH =, periodo WITH &&) (com btree_gist para o inteiro), que é verificada pelo banco de forma atômica e vale para qualquer cliente; medido: a segunda reserva sobreposta foi recusada com a violação da restrição.', rubric: ['Descreve a corrida entre verificar e inserir', 'Cita múltiplos clientes ou serviços', 'Descreve a restrição EXCLUDE com gist e &&', 'Menciona btree_gist ou o resultado medido'], explanation: 'Regras de integridade pertencem ao banco quando precisam valer sempre.' },
  { id: 'pgm-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele uma **restrição de exclusão**. Implemente §reservar(reservas, nova)§: §reservas§ é uma lista de §{ sala, inicio, fim }§ (números; intervalos **semiabertos** §[inicio, fim)§) e §nova§ tem o mesmo formato. Se existir reserva na **mesma sala** cujo intervalo se **sobreponha** ao da nova (dois intervalos §[a, b)§ e §[c, d)§ se sobrepõem quando §a < d§ e §c < b§), lance §Error("conflicting key value violates exclusion constraint")§. Caso contrário, devolva uma **nova lista** com a reserva acrescentada (sem alterar a original). Reservas encostadas (fim de uma igual ao início da outra) **não** se sobrepõem. Intervalo inválido (§fim <= inicio§) lança §Error("intervalo inválido")§.', lang: 'javascript', starter: 'function reservar(reservas, nova) {\n  // seu código aqui\n}\n', hints: ['Valide o intervalo primeiro.', 'Procure alguma reserva da mesma sala com a < d e c < b.', 'Devolva [...reservas, nova].'], tests: [{ name: 'aceita e recusa', code: R`const a = reservar([], { sala: 1, inicio: 10, fim: 12 });
assert.equal(a.length, 1);
assert.throws(() => reservar(a, { sala: 1, inicio: 11, fim: 13 }), 'conflicting key value violates exclusion constraint');
const b = reservar(a, { sala: 2, inicio: 11, fim: 13 });
assert.equal(b.length, 2);
assert.equal(a.length, 1);` }, { name: 'intervalos encostados', code: R`const a = reservar([], { sala: 1, inicio: 10, fim: 12 });
const b = reservar(a, { sala: 1, inicio: 12, fim: 14 });
assert.deepEqual(b.map((r) => r.inicio), [10, 12]);
const c = reservar(b, { sala: 1, inicio: 8, fim: 10 });
assert.equal(c.length, 3);` }, { name: 'contido e inválido', code: R`const a = [{ sala: 3, inicio: 8, fim: 20 }];
assert.throws(() => reservar(a, { sala: 3, inicio: 10, fim: 11 }), 'conflicting key value violates exclusion constraint');
assert.throws(() => reservar(a, { sala: 3, inicio: 5, fim: 25 }), 'conflicting key value violates exclusion constraint');
assert.throws(() => reservar([], { sala: 1, inicio: 5, fim: 5 }), 'intervalo inválido');` }], solution: R`function reservar(reservas, nova) {
  if (!(nova.fim > nova.inicio)) throw new Error('intervalo inválido');
  const conflito = reservas.some((r) => r.sala === nova.sala && r.inicio < nova.fim && nova.inicio < r.fim);
  if (conflito) throw new Error('conflicting key value violates exclusion constraint');
  return [...reservas, nova];
}
`, explanation: 'O modelo reproduz a restrição EXCLUDE com intervalos semiabertos: mesma sala e sobreposição são proibidas, enquanto intervalos encostados são permitidos (como em tstzrange com colchete e parêntese).' }
]
};
