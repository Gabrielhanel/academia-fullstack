// C1.1 — Linux, terminal e sistemas operacionais. Aulas 4 a 6 (processos, memória, I/O e sistemas de arquivos).
import { REF as RA } from './c11-a.mjs';
const R = String.raw;

export const REF2 = {
  fork: { title: 'Linux man-pages — fork(2)', url: 'https://man7.org/linux/man-pages/man2/fork.2.html', kind: 'doc' },
  execve: { title: 'Linux man-pages — execve(2)', url: 'https://man7.org/linux/man-pages/man2/execve.2.html', kind: 'doc' },
  signal: { title: 'Linux man-pages — signal(7)', url: 'https://man7.org/linux/man-pages/man7/signal.7.html', kind: 'doc' },
  pthreads: { title: 'Linux man-pages — pthreads(7)', url: 'https://man7.org/linux/man-pages/man7/pthreads.7.html', kind: 'doc' },
  kernelMm: { title: 'The Linux kernel documentation — Concepts overview (memory management)', url: 'https://docs.kernel.org/admin-guide/mm/concepts.html', kind: 'doc' },
  free: { title: 'Linux man-pages — free(1)', url: 'https://man7.org/linux/man-pages/man1/free.1.html', kind: 'doc' },
  cgroups: { title: 'Linux man-pages — cgroups(7)', url: 'https://man7.org/linux/man-pages/man7/cgroups.7.html', kind: 'doc' },
  open: { title: 'Linux man-pages — open(2)', url: 'https://man7.org/linux/man-pages/man2/open.2.html', kind: 'doc' },
  pipe: { title: 'Linux man-pages — pipe(7)', url: 'https://man7.org/linux/man-pages/man7/pipe.7.html', kind: 'doc' },
  mount: { title: 'Linux man-pages — mount(8)', url: 'https://man7.org/linux/man-pages/man8/mount.8.html', kind: 'doc' },
  ext4: { title: 'The Linux kernel documentation — ext4 General Information', url: 'https://docs.kernel.org/admin-guide/ext4.html', kind: 'doc' },
  epoll: { title: 'Linux man-pages — epoll(7)', url: 'https://man7.org/linux/man-pages/man7/epoll.7.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'lnx-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['linux', 'processos', 'threads', 'sinais'],
  title: 'Processos, threads e sinais',
  objectives: ['Explicar o que é um processo, seu PID e a relação pai e filho (fork e exec)', 'Diferenciar processo e thread e dizer o que cada um compartilha', 'Inspecionar processos com ps, top, pgrep e /proc e interpretar os estados R, S, D, T e Z', 'Enviar sinais com kill e explicar a diferença entre SIGTERM, SIGKILL, SIGINT e SIGSTOP', 'Controlar tarefas em primeiro e segundo plano (&, jobs, fg, bg, nohup) e ler códigos de saída de término por sinal'],
  intro: `Quando você roda um comando, o sistema operacional cria um **processo**: um programa em execução, com memória própria, descritores de arquivos abertos, um usuário dono e um identificador (**PID**). Servidores web, bancos de dados, o seu editor e o próprio shell são processos. Entender como são criados, como disputam CPU, como se comunicam por **sinais** e como terminam é o que permite diagnosticar "o serviço travou", "a CPU está em 100%" e "o processo não morre".`,
  theory: `### O que é um processo
Um **programa** é um arquivo no disco. Um **processo** é uma instância desse programa em execução. Cada processo tem:
- um **PID** (identificador) e um **PPID** (PID do pai);
- um **espaço de endereçamento** próprio (memória virtual, aula seguinte);
- uma **tabela de descritores de arquivos** (stdin, stdout, stderr e o que mais abriu);
- o **usuário e grupo** dono (credenciais), o diretório atual e as variáveis de ambiente.

O kernel mantém tudo isso e divide o tempo de CPU entre os processos prontos com o **escalonador** (*scheduler*). A troca de um processo por outro na CPU é uma **troca de contexto**; ela tem custo, por isso excesso de processos ou threads competindo pode piorar o desempenho.

### Como nascem: fork e exec
No Unix um processo novo nasce em dois passos. §fork()§ cria um **filho** quase idêntico ao pai (cópia lógica do espaço de endereçamento); §exec()§ (família §execve§) **substitui** o programa do processo atual por outro. Quando você digita §ls§, o shell faz §fork§ e, no filho, §exec ls§; o pai espera o filho terminar (§wait§) e lê o **código de saída**. Todo processo, exceto o primeiro (§init§/§systemd§, PID 1), tem um pai. Se o pai morre antes, o filho é "adotado" pelo PID 1.

### Estados de um processo
O campo STAT do §ps§ mostra o estado:

| Estado | Significado |
|---|---|
| §R§ | executando ou pronto para executar |
| §S§ | dormindo, esperando um evento (rede, timer, entrada); pode ser interrompido |
| §D§ | dormindo em espera **ininterruptível**, em geral I/O de disco; não responde nem a SIGKILL até terminar |
| §T§ | parado (sinal de parada ou depuração) |
| §Z§ | **zumbi**: terminou, mas o pai ainda não leu o código de saída; não consome CPU nem memória relevante, só uma entrada na tabela |

Muitos processos em §D§ costumam indicar disco ou sistema de arquivos lento (por exemplo, NFS indisponível). Zumbis acumulados indicam um **pai que não faz §wait§**; o remédio é corrigir ou reiniciar o pai, pois um zumbi já está morto e não pode ser "morto" de novo.

### Threads
Uma **thread** é uma linha de execução **dentro** de um processo. Threads do mesmo processo **compartilham** o espaço de endereçamento (código, heap, variáveis globais) e os descritores de arquivos, mas cada uma tem sua própria **pilha** e seus registradores. No Linux, threads são criadas com §clone§ e aparecem como "tarefas" em §/proc/PID/task§; §ps -L§ as lista.

| | Processo | Thread |
|---|---|---|
| Memória | própria, isolada | compartilhada com as outras threads do processo |
| Criação e troca | mais caras | mais baratas |
| Falha | erro em um não derruba os outros | erro de memória pode derrubar o processo inteiro |
| Comunicação | pipes, sockets, memória compartilhada | variáveis compartilhadas (exige sincronização) |

Compartilhar memória é rápido, mas cria **condições de corrida** quando duas threads alteram o mesmo dado sem coordenação (tema da aula de concorrência no curso de paradigmas). O Node.js é um bom exemplo: seu código JavaScript roda em uma única thread, mas o processo tem outras (pool de I/O, GC, V8); em uma execução simples você verá várias tarefas em §/proc/PID/task§.

### Observando processos
- §ps aux§ (estilo BSD) ou §ps -ef§ (estilo System V) listam tudo; §ps -o pid,ppid,stat,rss,comm -p PID§ escolhe colunas.
- §top§ (ou §htop§) mostra uso de CPU e memória ao vivo; em §top§: §P§ ordena por CPU, §M§ por memória, §q§ sai.
- §pgrep nome§ devolve PIDs por nome; §pstree§ mostra a árvore pai/filho.
- §/proc/PID/§ expõe o processo como arquivos: §status§, §cmdline§, §fd/§ (descritores), §task/§ (threads).
- §uptime§ mostra a **carga média** (*load average*) de 1, 5 e 15 minutos: a média de processos prontos ou esperando I/O. Compare com o número de CPUs (§nproc§): carga 4 em uma máquina com 4 CPUs significa saturação, não "4%".

### Sinais
**Sinais** são notificações assíncronas enviadas a um processo. Cada um tem número e comportamento padrão; o processo pode **capturar** a maioria e reagir, exceto SIGKILL e SIGSTOP.

| Sinal | Número (x86/ARM) | Uso |
|---|---|---|
| §SIGINT§ | 2 | Ctrl+C: interromper |
| §SIGTERM§ | 15 | pedido **educado** para terminar (o padrão de §kill§); permite limpar recursos |
| §SIGKILL§ | 9 | terminação **forçada**, não pode ser capturada nem ignorada; sem limpeza |
| §SIGHUP§ | 1 | terminal fechou; muitos serviços o usam para recarregar a configuração |
| §SIGSTOP§ / §SIGCONT§ | 19 / 18 | parar e continuar (§SIGSTOP§ não pode ser capturado) |
| §SIGTSTP§ | 20 | Ctrl+Z: parar a partir do terminal |

Use §kill PID§ (envia SIGTERM) e espere; só recorra a §kill -9 PID§ se o processo não responder, pois ele não flush buffers, não remove arquivos temporários nem fecha conexões com elegância. O §pkill nome§ age por nome.

**Códigos de saída por sinal:** quando um processo morre por um sinal, o shell reporta **128 + número do sinal**. Assim, **143** é SIGTERM (128+15) e **137** é SIGKILL (128+9). Em contêineres, ver "exit code 137" é o sinal clássico de **morte por SIGKILL**, frequentemente do *OOM killer* (aula 5).

### Primeiro e segundo plano
- §comando &§ roda em segundo plano; §jobs§ lista; §fg %1§ traz de volta; §bg %1§ continua um job parado (após Ctrl+Z).
- Ao fechar o terminal, o shell envia SIGHUP aos jobs. §nohup comando &§ (ou §setsid§) ignora o SIGHUP; para serviços de verdade, use um **gerenciador de serviços** (systemd), não §&§.
- §nice -n 10 comando§ e §renice§ ajustam a prioridade (valor maior = mais "gentil" com os outros).`,
  concepts: [
    { term: 'Processo', def: 'Programa em execução com espaço de endereçamento, descritores e credenciais próprios.' },
    { term: 'PID e PPID', def: 'Identificador do processo e identificador do pai.' },
    { term: 'fork e exec', def: 'fork cria um filho quase idêntico; exec troca o programa do processo atual por outro.' },
    { term: 'Thread', def: 'Linha de execução dentro de um processo; compartilha memória e descritores, mas tem pilha própria.' },
    { term: 'Escalonador', def: 'Parte do kernel que decide qual processo ou thread usa a CPU e por quanto tempo.' },
    { term: 'Troca de contexto', def: 'Salvar o estado de um processo e restaurar o de outro na CPU.' },
    { term: 'Processo zumbi', def: 'Processo terminado cujo pai ainda não leu o código de saída.' },
    { term: 'SIGTERM e SIGKILL', def: 'Pedido de término que pode ser tratado (15) e terminação forçada que não pode ser capturada (9).' },
    { term: 'Carga média', def: 'Média de tarefas prontas ou aguardando I/O em 1, 5 e 15 minutos; interpretar em relação ao número de CPUs.' },
    { term: 'Código 128+n', def: 'Convenção do shell: processo morto pelo sinal n sai com 128 + n (137 = SIGKILL, 143 = SIGTERM).' }
  ],
  examples: R`**Analogia:** um processo é uma **cozinha completa** (bancadas, ingredientes e cadernos de receitas só dela). Threads são **cozinheiros trabalhando na mesma cozinha**: dividem bancada e ingredientes, o que é rápido, mas dois cozinheiros pegando o mesmo ovo ao mesmo tempo geram confusão. Um **sinal** é um recado na porta da cozinha: "pare de cozinhar quando puder" (SIGTERM) ou "saia agora" (SIGKILL).

**Cenário real — serviço que não morre:** o §kill PID§ não surtiu efeito. Passos: (1) §ps -o pid,stat,wchan:20,cmd -p PID§ para ver o estado. Se for §D§, o processo espera I/O e nem SIGKILL funciona até o disco responder; investigue o disco. Se for §S§ e o programa captura SIGTERM, espere o tempo de encerramento e só então §kill -9§. (2) Se aparecer como §Z§, mate ou corrija o **pai** (§ps -o ppid= -p PID§).

**Cenário real — contêiner reinicia sozinho:** código **137** nos logs do orquestrador significa SIGKILL, em geral por falta de memória; vá à aula 5.`,
  code: [
    { title: 'Processos, sinais e códigos de saída (executado em bash 5)', lang: 'bash', code: R`sleep 100 & P=$!
kill -9 $P; wait $P 2>/dev/null; echo "kill -9  => $?"    # 137
sleep 100 & P=$!
kill $P;    wait $P 2>/dev/null; echo "kill     => $?"    # 143
ps -o pid,ppid,stat,comm -p $$                              # o próprio shell: estado S`, notes: [{ l: '1', t: '& manda para segundo plano; $! guarda o PID do último job.' }, { l: '2', t: 'wait devolve o código de saída do job: 128 + 9 = 137.' }, { l: '4', t: 'kill sem opção envia SIGTERM (15): 128 + 15 = 143.' }, { l: '5', t: '$$ é o PID do shell atual; o estado costuma ser S (dormindo, esperando entrada).' }] },
    { title: 'Threads e descritores via /proc (executado com Node.js 26)', lang: 'bash', code: R`node -e 'setTimeout(() => {}, 3000)' & P=$!
sleep 0.8
ls /proc/$P/task | wc -l                 # 7 neste teste: várias threads de um processo "single-thread"
grep -E '^(Threads|State)' /proc/$P/status
ls -l /proc/$P/fd | head -4              # descritores abertos
wait $P`, notes: [{ l: '3', t: 'Cada entrada de /proc/PID/task é uma thread; o número varia conforme versão e máquina.' }, { l: '4', t: '/proc/PID/status resume estado e quantidade de threads.' }, { l: '5', t: 'fd/ lista stdin, stdout, stderr e demais descritores (aula 6).' }] },
    { title: 'Zumbi: um pai que não faz wait (executado em bash 5)', lang: 'bash', code: R`bash -c 'sleep 0.1 & exec sleep 1' &
sleep 0.5
ps -o stat=,comm= --ppid $!              # Z sleep  (o filho terminou e ninguém leu o código)`, notes: [{ l: '1', t: 'O bash vira outro programa (exec sleep 1) que nunca chama wait sobre o filho que ele próprio lançou.' }, { l: '3', t: 'O filho aparece com estado Z (zumbi) até o pai terminar ou chamar wait.' }] }
  ],
  bestPractices: ['Peça término com §SIGTERM§ e deixe os programas tratarem o sinal; use §SIGKILL§ só como último recurso.', 'Escreva serviços que capturam §SIGTERM§ e encerram com limpeza (fechar conexões, gravar estado).', 'Use um gerenciador (systemd, supervisor ou orquestrador) para serviços; não dependa de §&§ e §nohup§.', 'Compare a carga média ao número de CPUs (§nproc§) antes de concluir que "está lento".', 'Em contêineres, execute um único processo principal e trate sinais corretamente (PID 1).', 'Prefira §pgrep§/§pkill§ com padrão preciso e confira o alvo com §pgrep -a§ antes de matar.'],
  mistakes: ['Usar §kill -9§ como primeira resposta e perder dados não gravados.', 'Tentar matar um zumbi (o problema está no pai).', 'Confundir uso de CPU com carga média ou ignorar o número de CPUs.', 'Achar que threads e processos compartilham as mesmas coisas (threads compartilham memória; processos não).', 'Esquecer que SIGKILL e SIGSTOP não podem ser capturados.', 'Rodar serviços com §&§ numa sessão SSH e vê-los morrer ao desconectar (SIGHUP).'],
  market: `Diagnosticar processos travados, zumbis, picos de carga e mortes por sinal (137 e 143 em contêineres e CI) é rotina em plantões de produção. Também embasa decisões de arquitetura: processos isolam falhas; threads economizam memória, mas exigem sincronização.`,
  summary: `Processo é um programa em execução com memória, descritores e dono próprios; nasce por §fork§ e §exec§ e se identifica por PID e PPID. Threads compartilham a memória do processo. Estados: §R§, §S§, §D§ (I/O), §T§ e §Z§ (zumbi, problema do pai). Sinais: §SIGTERM§ (15) pede, §SIGKILL§ (9) força, §SIGINT§ é Ctrl+C. Término por sinal gera código 128+n (137 e 143). Use §ps§, §top§, §/proc§ e a carga média contra o número de CPUs.`,
  refs: [REF2.fork, REF2.execve, REF2.signal, REF2.pthreads],
  cards: [
    { q: 'Qual a diferença entre SIGTERM e SIGKILL?', a: 'SIGTERM (15) pede término e pode ser tratado; SIGKILL (9) é forçado e não pode ser capturado nem ignorado.' },
    { q: 'O que um processo no estado Z indica?', a: 'Zumbi: já terminou, mas o pai não leu o código de saída. A correção está no pai.' },
    { q: 'O que significa o exit code 137?', a: '128 + 9: o processo foi morto por SIGKILL, frequentemente pelo OOM killer ou por limite de recursos.' },
    { q: 'O que processos e threads do mesmo processo compartilham?', a: 'Processos não compartilham memória; threads de um mesmo processo compartilham memória e descritores de arquivos.' }
  ]
},
{
  id: 'lnx-05', moduleId: 'm2', order: 5, minutes: 65, tags: ['linux', 'memoria', 'oom', 'cgroups'],
  title: 'Memória e gerenciamento de recursos',
  objectives: ['Explicar memória virtual, páginas, tabelas de páginas e falhas de página', 'Interpretar a saída de free e a diferença entre free, available e buff/cache', 'Distinguir VSZ de RSS e identificar um possível vazamento de memória', 'Explicar swap e o funcionamento do OOM killer', 'Descrever limites de recursos com ulimit e cgroups, que sustentam os contêineres'],
  intro: `Memória é o recurso cujo esgotamento derruba serviços sem aviso. O kernel esconde a memória física atrás de uma abstração, a **memória virtual**, e a gerencia com muita inteligência: usa RAM "livre" como cache, move páginas inativas para o disco e, no limite, **mata processos** para sobreviver. Quem entende essa dinâmica interpreta corretamente um painel de monitoramento, dimensiona um contêiner e não entra em pânico ao ver "memória quase toda usada".`,
  theory: `### Memória virtual
Cada processo enxerga um **espaço de endereçamento virtual** próprio e contínuo, como se tivesse a máquina inteira. A **MMU** (hardware) e o kernel traduzem endereços virtuais em endereços físicos por **tabelas de páginas**. A memória é dividida em **páginas** de tamanho fixo (tipicamente **4 KiB**; confira com §getconf PAGESIZE§). Isso traz três ganhos:
1. **Isolamento**: um processo não lê nem escreve na memória de outro.
2. **Flexibilidade**: páginas virtuais contínuas podem estar espalhadas na RAM física, ou ainda não existir nela.
3. **Compartilhamento**: o código de uma biblioteca fica uma única vez na RAM e é mapeado em vários processos.

### Falhas de página, mmap e alocação preguiçosa
Quando um processo acessa uma página que ainda não está na RAM, ocorre uma **falha de página** (*page fault*) e o kernel resolve: cria uma página zerada, lê do disco (arquivo mapeado com §mmap§ ou swap) ou termina o processo se o acesso é inválido (o famoso *segmentation fault*). A alocação é **preguiçosa**: §malloc§ de 1 GiB reserva endereços virtuais, mas a RAM só é consumida conforme as páginas são **tocadas**. Por isso o tamanho virtual de um processo pode ser muito maior que o que ele usa de fato.

### Medindo: VSZ, RSS e free
- **VSZ** (*virtual size*): total de endereços virtuais mapeados; muitas vezes enorme e pouco informativo. Na nossa medição, um Node.js ocioso tinha VSZ de cerca de 1,2 GB e RSS de cerca de 40 MB.
- **RSS** (*resident set size*): a parte que está **realmente na RAM**; é o número que interessa para consumo (§ps -o rss,vsz§, §top§ coluna RES).
- §free -h§ mostra o sistema como um todo:

| Coluna | Significado |
|---|---|
| §total§ | RAM física instalada |
| §used§ | usada por processos e kernel |
| §free§ | totalmente ociosa (costuma ser pequena em sistemas saudáveis) |
| §buff/cache§ | **cache de arquivos** e buffers: o kernel usa RAM sobrando para acelerar o disco |
| §available§ | estimativa do que pode ser dado a programas **sem swap**, incluindo cache descartável |

A regra de ouro: **olhe §available§, não §free§**. Um servidor com §free§ de 100 MB e §available§ de 10 GB está saudável, pois o cache é liberado na hora em que um programa precisar. O arquivo §/proc/meminfo§ traz o detalhe (§MemTotal§, §MemAvailable§, §SwapTotal§...).

### Swap
**Swap** é espaço em disco usado para guardar páginas pouco usadas e liberar RAM. Ajuda a absorver picos, mas disco é ordens de magnitude mais lento: um sistema que **troca páginas continuamente** (*thrashing*) fica quase parado. Sinais: §si§/§so§ altos no §vmstat§, latência crescente e processos em estado §D§. Em servidores de aplicação, muitos operadores preferem pouco ou nenhum swap e **limites de memória bem dimensionados**; em desktops, swap ajuda a hibernar. É decisão de projeto, não regra universal.

### OOM killer
Se a memória e o swap acabam e o kernel não consegue recuperar páginas, o **OOM killer** (*out-of-memory*) escolhe um processo (considerando uso de memória e ajustes em §/proc/PID/oom_score_adj§) e envia **SIGKILL**. Na prática, o serviço "some" sem mensagem própria. A evidência fica no log do kernel: §dmesg§ (ou §journalctl -k§) com linhas como "Out of memory: Killed process". Isso explica o **exit code 137** visto na aula anterior. Observação: ler o log do kernel pode exigir privilégios (em muitos sistemas, §dmesg§ comum é negado).

### Limites por processo: ulimit
§ulimit -a§ mostra limites do shell e dos processos que ele inicia: arquivos abertos (§-n§), processos (§-u§), memória virtual (§-v§), tamanho de pilha (§-s§). Limite de **arquivos abertos** baixo causa o erro "Too many open files" em servidores com muitas conexões (aula 6).

### Limites por grupo: cgroups
Os **control groups** (*cgroups*) permitem limitar e medir CPU, memória e I/O de um **conjunto** de processos. São a base técnica dos contêineres: quando você roda §docker run --memory=512m§, o runtime cria um cgroup com esse teto. Se os processos do grupo tentam passar do teto, o OOM killer age **dentro do grupo**, mesmo que o servidor tenha RAM sobrando. Esse é o motivo de contêineres serem mortos (137) com a máquina "folgada". O systemd também usa cgroups: §MemoryMax=§ em uma unidade de serviço aplica um limite.

### Vazamentos e dimensionamento
Um **vazamento de memória** é um RSS que só cresce ao longo do tempo sem retornar. Em linguagens com coleta de lixo (JavaScript, Java), costuma ser referência esquecida (cache sem limite, listeners nunca removidos). Para investigar: acompanhe o RSS por período, depois use o *profiler* da linguagem (aula de profiling, em outro curso). Para dimensionar, meça o consumo sob carga real e deixe **margem** entre o uso típico e o limite.`,
  concepts: [
    { term: 'Memória virtual', def: 'Abstração que dá a cada processo um espaço de endereços próprio, traduzido para a RAM física pelo kernel.' },
    { term: 'Página', def: 'Unidade de gerenciamento de memória, normalmente 4 KiB.' },
    { term: 'Falha de página', def: 'Acesso a uma página ainda não presente na RAM; o kernel a carrega ou termina o processo se o acesso é inválido.' },
    { term: 'RSS e VSZ', def: 'RSS é a memória residente na RAM; VSZ é o total de endereços virtuais mapeados.' },
    { term: 'Cache de páginas', def: 'RAM usada para guardar dados de arquivos; é descartada quando programas precisam de memória (contada em buff/cache).' },
    { term: 'Swap', def: 'Área em disco para páginas retiradas da RAM; excesso de troca causa thrashing.' },
    { term: 'OOM killer', def: 'Mecanismo do kernel que mata processos com SIGKILL quando a memória se esgota.' },
    { term: 'cgroup', def: 'Mecanismo do kernel para limitar e medir CPU, memória e I/O de um grupo de processos; base dos contêineres.' },
    { term: 'ulimit', def: 'Comando do shell que mostra e define limites de recursos por processo (arquivos abertos, memória, processos).' }
  ],
  examples: R`**Analogia:** a RAM é uma **mesa de trabalho** e o disco é um **arquivo no corredor**. A memória virtual é a promessa de que cada pessoa pode espalhar quantos papéis quiser; o kernel só traz para a mesa os papéis realmente usados. O **cache** é a mesa aproveitando espaço vazio para deixar à mão os documentos mais consultados: se alguém precisar do espaço, eles saem na hora. O **swap** é guardar papéis na gaveta do corredor (lento!). O **OOM killer** é o gerente que, sem lugar nenhum, manda uma pessoa embora para o escritório continuar funcionando.

**Cenário real — "free está em 2%":** o alerta dispara porque free é baixo. Antes de reagir, rode §free -h§ e olhe §available§. Se estiver alto, o servidor está normal; ajuste o alerta para usar §available§ (ou §MemAvailable§).

**Cenário real — contêiner morto com a máquina folgada:** limite de 512 MB no contêiner, aplicação com RSS crescendo até estourar: cgroup mata com 137. A solução é investigar o vazamento ou o consumo de pico e **dimensionar com dados**, não apenas subir o limite.`,
  code: [
    { title: 'Páginas, memória e processo (executado no Linux)', lang: 'bash', code: R`getconf PAGESIZE                         # 4096 (bytes por página)
free -m | head -2                         # total, used, free, shared, buff/cache, available
grep -E '^(MemTotal|MemAvailable|SwapTotal)' /proc/meminfo
node -e 'setTimeout(() => {}, 3000)' & P=$!
sleep 0.8
ps -o rss=,vsz= -p $P                     # RSS (KiB) bem menor que VSZ (KiB)
wait $P`, notes: [{ l: '1', t: 'Tamanho da página em bytes; 4096 em x86-64 e na maioria dos ARM64 (alguns usam 16 KiB ou 64 KiB).' }, { l: '2', t: 'A coluna available é a que importa para decidir se falta memória.' }, { l: '3', t: '/proc/meminfo é a fonte dos números do free.' }, { l: '6', t: 'rss= e vsz= imprimem só os valores, sem cabeçalho; RSS é o que está na RAM.' }] },
    { title: 'Limites: ulimit e leitura de log do kernel', lang: 'bash', code: R`ulimit -n                  # limite de arquivos abertos do shell atual
ulimit -a | head -5
vmstat 1 3                 # procs, memory, swap (si/so), io, cpu
journalctl -k | grep -i 'out of memory'   # evidência de OOM (pode exigir sudo)`, notes: [{ l: '1', t: 'Valor típico: 1024 ou maior; servidores com muitas conexões precisam de mais.' }, { l: '3', t: 'vmstat amostra a cada 1 s; si e so altos indicam troca de páginas (swap) constante.' }, { l: '4', t: 'Procura mortes do OOM killer no log do kernel; em muitos sistemas é preciso privilégio.' }] }
  ],
  bestPractices: ['Monitore §MemAvailable§ e o RSS dos serviços, não o campo "free".', 'Defina limites de memória em contêineres e serviços e dimensione com base em medições.', 'Configure alertas para swap em uso crescente e para reinícios por 137.', 'Dê margem entre o uso de pico e o limite configurado.', 'Registre o consumo de memória ao longo do tempo para detectar vazamentos por tendência.', 'Ajuste §ulimit -n§ (ou §LimitNOFILE§ no systemd) em serviços com muitas conexões.'],
  mistakes: ['Entrar em pânico com "free" baixo, quando o cache está apenas aproveitando a RAM.', 'Confundir VSZ com consumo real.', 'Desligar o swap ou dimensionar limites sem medir nada.', 'Aumentar o limite de um contêiner sem investigar o vazamento.', 'Ignorar o exit code 137 e não olhar o log do kernel.', 'Achar que um processo "limpa a memória sozinho" depois de um vazamento em linguagens com coletor de lixo.'],
  market: `Dimensionar memória, interpretar o painel de monitoramento e explicar por que um contêiner morreu é pergunta frequente em plantões e entrevistas de DevOps e backend. O conhecimento sustenta custos de nuvem (instâncias menores), estabilidade (limites corretos) e diagnóstico de vazamentos.`,
  summary: `Cada processo tem memória virtual dividida em páginas (em geral 4 KiB), traduzida pelo kernel; a RAM só é usada ao tocar a página. RSS é o consumo real, VSZ é só endereçamento. Em §free§, olhe §available§: o §buff/cache§ é liberado sob demanda. Swap alivia, mas gera thrashing. Sem memória, o OOM killer envia SIGKILL (137). §ulimit§ limita por processo e cgroups limitam grupos, base dos contêineres.`,
  refs: [REF2.kernelMm, REF2.free, REF2.cgroups, RA.bashManual],
  cards: [
    { q: 'Qual coluna do free indica quanta memória está realmente disponível?', a: 'available (inclui o cache que pode ser descartado).' },
    { q: 'Qual a diferença entre RSS e VSZ?', a: 'RSS é a memória residente na RAM; VSZ é todo o espaço de endereços virtuais mapeado.' },
    { q: 'O que o OOM killer faz?', a: 'Quando a memória acaba, escolhe um processo e envia SIGKILL; a evidência fica no log do kernel.' },
    { q: 'Por que um contêiner pode ser morto com a máquina com RAM sobrando?', a: 'Porque o cgroup do contêiner tem um limite de memória; passar dele aciona o OOM killer dentro do grupo.' }
  ]
},
{
  id: 'lnx-06', moduleId: 'm2', order: 6, minutes: 70, tags: ['linux', 'io', 'sistemas-de-arquivos', 'descritores'],
  title: 'Entrada e saída, descritores e sistemas de arquivos',
  objectives: ['Explicar descritores de arquivos e a ideia de que quase tudo é arquivo no Unix', 'Distinguir E/S bloqueante, não bloqueante e orientada a eventos (epoll)', 'Explicar buffers, cache de páginas e o papel de fsync na durabilidade', 'Diferenciar tipos de sistemas de arquivos (ext4, xfs, tmpfs) e o que é journaling e montagem', 'Diagnosticar disco cheio, falta de inodes, arquivos apagados ainda abertos e "Too many open files"'],
  intro: `Aplicações vivem de **entrada e saída**: ler arquivos, receber requisições, gravar logs, falar com bancos. O sistema operacional oferece a todas elas uma interface uniforme, o **descritor de arquivo**, e esconde as diferenças entre disco, rede, terminal e pipe. Entender como essa camada funciona explica por que o servidor fica sem espaço mesmo "depois de apagar o arquivo grande", por que o Node.js atende milhares de conexões com uma thread e por que gravar em disco nem sempre significa gravar de verdade.`,
  theory: `### Descritores de arquivos
Para o kernel, um processo que "abre" algo recebe um número inteiro pequeno, o **descritor de arquivo** (*file descriptor*, fd). Os três primeiros já nascem abertos: **0 = stdin**, **1 = stdout**, **2 = stderr**. As chamadas de sistema são as mesmas para qualquer coisa: §open§, §read§, §write§, §close§ (veja §open(2)§). Por isso a filosofia Unix diz que "**tudo é arquivo**": um arquivo regular, um diretório, um terminal (§/dev/tty§), um dispositivo (§/dev/null§, §/dev/sda§), um **pipe** (§pipe(7)§) e um **socket** de rede são manipulados por descritores. O diretório §/proc/PID/fd/§ lista os descritores de cada processo, e §lsof§ mostra quem tem o quê aberto.

Os redirecionamentos da aula 2 são só **troca de descritores**: §cmd > arq§ liga o fd 1 a um arquivo; §2>&1§ faz o fd 2 apontar para onde o fd 1 aponta.

### Bloqueante, não bloqueante e orientada a eventos
- **Bloqueante**: §read§ em um socket sem dados **suspende** a thread até chegarem. Simples, mas uma thread por conexão não escala para dezenas de milhares.
- **Não bloqueante**: a chamada devolve na hora ("sem dados agora"); o programa decide o que fazer.
- **Orientada a eventos**: o programa pede ao kernel (§epoll§ no Linux; §kqueue§ em BSD/macOS) para **avisar quando algum entre milhares de descritores estiver pronto**. Uma única thread atende muitas conexões, tratando apenas as que têm trabalho. É o modelo do **Node.js** (biblioteca libuv), do Nginx e de boa parte dos servidores de alto desempenho.

Operações de **disco comum** costumam ser bloqueantes mesmo em bibliotecas assíncronas: o libuv as envia a um pool de threads. Por isso o código JavaScript não "congela" ao ler arquivos, mas o pool pode saturar.

### Buffers, cache e durabilidade
Quando o programa grava, o kernel normalmente copia os dados para o **cache de páginas** (RAM) e devolve sucesso; a gravação física no disco ocorre **depois**. Isso torna a escrita muito rápida, mas significa que uma queda de energia pode perder dados "gravados". Para garantir durabilidade existem §fsync§ (força a gravação de um arquivo) e §sync§ (todos os arquivos). Bancos de dados chamam §fsync§ no commit; scripts de backup devem usá-lo (ou §sync§) antes de desmontar um disco. As bibliotecas também têm seus **buffers** em nível de linguagem (por exemplo, o stdout de um programa em C só é descarregado ao encher ou ao terminar), o que explica logs "atrasados" ao redirecionar a saída.

### Sistemas de arquivos
Um **sistema de arquivos** organiza dados em um dispositivo: nomes, diretórios, inodes e blocos. Exemplos comuns: **ext4** (padrão em muitas distribuições, estável), **xfs** (bom com arquivos grandes e paralelismo), **btrfs** (cópias e instantâneos), **tmpfs** (em RAM, como §/dev/shm§ e frequentemente §/tmp§; some ao reiniciar) e pseudo-sistemas como §/proc§ e §/sys§. O **journaling** (ext4, xfs) registra as mudanças de metadados em um diário antes de aplicá-las, para recuperar rápido e consistente após queda de energia, sem varrer o disco inteiro.

**Montar** (§mount§) é encaixar um sistema de arquivos em um diretório; §mount§ sem argumentos lista o que está montado, e §findmnt§ mostra em árvore. O arquivo §/etc/fstab§ define o que é montado no boot. Sempre **desmonte** (§umount§) um disco removível antes de retirá-lo.

### Espaço, inodes e arquivos apagados ainda abertos
- §df -h§: uso por sistema de arquivos. §df -i§: uso de **inodes**. Um disco pode ficar "cheio" por falta de inodes (milhões de arquivos minúsculos) mesmo com espaço sobrando: o erro "No space left on device" aparece nos dois casos.
- §du -sh pasta§: quanto uma pasta ocupa. §du -h --max-depth=1 /var | sort -h§ aponta os maiores.
- **Arquivo apagado, mas espaço não liberado:** apagar o **nome** de um arquivo não libera os dados enquanto algum processo o mantém **aberto**. O espaço só volta quando o último descritor fecha. Em nosso teste, o fd do processo mostrava §fd.txt (deleted)§. Solução: reiniciar o processo ou truncar o arquivo (§: > arquivo§) **em vez de** apagá-lo; §lsof +L1§ lista arquivos abertos com zero links.
- **Rotação de logs:** programas como o §logrotate§ renomeiam o log e pedem ao serviço que reabra (por sinal ou por reinício); sem isso, o serviço continua gravando no arquivo antigo.

### Limites de descritores
Cada processo tem um limite de fds (§ulimit -n§). Em servidores, cada conexão é um fd; ao estourar, surge "**Too many open files**". Aumente o limite do serviço (por exemplo, §LimitNOFILE§ no systemd) **e** procure vazamentos de descritores (conexões ou arquivos nunca fechados): §ls /proc/PID/fd | wc -l§ ao longo do tempo mostra a tendência.

### I/O wait
No §top§ ou §vmstat§, o campo **wa** (*iowait*) indica CPU ociosa esperando disco. Valores altos com processos em §D§ sugerem disco saturado ou lento. A ferramenta §iostat§ (pacote sysstat) detalha por dispositivo; quando não há permissão ou o pacote não está instalado, §vmstat§ já dá uma visão geral.`,
  concepts: [
    { term: 'Descritor de arquivo (fd)', def: 'Número inteiro que identifica um recurso aberto (arquivo, pipe, socket, terminal) em um processo.' },
    { term: 'stdin, stdout, stderr', def: 'Descritores 0, 1 e 2 abertos por padrão em todo processo.' },
    { term: 'E/S bloqueante', def: 'Chamada que suspende a thread até a operação concluir.' },
    { term: 'epoll', def: 'Mecanismo do Linux que avisa quais descritores estão prontos, base do modelo orientado a eventos.' },
    { term: 'Cache de páginas', def: 'Cópia em RAM de dados de arquivos; acelera leituras e atrasa gravações físicas.' },
    { term: 'fsync', def: 'Chamada que força a gravação de um arquivo no dispositivo, garantindo durabilidade.' },
    { term: 'Journaling', def: 'Registro prévio de mudanças em um diário para recuperar a consistência após falhas.' },
    { term: 'Ponto de montagem', def: 'Diretório onde um sistema de arquivos é encaixado na árvore.' },
    { term: 'Falta de inodes', def: 'Condição em que acabam os inodes e não se criam novos arquivos, mesmo com espaço livre.' },
    { term: 'Arquivo apagado mas aberto', def: 'Nome removido, dados mantidos até o último descritor ser fechado.' }
  ],
  examples: R`**Analogia:** o descritor é a **ficha numerada do guarda-volumes**: você não carrega o casaco (o recurso), só o número; o balcão (kernel) cuida do resto. E o guarda-volumes atende de forma igual casacos, malas e guarda-chuvas, assim como o kernel atende arquivos, sockets e terminais com as mesmas chamadas. Com **E/S bloqueante**, você fica parado no balcão até o atendente voltar; com **epoll**, você deixa seu número e o atendente avisa quando algum dos seus pedidos estiver pronto.

**Cenário real — disco cheio depois de apagar o log:** §df -h§ mostra 100%. Você apagou um log de 20 GB, mas o espaço não voltou. Rode §lsof +L1§ (ou §ls -l /proc/*/fd 2>/dev/null | grep deleted§): o serviço ainda mantém o arquivo aberto. Reinicie o serviço ou, da próxima vez, **trunque** (§: > app.log§) em vez de remover.

**Cenário real — "No space left on device" com espaço sobrando:** §df -h§ mostra 40% usado, mas §df -i§ mostra 100% de inodes. Provavelmente há milhões de arquivos pequenos (sessões, cache). Localize o diretório culpado e limpe.`,
  code: [
    { title: 'Descritores, redirecionamento e arquivo apagado ainda aberto (executado em bash 5)', lang: 'bash', code: R`exec 3> dados.txt            # abre o fd 3 para escrita
echo "olá" >&3              # escreve usando o fd 3
ls -l /proc/$$/fd/3         # aponta para .../dados.txt
exec 3>&-                   # fecha o fd 3

sleep 30 < dados.txt & P=$!   # um processo mantém o arquivo aberto no fd 0
rm dados.txt                  # o nome some...
ls -l /proc/$P/fd/0           # ... mas o fd mostra: dados.txt (deleted)
kill $P`, notes: [{ l: '1', t: 'exec sem comando altera os descritores do próprio shell; 3> abre o fd 3 para gravar.' }, { l: '3', t: '/proc/$$/fd lista os descritores do shell atual ($$ = seu PID).' }, { l: '6', t: 'O sleep herda o arquivo como stdin e o mantém aberto.' }, { l: '7', t: 'rm remove o nome, não os dados.' }, { l: '8', t: 'O link do descritor termina com "(deleted)", prova de que o espaço ainda está ocupado.' }] },
    { title: 'Diagnóstico de espaço e inodes (executado no Linux)', lang: 'bash', code: R`df -h /          # espaço usado e livre
df -i /          # inodes usados e livres
du -h --max-depth=1 /var 2>/dev/null | sort -h | tail -5   # os cinco maiores
lsof +L1 2>/dev/null | head -5   # arquivos apagados mas ainda abertos
ls /proc/$$/fd | wc -l           # quantos descritores o shell tem abertos`, notes: [{ l: '1', t: 'Coluna Use% mostra o percentual por sistema de arquivos.' }, { l: '2', t: 'Se IUse% chegar a 100%, não se criam novos arquivos.' }, { l: '3', t: 'sort -h ordena tamanhos legíveis (K, M, G).' }, { l: '4', t: '+L1 seleciona arquivos com contagem de links menor que 1, isto é, apagados.' }, { l: '5', t: 'Contar entradas de /proc/PID/fd acompanha vazamentos de descritores.' }] }
  ],
  bestPractices: ['Libere espaço de log **truncando** (§: > arquivo§) ou usando §logrotate§, não apagando arquivos abertos.', 'Monitore espaço (§df -h§) e inodes (§df -i§) com alertas em 80% e 90%.', 'Chame §fsync§/§sync§ quando a durabilidade importa (bancos, backups, antes de desmontar).', 'Feche descritores (arquivos, sockets) sempre, de preferência com construções que garantem o fechamento (try/finally, §with§, §defer§).', 'Ajuste §ulimit -n§ do serviço de acordo com o número esperado de conexões.', 'Separe logs e dados em partições ou volumes distintos para que um não derrube o outro.'],
  mistakes: ['Apagar um arquivo grande aberto e esperar que o espaço volte imediatamente.', 'Olhar só §df -h§ e esquecer §df -i§.', 'Achar que gravar com sucesso significa estar no disco (cache de páginas).', 'Redirecionar com §2>&1 > arq§ (ordem errada) e perder os erros do arquivo.', 'Vazar descritores em laços de leitura ou requisições e só descobrir em produção ("Too many open files").', 'Arrancar um pendrive sem §umount§.'],
  market: `Disco cheio, falta de inodes, logs sem rotação, "Too many open files" e latência de I/O estão entre os incidentes mais comuns em produção. Entender descritores e o modelo de eventos também explica por que servidores como Nginx e Node.js escalam com poucas threads e como projetar serviços resilientes.`,
  summary: `Processos acessam tudo por descritores (0, 1 e 2 são stdin, stdout e stderr); arquivos, pipes e sockets usam a mesma interface. E/S pode ser bloqueante, não bloqueante ou orientada a eventos (§epoll§, base do Node.js e do Nginx). Gravações passam pelo cache e só são duráveis após §fsync§. Sistemas de arquivos (ext4, xfs, tmpfs) são montados na árvore; journaling acelera a recuperação. Diagnostique com §df -h§, §df -i§, §du§, §lsof +L1§ e §/proc/PID/fd§.`,
  refs: [REF2.open, REF2.pipe, REF2.epoll, REF2.mount, REF2.ext4],
  cards: [
    { q: 'O que são os descritores 0, 1 e 2?', a: 'stdin, stdout e stderr, abertos por padrão em todo processo.' },
    { q: 'Por que o espaço não volta depois de apagar um arquivo grande?', a: 'Porque algum processo ainda o mantém aberto; os dados só são liberados quando o último descritor fecha. Reinicie o serviço ou trunque o arquivo.' },
    { q: 'O que o epoll resolve?', a: 'Permite a uma thread esperar eventos de milhares de descritores e tratar só os que estão prontos (modelo do Node.js e do Nginx).' },
    { q: 'Um disco com espaço livre pode retornar "No space left on device"?', a: 'Sim, se os inodes se esgotaram; confira com df -i.' }
  ]
}
];
