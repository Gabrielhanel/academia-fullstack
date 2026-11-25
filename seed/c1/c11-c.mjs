// C1.1 — Linux, terminal e sistemas operacionais. Aulas 7 a 9 (Shell Script, automação e troubleshooting).
import { REF as RA } from './c11-a.mjs';
import { REF2 as RB } from './c11-b.mjs';
const R = String.raw;

export const REF3 = {
  posixShell: { title: 'The Open Group — POSIX.1-2024: Shell Command Language', url: 'https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html', kind: 'spec' },
  systemdTimer: { title: 'systemd — systemd.timer(5)', url: 'https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html', kind: 'doc' },
  systemdService: { title: 'systemd — systemd.service(5)', url: 'https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html', kind: 'doc' },
  journalctl: { title: 'systemd — journalctl(1)', url: 'https://www.freedesktop.org/software/systemd/man/latest/journalctl.html', kind: 'doc' },
  ss: { title: 'Linux man-pages — ss(8) (iproute2)', url: 'https://man7.org/linux/man-pages/man8/ss.8.html', kind: 'doc' },
  strace: { title: 'Linux man-pages — strace(1)', url: 'https://man7.org/linux/man-pages/man1/strace.1.html', kind: 'doc' },
  proc: { title: 'Linux man-pages — proc(5)', url: 'https://man7.org/linux/man-pages/man5/proc.5.html', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'lnx-07', moduleId: 'm3', order: 7, minutes: 75, tags: ['shell', 'bash', 'scripts'],
  title: 'Shell Script: variáveis, condições, laços e funções',
  objectives: ['Escrever e executar um script Bash com shebang, permissão de execução e argumentos', 'Usar variáveis, aspas e expansões corretamente', 'Controlar o fluxo com if, case, for, while e funções, usando códigos de saída', 'Aplicar set -euo pipefail e entender seus limites', 'Evitar as armadilhas mais comuns do shell (espaços, subshells, [ ] versus [[ ]])'],
  intro: `Um **shell script** é um arquivo de texto com comandos que o shell executa em sequência. É a ferramenta certa para **automatizar tarefas do sistema**: preparar ambientes, empacotar arquivos, encadear programas, escrever *entrypoints* de contêineres e etapas de CI. O Bash é enxuto, está em quase toda máquina Linux e "cola" programas entre si, mas tem armadilhas conhecidas. Esta aula ensina o essencial para escrever scripts curtos, corretos e seguros.`,
  theory: `### O primeiro script
Um script começa com o **shebang**, que diz ao kernel qual interpretador usar, e precisa de permissão de execução:

§§§bash
#!/usr/bin/env bash
echo "olá, $1"
§§§

Salve como §ola.sh§, rode §chmod +x ola.sh§ e execute §./ola.sh Ana§. Também funciona §bash ola.sh Ana§ (sem precisar de §x§). Scripts em §sh§ puro seguem o padrão **POSIX** e rodam em mais ambientes (Alpine usa o §ash§ do BusyBox); recursos como arrays e §[[ ]]§ são específicos do **Bash**. Se usar recursos do Bash, declare §bash§ no shebang.

### Variáveis e aspas
- Atribuição **sem espaços**: §nome="Ana"§. Uso: §$nome§ ou §DOLAR{nome}§. Variáveis de ambiente (§PATH§, §HOME§) são herdadas por processos filhos quando exportadas (§export§).
- **Aspas duplas** preservam espaços e permitem expansão: §"$arquivo"§. **Aspas simples** são literais: §'$arquivo'§ imprime o texto exato. **Sem aspas**, o resultado da expansão é **quebrado em palavras** e sujeito a curingas, a causa número um de bugs: §ls $f§ com §f="meu arquivo.txt"§ vira dois argumentos. **Regra de ouro: sempre use aspas em torno de expansões** (§"$f"§, §"$@"§).
- Parâmetros do script: §$0§ (nome), §$1§…§$9§, §$#§ (quantidade), §"$@"§ (todos, cada um preservado), §$?§ (código de saída do último comando), §$$§ (PID).
- Expansões úteis: §DOLAR{x:-padrão}§ (valor padrão se vazio), §DOLAR{x%.gz}§ (remove sufixo), §DOLAR{x##*.}§ (extensão), §DOLAR{#x}§ (tamanho), §$(comando)§ (substituição de comando), §$((a + b))§ (aritmética inteira).
- **Arrays** (Bash): §itens=(a "b c" d)§; §"DOLAR{itens[@]}"§ expande cada elemento preservado; §DOLAR{#itens[@]}§ conta.

### Condições
Todo §if§ testa um **código de saída** (0 = verdadeiro):

§§§bash
if grep -q erro log.txt; then
  echo "achou"
elif [[ -f log.txt ]]; then
  echo "existe, sem erros"
else
  echo "não existe"
fi
§§§

Em Bash, prefira §[[ ... ]]§ a §[ ... ]§: ele não quebra palavras, aceita §==§ com padrões e §=~§ para regex, e usa §&&§ e §||§ internamente. Testes de arquivo: §-f§ (arquivo comum), §-d§ (diretório), §-e§ (existe), §-r§/§-w§/§-x§ (permissões), §-s§ (não vazio). Strings: §-z§ (vazia), §-n§ (não vazia). Números: §-eq§, §-ne§, §-lt§, §-le§, §-gt§, §-ge§, ou §(( a > b ))§.
§case "$1" in start) ... ;; stop|halt) ... ;; *) ... ;; esac§ trata várias opções por padrão.

### Laços e leitura de linhas
§§§bash
for arq in *.log; do wc -l "$arq"; done
for ((i = 1; i <= 3; i++)); do echo "$i"; done
while IFS= read -r linha; do echo "[$linha]"; done < arquivo.txt
§§§
- Percorra **arquivos com curinga** (§*.log§), não com §$(ls)§, que quebra com espaços.
- Em §read -r§, §-r§ impede que barras invertidas sejam interpretadas; §IFS=§ preserva espaços nas pontas.
- Cuidado: em §cmd | while read ...§ o laço roda em um **subshell** e variáveis alteradas dentro dele **não** sobrevivem. Use §while ...; done < <(cmd)§ (substituição de processo) para manter o estado. Confirmamos: o contador ficava em 0 com pipe e em 2 com a substituição.

### Funções
§§§bash
dobro() { local n=$1; echo $((n * 2)); }
resultado=$(dobro 21)
§§§
Funções recebem §$1§, §$2§, ...; **retornam códigos** com §return N§ (0–255); valores de texto saem por §echo§ e são capturados com §$( )§. Use §local§ para não vazar variáveis.

### Modo estrito e códigos de saída
§§§bash
set -euo pipefail
§§§
- §-e§: aborta ao primeiro comando que falha (com **exceções**: dentro de §if§, §&&§, §||§ e em subshells de pipeline pode não valer; não o trate como garantia absoluta).
- §-u§: erro ao usar variável **não definida** (pega erros de digitação e evita §rm -rf "$DIR"/*§ com §DIR§ vazio).
- §-o pipefail§: o código de saída do pipeline é o do **primeiro** comando que falhou, não só do último. Em nossos testes, §false | true§ saía com 0 sem §pipefail§ e com 1 com ele.

Termine scripts com §exit N§ coerente (0 sucesso; 1 erro geral; 2 uso incorreto são convenções comuns), e escreva mensagens de erro em **stderr**: §echo "erro" >&2§.

### Quando NÃO usar shell script
Se o script passa de algumas dezenas de linhas, precisa de estruturas de dados complexas, tratamento sofisticado de erros ou testes, considere Python ou Node. Shell é excelente para **orquestrar programas**, não para lógica de negócio.`,
  concepts: [
    { term: 'Shebang', def: 'Primeira linha (#!/usr/bin/env bash) que indica o interpretador do script.' },
    { term: 'Expansão de variável', def: 'Substituição de $nome ou ${nome} pelo valor; sem aspas, o resultado é dividido em palavras.' },
    { term: 'Aspas duplas e simples', def: 'Duplas permitem expansão e preservam espaços; simples tratam tudo como literal.' },
    { term: '"$@"', def: 'Expansão que mantém cada argumento do script como uma palavra separada.' },
    { term: '[[ ]]', def: 'Comando de teste do Bash, mais seguro que [ ] por não dividir palavras.' },
    { term: 'Substituição de comando', def: '$(cmd) captura a saída de um comando como texto.' },
    { term: 'Subshell', def: 'Processo filho do shell; alterações de variáveis dentro dele não voltam ao pai (ex.: laço depois de pipe).' },
    { term: 'set -euo pipefail', def: 'Modo estrito: aborta em falhas, proíbe variáveis indefinidas e propaga falhas de pipelines.' },
    { term: 'POSIX sh', def: 'Padrão de shell portável; mais limitado que o Bash (sem arrays nem [[ ]]).' }
  ],
  examples: R`**Analogia:** um script é uma **receita**: cada linha é um passo, o shebang diz em que "cozinha" executar e as variáveis são os ingredientes. As aspas são os **potes tampados**: sem tampa (sem aspas), o conteúdo "derrama" e vira vários ingredientes ("meu arquivo.txt" vira "meu" e "arquivo.txt"). O modo estrito é o **cozinheiro que para a receita ao primeiro erro** em vez de continuar servindo um prato estragado.

**Exemplo realista — contar erros de um log, com validação:** o script abaixo recebe um arquivo, valida o uso, conta as linhas que começam com "erro" e devolve códigos de saída significativos. Ele foi executado: com §l.txt§ de 3 linhas (duas "erro") imprimiu §erros: 2§ e saiu com 0; sem argumento, saiu com 2; com arquivo inexistente, com 1.`,
  code: [
    { title: 'Script com validação, laço e modo estrito (executado em bash 5)', lang: 'bash', code: R`#!/usr/bin/env bash
set -euo pipefail

uso() { echo "uso: $0 <arquivo>" >&2; exit 2; }

[[ $# -eq 1 ]] || uso
arq=$1
[[ -f $arq ]] || { echo "não existe: $arq" >&2; exit 1; }

total=0
while IFS= read -r linha; do
  [[ $linha == erro* ]] && total=$((total + 1))
done < "$arq"
echo "erros: $total"`, notes: [{ l: '2', t: 'Modo estrito: falha em erros, variáveis indefinidas e pipelines.' }, { l: '4', t: 'Função de uso que escreve em stderr e sai com 2 (uso incorreto).' }, { l: '6', t: '$# é a quantidade de argumentos; || só chama uso se a condição falhar.' }, { l: '8', t: 'Mensagem em stderr e saída 1 quando o arquivo não existe.' }, { l: '11-13', t: 'Lê linha a linha sem quebrar espaços (IFS= e -r) e conta as que começam com "erro".' }, { l: '12', t: 'Com set -e, uma lista A && B cujo A falha não aborta o script; por isso a linha não interrompe o laço quando a linha não começa com "erro" (exceção do -e descrita no texto).' }] },
    { title: 'Armadilhas clássicas (executado em bash 5)', lang: 'bash', code: R`f="meu arquivo.txt"; touch "$f"
ls $f          # ERRO: tenta abrir "meu" e "arquivo.txt"
ls "$f"        # ok

false | true;  echo $?     # 0 (pipeline sem pipefail)
set -o pipefail
false | true;  echo $?     # 1

n=0; printf '1\n2\n' | while read -r l; do n=$((n+1)); done; echo "n=$n"          # n=0 (subshell)
n=0; while read -r l; do n=$((n+1)); done < <(printf '1\n2\n'); echo "n=$n"       # n=2`, notes: [{ l: '2', t: 'Sem aspas o valor é dividido em duas palavras.' }, { l: '5', t: 'O código do pipeline é o do último comando (true).' }, { l: '7', t: 'Com pipefail vem o 1 de false.' }, { l: '9', t: 'O laço depois do pipe roda em subshell: a alteração de n se perde.' }, { l: '10', t: 'Com substituição de processo o laço roda no shell atual.' }] }
  ],
  bestPractices: ['Use sempre §#!/usr/bin/env bash§ e §set -euo pipefail§ em scripts novos, entendendo seus limites.', 'Coloque aspas em todas as expansões (§"$var"§, §"$@"§) a menos que queira divisão de palavras.', 'Valide argumentos e escreva erros em stderr com códigos de saída coerentes.', 'Prefira §[[ ]]§ a §[ ]§ em Bash e use §local§ nas funções.', 'Use curingas ou §find -print0§ para listar arquivos, nunca §for f in $(ls)§.', 'Rode §bash -n script.sh§ para checar a sintaxe e, se possível, um linter como o ShellCheck em CI.'],
  mistakes: ['Esquecer as aspas e quebrar nomes com espaços.', 'Escrever §var = valor§ com espaços na atribuição (vira um comando chamado §var§).', 'Usar §[ $x = a ]§ com §$x§ vazio ou com espaços.', 'Contar com §set -e§ como garantia total (não vale em §if§, §&&§, §||§, funções chamadas em condições).', 'Alterar variáveis dentro de §cmd | while read§ e esperar o valor depois.', 'Escrever scripts enormes em shell quando uma linguagem de uso geral seria mais segura.'],
  market: `Scripts de shell estão em *entrypoints* de contêineres, jobs de CI, deploys e rotinas de operação. Quem escreve bash com aspas corretas, validação e códigos de saída produz automações previsíveis; scripts frágeis são fonte comum de incidentes (por exemplo, o clássico §rm -rf "$DIR/"§ com variável vazia).`,
  summary: `Script Bash: shebang, permissão §x§, argumentos em §$1§, §"$@"§, §$#§. Sempre use aspas nas expansões. Teste com §[[ ]]§; trate fluxo com §if§, §case§, §for§, §while§ e funções. Códigos de saída: 0 sucesso. Use §set -euo pipefail§ ciente das exceções, mensagens em stderr e cuidado com subshells (pipe + §while read§). Para lógica complexa, troque de linguagem.`,
  refs: [RA.bashManual, REF3.posixShell],
  cards: [
    { q: 'Por que usar aspas em "$arquivo"?', a: 'Sem aspas o valor é dividido em palavras e sujeito a curingas; nomes com espaços quebram.' },
    { q: 'O que set -euo pipefail faz?', a: '-e aborta em falhas; -u falha com variável indefinida; pipefail faz o pipeline falhar se qualquer etapa falhar.' },
    { q: 'Por que o contador não sobe em cmd | while read ...?', a: 'O laço depois do pipe roda em um subshell; a alteração não volta ao shell pai. Use done < <(cmd).' },
    { q: 'Qual a diferença entre [ ] e [[ ]]?', a: '[[ ]] é do Bash, não divide palavras e aceita == com padrões e =~ para regex; [ ] é o teste POSIX, mais frágil.' }
  ]
},
{
  id: 'lnx-08', moduleId: 'm3', order: 8, minutes: 75, tags: ['automacao', 'cron', 'systemd', 'scripts'],
  title: 'Automação de tarefas: scripts robustos, cron e systemd timers',
  objectives: ['Escrever scripts de automação com opções (getopts), validação, limpeza com trap e arquivos temporários seguros', 'Projetar tarefas idempotentes e com proteção contra execução simultânea (flock)', 'Agendar tarefas com cron e interpretar a sintaxe de cinco campos', 'Explicar as vantagens dos timers do systemd e criar um par service e timer', 'Registrar logs e códigos de saída de modo que falhas apareçam'],
  intro: `Tarefa manual repetida é erro esperando para acontecer. Backups, rotação de logs, limpeza de arquivos temporários, relatórios e verificações de saúde devem rodar **sozinhos, de forma segura e observável**. Automatizar bem é mais do que "colocar no cron": é escrever scripts que podem rodar duas vezes sem estragar nada, que limpam a sujeira em caso de falha, que não colidem entre si e que avisam quando algo dá errado.`,
  theory: `### Princípios de uma automação confiável
1. **Idempotência:** rodar o script uma, duas ou dez vezes deixa o sistema no mesmo estado final. §mkdir -p§ é idempotente; §mkdir§ simples não. Prefira "garantir que X exista" a "criar X".
2. **Falhar de forma visível:** erros em stderr e **código de saída ≠ 0**; nada de engolir erros com §|| true§ sem motivo.
3. **Limpeza:** recursos temporários removidos mesmo em falha (§trap§).
4. **Exclusão mútua:** duas execuções simultâneas não podem corromper os dados (§flock§).
5. **Observabilidade:** logs com data e resultado, e um modo de **simulação** (dry-run) para testar sem efeitos.
6. **Atomicidade:** gravar em arquivo temporário e **renomear** no final (§mv§ dentro do mesmo sistema de arquivos é atômico), de modo que quem lê nunca vê um arquivo pela metade.

### Opções de linha de comando com getopts
§§§bash
manter=3; simular=0
while getopts "nk:" opt; do
  case $opt in
    n) simular=1 ;;
    k) manter=$OPTARG ;;
    *) uso ;;
  esac
done
shift $((OPTIND - 1))
§§§
Em §"nk:"§, §n§ é uma opção sem valor e §k:§ exige um valor (guardado em §OPTARG§). Depois do laço, §shift§ descarta as opções e deixa os argumentos posicionais. **Valide** o que receber: por exemplo, §[[ $manter =~ ^[0-9]+$ ]]§ garante um inteiro.

### Temporários, trap e atomicidade
- §mktemp§ cria arquivos e diretórios temporários com nome imprevisível e permissão restrita, evitando colisões e ataques de nome previsível em §/tmp§. Crie-os **no mesmo diretório do destino** se for renomear depois.
- §trap 'comando' EXIT§ executa a limpeza ao sair do script, normalmente ou por erro; §trap ... INT TERM§ trata Ctrl+C e término. Em nosso teste, um §trap§ de INT imprimiu a mensagem e o script saiu com **130** (128 + 2).

### Execução simultânea: flock
§flock -n 9§ tenta obter um **trava** (*lock*) sobre o descritor 9, sem esperar (§-n§); se outro processo a detém, falha. Uso típico em um script agendado:

§§§bash
exec 9> /var/lock/meu-job.lock
flock -n 9 || { echo "já em execução" >&2; exit 1; }
§§§
A trava é liberada automaticamente quando o processo termina, mesmo se ele morrer. Em nosso teste, a segunda tentativa recebeu "ocupado" enquanto a primeira segurava o lock. Evite a alternativa "criar um arquivo de PID": ele fica órfão em quedas de energia.

### Agendando com cron
O **cron** executa comandos em horários definidos. Edite sua tabela com §crontab -e§ (lista com §crontab -l§). Cada linha tem **cinco campos de tempo** e o comando:

§§§
┌ minuto (0-59)
│ ┌ hora (0-23)
│ │ ┌ dia do mês (1-31)
│ │ │ ┌ mês (1-12)
│ │ │ │ ┌ dia da semana (0-7; 0 e 7 = domingo)
* * * * *  comando
§§§

| Linha | Quando executa |
|---|---|
| §*/15 * * * *§ | a cada 15 minutos |
| §30 3 * * *§ | todo dia às 03:30 |
| §0 9 * * 1-5§ | às 9h, de segunda a sexta |
| §0 0 1 * *§ | à meia-noite do dia 1 de cada mês |

**Armadilhas do cron:** o ambiente é **mínimo** (PATH curto, sem variáveis do seu shell): use **caminhos absolutos** e defina §PATH§ no topo da crontab. A saída padrão e de erro é enviada por e-mail local ou descartada, então **redirecione para um log**: §30 3 * * * /opt/bin/backup.sh >> /var/log/backup.log 2>&1§. O fuso é o do servidor (confira §timedatectl§). Cron **não reexecuta** tarefas perdidas se a máquina estava desligada.

### systemd timers: a alternativa moderna
Em sistemas com systemd, um **timer** aciona um **service**. Vantagens: logs centralizados (§journalctl -u meu-job§), dependências, limites de recursos, tempo aleatório para espalhar a carga e execução de tarefas perdidas (§Persistent=true§).

§§§ini
# /etc/systemd/system/backup.service
[Unit]
Description=Backup diário

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh /srv/app /var/backups/app

# /etc/systemd/system/backup.timer
[Unit]
Description=Agenda o backup diário

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true

[Install]
WantedBy=timers.target
§§§
Ative com §systemctl enable --now backup.timer§; veja os próximos disparos com §systemctl list-timers§ e valide expressões com §systemd-analyze calendar '*-*-* 03:30:00'§ (que mostrou "Normalized form" e o próximo disparo no nosso teste). Os arquivos acima são um **modelo**; neste curso eles não foram instalados nem ativados.

### Logs e alertas
Escreva uma linha por evento, com data: §echo "$(date -Is) backup ok" >> "$LOG"§. Para falhas, **alerte**: a automação deve notificar (e-mail, webhook, métrica) quando o código de saída for diferente de 0. Tarefas que falham em silêncio são piores que tarefas manuais.`,
  concepts: [
    { term: 'Idempotência', def: 'Propriedade de uma operação que, repetida, leva ao mesmo estado final.' },
    { term: 'getopts', def: 'Comando interno do Bash para processar opções de linha de comando (-n, -k valor).' },
    { term: 'trap', def: 'Define comandos executados ao receber sinais ou ao sair do script (EXIT).' },
    { term: 'mktemp', def: 'Cria arquivos ou diretórios temporários com nomes únicos e imprevisíveis.' },
    { term: 'flock', def: 'Obtém uma trava de arquivo para impedir execuções simultâneas.' },
    { term: 'cron', def: 'Agendador clássico; cada linha da crontab tem cinco campos de tempo e um comando.' },
    { term: 'systemd timer', def: 'Unidade que aciona um service por calendário ou intervalo, com logs no journal e tarefas perdidas (Persistent=true).' },
    { term: 'Dry-run', def: 'Modo de simulação que mostra o que seria feito sem alterar nada.' },
    { term: 'Atomicidade (mv)', def: 'Gravar em temporário e renomear: o leitor vê o arquivo antigo ou o novo, nunca um parcial.' }
  ],
  examples: R`**Analogia:** uma tarefa agendada é um **funcionário noturno** que trabalha sozinho. Ele precisa de instruções com caminhos completos (não conhece a casa), de uma trava na porta para que dois funcionários não mexam no mesmo cofre (flock), de um relatório deixado na mesa (log) e de campainha para chamar alguém se algo der errado (alerta).

**Exemplo completo: backup com rotação** (script a seguir): compacta a pasta de origem em um arquivo temporário **dentro do destino**, renomeia ao final (atômico) e mantém só os N mais recentes. O trap garante que o temporário some se algo falhar. **Como foi testado:** sintaxe com §bash -n§; cinco execuções com §-n -k 3§ criaram cinco arquivos e o simulador listou o excedente ("removeria: ..."); sem argumentos saiu com 2; §-k 0§ saiu com 2; origem inexistente saiu com 1; nenhum temporário ficou no destino; o conteúdo do tar tinha os arquivos esperados. **O ramo que remove de verdade (§rm -- "$arq"§) não foi executado no teste** (somente analisado), por segurança; use sempre §-n§ primeiro em um ambiente seu.`,
  code: [
    { title: 'backup.sh: opções, validação, trap, atomicidade e rotação', lang: 'bash', code: R`#!/usr/bin/env bash
# backup.sh [-n] [-k N] ORIGEM DESTINO
set -euo pipefail
uso() { echo "uso: $0 [-n] [-k N] ORIGEM DESTINO" >&2; exit 2; }

manter=3; simular=0
while getopts "nk:" opt; do
  case $opt in
    n) simular=1 ;;
    k) manter=$OPTARG ;;
    *) uso ;;
  esac
done
shift $((OPTIND - 1))
[[ $# -eq 2 ]] || uso
origem=$1; destino=$2
[[ -d $origem ]] || { echo "origem inexistente: $origem" >&2; exit 1; }
[[ $manter =~ ^[0-9]+$ && $manter -ge 1 ]] || { echo "-k deve ser um inteiro >= 1" >&2; exit 2; }

mkdir -p "$destino"
tmp=$(mktemp "$destino/.backup.XXXXXX")
trap 'rm -f "$tmp"' EXIT

stamp=$(date +%Y%m%d-%H%M%S-%N)
tar -czf "$tmp" -C "$origem" .
mv "$tmp" "$destino/backup-$stamp.tar.gz"
echo "criado: backup-$stamp.tar.gz"

mapfile -t antigos < <(ls -1t "$destino"/backup-*.tar.gz | tail -n +$((manter + 1)))
for arq in "DOLAR{antigos[@]}"; do
  if (( simular )); then
    echo "removeria: $(basename "$arq")"
  else
    rm -- "$arq"
    echo "removido: $(basename "$arq")"
  fi
done`, notes: [{ l: '6-13', t: 'getopts: -n sem valor, -k exige valor guardado em OPTARG.' }, { l: '14', t: 'shift remove as opções processadas; sobram os dois argumentos posicionais.' }, { l: '17', t: 'Validação com regex do Bash: só aceita inteiro maior ou igual a 1.' }, { l: '20', t: 'mktemp cria o temporário dentro do destino, para o mv final ser atômico.' }, { l: '21', t: 'trap EXIT remove o temporário em qualquer saída; depois do mv ele já não existe e rm -f não reclama.' }, { l: '24-26', t: 'Gera o arquivo definitivo só no final, com carimbo de tempo único.' }, { l: '29', t: 'ls -1t ordena do mais novo para o mais antigo; tail -n +K+1 devolve o excedente. Funciona porque os nomes não têm quebras de linha; em geral, prefira find -print0 para nomes arbitrários.' }, { l: '31-36', t: 'Modo simulação lista o que seria removido; sem -n, remove de fato (ramo não executado nos testes).' }] },
    { title: 'Trava contra execução simultânea e agendamento (flock executado; crontab é modelo)', lang: 'bash', code: R`# dentro do script:
exec 9> /var/lock/backup.lock
flock -n 9 || { echo "já em execução" >&2; exit 1; }

# crontab -e   (modelo, não instalado)
PATH=/usr/local/bin:/usr/bin:/bin
30 3 * * * /usr/local/bin/backup.sh -k 7 /srv/app /var/backups/app >> /var/log/backup.log 2>&1`, notes: [{ l: '2', t: 'Abre o fd 9 no arquivo de trava; a trava vale enquanto o processo existir.' }, { l: '3', t: '-n não espera: se estiver ocupada, falha na hora.' }, { l: '6', t: 'PATH explícito, porque o ambiente do cron é mínimo.' }, { l: '7', t: 'Todo dia às 03:30; saída e erros vão para um log.' }] }
  ],
  bestPractices: ['Torne tarefas idempotentes e ofereça modo §--dry-run§/§-n§.', 'Grave em temporário no mesmo diretório e renomeie ao final.', 'Use §trap ... EXIT§ para limpar e §flock -n§ para evitar execuções simultâneas.', 'Use caminhos absolutos e defina §PATH§ em tarefas do cron; redirecione stdout e stderr para um log.', 'Prefira timers do systemd quando disponíveis (logs no journal, §Persistent=true§).', 'Alerte em caso de falha (código ≠ 0) e teste a **restauração** dos backups, não só a criação.'],
  mistakes: ['Usar caminhos relativos e comandos fora do PATH no cron e ver a tarefa "funcionar na mão e falhar agendada".', 'Não redirecionar a saída e perder as mensagens de erro.', 'Usar arquivo de PID como trava e deixá-lo órfão depois de uma queda.', 'Gravar direto no arquivo final e deixar leitores verem um arquivo incompleto.', 'Agendar tarefas pesadas todas no mesmo minuto (:00).', 'Validar a criação do backup, mas nunca testar a restauração.'],
  market: `Backups, rotação de dados, manutenção de bancos e verificações periódicas são responsabilidades comuns de times de plataforma. Automação idempotente, observável e com travas é um critério de maturidade e de confiabilidade em revisões de arquitetura e de incidentes (por exemplo, o backup que "rodava" mas falhava em silêncio há meses).`,
  summary: `Automação confiável é idempotente, falha de forma visível, limpa temporários (§trap§), evita execução simultânea (§flock§) e grava de forma atômica (temporário + §mv§). Use §getopts§ para opções e valide as entradas. No cron, cinco campos de tempo, ambiente mínimo, caminhos absolutos e logs redirecionados. Com systemd, um §.service§ e um §.timer§ trazem logs no journal e §Persistent=true§. Alerte falhas e teste restaurações.`,
  refs: [REF3.systemdTimer, REF3.systemdService, RA.bashManual, RA.coreutils],
  cards: [
    { q: 'O que significa uma tarefa ser idempotente?', a: 'Executá-la várias vezes leva ao mesmo estado final, sem efeitos acumulados indesejados.' },
    { q: 'O que significa a linha */15 * * * * no cron?', a: 'Executar a cada 15 minutos.' },
    { q: 'Por que criar o temporário no mesmo diretório do destino?', a: 'Para que o mv final seja uma renomeação atômica no mesmo sistema de arquivos.' },
    { q: 'Qual a vantagem do Persistent=true em um timer?', a: 'Se o disparo foi perdido (máquina desligada), a tarefa roda assim que o sistema volta.' }
  ]
},
{
  id: 'lnx-09', moduleId: 'm3', order: 9, minutes: 80, tags: ['troubleshooting', 'servidores', 'diagnostico', 'logs'],
  title: 'Troubleshooting em servidores Linux',
  objectives: ['Aplicar um método sistemático de diagnóstico: observar, formular hipótese, testar, mudar uma coisa por vez', 'Fazer uma triagem rápida de CPU, memória, disco, rede e processos com uptime, top, free, df, ss e journalctl', 'Diagnosticar quatro cenários clássicos: disco cheio, porta ocupada, serviço morto por OOM e "Too many open files"', 'Ler logs com journalctl e acompanhar processos com strace e lsof', 'Registrar o incidente e registrar a ação corretiva'],
  intro: `Quando um serviço cai às 3 da manhã, ninguém precisa de um vasto repertório de comandos; precisa de um **método** e de poucos comandos bem escolhidos. Troubleshooting é a arte de **reduzir o espaço de busca** com observações rápidas, sem mexer em nada até entender. Esta aula fecha o curso juntando tudo o que você viu: arquivos, processos, memória, I/O, permissões e scripts.`,
  theory: `### O método
1. **Defina o sintoma com precisão:** "o site está fora" ou "o login demora 8 s desde as 14h"? Qual a **hora de início**, o que mudou (deploy, configuração, tráfego) e **quem é afetado**?
2. **Observe sem alterar:** colete evidências (logs, métricas, estado). Não reinicie ainda: reiniciar apaga evidências.
3. **Formule hipóteses** e ordene-as por probabilidade e custo de teste.
4. **Teste uma hipótese por vez** e registre o resultado. Mudar vários fatores ao mesmo tempo impede saber o que funcionou.
5. **Corrija, verifique** com a mesma medida que mostrou o problema, e **documente**: causa, ação, prevenção.
6. **Reverta** o que não ajudou: alterações "só para testar" viram dívida.

Mantenha um **registro cronológico** (data, ação, resultado). Em incidentes longos, ele é o seu melhor aliado e a base do *post-mortem*.

### Triagem em 60 segundos
| Pergunta | Comando | O que olhar |
|---|---|---|
| O sistema está sobrecarregado? | §uptime§, §nproc§ | carga média contra o número de CPUs |
| Quem consome CPU e memória? | §top§ (§P§, §M§), §ps aux --sort=-%mem§ | processos no topo, estados §D§ e §Z§ |
| Falta memória? | §free -h§, §journalctl -k§ (procure "oom") | §available§; mortes do OOM |
| Falta disco ou inodes? | §df -h§, §df -i§ | uso acima de 90%; §IUse%§ |
| Disco lento? | §vmstat 1 5§ | §wa§ alto, §si§/§so§ (swap) |
| O serviço escuta a porta? | §ss -ltnp§ | porta, processo dono (PID/nome) |
| O que o serviço diz? | §journalctl -u serviço -n 100§, §tail -n 100 /var/log/...§ | mensagens de erro e horário |
| Resolve e responde? | §dig§, §curl -sv§ | DNS, conexão, código HTTP |

### Logs
- §journalctl -u nginx -n 100 --no-pager§: últimas 100 linhas do serviço; §--since "10 min ago"§ filtra por tempo; §-p err§ só erros; §-f§ acompanha; §-k§ mensagens do kernel; §-b§ do boot atual.
- Logs tradicionais em §/var/log§ (§syslog§, §auth.log§, §nginx/error.log§): use §tail -f§, §grep§ e a "receita" da aula 2. Sempre alinhe o **horário** do erro com o do evento.

### Rede e portas
- §ss -ltnp§: sockets TCP em escuta (§-l§), numéricos (§-n§), com processo (§-p§, pode exigir sudo para ver processos de outros usuários). Em nosso teste, um servidor Python apareceu como §LISTEN 127.0.0.1:8765§ e respondeu 200 a um §curl§.
- "**Address already in use**": outra instância (ou um processo qualquer) já escuta a porta. Ache o dono com §ss -ltnp 'sport = :8080'§ ou §lsof -i :8080§.
- §curl -sv -o /dev/null http://host:porta/§ mostra DNS, conexão, cabeçalhos e código; §curl -w "%{http_code} %{time_total}"§ mede tempo.

### Quatro cenários clássicos
**1. Disco cheio ("No space left on device").** (a) §df -h§ para achar o sistema de arquivos; (b) §df -i§ para descartar falta de inodes; (c) §du -h --max-depth=1 /var | sort -h§ descendo de nível em nível até o culpado (geralmente logs, cache, uploads); (d) §lsof +L1§ para arquivos apagados que ainda ocupam espaço (aula 6). Ação: rotacionar/compactar logs, limpar caches, **truncar** o arquivo aberto, e criar alerta.

**2. Porta ocupada.** §ss -ltnp§ identifica o processo; decida se é uma instância antiga do próprio serviço (encerre com SIGTERM) ou outro programa (mude a porta). Nunca "mate tudo" sem identificar o dono.

**3. Serviço some sem erro no log (OOM).** Sintomas: reinícios, exit **137**, sem exceção no log da aplicação. Confirme com §journalctl -k | grep -i "out of memory"§ (ou §dmesg§, se permitido). Veja §free -h§, o RSS ao longo do tempo (§ps -o rss -p PID§) e os limites do cgroup/contêiner. Ações: corrigir o vazamento ou o consumo, ajustar o limite com dados, adicionar monitoramento de §MemAvailable§.

**4. "Too many open files".** Compare §ulimit -n§ do processo (§cat /proc/PID/limits§) com §ls /proc/PID/fd | wc -l§. Se o número cresce sem parar, há **vazamento de descritores** (conexões ou arquivos nunca fechados); se estabiliza perto do limite, o limite está baixo para a carga. Ações: corrigir o vazamento e, se necessário, aumentar o limite (§LimitNOFILE§ no systemd).

### Ferramentas de mergulho
- §lsof -p PID§ e §ls -l /proc/PID/fd§: arquivos e sockets abertos.
- §strace -p PID§ (ou §strace -f comando§) mostra as **chamadas de sistema** em tempo real: onde o processo trava (§read§, §futex§, §connect§), quais arquivos tenta abrir (§openat§ com §ENOENT§). §strace -c§ resume contagem e tempo por chamada. É poderosa e **pesa**: use com cuidado em produção e com permissão. Em nosso teste, §strace -c -f true§ listou a chamada §execve§ na tabela de resumo.
- §/proc/PID/status§, §/proc/PID/limits§, §/proc/meminfo§: o kernel respondendo diretamente.

### Cuidados em produção
- **Leia antes de escrever.** Comandos de diagnóstico são, em geral, somente leitura; ações (§kill§, §rm§, reinício) vêm depois.
- Faça **backup** do que for alterar (cópia de um arquivo de configuração com data).
- Tenha um **plano de reversão** e comunique o time.
- Não rode comandos que você não entende só porque apareceram em um fórum: leia o §man§.`,
  concepts: [
    { term: 'Hipótese', def: 'Explicação provável do sintoma, testada de forma isolada e registrada.' },
    { term: 'Carga média', def: 'Média de tarefas prontas ou aguardando I/O; comparar ao número de CPUs.' },
    { term: 'ss', def: 'Ferramenta que lista sockets e portas em escuta (sucessora do netstat).' },
    { term: 'journalctl', def: 'Consulta o journal do systemd: logs de serviços, kernel e boot.' },
    { term: 'OOM killer', def: 'Mecanismo do kernel que mata processos quando falta memória; evidência no log do kernel (código 137).' },
    { term: 'strace', def: 'Mostra as chamadas de sistema de um processo para entender onde ele trava ou falha.' },
    { term: 'lsof', def: 'Lista arquivos, sockets e diretórios abertos por processos.' },
    { term: 'Too many open files', def: 'Erro ao exceder o limite de descritores do processo (ulimit -n).' },
    { term: 'Post-mortem', def: 'Documento posterior ao incidente com linha do tempo, causa raiz e ações de prevenção.' }
  ],
  examples: R`**Analogia:** diagnosticar é como o trabalho de um **médico de pronto-socorro**: sinais vitais primeiro (carga, memória, disco, rede), depois perguntas dirigidas (o que mudou? desde quando?) e só então exames específicos (strace, lsof). Tratar antes de examinar é medicar no escuro.

**Caso: "o site retorna 502 desde as 14h10."** (1) §journalctl -u app --since "14:00"§: vê "killed" e reinícios a cada 6 minutos. (2) §journalctl -k | grep -i oom§: o kernel matou o processo da aplicação. (3) §free -h§ mostra §available§ baixo e o RSS da aplicação sobe linearmente. (4) A hipótese de vazamento coincide com o deploy das 14h. **Ação:** reverter o deploy (restaura o serviço), abrir investigação do vazamento com *profiler* e adicionar alerta de memória. **Registro:** hora, evidências, ação, causa provável, prevenção.

**Caso: "falha ao salvar uploads."** O log diz "No space left on device", mas §df -h§ mostra 38% usado. §df -i§ mostra 100% de inodes em §/var§: milhões de arquivos de sessão. Ação: limpar sessões expiradas e configurar a limpeza automática.`,
  code: [
    { title: 'Triagem em 60 segundos (somente leitura; executado no Linux)', lang: 'bash', code: R`uptime; nproc                        # carga x número de CPUs
free -h | head -2                    # memória: olhe 'available'
df -h / ; df -i /                    # espaço e inodes
ss -ltn | head -5                    # portas em escuta
ps -eo pid,stat,pcpu,pmem,comm --sort=-pcpu | head -5   # maiores consumidores de CPU
journalctl -p err -n 5 --no-pager    # últimos erros do sistema`, notes: [{ l: '1', t: 'Carga média perto ou acima de nproc indica saturação.' }, { l: '2', t: 'available é a medida correta de memória livre para programas.' }, { l: '3', t: 'df -i detecta falta de inodes.' }, { l: '4', t: '-l escuta, -t TCP, -n numérico; adicione -p (e sudo) para ver o processo.' }, { l: '5', t: 'Procure estados D (I/O) e Z (zumbi) na coluna stat.' }, { l: '6', t: '-p err filtra por prioridade de erro; pode exigir permissão para ver todos os logs.' }] },
    { title: 'Porta ocupada e descritores (executado no Linux)', lang: 'bash', code: R`python3 -m http.server 8765 --bind 127.0.0.1 > /dev/null 2>&1 & P=$!
sleep 1
ss -ltnp 2>/dev/null | grep 8765        # LISTEN 127.0.0.1:8765  (com o processo, se permitido)
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8765/   # 200
cat /proc/$P/limits | grep -i 'open files'   # limite de descritores do processo
ls /proc/$P/fd | wc -l                       # quantos estão em uso
kill $P`, notes: [{ l: '1', t: 'Sobe um servidor de teste local, só em 127.0.0.1.' }, { l: '3', t: 'ss lista o socket em escuta; sem permissão a coluna do processo pode vir vazia.' }, { l: '4', t: '-w imprime só o código HTTP; 200 confirma que o serviço responde.' }, { l: '5', t: '/proc/PID/limits mostra o limite efetivo daquele processo.' }, { l: '6', t: 'Compare o número de fds em uso com o limite para detectar vazamento.' }, { l: '7', t: 'Encerra o servidor de teste com SIGTERM.' }] }
  ],
  bestPractices: ['Siga o método: sintoma, evidência, hipótese, um teste por vez, verificação e registro.', 'Colete evidências **antes** de reiniciar qualquer coisa.', 'Prefira comandos somente leitura na triagem e confirme o alvo antes de matar ou apagar.', 'Alinhe horários: compare o instante do erro com deploys e mudanças.', 'Crie alertas para o que acabou de causar o incidente (disco, inodes, memória, descritores).', 'Escreva o post-mortem sem culpa, com ações de prevenção e responsáveis.'],
  mistakes: ['Reiniciar o serviço primeiro e perder a evidência.', 'Mudar várias coisas ao mesmo tempo e não saber o que resolveu.', 'Confiar em "free" baixo ou em um único gráfico sem correlacionar com o evento.', 'Rodar comandos copiados sem entender (especialmente §rm§, §chmod -R§, §kill -9§).', 'Parar na causa imediata ("faltou disco") sem investigar a causa raiz (por que encheu).', 'Não registrar o que foi feito, repetindo o incidente depois.'],
  market: `Plantão, SRE e DevOps avaliam exatamente isto: método e velocidade para localizar a causa. Entrevistas costumam propor cenários como "disco cheio", "serviço morrendo sem erro" e "porta ocupada". Quem demonstra um roteiro de diagnóstico claro e comandos de leitura se destaca de quem apenas reinicia.`,
  summary: `Diagnostique com método: sintoma, evidência, hipótese, um teste por vez, correção verificada e registro. Faça a triagem com §uptime§, §top§, §free§, §df -h§/§-i§, §ss -ltnp§ e §journalctl§. Quatro casos clássicos: disco cheio (§df§, §du§, §lsof +L1§), porta ocupada (§ss§), OOM (log do kernel, 137) e "Too many open files" (§/proc/PID/limits§ e §fd§). Use §strace§ e §lsof§ para mergulhar, com cuidado em produção.`,
  refs: [REF3.journalctl, REF3.ss, REF3.strace, REF3.proc, RB.signal],
  cards: [
    { q: 'Por que não reiniciar o serviço como primeiro passo?', a: 'Reiniciar apaga evidências (estado, memória, conexões); primeiro colete logs e métricas.' },
    { q: 'Como diferenciar disco cheio por espaço e por inodes?', a: 'df -h mostra espaço; df -i mostra inodes. "No space left" pode ser qualquer um.' },
    { q: 'Como descobrir quem usa a porta 8080?', a: 'ss -ltnp com filtro (ou lsof -i :8080), idealmente com sudo para ver o processo.' },
    { q: 'O que sugere um exit code 137 sem erro no log da aplicação?', a: 'Morte por SIGKILL, em geral pelo OOM killer ou limite do contêiner; confirme no log do kernel.' }
  ]
}
];
