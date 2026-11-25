// C2.8 — Arquitetura frontend, monorepos e microfrontends. Aulas 1 a 3 (organização de apps grandes; contratos, erros e observabilidade; monorepos).
const R = String.raw;

export const REF = {
  fsd: { title: 'Feature-Sliced Design — Visão geral', url: 'https://feature-sliced.design/', kind: 'doc' },
  depcruise: { title: 'dependency-cruiser (GitHub)', url: 'https://github.com/sverweij/dependency-cruiser', kind: 'doc' },
  adr: { title: 'Architectural Decision Records (adr.github.io)', url: 'https://adr.github.io/', kind: 'doc' },
  nxBoundaries: { title: 'Nx — Enforce module boundaries', url: 'https://nx.dev/docs/features/enforce-module-boundaries', kind: 'doc' },
  reactStructure: { title: 'React — Thinking in React', url: 'https://react.dev/learn/thinking-in-react', kind: 'doc' },
  zodDocs: { title: 'Zod — Documentação', url: 'https://zod.dev/', kind: 'doc' },
  errorBoundary: { title: 'React — Error boundaries (Component, getDerivedStateFromError)', url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary', kind: 'doc' },
  otel: { title: 'OpenTelemetry — Documentação', url: 'https://opentelemetry.io/docs/', kind: 'doc' },
  owaspLogging: { title: 'OWASP — Logging Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html', kind: 'doc' },
  turboCaching: { title: 'Turborepo — Caching', url: 'https://turborepo.dev/docs/crafting-your-repository/caching', kind: 'doc' },
  turboTasks: { title: 'Turborepo — Running tasks', url: 'https://turborepo.dev/docs/crafting-your-repository/running-tasks', kind: 'doc' },
  turboStructure: { title: 'Turborepo — Structuring a repository', url: 'https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository', kind: 'doc' },
  turboCI: { title: 'Turborepo — Constructing CI', url: 'https://turborepo.dev/docs/crafting-your-repository/constructing-ci', kind: 'doc' },
  nxRunTasks: { title: 'Nx — Run tasks', url: 'https://nx.dev/docs/features/run-tasks', kind: 'doc' },
  npmWorkspaces: { title: 'npm — Workspaces', url: 'https://docs.npmjs.com/cli/using-npm/workspaces', kind: 'doc' },
  pnpmWorkspaces: { title: 'pnpm — Workspaces', url: 'https://pnpm.io/workspaces', kind: 'doc' },
  changesets: { title: 'Changesets (GitHub)', url: 'https://github.com/changesets/changesets', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'arq-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['arquitetura', 'features', 'camadas', 'fronteiras', 'dependências', 'API pública'],
  title: 'Aplicações React grandes: organização por funcionalidade, camadas, fronteiras e regras de dependência',
  objectives: ['Comparar organização por tipo de arquivo e por funcionalidade (feature) e justificar a segunda em apps grandes', 'Definir camadas e a direção permitida das dependências entre elas', 'Expor cada funcionalidade por uma API pública e impedir importações de internals', 'Detectar e eliminar dependências circulares', 'Automatizar as regras com ferramentas (dependency-cruiser, lint) e na CI'],
  intro: `Uma aplicação pequena sobrevive a qualquer organização. Uma grande, com dezenas de pessoas, não: a pasta §components§ com 400 arquivos, importações cruzadas por todo lado e ninguém sabe o que pode ser alterado sem quebrar o resto. **Arquitetura frontend** é decidir **onde cada coisa mora**, **quem pode depender de quem** e **como impedir que as regras sejam violadas**. Esta aula apresenta a organização por **funcionalidade** e por **camadas**, a **API pública** de cada módulo, a eliminação de **ciclos** e a **automação** das regras. Foi medido no laboratório o **dependency-cruiser 18.9** apontando três violações em um mini projeto proposital.`,
  theory: `### Organizar por tipo x por funcionalidade
- **Por tipo** (§components/§, §hooks/§, §utils/§, §services/§): simples no começo, mas **uma funcionalidade espalha-se** por cinco pastas e cada mudança toca vários lugares; as pastas viram "gavetas de tudo";
- **Por funcionalidade (feature)** (§features/pedidos/§, §features/clientes/§): tudo de uma funcionalidade **junto** (componentes, hooks, estado, chamadas à API, testes, tipos). Vantagens: **coesão** (o que muda junto fica junto), **propriedade clara** (uma equipe cuida de uma feature), **remoção fácil** (apagar a pasta), **onboarding** mais simples. Compartilhado vai para um lugar à parte (§shared/§).
Uma estrutura típica:
§§§
src/
  app/            composição: roteamento, provedores, inicialização
  pages/          telas que montam features (ou o diretório de rotas do framework)
  features/       funcionalidades do produto (pedidos, clientes, carrinho)
    pedidos/
      index.js    API PÚBLICA da feature
      ui/ model/ api/ lib/  (internals)
  entities/       conceitos de negócio reutilizáveis (usuário, produto) - opcional
  shared/         código sem negócio (UI base, utilidades, cliente HTTP, config)
§§§
Variações conhecidas: **Feature-Sliced Design** (camadas §app, pages, widgets, features, entities, shared§), arquitetura **hexagonal/limpa** adaptada ao frontend e organizações **por domínio** em monorepos. O importante não é a marca, e sim **regras explícitas**.

### Camadas e direção das dependências
Defina uma **ordem** em que as camadas podem depender: de cima para baixo, **nunca de baixo para cima**:
§§§
app  ->  pages  ->  features  ->  entities  ->  shared
§§§
- **§shared§** não conhece o produto (não importa de §features§);
- **§features§** não importam de **outras** features (se duas precisam conversar, a composição acontece em uma camada **acima** (§pages§/§app§) ou por **contratos** e eventos);
- **§app§** conhece todos, mas ninguém importa de §app§.
Isso **limita o impacto** de uma mudança (uma feature não quebra as outras), impede **acoplamento oculto** e facilita testar e extrair uma feature (para um pacote ou microfrontend, aulas 3 a 5).

### API pública e encapsulamento
Cada módulo tem um **ponto de entrada** (§index.js§) que exporta **só o que os outros podem usar**. Os demais arquivos são **internals**: importar §features/clientes/internal.js§ de outra feature é **proibido**. Vantagens: dá para **refatorar o interior** sem quebrar quem usa; a superfície de contrato é pequena. Cuidados com o **barrel** (§index.js§ que reexporta tudo): pode **atrapalhar o tree shaking** e **aumentar o tempo de build** em arquivos enormes; mantenha o barrel **enxuto**, exporte nomes explícitos, evite reexportar tudo com §export *§ em camadas muito amplas e ligue o §sideEffects§ do pacote.

### Dependências circulares
Um **ciclo** (A importa B que importa A) causa valores §undefined§ na inicialização, comportamento dependente da ordem e impede a extração de módulos. Causas comuns: tipos e constantes colocados no lugar errado, features que se importam mutuamente, e barrels que importam o módulo que os importa. Soluções: mover o que é comum para uma camada **abaixo**; **inverter a dependência** (injetar uma função ou usar eventos); dividir o módulo. Detecte com **dependency-cruiser** (§circular: true§) ou §madge§.

### Automatizar as regras
Regras só escritas em um documento **apodrecem**. Torne-as **executáveis**:
- **dependency-cruiser** (ou §eslint-plugin-boundaries§, ou as regras de fronteira do **Nx**): configure "sem ciclos", "§shared§ não importa §features§" e "uma feature só usa a API pública de outra". Medido no laboratório (mini projeto de 4 módulos com três erros intencionais):
§§§
error shared-nao-importa-features:   src/shared/ruim.js -> src/features/pedidos/index.js
error sem-ciclos:                    clientes/internal.js -> pedidos/index.js -> clientes/internal.js
error feature-so-usa-api-publica:    pedidos/index.js -> clientes/internal.js
x 3 dependency violations (3 errors, 0 warnings). 4 modules, 3 dependencies cruised.
§§§
- **TypeScript**: caminhos de importação por alias (§@/features/pedidos§), §strict§, e **referências de projeto** em monorepos;
- **Lint** na CI e **bloqueio** de pull requests que violam as regras (com exceções registradas);
- **CODEOWNERS** (C1.6): cada pasta de feature com responsáveis; revisão obrigatória para mexer na API pública.
O desafio de código da aula implementa um verificador de camadas e API pública.

### Estado e dados na arquitetura
Siga a taxonomia da C2.4: estado de **servidor** em cache por feature (§features/pedidos/api§), estado de **UI global** mínimo em §shared§ ou §app§, **URL** como fonte de navegação, **derivado** por seletores. Uma feature **expõe** hooks (§usePedidos§) e **esconde** a biblioteca usada (isolando trocas futuras).

### Entidades e duplicação
Quando duas features precisam do mesmo conceito (usuário, produto), crie a **entidade** em uma camada abaixo (§entities§) com tipos e componentes básicos; evite duplicar e evite que uma feature "possua" o que várias usam. Mas **não antecipe**: **duplicar um pouco é melhor que abstrair cedo demais**; extraia quando houver **três** usos reais com a mesma necessidade.

### Evolução e migração
Não reescreva tudo: aplique as regras **a código novo**, registre as violações existentes como **dívida** (lista de exceções que **só diminui**), mova módulos por etapas e use a CI para **impedir novas violações**. Documente decisões em **ADRs** (C2.4): "por que organizamos por feature", "regras de dependência", "como tratamos exceções".

### Sinais de que a arquitetura falhou
Mudar uma tela exige mexer em muitos lugares; ninguém sabe quem é dono de um módulo; ciclos e importações profundas (§../../../§) por toda parte; features que não podem ser testadas isoladamente; tempo de build e de testes crescendo sem explicação; "arquivo utilitário" que importa de tudo.`,
  concepts: [
    { term: 'Organização por funcionalidade', def: 'Agrupar tudo de uma funcionalidade (UI, estado, API, testes) na mesma pasta.' },
    { term: 'Camada', def: 'Nível da arquitetura com responsabilidade e direção de dependência definidas (app, features, shared).' },
    { term: 'API pública', def: 'Conjunto de exportações de um módulo que os outros podem usar; o restante é interno.' },
    { term: 'Barrel', def: 'Arquivo index que reexporta símbolos de vários arquivos.' },
    { term: 'Dependência circular', def: 'Situação em que módulos se importam entre si, direta ou indiretamente.' },
    { term: 'Feature-Sliced Design', def: 'Metodologia que organiza o frontend em camadas e fatias por funcionalidade.' },
    { term: 'dependency-cruiser', def: 'Ferramenta que analisa e valida as dependências entre módulos por regras.' },
    { term: 'Dívida arquitetural', def: 'Violações conhecidas das regras, registradas para correção gradual.' },
    { term: 'CODEOWNERS', def: 'Arquivo que define os responsáveis por pastas e exige sua revisão.' }
  ],
  examples: R`**Analogia:** uma grande aplicação é uma **cidade**: bairros (features) com vida própria, ruas e serviços básicos compartilhados (shared) e a prefeitura (app) que conecta tudo. A regra "ninguém entra pela porta dos fundos da casa do vizinho" é a **API pública**; o **ciclo** é duas casas que só se abrem uma com a chave da outra. O **dependency-cruiser** é o fiscal que multa a obra irregular.

**Resultado medido (dependency-cruiser 18.9.0, 4 módulos, 3 dependências):**
§§§
3 violações: shared importando features; ciclo clientes <-> pedidos; pedidos importando o interior de clientes
§§§

**Cenário ilustrativo (não medido):** uma equipe de 40 pessoas tinha uma pasta §components§ com centenas de arquivos e tempos de pull request longos por conflitos. Ao migrar para features (uma por vez), com a regra "feature só importa a API pública de outra" na CI e uma lista de exceções que só diminuía, o número de arquivos tocados por mudança caiu e as equipes passaram a trabalhar em pastas distintas.`,
  code: [
    { title: 'Regras de dependência com dependency-cruiser (executado)', lang: 'js', code: R`// .dependency-cruiser.cjs
module.exports = { forbidden: [
  { name: 'sem-ciclos', severity: 'error', from: {}, to: { circular: true } },
  { name: 'shared-nao-importa-features', severity: 'error', from: { path: '^src/shared' }, to: { path: '^src/features' } },
  { name: 'feature-so-usa-api-publica', severity: 'error',
    from: { path: '^src/features/([^/]+)/' },
    to: { path: '^src/features/(?!$1)[^/]+/(?!index\\.js)' } }
] };
// npx depcruise src --config .dependency-cruiser.cjs`, notes: [{ l: '3', t: 'Ciclos são sempre erro (medido: clientes <-> pedidos).' }, { l: '7', t: 'O grupo capturado $1 é o nome da feature de origem: outras features só por index.js.' }] },
    { title: 'API pública de uma feature (barrel enxuto)', lang: 'js', code: R`// src/features/pedidos/index.js — o que as outras camadas podem usar
export { usePedidos } from './model/usePedidos.js';
export { ListaDePedidos } from './ui/ListaDePedidos.js';
export { pedidoSchema } from './api/schema.js';
// internals (não exportados): ./ui/Linha.js, ./model/reducers.js, ./api/cliente.js

// Em outra camada (pages):
import { ListaDePedidos } from '@/features/pedidos';          // permitido
// import { reducers } from '@/features/pedidos/model/reducers'; // proibido: internals`, notes: [{ l: '2', t: 'Exporte nomes explícitos: ajuda o tree shaking e deixa a superfície pequena.' }, { l: '9', t: 'Importar internals acopla a quem usa e impede refatorar.' }] }
  ],
  bestPractices: ['Organize por funcionalidade e mantenha o compartilhado sem conhecimento de negócio.', 'Defina camadas e a direção das dependências, e automatize a verificação na CI.', 'Exponha cada feature por uma API pública pequena e explícita.', 'Elimine ciclos movendo o comum para baixo ou invertendo a dependência.', 'Registre as violações existentes como dívida que só diminui.', 'Documente as decisões em ADRs e defina responsáveis (CODEOWNERS).'],
  mistakes: ['Uma pasta components com tudo.', 'Features importando o interior de outras features.', 'shared importando de features.', 'Barrels gigantes com export * em tudo.', 'Abstrair cedo demais antes de ter usos reais.', 'Regras só em um documento, sem verificação automática.'],
  market: `Em aplicações grandes, a diferença entre uma equipe produtiva e uma travada costuma ser a arquitetura de módulos e as regras de dependência. Saber propor e automatizar essas regras é pedido em vagas de nível sênior e de liderança técnica.`,
  summary: `Organize por funcionalidade, com camadas (app, pages, features, entities, shared) e dependências sempre para baixo; cada módulo tem uma API pública e esconde seus internals. Elimine ciclos, mantenha barrels enxutos e automatize as regras (dependency-cruiser mediu 3 violações em um mini projeto) com a CI e CODEOWNERS. Migre por etapas com uma lista de exceções que só diminui e registre as decisões em ADRs.`,
  refs: [REF.fsd, REF.depcruise, REF.nxBoundaries, REF.adr],
  cards: [
    { q: 'Por que organizar por funcionalidade?', a: 'Porque o que muda junto fica junto: coesão, propriedade clara, remoção e onboarding mais simples.' },
    { q: 'Qual é a regra de direção das dependências entre camadas?', a: 'Sempre de cima para baixo (app, pages, features, entities, shared); camadas baixas não importam das altas.' },
    { q: 'O que é a API pública de uma feature?', a: 'O index com as exportações permitidas; o resto é interno e não deve ser importado por outras features.' },
    { q: 'Como evitar que as regras apodreçam?', a: 'Automatizando-as com ferramentas (dependency-cruiser, lint) na CI e controlando a dívida.' }
  ]
},
{
  id: 'arq-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['contratos', 'validação', 'erros', 'observabilidade', 'logs', 'convenções', 'ADR'],
  title: 'Contratos, erros, observabilidade, convenções e ADRs em aplicações React grandes',
  objectives: ['Definir contratos explícitos nas fronteiras (API, módulos, eventos) e validá-los em tempo de execução', 'Padronizar o modelo de erros e escolher onde capturá-los (fronteiras de erro, cliente HTTP, Actions)', 'Instrumentar a aplicação com logs estruturados, rastreamento e métricas sem expor dados sensíveis', 'Estabelecer convenções (nomes, estrutura, commits, revisão) com ferramentas, não só com documentos', 'Registrar decisões em ADRs e acompanhar a saúde da base de código'],
  intro: `Em uma base grande, a maior parte dos defeitos vem das **fronteiras**: o que o servidor devolve não é o que o frontend esperava, um módulo muda e o outro quebra, um erro some sem registro. A resposta é **explicitar contratos**, **tratar erros de forma uniforme**, **observar o que acontece em produção** e **fazer as convenções valerem por ferramenta**. Esta aula reúne essas práticas: contratos e validação, o modelo de erros, observabilidade, convenções e ADRs. O desafio de código implementa a **redação de dados sensíveis em logs**, uma prática de observabilidade segura.`,
  theory: `### Contratos nas fronteiras
Um **contrato** descreve o formato do que cruza uma fronteira: a resposta de uma API, as props públicas de um componente de uma feature, o payload de um evento entre módulos. Os pontos onde a **verificação em tempo de execução** compensa:
- **Respostas de API**: tipos do TypeScript **não existem em execução**; o servidor pode mudar. Valide com um **esquema** (Zod, Valibot, etc.) ao receber (§schema.parse(dados)§) e **falhe com erro claro** (ou use um valor seguro) em vez de propagar um dado inválido pela interface;
- **Origem única de verdade**: gere tipos e clientes a partir de uma especificação (**OpenAPI**, GraphQL) para frontend e backend não divergirem; o **teste de contrato** (C2.6) confirma;
- **Entradas do usuário e da URL**: sempre validadas;
- **Eventos entre módulos**: nome, versão e esquema do payload (aula 6);
- **Configuração e variáveis de ambiente**: validadas na inicialização (C2.5).
Evolução de contratos: **mudanças compatíveis** (campo opcional novo) não quebram; **incompatíveis** (remover ou mudar o tipo de um campo) exigem **versão** e período de convivência. Aplique a **robustez**: seja rigoroso no que **produz** e tolerante no que **consome**, dentro do razoável.

### Modelo de erros
Erros sem padrão viram **mensagens vazias, telas brancas e logs inúteis**. Defina:
- **Categorias**: **de rede** (offline, timeout), **de validação** (entrada inválida, 400/422), **de autenticação/autorização** (401/403), **não encontrado** (404), **de servidor** (5xx) e **inesperados** (bugs);
- **Forma única** (§{ codigo, mensagem, recuperavel, detalhes? }§), com o **código estável** (para tratar e traduzir) e a **mensagem para a pessoa** (clara e sem detalhes internos);
- **Onde capturar**: no **cliente HTTP** (normaliza todos os erros de rede e de resposta), nas **fronteiras de erro do React** (erros de renderização, C2.3), em **Server Actions e Route Handlers** (C2.5), e em um **tratador global** para o que escapar (§window.onerror§, §unhandledrejection§);
- **Recuperação**: permitir **tentar de novo** quando fizer sentido; **degradar** (mostrar o restante da página) em vez de derrubar tudo (fronteira por widget);
- **Erros esperados não são exceções**: validação e "não encontrado" são **estados**, não falhas.

### Observabilidade
Três pilares: **logs** (eventos), **métricas** (números ao longo do tempo) e **traces** (o caminho de uma requisição entre serviços). No frontend:
- **Erros** enviados a um serviço de monitoramento, com **versão do app**, **rota**, **navegador** e **trilha de ações** (breadcrumbs); **source maps** para ler o código original (guardados com acesso restrito);
- **Desempenho e experiência** (RUM, C2.7);
- **Logs estruturados** (objetos JSON, não texto livre) com **nível**, **mensagem**, **contexto** e um **identificador de correlação** (propagado ao backend no cabeçalho da requisição para ligar frontend e servidor);
- **OpenTelemetry** no servidor (C2.5) e no navegador para traces distribuídos;
- **Alertas** poucos e acionáveis (C2.7).
**Segurança e privacidade**: **nunca** registre **senhas, tokens, números de cartão, dados pessoais** ou corpos completos de requisição; **redija** campos sensíveis antes de enviar (substituir por §[REDIGIDO]§), limite o tamanho e respeite consentimento e leis de proteção de dados. Aplique a mesma regra a **mensagens de erro** exibidas. O desafio de código implementa a redação de campos sensíveis, inclusive em objetos aninhados.

### Convenções que valem
Convenções só funcionam se **automatizadas**:
- **Formatação** (Prettier) e **lint** (ESLint, com regras de acessibilidade e de hooks) na **CI** e no editor; **TypeScript** estrito;
- **Nomes** e **estrutura** de pastas documentados e verificados (regras de fronteira, aula 1);
- **Commits** convencionais (C1.6) e **mensagens de pull request** com modelo; **revisão** de código com checklist (acessibilidade, testes, erros, performance);
- **Testes** exigidos para código novo e para correções (C2.6);
- **Componentes** de interface do design system (C2.2), documentados em Storybook;
- **Dependências**: política de atualização (renovação automática com testes), **auditoria** de vulnerabilidades e de **licenças**, número de dependências sob controle;
- **Feature flags** para publicar com segurança e desligar rápido, com **limpeza** de flags antigas.

### ADRs e memória da arquitetura
O **ADR** (C2.4) registra decisões importantes: contexto, decisão, alternativas, consequências e revisão. Boas práticas: **curtos**, **versionados** no repositório (§docs/adr/0007-estrutura-por-features.md§), **imutáveis** (uma decisão nova **substitui** a anterior, apontando para ela), **ligados** a pull requests e **revisitados** em data prevista. Exemplos de ADRs de frontend: estrutura de pastas e regras de dependência; biblioteca de estado e de cache de dados; estratégia de renderização; política de erros e de logs; uso de monorepo; adoção (ou não) de microfrontends (aula 7).

### Saúde da base de código
Acompanhe **indicadores** simples: tamanho do pacote por rota (C2.7), tempo de build e de testes, **ciclos e violações** de fronteira, cobertura de ramos de áreas críticas (C2.6), **idade das dependências**, erros em produção por versão, tempo para entrar em produção (lead time) e taxa de reversões. Use-os para **decidir onde investir**, não para punir equipes.

### Documentação que funciona
README por pacote ou feature (para que serve, como usar, como testar), **exemplos executáveis** (Storybook, testes) e um **mapa** do sistema (diagrama de contexto e de módulos) atualizado por quem muda a estrutura. Documentação **junto do código** e **revisada no mesmo pull request**.`,
  concepts: [
    { term: 'Contrato', def: 'Descrição explícita do formato do que cruza uma fronteira (API, módulo, evento).' },
    { term: 'Validação em tempo de execução', def: 'Verificação de que os dados recebidos obedecem ao esquema esperado, já que tipos não existem em execução.' },
    { term: 'Esquema (Zod)', def: 'Definição de formato de dados usada para validar e inferir tipos.' },
    { term: 'Modelo de erros', def: 'Padrão de categorias, códigos e formato dos erros da aplicação.' },
    { term: 'Fronteira de erro', def: 'Componente que captura erros de renderização dos descendentes e mostra uma alternativa.' },
    { term: 'Log estruturado', def: 'Registro em formato de objeto (JSON) com campos padronizados.' },
    { term: 'Identificador de correlação', def: 'Id propagado entre frontend e backend para ligar os registros de uma mesma requisição.' },
    { term: 'Redação de dados', def: 'Substituição de campos sensíveis por um marcador antes de registrar ou enviar.' },
    { term: 'Feature flag', def: 'Chave que liga ou desliga uma funcionalidade sem novo deploy.' }
  ],
  examples: R`**Analogia:** os contratos são a **alfândega** nas fronteiras do país: confere-se o que entra (validação) em vez de confiar na etiqueta da mala (o tipo do TypeScript). O modelo de erros é o **sistema de sinalização** do prédio (todo mundo entende "saída de emergência"); a observabilidade, as **câmeras e sensores** (sem gravar o que é privado); o ADR é o **livro de atas** do condomínio.

**Exemplo de contrato validado e de erro padronizado:**
§§§
const Pedido = z.object({ id: z.number().int(), total: z.number().nonnegative(), status: z.enum(['novo', 'pago', 'cancelado']) });
erro = { codigo: 'PEDIDO_NAO_ENCONTRADO', mensagem: 'Pedido não encontrado.', recuperavel: false }
log  = { nivel: 'error', msg: 'falha ao salvar', ctx: { usuario: '[REDIGIDO]', rota: '/pedidos/:id', versao: '2026.11.3' }, correlacao: 'c-8f2a' }
§§§
Nenhum item deste exemplo foi executado em laboratório: servem de modelo; o desafio de código do curso (redação de logs) foi executado.

**Cenário ilustrativo (não medido):** uma tela de pedidos quebrava com tela branca sempre que a API devolvia o campo §total§ como texto em vez de número. Com a validação do esquema na fronteira (erro claro no log, com a versão e a rota) e uma fronteira de erro por widget, o resto da página continuou utilizável e a causa foi encontrada em minutos.`,
  code: [
    { title: 'Validar a resposta da API na fronteira e padronizar o erro', lang: 'js', code: R`import { z } from 'zod';

const Pedido = z.object({ id: z.number().int(), total: z.number().nonnegative(), status: z.enum(['novo', 'pago', 'cancelado']) });

export class ErroDeApp extends Error {
  constructor(codigo, mensagem, { recuperavel = false, detalhes } = {}) { super(mensagem); this.codigo = codigo; this.recuperavel = recuperavel; this.detalhes = detalhes; }
}

export async function buscarPedido(id, { signal } = {}) {
  let r;
  try { r = await fetch('/api/pedidos/' + id, { signal }); }
  catch { throw new ErroDeApp('REDE', 'Sem conexão. Tente de novo.', { recuperavel: true }); }
  if (r.status === 404) throw new ErroDeApp('PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado.');
  if (!r.ok) throw new ErroDeApp('SERVIDOR', 'Não foi possível carregar o pedido.', { recuperavel: true });
  const dados = Pedido.safeParse(await r.json());
  if (!dados.success) throw new ErroDeApp('CONTRATO_INVALIDO', 'Resposta inesperada do servidor.', { detalhes: dados.error.issues });
  return dados.data;
}`, notes: [{ l: '11', t: 'Erros de rede viram um erro de app recuperável (o cliente pode tentar de novo).' }, { l: '16', t: 'safeParse não lança: permite registrar os detalhes do contrato quebrado (sem expor ao usuário).' }] },
    { title: 'Redação de campos sensíveis antes de registrar', lang: 'js', code: R`const SENSIVEIS = /senha|token|authorization|cartao|cpf|secret/i;

export function redigir(valor, profundidade = 0) {
  if (profundidade > 6) return '[PROFUNDO]';
  if (Array.isArray(valor)) return valor.map((v) => redigir(v, profundidade + 1));
  if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, SENSIVEIS.test(k) ? '[REDIGIDO]' : redigir(v, profundidade + 1)]));
  return valor;
}
logger.error({ msg: 'falha no login', ctx: redigir({ usuario: 'ana', senha: 'x', cabecalhos: { authorization: 'Bearer ...' } }) });`, notes: [{ l: '1', t: 'Padrão por nome de campo; complemente com listas explícitas por feature.' }, { l: '4', t: 'Limite de profundidade evita laços em estruturas circulares ou enormes.' }] }
  ],
  bestPractices: ['Valide em tempo de execução tudo que cruza uma fronteira (API, URL, eventos, configuração).', 'Padronize o modelo de erros e capture-os em camadas (cliente HTTP, fronteiras, tratador global).', 'Use logs estruturados com correlação, versão e rota e redija dados sensíveis.', 'Automatize formatação, lint, testes e verificações de dependência.', 'Registre decisões em ADRs curtos, versionados e revisados.', 'Acompanhe poucos indicadores de saúde para decidir investimentos.'],
  mistakes: ['Confiar nos tipos do TypeScript para dados externos.', 'Mensagens de erro vazias ou com detalhes internos.', 'Registrar senhas, tokens ou dados pessoais em logs.', 'Convenções só em documentos, sem ferramenta que as imponha.', 'Tratar erros esperados (validação, 404) como exceções.', 'ADRs que ninguém lê ou que são reescritos em vez de substituídos.'],
  market: `Contratos validados, erros padronizados, observabilidade segura e ADRs distinguem equipes que mantêm produtos grandes por anos de equipes que reescrevem a cada dois. São assuntos recorrentes em entrevistas de arquitetura e em revisões de código sêniores.`,
  summary: `Em bases grandes, os defeitos nascem nas fronteiras: valide em tempo de execução os dados externos (esquemas), gere tipos a partir de uma especificação e versione as mudanças incompatíveis. Padronize os erros (categorias, código estável, recuperabilidade) e capture-os por camadas. Instrumente com logs estruturados, correlação e versão, redigindo dados sensíveis. Imponha convenções por ferramenta e registre decisões em ADRs; acompanhe indicadores de saúde.`,
  refs: [REF.zodDocs, REF.errorBoundary, REF.otel, REF.owaspLogging, REF.adr],
  cards: [
    { q: 'Por que validar a resposta da API em tempo de execução?', a: 'Porque os tipos do TypeScript não existem em execução e o servidor pode devolver outro formato.' },
    { q: 'O que um bom modelo de erros define?', a: 'Categorias, um código estável, uma mensagem clara para a pessoa e se o erro é recuperável.' },
    { q: 'O que não registrar em logs?', a: 'Senhas, tokens, números de cartão e dados pessoais; redija os campos sensíveis antes de registrar.' },
    { q: 'Para que serve o identificador de correlação?', a: 'Ligar os registros do frontend e do backend de uma mesma requisição.' }
  ]
},
{
  id: 'arq-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['monorepo', 'workspaces', 'Turborepo', 'Nx', 'cache de tarefas', 'afetados', 'pacotes'],
  title: 'Monorepos: workspaces, Turborepo e Nx, grafo de dependências, cache, tarefas afetadas e pacotes compartilhados',
  objectives: ['Explicar o que é um monorepo, suas vantagens e custos, e quando ele compensa', 'Configurar workspaces e pacotes internos (aplicativos e bibliotecas) com dependências entre si', 'Entender o grafo de tarefas e o cache do Turborepo e interpretar acertos e erros de cache', 'Calcular quais projetos são afetados por uma mudança e a ordem de build', 'Gerenciar versões, publicação e o compartilhamento de código (UI, utilidades, configurações)'],
  intro: `Um **monorepo** guarda **vários projetos** (aplicativos e bibliotecas) em **um único repositório**. Não é o mesmo que um monólito: os projetos continuam **separados e com fronteiras**, mas compartilham ferramentas, versões e código. A vantagem é **compartilhar sem publicar**, mudar a biblioteca e os apps **no mesmo commit** e ter uma **fonte única** de configuração. O custo é a **escala**: construir e testar **tudo** a cada mudança seria lento. Por isso existem **Turborepo** e **Nx**: constroem um **grafo de dependências**, executam as tarefas **na ordem e em paralelo**, **cacheiam** os resultados e rodam **só o afetado**. Os resultados abaixo foram **medidos** no laboratório (Turborepo 2.11.13, npm workspaces, 4 pacotes).`,
  theory: `### Monorepo x polirrepo
| | Monorepo | Vários repositórios |
|---|---|---|
| Compartilhar código | direto (importa o pacote local) | publicar versões e atualizar cada consumidor |
| Mudança que atravessa projetos | **um** pull request e um commit | vários pull requests coordenados |
| Ferramentas e configuração | uma só (lint, TypeScript, CI) | repetidas e divergentes |
| Isolamento e permissões | exige regras (CODEOWNERS) | natural por repositório |
| Escala | precisa de cache e "afetados" | cada repositório é pequeno |
| Descoberta e consistência | alta | baixa (versões divergem) |
Vale a pena quando há **código compartilhado** (design system, utilidades, tipos), **várias aplicações** relacionadas e equipes que **colaboram**. Não compensa para um único app pequeno ou equipes totalmente independentes, com ciclos de vida e permissões distintos.

### Workspaces e pacotes internos
Os gerenciadores (**npm**, **pnpm**, **Yarn**) oferecem **workspaces**: pastas com §package.json§ listadas no raiz (§"workspaces": ["apps/*", "packages/*"]§). Os pacotes se referenciam por nome (§"@mono/ui": "*"§) e a instalação cria **links** locais. Estrutura típica:
§§§
apps/web      apps/admin          (aplicações que serão implantadas)
packages/ui   packages/utils      (bibliotecas internas compartilhadas)
packages/config-eslint, config-ts (configurações compartilhadas)
§§§
Pacotes internos podem ser **compilados** (têm uma etapa de build e exportam §dist§, como no laboratório) ou **"just-in-time"** (exportam o código-fonte e o app consumidor o compila, o que simplifica e acelera o desenvolvimento). Declare as **dependências reais** de cada pacote (não dependa de itens "hoistados" por acaso), use §exports§ no §package.json§ para a **API pública** e **versões internas** coerentes. O **pnpm** é muito usado em monorepos por isolar melhor as dependências e economizar disco.

### Grafo de dependências e tarefas
Do §package.json§ de cada pacote, as ferramentas montam o **grafo**: no laboratório, §utils ← ui ← web§ e §utils ← admin§ (§admin§ não depende de §ui§). As **tarefas** (§build§, §test§, §lint§) têm relações:
§§§
{ "tasks": { "build": { "dependsOn": ["^build"], "inputs": ["src/**", "package.json"], "outputs": ["dist/**"] },
             "test":  { "dependsOn": ["build"], "inputs": ["src/**", "test/**"] } } }
§§§
- **§^build§** significa "o §build§ das **dependências** deste pacote antes";
- **§inputs§**: os arquivos que, se mudarem, **invalidam** o cache da tarefa;
- **§outputs§**: o que guardar e restaurar (§dist/**§).
O Turborepo executa as tarefas respeitando a ordem e **em paralelo** onde não há dependência.

### Cache de tarefas (medido)
O cache é indexado por um **hash** das entradas (arquivos, dependências, variáveis de ambiente declaradas, comando). Se o hash já existe, as **saídas são restauradas** em vez de refazer a tarefa. Medido (4 pacotes, cada build leva ~1,5 s):
§§§
1) build frio:                         4 executadas, 0 em cache | 6,9 s
2) mesmo código, de novo:              4 em cache | 90 ms ("FULL TURBO")
3) mudou packages/utils:               0 em cache (utils, ui, web e admin dependem dela) | 6,9 s
4) mudou só packages/ui:               2 em cache (utils e admin) | rebuild de ui e web | 4,6 s
§§§
Lições: o cache **elimina** trabalho repetido (6,9 s → 90 ms); uma mudança em um pacote **base** invalida **tudo que depende dele** (item 3); uma mudança em um pacote **folha** invalida pouco (item 4). Por isso, pacotes base devem ser **estáveis e pequenos**. Declare corretamente §inputs§ e variáveis de ambiente (uma variável esquecida gera **cache incorreto**). O **cache remoto** (compartilhado entre a equipe e a CI) multiplica o ganho: o que alguém já construiu, os demais baixam. Não foi executado cache remoto neste laboratório.

### Tarefas afetadas
Em vez de rodar tudo, rode **só o que a mudança afeta** (e seus dependentes): no Turborepo, §turbo run build --filter='...[HEAD^1]'§ (projetos alterados desde o commit anterior **e seus dependentes**); no Nx, §nx affected -t build§. Medido: depois de alterar §packages/ui§, o plano de execução incluiu §@mono/ui#build§, §@mono/web#build§ (dependente) e §@mono/utils#build§ (dependência necessária pelo §^build§, que virá do cache); §admin§ ficou **fora**. O cálculo é **um percurso no grafo**: dependentes diretos e transitivos dos projetos mudados (desafio de código da aula).

### Ordem de build e ciclos
A **ordem** é uma **ordenação topológica** do grafo: cada pacote depois de suas dependências; pacotes sem relação entre si formam **níveis** que rodam em paralelo (níveis do laboratório: §utils§; depois §ui§ e §admin§; depois §web§). **Ciclos** entre pacotes são **erros** (impossível ordenar): detecte e quebre (extraindo o comum para um terceiro pacote).

### Turborepo x Nx
- **Turborepo**: simples, focado em **orquestração de tarefas** e cache, ótimo para adotar em um monorepo de workspaces existente; configuração por §turbo.json§;
- **Nx**: mais **completo**: grafo de projetos com visualização, **geradores** e **plugins** por tecnologia, regras de **fronteira de módulos** (§@nx/enforce-module-boundaries§ com tags), **afetados**, cache local e remoto, orquestração em CI distribuída;
- Ambos oferecem **cache de tarefas**, **afetados** e **paralelismo**. A escolha depende de **simplicidade** (Turborepo) ou **recursos e convenções** (Nx). O laboratório executou o Turborepo; o Nx foi descrito conforme a documentação.

### Versões, publicação e mudanças
- Pacotes **só internos** podem ficar na mesma versão e nunca ser publicados;
- Bibliotecas **publicadas** (design system) usam **versionamento semântico** e ferramentas como **Changesets** (cada pull request declara o tipo de mudança, e a ferramenta atualiza versões e changelogs);
- **Atualizar dependências** de forma coordenada (uma versão do React em todo o monorepo, com a mesma ferramenta de atualização automática);
- **Compatibilidade de TypeScript**: referências de projeto e §paths§ coerentes.

### CI em monorepos
Rode o pipeline com **afetados** e **cache remoto**; separe o **build** do **deploy por aplicativo**; mantenha o **tempo de CI** sob controle (paralelismo e fragmentação); mantenha **regras de propriedade** (CODEOWNERS) por pasta; proteja a branch principal.

### Armadilhas
Pacotes **base grandes** (qualquer mudança reconstrói tudo); **dependências fantasma** (usar um pacote que não declarou); **ciclos**; §inputs§ e variáveis de ambiente mal declarados (cache incorreto); repositório **sem fronteiras** (o monorepo vira um monólito emaranhado: aplique as regras da aula 1); adotar monorepo **sem necessidade**.`,
  concepts: [
    { term: 'Monorepo', def: 'Repositório que contém vários projetos relacionados, com fronteiras entre eles.' },
    { term: 'Workspaces', def: 'Recurso dos gerenciadores de pacotes que liga pacotes locais em um mesmo repositório.' },
    { term: 'Turborepo', def: 'Ferramenta de orquestração de tarefas e cache para monorepos JavaScript.' },
    { term: 'Nx', def: 'Plataforma de monorepos com grafo de projetos, geradores, cache, afetados e regras de fronteira.' },
    { term: 'Grafo de dependências', def: 'Representação de quais pacotes dependem de quais.' },
    { term: 'Cache de tarefas', def: 'Armazenamento do resultado de tarefas indexado por um hash das entradas.' },
    { term: 'Projetos afetados', def: 'Projetos alterados e seus dependentes, que precisam ser reconstruídos ou testados.' },
    { term: 'Ordenação topológica', def: 'Ordem em que cada pacote vem depois de suas dependências.' },
    { term: 'Changesets', def: 'Ferramenta para declarar mudanças, versionar e gerar changelogs em monorepos.' }
  ],
  examples: R`**Analogia:** o monorepo é uma **fábrica com várias linhas de montagem** no mesmo galpão: compartilham peças (pacotes) e ferramentas. O cache de tarefas é o **estoque de peças prontas**: se a peça não mudou, pega-se do estoque (90 ms) em vez de fabricá-la de novo (6,9 s). "Afetados" é o **aviso de recall**: troca de uma peça base manda refazer tudo o que a usa; uma peça de ponta, quase nada.

**Resultados medidos (Turborepo 2.11.13, npm workspaces, 4 pacotes, build de 1,5 s cada):**
§§§
grafo: utils <- ui <- web ; utils <- admin
build frio: 4 executadas | 6,9 s         de novo sem mudanças: 4 em cache | 90 ms (FULL TURBO)
mudou utils: 0 em cache | 6,9 s          mudou ui: 2 em cache (utils, admin) | 4,6 s
filtro de afetados desde HEAD^1 (ui mudou): ui#build, utils#build, web#build  (admin fora)
§§§
Nx, cache remoto e Changesets não foram executados.

**Cenário ilustrativo (não medido):** uma empresa tinha um design system publicado e quatro aplicações em repositórios separados; atualizar um botão levava uma semana de pull requests. Em um monorepo com Turborepo, o mesmo ajuste foi um único pull request, com a CI executando só os pacotes afetados e o cache remoto reduzindo a verificação a minutos.`,
  code: [
    { title: 'Workspaces e turbo.json (executado)', lang: 'json', code: R`// package.json (raiz)
{ "name": "mono", "private": true, "workspaces": ["apps/*", "packages/*"], "devDependencies": { "turbo": "2.11.13" } }

// turbo.json
{ "tasks": {
    "build": { "dependsOn": ["^build"], "inputs": ["src/**", "package.json"], "outputs": ["dist/**"] },
    "test":  { "dependsOn": ["build"], "inputs": ["src/**", "test/**"] }
} }

// apps/web/package.json (trecho)
{ "name": "@mono/web", "dependencies": { "@mono/ui": "*", "@mono/utils": "*" } }`, notes: [{ l: '5', t: '^build: o build das dependências vem antes (medido: utils, depois ui e admin, depois web).' }, { l: '5', t: 'inputs e outputs definem o hash e o que é restaurado do cache.' }] },
    { title: 'Comandos do dia a dia (medidos no laboratório)', lang: 'bash', code: R`npx turbo run build                              # 1ª vez: executa; 2ª vez sem mudanças: FULL TURBO
npx turbo run build --filter=@mono/web...        # o web e tudo de que ele depende
npx turbo run build --filter='...[HEAD^1]'       # alterados desde o commit anterior e seus dependentes
npx turbo ls                                     # lista os pacotes do workspace
npx turbo run build --dry=json                   # plano de execução sem rodar nada`, notes: [{ l: '2', t: 'As reticências indicam dependências (depois do nome) ou dependentes (antes do nome).' }, { l: '4', t: 'Medido: 4 pacotes (admin, ui, utils, web).' }] }
  ],
  bestPractices: ['Use monorepo quando houver código compartilhado e equipes que colaboram; mantenha fronteiras e CODEOWNERS.', 'Declare dependências reais e a API pública (exports) de cada pacote.', 'Configure inputs, outputs e variáveis de ambiente corretamente para um cache confiável.', 'Mantenha pacotes base pequenos e estáveis.', 'Rode na CI só os afetados, com cache remoto.', 'Versione bibliotecas publicadas com Changesets e atualize dependências de forma coordenada.'],
  mistakes: ['Um pacote base enorme que reconstrói tudo.', 'Dependências fantasma (usar sem declarar).', 'Ciclos entre pacotes.', 'Cache incorreto por inputs ou variáveis mal declarados.', 'Monorepo sem regras de fronteira.', 'Adotar monorepo para um único app pequeno.'],
  market: `Monorepos com Turborepo ou Nx são comuns em empresas com várias aplicações e design systems. Saber explicar o grafo, o cache, as tarefas afetadas e as armadilhas dos pacotes base é esperado em vagas sêniores e de plataforma de frontend.`,
  summary: `Um monorepo reúne projetos com fronteiras e permite compartilhar código sem publicar. Workspaces ligam pacotes locais; Turborepo e Nx montam o grafo, ordenam e paralelizam as tarefas, cacheiam por hash e rodam só os afetados. Medido: build frio 6,9 s, repetido 90 ms (FULL TURBO); mudar um pacote base reconstruiu tudo, mudar uma folha reconstruiu 2 de 4. Declare inputs, outputs e dependências, mantenha pacotes base pequenos, versione com Changesets e aplique as regras de fronteira.`,
  refs: [REF.turboCaching, REF.turboTasks, REF.turboStructure, REF.turboCI, REF.nxRunTasks, REF.npmWorkspaces, REF.pnpmWorkspaces, REF.changesets],
  cards: [
    { q: 'O que significa "^build" no turbo.json?', a: 'Executar antes o build das dependências do pacote.' },
    { q: 'Por que mudar um pacote base invalida tanto cache?', a: 'Porque todos os pacotes que dependem dele têm o hash alterado e precisam ser reconstruídos.' },
    { q: 'O que são projetos afetados?', a: 'Os projetos alterados e seus dependentes (diretos e transitivos), que precisam ser reconstruídos ou testados.' },
    { q: 'Quando um monorepo compensa?', a: 'Quando há código compartilhado, várias aplicações relacionadas e equipes que colaboram; para um app pequeno não compensa.' }
  ]
}
];
