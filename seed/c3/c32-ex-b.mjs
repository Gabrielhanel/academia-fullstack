// C3.2 — SQL avançado e analítico: exercícios das aulas 4 a 6, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'sqa-04': [
  { id: 'sqa-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual a principal diferença entre uma função e uma procedure no PostgreSQL?', options: ['A função não pode receber parâmetros', 'A função é usada em consultas e devolve valor; a procedure é chamada com CALL, executa ações e pode controlar transações', 'A procedure só roda em SQL puro', 'Não há diferença'], answer: 1, explanation: 'Funções entram em SELECT e WHERE; procedures usam CALL e podem fazer COMMIT e ROLLBACK no corpo.' },
  { id: 'sqa-04-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Quando uma procedure lança RAISE EXCEPTION no meio da execução, as gravações feitas antes dentro da mesma chamada são desfeitas.', answer: true, explanation: 'Medido: CALL registrar_venda(21, 1, -5) falhou e a venda 21 não existia depois (contagem 0).' },
  { id: 'sqa-04-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha em que a variável colide com o nome de uma coluna.', code: 'CREATE FUNCTION total_vendedor(vendedor_id int) RETURNS numeric\nLANGUAGE plpgsql AS $$\nBEGIN\n  RETURN (SELECT sum(valor) FROM vendas WHERE vendedor_id = vendedor_id);\nEND $$;', answer: 4, explanation: 'vendedor_id é ao mesmo tempo parâmetro e coluna: a condição fica ambígua (o PostgreSQL acusa ambiguidade ou compara a coluna consigo mesma). Prefixe parâmetros (p_vendedor_id).' },
  { id: 'sqa-04-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a situação ao recurso mais adequado.', pairs: [['Cálculo reutilizado em consultas (imposto de um valor)', 'Função'], ['Operação de negócio com várias gravações e validação', 'Procedure'], ['Registrar automaticamente toda inserção em uma tabela de auditoria', 'Trigger'], ['Garantir que preco >= 0 sempre', 'Constraint CHECK']], explanation: 'Escolha a ferramenta mais simples que garante a regra.' },
  { id: 'sqa-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Discuta quando manter regras de negócio em procedures e triggers e quando mantê-las na aplicação. Cite pelo menos três critérios.', model: 'No banco ficam bem as invariantes que devem valer para todo cliente (constraints, auditoria), operações pesadas em dados (cargas, fechamentos) e procedures atômicas que reduzem idas ao banco. Na aplicação ficam bem as regras que mudam com frequência, que precisam de testes automatizados, versionamento, depuração e integração com outros serviços, além de escalar horizontalmente. Critérios: onde a regra precisa valer (todos os clientes ou só um serviço), testabilidade e depuração, desempenho e volume de dados, facilidade de versionar e implantar, habilidades da equipe e risco de lógica invisível em triggers.', rubric: ['Cita invariantes e auditoria no banco', 'Cita testabilidade e versionamento na aplicação', 'Cita desempenho e volume de dados', 'Menciona o risco de lógica invisível em triggers'], explanation: 'Não há resposta única; o importante é o critério.' },
  { id: 'sqa-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele uma **procedure atômica**. Implemente §chamar(estado, passos)§: §estado§ é um objeto (por exemplo, §{ vendas: [], log: [] }§) e §passos§ é uma lista de funções §(rascunho) => void§ que **alteram** um rascunho (cópia profunda do estado, use §structuredClone§). Execute os passos em ordem sobre o rascunho. Se todos terminarem, devolva §{ estado: rascunho, erro: null }§. Se algum **lançar um erro**, **descarte** o rascunho e devolva §{ estado, erro: mensagem }§, com o **estado original (a mesma referência)**. Os passos seguintes ao que falhou não devem rodar.', lang: 'javascript', starter: 'function chamar(estado, passos) {\n  // seu código aqui\n}\n', hints: ['Clone com structuredClone(estado).', 'Use try/catch ao redor do laço de passos.', 'Em caso de erro, devolva o objeto original sem modificações.'], tests: [{ name: 'sucesso grava tudo', code: R`const inicial = { vendas: [], log: [] };
const r = chamar(inicial, [(e) => e.vendas.push({ id: 20, valor: 80 }), (e) => e.log.push('criada')]);
assert.equal(r.erro, null);
assert.deepEqual(r.estado, { vendas: [{ id: 20, valor: 80 }], log: ['criada'] });
assert.deepEqual(inicial, { vendas: [], log: [] });` }, { name: 'erro desfaz tudo', code: R`const inicial = { vendas: [], log: [] };
const passos = [(e) => e.vendas.push({ id: 21, valor: -5 }), (e) => { if (e.vendas[0].valor <= 0) throw new Error('valor inválido: ' + e.vendas[0].valor); }, (e) => e.log.push('nunca')];
const r = chamar(inicial, passos);
assert.equal(r.erro, 'valor inválido: -5');
assert.ok(r.estado === inicial, 'deve devolver o estado original');
assert.deepEqual(inicial, { vendas: [], log: [] });` }, { name: 'sem passos', code: R`const e = { x: 1 };
const r = chamar(e, []);
assert.equal(r.erro, null);
assert.deepEqual(r.estado, { x: 1 });
assert.ok(r.estado !== e || true);` }], solution: R`function chamar(estado, passos) {
  const rascunho = structuredClone(estado);
  try {
    for (const p of passos) p(rascunho);
  } catch (e) {
    return { estado, erro: e.message };
  }
  return { estado: rascunho, erro: null };
}
`, explanation: 'O modelo mostra a atomicidade: ou todos os passos valem, ou nenhum. No banco, quem garante isso é a transação; a exceção da procedure faz o rollback do que foi gravado.' }
],
'sqa-05': [
  { id: 'sqa-05-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Quantas linhas gera GROUP BY ROLLUP (regiao, nome) com 2 regiões e 4 vendedores (2 por região)?', options: ['4', '6', '7', '12'], answer: 2, explanation: '4 detalhes + 2 subtotais por região + 1 total geral = 7 (medido).' },
  { id: 'sqa-05-e2', type: 'trace', difficulty: 3, points: 10, prompt: 'No CUBE (regiao, produto) com grouping(regiao, produto) AS g.', code: 'Norte | A | 250 | g=?\nNorte | (NULL) | 1250 | g=?\n(NULL) | A | 750 | g=?\n(NULL) | (NULL) | 2400 | g=?', lang: 'text', steps: [{ q: 'Qual o g da linha de detalhe (Norte, A)?', answers: ['0'] }, { q: 'Qual o g do subtotal da região Norte?', answers: ['1'] }, { q: 'Qual o g do subtotal do produto A?', answers: ['2'] }, { q: 'Qual o g do total geral?', answers: ['3'] }], explanation: 'grouping devolve uma máscara de bits das colunas totalizadas (medido: 0, 1, 2 e 3).' },
  { id: 'sqa-05-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que esconde os meses sem vendas.', code: 'SELECT date_trunc(\'month\', data)::date AS mes,\n       coalesce(sum(valor), 0) AS total\nFROM vendas\nGROUP BY 1\nORDER BY 1;', answer: 4, explanation: 'Agrupar só o que existe em vendas nunca produz o mês vazio: gere o calendário com generate_series e junte com LEFT JOIN (medido: abril apareceu com 0).' },
  { id: 'sqa-05-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o pivot de janeiro por produto.', code: 'SELECT produto,\n       sum(valor) [[0]] (WHERE extract(month FROM data) = 1) AS jan\nFROM vendas GROUP BY [[1]];', answers: [['FILTER'], ['produto']], explanation: 'FILTER restringe as linhas da agregação (medido: A 300, B 150, C 500).' },
  { id: 'sqa-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como distinguir, em uma consulta com ROLLUP, um subtotal de uma linha cujo valor de agrupamento é realmente NULL nos dados? Dê um exemplo de rotulagem.', model: 'Com ROLLUP, as colunas totalizadas aparecem como NULL, o que se confunde com NULL real nos dados. A função grouping(coluna) devolve 1 quando a coluna foi totalizada naquela linha e 0 caso contrário. Exemplo: CASE WHEN grouping(regiao) = 1 THEN \'TODAS\' ELSE coalesce(regiao, \'(sem região)\') END AS regiao_rotulo. Assim, o total geral é rotulado como TODAS e uma região realmente nula como (sem região).', rubric: ['Explica a ambiguidade do NULL', 'Cita grouping() e seus valores', 'Dá um exemplo de CASE para rotular', 'Diferencia subtotal de NULL real'], explanation: 'coalesce sozinho não resolve quando existem NULL reais.' },
  { id: 'sqa-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o §ROLLUP§. Implemente §rollup(linhas, colunas, valor)§: §colunas§ é a lista hierárquica de colunas (por exemplo §["regiao", "nome"]§) e §valor§ é o nome da coluna somada. Devolva as linhas de resultado §{ ...colunas, total }§ para **cada nível**: o nível completo (detalhe, linhas com a mesma combinação são somadas), os subtotais (colunas finais valendo §null§) e o **total geral** (todas §null§). A saída deve estar ordenada pelas colunas em ordem, com **§null§ por último** em cada coluna (como §ORDER BY ... NULLS LAST§), e os valores comparados com §<§ e §>§.', lang: 'javascript', starter: 'function rollup(linhas, colunas, valor) {\n  // seu código aqui\n}\n', hints: ['Para k de colunas.length até 0, agregue pelas k primeiras colunas.', 'As colunas restantes entram com null.', 'Ordene comparando coluna a coluna, tratando null como maior.'], tests: [{ name: 'regiões e vendedores', code: R`const d = [{ regiao: 'Sul', nome: 'Ana', v: 700 }, { regiao: 'Sul', nome: 'Bruno', v: 450 }, { regiao: 'Norte', nome: 'Carla', v: 1000 }, { regiao: 'Norte', nome: 'Diego', v: 250 }];
assert.deepEqual(rollup(d, ['regiao', 'nome'], 'v'), [
  { regiao: 'Norte', nome: 'Carla', total: 1000 },
  { regiao: 'Norte', nome: 'Diego', total: 250 },
  { regiao: 'Norte', nome: null, total: 1250 },
  { regiao: 'Sul', nome: 'Ana', total: 700 },
  { regiao: 'Sul', nome: 'Bruno', total: 450 },
  { regiao: 'Sul', nome: null, total: 1150 },
  { regiao: null, nome: null, total: 2400 }
]);` }, { name: 'soma linhas repetidas e uma coluna', code: R`const d = [{ p: 'A', v: 1 }, { p: 'B', v: 2 }, { p: 'A', v: 3 }];
assert.deepEqual(rollup(d, ['p'], 'v'), [{ p: 'A', total: 4 }, { p: 'B', total: 2 }, { p: null, total: 6 }]);` }, { name: 'vazio e sem colunas', code: R`assert.deepEqual(rollup([], ['p'], 'v'), [{ p: null, total: 0 }]);
assert.deepEqual(rollup([{ v: 5 }, { v: 7 }], [], 'v'), [{ total: 12 }]);` }], solution: R`function rollup(linhas, colunas, valor) {
  const out = [];
  for (let k = colunas.length; k >= 0; k--) {
    const grupos = new Map();
    for (const l of linhas) {
      const chave = JSON.stringify(colunas.slice(0, k).map((c) => l[c]));
      if (!grupos.has(chave)) {
        const base = {};
        colunas.forEach((c, i) => { base[c] = i < k ? l[c] : null; });
        grupos.set(chave, { ...base, total: 0 });
      }
      grupos.get(chave).total += l[valor];
    }
    if (k === 0 && !grupos.size) {
      const base = {};
      colunas.forEach((c) => { base[c] = null; });
      grupos.set('[]', { ...base, total: 0 });
    }
    out.push(...grupos.values());
  }
  const cmp = (x, y) => (x === null && y === null ? 0 : x === null ? 1 : y === null ? -1 : x < y ? -1 : x > y ? 1 : 0);
  return out.sort((a, b) => {
    for (const c of colunas) { const r = cmp(a[c], b[c]); if (r) return r; }
    return 0;
  });
}
`, explanation: 'O ROLLUP gera um agrupamento por prefixo da lista de colunas, do mais detalhado ao total geral. A ordenação com NULL por último reproduz o relatório medido, em que cada subtotal vem logo após seus detalhes.' }
],
'sqa-06': [
  { id: 'sqa-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Para que serve o modificador LATERAL em uma subconsulta no FROM?', options: ['Para ordenar o resultado', 'Para que a subconsulta possa referenciar colunas dos itens anteriores do FROM, sendo avaliada para cada linha', 'Para criar índices', 'Para executar em paralelo'], answer: 1, explanation: 'Medido: a maior venda de cada vendedor via CROSS JOIN LATERAL com ORDER BY e LIMIT 1.' },
  { id: 'sqa-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Em dados com valores extremos, a mediana costuma descrever melhor o "valor típico" do que a média.', answer: true, explanation: 'A mediana é resistente a extremos (medido: mediana 200 e média 218,18 nas vendas do laboratório).' },
  { id: 'sqa-06-e3', type: 'trace', difficulty: 3, points: 10, prompt: 'Dias de acesso do usuário 1: 03-01, 03-02, 03-03, 03-07, 03-08. O padrão de ilhas calcula dia − row_number().', code: 'dia      rn  grp(dia-rn)\n03-01    1   02-28\n03-02    2   02-28\n03-03    3   02-28\n03-07    4   03-03\n03-08    5   03-03', lang: 'text', steps: [{ q: 'Quantas ilhas (sequências) existem?', answers: ['2'] }, { q: 'Quantos dias tem a segunda ilha?', answers: ['2'] }], explanation: 'Medido: 03-01 a 03-03 (3 dias) e 03-07 a 03-08 (2 dias).' },
  { id: 'sqa-06-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que pode somar texto como se fosse número.', code: 'SELECT usuario,\n       sum(dados->>\'valor\') AS total\nFROM eventos\nGROUP BY usuario;', answer: 2, explanation: '->> devolve texto; converta com (dados->>\'valor\')::numeric antes de somar.' },
  { id: 'sqa-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando usar uma coluna JSONB e quando usar colunas normais em uma tabela? Dê critérios e um exemplo de cada.', model: 'JSONB serve para atributos variáveis ou opcionais, payloads de eventos de terceiros e dados cuja estrutura muda com frequência (por exemplo, o corpo de um webhook). Colunas normais servem para dados estruturados que são filtrados, juntados, validados e agregados com frequência (por exemplo, valor, data e status de um pedido), pois permitem tipos, constraints, chaves estrangeiras e índices comuns. Critérios: estabilidade do esquema, necessidade de integridade, padrão de consulta, desempenho e facilidade de manutenção. Uma abordagem híbrida (colunas para o que é consultado e um JSONB para o restante) é comum.', rubric: ['Dá critérios de estabilidade do esquema e integridade', 'Cita padrões de consulta e índices', 'Dá exemplos plausíveis de cada caso', 'Menciona a abordagem híbrida'], explanation: 'JSONB é uma ferramenta, não substituto do modelo relacional.' },
  { id: 'sqa-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o padrão de **ilhas**. Implemente §ilhas(dias)§: §dias§ é uma lista de datas §"AAAA-MM-DD"§ (pode ter repetições e estar fora de ordem). Ordene, remova repetições e agrupe em **sequências de dias consecutivos**. Devolva uma lista de §{ inicio, fim, dias }§ em ordem cronológica, onde §dias§ é a quantidade de dias da sequência. Lista vazia devolve §[]§. (Use §Date.UTC§ para converter datas em números de dia.)', lang: 'javascript', starter: 'function ilhas(dias) {\n  // seu código aqui\n}\n', hints: ['Converta cada data para um número de dia (milissegundos / 86400000).', 'Duas datas são consecutivas se a diferença for 1.', 'Percorra a lista ordenada abrindo uma nova ilha quando houver salto.'], tests: [{ name: 'duas ilhas', code: R`assert.deepEqual(ilhas(['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-07', '2026-03-08']), [{ inicio: '2026-03-01', fim: '2026-03-03', dias: 3 }, { inicio: '2026-03-07', fim: '2026-03-08', dias: 2 }]);` }, { name: 'desordenado, repetido e virada de mês', code: R`assert.deepEqual(ilhas(['2026-03-02', '2026-02-28', '2026-03-01', '2026-03-01', '2026-03-05']), [{ inicio: '2026-02-28', fim: '2026-03-02', dias: 3 }, { inicio: '2026-03-05', fim: '2026-03-05', dias: 1 }]);` }, { name: 'vazio e um dia', code: R`assert.deepEqual(ilhas([]), []);
assert.deepEqual(ilhas(['2026-12-31', '2027-01-01']), [{ inicio: '2026-12-31', fim: '2027-01-01', dias: 2 }]);` }], solution: R`function ilhas(dias) {
  const num = (s) => { const [a, m, d] = s.split('-').map(Number); return Date.UTC(a, m - 1, d) / 86400000; };
  const unicos = [...new Set(dias)].sort();
  const out = [];
  for (const s of unicos) {
    const ult = out[out.length - 1];
    if (ult && num(s) - num(ult.fim) === 1) { ult.fim = s; ult.dias++; }
    else out.push({ inicio: s, fim: s, dias: 1 });
  }
  return out;
}
`, explanation: 'A ideia é a mesma do SQL: sequências consecutivas formam blocos. No banco usa-se data menos row_number para dar um mesmo código a cada bloco; aqui a comparação com o dia anterior faz o mesmo trabalho.' },
  { id: 'sqa-06-e7', type: 'code', difficulty: 3, points: 25, prompt: 'Modele as estatísticas de conjunto ordenado. Implemente §mediana(valores)§ (como §percentile_cont(0.5)§: com número ímpar de valores, o do meio; com par, a **média dos dois do meio**), §moda(valores)§ (o valor mais frequente; em **empate, o menor**) e §media(valores)§. Listas vazias devolvem §null§ nas três funções. Não altere o array de entrada.', lang: 'javascript', starter: 'function mediana(valores) {\n  // seu código aqui\n}\nfunction moda(valores) {\n}\nfunction media(valores) {\n}\n', hints: ['Ordene uma cópia numérica para a mediana.', 'Conte frequências com um Map.', 'Em empate de frequência, escolha o menor valor.'], tests: [{ name: 'mediana', code: R`assert.equal(mediana([300, 100, 200]), 200);
assert.equal(mediana([1, 2, 3, 4]), 2.5);
assert.equal(mediana([7]), 7);
assert.equal(mediana([]), null);` }, { name: 'média e moda', code: R`assert.equal(media([100, 150, 150, 300]), 175);
assert.equal(media([]), null);
assert.equal(moda([1, 2, 2, 3, 3]), 2);
assert.equal(moda(['A', 'B', 'A']), 'A');
assert.equal(moda([]), null);` }, { name: 'extremos e imutabilidade', code: R`const v = [10, 20, 30, 40, 5000];
const copia = JSON.stringify(v);
assert.equal(mediana(v), 30);
assert.equal(media(v), 1020);
assert.equal(JSON.stringify(v), copia);` }], solution: R`function mediana(valores) {
  if (!valores.length) return null;
  const o = valores.slice().sort((a, b) => a - b);
  const m = o.length >> 1;
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}
function moda(valores) {
  if (!valores.length) return null;
  const f = new Map();
  valores.forEach((v) => f.set(v, (f.get(v) || 0) + 1));
  let melhor = null, n = 0;
  for (const [v, c] of f) if (c > n || (c === n && v < melhor)) { melhor = v; n = c; }
  return melhor;
}
function media(valores) {
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
}
`, explanation: 'No exemplo com um valor extremo (5000), a mediana continua em 30 e a média sobe para 1020: é por isso que a mediana descreve melhor o valor típico. A moda é o valor mais frequente (mode() no PostgreSQL).' }
]
};

