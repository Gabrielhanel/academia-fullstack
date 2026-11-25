// Curso 3 — HTML, CSS e acessibilidade. Aulas 1 a 3 (HTML).
const R = String.raw;

export const REF = {
  mdnHtml: { title: 'MDN — Estruturando conteúdo com HTML (Learn web development)', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content', kind: 'doc' },
  mdnA11yHtml: { title: 'MDN — HTML: a good basis for accessibility', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML', kind: 'doc' },
  mdnLayout: { title: 'MDN — CSS layout (Learn web development)', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout', kind: 'doc' },
  mdnSpec: { title: 'MDN — Specificity', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity', kind: 'doc' },
  mdnBox: { title: 'MDN — The box model', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model', kind: 'doc' },
  mdnGrid: { title: 'MDN — CSS grid layout', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout', kind: 'doc' },
  wcagOverview: { title: 'W3C WAI — WCAG 2 Overview', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', kind: 'spec' },
  wcag22: { title: 'W3C — Web Content Accessibility Guidelines (WCAG) 2.2', url: 'https://www.w3.org/TR/WCAG22/', kind: 'spec' },
  target: { title: 'W3C WAI — Understanding SC 2.5.8: Target Size (Minimum)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html', kind: 'doc' },
  apg: { title: 'W3C WAI — ARIA Authoring Practices Guide: Read Me First', url: 'https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'htm-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['html', 'semantica', 'estrutura'],
  title: 'Estrutura de um documento HTML e semântica',
  objectives: ['Escrever um documento HTML válido com doctype, lang, charset, viewport e title', 'Escolher o elemento semântico certo para cada parte da página', 'Montar uma hierarquia de títulos sem saltos', 'Explicar por que semântica ajuda acessibilidade, SEO e manutenção'],
  intro: `HTML descreve o **significado** do conteúdo, não a aparência. Um título é um título, uma lista é uma lista, um botão é um botão. Quando você marca o conteúdo certo, navegadores, leitores de tela e buscadores entendem a página sem esforço extra, e o CSS fica livre para cuidar do visual.`,
  theory: `### O esqueleto de uma página
Todo documento HTML começa com a mesma estrutura:

- §<!doctype html>§: ativa o modo padrão dos navegadores.
- §<html lang="pt-BR">§: o atributo §lang§ informa o idioma. Leitores de tela usam isso para escolher a pronúncia.
- §<head>§: metadados que não aparecem na página: §<meta charset="utf-8">§, §<meta name="viewport" content="width=device-width, initial-scale=1">§ (necessário para layouts responsivos no celular) e §<title>§ (o texto da aba e o primeiro item que um leitor de tela anuncia).
- §<body>§: o conteúdo visível.

### Elementos e atributos
Um **elemento** tem tag de abertura, conteúdo e tag de fechamento (§<p>texto</p>§). Alguns são **vazios** (§<img>§, §<br>§, §<input>§). **Atributos** ficam na tag de abertura (§href§, §src§, §alt§, §id§, §class§).

### Semântica: o elemento certo para o trabalho
| Elemento | Uso |
|---|---|
| §<header>§ | cabeçalho de uma página ou seção |
| §<nav>§ | bloco de navegação principal |
| §<main>§ | conteúdo principal; um por página |
| §<article>§ | conteúdo independente (post, notícia) |
| §<section>§ | agrupamento temático, normalmente com um título |
| §<aside>§ | conteúdo relacionado, lateral |
| §<footer>§ | rodapé de uma página ou seção |
| §<h1>§–§<h6>§ | títulos hierárquicos |
| §<button>§ | ação na página |
| §<a href>§ | navegação para outro lugar |

§<div>§ e §<span>§ não têm significado: servem como último recurso, quando nenhum elemento semântico se aplica. Segundo a MDN, os elementos nativos trazem acessibilidade embutida: um §<button>§ já recebe foco pelo teclado e ativa com Enter ou Espaço, enquanto um §<div>§ exige trabalho extra para chegar perto disso. Marcar bem também cria **marcos** (*landmarks*), que permitem a quem usa leitor de tela pular entre §nav§, §main§ e §footer§.

### Títulos
Leitores de tela permitem navegar pela lista de títulos como se fosse um sumário. Por isso:
- use um §<h1>§ por página, descrevendo o assunto principal;
- não pule níveis (§h2§ seguido de §h4§ deixa um buraco na estrutura);
- escolha o nível pela **hierarquia**, nunca pelo tamanho da fonte: o tamanho é papel do CSS.

### Validação
O validador do W3C e as ferramentas de desenvolvimento do navegador apontam tags sem fechamento e aninhamentos inválidos. HTML é tolerante: o navegador "conserta" erros, mas cada navegador pode consertar de um jeito. Escreva HTML válido para não depender de adivinhação.`,
  concepts: [
    { term: 'Elemento semântico', def: 'Elemento cujo nome descreve o papel do conteúdo (nav, main, article, button).' },
    { term: 'Atributo lang', def: 'Declara o idioma do documento; ajuda leitores de tela e tradutores.' },
    { term: 'Landmark', def: 'Região da página (nav, main, footer) que tecnologias assistivas oferecem como atalho de navegação.' },
    { term: 'Hierarquia de títulos', def: 'Sequência h1–h6 que forma o sumário da página, sem saltos de nível.' },
    { term: 'Meta viewport', def: 'Metadado que faz a página usar a largura real do aparelho em telas pequenas.' },
    { term: 'Elemento vazio', def: 'Elemento sem conteúdo nem tag de fechamento, como img e input.' }
  ],
  examples: `**Analogia:** HTML é a planta com os cômodos nomeados ("cozinha", "quarto"); o CSS é a decoração. Se você escrever "cômodo 1", "cômodo 2" na planta, a casa até fica de pé, mas ninguém consegue se orientar nela.

**Antes e depois:**

    <div class="topo"><div class="menu">...</div></div>      → <header><nav>...</nav></header>
    <div class="titulo-grande">Notícias</div>                → <h1>Notícias</h1>
    <div class="botao" onclick="enviar()">Enviar</div>       → <button type="button">Enviar</button>`,
  code: [
    { title: 'Página mínima com estrutura semântica', lang: 'html', code: R`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Receitas da Ana</title>
</head>
<body>
  <header>
    <h1>Receitas da Ana</h1>
    <nav>
      <a href="/">Início</a>
      <a href="/bolos">Bolos</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>Bolo de cenoura</h2>
      <p>Um clássico para o café da tarde.</p>
    </article>
  </main>
  <footer><p>© 2026 Ana</p></footer>
</body>
</html>`,
      notes: [ { l: '2', t: 'lang="pt-BR" declara o idioma do documento.' }, { l: '4-5', t: 'charset garante os acentos; viewport habilita a responsividade em celulares.' }, { l: '6', t: 'title aparece na aba e nos resultados de busca.' }, { l: '9-15', t: 'header e nav formam marcos de navegação.' }, { l: '16-21', t: 'main tem o conteúdo principal; article é um conteúdo independente, com título h2 abaixo do h1.' } ] },
    { title: 'Listando os títulos de uma página (JavaScript)', lang: 'javascript', code: R`function niveis(html) {
  const re = /<h([1-6])\b/gi;
  const lista = [];
  let m;
  while ((m = re.exec(html)) !== null) lista.push(Number(m[1]));
  return lista;
}

console.log(niveis('<h1>A</h1><h2>B</h2><h4>C</h4>')); // [1, 2, 4]  (saltou do 2 para o 4)`,
      notes: [ { l: '2', t: 'Expressão regular que encontra a abertura de h1 a h6.' }, { l: '4-5', t: 'exec com a flag g percorre todas as ocorrências, guardando o número do nível.' }, { l: '9', t: 'Ver a lista [1, 2, 4] já mostra o salto. No exercício você transformará isso em uma verificação.' } ] }
  ],
  bestPractices: ['Comece pelo HTML semântico, sem CSS, e confirme que a página faz sentido sozinha.', 'Use um h1 por página e não pule níveis.', 'Declare lang, charset, viewport e title em toda página.', 'Prefira elementos nativos (button, a, nav) a divs com comportamento improvisado.', 'Valide o HTML durante o desenvolvimento.'],
  mistakes: ['Usar div e span para tudo.', 'Escolher h1–h6 pelo tamanho da fonte.', 'Esquecer o atributo lang.', 'Usar section sem título como se fosse um div genérico.', 'Fazer um div com onclick no lugar de um button.'],
  market: `Páginas semânticas ranqueiam melhor em buscadores e são a base de qualquer exigência de acessibilidade, hoje cobrada em contratos públicos e em produtos de grandes empresas. Em entrevistas de front-end, "por que usar button em vez de div?" é uma pergunta clássica.`,
  summary: `HTML descreve significado. Toda página precisa de doctype, lang, charset, viewport e title. Elementos semânticos criam marcos de navegação e dão acessibilidade embutida. Títulos formam um sumário: um h1 e sem saltos de nível. div e span são o último recurso.`,
  refs: [REF.mdnHtml, REF.mdnA11yHtml],
  cards: [
    { q: 'Para que serve o atributo lang no html?', a: 'Informa o idioma do documento, ajudando leitores de tela a pronunciar o texto e navegadores a oferecer tradução.' },
    { q: 'Por que usar button em vez de div com onclick?', a: 'O button já é focável pelo teclado e ativa com Enter ou Espaço; o div exige trabalho extra para isso.' },
    { q: 'Como escolher o nível de um título?', a: 'Pela hierarquia do conteúdo, nunca pelo tamanho visual; o tamanho é papel do CSS.' }
  ]
},
{
  id: 'htm-02', moduleId: 'm1', order: 2, minutes: 65, tags: ['html', 'links', 'imagens', 'tabelas'],
  title: 'Texto, links, imagens, mídia e tabelas',
  objectives: ['Marcar texto, listas e ênfase corretamente', 'Escrever links com texto descritivo e imagens com alt adequado', 'Diferenciar imagem informativa de decorativa', 'Construir tabelas de dados acessíveis'],
  intro: `Textos, links, imagens e tabelas aparecem em todo site. Cada um tem armadilhas que afetam quem navega com leitor de tela, e a maioria delas se resolve com marcação correta, sem nenhum custo de design.`,
  theory: `### Texto e listas
- §<p>§ para parágrafos. Nunca use §<br>§ para criar espaço entre parágrafos.
- §<ul>§ (lista sem ordem), §<ol>§ (com ordem) e §<li>§ para itens. Menus de navegação também são listas de links.
- §<strong>§ indica **importância**; §<em>§ indica **ênfase**. §<b>§ e §<i>§ existem, mas sem esse valor semântico; negrito e itálico visuais são papel do CSS.

### Links
- §<a href="...">§ leva a outro lugar. Para **ações** na página (abrir um modal, enviar algo), use §<button>§.
- O texto do link deve fazer sentido **fora de contexto**, porque leitores de tela listam os links da página. Segundo a MDN, evite "clique aqui": prefira "Saiba mais sobre baleias".
- Evite §href="#"§ e §javascript:void(0)§ para ações: use um botão.
- Sinalize quando o link abre em outra janela ou leva a um arquivo que não é HTML (ex.: "Relatório (PDF)").
- Um **link para pular a navegação** (*skip link*) no topo da página permite que o usuário de teclado vá direto ao conteúdo.

### Imagens e o atributo alt
§<img src="gato.jpg" alt="Gato laranja dormindo sobre um sofá">§
- **Imagem informativa:** alt descreve brevemente o que a imagem comunica, no contexto.
- **Imagem decorativa:** alt vazio (§alt=""§), para o leitor de tela ignorá-la. Sem o atributo alt, alguns leitores de tela leem o nome do arquivo.
- Não coloque texto importante dentro de imagens e não use nomes de arquivo como alt.
- §<figure>§ com §<figcaption>§ liga uma imagem a uma legenda visível.
- A WCAG 2.2 trata isso no critério 1.1.1 (Conteúdo não textual, nível A): conteúdo não textual precisa de alternativa em texto equivalente.
- Defina §width§ e §height§ (ou uma proporção em CSS) para evitar que o layout "pule" quando a imagem carrega.

### Áudio e vídeo
§<video controls>§ e §<audio controls>§ exibem os controles nativos. Ofereça legendas e transcrição para quem não pode ouvir.

### Tabelas
Tabelas servem para **dados**, não para posicionar elementos na tela.
- §<table>§, §<caption>§ (título da tabela), §<thead>§, §<tbody>§, §<tr>§ (linha), §<th>§ (cabeçalho) e §<td>§ (dado).
- §<th scope="col">§ e §<th scope="row">§ informam a quem usa leitor de tela a que cabeçalho cada dado pertence.

### Caracteres especiais
Use entidades quando precisar mostrar caracteres reservados: §&lt;§ para <, §&gt;§ para > e §&amp;§ para &.`,
  concepts: [
    { term: 'alt', def: 'Texto alternativo de uma imagem; vazio quando a imagem é decorativa.' },
    { term: 'Imagem decorativa', def: 'Imagem sem informação própria, marcada com alt="" para ser ignorada.' },
    { term: 'Skip link', def: 'Link no início da página que pula a navegação repetida e vai ao conteúdo principal.' },
    { term: 'figure e figcaption', def: 'Elementos que associam uma imagem (ou outro conteúdo) a uma legenda.' },
    { term: 'scope em th', def: 'Atributo que indica se o cabeçalho vale para a coluna (col) ou para a linha (row).' },
    { term: 'caption', def: 'Título de uma tabela, lido por tecnologias assistivas.' }
  ],
  examples: `**Analogia do alt:** é como descrever uma foto por telefone para alguém que não pode vê-la. Você diz o que importa naquele contexto ("gráfico de vendas, crescendo 20% no ano"), não cada pixel, e não diz "foto de" nem o nome do arquivo.

**Exemplos de texto de link:**
- Ruim: "Para ver a política de privacidade, **clique aqui**."
- Bom: "Leia a **política de privacidade**."`,
  code: [
    { title: 'Imagens e links bem marcados', lang: 'html', code: R`<a class="skip" href="#conteudo">Pular para o conteúdo</a>

<figure>
  <img src="/img/grafico-vendas.png" alt="Gráfico de barras: as vendas cresceram 20% em 2026" width="600" height="320">
  <figcaption>Vendas anuais</figcaption>
</figure>

<img src="/img/divisor.svg" alt="" width="40" height="4">

<p>Veja o <a href="/relatorio.pdf">relatório completo (PDF)</a>.</p>`,
      notes: [ { l: '1', t: 'Skip link que leva ao elemento com id="conteudo".' }, { l: '4', t: 'Imagem informativa: alt descreve a mensagem do gráfico. width e height reservam espaço.' }, { l: '8', t: 'Imagem decorativa: alt vazio.' }, { l: '10', t: 'O texto do link diz para onde vai e que o arquivo é um PDF.' } ] },
    { title: 'Tabela de dados acessível', lang: 'html', code: R`<table>
  <caption>Notas do primeiro semestre</caption>
  <thead>
    <tr><th scope="col">Aluno</th><th scope="col">Nota</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Ana</th><td>9,0</td></tr>
    <tr><th scope="row">Bruno</th><td>7,5</td></tr>
  </tbody>
</table>`,
      notes: [ { l: '2', t: 'caption nomeia a tabela.' }, { l: '4', t: 'th com scope="col" identifica os cabeçalhos das colunas.' }, { l: '8-9', t: 'th com scope="row" torna o nome do aluno o cabeçalho da linha.' } ] },
    { title: 'Procurando imagens sem alt (JavaScript)', lang: 'javascript', code: R`function imagensSemAlt(html) {
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  return imgs.filter((tag) => !/\balt\s*=/i.test(tag));
}

console.log(imagensSemAlt('<img src="a.png"><img src="b.png" alt="">')); // ['<img src="a.png">']`,
      notes: [ { l: '2', t: 'Captura cada tag img.' }, { l: '3', t: 'Mantém as que não têm o atributo alt. Note: alt="" é válido (decorativa), por isso testamos a presença do atributo, não do valor.' } ] }
  ],
  bestPractices: ['Escreva textos de link que façam sentido sozinhos.', 'Todo img tem o atributo alt; vazio se for decorativa.', 'Descreva o propósito da imagem, não cada detalhe.', 'Use tabelas apenas para dados, com caption e th com scope.', 'Reserve o espaço das imagens com width e height.', 'Ofereça legendas e transcrição para áudio e vídeo.'],
  mistakes: ['"Clique aqui" como texto de link.', 'Omitir o atributo alt (e não apenas deixá-lo vazio).', 'Usar o nome do arquivo ou "imagem de" como alt.', 'Colocar texto importante em imagens.', 'Usar tabelas para montar o layout da página.', 'Usar href="#" para ações.'],
  market: `Texto alternativo e links descritivos são os problemas de acessibilidade mais frequentes em varreduras automáticas de sites e viram exigência em contratos e licitações. Também melhoram SEO: buscadores leem alt e o texto dos links.`,
  summary: `Marque o texto pelo significado. Links precisam de texto descritivo; ações pedem button. Toda imagem tem alt: descritivo se informa, vazio se decora. Tabelas são para dados e usam caption e th com scope. Reserve espaço para imagens com width e height.`,
  refs: [REF.mdnHtml, REF.mdnA11yHtml, REF.wcag22],
  cards: [
    { q: 'Quando usar alt=""?', a: 'Quando a imagem é decorativa e não traz informação; o leitor de tela a ignora.' },
    { q: 'Qual a diferença entre strong e b?', a: 'strong indica importância (semântica); b é só negrito visual, sem esse valor.' },
    { q: 'O que o critério 1.1.1 da WCAG exige?', a: 'Que conteúdo não textual tenha uma alternativa em texto que cumpra o mesmo propósito (nível A).' }
  ]
},
{
  id: 'htm-03', moduleId: 'm1', order: 3, minutes: 70, tags: ['html', 'formularios', 'validacao', 'acessibilidade'],
  title: 'Formulários e validação nativa',
  objectives: ['Construir formulários com label, input, select, textarea e button', 'Associar cada campo ao seu rótulo', 'Usar tipos de input e atributos de validação nativos', 'Dar mensagens de erro claras e acessíveis'],
  intro: `Formulários são o ponto onde o usuário entrega informação ao seu sistema: cadastro, login, compra. Um formulário mal marcado trava justamente quem mais precisa: pessoas com leitor de tela, teclado ou celular.`,
  theory: `### Estrutura básica
§<form action="/cadastro" method="post">§ agrupa campos e define para onde os dados vão. Cada campo precisa de **três coisas**: um §name§ (a chave enviada), um **rótulo** visível e o tipo certo.

### Rótulos: a regra mais importante
Todo campo precisa de um §<label>§ associado. Há duas formas:

    <label for="email">E-mail</label>
    <input id="email" name="email" type="email">

ou envolvendo o campo: §<label>E-mail <input name="email" type="email"></label>§. Segundo a MDN, sem essa associação um leitor de tela pode anunciar apenas "campo de edição". O rótulo também aumenta a área clicável: clicar nele foca o campo. §placeholder§ **não** substitui o rótulo: some quando o usuário digita e costuma ter pouco contraste.

### Tipos de input
§text§, §email§, §password§, §number§, §tel§, §url§, §date§, §checkbox§, §radio§, §file§, §search§... O tipo certo faz o celular mostrar o teclado adequado e habilita validação nativa (§type="email"§ exige um formato de e-mail).

Outros controles: §<select>§ com §<option>§, §<textarea>§ para texto longo, e §<button type="submit">§ para enviar. Grupos de §radio§ ou §checkbox§ relacionados ficam em §<fieldset>§ com §<legend>§ (a pergunta).

### Validação nativa
Atributos que o navegador valida sozinho antes de enviar: §required§, §minlength§, §maxlength§, §min§, §max§, §pattern§ (expressão regular) e o próprio §type§. A pseudo-classe CSS §:invalid§ permite estilizar campos inválidos. Validação no navegador é **conforto para o usuário, não segurança**: o servidor sempre precisa validar de novo.

### Mensagens de erro
- Diga **qual campo** tem problema e **como corrigir** ("Informe um e-mail no formato nome@dominio.com").
- Não use só a cor vermelha para sinalizar erro: acrescente texto ou ícone.
- Ligue a mensagem ao campo com §aria-describedby§, para que o leitor de tela a leia junto com o campo.
- Para campos obrigatórios, use §required§ e também indique visualmente (ex.: "(obrigatório)").

### Autocompletar e botões
O atributo §autocomplete§ (ex.: §autocomplete="email"§) ajuda o navegador a preencher dados do usuário. Botões devem ter texto claro ("Criar conta", e não "OK"). Dentro de um formulário, um §<button>§ sem §type§ é do tipo §submit§: use §type="button"§ para botões que não enviam.`,
  concepts: [
    { term: 'label for/id', def: 'Associação que liga um rótulo ao campo cujo id é igual ao valor de for.' },
    { term: 'name', def: 'Nome do campo enviado ao servidor junto com o valor.' },
    { term: 'Validação nativa', def: 'Checagem feita pelo navegador a partir de type, required, pattern, min e max.' },
    { term: 'fieldset e legend', def: 'Agrupam controles relacionados e dão um título ao grupo.' },
    { term: 'aria-describedby', def: 'Atributo que liga um elemento (como uma mensagem de erro) à descrição de outro.' },
    { term: 'autocomplete', def: 'Dica ao navegador sobre qual dado preencher automaticamente.' }
  ],
  examples: `**Analogia:** um formulário é um balcão de atendimento. O rótulo é a plaquinha "Informe seu CPF"; sem ela, a pessoa que não enxerga o balcão não sabe o que dizer. O placeholder é um lembrete a lápis na plaquinha, que some quando a pessoa começa a escrever.`,
  code: [
    { title: 'Formulário de cadastro acessível', lang: 'html', code: R`<form action="/cadastro" method="post">
  <div>
    <label for="nome">Nome completo</label>
    <input id="nome" name="nome" type="text" autocomplete="name" required>
  </div>
  <div>
    <label for="email">E-mail</label>
    <input id="email" name="email" type="email" autocomplete="email"
           required aria-describedby="email-ajuda">
    <p id="email-ajuda">Usaremos para enviar a confirmação.</p>
  </div>
  <fieldset>
    <legend>Plano</legend>
    <label><input type="radio" name="plano" value="gratis" checked> Grátis</label>
    <label><input type="radio" name="plano" value="pro"> Pro</label>
  </fieldset>
  <button type="submit">Criar conta</button>
</form>`,
      notes: [ { l: '3-4', t: 'label e input ligados por for e id.' }, { l: '9-10', t: 'aria-describedby aponta para o id do texto de ajuda, lido junto com o campo.' }, { l: '13-16', t: 'Radios relacionados ficam em fieldset com legend; aqui o label envolve o input.' }, { l: '17', t: 'Botão com texto claro e type="submit" explícito.' } ] },
    { title: 'Procurando campos sem rótulo (JavaScript)', lang: 'javascript', code: R`function camposSemRotulo(html) {
  const paraIds = new Set([...html.matchAll(/<label\b[^>]*\sfor\s*=\s*"([^"]+)"/gi)].map((m) => m[1]));
  const campos = html.match(/<input\b[^>]*>/gi) || [];
  return campos.filter((tag) => {
    const tipo = (tag.match(/\btype\s*=\s*"([^"]+)"/i) || [, 'text'])[1].toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(tipo)) return false;
    const id = (tag.match(/\bid\s*=\s*"([^"]+)"/i) || [])[1];
    return !(id && paraIds.has(id)) && !/\baria-label\s*=/i.test(tag);
  });
}

console.log(camposSemRotulo('<label for="a">A</label><input id="a"><input id="b">'));
// ['<input id="b">']`,
      notes: [ { l: '2', t: 'Reúne os valores de for de todos os labels.' }, { l: '5-6', t: 'Ignora tipos que não precisam de rótulo (hidden e botões).' }, { l: '8', t: 'Um campo está rotulado se seu id aparece em algum for, ou se tem aria-label. Esta versão ainda não trata labels que envolvem o campo: o exercício pedirá isso.' } ] }
  ],
  bestPractices: ['Todo campo tem um label visível associado.', 'Use o type certo para cada dado.', 'Agrupe radios e checkboxes com fieldset e legend.', 'Escreva mensagens de erro que digam o que corrigir e não dependam só de cor.', 'Valide sempre no servidor, mesmo com validação nativa.', 'Use autocomplete nos campos pessoais.'],
  mistakes: ['Usar placeholder no lugar de label.', 'Campos sem name (os dados não são enviados).', 'Esquecer o type="button" em botões que não enviam.', 'Confiar apenas na validação do navegador.', 'Sinalizar erro só com a cor vermelha.', 'Usar o mesmo id em vários campos.'],
  market: `Formulários concentram conversão: cadastro, checkout, contato. Um erro de marcação vira abandono de compra ou ação judicial por inacessibilidade. Saber formulários nativos também reduz o JavaScript que você precisa escrever e manter.`,
  summary: `Todo campo precisa de name, label associado e tipo correto. Placeholder não é rótulo. Atributos nativos validam no navegador, mas o servidor decide. Mensagens de erro dizem como corrigir, não dependem só de cor e se ligam ao campo com aria-describedby.`,
  refs: [REF.mdnHtml, REF.mdnA11yHtml, REF.wcag22],
  cards: [
    { q: 'Como associar um label a um input?', a: 'Com for no label igual ao id do input, ou envolvendo o input com o label.' },
    { q: 'Placeholder substitui o label?', a: 'Não. Ele some ao digitar e costuma ter pouco contraste.' },
    { q: 'A validação nativa basta para segurança?', a: 'Não. Ela é conforto para o usuário; o servidor precisa validar de novo.' }
  ]
}
];
