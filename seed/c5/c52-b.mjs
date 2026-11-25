// C5.2 — Design Patterns. Aulas 3 e 4 (padrões comportamentais; Dependency Injection).
import { REF } from './c52-a.mjs';
const R = String.raw;

export const REF2 = {
  nodeEvents: { title: 'Node.js — Events', url: 'https://nodejs.org/api/events.html', kind: 'doc' },
  mdnGenerators: { title: 'MDN — Iterators and generators', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols', kind: 'doc' },
  guruStrategy: { title: 'Refactoring.Guru — Strategy', url: 'https://refactoring.guru/design-patterns/strategy', kind: 'guia' },
  guruObserver: { title: 'Refactoring.Guru — Observer', url: 'https://refactoring.guru/design-patterns/observer', kind: 'guia' },
  guruCommand: { title: 'Refactoring.Guru — Command', url: 'https://refactoring.guru/design-patterns/command', kind: 'guia' },
  guruState: { title: 'Refactoring.Guru — State', url: 'https://refactoring.guru/design-patterns/state', kind: 'guia' },
  guruChain: { title: 'Refactoring.Guru — Chain of Responsibility', url: 'https://refactoring.guru/design-patterns/chain-of-responsibility', kind: 'guia' },
  fowlerInjection: { title: 'Martin Fowler — Inversion of Control Containers and the Dependency Injection pattern', url: 'https://martinfowler.com/articles/injection.html', kind: 'artigo' },
  seemannRoot: { title: 'Mark Seemann — Composition Root', url: 'https://blog.ploeh.dk/2011/07/28/CompositionRoot/', kind: 'artigo' },
  nestProviders: { title: 'NestJS — Providers', url: 'https://docs.nestjs.com/providers', kind: 'doc' },
  nestCustomProviders: { title: 'NestJS — Custom providers', url: 'https://docs.nestjs.com/fundamentals/custom-providers', kind: 'doc' },
  expressMiddleware: { title: 'Express — Using middleware', url: 'https://expressjs.com/en/guide/using-middleware.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'pat-03', moduleId: 'm2', order: 3, minutes: 85, tags: ['Strategy', 'Observer', 'Command', 'State', 'Chain of Responsibility', 'Template Method', 'Iterator'],
  title: 'Padrões comportamentais: Strategy, Observer, Command, State, Chain of Responsibility, Template Method e Iterator',
  objectives: ['Substituir cadeias de if/switch por Strategy e State e saber a diferença entre os dois', 'Usar o Observer do Node (EventEmitter) sem vazar ouvintes e interpretar o aviso de limite', 'Implementar Command com desfazer e uma cadeia de middlewares com curto-circuito', 'Usar Template Method e geradores (Iterator) para algoritmos e sequências preguiçosas', 'Reconhecer onde os frameworks aplicam esses padrões (Express, Nest, EventEmitter)', 'Medir o custo de ouvintes acumulados'],
  intro: R`Os padrões **comportamentais** tratam de **como objetos colaboram e distribuem responsabilidades**. Sete deles, todos **testados** (22 testes do laboratório passam): **Strategy** (frete **normal 16**, **expresso 37**, e um **drone 53** adicionado sem alterar a função), **Observer** (**11 ouvintes** disparam o aviso §MaxListenersExceededWarning§; **100.000 ouvintes** de ~1 KB elevaram o heap de **4,0 MB para 117,2 MB** e **voltaram a 4,1 MB** após §off§ + GC), **Command** com desfazer, **State** (transição **novo → enviado** é inválida), **Chain of Responsibility** (**curto-circuito** em 401), **Template Method** e **Iterator** (gerador **infinito** consumido de forma preguiçosa).`,
  theory: R`### Strategy: algoritmos intercambiáveis
**Problema:** um §if/else§ ou §switch§ que escolhe **uma variante de algoritmo** (cálculo de frete, desconto, ordenação, autenticação). **Solução:** encapsular cada variante em uma **função/objeto com a mesma assinatura** e **escolher em tempo de execução**.
No laboratório, §estrategiasFrete§ = §{ normal: (kg) => 10 + kg * 2, expresso: (kg) => 25 + kg * 4, retirada: () => 0 }§: §calcularFrete('normal', 3)§ = **16** e §('expresso', 3)§ = **37**. Uma **estratégia nova** (§drone: (kg) => 50 + kg§ → **53**) entra **como parâmetro**, sem alterar §calcularFrete§ (OCP, cln-02); tipo desconhecido **lança** §estratégia desconhecida: drone§. **Em JS** a estratégia é **uma função** (não precisa de classe); funciona como **injeção de comportamento** (Passport.js e §Array.sort(comparador)§ são Strategy). **Cuidado:** estratégias demais para **variações triviais**; **teste cada estratégia** isolada.

### State: o comportamento muda com o estado
**Problema:** objeto com **estados** e **regras de transição** espalhadas em condicionais (§if (pedido.status === 'pago' && ...)§). **Solução:** modelar **estados e transições** explicitamente. Uma **tabela de transições** (§novo → [pago, cancelado]§, §pago → [enviado, cancelado]§, §enviado → [entregue]§) já dá uma **máquina de estados**:
- §new PedidoEstado().ir('pago').ir('enviado').ir('entregue')§ → §entregue§;
- §novo → enviado§ lança **§transição inválida: novo → enviado§**; §entregue → cancelado§ também.
**State x Strategy:** os dois **delegam comportamento**; no **State**, o **próprio objeto troca de estado** conforme os eventos (o cliente não escolhe); no **Strategy**, o **cliente** escolhe o algoritmo. **Quando usar:** ciclos de vida (pedido, pagamento, assinatura, documento em revisão), **fluxos de interface**. **Cuidado:** estados **explosivos** → máquinas **hierárquicas** (XState) e **testes de todas as transições** (válidas e inválidas).

### Observer: notificar sem acoplar
**Problema:** um objeto precisa **avisar outros** quando algo acontece, sem **conhecê-los**. **Solução:** **assinantes** se registram (§on§) e o **emissor** os notifica (§emit§). No Node é o **§EventEmitter§** (eventos de streams, servidor HTTP, processos). No laboratório: §loja.on('venda', ...)§ com dois ouvintes; depois de §off§ do primeiro, **só o segundo** recebe a venda seguinte.
**Armadilhas medidas:**
- **Limite de 10 ouvintes por evento** (padrão do Node): o **11º** dispara o aviso **§MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 x listeners added§**. **Não silencie** sem investigar: costuma ser **registro dentro de laço ou de requisição** sem **§off§**;
- **Vazamento de memória:** com §setMaxListeners(0)§, **100.000 ouvintes** (closures com ~1 KB) elevaram o heap de **4,0 MB** para **117,2 MB**; **removê-los** (§off§) e coletar devolveu **4,1 MB** (§listenerCount§ = 0): **o emissor mantém referência** aos ouvintes e a tudo que eles capturam.
**Outras armadilhas:** **ordem** de notificação, **exceções** em um ouvinte afetando os demais (em §EventEmitter§ síncrono, um erro **interrompe** os próximos), **ouvintes assíncronos** (sem §await§), **evento §error§** sem ouvinte **derruba o processo**. **Variações:** **pub/sub** com broker (Redis, Kafka: C4.5 e C8), **observáveis** (RxJS), **sinais** reativos.

### Command: a ação como objeto
**Problema:** parametrizar, **enfileirar**, **registrar** ou **desfazer** operações. **Solução:** cada ação é um **objeto** com §fazer()§ (e §desfazer()§). No laboratório, §Editor§ executa §inserir('Olá')§ e §inserir(', mundo')§ → §Olá, mundo§; §voltar()§ desfaz o último → §Olá§ e de novo → §''§ (um terceiro §voltar()§ **sem efeito**). **Usos:** **desfazer/refazer**, **filas de jobs** (um job é um Command serializado; C4.5), **macros**, **histórico de operações**, **CQRS** (comandos x consultas: aula de arquitetura). **Cuidados:** comandos **idempotentes** ou **reversíveis** de verdade (desfazer um e-mail enviado é impossível) e **estado** necessário para desfazer.

### Chain of Responsibility: uma cadeia de tratadores
**Problema:** a requisição passa por **vários passos** (autenticar, registrar, validar, tratar) e **qualquer um pode encerrar** o fluxo. **Solução:** uma **cadeia** em que cada elo decide **tratar**, **passar adiante** ou **interromper**. É o **modelo dos middlewares do Express** (§(req, res, next)§) e do Koa. No laboratório, §cadeia(auth, log, tratador)§: com usuário → ordem §['auth', 'log']§ e status **200**; sem usuário → §auth§ **encerra** com **401** e **§log§ não roda** (curto-circuito). **Cuidados:** **ordem importa** (autenticar **antes** de registrar dados sensíveis), esquecer §next()§ **trava** a requisição, **erros** assíncronos (Express 5 trata promessas rejeitadas).

### Template Method: o esqueleto fixo, os passos variáveis
Uma **classe base** define o **algoritmo** (§gerar()§: cabeçalho, linhas, rodapé) e as **subclasses** preenchem **passos** (§titulo()§, §linhas()§). Medido: §Vendas§ gerou §== Vendas ==\na: 1\nb: 2\n-- fim --§. **Em JavaScript** prefira **função de ordem superior** (passar os passos como parâmetros) e **composição** à herança (LSP, cln-02); use Template Method quando o **esqueleto for estável** e a **herança fizer sentido** (frameworks, hooks).

### Iterator e geradores
**Iterator** percorre uma coleção **sem expor sua estrutura**. O JavaScript tem o **protocolo de iteração** (§Symbol.iterator§) e **geradores** (§function*§, §yield§): sequências **preguiçosas** e até **infinitas**. Medido: §tomar(naturais(), 5)§ → §[1, 2, 3, 4, 5]§ sem materializar a lista infinita. **Usos:** leitura de **arquivos grandes**, **paginação** (§for await§ sobre páginas), **pipelines** de transformação com **memória constante** (comparação com geradores em Python: C4.8).

### Outros comportamentais (visão rápida)
- **Mediator** (um coordenador reduz o acoplamento entre colegas: chat, formulários); **Memento** (guardar e restaurar estado: desfazer); **Visitor** (operar sobre estruturas heterogêneas: compiladores, ASTs); **Interpreter** (gramática simples).

### Escolhendo
| Quero... | Padrão |
|---|---|
| Trocar um algoritmo conforme o contexto | **Strategy** |
| Mudar o comportamento conforme o estado e validar transições | **State** |
| Avisar vários interessados sem acoplamento | **Observer** |
| Desfazer, enfileirar ou registrar ações | **Command** |
| Encadear passos que podem interromper | **Chain of Responsibility** |
| Esqueleto fixo com passos variáveis | **Template Method** |
| Percorrer sob demanda | **Iterator/gerador** |

### Cuidados
- **Padrões comportamentais criam fluxos indiretos**: documente e **registre** (logs, traces) para depurar;
- **Nada substitui testar as combinações** (cadeias em ordens diferentes, transições inválidas);
- **EventEmitter** é **síncrono e em memória**: **não** é uma fila confiável (para isso, C4.5).`,
  concepts: [
    { term: 'Strategy', def: 'Padrão que encapsula algoritmos intercambiáveis atrás de uma interface comum, escolhidos em tempo de execução.' },
    { term: 'State', def: 'Padrão em que o comportamento do objeto depende do seu estado, com transições explícitas e validadas.' },
    { term: 'Observer', def: 'Padrão em que assinantes são notificados quando um emissor muda ou dispara um evento.' },
    { term: 'Command', def: 'Padrão que representa uma ação como objeto, permitindo desfazer, enfileirar e registrar.' },
    { term: 'Chain of Responsibility', def: 'Padrão em que a requisição passa por uma cadeia de tratadores, cada um podendo tratar, repassar ou interromper.' },
    { term: 'Template Method', def: 'Padrão em que uma classe base define o esqueleto de um algoritmo e as subclasses implementam os passos.' },
    { term: 'Gerador', def: 'Função com function* e yield que produz valores sob demanda, de forma preguiçosa.' }
  ],
  examples: R`**Analogia:** o **Strategy** é escolher o **meio de transporte** (ônibus, táxi, bicicleta) para o mesmo destino; o **State** é um **semáforo** (cada estado só permite certas transições); o **Observer** é a **assinatura de um canal**; o **Command** é o **botão desfazer** do editor; a **Chain** é a **fila de portarias** (cada uma pode barrar); o **Template Method** é a **receita** com passos fixos e ingredientes variáveis; o **gerador** é uma **fonte** que entrega água quando você abre a torneira, sem encher um reservatório infinito.

**Exemplo 1: Strategy.** O frete do drone (53) entra como parâmetro, sem tocar na função.

**Exemplo 2: Observer.** Remover um ouvinte devolve a memória: 100.000 ouvintes ocuparam 117,2 MB e voltaram a 4,1 MB.

**Exemplo 3: Chain.** Sem usuário, o primeiro elo devolve 401 e o log não roda.`,
  code: [
    { title: 'Strategy e State (JavaScript; testado: 16, 37, 53 e transição inválida)', lang: 'js', code: R`export const estrategiasFrete = {
  normal: (kg) => 10 + kg * 2,
  expresso: (kg) => 25 + kg * 4,
  retirada: () => 0
};
export const calcularFrete = (tipo, kg, estrategias = estrategiasFrete) => {
  const s = estrategias[tipo];
  if (!s) throw new Error('estratégia desconhecida: ' + tipo);
  return s(kg);
};
calcularFrete('normal', 3);   // 16
calcularFrete('drone', 3, { ...estrategiasFrete, drone: (kg) => 50 + kg });   // 53

const TRANSICOES = { novo: ['pago', 'cancelado'], pago: ['enviado', 'cancelado'], enviado: ['entregue'], entregue: [], cancelado: [] };
export class PedidoEstado {
  constructor() { this.estado = 'novo'; }
  ir(para) {
    if (!TRANSICOES[this.estado].includes(para)) throw new Error('transição inválida: ' + this.estado + ' → ' + para);
    this.estado = para; return this;
  }
}`, notes: [{ l: '6', t: 'As estratégias entram como parâmetro: a função continua fechada para modificação.' }, { l: '19', t: 'A tabela de transições é a fonte única das regras do ciclo de vida.' }] },
    { title: 'Observer com EventEmitter: aviso de limite e remoção de ouvintes (Node.js; medido)', lang: 'js', code: R`import { EventEmitter } from 'node:events';

const em = new EventEmitter();
for (let i = 0; i < 11; i++) em.on('x', () => {});
// (node) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
// 11 x listeners added to [EventEmitter]. MaxListeners is 10.

// Boa prática: guardar a referência e remover quando terminar
const ouvinte = (item) => registrar(item);
loja.on('venda', ouvinte);
// ... depois
loja.off('venda', ouvinte);

// Medido: 100.000 ouvintes com ~1 KB cada: heap 4,0 MB -> 117,2 MB; após off + GC: 4,1 MB`, notes: [{ l: '4', t: 'O 11º ouvinte dispara o aviso (limite padrão 10).' }, { l: '9', t: 'Sem a referência não há como remover o ouvinte (funções anônimas).' }] },
    { title: 'Command com desfazer e cadeia de middlewares com curto-circuito (JavaScript; testado)', lang: 'js', code: R`// Command
export class Editor {
  constructor() { this.texto = ''; this.desfazer = []; }
  executar(cmd) { cmd.fazer(this); this.desfazer.push(cmd); }
  voltar() { const c = this.desfazer.pop(); if (c) c.desfazer(this); }
}
export const inserir = (t) => ({ fazer(e) { e.texto += t; }, desfazer(e) { e.texto = e.texto.slice(0, -t.length); } });

// Chain of Responsibility
export const cadeia = (...mws) => (ctx) => {
  let i = -1;
  const prox = () => { i++; return mws[i] ? mws[i](ctx, prox) : ctx; };
  return prox();
};
const exec = cadeia(
  (c, n) => { if (!c.user) { c.status = 401; return c; } return n(); },   // auth encerra a cadeia
  (c, n) => { /* log */ return n(); },
  (c) => { c.status = 200; return c; }
);`, notes: [{ l: '4', t: 'O histórico de comandos permite desfazer em ordem inversa.' }, { l: '18', t: 'Sem usuário, o primeiro elo devolve 401 e o log não roda.' }] }
  ],
  bestPractices: ['Use funções como estratégias; teste cada uma isoladamente.', 'Modele ciclos de vida com tabela de transições e teste as válidas e as inválidas.', 'Guarde a referência dos ouvintes e remova-os (off); investigue o aviso de limite em vez de silenciá-lo.', 'Trate o evento error e as exceções dos ouvintes.', 'Garanta que comandos desfazíveis sejam realmente reversíveis e que cadeias tenham a ordem certa (autenticar antes de registrar).', 'Prefira composição de funções ao Template Method com herança em JavaScript.', 'Use geradores para dados grandes ou infinitos.'],
  mistakes: ['Registrar ouvintes dentro de laços ou requisições sem removê-los.', 'Aumentar o limite de ouvintes para esconder o aviso.', 'Usar EventEmitter como fila confiável.', 'Espalhar regras de transição em condicionais pelo código.', 'Esquecer next() em um middleware e travar a requisição.', 'Confundir State (o objeto troca de estado) com Strategy (o cliente escolhe).'],
  market: R`Esses padrões estão **embutidos** nas ferramentas do dia a dia: **middlewares** (Express, Koa, Nest), **EventEmitter**, **máquinas de estado** (XState, workflows de pedidos), **comandos/jobs** (filas, CQRS) e **geradores/streams**; reconhecê-los ajuda a **depurar** e a **projetar** extensões.`,
  summary: R`Strategy troca algoritmos (frete 16, 37 e 53 sem alterar a função), State explicita ciclos de vida (novo → enviado é inválido), Observer desacopla emissores (o 11º ouvinte dispara o aviso do Node; 100.000 ouvintes ocuparam 117,2 MB e voltaram a 4,1 MB após off e GC), Command permite desfazer, Chain of Responsibility interrompe com 401, Template Method fixa o esqueleto e geradores produzem sequências preguiçosas. Em JavaScript muitos são funções; os riscos são fluxos indiretos, vazamento de ouvintes e ordem errada.`,
  refs: [REF.gof, REF.guruCatalog, REF2.guruStrategy, REF2.guruObserver, REF2.guruCommand, REF2.guruState, REF2.guruChain, REF2.nodeEvents, REF2.mdnGenerators, REF2.expressMiddleware],
  cards: [
    { q: 'Qual a diferença entre Strategy e State?', a: 'No Strategy o cliente escolhe o algoritmo; no State o próprio objeto muda de estado conforme eventos e valida as transições.' },
    { q: 'O que o aviso MaxListenersExceededWarning indica?', a: 'Mais de 10 ouvintes para o mesmo evento: possível vazamento por registros repetidos sem off; investigue antes de aumentar o limite.' },
    { q: 'Por que a cadeia retornou 401 sem rodar o log?', a: 'O primeiro elo (auth) encerrou a cadeia sem chamar next: é o curto-circuito do padrão.' },
    { q: 'Quando preferir um gerador a uma lista?', a: 'Quando os dados são grandes, caros ou infinitos e podem ser consumidos sob demanda com memória constante.' }
  ]
},
{
  id: 'pat-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['Dependency Injection', 'composition root', 'contêiner', 'ciclo de vida', 'service locator', 'NestJS'],
  title: 'Dependency Injection: injeção manual, raiz de composição, contêineres e ciclos de vida',
  objectives: ['Distinguir injeção de dependência, inversão de dependência e contêiner de IoC', 'Montar o grafo de objetos em uma raiz de composição com injeção manual', 'Implementar um contêiner mínimo com singleton, transiente e detecção de dependência circular', 'Usar dublês (relógio, repositório) para tornar o código determinístico', 'Reconhecer o Service Locator como anti-padrão e o que ele esconde', 'Relacionar os conceitos aos providers do NestJS'],
  intro: R`**Injeção de dependência (DI)** é entregar a um componente **o que ele precisa** (repositório, relógio, cliente HTTP) **de fora**, em vez de ele **criar** ou **buscar** sozinho. É a **técnica** que realiza o **princípio DIP** (cln-02). No laboratório, o serviço de cadastro com **relógio, repositório e gerador de id injetados** foi testado com **valores fixos** (§id: 'X'§, §em: '2026-11-25T10:00:00.000Z'§), um **contêiner mínimo** criou **2** instâncias de §servico§ com **1** de §repo§ (singleton) e **2** de §log§ (transiente), detectou §a → b → a§ como **circular** e o **Service Locator** só falhou **em execução** (§TypeError§).`,
  theory: R`### Conceitos
- **Dependência**: algo que um componente **usa** (outro objeto, função, configuração, relógio, banco);
- **Inversão de Dependência (DIP)**: **princípio**: o código de negócio depende de **abstrações** que ele define;
- **Injeção de Dependência (DI)**: **técnica**: as dependências **chegam de fora** (construtor, parâmetro, propriedade);
- **Inversão de Controle (IoC)**: o **fluxo de criação/ligação** é controlado por **um terceiro** (o programa principal ou um **contêiner**), não pelo próprio componente;
- **Contêiner de DI**: ferramenta que **registra** como criar cada coisa e **resolve** o grafo (NestJS, InversifyJS, TSyringe, Spring).
**Resumo:** DIP é o **porquê**; DI é o **como**; o contêiner é **uma ferramenta opcional** para o como.

### Tipos de injeção
- **Por construtor** (preferida): dependências **obrigatórias** ficam explícitas e o objeto nasce **completo** (§new ServicoCadastro({ repo, relogio, id })§);
- **Por parâmetro de função** (idiomática em JS): §criarServico({ repo })§ ou §(deps) => (entrada) => ...§;
- **Por propriedade/setter**: para dependências **opcionais** (menos seguro: o objeto pode ficar **incompleto**).
**Dica:** receba **só o que usa** (ISP, cln-02) e passe um **objeto nomeado** quando houver 3+ dependências.

### Injeção manual e a raiz de composição
Antes de pensar em contêiner, **monte o grafo à mão** no **ponto de entrada** (a **raiz de composição**, Seemann): §raizDeComposicao()§ cria §new ServicoCadastro({ repo: new RepositorioMemoria(), relogio: () => new Date(), id: () => ++n })§. **Regras:**
- **Só a raiz** conhece as implementações concretas; o resto depende de **contratos**;
- **Nenhum** §new§ de dependência no meio do código de negócio;
- **A raiz** é o lugar de decidir **ciclos de vida** (uma instância x uma por requisição).
**Benefício nos testes (medido):** com **relógio e id fixos**, §t.cadastrar('Ana')§ devolve **exatamente** §{ id: 'X', nome: 'Ana', em: '2026-11-25T10:00:00.000Z' }§; o §cadastrar§ do serviço real devolve ids **1** e **2** em sequência. Sem injeção, o teste dependeria do **relógio do sistema**.
**Para a maioria das aplicações pequenas e médias, a injeção manual basta** (e é a mais fácil de ler e depurar).

### Contêineres e ciclos de vida
Um contêiner **registra** fábricas e **resolve** dependências **recursivamente**. O contêiner do laboratório (§Container§) tem:
- **Ciclos de vida:** §singleton§ (uma instância **por contêiner**) e §transiente§ (uma **nova a cada resolução**). Frameworks acrescentam **escopo por requisição** (NestJS: §Scope.REQUEST§);
- **Detecção de circularidade:** ao resolver §a§ → §b§ → §a§ lança **§dependência circular: a → b → a§**;
- **Erro claro** para o não registrado (§não registrado: x§).
**Medido:** ao resolver §servico§ (transiente, depende de §repo§ singleton e §log§ transiente) **duas vezes**: §criacoes§ = §{ servico: 2, repo: 1, log: 2 }§ e **§s1.repo === s2.repo§** (compartilhado), **§s1.log !== s2.log§**.
**Cuidados com ciclos de vida:** um **singleton** que depende de algo **por requisição** guarda dados de **uma requisição** para sempre (***captive dependency***); **estado mutável** em singletons é **estado global** disfarçado (aula pat-01).

### NestJS e outros contêineres
No **NestJS** (C4.2), classes anotadas com §@Injectable()§ são **providers**, registrados em **módulos** e **injetados pelo construtor** com **tipos** como *tokens*; **custom providers** (§useClass§, §useValue§, §useFactory§) permitem **trocar** implementações (**dublês** em testes: §Test.createTestingModule§). **Escopos:** padrão **singleton**, **por requisição** e **transiente**. **Ciclos** (§forwardRef§) são **sinal de design a rever**. Em **TypeScript** puro: **InversifyJS**, **TSyringe**, **awilix** (JS). **Em Java/Spring** o mecanismo é o mesmo (C9). **Vantagens do contêiner:** **grafo grande**, **ciclos de vida**, **decorators**, **módulos**; **custos:** **mágica** (erros em execução), **reflexão/metadados**, **curva de aprendizado**.

### Service Locator: o anti-padrão
**Service Locator** é um **registro global** de onde o código **busca** suas dependências (§registroGlobal.obter('repo')§). **Problemas (medidos nos testes):**
- **Dependência escondida:** o construtor de §ServicoComLocator§ **não declara** que precisa de §repo§; o **tipo/assinatura mente**;
- **Falha tardia:** com o registro vazio, §cadastrar('Ana')§ lança **§TypeError§** **só ao executar**; com o §repo§ registrado funciona: **a ordem de inicialização** vira dependência implícita;
- **Estado global** (de novo) acopla testes.
**Quando aparece sem querer:** **importar um singleton** dentro da função, §container.resolve()§ **espalhado** pelo código. **Exceção aceitável:** a **raiz de composição** (ali o contêiner é usado para montar o grafo, **uma vez**).

### Testar com DI
- **Dublês**: **stub** (respostas fixas), **fake** (implementação simples: repositório em memória), **spy** (registra chamadas) e **mock** (verifica interações). Prefira **fakes** e **estado** a mocks de interação (frágeis);
- **Relógio, aleatoriedade, identificadores e rede**: **injete** (§relogio§, §id§, §fetch§);
- **Testes de integração** podem usar o **contêiner real** com **substituições** pontuais.

### Boas práticas
1. **Construtor** para dependências obrigatórias; **poucas** (mais de 4–5 indicam **violação de SRP**);
2. **Dependa de contratos mínimos** (funções ou interfaces estreitas), não de classes inteiras;
3. **Uma raiz de composição** e **ciclos de vida** conscientes;
4. **Sem Service Locator** (e **sem §new§** de infraestrutura no negócio);
5. **Evite ciclos** (extraia um terceiro componente ou use eventos);
6. **Use contêiner** quando o grafo e os ciclos de vida justificarem, **não por padrão**.

### Cuidados
- **Excesso de abstração**: uma interface por classe "para poder injetar" é **cerimônia**; injete **o que varia** (I/O, relógio, serviços externos);
- **Configuração** é dependência também: **valide-a na inicialização** (C4.2);
- **Desempenho**: resolução por reflexão tem custo na **inicialização**, não por chamada.`,
  concepts: [
    { term: 'Injeção de dependência', def: 'Técnica em que um componente recebe suas dependências de fora em vez de criá-las ou buscá-las.' },
    { term: 'Inversão de controle', def: 'Transferência do controle de criação e ligação dos objetos para um terceiro (programa principal ou contêiner).' },
    { term: 'Contêiner de DI', def: 'Ferramenta que registra como criar cada dependência e resolve o grafo de objetos automaticamente.' },
    { term: 'Ciclo de vida (singleton, transiente, por requisição)', def: 'Política que define quantas instâncias de uma dependência são criadas e por quanto tempo vivem.' },
    { term: 'Captive dependency', def: 'Erro em que um singleton retém uma dependência de ciclo de vida menor (por exemplo, por requisição).' },
    { term: 'Service Locator', def: 'Anti-padrão em que o código busca dependências em um registro global, escondendo-as da assinatura.' },
    { term: 'Fake', def: 'Dublê de teste com implementação funcional simplificada (por exemplo, um repositório em memória).' }
  ],
  examples: R`**Analogia:** DI é o **chef que recebe os ingredientes** da despensa montada pelo gerente (a raiz de composição); o **Service Locator** é o chef que **vai sozinho ao depósito** e só descobre na hora do prato que **faltava sal**; o **contêiner** é o **gerente automatizado** que sabe qual fornecedor entrega cada insumo.

**Exemplo 1: determinismo.** Com relógio e id injetados, o teste obtém exatamente { id: 'X', nome: 'Ana', em: '2026-11-25T10:00:00.000Z' }.

**Exemplo 2: ciclos de vida.** Duas resoluções de servico criam 2 serviços, 1 repo e 2 logs.

**Exemplo 3: anti-padrão.** O Service Locator vazio falha com TypeError só ao executar.`,
  code: [
    { title: 'Injeção manual e raiz de composição (JavaScript; testado)', lang: 'js', code: R`export class ServicoCadastro {
  constructor({ repo, relogio, id }) { Object.assign(this, { repo, relogio, id }); }
  cadastrar(nome) { return this.repo.salvar({ id: this.id(), nome, em: this.relogio().toISOString() }); }
}
// Raiz de composição: o único lugar que conhece as implementações concretas
export function raizDeComposicao() {
  let n = 0;
  return new ServicoCadastro({ repo: new RepositorioMemoria(), relogio: () => new Date(), id: () => ++n });
}

// No teste: tudo determinístico
const t = new ServicoCadastro({ repo: new RepositorioMemoria(), relogio: () => new Date('2026-11-25T10:00:00Z'), id: () => 'X' });
t.cadastrar('Ana');  // { id: 'X', nome: 'Ana', em: '2026-11-25T10:00:00.000Z' }`, notes: [{ l: '2', t: 'As dependências chegam como um objeto nomeado.' }, { l: '8', t: 'Só a raiz sabe qual repositório e qual relógio usar.' }] },
    { title: 'Contêiner mínimo com ciclos de vida e detecção de ciclo (JavaScript; testado)', lang: 'js', code: R`export class Container {
  #registros = new Map(); #unicos = new Map(); criacoes = {};
  registrar(nome, fabrica, { ciclo = 'singleton' } = {}) { this.#registros.set(nome, { fabrica, ciclo }); return this; }
  resolver(nome, pilha = []) {
    if (pilha.includes(nome)) throw new Error('dependência circular: ' + [...pilha, nome].join(' → '));
    const r = this.#registros.get(nome); if (!r) throw new Error('não registrado: ' + nome);
    if (r.ciclo === 'singleton' && this.#unicos.has(nome)) return this.#unicos.get(nome);
    this.criacoes[nome] = (this.criacoes[nome] || 0) + 1;
    const obj = r.fabrica((n) => this.resolver(n, [...pilha, nome]));
    if (r.ciclo === 'singleton') this.#unicos.set(nome, obj);
    return obj;
  }
}
// servico (transiente) -> repo (singleton) e log (transiente), resolvido 2 vezes:
// criacoes = { servico: 2, repo: 1, log: 2 }`, notes: [{ l: '5', t: 'A pilha de resolução detecta ciclos com uma mensagem clara.' }, { l: '7', t: 'Singletons são guardados por contêiner (não é variável global).' }] },
    { title: 'NestJS: provider injetável e substituição em teste (TypeScript; trecho conceitual, não executado nesta aula)', lang: 'ts', code: R`@Injectable()
export class ServicoCadastro {
  constructor(private readonly repo: Repositorio, @Inject('RELOGIO') private readonly relogio: () => Date) {}
  cadastrar(nome: string) { return this.repo.salvar({ nome, em: this.relogio().toISOString() }); }
}

// módulo
@Module({ providers: [ServicoCadastro, { provide: Repositorio, useClass: RepositorioPg }, { provide: 'RELOGIO', useValue: () => new Date() }] })
export class CadastroModule {}

// teste: troca a implementação sem mexer no serviço
const mod = await Test.createTestingModule({ providers: [ServicoCadastro, { provide: Repositorio, useClass: RepositorioMemoria }, { provide: 'RELOGIO', useValue: () => new Date('2026-11-25T10:00:00Z') }] }).compile();`, notes: [{ l: '3', t: 'O construtor declara as dependências; o Nest as resolve pelos tokens.' }, { l: '12', t: 'Em teste, useClass/useValue substituem os provedores reais.' }] }
  ],
  bestPractices: ['Injete por construtor ou parâmetro e receba só o que usa.', 'Monte o grafo em uma única raiz de composição; comece pela injeção manual.', 'Injete relógio, identificadores, rede e persistência para testes determinísticos.', 'Defina ciclos de vida conscientes e evite singletons com dependências de escopo menor.', 'Evite Service Locator; limite o uso do contêiner à raiz de composição.', 'Trate ciclos de dependência como sinal de design a rever.', 'Prefira fakes e verificação de estado a mocks de interação frágeis.'],
  mistakes: ['Criar dependências com new dentro da regra de negócio.', 'Registrar tudo como singleton com estado mutável.', 'Espalhar container.resolve() pelo código (Service Locator).', 'Construtores com mais de 5 dependências sem repensar as responsabilidades.', 'Interfaces para cada classe sem variação real.', 'Singleton que retém dependência por requisição (captive dependency).'],
  market: R`DI é base de **NestJS**, **Spring**, **.NET** e de quase toda **arquitetura testável**; **entrevistas** perguntam a diferença entre **DI, DIP e IoC**, ciclos de vida e como **testar** sem banco; saber **injetar manualmente** mostra que você entende o mecanismo por trás dos contêineres.`,
  summary: R`DIP é o princípio, DI a técnica e o contêiner uma ferramenta opcional. Injete por construtor ou parâmetro e monte o grafo na raiz de composição; com relógio e id injetados o teste deu exatamente { id: 'X', em: '2026-11-25T10:00:00.000Z' }. O contêiner do laboratório criou 2 serviços, 1 repo (singleton) e 2 logs (transiente) e detectou o ciclo a → b → a. O Service Locator esconde dependências e falhou só em execução (TypeError). No NestJS os providers e useClass/useValue fazem o mesmo papel (trecho conceitual, não executado).`,
  refs: [REF2.fowlerInjection, REF2.seemannRoot, REF2.nestProviders, REF2.nestCustomProviders, REF.gof, REF.nodeTest],
  cards: [
    { q: 'Qual a diferença entre DIP, DI e IoC?', a: 'DIP é o princípio (depender de abstrações); DI é a técnica de receber dependências de fora; IoC é o controle da criação e ligação por um terceiro (programa principal ou contêiner).' },
    { q: 'O que é a raiz de composição?', a: 'O ponto único de entrada onde os objetos concretos são criados e ligados; o resto do código depende de contratos.' },
    { q: 'Por que o Service Locator é um anti-padrão?', a: 'Esconde dependências da assinatura, falha só em execução e depende de estado global e da ordem de inicialização.' },
    { q: 'O que é uma captive dependency?', a: 'Um singleton que retém uma dependência de ciclo de vida menor (por exemplo, por requisição), preservando dados de uma só requisição.' }
  ]
}
];
