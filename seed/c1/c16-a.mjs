// C1.6 — Fluxo profissional e agilidade. Aulas 1 a 3 (Pull Requests, code review, documentação técnica).
const R = String.raw;

export const REF = {
  ghPr: { title: 'GitHub Docs — About pull requests', url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests', kind: 'doc' },
  ghMerge: { title: 'GitHub Docs — About merge methods on GitHub', url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github', kind: 'doc' },
  ghTemplate: { title: 'GitHub Docs — Creating a pull request template', url: 'https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository', kind: 'doc' },
  ghReview: { title: 'GitHub Docs — Reviewing proposed changes in a pull request', url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request', kind: 'doc' },
  ghOwners: { title: 'GitHub Docs — About code owners', url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners', kind: 'doc' },
  googleReview: { title: 'Google Engineering Practices — Code Review', url: 'https://google.github.io/eng-practices/review/', kind: 'doc' },
  convCommits: { title: 'Conventional Commits 1.0.0', url: 'https://www.conventionalcommits.org/en/v1.0.0/', kind: 'spec' },
  semver: { title: 'Semantic Versioning 2.0.0', url: 'https://semver.org/lang/pt-BR/', kind: 'spec' },
  keepChangelog: { title: 'Keep a Changelog 1.1.0', url: 'https://keepachangelog.com/pt-BR/1.1.0/', kind: 'doc' },
  adr: { title: 'Architecture Decision Records (adr.github.io)', url: 'https://adr.github.io/', kind: 'doc' },
  nygardAdr: { title: 'Michael Nygard — Documenting Architecture Decisions', url: 'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions', kind: 'article' },
  diataxis: { title: 'Diátaxis — a systematic approach to technical documentation', url: 'https://diataxis.fr/', kind: 'doc' },
  writeTheDocs: { title: 'Write the Docs — Documentation Guide', url: 'https://www.writethedocs.org/guide/', kind: 'doc' },
  mermaid: { title: 'Mermaid — diagramas como código', url: 'https://mermaid.js.org/', kind: 'doc' },
  gitRequestPull: { title: 'Git — git-request-pull', url: 'https://git-scm.com/docs/git-request-pull', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'flx-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['pull request', 'git', 'merge', 'squash', 'rebase'],
  title: 'Pull Requests: do commit ao merge com histórico limpo',
  objectives: ['Explicar o que é um Pull Request e como ele organiza a colaboração', 'Preparar um PR pequeno, focado e com descrição útil (contexto, mudança, como testar)', 'Comparar merge commit, squash e rebase e prever o histórico resultante', 'Escrever mensagens de commit no padrão Conventional Commits e derivar a versão semântica', 'Configurar proteções de ramo, verificações obrigatórias e modelos de PR'],
  intro: `Em quase toda equipe, ninguém envia código direto para o ramo principal: propõe-se a mudança em um **Pull Request (PR)** (ou *Merge Request* no GitLab), que reúne o código, a conversa, as verificações automáticas e a decisão de integrar. Um bom PR faz o revisor entender **o que mudou e por quê** em poucos minutos; um ruim vira uma discussão de dias. Esta aula usa Git de verdade: os históricos mostrados foram gerados em um repositório de teste com Git 2.53. As operações específicas do GitHub (botões, proteções) seguem a documentação oficial e **não foram executadas aqui**, pois exigem conta e repositório remoto.`,
  theory: `### O que é um Pull Request
Um PR é um **pedido para integrar** os commits de um ramo (origem) em outro (destino, normalmente §main§). Ele não é um recurso do Git em si, e sim da plataforma (GitHub, GitLab, Bitbucket), mas **o conteúdo é Git**. O Git tem um comando equivalente, §git request-pull§, que gera o resumo "buscar estas mudanças deste repositório"; a plataforma acrescenta interface, comentários, verificações e permissões. Cada PR tem:
- **título e descrição** (o *porquê*);
- **commits** e **diff** (o *quê*);
- **conversa** e **revisões** (aprovar, pedir mudanças, comentar);
- **verificações** (CI: testes, lint, build, segurança);
- **estado**: rascunho (*draft*), aberto, aprovado, mesclado, fechado.

### Fluxo típico
1. atualizar o ramo principal e criar um ramo curto: §git switch -c feat/subtracao§;
2. fazer commits pequenos e coerentes; **rodar testes e lint localmente**;
3. publicar: §git push -u origin feat/subtracao§ e abrir o PR (um *draft* se ainda não está pronto);
4. responder à revisão com novos commits (ou reescrever o histórico, conforme a política);
5. quando aprovado e verde, **integrar** (mesclar) e apagar o ramo.
Para ver o que o revisor verá, use §git diff --stat main...feat/subtracao§ (os três pontos comparam com o ancestral comum) e §git log --oneline main..feat/subtracao§. No repositório de teste, o resumo foi: 2 arquivos, 2 inserções e 1 commit à frente de §main§.

### Um bom PR
- **Pequeno e focado**: uma mudança lógica. Revisões acima de algumas centenas de linhas têm pior qualidade, pois o revisor se cansa. Se não dá para dividir, explique a ordem de leitura.
- **Descrição com contexto**: problema, solução, alternativas descartadas, riscos, como testar (comandos e passos), capturas de tela ou saídas, issue relacionada (§Closes #123§).
- **Verde antes de pedir revisão**: CI passando, sem mudanças de formatação misturadas à lógica.
- **Sem segredos** nem arquivos gerados no diff.
- **Mudanças de comportamento acompanhadas de testes e documentação**.
Um **modelo de PR** (§.github/PULL_REQUEST_TEMPLATE.md§) padroniza esses itens com uma lista de verificação.

### Estratégias de integração
No repositório de teste, o ramo §main§ avançou depois que a feature foi criada, e a feature teve dois commits. O resultado de cada estratégia:
- **Merge commit** (§--no-ff§): cria um commit de mesclagem com dois pais e **preserva** o histórico real. Gráfico: o desvio e o encontro das duas linhas, com o §Merge feat/x§ no topo e os dois commits da feature intactos.
- **Squash merge**: **achata** os commits da feature em **um** commit novo em §main§. O histórico fica linear e curto, mas se perde a granularidade; o ramo da feature **não** fica ligado ao resultado (no teste os commits §x1§ e §x2§ ficaram "soltos" no ramo, fora de §main§), então **apague o ramo** depois.
- **Rebase e fast-forward**: reaplica os commits da feature **sobre o topo de §main§**, gerando commits **novos** (hashes diferentes), e avança §main§ em linha reta (§--ff-only§). O histórico fica linear e preserva os commits, mas **reescreve** a história do ramo.
| Estratégia | Histórico | Quando usar |
|---|---|---|
| Merge commit | com desvios, fiel | equipes que valorizam o registro real do trabalho |
| Squash | linear, 1 commit por PR | PRs pequenos; bom para mensagens padronizadas e reversão fácil |
| Rebase + FF | linear, vários commits | commits bem cuidados e equipe confortável com rebase |
**Regra de ouro do rebase:** nunca reescreva um histórico **já compartilhado** em ramos que outras pessoas usam (§--force-with-lease§ apenas no seu próprio ramo de PR).

### Mensagens de commit: Conventional Commits
Formato: §tipo(escopo)!: descrição§, corpo e rodapés. Tipos comuns: §feat§, §fix§, §docs§, §refactor§, §perf§, §test§, §build§, §ci§, §chore§, §revert§. O §!§ (ou o rodapé §BREAKING CHANGE:§) marca mudança incompatível. Benefícios: histórico legível, **changelog automático** e **versão semântica automática** (§fix§ → patch, §feat§ → minor, quebra → major, conforme o SemVer 2.0.0). Testamos uma expressão regular com seis mensagens: as válidas foram reconhecidas (tipo, escopo, quebra, descrição) e "ajuste de coisas" e "feat: " foram rejeitadas. Para uma lista de commits, o cálculo do incremento deu: [fix, docs] → **patch**; [feat, fix] → **minor**; [fix!] → **major**; [docs] → **nenhum**.

### Proteções e automações
- **Ramo protegido**: proíbe push direto, exige PR, aprovações mínimas e verificações verdes, e pode exigir **histórico linear** e **assinatura de commits**.
- **CODEOWNERS** (próxima aula) pede revisão automática das pessoas responsáveis por cada área.
- **CI**: testes, lint, build, análise de dependências e de segredos em cada PR.
- **Fila de merge** (*merge queue*): testa a combinação de PRs antes de integrar, evitando que dois PRs "verdes" quebrem o principal juntos.
- **Bots**: atualização de dependências, rótulos, lembretes de PR parado.

### Armadilhas
- PR gigante e "só ajustes de formatação" misturados à lógica.
- Reescrever o histórico depois de aprovações sem avisar.
- Aprovar sem ler porque "o CI está verde".
- PR esquecido por semanas: quanto mais velho, mais conflitos.
- Resolver conflitos no automático sem entender (veja a aula do Git).`,
  concepts: [
    { term: 'Pull Request', def: 'Pedido para integrar os commits de um ramo em outro, com revisão, conversa e verificações.' },
    { term: 'Draft PR', def: 'PR marcado como rascunho: sinaliza que ainda não está pronto para revisão ou integração.' },
    { term: 'Merge commit', def: 'Commit de mesclagem com dois pais que preserva o histórico dos dois ramos.' },
    { term: 'Squash merge', def: 'Integração que condensa os commits do PR em um único commit no destino.' },
    { term: 'Rebase', def: 'Reaplicar commits sobre outra base, criando commits novos e um histórico linear.' },
    { term: 'Fast-forward', def: 'Avanço do ponteiro do ramo sem criar commit de mesclagem.' },
    { term: 'Conventional Commits', def: 'Convenção de mensagens (tipo, escopo, descrição) que permite changelog e versionamento automáticos.' },
    { term: 'Ramo protegido', def: 'Ramo com regras obrigatórias (PR, revisões, verificações) antes de aceitar mudanças.' },
    { term: 'Merge queue', def: 'Fila que testa a combinação de PRs aprovados antes de integrá-los.' },
    { term: 'SemVer', def: 'Versionamento MAJOR.MINOR.PATCH em que quebras, recursos e correções incrementam cada parte.' }
  ],
  examples: R`**Analogia:** o PR é uma **proposta entregue em reunião**: quem propõe leva um resumo, evidências e o que muda; os colegas questionam e só então a proposta entra na ata oficial (o ramo principal). Merge, squash e rebase são **três jeitos de registrar na ata**: copiar a discussão inteira, registrar só a decisão final ou reescrever as anotações como se tivessem sido feitas depois.

**Históricos reais (Git 2.53, repositório de teste):** o ramo §main§ tinha 3 commits e a feature dois (§x1§ e §x2§).
- Merge commit: gráfico com o §Merge feat/x§ ligando as duas linhas; os commits §x1§, §x2§ e §c2§ continuam visíveis.
- Squash: um único §feat: x (squash)§ em §main§; os commits da feature **não** são ancestrais de §main§.
- Rebase + fast-forward: linha reta §c0§, §c1§, §c2§, §x1§, §x2§, com **hashes novos** para §x1§ e §x2§ (de §061e32d§ e §c4feb23§ para §9e6545d§ e §c20cefb§).

**Caso real:** uma equipe adota "PRs de até 400 linhas, squash e Conventional Commits". O pipeline lê os tipos desde a última tag, gera o changelog e propõe a próxima versão. Reverter uma funcionalidade vira reverter **um** commit.`,
  code: [
    { title: 'Comparando as três estratégias de integração (executado com Git 2.53)', lang: 'bash', code: R`set -e
base() {   # main com 3 commits e uma feature com 2, criada antes do último commit da main
  git init -q -b main "$1"; cd "$1"
  echo 1 > a.txt; git add .; git commit -qm "c0: inicio"
  echo 2 >> a.txt; git commit -qam "c1: main avanca"
  git switch -q -c feat/x
  echo x1 > x.txt; git add .; git commit -qm "x1: feature parte 1"
  echo x2 >> x.txt; git commit -qam "x2: feature parte 2"
  git switch -q main; echo 3 >> a.txt; git commit -qam "c2: main avanca de novo"
}
(base m; git merge -q --no-ff feat/x -m "Merge feat/x"; git log --oneline --graph --all)
(base s; git merge -q --squash feat/x; git commit -qm "feat: x (squash)"; git log --oneline --graph --all)
(base r; git switch -q feat/x; git rebase -q main; git switch -q main; git merge -q --ff-only feat/x; git log --oneline --graph --all)`, notes: [{ l: '2', t: 'A função cria um repositório novo com a mesma história de partida.' }, { l: '11', t: 'Merge commit: o gráfico mostra o desvio e o encontro.' }, { l: '12', t: 'Squash: um commit novo; os da feature ficam fora de main.' }, { l: '13', t: 'Rebase: commits novos (hashes diferentes) em linha reta.' }] },
    { title: 'Resumo de um PR com o próprio Git e validação de mensagens (executado)', lang: 'bash', code: R`git switch -q -c feat/subtracao
printf 'export const soma = (a, b) => a + b;\nexport const subtrai = (a, b) => a - b;\n' > src/soma.js
echo "uso: soma e subtrai" >> README.md
git commit -qam "feat(calc): adiciona subtrai"
git diff --stat main...feat/subtracao      # o que o revisor verá
git log --oneline main..feat/subtracao     # commits do PR
git request-pull main ../remote.git feat/subtracao | head -6   # resumo "buscar estas mudanças"
# Saída observada:
#  README.md   | 1 +
#  src/soma.js | 1 +
#  2 files changed, 2 insertions(+)
# 3bd5708 feat(calc): adiciona subtrai`, notes: [{ l: '5', t: 'Três pontos: compara com o ancestral comum, como o PR.' }, { l: '6', t: 'Dois pontos: commits alcançáveis em feat mas não em main.' }, { l: '7', t: 'git request-pull é o equivalente do Git ao PR (sem interface).' }] }
  ],
  bestPractices: ['Faça PRs pequenos, com uma única intenção, e descreva contexto, mudança e como testar.', 'Rode testes e lint antes de pedir revisão e mantenha o CI verde.', 'Adote Conventional Commits e uma estratégia de integração única para o repositório.', 'Proteja o ramo principal: exija PR, aprovações e verificações.', 'Nunca reescreva histórico compartilhado; use §--force-with-lease§ só no seu ramo.', 'Apague o ramo depois de integrar e feche PRs abandonados.'],
  mistakes: ['Abrir PRs enormes que misturam refatoração, formatação e lógica.', 'Descrição vazia ("ajustes") e título genérico.', 'Rebase em ramo compartilhado seguido de force push.', 'Squash que apaga mensagens úteis sem reescrevê-las.', 'Integrar com o CI vermelho "porque é só um teste".', 'Deixar PRs parados por semanas e acumular conflitos.'],
  market: `O PR é o centro do fluxo de trabalho em equipes de software e em código aberto. Quem escreve PRs claros, pequenos e bem descritos é percebido como colaborador confiável; entrevistas e avaliações de desempenho costumam olhar para a qualidade das mudanças propostas, não só para a quantidade. Conhecer merge, squash e rebase evita incidentes de histórico e facilita reversões.`,
  summary: `Um PR propõe integrar um ramo em outro com descrição, diff, revisão e verificações. Mantenha-os pequenos, descritos e verdes. Merge commit preserva o histórico, squash o condensa em um commit e rebase+fast-forward o lineariza com commits novos; nunca reescreva histórico compartilhado. Conventional Commits permite changelog e SemVer automáticos. Proteja o ramo principal com revisões, CI e, se preciso, fila de merge.`,
  refs: [REF.ghPr, REF.ghMerge, REF.ghTemplate, REF.convCommits, REF.semver, REF.gitRequestPull],
  cards: [
    { q: 'Qual a diferença entre merge commit e squash?', a: 'Merge commit preserva todos os commits do ramo e cria um commit de mesclagem; squash condensa tudo em um commit novo no destino.' },
    { q: 'O que o rebase faz com os commits?', a: 'Reaplica os commits sobre outra base, criando commits novos (hashes diferentes) e um histórico linear.' },
    { q: 'O que torna um PR bom?', a: 'Pequeno, focado, verde no CI, com descrição de contexto, mudança e como testar.' },
    { q: 'Que incremento de versão um commit fix produz no SemVer?', a: 'Patch (feat gera minor; mudança incompatível gera major).' }
  ]
},
{
  id: 'flx-02', moduleId: 'm1', order: 2, minutes: 55, tags: ['code review', 'revisão', 'CODEOWNERS', 'qualidade', 'cultura'],
  title: 'Code review: o que revisar, como comentar e como automatizar',
  objectives: ['Explicar os objetivos da revisão de código (qualidade, aprendizado, conhecimento compartilhado) e o que ela não substitui', 'Revisar um PR em camadas: contexto, design, correção, testes, segurança, legibilidade', 'Escrever comentários claros, respeitosos e acionáveis, distinguindo bloqueio de sugestão', 'Receber revisões com maturidade e responder de forma objetiva', 'Usar CODEOWNERS, listas de verificação e automações para reduzir o trabalho manual'],
  intro: `A **revisão de código** é uma das práticas de engenharia com melhor retorno: encontra defeitos antes da produção, espalha conhecimento pela equipe, mantém padrões e ensina. Mas é também um dos pontos em que equipes mais sofrem: revisões lentas, comentários ríspidos, aprovações superficiais ("LGTM" sem ler) ou perfeccionismo que paralisa. Esta aula trata do **o que olhar**, **como dizer** e **o que automatizar**, com base nas práticas públicas do Google (*Engineering Practices*) e na documentação do GitHub.`,
  theory: `### Para que serve
- **Qualidade**: achar erros de lógica, casos de borda, problemas de segurança, desempenho e manutenção;
- **Consistência**: padrões do projeto, nomes, arquitetura;
- **Conhecimento compartilhado**: mais de uma pessoa entende cada parte (reduz o "fator ônibus");
- **Aprendizado** mútuo (autor e revisor);
- **Responsabilidade coletiva** pelo código.
Não substitui **testes automáticos, lint e análise estática**: máquinas verificam o que é mecânico; **pessoas** revisam o que exige julgamento.

### O padrão de decisão
Uma regra prática do guia do Google: **aprovar quando a mudança melhora a saúde geral do código**, mesmo que não seja como o revisor a escreveria; não exigir perfeição, mas **não deixar piorar**. Preferências pessoais de estilo viram **sugestões** (*nit*), não bloqueios, a menos que o guia de estilo do projeto as exija.

### O que olhar (em camadas)
1. **Contexto e objetivo**: leia a descrição e a issue. A mudança resolve o problema certo? Faz mais do que o pedido?
2. **Design**: está no lugar certo? Acopla camadas indevidamente? É a abordagem mais simples que resolve? Há duplicação ou abstração prematura?
3. **Correção**: a lógica está certa? E os casos de borda (nulo, vazio, limite, concorrência, falha de rede, fuso horário)? Trata erros e recursos (fechar conexões)?
4. **Testes**: existem, falhariam sem a mudança e testam comportamento (não detalhes de implementação)? São legíveis?
5. **Segurança e privacidade**: validação de entrada, autorização, injeção, segredos, dados pessoais em logs, dependências novas.
6. **Desempenho e operação**: consultas em laço (N+1), alocações grandes, logs e métricas, migrações de dados e compatibilidade com a versão anterior (*rollback*).
7. **Legibilidade**: nomes, tamanho de funções, comentários que explicam o *porquê*.
8. **Documentação e acessibilidade** (se aplicável).
Comece pelo **todo** (a descrição, os testes, depois a implementação) e **não pela primeira linha do diff**. Se algo é grande demais para revisar bem, **diga** e peça para dividir.

### Como comentar
- **Seja específico e acionável**: em vez de "isso está confuso", "o nome §d§ não diz que são dias; que tal §diasDeAtraso§?";
- **Pergunte** quando não tiver certeza ("Qual é o comportamento se a lista vier vazia?");
- **Critique o código, não a pessoa**: "esta função faz três coisas" e não "você escreveu uma função enorme";
- **Explique o porquê** e, quando útil, ofereça um exemplo ou um link;
- **Classifique a gravidade**: prefixos como §bloqueio:§, §sugestão:§, §nit:§ (detalhe menor), §pergunta:§ e §elogio:§ evitam ambiguidade; reconhecer o que está bom também importa;
- **Agrupe** comentários repetidos em um só; evite dezenas de nits que escondem o problema importante.
Exemplo ruim: "errado". Exemplo bom: "bloqueio: se §itens§ for vazio, §itens[0].preco§ lança TypeError (linha 42). Sugiro tratar o caso e acrescentar um teste para lista vazia."

### Ser revisado
Pense no PR como **trabalho coletivo**, não como julgamento. Responda a **todos** os comentários (corrigir, discordar com argumento ou combinar um acompanhamento), agradeça, **não leve para o lado pessoal** e, se a discussão passar de três idas e vindas, **converse por voz** e registre a decisão no PR. O autor é responsável por facilitar: PR pequeno, descrição boa, auto-revisão antes de pedir revisão (revise o seu próprio diff primeiro).

### Velocidade e ritmo
Revisão lenta bloqueia a equipe e gera PRs grandes e conflitos. Acordos de equipe comuns: **primeira resposta em até um dia útil**, revisão em blocos de tempo reservados, **PRs de até algumas centenas de linhas**, e quem revisa também **dá prioridade** aos PRs dos colegas sobre começar trabalho novo. Evite o "carimbo" (aprovar sem ler) e o "pingue-pongue" infinito.

### Quem deve revisar
- Pelo menos **uma pessoa** que conheça a área; para mudanças sensíveis (autenticação, pagamentos, infraestrutura), alguém da equipe responsável.
- **CODEOWNERS**: arquivo que mapeia caminhos a responsáveis; o GitHub **solicita a revisão** deles automaticamente e pode **exigi-la** para integrar. Cada linha é um padrão de arquivo e os donos: §/docs/ @equipe-docs§; §*.sql @dba§; §/src/pagamentos/ @equipe-pagamentos§. **Vale a última regra que combina**, e padrões seguem regras parecidas com as do §.gitignore§.
- Rodízio de revisores e revisão por pares distribui conhecimento.

### Automação que ajuda a revisão
Formatação (Prettier), lint (ESLint), testes, cobertura, tipos, análise de segurança e de dependências, verificação de mensagens de commit e de tamanho do PR **no CI**: o humano não perde tempo com vírgulas. Modelos de PR com **lista de verificação** (testes feitos, documentação, migração, impacto em desempenho) ajudam o autor a se auto-revisar. Cuidado com "ruído": alertas demais ensinam a ignorar todos.

### Vieses e armadilhas
- **Efeito do tamanho**: PRs pequenos recebem muitos comentários; PRs gigantes recebem "LGTM".
- **Autoridade**: pessoas juniores hesitam em questionar seniores; incentive perguntas.
- **Viés de estilo**: debates intermináveis sobre preferência; automatize ou documente a regra.
- **Revisão como gargalo**: se só uma pessoa revisa tudo, a equipe para quando ela falta.`,
  concepts: [
    { term: 'Code review', def: 'Exame do código por outra pessoa antes da integração, para qualidade e compartilhamento de conhecimento.' },
    { term: 'LGTM', def: '"Looks good to me": aprovação; vale só se acompanhada de leitura real da mudança.' },
    { term: 'Nit', def: 'Comentário sobre um detalhe menor que não bloqueia a aprovação.' },
    { term: 'CODEOWNERS', def: 'Arquivo que mapeia caminhos a responsáveis, que são convidados (ou obrigados) a revisar mudanças neles.' },
    { term: 'Auto-revisão', def: 'Leitura do próprio diff pelo autor antes de pedir revisão.' },
    { term: 'Fator ônibus', def: 'Número de pessoas que, se faltassem, paralisariam o projeto por falta de conhecimento.' },
    { term: 'Revisão em camadas', def: 'Olhar a mudança em ordem: contexto, design, correção, testes, segurança, legibilidade.' },
    { term: 'Comentário acionável', def: 'Comentário específico, com motivo e proposta, que o autor consegue atender.' },
    { term: 'Saúde do código', def: 'Qualidade geral da base de código ao longo do tempo; critério de aprovação do guia do Google.' }
  ],
  examples: R`**Analogia:** a revisão é a **leitura de um colega antes de publicar um artigo**: o autor já leu várias vezes e não vê mais os próprios erros; quem lê com olhos novos acha a frase ambígua, o dado faltando e a conclusão exagerada. Funciona melhor quando o leitor critica o **texto**, não o autor, e quando o autor entrega um texto **curto** e com a **intenção explicada** na primeira página.

**Exemplo de revisão em camadas** de um PR "calcula desconto":
1. Contexto: a issue pede 10 % para pedidos acima de 100; o PR também reformata arquivos que não têm relação. → *"Podemos separar a formatação em outro PR?"*
2. Correção: o desconto é aplicado sobre o total **com** frete. → *"bloqueio: a regra diz 'sobre o subtotal'. Veja a issue #42."*
3. Testes: só o caso feliz. → *"sugestão: testes para subtotal 100 (limite), 99,99 e lista vazia."*
4. Segurança: o cupom vem da URL sem validação. → *"bloqueio: valide contra a lista de cupons válidos no servidor."*
5. Nome: §d§ → *"nit: §desconto§ seria mais claro."*

**Caso real (CODEOWNERS):**
§§§
/src/pagamentos/   @equipe-pagamentos
*.sql              @dba
/docs/             @equipe-docs
/src/pagamentos/docs/  @equipe-docs @equipe-pagamentos
§§§
Um PR que altera §src/pagamentos/docs/leia-me.md§ pede revisão a **@equipe-docs e @equipe-pagamentos** (a última regra que casa vence).`,
  code: [
    { title: 'Lista de verificação do autor para auto-revisão (modelo de PR em Markdown)', lang: 'markdown', code: R`## O que muda e por quê
<!-- Contexto, problema e solução em poucas linhas. Link da issue: Closes #123 -->

## Como testar
1. ...
2. ...

## Checklist
- [ ] Li o meu próprio diff e removi código de depuração
- [ ] Testes novos ou atualizados (falhariam sem a mudança)
- [ ] Lint, formatação e testes passam localmente
- [ ] Documentação e changelog atualizados (se houver mudança de comportamento)
- [ ] Sem segredos, dados pessoais ou arquivos gerados no diff
- [ ] Migração/rollback considerados (se mexe em dados ou contratos)

## Riscos e pontos de atenção para o revisor
<!-- O que olhar com mais cuidado? Algo que você não tem certeza? -->`, notes: [{ l: '1', t: 'Contexto e issue vinculada: o revisor entende o objetivo antes do código.' }, { l: '12', t: 'A lista de verificação ajuda o autor a se auto-revisar.' }, { l: '19', t: 'Apontar dúvidas direciona a atenção do revisor ao que importa. O arquivo vai em .github/PULL_REQUEST_TEMPLATE.md.' }] },
    { title: 'Resolvendo o dono de um arquivo pela última regra que combina (padrão ilustrativo; a lógica é treinada no exercício da aula)', lang: 'javascript', code: R`const regras = [
  ['/src/pagamentos/', ['@equipe-pagamentos']],
  ['*.sql', ['@dba']],
  ['/docs/', ['@equipe-docs']]
];
function donos(caminho) {
  let resp = [];
  for (const [padrao, donos] of regras) {
    const ancorado = padrao.startsWith('/');
    const casa = padrao.endsWith('/')
      ? (ancorado ? caminho.startsWith(padrao.slice(1)) : ('/' + caminho).includes(padrao))
      : padrao.startsWith('*.') ? caminho.endsWith(padrao.slice(1)) : caminho === padrao.replace(/^\//, '');
    if (casa) resp = donos;                      // a última regra que combina vence
  }
  return resp;
}
console.log(donos('src/pagamentos/pix.js'), donos('db/schema.sql'), donos('README.md')); // [@equipe-pagamentos] [@dba] []`, notes: [{ l: '9', t: 'Pastas terminam em /; padrões com * casam por extensão.' }, { l: '12', t: 'A última regra que combina substitui as anteriores.' }, { l: '15', t: 'Versão simplificada: o CODEOWNERS real aceita mais padrões (como no .gitignore).' }] }
  ],
  bestPractices: ['Comece pelo contexto e pelos testes, depois leia a implementação.', 'Aprove quando a mudança melhora a saúde do código, sem exigir perfeição.', 'Escreva comentários específicos, respeitosos e classificados (bloqueio, sugestão, nit, pergunta).', 'Faça auto-revisão antes de pedir revisão e mantenha PRs pequenos.', 'Responda à primeira revisão rapidamente e converse por voz quando a discussão se alongar.', 'Automatize o mecânico (formatação, lint, testes) e use CODEOWNERS para chamar quem entende da área.'],
  mistakes: ['Aprovar sem ler porque o CI está verde ou porque a pessoa é sênior.', 'Bloquear por preferência de estilo que o guia do projeto não exige.', 'Comentários vagos ("não gostei") ou pessoais.', 'Revisar o diff linha a linha sem ler a descrição nem os testes.', 'Deixar PRs sem resposta por dias.', 'Discutir a mesma regra de estilo em todo PR em vez de automatizá-la.'],
  market: `Cultura de revisão é um sinal forte de maturidade de engenharia: empresas avaliam como as pessoas dão e recebem feedback técnico, e a prática é exigida em ambientes regulados (auditoria de mudanças). Saber revisar com critério e respeito é parte da progressão para níveis plenos e sêniores.`,
  summary: `Revisão de código busca qualidade, consistência e compartilhamento de conhecimento; não substitui testes e lint. Revise em camadas (contexto, design, correção, testes, segurança, desempenho, legibilidade), aprove quando a saúde do código melhora e classifique os comentários (bloqueio, sugestão, nit). Autores fazem auto-revisão e PRs pequenos. CODEOWNERS e o CI automatizam a escolha de revisores e as verificações mecânicas.`,
  refs: [REF.googleReview, REF.ghReview, REF.ghOwners, REF.ghTemplate],
  cards: [
    { q: 'Qual o critério do guia do Google para aprovar uma mudança?', a: 'Que ela melhore a saúde geral do código, mesmo que não seja perfeita ou como o revisor a escreveria.' },
    { q: 'O que é um nit?', a: 'Um comentário sobre um detalhe menor, que não deve bloquear a aprovação.' },
    { q: 'Como o CODEOWNERS decide os revisores quando duas regras combinam?', a: 'Vale a última regra que combina com o caminho do arquivo.' },
    { q: 'O que deve ser automatizado em vez de discutido na revisão?', a: 'Formatação, lint, testes e verificações mecânicas, no CI.' }
  ]
},
{
  id: 'flx-03', moduleId: 'm1', order: 3, minutes: 55, tags: ['documentação', 'README', 'ADR', 'Diátaxis', 'changelog'],
  title: 'Documentação técnica: README, ADRs, runbooks e docs como código',
  objectives: ['Distinguir os tipos de documentação (tutorial, guia prático, referência, explicação) e a quem servem', 'Escrever um README que permita rodar o projeto em minutos', 'Registrar decisões de arquitetura com ADRs (contexto, decisão, consequências)', 'Manter changelog e versionamento coerentes com Conventional Commits e SemVer', 'Tratar documentação como código: revisão, versionamento, verificação de links e diagramas como texto'],
  intro: `Código sem documentação vira **conhecimento oral**: só quem estava na reunião sabe por que a coisa é assim, e cada pessoa nova leva semanas para ficar produtiva. Documentar bem não é escrever muito; é escrever **o que ajuda alguém a agir** e **mantê-lo atualizado**. Esta aula apresenta os tipos de documentos que toda equipe precisa (README, ADRs, runbooks, referência de API, changelog) e como mantê-los vivos com as mesmas práticas do código: versionados, revisados em PR e verificados no CI.`,
  theory: `### Quatro tipos de documentação (Diátaxis)
O modelo **Diátaxis** separa a documentação por **necessidade do leitor**; misturar tipos no mesmo texto é a principal causa de documentação ruim:
| Tipo | Pergunta do leitor | Exemplo |
|---|---|---|
| **Tutorial** | "Quero aprender" | "Crie sua primeira API em 20 minutos" (guiado, resultado garantido) |
| **Guia prático** (*how-to*) | "Quero resolver este problema" | "Como rotacionar a chave de API" |
| **Referência** | "Preciso consultar um fato" | endpoints, parâmetros, variáveis de ambiente, códigos de erro |
| **Explicação** | "Quero entender por quê" | arquitetura, decisões, trade-offs |
Pergunte sempre: **quem lê, o que quer fazer?**

### O README: a porta de entrada
Deve responder em poucos minutos: **o que é** (uma frase), **para quem**, **como rodar** (pré-requisitos, instalar, executar, testar), **como contribuir**, **como obter ajuda** e **licença**. Um bom teste: uma pessoa nova, com a máquina limpa, consegue rodar o projeto **só com o README**? Se precisa perguntar, o README está incompleto. Mantenha comandos **copiáveis e testados**; no CI, rode os comandos do README (ou um script equivalente) para que não apodreçam. Estrutura típica:
§§§
# Nome — frase de propósito
## Pré-requisitos   ## Como rodar   ## Testes   ## Variáveis de ambiente
## Estrutura do projeto   ## Como contribuir   ## Licença
§§§

### Registros de decisão de arquitetura (ADRs)
Um **ADR** é um documento curto que registra **uma decisão** importante: contexto, escolha, alternativas e consequências. Resolve o problema do "por que usamos X?" daqui a dois anos. Formato leve de Michael Nygard:
- **Título**: "ADR 007: usar PostgreSQL como banco principal"
- **Status**: proposto, aceito, substituído por ADR 015
- **Contexto**: forças e restrições (requisitos, prazo, time)
- **Decisão**: "Usaremos..."
- **Consequências**: o que fica mais fácil e mais difícil, riscos e custos.
Regras: **um ADR por decisão**, numerado e **imutável** (se mudar, escreva um novo e marque o antigo como substituído); guardado no repositório (§docs/adr/§); curto (uma a duas páginas).

### Runbooks e documentação operacional
Um **runbook** descreve, passo a passo, como **operar e recuperar** um serviço: "alerta X disparou: o que verificar, que comando rodar, quem acionar, como reverter". Deve ser escrito para ser lido às 3 da manhã: comandos exatos, links dos painéis, critérios de decisão e **contatos de escalonamento**. Revise-o após cada incidente (*post-mortem*). Também entram aqui: guia de deploy, de rollback, de migração de dados e de resposta a incidentes.

### Referência de API
Gerada **a partir do contrato** (OpenAPI, esquemas GraphQL, tipos TypeScript, docstrings) para não divergir do código, e complementada com **exemplos** reais de requisição e resposta e com **códigos de erro** explicados. Para bibliotecas, exemplos executáveis (testes de documentação) garantem que não quebram.

### Changelog e versionamento
O **changelog** (formato *Keep a Changelog*) lista as mudanças por versão, agrupadas em **Adicionado, Modificado, Obsoleto, Removido, Corrigido, Segurança**, pensado para humanos. Com **Conventional Commits** dá para gerar o rascunho automaticamente, e com **SemVer** (MAJOR.MINOR.PATCH) a versão comunica o impacto da mudança. Registre as **quebras de compatibilidade** com destaque e o caminho de migração.

### Docs como código
- **Versionadas no repositório**, perto do código que descrevem; mudou o código, **muda a doc no mesmo PR** (item da lista de verificação do PR);
- **revisadas** como código;
- **verificadas no CI**: formatação do Markdown, **links quebrados**, exemplos de código testados, ortografia;
- **diagramas como texto** (Mermaid, PlantUML): versionáveis e revisáveis no diff, em vez de imagens que ninguém atualiza. Exemplo Mermaid: §flowchart LR; Cliente --> API --> Banco§.
- **uma fonte da verdade**: evite copiar o mesmo texto em vários lugares.

### Escrevendo bem
Comece pelo **que o leitor precisa fazer**; frases curtas, voz ativa, termos consistentes (um conceito, um nome), exemplos concretos, **títulos que descrevem** o conteúdo, listas para passos e tabelas para comparações. Evite "óbvio", "simplesmente" e "basta" (o que é óbvio para você não é para quem chega). Escreva **datas e versões** quando o conteúdo depender delas e indique **responsável** pela revisão.

### Manutenção: a parte difícil
Documentação desatualizada é pior que ausente, porque engana. Estratégias: dono e data de revisão em cada documento importante, **verificações automáticas**, apagar o que ficou obsoleto, transformar perguntas repetidas em documento e medir (quanto tempo uma pessoa nova leva para o primeiro PR).`,
  concepts: [
    { term: 'Diátaxis', def: 'Modelo que divide a documentação em tutorial, guia prático, referência e explicação.' },
    { term: 'README', def: 'Documento de entrada de um projeto: o que é, como rodar, testar e contribuir.' },
    { term: 'ADR', def: 'Architecture Decision Record: registro curto e imutável de uma decisão de arquitetura, com contexto e consequências.' },
    { term: 'Runbook', def: 'Guia operacional passo a passo para operar e recuperar um serviço.' },
    { term: 'Changelog', def: 'Lista de mudanças por versão escrita para pessoas.' },
    { term: 'Docs como código', def: 'Tratar a documentação com versionamento, revisão e verificação automática, como o código.' },
    { term: 'Diagrama como texto', def: 'Diagrama descrito em texto (Mermaid, PlantUML) que pode ser versionado e revisado.' },
    { term: 'Post-mortem', def: 'Análise sem culpados de um incidente, com causas e ações corretivas.' },
    { term: 'OpenAPI', def: 'Especificação que descreve APIs HTTP e permite gerar documentação e clientes.' }
  ],
  examples: R`**Analogia:** documentação é o **mapa do metrô**: não explica a engenharia dos túneis (explicação), nem o manual do trem (referência); mostra como ir de A a B (guia prático) e, para quem chegou agora, tem uma visita guiada (tutorial). Um mapa desatualizado leva à estação errada.

**Exemplo de ADR (formato Nygard):**
§§§
# ADR 007: usar fila de mensagens para envio de e-mails
Status: aceito (2026-11-18)
Contexto: o envio síncrono de e-mails deixa o checkout lento e falha quando o provedor oscila.
Decisão: publicaremos um evento "pedido-confirmado" em uma fila; um consumidor enviará o e-mail com reenvio automático.
Consequências: + checkout mais rápido e resiliente; - mais um componente a operar; e-mails ficam eventualmente consistentes; é preciso idempotência no consumidor.
§§§

**Exemplo de runbook (trecho):**
§§§
Alerta: "fila de e-mails > 1000 mensagens por 10 min"
1. Abra o painel Filas (link). O consumidor está vivo? (kubectl get pods -l app=mailer)
2. Se o provedor responde 5xx: ative o provedor secundário (feature flag mail.fallback=true).
3. Se o consumidor travou: reinicie (kubectl rollout restart deploy/mailer) e acompanhe o tamanho da fila.
4. Sem melhora em 30 min: acione o plantão de plataforma (canal #plantao).
§§§

**Verificação de links (executada em Node.js 26):** o script abaixo varreu um diretório de teste com 3 arquivos Markdown e relatou o único link relativo quebrado.`,
  code: [
    { title: 'Verificador de links relativos em Markdown (executado em Node.js 26)', lang: 'javascript', code: R`import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

function arquivosMd(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivosMd(p) : n.endsWith('.md') ? [p] : [];
  });
}
function linksQuebrados(raiz) {
  const problemas = [];
  for (const arq of arquivosMd(raiz)) {
    const texto = readFileSync(arq, 'utf8');
    for (const m of texto.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const alvo = m[1].split('#')[0];
      if (!alvo || /^[a-z]+:/i.test(alvo)) continue;                 // âncoras e URLs externas ficam de fora
      if (!existsSync(resolve(dirname(arq), alvo))) problemas.push(arq + ' -> ' + m[1]);
    }
  }
  return problemas;
}
console.log(linksQuebrados('docs'));   // [ 'docs/guia.md -> ./nao-existe.md' ]`, notes: [{ l: '10', t: 'Percorre os arquivos .md recursivamente.' }, { l: '13', t: 'A regex captura [texto](destino); links externos e âncoras são ignorados.' }, { l: '16', t: 'Links relativos são resolvidos a partir do arquivo que os contém.' }, { l: '20', t: 'No diretório de teste, o único link quebrado foi ./nao-existe.md.' }] },
    { title: 'Diagrama como texto (Mermaid) e modelo de ADR', lang: 'markdown', code: R`§§§mermaid
flowchart LR
  Cliente --> API[API HTTP]
  API --> Fila[(Fila de e-mails)]
  Fila --> Mailer
  API --> Banco[(PostgreSQL)]
§§§

# ADR NNN: título da decisão
- Status: proposto | aceito | substituído por ADR MMM
- Data: AAAA-MM-DD
## Contexto
## Decisão
## Consequências
## Alternativas consideradas`, notes: [{ l: '1', t: 'O GitHub e várias ferramentas renderizam blocos mermaid; o diagrama é versionado como texto. O exemplo não foi renderizado neste ambiente.' }, { l: '9', t: 'Modelo curto de ADR; um arquivo por decisão em docs/adr/.' }] }
  ],
  bestPractices: ['Escreva para quem lê: separe tutorial, guia, referência e explicação.', 'Faça o README rodar o projeto em minutos e teste os comandos no CI.', 'Registre decisões relevantes em ADRs curtos, numerados e imutáveis.', 'Atualize a documentação no mesmo PR da mudança de código.', 'Verifique links e exemplos automaticamente e use diagramas como texto.', 'Dê dono e data de revisão aos documentos importantes e apague os obsoletos.'],
  mistakes: ['Um único documento enorme que mistura tutorial, referência e opinião.', 'README que não funciona em uma máquina limpa.', 'Decisões só na cabeça das pessoas ou em chats perdidos.', 'Copiar o mesmo conteúdo em vários lugares e deixar divergir.', 'Diagramas em imagens sem fonte editável.', 'Documentação "para depois": nunca é escrita.'],
  market: `Equipes com boa documentação integram pessoas novas mais rápido, resolvem incidentes com menos pânico e atendem requisitos de auditoria. A habilidade de escrever documentação técnica clara é valorizada em todos os níveis e destaca profissionais em processos seletivos e em posições de liderança técnica e de plataforma.`,
  summary: `Documentação eficaz parte do leitor: tutorial (aprender), guia prático (resolver), referência (consultar) e explicação (entender). O README deve fazer o projeto rodar em minutos; ADRs registram decisões com contexto e consequências; runbooks orientam a operação e a recuperação; o changelog comunica mudanças por versão (SemVer). Trate docs como código: no repositório, revisadas em PR, verificadas no CI e com diagramas em texto.`,
  refs: [REF.diataxis, REF.writeTheDocs, REF.adr, REF.nygardAdr, REF.keepChangelog, REF.mermaid, REF.semver],
  cards: [
    { q: 'Quais são os quatro tipos de documentação do Diátaxis?', a: 'Tutorial, guia prático (how-to), referência e explicação.' },
    { q: 'O que um ADR registra?', a: 'Uma decisão de arquitetura: contexto, decisão, consequências e alternativas; é curto e imutável.' },
    { q: 'Como evitar que o README apodreça?', a: 'Rodar os comandos dele no CI, mantê-lo no repositório e atualizá-lo no mesmo PR que muda o comportamento.' },
    { q: 'Por que diagramas como texto?', a: 'Podem ser versionados, revisados no diff e atualizados junto ao código.' }
  ]
}
];
