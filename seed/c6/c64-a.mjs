// C6.4 — Cloud (AWS, Azure, Google Cloud). Aulas 1 a 3 (conceitos; AWS; Azure).
const R = String.raw;

export const REF = {
  nist: { title: 'NIST SP 800-145 — The NIST Definition of Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/145/final', kind: 'norma' },
  awsShared: { title: 'AWS — Shared Responsibility Model', url: 'https://aws.amazon.com/compliance/shared-responsibility-model/', kind: 'doc' },
  awsWaf: { title: 'AWS Well-Architected Framework', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html', kind: 'guia' },
  azureWaf: { title: 'Microsoft Azure Well-Architected Framework', url: 'https://learn.microsoft.com/en-us/azure/well-architected/', kind: 'guia' },
  gcpWaf: { title: 'Google Cloud Well-Architected Framework', url: 'https://cloud.google.com/architecture/framework', kind: 'guia' },
  awsRegions: { title: 'AWS — Regions and Availability Zones', url: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/', kind: 'doc' },
  awsIamEval: { title: 'AWS IAM — Policy evaluation logic', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html', kind: 'doc' },
  awsIamBest: { title: 'AWS IAM — Security best practices', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html', kind: 'guia' },
  awsVpc: { title: 'Amazon VPC — What is Amazon VPC?', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html', kind: 'doc' },
  awsEc2: { title: 'Amazon EC2 — What is Amazon EC2?', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html', kind: 'doc' },
  awsS3: { title: 'Amazon S3 — What is Amazon S3?', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html', kind: 'doc' },
  azureHierarchy: { title: 'Azure — Resource organization (management groups, subscriptions, resource groups)', url: 'https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-setup-guide/organize-resources', kind: 'doc' },
  azureRbac: { title: 'Azure RBAC — What is Azure role-based access control?', url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/overview', kind: 'doc' },
  azureVnet: { title: 'Azure Virtual Network — What is Azure Virtual Network?', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview', kind: 'doc' },
  azureManagedId: { title: 'Azure — Managed identities for Azure resources', url: 'https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview', kind: 'doc' },
  azureAppSvc: { title: 'Azure App Service — Overview', url: 'https://learn.microsoft.com/en-us/azure/app-service/overview', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'cld-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['nuvem', 'IaaS', 'PaaS', 'SaaS', 'responsabilidade compartilhada', 'regiões', 'zonas de disponibilidade', 'SLA', 'disponibilidade'],
  title: 'Conceitos de nuvem: modelos de serviço, responsabilidade compartilhada, regiões e disponibilidade',
  objectives: ['Definir computação em nuvem pelas características do NIST e diferenciar IaaS, PaaS, SaaS e FaaS', 'Dividir as responsabilidades entre provedor e cliente em cada modelo', 'Explicar regiões, zonas de disponibilidade e domínios de falha', 'Calcular indisponibilidade permitida por SLA e a disponibilidade de composições em série e em paralelo'],
  intro: R`**"Nuvem"** não é **"o computador de outra pessoa"** apenas: é **um modelo de consumo** (**sob demanda, medido, elástico**) **com um contrato de responsabilidades**. Entender **o vocabulário e a matemática da disponibilidade** vem **antes** de **abrir qualquer console**. **Aviso desta unidade:** **não havia conta de nuvem neste ambiente**; o conteúdo dos provedores é **análise da documentação**, e o que foi **executado** são **modelos locais** (**disponibilidade, IAM, serverless e custos**).`,
  theory: R`### A definição do NIST
O **NIST SP 800-145** define **cinco características essenciais**: **autoatendimento sob demanda**, **amplo acesso pela rede**, ***pool* de recursos** (**multi-inquilino**), **elasticidade rápida** e **serviço medido**. **Modelos de serviço:** **IaaS** (**infraestrutura**: VMs, redes, discos), **PaaS** (**plataforma**: **você leva o código**) e **SaaS** (**software pronto**). **Modelos de implantação:** **pública**, **privada**, **comunitária** e **híbrida**. **Hoje** também se fala em **CaaS** (**contêineres como serviço**) e **FaaS** (**funções**, aula 5).

### Quem cuida de quê (responsabilidade compartilhada)
**O provedor** cuida **"da nuvem"** (**instalações, hardware, rede física, virtualização**); **o cliente** cuida **"na nuvem"** (**dados, identidade, configuração, código**). **A fronteira muda por modelo:**
| Camada | On-premises | IaaS | CaaS/PaaS | FaaS | SaaS |
|---|---|---|---|---|---|
| **Dados e acesso (identidade)** | você | **você** | **você** | **você** | **você** |
| **Código/aplicação** | você | **você** | **você** | **você** | provedor |
| **Runtime e SO** | você | **você** | provedor | provedor | provedor |
| **Virtualização e hardware** | você | provedor | provedor | provedor | provedor |
**Regra de ouro:** **dados, identidade e configuração são sempre seus**. **A maioria dos vazamentos em nuvem** vem **de configuração do cliente** (**bucket público, permissões amplas, chaves expostas**), **não de falha do provedor**.

### Regiões, zonas e domínios de falha
- **Região:** **área geográfica** com **vários datacenters**; **escolha por latência, custo, serviços disponíveis, conformidade e residência de dados** (**LGPD/GDPR**).
- **Zona de disponibilidade (AZ):** **um ou mais datacenters isolados** (**energia, rede**) **dentro da região**; **distribuir instâncias em ≥ 2 AZs** **protege contra a queda de uma**.
- **Multirregião:** **protege contra a queda de uma região** (**raro, porém real**), **ao custo de complexidade, latência de replicação e preço**.
- **Domínios de falha:** **instância → rack/host → AZ → região → provedor**; **projete para o domínio de falha que o negócio exige sobreviver**.
**Termos de cada provedor** (**regiões, AZs, geografias, zonas**) **diferem em detalhes**: consulte **a documentação**.

### Elasticidade, escalabilidade e custo
**Escalabilidade vertical** (**máquina maior**) **tem teto** e **costuma exigir reinício**; **horizontal** (**mais instâncias**) **exige aplicação sem estado** (**sessões fora**, **dados em serviços gerenciados**). **Elasticidade** = **escalar para cima e para baixo automaticamente conforme a demanda**: **só gera economia se a aplicação desliga o que não usa**. **"Lift and shift"** (**migrar a VM como está**) **raramente aproveita a nuvem**; **o ganho vem de gerenciados, elasticidade e automação**.

### Disponibilidade: a matemática (modelo executado)
**SLA 99,9%** parece **quase perfeito**, mas **permite 43,2 minutos de indisponibilidade em 30 dias**. **Medido (cálculo no laboratório):**
| Disponibilidade | Indisponibilidade em 30 dias |
|---|---|
| **99%** | **432 min** (~7,2 h) |
| **99,5%** | **216 min** |
| **99,9%** | **43,2 min** |
| **99,95%** | **21,6 min** |
| **99,99%** | **4,32 min** |
| **99,999%** | **0,43 min** (~26 s) |
**Composição** (**disponibilidades hipotéticas**, **falhas independentes**):
- **Em série** (**todos precisam funcionar**): **multiplica**: **99,9% × 99,9% × 99,95% = 99,7502%**: **o conjunto é pior que o pior componente**.
- **Em paralelo** (**redundância**: **basta um**): **1 − ∏(1 − A)**: **2 instâncias de 99,9% → 99,9999%**; **3 → 99,9999999%**.
- **Misto:** **2 instâncias em paralelo seguidas de um banco de 99,95% em série → 99,9499%**: **a redundância da aplicação não passa do elo mais fraco** (**o banco**). **Lição:** **eleve a redundância onde está o elo mais fraco**.
**Ressalvas importantes:** (1) **falhas não são independentes** (**mesma AZ, mesmo deploy ruim, mesma dependência**): **a conta paralela é um limite superior otimista**; (2) **o SLA do provedor** **é um contrato de crédito**, **não uma garantia** (**o ressarcimento é desconto, não prejuízo coberto**); (3) **o SLA vale para o serviço do provedor**, **não para a sua aplicação**; (4) **definições de "indisponível" variam** (**tempo de erro > X%**).

### Os pilares dos frameworks "bem arquitetados"
**AWS, Azure e Google Cloud** publicam **frameworks** (**Well-Architected**) **com pilares muito parecidos**: **excelência operacional**, **segurança**, **confiabilidade**, **eficiência de desempenho**, **otimização de custos** (e **sustentabilidade**, **no caso da AWS e do Google**). **Use-os como checklist de revisão** de arquitetura.

### Como estudar nuvem sem conta (o caminho deste curso)
**Os conceitos são portáveis**; **os nomes mudam**. Você aprenderá **os serviços de cada provedor pela documentação** (**aulas 2 a 4**), **com modelos executáveis** (**IAM**, **serverless**, **custos**). **Para praticar de verdade**, **crie uma conta com orçamento e alertas de custo**, **use as camadas gratuitas** (**verifique as regras atuais**) **e destrua os recursos ao fim**.`,
  concepts: [
    { term: 'IaaS', def: 'Modelo em que o provedor oferece infraestrutura virtualizada (VMs, redes, discos) e o cliente gerencia do sistema operacional para cima.' },
    { term: 'PaaS', def: 'Modelo em que o provedor oferece a plataforma de execução e o cliente cuida apenas do código e dos dados.' },
    { term: 'SaaS', def: 'Software pronto consumido como serviço, em que o cliente configura e usa, mas não gerencia a infraestrutura.' },
    { term: 'Responsabilidade compartilhada', def: 'Divisão de deveres de segurança em que o provedor protege a nuvem e o cliente protege o que coloca nela.' },
    { term: 'Região', def: 'Área geográfica com múltiplos datacenters em que os recursos da nuvem são implantados.' },
    { term: 'Zona de disponibilidade', def: 'Datacenters isolados dentro de uma região, usados para tolerar a falha de um deles.' },
    { term: 'SLA', def: 'Acordo de nível de serviço que define a disponibilidade prometida e os créditos em caso de descumprimento.' },
    { term: 'Elasticidade', def: 'Capacidade de ampliar e reduzir recursos automaticamente conforme a demanda.' }
  ],
  examples: R`**Analogia:** **IaaS** é **alugar um terreno com água e luz** (**você constrói a casa**); **PaaS** é **alugar um apartamento mobiliado** (**você leva suas coisas**); **SaaS** é **um quarto de hotel** (**só usa**). **Em todos**, **a chave do seu cofre é sua**: **deixá-la na porta é culpa do hóspede**, **não do hotel**.

**Exemplo concreto (modelo):** **uma aplicação em 2 instâncias (99,9% cada) com um banco de 99,95%** tem **~99,95%** no conjunto (**99,9499%**), **cerca de 21,6 min/mês**; **aumentar para 3 instâncias quase não muda** (**o banco manda**). **Investir em réplica do banco** **vale mais do que uma terceira instância**.`,
  code: [
    { title: 'Modelo de disponibilidade (executado no laboratório, Node 26.13.1)', lang: 'javascript', code: R`const MIN_MES = 30 * 24 * 60;
const indisp = (pct) => +(MIN_MES * (1 - pct / 100)).toFixed(2);
const serie = (...a) => a.reduce((x, y) => x * y, 1);
const paralelo = (...a) => 1 - a.reduce((x, y) => x * (1 - y), 1);

console.log(indisp(99.9));                                  // 43.2
console.log(serie(0.999, 0.999, 0.9995));                   // 0.99750...
console.log(paralelo(0.999, 0.999));                        // 0.999999
console.log(serie(paralelo(0.999, 0.999), 0.9995));         // 0.9994990...`, notes: [{ l: 2, t: 'Minutos permitidos de indisponibilidade em 30 dias.' }, { l: 3, t: 'Série: todos precisam funcionar (multiplica).' }, { l: 4, t: 'Paralelo: basta um funcionar (1 menos o produto das falhas).' }, { l: 9, t: 'O banco em série limita a disponibilidade total.' }] }
  ],
  bestPractices: ['Trate dados, identidade e configuração como sempre seus, em qualquer modelo.', 'Distribua instâncias em pelo menos duas zonas de disponibilidade.', 'Projete para o domínio de falha que o negócio precisa sobreviver, não para o máximo possível.', 'Eleve a redundância no elo mais fraco da cadeia.', 'Leia o SLA como contrato de crédito e verifique a definição de indisponibilidade.', 'Use os frameworks Well-Architected como checklist de revisão.', 'Pratique com orçamento, alertas de custo e destruição dos recursos ao final.'],
  mistakes: ['Achar que o provedor cuida de tudo, inclusive de buckets e permissões.', 'Fazer lift and shift e esperar os benefícios da nuvem.', 'Somar redundâncias sem olhar o elo mais fraco.', 'Tratar o SLA do provedor como o SLA da própria aplicação.', 'Supor falhas independentes na mesma zona ou no mesmo deploy.', 'Escolher a região só pelo preço, ignorando latência e conformidade.'],
  market: R`**Vocabulário de nuvem e responsabilidade compartilhada** **é pré-requisito** de **qualquer vaga de infraestrutura, DevOps e arquitetura**; **cálculo de disponibilidade e SLAs** **aparece em entrevistas de SRE e de certificações** dos três provedores.`,
  summary: R`O NIST define nuvem por cinco características (autoatendimento, acesso pela rede, pool de recursos, elasticidade e serviço medido) e IaaS, PaaS e SaaS como modelos de serviço. A responsabilidade é compartilhada: o provedor cuida da nuvem, o cliente do que coloca nela, e dados, identidade e configuração são sempre do cliente. Regiões e zonas definem domínios de falha. O modelo executado mostra que 99,9% permite 43,2 min por 30 dias, que a série multiplica (99,9 x 99,9 x 99,95 = 99,7502%) e que o paralelo melhora muito (duas instâncias de 99,9%: 99,9999%) até o elo mais fraco limitar (banco de 99,95%: 99,9499%). Nenhum serviço de nuvem real foi usado.`,
  refs: [REF.nist, REF.awsShared, REF.awsRegions, REF.awsWaf, REF.azureWaf, REF.gcpWaf],
  cards: [
    { q: 'O que o cliente sempre mantém sob sua responsabilidade na nuvem?', a: 'Dados, identidade e acessos, e a configuração dos serviços que usa, em qualquer modelo (IaaS, PaaS, FaaS ou SaaS).' },
    { q: 'Quanto 99,9% de SLA permite de indisponibilidade em 30 dias?', a: '43,2 minutos (99,95% permite 21,6; 99,99% permite 4,32).' },
    { q: 'Por que a redundância da aplicação pode não melhorar a disponibilidade total?', a: 'Porque a disponibilidade em série é limitada pelo elo mais fraco (por exemplo, um banco único); duas instâncias seguidas de um banco de 99,95% dão 99,9499%.' },
    { q: 'Por que usar duas zonas de disponibilidade?', a: 'Para sobreviver à queda de uma zona (datacenter isolado) sem indisponibilidade da aplicação.' }
  ]
},
{
  id: 'cld-02', moduleId: 'm1', order: 2, minutes: 90, tags: ['AWS', 'IAM', 'VPC', 'EC2', 'S3', 'RDS', 'ALB', 'Route 53', 'CloudFront', 'menor privilégio'],
  title: 'AWS: serviços essenciais, redes (VPC) e identidade (IAM) com avaliação de políticas',
  objectives: ['Mapear os serviços essenciais da AWS por categoria (computação, armazenamento, banco, rede, mensageria, observabilidade)', 'Projetar uma VPC com sub-redes públicas e privadas em duas AZs', 'Explicar a lógica de avaliação do IAM (negação explícita, permissão, negação implícita) e aplicar menor privilégio', 'Distinguir usuários, grupos, papéis (roles) e credenciais temporárias'],
  intro: R`A **AWS** é **o maior provedor** e **o vocabulário de referência** do mercado. Em vez de **decorar centenas de serviços**, aprenda **um núcleo pequeno** (**IAM, VPC, EC2, S3, um banco gerenciado, um balanceador**) **e a lógica de permissões**, que **é onde estão os maiores riscos**. **Aviso:** **não havia conta AWS neste ambiente**: o que segue **vem da documentação oficial**; **o avaliador de políticas é um modelo local executado**.`,
  theory: R`### O núcleo de serviços (mapa)
| Categoria | Serviços | Para que servem |
|---|---|---|
| **Identidade** | **IAM**, **Organizations**, **IAM Identity Center** | **quem pode fazer o quê** |
| **Computação** | **EC2** (VMs), **Lambda** (funções), **ECS/EKS/Fargate** (contêineres) | **executar código** |
| **Armazenamento** | **S3** (objetos), **EBS** (disco de bloco), **EFS** (arquivos) | **guardar dados** |
| **Banco de dados** | **RDS/Aurora** (relacional gerenciado), **DynamoDB** (chave-valor), **ElastiCache** (cache) | **persistência** |
| **Rede** | **VPC**, **Route 53** (DNS), **ELB** (ALB/NLB), **CloudFront** (CDN) | **conectar e expor** |
| **Mensageria** | **SQS** (fila), **SNS** (publicação/assinatura), **EventBridge** (eventos) | **desacoplar** |
| **Observabilidade** | **CloudWatch** (métricas, logs, alarmes), **CloudTrail** (auditoria de API) | **operar e auditar** |
| **IaC** | **CloudFormation**, **CDK** (e o Terraform da aula do curso C6.5) | **infraestrutura como código** |
**Dica de estudo:** **para cada serviço, responda**: **o que ele é**, **o modelo de cobrança**, **onde falha** (**AZ, região**) e **como se protege**.

### Rede: a VPC
Uma **VPC** é **uma rede virtual isolada** (**faixa CIDR**, como **§10.0.0.0/16§**). **Elementos:** **sub-redes** (**uma por AZ**), **tabelas de rotas**, **Internet Gateway** (**saída/entrada**), **NAT Gateway** (**saída de sub-redes privadas**), **Security Groups** (**firewall com estado, por interface/instância; só permissões**) e **Network ACLs** (**sem estado, por sub-rede, com permitir e negar**).
**Padrão de três camadas em 2 AZs:**
- **Sub-redes públicas** (**ALB**, **NAT**): **rota para o Internet Gateway**;
- **Sub-redes privadas de aplicação** (**EC2/contêineres**): **saída via NAT**, **sem entrada direta da internet**;
- **Sub-redes privadas de dados** (**RDS**): **só aceitam tráfego da camada de aplicação** (**Security Group referenciando o SG da aplicação**).
**Planejamento de CIDR:** **uma /16 dá 65.536 endereços**; **dividida em /24 (256 endereços cada, dos quais a AWS reserva 5 por sub-rede)**: **256 sub-redes /24**. **Evite sobreposição de CIDRs** **entre VPCs e com a rede local** (**impede peering e VPN**). **Exposição:** **nada deve ter IP público sem necessidade**; **bancos nunca em sub-redes públicas**.

### Identidade: IAM
- **Usuário:** **identidade de longa duração** (**evite para pessoas**: **use federação/SSO**); **chaves de acesso** **são risco** (**vazam, não expiram**).
- **Grupo:** **conjunto de usuários**; **Papel (role):** **identidade assumível** **com credenciais temporárias** (**para instâncias, funções, contêineres, outras contas e pipelines com OIDC**).
- **Política:** **documento JSON** com **declarações** (§Effect§ **Allow/Deny**, §Action§, §Resource§, §Condition§).
- **Conta raiz:** **dona da conta**: **proteja com MFA**, **não use no dia a dia**, **sem chaves**.
**Boas práticas oficiais:** **credenciais temporárias em vez de chaves de longa duração**, **MFA**, **menor privilégio**, **papéis para cargas de trabalho**, **organização em várias contas** (**produção separada**) com **SCPs** (**limites no nível da organização**), **revisão com o Access Analyzer**.

### Lógica de avaliação (modelo executado)
**Regra da AWS (simplificada):** (1) **tudo começa negado** (**negação implícita**); (2) **um §Allow§ aplicável permite**; (3) **um §Deny§ aplicável **vence sempre** (**negação explícita**). **Também entram** **SCPs, *permission boundaries*, políticas de sessão e de recurso**: **o modelo do laboratório ignora esses e as condições**. **Medido** (**políticas: leitura em §arn:aws:s3:::dados§ e uma negação em §dados/segredo/*§**):
| Ação | Recurso | Decisão |
|---|---|---|
| §s3:GetObject§ | §dados/relatorio.csv§ | **PERMITIDO** (permissão explícita) |
| §s3:PutObject§ | §dados/relatorio.csv§ | **NEGADO** (negação implícita) |
| §s3:GetObject§ | §outro/x§ | **NEGADO** (negação implícita) |
| §s3:GetObject§ | §dados/segredo/chave.txt§ | **NEGADO** (**negação explícita**, apesar do Allow) |
| §s3:GetObject§ | §dados/publico/a.txt§ | **PERMITIDO** |
| (nenhuma política) | — | **NEGADO** (implícita) |
**Curingas perigosos:** §"Action": "*"§ com §"Resource": "*"§ **é administrador**; **§s3:*§** **inclui apagar e alterar permissões**. **Comece restrito e ajuste pelos logs** (**CloudTrail**/**Access Analyzer** sugerem políticas **a partir do uso real**).

### Computação e armazenamento: decisões
- **EC2:** **controle total**, **você gerencia SO e patches**; **modelos de compra** (**sob demanda, reservado/Savings Plans, Spot**: aula 6); **Auto Scaling** **repõe e escala** **instâncias** **em várias AZs** **atrás de um ALB**.
- **S3:** **objetos em *buckets*** (**durabilidade altíssima, escalável**); **bloqueie o acesso público por padrão** (**Block Public Access**), **ative a versão e o ciclo de vida**, **criptografia em repouso** e **política de bucket mínima**. **Não é um sistema de arquivos**.
- **RDS/Aurora:** **backups automáticos, réplicas e Multi-AZ** **(failover entre zonas)**; **você ainda cuida de esquema, consultas e dimensionamento**.
- **ALB:** **balanceamento HTTP(S) por caminho/host**, **health checks ativos** (**ao contrário do nginx livre da aula anterior**), **integra com Auto Scaling**.

### Executado e não executado
**Executado:** **o modelo do avaliador de políticas** (**6 casos**). **Não executado:** **qualquer chamada à AWS**, **criação de contas, VPCs, instâncias, buckets, funções ou bancos**, **CLI/SDK**, **CloudFormation/CDK**, **Access Analyzer**.`,
  concepts: [
    { term: 'VPC', def: 'Rede virtual isolada na AWS definida por uma faixa CIDR, com sub-redes, rotas e controles de acesso.' },
    { term: 'Security Group', def: 'Firewall com estado associado a recursos, que só define regras de permissão.' },
    { term: 'IAM Role', def: 'Identidade assumível que fornece credenciais temporárias a pessoas, serviços ou cargas de trabalho.' },
    { term: 'Negação explícita', def: 'Declaração Deny aplicável, que prevalece sobre qualquer Allow na avaliação de políticas.' },
    { term: 'Menor privilégio', def: 'Conceder apenas as permissões necessárias para a tarefa, pelo menor tempo necessário.' },
    { term: 'NAT Gateway', def: 'Serviço que permite saída para a internet de recursos em sub-redes privadas, sem aceitar entrada.' },
    { term: 'S3 bucket', def: 'Contêiner de objetos do Amazon S3, cujo acesso deve ser restrito por padrão.' },
    { term: 'Multi-AZ', def: 'Configuração com réplica em outra zona de disponibilidade e failover automático.' }
  ],
  examples: R`**Analogia:** **a VPC é um prédio privado com portaria**: **o ALB é a recepção** (**sub-rede pública**), **os escritórios** (**aplicação**) **só recebem quem a recepção encaminha**, e **o cofre** (**banco**) **só abre para os escritórios**. **O IAM é o sistema de crachás**: **tudo é proibido por padrão**, **crachás concedem acessos**, e **uma "proibição específica" (Deny) vale mais que qualquer crachá**.

**Exemplo concreto (modelo executado):** **a política de leitura permite §GetObject§ em §dados/§**, **e uma negação em §dados/segredo/*§ bloqueia a leitura da chave** **mesmo com o Allow geral**; **escrever (§PutObject§) fica negado por nunca ter sido permitido**.`,
  code: [
    { title: 'Política IAM de leitura com negação para um prefixo (exemplo analisado)', lang: 'json', code: R`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::dados", "arn:aws:s3:::dados/*"]
    },
    {
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::dados/segredo/*"
    }
  ]
}`, notes: [{ l: 5, t: 'Allow explícito: leitura e listagem.' }, { l: 10, t: 'Deny explícito sempre vence o Allow.' }] },
    { title: 'Avaliador de políticas (modelo local, executado)', lang: 'javascript', code: R`const casa = (p, v) => new RegExp('^' + p.split('*').map((x) => x.replace(/[.+?^$()|[\]\\]/g, '\\$&')).join('.*') + '$').test(v);
const lista = (x) => (Array.isArray(x) ? x : [x]);
export function avaliar(politicas, acao, recurso) {
  let permitido = false;
  for (const p of politicas) for (const s of lista(p.Statement)) {
    if (lista(s.Action).some((a) => casa(a, acao)) && lista(s.Resource).some((r) => casa(r, recurso))) {
      if (s.Effect === 'Deny') return { decisao: 'NEGADO', motivo: 'negação explícita' };
      if (s.Effect === 'Allow') permitido = true;
    }
  }
  return permitido ? { decisao: 'PERMITIDO', motivo: 'permissão explícita' } : { decisao: 'NEGADO', motivo: 'negação implícita' };
}`, notes: [{ l: 6, t: 'A negação explícita retorna imediatamente.' }, { l: 10, t: 'Sem Allow aplicável: negação implícita.' }] }
  ],
  bestPractices: ['Use credenciais temporárias e papéis em vez de chaves de longa duração.', 'Ative MFA, não use a conta raiz no dia a dia e separe produção em outra conta.', 'Aplique menor privilégio e refine com CloudTrail e Access Analyzer.', 'Desenhe VPCs com sub-redes privadas em duas AZs e bancos fora de sub-redes públicas.', 'Bloqueie o acesso público do S3 por padrão e ative versão, ciclo de vida e criptografia.', 'Planeje CIDRs sem sobreposição com outras redes.', 'Use Multi-AZ e Auto Scaling atrás de um balanceador para a camada que precisa de disponibilidade.'],
  mistakes: ['Action * em Resource * para fazer funcionar.', 'Chaves de acesso de longa duração em código ou repositórios.', 'Bucket S3 público por engano.', 'Banco de dados em sub-rede pública ou com IP público.', 'CIDRs sobrepostos que impedem peering e VPN.', 'Confundir Security Group (com estado) e Network ACL (sem estado).'],
  market: R`**AWS** é **a certificação e o conhecimento mais pedidos** em **vagas de nuvem**; **explicar a avaliação do IAM** e **desenhar uma VPC com sub-redes privadas** **são perguntas clássicas** de entrevista.`,
  summary: R`O núcleo da AWS cobre identidade (IAM), computação (EC2, Lambda, ECS/EKS), armazenamento (S3, EBS, EFS), bancos (RDS/Aurora, DynamoDB), rede (VPC, ALB, Route 53, CloudFront), mensageria (SQS, SNS, EventBridge) e observabilidade (CloudWatch, CloudTrail). Uma VPC em duas AZs usa sub-redes públicas, privadas de aplicação e privadas de dados, com Security Groups encadeados. No IAM tudo é negado por padrão, um Allow permite e um Deny explícito sempre vence; o modelo executado reproduziu seis casos (permitido, negação implícita e explícita). Prefira papéis e credenciais temporárias, MFA e menor privilégio. Nenhuma chamada à AWS foi feita.`,
  refs: [REF.awsEc2, REF.awsS3, REF.awsVpc, REF.awsIamEval, REF.awsIamBest, REF.awsShared],
  cards: [
    { q: 'Como o IAM decide entre Allow e Deny?', a: 'Tudo é negado por padrão; um Allow aplicável permite; um Deny explícito aplicável sempre vence.' },
    { q: 'Qual a diferença entre Security Group e Network ACL?', a: 'O Security Group tem estado, só permite e atua na interface/instância; a Network ACL não tem estado, permite e nega e atua na sub-rede.' },
    { q: 'Por que preferir papéis a chaves de acesso?', a: 'Papéis fornecem credenciais temporárias; chaves de longa duração vazam e não expiram.' },
    { q: 'Onde ficam os bancos de dados em uma VPC bem desenhada?', a: 'Em sub-redes privadas de dados, aceitando tráfego apenas da camada de aplicação, nunca com IP público.' }
  ]
},
{
  id: 'cld-03', moduleId: 'm2', order: 3, minutes: 85, tags: ['Azure', 'Entra ID', 'RBAC', 'assinatura', 'resource group', 'VNet', 'App Service', 'AKS', 'managed identity'],
  title: 'Azure: hierarquia de recursos, identidade (Entra ID e RBAC) e serviços essenciais',
  objectives: ['Explicar a hierarquia de grupos de gerenciamento, assinaturas e grupos de recursos', 'Diferenciar autenticação (Microsoft Entra ID) de autorização (Azure RBAC) e calcular permissões herdadas por escopo', 'Mapear os serviços essenciais do Azure e compará-los aos da AWS', 'Usar identidades gerenciadas em vez de segredos'],
  intro: R`O **Azure** é **muito presente em empresas** (**integração com Microsoft 365, Active Directory e .NET**). **A organização dos recursos** (**assinaturas e grupos de recursos**) e **o modelo de identidade** (**Entra ID + RBAC por escopo**) **são os pontos que mais diferem da AWS**. **Aviso:** **sem conta Azure neste ambiente**: **conteúdo analisado a partir da documentação**; **a herança de papéis é um modelo executado** (**exercício**).`,
  theory: R`### Hierarquia de recursos
**Locatário (*tenant*) do Microsoft Entra ID** (**diretório de identidades**) → **Grupos de gerenciamento** (**agrupam assinaturas; políticas e papéis herdados**) → **Assinaturas** (**limite de cobrança, de cotas e de acesso**) → **Grupos de recursos** (***resource groups***: **contêineres lógicos com o mesmo ciclo de vida**) → **Recursos** (**VMs, bancos, redes**). **Regras:** **todo recurso pertence a exatamente um grupo de recursos**; **excluir o grupo exclui tudo dentro**; **papéis e políticas atribuídos em um nível são herdados pelos de baixo**. **Comparação com a AWS:** **a assinatura Azure se parece com a conta AWS** (**fronteira de cobrança e isolamento**); **o grupo de recursos não tem equivalente direto** (**na AWS, tags e pilhas do CloudFormation cumprem papéis próximos**).

### Identidade: autenticação x autorização
- **Microsoft Entra ID** (**antigo Azure Active Directory**): **autenticação** (**quem é você**): **usuários, grupos, aplicações, MFA, acesso condicional, federação**.
- **Azure RBAC:** **autorização sobre recursos do Azure** (**o que você pode fazer**): **atribuição de papel** = **entidade** (**usuário, grupo, aplicação, identidade gerenciada**) + **definição de papel** (**ações permitidas**) + **escopo** (**grupo de gerenciamento, assinatura, grupo de recursos ou recurso**). **Papéis internos comuns:** **Owner**, **Contributor** (**cria e altera, mas não concede acesso**), **Reader**, **e centenas específicos** (**Storage Blob Data Reader**, etc.). **Herança:** **uma atribuição no escopo da assinatura vale para todos os grupos de recursos e recursos abaixo**.
- **Aditivo:** **permissões efetivas = união das atribuições aplicáveis** (**o RBAC padrão é aditivo**); **há atribuições de negação** (***deny assignments***) **criadas pela plataforma, por exemplo em aplicativos gerenciados (managed applications)**, **não gerenciadas diretamente por usuários** (**consulte a documentação**).
**Princípio:** **atribua ao menor escopo e ao menor papel**; **prefira grupos a usuários individuais**; **use *Privileged Identity Management* para elevação temporária** (**recurso licenciado**).
**Comparação:** **AWS IAM tem negação explícita nas políticas**; **o Azure RBAC é predominantemente aditivo**, **e o controle de "negar" vem de políticas (Azure Policy) e de escopos**. **Os modelos são diferentes: não os misture.**

### Identidades gerenciadas
**Identidade gerenciada** (***managed identity***): **o Azure cria e rotaciona a credencial** **de um recurso** (**App Service, VM, Function, AKS**), **e o código obtém tokens sem segredo**: **dispensa strings de conexão e chaves no código**. **Tipos:** **atribuída ao sistema** (**ciclo de vida ligado ao recurso**) e **atribuída ao usuário** (**reutilizável**). **É o equivalente ao uso de papéis do IAM em instâncias na AWS.**

### Redes
**Rede virtual (VNet):** **espaço de endereços (CIDR)** **dividido em sub-redes**; **Network Security Groups (NSG)** (**regras de permitir e negar com prioridade, por sub-rede ou interface**); **peering** entre VNets; **Application Gateway** (**L7**), **Load Balancer** (**L4**), **Front Door** (**global**), **Azure DNS**; **Private Endpoint** (**acesso privado a serviços PaaS**) **para evitar tráfego pela internet**. **Observação:** **uma VNet é regional** (**vive em uma região**) **e as zonas de disponibilidade estão dentro dela**.

### Serviços essenciais e equivalências aproximadas
| Categoria | Azure | AWS (aproximado) |
|---|---|---|
| **VMs** | **Virtual Machines** (+ Scale Sets) | EC2 (+ Auto Scaling) |
| **PaaS web** | **App Service** | Elastic Beanstalk / App Runner (aproximado) |
| **Funções** | **Azure Functions** | Lambda |
| **Contêineres** | **Container Apps**, **AKS** | ECS/Fargate, EKS |
| **Objetos** | **Blob Storage** (em uma *storage account*) | S3 |
| **Relacional** | **Azure SQL Database**, **PostgreSQL/MySQL flexível** | RDS/Aurora |
| **NoSQL** | **Cosmos DB** | DynamoDB (aproximado) |
| **Mensageria** | **Service Bus**, **Event Grid**, **Event Hubs** | SQS/SNS, EventBridge, Kinesis |
| **Observabilidade** | **Azure Monitor** (+ Log Analytics) | CloudWatch |
| **IaC** | **Bicep**, ARM, Terraform | CloudFormation/CDK |
**Aviso:** **as equivalências são aproximadas**: **limites, modelos de preço, recursos e semântica diferem**; **leia a documentação antes de migrar**.

### Boas práticas
- **Cloud Adoption Framework e *landing zones***: **organize grupos de gerenciamento e assinaturas por ambiente e carga**, **aplique Azure Policy** (**ex.: negar IP público em bancos, exigir tags**).
- **Tags** para **custo e responsável**; **bloqueios de recurso** (***locks***) **contra exclusão acidental**.
- **Segredos** em **Key Vault**, **acessados por identidade gerenciada**.
- **Redundância:** **zonas de disponibilidade** nos serviços que oferecem; **regiões pareadas** **para recuperação de desastres**.

### Executado e não executado
**Executado:** **nenhum comando do Azure**; **a herança de papéis por escopo** **é implementada no exercício** (**modelo**). **Não executado:** **portal, CLI (§az§), Bicep, Entra ID, Key Vault, AKS, Azure Policy**.`,
  concepts: [
    { term: 'Assinatura (Azure)', def: 'Contêiner de recursos que serve de limite de cobrança, de cotas e de controle de acesso.' },
    { term: 'Resource group', def: 'Contêiner lógico do Azure que agrupa recursos com o mesmo ciclo de vida; excluí-lo exclui o conteúdo.' },
    { term: 'Microsoft Entra ID', def: 'Serviço de identidade do Azure que autentica usuários, grupos e aplicações.' },
    { term: 'Azure RBAC', def: 'Controle de acesso baseado em papéis para recursos do Azure, por escopo e com herança.' },
    { term: 'Escopo', def: 'Nível da hierarquia (grupo de gerenciamento, assinatura, grupo de recursos ou recurso) ao qual se aplica uma atribuição.' },
    { term: 'Identidade gerenciada', def: 'Identidade de um recurso do Azure com credenciais criadas e rotacionadas pela plataforma, sem segredos no código.' },
    { term: 'NSG', def: 'Network Security Group: conjunto de regras de entrada e saída com prioridade para sub-redes ou interfaces.' },
    { term: 'Private Endpoint', def: 'Interface de rede privada que expõe um serviço PaaS dentro da VNet, evitando a internet pública.' }
  ],
  examples: R`**Analogia:** **a hierarquia é uma empresa com filiais**: **o locatário é a holding**, **as assinaturas são as filiais com orçamento próprio**, **os grupos de recursos são os departamentos** e **os recursos são as salas**. **Uma chave-mestra dada à filial abre todas as salas dela** (**herança**); **a "identidade gerenciada" é o crachá que o prédio emite e troca sozinho** para **cada sala**.

**Exemplo concreto:** **atribuir "Reader" a um grupo no escopo da assinatura §prod§** **dá leitura a tudo o que existe nela**; **atribuir "Contributor" apenas ao grupo de recursos §app-pedidos§** **permite alterar só aquilo**. **No exercício**, **você calcula as permissões efetivas somando as atribuições herdadas**.`,
  code: [
    { title: 'Atribuição de papel por escopo com a CLI do Azure (exemplo analisado, não executado)', lang: 'bash', code: R`# Lê tudo na assinatura (escopo amplo; use com cuidado)
az role assignment create --assignee grupo-leitores --role "Reader" \
  --scope /subscriptions/00000000-0000-0000-0000-000000000000

# Altera somente um grupo de recursos (escopo estreito)
az role assignment create --assignee grupo-pedidos --role "Contributor" \
  --scope /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/app-pedidos`, notes: [{ l: 1, t: 'O identificador da assinatura é fictício.' }, { l: 6, t: 'O menor escopo possível reduz o raio de impacto.' }] },
    { title: 'Permissões efetivas por herança de escopo (modelo, usado no exercício)', lang: 'javascript', code: R`// escopo "filho" começa com o escopo "pai" + "/"
function papeisEfetivos(atribuicoes, escopo) {
  const aplica = (e) => escopo === e || escopo.startsWith(e.endsWith('/') ? e : e + '/');
  return [...new Set(atribuicoes.filter((a) => aplica(a.escopo)).map((a) => a.papel))].sort();
}`, notes: [{ l: 1, t: 'Hierarquia representada como caminhos.' }, { l: 4, t: 'RBAC é aditivo: a união dos papéis aplicáveis.' }] }
  ],
  bestPractices: ['Atribua papéis ao menor escopo e ao menor papel, preferindo grupos.', 'Use identidades gerenciadas e o Key Vault em vez de segredos no código.', 'Organize grupos de gerenciamento e assinaturas por ambiente e aplique o Azure Policy.', 'Use tags e bloqueios de recurso contra exclusão acidental.', 'Use Private Endpoints para serviços PaaS quando a exposição pública não for necessária.', 'Distribua cargas em zonas de disponibilidade e planeje a recuperação entre regiões.', 'Não transponha o modelo de permissões da AWS: o RBAC é aditivo por escopo.'],
  mistakes: ['Atribuir Owner no escopo da assinatura para resolver rápido.', 'Confundir Entra ID (autenticação) com Azure RBAC (autorização).', 'Segredos e strings de conexão no código em vez de identidade gerenciada.', 'Recursos com ciclos de vida diferentes no mesmo grupo de recursos.', 'Esperar negação explícita no RBAC como no IAM da AWS.', 'Presumir equivalência exata entre serviços de provedores diferentes.'],
  market: R`**Azure** domina **empresas com ecossistema Microsoft**; **saber distinguir Entra ID de RBAC e usar identidades gerenciadas** **é o que se espera** de **desenvolvedores e administradores** em **vagas com Azure**.`,
  summary: R`O Azure organiza recursos em locatário, grupos de gerenciamento, assinaturas, grupos de recursos e recursos, com herança de papéis e políticas. O Microsoft Entra ID autentica; o Azure RBAC autoriza por atribuições de papel em um escopo, de forma aditiva e herdada. Identidades gerenciadas eliminam segredos no código. A rede usa VNets, NSGs, balanceadores L4 e L7 e Private Endpoints, e os serviços essenciais têm equivalentes aproximados na AWS (VMs, App Service, Functions, Container Apps/AKS, Blob, Azure SQL, Cosmos DB, Service Bus, Monitor, Bicep). Nenhum comando do Azure foi executado; a herança de escopo é um modelo.`,
  refs: [REF.azureHierarchy, REF.azureRbac, REF.azureManagedId, REF.azureVnet, REF.azureAppSvc],
  cards: [
    { q: 'Qual a diferença entre Entra ID e Azure RBAC?', a: 'Entra ID autentica (quem é); Azure RBAC autoriza o acesso a recursos do Azure por papel e escopo (o que pode fazer).' },
    { q: 'O que acontece ao excluir um grupo de recursos?', a: 'Todos os recursos dentro dele são excluídos; por isso o grupo deve reunir recursos com o mesmo ciclo de vida.' },
    { q: 'Para que servem identidades gerenciadas?', a: 'Dar a um recurso uma identidade com credenciais criadas e rotacionadas pelo Azure, evitando segredos no código.' },
    { q: 'Como as atribuições de papel se propagam?', a: 'Uma atribuição em um escopo é herdada pelos escopos abaixo; as permissões efetivas são a união das atribuições aplicáveis.' }
  ]
}
];
