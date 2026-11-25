// C4.2 — NestJS. Aulas 1 a 3 (módulos, controllers e providers; injeção de dependências; pipes e validação).
const R = String.raw;

export const REF = {
  nestFirst: { title: 'NestJS — First steps', url: 'https://docs.nestjs.com/first-steps', kind: 'doc' },
  nestControllers: { title: 'NestJS — Controllers', url: 'https://docs.nestjs.com/controllers', kind: 'doc' },
  nestProviders: { title: 'NestJS — Providers', url: 'https://docs.nestjs.com/providers', kind: 'doc' },
  nestModules: { title: 'NestJS — Modules', url: 'https://docs.nestjs.com/modules', kind: 'doc' },
  nestCustomProviders: { title: 'NestJS — Custom providers', url: 'https://docs.nestjs.com/fundamentals/custom-providers', kind: 'doc' },
  nestScopes: { title: 'NestJS — Injection scopes', url: 'https://docs.nestjs.com/fundamentals/injection-scopes', kind: 'doc' },
  nestCircular: { title: 'NestJS — Circular dependency', url: 'https://docs.nestjs.com/fundamentals/circular-dependency', kind: 'doc' },
  nestLifecycle: { title: 'NestJS — Lifecycle events', url: 'https://docs.nestjs.com/fundamentals/lifecycle-events', kind: 'doc' },
  nestPipes: { title: 'NestJS — Pipes', url: 'https://docs.nestjs.com/pipes', kind: 'doc' },
  nestValidation: { title: 'NestJS — Validation', url: 'https://docs.nestjs.com/techniques/validation', kind: 'doc' },
  classValidator: { title: 'class-validator', url: 'https://github.com/typestack/class-validator', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'nst-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['NestJS', 'módulos', 'controllers', 'providers', 'decoradores', 'encapsulamento'],
  title: 'NestJS: módulos, controllers e providers, e o que o framework acrescenta ao Express',
  objectives: ['Explicar a proposta do NestJS e a relação com o Express', 'Criar módulos, controllers e providers com decoradores e entender o encapsulamento por módulo', 'Mapear rotas, parâmetros, corpo e status com decoradores', 'Configurar um projeto NestJS 12 (ESM, TypeScript 7, decoradores e metadados)', 'Reconhecer erros comuns de resolução de dependências'],
  intro: R`O **NestJS** é um framework de backend em **TypeScript** que organiza a aplicação em **módulos**, **controllers** e **providers**, com **injeção de dependências** e uma **linha de processamento** clara (guards, interceptors, pipes, filtros). Por baixo, usa o **Express** (ou o Fastify). Aqui você monta o menor app possível, mede o **encapsulamento de módulos** e conhece as exigências da versão **12.6.1** (**ESM** e **TypeScript 7**) verificadas no laboratório.`,
  theory: R`### Por que um framework opinativo
O Express é **minimalista**: você decide a estrutura. Em times e projetos grandes, essa liberdade vira **inconsistência**. O Nest impõe uma **arquitetura**:
- **Módulos** agrupam funcionalidades relacionadas e **encapsulam** providers;
- **Controllers** recebem requisições e **delegam**;
- **Providers** (serviços, repositórios, fábricas) contêm a **lógica** e são **injetados**;
- **Decoradores** declaram rotas, validação, autorização;
- **Testabilidade** vem da injeção de dependências (aula nst-07).
Inspirado no **Angular**, com TypeScript e metadados. O custo: **mais conceitos**, **mais boilerplate** e **magia de decoradores**.

### O menor app (medido)
§§§
import 'reflect-metadata';
import { Controller, Get, Injectable, Module, Param } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Injectable() class Servico { saudacao(n: string) { return 'olá, ' + n; } }
@Controller('oi') class Ctrl {
  constructor(private readonly s: Servico) {}           // injeção pelo tipo do parâmetro
  @Get(':nome') ola(@Param('nome') n: string) { return { msg: this.s.saudacao(n) }; }
}
@Module({ controllers: [Ctrl], providers: [Servico] }) class AppModule {}
const app = await NestFactory.create(AppModule);
await app.listen(3000);
§§§
GET §/oi/ana§ → **200** §{"msg":"olá, ana"}§ (medido no laboratório).
- O decorador §@Injectable()§ marca a classe como **gerenciada pelo contêiner**;
- §@Controller('oi')§ define o prefixo; §@Get(':nome')§ o método e o caminho;
- O Nest lê o **tipo do parâmetro do construtor** (§Servico§) graças ao **metadado** que o TypeScript emite com §emitDecoratorMetadata§.

### Requisitos do projeto (verificados com Nest 12.6.1 e TypeScript 7.0.2)
- O Nest 12 é distribuído como **ESM**: use §"type": "module"§ no package.json e §"module": "nodenext"§ com §"moduleResolution": "nodenext"§ (medido: com §commonjs§ o TypeScript acusa **TS1479**).
- O TypeScript **7** **removeu** §moduleResolution: node10§ (TS5108).
- §experimentalDecorators§ e §emitDecoratorMetadata§ **ligados**; importe §reflect-metadata§ uma vez.
- Compile com **§tsc§** (ou o **§nest build§**/SWC): **ferramentas como o tsx/esbuild não emitem os metadados** de tipos usados na DI. Imports relativos em ESM levam a extensão §.js§.
- §NestFactory.create(AppModule, { logger: false, abortOnError: false })§: sem §abortOnError: false§, uma falha de resolução de dependências chama **§process.exit(1)§** (medido: o processo saiu com código 1 sem mensagem quando o logger estava desligado). Em produção deixe o logger ligado; em testes, use §abortOnError: false§ para receber a exceção.

### Módulos e encapsulamento
Um módulo (§@Module({ imports, controllers, providers, exports })§) tem seu **escopo**:
- §providers§: o que **ele** instancia, **visível só nele**;
- §exports§: o subconjunto que **outros** módulos podem injetar;
- §imports§: módulos cujos exports ele usa.
Medido: um controller no §AppModule§ que injeta um serviço de um módulo importado que **não o exporta** falha ao subir com **"Nest can't resolve dependencies of the XCtrl (?). Please make sure that the argument SecretoService at index [0] is available in the AppSemExport module."**; com §exports: [SecretoService]§, a rota devolveu **200** §segredo§. Regra: **exporte só a interface pública** do módulo.
Módulos **globais** (§@Global()§) evitam importar em todo lugar, mas **escondem dependências**: use com moderação (configuração, logger).

### Controllers: rotas e dados da requisição
- Métodos: §@Get§, §@Post§, §@Put§, §@Patch§, §@Delete§; prefixos no §@Controller('usuarios')§.
- Parâmetros: §@Param('id')§, §@Query('q')§, §@Body()§, §@Headers('x')§, §@Req()§/§@Res()§ (use **só se necessário**: acoplam ao Express e desligam o tratamento automático da resposta).
- Resposta: o valor **retornado** (objeto, promise) vira JSON; §@HttpCode(204)§, §@Header()§, §@Redirect()§; exceções HTTP (§NotFoundException§) viram respostas (aula nst-06).
- **Controllers finos**: validar (pipes), **delegar a um serviço** e retornar.

### Providers
Qualquer classe §@Injectable()§: **serviços** (regra de negócio), **repositórios** (acesso a dados), fábricas, **clientes de integração**. Por padrão são **singletons** por módulo (aula nst-02). Controller não deve conter **regra de negócio**: ela vai para o serviço, que é **testado sem HTTP**.

### Nest x Express: o que muda
| | Express | NestJS |
|---|---|---|
| Estrutura | livre | módulos/controllers/providers |
| DI | manual | **contêiner** nativo |
| Validação | à mão ou biblioteca | **pipes** e DTOs |
| Autorização | middleware | **guards** com metadados |
| Testes | monta o app | **módulo de teste** com substituição de providers |
| Curva | baixa | **maior** |
Para APIs pequenas, o Express (aula nex-03) basta; para **times, domínios grandes e longevidade**, o Nest traz **padrão e previsibilidade**. Ele **não substitui** conhecer HTTP, o event loop e o Express.`,
  concepts: [
    { term: 'Módulo (Nest)', def: 'Unidade que agrupa controllers e providers e define o que é exportado.' },
    { term: 'Controller', def: 'Classe que declara rotas e delega o trabalho a providers.' },
    { term: 'Provider', def: 'Classe injetável, como um serviço ou repositório, gerenciada pelo contêiner.' },
    { term: '@Injectable()', def: 'Decorador que marca uma classe como gerenciável pelo contêiner de DI.' },
    { term: 'exports', def: 'Lista de providers de um módulo que ficam visíveis a quem o importa.' },
    { term: 'emitDecoratorMetadata', def: 'Opção do TypeScript que emite os tipos dos parâmetros, usada pela DI do Nest.' },
    { term: 'Módulo global', def: 'Módulo cujos exports ficam disponíveis em toda a aplicação sem importação explícita.' },
    { term: 'NestFactory', def: 'Classe que cria a aplicação Nest a partir de um módulo raiz.' },
    { term: 'abortOnError', def: 'Opção que, quando verdadeira, encerra o processo se a criação do app falhar.' },
    { term: 'Controller fino', def: 'Controller que apenas valida e delega, sem regra de negócio.' }
  ],
  examples: R`**Analogia:** o Nest é um **prédio comercial bem administrado**: cada **módulo** é um **andar** com suas salas privadas (providers) e uma **recepção** (exports) que decide o que pode ser usado pelos outros andares; o **controller** é a **mesa de atendimento** que recebe o cliente e encaminha ao especialista (serviço). O **contêiner de DI** é o **síndico** que entrega a cada sala os recursos de que ela precisa, sem que ela saiba de onde vieram. Pedir um serviço que **não foi exportado** é bater na porta de uma sala que **a recepção não liberou**.

**Exemplo 1: o menor app.** 200 {"msg":"olá, ana"}.

**Exemplo 2: encapsulamento.** Sem exports, o app nem sobe: "Nest can't resolve dependencies...".

**Exemplo 3: requisito do projeto.** ESM e nodenext no Nest 12; TypeScript 7 sem node10.`,
  code: [
    { title: 'O menor app NestJS (TypeScript, Nest 12.6.1; saída medida)', lang: 'ts', code: R`import 'reflect-metadata';
import { Controller, Get, Injectable, Module, Param } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Injectable() class Servico { saudacao(n: string) { return 'olá, ' + n; } }
@Controller('oi') class Ctrl {
  constructor(private readonly s: Servico) {}
  @Get(':nome') ola(@Param('nome') n: string) { return { msg: this.s.saudacao(n) }; }
}
@Module({ controllers: [Ctrl], providers: [Servico] }) class AppModule {}

const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
await app.listen(0, '127.0.0.1');
const r = await fetch((await app.getUrl()) + '/oi/ana');
console.log(r.status, await r.text());   // 200 {"msg":"olá, ana"}
await app.close();`, notes: [{ l: '6', t: 'O tipo do parâmetro vira o token da injeção.' }, { l: '12', t: 'abortOnError false devolve a exceção em vez de encerrar o processo.' }] },
    { title: 'Encapsulamento por módulo (TypeScript, mensagem de erro medida)', lang: 'ts', code: R`@Injectable() class SecretoService { v() { return 'segredo'; } }
@Module({ providers: [SecretoService] }) class SecretoModule {}                     // não exporta
@Controller('x') class XCtrl { constructor(private s: SecretoService) {} @Get() g() { return this.s.v(); } }
@Module({ imports: [SecretoModule], controllers: [XCtrl] }) class AppSemExport {}
// falha: Nest can't resolve dependencies of the XCtrl (?). Please make sure that the argument SecretoService at index [0] is available in the AppSemExport module.

@Module({ providers: [SecretoService], exports: [SecretoService] }) class SecretoModuleOk {}
@Module({ imports: [SecretoModuleOk], controllers: [XCtrl] }) class AppComExport {}
// GET /x -> 200 segredo`, notes: [{ l: '2', t: 'Sem exports, o provider fica privado ao módulo.' }, { l: '7', t: 'Com exports, o módulo importador pode injetá-lo.' }] },
    { title: 'tsconfig e package.json para o Nest 12 (JSON)', lang: 'json', code: R`{
  "compilerOptions": {
    "target": "ES2022", "module": "nodenext", "moduleResolution": "nodenext",
    "experimentalDecorators": true, "emitDecoratorMetadata": true,
    "strict": true, "esModuleInterop": true, "skipLibCheck": true, "outDir": "dist", "rootDir": "src", "types": ["node"]
  },
  "include": ["src"]
}`, notes: [{ l: '3', t: 'ESM com nodenext; o package.json precisa de "type": "module".' }, { l: '4', t: 'Os metadados de tipos habilitam a injeção por tipo.' }] }
  ],
  bestPractices: ['Mantenha controllers finos e coloque a regra de negócio em serviços.', 'Exporte apenas a interface pública de cada módulo.', 'Use módulos globais só para configuração e logger.', 'Compile com tsc (ou o build do Nest), não com ferramentas que não emitem metadados.', 'Use abortOnError false em testes para receber as exceções.', 'Evite @Req e @Res sem necessidade.'],
  mistakes: ['Esquecer de listar um provider em providers ou de exportá-lo.', 'Tornar tudo global para evitar importações.', 'Executar o TypeScript com um transpilador sem metadados e perder a injeção.', 'Usar commonjs ou node10 com Nest 12 e TypeScript 7.', 'Colocar regras de negócio em controllers.', 'Usar @Res e esquecer de enviar a resposta.'],
  market: R`O NestJS é um dos frameworks de backend em TypeScript mais usados em empresas; entender módulos, DI e a estrutura é pré-requisito para trabalhar em seus projetos e para as entrevistas de vagas Node/TypeScript sênior.`,
  summary: R`O NestJS organiza a aplicação em módulos, controllers e providers, com injeção de dependências pelo tipo do parâmetro. Medido no Nest 12.6.1: o app mínimo devolveu 200 {"msg":"olá, ana"}; um provider não exportado impede a resolução ("Nest can't resolve dependencies..."); o projeto precisa ser ESM com nodenext, TypeScript 7 sem node10 e metadados de decoradores emitidos pelo tsc. Mantenha controllers finos e exporte só a interface pública.`,
  refs: [REF.nestFirst, REF.nestControllers, REF.nestProviders, REF.nestModules],
  cards: [
    { q: 'Qual a função de exports em um módulo?', a: 'Define quais providers ficam visíveis aos módulos que o importam.' },
    { q: 'Como o Nest descobre o que injetar?', a: 'Pelo tipo do parâmetro do construtor, usando metadados emitidos pelo TypeScript.' },
    { q: 'Por que não usar tsx para rodar um app Nest?', a: 'Ele não emite os metadados de tipos usados pela injeção de dependências.' },
    { q: 'O que o abortOnError false faz?', a: 'Faz o NestFactory lançar a exceção em vez de chamar process.exit(1).' },
    { q: 'O que um controller não deve conter?', a: 'Regra de negócio; ela pertence aos serviços.' }
  ]
},
{
  id: 'nst-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['injeção de dependências', 'providers customizados', 'escopos', 'dependência circular', 'ciclo de vida'],
  title: 'Injeção de dependências no Nest: providers customizados, escopos, ciclos e ciclo de vida',
  objectives: ['Explicar inversão de controle e injeção de dependências e seus benefícios', 'Usar useClass, useValue, useFactory, useExisting e tokens', 'Medir a diferença entre providers singleton e por requisição', 'Reconhecer dependências circulares e resolvê-las ou eliminá-las', 'Usar os eventos de ciclo de vida e o desligamento'],
  intro: R`**Injeção de dependências** (DI) é entregar a uma classe **o que ela precisa** em vez de ela **criá-lo**. O Nest tem um **contêiner** que constrói o grafo de objetos. Aqui você mede os **providers customizados**, o **escopo por requisição** (5 instâncias em 5 requisições, contra 1 singleton), o erro de **dependência circular** (**"Cannot access 'B2' before initialization"**) e a **ordem** dos eventos de ciclo de vida.`,
  theory: R`### Inversão de controle e DI
Sem DI: §class Pedidos { repo = new RepoPostgres(); }§ — acoplada, **difícil de testar** e de trocar. Com DI: §constructor(private repo: PedidosRepo) {}§: **alguém de fora** fornece o repositório (o contêiner), então nos **testes** entregamos um **falso** (aula nst-07) e em produção o real. Benefícios: **baixo acoplamento**, **testabilidade**, **configuração central**, **ciclo de vida gerenciado**.

### Tokens e formas de fornecer
O **token** identifica o provider: normalmente a **classe**; pode ser **string** ou **Symbol** (use §@Inject(TOKEN)§). Formas (medidas em um app que devolveu §{"cfg":{"porta":3000},"relogio":"falso","fabrica":"porta 3000","alias":"real"}§):
- **§useValue§**: um valor pronto (configuração, constantes, **mocks**): §{ provide: CONFIG, useValue: { porta: 3000 } }§;
- **§useClass§**: **outra classe** para o mesmo token (trocar implementação por ambiente): §{ provide: 'RELOGIO', useClass: RelogioFalso }§ → devolveu **falso**;
- **§useFactory§**: uma **função** que cria o valor, com dependências em §inject§ (pode ser **assíncrona**, ex.: abrir uma conexão): §{ provide: 'FABRICA', useFactory: (c) => 'porta ' + c.porta, inject: [CONFIG] }§;
- **§useExisting§**: **alias** de um provider existente: §{ provide: 'ALIAS', useExisting: Relogio }§ → devolveu **real** (a classe original, não a trocada).
Use **interfaces + tokens** (TypeScript apaga interfaces em tempo de execução, então o token precisa ser um **Symbol/string**) para depender de **abstrações** (princípio da inversão de dependência).

### Escopos
- **DEFAULT (singleton)**: **uma instância** por aplicação; **compartilhada** (cuidado com **estado mutável**).
- **REQUEST** (§@Injectable({ scope: Scope.REQUEST })§): **nova instância por requisição** (acesso ao objeto da requisição, contexto por usuário).
- **TRANSIENT**: **nova instância para cada consumidor**.
Medido: um app com um provider singleton e um por requisição, após **5 requisições**: **1** instância do singleton e **5** do por requisição. **Custo**: o escopo de requisição **"contagia"** os que dependem dele (o controller também vira por requisição), **cria objetos a cada chamada** e **reduz o desempenho**. Prefira **singletons stateless** e passe o **contexto** como argumento (ou use **AsyncLocalStorage**/*nestjs-cls* para contexto por requisição, **não executado** aqui).

### Dependências circulares
Quando **A depende de B e B de A**: é quase sempre um **sinal de design** (responsabilidades mal divididas). Medido: duas classes que se injetam mutuamente pelo tipo, no mesmo arquivo, falharam já no **carregamento** com **"ReferenceError: Cannot access 'B2' before initialization"** (o metadado §design:paramtypes§ referencia a classe antes de existir); em projetos reais, com arquivos separados, o sintoma costuma ser o parâmetro **§undefined§** e o erro **"Nest can't resolve dependencies of the A (?)"** (descrito na documentação; **não reproduzido** com arquivos separados aqui). Soluções:
1. **Reprojetar**: extrair um **terceiro serviço** com o que ambos precisam, ou usar **eventos** (§@nestjs/event-emitter§, **não executado**);
2. **§forwardRef(() => B)§** nos dois lados com §@Inject(forwardRef(() => B))§: medido, **resolveu** (as duas instâncias ficaram preenchidas). É **paliativo**: deixa o acoplamento.
Entre módulos: §imports: [forwardRef(() => OutroModule)]§.

### Ciclo de vida e desligamento
Hooks (interfaces §OnModuleInit§ etc.). Ordem medida, com §app.enableShutdownHooks()§ e §app.close()§:
**onModuleInit → onApplicationBootstrap → onModuleDestroy → beforeApplicationShutdown → onApplicationShutdown**.
- §onModuleInit§: depois de resolver as dependências do módulo (abrir conexões, aquecer cache);
- §onApplicationBootstrap§: **todos** os módulos prontos, antes de escutar;
- §onModuleDestroy§/§beforeApplicationShutdown§/§onApplicationShutdown§: **encerrar** com ordem (parar de aceitar, fechar pool, esvaziar filas). Com §enableShutdownHooks()§, o Nest **escuta SIGTERM/SIGINT** e dispara a sequência (equivale ao **desligamento ordenado** da aula nex-07; o argumento do hook traz o **sinal**).
Se um provider **assíncrono** (§useFactory§ com §async§) falha, o app **não sobe**: bom para **falhar rápido**.

### Boas práticas de DI
- **Depender de abstrações** (tokens/interfaces) nas fronteiras (repositórios, clientes externos);
- **Construtores simples**: sem lógica, sem I/O;
- **Poucos parâmetros** (muitas dependências = classe com muitas responsabilidades);
- **Singletons sem estado** compartilhado mutável;
- Evitar **service locator** (§moduleRef.get()§ por todo lado): esconde dependências;
- **Registrar** providers só onde são usados (módulos coesos).`,
  concepts: [
    { term: 'Injeção de dependências', def: 'Técnica em que as dependências de uma classe são fornecidas de fora, em vez de criadas por ela.' },
    { term: 'Inversão de controle', def: 'Princípio em que o framework chama o seu código e controla a criação dos objetos.' },
    { term: 'Token de injeção', def: 'Identificador de um provider: classe, string ou Symbol.' },
    { term: 'useFactory', def: 'Forma de provider que cria o valor com uma função, possivelmente assíncrona.' },
    { term: 'useExisting', def: 'Provider que cria um alias para outro já existente.' },
    { term: 'Escopo REQUEST', def: 'Faz o Nest criar uma instância nova do provider para cada requisição.' },
    { term: 'Singleton', def: 'Instância única compartilhada durante toda a vida da aplicação.' },
    { term: 'forwardRef', def: 'Referência adiada usada para resolver dependências circulares.' },
    { term: 'Hook de ciclo de vida', def: 'Método chamado em momentos específicos da inicialização e do encerramento.' },
    { term: 'enableShutdownHooks', def: 'Habilita a escuta de sinais do sistema para disparar o desligamento do app.' }
  ],
  examples: R`**Analogia:** a DI é o **restaurante em que o cozinheiro não vai ao mercado**: ele **pede** ao fornecedor (o contêiner) o que precisa; no teste, entrega-se **ingredientes de brinquedo** sem mudar a receita. O **singleton** é **uma panela compartilhada pela cozinha**; o **escopo de requisição**, **uma panela nova para cada pedido** — ótimo para pratos únicos, mas **lava-se muita louça**. A **dependência circular** é **dois cozinheiros cada um esperando o outro entregar o ingrediente primeiro**.

**Exemplo 1: formas.** useClass trocou a implementação (falso); useExisting manteve a original (real).

**Exemplo 2: escopos.** 1 singleton e 5 instâncias por requisição em 5 requisições.

**Exemplo 3: ciclo de vida.** onModuleInit → onApplicationBootstrap → onModuleDestroy → beforeApplicationShutdown → onApplicationShutdown.`,
  code: [
    { title: 'Providers customizados (TypeScript, saída medida)', lang: 'ts', code: R`const CONFIG = Symbol('CONFIG');
@Injectable() class Relogio { agora() { return 'real'; } }
class RelogioFalso { agora() { return 'falso'; } }

@Controller('c') class CCtrl {
  constructor(@Inject(CONFIG) private cfg: { porta: number }, @Inject('RELOGIO') private r: Relogio,
              @Inject('FABRICA') private fab: string, @Inject('ALIAS') private alias: Relogio) {}
  @Get() g() { return { cfg: this.cfg, relogio: this.r.agora(), fabrica: this.fab, alias: this.alias.agora() }; }
}
@Module({ controllers: [CCtrl], providers: [
  { provide: CONFIG, useValue: { porta: 3000 } },
  Relogio, { provide: 'RELOGIO', useClass: RelogioFalso },
  { provide: 'FABRICA', useFactory: (c: { porta: number }) => 'porta ' + c.porta, inject: [CONFIG] },
  { provide: 'ALIAS', useExisting: Relogio }
] }) class AppCustom {}
// {"cfg":{"porta":3000},"relogio":"falso","fabrica":"porta 3000","alias":"real"}`, notes: [{ l: '1', t: 'Symbol evita colisão de tokens.' }, { l: '13', t: 'useFactory pode ser assíncrono e receber dependências.' }] },
    { title: 'Escopos e ciclo de vida (TypeScript, saídas medidas)', lang: 'ts', code: R`let criadosSingleton = 0, criadosRequest = 0;
@Injectable() class Unico { constructor() { criadosSingleton++; } }
@Injectable({ scope: Scope.REQUEST }) class PorRequisicao { constructor() { criadosRequest++; } }
@Controller('s') class SCtrl { constructor(private u: Unico, private r: PorRequisicao) {} @Get() g() { return 'ok'; } }
// 5 requisições: instâncias singleton 1 | por requisição 5

@Injectable() class Ciclo {
  onModuleInit() { ordem.push('onModuleInit'); }
  onApplicationBootstrap() { ordem.push('onApplicationBootstrap'); }
  onModuleDestroy() { ordem.push('onModuleDestroy'); }
  beforeApplicationShutdown(s?: string) { ordem.push('beforeApplicationShutdown(' + s + ')'); }
  onApplicationShutdown(s?: string) { ordem.push('onApplicationShutdown(' + s + ')'); }
}
app.enableShutdownHooks(); await app.listen(0); await app.close();
// onModuleInit -> onApplicationBootstrap -> onModuleDestroy -> beforeApplicationShutdown -> onApplicationShutdown`, notes: [{ l: '3', t: 'O escopo de requisição cria uma instância por chamada.' }, { l: '14', t: 'enableShutdownHooks escuta SIGTERM e SIGINT.' }] },
    { title: 'Dependência circular (TypeScript, erros medidos)', lang: 'ts', code: R`// sem forwardRef (mesmo arquivo): ReferenceError: Cannot access 'B2' before initialization
@Injectable() class A2 { constructor(public b: B2) {} }
@Injectable() class B2 { constructor(public a: A2) {} }

// com forwardRef: resolvido
@Injectable() class A { constructor(@Inject(forwardRef(() => B)) public b: any) {} }
@Injectable() class B { constructor(@Inject(forwardRef(() => A)) public a: any) {} }
// melhor: extrair um terceiro serviço ou usar eventos`, notes: [{ l: '2', t: 'O metadado referencia B2 antes de ele existir.' }, { l: '6', t: 'forwardRef adia a resolução, mas mantém o acoplamento.' }] }
  ],
  bestPractices: ['Dependa de abstrações (tokens) nas fronteiras e troque implementações por useClass.', 'Prefira singletons sem estado e passe o contexto por argumento.', 'Evite o escopo de requisição, que contagia e custa desempenho.', 'Trate dependências circulares como sinal de design e reprojete antes de usar forwardRef.', 'Use onModuleInit para preparar recursos e os hooks de shutdown para liberá-los.', 'Mantenha construtores simples e sem I/O.'],
  mistakes: ['Guardar estado de requisição em um singleton.', 'Usar escopo de requisição sem necessidade.', 'Resolver ciclos sempre com forwardRef.', 'Abusar de moduleRef.get como service locator.', 'Fazer I/O no construtor.', 'Esquecer enableShutdownHooks e não liberar recursos ao receber SIGTERM.'],
  market: R`Entender DI, escopos e ciclo de vida é central em entrevistas de Nest, Spring e Angular, e é o que torna o código testável e substituível.`,
  summary: R`O contêiner do Nest entrega as dependências: useValue, useClass, useFactory e useExisting definem como cada token é fornecido (medido: useClass trocou a implementação; useExisting manteve a original). O escopo REQUEST criou 5 instâncias em 5 requisições contra 1 do singleton, com custo. A dependência circular falhou no carregamento (ReferenceError) e forwardRef a resolveu, mas o melhor é reprojetar. O ciclo de vida seguiu onModuleInit → onApplicationBootstrap → onModuleDestroy → beforeApplicationShutdown → onApplicationShutdown.`,
  refs: [REF.nestCustomProviders, REF.nestScopes, REF.nestCircular, REF.nestLifecycle],
  cards: [
    { q: 'Qual a diferença entre useClass e useExisting?', a: 'useClass instancia outra classe para o token; useExisting cria um alias para um provider já existente.' },
    { q: 'Quantas instâncias de um provider REQUEST após 5 requisições?', a: 'Cinco (medido), contra uma do singleton.' },
    { q: 'O que sinaliza uma dependência circular?', a: 'Um problema de design; a solução ideal é extrair um terceiro serviço ou usar eventos.' },
    { q: 'Qual a ordem dos hooks no encerramento?', a: 'onModuleDestroy, beforeApplicationShutdown e onApplicationShutdown.' },
    { q: 'Por que usar tokens em vez de interfaces?', a: 'Porque o TypeScript apaga interfaces em tempo de execução; é preciso um Symbol ou string.' }
  ]
},
{
  id: 'nst-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['pipes', 'validação', 'class-validator', 'DTO', 'ValidationPipe', 'transformação'],
  title: 'Pipes e validação: DTOs, ValidationPipe, transformação e pipes embutidos',
  objectives: ['Explicar o papel dos pipes (transformar e validar) na linha de processamento', 'Validar corpos com DTOs, class-validator e ValidationPipe (whitelist, forbidNonWhitelisted, transform)', 'Usar ParseIntPipe, ParseUUIDPipe e DefaultValuePipe e interpretar as respostas de erro', 'Criar um pipe customizado', 'Decidir entre class-validator e esquemas como o Zod'],
  intro: R`**Pipes** rodam **antes do handler** e fazem duas coisas: **transformar** (texto → número) e **validar** (recusar entrada inválida). Com **DTOs** (classes que descrevem o corpo) e o **ValidationPipe**, o Nest valida a entrada **declarativamente**. Aqui você mede as **respostas reais**: o **400** com a lista de mensagens, a **lista branca** de campos, a conversão de §"30"§ em **número** e as mensagens dos pipes embutidos.`,
  theory: R`### Onde os pipes atuam
Pipes recebem o **argumento** do handler (§@Body()§, §@Param()§, §@Query()§) e devolvem o valor **transformado** ou **lançam** uma exceção (→ **400**). Podem ser aplicados em **parâmetro**, **método**, **controller** ou **globalmente** (§app.useGlobalPipes(...)§).

### DTO + class-validator
§§§
class CriarUsuarioDto {
  @IsString() @MinLength(3) nome!: string;
  @IsEmail() email!: string;
  @Type(() => Number) @IsInt() @Min(18) idade!: number;
  @IsOptional() @IsString() apelido?: string;
}
@Post() @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
criar(@Body() dto: CriarUsuarioDto) { ... }
§§§
O **DTO** (*Data Transfer Object*) é uma **classe** (não interface: precisa existir em tempo de execução para os metadados). As **anotações** do class-validator descrevem as regras; o **class-transformer** (§@Type§) converte tipos.

### Respostas medidas (Nest 12.6.1)
- **Válido** (§idade: "30"§ como texto, com §transform: true§ e §@Type(() => Number)§): **201**, e §typeof dto.idade§ = **number**.
- **Inválido** (§nome: "A"§, §email: "x"§, §idade: 10§): **400** com §{"message":["nome must be longer than or equal to 3 characters","email must be an email","idade must not be less than 18"],"error":"Bad Request","statusCode":400}§: **todas as violações** de uma vez.
- **Campo extra** (§admin: true§) com §forbidNonWhitelisted§: **400** §"property admin should not exist"§. Com apenas §whitelist: true§, o campo extra é **removido silenciosamente** (comportamento descrito na documentação; **não executado** aqui). A lista branca protege contra **mass assignment** (o cliente enviando §role§, §isAdmin§, §id§).
- Mensagens padrão em **inglês**: personalize com §{ message: '...' }§ nas anotações e padronize o formato com um **filtro** (aula nst-06).

### Pipes embutidos
- §ParseIntPipe§: §/u/id/abc§ → **400** §"Validation failed (numeric string is expected)"§; §/u/id/42§ → §id: 42§ do **tipo number**.
- §ParseUUIDPipe§: §/u/uuid/123§ → **400** §"Validation failed (uuid is expected)"§.
- §DefaultValuePipe§: valor padrão quando ausente: §@Query('pagina', new DefaultValuePipe(1), ParseIntPipe)§ → §/u/lista§ devolveu §{"pagina":1,"limite":10}§ e §?pagina=3&limite=5§ → §{"pagina":3,"limite":5}§.
- Também: §ParseBoolPipe§, §ParseFloatPipe§, §ParseEnumPipe§, §ParseArrayPipe§, §ParseFilePipe§.

### Opções importantes do ValidationPipe
§whitelist§, §forbidNonWhitelisted§, §transform§ (converte o payload em **instância do DTO** e tipos primitivos), §transformOptions: { enableImplicitConversion }§ (converte pelos tipos do TypeScript; **cuidado**: segundo a documentação e relatos conhecidos, converte §"false"§ em §true§ para booleanos; **não executado** aqui), §stopAtFirstError§, §disableErrorMessages§ (**produção**, se não quiser expor), §errorHttpStatusCode§ (422 em vez de 400), §exceptionFactory§ (formato próprio de erro).
**Regra**: aplique **globalmente** com §whitelist§ e §transform§ e **exceções** onde precisar.

### Validação aninhada e arrays
§@ValidateNested()§ + §@Type(() => EnderecoDto)§ para objetos; §{ each: true }§ para listas (§@IsString({ each: true })§). **Sem** §@Type§, a validação aninhada **não** ocorre. Limite o **tamanho** de arrays e textos (§@ArrayMaxSize§, §@MaxLength§).

### Pipe customizado
§§§
class MarcaPipe implements PipeTransform { transform(valor: any, meta: ArgumentMetadata) { return valor; } }
§§§
Recebe o §valor§ e os **metadados** (tipo e nome do parâmetro). Use para **normalizar** (trim, minúsculas), **converter** ids em **entidades** (§ParseUserPipe§ que busca no repositório e lança §NotFoundException§) ou aplicar **esquemas Zod**.

### class-validator ou Zod?
| | class-validator + class-transformer | Zod (com pipe próprio) |
|---|---|---|
| Estilo | decoradores em classes | esquemas como valores |
| Integração com Nest | **nativa** (ValidationPipe) | pipe customizado |
| Tipos | classe = tipo e regra | **inferência** do tipo a partir do esquema |
| Reaproveitar no front | difícil | **fácil** (mesmo esquema) |
| Custo | metadados, decoradores | menos magia |
Ambos são válidos; **mantenha um padrão** no projeto. A validação **não substitui** autorização nem regras de negócio (aula nst-04).

### Segurança
Valide **sempre no limite**; use **lista branca**; **limite** tamanhos (e o corpo, aula nex-04); não confie em §@Type§ para **sanitizar** HTML (use **escape** na saída); não devolva **detalhes internos** nas mensagens.`,
  concepts: [
    { term: 'Pipe', def: 'Componente que transforma e/ou valida um argumento antes de o handler ser executado.' },
    { term: 'DTO', def: 'Classe que descreve a forma dos dados de entrada ou saída de uma operação.' },
    { term: 'ValidationPipe', def: 'Pipe embutido que valida DTOs usando class-validator e class-transformer.' },
    { term: 'whitelist', def: 'Opção que remove do objeto as propriedades sem anotação de validação.' },
    { term: 'forbidNonWhitelisted', def: 'Opção que rejeita a requisição quando há propriedades não permitidas.' },
    { term: 'transform', def: 'Opção que converte o payload em instância do DTO e aplica conversões de tipo.' },
    { term: 'Mass assignment', def: 'Falha em que o cliente define campos que não deveria, como o papel de administrador.' },
    { term: 'ParseIntPipe', def: 'Pipe que converte um texto em número inteiro ou responde 400.' },
    { term: 'ValidateNested', def: 'Anotação que ativa a validação de um objeto aninhado.' },
    { term: 'ArgumentMetadata', def: 'Informações sobre o argumento processado por um pipe (tipo, nome e classe).' }
  ],
  examples: R`**Analogia:** o pipe é o **segurança da entrada do evento**: confere o **convite** (valida), **carimba a mão** (transforma o texto em número) e **barra quem leva algo proibido** (campo extra). O DTO é a **lista de convidados com as regras** (idade mínima, e-mail válido). A **lista branca** é "**só entra o que está na lista**": se alguém tenta entrar com um campo "admin", é barrado — sem ela, ele entraria quieto.

**Exemplo 1: validação.** Três mensagens de uma vez em um único 400.

**Exemplo 2: lista branca.** "property admin should not exist".

**Exemplo 3: conversão.** "30" → 30 (number) e ParseIntPipe para o id.`,
  code: [
    { title: 'DTO, ValidationPipe e pipes embutidos (TypeScript, respostas medidas)', lang: 'ts', code: R`class CriarUsuarioDto {
  @IsString() @MinLength(3) nome!: string;
  @IsEmail() email!: string;
  @Type(() => Number) @IsInt() @Min(18) idade!: number;
  @IsOptional() @IsString() apelido?: string;
}
@Controller('u') class UCtrl {
  @Post() @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  criar(@Body() dto: CriarUsuarioDto) { return { ok: true, tipoIdade: typeof dto.idade, dto }; }
  @Get('id/:id') porId(@Param('id', ParseIntPipe) id: number) { return { id, tipo: typeof id }; }
  @Get('lista') lista(@Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number) { return { pagina }; }
}
// POST { nome:'Ana', email:'ana@x.com', idade:'30' } -> 201, tipoIdade "number"
// POST { nome:'A', email:'x', idade:10 } -> 400, 3 mensagens
// POST { ..., admin:true } -> 400 "property admin should not exist"
// GET /u/id/abc -> 400 "Validation failed (numeric string is expected)"`, notes: [{ l: '1', t: 'O DTO é uma classe para existir em tempo de execução.' }, { l: '8', t: 'whitelist e forbidNonWhitelisted protegem contra mass assignment.' }] },
    { title: 'Validação global e pipe customizado (TypeScript)', lang: 'ts', code: R`const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, stopAtFirstError: false }));

@Injectable() class UsuarioExistePipe implements PipeTransform<string, Promise<Usuario>> {
  constructor(private repo: UsuariosRepo) {}
  async transform(id: string) {
    const u = await this.repo.buscar(Number(id));
    if (!u) throw new NotFoundException('usuário não existe');
    return u;
  }
}
// @Get(':id') obter(@Param('id', UsuarioExistePipe) usuario: Usuario) { return usuario; }`, notes: [{ l: '2', t: 'Aplicado a todas as rotas.' }, { l: '8', t: 'O pipe resolve o id em uma entidade e já devolve 404.' }] }
  ],
  bestPractices: ['Valide no limite com ValidationPipe global, whitelist e transform.', 'Use DTOs como classes com anotações.', 'Limite tamanhos de textos, listas e corpos.', 'Padronize o formato das mensagens de erro.', 'Use pipes embutidos para ids e parâmetros de consulta.', 'Mantenha um único padrão de validação no projeto.'],
  mistakes: ['Usar interface em vez de classe para o DTO.', 'Esquecer o @Type e perder a validação aninhada.', 'Não usar whitelist e permitir mass assignment.', 'Confiar em enableImplicitConversion para booleanos.', 'Devolver ao cliente mensagens que revelam a estrutura interna.', 'Achar que validar a entrada substitui autorização.'],
  market: R`Validação declarativa e proteção contra mass assignment são exigidas em revisões de segurança e aparecem em quase toda API Nest; saber configurar o ValidationPipe e conhecer alternativas (Zod) é um diferencial.`,
  summary: R`Pipes transformam e validam argumentos. Com DTOs, class-validator e ValidationPipe (whitelist, forbidNonWhitelisted, transform), medido: o corpo válido devolveu 201 com idade convertida em número; o inválido, 400 com todas as mensagens; o campo extra, 400 "property admin should not exist". ParseIntPipe, ParseUUIDPipe e DefaultValuePipe cobrem parâmetros comuns. Aplique globalmente, limite tamanhos e escolha um padrão (class-validator ou Zod).`,
  refs: [REF.nestPipes, REF.nestValidation, REF.classValidator],
  cards: [
    { q: 'Para que serve whitelist no ValidationPipe?', a: 'Remove (ou, com forbidNonWhitelisted, rejeita) propriedades sem anotação, evitando mass assignment.' },
    { q: 'Por que o DTO é uma classe?', a: 'Para existir em tempo de execução e carregar os metadados de validação.' },
    { q: 'O que o ParseIntPipe devolve para "abc"?', a: '400 com "Validation failed (numeric string is expected)" (medido).' },
    { q: 'Para que serve @Type(() => Number)?', a: 'Converte o valor para número antes da validação (com transform).' },
    { q: 'class-validator ou Zod?', a: 'Ambos servem; class-validator é nativo no Nest e Zod infere tipos e reaproveita esquemas; mantenha um padrão.' }
  ]
}
];
