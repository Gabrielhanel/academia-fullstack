// Curso C1.1 da C1: Linux, terminal e sistemas operacionais (disciplinas: linux + os).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c11-a.mjs';
import { REF2, lessonsB } from './c11-b.mjs';
import { REF3, lessonsC } from './c11-c.mjs';
import { exsets, assessment, project } from './c11-ex.mjs';

const R = String.raw;
// Nos exemplos, "DOLAR{" marca uma interpolação de shell ou de template.
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Sistema de arquivos', 'Comandos essenciais', 'Permissões e processos', 'Shell Script', 'Automação de tarefas', 'Troubleshooting em servidores', 'Processos e threads', 'Memória e gerenciamento de recursos', 'I/O e sistemas de arquivos'];
export const COVER = {
  'Sistema de arquivos': ['lnx-01'],
  'Comandos essenciais': ['lnx-02'],
  'Permissões e processos': ['lnx-03', 'lnx-04'],
  'Shell Script': ['lnx-07'],
  'Automação de tarefas': ['lnx-08'],
  'Troubleshooting em servidores': ['lnx-09'],
  'Processos e threads': ['lnx-04'],
  'Memória e gerenciamento de recursos': ['lnx-05'],
  'I/O e sistemas de arquivos': ['lnx-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Kernel', def: 'Núcleo do sistema operacional: gerencia CPU, memória, dispositivos e a comunicação entre programas e hardware.' },
  { term: 'Shell', def: 'Programa que interpreta comandos digitados ou escritos em scripts e inicia outros programas (Bash, sh, zsh).' },
  { term: 'Chamada de sistema', def: 'Interface pela qual um programa pede serviços ao kernel (open, read, write, fork, execve).' },
  { term: 'Daemon', def: 'Processo de serviço que roda em segundo plano, como o sshd ou o nginx.' },
  { term: 'PATH', def: 'Variável de ambiente com os diretórios em que o shell procura executáveis.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'linux-terminal-so', disciplineId: 'linux', disciplineIds: ['os'], areaId: 'ops', requires: ['logica-algoritmos', 'git-github'],
  title: 'Linux, terminal e sistemas operacionais',
  description: 'O curso que torna o servidor menos misterioso: a árvore de arquivos e a linha de comando, permissões e usuários, o que são processos, threads e sinais, como o sistema gerencia memória, E/S e sistemas de arquivos, e como transformar tudo isso em scripts de automação confiáveis e em um método de diagnóstico para incidentes reais. Os exemplos foram executados em Linux com Bash 5.',
  objectives: ['Navegar e operar um sistema Linux pela linha de comando com segurança', 'Combinar comandos com pipes e redirecionamentos para filtrar e transformar texto', 'Configurar permissões e usar sudo aplicando o menor privilégio', 'Explicar processos, threads, sinais, memória virtual, descritores e sistemas de arquivos', 'Escrever scripts Bash robustos e agendá-los com cron ou systemd', 'Diagnosticar com método incidentes de disco, porta, memória e descritores'],
  level: 'I', prereqs: ['Lógica de programação (variáveis, condicionais, laços e funções)', 'Git básico e uso elementar de um terminal', 'Acesso a um sistema Linux (nativo, máquina virtual, WSL ou contêiner) para praticar'], hours: 26,
  syllabus: 'Árvore de diretórios, caminhos, inodes e links; comandos essenciais, pipes e redirecionamento; usuários, permissões, umask e sudo; processos, threads e sinais; memória virtual, swap, OOM e cgroups; descritores, E/S e sistemas de arquivos; Shell Script com Bash; automação com getopts, trap, flock, cron e systemd timers; troubleshooting de servidores.',
  versions: 'Linux com kernel 5.x ou 6.x e GNU coreutils; Bash 5.x (os exemplos foram executados em Bash 5 com Linux x86-64). Comandos como §ss§, §journalctl§ e §systemd§ pressupõem uma distribuição com systemd; em Alpine ou macOS alguns comandos diferem. Mensagens de erro dependem do idioma do sistema. Referências consultadas em 2026-11-18.',
  skills: ['Linha de comando', 'Pipes e redirecionamento', 'Permissões e segurança de arquivos', 'Processos e sinais', 'Memória e recursos', 'E/S e sistemas de arquivos', 'Shell Script', 'Automação e agendamento', 'Diagnóstico de servidores'],
  modules: [
    { id: 'm1', title: 'Arquivos, comandos e permissões', lessons: ['lnx-01', 'lnx-02', 'lnx-03'] },
    { id: 'm2', title: 'O sistema operacional por dentro', lessons: ['lnx-04', 'lnx-05', 'lnx-06'] },
    { id: 'm3', title: 'Shell Script, automação e diagnóstico', lessons: ['lnx-07', 'lnx-08', 'lnx-09'] }
  ],
  materials: [REF.hier, REF.bashManual, REF2.signal, REF2.kernelMm, REF3.journalctl].map((r) => ({ ...r })),
  projectIds: ['kit-operacao-servidor'],
  supplement: {
    glossary,
    cheatsheet: R`### Navegação e arquivos
§pwd§ · §cd dir§ · §ls -lah§ · §mkdir -p a/b§ · §cp -r§ · §mv§ · §rm -r§ (sem lixeira!) · §ln -s alvo link§ · §stat§ · §file§

### Texto
§cat§ · §less§ · §head -n§ · §tail -f§ · §wc -l§ · §grep -inrv§ · §sort | uniq -c | sort -rn§ · §cut -d, -f2§ · §find . -name '*.log' -mtime +30§

### Redirecionamento
§> arq§ (sobrescreve) · §>> arq§ (acrescenta) · §2> erros§ · §> tudo 2>&1§ (nesta ordem) · §< arq§ · §a | b§ · §/dev/null§ · §$?§ = código de saída (0 = sucesso)

### Permissões
§r=4 w=2 x=1§ · §640 = rw-r-----§ · §chmod u+x§ · §chown u:g§ · §umask 022§ · diretório: §x§ atravessa, §w§ altera entradas

### Processos e sinais
§ps aux§ · §top§ · §pgrep§ · §kill PID§ (SIGTERM, 15) · §kill -9§ (SIGKILL, último recurso) · estados §R S D T Z§ · saída por sinal = 128 + n (137, 143)

### Memória e disco
§free -h§ (olhe §available§) · §ulimit -n§ · §df -h§ e §df -i§ · §du -h --max-depth=1 | sort -h§ · §lsof +L1§ (apagado e aberto) · §ls /proc/PID/fd | wc -l§

### Shell Script
§#!/usr/bin/env bash§ · §set -euo pipefail§ · aspas em tudo: §"$var"§, §"$@"§ · §[[ -f "$a" ]]§ · §trap 'limpar' EXIT§ · §mktemp§ · §flock -n 9§ · §getopts "nk:" opt§

### Agendamento
cron: §min hora dia mês dia-da-semana§ · §*/15 * * * *§ · caminhos absolutos e log · systemd: §.service§ + §.timer§, §OnCalendar=§, §Persistent=true§

### Diagnóstico (somente leitura primeiro)
§uptime§ e §nproc§ · §top§ · §free -h§ · §df -h; df -i§ · §ss -ltnp§ · §journalctl -u svc -n 100§ · §journalctl -k§ · §strace -p§ · §lsof -p§`,
    mistakes: ['Esquecer as aspas e quebrar nomes com espaços.', 'Resolver permissões com chmod 777.', 'Usar sort arq > arq e esvaziar o arquivo.', 'Usar kill -9 como primeira opção.', 'Olhar a coluna free em vez de available.', 'Apagar um log aberto e esperar o espaço voltar.', 'Rodar tarefas no cron com caminhos relativos e sem log.', 'Reiniciar o serviço antes de coletar evidências.'],
    prereqMap: R`**Antes deste curso:** lógica de programação e Git básico, para usar o terminal com confiança. Para praticar, use Linux nativo, WSL, uma máquina virtual ou um contêiner.

| Este curso prepara para | Por quê |
|---|---|
| Redes de computadores e HTTP | diagnóstico de portas, DNS e conexões usa §ss§, §curl§ e §dig§ |
| Ferramentas do desenvolvedor | terminal, scripts e hooks de Git |
| Docker, CI/CD e Nginx | contêineres são processos com cgroups; pipelines são scripts |
| Paradigmas de programação | processos e threads sustentam a concorrência |
| Segurança | permissões, usuários e menor privilégio |

Ordem interna: aulas 1 a 3 (arquivos, comandos e permissões) → 4 a 6 (processos, memória e E/S) → 7 a 9 (scripts, automação e diagnóstico).`,
    officialRefs: [REF.hier, REF.fhs, REF.bashManual, REF.coreutils, REF.grep, REF.findutils, REF.creds, REF2.signal, REF2.kernelMm, REF2.cgroups, REF2.open, REF3.systemdTimer, REF3.journalctl],
    practice: ['Monte um diretório de testes com mktemp -d, crie arquivos e links e confira inodes e contagem de links com stat.', 'Pegue um log real (ou gere um com printf) e responda com pipes: quais as 3 linhas mais frequentes?', 'Crie arquivos com modos 600, 640 e 755 e preveja, antes de testar, quem consegue ler cada um.', 'Rode um processo em segundo plano, envie SIGTERM e SIGKILL e compare os códigos de saída (143 e 137).', 'Use free -h, ps -o rss e /proc/PID/status para medir o consumo de um programa seu.', 'Escreva o script backup.sh do curso e valide com bash -n e com o modo de simulação.', 'Simule um disco cheio em um diretório de testes (arquivo grande + processo que o mantém aberto) e use lsof +L1 para achar a causa.', 'Faça o projeto integrador: kit de operação com backup, agendamento e roteiro de diagnóstico.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
