// Curso C1.3 da C1: Ferramentas do desenvolvedor e expressões regulares (disciplinas: devtools + regex).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c13-a.mjs';
import { REF2, lessonsB } from './c13-b.mjs';
import { REF3, lessonsC } from './c13-c.mjs';
import { exsets, assessment, project } from './c13-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Editor, terminal e atalhos', 'Depuração no navegador', 'Depuração no Node.js', 'Linters e formatadores (ESLint, Prettier)', 'Automação com scripts e hooks de Git', 'Literais, classes e quantificadores', 'Grupos, âncoras e lookarounds', 'Performance e backtracking catastrófico'];
export const COVER = {
  'Editor, terminal e atalhos': ['fer-01'],
  'Depuração no navegador': ['fer-02'],
  'Depuração no Node.js': ['fer-03'],
  'Linters e formatadores (ESLint, Prettier)': ['fer-04'],
  'Automação com scripts e hooks de Git': ['fer-05'],
  'Literais, classes e quantificadores': ['fer-06'],
  'Grupos, âncoras e lookarounds': ['fer-07'],
  'Performance e backtracking catastrófico': ['fer-08']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Depurador', def: 'Ferramenta que pausa a execução e permite inspecionar variáveis, pilha e fluxo.' },
  { term: 'Análise estática', def: 'Análise do código sem executá-lo (linters, verificadores de tipos).' },
  { term: 'CI (integração contínua)', def: 'Execução automática de verificações e testes a cada mudança no repositório.' },
  { term: 'devDependency', def: 'Dependência usada só em desenvolvimento (linters, formatadores, testes), não em produção.' },
  { term: 'package-lock.json', def: 'Arquivo que fixa as versões exatas instaladas; usado por npm ci para instalações reproduzíveis.' },
  { term: 'Expressão regular', def: 'Padrão que descreve conjuntos de textos, usado para validar, buscar e transformar.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'ferramentas-regex', disciplineId: 'devtools', disciplineIds: ['regex'], areaId: 'eng', requires: ['javascript-fundamentos', 'git-github'],
  title: 'Ferramentas do desenvolvedor e expressões regulares',
  description: 'O curso que aumenta a produtividade de todos os outros: dominar editor e terminal, depurar no navegador e no Node.js com método, padronizar o código com ESLint e Prettier, automatizar verificações com scripts npm e hooks de Git, e escrever expressões regulares claras, corretas e seguras (grupos, lookarounds e prevenção de ReDoS). Os exemplos foram executados com Node.js 26, ESLint 10 e Prettier 3.',
  objectives: ['Usar o editor e o terminal de forma eficiente (navegação, refatoração, atalhos, aliases e dotfiles)', 'Depurar JavaScript no navegador e no Node.js com breakpoints, pilha e inspeção', 'Configurar ESLint e Prettier e integrá-los ao editor, a scripts e ao CI', 'Criar scripts npm e hooks de Git versionados e rápidos', 'Escrever e ler expressões regulares com classes, quantificadores, grupos, âncoras e lookarounds', 'Reconhecer e evitar backtracking catastrófico e limitar o risco de ReDoS'],
  level: 'I', prereqs: ['JavaScript básico (funções, arrays, objetos e módulos)', 'Git básico (commit, branch)', 'Node.js e npm instalados (Node.js 22 ou superior)'], hours: 24,
  syllabus: 'Editor, LSP, EditorConfig, terminal, aliases e dotfiles; DevTools (Elements, Console, Sources, Network); inspector do Node.js, VS Code, --watch, source maps e tratamento de erros; ESLint (configuração plana) e Prettier; scripts npm e hooks de Git (core.hooksPath, lint-staged); regex em JavaScript: classes, quantificadores, flags, grupos nomeados, retrovisores, âncoras, lookarounds; backtracking, ReDoS e boas práticas.',
  versions: 'Node.js 26 (os recursos usados existem desde o Node.js 22 LTS), ESLint 10.15 (configuração plana), @eslint/js 10, Prettier 3.10, npm 11, Git 2.x, Chrome DevTools e VS Code atuais em 2026-11-18. Regex conforme ECMAScript (grupos nomeados, lookbehind, flag u e propriedades Unicode são suportados nos navegadores e no Node.js atuais). Interfaces e atalhos de editores e navegadores mudam: consulte a documentação oficial.',
  skills: ['Produtividade com editor e terminal', 'Depuração no navegador', 'Depuração no Node.js', 'Lint e formatação', 'Scripts e hooks', 'Expressões regulares', 'Segurança de regex (ReDoS)'],
  modules: [
    { id: 'm1', title: 'Editor, terminal e depuração', lessons: ['fer-01', 'fer-02', 'fer-03'] },
    { id: 'm2', title: 'Qualidade automatizada', lessons: ['fer-04', 'fer-05'] },
    { id: 'm3', title: 'Expressões regulares', lessons: ['fer-06', 'fer-07', 'fer-08'] }
  ],
  materials: [REF.vscodeTips, REF.devtools, REF.nodeDebug, REF2.eslintDocs, REF2.prettierDocs, REF3.mdnRegexGuide].map((r) => ({ ...r })),
  projectIds: ['toolkit-qualidade-e-logs'],
  supplement: {
    glossary,
    cheatsheet: R`### Editor
Paleta de comandos §Ctrl+Shift+P§ · abrir arquivo §Ctrl+P§ · buscar no projeto §Ctrl+Shift+F§ · ir para definição §F12§ · renomear símbolo §F2§ · próxima ocorrência §Ctrl+D§ · terminal §Ctrl+§§ (crase)

### Terminal
§Ctrl+R§ histórico · §Ctrl+A§/§Ctrl+E§ início/fim · §Ctrl+W§ apaga palavra · §!!§ último comando · §cd -§ · aliases e funções em §~/.bashrc§ · sem segredos na linha de comando

### DevTools
Elements (DOM e CSS vivos) · Console (§table§, §time§, §assert§, §trace§) · Sources (breakpoint de linha, condicional, logpoint, pausar em exceções; step over/into/out) · Network (status, cabeçalhos, tempos, Copy as cURL) · Application (storage)

### Node.js
§node --inspect§ (9229) · §--inspect-brk§ (pausa no início) · §chrome://inspect§ · VS Code launch/attach · §--watch§ · §--enable-source-maps§ · §--stack-trace-limit§ · inspector só em §127.0.0.1§ · §unhandledRejection§ encerra por padrão

### ESLint e Prettier
§npx eslint .§ · §--fix§ · §--max-warnings 0§ · severidades §off§/§warn§/§error§ · §eslint.config.js§ (array, §ignores§, §files§) · §npx prettier --check .§ / §--write .§ · formatação em massa em commit separado + §.git-blame-ignore-revs§

### Scripts e hooks
§"scripts"§ no package.json · §npm run x -- --opção§ · §git config core.hooksPath .githooks§ · pre-commit rápido (só staging) · CI repete tudo · §--no-verify§ pula o hook

### Regex (JavaScript)
§. \d \w \s \b \p{L}§ (com §u§) · §* + ? {n,m}§ e preguiçosos §*? +?§ · §[^...]§ · §^ $§ · §(?:...)§ §(?<nome>...)§ §\1§ · §(?=)§ §(?!)§ §(?<=)§ §(?<!)§ · flags §g i m s u y d§ · §test§ valida, §matchAll§ extrai, §replace§ transforma · regex com §g§ guarda §lastIndex§

### Regex segura
Sem quantificadores aninhados (§(a+)+§) nem alternâncias sobrepostas · limite o tamanho da entrada · teste com entradas adversárias · motor linear (RE2) ou worker com timeout · parser para HTML/JSON · escape texto do usuário`,
    mistakes: ['Usar busca e substituição textual para renomear identificadores.', 'Corrigir o sintoma de um erro em vez da origem do valor.', 'Expor o inspector do Node.js na rede.', 'Desligar o linter inteiro para passar no CI.', 'Confiar apenas no hook local e não ter CI.', 'Esquecer âncoras e validar entradas parciais.', 'Reutilizar regex com flag g em test() e obter resultados alternados.', 'Escrever quantificadores aninhados e aceitar entradas sem limite de tamanho.'],
    prereqMap: R`**Antes deste curso:** JavaScript básico (curso JavaScript: fundamentos, DOM e módulos) e Git (curso Git e GitHub na prática). Node.js e npm instalados.

| Este curso prepara para | Por quê |
|---|---|
| Testes de frontend e de backend | scripts, hooks e depuração fazem parte do fluxo de testes |
| CI/CD e GitHub Actions | o comando único de verificação roda no pipeline |
| Qualidade e manutenção de software | lint, formatação e revisão automática |
| Segurança (OWASP) | ReDoS, segredos no histórico e superfícies de depuração |
| Logs e observabilidade | regex e parsing de logs, depuração em produção |

Ordem interna: aulas 1 a 3 (editor, terminal e depuração) → 4 e 5 (lint, formatação, scripts e hooks) → 6 a 8 (regex: base, estrutura e segurança).`,
    officialRefs: [REF.vscodeTips, REF.editorconfig, REF.lsp, REF.devtools, REF.devtoolsJs, REF.nodeDebug, REF.nodeCli, REF2.eslintConfig, REF2.prettierDocs, REF2.npmScripts, REF2.gitHooks, REF3.mdnRegexGuide, REF3.mdnRegexRef, REF3.mdnAssertions, REF3.owaspRedos],
    practice: ['Renomeie um símbolo com F2 e compare com a substituição textual no mesmo código.', 'Depure uma função com erro usando breakpoint condicional e logpoint no DevTools.', 'Inicie um programa Node.js com --inspect-brk e conecte pelo VS Code e pelo chrome://inspect.', 'Configure ESLint (flat config) e Prettier em um projeto seu e rode --check e --write.', 'Crie um hook pre-commit versionado que bloqueia um commit com problema de lint.', 'Reescreva três validações suas com grupos nomeados e âncoras, com testes.', 'Meça o tempo de /^(a+)+$/ com 20 a 28 letras e do equivalente seguro.', 'Faça o projeto integrador: o toolkit de qualidade com analisador de logs.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
