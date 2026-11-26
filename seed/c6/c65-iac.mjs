// Curso C6.5 da C6: Infraestrutura como código (disciplina: iac).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c65-a.mjs';
import { exsets, assessment, project } from './c65-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA]);
const ex = dolar(exsets);

export const TOPICS = ['Terraform', 'Módulos, state e boas práticas'];
export const COVER = {
  'Terraform': ['iac-01'],
  'Módulos, state e boas práticas': ['iac-02']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'HCL', def: 'HashiCorp Configuration Language, a linguagem declarativa do Terraform.' },
  { term: 'Data source', def: 'Bloco que lê informações de objetos existentes sem gerenciá-los.' },
  { term: 'Keepers', def: 'Valores do provedor random que, ao mudar, forçam a geração de um novo valor aleatório.' },
  { term: 'prevent_destroy', def: 'Configuração de lifecycle que faz o Terraform recusar a destruição de um recurso.' },
  { term: 'tfvars', def: 'Arquivo com valores de variáveis, em geral um por ambiente.' },
  { term: 'OpenTofu', def: 'Fork de código aberto do Terraform mantido pela Linux Foundation.' },
  { term: 'Plano salvo', def: 'Plano gravado com -out que o apply executa exatamente, evitando divergência entre revisão e aplicação.' },
  { term: 'Refresh', def: 'Atualização do state com o estado real dos objetos, feita ao planejar.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'iac', disciplineId: 'iac', areaId: 'ops', requires: [],
  title: 'Infraestrutura como código: Terraform, módulos, state, drift e boas práticas',
  description: 'Descrever e operar infraestrutura por código, com experimentos executados (Terraform v1.17.2; provedores local 2.9.1 e random 3.9.1; sem nuvem): ciclo init, fmt, validate, plan, apply e destroy (plano com 4 recursos; segundo plan No changes, exit 0; fmt -check exit 3; validate recusa referência inexistente); variáveis tipadas com validação (ambiente inválido e replicas 0 recusados); módulo com for_each (module.servico["api"] e ["web"]); mudança de réplicas substitui o arquivo (1 to add, 1 to destroy); drift por alteração e remoção manual (plan -detailed-exitcode → 2, apply corrige); troca de ambiente no mesmo state (3 to add, 3 to destroy); segredo sensitive legível no state. Projeto: infraestrutura como código. Provedores de nuvem, backends remotos, workspaces, import/moved, OpenTofu, tflint/checkov, OPA e CI não foram executados.',
  objectives: ['Explicar IaC e o modelo declarativo e executar o ciclo do Terraform', 'Ler planos e identificar create, update, destroy e replace', 'Escrever variáveis validadas e módulos com for_each', 'Entender o state, seus riscos (segredos) e os backends remotos com bloqueio', 'Detectar e corrigir drift e desenhar um pipeline de IaC seguro'],
  level: 'M', prereqs: ['Linha de comando e Docker (C6.1)', 'CI/CD (C6.2) e noções de nuvem (C6.4)', 'Docker 29 ou superior (o curso usa 29.9.3)'], hours: 4,
  syllabus: 'Terraform e seu ciclo; módulos, state, drift, segredos e pipeline; projeto de infraestrutura como código.',
  versions: 'Docker 29.9.3, Terraform v1.17.2 (imagem hashicorp/terraform), provedores hashicorp/local 2.9.1 e hashicorp/random 3.9.1 (fixados no lock file) e Node 26.13.1 (apoio), em 2026-11-25 (laboratório em seed/c6/labs/iac/). Nenhum recurso de nuvem foi criado: os recursos são arquivos locais e valores aleatórios. Achados: o drift do local_file (alteração de conteúdo) é tratado como recurso a recriar; sensitive não protege o state. Os desafios de código são em JavaScript e modelam a lógica. Não executados: provedores de nuvem, backends remotos e bloqueio, workspaces, import e moved, terraform test, OpenTofu, tflint, checkov, OPA/Sentinel e CI real.',
  skills: ['Terraform e HCL', 'Leitura de planos', 'Módulos reutilizáveis', 'Gestão de state e segredos', 'Detecção de drift', 'Pipelines de IaC'],
  modules: [
    { id: 'm1', title: 'Terraform: ciclo, plano e drift', lessons: ['iac-01'] },
    { id: 'm2', title: 'Módulos, state e boas práticas', lessons: ['iac-02'] }
  ],
  materials: [REF.tfDocs, REF.tfWorkflow, REF.tfState, REF.tfModules, REF.tfSensitive].map((r) => ({ ...r })),
  projectIds: ['infra-como-codigo'],
  supplement: {
    glossary,
    cheatsheet: R`### Ciclo
fmt -check · init (lock file) · validate · plan -out=plano · apply plano · plan (No changes = idempotente) · destroy · plan -detailed-exitcode: 0 sem mudanças, 1 erro, 2 mudanças

### Plano
+ create · ~ update · - destroy · -/+ replace (must be replaced) · leia destroy e replace com atenção · prevent_destroy em recursos críticos

### Linguagem
variable (type, validation, sensitive) · output · locals · module · for_each (chaves estáveis) · count (posição) · depends_on · lifecycle · provider com versão fixada

### State
mapeia config ↔ real · contém segredos em texto claro (sensitive só oculta na tela) · backend remoto criptografado, versionado, com bloqueio · um state por ambiente e componente · nunca editar à mão (moved, import, state mv)

### Drift e pipeline
plan atualiza o state e mostra Objects have changed outside of Terraform · job agendado com -detailed-exitcode · PR: fmt, validate, lint, scan, plan comentado · merge: apply do plano salvo com aprovação · OIDC · um apply por state`,
    mistakes: ['Aplicar sem ler o plano.', 'Alterar recursos fora do código.', 'Achar que sensitive criptografa o state.', 'State local ou no Git.', 'Alternar ambientes por variável no mesmo state.', 'count em listas mutáveis.', 'Não versionar o lock file.', 'Segredos em tfvars ou defaults versionados.'],
    prereqMap: R`**Antes deste curso:** Docker (C6.1), CI/CD (C6.2) e conceitos de nuvem (C6.4).

| Este curso prepara para | Por quê |
|---|---|
| Monitoramento (C6.6) | provisionar a observabilidade como código |
| Segurança (C7) | políticas como código e proteção de state |
| Arquitetura (C8) | infraestrutura reprodutível para sistemas distribuídos |

Ordem interna: Terraform e seu ciclo → módulos, state e boas práticas → projeto.`,
    officialRefs: [REF.tfDocs, REF.tfWorkflow, REF.tfLang, REF.tfVariables, REF.tfState, REF.tfSensitive, REF.tfModules, REF.tfForEach, REF.tfBackend, REF.tfLock, REF.tfPlanCmd, REF.tfProviderLocal, REF.tfProviderRandom, REF.opentofu],
    practice: ['Execute o ciclo completo em um módulo seu e leia o plano.', 'Escreva variáveis validadas e teste valores inválidos.', 'Converta count em for_each e observe os endereços.', 'Provoque drift e detecte com -detailed-exitcode.', 'Verifique o que o state guarda e proponha a mitigação para segredos.', 'Desenhe o pipeline de IaC de um time.', 'Faça o projeto integrador: infraestrutura como código.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
