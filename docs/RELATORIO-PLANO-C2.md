# Academia v2 — Plano da C2: Frontend moderno

Data: 2026-11-18. Etapa de **planejamento**: nenhuma aula foi produzida, o banco real não foi lido nem alterado, os cursos existentes, o `SEED_REV` e o motor de migração não foram modificados. Tudo foi conferido no projeto (catálogo de `seed/docs.json`, o mesmo que está no banco desde a versão 10) e nas versões atuais dos pacotes (`npm view`, 2026-11-18).

## 0. Situação da C1 (conferida, não presumida)

| Item | Estado real |
| --- | --- |
| C1.1 Linux, terminal e SO | Validado (`validate.mjs` sem falhas, 29 URLs abertas) |
| C1.2 Redes de computadores e HTTP | Validado (57 URLs acumuladas abertas) |
| C1.3 Ferramentas do desenvolvedor e regex | Validado (94 URLs acumuladas abertas) |
| C1.4 Paradigmas | **Não produzido.** Só houve experimentos em Node.js (condição de corrida com `worker_threads`, ordem do event loop); nenhum arquivo de curso |
| C1.5 Web Platform, C1.6 Fluxo e agilidade, C1.7 Requisitos | **Não iniciados** |
| `RELATORIO-EXECUCAO-C1.md`, `REVISAO-OPUS-C1.md` | **Não existem** (a sessão foi redirecionada antes do fim) |
| Integração ao seed (`build.mjs`), `SEED_REV` 4, publicação | Não feitos (e proibidos nessa missão) |

Consequências para a C2: (1) ela pode começar com o que já existe (JavaScript, TypeScript, HTML/CSS e Git da Onda 1; Redes e Ferramentas da C1), **sem depender** de C1.4–C1.7; (2) o único vínculo desejável com a C1 pendente é a **Web Platform (C1.5)**, que aprofunda DOM, eventos, Workers e storage usados no React e na performance; trato como pré-requisito **recomendado**, não obrigatório; (3) a C1 continua com 4 cursos por produzir e não há relatório de execução: recomendo decidir se a C1 será concluída antes da C2 (seção 10).

## 1. Inventário das disciplinas e tópicos (catálogo real)

Área `front`. Total: **7 disciplinas, 50 tópicos**. (O plano geral estimava "7 disciplinas"; confere. Os níveis: I = Iniciante, M = Intermediário, A = Avançado, E = Especialista.)

| Disciplina (id) | Tópicos | Níveis |
| --- | --- | --- |
| **React** (`react`) | 11: Componentes e JSX [I]; Props e estado [I]; Listas e renderização condicional [I]; Hooks essenciais (useState, useEffect, useRef, useMemo) [M]; Context API [M]; Hooks customizados [M]; Formulários [M]; Renderização e reconciliação [A]; Padrões de composição [A]; Suspense e recursos concorrentes [A]; Arquitetura de aplicações React grandes [E] | 3 I, 4 M, 3 A, 1 E |
| **Gerenciamento de estado** (`state`) | 7: Estado local vs global [I]; Redux Toolkit [M]; Zustand [M]; TanStack Query (estado de servidor) [M]; Cache, invalidação e optimistic updates [A]; Normalização de estado [A]; Escolha de estratégia de estado em escala [E] | 1 I, 3 M, 2 A, 1 E |
| **Next.js** (`next`) | 9: App Router, rotas e layouts [I]; Server Components [M]; Client Components [M]; Data fetching e cache [M]; Server Actions [M]; SSR, SSG, ISR e streaming [A]; Middleware e autenticação [A]; Route Handlers [A]; Deploy e performance em produção [E] | 1 I, 4 M, 3 A, 1 E |
| **Tailwind CSS e Design Systems** (`tailwind`) | 7: Utilitários e responsividade [I]; Configuração e temas [M]; Componentização com Tailwind [M]; Design tokens [A]; Construção de um Design System [A]; Documentação com Storybook [A]; Governança de Design System [E] | 1 I, 2 M, 3 A, 1 E |
| **Arquitetura frontend e Microfrontends** (`fe-arch`) | 4: Monorepos (Turborepo, Nx) [M]; Microfrontends e Module Federation [A]; Comunicação entre microfrontends [A]; Quando usar e quando evitar microfrontends [E] | 1 M, 2 A, 1 E |
| **Performance frontend** (`fe-perf`) | 6: Core Web Vitals [M]; Lazy loading e code splitting [M]; Otimização de imagens e fontes [A]; Profiling com DevTools [A]; Memoização no React [A]; Orçamento de performance e RUM [E] | 2 M, 3 A, 1 E |
| **Testes de frontend** (`fe-test`) | 6: Por que e o que testar [I]; Testing Library [M]; Vitest e Jest com componentes [M]; Mock de rede com MSW [A]; Testes visuais [A]; Estratégia de testes no frontend [E] | 1 I, 2 M, 2 A, 1 E |

**Achados da conferência**
1. Os catálogos batem com o plano anterior (50 tópicos; nenhuma disciplina tem curso: `courses: []` em todas).
2. A trilha **Full Stack JavaScript/TypeScript** (`fs-ts`) lista `react`, `state`, `next` e `tailwind`, mas **não** `fe-arch`, `fe-perf` nem `fe-test`. Já `fe-test` e `fe-perf` fazem parte do que se espera de uma pessoa competente em frontend. Alterar a trilha é mudança de catálogo, **fora desta etapa**; deixo como decisão do dono (seção 10).
3. A trilha `rn` (React Native) usa `react` e `state`: a C2 serve também à C10 (mobile).
4. O tópico "Arquitetura de aplicações React grandes" [E] pertence à disciplina React, mas é, na essência, **arquitetura**; proponho ensiná-lo junto de Arquitetura frontend (seção 2).
5. "Memoização no React" está em Performance, e não em React: será ensinada na performance (com o React avançado só apontando para lá).

