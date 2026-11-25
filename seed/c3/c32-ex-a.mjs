// C3.2 — SQL avançado e analítico: exercícios das aulas 1 a 3.
// O SQL real foi executado no PostgreSQL 17 (laboratório); os desafios "code" (JavaScript) modelam a lógica das janelas e das views.
const R = String.raw;

export const exsetsA = {
'sqa-01': [
  { id: 'sqa-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual a principal diferença entre uma agregação com GROUP BY e uma função de janela com OVER?', options: ['A função de janela é mais lenta sempre', 'GROUP BY colapsa as linhas de cada grupo; a função de janela preserva cada linha e acrescenta um valor calculado', 'A função de janela só funciona com texto', 'GROUP BY mantém as linhas detalhadas'], answer: 1, explanation: 'Medido: sum(valor) OVER () repetiu 2400,00 em cada linha, sem colapsar a tabela.' },
  { id: 'sqa-01-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Valores ordenados de forma decrescente: 500, 400, 300, 250, 200, 200, 150, 150.', code: 'rank()       OVER (ORDER BY valor DESC)\ndense_rank() OVER (ORDER BY valor DESC)', lang: 'sql', steps: [{ q: 'Qual o rank do primeiro 150?', answers: ['7'] }, { q: 'Qual o dense_rank do primeiro 150?', answers: ['6'] }, { q: 'Qual o rank do segundo 200?', answers: ['5'] }], explanation: 'Medido: rank pula depois do empate (5, 5, 7); dense_rank não (5, 5, 6).' },
  { id: 'sqa-01-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede a consulta de funcionar.', code: 'SELECT id, valor\nFROM vendas\nWHERE row_number() OVER (ORDER BY valor DESC) <= 3;', answer: 3, explanation: 'Funções de janela não são permitidas no WHERE (medido: window functions are not allowed in WHERE). Use uma subconsulta ou CTE e filtre fora.' },
  { id: 'sqa-01-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o ranking de vendedores dentro de cada região, do maior total ao menor.', code: 'rank() OVER ([[0]] BY regiao [[1]] BY total DESC)', answers: [['PARTITION'], ['ORDER']], explanation: 'PARTITION BY reinicia o ranking em cada região; ORDER BY define a ordem dentro da partição.' },
  { id: 'sqa-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique como obter as 3 maiores vendas de cada vendedor e discuta a diferença entre usar row_number, rank e dense_rank nesse caso quando há empates.', model: 'Usa-se uma subconsulta (ou CTE) que calcula row_number() OVER (PARTITION BY vendedor_id ORDER BY valor DESC, id) e, por fora, filtra rn <= 3. Com row_number, sempre saem exatamente até 3 linhas por vendedor, e o desempate depende do critério único colocado no ORDER BY. Com rank ou dense_rank, empates têm a mesma posição e o filtro pode devolver mais de 3 linhas por vendedor; dense_rank inclui todos os valores distintos até a terceira posição, enquanto rank pode excluir posições após empates. A escolha depende da regra de negócio: "até 3 linhas" ou "até a 3ª posição, incluindo empatados".', rubric: ['Descreve a subconsulta com PARTITION BY e filtro externo', 'Explica que row_number sempre devolve até N linhas', 'Explica que rank e dense_rank podem devolver mais linhas com empates', 'Relaciona a escolha à regra de negócio'], explanation: 'O desempate é decisão de negócio.' },
  { id: 'sqa-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele as funções de **ranking**. Implemente §ranking(linhas, opcoes)§ com §opcoes§ = §{ valor, grupo }§ (§valor§ é o nome da coluna usada para ordenar, em ordem **decrescente**; §grupo§ é opcional e define as partições). Devolva **novos objetos** (sem alterar os originais) com os campos acrescentados §rn§ (row_number: sequencial, desempatando pela ordem original), §rk§ (rank: empatados têm a mesma posição e a próxima pula) e §dr§ (dense_rank: empatados iguais, sem pular). A numeração **reinicia** em cada grupo. A saída vem ordenada por grupo (crescente, na ordem natural dos valores) e depois pela ordem do ranking; sem §grupo§, há uma só partição.', lang: 'javascript', starter: 'function ranking(linhas, opcoes) {\n  // seu código aqui\n}\n', hints: ['Separe as linhas por grupo e ordene cada partição por valor decrescente (estável).', 'Percorra a partição mantendo a posição do primeiro elemento de cada empate (rk) e o contador de valores distintos (dr).', 'Crie novos objetos com spread.'], tests: [{ name: 'empates', code: R`const v = [500, 400, 300, 250, 200, 200, 150, 150].map((valor, i) => ({ id: i + 1, valor }));
const r = ranking(v, { valor: 'valor' });
assert.deepEqual(r.map((x) => x.rn), [1, 2, 3, 4, 5, 6, 7, 8]);
assert.deepEqual(r.map((x) => x.rk), [1, 2, 3, 4, 5, 5, 7, 7]);
assert.deepEqual(r.map((x) => x.dr), [1, 2, 3, 4, 5, 5, 6, 6]);` }, { name: 'partições e desempate pela ordem original', code: R`const d = [{ n: 'Ana', reg: 'Sul', t: 700 }, { n: 'Bruno', reg: 'Sul', t: 450 }, { n: 'Carla', reg: 'Norte', t: 1000 }, { n: 'Diego', reg: 'Norte', t: 250 }];
const r = ranking(d, { valor: 't', grupo: 'reg' });
assert.deepEqual(r.map((x) => x.n + x.rk), ['Carla1', 'Diego2', 'Ana1', 'Bruno2']);
const e = ranking([{ id: 'a', v: 10 }, { id: 'b', v: 10 }], { valor: 'v' });
assert.deepEqual(e.map((x) => x.id + x.rn + x.rk), ['a11', 'b21']);` }, { name: 'não altera a entrada', code: R`const d = [{ v: 1 }, { v: 2 }];
const copia = JSON.stringify(d);
const r = ranking(d, { valor: 'v' });
assert.equal(JSON.stringify(d), copia);
assert.deepEqual(r.map((x) => x.v), [2, 1]);
assert.deepEqual(ranking([], { valor: 'v' }), []);` }], solution: R`function ranking(linhas, opcoes) {
  const { valor, grupo } = opcoes;
  const grupos = new Map();
  linhas.forEach((l, i) => {
    const g = grupo === undefined ? '' : l[grupo];
    if (!grupos.has(g)) grupos.set(g, []);
    grupos.get(g).push({ l, i });
  });
  const chaves = [...grupos.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const out = [];
  for (const g of chaves) {
    const p = grupos.get(g).slice().sort((a, b) => b.l[valor] - a.l[valor] || a.i - b.i);
    let rk = 0, dr = 0, anterior;
    p.forEach(({ l }, k) => {
      if (k === 0 || l[valor] !== anterior) { rk = k + 1; dr++; }
      anterior = l[valor];
      out.push({ ...l, rn: k + 1, rk, dr });
    });
  }
  return out;
}
`, explanation: 'O modelo reproduz o comportamento medido: row_number é sequencial, rank salta depois do empate (5, 5, 7) e dense_rank não (5, 5, 6), com reinício a cada partição.' }
],
'sqa-02': [
  { id: 'sqa-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual o frame padrão de uma função de janela com ORDER BY e sem cláusula de frame?', options: ['ROWS BETWEEN 1 PRECEDING AND CURRENT ROW', 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING', 'Somente a linha atual'], answer: 1, explanation: 'Por isso last_value devolve a linha atual e o acumulado com RANGE soma linhas empatadas juntas.' },
  { id: 'sqa-02-e2', type: 'trace', difficulty: 3, points: 10, prompt: 'Vendas da Ana ordenadas por valor: 100, 150, 150, 300.', code: 'sum(valor) OVER (ORDER BY valor)                          -- A\nsum(valor) OVER (ORDER BY valor ROWS UNBOUNDED PRECEDING)  -- B', lang: 'sql', steps: [{ q: 'Quanto vale A na segunda linha (primeiro 150)?', answers: ['400'] }, { q: 'Quanto vale B na segunda linha?', answers: ['250'] }, { q: 'Quanto vale B na terceira linha?', answers: ['400'] }], explanation: 'Medido: RANGE soma os empatados juntos (400, 400); ROWS acumula linha a linha (250, 400).' },
  { id: 'sqa-02-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'lag(valor) OVER (ORDER BY data) devolve NULL na primeira linha da partição.', answer: true, explanation: 'Não existe linha anterior; o valor padrão pode ser informado como terceiro argumento.' },
  { id: 'sqa-02-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede last_value de devolver o último valor da partição.', code: 'SELECT data, valor,\n       last_value(valor) OVER (\n         ORDER BY data\n       ) AS ultima\nFROM vendas;', answer: 3, explanation: 'Com o frame padrão (até a linha atual), last_value devolve a própria linha. Declare ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.' },
  { id: 'sqa-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma série de vendas diárias tem dias sem venda. Explique por que uma média móvel de "7 linhas" não é uma média de 7 dias e como corrigir.', model: 'Com ROWS BETWEEN 6 PRECEDING AND CURRENT ROW, a janela conta linhas, não dias: se faltam dias sem venda, as 7 linhas anteriores podem cobrir mais de 7 dias de calendário. Para corrigir, gerar o calendário com generate_series, juntar com LEFT JOIN usando coalesce(valor, 0) para ter uma linha por dia e só então aplicar ROWS; ou usar RANGE BETWEEN INTERVAL \'6 days\' PRECEDING AND CURRENT ROW sobre a coluna de data, que trabalha por valor. Também convém documentar se os dias sem venda contam como zero ou são ignorados.', rubric: ['Explica que ROWS conta linhas e não dias', 'Propõe o calendário completo com generate_series e LEFT JOIN', 'Cita RANGE com INTERVAL como alternativa', 'Comenta o tratamento de dias sem venda'], explanation: 'Linhas e tempo são coisas diferentes em séries esparsas.' },
  { id: 'sqa-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele **lag**, **acumulado** e **frames**. Implemente §janela(linhas, opcoes)§ com §opcoes§ = §{ ordem, valor, modo }§: ordene as linhas (de forma estável) por §ordem§ crescente e devolva, para cada linha, um objeto §{ ordem, valor, anterior, acumulado }§ onde §anterior§ é o §valor§ da linha anterior (ou §null§ na primeira) e §acumulado§ é a soma de §valor§ de acordo com §modo§: §"rows"§ soma da primeira linha até a atual; §"range"§ (padrão do SQL) soma da primeira linha até a **última linha empatada** com a atual na chave §ordem§. Modo inválido lança §Error("modo inválido: MODO")§.', lang: 'javascript', starter: 'function janela(linhas, opcoes) {\n  // seu código aqui\n}\n', hints: ['Ordene uma cópia com índice para manter a estabilidade.', 'Calcule as somas prefixo e, em range, avance até o fim do bloco de empatados.', 'anterior vem do elemento anterior na ordem.'], tests: [{ name: 'rows e range com empates', code: R`const d = [{ id: 4, v: 300 }, { id: 1, v: 100 }, { id: 2, v: 150 }, { id: 3, v: 150 }];
const rows = janela(d, { ordem: 'v', valor: 'v', modo: 'rows' });
assert.deepEqual(rows.map((x) => x.acumulado), [100, 250, 400, 700]);
const range = janela(d, { ordem: 'v', valor: 'v', modo: 'range' });
assert.deepEqual(range.map((x) => x.acumulado), [100, 400, 400, 700]);` }, { name: 'lag por data', code: R`const d = [{ data: '2026-02-03', v: 150 }, { data: '2026-01-05', v: 100 }, { data: '2026-01-20', v: 150 }, { data: '2026-03-10', v: 300 }];
const r = janela(d, { ordem: 'data', valor: 'v', modo: 'range' });
assert.deepEqual(r.map((x) => x.anterior), [null, 100, 150, 150]);
assert.deepEqual(r.map((x) => x.acumulado), [100, 250, 400, 700]);
assert.deepEqual(r.map((x) => x.ordem), ['2026-01-05', '2026-01-20', '2026-02-03', '2026-03-10']);` }, { name: 'modo inválido e vazio', code: R`assert.throws(() => janela([{ a: 1 }], { ordem: 'a', valor: 'a', modo: 'groups' }), 'modo inválido: groups');
assert.deepEqual(janela([], { ordem: 'a', valor: 'a', modo: 'rows' }), []);` }], solution: R`function janela(linhas, opcoes) {
  const { ordem, valor, modo } = opcoes;
  if (modo !== 'rows' && modo !== 'range') throw new Error('modo inválido: ' + modo);
  const o = linhas.map((l, i) => ({ l, i })).sort((a, b) => (a.l[ordem] < b.l[ordem] ? -1 : a.l[ordem] > b.l[ordem] ? 1 : a.i - b.i)).map((x) => x.l);
  const prefixo = [];
  let soma = 0;
  o.forEach((l) => { soma += l[valor]; prefixo.push(soma); });
  return o.map((l, k) => {
    let fim = k;
    if (modo === 'range') while (fim + 1 < o.length && o[fim + 1][ordem] === l[ordem]) fim++;
    return { ordem: l[ordem], valor: l[valor], anterior: k === 0 ? null : o[k - 1][valor], acumulado: prefixo[fim] };
  });
}
`, explanation: 'O modelo mostra a diferença central: ROWS acumula linha a linha, enquanto RANGE inclui todos os pares (empatados) da linha atual. Por isso um acumulado "por valor" com empates mostra o mesmo número nas linhas empatadas.' }
],
'sqa-03': [
  { id: 'sqa-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Depois de inserir uma venda nova, o que cada objeto mostra para o total do Norte (antes: 1.250; venda nova: 1.000)?', options: ['Ambos 2.250 imediatamente', 'View comum 2.250; view materializada 1.250 até o REFRESH', 'View comum 1.250; view materializada 2.250', 'Ambos 1.250 até reiniciar o servidor'], answer: 1, explanation: 'Medido: a view comum reescreve a consulta e vê os dados atuais; a materializada guarda o resultado antigo até o REFRESH.' },
  { id: 'sqa-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma view com GROUP BY aceita UPDATE automaticamente, repassando a alteração às linhas de base.', answer: false, explanation: 'Medido: cannot update view ... Views containing GROUP BY are not automatically updatable. Seria preciso um trigger INSTEAD OF.' },
  { id: 'sqa-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade ao objeto mais adequado.', pairs: [['Nomear etapas dentro de uma única consulta', 'CTE'], ['Consulta reutilizada que deve refletir sempre os dados atuais', 'View comum'], ['Relatório caro que tolera atraso e precisa de índices', 'View materializada'], ['Impedir inserir pela view linhas que ela não enxerga', 'WITH CHECK OPTION']], explanation: 'Cada objeto tem escopo e custo diferentes.' },
  { id: 'sqa-03-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a atualização da view materializada sem bloquear leituras (supondo um índice único).', code: '[[0]] MATERIALIZED VIEW [[1]] mv_total_regiao;', answers: [['REFRESH'], ['CONCURRENTLY']], explanation: 'REFRESH MATERIALIZED VIEW CONCURRENTLY exige um índice único na view.' },
  { id: 'sqa-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma equipe quer usar uma view como única barreira de segurança para esconder colunas sensíveis. Que cuidados e alternativas você apresentaria?', model: 'Views ajudam a expor só colunas e linhas permitidas via GRANT na view e não nas tabelas, mas há cuidados: a view roda com as permissões do dono por padrão, funções com efeitos colaterais podem vazar dados antes do filtro (por isso existe security_barrier), e SELECT * em views congela colunas. É preciso testar com um papel real, revogar acesso às tabelas e documentar. Alternativas e complementos: row-level security (políticas por linha), papéis com menor privilégio, colunas criptografadas ou mascaradas e auditoria.', rubric: ['Explica o uso de GRANT na view e não na tabela', 'Cita o dono da view e o risco de vazamento (security_barrier)', 'Cita row-level security ou papéis como complemento', 'Recomenda testar com papéis reais'], explanation: 'A view é uma camada útil, mas não substitui um desenho de permissões.' },
  { id: 'sqa-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele **view**, **view materializada** e **WITH CHECK OPTION**. Implemente: §criarView(fonte, calcular)§ → objeto com §ler()§ que **sempre** chama §calcular(fonte())§; §criarMaterializada(fonte, calcular)§ → objeto com §ler()§ que devolve o resultado **guardado na criação** e §refresh()§ que o recalcula (e devolve o novo valor); §inserirPelaView(tabela, linha, predicado)§ → devolve uma **nova tabela** com a linha acrescentada se §predicado(linha)§ for verdadeiro, senão lança §Error("new row violates check option")§. §fonte§ é uma função sem argumentos que devolve os dados atuais.', lang: 'javascript', starter: 'function criarView(fonte, calcular) {\n  // seu código aqui\n}\nfunction criarMaterializada(fonte, calcular) {\n}\nfunction inserirPelaView(tabela, linha, predicado) {\n}\n', hints: ['A view chama calcular(fonte()) a cada leitura.', 'A materializada guarda o resultado em uma variável do closure.', 'inserirPelaView não deve alterar a tabela original.'], tests: [{ name: 'view sempre atual, materializada só no refresh', code: R`let dados = [1, 2];
const soma = (d) => d.reduce((a, b) => a + b, 0);
const v = criarView(() => dados, soma);
const mv = criarMaterializada(() => dados, soma);
assert.equal(v.ler(), 3);
assert.equal(mv.ler(), 3);
dados = [1, 2, 1000];
assert.equal(v.ler(), 1003);
assert.equal(mv.ler(), 3);
assert.equal(mv.refresh(), 1003);
assert.equal(mv.ler(), 1003);` }, { name: 'a materializada guarda o resultado, não a referência', code: R`const dados = [5];
let chamadas = 0;
const mv = criarMaterializada(() => dados, (d) => { chamadas++; return d.length; });
mv.ler(); mv.ler();
assert.equal(chamadas, 1);
dados.push(6);
assert.equal(mv.ler(), 1);
mv.refresh();
assert.equal(chamadas, 2);
assert.equal(mv.ler(), 2);` }, { name: 'check option', code: R`const t = [{ id: 1, regiao: 'Sul' }];
const ok = inserirPelaView(t, { id: 9, regiao: 'Sul' }, (l) => l.regiao === 'Sul');
assert.equal(ok.length, 2);
assert.equal(t.length, 1);
assert.throws(() => inserirPelaView(t, { id: 9, regiao: 'Norte' }, (l) => l.regiao === 'Sul'), 'new row violates check option');` }], solution: R`function criarView(fonte, calcular) {
  return { ler: () => calcular(fonte()) };
}
function criarMaterializada(fonte, calcular) {
  let guardado = calcular(fonte());
  return {
    ler: () => guardado,
    refresh() { guardado = calcular(fonte()); return guardado; }
  };
}
function inserirPelaView(tabela, linha, predicado) {
  if (!predicado(linha)) throw new Error('new row violates check option');
  return [...tabela, linha];
}
`, explanation: 'A view comum recalcula a cada leitura (sempre atual); a materializada guarda o resultado e só muda no refresh; o CHECK OPTION recusa linhas que a view não enxergaria.' }
]
};
