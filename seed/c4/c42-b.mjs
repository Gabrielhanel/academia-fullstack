// C4.2 — NestJS. Aulas 4 a 6 (guards e a linha de processamento; interceptors; exception filters).
import { REF } from './c42-a.mjs';
const R = String.raw;

export const REF2 = {
  nestGuards: { title: 'NestJS — Guards', url: 'https://docs.nestjs.com/guards', kind: 'doc' },
  nestInterceptors: { title: 'NestJS — Interceptors', url: 'https://docs.nestjs.com/interceptors', kind: 'doc' },
  nestFilters: { title: 'NestJS — Exception filters', url: 'https://docs.nestjs.com/exception-filters', kind: 'doc' },
  nestLifecycleReq: { title: 'NestJS — Request lifecycle', url: 'https://docs.nestjs.com/faq/request-lifecycle', kind: 'doc' },
  nestExecContext: { title: 'NestJS — Execution context', url: 'https://docs.nestjs.com/fundamentals/execution-context', kind: 'doc' },
  nestCustomDecorators: { title: 'NestJS — Custom route decorators', url: 'https://docs.nestjs.com/custom-decorators', kind: 'doc' },
  rxjs: { title: 'RxJS — Overview', url: 'https://rxjs.dev/guide/overview', kind: 'doc' },
  rfc9457: { title: 'RFC 9457 — Problem Details for HTTP APIs', url: 'https://www.rfc-editor.org/rfc/rfc9457', kind: 'especificação' },
  owaspAuthz: { title: 'OWASP — Authorization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'nst-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['guards', 'autorização', 'Reflector', 'metadados', 'ordem de execução', 'ciclo da requisição'],
  title: 'Guards: autorização por metadados e a ordem da linha de processamento do Nest',
  objectives: ['Escrever um guard (CanActivate) e aplicá-lo em método, controller e globalmente', 'Usar SetMetadata e Reflector para papéis e decoradores personalizados', 'Reconhecer que um guard que devolve false produz 403 e distinguir autenticação (401) de autorização (403)', 'Descrever e medir a ordem: guard, interceptor, pipe, handler, interceptor, filtro', 'Aplicar princípios de autorização segura (negar por padrão)'],
  intro: R`Um **guard** decide se a requisição **pode prosseguir** para o handler. É o lugar certo para **autorização**: papéis, permissões, propriedade do recurso. Diferente de um middleware do Express, o guard conhece o **contexto de execução** (qual controller e método serão chamados) e lê **metadados** do decorador. Aqui você mede o **403** do guard e a **ordem real** de execução dos componentes da linha de processamento.`,
  theory: R`### O que é um guard
§§§
@Injectable()
class PapelGuard implements CanActivate {
  constructor(private r: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const exigidos = this.r.get<string[]>('papeis', ctx.getHandler());
    if (!exigidos) return true;                                   // rota sem restrição
    const papel = ctx.switchToHttp().getRequest().headers['x-papel'];
    return !!papel && exigidos.includes(String(papel));            // false => 403
  }
}
§§§
O método §canActivate§ devolve **boolean**, **Promise** ou **Observable**. Se for §false§ (ou lançar §ForbiddenException§/§UnauthorizedException§), o Nest **interrompe** a requisição. Guards têm **acesso ao ExecutionContext** (§getHandler()§, §getClass()§, §switchToHttp()§), o que os torna **independentes do transporte** (HTTP, WebSocket, microsserviço).

### Aplicar
- No método/controller: §@UseGuards(PapelGuard)§;
- **Globalmente**: §app.useGlobalGuards(...)§ — mas, segundo a documentação, **guards globais registrados fora de um módulo não recebem injeção**; use o provider §{ provide: APP_GUARD, useClass: PapelGuard }§ para ter DI;
- **Padrão seguro**: **guard global que nega por padrão**, e um decorador §@Public()§ para **liberar** rotas abertas (login, saúde) — assim **esquecer** de proteger uma rota é impossível.

### Metadados e decoradores personalizados
§§§
export const Papeis = (...p: string[]) => SetMetadata('papeis', p);
@Get('admin') @Papeis('admin') @UseGuards(PapelGuard) admin() { ... }
§§§
§SetMetadata§ anexa dados ao handler; o §Reflector§ os lê no guard. Combine decoradores com §applyDecorators()§ (por exemplo, §@Autorizado('admin')§ que aplica o guard e o metadado) e crie **decoradores de parâmetro** (§@UsuarioAtual()§) com §createParamDecorator§.

### Medido: 403 e papéis (rota §/u/admin§)
- **sem cabeçalho de papel**: **403** §{"message":"Forbidden resource","error":"Forbidden","statusCode":403}§;
- **papel §user§**: **403** (mesma mensagem);
- **papel §admin§**: **200** §área admin§.
**Atenção ao significado dos status**: **401** (*Unauthorized*) = **não autenticado** (ninguém sabe quem você é); **403** (*Forbidden*) = **autenticado, mas sem permissão**. O guard que devolve §false§ gera **403**; para **401**, lance §UnauthorizedException§ no guard de autenticação (curso C4.4).
**Importante**: o cabeçalho §x-papel§ do exemplo é **didático e inseguro**: em produção, o papel vem de uma **identidade verificada** (token assinado, sessão), nunca de um cabeçalho que o cliente controla.

### A linha de processamento do Nest (medida)
Ordem documentada em "Request lifecycle": **middleware → guards → interceptors (antes) → pipes → handler → interceptors (depois) → filtros de exceção** (e a resposta). Medido em uma rota com um guard, um interceptor e um pipe:
**guard → interceptor:antes → pipe → handler → interceptor:depois**.
Ordem **dentro de cada tipo**: **globais → controller → método** (e, para o retorno de interceptors, a ordem **inversa**). Um erro em qualquer etapa vai para os **filtros** (aula nst-06).
**O que fazer em cada etapa**:
| Etapa | Responsabilidade |
|---|---|
| Middleware | coisas **independentes do Nest** (CORS, parsers, request id) |
| Guard | **autorização** (pode?) |
| Interceptor | **antes/depois**: log, métricas, cache, transformar resposta, timeout |
| Pipe | **validar e transformar** argumentos |
| Handler | **delegar** ao serviço |
| Filtro | **traduzir exceções** em respostas |

### Autorização segura
- **Negar por padrão**; liberar explicitamente.
- **Verifique a propriedade do recurso** (um usuário só edita **o seu** pedido): papel não basta (**IDOR**/*broken object level authorization*, no topo do OWASP API Security); faça no **serviço** (com o usuário) ou em um guard que **carrega o recurso**.
- **Não confie em dados do cliente** (cabeçalhos, campos do corpo) para decidir permissão.
- **RBAC** (papéis) é simples; **ABAC/políticas** (atributos: dono, departamento, horário) escalam melhor — curso C4.4. Bibliotecas como **CASL** ajudam (**não executado** aqui).
- **Teste** as regras: matriz **papel × rota × resultado**.

### Guards e microsserviços/WebSockets
Como usam o ExecutionContext, os guards funcionam em **gateways** e **handlers de mensagens**; o §switchToHttp()§ vira §switchToWs()§ ou §switchToRpc()§.`,
  concepts: [
    { term: 'Guard', def: 'Componente que decide se uma requisição pode chegar ao handler.' },
    { term: 'CanActivate', def: 'Interface de um guard, com o método canActivate que devolve um valor booleano.' },
    { term: 'ExecutionContext', def: 'Objeto com informações sobre o handler, a classe e o transporte da execução atual.' },
    { term: 'Reflector', def: 'Utilitário que lê os metadados anexados a classes e métodos.' },
    { term: 'SetMetadata', def: 'Função que anexa dados personalizados a um handler ou controller.' },
    { term: 'APP_GUARD', def: 'Token para registrar um guard global com suporte à injeção de dependências.' },
    { term: '401 x 403', def: '401 indica não autenticado; 403 indica autenticado sem permissão.' },
    { term: 'IDOR/BOLA', def: 'Falha em que um usuário acessa o recurso de outro por não haver verificação de propriedade.' },
    { term: 'Negar por padrão', def: 'Política em que tudo é protegido, e a abertura é explícita.' },
    { term: 'Linha de processamento', def: 'Sequência de middleware, guards, interceptors, pipes, handler e filtros que processa uma requisição.' }
  ],
  examples: R`**Analogia:** o guard é o **porteiro do prédio**: antes de o visitante chegar ao andar (handler), ele consulta a **lista do andar** (metadados) e a **identidade** do visitante. **401** é "**quem é você?**"; **403** é "**você é o fulano, mas não está nesta lista**". O melhor porteiro **barra todo mundo por padrão** e só libera quem está explicitamente autorizado. A **linha de processamento** é o **caminho do visitante**: portaria (middleware) → porteiro (guard) → câmeras (interceptor) → detector de metais (pipe) → andar (handler) → câmeras de novo na saída → ouvidoria para problemas (filtro).

**Exemplo 1: papéis.** Sem papel e papel user: 403; admin: 200.

**Exemplo 2: ordem.** guard → interceptor:antes → pipe → handler → interceptor:depois.

**Exemplo 3: negar por padrão.** Guard global + @Public() nas rotas abertas.`,
  code: [
    { title: 'Guard de papéis com metadados (TypeScript, respostas medidas)', lang: 'ts', code: R`const Papeis = (...p: string[]) => SetMetadata('papeis', p);

@Injectable() class PapelGuard implements CanActivate {
  constructor(private r: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const exigidos = this.r.get<string[]>('papeis', ctx.getHandler());
    if (!exigidos) return true;
    const papel = ctx.switchToHttp().getRequest().headers['x-papel'];     // didático: em produção vem do token
    return !!papel && exigidos.includes(String(papel));
  }
}
@Controller('u') class UCtrl {
  @Get('admin') @Papeis('admin') @UseGuards(PapelGuard) admin() { return 'área admin'; }
}
// sem papel: 403 | papel user: 403 | papel admin: 200 "área admin"`, notes: [{ l: '8', t: 'O papel deve vir de uma identidade verificada, nunca de um cabeçalho livre.' }, { l: '13', t: 'Metadado e guard aplicados ao mesmo método.' }] },
    { title: 'Guard global que nega por padrão (TypeScript)', lang: 'ts', code: R`export const PUBLICA = 'publica';
export const Publica = () => SetMetadata(PUBLICA, true);

@Injectable() class AutenticadoGuard implements CanActivate {
  constructor(private r: Reflector, private tokens: TokenService) {}
  async canActivate(ctx: ExecutionContext) {
    if (this.r.getAllAndOverride<boolean>(PUBLICA, [ctx.getHandler(), ctx.getClass()])) return true;
    const req = ctx.switchToHttp().getRequest();
    const usuario = await this.tokens.verificar(req.headers.authorization);   // lança UnauthorizedException (401)
    req.usuario = usuario;
    return true;
  }
}
@Module({ providers: [{ provide: APP_GUARD, useClass: AutenticadoGuard }] }) class SegurancaModule {}`, notes: [{ l: '7', t: 'getAllAndOverride lê o metadado no método ou na classe.' }, { l: '15', t: 'APP_GUARD permite guard global com injeção de dependências.' }] },
    { title: 'Ordem da linha de processamento (TypeScript, saída medida)', lang: 'ts', code: R`@Get('ordem') @UseGuards(PapelGuard) @UseInterceptors(LogInterceptor) @UsePipes(MarcaPipe)
ordem(@Query('x') x: string) { marca('handler'); return 'ok'; }
// trilha: guard -> interceptor:antes -> pipe -> handler -> interceptor:depois`, notes: [{ l: '3', t: 'Confere a ordem documentada no ciclo da requisição.' }] }
  ],
  bestPractices: ['Autorize em guards e verifique a propriedade do recurso no serviço.', 'Use um guard global que nega por padrão e um decorador @Public.', 'Obtenha papéis de uma identidade verificada, nunca de cabeçalhos do cliente.', 'Use 401 para não autenticado e 403 para sem permissão.', 'Teste a matriz papel × rota × resultado.', 'Registre guards globais com APP_GUARD para ter injeção.'],
  mistakes: ['Confiar em um cabeçalho ou campo do corpo para decidir permissões.', 'Esquecer de proteger uma rota nova em um sistema que libera por padrão.', 'Checar só o papel e esquecer o dono do recurso.', 'Confundir 401 e 403.', 'Usar useGlobalGuards e perder a injeção de dependências.', 'Colocar lógica de negócio dentro do guard.'],
  market: R`Falhas de autorização (BOLA/IDOR) lideram o OWASP API Security; saber construir guards que negam por padrão e verificar a propriedade do recurso é uma das habilidades mais cobradas em revisões de segurança.`,
  summary: R`Guards decidem se a requisição prossegue, lendo metadados com o Reflector. Medido: sem papel e com papel user a rota admin devolveu 403 "Forbidden resource"; com admin, 200. A linha de processamento seguiu guard → interceptor:antes → pipe → handler → interceptor:depois. Negue por padrão (APP_GUARD + @Public), diferencie 401 de 403, obtenha papéis de identidades verificadas e verifique a propriedade do recurso.`,
  refs: [REF2.nestGuards, REF2.nestLifecycleReq, REF2.nestExecContext, REF2.nestCustomDecorators, REF2.owaspAuthz],
  cards: [
    { q: 'O que acontece quando canActivate devolve false?', a: 'O Nest interrompe a requisição com 403 (medido: "Forbidden resource").' },
    { q: 'Qual a diferença entre 401 e 403?', a: '401 não autenticado; 403 autenticado sem permissão.' },
    { q: 'Qual a ordem entre guard, interceptor e pipe?', a: 'Guard, interceptor (antes), pipe, handler, interceptor (depois), filtro em erros.' },
    { q: 'Como registrar um guard global com injeção?', a: 'Com o provider APP_GUARD em um módulo.' },
    { q: 'Por que verificar o dono do recurso?', a: 'Porque o papel não impede que um usuário acesse o recurso de outro (IDOR/BOLA).' }
  ]
},
{
  id: 'nst-05', moduleId: 'm2', order: 5, minutes: 75, tags: ['interceptors', 'RxJS', 'logging', 'timeout', 'transformação de resposta', 'cache'],
  title: 'Interceptors: antes e depois do handler, transformação de resposta, timeout e cache',
  objectives: ['Explicar o interceptor como uma função em volta do handler baseada em RxJS', 'Escrever interceptors de log, de envelope de resposta e de timeout', 'Usar os operadores tap, map, timeout e catchError', 'Reconhecer o custo e os limites do timeout (não cancela o trabalho do handler)', 'Escolher entre middleware, guard, interceptor e pipe'],
  intro: R`O **interceptor** "embrulha" o handler: roda código **antes** e **depois**, pode **transformar a resposta**, **tratar erros**, **medir tempo** e até **curto-circuitar** a chamada (cache). Ele é baseado em **RxJS** (§next.handle()§ devolve um **Observable**). Aqui você mede o **envelope** da resposta, o **timeout de 100 ms** (resposta **408** em ~110 ms para uma rota de 400 ms) e vê o limite dessa técnica.`,
  theory: R`### Anatomia
§§§
@Injectable()
class LogInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const t0 = Date.now();
    return next.handle().pipe(tap(() => console.log(ctx.getHandler().name, Date.now() - t0, 'ms')));
  }
}
§§§
- Código **antes** de §next.handle()§ roda **antes** do handler;
- §next.handle()§ **invoca** o handler (e os próximos interceptors) e devolve um **Observable** com o resultado;
- Operadores RxJS no §.pipe(...)§ rodam **depois**: §tap§ (efeito colateral, sem alterar), §map§ (transforma), §catchError§ (trata erro), §timeout§ (limite).
- **Não** chamar §next.handle()§ **impede** o handler de executar (ex.: devolver §of(valorDoCache)§).
Aplicação: §@UseInterceptors(...)§ (método/controller) ou §APP_INTERCEPTOR§ / §useGlobalInterceptors§.

### Transformar a resposta (envelope)
§map((dados) => ({ dados }))§. Medido: §/u/envelope§ devolveu §{"dados":{"n":1}}§ (o handler retornou §{ n: 1 }§). Útil para **padronizar** o formato de saída (§{ dados, meta }§) ou **remover campos** sensíveis (com **class-transformer**: §ClassSerializerInterceptor§ e §@Exclude()§, **não executado** aqui).

### Timeout
§timeout(100)§ lança §TimeoutError§ se o Observable **não emitir em 100 ms**; capturamos e convertemos em §RequestTimeoutException§. Medido: uma rota que demora **400 ms** respondeu **408** §{"message":"tempo esgotado","error":"Request Timeout","statusCode":408}§ em **~110 ms**.
**Limites importantes**:
- O timeout **abandona a espera**, **não cancela** o trabalho do handler: a consulta ou o laço **continuam** executando (consomem recursos até terminarem); para cancelar de verdade, use **AbortSignal** nas chamadas (§fetch§, drivers) e **timeouts nas dependências** (banco, HTTP externo);
- Um handler **síncrono e pesado** não é interrompido: bloqueia o loop (aula nex-01);
- Defina o **timeout global** menor que o do **proxy/balanceador**, e **timeouts menores** nas dependências.

### Outras aplicações
- **Cache**: se a chave existe, devolva §of(valor)§ **sem** chamar o handler (o §CacheInterceptor§ do Nest faz isso; veja o curso C3.8 sobre invalidação e stampede);
- **Métricas**: contar requisições e medir latência (curso C4.6);
- **Correlação**: ler o §x-request-id§ e propagar para o contexto de log;
- **Tratamento de erros**: §catchError§ para converter erros de **bibliotecas** em exceções HTTP;
- **Auditoria**: registrar quem fez o quê **depois** do sucesso;
- **Serialização**: ocultar campos.

### RxJS em dez linhas
Um **Observable** emite **valores ao longo do tempo** e **completa** ou **falha**; operadores (§map§, §tap§, §timeout§, §catchError§, §switchMap§) o transformam; §firstValueFrom(obs)§ converte em promise (útil nos testes e clientes). Em HTTP, o Observable emite **uma vez**.

### Qual componente usar?
| Necessidade | Componente |
|---|---|
| CORS, parsers, id da requisição, tudo independente do Nest | **Middleware** |
| Pode ou não pode? | **Guard** |
| Algo antes e depois, transformar resposta, timeout, cache | **Interceptor** |
| Validar/transformar um argumento | **Pipe** |
| Traduzir exceções | **Filtro** |
Evite **lógica de negócio** em interceptors; eles são **transversais**.

### Custos e cuidados
- Cada interceptor adiciona **camadas de Observable**: o custo é pequeno, mas **cadeias longas** dificultam depuração;
- **Ordem** importa: segundo a documentação, na ida os interceptors seguem **global → controller → método** e na volta a ordem é **inversa** (**não executado** com vários interceptors aqui);
- **Interceptors** podem acessar a **resposta HTTP** (§switchToHttp().getResponse()§) para cabeçalhos;
- **Streams** e **arquivos** devolvidos (§StreamableFile§) pedem cuidado ao transformar.`,
  concepts: [
    { term: 'Interceptor', def: 'Componente que envolve o handler e executa lógica antes e depois dele, usando RxJS.' },
    { term: 'CallHandler', def: 'Objeto cujo handle() invoca o handler e devolve um Observable com o resultado.' },
    { term: 'Observable', def: 'Fluxo de valores ao longo do tempo que pode completar ou falhar.' },
    { term: 'tap', def: 'Operador do RxJS que executa um efeito colateral sem alterar o valor.' },
    { term: 'map (RxJS)', def: 'Operador que transforma cada valor emitido.' },
    { term: 'timeout (RxJS)', def: 'Operador que falha se o Observable não emitir dentro do prazo.' },
    { term: 'Envelope de resposta', def: 'Formato padrão que embrulha os dados retornados, como { dados, meta }.' },
    { term: 'APP_INTERCEPTOR', def: 'Token para registrar um interceptor global com injeção de dependências.' },
    { term: 'AbortSignal', def: 'Mecanismo para cancelar operações assíncronas, como chamadas fetch.' },
    { term: 'Curto-circuito', def: 'Responder sem chamar o handler, como em uma resposta vinda do cache.' }
  ],
  examples: R`**Analogia:** o interceptor é o **fotógrafo do evento** que registra **a entrada e a saída** de cada convidado, pode **embrulhar o presente** (envelope) e, se o convidado demorar demais no corredor, **lacra a porta** com um aviso de tempo esgotado — mas **quem já está lá dentro continua** ocupando a sala (o timeout não cancela o trabalho). Com cache, ele **entrega o presente que já estava embrulhado**, sem chamar o fornecedor.

**Exemplo 1: envelope.** {"n":1} virou {"dados":{"n":1}}.

**Exemplo 2: timeout.** Rota de 400 ms: 408 em ~110 ms.

**Exemplo 3: cache.** Devolver of(valor) sem chamar o handler.`,
  code: [
    { title: 'Interceptors de log, envelope e timeout (TypeScript, RxJS; respostas medidas)', lang: 'ts', code: R`@Injectable() class LogInterceptor implements NestInterceptor {
  intercept(_c: ExecutionContext, next: CallHandler): Observable<any> {
    marca('interceptor:antes');
    return next.handle().pipe(tap(() => marca('interceptor:depois')));
  }
}
@Injectable() class EnvelopeInterceptor implements NestInterceptor {
  intercept(_c: ExecutionContext, next: CallHandler) { return next.handle().pipe(map((d) => ({ dados: d }))); }
}
@Injectable() class TimeoutInterceptor implements NestInterceptor {
  intercept(_c: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(timeout(100), catchError((e) => (e instanceof TimeoutError ? throwError(() => new RequestTimeoutException('tempo esgotado')) : throwError(() => e))));
  }
}
@Get('envelope') @UseInterceptors(EnvelopeInterceptor) env() { return { n: 1 }; }          // {"dados":{"n":1}}
@Get('lento') @UseInterceptors(TimeoutInterceptor) lento() { return of('tarde').pipe(delay(400)); }   // 408 em ~110 ms`, notes: [{ l: '4', t: 'tap observa o resultado sem alterá-lo.' }, { l: '14', t: 'timeout converte a espera longa em 408, mas não cancela o trabalho.' }] },
    { title: 'Cache por interceptor (TypeScript, esboço)', lang: 'ts', code: R`@Injectable() class CacheSimples implements NestInterceptor {
  private mapa = new Map<string, { v: any; ate: number }>();
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const chave = req.method + ' ' + req.url;
    const hit = this.mapa.get(chave);
    if (hit && hit.ate > Date.now()) return of(hit.v);                      // curto-circuito: o handler não roda
    return next.handle().pipe(tap((v) => this.mapa.set(chave, { v, ate: Date.now() + 5000 })));
  }
}`, notes: [{ l: '7', t: 'Em um acerto, o handler nem é chamado.' }, { l: '8', t: 'Na falha, o resultado é guardado por 5 segundos.' }] }
  ],
  bestPractices: ['Use interceptors para preocupações transversais, não para regra de negócio.', 'Padronize o formato da resposta com um envelope só se o ganho compensar.', 'Defina timeouts nas dependências além do timeout da rota.', 'Lembre-se de que o timeout não cancela o trabalho; use AbortSignal.', 'Registre globais com APP_INTERCEPTOR.', 'Teste a ordem dos interceptors.'],
  mistakes: ['Colocar regras de negócio em interceptors.', 'Achar que o timeout interrompe o handler.', 'Esquecer de chamar next.handle() sem querer curto-circuitar.', 'Ignorar a ordem inversa na volta.', 'Esconder erros com catchError sem relançar.', 'Cachear respostas personalizadas por usuário sem incluir o usuário na chave.'],
  market: R`Interceptors com RxJS diferenciam quem domina o Nest; timeout, log e cache transversais são requisitos comuns, e o limite do timeout (não cancela) é uma pergunta clássica.`,
  summary: R`Interceptors envolvem o handler com código antes e depois, baseados em RxJS (tap, map, timeout, catchError). Medido: o envelope devolveu {"dados":{"n":1}} e o timeout de 100 ms produziu 408 em ~110 ms para uma rota de 400 ms, sem cancelar o trabalho. Podem curto-circuitar o handler (cache). Escolha entre middleware, guard, interceptor e pipe conforme a necessidade e mantenha-os transversais.`,
  refs: [REF2.nestInterceptors, REF2.rxjs, REF2.nestLifecycleReq],
  cards: [
    { q: 'O que next.handle() devolve?', a: 'Um Observable com o resultado do handler (e dos próximos interceptors).' },
    { q: 'O timeout cancela o trabalho do handler?', a: 'Não; só abandona a espera. Para cancelar use AbortSignal e timeouts nas dependências.' },
    { q: 'Como um interceptor implementa cache?', a: 'Devolvendo of(valor) sem chamar next.handle() em um acerto.' },
    { q: 'Quando preferir middleware a interceptor?', a: 'Para o que independe do Nest, como CORS, parsers e id da requisição.' },
    { q: 'Qual a ordem na volta com vários interceptors?', a: 'Inversa à da ida.' }
  ]
},
{
  id: 'nst-06', moduleId: 'm2', order: 6, minutes: 75, tags: ['exception filters', 'HttpException', 'Problem Details', 'erros de domínio', 'catch-all'],
  title: 'Exception filters: das exceções HTTP aos erros de domínio, com formato padronizado',
  objectives: ['Usar as exceções HTTP do Nest e entender as respostas padrão', 'Escrever filtros para erros de domínio e um filtro global de erros inesperados', 'Padronizar as respostas de erro com Problem Details (RFC 9457)', 'Evitar o vazamento de informações internas', 'Combinar validação, guards e filtros em um formato de erro único'],
  intro: R`Quando algo dá errado em qualquer ponto da linha de processamento, o Nest entrega a exceção ao **exception filter**. Por padrão ele devolve um JSON simples; com filtros, você **traduz erros de domínio em status HTTP**, **padroniza o formato** e **impede vazamentos**. Aqui você mede as **respostas padrão** (404, 418, 500 genérico) e um filtro que devolve **409** em formato de **Problem Details**.`,
  theory: R`### O comportamento padrão (medido)
- §throw new NotFoundException('usuário não existe')§ → **404** §{"message":"usuário não existe","error":"Not Found","statusCode":404}§;
- §throw new HttpException({ erro: 'custom', campos: ['a'] }, HttpStatus.I_AM_A_TEAPOT)§ → **418** com o **objeto** como corpo (§{"erro":"custom","campos":["a"]}§);
- **Erro inesperado** (um §TypeError§ por §null.x§) → **500** §{"statusCode":500,"message":"Internal server error"}§ (**sem** stack nem mensagem original: o Nest já protege por padrão; o detalhe vai ao **log** do Nest);
- **Rota inexistente** → **404** §{"message":"Cannot GET /u/nada","error":"Not Found","statusCode":404}§;
- **Validação** (aula nst-03) → **400** com lista de mensagens; **guard** → **403**.
Exceções embutidas: §BadRequestException§, §UnauthorizedException§, §ForbiddenException§, §NotFoundException§, §ConflictException§, §UnprocessableEntityException§, §HttpException§ com o status 429 (muitas requisições), §InternalServerErrorException§, §ServiceUnavailableException§ etc.

### Erros de domínio e filtros
O **domínio** não deve conhecer HTTP: um serviço lança §ErroDominio('saldo-insuficiente')§. Um **filtro** faz a **tradução** na borda:
§§§
@Catch(ErroDominio)
class DominioFilter implements ExceptionFilter {
  catch(e: ErroDominio, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    res.status(409).json({ type: 'https://exemplo.com/erros/' + e.codigo, title: e.message, status: 409 });
  }
}
§§§
Medido: o filtro aplicado ao controller (§@UseFilters(DominioFilter)§) devolveu **409** §{"type":"https://exemplo.com/erros/saldo-insuficiente","title":"saldo insuficiente","status":409}§ e foi executado (§filtro executou: true§).
- §@Catch()§ **sem argumentos** captura **tudo** (filtro **global** de último recurso): registre com §{ provide: APP_FILTER, useClass: TudoFilter }§;
- §@Catch(HttpException)§ para **reformatar** as exceções do próprio Nest no **formato único** da API;
- Mapeamento claro: **domínio → status** em **um lugar** (um mapa §codigo → status§), não espalhado.

### Problem Details (RFC 9457)
Formato padrão para erros HTTP: §{ "type": uri, "title": texto curto, "status": número, "detail": explicação, "instance": uri }§ com §Content-Type: application/problem+json§, mais **extensões** (§errors§ por campo, §requestId§). Vantagens: **padrão conhecido** por clientes e ferramentas, **estável**, **extensível**. Padronize **todas as respostas de erro** (validação, guards, domínio, 500) em **um filtro global**.

### Não vazar informações
- O Nest já devolve **500 genérico**; mas **seu** filtro global **não deve** devolver §err.message§/§stack§ em 5xx;
- **Mensagens de validação** podem revelar a estrutura interna: mantenha **só o necessário**;
- **404 versus 403** para recursos de outros usuários: considere **404** para **não revelar a existência** (decisão de produto);
- **Logue** o erro completo no servidor com **id de requisição** e devolva o **id** ao cliente para suporte.

### Filtros e a linha de processamento
Exceções lançadas em **guards, pipes, interceptors e handlers** chegam aos filtros (medido para guard, pipe, interceptor e handler). Erros em **middlewares registrados diretamente no Express**, fora do contexto do Nest, podem seguir para o **tratador do Express** (aula nex-05): **teste** esse caminho no seu projeto (**não executado** aqui). Segundo a documentação, filtros **locais** (método/controller) têm precedência sobre os **globais**.

### Boas práticas de erros em APIs
1. **Contrato de erro** documentado (OpenAPI).
2. **Códigos estáveis** (§saldo-insuficiente§) para máquinas; mensagens para humanos.
3. **Status corretos** (400/422 validação, 401, 403, 404, 409 conflito, 429, 5xx).
4. **Idempotência** nas repetições (curso de APIs, C4.3) e **Retry-After** em 429/503.
5. **Testes** de cada caminho de erro, inclusive vazamento.`,
  concepts: [
    { term: 'Exception filter', def: 'Componente que captura exceções e define a resposta HTTP.' },
    { term: 'HttpException', def: 'Classe base das exceções HTTP do Nest, com um status e um corpo.' },
    { term: '@Catch()', def: 'Decorador que define quais exceções um filtro captura.' },
    { term: 'ArgumentsHost', def: 'Objeto que dá acesso aos argumentos do contexto em que a exceção ocorreu.' },
    { term: 'APP_FILTER', def: 'Token para registrar um filtro global com injeção de dependências.' },
    { term: 'Erro de domínio', def: 'Exceção que representa uma regra de negócio violada, independente de HTTP.' },
    { term: 'Problem Details', def: 'Formato padronizado (RFC 9457) para respostas de erro em JSON.' },
    { term: 'Filtro catch-all', def: 'Filtro com @Catch() sem argumentos que captura qualquer exceção.' },
    { term: 'Código de erro estável', def: 'Identificador textual constante de um tipo de erro, usado por clientes.' },
    { term: 'Vazamento de informação', def: 'Exposição de detalhes internos (stack, SQL, caminhos) ao cliente.' }
  ],
  examples: R`**Analogia:** o filtro é a **ouvidoria do hotel**: qualquer problema, **de qualquer setor**, chega lá e sai como uma **carta padronizada** ao hóspede (Problem Details), com um **protocolo** (id), **sem mostrar o relatório interno** de quem errou. O erro de domínio é **"saldo insuficiente"** dito na língua do negócio; a ouvidoria o traduz para o **código postal** certo (409). O **500 genérico** é a **carta de "ocorreu um imprevisto, protocolo 123"**.

**Exemplo 1: padrão.** NotFoundException → 404; TypeError → 500 genérico.

**Exemplo 2: domínio.** ErroDominio → 409 em Problem Details.

**Exemplo 3: global.** @Catch() com APP_FILTER como último recurso.`,
  code: [
    { title: 'Filtro de erro de domínio (TypeScript, respostas medidas)', lang: 'ts', code: R`class ErroDominio extends Error { constructor(public codigo: string, m: string) { super(m); } }

@Catch(ErroDominio) class DominioFilter implements ExceptionFilter {
  catch(e: ErroDominio, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    res.status(409).json({ type: 'https://exemplo.com/erros/' + e.codigo, title: e.message, status: 409 });
  }
}
@Controller('u') @UseFilters(DominioFilter) class UCtrl {
  @Get('dominio') dom() { throw new ErroDominio('saldo-insuficiente', 'saldo insuficiente'); }   // 409 Problem Details
  @Get('naoachou') nao() { throw new NotFoundException('usuário não existe'); }                    // 404 padrão
  @Get('bug') bug() { (null as any).x; }                                                           // 500 {"statusCode":500,"message":"Internal server error"}
}`, notes: [{ l: '3', t: 'O filtro captura só ErroDominio e traduz para 409.' }, { l: '11', t: 'Erros inesperados recebem 500 genérico, sem vazamento.' }] },
    { title: 'Filtro global de Problem Details (TypeScript)', lang: 'ts', code: R`@Catch() class ProblemaFilter implements ExceptionFilter {
  private readonly log = new Logger('Erros');
  catch(e: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp(); const res = http.getResponse(); const req = http.getRequest();
    const status = e instanceof HttpException ? e.getStatus() : 500;
    const corpo = e instanceof HttpException ? e.getResponse() : null;
    if (status >= 500) this.log.error({ id: req.id, erro: String((e as Error)?.message), stack: (e as Error)?.stack });
    res.status(status).type('application/problem+json').json({
      type: 'about:blank', title: status >= 500 ? 'Erro interno' : (typeof corpo === 'object' && corpo && 'message' in corpo ? (corpo as any).message : String(corpo ?? 'Erro')),
      status, instance: req.url, requestId: req.id
    });
  }
}
@Module({ providers: [{ provide: APP_FILTER, useClass: ProblemaFilter }] }) class ErrosModule {}`, notes: [{ l: '1', t: 'Sem argumentos: captura qualquer exceção.' }, { l: '7', t: 'O detalhe de erros 5xx vai só para o log.' }, { l: '14', t: 'APP_FILTER registra o filtro global com injeção.' }] }
  ],
  bestPractices: ['Mantenha o domínio livre de HTTP e traduza erros na borda com filtros.', 'Padronize todas as respostas de erro em um formato (Problem Details).', 'Nunca devolva stack ou mensagem original em 5xx.', 'Use códigos de erro estáveis e inclua o id da requisição.', 'Registre um filtro global de último recurso.', 'Teste cada caminho de erro e o vazamento.'],
  mistakes: ['Lançar HttpException a partir da camada de domínio.', 'Formatos de erro diferentes em cada rota.', 'Devolver err.message em erros inesperados.', 'Capturar tudo sem registrar o erro.', 'Usar o status 200 com um campo de erro.', 'Esquecer que erros de middleware do Express não passam pelos filtros do Nest.'],
  market: R`Padronizar o contrato de erros e evitar vazamentos é um indicador de maturidade de APIs; Problem Details e filtros globais são práticas valorizadas em revisões de arquitetura.`,
  summary: R`Os filtros de exceção traduzem erros em respostas. Medido no Nest: NotFoundException → 404; HttpException com objeto → 418 com o objeto; TypeError inesperado → 500 {"statusCode":500,"message":"Internal server error"}; um filtro de domínio devolveu 409 em formato Problem Details. Padronize em um filtro global, mantenha o domínio livre de HTTP, não vaze detalhes e registre o erro com id.`,
  refs: [REF2.nestFilters, REF2.rfc9457, REF2.nestLifecycleReq],
  cards: [
    { q: 'O que o Nest devolve para um erro inesperado?', a: '500 {"statusCode":500,"message":"Internal server error"}, sem stack (medido).' },
    { q: 'Como traduzir um erro de domínio em HTTP?', a: 'Com um exception filter com @Catch(ErroDominio) na borda da aplicação.' },
    { q: 'O que é Problem Details?', a: 'O formato padrão RFC 9457 para erros HTTP em JSON (type, title, status, detail, instance).' },
    { q: 'Como capturar qualquer exceção?', a: 'Com @Catch() sem argumentos, registrado como APP_FILTER.' },
    { q: 'Onde ficam os detalhes de um 5xx?', a: 'No log do servidor, com o id da requisição; o cliente recebe só o id.' }
  ]
}
];
