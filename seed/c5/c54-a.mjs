// C5.4 — Fundamentos de testes. Aulas 1 e 2 (pirâmide e testes unitários; testes de integração).
const R = String.raw;

export const REF = {
  testPyramid: { title: 'Martin Fowler — TestPyramid', url: 'https://martinfowler.com/bliki/TestPyramid.html', kind: 'artigo' },
  practicalPyramid: { title: 'Ham Vocke — The Practical Test Pyramid', url: 'https://martinfowler.com/articles/practical-test-pyramid.html', kind: 'artigo' },
  testSizes: { title: 'Google Testing Blog — Test Sizes', url: 'https://testing.googleblog.com/2010/12/test-sizes.html', kind: 'artigo' },
  trophy: { title: 'Kent C. Dodds — The Testing Trophy and Testing Classifications', url: 'https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications', kind: 'artigo' },
  nodeTest: { title: 'Node.js — Test runner', url: 'https://nodejs.org/api/test.html', kind: 'doc' },
  nodeSqlite: { title: 'Node.js — SQLite (node:sqlite)', url: 'https://nodejs.org/api/sqlite.html', kind: 'doc' },
  fastCheck: { title: 'fast-check — Property-based testing for JavaScript', url: 'https://fast-check.dev/', kind: 'doc' },
  unitTest: { title: 'Martin Fowler — UnitTest', url: 'https://martinfowler.com/bliki/UnitTest.html', kind: 'artigo' },
  integrationTest: { title: 'Martin Fowler — IntegrationTest', url: 'https://martinfowler.com/bliki/IntegrationTest.html', kind: 'artigo' },
  nonDeterminism: { title: 'Martin Fowler — Eradicating Non-Determinism in Tests', url: 'https://martinfowler.com/articles/nonDeterminism.html', kind: 'artigo' },
  testcontainers: { title: 'Testcontainers', url: 'https://testcontainers.com/', kind: 'ferramenta' },
  sqliteConstraints: { title: 'SQLite — CHECK constraints (CREATE TABLE)', url: 'https://www.sqlite.org/lang_createtable.html#ckconst', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'tst-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['pirâmide de testes', 'testes unitários', 'F.I.R.S.T.', 'AAA', 'property-based', 'fast-check'],
  title: 'Pirâmide de testes e testes unitários: rápidos, isolados, legíveis e com propriedades',
  objectives: ['Explicar a pirâmide de testes (e suas variações: troféu, favo) e o trade-off entre velocidade, confiança e custo', 'Escrever testes unitários legíveis com Arrange-Act-Assert e nomes que descrevem comportamento', 'Aplicar tabelas parametrizadas, valores de fronteira e testes de erro', 'Usar testes baseados em propriedades (fast-check) para achar casos que você não pensou', 'Medir a diferença de velocidade e custo entre camadas de teste', 'Reconhecer o que não vale a pena testar na unidade'],
  intro: R`Teste automatizado é **código que verifica código**: dá **confiança para mudar**. Mas **nem todo teste custa o mesmo**: um teste unitário roda em milissegundos; um E2E abre um navegador. A **pirâmide de testes** orienta a **proporção**: **muitos testes rápidos na base**, **poucos lentos no topo**. No laboratório (Node 26.13.1, §node:test§), os **12 testes unitários** rodaram em **613 ms** (já com **mais de mil execuções de propriedades** do fast-check), e a camada E2E levou **2.983 ms para 3 testes**. Um teste de **propriedade** ainda **achou um contraexemplo** para uma suposição falsa (a soma de floats não é independente da ordem).`,
  theory: R`### Por que testar e o que os testes compram
Testes **não provam ausência de defeitos** (Dijkstra): reduzem **risco** e **custo de mudar**. Eles: (1) **detectam regressões** cedo, (2) funcionam como **documentação executável** do comportamento, (3) **permitem refatorar** (cln-03), (4) **guiam o design** (código testável é pouco acoplado: SOLID/DI). Testes **ruins** (frágeis, lentos, que ninguém confia) **custam mais do que valem**.

### A pirâmide de testes
Mike Cohn propôs a **pirâmide**; Martin Fowler e Ham Vocke a popularizaram: **base larga** de **testes unitários** (rápidos, baratos, isolados), **meio** de **testes de integração/serviço** e **topo estreito** de **testes de ponta a ponta (E2E/UI)** (lentos, caros, frágeis). **Princípios:** (1) **escreva testes de granularidade diferente**; (2) **quanto mais alto, menos testes**; (3) **empurre o teste para o nível mais baixo que dá confiança**.
**Variações (não são "a verdade"):**
- **Troféu de testes** (Kent C. Dodds): análise estática na base, **ênfase em testes de integração** (muito valor por teste em front-ends); 
- **Favo/"honeycomb"** (Spotify, microsserviços): poucos testes de unidade, **muitos de integração** de cada serviço, poucos de integração entre serviços;
- **Cone de sorvete** (anti-padrão): **muitos E2E manuais**, poucos unitários: **lento, frágil, caro**.
**Tamanhos de teste** (Google): **pequeno** (um processo, sem rede/disco, rápido), **médio** (uma máquina, pode usar banco local), **grande** (várias máquinas). Classificar por **recursos usados** é **mais objetivo** que debater "o que é unidade".

### Medido no laboratório: custo por camada
Cada camada foi executada **em um processo próprio** (o tempo **inclui a inicialização do Node**):
| Camada | Testes | Duração | Observação |
|---|---|---|---|
| Unitários | **12** | **613 ms** | inclui 3 testes de propriedades (mais de 1.000 execuções) |
| Mocks do serviço | 5 | 346 ms | |
| Integração (SQLite) | 5 | 321 ms | banco real em memória |
| Integração (HTTP + SQLite) | 3 | 661 ms | servidor real em porta efêmera |
| E2E (Chrome) | 3 | **2.983 ms** | ≈ **994 ms por teste** (abre o navegador) |
**Leitura:** o custo cresce **por ordem de grandeza** ao subir de camada. **Atenção:** os tempos vêm de **uma máquina e uma execução**, incluem a **inicialização do processo** e **não** dão "ms por teste" confiável para as camadas pequenas; o que importa é a **tendência**.

### Testes unitários: o que são
Uma **unidade** é **um comportamento pequeno** testado **rápido** e **de forma determinística**, **sem I/O** (rede, disco, relógio real, banco). Duas escolas: **solitária/*mockist*** (isola cada classe com dublês) e **sociável/clássica** (deixa colaboradores **reais e rápidos** colaborarem). **Prefira a sociável** quando os colaboradores são **puros e rápidos** (como §calcularTotal§ e §validarCupom§): menos dublês, menos acoplamento à implementação (aula tst-04).
**F.I.R.S.T.:** **F**ast (rápido), **I**ndependent (independente: sem ordem), **R**epeatable (repetível: mesmo resultado em qualquer ambiente), **S**elf-validating (passa ou falha sozinho), **T**imely (escrito perto do código).

### Arrange-Act-Assert e nomes
**AAA:** **Arrange** (preparar), **Act** (executar **uma** ação), **Assert** (verificar). O laboratório: itens e desconto (Arrange) → §calcularTotal(itens, { desconto: 0.1 })§ (Act) → §assert.equal(total, 22.95)§ (Assert). **Nomeie pelo comportamento** (§desconto acima de 100% é limitado§), não pelo método (§testCalcularTotal3§). **Um conceito por teste**; **poucas asserções** relacionadas; **mensagem de falha** clara.
**Tabelas parametrizadas:** o mesmo teste com **vários dados** (§for (const [nome, itens, opcoes, esperado] of ...)§): 4 casos de total e 3 de erro no laboratório, **sem copiar e colar**.
**Fronteiras:** teste **valores de borda** (0, 1, máximo, limite do cupom **expirado no dia seguinte**), **vazios** e **entradas inválidas** (lista vazia, preço negativo, quantidade fracionada: **mensagens de erro verificadas**).
**Relógio e aleatoriedade:** **injete** (aula pat-04): §validarCupom(codigo, hoje)§ recebe **a data**, então o teste **não depende do dia** em que roda.

### Testes baseados em propriedades (fast-check)
Em vez de **exemplos**, descreva **propriedades que valem para toda entrada** e deixe a biblioteca **gerar centenas de casos** e **reduzir** (*shrink*) o contraexemplo ao **menor** possível. Propriedades típicas: **invariantes** (total nunca negativo nem maior que o bruto), **simetria/idempotência** (ordem dos itens não altera o total), **ida e volta** (parse/format), **oráculo** (comparar com implementação simples).
**Medido (fast-check 4.11.0, semente 42, 500 execuções cada):** as duas propriedades do domínio passaram; uma propriedade **falsa de propósito** ("a soma de floats dá o mesmo resultado em qualquer ordem") **falhou** com **§Property failed after N tests§** e o contraexemplo reduzido (**semente 7** reproduz). **Reprodutibilidade:** fixe a **semente** em CI (ou registre a que falhou). **Cuidado:** propriedades **bem escolhidas** valem mais que **geradores sofisticados**; **tolerâncias** para floats (aqui 1 centavo).

### O que não testar na unidade
- **Código trivial** (getters), **frameworks e bibliotecas** (já testados), **configuração** pura;
- **Detalhes de implementação** (nome de função interna): acopla o teste a **como**, não a **o quê**;
- **Cobertura por cobertura** (aula tst-06): **linha executada ≠ comportamento verificado**.

### Antipadrões de teste unitário
- **Testes dependentes de ordem/estado global** (aula pat-01: singleton);
- **Lógica no teste** (§if§, laços complexos): o teste deve ser **tão simples que "obviamente correto"**;
- **Asserções demais** (um teste "faz tudo");
- **Dados misteriosos** (§preco: 7.3§ sem explicar): use **nomes** e **construtores de dados** (*test data builders*);
- **Testes lentos** (sleep, rede): empurrados para outra camada;
- **Ignorar testes que falham** (§skip§) sem tíquete.

### Como começar em um projeto
1. **Separe regras puras** do I/O (como §dominio.mjs§) para testá-las **sem dublês**;
2. **Rode os testes no commit** (hooks/CI): feedback em **segundos**;
3. **Teste a regra de negócio com mais cuidado** que o "encanamento";
4. **Meça** o tempo e a **estabilidade**: teste **intermitente** vale **zero** (aula tst-03).`,
  concepts: [
    { term: 'Pirâmide de testes', def: 'Modelo que recomenda muitos testes rápidos de baixo nível e poucos testes lentos de alto nível.' },
    { term: 'Teste unitário', def: 'Teste rápido e determinístico de um comportamento pequeno, sem I/O externo.' },
    { term: 'Arrange-Act-Assert', def: 'Estrutura de teste em três partes: preparar, executar uma ação e verificar o resultado.' },
    { term: 'F.I.R.S.T.', def: 'Propriedades de bons testes: rápidos, independentes, repetíveis, autoverificáveis e oportunos.' },
    { term: 'Teste de propriedade', def: 'Teste que verifica uma propriedade geral sobre muitas entradas geradas e reduz o contraexemplo.' },
    { term: 'Shrinking', def: 'Redução automática de um contraexemplo ao menor caso que ainda falha.' },
    { term: 'Test data builder', def: 'Função ou objeto que cria dados de teste legíveis com padrões e variações pontuais.' }
  ],
  examples: R`**Analogia:** a pirâmide é o **orçamento de uma obra**: milhares de **inspeções rápidas** de cada parafuso (unitários), dezenas de **provas de encaixe** entre peças (integração) e **uma ou duas vistorias completas** do prédio pronto (E2E), caras e demoradas: ninguém troca todas as inspeções pequenas por vistorias grandes.

**Exemplo 1: AAA e tabela.** Total com desconto de 10% = 22,95; quatro variações em tabela sem repetir código.

**Exemplo 2: propriedade.** O total nunca é negativo nem maior que o bruto, em 500 execuções.

**Exemplo 3: contraexemplo.** A soma de floats depende da ordem; o fast-check reduz o caso e a semente 7 o reproduz.`,
  code: [
    { title: 'Teste AAA e tabela parametrizada (JavaScript, node:test; 12 testes unitários passam)', lang: 'js', code: R`import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotal } from '../src/dominio.mjs';

test('AAA: total simples com desconto', () => {
  // Arrange
  const itens = [{ sku: 'A', preco: 10, qtd: 2 }, { sku: 'B', preco: 5.5, qtd: 1 }];
  // Act
  const total = calcularTotal(itens, { desconto: 0.1 });
  // Assert
  assert.equal(total, 22.95);
});

for (const [nome, itens, opcoes, esperado] of [
  ['sem desconto', [{ sku: 'A', preco: 10, qtd: 3 }], {}, 30],
  ['desconto acima de 100% é limitado', [{ sku: 'A', preco: 10, qtd: 1 }], { desconto: 5 }, 0],
  ['desconto negativo é ignorado', [{ sku: 'A', preco: 10, qtd: 1 }], { desconto: -1 }, 10]
]) test('parametrizado: ' + nome, () => assert.equal(calcularTotal(itens, opcoes), esperado));

test('erro: lista vazia', () => assert.throws(() => calcularTotal([]), /pedido sem itens/));`, notes: [{ l: '5', t: 'Arrange, Act e Assert separados e comentados.' }, { l: '19', t: 'A tabela evita copiar e colar o mesmo teste.' }] },
    { title: 'Testes de propriedade com fast-check (semente fixa; uma propriedade falsa gera contraexemplo)', lang: 'js', code: R`import fc from 'fast-check';

const item = fc.record({
  sku: fc.string({ minLength: 1, maxLength: 3 }),
  preco: fc.integer({ min: 0, max: 100000 }).map((c) => c / 100),
  qtd: fc.integer({ min: 1, max: 20 })
});

// Invariante: o total nunca é negativo nem maior que o bruto
fc.assert(fc.property(fc.array(item, { minLength: 1, maxLength: 8 }), fc.double({ min: -2, max: 3, noNaN: true }), (itens, d) => {
  const bruto = arredondar(itens.reduce((s, i) => s + i.preco * i.qtd, 0));
  const t = calcularTotal(itens, { desconto: d });
  return t >= 0 && t <= bruto + 0.01;
}), { numRuns: 500, seed: 42 });

// Propriedade FALSA de propósito: a ordem importa para somas de float
fc.assert(fc.property(fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { minLength: 2, maxLength: 5 }),
  (xs) => xs.reduce((a, b) => a + b, 0) === [...xs].reverse().reduce((a, b) => a + b, 0)), { seed: 7, numRuns: 1000 });
// -> Error: Property failed after N tests (contraexemplo reduzido; a semente 7 reproduz)`, notes: [{ l: '9', t: 'Descreve uma invariante, não exemplos fixos.' }, { l: '17', t: 'A semente fixa torna a falha reproduzível em CI.' }] },
    { title: 'Medir cada camada de testes (JavaScript; resultados medidos nesta máquina)', lang: 'js', code: R`import { spawnSync } from 'node:child_process';
const camadas = [['unitários', ['test/unitarios.test.mjs']], ['integração (SQLite)', ['test/repositorio.integracao.test.mjs']], ['E2E (Chrome)', ['test/e2e.test.mjs']]];
for (const [nome, arqs] of camadas) {
  const r = spawnSync(process.execPath, ['--test', ...arqs], { encoding: 'utf8' });
  const n = Number(/ℹ tests (\d+)/.exec(r.stdout)[1]); const d = Number(/ℹ duration_ms ([\d.]+)/.exec(r.stdout)[1]);
  console.log(nome.padEnd(24), n, 'testes', d.toFixed(0), 'ms');
}
// unitários 12 testes 613 ms | integração (SQLite) 5 testes 321 ms | E2E 3 testes 2983 ms`, notes: [{ l: '3', t: 'Cada camada roda em um processo separado.' }, { l: '7', t: 'O tempo inclui a inicialização do Node (não é ms por teste confiável).' }] }
  ],
  bestPractices: ['Empurre cada verificação para o nível mais baixo que dá confiança.', 'Separe regras puras do I/O e injete relógio, aleatoriedade e identificadores.', 'Siga Arrange-Act-Assert e nomeie os testes pelo comportamento.', 'Use tabelas, fronteiras e testes de erro; descreva invariantes com propriedades quando fizer sentido.', 'Fixe a semente dos testes de propriedade em CI e registre a que falhou.', 'Prefira testes sociáveis com colaboradores puros e rápidos a dublês em tudo.', 'Trate teste intermitente como defeito: corrija ou remova.'],
  mistakes: ['Cone de sorvete: muitos E2E e poucos unitários.', 'Testes dependentes de ordem, de data ou de estado global.', 'Testar detalhes de implementação em vez do comportamento.', 'Lógica condicional dentro do teste.', 'Perseguir cobertura sem verificar comportamento.', 'Ignorar (skip) testes sem tíquete.'],
  market: R`Escrever **bons testes unitários** é **pré-requisito** de qualquer vaga de desenvolvimento; **explicar a pirâmide e seus limites** e usar **propriedades** diferencia **seniores** e é pergunta comum de **entrevistas**.`,
  summary: R`A pirâmide recomenda muitos testes rápidos na base e poucos lentos no topo (variações: troféu e favo; cone de sorvete é antipadrão). Testes unitários são rápidos, independentes, repetíveis e autoverificáveis, no padrão Arrange-Act-Assert, com tabelas, fronteiras e erros; propriedades (fast-check) acham casos não pensados. Medido: 12 testes unitários em 613 ms, integração em 321 a 661 ms e 3 E2E em 2.983 ms (≈ 994 ms por teste); o fast-check achou o contraexemplo da soma de floats (semente 7). Empurre testes para a menor camada que dá confiança.`,
  refs: [REF.testPyramid, REF.practicalPyramid, REF.testSizes, REF.trophy, REF.unitTest, REF.nodeTest, REF.fastCheck],
  cards: [
    { q: 'Por que a pirâmide tem base larga?', a: 'Testes unitários são rápidos, baratos e estáveis; testes de topo são lentos e frágeis, então devem ser poucos.' },
    { q: 'O que significa F.I.R.S.T.?', a: 'Fast, Independent, Repeatable, Self-validating e Timely.' },
    { q: 'O que o fast-check faz após encontrar um contraexemplo?', a: 'Reduz (shrinking) o caso ao menor que ainda falha e permite reproduzi-lo com a semente.' },
    { q: 'Por que injetar a data em validarCupom?', a: 'Para o teste não depender do dia em que roda (repetibilidade).' }
  ]
},
{
  id: 'tst-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['testes de integração', 'SQLite', 'transações', 'API', 'isolamento', 'Testcontainers'],
  title: 'Testes de integração: banco real, API em processo, isolamento e o que eles pegam que o unitário não pega',
  objectives: ['Definir teste de integração e escolher o que integrar (banco, HTTP, filas) e o que simular (terceiros)', 'Testar um repositório com um banco real em memória, incluindo transações, restrições e cascata', 'Testar uma API HTTP em processo, em porta efêmera, sem dependências externas', 'Garantir isolamento (um banco por teste) e dados previsíveis', 'Comparar SQLite em memória, Postgres em contêiner e Testcontainers (o que foi executado e o que não foi)', 'Medir o custo e interpretar o que os testes de integração revelam'],
  intro: R`Testes unitários verificam **regras isoladas**; **defeitos reais** costumam morar nas **junções**: SQL que não faz o que se pensa, **restrições** do banco, **serialização** JSON, **códigos de status**, **transações**. O **teste de integração** exercita **componentes reais juntos**. No laboratório: **5 testes** do repositório com **SQLite real em memória** (§node:sqlite§, SQLite 3.54.1) e **3 testes da API** com **servidor HTTP real em porta efêmera** passaram (**321 ms** e **661 ms**); um erro de **ROLLBACK** só aparece com o banco de verdade, e um teste de **UPDATE** que "passava" **não estava testando nada** (tabela vazia) até ser corrigido.`,
  theory: R`### O que é e por que existe
**Integração** = exercitar **dois ou mais componentes reais** (código + banco, código + HTTP, serviço + serviço). Eles capturam o que **dublês escondem**: **SQL inválido**, **mapeamento** de colunas, **índices e restrições**, **fusos horários e arredondamentos do banco**, **versões de bibliotecas**, **configuração**. Fowler distingue **testes de integração "estreitos"** (um componente com **um** colaborador real, os demais dublês) e **"amplos"** (vários componentes reais). Prefira **estreitos** quando suficientes: **mais rápidos e fáceis de diagnosticar**.

### O que integrar e o que simular
- **Integre (real):** **seu banco** (o **mesmo tipo** da produção, quando possível), **seu código de acesso a dados**, **seu servidor HTTP** (em processo), **sua serialização**;
- **Simule (dublê/fake/contrato):** **serviços de terceiros** (pagamento, e-mail), **serviços de outros times** (use **testes de contrato**: C5.6), **tempo** (relógio injetado);
- **Evite** chamar **sistemas externos reais** em testes automatizados: **lentos, instáveis, custosos** e podem ter **efeitos colaterais**. **Sandbox de provedor** só em testes **específicos** e **fora** do ciclo rápido.

### Banco de dados em testes
| Opção | Vantagem | Risco |
|---|---|---|
| **SQLite em memória** (§node:sqlite§, §:memory:§) | **zero instalação**, **rápido** (ms), **um banco por teste** | **dialeto diferente** do Postgres/MySQL (tipos, funções, concorrência); ok quando o repositório usa **SQL simples** ou o banco **de produção também é SQLite** |
| **Postgres/MySQL em contêiner** (Testcontainers ou Docker Compose) | **mesmo motor da produção**: pega **diferenças de dialeto**, **índices**, **tipos**, **locks** | **mais lento** (segundos para subir), exige **Docker** no CI |
| **Banco compartilhado de teste** | simples | **testes interferem**, **dados sujos**, **lento**: evite |
| **Mock do repositório** | rápido | **não testa o SQL**: só a lógica acima |
**Neste laboratório foi executado SQLite em memória.** O curso **C3** usou **PostgreSQL 17 e MySQL em contêineres** nos seus laboratórios, e **Testcontainers** (bibliotecas que **sobem contêineres descartáveis por teste**) foi **apenas analisado**, **não executado** aqui.

### Isolamento e dados
- **Um banco por teste** (ou por arquivo): §new RepositorioPedidos()§ cria §:memory:§ novo: **sem limpeza**, **sem ordem**;
- **Alternativas:** **transação revertida** no fim de cada teste (**rápido**, mas **não** testa *commit* nem concorrência) ou **limpeza** (§TRUNCATE§) entre testes (**mais lento**, risco de **esquecer**);
- **Dados mínimos**, **construídos no teste** (builders): evita **fixtures gigantes** e acoplamento;
- **Determinismo:** relógio e ids **injetados**; **ordens explícitas** em consultas (§ORDER BY§) para **não depender** da ordem de inserção por acaso.
- **Migrações:** rode **as mesmas migrações** da produção no banco de teste (**teste de migração** é um teste de integração valioso).

### Medido: o repositório contra um SQLite real
**5 testes passaram** (§repositorio.integracao.test.mjs§, **321 ms** incluindo a inicialização):
1. **Salvar e reler** o pedido com **itens na ordem de inserção** (§id§, §status: 'novo'§ padrão do banco);
2. **Transação:** um **item inválido** (§qtd = 0§, viola o **CHECK**) **desfaz o pedido inteiro** (§ROLLBACK§): **§contarPorStatus()§ = {}**, sem pedido órfão. **Um mock não pegaria isso**;
3. **Restrições do banco:** **total negativo** é recusado (**CHECK constraint failed**); **status inválido** também: **mas só depois de corrigir o teste**. A versão inicial **tentava um UPDATE em uma tabela vazia**: o banco **não reclamou** (nenhuma linha afetada) e **o teste falhou** na **expectativa de erro**: **lição: um teste de restrição precisa de dados que possam violá-la**;
4. **Idempotência:** §marcarPago§ devolve **1** na primeira e **0** na segunda; contagem por status §{ novo: 1, pago: 1 }§;
5. **Cascata:** apagar o pedido remove os itens (§ON DELETE CASCADE§ com §PRAGMA foreign_keys = ON§: **no SQLite as chaves estrangeiras vêm desligadas por padrão**).
**Observação:** **SQL e restrições** são **código**: teste-os como tal.

### API HTTP em processo
O servidor do laboratório (§criarServidor§) usa §node:http§ e **uma porta efêmera** (§listen(0)§): **sem conflito de portas**, **sem processo externo**, **rápido**. **3 testes** (**661 ms**):
- §POST /pedidos§ com cupom §bemvindo10§ → **201** e §{ id: 1, status: 'pago', total: 18 }§; o **gateway de pagamento falso** recebeu §{ pedidoId: 1, valor: 18 }§; §GET /pedidos/1§ devolve o pedido **persistido** com **1 item**;
- **Erros:** lista vazia → **422** §{ erro: 'pedido sem itens' }§; cupom desconhecido → mensagem; pedido inexistente e rota inexistente → **404**;
- **Pagamento recusado:** resposta §{ status: 'novo', motivo: 'pagamento recusado' }§ e o banco **continua** com o pedido **novo** (§contarPorStatus§ = §{ novo: 1 }§).
**Boas práticas:** **sempre feche** o servidor (§finally§/§t.after§); **verifique status, corpo e efeito persistido**; **injete** o gateway **falso** (dependência de terceiros); **não** use §sleep§: **espere eventos**. Para **Express/Nest**, bibliotecas como **Supertest** fazem isso sem abrir porta (**C5.5**).

### Contratos com terceiros
Dublês de serviços externos **podem divergir** da realidade. **Testes de contrato** (consumer-driven, Pact: C5.6) e **testes "de fumaça" periódicos** contra o sandbox do fornecedor **reduzem o risco**. Registre **o formato** das respostas reais (fixtures **gravadas**), mas **atualize** com disciplina.

### Quando o teste de integração é a melhor escolha
- **Acesso a dados** (SQL, ORM): **quase sempre** integração;
- **Serialização/rotas/validação**: via HTTP em processo;
- **Filas** (BullMQ, C4.5): com Redis real em contêiner;
- **Fluxos de transação** (consistência, rollback, concorrência).
**E o unitário?** Continua ótimo para **regras puras**; a **integração cobre as junções**.

### Antipadrões
- **Testes de integração lentos** (segundos cada) **por subirem tudo** a cada teste: **compartilhe** o que é **imutável** (servidor/contêiner) e **isole** o que é **mutável** (dados);
- **Dependência de dados "mágicos"** do banco compartilhado;
- **Esperas fixas** (§sleep(500)§): intermitência (aula tst-03);
- **Testes que dependem da ordem**;
- **Misturar** vários cenários em um **mega-teste** (difícil diagnosticar);
- **Mockar o banco** em um teste que **existe para testar o banco**.

### Feedback
Rode **integração no CI a cada PR** (médio, minutos) e **unitários a cada salvamento/commit** (segundos). **Meça** a duração e **corte** o que for lento sem valor.`,
  concepts: [
    { term: 'Teste de integração', def: 'Teste que exercita dois ou mais componentes reais juntos, como código e banco de dados ou código e servidor HTTP.' },
    { term: 'Porta efêmera', def: 'Porta alocada pelo sistema operacional (listen(0)) para evitar conflitos em testes.' },
    { term: 'Rollback', def: 'Desfazer uma transação de banco, restaurando o estado anterior.' },
    { term: 'Restrição CHECK', def: 'Regra do banco que rejeita linhas que violam uma condição declarada.' },
    { term: 'Testcontainers', def: 'Biblioteca que sobe contêineres descartáveis (bancos, filas) durante os testes.' },
    { term: 'Fake', def: 'Implementação funcional simplificada usada em testes, como um repositório em memória.' },
    { term: 'Teste de contrato', def: 'Teste que verifica que consumidor e provedor concordam sobre o formato das mensagens trocadas.' }
  ],
  examples: R`**Analogia:** os testes unitários verificam **cada peça de um motor** na bancada; o teste de integração **liga as peças e gira o eixo**: é ali que aparece o parafuso que não encaixa, a junta que vaza, o óleo que não circula, defeitos que nenhuma inspeção isolada mostra.

**Exemplo 1: rollback.** Um item inválido desfaz o pedido inteiro; um mock do repositório não pegaria.

**Exemplo 2: teste que não testava.** UPDATE em tabela vazia não violou a restrição; o teste só ficou válido depois de inserir uma linha.

**Exemplo 3: API em processo.** POST com cupom devolve 201 e total 18, o gateway falso recebe o valor, e o GET lê o pedido persistido.`,
  code: [
    { title: 'Repositório contra SQLite real: transação, restrições e cascata (JavaScript, node:sqlite; 5 testes passam)', lang: 'js', code: R`import test from 'node:test';
import assert from 'node:assert/strict';
import { RepositorioPedidos } from '../src/repositorio.mjs';

const pedido = (extra = {}) => ({ cliente: 'ana', itens: [{ sku: 'A', qtd: 2, preco: 10 }, { sku: 'B', qtd: 1, preco: 5 }], total: 25, criadoEm: '2026-11-25T10:00:00.000Z', ...extra });

test('transação: um item inválido desfaz o pedido inteiro (ROLLBACK)', () => {
  const repo = new RepositorioPedidos();   // :memory: novo por teste
  assert.throws(() => repo.salvar(pedido({ itens: [{ sku: 'A', qtd: 1, preco: 1 }, { sku: 'B', qtd: 0, preco: 1 }] })), /CHECK constraint failed/);
  assert.deepEqual(repo.contarPorStatus(), {});
});

test('restrições: o status inválido só falha se houver linha para atualizar', () => {
  const repo = new RepositorioPedidos();
  repo.salvar(pedido());   // sem esta linha o UPDATE não afeta nada e o teste de erro falharia
  assert.throws(() => repo.db.exec("UPDATE pedidos SET status = 'xyz'"), /CHECK constraint failed/);
});

test('cascata: apagar o pedido remove os itens', () => {
  const repo = new RepositorioPedidos();
  const id = repo.salvar(pedido());
  repo.db.prepare('DELETE FROM pedidos WHERE id = ?').run(id);
  assert.equal(Number(repo.db.prepare('SELECT COUNT(*) AS n FROM itens').get().n), 0);
});`, notes: [{ l: '7', t: 'Banco novo em memória por teste: isolamento sem limpeza.' }, { l: '14', t: 'Um teste de restrição precisa de dados que possam violá-la.' }] },
    { title: 'API HTTP em processo com porta efêmera e gateway falso (JavaScript; 3 testes passam)', lang: 'js', code: R`import { criarServidor } from '../src/servidor.mjs';

async function comServidor(opcoes, fn) {
  const s = criarServidor(opcoes); const porta = await s.ouvir();   // listen(0): porta livre
  try { await fn('http://127.0.0.1:' + porta, s); } finally { await s.fechar(); }
}

test('POST /pedidos cria, cobra e GET devolve o pedido persistido', async () => {
  const cobrancas = [];
  await comServidor({ relogio: () => new Date('2026-11-25T10:00:00Z'), pagamento: { cobrar: async (c) => { cobrancas.push(c); return { aprovado: true }; } } }, async (base) => {
    const r = await fetch(base + '/pedidos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cliente: 'ana', itens: [{ sku: 'A', qtd: 2, preco: 10 }], cupom: 'bemvindo10' }) });
    assert.equal(r.status, 201);
    assert.deepEqual(await r.json(), { id: 1, status: 'pago', total: 18 });
    assert.deepEqual(cobrancas, [{ pedidoId: 1, valor: 18 }]);
    assert.equal((await fetch(base + '/pedidos/1')).status, 200);
  });
});`, notes: [{ l: '4', t: 'Porta efêmera: sem conflito entre testes ou execuções.' }, { l: '5', t: 'O finally garante que o servidor é fechado mesmo se o teste falhar.' }] },
    { title: 'Postgres descartável com Testcontainers (TypeScript/JS; trecho conceitual, não executado nesta aula)', lang: 'js', code: R`import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';

let container, pool;
before(async () => {
  container = await new PostgreSqlContainer('postgres:17').start();      // contêiner novo por suíte
  pool = new pg.Pool({ connectionString: container.getConnectionUri() });
  await pool.query(await readFile('migrations/001-pedidos.sql', 'utf8')); // as mesmas migrações da produção
});
after(async () => { await pool.end(); await container.stop(); });

// cada teste roda dentro de uma transação revertida, ou usa um schema próprio`, notes: [{ l: '5', t: 'Mesmo motor da produção: pega diferenças de dialeto que o SQLite não pega.' }, { l: '8', t: 'Migrações reais fazem parte do teste de integração.' }] }
  ],
  bestPractices: ['Integre o que é seu (banco, serialização, HTTP em processo) e simule terceiros com fakes e contratos.', 'Use um banco novo por teste e dados mínimos construídos no próprio teste.', 'Teste transações, restrições e cascatas com o banco de verdade.', 'Use porta efêmera, feche o servidor em finally e verifique status, corpo e efeito persistido.', 'Use o mesmo motor da produção quando o dialeto importar (Postgres em contêiner, Testcontainers).', 'Execute as mesmas migrações da produção nos testes.', 'Evite esperas fixas e dependência de ordem.'],
  mistakes: ['Mockar o banco em um teste cujo objetivo é testar o banco.', 'Teste de restrição sem dados que a violem (passa sem testar nada).', 'Banco compartilhado entre testes, com dados sujos.', 'Chamar serviços externos reais em testes automatizados.', 'Supor que SQLite e Postgres se comportam igual.', 'Esquecer o PRAGMA foreign_keys no SQLite.'],
  market: R`**Testes de integração com banco real** (Testcontainers, contêineres Docker) são **padrão** em equipes de backend; saber **isolar dados**, **testar transações** e **escolher o que simular** é o que **evita** regressões em **produção**.`,
  summary: R`Testes de integração exercitam componentes reais juntos e pegam o que dublês escondem: SQL, restrições, transações, serialização e rotas. Integre o que é seu (banco, HTTP em processo) e simule terceiros com fakes e testes de contrato. Medido: 5 testes do repositório com SQLite real em memória (321 ms) e 3 testes da API em porta efêmera (661 ms) passaram; o rollback só apareceu com o banco real, e um teste de restrição só valeu após inserir uma linha que pudesse violá-la. SQLite em memória é rápido, mas o dialeto difere; Testcontainers com Postgres foi apenas analisado.`,
  refs: [REF.integrationTest, REF.practicalPyramid, REF.nodeSqlite, REF.sqliteConstraints, REF.testcontainers, REF.nodeTest],
  cards: [
    { q: 'O que um teste de integração pega que o unitário não pega?', a: 'Defeitos nas junções: SQL inválido, restrições, transações, serialização, códigos de status e configuração.' },
    { q: 'Por que usar um banco novo por teste?', a: 'Dá isolamento sem limpeza e sem dependência de ordem; no laboratório cada teste cria um :memory: novo.' },
    { q: 'Qual a lição do UPDATE em tabela vazia?', a: 'Um teste de restrição só vale se houver dados que possam violá-la; sem linhas o banco não reclama e o teste não testa nada.' },
    { q: 'Quando preferir Postgres em contêiner ao SQLite em memória?', a: 'Quando o dialeto, os tipos, os índices ou os locks do motor de produção importam para o comportamento testado.' }
  ]
}
];
