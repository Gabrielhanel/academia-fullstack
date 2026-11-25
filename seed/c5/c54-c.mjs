// C5.4 — Fundamentos de testes. Aulas 5 e 6 (TDD; BDD e estratégia de qualidade).
import { REF } from './c54-a.mjs';
import { REF2 } from './c54-b.mjs';
const R = String.raw;

export const REF3 = {
  tddFowler: { title: 'Martin Fowler — TestDrivenDevelopment', url: 'https://martinfowler.com/bliki/TestDrivenDevelopment.html', kind: 'artigo' },
  tddBeck: { title: 'Test-Driven Development: By Example (Kent Beck)', url: 'https://www.informit.com/store/test-driven-development-by-example-9780321146533', kind: 'livro' },
  northBdd: { title: 'Dan North — Introducing BDD', url: 'https://dannorth.net/introducing-bdd/', kind: 'artigo' },
  gherkin: { title: 'Cucumber — Gherkin reference', url: 'https://cucumber.io/docs/gherkin/reference/', kind: 'doc' },
  cucumberDocs: { title: 'Cucumber — Documentation', url: 'https://cucumber.io/docs/cucumber/', kind: 'doc' },
  testCoverage: { title: 'Martin Fowler — TestCoverage', url: 'https://martinfowler.com/bliki/TestCoverage.html', kind: 'artigo' },
  stryker: { title: 'Stryker Mutator — Documentation', url: 'https://stryker-mutator.io/docs/', kind: 'doc' },
  spotifyHoneycomb: { title: 'Spotify Engineering — Testing of Microservices', url: 'https://engineering.atspotify.com/2018/01/testing-of-microservices', kind: 'artigo' },
  nodeCoverage: { title: 'Node.js — Test runner: collecting code coverage', url: 'https://nodejs.org/api/test.html#collecting-code-coverage', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'tst-05', moduleId: 'm3', order: 5, minutes: 75, tags: ['TDD', 'red-green-refactor', 'kata', 'design emergente', 'baby steps'],
  title: 'TDD: red-green-refactor na prática, com um kata executado passo a passo',
  objectives: ['Explicar o ciclo red-green-refactor e as três regras do TDD', 'Aplicar TDD em um kata, avançando em passos pequenos', 'Observar a evolução dos testes verdes a cada passo e a refatoração sem quebrar nada', 'Distinguir TDD clássico (Chicago) de TDD com mocks (Londres) e TDD de BDD', 'Reconhecer benefícios, custos e quando o TDD não ajuda', 'Usar TDD para descobrir design e não só para ter cobertura'],
  intro: R`**TDD** (*Test-Driven Development*) inverte a ordem: **escreva um teste que falha** (*red*), **faça o mínimo** para passar (*green*), **melhore o código** sem mudar o comportamento (*refactor*). O ciclo cabe em **minutos** e **guia o design**. No laboratório, o kata da **calculadora de strings** foi executado com **8 testes contra 8 versões** da implementação: **0/8 → 2/8 → 4/8 → 5/8 → 6/8 → 7/8 → 8/8**, e a **refatoração final** manteve **8/8**: a sequência de **verde crescente** é a evidência do ciclo.`,
  theory: R`### O ciclo e as regras
**Ciclo:** **Red** (um teste novo falha, **pelo motivo certo**) → **Green** (a **menor** mudança que passa tudo) → **Refactor** (**limpe** com testes verdes; sem comportamento novo) → repita.
**Três regras** (Robert Martin): (1) **não escreva código de produção** sem **um teste que falhe**; (2) **não escreva mais teste** do que o **suficiente para falhar** (e falha de compilação conta); (3) **não escreva mais código** do que o **suficiente para passar** o teste.
**Benefícios (relatados, não universais):** **design mais simples e testável**, **menos defeitos escapando**, **feedback imediato**, **cobertura natural**, **coragem para refatorar**, **documentação executável**. **Custos:** **curva de aprendizado**, **ritmo mais lento no início**, **testes ruins** viram **dívida** (aulas tst-04 e C5.8). **Evidência empírica** sobre ganho de qualidade é **mista**; os **melhores efeitos** aparecem com **disciplina** e **bons testes**.

### O kata executado (calculadora de strings)
Requisitos **em ordem crescente** (cada um vira **um teste**): **1)** texto vazio → **0**; **2)** um número → ele mesmo; **3)** dois números por **vírgula**; **4)** **quantidade qualquer** de números; **5)** **nova linha** também separa (§'1\n2,3'§ → 6); **6)** **separador personalizado** (§'//;\n1;2'§ → 3); **7)** **negativos lançam erro** listando-os (§negativos não permitidos: -1,-3§); **8)** **números acima de 1000 são ignorados** (§'2,1001,1000'§ → 1002).
**Os mesmos 8 testes** foram executados contra **8 versões** da implementação (§IMPL=v0..v7§):
| Versão | O que muda | Passam | Falham |
|---|---|---|---|
| **v0** | **não implementado** (lança erro) | **0** | 8 |
| **v1** | vazio → 0; um número | **2** | 6 |
| **v2** | separa por **vírgula** e soma | **4** | 4 |
| **v3** | **nova linha** (regex §[,\n]§) | **5** | 3 |
| **v4** | **cabeçalho** §//x\n§ | **6** | 2 |
| **v5** | **negativos** lançam erro | **7** | 1 |
| **v6** | ignora **> 1000** | **8** | 0 |
| **v7** | **refatoração** (constantes, funções pequenas) | **8** | 0 |
Cada linha é um ciclo **red→green**: **os testes que ainda não passam** são o **backlog** do **próximo passo**. **v7** é o **refactor**: **mesmos 8 verdes**, **código mais legível** (§LIMITE§, §separarCabecalho§, §escapar§): **a rede de testes** (cln-03) **permitiu** a mudança. **Limitação honesta:** a sequência foi **reconstruída** em versões **sucessivas e executadas**; **não** é o **histórico real** de commits de uma pessoa fazendo TDD (que também **tropeça**, volta e **escreve testes errados**).

### Passos de bebê e o "mínimo" (*fake it till you make it*)
- **Passos pequenos:** um **teste novo** por vez; **commit** a cada verde;
- **Fake it:** o **primeiro verde** pode **devolver uma constante** (§return 0§); o **próximo teste** força **generalizar**;
- **Triangulação:** **dois exemplos** forçam a **forma geral**;
- **Implementação óbvia:** quando **a solução é trivial**, escreva-a direto; **volte aos passos pequenos** se **errar**.
- **Teste que falha pelo motivo certo:** veja o **vermelho** (se **passa de primeira**, o teste **não testa** o novo comportamento).
- **Ordem de transformações:** de **mais simples** (constante → variável → condição → laço) evita **saltos** que **travam**.

### Escolas: Chicago x Londres, TDD x BDD
- **Chicago/clássica:** **estado**, **colaboradores reais**, **design emerge** da **refatoração** (foco em **comportamento da unidade**); bom em **regras de domínio**;
- **Londres/mockista:** **de fora para dentro** (*outside-in*), **mocks nas fronteiras** para **descobrir** papéis e contratos; **cuidado com over-mocking** (aula tst-04);
- **BDD** (aula tst-06) **leva** a ideia **ao nível do comportamento do sistema**, em **linguagem do domínio**, **colaborativa**.
- **ATDD:** começar por **teste de aceitação** (que falha) e **descer** com ciclos TDD.

### Onde TDD brilha e onde não
- **Brilha:** **lógica de negócio**, **algoritmos**, **bugs** (escreva **o teste que reproduz** o defeito **antes** de corrigir), **APIs bem definidas**, **código legado** (testes de caracterização + TDD no novo);
- **Dificulta:** **exploração/protótipo** (o **design** ainda é **desconhecido**: **spike** primeiro, **jogue fora** e **refaça** com TDD), **UI visual**, **integrações** com sistemas **instáveis**, **código dominado por frameworks**;
- **Pragmatismo:** **TDD é uma ferramenta**, **não religião**: **use onde ajuda** e **meça** (defeitos, tempo de ciclo, confiança).

### TDD e design
Escrever o **teste primeiro** **força** perguntar "**como eu uso isto?**": **APIs mais simples**, **dependências explícitas** (DI: pat-04), **funções pequenas** (cln-01). **Sinais de design ruim** aparecem **cedo**: **preparação enorme** no teste, **muitos mocks**, **teste difícil de nomear**. **Ouça o teste**: **teste difícil** = **código difícil de usar**.

### Hábitos que sustentam o TDD
- **Lista de testes** (um *backlog* curto do que falta): **anote** ideias e **escolha** o próximo;
- **Execução rápida** (**segundos**): modo **watch** (§node --test --watch§);
- **Commits** frequentes com **mensagens por comportamento**;
- **Refatore** **só no verde**; **nunca** misture **refatorar** e **mudar comportamento** (**dois chapéus**: cln-03);
- **Par/mob** para **disciplina** e **feedback**;
- **Code katas** (calculadora de strings, FizzBuzz, bowling, Game of Life) para **treinar o ritmo**.

### Armadilhas
- **Testar implementação** (teste **quebra** a cada refatoração: tst-04);
- **Testes grandes** demais por passo;
- **Pular o vermelho** (**falso positivo**);
- **Otimizar** antes do verde;
- **Apagar testes** que incomodam;
- **TDD "de fachada"** (escrever o teste **depois** e chamar de TDD: **perde** o efeito de **design**).`,
  concepts: [
    { term: 'TDD', def: 'Test-Driven Development: escrever um teste que falha, fazer o mínimo para passar e refatorar, em ciclos curtos.' },
    { term: 'Red-green-refactor', def: 'Ciclo do TDD: teste falhando (red), implementação mínima (green) e melhoria do código (refactor).' },
    { term: 'Kata', def: 'Exercício curto e repetível de programação usado para praticar uma técnica.' },
    { term: 'Fake it', def: 'Técnica de TDD que devolve uma constante para passar o primeiro teste e generaliza com os testes seguintes.' },
    { term: 'Triangulação', def: 'Uso de dois ou mais exemplos para forçar a implementação a ser geral.' },
    { term: 'Outside-in', def: 'Abordagem de TDD que começa pelo comportamento externo e desce às colaborações internas, usando mocks nas fronteiras.' },
    { term: 'Spike', def: 'Experimento descartável e com limite de tempo para aprender antes de projetar a solução.' }
  ],
  examples: R`**Analogia:** o TDD é **subir uma escada com corda de segurança**: cada degrau (teste) é **fixado** antes do próximo passo; se o pé escorrega (regressão), a corda (testes) **segura**; e você **só** reorganiza a mochila (refatora) **com os dois pés firmes** (testes verdes).

**Exemplo 1: placar do kata.** v0 0/8; v1 2/8; v2 4/8; v3 5/8; v4 6/8; v5 7/8; v6 8/8; v7 (refatoração) 8/8.

**Exemplo 2: fake it.** O primeiro verde devolve 0 (vazio); o segundo teste obriga a converter o número.

**Exemplo 3: bug.** O defeito é reproduzido primeiro em um teste que falha; só então é corrigido.`,
  code: [
    { title: 'Os 8 testes do kata (JavaScript, node:test; rodam contra IMPL=v0..v7)', lang: 'js', code: R`import test from 'node:test';
import assert from 'node:assert/strict';
const { somar } = await import('./impl-' + (process.env.IMPL || 'v7') + '.mjs');

test('1. texto vazio vale 0', () => assert.equal(somar(''), 0));
test('2. um número devolve ele mesmo', () => assert.equal(somar('5'), 5));
test('3. dois números separados por vírgula', () => assert.equal(somar('1,2'), 3));
test('4. quantidade qualquer de números', () => assert.equal(somar('1,2,3,4'), 10));
test('5. nova linha também separa', () => assert.equal(somar('1\n2,3'), 6));
test('6. separador personalizado //;\\n', () => assert.equal(somar('//;\n1;2'), 3));
test('7. negativos lançam erro listando-os', () => assert.throws(() => somar('1,-1,2,-3'), /negativos não permitidos: -1,-3/));
test('8. números acima de 1000 são ignorados', () => assert.equal(somar('2,1001,1000'), 1002));
// IMPL=v0 0/8 | v1 2/8 | v2 4/8 | v3 5/8 | v4 6/8 | v5 7/8 | v6 8/8 | v7 8/8 (refatoração)`, notes: [{ l: '3', t: 'O mesmo arquivo de testes é executado contra cada passo da implementação.' }, { l: '12', t: 'Resultado medido no laboratório.' }] },
    { title: 'Passos v1 e v2: fake it e generalização (JavaScript)', lang: 'js', code: R`// v1 (verde para os testes 1 e 2): o mínimo
export function somar(t) { return t === '' ? 0 : Number(t); }

// v2 (verde também para 3 e 4): o teste de dois números força a generalização
export function somar(t) {
  if (t === '') return 0;
  return t.split(',').reduce((s, n) => s + Number(n), 0);
}`, notes: [{ l: '2', t: 'Implementa só o que os testes atuais exigem.' }, { l: '8', t: 'Os novos testes obrigam a forma geral.' }] },
    { title: 'v7: refatoração com os 8 testes verdes (JavaScript)', lang: 'js', code: R`const LIMITE = 1000;
const SEPARADORES_PADRAO = ',\n';
const escapar = (c) => c.replace(/[\\\]^-]/g, '\\$&');

function separarCabecalho(texto) {
  if (!texto.startsWith('//')) return { separadores: SEPARADORES_PADRAO, corpo: texto };
  const fim = texto.indexOf('\n');
  return { separadores: texto.slice(2, fim) + '\n', corpo: texto.slice(fim + 1) };
}

export function somar(texto) {
  if (texto === '') return 0;
  const { separadores, corpo } = separarCabecalho(texto);
  const numeros = corpo.split(new RegExp('[' + escapar(separadores) + ']')).map(Number);
  const negativos = numeros.filter((n) => n < 0);
  if (negativos.length) throw new Error('negativos não permitidos: ' + negativos.join(','));
  return numeros.filter((n) => n <= LIMITE).reduce((soma, n) => soma + n, 0);
}`, notes: [{ l: '1', t: 'Constantes e funções pequenas, com o mesmo comportamento (8/8).' }, { l: '3', t: 'Escapa caracteres especiais do separador personalizado.' }] }
  ],
  bestPractices: ['Veja o teste falhar pelo motivo certo antes de implementar.', 'Faça o mínimo para passar e generalize com o próximo teste (fake it, triangulação).', 'Refatore só no verde e nunca misture refatoração com mudança de comportamento.', 'Mantenha uma lista de testes e commits pequenos.', 'Reproduza cada bug com um teste que falha antes de corrigir.', 'Use spikes descartáveis quando o design for desconhecido e refaça com TDD.', 'Ouça os testes: preparação enorme e muitos mocks indicam design a melhorar.'],
  mistakes: ['Escrever os testes depois e chamar de TDD.', 'Pular o vermelho (teste que nunca falhou).', 'Passos grandes demais.', 'Testar a implementação em vez do comportamento.', 'Apagar ou desabilitar testes incômodos.', 'Aplicar TDD de forma dogmática em exploração ou UI visual.'],
  market: R`**TDD** e **refatoração disciplinada** são **marca de times de engenharia maduros** (XP, consultorias); **katas** e **pair programming** aparecem em **processos seletivos**: saber **demonstrar o ciclo** vale mais do que **recitar** a teoria.`,
  summary: R`TDD é o ciclo red-green-refactor com três regras: nenhum código sem teste falhando, o mínimo de teste para falhar e o mínimo de código para passar. No kata da calculadora de strings, os mesmos 8 testes rodaram contra 8 versões: 0, 2, 4, 5, 6, 7, 8 e 8 verdes (a última, uma refatoração). Use passos pequenos, fake it e triangulação, refatore só no verde e ouça o design que os testes revelam. A sequência foi reconstruída, não é um histórico real; TDD é ferramenta, não dogma.`,
  refs: [REF3.tddFowler, REF3.tddBeck, REF2.mocksArentStubs, REF.nodeTest],
  cards: [
    { q: 'Quais são as três regras do TDD?', a: 'Não escrever código de produção sem um teste que falhe; não escrever mais teste do que o suficiente para falhar; não escrever mais código do que o suficiente para passar.' },
    { q: 'O que é "fake it till you make it"?', a: 'Devolver uma constante para passar o primeiro teste e generalizar quando novos testes exigirem.' },
    { q: 'Por que ver o teste falhar antes?', a: 'Para garantir que ele realmente verifica o comportamento novo (um teste que passa de primeira pode não testar nada).' },
    { q: 'Quando o TDD ajuda menos?', a: 'Em exploração e protótipos (design desconhecido), UI visual e código dominado por frameworks; faça um spike e refaça com TDD.' }
  ]
},
{
  id: 'tst-06', moduleId: 'm3', order: 6, minutes: 85, tags: ['BDD', 'Gherkin', 'Cucumber', 'cobertura', 'mutação', 'estratégia de testes', 'CI'],
  title: 'BDD e estratégia de qualidade: comportamento em linguagem do domínio, cobertura x mutação e como combinar camadas',
  objectives: ['Explicar BDD, Gherkin e o papel das conversas (três amigos) antes da automação', 'Escrever cenários declarativos e executá-los com Cucumber em português', 'Distinguir cobertura de código de qualidade de testes e medir com mutação', 'Montar uma estratégia de testes por risco (camadas, frequência, orçamento de lentidão e de flakiness)', 'Definir o que roda no commit, na PR e antes do deploy', 'Escolher métricas úteis e evitar métricas de vaidade'],
  intro: R`**BDD** (*Behavior-Driven Development*) descreve o **comportamento** do sistema em **linguagem compartilhada** por **pessoas de negócio, produto, QA e desenvolvimento**, e **automatiza** esses exemplos como testes. Aqui você executa **7 cenários** em português com o **Cucumber 13.3.0** (**40 passos passaram**) e vê a **armadilha da cobertura**: a suíte tem **100% de cobertura de linhas** e, mesmo assim, **2 de 7 mutantes sobreviveram** (**cupom que expira no último dia** e **quantidade zero**). Por fim, monta-se uma **estratégia** de testes por **risco**.`,
  theory: R`### BDD: conversa antes de código
BDD (Dan North) nasceu para **corrigir o foco do TDD**: **testes são especificações** de **comportamento**, escritos **com** quem conhece o **negócio**. O **processo** importa mais que a **ferramenta**:
1. **Descoberta** (*Discovery*): **três amigos** (produto/negócio, desenvolvimento, teste) discutem a história **com exemplos concretos** ("**e se o cupom expirou ontem? e hoje?**");
2. **Formulação** (*Formulation*): os exemplos viram **cenários** em **Gherkin** (linguagem de **domínio**);
3. **Automação** (*Automation*): cada passo ganha **código** (Cucumber, Behave, SpecFlow).
**Benefício principal:** **entendimento compartilhado** e **documentação viva**; **automatizar** é **bônus**. **Risco:** **tratar BDD como "testes em inglês"** escritos **só por QA** depois (**custo de manter** sem **benefício de conversa**).

### Gherkin
Estrutura: **Funcionalidade** (*Feature*) → **Cenário** (*Scenario*) com **Dado** (*Given*, contexto), **Quando** (*When*, ação), **Então** (*Then*, resultado); **E/Mas** continuam; **Contexto** (*Background*) repete **passos comuns**; **Esquema do Cenário** + **Exemplos** (tabela) para **variações de dados**; **§# language: pt§** habilita **palavras-chave em português**. No laboratório (§features/pedidos.feature§): **Finalizar pedido** com **Contexto** (hoje = 2026-11-25; gateway aprova), cenários **compra simples** (total R$ 20,00 e notificação), **cupom válido** (R$ 18,00), **cupom expirado** (recusado **antes** de cobrar, **sem cobrança**), **esquema** com **3 exemplos** (1, 3 e 12 unidades) e **pagamento recusado** (pedido continua **novo**, **sem notificação**).
**Cenários bons (declarativos):** descrevem **o quê** (regra de negócio), **não o como** (cliques, SQL); **curtos** (3 a 5 passos); **um comportamento**; **linguagem do domínio**; **independentes**; **dados relevantes explícitos** (o total esperado), **irrelevantes ocultos**.
**Cenários ruins (imperativos):** "**Dado que abro a página; e digito 'ana' no campo 'cliente'; e clico em 'Comprar'...**" (**frágeis**, **ilegíveis** para o negócio). **Mantenha o nível de UI nas definições dos passos**, não no texto.

### Cucumber na prática (13.3.0)
**Passos** casam com **expressões Cucumber** (§{string}§, §{int}§, §{word}§): §When('a cliente {string} compra {int} unidades de {string} a R$ {word}', ...)§. **Mundo** (*World*, §this§) **guarda o estado** do cenário; **hooks** (§Before§, §After§) **reiniciam** o estado. **Passos ambíguos ou indefinidos** aparecem com **sugestões** de código. **Medido:** os **7 cenários e 40 passos passaram** (§0,135 s§). Durante a escrita, **o primeiro cenário do cupom expirado falhou de verdade**: a data do **Contexto** (**2026-11-25**) **ainda** estava **dentro** da validade do cupom (§NATAL20§ vale até **2026-12-25**): **a falha revelou um cenário mal escrito**, **corrigido** com **§Dado que hoje é "2026-12-30"§**. **Outro achado:** inicialmente os passos usavam §{string}§ para valores sem aspas (**R$ 10,00**): o Cucumber **sugeriu passos novos** (**indefinidos**) até **trocar para §{word}§**.
**Quando vale:** **regras de negócio complexas** com **muitas variações** e **pessoas de negócio engajadas**; **quando não vale:** **só desenvolvedores** leem, **a lógica é técnica**, ou **o custo** de manter **sobrepõe** o ganho: **prefira testes normais** bem nomeados.

### Cobertura de código: o que ela diz e não diz
**Cobertura** mede **o que foi executado** (linhas, ramos, funções), **não o que foi verificado**. **Útil para achar código não testado**, **ruim como meta**: **100%** é **fácil de atingir** com testes **sem asserções**.
**Medido (§node --test --experimental-test-coverage§, sem E2E):**
| Arquivo | Linhas | Ramos | Funções |
|---|---|---|---|
| §dominio.mjs§ | **100%** | 100% | 100% |
| §repositorio.mjs§ | **100%** | 100% | 100% |
| §servico.mjs§ | **100%** | 100% | 100% |
| §servidor.mjs§ | **100%** | 95,45% | 90,91% |
| **Todos** | **100%** | **98,48%** | **95,65%** |

### Teste de mutação: a pergunta certa
**Mutação** altera o código (**mutantes**: trocar §>§ por §>=§, remover uma condição) e roda os testes: se **nenhum teste falha**, o mutante **sobreviveu**: **falta verificação**. Ferramentas: **Stryker** (JS/TS), PIT (Java), mutmut (Python); **neste laboratório** um script **manual** (§mutacao-manual.mjs§) aplicou **7 mutantes** e rodou a suíte **sem E2E**:
| Mutante | Resultado |
|---|---|
| desconto sem limitar entre 0 e 1 | **morto** |
| **cupom expira no próprio último dia** (§>§ → §>=§) | **SOBREVIVEU** |
| **aceita quantidade 0** (§< 1§ → §< 0§) | **SOBREVIVEU** |
| aceita preço levemente negativo | morto |
| desconto vira acréscimo | morto |
| inverte a decisão do pagamento | morto |
| marcarPago sem exigir status novo | morto |
**5 de 7 mortos, com 100% de cobertura de linhas.** Os **dois sobreviventes** são **valores de fronteira** (**o dia exato** da expiração; **quantidade 0**) **sem teste**: **a cobertura** disse "**tudo executado**"; **a mutação** disse "**faltam verificações**". **Ação:** **adicionar os dois testes de fronteira** (§extras/fronteiras.test.mjs§): com eles, a mesma rodada deu **7 de 7 mutantes mortos**. (Stryker **não foi executado**; a mutação aqui é **manual e limitada**, 7 alterações.)

### Estratégia de testes por risco
Uma **estratégia** responde: **o que testar, em qual camada, com que frequência e com que orçamento**.
1. **Mapeie o risco** (impacto × probabilidade): **pagamentos, dados pessoais, autenticação, cálculos financeiros** pedem **mais** testes (**várias camadas**); **telas de ajuda** pedem **menos**;
2. **Escolha a forma** (pirâmide, troféu ou favo: aula tst-01) **conforme a arquitetura**: **lógica rica** → **pirâmide**; **microsserviços** → **integração por serviço** + **contratos**; **front-end de componentes** → **troféu**;
3. **Defina o que roda quando** (feedback x custo):
| Momento | Testes | Meta de tempo |
|---|---|---|
| **Salvar/commit** | **unitários** e **análise estática** (lint, tipos) | segundos |
| **Pull request** | + **integração** (banco, HTTP) e **BDD** | poucos minutos |
| **Antes do deploy / noturno** | + **E2E**, **carga**, **contrato**, **segurança** | dezenas de minutos |
| **Pós-deploy** | **fumaça** em produção/homologação | minutos |
4. **Orçamentos:** **tempo total** do ciclo da PR; **flakiness ≈ 0** (testes intermitentes **quarentenados** com prazo: aula tst-03); **proporção** entre camadas **acompanhada**;
5. **Dados de teste e ambientes** versionados e reproduzíveis;
6. **Testes exploratórios** (humanos) **para o que a automação não vê**: **usabilidade**, **fluxos novos**, **caos**; **não** substitua por **testes automatizados** o **olhar humano**;
7. **Produção como fonte** (observabilidade, C4.6): **alertas**, **testes sintéticos**, **feature flags** e **rollout gradual** complementam os testes.

### Métricas úteis e de vaidade
- **Úteis:** **tempo de feedback** da PR; **taxa de testes intermitentes**; **defeitos escapados** (achados em produção) e **sua causa**; **tempo para corrigir**; **pontuação de mutação** (nos módulos críticos); **cobertura de código novo** (**diferencial**) como **alarme**, **não meta**;
- **Vaidade:** **número de testes**, **cobertura global** como meta, **testes por desenvolvedor**.
**Lei de Goodhart:** **quando uma métrica vira meta, deixa de ser boa métrica**.

### Definição de pronto e responsabilidades
**Qualidade é responsabilidade do time**, não de um departamento. **Definição de pronto** com **testes nos níveis certos**, **revisão** (C5.8), **sem testes ignorados**, **documentação**/ADR quando couber. **QA/SDET** **ensina**, **projeta estratégia**, **mantém infraestrutura** e **explora**; **não é a "peneira" final**.

### Resumo do laboratório
| Item | Resultado medido |
|---|---|
| Testes do Node | **28/28** |
| Cucumber | **7 cenários / 40 passos** passam |
| Cobertura (sem E2E) | **100% linhas**, 98,48% ramos |
| Mutação manual | **5/7 mortos** (2 fronteiras sobreviveram); **7/7** com os 2 testes de fronteira |
| Pirâmide | unitários 613 ms | mocks 346 ms | integração 321 e 661 ms | E2E 2.983 ms |
| Flakiness | espera fixa 8/14 | espera por condição 0/14 |`,
  concepts: [
    { term: 'BDD', def: 'Behavior-Driven Development: especificar o comportamento do sistema em linguagem compartilhada e automatizar os exemplos.' },
    { term: 'Gherkin', def: 'Linguagem de especificação com Dado, Quando e Então usada para descrever cenários de comportamento.' },
    { term: 'Três amigos', def: 'Conversa entre negócio, desenvolvimento e teste para descobrir exemplos antes de implementar.' },
    { term: 'Cobertura de código', def: 'Medida do que foi executado pelos testes (linhas, ramos, funções), não do que foi verificado.' },
    { term: 'Teste de mutação', def: 'Técnica que altera o código e verifica se os testes detectam a alteração; mutantes sobreviventes indicam verificações faltantes.' },
    { term: 'Estratégia de testes', def: 'Plano que define o que testar, em que camada, com que frequência e com que orçamento, com base no risco.' },
    { term: 'Lei de Goodhart', def: 'Quando uma medida se torna meta, deixa de ser uma boa medida.' }
  ],
  examples: R`**Analogia:** a **cobertura** é o **diário de presença** (quem estava na sala); a **mutação** é a **prova surpresa** (quem realmente aprendeu). Uma turma pode ter **100% de presença** e **dois alunos** que **nunca** foram verificados nos **casos de fronteira**; o BDD é a **conversa** em que professora, coordenação e alunos **combinam o que será cobrado**.

**Exemplo 1: cenários.** Sete cenários em português executam os passos com o serviço real e dublês nas fronteiras: 40 passos passaram.

**Exemplo 2: cobertura x mutação.** 100% de linhas e 2 de 7 mutantes vivos (último dia do cupom e quantidade 0).

**Exemplo 3: estratégia por risco.** Unitários no commit, integração na PR, E2E e carga antes do deploy, fumaça depois.`,
  code: [
    { title: 'Feature em Gherkin (português) com Contexto e Esquema do Cenário (executada no Cucumber 13.3.0: 7 cenários passam)', lang: 'gherkin', code: R`# language: pt
Funcionalidade: Finalizar pedido

  Contexto:
    Dado que hoje é "2026-11-25"
    E o gateway de pagamento aprova as cobranças

  Cenário: Compra com cupom válido
    Quando a cliente "ana" compra 2 unidades de "A1" a R$ 10,00 com o cupom "BEMVINDO10"
    Então o pedido fica "pago" com total de R$ 18,00

  Cenário: Cupom expirado é recusado antes de cobrar
    Dado que hoje é "2026-12-30"
    Quando a cliente "ana" compra 1 unidades de "A1" a R$ 10,00 com o cupom "NATAL20"
    Então a compra é recusada com a mensagem "cupom expirado"
    E nenhuma cobrança é feita

  Esquema do Cenário: Totais com diferentes quantidades
    Quando a cliente "ana" compra <qtd> unidades de "A1" a R$ 10,00
    Então o pedido fica "pago" com total de R$ <total>
    Exemplos:
      | qtd | total  |
      | 1   | 10,00  |
      | 12  | 120,00 |`, notes: [{ l: '12', t: 'A data foi corrigida para depois do último dia do cupom (a falha revelou o erro do cenário).' }, { l: '18', t: 'O esquema roda o mesmo cenário para cada linha da tabela.' }] },
    { title: 'Definições de passos com Cucumber (JavaScript, @cucumber/cucumber 13.3.0)', lang: 'js', code: R`import { Given, When, Then, Before } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { ServicoPedidos } from '../../src/servico.mjs';
import { RepositorioPedidos } from '../../src/repositorio.mjs';

const moeda = (txt) => Number(String(txt).replace(',', '.'));
Before(function () { this.hoje = '2026-11-25'; this.aprova = true; this.cobrancas = []; this.notificacoes = []; this.resultado = null; this.erro = null; });

Given('que hoje é {string}', function (data) { this.hoje = data; });
When('a cliente {string} compra {int} unidades de {string} a R$ {word} com o cupom {string}', async function (cliente, qtd, sku, preco, cupom) {
  const servico = new ServicoPedidos({ repo: new RepositorioPedidos(), relogio: () => new Date(this.hoje + 'T10:00:00Z'),
    pagamento: { cobrar: async (c) => { this.cobrancas.push(c); return { aprovado: this.aprova }; } },
    notificador: { enviar: async (para, msg) => { this.notificacoes.push({ para, msg }); } } });
  try { this.resultado = await servico.criar({ cliente, itens: [{ sku, qtd, preco: moeda(preco) }], cupom }); } catch (e) { this.erro = e.message; }
});
Then('o pedido fica {string} com total de R$ {word}', function (status, total) { assert.equal(this.resultado.status, status); assert.equal(this.resultado.total, moeda(total)); });`, notes: [{ l: '7', t: 'O hook Before reinicia o estado do mundo em cada cenário.' }, { l: '9', t: '{word} casa valores sem aspas como 10,00.' }] },
    { title: 'Mutação manual: cobertura 100% e mutantes sobreviventes (JavaScript; resultado medido 5/7 mortos)', lang: 'js', code: R`const mutantes = [
  ['dominio.mjs', 'hoje > r.ate', 'hoje >= r.ate', 'cupom expira no próprio último dia'],
  ['dominio.mjs', 'i.qtd < 1', 'i.qtd < 0', 'aceita quantidade 0'],
  ['dominio.mjs', 'bruto * (1 - d)', 'bruto * (1 + d)', 'desconto vira acréscimo']
];
for (const [arq, de, para, desc] of mutantes) {
  // copia src e test para um diretório temporário, aplica a troca e roda a suíte
  const r = spawnSync(process.execPath, ['--test', 'test/'], { cwd: dirTemporario });
  console.log((r.status !== 0 ? 'MORTO      ' : 'SOBREVIVEU ') + desc);
}
// Testes que fecham os buracos: o último dia do cupom ainda vale e quantidade 0 é inválida
test('cupom NATAL20 ainda vale no último dia', () => assert.equal(validarCupom('NATAL20', '2026-12-25').valido, true));
test('quantidade zero é inválida', () => assert.throws(() => calcularTotal([{ sku: 'A', preco: 1, qtd: 0 }]), /quantidade inválida: A/));`, notes: [{ l: '9', t: 'Sobreviver = nenhum teste falhou com o código alterado.' }, { l: '12', t: 'Os testes de fronteira que faltavam.' }] }
  ],
  bestPractices: ['Faça a conversa dos três amigos com exemplos concretos antes de escrever cenários.', 'Escreva cenários declarativos, curtos e na linguagem do domínio; deixe cliques e SQL nas definições dos passos.', 'Use cobertura para achar código não executado, não como meta; complemente com mutação nos módulos críticos.', 'Defina a estratégia por risco: camadas, frequência (commit, PR, deploy) e orçamentos de tempo e flakiness.', 'Meça feedback, flakiness, defeitos escapados e pontuação de mutação; evite métricas de vaidade.', 'Mantenha testes exploratórios e observabilidade em produção como complementos.', 'Trate qualidade como responsabilidade do time, com uma definição de pronto clara.'],
  mistakes: ['BDD como testes em inglês escritos só por QA depois, sem conversa.', 'Cenários imperativos cheios de cliques.', 'Perseguir 100% de cobertura como meta (Goodhart).', 'Pirâmide invertida: muitos E2E manuais ou lentos.', 'Ignorar testes intermitentes e tempos de PR cada vez maiores.', 'Achar que testes automatizados dispensam testes exploratórios.'],
  market: R`**BDD**, **cobertura** e **teste de mutação** aparecem em **processos de qualidade** de **empresas reguladas** e de **produto**; **desenhar uma estratégia de testes por risco** é **competência de SDET, tech lead e arquitetura**.`,
  summary: R`BDD especifica comportamento em linguagem do domínio (Gherkin), com conversa dos três amigos antes de automatizar; no laboratório, 7 cenários e 40 passos passaram no Cucumber 13.3.0, e uma falha revelou um cenário mal escrito (data do cupom). Cobertura mede execução, não verificação: com 100% das linhas cobertas, a mutação manual deixou 2 de 7 mutantes vivos (último dia do cupom e quantidade 0). Monte a estratégia por risco: unitários no commit, integração na PR, E2E, carga e contrato antes do deploy e fumaça depois, com orçamentos de tempo e flakiness e métricas úteis (não de vaidade).`,
  refs: [REF3.northBdd, REF3.gherkin, REF3.cucumberDocs, REF3.testCoverage, REF3.stryker, REF3.nodeCoverage, REF3.spotifyHoneycomb, REF.trophy, REF.testPyramid],
  cards: [
    { q: 'Qual é o principal valor do BDD?', a: 'O entendimento compartilhado obtido na conversa com exemplos concretos; a automação é um bônus.' },
    { q: 'Por que 100% de cobertura não garante bons testes?', a: 'Cobertura mede o que foi executado, não verificado; no laboratório, 100% das linhas e ainda 2 de 7 mutantes sobreviveram.' },
    { q: 'O que são os mutantes sobreviventes do laboratório?', a: 'Cupom que expira no próprio último dia e aceitação de quantidade 0: valores de fronteira sem teste.' },
    { q: 'O que rodar no commit, na PR e antes do deploy?', a: 'Commit: unitários e análise estática; PR: integração e BDD; antes do deploy ou à noite: E2E, carga, contrato e segurança; depois: fumaça.' }
  ]
}
];