## 2. Proposta de agrupamento: 8 cursos, 69 aulas

Princípios: nenhum curso passa de 11 aulas (a Onda 1 teve 7 a 9 aulas por curso); disciplina extensa ganha curso próprio; um curso pode vincular **várias disciplinas** (`disciplineIds`, como a Lógica faz com 3), então o tópico pode ser ensinado onde faz mais sentido pedagógico sem sair da cobertura; zero tópicos eliminados.

| # | Curso (id) | Disciplina principal + vinculadas | Tópicos | Aulas | Justificativa |
| --- | --- | --- | --- | --- | --- |
| C2.1 | **React essencial** (`react-essencial`) | `react` | 7 (os 3 [I] e os 4 [M]) | 11 | Os fundamentos formam um bloco coeso; 11 tópicos em um só curso seriam longos e misturariam o básico com padrões avançados |
| C2.2 | **Tailwind CSS e Design Systems** (`tailwind-design-systems`) | `tailwind` | 7 | 9 | Disciplina coesa; só precisa de HTML/CSS e noções de componente (C2.1); a produção de um DS depende de entender composição, então vem logo depois do React essencial |
| C2.3 | **React avançado: renderização, composição e concorrência** (`react-avancado`) | `react` | 3 ("Renderização e reconciliação", "Padrões de composição", "Suspense e recursos concorrentes") | 6 | Aprofunda o modelo mental; depende de C2.1 e se beneficia de C2.2 (componentes reais) |
| C2.4 | **Gerenciamento de estado no frontend** (`estado-frontend`) | `state` | 7 | 9 | Disciplina própria, independente do framework de meta-framework; usa React; boa para código JS verificável (reducers, seletores, caches) |
| C2.5 | **Next.js: aplicações full stack com React** (`nextjs`) | `next` | 9 | 11 | Disciplina grande, com mudanças rápidas de versão; precisa de React, estado de servidor (C2.4) e HTTP (C1.2) |
| C2.6 | **Testes de frontend** (`testes-frontend`) | `fe-test` | 6 | 8 | Depende de React, estado e Next (o que testar); vem antes da performance para que otimizações possam ser protegidas por testes |
| C2.7 | **Performance frontend** (`performance-frontend`) | `fe-perf` | 6 | 8 | Depende de React, Next (imagens, fontes, streaming), DevTools (C1.3) e HTTP (C1.2); "Memoização no React" fica aqui |
| C2.8 | **Arquitetura frontend, monorepos e microfrontends** (`arquitetura-frontend`) | `fe-arch` + `react` | 5 (os 4 de `fe-arch` + "Arquitetura de aplicações React grandes") | 7 | Fecha a onda: é o mais abstrato (E/A), exige tudo antes. A disciplina `react` fica vinculada a **três** cursos (C2.1, C2.3 e C2.8), o que o catálogo suporta (`d.courses` é lista) e a cobertura reconhece |
| | **Total** | **7 disciplinas** | **50** (7+7+3+7+9+6+6+5) | **69** | |

**Alternativas avaliadas e descartadas**
- *Um curso por disciplina (7 cursos):* React teria 11 tópicos e ~16 aulas, curso longo demais, e Arquitetura (4 tópicos) ficaria pequena e sem o tópico que a completa.
- *Juntar Next.js e React:* ocultaria a distinção entre biblioteca e framework e criaria um curso de 20+ aulas.
- *Juntar Performance e Testes:* assuntos distintos, públicos e ferramentas diferentes.
- *Juntar Arquitetura com Performance:* a performance de arquitetura (microfrontends) existe, mas misturaria níveis I/M com E.
- *Colocar "Memoização no React" em React avançado:* duplicaria conteúdo; mantida na performance, com referência cruzada.

**Ordem pedagógica recomendada:** C2.1 → C2.2 → C2.3 → C2.4 → C2.5 → C2.6 → C2.7 → C2.8.

## 3. Estrutura detalhada dos cursos

Convenções (iguais à C1): ids de aula `rea-NN`, `tdw-NN`, `rav-NN`, `est-NN`, `nxt-NN`, `tfe-NN`, `pfe-NN`, `arq-NN`; prova `<curso>-pN` com 12 itens e `passPct` 70; 12 seções por aula (objetivos, introdução, teoria, conceitos, exemplos, código comentado, boas práticas, erros comuns, aplicações, resumo, referências, cartões); 5 a 6 exercícios por aula; 1 projeto integrador por curso (`ds` com os ids das disciplinas); suplemento (glossário ≥ 15 termos, cheatsheet, erros comuns, mapa de pré-requisitos, referências oficiais, prática); `techVersions` por aula.

