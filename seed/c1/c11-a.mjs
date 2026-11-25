// C1.1 — Linux, terminal e sistemas operacionais. Aulas 1 a 3 (arquivos, comandos e permissões).
// Convenções: "§" vira crase; "DOLAR{" vira "${"; código em String.raw.
const R = String.raw;

export const REF = {
  hier: { title: 'Linux man-pages — hier(7): descrição da hierarquia do sistema de arquivos', url: 'https://man7.org/linux/man-pages/man7/hier.7.html', kind: 'doc' },
  fhs: { title: 'Linux Foundation — Filesystem Hierarchy Standard', url: 'https://refspecs.linuxfoundation.org/fhs.shtml', kind: 'spec' },
  pathRes: { title: 'Linux man-pages — path_resolution(7)', url: 'https://man7.org/linux/man-pages/man7/path_resolution.7.html', kind: 'doc' },
  inode: { title: 'Linux man-pages — inode(7)', url: 'https://man7.org/linux/man-pages/man7/inode.7.html', kind: 'doc' },
  bashManual: { title: 'Bash Reference Manual (página do mantenedor, Chet Ramey, Case Western Reserve University)', url: 'https://tiswww.case.edu/php/chet/bash/bashref.html', kind: 'doc' },
  coreutils: { title: 'The Open Group — POSIX.1-2024: índice de utilitários (ls, cp, mv, sort, uniq, cut e outros)', url: 'https://pubs.opengroup.org/onlinepubs/9799919799/idx/utilities.html', kind: 'spec' },
  grep: { title: 'The Open Group — POSIX.1-2024: grep', url: 'https://pubs.opengroup.org/onlinepubs/9799919799/utilities/grep.html', kind: 'spec' },
  findutils: { title: 'The Open Group — POSIX.1-2024: find', url: 'https://pubs.opengroup.org/onlinepubs/9799919799/utilities/find.html', kind: 'spec' },
  chmod: { title: 'Linux man-pages — chmod(2)', url: 'https://man7.org/linux/man-pages/man2/chmod.2.html', kind: 'doc' },
  creds: { title: 'Linux man-pages — credentials(7)', url: 'https://man7.org/linux/man-pages/man7/credentials.7.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'lnx-01', moduleId: 'm1', order: 1, minutes: 55, tags: ['linux', 'terminal', 'sistema-de-arquivos'],
  title: 'Sistema de arquivos e navegação no terminal',
  objectives: ['Ler a árvore de diretórios do Linux e dizer para que serve cada diretório principal', 'Navegar com caminhos absolutos e relativos, incluindo ., .. e ~', 'Explicar a diferença entre link simbólico e link físico (hard link) usando o conceito de inode', 'Listar, criar e inspecionar arquivos e diretórios com ls, mkdir, touch, stat e file'],
  intro: `Em Linux **tudo começa em uma única árvore**: não existem letras de unidade como C: e D:. Há uma raiz (§/§) e todo o resto, discos, pendrives, dispositivos e até informações do kernel, aparece como arquivo ou diretório dentro dela. Dominar essa árvore e saber andar por ela no terminal é a base de qualquer trabalho com servidores, contêineres, CI e produção: quase todo erro operacional começa com "onde está esse arquivo?" ou "quem pode ler isso?".`,
  theory: `### Uma árvore, uma raiz
O sistema de arquivos do Linux é uma hierarquia que parte da raiz §/§. Cada diretório contém arquivos e outros diretórios. Dispositivos de armazenamento são **montados** em algum diretório da árvore (por exemplo, um disco extra em §/mnt/dados§); para o programa, é só mais uma pasta. O padrão que descreve a organização é o **Filesystem Hierarchy Standard (FHS)**, e a página §hier(7)§ do manual resume o uso de cada diretório.

| Diretório | Para que serve |
|---|---|
| §/home§ | pastas pessoais dos usuários (§/home/ana§) |
| §/etc§ | arquivos de configuração do sistema |
| §/var§ | dados que mudam durante a execução: logs (§/var/log§), filas, bancos locais |
| §/tmp§ | arquivos temporários; qualquer usuário escreve, e o conteúdo pode ser apagado |
| §/usr§ | programas e bibliotecas instalados (§/usr/bin§, §/usr/lib§) |
| §/opt§ | software de terceiros instalado fora do gerenciador de pacotes |
| §/dev§ | dispositivos, como arquivos (§/dev/null§, §/dev/sda§) |
| §/proc§ e §/sys§ | visões do kernel: processos, memória, hardware (não ficam em disco) |
| §/boot§ | kernel e arquivos de inicialização |

Em distribuições modernas, §/bin§ e §/lib§ costumam ser links para §/usr/bin§ e §/usr/lib§. Isso é detalhe de cada distribuição; o importante é saber **procurar**: configuração em §/etc§, logs em §/var/log§, programas em §/usr/bin§.

### Caminhos absolutos e relativos
- **Absoluto**: começa em §/§ e vale de qualquer lugar: §/home/ana/projeto/src/app.js§.
- **Relativo**: começa a partir do **diretório atual** (§pwd§): §src/app.js§.
- Atalhos: §.§ é o diretório atual, §..§ é o pai, §~§ é a sua pasta pessoal, §-§ (em §cd -§) volta ao diretório anterior.

O kernel resolve o caminho componente por componente (a página §path_resolution(7)§ descreve o algoritmo). Barras repetidas são equivalentes a uma só, e nomes **diferenciam maiúsculas de minúsculas**: §Relatorio.txt§ e §relatorio.txt§ são arquivos diferentes.

### Comandos de navegação e inspeção
- §pwd§ mostra onde você está; §cd diretório§ muda de lugar; §cd§ sozinho vai para §~§.
- §ls§ lista; §ls -l§ mostra tipo, permissões, dono, tamanho e data; §ls -a§ inclui arquivos ocultos (nomes que começam com ponto); §ls -lh§ mostra tamanhos legíveis; §ls -ld pasta§ mostra a própria pasta, não o conteúdo.
- §mkdir -p a/b/c§ cria a cadeia inteira sem reclamar se já existir; §touch arquivo§ cria um arquivo vazio ou atualiza a data de modificação.
- §file arquivo§ identifica o tipo pelo conteúdo; §stat arquivo§ mostra metadados completos (inode, tamanho, permissões, datas).
- §tree§ (se instalado) desenha a árvore; sem ele, §find . -maxdepth 2§ faz algo parecido.

### Inodes e links
No sistema de arquivos, um arquivo é um **inode**: uma estrutura com os metadados (dono, permissões, tamanho, ponteiros para os blocos de dados). O **nome** que você vê é só uma entrada de diretório que aponta para um número de inode. Daí vêm os dois tipos de link:

- **Link físico (hard link)** (§ln origem destino§): um segundo nome para o **mesmo inode**. Os dois nomes são igualmente "o arquivo"; apagar um não apaga os dados enquanto existir outro nome (o contador de links, visto em §stat§, só chega a zero quando o último nome some). Não atravessa sistemas de arquivos diferentes e não vale para diretórios.
- **Link simbólico (symlink)** (§ln -s alvo atalho§): um arquivo especial que guarda um **caminho de texto**. Pode apontar para diretórios e para outros sistemas de arquivos; se o alvo for apagado, o link fica "quebrado" (aponta para o nada).

### Nomes, espaços e globbing
Evite espaços e acentos em nomes de arquivos usados por scripts. Se existirem, **proteja com aspas**: §ls "meu arquivo.txt"§. O shell também expande curingas antes de chamar o programa: §*§ casa qualquer sequência, §?§ um caractere, §[abc]§ um dos listados, e §*.js§ vira a lista de arquivos terminados em .js. Isso é **globbing**, e não é o mesmo que expressão regular (tema da aula de regex em outro curso).`,
  concepts: [
    { term: 'Raiz (/)', def: 'Diretório topo da árvore; todos os discos montados e todos os arquivos aparecem sob ele.' },
    { term: 'Caminho absoluto', def: 'Caminho iniciado em /, válido independentemente do diretório atual.' },
    { term: 'Caminho relativo', def: 'Caminho resolvido a partir do diretório atual (pwd).' },
    { term: 'Inode', def: 'Estrutura do sistema de arquivos com os metadados e a localização dos dados de um arquivo; nomes apontam para inodes.' },
    { term: 'Hard link', def: 'Segundo nome para o mesmo inode; os dados só somem quando o último nome é removido.' },
    { term: 'Link simbólico', def: 'Arquivo que contém o caminho de outro; quebra se o alvo deixar de existir.' },
    { term: 'Ponto de montagem', def: 'Diretório onde um sistema de arquivos (disco, partição, pseudo-sistema) é encaixado na árvore.' },
    { term: 'Globbing', def: 'Expansão de curingas (*, ?, [..]) feita pelo shell antes de executar o comando.' }
  ],
  examples: R`**Analogia:** a árvore de diretórios é um prédio com um único térreo (§/§). O **caminho absoluto** é o endereço completo ("rua, número, andar, sala"); o **relativo** é "duas portas à esquerda daqui". O **inode** é a ficha do arquivo no arquivo morto; o **nome** é uma etiqueta colada em uma gaveta que aponta para essa ficha. Um hard link é uma segunda etiqueta para a mesma ficha; um link simbólico é um bilhete que diz "veja na gaveta tal".

**Onde procurar o quê (no dia a dia de um servidor):**
- Serviço não sobe: configuração em §/etc/<serviço>§, logs em §/var/log/§.
- "Disco cheio": quase sempre §/var/log§, §/tmp§ ou diretórios de dados.
- Programa instalado à mão: §/opt§ ou §/usr/local/bin§.`,
  code: [
    { title: 'Navegação, links e inodes (executado em bash 5 no Linux)', lang: 'bash', code: R`mkdir -p projeto/src projeto/docs
cd projeto
echo 'console.log(1)' > src/app.js
ln -s src/app.js atalho.js      # link simbólico
ln src/app.js dura.js           # link físico
ls -l atalho.js                 # lrwxrwxrwx ... atalho.js -> src/app.js
ls -li src/app.js dura.js       # mesmo número de inode nos dois
stat -c '%i %h' src/app.js      # inode e contagem de links: 2 nomes`, notes: [{ l: '1', t: '-p cria a cadeia inteira e não falha se já existir.' }, { l: '4', t: 'Redireciona a saída de echo para um arquivo (aula 2).' }, { l: '5', t: 'O symlink guarda o texto "src/app.js"; é um arquivo à parte.' }, { l: '6', t: 'O hard link cria outro nome para o mesmo inode.' }, { l: '8', t: 'ls -i mostra o inode: src/app.js e dura.js têm o mesmo número.' }, { l: '9', t: 'O formato %h mostra quantos nomes apontam para o inode (aqui, 2).' }] },
    { title: 'Caminhos relativos e absolutos', lang: 'bash', code: R`cd /tmp
pwd                  # /tmp
cd ~                 # sua pasta pessoal
cd -                 # volta para /tmp
cd ../..             # sobe dois níveis
ls -ld /etc /tmp     # os próprios diretórios, não o conteúdo`, notes: [{ l: '3', t: 'pwd imprime o diretório atual (caminho absoluto).' }, { l: '5', t: 'cd - alterna para o diretório anterior.' }, { l: '6', t: '.. é o diretório pai; ../.. sobe dois níveis.' }, { l: '7', t: '-d impede o ls de listar o conteúdo.' }] }
  ],
  bestPractices: ['Use aspas em qualquer caminho que possa ter espaços (§"$arquivo"§ em scripts).', 'Prefira caminhos absolutos em scripts e arquivos de configuração; relativos dependem de onde o comando foi executado.', 'Crie estruturas com §mkdir -p§ para o comando ser repetível sem erro.', 'Use link simbólico para atalhos e versões (§atual -> v1.4§); use hard link só quando entender o contador de links.', 'Mantenha nomes sem espaços e sem acentos em projetos e pipelines.', 'Antes de apagar ou mover, confirme o diretório com §pwd§ e §ls§.'],
  mistakes: ['Esquecer que o Linux diferencia maiúsculas de minúsculas e procurar §Config§ quando o arquivo é §config§.', 'Usar caminho relativo em tarefas agendadas (o diretório atual do cron não é o do projeto).', 'Achar que apagar um link simbólico apaga o alvo (apaga só o link).', 'Achar que um hard link é cópia: alterar um nome altera o outro, pois é o mesmo inode.', 'Esquecer as aspas e quebrar um nome com espaço em dois argumentos.', 'Procurar logs em §/home§ em vez de §/var/log§.'],
  market: `Em operações reais, boa parte do tempo de diagnóstico é localizar configuração, logs e dados. Imagens Docker, pipelines de CI e servidores usam a mesma convenção de diretórios, então quem conhece o FHS resolve incidentes mais rápido e escreve scripts que funcionam em qualquer distribuição.`,
  summary: `Linux tem uma árvore única com raiz em §/§. Configuração fica em §/etc§, logs em §/var/log§, programas em §/usr§, dados pessoais em §/home§. Caminhos podem ser absolutos (a partir de §/§) ou relativos (a partir de §pwd§), e diferenciam maiúsculas de minúsculas. Um arquivo é um inode; nomes são entradas de diretório. Hard link é outro nome para o mesmo inode; link simbólico guarda um caminho e pode quebrar. Proteja nomes com aspas.`,
  refs: [REF.hier, REF.fhs, REF.pathRes, REF.inode],
  cards: [
    { q: 'Onde ficam, por padrão, os logs e as configurações do sistema?', a: 'Logs em /var/log; configurações em /etc.' },
    { q: 'Qual a diferença entre hard link e link simbólico?', a: 'Hard link é outro nome para o mesmo inode (mesmo dado, mesmo sistema de arquivos). Link simbólico é um arquivo que guarda o caminho do alvo e quebra se o alvo some.' },
    { q: 'O que significam . , .. , ~ e cd - ?', a: 'Diretório atual, diretório pai, pasta pessoal e diretório anterior.' },
    { q: 'Por que usar aspas em "$arquivo"?', a: 'Para que nomes com espaços ou curingas cheguem ao comando como um único argumento.' }
  ]
},
{
  id: 'lnx-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['linux', 'shell', 'comandos', 'pipes'],
  title: 'Comandos essenciais: arquivos, texto, pipes e redirecionamento',
  objectives: ['Copiar, mover, renomear e remover arquivos sabendo os riscos de cada comando', 'Ler e filtrar texto com cat, less, head, tail, grep, sort, uniq, wc e cut', 'Localizar arquivos com find e combinar comandos com pipes', 'Redirecionar stdin, stdout e stderr e interpretar códigos de saída', 'Consultar ajuda com man, --help e type'],
  intro: `A força do terminal está em **combinar programas pequenos**. Cada comando faz uma coisa, lê texto e escreve texto, e o shell liga um ao outro com pipes. Com meia dúzia de comandos você filtra um log de gigabytes, conta ocorrências, encontra arquivos esquecidos e automatiza tarefas repetitivas. Esta aula reúne o "kit de sobrevivência" que você usará todos os dias.`,
  theory: `### Manipular arquivos
- §cp origem destino§ copia; §cp -r pasta destino§ copia diretórios recursivamente.
- §mv origem destino§ move **ou renomeia** (é a mesma operação; dentro do mesmo sistema de arquivos é instantâneo).
- §rm arquivo§ remove. **Não há lixeira**: o arquivo some. §rm -r pasta§ remove recursivamente e §rm -f§ ignora erros e não pergunta. Antes de rodar §rm -r§ com curingas, rode o mesmo padrão com §ls§ para ver o que seria atingido.
- §mkdir -p§, §rmdir§ (só diretório vazio), §touch§.

### Ler texto
- §cat arquivo§ imprime tudo; §less arquivo§ pagina (§/§ busca, §q§ sai, §G§ vai ao fim); §head -n 5§ e §tail -n 5§ mostram o começo e o fim; §tail -f log§ acompanha o arquivo crescendo (§-F§ também sobrevive à rotação do log).
- §wc -l§ conta linhas; §wc -w§ palavras; §wc -c§ bytes.

### Filtrar e transformar
- §grep padrão arquivo§ mostra linhas que casam. Opções frequentes: §-i§ ignora maiúsculas, §-n§ mostra o número da linha, §-v§ inverte (linhas que **não** casam), §-c§ conta, §-r§ procura em diretórios, §-E§ usa expressões regulares estendidas. O código de saída é **0 se achou**, **1 se não achou**, **2 em caso de erro**.
- §sort§ ordena (§-n§ numérico, §-r§ reverso); §uniq -c§ conta repetições **consecutivas** (por isso quase sempre vem depois de §sort§); §cut -d',' -f2§ extrai a coluna 2 de um CSV simples; §tr§ troca ou apaga caracteres.
- §find caminho -name '*.js' -type f§ procura por nome e tipo; §-mtime -1§ filtra por modificação; §-size +10M§ por tamanho; §-exec comando {} ;§ executa um comando para cada resultado. §xargs§ transforma linhas de entrada em argumentos: §find . -name '*.log' | xargs wc -l§ (com nomes que têm espaço, prefira §find ... -print0 | xargs -0 ...§).

### Transformar texto: tr, sed e awk (primeiro contato)
Quando §cut§ e §grep§ não bastam, três ferramentas clássicas resolvem a maioria dos casos:
- §tr 'a-z' 'A-Z'§ troca caractere por caractere (aqui, minúsculas por maiúsculas); §tr -d '\\r'§ remove retornos de carro de arquivos criados no Windows.
- §sed 's/ana/ANA/g' arq§ substitui texto (§s/padrão/novo/§, com §g§ para todas as ocorrências); §sed -n '2p' arq§ imprime só a linha 2. Sem a opção §-i§, o §sed§ **não altera o arquivo**, só imprime o resultado.
- §awk -F, '{print $1}' arq§ trata cada linha como colunas separadas por vírgula; com variáveis, soma e agrupa: §awk -F, '{s[$1]+=$2} END{for (k in s) print k, s[k]}' vendas.csv§ imprime o total da coluna 2 por valor da coluna 1. Executamos esse exemplo com um CSV de três linhas e ele devolveu "ana 40" e "bia 20".

O §sed -i§ e o §awk§ com gravação exigem cuidado: teste primeiro sem alterar o arquivo e faça cópia antes de editar "no lugar".

### Pipes e redirecionamento
Todo processo nasce com três **fluxos**: **stdin** (entrada, descritor 0), **stdout** (saída, 1) e **stderr** (erros, 2). O shell permite reconectá-los:

| Sintaxe | Efeito |
|---|---|
| §cmd > arq§ | grava a saída em §arq§, **sobrescrevendo** |
| §cmd >> arq§ | acrescenta ao fim |
| §cmd < arq§ | usa §arq§ como entrada |
| §cmd 2> erros.txt§ | grava só os erros |
| §cmd > tudo.txt 2>&1§ | saída e erros no mesmo arquivo (a ordem importa) |
| §cmd > /dev/null 2>&1§ | descarta tudo |

O **pipe** (§a | b§, a barra vertical entre dois comandos) liga a saída de §a§ à entrada de §b§. Ele é o coração da filosofia Unix: programas pequenos, que leem e escrevem texto, ligados em fila. Exemplo clássico, as três linhas mais frequentes de um log: §sort log | uniq -c | sort -rn | head -3§.

### Códigos de saída
Todo comando termina com um número: **0 significa sucesso**, qualquer outro valor indica falha. O shell guarda o último em §$?§. Scripts e pipelines de CI decidem o que fazer com base nisso (§cmd1 && cmd2§ executa o segundo só se o primeiro der certo; §cmd1 || cmd2§ só se falhar).

### Pedir ajuda
- §man comando§ abre o manual (§/§ para buscar, §q§ para sair); §comando --help§ dá um resumo; §type comando§ mostra se é programa, alias ou função do shell; §which§/§command -v§ mostra o caminho do executável.
- Aprender a ler o manual vale mais do que decorar opções: a seção §SYNOPSIS§ resume o formato, e §EXAMPLES§ costuma resolver o caso.`,
  concepts: [
    { term: 'stdin, stdout, stderr', def: 'Os três fluxos padrão de um processo (descritores 0, 1 e 2): entrada, saída e erros.' },
    { term: 'Pipe (|)', def: 'Conexão que envia a saída de um comando para a entrada do próximo.' },
    { term: 'Redirecionamento', def: 'Troca o destino ou a origem de um fluxo: > sobrescreve, >> acrescenta, < lê de arquivo, 2> redireciona erros.' },
    { term: 'Código de saída', def: 'Número devolvido ao terminar; 0 é sucesso e qualquer outro valor é falha. Lido em $?.' },
    { term: 'grep', def: 'Filtra linhas que casam com um padrão; sai com 0 se achou, 1 se não achou e 2 em erro.' },
    { term: 'find', def: 'Percorre diretórios e seleciona arquivos por nome, tipo, tamanho ou data.' },
    { term: 'xargs', def: 'Converte linhas da entrada em argumentos de outro comando.' },
    { term: '/dev/null', def: 'Dispositivo que descarta tudo o que recebe e devolve fim de arquivo na leitura.' }
  ],
  examples: R`**Receita 1 — os erros mais frequentes de um log:**
§grep -i erro app.log | sort | uniq -c | sort -rn | head -3§
Filtra as linhas com "erro" (qualquer caixa), ordena, conta repetições, ordena pelo maior contador e mostra as três primeiras.

**Receita 2 — arquivos .log grandes e antigos:**
§find /var/log -name '*.log' -size +50M -mtime +30§
Lista candidatos à limpeza antes de apagar qualquer coisa.

**Receita 3 — salvar saída e erros separados:**
§./build.sh > build.out 2> build.err§ e depois §grep -n 'error' build.err§.

**Armadilha clássica:** §sort arq > arq§ **esvazia o arquivo antes** de o sort ler, porque o shell abre o destino (truncando-o) antes de executar o comando. Escreva em um arquivo temporário e depois use §mv§.`,
  code: [
    { title: 'Filtrando um log com pipes (executado em bash 5)', lang: 'bash', code: R`printf 'linha um\nerro: disco cheio\nlinha tres\nERRO: rede\n' > log.txt
grep -n -i erro log.txt      # 2:erro: disco cheio  /  4:ERRO: rede
grep -c erro log.txt         # 1 (só casa minúsculas)
printf 'b\na\nb\nc\na\nb\n' | sort | uniq -c | sort -rn
#       3 b
#       2 a
#       1 c`, notes: [{ l: '2', t: '-n numera as linhas e -i ignora a caixa: casa "erro" e "ERRO".' }, { l: '3', t: 'Sem -i, só a linha em minúsculas casa; -c conta linhas, não ocorrências.' }, { l: '4', t: 'sort agrupa iguais, uniq -c conta cada grupo, sort -rn ordena do maior para o menor.' }] },
    { title: 'Redirecionamento e códigos de saída', lang: 'bash', code: R`ls /nao-existe 2> erros.txt   # o erro vai para o arquivo
echo $?                       # 2: ls falhou
cat erros.txt                 # ls: cannot access '/nao-existe': No such file or directory
grep -q xyz /etc/hostname; echo $?   # 1: grep não achou
true && echo "só roda se deu certo"
false || echo "só roda se falhou"`, notes: [{ l: '1', t: '2> redireciona apenas o stderr; nada aparece na tela.' }, { l: '2', t: '$? guarda o código de saída do último comando.' }, { l: '3', t: 'A mensagem exata depende do idioma do sistema (aqui, inglês).' }, { l: '4', t: '-q suprime a saída do grep; só interessa o código (1 = não achou).' }, { l: '5', t: '&& encadeia no sucesso; || no fracasso.' }] }
  ],
  bestPractices: ['Teste filtros com §head§ e comandos de leitura antes de usar §rm§, §mv§ ou §-exec§.', 'Rode §ls padrão*§ antes de §rm padrão*§.', 'Use §grep -F§ para texto literal (sem regex) e §-E§ quando precisar de alternância.', 'Redirecione erros de forma explícita (§2>§ ou §2>&1§) em tarefas agendadas.', 'Prefira §find -print0 | xargs -0§ para nomes com espaços.', 'Verifique o código de saída (§$?§) em vez de procurar a palavra "erro" na tela.'],
  mistakes: ['Ler e gravar o mesmo arquivo no mesmo comando (§sort a > a§ zera o arquivo).', 'Usar §uniq§ sem §sort§ e esperar contagem global.', 'Escrever §cmd 2>&1 > arq§ (ordem errada: o stderr ainda vai ao terminal); o correto é §cmd > arq 2>&1§.', 'Usar §rm -rf§ com variável vazia (§rm -rf "$DIR"/*§ vira §rm -rf /*§).', 'Esquecer que §>§ sobrescreve e §>>§ acrescenta.', 'Achar que §grep§ sem resultado é erro: ele sai com 1 para "não achou" e 2 para erro real.'],
  market: `Triagem de logs e filtros em pipeline são o dia a dia de SRE, DevOps e qualquer dev que depura em produção ou em CI. O mesmo encadeamento (§grep | sort | uniq -c§) aparece em scripts de deploy, relatórios rápidos de tráfego e checagens automatizadas.`,
  summary: `Combine comandos pequenos com pipes: §grep§ filtra, §sort§ e §uniq -c§ contam, §head§ limita, §find§ localiza arquivos. Fluxos padrão: stdin (0), stdout (1), stderr (2); use §>§, §>>§, §<§, §2>§ e §2>&1§. Código de saída 0 é sucesso. §rm§ não tem lixeira. Nunca leia e grave o mesmo arquivo no mesmo comando. Use §man§ e §--help§ para consultar opções.`,
  refs: [REF.coreutils, REF.grep, REF.findutils, REF.bashManual],
  cards: [
    { q: 'O que faz sort | uniq -c | sort -rn?', a: 'Agrupa linhas iguais, conta cada grupo e ordena do mais frequente para o menos frequente.' },
    { q: 'Qual a diferença entre > e >> ?', a: '> sobrescreve o arquivo; >> acrescenta ao final.' },
    { q: 'O que significa grep sair com código 1?', a: 'Nenhuma linha casou (não é erro). Código 2 indica erro real, como arquivo inexistente.' },
    { q: 'Como redirecionar saída e erros para o mesmo arquivo?', a: 'cmd > arquivo 2>&1 (a ordem importa).' },
    { q: 'Por que sort arq > arq é perigoso?', a: 'O shell trunca arq antes de o sort ler; o arquivo fica vazio.' }
  ]
},
{
  id: 'lnx-03', moduleId: 'm1', order: 3, minutes: 65, tags: ['linux', 'permissoes', 'usuarios', 'seguranca'],
  title: 'Usuários, permissões e sudo',
  objectives: ['Ler a saída de ls -l e identificar tipo, dono, grupo e permissões', 'Calcular e aplicar permissões em notação octal e simbólica com chmod', 'Explicar o significado de r, w e x em arquivos e em diretórios', 'Usar chown, umask e sudo aplicando o princípio do menor privilégio', 'Reconhecer setuid, setgid e sticky bit e onde aparecem'],
  intro: `Linux é um sistema **multiusuário** desde o início: cada arquivo e cada processo pertence a alguém, e o kernel decide, a cada operação, se ela é permitida. Permissões erradas são uma das causas mais comuns de "funciona na minha máquina, não funciona no servidor", e também de falhas de segurança graves (chaves privadas legíveis por todos, §chmod 777§ "para resolver"). Entender o modelo evita as duas coisas.`,
  theory: `### Usuários e grupos
Cada usuário tem um **UID** e pertence a um ou mais **grupos** (**GID**). O usuário com UID 0 é o **root**, que ignora quase todas as verificações. O comando §id§ mostra seu UID, GID e grupos; §whoami§ mostra o nome. Contas ficam em §/etc/passwd§ e grupos em §/etc/group§ (senhas em §/etc/shadow§, legível só pelo root). A página §credentials(7)§ explica como o kernel usa esses identificadores.

### Lendo ls -l
\`\`\`
-rwxr-x--- 1 ana dev 2048 nov 18 10:00 deploy.sh
\`\`\`
- Primeiro caractere: tipo (§-§ arquivo, §d§ diretório, §l§ link simbólico).
- Nove seguintes: três trios — **dono (u)**, **grupo (g)** e **outros (o)** — cada um com §r§ (ler), §w§ (escrever) e §x§ (executar).
- Depois: contagem de links, dono, grupo, tamanho, data e nome.

O kernel verifica nesta ordem: se você é o **dono**, vale o trio do dono; senão, se pertence ao **grupo**, vale o trio do grupo; senão vale o de **outros**. Não há soma: ser dono com trio §---§ e estar no grupo com §rwx§ **não** dá acesso.

### O que r, w, x significam
| | Arquivo | Diretório |
|---|---|---|
| §r§ | ler o conteúdo | listar os nomes (§ls§) |
| §w§ | alterar o conteúdo | criar, renomear e apagar entradas |
| §x§ | executar como programa | **atravessar** (§cd§, acessar o que está dentro) |

Duas consequências importantes: para **apagar** um arquivo você precisa de §w§ **no diretório**, não no arquivo; e sem §x§ no diretório você não acessa nada dentro dele, mesmo com permissão no arquivo.

### Notação octal e simbólica
Cada permissão vale um bit: **r = 4, w = 2, x = 1**. A soma por trio forma o dígito: §rwx§ = 7, §rw-§ = 6, §r-x§ = 5, §r--§ = 4. Assim §640§ é §rw-r-----§ e §755§ é §rwxr-xr-x§.

§§§bash
chmod 640 arquivo        # octal: define tudo de uma vez
chmod u+x deploy.sh      # simbólico: acrescenta x ao dono
chmod g-w,o= arquivo     # tira w do grupo e zera os outros
chmod -R u=rwX,go=rX pasta
§§§

§X§ maiúsculo dá execução só a diretórios (e a arquivos que já eram executáveis), ideal para ajustar árvores inteiras sem tornar todo arquivo executável.

### Dono, grupo e umask
§chown ana:dev arquivo§ muda dono e grupo (normalmente exige root); §chgrp dev arquivo§ só o grupo. A **umask** define quais bits são **removidos** de arquivos novos: arquivos nascem com base 666 e diretórios com 777; com umask §022§ resultam §644§ e §755§; com §002§ (comum em contas com grupo próprio), §664§ e §775§. Veja a sua com §umask§.

### sudo e menor privilégio
O §sudo§ executa **um** comando com os privilégios de outro usuário (por padrão, root), conforme a política em §/etc/sudoers§ (edite com §visudo§). Boas práticas: use root só para o que exige root; não trabalhe logado como root; nunca rode §chmod -R 777§ para "destravar" algo. A pergunta correta é: **quem** precisa de **qual** acesso a **qual** arquivo?

### Bits especiais
- **setuid** (§u+s§, 4000): o programa roda com os privilégios do **dono** do arquivo (por isso §passwd§ consegue alterar §/etc/shadow§); aparece como §s§ no lugar do §x§ do dono.
- **setgid** (§g+s§, 2000): em diretórios, arquivos novos herdam o **grupo** do diretório, útil em pastas de equipe.
- **sticky bit** (§+t§, 1000): em diretórios compartilhados como §/tmp§ (§drwxrwxrwt§), só o dono do arquivo (ou o root) pode apagá-lo, mesmo que todos tenham §w§ no diretório.

### Chaves SSH e arquivos sensíveis
O cliente SSH recusa chave privada legível por outros: §chmod 600 ~/.ssh/id_ed25519§ e §chmod 700 ~/.ssh§. Arquivos §.env§ com segredos devem ficar com §600§ ou §640§ e dono correto, nunca versionados no repositório.`,
  concepts: [
    { term: 'UID e GID', def: 'Identificadores numéricos do usuário e do grupo; o UID 0 é o root.' },
    { term: 'Dono, grupo, outros', def: 'As três classes de permissão; vale a primeira que se aplica ao processo.' },
    { term: 'rwx', def: 'Permissões de leitura, escrita e execução; em diretório significam listar, alterar entradas e atravessar.' },
    { term: 'Notação octal', def: 'Soma r=4, w=2, x=1 por classe: 640 = rw-r-----.' },
    { term: 'umask', def: 'Máscara que remove permissões de arquivos e diretórios recém-criados.' },
    { term: 'sudo', def: 'Executa um comando com privilégios de outro usuário conforme /etc/sudoers.' },
    { term: 'setuid', def: 'Bit que faz o programa rodar com os privilégios do dono do arquivo.' },
    { term: 'sticky bit', def: 'Em diretórios compartilhados, restringe a remoção ao dono do arquivo (ex.: /tmp).' },
    { term: 'Menor privilégio', def: 'Princípio de conceder apenas o acesso estritamente necessário.' }
  ],
  examples: R`**Analogia:** um prédio com portas. O **dono** tem a chave mestra do próprio andar; o **grupo** tem uma cópia; "outros" só entram no hall. Em um diretório, o §x§ é poder **passar pela porta**, o §r§ é poder **ler a lista de salas** e o §w§ é poder **mudar a lista** (criar ou remover salas).

**Cenário real:** o deploy falha com "Permission denied" ao gravar em §/var/www/app/uploads§. Em vez de §chmod 777§, verifique §ls -ld /var/www/app/uploads§, descubra o usuário do serviço (§ps -o user= -p PID§) e dê acesso a ele: §chown www-data:www-data uploads§ e §chmod 750§.`,
  code: [
    { title: 'Permissões em octal e simbólico (executado em bash 5)', lang: 'bash', code: R`touch f.txt && mkdir d
stat -c '%A %a %n' f.txt d      # -rw-rw-r-- 664 f.txt / drwxrwxr-x 775 d  (umask 002)
chmod 640 f.txt;   stat -c '%A %a' f.txt   # -rw-r----- 640
chmod u+x f.txt;   stat -c '%A %a' f.txt   # -rwxr----- 740
chmod g-r,o= f.txt; stat -c '%A %a' f.txt  # -rwx------ 700`, notes: [{ l: '2', t: 'Com umask 002 o arquivo nasce 664 e o diretório 775; com umask 022 seriam 644 e 755.' }, { l: '3', t: '6 = rw- para o dono; 4 = r-- para o grupo; 0 = --- para outros.' }, { l: '4', t: 'u+x acrescenta x ao dono: 640 vira 740.' }, { l: '5', t: 'g-r tira a leitura do grupo; o= zera os outros; resultado 700.' }] },
    { title: 'Permissão em diretório e sudo', lang: 'bash', code: R`mkdir area && chmod 000 area
ls area            # ls: cannot open directory 'area': Permission denied
chmod 755 area
id -un             # seu nome de usuário
sudo -l            # lista o que você pode executar com sudo`, notes: [{ l: '1', t: 'Sem r e x no diretório, nada dentro dele é acessível.' }, { l: '4', t: 'id -un mostra o nome do usuário efetivo.' }, { l: '5', t: 'sudo -l mostra a política aplicada a você, sem executar nada.' }] }
  ],
  bestPractices: ['Aplique o menor privilégio: dê só o necessário a quem precisa.', 'Use §chmod 600§ em chaves privadas e segredos, e §700§ em §~/.ssh§.', 'Use grupos (e setgid em diretórios) para compartilhar acesso em equipe.', 'Ajuste árvores com §chmod -R u=rwX,go=rX§ em vez de §-R 755§ em tudo.', 'Execute serviços com um usuário dedicado, não como root.', 'Use §visudo§ para editar o sudoers, que valida a sintaxe.'],
  mistakes: ['Resolver "Permission denied" com §chmod 777§.', 'Achar que apagar um arquivo exige §w§ no arquivo (exige §w§ e §x§ no diretório).', 'Esquecer o §x§ nos diretórios intermediários do caminho.', 'Rodar tudo como root ou com §sudo§ "por garantia", criando arquivos que depois o usuário comum não consegue alterar.', 'Gravar §.env§ e chaves com permissão aberta ou no repositório.', 'Confundir §chown§ (muda o dono) com §chmod§ (muda as permissões).'],
  market: `Contêineres, servidores e pipelines de CI falham constantemente por permissões. Saber diagnosticá-las rápido, sem recorrer a §777§, é um sinal de maturidade e faz parte de qualquer revisão de segurança (chaves, segredos, usuários de serviço).`,
  summary: `Cada arquivo tem dono, grupo e permissões §rwx§ para dono, grupo e outros; o kernel aplica a primeira classe que se aplica. Em diretórios, §r§ lista, §w§ altera entradas e §x§ atravessa. Octal soma r=4, w=2, x=1. A umask define as permissões iniciais. §sudo§ eleva um comando por vez; siga o menor privilégio. setuid, setgid e sticky bit cobrem casos especiais, como §passwd§, pastas de equipe e §/tmp§.`,
  refs: [REF.creds, REF.chmod, REF.coreutils, REF.bashManual],
  cards: [
    { q: 'O que significa 750 em chmod?', a: 'rwxr-x---: dono lê, escreve e executa; grupo lê e executa; outros não têm acesso.' },
    { q: 'Quais permissões são necessárias para apagar um arquivo?', a: 'w e x no diretório que contém o arquivo (não no arquivo).' },
    { q: 'O que o x faz em um diretório?', a: 'Permite atravessá-lo (cd e acessar o que está dentro).' },
    { q: 'Para que serve o sticky bit em /tmp?', a: 'Impede que um usuário apague arquivos de outro, mesmo com w no diretório.' }
  ]
}
];
