// C5.8 — Qualidade e manutenção de software. Aulas 1 a 3 (qualidade; code review; métricas).
const R = String.raw;

export const REF = {
  iso25010: { title: 'ISO/IEC 25010 — Product quality model (iso25000.com)', url: 'https://iso25000.com/index.php/en/iso-25000-standards/iso-25010', kind: 'norma' },
  googleReview: { title: 'Google Engineering Practices — Code Review', url: 'https://google.github.io/eng-practices/review/', kind: 'guia' },
  reviewStandard: { title: 'Google — The Standard of Code Review', url: 'https://google.github.io/eng-practices/review/reviewer/standard.html', kind: 'guia' },
  smallCls: { title: 'Google — Small CLs', url: 'https://google.github.io/eng-practices/review/developer/small-cls.html', kind: 'guia' },
  conventionalComments: { title: 'Conventional Comments', url: 'https://conventionalcomments.org/', kind: 'guia' },
  pullRequest: { title: 'Martin Fowler — PullRequest', url: 'https://martinfowler.com/bliki/PullRequest.html', kind: 'artigo' },
  cyclomatic: { title: 'Wikipedia — Cyclomatic complexity', url: 'https://en.wikipedia.org/wiki/Cyclomatic_complexity', kind: 'referência' },
  cognitive: { title: 'SonarSource — Cognitive Complexity', url: 'https://www.sonarsource.com/resources/cognitive-complexity/', kind: 'whitepaper' },
  hotspots: { title: 'CodeScene — Hotspots', url: 'https://codescene.io/docs/guides/technical/hotspots.html', kind: 'doc' },
  busFactor: { title: 'Wikipedia — Bus factor', url: 'https://en.wikipedia.org/wiki/Bus_factor', kind: 'referência' },
  dora: { title: 'DORA — The four key metrics', url: 'https://dora.dev/guides/dora-metrics/', kind: 'guia' }
};

