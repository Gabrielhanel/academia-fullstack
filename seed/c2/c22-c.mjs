// C2.2 — Tailwind CSS e Design Systems. Aulas 7 a 9 (empacotamento, Storybook e governança).
const R = String.raw;

export const REF3 = {
  nodePackages: { title: 'Node.js — Packages (exports, imports e campos do package.json)', url: 'https://nodejs.org/api/packages.html', kind: 'doc' },
  npmPackageJson: { title: 'npm — package.json (campos files, exports, peerDependencies)', url: 'https://docs.npmjs.com/cli/v10/configuring-npm/package-json', kind: 'doc' },
  semver: { title: 'Semantic Versioning 2.0.0', url: 'https://semver.org/lang/pt-BR/', kind: 'spec' },
  changesets: { title: 'Changesets — gerenciamento de versões e changelogs', url: 'https://github.com/changesets/changesets', kind: 'doc' },
  esbuildTree: { title: 'esbuild — Tree shaking', url: 'https://esbuild.github.io/api/#tree-shaking', kind: 'doc' },
  webpackTree: { title: 'webpack — Tree Shaking e sideEffects', url: 'https://webpack.js.org/guides/tree-shaking/', kind: 'doc' },
  storybookDocs: { title: 'Storybook — documentação', url: 'https://storybook.js.org/docs', kind: 'doc' },
  csf: { title: 'Storybook — Component Story Format (CSF)', url: 'https://storybook.js.org/docs/api/csf', kind: 'doc' },
  a11yAddon: { title: 'Storybook — addon de acessibilidade', url: 'https://storybook.js.org/docs/writing-tests/accessibility-testing', kind: 'doc' },
  interaction: { title: 'Storybook — testes de interação (play)', url: 'https://storybook.js.org/docs/writing-tests/interaction-testing', kind: 'doc' },
  autodocs: { title: 'Storybook — Autodocs', url: 'https://storybook.js.org/docs/writing-docs/autodocs', kind: 'doc' },
  designSystemGov: { title: 'Nathan Curtis — Team Models for Scaling a Design System (Medium/EightShapes)', url: 'https://medium.com/eightshapes-llc/team-models-for-scaling-a-design-system-2cf9d03be6a0', kind: 'article' },
  rfc: { title: 'Rust RFC process (exemplo de processo de RFC)', url: 'https://github.com/rust-lang/rfcs', kind: 'doc' },
  adr: { title: 'Architecture Decision Records', url: 'https://adr.github.io/', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'tdw-07', moduleId: 'm3', order: 7, minutes: 65, tags: ['empacotamento', 'exports', 'semver', 'tree-shaking', 'peerDependencies'],
  title: 'Biblioteca de componentes: empacotamento, exports, versionamento e tree-shaking',
  objectives: ['Estruturar um pacote de componentes publicável (§exports§, §files§, §peerDependencies§, tipos)', 'Controlar a superfície pública do pacote e entender os erros de caminho não exportado', 'Aplicar versionamento semântico às mudanças de um design system (patch, minor, major) e classificar mudanças incompatíveis', 'Explicar tree-shaking e o papel de §sideEffects§ e medir seu efeito', 'Distribuir tokens e CSS junto com os componentes e planejar o consumo com Tailwind'],
  intro: `Um design system só tem valor quando **outras equipes o instalam**. Isso exige um **pacote** bem montado: pontos de entrada claros, dependências corretas, tipos, CSS e versões previsíveis. Erros comuns (instalar React duas vezes, expor caminhos internos, carregar a biblioteca inteira para usar um botão, quebrar consumidores em uma versão "menor") são caros e evitáveis. Esta aula mostra, com testes **executados** (Node.js 26, npm, esbuild 0.28), como o campo §exports§ protege a superfície pública, o que o §npm pack§ publica e como o §sideEffects§ permite remover código que não é usado.`,
  theory: `### O package.json de uma biblioteca de componentes
§§§json
{
  "name": "@acme/ds", "version": "1.2.0", "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./botao": { "types": "./dist/botao/index.d.ts", "import": "./dist/botao/index.js" },
    "./tokens.css": "./dist/tokens.css",
    "./package.json": "./package.json"
  },
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" }
}
§§§
- **§exports§**: a **superfície pública**. Só os caminhos listados podem ser importados. No teste, §import { Botao } from '@acme/ds/botao'§ funcionou; já §import '@acme/ds/dist/botao/index.js'§ e §import '@acme/ds/src/interno.js'§ falharam com o erro **§ERR_PACKAGE_PATH_NOT_EXPORTED§**: o consumidor **não consegue** depender de arquivos internos, então você pode reorganizá-los sem quebrar ninguém. A resolução de §@acme/ds/tokens.css§ apontou para §dist/tokens.css§ (CSS e tokens também são exportados como caminhos);
- **§files§**: o que vai para o registro. No §npm pack --dry-run§ do teste foram **4 arquivos** (§dist/index.js§, §dist/botao/index.js§, §dist/tokens.css§, §package.json§); a pasta §src/§ **não** foi publicada. Sempre confira com §npm pack --dry-run§ antes de publicar (segredos, testes e arquivos grandes não devem ir junto);
- **§types§** dentro de cada condição (primeiro) para o TypeScript; gere §.d.ts§ com §tsc --declaration§ ou com a ferramenta de build (tsup, Vite no modo biblioteca, unbuild);
- **formato**: ESM (§type: module§) é o padrão atual; ofereça CJS só se o seu público precisar;
- **§peerDependencies§**: dependências que o **consumidor** fornece. **React** deve ser *peer*: se a biblioteca trouxesse a própria cópia, a aplicação teria **dois Reacts** (hooks quebram com "Invalid hook call"). Declare também no §devDependencies§ para desenvolver e testar;
- **§dependencies§**: apenas o que a biblioteca realmente precisa em execução (por exemplo, §clsx§ e §class-variance-authority§).

### Estrutura de código e build
Um diretório por componente (§botao/index.ts§, §botao.tsx§, §botao.test.tsx§, §botao.stories.tsx§). Um arquivo §index.ts§ reexporta. O build (tsup, Vite ou tsc) gera §dist/§ em **módulos ES** preservando a estrutura (preferível a um único arquivo grande, que atrapalha o tree-shaking). Marque as bibliotecas externas (§react§, §react-dom§) como **externas** no build.

### Tree-shaking e sideEffects
**Tree-shaking** remove do pacote final o que **não é usado**. Funciona com **ESM** e exige que o bundler saiba que um módulo **não tem efeitos colaterais** ao ser carregado. O campo **§"sideEffects": false§** diz isso. Medido com esbuild (0.28): dois pacotes idênticos, com §index.js§ reexportando §botao.js§ e §grande.js§ (este com um §console.log§ no topo); o consumidor importa só §Botao§:
- com §"sideEffects": false§ → saída §var o=()=>"botao";console.log(o());§ (**36 bytes**; o módulo grande desapareceu);
- **sem** o campo → saída com §console.log("grande carregado")§ também (**68 bytes**): o bundler **precisa manter** o módulo porque o carregamento poderia ter efeito.
Em um design system real, isto separa um pacote que pesa o **quanto você usa** de um que pesa **tudo**. Cuidados: **CSS importado** conta como efeito colateral (por isso §"sideEffects": ["**/*.css"]§); não faça trabalho no topo do módulo (registrar globais, tocar o DOM); evite **barris** (§index.ts§ enormes) em bibliotecas muito grandes: oferecer **subcaminhos** (§@acme/ds/botao§) é uma alternativa.

### Versionamento semântico (SemVer)
§MAJOR.MINOR.PATCH§: **patch** = correção compatível; **minor** = recurso novo compatível; **major** = mudança **incompatível**. Em um DS, o que é "incompatível"?
- remover ou renomear um componente, prop, variante ou token;
- mudar o **comportamento** de forma que quebre uso existente (valor padrão de uma prop, ordem do foco, HTML gerado em que testes dos consumidores confiam);
- aumentar a versão mínima do React ou do navegador;
- mudar a **API visual** de forma relevante (um redesign) pode exigir major ou um **canal** separado.
**Compatível:** nova variante opcional, nova prop opcional, correção de bug de acessibilidade (muitas vezes tratada como patch, comunicando). **Pré-lançamentos** (§2.0.0-beta.1§) permitem testar com consumidores. **Changesets** automatiza: cada PR registra o tipo de mudança e o texto do changelog; a ferramenta calcula as versões e publica. Combine com **Conventional Commits** se preferir derivação automática (curso Fluxo e agilidade).
**Depreciar antes de remover:** versão N marca como §@deprecated§ (aviso no editor e no console em desenvolvimento) e documenta a alternativa; remova só em um major futuro.

### Distribuindo estilos e Tailwind
Duas estratégias:
1. **CSS compilado no pacote** (o consumidor importa §@acme/ds/estilos.css§): simples; pode duplicar utilitários se o app também usa Tailwind;
2. **Classes Tailwind no código + o app compila** (o app aponta §@source§ para o pacote, aula 3): evita CSS duplicado e permite **tema** do app, ao custo de exigir Tailwind no consumidor.
Os **tokens** (variáveis CSS e o §@theme§ base) vão em um arquivo exportado (§tokens.css§). Deixe claro, na documentação, a versão do Tailwind suportada.

### Qualidade antes de publicar
Pipeline: lint, tipos, **testes** (render, teclado, axe), **testes das histórias** (aula 8), build, **§npm pack --dry-run§**, verificação dos **tipos exportados** (ferramentas como §publint§ e §arethetypeswrong§ detectam erros de §exports§ e de tipos), **tamanho** (limite de orçamento, ex. §size-limit§) e **publicação** com proveniência (§npm publish --provenance§ em CI). Mantenha um **CHANGELOG** legível por humanos.`,
  concepts: [
    { term: 'exports', def: 'Campo do package.json que define os caminhos públicos importáveis de um pacote.' },
    { term: 'peerDependency', def: 'Dependência que o consumidor deve fornecer, evitando duplicar bibliotecas como o React.' },
    { term: 'ERR_PACKAGE_PATH_NOT_EXPORTED', def: 'Erro do Node.js ao importar um caminho que o pacote não exporta.' },
    { term: 'Tree-shaking', def: 'Remoção, no empacotamento, do código exportado que não é usado.' },
    { term: 'sideEffects', def: 'Campo que informa ao bundler quais módulos têm efeitos ao serem carregados (false = nenhum).' },
    { term: 'SemVer', def: 'Versionamento MAJOR.MINOR.PATCH que comunica a compatibilidade das mudanças.' },
    { term: 'Depreciação', def: 'Marcar um recurso como obsoleto, com aviso e alternativa, antes de removê-lo em um major.' },
    { term: 'Changesets', def: 'Ferramenta que registra a intenção de versão de cada mudança e gera versões e changelog.' },
    { term: 'Barrel file', def: 'Arquivo index que reexporta muitos módulos e pode atrapalhar o tree-shaking.' },
    { term: 'npm pack --dry-run', def: 'Comando que lista o conteúdo que seria publicado sem criar o pacote.' }
  ],
  examples: R`**Analogia:** o campo §exports§ é a **recepção de um prédio**: o visitante só chega aos andares que a recepção libera; os corredores internos (pastas) podem ser reformados sem avisar ninguém. O §sideEffects§ é o **aviso "o escritório do 12º não faz barulho"**: se ninguém precisa dele, o prédio pode deixá-lo de fora da mudança. O SemVer é o **número da edição de um manual**: a troca do primeiro dígito diz "releia tudo".

**Resultados medidos (Node.js 26, npm, esbuild 0.28.2):**
§§§
import { versao, Botao } from '@acme/ds'            -> 1.2.0 botao
import { Botao } from '@acme/ds/botao'              -> botao
import '@acme/ds/dist/botao/index.js'               -> ERR_PACKAGE_PATH_NOT_EXPORTED
import '@acme/ds/src/interno.js'                    -> ERR_PACKAGE_PATH_NOT_EXPORTED
import.meta.resolve('@acme/ds/tokens.css')         -> .../dist/tokens.css
npm pack --dry-run -> dist/botao/index.js, dist/index.js, dist/tokens.css, package.json (4 arquivos; src/ não vai)
bundle com "sideEffects": false -> 36 bytes ; sem o campo -> 68 bytes (módulo grande mantido)
§§§

**Caso real:** uma aplicação carregava 400 KB de componentes para exibir três botões, pois o pacote era um único arquivo CommonJS sem §sideEffects§. Migrado para ESM por componente, com §exports§ e §sideEffects§, o mesmo app passou a incluir apenas o que importava. Em outro incidente, uma "correção" que mudou o valor padrão de uma prop foi lançada como patch e quebrou três aplicações: passou a ser tratada como major.`,
  code: [
    { title: 'Pacote com exports e verificação do consumo (executado com Node.js 26)', lang: 'javascript', code: R`// lib/package.json
// { "name": "@acme/ds", "version": "1.2.0", "type": "module", "sideEffects": ["**/*.css"], "files": ["dist"],
//   "exports": { ".": { "import": "./dist/index.js" }, "./botao": { "import": "./dist/botao/index.js" },
//                "./tokens.css": "./dist/tokens.css", "./package.json": "./package.json" } }

// consumo/t.mjs
import { versao, Botao } from '@acme/ds';
import { Botao as B2 } from '@acme/ds/botao';
console.log('raiz:', versao, Botao(), '| subcaminho exportado:', B2());
try { await import('@acme/ds/dist/botao/index.js'); } catch (e) { console.log('caminho profundo:', e.code); }
try { await import('@acme/ds/src/interno.js'); } catch (e) { console.log('src:', e.code); }
console.log('css resolvido:', import.meta.resolve('@acme/ds/tokens.css').endsWith('dist/tokens.css'));
// raiz: 1.2.0 botao | subcaminho exportado: botao
// caminho profundo: ERR_PACKAGE_PATH_NOT_EXPORTED
// src: ERR_PACKAGE_PATH_NOT_EXPORTED
// css resolvido: true`, notes: [{ l: '2', t: 'sideEffects lista os CSS para não serem removidos pelo tree-shaking.' }, { l: '4', t: 'Só estes caminhos são públicos.' }, { l: '10', t: 'Importar um arquivo interno é bloqueado pelo Node.js: a organização interna pode mudar.' }, { l: '12', t: 'O pacote foi ligado ao projeto de consumo por link simbólico em node_modules para o teste.' }] },
    { title: 'Medindo o tree-shaking com esbuild (executado com esbuild 0.28.2)', lang: 'bash', code: R`# lib: index.js reexporta ./botao.js e ./grande.js (este com console.log no topo)
# consumidor: import { Botao } from '@acme/dsa'; console.log(Botao());
esbuild a.mjs --bundle --minify --format=esm --outfile=a.out.js     # dsa tem "sideEffects": false
esbuild b.mjs --bundle --minify --format=esm --outfile=b.out.js     # dsb não declara o campo
cat a.out.js    # var o=()=>"botao";console.log(o());                                        (36 bytes)
cat b.out.js    # var o=()=>"botao";console.log("grande carregado");console.log(o());      (68 bytes)`, notes: [{ l: '3', t: 'Com sideEffects false, o módulo não usado inteiro é descartado.' }, { l: '4', t: 'Sem o campo, o bundler mantém o efeito do console.log por segurança.' }, { l: '1', t: 'Em projetos reais, meça com o analisador de bundle do seu empacotador.' }] }
  ],
  bestPractices: ['Exponha só o necessário em §exports§ e confira com §npm pack --dry-run§.', 'Declare React e React DOM como §peerDependencies§.', 'Publique ESM por componente, com tipos, e declare §sideEffects§ (incluindo o CSS).', 'Trate remoção, renomeação e mudança de comportamento como major e deprecie antes.', 'Automatize versões e changelog (Changesets ou Conventional Commits) e publique com proveniência.', 'Verifique o pacote com ferramentas como §publint§ e §arethetypeswrong§ e acompanhe o tamanho.'],
  mistakes: ['Colocar o React em §dependencies§ e duplicá-lo na aplicação.', 'Publicar §src/§, testes ou segredos por falta de §files§.', 'Não declarar §exports§ e deixar todos os arquivos internos virarem API.', 'Lançar mudança incompatível como minor ou patch.', 'Um barril gigante em CJS sem §sideEffects§.', 'Exigir uma configuração do consumidor sem documentá-la.'],
  market: `Empacotar e versionar bibliotecas de componentes é a rotina de equipes de plataforma e de design systems, e erros de §exports§, de dependências *peer* e de SemVer estão entre as causas mais comuns de quebra em consumidores. Conhecer essas práticas é requisito para quem mantém monorepos de pacotes (curso de arquitetura frontend).`,
  summary: `Um pacote de DS define sua superfície pública em §exports§, publica só o necessário (§files§), declara React como peer, oferece tipos e ESM por componente. §sideEffects: false§ permite remover módulos não usados (medido: 36 contra 68 bytes). Use SemVer com rigor (remover, renomear ou mudar comportamento é major), deprecie antes de remover, automatize versões e changelog e valide o pacote antes de publicar.`,
  refs: [REF3.nodePackages, REF3.npmPackageJson, REF3.semver, REF3.changesets, REF3.esbuildTree],
  cards: [
    { q: 'O que o campo exports controla?', a: 'A superfície pública do pacote: só os caminhos listados podem ser importados; os demais geram ERR_PACKAGE_PATH_NOT_EXPORTED.' },
    { q: 'Por que o React deve ser peerDependency de uma biblioteca de componentes?', a: 'Para a aplicação e a biblioteca compartilharem uma única cópia; duas cópias quebram os hooks.' },
    { q: 'O que o sideEffects: false permite?', a: 'Que o bundler remova módulos exportados e não usados, mesmo que tenham código no topo do arquivo.' },
    { q: 'Remover uma prop de um componente publicado é patch, minor ou major?', a: 'Major: é mudança incompatível; o ideal é depreciar antes e remover em um major futuro.' }
  ]
},
{
  id: 'tdw-08', moduleId: 'm3', order: 8, minutes: 65, tags: ['Storybook', 'CSF', 'documentação', 'testes de interação', 'acessibilidade'],
  title: 'Documentação com Storybook: stories, controls, docs, acessibilidade e testes de interação',
  objectives: ['Escrever stories no formato CSF 3 (meta, args, argTypes, tags) para os estados de um componente', 'Usar controls, autodocs e MDX para documentar APIs e orientações de uso', 'Escrever testes de interação com a função §play§ e reaproveitar stories em testes com §composeStories§', 'Habilitar verificações de acessibilidade e de regressão visual no fluxo do Storybook', 'Organizar a documentação de um design system (hierarquia, exemplos, usos corretos e incorretos)'],
  intro: `Um design system sem documentação é uma biblioteca que ninguém sabe usar. O **Storybook** é a ferramenta mais usada para **desenvolver, documentar e testar componentes isolados**: cada **story** é um estado do componente (padrão, desabilitado, erro, carregando), exibido em uma oficina interativa com **controles**, **documentação gerada** e **verificações**. As stories também são **código executável**, reaproveitável em testes. Esta aula usa **Storybook 10.6** (pacote §@storybook/react§) e **executa as stories** em testes com §composeStories§ e §play§. **Não executamos** a interface web do Storybook (não houve build do app do Storybook neste ambiente); os trechos de configuração seguem a documentação oficial.`,
  theory: `### Stories e o formato CSF
**CSF (Component Story Format)** é um módulo ES: o **export default** descreve o componente (**meta**) e cada **export nomeado** é uma **story**:
§§§tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Botao } from './botao';

const meta = {
  title: 'DS/Botao', component: Botao, tags: ['autodocs'],
  args: { rotulo: 'Salvar', onClick: fn() },
  argTypes: { perigo: { control: 'boolean' } }
} satisfies Meta<typeof Botao>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = {};
export const Perigo: Story = { args: { perigo: true, rotulo: 'Excluir' } };
§§§
- **§title§**: posição na barra lateral (hierarquia com §/§); pode ser inferido do caminho;
- **§args§**: os valores das props; os da **meta** valem para todas as stories e cada story os sobrescreve. §fn()§ cria uma função espiã que registra chamadas;
- **§argTypes§** descrevem como a prop aparece nos **controles** (boolean, select, color, range...); em TypeScript, muita coisa é inferida do tipo;
- **§tags: ['autodocs']§** gera uma **página de documentação** (tabela de props, descrição e todas as stories);
- **§satisfies Meta§/§StoryObj§** dão tipagem forte às props.
No teste, as stories §Primario§ e §Perigo§ renderizaram §<button class="primario">Salvar</button>§ e §<button class="perigo">Excluir</button>§, e os args padrão da meta eram §rotulo§ e §onClick§.

### Quais stories escrever
Uma story por **estado relevante**: padrão, cada variante, tamanhos, desabilitado, carregando, erro, vazio, conteúdo longo (quebra de linha), tema escuro, idioma de escrita da direita para a esquerda se aplicável. Stories são **testes visuais** e **documentação**. Evite uma story por combinação (explosão); use uma **grade de variantes** (uma story que renderiza todas) para comparar.

### Documentação: autodocs e MDX
- **Autodocs** gera a página de cada componente; os comentários **TSDoc** (§/** ... */§) nas props viram a descrição;
- **MDX** permite páginas de texto livre (princípios, guia de cores, tokens, "quando usar / quando não usar") misturadas com stories;
- Organize em **seções**: Introdução, Fundamentos (tokens, tipografia, cor, espaço), Componentes, Padrões (formulários, navegação), Guias (acessibilidade, migração).
- Em cada componente: **para que serve**, **quando usar e quando não usar**, **exemplos corretos e incorretos**, **acessibilidade (teclado, ARIA)**, **API** e **notas de versão**.

### Testes de interação com play
A função **§play§** de uma story executa **interações** depois da renderização (clicar, digitar, tabular) e **asserções**:
§§§tsx
export const ComClique: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  }
};
§§§
No ambiente do Storybook, os passos aparecem em um painel e podem ser **reexecutados**. No teste desta aula, o §play§ de §ComClique§ clicou no botão e confirmou que §args.onClick§ havia sido chamado.

### Reutilizando stories em testes
**§composeStories§** (de §@storybook/react§) aplica meta, args e decoradores e devolve componentes prontos para o seu runner (Vitest, Jest):
§§§tsx
const { Primario, Perigo, ComClique } = composeStories(stories);
render(<Primario />);                                  // <button class="primario">Salvar</button>
await ComClique.play({ canvasElement: container });    // executa a interação
§§§
Assim, **o que está documentado é o que é testado**: um só lugar para os estados. O **addon de Vitest** (§@storybook/addon-vitest§) executa as stories como testes diretamente do projeto do Storybook, em navegador real. (No laboratório usamos §composeStories§ em jsdom.)

### Acessibilidade e regressão visual
- **Addon de acessibilidade**: roda o **axe-core** em cada story e mostra violações no painel; em CI, falhe quando houver violações novas (aula 6 mostra o axe em testes);
- **Testes visuais** (Chromatic, Playwright, Percy ou o recurso de snapshots de imagem): comparam capturas de cada story entre versões e apontam **regressões visuais**; exigem estabilidade (fontes, animações desligadas) e um fluxo de aprovação de mudanças;
- **Interação + a11y + visual** em CI formam a rede de proteção do DS.

### Configuração (visão geral)
§npx storybook@latest init§ (detecta o framework) cria a pasta §.storybook/§ com §main.ts§ (onde procurar stories, addons) e §preview.ts§ (decoradores globais, temas, CSS do Tailwind, parâmetros). **Decorators** envolvem as stories (provedor de tema, contêiner de layout). Importe o **CSS do Tailwind e os tokens** no §preview§ para que as stories reflitam o visual real. Os comandos e as opções mudam entre versões: siga a documentação oficial.

### Publicação e uso na equipe
Publique o Storybook como site estático (§storybook build§) em um endereço estável, com uma **versão por release** (para consultar a documentação de uma versão antiga). Inclua o link nos PRs (pré-visualização por PR). O Storybook é **a vitrine do DS**: designers e QA o usam para revisar sem rodar código.

### Armadilhas
- stories que **divergem** do uso real (dados perfeitos, sem erro nem vazio);
- documentação **só gerada**, sem orientação de uso;
- stories sem **tema**, sem **tokens** ou sem o CSS do app;
- testes visuais **instáveis** (fontes, datas, animações): fixe o ambiente.`,
  concepts: [
    { term: 'Storybook', def: 'Ferramenta para desenvolver, documentar e testar componentes de interface em isolamento.' },
    { term: 'Story', def: 'Exemplo de um componente em um estado específico, definido por args.' },
    { term: 'CSF', def: 'Component Story Format: módulo ES com export default (meta) e exports nomeados (stories).' },
    { term: 'args e argTypes', def: 'Valores das props de uma story e a descrição de como são controladas e documentadas.' },
    { term: 'Autodocs', def: 'Geração automática da página de documentação de um componente a partir das stories e dos tipos.' },
    { term: 'play', def: 'Função de uma story que executa interações e asserções após a renderização.' },
    { term: 'composeStories', def: 'Utilitário que transforma stories em componentes prontos para uso em testes unitários.' },
    { term: 'Decorator', def: 'Função que envolve uma story com contexto (tema, provedores, layout).' },
    { term: 'Regressão visual', def: 'Mudança indesejada na aparência detectada por comparação de capturas de tela.' }
  ],
  examples: R`**Analogia:** o Storybook é o **catálogo e o showroom** da loja de peças: cada peça aparece em cada acabamento (stories), com a ficha técnica (docs), um botão para testar (play) e um inspetor de qualidade (a11y). As stories viram também **peças de um teste de fábrica**: a mesma vitrine é usada nos testes automatizados.

**Resultados medidos (Storybook 10.6.8 com Vitest e jsdom, via composeStories):**
§§§
Primario: <button class="primario">Salvar</button>
Perigo:   <button class="perigo">Excluir</button>
play (ComClique): clique registrado em args.onClick
args padrão da meta: rotulo, onClick   | tags: autodocs
§§§

**Caso real:** uma equipe descobriu, ao criar as stories de estado vazio e conteúdo longo de um componente de tabela, três bugs de overflow que ninguém vira. O addon de acessibilidade apontou rótulos ausentes em campos de busca e, com os testes de interação no CI, uma regressão no foco de um menu foi bloqueada antes do release.`,
  code: [
    { title: 'Stories CSF 3 com args, argTypes, autodocs e play (stories executadas com composeStories)', lang: 'tsx', code: R`import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Botao } from './botao';

const meta = {
  title: 'DS/Botao',
  component: Botao,
  tags: ['autodocs'],
  args: { rotulo: 'Salvar', onClick: fn() },
  argTypes: { perigo: { control: 'boolean', description: 'Ação destrutiva' } }
} satisfies Meta<typeof Botao>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = {};
export const Perigo: Story = { args: { perigo: true, rotulo: 'Excluir' } };
export const ComClique: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  }
};`, notes: [{ l: '9', t: 'fn() cria uma função espiã que registra as chamadas.' }, { l: '10', t: 'argTypes alimentam os controles e a tabela de props.' }, { l: '17', t: 'O play executa a interação depois da renderização.' }, { l: '1', t: 'Este arquivo segue a documentação do Storybook 10; no laboratório as mesmas stories foram executadas com composeStories (sem a interface web).' }] },
    { title: 'Reaproveitando as stories em testes (executado com Vitest, jsdom e Testing Library)', lang: 'tsx', code: R`import { composeStories } from '@storybook/react';
import { render } from '@testing-library/react';
import * as stories from './botao.stories';

const { Primario, Perigo, ComClique } = composeStories(stories);

test('estados do botão', async () => {
  const r1 = render(<Primario />);
  expect(r1.container.innerHTML).toBe('<button class="primario">Salvar</button>');
  r1.unmount();
  const r2 = render(<Perigo />);
  expect(r2.container.innerHTML).toBe('<button class="perigo">Excluir</button>');
  r2.unmount();
  const r3 = render(<ComClique />);
  await ComClique.play({ canvasElement: r3.container });   // clique + asserção
});`, notes: [{ l: '5', t: 'composeStories aplica meta, args e decoradores a cada story.' }, { l: '16', t: 'O play recebe o contêiner renderizado e executa as interações.' }, { l: '1', t: 'Assim a documentação e o teste usam o mesmo conjunto de estados.' }] }
  ],
  bestPractices: ['Escreva uma story por estado relevante, inclusive erro, vazio e conteúdo longo.', 'Use autodocs, TSDoc e MDX para orientar o uso, com exemplos corretos e incorretos.', 'Inclua testes de interação com §play§ e reuse as stories em testes com §composeStories§.', 'Habilite o addon de acessibilidade e falhe o CI em violações novas.', 'Importe o CSS e os tokens reais no §preview§ e ofereça alternância de tema.', 'Publique o Storybook versionado e use pré-visualizações por PR.'],
  mistakes: ['Documentar só o caminho feliz com dados perfeitos.', 'Stories sem o CSS e os tokens reais.', 'Depender só da documentação gerada, sem orientação de quando usar.', 'Testes visuais instáveis por fontes e animações.', 'Criar uma story para cada combinação de variantes.', 'Deixar o Storybook sem publicação nem versão.'],
  market: `Storybook é padrão em equipes de design system e plataforma front-end; saber escrever stories, testes de interação e integrá-los ao CI é requisito comum de vagas com foco em componentes. A tendência é unir documentação, testes de interação, acessibilidade e regressão visual no mesmo fluxo.`,
  summary: `Stories (CSF 3) descrevem estados de um componente com args e argTypes; autodocs e MDX documentam; §play§ executa interações com asserções; §composeStories§ reaproveita as stories em testes. Complete com o addon de acessibilidade e testes visuais, importe CSS e tokens no preview, publique versões do site e use pré-visualizações por PR. Documentação boa explica quando usar, não apenas como.`,
  refs: [REF3.storybookDocs, REF3.csf, REF3.autodocs, REF3.interaction, REF3.a11yAddon],
  cards: [
    { q: 'O que é uma story?', a: 'Um exemplo de um componente em um estado específico, definido por args e exportado como objeto do módulo CSF.' },
    { q: 'Para que serve a função play?', a: 'Para executar interações e asserções depois da renderização da story, formando testes de interação.' },
    { q: 'Como reaproveitar stories em testes unitários?', a: 'Com composeStories, que aplica meta, args e decoradores e devolve componentes prontos para renderizar.' },
    { q: 'O que o addon de acessibilidade faz?', a: 'Roda o axe-core em cada story e mostra as violações no painel (e pode falhar o CI).' }
  ]
},
{
  id: 'tdw-09', moduleId: 'm3', order: 9, minutes: 60, tags: ['governança', 'design system', 'RFC', 'depreciação', 'adoção', 'métricas'],
  title: 'Governança de design system: contribuição, RFCs, depreciação, métricas e handoff',
  objectives: ['Escolher um modelo de equipe (centralizado, federado ou híbrido) e definir papéis e responsabilidades', 'Desenhar o processo de contribuição (proposta, RFC, revisão, critérios de aceite e definição de pronto de componente)', 'Definir uma política de versões, depreciação e suporte', 'Medir adoção e saúde do DS com métricas úteis e honestas', 'Estruturar o handoff entre design e desenvolvimento e a comunicação de mudanças'],
  intro: `A parte difícil de um design system **não é código**: é **gente e processo**. Quem decide o que entra? Como alguém propõe um componente novo? O que fazer quando um time precisa de uma exceção? Como retirar algo sem quebrar quem usa? Sem **governança**, o DS vira um repositório que cresce sem critério, ou uma barreira que as equipes contornam. Esta aula organiza os modelos de equipe, o processo de contribuição, a política de versões e depreciação e as métricas, com um exercício de código que implementa a regra de depreciação por versão.`,
  theory: `### Para que governança
Objetivos: **qualidade e consistência** (o que entra é bom), **velocidade** (as equipes não esperam semanas), **previsibilidade** (versões e depreciações claras) e **adoção** (as equipes **querem** usar). Governança **leve demais** gera divergência; **pesada demais** gera fila e atalhos. Procure o mínimo que dê confiança.

### Modelos de equipe
| Modelo | Descrição | Prós | Contras |
|---|---|---|---|
| **Centralizado** | uma equipe dedicada constrói e mantém | consistência, qualidade, foco | gargalo, distância dos produtos |
| **Federado/distribuído** | representantes de vários produtos contribuem | conhecimento dos casos reais, escala | coordenação, qualidade irregular |
| **Híbrido** (mais comum) | núcleo pequeno + contribuidores de produtos, com regras | equilíbrio | exige processo claro e tempo de revisão |
Independentemente do modelo, defina **dono** (ownership) por componente, **mantenedores** com poder de aprovar e um **canal de suporte** com tempo de resposta combinado (SLA interno).

### Papéis
Gerente de produto do DS (prioridades e adoção), **design** (padrões, tokens, Figma), **engenharia** (componentes, build, versões), **acessibilidade** (revisão e auditoria), **documentação/conteúdo**, e **consumidores** (feedback e contribuições). Registre quem decide o quê (matriz RACI simplificada) para evitar impasse.

### Processo de contribuição
1. **Necessidade**: abrir uma **issue/proposta** descrevendo o problema, os casos de uso em pelo menos **dois produtos** e as alternativas atuais (a regra "rule of three" ou "dois produtos" evita componentes de uso único);
2. **Triagem** em prazo curto: aceitar, pedir mais informação, direcionar a um componente existente ou recusar com justificativa;
3. **Design**: especificação (estados, variantes, acessibilidade, conteúdo, responsividade) revisada por design e acessibilidade;
4. **Implementação** com a **definição de pronto do componente**: código tipado, tokens semânticos, acessibilidade verificada (teclado, axe), testes, stories e documentação, **changeset**/nota de versão;
5. **Revisão** por mantenedores (e por pelo menos uma pessoa de acessibilidade);
6. **Lançamento** em versão **minor** (nova funcionalidade) e **comunicação**;
7. **Acompanhamento**: adoção e feedback.
Para mudanças **grandes ou incompatíveis**, use uma **RFC** (Request for Comments): documento curto com **contexto, proposta, alternativas, impacto na migração e plano de depreciação**, aberto a comentários por um prazo (por exemplo, uma ou duas semanas), com **decisão registrada** (um ADR). Processos públicos de RFC, como o do projeto Rust, servem de modelo de formato.

### Versões, depreciação e suporte
- **SemVer** (aula 7) é o contrato. Defina **o que é "público"** (props, variantes, tokens, HTML relevante, comportamento de teclado);
- **Política de depreciação**: anunciar na versão N (§@deprecated§ no código, aviso em desenvolvimento, nota no changelog e na documentação, alternativa e **guia de migração**), manter por **um período mínimo** (ex.: pelo menos dois ciclos de lançamento ou um número definido de meses) e remover só em **major**. A regra é testável: dada a versão em que um item foi depreciado e a versão atual, ele **já pode ser removido**?
- **Suporte**: quantas versões major recebem correções (ex.: a atual e a anterior); **codemods** (scripts de migração automática) reduzem o custo para os consumidores;
- **Canal de comunicação**: changelog, lista de e-mail ou canal de chat, e **ciclos de lançamento** previsíveis.

### Adoção e métricas
Métricas que ajudam (evite métricas de vaidade):
- **Adoção**: proporção de produtos/telas que usam o DS; **cobertura de componentes** (quantos botões da base vêm do DS) medida por análise estática;
- **Consistência**: número de **desvios** (cores e espaços fora dos tokens, componentes duplicados);
- **Qualidade**: violações de acessibilidade por componente, bugs reportados e tempo de correção;
- **Velocidade**: tempo para entregar uma tela com e sem o DS (pesquisa com as equipes);
- **Saúde**: **atualização de versões** nos consumidores (quantos estão em versão antiga), tempo de resposta a solicitações, **satisfação** (pesquisa curta periódica) e **contribuições externas**.
Combine números com **conversas** com os usuários do DS; **meça para melhorar**, não para punir equipes.

### Handoff entre design e código
- **Fonte única**: tokens e componentes no Figma **espelham** o código (nomes iguais, variáveis do Figma exportadas em DTCG, aula 5);
- **Especificação** por componente: estados, tamanhos, comportamentos, anotações de acessibilidade (ordem de foco, rótulos);
- **Revisão conjunta** de design e código antes do lançamento (design QA) e ciclo curto de feedback;
- **Mudanças de design** viram **tickets** com versão alvo; **mudanças de código** voltam ao design (documentar divergências).

### Comunicação e cultura
Mostre o DS: demonstrações periódicas, "horário de atendimento", notas de versão com **imagens**, onboarding de novos contribuidores, **reconhecimento** de quem contribui. A melhor governança é a que as pessoas **escolhem seguir** porque ajuda.

### Armadilhas
- **Torre de marfim**: o DS decide sem ouvir os produtos;
- **Cemitério de componentes**: componentes que ninguém usa e todos mantêm;
- **Mudanças incompatíveis sem aviso**; migrações sem ferramenta;
- **Medir só a quantidade de componentes**;
- **Processo igual para tudo**: exceções pequenas não precisam de RFC; mudanças amplas, sim.`,
  concepts: [
    { term: 'Governança de DS', def: 'Conjunto de papéis, regras e processos que definem como o design system evolui e é mantido.' },
    { term: 'Modelo híbrido', def: 'Equipe núcleo pequena que mantém o DS com contribuições de equipes de produto sob regras claras.' },
    { term: 'RFC', def: 'Request for Comments: documento de proposta com contexto, alternativas e impacto, aberto a comentários antes da decisão.' },
    { term: 'Definição de pronto de componente', def: 'Lista de critérios (tipos, acessibilidade, testes, stories, documentação) para um componente ser aceito.' },
    { term: 'Depreciação', def: 'Anúncio de que um recurso será removido, com alternativa, período de transição e guia de migração.' },
    { term: 'Codemod', def: 'Script que transforma automaticamente o código dos consumidores para uma nova API.' },
    { term: 'Taxa de adoção', def: 'Proporção de produtos ou telas que usam os componentes do design system.' },
    { term: 'Ownership', def: 'Responsabilidade nomeada por um componente, incluindo suporte e evolução.' },
    { term: 'Handoff', def: 'Entrega de especificações de design para o desenvolvimento, idealmente com fonte única e revisão conjunta.' }
  ],
  examples: R`**Analogia:** governança é o **regimento de um condomínio**: precisa ser claro o bastante para evitar brigas (qual obra pode, quem aprova, como se avisa) e leve o bastante para ninguém burlar. Um regimento que ninguém lê ou que exige assembleia para trocar uma lâmpada deixa de funcionar.

**Exemplo de política de depreciação (texto do guia de contribuição):**
§§§
1. Item depreciado na versão X.Y.0 (lançamento minor) com: @deprecated no código, nota no changelog, alternativa e guia de migração.
2. Permanece funcional por, no mínimo, 2 lançamentos minor e 90 dias.
3. Removido somente em um major (X+1.0.0); o codemod acompanha a versão.
4. Exceções (segurança, acessibilidade crítica) são avisadas com antecedência mínima definida e registradas.
§§§

**Exemplo de modelo de RFC (resumo):** Título; Autores; Status (rascunho, em revisão, aceita, recusada, implementada); Problema e motivação; Proposta; Alternativas consideradas; Impacto e migração; Plano de depreciação; Questões em aberto; Decisão (com data e responsáveis).

**Caso real:** um DS aceitava qualquer pedido de componente e, em dois anos, tinha 180 componentes, dos quais 60 usados em um único produto. A equipe passou a exigir **dois produtos interessados** e uma proposta curta; moveu os componentes de uso único para uma área "experimental" e marcou outros como depreciados. A manutenção caiu e a adoção medida (proporção de telas usando o DS) subiu porque o catálogo ficou mais claro.`,
  code: [
    { title: 'Regra de depreciação por versão (executado em Node.js 26; o exercício da aula treina a mesma lógica)', lang: 'javascript', code: R`const analisar = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) throw new Error('versão inválida: ' + v);
  return [+m[1], +m[2], +m[3]];
};
const cmp = (a, b) => { const x = analisar(a), y = analisar(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

// Pode remover? Só em um major novo e depois de N lançamentos minor/major publicados desde a depreciação.
function podeRemover(depreciadoEm, versaoAlvo, publicadas, minimoLancamentos) {
  if (analisar(versaoAlvo)[0] <= analisar(depreciadoEm)[0]) return false;      // remoção exige novo major
  const lancamentos = publicadas.filter((v) => cmp(v, depreciadoEm) > 0 && cmp(v, versaoAlvo) < 0 && analisar(v)[2] === 0);
  return lancamentos.length >= minimoLancamentos;
}
const historico = ['1.4.0', '1.4.1', '1.5.0', '1.6.0', '1.6.1', '2.0.0'];
console.log(podeRemover('1.4.0', '2.0.0', historico, 2), podeRemover('1.6.0', '2.0.0', historico, 2), podeRemover('1.4.0', '1.6.0', historico, 1));
// true false false`, notes: [{ l: '8', t: 'Remover exige um major maior que o da depreciação.' }, { l: '9', t: 'Conta apenas lançamentos minor ou major (patch igual a zero) entre a depreciação e o alvo.' }, { l: '14', t: 'Saída observada: true false false (de 1.4.0 até 2.0.0 houve 1.5.0 e 1.6.0; de 1.6.0 houve nenhum minor).' }] },
    { title: 'Definição de pronto de componente (checklist em Markdown para o PR)', lang: 'markdown', code: R`## Definição de pronto do componente

- [ ] API tipada (props, variantes) e padrões razoáveis; sem decisões irreversíveis desnecessárias
- [ ] Usa tokens semânticos e funciona nos temas claro e escuro
- [ ] Elemento nativo correto, teclado completo e foco visível; nome acessível e estados ARIA
- [ ] Testes: renderização, interação por teclado e axe sem violações
- [ ] Stories para todos os estados (inclusive erro, vazio e conteúdo longo) e página de documentação
- [ ] Orientações de uso (quando usar e quando não usar) e exemplos corretos e incorretos
- [ ] Changeset com o tipo de mudança (patch, minor ou major) e nota de versão
- [ ] Revisado por design, acessibilidade e um mantenedor
- [ ] Impacto em tamanho do pacote verificado`, notes: [{ l: '3', t: 'Critérios de qualidade verificáveis em cada PR de componente.' }, { l: '7', t: 'Acessibilidade e documentação são parte do "pronto", não etapas opcionais.' }, { l: '10', t: 'O changeset alimenta versões e changelog automáticos (aula 7).' }] }
  ],
  bestPractices: ['Escolha o modelo de equipe pelo contexto e nomeie donos e mantenedores.', 'Exija casos de uso em mais de um produto antes de criar componentes.', 'Use RFCs para mudanças grandes ou incompatíveis, com decisão registrada.', 'Tenha política de depreciação com prazo mínimo, alternativa e guia de migração (codemods quando possível).', 'Meça adoção, consistência, qualidade e satisfação, sem usar números para punir.', 'Mantenha design e código com fonte única de tokens e revisão conjunta.'],
  mistakes: ['Aceitar todos os pedidos de componentes sem critério.', 'Remover ou renomear sem depreciar.', 'Processo pesado para exceções pequenas e leve para mudanças amplas.', 'Medir apenas a quantidade de componentes.', 'DS sem dono nem canal de suporte.', 'Mudanças de design e de código sem sincronização.'],
  market: `Líderes de plataforma e de design system são avaliados por adoção, qualidade e previsibilidade, e a governança é o que diferencia um DS que escala de um que estagna. Habilidades de definir processos de contribuição, RFCs, depreciação e métricas são centrais para vagas de liderança técnica em front-end.`,
  summary: `Governança equilibra qualidade, velocidade, previsibilidade e adoção. Modelos centralizado, federado ou híbrido pedem donos e mantenedores claros. A contribuição passa por proposta com casos de uso em mais de um produto, design, implementação com definição de pronto e revisão; mudanças grandes usam RFC. Depreciação com prazo e migração antecede remoções em majors. Meça adoção, consistência, qualidade, velocidade e satisfação, e mantenha design e código sincronizados.`,
  refs: [REF3.designSystemGov, REF3.rfc, REF3.adr, REF3.semver],
  cards: [
    { q: 'Por que exigir casos de uso em dois produtos para um componente novo?', a: 'Para evitar componentes de uso único e garantir que a API atenda a mais de um contexto antes de virar compromisso do DS.' },
    { q: 'O que uma política de depreciação deve conter?', a: 'Anúncio com alternativa e guia de migração, período mínimo de convivência e remoção apenas em um major.' },
    { q: 'Que métricas indicam a saúde de um design system?', a: 'Adoção e cobertura, desvios dos tokens, violações de acessibilidade, tempo de correção, versões atualizadas e satisfação dos consumidores.' },
    { q: 'Quando usar uma RFC?', a: 'Para mudanças grandes ou incompatíveis, registrando contexto, alternativas, impacto na migração e decisão.' }
  ]
}
];
