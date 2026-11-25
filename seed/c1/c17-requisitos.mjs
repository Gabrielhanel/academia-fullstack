// Curso C1.7 da C1: Requisitos e modelagem de domínio (disciplinas: requirements + agile).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c17-a.mjs';
import { REF2, lessonsB } from './c17-b.mjs';
import { exsets, assessment, project } from './c17-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Requisitos funcionais e não funcionais', 'Histórias de usuário e critérios de aceitação', 'Event Storming', 'Especificação por exemplos (BDD)', 'Modelagem de domínio com DDD', 'Levantamento de requisitos'];
export const COVER = {
  'Requisitos funcionais e não funcionais': ['req-01'],
  'Histórias de usuário e critérios de aceitação': ['req-02'],
  'Event Storming': ['req-03'],
  'Especificação por exemplos (BDD)': ['req-04'],
  'Modelagem de domínio com DDD': ['req-05', 'req-06'],
  'Levantamento de requisitos': ['req-07']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Stakeholder', def: 'Pessoa ou grupo que afeta ou é afetado pelo sistema.' },
  { term: 'Backlog', def: 'Lista ordenada de itens de trabalho (histórias, correções, melhorias) a serem feitos.' },
  { term: 'Critério de aceitação', def: 'Condição verificável para considerar uma história atendida.' },
  { term: 'Domínio', def: 'Área de conhecimento ou de atividade do negócio que o software modela.' },
  { term: 'Modelo de domínio', def: 'Representação organizada dos conceitos, regras e relações do domínio.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'requisitos-dominio', disciplineId: 'requirements', disciplineIds: ['agile'], areaId: 'eng', requires: ['fluxo-agilidade', 'logica-algoritmos'],
  title: 'Requisitos e modelagem de domínio: do levantamento ao DDD',
  description: 'Do problema ao modelo: como descobrir e escrever requisitos verificáveis (funcionais e não funcionais, ISO/IEC 25010), transformá-los em histórias com critérios de aceitação, explorar o domínio com Event Storming, especificar por exemplos com BDD (Gherkin e cucumber-js executados) e modelar com Domain-Driven Design (linguagem ubíqua, contextos delimitados, agregados, objetos de valor e eventos de domínio em código executado em Node.js 26). O curso fecha com o levantamento de requisitos, a priorização e a validação, e com um projeto integrador de especificação e modelagem.',
  objectives: ['Escrever requisitos funcionais e não funcionais verificáveis, usando a ISO/IEC 25010 como lista de verificação', 'Criar histórias de usuário com critérios de aceitação em Dado-Quando-Então e dividi-las verticalmente', 'Conduzir e interpretar um Event Storming e derivar contextos e agregados candidatos', 'Especificar por exemplos e automatizar cenários Gherkin', 'Aplicar DDD estratégico (linguagem ubíqua, subdomínios e mapa de contextos) e tático (entidades, objetos de valor, agregados e eventos)', 'Levantar requisitos com técnicas adequadas, priorizar com critérios e gerenciar conflitos e mudanças'],
  level: 'I', prereqs: ['Lógica de programação e noções de orientação a objetos', 'Fluxo de trabalho em equipe e agilidade (curso Fluxo profissional e agilidade)', 'Para as aulas 4 a 6: JavaScript básico (os exemplos são executados em Node.js 22 ou superior)'], hours: 24,
  syllabus: 'Requisitos funcionais, não funcionais e restrições (ISO/IEC 25010); histórias de usuário, INVEST, critérios de aceitação e divisão vertical; Event Storming (Big Picture, Process Modeling, Software Design); especificação por exemplos e BDD (Gherkin, cucumber-js); DDD estratégico (linguagem ubíqua, subdomínios, contextos delimitados, mapa de contextos); DDD tático (entidade, objeto de valor, agregado, evento de domínio, repositório); levantamento de requisitos (stakeholders, entrevistas, observação, priorização MoSCoW, Kano, validação e mudança).',
  versions: 'Node.js 26 e @cucumber/cucumber 13.3.0 (exemplos executados em 2026-11-18); Gherkin com palavras-chave em português (# language: pt); ISO/IEC 25010 (revisão de 2023, nove características), ISO/IEC/IEEE 29148, Domain-Driven Design Reference (Evans), Event Storming (Brandolini) e MoSCoW (Agile Business Consortium), consultados na mesma data. Notações, cores e nomes de técnicas variam entre equipes e autores; o Event Storming e o mapa de contextos não foram executados (são práticas de workshop).',
  skills: ['Engenharia de requisitos', 'Requisitos não funcionais', 'Histórias e critérios de aceitação', 'Event Storming', 'BDD e Gherkin', 'DDD estratégico', 'DDD tático', 'Levantamento e priorização'],
  modules: [
    { id: 'm1', title: 'Requisitos e histórias', lessons: ['req-01', 'req-02'] },
    { id: 'm2', title: 'Event Storming e BDD', lessons: ['req-03', 'req-04'] },
    { id: 'm3', title: 'DDD e levantamento de requisitos', lessons: ['req-05', 'req-06', 'req-07'] }
  ],
  materials: [REF.iso25010, REF.cohnStories, REF.eventStorming, REF2.gherkin, REF2.dddRef, REF2.boundedContext].map((r) => ({ ...r })),
  projectIds: ['especificacao-biblioteca-comunitaria'],
  supplement: {
    glossary,
    cheatsheet: R`### Requisitos
Funcional = o que faz · não funcional = como se comporta (ISO/IEC 25010 de 2023, nove características: adequação funcional, eficiência de desempenho, compatibilidade, capacidade de interação, confiabilidade, segurança, manutenibilidade, flexibilidade, segurança operacional) · verificável: métrica + limite + carga + ambiente · "deve" = obrigatório · um requisito, uma ideia · id, origem, prioridade, critério · registre trade-offs e decisões

### Histórias
"Como [usuário], quero [capacidade], para [benefício]" · 3 C: Card, Conversation, Confirmation · INVEST: Independente, Negociável, Valiosa, Estimável, Small, Testável · critérios: lista ou Dado-Quando-Então · Definição de Pronto (do time) ≠ critérios (da história) · divida vertical (SPIDR: Spike, Paths, Interfaces, Data, Rules)

### Event Storming
Evento (laranja, passado) · comando (azul) · ator · política (lilás: "sempre que X, faça Y") · agregado · sistema externo · ponto de atenção · Big Picture → Process Modeling → Software Design · explosão de eventos → linha do tempo → pontos de atenção → atores e sistemas → áreas

### BDD e Gherkin
Três amigos (negócio, dev, teste) → exemplos → cenários → automação → documentação viva · §Funcionalidade§ §Regra§ §Cenário§ §Esquema do Cenário§ §Exemplos§ §Dado§ §Quando§ §Então§ · declarativo (comportamento), não imperativo (cliques) · valores-limite · automatize perto da regra

### DDD estratégico
Linguagem ubíqua por contexto · contexto delimitado = fronteira de modelo e linguagem · subdomínios: núcleo (investir), apoio, genérico (comprar) · mapa de contextos: parceria, núcleo compartilhado, cliente-fornecedor, conformista, ACL, serviço de acolhida, linguagem publicada · monólito modular antes de microsserviços

### DDD tático
Entidade (identidade) · objeto de valor (imutável, por valor) · agregado (raiz, invariantes, pequeno, ids para outros agregados, uma transação por agregado) · evento de domínio (passado, imutável, outbox) · repositório · serviço de domínio x de aplicação · evite o modelo anêmico

### Levantamento
Stakeholders (poder x interesse) · cinco porquês · entrevista (aberta, exemplos reais) · observação · workshop · protótipo · MoSCoW (limite o Must) · valor x esforço · Kano · custo do atraso · valide cedo · rastreie · gerencie mudanças`,
    mistakes: ['Requisitos vagos ("rápido", "amigável") e não funcionais esquecidos.', 'História que é tarefa ou épico; critérios que descrevem a implementação.', 'Dividir histórias por camada e só ter valor no fim.', 'Event Storming só com a equipe técnica, ou eventos como "atualizar registro".', 'Cenários Gherkin como roteiros de cliques, sem a conversa dos três amigos.', 'Um modelo único e universal; microsserviços antes de entender os contextos.', 'Modelo de domínio anêmico e agregados gigantes.', 'Aceitar o pedido como requisito sem investigar a necessidade; priorizar por quem fala mais alto.'],
    prereqMap: R`**Antes deste curso:** lógica de programação e noções de orientação a objetos. É recomendável ter feito o curso Fluxo profissional e agilidade (backlog, Scrum, Kanban, PRs). Para as aulas 4 a 6, JavaScript básico.

| Este curso prepara para | Por quê |
|---|---|
| Arquitetura de software | RNF, contextos e agregados guiam as decisões |
| Testes e qualidade | critérios de aceitação e cenários viram testes |
| Modelagem de dados | o modelo de domínio origina o modelo de dados |
| Microsserviços e mensageria | contextos delimitados e eventos de domínio |
| Gestão de produto | levantamento, priorização e validação de requisitos |

Ordem interna: aulas 1 e 2 (requisitos e histórias) → 3 e 4 (Event Storming e BDD) → 5 a 7 (DDD e levantamento).`,
    officialRefs: [REF.iso25010, REF.iso29148, REF.swebok, REF.cohnStories, REF.invest, REF.givenWhenThen, REF.eventStorming, REF2.gherkin, REF2.bdd, REF2.betterGherkin, REF2.cucumberJs, REF2.specByExample, REF2.dddRef, REF2.boundedContext, REF2.ubiquitous, REF2.aggregate, REF2.valueObject, REF2.domainEvent, REF2.anemic, REF2.moscow, REF2.kano],
    practice: ['Reescreva cinco requisitos vagos de um projeto seu com métrica, limite e método de verificação.', 'Escreva uma história com critérios Dado-Quando-Então e avalie-a pelo INVEST; divida-a verticalmente.', 'Simule um Event Storming Big Picture do seu sistema favorito com notas adesivas e marque cinco pontos de atenção.', 'Transforme os critérios de uma história em cenários Gherkin e execute-os com cucumber-js ou lógica equivalente.', 'Liste três termos que mudam de sentido entre áreas da sua empresa e proponha contextos.', 'Implemente um agregado pequeno (com objeto de valor e evento) e escreva testes para as invariantes.', 'Conduza uma entrevista curta (com roteiro) e priorize o resultado com MoSCoW.', 'Faça o projeto integrador: a especificação da biblioteca comunitária.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