### C2.1 React essencial — 11 aulas, nível I→M
- **Disciplina/tópicos:** `react`: Componentes e JSX; Props e estado; Listas e renderização condicional; Hooks essenciais (useState, useEffect, useRef, useMemo); Context API; Hooks customizados; Formulários.
- **Objetivos:** pensar a interface como função do estado; construir componentes com props tipadas (TypeScript); gerenciar estado e efeitos corretamente; compor com Context e hooks customizados; construir formulários acessíveis e validados.
- **Pré-requisitos:** JavaScript (Onda 1), TypeScript (Onda 1), HTML/CSS/acessibilidade (Onda 1), Git, Ferramentas (C1.3: depuração, ESLint).
- **Módulos e aulas:**
  - M1 *Pensar em React* (3): **rea-01** O que é React e UI declarativa (UI = f(estado), Vite, árvore de componentes); **rea-02** JSX em profundidade (expressões, atributos, fragmentos, segurança contra XSS); **rea-03** Componentes e props (composição, `children`, props tipadas, imutabilidade).
  - M2 *Estado e renderização* (3): **rea-04** Estado com `useState` (snapshots, atualização funcional, batching, elevação de estado); **rea-05** Listas, chaves e renderização condicional; **rea-06** Eventos e formulários controlados e não controlados.
  - M3 *Efeitos, referências e memória* (2): **rea-07** `useEffect` (sincronização, dependências, limpeza, Strict Mode, "você talvez não precise de um efeito"); **rea-08** `useRef`, `useMemo` e `useCallback` (acesso ao DOM, valores estáveis, quando não usar).
  - M4 *Compartilhando lógica* (3): **rea-09** Context API (prop drilling, providers, custo de re-renderização); **rea-10** Hooks customizados (extração de lógica, regras dos hooks, exemplos: `useLocalStorage`, `useDebounce`); **rea-11** Formulários avançados (validação com esquemas, acessibilidade, ações do React 19 como `useActionState`).
- **Exercícios:** mc, tf, fill (JSX e hooks como texto), bug (identificar a linha com a violação das regras dos hooks), trace (rastrear renderizações e valores de estado), match, open. **Desafios `code` (JavaScript puro):** reducers, `debounce`, `useLocalStorage` modelado como função com armazenamento injetado, validadores de formulário, `chaves únicas` de lista. Componentes em si **não** rodam no laboratório (ver seção 5).
- **Prova (12):** 4 mc, 2 tf, 2 trace, 1 bug, 1 fill, 1 match, 1 open (sem `code`).
- **Projeto integrador:** *Quadro de tarefas (kanban) acessível*, com Vite, TypeScript, Context + hook customizado, persistência local, formulário validado; critérios: acessibilidade por teclado, sem efeitos desnecessários, tipos estritos.
- **Suplemento:** glossário (JSX, props, estado, efeito, ref, memoização, elevação de estado, controlado/não controlado...), cheatsheet de hooks e regras, mapa de pré-requisitos, referências (react.dev).
- **Dependências:** prepara C2.2–C2.8 e a C10 (React Native).

### C2.2 Tailwind CSS e Design Systems — 9 aulas, nível I→E
- **Disciplina/tópicos:** `tailwind`: Utilitários e responsividade; Configuração e temas; Componentização com Tailwind; Design tokens; Construção de um Design System; Documentação com Storybook; Governança de Design System.
- **Objetivos:** estilizar com utilitários e responsividade; configurar temas (CSS-first no Tailwind v4); componentizar com variantes; definir e distribuir tokens; construir, documentar e governar um design system.
- **Pré-requisitos:** HTML/CSS/acessibilidade (Onda 1), React essencial (C2.1, a partir da aula 4).
- **Módulos e aulas:**
  - M1 *Utility-first* (3): **tdw-01** Filosofia utility-first, estados e pseudoclasses; **tdw-02** Layout e responsividade (flex, grid, breakpoints, container queries, modo escuro); **tdw-03** Configuração e temas (v4: `@theme`, variáveis, plugin do Vite, `@source`).
  - M2 *Componentes* (2): **tdw-04** Componentização com Tailwind (extração, variantes com `cva`, `tailwind-merge`, `@apply` com cuidado, acessibilidade); **tdw-05** Design tokens (camadas primitivo, semântico e de componente; variáveis CSS; formato DTCG).
  - M3 *Design System* (4): **tdw-06** Fundamentos de um DS (princípios, tipografia, cor, espaço, API de componentes, componentes headless, acessibilidade); **tdw-07** Biblioteca de componentes: empacotamento, `exports`, versionamento semântico, tree-shaking, temas; **tdw-08** Documentação com Storybook (stories, controls, docs, addon de acessibilidade, testes de interação); **tdw-09** Governança (contribuição, RFCs, depreciação, métricas de adoção, ownership, handoff design-dev).
- **Exercícios:** mc, tf, match (utilitário → CSS), fill (classes), bug (classes conflitantes, falta de estado de foco), trace (resolução de variantes), open (decisões de DS). **`code`:** `cn()` (mescla de classes com conflito), gerador de escala de tokens, resolução de tema (tokens semânticos → primitivos), comparação semântica de versões (semver) para depreciação.
- **Prova (12):** sem `code`; inclui 2 itens de decisão de DS (open + mc).
- **Projeto integrador:** *Mini design system publicável*: tokens (claro/escuro), 6 componentes acessíveis (Button, Input, Select, Dialog, Tabs, Toast), Storybook, regras de contribuição e um changelog.
- **Dependências:** alimenta C2.5 (UI do Next) e C2.8 (monorepo de pacotes).

### C2.3 React avançado — 6 aulas, nível A
- **Disciplina/tópicos:** `react`: Renderização e reconciliação; Padrões de composição; Suspense e recursos concorrentes.
- **Objetivos:** prever e controlar renderizações; entender identidade, chaves e estado; projetar APIs de componentes compostos; usar Suspense, transições e valores adiados.
- **Pré-requisitos:** React essencial (C2.1); recomendado C2.2.
- **Módulos e aulas:**
  - M1 *Como o React renderiza* (2): **rav-01** Fases de render e commit; o que dispara um re-render; React Compiler (visão geral, sem substituir a aula de memoização da C2.7); **rav-02** Reconciliação, chaves e identidade (por que o estado "reseta"; árvore e posição).
  - M2 *Composição* (2): **rav-03** Componentes compostos (children, slots, compound components, contexto interno); **rav-04** Render props, componentes headless, controlados/não controlados, "state reducer", polimorfismo (`as`).
  - M3 *Suspense e concorrência* (2): **rav-05** Suspense, `lazy`, `use`, fronteiras de erro; **rav-06** Renderização concorrente: `useTransition`, `useDeferredValue`, prioridades.
