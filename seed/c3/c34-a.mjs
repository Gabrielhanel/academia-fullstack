// C3.4 — Modelagem de dados. Aulas 1 e 2 (entidades e relacionamentos; normalização e anomalias).
const R = String.raw;

export const REF = {
  er: { title: 'Wikipedia — Entity–relationship model', url: 'https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model', kind: 'doc' },
  mermaidEr: { title: 'Mermaid — Entity Relationship Diagrams', url: 'https://mermaid.js.org/syntax/entityRelationshipDiagram.html', kind: 'doc' },
  constraints: { title: 'PostgreSQL 17 — Constraints', url: 'https://www.postgresql.org/docs/17/ddl-constraints.html', kind: 'doc' },
  createTable: { title: 'PostgreSQL 17 — CREATE TABLE', url: 'https://www.postgresql.org/docs/17/sql-createtable.html', kind: 'doc' },
  normalization: { title: 'Wikipedia — Database normalization', url: 'https://en.wikipedia.org/wiki/Database_normalization', kind: 'doc' },
  fd: { title: 'Wikipedia — Functional dependency', url: 'https://en.wikipedia.org/wiki/Functional_dependency', kind: 'doc' },
  mysqlForeign: { title: 'MySQL 8.4 — FOREIGN KEY Constraints', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'mod-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['modelagem', 'entidade', 'relacionamento', 'cardinalidade', 'DER', 'chaves'],
  title: 'Do problema ao modelo: entidades, atributos, relacionamentos e cardinalidade',
  objectives: ['Levantar entidades, atributos e relacionamentos a partir de requisitos em linguagem natural', 'Definir cardinalidade e participação (um-para-um, um-para-muitos, muitos-para-muitos; obrigatório e opcional)', 'Escolher chaves primárias e identificar chaves candidatas, naturais e substitutas', 'Desenhar um diagrama entidade-relacionamento (DER) com uma notação textual', 'Traduzir o modelo conceitual em tabelas, chaves estrangeiras e restrições'],
  intro: R`**Modelar** é decidir **o que o sistema precisa lembrar** e **como os fatos se relacionam**, antes de escrever uma linha de SQL. Um bom modelo evita **dados contraditórios**, **consultas impossíveis** e migrações dolorosas; um mau modelo vira dívida técnica que acompanha o produto por anos. Esta aula mostra o caminho do **texto de requisitos** ao **diagrama** e às **tabelas**, com o PostgreSQL 17.12 conferindo o que cada restrição realmente faz.`,
  theory: R`### Três níveis de modelo
1. **Conceitual**: o negócio. Entidades, relacionamentos e regras, sem pensar em banco ("um cliente faz pedidos; um pedido tem itens").
2. **Lógico**: o modelo relacional: tabelas, colunas, chaves primárias e estrangeiras, normalização. Independe do produto.
3. **Físico**: o produto concreto: tipos, índices, particionamento, nomes, parâmetros (PostgreSQL, MySQL).
O trabalho começa no conceitual, passa pelo lógico e termina no físico. Pular direto para o físico é o erro mais comum.

### Como levantar entidades a partir do texto
Leia os requisitos e marque:
- **substantivos** que o negócio precisa lembrar → candidatos a **entidades** (cliente, produto, pedido);
- **verbos** que ligam substantivos → **relacionamentos** ("cliente **faz** pedido", "pedido **contém** produto");
- **adjetivos e valores** que descrevem → **atributos** (nome, preço, data);
- **regras** ("cada pedido pertence a exatamente um cliente", "um aluno pode se matricular em vários cursos") → **cardinalidade, obrigatoriedade e restrições**.
Faça **perguntas**: "Isso tem identidade própria (tem id, pode ser consultado sozinho)?" → entidade. "Só faz sentido dentro de outra coisa?" → atributo ou entidade fraca. "O valor muda e precisamos do histórico?" → talvez outra entidade (eventos).

### Entidade, atributo e identidade
- **Entidade**: algo distinguível, com um conjunto de atributos e uma **identidade**.
- **Atributo**: propriedade simples (nome), **composta** (endereço = rua, número, cidade) ou **multivalorada** (telefones). Atributos **multivalorados** viram **outra tabela** (aula mod-02, primeira forma normal).
- **Identificador**: o que distingue cada instância; vira a **chave primária**.

### Chaves: candidata, natural, substituta
- **Chave candidata**: qualquer coluna (ou conjunto) que identifica uma linha de forma única e sem NULL (CPF, e-mail, número de matrícula).
- **Chave natural**: vem do negócio; **pode mudar**, repetir ou ser reutilizada (e-mails mudam; CPFs podem ser cadastrados errado).
- **Chave substituta** (*surrogate*): um id gerado (identidade sequencial, UUID) **sem significado de negócio**; estável.
Prática comum: **chave primária substituta** + as chaves candidatas naturais declaradas como **§UNIQUE§** (e §NOT NULL§). Medido no laboratório: a restrição única barrou a duplicação ("duplicate key value violates unique constraint") e a chave primária composta (pedido, produto) impediu o mesmo produto duas vezes no mesmo pedido.

### Relacionamentos e cardinalidade
A **cardinalidade** diz **quantos** de cada lado:
- **1:1** (um usuário tem um perfil);
- **1:N** (um cliente faz muitos pedidos; um pedido pertence a **um** cliente);
- **N:N** (um aluno cursa vários cursos; um curso tem vários alunos).
E a **participação** diz se é **obrigatória** ou **opcional**: "todo pedido **deve** ter cliente" (§NOT NULL§ na chave estrangeira) x "um cliente **pode** não ter pedidos" (do lado de cliente, sem restrição). Perguntas úteis em cada ponta: "**no mínimo** quantos? no **máximo** quantos?".

### Notação de diagrama (DER)
Use o que a equipe entender: Peter Chen, "pé de galinha" (crow's foot), UML. Em texto, a sintaxe do **Mermaid** é prática e versionável junto ao código:
§§§
erDiagram
  CLIENTE ||--o{ PEDIDO : faz
  PEDIDO ||--|{ ITEM : contem
  PRODUTO ||--o{ ITEM : "aparece em"
  CLIENTE { int id PK
            string nome
            string email UK }
§§§
Leitura: §||--o{§ = "um (obrigatório) para zero ou muitos"; §||--|{§ = "um para um ou muitos". O desenho serve para **conversar com o negócio** e **revisar** o modelo; mantenha-o atualizado (ou gere-o do banco).

### Do modelo conceitual às tabelas
Regras de tradução:
1. **Cada entidade → uma tabela**; atributos → colunas; identificador → chave primária.
2. **1:N** → a chave estrangeira fica no lado **N** (§pedidos.cliente_id§).
3. **N:N** → **tabela de ligação** com as duas chaves estrangeiras (aula mod-04).
4. **1:1** → chave estrangeira **única** (ou a chave primária compartilhada: §perfis.usuario_id PRIMARY KEY REFERENCES usuarios§).
5. **Atributos multivalorados** → tabela própria.
6. **Regras de negócio simples** → §CHECK§, §NOT NULL§, §UNIQUE§, §DEFAULT§.
Medido (PostgreSQL 17): a chave primária compartilhada em 1:1 recusou um **segundo perfil** para o mesmo usuário ("duplicate key value violates unique constraint perfis_pkey"); uma restrição §CHECK (gerente_id <> id)§ recusou um funcionário que seria o **próprio gerente**.

### Nomes e convenções
Nomes **claros**, no vocabulário do negócio, **minúsculos com sublinhado**, singular ou plural **de forma consistente** (o curso usa plural para tabelas), chaves estrangeiras como §cliente_id§, datas com sufixo (§criado_em§), booleanos com prefixo (§ativo§). Evite abreviações obscuras e palavras reservadas.

### Armadilhas conceituais
- **Entidade que é papel**: "cliente" e "fornecedor" podem ser a mesma pessoa em papéis diferentes (modele **pessoa** + papéis).
- **Atributo que é entidade**: "cidade" como texto livre gera "Porto Alegre", "P. Alegre" e "poa"; uma tabela de cidades dá consistência (mas custa um JOIN).
- **Histórico ignorado**: sobrescrever o preço apaga o que foi cobrado no passado (guarde o **preço no item do pedido**, como §itens.preco_unitario§).
- **Excesso de generalidade**: um modelo "genérico" (tudo em chave/valor) é flexível e **péssimo** para integridade e consultas.
- **Pressa**: corrigir um modelo com dados em produção custa muito mais do que alguns dias de análise.`,
  concepts: [
    { term: 'Entidade', def: 'Objeto ou conceito do negócio com identidade própria sobre o qual se guardam dados.' },
    { term: 'Atributo', def: 'Propriedade que descreve uma entidade (nome, preço, data).' },
    { term: 'Relacionamento', def: 'Associação entre entidades, descrita por um verbo do negócio.' },
    { term: 'Cardinalidade', def: 'Quantidade de instâncias de cada lado de um relacionamento (1:1, 1:N, N:N).' },
    { term: 'Participação', def: 'Indica se um relacionamento é obrigatório ou opcional para uma entidade.' },
    { term: 'Chave candidata', def: 'Conjunto mínimo de colunas que identifica cada linha de forma única.' },
    { term: 'Chave natural', def: 'Chave com significado de negócio, como e-mail ou CPF.' },
    { term: 'Chave substituta', def: 'Identificador artificial sem significado de negócio, estável ao longo do tempo.' },
    { term: 'DER', def: 'Diagrama entidade-relacionamento: desenho de entidades, atributos e relacionamentos.' },
    { term: 'Modelo conceitual, lógico e físico', def: 'Três níveis de abstração: negócio, estrutura relacional independente do produto e implementação concreta.' }
  ],
  examples: R`**Analogia:** modelar é **projetar uma planta antes de construir**. O texto de requisitos é a conversa com o cliente ("quero uma casa com três quartos"); o modelo conceitual é o croqui; o lógico é a planta com medidas; o físico é a obra, com materiais e fornecedores. Descobrir que faltava uma parede quando o telhado está pronto sai caro. A chave substituta é o **número do lote** (estável), enquanto a chave natural é o **endereço** (pode mudar de nome de rua).

**Exemplo 1: de texto para entidades.** "Cada cliente faz vários pedidos; cada pedido contém vários produtos, com quantidade e preço na hora da compra." Entidades: cliente, pedido, produto; relacionamentos: cliente-pedido (1:N) e pedido-produto (N:N, com atributos quantidade e preço unitário).

**Exemplo 2: o preço no item.** O preço do produto muda, mas o item do pedido guarda o preço cobrado; assim o histórico não se perde.

**Exemplo 3: restrições medidas.** Um segundo perfil para o mesmo usuário foi recusado (chave primária compartilhada) e o funcionário que seria seu próprio gerente também.`,
  code: [
    { title: 'Diagrama em Mermaid e tradução para tabelas (texto e SQL)', lang: 'sql', code: R`-- erDiagram (Mermaid):
--   CLIENTE ||--o{ PEDIDO : faz
--   PEDIDO  ||--|{ ITEM   : contem
--   PRODUTO ||--o{ ITEM   : "aparece em"

CREATE TABLE clientes (
  id    serial PRIMARY KEY,                -- chave substituta
  nome  text NOT NULL,
  email text NOT NULL UNIQUE               -- chave candidata natural
);
CREATE TABLE produtos (
  id    serial PRIMARY KEY,
  nome  text NOT NULL UNIQUE,
  preco numeric(10,2) NOT NULL CHECK (preco >= 0)
);
CREATE TABLE pedidos (
  id         serial PRIMARY KEY,
  cliente_id int NOT NULL REFERENCES clientes(id),   -- 1:N, participação obrigatória
  criado_em  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE itens (
  pedido_id      int REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id     int REFERENCES produtos(id),
  qtd            int NOT NULL CHECK (qtd > 0),
  preco_unitario numeric(10,2) NOT NULL,           -- histórico do preço cobrado
  PRIMARY KEY (pedido_id, produto_id)               -- N:N com atributos
);`, notes: [{ l: '7', t: 'A chave candidata natural fica como UNIQUE NOT NULL.' }, { l: '17', t: 'NOT NULL na chave estrangeira expressa "todo pedido tem cliente".' }, { l: '23', t: 'O preço fica no item para preservar o histórico.' }, { l: '24', t: 'A chave composta impede o mesmo produto duas vezes no mesmo pedido.' }] },
    { title: '1:1 e autorrelacionamento com restrições (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`CREATE TABLE usuarios (id serial PRIMARY KEY, email text NOT NULL UNIQUE);
CREATE TABLE perfis (
  usuario_id int PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  bio text
);
INSERT INTO usuarios (email) VALUES ('a@x');
INSERT INTO perfis VALUES (1, 'oi');
INSERT INTO perfis VALUES (1, 'outro');
-- ERROR: duplicate key value violates unique constraint "perfis_pkey"

CREATE TABLE funcionarios (
  id int PRIMARY KEY, nome text,
  gerente_id int REFERENCES funcionarios(id),
  CHECK (gerente_id <> id)
);
INSERT INTO funcionarios VALUES (4, 'Loop', 4);
-- ERROR: new row violates check constraint "funcionarios_check"`, notes: [{ l: '3', t: 'A chave primária que é também chave estrangeira garante o 1:1.' }, { l: '13', t: 'CHECK impede o ciclo trivial de um funcionário ser seu próprio gerente.' }] }
  ],
  bestPractices: ['Comece pelo modelo conceitual, conversando com quem conhece o negócio.', 'Use chave primária substituta e declare as chaves naturais como UNIQUE NOT NULL.', 'Expresse cardinalidade e participação com chaves estrangeiras, NOT NULL e UNIQUE.', 'Guarde no item o preço cobrado (histórico), não só uma referência ao preço atual.', 'Mantenha o diagrama versionado junto ao código (por exemplo, Mermaid).', 'Padronize nomes e revise o modelo com a equipe antes de criar tabelas.'],
  mistakes: ['Pular direto para as tabelas sem entender o negócio.', 'Usar chaves naturais mutáveis como chave primária.', 'Modelar papéis (cliente, fornecedor) como entidades separadas quando são a mesma pessoa.', 'Guardar texto livre onde deveria haver uma entidade (cidade, categoria).', 'Ignorar o histórico (preços, endereços).', 'Criar um modelo "genérico" demais (chave/valor para tudo).'],
  market: R`Em entrevistas e no dia a dia, a pergunta "como você modelaria isto?" revela mais sobre uma pessoa desenvolvedora do que muitas perguntas de sintaxe. Modelos bem pensados reduzem bugs de dados, simplificam consultas e tornam migrações previsíveis; os ruins viram o motivo de reescritas caras.`,
  summary: R`Modelar vai do conceitual ao lógico e ao físico. Substantivos viram entidades, verbos viram relacionamentos e regras viram cardinalidade e restrições. Use chave substituta e declare as naturais como §UNIQUE NOT NULL§. 1:N coloca a chave estrangeira no lado N; N:N exige tabela de ligação; 1:1 usa chave única (medido: o segundo perfil foi recusado). Guarde o preço cobrado no item, padronize nomes e desenhe o DER para revisão.`,
  refs: [REF.er, REF.mermaidEr, REF.constraints, REF.createTable],
  cards: [
    { q: 'Quais os três níveis de modelo?', a: 'Conceitual (negócio), lógico (tabelas e chaves) e físico (produto, tipos, índices).' },
    { q: 'Qual a diferença entre chave natural e substituta?', a: 'A natural vem do negócio e pode mudar; a substituta é um id artificial, estável e sem significado de negócio.' },
    { q: 'Onde fica a chave estrangeira em um relacionamento 1:N?', a: 'No lado N (por exemplo, pedidos.cliente_id).' },
    { q: 'Por que guardar o preço no item do pedido?', a: 'Para preservar o preço cobrado, que pode mudar no cadastro do produto.' },
    { q: 'Como expressar participação obrigatória?', a: 'Com NOT NULL na chave estrangeira.' }
  ]
},
{
  id: 'mod-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['normalização', '1FN', '2FN', '3FN', 'dependência funcional', 'anomalias'],
  title: 'Normalização: anomalias, dependências funcionais e as formas normais até a 3FN',
  objectives: ['Reconhecer as anomalias de atualização, inserção e exclusão em uma tabela mal projetada', 'Explicar dependência funcional, chave, dependência parcial e transitiva', 'Aplicar a primeira, a segunda e a terceira forma normal passo a passo', 'Verificar uma decomposição sem perdas com consultas', 'Explicar a BCNF e quando parar de normalizar'],
  intro: R`Uma tabela "tudo em um lugar só" parece prática, mas **repete fatos** e, por isso, permite **dados contraditórios**. A **normalização** é o método para decompor tabelas até que **cada fato seja guardado uma vez, no lugar certo**. Esta aula mostra as **anomalias na prática** (medidas no PostgreSQL 17.12), as **formas normais** de 1FN a 3FN, e como **provar** que a decomposição não perdeu informação.`,
  theory: R`### Uma tabela problemática
Considere uma planilha transformada em tabela, com uma linha por item de pedido:
§pedidos_plano(pedido, cliente, cidade, produto, categoria, preco, qtd)§, chave primária §(pedido, produto)§. Dados: 4 linhas, 2 clientes (Ana nos pedidos 1 e 2, Bruno no pedido 3). Os mesmos fatos aparecem várias vezes: a **cidade da Ana** em 3 linhas; o **preço do Caderno** em 2.

### As três anomalias (medidas)
1. **Atualização**: a Ana mudou de cidade; alguém atualizou **uma** linha (§UPDATE ... WHERE pedido = 1 AND produto = 'Caneta'§). Resultado medido: a consulta por cliente e cidade devolveu **duas cidades** para a Ana ("Gramado" e "Porto Alegre"). **O banco não percebe a contradição**: nada o impede.
2. **Inserção**: cadastrar a cliente Carla (ainda sem pedidos) **falhou** com **null value in column "pedido" violates not-null constraint**: a tabela só consegue guardar clientes **junto de** um pedido.
3. **Exclusão**: apagar o pedido 3 (único do Bruno) eliminou **todas** as informações do Bruno: depois do §DELETE§, restaram **0** linhas dele.
Observação de método: o preço do Caderno aparece em **duas linhas** (pedidos 1 e 3). Nada no esquema impede que elas tenham preços diferentes; no experimento, o pedido 3 (do Bruno) foi apagado antes de a divergência poder ser observada, então **este exemplo não mostra a divergência medida**: ele só mostra que a estrutura a permitiria.

### Dependência funcional
Uma **dependência funcional** X → Y significa: **para cada valor de X há no máximo um valor de Y**. Exemplos: §produto → categoria§ (cada produto tem uma categoria), §cliente → cidade§ (se cada cliente mora em uma cidade), §(pedido, produto) → qtd§. A **chave** de uma tabela é um conjunto de colunas que **determina todas as outras**. A normalização trata das dependências **que não são a chave inteira**.

### 1FN: valores atômicos, sem grupos repetidos
A **primeira forma normal** exige: cada célula guarda **um valor** (não lista), sem colunas repetidas (§telefone1, telefone2, telefone3§) e com chave definida. Violação típica: §telefones = '1111,2222'§. Problemas: não dá para **validar** cada telefone, **indexar** direito ou **juntar**; buscas com §LIKE '%222%'§ são imprecisas (medido: tanto §LIKE '%222%'§ quanto §LIKE '%22%'§ devolveram a mesma linha, sem distinguir o telefone). **Correção:** uma tabela §telefones(aluno_id, numero)§ (relacionamento 1:N). (No PostgreSQL, arrays e JSONB permitem listas, mas são **decisões conscientes** de desnormalização, aula mod-05.)

### 2FN: sem dependência parcial da chave
Vale quando a chave é **composta**. A **segunda forma normal** exige 1FN **e** que todo atributo não chave dependa da **chave inteira**, não de **parte** dela. Em §pedidos_plano§ com chave §(pedido, produto)§: §cliente§ e §cidade§ dependem **só de §pedido§**, e §categoria§ depende **só de §produto§**: são dependências **parciais**. **Correção:** separar §pedidos(pedido, cliente_id)§ e §produtos(produto, categoria, preco)§, mantendo §itens(pedido, produto, qtd)§.

### 3FN: sem dependência transitiva
A **terceira forma normal** exige 2FN **e** que nenhum atributo não chave dependa de **outro atributo não chave**. Exemplo: §func_ruim(id, nome, depto_id, depto_nome)§: §id → depto_id§ e §depto_id → depto_nome§, logo §depto_nome§ depende do §id§ **por transitividade**. Medido: ao renomear o departamento só na linha do funcionário 1 ("Comercial"), o departamento 10 ficou com **dois nomes** ("Comercial" e "Vendas"). **Correção:** §departamentos(depto_id, nome)§ e §funcionarios(id, nome, depto_id)§. Resumo mnemônico: "**cada atributo depende da chave, da chave inteira e de nada além da chave**".

### O modelo normalizado (medido)
Decompomos §pedidos_plano§ em §clientes§, §produtos§, §pedidos§ e §itens§ (aula mod-01):
- **Atualização:** §UPDATE clientes SET cidade = 'Gramado' WHERE nome = 'Ana'§ muda **um** lugar; a consulta por cliente mostrou **Ana: Gramado, 2 pedidos**, sem contradição.
- **Inserção:** a Carla foi cadastrada em §clientes§ **sem pedidos** (0 pedidos).
- **Exclusão:** apagar o pedido 3 **manteve** o Bruno em §clientes§.

### Decomposição sem perdas
Decompor **não pode perder informação**: juntando as partes devemos **reconstruir exatamente** a tabela original. Medido: o JOIN de §itens§, §pedidos§, §clientes§ e §produtos§ reconstruiu as **3 linhas** esperadas (as que restaram após o delete). Teste prático: compare a reconstrução com o original usando §EXCEPT§ nos dois sentidos (resultado vazio = equivalentes). A decomposição é sem perdas quando a **interseção** das partes contém uma **chave** de pelo menos uma delas (por isso as chaves estrangeiras).

### Forma normal de Boyce-Codd (BCNF) em uma frase
A **BCNF** é uma 3FN mais rigorosa: **toda dependência funcional tem como lado esquerdo uma superchave**. Difere da 3FN em casos raros de **chaves candidatas sobrepostas** (por exemplo, "sala, horário → professor" e "professor → sala"). Na prática, **3FN costuma bastar**; vá à BCNF se uma dependência não chave ainda causar anomalias.

### Formas superiores e quando parar
A **4FN** trata dependências multivaloradas (duas listas independentes na mesma tabela) e a **5FN**, junções complexas; surgem pouco. **Pare na 3FN** (ou BCNF) como padrão e **desnormalize só com medição** (aula mod-05). Normalizar demais não "quebra" nada, mas cria **mais JOINs**; normalizar de menos **quebra a integridade**.

### Processo prático
1. Liste as colunas e as **dependências funcionais** do negócio (pergunte "dado isto, quantos destes?").
2. Defina a **chave**.
3. Elimine **grupos repetidos** (1FN), **dependências parciais** (2FN) e **transitivas** (3FN).
4. Crie tabelas e **chaves estrangeiras**.
5. **Verifique** com a reconstrução e com consultas de anomalia.`,
  concepts: [
    { term: 'Normalização', def: 'Processo de decompor tabelas para que cada fato seja guardado uma só vez, eliminando redundância e anomalias.' },
    { term: 'Anomalia de atualização', def: 'Inconsistência que surge quando um fato repetido é alterado em apenas algumas linhas.' },
    { term: 'Anomalia de inserção', def: 'Impossibilidade de guardar um fato sem outro não relacionado.' },
    { term: 'Anomalia de exclusão', def: 'Perda de um fato ao apagar linhas que também o continham.' },
    { term: 'Dependência funcional', def: 'Relação X → Y em que cada valor de X determina no máximo um valor de Y.' },
    { term: 'Primeira forma normal (1FN)', def: 'Cada célula guarda um valor atômico, sem grupos repetidos.' },
    { term: 'Segunda forma normal (2FN)', def: 'Está em 1FN e nenhum atributo depende de parte da chave composta.' },
    { term: 'Terceira forma normal (3FN)', def: 'Está em 2FN e nenhum atributo não chave depende de outro atributo não chave.' },
    { term: 'BCNF', def: 'Forma normal em que todo determinante é uma superchave.' },
    { term: 'Decomposição sem perdas', def: 'Divisão de uma tabela cujas partes, juntadas, reconstroem exatamente a original.' }
  ],
  examples: R`**Analogia:** uma tabela não normalizada é um **caderno de endereços em que cada vez que você anota um recado escreve de novo o endereço do amigo**. Se o amigo muda de casa, você precisa achar e corrigir **todas** as páginas; se esquecer uma, o caderno **se contradiz**. Normalizar é ter **uma ficha por amigo** (com o endereço uma só vez) e os recados apenas **apontando para a ficha**. As anomalias são: corrigir só uma página (atualização), não poder anotar um amigo novo porque "ainda não há recado" (inserção) e perder o endereço ao rasgar o último recado (exclusão).

**Exemplo 1: atualização.** A Ana apareceu com duas cidades depois de atualizar uma só linha.

**Exemplo 2: dependência transitiva.** O departamento 10 passou a ter dois nomes.

**Exemplo 3: normalizado.** A mesma mudança de cidade altera um lugar; a cliente sem pedidos existe; apagar um pedido não apaga o cliente.`,
  code: [
    { title: 'As anomalias medidas (SQL, saída no PostgreSQL 17)', lang: 'sql', code: R`CREATE TABLE pedidos_plano (
  pedido int, cliente text, cidade text, produto text, categoria text, preco numeric(10,2), qtd int,
  PRIMARY KEY (pedido, produto)
);
-- Ana: pedidos 1 e 2; Bruno: pedido 3

UPDATE pedidos_plano SET cidade = 'Gramado' WHERE pedido = 1 AND produto = 'Caneta';
SELECT DISTINCT cliente, cidade FROM pedidos_plano WHERE cliente = 'Ana';
-- Ana | Gramado  e  Ana | Porto Alegre   (contradição)

INSERT INTO pedidos_plano (cliente, cidade) VALUES ('Carla', 'Pelotas');
-- ERROR: null value in column "pedido" violates not-null constraint

DELETE FROM pedidos_plano WHERE pedido = 3;
SELECT count(*) FROM pedidos_plano WHERE cliente = 'Bruno';   -- 0 (Bruno desapareceu)`, notes: [{ l: '7', t: 'Alterar um fato repetido em uma linha só deixa o banco contraditório.' }, { l: '11', t: 'Não há como registrar um cliente sem pedido.' }, { l: '14', t: 'Apagar o único pedido apaga o cliente junto.' }] },
    { title: 'Normalizado e reconstrução sem perdas (SQL, saída medida)', lang: 'sql', code: R`CREATE TABLE clientes (id serial PRIMARY KEY, nome text NOT NULL UNIQUE, cidade text);
CREATE TABLE produtos (id serial PRIMARY KEY, nome text NOT NULL UNIQUE, categoria text NOT NULL, preco numeric(10,2) NOT NULL);
CREATE TABLE pedidos (id int PRIMARY KEY, cliente_id int NOT NULL REFERENCES clientes(id));
CREATE TABLE itens (
  pedido_id int REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id int REFERENCES produtos(id),
  qtd int NOT NULL, preco_unitario numeric(10,2) NOT NULL,
  PRIMARY KEY (pedido_id, produto_id));

UPDATE clientes SET cidade = 'Gramado' WHERE nome = 'Ana';        -- um único lugar
DELETE FROM pedidos WHERE id = 3;                                  -- o Bruno continua em clientes

-- reconstrução: junta as 4 tabelas e confere com a tabela original (EXCEPT nos dois sentidos)
SELECT p.id AS pedido, c.nome AS cliente, c.cidade, pr.nome AS produto, pr.categoria, i.preco_unitario AS preco, i.qtd
FROM itens i JOIN pedidos p ON p.id = i.pedido_id JOIN clientes c ON c.id = p.cliente_id JOIN produtos pr ON pr.id = i.produto_id;
-- 3 linhas`, notes: [{ l: '9', t: 'A cidade da Ana existe em um só lugar.' }, { l: '10', t: 'Excluir o pedido não apaga o cliente.' }, { l: '13', t: 'A junção das partes reconstrói a tabela original sem perder informação.' }] }
  ],
  bestPractices: ['Liste as dependências funcionais do negócio antes de decompor.', 'Aplique 1FN, 2FN e 3FN em sequência e pare na 3FN (ou BCNF) como padrão.', 'Verifique a decomposição reconstruindo a original (EXCEPT nos dois sentidos).', 'Teste as três anomalias antes e depois como casos de verificação.', 'Declare as chaves estrangeiras que ligam as partes.', 'Desnormalize só com medição e documentação.'],
  mistakes: ['Guardar listas em uma coluna de texto.', 'Repetir dados do cliente em cada linha de pedido.', 'Normalizar sem definir as dependências funcionais.', 'Decompor sem chaves estrangeiras, perdendo a ligação entre as partes.', 'Achar que normalizar sempre deixa o sistema lento.', 'Desnormalizar por "performance" sem medir.'],
  market: R`Perguntas sobre formas normais são clássicas, mas o valor real está em reconhecer **dados duplicados que vão divergir**. Muitos bugs de "o relatório mostra duas cidades para o mesmo cliente" têm esta origem. Equipes experientes normalizam por padrão e desnormalizam com evidências.`,
  summary: R`Tabelas que repetem fatos sofrem anomalias, todas medidas: atualizar uma linha deixou a Ana com duas cidades; cadastrar uma cliente sem pedido falhou; apagar o pedido do Bruno eliminou o Bruno. Dependência funcional X → Y guia a decomposição: 1FN (valores atômicos), 2FN (sem dependência parcial) e 3FN (sem dependência transitiva; o departamento 10 ganhou dois nomes). O modelo normalizado atualizou um lugar, aceitou a cliente sem pedidos e manteve o Bruno; o JOIN reconstruiu as linhas originais. Pare na 3FN e desnormalize só com medição.`,
  refs: [REF.normalization, REF.fd, REF.constraints],
  cards: [
    { q: 'Quais são as três anomalias?', a: 'Atualização (fato repetido divergente), inserção (não dá para guardar um fato sozinho) e exclusão (perda de um fato ao apagar outro).' },
    { q: 'O que é dependência funcional X → Y?', a: 'Cada valor de X determina no máximo um valor de Y.' },
    { q: 'O que a 2FN elimina?', a: 'Dependências parciais de atributos em parte de uma chave composta.' },
    { q: 'O que a 3FN elimina?', a: 'Dependências transitivas entre atributos não chave.' },
    { q: 'Como verificar uma decomposição sem perdas?', a: 'Juntar as partes e comparar com a tabela original usando EXCEPT nos dois sentidos.' }
  ]
}
];
