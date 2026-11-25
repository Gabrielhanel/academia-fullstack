// Curso 4 da Onda 1: JavaScript — fundamentos, DOM e módulos.
import { makeCourse } from './_lib.mjs';
import { REF, lessonsA } from './js-a.mjs';
import { lessonsB } from './js-b.mjs';
import { exsets, assessment, project } from './js-ex.mjs';

// Nos exemplos em String.raw, "DOLAR{" marca uma interpolação de template literal.
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Callback', def: 'Função passada como argumento para ser chamada depois, por exemplo quando um evento acontece.' },
  { term: 'Reducer', def: 'Função pura que recebe o estado e uma ação e devolve o próximo estado.' },
  { term: 'Stack trace', def: 'Lista das chamadas ativas no momento de um erro, usada para localizar a origem.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'javascript-fundamentos', disciplineId: 'js', disciplineIds: [], areaId: 'front', requires: ['logica-algoritmos', 'html-css-a11y'],
  title: 'JavaScript: fundamentos, DOM e módulos',
  description: 'A linguagem da web do zero ao código organizado: tipos e coerção, funções, arrays e objetos, closures e this, erros, assincronia (event loop, Promises, async/await, fetch), DOM e eventos com segurança contra XSS, e módulos ES com testes. Todos os desafios rodam em um ambiente isolado e são corrigidos por testes automáticos.',
  objectives: ['Prever o resultado de expressões com tipos, coerção e igualdade', 'Escrever funções claras, com parâmetros padrão, rest e escopo correto', 'Transformar dados com map, filter e reduce de forma imutável', 'Usar closures, this e classes, e tratar erros adequadamente', 'Escrever código assíncrono correto com Promises, async/await e fetch', 'Manipular o DOM e tratar eventos com delegação, sem abrir brechas de XSS', 'Organizar o código em módulos ES testáveis'],
  level: 'I', prereqs: ['Lógica de programação (variáveis, condicionais, laços e funções)', 'HTML e CSS básicos para as aulas de DOM'], hours: 30,
  syllabus: 'Valores, tipos, variáveis e operadores; controle de fluxo e funções; arrays, objetos, métodos funcionais e JSON; closures, this, classes e tratamento de erros; event loop, Promises, async/await e fetch; DOM, eventos, delegação e XSS; módulos ES, npm, organização e primeiros testes.',
  versions: 'JavaScript moderno (ECMAScript 2020 ou superior, com recursos como ?? e ?.; alguns métodos citados, como toSorted, exigem versões mais recentes). Conteúdo conforme a MDN. Os desafios rodam em um Web Worker da Academia, sem acesso ao DOM; os exemplos de DOM são para executar no navegador.',
  skills: ['Tipos e coerção', 'Funções e escopo', 'Manipulação de dados', 'Closures', 'this e classes', 'Tratamento de erros', 'Programação assíncrona', 'DOM e eventos', 'Segurança contra XSS', 'Módulos e testes'],
  modules: [
    { id: 'm1', title: 'Fundamentos da linguagem', lessons: ['js-01', 'js-02', 'js-03'] },
    { id: 'm2', title: 'Funções avançadas e assincronia', lessons: ['js-04', 'js-05'] },
    { id: 'm3', title: 'Navegador e organização', lessons: ['js-06', 'js-07'] }
  ],
  materials: [REF.scripting, REF.closures, REF.promises, REF.dom, REF.modules],
  projectIds: ['mini-store'],
  supplement: {
    glossary,
    cheatsheet: `### Tipos e comparação
| Expressão | Resultado |
|---|---|
| §"5" + 3§ | §"53"§ |
| §"5" - 3§ | §2§ |
| §0 || 10§ / §0 ?? 10§ | §10§ / §0§ |
| §typeof null§ / §typeof []§ | §"object"§ / §"object"§ |
| §NaN === NaN§ | §false§ (use §Number.isNaN§) |
Use §===§, §const§ por padrão e §let§ quando reatribuir.

### Arrays
§map§ transforma · §filter§ seleciona · §reduce(fn, inicial)§ acumula · §find§/§some§/§every§ consultam · §[...l].sort((a, b) => a - b)§ ordena números sem alterar o original · §[...new Set(l)]§ remove duplicatas.

### Objetos
§{ ...obj, campo: novo }§ (cópia rasa) · §structuredClone(obj)§ (profunda) · §Object.entries§/§fromEntries§ · §obj?.a?.b§.

### Funções
§(a, b = 1, ...resto) => {}§ · closures guardam estado · arrows não têm this próprio · §fn.bind(obj)§ fixa o this.

### Assíncrono
Ordem: síncrono → microtarefas (Promises) → tarefas (timers).
§try { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return await r.json(); } catch (e) { ... }§
Paralelo: §await Promise.all([...])§ · série: §for (const x of l) await f(x)§ · nunca §await§ dentro de §forEach§.

### DOM
§querySelector§ · §textContent§ (seguro) · §classList.toggle§ · §createElement§ + §append§ · §addEventListener('submit', e => e.preventDefault())§ · delegação: §pai.addEventListener('click', e => e.target.closest('li'))§.

### Módulos
§export const x§ / §export default f§ · §import f, { x } from './m.js'§ · §await import('./m.js')§ · §<script type="module">§.`,
    mistakes: ['Usar == e se surpreender com a coerção.', 'Usar || para valor padrão e perder um 0 legítimo.', 'sort() em números sem comparador.', 'Achar que o spread faz cópia profunda.', 'Esquecer o return (ou o valor inicial do reduce).', 'Usar var em laços com callbacks.', 'Perder o this ao passar um método como callback.', 'Engolir erros com catch vazio.', 'Achar que fetch rejeita em 404.', 'await dentro de forEach.', 'innerHTML com dados de fora (XSS).', 'Caminhos de módulo sem ./ e sem extensão no navegador.'],
    prereqMap: `**Antes deste curso:** Lógica e algoritmos (variáveis, laços, funções, estruturas de dados) e HTML, CSS e acessibilidade (para as aulas de DOM e eventos). O sistema avisa quando esses cursos ainda não foram concluídos, mas não bloqueia o acesso.

| Este curso prepara para | Por quê |
|---|---|
| TypeScript | TypeScript é JavaScript com tipos: tudo daqui continua valendo |
| React e Next.js | componentes são funções, o estado é imutável e os eventos usam delegação |
| Node.js e APIs | módulos, assincronia e tratamento de erros são a base do back-end |
| Testes automatizados | funções puras e módulos são o que torna o código testável |

Ordem interna: aulas 1 a 3 (linguagem) → 4 e 5 (funções avançadas e assincronia) → 6 e 7 (navegador e organização).`,
    officialRefs: [REF.scripting, REF.equality, REF.closures, REF.promises, REF.eventLoop, REF.dom, REF.events, REF.modules],
    practice: ['Abra o console do navegador e teste as expressões da tabela de coerção antes de olhar as respostas.', 'Refaça três laços de um projeto seu usando map, filter e reduce, e compare a legibilidade.', 'Escreva uma pequena página que busca dados de uma API pública com fetch, trata erros e mostra um estado de carregamento.', 'Construa uma lista de tarefas com delegação de eventos e sem innerHTML.', 'Divida um script seu em pelo menos três módulos e escreva testes com node --test para a parte pura.', 'No projeto Mini-store, ligue o store a uma interface real e persista o estado no localStorage.']
  }
};

export const JS = makeCourse({ course, lessons, exsets, assessment, project });
