// C2.8 — Arquitetura frontend, monorepos e microfrontends. Aulas 4 a 7 (conceitos; Module Federation; comunicação; quando usar ou evitar).
import { REF } from './c28-a.mjs';
const R = String.raw;

export const REF2 = {
  fowlerMfe: { title: 'Martin Fowler — Micro Frontends', url: 'https://martinfowler.com/articles/micro-frontends.html', kind: 'doc' },
  mfeOrg: { title: 'micro-frontends.org', url: 'https://micro-frontends.org/', kind: 'doc' },
  singleSpa: { title: 'single-spa — Documentação', url: 'https://single-spa.js.org/', kind: 'doc' },
  webComponents: { title: 'MDN — Web Components', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components', kind: 'doc' },
  mfDocs: { title: 'Module Federation — Documentação', url: 'https://module-federation.io/', kind: 'doc' },
  mfStart: { title: 'Module Federation — Primeiros passos', url: 'https://module-federation.io/guide/start/index.html', kind: 'doc' },
  semver: { title: 'Semantic Versioning 2.0.0 (pt-BR)', url: 'https://semver.org/lang/pt-BR/', kind: 'doc' },
  customEvent: { title: 'MDN — CustomEvent', url: 'https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent', kind: 'doc' },
  broadcast: { title: 'MDN — BroadcastChannel', url: 'https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel', kind: 'doc' },
  conway: { title: 'Martin Fowler — Conway\'s Law', url: 'https://martinfowler.com/bliki/ConwaysLaw.html', kind: 'doc' },
  strangler: { title: 'Martin Fowler — Strangler Fig Application', url: 'https://martinfowler.com/bliki/StranglerFigApplication.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'arq-04', moduleId: 'm3', order: 4, minutes: 65, tags: ['microfrontends', 'integração', 'iframes', 'Web Components', 'build', 'execução', 'composição'],
  title: 'Microfrontends: conceitos e abordagens (integração no build, na execução, iframes, Web Components e servidor)',
  objectives: ['Definir microfrontends e os problemas organizacionais que tentam resolver', 'Descrever as abordagens de integração (build, execução, iframes, Web Components, composição no servidor) e seus compromissos', 'Dividir a aplicação por domínio de negócio e não por camada técnica', 'Listar as preocupações transversais (design system, roteamento, autenticação, desempenho, versões)', 'Resolver a localização de um módulo remoto com ambiente e alternativa em caso de falha'],
  intro: `**Microfrontends** aplicam ao frontend a ideia dos microsserviços: dividir uma aplicação web grande em **partes independentes**, cada uma de **responsabilidade de uma equipe** que **desenvolve, testa e implanta** a sua sem coordenar com as demais. O objetivo principal é **organizacional** (autonomia e escala de equipes), não técnico. Também têm um **custo alto** (complexidade, desempenho, consistência). Esta aula apresenta a ideia, as **formas de integração** e seus compromissos; a aula 5 mostra a técnica mais usada (Module Federation, **executada no laboratório**) e a aula 7 discute **quando não usar**.`,
  theory: `### A ideia e a motivação
Um frontend monolítico grande tem **um repositório, um build e um deploy**: cada mudança espera o ciclo comum, equipes disputam o código e o risco de uma publicação é de **todos**. Os microfrontends dividem a aplicação em **fatias verticais de negócio** (por exemplo, **Catálogo**, **Carrinho**, **Conta**), cada uma com seu **código, testes e pipeline**, e um **contêiner (shell)** que as **compõe** na página. Princípios (micro-frontends.org): **tecnologia agnóstica** (cada equipe escolhe, com moderação), **isolamento** (sem depender de estado compartilhado em tempo de execução), **convenções** de nomes e **plataforma** própria. **Fatias verticais**, não horizontais: dividir por **camada** (um microfrontend de cabeçalho, outro de lista) cria dependências entre equipes; dividir por **domínio** reduz a coordenação.

### Abordagens de integração
1. **Integração em tempo de build (pacotes npm)**: cada parte é publicada como **pacote**; o shell as instala e faz **um** build. Simples e eficiente (um único pacote, dependências compartilhadas, tree shaking), mas **perde a implantação independente**: mudar uma parte exige **rebuild e deploy do shell**. É, na prática, uma **biblioteca**; funciona bem em monorepos (aula 3);
2. **Integração em tempo de execução (JavaScript carregado dinamicamente)**: o shell **carrega em execução** o código de cada microfrontend de uma **URL** própria (remotos). **Implantação independente** de verdade. Implementações: **Module Federation** (aula 5), **single-spa** (orquestrador de aplicações que registra rotas e monta/desmonta cada uma), módulos ES com **import maps**;
3. **iframes**: cada microfrontend em um **iframe**: **isolamento forte** (CSS, JavaScript, falhas) e integração trivial; **custos**: rolagem e altura, **foco e acessibilidade** difíceis, **URL e histórico** desconectados, **comunicação** por mensagens (§postMessage§), **desempenho** (cada iframe carrega seu ambiente), **estilo** inconsistente. Bom para **integrar aplicações de terceiros** ou legadas;
4. **Web Components (custom elements)**: cada parte exposta como um **elemento customizado** (§<loja-carrinho>§), **independente de framework**, com **Shadow DOM** (encapsulamento de estilo) e API por atributos e eventos. Bom para **fronteiras entre tecnologias** e design systems; **cuidados**: integração com frameworks e **SSR** (limitada), formulários e acessibilidade no Shadow DOM, estilos globais;
5. **Composição no servidor (SSI, ESI, edge ou renderização no servidor)**: o servidor (ou o edge/CDN) **monta o HTML** juntando fragmentos de cada equipe: **bom desempenho inicial e SEO**; mais **infraestrutura** e **interatividade** exigindo hidratação coordenada;
6. **Combinações**: shell com roteamento no cliente que carrega remotos em execução, com SSR do shell e fragmentos.

### Compromissos (resumo)
| Abordagem | Implantação independente | Isolamento | Desempenho | Complexidade |
|---|---|---|---|---|
| Pacotes npm (build) | não | baixo | ótimo | baixa |
| Execução (Module Federation, single-spa) | sim | médio | bom, com cuidado | média/alta |
| iframes | sim | alto | custoso | média (comunicação) |
| Web Components | sim | médio/alto | bom | média |
| Servidor/edge | sim | médio | ótimo inicial | alta (infra) |
Não há "a melhor": depende de **quantas equipes**, **quão independentes devem ser** e **que custos aceitar**.

### O shell (contêiner)
O shell cuida do que é **comum**: **roteamento de alto nível** (qual microfrontend aparece em qual URL), **autenticação e sessão**, **layout e navegação**, **carregamento** dos microfrontends com **estados de carregamento e erro** (uma parte que falha **não derruba** a página: use **fronteiras de erro**, C2.3), **eventos** e contratos compartilhados. Mantenha o shell **fino**: se ele cresce, volta o monólito.

### Preocupações transversais
- **Consistência visual**: um **design system** compartilhado (C2.2) como pacote versionado ou como componentes remotos; tokens de design;
- **Estilos**: **isolamento** (CSS Modules, prefixos, Shadow DOM) para um CSS não vazar para outro;
- **Roteamento**: rotas do shell para o microfrontend e **rotas internas** dele (prefixos por domínio); a **URL** é o contrato mais estável entre eles;
- **Autenticação**: uma sessão para todos (cookie, token fornecido pelo shell);
- **Desempenho**: cada microfrontend pode **duplicar dependências** (React várias vezes) e aumentar o JavaScript; use **dependências compartilhadas** (aula 5), meça (C2.7) e **orce** o peso por parte;
- **Versões e compatibilidade**: contratos versionados (aula 6), testes de contrato e **deploy compatível**;
- **Observabilidade**: logs e traces com **identificador do microfrontend e da versão**; erros atribuídos à equipe certa;
- **Testes**: cada parte testada de forma isolada; **testes de integração** do conjunto (E2E dos fluxos que cruzam partes, C2.6);
- **Dados**: cada microfrontend com seu **BFF/API** (C4), evitando acoplar equipes a um backend único;
- **SEO e SSR**: exigem estratégia (composição no servidor).

### Resolução do endereço dos remotos
O shell precisa saber **onde** está cada remoto: **URL fixa**, **configuração por ambiente** (desenvolvimento, homologação, produção) ou **manifesto dinâmico** (um serviço que informa a versão atual de cada remoto, permitindo **implantar sem rebuild do shell** e **voltar versão** rapidamente). Boas práticas: **versionar** os artefatos (URL com hash ou versão, com cache longo exceto o ponto de entrada), **fallback** quando um remoto não carrega (versão anterior, página de erro local), **verificação de saúde**. O desafio de código implementa uma resolução com ambiente e alternativa.

### Armadilhas
Dividir cedo demais; fatiar por camada técnica; deixar cada equipe escolher um framework (tamanho e inconsistência); estado global compartilhado entre microfrontends (acoplamento oculto); falta de contratos; ninguém cuida da experiência **como um todo**; o shell que vira monólito.

### Vale a pena? (adiantando a aula 7)
Os microfrontends resolvem **problemas de organização em escala** (muitas equipes, implantação independente, migração gradual de tecnologia). Para **poucas equipes**, um **monólito modular** (aula 1) ou **monorepo com pacotes** (aula 3) costuma ser **mais simples e rápido**.`,
  concepts: [
    { term: 'Microfrontend', def: 'Parte independente de um frontend, de responsabilidade de uma equipe, com ciclo próprio de desenvolvimento e implantação.' },
    { term: 'Shell (contêiner)', def: 'Aplicação que compõe os microfrontends, cuidando de rotas, autenticação, layout e carregamento.' },
    { term: 'Fatia vertical', def: 'Divisão por domínio de negócio, contendo da interface aos dados daquela parte.' },
    { term: 'Integração em tempo de build', def: 'Composição das partes como pacotes instalados e empacotados juntos.' },
    { term: 'Integração em tempo de execução', def: 'Carregamento do código de cada parte, de URLs próprias, quando a página roda.' },
    { term: 'iframe', def: 'Elemento que incorpora outro documento HTML com isolamento forte.' },
    { term: 'Web Component', def: 'Elemento customizado reutilizável, com Shadow DOM, independente de framework.' },
    { term: 'single-spa', def: 'Orquestrador que registra aplicações e as monta e desmonta conforme a rota.' },
    { term: 'Manifesto de remotos', def: 'Serviço ou arquivo que informa a versão e a URL atuais de cada remoto.' }
  ],
  examples: R`**Analogia:** uma grande loja de departamentos com vários lojistas independentes: cada **lojista** (equipe) decide o estoque e o horário de reposição (deploy), e o **shopping** (shell) cuida das portas, da sinalização e do corredor. Funciona bem com muitos lojistas; para três lojistas que se conhecem, uma loja única bem organizada (monólito modular) é mais simples e mais barata.

**Estrutura de um shell com microfrontends por domínio (modelo):**
§§§
shell (equipe plataforma):  rotas, sessão, layout, carregamento com erro e fallback
  /catalogo/*  -> remoto "catalogo"   (equipe Catálogo)
  /carrinho/*  -> remoto "carrinho"   (equipe Carrinho)
  /conta/*     -> remoto "conta"      (equipe Conta)
  compartilhado: design system (pacote versionado), tipos de contrato, cliente de eventos
§§§
Nenhuma destas estruturas foi executada em laboratório; a integração em tempo de execução com Module Federation foi executada na aula 5.

**Cenário ilustrativo (não medido):** uma empresa com seis equipes em um único frontend tinha um deploy semanal coordenado e conflitos constantes. Dividir por domínio com um shell fino, remotos carregados em execução e um design system compartilhado permitiu deploys independentes; em compensação, o time de plataforma passou a cuidar de contratos, versões e do orçamento de JavaScript da composição.`,
  code: [
    { title: 'Shell que carrega um remoto com erro e fallback (modelo)', lang: 'jsx', code: R`import { lazy, Suspense, Component } from 'react';

const Catalogo = lazy(() => import('catalogo/App'));          // remoto (aula 5)

class FronteiraDeRemoto extends Component {
  state = { erro: null };
  static getDerivedStateFromError(erro) { return { erro }; }
  render() { return this.state.erro ? <p role="alert">Não foi possível carregar o catálogo. <button onClick={() => this.setState({ erro: null })}>Tentar de novo</button></p> : this.props.children; }
}

export function RotaCatalogo() {
  return <FronteiraDeRemoto><Suspense fallback={<p>Carregando catálogo...</p>}><Catalogo /></Suspense></FronteiraDeRemoto>;
}`, notes: [{ l: '3', t: 'O módulo vem de uma URL própria da equipe do catálogo, em tempo de execução.' }, { l: '5', t: 'Um remoto que falha não pode derrubar a página inteira: fronteira de erro por remoto.' }] },
    { title: 'Web Component como fronteira entre tecnologias', lang: 'js', code: R`class LojaCarrinho extends HTMLElement {
  static observedAttributes = ['itens'];
  connectedCallback() { this.attachShadow({ mode: 'open' }); this.render(); }
  attributeChangedCallback() { if (this.shadowRoot) this.render(); }
  render() { this.shadowRoot.innerHTML = '<style>p{font-family:sans-serif}</style><p>Itens: ' + (this.getAttribute('itens') ?? 0) + '</p>'; }
}
customElements.define('loja-carrinho', LojaCarrinho);
// uso em qualquer framework: <loja-carrinho itens="3"></loja-carrinho>
// saída para o exterior: this.dispatchEvent(new CustomEvent('carrinho:alterado', { detail: { itens: 4 }, bubbles: true, composed: true }));`, notes: [{ l: '3', t: 'O Shadow DOM encapsula o estilo: não vaza para o resto da página.' }, { l: '9', t: 'composed e bubbles permitem que o evento atravesse a fronteira do Shadow DOM.' }] }
  ],
  bestPractices: ['Adote microfrontends por um motivo organizacional claro e meça o custo.', 'Divida por domínio de negócio (fatias verticais), não por camada técnica.', 'Mantenha o shell fino, com fronteiras de erro e fallback por remoto.', 'Compartilhe um design system e as dependências pesadas e meça o JavaScript total.', 'Defina contratos versionados, testes de contrato e observabilidade por microfrontend e versão.', 'Use manifesto ou configuração por ambiente e permita voltar versões.'],
  mistakes: ['Dividir cedo demais ou por camadas.', 'Cada equipe com um framework diferente sem necessidade.', 'Estado global compartilhado entre microfrontends.', 'Duplicar React e bibliotecas pesadas em cada parte.', 'Shell que cresce até virar um monólito.', 'Nenhuma estratégia de consistência visual ou de erros.'],
  market: `Microfrontends aparecem em empresas grandes com muitas equipes de frontend e em migrações graduais de tecnologia. Saber explicar as abordagens, seus compromissos e, principalmente, quando não usá-los, é pergunta frequente em entrevistas de arquitetura.`,
  summary: `Microfrontends dividem um frontend por domínio em partes de equipes autônomas, compostas por um shell fino. As abordagens são: pacotes no build (simples, sem deploy independente), carregamento em execução (Module Federation, single-spa), iframes (isolamento forte e custos), Web Components e composição no servidor. Cuide de design system, estilos, rotas, autenticação, desempenho, versões, observabilidade, testes e do endereço dos remotos (ambiente, manifesto e fallback). O ganho é organizacional e o custo é real.`,
  refs: [REF2.fowlerMfe, REF2.mfeOrg, REF2.singleSpa, REF2.webComponents],
  cards: [
    { q: 'Qual é o principal objetivo dos microfrontends?', a: 'Autonomia de equipes em escala (desenvolver e implantar independentemente), mais que um ganho técnico.' },
    { q: 'Por que dividir por domínio e não por camada?', a: 'Fatias verticais reduzem a coordenação entre equipes; divisões por camada criam dependências constantes.' },
    { q: 'Qual a desvantagem de integrar microfrontends como pacotes npm?', a: 'Perde-se a implantação independente: mudar uma parte exige rebuild e deploy do shell.' },
    { q: 'Quando um iframe é adequado?', a: 'Para integrar aplicações de terceiros ou legadas que exigem isolamento forte, aceitando custos de acessibilidade, URL e comunicação.' }
  ]
},
{
  id: 'arq-05', moduleId: 'm3', order: 5, minutes: 75, tags: ['Module Federation', 'host', 'remote', 'shared', 'singleton', 'semver', 'tipos'],
  title: 'Module Federation na prática: host e remote, shared, versões e tipos',
  objectives: ['Configurar um remote que expõe módulos e um host que os consome em execução', 'Entender o papel de shared, singleton e requiredVersion e prever conflitos de versão', 'Aplicar a regra de compatibilidade semântica (^, ~, >=) para decidir se uma versão satisfaz uma faixa', 'Tratar falhas de carregamento, fallback e implantação independente', 'Compartilhar tipos e contratos entre host e remotes'],
  intro: `O **Module Federation** permite que uma aplicação (o **host**) **carregue em execução** módulos publicados por **outra** aplicação (o **remote**), compartilhando dependências (React, por exemplo) para não duplicá-las. É a técnica mais usada para microfrontends em **tempo de execução**. Foi criado no webpack 5 e hoje existe para vários empacotadores (Rspack, **Vite**, etc.). Neste laboratório executamos um **host** e um **remote** com **Vite 8.3.8** e o plugin **@module-federation/vite 1.25.0** e abrimos o host no **Chrome 157**: o botão do remote apareceu, estava interativo e **só os arquivos do remote** foram pedidos à sua origem.`,
  theory: `### Os papéis
- **Remote**: aplicação que **expõe** módulos (componentes, funções) por um **ponto de entrada** (§remoteEntry.js§) e os publica em uma URL;
- **Host**: aplicação que **declara** os remotes que consome (§remotes§) e os importa como módulos (§import('remoto/Botao')§), carregados **em execução**;
- uma aplicação pode ser **host e remote** ao mesmo tempo; o contêiner (shell) costuma ser o host principal.
O resultado: o **remote** é **construído e implantado de forma independente**; o host o **encontra pela URL** na execução, sem novo build.

### Configuração (medida)
§§§
// remote/vite.config.mjs
federation({ name: 'remoto', filename: 'remoteEntry.js',
  exposes: { './Botao': './src/Botao.jsx' },
  shared: { react: { singleton: true, requiredVersion: '^19.0.0' }, 'react-dom': { singleton: true, requiredVersion: '^19.0.0' } } })

// host/vite.config.mjs
federation({ name: 'host',
  remotes: { remoto: { type: 'module', name: 'remoto', entry: 'http://localhost:4174/remoteEntry.js' } },
  shared: { react: { singleton: true, requiredVersion: '^19.0.0' }, 'react-dom': { singleton: true, requiredVersion: '^19.0.0' } } })

// host/src/main.jsx
const Botao = lazy(() => import('remoto/Botao'));
§§§
Medido (Vite 8.3.8, React 19.3.1, plugin 1.25.0): **os dois builds concluíram**; o do remote gerou §remoteEntry.js§ e os chunks do §Botao§ e do runtime de compartilhamento; ao abrir o host no Chrome com o remote servido em outra porta (4174):
§§§
botão do remote: "remoto 0" -> (clique) -> "remoto 1"     (estado e eventos funcionam)
requisições à origem do remote: remoteEntry.js, chunks do Botao e do runtime de compartilhamento
§§§
Houve **um erro de console** do tipo 404 (recurso não encontrado; provavelmente o ícone da página; não foi investigado). A **configuração** (nomes, §exposes§, §remotes§, §shared§) é igual em outros empacotadores com pequenas variações de sintaxe: consulte a documentação do plugin e da versão em uso.

### shared: não duplicar dependências
Sem compartilhamento, **cada remote traz seu React**: o JavaScript **duplica** e, pior, pode haver **duas instâncias do React** (os hooks quebram: "Invalid hook call"). Em §shared§:
- **§singleton: true§**: **uma única instância** na página (essencial para React, ReactDOM, roteadores e contextos);
- **§requiredVersion§**: a **faixa** de versões aceita (por exemplo, §^19.0.0§);
- **§eager§**: carrega junto do pacote inicial (em vez de sob demanda; evite sem necessidade);
- **§strictVersion§**: **erro** se a versão disponível não satisfizer a faixa (em vez de apenas avisar).
A **negociação** ocorre em execução: cada participante declara suas versões; o runtime escolhe, para cada dependência compartilhada, **uma versão que satisfaça** as faixas dos participantes (tipicamente a **mais alta compatível**); se não houver intersecção, ocorre **aviso ou erro** e o remote pode carregar sua **própria cópia** (e, para singletons, quebrar).

### Compatibilidade semântica (semver)
As faixas seguem o **versionamento semântico** (§MAJOR.MINOR.PATCH§): **MAJOR** muda com quebra de compatibilidade; **MINOR** adiciona funcionalidade compatível; **PATCH** corrige. Operadores: §^18.0.0§ (compatível: >=18.0.0 e <19.0.0), §~18.2.0§ (>=18.2.0 e <18.3.0), §>=18 <20§, versão exata. Atenção às **versões 0.x**: em §^0.2.3§ só são compatíveis versões **0.2.x** (a coluna do meio funciona como major). Medido com a biblioteca §semver§ 7.8.6:
§§§
18.2.0 satisfaz ^18.0.0: true | 19.0.0 satisfaz ^18.0.0: false | 19.3.1 satisfaz >=18 <20: true
^18.0.0 e ^18.3.0 têm intersecção: true | ^18 e ^19: false (não há versão que sirva aos dois)
maior versão de [18.0.0, 18.3.1, 19.0.0] que satisfaz ^18.0.0: 18.3.1
^0.2.3: 0.2.9 satisfaz = true; 0.3.0 satisfaz = false
§§§
O desafio de código implementa uma versão **simplificada** desta lógica (satisfaz e resolução de uma dependência compartilhada), não a especificação completa. O **conflito de versões em §shared§** não foi testado no laboratório; o comportamento descrito segue a documentação.

### Tipos e contratos
O TypeScript **não enxerga** módulos remotos (só existem em execução). Soluções: o plugin gera **arquivos de tipos** (§.d.ts§ do remote, publicados junto de §remoteEntry§ e baixados pelo host); ou um **pacote de contratos** (tipos e esquemas) versionado e compartilhado em um monorepo; ou declarações manuais (§declare module 'remoto/Botao'§) como último recurso. Teste de contrato: o host valida as **props** que passa e o remote valida o que recebe (aula 6).

### Implantação independente e segurança
- **Versionamento dos artefatos**: nomes com hash para os chunks (cache longo) e **ponto de entrada** (§remoteEntry.js§) com cache curto ou por manifesto;
- **Manifesto** de versões (aula 4): o shell lê a URL atual de cada remote e permite **voltar versão** sem rebuild;
- **Falhas**: se o remote não responde, o host mostra um **fallback** (fronteira de erro e tentativa de novo; versão anterior em cache);
- **Segurança**: carregar código de outra origem é **executar código externo** na sua página: **só de origens confiáveis**, com **CSP** (§script-src§) restritiva, **integridade** quando possível, CORS configurado (o laboratório serviu os arquivos com cabeçalho §access-control-allow-origin§), e atenção a **cadeia de suprimentos** (C7);
- **Ambientes**: a URL do remote deve vir de **configuração**, não fixa no código.

### Desenvolvimento e testes
Rode remotes localmente com servidores próprios (portas), ou **execute o host contra o remote de homologação**; teste o remote **isolado** (como uma aplicação normal) e a **composição** com E2E (C2.6). Mantenha um **host de desenvolvimento** simples para cada remote.

### Desempenho
O Module Federation adiciona **requisições** (o ponto de entrada, o runtime de compartilhamento e os chunks do remote) e uma **cascata** (host → remoteEntry → chunks). Mitigações: **preload** do ponto de entrada, **compartilhar dependências**, **dividir** bem os módulos expostos, **orçamento** de JavaScript por remote (C2.7) e medir o LCP/INP da composição.

### Alternativas e evolução
**Import maps** + módulos ES nativos, **single-spa** e abordagens de plataforma própria resolvem o mesmo problema com outros compromissos. O ecossistema muda rápido (por exemplo, um **manifesto de módulo** e um **runtime** independente do empacotador): consulte a documentação do Module Federation e a versão do plugin.`,
  concepts: [
    { term: 'Module Federation', def: 'Mecanismo que permite a uma aplicação carregar módulos de outra em tempo de execução, compartilhando dependências.' },
    { term: 'Host', def: 'Aplicação que consome módulos de remotes.' },
    { term: 'Remote', def: 'Aplicação que expõe módulos para serem consumidos por outras.' },
    { term: 'remoteEntry', def: 'Arquivo de entrada de um remote que descreve seus módulos expostos e dependências.' },
    { term: 'shared', def: 'Configuração das dependências compartilhadas entre host e remotes.' },
    { term: 'singleton', def: 'Opção que garante uma única instância de uma dependência na página.' },
    { term: 'requiredVersion', def: 'Faixa de versões aceita para uma dependência compartilhada.' },
    { term: 'Versionamento semântico', def: 'Convenção MAJOR.MINOR.PATCH em que o major indica mudanças incompatíveis.' },
    { term: 'Intersecção de faixas', def: 'Conjunto de versões que satisfaz simultaneamente duas faixas.' }
  ],
  examples: R`**Analogia:** o remote é uma **loja em outro endereço** que expõe uma vitrine (remoteEntry) e o host é o **shopping** que, quando o cliente chega, chama a vitrine pelo endereço. O shared singleton é a **energia elétrica do prédio**: todos usam a mesma ligação (React); se cada loja instalasse o próprio gerador, os fios entrariam em conflito. A faixa de versões é o **padrão da tomada**: a loja só encaixa se o plugue servir.

**Resultados medidos (Vite 8.3.8, @module-federation/vite 1.25.0, React 19.3.1, Chrome 157):**
§§§
builds do remote e do host concluídos (~3,4 s cada) | remote publica remoteEntry.js
host + remote em portas diferentes: o botão do remote renderizou ("remoto 0") e reagiu ao clique ("remoto 1")
semver 7.8.6: 19.3.1 satisfaz >=18 <20: true | ^18 e ^19 têm intersecção: false | ^0.2.3 aceita 0.2.9 e rejeita 0.3.0
§§§
Não testados: conflito de versão em shared, tipos entre host e remote, falha do remote, CSP.

**Cenário ilustrativo (não medido):** o remote do carrinho passou para o React 19 enquanto o host ainda declarava ^18. Como React era singleton com versão estrita, a página quebrou em produção após a publicação do remote. A equipe passou a validar a compatibilidade de §shared§ no pipeline (a lógica do desafio de código) e a publicar o remote só depois de o host atualizar.`,
  code: [
    { title: 'Remote e host (executado no Chrome)', lang: 'js', code: R`// remote/vite.config.mjs
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
export default {
  base: 'http://localhost:4174/',
  plugins: [react(), federation({
    name: 'remoto', filename: 'remoteEntry.js',
    exposes: { './Botao': './src/Botao.jsx' },
    shared: { react: { singleton: true, requiredVersion: '^19.0.0' }, 'react-dom': { singleton: true, requiredVersion: '^19.0.0' } }
  })],
  build: { target: 'chrome120' }
};

// host: import('remoto/Botao') com lazy + Suspense
const Botao = lazy(() => import('remoto/Botao'));`, notes: [{ l: '4', t: 'base com a URL pública do remote: os chunks são pedidos a essa origem (medido).' }, { l: '9', t: 'React como singleton com faixa de versão: evita duas instâncias.' }, { l: '15', t: 'Carregado em execução, quando o componente é renderizado.' }] },
    { title: 'Faixas de versão com semver (executado)', lang: 'js', code: R`import semver from 'semver';

semver.satisfies('18.2.0', '^18.0.0');          // true
semver.satisfies('19.0.0', '^18.0.0');          // false
semver.intersects('^18.0.0', '^19.0.0');        // false: sem versão que sirva aos dois
semver.maxSatisfying(['18.0.0', '18.3.1', '19.0.0'], '^18.0.0');   // '18.3.1'
semver.satisfies('0.3.0', '^0.2.3');            // false: em 0.x o "minor" age como major`, notes: [{ l: '5', t: 'Se não há intersecção entre as faixas dos participantes, a dependência compartilhada entra em conflito.' }, { l: '7', t: 'Atenção às versões 0.x.' }] }
  ],
  bestPractices: ['Compartilhe React e bibliotecas pesadas como singletons com faixas de versão explícitas.', 'Valide a compatibilidade das faixas de shared no pipeline antes de implantar.', 'Carregue remotes por configuração ou manifesto, nunca por URL fixa no código.', 'Envolva cada remote em fronteira de erro com fallback e nova tentativa.', 'Carregue só de origens confiáveis e use CSP, CORS e integridade quando possível.', 'Meça o custo (requisições, cascata, JavaScript) e defina orçamento por remote.'],
  mistakes: ['Duas instâncias do React por falta de singleton.', 'Faixas de versão incompatíveis entre host e remote.', 'URL do remote fixa no código.', 'Remote sem fronteira de erro derrubando a página.', 'Carregar remotes de origens não confiáveis.', 'Ignorar os tipos e os contratos entre as partes.'],
  market: `Module Federation é a técnica mais citada em vagas que envolvem microfrontends. Saber configurar host, remote e shared, e explicar conflitos de versão e singleton, indica experiência real com o tema.`,
  summary: `No Module Federation, o remote expõe módulos por um remoteEntry e o host os importa em execução, permitindo implantação independente. Executamos host e remote com Vite e o plugin 1.25.0 no Chrome 157: o botão do remote renderizou e reagiu ao clique. Em shared, singleton e requiredVersion evitam duplicações e instâncias duplas do React; as faixas seguem semver (medido: ^18 e ^19 não têm intersecção; ^0.2.3 rejeita 0.3.0). Trate falhas com fallback, tipos com contratos e segurança com origens confiáveis e CSP.`,
  refs: [REF2.mfDocs, REF2.mfStart, REF2.semver],
  cards: [
    { q: 'Qual a diferença entre host e remote?', a: 'O remote expõe módulos por um remoteEntry; o host declara os remotes e os importa em execução.' },
    { q: 'Por que React deve ser singleton em shared?', a: 'Para haver uma única instância; duas instâncias quebram hooks e contextos.' },
    { q: 'O que significa ^0.2.3 em semver?', a: 'Compatível com 0.2.x (>=0.2.3 e <0.3.0): em versões 0.x o segundo número age como major.' },
    { q: 'O que fazer quando um remote falha ao carregar?', a: 'Mostrar um fallback com fronteira de erro e tentativa de novo, e permitir voltar a versão anterior.' }
  ]
},
{
  id: 'arq-06', moduleId: 'm3', order: 6, minutes: 65, tags: ['comunicação', 'eventos', 'barramento', 'contratos', 'versionamento', 'URL', 'estado compartilhado'],
  title: 'Comunicação entre microfrontends: props, eventos, URL, estado compartilhado, contratos e versionamento',
  objectives: ['Escolher o mecanismo de comunicação adequado (props, URL, eventos, armazenamento, BroadcastChannel, estado compartilhado)', 'Projetar um barramento de eventos tipado com nomes, versões e validação de payload', 'Isolar falhas de ouvintes e evitar vazamentos de assinatura', 'Versionar contratos de forma compatível e planejar a depreciação', 'Evitar o acoplamento oculto por estado global'],
  intro: `Microfrontends isolados **precisam** conversar: o carrinho avisa que um item foi adicionado, o shell informa quem é o usuário, a busca pede ao catálogo para filtrar. **Como** conversam define o **acoplamento** entre equipes: um contrato **explícito, pequeno e versionado** deixa cada uma evoluir sozinha; **estado global compartilhado** a cada passo cria dependências **ocultas** que quebram em produção. Esta aula compara os mecanismos, ensina a desenhar **eventos com contratos** e a **versioná-los**, e o desafio de código implementa um **barramento de eventos tipado** com validação e isolamento de falhas.`,
  theory: `### Princípio: acoplar pouco e por contratos
Regra de ouro: **comunicar o mínimo necessário, por meios explícitos e documentados**. A pergunta antes de cada integração: "**isto precisa mesmo atravessar a fronteira?**" Muitas vezes a resposta é **não** (cada microfrontend pode buscar seus próprios dados ou ler a URL).

### Mecanismos, do mais acoplado ao menos
1. **Props e callbacks** (shell → microfrontend): o shell passa dados e funções ao montar o remote (§<Carrinho usuario={u} aoFinalizar={fn} />§). Simples, **tipado**, fluxo claro; vale para a relação **pai-filho** (shell e remote). Cuidados: props **serializáveis** e **mínimas**; callbacks estáveis;
2. **URL (rota e parâmetros)**: o estado de navegação **é o contrato mais estável**: §/produtos/42?cor=azul§ é entendido por todos, sobrevive a recarregamentos e links; ideal para "qual item está aberto", filtros e página; **qualquer** microfrontend lê a URL;
3. **Eventos (publicar/assinar)**: um microfrontend **emite** um evento (§carrinho:item-adicionado§) e **quem tiver interesse** o ouve, sem se conhecerem. Implementação: **§CustomEvent§** no §window§ (nativo, sem dependência), ou um **barramento** em um pacote compartilhado, com tipos. Vantagens: baixo acoplamento; cuidados: contratos, **ordem e perdas** (quem ouve depois não recebe o passado), vazamento de assinaturas;
4. **Armazenamento compartilhado** (§localStorage§, cookies, IndexedDB): bom para **preferências e sessão**, com **eventos de armazenamento** entre abas; **não** é para estado de interface; cuidado com dados sensíveis;
5. **§BroadcastChannel§**: mensagens entre **abas e janelas** da mesma origem (por exemplo, sair em todas as abas);
6. **Estado compartilhado em tempo de execução** (store global, singleton do Module Federation): **máximo acoplamento**: qualquer mudança no formato quebra os consumidores, e a ordem de inicialização importa. **Evite** salvo para **um núcleo muito pequeno e estável** (sessão do usuário); prefira eventos e URL;
7. **Backend como fonte de verdade**: cada microfrontend busca o que precisa em seu BFF/API; o estado persistente (carrinho) vive no servidor e as telas **se atualizam por invalidação** (por exemplo, TanStack Query, C2.4, com evento para invalidar).
Para o que atravessa **iframes**: §postMessage§ com **verificação de origem** (§event.origin§) e **validação** do payload.

### Eventos com contrato
Um evento entre microfrontends é uma **API pública**. Defina:
- **Nome estável e com domínio** (§carrinho:item-adicionado§), no **passado** (algo que aconteceu), não comandos ("faça isso");
- **Payload** descrito por um **esquema** (§{ itemId: string, quantidade: number }§), **validado** ao emitir e/ou ao receber;
- **Versão** do evento (campo §versao§ ou sufixo no nome, §carrinho:item-adicionado.v2§);
- **Quem emite** (dono do contrato) e **quem pode ouvir**;
- **Garantias**: sem garantia de entrega a quem ainda não montou; para estado **inicial**, o consumidor **consulta** (API ou função de leitura) e **depois assina** os eventos;
- **Isolamento de falhas**: um ouvinte que lança erro **não** deve impedir os demais; registre o erro com contexto.
Medida do desafio de código: um barramento com **registro de contratos** (§registrar(nome, validador)§), §emitir§ que valida, §assinar§ que devolve a função de cancelamento e **isolamento** das exceções dos ouvintes.

### Vazamentos e ciclo de vida
Assine ao **montar** e **cancele** ao **desmontar** (§useEffect§ com função de limpeza, C2.1). Assinaturas esquecidas **duplicam** o tratamento e vazam memória; microfrontends que **montam e desmontam** várias vezes (rotas) agravam isso. Cada assinatura deve ter **dono** e **limpeza**.

### Versionamento e evolução de contratos
- **Compatível (minor)**: adicionar **campos opcionais** ou novos eventos: não quebra quem consome;
- **Incompatível (major)**: remover ou mudar o tipo de um campo, mudar o significado, renomear: exige **nova versão** e um **período de convivência** (emitir **v1 e v2** em paralelo), com **depreciação** anunciada, métricas de **quem ainda usa v1** e **remoção** em data definida;
- **Princípio de tolerância**: consumidores **ignoram campos desconhecidos**; emissores **não removem** campos sem versão;
- **Testes de contrato** (C2.6): o consumidor declara o que espera; o emissor verifica na CI que continua atendendo;
- **Registro central** dos contratos (pacote de tipos e esquemas versionado, aula 3) e **changelog**.
Mesma lógica para **props** do remote e **APIs** entre microfrontends.

### Sessão, autenticação e tema
- **Sessão/usuário**: o **shell** autentica e **fornece** o usuário (props, contexto compartilhado mínimo ou função §obterToken()§); **não** cada microfrontend implementando login;
- **Tema, idioma, preferências**: eventos ou variáveis CSS (§custom properties§) no documento; preferências persistidas em armazenamento compartilhado;
- **Navegação entre microfrontends**: links normais para URLs do shell (roteamento do shell) ou um **serviço de navegação** (§navegar('/carrinho')§) em vez de um microfrontend importar o roteador do outro.

### Observabilidade da comunicação
Registre os eventos importantes (nome, versão, origem) com o **identificador de correlação** (aula 2); meça **latências** de integração e erros de contrato (payload inválido) por emissor e versão; alerte sobre **eventos sem ouvintes** esperados e sobre **versões antigas** ainda em uso.

### Antipadrões
Um **objeto global** (§window.estado§) lido e alterado por todos; eventos que **carregam tudo** (o estado inteiro); **comandos** disfarçados de eventos; dependência de **ordem de montagem**; microfrontends que **importam o código interno** uns dos outros (quebra o isolamento: aula 1); eventos sem contrato nem dono; mensagens de iframe sem verificação de origem.`,
  concepts: [
    { term: 'Publicar e assinar', def: 'Padrão em que emissores publicam eventos e interessados assinam, sem se conhecerem.' },
    { term: 'CustomEvent', def: 'Evento do navegador com dados personalizados (detail), disparado em um elemento ou no window.' },
    { term: 'BroadcastChannel', def: 'API que envia mensagens entre abas e janelas da mesma origem.' },
    { term: 'Contrato de evento', def: 'Descrição do nome, do payload e da versão de um evento, com dono e consumidores conhecidos.' },
    { term: 'Esquema de payload', def: 'Definição do formato dos dados de um evento, usada para validar.' },
    { term: 'Acoplamento oculto', def: 'Dependência entre partes que não aparece em contratos explícitos, como estado global.' },
    { term: 'Depreciação', def: 'Anúncio de que uma versão de contrato será removida em uma data, mantendo-a por um período.' },
    { term: 'Teste de contrato', def: 'Verificação automatizada de que emissor e consumidor respeitam o mesmo contrato.' },
    { term: 'postMessage', def: 'API para enviar mensagens entre janelas e iframes, com verificação de origem.' }
  ],
  examples: R`**Analogia:** os microfrontends são **departamentos de uma empresa**: o contrato de evento é o **memorando padronizado** ("Pedido 17 pago", com campos fixos e numerado por versão): quem precisa, lê; quem emite não sabe quem leu. O estado global compartilhado é um **quadro branco no corredor** onde todos escrevem: qualquer mudança de formato embaralha os outros. A URL é o **endereço no envelope**: todo mundo entende.

**Exemplo de contrato (modelo, não executado):**
§§§
nome: carrinho:item-adicionado   versao: 2   dono: equipe Carrinho
payload: { itemId: string, quantidade: number (>=1), origem?: string }   // v2 adicionou origem (opcional: compatível)
consumidores: Cabeçalho (selo), Analytics   | v1 depreciada em 2027-03-01 (emitida em paralelo)
§§§
O barramento do desafio de código foi executado em Workers do Chrome como lógica pura; nenhum mecanismo de comunicação entre microfrontends reais foi medido no laboratório.

**Cenário ilustrativo (não medido):** o cabeçalho lia §window.__estado.carrinho.itens§, escrito pelo carrinho. Uma refatoração do carrinho renomeou o campo e o selo do cabeçalho passou a mostrar "NaN" em produção. Substituir por um evento §carrinho:alterado§ com payload validado e versionado, mais um teste de contrato, tornou a mudança segura.`,
  code: [
    { title: 'Evento nativo com CustomEvent e limpeza ao desmontar', lang: 'jsx', code: R`// emissor (microfrontend Carrinho)
function adicionar(itemId, quantidade) {
  window.dispatchEvent(new CustomEvent('carrinho:item-adicionado', { detail: { versao: 2, itemId, quantidade } }));
}

// consumidor (Cabeçalho)
function useSeloDoCarrinho() {
  const [itens, setItens] = useState(0);
  useEffect(() => {
    const ouvir = (e) => { const d = e.detail; if (d && typeof d.quantidade === 'number' && d.quantidade >= 1) setItens((n) => n + d.quantidade); };
    window.addEventListener('carrinho:item-adicionado', ouvir);
    return () => window.removeEventListener('carrinho:item-adicionado', ouvir);   // sem vazamento
  }, []);
  return itens;
}`, notes: [{ l: '3', t: 'Nome com domínio, no passado, com versão no payload.' }, { l: '10', t: 'O consumidor valida o payload recebido (não confia no emissor).' }, { l: '12', t: 'A limpeza evita assinaturas duplicadas quando o microfrontend monta e desmonta.' }] },
    { title: 'URL como contrato de navegação e leitura segura do estado inicial', lang: 'js', code: R`// Qualquer microfrontend lê a URL; ela é a fonte de verdade da navegação
const params = new URLSearchParams(location.search);
const itemAberto = params.get('item');             // texto: valide antes de usar
const id = /^\d+$/.test(itemAberto ?? '') ? Number(itemAberto) : null;

// Estado inicial: consulte, depois assine os eventos (quem montou depois não recebe o passado)
const inicial = await api.itensDoCarrinho();          // fonte de verdade: servidor
window.addEventListener('carrinho:item-adicionado', atualizar);`, notes: [{ l: '3', t: 'A URL é texto vindo de fora: valide e converta.' }, { l: '7', t: 'Eventos não são repetidos para quem monta depois: leia o estado atual pela fonte de verdade.' }] }
  ],
  bestPractices: ['Comunique o mínimo e por mecanismos explícitos; prefira URL e eventos a estado global.', 'Trate eventos como API pública: nome, esquema, versão, dono e consumidores.', 'Valide payloads e isole falhas de ouvintes.', 'Assine ao montar e cancele ao desmontar.', 'Versione contratos de forma compatível, com depreciação e testes de contrato.', 'Faça o shell fornecer sessão e navegação, não cada microfrontend.'],
  mistakes: ['Objeto global compartilhado lido e escrito por todos.', 'Eventos sem contrato, sem versão e sem dono.', 'Payloads que carregam o estado inteiro.', 'Dependência de ordem de montagem e de eventos passados.', 'Assinaturas sem limpeza.', 'postMessage sem verificação de origem.'],
  market: `A comunicação entre microfrontends é onde os projetos reais falham ou prosperam. Explicar eventos com contrato, versionamento e por que evitar estado global mostra experiência com arquiteturas distribuídas de frontend e é diferencial em entrevistas de arquitetura.`,
  summary: `Microfrontends devem acoplar pouco: props do shell, URL como contrato de navegação, eventos publicar-assinar com contratos (nome, esquema, versão, dono), armazenamento para preferências e BroadcastChannel entre abas; estado global compartilhado é o mais acoplado. Valide payloads, isole falhas de ouvintes, limpe assinaturas e leia o estado inicial da fonte de verdade. Evolua contratos de forma compatível, com depreciação e testes de contrato; o shell provê sessão e navegação.`,
  refs: [REF2.customEvent, REF2.broadcast, REF2.fowlerMfe, REF2.semver],
  cards: [
    { q: 'Por que a URL é um bom contrato entre microfrontends?', a: 'Porque é pública, estável, entendida por todos e sobrevive a recarregamentos e links.' },
    { q: 'Por que evitar estado global compartilhado?', a: 'Gera acoplamento oculto: mudar o formato quebra os consumidores e a ordem de inicialização importa.' },
    { q: 'O que torna uma mudança de contrato incompatível?', a: 'Remover ou mudar o tipo de um campo, renomear ou mudar o significado; exige nova versão e período de convivência.' },
    { q: 'Quem monta depois recebe os eventos passados?', a: 'Não: deve ler o estado atual da fonte de verdade e depois assinar os eventos.' }
  ]
},
{
  id: 'arq-07', moduleId: 'm4', order: 7, minutes: 70, tags: ['decisão', 'Conway', 'microfrontends', 'monólito modular', 'migração', 'ADR', 'custos'],
  title: 'Quando usar e quando evitar microfrontends: lei de Conway, custos, alternativas e migração gradual',
  objectives: ['Explicar a lei de Conway e relacioná-la à arquitetura de frontend', 'Listar os custos e riscos dos microfrontends e as condições em que valem a pena', 'Comparar alternativas (monólito modular, monorepo com pacotes, bibliotecas, feature flags)', 'Aplicar um roteiro de decisão com critérios mensuráveis e registrá-lo em um ADR', 'Planejar uma migração gradual (strangler fig) com reversibilidade'],
  intro: `Microfrontends são uma **solução** para um **problema específico** (muitas equipes, ritmos de entrega diferentes, necessidade de implantação independente). Aplicados ao problema errado, trazem **mais complexidade, mais JavaScript e uma experiência menos coerente** sem benefício. Esta aula fecha o curso com a **decisão**: a **lei de Conway**, os **custos reais**, as **alternativas mais simples** e um **roteiro de decisão** com critérios, registrado em um **ADR**, além de como **migrar aos poucos**. O desafio de código implementa uma **pontuação ponderada** de recomendação.`,
  theory: `### Lei de Conway
"As organizações projetam sistemas que **copiam a estrutura de comunicação** da própria organização." Consequências para o frontend:
- **A arquitetura segue as equipes**: se uma equipe é dona de uma jornada do usuário de ponta a ponta, os módulos dessa jornada tendem a ficar juntos;
- **Manobra inversa**: organize as equipes **como você quer que a arquitetura seja** (equipes por domínio, "fatias verticais" com frontend e backend);
- **Microfrontends são, antes de tudo, uma ferramenta organizacional**: valem quando a **coordenação entre equipes** (e não a tecnologia) é o gargalo. Se todos os problemas são técnicos (build lento, código bagunçado), há remédios mais baratos.

### Os custos reais
- **Complexidade operacional**: vários pipelines, versões, ambientes, manifestos, monitoramento por parte;
- **Desempenho**: mais requisições, dependências duplicadas, cascatas (C2.7), composição no cliente;
- **Consistência de UX**: navegação, estilos, comportamentos e acessibilidade devem permanecer coerentes (design system e governança);
- **Contratos e versões**: cada fronteira vira uma API com compatibilidade para manter;
- **Depuração e testes**: falhas distribuídas, E2E de composição, reprodução local mais difícil;
- **Duplicação de esforço**: cada equipe resolve de novo autenticação, erros, observabilidade, a menos que a plataforma ofereça;
- **Custo de plataforma**: uma equipe (ou parte de uma) mantém o shell, as ferramentas e os padrões;
- **Segurança**: código carregado de várias origens e superfície maior.

### Quando compensa
Sinais **combinados** (um só raramente basta):
- **muitas equipes** (por exemplo, oito ou mais) mexendo no mesmo frontend e se bloqueando;
- **domínios de negócio claros** e relativamente independentes;
- necessidade de **implantação independente** e de **ritmos diferentes** (uma área publica diariamente, outra mensalmente);
- **migração gradual** de tecnologia (um legado em um framework antigo convivendo com o novo);
- **plataforma de frontend** (equipe e orçamento) disponível;
- **tolerância** a um custo de desempenho e de coordenação de contratos.
Quando **não** compensa: **poucas equipes** (uma ou duas), um produto **coeso** com jornadas muito integradas (checkout), pouca maturidade em **CI/CD, testes e observabilidade**, sem apoio de plataforma, ou o objetivo ser "usar uma tecnologia da moda".

### Alternativas mais simples (comece por elas)
1. **Monólito modular** (aula 1): features, camadas, API pública e regras automatizadas; **um** deploy, **zero** custo de composição; resolve o acoplamento do código;
2. **Monorepo com pacotes** (aula 3): bibliotecas internas (design system, utilidades, features como pacotes), cache e afetados; resolve **build lento** e **compartilhamento**, mantendo o **deploy único** ou por aplicativo;
3. **Várias aplicações separadas por rota/subdomínio** (multi-zonas): cada equipe tem sua **aplicação completa** em um caminho (§/loja§, §/conta§), unidas por um proxy ou CDN e links normais (sem composição na mesma página): **implantação independente com custo menor**;
4. **Propriedade de código e fluxos de revisão** (CODEOWNERS, revisão por área) para reduzir bloqueios sem dividir a implantação;
5. **Feature flags e entrega contínua** para reduzir o risco de publicar com frequência;
6. **Plataforma e ferramentas** (testes, CI mais rápida) que removem o gargalo real.
A pergunta-guia: "**qual é o menor passo que resolve o gargalo medido?**"

### Roteiro de decisão
1) **Qual é o problema?** Descreva-o com **dados** (tempo de ciclo, conflitos por semana, bloqueios entre equipes, tempo de CI). 2) **Alternativas simples** resolveriam? Tente-as primeiro (e meça). 3) **Critérios** ponderados: autonomia necessária, número de equipes, independência dos domínios, custo de plataforma, risco de desempenho, maturidade, reversibilidade. 4) **Decida** e **registre** em um **ADR** (contexto, decisão, alternativas descartadas, consequências, **critérios de sucesso** e **data de revisão**). 5) **Experimente em pequeno** (uma fatia) antes de generalizar. 6) **Meça** de novo (aula 8 da C2.7 e métricas de entrega) e **revise**.
Pontuação ponderada (usada no desafio de código): cada critério recebe um **peso** e uma **nota** para cada alternativa; a soma ponderada **ordena** as opções, e o resultado **apoia** (não substitui) a discussão.

### Migração gradual (strangler fig)
Para sair de um monólito (ou de um legado) sem reescrever tudo: **estrangule** aos poucos, como a figueira que cresce em volta da árvore.
1. coloque um **roteador/shell** na frente da aplicação existente;
2. escolha uma **fatia** de baixo risco e valor claro (uma jornada separável);
3. construa a fatia **nova** (microfrontend ou aplicação separada) e **roteie** o tráfego para ela, com **feature flag** e a possibilidade de **voltar** ao antigo;
4. **meça** (erros, desempenho, métricas de produto) e compare;
5. repita fatia a fatia; **desligue** o legado quando a última sair;
6. mantenha **contratos** e **design system** desde o início para a experiência continuar coerente.
**Reversibilidade** é o critério mais importante: toda etapa deve poder **voltar atrás** sem crise.

### Governança com microfrontends (se decidir adotar)
Defina **padrões obrigatórios** (design system, acessibilidade, observabilidade, segurança), **orçamentos** (JavaScript por remote), **contratos versionados** com testes, **processo de depreciação**, **inventário** de partes e donos, **ambiente de integração** e **E2E** dos fluxos que cruzam partes, e uma **equipe de plataforma** com mandato claro.

### Registrar a decisão: o ADR
Exemplo (resumo): "ADR 012 — Manter o monólito modular e extrair o checkout como aplicação separada por rota. **Contexto**: 5 equipes, conflitos de merge e deploys quinzenais; checkout com ritmo próprio. **Alternativas**: microfrontends completos (descartado: custo de plataforma e desempenho), monólito único (descartado: bloqueio do checkout). **Consequências**: deploy independente do checkout, link entre aplicações, design system compartilhado. **Sucesso**: lead time do checkout menor que 2 dias em 3 meses. **Revisão**: em 6 meses." O desafio de código desta aula reforça o raciocínio com critérios.`,
  concepts: [
    { term: 'Lei de Conway', def: 'Princípio segundo o qual a estrutura de um sistema tende a copiar a estrutura de comunicação da organização.' },
    { term: 'Manobra inversa de Conway', def: 'Organizar as equipes como se deseja que a arquitetura fique.' },
    { term: 'Monólito modular', def: 'Aplicação única com módulos bem delimitados e regras de dependência.' },
    { term: 'Multi-zonas', def: 'Várias aplicações completas servindo caminhos diferentes sob o mesmo domínio.' },
    { term: 'Strangler fig', def: 'Padrão de migração que substitui o sistema antigo por fatias novas, aos poucos.' },
    { term: 'Reversibilidade', def: 'Possibilidade de desfazer uma etapa de migração ou decisão sem crise.' },
    { term: 'Equipe de plataforma', def: 'Equipe que mantém ferramentas, padrões e infraestrutura usados pelas demais.' },
    { term: 'Pontuação ponderada', def: 'Soma de notas por critério multiplicadas pelos pesos para comparar alternativas.' },
    { term: 'Critério de sucesso', def: 'Medida combinada de antemão para avaliar se uma decisão deu certo.' }
  ],
  examples: R`**Analogia:** adotar microfrontends é **dividir uma empresa em filiais independentes**: faz sentido quando a matriz virou gargalo e há gente e processos para gerir várias unidades. Se a empresa tem 8 pessoas, abrir três filiais só cria burocracia: é melhor **reorganizar os departamentos** (monólito modular) e **melhorar as ferramentas** (monorepo).

**Exemplo de decisão com critérios (modelo, não executado em produção):**
§§§
problema medido: 12 pessoas em 3 equipes; 40% dos pull requests conflitam; CI de 38 min; deploy quinzenal
alternativas: A monólito modular + monorepo (cache e afetados) | B microfrontends | C aplicação separada para o checkout
critérios (peso): autonomia (3), custo de plataforma (3), risco de desempenho (2), reversibilidade (2)
resultado: A e C à frente de B; decisão registrada em ADR com revisão em 6 meses
§§§
Os números do exemplo são ilustrativos. Foram medidos no laboratório o cache do Turborepo (6,9 s para 90 ms), o dependency-cruiser e o Module Federation (aulas 1, 3 e 5), que sustentam as alternativas A e B.

**Cenário ilustrativo (não medido):** uma empresa com duas equipes adotou microfrontends "para ser moderna". O JavaScript da página inicial dobrou (React duplicado), dois menus ficaram inconsistentes e a plataforma consumiu uma pessoa. Dezoito meses depois, voltaram a um monólito modular em monorepo com um design system: o deploy único, mais rápido, atendia a necessidade real.`,
  code: [
    { title: 'Modelo de ADR de decisão arquitetural (Markdown)', lang: 'md', code: R`# ADR 012 — Extrair o checkout como aplicação separada por rota
Status: aceito (2026-11-25) | Revisão: 2027-05-25

## Contexto
12 pessoas em 3 equipes; 40% dos pull requests conflitam; o checkout precisa publicar semanalmente, o resto quinzenalmente.

## Decisão
Manter um monólito modular em monorepo e extrair o checkout como aplicação própria em /checkout (multi-zonas), com o design system compartilhado.

## Alternativas descartadas
- Microfrontends completos: custo de plataforma e de desempenho acima do benefício para 3 equipes.
- Monólito único sem mudanças: mantém o bloqueio do checkout.

## Consequências
(+) deploy independente do checkout; (+) menor risco; (−) duas aplicações a manter e um link entre elas.

## Critérios de sucesso
Lead time do checkout < 2 dias em 3 meses; JavaScript da home sem aumento (orçamento de 170 kB).`, notes: [{ l: '2', t: 'Data de revisão: a decisão é revisitada com os mesmos critérios.' }, { l: '12', t: 'Critérios de sucesso mensuráveis permitem avaliar se a decisão funcionou.' }] },
    { title: 'Roteamento por fatia (strangler fig) com possibilidade de voltar', lang: 'js', code: R`// proxy/roteador na frente do legado (esboço)
const MIGRADAS = new Set(['/conta', '/ajuda']);                     // fatias já novas
export function destino(caminho, { flagNovo = true } = {}) {
  const fatia = '/' + caminho.split('/').filter(Boolean)[0];
  return flagNovo && MIGRADAS.has(fatia) ? 'aplicacao-nova' : 'legado';   // desligar a flag volta ao legado
}`, notes: [{ l: '2', t: 'Cada fatia migrada entra na lista; as demais continuam no legado.' }, { l: '5', t: 'A flag garante a reversibilidade: ao desligá-la, o tráfego volta ao legado sem crise.' }] }
  ],
  bestPractices: ['Descreva o problema com dados antes de escolher a solução.', 'Experimente as alternativas simples (monólito modular, monorepo, multi-zonas) primeiro.', 'Use critérios ponderados e registre a decisão em um ADR com critérios de sucesso e revisão.', 'Migre por fatias, com flag e reversibilidade.', 'Se adotar, tenha equipe de plataforma, contratos, orçamentos e governança.', 'Reavalie periodicamente: a decisão certa hoje pode mudar com a organização.'],
  mistakes: ['Adotar microfrontends por moda ou por motivo técnico que outra solução resolveria.', 'Ignorar o custo de plataforma e de desempenho.', 'Dividir a aplicação sem dividir as equipes (Conway).', 'Migração do tipo "big bang" sem reversibilidade.', 'Decidir sem critérios de sucesso medidos.', 'Deixar a decisão sem revisão.'],
  market: `Saber argumentar contra microfrontends quando eles não se justificam é tão valorizado quanto saber implementá-los. Perguntas sobre lei de Conway, custos, alternativas e migração gradual são o centro das entrevistas de arquitetura de frontend em níveis sênior e de liderança.`,
  summary: `Pela lei de Conway a arquitetura segue a comunicação entre equipes; microfrontends são uma ferramenta organizacional que compensa com muitas equipes, domínios independentes e necessidade de implantação independente, ao custo de complexidade, desempenho, consistência e plataforma. Antes, tente o monólito modular, o monorepo com pacotes (cache medido: 6,9 s para 90 ms) e aplicações separadas por rota. Decida com dados e critérios ponderados, registre em ADR com critérios de sucesso e revisão, e migre por fatias com reversibilidade (strangler fig).`,
  refs: [REF2.conway, REF2.strangler, REF2.fowlerMfe, REF.adr],
  cards: [
    { q: 'O que diz a lei de Conway?', a: 'Que os sistemas tendem a copiar a estrutura de comunicação da organização que os projeta.' },
    { q: 'Quais alternativas tentar antes dos microfrontends?', a: 'Monólito modular, monorepo com pacotes, aplicações separadas por rota (multi-zonas), propriedade de código e feature flags.' },
    { q: 'Quais são os custos dos microfrontends?', a: 'Complexidade operacional, desempenho, consistência de UX, contratos e versões, depuração e custo de plataforma.' },
    { q: 'O que é o padrão strangler fig?', a: 'Migrar aos poucos, fatia por fatia, roteando tráfego para as partes novas até poder desligar o legado.' }
  ]
}
];
