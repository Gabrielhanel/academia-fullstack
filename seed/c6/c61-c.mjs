// C6.1 — Docker, Compose e Kubernetes. Aulas 5 e 6 (Helm; Kubernetes em produção).
import { REF } from './c61-a.mjs';
import { REF2 } from './c61-b.mjs';
const R = String.raw;

export const REF3 = {
  helmDocs: { title: 'Helm — Documentation', url: 'https://helm.sh/docs/', kind: 'doc' },
  helmBest: { title: 'Helm — Chart Best Practices', url: 'https://helm.sh/docs/chart_best_practices/', kind: 'guia' },
  helmSchema: { title: 'Helm — Schema files (values.schema.json)', url: 'https://helm.sh/docs/topics/charts/#schema-files', kind: 'doc' },
  k8sBest: { title: 'Kubernetes — Best practices', url: 'https://kubernetes.io/docs/setup/best-practices/', kind: 'guia' },
  k8sResources: { title: 'Kubernetes — Resource management for pods and containers', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/', kind: 'doc' },
  k8sHpa: { title: 'Kubernetes — Horizontal Pod Autoscaling', url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/', kind: 'doc' },
  k8sPdb: { title: 'Kubernetes — Specifying a Disruption Budget', url: 'https://kubernetes.io/docs/tasks/run-application/configure-pdb/', kind: 'doc' },
  k8sPss: { title: 'Kubernetes — Pod Security Standards', url: 'https://kubernetes.io/docs/concepts/security/pod-security-standards/', kind: 'doc' },
  k8sNetpol: { title: 'Kubernetes — Network Policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/', kind: 'doc' },
  k8sRbac: { title: 'Kubernetes — Using RBAC Authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/', kind: 'doc' },
  k8sSecrets: { title: 'Kubernetes — Good practices for Kubernetes Secrets', url: 'https://kubernetes.io/docs/concepts/security/secrets-good-practices/', kind: 'guia' },
  argocd: { title: 'Argo CD — Declarative GitOps CD for Kubernetes', url: 'https://argo-cd.readthedocs.io/en/stable/', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'dk-05', moduleId: 'm3', order: 5, minutes: 80, tags: ['Helm', 'charts', 'values', 'templates', 'values.schema.json', 'helm lint', 'versionamento'],
  title: 'Helm: charts, valores e templates para empacotar e parametrizar aplicações Kubernetes',
  objectives: ['Explicar o problema que o Helm resolve (parametrização e ciclo de vida de manifestos) e seus conceitos (chart, release, values, repositório)', 'Escrever templates Go com helpers, condicionais, laços e toYaml', 'Validar valores com values.schema.json e entender o que o lint cobre', 'Renderizar o chart com valores diferentes e conferir o resultado com o kubeconform', 'Aplicar boas práticas de versionamento (version x appVersion), rótulos padrão e segredos', 'Comparar Helm com Kustomize e saber quando evitar templates complexos'],
  intro: R`Manter **os mesmos manifestos** para **vários ambientes** (dev, homologação, produção) **copiando e editando YAML** gera **divergência**. O **Helm** **empacota** manifestos como um **chart** **parametrizado por valores** e gerencia **releases** (instalação, atualização e rollback). No laboratório (**Helm 4.3.2**) o chart §pedidos§ **renderizou** **Service + Deployment** com os **valores padrão** (**2 réplicas**) e, com §values-producao.yaml§, **Service, Deployment, HPA (4 a 12) e Ingress**, **sem §replicas§** (o HPA assume); o **§values.schema.json§ recusou** §replicaCount=0§ e §pullPolicy=Talvez§; e o YAML renderizado **passou no kubeconform** (**4 recursos válidos**). **Nenhuma release foi instalada** (sem cluster).`,
  theory: R`### Conceitos
- **Chart:** **pacote** (pasta) com §Chart.yaml§ (**metadados**), §values.yaml§ (**valores padrão**), §templates/§ (**manifestos com template**), §values.schema.json§ (**validação dos valores**), §charts/§ (**dependências**), §README§;
- **Values:** **configuração** do chart (**sobrescrita** por §-f arquivo.yaml§ e §--set chave=valor§: **a ordem importa**: **o último vence**);
- **Release:** **instância** de um chart **instalada em um cluster** (§helm install meu ./chart§); **cada §upgrade§** cria **uma revisão** (§helm history§, §helm rollback§);
- **Repositório / OCI:** **onde charts são publicados** (**registros OCI** são o **padrão atual**);
- **Hooks e testes:** **jobs** em eventos (**pré-instalação**, **migração de banco**) e §helm test§.
**Fluxo:** **§helm lint§** → **§helm template§** (**renderiza localmente, sem cluster**) → **§helm install|upgrade --install§** → **§helm rollback§**.

### O chart do laboratório
Estrutura (§chart/§): §Chart.yaml§ (§version: 0.1.0§ do **chart** e §appVersion: "1.0.0"§ da **aplicação**), §values.yaml§ (§replicaCount: 2§, §image§, §service§, §ingress§, §resources§, §autoscaling§, §env§), §values-producao.yaml§ (**sobrescreve**: 4 réplicas, **Ingress** e **HPA** ligados, **env**), §values.schema.json§ e §templates/§ (§_helpers.tpl§, §deployment.yaml§, §service.yaml§, §ingress.yaml§, §hpa.yaml§).
**Templates** (**linguagem de templates do Go** + **funções do Sprig**):
- **Objetos:** §.Values§, §.Release.Name§, §.Chart.Name§, §.Chart.AppVersion§;
- **Helpers** (§_helpers.tpl§): §{{ include "pedidos.nome" . }}§ (**nome padronizado** §<release>-<chart>§) e §"pedidos.rotulos"§ (**rótulos recomendados** §app.kubernetes.io/name|instance|version§);
- **Condicionais:** §{{- if .Values.ingress.enabled }}...{{- end }}§ (**o Ingress só existe se ligado**); §{{- if not .Values.autoscaling.enabled }} replicas: ... {{- end }}§ (**sem HPA, o Deployment define as réplicas; com HPA, não**: **evita conflito** entre **Helm e HPA**);
- **Padrões:** §{{ .Values.image.tag | default .Chart.AppVersion }}§ (**sem tag informada, usa a appVersion**: **medido:** §registry.exemplo.com/pedidos:1.0.0§);
- **Laços:** §{{- range $k, $v := . }}§ gera **variáveis de ambiente** a partir de §env§;
- **§toYaml§ + §nindent§:** **copia blocos** (§resources§) **mantendo a indentação**;
- **Cuidado com o espaço em branco:** **§{{-§** e **§-}}§** **removem espaços/linhas**: **a maior fonte de erros** de YAML renderizado.

### Valores e esquema: validar na entrada
**§values.schema.json§** (**JSON Schema**) **valida** os valores **em §lint§, §template§, §install§ e §upgrade§**: **mensagens claras** **antes** de **gerar manifestos inválidos**. **Medido:**
- §--set replicaCount=0§ → **§Error: values don't meet the specifications of the schema(s)... at '/replicaCount': minimum: got 0, want 1§**;
- §--set image.pullPolicy=Talvez§ → **§at '/image/pullPolicy': value must be one of 'Always', 'IfNotPresent', 'Never'§**.
**Boas práticas do esquema:** **tipos**, **mínimos/máximos**, **enums**, **campos obrigatórios** (§image.repository§); **documente** os valores no **§values.yaml§** (**comentários**) e no **README**.

### Renderizar e validar (medido)
| Comando | Resultado |
|---|---|
| §helm lint /chart§ | **1 chart linted, 0 failed** (§[INFO] icon is recommended§) |
| §helm template meu /chart§ (padrão) | **Service + Deployment**, §replicas: 2§, imagem §:1.0.0§ |
| §helm template ... -f values-producao.yaml§ | **Service, Deployment (sem §replicas§), HPA (§minReplicas: 4§, §maxReplicas: 12§, **CPU 65%**) e Ingress**; §LOG_LEVEL: "info"§ |
| **§... | kubeconform -strict§** (K8s 1.34.0) | **4 recursos válidos** |
**Padrão para CI:** **§helm lint§ + §helm template§ para **cada** arquivo de valores (**dev/stg/prod**) **|** **§kubeconform§**; **§helm template§ nunca toca no cluster**: **seguro** em CI. **Limite:** **valida forma, não efeito** (**imagem existe?**, **recursos cabem?**): **só o cluster** (**§helm install --dry-run=server§**: **não executado**).

### Versionamento e ciclo de vida
- **§version§** (**do chart**: **SemVer**: **mude a cada alteração do chart**) x **§appVersion§** (**da aplicação**: **informativa**; **a tag da imagem** pode seguir §appVersion§ **por padrão**);
- **§helm upgrade --install meu ./chart -f values-producao.yaml --atomic --wait --timeout 5m§** (**--atomic**: **reverte** se **falhar**; **--wait**: **espera** os recursos **ficarem prontos**; **não executado aqui**);
- **Rollback:** §helm rollback meu 2§ (**volta à revisão 2**); **atenção**: **migrações de banco** **não** voltam **sozinhas**: **desenhe-as compatíveis** (**expandir e contrair**);
- **§helm diff§** (**plugin**) e **GitOps** (Argo CD/Flux: aula dk-06) **tornam mudanças visíveis**;
- **Dependências** (§helm dependency update§): **subcharts** (ex.: **PostgreSQL**, **Redis**) **para desenvolvimento**; **em produção, prefira serviços gerenciados** (C6.4).

### Helm x Kustomize x manifestos puros
| | **Helm** | **Kustomize** | **YAML puro** |
|---|---|---|---|
| **Modelo** | **templates + valores** | **sobreposições (patches)** sobre YAML válido | **nenhum** |
| **Prós** | **parametrização**, **ciclo de vida** (releases), **ecossistema de charts** | **YAML sempre válido**, **simples**, **embutido no kubectl** | **zero abstração** |
| **Contras** | **templates em YAML = difíceis de ler/depurar**, **espaços em branco** | **menos poderoso** para **lógica** | **duplicação** entre ambientes |
**Regra prática:** **comece com YAML puro** em **1 ambiente**; **Kustomize** para **variações simples** entre ambientes; **Helm** para **distribuir** um **pacote reutilizável** (**ou** consumir **charts de terceiros**) e **quando precisar de releases**. **Evite** **lógica complexa** em templates (**vira programa em YAML**).

### Segurança e segredos
**Não coloque segredos em §values.yaml§ versionado** (**ficam no histórico do Git e nas revisões da release**: §helm get values§ **mostra**). **Alternativas:** **External Secrets/CSI Secrets Store**, **Sealed Secrets/SOPS** (**criptografados no Git**), **segredos criados por fora** e **referenciados** (§existingSecret§). **Charts de terceiros:** **revise o conteúdo** (§helm template§), **fixe versões**, **verifique assinatura/procedência**: **são código que roda no seu cluster**.

### Limites desta aula
**Executados:** §helm lint§, §helm template§ (**valores padrão e de produção**), **esquema de valores** e **validação com kubeconform** (Helm 4.3.2). **Não executados:** §install§, §upgrade§, §rollback§, §helm test§, **hooks**, **dependências**, **repositórios OCI**, **Kustomize**, **assinatura de charts**.`,
  concepts: [
    { term: 'Chart', def: 'Pacote Helm com metadados, valores padrão e templates de manifestos Kubernetes.' },
    { term: 'Release', def: 'Instância de um chart instalada em um cluster, com histórico de revisões.' },
    { term: 'values.yaml', def: 'Arquivo com os valores padrão que parametrizam os templates do chart.' },
    { term: 'values.schema.json', def: 'JSON Schema que valida os valores informados antes de renderizar ou instalar.' },
    { term: 'appVersion', def: 'Versão da aplicação empacotada, distinta da version do chart.' },
    { term: 'helm template', def: 'Comando que renderiza os manifestos localmente, sem acessar o cluster.' },
    { term: 'Kustomize', def: 'Ferramenta que personaliza YAML válido por sobreposições, sem templates.' }
  ],
  examples: R`**Analogia:** um **chart** é uma **receita com campos em branco** ("**{{ réplicas }}** porções, **{{ tempero }}**"); cada **arquivo de valores** é um **pedido** (dev: 2 porções; produção: 4 e com molho); o **§values.schema.json§** é o **garçom** que **recusa** "zero porções" **antes** de ir à cozinha; e a **release** é **o prato servido**, **com histórico** para **voltar ao pedido anterior**.

**Exemplo 1: parametrização.** Os mesmos templates geram 2 recursos no padrão e 4 em produção (HPA e Ingress).

**Exemplo 2: esquema.** replicaCount=0 e pullPolicy=Talvez são recusados com mensagens claras.

**Exemplo 3: HPA e réplicas.** Com autoscaling ligado, o template omite replicas para não brigar com o HPA.`,
  code: [
    { title: 'Template do Deployment com helpers, condicional, default, laço e toYaml (Helm 4.3.2; renderizado e validado)', lang: 'yaml', code: R`apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "pedidos.nome" . }}
  labels: {{- include "pedidos.rotulos" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      app.kubernetes.io/instance: {{ .Release.Name }}
  template:
    metadata:
      labels: {{- include "pedidos.rotulos" . | nindent 8 }}
    spec:
      securityContext: { runAsNonRoot: true, runAsUser: 1000 }
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          {{- with .Values.env }}
          env:
            {{- range $k, $v := . }}
            - { name: {{ $k }}, value: {{ $v | quote }} }
            {{- end }}
          {{- end }}
          resources: {{- toYaml .Values.resources | nindent 12 }}`, notes: [{ l: '7', t: 'Com HPA ligado, as réplicas ficam por conta dele.' }, { l: '19', t: 'default usa a appVersion quando nenhuma tag é informada.' }] },
    { title: 'values.schema.json e comandos de validação (JSON e shell; resultados medidos)', lang: 'bash', code: R`# values.schema.json (trecho)
# { "properties": { "replicaCount": { "type": "integer", "minimum": 1, "maximum": 50 },
#   "image": { "required": ["repository"], "properties": { "pullPolicy": { "enum": ["Always", "IfNotPresent", "Never"] } } } } }

H="docker run --rm -v $PWD/chart:/chart alpine/helm"
$H lint /chart                                   # 1 chart(s) linted, 0 chart(s) failed
$H template meu /chart --set replicaCount=0      # Error: ... at '/replicaCount': minimum: got 0, want 1
$H template meu /chart --set image.pullPolicy=Talvez   # Error: ... value must be one of 'Always', 'IfNotPresent', 'Never'
$H template meu /chart -f /chart/values-producao.yaml | docker run --rm -i ghcr.io/yannh/kubeconform:latest -strict -summary -kubernetes-version 1.34.0 -
# Summary: 4 resources found parsing stdin - Valid: 4, Invalid: 0`, notes: [{ l: '6', t: 'O esquema barra valores inválidos antes de gerar YAML.' }, { l: '10', t: 'Renderizar e validar não exige cluster: ideal para o CI.' }] },
    { title: 'Ciclo de vida de uma release (shell; conceitual, não executado: sem cluster)', lang: 'bash', code: R`helm upgrade --install meu ./chart -f values-producao.yaml --namespace pedidos --create-namespace --atomic --wait --timeout 5m
helm list -n pedidos                    # releases e revisões
helm history meu -n pedidos             # revisões com status
helm rollback meu 1 -n pedidos          # volta à revisão 1
helm get values meu -n pedidos          # CUIDADO: mostra os valores (inclusive segredos mal colocados)
helm uninstall meu -n pedidos`, notes: [{ l: '1', t: '--atomic reverte se a atualização falhar; --wait espera os recursos ficarem prontos.' }, { l: '5', t: 'Por isso segredos não devem ficar em values versionados.' }] }
  ],
  bestPractices: ['Valide os valores com values.schema.json e documente cada valor.', 'Rode helm lint, helm template e kubeconform para cada arquivo de valores no CI.', 'Use rótulos recomendados e helpers para nomes consistentes e evite lógica complexa nos templates.', 'Separe version (chart) de appVersion (aplicação) e siga SemVer.', 'Evite conflito entre HPA e réplicas omitindo replicas quando o autoscaling estiver ligado.', 'Não coloque segredos em values; use External Secrets, SOPS ou segredos existentes.', 'Use --atomic --wait nas atualizações e projete migrações de banco compatíveis com rollback.'],
  mistakes: ['Copiar e editar YAML por ambiente em vez de parametrizar.', 'Segredos em values.yaml versionado.', 'Templates com lógica pesada e controle de espaços frágil.', 'Definir replicas no Deployment e no HPA ao mesmo tempo.', 'Instalar charts de terceiros sem revisar o que renderizam.', 'Achar que o lint prova que o chart funciona no cluster.'],
  market: R`**Helm** aparece em **quase todo ambiente Kubernetes**; **escrever e validar charts** (e saber **quando não usar templates**) é **habilidade pedida** a **plataforma e DevOps**.`,
  summary: R`O Helm empacota manifestos como chart parametrizado por valores e gerencia releases. Os templates (Go + Sprig) usam helpers, condicionais, default, range e toYaml, e values.schema.json valida a entrada. Medido (Helm 4.3.2): lint sem falhas; template padrão com Service e Deployment (2 réplicas, imagem na appVersion 1.0.0); template de produção com HPA (4 a 12), Ingress e sem replicas no Deployment; replicaCount=0 e pullPolicy=Talvez recusados pelo esquema; o resultado renderizado passou no kubeconform (4 recursos). Nenhuma release foi instalada; Kustomize e hooks não foram executados.`,
  refs: [REF3.helmDocs, REF3.helmBest, REF3.helmSchema, REF2.kubeconform],
  cards: [
    { q: 'Qual a diferença entre version e appVersion no Chart.yaml?', a: 'version é a versão do chart (SemVer, muda a cada alteração do pacote); appVersion é a versão da aplicação empacotada.' },
    { q: 'Para que serve o values.schema.json?', a: 'Valida os valores antes de renderizar ou instalar; no laboratório recusou replicaCount=0 e pullPolicy=Talvez.' },
    { q: 'Por que omitir replicas quando o HPA está ligado?', a: 'Evita que o Helm e o autoscaler disputem o número de réplicas a cada upgrade.' },
    { q: 'Por que não colocar segredos em values.yaml?', a: 'Ficam no Git e nas revisões da release (helm get values os mostra); use External Secrets, SOPS ou segredos externos.' }
  ]
},
{
  id: 'dk-06', moduleId: 'm3', order: 6, minutes: 90, tags: ['Kubernetes em produção', 'requests e limits', 'HPA', 'PDB', 'NetworkPolicy', 'RBAC', 'GitOps', 'segurança'],
  title: 'Kubernetes em produção: recursos, escalabilidade, disrupções, segurança, entrega por GitOps e operação',
  objectives: ['Dimensionar requests e limits e entender throttling de CPU e OOMKilled', 'Configurar HPA, PodDisruptionBudget, anti-afinidade e topologia para disponibilidade', 'Aplicar segurança em camadas (Pod Security, securityContext, NetworkPolicy, RBAC, segredos)', 'Planejar entrega com GitOps, estratégias de rollout e atualizações de cluster', 'Definir observabilidade, backups e recuperação de desastres do cluster', 'Avaliar custo, complexidade e a alternativa de serviços gerenciados'],
  intro: R`Ter o Kubernetes **rodando** é diferente de **operá-lo em produção**: **recursos corretos**, **escala**, **tolerância a falhas e manutenção**, **segurança**, **entrega controlada** e **observabilidade**. O manifesto do laboratório (§k8s/app.yaml§, **validado estaticamente**) já traz **HPA (3 a 10, CPU 70%)**, **PDB (§minAvailable: 2§)**, **probes**, **requests/limits**, **§securityContext§ restritivo** e **Ingress com TLS**; o experimento do **dk-01** mostrou **por que limites importam** (**OOM com 32 MiB; **~2x** mais lento com **0,5 CPU**). **Nada foi executado em um cluster** (sem cluster neste ambiente): esta aula descreve **práticas** a partir da **documentação** e **valida** a **forma** dos manifestos.`,
  theory: R`### Requests e limits: o contrato de recursos
- **§requests§**: **reserva** usada pelo **scheduler** para **escolher o nó** (**garantia mínima**); **§limits§**: **teto**.
- **Memória:** **ultrapassou o limite → OOMKilled** (**saída 137**: **medido no dk-01** com 32 MiB e alocação de 200 MiB). **Regra comum:** **§limits.memory§ = §requests.memory§** (**previsibilidade**) **e** acima do **uso de pico** medido;
- **CPU:** **ultrapassou o limite → *throttling*** (**o cgroup estrangula**: **medido no dk-01**: **0,5 CPU** → laço **~2x mais lento**). **Muitas equipes definem só §requests.cpu§ e omitem §limits.cpu§** (**evita throttling**) **e** usam **HPA**; **decida** com **métricas** (latência p95: C5.6);
- **Classes de QoS:** **Guaranteed** (requests = limits em tudo), **Burstable**, **BestEffort** (**sem nada**: **primeiro a ser removido** sob pressão). **LimitRange/ResourceQuota** por **namespace**;
- **Dimensionamento:** **meça** (**§kubectl top§**, **Prometheus**: aula C6.6), **VPA** em **modo recomendação** ajuda; **não** chute.
**No manifesto do laboratório:** §requests: cpu 100m, memory 128Mi§; §limits: memory 256Mi§ (**sem limite de CPU**).

### Escala: HPA (e além)
**HPA** (§autoscaling/v2§) **ajusta réplicas** por **métricas** (**CPU/memória**, **métricas customizadas** como **requisições/s**, **tamanho de fila**). **Laboratório:** §minReplicas: 3§, §maxReplicas: 10§, **CPU média 70%** **dos *requests***. **Pontos:** (1) **depende dos §requests§** (**utilização = uso ÷ request**); (2) **precisa de §metrics-server§**; (3) **atraso** (**coleta + criação + readiness**): **pico súbito** pede **réplicas mínimas** adequadas e **filas/backpressure** (**C5.6: tav-03**); (4) **estabilização** (**evita oscilação**). **Outros:** **VPA** (**ajusta requests**), **Cluster Autoscaler/Karpenter** (**adiciona nós**), **KEDA** (**escala por eventos**: filas). **Aplicações sem estado** escalam **melhor**; **estado** exige **projeto** (**StatefulSet**).

### Disponibilidade: disrupções, distribuição e atualizações
- **PodDisruptionBudget** (§minAvailable: 2§): **limita disrupções voluntárias** (**drenagem de nós em atualização**, **autoscaler**) **para não derrubar réplicas demais**; **não protege** de **falhas involuntárias** (**nó morreu**);
- **Distribuição:** **§topologySpreadConstraints§** (**espalhar pods** entre **zonas/nós**), **anti-afinidade** (**evitar** **todas as réplicas no mesmo nó**), **múltiplas zonas**: **sobrevive à perda de uma zona**;
- **Atualizações:** **RollingUpdate** com **§maxUnavailable: 0§** e **readiness** (**dk-04**); **desligamento gracioso** (**SIGTERM + preStop**); **blue-green/canário** (**ferramentas**: Argo Rollouts, ingress com pesos: **C6.2**);
- **Atualização do cluster** (**versões do K8s**: **~3 releases/ano**, **suporte limitado**): **planejar** **upgrades** (**nós drenados** respeitando **PDBs**), **testar** em **homologação**, **verificar APIs depreciadas** (**kubeconform/pluto** antes: **o mesmo tipo de validação do laboratório**).

### Segurança em camadas
1. **Pod Security Standards** (**privileged, baseline, restricted**) **aplicados por namespace** (**Pod Security Admission**): **restricted** exige **não root**, **sem escalonamento de privilégio**, **capacidades removidas**, **seccomp**; **o manifesto do laboratório segue o perfil restricted** (**§runAsNonRoot§, §allowPrivilegeEscalation: false§, §readOnlyRootFilesystem§, §drop ALL§, §seccompProfile: RuntimeDefault§) — **verificado só por esquema**, **não aplicado**;
2. **NetworkPolicy:** **por padrão, todo pod fala com todo pod**: defina **negar tudo** e **permitir só o necessário** (**ex.: app → banco:5432**); **exige CNI com suporte** (Calico, Cilium);
3. **RBAC:** **menor privilégio** por **ServiceAccount**; **evite §cluster-admin§**; **audite**; **desligue token** montado quando **não precisar** (§automountServiceAccountToken: false§);
4. **Segredos:** **criptografia em repouso**, **RBAC restritivo**, **gerenciadores externos** (External Secrets, Vault, CSI), **rotação**; **nunca** no Git (**dk-04 e dk-05**);
5. **Supply chain:** **imagens de registros confiáveis**, **por digest**, **varridas** (Trivy), **assinadas** (cosign) e **verificadas** por **política** (Kyverno/OPA Gatekeeper/ValidatingAdmissionPolicy); **SBOM**;
6. **Nós e runtime:** **SO mínimo**, **atualizações**, **sem acesso SSH amplo**; **sandbox** (gVisor) para **cargas não confiáveis** (**dk-01**);
7. **API server:** **acesso restrito**, **autenticação forte (OIDC)**, **auditoria**.

### Entrega: GitOps
**GitOps:** **o repositório Git é a fonte da verdade** do estado desejado; **um agente no cluster** (**Argo CD**, **Flux**) **sincroniza** continuamente (**pull**) e **detecta deriva** (***drift***). **Benefícios:** **auditoria** (**histórico do Git**), **rollback = git revert**, **ambientes reproduzíveis**, **sem credenciais do cluster no CI**. **Fluxo típico:** **CI** (testes, **build da imagem**, **varredura**, **atualiza o chart/valores** com a **nova tag** em um **repositório de configuração**) → **PR/merge** → **agente aplica**. **Validação no CI** (**este curso**): **hadolint** (dk-02), **helm lint/template** e **kubeconform** (dk-04 e dk-05), **políticas**. **Não executado:** **Argo CD/Flux**.

### Observabilidade e operação
- **Métricas** (**Prometheus**: **C6.6**; **kube-state-metrics**, **cAdvisor**, **node-exporter**), **logs** (**stdout** → agente: Fluent Bit/Vector → armazenamento), **traces** (**OpenTelemetry**: **C4.6**), **eventos** (§kubectl get events§);
- **Alertas** em **sintomas e SLOs** (**qual-05**): **taxa de erros e latência** do **Service**, **pods §CrashLoopBackOff§/§Pending§**, **nós §NotReady§**, **saturação** (**CPU throttling**, **memória**), **réplicas indisponíveis**;
- **Runbooks** para **§CrashLoopBackOff§**, **§ImagePullBackOff§**, **§OOMKilled§**, **Service sem endpoints** (**dk-04**).

### Backup e recuperação de desastres
**O que proteger:** **etcd** (**estado do cluster**: **gerenciado** em EKS/AKS/GKE), **volumes persistentes** (**snapshots**, **Velero**), **manifestos** (**Git: GitOps**), **segredos**, **bancos** (**backups nativos**: C3). **Teste a restauração** (**um backup nunca restaurado não é um backup**). **Multi-região/cluster** para **DR**: **RTO/RPO** definidos pelo **negócio** (qual-05: **SLOs**).

### Custo e complexidade
**Custos:** **nós ociosos** (**requests altos demais**), **load balancers** por serviço, **egress de rede**, **armazenamento**, **observabilidade** (**volume de métricas/logs**); **FinOps**: **requests corretos**, **autoscaling de nós**, **spot/preemptíveis** para **cargas tolerantes**, **rótulos de custo**. **Complexidade:** **plano de controle**, **redes**, **upgrades**, **segurança**: **uma equipe de plataforma** ou **serviço gerenciado**. **Alternativas** a avaliar: **PaaS** (Cloud Run, App Service, Fly.io), **ECS/Fargate**, **funções** (**serverless**: C6.4): **muitas aplicações** **não precisam de K8s**.

### Checklist de prontidão para produção
1. **Imagens** mínimas, **não root**, **por digest**, **varridas**; 2. **requests/limits** **medidos**; 3. **probes** **corretas** + **desligamento gracioso**; 4. **≥ 2–3 réplicas** em **zonas diferentes** + **PDB**; 5. **HPA** com **mínimos** adequados; 6. **NetworkPolicy** (negar por padrão); 7. **RBAC** mínimo e **segredos gerenciados**; 8. **GitOps** (ou **pipeline** auditável) com **rollback** testado; 9. **observabilidade** + **alertas por SLO** + **runbooks**; 10. **backup/DR** **testados**; 11. **plano de upgrade**; 12. **custos** monitorados.

### Limites desta aula
**Executado:** **validação estática** do manifesto de produção (kubeconform 0.8.0, K8s 1.34.0). **Medidos em outro contexto:** OOM e throttling (dk-01). **Não executados:** **HPA, PDB, NetworkPolicy, RBAC, Pod Security, GitOps (Argo CD/Flux), Velero, Karpenter, KEDA, políticas (Kyverno/OPA)** e **qualquer carga em cluster**.`,
  concepts: [
    { term: 'Requests e limits', def: 'Reserva usada no agendamento (requests) e teto de consumo (limits) de CPU e memória de um contêiner.' },
    { term: 'Throttling de CPU', def: 'Estrangulamento do processo quando atinge o limite de CPU do cgroup, aumentando a latência.' },
    { term: 'HPA', def: 'Horizontal Pod Autoscaler: ajusta o número de réplicas conforme métricas como CPU.' },
    { term: 'PodDisruptionBudget', def: 'Limite de disrupções voluntárias que garante um mínimo de pods disponíveis durante manutenções.' },
    { term: 'NetworkPolicy', def: 'Regra que restringe quais pods podem se comunicar, permitindo adotar negar-por-padrão.' },
    { term: 'GitOps', def: 'Prática em que o Git é a fonte da verdade do estado desejado e um agente sincroniza o cluster com ele.' },
    { term: 'Deriva (drift)', def: 'Diferença entre o estado real do cluster e o declarado no repositório.' }
  ],
  examples: R`**Analogia:** colocar uma aplicação em **produção no Kubernetes** é **abrir um restaurante**, não só **montar a cozinha**: **dimensionar a equipe por turno** (requests e HPA), **escalar folgas sem fechar** (PDB), **controlar quem entra na despensa** (RBAC e NetworkPolicy), **registrar tudo em um livro de receitas** (GitOps) e **ter um plano para incêndio** (backup e DR).

**Exemplo 1: recursos.** Com limite de CPU de 0,5 o laço levou ~2x mais (dk-01); com limite de memória de 32 MiB o processo foi morto (137).

**Exemplo 2: disponibilidade.** 3 réplicas, PDB minAvailable 2 e HPA de 3 a 10 mantêm capacidade durante manutenções.

**Exemplo 3: GitOps.** Reverter um commit no repositório de configuração reverte a implantação.`,
  code: [
    { title: 'HPA e PodDisruptionBudget do manifesto do laboratório (YAML; validado com kubeconform, não aplicado)', lang: 'yaml', code: R`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: pedidos }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: pedidos }
  minReplicas: 3
  maxReplicas: 10
  metrics: [{ type: Resource, resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } } }]
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: pedidos }
spec:
  minAvailable: 2
  selector: { matchLabels: { app: pedidos } }`, notes: [{ l: '8', t: 'Utilização é uso dividido pelo request: requests errados distorcem o HPA.' }, { l: '14', t: 'Durante drenagens, ao menos 2 pods continuam disponíveis.' }] },
    { title: 'NetworkPolicy negar-por-padrão e permissão mínima (YAML; conceitual, não validado nem aplicado)', lang: 'yaml', code: R`# 1) negar todo tráfego de entrada no namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: negar-entrada }
spec: { podSelector: {}, policyTypes: [Ingress] }
---
# 2) permitir apenas o Ingress controller chegar na aplicação, na porta 3000
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: permitir-ingress-controller }
spec:
  podSelector: { matchLabels: { app: pedidos } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: ingress-nginx } } }]
      ports: [{ port: 3000 }]`, notes: [{ l: '5', t: 'podSelector vazio seleciona todos os pods: base do negar-por-padrão.' }, { l: '15', t: 'Exige um CNI com suporte a NetworkPolicy (Calico, Cilium).' }] },
    { title: 'Pipeline de validação estática de manifestos (shell; trechos executados no laboratório)', lang: 'bash', code: R`# 1) imagem: lint do Dockerfile
docker run --rm -i hadolint/hadolint hadolint - < app/Dockerfile
# 2) manifestos puros: validação de esquema (K8s 1.34.0)
docker run --rm -v "$PWD/k8s:/k8s:ro" ghcr.io/yannh/kubeconform:latest -strict -summary -kubernetes-version 1.34.0 /k8s/app.yaml
# 3) chart: lint, renderização por ambiente e validação do resultado
docker run --rm -v "$PWD/chart:/chart" alpine/helm lint /chart
docker run --rm -v "$PWD/chart:/chart" alpine/helm template meu /chart -f /chart/values-producao.yaml \
  | docker run --rm -i ghcr.io/yannh/kubeconform:latest -strict -summary -kubernetes-version 1.34.0 -
# 4) com cluster (não executado aqui): kubectl apply --dry-run=server -f k8s/app.yaml e políticas (Kyverno/OPA)`, notes: [{ l: '1', t: 'Cada etapa pega uma classe de erro diferente; nenhuma substitui o cluster.' }, { l: '9', t: 'Dry-run no servidor e políticas exigem um cluster.' }] }
  ],
  bestPractices: ['Meça o consumo para definir requests e limits; use limite de memória igual ao request e avalie remover o limite de CPU.', 'Combine HPA, PDB, topologia e múltiplas zonas, com réplicas mínimas adequadas e desligamento gracioso.', 'Aplique segurança em camadas: Pod Security restricted, NetworkPolicy negar-por-padrão, RBAC mínimo e segredos gerenciados.', 'Entregue por GitOps ou pipeline auditável, com rollback testado e validação estática no CI.', 'Alerte por sintomas e SLOs e mantenha runbooks para os modos de falha comuns.', 'Teste backups e recuperação e planeje as atualizações do cluster.', 'Avalie serviços gerenciados e PaaS antes de assumir a complexidade do Kubernetes.'],
  mistakes: ['Pods BestEffort ou limites de CPU apertados que causam throttling.', 'Uma única réplica ou todas no mesmo nó sem PDB.', 'Rede aberta entre todos os pods.', 'cluster-admin para pipelines e aplicações.', 'Backups nunca testados.', 'Adotar Kubernetes sem equipe ou necessidade que o justifique.'],
  market: R`**Operar Kubernetes em produção** (recursos, segurança, GitOps, custo) é **o que diferencia** **plataforma e SRE sênior**; **entrevistas** costumam pedir **como você tornaria um deployment resiliente e seguro**.`,
  summary: R`Em produção o Kubernetes exige requests e limits medidos (OOM com memória, throttling com CPU: ~2x mais lento a 0,5 CPU no dk-01), escala com HPA, disponibilidade com PDB, topologia e rolling update sem indisponibilidade, segurança em camadas (Pod Security restricted, NetworkPolicy, RBAC, segredos gerenciados, supply chain), entrega por GitOps, observabilidade com alertas por SLO, backups testados e atenção ao custo. O manifesto do laboratório (HPA 3 a 10 a 70% de CPU, PDB minAvailable 2, probes, securityContext restritivo, Ingress com TLS) foi validado estaticamente (6 recursos); nada foi aplicado a um cluster, e GitOps, NetworkPolicy, RBAC, Velero e políticas não foram executados.`,
  refs: [REF3.k8sBest, REF3.k8sResources, REF3.k8sHpa, REF3.k8sPdb, REF3.k8sPss, REF3.k8sNetpol, REF3.k8sRbac, REF3.k8sSecrets, REF3.argocd],
  cards: [
    { q: 'O que acontece quando um contêiner excede o limite de memória? E o de CPU?', a: 'Memória: é morto (OOMKilled, saída 137). CPU: sofre throttling e fica mais lento (laboratório: ~2x com 0,5 CPU).' },
    { q: 'O que um PodDisruptionBudget garante e não garante?', a: 'Limita disrupções voluntárias (drenagens, upgrades) mantendo o mínimo de pods; não protege de falhas involuntárias como a perda de um nó.' },
    { q: 'Por que usar NetworkPolicy negar-por-padrão?', a: 'Por padrão todo pod fala com todo pod; negar tudo e permitir só o necessário limita o movimento lateral de um atacante.' },
    { q: 'O que é GitOps?', a: 'O Git como fonte da verdade do estado desejado, com um agente no cluster sincronizando-o continuamente e detectando deriva.' }
  ]
}
];
