// C5.1 — Clean Code e SOLID. Aulas 1 e 2 (nomes, funções e comentários; os cinco princípios SOLID).
const R = String.raw;

export const REF = {
  cleanCode: { title: 'Clean Code: A Handbook of Agile Software Craftsmanship (Robert C. Martin)', url: 'https://www.informit.com/store/clean-code-a-handbook-of-agile-software-craftsmanship-9780132350884', kind: 'livro' },
  googleJs: { title: 'Google JavaScript Style Guide', url: 'https://google.github.io/styleguide/jsguide.html', kind: 'guia' },
  eslintComplexity: { title: 'ESLint — complexity', url: 'https://eslint.org/docs/latest/rules/complexity', kind: 'doc' },
  eslintMaxDepth: { title: 'ESLint — max-depth', url: 'https://eslint.org/docs/latest/rules/max-depth', kind: 'doc' },
  eslintMagic: { title: 'ESLint — no-magic-numbers', url: 'https://eslint.org/docs/latest/rules/no-magic-numbers', kind: 'doc' },
  eslintEqeqeq: { title: 'ESLint — eqeqeq', url: 'https://eslint.org/docs/latest/rules/eqeqeq', kind: 'doc' },
  nodeTest: { title: 'Node.js — Test runner', url: 'https://nodejs.org/api/test.html', kind: 'doc' },
  solidRelevance: { title: 'Robert C. Martin — Solid Relevance', url: 'https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html', kind: 'artigo' },
  liskovWing: { title: 'Liskov e Wing — A behavioral notion of subtyping (1994)', url: 'https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf', kind: 'artigo' },
  fowlerRefactoring: { title: 'Refactoring (Martin Fowler) — catálogo', url: 'https://refactoring.com/catalog/', kind: 'catálogo' },
  fowlerCodeSmell: { title: 'Martin Fowler — CodeSmell', url: 'https://martinfowler.com/bliki/CodeSmell.html', kind: 'artigo' },
  refGuruSmells: { title: 'Refactoring.Guru — Code Smells', url: 'https://refactoring.guru/refactoring/smells', kind: 'guia' },
  legacyBook: { title: 'Working Effectively with Legacy Code (Michael Feathers)', url: 'https://www.informit.com/store/working-effectively-with-legacy-code-9780131177055', kind: 'livro' },
  fowlerTechDebt: { title: 'Martin Fowler — TechnicalDebt', url: 'https://martinfowler.com/bliki/TechnicalDebt.html', kind: 'artigo' },
  fowlerDebtQuadrant: { title: 'Martin Fowler — TechnicalDebtQuadrant', url: 'https://martinfowler.com/bliki/TechnicalDebtQuadrant.html', kind: 'artigo' },
  jscpd: { title: 'jscpd — copy/paste detector', url: 'https://github.com/kucherenko/jscpd', kind: 'ferramenta' },
  fowlerYagni: { title: 'Martin Fowler — Yagni', url: 'https://martinfowler.com/bliki/Yagni.html', kind: 'artigo' }
};

