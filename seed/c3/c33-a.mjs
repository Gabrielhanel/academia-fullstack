// C3.3 — PostgreSQL e MySQL: operação e desempenho. Aulas 1 a 3 (instalação e clientes; tipos de dados; PostgreSQL x MySQL).
const R = String.raw;

export const REF = {
  pgDocker: { title: 'Docker Hub — imagem oficial postgres', url: 'https://hub.docker.com/_/postgres', kind: 'doc' },
  mysqlDocker: { title: 'Docker Hub — imagem oficial mysql', url: 'https://hub.docker.com/_/mysql', kind: 'doc' },
  psql: { title: 'PostgreSQL 17 — psql', url: 'https://www.postgresql.org/docs/17/app-psql.html', kind: 'doc' },
  pgHba: { title: 'PostgreSQL 17 — pg_hba.conf', url: 'https://www.postgresql.org/docs/17/auth-pg-hba-conf.html', kind: 'doc' },
  pgRoles: { title: 'PostgreSQL 17 — Database Roles', url: 'https://www.postgresql.org/docs/17/user-manag.html', kind: 'doc' },
  mysqlClient: { title: 'MySQL 8.4 — mysql Client', url: 'https://dev.mysql.com/doc/refman/8.4/en/mysql.html', kind: 'doc' },
  pgTypes: { title: 'PostgreSQL 17 — Data Types', url: 'https://www.postgresql.org/docs/17/datatype.html', kind: 'doc' },
  pgNumeric: { title: 'PostgreSQL 17 — Numeric Types', url: 'https://www.postgresql.org/docs/17/datatype-numeric.html', kind: 'doc' },
  pgDatetime: { title: 'PostgreSQL 17 — Date/Time Types', url: 'https://www.postgresql.org/docs/17/datatype-datetime.html', kind: 'doc' },
  mysqlTypes: { title: 'MySQL 8.4 — Data Types', url: 'https://dev.mysql.com/doc/refman/8.4/en/data-types.html', kind: 'doc' },
  mysqlSqlMode: { title: 'MySQL 8.4 — Server SQL Modes', url: 'https://dev.mysql.com/doc/refman/8.4/en/sql-mode.html', kind: 'doc' },
  mysqlInnodb: { title: 'MySQL 8.4 — The InnoDB Storage Engine', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html', kind: 'doc' },
  mysqlIsolation: { title: 'MySQL 8.4 — InnoDB Transaction Isolation Levels', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html', kind: 'doc' },
  pgMvcc: { title: 'PostgreSQL 17 — Concurrency Control (MVCC)', url: 'https://www.postgresql.org/docs/17/mvcc-intro.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'pgm-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['instalação', 'Docker', 'psql', 'mysql client', 'roles', 'autenticação'],
  title: 'Instalação e clientes: PostgreSQL com psql, MySQL com mysql e o primeiro acesso seguro',
  objectives: ['Subir PostgreSQL e MySQL em contêineres oficiais e conectar com os clientes de linha de comando', 'Usar os principais comandos do §psql§ (§\\l§, §\\dn§, §\\dt§, §\\d§, §\\conninfo§, §\\timing§)', 'Distinguir servidor, banco de dados, esquema, papel (role) e usuário nos dois sistemas', 'Entender a autenticação (§pg_hba.conf§ e contas do MySQL) e os cuidados mínimos de segurança', 'Registrar a versão e a configuração do ambiente usado em experimentos'],
  intro: R`Antes de otimizar qualquer coisa, é preciso **ter um banco funcionando, saber conectar-se a ele e saber em que versão e configuração você está**. Esta aula mostra a instalação mais prática e reproduzível (contêineres das imagens **oficiais**), os clientes de linha de comando e os conceitos de **servidor, banco, esquema e papel**. Os experimentos deste curso rodam em **PostgreSQL 17.12** e **MySQL 8.4.13**, versões efetivamente executadas no laboratório.`,
  theory: R`### Duas formas de instalar
1. **Pacote do sistema** ou instalador oficial: bom para uma máquina dedicada (servidor), exige configurar serviço, usuário do sistema e atualizações.
2. **Contêiner Docker** da imagem oficial: rápido, descartável, reproduzível e isolado, ideal para estudo e testes. É o que usamos no curso.
§§§
docker run -d --name c3-pg17 -e POSTGRES_PASSWORD=lab -p 127.0.0.1:55432:5432 postgres:17
docker run -d --name c3-mysql84 -e MYSQL_ROOT_PASSWORD=lab -p 127.0.0.1:53306:3306 mysql:8.4
§§§
Pontos de segurança mesmo em um laboratório: **publique a porta só em §127.0.0.1§** (como acima), para que outras máquinas da rede não alcancem o banco; **senhas de exemplo como §lab§ nunca vão para produção**; fixe a **versão** da imagem (§postgres:17§, não §latest§) para os resultados serem reproduzíveis. Dados em contêiner somem ao removê-lo, a menos que você monte um **volume**. Medido: o PostgreSQL respondeu §PostgreSQL 17.12 (Debian ...)§ e o MySQL §8.4.13§.

### Os clientes de linha de comando
- **PostgreSQL: §psql§**. Conectar: §psql -h host -p porta -U usuario -d banco§ (senha por §PGPASSWORD§ ou arquivo §.pgpass§). Executar arquivo: §psql -f script.sql§. Meta-comandos (começam com barra invertida e **não** são SQL):
| Meta-comando | O que faz |
|---|---|
| §\conninfo§ | mostra a conexão (medido: banco §postgres§, usuário §postgres§, porta 5432) |
| §\l§ | lista bancos (com tamanho, codificação e dono) |
| §\dn§ | lista esquemas (medido: §lab§, §loja§, §public§, §tuning§, §vendas§) |
| §\dt esquema.*§ | lista tabelas (medido: 13 tabelas em §tuning§, uma delas particionada) |
| §\d tabela§ | descreve colunas, tipos, índices e restrições |
| §\timing§ | mostra o tempo de cada comando |
| §\x§ | alterna a exibição expandida (uma coluna por linha) |
| §\copy§ | importa/exporta arquivos pelo cliente |
| §\i arquivo§ | executa um script |
- **MySQL: §mysql§**. Conectar: §mysql -h host -P porta -u usuario -p§. Comandos úteis: §SHOW DATABASES§, §USE banco§, §SHOW TABLES§, §DESCRIBE tabela§, §SHOW CREATE TABLE tabela§, §SELECT VERSION()§. Em scripts, passe §--default-character-set=utf8mb4§: medido, sem isso, o texto "versão" apareceu **corrompido** (conexão em latin1). Opções úteis: §--table§ (formato tabular em modo não interativo), §--force§ (continua após erros em um script).
Evite passar a senha na linha de comando (o MySQL avisa: §Using a password on the command line interface can be insecure§): use variáveis de ambiente, arquivo de opções protegido ou prompt.

### Servidor, banco, esquema e papel
- **Servidor (instância/cluster)**: um processo com seus arquivos, portas e configuração.
- **Banco de dados**: um conjunto isolado de dados dentro do servidor. No PostgreSQL, **uma conexão fala com um banco** (não se consulta outro banco na mesma conexão sem extensões). No MySQL, **"database" e "schema" são sinônimos**: §CREATE DATABASE§ e §CREATE SCHEMA§ fazem a mesma coisa, e é possível consultar várias bases na mesma conexão (§banco.tabela§).
- **Esquema (PostgreSQL)**: espaço de nomes **dentro** do banco (§public§ é o padrão). Agrupa objetos, organiza permissões e evita colisões; o §search_path§ define onde procurar nomes não qualificados.
- **Papel (role) no PostgreSQL**: tanto usuário quanto grupo (um papel pode ter §LOGIN§ ou não). **Conta no MySQL**: identificada por §usuário@host§.
Princípio de **menor privilégio**: crie um papel/conta **por aplicação**, com permissões só nas tabelas necessárias; **não use o superusuário (§postgres§, §root§) na aplicação**.

### Autenticação e rede
- **PostgreSQL**: o arquivo §pg_hba.conf§ define **quem** pode conectar **de onde**, a **qual banco** e com **qual método** (§scram-sha-256§ recomendado; §trust§ **nunca** em produção). Medido: para a réplica conectar-se ao primário, foi necessário adicionar uma linha §host replication all 0.0.0.0/0 scram-sha-256§ e recarregar a configuração (§SELECT pg_reload_conf()§); em produção, restrinja o endereço.
- **MySQL**: contas e privilégios ficam em tabelas do sistema (§CREATE USER§, §GRANT§); o plugin de autenticação padrão do 8.4 é o §caching_sha2_password§.
- Em ambos: **TLS** nas conexões fora da máquina, firewall e redes privadas.

### Registre o ambiente
Em qualquer experimento de desempenho, anote: **versão** do servidor, **parâmetros** relevantes, **hardware/recursos** do contêiner, volume e distribuição dos dados e o **comando** que gerou os números. Medido neste laboratório: §shared_buffers§ = **128MB**, §work_mem§ = **4MB** e §max_connections§ = **100** (padrões do PostgreSQL, **muito conservadores** para produção). Resultados de tempo em um laptop com contêiner **não** se transferem para outro ambiente; o que se transfere é a **forma do plano** e a **ordem de grandeza** das diferenças.

### Extensões do PostgreSQL
O PostgreSQL é extensível (§CREATE EXTENSION§). Medido na imagem oficial: disponíveis §btree_gist§, §pg_stat_statements§, §pg_trgm§, §pgcrypto§, §tablefunc§ e §uuid-ossp§ (entre outras). Elas aparecem ao longo do curso (busca por similaridade, índices GiST, estatísticas de consultas).`,
  concepts: [
    { term: 'psql', def: 'Cliente de linha de comando do PostgreSQL, com meta-comandos que começam por barra invertida.' },
    { term: 'Meta-comando', def: 'Comando do psql (como \\dt) que não é SQL e é interpretado pelo cliente.' },
    { term: 'Banco de dados (PostgreSQL)', def: 'Conjunto isolado de dados dentro do servidor; cada conexão se liga a um banco.' },
    { term: 'Esquema', def: 'Espaço de nomes dentro de um banco do PostgreSQL; no MySQL é sinônimo de database.' },
    { term: 'Papel (role)', def: 'Entidade do PostgreSQL que representa usuário ou grupo e recebe permissões.' },
    { term: 'pg_hba.conf', def: 'Arquivo do PostgreSQL que define quem pode conectar, de onde e com qual método de autenticação.' },
    { term: 'search_path', def: 'Lista de esquemas em que o PostgreSQL procura nomes de objetos não qualificados.' },
    { term: 'Menor privilégio', def: 'Princípio de conceder a cada conta apenas as permissões necessárias.' },
    { term: 'Imagem oficial', def: 'Imagem Docker mantida pelo projeto ou organização responsável pelo software.' },
    { term: 'Extensão', def: 'Módulo que acrescenta recursos ao PostgreSQL (pg_trgm, btree_gist, pgcrypto).' }
  ],
  examples: R`**Analogia:** o servidor é um **prédio**; cada banco de dados do PostgreSQL é um **apartamento** com chave própria (uma conexão entra em um apartamento por vez); os esquemas são **cômodos** com nomes. No MySQL, o "prédio" tem **andares abertos** onde você circula entre as bases. O pg_hba.conf é a **portaria**: define quem entra, por qual porta, mostrando que documento. O menor privilégio é dar ao entregador a chave **só da portaria**, e não do apartamento.

**Exemplo 1: reproduzir o ambiente.** Dois comandos §docker run§ com versões fixas e portas só em 127.0.0.1.

**Exemplo 2: conhecer o banco.** §\dn§ lista cinco esquemas; §\dt tuning.*§ lista as tabelas do esquema do laboratório.

**Exemplo 3: acentos quebrados.** O cliente §mysql§ sem §--default-character-set=utf8mb4§ mostrou "versão" corrompido.`,
  code: [
    { title: 'Subir os servidores e conectar (bash, executado)', lang: 'bash', code: R`# PostgreSQL 17 e MySQL 8.4 só acessíveis pela própria máquina
docker run -d --name c3-pg17 -e POSTGRES_PASSWORD=lab -p 127.0.0.1:55432:5432 postgres:17
docker run -d --name c3-mysql84 -e MYSQL_ROOT_PASSWORD=lab -p 127.0.0.1:53306:3306 mysql:8.4

# clientes (dentro dos contêineres)
docker exec c3-pg17 psql -U postgres -tAc "select version()"
docker exec c3-mysql84 mysql -uroot -plab --default-character-set=utf8mb4 -e "select version()"

# executar um script SQL no PostgreSQL
docker exec -i c3-pg17 psql -U postgres -q -f - < script.sql`, notes: [{ l: '2', t: '127.0.0.1 impede o acesso por outras máquinas da rede.' }, { l: '3', t: 'A variável MYSQL_ROOT_PASSWORD define a senha do root (apenas para laboratório).' }, { l: '9', t: 'O utf8mb4 evita a corrupção de acentos na conexão.' }] },
    { title: 'Explorando com psql (saída medida no PostgreSQL 17)', lang: 'sql', code: R`\conninfo      -- banco postgres, usuário postgres, porta 5432
\dn            -- lab, loja, public, tuning, vendas
\dt tuning.*   -- 13 tabelas (inclui a particionada log_p)
\d tuning.clientes
-- Column | Type    | Nullable
-- id     | integer | not null
-- nome   | text    |
-- uf     | text    |
-- Indexes: clientes_pkey PRIMARY KEY btree (id) ; idx_lower btree (lower(nome))

SHOW shared_buffers;   -- 128MB
SHOW work_mem;         -- 4MB`, notes: [{ l: '1', t: 'Meta-comandos são do psql: não funcionam em outros clientes.' }, { l: '4', t: '\\d lista colunas, índices e restrições da tabela.' }, { l: '10', t: 'Os padrões são conservadores; produção exige ajuste.' }] }
  ],
  bestPractices: ['Use imagens oficiais com versão fixa e registre-a nos experimentos.', 'Publique portas de laboratório só em 127.0.0.1.', 'Crie um papel ou conta por aplicação, com menor privilégio.', 'Nunca use trust no pg_hba.conf nem o superusuário na aplicação.', 'Passe --default-character-set=utf8mb4 ao usar o cliente mysql.', 'Anote versão, configuração e comando em todo teste de desempenho.'],
  mistakes: ['Usar a tag latest e perder a reprodutibilidade.', 'Expor a porta do banco a toda a rede.', 'Deixar senhas de exemplo em ambientes reais.', 'Conectar a aplicação como postgres ou root.', 'Confundir database e schema ao migrar entre PostgreSQL e MySQL.', 'Comparar tempos de ambientes diferentes como se fossem equivalentes.'],
  market: R`Subir um banco rapidamente, conectar com o cliente certo e entender papéis e autenticação é o primeiro dia de qualquer trabalho com dados. Em incidentes reais, bancos expostos com senha padrão e contas superprivilegiadas estão entre as causas mais comuns.`,
  summary: R`Contêineres das imagens oficiais permitem reproduzir PostgreSQL 17.12 e MySQL 8.4.13 em minutos, com a porta só em 127.0.0.1. O §psql§ usa meta-comandos (§\l§, §\dn§, §\dt§, §\d§, §\timing§); o §mysql§ precisa de §--default-character-set=utf8mb4§ para acentos. No PostgreSQL, uma conexão fala com um banco e os esquemas organizam objetos; no MySQL, database e schema são sinônimos. A autenticação do PostgreSQL vem do §pg_hba.conf§; aplique menor privilégio e registre o ambiente dos experimentos.`,
  refs: [REF.pgDocker, REF.mysqlDocker, REF.psql, REF.pgHba, REF.pgRoles, REF.mysqlClient],
  cards: [
    { q: 'Qual a diferença entre banco e esquema no PostgreSQL?', a: 'O banco isola os dados dentro do servidor e a conexão se liga a um; o esquema é um espaço de nomes dentro do banco.' },
    { q: 'Database e schema são a mesma coisa no MySQL?', a: 'Sim, são sinônimos.' },
    { q: 'O que define quem pode conectar ao PostgreSQL?', a: 'O arquivo pg_hba.conf (origem, banco, usuário e método de autenticação).' },
    { q: 'Por que fixar a versão da imagem Docker?', a: 'Para que os resultados sejam reproduzíveis; a tag latest muda ao longo do tempo.' },
    { q: 'Qual o risco de rodar a aplicação como postgres ou root?', a: 'Permissões excessivas: uma falha ou injeção pode alterar ou apagar qualquer dado.' }
  ]
},
{
  id: 'pgm-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['tipos de dados', 'numeric', 'timestamptz', 'utf8mb4', 'ENUM', 'JSON', 'precisão'],
  title: 'Tipos de dados: escolhas corretas e diferenças entre PostgreSQL e MySQL',
  objectives: ['Escolher tipos numéricos, de texto, de data e hora e booleanos adequados em cada sistema', 'Explicar a diferença entre §timestamp§ e §timestamptz§ (e §DATETIME§ e §TIMESTAMP§ no MySQL) com fusos horários', 'Prever estouros de faixa e truncamentos e como o modo estrito os trata', 'Aplicar tipos específicos do PostgreSQL (§uuid§, arrays, ranges, §jsonb§) e do MySQL (§ENUM§, §JSON§)', 'Justificar uma escolha de tipo pelo impacto em armazenamento, integridade e desempenho'],
  intro: R`O **tipo** de cada coluna é uma decisão de modelagem com efeitos duradouros: define **o que cabe**, **quanto ocupa**, **como se compara** e **quais índices e operadores** estarão disponíveis. Trocar o tipo depois de bilhões de linhas é caro. Esta aula mostra as escolhas certas e **as diferenças mensuráveis** entre PostgreSQL 17.12 e MySQL 8.4.13, incluindo as armadilhas de fuso horário, ponto flutuante, truncamento e acentos.`,
  theory: R`### Números
- **Inteiros**: §smallint§ (2 bytes), §integer§ (4), §bigint§ (8). **Escolha pelo domínio** e deixe folga: um §integer§ comporta até **2.147.483.647**. Medido no PostgreSQL: §2147483647::int + 1§ falhou com **integer out of range**, e com §bigint§ deu **2147483648**. No MySQL, o literal §2147483647 + 1§ deu 2147483648 (o cálculo usa tipo maior), mas **inserir** 2147483648 em uma coluna §INT§ falhou com **Out of range value for column** (modo estrito).
- **Decimal exato**: §numeric(p,s)§ no PostgreSQL e §DECIMAL(p,s)§ no MySQL. **Use para dinheiro.**
- **Ponto flutuante**: §double precision§ / §real§ (PostgreSQL) e §DOUBLE§ / §FLOAT§ (MySQL) são **aproximados**. Medido nos dois: §0.1 + 0.2§ em ponto flutuante deu **0.30000000000000004** e a comparação com 0,3 foi **falsa**; em decimal exato deu **0.3** e a comparação foi **verdadeira**.
- **Identidade**: §GENERATED ALWAYS AS IDENTITY§ (PostgreSQL moderno; §serial§ é o legado) e §AUTO_INCREMENT§ (MySQL). Para chaves **distribuídas** ou não adivinháveis, §uuid§ (§gen_random_uuid()§ no PostgreSQL; medido: tipo §uuid§); UUIDs aleatórios em chaves primárias B-tree têm custo de localidade (curso C3.4).

### Texto
- PostgreSQL: §text§ (sem limite prático) e §varchar(n)§ (com limite); **não há diferença de desempenho** entre eles; use §varchar(n)§ só se o limite for regra de negócio. §char(n)§ preenche com espaços e é raramente a melhor escolha.
- MySQL: §VARCHAR(n)§ (o limite conta **caracteres**) e §TEXT§; em MySQL as colunas de texto têm **codificação e collation** (padrão do 8.4: §utf8mb4§ com §utf8mb4_0900_ai_ci§, **insensível a maiúsculas e acentos**).
- **Codificação**: use **UTF-8** (§utf8mb4§ no MySQL; §utf8mb3§/§utf8§ antigo não guarda emojis). Medido: §'ação'§ tem **4 caracteres** e **6 bytes** nos dois sistemas.
- **Comparação**: medido, §nome = 'CANETA'§ no PostgreSQL devolveu **0 linhas** (comparação sensível a maiúsculas), enquanto no MySQL devolveu **2** (Caneta e caneta). §'abc' = 'abc '§ no MySQL 8.4 foi **falso** (a collation atual não ignora espaços finais). Para busca insensível no PostgreSQL: §lower()§ com índice de expressão, §ILIKE§, o tipo §citext§ (extensão) ou collations não determinísticas.
- **Limite excedido**: PostgreSQL falhou com **value too long for type character varying(50)**; MySQL em modo estrito falhou com **Data too long for column 'nome'**, e com §sql_mode = ''§ **truncou em silêncio** para 50 caracteres (medido). **Nunca desligue o modo estrito.**

### Datas e fusos horários
- PostgreSQL: §date§, §time§, §timestamp§ (**sem** fuso: "relógio de parede") e §timestamptz§ (**com** fuso: guarda um **instante** em UTC e exibe no fuso da sessão). Medido: ao inserir §'2026-03-01 12:00:00'§ nos dois tipos com a sessão em **America/Sao_Paulo**, o §timestamptz§ exibiu §12:00:00-03§; trocando a sessão para **UTC**, o §timestamp§ continuou §12:00:00§ e o §timestamptz§ passou a mostrar §15:00:00+00§ (**o mesmo instante**).
- MySQL: §DATETIME§ guarda o valor como foi informado (como o §timestamp§ do PostgreSQL); §TIMESTAMP§ converte para UTC e exibe no fuso da sessão. Medido com §time_zone§ trocado de -03:00 para +00:00: §DATETIME§ ficou **12:00:00** e §TIMESTAMP§ passou a **15:00:00**. O §TIMESTAMP§ do MySQL tem **faixa limitada** (até 2038 em versões e tipos de 32 bits; consulte a documentação do 8.4 para a faixa atual).
- **Regra prática**: para **instantes** (criado em, pagamento recebido), use §timestamptz§ (PostgreSQL) ou §TIMESTAMP§/§DATETIME§ **em UTC** com disciplina (MySQL); para **datas de calendário** (aniversário), use §date§.
- **Data inválida**: §CAST('2026-02-30' AS date)§ falhou no PostgreSQL (**date/time field value out of range**) e devolveu **NULL** no MySQL (com aviso).

### Booleano
PostgreSQL tem §boolean§ de verdade (§true§/§false§). No MySQL, §BOOLEAN§ é apelido de §TINYINT(1)§: medido, §TRUE + TRUE§ deu **2**. A diferença raramente importa, mas explica comportamentos ao migrar.

### Tipos específicos
- **PostgreSQL**: arrays (§ARRAY[1,2,3]§, §@>§ contém; medido §{1,2,3}§, segundo elemento 2), ranges (§tstzrange§ com índices GiST, aula pgm-05), §jsonb§ (aula sqa-06), §uuid§, §inet§, tipos geométricos, enumerações (§CREATE TYPE ... AS ENUM§), tipos compostos e de domínio.
- **MySQL**: §ENUM('azul','verde')§ (medido: inserir 'vermelho' falhou com **Data truncated for column 'cor'**), §SET§, §JSON§ (com funções §JSON_EXTRACT§ e o operador §->>§ sobre **colunas**), tipos espaciais.
Tipos específicos **aumentam o poder e a dependência do fornecedor**: um banco cheio de arrays e ranges não migra para MySQL sem reescrita.

### Valores literais e inferência
No PostgreSQL, literais sem tipo são §unknown§ até o contexto decidir (medido: §pg_typeof('x')§ = unknown; §1§ é integer, §1.5§ é numeric, §now()§ é timestamp with time zone). Seja **explícito** com §CAST§/§::§.

### Como escolher: perguntas-guia
1. **Faixa**: o maior valor cabe com folga?
2. **Exatidão**: precisa de decimal exato (dinheiro, quantidades)?
3. **Fuso**: é um instante ou uma data de calendário?
4. **Comparação**: sensível a caixa e acentos? Qual collation?
5. **Tamanho**: colunas menores economizam memória e disco em milhões de linhas (e índices menores).
6. **Portabilidade**: vale usar um tipo específico do fornecedor?`,
  concepts: [
    { term: 'numeric / DECIMAL', def: 'Tipo decimal exato, adequado a dinheiro.' },
    { term: 'Ponto flutuante', def: 'Representação aproximada de números reais (double, float) sujeita a erros de arredondamento.' },
    { term: 'timestamptz', def: 'Tipo do PostgreSQL que guarda um instante (UTC) e o exibe no fuso da sessão.' },
    { term: 'timestamp sem fuso', def: 'Data e hora sem noção de fuso, tratadas como relógio de parede.' },
    { term: 'utf8mb4', def: 'Codificação UTF-8 completa do MySQL, que comporta emojis.' },
    { term: 'Collation', def: 'Regra de comparação e ordenação de textos (sensibilidade a caixa e acentos).' },
    { term: 'Modo estrito', def: 'Configuração que faz o banco rejeitar valores inválidos em vez de truncá-los ou ajustá-los.' },
    { term: 'ENUM', def: 'Tipo que aceita um conjunto fixo de valores de texto.' },
    { term: 'Range (intervalo)', def: 'Tipo do PostgreSQL que representa um intervalo de valores, com operadores e índices próprios.' },
    { term: 'Identidade (identity)', def: 'Coluna cujo valor é gerado automaticamente por uma sequência.' }
  ],
  examples: R`**Analogia:** escolher tipos é escolher o **tamanho e o material da caixa**: uma caixa pequena demais estoura (o §integer§ que acaba em 2,1 bilhões); uma caixa que "arredonda o conteúdo" (ponto flutuante) não serve para guardar moedas; e um **relógio com fuso** (§timestamptz§) lembra o **momento exato do mundo**, enquanto o relógio de parede (§timestamp§) lembra só "meio-dia", sem dizer onde.

**Exemplo 1: dinheiro.** 0,1 + 0,2 em ponto flutuante é 0,30000000000000004 e não é igual a 0,3; em decimal é exato.

**Exemplo 2: fuso.** O mesmo instante aparece como 12:00 em São Paulo e 15:00 em UTC; o timestamp sem fuso continua 12:00 nos dois.

**Exemplo 3: truncamento.** Um texto de 80 caracteres em VARCHAR(50): erro no PostgreSQL e no MySQL estrito; truncado em silêncio no MySQL sem modo estrito.`,
  code: [
    { title: 'Precisão, fuso e faixa no PostgreSQL (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT 0.1::double precision + 0.2::double precision AS float_soma,   -- 0.30000000000000004
       0.1::numeric + 0.2::numeric                   AS numeric_soma;  -- 0.3

SET TIME ZONE 'America/Sao_Paulo';
CREATE TEMP TABLE t (sem_fuso timestamp, com_fuso timestamptz);
INSERT INTO t VALUES ('2026-03-01 12:00:00', '2026-03-01 12:00:00');
SELECT * FROM t;        -- 12:00:00 | 12:00:00-03
SET TIME ZONE 'UTC';
SELECT * FROM t;        -- 12:00:00 | 15:00:00+00

SELECT 2147483647::int + 1;       -- ERROR: integer out of range
SELECT 2147483647::bigint + 1;    -- 2147483648`, notes: [{ l: '1', t: 'Ponto flutuante não representa 0,1 e 0,2 exatamente.' }, { l: '7', t: 'timestamptz guarda um instante; a exibição depende do fuso da sessão.' }, { l: '11', t: 'Estouro de integer gera erro; bigint comporta o valor.' }] },
    { title: 'Diferenças medidas no MySQL 8.4 (SQL)', lang: 'sql', code: R`SELECT 'abc' = 'ABC';                    -- 1 (collation insensível a caixa)
SELECT 'abc' = 'abc ';                   -- 0 (NO PAD no utf8mb4_0900_ai_ci)
SELECT CHAR_LENGTH('ação'), LENGTH('ação');   -- 4 e 6

SET time_zone = '-03:00';
CREATE TEMPORARY TABLE t (dt DATETIME, ts TIMESTAMP);
INSERT INTO t VALUES ('2026-03-01 12:00:00', '2026-03-01 12:00:00');
SET time_zone = '+00:00';
SELECT dt, ts FROM t;                    -- 12:00:00 | 15:00:00

CREATE TEMPORARY TABLE i (x INT);
INSERT INTO i VALUES (2147483648);       -- ERROR 1264: Out of range value for column 'x'
SELECT CAST('2026-02-30' AS DATE);       -- NULL (com aviso)`, notes: [{ l: '1', t: 'No MySQL, a comparação padrão ignora caixa e acentos.' }, { l: '8', t: 'DATETIME não muda com o fuso; TIMESTAMP sim.' }, { l: '12', t: 'Data inválida vira NULL com aviso, e não erro.' }] }
  ],
  bestPractices: ['Use numeric/DECIMAL para dinheiro e inteiros com folga de faixa.', 'Use timestamptz (ou UTC disciplinado) para instantes e date para datas de calendário.', 'Use UTF-8 completo (utf8mb4) e defina a collation conscientemente.', 'Mantenha o modo estrito ligado no MySQL.', 'Seja explícito com CAST em vez de depender de inferência.', 'Avalie o custo de portabilidade antes de usar tipos específicos do fornecedor.'],
  mistakes: ['Guardar dinheiro em ponto flutuante.', 'Usar timestamp sem fuso para instantes e se perder com fusos.', 'Usar integer em chaves de tabelas que podem passar de 2 bilhões de linhas.', 'Desligar o modo estrito para "fazer o import passar".', 'Assumir que comparações de texto se comportam igual nos dois bancos.', 'Usar utf8 (3 bytes) em vez de utf8mb4 no MySQL.'],
  market: R`Bugs de fuso horário, de arredondamento de dinheiro e de caracteres corrompidos aparecem em todo sistema real, e são caros porque os dados já estão no banco. Saber escolher tipos e prever suas diferenças é o que sustenta migrações entre PostgreSQL e MySQL.`,
  summary: R`Escolha o tipo pela faixa, exatidão, fuso e comparação. Dinheiro em §numeric§/§DECIMAL§ (ponto flutuante deu 0,30000000000000004). Instantes em §timestamptz§ (12:00 em São Paulo é 15:00 em UTC) e no MySQL §TIMESTAMP§ muda com o fuso enquanto §DATETIME§ não. O MySQL compara texto sem distinguir caixa (2 linhas contra 0 no PostgreSQL), trata data inválida como NULL e, sem modo estrito, trunca em silêncio. Tipos específicos dão poder e dependência.`,
  refs: [REF.pgTypes, REF.pgNumeric, REF.pgDatetime, REF.mysqlTypes, REF.mysqlSqlMode],
  cards: [
    { q: 'Qual tipo usar para dinheiro?', a: 'numeric (PostgreSQL) ou DECIMAL (MySQL), nunca ponto flutuante.' },
    { q: 'Qual a diferença entre timestamp e timestamptz?', a: 'timestamp guarda um relógio de parede sem fuso; timestamptz guarda um instante (UTC) e o exibe no fuso da sessão.' },
    { q: 'Como o MySQL compara texto por padrão?', a: 'Sem distinguir maiúsculas e acentos (utf8mb4_0900_ai_ci); o PostgreSQL distingue por padrão.' },
    { q: 'O que o modo estrito faz?', a: 'Rejeita valores inválidos (muito longos, fora de faixa) em vez de truncá-los em silêncio.' },
    { q: 'Qual a faixa de um integer?', a: 'Até 2.147.483.647; acima disso use bigint.' }
  ]
},
{
  id: 'pgm-03', moduleId: 'm1', order: 3, minutes: 75, tags: ['PostgreSQL vs MySQL', 'InnoDB', 'MVCC', 'sql_mode', 'DDL transacional', 'dialetos'],
  title: 'PostgreSQL ou MySQL: arquitetura, comportamentos diferentes e como escolher',
  objectives: ['Comparar arquitetura e filosofia de PostgreSQL e MySQL (InnoDB)', 'Prever as diferenças de comportamento mais frequentes (GROUP BY, NULL, DDL, isolamento padrão, operadores)', 'Reescrever consultas entre os dois dialetos (§RETURNING§, upsert, §FULL JOIN§, concatenação)', 'Aplicar critérios de escolha por requisitos', 'Planejar uma migração com testes de equivalência'],
  intro: R`PostgreSQL e MySQL são os dois bancos relacionais de código aberto mais usados, e ambos resolvem a **grande maioria** dos problemas. Mas **não são intercambiáveis**: têm filosofias, padrões e recursos diferentes, e **a mesma consulta pode dar resultados diferentes**. Esta aula compara os dois com **experimentos executados lado a lado** (PostgreSQL 17.12 e MySQL 8.4.13) e dá critérios para escolher sem fanatismo.`,
  theory: R`### Visão geral
- **PostgreSQL**: banco **objeto-relacional**, muito aderente ao padrão SQL, extensível (tipos, operadores, índices, linguagens), com recursos avançados (janelas, CTEs, JSONB, ranges, índices parciais e por expressão, DDL transacional, tabelas particionadas, replicação lógica e física).
- **MySQL**: banco relacional amplamente usado na web, histórico de simplicidade e velocidade em leituras. O mecanismo de armazenamento padrão é o **InnoDB** (transacional, com chaves estrangeiras e MVCC). O MySQL tem **mecanismos de armazenamento plugáveis**, mas na prática usa-se o InnoDB. Existe também o **MariaDB**, um *fork* com diferenças crescentes (não executado neste curso).

### Quadro comparativo medido
Cada linha foi **executada nos dois sistemas** neste laboratório:
| Aspecto | PostgreSQL 17.12 | MySQL 8.4.13 |
|---|---|---|
| Isolamento padrão | **READ COMMITTED** | **REPEATABLE READ** |
| §5/2§ | **2** (divisão inteira) | **2,5000** (decimal); §5 DIV 2§ = 2 |
| §'a' || 'b'§ | **ab** (concatenação) | **0** (por padrão §||§ é OR lógico) |
| §nome = 'CANETA'§ com 'Caneta' e 'caneta' | **0 linhas** | **2 linhas** (collation insensível) |
| §ORDER BY§ com NULL | NULL **por último** em ASC, **primeiro** em DESC | NULL **primeiro** em ASC, **último** em DESC |
| Coluna fora do §GROUP BY§ | **Erro** (a menos que dependa da chave primária) | **Erro** com §ONLY_FULL_GROUP_BY§ (padrão do 8.x) |
| Violação de §CHECK§ | erro ("violates check constraint") | erro 3819 ("Check constraint ... is violated") no 8.0.16+ |
| §FULL JOIN§ | **suportado** | **erro de sintaxe** (emule com §UNION§ de LEFT e RIGHT) |
| Data inválida em §CAST§ | **erro** | **NULL** com aviso |
| DDL dentro de transação | **desfeito** pelo §ROLLBACK§ (medido: tabela não existia depois) | **commit implícito**: a tabela §ddl_teste§ **continuou existindo** após o §ROLLBACK§ |
| §UPDATE ... RETURNING§ | suportado | não suportado |
| Upsert | §ON CONFLICT§ | §ON DUPLICATE KEY UPDATE§ |
| Auto incremento | §IDENTITY§ / §serial§ | §AUTO_INCREMENT§ |
| Modo estrito | sempre estrito | depende do §sql_mode§ (padrão do 8.4 inclui §STRICT_TRANS_TABLES§) |
O §sql_mode§ padrão medido no MySQL 8.4: §ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION§. Bancos legados com o modo desligado aceitam consultas e dados que um banco estrito recusa.

### MVCC: leitura sem bloquear escrita
Ambos usam **MVCC** (múltiplas versões de linhas) para que leituras não bloqueiem escritas. No PostgreSQL, uma atualização cria **uma nova versão da linha** e a antiga fica como "tupla morta" até o **VACUUM** limpar (medido: após atualizar 100.000 linhas, §n_dead_tup§ = **100000**; após §VACUUM§, **0**; o tamanho da tabela permaneceu **7080 kB** porque o espaço é **reutilizado**, e não devolvido ao sistema). No InnoDB, a linha é atualizada **no lugar** e as versões antigas ficam em **segmentos de undo**, limpos pelo *purge*. Consequências práticas: o PostgreSQL exige **atenção ao VACUUM/autovacuum** e ao inchaço (*bloat*); o InnoDB exige atenção a **transações longas** que seguram o undo. (Detalhes de isolamento no curso C3.5.)

### Armazenamento e chaves primárias
O InnoDB guarda a tabela **ordenada pela chave primária** (índice agrupado): consultas por faixa da chave são muito eficientes e **chaves aleatórias** (UUIDs) fragmentam a tabela. O PostgreSQL guarda a tabela em um **heap** (sem ordem) e **todos** os índices apontam para a posição física da linha (§ctid§); a ordem física pode ser reorganizada com §CLUSTER§ (pontual).

### Extensibilidade e recursos
- PostgreSQL: **extensões** (§pg_trgm§, §btree_gist§, PostGIS, §pgcrypto§...), tipos próprios, índices **parciais** e **de expressão**, **GIN/GiST/BRIN**, restrições de **exclusão**, **DDL transacional**, §RETURNING§, **CTEs de modificação**, janelas e recursão há muito tempo. Medido: a restrição de exclusão **impediu** a reserva da mesma sala em horários sobrepostos (**conflicting key value violates exclusion constraint**).
- MySQL: bom ecossistema de hospedagem, ferramentas e réplicas de leitura; recursos como CTEs e janelas chegaram **no 8.0**; índices **funcionais** e **invisíveis**; **JSON** com funções próprias. Faltam alguns recursos do PostgreSQL (índices parciais, restrições de exclusão, DDL transacional).

### Como escolher
- **PostgreSQL** costuma ser a melhor escolha para: consultas **analíticas complexas**, **integridade rigorosa**, tipos ricos (JSONB, ranges, geoespacial com PostGIS), extensibilidade e quando o **padrão SQL** é prioridade.
- **MySQL** costuma ser adequado para: aplicações web com **muitas leituras simples**, quando a **equipe e a hospedagem** já o dominam e o ecossistema (por exemplo, **Aurora**, **Cloud SQL**, serviços gerenciados) o favorece.
- Os dois atendem a **qualquer aplicação CRUD** comum. A decisão deve pesar **equipe, operação, ecossistema e requisitos**, e não "qual é mais rápido" em benchmarks genéricos. **Desempenho depende do esquema, dos índices e das consultas** mais do que do produto.

### Migração: o que testar
1. **Esquema**: tipos, collations, identidades, índices parciais e de expressão (sem equivalentes diretos).
2. **SQL**: concatenação, divisão, NULL na ordenação, §GROUP BY§, §RETURNING§, upsert, §LIMIT§/§OFFSET§, funções de data.
3. **Transações**: isolamento padrão e DDL.
4. **Dados**: truncamentos, datas inválidas, caixa e acentos nas chaves únicas (**com collation insensível, 'Ana' e 'ana' colidem**).
5. **Testes de equivalência**: rode as consultas críticas **nos dois** e compare resultados e planos.
Ferramentas: §pgloader§ e conectores (não executados aqui). Planeje o *cutover* com replicação e janela de validação.`,
  concepts: [
    { term: 'InnoDB', def: 'Mecanismo de armazenamento transacional padrão do MySQL, com chaves estrangeiras e MVCC.' },
    { term: 'MVCC', def: 'Controle de concorrência por múltiplas versões, em que leitores não bloqueiam escritores.' },
    { term: 'Tupla morta', def: 'Versão antiga de uma linha no PostgreSQL, removida pelo VACUUM.' },
    { term: 'sql_mode', def: 'Configuração do MySQL que define a rigidez do tratamento de dados e do SQL.' },
    { term: 'ONLY_FULL_GROUP_BY', def: 'Modo do MySQL que recusa colunas não agregadas fora do GROUP BY.' },
    { term: 'Índice agrupado', def: 'Organização em que a tabela é armazenada ordenada pela chave primária (InnoDB).' },
    { term: 'Heap', def: 'Armazenamento sem ordem da tabela, usado pelo PostgreSQL.' },
    { term: 'DDL transacional', def: 'Capacidade de desfazer comandos de estrutura (CREATE TABLE) com ROLLBACK, presente no PostgreSQL.' },
    { term: 'Upsert', def: 'Inserir ou atualizar em um comando (ON CONFLICT no PostgreSQL, ON DUPLICATE KEY UPDATE no MySQL).' },
    { term: 'Teste de equivalência', def: 'Execução das mesmas consultas em dois sistemas para comparar resultados e planos.' }
  ],
  examples: R`**Analogia:** PostgreSQL e MySQL são dois **carros bons com painéis diferentes**: ambos levam você ao destino, mas o botão que **liga o pisca** muda de lugar. A mesma sequência de comandos pode "acender o farol" em um e "limpar o para-brisa" no outro: por exemplo, §'a' || 'b'§ é concatenação em um e OR lógico no outro.

**Exemplo 1: o mesmo SQL, resultados diferentes.** §5/2§ dá 2 no PostgreSQL e 2,5 no MySQL.

**Exemplo 2: DDL em transação.** Criar uma tabela e dar ROLLBACK a remove no PostgreSQL e **não** a remove no MySQL.

**Exemplo 3: caixa nas comparações.** Procurar "CANETA" encontrou 2 produtos no MySQL e nenhum no PostgreSQL.`,
  code: [
    { title: 'Diferenças lado a lado: PostgreSQL (SQL, saída medida)', lang: 'sql', code: R`SHOW transaction_isolation;           -- read committed
SELECT 5/2, 'a' || 'b';               -- 2 | ab
SELECT id FROM produtos WHERE nome = 'CANETA';   -- 0 linhas
SELECT x FROM (VALUES (NULL::text), ('a'), ('b')) t(x) ORDER BY x;   -- a, b, NULL

BEGIN; CREATE TABLE ddl_teste (x int); ROLLBACK;
SELECT to_regclass('ddl_teste');      -- NULL: a tabela não existe

SELECT CAST('2026-02-30' AS date);    -- ERROR: date/time field value out of range
INSERT INTO produtos (nome, preco) VALUES ('X', -1);   -- violates check constraint`, notes: [{ l: '2', t: 'Divisão de inteiros é inteira e || concatena.' }, { l: '6', t: 'O rollback desfez o CREATE TABLE: DDL transacional.' }, { l: '8', t: 'Data inválida é erro, não NULL.' }] },
    { title: 'Diferenças lado a lado: MySQL 8.4 (SQL, saída medida)', lang: 'sql', code: R`SELECT @@transaction_isolation;       -- REPEATABLE-READ
SELECT 5/2, 5 DIV 2, 'a' || 'b';      -- 2.5000 | 2 | 0
SELECT id FROM produtos WHERE nome = 'CANETA';   -- 2 linhas (Caneta e caneta)
-- ORDER BY com NULL: primeiro em ASC, último em DESC

START TRANSACTION; CREATE TABLE ddl_teste (x INT); ROLLBACK;
SHOW TABLES LIKE 'ddl_teste';         -- a tabela continua lá (commit implícito)

SELECT p.id FROM produtos p FULL JOIN produtos q ON p.id = q.id;   -- ERROR 1064 (sintaxe)
SELECT nome, COUNT(*) FROM produtos GROUP BY preco;                -- ERROR 1055 (ONLY_FULL_GROUP_BY)
INSERT INTO produtos (nome, preco) VALUES ('X', -1);               -- ERROR 3819 (CHECK)`, notes: [{ l: '2', t: 'DIV é a divisão inteira; || é OR lógico por padrão.' }, { l: '6', t: 'DDL em MySQL causa commit implícito: não é desfeito.' }, { l: '9', t: 'ONLY_FULL_GROUP_BY recusa a consulta.' }] }
  ],
  bestPractices: ['Escolha o banco por requisitos, equipe e operação, não por boatos de desempenho.', 'Mantenha o modo estrito (sql_mode) no MySQL.', 'Escreva SQL portátil quando a migração for possível e isole o que for específico.', 'Teste as consultas críticas nos dois sistemas antes de migrar.', 'Defina a collation e a sensibilidade a caixa conscientemente em chaves únicas.', 'Faça migrações com replicação e janela de validação.'],
  mistakes: ['Assumir que o SQL é 100% portátil entre bancos.', 'Esquecer que o MySQL trata || como OR por padrão.', 'Confiar em DDL transacional em MySQL.', 'Migrar sem comparar resultados de consultas e planos.', 'Comparar produtos com benchmarks genéricos em vez da carga real.', 'Ignorar o autovacuum e o inchaço no PostgreSQL ou as transações longas no InnoDB.'],
  market: R`Muitas empresas operam os dois bancos, e profissionais que conhecem as diferenças migram sistemas, depuram resultados divergentes e orientam decisões de arquitetura. A pergunta "PostgreSQL ou MySQL?" aparece em entrevistas e em reuniões de decisão técnica; a boa resposta cita requisitos e trade-offs, não torcida.`,
  summary: R`Os dois são excelentes e diferentes. Medido lado a lado: isolamento padrão (READ COMMITTED x REPEATABLE READ), §5/2§ (2 x 2,5), §||§ (concatena x OR), comparação de texto (0 x 2 linhas), ordenação de NULL (último x primeiro em ASC), §FULL JOIN§ (suportado x erro), DDL em transação (desfeito x commit implícito) e data inválida (erro x NULL). Ambos usam MVCC (VACUUM no PostgreSQL, undo no InnoDB). Escolha por requisitos e operação e teste a equivalência ao migrar.`,
  refs: [REF.pgMvcc, REF.mysqlInnodb, REF.mysqlIsolation, REF.mysqlSqlMode],
  cards: [
    { q: 'Qual o isolamento padrão do PostgreSQL e do MySQL (InnoDB)?', a: 'PostgreSQL: READ COMMITTED. MySQL InnoDB: REPEATABLE READ.' },
    { q: 'O que || faz por padrão no MySQL?', a: 'É o operador OR lógico (retorna 0 ou 1); no PostgreSQL concatena textos.' },
    { q: 'Um ROLLBACK desfaz CREATE TABLE no MySQL?', a: 'Não: DDL causa commit implícito; no PostgreSQL o DDL é transacional.' },
    { q: 'Qual a consequência prática do MVCC no PostgreSQL?', a: 'Linhas atualizadas deixam tuplas mortas que o VACUUM precisa limpar.' },
    { q: 'Por que testar equivalência ao migrar?', a: 'Porque a mesma consulta pode dar resultados diferentes (caixa, NULL, divisão, datas) entre os bancos.' }
  ]
}
];
