// Curso 2 — Exercícios por aula, avaliação final e projeto integrador.
// Código-fonte dos exercícios em String.raw (sem interpolação); "§" vira crase em _lib.fix().
const R = String.raw;

export const exsets = {
'git-01': [
  { id: 'git-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que um commit do Git guarda?', options: ['Apenas a lista de linhas que mudaram em relação ao commit anterior', 'Um instantâneo do projeto, o(s) commit(s) pai(s), autor, data e mensagem', 'Somente a mensagem e o autor, com os arquivos ficando no servidor', 'Uma cópia compactada da pasta, sem ligação com commits anteriores'], answer: 1, explanation: 'Conceitualmente, cada commit aponta para um instantâneo completo do projeto e para o(s) pai(s). É essa ligação com o pai que forma o histórico. O Git compacta e reaproveita o que não mudou, mas o modelo mental é o de instantâneos encadeados.' },
  { id: 'git-01-e2', type: 'tf', difficulty: 1, points: 5, prompt: 'Criar uma branch copia todos os arquivos do projeto para uma nova pasta.', answer: false, explanation: 'Uma branch é apenas um ponteiro móvel para um commit. Criar uma custa quase nada e não copia arquivos.' },
  { id: 'git-01-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada área do Git à sua descrição.', pairs: [['Diretório de trabalho', 'Os arquivos reais que você edita no disco'], ['Área de preparação (index)', 'Rascunho do próximo commit, montado com git add'], ['Repositório (.git)', 'O histórico de commits e demais objetos'], ['HEAD', 'Ponteiro que indica a posição atual, normalmente uma branch']], explanation: 'O fluxo é: editar no diretório de trabalho, preparar com git add e gravar no repositório com git commit. HEAD diz onde você está.' },
  { id: 'git-01-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete os comandos para configurar sua identidade e criar o primeiro commit.', code: "git config --global [[0]] \"Ana Souza\"\ngit [[1]] README.md\ngit commit -m \"docs: cria README\"", answers: [['user.name'], ['add']], explanation: 'user.name e user.email identificam o autor dos commits. git add copia o estado do arquivo para a área de preparação antes do commit.' },
  { id: 'git-01-e5', type: 'code', difficulty: 3, points: 25, prompt: 'O histórico do Git é um grafo: cada commit lista seus pais. Implemente §ancestralComum(pais, a, b)§, que recebe o mapa §pais§ (id → lista de ids dos pais) e dois commits e devolve o id do ancestral comum mais próximo de §b§. Um commit conta como ancestral de si mesmo. Se não houver ancestral comum, devolva §null§. Procure em largura a partir de §b§ (a ordem de visita define o "mais próximo").', lang: 'javascript',
    starter: "function ancestralComum(pais, a, b) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'ramos que divergiram', code: R`const pais = { c1: [], c2: ['c1'], c3: ['c2'], f1: ['c2'], f2: ['f1'] };
assert.equal(ancestralComum(pais, 'c3', 'f2'), 'c2');` },
      { name: 'um commit é ancestral do outro', code: R`const pais = { c1: [], c2: ['c1'], c3: ['c2'] };
assert.equal(ancestralComum(pais, 'c1', 'c3'), 'c1');
assert.equal(ancestralComum(pais, 'c3', 'c1'), 'c1');` },
      { name: 'mesmo commit', code: R`assert.equal(ancestralComum({ x: [] }, 'x', 'x'), 'x');` },
      { name: 'históricos sem relação devolvem null', code: R`const pais = { a1: [], a2: ['a1'], b1: [], b2: ['b1'] };
assert.equal(ancestralComum(pais, 'a2', 'b2'), null);` },
      { name: 'considera commits de merge (dois pais)', code: R`const pais = { c1: [], c2: ['c1'], c3: ['c2'], f1: ['c2'], m1: ['c3', 'f1'], x: ['m1'] };
assert.equal(ancestralComum(pais, 'f1', 'x'), 'f1');` },
      { name: 'não altera a entrada', code: R`const pais = { c1: [], c2: ['c1'] }; const copia = JSON.stringify(pais);
ancestralComum(pais, 'c2', 'c1');
assert.equal(JSON.stringify(pais), copia);` }
    ],
    hints: ['Primeiro, junte todos os ancestrais de a (incluindo a) em um Set.', 'Depois percorra em largura a partir de b, usando uma fila, e devolva o primeiro commit que esteja no Set.', 'Use um conjunto de visitados para não repetir commits que aparecem por dois caminhos (merges).'],
    solution: R`function ancestralComum(pais, a, b) {
  const deA = new Set([a]);
  const fa = [a];
  for (let i = 0; i < fa.length; i++) {
    for (const p of pais[fa[i]] || []) {
      if (!deA.has(p)) { deA.add(p); fa.push(p); }
    }
  }
  const vistos = new Set([b]);
  const fb = [b];
  for (let i = 0; i < fb.length; i++) {
    if (deA.has(fb[i])) return fb[i];
    for (const p of pais[fb[i]] || []) {
      if (!vistos.has(p)) { vistos.add(p); fb.push(p); }
    }
  }
  return null;
}`, explanation: 'O conjunto de ancestrais de a é montado por BFS. A segunda BFS parte de b e devolve o primeiro commit já presente nesse conjunto: o ancestral comum mais próximo de b. Sem relação entre os históricos, a busca termina e devolve null. É a ideia da "merge base" usada pelo Git em merges de três vias.' }
],
'git-02': [
  { id: 'git-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Você já preparou (git add) alguns arquivos. Qual comando mostra exatamente o que irá no próximo commit?', options: ['git diff', 'git log', 'git diff --staged', 'git status --ignored'], answer: 2, explanation: 'git diff compara o diretório de trabalho com a área de preparação. git diff --staged compara a área de preparação com o último commit, ou seja, o que será gravado.' },
  { id: 'git-02-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'Você quer ignorar a pasta §logs/§, mas manter o arquivo §logs/importante.log§ versionado. O arquivo continua ignorado. Clique na linha que impede a regra de funcionar.', code: "node_modules/\nlogs/\n!logs/importante.log\n.env", answer: 2, explanation: 'Como o diretório logs/ inteiro está excluído (linha 2), o Git nem olha dentro dele, e a negação da linha 3 não tem efeito. A solução é ignorar o conteúdo, não o diretório: logs/* seguido de !logs/importante.log.' },
  { id: 'git-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a mensagem de commit ao efeito dela sobre a versão (SemVer), segundo o padrão Conventional Commits.', pairs: [['fix(api): corrige erro 500 no login', 'PATCH'], ['feat(api): adiciona busca por data', 'MINOR'], ['feat(api)!: remove o campo login', 'MAJOR'], ['docs: atualiza o README', 'Nenhuma versão nova']], explanation: 'fix corresponde a PATCH, feat a MINOR e qualquer mudança incompatível (indicada com ! ou com o rodapé BREAKING CHANGE) a MAJOR. Tipos como docs não alteram o comportamento e não geram versão por si sós.' },
  { id: 'git-02-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'O arquivo §config.local§ foi commitado por engano. Complete os comandos para parar de rastreá-lo, mantendo o arquivo no disco, e ignorá-lo daqui para frente.', code: "git [[0]] --cached config.local\necho \"config.local\" >> [[1]]\ngit commit -am \"chore: para de versionar config.local\"", answers: [['rm'], ['.gitignore']], explanation: 'git rm --cached remove o arquivo do rastreamento sem apagá-lo do disco. Só adicionar ao .gitignore não basta para arquivos já rastreados.' },
  { id: 'git-02-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §parseCommit(mensagem)§ para o padrão Conventional Commits. O cabeçalho (primeira linha) tem a forma §tipo(escopo)!: descrição§, com escopo e §!§ opcionais. Devolva §{ tipo, escopo, descricao, breaking }§: §tipo§ em minúsculas; §escopo§ é §null§ se ausente; §breaking§ é §true§ se houver §!§ antes dos dois-pontos **ou** uma linha do corpo/rodapé começando com §BREAKING CHANGE: §. Mensagem fora do padrão devolve §null§.', lang: 'javascript',
    starter: "function parseCommit(mensagem) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'tipo e descrição', code: R`assert.deepEqual(parseCommit('fix: corrige o arredondamento'), { tipo: 'fix', escopo: null, descricao: 'corrige o arredondamento', breaking: false });` },
      { name: 'com escopo', code: R`const r = parseCommit('feat(carrinho): aplica cupom');
assert.equal(r.tipo, 'feat'); assert.equal(r.escopo, 'carrinho'); assert.equal(r.descricao, 'aplica cupom');` },
      { name: 'breaking com "!"', code: R`assert.equal(parseCommit('feat(api)!: remove o campo login').breaking, true);
assert.equal(parseCommit('refactor!: troca o formato').breaking, true);` },
      { name: 'breaking no rodapé', code: R`const r = parseCommit('feat: novo formato\n\nCorpo da mensagem.\n\nBREAKING CHANGE: o campo mudou de nome');
assert.equal(r.breaking, true);` },
      { name: 'tipo em maiúsculas vira minúsculas', code: R`assert.equal(parseCommit('FIX: corrige').tipo, 'fix');` },
      { name: 'fora do padrão devolve null', code: R`assert.equal(parseCommit('ajustes'), null);
assert.equal(parseCommit('fix:sem espaço'), null);
assert.equal(parseCommit('fix: '), null);
assert.equal(parseCommit(''), null);` },
      { name: 'só o cabeçalho define tipo e descrição', code: R`const r = parseCommit('fix: corrige\n\nfeat: isto é só texto do corpo');
assert.equal(r.tipo, 'fix'); assert.equal(r.descricao, 'corrige'); assert.equal(r.breaking, false);` }
    ],
    hints: ['Separe a mensagem em linhas; o cabeçalho é a primeira.', 'Uma expressão regular com grupos para tipo, escopo opcional, "!" opcional e descrição resolve o cabeçalho.', 'Para o rodapé, procure em qualquer linha posterior uma que comece com "BREAKING CHANGE: ".'],
    solution: R`function parseCommit(mensagem) {
  const linhas = String(mensagem).split('\n');
  const m = linhas[0].trim().match(/^([A-Za-z]+)(?:\(([^()\s]+)\))?(!)?: (\S.*)$/);
  if (!m) return null;
  const rodape = linhas.slice(1).some((l) => /^BREAKING[ -]CHANGE: /.test(l));
  return { tipo: m[1].toLowerCase(), escopo: m[2] || null, descricao: m[4].trim(), breaking: Boolean(m[3]) || rodape };
}`, explanation: 'O cabeçalho é validado por expressão regular: tipo, escopo opcional entre parênteses, "!" opcional, dois-pontos, espaço e descrição não vazia. O rodapé BREAKING CHANGE é procurado nas demais linhas. Mensagens fora do padrão devolvem null.' },
  { id: 'git-02-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Um colega costuma fazer um único commit por dia, com a mensagem "ajustes", misturando uma correção de bug, uma refatoração e um arquivo de configuração local. Explique dois problemas dessa prática e como corrigir o hábito.', model: 'Problemas: (1) o histórico não explica o porquê das mudanças, então revisar ou investigar um bug depois fica difícil; (2) commits misturados não podem ser revertidos ou investigados (git revert, git bisect) de forma isolada: desfazer a correção desfaz também a refatoração. Ainda pode versionar arquivos que não deviam. Correção: commits pequenos e atômicos, um por mudança lógica, preparados com git add -p ou por arquivo; mensagem no padrão tipo(escopo): descrição explicando o porquê; revisar com git diff --staged; colocar a configuração local no .gitignore.', rubric: ['Aponta que a mensagem "ajustes" não explica o que nem por quê', 'Aponta que misturar mudanças impede reverter ou investigar uma delas isoladamente', 'Propõe commits atômicos (por exemplo com git add -p)', 'Propõe mensagens descritivas, de preferência no padrão Conventional Commits', 'Cita o .gitignore ou a revisão com git diff --staged'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'git-03': [
  { id: 'git-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em quais condições o §git merge feature§ (estando em §main§) é um fast-forward?', options: ['Quando não há conflitos', 'Quando o commit atual de main é ancestral de feature', 'Quando feature tem apenas um commit', 'Quando se usa a opção --no-ff'], answer: 1, explanation: 'Se main não andou desde que feature nasceu, basta avançar o ponteiro de main. Ausência de conflitos não define fast-forward, e --no-ff faz exatamente o contrário: força um commit de merge.' },
  { id: 'git-03-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Rastreie o repositório. A branch main aponta para C3. Em seguida são executados os comandos abaixo, e cada commit tem como pai o commit anterior da mesma linha.', code: "git switch -c feature      # feature e main apontam para C3\n# faz 2 commits em feature: C4 e C5\ngit switch main\ngit merge feature", lang: 'text', steps: [ { q: 'Para qual commit main aponta ao final?', answers: ['C5'] }, { q: 'Esse merge cria um commit de merge? (sim ou não)', answers: ['não', 'nao'] }, { q: 'Quantos pais tem o commit para o qual main aponta?', answers: ['1', 'um'] } ], explanation: 'main não andou desde que feature nasceu em C3, então o merge é fast-forward: o ponteiro de main só avança até C5. Nenhum commit de merge é criado, e C5 continua com um único pai (C4).' },
  { id: 'git-03-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Depois de um merge com conflito, o arquivo foi salvo assim e commitado. O build quebra. Clique na linha que precisava ser removida junto com as outras do mesmo tipo (um marcador de conflito).', code: "const taxa = 0.12;\n<<<<<<< HEAD\nconst desconto = 0.10;\n=======\nconst desconto = 0.15;\n>>>>>>> feature/promo\nmodule.exports = { taxa, desconto };", answer: 2, explanation: 'As linhas com <<<<<<<, ======= e >>>>>>> são marcadores do Git, não código. A resolução exige escolher o resultado final e apagar os três marcadores (linhas 2, 4 e 6). A primeira que aparece é a linha 2.' },
  { id: 'git-03-e4', type: 'tf', difficulty: 1, points: 5, prompt: 'Depois de editar um arquivo em conflito e removê-lo dos marcadores, é preciso rodar git add nele antes de concluir o merge.', answer: true, explanation: 'git add marca o conflito do arquivo como resolvido. Depois, git commit (ou git merge --continue) conclui o merge.' },
  { id: 'git-03-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §resolverConflito(texto, escolha)§. O texto contém zero ou mais blocos de conflito no formato §<<<<<<< nome§ … §=======§ … §>>>>>>> nome§. Com §escolha§ igual a §"ours"§ fica a parte de cima (a sua), com §"theirs"§ a de baixo, e com §"both"§ as duas (primeiro a sua). Linhas fora dos blocos permanecem. Com §merge.conflictStyle diff3§ pode haver uma seção de base entre §|||||||§ e §=======§, que deve ser descartada. Se um bloco ficar sem fechar, ou se §escolha§ for inválida, lance um erro (§throw new Error§).', lang: 'javascript',
    starter: "function resolverConflito(texto, escolha) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'ours', code: R`const t = ['a', '<<<<<<< HEAD', 'x = 1', '=======', 'x = 2', '>>>>>>> feature', 'b'].join('\n');
assert.equal(resolverConflito(t, 'ours'), ['a', 'x = 1', 'b'].join('\n'));` },
      { name: 'theirs', code: R`const t = ['a', '<<<<<<< HEAD', 'x = 1', '=======', 'x = 2', '>>>>>>> feature', 'b'].join('\n');
assert.equal(resolverConflito(t, 'theirs'), ['a', 'x = 2', 'b'].join('\n'));` },
      { name: 'both mantém as duas, a sua primeiro', code: R`const t = ['<<<<<<< HEAD', 'um', 'dois', '=======', 'tres', '>>>>>>> f'].join('\n');
assert.equal(resolverConflito(t, 'both'), ['um', 'dois', 'tres'].join('\n'));` },
      { name: 'descarta a seção da base (diff3)', code: R`const t = ['<<<<<<< HEAD', 'novo', '||||||| base', 'antigo', '=======', 'outro', '>>>>>>> f'].join('\n');
assert.equal(resolverConflito(t, 'theirs'), 'outro');
assert.equal(resolverConflito(t, 'both'), ['novo', 'outro'].join('\n'));` },
      { name: 'vários blocos', code: R`const t = ['<<<<<<< HEAD', 'a1', '=======', 'a2', '>>>>>>> f', 'meio', '<<<<<<< HEAD', 'b1', '=======', 'b2', '>>>>>>> f'].join('\n');
assert.equal(resolverConflito(t, 'theirs'), ['a2', 'meio', 'b2'].join('\n'));` },
      { name: 'sem conflito devolve o mesmo texto', code: R`assert.equal(resolverConflito('linha 1\nlinha 2', 'ours'), 'linha 1\nlinha 2');` },
      { name: 'bloco sem fechar lança erro', code: R`assert.throws(() => resolverConflito(['<<<<<<< HEAD', 'x', '=======', 'y'].join('\n'), 'ours'));` },
      { name: 'escolha inválida lança erro', code: R`assert.throws(() => resolverConflito('texto', 'qualquer'));` }
    ],
    hints: ['Percorra as linhas guardando em qual parte do bloco você está: fora, nossa, base ou deles.', 'Acumule as linhas "nossas" e "deles" em duas listas e, ao ver >>>>>>>, escreva na saída conforme a escolha.', 'Valide a escolha no começo e confira, no fim, se o estado voltou a "fora".'],
    solution: R`function resolverConflito(texto, escolha) {
  if (escolha !== 'ours' && escolha !== 'theirs' && escolha !== 'both') throw new Error('escolha inválida');
  const saida = [];
  let estado = 'fora';
  let nosso = [];
  let deles = [];
  for (const linha of texto.split('\n')) {
    if (linha.startsWith('<<<<<<<')) {
      if (estado !== 'fora') throw new Error('bloco aninhado');
      estado = 'nosso'; nosso = []; deles = [];
    } else if (linha.startsWith('|||||||') && estado === 'nosso') {
      estado = 'base';
    } else if (linha === '=======' && (estado === 'nosso' || estado === 'base')) {
      estado = 'deles';
    } else if (linha.startsWith('>>>>>>>') && estado === 'deles') {
      if (escolha !== 'theirs') saida.push(...nosso);
      if (escolha !== 'ours') saida.push(...deles);
      estado = 'fora';
    } else if (estado === 'nosso') nosso.push(linha);
    else if (estado === 'deles') deles.push(linha);
    else if (estado === 'fora') saida.push(linha);
  }
  if (estado !== 'fora') throw new Error('conflito sem fechamento');
  return saida.join('\n');
}`, explanation: 'Uma pequena máquina de estados: fora do bloco copia as linhas; dentro, separa o lado nosso, a base (descartada) e o lado deles. Ao fechar o bloco, escreve conforme a escolha. Um estado diferente de "fora" no fim indica bloco sem fechar.' }
],
'git-04': [
  { id: 'git-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Seu §git push§ foi recusado com "rejected … (fetch first)". O que isso significa e qual o caminho seguro?', options: ['O remoto está fora do ar; tente de novo com git push --force', 'O remoto tem commits que você não tem; integre com git pull (ou fetch e rebase/merge) e envie de novo', 'Sua chave SSH expirou; gere outra', 'A branch está protegida e ninguém pode enviar'], answer: 1, explanation: 'A recusa indica que alguém enviou commits que você ainda não tem. Aceitar o seu push apagaria o trabalho deles. Integre primeiro e envie. --force em branch compartilhada é justamente o que se deve evitar.' },
  { id: 'git-04-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada comando ao que ele faz.', pairs: [['git fetch', 'Baixa novidades e atualiza origin/*, sem alterar suas branches'], ['git pull', 'Faz fetch e integra na branch atual (merge ou rebase)'], ['git push -u origin main', 'Envia os commits e grava o upstream'], ['git clone <url>', 'Baixa o repositório completo e cria o remoto origin']], explanation: 'fetch só observa; pull observa e integra; push envia; clone traz tudo pela primeira vez e já configura origin.' },
  { id: 'git-04-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'O git fetch pode gerar conflitos de merge, porque altera os arquivos da sua branch atual.', answer: false, explanation: 'O fetch só atualiza as branches de acompanhamento remoto (origin/*). Os arquivos e as branches locais não mudam. Quem pode gerar conflitos é o git pull, por integrar.' },
  { id: 'git-04-e4', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual prática de autenticação é a mais segura?', options: ['Usar a senha da conta do GitHub no HTTPS e guardá-la em um arquivo do projeto', 'Gerar um par de chaves SSH protegido por frase-senha, cadastrando apenas a chave pública na conta', 'Colocar um token classic com todos os escopos no README para o time usar', 'Compartilhar a mesma chave privada entre todos da equipe'], answer: 1, explanation: 'Chave privada fica só na máquina de quem a gerou, protegida por frase-senha; a pública vai para a conta. Tokens devem ter o mínimo de permissões (fine-grained), e senhas, tokens ou chaves nunca vão para o repositório.' },
  { id: 'git-04-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §parseRemote(url)§, que identifica o protocolo, o host, o dono e o repositório de uma URL de remoto Git e devolve §{ protocolo, host, dono, repo }§, ou §null§ se não reconhecer. Formatos: §https://github.com/ana/app.git§ (protocolo §"https"§, também §http§), §git@github.com:ana/app.git§ (protocolo §"ssh"§) e §ssh://git@github.com/ana/app.git§ (protocolo §"ssh"§, com porta opcional). O sufixo §.git§ e uma barra final são opcionais e não fazem parte do nome do repositório.', lang: 'javascript',
    starter: "function parseRemote(url) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'https com .git', code: R`assert.deepEqual(parseRemote('https://github.com/ana/app.git'), { protocolo: 'https', host: 'github.com', dono: 'ana', repo: 'app' });` },
      { name: 'https sem .git e com barra final', code: R`assert.deepEqual(parseRemote('https://github.com/ana/app/'), { protocolo: 'https', host: 'github.com', dono: 'ana', repo: 'app' });` },
      { name: 'ssh no formato scp', code: R`assert.deepEqual(parseRemote('git@github.com:ana/app.git'), { protocolo: 'ssh', host: 'github.com', dono: 'ana', repo: 'app' });` },
      { name: 'ssh:// com porta', code: R`assert.deepEqual(parseRemote('ssh://git@git.exemplo.com:2222/time/api-pagamentos.git'), { protocolo: 'ssh', host: 'git.exemplo.com', dono: 'time', repo: 'api-pagamentos' });` },
      { name: 'nome do repositório com ponto', code: R`assert.equal(parseRemote('https://github.com/ana/meu.site.git').repo, 'meu.site');` },
      { name: 'formatos inválidos devolvem null', code: R`assert.equal(parseRemote('github.com/ana/app'), null);
assert.equal(parseRemote('https://github.com/ana'), null);
assert.equal(parseRemote(''), null);
assert.equal(parseRemote('isto não é uma url'), null);` }
    ],
    hints: ['Trate os dois formatos com duas expressões regulares.', 'Para o nome do repositório, use um grupo preguiçoso (+?) seguido de (?:\\.git)? e \\/?$, assim o ".git" fica de fora.', 'No formato scp (usuario@host:dono/repo) não há "//" nem porta.'],
    solution: R`function parseRemote(url) {
  if (typeof url !== 'string') return null;
  const u = url.trim();
  let m = u.match(/^(https?|ssh):\/\/(?:[^@/]+@)?([^/:@]+)(?::\d+)?\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (m) return { protocolo: m[1], host: m[2], dono: m[3], repo: m[4] };
  m = u.match(/^(?:[^@/:]+@)?([^/:@]+):([^/:]+)\/([^/]+?)(?:\.git)?$/);
  if (m) return { protocolo: 'ssh', host: m[1], dono: m[2], repo: m[3] };
  return null;
}`, explanation: 'A primeira expressão cobre https, http e ssh:// (usuário e porta opcionais); a segunda, o formato scp usuario@host:dono/repo, que é sempre SSH. O grupo preguiçoso do repositório, seguido de (?:\\.git)? e \\/?$, deixa o ".git" e a barra final de fora do nome.' }
],
'git-05': [
  { id: 'git-05-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'O commit §abc1234§ já foi enviado a §main§, e outras pessoas já baixaram. Ele quebrou a produção. Qual a forma mais segura de desfazê-lo?', options: ['git reset --hard HEAD~1 e git push --force', 'git revert abc1234 e git push', 'git commit --amend', 'Apagar a branch main e criá-la de novo'], answer: 1, explanation: 'revert cria um novo commit que desfaz o efeito de abc1234, sem reescrever o histórico que os colegas já têm. Reset, amend e recriar a branch reescrevem a história compartilhada.' },
  { id: 'git-05-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada variante do reset ao que acontece.', pairs: [['git reset --soft HEAD~1', 'Desfaz o commit e mantém as alterações preparadas'], ['git reset HEAD~1', 'Desfaz o commit e deixa as alterações não preparadas no diretório de trabalho'], ['git reset --hard HEAD~1', 'Desfaz o commit e descarta as alterações'], ['git restore --staged arquivo', 'Tira o arquivo da área de preparação, sem mover a branch']], explanation: 'reset sempre move a branch; --soft preserva tudo, --mixed (padrão) zera a preparação e --hard zera também o diretório de trabalho. restore --staged atua só na área de preparação.' },
  { id: 'git-05-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Os commits são C1 ← C2 ← C3 e main aponta para C3. Em C3 você alterou §a.txt§ e deixou preparada a alteração. Responda sobre o estado depois de cada comando (cada um parte do estado original).', code: "git reset --soft HEAD~1\ngit reset --mixed HEAD~1\ngit reset --hard HEAD~1", lang: 'text', steps: [ { q: 'Depois do --soft: para qual commit main aponta?', answers: ['C2'] }, { q: 'Depois do --soft: o conteúdo de C3 continua na área de preparação? (sim ou não)', answers: ['sim'] }, { q: 'Depois do --mixed: o conteúdo de C3 continua no diretório de trabalho? (sim ou não)', answers: ['sim'] }, { q: 'Depois do --hard: o conteúdo de C3 continua no diretório de trabalho? (sim ou não)', answers: ['não', 'nao'] } ], explanation: 'Em todos main passa a apontar para C2. --soft mantém a preparação e o diretório; --mixed zera a preparação mas mantém o diretório; --hard zera os dois (o conteúdo de C3 só é recuperável pelo reflog, porque foi commitado).' },
  { id: 'git-05-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'O git reflog permite recuperar alterações que você nunca commitou, depois de um reset --hard.', answer: false, explanation: 'O reflog registra movimentos de HEAD e das branches, ou seja, commits. Alterações que nunca foram commitadas (nem guardadas em stash) não existem para o Git e se perdem.' },
  { id: 'git-05-e5', type: 'open', difficulty: 3, points: 15, prompt: 'Você percebe que commitou e enviou ao GitHub um arquivo §.env§ com uma chave de API. Apagar o arquivo em um novo commit resolve? Descreva, em ordem, o que fazer.', model: 'Não resolve: o arquivo continua no histórico e em qualquer clone, e a chave deve ser considerada comprometida. Ordem: (1) revogar a chave no serviço e gerar outra, antes de qualquer outra ação; (2) colocar .env no .gitignore, remover do rastreamento (git rm --cached .env) e commitar, com um .env.example sem valores; (3) se necessário, limpar o histórico com uma ferramenta própria (como git filter-repo) e avisar quem clonou; (4) verificar logs de uso da chave antiga.', rubric: ['Afirma que apagar em um novo commit não remove o segredo do histórico', 'Coloca a revogação e a troca da chave como primeira ação', 'Propõe .gitignore e git rm --cached', 'Menciona limpar o histórico com ferramenta específica ou avisar quem clonou', 'Sugere um .env.example sem valores reais (ou verificar o uso da chave antiga)'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'git-06': [
  { id: 'git-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a regra de ouro do rebase?', options: ['Use sempre rebase em vez de merge', 'Não faça rebase de commits que já foram enviados e que outras pessoas podem ter baixado', 'Só faça rebase na branch main', 'Rebase só funciona sem conflitos'], answer: 1, explanation: 'Rebase cria commits novos com outros hashes. Se colegas já tinham os commits antigos, os históricos divergem. Em branches só suas, ainda não compartilhadas, o rebase é seguro.' },
  { id: 'git-06-e2', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o fluxo de atender uma urgência sem perder o trabalho em andamento.', code: "git stash [[0]] -m \"wip: filtro\"\ngit switch -c fix/urgente main\n# ... corrige, commita, envia ...\ngit switch feature/busca\ngit stash [[1]]", answers: [['push'], ['pop', 'apply']], explanation: 'stash push guarda o trabalho com um nome; stash pop (ou apply) o reaplica. A diferença: pop também remove o item da pilha.' },
  { id: 'git-06-e3', type: 'trace', difficulty: 3, points: 15, prompt: 'Um bug apareceu em algum ponto de uma sequência de 1000 commits. O commit 1 está sem o bug e o commit 1000 tem o bug. Você usa §git bisect§ (busca binária).', code: "git bisect start\ngit bisect bad              # commit 1000\ngit bisect good <commit 1>", lang: 'text', steps: [ { q: 'No máximo quantos commits você precisa testar? (use ⌈log₂(1000)⌉)', answers: ['10', 'dez'] }, { q: 'Em uma busca linear, no pior caso, quantos commits seriam testados (aproximadamente)?', answers: ['999', '998', '1000'] } ], explanation: 'A busca binária divide o intervalo ao meio a cada teste: ⌈log₂(1000)⌉ = 10. Uma busca linear testaria quase todos os 998 a 1000 commits no pior caso. É a mesma ideia da busca binária estudada em Lógica e Big O.' },
  { id: 'git-06-e4', type: 'tf', difficulty: 1, points: 5, prompt: 'O comando git push comum também envia as tags criadas localmente.', answer: false, explanation: 'Tags precisam ser enviadas explicitamente: git push origin v1.2.0 (uma tag) ou git push --tags (todas).' },
  { id: 'git-06-e5', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade à ferramenta mais adequada.', pairs: [['Trazer só a correção do commit X para a branch de manutenção', 'git cherry-pick'], ['Juntar três commits "wip" antes de abrir o pull request', 'git rebase -i'], ['Marcar o commit que corresponde à versão 1.4.0', 'git tag -a'], ['Achar o commit que introduziu uma regressão', 'git bisect']], explanation: 'cherry-pick leva um commit específico; rebase -i reescreve a sua branch local; tag anotada marca a versão; bisect faz a busca binária da regressão.' }
],
'git-07': [
  { id: 'git-07-e1', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada método de merge do GitHub ao resultado na branch principal.', pairs: [['Merge commit', 'Mantém todos os commits do PR e cria um commit de merge'], ['Squash and merge', 'Combina todos os commits do PR em um único commit'], ['Rebase and merge', 'Reaplica os commits do PR sobre a principal, sem commit de merge']], explanation: 'O merge commit preserva tudo; o squash gera um commit por PR, ao custo de perder a granularidade; o rebase mantém os commits, mas com novos hashes e sem commit de merge.' },
  { id: 'git-07-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é o principal efeito de proteger a branch main no GitHub?', options: ['Impede qualquer pessoa de fazer commits em qualquer branch', 'Permite exigir revisão aprovada e verificações automáticas antes do merge, e bloquear force push', 'Faz o GitHub corrigir automaticamente os conflitos', 'Deixa a branch invisível para quem não é administrador'], answer: 1, explanation: 'Regras de proteção impõem o processo: revisão obrigatória, verificações de status que precisam passar, bloqueio de force push e de exclusão da branch.' },
  { id: 'git-07-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'A versão atual é §2.3.4§. Calcule a próxima versão segundo SemVer e Conventional Commits para cada conjunto de commits desde a última tag.', code: "A) fix: corrige arredondamento\n   docs: atualiza README\nB) feat(api): novo endpoint\n   fix: corrige erro\nC) feat(api)!: remove endpoint antigo\n   fix: corrige erro", lang: 'text', steps: [ { q: 'Versão para o conjunto A', answers: ['2.3.5'] }, { q: 'Versão para o conjunto B', answers: ['2.4.0'] }, { q: 'Versão para o conjunto C', answers: ['3.0.0'] } ], explanation: 'A: só fix → PATCH (2.3.5). B: há um feat → MINOR e o patch zera (2.4.0). C: mudança incompatível (!) → MAJOR, e minor e patch zeram (3.0.0).' },
  { id: 'git-07-e4', type: 'open', difficulty: 2, points: 10, prompt: 'Escreva a descrição de um pull request para a mudança "o relatório de vendas agora pode ser exportado em CSV", fechando a issue 42. Explique o que uma boa descrição deve conter.', model: 'Uma boa descrição diz o quê, o porquê e como testar, e vincula a tarefa. Exemplo: "Adiciona o botão Exportar CSV ao relatório de vendas. Motivo: o financeiro precisa abrir os dados no Excel. Como testar: abra Relatórios > Vendas, clique em Exportar CSV e confira se o arquivo tem cabeçalho e uma linha por venda. Fora do escopo: exportar em PDF. Closes #42." Deve ser pequeno e focado, e passar pelas verificações automáticas.', rubric: ['Diz o que mudou', 'Explica o porquê da mudança', 'Explica como testar', 'Referencia a issue com palavra de fechamento (Closes #42)', 'Cita que o PR deve ser pequeno/focado ou ter verificações automáticas passando'], explanation: 'Compare com o modelo e marque os critérios atendidos.' },
  { id: 'git-07-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §proximaVersao(versao, mensagens)§. §versao§ tem a forma §"MAJOR.MINOR.PATCH"§ e §mensagens§ é a lista de mensagens de commit desde a última versão (Conventional Commits). Regras: qualquer mudança incompatível (§!§ antes dos dois-pontos ou linha §BREAKING CHANGE: §) sobe MAJOR e zera MINOR e PATCH; senão, §feat§ sobe MINOR e zera PATCH; senão, §fix§ sobe PATCH. Mensagens fora do padrão e outros tipos (docs, chore…) são ignorados. Se nada gera versão, devolva §null§. Versão inválida lança um erro.', lang: 'javascript',
    starter: "function proximaVersao(versao, mensagens) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'fix sobe PATCH', code: R`assert.equal(proximaVersao('1.4.2', ['fix: corrige o total']), '1.4.3');` },
      { name: 'feat sobe MINOR e zera PATCH', code: R`assert.equal(proximaVersao('1.4.2', ['fix: a', 'feat(api): b']), '1.5.0');` },
      { name: 'breaking com "!" sobe MAJOR', code: R`assert.equal(proximaVersao('1.4.2', ['feat(api)!: remove campo', 'fix: c']), '2.0.0');` },
      { name: 'breaking no rodapé sobe MAJOR', code: R`assert.equal(proximaVersao('0.9.1', ['fix: x\n\nBREAKING CHANGE: muda o formato']), '1.0.0');` },
      { name: 'docs e chore não geram versão', code: R`assert.equal(proximaVersao('1.0.0', ['docs: ajusta README', 'chore: atualiza deps']), null);` },
      { name: 'mensagens fora do padrão são ignoradas', code: R`assert.equal(proximaVersao('1.0.0', ['ajustes', 'wip']), null);
assert.equal(proximaVersao('1.0.0', ['ajustes', 'fix: de verdade']), '1.0.1');` },
      { name: 'lista vazia devolve null', code: R`assert.equal(proximaVersao('3.2.1', []), null);` },
      { name: 'versão inválida lança erro', code: R`assert.throws(() => proximaVersao('1.0', ['fix: x']));
assert.throws(() => proximaVersao('v1.0.0', ['fix: x']));` }
    ],
    hints: ['Valide a versão com /^(\\d+)\\.(\\d+)\\.(\\d+)$/ e converta os grupos em números.', 'Para cada mensagem, leia o cabeçalho com uma expressão regular e procure BREAKING CHANGE nas demais linhas.', 'Guarde três indicadores (houve breaking, houve feat, houve fix) e decida no fim, na ordem de prioridade.'],
    solution: R`function proximaVersao(versao, mensagens) {
  const v = /^(\d+)\.(\d+)\.(\d+)$/.exec(versao);
  if (!v) throw new Error('versão inválida');
  const maior = Number(v[1]), menor = Number(v[2]), patch = Number(v[3]);
  let breaking = false, feat = false, fix = false;
  for (const msg of mensagens) {
    const linhas = String(msg).split('\n');
    const m = linhas[0].trim().match(/^([A-Za-z]+)(?:\(([^()\s]+)\))?(!)?: (\S.*)$/);
    if (!m) continue;
    const tipo = m[1].toLowerCase();
    if (m[3] || linhas.slice(1).some((l) => /^BREAKING[ -]CHANGE: /.test(l))) breaking = true;
    else if (tipo === 'feat') feat = true;
    else if (tipo === 'fix') fix = true;
  }
  if (breaking) return (maior + 1) + '.0.0';
  if (feat) return maior + '.' + (menor + 1) + '.0';
  if (fix) return maior + '.' + menor + '.' + (patch + 1);
  return null;
}`, explanation: 'A prioridade é incompatível > funcionalidade > correção, e cada nível zera os números à direita. Mensagens fora do padrão são puladas e tipos sem efeito (docs, chore) não ativam nenhum indicador, então a função devolve null quando nada é publicável.' }
]
};

export const assessment = {
  id: 'git-github', title: 'Avaliação final — Git e GitHub na prática', passPct: 70, minutes: 40,
  items: [
    { id: 'git-av-01', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a diferença entre Git e GitHub?', options: ['São o mesmo programa, com nomes diferentes', 'Git é o sistema de controle de versão; GitHub é um serviço que hospeda repositórios Git e oferece recursos de colaboração', 'Git é o serviço na nuvem; GitHub é o programa instalado no computador', 'Git só funciona com GitHub'], answer: 1, explanation: 'Git roda na sua máquina e funciona sem internet. GitHub, GitLab e Bitbucket são serviços que hospedam repositórios Git.' },
    { id: 'git-av-02', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o comando à tarefa.', pairs: [['git switch -c feature/x', 'Criar uma branch e mudar para ela'], ['git add -p', 'Preparar apenas parte das alterações'], ['git log --oneline --graph --decorate --all', 'Ver o grafo de commits e branches'], ['git restore --staged arquivo', 'Tirar um arquivo da área de preparação']], explanation: 'Os quatro comandos fazem parte do dia a dia e atuam em áreas diferentes: branches, área de preparação, histórico e preparação.' },
    { id: 'git-av-03', type: 'mc', difficulty: 2, points: 10, prompt: 'Você colocou §config.json§ no §.gitignore§, mas o Git continua mostrando mudanças nele. Por quê?', options: ['O .gitignore só vale depois de reiniciar o computador', 'O arquivo já era rastreado: é preciso git rm --cached config.json', 'O .gitignore não aceita arquivos com extensão', 'O Git ignora o .gitignore na branch main'], answer: 1, explanation: 'O .gitignore só afeta arquivos ainda não rastreados. Para parar de rastrear um arquivo já commitado, use git rm --cached arquivo e commite.' },
    { id: 'git-av-04', type: 'trace', difficulty: 2, points: 10, prompt: 'Veja o histórico: C1 ← C2 ← C3 (main) e C2 ← F1 ← F2 (feature). Você está em §main§ e executa §git merge feature§.', code: "main:    C1 - C2 - C3\nfeature:        \\\n                 F1 - F2", lang: 'text', steps: [ { q: 'É fast-forward? (sim ou não)', answers: ['não', 'nao'] }, { q: 'Qual commit é o ancestral comum (merge base)?', answers: ['C2'] }, { q: 'Quantos pais terá o novo commit de merge?', answers: ['2', 'dois'] } ], explanation: 'main andou (C3) e feature também (F1, F2): o histórico divergiu, então é um merge de três vias a partir de C2, que gera um commit com dois pais (C3 e F2).' },
    { id: 'git-av-05', type: 'bug', difficulty: 2, points: 10, prompt: 'O script abaixo deveria atualizar a main e depois criar a branch de trabalho, mas cria a branch a partir de uma main desatualizada. Clique na linha com o problema.', code: "git switch main\ngit switch -c feature/relatorio\ngit pull\ngit push -u origin feature/relatorio", answer: 2, explanation: 'A branch é criada na linha 2, antes do git pull. É preciso atualizar a main (git pull) antes de criar a branch, para partir do estado mais recente.' },
    { id: 'git-av-06', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual opção de push é a mais segura quando você precisa reescrever uma branch SUA já enviada (por exemplo, depois de um rebase)?', options: ['git push --force', 'git push --force-with-lease', 'git push --delete', 'git push --tags'], answer: 1, explanation: '--force-with-lease só força se o remoto ainda estiver como você viu, evitando apagar commits que chegaram nesse meio tempo. Use apenas em branches suas.' },
    { id: 'git-av-07', type: 'tf', difficulty: 2, points: 5, prompt: 'git revert reescreve o histórico removendo o commit indicado.', answer: false, explanation: 'revert cria um novo commit que desfaz o efeito do original, preservando o histórico. É o método seguro para o que já foi compartilhado.' },
    { id: 'git-av-08', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para criar uma tag anotada da versão 1.2.0 e enviá-la ao remoto.', code: "git tag [[0]] v1.2.0 -m \"Versão 1.2.0\"\ngit push origin [[1]]", answers: [['-a'], ['v1.2.0']], explanation: '-a cria uma tag anotada (com autor, data e mensagem). Tags só vão ao remoto se forem enviadas explicitamente.' },
    { id: 'git-av-09', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma branch de feature tem seis commits "wip". Antes de abrir o pull request, você quer deixá-los em dois commits bem descritos. Qual comando usa?', options: ['git reset --hard origin/main', 'git rebase -i origin/main', 'git cherry-pick main', 'git stash push'], answer: 1, explanation: 'O rebase interativo permite juntar (squash/fixup), renomear (reword) e reordenar commits da sua branch ainda não compartilhada.' },
    { id: 'git-av-10', type: 'trace', difficulty: 3, points: 15, prompt: 'A versão é §0.8.3§. Os commits desde a última tag são os abaixo.', code: "feat(ui): novo tema escuro\nfix(api): corrige timeout\ndocs: atualiza README\najustes finais\nfeat(core)!: remove API antiga", lang: 'text', steps: [ { q: 'Próxima versão', answers: ['1.0.0'] }, { q: 'Quantas mensagens estão fora do padrão Conventional Commits?', answers: ['1', 'uma'] }, { q: 'Qual a próxima versão se o último commit (com "!") fosse removido?', answers: ['0.9.0'] } ], explanation: 'Há uma mudança incompatível (!), então sobe MAJOR: 1.0.0. Só "ajustes finais" está fora do padrão. Sem o commit com "!", o feat leva a MINOR: 0.9.0.' },
    { id: 'git-av-11', type: 'open', difficulty: 3, points: 15, prompt: 'Sua equipe de 6 pessoas publica várias vezes por semana e hoje faz push direto na main, o que já quebrou a publicação duas vezes. Proponha um fluxo de trabalho no GitHub para reduzir esse risco, citando pelo menos quatro práticas.', model: 'Adotar o GitHub flow: a main sempre publicável e branches curtas por tarefa. Cada mudança entra por pull request pequeno, com descrição (o quê, por quê, como testar). Proteger a main: exigir ao menos uma revisão aprovada, exigir que as verificações automáticas (testes, lint) passem e bloquear force push. Rodar o pipeline de testes em todo PR. Usar squash ou merge commit conforme combinado e apagar a branch depois. Opcional: CODEOWNERS, tags e SemVer nas releases.', rubric: ['Propõe branches curtas por tarefa com pull request em vez de push direto', 'Propõe revisão de código obrigatória', 'Propõe verificações automáticas (testes/lint) que precisam passar', 'Propõe proteger a branch main (bloquear push direto e force push)', 'Cita PRs pequenos e bem descritos, ou tags/SemVer nas releases'], explanation: 'Compare com o modelo e marque os critérios atendidos.' },
    { id: 'git-av-12', type: 'tf', difficulty: 1, points: 5, prompt: 'Se uma chave de API foi commitada e enviada, apagar o arquivo em um novo commit é suficiente para eliminar o risco.', answer: false, explanation: 'O segredo continua no histórico e em clones. A primeira ação é revogar a chave e gerar outra; depois, limpar o histórico se necessário.' }
  ]
};

export const project = {
  id: 'gerador-release', name: 'Gerador de release a partir de commits', lv: 'M', stack: 'JavaScript (Node.js ou navegador)', ds: ['git', 'logic'],
  desc: 'Equipes modernas publicam versões e changelogs automaticamente a partir das mensagens de commit. Construa o núcleo desse processo: dado o número da versão atual e a lista de mensagens de commit desde a última tag (padrão Conventional Commits), calcule a próxima versão segundo SemVer e gere o changelog em Markdown.',
  rf: ['Interpretar o cabeçalho de cada mensagem (tipo, escopo opcional, "!" opcional, descrição)', 'Detectar mudanças incompatíveis pelo "!" ou por uma linha BREAKING CHANGE: no corpo/rodapé', 'Calcular a próxima versão: breaking sobe MAJOR, feat sobe MINOR e fix sobe PATCH, zerando os números à direita', 'Gerar o changelog em Markdown, com as seções Mudanças incompatíveis, Funcionalidades e Correções, nesta ordem, apenas quando houver itens', 'Mensagens fora do padrão vão para a lista de ignoradas e não entram no changelog', 'Devolver { proxima, changelog, ignorados }; sem mudanças publicáveis, proxima é null e o changelog é uma string vazia'],
  rnf: ['Não alterar as entradas', 'Funções pequenas e testáveis (analisar mensagem, calcular versão, formatar changelog)', 'Sem dependências externas', 'Versão inválida lança um erro com mensagem clara'],
  ac: ['Todos os testes automatizados do laboratório passam', 'Um commit incompatível aparece apenas na seção Mudanças incompatíveis', 'O changelog começa com "## " e a próxima versão', 'Um README explica como o projeto seria integrado a um fluxo de publicação (por exemplo, a um workflow de GitHub Actions)'],
  ch: ['Tratar mensagens com várias linhas e rodapés', 'Decidir o que fazer com tipos desconhecidos mas válidos (docs, chore)', 'Extensão: aceitar pré-lançamentos (1.0.0-rc.1) seguindo a especificação SemVer'],
  lab: { lang: 'javascript',
    prompt: 'Implemente §gerarRelease(atual, commits)§. §atual§ é a versão (ex.: §"1.4.2"§) e §commits§ é a lista de mensagens. Devolva §{ proxima, changelog, ignorados }§. O §changelog§ começa com §## <proxima>§, seguido de uma linha em branco e das seções (§### Mudanças incompatíveis§, §### Funcionalidades§, §### Correções§, nesta ordem, só as que tiverem itens), separadas por uma linha em branco. Cada item é §- descrição§ ou §- **escopo:** descrição§, na ordem original. Commits incompatíveis aparecem **só** na primeira seção. Mensagens fora do padrão vão para §ignorados§ (texto original). Tipos válidos sem efeito (docs, chore…) não entram no changelog nem em §ignorados§. Sem mudanças publicáveis: §proxima§ é §null§ e §changelog§ é §""§. Versão inválida lança um erro.',
    starter: "function gerarRelease(atual, commits) {\n  // 1) valide a versão atual\n  // 2) analise cada mensagem\n  // 3) calcule a próxima versão\n  // 4) monte o changelog\n  return { proxima: null, changelog: '', ignorados: [] };\n}\n",
    tests: [
      { name: 'versão e changelog completos', code: R`const r = gerarRelease('1.4.2', ['feat(api): novo endpoint de busca', 'fix: corrige arredondamento', 'docs: atualiza README', 'ajustes']);
assert.equal(r.proxima, '1.5.0');
assert.equal(r.changelog, '## 1.5.0\n\n### Funcionalidades\n- **api:** novo endpoint de busca\n\n### Correções\n- corrige arredondamento');
assert.deepEqual(r.ignorados, ['ajustes']);` },
      { name: 'breaking aparece só na sua seção', code: R`const r = gerarRelease('1.4.2', ['feat(api)!: remove o endpoint antigo', 'fix(core): corrige erro', 'feat: tema escuro']);
assert.equal(r.proxima, '2.0.0');
assert.equal(r.changelog, '## 2.0.0\n\n### Mudanças incompatíveis\n- **api:** remove o endpoint antigo\n\n### Funcionalidades\n- tema escuro\n\n### Correções\n- **core:** corrige erro');` },
      { name: 'BREAKING CHANGE no rodapé', code: R`const r = gerarRelease('0.9.1', ['fix: muda o formato\n\nBREAKING CHANGE: campos renomeados']);
assert.equal(r.proxima, '1.0.0');
assert.ok(r.changelog.includes('### Mudanças incompatíveis\n- muda o formato'));
assert.ok(!r.changelog.includes('### Correções'));` },
      { name: 'só correções sobem PATCH', code: R`const r = gerarRelease('2.0.0', ['fix(ui): alinha botão']);
assert.equal(r.proxima, '2.0.1');
assert.equal(r.changelog, '## 2.0.1\n\n### Correções\n- **ui:** alinha botão');` },
      { name: 'nada publicável', code: R`const r = gerarRelease('3.1.0', ['docs: ajusta README', 'chore: atualiza deps', 'wip']);
assert.equal(r.proxima, null);
assert.equal(r.changelog, '');
assert.deepEqual(r.ignorados, ['wip']);` },
      { name: 'versão inválida lança erro', code: R`assert.throws(() => gerarRelease('1.0', ['fix: x']));` },
      { name: 'não altera as entradas e é rápido', code: R`const commits = []; for (let i = 0; i < 20000; i++) commits.push(i % 3 === 0 ? 'feat(m' + (i % 7) + '): item ' + i : i % 3 === 1 ? 'fix: item ' + i : 'chore: item ' + i);
const copia = JSON.stringify(commits);
const t = Date.now();
const r = gerarRelease('1.0.0', commits);
assert.equal(JSON.stringify(commits), copia);
assert.equal(r.proxima, '1.1.0');
assert.ok(Date.now() - t < 1000, 'levou ' + (Date.now() - t) + ' ms');` }
    ],
    solution: R`function analisar(msg) {
  const linhas = String(msg).split('\n');
  const m = linhas[0].trim().match(/^([A-Za-z]+)(?:\(([^()\s]+)\))?(!)?: (\S.*)$/);
  if (!m) return null;
  const rodape = linhas.slice(1).some((l) => /^BREAKING[ -]CHANGE: /.test(l));
  return { tipo: m[1].toLowerCase(), escopo: m[2] || null, descricao: m[4].trim(), breaking: Boolean(m[3]) || rodape };
}

function gerarRelease(atual, commits) {
  const v = /^(\d+)\.(\d+)\.(\d+)$/.exec(atual);
  if (!v) throw new Error('versão inválida: ' + atual);
  const maior = Number(v[1]), menor = Number(v[2]), patch = Number(v[3]);
  const incompativeis = [], funcionalidades = [], correcoes = [], ignorados = [];
  for (const msg of commits) {
    const c = analisar(msg);
    if (!c) { ignorados.push(msg); continue; }
    const item = c.escopo ? '**' + c.escopo + ':** ' + c.descricao : c.descricao;
    if (c.breaking) incompativeis.push(item);
    else if (c.tipo === 'feat') funcionalidades.push(item);
    else if (c.tipo === 'fix') correcoes.push(item);
  }
  let proxima = null;
  if (incompativeis.length) proxima = (maior + 1) + '.0.0';
  else if (funcionalidades.length) proxima = maior + '.' + (menor + 1) + '.0';
  else if (correcoes.length) proxima = maior + '.' + menor + '.' + (patch + 1);
  if (proxima === null) return { proxima: null, changelog: '', ignorados };
  const secoes = [['Mudanças incompatíveis', incompativeis], ['Funcionalidades', funcionalidades], ['Correções', correcoes]]
    .filter((s) => s[1].length)
    .map((s) => '### ' + s[0] + '\n' + s[1].map((i) => '- ' + i).join('\n'));
  return { proxima, changelog: '## ' + proxima + '\n\n' + secoes.join('\n\n'), ignorados };
}`
  }
};
