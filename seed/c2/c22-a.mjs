// C2.2 — Tailwind CSS e Design Systems. Aulas 1 a 3 (utility-first, layout e responsividade, configuração e temas).
const R = String.raw;

export const REF = {
  utility: { title: 'Tailwind CSS — Styling with utility classes', url: 'https://tailwindcss.com/docs/styling-with-utility-classes', kind: 'doc' },
  states: { title: 'Tailwind CSS — Hover, focus, and other states', url: 'https://tailwindcss.com/docs/hover-focus-and-other-states', kind: 'doc' },
  responsive: { title: 'Tailwind CSS — Responsive design', url: 'https://tailwindcss.com/docs/responsive-design', kind: 'doc' },
  dark: { title: 'Tailwind CSS — Dark mode', url: 'https://tailwindcss.com/docs/dark-mode', kind: 'doc' },
  theme: { title: 'Tailwind CSS — Theme variables', url: 'https://tailwindcss.com/docs/theme', kind: 'doc' },
  custom: { title: 'Tailwind CSS — Adding custom styles', url: 'https://tailwindcss.com/docs/adding-custom-styles', kind: 'doc' },
  detecting: { title: 'Tailwind CSS — Detecting classes in source files', url: 'https://tailwindcss.com/docs/detecting-classes-in-source-files', kind: 'doc' },
  vite: { title: 'Tailwind CSS — Installing with Vite', url: 'https://tailwindcss.com/docs/installation/using-vite', kind: 'doc' },
  upgrade: { title: 'Tailwind CSS — Upgrade guide (v4)', url: 'https://tailwindcss.com/docs/upgrade-guide', kind: 'doc' },
  functions: { title: 'Tailwind CSS — Functions and directives', url: 'https://tailwindcss.com/docs/functions-and-directives', kind: 'doc' },
  mdnContainer: { title: 'MDN — CSS container queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries', kind: 'doc' },
  mdnLayer: { title: 'MDN — @layer (camadas de cascata)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@layer', kind: 'doc' },
  mdnCustomProps: { title: 'MDN — Propriedades personalizadas (variáveis CSS)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties', kind: 'doc' },
  mdnPrefersColor: { title: 'MDN — prefers-color-scheme', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme', kind: 'doc' },
  mdnReducedMotion: { title: 'MDN — prefers-reduced-motion', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'tdw-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['tailwind', 'utility-first', 'estados', 'variantes', 'css'],
  title: 'Tailwind CSS e a filosofia utility-first: utilitários, estados e variantes',
  objectives: ['Explicar a abordagem utility-first, seus ganhos e custos em comparação com CSS tradicional, BEM e CSS Modules', 'Ler e escrever utilitários e traduzi-los para CSS (espaçamento, cor, tipografia, borda)', 'Aplicar variantes de estado (hover, focus-visible, disabled, group, peer, aria, data) e valores arbitrários', 'Entender como o Tailwind gera CSS só das classes encontradas no código e por que nomes dinâmicos falham', 'Usar utilitários de acessibilidade (foco visível, movimento reduzido, sr-only)'],
  intro: `**Tailwind CSS** é um framework de CSS **utility-first**: em vez de escrever classes semânticas (§.cartao-produto§) e depois seu CSS, você compõe a aparência **no próprio HTML/JSX** com classes pequenas que fazem **uma coisa** (§p-4§, §flex§, §text-sm§, §hover:bg-marca-500§). O compilador lê seus arquivos, procura essas classes e **gera só o CSS usado**. A ideia causa estranhamento ("é CSS inline?"), mas resolve problemas reais: nomes, CSS que cresce sem parar e estilos que ninguém tem coragem de apagar. Os resultados desta aula foram obtidos compilando com **Tailwind CSS 4.3.5** (CLI) e inspecionando o CSS gerado.`,
  theory: `### A ideia utility-first
Cada utilitário mapeia para **uma declaração** (ou poucas): §p-4§ → padding; §flex§ → §display: flex§; §text-sm§ → tamanho de fonte. No **Tailwind v4**, o §p-4§ gerado foi §padding: calc(var(--spacing) * 4)§, com §--spacing: 0.25rem§ (portanto 1 rem). Todos os valores vêm de uma **escala de design** (espaçamentos, tamanhos, cores): você escolhe valores de um conjunto restrito em vez de inventar números ("16px, 15px ou 17px?"), o que dá **consistência**.
Ganhos práticos:
- **sem nomear** (menos "como chamo isto?"), sem trocar de arquivo;
- **CSS não cresce** com o tamanho do projeto: classes se **reutilizam**; o CSS final contém só o que é usado (no exemplo de teste, o arquivo gerado tinha **9,4 KB**, incluindo a camada base do Tailwind);
- **mudanças locais e seguras**: alterar uma classe afeta só aquele elemento, sem efeitos colaterais em cascata;
- **design system embutido**: a escala limita as escolhas.
Custos reais: HTML/JSX **mais longo**, curva de aprendizado dos nomes, risco de **duplicação** de sequências de classes (resolvido por componentes, aula 4) e dependência do **processo de build**.

### Comparação com outras abordagens
| Abordagem | Estilos ficam | Principal custo |
|---|---|---|
| CSS global + BEM | em folhas de estilo, com convenção de nomes | nomes, especificidade, CSS morto |
| CSS Modules | em arquivos locais por componente | arquivo extra por componente; sem escala compartilhada |
| CSS-in-JS (runtime) | no JavaScript | custo de execução e de pacote |
| **Utility-first (Tailwind)** | nas classes do elemento | marcação longa, disciplina de componentização |
Não é "certo ou errado": muitas equipes combinam Tailwind com CSS Modules ou CSS puro para animações e casos especiais.

### Estados e variantes
**Variantes** são prefixos que aplicam o utilitário só em uma condição: §hover:§, §focus:§, §focus-visible:§, §active:§, §disabled:§, §md:§, §dark:§, §group-hover:§, §peer-checked:§, §aria-[...]:§, §data-[...]:§, §has-[...]:§ e muitas outras, **combináveis** (§md:hover:bg-marca-500§). Medido na compilação:
- §hover:bg-marca-500§ → §.hover\\:bg-marca-500:hover { background-color: var(--color-marca-500); }§, **envolvido em §@media (hover: hover)§** (o estilo de hover só vale em dispositivos que realmente têm hover, evitando "hover preso" em telas de toque);
- §focus-visible:ring-2§ → regra com §:focus-visible§;
- §group-hover:underline§ → o elemento filho reage ao hover do pai marcado com a classe §group§;
- §has-[:checked]:font-bold§ → §:has(:is(:checked))§;
- §disabled:opacity-50§ → seletor §:disabled§.
Para estilizar por **atributo de estado** (útil com componentes que expõem §aria-expanded§ ou §data-state§), use §aria-expanded:rotate-180§ ou §data-[state=open]:bg-cinza-100§.

### Valores arbitrários e modificadores
- **Arbitrários**: §w-[37px]§ → §width: 37px§; §bg-[#ff0000]§; §grid-cols-[1fr_2fr]§. Use para exceções, não como regra (se repetir, transforme em token, aula 3 e 5);
- **Opacidade**: §bg-marca-500/50§ → gerou §color-mix(in oklab, var(--color-marca-500) 50%, transparent)§;
- **Importante**: §!font-bold§ → declarações com §!important§ (use raramente);
- **Negativos**: §-mt-1§.

### Como o CSS é gerado
O Tailwind **não** executa seu código: ele **varre os arquivos de origem em busca de textos que pareçam nomes de classe** e gera o CSS dessas classes. Consequências medidas no teste:
- um nome **completo** em qualquer string (até em um §<script>§) é gerado: §'bg-green-500'§ gerou §.bg-green-500§;
- um nome **montado dinamicamente** (§bg-DOLAR{cor}-500§ com §cor = 'blue'§) **não** gerou §.bg-blue-500§, pois o texto "bg-blue-500" nunca aparece inteiro no código.
Regra: **escreva sempre o nome completo** da classe; para variações, use um mapa (§{ azul: 'bg-blue-500', verde: 'bg-green-500' }§) ou variantes de componente (aula 4).
Também medido: só as **variáveis do tema usadas** aparecem em §:root§ (cores como §blue-500§ não usadas não foram emitidas).

### Acessibilidade e preferências do usuário
- **Foco visível**: nunca remova o contorno sem substituto; use §focus-visible:outline-2§ ou §focus-visible:ring-2§ (a variante §focus-visible§ só mostra o foco no uso por teclado);
- **Movimento reduzido**: §motion-safe:animate-spin§ e §motion-reduce:transition-none§ respeitam §prefers-reduced-motion§;
- **Leitores de tela**: §sr-only§ esconde o elemento visualmente mantendo-o acessível; §not-sr-only§ reverte;
- **Contraste**: as cores da paleta padrão **não garantem** contraste; confira o contraste de texto e fundo (WCAG AA: 4,5:1 para texto comum);
- **Tamanhos de toque**: alvos de pelo menos cerca de 24 px (WCAG 2.2) e, em geral, 44 px em interfaces de toque.

### Quando e como começar
Instale o Tailwind v4 com o plugin do Vite ou o CLI (aula 3), use o **IntelliSense** do editor e o **plugin do Prettier** que ordena as classes. Ordene por uma convenção (layout → caixa → tipografia → cor → estados); um formatador automático evita discussões.`,
  concepts: [
    { term: 'Utility-first', def: 'Abordagem em que a interface é estilizada compondo classes pequenas que fazem uma coisa cada.' },
    { term: 'Utilitário', def: 'Classe de uma única responsabilidade, como p-4, flex ou text-sm.' },
    { term: 'Variante', def: 'Prefixo que aplica um utilitário só em uma condição (hover:, md:, dark:, disabled:).' },
    { term: 'Escala de design', def: 'Conjunto restrito de valores (espaçamentos, tamanhos, cores) do qual se escolhe.' },
    { term: 'Valor arbitrário', def: 'Valor entre colchetes (w-[37px]) para exceções fora da escala.' },
    { term: 'group / peer', def: 'Marcadores que permitem estilizar um elemento conforme o estado de um pai (group) ou irmão (peer).' },
    { term: 'focus-visible', def: 'Estado de foco mostrado quando o navegador julga necessário, normalmente no uso por teclado.' },
    { term: 'Detecção de classes', def: 'Varredura dos arquivos de origem por textos que se pareçam com nomes de classes do Tailwind.' },
    { term: 'sr-only', def: 'Utilitário que oculta visualmente o conteúdo mantendo-o disponível a leitores de tela.' }
  ],
  examples: R`**Analogia:** o CSS tradicional é um **dicionário** que você escreve e consulta ("cartão-produto" = bordas + sombra + espaços). O utility-first é um **jogo de peças de montar**: você monta a aparência com peças padronizadas e, quando o conjunto se repete, **guarda a montagem em uma caixa** (um componente). Peças fora do padrão (valores arbitrários) existem, mas cada uma é uma exceção declarada.

**Exemplo (HTML compilado no teste):**
§§§html
<div class="p-4 mt-2 flex items-center gap-2 md:grid md:grid-cols-3 hover:bg-marca-500 focus-visible:ring-2 dark:bg-black text-marca-600">
§§§

**Resultados medidos (Tailwind CSS 4.3.5, CLI, 216 ms):**
§§§
.p-4                   -> padding: calc(var(--spacing) * 4)           (--spacing: 0.25rem)
.hover:bg-marca-500    -> dentro de @media (hover: hover)
.bg-marca-500/50       -> color-mix(in oklab, var(--color-marca-500) 50%, transparent)
.w-[37px]              -> width: 37px
.has-[:checked]:...    -> :has(:is(:checked))
'bg-green-500' (texto literal)      -> gerado
bg-DOLAR{cor}-500 (texto montado)   -> NÃO gerado
§§§

**Caso real:** uma equipe montava nomes como §text-DOLAR{status}-600§ e as cores "sumiam" em produção (mas funcionavam em desenvolvimento porque outra tela usava a classe completa). A correção foi um mapa com os nomes completos (§{ ok: 'text-green-600', erro: 'text-red-600' }§) e o linter de classes do Tailwind.`,
  code: [
    { title: 'Compilando e inspecionando o CSS gerado (executado com Tailwind CSS 4.3.5)', lang: 'bash', code: R`# entrada.css
#   @import "tailwindcss";
#   @theme { --color-marca-500: #0b5fff; }
npx @tailwindcss/cli -i entrada.css -o saida.css
grep -A3 "\.p-4 {" saida.css
# .p-4 {
#   padding: calc(var(--spacing) * 4);
# }
grep -B1 -A2 "hover\\:bg-marca-500" saida.css
# @media (hover: hover) {
#   .hover\:bg-marca-500:hover { background-color: var(--color-marca-500); }
# }`, notes: [{ l: '4', t: 'O CLI v4 está no pacote @tailwindcss/cli; o tempo de compilação do exemplo foi de 216 ms.' }, { l: '6', t: 'O espaçamento usa a variável --spacing (0,25rem) multiplicada por 4.' }, { l: '10', t: 'O hover só vale quando o dispositivo tem hover real.' }] },
    { title: 'Estados, grupos e acessibilidade em um botão (JSX; classes compiladas no teste)', lang: 'tsx', code: R`export function BotaoAcao({ children }: { children: React.ReactNode }) {
  return (
    <button
      className={[
        'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium',
        'bg-marca-600 text-white hover:bg-marca-500',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'motion-safe:transition-colors'
      ].join(' ')}
    >
      {children}
    </button>
  );
}
// Os nomes aparecem COMPLETOS no código: o Tailwind os encontra. Nada de bg-DOLAR{cor}-500.`, notes: [{ l: '5', t: 'Cada linha agrupa uma categoria: tipografia/caixa, cor, foco, desabilitado e animação.' }, { l: '7', t: 'focus-visible mantém o foco claro para quem usa teclado.' }, { l: '10', t: 'motion-safe só anima se o usuário não pediu movimento reduzido.' }] }
  ],
  bestPractices: ['Escreva sempre o nome completo das classes; use mapas para variações.', 'Use variantes de estado (hover, focus-visible, disabled, aria-*) em vez de JavaScript para estilos de estado.', 'Prefira a escala do tema a valores arbitrários; transforme repetições em tokens.', 'Mantenha o foco visível e respeite o movimento reduzido.', 'Ative o plugin do Prettier para ordenar classes e o IntelliSense do editor.', 'Extraia componentes quando uma combinação de classes se repete.'],
  mistakes: ['Montar nomes de classe dinamicamente (§bg-DOLAR{cor}-500§).', 'Remover o contorno de foco sem substituto.', 'Abusar de valores arbitrários em vez de definir tokens.', 'Copiar longas listas de classes entre arquivos em vez de criar um componente.', 'Confiar nas cores padrão sem checar o contraste.', 'Usar §!important§ (§!§) para vencer conflitos de organização.'],
  market: `Tailwind é um dos frameworks de CSS mais usados em projetos React e Next.js e aparece em muitas vagas de front-end; equipes de produto o escolhem pela velocidade e pela consistência com design systems. Saber ler o CSS que ele gera e entender a detecção de classes é o que evita os bugs "funciona em desenvolvimento, quebra em produção".`,
  summary: `Tailwind é utility-first: classes de uma responsabilidade, tiradas de uma escala de design, compõem a aparência no marcado, e só o CSS usado é gerado. Variantes (hover, focus-visible, disabled, group, aria, data, md, dark) aplicam utilitários por condição; o hover só vale em dispositivos com hover. Nomes de classe precisam aparecer completos no código para serem detectados. Cuide de foco visível, movimento reduzido e contraste.`,
  refs: [REF.utility, REF.states, REF.detecting, REF.mdnReducedMotion],
  cards: [
    { q: 'Por que bg-${cor}-500 não funciona no Tailwind?', a: 'O compilador procura o texto completo da classe; um nome montado em tempo de execução nunca aparece inteiro no código, então o CSS não é gerado.' },
    { q: 'O que a variante focus-visible faz?', a: 'Aplica o estilo quando o navegador mostra o foco, normalmente no uso por teclado, mantendo a acessibilidade sem poluir cliques de mouse.' },
    { q: 'Por que hover:... fica dentro de @media (hover: hover)?', a: 'Para o estilo valer só em dispositivos com hover real, evitando hover "preso" em telas de toque.' },
    { q: 'Qual o principal custo do utility-first?', a: 'Marcação mais longa e risco de duplicação de classes, resolvidos com componentes e variantes.' }
  ]
},
{
  id: 'tdw-02', moduleId: 'm1', order: 2, minutes: 65, tags: ['responsividade', 'flexbox', 'grid', 'container queries', 'dark mode'],
  title: 'Layout e responsividade: flex, grid, breakpoints, container queries e modo escuro',
  objectives: ['Construir layouts com flexbox e grid usando utilitários e entender quando usar cada um', 'Aplicar a abordagem mobile-first com breakpoints e intervalos (§sm:max-md:§)', 'Usar container queries (§@container§, §@md:§) para componentes responsivos ao contêiner', 'Implementar modo escuro com §prefers-color-scheme§ e com seletor de classe (§@custom-variant§)', 'Evitar problemas comuns: overflow, viewport móvel, altura 100vh e ordem de leitura'],
  intro: `Responsividade é adaptar a interface a tamanhos de tela, orientação, preferências do usuário (modo escuro, movimento reduzido) e, cada vez mais, **ao espaço do próprio contêiner**. O Tailwind a resolve com **variantes de breakpoint** aplicadas de forma **mobile-first**: o utilitário sem prefixo vale para tudo, e os prefixos (§md:§, §lg:§) valem **a partir de** certa largura. Aqui conferimos o CSS real que cada variante gera (Tailwind CSS 4.3.5) e vemos o que muda com **container queries** e **modo escuro**.`,
  theory: `### Mobile-first
Escreva primeiro a versão para telas pequenas e **acrescente** regras para telas maiores: §flex-col md:flex-row§ (coluna no celular, linha a partir de §md§). Os breakpoints padrão do v4 usam §min-width§ em rem: §sm§ 40rem, §md§ 48rem, §lg§ 64rem, §xl§ 80rem, §2xl§ 96rem (no teste, §md:grid§ gerou §@media (width >= 48rem) { .md\\:grid { display: grid } }§). Usar **rem** (e não px) respeita o tamanho de fonte escolhido pelo usuário.
- **Intervalos**: §sm:max-md:hidden§ aplica só entre §sm§ e §md§ (gerou um §@media§ aninhado com intervalo);
- **Máximo**: §max-md:...§ (até antes de §md§);
- **Personalizados**: um breakpoint novo é só uma variável do tema: §--breakpoint-3xl: 120rem§ gerou §@media (width >= 120rem)§ para §3xl:p-10§ (o nome começa com dígito e foi escapado como §.\\33 xl\\:p-10§).
Evite "um breakpoint por dispositivo": escolha pontos onde **o seu conteúdo quebra**.

### Flexbox e grid
- **Flexbox** (§flex§, §items-center§, §justify-between§, §gap-4§, §flex-wrap§, §flex-1§): eixo **único**, bom para barras, linhas de botões, centralização e distribuição de espaço;
- **Grid** (§grid§, §grid-cols-3§, §col-span-2§, §gap-4§, §grid-cols-[1fr_2fr]§): **duas dimensões**, bom para páginas e galerias. §md:grid-cols-3§ gerou §grid-template-columns: repeat(3, minmax(0, 1fr))§; o §minmax(0, 1fr)§ evita que conteúdo largo estoure a coluna;
- **auto-fit**: §grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]§ cria colunas que se ajustam sem breakpoints;
- **Contêiner**: §mx-auto max-w-screen-xl px-4§ centraliza e limita a largura de leitura (linhas de 60 a 80 caracteres).
Regra prática: **flex para alinhar itens em uma linha ou coluna; grid para estruturar áreas**.

### Container queries
Breakpoints olham para a **janela**; **container queries** olham para o **espaço do componente**: um cartão em uma barra lateral estreita se comporta diferente do mesmo cartão na área principal. No Tailwind v4, marque o pai com §@container§ e use variantes §@md:§, §@lg:§...: §@md:text-lg§ gerou §@container (width >= 28rem) { ... }§ (28 rem é o tamanho do §@md§). O suporte nos navegadores atuais é amplo (consulte a tabela do MDN). É a base de **componentes verdadeiramente reutilizáveis**: o componente se adapta ao espaço que recebe, não à tela.

### Modo escuro
Por padrão, §dark:§ usa a **preferência do sistema** (§prefers-color-scheme: dark§). Para um **seletor controlado pelo usuário** (botão de tema), declare uma variante personalizada:
§§§css
@custom-variant dark (&:where(.dark, .dark *));
§§§
No teste, §dark:bg-black§ gerou §.dark\\:bg-black:where(.dark, .dark *)§: o estilo vale dentro de qualquer elemento com a classe §dark§ (normalmente no §<html>§). Boas práticas:
- **ofereça três opções**: claro, escuro e "sistema", e **lembre a escolha** (§localStorage§) aplicando a classe **antes** do primeiro desenho (um script inline curto no §<head>§) para evitar o "flash" de tema errado;
- **não duplique cores**: prefira **tokens semânticos** (§bg-fundo§, §text-texto§) que trocam de valor por tema (aula 5), em vez de §bg-white dark:bg-black§ em todo elemento;
- **contraste** deve ser verificado nos dois temas; §color-scheme§ ajuda controles nativos.

### Problemas comuns
- **Altura §100vh§ no celular**: a barra do navegador muda a altura visível; prefira §min-h-dvh§ (unidade dinâmica) ou §min-h-svh§;
- **Overflow horizontal**: um elemento largo estoura a tela (tabelas, imagens). Use §overflow-x-auto§, §max-w-full§ e §min-w-0§ em filhos de flex/grid;
- **Ordem visual × ordem de leitura**: §order-*§ e grid podem desalinhar a ordem de **foco e de leitura** da ordem **visual**; mantenha-as iguais;
- **Texto truncado**: §truncate§ ou §line-clamp-2§ exigem largura definida;
- **Imagens**: §aspect-video§, §object-cover§ e atributos §width§/§height§ evitam saltos de layout;
- **Ocultar**: §hidden§ (display none) remove da acessibilidade; §sr-only§ só oculta visualmente;
- **Impressão**: variante §print:§.

### Testando
Redimensione no DevTools (modo dispositivo), teste a rolagem, o zoom do navegador a 200 % (WCAG) e **dispositivos reais**; verifique modo escuro e movimento reduzido no painel de emulação (Rendering).`,
  concepts: [
    { term: 'Mobile-first', def: 'Escrever primeiro o estilo para telas pequenas e acrescentar regras para telas maiores.' },
    { term: 'Breakpoint', def: 'Largura a partir da qual um conjunto de regras passa a valer.' },
    { term: 'Container query', def: 'Regra condicionada ao tamanho do contêiner pai, não da janela.' },
    { term: 'Flexbox', def: 'Modelo de layout unidimensional para alinhar e distribuir itens.' },
    { term: 'Grid', def: 'Modelo de layout bidimensional em linhas e colunas.' },
    { term: 'prefers-color-scheme', def: 'Preferência do sistema por tema claro ou escuro, consultável em CSS.' },
    { term: 'Variante personalizada', def: 'Variante definida pelo projeto com @custom-variant, como dark baseado em classe.' },
    { term: 'dvh / svh', def: 'Unidades de altura da viewport que consideram as barras dinâmicas dos navegadores móveis.' },
    { term: 'Layout shift', def: 'Mudança inesperada de posição de elementos durante o carregamento.' }
  ],
  examples: R`**Analogia:** um breakpoint é uma **mudança de roupa conforme a temperatura da sala** (a janela). Uma container query é a roupa escolhida conforme a **cadeira onde a pessoa vai se sentar**: o mesmo cartão se veste de um jeito na cadeira estreita da lateral e de outro na poltrona larga do centro.

**Resultados medidos (Tailwind CSS 4.3.5):**
§§§
md:grid            -> @media (width >= 48rem) { .md\:grid { display: grid } }
md:grid-cols-3     -> grid-template-columns: repeat(3, minmax(0, 1fr))
3xl:p-10           -> @media (width >= 120rem)   (com --breakpoint-3xl: 120rem no @theme)
sm:max-md:hidden   -> intervalo entre sm e md
@md:text-lg        -> @container (width >= 28rem) { ... }
dark:bg-black      -> .dark\:bg-black:where(.dark, .dark *)   (com @custom-variant)
§§§

**Caso real:** o componente "cartão de produto" tinha três versões (lista, grade, barra lateral) porque dependia da largura da janela. Com §@container§ e variantes §@md:§, passou a ser **um** componente que se reorganiza conforme o espaço, e a barra lateral deixou de quebrar em telas largas.`,
  code: [
    { title: 'Cartão responsivo ao contêiner, em grade e com modo escuro por tokens (JSX; classes compiladas no teste)', lang: 'tsx', code: R`export function Galeria({ produtos }: { produtos: { id: string; nome: string }[] }) {
  return (
    <ul className="mx-auto grid max-w-screen-xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
      {produtos.map((p) => (
        <li key={p.id} className="@container rounded-lg border border-borda bg-fundo-cartao">
          <article className="flex flex-col gap-2 p-4 @md:flex-row @md:items-center">
            <div className="aspect-video w-full rounded bg-fundo-suave @md:w-40" />
            <h3 className="min-w-0 truncate text-base font-semibold text-texto @md:text-lg">{p.nome}</h3>
          </article>
        </li>
      ))}
    </ul>
  );
}`, notes: [{ l: '3', t: 'Mobile-first: uma coluna; 2 a partir de sm; 4 a partir de lg.' }, { l: '5', t: '@container marca o cartão como contêiner de consulta.' }, { l: '6', t: '@md: reage ao tamanho do cartão, não da janela.' }, { l: '8', t: 'min-w-0 permite que truncate funcione dentro de flex.' }, { l: '5', t: 'border-borda, bg-fundo-cartao e text-texto são tokens semânticos (aula 5) que mudam com o tema.' }] },
    { title: 'Modo escuro com seletor de classe e tema inicial sem "flash" (CSS e script inline)', lang: 'css', code: R`/* estilos.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
@theme inline { --color-fundo: var(--fundo-app); --color-texto: var(--texto-app); }
:root { --fundo-app: #ffffff; --texto-app: #111827; }
.dark { --fundo-app: #0b1220; --texto-app: #f3f4f6; }

/* <head> do HTML, executado antes do primeiro desenho:
<script>
  try {
    const salvo = localStorage.getItem('tema');
    const escuro = salvo ? salvo === 'escuro' : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', escuro);
  } catch {}
</script>
*/`, notes: [{ l: '3', t: 'Variante dark baseada em classe: o usuário controla o tema.' }, { l: '4', t: '@theme inline gera utilitários que apontam direto para as variáveis do tema atual (bg-fundo → var(--fundo-app)).' }, { l: '8', t: 'O script roda antes da pintura para evitar o flash do tema errado; o try/catch cobre storage bloqueado.' }] }
  ],
  bestPractices: ['Projete mobile-first e quebre onde o conteúdo pede, não por dispositivo.', 'Use flex para uma dimensão e grid para áreas; use §minmax(0,1fr)§ e §min-w-0§ para evitar estouros.', 'Prefira container queries para componentes reutilizáveis.', 'Ofereça claro, escuro e sistema, lembre a escolha e evite o flash de tema.', 'Use tokens semânticos em vez de repetir §dark:§ em cada elemento.', 'Use §min-h-dvh§ no lugar de §100vh§ em telas móveis e teste com zoom de 200 %.'],
  mistakes: ['Escrever desktop-first e "desfazer" regras em telas pequenas.', 'Usar §100vh§ e cortar o conteúdo atrás da barra do navegador.', 'Mudar a ordem visual com §order-*§ sem considerar foco e leitura.', 'Duplicar pares §bg-white dark:bg-black§ em todo componente.', 'Esconder conteúdo importante com §hidden§ em telas pequenas.', 'Deixar o tema escuro piorar o contraste e não testá-lo.'],
  market: `Responsividade e modo escuro são requisitos básicos de qualquer produto web. Container queries se tornaram o caminho para componentes reutilizáveis em design systems, e o conhecimento do CSS que o Tailwind gera ajuda a depurar problemas de layout, assunto frequente em testes práticos de front-end.`,
  summary: `Mobile-first com breakpoints em rem (sm 40, md 48, lg 64, xl 80, 2xl 96); intervalos e máximos com variantes combinadas; novos breakpoints pelo tema. Flex para uma dimensão, grid para áreas. Container queries (§@container§, §@md:§) adaptam o componente ao seu espaço. Modo escuro por preferência do sistema ou por classe (§@custom-variant§), com tokens semânticos e tema aplicado antes da pintura. Cuidado com 100vh, estouros e ordem de leitura.`,
  refs: [REF.responsive, REF.dark, REF.mdnContainer, REF.mdnPrefersColor],
  cards: [
    { q: 'O que significa mobile-first no Tailwind?', a: 'O utilitário sem prefixo vale para todas as telas e os prefixos (md:, lg:) aplicam a partir daquela largura mínima.' },
    { q: 'Qual a diferença entre breakpoint e container query?', a: 'O breakpoint olha a largura da janela; a container query olha a largura do contêiner pai do componente.' },
    { q: 'Como o dark: passa a seguir um botão de tema em vez do sistema?', a: 'Com @custom-variant dark (&:where(.dark, .dark *)) e alternando a classe dark no elemento raiz.' },
    { q: 'Por que usar min-h-dvh em vez de 100vh em celulares?', a: 'Porque dvh considera as barras dinâmicas do navegador; 100vh pode cortar o conteúdo.' }
  ]
},
{
  id: 'tdw-03', moduleId: 'm1', order: 3, minutes: 60, tags: ['@theme', 'tailwind v4', 'configuração', 'vite', '@source'],
  title: 'Configuração e temas no Tailwind v4: @theme, @source, utilitários e camadas',
  objectives: ['Instalar o Tailwind v4 com o plugin do Vite e entender a configuração "CSS-first"', 'Definir tokens de tema com §@theme§ (cores, fontes, breakpoints, espaçamento) e entender os espaços de nomes', 'Usar §@theme inline§, §@utility§, §@custom-variant§ e §@layer§ para estender o framework', 'Controlar a detecção de classes com §@source§ e diagnosticar classes que "somem"', 'Reconhecer as diferenças entre o v3 (§tailwind.config.js§) e o v4 e planejar a migração'],
  intro: `No **Tailwind v4**, a configuração mudou de um arquivo JavaScript (§tailwind.config.js§) para o **próprio CSS**: você declara o tema com a diretiva **§@theme§** e o framework transforma as **variáveis CSS** em utilitários. Isso aproxima o Tailwind do CSS nativo (variáveis, camadas de cascata) e simplifica a instalação. Esta aula mostra como configurar, estender e depurar, com **compilações reais** do Tailwind CSS 4.3.5.`,
  theory: `### Instalação (Vite)
§§§bash
npm install tailwindcss @tailwindcss/vite
§§§
§§§ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
export default { plugins: [tailwindcss()] };
§§§
§§§css
/* src/estilos.css */
@import "tailwindcss";
§§§
Outras opções: **CLI** (§@tailwindcss/cli§, usado nos testes desta aula), **PostCSS** (§@tailwindcss/postcss§) e frameworks (Next.js usa PostCSS). Os passos acima seguem a documentação oficial; o CLI foi o executado aqui. A importação única §@import "tailwindcss"§ carrega as **camadas** (§theme§, §base§, §components§, §utilities§) e o pré-processamento de §@import§ é embutido.

### @theme: tokens viram utilitários
Dentro de §@theme§ você declara **variáveis CSS com nomes em espaços (namespaces)** que o Tailwind reconhece:
| Namespace | Gera utilitários | Exemplo |
|---|---|---|
| §--color-*§ | §bg-*§, §text-*§, §border-*§, §fill-*§... | §--color-marca-500: #0b5fff§ → §bg-marca-500§ |
| §--font-*§ | §font-*§ (família) | §--font-display§ → §font-display§ |
| §--text-*§ | §text-*§ (tamanho) | §--text-lg§ |
| §--breakpoint-*§ | variantes responsivas | §--breakpoint-3xl: 120rem§ → §3xl:§ |
| §--spacing§ | espaçamentos (múltiplos) | §--spacing: 0.25rem§ |
| §--radius-*§, §--shadow-*§, §--ease-*§... | bordas, sombras, curvas | |
No teste, as variáveis §--color-marca-500§ e §--font-display§ **apareceram em §:root§** e as classes §bg-marca-500§ e §font-display§ funcionaram. **Só as variáveis usadas** são emitidas: §--color-nao-usada§ ficou de fora do CSS final, assim como as cores padrão não usadas (§blue-500§). Para **substituir** toda a paleta padrão, zere o namespace (§--color-*: initial;§) antes de declarar as suas.

### @theme inline e variáveis dinâmicas
Variáveis de §@theme§ são **estáticas** quando o CSS é gerado. Para valores que **mudam em execução** (tema claro/escuro, tokens do design system), declare a variável em §:root§ / §.dark§ e **aponte** o tema para ela com **§@theme inline§**:
§§§css
@theme inline { --color-fundo: var(--fundo-app); }
:root { --fundo-app: white; }
.dark { --fundo-app: #111; }
§§§
No teste, §bg-fundo§ gerou §background-color: var(--fundo-app)§ (a referência foi **inlinada**, sem variável intermediária), de modo que o valor segue a troca de tema. É a base dos **tokens semânticos** (aula 5).

### Estendendo: @utility, @custom-variant, @layer
- **§@utility nome { ... }§** cria um utilitário que **aceita variantes**: §@utility tab-4 { tab-size: 4; }§ gerou §.tab-4§, e §hover:botao-base§ funcionou para o utilitário §botao-base§;
- **§@custom-variant§** (ou §@variant§) define variantes: §@custom-variant dark (&:where(.dark, .dark *));§;
- **§@layer components { .cartao { ... } }§** adiciona classes "tradicionais": §.cartao§ foi gerada, mas **sem variantes** (§md:cartao§ **não** foi gerada); só utilitários criados com §@utility§ aceitam variantes;
- **§@apply§** (aula 4) compõe utilitários em CSS; **§@reference§** permite usar o tema dentro de CSS de componentes (módulos, Vue/Svelte).
**Camadas de cascata**: a saída usa §@layer theme, base, components, utilities§, de modo que **utilitários vencem componentes**, que vencem a base, independentemente da especificidade e da ordem. Isso torna o CSS previsível; estilos seus **fora de camadas** vencem tudo (cuidado).

### Detecção de classes
O v4 faz **detecção automática**: varre os arquivos do projeto (ignorando §.gitignore§, §node_modules§ e binários). No teste, uma classe §bg-green-500§ de **outro arquivo** na mesma pasta (§pagina.html§) foi gerada mesmo com o §@source§ apontando para um arquivo diferente. Ajustes:
- **§@source "../node_modules/biblioteca-ui"§** inclui uma pasta ignorada (biblioteca de componentes);
- **§@source not "./legado"§** exclui;
- **§@source inline("underline md:flex")§** força classes que só existem no banco de dados ou em conteúdo dinâmico.
**Diagnóstico** de "a classe não funciona": (1) o nome aparece **completo** no código? (2) o arquivo está em uma pasta detectada? (3) o nome existe no tema? (4) há CSS seu fora de camada vencendo? (5) o cache do bundler foi limpo?

### Diferenças v3 → v4 (visão geral)
| v3 | v4 |
|---|---|
| §tailwind.config.js§ (JavaScript) | §@theme§ no CSS (o arquivo antigo pode ser carregado com §@config§) |
| §@tailwind base/components/utilities§ | §@import "tailwindcss"§ |
| Cores em RGB/hex | paleta em **oklch** (cores mais vivas em telas modernas) |
| Plugin PostCSS e autoprefixer | motor novo, mais rápido; prefixos incluídos |
| §bg-opacity-*§ | modificador §/50§ |
O pacote **§@tailwindcss/upgrade§** (§npx @tailwindcss/upgrade§) automatiza boa parte da migração. Consulte o guia oficial de atualização e **revise o resultado**: nem tudo é automático (plugins de terceiros e §theme()§ em JavaScript, por exemplo).

### Navegadores
O v4 usa recursos modernos de CSS (§@property§, §color-mix()§, camadas) e **exige navegadores recentes**; consulte a página de compatibilidade da documentação antes de adotar em um público com navegadores antigos.

### Organização recomendada
Um arquivo §estilos.css§ com: §@import§, §@theme§ (tokens primitivos), variáveis de tema por modo, §@theme inline§ (tokens semânticos), §@utility§ e §@layer components§ pequenos. Nada de CSS gigante: a lógica visual mora nos componentes (aula 4).`,
  concepts: [
    { term: '@theme', def: 'Diretiva do Tailwind v4 que declara tokens de tema como variáveis CSS que geram utilitários.' },
    { term: 'Espaço de nomes (namespace)', def: 'Prefixo da variável (--color-, --font-, --breakpoint-) que define quais utilitários ela gera.' },
    { term: '@theme inline', def: 'Variante em que o utilitário aponta diretamente para a variável referenciada, preservando valores dinâmicos.' },
    { term: '@utility', def: 'Diretiva que cria um utilitário personalizado que aceita variantes.' },
    { term: '@custom-variant', def: 'Diretiva que define uma variante personalizada, como dark baseado em classe.' },
    { term: '@source', def: 'Diretiva que inclui, exclui ou força fontes e classes na detecção.' },
    { term: 'Camadas de cascata', def: 'Mecanismo @layer que ordena grupos de regras independentemente da especificidade.' },
    { term: 'oklch', def: 'Espaço de cor perceptualmente uniforme usado na paleta padrão do Tailwind v4.' },
    { term: 'Detecção automática', def: 'Varredura do projeto por classes sem configuração de caminhos.' }
  ],
  examples: R`**Analogia:** o §@theme§ é o **cardápio da casa**: o que está nele vira pratos que o cliente pode pedir (utilitários). O §@theme inline§ é um cardápio que **aponta para a vitrine do dia** (variáveis que mudam com o tema), em vez de listar um prato fixo. O §@source§ é a lista de **fornecedores** que o cozinheiro consulta para saber que ingredientes usar.

**Resultados medidos (Tailwind CSS 4.3.5):**
§§§
@theme { --color-marca-500: #0b5fff; --color-nao-usada: #123456; }  -> marca-500 em :root; nao-usada NÃO emitida
@theme inline { --color-fundo: var(--fundo-app); }                    -> .bg-fundo { background-color: var(--fundo-app) }
@utility tab-4 { tab-size: 4; }                                       -> .tab-4 e variantes (hover:...)
@layer components { .cartao { ... } }                                 -> .cartao existe; md:cartao NÃO existe
camadas de saída: @layer theme, base, components, utilities
§§§

**Caso real:** uma biblioteca de componentes interna em §node_modules§ usava classes Tailwind, mas os estilos não apareciam no app: o diretório é ignorado pela detecção automática. Acrescentar §@source "../node_modules/@acme/ui"§ resolveu. Outro time montava classes a partir de dados do CMS; o §@source inline(...)§ listou as variações permitidas.`,
  code: [
    { title: 'Arquivo de estilos do v4 com tema, tokens semânticos e extensões (executado com Tailwind CSS 4.3.5)', lang: 'css', code: R`@import "tailwindcss";
@source "../node_modules/@acme/ui";                  /* inclui uma pasta que a detecção ignora */

@theme {
  --color-marca-500: #0b5fff;
  --color-marca-600: oklch(0.5 0.2 262);
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 120rem;
}
@theme inline { --color-fundo: var(--fundo-app); }   /* aponta para a variável do tema atual */
:root { --fundo-app: white; }
.dark { --fundo-app: #111; }

@custom-variant dark (&:where(.dark, .dark *));
@utility tab-4 { tab-size: 4; }
@layer components { .cartao { border-radius: 0.5rem; } }`, notes: [{ l: '2', t: 'Sem este @source a biblioteca em node_modules não seria varrida.' }, { l: '4', t: 'Cada variável em @theme com namespace conhecido gera utilitários.' }, { l: '10', t: 'O tema inline mantém o valor dinâmico: bg-fundo usa var(--fundo-app).' }, { l: '16', t: 'Classes em @layer components não ganham variantes; use @utility para isso.' }] },
    { title: 'Integração com o Vite (padrão da documentação oficial; não executado aqui)', lang: 'ts', code: R`// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });

// src/main.tsx
import './estilos.css';   // contém @import "tailwindcss";`, notes: [{ l: '5', t: 'O plugin do Vite substitui a configuração de PostCSS no v4.' }, { l: '8', t: 'O CSS é importado uma vez, na entrada da aplicação.' }, { l: '1', t: 'Trecho baseado na documentação oficial; o laboratório desta aula usou o CLI.' }] }
  ],
  bestPractices: ['Declare tokens primitivos em §@theme§ e semânticos com §@theme inline§ apontando para variáveis por tema.', 'Use §@utility§ para utilitários que precisam de variantes e §@layer components§ com moderação.', 'Configure §@source§ para bibliotecas internas e §@source inline§ para classes de conteúdo dinâmico.', 'Mantenha o CSS de entrada pequeno e mova a lógica visual para componentes.', 'Rode a ferramenta de migração em uma branch e revise o resultado.', 'Documente os tokens e os namespaces usados.'],
  mistakes: ['Esperar que variáveis de §@theme§ mudem em execução sem §@theme inline§.', 'Colocar CSS próprio fora das camadas e vencer os utilitários por acidente.', 'Esquecer o §@source§ de bibliotecas em §node_modules§.', 'Manter dois mundos (config JS e CSS) sem necessidade.', 'Criar classes em §@layer components§ e esperar variantes automáticas.', 'Adotar o v4 sem checar o suporte de navegadores do público.'],
  market: `A migração para o Tailwind v4 e o modelo CSS-first é um tema atual em equipes de front-end; saber configurar tokens, depurar a detecção e integrar com Vite e Next é rotina em projetos com design system. Quem entende as camadas de cascata e as variáveis CSS resolve problemas de especificidade sem recorrer a §!important§.`,
  summary: `O Tailwind v4 configura-se no CSS: §@import "tailwindcss"§, §@theme§ para tokens (namespaces geram utilitários), §@theme inline§ para valores dinâmicos, §@utility§ e §@custom-variant§ para estender, §@layer§ para ordenar a cascata e §@source§ para ajustar a detecção. Só variáveis usadas são emitidas. Em relação ao v3, o §tailwind.config.js§ dá lugar ao CSS e a paleta usa oklch; use a ferramenta de upgrade e revise.`,
  refs: [REF.theme, REF.custom, REF.functions, REF.vite, REF.upgrade, REF.mdnLayer, REF.mdnCustomProps],
  cards: [
    { q: 'Como o Tailwind v4 define o tema?', a: 'Com a diretiva @theme no CSS; variáveis com namespaces (--color-*, --font-*, --breakpoint-*) geram os utilitários.' },
    { q: 'Para que serve @theme inline?', a: 'Para que o utilitário aponte direto para uma variável que muda em execução (como por tema), em vez de fixar o valor.' },
    { q: 'Por que md:cartao não funciona para uma classe em @layer components?', a: 'Só utilitários criados com @utility ganham variantes automaticamente.' },
    { q: 'Como incluir classes de uma biblioteca em node_modules?', a: 'Com @source apontando para o caminho, pois a detecção automática ignora node_modules.' }
  ]
}
];