- **Exercícios:** mc, trace (ordem de renders e efeitos), bug (chaves e identidade), fill, match, open. **`code`:** simulador de reconciliação de listas por chave (diff), máquina de estados de um componente composto, fila de prioridades de atualizações, `memo` com comparação rasa.
- **Prova (12):** sem `code`; 3 trace (ordem de execução).
- **Projeto integrador:** *Biblioteca de componentes compostos acessíveis* (Tabs, Accordion, Combobox) com API controlada e não controlada, e um "painel de carregamento" com Suspense e transições.
- **Dependências:** C2.7 (memoização), C2.5 (Server Components usam Suspense).

### C2.4 Gerenciamento de estado no frontend — 9 aulas, nível I→E
- **Disciplina/tópicos:** `state`: Estado local vs global; Redux Toolkit; Zustand; TanStack Query; Cache, invalidação e optimistic updates; Normalização de estado; Escolha de estratégia de estado em escala.
- **Objetivos:** classificar o estado (UI, servidor, URL, formulário, derivado); usar RTK, Zustand e TanStack Query nos casos certos; implementar cache, invalidação e atualizações otimistas; normalizar dados; decidir e documentar a estratégia.
- **Pré-requisitos:** React essencial (C2.1), TypeScript, HTTP (C1.2).
- **Módulos e aulas:**
  - M1 *Onde o estado vive* (2): **est-01** Taxonomia do estado e fontes da verdade; **est-02** `useReducer` + Context e seus limites.
  - M2 *Estado de cliente* (3): **est-03** Redux Toolkit I (store, slices, Immer, seletores); **est-04** Redux Toolkit II (efeitos assíncronos, listeners, DevTools, RTK Query em visão geral); **est-05** Zustand (store, seletores, middlewares, fatias).
  - M3 *Estado de servidor* (2): **est-06** TanStack Query I (chaves, queries, mutações, `staleTime`/`gcTime`); **est-07** TanStack Query II (invalidação, optimistic updates, paginação infinita, prefetch, hidratação).
  - M4 *Dados e decisões* (2): **est-08** Normalização de estado (entidades, relações, seletores memoizados); **est-09** Estratégia de estado em escala (árvore de decisão, ADRs, migração gradual, testes de estado).
- **Exercícios:** mc, tf, match (tipo de estado → ferramenta), trace (fluxo de actions), bug, fill, open. **`code` (muito adequado):** `createStore` com reducers, seletor memoizado, `normalizar`/`denormalizar`, cache com `staleTime` e invalidação por chave, atualização otimista com rollback, fila de mutações.
- **Prova (12):** sem `code`; 2 itens de decisão em cenários.
- **Projeto integrador:** *Painel de pedidos* com estado de servidor (TanStack Query), estado de UI (Zustand ou RTK) e um **documento de decisões (ADR)** justificando as escolhas; a API é simulada localmente.
- **Dependências:** C2.5 (hidratação e cache no servidor), C2.6 (testes de estado), mobile (C10).

### C2.5 Next.js: aplicações full stack com React — 11 aulas, nível I→E
- **Disciplina/tópicos:** `next`: App Router, rotas e layouts; Server Components; Client Components; Data fetching e cache; Server Actions; SSR, SSG, ISR e streaming; Middleware e autenticação; Route Handlers; Deploy e performance em produção.
- **Objetivos:** estruturar uma aplicação com o App Router; escolher entre componentes de servidor e de cliente; buscar, cachear e revalidar dados; mutar com Server Actions; proteger rotas; publicar com segurança e desempenho.
- **Pré-requisitos:** React essencial e avançado (C2.1, C2.3), estado (C2.4), HTTP (C1.2); recomendado C2.2.
- **Módulos e aulas:**
  - M1 *Rotas e componentes* (4): **nxt-01** App Router, estrutura, layouts, `loading`/`error`; **nxt-02** Rotas dinâmicas, grupos, rotas paralelas e interceptadas, metadados e SEO; **nxt-03** Server Components (modelo, serialização, componentes assíncronos); **nxt-04** Client Components e a fronteira `"use client"`, composição e provedores.
  - M2 *Dados e mutações* (3): **nxt-05** Data fetching e cache (camadas de cache, revalidação por tempo e por tag); **nxt-06** Server Actions e formulários (validação, `revalidate`, estado pendente, **segurança**); **nxt-07** Estratégias de renderização: SSR, SSG, ISR, streaming e renderização parcial.
  - M3 *Back-end no Next* (2): **nxt-08** Route Handlers (APIs, webhooks, streaming, CORS); **nxt-09** Middleware (ou o equivalente da versão em uso) e autenticação (sessões, cookies, camada de acesso a dados, autorização).
  - M4 *Produção* (2): **nxt-10** Imagens, fontes, scripts e otimizações embutidas; **nxt-11** Deploy e performance em produção (servidor Node, `standalone`/Docker, variáveis de ambiente, cache e observabilidade).
- **Exercícios:** mc, tf, match (função de renderização → caso de uso), trace (fluxo de requisição RSC), bug (vazamento de segredo para o cliente, falta de validação em Action), fill, open. **`code`:** roteador de caminhos com segmentos dinâmicos, política de cache/revalidação (`tags`), validação de entrada de Action, verificação de sessão e autorização como função pura, *matcher* de middleware.
- **Prova (12):** sem `code`; 2 itens de segurança (Server Actions, segredos).
- **Projeto integrador:** *Blog/loja full stack* com App Router, Server Actions, autenticação, cache com revalidação e deploy em contêiner (documentado).
- **Dependências:** C3 (SQL, ORMs) e C4 (APIs, autenticação) aprofundam; C6 (Docker, CI/CD); C7 (segurança).
- **Risco de versão:** o Next muda convenções com frequência (o `npm view` retorna a **16.4**, e o nome e o papel do *middleware* mudaram em versões recentes). Cada aula registrará a versão e terá que ser **verificada contra a documentação da versão**.

