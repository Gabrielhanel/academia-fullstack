// Curso C1.5 da C1: APIs do navegador e Web Platform (disciplina: browser).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c15-a.mjs';
import { REF2, lessonsB } from './c15-b.mjs';
import { REF3, lessonsC } from './c15-c.mjs';
import { exsets, assessment, project } from './c15-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['DOM e eventos', 'Storage, IndexedDB e Cache API', 'Web Workers', 'Service Workers e PWA', 'WebSockets e Server-Sent Events'];
export const COVER = {
  'DOM e eventos': ['web-01'],
  'Storage, IndexedDB e Cache API': ['web-02', 'web-03'],
  'Web Workers': ['web-04'],
  'Service Workers e PWA': ['web-05', 'web-06'],
  'WebSockets e Server-Sent Events': ['web-07']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Web Platform', def: 'Conjunto de APIs e padrões (HTML, DOM, HTTP, APIs de armazenamento, Workers) implementados pelos navegadores.' },
  { term: 'Contexto seguro', def: 'Página servida por HTTPS (ou localhost), requisito de várias APIs como Service Worker.' },
  { term: 'Origem', def: 'Esquema, domínio e porta; delimita o acesso ao armazenamento e a política de mesma origem.' },
  { term: 'Thread principal', def: 'Thread que executa o JavaScript da página, trata eventos e desenha a interface.' },
  { term: 'Progressive enhancement', def: 'Oferecer o básico a todos e recursos avançados onde o navegador os suporta.' },
  { term: 'Offline-first', def: 'Abordagem em que o app funciona com dados locais e sincroniza quando há conexão.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'web-platform', disciplineId: 'browser', areaId: 'front', requires: ['javascript-fundamentos', 'html-css-a11y', 'redes-http'],
  title: 'APIs do navegador e Web Platform: DOM, armazenamento, Workers, PWA e tempo real',
  description: 'O que o navegador oferece além do HTML: eventos e delegação no DOM, armazenamento no cliente (Web Storage, cookies, IndexedDB e Cache API), Web Workers para tirar trabalho pesado da thread principal, Service Workers com estratégias de cache e PWAs instaláveis e offline, e comunicação em tempo real com polling, Server-Sent Events e WebSocket. Os exemplos foram executados no Chrome 157 contra um servidor local, e os desafios do laboratório verificam a lógica pura (propagação de eventos, cookies, migrações, RPC, estratégias de cache, manifesto e SSE).',
  objectives: ['Explicar a propagação de eventos e aplicar delegação, preventDefault e ouvintes passivos', 'Escolher e usar Web Storage, cookies, IndexedDB e Cache API com tratamento de cota e segurança', 'Mover trabalho pesado para Web Workers com mensagens, clonagem e transferência', 'Implementar Service Workers com pré-cache, limpeza e as estratégias cache-first, network-first e stale-while-revalidate', 'Construir uma PWA instalável com modo offline e fila de sincronização idempotente', 'Escolher entre polling, SSE e WebSocket e implementar reconexão com backoff e jitter'],
  level: 'A', prereqs: ['JavaScript: funções, promises, async/await e módulos', 'HTML e CSS básicos', 'Noções de HTTP (curso Redes e HTTP): métodos, status, cabeçalhos e cache', 'Chrome (ou outro navegador atual) com DevTools'], hours: 24,
  syllabus: 'DOM e eventos (captura, bolha, delegação, CustomEvent, ordem de filas); Web Storage e cookies (escopo, cota, HttpOnly e SameSite); IndexedDB (stores, índices, transações, versões) e Cache API; Web Workers (postMessage, clonagem estruturada, objetos transferíveis, RPC); Service Workers (ciclo de vida, estratégias, atualização); PWA (manifesto, instalabilidade, offline, sincronização); polling, SSE e WebSocket (formato, reconexão, segurança).',
  versions: 'Chrome 157 (Chromium) e o Chromium embutido do ambiente de teste em 2026-11-18; servidor de teste em Node.js 26 com ws 8. As APIs usadas estão em Chrome, Edge, Firefox e Safari atuais, com ressalvas: Background Sync, SharedWorker, a instalação de PWAs e o armazenamento persistente variam por navegador (consulte a tabela de compatibilidade do MDN). Os exemplos de Service Worker exigem HTTPS ou localhost. Limites de cota e comportamentos de evicção dependem do navegador.',
  skills: ['DOM e eventos', 'Armazenamento no cliente', 'IndexedDB e Cache API', 'Web Workers', 'Service Workers', 'PWA e offline-first', 'Comunicação em tempo real'],
  modules: [
    { id: 'm1', title: 'DOM, eventos e armazenamento no cliente', lessons: ['web-01', 'web-02', 'web-03'] },
    { id: 'm2', title: 'Web Workers', lessons: ['web-04'] },
    { id: 'm3', title: 'Service Workers, PWA e tempo real', lessons: ['web-05', 'web-06', 'web-07'] }
  ],
  materials: [REF.mdnEvents, REF.mdnWebStorage, REF.mdnIdb, REF.mdnCache, REF2.mdnUsingWorkers, REF2.mdnUsingSw, REF3.mdnInstallable, REF3.mdnSse].map((r) => ({ ...r })),
  projectIds: ['pwa-notas-offline'],
  supplement: {
    glossary,
    cheatsheet: R`### Eventos
Captura (raiz → alvo) → alvo → bolha (alvo → raiz) · §target§ = origem, §currentTarget§ = ouvinte atual · delegação: §e.target.closest(sel)§ · §preventDefault§ ≠ §stopPropagation§ · §{ once, passive, signal }§ · filas: microtarefas → tarefas → rAF · §textContent§, não §innerHTML§ com dados do usuário

### Armazenamento
§localStorage§ (persistente, strings, ~5 M caracteres no Chrome) · §sessionStorage§ (aba) · cookies: §HttpOnly§ §Secure§ §SameSite§ (HttpOnly só pelo servidor) · IndexedDB: schema só em §onupgradeneeded§, transação encerra sem pedidos pendentes (não aguarde rede dentro dela) · Cache API: §put§/§match§/§delete§, corpo de §Response§ lido uma vez (§clone§) · §navigator.storage.estimate()§ e §persist()§ · servidor é a fonte da verdade

### Workers
§postMessage§ copia (clonagem estruturada: sem funções/DOM) ou transfere (§[buffer]§) · sem §document§/§window§/§localStorage§ · com §fetch§, §indexedDB§, §crypto§ · pedidos com id + timeout · termine (§terminate§) o que não usar

### Service Worker
HTTPS ou localhost · registro → install (pré-cache) → waiting → activate (limpeza + §claim§) · §skipWaiting§ · §respondWith§ · cache-first (arquivos com hash), network-first (dados; trate §!res.ok§), stale-while-revalidate (tolera atraso) · versione caches · §sw.js§ sem cache agressivo

### PWA
Manifesto: §name§, §icons§ 192 e 512, §start_url§, §display: standalone§ · SW não é requisito de instalação · casca + dados · fila de operações com id único (idempotência) · §navigator.onLine§ é só dica

### Tempo real
Polling < long polling < SSE (servidor→cliente, reconecta, §Last-Event-ID§) < WebSocket (bidirecional, sem reconexão automática) · §wss://§, validar §Origin§, limitar tamanho/taxa · backoff exponencial + jitter · heartbeat`,
    mistakes: ['Registrar um ouvinte por item em listas dinâmicas em vez de usar delegação.', 'Guardar objetos em localStorage sem JSON e segredos em localStorage.', 'Usar await de rede dentro de uma transação do IndexedDB.', 'Ler duas vezes o corpo de uma Response sem clonar.', 'Achar que fetch rejeita em respostas HTTP de erro.', 'Colocar sw.js ou o HTML em cache-first sem versão e prender usuários em versões antigas.', 'Enviar funções por postMessage e usar um buffer depois de transferi-lo.', 'Esperar que o WebSocket reconecte sozinho ou aceitar conexões sem validar Origin.'],
    prereqMap: R`**Antes deste curso:** JavaScript (curso JavaScript: fundamentos, DOM e módulos), HTML e CSS, e noções de HTTP (curso Redes e HTTP). Para os exemplos de Service Worker e PWA é preciso HTTPS ou localhost.

| Este curso prepara para | Por quê |
|---|---|
| React e Next.js | eventos, ciclo de renderização, armazenamento e PWA aparecem nos frameworks |
| Performance de frontend | Workers, cache, tarefas longas e Core Web Vitals |
| Segurança web (OWASP) | XSS, CSRF, armazenamento de tokens, WebSocket e Origin |
| APIs REST, GraphQL e WebSockets | cliente de tempo real e estratégias de cache |
| Aplicativos móveis | PWA como alternativa e conceitos offline-first |

Ordem interna: aulas 1 a 3 (DOM, Storage, IndexedDB e Cache) → 4 (Workers) → 5 a 7 (Service Worker, PWA e tempo real).`,
    officialRefs: [REF.htmlSpec, REF.domSpec, REF.mdnEvents, REF.mdnWebStorage, REF.mdnCookies, REF.mdnQuotas, REF.mdnIdb, REF.mdnUsingIdb, REF.mdnCache, REF2.mdnUsingWorkers, REF2.mdnClone, REF2.mdnSw, REF2.w3cSw, REF2.webdevLifecycle, REF3.mdnManifest, REF3.mdnInstallable, REF3.rfc6455, REF3.htmlSse, REF3.mdnWebSockets, REF3.mdnSse],
    practice: ['Implemente uma lista dinâmica com um único ouvinte delegado e meça quantos ouvintes existem com milhares de itens.', 'Salve preferências com localStorage e JSON, trate valor ausente, JSON inválido e cota.', 'Crie um banco IndexedDB com um índice, depois suba a versão e migre os dados.', 'Reproduza o TransactionInactiveError e corrija mudando a ordem do fetch.', 'Mova um cálculo pesado para um Worker e meça o maior atraso de timer antes e depois.', 'Escreva um Service Worker com as três estratégias e teste no painel Application com a rede em Offline.', 'Valide o manifesto no painel Application e instale o app.', 'Faça o projeto integrador: o PWA de notas offline-first com sincronização.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
