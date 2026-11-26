// C6.1 — Docker, Compose e Kubernetes. Aulas 3 e 4 (Docker Compose; Kubernetes: pods, deployments e services).
import { REF } from './c61-a.mjs';
const R = String.raw;

export const REF2 = {
  composeDocs: { title: 'Docker — Compose overview', url: 'https://docs.docker.com/compose/', kind: 'doc' },
  composeStartup: { title: 'Docker Compose — Control startup and shutdown order', url: 'https://docs.docker.com/compose/how-tos/startup-order/', kind: 'doc' },
  composeFile: { title: 'Compose Specification', url: 'https://docs.docker.com/reference/compose-file/', kind: 'especificação' },
  k8sPods: { title: 'Kubernetes — Pods', url: 'https://kubernetes.io/docs/concepts/workloads/pods/', kind: 'doc' },
  k8sDeployments: { title: 'Kubernetes — Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/', kind: 'doc' },
  k8sServices: { title: 'Kubernetes — Service', url: 'https://kubernetes.io/docs/concepts/services-networking/service/', kind: 'doc' },
  k8sProbes: { title: 'Kubernetes — Liveness, readiness and startup probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/', kind: 'doc' },
  k8sConcepts: { title: 'Kubernetes — Concepts overview', url: 'https://kubernetes.io/docs/concepts/overview/', kind: 'doc' },
  kubeconform: { title: 'kubeconform — Kubernetes manifest validator', url: 'https://github.com/yannh/kubeconform', kind: 'ferramenta' }
};

