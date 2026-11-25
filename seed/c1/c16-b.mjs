// C1.6 — Fluxo profissional e agilidade. Aulas 4 a 7 (Git Flow x trunk-based, Scrum, Kanban, estimativas).
const R = String.raw;

export const REF2 = {
  nvie: { title: 'Vincent Driessen — A successful Git branching model (Git Flow)', url: 'https://nvie.com/posts/a-successful-git-branching-model/', kind: 'article' },
  trunk: { title: 'Trunk Based Development', url: 'https://trunkbaseddevelopment.com/', kind: 'doc' },
  ghFlow: { title: 'GitHub Docs — GitHub flow', url: 'https://docs.github.com/en/get-started/using-github/github-flow', kind: 'doc' },
  flags: { title: 'Martin Fowler — Feature Toggles', url: 'https://martinfowler.com/articles/feature-toggles.html', kind: 'article' },
  dora: { title: 'DORA — Capabilities: trunk-based development', url: 'https://dora.dev/capabilities/trunk-based-development/', kind: 'doc' },
  scrum: { title: 'The Scrum Guide (2020)', url: 'https://scrumguides.org/scrum-guide.html', kind: 'doc' },
  manifesto: { title: 'Manifesto para o Desenvolvimento Ágil de Software', url: 'https://agilemanifesto.org/iso/ptbr/manifesto.html', kind: 'doc' },
  kanbanGuide: { title: 'The Kanban Guide', url: 'https://kanbanguides.org/english/', kind: 'doc' },
  fowlerEst: { title: 'Martin Fowler — Purpose of Estimation', url: 'https://martinfowler.com/bliki/PurposeOfEstimation.html', kind: 'article' }
};

