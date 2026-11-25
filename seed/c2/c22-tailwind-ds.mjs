// Curso C2.2 da C2: Tailwind CSS e Design Systems (disciplina: tailwind).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c22-a.mjs';
import { REF2, lessonsB } from './c22-b.mjs';
import { REF3, lessonsC } from './c22-c.mjs';
import { exsetsA } from './c22-ex-a.mjs';
import { exsetsB, assessment, project } from './c22-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Utilitários e responsividade', 'Configuração e temas', 'Componentização com Tailwind', 'Design tokens', 'Construção de um Design System', 'Documentação com Storybook', 'Governança de Design System'];
export const COVER = {
  'Utilitários e responsividade': ['tdw-01', 'tdw-02'],
  'Configuração e temas': ['tdw-03'],
  'Componentização com Tailwind': ['tdw-04'],
  'Design tokens': ['tdw-05'],
  'Construção de um Design System': ['tdw-06', 'tdw-07'],
  'Documentação com Storybook': ['tdw-08'],
  'Governança de Design System': ['tdw-09']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'CSS-first', def: 'Abordagem do Tailwind v4 em que a configuração fica no próprio CSS (@theme, @source, @utility).' },
  { term: 'Biblioteca de componentes', def: 'Pacote versionado de componentes reutilizáveis distribuído a várias aplicações.' },
  { term: 'Tema', def: 'Conjunto de valores de tokens semânticos aplicado a toda a interface (claro, escuro, marca).' },
  { term: 'Regressão visual', def: 'Mudança indesejada de aparência detectada por comparação de capturas.' },
  { term: 'Superfície pública (API)', def: 'Conjunto de caminhos, componentes e props que os consumidores podem usar e que a versão deve proteger.' },
  { term: 'Mudança incompatível (breaking change)', def: 'Alteração que obriga o consumidor a modificar seu código; exige um major.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'tailwind-design-systems', disciplineId: 'tailwind', areaId: 'front', requires: ['html-css-a11y'],
  title: 'Tailwind CSS e Design Systems: utilitários, tokens, componentes, Storybook e governança',
  description: 'Do utility-first ao design system: estilização com Tailwind CSS 4 (utilitários, estados, responsividade, container queries e modo escuro), configuração CSS-first com @theme, componentização com cva, clsx e tailwind-merge, design tokens em camadas no formato DTCG com Style Dictionary, fundamentos de um design system (API de componentes, acessibilidade com axe-core e primitivos headless), empacotamento com exports e SemVer, documentação com Storybook e governança (contribuição, RFCs, depreciação e métricas). Os exemplos foram executados (Tailwind 4.3.5, Style Dictionary 5.8, axe-core 4.14, esbuild 0.28, React 19.3) e os desafios do laboratório verificam a lógica pura (utilitários, resolução responsiva, tema, cn, tokens, contraste, acessibilidade, exports, combinações e SemVer).',
  objectives: ['Estilizar com utilitários, estados e responsividade mobile-first, e entender o CSS que o Tailwind gera', 'Configurar temas no Tailwind v4 (@theme, @theme inline, @utility, @source) e depurar a detecção de classes', 'Criar componentes com variantes tipadas (cva), resolver conflitos (tailwind-merge) e preservar a acessibilidade', 'Modelar design tokens em camadas, gerar variáveis CSS e implementar temas e verificação de contraste', 'Projetar a API e a acessibilidade de componentes de um design system e decidir entre construir e adotar', 'Empacotar, versionar e documentar uma biblioteca de componentes e definir governança, depreciação e métricas'],
  level: 'M', prereqs: ['HTML, CSS e noções de acessibilidade', 'React essencial (curso C2.1), a partir da aula 4', 'JavaScript e TypeScript básicos; Node.js 22 ou superior e npm para executar os exemplos'], hours: 34,
  syllabus: 'Utility-first, estados e variantes; layout, responsividade, container queries e modo escuro; Tailwind v4 (@theme, @theme inline, @utility, @source); componentização (cva, clsx, tailwind-merge); design tokens (primitivos, semânticos, DTCG, Style Dictionary) e temas; fundamentos de design system, acessibilidade e headless; empacotamento (exports, peerDependencies, sideEffects, SemVer); Storybook (CSF, autodocs, play, composeStories); governança (modelos de equipe, RFC, depreciação, métricas, handoff).',
  versions: 'Tailwind CSS 4.3.5 (@tailwindcss/cli), class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.7.1, Style Dictionary 5.8.0, axe-core 4.14.1, @storybook/react 10.6.8, React 19.3.1, Vitest 5.1.1, jsdom 31.0.1, esbuild 0.28.2 e Node.js 26, verificados em 2026-11-18. Os exemplos de Vite, de Storybook (interface web) e de publicação em registro npm seguem a documentação oficial e não foram executados aqui; as stories foram executadas com composeStories em jsdom. O formato DTCG está em rascunho e ferramentas diferem na implementação; recursos e nomes do Tailwind e do Storybook mudam entre versões.',
  skills: ['Tailwind CSS', 'Responsividade e container queries', 'Configuração e temas (v4)', 'Componentes com variantes', 'Design tokens', 'Acessibilidade de componentes', 'Empacotamento e versionamento', 'Storybook e documentação', 'Governança de design system'],
  modules: [
    { id: 'm1', title: 'Utility-first', lessons: ['tdw-01', 'tdw-02', 'tdw-03'] },
    { id: 'm2', title: 'Componentes e tokens', lessons: ['tdw-04', 'tdw-05'] },
    { id: 'm3', title: 'Design system', lessons: ['tdw-06', 'tdw-07', 'tdw-08', 'tdw-09'] }
  ],
  materials: [REF.utility, REF.theme, REF2.cva, REF2.dtcg, REF2.apgPatterns, REF3.storybookDocs, REF3.nodePackages].map((r) => ({ ...r })),
  projectIds: ['mini-design-system'],
  supplement: {
    glossary,
    cheatsheet: R`### Utility-first
Classes de uma responsabilidade; escala de design; variantes: §hover:§ §focus-visible:§ §disabled:§ §md:§ §dark:§ §group-hover:§ §aria-*:§ §data-[...]:§ · nome completo no código (nada de §bg-DOLAR{cor}-500§) · §focus-visible§ e §motion-safe§ · hover só com §@media (hover: hover)§

### Responsivo
Mobile-first: §sm 40rem · md 48rem · lg 64rem · xl 80rem · 2xl 96rem§ · §sm:max-md:§ intervalo · §--breakpoint-3xl§ no tema · flex (1 dimensão), grid (áreas), §minmax(0,1fr)§, §min-w-0§ · container: §@container§ + §@md:§ · §min-h-dvh§ · dark: §@custom-variant dark (&:where(.dark, .dark *))§

### Tailwind v4 (CSS-first)
§@import "tailwindcss"§ · §@theme§ (namespaces §--color-*§ §--font-*§ §--breakpoint-*§ §--spacing§) · §@theme inline§ (valor dinâmico) · §@utility§ (aceita variantes) · §@layer components§ (sem variantes) · §@source§ / §@source not§ / §@source inline()§ · só variáveis usadas são emitidas

### Componentes
§cn = twMerge(clsx(...))§ · último vence no grupo; variantes diferentes não conflitam · §cva§: base, variants, compoundVariants, defaultVariants · §VariantProps§ · §ComponentProps<'button'>§ · className por último · §@apply§ só para HTML que você não controla

### Tokens
Primitivo → semântico → componente · componentes usam semânticos · DTCG: §$value§ §$type§ §{referência}§ · Style Dictionary §css/variables§ + §outputReferences§ · tema = redefinir semânticos · contraste AA 4,5:1 (texto grande e UI 3:1)

### Design system
Design + código + documentação/governança · poucas decisões irreversíveis · composição · controlado e não controlado · elemento nativo, teclado, foco, nome e estado · axe ≠ garantia · headless: Radix, React Aria · começar por Button, Field, Select, Dialog, Tabs, Toast

### Pacote e versões
§exports§ (superfície pública; ERR_PACKAGE_PATH_NOT_EXPORTED) · §files§ + §npm pack --dry-run§ · React em §peerDependencies§ · ESM por componente + tipos · §sideEffects§ (incluir CSS) · SemVer: remover/renomear/mudar comportamento = major · depreciar antes · Changesets

### Storybook e governança
CSF 3: meta (§title§ §component§ §args§ §argTypes§ §tags: autodocs§) + stories · §play§ · §composeStories§ · addon de a11y · testes visuais · governança: modelo híbrido, dono, proposta com 2 produtos, RFC, definição de pronto, depreciação com prazo, métricas (adoção, desvios, a11y, satisfação)`,
    mistakes: ['Montar nomes de classes do Tailwind dinamicamente.', 'Concatenar classes sem resolver conflitos e depender da ordem do CSS.', 'Usar cores primitivas ou literais nos componentes e inviabilizar temas.', 'Reimplementar diálogos e menus sem teclado, foco e ARIA testados.', 'Pôr o React em dependencies de uma biblioteca e expor arquivos internos sem exports.', 'Remover ou renomear sem depreciar e lançar como minor.', 'Documentar só o caminho feliz e confiar apenas em verificações automáticas de acessibilidade.', 'Aceitar qualquer pedido de componente, sem dono, processo nem métricas.'],
    prereqMap: R`**Antes deste curso:** HTML, CSS e acessibilidade (curso HTML, CSS e acessibilidade). A partir da aula 4 é necessário o curso React essencial (componentes, props, hooks e Context). Recomendado: Ferramentas do desenvolvedor (depuração e ESLint).

| Este curso prepara para | Por quê |
|---|---|
| React avançado | composição, componentes compostos e componentes headless |
| Next.js | estilização e componentes de interface em aplicações completas |
| Testes de frontend | testes de componentes, de acessibilidade e de interação |
| Arquitetura frontend | pacotes de componentes em monorepos e versionamento |
| Performance frontend | CSS gerado, tree-shaking e tamanho de pacote |

Ordem interna: aulas 1 a 3 (utility-first, responsividade e configuração) → 4 e 5 (componentes e tokens) → 6 a 9 (design system, pacote, Storybook e governança).`,
    officialRefs: [REF.utility, REF.states, REF.responsive, REF.dark, REF.theme, REF.custom, REF.detecting, REF.vite, REF.upgrade, REF.functions, REF.mdnContainer, REF.mdnLayer, REF2.reuse, REF2.cva, REF2.twMerge, REF2.clsx, REF2.dtcg, REF2.styleDictionary, REF2.wcag, REF2.apgPatterns, REF2.axeCore, REF2.radix, REF2.reactAria, REF3.nodePackages, REF3.npmPackageJson, REF3.semver, REF3.changesets, REF3.storybookDocs, REF3.csf, REF3.interaction, REF3.a11yAddon],
    practice: ['Compile um CSS de entrada do Tailwind v4 e leia o CSS gerado para cinco classes diferentes.', 'Reproduza o problema de classes dinâmicas e corrija com um mapa de variantes.', 'Monte um layout responsivo com grid e um cartão que use container queries.', 'Crie um Button com cva, cn e testes de teclado e axe.', 'Defina tokens primitivos e semânticos em JSON (DTCG), gere as variáveis com o Style Dictionary e crie o tema escuro.', 'Escreva um teste que calcula o contraste dos pares de tokens nos dois temas.', 'Monte um pacote com exports e confira o resultado de npm pack --dry-run e do tree-shaking.', 'Faça o projeto integrador: o mini design system publicável.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