### C2.6 Testes de frontend — 8 aulas, nível I→E
- **Disciplina/tópicos:** `fe-test`: Por que e o que testar; Testing Library; Vitest e Jest com componentes; Mock de rede com MSW; Testes visuais; Estratégia de testes no frontend.
- **Objetivos:** decidir o que testar e em que nível; escrever testes centrados no comportamento; simular a rede; proteger o visual; desenhar a estratégia e o pipeline.
- **Pré-requisitos:** React essencial (C2.1), estado (C2.4); recomendado C2.5; ferramentas (C1.3).
- **Módulos e aulas:**
  - M1 *Base* (2): **tfe-01** Por que e o que testar (custo, risco, "troféu" de testes, comportamento versus implementação); **tfe-02** Vitest e Jest: configuração, ambiente jsdom, mocks, espiões e temporizadores falsos.
  - M2 *Testing Library* (3): **tfe-03** Consultas por papel e acessibilidade; **tfe-04** Interações (`user-event`), assincronia (`findBy`, `waitFor`), formulários; **tfe-05** Componentes com contexto, provedores, hooks e roteamento.
  - M3 *Rede e visual* (2): **tfe-06** MSW (manipuladores, cenários de erro, reuso no navegador); **tfe-07** Testes visuais e E2E (stories com interação, capturas de tela, regressão visual).
  - M4 *Estratégia* (1): **tfe-08** Estratégia de testes no frontend (níveis, CI, flaky tests, cobertura útil).
- **Exercícios:** mc, tf, match, trace, bug (consulta frágil, teste que testa implementação), fill, open. **`code`:** mini-biblioteca de asserções, *spy* e *mock* simplificados, *fake timers*, roteador de handlers (MSW simplificado), cálculo de diferença entre capturas (matriz de pixels).
- **Prova (12):** sem `code`.
- **Projeto integrador:** *Suíte de testes de um app existente* (o projeto de C2.1 ou C2.4): unitários, componentes, MSW, um fluxo E2E e um relatório de estratégia.
- **Fronteira com a C5 (Fundamentos de testes e Ferramentas JS):** C2.6 ensina testes **de interface**; C5 cobre a teoria geral (TDD, dublês, cobertura), testes de API (Supertest) e E2E em profundidade. Para não duplicar: C2.6 usa o mínimo de teoria para o contexto de UI e **aponta** para C5. É um ponto de revisão do Opus.
- **Dependências:** C5, C6 (CI).

### C2.7 Performance frontend — 8 aulas, nível M→E
- **Disciplina/tópicos:** `fe-perf`: Core Web Vitals; Lazy loading e code splitting; Otimização de imagens e fontes; Profiling com DevTools; Memoização no React; Orçamento de performance e RUM.
- **Objetivos:** medir com métricas de laboratório e de campo; reduzir o custo de carregamento e de execução; localizar gargalos com o profiler; aplicar memoização com critério; manter a performance com orçamentos e monitoramento.
- **Pré-requisitos:** React (C2.1 e C2.3), Next (C2.5), HTTP (C1.2), DevTools (C1.3); recomendado Web Platform (C1.5).
- **Módulos e aulas:**
  - M1 *Medir* (2): **pfe-01** Core Web Vitals (LCP, INP, CLS), laboratório versus campo; **pfe-02** Ferramentas de medição (Lighthouse, CrUX, biblioteca `web-vitals`).
  - M2 *Carregar menos e mais cedo* (3): **pfe-03** Caminho crítico de renderização, prioridades, `preload`/`preconnect`; **pfe-04** Lazy loading e code splitting (import dinâmico, rotas, análise do bundle, tree shaking); **pfe-05** Imagens e fontes (formatos, `srcset`/`sizes`, `font-display`, subsetting, CLS).
  - M3 *Executar melhor* (2): **pfe-06** Profiling com DevTools (flame chart, tarefas longas, depuração de INP, memória); **pfe-07** Memoização no React (`memo`, `useMemo`, `useCallback`, React Compiler, quando **não** usar).
  - M4 *Manter* (1): **pfe-08** Orçamento de performance e RUM (orçamentos no CI, Lighthouse CI, RUM, SLOs e alertas).
- **Exercícios:** mc, tf, trace (leitura de métricas e waterfall), bug (imagem sem dimensões, fonte bloqueante), match, fill, open. **`code`:** classificador de Core Web Vitals por limiares, cálculo de CLS a partir de *layout shifts*, p75 de amostras de RUM, verificador de orçamento, `debounce`/`throttle`, memoização com cache limitado.
- **Prova (12):** sem `code`.
- **Projeto integrador:** *Auditoria e otimização de uma aplicação*: relatório antes/depois com Lighthouse, orçamentos no CI e um script de RUM com `web-vitals`.
- **Dependências:** C6 (CDN e deploy), C8 (escalabilidade), C7.

