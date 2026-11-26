// Curso C7.1 da C7: OWASP (disciplina: owasp).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c71-a.mjs';
import { exsets, assessment, project } from './c71-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA]);
const ex = dolar(exsets);

export const TOPICS = ['OWASP Top 10', 'OWASP API Security Top 10'];
export const COVER = { 'OWASP Top 10': ['owasp-01'], 'OWASP API Security Top 10': ['owasp-02'] };

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'CWE', def: 'Catálogo comum de tipos de fraquezas de software, usado para classificar vulnerabilidades.' },
  { term: 'CVE', def: 'Identificador público de uma vulnerabilidade específica em um produto.' },
  { term: 'CVSS', def: 'Sistema de pontuação da severidade técnica de vulnerabilidades.' },
  { term: 'SAST', def: 'Análise estática de segurança do código-fonte.' },
  { term: 'DAST', def: 'Teste dinâmico de segurança de uma aplicação em execução.' },
  { term: 'Modelagem de ameaças', def: 'Processo de identificar ameaças e controles durante o desenho de um sistema.' },
  { term: 'Negação por padrão', def: 'Política em que o acesso só é concedido por regra explícita.' },
  { term: 'Registro de auditoria', def: 'Log de eventos relevantes de segurança com tempo, ator e resultado.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'owasp', disciplineId: 'owasp', areaId: 'sec', requires: [],
  title: 'OWASP: Top 10:2025 e API Security Top 10:2023 com laboratório de ataque e defesa',
  description: 'Reconhecer e corrigir os riscos mais críticos de aplicações web e APIs, com experimentos executados em uma loja de demonstração em duas versões (Node 26.13.1, 127.0.0.1, dados sintéticos; 9 testes): enumeração de usuários (404/401 contra 401/401), força bruta (401 x 8 contra 401 x 5 e 429 x 3, 10 eventos registrados), token previsível (200 contra 401), BOLA (200 contra 404), SQL Injection com UNION (senhas vazadas contra 0 linhas), atribuição em massa (admin contra usuario), consumo irrestrito (300 contra 50 linhas), e erros com pilha contra id de correlação. Lista do Top 10:2025 conferida na fonte (SSRF incorporado ao A01). Projeto: auditoria OWASP. Scanners, supply chain, integridade, gateway e OAuth/OIDC não foram executados.',
  objectives: ['Explicar o Top 10:2025 e o API Security Top 10:2023 e seus limites', 'Detectar e corrigir falhas de autorização, autenticação, injeção e configuração', 'Provar vulnerabilidade e correção com testes automatizados', 'Aplicar listas de permissão, limites e DTOs em APIs', 'Priorizar riscos e relatar achados com evidência'],
  level: 'M', prereqs: ['HTTP e APIs REST (C3/C4)', 'SQL básico', 'Node.js 22 ou superior (o curso usa 26.13.1)'], hours: 3,
  syllabus: 'OWASP Top 10:2025; API Security Top 10:2023; projeto de auditoria OWASP.',
  versions: 'Node.js 26.13.1 (node:http, node:crypto, node:sqlite, node:test), em 2026-11-26 (laboratório em seed/c7/labs/owasp/). Listas conferidas nas páginas oficiais do OWASP (Top 10:2025 e API Security Top 10:2023). Aplicação de demonstração própria, escutando só em 127.0.0.1, dados sintéticos; o código vulnerável não deve ser reutilizado. Os desafios de código são em JavaScript e modelam a lógica. Não executados: OWASP ZAP, Semgrep, Trivy, análise de dependências, integridade de artefatos, SSRF (C7.2), WAF, gateway de APIs, OAuth/OIDC.',
  skills: ['OWASP Top 10', 'Segurança de APIs', 'Autorização por objeto e função', 'Testes de segurança', 'Relatório de auditoria'],
  modules: [
    { id: 'm1', title: 'OWASP Top 10', lessons: ['owasp-01'] },
    { id: 'm2', title: 'API Security Top 10', lessons: ['owasp-02'] }
  ],
  materials: [REF.top10, REF.apiTop10, REF.asvs, REF.cheatsheets].map((r) => ({ ...r })),
  projectIds: ['auditoria-owasp'],
  supplement: {
    glossary,
    cheatsheet: R`### Top 10:2025
A01 Broken Access Control (inclui SSRF) · A02 Security Misconfiguration · A03 Software Supply Chain Failures · A04 Cryptographic Failures · A05 Injection · A06 Insecure Design · A07 Authentication Failures · A08 Software or Data Integrity Failures · A09 Security Logging and Alerting Failures · A10 Mishandling of Exceptional Conditions

### API Top 10:2023
API1 BOLA · API2 Broken Authentication · API3 BOPLA · API4 Unrestricted Resource Consumption · API5 BFLA · API6 Sensitive Business Flows · API7 SSRF · API8 Security Misconfiguration · API9 Inventory · API10 Unsafe Consumption

### Defesas
Autorização no servidor por objeto e função, negar por padrão · mensagens genéricas, limite de tentativas, tokens aleatórios · consultas parametrizadas · lista de campos permitidos (entrada) e DTO (saída) · tetos de página, tamanho e taxa (429) · erros genéricos com id · logs e alertas · testes de ataque e defesa

### Método
ASVS para requisitos · cheat sheets para implementar · STRIDE para modelar ameaças · risco = probabilidade x impacto x custo · matriz de autorização rota x papel x objeto no CI`,
    mistakes: ['Autenticar sem autorizar por objeto.', 'Mensagens de login que revelam contas.', 'Concatenar entrada em SQL.', 'Gravar o corpo da requisição direto no modelo.', 'Devolver a linha inteira do banco.', 'Paginação sem teto.', 'Erros com pilha e cabeçalhos de tecnologia.', 'Achar que o Top 10 é norma de conformidade.'],
    prereqMap: R`**Antes deste curso:** HTTP, APIs REST e SQL básico.

| Este curso prepara para | Por quê |
|---|---|
| Vulnerabilidades web (C7.2) | aprofunda SQLi, XSS, CSRF, CORS e SSRF |
| Criptografia (C7.3) | senhas, tokens e segredos |
| Secure coding e LGPD (C7.4) | práticas de desenvolvimento seguro e privacidade |

Ordem interna: Top 10:2025 → API Security Top 10 → projeto.`,
    officialRefs: [REF.top10, REF.top10intro, REF.top10a01, REF.apiTop10, REF.asvs, REF.cheatsheets, REF.csAuthz, REF.csAuthn, REF.csPassword, REF.csErrors, REF.csRest, REF.csMass, REF.nodeSqlite, REF.nodeTest],
    practice: ['Rode os 9 testes e leia cada ataque e cada defesa.', 'Acrescente uma rota à loja e escreva a matriz de autorização dela.', 'Corrija uma falha e escreva o teste de regressão.', 'Escreva requisitos ASVS para um achado.', 'Priorize três achados por risco.', 'Faça o projeto integrador: auditoria OWASP.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
