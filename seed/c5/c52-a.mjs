// C5.2 — Design Patterns. Aulas 1 e 2 (padrões criacionais; padrões estruturais).
const R = String.raw;

export const REF = {
  gof: { title: 'Design Patterns: Elements of Reusable Object-Oriented Software (Gamma, Helm, Johnson, Vlissides)', url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610', kind: 'livro' },
  guruCatalog: { title: 'Refactoring.Guru — Catálogo de padrões de projeto', url: 'https://refactoring.guru/design-patterns/catalog', kind: 'guia' },
  guruSingleton: { title: 'Refactoring.Guru — Singleton', url: 'https://refactoring.guru/design-patterns/singleton', kind: 'guia' },
  guruBuilder: { title: 'Refactoring.Guru — Builder', url: 'https://refactoring.guru/design-patterns/builder', kind: 'guia' },
  guruFactory: { title: 'Refactoring.Guru — Factory Method', url: 'https://refactoring.guru/design-patterns/factory-method', kind: 'guia' },
  guruDecorator: { title: 'Refactoring.Guru — Decorator', url: 'https://refactoring.guru/design-patterns/decorator', kind: 'guia' },
  guruAdapter: { title: 'Refactoring.Guru — Adapter', url: 'https://refactoring.guru/design-patterns/adapter', kind: 'guia' },
  mdnProxy: { title: 'MDN — Proxy', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy', kind: 'doc' },
  mdnPrivate: { title: 'MDN — Private elements (#)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements', kind: 'doc' },
  nodeModulesCache: { title: 'Node.js — Modules: caching', url: 'https://nodejs.org/api/modules.html#caching', kind: 'doc' },
  nodeTest: { title: 'Node.js — Test runner', url: 'https://nodejs.org/api/test.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'pat-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['design patterns', 'Factory', 'Builder', 'Singleton', 'padrões criacionais'],
  title: 'Padrões criacionais: Factory, Builder e Singleton (e por que o Singleton é o mais perigoso)',
  objectives: ['Explicar o que é um padrão de projeto, qual problema resolve e seu custo', 'Aplicar Factory (tabela de construtores) e Builder (campos privados e encadeamento) em JavaScript', 'Reconhecer o Singleton de módulo no Node.js e o acoplamento por estado global que ele cria nos testes', 'Escolher a alternativa mais simples (função, objeto literal, parâmetro) antes do padrão', 'Ler a catalogação do GoF (criacional, estrutural e comportamental) e saber consultá-la', 'Testar os padrões com o test runner do Node'],
  intro: R`**Padrões de projeto** são **soluções recorrentes** para problemas de design, descritas com **nome**, **problema**, **solução** e **consequências**. O valor principal é **vocabulário comum** ("isso é um Decorator"), não código para copiar. Nesta aula, os três criacionais que mais aparecem em JavaScript. No laboratório (Node 26.13.1, sem dependências) o **Singleton de módulo** mostrou o risco: o segundo teste só passou porque **herdou o estado** do primeiro (contador 3), enquanto instâncias criadas por teste valem **1** sempre.`,
  theory: R`### O que são padrões (e o que não são)
O livro do "Gang of Four" (GoF, 1994) catalogou **23 padrões** em três grupos: **criacionais** (como criar objetos), **estruturais** (como compor) e **comportamentais** (como interagir). São **descrições de soluções**, **não bibliotecas**. Cada padrão traz **consequências**: o que se ganha **e o que se paga** (indireção, mais classes, mais conceitos).
**JavaScript muda o jogo**: funções são valores, objetos são literais e flexíveis, módulos já são singletons, closures substituem classes pequenas. Muitos padrões do GoF (escritos para Java/C++) viram **uma função** ou **um objeto**. **Regra de ouro:** comece pela solução **mais simples**; use o padrão quando ele **reduzir** a complexidade (ou comunicar a intenção a quem lê).

### Factory (Fábrica)
**Problema:** o código cliente não deve **conhecer** classes concretas nem a lógica de **escolher** qual criar. **Solução:** uma função (ou método) **cria** o objeto a partir de um **parâmetro**.
Em JavaScript, a forma mais idiomática é uma **tabela de construtores**:
- §criarDocumento('pdf', dados)§ consulta §{ pdf: Pdf, html: Html }§ e faz §new§;
- **tipo desconhecido** → erro **explícito** (medido: §tipo desconhecido: doc§);
- **Adicionar um formato** = **registrar** na tabela (aula cln-02: OCP), sem alterar quem usa.
**Variantes:** *Factory Method* (subclasses decidem o que criar), *Abstract Factory* (família de objetos relacionados: UI "escura" x "clara", provedores de nuvem). Em JS, uma **função que devolve um objeto** (*factory function*) com **closures** substitui classes quando não há herança.
**Quando usar:** a criação **depende de configuração**, há **vários tipos intercambiáveis**, a construção é **complexa** ou **precisa ser testada** com dublês. **Quando não:** se só existe **um** tipo, §new§ direto basta (Yagni).

### Builder (Construtor passo a passo)
**Problema:** objetos com **muitos parâmetros opcionais** ("construtor telescópico": §new Consulta(tabela, null, null, 10)§) ou **construção em etapas** com **validação no final**. **Solução:** um objeto auxiliar acumula as escolhas e **§construir()§** valida e devolve o resultado.
No laboratório, §ConsultaBuilder.de('pedidos').onde('status', 'pago').onde('uf', 'SP').ordenarPor('criado').limitar(10).construir()§ produziu **§SELECT * FROM pedidos WHERE status = ? AND uf = ? ORDER BY criado LIMIT 10§** com parâmetros §['pago', 'SP']§: **valores separados do SQL** (parametrização, **contra injeção**), e §new ConsultaBuilder().construir()§ **lança** §tabela obrigatória§. O estado interno usa **campos privados** (§#filtros§): o cliente **só** altera pelo contrato (MDN: *private elements*).
**Em JavaScript** o equivalente simples é um **objeto de opções** (§criar({ tabela, limite })§) com valores padrão; use Builder quando houver **encadeamento fluente**, **validação entre etapas** ou **imutabilidade** do resultado. Query builders (Knex, Kysely, Drizzle) e *test data builders* (dados de teste) são usos reais.

### Singleton: uma instância, e o preço
**Problema declarado:** garantir **uma única instância** com **ponto de acesso global** (configuração, pool de conexões, registro de logs). **Em Node.js**, o **cache de módulos** do ESM/CommonJS já faz isso: um módulo é **avaliado uma vez por processo** e o objeto exportado é **compartilhado** (§configuracaoGlobal§ no laboratório). Não é preciso escrever "Singleton clássico" (construtor privado, §getInstance()§).
**O problema real é o estado global.** **Medido (testes do laboratório):** o primeiro teste chama §configuracaoGlobal.incrementar()§ duas vezes (1 e 2); o **segundo teste**, **independente**, recebe **3**: **depende da ordem de execução**. Com §criarContador()§ (nova instância por teste) o resultado é **sempre 1**.
**Consequências do Singleton:**
- **Estado global compartilhado**: testes **acoplados** por ordem, falhas **intermitentes** quando rodam em paralelo ou em ordem aleatória;
- **Dependência escondida**: o código chama §Config.instance§ sem declarar que depende dele;
- **Dificulta substituir** por um dublê;
- **Concorrência**: em linguagens com threads exige sincronização (Node tem uma thread por processo, mas **workers** e **vários processos** têm **instâncias separadas**: "singleton" vale **por processo**, não por sistema!).
**Alternativas melhores:** **criar a instância uma vez na raiz de composição** e **injetá-la** (aula pat-04); manter o **ciclo de vida** no contêiner de DI (*singleton scope*) em vez de global; para configuração, **objeto imutável** (§Object.freeze§) lido uma vez.
**Quando é aceitável:** recursos **genuinamente únicos por processo** (um pool de conexões, um logger), **sem estado mutável de negócio**, **injetados** pelos consumidores.

### Outros criacionais (visão rápida)
- **Prototype**: criar por **clonagem** (§structuredClone§, spread); em JS, o próprio modelo de protótipos e §Object.create§ são o padrão embutido.
- **Abstract Factory**: família de objetos compatíveis (por exemplo, "cliente de pagamento + validador + conversor" de um provedor).
- **Object Pool**: reutilizar objetos **caros** (conexões, workers); aparece em *pools* de bibliotecas, raramente escrito à mão.

### Como escolher
| Necessidade | Primeira opção | Padrão quando... |
|---|---|---|
| Escolher o tipo em tempo de execução | tabela de funções/construtores | houver famílias e extensão por terceiros |
| Muitos parâmetros opcionais | objeto de opções com padrões | houver etapas, validação cruzada e imutabilidade |
| Instância única | módulo + injeção | recurso único por processo, sem estado de negócio |
| Copiar objetos | spread/structuredClone | objetos complexos com referências circulares |

### Como testar
- **Factory**: um teste por tipo e um para o erro do tipo desconhecido (medido: 3 verificações);
- **Builder**: teste da **saída** (SQL e parâmetros) e da **validação**;
- **Singleton**: **prove o isolamento** ou **evite** o global. Teste que **reinicia** o estado (hook §beforeEach§) é um **sintoma** de que ele não deveria ser global.
O laboratório tem **22 testes** (todos passam) cobrindo os 14 padrões das aulas 1 a 4.`,
  concepts: [
    { term: 'Padrão de projeto', def: 'Solução recorrente e nomeada para um problema de design, descrita com contexto, solução e consequências.' },
    { term: 'Factory', def: 'Padrão que encapsula a criação de objetos, escolhendo o tipo concreto a partir de um parâmetro ou configuração.' },
    { term: 'Builder', def: 'Padrão que constrói um objeto complexo passo a passo e valida o resultado ao final.' },
    { term: 'Singleton', def: 'Padrão que garante uma única instância com acesso global; em Node.js o cache de módulos já oferece uma por processo.' },
    { term: 'Estado global', def: 'Dados mutáveis compartilhados que tornam o comportamento dependente da ordem de execução e dificultam os testes.' },
    { term: 'Campo privado (#)', def: 'Membro de classe JavaScript acessível apenas dentro da própria classe.' },
    { term: 'Raiz de composição', def: 'Ponto único, perto do início do programa, onde os objetos são criados e suas dependências ligadas.' }
  ],
  examples: R`**Analogia:** a **Factory** é o balcão de uma **locadora de carros**: você pede "um SUV" e recebe um carro, sem saber de qual fábrica; o **Builder** é montar um **lanche** passo a passo e só conferir no caixa; o **Singleton** é **uma única chave-mestra** pendurada na parede: **conveniente**, mas qualquer um pode **mexer nela** sem ninguém saber.

**Exemplo 1: Factory.** criarDocumento('pdf', 'x') devolve PDF:x; 'doc' lança erro explícito.

**Exemplo 2: Builder.** A consulta SQL é montada com parâmetros separados dos valores.

**Exemplo 3: Singleton.** O contador global vale 1 e 2 no primeiro teste e 3 no segundo, que não deveria depender dele.`,
  code: [
    { title: 'Factory por tabela de construtores (JavaScript; testado)', lang: 'js', code: R`class Pdf { constructor(d) { this.d = d; } render() { return 'PDF:' + this.d; } }
class Html { constructor(d) { this.d = d; } render() { return '<p>' + this.d + '</p>'; } }

export function criarDocumento(tipo, dados) {
  const fabricas = { pdf: Pdf, html: Html };
  const C = fabricas[tipo];
  if (!C) throw new Error('tipo desconhecido: ' + tipo);
  return new C(dados);
}
criarDocumento('pdf', 'x').render();   // 'PDF:x'
criarDocumento('doc', 'x');            // Error: tipo desconhecido: doc`, notes: [{ l: '5', t: 'A tabela substitui if/else: novos formatos entram na tabela.' }, { l: '7', t: 'Erro explícito em vez de um undefined silencioso.' }] },
    { title: 'Builder com campos privados e parâmetros separados do SQL (JavaScript; testado)', lang: 'js', code: R`export class ConsultaBuilder {
  #tabela; #filtros = []; #ordem = null; #limite = null;
  static de(tabela) { const b = new ConsultaBuilder(); b.#tabela = tabela; return b; }
  onde(campo, valor) { this.#filtros.push([campo, valor]); return this; }
  ordenarPor(campo) { this.#ordem = campo; return this; }
  limitar(n) { this.#limite = n; return this; }
  construir() {
    if (!this.#tabela) throw new Error('tabela obrigatória');
    const w = this.#filtros.length ? ' WHERE ' + this.#filtros.map(([c]) => c + ' = ?').join(' AND ') : '';
    const o = this.#ordem ? ' ORDER BY ' + this.#ordem : '';
    const l = this.#limite != null ? ' LIMIT ' + this.#limite : '';
    return { sql: 'SELECT * FROM ' + this.#tabela + w + o + l, params: this.#filtros.map(([, v]) => v) };
  }
}
// ConsultaBuilder.de('pedidos').onde('status','pago').onde('uf','SP').ordenarPor('criado').limitar(10).construir()
// -> { sql: 'SELECT * FROM pedidos WHERE status = ? AND uf = ? ORDER BY criado LIMIT 10', params: ['pago', 'SP'] }`, notes: [{ l: '2', t: 'Estado privado: só o contrato público altera o builder.' }, { l: '9', t: 'Atenção: nomes de colunas/tabelas vêm do código; só valores são parametrizados (nunca monte nomes a partir de entrada do usuário).' }] },
    { title: 'Singleton de módulo x instância por teste (JavaScript; resultado medido: 1, 2, 3 x 1, 1)', lang: 'js', code: R`// criacionais.mjs
export const configuracaoGlobal = { contador: 0, incrementar() { return ++this.contador; } };
export class Contador { constructor() { this.valor = 0; } inc() { return ++this.valor; } }
export const criarContador = () => new Contador();

// teste 1: incrementar() -> 1 e 2
// teste 2 (independente!): incrementar() -> 3   <- depende da ordem
// com criarContador(): inc() -> 1 em todo teste`, notes: [{ l: '2', t: 'O módulo é avaliado uma vez: o objeto é compartilhado em todo o processo.' }, { l: '7', t: 'Estado global acopla os testes por ordem de execução.' }] }
  ],
  bestPractices: ['Comece pela solução simples (função, objeto de opções) e use o padrão quando ele reduzir a complexidade.', 'Use tabelas de construtores para fábricas e erros explícitos para tipos desconhecidos.', 'Use Builder quando houver encadeamento, validação entre etapas ou imutabilidade.', 'Parametrize valores em consultas e nunca monte identificadores a partir de entrada do usuário.', 'Evite estado mutável global; crie a instância na raiz de composição e injete-a.', 'Lembre que singleton em Node vale por processo, não por sistema.', 'Teste a saída e as validações dos padrões, não a estrutura interna.'],
  mistakes: ['Implementar o Singleton clássico em Node, ignorando o cache de módulos.', 'Estado global mutável compartilhado entre testes e módulos.', 'Factories para um único tipo (excesso de design).', 'Builders para objetos de dois campos.', 'Montar SQL concatenando valores do usuário.', 'Supor que o singleton é único em um sistema com vários processos ou workers.'],
  market: R`Padrões aparecem em **entrevistas**, **revisões de design** e na **leitura de frameworks** (Nest, Express, ORMs usam Factory, Builder e DI); falar o **nome** e os **custos** de cada padrão mostra senioridade melhor do que recitar o catálogo.`,
  summary: R`Padrões são soluções nomeadas com consequências (GoF: criacionais, estruturais e comportamentais). Em JavaScript muitos viram funções ou objetos: Factory é uma tabela de construtores, Builder usa campos privados e encadeamento (consulta SQL com parâmetros separados) e o Singleton já existe no cache de módulos do Node. Medido no laboratório: o contador global deu 1, 2 e depois 3 em um teste independente (acoplamento por ordem), enquanto instâncias por teste dão sempre 1. Prefira injetar a instância a depender de estado global.`,
  refs: [REF.gof, REF.guruCatalog, REF.guruFactory, REF.guruBuilder, REF.guruSingleton, REF.nodeModulesCache, REF.mdnPrivate],
  cards: [
    { q: 'Por que o Singleton clássico raramente é necessário em Node.js?', a: 'O cache de módulos avalia o módulo uma vez por processo e compartilha o objeto exportado; o risco real é o estado global mutável.' },
    { q: 'O que o teste do contador global mostrou?', a: 'O segundo teste, independente, recebeu 3 por herdar o estado do primeiro: dependência da ordem de execução.' },
    { q: 'Quando preferir um objeto de opções a um Builder?', a: 'Quando há poucos parâmetros opcionais sem etapas, validação cruzada ou encadeamento.' },
    { q: 'O que a Factory por tabela facilita?', a: 'Adicionar novos tipos registrando-os, sem alterar o código cliente (OCP), e falhar de forma explícita para tipos desconhecidos.' }
  ]
},
{
  id: 'pat-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['Adapter', 'Decorator', 'Facade', 'Proxy', 'Composite', 'padrões estruturais'],
  title: 'Padrões estruturais: Adapter, Decorator, Facade, Proxy e Composite',
  objectives: ['Aplicar o Adapter para integrar uma API legada sem contaminar o domínio', 'Compor comportamentos transversais (retry, cache, log) com Decorators sobre funções', 'Usar uma Facade para esconder subsistemas e uma Proxy do JavaScript para validação e carregamento preguiçoso', 'Modelar estruturas em árvore com Composite', 'Medir o custo de um Proxy e o efeito de um decorator de cache', 'Escolher entre Decorator, Proxy e Adapter pela intenção'],
  intro: R`Os padrões **estruturais** tratam de **como compor** objetos e funções. Aqui cinco deles com **código executado** (22 testes passam): o **Adapter** que converte reais em centavos, **Decorators** de retry, cache e log, a **Facade** que desfaz a reserva de estoque quando o pagamento é recusado, **Proxies** (validação e carregamento preguiçoso) e o **Composite** de pastas. Medidas: o decorator de cache reduziu **100 leituras com latência de 5 ms** de **524 ms para 52 ms**; já o **Proxy** custou **~53x mais** em 10 milhões de leituras de propriedade (**30,6 ms** contra **1.613,6 ms**).`,
  theory: R`### Adapter: traduzir interfaces incompatíveis
**Problema:** a aplicação espera §pagar({ valor, cartao })§ (valor em **reais**), mas o fornecedor legado expõe §cobrarCentavos(valorCentavos, cartao)§. **Solução:** uma classe/função **intermediária** que **traduz** (§Math.round(valor * 100)§, nome dos campos, formato do retorno).
No laboratório, §AdaptadorPagamento§ devolveu §{ aprovado: true, id: 'ANT-1234' }§ para um pagamento de **19,90**. **Benefícios:** o domínio **não conhece** o legado (**anticorrupção**); trocar de fornecedor = **novo adaptador**. **Cuidados:** conversões **monetárias** com **arredondamento** explícito (use inteiros em centavos); **erros** do fornecedor devem virar **erros do domínio**; **não vaze** tipos do legado para a aplicação. É a base do **Anti-Corruption Layer** do DDD e dos **clientes de API** de terceiros.

### Decorator: acrescentar comportamento sem alterar o original
**Problema:** funcionalidades **transversais** (retry, cache, log, métricas, autorização) em muitas operações. **Solução:** **envolver** uma função/objeto com outro que **tem a mesma interface** e acrescenta algo antes ou depois.
Em JavaScript, decorators de **funções** são trivialmente **funções de ordem superior**: §comRetry(fn, 5)§, §comCache(fn)§, §comLog(fn, log)§. **Medido (testes):**
- §comCache(comRetry(instavel, 5))§ com uma função que **falha duas vezes** e acerta na terceira: **3 chamadas** na primeira leitura (**retry**) e **continua 3** na segunda (**cache**);
- **100 leituras** de **10 chaves** → **10 chamadas** ao backend e **tamanho do cache 10**;
- **Com latência de 5 ms** (simulada): **524 ms sem cache** e **52 ms com cache**.
**Ordem importa**: **cache por fora do retry** evita repetir chamadas bem-sucedidas; **retry por fora do cache** repetiria até leituras em cache. Cuidados: **idempotência** no retry (só repita operações seguras: aula de filas), **invalidação** do cache (TTL, chave), **chave** correta, **erros** não devem ser armazenados em cache, **limite** de tamanho.
**Em classes**: o decorator implementa a **mesma interface** do componente e o **delega**. O **decorator do TypeScript/ECMAScript** (§@Log()§) é **sintaxe**, não o mesmo conceito: serve para **anotar** classes e métodos (NestJS usa muito), mas o **padrão** é mais amplo. Os **middlewares do Express** são decorators/cadeias (aula pat-03).

### Facade: uma porta simples para vários subsistemas
**Problema:** o cliente precisa orquestrar **estoque, pagamento e notificação** para uma compra; o fluxo (incluindo **desfazer a reserva** se o pagamento falhar) se **repetiria** em cada tela/endpoint. **Solução:** §FachadaPedido.comprar(item, qtd, valor, cartao)§ expõe **uma operação**.
**Medido:** os eventos registrados nos testes: compra **aprovada** → §reservar§, §pedido P1§; **sem estoque** → só §reservar§ e resultado §{ ok: false, motivo: 'sem estoque' }§; **pagamento recusado** → §reservar§ e §liberar§ (**compensação**). **Cuidados:** a fachada **não** deve virar **God object** (aula pat-05): mantenha-a **fina**, delegando; **não esconda** erros importantes; para fluxos **distribuídos** isso evolui para **sagas** (C4.7).

### Proxy: um substituto que controla o acesso
O Proxy tem **a mesma interface** do objeto real e **intercepta** o acesso (validação, controle de acesso, carga preguiçosa, cache, log). O JavaScript tem o **§Proxy§ nativo** (traps §get§, §set§, §has§...; MDN):
- **Proxy de validação:** §comValidacao(objeto, regras)§ rejeita §idade = -1§ com §TypeError: valor inválido para idade§ e aceita §30§;
- **Proxy virtual (preguiçoso):** §carregamentoPreguicoso(criar)§ só cria o objeto real no **primeiro acesso**: depois de **dois** acessos, **1 criação**.
**Custo (medido nesta máquina, 10 milhões de leituras, mediana de 7):** objeto direto **30,6 ms**; Proxy com trap §get§ **1.613,6 ms**; Proxy só com trap §set§ **953,7 ms** (o §get§ também passa pelo Proxy). O objeto direto é **otimizado pelo motor** (a razão é **indicativa**, não universal): em uma execução anterior, na mesma máquina, deu **18,2 ms** contra **1.036,7 ms** (~57x); a magnitude **varia**, a ordem de grandeza não; em código quente, **evite** Proxy. Também **não** é adequado como "mágica" invisível: **dificulta depuração**; **reatividade** (Vue 3 usa Proxy) justifica o custo.
**Diferenças:** **Proxy** controla o **acesso** (mesma interface, normalmente o objeto real é do mesmo domínio); **Decorator** acrescenta **responsabilidades**; **Adapter** **muda** a interface.

### Composite: tratar parte e todo da mesma forma
**Problema:** estruturas em **árvore** (pastas e arquivos, menus, organogramas, expressões). **Solução:** **folhas** e **compostos** com **a mesma interface** (§total()§). **Medido:** pasta §raiz§ com arquivo de **10** e subpasta com **5** e **1** → §total() = 16§ (recursão). Aparece em **árvores de componentes** (React/DOM), **sistemas de arquivos**, **regras compostas** (AND/OR). **Cuidados:** **ciclos** (um nó contendo a si mesmo), **profundidade** (estouro de pilha), operações **só de folha**.

### Outros estruturais (visão rápida)
- **Bridge**: separa **abstração** de **implementação** (relatórios x formatos);
- **Flyweight**: **compartilha** estado imutável para economizar memória (internamento de strings);
- **Module** (do JS): encapsulamento por módulo/closure.

### Como escolher
| Intenção | Padrão |
|---|---|
| "Preciso falar com algo que tem outra interface" | **Adapter** |
| "Quero somar retry/cache/log sem mexer no original" | **Decorator** |
| "Quero uma porta simples para vários subsistemas" | **Facade** |
| "Quero controlar/adiar o acesso a um objeto" | **Proxy** |
| "Parte e todo se comportam igual" | **Composite** |

### Cuidados gerais
- **Indireção custa leitura**: três camadas para chamar uma função confundem; **justifique** cada camada;
- **Desempenho**: wrappers e Proxies **somam** custo (medido acima);
- **Testes**: teste o **decorator isolado** (com uma função falsa) e o **conjunto**;
- **Observabilidade**: o decorator de log/metricas é o lugar natural (C4.6).`,
  concepts: [
    { term: 'Adapter', def: 'Padrão que converte a interface de um componente na interface esperada pelo cliente.' },
    { term: 'Decorator', def: 'Padrão que envolve um objeto ou função com a mesma interface para acrescentar comportamento.' },
    { term: 'Facade', def: 'Padrão que oferece uma interface simples para um conjunto de subsistemas.' },
    { term: 'Proxy', def: 'Substituto com a mesma interface que controla o acesso a um objeto (validação, preguiça, cache).' },
    { term: 'Composite', def: 'Padrão em que folhas e compostos compartilham a mesma interface para formar árvores.' },
    { term: 'Anti-Corruption Layer', def: 'Camada que impede que modelos de sistemas externos ou legados contaminem o domínio.' },
    { term: 'Função de ordem superior', def: 'Função que recebe ou devolve funções; base dos decorators funcionais em JavaScript.' }
  ],
  examples: R`**Analogia:** o **Adapter** é o **adaptador de tomada** de viagem; o **Decorator** é **embalar um presente em camadas** (papel, laço, cartão) sem mexer no presente; a **Facade** é a **recepção do hotel** (um balcão para quarto, restaurante e transporte); o **Proxy** é o **porteiro** que decide quem passa; o **Composite** é uma **caixa de bonecas** que contém caixas e itens, todos tratados como "item".

**Exemplo 1: decorator de cache.** 100 leituras de 10 chaves: 10 chamadas ao backend; 524 ms → 52 ms com latência de 5 ms.

**Exemplo 2: facade com compensação.** Pagamento recusado libera o estoque reservado.

**Exemplo 3: Proxy preguiçoso.** O objeto real é criado só no primeiro acesso e depois reutilizado.`,
  code: [
    { title: 'Adapter: a aplicação usa reais, o legado usa centavos (JavaScript; testado)', lang: 'js', code: R`export class GatewayAntigo {
  cobrarCentavos(valorCentavos, cartao) { return { ok: valorCentavos > 0, codigo: 'ANT-' + cartao.slice(-4) }; }
}
export class AdaptadorPagamento {
  constructor(antigo) { this.antigo = antigo; }
  pagar({ valor, cartao }) {
    const r = this.antigo.cobrarCentavos(Math.round(valor * 100), cartao);
    return { aprovado: r.ok, id: r.codigo };
  }
}
new AdaptadorPagamento(new GatewayAntigo()).pagar({ valor: 19.9, cartao: '4111111111111234' });
// { aprovado: true, id: 'ANT-1234' }`, notes: [{ l: '7', t: 'Math.round evita o erro de ponto flutuante na conversão para centavos.' }, { l: '12', t: 'Em produção nunca registre o número completo do cartão.' }] },
    { title: 'Decorators funcionais: retry, cache e log (JavaScript; medido: 524 ms → 52 ms)', lang: 'js', code: R`export const comRetry = (fn, tentativas) => async (...a) => {
  let ultimo;
  for (let i = 1; i <= tentativas; i++) { try { return await fn(...a); } catch (e) { ultimo = e; } }
  throw ultimo;
};
export const comCache = (fn) => {
  const m = new Map();
  const f = async (k) => { if (!m.has(k)) m.set(k, await fn(k)); return m.get(k); };
  f.tamanho = () => m.size;
  return f;
};
export const comLog = (fn, log) => async (...a) => {
  log.push('chamou ' + JSON.stringify(a)); const r = await fn(...a); log.push('retornou ' + JSON.stringify(r)); return r;
};
// ordem: cache por fora do retry (não repete o que já está em cache)
const leitura = comCache(comRetry(buscarNoBackend, 5));`, notes: [{ l: '7', t: 'Falhas lançam exceção antes do set: erros não ficam no cache.' }, { l: '16', t: 'A composição define o comportamento: cache envolve o retry.' }] },
    { title: 'Proxy de validação e carregamento preguiçoso (JavaScript; custo medido: 30,6 ms x 1.613,6 ms)', lang: 'js', code: R`export function comValidacao(objeto, regras) {
  return new Proxy(objeto, {
    set(alvo, chave, valor) {
      const r = regras[chave];
      if (r && !r(valor)) throw new TypeError('valor inválido para ' + String(chave));
      alvo[chave] = valor; return true;
    }
  });
}
export function carregamentoPreguicoso(criar) {
  let real = null;
  return new Proxy({}, { get(_, k) { if (!real) real = criar(); return real[k]; } });
}
const u = comValidacao({}, { idade: (v) => Number.isInteger(v) && v >= 0 });
u.idade = 30;      // ok
u.idade = -1;      // TypeError: valor inválido para idade`, notes: [{ l: '5', t: 'O trap set valida antes de gravar no alvo.' }, { l: '11', t: 'O objeto real só é criado no primeiro acesso.' }] }
  ],
  bestPractices: ['Use Adapter para isolar APIs legadas ou de terceiros e converta erros para erros do domínio.', 'Componha decorators pensando na ordem (cache por fora do retry) e só repita operações idempotentes.', 'Mantenha a Facade fina e preserve a compensação (liberar estoque ao recusar o pagamento).', 'Evite Proxy em código quente e documente o comportamento mágico.', 'Use Composite com atenção a ciclos e à profundidade da recursão.', 'Justifique cada camada de indireção; teste decorators isolados e compostos.', 'Escolha o padrão pela intenção: adaptar, acrescentar, simplificar, controlar acesso ou compor árvores.'],
  mistakes: ['Vazar tipos e erros do legado para dentro do domínio.', 'Cachear erros ou esquecer a invalidação do cache.', 'Repetir com retry operações que não são idempotentes.', 'Transformar a Facade em um God object.', 'Usar Proxy em laços quentes sem medir.', 'Empilhar camadas (adapter, decorator, proxy) sem necessidade real.'],
  market: R`Adapters (clientes de integração), decorators (middlewares, interceptors do Nest, retry/cache), fachadas (serviços de aplicação) e proxies (reatividade, ORMs) aparecem no **dia a dia** de APIs e frameworks; reconhecê-los acelera a **leitura de código alheio** e as **conversas de design**.`,
  summary: R`Adapter traduz interfaces (reais para centavos); Decorator acrescenta comportamento com a mesma interface (retry, cache, log); Facade simplifica subsistemas e preserva a compensação; Proxy controla o acesso (validação, preguiça) com custo medido (10 milhões de leituras: 30,6 ms direto x 1.613,6 ms com trap get); Composite trata parte e todo igualmente. Medido: o decorator de cache baixou 100 leituras de 524 ms para 52 ms (10 chamadas ao backend). Escolha pela intenção e justifique cada camada.`,
  refs: [REF.guruAdapter, REF.guruDecorator, REF.mdnProxy, REF.gof, REF.guruCatalog, REF.nodeTest],
  cards: [
    { q: 'Qual a diferença entre Adapter e Decorator?', a: 'O Adapter muda a interface para torná-la compatível; o Decorator mantém a mesma interface e acrescenta comportamento.' },
    { q: 'Por que o cache deve ficar por fora do retry?', a: 'Para não repetir (nem reexecutar) chamadas cujo resultado já está armazenado; erros não devem ser cacheados.' },
    { q: 'Quanto custou o Proxy no laboratório?', a: '10 milhões de leituras: 30,6 ms no objeto direto contra 1.613,6 ms com trap get (indicativo, em uma máquina).' },
    { q: 'O que a Facade do laboratório faz ao pagamento ser recusado?', a: 'Libera a reserva de estoque e devolve { ok: false, motivo: "recusado" }, compensando a etapa anterior.' }
  ]
}
];