### C2.8 Arquitetura frontend, monorepos e microfrontends — 7 aulas, nível M→E
- **Disciplinas/tópicos:** `fe-arch` + `react`: Monorepos (Turborepo, Nx); Microfrontends e Module Federation; Comunicação entre microfrontends; Quando usar e quando evitar microfrontends; **Arquitetura de aplicações React grandes**.
- **Objetivos:** organizar um frontend grande por responsabilidades; usar monorepos com cache de tarefas; entender microfrontends, Module Federation e comunicação; decidir de forma fundamentada quando adotar ou evitar.
- **Pré-requisitos:** C2.1, C2.3, C2.4, C2.5; recomendado C2.6; ferramentas (C1.3); Git (Onda 1).
- **Módulos e aulas:**
  - M1 *Aplicações grandes* (2): **arq-01** Organização por funcionalidade, camadas, fronteiras e regras de dependência; **arq-02** Contratos, erros, observabilidade, convenções e ADRs em aplicações React grandes.
  - M2 *Monorepos* (1): **arq-03** Workspaces, Turborepo e Nx (grafo de dependências, cache, tarefas afetadas, pacotes compartilhados).
  - M3 *Microfrontends* (3): **arq-04** Conceitos e abordagens (build, execução, iframes, Web Components); **arq-05** Module Federation na prática (host e remote, `shared`, versões, tipos); **arq-06** Comunicação (eventos, props, URL, estado compartilhado, contratos e versionamento).
  - M4 *Decisão* (1): **arq-07** Quando usar e quando evitar microfrontends (lei de Conway, custos, alternativas, migração gradual).
- **Exercícios:** mc, tf, match, trace, bug (dependência circular, versão incompatível em `shared`), fill, open. **`code`:** detector de ciclos e verificador de regras de dependência entre módulos, cálculo de "projetos afetados" em um grafo (Nx/Turborepo simplificado), barramento de eventos tipado, resolução de versões compatíveis (semver).
- **Prova (12):** sem `code`; 2 itens de decisão com cenários.
- **Projeto integrador:** *Monorepo com dois aplicativos e dois pacotes* e um **ADR** que decide, com critérios, entre monólito modular e microfrontends para um cenário dado.
- **Dependências:** C6 (CI/CD), C8 (arquiteturas e sistemas distribuídos), C4 (BFF).

## 4. Ementa consolidada e cobertura dos 50 tópicos

| Curso | Tópico (catálogo) → aulas |
| --- | --- |
| C2.1 | Componentes e JSX → rea-01, 02, 03 · Props e estado → rea-03, 04 · Listas e renderização condicional → rea-05 · Hooks essenciais → rea-07, 08 · Context API → rea-09 · Hooks customizados → rea-10 · Formulários → rea-06, 11 |
| C2.2 | Utilitários e responsividade → tdw-01, 02 · Configuração e temas → tdw-03 · Componentização → tdw-04 · Design tokens → tdw-05 · Construção de um DS → tdw-06, 07 · Storybook → tdw-08 · Governança → tdw-09 |
| C2.3 | Renderização e reconciliação → rav-01, 02 · Padrões de composição → rav-03, 04 · Suspense e recursos concorrentes → rav-05, 06 |
| C2.4 | Estado local vs global → est-01, 02 · Redux Toolkit → est-03, 04 · Zustand → est-05 · TanStack Query → est-06 · Cache, invalidação, optimistic → est-07 · Normalização → est-08 · Estratégia em escala → est-09 |
| C2.5 | App Router → nxt-01, 02 · Server Components → nxt-03 · Client Components → nxt-04 · Data fetching e cache → nxt-05 · Server Actions → nxt-06 · SSR, SSG, ISR e streaming → nxt-07 · Route Handlers → nxt-08 · Middleware e autenticação → nxt-09 · Deploy e performance → nxt-10, 11 |
| C2.6 | Por que e o que testar → tfe-01 · Testing Library → tfe-03, 04, 05 · Vitest e Jest → tfe-02, 05 · MSW → tfe-06 · Testes visuais → tfe-07 · Estratégia → tfe-08 |
| C2.7 | Core Web Vitals → pfe-01, 02 · Lazy loading e code splitting → pfe-03, 04 · Imagens e fontes → pfe-05 · Profiling → pfe-06 · Memoização no React → pfe-07 · Orçamento e RUM → pfe-08 |
| C2.8 | Arquitetura de aplicações React grandes → arq-01, 02 · Monorepos → arq-03 · Microfrontends e Module Federation → arq-04, 05 · Comunicação → arq-06 · Quando usar/evitar → arq-07 |

O validador da C1 (`seed/c1/validate.mjs`) já checa a cobertura de tópicos pela estrutura `TOPICS`/`COVER`; a C2 reutilizará o mesmo mecanismo (diretório `seed/c2/`, sem tocar em `build.mjs`).

## 5. Compatibilidade técnica e limites do laboratório

- **Formato inalterado:** cursos, módulos, aulas, 8 tipos de exercício (mc, tf, fill, match, trace, bug, open e `code`), prova de 12 itens sem `code`, projeto, suplemento, `makeCourse` e CMS. Nenhum novo formato, laboratório ou alteração de arquitetura.
- **O que o laboratório executa:** apenas JavaScript puro em Worker. **Não executa JSX, React, DOM, Next.js, Tailwind nem Storybook.** Para a C2 isso significa:
  - Os desafios `code` serão **lógica pura** que modela o conceito (reducers, seletores, caches, normalização, grafos de dependência, cálculo de métricas, parsers). Isso é pedagogicamente forte e **100% corrigido de forma determinística**.
  - Comportamento de componentes entra em mc, bug, trace, fill, match e open, com código JSX apresentado como texto (`lang: 'jsx'`).
