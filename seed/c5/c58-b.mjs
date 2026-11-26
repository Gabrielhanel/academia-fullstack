// C5.8 — Qualidade e manutenção de software. Aulas 4 e 5 (refatoração contínua e gestão da dívida técnica; SRE para desenvolvedores).
import { REF } from './c58-a.mjs';
const R = String.raw;

export const REF2 = {
  fowlerDebt: { title: 'Martin Fowler — TechnicalDebt', url: 'https://martinfowler.com/bliki/TechnicalDebt.html', kind: 'artigo' },
  opportunistic: { title: 'Martin Fowler — OpportunisticRefactoring', url: 'https://martinfowler.com/bliki/OpportunisticRefactoring.html', kind: 'artigo' },
  fowlerRefactoringCatalog: { title: 'Refactoring (Martin Fowler) — catálogo', url: 'https://refactoring.com/catalog/', kind: 'catálogo' },
  sloChapter: { title: 'Google SRE Book — Service Level Objectives', url: 'https://sre.google/sre-book/service-level-objectives/', kind: 'livro' },
  embracingRisk: { title: 'Google SRE Book — Embracing Risk', url: 'https://sre.google/sre-book/embracing-risk/', kind: 'livro' },
  alertingSlos: { title: 'Google SRE Workbook — Alerting on SLOs', url: 'https://sre.google/workbook/alerting-on-slos/', kind: 'livro' },
  postmortem: { title: 'Google SRE Book — Postmortem Culture: Learning from Failure', url: 'https://sre.google/sre-book/postmortem-culture/', kind: 'livro' },
  toil: { title: 'Google SRE Book — Eliminating Toil', url: 'https://sre.google/sre-book/eliminating-toil/', kind: 'livro' }
};

