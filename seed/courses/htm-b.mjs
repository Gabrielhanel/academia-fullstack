// Curso 3 — HTML, CSS e acessibilidade. Aulas 4 a 7 (CSS e acessibilidade).
import { REF } from './htm-a.mjs';
const R = String.raw;

export const lessonsB = [
{
  id: 'htm-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['css', 'seletores', 'cascata', 'especificidade'],
  title: 'CSS: seletores, cascata, herança e especificidade',
  objectives: ['Escrever seletores de tipo, classe, id, atributo, pseudo-classe e combinadores', 'Calcular a especificidade de um seletor', 'Explicar a ordem de decisão da cascata e a herança', 'Organizar CSS para evitar guerras de especificidade'],
  intro: `CSS significa *Cascading* Style Sheets: quando várias regras disputam o mesmo elemento, a **cascata** decide quem vence. Quem não entende essa regra passa horas se perguntando "por que meu estilo não pega?" e acaba usando §!important§ para tudo. Esta aula dá o mapa da decisão.`,
  theory: `### Como o CSS se liga ao HTML
Uma regra tem **seletor** e **declarações**: §seletor { propriedade: valor; }§. O CSS pode estar em um arquivo (§<link rel="stylesheet" href="estilo.css">§), em §<style>§ ou inline (§style="..."§). Prefira arquivos externos: o navegador guarda em cache e a manutenção fica mais simples.

### Seletores principais
| Seletor | Exemplo | Seleciona |
|---|---|---|
| Tipo | §p§ | todos os parágrafos |
| Classe | §.card§ | elementos com class="card" |
| Id | §#topo§ | o elemento com id="topo" |
| Atributo | §[type="email"]§ | elementos com esse atributo e valor |
| Pseudo-classe | §a:hover§, §li:nth-child(2)§ | elementos em certo estado ou posição |
| Pseudo-elemento | §p::first-line§, §.x::before§ | uma parte do elemento |
| Universal | §*§ | tudo |

**Combinadores:** espaço (§nav a§: descendente), §>§ (filho direto), §+§ (irmão seguinte imediato) e §~§ (irmãos seguintes). Vários seletores separados por vírgula compartilham a mesma regra.

### A cascata: quem vence?
Quando duas declarações conflitam para a mesma propriedade, o navegador decide por critérios, nesta ordem geral:
1. **Origem e importância:** estilos do autor vencem os padrões do navegador; declarações com §!important§ invertem a prioridade.
2. **Especificidade:** o seletor mais específico vence.
3. **Ordem no código:** em empate, a **última** declaração vence.

### Especificidade
Segundo a MDN, a especificidade é um peso de três colunas, **ID–CLASSE–TIPO**:
- cada **id** soma 1–0–0;
- cada **classe**, **atributo** ou **pseudo-classe** soma 0–1–0;
- cada **tipo** ou **pseudo-elemento** soma 0–0–1.
As colunas são comparadas da esquerda para a direita: **um id vence qualquer número de classes**, e uma classe vence qualquer número de tipos. O seletor universal, os combinadores e §:where()§ não somam. §:is()§, §:not()§ e §:has()§ não somam por si, mas assumem a especificidade do argumento mais específico. Estilos inline (§style=""§) vencem qualquer seletor; só §!important§ os supera.

Exemplos: §#menu a:hover§ = 1–1–1; §.a .b .c§ = 0–3–0; §ul li§ = 0–0–2.

### Herança
Algumas propriedades são **herdadas** dos elementos pai (como §color§, §font-family§ e §line-height§); outras não (como §margin§, §border§ e §padding§). Os valores §inherit§, §initial§ e §unset§ controlam isso explicitamente.

### Como manter o CSS sob controle
- Estilize por **classes**, evite ids e seletores profundos (§#a .b > ul li a§).
- Mantenha especificidade baixa e uniforme: assim sobrescrever vira questão de ordem.
- Evite §!important§; reserve para utilitários realmente absolutos.
- Nomeie classes pelo **papel** (§.card-produto§), não pela aparência (§.vermelho§).
- Use **variáveis CSS** (§--cor-primaria: #0b5fff;§ e §var(--cor-primaria)§) para valores repetidos.`,
  concepts: [
    { term: 'Seletor', def: 'Padrão que indica a quais elementos uma regra CSS se aplica.' },
    { term: 'Cascata', def: 'Processo que decide qual declaração vence quando várias disputam a mesma propriedade.' },
    { term: 'Especificidade', def: 'Peso do seletor em três colunas (id, classe, tipo), comparadas da esquerda para a direita.' },
    { term: 'Herança', def: 'Propagação de certos valores do elemento pai para os filhos (ex.: color).' },
    { term: 'Combinador', def: 'Símbolo que relaciona seletores: descendente, filho (>), irmão (+, ~).' },
    { term: 'Variável CSS', def: 'Propriedade personalizada (--nome) lida com var(--nome).' },
    { term: '!important', def: 'Marca uma declaração com prioridade mais alta na cascata; usar com parcimônia.' }
  ],
  examples: `**Analogia:** a cascata é um júri com três critérios. Primeiro vê quem tem autoridade (origem e !important), depois quem é mais específico ("o botão azul da barra lateral" vence "os botões") e, em empate, quem falou por último.

**Disputa:**

    p { color: black; }              /* 0-0-1 */
    .aviso { color: red; }            /* 0-1-0  → vence p */
    #topo .aviso { color: green; }    /* 1-1-0  → vence .aviso */`,
  code: [
    { title: 'Seletores e especificidade em ação', lang: 'css', code: R`:root { --cor-texto: #1a1a1a; }

body { color: var(--cor-texto); font-family: system-ui, sans-serif; }

a { color: #0b5fff; }
a:hover, a:focus-visible { text-decoration: underline; }

nav > a { margin-right: 1rem; }
.card { padding: 1rem; border: 1px solid #ccc; }
.card.destaque { border-color: #0b5fff; }
input[type="email"] { width: 100%; }`,
      notes: [ { l: '1', t: 'Variável CSS declarada no :root.' }, { l: '3', t: 'color é herdada pelos filhos do body.' }, { l: '6', t: 'Dois seletores na mesma regra; :focus-visible dá um estado de foco visível para quem navega pelo teclado.' }, { l: '8', t: 'Combinador filho: só links diretamente dentro de nav.' }, { l: '10', t: '.card.destaque exige as duas classes juntas (0-2-0).' } ] },
    { title: 'Calculando especificidade (JavaScript)', lang: 'javascript', code: R`function especificidade(seletor) {
  let a = 0, b = 0, c = 0;
  let s = seletor.replace(/\[[^\]]*\]/g, () => { b++; return ' '; });
  s = s.replace(/::[a-zA-Z-]+/g, () => { c++; return ' '; });
  s = s.replace(/:[a-zA-Z-]+(\([^)]*\))?/g, () => { b++; return ' '; });
  s = s.replace(/#[\w-]+/g, () => { a++; return ' '; });
  s = s.replace(/\.[\w-]+/g, () => { b++; return ' '; });
  s = s.replace(/[a-zA-Z][\w-]*/g, () => { c++; return ' '; });
  return [a, b, c];
}

console.log(especificidade('#menu a:hover')); // [1, 1, 1]
console.log(especificidade('.a .b .c'));       // [0, 3, 0]`,
      notes: [ { l: '3', t: 'Remove os atributos primeiro (contam como classe) para que o conteúdo entre colchetes não seja contado de novo.' }, { l: '4-5', t: 'Pseudo-elementos (::) contam como tipo; pseudo-classes (:) como classe. A ordem importa porque "::" precisa sair antes de ":".' }, { l: '8', t: 'O que sobrar com letras são seletores de tipo. Não trata :is(), :not() e :where().' } ] }
  ],
  bestPractices: ['Estilize por classes e mantenha a especificidade baixa.', 'Evite ids para estilo e seletores muito profundos.', 'Evite !important.', 'Use variáveis CSS para cores, espaços e fontes repetidos.', 'Use :focus-visible para dar foco visível ao teclado.', 'Nomeie classes pelo papel, não pela aparência.'],
  mistakes: ['Corrigir uma disputa de estilos com !important em vez de entender a cascata.', 'Esperar que margin e padding sejam herdados.', 'Usar seletores com muitos níveis, que viram armadilha de manutenção.', 'Esquecer que a ordem do código decide empates de especificidade.', 'Usar ids como ganchos de CSS e depois não conseguir sobrescrevê-los.'],
  market: `Manutenção de CSS é uma das maiores dores em produtos reais. Equipes adotam convenções (BEM, utilitários, CSS Modules) justamente para controlar especificidade. Entender a cascata é o que separa quem "chuta" estilos de quem os depura rápido.`,
  summary: `Regras CSS têm seletor e declarações. A cascata decide por origem/importância, especificidade e ordem. Especificidade é id–classe–tipo, comparada da esquerda para a direita. Algumas propriedades são herdadas. Mantenha especificidade baixa, evite !important e use variáveis.`,
  refs: [REF.mdnSpec, REF.mdnLayout],
  cards: [
    { q: 'Qual a especificidade de #menu a:hover?', a: '1-1-1: um id, uma pseudo-classe e um tipo.' },
    { q: 'Em empate de especificidade, quem vence?', a: 'A declaração que aparece por último no código.' },
    { q: 'O que o :where() faz com a especificidade?', a: 'Contribui sempre com 0-0-0, qualquer que seja o argumento.' },
    { q: 'color é herdada? E margin?', a: 'color é herdada pelos filhos; margin não é.' }
  ]
},
{
  id: 'htm-05', moduleId: 'm2', order: 5, minutes: 70, tags: ['css', 'box-model', 'unidades', 'tipografia', 'cores'],
  title: 'Box model, unidades, cores e tipografia',
  objectives: ['Calcular o tamanho real de uma caixa em content-box e border-box', 'Escolher entre px, rem, em, % e unidades de viewport', 'Usar cores com contraste e tipografia legível', 'Entender o colapso de margens e o fluxo normal'],
  intro: `Todo elemento em uma página é uma **caixa**. Entender como o navegador calcula o tamanho dessas caixas explica a maior parte dos "por que isso estourou a largura?" do dia a dia. Também escolhemos as unidades e fontes que decidem se a página fica legível e adaptável.`,
  theory: `### As quatro camadas da caixa
De dentro para fora: **conteúdo** (width e height), **padding** (espaço interno, transparente, mostra o fundo), **borda** e **margin** (espaço externo). Segundo a MDN, o padding não pode ser negativo; a margem pode.

### box-sizing
- §content-box§ (padrão): width e height valem para o **conteúdo**; padding e borda são **somados** por fora.
- §border-box§: width e height valem para a caixa até a borda; padding e borda ficam por dentro.

Exemplo: §width: 350px; padding: 25px; border: 5px§ ocupa **410px** em §content-box§ (350 + 25 + 25 + 5 + 5) e **350px** em §border-box§. A margem não entra nesse cálculo. Por isso é comum aplicar §border-box§ a tudo: §*, *::before, *::after { box-sizing: border-box; }§.

### Fluxo normal e display
Elementos **de bloco** (§div§, §p§, §h1§) ocupam a linha toda e empilham; elementos **em linha** (§span§, §a§, §strong§) seguem o texto e ignoram width e height. §display: inline-block§ combina os comportamentos; §display: none§ remove o elemento. As **margens verticais** de blocos vizinhos podem **colapsar**: entre dois blocos com margens de 20px e 30px o espaço resultante é de 30px, não 50px.

### Unidades
| Unidade | Uso |
|---|---|
| §px§ | valor fixo; bom para bordas finas |
| §rem§ | relativa ao tamanho da fonte do elemento raiz; ótima para fontes e espaços porque respeita a preferência de fonte do usuário |
| §em§ | relativa à fonte do próprio elemento |
| §%§ | relativa ao tamanho do elemento pai |
| §vw§ / §vh§ | 1% da largura / altura da janela |
| §ch§ | largura aproximada de um caractere; útil para limitar linhas de texto |
Prefira §rem§ para tamanhos de texto: quem aumenta a fonte do navegador por necessidade visual terá o layout acompanhando. Defina §line-height§ sem unidade (ex.: §1.5§).

### Cores e contraste
Formatos: nomes (§red§), hexadecimal (§#0b5fff§, §#fff§) e funções (§rgb()§, §hsl()§). Contraste não é gosto: a WCAG 2.2 define **razão de contraste** mínima de **4,5:1** para texto e **3:1** para texto grande (critério 1.4.3, nível AA). A aula 7 mostra como calcular. Nunca use apenas a cor para transmitir informação (erro em vermelho, link só em outra cor).

### Tipografia
- §font-family§ com alternativas: §font-family: "Inter", system-ui, sans-serif;§
- Largura de linha confortável: cerca de 45 a 75 caracteres (§max-width: 65ch§).
- §line-height§ de 1,4 a 1,6 para texto corrido.
- Não desative o zoom do usuário e não bloqueie o redimensionamento do texto.

### Fundos, bordas e sombras
§background-color§, §background-image§, §border-radius§, §box-shadow§. Garanta que o texto sobre imagens de fundo mantenha contraste.`,
  concepts: [
    { term: 'Box model', def: 'Modelo em que todo elemento é uma caixa com conteúdo, padding, borda e margem.' },
    { term: 'box-sizing: border-box', def: 'Faz width e height incluírem padding e borda.' },
    { term: 'Colapso de margens', def: 'Margens verticais de blocos vizinhos se fundem na maior delas.' },
    { term: 'rem', def: 'Unidade relativa ao tamanho de fonte do elemento raiz.' },
    { term: 'display', def: 'Propriedade que define o tipo de caixa: block, inline, inline-block, flex, grid, none.' },
    { term: 'Razão de contraste', def: 'Relação entre a luminância de duas cores; mínimo de 4,5:1 para texto comum na WCAG AA.' }
  ],
  examples: `**Analogia da caixa:** uma encomenda tem o produto (conteúdo), o plástico-bolha (padding), a caixa de papelão (borda) e o espaço que você deixa na prateleira entre ela e as outras (margem). Em border-box você descreve o tamanho da caixa de papelão; em content-box, só o do produto.

**Cálculo:** \`width: 200px; padding: 10px; border: 2px;\` → content-box ocupa 200 + 20 + 4 = **224px**; border-box ocupa **200px**.`,
  code: [
    { title: 'Reset de box-sizing e texto legível', lang: 'css', code: R`*, *::before, *::after { box-sizing: border-box; }

html { font-size: 100%; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1a1a1a;
  background: #fff;
}
.texto { max-width: 65ch; margin-inline: auto; padding: 1rem; }
h1 { font-size: 2rem; margin-block: 0 1rem; }`,
      notes: [ { l: '1', t: 'Aplica border-box a todos os elementos e pseudo-elementos.' }, { l: '3', t: 'Mantém a fonte base respeitando a preferência do usuário.' }, { l: '12', t: 'max-width em ch limita a linha ao tamanho confortável; margin-inline: auto centraliza.' } ] },
    { title: 'Tamanho ocupado por uma caixa (JavaScript)', lang: 'javascript', code: R`function larguraOcupada({ width, padding = 0, border = 0 }, boxSizing = 'content-box') {
  return boxSizing === 'border-box' ? width : width + 2 * padding + 2 * border;
}

console.log(larguraOcupada({ width: 350, padding: 25, border: 5 }));               // 410
console.log(larguraOcupada({ width: 350, padding: 25, border: 5 }, 'border-box')); // 350`,
      notes: [ { l: '2', t: 'Em border-box o valor já inclui tudo; em content-box somamos padding e borda dos dois lados. A margem nunca entra.' } ] }
  ],
  bestPractices: ['Aplique border-box globalmente.', 'Use rem para fontes e espaços.', 'Limite a largura das linhas de texto.', 'Defina line-height sem unidade.', 'Verifique o contraste de cada par de cores de texto e fundo.', 'Não transmita informação só pela cor.'],
  mistakes: ['Somar padding e borda e estourar a largura do container.', 'Fixar tamanhos de fonte em px impedindo o ajuste do usuário.', 'Esquecer o colapso de margens.', 'Usar texto cinza claro sobre fundo branco.', 'Usar width e height em elementos inline.'],
  market: `Problemas de caixa e unidade estão no topo das dúvidas de iniciantes e das revisões de código de front-end. Contraste e tamanhos relativos fazem parte de critérios de acessibilidade verificados em auditorias.`,
  summary: `Toda caixa tem conteúdo, padding, borda e margem. border-box faz width incluir padding e borda. Prefira rem, limite a linha a cerca de 65 caracteres e confira o contraste (4,5:1 para texto comum). Margens verticais colapsam.`,
  refs: [REF.mdnBox, REF.wcag22],
  cards: [
    { q: 'Qual a largura total de width:350px; padding:25px; border:5px em content-box?', a: '410px (350 + 25 + 25 + 5 + 5). Em border-box seria 350px.' },
    { q: 'Por que usar rem em fontes?', a: 'Porque acompanha a preferência de tamanho de fonte do usuário.' },
    { q: 'O que é o colapso de margens?', a: 'Margens verticais adjacentes de blocos se fundem na maior delas, em vez de somar.' }
  ]
},
{
  id: 'htm-06', moduleId: 'm2', order: 6, minutes: 80, tags: ['css', 'flexbox', 'grid', 'responsividade'],
  title: 'Layout moderno: Flexbox, Grid e responsividade',
  objectives: ['Escolher entre Flexbox e Grid conforme o problema', 'Montar linhas e colunas com Flexbox e áreas com Grid', 'Aplicar a abordagem mobile first com media queries', 'Evitar layouts que quebram em telas pequenas ou com zoom'],
  intro: `Layout em CSS já foi feito com tabelas e floats. Hoje temos duas ferramentas feitas para isso: **Flexbox**, para distribuir itens em uma dimensão, e **Grid**, para organizar em duas. Somadas às media queries, cobrem quase toda página que você vai construir.`,
  theory: `### Flexbox: uma dimensão
Segundo a MDN, o Flexbox é um método de layout unidimensional: organiza itens em linha ou em coluna, que crescem para ocupar o espaço livre e encolhem quando falta.
- No **container**: §display: flex;§ define o eixo (§flex-direction: row | column§), o alinhamento no eixo principal (§justify-content§), no eixo cruzado (§align-items§), a quebra (§flex-wrap§) e o espaço entre itens (§gap§).
- Nos **itens**: §flex: 1§ divide o espaço igualmente; §flex-grow§, §flex-shrink§ e §flex-basis§ detalham o comportamento.
Bom para: barras de navegação, linhas de botões, centralização, cartões que se distribuem.

### Grid: duas dimensões
O Grid organiza conteúdo em linhas **e** colunas ao mesmo tempo. Propriedades principais, segundo a MDN:
- §display: grid;§ e §grid-template-columns§, que aceita comprimentos, porcentagens, §fr§, §repeat()§ e §minmax()§.
- A unidade §fr§ representa uma fração do espaço livre: §1fr 2fr§ divide o espaço em um terço e dois terços.
- §gap§ define os espaços entre linhas e colunas.
- Posicionamento por linhas: §grid-column: 1 / 3;§.
- §grid-template-areas§ permite nomear áreas do layout.
Bom para: layout geral da página, galerias, painéis.

### Qual usar?
Se o conteúdo flui em **uma linha ou coluna**, Flexbox. Se você pensa em **linhas e colunas ao mesmo tempo**, Grid. Os dois se combinam: Grid para a página, Flexbox dentro dos componentes. Um padrão muito útil de Grid responsivo sem media query:

    .galeria { display: grid; gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }

### Posicionamento
§position: relative§ desloca em relação à posição normal e vira referência para filhos; §absolute§ posiciona em relação ao ancestral posicionado mais próximo e sai do fluxo; §fixed§ prende à janela; §sticky§ alterna entre normal e fixo ao rolar. Use com moderação: tira elementos do fluxo normal e pode quebrar em telas pequenas e com zoom.

### Responsividade
- **Meta viewport** no HTML (aula 1) é pré-requisito.
- **Mobile first:** escreva o CSS base para telas pequenas e use §@media (min-width: 48rem)§ para acrescentar regras em telas maiores. A MDN descreve media queries como a principal ferramenta para aplicar CSS só quando o dispositivo atende a uma condição.
- Escolha **pontos de quebra** pelo conteúdo (quando o layout começa a ficar ruim), não por modelos de aparelho.
- Imagens: §max-width: 100%; height: auto;§.
- Texto: layout deve funcionar com zoom de 200% sem rolagem horizontal em texto corrido.

### Preferências do usuário
Media queries também leem preferências: §@media (prefers-reduced-motion: reduce)§ para desligar animações e §@media (prefers-color-scheme: dark)§ para tema escuro.`,
  concepts: [
    { term: 'Flexbox', def: 'Modelo de layout unidimensional para distribuir itens em linha ou coluna.' },
    { term: 'Grid', def: 'Modelo de layout bidimensional com linhas e colunas.' },
    { term: 'fr', def: 'Unidade do Grid que representa uma fração do espaço livre.' },
    { term: 'gap', def: 'Espaço entre itens de um flex ou grid.' },
    { term: 'Mobile first', def: 'Estratégia de escrever o CSS base para telas pequenas e ampliar com min-width.' },
    { term: 'Media query', def: 'Regra @media que aplica CSS apenas quando uma condição do dispositivo é atendida.' },
    { term: 'Ponto de quebra', def: 'Largura em que o layout muda para continuar legível.' }
  ],
  examples: `**Analogia:** Flexbox é uma prateleira: você coloca objetos em uma fila e decide como a sobra de espaço se distribui. Grid é uma tabela de quadras de um tabuleiro: você define linhas e colunas e coloca as peças em células.

**Exemplo:** o mesmo conjunto de cartões vira uma coluna no celular e três colunas no desktop, sem alterar o HTML.`,
  code: [
    { title: 'Barra de navegação com Flexbox', lang: 'css', code: R`.barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
}
.barra nav { display: flex; gap: 1rem; flex-wrap: wrap; }`,
      notes: [ { l: '2-4', t: 'Linha com itens centralizados verticalmente e espaço distribuído entre as pontas.' }, { l: '8', t: 'O nav também é flex e quebra a linha quando não cabe.' } ] },
    { title: 'Grid responsivo, mobile first', lang: 'css', code: R`.cartoes {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}
@media (min-width: 40rem) {
  .cartoes { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 64rem) {
  .cartoes { grid-template-columns: repeat(3, 1fr); }
}
img { max-width: 100%; height: auto; }`,
      notes: [ { l: '1-5', t: 'Base: uma coluna, para telas pequenas.' }, { l: '6-8', t: 'A partir de 40rem, duas colunas.' }, { l: '9-11', t: 'A partir de 64rem, três colunas.' }, { l: '12', t: 'Imagens nunca estouram o container.' } ] },
    { title: 'Layout da página com áreas nomeadas', lang: 'css', code: R`.pagina {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 1fr;
  grid-template-areas: "topo" "conteudo" "rodape";
  grid-template-rows: auto 1fr auto;
}
@media (min-width: 48rem) {
  .pagina {
    grid-template-columns: 14rem 1fr;
    grid-template-areas: "topo topo" "menu conteudo" "rodape rodape";
  }
}
header { grid-area: topo; }
nav { grid-area: menu; }
main { grid-area: conteudo; }
footer { grid-area: rodape; }`,
      notes: [ { l: '5-6', t: 'Em tela pequena, uma coluna e três linhas; o conteúdo (1fr) ocupa a sobra.' }, { l: '11-12', t: 'Em telas maiores aparece a coluna do menu de 14rem.' }, { l: '16-19', t: 'Cada elemento declara sua área; a ordem do HTML continua lógica.' } ] }
  ],
  bestPractices: ['Flexbox para um eixo; Grid para dois.', 'Use gap em vez de margens para espaçar itens.', 'Comece pelo celular e acrescente regras com min-width.', 'Defina pontos de quebra pelo conteúdo.', 'Teste com zoom de 200% e com texto maior.', 'Respeite prefers-reduced-motion em animações.'],
  mistakes: ['Usar position absolute para montar o layout.', 'Fixar alturas em px e cortar texto ampliado.', 'Esquecer o meta viewport.', 'Reordenar visualmente com CSS e deixar a ordem do HTML sem sentido para leitores de tela.', 'Usar larguras fixas em px que geram rolagem horizontal.'],
  market: `Responsividade é requisito de praticamente todo projeto web, e a maior parte do tráfego vem de celulares. Entrevistas de front-end costumam pedir um layout em Flexbox e Grid ao vivo.`,
  summary: `Flexbox organiza itens em uma dimensão; Grid, em duas. Use gap para espaçar. Escreva o CSS mobile first e acrescente media queries com min-width em pontos definidos pelo conteúdo. Imagens com max-width: 100%. Respeite as preferências do usuário.`,
  refs: [REF.mdnLayout, REF.mdnGrid],
  cards: [
    { q: 'Quando usar Flexbox e quando Grid?', a: 'Flexbox para organizar itens em uma linha ou coluna; Grid quando o layout tem linhas e colunas ao mesmo tempo.' },
    { q: 'O que significa 1fr 2fr?', a: 'O espaço livre é dividido em duas colunas: uma de um terço e outra de dois terços.' },
    { q: 'O que é mobile first?', a: 'Escrever o CSS base para telas pequenas e ampliar para maiores com media queries min-width.' }
  ]
},
{
  id: 'htm-07', moduleId: 'm3', order: 7, minutes: 85, tags: ['acessibilidade', 'wcag', 'aria', 'teclado', 'contraste'],
  title: 'Acessibilidade na prática: WCAG, contraste, teclado e ARIA',
  objectives: ['Explicar os quatro princípios da WCAG e os níveis A, AA e AAA', 'Calcular a razão de contraste entre duas cores', 'Garantir uso por teclado com foco visível e ordem lógica', 'Aplicar ARIA apenas quando o HTML nativo não basta', 'Montar uma rotina simples de teste de acessibilidade'],
  intro: `Acessibilidade é projetar para que **todas as pessoas** consigam usar o que você faz: quem usa leitor de tela, quem navega só com teclado, quem tem baixa visão, daltonismo, deficiência motora ou cognitiva, quem está sob sol forte no celular. Não é um recurso opcional no fim do projeto: é qualidade, e em muitos contextos, exigência legal.`,
  theory: `### As diretrizes WCAG
As **Web Content Accessibility Guidelines (WCAG)** são o padrão do W3C. A versão 2.2 foi publicada em outubro de 2023 e atualizada em dezembro de 2024, e o W3C recomenda usar a versão mais recente. Os critérios se organizam em quatro princípios, conhecidos como **POUR**:
- **Perceptível:** a informação pode ser percebida (alternativas em texto, contraste, legendas).
- **Operável:** a interface pode ser operada (teclado, tempo suficiente, foco visível).
- **Compreensível:** o conteúdo e o uso são claros (idioma, rótulos, mensagens de erro).
- **Robusto:** funciona com diferentes tecnologias assistivas (HTML válido, nome, função e valor).
Cada critério tem um nível de conformidade: **A**, **AA** e **AAA**. O alvo mais comum em produtos e em leis é o **AA**.

### Alguns critérios importantes
| Critério | Nível | Resumo |
|---|---|---|
| 1.1.1 Conteúdo não textual | A | alternativas em texto para imagens e afins |
| 1.4.3 Contraste (mínimo) | AA | razão de pelo menos 4,5:1 para texto; 3:1 para texto grande |
| 2.1.1 Teclado | A | todas as funções operáveis pelo teclado |
| 2.4.7 Foco visível | AA | o foco do teclado precisa ser visível |
| 2.5.8 Tamanho do alvo (mínimo) | AA | alvos de ponteiro com pelo menos 24×24 px CSS, ou espaçamento equivalente |

Para o tamanho do alvo, a página "Understanding" do W3C lista as exceções: espaçamento, equivalente na mesma página, alvos em linha com texto, controles do navegador e casos essenciais.

### Contraste: como se calcula
A razão de contraste compara a **luminância relativa** de duas cores. Para cada canal sRGB (R, G, B) de 0 a 255: divida por 255 e, se o valor for pequeno (limiar definido pela WCAG), divida por 12,92; senão, use ((c + 0,055) / 1,055)^2,4. A luminância é §0,2126·R + 0,7152·G + 0,0722·B§. A razão é §(L1 + 0,05) / (L2 + 0,05)§, com L1 a luminância **maior**. Vai de 1:1 (iguais) a 21:1 (preto sobre branco). Texto grande (a WCAG define por tamanho e peso da fonte; confira a definição no texto da norma) precisa de 3:1.

### Teclado
- Tudo que se faz com o mouse precisa funcionar com Tab, Shift+Tab, Enter, Espaço e setas onde fizer sentido.
- **Nunca remova o contorno de foco** sem substituí-lo (§outline: none§ sozinho é um erro); use §:focus-visible§ com um estilo claro.
- A ordem de tabulação segue a ordem do HTML: mantenha-a lógica. §tabindex="0"§ coloca um elemento na ordem; §tabindex="-1"§ permite foco por script; evite valores positivos.
- Elementos nativos (§button§, §a§, §input§) já são focáveis e operáveis. Criar um botão com §div§ exige reconstruir tudo isso.
- Em modais, mova o foco para dentro ao abrir e devolva ao elemento de origem ao fechar.

### ARIA: só quando necessário
**WAI-ARIA** acrescenta atributos (§role§, §aria-label§, §aria-expanded§, §aria-describedby§...) para descrever componentes que o HTML não cobre. Mas ARIA **não** acrescenta comportamento nem estilo: não torna um div focável nem faz Enter funcionar. O guia de práticas do W3C resume o espírito: nenhum ARIA é melhor que ARIA incorreto. Portanto: primeiro tente um elemento nativo; use ARIA para o que sobra (por exemplo, indicar que um menu está expandido com §aria-expanded§).
- §aria-label§ dá nome a um elemento sem texto visível (um botão só com ícone).
- §aria-live§ avisa mudanças dinâmicas (mensagens de status).
- §aria-hidden="true"§ esconde do leitor de tela: nunca em elementos focáveis.

### Movimento e outras necessidades
Ofereça meios de pausar animações, respeite §prefers-reduced-motion§, não use luzes piscantes e não limite o tempo sem aviso. Linguagem simples e instruções claras ajudam todo mundo.

### Como testar
1. **Teclado:** navegue pela página só com Tab. Dá para chegar em tudo? O foco aparece? A ordem faz sentido?
2. **Zoom:** aumente para 200% e veja se nada se perde.
3. **Leitor de tela:** teste com um dos leitores de tela do seu sistema, ao menos nos fluxos principais.
4. **Ferramentas automáticas** (extensões e verificadores do navegador): pegam parte dos problemas, mas **não substituem** teste manual.
5. **Pessoas reais** usando a interface, sempre que possível.`,
  concepts: [
    { term: 'WCAG', def: 'Diretrizes do W3C para conteúdo web acessível, organizadas em critérios com níveis A, AA e AAA.' },
    { term: 'POUR', def: 'Os quatro princípios da WCAG: perceptível, operável, compreensível e robusto.' },
    { term: 'Razão de contraste', def: 'Relação entre as luminâncias relativas de duas cores, de 1:1 a 21:1.' },
    { term: 'Foco visível', def: 'Indicação visual de qual elemento está ativo para o teclado.' },
    { term: 'tabindex', def: 'Atributo que controla se e em que ordem um elemento recebe foco.' },
    { term: 'ARIA', def: 'Conjunto de atributos que acrescenta informações de acessibilidade a componentes sem equivalente nativo.' },
    { term: 'Leitor de tela', def: 'Software que lê o conteúdo e a estrutura da interface em voz ou braille.' }
  ],
  examples: `**Analogia da rampa:** acessibilidade é projetar a rampa junto com a escada, no mesmo prédio, desde a planta. Fica mais barato do que quebrar a parede depois, e beneficia também quem empurra um carrinho de bebê.

**Exemplo de contraste:** texto #767676 sobre branco tem razão próxima de 4,54:1 e passa em AA; #777777 sobre branco tem cerca de 4,48:1 e **não** passa. Uma diferença quase invisível ao olho decide a conformidade, por isso se mede, em vez de confiar na impressão.`,
  code: [
    { title: 'Foco visível e alvos de toque confortáveis', lang: 'css', code: R`a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #0b5fff;
  outline-offset: 2px;
}

button, .botao {
  min-height: 2.75rem;
  min-width: 2.75rem;
  padding: 0.5rem 1rem;
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}`,
      notes: [ { l: '1-6', t: 'Contorno claro e espaçado para o foco do teclado, em vez de removê-lo.' }, { l: '8-12', t: 'Alvos com cerca de 44px, acima do mínimo de 24px exigido pela WCAG 2.2 (AA).' }, { l: '14-16', t: 'Respeita a preferência de reduzir movimento.' } ] },
    { title: 'Botão de menu: nativo primeiro, ARIA para o estado', lang: 'html', code: R`<button type="button" aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>
  <li><a href="/">Início</a></li>
  <li><a href="/contato">Contato</a></li>
</ul>

<button type="button" aria-label="Fechar">
  <svg aria-hidden="true" width="16" height="16"><!-- ícone --></svg>
</button>`,
      notes: [ { l: '1', t: 'É um button nativo (focável, ativa com Enter e Espaço). aria-expanded informa se o menu está aberto; o script precisa alternar o valor.' }, { l: '4', t: 'hidden remove o menu da tela e do leitor de tela enquanto fechado.' }, { l: '9-11', t: 'Botão só com ícone: aria-label dá o nome, e o svg decorativo fica escondido com aria-hidden.' } ] },
    { title: 'Razão de contraste (JavaScript)', lang: 'javascript', code: R`function luminancia(hex) {
  const h = hex.replace('#', '');
  const cheio = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(cheio.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function razaoContraste(a, b) {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior + 0.05) / (menor + 0.05);
}

console.log(razaoContraste('#000', '#fff').toFixed(2));    // 21.00
console.log(razaoContraste('#767676', '#fff').toFixed(2)); // 4.54`,
      notes: [ { l: '2-3', t: 'Aceita #rgb e #rrggbb; expande a forma curta.' }, { l: '4-5', t: 'Converte cada canal para 0–1 e linearize o sRGB.' }, { l: '6', t: 'Pesos da luminância relativa.' }, { l: '9-10', t: 'A cor mais clara vai no numerador, por isso a ordenação.' } ] }
  ],
  bestPractices: ['Use HTML semântico e nativo antes de pensar em ARIA.', 'Calcule o contraste dos pares de cores; não confie no olho.', 'Nunca remova o foco sem substituí-lo.', 'Teste a página só com teclado e com zoom de 200%.', 'Use ferramentas automáticas e também teste manual.', 'Dê nome acessível a controles só com ícone.', 'Respeite as preferências do usuário (movimento, tema).'],
  mistakes: ['outline: none sem alternativa.', 'Usar div como botão sem teclado, foco e role.', 'ARIA redundante ou incorreto, que piora a experiência.', 'aria-hidden em elementos focáveis.', 'Confiar só no verificador automático.', 'Texto cinza claro sobre fundo branco.', 'Alvos de toque muito pequenos e colados.'],
  market: `Leis e normas de acessibilidade digital estão cada vez mais presentes, e contratos públicos e de grandes empresas exigem conformidade com a WCAG, normalmente no nível AA. Quem domina isso se diferencia no mercado, e boas práticas de acessibilidade também melhoram usabilidade, SEO e testabilidade.`,
  summary: `A WCAG organiza a acessibilidade em quatro princípios (perceptível, operável, compreensível, robusto) e três níveis; o alvo comum é AA. Contraste mínimo de 4,5:1 para texto comum, uso completo por teclado com foco visível e alvos de pelo menos 24×24 px. Use HTML nativo; ARIA só para o que sobra, porque nenhum ARIA é melhor que ARIA incorreto. Teste com teclado, zoom, leitor de tela e pessoas.`,
  refs: [REF.wcagOverview, REF.wcag22, REF.target, REF.apg, REF.mdnA11yHtml],
  cards: [
    { q: 'Quais são os quatro princípios da WCAG?', a: 'Perceptível, operável, compreensível e robusto (POUR).' },
    { q: 'Qual o contraste mínimo para texto comum no nível AA?', a: '4,5:1 (3:1 para texto grande).' },
    { q: 'Qual o tamanho mínimo de alvo na WCAG 2.2 AA?', a: '24×24 px CSS, ou o espaçamento equivalente definido nas exceções.' },
    { q: 'Quando usar ARIA?', a: 'Quando o HTML nativo não resolve; ARIA não dá comportamento nem foco, e nenhum ARIA é melhor que ARIA incorreto.' }
  ]
}
];