- **Verificação do material (regra do projeto):** os exemplos serão executados em um projeto de teste **real**, no ambiente de produção do conteúdo: React/Vite e Testing Library com jsdom, Next.js (`next build` e execução), Tailwind (CLI/Vite), TanStack Query, Redux Toolkit, Zustand, MSW, Vitest, Turborepo e Module Federation. O `npm` funciona neste ambiente (testado). Não executável aqui: o que depende de **navegadores baixados** (Playwright, Chromatic) ou do ambiente da Vercel; esses trechos serão marcados como "analisados, não executados", como já foi feito na C1.
- **Versões atuais (`npm view`, 2026-11-18):** react 19.3.1, next 16.4.6, tailwindcss 4.3.5, @reduxjs/toolkit 2.14.0, zustand 5.1.0, @tanstack/react-query 5.108.0, vitest 5.1.0, jest 30.5.2, @testing-library/react 16.3.3, msw 3.0.7, storybook 10.6.7, turbo 2.11.12, nx 24.0.6, @playwright/test 1.65.1, web-vitals 6.2.3, @module-federation/enhanced 2.9.3, vite 8.3.8, typescript 7.0.2. **Cada aula registrará `techVersions`**; versões e convenções serão reconferidas na produção (a documentação oficial é a fonte).
- **Catálogo e vínculos:** cada curso se vincula à disciplina principal (`disciplineId`) e às demais (`disciplineIds`); a cobertura (`E.coverage`) já considera vários cursos por disciplina. `react` ficará em 3 cursos.
- **Correção determinística:** todas as questões da prova são mc, tf, fill, match, trace, bug ou open (autoavaliado com rubrica).

## 6. Ordem de produção e lotes

| Lote | Cursos | Por quê | Aulas |
| --- | --- | --- | --- |
| **A — Fundamentos de interface** | C2.1 React essencial; C2.2 Tailwind e Design Systems; C2.3 React avançado | Base de todo o restante; usa só Vite, React e Tailwind (verificação simples); gera os componentes usados nos projetos seguintes | 11 + 9 + 6 = 26 |
| **B — Dados e framework** | C2.4 Estado; C2.5 Next.js | O estado de servidor prepara os dados do Next; o Next é o curso de maior risco de versão, por isso vem com o estado "fresco" | 9 + 11 = 20 |
| **C — Qualidade e escala** | C2.6 Testes; C2.7 Performance; C2.8 Arquitetura e microfrontends | Dependem do que foi construído antes; a Arquitetura é a mais abstrata e fecha a onda | 8 + 8 + 7 = 23 |

Cada lote termina com: validador sem falhas, referências abertas, relatório de progresso e **revisão do Opus** sobre integração ao seed (sem publicar). A publicação (nova revisão do seed) é decisão separada, com teste de upgrade.

## 7. Estimativas de esforço

| Item | Estimativa C2 | Referência da C1 (medida) |
| --- | --- | --- |
| Cursos | 8 | 7 planejados; 3 validados |
| Módulos | 30 (3 a 4 por curso) | 3 por curso |
| Aulas | 69 | 51 planejadas; 24 produzidas |
| Exercícios (5 a 6 por aula) | ~370 | 140 nos 3 cursos da C1 (média ~5,8 por aula) |
| Itens de prova | 96 (8 × 12) | 12 por curso |
| Projetos integradores | 8 | 1 por curso |
| Conteúdo textual | ~1,0 MB de fontes `.mjs` | ~120 KB por curso na C1 |
| Referências oficiais | ~250 URLs distintas a abrir | 94 na C1 (3 cursos) |
| Esforço de geração | 8 cursos, cada um com ~100 a 130 KB de fontes (como os da C1), mais verificação (instalar e executar projetos React/Next/Tailwind) | Sem medição de tempo; a C1 mostrou que a verificação real consome boa parte do esforço |

Estimativa prática: **3 sessões longas** (uma por lote), com 2 a 3 cursos cada. O gargalo da C2 é a **verificação real** (instalações e builds de Next, Storybook e Module Federation), mais pesada que a da C1.

## 8. Critérios de aceite da C2

1. **Cobertura:** os 50 tópicos do catálogo mapeados a aulas (`COVER`), as 7 disciplinas vinculadas aos cursos no catálogo; relatório de cobertura sem pendências (`E.coverage`: 0 aulas sem exercício, 0 cursos sem prova ou projeto).
2. **Cursos completos:** 8 cursos com objetivos, pré-requisitos, módulos, aulas com 12 seções (teoria ≥ 3.500 caracteres, conceitos, exemplos, código comentado, boas práticas, erros comuns, mercado, resumo, referências, cartões) e `techVersions`.
3. **Exercícios:** ≥ 5 por aula, com gabarito comentado, `difficulty`, `points` e variedade de tipos; **todo `code` com solução que passa nos testes e código inicial que falha**.
4. **Provas:** 12 itens por curso, `passPct` 70, sem `code`, ids no padrão.
5. **Projetos:** 8 projetos com requisitos funcionais e não funcionais, critérios de aceite e desafios.
6. **Suplementos:** glossário ≥ 15 termos, cheatsheet, erros comuns, mapa de pré-requisitos, referências oficiais e prática, por curso.
7. **Referências:** 100% das URLs abertas com HTTP 200 e **registradas com data** (ferramenta `refs-check`); citações de versão conferidas.
8. **Checklists editoriais:** `E.lessonChecklist`, `E.courseChecklist` e `E.itemsChecklist` sem falhas.
9. **Verificação técnica:** todo exemplo de código **executado ou compilado** em projeto de teste real; o que não pôde ser executado fica marcado como tal (e listado no relatório).
10. **Testes:** `validate` da C2 sem falhas; `npm test` (suíte existente) verde; teste e2e de upgrade com banco em revisão anterior e idempotência, **antes de publicar**.
11. **Integridade:** nenhum curso, aula, exercício ou dado da Onda 1, da C1 ou do piloto alterado.
12. **Persistência (após autorização de publicação):** cursos, módulos, aulas, exercícios, provas, projetos e vínculos relidos no **banco real** (`list`/`get`), sem duplicados nem órfãos, e relatório de fechamento aprovado.