export const lessonsB = [
{
  id: 'qual-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['refatoração contínua', 'dívida técnica', 'hotspots', 'regra do escoteiro', 'priorização', 'capacidade', 'Strangler'],
  title: 'Refatoração contínua e gestão da dívida técnica: pagar com método, sem parar o produto',
  objectives: ['Integrar a refatoração ao fluxo diário (oportunista, preparatória, de revisão) em vez de projetos de reforma', 'Priorizar dívida combinando juros e payback (C5.1) com hotspots (churn × complexidade)', 'Escolher estratégias de pagamento (escoteiro, capacidade fixa, Strangler, atualizações contínuas)', 'Registrar, visibilizar e acompanhar a dívida com tíquetes, ADRs e painéis', 'Prevenir novas dívidas com definição de pronto, portões automáticos e revisão', 'Comunicar o plano de dívida a produto e liderança com risco, prazo e retorno'],
  intro: R`Na aula **cln-03** você refatorou **com rede de testes** e na **cln-05** **mediu juros e payback** da dívida técnica (**12 h/mês de juros e 2 meses de payback** para o módulo de pedidos, com dados hipotéticos). Aqui o foco muda de **uma refatoração** para **um sistema de manutenção contínua**: **o que fazer toda semana**, **como escolher** o que pagar (**os hotspots** da aula anterior: **pedido.js 25 × 301 = 7.525 pontos**, dados sintéticos) e **como proteger a capacidade** do time **sem pedir "um semestre para reescrever"**.`,
  theory: R`### Refatoração contínua: pequena, frequente, ligada ao trabalho
**Projetos de refatoração** (**"parar tudo por 3 meses"**) **raramente** terminam bem (**viram reescrita**, **perdem prioridade**, **entregam pouco**). **Refatoração contínua** integra a **melhoria** ao **fluxo normal**:
- **Oportunista** (Fowler, **regra do escoteiro**): **deixe o código um pouco melhor** do que encontrou **ao passar por ele** para **entender** ou **alterar**: **renomeie**, **extraia função**, **remova código morto**;
- **Preparatória** ("**faça a mudança fácil e depois faça a mudança fácil**"): **antes** de adicionar uma regra, **reestruture** o ponto para que **ela caiba em um lugar só** (cln-02: **OCP**);
- **De compreensão**: **ao ler** código **confuso**, **registre** o que entendeu **no próprio código** (nomes, funções);
- **Na revisão** (qual-02): **apontar smells** e **propor passos** (**cln-04**);
- **Planejada e pequena**: itens do **backlog de dívida** **com fatia de 1 a 3 dias**, **entregues junto** a **features** da **mesma área** (**onde você vai mexer**).
**Pré-requisitos** (cln-03): **testes** (ou **testes de caracterização**), **passos pequenos**, **commits separados** (**refatoração ≠ comportamento**), **adaptador** para migrar chamadores.
**Onde NÃO refatorar agora:** **código estável** que **ninguém altera** (**juros ≈ 0**: **"feio, porém barato"**: **config.js e legado.js** do laboratório, **50 e 13 pontos**), **código a ser descartado**, **área sem testes e sem como testar** (**primeiro** **caracterize**).

### Priorizar: onde o dinheiro rende
**Combine** três sinais (**não** só o mais feio):
1. **Hotspots** (qual-03): **churn × complexidade** (**onde mexemos muito em código difícil**): **pedido.js 7.525** **>>** **util.js 15**;
2. **Juros e payback** (cln-05): **horas/mês perdidas** e **meses para pagar** (**pedidos legado: 12 h/mês, payback 2 meses**; **módulo estável feio: nunca**);
3. **Risco**: **segurança**, **perda de dados**, **fim de suporte** de dependência, **fator de ônibus** (**1 autor, 100%**), **incidentes** ligados.
**Matriz prática:** **alto churn + alta complexidade + risco** = **faça já** (**ou na próxima mudança**); **alto churn + baixa complexidade** = **provável falta de abstração** (**investigue**: §util.js§); **baixo churn + alta complexidade** = **adie** (**registre**); **baixo churn + baixa complexidade** = **ignore**.
**Dados:** **meça** com o **Git** (§hotspots.mjs§) e **com o quadro de tarefas** (**tempo extra**, **defeitos**, **retrabalho**); **recalcule** a cada **trimestre**.

### Formas de pagar
| Estratégia | Quando | Como |
|---|---|---|
| **Escoteiro / oportunista** | **pequena** e **na área** em que se trabalha | **dentro da própria PR** (**commit separado**) |
| **Capacidade fixa** | **dívida acumulada** com **itens independentes** | **10 a 20%** de cada ciclo (**valores usuais de prática**, **não regra**: **ajuste**) |
| **Strangler Fig** | **dívida estrutural** (módulo grande, tecnologia antiga) | **novo código cresce ao redor** do antigo; **adaptador** e **roteamento** gradual (cln-03) |
| **Atualização contínua de dependências** | **versões** e **fim de suporte** | **Dependabot/Renovate**, **PRs pequenos**, **CI verde** |
| **Reserva para incidentes/postmortems** | **dívida que causou falha** | **ações** de **postmortem** com **dono e prazo** (qual-05) |
| **Reescrita** | **raro**: **código pequeno, bem especificado e testado** ou **tecnologia inviável** | **avalie** Strangler **primeiro** |
**Evite:** **"sprint de refatoração"** **sem resultado mensurável**, **refatorar por estética**, **mudar a arquitetura inteira "enquanto passa"**.

### Registrar e visibilizar
- **Backlog de dívida** com **modelo** (**título, impacto, esforço, juros observados, gatilho**): **modelo do cln-05**;
- **Marcadores no código** (§// DÍVIDA(PEDIDOS-212): ...§) **com tíquete** e **gatilho** (**TODO anônimo vira lixo**);
- **ADR** com **o porquê** do atalho e **quando revisar** (C5.3);
- **Painel** simples (**itens**, **juros estimados**, **idade**, **quantos pagos** no trimestre) **revisado** **a cada ciclo**;
- **Linguagem comum** com **produto**: **"horas por mês"**, **risco**, **payback**.

### Prevenir novas dívidas
1. **Definição de pronto** com **testes**, **revisão**, **documentação mínima**, **observabilidade** e **portões** (lint, tipos, **regras de arquitetura**, **cobertura de código novo**: C5.6);
2. **Revisão** (qual-02) **com foco em design**;
3. **Decisões registradas** (**ADR**) e **revisadas** quando **o contexto muda**;
4. **Planejamento realista**: **pressão constante** com **orçamento zero** para qualidade **garante** acúmulo;
5. **Dívida deliberada e prudente** (cln-05): **só com plano e dono**;
6. **Aprender com incidentes** (qual-05): **ações corretivas** **viram itens** do backlog.

### Dívida além do código
**Testes** (**lentos**, **intermitentes**: tst-03), **documentação** (**desatualizada**), **infraestrutura** (**ambientes manuais**), **dados** (esquemas legados), **conhecimento** (**fator de ônibus**), **dependências** (**versões antigas**, **vulnerabilidades**): **o mesmo processo** (**registrar, priorizar, pagar, prevenir**) **vale**.

### Exemplo de plano trimestral (com dados sintéticos do curso)
1. **Hotspot:** **§pedido.js§** (**7.525**, **1 autor**): **caracterizar** (testes), **extrair** as regras (**tabela/estratégias**), **adaptador** na assinatura antiga; **pair** com **outra pessoa** (**reduz o fator de ônibus**); **dentro** das **features** de **pedidos** do trimestre;
2. **Capacidade fixa de 15%** para **itens independentes** (**remover duplicações**, **atualizar dependências**);
3. **Adiar:** **§config.js§**, **§legado.js§** (registrados, **sem esforço**);
4. **Métricas de acompanhamento** (**tendência**): **lead time do módulo**, **defeitos por mudança**, **complexidade do hotspot**, **concentração de autoria**;
5. **Comunicação:** "**3 dias hoje**, **payback em 2 meses**" (**modelo cln-05**) **e** "**o risco de depender de uma pessoa**".
**Ressalva:** **números sintéticos** (**cln-05** e **qual-03**): **calibre com os seus dados**.

### Armadilhas
- **Pagar o que é mais feio** (**não** o que **mais custa**);
- **Refatorar sem testes** (cln-03);
- **Misturar** **refatoração** com **mudança de comportamento** na **mesma PR**;
- **Transformar dívida em desculpa** para **qualquer código ruim**;
- **Contar itens de dívida** como **meta** (**Goodhart**);
- **Esquecer o lado humano**: **conhecimento concentrado**, **onboarding**, **motivação**.`,
  concepts: [
    { term: 'Refatoração contínua', def: 'Melhoria estrutural em passos pequenos e frequentes, integrada ao trabalho diário em vez de projetos separados.' },
    { term: 'Refatoração preparatória', def: 'Reestruturar o código antes de uma mudança para que ela caiba de forma simples.' },
    { term: 'Regra do escoteiro', def: 'Deixar o código um pouco melhor do que foi encontrado ao passar por ele.' },
    { term: 'Capacidade fixa', def: 'Parcela reservada de cada ciclo de trabalho para pagar dívida técnica.' },
    { term: 'Strangler Fig', def: 'Estratégia em que o novo sistema cresce ao redor do antigo e o substitui gradualmente.' },
    { term: 'Gatilho de dívida', def: 'Condição ou mudança futura que traz a dívida de volta à atenção e justifica pagá-la.' },
    { term: 'Código feio e estável', def: 'Código ruim que quase não muda e, portanto, tem juros baixos e prioridade baixa.' }
  ],
  examples: R`**Analogia:** a manutenção contínua é **cuidar de um jardim**: **podar um pouco toda semana** (escoteiro) **evita** o **mutirão de um mês**; **regar primeiro as plantas que mais crescem** (hotspots), **e deixar em paz o canteiro** que **ninguém usa**; e **guardar um dia por mês** para **replantar** o que **não dá mais** (Strangler).

**Exemplo 1: prioridade.** pedido.js (7.525 pontos, 1 autor) entra no trimestre; config.js e legado.js (50 e 13) ficam registrados.

**Exemplo 2: capacidade fixa.** 15% do ciclo para duplicações e dependências, sem parar as features.

**Exemplo 3: comunicação.** "3 dias hoje, payback em 2 meses" e "reduz a dependência de uma única pessoa".`,
  code: [
    { title: 'Combinar hotspot e juros para priorizar (JavaScript; dados sintéticos; funções dos laboratórios C5.1 e C5.8)', lang: 'js', code: R`// pontuação de hotspot (qual-03) = commits × complexidade;  juros e payback (cln-05)
const itens = [
  { id: 'pedido.js',  commits: 25, complexidade: 301, autores: 1, esforcoDias: 3, minutosExtraPorMudanca: 90 },
  { id: 'config.js',  commits: 2,  complexidade: 25,  autores: 2, esforcoDias: 2, minutosExtraPorMudanca: 60 },
  { id: 'legado.js',  commits: 1,  complexidade: 13,  autores: 1, esforcoDias: 5, minutosExtraPorMudanca: 120 }
];
const prioridade = (i) => {
  const mudancasPorMes = i.commits / 3;                                   // janela de 3 meses (hipótese)
  const jurosHorasMes = (mudancasPorMes * i.minutosExtraPorMudanca) / 60;
  const paybackMeses = jurosHorasMes === 0 ? null : (i.esforcoDias * 8) / jurosHorasMes;
  return { id: i.id, hotspot: i.commits * i.complexidade, jurosHorasMes: +jurosHorasMes.toFixed(1), paybackMeses: paybackMeses && +paybackMeses.toFixed(1), riscoOnibus: i.autores === 1 };
};
itens.map(prioridade).sort((a, b) => b.hotspot - a.hotspot);
// pedido.js: hotspot 7525, ~12,5 h/mês, payback ~1,9 meses, risco de ônibus | config.js: 50 | legado.js: 13`, notes: [{ l: '8', t: 'Janela e minutos extras são hipóteses; calibre com dados reais.' }, { l: '14', t: 'O hotspot lidera, os juros confirmam e o risco de fator de ônibus reforça.' }] },
    { title: 'Marcador de dívida com tíquete e gatilho, e PR de refatoração separada (JavaScript e Markdown)', lang: 'js', code: R`// DÍVIDA(PEDIDOS-212): calcularFrete usa tabela fixa por UF; ao integrar a transportadora X (gatilho: PEDIDOS-198),
// trocar por consulta à API. Juros observados: ~90 min por mudança de regra. ADR-0007 explica a escolha.
export function calcularFrete(valor, uf) { /* ... */ }

/*
 Fluxo de commits em uma PR de feature na área de pedidos:
   1. "refatora: extrai regras de desconto para tabela"      (comportamento inalterado, testes verdes)
   2. "feat: desconto estudante"                              (testes novos)
   3. "docs: ADR-0008 sobre o registro de regras"
*/`, notes: [{ l: '1', t: 'O marcador tem tíquete, gatilho, juros e ligação com o ADR.' }, { l: '8', t: 'Refatoração e mudança de comportamento ficam em commits separados.' }] },
    { title: 'Definição de pronto com portões que previnem dívida (Markdown)', lang: 'md', code: R`## Definição de pronto (trecho)
- [ ] Testes novos/alterados (incluindo fronteiras) e CI verde
- [ ] Lint, tipos e regras de arquitetura sem violações novas (baseline aceito)
- [ ] Cobertura do código novo ≥ 80% (alarme) e mutação nos módulos críticos
- [ ] Revisão aprovada; PR de tamanho S/M, ou dividida
- [ ] ADR se houve decisão significativa; marcador DÍVIDA(tíquete) se houve atalho deliberado
- [ ] Logs/métricas/alertas atualizados quando aplicável`, notes: [{ l: '4', t: 'Cobertura como alarme para código novo, não como meta global.' }, { l: '6', t: 'Atalhos deliberados exigem tíquete: nada de TODO anônimo.' }] }
  ],
  bestPractices: ['Integre a refatoração ao trabalho diário (escoteiro, preparatória, na revisão) e mantenha commits separados.', 'Priorize combinando hotspot, juros/payback e risco (inclusive fator de ônibus) e adie código feio e estável.', 'Reserve capacidade fixa e use Strangler para dívida estrutural e atualizações contínuas de dependências.', 'Registre cada dívida com tíquete, gatilho e juros e mantenha um painel revisado a cada ciclo.', 'Previna com definição de pronto, portões automáticos, revisão e ADRs.', 'Comunique em risco, prazo e retorno (horas por mês, payback).', 'Recalcule as prioridades periodicamente com dados reais.'],
  mistakes: ['Projetos de refatoração gigantes e sem entrega.', 'Pagar o mais feio em vez do mais caro.', 'Refatorar sem testes.', 'Misturar refatoração e mudança de comportamento na mesma PR.', 'Contar itens de dívida como meta.', 'Ignorar o fator de ônibus e o conhecimento concentrado.'],
  market: R`**Gerir manutenção e dívida** (priorizar, negociar capacidade, comunicar retorno) **separa** **tech leads e staff engineers**; **entrevistas** perguntam **"como você convenceu o produto a investir em qualidade?"**.`,
  summary: R`A refatoração contínua integra a melhoria ao fluxo (escoteiro, preparatória, na revisão), com testes e commits separados. Priorize combinando hotspots (churn × complexidade), juros e payback e risco (como o fator de ônibus): no histórico sintético, pedido.js (7.525 pontos, 1 autor) entra no plano e config.js e legado.js (50 e 13) esperam. Pague com capacidade fixa, Strangler e atualizações contínuas; registre com tíquete, gatilho e ADR; previna com definição de pronto e portões; comunique em horas por mês e payback. Os números são sintéticos ou hipotéticos.`,
  refs: [REF2.fowlerDebt, REF2.opportunistic, REF2.fowlerRefactoringCatalog, REF.hotspots, REF.googleReview],
  cards: [
    { q: 'Por que evitar "projetos de refatoração" longos?', a: 'Raramente terminam bem: viram reescrita, perdem prioridade e entregam pouco; prefira refatoração contínua ligada ao trabalho.' },
    { q: 'Como priorizar a dívida?', a: 'Combinando hotspots (churn × complexidade), juros e payback e risco (segurança, fim de suporte, fator de ônibus); código feio e estável espera.' },
    { q: 'O que é refatoração preparatória?', a: 'Reestruturar o ponto de mudança antes de adicionar a funcionalidade, para que ela caiba de forma simples.' },
    { q: 'O que um marcador de dívida deve conter?', a: 'Tíquete, gatilho de revisão, juros observados e a ligação com o ADR da decisão.' }
  ]
},
{
  id: 'qual-05', moduleId: 'm3', order: 5, minutes: 85, tags: ['SRE', 'SLI', 'SLO', 'orçamento de erro', 'burn rate', 'postmortem', 'toil', 'resposta a incidentes'],
  title: 'Engenharia de confiabilidade (SRE) para desenvolvedores: SLIs, SLOs, orçamento de erro, alertas por taxa de queima e postmortems',
  objectives: ['Definir SLI, SLO e SLA e escolher indicadores centrados na experiência do usuário', 'Calcular o orçamento de erro de um SLO e usá-lo para decidir entre velocidade e estabilidade', 'Configurar alertas por taxa de queima em múltiplas janelas e calcular o consumo do orçamento', 'Conduzir resposta a incidentes e escrever um postmortem sem culpados com ações rastreáveis', 'Reconhecer e reduzir toil e planejar capacidade com os dados de carga e estresse', 'Relacionar confiabilidade a observabilidade, testes, rollouts seguros e dívida técnica'],
  intro: R`**SRE** (*Site Reliability Engineering*) aplica **engenharia de software** à **operação**: **define metas de confiabilidade** (**SLOs**), **mede** (**SLIs**), **usa o orçamento de erro** para **equilibrar** **inovação e estabilidade** e **aprende com falhas** (**postmortems sem culpados**). Para quem **desenvolve**, **o SLO define** **quanto risco** se pode correr **a cada deploy**. **Cálculos do laboratório:** **SLO 99,9% em 30 dias = 43,2 min de orçamento** (**99% = 432 min**; **99,99% = 4,32 min**); **queima de 14,4x por 1 h consome 2%** e **6x por 6 h consome 5%** do orçamento; e **1 erro em 1.000 requisições** com SLO de 99,9% **equivale a queima 1**.`,
  theory: R`### SLI, SLO e SLA
- **SLI** (*indicador de nível de serviço*): **medida** de **um aspecto** da **experiência**: **proporção de requisições bem-sucedidas** (**disponibilidade**), **proporção rápidas** (**latência: p95 < 300 ms**), **frescor dos dados**, **correção**. **Boa forma:** **eventos bons ÷ eventos válidos** (**0% a 100%**);
- **SLO** (*objetivo*): **meta** interna **para o SLI** em **uma janela** ("**99,9% das requisições de checkout com status < 500 em 30 dias**"). **Defina** a partir do **que o usuário percebe**, **não** do **que o sistema consegue** (**100% não é meta**: **custa infinito** e **impede mudar**);
- **SLA** (*acordo*): **contrato** com **consequências** (créditos, multas); **mais frouxo** que o SLO **interno**.
**Escolha de SLIs:** **centrados no usuário** (**no limite do sistema**: **balanceador, cliente**), **poucos por jornada crítica**, **medidos onde dói** (**latência p95/p99**, **não média**: tav-02).

### Orçamento de erro
**Orçamento** = **1 − SLO**: **quanto de falha o serviço pode ter na janela** **sem violar o SLO**. **Medido no laboratório** (§slo.mjs§, janela de **30 dias**):
| SLO | Orçamento de erro | Indisponibilidade total tolerada em 30 dias |
|---|---|---|
| **99%** | 1% | **432 min** (7,2 h) |
| **99,9%** | 0,1% | **43,2 min** |
| **99,99%** | 0,01% | **4,32 min** |
**Uso do orçamento:** **sobrando** → **pode correr risco** (**implantar mais**, **experimentar**, **migrar**); **esgotado** → **congela mudanças arriscadas** e **prioriza confiabilidade** (**dívida**, **testes**, **rollback**). **Política** **acordada** por **produto e engenharia** **antes** do problema: **transforma a discussão** "**velocidade x estabilidade**" em **dado**.
**Cada "9" a mais** **custa muito**: **99,99%** exige **redundância**, **automação de recuperação** e **testes** (**C6, C8**): **escolha o suficiente** para **o negócio** (**aula qual-01**: **trade-offs**).

### Taxa de queima (*burn rate*) e alertas
**Taxa de queima** = **taxa de erro observada ÷ (1 − SLO)**: **1** consome **exatamente** o orçamento **no ritmo** da janela; **14,4** consome **14,4 vezes mais rápido**. **Medido:** **1 erro em 1.000** com SLO de **99,9%** → **queima 1**; **144 erros em 10.000** → **14,4**.
**Consumo do orçamento** = **queima × horas ÷ (dias × 24)**: **14,4x durante 1 h consome 2%** do orçamento de 30 dias; **6x durante 6 h consome 5%** (**valores do Workbook**: **alerta rápido** e **lento**).
**Alertas de múltiplas janelas** (Google SRE Workbook): **disparar** quando **duas janelas** (**longa** e **curta**) **excedem** o limite — **a longa** (**1 h**) **mostra relevância**, **a curta** (**5 min**) **confirma que ainda ocorre** (**evita alertar depois de resolvido**):
| Alerta | Janelas | Queima | Consumo | Ação |
|---|---|---|---|---|
| **Rápido** | **1 h** e **5 min** | **≥ 14,4** | **2% em 1 h** | **pagina** (acorda) |
| **Lento** | **6 h** e **30 min** | **≥ 6** | **5% em 6 h** | **chamado urgente** |
**Medido** (§avaliarAlertas§): **150 erros/10.000** (1 h) **e** **20/1.000** (5 min) → **"pagina agora"**; **70/10.000** (6 h) **e** **7/1.000** (30 min) → **"abre chamado urgente"**; **1 h alta**, **mas 5 min baixa** (**já resolveu**) → **"ok"**. **Por quê:** **alertas por causa** (CPU alta) **geram ruído**; **por sintoma e orçamento** **acordam só quando importa**.
**Armadilha de implementação (achada no laboratório):** em **ponto flutuante**, **§1 − 0.999§** vale **§0.0010000000000000009§** e a **taxa de queima** de **1 erro em 1.000** saía **§0,9999999999999991§**: **arredonde** (**6 casas**) **ou** use **inteiros** (**partes por milhão**) **antes de comparar limites** (**mesmo cuidado** de **dinheiro**: cln-01, **float x Decimal**).

### Resposta a incidentes
1. **Detectar** (alerta por SLO/sintoma);
2. **Triar e declarar** (**gravidade**, **comandante do incidente**, **canal único**, **papéis**: **comunicação**, **operações**);
3. **Mitigar primeiro** (**rollback**, **desligar feature flag**, **escalar**, **degradar** com **graça**): **restaurar o serviço antes de achar a causa raiz**;
4. **Comunicar** (**interno** e **externo**: **página de status**), **com horários**;
5. **Resolver e verificar** (**SLI voltou?**);
6. **Aprender** (**postmortem**).
**Preparação:** **runbooks** (**passo a passo**), **dashboards** (golden signals: **latência, tráfego, erros, saturação**: C4.6), **rollback** **fácil e ensaiado**, **on-call** **sustentável** (**rodízio**, **limites de carga**), **simulações** (*game days*).

### Postmortem sem culpados (*blameless*)
**Objetivo:** **aprender e melhorar o sistema**, **não punir pessoas**: **pessoas agem com a informação e as ferramentas que tinham**; **falhas** indicam **lacunas do sistema** (**alertas ausentes**, **deploy sem canário**, **runbook desatualizado**). **Modelo do laboratório** (§postmortem-modelo.md§): **resumo e impacto** (**inclua** o **consumo do orçamento**), **linha do tempo (UTC)**, **causas contribuintes**, **o que deu certo / errado / sorte**, **ações** (**dono, prazo e tipo: prevenir, detectar, mitigar**) e **lições**. **Boas práticas:** **escreva em até alguns dias**, **revisão** por **outras pessoas**, **publique** (**aprendizado compartilhado**), **acompanhe** as **ações** **até o fim** (**viram itens** do **backlog de dívida**: qual-04), **evite** "**erro humano**" **como causa** (**pergunte** "**por que o sistema permitiu?**").

### Toil
**Toil** = **trabalho operacional manual, repetitivo, automatizável, sem valor duradouro**, que **cresce** com o **serviço**. **Meta de SRE:** **limitar toil** (**Google cita ≤ 50% do tempo**) e **automatizar** (**scripts**, **autoscaling**, **deploy automático**, **autocorreção**). **Sinais:** **tarefas manuais por plantão**, **"rodar script na mão"**, **reiniciar serviço** **semanalmente**. **Relação com dívida:** **toil é dívida operacional**.

### Capacidade e confiabilidade
**Dados de carga e estresse** (C5.6) **alimentam** o **planejamento**: **capacidade por instância** (~**41 req/s** em um endpoint), **meta de utilização** (~**60%**), **backpressure/rate limit** (**degradar com graça**), **autoscaling** (C6), **redundância**. **Teste de recuperação** e **caos** **verificam** **tolerância a falhas**.

### Rollouts seguros
**Feature flags**, **canário** (**1% → 10% → 100%** **com SLI observado** e **rollback automático**), **blue/green**, **migrações compatíveis (expandir e contrair)**, **janelas** e **congelamentos** **guiados pelo orçamento**. **Mudanças pequenas** (qual-02, DORA: **frequência alta e falha baixa**).

### Desenvolvedores e SRE: responsabilidades
**Quem constrói, opera** (*you build it, you run it*, **com apoio**): **definir SLIs/SLOs** do **próprio serviço**, **instrumentar** (C4.6), **escrever runbooks**, **participar do plantão e dos postmortems**, **pagar a dívida** que **causa incidentes**. **SRE/plataforma** **fornece** **ferramentas**, **padrões** e **consultoria**.

### Limites desta aula
**Executados:** **cálculos** de orçamento, **queima** e **alertas** (**5 testes**), **DORA sintético**. **Não executados:** **Prometheus/Alertmanager** com **regras reais**, **plataformas de incidentes** (PagerDuty, Opsgenie), **canário real**, **caos**, **medições em equipes reais**.`,
  concepts: [
    { term: 'SLI', def: 'Indicador de nível de serviço: medida de um aspecto da experiência do usuário, em geral a proporção de eventos bons.' },
    { term: 'SLO', def: 'Objetivo de nível de serviço: meta para um SLI em uma janela de tempo.' },
    { term: 'SLA', def: 'Acordo de nível de serviço: contrato com consequências, normalmente mais frouxo que o SLO interno.' },
    { term: 'Orçamento de erro', def: 'Quantidade de falha tolerada na janela sem violar o SLO (1 − SLO).' },
    { term: 'Taxa de queima (burn rate)', def: 'Razão entre a taxa de erro observada e a permitida pelo SLO; 1 consome o orçamento exatamente no ritmo da janela.' },
    { term: 'Postmortem sem culpados', def: 'Análise de um incidente focada nas falhas do sistema e do processo, com ações rastreáveis, sem punir pessoas.' },
    { term: 'Toil', def: 'Trabalho operacional manual, repetitivo e automatizável, sem valor duradouro.' }
  ],
  examples: R`**Analogia:** o **SLO** é a **meta de pontualidade de um trem** (99,9% das viagens no horário); o **orçamento de erro** é o **número de atrasos tolerados no mês**; a **taxa de queima** é a **velocidade com que você os gasta**: se **gastou 2% do mês em 1 hora**, **algo grave está acontecendo agora**; e o **postmortem** é a **reunião** que pergunta **"por que o sistema permitiu o atraso?"**, não "**quem atrasou?**".

**Exemplo 1: orçamento.** SLO 99,9% em 30 dias = 43,2 min; 99% = 432 min; 99,99% = 4,32 min.

**Exemplo 2: alerta.** 14,4x por 1 h consome 2% do orçamento: pagina; 6x por 6 h consome 5%: abre chamado urgente.

**Exemplo 3: float.** 1 − 0.999 = 0.0010000000000000009: a taxa de queima de 1 erro em 1.000 saía 0,9999999999999991 até arredondar.`,
  code: [
    { title: 'Orçamento de erro, taxa de queima e alertas de múltiplas janelas (JavaScript; 5 testes passam)', lang: 'js', code: R`export const orcamentoEmMinutos = (slo, dias) => Math.round(dias * 24 * 60 * (1 - slo) * 100) / 100;

// arredonda a 6 casas: 1 - 0.999 em ponto flutuante vale 0.0010000000000000009 e a divisão sairia 0.9999999999999991
export const taxaDeQueima = (erros, total, slo) => (total === 0 ? 0 : Math.round(((erros / total) / (1 - slo)) * 1e6) / 1e6);

// Google SRE Workbook: 14,4x em 1 h (e 5 min) = 2% do orçamento de 30 dias; 6x em 6 h (e 30 min) = 5%
export function avaliarAlertas(janelas, slo) {
  const q = (j) => taxaDeQueima(j.erros, j.total, slo);
  const rapido = q(janelas.h1) >= 14.4 && q(janelas.m5) >= 14.4;
  const lento = q(janelas.h6) >= 6 && q(janelas.m30) >= 6;
  return rapido ? 'pagina agora' : lento ? 'abre chamado urgente' : 'ok';
}
export const orcamentoConsumidoPct = (taxa, horasNaJanela, diasDoSlo) => Math.round(((taxa * horasNaJanela) / (diasDoSlo * 24)) * 10000) / 100;

orcamentoEmMinutos(0.999, 30);        // 43.2
orcamentoConsumidoPct(14.4, 1, 30);   // 2
orcamentoConsumidoPct(6, 6, 30);      // 5`, notes: [{ l: '4', t: 'Cuidado com ponto flutuante ao comparar limites de queima.' }, { l: '8', t: 'Duas janelas: a longa mostra relevância e a curta confirma que ainda ocorre.' }] },
    { title: 'Regras de alerta por taxa de queima no Prometheus (YAML; trecho conceitual, não executado nesta aula)', lang: 'yaml', code: R`groups:
  - name: slo-checkout
    rules:
      - alert: CheckoutQueimaRapida
        expr: |
          (sum(rate(http_requests_total{job="checkout",code=~"5.."}[1h])) / sum(rate(http_requests_total{job="checkout"}[1h]))) > (14.4 * 0.001)
          and
          (sum(rate(http_requests_total{job="checkout",code=~"5.."}[5m])) / sum(rate(http_requests_total{job="checkout"}[5m]))) > (14.4 * 0.001)
        labels: { severity: page }
        annotations: { summary: "Queima 14,4x do orçamento do SLO 99,9% (2% em 1 h)" }`, notes: [{ l: '6', t: '0,001 é o orçamento de um SLO de 99,9%.' }, { l: '9', t: 'Severidade page acorda a pessoa de plantão.' }] },
    { title: 'Linha do tempo de incidente e ações de um postmortem sem culpados (Markdown; modelo)', lang: 'md', code: R`## Linha do tempo (UTC)
- 14:02 alerta CheckoutQueimaRapida disparou (queima 16x)
- 14:06 incidente declarado (gravidade 2); comandante: Bia
- 14:11 deploy 4812 identificado como suspeito; feature flag "novo-calculo" desligada
- 14:18 taxa de erro voltou ao normal; 14:35 incidente encerrado (consumo do orçamento: ~3%)

## Causas contribuintes
- A regra nova não tinha teste de fronteira (preço 0,00): sistema permitiu a promoção
- O canário estava desligado para essa rota por ser "pequena"

## Ações
| Ação | Tipo | Dono | Prazo |
|---|---|---|---|
| Teste de fronteira + mutação no módulo de preços | prevenir | Ana | 2 semanas |
| Canário obrigatório em rotas de checkout | mitigar | Caio | 1 mês |
| Alerta de latência além de erros | detectar | Bia | 2 semanas |`, notes: [{ l: '1', t: 'Horários em UTC e consumo do orçamento registrados.' }, { l: '7', t: 'Causas descrevem o que o sistema permitiu, sem apontar pessoas.' }] }
  ],
  bestPractices: ['Defina SLIs centrados na experiência do usuário e SLOs com base no que importa ao negócio (não 100%).', 'Use o orçamento de erro para decidir entre velocidade e estabilidade com política acordada de antemão.', 'Alerte por taxa de queima em múltiplas janelas (sintoma e orçamento), não por causas isoladas.', 'Mitigue primeiro (rollback, flag) e investigue a causa depois, com papéis e canal claros.', 'Escreva postmortems sem culpados, com ações com dono e prazo, e acompanhe-as até o fim.', 'Reduza o toil com automação e use dados de carga e estresse para planejar capacidade.', 'Faça rollouts seguros (flags, canário, expandir e contrair) e tenha cuidado com ponto flutuante nos cálculos de limites.'],
  mistakes: ['SLO de 100% ou definido a partir do que o sistema consegue, não do que o usuário percebe.', 'Alertas por causa (CPU) que geram ruído.', 'Investigar a causa raiz antes de mitigar.', 'Postmortem que procura culpados ou termina em "erro humano".', 'Ações sem dono ou prazo.', 'Comparar limites de queima sem tratar o ponto flutuante.'],
  market: R`**SLOs, orçamento de erro e postmortems** são **vocabulário de SRE e de liderança técnica**; **desenvolvedores** que **definem SLIs, escrevem runbooks e participam de plantões** **têm mais impacto e autonomia**.`,
  summary: R`SRE trata confiabilidade como engenharia: SLIs medem a experiência, SLOs são metas (99,9% em 30 dias = 43,2 min de orçamento; 99% = 432 min; 99,99% = 4,32 min) e o orçamento de erro decide entre velocidade e estabilidade. Alertas por taxa de queima em duas janelas (14,4x em 1 h = 2%; 6x em 6 h = 5%) acordam só quando importa; um erro de ponto flutuante (1 − 0.999) exigiu arredondar a taxa. Responda a incidentes mitigando primeiro, escreva postmortems sem culpados com ações rastreáveis, reduza toil e planeje capacidade com dados de carga. Cálculos e alertas foram executados; Prometheus, plataformas de incidentes, canário e caos não.`,
  refs: [REF2.sloChapter, REF2.embracingRisk, REF2.alertingSlos, REF2.postmortem, REF2.toil, REF.dora],
  cards: [
    { q: 'Quanto vale o orçamento de erro de um SLO de 99,9% em 30 dias?', a: '43,2 minutos de indisponibilidade total tolerada (0,1% da janela).' },
    { q: 'Por que alertar por taxa de queima em duas janelas?', a: 'A janela longa mostra relevância e a curta confirma que o problema ainda ocorre, evitando alertas depois de resolvido e ruído por causas isoladas.' },
    { q: 'O que significa queima de 14,4x durante 1 hora?', a: 'Consome 2% do orçamento de 30 dias em 1 hora; é o limiar de alerta rápido (pagina).' },
    { q: 'Como deve ser um postmortem?', a: 'Sem culpados: foca nas lacunas do sistema, com linha do tempo e ações com dono e prazo acompanhadas até o fim.' }
  ]
}
];
