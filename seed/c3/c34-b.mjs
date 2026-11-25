// C3.4 — Modelagem de dados. Aulas 3 e 4 (relacionamentos 1:N e N:N; desnormalização consciente).
const R = String.raw;

export const REF2 = {
  constraints: { title: 'PostgreSQL 17 — Constraints', url: 'https://www.postgresql.org/docs/17/ddl-constraints.html', kind: 'doc' },
  fk: { title: 'PostgreSQL 17 — Foreign Keys', url: 'https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK', kind: 'doc' },
  enums: { title: 'PostgreSQL 17 — Enumerated Types', url: 'https://www.postgresql.org/docs/17/datatype-enum.html', kind: 'doc' },
  triggers: { title: 'PostgreSQL 17 — Triggers', url: 'https://www.postgresql.org/docs/17/triggers.html', kind: 'doc' },
  matview: { title: 'PostgreSQL 17 — Materialized Views', url: 'https://www.postgresql.org/docs/17/rules-materializedviews.html', kind: 'doc' },
  denorm: { title: 'Wikipedia — Denormalization', url: 'https://en.wikipedia.org/wiki/Denormalization', kind: 'doc' },
  jsonTypes: { title: 'PostgreSQL 17 — JSON Types', url: 'https://www.postgresql.org/docs/17/datatype-json.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'mod-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['1:N', 'N:N', 'tabela de ligação', 'ON DELETE', 'autorrelacionamento', 'domínios'],
  title: 'Relacionamentos 1:N e N:N: chaves estrangeiras, tabelas de ligação e integridade referencial',
  objectives: ['Implementar relacionamentos 1:N, N:N, 1:1 e autorrelacionamentos com chaves estrangeiras', 'Modelar uma tabela de ligação com atributos próprios e chave composta', 'Escolher a ação referencial (§CASCADE§, §RESTRICT§, §SET NULL§) por regra de negócio', 'Modelar domínios (status, tipos) com tabela de domínio, §CHECK§ ou §ENUM§', 'Reconhecer o problema das associações polimórficas sem integridade'],
  intro: R`Os relacionamentos são o que faz um banco **relacional**. Esta aula mostra como cada cardinalidade vira estrutura de tabelas e chaves estrangeiras, o que o banco **impede** automaticamente (e o que **não** impede), como escolher o comportamento ao apagar e três maneiras de modelar valores de domínio. Todas as mensagens vêm do PostgreSQL 17.12.`,
  theory: R`### 1:N: a chave estrangeira no lado N
Um cliente faz muitos pedidos: §pedidos.cliente_id REFERENCES clientes(id)§. A chave estrangeira garante a **integridade referencial** (nenhum pedido aponta para cliente inexistente). A obrigatoriedade vem do **§NOT NULL§**. **Crie índice** na coluna da chave estrangeira se você junta ou apaga pela chave (no PostgreSQL ele **não** é criado automaticamente; no MySQL/InnoDB, **é**).

### N:N: tabela de ligação (associativa)
Um aluno cursa vários cursos; um curso tem vários alunos. Uma coluna não resolve; é preciso uma **terceira tabela**:
§§§
CREATE TABLE matriculas (
  aluno_id int REFERENCES alunos(id) ON DELETE CASCADE,
  curso_id int REFERENCES cursos(id) ON DELETE RESTRICT,
  nota numeric(4,2) CHECK (nota BETWEEN 0 AND 10),
  em date DEFAULT current_date,
  PRIMARY KEY (aluno_id, curso_id)
);
§§§
A **chave primária composta** impede a mesma matrícula duas vezes. A tabela de ligação pode ter **atributos próprios** (nota, data), que **não pertencem** nem ao aluno nem ao curso, mas **ao par**. Medido, os erros do PostgreSQL: matrícula repetida **(1, 1)**: **duplicate key value violates unique constraint "matriculas_pkey"**; nota 11: **violates check constraint "matriculas_nota_check"**; aluno 3 inexistente: **violates foreign key constraint "matriculas_aluno_id_fkey"**. A consulta combinada devolveu a Ana com "Java, SQL" e média **8,75**, e o Bruno com "SQL" e média **7,00**.
Quando a ligação ganha vida própria (a matrícula tem situação, histórico, pagamentos), ela vira uma **entidade** ("Matrícula") com chave própria; nesse caso o par (aluno, curso) pode continuar **UNIQUE**.

### Ações referenciais: o que acontece ao apagar
Declaradas em §ON DELETE§ (e §ON UPDATE§):
- **§NO ACTION§ / §RESTRICT§** (padrão): recusa apagar enquanto houver dependentes. Medido: §DELETE FROM cursos WHERE id = 1§ falhou: **update or delete on table "cursos" violates foreign key constraint ... still referenced from table "matriculas"**.
- **§CASCADE§**: apaga também os dependentes. Medido: apagar o aluno 2 removeu a matrícula dele (**matrículas restantes: 2**). Use quando os dependentes **não fazem sentido sem o pai** (itens de um pedido); **perigoso** quando apaga em cadeia sem aviso.
- **§SET NULL§** / **§SET DEFAULT§**: o filho continua, desligado do pai (coluna precisa aceitar NULL).
Escolha **por regra de negócio**: "um curso com matrículas não pode ser apagado" (RESTRICT); "ao excluir a conta, apagar o histórico dela" (CASCADE), às vezes sujeito a **normas de retenção** (às vezes é preciso **manter** registros fiscais).

### 1:1 e autorrelacionamento
- **1:1**: chave primária compartilhada (§perfis.usuario_id PRIMARY KEY REFERENCES usuarios(id)§) ou chave estrangeira com §UNIQUE§. Use para **separar** dados raros, grandes ou sensíveis. Medido: um segundo perfil para o mesmo usuário foi recusado.
- **Autorrelacionamento**: a tabela referencia a si mesma (§funcionarios.gerente_id REFERENCES funcionarios(id)§) para **hierarquias** (organograma, categorias, comentários). Medido: §CHECK (gerente_id <> id)§ impediu o funcionário "Loop" de ser o próprio gerente. **Ciclos mais longos** (A gerencia B, B gerencia A) **não** são barrados por uma restrição simples: valide por trigger ou por modelagem de caminho (aula mod-06).

### Domínios: status, tipos e categorias
Três formas de restringir os valores de uma coluna, **todas medidas**: tentar inserir o status '§cancelado§', fora do domínio, foi recusado nas três:
1. **Tabela de domínio** (§ped_status(codigo)§ + chave estrangeira): erro de chave estrangeira. **Acrescentar um valor** é só um §INSERT§ (medido: depois de inserir 'cancelado' na tabela, o insert passou). Permite **atributos extras** (rótulo, ordem, ativo) e é a forma mais **flexível e auditável**.
2. **§CHECK (status IN (...))§**: erro de check. Simples, mas **mudar a lista exige alterar a restrição** (§ALTER TABLE ... DROP/ADD CONSTRAINT§).
3. **§ENUM§**: tipo próprio (§CREATE TYPE st AS ENUM (...)§); ocupa pouco e ordena na ordem declarada. Medido: erro **invalid input value for enum**; §ALTER TYPE st ADD VALUE 'cancelado'§ funcionou. **Remover ou renomear valores** é difícil. O MySQL tem §ENUM§ por coluna (aula pgm-02).
Regra prática: valores **estáveis e poucos** (sexo, direção) → §CHECK§ ou §ENUM§; valores **que mudam por decisão do negócio** → **tabela de domínio**.

### Associações polimórficas: o perigo
Um padrão frequente de frameworks: §comentarios(alvo_tipo, alvo_id)§ para comentar "posts", "fotos" e "vídeos" na mesma tabela. **Não há chave estrangeira possível** para "uma tabela que depende do tipo". Medido: inserimos um comentário com §alvo_tipo = 'post'§ e §alvo_id = 999§, que **não existe**, e o banco **aceitou** (1 comentário órfão). Alternativas que mantêm integridade: (a) **uma tabela de comentários por tipo**; (b) **colunas de chave estrangeira opcionais** (§post_id§, §foto_id§) com um §CHECK§ de "exatamente uma preenchida"; (c) uma **supertabela** comum (§conteudos§) da qual §posts§, §fotos§ e §videos§ herdam a chave primária (1:1). Se aceitar o polimorfismo, **valide por trigger** e monitore órfãos.

### Herança e especialização
Para "pessoa física" e "pessoa jurídica" com atributos distintos: (1) **uma tabela com colunas opcionais** (simples, mas com muitos NULL); (2) **uma tabela por subtipo** com a chave da **supertabela**; (3) **tabela única com um tipo** e restrições §CHECK§ por tipo. Escolha por quantidade de atributos diferentes e consultas (mais comuns: todos juntos ou separados?).

### Conferindo o modelo
Cada relacionamento do diagrama deve ter: a **chave estrangeira**, a regra de **obrigatoriedade** (§NOT NULL§), a **unicidade** quando for 1:1 ou N:N, a **ação referencial** escolhida, o **índice** na chave estrangeira (quando o banco não cria) e **testes de recusa** (como os acima).`,
  concepts: [
    { term: 'Chave estrangeira', def: 'Coluna que referencia a chave de outra tabela e garante a integridade referencial.' },
    { term: 'Tabela de ligação', def: 'Tabela associativa que resolve um relacionamento N:N com duas chaves estrangeiras.' },
    { term: 'ON DELETE CASCADE', def: 'Ação referencial que apaga os dependentes junto com a linha pai.' },
    { term: 'ON DELETE RESTRICT', def: 'Ação referencial que recusa apagar enquanto houver dependentes.' },
    { term: 'ON DELETE SET NULL', def: 'Ação referencial que anula a referência nos dependentes.' },
    { term: 'Tabela de domínio', def: 'Tabela com os valores válidos de uma coluna, referenciada por chave estrangeira.' },
    { term: 'ENUM', def: 'Tipo que aceita um conjunto fixo e ordenado de valores de texto.' },
    { term: 'Associação polimórfica', def: 'Referência a registros de tabelas diferentes por um par (tipo, id), sem chave estrangeira.' },
    { term: 'Registro órfão', def: 'Linha que referencia um registro pai que não existe.' },
    { term: 'Supertabela', def: 'Tabela comum que guarda a identidade e os atributos compartilhados de vários subtipos.' }
  ],
  examples: R`**Analogia:** a **tabela de ligação** é a **lista de presença de uma sala**: cada linha diz "o aluno A está no curso C" e pode anotar a nota. A **chave estrangeira** é o **carimbo de conferência**: só permite lançar na lista alguém que exista no cadastro de alunos e em um curso que exista. O **ON DELETE** define o que se faz com a lista quando se risca um nome do cadastro: **recusar** (RESTRICT), **riscar também a linha** (CASCADE) ou **deixar a linha sem nome** (SET NULL). A associação polimórfica é uma **lista de presença com "sala: qualquer uma"**: ninguém confere se a sala existe.

**Exemplo 1: matrícula.** Cada restrição barrou um erro diferente: duplicidade, nota inválida e aluno inexistente.

**Exemplo 2: apagar.** Apagar um curso com matrículas foi recusado; apagar um aluno removeu as matrículas dele.

**Exemplo 3: polimorfismo.** Um comentário para um post inexistente foi aceito.`,
  code: [
    { title: 'N:N com atributos e ações referenciais (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`CREATE TABLE alunos (id serial PRIMARY KEY, nome text NOT NULL);
CREATE TABLE cursos (id serial PRIMARY KEY, titulo text NOT NULL);
CREATE TABLE matriculas (
  aluno_id int REFERENCES alunos(id) ON DELETE CASCADE,
  curso_id int REFERENCES cursos(id) ON DELETE RESTRICT,
  nota numeric(4,2) CHECK (nota BETWEEN 0 AND 10),
  em date DEFAULT current_date,
  PRIMARY KEY (aluno_id, curso_id)
);
INSERT INTO matriculas (aluno_id, curso_id) VALUES (1,1);   -- ok (já havia nota)
-- repetir (1,1): ERROR duplicate key ... "matriculas_pkey"
-- nota 11:       ERROR violates check constraint "matriculas_nota_check"
-- aluno 3:       ERROR violates foreign key constraint "matriculas_aluno_id_fkey"

DELETE FROM cursos WHERE id = 1;   -- ERROR: ... still referenced from table "matriculas"
DELETE FROM alunos WHERE id = 2;   -- ok: a matrícula do aluno 2 some junto (CASCADE)`, notes: [{ l: '8', t: 'A chave primária composta impede matrículas duplicadas.' }, { l: '14', t: 'RESTRICT protege cursos com matrículas.' }, { l: '15', t: 'CASCADE remove as matrículas do aluno apagado.' }] },
    { title: 'Três formas de modelar um domínio e o polimorfismo sem integridade (SQL, saída medida)', lang: 'sql', code: R`CREATE TABLE ped_status (codigo text PRIMARY KEY);
INSERT INTO ped_status VALUES ('aberto'), ('pago');
CREATE TABLE ped_a (id int, status text REFERENCES ped_status(codigo));             -- tabela de domínio
CREATE TABLE ped_b (id int, status text CHECK (status IN ('aberto','pago')));       -- CHECK
CREATE TYPE st AS ENUM ('aberto','pago');
CREATE TABLE ped_c (id int, status st);                                             -- ENUM

INSERT INTO ped_a VALUES (1,'cancelado');   -- ERROR foreign key
INSERT INTO ped_b VALUES (1,'cancelado');   -- ERROR check
INSERT INTO ped_c VALUES (1,'cancelado');   -- ERROR invalid input value for enum
INSERT INTO ped_status VALUES ('cancelado');-- novo valor: só um INSERT
ALTER TYPE st ADD VALUE 'cancelado';        -- ENUM aceita novos valores

-- polimorfismo sem chave estrangeira possível
CREATE TABLE comentarios_ruim (id int, alvo_tipo text, alvo_id int, texto text);
INSERT INTO comentarios_ruim VALUES (1,'post',999,'aponta para um post que não existe');   -- aceito!`, notes: [{ l: '3', t: 'A tabela de domínio permite atributos extras e novos valores sem alterar o esquema.' }, { l: '11', t: 'ENUM permite acrescentar valores; remover é difícil.' }, { l: '15', t: 'Sem FK, o banco não impede o registro órfão.' }] }
  ],
  bestPractices: ['Para cada relacionamento, defina chave estrangeira, obrigatoriedade, unicidade e ação referencial.', 'Use tabela de ligação com chave composta e atributos do par.', 'Escolha CASCADE só para dependentes sem sentido sem o pai; prefira RESTRICT por padrão.', 'Use tabela de domínio para valores que o negócio altera.', 'Evite associações polimórficas sem integridade ou valide-as por trigger e monitore órfãos.', 'Crie índices nas chaves estrangeiras usadas em junções e exclusões (PostgreSQL).'],
  mistakes: ['Resolver N:N guardando listas de ids em uma coluna.', 'Usar CASCADE por comodidade e apagar dados importantes em cadeia.', 'Esquecer o índice na chave estrangeira e deixar o DELETE do pai lento.', 'Usar CHECK com lista fixa para valores que mudam todo mês.', 'Aceitar registros órfãos em associações polimórficas.', 'Modelar a ligação sem a chave composta, permitindo duplicatas.'],
  market: R`Relacionamentos mal modelados geram registros órfãos, relatórios inconsistentes e exclusões que "somem dados". Saber justificar um ON DELETE e escolher entre ENUM, CHECK e tabela de domínio é rotina em revisões de modelo e em entrevistas.`,
  summary: R`1:N coloca a chave estrangeira no lado N; N:N exige tabela de ligação com chave composta e atributos do par (medido: duplicata, nota inválida e aluno inexistente foram recusados; média 8,75 para a Ana). §RESTRICT§ recusou apagar o curso com matrículas; §CASCADE§ removeu as matrículas do aluno apagado. 1:1 usa chave compartilhada; autorrelacionamento modela hierarquias. Domínios: tabela de domínio, §CHECK§ ou §ENUM§ (todos recusaram 'cancelado'). Associações polimórficas não têm chave estrangeira (o comentário órfão foi aceito).`,
  refs: [REF2.fk, REF2.enums, REF2.constraints],
  cards: [
    { q: 'Como se modela um relacionamento N:N?', a: 'Com uma tabela de ligação com duas chaves estrangeiras, chave primária composta e, se preciso, atributos do par.' },
    { q: 'Qual a diferença entre RESTRICT e CASCADE?', a: 'RESTRICT recusa apagar o pai com dependentes; CASCADE apaga os dependentes junto.' },
    { q: 'Quando usar tabela de domínio em vez de CHECK ou ENUM?', a: 'Quando os valores mudam por decisão do negócio ou precisam de atributos extras.' },
    { q: 'Por que a associação polimórfica é arriscada?', a: 'Não há chave estrangeira para tabelas diferentes, então registros órfãos são aceitos.' },
    { q: 'O PostgreSQL cria índice automático em chave estrangeira?', a: 'Não; o MySQL/InnoDB cria. Crie manualmente quando juntar ou apagar pela chave.' }
  ]
},
{
  id: 'mod-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['desnormalização', 'contadores', 'trade-offs', 'consistência', 'leitura x escrita'],
  title: 'Desnormalização consciente: quando, como e a que custo',
  objectives: ['Explicar por que e quando desnormalizar, e por que não fazê-lo por padrão', 'Aplicar técnicas (coluna calculada, contador, tabela de resumo, cópia de dados, JSONB) com um plano de consistência', 'Medir o ganho e o custo (leitura, escrita e risco de divergência)', 'Escolher o mecanismo de manutenção (aplicação, trigger, view materializada)', 'Documentar a decisão e criar verificações de consistência'],
  intro: R`Normalizar protege a integridade; **desnormalizar** troca parte dessa proteção por **velocidade de leitura**. Feita sem medir, é um erro caro: complexidade, divergência e escritas mais lentas, para um ganho que talvez não exista. Feita com consciência, é uma técnica legítima de escala. Esta aula mostra **os números medidos** (PostgreSQL 17.12) de uma desnormalização típica, o **risco real** de o dado divergir e um **processo** para decidir.`,
  theory: R`### Desnormalizar é uma decisão de engenharia, não um erro
**Desnormalizar** é, deliberadamente, **guardar um dado redundante** (calculável ou copiado de outra tabela) para **acelerar leituras**. Parte de uma premissa: **a leitura é muito mais frequente que a escrita** e o **cálculo é caro**. A regra: **primeiro normalize, meça, otimize (índices, consultas) e só então desnormalize**, se ainda for necessário.

### Técnicas comuns
1. **Coluna derivada** (total do pedido, quantidade de itens): evita agregar a cada leitura.
2. **Contadores** (curtidas, comentários, seguidores).
3. **Cópia de dados do pai** (nome do cliente no pedido; **o preço cobrado no item**, que é desnormalização **de histórico**, necessária e saudável).
4. **Tabela de resumo/agregados** (vendas por dia e produto), mantida por processo.
5. **View materializada** (aula sqa-03): desnormalização gerenciada pelo banco, com atraso conhecido.
6. **JSONB** para atributos variáveis ou para guardar um "retrato" de dados (endereço de entrega no momento da compra).
7. **Tabela larga** para relatórios (esquemas estrela em armazéns de dados).

### O experimento: total por pedido
Cenário: **100.000 pedidos** com **5 itens** cada (500.000 itens), e a consulta "total de cada pedido do cliente 77" (20 pedidos). Duas versões: **normalizada** (§JOIN§ + §sum§ sobre §d_itens§) e **desnormalizada** (coluna §total_guardado§ em §pedidos§). Medido:
- **Sem índice em §cliente_id§**: normalizada **~38 ms**, desnormalizada **~25 ms** (as duas fazem **Seq Scan** em 100 mil pedidos: o gargalo é a falta do índice, não o JOIN).
- **Com índice em §cliente_id§**: normalizada **~0,83 ms** e desnormalizada **~0,13 ms** (cerca de **6 vezes** mais rápida, mas as duas são **muito rápidas**).
**Lição:** o primeiro ganho veio do **índice** (de ~38 ms para ~0,83 ms, **~46 vezes**), e a desnormalização acrescentou pouco em uma consulta já indexada. Desnormalizar **antes** de indexar é o erro clássico.

### O risco: a divergência
Um valor guardado precisa ser **mantido**. Medido: inserimos um item de **1.000,00** no pedido 1 **sem atualizar** o total. Resultado: §total_guardado§ = **65,00** e o total real = **1.065,00**. O banco **não percebe**: o dado redundante **mentiu**. Cada ponto do sistema que insere, altera ou apaga itens (aplicação, scripts, outros serviços) precisa manter o total, ou o dado diverge.

### Quem mantém o dado redundante
- **Na aplicação**: simples, mas **frágil** (um caminho esquecido diverge) e exige **transação** para atualizar os dois lugares.
- **Por trigger no banco**: garante a manutenção para **todos os clientes**, ao custo de escritas mais lentas. Medido: inserir **100.000 itens** sem o trigger levou **~4,2 s** e com o trigger que atualiza o total **~15,2 s** (**~3,6 vezes** mais; observação: a segunda carga rodou em tabela já com 100 mil linhas, então a comparação é aproximada). O trigger também cria **contenção**: todas as inserções do mesmo pedido atualizam a mesma linha do pedido (bloqueio).
- **Por view materializada** (aula sqa-03): o banco recalcula tudo no §REFRESH§; **atraso conhecido**.
- **Por processo assíncrono** (fila, evento): **consistência eventual**.
Defina quem é **a fonte da verdade** (os itens) e trate o valor redundante como **cache** que pode ser **reconstruído**.

### Verificações de consistência
Crie uma consulta que **detecta divergências** e rode-a periodicamente (job ou teste): §SELECT p.id FROM pedidos p WHERE p.total_guardado <> (SELECT coalesce(sum(valor),0) FROM itens WHERE pedido_id = p.id)§. Se achar linhas, **corrija** e investigue a causa. Uma coluna redundante **sem** verificação é uma dívida escondida.

### Quando desnormalizar vale a pena
- A consulta é **crítica**, frequente e **já indexada e otimizada**, e ainda não atinge a meta.
- A proporção leitura/escrita é **alta**.
- O dado calculado é **caro** (muitas linhas agregadas) ou o **cálculo é complexo**.
- A **consistência exata imediata** não é obrigatória (uma contagem de curtidas pode ter atraso) **ou** há um mecanismo confiável de manutenção.
- Há **medição** antes e depois.

### Quando NÃO desnormalizar
- Antes de usar índices e reescrever a consulta.
- Quando a tabela é **muito escrita** e o valor muda a todo momento.
- Quando **inconsistência é inaceitável** (saldo financeiro: use transação e modelo de lançamentos, não um saldo "solto").
- Quando a equipe **não tem como** garantir a manutenção.

### Desnormalização que é correção, não otimização
Guardar o **preço cobrado no item** e o **endereço de entrega** como **retrato** no pedido **não** é otimização: é **requisito de negócio** (histórico). Aqui a "redundância" é **intencional e imutável**.

### Alternativas à desnormalização
Cache em memória (curso C3.8), réplicas de leitura (pgm-08), **view materializada**, **índices de cobertura** (pgm-04), **bancos analíticos** para relatórios (colunar), **consultas melhores**.

### Documente
Registre em um **ADR** (aula est-09 do curso de estado) o que foi desnormalizado, por quê, a **medição**, **quem mantém**, a **verificação** e como **reverter**.`,
  concepts: [
    { term: 'Desnormalização', def: 'Guardar deliberadamente um dado redundante para acelerar leituras, assumindo o custo de mantê-lo.' },
    { term: 'Coluna derivada', def: 'Coluna que guarda um valor calculável a partir de outras (total do pedido).' },
    { term: 'Contador', def: 'Valor redundante que guarda a contagem de linhas relacionadas.' },
    { term: 'Tabela de resumo', def: 'Tabela com agregados pré-calculados, mantida por processo.' },
    { term: 'Fonte da verdade', def: 'Dado a partir do qual os valores redundantes podem ser reconstruídos.' },
    { term: 'Divergência', def: 'Situação em que o valor redundante difere do valor real calculado a partir da fonte.' },
    { term: 'Consistência eventual', def: 'Garantia de que as cópias convergem após algum tempo, sem exigir atualização imediata.' },
    { term: 'Retrato (snapshot) de dados', def: 'Cópia de dados no momento de um evento, para preservar o histórico.' },
    { term: 'Contenção', def: 'Disputa de várias transações pela mesma linha ou recurso, que serializa as escritas.' },
    { term: 'Verificação de consistência', def: 'Consulta ou teste que detecta divergência entre o dado redundante e a fonte.' }
  ],
  examples: R`**Analogia:** manter um total guardado é como **anotar o saldo no canto do extrato**. Ler o saldo fica instantâneo, mas **toda movimentação exige atualizar a anotação**; se um caixa esquecer, o saldo anotado **mente**. Desnormalizar sem verificar é ter um extrato com saldo anotado e **ninguém conferindo**. Antes de anotar o saldo, vale tentar o **índice remissivo** (um índice bem posto resolve a maior parte da lentidão).

**Exemplo 1: ganho medido.** O índice reduziu 38 ms para 0,83 ms; a coluna guardada, 0,83 ms para 0,13 ms.

**Exemplo 2: divergência medida.** Total guardado 65,00 contra total real 1.065,00.

**Exemplo 3: custo do trigger.** 100 mil inserções de itens: ~4,2 s sem trigger e ~15,2 s com.`,
  code: [
    { title: 'Normalizada x desnormalizada e a verificação (SQL, plano e saída medidos)', lang: 'sql', code: R`-- normalizada: soma dos itens a cada leitura
SELECT p.id, sum(i.valor) FROM d_pedidos p JOIN d_itens i ON i.pedido_id = p.id
WHERE p.cliente_id = 77 GROUP BY p.id;                  -- ~38 ms sem índice; ~0,83 ms com índice em cliente_id

-- desnormalizada: coluna guardada
SELECT id, total_guardado FROM d_pedidos WHERE cliente_id = 77;   -- ~25 ms sem índice; ~0,13 ms com índice

-- risco: esquecer de atualizar
INSERT INTO d_itens VALUES (1, 99, 1000);
SELECT p.id, p.total_guardado,
       (SELECT sum(valor) FROM d_itens WHERE pedido_id = p.id) AS total_real
FROM d_pedidos p WHERE id = 1;                           -- 65.00 | 1065.00

-- verificação de consistência (rode periodicamente)
SELECT p.id FROM d_pedidos p
WHERE p.total_guardado <> (SELECT coalesce(sum(valor), 0) FROM d_itens WHERE pedido_id = p.id);`, notes: [{ l: '3', t: 'O primeiro ganho vem do índice, não da desnormalização.' }, { l: '10', t: 'O valor guardado diverge sem nenhum erro do banco.' }, { l: '15', t: 'Uma consulta de verificação detecta e permite corrigir divergências.' }] },
    { title: 'Mantendo o total por trigger (SQL, tempos medidos)', lang: 'sql', code: R`CREATE FUNCTION atualiza_total() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE d_pedidos SET total_guardado = total_guardado + NEW.valor WHERE id = NEW.pedido_id;
  RETURN NEW;
END $$;

-- 100.000 itens SEM o trigger: ~4,2 s
INSERT INTO d_itens2 SELECT p, i + 10, 5 FROM generate_series(1, 50000) p, generate_series(1, 2) i;

CREATE TRIGGER t_total AFTER INSERT ON d_itens2 FOR EACH ROW EXECUTE FUNCTION atualiza_total();

-- 100.000 itens COM o trigger: ~15,2 s (cerca de 3,6x)
INSERT INTO d_itens2 SELECT p, i + 20, 5 FROM generate_series(1, 50000) p, generate_series(1, 2) i;`, notes: [{ l: '3', t: 'Cada item inserido atualiza a linha do pedido.' }, { l: '12', t: 'O custo de escrita sobe (a segunda carga rodou com mais linhas, então a comparação é aproximada).' }] }
  ],
  bestPractices: ['Normalize primeiro, indexe e otimize a consulta, e só então avalie desnormalizar.', 'Meça o ganho (leitura) e o custo (escrita e risco) antes e depois.', 'Defina a fonte da verdade e quem mantém o dado redundante.', 'Crie uma consulta de verificação e rode-a periodicamente.', 'Prefira mecanismos gerenciados (view materializada, trigger) a lógica espalhada.', 'Registre a decisão e a forma de reverter.'],
  mistakes: ['Desnormalizar antes de indexar e medir.', 'Manter o valor redundante em vários pontos da aplicação, sem transação.', 'Confiar que o valor guardado está certo sem verificar.', 'Desnormalizar saldos financeiros sem modelo de lançamentos e transações.', 'Ignorar a contenção de linhas "quentes" (contadores globais).', 'Confundir retrato histórico (necessário) com redundância opcional.'],
  market: R`Desnormalização é um dos temas favoritos de entrevistas de arquitetura ("quando você a usaria?") e a causa de muitos bugs de "o número está diferente em duas telas". Quem decide com medição e prevê a manutenção do dado redundante evita os dois extremos: o modelo purista lento e o modelo "rápido" inconsistente.`,
  summary: R`Desnormalizar é guardar redundância para acelerar leitura, com custo de manutenção. Medido (100 mil pedidos, 500 mil itens): o índice em §cliente_id§ reduziu a consulta normalizada de ~38 ms para ~0,83 ms; a coluna guardada a levou a ~0,13 ms. Esquecer de atualizar deixou o total em 65,00 contra 1.065,00 reais; o trigger de manutenção tornou 100 mil inserções ~3,6 vezes mais lentas. Normalize, indexe, meça, desnormalize só se necessário, defina quem mantém e verifique periodicamente.`,
  refs: [REF2.denorm, REF2.triggers, REF2.matview, REF2.jsonTypes],
  cards: [
    { q: 'Quando desnormalizar?', a: 'Depois de normalizar, indexar e otimizar, quando a leitura é crítica, muito frequente e ainda não atinge a meta, e há como manter o dado consistente.' },
    { q: 'Qual o maior risco da desnormalização?', a: 'A divergência: o dado redundante deixa de bater com a fonte sem que o banco perceba.' },
    { q: 'Quais mecanismos mantêm um total redundante?', a: 'Lógica na aplicação, trigger, view materializada ou processo assíncrono.' },
    { q: 'Guardar o preço cobrado no item é desnormalização?', a: 'É uma redundância necessária de histórico (requisito de negócio), não uma otimização.' },
    { q: 'Como detectar divergências?', a: 'Com uma consulta de verificação que compara o valor guardado com o recalculado a partir da fonte.' }
  ]
}
];
