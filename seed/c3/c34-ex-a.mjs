// C3.4 — Modelagem de dados: exercícios das aulas 1 a 3.
// O SQL real foi executado no PostgreSQL 17 (laboratório); os desafios "code" (JavaScript) modelam a lógica de modelagem.
const R = String.raw;

export const exsetsA = {
'mod-01': [
  { id: 'mod-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em um relacionamento 1:N (um cliente faz muitos pedidos), onde fica a chave estrangeira?', options: ['Na tabela clientes', 'Na tabela pedidos', 'Em uma terceira tabela obrigatória', 'Nas duas tabelas'], answer: 1, explanation: 'A chave estrangeira fica no lado N (pedidos.cliente_id).' },
  { id: 'mod-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Guardar o preço cobrado em cada item do pedido (e não apenas uma referência ao preço atual do produto) preserva o histórico.', answer: true, explanation: 'O preço do produto muda; o item guarda o preço cobrado.' },
  { id: 'mod-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a regra de negócio à restrição.', pairs: [['Todo pedido tem cliente', 'NOT NULL na chave estrangeira'], ['O e-mail identifica a pessoa e não pode repetir', 'UNIQUE NOT NULL'], ['O mesmo produto não aparece duas vezes no mesmo pedido', 'Chave primária composta (pedido, produto)'], ['O preço não pode ser negativo', 'CHECK (preco >= 0)']], explanation: 'Regras sempre válidas pertencem ao banco.' },
  { id: 'mod-01-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que usa uma chave natural mutável como chave primária.', code: 'CREATE TABLE clientes (\n  email text PRIMARY KEY,\n  nome text NOT NULL\n);\nCREATE TABLE pedidos (id serial PRIMARY KEY, cliente_email text REFERENCES clientes(email));', answer: 2, explanation: 'E-mails mudam; como chave primária, a mudança se propaga a todas as chaves estrangeiras. Use um id substituto e declare o e-mail UNIQUE NOT NULL.' },
  { id: 'mod-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'A partir do texto "Cada professor leciona várias turmas; cada turma tem vários alunos; um aluno pode estar em várias turmas e cada matrícula tem uma nota", liste entidades, relacionamentos e cardinalidades e esboce as tabelas.', model: 'Entidades: professor, turma, aluno. Relacionamentos: professor leciona turma (1:N: a chave estrangeira professor_id fica em turmas); aluno cursa turma (N:N, resolvido pela tabela de ligação matriculas(aluno_id, turma_id, nota) com chave primária composta, a nota é atributo do par). Tabelas: professores(id, nome), turmas(id, professor_id NOT NULL, ...), alunos(id, nome), matriculas(aluno_id, turma_id, nota, PRIMARY KEY (aluno_id, turma_id)). Regras: nota entre 0 e 10 (CHECK); dúvidas a levantar com o negócio: uma turma pode ter mais de um professor? Um professor pode ficar sem turma?', rubric: ['Identifica as três entidades', 'Classifica corretamente 1:N e N:N', 'Usa tabela de ligação com atributo nota', 'Levanta perguntas de participação ou regras'], explanation: 'Do texto ao modelo: substantivos, verbos e regras.' },
  { id: 'mod-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §traduzir(rel)§, que traduz um relacionamento em estruturas de tabelas. §rel§ = §{ tipo, a, b, obrigatorio }§ (nomes de tabelas no singular, como §"cliente"§ e §"pedido"§). Para §tipo === "1:N"§ (um §a§ tem muitos §b§): devolva §{ chaveEstrangeira: { tabela: b, coluna: a + "_id", referencia: a, naoNula: !!obrigatorio, unica: false } }§. Para §"1:1"§: o mesmo, mas com §unica: true§ (a chave estrangeira fica em §b§). Para §"N:N"§: devolva §{ ligacao: { tabela: a + "_" + b, colunas: [a + "_id", b + "_id"], chavePrimaria: [a + "_id", b + "_id"] } }§. Tipo inválido lança §Error("tipo inválido: T")§. As chaves dos objetos devem estar na ordem descrita.', lang: 'javascript', starter: 'function traduzir(rel) {\n  // seu código aqui\n}\n', hints: ['Use um switch no tipo.', 'Cuidado com a ordem das chaves nos objetos (deepEqual compara o JSON).'], tests: [{ name: '1:N e 1:1', code: R`assert.deepEqual(traduzir({ tipo: '1:N', a: 'cliente', b: 'pedido', obrigatorio: true }), { chaveEstrangeira: { tabela: 'pedido', coluna: 'cliente_id', referencia: 'cliente', naoNula: true, unica: false } });
assert.deepEqual(traduzir({ tipo: '1:N', a: 'cliente', b: 'pedido' }), { chaveEstrangeira: { tabela: 'pedido', coluna: 'cliente_id', referencia: 'cliente', naoNula: false, unica: false } });
assert.deepEqual(traduzir({ tipo: '1:1', a: 'usuario', b: 'perfil', obrigatorio: true }), { chaveEstrangeira: { tabela: 'perfil', coluna: 'usuario_id', referencia: 'usuario', naoNula: true, unica: true } });` }, { name: 'N:N', code: R`assert.deepEqual(traduzir({ tipo: 'N:N', a: 'aluno', b: 'curso' }), { ligacao: { tabela: 'aluno_curso', colunas: ['aluno_id', 'curso_id'], chavePrimaria: ['aluno_id', 'curso_id'] } });` }, { name: 'tipo inválido', code: R`assert.throws(() => traduzir({ tipo: '0:N', a: 'x', b: 'y' }), 'tipo inválido: 0:N');` }], solution: R`function traduzir(rel) {
  const { tipo, a, b, obrigatorio } = rel;
  if (tipo === '1:N' || tipo === '1:1') {
    return { chaveEstrangeira: { tabela: b, coluna: a + '_id', referencia: a, naoNula: !!obrigatorio, unica: tipo === '1:1' } };
  }
  if (tipo === 'N:N') {
    return { ligacao: { tabela: a + '_' + b, colunas: [a + '_id', b + '_id'], chavePrimaria: [a + '_id', b + '_id'] } };
  }
  throw new Error('tipo inválido: ' + tipo);
}
`, explanation: 'As regras de tradução da aula: 1:N põe a chave estrangeira no lado N; 1:1 a torna única; N:N exige tabela de ligação com chave composta.' }
],
'mod-02': [
  { id: 'mod-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Em uma tabela com linhas repetindo "cliente, cidade" para cada item de pedido, o que acontece ao atualizar a cidade em apenas uma linha?', options: ['O banco atualiza todas as linhas do cliente', 'Surge uma contradição: o cliente passa a ter duas cidades (anomalia de atualização)', 'A atualização é recusada', 'A tabela é automaticamente normalizada'], answer: 1, explanation: 'Medido: a Ana apareceu com Gramado e Porto Alegre.' },
  { id: 'mod-02-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a anomalia ao sintoma.', pairs: [['Atualização', 'Um fato repetido muda em algumas linhas e fica contraditório'], ['Inserção', 'Não é possível cadastrar o cliente sem um pedido'], ['Exclusão', 'Apagar o único pedido apaga os dados do cliente'], ['Dependência transitiva', 'Nome do departamento guardado em cada funcionário']], explanation: 'Todas foram medidas no laboratório.' },
  { id: 'mod-02-e3', type: 'trace', difficulty: 3, points: 10, prompt: 'Tabela func(id, nome, depto_id, depto_nome) com a chave id. Dependências: id → depto_id e depto_id → depto_nome.', code: 'func(id PK, nome, depto_id, depto_nome)\nid → nome, depto_id\ndepto_id → depto_nome', lang: 'text', steps: [{ q: 'Qual forma normal é violada (2FN ou 3FN)?', answers: ['3FN', '3fn', '3'] }, { q: 'Que tabela nova resolve (nome)?', answers: ['departamentos', 'departamento'] }], explanation: 'A chave é simples (não há dependência parcial); depto_nome depende de depto_id, um atributo não chave: dependência transitiva (3FN).' },
  { id: 'mod-02-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que viola a 1FN.', code: 'CREATE TABLE alunos (\n  id int PRIMARY KEY,\n  nome text,\n  telefones text   -- ex.: \'1111,2222\'\n);', answer: 4, explanation: 'Uma lista de valores em uma célula viola a primeira forma normal; use uma tabela telefones(aluno_id, numero).' },
  { id: 'mod-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que decompor uma tabela precisa ser "sem perdas" e como verificar isso na prática.', model: 'Uma decomposição sem perdas garante que, ao juntar as partes, se reconstrói exatamente a tabela original, sem linhas a mais nem a menos. Sem isso, a normalização destrói informação. Ela é garantida quando a interseção das partes contém uma chave de pelo menos uma delas (por isso as chaves estrangeiras). Na prática, verifica-se juntando as partes e comparando com a original com EXCEPT nos dois sentidos (resultado vazio) e comparando contagens; no laboratório, o JOIN das quatro tabelas reconstruiu as linhas esperadas.', rubric: ['Define decomposição sem perdas', 'Cita o papel da chave na interseção', 'Descreve a verificação com JOIN e EXCEPT ou contagens', 'Relaciona às chaves estrangeiras'], explanation: 'Normalizar sem verificar pode perder dados.' },
  { id: 'mod-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele **dependências funcionais**. Implemente §fecho(atributos, dfs)§: dados um conjunto de atributos e uma lista de dependências §{ de: [..], para: [..] }§, devolva o **fecho** (todos os atributos determinados), **ordenado alfabeticamente**. E §chavesCandidatas(todos, dfs)§: devolva as **chaves candidatas** (subconjuntos **mínimos** cujo fecho contém todos os atributos), cada chave **ordenada alfabeticamente**, e a lista ordenada por tamanho e depois por ordem lexicográfica do texto da chave.', lang: 'javascript', starter: 'function fecho(atributos, dfs) {\n  // seu código aqui\n}\nfunction chavesCandidatas(todos, dfs) {\n}\n', hints: ['O fecho cresce até não haver novas dependências aplicáveis.', 'Teste subconjuntos por tamanho crescente e descarte os que contêm uma chave já encontrada.'], tests: [{ name: 'fecho', code: R`const dfs = [{ de: ['A'], para: ['B'] }, { de: ['B'], para: ['C'] }];
assert.deepEqual(fecho(['A'], dfs), ['A', 'B', 'C']);
assert.deepEqual(fecho(['B'], dfs), ['B', 'C']);
assert.deepEqual(fecho(['D'], dfs), ['D']);
assert.deepEqual(fecho(['A', 'D'], dfs), ['A', 'B', 'C', 'D']);` }, { name: 'chaves candidatas', code: R`const dfs = [{ de: ['A'], para: ['B'] }, { de: ['B'], para: ['C'] }];
assert.deepEqual(chavesCandidatas(['A', 'B', 'C', 'D'], dfs), [['A', 'D']]);
assert.deepEqual(chavesCandidatas(['A', 'B', 'C'], dfs), [['A']]);` }, { name: 'várias chaves e nenhuma dependência', code: R`const ciclo = [{ de: ['A'], para: ['B'] }, { de: ['B'], para: ['C'] }, { de: ['C'], para: ['A'] }];
assert.deepEqual(chavesCandidatas(['A', 'B', 'C'], ciclo), [['A'], ['B'], ['C']]);
assert.deepEqual(chavesCandidatas(['A', 'B'], []), [['A', 'B']]);
const composta = [{ de: ['pedido', 'produto'], para: ['qtd'] }, { de: ['produto'], para: ['categoria'] }];
assert.deepEqual(chavesCandidatas(['pedido', 'produto', 'qtd', 'categoria'], composta), [['pedido', 'produto']]);` }], solution: R`function fecho(atributos, dfs) {
  const f = new Set(atributos);
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const d of dfs) {
      if (d.de.every((x) => f.has(x))) {
        for (const y of d.para) if (!f.has(y)) { f.add(y); mudou = true; }
      }
    }
  }
  return [...f].sort();
}
function chavesCandidatas(todos, dfs) {
  const ordenados = [...todos].sort();
  const n = ordenados.length;
  const chaves = [];
  const todosStr = ordenados.join(',');
  for (let tam = 1; tam <= n; tam++) {
    const sub = (inicio, atual) => {
      if (atual.length === tam) {
        if (chaves.some((k) => k.every((x) => atual.includes(x)))) return;
        if (fecho(atual, dfs).join(',') === todosStr) chaves.push(atual.slice());
        return;
      }
      for (let i = inicio; i < n; i++) { atual.push(ordenados[i]); sub(i + 1, atual); atual.pop(); }
    };
    sub(0, []);
  }
  return chaves.sort((a, b) => a.length - b.length || (a.join(',') < b.join(',') ? -1 : 1));
}
`, explanation: 'O fecho de atributos é a ferramenta formal para achar chaves candidatas e detectar dependências parciais e transitivas. Na tabela de itens, (pedido, produto) é a chave, e categoria depende só de produto (dependência parcial).' }
  ,{ id: 'mod-02-e7', type: 'code', difficulty: 3, points: 25, prompt: 'Verifique uma **decomposição sem perdas**. Implemente §decomposicao(linhas, colsA, colsB)§: projete §linhas§ (objetos) nas colunas §colsA§ e §colsB§ (**sem repetição**), faça a **junção natural** das duas projeções (pelas colunas em comum) e compare com a relação original. Devolva §{ semPerdas, espurias }§ onde §espurias§ é o número de linhas da junção que **não existem** no original (compare linhas pelo conteúdo, **sem repetição**) e §semPerdas§ é §true§ quando §espurias === 0§. As linhas do original e da junção são consideradas como **conjuntos** de linhas completas (todas as colunas de §colsA§ e §colsB§).', lang: 'javascript', starter: 'function decomposicao(linhas, colsA, colsB) {\n  // seu código aqui\n}\n', hints: ['Projete e remova duplicatas usando JSON das colunas.', 'A junção natural combina linhas das duas projeções cujas colunas comuns são iguais.', 'Compare cada linha resultante com o conjunto do original.'], tests: [{ name: 'decomposição com perdas', code: R`const original = [{ A: 1, B: 'x', C: 'p' }, { A: 2, B: 'x', C: 'q' }];
const r = decomposicao(original, ['A', 'B'], ['B', 'C']);
assert.deepEqual(r, { semPerdas: false, espurias: 2 });` }, { name: 'decomposição sem perdas', code: R`const original = [{ A: 1, B: 'x', C: 'p' }, { A: 2, B: 'y', C: 'q' }];
assert.deepEqual(decomposicao(original, ['A', 'B'], ['B', 'C']), { semPerdas: true, espurias: 0 });
assert.deepEqual(decomposicao([], ['A', 'B'], ['B', 'C']), { semPerdas: true, espurias: 0 });` }, { name: 'duplicatas e outras colunas', code: R`const original = [{ id: 1, cidade: 'POA', nome: 'Ana' }, { id: 1, cidade: 'POA', nome: 'Ana' }, { id: 2, cidade: 'POA', nome: 'Bia' }];
assert.deepEqual(decomposicao(original, ['id', 'cidade'], ['id', 'nome']), { semPerdas: true, espurias: 0 });` }], solution: R`function decomposicao(linhas, colsA, colsB) {
  const proj = (cols) => {
    const vistos = new Map();
    for (const l of linhas) {
      const o = {};
      cols.forEach((c) => { o[c] = l[c]; });
      vistos.set(JSON.stringify(cols.map((c) => o[c])), o);
    }
    return [...vistos.values()];
  };
  const a = proj(colsA), b = proj(colsB);
  const todas = [...new Set([...colsA, ...colsB])];
  const comuns = colsA.filter((c) => colsB.includes(c));
  const chave = (o) => JSON.stringify(todas.map((c) => o[c]));
  const original = new Set(linhas.map(chave));
  const juntas = new Map();
  for (const x of a) {
    for (const y of b) {
      if (comuns.every((c) => x[c] === y[c])) {
        const m = { ...x, ...y };
        juntas.set(chave(m), m);
      }
    }
  }
  let espurias = 0;
  for (const k of juntas.keys()) if (!original.has(k)) espurias++;
  return { semPerdas: espurias === 0, espurias };
}
`, explanation: 'Quando a coluna comum (B) não é chave de nenhuma das partes, a junção cria linhas que não existiam (espúrias): a decomposição perde informação. Com uma coluna comum que identifica uma das partes, a junção reconstrói o original.' }
],
'mod-03': [
  { id: 'mod-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'O que acontece em DELETE FROM cursos WHERE id = 1 se há matrículas referenciando o curso e a chave estrangeira usa ON DELETE RESTRICT?', options: ['As matrículas são apagadas', 'O DELETE é recusado com erro de chave estrangeira', 'O curso é apagado e as matrículas ficam órfãs', 'As matrículas ficam com curso_id NULL'], answer: 1, explanation: 'Medido: update or delete on table "cursos" violates foreign key constraint ... still referenced.' },
  { id: 'mod-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma associação polimórfica (alvo_tipo, alvo_id) permite criar uma chave estrangeira que garante que o alvo exista.', answer: false, explanation: 'Medido: um comentário para o post 999, inexistente, foi aceito. Não existe FK para "uma tabela que depende do tipo".' },
  { id: 'mod-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade à forma de modelar o domínio.', pairs: [['Status que a área de negócio muda todo mês e precisa de rótulo e ordem', 'Tabela de domínio com chave estrangeira'], ['Poucos valores estáveis (por exemplo, direção asc/desc)', 'CHECK ou ENUM'], ['Acrescentar um valor com ALTER TYPE ... ADD VALUE', 'ENUM'], ['Garantir que um funcionário não seja o próprio gerente', 'CHECK (gerente_id <> id)']], explanation: 'Cada forma tem seu custo de mudança.' },
  { id: 'mod-03-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a tabela de ligação para impedir matrículas duplicadas.', code: 'CREATE TABLE matriculas (\n  aluno_id int REFERENCES alunos(id),\n  curso_id int REFERENCES cursos(id),\n  PRIMARY KEY ([[0]], [[1]])\n);', answers: [['aluno_id', 'curso_id'], ['curso_id', 'aluno_id']], explanation: 'A chave primária composta (aluno_id, curso_id) impede o mesmo par duas vezes (medido: duplicate key).' },
  { id: 'mod-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando você escolheria ON DELETE CASCADE e quando RESTRICT? Dê dois exemplos de cada e um risco do CASCADE.', model: 'CASCADE serve quando os dependentes não fazem sentido sem o pai: itens de um pedido, linhas de um carrinho, preferências de um usuário. RESTRICT serve quando apagar o pai seria um erro de negócio enquanto houver dependentes: um curso com matrículas, um cliente com pedidos ou faturas, um produto presente em pedidos. O risco do CASCADE é apagar em cadeia, de forma silenciosa, dados importantes ou sujeitos a retenção legal, sem confirmação; por isso revise a cadeia de dependências e considere exclusão lógica ou arquivamento.', rubric: ['Dá exemplos plausíveis de CASCADE', 'Dá exemplos plausíveis de RESTRICT', 'Cita o risco de exclusão em cadeia', 'Menciona alternativas como exclusão lógica'], explanation: 'A ação referencial é regra de negócio.' },
  { id: 'mod-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele as **ações referenciais**. Implemente §apagarPai(estado, idPai, acao)§: §estado§ = §{ pais: [{ id }], filhos: [{ id, paiId }] }§ e §acao§ em §"RESTRICT"§, §"CASCADE"§ ou §"SET NULL"§. Devolva um **novo estado** sem alterar o original. O pai é removido e: §"RESTRICT"§ lança §Error("violates foreign key constraint")§ se existir filho que o referencie (e não altera nada); §"CASCADE"§ remove os filhos desse pai; §"SET NULL"§ mantém os filhos com §paiId: null§. Pai inexistente lança §Error("pai inexistente: ID")§; ação inválida lança §Error("ação inválida: A")§.', lang: 'javascript', starter: 'function apagarPai(estado, idPai, acao) {\n  // seu código aqui\n}\n', hints: ['Valide a ação e a existência do pai primeiro.', 'Use map e filter para não mutar o estado original.'], tests: [{ name: 'RESTRICT, CASCADE e SET NULL', code: R`const e = { pais: [{ id: 1 }, { id: 2 }], filhos: [{ id: 10, paiId: 1 }, { id: 11, paiId: 1 }, { id: 12, paiId: 2 }] };
assert.throws(() => apagarPai(e, 1, 'RESTRICT'), 'violates foreign key constraint');
const c = apagarPai(e, 1, 'CASCADE');
assert.deepEqual(c.pais, [{ id: 2 }]);
assert.deepEqual(c.filhos, [{ id: 12, paiId: 2 }]);
const s = apagarPai(e, 1, 'SET NULL');
assert.deepEqual(s.filhos, [{ id: 10, paiId: null }, { id: 11, paiId: null }, { id: 12, paiId: 2 }]);` }, { name: 'RESTRICT sem filhos e imutabilidade', code: R`const e = { pais: [{ id: 1 }, { id: 3 }], filhos: [{ id: 12, paiId: 1 }] };
const r = apagarPai(e, 3, 'RESTRICT');
assert.deepEqual(r.pais, [{ id: 1 }]);
assert.equal(e.pais.length, 2);
assert.equal(e.filhos.length, 1);` }, { name: 'erros', code: R`const e = { pais: [{ id: 1 }], filhos: [] };
assert.throws(() => apagarPai(e, 9, 'CASCADE'), 'pai inexistente: 9');
assert.throws(() => apagarPai(e, 1, 'IGNORE'), 'ação inválida: IGNORE');` }], solution: R`function apagarPai(estado, idPai, acao) {
  if (!['RESTRICT', 'CASCADE', 'SET NULL'].includes(acao)) throw new Error('ação inválida: ' + acao);
  if (!estado.pais.some((p) => p.id === idPai)) throw new Error('pai inexistente: ' + idPai);
  const dependentes = estado.filhos.filter((f) => f.paiId === idPai);
  if (acao === 'RESTRICT' && dependentes.length) throw new Error('violates foreign key constraint');
  const pais = estado.pais.filter((p) => p.id !== idPai);
  let filhos = estado.filhos;
  if (acao === 'CASCADE') filhos = filhos.filter((f) => f.paiId !== idPai);
  if (acao === 'SET NULL') filhos = filhos.map((f) => (f.paiId === idPai ? { ...f, paiId: null } : f));
  return { pais, filhos };
}
`, explanation: 'O modelo reproduz o que o PostgreSQL mediu: RESTRICT recusa, CASCADE remove os dependentes e SET NULL os desliga.' }
]
};
