// Curso C7.2 da C7: Vulnerabilidades web (disciplina: websec).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c72-a.mjs';
import { REF2, lessonsB } from './c72-b.mjs';
import { exsets, assessment, project } from './c72-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['SQL Injection', 'XSS', 'CSRF', 'CORS', 'SSRF'];
export const COVER = { 'SQL Injection': ['wsec-01'], 'XSS': ['wsec-02'], 'CSRF': ['wsec-03'], 'CORS': ['wsec-04'], 'SSRF': ['wsec-05'] };

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Origem', def: 'Combinação de esquema, host e porta de uma URL.' },
  { term: 'Registrable domain', def: 'Domínio de nível superior efetivo mais um rótulo, usado para decidir se dois hosts são do mesmo site.' },
  { term: 'Public Suffix List', def: 'Lista mantida pela comunidade com os sufixos públicos usados para calcular o domínio registrável.' },
  { term: 'Defesa em profundidade', def: 'Uso de várias camadas de controle para que a falha de uma não comprometa o sistema.' },
  { term: 'Open redirect', def: 'Endpoint que redireciona para uma URL controlada pelo usuário, usado para contornar validações.' },
  { term: 'Content-Type', def: 'Cabeçalho que declara o tipo do corpo da requisição ou resposta.' },
  { term: 'Report-Only (CSP)', def: 'Modo da CSP que apenas relata violações, útil para testar uma política antes de aplicá-la.' },
  { term: 'Nonce', def: 'Valor aleatório de uso único usado em CSP para autorizar scripts inline específicos.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'websec', disciplineId: 'websec', areaId: 'sec', requires: [],
  title: 'Vulnerabilidades web: SQL Injection, XSS, CSRF, CORS e SSRF com laboratório de ataque e defesa',
  description: 'Entender, reproduzir e corrigir as cinco vulnerabilidades web mais cobradas, em uma aplicação de demonstração em duas versões (Node 26.13.1, 127.0.0.1, dados sintéticos; 10 testes HTTP) e em Chrome 157: SQL Injection (bypass 200/401, UNION 2 linhas com credenciais/0, erro vazando o banco 500/400); XSS (alert refletido e armazenado 1x/1x contra 0x/0x; document.cookie legível só sem HttpOnly); CSRF (100 transferidos por atacante same-site e cross-site na vulnerável; saldo inalterado na corrigida; 415/403/403/200 nos testes HTTP); CORS (origem refletida com credenciais: página atacante leu {"saldo":800}; corrigida bloqueada); SSRF (segredo interno lido direto e por redirecionamento; 13 classes de IP, formas ofuscadas e redirecionamento para 169.254.169.254 bloqueados). Projeto: app web endurecida. XSS por DOM, SQLi cega, DNS rebinding, outros navegadores, HTTPS e metadados reais de nuvem não foram executados; a causa do CSRF cross-site e do efeito isolado da CSP não foi isolada.',
  objectives: ['Explicar a causa e o impacto de SQLi, XSS, CSRF, CORS permissivo e SSRF', 'Reproduzir cada ataque em ambiente próprio e provar a correção com testes', 'Aplicar parâmetros, codificação de saída, tokens, listas de permissão e validação de URL', 'Distinguir same-origin e same-site e os limites do SameSite e do CORS', 'Relatar resultados incluindo achados inesperados e limites'],
  level: 'M', prereqs: ['OWASP (C7.1)', 'HTTP, cookies e JavaScript (C3/C4)', 'Node.js 22 ou superior (o curso usa 26.13.1) e Google Chrome para a parte de navegador'], hours: 7,
  syllabus: 'SQL Injection; XSS; CSRF; CORS; SSRF; projeto de app web endurecida.',
  versions: 'Node.js 26.13.1 (node:http, node:sqlite, node:crypto, node:test), Chrome 157.0.8103.50 e puppeteer-core, em 2026-11-26 (laboratório em seed/c7/labs/vulnerabilidades-web/). Aplicação de demonstração própria em 127.0.0.1 com dados sintéticos; código vulnerável não reutilizável. Achados: o CSRF funcionou também cross-site na versão vulnerável (cookie sem SameSite explícito; causa consistente com a exceção Lax+POST do Chrome, não isolada); o CORS aberto permitiu leitura da resposta mesmo sem o cookie ser enviado. Os desafios de código são em JavaScript e modelam a lógica. Não executados: XSS por DOM, Trusted Types, sanitizadores, SQLi cega e de segunda ordem, DNS rebinding, metadados reais de nuvem, outros navegadores, HTTPS/Secure, scanners (ZAP, sqlmap).',
  skills: ['Consultas parametrizadas', 'Codificação de saída e CSP', 'Defesa contra CSRF', 'Configuração segura de CORS', 'Defesa contra SSRF', 'Testes de segurança em navegador real'],
  modules: [
    { id: 'm1', title: 'Injeção e scripts', lessons: ['wsec-01', 'wsec-02', 'wsec-03'] },
    { id: 'm2', title: 'Origens e requisições do servidor', lessons: ['wsec-04', 'wsec-05'] }
  ],
  materials: [REF.csSqli, REF.csXss, REF.csCsrf, REF2.mdnCors, REF2.csSsrf].map((r) => ({ ...r })),
  projectIds: ['app-web-endurecida'],
  supplement: {
    glossary,
    cheatsheet: R`### SQL Injection
Parâmetros (?) em toda consulta · lista de permissão para colunas, tabelas e direção · erros genéricos · menor privilégio no banco · senhas com hash lento · testes com ' OR 1=1 -- e UNION

### XSS
Escape de saída por contexto (& < > " ') · textContent em vez de innerHTML · sanitizador mantido para HTML rico · CSP sem unsafe-inline (Report-Only antes) · cookies HttpOnly/Secure/SameSite · nosniff · só http/https/mailto em links

### CSRF
Token anti-CSRF ligado à sessão · JSON + cabeçalho customizado (preflight) · validar Origin · SameSite explícito (não confiar no padrão) · same-site ≠ same-origin (porta não conta) · nunca mudar estado com GET

### CORS
SOP bloqueia leitura cross-origin · CORS autoriza leitura · lista de origens exatas · nunca refletir Origin · sem curinga com credenciais · rejeitar null · Vary: Origin · CORS não é controle de acesso nem proteção contra CSRF

### SSRF
Evitar buscar URL do usuário · allowlist de hosts · só http/https · sem credenciais · resolver e bloquear IP interno (127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, 100.64/10, ::1, fc00::/7, fe80::/10, ::ffff:) · não seguir redirect automático · timeout e tamanho · isolar · egress filtering · IMDSv2`,
    mistakes: ['Concatenar entrada em SQL e confiar em escape manual.', 'Escapar para um contexto e usar em outro; innerHTML com dados do usuário.', 'Confiar no padrão SameSite do navegador e em Strict contra atacantes same-site.', 'Refletir Origin com credenciais e validar origens com endsWith.', 'Lista de bloqueio de localhost em SSRF e seguir redirecionamentos.', 'Devolver o corpo bruto da URL buscada.', 'Achar que CORS protege contra CSRF.', 'Não testar os ataques no CI.'],
    prereqMap: R`**Antes deste curso:** OWASP (C7.1), HTTP, cookies e JavaScript.

| Este curso prepara para | Por quê |
|---|---|
| Criptografia (C7.3) | senhas, tokens e segredos usados nas defesas |
| Secure coding e LGPD (C7.4) | práticas de desenvolvimento seguro em escala |
| Arquitetura (C8) | isolamento, egress e defesa em profundidade entre serviços |

Ordem interna: SQL Injection → XSS → CSRF → CORS → SSRF → projeto.`,
    officialRefs: [REF.csSqli, REF.csQueryParam, REF.csXss, REF.csCsp, REF.csCsrf, REF.cwe89, REF.cwe79, REF.cwe352, REF.mdnCsp, REF.mdnCookies, REF.mdnSetCookie, REF.portswigger, REF.chromeSamesite, REF2.mdnCors, REF2.mdnSop, REF2.fetchCors, REF2.cwe942, REF2.csSsrf, REF2.cwe918, REF2.rfc1918, REF2.rfc3986, REF2.whatwgUrl, REF2.awsImds],
    practice: ['Rode os 10 testes e o script de Chrome e leia cada resultado.', 'Escreva o teste de ataque e o de defesa para um novo endpoint.', 'Troque o escape por nada e meça o efeito isolado da CSP.', 'Teste origens enganosas (evil-app.test, null) contra a política de CORS.', 'Acrescente formas de IP ofuscadas ao teste de SSRF.', 'Faça o projeto integrador: app web endurecida.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
