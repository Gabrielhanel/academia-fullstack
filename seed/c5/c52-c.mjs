// C5.2 — Design Patterns. Aula 5 (anti-patterns) e projeto.
import { REF } from './c52-a.mjs';
import { REF2 } from './c52-b.mjs';
const R = String.raw;

export const REF3 = {
  antipatternWiki: { title: 'Wikipedia — Anti-pattern', url: 'https://en.wikipedia.org/wiki/Anti-pattern', kind: 'referência' },
  bigBall: { title: 'Brian Foote e Joseph Yoder — Big Ball of Mud', url: 'http://www.laputan.org/mud/', kind: 'artigo' },
  fowlerAnemic: { title: 'Martin Fowler — AnemicDomainModel', url: 'https://martinfowler.com/bliki/AnemicDomainModel.html', kind: 'artigo' },
  fowlerYagni: { title: 'Martin Fowler — Yagni', url: 'https://martinfowler.com/bliki/Yagni.html', kind: 'artigo' },
  knuthNote: { title: 'Wikipedia — Program optimization (otimização prematura)', url: 'https://en.wikipedia.org/wiki/Program_optimization', kind: 'referência' },
  nodeAsync: { title: 'Node.js — Learn: asynchronous work', url: 'https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'pat-05', moduleId: 'm3', order: 5, minutes: 75, tags: ['anti-patterns', 'God Object', 'Big Ball of Mud', 'over-engineering', 'golden hammer', 'service locator'],
  title: 'Anti-patterns: soluções que parecem boas e custam caro (God Object, Golden Hammer, Lava Flow e pattern-itis)',
  objectives: ['Definir anti-pattern e distingui-lo de um simples erro', 'Reconhecer os anti-patterns mais comuns de código, arquitetura e processo', 'Identificar o excesso de padrões (pattern-itis) e a otimização prematura', 'Medir sintomas (testabilidade, vazamento, estado global) nos exemplos do laboratório', 'Propor a saída de cada anti-pattern (refatoração ou alternativa)', 'Usar o vocabulário de anti-patterns em code review sem acusar pessoas'],
  intro: R`**Anti-pattern** é uma **solução recorrente** para um problema que **parece boa** (ou é a mais fácil), mas **produz consequências ruins**; o termo vem do mesmo movimento dos padrões, e **cada anti-pattern traz a saída**. Várias já apareceram **medidas** nas aulas anteriores: **Singleton com estado global** (testes acoplados por ordem: 1, 2 e 3), **Service Locator** (falha só em execução), **ouvintes sem remoção** (4,0 MB para 117,2 MB), **Proxy em código quente** (30,6 ms x 1.613,6 ms) e o **God Object** do exemplo desta aula, que exige **seis dependências falsas** para testar **uma regra**.`,
  theory: R`### O que é um anti-pattern
Um anti-pattern tem: (1) **forma recorrente** (você o reconhece), (2) **consequências negativas** e (3) **uma alternativa** conhecida. **Diferente de um bug**: ele **funciona**, mas **encarece a mudança**. **Diferente de um smell** (cln-04): o smell é o **sinal** local; o anti-pattern é a **solução ruim** completa (design, arquitetura ou processo). **Cuidado com o rótulo**: usar "isso é um anti-pattern!" como **argumento de autoridade** em review é **ruim**; descreva **o custo concreto** e a **alternativa**.

### Anti-patterns de código e design
**God Object / Blob** (uma classe que **sabe e faz tudo**): calcula, valida, grava, notifica. **Sintomas:** milhares de linhas, dezenas de dependências, **nome vago** (§Manager§, §Helper§), **todo mundo** mexe nele (conflitos de merge). **Medido no laboratório (didático):** testar **uma** regra do God Object de pedidos exige **6 dependências falsas**; a versão separada exige **1**. **Saída:** **SRP** (cln-02), extrair **serviços** por motivo de mudança, **Facade** fina.
**Spaghetti Code:** fluxo **emaranhado** (saltos, flags globais, callbacks aninhados: ***callback hell***). **Saída:** funções pequenas, **async/await**, **tabela de estados** (State).
**Copy-Paste Programming:** duplicação de **conhecimento** (cln-04). **Saída:** extrair função/módulo.
**Magic Strings / Magic Numbers:** literais sem nome (§'pago'§, §500§). **Saída:** constantes, enums, tabelas.
**Singleton abuse / estado global:** vistos na aula pat-01. **Saída:** injeção e instância por contexto.
**Service Locator:** dependências escondidas (aula pat-04). **Saída:** injeção por construtor e raiz de composição.
**Anemic Domain Model:** objetos de domínio **só com dados** e **toda a lógica em serviços** (Fowler): perde **encapsulamento** e **invariantes**. **Saída:** mover o **comportamento** para as entidades quando houver regras do domínio (cuidado: em sistemas **CRUD simples**, anêmico pode ser aceitável).
**Primitive Obsession** e **Feature Envy**: ver cln-04.
**Premature Optimization:** otimizar **antes de medir** ("a otimização prematura é a raiz de todo o mal", Knuth, citado em contexto: **otimize o que mede**). **Medido:** o **Proxy** custou **53x** em um micro-benchmark, mas **só importa** em laços **quentes**; em um endpoint de **50 ms de I/O** é **irrelevante**. **Saída:** medir, **perfilar** (C4.1), otimizar o gargalo.
**Golden Hammer:** "se a única ferramenta é um martelo, tudo é prego": usar **a tecnologia favorita** (microsserviços, Redis, GraphQL, um framework) **para tudo**. **Saída:** **ADR** com alternativas (aula adr) e **critérios** explícitos.

### Anti-patterns de arquitetura e processo
- **Big Ball of Mud** (Foote e Yoder): sistema **sem estrutura** perceptível, **crescido** por remendos; **Saída:** **modularizar** por partes, **Strangler**, fronteiras e testes (C5.8, C8);
- **Lava Flow:** código **morto** ou experimental que **ninguém ousa remover** (sem testes, sem donos); **Saída:** cobertura, **observabilidade de uso**, remoção **incremental**, o Git guarda o histórico;
- **Boat Anchor:** componente **caro que não é usado** (uma biblioteca comprada "para o futuro"); **Saída:** Yagni;
- **Cargo Cult Programming:** copiar **estruturas sem entender** o porquê (um padrão porque "o projeto X usa"); **Saída:** entender o **problema** antes da **solução**;
- **Reinventing the Wheel / Not Invented Here:** **reescrever** o que existe (autenticação própria, criptografia caseira: **perigoso**); **Saída:** bibliotecas **auditadas** (C4.4 e C7);
- **Distributed Monolith:** **microsserviços** acoplados que **precisam ser implantados juntos** (C4.7);
- **Death March / Heroísmo:** processo que **depende** de esforços extraordinários; **Saída:** planejamento realista (C5.8).

### Pattern-itis: o excesso de padrões
Aplicar padrões **por reflexo** gera **camadas de indireção** sem variação real: **uma interface para cada classe**, **fábrica de fábricas**, **Strategy com uma estratégia**, **Observer para uma notificação única**, **DI com contêiner** para três objetos. **Custos:** mais **arquivos** para ler, **fluxo escondido**, **onboarding lento**. **Regras práticas:**
- **Yagni** e **regra dos três** (abstraia na terceira ocorrência);
- **Padrão como vocabulário**, não como meta;
- **Remova** indireção que **ninguém usa** (inline).
**Teste de bom senso:** "**qual mudança** esse padrão facilita **hoje**?" Se não há resposta concreta, **não precisa**.

### Casos medidos no curso (resumo)
| Anti-pattern | Evidência medida | Saída |
|---|---|---|
| Singleton com estado global | contador 1, 2 e 3 em um teste independente | instância por teste/injeção |
| Service Locator | TypeError só em execução | DI por construtor |
| Ouvintes sem remoção | 4,0 → 117,2 → 4,1 MB (off + GC) | guardar referência e usar off |
| Proxy onipresente | 30,6 ms x 1.613,6 ms (10 M leituras) | medir; Proxy só onde compensa |
| God Object | 6 dependências falsas para um teste | separar por responsabilidade |

### Como sair de um anti-pattern (em passos seguros)
1. **Caracterizar** o comportamento (testes de caracterização: cln-03);
2. **Escolher o menor passo** (extrair uma função, injetar uma dependência);
3. **Strangler** para o que é grande (substituir por partes);
4. **Registrar** a dívida (cln-05) e **medir** o efeito (tempo de mudança, defeitos);
5. **Prevenir** (revisão com checklist, linters, ADRs).

### Em code review
- Fale do **problema concreto** ("isso exige 6 dependências falsas em cada teste") antes do rótulo;
- Ofereça **alternativa** e **tradeoff**;
- **Reconheça contexto**: protótipo, prazo, código descartável;
- Não confunda **gosto** com **anti-pattern**.`,
  concepts: [
    { term: 'Anti-pattern', def: 'Solução recorrente para um problema que parece adequada mas produz consequências negativas, normalmente acompanhada de uma alternativa conhecida.' },
    { term: 'God Object', def: 'Classe que concentra conhecimento e responsabilidades demais, difícil de testar e de mudar.' },
    { term: 'Big Ball of Mud', def: 'Sistema sem estrutura perceptível, crescido por remendos sucessivos.' },
    { term: 'Lava Flow', def: 'Código morto ou experimental que permanece porque ninguém sabe se pode ser removido.' },
    { term: 'Golden Hammer', def: 'Uso da tecnologia ou técnica favorita para qualquer problema, independentemente de adequação.' },
    { term: 'Pattern-itis', def: 'Aplicação de padrões de projeto por reflexo, criando indireção sem variação real.' },
    { term: 'Otimização prematura', def: 'Otimizar antes de medir, complicando o código sem ganho comprovado.' }
  ],
  examples: R`**Analogia:** anti-patterns são **atalhos que viram trilhas de lama**: parecem o caminho mais curto até a primeira chuva; padrões em excesso são **sinalizar cada degrau da escada** com um placar de instruções.

**Exemplo 1: God Object.** Testar uma regra exigiu 6 dependências falsas; a versão separada, 1.

**Exemplo 2: Golden Hammer.** Usar microsserviços e uma fila para um CRUD de 3 telas.

**Exemplo 3: pattern-itis.** Uma interface, uma fábrica e um contêiner para uma única implementação sem variação.`,
  code: [
    { title: 'God Object x responsabilidades separadas: o custo de testar (JavaScript; testado)', lang: 'js', code: R`// God Object: para testar o desconto é preciso montar as 6 dependências
class PedidoGod {
  constructor({ repo, estoque, pagamento, email, relogio, logger }) { Object.assign(this, { repo, estoque, pagamento, email, relogio, logger }); }
  descontoDoCliente(cliente, total) { return cliente.vip && total > 100 ? total * 0.1 : 0; }
  // ... e dezenas de outros métodos: calcular, validar, gravar, notificar
}
// teste do desconto: new PedidoGod({ repo: {}, estoque: {}, pagamento: {}, email: {}, relogio: {}, logger: {} })

// Responsabilidade separada: o desconto é uma função pura
export const descontoDoCliente = (cliente, total) => (cliente.vip && total > 100 ? total * 0.1 : 0);
// teste: descontoDoCliente({ vip: true }, 200) === 20`, notes: [{ l: '8', t: 'Seis dependências falsas só para chegar à regra do desconto.' }, { l: '11', t: 'A função pura se testa com uma linha.' }] },
    { title: 'Anti-pattern do vazamento de ouvintes e a correção (Node.js)', lang: 'js', code: R`import { EventEmitter } from 'node:events';
const barramento = new EventEmitter();

// ERRADO: registra um ouvinte novo a cada requisição e nunca remove
app.get('/status', (req, res) => {
  barramento.on('mudanca', (m) => res.write(m));   // vaza: o emissor guarda a closure (e o res)
});

// CERTO: guarda a referência e remove quando a conexão fecha
app.get('/status', (req, res) => {
  const ouvinte = (m) => res.write(m);
  barramento.on('mudanca', ouvinte);
  req.on('close', () => barramento.off('mudanca', ouvinte));
});
// Medido: 100.000 ouvintes de ~1 KB: 4,0 -> 117,2 MB; após off + GC: 4,1 MB`, notes: [{ l: '6', t: 'Cada requisição acumula uma closure que mantém a resposta viva.' }, { l: '13', t: 'A remoção no fechamento da conexão devolve a memória.' }] },
    { title: 'Checklist de revisão para anti-patterns (Markdown)', lang: 'md', code: R`- [ ] O novo componente tem um motivo claro para mudar? (God Object)
- [ ] As dependências aparecem no construtor/parâmetros? (Service Locator)
- [ ] Há estado mutável global ou singleton com dados de negócio?
- [ ] Ouvintes/timers/conexões têm remoção correspondente?
- [ ] A abstração nova tem pelo menos 2 implementações reais ou testes que dependem dela? (pattern-itis, Yagni)
- [ ] A otimização foi medida antes? (otimização prematura)
- [ ] A escolha tecnológica tem ADR com alternativas? (Golden Hammer)`, notes: [{ l: '1', t: 'Cada item liga o sintoma ao anti-pattern correspondente.' }, { l: '5', t: 'Pergunta de bom senso contra o excesso de padrões.' }] }
  ],
  bestPractices: ['Descreva o custo concreto e a alternativa antes de dar o nome do anti-pattern.', 'Separe responsabilidades para que cada regra seja testável com poucas dependências.', 'Evite estado global, Service Locator e ouvintes sem remoção.', 'Meça antes de otimizar e use padrões apenas onde houver variação real.', 'Registre decisões tecnológicas em ADRs com alternativas para evitar o Golden Hammer.', 'Remova código morto de forma incremental, com testes e observabilidade de uso.', 'Use checklists de revisão para sintomas recorrentes.'],
  mistakes: ['Usar "anti-pattern" como argumento de autoridade em vez de mostrar o custo.', 'Aplicar padrões por reflexo (pattern-itis).', 'Otimizar sem medir.', 'Tratar toda duplicação ou todo modelo anêmico como erro sem considerar o contexto.', 'Manter código morto por medo de remover.', 'Adotar a tecnologia da moda sem avaliar alternativas.'],
  market: R`Vocabulário de anti-patterns aparece em **revisões de código**, **entrevistas de design** e em **postmortems**; **explicar o custo concreto e a saída** de cada um é uma habilidade valorizada em **tech leads**.`,
  summary: R`Anti-patterns são soluções recorrentes que parecem boas e custam caro: God Object, spaghetti, copy-paste, magic strings, singleton/estado global, Service Locator, modelo anêmico, otimização prematura, Golden Hammer, Big Ball of Mud, Lava Flow e pattern-itis. Medidos no curso: contador global 1, 2 e 3; Service Locator falhando só em execução; 100.000 ouvintes: 4,0 → 117,2 → 4,1 MB; Proxy 53x mais lento em laço quente. Saia por passos seguros (caracterizar, extrair, injetar, Strangler), registre a dívida e revise com checklist, falando do custo e não do rótulo.`,
  refs: [REF3.antipatternWiki, REF3.bigBall, REF3.fowlerAnemic, REF3.fowlerYagni, REF.gof, REF2.fowlerInjection],
  cards: [
    { q: 'Qual a diferença entre smell e anti-pattern?', a: 'O smell é um sinal local que pede investigação; o anti-pattern é uma solução ruim recorrente completa (design, arquitetura ou processo), com consequências e saída conhecidas.' },
    { q: 'O que é pattern-itis e como evitá-lo?', a: 'Aplicar padrões por reflexo, criando indireção sem variação real; evite com Yagni, regra dos três e a pergunta "que mudança isso facilita hoje?".' },
    { q: 'Como sair de um God Object com segurança?', a: 'Caracterizar o comportamento, extrair responsabilidades uma a uma (funções puras, serviços), injetar dependências e substituir por partes (Strangler).' },
    { q: 'Como criticar um anti-pattern em code review?', a: 'Descreva o custo concreto (por exemplo, 6 dependências falsas por teste), proponha a alternativa e considere o contexto, sem usar o rótulo como argumento de autoridade.' }
  ]
}
];
