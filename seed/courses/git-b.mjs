// Curso 2 — Git e GitHub na prática. Aulas 5 a 7.
import { REF } from './git-a.mjs';

export const lessonsB = [
{
  id: 'git-05', moduleId: 'm3', order: 5, minutes: 75, tags: ['git', 'reset', 'revert', 'reflog'],
  title: 'Desfazendo e recuperando: restore, reset, revert e reflog',
  objectives: ['Escolher o comando certo para desfazer cada situação', 'Diferenciar reset --soft, --mixed e --hard', 'Usar revert para desfazer commits já publicados', 'Recuperar commits "perdidos" com o reflog'],
  intro: `Todo mundo erra: commit na branch errada, mensagem com erro de digitação, arquivo que não devia ir. O Git oferece uma ferramenta para cada caso, e a regra de ouro separa todas elas: **o que ainda é só seu pode ser reescrito; o que já foi compartilhado deve ser desfeito com um novo commit**.`,
  theory: `### Mapa de decisão
| Situação | Comando |
|---|---|
| Descartar alterações não commitadas de um arquivo | §git restore arquivo§ (irreversível) |
| Tirar arquivo da área de preparação | §git restore --staged arquivo§ |
| Corrigir o **último** commit (mensagem ou conteúdo), ainda não enviado | §git commit --amend§ |
| Desfazer commits **locais**, ainda não enviados | §git reset§ |
| Desfazer commit **já enviado/compartilhado** | §git revert§ |
| Recuperar algo "perdido" | §git reflog§ |

### git restore
§git restore§ restaura arquivos. Sem opções, traz o conteúdo da **área de preparação** para o diretório de trabalho, **descartando alterações não commitadas**. Com §--staged§, atua só na área de preparação (equivale a "tirar do add"). Com §--source=<commit>§, restaura de um commit específico.

### git commit --amend
Substitui o último commit por um novo (com a mensagem corrigida e/ou o conteúdo atual da área de preparação). Como cria um **novo commit com outro hash**, só use se o commit ainda não foi enviado.

### git reset: mover a branch
§git reset <commit>§ move a **branch atual** para o commit indicado. O que acontece com as outras áreas depende da opção:

| Opção | Branch | Área de preparação | Diretório de trabalho |
|---|---|---|---|
| §--soft§ | move | **mantém** | mantém |
| §--mixed§ (padrão) | move | **zera** (igual ao commit) | mantém |
| §--hard§ | move | zera | **zera (perde alterações)** |

Usos típicos:
- §git reset --soft HEAD~1§: "desfaz" o commit, mas deixa tudo preparado. Útil para refazer a mensagem ou juntar commits.
- §git reset HEAD~1§: desfaz o commit e deixa as alterações no diretório de trabalho, não preparadas.
- §git reset --hard HEAD~1§: descarta o commit **e** as alterações. Perigoso: alterações não commitadas não voltam.

§HEAD~1§ é o pai de HEAD; §HEAD~2§, o avô. §reset§ **reescreve** a ponta da branch: não use em commits que outras pessoas já baixaram.

### git revert: desfazer sem reescrever
§git revert <commit>§ cria um **novo commit** que aplica o inverso das mudanças do commit indicado. O histórico original permanece e o desfazer fica registrado. É o método seguro para branches compartilhadas. Para reverter um commit de merge é preciso informar qual pai considerar com §-m 1§ (normalmente o pai 1 é a branch em que o merge foi feito). Se houver conflito, resolva como em um merge e use §git revert --continue§.

### git reflog: a rede de segurança
O Git registra, **localmente**, cada movimento de HEAD e das branches. §git reflog§ mostra esse diário. Depois de um §reset --hard§ equivocado, localize o hash anterior no reflog (§HEAD@{1}§, §HEAD@{2}§...) e volte: §git reset --hard HEAD@{1}§ ou crie uma branch no ponto: §git switch -c recuperada <hash>§. Limites: o reflog é **local** (não vai para o remoto), expira depois de dias ou semanas (configurável) e não recupera alterações que **nunca foram commitadas**.

Por isso: commite com frequência (mesmo um commit provisório). O que foi commitado quase sempre pode ser recuperado; o que não foi, não.

### Reescrever histórico e a regra de ouro
Comandos que **reescrevem** commits (§amend§, §reset§, §rebase§) criam commits novos com hashes diferentes. Se alguém já baseou trabalho nos antigos, o histórico dos dois diverge e gera confusão. Regra: **reescreva só o que ainda é seu; desfaça o que é de todos com revert**.

### Erros graves: segredos commitados
Se uma chave ou senha foi commitada e enviada, **considere-a comprometida**: revogue-a e gere outra **primeiro**. Remover do histórico (com ferramentas como §git filter-repo§) é uma etapa secundária; apagar em um commit novo não basta, porque o segredo continua no histórico e em clones.`,
  concepts: [
    { term: 'reset --soft', def: 'Move a branch e mantém área de preparação e diretório de trabalho.' },
    { term: 'reset --mixed', def: 'Move a branch e zera a área de preparação, mantendo o diretório de trabalho (padrão).' },
    { term: 'reset --hard', def: 'Move a branch e zera tudo, perdendo alterações não commitadas.' },
    { term: 'git revert', def: 'Cria um novo commit que desfaz as mudanças de outro, sem reescrever o histórico.' },
    { term: 'git commit --amend', def: 'Substitui o último commit por um novo, com outro hash.' },
    { term: 'reflog', def: 'Diário local dos movimentos de HEAD e branches, usado para recuperar commits.' },
    { term: 'HEAD~1', def: 'O pai do commit atual.' }
  ],
  examples: `**Analogia:** o histórico compartilhado é um livro-razão contábil. Para corrigir um lançamento errado já assinado, você faz um **lançamento de estorno** (revert), não arranca a página. Já o rascunho que só você viu pode ser amassado e jogado fora (reset). O reflog é a câmera de segurança: mostra tudo o que aconteceu no cofre, mas só se o objeto chegou a ser guardado.

**Cenário:** você fez \`git reset --hard HEAD~2\` por engano.

    git reflog
    # a1b2c3d HEAD@{0}: reset: moving to HEAD~2
    # 9e8d7c6 HEAD@{1}: commit: feat: adiciona filtro
    git reset --hard HEAD@{1}`,
  code: [
    { title: 'Escolhendo a ferramenta certa', lang: 'bash', code: `# 1) errei a mensagem do último commit (ainda não enviei)
git commit --amend -m "fix(auth): corrige expiração do token"

# 2) quero refazer os dois últimos commits como um só
git reset --soft HEAD~2
git commit -m "feat(busca): adiciona filtro por data"

# 3) o commit abc1234 já está no remoto e quebrou a produção
git revert abc1234
git push`,
      notes: [ { l: '2', t: 'amend: novo commit no lugar do último. Seguro só se ainda não foi enviado.' }, { l: '5-6', t: 'reset --soft volta a ponta da branch dois commits, mantendo tudo preparado; um novo commit junta o trabalho.' }, { l: '9-10', t: 'revert cria um commit que desfaz abc1234; como não reescreve história, um push comum basta.' } ] },
    { title: 'Recuperando commits depois de um reset --hard', lang: 'bash', code: `git reflog
git switch -c recuperacao HEAD@{1}
git log --oneline -3`,
      notes: [ { l: '1', t: 'Lista os movimentos recentes de HEAD, com os hashes.' }, { l: '2', t: 'Cria uma branch no ponto anterior sem mexer na atual, uma forma mais cautelosa que outro reset --hard.' } ] },
    { title: 'Simulando os modos do reset (JavaScript)', lang: 'javascript', code: `function reset(estado, modo, alvo) {
  const novo = { ...estado, branch: alvo };
  if (modo === 'mixed' || modo === 'hard') novo.staging = alvo;
  if (modo === 'hard') novo.arvore = alvo;
  return novo;
}

const antes = { branch: 'C3', staging: 'C3+x', arvore: 'C3+x+y' };
console.log(reset(antes, 'soft', 'C2'));
// { branch: 'C2', staging: 'C3+x', arvore: 'C3+x+y' }
console.log(reset(antes, 'mixed', 'C2'));
// { branch: 'C2', staging: 'C2', arvore: 'C3+x+y' }
console.log(reset(antes, 'hard', 'C2'));
// { branch: 'C2', staging: 'C2', arvore: 'C2' }`,
      notes: [ { l: '1-6', t: 'Modela as três áreas como três campos: o reset sempre move a branch; mixed também zera a preparação; hard zera tudo.' }, { l: '12-14', t: 'No hard o diretório de trabalho volta ao alvo: "C3+x+y" foi perdido.' } ] }
  ],
  bestPractices: ['Antes de um comando destrutivo, confira com git status e git log.', 'Prefira revert para o que já foi compartilhado.', 'Faça commits provisórios com frequência: o que foi commitado é recuperável.', 'Para testar um reset arriscado, crie antes uma branch de backup: git branch backup.', 'Se um segredo vazou, revogue-o antes de qualquer outra coisa.'],
  mistakes: ['Usar reset --hard e perder alterações nunca commitadas.', 'Fazer amend ou reset em commit já enviado e depois precisar de push forçado.', 'Reverter um merge sem informar -m.', 'Achar que apagar o arquivo em um novo commit remove um segredo do histórico.', 'Esperar que o reflog recupere trabalho nunca commitado.'],
  market: `Saber desfazer com segurança é o que dá confiança para trabalhar rápido. Em incidentes de produção, o revert é a ação padrão: rápida, auditável e sem reescrever o histórico da equipe. Vazamento de credenciais exige resposta imediata (revogar), e quem já treinou o procedimento reage sem pânico.`,
  summary: `restore descarta alterações do arquivo ou tira da preparação. amend corrige o último commit local. reset move a branch (soft mantém tudo, mixed zera a preparação, hard zera tudo). revert desfaz criando um commit novo e é o método para o que já foi compartilhado. O reflog registra movimentos locais e salva commits perdidos, mas não alterações nunca commitadas.`,
  refs: [REF.reset, REF.revert, REF.reflog, REF.restore],
  cards: [
    { q: 'Qual a diferença entre reset --soft e --mixed?', a: 'Ambos movem a branch; --soft mantém a área de preparação e --mixed a zera. Nenhum mexe no diretório de trabalho.' },
    { q: 'Como desfazer um commit já publicado sem reescrever o histórico?', a: 'git revert <commit>: cria um novo commit que aplica o inverso.' },
    { q: 'O reflog recupera alterações nunca commitadas?', a: 'Não. Só registra movimentos de HEAD e das branches.' },
    { q: 'Por que não usar reset em commits já enviados?', a: 'Reescreve o histórico e diverge do que os colegas já baixaram.' }
  ]
},
{
  id: 'git-06', moduleId: 'm3', order: 6, minutes: 75, tags: ['git', 'rebase', 'stash', 'cherry-pick', 'bisect'],
  title: 'Ferramentas avançadas: stash, rebase, cherry-pick, tags e bisect',
  objectives: ['Guardar trabalho temporário com stash', 'Explicar a diferença entre merge e rebase e a regra de não rebasear o que é público', 'Aplicar um commit específico com cherry-pick', 'Marcar versões com tags e achar um bug com bisect'],
  intro: `Estas ferramentas resolvem situações do dia a dia: "preciso trocar de branch agora, mas meu trabalho está pela metade", "quero um histórico linear", "preciso levar só aquela correção para outra branch", "o bug apareceu em algum momento nas últimas 200 mudanças". Cada uma é simples quando você lembra do modelo: commits são instantâneos encadeados.`,
  theory: `### git stash: guardar e voltar
§git stash§ guarda as alterações rastreadas (preparadas ou não) em uma pilha e deixa o diretório de trabalho limpo.
- §git stash push -m "descrição"§: guarda com um nome. Use §-u§ para incluir arquivos não rastreados.
- §git stash list§: lista a pilha.
- §git stash pop§: reaplica o mais recente **e o remove** da pilha; §git stash apply§ reaplica **sem remover**.
- §git stash drop§: apaga um item.
O stash é local e temporário. Para algo que vai durar dias, crie uma branch e faça um commit.

### Merge versus rebase
Ambos integram o trabalho de uma branch em outra, de formas diferentes:
- **merge** preserva o histórico como aconteceu e cria um commit de merge.
- **rebase** pega os seus commits, "levanta" e **reaplica um a um** sobre a ponta de outra branch. Resultado: histórico **linear**, mas com **commits novos** (hashes diferentes).

Uso mais comum: você está em §feature§ e quer trazer as novidades de §main§:

    git switch feature
    git rebase main

Se houver conflito, resolva, §git add§ e §git rebase --continue§. §git rebase --abort§ cancela e volta ao início.

**A regra de ouro do rebase:** nunca faça rebase de commits que **já foram enviados e que outras pessoas podem ter baixado**. Como os hashes mudam, o histórico delas diverge do seu. Sua própria branch de feature, ainda não compartilhada, pode ser rebaseada (e enviada depois com §--force-with-lease§).

### Rebase interativo
§git rebase -i HEAD~4§ abre uma lista dos quatro últimos commits em que você escolhe, por commit: §pick§ (manter), §reword§ (mudar a mensagem), §squash§/§fixup§ (juntar ao anterior), §drop§ (descartar) e reordenar linhas. É a forma de **limpar o histórico** da sua branch antes de abrir um pull request.

### Merge versus rebase: quando usar
- Quer preservar o contexto exato de uma integração e a branch é compartilhada: merge.
- Quer um histórico linear e fácil de ler na **sua** branch local: rebase.
- Equipes combinam uma política (por exemplo, "rebase na sua feature, merge via pull request") e a seguem.

### git cherry-pick
§git cherry-pick <commit>§ aplica as mudanças de **um** commit como um novo commit na branch atual. Útil para levar uma correção para uma branch de manutenção. Cria um commit novo (hash diferente) e pode gerar conflitos. Se for muito usado, talvez as branches estejam mal organizadas.

### Tags: marcando versões
Uma **tag** é um nome fixo para um commit (ao contrário da branch, não se move).
- **Anotada** (§git tag -a v1.2.0 -m "Versão 1.2.0"§): objeto com autor, data e mensagem. É a recomendada para releases.
- **Leve** (§git tag v1.2.0§): apenas um nome.
- Tags **não** vão no §git push§ normal: use §git push origin v1.2.0§ (ou §git push --tags§).

### git bisect: busca binária de um bug
Se o bug existe agora e não existia há 200 commits, o §bisect§ aplica **busca binária** no histórico, a mesma ideia da aula de Big O: cerca de log₂(200) ≈ 8 testes.
1. §git bisect start§
2. §git bisect bad§ (o commit atual tem o bug)
3. §git bisect good v1.0.0§ (um commit sabidamente bom)
4. O Git faz checkout do commit do meio: você testa e diz §git bisect good§ ou §git bisect bad§.
5. Repita até o Git apontar o **primeiro commit ruim**.
6. §git bisect reset§ volta à branch original.
Com um script de teste que retorne código 0 para bom e diferente de 0 para ruim, §git bisect run ./teste.sh§ automatiza tudo. Commits pequenos e atômicos tornam o resultado muito mais útil.

### git log e busca no histórico
Além do §blame§ da aula 2, §git log -S"texto"§ encontra commits que adicionaram ou removeram aquele texto, e §git log --grep="palavra"§ busca nas mensagens.`,
  concepts: [
    { term: 'git stash', def: 'Guarda alterações em uma pilha local e limpa o diretório de trabalho.' },
    { term: 'Rebase', def: 'Reaplica commits sobre outra base, criando commits novos e um histórico linear.' },
    { term: 'Rebase interativo', def: 'Permite reordenar, juntar (squash), renomear e descartar commits da sua branch.' },
    { term: 'Cherry-pick', def: 'Aplica as mudanças de um commit específico como um novo commit na branch atual.' },
    { term: 'Tag anotada', def: 'Marca um commit com autor, data e mensagem; indicada para releases.' },
    { term: 'git bisect', def: 'Busca binária no histórico para achar o primeiro commit que introduziu um bug.' }
  ],
  examples: `**Analogia do rebase:** você escreveu uma redação a partir da versão 1 do enunciado e o professor entregou a versão 2. O merge junta as duas e anota "unificado". O rebase **reescreve a sua redação como se você tivesse começado da versão 2**: fica mais limpo, mas é uma redação nova. Se alguém já tinha copiado a sua antiga, as duas cópias deixam de bater.

**Analogia do bisect:** achar a página de um livro onde ele "começou a ficar com defeito": abra no meio, veja se já está ruim, e descarte metade a cada passo.`,
  code: [
    { title: 'Guardando o trabalho para atender uma urgência', lang: 'bash', code: `git stash push -m "wip: filtro de busca"
git switch -c fix/login-urgente main
# ... corrige, commita e envia ...
git switch feature/busca
git stash pop`,
      notes: [ { l: '1', t: 'Guarda as alterações com um nome e deixa a árvore limpa.' }, { l: '2', t: 'Troca com segurança para tratar a urgência.' }, { l: '5', t: 'pop reaplica e remove da pilha. Se houver conflito, o item permanece na pilha.' } ] },
    { title: 'Atualizando a feature com rebase e limpando o histórico', lang: 'bash', code: `git fetch origin
git rebase origin/main
git rebase -i origin/main
git push --force-with-lease`,
      notes: [ { l: '2', t: 'Reaplica os commits da feature sobre o main mais recente.' }, { l: '3', t: 'Abre o editor para juntar commits "wip" e melhorar mensagens.' }, { l: '4', t: 'A branch foi reescrita, então o push comum seria rejeitado. --force-with-lease protege contra sobrescrever commits de outras pessoas. Só em branch sua.' } ] },
    { title: 'Bisect como busca binária (JavaScript)', lang: 'javascript', code: `// commits[0] é o mais antigo; bom(i) diz se o commit i está sem o bug
function primeiroRuim(n, bom) {
  let lo = 0, hi = n - 1; // assume bom(lo) === true e bom(hi) === false
  let testes = 0;
  while (hi - lo > 1) {
    const meio = Math.floor((lo + hi) / 2);
    testes++;
    if (bom(meio)) lo = meio; else hi = meio;
  }
  return { indice: hi, testes };
}

console.log(primeiroRuim(200, i => i < 137)); // { indice: 137, testes: 8 }`,
      notes: [ { l: '3', t: 'Invariante: lo é bom e hi é ruim. O primeiro ruim está entre eles.' }, { l: '6-9', t: 'Cada teste descarta metade do intervalo, o mesmo que git bisect faz.' }, { l: '13', t: 'Para 200 commits bastam 8 testes, contra até 199 em uma busca linear.' } ] }
  ],
  bestPractices: ['Use stash para trocas rápidas e branches para trabalho que dura.', 'Faça rebase apenas de commits ainda não compartilhados.', 'Limpe a sua branch com rebase interativo antes de abrir o pull request.', 'Use tags anotadas para marcar releases.', 'Escreva commits pequenos: o bisect aponta o culpado com precisão.', 'Prefira --force-with-lease a --force.'],
  mistakes: ['Rebasear a main ou uma branch compartilhada.', 'Esquecer arquivos novos no stash (precisam de -u).', 'Esquecer de enviar as tags (push não as envia por padrão).', 'Usar cherry-pick em excesso e duplicar commits entre branches.', 'Rodar bisect com um teste não confiável.'],
  market: `Histórico limpo e commits pequenos são pré-requisito para revisão ágil. O bisect economiza horas em regressões e é padrão em projetos grandes. Convenções de tag alimentam pipelines de release: muitos sistemas disparam uma publicação quando uma tag como v1.2.0 é enviada.`,
  summary: `stash guarda trabalho temporário. Rebase reaplica commits sobre outra base criando commits novos e um histórico linear, e nunca deve ser usado em commits compartilhados. O rebase interativo limpa a branch. cherry-pick leva um commit para outra branch. Tags anotadas marcam versões e precisam ser enviadas. bisect acha o primeiro commit ruim por busca binária.`,
  refs: [REF.progit, REF.bisect, REF.docs],
  cards: [
    { q: 'Qual a regra de ouro do rebase?', a: 'Não rebasear commits que já foram enviados e que outras pessoas podem ter baixado.' },
    { q: 'Qual a diferença entre stash pop e stash apply?', a: 'pop reaplica e remove da pilha; apply reaplica e mantém na pilha.' },
    { q: 'Como enviar uma tag ao remoto?', a: 'git push origin <tag> (ou git push --tags). O push comum não envia tags.' },
    { q: 'Quantos testes o bisect faz em ~200 commits?', a: 'Cerca de log₂(200), ou seja, 8.' }
  ]
},
{
  id: 'git-07', moduleId: 'm4', order: 7, minutes: 80, tags: ['github', 'pull-request', 'fluxo', 'versionamento', 'seguranca'],
  title: 'Colaboração no GitHub: pull requests, fluxo de trabalho, versões e segurança',
  objectives: ['Conduzir o GitHub flow do branch ao merge', 'Escrever e revisar um pull request', 'Comparar merge commit, squash e rebase merge', 'Calcular a próxima versão com SemVer e Conventional Commits', 'Aplicar práticas básicas de segurança em repositórios'],
  intro: `Dominar os comandos é metade do trabalho. A outra metade é o **processo**: como a equipe propõe, revisa e integra mudanças. Esta aula junta tudo: do branch ao pull request, do merge à versão publicada, com os cuidados de segurança que evitam incidentes.`,
  theory: `### GitHub flow
Fluxo leve e baseado em branches, descrito na documentação do GitHub:
1. **Crie uma branch** a partir da principal, com nome descritivo.
2. **Faça mudanças** e commits.
3. **Envie** a branch ao remoto.
4. **Abra um pull request (PR)**.
5. **Revisão**: colegas comentam, pedem ajustes e aprovam.
6. **Merge** na branch principal.
7. **Apague** a branch.
A principal deve estar sempre em estado que pode ser publicado.

### O pull request
Um PR é uma **proposta de mudança** com discussão. Um bom PR:
- é **pequeno** e focado em um assunto (centenas de linhas, não milhares);
- tem **título claro** e uma descrição que diz *o que* mudou, *por que* e *como testar*;
- referencia a tarefa (§Closes #123§ na descrição fecha a issue ao mesclar);
- passa pelas **verificações automáticas** (testes, lint) antes da revisão;
- pode ser aberto como **rascunho** (*draft*) enquanto ainda está em andamento.

### Revisão de código
**Quem revisa:** leia o código com respeito, pergunte antes de afirmar, separe o que **bloqueia** (bug, segurança, falta de teste) do que é **sugestão** (estilo), elogie o que está bom e responda em tempo razoável.
**Quem recebe:** não leve para o lado pessoal, explique decisões, responda a cada comentário e peça esclarecimento quando precisar.

### Métodos de merge no GitHub
O GitHub oferece três formas de mesclar um PR (conforme a documentação, o repositório pode habilitar cada uma):
| Método | Resultado |
|---|---|
| **Merge commit** | Mantém todos os commits da branch e cria um commit de merge. |
| **Squash and merge** | Combina todos os commits do PR em **um só** na principal. |
| **Rebase and merge** | Reaplica os commits do PR sobre a principal, **sem** commit de merge. |
O squash gera histórico enxuto (um commit por PR), mas perde a granularidade dos commits individuais. O merge commit preserva tudo. Combine com a equipe e mantenha o título do PR no padrão de mensagens quando usar squash.

### Proteção de branches
Em repositórios com colaboração, a branch principal pode ser **protegida** por regras (*protected branches*), como exigir **revisão aprovada**, exigir que as **verificações de status** passem, bloquear **force push** e impedir exclusão. Isso transfere o processo do "combinado" para o "imposto". Um arquivo **CODEOWNERS** pode indicar quem deve revisar cada parte do código.

### Estratégias de branching
- **GitHub flow:** uma principal e branches curtas por tarefa. Simples e adequado a publicação contínua.
- **Trunk-based development:** todos integram na principal (o "tronco") com frequência, em branches de **vida muito curta** ou diretamente, apoiados por testes automáticos e feature flags.
- **Gitflow:** branches de longa vida (§develop§, §release/*§, §hotfix/*§). Útil quando há várias versões em suporte, mas gera mais conflitos e cerimônia.
Escolha pela necessidade de release do produto, não pela moda.

### Versionamento semântico e releases
O **SemVer 2.0.0** define versões §MAJOR.MINOR.PATCH§:
- **MAJOR**: mudanças incompatíveis na API;
- **MINOR**: funcionalidade nova compatível;
- **PATCH**: correção compatível.
Ao subir MAJOR, zera-se MINOR e PATCH; ao subir MINOR, zera-se PATCH. Combinado com **Conventional Commits**: §fix§ → PATCH, §feat§ → MINOR, e qualquer breaking change → MAJOR. Um **changelog** organiza as mudanças por versão; o projeto final do curso gera isso automaticamente a partir dos commits. Releases são marcadas com **tags** e publicadas na aba de releases do GitHub.

### Segurança em repositórios
- **Nunca** commite segredos (tokens, senhas, chaves privadas). Use variáveis de ambiente, §.env§ ignorado e gerenciadores de segredos.
- O GitHub oferece **secret scanning**, que procura segredos conhecidos no repositório e pode alertar quando algo vaza. Se um segredo vazar, **revogue-o imediatamente**.
- Tokens: use o **mínimo de permissões** e prazo de validade curto (veja a aula 4).
- Revise dependências e ative alertas de vulnerabilidade.
- Habilite **autenticação em dois fatores** na sua conta.

### Arquivos que acompanham um bom repositório
§README.md§, §LICENSE§, §CONTRIBUTING.md§, §.gitignore§, modelo de PR e de issue (§.github/§). Eles reduzem perguntas repetidas e orientam contribuições.`,
  concepts: [
    { term: 'GitHub flow', def: 'Fluxo com principal sempre publicável e branches curtas integradas por pull request.' },
    { term: 'Pull request', def: 'Proposta de mudança com discussão, revisão e verificações antes do merge.' },
    { term: 'Squash and merge', def: 'Junta todos os commits do PR em um único commit na principal.' },
    { term: 'Branch protegida', def: 'Branch com regras como revisão obrigatória, verificações e bloqueio de force push.' },
    { term: 'Trunk-based development', def: 'Integração frequente em uma única linha principal, com branches de vida muito curta.' },
    { term: 'SemVer', def: 'Versionamento MAJOR.MINOR.PATCH: incompatível, funcionalidade compatível, correção.' },
    { term: 'Secret scanning', def: 'Recurso do GitHub que procura segredos conhecidos em repositórios e alerta sobre eles.' }
  ],
  examples: `**Analogia:** o pull request é a reunião de revisão de um projeto de arquitetura antes da obra. A principal é a planta oficial. Ninguém altera a planta oficial direto: propõe uma mudança, a equipe confere, e só depois ela entra.

**Exemplo de cálculo de versão:** a versão atual é 1.4.2 e os commits desde a última tag são \`fix: corrige arredondamento\`, \`feat(api): novo endpoint de busca\` e \`docs: atualiza README\`. A regra: feat → MINOR. A próxima versão é **1.5.0** (o patch zera). Se um dos commits fosse \`feat!: remove o endpoint antigo\`, a próxima seria **2.0.0**.`,
  code: [
    { title: 'Do branch ao pull request com a CLI do GitHub', lang: 'bash', code: `git switch -c feature/relatorio
# ... commits ...
git push -u origin feature/relatorio
gh pr create --title "feat(relatorio): exporta em CSV" --body "Closes #42"
gh pr checks
gh pr merge --squash --delete-branch`,
      notes: [ { l: '3', t: 'Envia a branch e grava o upstream.' }, { l: '4', t: 'A CLI "gh" é opcional; o mesmo pode ser feito pela interface web. "Closes #42" liga o PR à issue.' }, { l: '5', t: 'Mostra o status das verificações automáticas.' }, { l: '6', t: 'Mescla com squash e apaga a branch. Só rode depois da aprovação.' } ] },
    { title: 'Um fluxo de verificação automática (GitHub Actions)', lang: 'yaml', code: `name: testes
on:
  pull_request:
    branches: [main]
jobs:
  testar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test`,
      notes: [ { l: '3-4', t: 'Dispara em cada pull request para a main.' }, { l: '10', t: 'Baixa o código do repositório. Confira na documentação a versão atual das actions antes de usar em produção.' }, { l: '14-15', t: 'Instala as dependências a partir do lockfile e roda os testes: o resultado aparece no PR.' } ] },
    { title: 'Próxima versão a partir dos commits (JavaScript)', lang: 'javascript', code: `function proxima(versao, tipos) {
  let [maior, menor, patch] = versao.split('.').map(Number);
  if (tipos.some(t => t.endsWith('!'))) return \`\${maior + 1}.0.0\`;
  if (tipos.includes('feat')) return \`\${maior}.\${menor + 1}.0\`;
  if (tipos.includes('fix')) return \`\${maior}.\${menor}.\${patch + 1}\`;
  return versao; // nada a publicar
}

console.log(proxima('1.4.2', ['fix', 'feat', 'docs'])); // 1.5.0
console.log(proxima('1.4.2', ['fix']));                  // 1.4.3
console.log(proxima('1.4.2', ['docs', 'chore']));        // 1.4.2
console.log(proxima('1.4.2', ['feat!']));                // 2.0.0`,
      notes: [ { l: '3', t: 'Breaking change tem prioridade: sobe MAJOR e zera o resto.' }, { l: '4', t: 'feat sobe MINOR e zera PATCH.' }, { l: '7', t: 'docs e chore não geram versão. No projeto do curso você completará isso com regras de erro e do rodapé BREAKING CHANGE.' } ] }
  ],
  bestPractices: ['Mantenha PRs pequenos, com descrição do que, por quê e como testar.', 'Rode as verificações automáticas em todo PR.', 'Proteja a branch principal: revisão obrigatória e verificações.', 'Escolha uma estratégia de branching e documente no CONTRIBUTING.', 'Use tags anotadas e SemVer nas releases.', 'Ative 2FA, secret scanning e use tokens com o mínimo de permissões.'],
  mistakes: ['Abrir PRs gigantes que ninguém consegue revisar.', 'Mesclar sem esperar as verificações.', 'Fazer push direto na principal em repositórios compartilhados.', 'Usar squash e perder a descrição útil dos commits sem ajustar o título.', 'Commitar um .env e achar que apagar em outro commit resolve.', 'Confundir MINOR e PATCH ao versionar.'],
  market: `Pull requests e revisão de código são o centro do trabalho em equipe. Pipelines automáticos de teste são esperados em qualquer repositório profissional, e versionamento semântico é o idioma de bibliotecas e APIs. Segurança de repositório (segredos, tokens, 2FA) é cobrada em auditorias e em entrevistas para vagas de produto e de infraestrutura.`,
  summary: `O GitHub flow vai de branch a PR, revisão, merge e exclusão. PRs bons são pequenos e bem descritos. Os métodos de merge diferem em quantos commits entram na principal. Branches protegidas impõem o processo. SemVer define MAJOR.MINOR.PATCH, e com Conventional Commits a próxima versão sai dos commits. Nunca versione segredos; revogue se vazarem.`,
  refs: [REF.ghFlow, REF.ghProtected, REF.ghMerge, REF.ghSecret, REF.conventional, REF.semver, REF.trunk],
  cards: [
    { q: 'O que o squash and merge faz?', a: 'Combina todos os commits do PR em um único commit na branch principal.' },
    { q: 'Em SemVer, o que um fix de correção compatível incrementa?', a: 'O PATCH.' },
    { q: 'Se a versão é 1.4.2 e há um feat, qual a próxima?', a: '1.5.0 (MINOR sobe e PATCH zera).' },
    { q: 'O que fazer se um token foi commitado e enviado?', a: 'Revogá-lo imediatamente e gerar outro; só depois limpar o histórico.' }
  ]
}
];