export const lessonsA = [
{
  id: 'qual-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['qualidade de software', 'ISO 25010', 'atributos de qualidade', 'manutenibilidade', 'custo de mudar'],
  title: 'O que é qualidade de software: atributos, trade-offs e o custo de mudar',
  objectives: ['Definir qualidade de software além de "sem bugs" (adequação ao uso e custo de evolução)', 'Usar o modelo ISO/IEC 25010 para discutir atributos de qualidade', 'Identificar trade-offs entre atributos (desempenho, segurança, manutenibilidade, custo)', 'Distinguir qualidade interna, externa e em uso e escolher como evidenciar cada atributo', 'Relacionar qualidade ao custo de mudar e às práticas do curso (testes, revisão, refatoração, observabilidade)', 'Formular requisitos de qualidade mensuráveis (cenários) em vez de adjetivos'],
  intro: R`**Qualidade** não é "ausência de bugs": é **o quanto o software atende às necessidades de quem o usa e de quem o mantém, a um custo sustentável**. Ela tem **muitas dimensões** (funcionalidade, desempenho, segurança, usabilidade, manutenibilidade...), que **competem entre si**. Nos laboratórios do curso, cada dimensão apareceu com **um número**: **p95 de 13,0 ms** a 50 req/s (desempenho: C5.6), **vazão estagnada em 35,5 req/s** sob estresse, **pontuação de mutação 69,44% → 97,22%** (confiança nos testes), **20 → 1 avisos** de lint após refatorar (manutenibilidade: C5.1) e **2 violações de arquitetura** barradas (C5.6). Esta aula organiza essas medidas em um **vocabulário** e mostra **como transformar adjetivos em cenários mensuráveis**.`,
  theory: R`### Várias definições, uma ideia
- **Conformidade com requisitos** (Crosby): "**faz o que foi especificado**" (mas requisitos podem estar **errados** ou **incompletos**);
- **Adequação ao uso** (Juran): "**serve ao seu propósito** para quem usa";
- **Qualidade como valor para pessoas** (Weinberg): "**valor para alguém**" (**de quem?** **quem decide**?);
- **Visão de engenharia:** **atributos** **mensuráveis** do **produto** e do **processo**, **balanceados** no **contexto**.
**Em prática:** qualidade é **um conjunto de atributos** que **importam** **neste produto** para **estas pessoas**, **evidenciados** por **dados**.

### Modelo ISO/IEC 25010 (qualidade do produto)
Oito características, cada uma com subcaracterísticas:
| Característica | O que cobre (exemplos) | Evidência típica (no curso) |
|---|---|---|
| **Adequação funcional** | completude, correção, pertinência | testes de unidade/integração/BDD (C5.4), contratos (C5.6) |
| **Eficiência de desempenho** | tempo de resposta, uso de recursos, capacidade | k6: p95, vazão, saturação (C5.6); GC e JIT (C5.7) |
| **Compatibilidade** | coexistência, interoperabilidade | contratos Pact, versionamento de APIs (C4.3) |
| **Usabilidade** (interação) | aprendizado, acessibilidade, proteção contra erro | E2E, testes com usuários, acessibilidade (front-end) |
| **Confiabilidade** | maturidade, disponibilidade, tolerância a falhas, recuperabilidade | SLOs, backpressure, testes de estresse (aula qual-05) |
| **Segurança** | confidencialidade, integridade, autenticidade, não repúdio | auth (C4.4), OWASP (C7) |
| **Manutenibilidade** | modularidade, reusabilidade, analisabilidade, **modificabilidade**, **testabilidade** | lint, complexidade, mutação, ADRs, refatoração (C5.1 a C5.3) |
| **Portabilidade** | adaptabilidade, instalabilidade, substituibilidade | contêineres e CI (C6) |
O modelo **também** define **qualidade em uso** (**eficácia, eficiência, satisfação, ausência de riscos, cobertura de contexto**): **como o produto se sai** com **pessoas reais**.
**Para que serve:** **checklist de conversa** ("**já pensamos em portabilidade?**"), **não** uma **lista de metas**; **cada contexto** prioriza **poucos atributos**.

### Qualidade interna x externa x em uso
- **Interna:** **o que se vê no código e na arquitetura**: **complexidade**, **acoplamento**, **cobertura**, **duplicação** (**aulas anteriores**). **Preditor** de **custo de mudar**, **não garante** valor;
- **Externa:** **comportamento observável** (**defeitos**, **latência**, **disponibilidade**);
- **Em uso:** **resultado para quem usa** (**tarefas concluídas**, **satisfação**, **conversão**, **suporte**).
**Cadeia:** **qualidade interna** → **externa** → **em uso** → **valor de negócio**. **Armadilha:** **otimizar a interna** (**100% de cobertura, zero avisos**) **sem olhar a externa/em uso** (**Goodhart**, tst-06).

### Trade-offs
**Atributos competem:** **segurança** (**validações, criptografia**) **x** **desempenho** (**latência**); **desempenho** (**cache**, **otimizações**) **x** **manutenibilidade** (**complexidade**); **flexibilidade** (**abstrações**) **x** **simplicidade** (**pattern-itis**, pat-05); **velocidade de entrega** **x** **dívida técnica** (cln-05); **disponibilidade** (**réplicas**, **redundância**) **x** **custo**.
**Como decidir:** **explicitar** **quais atributos importam** (**por quê**), **registrar a decisão** em **ADR** (**C5.3**) com **alternativas e consequências**, e **medir** o **resultado**. **Exemplo do curso:** o **backpressure** (503 rápido) **sacrifica** **disponibilidade aparente** para **proteger a latência** de quem entra (**tav-03**).

### Requisitos de qualidade como cenários (atributo de qualidade)
**Adjetivos** ("rápido", "seguro", "fácil de manter") **não são testáveis**. Use **cenários** com **fonte, estímulo, ambiente, artefato, resposta e medida de resposta**:
- **Desempenho:** "**Sob 200 req/s normais** (ambiente), **a API de pedidos** (artefato) **responde à consulta de cliente** (estímulo) **com p95 < 150 ms e < 1% de erros** (medida)";
- **Modificabilidade:** "**Adicionar um novo tipo de desconto** **exige alterar no máximo 1 arquivo de regra e 1 de teste**, em **menos de 1 dia** de uma pessoa nova" (aula cln-02: **OCP**);
- **Disponibilidade:** "**Perda de uma réplica** **não** causa **erros visíveis** e **a restauração** ocorre em **< 5 min**";
- **Segurança:** "**Tentativas de acesso a recursos de outro cliente** **são negadas (403)** e **registradas**".
**Cada cenário** vira **teste, alerta ou revisão**: **sem medida, não há qualidade, só opinião**.

### Qualidade e custo de mudar
**O valor** de **software** está em **poder mudar** (**requisitos mudam**). **Qualidade interna** (**testes, modularidade, clareza**) **reduz o custo e o risco** de **cada mudança**; **dívida técnica** (cln-05) é **o custo acumulado** por **atalhos**. **Sinais de que a qualidade caiu:** **lead time sobe**, **mais defeitos por mudança**, **medo de mexer**, **onboarding lento**, **retrabalho** (aula qual-03).
**Práticas do curso que sustentam** cada atributo: **revisão de código** (qual-02), **métricas** (qual-03), **refatoração contínua e gestão da dívida** (qual-04) e **confiabilidade e SRE** (qual-05).

### Qualidade é do time, em todas as etapas
- **Requisitos:** **critérios de aceite** claros (BDD: tst-06);
- **Design:** **ADRs**, **fronteiras**, **revisão de arquitetura** (C5.3);
- **Código:** **padrões**, **lint/tipos**, **revisão**, **testes** (C5.1 a C5.6);
- **Entrega:** **CI/CD**, **feature flags**, **rollout gradual** (C6);
- **Operação:** **observabilidade**, **SLOs**, **postmortems** (C4.6, qual-05);
- **Cultura:** **segurança psicológica**, **tempo para qualidade** (**capacidade fixa**: cln-05), **donos claros**.
**Não existe "departamento de qualidade" que garanta**: **QA/SDET** **ensina, projeta estratégia e explora**; **o time inteiro é responsável**.

### Medindo qualidade: sinais, não verdades
**Combine** **várias fontes** (**nenhuma isolada**): **defeitos escapados**, **incidentes**, **SLOs**, **tempo de ciclo**, **métricas de código**, **satisfação** (**NPS/CSAT**), **custos de suporte**. **Cuidado** com **métricas de vaidade** e **com comparar equipes**. **Tendência** **importa mais** que **valor absoluto**.`,
  concepts: [
    { term: 'Qualidade de software', def: 'Grau em que o produto atende às necessidades de quem o usa e o mantém, a um custo sustentável, evidenciado por atributos mensuráveis.' },
    { term: 'ISO/IEC 25010', def: 'Modelo que organiza a qualidade do produto em oito características (como funcionalidade, desempenho, segurança e manutenibilidade) e a qualidade em uso.' },
    { term: 'Atributo de qualidade', def: 'Propriedade não funcional do sistema (desempenho, disponibilidade, modificabilidade) que pode ser especificada e medida.' },
    { term: 'Cenário de qualidade', def: 'Requisito mensurável descrito por estímulo, ambiente, resposta e medida de resposta.' },
    { term: 'Qualidade interna', def: 'Características do código e da arquitetura (complexidade, acoplamento) que influenciam o custo de mudar.' },
    { term: 'Qualidade em uso', def: 'Resultado do produto para pessoas reais em contextos reais (eficácia, eficiência, satisfação).' },
    { term: 'Trade-off', def: 'Escolha em que melhorar um atributo piora outro, exigindo decisão explícita.' }
  ],
  examples: R`**Analogia:** a qualidade de uma **casa** não é só "não ter goteiras": é **conforto** (usabilidade), **estrutura** (confiabilidade), **conta de luz** (eficiência), **facilidade de reformar** (manutenibilidade) e **segurança**: e **você não maximiza tudo**: paredes mais grossas isolam melhor e **custam mais e reduzem a área**.

**Exemplo 1: cenário.** "Sob 200 req/s, p95 < 150 ms e < 1% de erros": vira um teste k6 com thresholds.

**Exemplo 2: trade-off.** O backpressure recusa requisições cedo (503) para proteger a latência: troca disponibilidade aparente por desempenho.

**Exemplo 3: cadeia.** Qualidade interna (testes, modularidade) reduz o custo de mudar e, com isso, melhora a externa e a em uso.`,
  code: [
    { title: 'Transformar adjetivos em cenários de qualidade com medida (Markdown)', lang: 'md', code: R`| Atributo | Adjetivo (ruim) | Cenário mensurável (bom) | Evidência |
|---|---|---|---|
| Desempenho | "A API tem que ser rápida" | Sob 200 req/s, GET /clientes/:id responde com p95 < 150 ms e < 1% de erros | k6 com thresholds no CI |
| Modificabilidade | "Fácil de evoluir" | Adicionar um tipo de desconto altera no máx. 1 arquivo de regra + 1 de teste | revisão + dependency-cruiser |
| Disponibilidade | "Sempre no ar" | Perder 1 de 3 réplicas não gera erros visíveis; restauração < 5 min | teste de caos, alerta de SLO |
| Segurança | "Seguro" | Acesso a dados de outro cliente retorna 403 e gera log | teste de API + auditoria |`, notes: [{ l: '1', t: 'Cada linha liga o atributo a uma medida e a uma forma de evidência.' }, { l: '4', t: 'A medida de resposta (p95, erros, tempo) é o que torna o requisito testável.' }] },
    { title: 'Medidas de qualidade que o curso produziu (resumo dos laboratórios; números medidos)', lang: 'md', code: R`- Manutenibilidade (C5.1): legado 20 avisos do ESLint (complexidade 14) → refatorado 1 aviso; 36 testes de caracterização
- Confiança nos testes (C5.4/C5.6): cobertura 100% das linhas com 2 de 7 mutantes vivos; Stryker 69,44% → 97,22%
- Desempenho (C5.6): carga 50 it/s com p95 13,0 ms; estresse com vazão estagnada em 35,5 req/s e p95 4,59 s
- Arquitetura (C5.6): 2 violações (domínio → infra e ciclo) barradas por regra executável
- Interface (C5.6): renomear nome → name quebra o contrato; campo extra não
- Execução e memória (C5.7): JIT 7x; formas de objeto 4,2x; cache sem limite → OOM em 64 MB`, notes: [{ l: '1', t: 'Cada medida é uma evidência de um atributo, não uma nota geral.' }, { l: '6', t: 'Os números vêm de laboratórios de uma máquina; servem de ilustração.' }] },
    { title: 'Um cenário de qualidade vira um teste automatizado (JavaScript do k6; conceitual)', lang: 'js', code: R`import http from 'k6/http';
// Cenário: sob 200 req/s, GET /clientes/1 responde com p95 < 150 ms e < 1% de erros
export const options = {
  scenarios: { carga: { executor: 'constant-arrival-rate', rate: 200, timeUnit: '1s', duration: '60s', preAllocatedVUs: 50, maxVUs: 200 } },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<150'] }
};
export default function () { http.get('http://127.0.0.1:4580/clientes/1'); }`, notes: [{ l: '4', t: 'A taxa do cenário vira o executor.' }, { l: '5', t: 'A medida de resposta vira o threshold.' }] }
  ],
  bestPractices: ['Defina qualidade com atributos priorizados para o contexto, não como "zero bugs".', 'Escreva requisitos de qualidade como cenários com medida e conecte cada um a um teste, alerta ou revisão.', 'Registre trade-offs em ADRs com alternativas e consequências.', 'Combine várias fontes de evidência e acompanhe tendências, evitando métricas de vaidade.', 'Trate a qualidade interna como investimento em custo de mudar, sem perder a visão do valor para quem usa.', 'Compartilhe a responsabilidade entre o time, com papéis claros para QA/SDET.', 'Revise periodicamente quais atributos importam, pois o contexto muda.'],
  mistakes: ['Reduzir qualidade a "ausência de bugs".', 'Requisitos de qualidade em adjetivos.', 'Querer maximizar todos os atributos ao mesmo tempo.', 'Otimizar métricas internas sem olhar para o resultado em uso.', 'Delegar a qualidade a um departamento.', 'Medir apenas o que é fácil de medir.'],
  market: R`**Falar de qualidade em termos de atributos, cenários e trade-offs** é **marca de engenharia sênior** (arquitetura, SRE, liderança técnica); **perguntas** como "**como você sabe que o sistema está bom?**" **testam** exatamente isso.`,
  summary: R`Qualidade de software é adequação ao uso e custo sustentável de evolução, expressa por atributos priorizados (ISO/IEC 25010: funcionalidade, desempenho, compatibilidade, usabilidade, confiabilidade, segurança, manutenibilidade, portabilidade) que competem entre si. Transforme adjetivos em cenários mensuráveis e ligue cada um a testes, alertas ou revisões; registre trade-offs em ADRs. A qualidade interna reduz o custo de mudar e sustenta a externa e a em uso, e é responsabilidade do time. Os números do curso (p95 de 13,0 ms, mutação 97,22%, 20 → 1 avisos) são evidências de atributos, não notas gerais.`,
  refs: [REF.iso25010, REF.dora, REF.reviewStandard],
  cards: [
    { q: 'Por que "ausência de bugs" é uma definição insuficiente de qualidade?', a: 'Ignora desempenho, segurança, usabilidade e custo de evolução; qualidade é adequação ao uso e sustentabilidade, por atributos priorizados.' },
    { q: 'O que é um cenário de qualidade?', a: 'Um requisito mensurável com estímulo, ambiente, resposta e medida (por exemplo, p95 < 150 ms sob 200 req/s).' },
    { q: 'Dê um trade-off visto no curso.', a: 'O backpressure troca disponibilidade aparente por latência estável; cache melhora desempenho e complica a manutenção.' },
    { q: 'Como a qualidade interna se liga ao valor?', a: 'Reduz o custo e o risco de mudar, o que melhora a qualidade externa e em uso ao longo do tempo.' }
  ]
},
{
  id: 'qual-02', moduleId: 'm1', order: 2, minutes: 75, tags: ['code review', 'pull request', 'tamanho do PR', 'comentários', 'cultura', 'checklist'],
  title: 'Code review eficaz: propósito, tamanho das mudanças, o que revisar, como comentar e como medir',
  objectives: ['Explicar o propósito da revisão (saúde do código, conhecimento compartilhado, não só achar bugs)', 'Preparar um PR revisável (pequeno, focado, com contexto e testes)', 'Revisar com um roteiro (design, correção, testes, legibilidade, segurança, desempenho)', 'Escrever comentários úteis e respeitosos (intenção, porquê, alternativa)', 'Classificar o tamanho de PRs e saber quando dividir', 'Equilibrar rapidez e qualidade, usando automação para o que é mecânico'],
  intro: R`**Revisão de código** é uma das práticas de qualidade com **melhor custo-benefício**: **acha defeitos cedo**, **difunde conhecimento**, **mantém padrões** e **melhora o design**. Mas **só funciona** com **mudanças pequenas**, **revisores atentos** e **cultura segura**. No laboratório, o **classificador de tamanho de PR** mostrou: **8 linhas = XS**, **30 = S**, **160 = M**, **400 = L** ("considere dividir") e **700 = XL** ("divida antes de revisar"); e o **checklist de revisão** do curso reúne o que olhar **depois** da automação (lint, tipos, testes) **já ter rodado**.`,
  theory: R`### Para que serve (e para que não)
- **Saúde do código:** **cada mudança** deve **melhorar ou, no mínimo, não piorar** a base (Google: **"aprove quando melhora a saúde geral do código"**, **mesmo que não seja perfeito**);
- **Compartilhar conhecimento** (**duas pessoas** entendem a mudança), **mentoria**, **consistência**, **bus factor** (aula qual-03);
- **Achar defeitos** **de lógica, design e segurança** que **testes e linters não acham**;
- **Não serve** para **caçar espaços e vírgulas** (**formatador/lint** fazem isso), **provar** quem é melhor, nem **substituir testes** (a revisão **não é** rede de segurança **principal**).

### Autoria: facilitar a revisão
1. **Mudanças pequenas e focadas** (**um propósito**): **PRs pequenos** são **revisados mais rápido e melhor**, geram **menos conflitos** e **entram mais cedo**. **Heurística medida no laboratório** (**linhas adicionadas + removidas**):
| Linhas | Tamanho | Recomendação |
|---|---|---|
| **≤ 10** | **XS** | revisão rápida |
| **≤ 50** | **S** | revisão rápida |
| **≤ 200** | **M** | revisão normal |
| **≤ 500** | **L** | **considere dividir** |
| **> 500** | **XL** | **divida antes de revisar** |
(**limites arbitrários**: **ajuste** ao **seu contexto**; **código gerado, renomeações automáticas e dependências** distorcem a contagem.) **Exemplos:** **+5 −3 = 8 (XS)**; **+20 −10 = 30 (S)**; **+100 −60 = 160 (M)**; **+250 −150 = 400 (L)**; **+400 −300 = 700 (XL)**.
2. **Descrição** boa: **o quê**, **por quê** (contexto, **link do tíquete/ADR**), **como testar**, **riscos** e **decisões** de design; **capturas** de tela em UI;
3. **Autorrevisão** do diff **antes** de pedir revisão (**pega** o óbvio);
4. **Testes** junto da mudança; **refatoração separada** de **mudança de comportamento** (**dois chapéus**: cln-03): **commits** distintos;
5. **PRs em pilha** (*stacked*) para **grandes entregas**: **cada PR** completo e **revisável sozinho**; **feature flags** (C6) para **integrar cedo** o que **não está pronto**.

### Revisão: roteiro (depois da automação)
**Automatize o mecânico** (formatação, lint, tipos, testes, cobertura de código novo, regras de arquitetura: C5.6) **para que humanos** **olhem o que máquinas não veem**:
1. **Contexto e propósito:** **faz o que o tíquete pede?** **A abordagem é adequada?**
2. **Design:** **fronteiras e dependências** (**domínio** não importa **infra**), **abstrações** (**excesso**? **faltam**?), **acoplamento**, **testabilidade** (DIP/DI);
3. **Correção:** **casos de borda** (**vazio, nulo, limites**), **erros**, **concorrência**, **transações**, **idempotência** (retry);
4. **Testes:** **verificam comportamento** (**não só executam linhas**)? **Fronteiras** cobertas (**mutação**: tst-06)?
5. **Legibilidade:** **nomes**, **funções pequenas**, **comentários do porquê** (cln-01);
6. **Segurança e privacidade:** **entrada não confiável**, **autorização**, **segredos**, **dados pessoais** em logs (C4.4, C7);
7. **Desempenho evidente:** **N+1**, **laços sobre I/O**, **crescimento ilimitado** (cache: int-03);
8. **Operação:** **logs, métricas, alertas**, **migrações** reversíveis, **documentação/ADR**.
**Dica:** **revise os testes primeiro** (mostram a **intenção**); **olhe a estrutura** antes dos **detalhes**; **não revise** mais de **~400 linhas** por vez (**fadiga**: a **detecção de defeitos cai**).

### Comentários que funcionam
- **Explicite a intenção** com **prefixos** (**Conventional Comments**): §nit:§ (**detalhe opcional**), §sugestão:§, §pergunta:§, §bloqueante:§, §elogio:§: o **autor sabe o que é obrigatório**;
- **Explique o porquê** e **proponha** alternativa (**"isto executa uma consulta por item; que tal §WHERE id IN (...)§?"**);
- **Fale do código, não da pessoa** ("**esta função faz...**", **não** "**você fez...**");
- **Faça perguntas** quando **não entende** (**pode ser** falta de clareza **ou** defeito);
- **Elogie** o que está bom (**reforça** práticas);
- **Evite** "**gosto pessoal**" disfarçado de regra: **use o guia de estilo** do time; **desacordos**: **discutam** (**chamada curta**) **em vez de ping-pong** de comentários;
- **Como autor:** **assuma boa fé**, **responda cada comentário** (**corrigiu**, **discordou com razão**), **não leve para o lado pessoal**.

### Velocidade e fluxo
- **Tempo de resposta:** **a primeira resposta** em **até 1 dia útil** (Google: **"rápido, no máximo um dia"**); **PRs parados** **bloqueiam** (**lead time**: qual-03);
- **Revisão assíncrona** (PR) **x síncrona** (**pair/mob programming**, **revisão em tempo real**): **pair** **reduz revisão posterior**;
- **Quem revisa:** **pelo menos uma pessoa** que **entenda a área**; **donos de código** (CODEOWNERS) para **áreas críticas**; **rodízio** para **difundir**;
- **Aprovação:** **"aprovar com comentários"** (**pequenos ajustes**) **evita nova rodada**; **bloquear** só por **correção, segurança ou dívida séria**.

### Cultura e armadilhas
- **Segurança psicológica:** **revisão** é **sobre o código**; **erros** são **do sistema** (**blameless**: aula qual-05);
- **Armadilhas:** **PR gigante** ("**LGTM**" **sem ler**), **revisor único** e **gargalo**, **bikeshedding** (discussão **longa** sobre **detalhes triviais**), **comentários vagos** ("**não gostei**"), **revisão tardia** (**depois de semanas**), **revisão como gate burocrático** (**checkbox**), **revisor perfeccionista** (**bloqueia** por **gosto**);
- **Revisão de IA/assistida** (**ferramentas automáticas**): **útil** para **o mecânico e sugestões**, **não substitui** o **julgamento humano** sobre **design e contexto**; **trate sugestões como qualquer comentário**.

### Medindo a revisão (sem punir)
**Úteis:** **tempo até a primeira revisão**, **tempo de ciclo do PR**, **tamanho** (**mediana**), **número de rodadas**, **taxa de defeitos escapados** (**de PRs revisados**). **Evite:** **comentários por revisor** como **meta** (incentiva **ruído**), **comparar pessoas**. **Use** as métricas para **achar gargalos do processo** (**PRs grandes parados**).

### Checklist do laboratório (§revisao-checklist.md§)
**Antes de abrir:** **descrição**, **mudança pequena**, **testes**, **autoverificação**, **sem segredos**, **capturas**. **Ao revisar:** **objetivo**, **design**, **lógica de borda e erro**, **testes que verificam**, **nomes**, **segurança**, **desempenho**, **observabilidade/ADR**. **Comentários:** **prefixos** e **porquê**. **Decisão:** **aprove quando melhora a saúde do código**.`,
  concepts: [
    { term: 'Code review', def: 'Exame de uma mudança de código por outra pessoa antes de integrá-la, para melhorar a qualidade e compartilhar conhecimento.' },
    { term: 'Pull request', def: 'Proposta de mudança em um repositório, revisada e discutida antes de ser mesclada.' },
    { term: 'Conventional Comments', def: 'Convenção de prefixos (nit, sugestão, pergunta, bloqueante) que explicita a intenção de cada comentário de revisão.' },
    { term: 'PR em pilha', def: 'Sequência de PRs pequenos e dependentes que entregam uma mudança grande em partes revisáveis.' },
    { term: 'Bikeshedding', def: 'Discussão desproporcional sobre detalhes triviais em detrimento de questões importantes.' },
    { term: 'CODEOWNERS', def: 'Arquivo que define quem deve revisar mudanças em cada parte do repositório.' },
    { term: 'Feature flag', def: 'Chave que liga ou desliga uma funcionalidade em execução, permitindo integrar código antes de liberá-lo.' }
  ],
  examples: R`**Analogia:** a revisão de código é a **leitura de um texto por um colega antes da publicação**: **funciona** quando o texto é **curto** o bastante para ser **lido com atenção**, o autor **explica o contexto** e o colega **comenta com respeito**; um **livro inteiro de uma vez** vira "**parece bom**" sem leitura.

**Exemplo 1: tamanho.** +250 −150 = 400 linhas é L: considere dividir; +400 −300 = 700 é XL: divida antes de revisar.

**Exemplo 2: comentário bom.** "pergunta: isto executa uma consulta por item; que tal WHERE id IN (...)?": intenção, porquê e alternativa.

**Exemplo 3: automação.** Lint, tipos, testes e regras de arquitetura rodam antes: o humano olha design, correção e segurança.`,
  code: [
    { title: 'Classificar o tamanho de um PR (JavaScript; testado)', lang: 'js', code: R`export const LIMITES = [['XS', 10], ['S', 50], ['M', 200], ['L', 500]];
export function tamanhoDoPr(adicionadas, removidas) {
  const total = adicionadas + removidas;
  for (const [nome, max] of LIMITES) if (total <= max) return { total, tamanho: nome };
  return { total, tamanho: 'XL' };
}
export const recomendacao = (t) => ({ XS: 'revisão rápida', S: 'revisão rápida', M: 'revisão normal', L: 'considere dividir', XL: 'divida antes de revisar' })[t];

tamanhoDoPr(5, 3);       // { total: 8,   tamanho: 'XS' }
tamanhoDoPr(100, 60);    // { total: 160, tamanho: 'M' }
tamanhoDoPr(400, 300);   // { total: 700, tamanho: 'XL' }`, notes: [{ l: '1', t: 'Limites de heurística: ajuste ao contexto da equipe.' }, { l: '9', t: 'Resultados medidos no laboratório.' }] },
    { title: 'Descrição de PR e comentários com intenção (Markdown)', lang: 'md', code: R`## O quê
Adiciona o desconto "estudante" ao cálculo de pedidos.

## Por quê
Tíquete PEDIDOS-231; segue o ADR-0006 (descontos por registro de regras).

## Como testar
npm test -- dominio; teste de fronteira: pedido de R$ 0,01.

## Riscos
Só altera src/regras/descontos.mjs; sem migração.

---
nit: o nome "d" poderia ser "desconto".
pergunta: este laço executa uma consulta por item. Dá para usar WHERE id IN (...)?
bloqueante: a regra aceita percentual > 100%; falta o teste de limite.
elogio: ótimo o teste de fronteira para R$ 0,01.`, notes: [{ l: '1', t: 'Descrição com contexto, motivo, forma de testar e riscos.' }, { l: '15', t: 'Prefixos deixam claro o que é obrigatório e o que é opcional.' }] },
    { title: 'CODEOWNERS e revisão obrigatória (arquivo de configuração; exemplo conceitual)', lang: 'text', code: R`# .github/CODEOWNERS
*                       @org/time-backend
/src/pagamentos/        @org/time-pagamentos @org/seguranca
/docs/adr/              @org/arquitetura

# regra de branch (configuração do repositório): exigir 1 aprovação, status checks (lint, tipos, testes, dependency-cruiser),
# revisão de donos de código e resolução de conversas antes de mesclar`, notes: [{ l: '3', t: 'Áreas críticas têm donos específicos.' }, { l: '6', t: 'A automação roda antes; a revisão humana foca no que máquinas não veem.' }] }
  ],
  bestPractices: ['Faça PRs pequenos e focados, com descrição de contexto, motivo, forma de testar e riscos.', 'Automatize formatação, lint, tipos, testes e regras de arquitetura para que a revisão humana foque design, correção e segurança.', 'Comente com intenção (nit, sugestão, pergunta, bloqueante), explique o porquê e proponha alternativas.', 'Fale do código e não da pessoa e elogie o que está bom.', 'Responda rápido (primeira resposta em até um dia útil) e aprove quando a mudança melhora a saúde do código.', 'Separe refatoração de mudança de comportamento em commits distintos.', 'Meça tempo de ciclo e tamanho dos PRs para achar gargalos, sem comparar pessoas.'],
  mistakes: ['PRs gigantes aprovados sem leitura.', 'Revisar o que o lint já cobre.', 'Comentários vagos ou pessoais.', 'Bloquear por gosto pessoal.', 'Revisão tardia que trava o fluxo.', 'Usar o número de comentários como meta.'],
  market: R`**Revisar bem e ter PRs revisáveis** é **expectativa básica** em equipes de engenharia; **liderar a cultura de revisão** (tamanho, tempo, tom) é **responsabilidade de tech leads**.`,
  summary: R`A revisão de código melhora a saúde do código e difunde conhecimento. Faça PRs pequenos (laboratório: 8 linhas XS, 160 M, 400 L, 700 XL) com descrição de contexto; automatize o mecânico; revise design, correção, testes, legibilidade, segurança, desempenho e operação; comente com intenção e respeito e responda rápido. Meça tempo de ciclo e tamanho, não pessoas.`,
  refs: [REF.googleReview, REF.reviewStandard, REF.smallCls, REF.conventionalComments, REF.pullRequest],
  cards: [
    { q: 'Qual é o critério de aprovação do guia do Google?', a: 'Aprovar quando a mudança melhora a saúde geral do código, mesmo que não seja perfeita.' },
    { q: 'Por que PRs pequenos?', a: 'São revisados mais rápido e melhor, geram menos conflitos e integram mais cedo; no laboratório, 400 linhas é L e 700 é XL (dividir).' },
    { q: 'Para que servem os prefixos dos comentários?', a: 'Deixam explícita a intenção (nit, sugestão, pergunta, bloqueante), mostrando o que é obrigatório.' },
    { q: 'O que automatizar antes da revisão humana?', a: 'Formatação, lint, tipos, testes, cobertura de código novo e regras de arquitetura.' }
  ]
},
{
  id: 'qual-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['métricas de código', 'complexidade', 'churn', 'hotspots', 'bus factor', 'DORA', 'lead time'],
  title: 'Métricas de código e de entrega: complexidade, hotspots, fator de ônibus e as quatro métricas DORA',
  objectives: ['Distinguir métricas de código, de processo e de resultado e seus riscos de uso', 'Calcular complexidade (ciclomática e cognitiva) e entender seus limites', 'Encontrar hotspots combinando churn e complexidade com dados do Git', 'Estimar o fator de ônibus (concentração de autoria)', 'Calcular as quatro métricas DORA e interpretá-las com cuidado', 'Aplicar a lei de Goodhart e escolher métricas que orientam decisões'],
  intro: R`**Medir** ajuda a **enxergar** onde o **custo de mudar** está alto, **desde que** as métricas **orientem perguntas**, não **julguem pessoas**. Neste laboratório, **todos os dados são sintéticos e declarados**: em um **histórico Git de 43 commits**, o arquivo §src/pedido.js§ teve **25 commits × complexidade 301 = 7.525 pontos** e **um único autor (100%)**: o **hotspot** e **risco de fator de ônibus**; §config.js§ e §legado.js§ são complexos, mas **quase não mudam** (**50 e 13 pontos**); §util.js§ **muda muito** e é **trivial** (**15**). Nas métricas de entrega (DORA) sintéticas: **3 implantações/semana**, **lead time mediano de 6,5 h**, **16,7% de falha** e **restauração mediana de 3,8 h**.`,
  theory: R`### Três tipos de métrica
| Tipo | Exemplos | Pergunta | Risco |
|---|---|---|---|
| **Código** (qualidade interna) | complexidade, tamanho, duplicação, acoplamento, cobertura, mutação | **onde** o código é **difícil de mudar**? | virar **meta**; **ignorar contexto** |
| **Processo/entrega** | lead time, frequência de implantação, tempo de revisão, WIP | **quão rápido e estável** entregamos? | **pressão** e **gaming** |
| **Resultado** | defeitos escapados, incidentes, SLOs, satisfação, receita | **o que o usuário sente**? | **atraso** e **causalidade difícil** |
**Lei de Goodhart:** "**quando uma medida vira meta, deixa de ser boa medida**". **Use** métricas para **perguntas e tendências**; **evite** **rankings de pessoas** e **metas numéricas** isoladas.

### Complexidade
- **Ciclomática (McCabe):** **número de caminhos independentes** = **decisões + 1** (**§if§, §for§, §while§, §case§, §catch§, §&&§, §||§, §??§**): **estimativa** de **testes necessários**. **Limiares típicos** (**10** ou **15**) **são convenções**, **não leis**;
- **Cognitiva** (SonarSource): **mede o esforço de entender**: **penaliza aninhamento** (um §if§ dentro de outro **pesa mais**) e **ignora** o que **não atrapalha** a leitura (um §switch§ plano conta **1**); **melhor correlata** com **legibilidade**;
- **Outras:** **tamanho** (linhas de **função**/**arquivo**), **profundidade de aninhamento**, **número de parâmetros**, **acoplamento** (dependências de entrada e saída), **coesão**.
**Limites:** **uma função** com **muitos §case§ simples** pode ter **alta ciclomática** e **ser clara**; **baixa complexidade** **não garante** boas **abstrações**. **Aja** em **complexidade alta que muda muito** (hotspots).
**No laboratório:** **contagem simples de palavras-chave** (§1 + decisões§): §complexidade('if (a) { } else if (b && c) { }')§ = **4** (dois §if§ e um §&&§ + 1). **ESLint** (§complexity§) **é a ferramenta real** (C5.1: **14** na função legada).

### Churn, hotspots e fator de ônibus (a partir do Git)
**Ideia** (Adam Tornhill, *Your Code as a Crime Scene*): **problemas se concentram onde há muita mudança e muita complexidade**. **Procedimento:** (1) **churn** = **número de commits** (ou **linhas alteradas**) **por arquivo** em uma **janela** (§git log --numstat§); (2) **complexidade** do arquivo **atual**; (3) **pontuação = churn × complexidade**; (4) **autores por arquivo**.
**Medido (histórico SINTÉTICO de 43 commits, 3 autores):**
| Arquivo | Commits | Complexidade | **Pontuação** | Autores | Concentração |
|---|---|---|---|---|---|
| **§src/pedido.js§** | **25** | **301** | **7.525** | **1** | **100%** |
| §src/config.js§ | 2 | 25 | 50 | 2 | 50% |
| §src/util.js§ | 15 | 1 | 15 | 3 | 40% |
| §src/legado.js§ | 1 | 13 | 13 | 1 | 100% |
| §src/relatorio.js§ | 4 | 1 | 4 | 2 | 75% |
**Leituras:**
1. **§pedido.js§** é o **hotspot**: **muito alterado**, **muito complexo** e **de uma pessoa só**: **refatorar primeiro** (cln-03) **e distribuir conhecimento** (pares, revisão);
2. **§config.js§ e §legado.js§** são **complexos**, mas **estáveis**: **"feios, porém baratos"**: **adiar** (cln-05: **juros ≈ 0**, **payback "nunca"**);
3. **§util.js§** **muda sempre** (**15 commits, 3 autores**) e é **trivial**: **não é problema de código**; **pode indicar** **falta de abstração** (muitos helpers pequenos) **ou** apenas **um arquivo "gaveta"**;
4. **Priorize** pelo **produto churn × complexidade**, **não** por **um** fator.
**Fator de ônibus (*bus factor*)**: **quantas pessoas** podem **sair** antes que **o projeto pare**. **Aproximação:** **concentração de autoria** (**% de commits** da pessoa que **mais mexe**) por **arquivo/módulo**: **100% com 1 autor** = **risco**. **Ações:** **revisão obrigatória por outra pessoa**, **pair/mob**, **rodízio**, **documentação/ADR**, **testes** (**caracterização**). **Cuidado:** **autoria ≠ conhecimento** (**commits de formatação**, **renomeações automáticas** distorcem).
**Limites honestos:** **dados sintéticos**; **histórico real** tem **renomeações**, **merges**, **commits gigantes**, **bots**; **ferramentas** (CodeScene, §git-of-theseus§) **tratam** isso; **o laboratório não as executou**.

### Métricas de entrega: as quatro DORA
O programa **DORA** (*DevOps Research and Assessment*) identificou **quatro métricas** que **se correlacionam** com **desempenho organizacional**:
1. **Frequência de implantação:** **quantas vezes** por período se **implanta em produção**;
2. **Lead time para mudanças:** **do commit** (ou **da primeira alteração**) **até estar em produção**;
3. **Taxa de falha de mudanças:** **% de implantações** que **causam** **degradação** (**rollback, correção urgente, incidente**);
4. **Tempo para restaurar o serviço** (**MTTR**): **tempo** para **recuperar** **após** um **incidente**.
**Duas de velocidade (1 e 2) e duas de estabilidade (3 e 4):** **equipes de alto desempenho** **melhoram as duas** juntas: **velocidade e estabilidade não são uma troca** quando **há automação e mudanças pequenas**.
**Medido (dados SINTÉTICOS: 12 implantações em 28 dias e 2 incidentes):**
| Métrica | Valor |
|---|---|
| **Frequência** | **3,0** implantações por semana |
| **Lead time mediano** | **6,5 h** |
| **Taxa de falha** | **16,7%** (2 de 12) |
| **Tempo mediano de restauração** | **3,8 h** (1,5 h e 6 h) |
**Cuidados de interpretação:** (a) **use a mediana** (**caudas longas**: um **lead time de 50 h** não representa o **típico**); (b) **definições consistentes** (**o que é "falha"**? **quando começa o lead time**?); (c) **amostras pequenas** (**2 incidentes**) **não sustentam** conclusões; (d) **compare a equipe consigo mesma** **ao longo do tempo**, **não** entre equipes; (e) **métricas não dizem o porquê**: **investigue** (**PRs grandes**? **testes lentos**? **revisão** parada?); (f) **não vire meta** (**fragmentar** implantações **infla** a frequência).
**Como melhorar (itens do curso):** **PRs pequenos** e **revisão rápida** (qual-02), **CI rápido e confiável** (C5.5), **feature flags**, **testes automatizados**, **rollback fácil**, **observabilidade** e **runbooks** (qual-05).

### Outras métricas úteis
**Tempo de ciclo do PR**, **WIP** (trabalho em andamento), **defeitos escapados por mudança**, **retrabalho** (código reescrito em semanas), **idade de dependências**, **tempo de build/CI**, **flakiness** (tst-03), **SLOs** (qual-05). **Painéis** devem **mostrar tendência** e **contexto**, **não** "**nota**".

### Boas práticas
1. **Comece por perguntas** ("**onde perdemos tempo?**"), **depois** escolha **métricas**;
2. **Poucas métricas**, **definições escritas**, **dono** e **uso combinado**;
3. **Tendência > valor absoluto**; **mediana > média**;
4. **Nunca** use para **avaliar pessoas**;
5. **Cruze** métricas de **código**, **processo** e **resultado** (**complexa e muito alterada** + **muitos defeitos** = **prioridade**);
6. **Revise** as métricas **periodicamente** (**o que deixou de ser útil?**).`,
  concepts: [
    { term: 'Complexidade ciclomática', def: 'Número de caminhos independentes de um código, igual ao número de decisões mais um.' },
    { term: 'Complexidade cognitiva', def: 'Métrica que estima o esforço de entender o código, penalizando aninhamento e quebras de fluxo.' },
    { term: 'Churn', def: 'Quantidade de mudanças (commits ou linhas alteradas) em um arquivo em uma janela de tempo.' },
    { term: 'Hotspot', def: 'Parte do código com muito churn e alta complexidade, onde o custo de manutenção tende a ser maior.' },
    { term: 'Fator de ônibus', def: 'Número de pessoas cuja saída paralisaria o projeto por concentrarem conhecimento crítico.' },
    { term: 'Lead time para mudanças', def: 'Tempo entre o commit de uma mudança e sua implantação em produção.' },
    { term: 'MTTR', def: 'Tempo médio (ou mediano) para restaurar o serviço após um incidente.' }
  ],
  examples: R`**Analogia:** as métricas são o **painel do carro**: **velocímetro, combustível e temperatura** indicam **quando olhar o motor**; mas **ninguém dirige "para maximizar a temperatura"**, e **uma luz acesa** pede **investigação**, não **punição ao motorista**.

**Exemplo 1: hotspot.** pedido.js: 25 commits × complexidade 301 = 7.525, com 1 autor (100%): refatorar primeiro e espalhar conhecimento.

**Exemplo 2: feio, porém barato.** config.js e legado.js são complexos, mas mudam pouco (50 e 13 pontos): adiar.

**Exemplo 3: DORA.** 3 implantações/semana, lead time mediano 6,5 h, falha 16,7% e restauração mediana 3,8 h (dados sintéticos).`,
  code: [
    { title: 'Hotspots a partir do Git: churn × complexidade e concentração de autoria (JavaScript; dados sintéticos)', lang: 'js', code: R`import { execFileSync } from 'node:child_process';
const log = execFileSync('git', ['log', '--numstat', '--format=@@%an'], { cwd: repo, encoding: 'utf8' });

export function lerHistorico(texto) {
  const arquivos = {}; let autor = null;
  for (const linha of texto.split('\n')) {
    if (linha.startsWith('@@')) { autor = linha.slice(2); continue; }
    const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(linha);
    if (!m || !autor) continue;
    const f = (arquivos[m[3]] ||= { commits: 0, linhas: 0, autores: {} });
    f.commits++; f.linhas += (m[1] === '-' ? 0 : Number(m[1])) + (m[2] === '-' ? 0 : Number(m[2])); f.autores[autor] = (f.autores[autor] || 0) + 1;
  }
  return arquivos;
}
// pontuação = commits × complexidade; concentração = % dos commits da pessoa que mais mexe
// src/pedido.js 25 × 301 = 7525 | 1 autor | 100%   ← hotspot e risco de fator de ônibus`, notes: [{ l: '2', t: 'git log --numstat lista linhas adicionadas e removidas por arquivo em cada commit.' }, { l: '16', t: 'Resultado do histórico sintético do laboratório.' }] },
    { title: 'As quatro métricas DORA sobre implantações e incidentes (JavaScript; dados sintéticos)', lang: 'js', code: R`const mediana = (v) => { const o = [...v].sort((a, b) => a - b); const m = Math.floor(o.length / 2); return o.length ? (o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2) : null; };
const horas = (a, b) => (new Date(b) - new Date(a)) / 3600000;

export function calcularDora(implantacoes, incidentes, inicio, fim) {
  const dias = (new Date(fim) - new Date(inicio)) / 86400000;
  const leadTimes = implantacoes.map((d) => horas(d.commit, d.implantadoEm));
  const falhas = implantacoes.filter((d) => d.falhou).length;
  const restauracoes = incidentes.map((i) => horas(i.inicio, i.restaurado));
  return {
    frequenciaPorSemana: (implantacoes.length / dias) * 7,
    leadTimeMedianoHoras: mediana(leadTimes),
    taxaDeFalhaPct: implantacoes.length ? (falhas / implantacoes.length) * 100 : null,
    tempoMedianoDeRestauracaoHoras: mediana(restauracoes)
  };
}
// 12 implantações em 28 dias, 2 incidentes: 3,0/semana | lead time 6,5 h | falha 16,7% | restauração 3,8 h`, notes: [{ l: '1', t: 'Mediana em vez de média: caudas longas distorcem a média.' }, { l: '17', t: 'Amostra pequena e sintética: serve só para ilustrar o cálculo.' }] },
    { title: 'Complexidade por contagem de decisões (JavaScript; testado) e com o ESLint (shell)', lang: 'js', code: R`export const complexidade = (codigo) =>
  1 + ((codigo.match(/\b(?:if|for|while|case|catch)\b|&&|\|\||\?\?/g) || []).length);

complexidade('if (a) { } else if (b && c) { }');   // 4: dois if, um && e a base 1

// ESLint (ferramenta real): regra "complexity" por função
//   complexity: ['warn', 5]   ->   "Function 'proc' has a complexity of 14. Maximum allowed is 5"   (C5.1)`, notes: [{ l: '1', t: 'Aproximação por palavras-chave: boa para ensinar, não substitui o ESLint.' }, { l: '6', t: 'Valor medido na função legada do curso C5.1.' }] }
  ],
  bestPractices: ['Comece pelas perguntas e só então escolha poucas métricas, com definições escritas.', 'Priorize por churn × complexidade (hotspots), não por um fator só, e adie código feio e estável.', 'Use a concentração de autoria para encontrar riscos de fator de ônibus e distribua conhecimento.', 'Use mediana e tendência, compare a equipe consigo mesma e nunca avalie pessoas por métricas.', 'Cruze métricas de código, processo e resultado.', 'Trate métricas como sinais para investigar, sem transformá-las em metas.', 'Revise periodicamente as métricas usadas.'],
  mistakes: ['Transformar métricas em metas e rankings.', 'Usar a média em distribuições com cauda longa.', 'Tirar conclusões de amostras pequenas.', 'Perseguir complexidade em código estável e irrelevante.', 'Confundir autoria com conhecimento.', 'Comparar equipes com contextos diferentes.'],
  market: R`**Métricas DORA** e **análise de hotspots** são **linguagem comum** de **engenharia de plataforma** e **liderança técnica**; **explicar seus limites** (Goodhart, amostra, mediana) **é o que mostra maturidade**.`,
  summary: R`Métricas de código, de processo e de resultado servem para perguntas, não para julgar pessoas (lei de Goodhart). Complexidade ciclomática conta decisões; a cognitiva penaliza aninhamento. Hotspots combinam churn e complexidade com o histórico do Git: no histórico sintético de 43 commits, pedido.js teve 25 × 301 = 7.525 pontos e 100% de autoria de uma pessoa (hotspot e risco de fator de ônibus), enquanto arquivos complexos e estáveis valem pouco. As quatro métricas DORA (frequência, lead time, taxa de falha e tempo de restauração) calculadas sobre dados sintéticos deram 3/semana, 6,5 h, 16,7% e 3,8 h; use medianas, tendência e cuidado com amostras pequenas.`,
  refs: [REF.cyclomatic, REF.cognitive, REF.hotspots, REF.busFactor, REF.dora],
  cards: [
    { q: 'O que é um hotspot?', a: 'Parte do código com muito churn e alta complexidade; no laboratório sintético, pedido.js (25 commits × 301 = 7.525).' },
    { q: 'Por que arquivos complexos e estáveis podem esperar?', a: 'Eles quase não mudam: o custo de manutenção é baixo (juros próximos de zero), como config.js e legado.js (50 e 13 pontos).' },
    { q: 'Quais são as quatro métricas DORA?', a: 'Frequência de implantação, lead time para mudanças, taxa de falha de mudanças e tempo para restaurar o serviço.' },
    { q: 'Por que usar a mediana nas métricas de entrega?', a: 'Distribuições têm cauda longa; um lead time de 50 h distorce a média e não representa o típico.' }
  ]
}
];
