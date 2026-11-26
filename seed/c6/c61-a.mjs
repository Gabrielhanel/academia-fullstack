// C6.1 — Docker, Compose e Kubernetes. Aulas 1 e 2 (contêineres x máquinas virtuais; Dockerfile).
const R = String.raw;

export const REF = {
  dockerOverview: { title: 'Docker — What is a container?', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/', kind: 'doc' },
  dockerBest: { title: 'Docker — Building best practices', url: 'https://docs.docker.com/build/building/best-practices/', kind: 'doc' },
  dockerMulti: { title: 'Docker — Multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/', kind: 'doc' },
  dockerCache: { title: 'Docker — Build cache', url: 'https://docs.docker.com/build/cache/', kind: 'doc' },
  dockerSecurity: { title: 'Docker — Docker Engine security', url: 'https://docs.docker.com/engine/security/', kind: 'doc' },
  dockerResources: { title: 'Docker — Resource constraints', url: 'https://docs.docker.com/engine/containers/resource_constraints/', kind: 'doc' },
  namespaces: { title: 'Linux man-pages — namespaces(7)', url: 'https://man7.org/linux/man-pages/man7/namespaces.7.html', kind: 'doc' },
  cgroups: { title: 'Linux man-pages — cgroups(7)', url: 'https://man7.org/linux/man-pages/man7/cgroups.7.html', kind: 'doc' },
  oci: { title: 'Open Container Initiative', url: 'https://opencontainers.org/', kind: 'especificação' },
  hadolint: { title: 'hadolint — Dockerfile linter', url: 'https://github.com/hadolint/hadolint', kind: 'ferramenta' },
  twelveFactor: { title: 'The Twelve-Factor App', url: 'https://12factor.net/', kind: 'guia' }
};

export const lessonsA = [
{
  id: 'dk-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['contêineres', 'máquinas virtuais', 'namespaces', 'cgroups', 'isolamento', 'imagens', 'OCI'],
  title: 'Contêineres x máquinas virtuais: namespaces, cgroups, imagens em camadas e os limites reais do isolamento',
  objectives: ['Explicar o que é um contêiner no Linux (processo isolado por namespaces e limitado por cgroups) e como difere de uma VM', 'Verificar experimentalmente o kernel compartilhado, o namespace de PIDs e a camada gravável', 'Aplicar e observar limites de memória (OOM) e de CPU', 'Entender imagens como camadas imutáveis (OCI), contêineres, volumes e redes', 'Reconhecer as consequências de segurança do kernel compartilhado', 'Escolher entre contêiner, VM e outras formas de isolamento'],
  intro: R`Um **contêiner** não é uma "VM leve": é **um processo comum do Linux** **isolado** por **namespaces** (o que ele *enxerga*) e **limitado** por **cgroups** (o que ele *consome*), executando **um sistema de arquivos em camadas** a partir de uma **imagem**. Neste laboratório (Docker 29.9.3, Linux 7.0.0-43) a **mesma versão de kernel** apareceu no host e no contêiner (**§7.0.0-43-generic§**), o processo do contêiner tinha **PID 1** lá dentro e **outro PID no host**, o limite de **32 MiB** fez o processo ser **morto com saída 137 (§OOMKilled: true§)**, e o limite de **0,5 CPU** dobrou o tempo de um laço (**3.802 ms → 7.758 ms**).`,
  theory: R`### O que é um contêiner
No **Linux**, um contêiner é **um (ou mais) processo(s)** que o **kernel** executa com:
- **Namespaces** (§namespaces(7)§): **visões isoladas** de **recursos globais**: **PID** (árvore de processos: o primeiro processo vira **PID 1**), **NET** (interfaces, rotas, portas), **MNT** (pontos de montagem/sistema de arquivos), **UTS** (nome do host), **IPC**, **USER** (mapear uid) e **CGROUP**;
- **Cgroups** (§cgroups(7)§): **contabilizam e limitam** **CPU, memória, E/S e número de processos**;
- **Sistema de arquivos em camadas** (**overlay**): **camadas somente leitura** da **imagem** + **uma camada gravável** do contêiner;
- **Capacidades** e **perfis** (**seccomp**, **AppArmor/SELinux**): **restringem** chamadas de sistema e privilégios.
**Não existe "objeto contêiner" no kernel**: é **a combinação** desses recursos. **Docker**, **containerd**, **runc** e **Podman** **montam** essa combinação seguindo padrões da **OCI** (*Open Container Initiative*: **formato de imagem** e **runtime**).

### Contêiner x máquina virtual
| | **Máquina virtual** | **Contêiner** |
|---|---|---|
| **O que isola** | **hardware virtual** (CPU, RAM, disco) com **kernel próprio** | **processos** sobre o **kernel do host** |
| **Início** | segundos a minutos | **muito mais rápido que uma VM** (mas **não instantâneo**: ver abaixo) |
| **Tamanho** | GBs (SO completo) | MBs (apenas o que a aplicação precisa; **alpine** ≈ 8 MB) |
| **Densidade** | dezenas por host | **centenas** |
| **Isolamento** | **forte** (hypervisor, superfície menor) | **mais fraco** (kernel compartilhado: **falha de kernel = risco para todos**) |
| **Sistema operacional** | **qualquer** (Windows em Linux) | **mesmo kernel** (Linux em Linux; no Windows/macOS o Docker usa **uma VM Linux**) |
| **Uso típico** | **isolamento forte**, **SOs diferentes**, **multi-inquilino hostil** | **empacotar e implantar aplicações**, **microsserviços**, **CI** |
**Complementares:** nuvens executam **contêineres dentro de VMs**; **microVMs** (Firecracker, Kata) **tentam o melhor dos dois** (isolamento de VM com início rápido): **não executadas** neste curso.

### Medido: experimentos do laboratório (§isolamento.sh§)
1. **Kernel compartilhado:** host **§7.0.0-43-generic§**, contêiner **§7.0.0-43-generic§**: **o mesmo kernel**;
2. **Namespace de PIDs:** dentro: §ps§ mostra **PID 1 = sh**; no host o mesmo processo tem **outro PID** (**229141** na execução): **o host enxerga tudo, o contêiner só o seu**;
3. **Tempo para iniciar e encerrar** (§docker run --rm alpine true§, **10 execuções**): **mediana de 883 ms** (**mín. 845, máx. 929**). **Atenção:** **inclui** o **CLI**, o **daemon**, a **criação de rede/montagens** e o **encerramento**; o **processo em si** inicia em **milissegundos**. **"Contêineres iniciam em milissegundos" é uma simplificação**: **mede o que você mede**;
4. **Limite de memória** (§--memory=32m --memory-swap=32m§; o processo tenta **alocar 200 MiB**): **código de saída 137** (**128 + 9 = SIGKILL**) e §OOMKilled: true§: **o kernel (OOM killer do cgroup)** matou o processo: **o contêiner morreu, o host ficou bem**. **Sem** limite, **um vazamento** poderia **derrubar o host**;
5. **Limite de CPU** (laço de **3·10⁸** iterações): **§--cpus=1§ 3.802 ms**; **§--cpus=0.5§ 7.758 ms** (**~2,0x**): o cgroup **estrangula** (*throttling*) o processo a **meia CPU**: **a latência sobe** com **limites apertados** (relevante em **Kubernetes**: **§limits.cpu§** pode **causar** *throttling*; aula dk-06);
6. **Sistema de arquivos:** o arquivo gravado em **§/tmp§** **não existe** em **um novo contêiner**; com **volume** nomeado, **persiste**: **a camada gravável é efêmera**.

### Imagens, camadas e contêineres
- **Imagem:** **pacote imutável** (**camadas** + **configuração**: comando, variáveis, portas) **identificado** por **tag** (§node:26-alpine§) e **digest** (§sha256:...§: **imutável**; a **tag** pode **mudar**: **fixe o digest** em **produção**);
- **Camadas:** **cada instrução** do Dockerfile (§RUN§, §COPY§, §ADD§) **cria uma camada**; **compartilhadas** entre imagens (**economia de disco e de download**) e **armazenadas em cache** (aula dk-02);
- **Contêiner:** **instância em execução** (ou parada) **de uma imagem** + **camada gravável**; **§docker run§** cria e inicia; **§docker rm§** apaga a camada;
- **Registro (*registry*):** **armazena e distribui** imagens (**Docker Hub**, **GHCR**, **ECR/ACR/GAR**, **registro privado**);
- **Volumes** (**dados que sobrevivem**), **bind mounts** (**pasta do host**: desenvolvimento) e **tmpfs** (**memória**);
- **Redes:** **bridge** padrão (**NAT**), **redes definidas pelo usuário** (**DNS por nome de serviço**), **host** e **none**.

### Segurança: o que o kernel compartilhado implica
- **Não rode como root** dentro do contêiner (aula dk-02): **root no contêiner ≈ root no host** **se** houver **fuga**;
- **Não use §--privileged§** nem **monte** o §docker.sock§ (**dá controle total do host**);
- **Remova capacidades** (§--cap-drop ALL§), **sistema de arquivos somente leitura** (§--read-only§), **§no-new-privileges§** (aula dk-03: **aplicados** no Compose do laboratório);
- **Imagens mínimas** e **atualizadas** (**menos pacotes = menos CVEs**), **varredura** (Trivy/Scout: **não executada**), **assinatura** de imagens;
- **Isolamento forte** (**multi-inquilino não confiável**): **VMs/microVMs** ou **sandboxes** (gVisor): **avalie**.

### 12 fatores: contêineres como unidade de implantação
**Config no ambiente** (variáveis, não na imagem), **processos sem estado** (estado em **bancos/volumes**), **logs no stdout** (o runtime coleta), **descartáveis** (**início rápido**, **desligamento gracioso** com §SIGTERM§), **paridade dev/produção**: o **app do laboratório** trata §SIGTERM§ e **loga no stdout**.

### Quando usar o quê
| Necessidade | Escolha |
|---|---|
| Empacotar **uma aplicação** e suas dependências | **Contêiner** |
| **Rodar outro sistema operacional** ou kernel | **VM** |
| **Multi-inquilino não confiável** | **VM/microVM** (**+ contêineres dentro**) |
| **Orquestrar** muitos contêineres | **Kubernetes** (aulas dk-04 a dk-06) ou **Compose** (um host: dk-03) |
| **Ambiente de desenvolvimento reproduzível** | **Contêineres + Compose** |

### Limites desta aula
**Executados:** os **6 experimentos** acima (Docker 29.9.3). **Não executados:** **microVMs** (Firecracker), **gVisor**, **rootless Docker**, **Podman**, **seccomp/AppArmor** customizados, **varredura de CVEs**.`,
  concepts: [
    { term: 'Contêiner', def: 'Processo (ou grupo de processos) isolado por namespaces e limitado por cgroups, executado a partir de uma imagem.' },
    { term: 'Namespace', def: 'Recurso do kernel que dá a um processo uma visão isolada de recursos como PIDs, rede e montagens.' },
    { term: 'Cgroup', def: 'Recurso do kernel que contabiliza e limita CPU, memória, E/S e processos de um grupo.' },
    { term: 'Imagem', def: 'Pacote imutável, em camadas, com o sistema de arquivos e a configuração para criar contêineres.' },
    { term: 'OOMKilled', def: 'Estado de um contêiner encerrado pelo kernel por exceder o limite de memória (saída 137).' },
    { term: 'OCI', def: 'Open Container Initiative: padrões abertos para formato de imagem e runtime de contêineres.' },
    { term: 'Volume', def: 'Armazenamento gerenciado que persiste além do ciclo de vida do contêiner.' }
  ],
  examples: R`**Analogia:** uma **VM** é um **apartamento** com **estrutura e tubulação próprias** dentro do prédio; um **contêiner** é um **quarto de hotel**: **mesma estrutura do prédio** (kernel), **porta própria**, **quota de água e luz** (cgroups) e **janelas que só mostram o próprio quarto** (namespaces). **Mais leve e rápido de montar**, porém **uma falha na estrutura** afeta todos.

**Exemplo 1: kernel compartilhado.** O host e o contêiner mostraram 7.0.0-43-generic.

**Exemplo 2: OOM.** Com 32 MiB, alocar 200 MiB termina em saída 137 e OOMKilled true.

**Exemplo 3: CPU.** Com 0,5 CPU o mesmo laço levou ~2x o tempo (7.758 ms contra 3.802 ms).`,
  code: [
    { title: 'Limites de memória e CPU e a camada gravável (shell; resultados medidos)', lang: 'bash', code: R`# memória: o processo tenta alocar 200 MiB com limite de 32 MiB
docker run --name lab-oom --memory=32m --memory-swap=32m node:26-alpine \
  node -e "const a=[]; for(let i=0;i<200;i++) a.push(Buffer.alloc(1024*1024,1))"
echo $?                                            # 137 (128 + SIGKILL)
docker inspect -f '{{.State.OOMKilled}}' lab-oom   # true

# CPU: mesmo laço com 1 e 0,5 CPU
docker run --rm --cpus=1   node:26-alpine node -e "const t=Date.now();let s=0;for(let i=0;i<3e8;i++){s+=i%7}console.log(Date.now()-t,'ms')"   # 3802 ms
docker run --rm --cpus=0.5 node:26-alpine node -e "const t=Date.now();let s=0;for(let i=0;i<3e8;i++){s+=i%7}console.log(Date.now()-t,'ms')"   # 7758 ms

# camada gravável é efêmera; volume persiste
docker run --rm alpine sh -c 'echo dado > /tmp/arq'
docker run --rm alpine sh -c 'test -f /tmp/arq && echo sim || echo não'      # não
docker run --rm -v lab-vol:/dados alpine sh -c 'echo persistente > /dados/arq'`, notes: [{ l: '4', t: '137 = 128 + 9 (SIGKILL): assinatura típica de OOM kill.' }, { l: '9', t: 'O cgroup limita o uso de CPU e estrangula o processo.' }] },
    { title: 'Kernel e PIDs: o que o contêiner enxerga (shell; resultados medidos)', lang: 'bash', code: R`uname -r                                              # host:      7.0.0-43-generic
docker run --rm alpine uname -r                       # contêiner: 7.0.0-43-generic (mesmo kernel)

docker run --rm alpine sh -c 'ps -o pid,comm | sed -n 2p'     #     1 sh   (PID 1 dentro do namespace)
docker run -d --name lab-pid alpine sleep 60 >/dev/null
pgrep -f 'sleep 60' | head -n 1                       # 229141 (PID real no host); o host enxerga o processo
docker rm -f lab-pid >/dev/null

# tempo para iniciar e encerrar (inclui CLI, daemon e rede): mediana 883 ms em 10 execuções
for i in $(seq 1 10); do s=$(date +%s%N); docker run --rm alpine true; e=$(date +%s%N); echo $(( (e - s) / 1000000 )); done`, notes: [{ l: '2', t: 'Mesmo kernel: um contêiner Linux não traz kernel próprio.' }, { l: '9', t: 'O número mede o fluxo completo do CLI, não só o início do processo.' }] },
    { title: 'Camadas de uma imagem e digest imutável (shell)', lang: 'bash', code: R`docker history --format '{{.CreatedBy}}  {{.Size}}' node:26-alpine | head -n 5   # camadas e tamanhos
docker image inspect node:26-alpine --format '{{.Id}}'                              # identificador (sha256) do conteúdo

# em produção, fixe o digest: a tag pode apontar para outro conteúdo amanhã
#   FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5`, notes: [{ l: '1', t: 'Cada instrução do Dockerfile deixa uma camada.' }, { l: '5', t: 'Digest = conteúdo imutável (valor do pull do laboratório).' }] }
  ],
  bestPractices: ['Pense no contêiner como processo isolado e limitado, não como VM, e escolha VM ou microVM para multi-inquilino não confiável.', 'Defina limites de memória e CPU e entenda o OOM kill (137) e o throttling.', 'Trate a camada gravável como efêmera e use volumes para dados.', 'Fixe imagens por digest em produção e mantenha-as mínimas e atualizadas.', 'Não rode como root, não use --privileged nem monte o docker.sock; remova capacidades.', 'Siga os 12 fatores: configuração no ambiente, logs no stdout, desligamento gracioso com SIGTERM.', 'Meça o que importa (início real da aplicação) em vez de repetir "milissegundos".'],
  mistakes: ['Achar que contêiner é VM leve e seguro por padrão.', 'Rodar sem limites de memória e CPU.', 'Guardar dados na camada gravável.', 'Usar tags flutuantes (latest) em produção.', 'Usar --privileged ou montar o docker.sock em contêineres.', 'Supor que Windows e macOS rodam contêineres sem uma VM Linux.'],
  market: R`**Entender namespaces, cgroups e camadas** distingue quem **depura** contêineres (OOM, throttling, DNS) de quem só **copia comandos**; é **base de Kubernetes**, **CI** e **segurança** e **cai em entrevistas** de **DevOps e SRE**.`,
  summary: R`Um contêiner é um processo do Linux isolado por namespaces e limitado por cgroups, com sistema de arquivos em camadas de uma imagem; uma VM tem kernel próprio. Medido (Docker 29.9.3): kernel idêntico no host e no contêiner, PID 1 dentro e outro PID no host, início e término em mediana de 883 ms (inclui CLI e daemon), OOM com 32 MiB (saída 137, OOMKilled true), laço 2x mais lento com 0,5 CPU (7.758 x 3.802 ms) e camada gravável efêmera contra volume persistente. O kernel compartilhado pede usuário não root, capacidades removidas e, para multi-inquilino hostil, VMs ou microVMs (não executadas).`,
  refs: [REF.dockerOverview, REF.namespaces, REF.cgroups, REF.dockerResources, REF.dockerSecurity, REF.oci, REF.twelveFactor],
  cards: [
    { q: 'O que torna um processo um contêiner?', a: 'Isolamento por namespaces, limites por cgroups e um sistema de arquivos em camadas de uma imagem, tudo sobre o kernel do host.' },
    { q: 'O que significa a saída 137 com OOMKilled true?', a: 'O kernel matou o processo (SIGKILL = 128 + 9) por exceder o limite de memória do cgroup.' },
    { q: 'Por que "contêineres iniciam em milissegundos" é uma simplificação?', a: 'O processo inicia rápido, mas o fluxo do docker run (CLI, daemon, rede, montagens) levou ~883 ms de mediana no laboratório.' },
    { q: 'Quando preferir uma VM?', a: 'Para outro sistema operacional ou kernel e para multi-inquilino não confiável, onde o isolamento do hypervisor é mais forte.' }
  ]
},
{
  id: 'dk-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['Dockerfile', 'multi-stage', 'cache de camadas', 'hadolint', 'usuário não root', 'HEALTHCHECK', '.dockerignore'],
  title: 'Dockerfile: imagens pequenas, rápidas de construir e seguras, com cache de camadas, multi-stage e lint',
  objectives: ['Escrever um Dockerfile multi-estágio com ordem de camadas que aproveite o cache', 'Medir o efeito no tamanho da imagem e no tempo de reconstrução (ingênuo x otimizado)', 'Executar a aplicação como usuário não root, com HEALTHCHECK e desligamento gracioso', 'Usar .dockerignore e npm ci --omit=dev para builds reproduzíveis e enxutos', 'Aplicar o hadolint e interpretar o que ele acha e o que não acha', 'Conhecer práticas de segredos em builds, digests e imagens mínimas'],
  intro: R`O **Dockerfile** define **como construir uma imagem**. Pequenas decisões (a **ordem** das instruções, **multi-estágio**, **usuário**, **.dockerignore**) mudam **muito** o **tamanho**, o **tempo** e a **segurança**. No laboratório, a mesma API Node foi construída de **dois jeitos**: **ingênuo** (**§COPY . .§** antes de instalar, **root**, **devDependencies**) → **355 MB**, **39,1 s** sem cache e **29,1 s** ao **alterar só o código**; **otimizado** (**multi-estágio**, **§npm ci --omit=dev§**, **usuário 1000**) → **260 MB**, **20,6 s** e **3,4 s** na reconstrução (**~8,5x mais rápida**). E um **achado**: o **hadolint passou** o Dockerfile **ingênuo** e **acusou** o **otimizado** (2 achados), mostrando o **limite** do lint.`,
  theory: R`### Como o build funciona
- Cada instrução (§FROM§, §RUN§, §COPY§, §ADD§...) **gera uma camada** (**uma alteração do sistema de arquivos**);
- **Cache de camadas:** o Docker **reaproveita** uma camada **se a instrução e tudo o que a precede** **não mudou** (para §COPY§, o **conteúdo dos arquivos** entra no cálculo). **Ao invalidar uma camada, todas as seguintes são reconstruídas**;
- **BuildKit** (padrão): **paralelismo**, **cache avançado**, **segredos** (§--mount=type=secret§), **cache de dependências** (§--mount=type=cache§);
- **Contexto de build:** **tudo** que é enviado ao daemon (o diretório do §docker build .§): **reduza com §.dockerignore§**.

### A regra de ouro da ordem: o que muda menos vem primeiro
**Ingênuo** (§Dockerfile.ingenuo§):
§§§
FROM node:26-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.mjs"]
§§§
**Problemas:** (1) §COPY . .§ **antes** de §npm install§: **qualquer** mudança em **qualquer arquivo** invalida a **instalação de dependências** (**reinstala tudo a cada alteração**: **29,1 s** na reconstrução); (2) §npm install§ **inclui devDependencies** (no laboratório, o **vitest**: **imagem 355 MB**); (3) **roda como root**; (4) **sem HEALTHCHECK**.
**Otimizado** (§Dockerfile§):
§§§
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:26-alpine AS final
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node server.mjs package.json ./
USER 1000:1000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD ["wget", "-qO-", "http://127.0.0.1:3000/saude"]
CMD ["node", "server.mjs"]
§§§
**O que mudou:** **primeiro só os manifestos** (§package.json§ + lockfile) → **a camada de dependências só é refeita quando elas mudam**; **o código** entra **depois** (muda sempre, **camada pequena**); **§npm ci§** (**instala exatamente o lockfile**: **reprodutível**, **falha** se divergir) com **§--omit=dev§**; **multi-estágio** (**ferramentas de build não vão para a imagem final**); **§NODE_ENV=production§**; **usuário não root**; **HEALTHCHECK** (**forma JSON**, **sem shell**).

### Medido: ingênuo x otimizado
| Medida | Ingênuo | Otimizado |
|---|---|---|
| **Tamanho** | **355 MB** | **260 MB** |
| **1ª construção** (§--no-cache§) | 39,1 s | 20,6 s |
| **Reconstrução** (alterando só §server.mjs§) | **29,1 s** | **3,4 s** |
| **Usuário** | **root** (uid 0, com grupos de sistema) | **1000** (§node§) |
| **Camadas com conteúdo** | 6 | 6 |
**Leituras:** (1) **a reconstrução** é onde **a ordem importa**: **~8,5x** mais rápida; **em CI**, **menos minutos por PR** (**C5.5**); (2) **o tamanho** caiu **~95 MB** (**devDependencies** e **cache do npm** fora); (3) **o número de camadas não mudou**: **camadas não são o problema**, **o que está nelas** é; (4) **mais ganhos:** **imagem base menor** (§alpine§, **distroless**, §node:slim§), **§--mount=type=cache§** para o npm, **registro com cache remoto** (§--cache-from§): **não executados**. **Ressalva:** **uma máquina, uma execução**, rede variável.

### Usuário não root, diretórios e permissões
§USER 1000:1000§ (**numérico**: o **hadolint (DL3066)** pede **UID numérico** para **ser resolvível pelo host/Kubernetes** com §runAsNonRoot§). **Arquivos** da aplicação com §--chown§; **escritas** só em **volumes/tmpfs** (§/tmp§): o Compose do laboratório usa **§read_only: true§**: **qualquer escrita em §/app§** falha ("**Read-only file system**"). **Portas** **> 1024** (**não root não abre portas baixas** sem capacidade).

### HEALTHCHECK e sinais
- **HEALTHCHECK** (**forma JSON**: **§CMD ["wget", ...]§**, **sem shell**): o Docker marca o contêiner **§healthy§/§unhealthy§** (**o Compose usa** para §depends_on§ e o **orquestrador decide** reinício; **no Kubernetes** usam-se **probes** — aula dk-04 e dk-06);
- **PID 1 e sinais:** o processo **PID 1** recebe §SIGTERM§ do §docker stop§; a **aplicação deve tratá-lo** (**fechar servidor e conexões**: §server.close()§, como no app do laboratório) **ou** o Docker **mata** após **10 s** (**§SIGKILL§**). **Use a forma exec** (§CMD ["node", "server.mjs"]§), **não** a **forma shell** (§CMD node server.mjs§: o **shell vira PID 1** e **não repassa** sinais); **§--init§/tini** ajuda quando **há processos filhos**.

### .dockerignore
**Exclua** §node_modules§ (**o contêiner instala o seu**), §.git§, **segredos** (§.env§), **logs**, **documentação**, **arquivos de teste** quando não necessários: **contexto menor** (**envio rápido**), **cache mais estável** (**menos invalidações**) e **menos risco de vazar segredos** na imagem.

### O hadolint: o que ele acha (e o que não)
O **hadolint** (**2.15.1**) **analisa o Dockerfile** com **regras** (DLxxxx) **e** **ShellCheck** para os §RUN§. **Medido:**
| Arquivo | Resultado |
|---|---|
| **§Dockerfile.ingenuo§** | **passou** (exit 0), **embora rode como root, instale devDependencies e invalide o cache** |
| **§Dockerfile§ (otimizado, 1ª versão)** | **DL3066** (usuário §node§ **não numérico**) e **DL3025** (§HEALTHCHECK CMD§ com **§|| exit 1§** **fora da forma JSON**) |
| **§Dockerfile§ (corrigido)** | **passou** (exit 0) |
**Lição:** **lint encontra padrões conhecidos**, **não "qualidade"**: **o ruim passou e o bom foi advertido**. **Use** o lint **como rede de proteção** **e** **revise** (**usuário, ordem, tamanho, segredos**); **ferramentas** de **varredura de imagem** (Trivy, Docker Scout) **e** de **política** (OPA/Conftest) **complementam** (**não executadas**).

### Segredos e builds reprodutíveis
- **Nunca** coloque **segredos** em §ENV§, §ARG§ ou §COPY§: **ficam no histórico** (§docker history§). Use **§RUN --mount=type=secret§** (**só durante o passo**) e **segredos em tempo de execução** (**variáveis injetadas, arquivos montados, gerenciador de segredos**: aula dk-06);
- **Fixe versões** (**imagem base por digest**, **dependências por lockfile**): **reproduzibilidade**; **atualize** **com PRs** (**Dependabot/Renovate**);
- **Multi-plataforma** (§buildx --platform linux/amd64,linux/arm64§): **não executado**; **SBOM** e **assinatura** (cosign): **não executados**.

### Imagens mínimas
**Alpine** (musl: **atenção** a **bibliotecas nativas** que **esperam glibc**), **slim** (Debian reduzido), **distroless** (**sem shell** nem gerenciador de pacotes: **superfície mínima**; **depuração** via **contêiner efêmero** de depuração) e **§scratch§** (binários **estáticos**: Go/Rust). **Trade-off:** **menos pacotes** = **menos CVEs** **e** **menos ferramentas** para **diagnosticar**.

### Checklist de Dockerfile
1. **Base** oficial, **pequena** e **fixada**; 2. **Manifestos primeiro**, **código depois**; 3. **§npm ci --omit=dev§** (ou equivalente); 4. **multi-estágio**; 5. **usuário numérico não root**; 6. **HEALTHCHECK** em **forma JSON**; 7. **CMD em forma exec** e **tratamento de SIGTERM**; 8. **§.dockerignore§**; 9. **sem segredos** em camadas; 10. **hadolint** no CI.`,
  concepts: [
    { term: 'Camada de imagem', def: 'Alteração do sistema de arquivos gerada por uma instrução do Dockerfile, armazenada e reaproveitada em cache.' },
    { term: 'Build multi-estágio', def: 'Dockerfile com vários FROM em que apenas os artefatos necessários passam para a imagem final.' },
    { term: 'Cache de build', def: 'Reaproveitamento de camadas cujas instruções e entradas não mudaram desde a construção anterior.' },
    { term: '.dockerignore', def: 'Arquivo que lista o que não deve ser enviado ao contexto de build.' },
    { term: 'HEALTHCHECK', def: 'Instrução que define um comando periódico para marcar o contêiner como saudável ou não.' },
    { term: 'Forma exec', def: 'Forma JSON de CMD/ENTRYPOINT que executa o processo diretamente como PID 1, sem shell.' },
    { term: 'npm ci', def: 'Instalação reprodutível que segue exatamente o package-lock.json e falha se houver divergência.' }
  ],
  examples: R`**Analogia:** o Dockerfile é uma **receita em camadas de bolo**: se você troca o **recheio da primeira camada** (dependências), **precisa refazer todas as de cima**; por isso **o que muda menos** (manifestos) vai **embaixo** e **o que muda toda hora** (código) **em cima**.

**Exemplo 1: cache.** Alterar só o server.mjs: 29,1 s no ingênuo contra 3,4 s no otimizado.

**Exemplo 2: lint.** O hadolint passou o Dockerfile que roda como root e acusou o que roda como usuário 1000, até corrigirmos a forma do HEALTHCHECK e o UID.

**Exemplo 3: usuário.** Com read_only e usuário 1000, escrever em /app falha e /tmp continua gravável.`,
  code: [
    { title: 'Dockerfile otimizado: multi-estágio, cache, usuário numérico e HEALTHCHECK (hadolint 2.15.1 sem achados)', lang: 'dockerfile', code: R`# syntax=docker/dockerfile:1
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:26-alpine AS final
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node server.mjs package.json ./
USER 1000:1000
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD ["wget", "-qO-", "http://127.0.0.1:3000/saude"]
CMD ["node", "server.mjs"]`, notes: [{ l: '4', t: 'Só os manifestos entram antes: a instalação fica em cache enquanto não mudam.' }, { l: '13', t: 'USER numérico e HEALTHCHECK em forma JSON satisfazem DL3066 e DL3025.' }] },
    { title: 'Medir o efeito do cache e do tamanho (shell; resultados medidos)', lang: 'bash', code: R`docker build --no-cache -f Dockerfile.ingenuo -t lab-ingenuo app     # 39,1 s
docker build --no-cache -f Dockerfile -t lab-otimizado app           # 20,6 s

echo "// alteração" >> app/server.mjs                                  # muda só o código
docker build -f Dockerfile.ingenuo -t lab-ingenuo app                # 29,1 s (reinstala as dependências)
docker build -f Dockerfile -t lab-otimizado app                      # 3,4 s  (reaproveita a camada de dependências)

docker images --format '{{.Repository}} {{.Size}}' | grep '^lab-'    # lab-ingenuo 355MB | lab-otimizado 260MB
docker run --rm --entrypoint id lab-otimizado                        # uid=1000(node)
docker run --rm -i hadolint/hadolint hadolint - < app/Dockerfile     # exit 0`, notes: [{ l: '4', t: 'COPY . . antes do install invalida o cache a cada mudança de código.' }, { l: '9', t: 'O lint deve rodar no CI, como rede de proteção.' }] },
    { title: 'Segredos em builds: o jeito errado e o certo (Dockerfile; conceitual, não executado nesta aula)', lang: 'dockerfile', code: R`# ERRADO: o token fica gravado no histórico da imagem (docker history)
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && npm ci && rm .npmrc

# CERTO: o segredo existe só durante o passo e não vai para nenhuma camada
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci --omit=dev
# docker build --secret id=npmrc,src=$HOME/.npmrc -t app .`, notes: [{ l: '2', t: 'Mesmo apagando o arquivo depois, a camada anterior guarda o valor.' }, { l: '6', t: 'O segredo é montado temporariamente e não é persistido.' }] }
  ],
  bestPractices: ['Coloque primeiro o que muda menos (manifestos e instalação) e depois o código para aproveitar o cache.', 'Use npm ci --omit=dev, multi-estágio e uma base pequena fixada por versão ou digest.', 'Rode como usuário numérico não root, com HEALTHCHECK em forma JSON e CMD em forma exec.', 'Trate SIGTERM na aplicação para desligar graciosamente.', 'Use .dockerignore para reduzir o contexto e evitar vazar segredos.', 'Nunca coloque segredos em ENV, ARG ou COPY; use mounts de segredo ou injeção em execução.', 'Use hadolint e uma varredura de imagem no CI, mas revise manualmente: o lint não pega tudo.'],
  mistakes: ['COPY . . antes de instalar as dependências.', 'Instalar devDependencies e ferramentas de build na imagem final.', 'Rodar como root.', 'CMD em forma shell que impede o repasse de sinais.', 'Segredos em camadas da imagem.', 'Confiar no lint como prova de qualidade.'],
  market: R`**Escrever Dockerfiles enxutos, rápidos e seguros** é **requisito básico** de **backend e DevOps**; **cache de camadas** e **multi-estágio** são **perguntas frequentes** de entrevista.`,
  summary: R`O build reaproveita camadas enquanto a instrução e suas entradas não mudam; ordene do que muda menos ao que muda mais. Medido: o Dockerfile ingênuo (COPY . . antes do install, root, devDependencies) gerou 355 MB e levou 29,1 s para reconstruir após mudar só o código; o otimizado (multi-estágio, npm ci --omit=dev, usuário 1000) gerou 260 MB e reconstruiu em 3,4 s. O hadolint passou o ingênuo e acusou o otimizado (DL3066 e DL3025, corrigidos): lint não mede qualidade. Use usuário não root, HEALTHCHECK em forma JSON, CMD em forma exec, .dockerignore e segredos por mount; varreduras e multi-plataforma não foram executadas.`,
  refs: [REF.dockerBest, REF.dockerMulti, REF.dockerCache, REF.hadolint, REF.dockerSecurity],
  cards: [
    { q: 'Por que copiar package.json antes do código?', a: 'A camada de instalação só é reconstruída quando as dependências mudam; mudanças de código invalidam apenas as camadas seguintes.' },
    { q: 'Quanto o cache melhorou a reconstrução no laboratório?', a: 'De 29,1 s (ingênuo) para 3,4 s (otimizado) ao alterar apenas o server.mjs (~8,5x).' },
    { q: 'O que o hadolint mostrou sobre os dois Dockerfiles?', a: 'Passou o ingênuo (root e devDependencies) e acusou o otimizado (DL3066 e DL3025); lint não mede qualidade.' },
    { q: 'Por que usar CMD em forma exec?', a: 'O processo vira PID 1 e recebe SIGTERM; na forma shell, o shell é o PID 1 e não repassa os sinais.' }
  ]
}
];
