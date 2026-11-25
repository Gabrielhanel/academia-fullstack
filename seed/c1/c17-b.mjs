// C1.7 — Requisitos e modelagem de domínio. Aulas 4 a 7 (BDD, DDD estratégico, DDD tático, levantamento de requisitos).
const R = String.raw;

export const REF2 = {
  gherkin: { title: 'Cucumber — Gherkin Reference', url: 'https://cucumber.io/docs/gherkin/reference/', kind: 'doc' },
  bdd: { title: 'Cucumber — Behaviour-Driven Development', url: 'https://cucumber.io/docs/bdd/', kind: 'doc' },
  betterGherkin: { title: 'Cucumber — Writing better Gherkin', url: 'https://cucumber.io/docs/bdd/better-gherkin/', kind: 'doc' },
  cucumberJs: { title: 'cucumber-js (repositório oficial)', url: 'https://github.com/cucumber/cucumber-js', kind: 'doc' },
  specByExample: { title: 'Martin Fowler — Specification By Example', url: 'https://martinfowler.com/bliki/SpecificationByExample.html', kind: 'article' },
  dddRef: { title: 'Eric Evans — Domain-Driven Design Reference', url: 'https://www.domainlanguage.com/ddd/reference/', kind: 'doc' },
  boundedContext: { title: 'Martin Fowler — Bounded Context', url: 'https://martinfowler.com/bliki/BoundedContext.html', kind: 'article' },
  ubiquitous: { title: 'Martin Fowler — Ubiquitous Language', url: 'https://martinfowler.com/bliki/UbiquitousLanguage.html', kind: 'article' },
  aggregate: { title: 'Martin Fowler — DDD Aggregate', url: 'https://martinfowler.com/bliki/DDD_Aggregate.html', kind: 'article' },
  valueObject: { title: 'Martin Fowler — Value Object', url: 'https://martinfowler.com/bliki/ValueObject.html', kind: 'article' },
  anemic: { title: 'Martin Fowler — Anemic Domain Model', url: 'https://martinfowler.com/bliki/AnemicDomainModel.html', kind: 'article' },
  domainEvent: { title: 'Martin Fowler — Domain Event', url: 'https://martinfowler.com/eaaDev/DomainEvent.html', kind: 'article' },
  dddBook: { title: 'Evans — Domain-Driven Design: Tackling Complexity in the Heart of Software (2003)', kind: 'book' },
  vernonBook: { title: 'Vernon — Implementing Domain-Driven Design (2013)', kind: 'book' },
  moscow: { title: 'Agile Business Consortium — MoSCoW Prioritisation', url: 'https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html', kind: 'doc' },
  kano: { title: 'Modelo de Kano (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Kano_model', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'req-04', moduleId: 'm2', order: 4, minutes: 65, tags: ['BDD', 'Gherkin', 'especificação por exemplos', 'Cucumber', 'documentação viva'],
  title: 'Especificação por exemplos e BDD: do exemplo ao teste automatizado',
  objectives: ['Explicar o BDD e a especificação por exemplos e o papel da conversa dos "três amigos"', 'Escrever cenários em Gherkin (Funcionalidade, Regra, Cenário, Esquema do Cenário, Exemplos) em linguagem de negócio', 'Distinguir cenários declarativos de imperativos e evitar os anti-padrões comuns', 'Automatizar cenários com definições de passos (cucumber-js) e interpretar o relatório de execução', 'Usar exemplos para descobrir regras e valores-limite e manter uma documentação viva'],
  intro: `A maior parte dos defeitos de requisito nasce de **interpretações diferentes** da mesma frase: o PO entendeu uma coisa, quem desenvolve outra e quem testa uma terceira. A **especificação por exemplos** ataca isso trocando descrições abstratas por **exemplos concretos** que todos entendem do mesmo jeito. O **BDD** (*Behaviour-Driven Development*, desenvolvimento guiado por comportamento) leva a ideia adiante: os exemplos são escritos em uma **linguagem estruturada (Gherkin)** e viram **testes automatizados**, formando uma **documentação viva**: se o comportamento muda, o teste falha. Os cenários desta aula foram **executados com cucumber-js 13** e o relatório real está registrado abaixo.`,
  theory: `### A cadeia: conversa → exemplos → automação
1. **Descoberta**: conversa entre **negócio, desenvolvimento e teste** (os **três amigos**) sobre uma história: regras, exceções, dúvidas;
2. **Formulação**: as regras ganham **exemplos concretos** (valores reais, casos de borda);
3. **Automação**: os exemplos em Gherkin são ligados ao código por **definições de passos**, executados a cada mudança;
4. **Documentação viva**: o conjunto de cenários passando é a **especificação atual e verdadeira** do sistema.
O BDD **não é uma ferramenta**: é um **processo de colaboração**. Escrever Gherkin sem a conversa é só "testes verbosos".

### Gherkin: a linguagem
Arquivos §.feature§ com palavras-chave (em português: §Funcionalidade§, §Regra§, §Cenário§, §Esquema do Cenário§, §Exemplos§, §Dado§, §Quando§, §Então§, §E§, §Mas§, §Contexto§). Declare o idioma com §# language: pt§. Estrutura:
- **Funcionalidade (Feature)**: o recurso, com uma descrição curta de valor;
- **Regra (Rule)**: agrupa cenários de **uma regra de negócio** (Gherkin 6 em diante);
- **Cenário (Scenario)**: um exemplo concreto: **Dado** (contexto), **Quando** (ação), **Então** (resultado observável);
- **Contexto (Background)**: passos comuns a todos os cenários da funcionalidade;
- **Esquema do Cenário (Scenario Outline)** + **Exemplos**: o mesmo cenário com uma **tabela de valores** (ótimo para limites).
No arquivo de teste desta aula:
§§§
Funcionalidade: Frete e desconto no carrinho
  Regra: Frete grátis para subtotal a partir de R$ 200,00
    Esquema do Cenário: Limite do frete grátis
      Dado um carrinho com 1 item "Mochila" de R$ <preco>
      Quando eu calculo o total
      Então o frete é R$ <frete>
      Exemplos:
        | preco  | frete |
        | 199,99 | 15,00 |
        | 200,00 | 0,00  |
        | 350,00 | 0,00  |
§§§
Os três exemplos exploram o **valor-limite** (199,99, 200,00 e acima), que é onde os erros se escondem.

### Escrever bem: declarativo, não imperativo
- **Declarativo** (o *quê*, no nível do negócio): "Dado que sou um cliente com cadastro, Quando finalizo a compra, Então recebo a confirmação por e-mail".
- **Imperativo** (o *como*, na interface): "Dado que abro a página X, E clico no campo 'e-mail', E digito '...', E clico em 'Enviar'..." — frágil (quebra com qualquer mudança de tela) e ilegível para o negócio.
Boas práticas (guia do Cucumber): **um cenário, um comportamento**; títulos que descrevem a **regra** ("Cupom vencido é recusado"); **poucos passos** (em geral de 3 a 5); **dados relevantes explícitos** e irrelevantes escondidos; **linguagem do domínio** (linguagem ubíqua); **cenários independentes** e **sem ordem entre si**; use Esquema do Cenário **só quando** os exemplos variam por dados, não por comportamento.

### Anti-padrões
- **Roteiro de teste de interface**: dezenas de cliques sob o nome de cenário.
- **Cenários gigantes** (20 passos) e **dependentes** entre si.
- **Passos com detalhes técnicos** ("POST /api/carrinho com JSON...").
- **Cenários para tudo**: BDD é para **comportamento relevante ao negócio**, não substitui testes unitários e de integração.
- **Escrito só por testers/devs**, sem o negócio: perde-se o principal benefício.

### Automação: definições de passos
Cada passo do Gherkin é ligado a uma **função** por texto ou expressão regular; o ferramental (Cucumber, SpecFlow/Reqnroll, Behave, pytest-bdd, Karate) executa os cenários e gera relatório. Em cucumber-js, o código do teste (**passos**) chama o **código do sistema**; um objeto **World** (§this§) carrega o estado entre os passos do mesmo cenário.
Resultado da execução real desta aula (cucumber-js 13.3.0, 6 cenários e 19 passos):
§§§
...................
6 scenarios (6 passed)
19 steps (19 passed)
§§§
Para mostrar o valor da suíte, alteramos de propósito a regra do código (de §>= 20000§ para §> 20000§ centavos). O exemplo-limite falhou imediatamente:
§§§
Failed scenarios:
  1) Limite do frete grátis    Então o frete é R$ 0,00
     AssertionError: 1500 !== 0
6 scenarios (5 passed, 1 failed)
§§§
Sem o exemplo de **R$ 200,00**, esse defeito de **limite** teria passado. A regra foi restaurada em seguida.

### Níveis de automação
Cenários podem rodar **na camada de domínio** (rápido, sem interface) ou **ponta a ponta** (via interface ou API, mais lento). A recomendação é automatizar o **mais perto possível da regra** e usar poucos cenários de ponta a ponta para fluxos críticos. Isso mantém a suíte rápida e estável (pirâmide de testes, tema do curso de testes).

### Documentação viva
Como os cenários são verificados continuamente, o conjunto serve de **documentação sempre atual** do comportamento: relatórios publicados no CI, organizados por funcionalidade e regra, são lidos por pessoas de negócio. Mantenha os cenários **curtos e organizados**; apague os obsoletos.

### Quando vale (e quando não)
**Vale** quando há **regras de negócio complexas**, vários participantes que precisam alinhar o entendimento e **risco** de mal-entendido. **Não vale** para código puramente técnico (algoritmos, utilitários), onde um teste unitário direto é mais claro, nem quando **ninguém do negócio participa**.

### Ligações com o restante do curso
Os **critérios de aceitação** da aula 2 viram cenários; as **regras** descobertas no Event Storming (aula 3) viram **Regras**; as **linguagens** do domínio (aulas 5 e 6) alimentam o vocabulário dos passos.`,
  concepts: [
    { term: 'BDD', def: 'Behaviour-Driven Development: prática colaborativa que usa exemplos de comportamento como especificação e teste.' },
    { term: 'Especificação por exemplos', def: 'Técnica que descreve requisitos por exemplos concretos, validados por negócio, desenvolvimento e teste.' },
    { term: 'Três amigos', def: 'Conversa entre negócio, desenvolvimento e teste para alinhar uma história antes de implementá-la.' },
    { term: 'Gherkin', def: 'Linguagem estruturada (Dado-Quando-Então) para descrever cenários legíveis por pessoas e executáveis por ferramentas.' },
    { term: 'Esquema do Cenário', def: 'Cenário parametrizado por uma tabela de exemplos.' },
    { term: 'Definição de passo', def: 'Função de código ligada a um passo do Gherkin por texto ou expressão regular.' },
    { term: 'Documentação viva', def: 'Especificação que é verificada automaticamente e, por isso, permanece atual.' },
    { term: 'Cenário declarativo', def: 'Cenário que descreve o comportamento de negócio, sem detalhes da interface.' },
    { term: 'Valor-limite', def: 'Valor na fronteira de uma regra, onde erros são mais prováveis.' }
  ],
  examples: R`**Analogia:** os exemplos são os **testes de direção de um manual**: em vez de "dirija com cuidado" (abstrato), o manual diz "a 60 km/h, a distância de frenagem em piso seco é de X metros; em piso molhado, Y". Qualquer um entende, e qualquer um pode verificar. O Gherkin é esse manual, e o cucumber é o instrutor que roda os testes sempre que o carro muda.

**Passo a passo, com o exemplo desta aula (frete):**
1. *Conversa:* o PO diz "frete grátis para compras grandes". O dev pergunta "o que é grande?" e o tester "e se for exatamente 200?". Descobrem a regra: **a partir de R$ 200,00**.
2. *Exemplos:* 199,99 → frete R$ 15,00; 200,00 → R$ 0,00; 350,00 → R$ 0,00.
3. *Automação:* os passos usam o código real: §new Carrinho().adicionar(nome, centavos, qtd)§ e comparam §carrinho.frete()§.
4. *Execução:* 6 cenários e 19 passos passam; ao quebrar o limite, o relatório mostra qual exemplo falhou.

**Cenários com cupom (executados):**
§§§
Regra: O cupom PRIMEIRA10 dá 10% de desconto no subtotal
  Cenário: Cupom aplicado antes do frete
    Dado um carrinho com 1 item "Tênis" de R$ 100,00
    Quando eu calculo o total com o cupom "PRIMEIRA10"
    Então o total é R$ 105,00        (100 - 10 + frete 15)
  Cenário: Cupom desconhecido é ignorado
    Dado um carrinho com 1 item "Tênis" de R$ 100,00
    Quando eu calculo o total com o cupom "NATAL50"
    Então o total é R$ 115,00        (100 + frete 15)
§§§

**Caso real:** uma equipe de pagamentos tinha 40 regras de arredondamento em uma planilha que ninguém atualizava. Ao transformá-las em um Esquema do Cenário com 40 linhas executadas no CI, descobriu duas inconsistências com a produção e passou a ter uma documentação que "grita" quando alguém muda uma regra (cenário ilustrativo).`,
  code: [
    { title: 'Feature em português com Regras e Esquema do Cenário (executado com cucumber-js 13.3.0)', lang: 'gherkin', code: R`# language: pt
Funcionalidade: Frete e desconto no carrinho
  Para incentivar compras maiores
  Como loja virtual
  Quero oferecer frete grátis e cupom de primeira compra

  Regra: Frete grátis para subtotal a partir de R$ 200,00

    Cenário: Compra abaixo do limite paga frete
      Dado um carrinho com 1 item "Caneca" de R$ 50,00
      Quando eu calculo o total
      Então o frete é R$ 15,00
      E o total é R$ 65,00

    Esquema do Cenário: Limite do frete grátis
      Dado um carrinho com 1 item "Mochila" de R$ <preco>
      Quando eu calculo o total
      Então o frete é R$ <frete>

      Exemplos:
        | preco  | frete |
        | 199,99 | 15,00 |
        | 200,00 | 0,00  |
        | 350,00 | 0,00  |

  Regra: O cupom PRIMEIRA10 dá 10% de desconto no subtotal

    Cenário: Cupom aplicado antes do frete
      Dado um carrinho com 1 item "Tênis" de R$ 100,00
      Quando eu calculo o total com o cupom "PRIMEIRA10"
      Então o total é R$ 105,00

    Cenário: Cupom desconhecido é ignorado
      Dado um carrinho com 1 item "Tênis" de R$ 100,00
      Quando eu calculo o total com o cupom "NATAL50"
      Então o total é R$ 115,00`, notes: [{ l: '1', t: 'A diretiva de idioma permite escrever as palavras-chave em português.' }, { l: '7', t: 'A Regra agrupa os cenários de uma regra de negócio.' }, { l: '15', t: 'O Esquema do Cenário executa o mesmo cenário para cada linha da tabela.' }, { l: '20', t: 'Valores-limite: logo abaixo, no limite e acima.' }] },
    { title: 'Definições de passos e o código do sistema (cucumber-js, executado)', lang: 'javascript', code: R`// src/carrinho.js
class Carrinho {
  #itens = [];
  adicionar(nome, precoCentavos, qtd = 1) {
    if (!Number.isInteger(precoCentavos) || precoCentavos <= 0) throw new RangeError('preço inválido');
    if (!Number.isInteger(qtd) || qtd < 1) throw new RangeError('quantidade inválida');
    this.#itens.push({ nome, precoCentavos, qtd });
    return this;
  }
  get subtotal() { return this.#itens.reduce((s, i) => s + i.precoCentavos * i.qtd, 0); }
  frete() { return this.subtotal >= 20000 ? 0 : 1500; }
  total(cupom) {
    const desconto = cupom === 'PRIMEIRA10' ? Math.floor(this.subtotal * 0.10) : 0;
    return this.subtotal - desconto + this.frete();
  }
}
module.exports = { Carrinho };

// features/steps/passos.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const { Carrinho } = require('../../src/carrinho.js');
const centavos = (txt) => Math.round(parseFloat(txt.replace('.', '').replace(',', '.')) * 100);

Given(/^um carrinho com (\d+) item "([^"]+)" de R\$ ([\d.,]+)$/, function (qtd, nome, preco) {
  this.carrinho = new Carrinho().adicionar(nome, centavos(preco), Number(qtd));
});
When('eu calculo o total', function () { this.total = this.carrinho.total(); });
When('eu calculo o total com o cupom {string}', function (cupom) { this.total = this.carrinho.total(cupom); });
Then(/^o frete é R\$ ([\d.,]+)$/, function (valor) { assert.equal(this.carrinho.frete(), centavos(valor)); });
Then(/^o total é R\$ ([\d.,]+)$/, function (valor) { assert.equal(this.total, centavos(valor)); });`, notes: [{ l: '11', t: 'A regra de negócio fica no código do sistema, em centavos inteiros.' }, { l: '22', t: 'Os passos se ligam ao Gherkin por expressão regular (para valores com vírgula) ou por texto com parâmetros.' }, { l: '26', t: 'this é o World do cucumber: guarda o estado entre os passos do cenário.' }, { l: '29', t: 'Saída observada: 6 scenarios (6 passed) e 19 steps (19 passed).' }] }
  ],
  bestPractices: ['Faça a conversa dos três amigos antes de escrever os cenários.', 'Escreva cenários declarativos, curtos e na linguagem do domínio.', 'Use exemplos com valores-limite e casos de exceção.', 'Automatize perto da regra de negócio e use poucos cenários de ponta a ponta.', 'Mantenha os cenários independentes e organizados por funcionalidade e regra.', 'Rode a suíte no CI e publique o relatório como documentação viva.'],
  mistakes: ['Cenários escritos como roteiros de cliques na interface.', 'Passos com detalhes técnicos que o negócio não entende.', 'Cenários dependentes entre si ou com dezenas de passos.', 'Fazer BDD sem a conversa e sem o negócio.', 'Usar Esquema do Cenário para comportamentos diferentes.', 'Deixar cenários obsoletos acumularem.'],
  market: `BDD e especificação por exemplos aparecem em equipes com regras de negócio complexas (finanças, seguros, e-commerce, saúde) e em práticas de qualidade modernas. Ferramentas como Cucumber, SpecFlow/Reqnroll, Behave e Karate são pedidas em vagas de QA, SDET e desenvolvimento, e a habilidade de conduzir a conversa dos três amigos é valorizada em POs e analistas.`,
  summary: `BDD une conversa, exemplos e automação: os três amigos descobrem regras e casos-limite, os exemplos viram cenários Gherkin (Funcionalidade, Regra, Cenário, Esquema do Cenário, Dado-Quando-Então) em linguagem de negócio e as definições de passos os ligam ao código. O resultado é uma documentação viva que falha quando o comportamento muda. Prefira cenários declarativos, curtos e independentes, automatizados próximos da regra.`,
  refs: [REF2.gherkin, REF2.bdd, REF2.betterGherkin, REF2.cucumberJs, REF2.specByExample],
  cards: [
    { q: 'Quem são os "três amigos"?', a: 'Negócio (PO), desenvolvimento e teste, que conversam sobre a história antes da implementação.' },
    { q: 'Qual a diferença entre cenário declarativo e imperativo?', a: 'O declarativo descreve o comportamento de negócio; o imperativo descreve cliques e campos da interface, sendo frágil e pouco legível.' },
    { q: 'Para que serve o Esquema do Cenário?', a: 'Para executar o mesmo cenário com vários exemplos de dados, como valores-limite.' },
    { q: 'O que é documentação viva?', a: 'Especificação executável que é verificada continuamente e, por isso, nunca fica desatualizada em silêncio.' }
  ]
},
{
  id: 'req-05', moduleId: 'm3', order: 5, minutes: 60, tags: ['DDD', 'linguagem ubíqua', 'bounded context', 'subdomínios', 'context map'],
  title: 'DDD estratégico: linguagem ubíqua, subdomínios e contextos delimitados',
  objectives: ['Explicar o objetivo do Domain-Driven Design e quando ele compensa', 'Construir e usar uma linguagem ubíqua com especialistas do domínio', 'Classificar subdomínios em núcleo (core), de apoio e genéricos e decidir onde investir', 'Definir contextos delimitados (bounded contexts) e identificar os limites onde o significado de um termo muda', 'Escolher relacionamentos de um mapa de contextos (parceria, cliente-fornecedor, conformista, camada anticorrupção, núcleo compartilhado, linguagem publicada)'],
  intro: `O **Domain-Driven Design (DDD)**, proposto por Eric Evans em 2003, é uma abordagem para construir software em domínios **complexos**, colocando no centro o **modelo do negócio** e a **colaboração** entre especialistas do domínio e desenvolvedores. Ele se divide em duas partes: o **estratégico** (como dividir o problema em partes e relacioná-las, o tema desta aula) e o **tático** (como modelar o código dentro de cada parte, tema da próxima). Para sistemas simples de CRUD, o DDD é exagero; para domínios ricos em regras (seguros, logística, finanças, saúde), ele organiza a complexidade em vez de escondê-la.`,
  theory: `### O problema que o DDD ataca
Em projetos grandes, a complexidade vem menos da tecnologia e mais de **regras de negócio entrelaçadas** e de **mal-entendidos de vocabulário**: o mesmo termo ("cliente", "produto", "pedido") significa coisas diferentes para áreas diferentes, e um **modelo único e universal** da empresa vira um monstro que ninguém consegue manter. O DDD propõe **vários modelos pequenos e coerentes**, cada um válido dentro de **fronteiras explícitas**.

### Linguagem ubíqua
Um **vocabulário compartilhado** entre pessoas de negócio e de tecnologia, usado nas conversas, nos documentos, **nos nomes do código** e nos testes. Regras:
- use os **termos do negócio**: "Segurado", "Apólice", "Sinistro", não "Usuario", "Registro", "Ocorrencia" genéricos;
- **um conceito, um nome** (e vice-versa); se dois nomes disputam o mesmo conceito, ou um nome serve a dois conceitos, **há um problema de modelagem**;
- o código reflete a linguagem: métodos como §apolice.renovar()§ e §sinistro.registrarAbertura()§, não §update()§ e §save()§;
- quando a linguagem muda (o negócio aprendeu), **o código e os documentos mudam** junto;
- um **glossário** vivo (por contexto) registra definições e exemplos.
A linguagem ubíqua é **por contexto delimitado**: não é um dicionário global.

### Contexto delimitado (bounded context)
É a **fronteira dentro da qual um modelo e sua linguagem são válidos e consistentes**. Exemplo: em uma loja virtual, **"Produto"** tem sentidos diferentes:
- no **Catálogo**: nome, descrição, fotos, categoria;
- em **Vendas**: preço, desconto e disponibilidade para o carrinho;
- em **Logística**: peso, dimensões e código de barras;
- em **Fiscal**: NCM, alíquotas.
Em vez de uma classe gigante "Produto" com 80 campos, **cada contexto tem o seu modelo de produto**, ligados por um **identificador comum** e por **eventos**. Sinais de que existe uma fronteira: **o significado de um termo muda**, **equipes diferentes** cuidam dela, **ritmos de mudança** são distintos, **regras e especialistas** são outros. O contexto também é uma **fronteira técnica e organizacional**: costuma corresponder a um módulo, serviço ou banco **próprio**, e a uma equipe.
**Espaço do problema x espaço da solução:** *subdomínios* pertencem ao **problema** (a divisão do negócio); *contextos delimitados* pertencem à **solução** (como dividimos os modelos e o software). O ideal é **um contexto por subdomínio**, mas na prática há assimetrias (sistemas legados).

### Subdomínios: onde investir
- **Núcleo (core)**: o que **diferencia o negócio** e dá vantagem competitiva (o algoritmo de roteirização de uma empresa de entregas). **Investir** em talento, design e DDD aprofundado; **desenvolver internamente**.
- **Apoio (supporting)**: necessário, mas não diferencia (cadastro de fornecedores). Soluções simples ou customizadas, pode ser terceirizado.
- **Genérico (generic)**: problema comum a todos (autenticação, e-mail, pagamentos, notas fiscais). **Compre ou use produto pronto**; evite reinventar.
Essa classificação orienta **orçamento, equipe e nível de rigor**: o DDD tático completo costuma valer no **núcleo**; no genérico, prefira soluções prontas.

### Mapa de contextos (context map)
Mostra **como os contextos se relacionam**, tanto técnica quanto politicamente. Padrões de relacionamento:
| Padrão | Ideia |
|---|---|
| **Parceria** (*partnership*) | duas equipes evoluem juntas e se coordenam; sucesso e fracasso são compartilhados |
| **Núcleo compartilhado** (*shared kernel*) | um pequeno subconjunto do modelo é compartilhado e alterado em acordo |
| **Cliente-fornecedor** (*customer-supplier*) | o contexto a montante (fornecedor) atende às necessidades do a jusante (cliente) |
| **Conformista** (*conformist*) | o a jusante adota o modelo do a montante, sem poder de negociação |
| **Camada anticorrupção** (*anticorruption layer*, ACL) | o a jusante traduz o modelo externo para o seu, protegendo-se de modelos legados ou ruins |
| **Serviço de acolhida** (*open host service*) | o a montante oferece uma API bem definida para vários clientes |
| **Linguagem publicada** (*published language*) | formato de troca documentado e estável (JSON schema, eventos) |
| **Caminhos separados** (*separate ways*) | os contextos não se integram; cada um resolve sozinho |
Em integrações com **sistemas legados ou de terceiros** (pagamentos, ERP), a **ACL** é a defesa mais comum: seu domínio fala a sua linguagem; um adaptador converte de e para a do outro.

### Como descobrir contextos
1. **Event Storming** (aula 3): onde a linguagem muda e onde os fluxos mudam de dono;
2. **Entrevistas** e glossários: termos com sentidos diferentes;
3. **Organização**: equipes, departamentos, sistemas existentes;
4. **Regras de consistência**: o que precisa mudar junto vs o que pode ser eventual;
5. **Iteração**: comece com uma visão grosseira e **refine** conforme aprende.

### Integração entre contextos
- **Eventos** (assíncronos): um contexto publica "Pedido confirmado"; outros reagem; **acoplamento baixo**, consistência eventual;
- **API síncrona** (REST/gRPC): para consultas e comandos que exigem resposta imediata; atenção a falhas em cascata;
- **Dados compartilhados** em um mesmo banco: **evite** (acopla modelos e equipes).
Cada contexto mantém **seus próprios dados**; o **identificador** (ID do cliente, do produto) é o elo.

### DDD não é microsserviços
Contextos delimitados **ajudam** a decidir fronteiras de serviços, mas podem viver em um **monólito modular**. Muitos times começam com um **monólito modular** bem dividido por contextos e só depois extraem serviços onde faz sentido (escala, equipes). Cortar em microsserviços antes de entender os contextos costuma gerar um "monólito distribuído".

### Quando usar DDD (e quando não)
**Use** quando o domínio é **complexo**, as regras mudam, o negócio e a tecnologia precisam conversar e o software é **estratégico**. **Evite** para CRUD simples, protótipos descartáveis e domínios sem especialistas acessíveis; o custo de modelagem não se paga.`,
  concepts: [
    { term: 'DDD', def: 'Domain-Driven Design: abordagem que modela software em torno do domínio do negócio e de sua linguagem.' },
    { term: 'Linguagem ubíqua', def: 'Vocabulário compartilhado por negócio e tecnologia, usado nas conversas e no código, dentro de um contexto.' },
    { term: 'Contexto delimitado', def: 'Fronteira em que um modelo e sua linguagem são consistentes e válidos.' },
    { term: 'Subdomínio núcleo', def: 'Parte do negócio que diferencia a empresa e merece maior investimento.' },
    { term: 'Subdomínio de apoio', def: 'Parte necessária ao negócio, mas que não é diferencial.' },
    { term: 'Subdomínio genérico', def: 'Problema comum a muitas empresas, melhor resolvido com soluções prontas.' },
    { term: 'Mapa de contextos', def: 'Diagrama que mostra os contextos e os padrões de relacionamento entre eles.' },
    { term: 'Camada anticorrupção', def: 'Adaptador que traduz o modelo de outro sistema para o do seu contexto, protegendo-o.' },
    { term: 'Núcleo compartilhado', def: 'Subconjunto do modelo compartilhado por dois contextos, alterado em acordo.' },
    { term: 'Monólito modular', def: 'Aplicação única dividida internamente em módulos alinhados aos contextos.' }
  ],
  examples: R`**Analogia:** os contextos delimitados são **países com idiomas e leis próprias**. A palavra "cliente" em um país é "comprador", em outro "paciente". Uma moeda comum (o identificador) e **tradutores** (adaptadores e eventos) permitem comércio entre eles, sem que todos tenham de falar uma língua única, que acabaria sem significado para ninguém.

**Subdomínios de uma loja virtual de bicicletas personalizadas:**
- **Núcleo:** configuração da bicicleta sob medida e promessa de entrega (o que diferencia a empresa);
- **Apoio:** gestão de estoque de componentes, atendimento pós-venda;
- **Genérico:** pagamentos (gateway), nota fiscal (emissor), e-mail transacional, autenticação (provedor de identidade).

**Mapa de contextos (texto):**
§§§
[Catálogo] --publica "ProdutoPublicado" (linguagem publicada)--> [Vendas]
[Vendas] --Cliente-Fornecedor--> [Logística]   (Logística pede dados de endereço e prazo)
[Vendas] --ACL--> [Gateway de Pagamento (genérico, externo)]
[Vendas] --eventos "PedidoConfirmado"--> [Faturamento]
[Faturamento] --Conformista--> [Sistema Fiscal legado]
§§§

**Termos que mudam de sentido:**
§§§
"Cliente" em Vendas   = pessoa com carrinho e preferências
"Cliente" em Faturamento = razão social com CNPJ e endereço fiscal
"Pedido" em Vendas    = intenção de compra com itens e frete
"Pedido" em Logística = ordem de separação e expedição
§§§

**Caso real:** uma seguradora tinha "Segurado" em um único modelo com 200 colunas, usado por Cadastro, Sinistros e Cobrança; cada mudança travava as três equipes. Ao separar em três contextos, cada um com seu "Segurado" e uma API/evento de integração, as equipes passaram a evoluir de forma independente. O núcleo (cálculo do prêmio) recebeu mais rigor; o cadastro de endereços usou uma solução pronta (cenário ilustrativo).`,
  code: [
    { title: 'Linguagem ubíqua e contextos: dois modelos do mesmo conceito, ligados por ID (padrão em JavaScript; não é um exemplo executável de um sistema real)', lang: 'javascript', code: R`// Contexto Vendas
class ClienteVendas {
  constructor(id, nome, preferencias) { this.id = id; this.nome = nome; this.preferencias = preferencias; }
  podeComprarAPrazo() { return this.preferencias.aceitaParcelamento; }
}

// Contexto Faturamento: o mesmo "cliente" tem outro modelo
class ClienteFiscal {
  constructor(id, razaoSocial, cnpj, enderecoFiscal) { this.id = id; this.razaoSocial = razaoSocial; this.cnpj = cnpj; this.enderecoFiscal = enderecoFiscal; }
  podeEmitirNota() { return /^\d{14}$/.test(this.cnpj); }
}

// Camada anticorrupção: traduz o modelo externo (gateway de pagamento) para o de Vendas
function traduzirPagamento(respostaGateway) {
  const mapaStatus = { approved: 'APROVADO', declined: 'RECUSADO', pending: 'PENDENTE' };
  return { pedidoId: respostaGateway.order_ref, status: mapaStatus[respostaGateway.status] ?? 'DESCONHECIDO', valorCentavos: Math.round(respostaGateway.amount * 100) };
}
console.log(traduzirPagamento({ order_ref: 'P1', status: 'approved', amount: 25.5 }));`, notes: [{ l: '2', t: 'Cada contexto tem seu próprio modelo; só o id (e eventos) os liga.' }, { l: '16', t: 'A ACL isola o seu domínio do vocabulário e do formato do fornecedor.' }, { l: '19', t: 'Saída esperada: { pedidoId: \'P1\', status: \'APROVADO\', valorCentavos: 2550 } (a função foi executada no relatório da aula).' }] }
  ],
  bestPractices: ['Construa a linguagem ubíqua com especialistas e use-a no código, nos testes e nos documentos.', 'Delimite contextos onde o significado dos termos muda ou onde há equipes e ritmos diferentes.', 'Invista mais modelagem no subdomínio núcleo e use soluções prontas nos genéricos.', 'Registre o mapa de contextos e o padrão de relacionamento de cada integração.', 'Proteja seu modelo de sistemas externos e legados com camadas anticorrupção.', 'Comece por um monólito modular e extraia serviços quando houver motivo.'],
  mistakes: ['Um modelo único e universal para toda a empresa.', 'Usar nomes técnicos genéricos no lugar do vocabulário do negócio.', 'Desenvolver internamente os subdomínios genéricos.', 'Compartilhar o mesmo banco entre contextos.', 'Criar microsserviços antes de entender os contextos (monólito distribuído).', 'Aplicar DDD completo em um CRUD simples.'],
  market: `DDD é referência em arquitetura para sistemas corporativos, microsserviços e modernização de legados; vagas de arquitetura e de engenharia sênior frequentemente pedem experiência com contextos delimitados e mapas de contexto. Saber classificar subdomínios também ajuda em decisões de construir x comprar e de organização de equipes.`,
  summary: `DDD estratégico divide o problema em subdomínios (núcleo, apoio, genérico) e organiza a solução em contextos delimitados, cada um com seu modelo e sua linguagem ubíqua. Contextos se relacionam por padrões do mapa de contextos (parceria, cliente-fornecedor, conformista, ACL, núcleo compartilhado, linguagem publicada). Integre por eventos e APIs, não por banco compartilhado; comece com um monólito modular e invista mais no núcleo.`,
  refs: [REF2.dddRef, REF2.boundedContext, REF2.ubiquitous, REF2.dddBook],
  cards: [
    { q: 'O que é um contexto delimitado?', a: 'A fronteira dentro da qual um modelo e sua linguagem são consistentes; fora dela os termos podem ter outro sentido.' },
    { q: 'Como tratar um subdomínio genérico, como pagamentos?', a: 'Comprar ou usar uma solução pronta, e proteger o seu modelo com uma camada anticorrupção.' },
    { q: 'O que faz uma camada anticorrupção?', a: 'Traduz o modelo de outro sistema para o do seu contexto, impedindo que ele contamine o seu domínio.' },
    { q: 'DDD exige microsserviços?', a: 'Não: os contextos podem viver em um monólito modular; os microsserviços são uma decisão separada.' }
  ]
},
{
  id: 'req-06', moduleId: 'm3', order: 6, minutes: 65, tags: ['DDD tático', 'entidade', 'objeto de valor', 'agregado', 'eventos de domínio', 'repositório'],
  title: 'DDD tático: entidades, objetos de valor, agregados e eventos de domínio',
  objectives: ['Distinguir entidades, objetos de valor, agregados, serviços de domínio, repositórios e eventos de domínio', 'Modelar um agregado com raiz, invariantes e fronteira de consistência', 'Aplicar regras práticas de projeto de agregados (pequenos, referência por id, uma transação por agregado)', 'Emitir e consumir eventos de domínio e entender a consistência eventual entre agregados', 'Reconhecer o modelo de domínio anêmico e como evitá-lo'],
  intro: `O DDD tático traz os **blocos de construção** para modelar o **interior** de um contexto delimitado: **entidades**, **objetos de valor**, **agregados**, **serviços de domínio**, **repositórios**, **fábricas** e **eventos de domínio**. O objetivo é que as **regras do negócio** vivam **no modelo** (nas classes do domínio), e não espalhadas em serviços e telas, e que as **invariantes** sejam impossíveis de violar. Esta aula usa um agregado **Pedido** em JavaScript, **executado em Node.js 26**, para mostrar cada conceito na prática, ligando-se ao que você viu de orientação a objetos no curso de Paradigmas.`,
  theory: `### Entidade
Objeto definido pela **identidade**, que persiste enquanto seu estado muda: um **Pedido** (id §P1§) continua sendo o mesmo pedido mesmo que mude de itens ou status. Igualdade por **id**. Tem **ciclo de vida** e comportamento.

### Objeto de valor (value object)
Objeto definido pelos **seus valores**, **imutável** e **sem identidade**: **Dinheiro**, **Endereço**, **Período**, **CPF**. Duas instâncias com os mesmos valores são **intercambiáveis**; a igualdade é **por valor**; para "alterar", cria-se um **novo**. Benefícios: validação **na construção** (um CPF inválido nem existe), **expressividade** (§dinheiro.somar(outro)§ em vez de duas variáveis soltas) e **segurança** (sem efeitos colaterais). No exemplo, §Dinheiro§ guarda centavos inteiros, rejeita valores inválidos e é congelado: §Dinheiro.de(1).igual(new Dinheiro(100))§ deu §true§.
Muitas coisas que parecem entidades são **objetos de valor** (e devem ser): prefira-os sempre que **a identidade não importar**. Evite a "obsessão por primitivos" (usar §string§ para CPF, §number§ para dinheiro).

### Agregado
Um **agregado** é um **grupo de objetos tratado como uma unidade de consistência**, com uma **raiz de agregado** (uma entidade) pela qual **todo acesso externo** passa. A raiz **garante as invariantes** do conjunto. O **Pedido** (raiz) controla seus **itens**: não se altera um item direto; pede-se ao pedido (§pedido.adicionar(...)§).
Regras práticas (Vernon/Evans):
1. **Modele pelas invariantes verdadeiras**: o que **precisa** ser consistente *dentro de uma única transação* fica no mesmo agregado;
2. **Agregados pequenos**: quanto maior, mais conflitos de concorrência e mais carga; prefira raízes com poucos objetos internos;
3. **Referencie outros agregados por identidade** (§clienteId§), **não** por referência de objeto;
4. **Uma transação modifica um agregado**; para atualizar vários, use **eventos** e **consistência eventual**;
5. **Acesso externo só pela raiz**; objetos internos não vazam (devolva cópias ou valores imutáveis, não a lista interna).
No exemplo (Node.js 26), o §Pedido§ aceita no máximo 3 itens distintos, só adiciona enquanto está §ABERTO§, e não confirma sem itens. Resultados observados: o total de duas canetas e um caderno somou §R$ 25,50§ (o mesmo produto acumulou quantidade: "caneta x3, caderno x1"); depois de confirmado, adicionar um item lançou "pedido não está aberto"; confirmar um pedido vazio, "pedido vazio"; passar do limite, "limite de itens do pedido". Alterar a cópia da lista de itens **não** afetou o pedido (tamanho 2).

### Eventos de domínio
Um **evento de domínio** registra **algo que aconteceu** e importa ao negócio: §PedidoConfirmado§. É **imutável**, no **passado**, e carrega os dados necessários. O agregado **emite** o evento ao mudar de estado; **outras partes reagem** (enviar e-mail, reservar estoque, atualizar relatórios) sem que o Pedido as conheça. No exemplo, ao confirmar, o pedido registrou §{"tipo":"PedidoConfirmado","pedidoId":"P1","total":2550}§ e, depois que os eventos pendentes foram lidos, a lista ficou vazia (§0§).
Cuidados: entregar eventos de forma **confiável** (padrão **outbox**: gravar o evento na mesma transação do agregado e publicar depois); consumidores **idempotentes**; **versionar** o formato do evento.

### Repositório
Abstração que **guarda e recupera agregados**, como uma coleção em memória: §repo.obter(id)§, §repo.salvar(pedido)§. O domínio **não conhece** o banco; a implementação (SQL, documento) fica na infraestrutura. **Um repositório por agregado** (raiz). No exemplo, §repo.obter('X')§ lançou "pedido não encontrado: X".

### Serviço de domínio e serviço de aplicação
- **Serviço de domínio**: regra do negócio que **não pertence a nenhuma entidade ou valor** (por exemplo, calcular frete entre vários agregados, transferir valor entre duas contas). **Sem estado**, na linguagem do domínio.
- **Serviço de aplicação** (caso de uso): orquestra: carrega o agregado pelo repositório, chama o comportamento, salva, publica eventos, controla a transação. **Sem regras de negócio**.
- **Fábrica**: cria objetos complexos já válidos.

### Camadas (arquitetura hexagonal/limpa em uma frase)
**Interface/entrada → Aplicação (casos de uso) → Domínio (modelo) ← Infraestrutura (repositórios, mensageria)**: o domínio **não depende** de frameworks nem de banco; a infraestrutura depende dele (inversão de dependência), o que permite testar as regras **sem** banco ou HTTP.

### O modelo anêmico (anti-padrão)
Classes que são **só dados** com getters e setters, enquanto a **lógica** vive em "serviços" que as manipulam. Resultado: invariantes espalhadas, fáceis de violar, duplicação e dependência do conhecimento de quem chama. **Antídoto:** comportamento **dentro** do modelo (§pedido.confirmar()§), setters ausentes, construtores que validam, tipos ricos (objetos de valor).

### Quando usar o tático
Domínios com **regras ricas** e **invariantes** importantes (núcleo). Em contextos de **apoio ou genéricos** simples, um modelo de dados com um CRUD ou um *transaction script* costuma bastar. Misturar abordagens por contexto é normal.

### Testando o domínio
Como o modelo não depende de infraestrutura, os testes são **rápidos e diretos**: crie o agregado, execute comportamentos, verifique estado, exceções e eventos. Os cenários BDD (aula 4) podem rodar nessa camada.`,
  concepts: [
    { term: 'Entidade', def: 'Objeto definido por identidade contínua, que muda de estado ao longo do tempo.' },
    { term: 'Objeto de valor', def: 'Objeto imutável e sem identidade, definido por seus valores.' },
    { term: 'Agregado', def: 'Grupo de objetos tratado como unidade de consistência, acessado pela raiz.' },
    { term: 'Raiz do agregado', def: 'Entidade pela qual todo acesso externo ao agregado passa e que garante as invariantes.' },
    { term: 'Invariante', def: 'Regra que deve valer sempre para um estado válido do agregado.' },
    { term: 'Evento de domínio', def: 'Registro imutável de algo relevante que aconteceu no domínio.' },
    { term: 'Repositório', def: 'Abstração de coleção para guardar e recuperar agregados.' },
    { term: 'Serviço de domínio', def: 'Operação do domínio que não pertence naturalmente a uma entidade ou objeto de valor.' },
    { term: 'Modelo anêmico', def: 'Modelo com classes só de dados e lógica espalhada em serviços.' },
    { term: 'Outbox', def: 'Padrão que grava o evento na mesma transação do agregado e o publica depois, garantindo entrega.' },
    { term: 'Consistência eventual', def: 'Estado em que diferentes agregados ou contextos convergem para a consistência depois de algum tempo.' }
  ],
  examples: R`**Analogia:** o agregado é um **cofre com guichê**: a gerência (raiz) é a única que abre; ela garante a regra "o saldo nunca fica negativo" para tudo que está lá dentro e **avisa o resto do banco** por um comunicado (evento) quando algo importante acontece. Quem quer mexer em duas contas diferentes **não abre os dois cofres ao mesmo tempo**: pede a cada gerência uma operação e coordena por comunicados.

**Resultado da execução (Node.js 26) do agregado Pedido:**
§§§
R$ 25,50 caneta x3, caderno x1
CONFIRMADO [{"tipo":"PedidoConfirmado","pedidoId":"P1","total":2550}] 0
pedido não está aberto | pedido vazio | limite de itens do pedido
2
true true pedido não encontrado: X
§§§

**Mapeamento dos conceitos:**
- **Entidade/raiz:** §Pedido§ (id §P1§);
- **Objetos de valor:** §Dinheiro§, §ItemPedido§ (imutáveis e congelados);
- **Invariantes:** limite de itens, só adiciona se §ABERTO§, não confirma vazio;
- **Evento:** §PedidoConfirmado§ com o total em centavos;
- **Repositório:** §RepositorioPedidos§ em memória (§salvar§ e §obter§).

**Caso real:** uma empresa de logística tinha "Entrega" com 40 campos editados por vários serviços e estados inválidos frequentes (entrega "concluída" sem comprovante). Ao modelar §Entrega§ como agregado com comportamentos (§iniciarRota§, §registrarTentativa§, §concluir(comprovante)§), as transições inválidas passaram a ser impossíveis, e eventos como "EntregaConcluída" acionaram faturamento e notificações (cenário ilustrativo).`,
  code: [
    { title: 'Agregado Pedido com objetos de valor, invariantes, eventos e repositório (executado em Node.js 26)', lang: 'javascript', code: R`class Dinheiro {
  #c;
  constructor(centavos) {
    if (!Number.isInteger(centavos) || centavos < 0) throw new RangeError('valor inválido');
    this.#c = centavos; Object.freeze(this);
  }
  static de(reais) { return new Dinheiro(Math.round(reais * 100)); }
  somar(o) { return new Dinheiro(this.#c + o.#c); }
  vezes(n) { return new Dinheiro(this.#c * n); }
  igual(o) { return o instanceof Dinheiro && o.#c === this.#c; }
  get centavos() { return this.#c; }
  toString() { return 'R$ ' + (this.#c / 100).toFixed(2).replace('.', ','); }
}
class ItemPedido {
  constructor(produtoId, preco, qtd) {
    if (!Number.isInteger(qtd) || qtd < 1) throw new RangeError('quantidade inválida');
    this.produtoId = produtoId; this.preco = preco; this.qtd = qtd; Object.freeze(this);
  }
  get total() { return this.preco.vezes(this.qtd); }
}
class Pedido {                                          // raiz do agregado
  static LIMITE_ITENS = 3;
  #id; #itens = []; #status = 'ABERTO'; #eventos = [];
  constructor(id) { this.#id = id; }
  get id() { return this.#id; }
  get status() { return this.#status; }
  get itens() { return [...this.#itens]; }              // cópia: o estado interno não vaza
  get total() { return this.#itens.reduce((s, i) => s.somar(i.total), new Dinheiro(0)); }
  adicionar(produtoId, preco, qtd) {
    if (this.#status !== 'ABERTO') throw new Error('pedido não está aberto');
    const ja = this.#itens.find((i) => i.produtoId === produtoId);
    if (ja) this.#itens[this.#itens.indexOf(ja)] = new ItemPedido(produtoId, ja.preco, ja.qtd + qtd);
    else {
      if (this.#itens.length >= Pedido.LIMITE_ITENS) throw new Error('limite de itens do pedido');
      this.#itens.push(new ItemPedido(produtoId, preco, qtd));
    }
    return this;
  }
  confirmar() {
    if (this.#status !== 'ABERTO') throw new Error('pedido não está aberto');
    if (this.#itens.length === 0) throw new Error('pedido vazio');
    this.#status = 'CONFIRMADO';
    this.#eventos.push({ tipo: 'PedidoConfirmado', pedidoId: this.#id, total: this.total.centavos });
    return this;
  }
  eventosPendentes() { const e = this.#eventos; this.#eventos = []; return e; }
}
class RepositorioPedidos {
  #m = new Map();
  salvar(p) { this.#m.set(p.id, p); }
  obter(id) { const p = this.#m.get(id); if (!p) throw new Error('pedido não encontrado: ' + id); return p; }
}

const repo = new RepositorioPedidos();
const p = new Pedido('P1').adicionar('caneta', Dinheiro.de(3.5), 2).adicionar('caderno', Dinheiro.de(15), 1).adicionar('caneta', Dinheiro.de(3.5), 1);
repo.salvar(p);
console.log(String(p.total), p.itens.map((i) => i.produtoId + ' x' + i.qtd).join(', '));   // R$ 25,50 caneta x3, caderno x1
p.confirmar();
console.log(p.status, JSON.stringify(p.eventosPendentes()), p.eventosPendentes().length);  // CONFIRMADO [...] 0`, notes: [{ l: '14', t: 'O objeto de valor valida na construção e é imutável (congelado).' }, { l: '23', t: 'A raiz expõe uma cópia dos itens: ninguém altera a lista interna.' }, { l: '30', t: 'A invariante do limite de itens é garantida na raiz.' }, { l: '45', t: 'O evento é registrado no agregado e entregue depois (outbox na prática).' }, { l: '60', t: 'Saída observada: R$ 25,50 e "caneta x3, caderno x1".' }] },
    { title: 'Serviço de aplicação (caso de uso) que orquestra, sem regras de negócio (padrão ilustrativo)', lang: 'javascript', code: R`class ConfirmarPedido {
  constructor({ repositorio, publicador }) { this.repositorio = repositorio; this.publicador = publicador; }
  executar({ pedidoId }) {
    const pedido = this.repositorio.obter(pedidoId);   // 1. carregar o agregado
    pedido.confirmar();                                 // 2. regra no domínio
    this.repositorio.salvar(pedido);                    // 3. persistir (mesma transação)
    for (const e of pedido.eventosPendentes()) this.publicador.publicar(e);  // 4. publicar eventos
    return { status: pedido.status };
  }
}`, notes: [{ l: '4', t: 'O serviço de aplicação só coordena.' }, { l: '5', t: 'A regra (pedido não vazio, só aberto) está no agregado.' }, { l: '7', t: 'Na prática, use outbox para não perder eventos se a publicação falhar. O exemplo é ilustrativo e não foi executado separadamente.' }] }
  ],
  bestPractices: ['Prefira objetos de valor imutáveis a tipos primitivos para conceitos do domínio.', 'Modele agregados pequenos, pelas invariantes que realmente precisam ser consistentes.', 'Referencie outros agregados por identidade e modifique um agregado por transação.', 'Coloque o comportamento no modelo e use eventos para reagir entre agregados e contextos.', 'Garanta a entrega de eventos (outbox) e consumidores idempotentes.', 'Teste o domínio sem banco, HTTP ou framework.'],
  mistakes: ['Modelo anêmico: dados nas classes e regras espalhadas em serviços.', 'Agregados gigantes que bloqueiam e geram conflitos.', 'Referências diretas entre agregados e transações atravessando vários deles.', 'Expor listas internas mutáveis e permitir alterar itens sem a raiz.', 'Colocar regras de negócio em controladores e serviços de aplicação.', 'Aplicar DDD tático em todo contexto, inclusive nos simples.'],
  market: `Modelagem de domínio é diferencial em vagas de backend sênior, arquitetura e engenharia de software em empresas com regras complexas (finanças, seguros, logística). Frameworks e linguagens (Java/Kotlin, C#, TypeScript) têm comunidades fortes em DDD, e livros de Evans e Vernon são referência. Eventos de domínio e outbox também são pilares de arquiteturas orientadas a eventos.`,
  summary: `Entidades têm identidade; objetos de valor são imutáveis e definidos por valores. Agregados agrupam objetos com uma raiz que garante invariantes e atua como fronteira de consistência: pequenos, referenciados por id, uma transação por agregado. Eventos de domínio comunicam fatos e permitem consistência eventual. Repositórios guardam agregados; serviços de aplicação orquestram; regras ficam no modelo, evitando o modelo anêmico.`,
  refs: [REF2.aggregate, REF2.valueObject, REF2.domainEvent, REF2.anemic, REF2.dddRef, REF2.vernonBook],
  cards: [
    { q: 'Qual a diferença entre entidade e objeto de valor?', a: 'A entidade tem identidade contínua; o objeto de valor é imutável e comparado pelos valores, sem identidade.' },
    { q: 'O que é a raiz do agregado?', a: 'A entidade pela qual todo acesso externo passa e que garante as invariantes do agregado.' },
    { q: 'Como atualizar dois agregados em um fluxo?', a: 'Uma transação por agregado, coordenando por eventos de domínio e consistência eventual.' },
    { q: 'O que é o modelo de domínio anêmico?', a: 'Classes só com dados e a lógica espalhada em serviços, o que dispersa as invariantes.' }
  ]
},
{
  id: 'req-07', moduleId: 'm3', order: 7, minutes: 60, tags: ['levantamento de requisitos', 'entrevistas', 'priorização', 'MoSCoW', 'stakeholders'],
  title: 'Levantamento de requisitos: técnicas, stakeholders, priorização e validação',
  objectives: ['Identificar e analisar as partes interessadas (stakeholders) e seus interesses', 'Escolher técnicas de elicitação adequadas (entrevistas, observação, workshops, questionários, protótipos, análise de documentos)', 'Conduzir uma entrevista com perguntas abertas, evitando vieses', 'Priorizar com MoSCoW, valor x esforço e modelo de Kano, e justificar as escolhas', 'Validar, rastrear e gerenciar mudanças de requisitos, e reconhecer ambiguidades e conflitos'],
  intro: `**Levantar requisitos** (elicitação) é descobrir **o que as pessoas precisam de verdade**, que quase nunca é o que elas **dizem** na primeira conversa. Usuários descrevem soluções ("quero um botão aqui"), esquecem o que fazem no automático e escondem exceções ("ah, só no fim do mês..."). O trabalho é **investigar, escutar, observar e confirmar**. Este é o tópico "Levantamento de requisitos" da disciplina de Agilidade, tratado aqui porque se apoia no que você viu nas aulas anteriores: requisitos verificáveis, histórias, Event Storming e BDD. A aula fecha o curso com o processo de ponta a ponta.`,
  theory: `### Stakeholders (partes interessadas)
Quem **afeta** ou é **afetado** pelo sistema: usuários finais, gestores, patrocinadores, operação, suporte, jurídico, segurança, parceiros, reguladores, equipes que integram, quem paga e quem sofre se der errado. Identifique-os com perguntas como "quem usa? quem decide? quem paga? quem opera? quem é afetado sem usar?". Classifique por **poder** (decide ou veta) e **interesse** (quanto afeta):
| | Alto interesse | Baixo interesse |
|---|---|---|
| **Alto poder** | gerenciar de perto (patrocinador, diretor da área) | manter satisfeitos e informados (jurídico, segurança) |
| **Baixo poder** | manter informados e ouvir (usuários, suporte) | monitorar |
**Armadilhas:** ouvir só quem **pede** (e esquecer quem opera), ou só quem **paga** (e esquecer quem usa); confundir o **cliente** (quem paga) com o **usuário** (quem usa).

### Necessidade x solução
Um pedido comum é uma **solução disfarçada**: "preciso de um relatório em Excel". Investigue o **objetivo**: "para quê? o que você faz com ele? o que acontece sem ele?" (a técnica dos **cinco porquês**). Talvez a necessidade seja "saber, toda segunda, quais pedidos estão atrasados" e a melhor solução nem seja um relatório (uma notificação). Registre **o problema** antes da solução.

### Técnicas de elicitação
| Técnica | Quando usar | Cuidados |
|---|---|---|
| **Entrevista** | entender contexto, motivação e exceções com poucas pessoas | perguntas abertas; evitar induzir; registrar |
| **Observação (shadowing)** | processos que as pessoas fazem "no automático" | combinar com a pessoa; observar o real, não o ideal |
| **Workshop** (incluindo Event Storming) | muitas pessoas, conflitos de entendimento | facilitação; todos participam |
| **Questionário/pesquisa** | muitos usuários, dados quantitativos | perguntas claras; amostra representativa |
| **Análise de documentos e dados** | sistemas legados, regulamentos, logs, suporte | os documentos podem estar desatualizados |
| **Prototipagem** | validar interface e fluxo cedo | protótipo barato (papel, Figma); testar com usuários |
| **Casos de uso e histórias** | formalizar o entendimento | conversa antes do texto |
| **Benchmark/concorrência** | ideias e expectativas do mercado | adaptar ao contexto |
| **Análise de incidentes/chamados** | descobrir dores reais | amostrar e agrupar por causa |
Use **várias técnicas combinadas**: nenhuma sozinha cobre tudo.

### Conduzindo uma entrevista
1. **Prepare**: objetivo, perguntas, contexto lido; combine tempo e consentimento para anotar ou gravar;
2. **Comece aberto**: "Conte como é um dia típico", "Me mostre o último pedido que você tratou" (peça **exemplos reais**);
3. **Aprofunde**: "E depois?", "O que dá errado?", "Como você resolve hoje?", "Por quê?", "Quanto tempo leva?";
4. **Evite perguntas indutoras** ("você gostaria de um painel, não é?") e **fechadas demais**;
5. **Escute mais do que fale**; **repita o que entendeu** para confirmar;
6. **Registre fatos e citações**, separando o que foi dito, o que foi observado e o que é sua interpretação;
7. **Encerre** com "quem mais devo ouvir? o que não perguntei?" e **envie um resumo** para validação.

### Requisitos implícitos e conflitos
As pessoas esquecem o óbvio (requisitos implícitos): "claro que o sistema tem de funcionar com o leitor de código de barras que usamos". Pergunte por **ambiente, hardware, volume, horários de pico, integrações, regras legais, exceções, o que acontece quando dá errado** e **o que é inaceitável**. Quando **dois stakeholders discordam**, **não escolha em silêncio**: leve o conflito à pessoa com poder de decidir, com **opções, custos e riscos**, e **registre a decisão** (ADR).

### Priorização
Nem tudo cabe no prazo e no orçamento; priorizar é **escolher conscientemente**.
- **MoSCoW**: **Must have** (essencial; sem isso, o lançamento não faz sentido), **Should have** (importante, mas há alternativa temporária), **Could have** (desejável se houver tempo), **Won't have (this time)** (combinado para depois). Regra prática: limite os *Must* a uma parte do esforço para deixar folga.
- **Valor x esforço**: quadrante com ganhos rápidos (alto valor, baixo esforço), projetos grandes, tarefas de enchimento e "armadilhas" (baixo valor, alto esforço).
- **Modelo de Kano**: classifica recursos em **básicos** (esperados; se faltam, irritam), **de desempenho** (quanto mais, melhor) e **encantadores** (inesperados que surpreendem); o que encanta hoje vira básico amanhã.
- **Custo do atraso** (*cost of delay*), **risco** e **dependências**: o que desbloqueia outros itens ou tem prazo legal sobe na lista.
- **Critérios explícitos e dados** (pesquisas, métricas, suporte) reduzem a "briga de opinião". **Quem decide** deve ser claro (o PO).

### Validar, rastrear e gerenciar mudança
- **Revisões** (leitura conjunta), **protótipos** e **demonstrações frequentes** validam entendimento cedo;
- **Critérios de aceitação** e **cenários** (aulas 2 e 4) dão o teste de verdade;
- **Rastreabilidade**: ligue requisito → história → código → teste, e registre a origem;
- **Mudanças**: toda mudança tem custo; registre **motivo, impacto (prazo, custo, risco) e decisão**; comunique;
- **Backlog vivo**: em times ágeis, o refinamento contínuo (inclusive a elicitação) substitui o "levantamento no início".

### Ligando ao curso
O **Event Storming** descobre fluxos e conflitos; as **histórias** e **critérios** organizam o que construir; o **BDD** vira testes; o **DDD** dá a linguagem e a estrutura. Na prática, as técnicas se misturam: um workshop gera eventos e políticas; as entrevistas aprofundam exceções; os exemplos alimentam os cenários.

### Ética e cuidados
Respeite **privacidade** (dados de usuários e funcionários), **consentimento** para gravar, **acessibilidade** (inclua pessoas com deficiência), **viés** (não ouvir só quem fala mais alto) e **conflito de interesse**. Documente suposições e **o que não foi coberto**.`,
  concepts: [
    { term: 'Elicitação de requisitos', def: 'Atividade de descobrir, junto às partes interessadas, as necessidades que o sistema deve atender.' },
    { term: 'Stakeholder', def: 'Pessoa ou grupo que afeta ou é afetado pelo sistema.' },
    { term: 'Cinco porquês', def: 'Técnica de perguntar "por quê?" repetidamente para chegar à necessidade real.' },
    { term: 'Observação (shadowing)', def: 'Acompanhar as pessoas fazendo seu trabalho para descobrir o que não é dito.' },
    { term: 'Protótipo', def: 'Versão barata e descartável da interface ou do fluxo para validar entendimento.' },
    { term: 'MoSCoW', def: 'Priorização em Must, Should, Could e Won\'t have (nesta entrega).' },
    { term: 'Modelo de Kano', def: 'Classificação de recursos em básicos, de desempenho e encantadores.' },
    { term: 'Requisito implícito', def: 'Expectativa não declarada que será cobrada como se fosse um requisito.' },
    { term: 'Custo do atraso', def: 'Valor perdido por unidade de tempo em que um item não é entregue.' },
    { term: 'Gestão de mudanças', def: 'Processo de registrar, avaliar e decidir alterações de requisitos com seu impacto.' }
  ],
  examples: R`**Analogia:** o levantamento é o trabalho de um **detetive e um médico**: o paciente diz "estou com dor de cabeça" (o pedido) e o médico investiga **desde quando, em que situação, o que melhora, o que mais acontece** (a necessidade real), observa, pede exames (dados) e **confirma a hipótese** antes de tratar. Receitar o remédio pedido sem investigar é perigoso.

**Do pedido à necessidade (cinco porquês):**
§§§
Pedido: "Preciso de um relatório em Excel com todos os pedidos."
Por quê? Para ver quais estão atrasados.
Por quê? Para avisar os clientes antes que reclamem.
Por quê? Atrasos geram chamados e cancelamentos.
Necessidade: reduzir cancelamentos por atraso, avisando o cliente proativamente.
Solução melhor: alerta automático na lista de pedidos e e-mail de aviso ao cliente (a decidir com dados).
§§§

**Trecho de entrevista (perguntas boas):**
§§§
- "Me mostre o último pedido que você tratou, do começo ao fim."
- "O que acontece quando o estoque não confere?"
- "Quando isso dá errado, quem você aciona? Quanto tempo leva?"
- "O que você faz hoje que não deveria precisar fazer?"
- "O que seria inaceitável o sistema novo fazer?"
§§§

**Priorização MoSCoW (lançamento de um app de pedidos):**
- *Must:* cadastro, cardápio, carrinho, pagamento, status do pedido;
- *Should:* cupom de desconto, histórico de pedidos;
- *Could:* avaliação do pedido, listas de favoritos;
- *Won't (por enquanto):* programa de fidelidade, pedidos agendados.

**Caso real:** uma equipe construiu, em 4 meses, um portal de relatórios pedido por um diretor. Ninguém observou o time de operações, que usava planilhas por causa de um sistema legado lento; o portal não foi adotado. Em uma segunda tentativa, 3 dias de observação e entrevistas mostraram que a necessidade era **consulta rápida de status por telefone**, resolvida por uma tela simples de busca (cenário ilustrativo, sem medições reais).`,
  code: [
    { title: 'Priorização ponderada e verificação de MoSCoW (padrão em JavaScript; a lógica é treinada no exercício da aula)', lang: 'javascript', code: R`const itens = [
  { id: 'R1', nome: 'Pagamento com Pix', valor: 9, esforco: 5, risco: 2, prazoLegal: false },
  { id: 'R2', nome: 'Cupom de desconto', valor: 6, esforco: 3, risco: 1, prazoLegal: false },
  { id: 'R3', nome: 'Exclusão de dados (LGPD)', valor: 5, esforco: 4, risco: 3, prazoLegal: true },
  { id: 'R4', nome: 'Tema escuro', valor: 2, esforco: 2, risco: 1, prazoLegal: false }
];
// Pontuação: valor / esforço, com bônus para prazo legal e penalização por risco
const pontos = (i) => +((i.valor / i.esforco) * (i.prazoLegal ? 2 : 1) - i.risco * 0.1).toFixed(2);
const ordenados = itens.map((i) => ({ id: i.id, nome: i.nome, pontos: pontos(i) })).sort((a, b) => b.pontos - a.pontos);
console.log(ordenados);

// Regra: o Must não pode passar de 60% do esforço total
function checarMoscow(itensComClasse, limite = 0.6) {
  const total = itensComClasse.reduce((s, i) => s + i.esforco, 0);
  const must = itensComClasse.filter((i) => i.classe === 'M').reduce((s, i) => s + i.esforco, 0);
  return { proporcaoMust: +(must / total).toFixed(2), ok: must / total <= limite };
}
console.log(checarMoscow([{ esforco: 5, classe: 'M' }, { esforco: 4, classe: 'M' }, { esforco: 3, classe: 'S' }, { esforco: 2, classe: 'C' }]));`, notes: [{ l: '8', t: 'Uma fórmula simples e transparente: valor por esforço, bônus para prazo legal e leve penalização do risco. Ajuste os pesos com o time.' }, { l: '14', t: 'O Must deve deixar folga para imprevistos: aqui 9 de 14 de esforço, cerca de 0,64.' }, { l: '19', t: 'Saída esperada: proporcaoMust 0,64 e ok falso (acima de 60 %).' }] }
  ],
  bestPractices: ['Mapeie as partes interessadas, inclusive quem opera e quem sofre o impacto.', 'Pergunte pelo problema e pelo objetivo antes da solução (cinco porquês).', 'Combine técnicas: entrevista, observação, workshop, dados e protótipo.', 'Peça exemplos reais e registre fatos, citações e interpretações separadamente.', 'Priorize com critérios explícitos, dados e um decisor claro; limite o Must.', 'Valide cedo com protótipos e demonstrações, rastreie e gerencie as mudanças.'],
  mistakes: ['Aceitar o pedido como requisito sem investigar a necessidade.', 'Ouvir só quem paga e esquecer quem usa e quem opera.', 'Perguntas indutoras que confirmam o que você já pensa.', 'Resolver conflitos entre stakeholders sozinho, em silêncio.', 'Priorizar por quem fala mais alto e não por valor e custo do atraso.', 'Considerar o levantamento "encerrado" no início do projeto.'],
  market: `Analistas de requisitos, de negócio, de produto e designers de UX vivem de elicitação, e pesquisas de produto (entrevistas, observação, análise de dados) são parte do dia a dia de times de produto modernos. Saber priorizar com critérios e dados e conduzir conflitos entre stakeholders é decisivo para o sucesso de produtos e para a progressão de carreira em produto e liderança técnica.`,
  summary: `Levantar requisitos é descobrir necessidades reais: mapeie as partes interessadas (poder e interesse), investigue o objetivo antes da solução (cinco porquês), combine técnicas (entrevista, observação, workshop, dados, protótipo) e use perguntas abertas com exemplos reais. Priorize com MoSCoW, valor x esforço, Kano, custo do atraso e um decisor claro. Valide cedo, registre conflitos e decisões, rastreie requisitos e gerencie as mudanças como processo contínuo.`,
  refs: [REF2.moscow, REF2.kano],
  cards: [
    { q: 'Qual a técnica dos cinco porquês?', a: 'Perguntar "por quê?" repetidamente a um pedido para chegar à necessidade real por trás da solução sugerida.' },
    { q: 'O que significa MoSCoW?', a: 'Must, Should, Could e Won\'t have (nesta entrega): classes de prioridade de requisitos.' },
    { q: 'Por que combinar observação com entrevistas?', a: 'As pessoas esquecem ou omitem o que fazem no automático; a observação revela o trabalho real.' },
    { q: 'O que fazer quando dois stakeholders discordam?', a: 'Levar o conflito, com opções, custos e riscos, a quem decide, e registrar a decisão (por exemplo, em um ADR).' }
  ]
}
];