## 9. Dependências

| Curso | Onda 1 | C1 | Dentro da C2 | Ondas futuras |
| --- | --- | --- | --- | --- |
| C2.1 | JS, TS, HTML/CSS, Git | Ferramentas (C1.3) | — | C10 (React Native), todos da C2 |
| C2.2 | HTML/CSS/a11y | Ferramentas | C2.1 (a partir da aula 4) | C2.5, C2.8 |
| C2.3 | JS, TS | — | C2.1 (C2.2 recomendado) | C2.5, C2.7 |
| C2.4 | JS, TS | Redes (C1.2) | C2.1 | C2.5, C10 |
| C2.5 | JS, TS | Redes (C1.2), Ferramentas | C2.1, C2.3, C2.4 (C2.2 recomendado) | C3, C4, C6, C7 |
| C2.6 | JS, TS | Ferramentas (C1.3) | C2.1, C2.4 (C2.5 recomendado) | C5 (aprofunda), C6 |
| C2.7 | HTML/CSS | Redes, Ferramentas, Web Platform (C1.5, recomendado) | C2.1, C2.3, C2.5 | C6, C8 |
| C2.8 | Git | Ferramentas | C2.1, C2.3, C2.4, C2.5 (C2.6 recomendado) | C5, C6, C8 |

`requires` (pré-requisito obrigatório, bloqueia a recomendação no app) usará só cursos **já existentes ou produzidos**; vínculos com C1.5 e as ondas futuras ficam em `prereqs` (texto) e no mapa de pré-requisitos, para não referenciar cursos inexistentes.

## 10. Riscos, pontos de decisão e revisão do Opus

**Riscos técnicos**
1. **Volatilidade de versão:** Next 16, React 19, Tailwind 4, Vitest 5, MSW 3, Storybook 10, TypeScript 7 (todas muito recentes). Convenções e nomes mudam (por exemplo, o *middleware* do Next). Mitigação: `techVersions` por aula, verificação em projeto real, linguagem que separa **conceito** (estável) de **API** (datada).
2. **Verificação pesada e parcial:** instalações grandes; navegador necessário para Playwright; sem Vercel. Mitigação: marcar explicitamente o que não foi executado.
3. **Laboratório só JS:** componentes não são corrigidos automaticamente; a lógica é modelada em funções puras. Risco de exercícios de "componente" ficarem pouco práticos: compensado por trace/bug e pelos projetos.
4. **Tamanho:** ~1 MB de fontes e ~370 exercícios; risco de erro em escapes (`String.raw`, `DOLAR{`) e de inconsistências. Mitigação: o validador da C1 (que já pegou erros de escape) será reutilizado.
5. **Dependência de internet:** referências e `npm view`; sites podem estar bloqueados (ocorreu com `gnu.org`).

**Riscos pedagógicos**
1. **Frameworks demais, fundamentos de menos:** a C2 precisa formar quem entende *por que* (modelo de renderização, cache, fronteiras de servidor e cliente), não só *como* usar bibliotecas. Mitigação: cada curso abre com o modelo mental e fecha com decisões e trade-offs.
2. **Duplicação:** testes (C2.6 × C5), memoização (C2.3 × C2.7), performance do Next (C2.5 aula 10/11 × C2.7), segurança de Server Actions (C2.5 × C7). Mitigação: regras de fronteira por curso (seção 3) e referências cruzadas.
3. **Curso que envelhece:** o cronograma de revisão (`nextReviewAt`) será de 6 meses, e o radar de versões (`kb_radar`) deve acompanhar react, next e tailwind (`react` e `nextjs` já estão no `watch` do perfil; `tailwind` não).

**Decisões do dono**
1. Aprovar o agrupamento em **8 cursos** (e a ordem).
2. Adicionar `fe-test`, `fe-perf` e `fe-arch` à trilha **Full Stack** (`fs-ts`)? Hoje só `react`, `state`, `next` e `tailwind` estão nela. Mudança no catálogo, **fora desta etapa**.
3. Concluir a C1 antes (C1.4 a C1.7) ou iniciar a C2 em paralelo (arquivos independentes em `seed/c2/`).
4. Aceitar a **fronteira C2.6 × C5** (teste de UI na C2; teoria e API na C5).

**Pontos para revisão do Opus**
1. **Agrupamento multi-disciplina:** `react` em 3 cursos e o tópico E "Arquitetura de aplicações React grandes" ensinado em um curso de `fe-arch`; efeito em cobertura, em `requires` e no mapa de competências futuro.
2. **Publicação em lotes (A, B, C):** estratégia de `SEED_REV` (C1 ainda não publicada), idempotência e `seedPlan` com documentos de ondas diferentes; mesmo cuidado já registrado na revisão da C1.
3. **Política de versões:** como representar conteúdo datado (`techVersions` por aula, revisão semestral, radar) sem alterar o esquema.
4. **Formato dos exercícios para UI:** manter lógica pura em `code` e demais tipos para componentes; avaliar se o *trace* de renderização é suficiente ou se um tipo futuro (Trilha A) vale o custo.
5. **Segurança do conteúdo:** exemplos de autenticação, cookies, Server Actions e segredos no Next precisam de revisão por risco (mensagens que induzam práticas inseguras).

## 11. Próximo passo
Aguardo a sua aprovação do agrupamento, da ordem e das 4 decisões acima. **Nenhuma aula da C2 foi produzida.** Se aprovar, o Lote A começa com C2.1 (React essencial), em `seed/c2/`, com o mesmo validador e as mesmas regras de segurança da C1 (sem tocar em `build.mjs`, `SEED_REV`, banco ou publicação).