export const lessonsB = [
{
  id: 'dk-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['Docker Compose', 'healthcheck', 'depends_on', 'volumes', 'redes', 'endurecimento'],
  title: 'Docker Compose: aplicação, banco e cache em um arquivo, com healthchecks, persistência e endurecimento',
  objectives: ['Descrever uma aplicação multi-serviço em compose.yaml (serviços, redes, volumes, variáveis)', 'Usar healthchecks e depends_on com service_healthy para ordenar a inicialização', 'Verificar a persistência de dados com volumes (down x down -v)', 'Aplicar endurecimento (usuário, somente leitura, capacidades, limites de memória)', 'Distinguir liveness de readiness e testar a falha de uma dependência', 'Reconhecer limites do Compose (um host) e quando migrar para um orquestrador'],
  intro: R`O **Docker Compose** descreve **vários contêineres** (aplicação, banco, cache) **em um arquivo** e os **sobe, liga e derruba** com um comando. É a ferramenta de **desenvolvimento local, CI e implantações pequenas em um host**. No laboratório, **§docker compose up -d --wait§** deixou **app + PostgreSQL 17 + Redis 8 saudáveis em 11,2 s**; **3 visitas** foram gravadas no **Redis e no banco**; **§down§ manteve os dados (3)** e **§down -v§ os apagou (0)**; e **parar o banco** revelou **um defeito real**: a **aplicação caiu** (erro não tratado do pool) até **tratarmos o evento §error§**, quando a **readiness passou a devolver 503** e a **liveness continuou 200**.`,
  theory: R`### O arquivo compose.yaml
Elementos principais (**Compose Specification**):
- **§services§**: cada **serviço** vira **um ou mais contêineres** (§image§ **ou** §build§);
- **§environment§**/**§env_file§**: **configuração** (**12 fatores**); **segredos de teste** no laboratório (**em produção: gerenciador de segredos**, aula dk-06);
- **§ports§**: **publicação** (§"127.0.0.1:38080:3000"§: **só o localhost**: **evite §"3000:3000"§ em máquinas expostas**);
- **§volumes§**: **dados persistentes** (§dados-db:/var/lib/postgresql/data§) e **bind mounts**;
- **§networks§**: por padrão **uma rede por projeto** com **DNS por nome do serviço** (**a aplicação acessa §db§ e §cache§ pelo nome**: §postgres://app:...@db:5432/app§);
- **§healthcheck§**, **§depends_on§**, **§restart§**, **limites** (§mem_limit§, §cpus§), **perfis** (§profiles§) e **sobreposição** (§-f§ **vários arquivos** para dev/produção).
**Comandos:** §docker compose up -d --wait§ (**sobe e espera** a **saúde**), §ps§, §logs -f§, §exec§, §stop/start§, §down§ (**remove** contêineres e redes), §down -v§ (**e volumes**), §config -q§ (**valida** o arquivo), §up -d --build§.

### Ordem de inicialização: depends_on não basta
**§depends_on§ simples** só garante **a ordem de início** (**o contêiner** do banco **iniciou**), **não** que **o banco esteja pronto**. A forma correta usa **healthcheck** + **condition**:
§§§
db:    healthcheck: { test: ["CMD-SHELL", "pg_isready -U app -d app"], interval: 3s, timeout: 3s, retries: 10 }
app:   depends_on: { db: { condition: service_healthy }, cache: { condition: service_healthy } }
§§§
**Medido:** os três serviços ficaram **§healthy§ em 11,2 s** (**o banco** é o mais lento a **inicializar** o primeiro cluster). **Mesmo assim**, **a aplicação deve tolerar** dependências **indisponíveis em execução** (**o banco reinicia, a rede falha**): **ordem de inicialização não substitui resiliência** (**retry**, **reconexão**, **readiness**).

### Persistência: volumes e o perigo do §down -v§
**Medido:** após **3 visitas**, §docker compose down§ (**sem §-v§**) e novo §up§: **§{"banco":3}§**: **o volume nomeado sobreviveu**. Com **§down -v§** e novo §up§: **§{"banco":0}§**: **dados apagados**. **Regras:** **dados** **sempre** em **volume** (ou serviço gerenciado); **§down -v§** é **destrutivo**: **use só em desenvolvimento/testes**; **backups** do volume (**§pg_dump§**, **snapshots**) **são responsabilidade sua** (**C3**).

### Liveness x readiness e o defeito real
O app expõe **§/saude§** (***liveness***: **"o processo está vivo"**, **independe** de dependências) e **§/pronto§** (***readiness***: **"posso receber tráfego"**: **testa banco e Redis**). **Experimento** (**parar o banco com a app no ar**):
1. **Antes da correção:** a **app caiu** (§restart: unless-stopped§ a **reiniciou**: **reinícios: 1**): o log mostrou **§Unhandled 'error' event§** / **§terminating connection due to administrator command§**. **Causa:** o **pool do §pg§** emite **§error§** quando **uma conexão ociosa** é **derrubada**; **sem ouvinte** (§db.on('error', ...)§), o Node **trata como exceção não capturada** e **encerra** o processo (**regra do §EventEmitter§: aula pat-03**). **Mesma coisa** para o **Redis** (§redis.on('error')§);
2. **Depois da correção:** **0 reinícios**; **§/pronto§ → HTTP 503** (**readiness falha**: **um balanceador/orquestrador tiraria a instância do tráfego**); **§/saude§ → HTTP 200** (**não reiniciar**: **o processo está bem**); ao **religar o banco**, **§/pronto§ voltou a 200 em ~2 s**.
**Por que separar:** **reiniciar** a app **porque o banco caiu** **não ajuda** (e **pode agravar**: **tempestade de reconexões**); **tirar do tráfego** **ajuda**. **Esse é o desenho que o Kubernetes usa** (probes: aulas dk-04 e dk-06).

### Endurecimento (o que o laboratório aplicou)
No serviço §app§: §read_only: true§ + §tmpfs: ["/tmp"]§ (**medido:** **§touch /app/x§ → "Read-only file system"** e **§/tmp§ gravável**), §cap_drop: ["ALL"]§, §security_opt: ["no-new-privileges:true"]§, **usuário 1000** (herdado da imagem), §mem_limit: 256m§, **porta só em 127.0.0.1**. **No banco/cache:** **imagens oficiais** (**já rodam como usuários próprios**), **sem portas publicadas** (**acessíveis só pela rede interna do Compose**): **não exponha** bancos ao host sem necessidade.

### Desenvolvimento x produção com Compose
- **Dev:** **bind mounts** do código, **§watch§** (**sincroniza arquivos**), **portas abertas**, **dados de teste**;
- **CI:** §compose up --wait§ + **testes de integração** (**C5.4**) + §down -v§;
- **Produção pequena** (**um host**): **possível**, **com** **imagem versionada**, **segredos fora do arquivo**, **backups**, **monitoramento**, **reinício automático**, **atualizações** **com** **janela de indisponibilidade** (**Compose não faz rollout gradual** nem **balanceamento** entre hosts).
**Quando migrar para Kubernetes/orquestrador:** **mais de um host**, **alta disponibilidade**, **rollouts sem indisponibilidade**, **autoescalonamento**, **descoberta de serviços** entre **muitos times**; **custo:** **complexidade** (aulas dk-04 a dk-06). **Alternativas gerenciadas:** **ECS/Cloud Run/App Service** (C6.4).

### Armadilhas
- **§depends_on§ sem healthcheck** (**ordem ≠ prontidão**);
- **Sem tratamento de erro** em **clientes de banco/cache** (**o defeito do laboratório**);
- **Portas publicadas em §0.0.0.0§** (**bancos expostos**);
- **Segredos** no §compose.yaml§ **versionado** (**o laboratório usa valores de teste**; **em produção, **não**);
- **§down -v§** sem querer;
- **Imagem §latest§** (**versões fixas**: dk-02);
- **Confundir** contêiner **saudável** com **aplicação correta**.

### Limites desta aula
**Executado:** Compose v5.7.1 com **PostgreSQL 17**, **Redis 8** e a app do laboratório. **Não executados:** **§compose watch§**, **Swarm**, **perfis**, **múltiplos arquivos**, **secrets do Compose**, **GPUs**, **implantação remota** (§docker context§).`,
  concepts: [
    { term: 'Docker Compose', def: 'Ferramenta que descreve e executa aplicações multi-contêiner a partir de um arquivo declarativo.' },
    { term: 'depends_on', def: 'Opção do Compose que ordena a inicialização de serviços e, com condition, espera um estado (como service_healthy).' },
    { term: 'Healthcheck', def: 'Comando periódico que determina se um contêiner está saudável.' },
    { term: 'Liveness', def: 'Verificação de que o processo está vivo; sua falha costuma levar a um reinício.' },
    { term: 'Readiness', def: 'Verificação de que a instância pode receber tráfego; sua falha a retira do balanceamento sem reiniciá-la.' },
    { term: 'Volume nomeado', def: 'Armazenamento gerenciado pelo Docker que sobrevive à remoção do contêiner e só é apagado com down -v.' },
    { term: 'Rede do projeto', def: 'Rede criada pelo Compose com DNS por nome de serviço entre os contêineres.' }
  ],
  examples: R`**Analogia:** o Compose é o **roteiro de montagem de um palco**: lista **cenário, atores e adereços** (serviços), **como se ligam** (rede) e **o que fica guardado entre os espetáculos** (volumes); mas ele **monta um palco só**. Para **uma turnê** (vários hosts), é preciso uma **produtora** (orquestrador).

**Exemplo 1: persistência.** down mantém os 3 registros; down -v os apaga.

**Exemplo 2: falha real.** Parar o banco derrubou a app por falta de ouvinte de erro do pool; corrigido, a readiness passou a 503 e a liveness ficou em 200.

**Exemplo 3: endurecimento.** read_only e cap_drop ALL: escrever em /app falha e /tmp (tmpfs) funciona.`,
  code: [
    { title: 'compose.yaml com healthchecks, depends_on, volume e endurecimento (validado e executado)', lang: 'yaml', code: R`name: labdk
services:
  app:
    build: ./app
    image: lab-otimizado
    environment:
      DATABASE_URL: postgres://app:segredo-de-teste@db:5432/app
      REDIS_URL: redis://cache:6379
    ports: ["127.0.0.1:38080:3000"]
    depends_on:
      db: { condition: service_healthy }
      cache: { condition: service_healthy }
    restart: unless-stopped
    mem_limit: 256m
    read_only: true
    tmpfs: ["/tmp"]
    cap_drop: ["ALL"]
    security_opt: ["no-new-privileges:true"]
  db:
    image: postgres:17
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: segredo-de-teste, POSTGRES_DB: app }
    volumes: ["dados-db:/var/lib/postgresql/data"]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U app -d app"], interval: 3s, timeout: 3s, retries: 10 }
  cache:
    image: redis:8
    healthcheck: { test: ["CMD", "redis-cli", "ping"], interval: 3s, timeout: 3s, retries: 10 }
volumes:
  dados-db:`, notes: [{ l: '10', t: 'Publicada só em 127.0.0.1: o banco e o cache não têm portas no host.' }, { l: '12', t: 'service_healthy espera o healthcheck, não apenas o início do contêiner.' }] },
    { title: 'Tratar erros de conexões ociosas e separar liveness de readiness (JavaScript, pg e ioredis; testado)', lang: 'js', code: R`const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
db.on('error', (e) => console.error('erro no pool do banco (a aplicação segue de pé):', e.message));   // sem isto o processo cai
const redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
redis.on('error', () => {});

app.get('/saude', (req, res) => res.json({ ok: true }));                       // liveness: independe de dependências
app.get('/pronto', async (req, res) => {                                        // readiness: testa dependências
  try { await db.query('select 1'); await redis.ping(); res.json({ pronto: true }); }
  catch (e) { res.status(503).json({ pronto: false, motivo: e.message.slice(0, 80) }); }
});
// banco parado: /pronto 503 e /saude 200 (0 reinícios); banco de volta: /pronto 200 em ~2 s`, notes: [{ l: '2', t: 'O pool do pg emite error quando uma conexão ociosa é derrubada.' }, { l: '7', t: 'Readiness devolve 503 para tirar a instância do tráfego sem reiniciá-la.' }] },
    { title: 'Experimento de persistência e de falha de dependência (shell; resultados medidos)', lang: 'bash', code: R`docker compose up -d --wait                  # 11,2 s até tudo saudável
for i in 1 2 3; do curl -s -X POST localhost:38080/visitas; done      # {"cache":1} {"cache":2} {"cache":3}
curl -s localhost:38080/visitas                                       # {"banco":3}

docker compose down && docker compose up -d --wait; curl -s localhost:38080/visitas      # {"banco":3}  (volume mantido)
docker compose down -v && docker compose up -d --wait; curl -s localhost:38080/visitas   # {"banco":0}  (volume apagado)

docker compose stop db
curl -s -o /dev/null -w "%{http_code}\n" localhost:38080/pronto       # 503
curl -s -o /dev/null -w "%{http_code}\n" localhost:38080/saude        # 200`, notes: [{ l: '5', t: 'down sem -v preserva o volume nomeado.' }, { l: '8', t: 'Com o banco parado a aplicação continua viva, mas não pronta.' }] }
  ],
  bestPractices: ['Use healthcheck + depends_on com service_healthy, e ainda assim faça a aplicação tolerar dependências que caem.', 'Trate os eventos de erro de pools e clientes (pg, Redis) para que uma conexão ociosa derrubada não encerre o processo.', 'Separe liveness (processo vivo) de readiness (pronto para tráfego).', 'Guarde dados em volumes, faça backups e use down -v apenas em desenvolvimento e testes.', 'Publique portas só em 127.0.0.1 quando possível e não exponha bancos.', 'Endureça o serviço: usuário não root, read_only, cap_drop ALL, no-new-privileges e limites de memória.', 'Mantenha segredos fora do arquivo versionado e fixe versões de imagens.'],
  mistakes: ['depends_on sem healthcheck, esperando que o banco esteja pronto.', 'Cliente de banco sem tratamento de error, derrubando o processo.', 'Usar a mesma verificação para liveness e readiness.', 'Executar down -v por engano e perder dados.', 'Publicar o banco em 0.0.0.0.', 'Segredos reais no compose.yaml versionado.'],
  market: R`**Compose** é **onipresente** em **desenvolvimento e CI**; **saber separar liveness/readiness e proteger dados** mostra **maturidade operacional** antes mesmo de chegar ao Kubernetes.`,
  summary: R`O Compose descreve aplicações multi-contêiner em um arquivo, com rede por projeto, volumes e healthchecks; depends_on só ordena o início, e service_healthy espera a saúde. Medido (Compose v5.7.1, PostgreSQL 17, Redis 8): tudo saudável em 11,2 s; down manteve os 3 registros e down -v os apagou; endurecimento com usuário 1000, /app somente leitura e /tmp gravável. Achado: parar o banco derrubou a aplicação por falta de tratamento do evento error do pool; corrigido, a readiness devolveu 503, a liveness 200, 0 reinícios e recuperação em ~2 s. O Compose atende um host; Swarm, watch, perfis e secrets do Compose não foram executados.`,
  refs: [REF2.composeDocs, REF2.composeStartup, REF2.composeFile, REF2.k8sProbes, REF.twelveFactor],
  cards: [
    { q: 'Por que depends_on simples não basta?', a: 'Só ordena o início dos contêineres; com healthcheck e condition service_healthy a aplicação espera o banco estar de fato pronto.' },
    { q: 'O que o experimento down x down -v mostrou?', a: 'down manteve os 3 registros (volume nomeado preservado) e down -v os apagou (0).' },
    { q: 'Por que a aplicação do laboratório caiu ao parar o banco?', a: 'O pool do pg emitiu error sem ouvinte, o que o Node trata como exceção não capturada; com db.on("error") ela seguiu de pé.' },
    { q: 'Qual a diferença entre liveness e readiness?', a: 'Liveness diz se o processo está vivo (falha pode reiniciar); readiness diz se pode receber tráfego (falha só retira do balanceamento).' }
  ]
},
{
  id: 'dk-04', moduleId: 'm2', order: 4, minutes: 85, tags: ['Kubernetes', 'pods', 'deployments', 'services', 'ReplicaSet', 'rolling update', 'kubeconform', 'labels'],
  title: 'Kubernetes: pods, deployments e services, com manifestos declarativos validados estaticamente',
  objectives: ['Descrever a arquitetura do Kubernetes (plano de controle e nós) e o modelo declarativo de reconciliação', 'Escrever manifestos de Deployment, Service, ConfigMap e Ingress com labels e selectors corretos', 'Explicar pods, ReplicaSets e o rolling update (maxSurge e maxUnavailable)', 'Escolher o tipo de Service (ClusterIP, NodePort, LoadBalancer) e entender o DNS interno', 'Usar probes (startup, liveness, readiness) com os endpoints do laboratório', 'Validar manifestos com o kubeconform e conhecer os limites da validação de esquema'],
  intro: R`O **Kubernetes (K8s)** **orquestra contêineres em vários hosts**: você **declara o estado desejado** (**"3 réplicas desta imagem, expostas por este serviço"**) e **controladores** **reconciliam** **continuamente** o **estado real** com o desejado (**reiniciam**, **replicam**, **substituem**). **Neste ambiente não há cluster**: os manifestos do laboratório foram **validados estaticamente** com o **kubeconform 0.8.0** (esquemas do **K8s 1.34.0**, modo estrito): **6 recursos válidos** (§ConfigMap§, §Deployment§, §Service§, §HPA§, §PDB§, §Ingress§) e **um arquivo defeituoso recusado**, com um **achado**: um §protocol: TCPP§ inválido **passou** no esquema. **Nada foi aplicado a um cluster.**`,
  theory: R`### Arquitetura em uma página
- **Plano de controle:** **§kube-apiserver§** (**API REST** única porta de entrada), **§etcd§** (**armazenamento** do estado), **§kube-scheduler§** (**escolhe o nó** de cada pod), **§kube-controller-manager§** (**controladores** de reconciliação), **§cloud-controller-manager§**;
- **Nós de trabalho:** **§kubelet§** (**executa e vigia pods**), **runtime de contêiner** (containerd), **§kube-proxy§** (**regras de rede dos Services**);
- **Modelo declarativo:** você envia **YAML** à API (§kubectl apply -f§); **controladores** **observam** (***watch***) e **agem** até **estado real = desejado** (**laço de reconciliação**). **Idempotente e auto-reparador:** **mate um pod e o Deployment cria outro**.
**Objetos** têm §apiVersion§, §kind§, §metadata§ (**nome, namespace, labels, annotations**), §spec§ (**desejado**) e §status§ (**observado**, **preenchido pelo cluster**).

### Pod: a menor unidade
**Pod** = **um ou mais contêineres** que **compartilham rede (um IP), volumes e ciclo de vida** e **rodam no mesmo nó**. **Normalmente 1 contêiner por pod** (**sidecars** quando **necessário**: proxy, coleta de logs). **Pods são efêmeros** (**IP muda** quando **recriados**): **nunca** dependa do **IP de um pod**; use **Services**. **Não crie pods "soltos"** em produção: **use controladores** (Deployment, StatefulSet, Job).

### Deployment e ReplicaSet
**Deployment** gerencia **aplicações sem estado**: cria **ReplicaSets** (**um por versão do template de pod**), mantém **N réplicas** e faz **atualizações graduais**. **No laboratório** (§k8s/app.yaml§): §replicas: 3§, §revisionHistoryLimit: 5§ (**guardar 5 versões para rollback**), §selector.matchLabels: { app: pedidos }§ **(deve casar com os labels do template)**.
**Estratégia §RollingUpdate§:** §maxSurge: 1§ (**até 1 pod a mais** durante a troca) e §maxUnavailable: 0§ (**nenhum pod** a menos **que o desejado**): **sem perda de capacidade**; **pods novos** só **recebem tráfego quando prontos** (**readiness**); **os antigos** são **removidos** gradualmente. **Rollback:** §kubectl rollout undo deployment/pedidos§ (**volta ao ReplicaSet anterior**); **acompanhar:** §kubectl rollout status§. **Alternativa:** §Recreate§ (**derruba tudo e sobe**: **indisponibilidade**).
**Outros controladores:** **StatefulSet** (**identidade estável e volumes** por réplica: **bancos**), **DaemonSet** (**um pod por nó**: agentes), **Job/CronJob** (**tarefas** finitas/periódicas), **HPA** (**escalonamento horizontal**, aula dk-06).

### Labels e selectors
**Labels** (**pares chave-valor**) **ligam** objetos: o **Deployment** seleciona **seus pods** por §app: pedidos§; o **Service** seleciona **pods** pelo **mesmo label**. **Erro clássico:** **selector do Service ≠ labels dos pods** → **Service sem endpoints** (**tráfego não chega**). **Convenções** (§app.kubernetes.io/name§, §instance§, §version§: **usadas no chart Helm** da aula dk-05).

### Service: nome e endereço estáveis
**Service** dá **IP virtual estável + nome DNS** (§pedidos.default.svc.cluster.local§, **ou só §pedidos§ no mesmo namespace**) e **balanceia** entre **pods prontos** (**endpoints**). **Tipos:** **§ClusterIP§** (**padrão**: **só dentro do cluster**), **§NodePort§** (**porta em cada nó**), **§LoadBalancer§** (**balanceador da nuvem**), **§ExternalName§** (**alias DNS**); **headless** (§clusterIP: None§) para **StatefulSets**. **No laboratório:** §port: 80§ → §targetPort: http§ (**nome da porta do contêiner**: §http§ = 3000): **desacopla** o **número** da **porta** do **contêiner**.
**Ingress** (**+ controlador**, ex.: **ingress-nginx**) expõe **HTTP(S)** **por host/caminho** (§pedidos.exemplo.com§ → Service §pedidos§) com **TLS** (§secretName: pedidos-tls§: aula C6.3). **A Gateway API** é **a evolução** do Ingress.

### Configuração e segredos
**ConfigMap** (**configuração não sensível**: §APP_VERSION§, §REDIS_URL§) via §envFrom§ ou volume; **Secret** (**dados sensíveis**: §DATABASE_URL§ via §secretKeyRef§). **Atenção:** **Secrets são só *codificados* em base64** (**não criptografados** por padrão: **habilite criptografia em repouso** no etcd e/ou **use gerenciadores externos**: External Secrets, Vault, **cloud**) e **RBAC** **restritivo**: **o manifesto do laboratório referencia** §pedidos-db§ **sem incluí-lo** (**nunca versionar segredos**).

### Probes: liveness, readiness e startup
- **§startupProbe§**: **dá tempo** de **iniciar** (§/saude§, §periodSeconds: 2§, §failureThreshold: 15§ = **até 30 s**) **antes** das outras;
- **§livenessProbe§**: **falha repetida → o kubelet reinicia o contêiner** (§/saude§: **independe das dependências**, **como no laboratório do Compose**);
- **§readinessProbe§**: **falha → o pod sai dos endpoints do Service** (**sem reinício**) (§/pronto§: **verifica banco e Redis**).
**Lição do dk-03:** **liveness que depende do banco** → **tempestade de reinícios** quando **o banco cai**. **§terminationGracePeriodSeconds: 30§** + **§preStop sleep 5§** + **tratamento de SIGTERM** (dk-02) dão **desligamento gracioso** (**conexões em andamento terminam**; **o balanceador remove o pod antes**).

### Recursos e segurança do pod (resumo; aula dk-06 aprofunda)
**§resources.requests§** (**reserva para agendamento**) e **§limits§** (**teto**; **memória > limite → OOMKilled**, **como no laboratório do dk-01**); **§securityContext§** (§runAsNonRoot§, §allowPrivilegeEscalation: false§, §readOnlyRootFilesystem§, §capabilities.drop: ALL§, **seccomp RuntimeDefault**): **os mesmos princípios do Compose endurecido**.

### Validando manifestos com kubeconform (medido)
O **kubeconform** **valida** cada recurso **contra o JSON Schema** da **versão do K8s** (**1.34.0**), em **modo §-strict§** (**rejeita propriedades desconhecidas**). **Resultados do laboratório:**
| Arquivo | Resultado |
|---|---|
| §k8s/app.yaml§ (6 recursos) | **Valid: 6, Invalid: 0** |
| §k8s/invalido.yaml§ (Deployment + Service) | **Invalid: 1**: §containerPort: "80"§ (**texto**, **quer inteiro**) e §imagem§ (**propriedade desconhecida**); **o Service passou** |
**Lições:** (1) **pega erros de forma** (tipos, nomes de campos, indentação) **antes** do cluster; (2) **não valida semântica**: **o §protocol: TCPP§ do Service (**inválido**) **passou** (o esquema aceita **texto**; **o API server** **recusaria** ao **aplicar**); **selector sem pods**, **imagem inexistente**, **recursos insuficientes**, **probes erradas**: **só o cluster (ou **linters/políticas**: kube-linter, kube-score, OPA/Kyverno) pega**; (3) **CRDs** (recursos customizados) **exigem esquemas** adicionais; (4) **valide também** com **§kubectl apply --dry-run=server§** (**não executado**: **sem cluster**).

### kubectl essencial (não executado: sem cluster)
§kubectl apply -f app.yaml§, §get pods -o wide§, §describe pod X§, §logs X -f§, §exec -it X -- sh§, §port-forward svc/pedidos 8080:80§, §rollout status|undo§, §scale deployment/pedidos --replicas=5§, §top pods§, §get events --sort-by=.lastTimestamp§, §delete -f§. **Diagnóstico típico:** **§Pending§** (**sem recursos/afinidade**), **§ImagePullBackOff§** (**imagem/credenciais**), **§CrashLoopBackOff§** (**app cai**: **ver §logs --previous§**), **§OOMKilled§** (**limite de memória**), **Service sem endpoints** (**labels/readiness**).

### Kubernetes local e gerenciado
**Local:** **kind**, **minikube**, **k3d/k3s**, **Docker Desktop**: **não executados aqui** (**privilégios** e **tempo**: veja limites). **Gerenciado:** **EKS** (AWS), **AKS** (Azure), **GKE** (Google Cloud) (C6.4): **o plano de controle é do provedor**. **Quando não usar:** **uma aplicação simples** em **um host** (**Compose** ou **PaaS** bastam): **K8s tem custo** de **aprendizado e operação**.

### Limites desta aula
**Executado:** **validação estática** (kubeconform 0.8.0, K8s 1.34.0). **Não executado:** **qualquer aplicação em cluster** (**probes**, **rolling update**, **rollback**, **DNS**, **Ingress**): **são descrições** a partir da documentação.`,
  concepts: [
    { term: 'Pod', def: 'Menor unidade implantável do Kubernetes: um ou mais contêineres que compartilham rede e volumes no mesmo nó.' },
    { term: 'Deployment', def: 'Controlador que mantém um número de réplicas de pods sem estado e realiza atualizações graduais por ReplicaSets.' },
    { term: 'Service', def: 'Objeto que fornece um IP virtual e um nome DNS estáveis e balanceia o tráfego entre pods prontos.' },
    { term: 'Reconciliação', def: 'Laço em que controladores comparam o estado real com o desejado e agem para igualá-los.' },
    { term: 'Labels e selectors', def: 'Pares chave-valor e consultas que ligam objetos (um Service seleciona pods por label).' },
    { term: 'Rolling update', def: 'Atualização gradual que cria pods novos e remove os antigos respeitando maxSurge e maxUnavailable.' },
    { term: 'Probe', def: 'Verificação do kubelet (startup, liveness ou readiness) que decide início, reinício ou entrada no tráfego.' }
  ],
  examples: R`**Analogia:** o Kubernetes é um **gerente de restaurante com um quadro de metas**: você escreve "**3 cozinheiros no turno**" (estado desejado); se um **sai**, **ele chama outro**; e ao **trocar a receita**, **troca um cozinheiro por vez** (rolling update) **sem fechar a cozinha**. O **Service** é o **balcão de pedidos**, que **não muda** mesmo que **os cozinheiros mudem**.

**Exemplo 1: validação.** 6 recursos válidos e um arquivo com containerPort como texto e propriedade desconhecida, recusados.

**Exemplo 2: limite do esquema.** O protocol TCPP passou no kubeconform; só o API server o recusaria.

**Exemplo 3: probes.** startup dá até 30 s, liveness usa /saude e readiness usa /pronto.`,
  code: [
    { title: 'Deployment com rolling update, probes e segurança (YAML; validado com kubeconform 0.8.0, não aplicado a cluster)', lang: 'yaml', code: R`apiVersion: apps/v1
kind: Deployment
metadata: { name: pedidos, labels: { app: pedidos } }
spec:
  replicas: 3
  revisionHistoryLimit: 5
  selector: { matchLabels: { app: pedidos } }
  strategy: { type: RollingUpdate, rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } }
  template:
    metadata: { labels: { app: pedidos } }
    spec:
      terminationGracePeriodSeconds: 30
      securityContext: { runAsNonRoot: true, runAsUser: 1000, seccompProfile: { type: RuntimeDefault } }
      containers:
        - name: app
          image: registry.exemplo.com/pedidos:1.0.0
          ports: [{ name: http, containerPort: 3000 }]
          startupProbe: { httpGet: { path: /saude, port: http }, periodSeconds: 2, failureThreshold: 15 }
          livenessProbe: { httpGet: { path: /saude, port: http }, periodSeconds: 10, failureThreshold: 3 }
          readinessProbe: { httpGet: { path: /pronto, port: http }, periodSeconds: 5, failureThreshold: 2 }
          resources: { requests: { cpu: 100m, memory: 128Mi }, limits: { memory: 256Mi } }
          securityContext: { allowPrivilegeEscalation: false, readOnlyRootFilesystem: true, capabilities: { drop: ["ALL"] } }
          lifecycle: { preStop: { exec: { command: ["sleep", "5"] } } }`, notes: [{ l: '7', t: 'O selector deve casar com os labels do template, ou o Deployment é recusado.' }, { l: '18', t: 'Liveness em /saude e readiness em /pronto, como no laboratório do Compose.' }] },
    { title: 'Service, ConfigMap e Ingress ligados por labels e nomes de porta (YAML; validado)', lang: 'yaml', code: R`apiVersion: v1
kind: Service
metadata: { name: pedidos, labels: { app: pedidos } }
spec:
  selector: { app: pedidos }                       # tem de casar com os labels dos pods
  ports: [{ name: http, port: 80, targetPort: http }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: pedidos }
spec:
  ingressClassName: nginx
  tls: [{ hosts: [pedidos.exemplo.com], secretName: pedidos-tls }]
  rules:
    - host: pedidos.exemplo.com
      http: { paths: [{ path: /, pathType: Prefix, backend: { service: { name: pedidos, port: { name: http } } } }] }`, notes: [{ l: '5', t: 'Selector diferente dos labels = Service sem endpoints.' }, { l: '14', t: 'Backend aponta o Service pelo nome da porta (http).' }] },
    { title: 'Validar com kubeconform e o que ele não pega (shell; resultados medidos)', lang: 'bash', code: R`docker run --rm -v "$PWD/k8s:/k8s:ro" ghcr.io/yannh/kubeconform:latest \
  -strict -summary -kubernetes-version 1.34.0 /k8s/app.yaml
# Summary: 6 resources found in 1 file - Valid: 6, Invalid: 0, Errors: 0, Skipped: 0

docker run --rm -v "$PWD/k8s:/k8s:ro" ghcr.io/yannh/kubeconform:latest \
  -strict -summary -kubernetes-version 1.34.0 /k8s/invalido.yaml
# Deployment quebrado is invalid:
#   /spec/template/spec/containers/0/ports/0/containerPort: got string, want integer
#   /spec/template/spec/containers/0: additional properties 'imagem' not allowed
# Service com "protocol: TCPP" passou: o esquema não valida valores semânticos

# com um cluster (não executado aqui): kubectl apply --dry-run=server -f k8s/app.yaml`, notes: [{ l: '9', t: 'Validação de esquema não substitui o dry-run no servidor.' }, { l: '11', t: 'Sem cluster neste ambiente: execução em cluster não foi feita.' }] }
  ],
  bestPractices: ['Declare o estado desejado em manifestos versionados e aplique-os por pipeline.', 'Use Deployments (e não pods soltos) com maxUnavailable 0 e probes de startup, liveness e readiness corretas.', 'Mantenha labels e selectors consistentes e confira os endpoints do Service.', 'Separe configuração (ConfigMap) de segredos (Secret com criptografia em repouso e RBAC) e nunca versione segredos.', 'Defina requests e limits, usuário não root, filesystem somente leitura e capacidades removidas.', 'Valide com kubeconform no CI e complemente com dry-run no servidor, kube-linter e políticas.', 'Use Kubernetes apenas quando a escala e a disponibilidade justificarem o custo operacional.'],
  mistakes: ['Pods soltos em produção.', 'Selector do Service diferente dos labels dos pods.', 'Liveness que depende de banco e causa reinícios em cascata.', 'Segredos em manifestos versionados ou achar que base64 é criptografia.', 'Sem requests e limits.', 'Confiar só na validação de esquema.'],
  market: R`**Kubernetes** é **competência-chave** de **plataforma, SRE e backend sênior**; **entender o modelo declarativo, rolling update e probes** vale mais do que **decorar comandos kubectl**.`,
  summary: R`O Kubernetes reconcilia continuamente o estado real com o estado desejado declarado em manifestos: pods efêmeros, Deployments com ReplicaSets e rolling update (maxSurge 1, maxUnavailable 0), Services com IP e DNS estáveis ligados por labels, ConfigMaps e Secrets, e probes de startup, liveness (/saude) e readiness (/pronto). Medido: o kubeconform 0.8.0 (K8s 1.34.0, estrito) validou 6 recursos, recusou um arquivo com containerPort como texto e propriedade desconhecida e deixou passar um protocol TCPP: a validação de esquema não é semântica. Nenhum recurso foi aplicado a um cluster.`,
  refs: [REF2.k8sConcepts, REF2.k8sPods, REF2.k8sDeployments, REF2.k8sServices, REF2.k8sProbes, REF2.kubeconform],
  cards: [
    { q: 'O que significa o modelo declarativo do Kubernetes?', a: 'Você declara o estado desejado e controladores reconciliam o estado real com ele continuamente, recriando pods quando necessário.' },
    { q: 'Para que servem maxSurge e maxUnavailable?', a: 'Controlam o rolling update: quantos pods a mais e quantos a menos que o desejado podem existir durante a troca (laboratório: 1 e 0).' },
    { q: 'O que o kubeconform não detectou no laboratório?', a: 'O protocol TCPP inválido do Service: o esquema não valida valores semânticos; o API server o recusaria.' },
    { q: 'Por que usar Services e não o IP de um pod?', a: 'Pods são efêmeros e seus IPs mudam; o Service fornece IP e nome DNS estáveis e balanceia entre pods prontos.' }
  ]
}
];
