// Curso C5.3 da C5: Documentação arquitetural (disciplina: adr).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c53-a.mjs';
import { REF2, lessonsB } from './c53-b.mjs';
import { exsets, assessment, project } from './c53-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['UML essencial', 'Diagramas C4', 'ADR (Architecture Decision Records)', 'Comunicação de decisões técnicas'];
export const COVER = {
  'UML essencial': ['adr-01'],
  'Diagramas C4': ['adr-02'],
  'ADR (Architecture Decision Records)': ['adr-03'],
  'Comunicação de decisões técnicas': ['adr-04']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Documentação viva', def: 'Documentação mantida junto ao código, revisada e verificada automaticamente para não ficar desatualizada.' },
  { term: 'arc42', def: 'Template de 12 seções para documentar arquitetura, usado como checklist.' },
  { term: 'Fitness function', def: 'Verificação automatizada de uma característica arquitetural (por exemplo, dependências entre módulos).' },
  { term: 'Runbook', def: 'Guia operacional passo a passo para executar uma tarefa ou responder a um incidente.' },
  { term: 'SVG', def: 'Formato de imagem vetorial em XML, usado nas saídas dos renderizadores de diagramas.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'arquitetura-docs', disciplineId: 'adr', areaId: 'arch', requires: [],
  title: 'Documentação arquitetural: UML essencial, diagramas C4, ADRs e comunicação de decisões',
  description: 'Documentar e comunicar arquitetura com diagramas como código e decisões registradas, com ferramentas executadas: UML essencial (classes, sequência, estados e ER) em Mermaid (mermaid-cli 12.2.0: 7 diagramas renderizados em 3,7 a 8,2 s e um inválido com exit 1) e PlantUML (1.2026.10 via Docker: 3 diagramas e um erro de sintaxe com exit 200, além do achado de que ele aceita um loop sem fim); modelo C4 (contexto, contêineres, componentes e código; Mermaid C4 renderizado, com limites documentados; Structurizr não executado); ADRs (formato, status, imutabilidade, substituição recíproca, verificador próprio: 5 válidos e 3 defeituosos com 9 problemas, índice gerado, 5 testes); e comunicação (design doc, RFC, BLUF, matriz de decisão ponderada com dados hipotéticos 4,75/3,75/2,35, Diátaxis, arc42 e docs as code). Projeto: dossiê arquitetural. Structurizr, C4-PlantUML, draw.io, adr-tools e Log4brains não foram executados.',
  objectives: ['Escolher e escrever o diagrama UML adequado como código', 'Documentar a arquitetura nos níveis do C4', 'Registrar decisões com ADRs completos e verificáveis', 'Comunicar decisões e trade-offs a diferentes audiências', 'Manter a documentação viva com revisão e CI'],
  level: 'M', prereqs: ['Noções de programação e de arquitetura de aplicações web', 'Clean Code e SOLID (C5.1) e Design Patterns (C5.2) recomendados', 'Node.js 22 ou superior (o curso usa 26.13.1)'], hours: 8,
  syllabus: 'UML essencial; diagramas C4; ADR; comunicação de decisões; projeto de dossiê arquitetural.',
  versions: 'Node.js 26.13.1, @mermaid-js/mermaid-cli 12.2.0 (com o Google Chrome do sistema) e PlantUML 1.2026.10 (imagem Docker plantuml/plantuml), em 2026-11-25 (laboratório em seed/c5/labs/arquitetura-docs/). Tempos e tamanhos de uma execução. Achados: o mmdc usa um navegador (exige Chrome e --no-sandbox em contêineres); o PlantUML aceitou um loop sem fim e uma seta sem destino (exit 0) e só recusou erro de sintaxe real (exit 200); a documentação do Mermaid lista legenda, tags, links e sprites como não suportados em C4. O verificador de ADRs e a matriz de decisão são scripts próprios do curso; as notas da matriz são hipotéticas. Os desafios de código são em JavaScript e modelam a lógica. Não executados: Structurizr (DSL e Lite), C4-PlantUML, draw.io, adr-tools, Log4brains, Backstage e o workflow YAML de CI (exemplo).',
  skills: ['Diagramas UML como código', 'Modelo C4', 'ADRs', 'Design docs e RFCs', 'Análise de trade-offs', 'Documentação como código'],
  modules: [
    { id: 'm1', title: 'Diagramas: UML e C4', lessons: ['adr-01', 'adr-02'] },
    { id: 'm2', title: 'Decisões e comunicação', lessons: ['adr-03', 'adr-04'] }
  ],
  materials: [REF.c4model, REF.mermaid, REF.plantuml, REF2.nygard, REF2.designDocs, REF2.diataxis].map((r) => ({ ...r })),
  projectIds: ['dossie-arquitetural'],
  supplement: {
    glossary,
    cheatsheet: R`### UML essencial
Uma pergunta por diagrama · classes (associação, composição *--, herança <|--, realização <|.., dependência ..>) · sequência (->>, -->>, alt/loop) · estados (tabela de transições) · ER (PK, FK, cardinalidade) · como código no repositório · mmdc exit 1 em erro; PlantUML exit 200 (mas aceita loop sem fim) · renderizar valida a sintaxe, não a correção

### C4
Contexto (sistema, pessoas, externos) → Contêineres (aplicações/armazenamentos com tecnologia e protocolo) → Componentes → Código (raro) · contêiner ≠ Docker · título, legenda, verbo e protocolo nas setas, um nível por diagrama · Mermaid C4: sem legenda/tags/links/sprites, layout automático · Structurizr: modelo único (não executado)

### ADR
Título numerado · Status (Proposto, Aceito, Rejeitado, Obsoleto, Substituído por) · Data · Contexto · Decisão · ≥ 2 alternativas · Consequências (positivas e negativas/riscos) · imutável: substitui com ligação recíproca · no repositório, revisado em PR · registre também as rejeitadas · verificador + índice gerado

### Comunicação
BLUF · audiência · design doc (objetivos, não objetivos, design, alternativas, riscos, plano, reversão) · RFC com prazo e decisor · matriz ponderada (pesos 100, notas 1–5) + análise de sensibilidade · Diátaxis (tutorial, guia, referência, explicação) · arc42 como checklist · docs as code (CI: ADRs, diagramas, links, índice) · donos e datas`,
    mistakes: ['Diagrama gigante, sem pergunta, legenda ou escopo.', 'Achar que renderizar sem erro prova que o diagrama está correto e atualizado.', 'Confundir contêiner do C4 com contêiner Docker.', 'ADR escrito depois, sem alternativas reais e só com consequências positivas.', 'Reescrever ADRs antigos em vez de substituí-los.', 'Matriz de decisão tratada como verdade objetiva.', 'Decisões que vivem só em chat ou reunião.', 'Documentação sem dono, sem data e fora do repositório.'],
    prereqMap: R`**Antes deste curso:** noções de arquitetura de aplicações web; Clean Code (C5.1) e Design Patterns (C5.2) ajudam a falar de design.

| Este curso prepara para | Por quê |
|---|---|
| Qualidade e manutenção (C5.8) | ADRs e dívida técnica se conectam; documentação viva faz parte da qualidade |
| Arquitetura e escalabilidade (C8) | estilos arquiteturais e decisões são registrados como ADRs e C4 |
| Infra e CI/CD (C6) | pipelines que validam documentação |
| Microsserviços (C4.7) | diagramas de contexto, contêineres e sagas |

Ordem interna: aulas 1 e 2 (UML e C4) → 3 e 4 (ADR e comunicação) → projeto.`,
    officialRefs: [REF.umlSpec, REF.mermaid, REF.mermaidClass, REF.mermaidSequence, REF.mermaidState, REF.mermaidEr, REF.mermaidC4, REF.mermaidCli, REF.plantuml, REF.c4model, REF.structurizr, REF.docsAsCode, REF.arc42, REF2.nygard, REF2.adrSite, REF2.madr, REF2.adrTools, REF2.log4brains, REF2.radarAdr, REF2.designDocs, REF2.diataxis, REF2.decisionMatrix, REF2.atam, REF2.rustRfcs],
    practice: ['Escreva em Mermaid um diagrama de sequência com caminho de falha e renderize com o mmdc.', 'Converta um diagrama de estados em tabela de transições e teste as transições inválidas.', 'Desenhe o contexto e os contêineres do seu sistema com o modelo C4.', 'Escreva três ADRs (um rejeitado e um substituído) e valide-os com o verificador.', 'Gere o índice dos ADRs e rode os testes.', 'Monte uma matriz de decisão e varie os pesos para ver se o vencedor muda.', 'Escreva um design doc de uma página com BLUF.', 'Faça o projeto integrador: dossiê arquitetural.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