export const lessonsB = [
{
  id: 'flx-04', moduleId: 'm2', order: 4, minutes: 60, tags: ['git flow', 'trunk-based', 'feature flags', 'branching', 'CI/CD'],
  title: 'Estratégias de ramificação: Git Flow x GitHub Flow x trunk-based',
  objectives: ['Descrever Git Flow, GitHub Flow e desenvolvimento baseado em tronco e os ramos de cada um', 'Relacionar a estratégia de ramos com a frequência de integração, o CI/CD e o risco de conflitos', 'Usar feature flags para integrar código incompleto sem expô-lo ao usuário', 'Escolher uma estratégia pelo contexto (cadência de releases, versões em campo, tamanho da equipe, maturidade de testes)', 'Planejar hotfixes, releases e versionamento em cada modelo'],
  intro: `**Estratégia de ramificação** (*branching*) é o acordo da equipe sobre **quais ramos existem, quanto vivem e como o código chega à produção**. Ela decide quantos conflitos você terá, quão rápido entrega e quão arriscado é cada release. Os três modelos mais citados são o **Git Flow** (vários ramos de longa duração), o **GitHub Flow** (um tronco e ramos curtos por PR) e o **desenvolvimento baseado em tronco** (*trunk-based*, integração no mínimo diária). Esta aula compara os três com um repositório de teste real (Git 2.53) e um exemplo executado de *feature flag* em Node.js.`,
  theory: `### Git Flow
Proposto em 2010 por Vincent Driessen, define ramos de **longa duração** e ramos de **apoio**:
- §main§ (ou §master§): só código **liberado**, com uma **tag por versão**;
- §develop§: integração da próxima versão;
- §feature/*§: saem de §develop§ e voltam para ele;
- §release/*§: preparação de uma versão (correções finais, número de versão); sai de §develop§ e é mesclado em §main§ **e** em §develop§;
- §hotfix/*§: correção urgente a partir de §main§, mesclada em §main§ **e** §develop§.
No repositório de teste, o grafo ao final mostrou exatamente esse formato: §v1.0.0§ → §hotfix/1.0.1§ mesclado em §main§ (tag §v1.0.1§) e de volta em §develop§; §feature/b§ em §develop§; §release/1.1§ mesclada em §main§ (tag §v1.1.0§). **Quando faz sentido:** software **versionado e instalado** (aplicativos desktop e mobile, bibliotecas, sistemas embarcados) em que **várias versões** ficam em campo e as releases são planejadas. **Custos:** muitos ramos, mesclagens duplas, ramos de feature longos que **divergem** e geram conflitos grandes, integração tardia e atrito com CI/CD contínuo. O próprio autor acrescentou, anos depois, uma nota dizendo que o modelo **não** é o mais adequado para software web com entrega contínua.

### GitHub Flow
Um único ramo de longa duração (§main§, sempre implantável) e **ramos curtos** por mudança:
1. crie um ramo a partir de §main§; 2. faça commits; 3. abra um PR; 4. revisão e CI; 5. **integre e implante**; 6. apague o ramo.
Simples, bom para equipes pequenas e médias com **entrega contínua** e sem várias versões em campo. O risco é o ramo de PR ficar vivo por semanas.

### Desenvolvimento baseado em tronco (trunk-based)
Todos integram no **tronco** (§main§) com **frequência** (no mínimo uma vez por dia) usando **ramos muito curtos** (horas a um ou dois dias) ou commitando direto no tronco (em equipes experientes, com CI muito rápido). Características:
- **PRs pequenos** e revisão rápida;
- **CI rápido e confiável** (os testes são a rede de proteção);
- código incompleto fica **atrás de feature flags**, e não em um ramo;
- releases saem do tronco (ou de **ramos de release curtos**, apenas para correções cherry-picked, em produtos versionados);
- **abstração por ramificação** e **fachadas** para mudanças grandes (introduza o novo caminho ao lado do antigo, migre aos poucos, remova o antigo).
A pesquisa **DORA** (*DevOps Research and Assessment*) associa a integração frequente no tronco, com ramos curtos, a **melhor desempenho de entrega** (mais implantações, menor tempo de entrega e menos falhas). Isso é uma **correlação** observada em organizações; depende de testes automatizados e de uma cultura que a sustente.

### Feature flags (toggles)
Uma **feature flag** é uma condição que liga ou desliga um comportamento **sem novo deploy**. Permite **separar implantação (deploy) de liberação (release)**: o código vai para produção desligado, e a funcionalidade é ligada para 1 %, depois 10 %, depois todos (**lançamento gradual**) e desligada rapidamente se houver problema (*kill switch*). Tipos: de **release** (curta vida), de **experimento** (teste A/B), **operacionais** (desligar integração instável) e de **permissão** (longa vida). **Custos:** complexidade (combinações de flags a testar), código morto e dívida; **boas práticas:** nomes claros, dono e **data de remoção**, remover a flag após a liberação total, testar com a flag ligada e desligada.

### Comparação
| | Git Flow | GitHub Flow | Trunk-based |
|---|---|---|---|
| Ramos de longa duração | main + develop | main | main |
| Vida dos ramos de trabalho | dias a semanas | horas a dias | horas a 1-2 dias |
| Frequência de integração | baixa | média | alta (diária) |
| Releases | planejadas, ramos de release | a cada merge | a cada merge, ou ramos de release curtos |
| Conflitos | maiores | médios | pequenos |
| Pré-requisitos | disciplina de ramos | CI e revisão | CI rápido, testes fortes, flags |
| Bom para | versões em campo, produtos instalados | web, equipes pequenas | web em escala, entrega contínua |

### Releases, versões e hotfixes em cada modelo
- **Git Flow**: ramo §release/x.y§ (estabiliza) → tag e mesclagem em §main§ e §develop§; hotfix por ramo próprio.
- **GitHub Flow / trunk**: a **tag** marca a versão sobre o tronco; um hotfix é um PR rápido; para manter versões antigas, crie um **ramo de manutenção** (§release/1.x§) e aplique correções com **cherry-pick** a partir do tronco (a correção entra primeiro no tronco, depois é portada).
- **Versionamento**: SemVer e Conventional Commits derivam a versão e o changelog dos commits.

### Como escolher
Faça perguntas: temos **uma versão em produção** (web) ou **várias em campo**? Quão **rápido e confiável** é o nosso CI? A equipe tem **testes automatizados** suficientes para integrar sem revisão longa? Quem **aprova** releases (conformidade)? Comece pelo **mais simples que atende** (GitHub Flow) e caminhe para trunk-based **investindo em testes e flags**; adote Git Flow só se o produto de fato o exigir. Qualquer que seja o modelo, **documente** (CONTRIBUTING.md) e **proteja** o ramo principal.

### Armadilhas
- Ramos de feature vivos por semanas: o conflito vem com juros.
- "Git Flow por inércia" em um serviço web que implanta várias vezes ao dia.
- Trunk-based sem testes: o tronco quebra e ninguém confia nele.
- Flags que nunca são removidas e se acumulam.
- Misturar modelos sem acordo explícito.`,
  concepts: [
    { term: 'Git Flow', def: 'Modelo com main, develop e ramos de feature, release e hotfix, voltado a versões planejadas.' },
    { term: 'GitHub Flow', def: 'Modelo com um tronco sempre implantável e ramos curtos por PR.' },
    { term: 'Trunk-based development', def: 'Integração frequente (diária) no tronco com ramos muito curtos e código incompleto atrás de flags.' },
    { term: 'Feature flag', def: 'Condição que liga ou desliga uma funcionalidade sem novo deploy.' },
    { term: 'Deploy x release', def: 'Deploy coloca o código no ambiente; release expõe a funcionalidade aos usuários.' },
    { term: 'Cherry-pick', def: 'Aplicar em outro ramo um commit específico de um ramo.' },
    { term: 'Ramo de manutenção', def: 'Ramo que recebe correções de uma versão antiga ainda suportada.' },
    { term: 'Lançamento gradual', def: 'Liberar a funcionalidade para uma fração crescente dos usuários.' },
    { term: 'Kill switch', def: 'Flag usada para desligar rapidamente uma funcionalidade problemática.' },
    { term: 'DORA', def: 'Programa de pesquisa que mede o desempenho de entrega de software com métricas como frequência de deploy e tempo de entrega.' }
  ],
  examples: R`**Analogia:** o Git Flow é uma **linha de montagem com várias estações de estoque** (develop, release, main): seguro e previsível para produtos que saem em lotes, mas lento e com muita movimentação. O trunk-based é uma **cozinha de restaurante**: tudo vai para o mesmo balcão o tempo todo, em porções pequenas; funciona se houver **controle de qualidade em cada porção** (testes) e se um prato ainda não pronto fica **atrás do balcão** (flag) até poder ser servido.

**Grafo real do Git Flow (Git 2.53, repositório de teste):**
§§§
*   84a0543 (develop) hotfix de volta em develop
*   6aa853f (HEAD -> main, tag: v1.1.0) merge release/1.1
| * dd606f8 (release/1.1) release: ajustes finais 1.1
*   05ac71f merge feature/b
| * 5f6afd5 (feature/b) feature B
* abdffe5 dev: feature A
* 32dc7d5 (tag: v1.0.1) merge hotfix/1.0.1
| * 4cf99d6 (hotfix/1.0.1) hotfix: corrige falha critica
* f5b3cf0 (tag: v1.0.0) v1.0.0 em producao
§§§
(Versão resumida das linhas do §git log --graph§; os ramos e tags são os do teste.) Note os **três commits de mesclagem** para uma mudança de cada tipo: é o custo de cerimônia do modelo.

**Caso real (flag):** uma equipe de e-commerce desenvolve um novo checkout em 15 PRs pequenos, todos no tronco, atrás da flag §checkout_v2§. Em produção, a flag liga para os funcionários, depois para 5 % dos usuários, 25 %, 100 %. Quando a taxa de erro de pagamento sobe a 3 %, desligam a flag em segundos, sem reverter código nem novo deploy. Depois de uma semana estável, removem a flag e o código antigo.`,
  code: [
    { title: 'Git Flow reproduzido com Git de verdade (executado com Git 2.53)', lang: 'bash', code: R`set -e
git init -q -b main gf; cd gf
n=0; c() { n=$((n+1)); echo "$1" > "f$n.txt"; git add .; git commit -qm "$1"; }   # um arquivo por commit: sem conflitos
c "v1.0.0 em producao"; git tag v1.0.0
git switch -q -c develop; c "dev: feature A"
git switch -q -c feature/b; c "feature B"
git switch -q develop; git merge -q --no-ff feature/b -m "merge feature/b"
git switch -q -c release/1.1; c "release: ajustes finais 1.1"
git switch -q main; git switch -q -c hotfix/1.0.1; c "hotfix: corrige falha critica"
git switch -q main; git merge -q --no-ff hotfix/1.0.1 -m "merge hotfix/1.0.1"; git tag v1.0.1
git switch -q develop; git merge -q --no-ff hotfix/1.0.1 -m "hotfix de volta em develop"
git switch -q main; git merge -q --no-ff release/1.1 -m "merge release/1.1"; git tag v1.1.0
git log --oneline --graph --all --decorate`, notes: [{ l: '3', t: 'Cada commit cria seu próprio arquivo para evitar conflitos de conteúdo.' }, { l: '9', t: 'O hotfix sai de main e é mesclado em main (tag) e em develop.' }, { l: '12', t: 'A release é mesclada em main com a tag da versão.' }, { l: '13', t: 'O grafo resultante tem três commits de mesclagem além dos ramos de apoio.' }] },
    { title: 'Feature flag com lançamento gradual determinístico (executado em Node.js 26)', lang: 'javascript', code: R`import { createHash } from 'node:crypto';

const flags = {
  checkout_v2: { ligada: true, percentual: 25, permitidos: ['ana@empresa.com'] }
};
// Mesmo usuário, mesma decisão: o hash do id define o "balde" de 0 a 99
const balde = (flag, usuario) => createHash('sha256').update(flag + ':' + usuario).digest().readUInt32BE(0) % 100;
function ativa(nome, usuario) {
  const f = flags[nome];
  if (!f || !f.ligada) return false;                       // kill switch
  if (f.permitidos?.includes(usuario)) return true;       // lista de permissão
  return balde(nome, usuario) < f.percentual;              // lançamento gradual
}
const usuarios = Array.from({ length: 1000 }, (_, i) => 'u' + i);
const ligados = usuarios.filter((u) => ativa('checkout_v2', u)).length;
console.log(ativa('checkout_v2', 'ana@empresa.com'), ativa('checkout_v2', 'u1') === ativa('checkout_v2', 'u1'), ligados);
flags.checkout_v2.ligada = false;                          // desliga sem novo deploy
console.log(usuarios.filter((u) => ativa('checkout_v2', u)).length);   // 0`, notes: [{ l: '6', t: 'O hash dá estabilidade: o usuário não alterna entre as versões a cada requisição.' }, { l: '10', t: 'Desligar a flag interrompe tudo de imediato (kill switch).' }, { l: '16', t: 'Saída observada: true true 243 (243 de 1000 usuários, próximo de 25 %) e, depois do kill switch, 0.' }] }
  ],
  bestPractices: ['Escolha a estratégia mais simples que atenda ao produto: comece pelo GitHub Flow.', 'Mantenha ramos de trabalho curtos e integre ao tronco com frequência.', 'Invista em CI rápido e testes automatizados antes de adotar trunk-based.', 'Use feature flags para separar deploy de release e remova-as depois de liberar.', 'Em produtos versionados, mantenha ramos de manutenção e porte correções com cherry-pick.', 'Documente a estratégia no CONTRIBUTING.md e proteja o ramo principal.'],
  mistakes: ['Adotar Git Flow para um serviço web com deploys diários.', 'Ramos de feature de semanas, com conflitos enormes no final.', 'Trunk-based sem testes confiáveis: o tronco vive quebrado.', 'Flags sem dono nem data de remoção.', 'Hotfix aplicado só em main e esquecido em develop.', 'Cada pessoa da equipe usando um modelo diferente.'],
  market: `A escolha da estratégia de ramos aparece em decisões de plataforma e de produtividade de equipes: empresas de produto web grandes usam trunk-based com flags e CI robusto, enquanto software versionado e embarcado ainda usa variações do Git Flow. Entender os trade-offs e saber propor uma migração (por exemplo, de Git Flow para trunk-based) é uma habilidade de liderança técnica.`,
  summary: `Git Flow usa main, develop, feature, release e hotfix e serve a produtos versionados, com custo de ramos longos e mesclagens duplas. GitHub Flow tem um tronco implantável e ramos curtos por PR. Trunk-based integra diariamente no tronco, com ramos muito curtos, CI rápido, testes fortes e feature flags para separar deploy de release. Escolha pelo contexto, mantenha ramos curtos e remova flags após a liberação.`,
  refs: [REF2.nvie, REF2.trunk, REF2.ghFlow, REF2.flags, REF2.dora],
  cards: [
    { q: 'Qual o ponto fraco do Git Flow em entrega contínua?', a: 'Ramos de longa duração e mesclagens duplas atrasam a integração e geram conflitos; é voltado a versões planejadas.' },
    { q: 'O que as feature flags separam?', a: 'Deploy (código no ambiente) de release (funcionalidade exposta aos usuários).' },
    { q: 'O que o trunk-based exige para funcionar?', a: 'CI rápido e confiável, testes automatizados fortes, PRs pequenos e flags para código incompleto.' },
    { q: 'Onde um hotfix deve ser mesclado no Git Flow?', a: 'Em main (com a tag) e também em develop.' }
  ]
},
{
  id: 'flx-05', moduleId: 'm3', order: 5, minutes: 60, tags: ['scrum', 'sprint', 'papéis', 'eventos', 'definition of done'],
  title: 'Scrum: papéis, eventos, artefatos e compromissos',
  objectives: ['Explicar os valores e princípios do Manifesto Ágil e o empirismo (transparência, inspeção, adaptação)', 'Descrever os três papéis, os cinco eventos e os três artefatos do Scrum (Guia de 2020) e seus compromissos', 'Diferenciar Product Backlog, Sprint Backlog, Incremento, Meta do Produto, Meta da Sprint e Definição de Pronto', 'Planejar uma Sprint com capacidade e meta, e conduzir Daily, Review e Retrospectiva com propósito', 'Reconhecer anti-padrões ("Scrummerfall", Sprint como mini-cascata, Daily como relatório de status)'],
  intro: `**Scrum** é um *framework* leve para desenvolver e sustentar produtos complexos em ciclos curtos, com **transparência, inspeção e adaptação**. É o método ágil mais usado, e também o mais mal aplicado: muitas equipes fazem as reuniões sem entender seu propósito. Esta aula segue o **Scrum Guide 2020** (a versão publicada em scrumguides.org em 2026-11-18) e liga o Scrum aos **valores do Manifesto Ágil**. Observação: o Scrum **não é** uma metodologia completa nem uma prática de engenharia; ele é compatível com Kanban, XP, DevOps e outras práticas.`,
  theory: `### Ágil e o Manifesto
O **Manifesto Ágil** (2001) valoriza: **indivíduos e interações** mais que processos e ferramentas; **software em funcionamento** mais que documentação abrangente; **colaboração com o cliente** mais que negociação de contratos; **responder a mudanças** mais que seguir um plano. Os itens da direita **têm valor**, mas os da esquerda valem **mais**. Ágil é uma **forma de pensar**; Scrum, Kanban e XP são **maneiras de praticá-la**.

### Empirismo: três pilares
1. **Transparência**: o trabalho e o estado real são visíveis a quem importa;
2. **Inspeção**: verificar com frequência o progresso e o produto;
3. **Adaptação**: ajustar o rumo quando o que se vê se afasta do esperado.
Scrum é **empírico**: aprende-se com a experiência, em ciclos curtos, em vez de prever tudo no início.

### Time Scrum e responsabilidades
Um **Time Scrum** é pequeno (tipicamente 10 pessoas ou menos), **multifuncional** e **autogerenciável**, sem hierarquia interna. Três responsabilidades:
- **Product Owner (PO)**: maximiza o **valor** do produto e gerencia o **Product Backlog** (ordenação e clareza dos itens). É **uma pessoa**, não um comitê; o time respeita suas decisões, e ela precisa estar disponível.
- **Scrum Master**: responsável por **eficácia do Scrum** e do time: remove impedimentos, ensina, facilita os eventos e protege o time; é líder-servidor, **não é gerente de projeto**.
- **Desenvolvedores**: criam **qualquer aspecto** de um Incremento utilizável a cada Sprint (design, código, teste, documentação); são **responsáveis** pelo plano da Sprint, pela qualidade (Definição de Pronto) e se adaptam diariamente.

### A Sprint e os cinco eventos
A **Sprint** é a caixa de tempo de **um mês ou menos**, com duração fixa, durante a qual se cria um **Incremento** "Pronto" e utilizável. Dentro dela:
1. **Planejamento da Sprint**: define **por que** a Sprint é valiosa (Meta da Sprint), **o que** pode ser feito (itens do Product Backlog) e **como** o trabalho será realizado (plano). Máximo de 8 horas para uma Sprint de um mês.
2. **Daily Scrum**: 15 minutos, todo dia, para **inspecionar o progresso rumo à Meta da Sprint** e adaptar o Sprint Backlog. É dos Desenvolvedores; **não é relatório de status** ao gerente.
3. **Revisão da Sprint** (*Sprint Review*): inspeção do **Incremento** com as partes interessadas e adaptação do Product Backlog; é uma **sessão de trabalho**, não só uma demonstração. Até 4 horas (Sprint de um mês).
4. **Retrospectiva da Sprint**: o time inspeciona **como trabalhou** (pessoas, interações, processos, ferramentas, Definição de Pronto) e acorda melhorias para a próxima Sprint. Até 3 horas.
O próprio **evento Sprint** é o contêiner dos demais. Uma nova Sprint começa logo após a anterior terminar.
Ordem de uma Sprint: Planejamento → Dailies (todos os dias) → Revisão → Retrospectiva.

### Artefatos e compromissos
| Artefato | Compromisso | Descrição |
|---|---|---|
| **Product Backlog** | **Meta do Produto** | lista ordenada do que é necessário para melhorar o produto; a Meta do Produto descreve o estado futuro desejado |
| **Sprint Backlog** | **Meta da Sprint** | itens selecionados + plano de entrega + a Meta da Sprint (o único objetivo da Sprint) |
| **Incremento** | **Definição de Pronto** | passo concreto rumo à Meta do Produto; só é um Incremento se atende à Definição de Pronto |
- **Product Backlog Refinement** (refinamento) é uma atividade contínua de detalhar, estimar e ordenar itens; não é um evento formal.
- **Definição de Pronto** (*Definition of Done*, DoD): descreve a qualidade exigida (código revisado, testes passando, documentação, segurança, implantado em staging...). Se um item não atende, **não é Pronto** e **não** entra no Incremento nem na Revisão.
- **Meta da Sprint**: dá **coerência e foco**; o escopo pode ser renegociado com o PO durante a Sprint, **a Meta não muda**. Se ela se torna obsoleta, o PO pode **cancelar** a Sprint (raro).

### Ligando ao fluxo de engenharia
A Definição de Pronto conversa com tudo o que vimos: PR revisado, CI verde, documentação atualizada, ramo integrado. Itens "quase prontos" não contam. Integração contínua e testes automatizados são o que torna viável **entregar um Incremento a cada Sprint**.

### Anti-padrões comuns
- **Daily como relatório**: cada pessoa fala com o Scrum Master em vez de alinhar com o time sobre a Meta da Sprint.
- **Sprint como mini-cascata** (análise, depois desenvolvimento, depois teste dentro da mesma Sprint): itens ficam "quase prontos" no fim. Fatie histórias **verticalmente**, de ponta a ponta.
- **PO ausente** ou **que age como gerente** que distribui tarefas.
- **Scrum Master como secretário** ou gerente.
- **Meta da Sprint ausente**: a Sprint vira uma lista de tarefas.
- **Velocidade como meta** ou comparada entre times: vira manipulação.
- **Revisão sem partes interessadas** e **retrospectiva sem ações** (nada muda).
- **Mudar o escopo e a duração da Sprint** a toda hora.

### Quando Scrum ajuda (e quando não)
Funciona bem com **requisitos incertos que mudam**, equipes estáveis e acesso ao PO e aos usuários. Funciona mal para trabalho **de fluxo contínuo e imprevisível** (suporte, operação, incidentes), em que o **Kanban** (próxima aula) costuma ser melhor; muitas equipes combinam os dois ("Scrumban").`,
  concepts: [
    { term: 'Scrum', def: 'Framework ágil para desenvolver produtos complexos em Sprints, baseado em transparência, inspeção e adaptação.' },
    { term: 'Product Owner', def: 'Pessoa responsável por maximizar o valor do produto e gerenciar o Product Backlog.' },
    { term: 'Scrum Master', def: 'Responsável pela eficácia do Scrum e do time; remove impedimentos e facilita.' },
    { term: 'Desenvolvedores', def: 'Pessoas que criam o Incremento a cada Sprint, em qualquer especialidade.' },
    { term: 'Sprint', def: 'Ciclo de duração fixa de um mês ou menos que contém todos os eventos do Scrum.' },
    { term: 'Product Backlog', def: 'Lista ordenada e emergente do que é necessário para melhorar o produto.' },
    { term: 'Sprint Backlog', def: 'Itens da Sprint, plano e Meta da Sprint, de propriedade dos Desenvolvedores.' },
    { term: 'Incremento', def: 'Resultado utilizável que atende à Definição de Pronto.' },
    { term: 'Definição de Pronto', def: 'Critérios de qualidade que um item deve satisfazer para ser considerado parte do Incremento.' },
    { term: 'Meta da Sprint', def: 'Objetivo único e coerente da Sprint, definido no Planejamento.' },
    { term: 'Daily Scrum', def: 'Evento diário de 15 minutos dos Desenvolvedores para acompanhar a Meta da Sprint.' },
    { term: 'Retrospectiva', def: 'Evento em que o time inspeciona seu modo de trabalhar e define melhorias.' }
  ],
  examples: R`**Analogia:** uma Sprint é uma **viagem de trem com paradas fixas**: o PO decide o destino da viagem (Meta), o time escolhe como chegar dentro do horário, a cada parada (Daily) confere o mapa e, ao chegar, mostra o que levou (Revisão) e conversa sobre como melhorar a próxima viagem (Retrospectiva). O horário da viagem **não estica**; se não couber tudo, o time **diminui o escopo** e não o horário.

**Exemplo de Sprint de duas semanas (produto de pedidos online):**
- *Meta da Sprint:* "o cliente consegue pagar com Pix no checkout".
- *Itens:* gerar QR Code, receber confirmação de pagamento (webhook), mostrar o status do pedido, atualizar a documentação da API.
- *Definição de Pronto:* PR revisado e integrado; testes automatizados passando; segurança do webhook verificada; documentação atualizada; implantado em homologação.
- *Daily:* "o webhook ainda falha em duplicidade; precisamos de idempotência (pareamos hoje)".
- *Revisão:* o PO e três clientes testam o Pix em homologação; pedem o reembolso como próxima prioridade (o Product Backlog é reordenado).
- *Retrospectiva:* os PRs levaram dois dias para revisão; ação: reservar 30 minutos diários para revisões e limitar PRs a 400 linhas.

**Atenção:** estes são exemplos didáticos; não substituem a leitura do Scrum Guide.`,
  code: [
    { title: 'Capacidade e meta da Sprint: ferramenta simples de planejamento (padrão em JavaScript; a lógica é verificada no exercício da aula)', lang: 'javascript', code: R`// Itens do Product Backlog, já ordenados pelo PO (maior prioridade primeiro)
const backlog = [
  { id: 'PIX-1', titulo: 'Gerar QR Code', pontos: 5 },
  { id: 'PIX-2', titulo: 'Webhook de confirmação', pontos: 8 },
  { id: 'PIX-3', titulo: 'Status do pedido', pontos: 3 },
  { id: 'PIX-4', titulo: 'Reembolso', pontos: 8 },
  { id: 'DOC-1', titulo: 'Documentar a API', pontos: 2 }
];
const velocidades = [21, 18, 24, 20, 17];                       // pontos concluídos nas últimas Sprints
const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const capacidade = Math.floor(media(velocidades.slice(-3)));  // média das 3 últimas = 20
let usados = 0; const sprint = [];
for (const item of backlog) {
  if (usados + item.pontos <= capacidade) { sprint.push(item.id); usados += item.pontos; }
}
console.log(capacidade, sprint, usados);   // 20 [ 'PIX-1', 'PIX-2', 'PIX-3', 'DOC-1' ] 18`, notes: [{ l: '9', t: 'A média das três últimas velocidades (17, 24 e 20 resultam em 20,3) arredondada para baixo dá 20; é uma previsão, não uma promessa.' }, { l: '13', t: 'Os itens são considerados na ordem do PO enquanto couberem; o item que não cabe é pulado.' }, { l: '16', t: 'Saída esperada com estes dados: 20 e os itens PIX-1, PIX-2, PIX-3 e DOC-1 (18 pontos).' }] }
  ],
  bestPractices: ['Defina uma Meta da Sprint clara antes de escolher os itens.', 'Escreva e respeite uma Definição de Pronto explícita e visível.', 'Mantenha a Daily curta e focada na Meta, entre os Desenvolvedores.', 'Faça a Revisão com as partes interessadas e use o resultado para reordenar o backlog.', 'Transforme cada Retrospectiva em 1 ou 2 ações concretas, com responsável e prazo.', 'Fatie itens verticalmente (valor de ponta a ponta) e refine o backlog continuamente.'],
  mistakes: ['Tratar o Scrum Master como gerente de projeto e o PO como ausente.', 'Daily como relatório para um chefe.', 'Sprint sem Meta, só com uma lista de tarefas.', 'Itens "quase prontos" contados como concluídos (sem Definição de Pronto).', 'Usar velocidade como meta ou para comparar times.', 'Alterar o escopo e a duração da Sprint a todo momento.'],
  market: `Scrum é amplamente adotado e pedido em vagas de desenvolvimento, produto e gestão; certificações e entrevistas costumam checar o conhecimento do Guia. Mais do que decorar eventos, empresas valorizam quem entende os princípios e adapta as práticas ao contexto sem perder transparência, inspeção e adaptação.`,
  summary: `Scrum é empírico (transparência, inspeção, adaptação) e organiza o trabalho em Sprints de até um mês. O Time Scrum tem PO, Scrum Master e Desenvolvedores. Eventos: Sprint, Planejamento, Daily, Revisão e Retrospectiva. Artefatos e compromissos: Product Backlog e Meta do Produto, Sprint Backlog e Meta da Sprint, Incremento e Definição de Pronto. Evite Daily como relatório, mini-cascata, backlog sem dono e métricas como meta.`,
  refs: [REF2.scrum, REF2.manifesto, REF2.ghFlow],
  cards: [
    { q: 'Quais são os três pilares do empirismo no Scrum?', a: 'Transparência, inspeção e adaptação.' },
    { q: 'Para que serve a Daily Scrum?', a: 'Para os Desenvolvedores inspecionarem o progresso rumo à Meta da Sprint e adaptarem o plano; não é relatório de status.' },
    { q: 'O que é a Definição de Pronto?', a: 'Critérios de qualidade que um item precisa cumprir para fazer parte do Incremento.' },
    { q: 'O que pode mudar durante a Sprint: a Meta da Sprint ou o escopo?', a: 'O escopo pode ser renegociado com o PO; a Meta da Sprint não muda.' }
  ]
},
{
  id: 'flx-06', moduleId: 'm3', order: 6, minutes: 60, tags: ['kanban', 'WIP', 'fluxo', 'lead time', 'lei de Little'],
  title: 'Kanban: visualizar o fluxo, limitar o WIP e medir',
  objectives: ['Explicar as práticas do Kanban (visualizar, limitar o trabalho em andamento, gerenciar o fluxo, políticas explícitas, ciclos de feedback)', 'Montar um quadro com colunas, limites de WIP e classes de serviço', 'Calcular lead time, cycle time, throughput e WIP médio e aplicar a Lei de Little', 'Interpretar percentis de cycle time para compromissos realistas', 'Comparar Kanban e Scrum e escolher (ou combinar) por contexto'],
  intro: `**Kanban** vem do japonês "cartão visual" e, no desenvolvimento de software, é um método para **gerenciar o fluxo de trabalho**: torna o trabalho visível, **limita o que está em andamento** e melhora continuamente. Diferente do Scrum, **não prescreve papéis nem iterações**; começa **onde você está** e evolui. O seu efeito mais poderoso e menos intuitivo é este: **começar menos e terminar mais** torna a entrega **mais rápida**. Esta aula usa o **Kanban Guide** e uma amostra de dados executada em Node.js 26 para mostrar a **Lei de Little** funcionando com números reais.`,
  theory: `### Práticas clássicas do Método Kanban (David Anderson)
1. **Visualizar o trabalho**: um quadro com colunas que representam o **fluxo real** (por exemplo, Backlog → Em análise → Em desenvolvimento → Em revisão → Em teste → Pronto) e um cartão por item de trabalho.
2. **Limitar o trabalho em andamento (WIP)**: cada coluna (ou o quadro todo) tem um **limite** de itens simultâneos. Se o limite foi atingido, **ninguém puxa novo trabalho**: ajuda a terminar o que está em curso.
3. **Gerenciar o fluxo**: observar onde os itens esperam (**gargalos**), medir e agir; trabalho **bloqueado** fica visível e é tratado com prioridade.
4. **Tornar as políticas explícitas**: critérios de entrada e saída de cada coluna, definição de pronto, regras de priorização, como tratar urgências.
5. **Implementar ciclos de feedback**: reuniões de reabastecimento, de revisão do fluxo, de entrega, e retrospectivas.
6. **Melhorar colaborativamente**, evoluindo por experimentos guiados por dados.
O **Kanban Guide** (edição de maio de 2025, a mais recente em kanbanguides.org na data da consulta) condensa o método em **três práticas**: **definir e visualizar o fluxo de trabalho**, **gerenciar ativamente os itens em andamento** e **melhorar o fluxo**. Ele define quatro **métricas de fluxo**: **WIP** (itens iniciados e não concluídos), **Throughput** (itens concluídos por unidade de tempo), **Work Item Age** (tempo desde o início do item até hoje) e **Cycle Time** (do início ao fim do item). O termo *lead time* é muito usado fora do guia e é tratado abaixo como a espera total desde o pedido.

### Sistema puxado
No Kanban o trabalho é **puxado**: quando uma pessoa termina um item e há espaço na coluna seguinte, ela **puxa** o próximo de acordo com as políticas. Em um sistema **empurrado**, itens são atribuídos independentemente da capacidade, e o excesso vira fila. Puxar segundo a capacidade evita sobrecarga.

### Por que limitar o WIP
Mais coisas em andamento significa mais **troca de contexto**, mais **espera** e **tempos de entrega maiores**. A **Lei de Little** formaliza: para um sistema estável, **WIP médio (L) = vazão média (λ) × tempo médio no sistema (W)**. Se a vazão não muda, **reduzir o WIP reduz o tempo de entrega**.

### Métricas de fluxo
- **Lead time** (tempo de espera total): do momento em que o cliente pede (ou o item entra no backlog) até a entrega.
- **Cycle time**: do início do trabalho até a entrega; é o que a equipe controla mais.
- **Throughput (vazão)**: itens concluídos por unidade de tempo.
- **WIP**: itens em andamento num instante; **idade do item** (*work item age*): há quanto tempo um item em andamento está aberto; ajuda a ver itens "encalhados".
- **Eficiência de fluxo**: tempo de **trabalho ativo** dividido pelo cycle time total (o resto é espera).
- **Distribuição**: use **percentis** (50 %, 85 %, 95 %) em vez da média, porque os tempos têm cauda longa.

### Um exemplo calculado (dados fixos, Node.js 26)
Dez cartões com início e fim em dias (T = 20 dias): A(0-3), B(1-6), C(2-4), D(4-9), E(6-8), F(7-14), G(9-12), H(12-16), I(13-17), J(16-20). Resultado:
- **cycle time médio (W)** = **3,9 dias**;
- **vazão (λ)** = 10 itens / 20 dias = **0,5 item/dia**;
- **WIP médio (L)**, medido contando os itens em andamento em cada dia = **1,95**, e **λ × W = 0,5 × 3,9 = 1,95**: a Lei de Little bateu **exatamente** (porque todos os itens começaram e terminaram dentro do período);
- **WIP máximo** = 3;
- **percentis do cycle time**: **p50 = 4 dias**, **p85 = 5 dias**, **p95 = 7 dias**: "85 % dos itens saem em até 5 dias" é uma **previsão** mais útil que "a média é 3,9".

### Previsão com Monte Carlo
Com o histórico de **vazão por semana** (por exemplo, 3, 5, 2, 4, 6, 3, 4, 5 itens), pode-se estimar **quantas semanas** faltam para concluir 30 itens sorteando semanas do histórico milhares de vezes. Em 10 000 simulações com semente fixa (42), o resultado foi: **p50 = 8 semanas, p85 = 9, p95 = 9** (média histórica de 4 itens por semana: 30/4 = 7,5). A resposta é uma **distribuição**, não uma data única: "com 85 % de confiança, em até 9 semanas".

### Classes de serviço e políticas
Trabalhos diferentes têm urgências diferentes: **acelerado** (urgente, pode furar a fila e exceder o WIP, com limite de quantos), **data fixa**, **padrão** e **intangível**. Defina **regras explícitas** para cada classe e proteja a equipe do "tudo é urgente".

### Kanban x Scrum
| | Scrum | Kanban |
|---|---|---|
| Cadência | Sprints de duração fixa | fluxo contínuo (cadências opcionais) |
| Papéis | PO, Scrum Master, Desenvolvedores | nenhum prescrito |
| Limite | capacidade da Sprint | WIP por coluna |
| Mudanças | evitadas durante a Sprint | a qualquer momento, respeitando o WIP |
| Medida | velocidade, meta da Sprint | lead time, cycle time, throughput |
| Bom para | produto com objetivos por ciclo | suporte, operações, manutenção, fluxo imprevisível |
Muitas equipes combinam: Sprints com quadro Kanban e limites de WIP, ou fluxo contínuo com revisões periódicas.

### Armadilhas
- Quadro **sem limites de WIP** é só um mural: não muda o comportamento.
- Colunas que não refletem o processo real; itens bloqueados escondidos.
- Medir **só a média**; ignorar a cauda.
- Usar métricas de fluxo para **cobrar pessoas** em vez de melhorar o sistema.
- Misturar tarefas minúsculas e épicos no mesmo quadro sem políticas.`,
  concepts: [
    { term: 'Kanban', def: 'Método para gerenciar o fluxo de trabalho com visualização, limites de WIP e melhoria contínua.' },
    { term: 'WIP', def: 'Work in progress: quantidade de itens em andamento ao mesmo tempo.' },
    { term: 'Sistema puxado', def: 'Modelo em que o trabalho é puxado quando há capacidade, em vez de empurrado.' },
    { term: 'Lead time', def: 'Tempo total desde o pedido ou entrada do item até a entrega.' },
    { term: 'Cycle time', def: 'Tempo entre o início do trabalho em um item e sua conclusão.' },
    { term: 'Throughput', def: 'Quantidade de itens concluídos por unidade de tempo.' },
    { term: 'Lei de Little', def: 'Em um sistema estável, WIP médio = vazão média × tempo médio no sistema.' },
    { term: 'Percentil', def: 'Valor abaixo do qual está certa fração das observações (p85: 85 %).' },
    { term: 'Classe de serviço', def: 'Categoria de itens com políticas diferentes de prioridade e prazo.' },
    { term: 'Simulação de Monte Carlo', def: 'Repetir sorteios sobre dados históricos para obter uma distribuição de resultados possíveis.' }
  ],
  examples: R`**Analogia:** a rodovia. Mais carros na pista (WIP) não aumentam a vazão além de um ponto: aumentam o **congestionamento** e o tempo de viagem. Limitar a entrada de carros (WIP) deixa o trânsito fluir e **reduz o tempo de chegada**. O Kanban é o semáforo de acesso à rodovia, junto com o painel que mostra onde o trânsito empaca.

**Quadro com limites (política explícita):**
§§§
Backlog | Desenvolvimento (WIP 3) | Revisão (WIP 2) | Teste (WIP 2) | Pronto
§§§
Se "Revisão" está cheia (2 itens), quem terminou de desenvolver **não puxa** nada novo para desenvolver: ajuda a revisar. O gargalo vira trabalho de todos.

**Resultados calculados (Node.js 26):**
§§§
{ W: 3.9, lambda: 0.5, L: 1.95, 'lambda*W': 1.95, wipMax: 3 }
p50 4 p85 5 p95 7
Monte Carlo 30 itens: p50 8 p85 9 p95 9 média histórica 4
§§§

**Caso real:** uma equipe de suporte de TI tem cerca de 30 chamados abertos por pessoa e o tempo de atendimento sobe. Introduz o limite de 3 por pessoa, uma coluna "bloqueado" visível e a política de "terminar antes de começar". Após seis semanas, o p85 do cycle time cai de 12 para 5 dias, sem contratar ninguém (números ilustrativos de um cenário didático, não medições reais).`,
  code: [
    { title: 'Lei de Little e percentis com dados fixos (executado em Node.js 26)', lang: 'javascript', code: R`const cards = [
  { id: 'A', inicio: 0, fim: 3 }, { id: 'B', inicio: 1, fim: 6 }, { id: 'C', inicio: 2, fim: 4 }, { id: 'D', inicio: 4, fim: 9 }, { id: 'E', inicio: 6, fim: 8 },
  { id: 'F', inicio: 7, fim: 14 }, { id: 'G', inicio: 9, fim: 12 }, { id: 'H', inicio: 12, fim: 16 }, { id: 'I', inicio: 13, fim: 17 }, { id: 'J', inicio: 16, fim: 20 }
];
const T = 20;
const tempos = cards.map((c) => c.fim - c.inicio);
const W = tempos.reduce((a, b) => a + b, 0) / cards.length;              // cycle time médio
const lambda = cards.length / T;                                           // vazão (itens/dia)
const wipPorDia = Array.from({ length: T }, (_, d) => cards.filter((c) => c.inicio <= d && d < c.fim).length);
const L = wipPorDia.reduce((a, b) => a + b, 0) / T;                        // WIP médio
console.log({ W, lambda, L, 'lambda*W': lambda * W, wipMax: Math.max(...wipPorDia) });
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
console.log('p50', pct(tempos, 0.5), 'p85', pct(tempos, 0.85), 'p95', pct(tempos, 0.95));`, notes: [{ l: '7', t: 'W é o tempo médio no sistema.' }, { l: '9', t: 'O WIP de cada dia conta quantos itens estavam em andamento.' }, { l: '11', t: 'Saída observada: { W: 3.9, lambda: 0.5, L: 1.95, lambda*W: 1.95, wipMax: 3 }.' }, { l: '13', t: 'Saída observada: p50 4, p85 5, p95 7.' }] },
    { title: 'Previsão de conclusão por Monte Carlo com semente fixa (executado)', lang: 'javascript', code: R`function rng(seed) {                                         // Mulberry32: gerador determinístico
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const historico = [3, 5, 2, 4, 6, 3, 4, 5];                  // itens concluídos por semana
function semanasParaConcluir(restante, aleatorio) {
  let semanas = 0, feito = 0;
  while (feito < restante) { feito += historico[Math.floor(aleatorio() * historico.length)]; semanas++; }
  return semanas;
}
const r = rng(42);
const resultados = Array.from({ length: 10000 }, () => semanasParaConcluir(30, r));
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
console.log('p50', pct(resultados, 0.5), 'p85', pct(resultados, 0.85), 'p95', pct(resultados, 0.95));   // 8 9 9`, notes: [{ l: '1', t: 'Semente fixa torna o resultado reproduzível.' }, { l: '7', t: 'Cada simulação sorteia semanas do histórico até concluir os itens restantes.' }, { l: '14', t: 'Saída observada: p50 8, p85 9, p95 9 semanas.' }] }
  ],
  bestPractices: ['Visualize o fluxo real e inclua o trabalho bloqueado.', 'Defina limites de WIP e respeite-os: termine antes de começar.', 'Torne as políticas explícitas (entrada, saída, prioridade, urgência).', 'Meça lead time, cycle time, throughput e idade dos itens; use percentis nas previsões.', 'Use dados históricos (e Monte Carlo) em vez de chutes para previsões.', 'Use as métricas para melhorar o sistema, não para cobrar pessoas.'],
  mistakes: ['Quadro sem limite de WIP.', 'Usar só a média de cycle time.', 'Itens bloqueados sem destaque nem dono.', 'Aceitar urgências ilimitadas na classe acelerada.', 'Colunas que não refletem o processo real.', 'Comparar vazão entre equipes com itens de tamanhos diferentes.'],
  market: `Kanban é usado em suporte, operações, plataforma, manutenção e desenvolvimento, e métricas de fluxo (lead time, cycle time, throughput) estão ligadas a indicadores de entrega de software, como as pesquisas DORA. Profissionais que sabem prever entregas com dados históricos, e não com promessas, ganham credibilidade com gestores e clientes.`,
  summary: `Kanban visualiza o trabalho, limita o WIP, gerencia o fluxo, explicita políticas e melhora continuamente, em um sistema puxado. A Lei de Little (WIP = vazão × tempo no sistema) mostra por que reduzir o WIP reduz o tempo de entrega. Meça lead time, cycle time, throughput e idade dos itens, use percentis (p85) e simulações com histórico para prever. Kanban e Scrum se combinam; escolha pelo tipo de trabalho.`,
  refs: [REF2.kanbanGuide, REF2.manifesto, REF2.dora],
  cards: [
    { q: 'O que diz a Lei de Little?', a: 'Em um sistema estável, WIP médio = vazão média × tempo médio no sistema.' },
    { q: 'Por que usar o p85 do cycle time em vez da média?', a: 'Os tempos têm cauda longa; o percentil dá uma previsão com um nível de confiança (85 % dos itens saem em até X dias).' },
    { q: 'Qual a diferença entre lead time e cycle time?', a: 'Lead time vai do pedido à entrega; cycle time vai do início do trabalho à entrega.' },
    { q: 'O que acontece em um sistema puxado quando a coluna seguinte está cheia?', a: 'Ninguém puxa novo trabalho para ela; a equipe ajuda a destravar o gargalo.' }
  ]
},
{
  id: 'flx-07', moduleId: 'm3', order: 7, minutes: 60, tags: ['estimativas', 'story points', 'PERT', 'incerteza', 'previsão'],
  title: 'Estimativas técnicas: tamanho relativo, incerteza e previsões honestas',
  objectives: ['Explicar por que estimar é difícil (viés de planejamento, incerteza, dependências) e o que uma estimativa é e não é', 'Usar técnicas de estimativa relativa (pontos, planning poker, T-shirt) e por três pontos (PERT)', 'Calcular valor esperado e desvio e comunicar estimativas como intervalos com confiança', 'Usar dados históricos (velocidade, vazão) para prever, em vez de depender de palpites', 'Dividir trabalho, tratar riscos e reestimar, evitando estimativas como promessas ou como medida de desempenho'],
  intro: `**Estimar** é prever esforço, prazo ou custo de um trabalho que ainda não foi feito, **em condições de incerteza**. É necessária (para planejar, priorizar e negociar), difícil (humanos são otimistas) e mal usada (estimativas viram promessas e depois armas). Esta aula trata de **técnicas** (relativa, três pontos, histórico), **de como comunicar** (intervalos, confiança) e de **como evitar os erros clássicos**. Este é o tópico "Estimativas técnicas" da disciplina de Agilidade. O tópico "Levantamento de requisitos" da mesma disciplina é tratado no curso de Requisitos e modelagem de domínio.`,
  theory: `### O que é uma estimativa (e o que não é)
Uma estimativa é uma **previsão probabilística**, não um compromisso. Dizer "leva 5 dias" sem **intervalo** nem **confiança** esconde a incerteza. O propósito da estimativa (como lembra Martin Fowler) é **apoiar uma decisão**: vale a pena fazer? em que ordem? cabe no prazo? Se a decisão não depende da estimativa, **não gaste tempo estimando**.

### Por que erramos
- **Viés de planejamento**: tendemos a imaginar o **melhor caso**, ignorando interrupções, dúvidas, revisões e retrabalho;
- **Cone da incerteza**: no início do projeto o erro possível é muito grande e diminui conforme se aprende;
- **Desconhecidos desconhecidos**: o que não sabemos que não sabemos;
- **Dependências** e **filas**: o trabalho espera por pessoas, ambientes e aprovações (o cycle time é dominado por espera, não por esforço);
- **Pressão social**: números reduzidos para agradar, ou inflados por segurança;
- **Âncoras**: o primeiro número dito contamina os demais.
Estimativas **individuais** têm erro grande; a média de várias pessoas e a **estimativa relativa** costumam melhorar.

### Estimativa relativa: pontos e tamanhos
Em vez de horas, compara-se **tamanho relativo**: "esta história é o dobro daquela". Escalas: **Fibonacci** (1, 2, 3, 5, 8, 13...), cujos saltos crescentes refletem a incerteza maior em itens grandes, ou **tamanhos de camiseta** (P, M, G). Os **pontos** combinam **esforço, complexidade e incerteza**, não são horas e **não** servem para comparar equipes. **Planning poker**: cada pessoa escolhe uma carta em segredo e todos revelam juntos; quem deu o maior e o menor valor explica; repete até convergir. O valor está na **conversa** que revela suposições diferentes, e não no número. Itens maiores que o limite (por exemplo, 8 ou 13) devem ser **divididos**.

### Estimativa de três pontos (PERT)
Para uma tarefa com **otimista** (O), **mais provável** (M) e **pessimista** (P):
- **valor esperado** = (O + 4M + P) / 6
- **desvio padrão** ≈ (P − O) / 6
Exemplos calculados: O=2, M=4, P=12 dá **esperado 5,0 e desvio 1,67** (a cauda pessimista puxa a expectativa acima do "mais provável"); O=3, M=5, P=7 dá **esperado 5,0 e desvio 0,67** (menos incerteza). Com tarefas independentes, as **variâncias somam** (some os quadrados dos desvios e extraia a raiz do total); somar os desvios diretamente superestima. O valor da técnica está em **forçar o pensamento sobre o pior caso**. Para comunicar: "5 dias, com 68 % de chance de ficar entre 3,3 e 6,7" (esperado ± 1 desvio).

### Estimar com dados: velocidade e vazão
- **Velocidade** (Scrum): pontos concluídos por Sprint. Com as últimas cinco Sprints (21, 18, 24, 20, 17), a **média é 20**; a média das últimas três (24, 20 e 17) é **20,3**. Use a velocidade para **prever a capacidade** da próxima Sprint (e não como meta nem ranking). Ela só serve para a **mesma equipe**, com escala estável.
- **Vazão** (Kanban): itens concluídos por semana. **Não estime** cada item; **conte** itens (de tamanho semelhante) e use o histórico.
- **Previsão probabilística** (Monte Carlo): sorteie semanas do histórico milhares de vezes para obter p50, p85 e p95 (aula anterior: 30 itens, p85 = 9 semanas). Fale em **intervalos**.
- Melhor ainda: um **intervalo de confiança** que **estreita** à medida que o trabalho avança.

### Como reduzir a incerteza
1. **Divida**: itens pequenos (de 1 a 3 dias) são mais previsíveis, e a soma de muitos erros pequenos tende a se compensar.
2. **Reduza o desconhecido**: faça uma **prova de conceito** com limite de tempo (*spike*) para investigar o que é muito incerto, em vez de estimar no escuro.
3. **Liste as suposições e os riscos**; revise-os.
4. **Reestime** quando aprender algo novo.
5. **Compare com projetos parecidos** (estimativa por analogia).
6. **Inclua o trabalho invisível**: revisão, testes, documentação, implantação, correção de bugs, reuniões, férias.
7. **Proteja o foco**: interrupções e troca de contexto aumentam o tempo.

### Comunicar bem
- Dê **intervalos e níveis de confiança**: "em até 9 semanas (85 %)" e não "dia 20".
- Distinga **estimativa** (previsão) de **meta** (o que queremos) e de **compromisso** (o que prometemos).
- Explicite **suposições** ("sem dependência do time de pagamentos") e **o que muda a estimativa**.
- Apresente **opções de escopo**: se o prazo é fixo, o que podemos cortar?

### Anti-padrões
- **Estimativa como promessa** e depois como punição.
- **Pontos como produtividade individual** ou comparação entre equipes.
- **Transformar pontos em horas** por uma taxa fixa.
- **Estimar tudo em detalhes** antes de começar (planejamento em cascata disfarçado).
- **Ignorar a cauda**: a tarefa "quase pronta" que consome 50 % do tempo.
- **Empurrar o prazo para trás só no fim**: sem sinais antecipados.
- **Estimar em grupo com âncora do chefe** na sala.

### Alternativas e movimentos
Há quem **evite estimar** itens individuais e use **contagem de itens + vazão** (fluxo), ou o movimento *NoEstimates*. A ideia comum: **substituir palpite por dado** sempre que possível e **decidir com mais frequência** com menos investimento em previsão detalhada.`,
  concepts: [
    { term: 'Estimativa', def: 'Previsão probabilística de esforço, prazo ou custo, sujeita a incerteza.' },
    { term: 'Viés de planejamento', def: 'Tendência a subestimar tempo e custo por imaginar o melhor caso.' },
    { term: 'Story points', def: 'Medida relativa de esforço, complexidade e incerteza de um item; não é medida de tempo.' },
    { term: 'Planning poker', def: 'Técnica de consenso em que cada pessoa revela sua estimativa ao mesmo tempo.' },
    { term: 'PERT', def: 'Estimativa por três pontos: valor esperado = (otimista + 4 × mais provável + pessimista) / 6.' },
    { term: 'Velocidade', def: 'Pontos concluídos por Sprint; serve para prever a capacidade da própria equipe.' },
    { term: 'Spike', def: 'Investigação curta com limite de tempo para reduzir uma incerteza técnica.' },
    { term: 'Cone da incerteza', def: 'Ideia de que a faixa de erro das estimativas diminui conforme o projeto avança.' },
    { term: 'Intervalo de confiança', def: 'Faixa de valores com uma probabilidade associada de conter o resultado real.' },
    { term: 'Estimativa x meta x compromisso', def: 'Previsão do que provavelmente acontece, desejo e promessa assumida, que não devem ser confundidos.' }
  ],
  examples: R`**Analogia:** estimar um trabalho de software é como **prever a hora de chegada de uma viagem de carro com trânsito desconhecido**: "entre 1h e 1h40, quase certo até 1h30" é honesto e útil; "chego às 15h02" é uma promessa que o trânsito vai quebrar. Quem já fez a rota 20 vezes (histórico) prevê melhor do que quem chuta.

**Exemplo PERT (valores calculados em Node.js 26):**
- tarefa 1 (O=2, M=4, P=12): esperado **5,0** dias, desvio **1,67**;
- tarefa 2 (O=3, M=5, P=7): esperado **5,0** dias, desvio **0,67**;
- as duas somadas: esperado **10 dias**, desvio combinado √(1,67² + 0,67²) ≈ **1,8** (e não 2,3 da soma simples dos desvios).

**Exemplo de comunicação:** "A funcionalidade de relatórios deve ficar pronta em **8 a 10 semanas** (85 % de confiança em 9). Suposições: a API de dados estará pronta na semana 3 e teremos um designer 50 % do tempo. Se cortarmos a exportação em PDF, o p85 cai para 7 semanas."

**Caso real:** uma equipe estimava em horas e errava em média por 60 %. Passou a (1) dividir tudo em histórias de 1 a 3 dias, (2) contar histórias concluídas por semana e (3) prever por Monte Carlo com o histórico das últimas 12 semanas. O erro caiu e as conversas com o cliente mudaram de "quando fica pronto?" para "qual escopo cabe neste prazo?" (cenário didático, sem medições reais).`,
  code: [
    { title: 'PERT e soma de variâncias (executado em Node.js 26)', lang: 'javascript', code: R`const pert = (o, m, p) => ({ esperado: +((o + 4 * m + p) / 6).toFixed(2), desvio: +((p - o) / 6).toFixed(2) });
const t1 = pert(2, 4, 12), t2 = pert(3, 5, 7);
console.log(t1, t2);                                              // { esperado: 5, desvio: 1.67 } { esperado: 5, desvio: 0.67 }

const soma = (ts) => ({
  esperado: ts.reduce((s, t) => s + t.esperado, 0),
  desvio: +Math.sqrt(ts.reduce((s, t) => s + t.desvio ** 2, 0)).toFixed(2)   // variâncias somam, desvios não
});
const total = soma([t1, t2]);
console.log(total);                                               // { esperado: 10, desvio: 1.8 }
console.log('faixa de ~68 %:', total.esperado - total.desvio, 'a', total.esperado + total.desvio);   // 8.2 a 11.8

const velocidades = [21, 18, 24, 20, 17];
const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;
console.log(media(velocidades), media(velocidades.slice(-3)).toFixed(1));   // 20 '20.3'`, notes: [{ l: '1', t: 'Fórmulas do PERT: (O + 4M + P) / 6 e (P - O) / 6.' }, { l: '6', t: 'Para tarefas independentes somam-se as variâncias (quadrado do desvio).' }, { l: '11', t: 'Faixa de aproximadamente 68 % (± 1 desvio) sob a aproximação normal.' }, { l: '15', t: 'Saída observada: 20 e 20.3.' }] }
  ],
  bestPractices: ['Estime só quando a decisão depender disso e comunique intervalos com nível de confiança.', 'Divida o trabalho em itens pequenos e use dados históricos de vazão ou velocidade.', 'Faça spikes com limite de tempo para as incertezas técnicas maiores.', 'Liste suposições e riscos e reestime ao aprender algo novo.', 'Inclua o trabalho invisível (revisão, testes, implantação, documentação).', 'Separe estimativa, meta e compromisso, e nunca use pontos para avaliar pessoas.'],
  mistakes: ['Dar um número único e tratá-lo como promessa.', 'Converter pontos em horas e comparar equipes por velocidade.', 'Estimar tudo antes de começar, em detalhes falsos.', 'Ignorar a cauda do pior caso e as dependências externas.', 'Deixar o chefe ancorar a estimativa na sala.', 'Esconder o atraso até o fim, sem sinais antecipados.'],
  market: `Previsão de entregas é uma das conversas mais frequentes entre engenharia, produto e clientes, e profissionais que apresentam intervalos, riscos e opções de escopo, apoiados em dados, constroem confiança. Técnicas como previsão probabilística por vazão e estimativa relativa fazem parte do repertório esperado de líderes técnicos e gerentes de produto.`,
  summary: `Estimativa é previsão sob incerteza, não promessa. Humanos subestimam (viés de planejamento); técnicas úteis: tamanho relativo (pontos, planning poker), três pontos (PERT: esperado e desvio, com variâncias somando) e dados históricos (velocidade, vazão e Monte Carlo). Reduza a incerteza dividindo o trabalho, fazendo spikes e reestimando. Comunique intervalos e suposições; separe estimativa, meta e compromisso, e não use pontos para avaliar pessoas.`,
  refs: [REF2.fowlerEst, REF2.scrum, REF2.kanbanGuide],
  cards: [
    { q: 'Qual a fórmula do valor esperado do PERT?', a: '(otimista + 4 × mais provável + pessimista) / 6.' },
    { q: 'Por que somar variâncias e não desvios ao combinar tarefas independentes?', a: 'Os erros se compensam parcialmente; somar os desvios superestima a incerteza combinada.' },
    { q: 'Os story points medem o quê?', a: 'Tamanho relativo (esforço, complexidade e incerteza) para planejamento da própria equipe; não são horas nem medida de desempenho individual.' },
    { q: 'Como comunicar uma previsão de forma honesta?', a: 'Como um intervalo com nível de confiança e suposições explícitas, por exemplo "até 9 semanas, com 85 % de confiança".' }
  ]
}
];