const P = 'sql-avancado-p';
export const assessment = {
  id: 'sql-avancado', title: 'Avaliação final — SQL avançado e analítico', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que uma função de janela faz que o GROUP BY não faz?', options: ['Ordena os dados', 'Mantém cada linha e acrescenta um valor calculado sobre um conjunto de linhas relacionadas', 'Cria índices', 'Remove duplicatas'], answer: 1, explanation: 'OVER preserva as linhas detalhadas.' },
    { id: P + '2', type: 'trace', difficulty: 2, points: 10, prompt: 'Valores 100, 150, 150, 300 em ordem crescente.', code: 'sum(v) OVER (ORDER BY v)                         -- padrão (RANGE)\nsum(v) OVER (ORDER BY v ROWS UNBOUNDED PRECEDING) -- ROWS', lang: 'sql', steps: [{ q: 'Qual o valor da primeira expressão na linha do primeiro 150?', answers: ['400'] }, { q: 'Qual o valor da segunda expressão na mesma linha?', answers: ['250'] }], explanation: 'Medido: RANGE soma os empatados juntos; ROWS acumula linha a linha.' },
    { id: P + '3', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual consulta devolve as 2 maiores vendas de cada vendedor?', options: ['SELECT ... GROUP BY vendedor_id LIMIT 2', 'Subconsulta com row_number() OVER (PARTITION BY vendedor_id ORDER BY valor DESC) e filtro rn <= 2 por fora', 'SELECT ... ORDER BY valor DESC LIMIT 2', 'SELECT DISTINCT valor'], answer: 1, explanation: 'É o padrão Top-N por grupo.' },
    { id: P + '4', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma view materializada reflete automaticamente toda inserção feita nas tabelas de base.', answer: false, explanation: 'Medido: após o insert ela continuou com 1.250 até o REFRESH, enquanto a view comum mostrou 2.250.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que faz a consulta devolver o próprio valor da linha atual em vez do último valor da partição.', code: 'SELECT data, valor,\n       last_value(valor) OVER (\n         PARTITION BY vendedor_id\n         ORDER BY data\n       ) AS ultima\nFROM vendas;', answer: 4, explanation: 'Falta declarar o frame até UNBOUNDED FOLLOWING: o padrão termina na linha atual.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para gerar subtotais por região e o total geral.', code: 'SELECT regiao, sum(valor)\nFROM vendas_regiao\nGROUP BY [[0]] (regiao)\nORDER BY [[1]];', answers: [['ROLLUP'], ['regiao', '1']], explanation: 'ROLLUP acrescenta o total geral (regiao NULL); o ORDER BY define a apresentação (medido: Norte, Sul, TOTAL com coalesce).' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o problema à técnica.', pairs: [['Mostrar meses sem vendas em uma série', 'generate_series com LEFT JOIN'], ['Maior venda de cada vendedor com todos os dados dela', 'CROSS JOIN LATERAL com ORDER BY e LIMIT 1'], ['Dias consecutivos de acesso', 'Padrão de ilhas'], ['Valor típico resistente a extremos', 'Mediana (percentile_cont)']], explanation: 'São os padrões centrais do curso.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Uma procedure chamada com CALL lança RAISE EXCEPTION depois de inserir em uma tabela. O que acontece com essa inserção?', options: ['Permanece gravada', 'É desfeita junto com o restante da chamada', 'Fica pendente até um COMMIT manual', 'Vira um log'], answer: 1, explanation: 'Medido: a venda 21 não foi criada quando a validação falhou.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'É boa prática concentrar todo o fluxo principal de negócio em triggers, já que eles disparam automaticamente.', answer: false, explanation: 'Triggers escondem lógica e dificultam testes e depuração; use-os para invariantes e auditoria.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Cenário: um relatório mensal deve mostrar subtotal por região, total geral e todos os meses (inclusive sem vendas). Qual combinação é a mais adequada?', options: ['GROUP BY simples e ajustes manuais na planilha', 'generate_series para o calendário, LEFT JOIN com os totais por mês e região e ROLLUP para subtotais, rotulando com grouping()', 'Uma view com SELECT * sobre as tabelas', 'Um trigger em cada venda'], answer: 1, explanation: 'Calendário + junção + ROLLUP + rotulagem cobrem os requisitos em uma consulta.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Explique, com suas palavras, a diferença entre ROWS e RANGE em um frame de janela, dando um exemplo com empates.', model: 'ROWS conta linhas físicas: o frame termina exatamente na linha atual. RANGE trabalha por valor da chave do ORDER BY: o frame inclui todas as linhas "pares" (empatadas) da linha atual. Com valores 100, 150, 150 e 300 e sum(valor) OVER (ORDER BY valor), RANGE dá 100, 400, 400 e 700, porque as duas linhas de 150 são pares e somam juntas; com ROWS UNBOUNDED PRECEDING o resultado é 100, 250, 400 e 700. O frame padrão com ORDER BY é RANGE, o que surpreende em acumulados com empates e em last_value.', rubric: ['Define ROWS como linhas físicas', 'Define RANGE com pares empatados', 'Dá o exemplo numérico correto', 'Cita que o padrão é RANGE'], explanation: 'É um dos pontos mais cobrados sobre janelas.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Uma coluna JSONB guarda atributos de produtos, e a equipe filtra com frequência por categoria e preço, juntando com outras tabelas. Qual a melhor decisão?', options: ['Manter tudo em JSONB', 'Extrair categoria e preço para colunas normais com tipos e constraints e manter o resto em JSONB', 'Trocar JSONB por texto', 'Criar uma view com SELECT *'], answer: 1, explanation: 'Dados consultados e juntados com frequência merecem colunas tipadas; o JSONB cobre os atributos variáveis.' }
  ]
};

export const project = {
  id: 'painel-analitico', name: 'Painel analítico de vendas: janelas, views, rotinas e relatórios com subtotais', lv: 'A', stack: 'PostgreSQL 17, psql e Node.js (opcional)', ds: ['sql'],
  desc: 'Construa um **painel analítico** sobre um esquema de vendas (vendedores, produtos, vendas e eventos de uso em JSONB): **rankings e Top-N** com funções de janela, **variações e acumulados** (lag e frames), **views** (comum e materializada) como camada de publicação, uma **procedure** de registro de venda com validação e trigger de auditoria, **relatórios com ROLLUP/CUBE** e calendário sem buracos, e **análises de comportamento** (ilhas e coortes) em dados JSONB. Entregue os scripts versionados, a saída esperada e as conferências de totais.',
  rf: ['Ranking por vendedor e por região (rank e dense_rank) e as 3 maiores vendas de cada vendedor', 'Série mensal com variação em relação ao mês anterior (lag), acumulado no ano e média móvel de 3 meses, com calendário sem buracos', 'View comum com o resumo por vendedor e view materializada com o total por região e produto, com script de REFRESH documentado', 'Procedure registrar_venda com validação (valor positivo, vendedor existente), gravação em duas tabelas e trigger de auditoria, com teste de falha que prova o desfazer', 'Relatório com ROLLUP por região e vendedor, rotulado com grouping(), e tabela cruzada de produto por mês com FILTER', 'Análise de eventos JSONB: contagem por tipo, sequências de dias de acesso (ilhas) e coorte mensal de entrada'],
  rnf: ['Nenhum SELECT * em views', 'Janelas nomeadas quando reutilizadas', 'Consultas conferidas por totais de controle (soma do ROLLUP igual ao total simples)', 'Scripts idempotentes e versionados', 'README com granularidade de cada relatório, frequência de REFRESH e limitações'],
  ac: ['O total geral do ROLLUP coincide com a soma simples da tabela de vendas', 'O acumulado do último mês coincide com o total do ano', 'A chamada da procedure com valor inválido não grava nada em nenhuma tabela', 'A view materializada é mostrada desatualizada após uma carga e atualizada após o REFRESH', 'As sequências de ilhas e a coorte são verificadas com dados de teste pequenos e casos de borda'],
  ch: ['Adicionar um índice e comparar o plano de uma janela com EXPLAIN', 'Implementar o REFRESH CONCURRENTLY com índice único', 'Adicionar retenção por coorte (fração de usuários ativos nos meses seguintes)', 'Criar uma versão do relatório em MySQL e listar as diferenças de sintaxe', 'Aplicar row-level security para que cada região veja só suas vendas']
};
