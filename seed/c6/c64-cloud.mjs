// Curso C6.4 da C6: Cloud (AWS, Azure e Google Cloud) (disciplina: cloud).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c64-a.mjs';
import { REF2, lessonsB } from './c64-b.mjs';
import { exsets, assessment, project } from './c64-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Conceitos de nuvem', 'AWS', 'Azure', 'Google Cloud', 'Serverless', 'Custos e multi-cloud'];
export const COVER = {
  'Conceitos de nuvem': ['cld-01'],
  'AWS': ['cld-02'],
  'Azure': ['cld-03'],
  'Google Cloud': ['cld-04'],
  'Serverless': ['cld-05'],
  'Custos e multi-cloud': ['cld-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Multi-inquilino', def: 'Modelo em que vários clientes compartilham a mesma infraestrutura com isolamento lógico.' },
  { term: 'Domínio de falha', def: 'Conjunto de componentes que podem falhar juntos (instância, zona, região, provedor).' },
  { term: 'ADR', def: 'Registro de decisão de arquitetura, com contexto, alternativas e consequências.' },
  { term: 'Landing zone', def: 'Estrutura inicial de contas, redes, políticas e identidade que serve de base segura para as cargas.' },
  { term: 'Access Analyzer', def: 'Ferramenta que ajuda a identificar acessos amplos ou externos e a gerar políticas a partir do uso real.' },
  { term: 'Guardrail', def: 'Política preventiva ou detectiva que impede configurações perigosas em escala.' },
  { term: 'Dry run', def: 'Estimativa de uma operação (como bytes processados em uma consulta) sem executá-la.' },
  { term: 'Savings Plan', def: 'Compromisso de gasto por hora por um prazo em troca de desconto, em oferta da AWS.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'cloud', disciplineId: 'cloud', areaId: 'ops', requires: [],
  title: 'Cloud: conceitos, AWS, Azure, Google Cloud, serverless, custos e multi-cloud',
  description: 'Entender e projetar sistemas em nuvem, com honestidade sobre o que foi executado: conceitos (NIST, IaaS/PaaS/SaaS, responsabilidade compartilhada, regiões e zonas, SLA: 99,9% = 43,2 min em 30 dias; composição série e paralelo, em que 2 instâncias de 99,9% em paralelo e um banco de 99,95% dão 99,9499%); AWS (IAM e avaliação de políticas com negação explícita, VPC em duas AZs); Azure (hierarquia, Entra ID, RBAC por escopo, identidades gerenciadas); Google Cloud (organização, pastas, projetos, IAM com deny, contas de serviço, Cloud Run, BigQuery); serverless (cold start de 469,5 ms contra 0,006 ms em um modelo, idempotência: saldo 70 com chave e 10 sem, lei de Little); custos e multi-cloud (FinOps, egress, modelos de compra; ponto de equilíbrio de ~10,87 milhões de req/mês com preços fictícios). Projeto: arquitetura cloud. Não havia conta de nuvem: o conteúdo dos provedores é análise da documentação e os modelos foram executados localmente.',
  objectives: ['Explicar os modelos de nuvem, a responsabilidade compartilhada e a disponibilidade por SLA e composição', 'Descrever identidade, redes e serviços essenciais em AWS, Azure e Google Cloud com seus modelos de permissão', 'Projetar handlers serverless idempotentes e dimensionar concorrência', 'Modelar custos com premissas explícitas e aplicar FinOps', 'Avaliar multi-cloud e lock-in com critérios de risco e custo'],
  level: 'M', prereqs: ['Redes e Linux básicos (Onda 1)', 'Docker e CI/CD (C6.1 e C6.2)', 'Node.js 22 ou superior (o curso usa 26.13.1) para os modelos'], hours: 10,
  syllabus: 'Conceitos de nuvem; AWS; Azure; Google Cloud; serverless; custos e multi-cloud; projeto de arquitetura cloud.',
  versions: 'Node 26.13.1 (modelos locais), em 2026-11-25 (laboratório em seed/c6/labs/cloud/). Nenhum recurso de AWS, Azure ou Google Cloud foi criado: não havia contas nem chaves. O conteúdo dos provedores vem da documentação oficial (referências abertas e verificadas); limites, nomes de serviços e preços mudam: consulte as páginas atuais. Preços, disponibilidades e latências dos modelos são hipotéticos ou do modelo, não de provedores. Os desafios de código são em JavaScript e modelam a lógica. Não executados: chamadas de API de nuvem, CLIs (aws, az, gcloud), emuladores (LocalStack, Azurite), funções reais, bancos, balanceadores, faturas, calculadoras de preço, migrações.',
  skills: ['Conceitos de computação em nuvem', 'Identidade e permissões em nuvem', 'Desenho de redes em nuvem', 'Serverless e idempotência', 'Modelagem de custos e FinOps', 'Avaliação de multi-cloud e lock-in'],
  modules: [
    { id: 'm1', title: 'Conceitos e AWS', lessons: ['cld-01', 'cld-02'] },
    { id: 'm2', title: 'Azure e Google Cloud', lessons: ['cld-03', 'cld-04'] },
    { id: 'm3', title: 'Serverless e custos', lessons: ['cld-05', 'cld-06'] }
  ],
  materials: [REF.nist, REF.awsShared, REF.awsIamEval, REF.azureRbac, REF2.gcpHierarchy].map((r) => ({ ...r })),
  projectIds: ['arquitetura-cloud'],
  supplement: {
    glossary,
    cheatsheet: R`### Conceitos
IaaS/PaaS/SaaS/FaaS · dados, identidade e configuração são sempre do cliente · região > zona (AZ) · 99,9% = 43,2 min/30 dias; 99,99% = 4,32 min · série multiplica, paralelo 1 − ∏(1 − A) · o elo mais fraco manda · SLA = crédito, não garantia

### Identidade
AWS: negação implícita; Allow permite; Deny explícito vence; roles + credenciais temporárias; MFA; SCPs · Azure: Entra ID autentica, RBAC autoriza (papel + escopo, aditivo, herança), identidade gerenciada · GCP: org > pastas > projetos; allow herdado e aditivo; deny sobrepõe; contas de serviço sem chaves JSON

### Rede
VPC (AWS) e VNet (Azure) regionais; VPC GCP global · sub-redes privadas, bancos fora das públicas · SG com estado, NACL sem estado · CIDRs sem sobreposição · egress é cobrado

### Serverless
Cold start x quente · inicializar fora do handler · entrega pelo menos uma vez → idempotência + DLQ · concorrência = taxa x duração · pool/proxy de conexões · não serve para carga alta constante

### Custos
Computação, armazenamento, rede (egress), gerenciados, observabilidade · sob demanda, compromisso, Spot · FinOps: informar, otimizar, operar · tags, orçamentos, alertas · explicitar premissas e testar sensibilidade · multi-cloud só com motivo concreto · lock-in: contêineres, IaC, formatos abertos, custo de saída`,
    mistakes: ['Achar que o provedor cuida de dados, identidade e configuração.', 'Administrador em todo lugar (Action *, Owner, Editor).', 'Chaves de longa duração em vez de credenciais temporárias.', 'Bancos em sub-redes públicas.', 'Somar redundâncias ignorando o elo mais fraco.', 'Handlers não idempotentes sob entrega repetida.', 'Comparar custos sem premissas explícitas e sem egress.', 'Multi-cloud por padrão.'],
    prereqMap: R`**Antes deste curso:** redes, Linux, Docker (C6.1) e CI/CD (C6.2).

| Este curso prepara para | Por quê |
|---|---|
| IaC (C6.5) | provisionar em nuvem com Terraform |
| Monitoramento (C6.6) | observar serviços de nuvem e custos |
| Segurança (C7) | IAM, redes e segredos em escala |
| Arquitetura (C8) | arquitetura distribuída sobre a nuvem |

Ordem interna: conceitos → AWS → Azure → Google Cloud → serverless → custos e multi-cloud → projeto.`,
    officialRefs: [REF.nist, REF.awsShared, REF.awsRegions, REF.awsWaf, REF.azureWaf, REF.gcpWaf, REF.awsEc2, REF.awsS3, REF.awsVpc, REF.awsIamEval, REF.awsIamBest, REF.azureHierarchy, REF.azureRbac, REF.azureManagedId, REF.azureVnet, REF.azureAppSvc, REF2.gcpHierarchy, REF2.gcpIam, REF2.gcpServiceAcc, REF2.gcpVpc, REF2.gcpRun, REF2.gcpProducts, REF2.lambdaDocs, REF2.lambdaEnv, REF2.azureFunctions, REF2.sqsDelivery, REF2.finops, REF2.awsPricing, REF2.azurePricing, REF2.gcpPricing],
    practice: ['Calcule a indisponibilidade permitida e a composição de um sistema seu.', 'Escreva políticas de menor privilégio e avalie-as com o modelo.', 'Planeje CIDRs e sub-redes de uma VPC em duas zonas.', 'Meça o cold start de um modelo e torne um handler idempotente.', 'Monte um modelo de custo com premissas e teste a sensibilidade.', 'Escreva um ADR sobre portabilidade e saída do provedor.', 'Faça o projeto integrador: arquitetura cloud.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
