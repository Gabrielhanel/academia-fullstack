// C2.2 — Tailwind CSS e Design Systems. Aulas 4 a 6 (componentização, design tokens e fundamentos de um design system).
const R = String.raw;

export const REF2 = {
  reuse: { title: 'Tailwind CSS — Reusing styles', url: 'https://tailwindcss.com/docs/reusing-styles', kind: 'doc' },
  cva: { title: 'class-variance-authority (cva) — documentação', url: 'https://cva.style/docs', kind: 'doc' },
  twMerge: { title: 'tailwind-merge (repositório oficial)', url: 'https://github.com/dcastil/tailwind-merge', kind: 'doc' },
  clsx: { title: 'clsx (repositório oficial)', url: 'https://github.com/lukeed/clsx', kind: 'doc' },
  dtcg: { title: 'Design Tokens Community Group — Format Module', url: 'https://www.designtokens.org/tr/drafts/format/', kind: 'spec' },
  styleDictionary: { title: 'Style Dictionary — documentação', url: 'https://styledictionary.com/', kind: 'doc' },
  mdnCustomProps: { title: 'MDN — Propriedades personalizadas (variáveis CSS)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties', kind: 'doc' },
  wcag: { title: 'W3C — WCAG 2.2', url: 'https://www.w3.org/TR/WCAG22/', kind: 'spec' },
  apgPatterns: { title: 'W3C — ARIA Authoring Practices Guide (padrões)', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/', kind: 'doc' },
  axeCore: { title: 'axe-core — regras de acessibilidade (Deque)', url: 'https://github.com/dequelabs/axe-core', kind: 'doc' },
  radix: { title: 'Radix Primitives — Introdução', url: 'https://www.radix-ui.com/primitives/docs/overview/introduction', kind: 'doc' },
  reactAria: { title: 'React Aria — documentação', url: 'https://react-spectrum.adobe.com/react-aria/index.html', kind: 'doc' },
  mdnDialog: { title: 'MDN — elemento <dialog>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'tdw-04', moduleId: 'm2', order: 4, minutes: 65, tags: ['componentes', 'cva', 'tailwind-merge', 'variantes', '@apply'],
  title: 'Componentização com Tailwind: variantes com cva, tailwind-merge e @apply',
  objectives: ['Decidir quando extrair um componente (e não uma classe CSS) para reutilizar combinações de utilitários', 'Montar uma API de variantes com §cva§ (variantes, variantes compostas e padrões)', 'Resolver conflitos de classes com §tailwind-merge§ e compor condicionais com §clsx§ em uma função §cn()§', 'Permitir sobrescrita controlada por §className§ e repassar props nativas (§ComponentProps§)', 'Usar §@apply§ com critério e manter a acessibilidade dos componentes'],
  intro: `O maior risco do utility-first é **repetir** a mesma lista de classes em dezenas de lugares. A resposta recomendada **não** é voltar às classes CSS semânticas, e sim **componentes**: um §<Botao>§ em React concentra as classes uma vez, expõe **variantes** (§variante="perigo"§, §tamanho="sm"§) e deixa o consumidor ajustar o que for necessário. Três bibliotecas pequenas formam o "kit" usado em quase todo design system com Tailwind: **cva** (variantes), **clsx** (condicionais) e **tailwind-merge** (resolver conflitos). Todos os resultados abaixo foram **executados** (Vitest, React 19.3, cva 0.7.1, clsx 2.1.1, tailwind-merge 3.7.1).`,
  theory: `### Reutilizar: componente, não classe
Quando uma combinação de utilitários se repete (botão, cartão, campo), **extraia um componente**: um único lugar para alterar, props tipadas, acessibilidade embutida e testes. O guia do Tailwind recomenda componentes (React, Vue, parciais de template) e **só em último caso** classes CSS com §@apply§. Criar uma classe §.btn-primary§ move a repetição para outro arquivo, mas perde as **variantes** do Tailwind e o tipo das props.

### O problema dos conflitos de classes
Se um componente tem §px-4§ e o consumidor passa §className="px-2"§, qual vale? No CSS, vale a regra que aparece **depois** no arquivo gerado, não a que vem depois no atributo: o resultado é imprevisível. A solução é **mesclar** as classes entendendo o Tailwind: **tailwind-merge** mantém **a última** de cada grupo conflitante. Medido:
- §twMerge('p-2 p-4', 'text-sm text-lg', 'bg-red-500 bg-blue-500')§ → §p-4 text-lg bg-blue-500§;
- variantes diferentes **não** conflitam: §twMerge('hover:bg-red-500 bg-blue-500 md:p-2 p-4')§ manteve todas;
- a **ordem** importa: §cn('px-2 py-1', 'px-4')§ → §py-1 px-4§ (o §px-4§ do consumidor venceu), enquanto §cn('px-4', 'px-2 py-1')§ → §px-2 py-1§;
- **classes próprias** que o tailwind-merge não conhece (§btn-primary btn-secondary§) **não** são mescladas (ficam as duas).
**clsx** monta a string a partir de condicionais: §clsx('a', false && 'b', { c: true, d: 0 }, ['e', null, 'f'])§ → §a c e f§ (descarta falsos, §null§ e chaves de objetos com valor falso). A função utilitária clássica:
§§§ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...entradas: ClassValue[]) => twMerge(clsx(entradas));
§§§

### Variantes com cva
**class-variance-authority** declara a **base**, as **variantes**, as **variantes compostas** e os **padrões**, e devolve uma função que gera a string de classes:
§§§ts
const botao = cva('inline-flex items-center rounded-md font-medium focus-visible:outline-2 disabled:opacity-50', {
  variants: {
    variante: { primario: 'bg-marca-600 text-white', perigo: 'bg-red-600 text-white', fantasma: 'bg-transparent' },
    tamanho: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' }
  },
  compoundVariants: [{ variante: 'perigo', tamanho: 'sm', class: 'uppercase' }],
  defaultVariants: { variante: 'primario', tamanho: 'md' }
});
§§§
Resultados medidos: §botao()§ aplicou os **padrões** (§bg-marca-600 text-white h-10 px-4§); §botao({ variante: 'perigo', tamanho: 'sm' })§ aplicou a variante composta (§uppercase§). Um valor **inválido** (§variante: 'xyz'§, ignorado em tempo de execução) **não** gerou nenhuma classe de cor: falha **silenciosa**; por isso a tipagem (§VariantProps§) é essencial.

### Um componente completo
§§§tsx
type BotaoProps = ComponentProps<'button'> & VariantProps<typeof botao>;
export function Botao({ variante, tamanho, className, ...resto }: BotaoProps) {
  return <button className={cn(botao({ variante, tamanho }), className)} {...resto} />;
}
§§§
- **§ComponentProps<'button'>§** herda **todas** as props nativas (§onClick§, §disabled§, §type§, §aria-*§);
- **§className§ do consumidor vem por último** em §cn§, então vence a base: no teste, §<Botao className="h-12">§ trocou §h-10§ por §h-12§ e manteve o resto;
- **§VariantProps§** deriva os tipos das variantes: erros de digitação viram erro de compilação;
- **§ref§** é prop comum no React 19 (aula do C2.1); em versões antigas use §forwardRef§.
Regras: **defina padrões**, **não exponha classes internas demais** (o consumidor só deve precisar de §className§ em exceções), **use tokens semânticos** nas classes (§bg-acao§, não §bg-blue-600§) e **teste** as combinações.

### @apply: quando (e quando não)
§@apply§ copia utilitários para uma regra CSS: §.cartao { @apply rounded-lg border p-4; }§. Serve para **estilizar HTML que você não controla** (conteúdo de CMS, Markdown renderizado) e para CSS de bibliotecas de terceiros. **Evite** como padrão: perde o nome local, o IntelliSense contextual, as variantes automáticas (aula 3) e traz de volta a "caça" de CSS. No v4, dentro de arquivos CSS separados, use §@reference "estilos.css"§ para acessar o tema.

### Acessibilidade nos componentes
Um componente de DS carrega a **responsabilidade de acessibilidade**: elemento nativo correto (§<button>§, não §<div onClick>§), foco visível, estados §disabled§ e §aria-disabled§, rótulo acessível (texto ou §aria-label§), alvo de toque adequado, §type="button"§ por padrão em botões dentro de formulários. Teste com **axe-core** (aula 6) e com o teclado.

### Composição de componentes maiores
Cartões, listas e formulários combinam componentes pequenos (Botao, Campo, Icone). Prefira **composição** (§children§, slots, componentes compostos, aula do React avançado) a props de configuração gigantes, e **extraia** partes só quando o uso se repetir (três vezes).

### Manutenção
Ordene as classes com o **plugin do Prettier**; use o **linter** para detectar conflitos e nomes inexistentes; mantenha as variantes em **um arquivo por componente**; documente no Storybook (aula 8).`,
  concepts: [
    { term: 'cva', def: 'class-variance-authority: biblioteca que declara variantes de classes e devolve uma função geradora.' },
    { term: 'tailwind-merge', def: 'Biblioteca que mescla classes do Tailwind mantendo a última de cada grupo conflitante.' },
    { term: 'clsx', def: 'Biblioteca que monta strings de classes a partir de valores condicionais.' },
    { term: 'cn()', def: 'Função utilitária que combina clsx e tailwind-merge.' },
    { term: 'Variante composta', def: 'Combinação de valores de variantes que aplica classes adicionais (compoundVariants).' },
    { term: 'VariantProps', def: 'Tipo do cva que extrai das variantes os tipos das props do componente.' },
    { term: '@apply', def: 'Diretiva que copia utilitários para uma regra CSS.' },
    { term: 'ComponentProps', def: 'Tipo do React que reúne as props de um elemento nativo.' },
    { term: 'Sobrescrita por className', def: 'Permitir que o consumidor ajuste estilos passando className, com conflitos resolvidos por mesclagem.' }
  ],
  examples: R`**Analogia:** o §cva§ é o **cardápio de um restaurante com combos** ("prato + tamanho + bebida"); o §tailwind-merge§ é o **garçom que corrige pedidos contraditórios** ("dois tamanhos de prato? fica o último"); o §clsx§ é a **comanda**, que só anota o que foi pedido de fato.

**Resultados medidos (Vitest, React 19.3):**
§§§
twMerge('p-2 p-4', 'text-sm text-lg', 'bg-red-500 bg-blue-500')  -> p-4 text-lg bg-blue-500
cn('px-2 py-1', 'px-4')  -> py-1 px-4        cn('px-4', 'px-2 py-1')  -> px-2 py-1
clsx('a', false && 'b', { c: true, d: 0 }, ['e', null, 'f'])   -> a c e f
botao()  -> ...base... bg-marca-600 text-white h-10 px-4
botao({ variante: 'perigo', tamanho: 'sm' }) -> ...bg-red-600 text-white h-8 px-3 text-sm uppercase
<Botao className="h-12"> -> ...bg-marca-600 text-white px-4 h-12      (h-10 foi substituída)
botao({ variante: 'xyz' }) -> sem classes de cor (falha silenciosa)
§§§

**Caso real:** um projeto tinha 47 botões com combinações ligeiramente diferentes de classes e três tons de azul. Ao extrair um §<Botao>§ com §cva§ (4 variantes, 3 tamanhos) e tokens semânticos, o número de combinações caiu para 12 casos documentados, uma mudança de marca passou a ser feita em um arquivo e os testes de acessibilidade (foco, estados) passaram a valer para todos os botões.`,
  code: [
    { title: 'cn() e Botao com cva (executado com cva 0.7.1, clsx 2.1.1, tailwind-merge 3.7.1 e React 19.3)', lang: 'tsx', code: R`import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ComponentProps } from 'react';

export const cn = (...entradas: ClassValue[]) => twMerge(clsx(entradas));

const botao = cva('inline-flex items-center rounded-md font-medium focus-visible:outline-2 disabled:opacity-50', {
  variants: {
    variante: { primario: 'bg-marca-600 text-white', perigo: 'bg-red-600 text-white', fantasma: 'bg-transparent' },
    tamanho: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' }
  },
  compoundVariants: [{ variante: 'perigo', tamanho: 'sm', class: 'uppercase' }],
  defaultVariants: { variante: 'primario', tamanho: 'md' }
});

type BotaoProps = ComponentProps<'button'> & VariantProps<typeof botao>;
export function Botao({ variante, tamanho, className, ...resto }: BotaoProps) {
  return <button type="button" className={cn(botao({ variante, tamanho }), className)} {...resto} />;
}
// <Botao className="h-12">x</Botao>  ->  h-10 é substituída por h-12`, notes: [{ l: '6', t: 'cn combina condicionais (clsx) e resolve conflitos (twMerge).' }, { l: '14', t: 'compoundVariants aplica classes extras para combinações específicas.' }, { l: '17', t: 'ComponentProps herda as props nativas; VariantProps tipa as variantes.' }, { l: '19', t: 'O className do consumidor entra por último e vence conflitos.' }, { l: '19', t: 'type="button" evita envio acidental de formulários; o spread depois permite sobrescrever.' }] },
    { title: 'Mapa de variantes para evitar classes dinâmicas (padrão sem cva)', lang: 'tsx', code: R`const estilos = {
  ok: 'bg-green-100 text-green-900',
  atencao: 'bg-amber-100 text-amber-900',
  erro: 'bg-red-100 text-red-900'
} as const;

type Status = keyof typeof estilos;

export function Selo({ status, children }: { status: Status; children: React.ReactNode }) {
  return <span className={'rounded px-2 py-0.5 text-xs font-medium ' + estilos[status]}>{children}</span>;
}
// Os nomes aparecem completos no código: o Tailwind os encontra. Com bg-DOLAR{cor}-100 eles não seriam gerados.`, notes: [{ l: '1', t: 'Mapa com nomes completos: seguro para a detecção de classes.' }, { l: '7', t: 'O tipo Status vem das chaves do mapa: valores inválidos não compilam.' }, { l: '11', t: 'Lembrete da aula 1 sobre classes montadas dinamicamente.' }] }
  ],
  bestPractices: ['Extraia componentes, não classes, para reutilizar combinações de utilitários.', 'Declare variantes com §cva§ e derive as props com §VariantProps§.', 'Use §cn()§ e deixe o §className§ do consumidor por último.', 'Herde as props nativas com §ComponentProps§ e repasse §...resto§.', 'Use tokens semânticos nas classes dos componentes.', 'Reserve §@apply§ para estilizar HTML que você não controla.'],
  mistakes: ['Concatenar classes com §+§ sem resolver conflitos.', 'Esperar que o §className§ do consumidor sempre vença sem §twMerge§.', 'Aceitar valores de variante não tipados e falhar em silêncio.', 'Usar §<div onClick>§ em vez de §<button>§.', 'Montar nomes de classe dinamicamente.', 'Criar classes §.btn-*§ com §@apply§ para tudo.'],
  market: `O trio cva, clsx e tailwind-merge está na base de bibliotecas populares de componentes com Tailwind (como a coleção shadcn/ui), e saber montar uma API de variantes tipada é pergunta frequente em testes de front-end e em vagas de design system.`,
  summary: `Reutilize com componentes, não com classes CSS. §tailwind-merge§ resolve conflitos (a última classe de cada grupo vence; variantes diferentes não conflitam), §clsx§ monta condicionais e §cn()§ junta ambos. §cva§ declara base, variantes, variantes compostas e padrões; §VariantProps§ tipa as props. O §className§ do consumidor entra por último e as props nativas vêm de §ComponentProps§. Use §@apply§ com moderação e cuide da acessibilidade no próprio componente.`,
  refs: [REF2.reuse, REF2.cva, REF2.twMerge, REF2.clsx],
  cards: [
    { q: 'Para que serve o tailwind-merge?', a: 'Para mesclar classes do Tailwind mantendo a última de cada grupo conflitante, de modo que o className do consumidor possa sobrescrever a base.' },
    { q: 'O que o cva declara?', a: 'A base, as variantes, as variantes compostas e os valores padrão de um componente, devolvendo uma função que gera as classes.' },
    { q: 'Por que não usar @apply como padrão?', a: 'Perde variantes automáticas, nomes locais e o IntelliSense contextual, e reintroduz a manutenção de classes CSS separadas.' },
    { q: 'O que ComponentProps<\'button\'> traz?', a: 'Todas as props nativas de um botão (onClick, disabled, type, aria-*), tipadas.' }
  ]
},
{
  id: 'tdw-05', moduleId: 'm2', order: 5, minutes: 60, tags: ['design tokens', 'variáveis CSS', 'temas', 'Style Dictionary', 'DTCG'],
  title: 'Design tokens: camadas, variáveis CSS, temas e formato DTCG',
  objectives: ['Definir design tokens e organizá-los em camadas (primitivos, semânticos e de componente)', 'Mapear tokens para variáveis CSS e para o §@theme§ do Tailwind', 'Implementar temas (claro e escuro) trocando apenas os tokens semânticos', 'Gerar variáveis CSS a partir de arquivos de tokens no formato DTCG com o Style Dictionary', 'Aplicar convenções de nomes e critérios de contraste e de escala'],
  intro: `**Design tokens** são as **decisões de design em forma de dados**: cores, espaçamentos, tipografia, raios, sombras, durações. Em vez de espalhar §#0b5fff§ por 300 arquivos, define-se **um nome** (§cor.acao.fundo§) que aponta para um valor e é consumido por código, design e documentação. Tokens permitem **temas** (claro, escuro, marcas diferentes) sem mexer em componentes e são a **ponte** entre ferramentas de design e código. Esta aula usa o **Style Dictionary 5.8** (formato DTCG) para gerar variáveis CSS, **executado** no laboratório.`,
  theory: `### O que é um token (e o que não é)
Um token é um **par nome-valor com significado**: §cor.acao.fundo = #0847c4§. Não é "uma variável CSS qualquer": tem **nome padronizado**, **tipo** (cor, dimensão, duração), **descrição** e, idealmente, vive **em uma fonte única** (arquivo JSON) da qual se **geram** os artefatos para cada plataforma (CSS, Tailwind, iOS, Android). Benefícios: consistência, mudanças de marca em um lugar, temas e **documentação viva**.

### Três camadas
| Camada | Pergunta | Exemplo | Quem usa |
|---|---|---|---|
| **Primitivos** (globais/de referência) | "quais valores existem?" | §cor.primitivo.azul.600 = #0847c4§, §espaco.2 = 8px§ | só outros tokens |
| **Semânticos** (de função/de alias) | "para que serve?" | §cor.semantico.acao.fundo → {cor.primitivo.azul.600}§ | componentes e telas |
| **De componente** | "como este componente usa?" | §botao.fundo → {cor.semantico.acao.fundo}§ | um componente |
Regra de ouro: **componentes consomem tokens semânticos, nunca primitivos**. Assim, trocar o tema significa **apontar o mesmo nome semântico para outro primitivo**, sem alterar nenhum componente. A camada de componente é opcional e útil quando um componente precisa de exceções.

### Convenções de nome
Hierarquia do geral para o específico (§categoria.tipo.item.estado§): §cor.texto.padrao§, §cor.texto.suave§, §cor.borda.foco§, §espaco.4§. Nomes descrevem **função** e não **valor** (evite §azul-claro§ no semântico; use §acao-fundo§, §fundo-suave§). Escalas numéricas (§50...900§ para cores, múltiplos de 4 px para espaço) facilitam previsibilidade. Documente a **intenção** de cada token.

### Formato DTCG
O **Design Tokens Community Group** define um formato JSON padrão (em rascunho; ferramentas como Style Dictionary 5, Figma e Tokens Studio o suportam): cada token tem **§$value§** e **§$type§**, referências usam chaves §"{cor.primitivo.azul.600}"§ e grupos podem ter §$description§.
§§§json
{ "cor": { "primitivo": { "azul": { "600": { "$value": "#0847c4", "$type": "color" } }, "branco": { "$value": "#ffffff", "$type": "color" } },
    "semantico": { "acao": { "fundo": { "$value": "{cor.primitivo.azul.600}", "$type": "color" } } } } }
§§§
Como o formato ainda evolui, **fixe a versão** da ferramenta e valide a saída.

### Gerando variáveis CSS
Com o **Style Dictionary** (§transformGroup: 'css'§, formato §css/variables§), o JSON acima virou (executado):
§§§css
:root {
  --cor-primitivo-azul-600: #0847c4;
  --cor-semantico-acao-fundo: #0847c4;   /* resolvido: copiou o valor */
  --espaco-1: 4px;
}
§§§
Por padrão, as **referências são resolvidas** (o semântico repete o valor). Com a opção **§outputReferences: true§**, a saída preserva a ligação: §--cor-semantico-acao-fundo: var(--cor-primitivo-azul-600);§. Isso é o que permite trocar o tema **só no semântico**.

### Temas: claro e escuro
Defina os primitivos **uma vez** e **redefina somente os semânticos** por tema. No teste, um segundo arquivo de tokens (§escuro.json§) gerou, com seletor §.dark§:
§§§css
.dark {
  --cor-semantico-acao-fundo: var(--cor-primitivo-azul-500);
  --cor-semantico-texto-padrao: var(--cor-primitivo-branco);
}
§§§
Os componentes usam §var(--cor-semantico-acao-fundo)§ (ou, no Tailwind, §bg-acao-fundo§) e **não sabem** em que tema estão. Outras dimensões de tema: **marcas** (white label), **densidade** (compacto/confortável), **alto contraste**. Cada eixo é um conjunto de sobrescritas de tokens.

### Ligando ao Tailwind v4
Com §@theme inline§ (aula 3), os tokens semânticos viram utilitários que apontam para as variáveis do tema atual:
§§§css
@theme inline {
  --color-acao-fundo: var(--cor-semantico-acao-fundo);
  --color-texto: var(--cor-semantico-texto-padrao);
}
§§§
Resultado: §bg-acao-fundo§ e §text-texto§ **seguem o tema** sem §dark:§ em cada elemento. Primitivos podem ir para o §@theme§ normal, e variáveis dinâmicas ficam em §:root§/§.dark§.

### Acessibilidade dos tokens
- **Contraste** é uma propriedade de **pares** (texto × fundo): valide cada par semântico (texto normal 4,5:1; texto grande e componentes de interface 3:1, WCAG 2.2 AA) **em cada tema**; automatize com testes que calculam a razão de contraste a partir dos tokens;
- **Estados de foco** têm token próprio (§cor.borda.foco§), com contraste contra o fundo e contra o elemento;
- **Escala tipográfica** em §rem§ (respeita o zoom do usuário);
- **Movimento**: tokens de duração e um token "reduzido" para §prefers-reduced-motion§.

### Governança dos tokens
Um token novo é um **compromisso**: pergunte se já existe um equivalente, nomeie pela função, documente e versione (aula 9). **Remover** ou **renomear** é mudança incompatível: use **depreciação** com período de transição. Evite "tokens para tudo" (explosão): prefira poucos e bem pensados.

### Pipeline típico
Design (Figma variables / Tokens Studio) → exporta JSON DTCG → **Style Dictionary** → CSS, TypeScript, Tailwind, iOS e Android → pacote versionado → aplicações. Um **teste** valida contraste e referências quebradas a cada mudança.`,
  concepts: [
    { term: 'Design token', def: 'Decisão de design com nome, tipo e valor, usada como fonte única por design e código.' },
    { term: 'Token primitivo', def: 'Valor bruto de uma escala (cor azul 600, espaço 8 px), usado só por outros tokens.' },
    { term: 'Token semântico', def: 'Token nomeado pela função (cor da ação, texto padrão) que aponta para um primitivo.' },
    { term: 'Token de componente', def: 'Token específico de um componente que referencia tokens semânticos.' },
    { term: 'DTCG', def: 'Design Tokens Community Group: formato JSON padrão para tokens ($value, $type, referências).' },
    { term: 'Style Dictionary', def: 'Ferramenta que transforma arquivos de tokens em artefatos para várias plataformas.' },
    { term: 'outputReferences', def: 'Opção do Style Dictionary que preserva as referências entre tokens (var(--...)) na saída.' },
    { term: 'Tema', def: 'Conjunto de valores dos tokens semânticos (claro, escuro, marca) aplicado sem alterar componentes.' },
    { term: 'Razão de contraste', def: 'Relação entre as luminâncias de texto e fundo usada para avaliar a legibilidade (WCAG).' }
  ],
  examples: R`**Analogia:** os primitivos são as **tintas da fábrica** (azul 500, azul 600, branco); os tokens semânticos são as **etiquetas nas paredes** ("cor de ação", "cor do texto"); os componentes são os **pintores** que obedecem às etiquetas. Para pintar o prédio no modo noturno, troca-se **o que a etiqueta aponta**; nenhum pintor precisa ser retreinado.

**Executado com Style Dictionary 5.8 (formato DTCG):**
§§§
--cor-primitivo-azul-600: #0847c4;
--cor-semantico-acao-fundo: #0847c4;                       (referência resolvida, padrão)
--cor-semantico-acao-fundo: var(--cor-primitivo-azul-600);  (com outputReferences: true)

.dark {
  --cor-semantico-acao-fundo: var(--cor-primitivo-azul-500);
  --cor-semantico-texto-padrao: var(--cor-primitivo-branco);
}
§§§

**Caso real:** uma empresa lançou uma segunda marca reutilizando todos os componentes. Como os componentes só usavam tokens semânticos, bastou um arquivo novo de sobrescritas de primitivos e semânticos (cores, tipografia e raio); nenhuma linha de componente mudou. Antes dos tokens, a tentativa anterior de "tema" exigira alterar 140 arquivos.`,
  code: [
    { title: 'Tokens DTCG em camadas e geração de variáveis CSS (executado com Style Dictionary 5.8)', lang: 'javascript', code: R`import StyleDictionary from 'style-dictionary';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

mkdirSync('tokens', { recursive: true });
const tokens = {
  cor: {
    primitivo: {
      azul: { 500: { $value: '#0b5fff', $type: 'color' }, 600: { $value: '#0847c4', $type: 'color' } },
      branco: { $value: '#ffffff', $type: 'color' },
      cinza: { 900: { $value: '#111827', $type: 'color' } }
    },
    semantico: {
      acao: { fundo: { $value: '{cor.primitivo.azul.600}', $type: 'color' }, texto: { $value: '{cor.primitivo.branco}', $type: 'color' } },
      texto: { padrao: { $value: '{cor.primitivo.cinza.900}', $type: 'color' } }
    }
  },
  espaco: { 1: { $value: '4px', $type: 'dimension' }, 2: { $value: '8px', $type: 'dimension' } }
};
writeFileSync('tokens/base.json', JSON.stringify(tokens, null, 1));

const sd = new StyleDictionary({
  source: ['tokens/base.json'],
  platforms: { css: { transformGroup: 'css', buildPath: 'build/', files: [{ destination: 'tokens.css', format: 'css/variables', options: { outputReferences: true } }] } },
  log: { verbosity: 'silent' }
});
await sd.buildAllPlatforms();
console.log(readFileSync('build/tokens.css', 'utf8'));`, notes: [{ l: '6', t: 'Primitivos: valores brutos da escala, com $value e $type do formato DTCG.' }, { l: '11', t: 'Semânticos: aliases entre chaves apontando para primitivos.' }, { l: '24', t: 'outputReferences preserva a ligação como var(--...) na saída.' }, { l: '28', t: 'Sem outputReferences, os valores seriam resolvidos e copiados.' }] },
    { title: 'Tema escuro redefinindo só os tokens semânticos e ligação com o Tailwind (CSS)', lang: 'css', code: R`/* build/tokens.css (gerado) */
:root {
  --cor-primitivo-azul-500: #0b5fff;
  --cor-primitivo-azul-600: #0847c4;
  --cor-semantico-acao-fundo: var(--cor-primitivo-azul-600);
  --cor-semantico-texto-padrao: var(--cor-primitivo-cinza-900);
}
/* build/escuro.css (gerado com selector ".dark") */
.dark {
  --cor-semantico-acao-fundo: var(--cor-primitivo-azul-500);
  --cor-semantico-texto-padrao: var(--cor-primitivo-branco);
}

/* estilos.css */
@import "tailwindcss";
@theme inline {
  --color-acao-fundo: var(--cor-semantico-acao-fundo);
  --color-texto: var(--cor-semantico-texto-padrao);
}
/* Componentes: bg-acao-fundo text-texto  (sem dark: em cada elemento) */`, notes: [{ l: '3', t: 'Primitivos ficam fixos; só os semânticos mudam por tema.' }, { l: '9', t: 'O seletor .dark sobrescreve os semânticos quando a classe está no html.' }, { l: '17', t: 'O @theme inline cria utilitários que seguem o tema atual.' }] }
  ],
  bestPractices: ['Organize tokens em camadas e faça componentes consumirem apenas tokens semânticos.', 'Nomeie pela função (§acao-fundo§), não pelo valor (§azul-claro§).', 'Gere os artefatos a partir de uma fonte única e fixe as versões das ferramentas.', 'Troque temas redefinindo somente os tokens semânticos.', 'Teste o contraste dos pares texto e fundo em todos os temas.', 'Versione tokens e deprecie antes de remover ou renomear.'],
  mistakes: ['Usar cores primitivas direto nos componentes.', 'Criar um token para cada valor isolado (explosão de tokens).', 'Nomear tokens pelo valor ou pela aparência.', 'Copiar valores em vez de referenciar (perde a troca de tema).', 'Ignorar o contraste no tema escuro.', 'Alterar um token publicado sem aviso nem versão.'],
  market: `Design tokens são a ponte entre design e engenharia em equipes com design system, e ferramentas como Figma Variables, Tokens Studio e Style Dictionary se tornaram padrão. Entender camadas, temas e o formato DTCG é diferencial para vagas de front-end com foco em plataforma e em design systems.`,
  summary: `Tokens são decisões de design com nome, tipo e valor, vindas de uma fonte única. Organize em primitivos, semânticos e de componente; componentes usam só os semânticos. O formato DTCG padroniza §$value§ e §$type§; o Style Dictionary gera variáveis CSS (com §outputReferences§ preservando as referências). Temas redefinem os semânticos; §@theme inline§ liga as variáveis ao Tailwind. Valide contraste e versione as mudanças.`,
  refs: [REF2.dtcg, REF2.styleDictionary, REF2.mdnCustomProps, REF2.wcag],
  cards: [
    { q: 'Quais são as três camadas de tokens?', a: 'Primitivos (valores brutos), semânticos (função, apontando para primitivos) e de componente.' },
    { q: 'Por que componentes devem usar só tokens semânticos?', a: 'Para o tema mudar redefinindo os semânticos, sem alterar nenhum componente.' },
    { q: 'O que o outputReferences faz no Style Dictionary?', a: 'Preserva as referências como var(--...) na saída em vez de copiar os valores resolvidos.' },
    { q: 'Que campos o formato DTCG usa em um token?', a: '$value e $type (e referências entre chaves, como {cor.primitivo.azul.600}).' }
  ]
},
{
  id: 'tdw-06', moduleId: 'm3', order: 6, minutes: 70, tags: ['design system', 'acessibilidade', 'headless', 'axe', 'API de componentes'],
  title: 'Fundamentos de um Design System: princípios, API de componentes, acessibilidade e headless',
  objectives: ['Definir o que é (e o que não é) um design system e seus três pilares: princípios/design, código e documentação', 'Projetar a API de um componente (props, variantes, composição, controlado e não controlado) com poucas decisões irreversíveis', 'Aplicar acessibilidade desde o início: semântica, teclado, foco, ARIA e verificação automatizada com axe-core', 'Decidir entre construir componentes do zero, usar primitivos headless (Radix, React Aria) ou adotar uma biblioteca pronta', 'Escolher o conjunto inicial de componentes e a ordem de construção'],
  intro: `Um **design system (DS)** não é uma biblioteca de botões: é um **produto interno** que reúne **princípios e padrões de design**, **componentes de código reutilizáveis** e **documentação**, mantido por pessoas e com processo. Quando bem feito, equipes entregam mais rápido e com **consistência e acessibilidade** por padrão; quando mal feito, vira uma biblioteca abandonada que ninguém usa. Esta aula define os fundamentos, mostra a verificação de acessibilidade **executada** com axe-core e discute a decisão **construir × adotar**.`,
  theory: `### O que é um design system
Três pilares que se sustentam:
1. **Design**: princípios, tom de voz, cor, tipografia, espaçamento, ícones, padrões de interação (tokens, aula 5);
2. **Código**: componentes acessíveis, testados e versionados, que implementam os padrões;
3. **Documentação e governança**: como usar, quando usar, exemplos (Storybook, aula 8), regras de contribuição e evolução (aula 9).
**Não é:** um "kit de UI" copiado de uma biblioteca sem adaptação, uma pasta §components/§ sem dono, nem um projeto com data de término. **Para quem:** designers, desenvolvedores, QA, produto e conteúdo. **Resultado:** velocidade, consistência, qualidade e acessibilidade em escala.

### Quando um DS compensa
Quando há **vários produtos ou equipes** repetindo as mesmas decisões, necessidade de **identidade consistente** e **requisitos de acessibilidade** que se quer resolver uma vez. Em produtos pequenos, uma biblioteca de código aberto bem escolhida e tokens próprios podem bastar. O custo de manter um DS é contínuo: pessoas, suporte, versões.

### Princípios de design de componentes
- **Poucas decisões irreversíveis**: comece simples; adicionar é fácil, remover é incompatível;
- **Composição antes de configuração** (aula 3 do C2.1): §children§ e componentes compostos em vez de dezenas de props;
- **Padrões razoáveis**: o componente funciona bem sem nenhuma prop opcional;
- **Controlado e não controlado**: campos e disclosures aceitam §value§/§onChange§ **e** §defaultValue§;
- **Estados explícitos**: padrão, hover, foco, ativo, desabilitado, carregando, erro, vazio;
- **Tokens semânticos** nas classes (aula 5); **tema** sem alterar componentes;
- **API estável e tipada**: props em português ou inglês, mas **consistentes** (§variante§, §tamanho§, §aoMudar§/§onChange§);
- **Escape hatch controlado**: §className§ e §...resto§ para exceções.

### Acessibilidade primeiro
Acessibilidade no DS é **multiplicadora**: um botão correto vale para todos os produtos. Checklist por componente:
1. **Elemento nativo certo** (§<button>§, §<a>§, §<input>§, §<dialog>§): ganha teclado, foco e semântica de graça;
2. **Teclado completo** (Tab, Shift+Tab, Enter, Espaço, setas, Esc), seguindo os **padrões do ARIA Authoring Practices** (tabs, menu, combobox, dialog...);
3. **Foco gerenciado**: visível sempre; em diálogos, foco entra, fica **preso** e **volta** ao disparador; Esc fecha;
4. **Nome acessível** (texto, §aria-label§, §aria-labelledby§) e **estado** (§aria-expanded§, §aria-selected§, §aria-invalid§);
5. **Contraste** e tamanho de alvo; **movimento reduzido**; **zoom** 200 %;
6. **Anúncios** de mudanças (§aria-live§, §role="status"§/§"alert"§).
**Verificação automatizada** (executada): o **axe-core 4.14** analisou o DOM renderizado. Um bom formulário (§<label htmlFor>§ + §<input>§ + botão com texto) teve **0 violações**; um ruim (§<input />§ sem rótulo, §<button>§ sem texto, §<img>§ sem §alt§) teve **3**: §button-name§, §image-alt§ e §label§. Ferramentas automáticas detectam **apenas parte** dos problemas (as que dependem de julgamento, como a ordem do foco e a clareza dos rótulos, ficam de fora); o **teste manual** (teclado, leitor de tela) é indispensável.
**Diálogo:** no teste, um §div role="dialog"§ **sem foco** não recebeu o §Esc§ (§Esc fecha: false§); com §tabIndex={-1}§ e foco movido ao abrir, o §Esc§ funcionou. Hoje o elemento nativo **§<dialog>§** com §showModal()§ resolve foco, camada superior e Esc; prefira-o quando possível.

### Headless: lógica e acessibilidade sem estilo
Bibliotecas **headless** (Radix Primitives, React Aria, Headless UI, Ark UI, Base UI) entregam **comportamento e acessibilidade** (diálogo, menu, combobox, tabs) **sem estilos**; você aplica seu visual com Tailwind e tokens. Elas resolvem a parte **mais difícil** (teclado, foco, ARIA) e deixam o visual livre. Bibliotecas **estilizadas** (MUI, Chakra, Ant) são mais rápidas para começar, mas pedem **sobrescrita** para a sua marca. Coleções que **copiam o código para o seu repositório** (como shadcn/ui) combinam primitivos headless com Tailwind, e **você passa a mantê-lo**.
| Opção | Velocidade inicial | Controle visual | Acessibilidade | Manutenção |
|---|---|---|---|---|
| Do zero | baixa | total | você garante | toda sua |
| Headless + Tailwind | média | total | boa (da biblioteca) | sua UI, a lógica é da biblioteca |
| Biblioteca estilizada | alta | limitado | boa, varia | atualizações da biblioteca |
Critérios de decisão: **orçamento e prazo**, **necessidade de marca própria**, **requisitos de acessibilidade**, **equipe** e **licença/suporte**.

### Quais componentes primeiro
Comece pelo que é **usado em toda parte** e é **difícil de acertar**: **Button**, **Input/Field** (com rótulo e erro), **Select**, **Checkbox/Radio**, **Dialog**, **Tabs**, **Toast**, **Tooltip/Popover**, **Menu**, **Tabela** e **Link**. Para cada um: contrato (props), estados, acessibilidade, testes e exemplos. Meça **adoção** antes de investir em componentes raros.

### Estrutura de um pacote
Um repositório com **tokens**, **componentes** (um diretório por componente: código, testes, histórias e documentação), **temas** e **utilitários**. O consumo é por pacote versionado (aula 7). Padronize: nome, API, testes (render, teclado, axe), histórias.

### Armadilhas
- **DS "big bang"**: construir tudo antes de usar. Prefira iterar com um produto real;
- **Componentes sem dono** e sem processo de contribuição;
- **Pixel-perfect sem acessibilidade**;
- **Variantes demais**: cada variante é uma promessa de manutenção;
- **Divergência entre design e código** sem sincronização (tokens como fonte única);
- **Sem métricas**: não saber quem usa o quê.`,
  concepts: [
    { term: 'Design system', def: 'Produto interno que reúne princípios de design, componentes de código e documentação, com governança.' },
    { term: 'Componente headless', def: 'Componente que entrega comportamento e acessibilidade sem estilos visuais.' },
    { term: 'API de componente', def: 'Conjunto de props, variantes e eventos que formam o contrato de uso do componente.' },
    { term: 'Controlado e não controlado', def: 'Modos em que o estado de um componente é gerenciado por quem o usa ou por ele mesmo.' },
    { term: 'ARIA Authoring Practices', def: 'Guia do W3C com padrões de interação e atributos ARIA para widgets como tabs e diálogos.' },
    { term: 'axe-core', def: 'Motor de verificação automática de acessibilidade que analisa o DOM.' },
    { term: 'Gerenciamento de foco', def: 'Controle de para onde vai o foco do teclado ao abrir, fechar e navegar em componentes.' },
    { term: 'Escape hatch', def: 'Mecanismo (como className ou ...resto) que permite exceções sem quebrar a API do componente.' },
    { term: 'Nome acessível', def: 'Texto que tecnologias assistivas usam para identificar um controle.' }
  ],
  examples: R`**Analogia:** o design system é uma **cozinha profissional padronizada**: facas, panelas e receitas básicas (componentes e tokens) são as mesmas para todos os cozinheiros; o chef (produto) cria pratos novos sem reinventar a faca. Os componentes headless são as **facas de qualidade industrial**; o cabo (estilo) é você quem escolhe.

**Resultados medidos (axe-core 4.14.1 e Testing Library, jsdom):**
§§§
Formulário correto (label + input + botão com texto):    0 violações
<input /> sem rótulo, <button></button>, <img src="x" />: button-name, image-alt, label
<div role="dialog"> sem foco, Esc:                        não fecha
com tabIndex={-1} e foco ao abrir, Esc:                   fecha
§§§

**Caso real:** uma empresa tinha quatro produtos com quatro implementações de diálogo, três delas sem preso de foco e uma que fechava com cliques fora e perdia dados. Um único componente de diálogo no DS, baseado em primitivos headless e testado com axe e com o teclado, substituiu os quatro e resolveu o problema de acessibilidade de uma vez, com a equipe de QA passando a validar um só comportamento.`,
  code: [
    { title: 'Verificação de acessibilidade com axe-core nos testes (executado com axe-core 4.14.1)', lang: 'tsx', code: R`import axe from 'axe-core';
import { render } from '@testing-library/react';

test('formulário correto não tem violações', async () => {
  const { container } = render(
    <main>
      <label htmlFor="e">E-mail</label>
      <input id="e" />
      <button type="button">Salvar</button>
    </main>
  );
  const r = await axe.run(container);
  expect(r.violations).toHaveLength(0);                       // 0 violações
});

test('formulário ruim é detectado', async () => {
  const { container } = render(<main><input /><button></button><img src="x" /></main>);
  const r = await axe.run(container);
  console.log(r.violations.map((v) => v.id).sort().join(','));  // button-name,image-alt,label
});`, notes: [{ l: '5', t: 'axe.run analisa o DOM renderizado e devolve as violações.' }, { l: '14', t: 'O teste automatizado não substitui teclado e leitor de tela.' }, { l: '18', t: 'Saída observada: button-name,image-alt,label.' }] },
    { title: 'Diálogo com foco gerenciado, nome acessível e Esc (executado com Testing Library)', lang: 'tsx', code: R`import { useEffect, useId, useRef } from 'react';

export function Dialogo({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    ref.current?.focus();                          // o foco entra no diálogo
    return () => anterior?.focus();                // e volta ao disparador ao fechar
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id}
         onKeyDown={(e) => e.key === 'Escape' && aoFechar()}>
      <h2 id={id}>{titulo}</h2>
      {children}
      <button type="button" onClick={aoFechar}>Fechar</button>
    </div>
  );
}
// Prefira o elemento nativo <dialog> com showModal() quando possível.`, notes: [{ l: '7', t: 'O foco entra no diálogo ao abrir.' }, { l: '8', t: 'O cleanup devolve o foco ao elemento que abriu o diálogo.' }, { l: '12', t: 'tabIndex={-1} permite receber foco por código; sem isso o Esc não chega ao manipulador.' }, { l: '19', t: 'Este exemplo não implementa o "preso de foco" (focus trap) completo; bibliotecas headless fazem isso.' }] }
  ],
  bestPractices: ['Trate o DS como produto: dono, roadmap, versões e suporte.', 'Comece pelos componentes mais usados e difíceis de acertar e itere com um produto real.', 'Use elementos nativos e padrões do ARIA Authoring Practices e teste com teclado.', 'Considere primitivos headless para comportamento e acessibilidade.', 'Automatize axe nos testes e faça revisão manual com leitor de tela.', 'Mantenha poucas variantes e uma API estável, tipada e composável.'],
  mistakes: ['Construir o DS inteiro antes de usar em um produto.', 'Reimplementar à mão diálogos, menus e comboboxes sem teste de teclado.', 'Cobrir só o visual (pixel-perfect) e esquecer foco e leitores de tela.', 'Aceitar toda solicitação de variante nova.', 'Não ter dono nem processo de contribuição.', 'Confiar só em ferramentas automáticas de acessibilidade.'],
  market: `Equipes de design system e de plataforma de front-end estão entre as mais disputadas em empresas de produto; saber projetar APIs de componentes, garantir acessibilidade e decidir entre construir e adotar são competências de nível pleno e sênior. A acessibilidade também é exigência legal em muitos mercados.`,
  summary: `Um design system é um produto com três pilares (design, código, documentação e governança). Projete componentes com poucas decisões irreversíveis, composição, padrões razoáveis, estados explícitos, tokens semânticos e API tipada. Acessibilidade vem primeiro: elemento nativo, teclado, foco, nome e estado, contraste; axe automatiza uma parte, o teste manual completa. Primitivos headless entregam comportamento e acessibilidade; escolha construir ou adotar por prazo, marca, acessibilidade e equipe.`,
  refs: [REF2.apgPatterns, REF2.axeCore, REF2.radix, REF2.reactAria, REF2.mdnDialog, REF2.wcag],
  cards: [
    { q: 'Quais são os pilares de um design system?', a: 'Design (princípios e tokens), código (componentes) e documentação com governança.' },
    { q: 'O que são componentes headless?', a: 'Componentes que entregam comportamento e acessibilidade sem estilo visual, deixando a aparência para quem os usa.' },
    { q: 'O axe-core garante que o componente é acessível?', a: 'Não: detecta apenas parte dos problemas; teclado e leitor de tela precisam de teste manual.' },
    { q: 'Por que um div role="dialog" pode não receber a tecla Esc?', a: 'Se não recebe foco (tabIndex e foco ao abrir), o evento de teclado não chega a ele; o elemento nativo <dialog> resolve isso.' }
  ]
}
];
