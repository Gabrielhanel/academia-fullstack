// Curso 2 — Git e GitHub na prática. Aulas 1 a 4.
export const REF = {
  progit: { title: 'Scott Chacon e Ben Straub — Pro Git, 2ª ed. (livro aberto, CC BY-NC-SA 3.0)', url: 'https://git-scm.com/book/en/v2', kind: 'book' },
  docs: { title: 'Git — documentação de referência dos comandos', url: 'https://git-scm.com/docs', kind: 'doc' },
  gitignore: { title: 'Git — gitignore', url: 'https://git-scm.com/docs/gitignore', kind: 'doc' },
  merge: { title: 'Git — git-merge', url: 'https://git-scm.com/docs/git-merge', kind: 'doc' },
  restore: { title: 'Git — git-restore', url: 'https://git-scm.com/docs/git-restore', kind: 'doc' },
  switch: { title: 'Git — git-switch', url: 'https://git-scm.com/docs/git-switch', kind: 'doc' },
  reset: { title: 'Git — git-reset', url: 'https://git-scm.com/docs/git-reset', kind: 'doc' },
  revert: { title: 'Git — git-revert', url: 'https://git-scm.com/docs/git-revert', kind: 'doc' },
  reflog: { title: 'Git — git-reflog', url: 'https://git-scm.com/docs/git-reflog', kind: 'doc' },
  push: { title: 'Git — git-push', url: 'https://git-scm.com/docs/git-push', kind: 'doc' },
  bisect: { title: 'Git — git-bisect', url: 'https://git-scm.com/docs/git-bisect', kind: 'doc' },
  conventional: { title: 'Conventional Commits 1.0.0', url: 'https://www.conventionalcommits.org/en/v1.0.0/', kind: 'spec' },
  semver: { title: 'Semantic Versioning 2.0.0', url: 'https://semver.org/', kind: 'spec' },
  ghFlow: { title: 'GitHub Docs — GitHub flow', url: 'https://docs.github.com/en/get-started/using-github/github-flow', kind: 'doc' },
  ghProtected: { title: 'GitHub Docs — About protected branches', url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches', kind: 'doc' },
  ghMerge: { title: 'GitHub Docs — About merge methods on GitHub', url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github', kind: 'doc' },
  ghToken: { title: 'GitHub Docs — Managing your personal access tokens', url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens', kind: 'doc' },
  ghSecret: { title: 'GitHub Docs — About secret scanning', url: 'https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning', kind: 'doc' },
  trunk: { title: 'Trunk Based Development', url: 'https://trunkbaseddevelopment.com/', kind: 'article' }
};

export const lessonsA = [
{
  id: 'git-01', moduleId: 'm1', order: 1, minutes: 55, tags: ['git', 'controle-de-versao'],
  title: 'Controle de versão e o modelo mental do Git',
  objectives: ['Explicar por que equipes usam controle de versão', 'Descrever um commit como um instantâneo (snapshot) com metadados e ponteiro para o pai', 'Distinguir diretório de trabalho, área de preparação (index) e repositório', 'Explicar o que são branch e HEAD e a diferença entre Git e GitHub'],
  intro: `Sem controle de versão, projetos viram pastas chamadas "final", "final2" e "final-agora-vai". Com ele, cada mudança tem autor, data, motivo e pode ser desfeita. O Git é a ferramenta mais usada para isso, e quem entende o **modelo mental** por trás dele deixa de decorar comandos e passa a raciocinar sobre o que cada um faz. Esta aula constrói esse modelo.`,
  theory: `### Por que controlar versões
- **Histórico:** quem mudou o quê, quando e por quê.
- **Reversão:** voltar a um estado anterior que funcionava.
- **Colaboração:** várias pessoas alteram o mesmo projeto sem sobrescrever o trabalho umas das outras.
- **Experimentação:** testar uma ideia em um ramo separado sem arriscar o código estável.

### Centralizado versus distribuído
Em sistemas **centralizados**, existe um servidor com o histórico e cada pessoa tem apenas uma cópia dos arquivos. O Git é **distribuído**: cada clone contém o **histórico completo**. Consequências práticas: quase todos os comandos funcionam sem internet; o servidor (GitHub, GitLab) é apenas um ponto de combinação entre cópias completas; e perder o servidor não significa perder o histórico.

### Git não é GitHub
**Git** é o programa de controle de versão, que roda na sua máquina. **GitHub** é um serviço na web que hospeda repositórios Git e acrescenta recursos de colaboração (pull requests, issues, revisão de código, automações). GitLab e Bitbucket são alternativas. Você pode usar Git sem GitHub.

### O modelo de dados: instantâneos
O Git trata o projeto como uma sequência de **instantâneos** (*snapshots*). Um **commit** registra:
1. uma referência ao conteúdo completo do projeto naquele momento (uma **árvore**, *tree*);
2. a referência ao(s) **commit(s) pai(s)**;
3. autor, data e **mensagem**.

Cada commit é identificado por um **hash** calculado a partir do seu conteúdo. Historicamente o Git usa SHA-1; existe suporte a SHA-256 em repositórios novos. Por isso, mudar qualquer detalhe de um commit (inclusive o pai) muda o hash: o histórico é **encadeado**, e um commit antigo não pode ser alterado em silêncio. Para economizar espaço, o Git compacta arquivos e reaproveita o que não mudou, mas o **modelo mental** continua sendo "cada commit é uma foto do projeto".

Os objetos principais guardados em §.git/objects§: **blob** (conteúdo de um arquivo), **tree** (um diretório, apontando para blobs e outras trees), **commit** e **tag** anotada.

### O histórico é um grafo
Como cada commit aponta para o pai, o histórico forma um **grafo dirigido acíclico**. Em uma história linear há um pai por commit; um **commit de merge** tem **dois pais**. É o mesmo grafo que você estudou no curso de estruturas de dados, e percorrê-lo é o que §git log§ faz.

### Branch e HEAD
- **Branch** (ramo) é apenas um **ponteiro móvel** para um commit. Criar uma branch custa quase nada: não copia arquivos.
- Ao fazer um commit na branch atual, o ponteiro avança para o novo commit.
- **HEAD** é o ponteiro especial que indica onde você está: normalmente aponta para uma branch, que por sua vez aponta para um commit.
- **Detached HEAD:** quando HEAD aponta diretamente para um commit, sem branch. Commits feitos nesse estado ficam "soltos" e podem se perder se você não criar uma branch para eles.

### As três áreas
1. **Diretório de trabalho** (*working tree*): os arquivos que você edita.
2. **Área de preparação** (*staging area* ou *index*): o rascunho do próximo commit.
3. **Repositório** (diretório §.git§): o histórico de commits.

O fluxo básico: você edita arquivos → §git add§ copia o estado deles para a área de preparação → §git commit§ transforma a área de preparação em um commit. A área de preparação existe para que você escolha **exatamente** o que entra em cada commit, mesmo que tenha mexido em dez arquivos.

### Configuração inicial
O Git grava nome e e-mail em cada commit. Configure uma vez:

    git config --global user.name "Seu Nome"
    git config --global user.email "voce@exemplo.com"

Use o e-mail associado à sua conta do GitHub se quiser que os commits apareçam no seu perfil. §git --version§ confirma a instalação. Neste curso, os comandos §git switch§ e §git restore§ exigem Git **2.23 ou superior**.

### Estados de um arquivo
Um arquivo é **não rastreado** (*untracked*), **modificado**, **preparado** (*staged*) ou **confirmado** (*committed*, sem alterações). §git status§ mostra em que estado cada arquivo está e sugere o próximo comando.`,
  concepts: [
    { term: 'Repositório', def: 'O projeto mais todo o seu histórico, guardado no diretório .git.' },
    { term: 'Commit', def: 'Instantâneo do projeto com autor, data, mensagem e ponteiro para o(s) commit(s) pai(s).' },
    { term: 'Hash do commit', def: 'Identificador calculado a partir do conteúdo do commit; muda se qualquer parte do commit mudar.' },
    { term: 'Branch', def: 'Ponteiro móvel para um commit; avança quando você faz commits nela.' },
    { term: 'HEAD', def: 'Ponteiro que indica a posição atual: normalmente uma branch, que aponta para um commit.' },
    { term: 'Área de preparação (index)', def: 'Rascunho do próximo commit: o que foi marcado com git add.' },
    { term: 'Diretório de trabalho', def: 'Os arquivos reais que você edita no disco.' },
    { term: 'Detached HEAD', def: 'Estado em que HEAD aponta diretamente para um commit, sem branch.' }
  ],
  examples: `**Analogia:** o Git é um álbum de fotografias do projeto. Cada commit é uma foto datada e legendada, colada depois da anterior. A área de preparação é a mesa onde você separa, entre as mudanças feitas, quais vão para a próxima foto. Uma branch é um marcador de página; criar outro marcador é gratuito. HEAD é o dedo que mostra onde você está folheando.

**Exemplo de objetos:** o comando §git cat-file -p HEAD§ mostra o commit atual. A saída tem o formato abaixo (os hashes são ilustrativos):

    tree 9f2c1a...
    parent 3b18e0...
    author Ana <ana@exemplo.com> 1700000000 -0300
    committer Ana <ana@exemplo.com> 1700000000 -0300

    feat: adiciona tela de login`,
  code: [
    { title: 'Primeiros comandos: criar um repositório e fazer o primeiro commit', lang: 'bash', code: `mkdir meu-projeto && cd meu-projeto
git init
echo "# Meu projeto" > README.md
git status
git add README.md
git commit -m "docs: cria README"
git log --oneline`,
      notes: [ { l: '2', t: 'git init cria o diretório .git e transforma a pasta em um repositório.' }, { l: '3', t: 'Cria um arquivo novo. Para o Git ele está "não rastreado".' }, { l: '4', t: 'git status lista README.md como não rastreado e sugere git add.' }, { l: '5', t: 'git add copia o conteúdo atual do arquivo para a área de preparação.' }, { l: '6', t: 'git commit grava a área de preparação como um commit, com a mensagem entre aspas.' }, { l: '7', t: 'git log --oneline mostra cada commit em uma linha: hash curto e mensagem.' } ] },
    { title: 'O histórico como grafo: ancestrais de um commit (JavaScript)', lang: 'javascript', code: `// Cada commit guarda a lista de ids dos pais.
const pais = {
  c1: [],
  c2: ['c1'],
  c3: ['c2'],        // main
  f1: ['c2'],        // feature começa em c2
  f2: ['f1'],        // feature
  m1: ['c3', 'f2']   // commit de merge: dois pais
};

function ancestrais(pais, id) {
  const vistos = new Set([id]);
  const fila = [id];
  for (let i = 0; i < fila.length; i++) {
    for (const p of pais[fila[i]] || []) {
      if (!vistos.has(p)) { vistos.add(p); fila.push(p); }
    }
  }
  return vistos;
}

console.log([...ancestrais(pais, 'm1')].sort()); // ['c1', 'c2', 'c3', 'f1', 'f2', 'm1']`,
      notes: [ { l: '2-8', t: 'Um objeto que mapeia o id de cada commit à lista dos ids dos pais, o mesmo que uma lista de adjacência.' }, { l: '7', t: 'O commit de merge tem dois pais: é isso que o diferencia de um commit comum.' }, { l: '11-19', t: 'É uma BFS que parte do commit e segue os pais. O conjunto de ancestrais é o que git log mostra a partir dele.' } ] },
    { title: 'Inspecionando branch e HEAD', lang: 'bash', code: `git branch
git log --oneline --decorate -3
git cat-file -p HEAD
git switch --detach HEAD~1
git status`,
      notes: [ { l: '1', t: 'Lista as branches locais; a atual aparece marcada com asterisco.' }, { l: '2', t: '--decorate mostra, ao lado do commit, quais branches e HEAD apontam para ele. -3 limita a três commits.' }, { l: '3', t: 'Mostra o objeto commit: árvore, pai, autor e mensagem.' }, { l: '4', t: 'Coloca HEAD diretamente no commit anterior (HEAD~1), sem branch: detached HEAD.' }, { l: '5', t: 'O status avisa que HEAD está desanexado. Para voltar: git switch -.' } ] }
  ],
  bestPractices: ['Configure nome e e-mail antes do primeiro commit.', 'Rode git status com frequência: ele diz em que estado está cada arquivo.', 'Pense em commits como instantâneos encadeados, não como "diferenças".', 'Crie branches à vontade: são ponteiros baratos.', 'Antes de comandos que alteram o histórico, confira onde HEAD e as branches estão com git log --oneline --graph --decorate --all.'],
  mistakes: ['Confundir Git com GitHub.', 'Esquecer que git add copia o estado do arquivo naquele momento: alterações feitas depois do add não entram no commit.', 'Achar que uma branch é uma cópia da pasta do projeto.', 'Fazer commits em detached HEAD e depois perder o trabalho ao trocar de branch.', 'Fazer commit sem configurar user.email e depois ter commits com autoria errada.'],
  market: `Praticamente toda vaga de desenvolvimento pressupõe Git. Entender o modelo de dados faz a diferença quando algo dá errado: quem sabe que commits são encadeados e que branches são ponteiros consegue recuperar trabalho "perdido" sem pânico, e explica o histórico do projeto com clareza em revisões de código e em entrevistas.`,
  summary: `O Git é distribuído: cada clone tem o histórico completo. Um commit é um instantâneo com metadados e ponteiro para o(s) pai(s); o histórico forma um grafo. Branch é um ponteiro móvel e HEAD indica onde você está. O fluxo básico passa por diretório de trabalho, área de preparação e repositório. GitHub é um serviço que hospeda repositórios Git.`,
  refs: [REF.progit, REF.docs, REF.switch],
  cards: [
    { q: 'O que um commit guarda?', a: 'Um instantâneo do projeto (árvore), o(s) pai(s), autor, data e mensagem.' },
    { q: 'O que é uma branch no Git?', a: 'Um ponteiro móvel para um commit.' },
    { q: 'Quais são as três áreas do Git?', a: 'Diretório de trabalho, área de preparação (index) e repositório (.git).' },
    { q: 'Qual a diferença entre Git e GitHub?', a: 'Git é o programa de controle de versão; GitHub é um serviço que hospeda repositórios Git e oferece recursos de colaboração.' }
  ]
},
{
  id: 'git-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['git', 'commits', 'gitignore'],
  title: 'Commits no dia a dia: status, diff, log, .gitignore e boas mensagens',
  objectives: ['Usar o ciclo status, add, commit e inspecionar mudanças com diff, log e show', 'Preparar apenas parte das alterações com git add -p', 'Escrever um .gitignore correto, entendendo padrões, negação e arquivos já rastreados', 'Escrever mensagens de commit claras, com o padrão Conventional Commits'],
  intro: `A maior parte do seu tempo com Git é gasta em meia dúzia de comandos. Esta aula os transforma em hábito e ensina o que separa um histórico útil de um despejo de "ajustes": commits pequenos, com mensagem que explica o motivo. Esse cuidado vale ouro quando alguém (você, daqui a seis meses) precisa entender por que o código está assim.`,
  theory: `### O ciclo do dia a dia
1. §git status§: o que mudou?
2. §git diff§: o que exatamente mudou?
3. §git add <arquivos>§: o que entra no próximo commit?
4. §git diff --staged§: confira o que está preparado.
5. §git commit -m "mensagem"§: grave.
6. §git log§: veja o histórico.

### Lendo o status
§git status§ agrupa os arquivos em "Changes to be committed" (preparados), "Changes not staged for commit" (modificados) e "Untracked files" (novos). A forma curta, §git status --short§, usa duas colunas: a primeira é o estado na área de preparação e a segunda, no diretório de trabalho. Exemplos: §A  x.txt§ (adicionado e preparado), §M  x.txt§ (modificado e preparado), §␣M x.txt§ (modificado, não preparado), §AM x.txt§ (adicionado e depois modificado de novo), §?? x.txt§ (não rastreado).

### Entendendo diferenças
- §git diff§: diferença entre o **diretório de trabalho** e a **área de preparação**.
- §git diff --staged§ (ou §--cached§): diferença entre a **área de preparação** e o **último commit**.
- §git diff A B§: diferença entre dois commits.
- §git show <commit>§: mostra um commit (mensagem e alterações).

### Preparando só uma parte
§git add -p§ percorre as alterações em blocos e pergunta se cada um deve ser preparado. Isso permite que duas mudanças feitas no mesmo arquivo virem dois commits separados.

### Explorando o histórico
- §git log --oneline§: uma linha por commit.
- §git log --oneline --graph --decorate --all§: o grafo completo, com branches.
- §git log -p -- caminho§: histórico de um arquivo com as alterações.
- §git log --author="Ana"§, §git log --since="2 weeks ago"§: filtros.
- §git blame arquivo§: quem alterou cada linha pela última vez e em qual commit.

### Movendo e removendo arquivos
§git rm arquivo§ remove o arquivo e já prepara a remoção. §git mv origem destino§ renomeia e prepara. O Git não grava "renomeação" como um evento: ele a **detecta** comparando o conteúdo.

### Desfazendo antes de commitar
- Tirar um arquivo da área de preparação, mantendo as alterações: §git restore --staged arquivo§.
- Descartar alterações do diretório de trabalho (**irreversível**: as alterações não commitadas se perdem): §git restore arquivo§.

### .gitignore
O arquivo §.gitignore§ lista padrões de arquivos que o Git deve ignorar: dependências (§node_modules/§), builds, logs, arquivos do editor e **segredos** (§.env§). Regras principais (conforme a documentação oficial):
- §#§ inicia um comentário; linhas em branco são ignoradas.
- §*.log§ ignora qualquer arquivo terminado em §.log§.
- Uma **barra final** (§build/§) faz o padrão valer **só para diretórios**.
- Uma barra no início (§/build§) ancora o padrão à pasta do §.gitignore§.
- §!§ **nega** um padrão anterior: §*.log§ seguido de §!importante.log§ volta a incluir esse arquivo. **Não funciona** se o diretório pai já estiver excluído.
- **Arquivos já rastreados não são afetados**: se o arquivo já foi commitado, colocá-lo no §.gitignore§ não o remove do repositório. Use §git rm --cached arquivo§ para parar de rastreá-lo (mantendo o arquivo no disco) e **depois** adicione o padrão.
- Para ignorar em todos os seus projetos (arquivos do seu editor, por exemplo), use um arquivo global configurado em §core.excludesFile§.

### Mensagens de commit
Uma convenção amplamente adotada (e não uma regra do Git):
- Primeira linha curta (cerca de 50 caracteres), no imperativo ou no presente, dizendo **o que** a mudança faz.
- Linha em branco.
- Corpo opcional, com linhas de até cerca de 72 caracteres, explicando **por que** a mudança foi feita.

**Commits atômicos:** cada commit contém **uma** mudança lógica e deixa o projeto funcionando. Eles facilitam revisar, reverter (§git revert§) e achar bugs (§git bisect§).

### Conventional Commits
A especificação **Conventional Commits 1.0.0** define o formato:

    <tipo>[escopo opcional]: <descrição>

    [corpo opcional]

    [rodapé(s) opcional(is)]

Os tipos §feat§ (nova funcionalidade) e §fix§ (correção) têm significado definido; outros comuns são §docs§, §refactor§, §test§, §chore§ e §build§. Uma **mudança incompatível** (*breaking change*) é indicada com um §!§ antes dos dois-pontos (§feat(api)!: remove o campo login§) ou com um rodapé §BREAKING CHANGE: descrição§. Na relação com o versionamento semântico, §fix§ corresponde a uma versão PATCH, §feat§ a uma MINOR e qualquer mudança incompatível a uma MAJOR. Ferramentas leem esse padrão para gerar changelogs e calcular versões, tema da última aula do curso.`,
  concepts: [
    { term: 'Staged (preparado)', def: 'Alteração já copiada para a área de preparação, que irá no próximo commit.' },
    { term: 'git diff --staged', def: 'Mostra a diferença entre a área de preparação e o último commit.' },
    { term: 'git add -p', def: 'Prepara alterações por blocos, permitindo dividir uma edição em vários commits.' },
    { term: '.gitignore', def: 'Arquivo com padrões de caminhos que o Git não deve rastrear; não afeta arquivos já rastreados.' },
    { term: 'Commit atômico', def: 'Commit com uma única mudança lógica, que mantém o projeto funcionando.' },
    { term: 'Conventional Commits', def: 'Especificação de mensagens no formato tipo(escopo): descrição, legível por pessoas e ferramentas.' },
    { term: 'Breaking change', def: 'Mudança incompatível com versões anteriores; indicada com ! ou com o rodapé BREAKING CHANGE.' }
  ],
  examples: `**Analogia:** um commit atômico é uma fatura com um único item. Se há um erro, você contesta aquele item. Um commit com "ajustes gerais" é uma fatura com 40 itens misturados: ninguém sabe o que contestar.

**Exemplo de histórico bom:**

    feat(carrinho): permite aplicar cupom de desconto
    fix(carrinho): impede total negativo com cupom maior que a compra
    test(carrinho): cobre cupom expirado
    docs: documenta variáveis de ambiente

Cada linha conta uma história que se lê em segundos. Compare com "ajustes", "mais um teste", "agora vai".`,
  code: [
    { title: 'O ciclo básico e como preparar apenas parte do trabalho', lang: 'bash', code: `git status --short
git diff
git add -p src/carrinho.js
git add tests/carrinho.test.js
git diff --staged
git commit -m "feat(carrinho): permite aplicar cupom de desconto" -m "O desconto é limitado ao valor da compra para evitar total negativo."
git log --oneline -3`,
      notes: [ { l: '1', t: 'Visão curta do estado: duas colunas por arquivo.' }, { l: '2', t: 'Alterações ainda não preparadas.' }, { l: '3', t: 'Prepara só os blocos escolhidos de src/carrinho.js.' }, { l: '5', t: 'Confere exatamente o que irá no commit.' }, { l: '6', t: 'Dois -m criam duas partes: o título e o corpo da mensagem, separados por linha em branco.' } ] },
    { title: 'Um .gitignore típico de projeto Node.js', lang: 'bash', code: `# dependências
node_modules/

# builds
dist/
build/

# logs, mas guarde um exemplo
*.log
!exemplo.log

# segredos e configuração local
.env
.env.local

# arquivos do sistema e do editor
.DS_Store
.vscode/`,
      notes: [ { l: '2', t: 'Barra final: só diretórios com esse nome.' }, { l: '9-10', t: 'Ignora todos os .log e depois reinclui exemplo.log com a negação. A ordem importa: a negação vem depois.' }, { l: '13-14', t: 'Segredos nunca devem ir para o repositório. Mesmo ignorados, mantenha um .env.example com os nomes das variáveis (sem valores reais).' } ] },
    { title: 'Lendo uma mensagem Conventional Commits em JavaScript', lang: 'javascript', code: `function resumo(mensagem) {
  const cabecalho = mensagem.split('\\n')[0];
  const m = cabecalho.match(/^([a-z]+)(?:\\(([^()\\s]+)\\))?(!)?: (\\S.*)$/);
  if (!m) return null;
  const [, tipo, escopo, bang, descricao] = m;
  return { tipo, escopo: escopo ?? null, breaking: Boolean(bang), descricao };
}

console.log(resumo('feat(api)!: remove o campo login'));
// { tipo: 'feat', escopo: 'api', breaking: true, descricao: 'remove o campo login' }
console.log(resumo('ajustes')); // null`,
      notes: [ { l: '2', t: 'O cabeçalho é a primeira linha da mensagem.' }, { l: '3', t: 'A expressão regular reconhece: tipo, escopo opcional entre parênteses, "!" opcional, dois-pontos, espaço e descrição.' }, { l: '4', t: 'Mensagem fora do padrão: devolve null.' }, { l: '6', t: 'escopo ?? null troca undefined (grupo ausente) por null. Esta versão didática ainda não trata o rodapé BREAKING CHANGE: você completará isso no exercício.' } ] }
  ],
  bestPractices: ['Faça commits pequenos e atômicos, que deixem o projeto funcionando.', 'Revise com git diff --staged antes de cada commit.', 'Escreva a mensagem explicando o porquê, não só o quê.', 'Crie o .gitignore no início do projeto, antes do primeiro git add .', 'Prefira git add com nomes de arquivos ou -p a git add . quando houver dúvida sobre o que está na pasta.', 'Mantenha um .env.example e nunca commite o .env.'],
  mistakes: ['Usar git add . sem olhar o status e commitar arquivos de build, logs ou .env.', 'Mensagens como "ajustes", "fix", "wip" que não dizem nada.', 'Colocar no .gitignore um arquivo já rastreado e esperar que ele saia do repositório.', 'Misturar refatoração, correção e funcionalidade no mesmo commit.', 'Usar git restore arquivo sem lembrar que as alterações não commitadas serão perdidas.'],
  market: `Em equipes, o histórico é uma ferramenta de trabalho: revisores leem commits para entender mudanças e pipelines geram changelogs e versões a partir das mensagens (Conventional Commits). Vazamento de chaves por commit acidental de arquivos .env é um dos incidentes de segurança mais comuns em repositórios, e um bom .gitignore é a primeira barreira.`,
  summary: `O ciclo é status, diff, add, diff --staged, commit e log. git add -p divide alterações em commits separados. O .gitignore não afeta arquivos já rastreados e aceita negação com "!". Boas mensagens explicam o porquê e, no padrão Conventional Commits, seguem tipo(escopo): descrição, com ! ou BREAKING CHANGE para mudanças incompatíveis.`,
  refs: [REF.progit, REF.gitignore, REF.restore, REF.conventional],
  cards: [
    { q: 'O que git diff --staged mostra?', a: 'A diferença entre a área de preparação e o último commit.' },
    { q: 'Colocar um arquivo já commitado no .gitignore o remove do repositório?', a: 'Não. Use git rm --cached arquivo e depois adicione o padrão ao .gitignore.' },
    { q: 'Como indicar uma breaking change no Conventional Commits?', a: 'Com "!" antes dos dois-pontos (feat!: ...) ou com o rodapé BREAKING CHANGE: descrição.' },
    { q: 'Que comando tira um arquivo da área de preparação sem perder as alterações?', a: 'git restore --staged arquivo.' }
  ]
},
{
  id: 'git-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['git', 'branches', 'merge', 'conflitos'],
  title: 'Branches, merge e resolução de conflitos',
  objectives: ['Criar, listar, trocar e apagar branches', 'Diferenciar merge fast-forward de merge com commit de merge', 'Ler marcadores de conflito e resolvê-los', 'Abortar um merge e escolher nomes úteis para branches'],
  intro: `Branches permitem trabalhar em várias coisas ao mesmo tempo sem uma atrapalhar a outra. Merge junta o trabalho de volta. Na maioria das vezes o Git faz isso sozinho; quando duas pessoas mexem na mesma linha, ele para e pede a sua decisão. Perder o medo dos conflitos é um marco na vida de quem programa em equipe.`,
  theory: `### Trabalhando com branches
- §git branch§: lista as branches locais (a atual leva um asterisco).
- §git switch -c feature/login§: cria a branch **e** muda para ela.
- §git switch main§: muda para uma branch existente.
- §git branch -d feature/login§: apaga a branch **se já foi mesclada**; §-D§ força a exclusão (cuidado: commits sem outra referência podem ser perdidos).
- §git branch -m novo-nome§: renomeia a branch atual.

§git switch§ e §git restore§ dividem as funções que antes ficavam todas em §git checkout§. O §checkout§ continua funcionando, mas os comandos novos são mais claros: um troca de branch, o outro restaura arquivos.

Ao trocar de branch, o Git troca os arquivos do diretório de trabalho para o instantâneo daquela branch. Se você tem alterações não commitadas que conflitam com a troca, o Git recusa e avisa; use §git stash§ (aula 6) para guardá-las.

### Nomes de branch
Convenções comuns: §feature/descricao§, §fix/descricao§, §docs/descricao§, §chore/descricao§, em minúsculas e com hífens. Inclua o número da tarefa quando houver (§feature/123-carrinho§). Nomes curtos e descritivos ajudam quem lê o histórico.

### Merge: juntando o trabalho
Você está na branch que **recebe** o trabalho e executa §git merge outra-branch§. Há dois casos:

1. **Fast-forward:** o commit atual da sua branch é **ancestral** da outra (a sua branch não andou desde que a outra nasceu). O Git apenas **avança o ponteiro**, sem criar commit. Para forçar um commit de merge mesmo assim, use §--no-ff§.
2. **Merge de três vias:** as duas branches têm commits que a outra não tem (o histórico **divergiu**). O Git identifica o **ancestral comum** (*merge base*), compara cada lado com ele, combina as mudanças e cria um **commit de merge com dois pais**.

### Conflitos
Um conflito ocorre quando as duas branches alteraram a **mesma região** de um arquivo (ou uma alterou e a outra apagou). O Git não adivinha: interrompe o merge e marca o arquivo:

    <<<<<<< HEAD
    const taxa = 0.10;
    =======
    const taxa = 0.12;
    >>>>>>> feature/taxa

- Entre §<<<<<<<§ e §=======§: a versão da **sua branch atual** (HEAD).
- Entre §=======§ e §>>>>>>>§: a versão da **branch que está sendo mesclada**.
- Com §merge.conflictStyle§ configurado como §diff3§ (ou §zdiff3§), aparece também uma seção §|||||||§ com o texto **original** (da base), que ajuda a entender o que cada lado mudou.

**Como resolver:**
1. §git status§ lista os arquivos em conflito ("both modified").
2. Abra cada arquivo, decida o resultado final (uma das versões, as duas ou um texto novo) e **apague os marcadores**.
3. Rode os testes: o resultado combinado precisa funcionar.
4. §git add arquivo§ para marcar como resolvido.
5. §git commit§ (ou §git merge --continue§) para concluir.

Para desistir e voltar ao estado anterior ao merge: §git merge --abort§.

Dica prática: **converse** com a outra pessoa quando o conflito envolver lógica, não só texto. Escolher um lado sem entender pode apagar um trabalho inteiro.

### Reduzindo conflitos
- Branches de vida curta e integração frequente.
- Atualize a sua branch com a principal com regularidade.
- Commits e arquivos pequenos e com responsabilidade clara.
- Evite reformatar arquivos inteiros junto com mudanças de lógica.

### Visualizando
§git log --oneline --graph --decorate --all§ desenha as branches e os merges no terminal.`,
  concepts: [
    { term: 'Fast-forward', def: 'Merge em que a branch atual é ancestral da outra: o ponteiro apenas avança, sem commit de merge.' },
    { term: 'Merge de três vias', def: 'Merge que combina duas branches divergentes usando o ancestral comum, criando um commit com dois pais.' },
    { term: 'Merge base', def: 'Ancestral comum mais recente das duas branches, usado como referência no merge.' },
    { term: 'Conflito de merge', def: 'Situação em que as duas branches alteraram a mesma região e o Git exige decisão humana.' },
    { term: 'Marcadores de conflito', def: 'Linhas <<<<<<<, ======= e >>>>>>> que delimitam as duas versões em conflito.' },
    { term: 'git merge --abort', def: 'Cancela um merge em andamento e tenta restaurar o estado anterior.' }
  ],
  examples: `**Analogia:** duas pessoas editam cópias do mesmo documento. Se mexeram em parágrafos diferentes, juntar é automático. Se reescreveram o mesmo parágrafo, quem junta precisa ler as duas versões e decidir o texto final. O ancestral comum é a versão do documento de onde as duas cópias saíram.

**Diagrama de merge de três vias:**

    A---B---C          main
         \\
          D---E        feature

Depois de §git switch main§ e §git merge feature§, nasce o commit **M**, que tem **dois pais** (C e E). A merge base é **B**.

    A---B---C-------M  main
         \\         /
          D-------E    feature`,
  code: [
    { title: 'Fluxo completo: criar branch, trabalhar e mesclar', lang: 'bash', code: `git switch -c feature/cupom
echo "cupom" >> carrinho.txt
git add carrinho.txt
git commit -m "feat(carrinho): adiciona cupom"
git switch main
git merge feature/cupom
git branch -d feature/cupom
git log --oneline --graph --decorate`,
      notes: [ { l: '1', t: 'Cria a branch a partir do commit atual e já muda para ela.' }, { l: '2-4', t: 'Trabalho normal: o commit avança só a ponteiro feature/cupom.' }, { l: '5', t: 'Volta para a branch que vai receber o trabalho.' }, { l: '6', t: 'Se main não andou, o merge é fast-forward; se andou, cria um commit de merge.' }, { l: '7', t: '-d só apaga se a branch já foi mesclada: uma proteção.' } ] },
    { title: 'Resolvendo um conflito', lang: 'bash', code: `git switch main
git merge feature/taxa
# CONFLICT (content): Merge conflict in imposto.js
git status
# edite imposto.js, escolha o resultado e remova os marcadores
npm test
git add imposto.js
git commit
# ou, para desistir:  git merge --abort`,
      notes: [ { l: '2', t: 'O merge para no meio e avisa quais arquivos têm conflito.' }, { l: '4', t: 'status mostra "both modified" para os arquivos em conflito.' }, { l: '6', t: 'Teste o resultado combinado antes de concluir: um merge sem conflito de texto ainda pode quebrar o programa.' }, { l: '7-8', t: 'add marca como resolvido; commit conclui o merge com a mensagem padrão sugerida pelo Git.' } ] },
    { title: 'Lendo e resolvendo marcadores em JavaScript', lang: 'javascript', code: `function resolver(texto, escolha) {
  const saida = [];
  let lado = null; // null, 'nosso', 'base' ou 'deles'
  const nosso = [], deles = [];
  for (const linha of texto.split('\\n')) {
    if (linha.startsWith('<<<<<<< ')) { lado = 'nosso'; nosso.length = 0; deles.length = 0; }
    else if (linha.startsWith('|||||||') && lado) lado = 'base';
    else if (linha === '=======' && lado) lado = 'deles';
    else if (linha.startsWith('>>>>>>> ') && lado) {
      if (escolha === 'ours' || escolha === 'both') saida.push(...nosso);
      if (escolha === 'theirs' || escolha === 'both') saida.push(...deles);
      lado = null;
    }
    else if (lado === 'nosso') nosso.push(linha);
    else if (lado === 'deles') deles.push(linha);
    else if (lado === null) saida.push(linha);
  }
  return saida.join('\\n');
}

const t = ['a', '<<<<<<< HEAD', 'x = 1', '=======', 'x = 2', '>>>>>>> feature', 'b'].join('\\n');
console.log(resolver(t, 'theirs').split('\\n')); // ['a', 'x = 2', 'b']`,
      notes: [ { l: '3', t: 'lado indica em qual parte do bloco de conflito estamos.' }, { l: '6', t: 'Abre o bloco e guarda as linhas de cada lado em listas.' }, { l: '7', t: 'A seção da base (||||||| ) só existe com diff3; suas linhas são ignoradas.' }, { l: '10-11', t: 'Ao fechar o bloco, escreve na saída o lado escolhido.' }, { l: '16', t: 'Linhas fora de qualquer bloco são copiadas sem mudança.' } ] }
  ],
  bestPractices: ['Mantenha branches de vida curta e integre com frequência.', 'Use nomes descritivos com prefixo (feature/, fix/).', 'Antes de mesclar, confira em qual branch você está com git status.', 'Depois de resolver um conflito, rode os testes antes de concluir o commit.', 'Use git merge --abort sem culpa quando o conflito for maior do que o esperado.', 'Converse com quem escreveu o outro lado quando o conflito envolver lógica.'],
  mistakes: ['Fazer commit com marcadores de conflito (<<<<<<<) esquecidos no arquivo.', 'Resolver o conflito escolhendo sempre "o meu lado" sem entender o outro.', 'Mesclar estando na branch errada.', 'Usar git branch -D por impulso e perder commits ainda não mesclados.', 'Esquecer o git add depois de editar o arquivo em conflito.', 'Manter branches abertas por semanas e acumular conflitos.'],
  market: `Conflitos fazem parte da rotina de equipes. Saber resolvê-los com calma, rodar os testes e avisar o colega envolvido é uma habilidade esperada de quem entra em um time. Convenções de nomes de branch também aparecem em ferramentas: muitas automações usam o prefixo (fix/, feature/) para decidir o tipo de pipeline.`,
  summary: `Branches são ponteiros baratos: crie com git switch -c e apague com git branch -d. Merge pode ser fast-forward (só avança o ponteiro) ou de três vias (cria commit com dois pais). Em conflitos, edite o arquivo removendo os marcadores, rode os testes, git add e commit; git merge --abort cancela.`,
  refs: [REF.progit, REF.merge, REF.switch],
  cards: [
    { q: 'Quando um merge é fast-forward?', a: 'Quando o commit atual da sua branch é ancestral da branch que está sendo mesclada: o ponteiro apenas avança.' },
    { q: 'O que há entre <<<<<<< e =======?', a: 'A versão da sua branch atual (HEAD).' },
    { q: 'Como cancelar um merge com conflito?', a: 'git merge --abort.' },
    { q: 'Que comando cria uma branch e muda para ela?', a: 'git switch -c nome-da-branch.' }
  ]
},
{
  id: 'git-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['git', 'github', 'remotos', 'ssh'],
  title: 'Repositórios remotos e GitHub: clone, fetch, pull, push e autenticação',
  objectives: ['Conectar um repositório local a um remoto e explicar origin e upstream', 'Diferenciar fetch, pull e push', 'Entender por que um push é rejeitado e como resolver', 'Escolher entre HTTPS com token e SSH para autenticar'],
  intro: `Até aqui tudo aconteceu na sua máquina. Para colaborar, o histórico precisa ser compartilhado por meio de um repositório remoto, em geral no GitHub. Esta aula explica como os repositórios conversam, o que cada comando de rede faz e como se autenticar com segurança, sem digitar a senha da conta.`,
  theory: `### Remotos
Um **remoto** é outra cópia do repositório, identificada por uma URL e apelidada. O apelido padrão do repositório de onde você clonou é §origin§.
- §git clone <url>§: baixa o repositório completo, cria o remoto §origin§ e deixa a branch principal local acompanhando a remota.
- §git remote -v§: lista os remotos e suas URLs.
- §git remote add origin <url>§: conecta um repositório local existente a um remoto.

### Branches de acompanhamento remoto
Depois de buscar dados do remoto, o Git guarda no seu repositório cópias das branches remotas, como §origin/main§. Elas são **somente leitura** e só se atualizam quando você conversa com o remoto. Uma branch local pode ter um **upstream**: a branch remota com a qual ela se compara e sincroniza. §git branch -vv§ mostra isso e quantos commits você está à frente ou atrás.

### Os comandos de rede
- **§git fetch§:** baixa commits novos do remoto e atualiza §origin/*§, **sem alterar** suas branches nem seus arquivos. É sempre seguro.
- **§git pull§:** é um §fetch§ seguido de integração na branch atual (por padrão, um merge). Com §git pull --rebase§ (ou a configuração §pull.rebase§), a integração usa rebase em vez de merge.
- **§git push§:** envia os seus commits para a branch remota correspondente.
- §git push -u origin minha-branch§: envia e grava o **upstream**, para que §git pull§ e §git push§ sem argumentos passem a funcionar para essa branch.
- §git fetch --prune§: também remove as referências locais a branches que já foram apagadas no remoto.

### Push rejeitado
Se alguém enviou commits para a mesma branch depois do seu último fetch, o push é recusado (mensagem como "rejected ... fetch first" ou "non-fast-forward"): o remoto tem commits que você não tem, e aceitar o seu push apagaria o trabalho deles. A solução é **integrar primeiro**: §git pull§ (ou §fetch§ e merge/rebase), resolver conflitos se houver, e enviar de novo. **Não** resolva com §git push --force§ em branch compartilhada.

Se for realmente necessário reescrever uma branch já enviada (por exemplo, a **sua** branch de feature depois de um rebase), prefira §git push --force-with-lease§: ele só força se o remoto ainda estiver no estado que você viu, evitando apagar commits que chegaram nesse meio tempo.

### Autenticação com GitHub
Existem dois caminhos para falar com o GitHub:
1. **HTTPS** (§https://github.com/dono/repo.git§): você se autentica com um **personal access token** no lugar da senha. A documentação recomenda tokens **fine-grained** (restritos a um dono e a repositórios específicos), mais seguros que os *classic*, que têm escopos amplos. Use um **gerenciador de credenciais** (como o Git Credential Manager ou o *credential helper* do sistema) para não digitar o token toda vez e para não guardá-lo em texto puro.
2. **SSH** (§git@github.com:dono/repo.git§): você gera um par de chaves, cadastra a **chave pública** na sua conta e mantém a **chave privada** só na sua máquina. Um par moderno é gerado com §ssh-keygen -t ed25519 -C "voce@exemplo.com"§. Proteja a chave privada com uma frase-senha e nunca a compartilhe.

Em qualquer dos casos: **nunca** coloque tokens ou chaves privadas no repositório, em mensagens de commit ou em capturas de tela.

### Clonar, fazer fork ou usar como modelo
- **Clone:** cópia local de um repositório.
- **Fork:** cópia **no GitHub** na sua conta, usada para propor mudanças em projetos aos quais você não tem permissão de escrita (você clona o fork e abre um pull request para o original). Convencionalmente, o remoto do projeto original é chamado de §upstream§.
- **Template:** repositório marcado como modelo, a partir do qual você cria um novo sem herdar o histórico.

### Um bom repositório começa com
§README.md§ (o que é, como rodar, como contribuir), §LICENSE§ (as permissões de uso), §.gitignore§ e, quando fizer sentido, §CONTRIBUTING.md§.`,
  concepts: [
    { term: 'Remoto (remote)', def: 'Outra cópia do repositório, acessada por URL; o apelido padrão é origin.' },
    { term: 'origin/main', def: 'Branch de acompanhamento remoto: cópia local, somente leitura, do estado de main no remoto.' },
    { term: 'Upstream', def: 'Branch remota com a qual uma branch local se compara e sincroniza.' },
    { term: 'git fetch', def: 'Baixa novidades do remoto sem alterar suas branches locais.' },
    { term: 'git pull', def: 'Fetch seguido de integração (merge, ou rebase com --rebase) na branch atual.' },
    { term: 'Push rejeitado', def: 'Recusa do remoto porque ele tem commits que você não tem; integre antes de enviar.' },
    { term: 'Personal access token', def: 'Credencial gerada no GitHub usada no lugar da senha em operações Git via HTTPS.' },
    { term: 'Chave SSH', def: 'Par de chaves: a pública fica na conta e a privada fica só na sua máquina.' },
    { term: 'Fork', def: 'Cópia de um repositório na sua conta do GitHub, usada para contribuir com projetos de terceiros.' }
  ],
  examples: `**Analogia:** o remoto é uma pasta compartilhada da equipe. §fetch§ é olhar o que os colegas colocaram lá, sem mexer nos seus documentos. §pull§ é olhar e já misturar no seu. §push§ é colocar o seu trabalho na pasta. Se alguém colocou algo novo antes de você, o sistema pede para você olhar primeiro, e é isso que o "push rejeitado" faz.

**Exemplo de fluxo de início de dia:**

    git switch main
    git pull
    git switch -c feature/relatorio

Atualize a principal antes de criar uma branch nova: você parte do estado mais recente e reduz conflitos.`,
  code: [
    { title: 'Conectando um projeto local ao GitHub', lang: 'bash', code: `git remote add origin git@github.com:ana/meu-projeto.git
git remote -v
git push -u origin main
git branch -vv`,
      notes: [ { l: '1', t: 'Registra o remoto origin com a URL SSH. O repositório vazio precisa já existir no GitHub.' }, { l: '2', t: 'Confere as URLs de fetch e push.' }, { l: '3', t: '-u grava o upstream: depois disso, git push e git pull dispensam argumentos.' }, { l: '4', t: 'Mostra cada branch local, seu upstream e quantos commits à frente ou atrás.' } ] },
    { title: 'Resolvendo um push rejeitado', lang: 'bash', code: `git push
# ! [rejected] main -> main (fetch first)
git fetch
git log --oneline --graph --decorate main origin/main
git pull --rebase
git push`,
      notes: [ { l: '2', t: 'Alguém enviou commits antes de você: o remoto tem algo que você não tem.' }, { l: '3-4', t: 'Buscar e olhar o grafo mostra o que divergiu antes de integrar.' }, { l: '5', t: 'pull --rebase reaplica os seus commits por cima dos novos, mantendo o histórico linear. Um pull comum faria um merge.' }, { l: '6', t: 'Agora o push é um avanço simples e é aceito.' } ] },
    { title: 'Identificando dono e repositório a partir da URL (JavaScript)', lang: 'javascript', code: `function lerRemoto(url) {
  const m =
    url.match(/^https?:\\/\\/([^/]+)\\/([^/]+)\\/([^/]+?)(?:\\.git)?\\/?$/) ||
    url.match(/^git@([^:]+):([^/]+)\\/([^/]+?)(?:\\.git)?$/);
  if (!m) return null;
  return { host: m[1], dono: m[2], repo: m[3] };
}

console.log(lerRemoto('git@github.com:ana/app.git'));         // { host: 'github.com', dono: 'ana', repo: 'app' }
console.log(lerRemoto('https://github.com/ana/app'));          // { host: 'github.com', dono: 'ana', repo: 'app' }`,
      notes: [ { l: '3', t: 'Formato HTTPS: https://host/dono/repo(.git)(/).' }, { l: '4', t: 'Formato scp-like do SSH: git@host:dono/repo(.git).' }, { l: '3-4', t: '+? (preguiçoso) deixa o ".git" final fora do nome do repositório.' }, { l: '5', t: 'Qualquer outro formato: null.' } ] }
  ],
  bestPractices: ['Faça git pull (ou fetch) antes de começar a trabalhar e antes de enviar.', 'Use git fetch para olhar antes de integrar quando houver dúvida.', 'Autentique com token fine-grained (HTTPS) ou chave SSH protegida por frase-senha.', 'Use um gerenciador de credenciais; nunca guarde tokens em arquivos do projeto.', 'Prefira --force-with-lease a --force, e só em branches suas.', 'Inclua README, LICENSE e .gitignore desde o primeiro commit do repositório.'],
  mistakes: ['Resolver push rejeitado com git push --force em branch compartilhada.', 'Usar a senha da conta do GitHub no HTTPS: o token a substitui.', 'Commitar o token ou a chave privada.', 'Achar que git pull não altera nada: ele integra na sua branch e pode gerar conflitos.', 'Esquecer o -u e estranhar que git pull não sabe de onde puxar.', 'Clonar de um fork e esquecer que o projeto original é outro remoto.'],
  market: `Equipes inteiras se sincronizam por push e pull o dia todo. Problemas de autenticação são um dos primeiros obstáculos de quem entra em uma empresa nova; saber trabalhar com SSH e tokens economiza horas. O hábito de "puxar antes de empurrar" e de nunca forçar push em branch compartilhada evita perda de trabalho, um dos erros mais caros em times.`,
  summary: `Remotos são cópias identificadas por URL; origin é o apelido padrão. fetch baixa sem alterar suas branches; pull é fetch mais integração; push envia commits. Push rejeitado significa que o remoto tem commits seus desconhecidos: integre primeiro. Autentique com token fine-grained no HTTPS ou com chave SSH, e nunca versione credenciais.`,
  refs: [REF.progit, REF.push, REF.ghToken, REF.docs],
  cards: [
    { q: 'Qual a diferença entre git fetch e git pull?', a: 'fetch só baixa e atualiza origin/*; pull é fetch mais integração (merge ou rebase) na branch atual.' },
    { q: 'O que significa um push "rejected (fetch first)"?', a: 'O remoto tem commits que você não tem. Integre (pull) e envie de novo.' },
    { q: 'O que --force-with-lease faz de diferente de --force?', a: 'Só força se o remoto ainda estiver no estado que você viu, evitando apagar commits que chegaram depois.' },
    { q: 'O que o -u faz em git push -u origin main?', a: 'Grava origin/main como upstream da branch local, para git pull e git push sem argumentos.' }
  ]
}
];
