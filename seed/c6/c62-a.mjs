// C6.2 — CI/CD e GitHub Actions. Aulas 1 e 2 (conceitos; GitHub Actions).
const R = String.raw;

export const REF = {
  fowlerCI: { title: 'Martin Fowler — Continuous Integration', url: 'https://martinfowler.com/articles/continuousIntegration.html', kind: 'artigo' },
  fowlerPipeline: { title: 'Martin Fowler — Deployment Pipeline', url: 'https://martinfowler.com/bliki/DeploymentPipeline.html', kind: 'artigo' },
  dora: { title: 'DORA — Software delivery performance metrics', url: 'https://dora.dev/guides/dora-metrics-four-keys/', kind: 'guia' },
  trunk: { title: 'Trunk Based Development', url: 'https://trunkbaseddevelopment.com/', kind: 'guia' },
  ghaDocs: { title: 'GitHub Docs — Understanding GitHub Actions', url: 'https://docs.github.com/en/actions/get-started/understand-github-actions', kind: 'doc' },
  ghaSyntax: { title: 'GitHub Docs — Workflow syntax for GitHub Actions', url: 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax', kind: 'doc' },
  ghaSecurity: { title: 'GitHub Docs — Secure use reference', url: 'https://docs.github.com/en/actions/reference/security/secure-use', kind: 'guia' },
  ghaCache: { title: 'GitHub Docs — Dependency caching', url: 'https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching', kind: 'doc' },
  ghaOidc: { title: 'GitHub Docs — OpenID Connect', url: 'https://docs.github.com/en/actions/concepts/security/openid-connect', kind: 'doc' },
  actionlint: { title: 'actionlint — Static checker for GitHub Actions workflows', url: 'https://github.com/rhysd/actionlint', kind: 'ferramenta' }
};

export const lessonsA = [
{
  id: 'cicd-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['CI', 'CD', 'pipeline', 'DORA', 'trunk-based', 'artefatos', 'shift-left'],
  title: 'Conceitos de CI/CD: integração contínua, entrega contínua e o pipeline como contrato de qualidade',
  objectives: ['Diferenciar integração contínua, entrega contínua e implantação contínua', 'Desenhar os estágios de um pipeline com feedback rápido e artefato imutável', 'Relacionar práticas (trunk-based, testes, feature flags) às métricas DORA', 'Reconhecer antipadrões: pipeline lento, instável ou que ninguém respeita'],
  intro: R`Entre o **commit** de uma pessoa e o **código rodando em produção** existe um caminho. Em equipes imaturas ele é **manual, raro e assustador** ("sexta-feira ninguém faz deploy"). **CI/CD** transforma esse caminho em um **processo automático, repetível e frequente**: cada mudança é **integrada, construída, testada e entregue** do mesmo jeito, e o **pipeline** passa a ser o **contrato de qualidade** da equipe. Esta aula explica **o que cada sigla promete**, como **desenhar um pipeline** e **como saber se ele funciona**.`,
  theory: R`### As três ideias por trás das siglas
- **Integração contínua (CI):** os desenvolvedores **integram o trabalho no ramo principal várias vezes ao dia**, e **cada integração dispara um build e testes automáticos**. O objetivo não é "ter uma ferramenta de CI", e sim **descobrir conflitos e defeitos em minutos, não em semanas** (Fowler). Sem integração frequente, a ferramenta só **automatiza o atraso**.
- **Entrega contínua (continuous delivery):** **todo commit que passa no pipeline é um candidato a release**, **pronto para ir à produção** a qualquer momento; **a decisão de publicar** é de negócio e **pode ser um clique**.
- **Implantação contínua (continuous deployment):** **toda mudança aprovada pelo pipeline vai à produção sozinha**, sem aprovação humana. **Exige** testes confiáveis, **observabilidade** e **estratégias de liberação gradual** (aula 4).
**Resumo:** CI = **integrar e verificar**; entrega contínua = **sempre pronto para publicar**; implantação contínua = **publicar automaticamente**.

### Anatomia de um pipeline
Um pipeline é uma **sequência de estágios** em que **cada um aumenta a confiança** e **o custo**; **falhas baratas aparecem primeiro** (*shift-left*):
1. **Commit/lint/formatação** (segundos): **análise estática**, **verificação de tipos**, **actionlint** nos workflows.
2. **Build** (minutos): **compilar/empacotar** e **produzir o artefato** (imagem de contêiner, pacote).
3. **Testes rápidos** (unitários, de contrato) **em paralelo**; depois **integração** (com banco e cache em contêineres, como no curso anterior).
4. **Segurança**: **dependências vulneráveis**, **segredos vazados**, **varredura de imagem** (SAST/SCA).
5. **Publicação do artefato** em um **registro** (**uma vez**, com **tag imutável** e/ou **digest**).
6. **Implantação** em **homologação** (testes de fumaça, ponta a ponta) e **em produção** (estratégia gradual, **verificação pós-deploy** e **rollback**).
**Princípios:** **construa uma vez, implante em todo lugar** (**o mesmo artefato** passa por todos os ambientes; **muda só a configuração**); **o pipeline é código** (versionado e revisado); **falhou, parou** (ninguém "ignora e segue"); **feedback rápido** (**o primeiro sinal em até ~10 minutos** é um alvo comum, não uma lei).

### Práticas que fazem o pipeline valer a pena
- **Trunk-based development:** **ramos curtos** (horas ou 1–2 dias) **integrados ao tronco**; **ramos longos** viram **"integração em lote"**, o oposto de CI.
- **Feature flags:** **separam implantação de liberação**: **o código vai à produção desligado** e **é ligado gradualmente**, o que **reduz o tamanho do risco** de cada deploy.
- **Testes confiáveis:** **testes instáveis (flaky)** **destroem a confiança**: **conserte ou remova**, **não** reexecute até passar.
- **Mudanças pequenas e frequentes:** **lotes pequenos** são **mais fáceis de revisar, testar e reverter**.
- **Bancos de dados:** **migrações compatíveis para frente e para trás** (**expandir e contrair**), para **permitir rollback do código** sem **rollback do esquema**.

### Medindo: as métricas DORA
O programa **DORA** correlacionou **desempenho de entrega** com **resultados de negócio** e consolidou **quatro métricas**:
| Métrica | O que mede |
|---|---|
| **Frequência de implantação** | **quantas vezes por dia/semana** se publica |
| **Tempo de entrega (lead time)** | do **commit** à **produção** |
| **Taxa de falha de mudança** | **% de deploys** que causam **incidente ou rollback** |
| **Tempo de recuperação** | **quanto leva** para **restaurar o serviço** após falha |
**Leitura correta:** as quatro **andam juntas**: **equipes que publicam mais vezes também falham menos** e **recuperam mais depressa**, porque **lotes pequenos** são **mais seguros**. **Cuidado:** **métrica vira meta e deixa de medir** (Lei de Goodhart): use-as **para melhorar o sistema**, não **para ranquear pessoas**.

### Antipadrões
- **Pipeline lento** (**40 min+**): **ninguém espera**, **empilham-se commits**, **a falha aparece tarde**. **Paralelize**, **use cache**, **rode só o que mudou**, **divida em estágios**.
- **Pipeline instável:** **falhas aleatórias** **ensinam a ignorar vermelho**.
- **Build diferente por ambiente** ("compilar em produção"): **quebra a reprodutibilidade**.
- **Segredos no repositório ou nos logs.**
- **Etapa manual escondida** (alguém **edita um arquivo no servidor**): **o pipeline mente**.
- **"Pipeline de deploy" sem verificação nem rollback**: **só automatiza o erro**.

### Neste curso
Aula 2 (**GitHub Actions**: **workflows, jobs, matriz, cache, segurança**), aula 3 (**pipelines de deploy** com **ambientes e aprovações**) e aula 4 (**blue-green e canary**, **executados** com nginx). **Honestidade:** **os workflows foram verificados com o actionlint, mas não rodaram em um GitHub real**.`,
  concepts: [
    { term: 'Integração contínua (CI)', def: 'Prática de integrar o trabalho ao ramo principal com frequência, verificando cada integração por build e testes automáticos.' },
    { term: 'Entrega contínua', def: 'Capacidade de manter todo commit aprovado pronto para ir à produção, com a decisão de publicar sob controle do negócio.' },
    { term: 'Implantação contínua', def: 'Publicação automática em produção de toda mudança que passa no pipeline, sem aprovação humana.' },
    { term: 'Pipeline', def: 'Sequência automatizada de estágios (build, testes, segurança, publicação, implantação) que leva um commit à produção.' },
    { term: 'Artefato imutável', def: 'Pacote ou imagem construído uma vez e promovido entre ambientes sem ser reconstruído.' },
    { term: 'Shift-left', def: 'Mover verificações para o começo do processo, onde as falhas são mais baratas de achar e corrigir.' },
    { term: 'Métricas DORA', def: 'Quatro medidas de desempenho de entrega: frequência de implantação, tempo de entrega, taxa de falha de mudança e tempo de recuperação.' },
    { term: 'Feature flag', def: 'Chave que liga ou desliga uma funcionalidade em tempo de execução, separando implantação de liberação.' }
  ],
  examples: R`**Analogia:** o pipeline é a **linha de montagem de uma fábrica com inspeção em cada posto**: **peças defeituosas são barradas cedo** (baratas), **o produto final sai igual toda vez** e **a esteira para quando algo está errado**; **entrega contínua** é **ter o carro sempre pronto na garagem**, e **implantação contínua** é **a esteira entregar o carro ao cliente sozinha**.

**Exemplo concreto:** uma equipe publicava **a cada 3 semanas**, com **lotes de ~120 commits** e **2 em cada 5 releases causando incidente**. Passou a **integrar ao tronco todo dia**, a **rodar testes em cada push** e a **publicar por feature flag**: **lotes de 3 a 8 commits**, **publicação diária**, **incidentes raros e rollbacks de minutos**. (**Cenário ilustrativo**, não um estudo: os números **não** são medições deste curso.)`,
  code: [
    { title: 'Pipeline como estágios com portões (esboço independente de ferramenta)', lang: 'yaml', code: R`# Cada estágio só roda se o anterior passou (portões)
estagios:
  - nome: verificar        # segundos: barato e primeiro
    passos: [lint, tipos, actionlint]
  - nome: construir        # minutos
    passos: [build-da-imagem]
    produz: imagem@sha256  # artefato imutável
  - nome: testar           # em paralelo
    paralelo: [unitarios, integracao, contrato]
  - nome: seguranca
    passos: [dependencias, segredos, varredura-da-imagem]
  - nome: publicar         # uma vez
    passos: [push-para-registro]
  - nome: homologacao
    passos: [deploy, teste-de-fumaca]
  - nome: producao
    exige: [aprovacao]     # entrega contínua; remova para implantação contínua
    passos: [deploy-gradual, verificacao, rollback-automatico]`, notes: [{ l: 2, t: 'Falhas baratas primeiro: o feedback chega em segundos.' }, { l: 9, t: 'O artefato é construído uma vez e promovido.' }, { l: 20, t: 'A aprovação distingue entrega de implantação contínua.' }] }
  ],
  bestPractices: ['Construa o artefato uma vez e promova o mesmo artefato entre ambientes.', 'Ponha as verificações baratas primeiro e rode testes em paralelo.', 'Integre ao tronco com frequência e use feature flags para separar implantação de liberação.', 'Trate testes instáveis como defeitos: conserte ou remova.', 'Meça as quatro métricas DORA para melhorar o sistema, não para ranquear pessoas.', 'Projete migrações de banco compatíveis com rollback do código.', 'Mantenha o pipeline como código, versionado e revisado.'],
  mistakes: ['Ter ferramenta de CI mas ramos longos que integram em lote.', 'Pipeline lento que ninguém espera.', 'Reexecutar até passar em vez de consertar o teste instável.', 'Reconstruir o artefato a cada ambiente.', 'Etapa manual escondida fora do pipeline.', 'Automatizar o deploy sem verificação nem rollback.'],
  market: R`**CI/CD** é **requisito quase universal** em vagas de **desenvolvimento, DevOps e SRE**; entrevistas pedem para **desenhar um pipeline**, explicar **entrega x implantação contínua** e **citar métricas DORA**.`,
  summary: R`CI integra e verifica com frequência; entrega contínua mantém tudo pronto para publicar; implantação contínua publica automaticamente. Um pipeline organiza estágios que aumentam a confiança (verificar, construir, testar, segurança, publicar, homologar, produzir), com artefato imutável construído uma vez e feedback rápido. Trunk-based, feature flags, testes confiáveis e lotes pequenos sustentam o processo, e as métricas DORA (frequência, lead time, taxa de falha, recuperação) medem o resultado. Os exemplos da aula são ilustrativos e nenhum pipeline real foi executado nesta aula.`,
  refs: [REF.fowlerCI, REF.fowlerPipeline, REF.dora, REF.trunk],
  cards: [
    { q: 'Qual a diferença entre entrega contínua e implantação contínua?', a: 'Na entrega contínua todo commit aprovado fica pronto para publicar, com decisão humana; na implantação contínua a publicação em produção é automática.' },
    { q: 'O que significa construir uma vez e implantar em todo lugar?', a: 'O mesmo artefato (imagem, pacote) é promovido entre ambientes; só a configuração muda, preservando a reprodutibilidade.' },
    { q: 'Quais são as quatro métricas DORA?', a: 'Frequência de implantação, tempo de entrega (lead time), taxa de falha de mudança e tempo de recuperação.' },
    { q: 'Por que feature flags ajudam o CI/CD?', a: 'Separam implantação de liberação: o código vai à produção desligado e é ligado gradualmente, reduzindo o risco por deploy.' }
  ]
},
{
  id: 'cicd-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['GitHub Actions', 'workflow', 'jobs', 'matriz', 'cache', 'permissions', 'secrets', 'actionlint', 'injeção de script'],
  title: 'GitHub Actions: workflows, jobs, matriz, cache e segurança, verificados com o actionlint',
  objectives: ['Escrever workflows com eventos, jobs, passos, matriz, cache e concorrência', 'Aplicar o princípio do menor privilégio com permissions e segredos', 'Evitar injeção de script e fixar versões de ações', 'Validar workflows estaticamente com o actionlint e interpretar os achados'],
  intro: R`O **GitHub Actions** executa **workflows** definidos em **arquivos YAML** do repositório, **disparados por eventos** (push, pull request, agenda, manual). É a **ferramenta de CI/CD mais usada** em projetos no GitHub, e também **uma superfície de ataque**: **um workflow mal escrito** pode **vazar segredos** ou **executar código de terceiros**. Nesta aula você **escreve workflows corretos**, **aprende os cuidados de segurança** e **vê o actionlint apontar 4 defeitos reais** em um arquivo de prova.`,
  theory: R`### Modelo mental
- **Workflow:** arquivo §.github/workflows/*.yml§ (**um por finalidade**: §ci.yml§, §deploy.yml§).
- **Evento (§on§):** o gatilho: §push§, §pull_request§, §schedule§ (cron), §workflow_dispatch§ (manual), §release§, §workflow_call§ (**reutilizável**).
- **Job:** **conjunto de passos** em **uma máquina (runner)** limpa; **jobs rodam em paralelo** por padrão e **dependem uns dos outros** com §needs§.
- **Passo (§steps§):** **um comando** (§run§) **ou uma ação** (§uses§) **reutilizável** (§actions/checkout@v4§).
- **Runner:** a **máquina** (§ubuntu-24.04§ hospedado pelo GitHub, ou **auto-hospedado**).
- **Contexto e expressões:** §DOLAR{{ github.sha }}§, §DOLAR{{ matrix.node }}§, §DOLAR{{ secrets.X }}§, §DOLAR{{ needs.build.outputs.v }}§.

### O workflow do laboratório (ci.yml)
**Dois jobs**: §test§ (**matriz** com **Node 22 e 24**: **2 execuções em paralelo**) e §build§ (§needs: test§, **só roda se os testes passarem**). Elementos de qualidade usados:
- §permissions: contents: read§ **no topo** (**menor privilégio**: **o §GITHUB_TOKEN§ só lê**); o job §build§ **acrescenta** §packages: write§ **só onde precisa**;
- §concurrency§ com §cancel-in-progress: true§: **um novo push cancela a execução antiga da mesma ref** (**economiza minutos** e **evita corridas**);
- §timeout-minutes: 10§: **um job travado não consome horas**;
- §actions/setup-node§ com §cache: npm§: **reaproveita o cache de dependências** (a chave vem do **hash do lockfile**);
- §npm ci§ (**instalação reprodutível a partir do lockfile**) em vez de §npm install§.
**Resultado medido:** o **actionlint 1.7.12** **aprovou** o arquivo (**saída vazia**, **exit 0**). **Atenção:** isso **prova a sintaxe e as referências**, **não** que os testes **passam** nem que o workflow **rodou**: **não houve execução no GitHub**.

### Segurança em primeiro lugar
1. **Menor privilégio:** **declare §permissions§** (o padrão do repositório pode ser amplo). **Dê só o necessário a cada job.**
2. **Segredos:** guarde em **§secrets§** (**nunca no repositório**), **mascarados nos logs**; **evite passar por argumentos de linha de comando** e **não imprima**. **Prefira credenciais efêmeras via OIDC** (aula 3) **a chaves de longa duração**.
3. **Injeção de script:** **expressões §DOLAR{{ }}§ são substituídas ANTES do shell**; **se o valor vem de entrada controlada por terceiros** (**título de issue, nome de ramo, corpo de PR**), **um atacante injeta comandos**. **Correto:** **passar por variável de ambiente** (§env:§) **e usar §"$VAR"§** no script. **Medido:** o actionlint **sinalizou** §echo "DOLAR{{ github.event.issue.title }}"§ como **"potencialmente não confiável"**.
4. **Ações de terceiros:** **são código executado com seu token**. **Fixe pelo SHA do commit** (§uses: org/acao@<sha40>§) **em ações não oficiais** (tags **podem ser movidas**); **revise** e **use o Dependabot** para atualizar.
5. **§pull_request_target§ e §workflow_run§:** **rodam com segredos e permissões do repositório base**; **nunca faça checkout e execute código de um fork** nesses eventos.
6. **Runners auto-hospedados:** **não use em repositórios públicos** sem isolamento; **jobs persistem estado** entre execuções.

### Desempenho e custo
- **Cache** (§actions/cache§, **setup-*** com §cache§) e **artefatos** (§upload-artifact§/§download-artifact§) **para passar saídas entre jobs**.
- **Matriz** (§strategy.matrix§): **combinações** (SO × versão); §fail-fast§ **cancela** as demais ao primeiro erro; §include/exclude§ **ajustam** combinações.
- **Filtros** (§paths§, §branches§) **evitam rodar o que não mudou**.
- **Workflows reutilizáveis** (§workflow_call§) e **ações compostas** **eliminam cópia e cola**.
- **Minutos são cobrados** em repositórios privados (**limites por plano**): **concurrency + timeouts + filtros** **controlam o custo**.

### Validando com o actionlint (medido)
O arquivo §defeituoso.yml§ **continha 4 defeitos**, e o **actionlint 1.7.12** **encontrou todos** (**exit 1**):
| Linha | Achado | Categoria |
|---|---|---|
| 4 | chave inexistente §branchs§ (**o correto é §branches§**) | syntax-check |
| 10 | §github.event.issue.title§ **potencialmente não confiável** em script inline | expression (**segurança**) |
| 11 | **propriedade §steps.inexistente§ não definida** | expression |
| 12 | job §deploy§ **depende de §compilar§**, **que não existe** | job-needs |
**Lição:** **um erro de digitação** em §branchs§ **faria o workflow nunca disparar** **sem nenhum aviso** do GitHub; **o lint pega antes do commit**. **Rode o actionlint no CI e no hook de pre-commit.** **Limite:** ele **não valida a lógica** (**o comando faz o que se espera?**) **nem a semântica de ações externas** além de seus metadados.

### Reutilização e organização
Para **vários repositórios**: **workflows reutilizáveis** (§uses: org/repo/.github/workflows/ci.yml@v1§) **com entradas e segredos explícitos**; **ações compostas** **para agrupar passos**; **modelos de workflow** **da organização**. **Ambientes** (§environment:§) e **regras de proteção** aparecem na **aula 3**.`,
  concepts: [
    { term: 'Workflow', def: 'Arquivo YAML em .github/workflows que define jobs disparados por eventos no GitHub Actions.' },
    { term: 'Job', def: 'Conjunto de passos executados em um runner; jobs rodam em paralelo, salvo dependência por needs.' },
    { term: 'Runner', def: 'Máquina que executa os jobs, hospedada pelo GitHub ou auto-hospedada.' },
    { term: 'Matriz de build', def: 'Estratégia que executa o mesmo job com combinações de variáveis, como versões de Node.' },
    { term: 'GITHUB_TOKEN', def: 'Token temporário criado para cada execução, cujas permissões são controladas por permissions.' },
    { term: 'Injeção de script', def: 'Ataque em que dados controlados por terceiros inseridos por expressão em um run executam comandos arbitrários.' },
    { term: 'OIDC', def: 'Mecanismo que troca a identidade do workflow por credenciais temporárias de um provedor, sem segredos de longa duração.' },
    { term: 'actionlint', def: 'Verificador estático de workflows do GitHub Actions, que detecta erros de sintaxe, expressões e dependências.' }
  ],
  examples: R`**Analogia:** o workflow é **uma receita de cozinha industrial**: **cada job é uma bancada com ferramentas limpas** (runner), **o §needs§ é a ordem das etapas** e **as §permissions§ são as chaves de cada bancada**: **quem prepara a massa não precisa da chave do cofre**. **Injeção de script** é **o cliente que escreve no pedido "e jogue o caixa no lixo" e a cozinha obedece**.

**Exemplo concreto (medido):** o §defeituoso.yml§ tem **uma chave digitada errada** (§branchs§), **uma expressão perigosa**, **uma referência a passo inexistente** e **uma dependência de job inexistente**; o **actionlint 1.7.12 listou os 4** com **linha e coluna**, e o §ci.yml§ correto **passou limpo**.`,
  code: [
    { title: 'ci.yml do laboratório: matriz, cache, concorrência e menor privilégio (aprovado pelo actionlint 1.7.12)', lang: 'yaml', code: R`name: ci
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
concurrency:
  group: ci-DOLAR{{ github.ref }}
  cancel-in-progress: true
jobs:
  test:
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    strategy:
      matrix:
        node: [22, 24]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: DOLAR{{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
  build:
    needs: test
    runs-on: ubuntu-24.04
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:DOLAR{{ github.sha }} .`, notes: [{ l: 6, t: 'Menor privilégio: o token só lê o conteúdo.' }, { l: 9, t: 'Um novo push cancela a execução antiga da mesma ref.' }, { l: 16, t: 'Duas execuções em paralelo (Node 22 e 24).' }, { l: 27, t: 'build só roda se test passar.' }] },
    { title: 'Forma segura de usar um valor não confiável (variável de ambiente em vez de expressão no script)', lang: 'yaml', code: R`# PERIGOSO: a expressão é substituída antes do shell
# - run: echo "DOLAR{{ github.event.issue.title }}"

# SEGURO: o valor chega como variável de ambiente e é citado
- name: Registrar título
  env:
    TITULO: DOLAR{{ github.event.issue.title }}
  run: echo "$TITULO"`, notes: [{ l: 2, t: 'Foi o que o actionlint sinalizou no arquivo defeituoso.' }, { l: 7, t: 'O shell trata o conteúdo como dado, não como comando.' }] },
    { title: 'Saída real do actionlint 1.7.12 no arquivo defeituoso (resumida)', lang: 'text', code: R`defeituoso.yml:4:5: unexpected key "branchs" for "push" section ... [syntax-check]
defeituoso.yml:10:24: "github.event.issue.title" is potentially untrusted ... [expression]
defeituoso.yml:11:23: property "inexistente" is not defined in object type {} [expression]
defeituoso.yml:12:3: job "deploy" needs job "compilar" which does not exist in this workflow [job-needs]
exit=1`, notes: [{ l: 1, t: 'Um erro de digitação faria o workflow nunca disparar.' }, { l: 5, t: 'Exit 1 faz o pipeline de lint falhar.' }] }
  ],
  bestPractices: ['Declare permissions mínimas no topo e amplie só no job que precisa.', 'Passe dados não confiáveis por variáveis de ambiente, nunca por expressão dentro do script.', 'Fixe ações de terceiros pelo SHA do commit e atualize com o Dependabot.', 'Use cache de dependências, concurrency com cancelamento e timeout em todos os jobs.', 'Use npm ci e artefatos para passar saídas entre jobs.', 'Rode o actionlint no CI e no pre-commit.', 'Prefira OIDC a segredos de longa duração e nunca execute código de forks em pull_request_target.'],
  mistakes: ['Deixar o GITHUB_TOKEN com permissões amplas por padrão.', 'Interpolar título de issue ou nome de ramo direto em run.', 'Usar ações de terceiros por tag móvel sem revisão.', 'Checkout e execução de código de fork em pull_request_target.', 'Não ter timeout nem concurrency e gastar minutos à toa.', 'Achar que o actionlint aprovado significa que o workflow funciona.'],
  market: R`**GitHub Actions** é **pedido em quase toda vaga** de **dev e DevOps**; **segurança de pipeline** (**injeção, permissões, supply chain**) **é diferencial**, após **ataques reais à cadeia de suprimentos**.`,
  summary: R`O GitHub Actions executa workflows YAML disparados por eventos, com jobs em runners, passos e ações. O ci.yml do laboratório usa matriz (Node 22 e 24), cache, concurrency com cancelamento, timeout e permissions mínimas, e o actionlint 1.7.12 o aprovou (saída vazia). Em um arquivo defeituoso o actionlint achou 4 problemas: chave branchs inexistente, expressão não confiável em script, passo inexistente e needs para job inexistente. Segurança: menor privilégio, segredos, valores não confiáveis por variável de ambiente, ações fixadas por SHA e cuidado com pull_request_target. Nenhum workflow rodou em um GitHub real.`,
  refs: [REF.ghaDocs, REF.ghaSyntax, REF.ghaSecurity, REF.ghaCache, REF.actionlint],
  cards: [
    { q: 'Por que declarar permissions no workflow?', a: 'Para aplicar o menor privilégio ao GITHUB_TOKEN; o padrão do repositório pode ser amplo e ampliar o impacto de um comprometimento.' },
    { q: 'Como evitar injeção de script?', a: 'Não interpolar dados não confiáveis (título de issue, nome de ramo) em run; passá-los por env e usar a variável entre aspas no shell.' },
    { q: 'O que o actionlint achou no arquivo defeituoso?', a: 'Quatro problemas: chave branchs inexistente, expressão github.event.issue.title não confiável, steps.inexistente e needs para job inexistente.' },
    { q: 'Por que fixar ações de terceiros pelo SHA?', a: 'Tags podem ser movidas; o SHA do commit é imutável e evita receber código alterado.' }
  ]
}
];