export const lessonsA = [
{
  id: 'cln-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['clean code', 'nomes', 'funções', 'comentários', 'legibilidade', 'ESLint'],
  title: 'Nomes, funções e comentários: escrever código que outras pessoas leiam sem esforço',
  objectives: ['Escolher nomes que revelam intenção, evitam desinformação e são pesquisáveis', 'Reduzir uma função longa a funções pequenas, com um nível de abstração e poucos parâmetros', 'Trocar números mágicos, flags e aninhamento por constantes nomeadas, funções e retornos antecipados', 'Distinguir comentários úteis (o porquê) de comentários que compensam código ruim', 'Medir a melhora com regras do ESLint (complexity, max-depth, max-params, no-magic-numbers, eqeqeq)', 'Proteger a refatoração com testes de caracterização'],
  intro: R`Código é **lido muito mais vezes do que escrito**: quem o lê é a pessoa que corrige um erro às 3 da manhã, a que adiciona uma regra nova e **você mesmo daqui a seis meses**. **Código limpo** não é estética: é a forma mais barata de **reduzir o custo de mudar**. Nesta aula você vai **medir** o problema: uma função legada de 46 linhas (§proc§) com **20 avisos** do ESLint (complexidade 14, aninhamento 5, 5 parâmetros, 8 números mágicos, 5 §==§) e a versão refatorada, **mesmo comportamento**, com **1 aviso**.`,
  theory: R`### Nomes que revelam intenção
O nome é a **documentação mais lida**. Um bom nome responde **o quê, por quê e como é usado** sem exigir um comentário.
- **Revele a intenção**: §d§, §t§, §f§ e §x§ obrigam o leitor a **rastrear o código** para descobrir o significado; §itens§, §perfil§, §comFrete§ e §cupom§ não. Compare §proc(d, t, f, c, x)§ com §calcularTotal({ itens, perfil, comFrete, uf, cupom })§.
- **Evite desinformação**: uma variável chamada §listaDeContas§ que não é lista; §hp§ para "hipotenusa"; nomes que diferem em um caractere (§controleDeAcessoDoUsuario§ x §controleDeAcessoDosUsuarios§).
- **Faça distinções com significado**: §dadosDoCliente§ x §infoDoCliente§ x §clienteObjeto§ **não distinguem** nada; §Produto§ x §ProdutoDados§ também não.
- **Use nomes pronunciáveis e pesquisáveis**: §dtaCriacaoRegAnoMesDia§ não se fala em uma reunião; um §5§ no meio do código **não se pesquisa**, mas §MAX_TENTATIVAS§ sim. O tamanho do nome deve acompanhar o **tamanho do escopo**: §i§ em um laço de três linhas é aceitável; nomes de escopo amplo devem ser **descritivos**.
- **Substantivos para classes e valores, verbos para funções**: §Pedido§, §calcularFrete§, §validarEmail§. **Booleanos** como pergunta: §estaAtivo§, §temPermissao§, §podeEditar§ (e **evite negativas** como §naoEstaDesabilitado§).
- **Um vocabulário por conceito** (§buscar§, §obter§ e §recuperar§ para a mesma coisa confundem) e **o vocabulário do domínio** (a linguagem do negócio, *ubiquitous language*): se o negócio fala "apólice", não escreva §contrato§.
- **Convenção da linguagem**: em JavaScript, §camelCase§ para variáveis e funções, §PascalCase§ para classes, §MAIÚSCULAS_COM_SUBLINHADO§ para constantes (guia do Google e da comunidade). Nomes em português ou em inglês: **escolha um idioma por projeto** e mantenha.

### Números mágicos e constantes
No legado, §0.9§, §0.8§, §500§, §25§, §1000§, §10§, §15§ e §30§ aparecem **sem explicação**: **8 avisos** de §no-magic-numbers§. Na versão refatorada ficaram **constantes com nome** (§LIMITE_DESCONTO_FIXO§, §DESCONTO_FIXO§, §LIMITE_FRETE_GRATIS§, §FRETE_POR_UF§). A mudança de regra de negócio passa a ser **uma edição em um lugar**, com nome que explica o motivo.

### Funções: pequenas, de uma coisa só
- **Pequenas**: o ESLint (§max-lines-per-function§ = 20, valor **didático** e arbitrário) apontou §proc§ com **45 linhas**. Uma função deve caber na cabeça: **um nível de abstração** (não misture "somar o subtotal" com "arredondar centavos" e com "escolher a tabela de frete").
- **Faça uma coisa**: se você consegue extrair outra função com um nome que **não é só repetir o código**, a função faz mais de uma coisa. A refatoração produziu §subtotalDosItens§, §aplicarDescontoFixo§, §calcularFrete§ e §calcularTotal§.
- **Poucos parâmetros**: zero, um ou dois é ideal; **três** pede reflexão; **mais de quatro** (§max-params§ = 4) pede um **objeto nomeado** (§{ itens, perfil, comFrete, uf, cupom }§), que também elimina o erro de **trocar a ordem**.
- **Sem argumentos-flag** (§processar(true)§): um booleano diz que a função **faz duas coisas**; separe em duas funções ou use um nome no parâmetro nomeado.
- **Sem efeitos colaterais escondidos**: uma função §verificarSenha§ que também **inicia a sessão** surpreende. **Separação comando-consulta**: ou **muda** o estado (comando) ou **devolve** informação (consulta), não ambos.
- **Retorno antecipado (*guard clauses*)** no lugar de **aninhamento**: o legado aninha **5 níveis** (§max-depth§ = 3 apontou 4 blocos); a versão refatorada trata o caso excepcional na primeira linha (§if (!itens || itens.length === 0) return 0§) e segue **em linha reta**.
- **Complexidade ciclomática**: conta os **caminhos independentes** (cada §if§, §for§, §&&§, §??§ e §case§ soma 1). §proc§ tem **14**; limite didático **5**. Quanto maior, **mais testes** são necessários para cobrir todos os caminhos.
- **Menos repetição (DRY)**: a mesma regra em dois lugares **diverge** com o tempo. Mas **cuidado com a abstração prematura**: duplicações **acidentais** (parecidas hoje, razões diferentes para mudar) **não** devem ser unificadas (veja Yagni e a "regra dos três" na aula de smells).

### Igualdade e tipos
O legado usa §==§ (5 avisos de §eqeqeq§). A **caracterização** mostrou o efeito: o perfil §"1"§ (texto) **recebeu** o desconto, porque §"1" == 1§ é verdadeiro. Ao refatorar para §===§ **sem** perceber isso, você **mudaria o comportamento** (e quebraria quem passa texto). Por isso a versão refatorada usa um mapa indexado por §String(perfil)§: **preserva** o comportamento, e a decisão de **endurecer o contrato** vira uma **mudança explícita**, separada.

### Comentários
**O melhor comentário é o código que dispensa comentários**; mas comentários **bons** existem:
- **Por quê** (decisão não óbvia, restrição legal, bug de uma biblioteca, link para a issue ou o ADR), **nunca o quê**;
- **Avisos** de consequência (§// lento: executa uma consulta por item§), **TODO** com responsável e prazo;
- **Documentação pública** de API (JSDoc, contratos).
**Comentários ruins**: repetir o código (§i++; // incrementa i§), **desculpar** nome ruim (§// d = desconto§: renomeie), **código comentado** (o Git guarda o histórico: apague), **comentário mentiroso** que ficou **desatualizado** e **marcadores** de seção que pedem **extração de função**. Quando sentir vontade de comentar um bloco, **extraia-o para uma função com um bom nome**.

### Formatação e consistência
Use um **formatador automático** (Prettier) e um **linter** (ESLint): a discussão de estilo **sai da revisão de código**. Arquivos curtos, funções relacionadas **próximas**, declarações perto do uso e **ordem de cima para baixo** (conceito geral antes do detalhe) ajudam. A consistência vale mais do que a escolha em si.

### Medido: legado x refatorado (laboratório, Node 26.13.1 e ESLint 10.15.0)
| Medida | Legado §proc§ | Refatorado |
|---|---|---|
| Linhas do arquivo | 46 | 35 |
| Avisos do ESLint | **20** | **1** (o adaptador com a assinatura antiga) |
| Complexidade da função | 14 | cada função ≤ 5 |
| Aninhamento máximo | 5 | 0 a 1 |
| Parâmetros | 5 | objeto nomeado |
| Números mágicos | 8 | 0 (constantes nomeadas) |
| Comparações §==§ | 5 | 0 |
O único aviso restante é **intencional**: o adaptador §proc(d, t, f, c, x)§ mantém a **assinatura antiga** para que os chamadores migrem aos poucos (refatoração em passos pequenos, aula cln-03).

### Como saber que não quebrou: testes de caracterização
Antes de refatorar código **sem testes**, escreva **testes de caracterização** (Feathers): eles registram o que o código **faz hoje** (inclusive o estranho) em uma tabela de entradas e saídas. No laboratório foram **17 casos** executados contra **as duas versões** (36 testes no total com as unidades novas). Para checar que esses testes **protegem**, alterou-se **uma** condição (§>§ para §>=§ no limite de 500): **1 teste falhou** (o "exatamente 500 não desconta"). Sem rede de testes, a refatoração é **aposta**.`,
  concepts: [
    { term: 'Código limpo', def: 'Código fácil de ler, entender e alterar por outras pessoas, que expressa a intenção e tem o menor custo de mudança.' },
    { term: 'Nome revelador de intenção', def: 'Nome que diz o que algo é ou faz sem exigir comentário nem rastreamento do código.' },
    { term: 'Número mágico', def: 'Literal numérico sem nome no código, cujo significado e origem não são evidentes.' },
    { term: 'Guard clause', def: 'Retorno antecipado que trata o caso excepcional no início da função, evitando aninhamento.' },
    { term: 'Complexidade ciclomática', def: 'Número de caminhos independentes de uma função (cada decisão soma um); indica quantos testes são necessários.' },
    { term: 'Separação comando-consulta', def: 'Princípio de que uma função ou altera o estado ou devolve informação, não ambos.' },
    { term: 'Teste de caracterização', def: 'Teste que registra o comportamento atual do código legado (inclusive o inesperado) para proteger uma refatoração.' }
  ],
  examples: R`**Analogia:** código limpo é um **mapa legível**: o legado §proc§ é o mapa **sem legenda** (símbolos §d§, §t§, §f§), com **estradas de cinco níveis** sobrepostas; a versão refatorada tem **legenda** (nomes), **ruas separadas** (funções) e **escala** (constantes).

**Exemplo 1: nomes.** §proc(d, t, f, c, x)§ passa a ser §calcularTotal({ itens, perfil, comFrete, uf, cupom })§; o objeto nomeado impede a troca de ordem.

**Exemplo 2: aninhamento.** Cinco níveis de §if§ viram uma sequência de passos, com retorno antecipado no início.

**Exemplo 3: igualdade.** O teste de caracterização revelou que §"1" == 1§ concedia desconto; a refatoração preservou o comportamento, e endurecer o contrato ficou como decisão separada.`,
  code: [
    { title: 'Antes: função legada (JavaScript; 20 avisos do ESLint: complexidade 14, aninhamento 5, 5 parâmetros, 8 números mágicos, 5 ==)', lang: 'js', code: R`export function proc(d, t, f, c, x) {
  let r = 0;
  if (d) {
    if (d.length > 0) {
      for (let i = 0; i < d.length; i++) {
        if (d[i].q > 0) {
          if (t == 1) { r = r + d[i].p * d[i].q * 0.9; }
          else if (t == 2) { r = r + d[i].p * d[i].q * 0.8; }
          else { r = r + d[i].p * d[i].q; }
        }
      }
      if (r > 500) { r = r - 25; }
      if (f == true) {
        if (r > 1000) { r = r + 0; }
        else { if (c == 'SP') r = r + 10; else if (c == 'RJ') r = r + 15; else r = r + 30; }
      }
      if (x) { r = r - x; }
      if (r < 0) { r = 0; }
      return Math.round(r * 100) / 100;
    } else { return 0; }
  } else { return 0; }
}`, notes: [{ l: '1', t: 'Nomes de uma letra obrigam a rastrear o código.' }, { l: '7', t: 'Números mágicos (0.9, 0.8) sem nome.' }, { l: '13', t: 'Aninhamento profundo e == em vez de ===.' }] },
    { title: 'Depois: funções pequenas e nomes de domínio (JavaScript; 1 aviso restante: o adaptador com a assinatura antiga)', lang: 'js', code: R`const LIMITE_DESCONTO_FIXO = 500;
const DESCONTO_FIXO = 25;
const LIMITE_FRETE_GRATIS = 1000;
const FRETE_POR_UF = { SP: 10, RJ: 15 };
const FRETE_PADRAO = 30;
const FATOR_POR_PERFIL = { 1: 0.9, 2: 0.8 };

export function subtotalDosItens(itens, perfil) {
  const fator = FATOR_POR_PERFIL[String(perfil)] ?? 1;
  return itens.filter((i) => i.q > 0).reduce((soma, i) => soma + i.p * i.q * fator, 0);
}
export const aplicarDescontoFixo = (v) => (v > LIMITE_DESCONTO_FIXO ? v - DESCONTO_FIXO : v);
export function calcularFrete(valor, uf) {
  if (valor > LIMITE_FRETE_GRATIS) return 0;
  return FRETE_POR_UF[uf] ?? FRETE_PADRAO;
}
export function calcularTotal({ itens, perfil, comFrete, uf, cupom }) {
  if (!itens || itens.length === 0) return 0;
  const comDesconto = aplicarDescontoFixo(subtotalDosItens(itens, perfil));
  const comEntrega = comDesconto + (comFrete === true ? calcularFrete(comDesconto, uf) : 0);
  return Math.round(Math.max(comEntrega - (cupom || 0), 0) * 100) / 100;
}`, notes: [{ l: '6', t: 'Indexar por String(perfil) preserva o comportamento do == (o texto "1" ainda recebe o desconto).' }, { l: '17', t: 'Retorno antecipado: o caso vazio sai primeiro.' }] },
    { title: 'Teste de caracterização que roda contra as duas versões (Node.js test runner)', lang: 'js', code: R`import test from 'node:test';
import assert from 'node:assert/strict';
import { proc as legado } from './legado/pedido.mjs';
import { proc as novo } from './refatorado/pedido.mjs';

const it = (p, q) => ({ p, q });
const casos = [
  ['perfil 1 (10%)', [[it(100, 2)], 1, false, 'SP', 0], 180],
  ['perfil como texto "1" (quirk do ==)', [[it(100, 2)], '1', false, 'SP', 0], 180],
  ['exatamente 500 não desconta', [[it(500, 1)], 0, false, 'SP', 0], 500],
  ['frete só com true estrito', [[it(100, 1)], 0, 'true', 'SP', 0], 100]
];
for (const [nome, args, esperado] of casos) {
  test('legado: ' + nome, () => assert.equal(legado(...args), esperado));
  test('refatorado: ' + nome, () => assert.equal(novo(...args), esperado));
}
// Medido: 36 testes passam; trocar > por >= no limite de 500 derruba 1 teste.`, notes: [{ l: '9', t: 'Registra um comportamento estranho do legado em vez de "corrigi-lo".' }, { l: '14', t: 'O mesmo caso roda nas duas implementações.' }] }
  ],
  bestPractices: ['Nomeie pela intenção e pelo vocabulário do domínio; escopo amplo pede nome descritivo.', 'Substitua números mágicos por constantes nomeadas e agrupe regras em tabelas.', 'Funções pequenas, de uma coisa e de um nível de abstração, com até 3 ou 4 parâmetros (use objeto nomeado).', 'Trate casos excepcionais no início (guard clauses) e evite aninhar mais de 3 níveis.', 'Comente o porquê e apague código comentado; extraia funções em vez de escrever marcadores de seção.', 'Escreva testes de caracterização antes de refatorar código sem testes.', 'Automatize o estilo com formatador e linter e mantenha as regras no CI.'],
  mistakes: ['Nomes de uma letra ou abreviações próprias em escopo amplo.', 'Comentar o que o código já diz ou deixar comentários desatualizados.', 'Argumentos booleanos que mudam o comportamento da função.', 'Trocar == por === em código legado sem caracterizar o comportamento.', 'Refatorar sem testes ou misturar refatoração com mudança de comportamento no mesmo passo.', 'Fixar limites de métricas como metas absolutas em vez de sinais para investigar.'],
  market: R`Legibilidade e revisão de código aparecem em **todas** as entrevistas de pessoas desenvolvedoras e em revisões diárias; linters e formatadores são padrão em CI, e saber **refatorar com segurança** (testes de caracterização) é o que separa trabalhar em código legado de temê-lo.`,
  summary: R`Nomes revelam intenção e usam o vocabulário do domínio; funções são pequenas, fazem uma coisa, têm poucos parâmetros (objeto nomeado), retornam cedo e não escondem efeitos. Números mágicos viram constantes e comentários explicam o porquê. Medido no laboratório (Node 26.13.1, ESLint 10.15.0): o legado de 46 linhas teve 20 avisos (complexidade 14, aninhamento 5, 5 parâmetros, 8 números mágicos, 5 ==) e a versão refatorada 1. 17 casos de caracterização passaram nas duas versões (36 testes) e uma mutação (> por >=) derrubou 1 teste, mostrando que a rede protege. Os limites do ESLint são didáticos, não regras universais.`,
  refs: [REF.cleanCode, REF.googleJs, REF.eslintComplexity, REF.eslintMagic, REF.legacyBook, REF.nodeTest],
  cards: [
    { q: 'O que é um número mágico e como corrigi-lo?', a: 'Um literal numérico sem nome e sem significado evidente; troque por uma constante nomeada que expresse a regra de negócio.' },
    { q: 'Por que preferir guard clauses ao aninhamento?', a: 'Tratar o caso excepcional cedo mantém o fluxo principal em linha reta, reduz a profundidade (no legado eram 5 níveis) e a complexidade.' },
    { q: 'O que revelou o teste de caracterização sobre o ==?', a: 'O perfil "1" (texto) recebia o desconto; a refatoração preservou isso e endurecer o contrato ficou como mudança explícita separada.' },
    { q: 'Que comentários vale escrever?', a: 'O porquê (restrições, decisões, links), avisos de consequência e documentação pública; não o que o código já diz nem código comentado.' }
  ]
},
{
  id: 'cln-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['SOLID', 'SRP', 'OCP', 'LSP', 'ISP', 'DIP', 'design'],
  title: 'Os cinco princípios SOLID: o que cada um previne, como violar e como respeitar em JavaScript',
  objectives: ['Enunciar SRP, OCP, LSP, ISP e DIP com um exemplo de violação e a correção de cada um', 'Identificar o "motivo para mudar" que define uma responsabilidade', 'Explicar por que o Quadrado que herda de Retângulo viola o LSP (contrato de comportamento)', 'Aplicar a inversão de dependência por injeção (relógio e repositório) para tornar o código testável', 'Reconhecer quando SOLID vira excesso de abstração (Yagni, regra dos três)', 'Aplicar os princípios a funções e módulos, não só a classes'],
  intro: R`**SOLID** reúne cinco princípios de design orientado a objetos popularizados por Robert C. Martin: **S**RP, **O**CP, **L**SP, **I**SP e **D**IP. Não são leis: são **heurísticas** para que mudar o sistema não exija **mexer em tudo**. Aqui cada princípio tem um **par de código executado** (a versão que viola e a que respeita), com **5 testes** que passam. O mais instrutivo: um §Quadrado§ que herda de §Retangulo§ devolve **16** onde o contrato esperava **20**.`,
  theory: R`### S — Single Responsibility (responsabilidade única)
"Um módulo deve ter **um, e somente um, motivo para mudar**." Responsabilidade **não é "fazer uma coisa"**, é **responder a um grupo de interesse**: o financeiro muda o cálculo, o marketing muda o texto, a infraestrutura muda onde se grava.
No laboratório, §RelatorioMonolito§ **calcula, formata e armazena**: três motivos para mudar em **uma** classe. A versão separada tem §somar§, §formatarTotal§ e §ArmazemEmMemoria§, cada uma **testável sozinha** (sem montar o armazenamento para testar a soma). **Sintomas** de violação: classe com nome genérico (§Manager§, §Utils§), muitas dependências, testes que precisam de muito preparo, conflitos de merge frequentes entre pessoas que mudam por motivos distintos.

### O — Open/Closed (aberto para extensão, fechado para modificação)
Adicionar um **comportamento novo** não deve exigir **editar** código que já funciona (e já foi testado). §descontoSwitch§ tem um §switch§ por tipo de cliente: cada tipo novo **altera** a função. A alternativa é um **registro de regras** (§criarDescontos§): no teste, o tipo §"estudante"§ foi **registrado** depois e passou a valer **sem tocar** nas regras de §vip§. Em JavaScript, o OCP costuma ser **um mapa de funções**, **injeção de função** ou polimorfismo; **não exige classes**. **Cuidado**: abrir tudo para extensão **antes** de existir uma segunda variação é **especulação** (Yagni): espere a **segunda ou terceira** ocorrência e então generalize.

### L — Liskov Substitution (substituição)
Um **subtipo** deve poder **substituir** o tipo base **sem quebrar** as expectativas de quem usa o base. O problema clássico: §Quadrado extends Retangulo§. O código cliente faz §r.setLargura(5); r.setAltura(4); r.area()§ e espera **20**.
**Medido:** com §Retangulo§ o resultado é **20**; com §Quadrado§ (que, ao mudar a largura, muda também a altura) é **16**. O quadrado **é um retângulo** na geometria, mas **não** no **comportamento** que o cliente espera. A correção é **modelar pelo contrato**: formas **imutáveis** com a mesma interface §area()§ (§retangulo(5, 4).area()§ = 20 e §quadrado(4).area()§ = 16), sem herança falsa.
**Regras práticas** (Liskov e Wing): o subtipo **não fortalece pré-condições**, **não enfraquece pós-condições**, **preserva invariantes** e **não lança exceções novas** inesperadas. Sinal de violação: §instanceof§ no cliente, métodos que lançam §"não suportado"§, sobrescritas que **ignoram** o contrato. **Prefira composição a herança** quando "é um" não for **comportamentalmente** verdadeiro.

### I — Interface Segregation (segregação de interfaces)
Ninguém deve ser **forçado a depender de métodos que não usa**. A interface gorda §Trabalhador§ com §trabalhar()§ e §comer()§ obriga o **robô** a implementar §comer()§: no laboratório §RoboGordo.comer()§ **lança um erro** ("robô não come"), exatamente o sintoma de ISP + LSP. Com interfaces **pequenas**, o robô só tem §trabalhar()§ e quem precisa de §comer()§ recebe só quem **come**. Em TypeScript são **interfaces estreitas** (§Pick§, tipos de entrada mínimos); em JavaScript, **funções que recebem só o que usam** (duck typing: exija §{ trabalhar }§, não a classe inteira).

### D — Dependency Inversion (inversão de dependência)
**Módulos de alto nível não devem depender dos de baixo nível**: ambos dependem de **abstrações**; e abstrações não dependem de detalhes. Na prática: o **código de negócio recebe** suas dependências (relógio, repositório, cliente HTTP) em vez de **criá-las** (§new Date()§, §new Database()§).
No laboratório, §LembreteAcoplado§ chama §new Date()§ internamente: o teste **só funciona hoje** (precisa montar dados com a data atual). §ServicoLembrete({ relogio, repositorio })§ **recebe** o relógio: o teste usa §() => new Date('2026-11-25T10:00:00Z')§ e fica **determinístico**. Isso é **injeção de dependência** (a ferramenta); a **inversão** é o princípio (o negócio define o que precisa; a infraestrutura se adapta). Em JavaScript, passar **funções** como parâmetros basta; contêineres de DI (Nest, aula de patterns) são opcionais.

### SOLID em JavaScript e TypeScript
- **Módulos e funções** também têm responsabilidades: aplique os princípios a **funções** (SRP), **mapas** (OCP), **tipos estruturais** (ISP) e **parâmetros injetados** (DIP). TypeScript ajuda com **interfaces** e tipos estruturais, mas **não é necessário**.
- Em programação funcional, **funções puras** e **composição** cumprem a maior parte do que SOLID busca (isolar efeitos, extensão por composição).

### Críticas e limites (por que não aplicar cegamente)
- **Excesso de abstração**: uma interface para cada classe, fábricas para tudo, **indireção** que esconde o fluxo. **Custa leitura** e só compensa se houver **variação real**.
- **Yagni** ("você não vai precisar disso") e a **regra dos três**: **duplique uma vez, abstraia na terceira**; abstrações erradas custam mais que duplicação.
- Os princípios **conflitam**: SRP em excesso espalha a lógica em dezenas de pequenas classes; **equilibre** com **coesão** (o que muda junto fica junto).
- São **orientações de design**, não métricas: o ESLint **não detecta** violação de LSP. **Testes** (como o do Quadrado) e **revisão de código** é que detectam.
- Use os princípios como **vocabulário** para discutir design, **não** como argumento de autoridade: o que importa é o **custo de mudar** observado no código.

### Como aplicar na prática
1. **Comece pelo teste**: se testar exige muito preparo, procure **DIP/SRP**.
2. **Procure o motivo para mudar**: liste quem pede mudanças; cada grupo é um candidato a módulo.
3. **Espere a variação**: generalize (OCP) quando surgir a **segunda ou terceira** variante.
4. **Cheque o contrato** do subtipo com os **mesmos testes** do tipo base (testes de contrato reutilizáveis).
5. **Prefira interfaces pequenas** definidas **por quem usa** (o cliente), não por quem implementa.

### Medido (laboratório): 5 testes SOLID passam
- **SRP**: soma §15.5§ e formato §Total: R$ 15.50§ testados **separadamente**;
- **OCP**: tipo §"estudante"§ **registrado depois** devolve **50** para 100, sem alterar §vip§ (**80**);
- **LSP**: §Retangulo§ **20** x §Quadrado§ **16**;
- **ISP**: §RoboGordo.comer()§ **lança**; §Robo§ só trabalha;
- **DIP**: com o relógio injetado, o resultado é determinístico (**1** lembrete do dia).`,
  concepts: [
    { term: 'SRP', def: 'Princípio da responsabilidade única: um módulo deve ter um único motivo para mudar.' },
    { term: 'OCP', def: 'Princípio aberto/fechado: estender o comportamento sem modificar o código existente.' },
    { term: 'LSP', def: 'Princípio da substituição de Liskov: um subtipo deve poder substituir o tipo base sem quebrar as expectativas dos clientes.' },
    { term: 'ISP', def: 'Princípio da segregação de interfaces: ninguém deve depender de métodos que não usa.' },
    { term: 'DIP', def: 'Princípio da inversão de dependência: alto e baixo nível dependem de abstrações, não de detalhes.' },
    { term: 'Injeção de dependência', def: 'Técnica em que um componente recebe suas dependências de fora em vez de criá-las.' },
    { term: 'Yagni', def: '"Você não vai precisar disso": não implemente flexibilidade antes de haver necessidade real.' }
  ],
  examples: R`**Analogia:** SOLID é a **organização de uma cozinha profissional**: cada estação tem **uma função** (SRP); novo prato entra **sem reformar** a cozinha (OCP); um **ajudante** deve conseguir fazer o papel do chef de partida sem estragar o prato (LSP); cada cozinheiro recebe **só as ferramentas de que precisa** (ISP); e o forno é **ligado por quem opera**, não **soldado** à receita (DIP).

**Exemplo 1: LSP medido.** Retangulo 5 x 4 = 20; Quadrado (mesmo cliente) = 16. O contrato do cliente quebrou.

**Exemplo 2: DIP.** O relógio injetado torna o teste de "lembretes de hoje" determinístico.

**Exemplo 3: OCP.** O tipo "estudante" foi adicionado ao registro sem alterar a regra de "vip".`,
  code: [
    { title: 'SRP e OCP: separar responsabilidades e estender por registro (JavaScript; testes executados)', lang: 'js', code: R`// SRP: três responsabilidades, três unidades testáveis
export const somar = (vendas) => vendas.reduce((s, v) => s + v, 0);
export const formatarTotal = (total) => 'Total: R$ ' + total.toFixed(2);
export class ArmazemEmMemoria { constructor() { this.itens = []; } salvar(t) { this.itens.push(t); } }

// OCP: regras registradas, sem editar as existentes
export function criarDescontos(inicial = {}) {
  const regras = { ...inicial };
  return {
    registrar(tipo, fn) { regras[tipo] = fn; },
    aplicar(tipo, valor) { return (regras[tipo] ?? ((v) => v))(valor); }
  };
}
const d = criarDescontos({ vip: (v) => v * 0.8 });
d.registrar('estudante', (v) => v * 0.5);
console.log(d.aplicar('vip', 100), d.aplicar('estudante', 100)); // 80 50`, notes: [{ l: '7', t: 'O mapa de regras substitui o switch que crescia a cada tipo.' }, { l: '14', t: 'Nova regra sem tocar nas existentes.' }] },
    { title: 'LSP: o Quadrado que quebra o contrato (JavaScript; resultado medido 20 x 16)', lang: 'js', code: R`class Retangulo { constructor(l, a) { this.l = l; this.a = a; } setLargura(l) { this.l = l; } setAltura(a) { this.a = a; } area() { return this.l * this.a; } }
class Quadrado extends Retangulo {
  setLargura(l) { this.l = l; this.a = l; }
  setAltura(a) { this.l = a; this.a = a; }
}
const usar = (r) => { r.setLargura(5); r.setAltura(4); return r.area(); };
console.log(usar(new Retangulo(1, 1))); // 20
console.log(usar(new Quadrado(1, 1)));  // 16  <- viola o contrato esperado pelo cliente

// Correção: formas imutáveis com a mesma interface (sem herança falsa)
const retangulo = (l, a) => ({ area: () => l * a });
const quadrado = (lado) => ({ area: () => lado * lado });
console.log(retangulo(5, 4).area(), quadrado(4).area()); // 20 16`, notes: [{ l: '3', t: 'A sobrescrita muda duas medidas: o cliente não espera isso.' }, { l: '9', t: 'O cliente recebe 16, não 20.' }] },
    { title: 'DIP: relógio e repositório injetados (JavaScript; teste determinístico)', lang: 'js', code: R`export class ServicoLembrete {
  constructor({ relogio, repositorio }) { this.relogio = relogio; this.repositorio = repositorio; }
  deHoje() {
    const hoje = this.relogio().toISOString().slice(0, 10);
    return this.repositorio.todos().filter((l) => l.data === hoje);
  }
}
// Teste: nenhuma dependência do relógio real
const repo = { todos: () => [{ data: '2026-11-25', t: 'a' }, { data: '2026-11-26', t: 'b' }] };
const s = new ServicoLembrete({ relogio: () => new Date('2026-11-25T10:00:00Z'), repositorio: repo });
console.log(s.deHoje().map((l) => l.t)); // [ 'a' ]`, notes: [{ l: '2', t: 'As dependências chegam pelo construtor.' }, { l: '10', t: 'O relógio falso fixa a data: o teste é repetível.' }] }
  ],
  bestPractices: ['Pergunte "quem pede mudanças aqui?" para definir responsabilidades (SRP).', 'Generalize (OCP) só quando surgir a segunda ou terceira variação.', 'Verifique subtipos com os mesmos testes do tipo base; prefira composição quando "é um" não valer no comportamento.', 'Defina interfaces pequenas pelo ponto de vista de quem as usa (ISP).', 'Injete relógio, repositório e clientes externos para tornar o código testável (DIP).', 'Aplique os princípios também a funções e módulos, não só a classes.', 'Use SOLID como vocabulário de design, equilibrando com coesão e simplicidade.'],
  mistakes: ['Interpretar SRP como "uma função por classe" ou "uma coisa" em vez de um motivo para mudar.', 'Criar abstrações e fábricas sem variação real (excesso de design).', 'Herdar só para reaproveitar código, violando o contrato (Quadrado e Retângulo).', 'Interfaces gordas que obrigam implementações vazias ou que lançam "não suportado".', 'Criar dependências dentro da classe (new Date(), new Database()) e depois depender de mocks globais.', 'Tratar SOLID como lei ou métrica em vez de heurística.'],
  market: R`SOLID é assunto recorrente em **entrevistas** e em **revisões de design**; o valor está em **explicar o raciocínio** (qual motivo para mudar, qual contrato, qual dependência) e em reconhecer o **excesso**: equipes experientes valorizam simplicidade e testabilidade, não abstração por reflexo.`,
  summary: R`SRP: um motivo para mudar; OCP: estender sem editar o que funciona; LSP: o subtipo respeita o contrato do tipo base (medido: Retângulo 20 x Quadrado 16); ISP: interfaces pequenas, definidas por quem usa (o RoboGordo lançou erro ao comer); DIP: o negócio recebe suas dependências (o relógio injetado deixou o teste determinístico). 5 testes do laboratório passaram. Em JavaScript os princípios se aplicam a funções, mapas e parâmetros; abstraia na segunda ou terceira variação e evite o excesso de design (Yagni).`,
  refs: [REF.solidRelevance, REF.liskovWing, REF.cleanCode, REF.fowlerYagni, REF.nodeTest],
  cards: [
    { q: 'O que define uma responsabilidade no SRP?', a: 'Um motivo para mudar, ou seja, um grupo de interesse que pede alterações; não é simplesmente "fazer uma coisa".' },
    { q: 'Por que o Quadrado que herda de Retângulo viola o LSP?', a: 'O cliente muda largura e altura separadamente e espera área 20; o Quadrado altera as duas medidas e devolve 16 (medido).' },
    { q: 'Qual a diferença entre injeção de dependência e inversão de dependência?', a: 'Injeção é a técnica de receber dependências de fora; inversão é o princípio de o código de negócio depender de abstrações, não de detalhes.' },
    { q: 'Quando generalizar para atender ao OCP?', a: 'Quando surge a segunda ou terceira variação real (regra dos três); antes disso é especulação (Yagni).' }
  ]
}
];
