// C6.4 — Cloud (AWS, Azure, Google Cloud). Aulas 4 a 6 (Google Cloud; serverless; custos e multi-cloud).
const R = String.raw;

export const REF2 = {
  gcpHierarchy: { title: 'Google Cloud — Resource hierarchy', url: 'https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy', kind: 'doc' },
  gcpIam: { title: 'Google Cloud — IAM overview', url: 'https://cloud.google.com/iam/docs/overview', kind: 'doc' },
  gcpServiceAcc: { title: 'Google Cloud — Service accounts overview', url: 'https://cloud.google.com/iam/docs/service-account-overview', kind: 'doc' },
  gcpVpc: { title: 'Google Cloud — VPC networks', url: 'https://cloud.google.com/vpc/docs/vpc', kind: 'doc' },
  gcpRun: { title: 'Google Cloud — What is Cloud Run', url: 'https://cloud.google.com/run/docs/overview/what-is-cloud-run', kind: 'doc' },
  gcpProducts: { title: 'Google Cloud — Products and services (Cloud Run, GKE, Cloud SQL, BigQuery)', url: 'https://cloud.google.com/products', kind: 'doc' },
  lambdaDocs: { title: 'AWS Lambda — What is AWS Lambda?', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html', kind: 'doc' },
  lambdaEnv: { title: 'AWS Lambda — Understanding the Lambda execution environment lifecycle', url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html', kind: 'doc' },
  azureFunctions: { title: 'Azure Functions — Overview', url: 'https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview', kind: 'doc' },
  sqsDelivery: { title: 'Amazon SQS — Standard queues (at-least-once delivery)', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html', kind: 'doc' },
  finops: { title: 'FinOps Foundation — What is FinOps?', url: 'https://www.finops.org/introduction/what-is-finops/', kind: 'guia' },
  awsPricing: { title: 'AWS — Pricing overview', url: 'https://aws.amazon.com/pricing/', kind: 'doc' },
  azurePricing: { title: 'Azure — Pricing calculator', url: 'https://azure.microsoft.com/en-us/pricing/calculator/', kind: 'ferramenta' },
  gcpPricing: { title: 'Google Cloud — Pricing overview', url: 'https://cloud.google.com/pricing', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'cld-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['Google Cloud', 'projetos', 'pastas', 'IAM', 'service account', 'Cloud Run', 'GKE', 'BigQuery', 'VPC global'],
  title: 'Google Cloud: hierarquia, IAM, contas de serviço e serviços essenciais',
  objectives: ['Explicar a hierarquia organização, pastas e projetos e a herança de políticas de IAM', 'Diferenciar principais, papéis e contas de serviço e aplicar menor privilégio', 'Mapear os serviços essenciais do Google Cloud e compará-los aos de AWS e Azure sem presumir equivalência exata', 'Reconhecer características de rede e de serviços (VPC global, Cloud Run, BigQuery)'],
  intro: R`O **Google Cloud (GCP)** **tem a menor participação dos três**, mas **é forte em dados, Kubernetes e contêineres sem servidor** (**Cloud Run**). **A hierarquia (organização → pastas → projetos) e o IAM com herança** **são o centro do modelo**. **Aviso:** **sem conta Google Cloud neste ambiente**: **análise a partir da documentação oficial**; **a herança de políticas é um modelo executado nos exercícios**.`,
  theory: R`### Hierarquia de recursos
**Organização** (**raiz da empresa**, **ligada ao Google Workspace/Cloud Identity**) → **Pastas** (***folders***, **agrupam por área ou ambiente**) → **Projetos** (**unidade de cobrança, de APIs habilitadas, de cotas e de permissões**) → **Recursos**. **Tudo vive em um projeto.** **Políticas de IAM são herdadas de cima para baixo**: **uma permissão concedida em uma pasta vale para todos os projetos dentro dela**. **Comparação:** **projeto GCP ≈ conta AWS ≈ assinatura Azure** (**fronteira de isolamento e de custo**), **com diferenças de detalhe**.

### IAM: principais, papéis e políticas
- **Principal:** **quem** (**conta Google, grupo, conta de serviço, domínio**).
- **Papel (*role*):** **conjunto de permissões** (§servico.recurso.verbo§, como §storage.objects.get§): **básicos** (**Owner/Editor/Viewer: amplos demais para produção**), **predefinidos** (**por serviço, mantidos pelo Google**) e **personalizados**.
- **Política de permissão (*allow policy*):** **associações (bindings) de principal + papel** **em um recurso**; **herdadas** (**a política efetiva = união das políticas do recurso e de seus ancestrais**).
- **Política de negação (*deny policy*):** **impede explicitamente** **certas permissões** **mesmo que haja concessão**; **vence as permissões de allow**, **herdada** como as demais. **Condições** (**IAM Conditions**) **restringem por tempo, recurso ou atributo**.
**Resumo:** **allow aditivo e herdado + deny que sobrepõe**: **modelo em um meio-termo entre o aditivo do Azure RBAC e a negação explícita do IAM da AWS** (**o que vence é o *deny*, como na AWS**).
**Contas de serviço:** **identidade para aplicações e cargas de trabalho** (**não pessoas**). **Boas práticas:** **uma conta por carga**, **permissões mínimas**, **evite baixar chaves JSON** (**de longa duração, vazam**) e **use credenciais anexadas ao recurso** (**o código no Cloud Run, GKE ou Compute Engine obtém tokens do ambiente**) **ou federação de identidade da carga de trabalho** (***Workload Identity Federation***: **o equivalente ao OIDC de pipelines**).

### Serviços essenciais e equivalências aproximadas
| Categoria | Google Cloud | AWS | Azure |
|---|---|---|---|
| **VMs** | **Compute Engine** | EC2 | Virtual Machines |
| **Funções** | **Cloud Run functions** | Lambda | Functions |
| **Contêineres sem servidor** | **Cloud Run** | Fargate/App Runner | Container Apps |
| **Kubernetes gerenciado** | **GKE** | EKS | AKS |
| **Objetos** | **Cloud Storage** | S3 | Blob Storage |
| **Relacional** | **Cloud SQL**, **AlloyDB**, **Spanner** (global) | RDS/Aurora | Azure SQL |
| **NoSQL** | **Firestore**, **Bigtable** | DynamoDB | Cosmos DB |
| **Análise de dados** | **BigQuery** (armazém sem servidor) | Redshift/Athena (aproximado) | Synapse/Fabric (aproximado) |
| **Mensageria** | **Pub/Sub** | SQS/SNS | Service Bus/Event Grid |
| **Observabilidade** | **Cloud Monitoring e Cloud Logging** | CloudWatch | Azure Monitor |
**Cuidado:** **a tabela é um mapa mental**, **não um guia de migração**: **semânticas de consistência, limites, preços e modelos de operação diferem**.

### Rede
**VPC no Google Cloud é global** (**uma rede abrange várias regiões; as sub-redes são regionais**), **ao contrário** da **VPC da AWS** e da **VNet do Azure** (**regionais**): **simplifica a conectividade entre regiões**, **mas** **muda o desenho de isolamento**. **Regras de firewall** **na VPC** (**por tags/contas de serviço**); **Cloud Load Balancing** **pode ser global** (**um IP anycast** **distribui por regiões**); **Private Google Access** **e Private Service Connect** **para acesso privado a serviços**.

### Cloud Run e a computação sem servidor de contêineres
**Cloud Run** **executa um contêiner sem estado que atende requisições HTTP** (**ou jobs**), **escala automaticamente (inclusive a zero)** **e cobra por uso**. **Você traz uma imagem** (**como a do curso C6.1**) **e o plano de controle cuida de escalonamento e rotas**. **Vantagens:** **menos operação que o Kubernetes**, **mesma imagem de contêiner** (**portabilidade**), **revisões com divisão de tráfego (canary!) por percentual**. **Limites a considerar** (**consulte os atuais**): **tempo máximo de requisição**, **concorrência por instância**, **cold start** (aula 5) **e estado efêmero**.
**Relação com este curso:** **o experimento da aula de CI/CD** (**canary 9:1**) **corresponde ao recurso de divisão de tráfego entre revisões**: **mesma ideia, executada por um serviço gerenciado**.

### Dados: BigQuery
**BigQuery** **é um armazém de dados analítico sem servidor** (**SQL, colunar**): **separa armazenamento e processamento** e **cobra** **por dados processados (sob demanda) ou por capacidade reservada**. **Cuidados com custo:** **consultas que varrem tabelas inteiras** **custam muito**; **particione e agrupe (cluster) tabelas**, **selecione só as colunas necessárias** (**evite §SELECT *§**) **e use estimativa de bytes antes de executar** (***dry run***).

### Boas práticas
- **Um projeto por ambiente e carga**, **pastas para políticas comuns**, **políticas de organização** (**restrições**: **ex.: bloquear criação de chaves de conta de serviço**).
- **Menor privilégio com papéis predefinidos/personalizados**, **sem Owner/Editor em produção**.
- **Rótulos (*labels*) para custo**, **orçamentos e alertas por projeto**.
- **Auditoria:** **Cloud Audit Logs**.

### Executado e não executado
**Executado:** **nenhum comando do Google Cloud**; **a herança com negação é modelada no exercício**. **Não executado:** **console, §gcloud§, Cloud Run, GKE, BigQuery, Workload Identity Federation**.`,
  concepts: [
    { term: 'Projeto (GCP)', def: 'Unidade fundamental do Google Cloud para cobrança, APIs, cotas e permissões, em que vivem todos os recursos.' },
    { term: 'Pasta (folder)', def: 'Agrupamento de projetos na hierarquia que permite herdar políticas de IAM.' },
    { term: 'Conta de serviço', def: 'Identidade para aplicações e cargas de trabalho, que recebe papéis como qualquer principal.' },
    { term: 'Política de negação', def: 'Política IAM que impede permissões específicas mesmo que haja concessões em allow.' },
    { term: 'Workload Identity Federation', def: 'Federação que troca a identidade de uma carga externa (como um pipeline) por credenciais temporárias, sem chaves.' },
    { term: 'Cloud Run', def: 'Serviço que executa contêineres sem estado com escalonamento automático, inclusive a zero, e cobrança por uso.' },
    { term: 'BigQuery', def: 'Armazém de dados analítico sem servidor com SQL, que separa armazenamento e processamento.' },
    { term: 'VPC global', def: 'Rede virtual do Google Cloud que abrange regiões, com sub-redes regionais.' }
  ],
  examples: R`**Analogia:** **a hierarquia é um condomínio**: **a organização é o condomínio**, **as pastas são os blocos**, **os projetos são os apartamentos**. **A chave do bloco abre todos os apartamentos dele** (**herança**), **mas uma "proibição" do síndico** (**deny**) **vale mais do que qualquer chave**. **A conta de serviço é o crachá do robô de limpeza**: **limitada ao que ele precisa**.

**Exemplo concreto:** **uma pasta §producao§ com a política "Viewer" para o grupo de auditores** **dá leitura a todos os projetos nela**; **uma política de negação** **impede apagar buckets** **mesmo para quem tem papel de administrador de armazenamento** **naquele projeto**. **No exercício você calcula a decisão combinando concessões herdadas e negações.**`,
  code: [
    { title: 'Concessão de papel a uma conta de serviço (exemplo analisado, não executado)', lang: 'bash', code: R`# Cria a conta de serviço da aplicação (identidade da carga, não de uma pessoa)
gcloud iam service-accounts create app-pedidos --project=meu-projeto-prod

# Concede apenas leitura de objetos, no projeto
gcloud projects add-iam-policy-binding meu-projeto-prod \
  --member="serviceAccount:app-pedidos@meu-projeto-prod.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"`, notes: [{ l: 2, t: 'O identificador do projeto é fictício.' }, { l: 5, t: 'Papel predefinido mínimo em vez de Editor ou Owner.' }] },
    { title: 'Decisão com herança e negação (modelo usado no exercício)', lang: 'javascript', code: R`// caminho = ["org", "pasta", "projeto", "recurso"]; allow é herdado; deny vence
function decidir(caminho, principal, permissao, allows, denies) {
  const noCaminho = (r) => caminho.includes(r);
  if (denies.some((d) => noCaminho(d.recurso) && d.principal === principal && d.permissoes.includes(permissao))) return 'NEGADO (deny)';
  const ok = allows.some((a) => noCaminho(a.recurso) && a.principal === principal && a.permissoes.includes(permissao));
  return ok ? 'PERMITIDO' : 'NEGADO (implícito)';
}`, notes: [{ l: 3, t: 'O deny é avaliado antes dos allows.' }, { l: 5, t: 'O allow vale se concedido em qualquer ancestral.' }] }
  ],
  bestPractices: ['Use um projeto por ambiente e carga e pastas para políticas comuns.', 'Prefira papéis predefinidos ou personalizados mínimos; evite Owner e Editor em produção.', 'Evite chaves JSON de contas de serviço; use credenciais anexadas ao recurso ou Workload Identity Federation.', 'Use políticas de organização e de negação para guardrails.', 'Aplique labels, orçamentos e alertas por projeto.', 'Controle o custo do BigQuery com particionamento, colunas selecionadas e dry run.', 'Não presuma equivalência exata de serviços ao comparar provedores.'],
  mistakes: ['Conceder Owner ou Editor para resolver permissões.', 'Baixar e versionar chaves de contas de serviço.', 'Um único projeto para tudo, sem isolamento de ambientes.', 'Executar SELECT * em tabelas enormes do BigQuery.', 'Assumir que a VPC do Google Cloud funciona como a regional da AWS.', 'Ignorar os limites atuais do Cloud Run (tempo, concorrência).'],
  market: R`**Google Cloud** é **buscado em dados (BigQuery), Kubernetes (GKE) e contêineres sem servidor (Cloud Run)**; **entender hierarquia e herança de IAM** **é base para segurança** em qualquer provedor.`,
  summary: R`O Google Cloud organiza recursos em organização, pastas e projetos, com políticas de IAM herdadas e políticas de negação que sobrepõem as concessões. Principais recebem papéis (básicos, predefinidos ou personalizados); contas de serviço identificam cargas e não devem usar chaves de longa duração, preferindo credenciais do ambiente ou Workload Identity Federation. A VPC é global; Cloud Run executa contêineres sem estado com escala a zero e divisão de tráfego entre revisões; BigQuery é um armazém sem servidor cujo custo depende dos dados processados. A tabela de serviços é um mapa aproximado com AWS e Azure. Nenhum comando do Google Cloud foi executado.`,
  refs: [REF2.gcpHierarchy, REF2.gcpIam, REF2.gcpServiceAcc, REF2.gcpVpc, REF2.gcpRun, REF2.gcpProducts],
  cards: [
    { q: 'Como funciona a herança de IAM no Google Cloud?', a: 'As políticas allow de organização, pastas e projeto se somam para o recurso; políticas de negação sobrepõem as concessões.' },
    { q: 'Por que evitar chaves JSON de contas de serviço?', a: 'São credenciais de longa duração que vazam; prefira credenciais anexadas ao recurso ou Workload Identity Federation.' },
    { q: 'O que há de diferente na VPC do Google Cloud?', a: 'Ela é global (abrange regiões), com sub-redes regionais, ao contrário da VPC da AWS e da VNet do Azure, que são regionais.' },
    { q: 'Como reduzir o custo no BigQuery?', a: 'Particionar e agrupar tabelas, selecionar apenas as colunas necessárias e estimar os bytes com dry run.' }
  ]
},
{
  id: 'cld-05', moduleId: 'm3', order: 5, minutes: 85, tags: ['serverless', 'FaaS', 'cold start', 'idempotência', 'event-driven', 'Lambda', 'Functions', 'Cloud Run', 'lei de Little'],
  title: 'Serverless: funções, eventos, cold start e idempotência, com um modelo executado',
  objectives: ['Explicar o modelo de execução de funções (FaaS), eventos, escala e cobrança', 'Medir, em um modelo, a diferença entre inicialização fria e invocação quente', 'Projetar handlers idempotentes para entrega pelo menos uma vez', 'Dimensionar concorrência com a lei de Little e saber quando serverless não é a melhor escolha'],
  intro: R`**Serverless** **não significa "sem servidor"**: significa **"sem gerenciar servidor"**. Você **entrega uma função ou um contêiner**, **a plataforma** **liga, escala e desliga**, **e você paga pelo uso**. Os **problemas novos** são **cold start**, **limites**, **entrega repetida de eventos** e **custo imprevisível em alto volume**. Aqui você **executa um modelo local** que **mede o cold start** e **mostra a duplicação sem idempotência**. **Aviso:** **não é a AWS Lambda nem outro serviço real**; **os tempos são do modelo**.`,
  theory: R`### O modelo
- **FaaS** (***Functions as a Service***): **AWS Lambda**, **Azure Functions**, **Cloud Run functions**: **uma função disparada por um evento** (**HTTP, fila, arquivo no bucket, agendamento, mudança no banco**).
- **BaaS** (***Backend as a Service***): **serviços gerenciados** **usados como blocos** (**autenticação, banco, armazenamento**).
- **Contêineres sem servidor:** **Cloud Run**, **Fargate**, **Container Apps**: **você traz uma imagem**; **a plataforma cuida do restante**.
**Características comuns:** **escala automática (inclusive a zero)**, **cobrança por requisição e tempo/memória**, **sem estado local entre invocações**, **limites** (**tempo máximo, memória, tamanho do pacote, concorrência**: **mudam: consulte a documentação do provedor**).

### Ciclo de vida e cold start (modelo executado)
**Uma invocação** **encontra um ambiente de execução** **já pronto ("quente")** **ou precisa criar um ("frio")**: **baixar o código, iniciar o runtime e executar o código de inicialização** (**importações, conexões**). **O ambiente é reutilizado** **por algum tempo** **e depois reciclado**. **Medido no modelo local** (**inicialização simulada com carga de CPU; Node 26.13.1**):
| Invocação | Estado | Tempo |
|---|---|---|
| **#1** | **FRIA** | **469,5 ms** |
| **#2 a #6** | **quente** | **0,006 a 0,01 ms** |
| **após reciclar o ambiente** | **FRIA** | **459,9 ms** |
**Leitura:** **a inicialização domina a primeira invocação**; **as seguintes são ordens de grandeza mais rápidas**; **reciclar o ambiente traz o custo de volta**. **No modelo o frio é artificial** (**o valor depende da carga escolhida**): **o que se generaliza é o comportamento, não o número**. **Em serviços reais** o cold start **depende de linguagem, tamanho do pacote, memória, rede (VPC) e inicialização**; **existem recursos para mitigá-lo** (**instâncias mínimas/provisionadas, aquecimento, imagens menores, inicialização preguiçosa**; **verifique em cada provedor**).
**Boas práticas:** **inicialize clientes e conexões fora do handler** (**reaproveitados nas quentes**), **mantenha o pacote pequeno**, **evite trabalho pesado na inicialização**, **meça a latência de cauda (p99)**, **não só a média**.

### Entrega pelo menos uma vez e idempotência (modelo executado)
**Filas e eventos** (**SQS, Pub/Sub, Service Bus, EventBridge**) **normalmente garantem "pelo menos uma vez"**: **a mesma mensagem pode chegar mais de uma vez** (**retentativas, timeouts, falhas parciais**). **Sem proteção, o efeito se repete.** **Medido no modelo:** **a mesma mensagem (débito de 30 sobre saldo 100) entregue 3 vezes**:
- **com chave de idempotência** (**o identificador da mensagem registrado antes de aplicar o efeito**): **processada, duplicada-ignorada, duplicada-ignorada → saldo 70**;
- **sem chave**: **saldo 10** (**três débitos**).
**Como implementar de verdade:** **chave única** (**ID da mensagem ou do pedido**) **em uma tabela com restrição de unicidade** (**insert-if-not-exists atômico**), **ou operações naturalmente idempotentes** (**"definir o status como pago" em vez de "somar 30"**); **registrar o resultado** **para devolver a mesma resposta**; **expirar chaves depois de um prazo**. **Atenção a efeitos externos** (**e-mail, pagamento**): **use as chaves de idempotência dos próprios provedores**.
**Falhas e retentativas:** **defina limite de tentativas** **e uma fila de mensagens mortas (DLQ)** **para os venenos** (**mensagens que sempre falham**) **com alarme**; **funções devem terminar dentro do tempo de visibilidade da fila**.

### Dimensionando a concorrência: a lei de Little
**Concorrência = taxa de chegada × duração**. **Exemplo:** **200 requisições por segundo** **com duração média de 0,25 s** **→ 50 execuções simultâneas**. **Use para**: **comparar com os limites de concorrência da conta/serviço**, **dimensionar pools de conexão do banco** (**mil funções simultâneas abrem mil conexões: o banco satura**: **use *proxy* de conexões/pools gerenciados**) **e planejar reservas**.

### Quando serverless é bom (e quando não é)
**Bom para:** **tráfego irregular ou imprevisível**, **eventos e integrações**, **tarefas agendadas**, **APIs de baixo volume**, **protótipos**, **picos curtos**. **Pior para:** **carga alta e constante** (**no modelo de custos do laboratório, a partir de ~10,9 milhões de requisições/mês a VM fixa fica mais barata**; **preços fictícios, aula 6**), **processos longos**, **latência ultrabaixa e previsível**, **estado em memória**, **bibliotecas nativas pesadas**, **dependência de recursos de baixo nível**. **Trade-offs:** **menos operação**, **mais acoplamento ao provedor** (**eventos, permissões, formato do handler**); **observabilidade distribuída** (**traces, correlação**) **fica essencial**.

### Segurança
**Uma função por finalidade com papel mínimo**; **segredos em gerenciadores de segredos**, **não em variáveis de ambiente em texto no código**; **validação de entrada de eventos** (**eventos também são entrada não confiável**); **limites de concorrência e orçamento** **para evitar custo descontrolado** (**um laço de eventos pode gerar uma conta enorme**).

### Executado e não executado
**Executado:** **o modelo de cold start/warm e de idempotência** (**Node 26.13.1**, sem provedor). **Não executado:** **AWS Lambda, Azure Functions, Cloud Run, filas reais, DLQ, concorrência provisionada, medição de cold start de um serviço real**.`,
  concepts: [
    { term: 'FaaS', def: 'Modelo em que funções são executadas sob demanda em resposta a eventos, com escala e cobrança por uso.' },
    { term: 'Cold start', def: 'Atraso adicional da primeira invocação em um ambiente novo, que precisa ser criado e inicializado.' },
    { term: 'Entrega pelo menos uma vez', def: 'Garantia de mensageria em que cada mensagem chega uma ou mais vezes, podendo haver duplicatas.' },
    { term: 'Idempotência', def: 'Propriedade de repetir uma operação sem efeito adicional além da primeira execução.' },
    { term: 'DLQ', def: 'Fila de mensagens mortas, que guarda mensagens que excederam as tentativas de processamento.' },
    { term: 'Lei de Little', def: 'Relação em que o número médio de itens em um sistema é a taxa de chegada multiplicada pelo tempo de permanência.' },
    { term: 'Event-driven', def: 'Arquitetura em que componentes reagem a eventos em vez de chamadas síncronas diretas.' },
    { term: 'Escala a zero', def: 'Capacidade de uma plataforma de desligar todas as instâncias quando não há demanda.' }
  ],
  examples: R`**Analogia:** **serverless é um táxi** (**paga-se por corrida, sem garagem**); **mais barato para quem anda pouco, mais caro para quem roda o dia inteiro** (**melhor ter carro**). **O cold start é o tempo de o táxi chegar**; **a idempotência é o motorista que não cobra duas vezes pela mesma corrida** **se o cartão passar duas vezes**.

**Exemplo concreto (modelo):** **a primeira invocação levou 469,5 ms (fria) e as seguintes 0,006–0,01 ms**; **uma mensagem de débito entregue 3 vezes deixou o saldo em 70 com chave de idempotência e em 10 sem ela**.`,
  code: [
    { title: 'Handler idempotente com inicialização fora do handler (modelo; executado em Node 26.13.1)', lang: 'javascript', code: R`// Inicialização: executada uma vez por ambiente (custo do cold start)
const processados = new Set(); // em produção: tabela com restrição de unicidade
let saldo = 100;

export function handler(evento) {
  if (processados.has(evento.id)) return 'duplicada-ignorada';
  processados.add(evento.id);
  saldo -= evento.valor;
  return 'processada';
}

const msg = { id: 'pedido-1', valor: 30 };
console.log(handler(msg), handler(msg), handler(msg), saldo); // processada duplicada-ignorada duplicada-ignorada 70`, notes: [{ l: 1, t: 'Fora do handler: reaproveitado em invocações quentes.' }, { l: 2, t: 'Em produção use armazenamento durável e atômico.' }, { l: 6, t: 'Verificar antes de aplicar o efeito.' }] },
    { title: 'Medindo cold start e invocação quente (modelo)', lang: 'javascript', code: R`import { performance } from 'node:perf_hooks';
function inicializar() { let x = 0; for (let i = 0; i < 4e7; i++) x += i % 7; return { pronto: true, x }; }
let ambiente = null;
async function invocar(evento) {
  const t0 = performance.now();
  let frio = false;
  if (!ambiente) { ambiente = inicializar(); frio = true; }
  return { frio, ms: +(performance.now() - t0).toFixed(3) };
}
// 1a: frio (~460 ms no laboratorio); seguintes: quentes (~0,01 ms)`, notes: [{ l: 2, t: 'Inicialização simulada com carga de CPU.' }, { l: 7, t: 'Só a primeira invocação paga a inicialização.' }] }
  ],
  bestPractices: ['Inicialize clientes e conexões fora do handler e mantenha o pacote pequeno.', 'Projete handlers idempotentes, com chave única e armazenamento atômico.', 'Use DLQ, limite de tentativas e alarmes para mensagens que sempre falham.', 'Dimensione a concorrência com a lei de Little e proteja o banco com pools ou proxies de conexão.', 'Meça a latência de cauda, não só a média, e considere mitigação de cold start quando necessário.', 'Dê a cada função um papel mínimo e valide as entradas de eventos.', 'Defina limites de concorrência e orçamento para evitar custo descontrolado.'],
  mistakes: ['Assumir que o evento chega só uma vez.', 'Abrir uma conexão de banco por invocação sem limite de concorrência.', 'Fazer trabalho pesado dentro do handler a cada invocação.', 'Escolher serverless para carga alta e constante sem calcular o custo.', 'Ignorar limites de tempo e de tamanho.', 'Confiar no número de cold start de um modelo ou de outro provedor.'],
  market: R`**Serverless e arquiteturas orientadas a eventos** **são tema de arquitetura em nuvem**; **explicar cold start, idempotência e quando não usar** **diferencia** **profissionais** **de quem só viu o tutorial**.`,
  summary: R`Serverless entrega funções ou contêineres a uma plataforma que escala (inclusive a zero) e cobra por uso, com novos problemas: cold start, limites, entrega pelo menos uma vez e custo em alto volume. No modelo executado a primeira invocação levou 469,5 ms e as quentes 0,006 a 0,01 ms, voltando a 459,9 ms após reciclar o ambiente; uma mensagem entregue três vezes deixou o saldo em 70 com chave de idempotência e em 10 sem ela. Dimensione concorrência com a lei de Little, use DLQ e pools de conexão e escolha serverless para tráfego irregular, não para carga alta constante. Nenhum serviço real foi usado.`,
  refs: [REF2.lambdaDocs, REF2.lambdaEnv, REF2.azureFunctions, REF2.gcpRun, REF2.sqsDelivery],
  cards: [
    { q: 'O que é cold start?', a: 'O atraso da primeira invocação em um ambiente novo, que precisa ser criado e inicializado; as invocações seguintes reaproveitam o ambiente.' },
    { q: 'Por que tornar handlers idempotentes?', a: 'Porque filas e eventos entregam pelo menos uma vez; sem chave de idempotência uma mensagem repetida repete o efeito (no modelo: saldo 10 em vez de 70).' },
    { q: 'Como estimar a concorrência de uma função?', a: 'Pela lei de Little: taxa de chegada vezes duração (200 req/s x 0,25 s = 50 execuções simultâneas).' },
    { q: 'Quando serverless deixa de compensar?', a: 'Com carga alta e constante, processos longos ou latência previsível ultrabaixa; compare o custo com uma VM ou contêiner fixos.' }
  ]
},
{
  id: 'cld-06', moduleId: 'm3', order: 6, minutes: 85, tags: ['FinOps', 'custos', 'egress', 'reserva', 'spot', 'tags', 'orçamento', 'multi-cloud', 'lock-in'],
  title: 'Custos (FinOps) e multi-cloud: modelar, otimizar e decidir sobre portabilidade',
  objectives: ['Identificar os vetores de custo (computação, armazenamento, rede, requisições) e os modelos de compra', 'Construir um modelo de custo e calcular pontos de equilíbrio com premissas explícitas', 'Aplicar o ciclo FinOps (informar, otimizar, operar) com tags, orçamentos e alertas', 'Avaliar multi-cloud e lock-in com argumentos de custo e risco, sem dogma'],
  intro: R`**Nuvem barata** **é uma escolha, não um padrão**: **o mesmo sistema pode custar dez vezes mais** **por falta de dimensionamento, de desligamento e de visibilidade**. **FinOps** **é a prática de tornar o custo visível e responsável**. **Multi-cloud** **é uma decisão de risco com custo próprio**, **não um objetivo**. **Aviso importante:** **os preços do laboratório são FICTÍCIOS** (**não são de nenhum provedor**); **os preços reais mudam: use as calculadoras oficiais**.`,
  theory: R`### De onde vem o custo
- **Computação:** **instâncias, vCPU/memória, tempo ligado** (**ou requisições e GB-segundo no serverless**).
- **Armazenamento:** **GB por mês × classe** (**quente, fria, arquivo**), **mais requisições e recuperação**.
- **Rede:** **entrada costuma ser gratuita; saída (*egress*) para a internet e entre regiões/zonas costuma ser cobrada**: **é a conta "escondida" de muitas arquiteturas** (**e o principal custo de sair de um provedor**).
- **Serviços gerenciados:** **preço pela conveniência** (**bancos, balanceadores, NAT Gateways**: **cobram por hora e por GB**).
- **Dados e observabilidade:** **logs, métricas e traces ingeridos e retidos** **podem custar tanto quanto a computação**.

### Modelos de compra (conceitos comuns aos três provedores)
**Sob demanda** (**flexível, mais caro**); **compromisso de uso** (**reservas, *Savings Plans*, *committed use discounts*: desconto por comprometer 1–3 anos de uso**: **só vale para carga estável e previsível**); **capacidade ociosa com desconto** (**Spot/preemptível: pode ser interrompida em minutos: para cargas tolerantes a falhas e reiniciáveis**); **gratuito/camadas gratuitas** (**regras mudam**). **Cálculo básico do compromisso:** **desconto × fração de utilização**: **se você compromete 100% e usa 60%, paga por 40% ociosos**.

### Um modelo de custo executável (preços FICTÍCIOS)
**Premissas declaradas** (**inventadas**): **VM fixa = 25/mês**; **serverless = 0,30 por milhão de requisições + 0,00002 por GB-s**, **com 0,5 GB e 0,2 s por requisição**.
| Requisições/mês | Serverless | VM | Mais barato |
|---|---|---|---|
| **100 mil** | **0,23** | 25,00 | serverless |
| **1 milhão** | **2,30** | 25,00 | serverless |
| **10 milhões** | **23,00** | 25,00 | serverless |
| **50 milhões** | **115,00** | 25,00 | **VM** |
| **100 milhões** | **230,00** | 25,00 | **VM** |
**Ponto de equilíbrio:** **≈ 10,87 milhões de requisições/mês** (**25 ÷ 2,3 por milhão**). **Egress fictício** (**0,08/GB**): **5 TB/mês = 400**. **Lições:** (1) **o ponto de equilíbrio depende de todas as premissas**: **mude a duração ou a memória e ele se desloca**; (2) **o modelo ignora** **operação humana, tempo de engenharia, latência, disponibilidade e custos de rede**: **a VM "barata" exige que alguém a opere**; (3) **sempre explicite as premissas e teste a sensibilidade**.

### FinOps: o ciclo
1. **Informar:** **visibilidade e alocação**: **tags/labels obrigatórias** (**equipe, ambiente, produto**), **contas/projetos por carga**, **relatórios de custo**, **custo unitário** (**custo por pedido, por usuário**).
2. **Otimizar:** **dimensionar corretamente** (***rightsizing***), **desligar o ocioso** (**ambientes de teste à noite**), **trocar classes de armazenamento**, **compromissos e Spot** **onde cabem**, **arquitetura** (**cache, compressão, regiões**).
3. **Operar:** **orçamentos e alertas**, **detecção de anomalias**, **revisões periódicas**, **responsabilização** (**cada equipe vê seu custo**).
**Cultura:** **engenharia, finanças e negócio** **decidem juntos**; **o objetivo é valor por unidade de custo**, **não o menor custo**.
**Armadilhas comuns:** **recursos esquecidos** (**discos, IPs, snapshots**), **NAT Gateways e tráfego entre zonas**, **logs em nível debug em produção**, **ambientes de desenvolvimento ligados 24 h**, **dados em classe quente sem acesso**.

### Multi-cloud e lock-in
**Motivos para considerar:** **requisitos regulatórios ou de soberania**, **resiliência a falha de um provedor**, **melhor serviço de cada um** (***best of breed***), **poder de negociação**, **aquisições**. **Custos:** **complexidade operacional e de segurança** (**identidade, redes e observabilidade em duplicidade**), **mínimo denominador comum** (**abre mão de serviços diferenciados**), **habilidades dobradas**, **egress entre nuvens**, **mais superfícies de erro**. **Posição prática:** **multi-cloud "por padrão" costuma ser um antipadrão**; **"uma nuvem principal com saída planejada" costuma ser mais racional**.
**Gerenciar o lock-in (sem eliminá-lo):**
- **contêineres e Kubernetes** (**mesma imagem em Cloud Run, Fargate e Container Apps**);
- **Terraform/OpenTofu** (**curso C6.5**) **e padrões abertos** (**SQL, S3-compatível, OpenTelemetry**);
- **dados exportáveis** (**formatos abertos e plano de saída**);
- **camadas de abstração finas** **nos pontos de maior acoplamento** (**filas, armazenamento**);
- **medir o custo de sair** (**egress e retrabalho**) **e decidir conscientemente**.
**Lock-in não é só ruim**: **serviços gerenciados e serverless trazem produtividade**; **o risco é desconhecer o preço da saída**.

### O que decidir e como registrar
**ADRs** (**registros de decisão de arquitetura**) **com premissas de custo, alternativas e critérios de revisão**. **Reavalie quando as premissas mudarem** (**volume dobrou, preço mudou, novo serviço**).

### Executado e não executado
**Executado:** **o modelo de custos com preços fictícios** (**ponto de equilíbrio de ~10,87 milhões de req/mês**). **Não executado:** **calculadoras reais, faturas, orçamentos, tags, Savings Plans, Spot, migração entre nuvens, medição de egress**.`,
  concepts: [
    { term: 'FinOps', def: 'Prática de gestão financeira da nuvem que torna o custo visível, atribuível e otimizado em conjunto por engenharia, finanças e negócio.' },
    { term: 'Egress', def: 'Tráfego de saída de dados do provedor ou entre regiões, geralmente cobrado.' },
    { term: 'Rightsizing', def: 'Ajuste do tamanho dos recursos à demanda real para eliminar desperdício.' },
    { term: 'Compromisso de uso', def: 'Desconto obtido ao se comprometer com um volume de uso por um ou mais anos.' },
    { term: 'Spot / preemptível', def: 'Capacidade ociosa com grande desconto que pode ser interrompida com pouco aviso.' },
    { term: 'Tag / label', def: 'Rótulo associado a um recurso para alocar custo, ambiente e responsável.' },
    { term: 'Lock-in', def: 'Dependência de um fornecedor que torna a saída custosa em dinheiro e esforço.' },
    { term: 'Ponto de equilíbrio', def: 'Volume em que duas alternativas de custo se igualam.' }
  ],
  examples: R`**Analogia:** **a nuvem é a conta de luz da casa**: **sem medidor por cômodo** **ninguém sabe quem deixou o ar-condicionado ligado**; **tags são os medidores**, **orçamentos são os alertas** e **rightsizing é trocar o chuveiro de 7.500 W por um de 4.500 W**. **Multi-cloud é ter duas companhias de energia na mesma casa**: **dá segurança, mas dobra a instalação e a conta fixa**.

**Exemplo concreto (modelo fictício):** **até ~10,9 milhões de requisições/mês o serverless custa menos que a VM de 25**; **aos 100 milhões custa 230**. **Mudar a duração de 0,2 s para 0,1 s** **reduz a parcela de GB-segundo** **e desloca o equilíbrio para cima**: **por isso se testa a sensibilidade**.`,
  code: [
    { title: 'Modelo de custo com preços fictícios (executado em Node 26.13.1)', lang: 'javascript', code: R`const P = { vmMes: 25, reqPorMilhao: 0.30, gbSegundo: 0.00002, memGB: 0.5, duracaoS: 0.2 }; // FICTÍCIOS
const serverless = (reqMes) =>
  (reqMes / 1e6) * P.reqPorMilhao + reqMes * P.duracaoS * P.memGB * P.gbSegundo;

const custoPorReq = serverless(1e6) / 1e6;
console.log(Math.round(P.vmMes / custoPorReq)); // 10869565 (ponto de equilíbrio)
console.log(serverless(1e8).toFixed(2));        // 230.00`, notes: [{ l: 1, t: 'Premissas explícitas e inventadas; troque pelos preços reais da calculadora oficial.' }, { l: 2, t: 'Custo por requisição + custo por GB-segundo.' }, { l: 5, t: 'Equilíbrio = custo fixo da VM dividido pelo custo por requisição.' }] },
    { title: 'Análise de sensibilidade (exercício guiado)', lang: 'javascript', code: R`for (const duracaoS of [0.05, 0.1, 0.2, 0.4]) {
  const c = (1e6 / 1e6) * 0.30 + 1e6 * duracaoS * 0.5 * 0.00002;
  console.log(duracaoS, 'equilíbrio ≈', Math.round(25 / (c / 1e6)), 'req/mês');
}`, notes: [{ l: 2, t: 'Custo de 1 milhão de requisições para cada duração.' }, { l: 3, t: 'Quanto menor a duração, maior o volume em que o serverless compensa.' }] }
  ],
  bestPractices: ['Torne o custo visível com tags obrigatórias, contas ou projetos por carga e custo unitário.', 'Explicite as premissas de qualquer modelo de custo e teste a sensibilidade.', 'Aplique orçamentos e alertas e detecte anomalias.', 'Dimensione corretamente e desligue o que não é usado; compromisse apenas carga estável.', 'Use Spot ou preemptível só para cargas reiniciáveis.', 'Considere egress, NAT, tráfego entre zonas e retenção de logs na arquitetura.', 'Documente decisões de portabilidade e do custo de saída em ADRs.'],
  mistakes: ['Esquecer recursos ligados (discos, IPs, ambientes de teste).', 'Comprometer 100% de uso quando a utilização real é menor.', 'Ignorar o egress até chegar a fatura.', 'Adotar multi-cloud por padrão sem necessidade concreta.', 'Comparar preços de lista sem considerar operação e engenharia.', 'Usar preços de um exemplo como se fossem de um provedor.'],
  market: R`**FinOps** **é uma das áreas que mais cresce** em **nuvem**; **saber modelar custo, justificar compromissos e discutir lock-in com números** **é diferencial** em **arquitetura e liderança técnica**.`,
  summary: R`O custo na nuvem vem de computação, armazenamento, rede (egress), serviços gerenciados e observabilidade, e se reduz com dimensionamento, desligamento, compromissos para carga estável e Spot para cargas reiniciáveis. Em um modelo com preços fictícios, o serverless é mais barato até cerca de 10,87 milhões de requisições por mês e a VM de 25 vence acima disso, e o resultado depende das premissas, por isso se testa a sensibilidade. FinOps é o ciclo informar, otimizar e operar, com tags, orçamentos e responsabilização. Multi-cloud resolve riscos específicos ao custo de complexidade; o lock-in se gerencia com contêineres, IaC, formatos abertos e conhecimento do custo de saída. Nenhum preço real foi consultado ou medido.`,
  refs: [REF2.finops, REF2.awsPricing, REF2.azurePricing, REF2.gcpPricing],
  cards: [
    { q: 'O que é egress e por que importa?', a: 'Tráfego de saída de dados do provedor ou entre regiões, geralmente cobrado; é um custo escondido e o principal custo de sair de um provedor.' },
    { q: 'Quando vale um compromisso de uso (reserva)?', a: 'Para carga estável e previsível; comprometer mais do que se usa significa pagar por capacidade ociosa.' },
    { q: 'Quais são as fases do ciclo FinOps?', a: 'Informar (visibilidade e alocação), otimizar (rightsizing, compromissos, arquitetura) e operar (orçamentos, alertas e revisões).' },
    { q: 'Por que multi-cloud por padrão costuma ser um antipadrão?', a: 'Dobra a complexidade operacional, de segurança e de habilidades e limita ao mínimo denominador comum; vale só com requisitos concretos (regulação, resiliência, negociação).' }
  ]
}
];
