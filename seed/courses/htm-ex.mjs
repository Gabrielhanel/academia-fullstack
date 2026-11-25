// Curso 3 — Exercícios por aula, avaliação final e projeto integrador.
// Código de teste e soluções em String.raw; "§" vira crase em _lib.fix().
const R = String.raw;

export const exsets = {
'htm-01': [
  { id: 'htm-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual elemento é o mais adequado para o bloco de links de navegação principal de um site?', options: ['§<div class="menu">§', '§<nav>§', '§<section>§', '§<span>§'], answer: 1, explanation: 'nav descreve o papel do bloco e cria um marco de navegação para leitores de tela. div e span não têm significado; section é um agrupamento temático, não navegação.' },
  { id: 'htm-01-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada elemento ao seu uso.', pairs: [['<main>', 'O conteúdo principal da página (um por página)'], ['<article>', 'Conteúdo independente, como um post'], ['<aside>', 'Conteúdo relacionado, lateral'], ['<footer>', 'Rodapé de uma página ou seção']], explanation: 'São elementos semânticos de estrutura. Eles dão significado e criam marcos de navegação.' },
  { id: 'htm-01-e3', type: 'tf', difficulty: 1, points: 5, prompt: 'Para deixar um título menor visualmente, o correto é trocar o h2 por um h4.', answer: false, explanation: 'O nível do título expressa a hierarquia do conteúdo. O tamanho visual é papel do CSS.' },
  { id: 'htm-01-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'O botão "Enviar" não pode ser acionado pelo teclado e não é anunciado como botão por leitores de tela. Clique na linha que causa o problema.', code: "<form>\n  <label for=\"msg\">Mensagem</label>\n  <textarea id=\"msg\" name=\"msg\"></textarea>\n  <div class=\"botao\" onclick=\"enviar()\">Enviar</div>\n</form>", answer: 4, explanation: 'Um div não é focável nem tem papel de botão. O correto é <button type="submit">Enviar</button>, que já traz foco, teclado e semântica.' },
  { id: 'htm-01-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §verificarTitulos(html)§, que analisa a hierarquia de títulos de um HTML (texto) e devolve §{ ok, problemas }§. §problemas§ é uma lista de textos, nesta ordem: §"sem-h1"§ se não houver nenhum §h1§; §"varios-h1"§ se houver mais de um; e, para cada salto de nível ao descer (ex.: h2 seguido de h4), §"salto:h2>h4"§. O primeiro título da página nunca conta como salto. §ok§ é §true§ quando não há problemas.', lang: 'javascript',
    starter: "function verificarTitulos(html) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'hierarquia correta', code: R`const r = verificarTitulos('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>');
assert.deepEqual(r, { ok: true, problemas: [] });` },
      { name: 'salto de nível', code: R`const r = verificarTitulos('<h1>A</h1><h2>B</h2><h4>C</h4>');
assert.equal(r.ok, false); assert.deepEqual(r.problemas, ['salto:h2>h4']);` },
      { name: 'sem h1', code: R`const r = verificarTitulos('<h2>A</h2><h3>B</h3>');
assert.deepEqual(r.problemas, ['sem-h1']);` },
      { name: 'vários h1', code: R`const r = verificarTitulos('<h1>A</h1><h2>B</h2><h1>C</h1>');
assert.deepEqual(r.problemas, ['varios-h1']);` },
      { name: 'voltar de nível não é salto', code: R`const r = verificarTitulos('<h1>A</h1><h2>B</h2><h3>C</h3><h1 class="x">D</h1>');
assert.deepEqual(r.problemas, ['varios-h1']);` },
      { name: 'ignora maiúsculas e atributos; sem títulos', code: R`assert.deepEqual(verificarTitulos('<H1 id="t">A</H1><H3>B</H3>').problemas, ['salto:h1>h3']);
assert.deepEqual(verificarTitulos('<p>nada</p>').problemas, ['sem-h1']);` }
    ],
    hints: ['Extraia os níveis com uma expressão regular global, como /<h([1-6])\\b/gi.', 'Compare cada nível com o anterior: se nivel > anterior + 1, é um salto.', 'Conte quantos níveis valem 1 para sem-h1 e varios-h1.'],
    solution: R`function verificarTitulos(html) {
  const niveis = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const problemas = [];
  const h1 = niveis.filter((n) => n === 1).length;
  if (h1 === 0) problemas.push('sem-h1');
  if (h1 > 1) problemas.push('varios-h1');
  for (let i = 1; i < niveis.length; i++) {
    if (niveis[i] > niveis[i - 1] + 1) problemas.push('salto:h' + niveis[i - 1] + '>h' + niveis[i]);
  }
  return { ok: problemas.length === 0, problemas };
}`, explanation: 'Os níveis são extraídos na ordem do documento. Contar os h1 resolve as duas primeiras regras; comparar cada nível com o anterior detecta os saltos. Descer de volta (h3 para h1) é permitido.' }
],
'htm-02': [
  { id: 'htm-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Uma imagem é apenas um enfeite, sem informação própria. Qual é a marcação correta?', options: ['<img src="enfeite.svg">', '<img src="enfeite.svg" alt="enfeite.svg">', '<img src="enfeite.svg" alt="">', '<img src="enfeite.svg" alt="imagem">'], answer: 2, explanation: 'alt vazio indica imagem decorativa, e o leitor de tela a ignora. Sem o atributo, alguns leitores leem o nome do arquivo; "imagem" e o nome do arquivo só atrapalham.' },
  { id: 'htm-02-e2', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a tabela para ser acessível.', code: "<table>\n  <[[0]]>Notas do semestre</caption>\n  <tr><th [[1]]=\"col\">Aluno</th><th scope=\"col\">Nota</th></tr>\n</table>", answers: [['caption'], ['scope']], explanation: 'caption dá o título da tabela, e scope informa a quem usa leitor de tela se o cabeçalho vale para a coluna ou para a linha.' },
  { id: 'htm-02-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Um leitor de tela lista os links da página fora de contexto e todos soam como "clique aqui". Clique na linha com o texto de link que precisa mudar.', code: "<p>Conheça nossa <a href=\"/missao\">missão e valores</a>.</p>\n<p>Veja os preços: <a href=\"/precos\">clique aqui</a>.</p>\n<p>Fale com a <a href=\"/contato\">equipe de suporte</a>.</p>", answer: 2, explanation: '"Clique aqui" não diz para onde o link leva. Algo como "Veja a tabela de preços" faz sentido mesmo quando a lista de links é lida isolada.' },
  { id: 'htm-02-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada imagem ao alt mais adequado.', pairs: [['Gráfico mostrando vendas +20% em 2026', 'Gráfico de barras: as vendas cresceram 20% em 2026'], ['Linha ornamental entre seções', '(alt vazio)'], ['Botão de lupa que abre a busca', 'Buscar'], ['Foto da equipe no escritório, ao lado do texto "Nosso time"', 'Equipe reunida em volta de uma mesa no escritório']], explanation: 'A informação depende do contexto: gráficos descrevem a mensagem; ornamentos ficam vazios; imagens que funcionam como controle descrevem a ação.' },
  { id: 'htm-02-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §auditarImagens(html)§. Para cada tag §<img>§ do texto, em ordem, devolva um item §{ src, problema }§ quando houver problema: §"sem-alt"§ se a tag não tiver o atributo §alt§ (um §alt=""§ é válido) ou §"alt-nome-arquivo"§ se o alt terminar com uma extensão de imagem (.png, .jpg, .jpeg, .gif, .svg ou .webp, sem diferenciar maiúsculas). §src§ é o valor do atributo §src§ (ou §""§). Aceite aspas simples ou duplas.', lang: 'javascript',
    starter: "function auditarImagens(html) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'sem alt', code: R`assert.deepEqual(auditarImagens('<img src="a.png">'), [{ src: 'a.png', problema: 'sem-alt' }]);` },
      { name: 'alt vazio é válido', code: R`assert.deepEqual(auditarImagens('<img src="a.png" alt="">'), []);` },
      { name: 'alt com nome de arquivo', code: R`assert.deepEqual(auditarImagens('<img src="a.png" alt="IMG_0042.JPG">'), [{ src: 'a.png', problema: 'alt-nome-arquivo' }]);` },
      { name: 'alt descritivo e aspas simples', code: R`assert.deepEqual(auditarImagens("<img src='a.png' alt='Gato dormindo'>"), []);` },
      { name: 'várias imagens na ordem', code: R`const r = auditarImagens('<p><img alt="ok" src="1.png"><img src="2.png"><img src="3.png" alt="foto.webp"></p>');
assert.deepEqual(r, [{ src: '2.png', problema: 'sem-alt' }, { src: '3.png', problema: 'alt-nome-arquivo' }]);` },
      { name: 'data-alt não conta como alt', code: R`assert.deepEqual(auditarImagens('<img src="x.png" data-alt="oi">'), [{ src: 'x.png', problema: 'sem-alt' }]);` },
      { name: 'sem imagens', code: R`assert.deepEqual(auditarImagens('<p>texto</p>'), []);` }
    ],
    hints: ['Capture as tags com /<img\\b[^>]*>/gi.', 'Para ler um atributo, use uma expressão que exija um espaço antes do nome (assim "data-alt" não é confundido com "alt").', 'Distinga atributo ausente (null) de atributo vazio ("").'],
    solution: R`function auditarImagens(html) {
  const atributo = (tag, nome) => {
    const m = new RegExp('\\s' + nome + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(tag);
    return m ? (m[1] !== undefined ? m[1] : m[2]) : null;
  };
  const saida = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const alt = atributo(tag, 'alt');
    const src = atributo(tag, 'src') || '';
    if (alt === null) saida.push({ src, problema: 'sem-alt' });
    else if (/\.(png|jpe?g|gif|svg|webp)$/i.test(alt.trim())) saida.push({ src, problema: 'alt-nome-arquivo' });
  }
  return saida;
}`, explanation: 'O atributo é lido com uma expressão que exige um espaço antes do nome, o que descarta data-alt. A diferença entre null (ausente) e "" (vazio) separa o erro da imagem decorativa legítima.' },
  { id: 'htm-02-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Uma loja usa a imagem de um carrinho de compras como único conteúdo de um link para a página do carrinho. Qual deve ser o alt dessa imagem e por quê? Dê também um exemplo ruim.', model: 'O alt deve descrever a função do link, não a aparência da imagem: por exemplo alt="Carrinho de compras" (ou "Ver carrinho"). Como a imagem é o único conteúdo do link, é o alt que dá o nome ao link para leitores de tela. Exemplos ruins: alt vazio (o link ficaria sem nome, anunciado só como "link"), ausência do atributo, alt="carrinho.png" ou "imagem de um carrinho".', rubric: ['Diz que o alt descreve a função/destino do link, não a aparência', 'Observa que o alt é o nome do link, pois a imagem é o único conteúdo dele', 'Dá um alt adequado, como "Carrinho de compras" ou "Ver carrinho"', 'Dá um exemplo ruim, como alt vazio, sem alt ou nome de arquivo'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'htm-03': [
  { id: 'htm-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a forma correta de ligar um rótulo ao campo?', options: ['<label>E-mail</label><input id="email">', '<label for="email">E-mail</label><input id="email" name="email">', '<label id="email">E-mail</label><input for="email">', '<input placeholder="E-mail">'], answer: 1, explanation: 'O for do label precisa ser igual ao id do campo. Placeholder não é rótulo, e as outras opções não criam a associação.' },
  { id: 'htm-03-e2', type: 'tf', difficulty: 1, points: 5, prompt: 'Se o formulário tem validação com required e type="email", o servidor não precisa mais validar os dados.', answer: false, explanation: 'A validação do navegador é conforto para o usuário e pode ser ignorada por qualquer cliente. O servidor valida sempre.' },
  { id: 'htm-03-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Um leitor de tela anuncia o segundo campo apenas como "campo de edição". Clique na linha com o campo sem rótulo adequado.', code: "<label for=\"nome\">Nome</label>\n<input id=\"nome\" name=\"nome\">\n<input id=\"sobrenome\" name=\"sobrenome\" placeholder=\"Sobrenome\">\n<button type=\"submit\">Enviar</button>", answer: 3, explanation: 'O placeholder não é rótulo: some ao digitar e não tem o papel de label. Falta um <label for="sobrenome">.' },
  { id: 'htm-03-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para agrupar as opções de plano com um título e ligar a mensagem de ajuda ao campo.', code: "<[[0]]>\n  <legend>Plano</legend>\n  <label><input type=\"radio\" name=\"plano\" value=\"pro\"> Pro</label>\n</fieldset>\n<input id=\"cpf\" name=\"cpf\" [[1]]=\"ajuda-cpf\">\n<p id=\"ajuda-cpf\">Só números.</p>", answers: [['fieldset'], ['aria-describedby']], explanation: 'fieldset com legend agrupa controles relacionados; aria-describedby liga o texto de ajuda ao campo para que seja lido junto.' },
  { id: 'htm-03-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §auditarCampos(html)§: devolve a lista (na ordem do documento) dos campos §<input>§, §<select>§ e §<textarea>§ **sem rótulo**. Cada item é o §id§ do campo, ou o §name§ se não tiver id, ou §"(sem id)"§. Um campo tem rótulo se: seu id aparece em §for§ de algum §<label>§; **ou** ele está dentro de um §<label>…</label>§; **ou** tem §aria-label§ ou §aria-labelledby§ não vazio. Ignore §input§ dos tipos §hidden§, §submit§, §button§, §reset§ e §image§.', lang: 'javascript',
    starter: "function auditarCampos(html) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'label com for e id', code: R`assert.deepEqual(auditarCampos('<label for="a">A</label><input id="a"><input id="b">'), ['b']);` },
      { name: 'campo dentro do label', code: R`assert.deepEqual(auditarCampos('<label>Nome <input name="n"></label><input name="x">'), ['x']);` },
      { name: 'aria-label e aria-labelledby', code: R`assert.deepEqual(auditarCampos('<input id="a" aria-label="Busca"><input id="b" aria-labelledby="t"><input id="c" aria-label="">'), ['c']);` },
      { name: 'ignora hidden e botões', code: R`assert.deepEqual(auditarCampos('<input type="hidden" name="t"><input type="submit"><input type="BUTTON"><input type="text" id="z">'), ['z']);` },
      { name: 'select e textarea', code: R`assert.deepEqual(auditarCampos('<select id="s"></select><textarea name="msg"></textarea><label for="s">S</label>'), ['msg']);` },
      { name: 'campo sem id nem name', code: R`assert.deepEqual(auditarCampos('<input type="text">'), ['(sem id)']);` },
      { name: 'for que aponta para id inexistente não rotula', code: R`assert.deepEqual(auditarCampos('<label for="outro">X</label><input id="a">'), ['a']);` },
      { name: 'desempenho', code: R`let h = ''; for (let i = 0; i < 3000; i++) h += '<label for="c' + i + '">C</label><input id="c' + i + '"><input id="s' + i + '">';
const t = Date.now(); const r = auditarCampos(h);
assert.equal(r.length, 3000); assert.ok(Date.now() - t < 1000, 'lento: ' + (Date.now() - t) + ' ms');` }
    ],
    hints: ['Percorra os labels com /<label\\b[^>]*>[\\s\\S]*?<\\/label>/gi e guarde a posição (index) de cada um e os valores de for.', 'Para saber se um campo está dentro de um label, compare o index dele com as posições inicial e final dos labels.', 'Use um Set com os for para consulta rápida.'],
    solution: R`function auditarCampos(html) {
  const atributo = (tag, nome) => {
    const m = new RegExp('\\s' + nome + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(tag);
    return m ? (m[1] !== undefined ? m[1] : m[2]) : null;
  };
  const paraIds = new Set();
  const faixas = [];
  const reL = /<label\b[^>]*>[\s\S]*?<\/label>/gi;
  let m;
  while ((m = reL.exec(html)) !== null) {
    faixas.push([m.index, m.index + m[0].length]);
    const f = atributo(m[0].slice(0, m[0].indexOf('>') + 1), 'for');
    if (f) paraIds.add(f);
  }
  const semRotulo = [];
  const reT = /<(input|select|textarea)\b[^>]*>/gi;
  let j = 0;
  while ((m = reT.exec(html)) !== null) {
    const tag = m[0];
    const tipo = (atributo(tag, 'type') || 'text').toLowerCase();
    if (m[1].toLowerCase() === 'input' && ['hidden', 'submit', 'button', 'reset', 'image'].includes(tipo)) continue;
    while (j < faixas.length && faixas[j][1] <= m.index) j++;
    const dentro = j < faixas.length && faixas[j][0] <= m.index;
    const id = atributo(tag, 'id');
    const rotulado = dentro || (id && paraIds.has(id)) || atributo(tag, 'aria-label') || atributo(tag, 'aria-labelledby');
    if (!rotulado) semRotulo.push(id || atributo(tag, 'name') || '(sem id)');
  }
  return semRotulo;
}`, explanation: 'Primeiro coletam-se as posições dos labels e os valores de for. Depois, os campos são percorridos em ordem com um ponteiro nas faixas dos labels, o que mantém o custo linear. Um campo é rotulado se está dentro de um label, se seu id aparece em um for ou se tem um nome acessível por ARIA.' },
  { id: 'htm-03-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Ao enviar um cadastro, o campo de e-mail está em branco. Descreva como deve ser a mensagem de erro e como ligá-la ao campo, de modo que funcione para quem usa leitor de tela e para quem não distingue cores.', model: 'A mensagem deve ser em texto, junto ao campo, dizendo qual é o problema e como corrigir (por exemplo, "Informe seu e-mail no formato nome@dominio.com"). Ela deve ser ligada ao campo com aria-describedby apontando para o id da mensagem, para ser lida junto com o campo (e o campo pode receber aria-invalid="true"). Não deve depender só da cor vermelha: deve ter texto e, se possível, um ícone ou prefixo ("Erro:"). Ao falhar, é bom mover o foco para o primeiro campo com erro.', rubric: ['Mensagem em texto, junto ao campo, dizendo o que corrigir', 'Liga a mensagem ao campo com aria-describedby', 'Não depende só da cor (texto ou ícone)', 'Menciona levar o foco ao primeiro erro, ou aria-invalid'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'htm-04': [
  { id: 'htm-04-e1', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada seletor à sua especificidade (id–classe–tipo).', pairs: [['#menu a:hover', '1–1–1'], ['.a .b .c', '0–3–0'], ['ul li', '0–0–2'], ['a[href^="http"]::after', '0–1–2']], explanation: '#menu = id; a:hover = tipo + pseudo-classe; .a .b .c = três classes; ul li = dois tipos; atributo conta como classe e ::after como tipo.' },
  { id: 'htm-04-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Qual cor o parágrafo terá? Considere o HTML <p id="x" class="aviso">Oi</p> e o CSS.', code: "p { color: black; }\n.aviso { color: red; }\n#x { color: green; }\np.aviso { color: blue; }", lang: 'css', steps: [ { q: 'Cor final do parágrafo', answers: ['green', 'verde'] }, { q: 'Especificidade do seletor que venceu (formato 0-0-0)', answers: ['1-0-0'] }, { q: 'Se a regra #x fosse removida, qual seria a cor?', answers: ['blue', 'azul'] } ], explanation: 'O id (1-0-0) vence p.aviso (0-1-1), .aviso (0-1-0) e p (0-0-1). Sem ele, p.aviso (0-1-1) vence .aviso (0-1-0).' },
  { id: 'htm-04-e3', type: 'mc', difficulty: 2, points: 10, prompt: 'Duas regras com a mesma especificidade disputam a mesma propriedade. Qual vence?', options: ['A que aparece primeiro no código', 'A que aparece por último no código', 'A do arquivo mais curto', 'Nenhuma: o navegador ignora as duas'], answer: 1, explanation: 'Em empate de origem e de especificidade, a última declaração vence.' },
  { id: 'htm-04-e4', type: 'tf', difficulty: 1, points: 5, prompt: 'A propriedade margin é herdada pelos elementos filhos.', answer: false, explanation: 'margin, padding e border não são herdadas. color, font-family e line-height são.' },
  { id: 'htm-04-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §especificidade(seletor)§ para seletores simples (sem §:is()§, §:not()§, §:where()§ ou §:has()§). Devolva o array §[ids, classes, tipos]§: ids contam como id; classes, atributos e pseudo-classes contam como classe; seletores de tipo e pseudo-elementos (§::x§) contam como tipo. O seletor universal §*§ e os combinadores (espaço, §>§, §+§, §~§) não contam.', lang: 'javascript',
    starter: "function especificidade(seletor) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'id, pseudo-classe e tipo', code: R`assert.deepEqual(especificidade('#menu a:hover'), [1, 1, 1]);` },
      { name: 'classes encadeadas', code: R`assert.deepEqual(especificidade('.a .b .c'), [0, 3, 0]);` },
      { name: 'tipos', code: R`assert.deepEqual(especificidade('ul li'), [0, 0, 2]);` },
      { name: 'atributo com valor e pseudo-elemento', code: R`assert.deepEqual(especificidade('a[href^="http"]::after'), [0, 1, 2]);` },
      { name: 'pseudo-classe com argumento', code: R`assert.deepEqual(especificidade('li:nth-child(2n+1)'), [0, 1, 1]);` },
      { name: 'universal e combinadores não contam', code: R`assert.deepEqual(especificidade('*'), [0, 0, 0]);
assert.deepEqual(especificidade('nav > a + .x'), [0, 1, 2]);` },
      { name: 'id, classe e atributo juntos', code: R`assert.deepEqual(especificidade('#a.b[type="text"]'), [1, 2, 0]);` },
      { name: 'texto dentro de atributo não conta', code: R`assert.deepEqual(especificidade('[data-x="#id .classe div"]'), [0, 1, 0]);` }
    ],
    hints: ['Remova primeiro os atributos ([...]), contando cada um como classe, para que o texto dentro deles não seja contado de novo.', 'Trate "::" antes de ":" para que um pseudo-elemento não seja contado como pseudo-classe.', 'Depois de remover tudo isso, conte ids (#x), classes (.x) e, por fim, o que sobrou com letras (tipos).'],
    solution: R`function especificidade(seletor) {
  let a = 0, b = 0, c = 0;
  let s = seletor.replace(/\[[^\]]*\]/g, () => { b++; return ' '; });
  s = s.replace(/::[a-zA-Z-]+/g, () => { c++; return ' '; });
  s = s.replace(/:[a-zA-Z-]+(\([^)]*\))?/g, () => { b++; return ' '; });
  s = s.replace(/#[\w-]+/g, () => { a++; return ' '; });
  s = s.replace(/\.[\w-]+/g, () => { b++; return ' '; });
  s = s.replace(/[a-zA-Z][\w-]*/g, () => { c++; return ' '; });
  return [a, b, c];
}`, explanation: 'A ordem das remoções evita contagem dupla: atributos primeiro (guardam texto arbitrário), "::" antes de ":", e os tipos por último, porque nomes de classe e de id já foram removidos.' }
],
'htm-05': [
  { id: 'htm-05-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'Considere a regra abaixo aplicada a uma caixa.', code: ".caixa {\n  width: 300px;\n  padding: 20px;\n  border: 5px solid;\n  margin: 10px;\n}", lang: 'css', steps: [ { q: 'Largura ocupada pela caixa (até a borda) em content-box, em px', answers: ['350'] }, { q: 'Largura ocupada pela caixa (até a borda) em border-box, em px', answers: ['300'] }, { q: 'Largura total incluindo as margens laterais em content-box, em px', answers: ['370'] } ], explanation: 'content-box: 300 + 2×20 + 2×5 = 350. border-box: 300. Somando as margens laterais (10 + 10): 370.' },
  { id: 'htm-05-e2', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que muitos projetos aplicam §box-sizing: border-box§ a todos os elementos?', options: ['Porque deixa o site mais rápido', 'Porque width e height passam a incluir padding e borda, tornando as contas mais previsíveis', 'Porque remove a margem dos elementos', 'Porque é obrigatório pela especificação'], answer: 1, explanation: 'Com border-box, o tamanho declarado é o tamanho visível da caixa, e adicionar padding não estoura a largura do container.' },
  { id: 'htm-05-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a unidade ao que ela representa.', pairs: [['rem', 'Relativa ao tamanho de fonte do elemento raiz'], ['%', 'Relativa ao tamanho do elemento pai'], ['vw', '1% da largura da janela'], ['ch', 'Largura aproximada de um caractere']], explanation: 'Cada unidade tem um uso: rem para fontes e espaços acessíveis, % para proporções, vw para larguras da janela e ch para limitar o comprimento de linhas.' },
  { id: 'htm-05-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o reset recomendado e o limite de linha confortável.', code: "*, *::before, *::after { box-sizing: [[0]]; }\n.texto { max-width: 65[[1]]; }", answers: [['border-box'], ['ch']], explanation: 'border-box facilita as contas; 65ch limita a linha a cerca de 65 caracteres, tamanho confortável de leitura.' },
  { id: 'htm-05-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §caixa(dados, boxSizing)§: §dados§ tem §width§, §padding§, §border§ e §margin§ (px; os ausentes valem 0), aplicados aos **quatro lados** por igual. §boxSizing§ é §"content-box"§ (padrão) ou §"border-box"§. Devolva §{ largura, total }§: §largura§ é a largura ocupada até a borda e §total§ soma as margens laterais. Valores negativos de §padding§ ou §border§ lançam um erro.', lang: 'javascript',
    starter: "function caixa(dados, boxSizing = 'content-box') {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'content-box soma padding e borda', code: R`assert.deepEqual(caixa({ width: 350, padding: 25, border: 5 }), { largura: 410, total: 410 });` },
      { name: 'border-box mantém a largura', code: R`assert.deepEqual(caixa({ width: 350, padding: 25, border: 5 }, 'border-box'), { largura: 350, total: 350 });` },
      { name: 'com margem', code: R`assert.deepEqual(caixa({ width: 300, padding: 20, border: 5, margin: 10 }), { largura: 350, total: 370 });` },
      { name: 'margem negativa é permitida', code: R`assert.equal(caixa({ width: 100, margin: -10 }).total, 80);` },
      { name: 'padding negativo lança erro', code: R`assert.throws(() => caixa({ width: 100, padding: -1 }));` },
      { name: 'valores ausentes valem 0', code: R`assert.deepEqual(caixa({ width: 80 }), { largura: 80, total: 80 });` }
    ],
    hints: ['Em content-box: largura = width + 2×padding + 2×border.', 'Em border-box: a largura é o próprio width.', 'total = largura + 2×margin.'],
    solution: R`function caixa(dados, boxSizing = 'content-box') {
  const { width, padding = 0, border = 0, margin = 0 } = dados;
  if (padding < 0 || border < 0) throw new Error('padding e border não podem ser negativos');
  const largura = boxSizing === 'border-box' ? width : width + 2 * padding + 2 * border;
  return { largura, total: largura + 2 * margin };
}`, explanation: 'Em content-box, padding e borda dos dois lados somam ao width; em border-box, já estão incluídos. A margem fica fora da caixa e só entra no total. Margens podem ser negativas; padding e borda não.' },
  { id: 'htm-05-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Um designer entrega um botão com texto cinza #aaaaaa sobre fundo branco e diz que "ficou elegante". Como você responde, do ponto de vista técnico? Cite a regra e como corrigir.', model: 'A cor #aaaaaa sobre branco tem razão de contraste de cerca de 2,3:1, abaixo do mínimo de 4,5:1 para texto comum (WCAG 2.2, critério 1.4.3, nível AA). Isso dificulta a leitura para pessoas com baixa visão e em telas com brilho. A correção é escurecer o texto (ou o fundo) até atingir pelo menos 4,5:1, medindo com um calculador de contraste, por exemplo #767676 ou mais escuro, preservando a identidade visual com outras escolhas, como peso e tamanho.', rubric: ['Cita o mínimo de 4,5:1 para texto comum (WCAG 1.4.3, AA)', 'Diz que o contraste do par proposto está abaixo do mínimo', 'Explica o impacto (baixa visão, ambientes claros)', 'Propõe medir e escurecer o texto/ajustar o fundo até atingir a razão'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'htm-06': [
  { id: 'htm-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Você precisa alinhar, em uma única linha, o logotipo à esquerda e três links à direita. Qual a ferramenta mais adequada?', options: ['Grid com duas dimensões', 'Flexbox com justify-content: space-between', 'Float com clear', 'Uma tabela HTML'], answer: 1, explanation: 'É um problema de uma dimensão (uma linha). Flexbox resolve com poucas linhas. Tabelas não servem para layout.' },
  { id: 'htm-06-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a propriedade ao que ela faz.', pairs: [['gap', 'Define o espaço entre itens de um flex ou grid'], ['justify-content', 'Alinha os itens no eixo principal do flex'], ['grid-template-columns', 'Define as colunas do grid'], ['@media (min-width: 40rem)', 'Aplica regras só a partir de certa largura']], explanation: 'São as peças básicas de layout responsivo com Flexbox, Grid e media queries.' },
  { id: 'htm-06-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Um container de 900px de largura tem esta regra.', code: ".grade {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  gap: 30px;\n}", lang: 'css', steps: [ { q: 'Largura da primeira coluna, em px', answers: ['290'] }, { q: 'Largura da segunda coluna, em px', answers: ['580'] }, { q: 'Quantos px sobram para as colunas depois do gap?', answers: ['870'] } ], explanation: 'Descontado o gap de 30px, restam 870px divididos em 3 frações: 1fr = 290px e 2fr = 580px.' },
  { id: 'htm-06-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'Em celulares estreitos, os cartões ficam espremidos em três colunas. A intenção era uma abordagem mobile first. Clique na linha que contradiz essa abordagem.', code: ".cartoes {\n  display: grid;\n  gap: 1rem;\n  grid-template-columns: repeat(3, 1fr);\n}\n@media (min-width: 40rem) {\n  .cartoes { grid-template-columns: repeat(3, 1fr); }\n}", answer: 4, explanation: 'No mobile first, a regra base deve servir ao celular (1fr, uma coluna), e as colunas extras vêm dentro da media query min-width.' },
  { id: 'htm-06-e5', type: 'code', difficulty: 3, points: 20, prompt: 'Implemente §colunasGrid(largura, gap, fracoes)§, que calcula a largura em px de cada coluna de um grid com unidades §fr§. O espaço livre é §largura − gap × (n − 1)§, dividido proporcionalmente às frações. Se o espaço livre for negativo, devolva um array de zeros. Lance um erro se §fracoes§ estiver vazia ou tiver valores ≤ 0.', lang: 'javascript',
    starter: "function colunasGrid(largura, gap, fracoes) {\n  // seu código aqui\n}\n",
    tests: [
      { name: '1fr 2fr com gap', code: R`assert.deepEqual(colunasGrid(900, 30, [1, 2]), [290, 580]);` },
      { name: 'quatro colunas iguais', code: R`assert.deepEqual(colunasGrid(1000, 0, [1, 1, 1, 1]), [250, 250, 250, 250]);` },
      { name: 'uma coluna', code: R`assert.deepEqual(colunasGrid(600, 20, [1]), [600]);` },
      { name: 'espaço livre negativo', code: R`assert.deepEqual(colunasGrid(40, 30, [1, 1, 1]), [0, 0, 0]);` },
      { name: 'frações inválidas', code: R`assert.throws(() => colunasGrid(500, 10, []));
assert.throws(() => colunasGrid(500, 10, [1, 0]));` },
      { name: 'soma das colunas e gaps fecha a largura', code: R`const c = colunasGrid(1200, 24, [1, 3, 2]);
assert.ok(Math.abs(c.reduce((s, x) => s + x, 0) + 24 * 2 - 1200) < 1e-9);` }
    ],
    hints: ['livre = largura - gap * (n - 1)', 'Cada coluna = livre * fração / soma das frações.', 'Valide as frações antes de calcular.'],
    solution: R`function colunasGrid(largura, gap, fracoes) {
  if (!Array.isArray(fracoes) || fracoes.length === 0 || fracoes.some((f) => !(f > 0))) throw new Error('frações inválidas');
  const livre = largura - gap * (fracoes.length - 1);
  if (livre < 0) return fracoes.map(() => 0);
  const soma = fracoes.reduce((s, f) => s + f, 0);
  return fracoes.map((f) => (livre * f) / soma);
}`, explanation: 'O gap é descontado antes da divisão; só o espaço livre é distribuído. É exatamente como a unidade fr é definida: uma fração do espaço que sobra depois dos tamanhos fixos.' },
  { id: 'htm-06-e6', type: 'open', difficulty: 3, points: 15, prompt: 'Descreva, em passos, como você tornaria responsiva uma página com um menu lateral e uma galeria de cartões, que hoje só funciona bem em desktop.', model: 'Passos: (1) confirmar o meta viewport no HTML; (2) reescrever o CSS base para telas pequenas: menu em cima ou recolhido, galeria em uma coluna; (3) usar Grid na galeria, com gap, e acrescentar colunas com media queries min-width (ou repeat(auto-fit, minmax(16rem, 1fr))); (4) usar Grid ou Flexbox para o layout da página, trocando para menu lateral só a partir de uma largura em que há espaço; (5) escolher os pontos de quebra pelo conteúdo, não por aparelhos; (6) imagens com max-width: 100% e height: auto; (7) unidades relativas (rem, %) em vez de larguras fixas em px; (8) testar com zoom de 200% e com a janela estreita, sem rolagem horizontal.', rubric: ['Menciona o meta viewport', 'Propõe começar pelo layout de tela pequena (mobile first) e ampliar com min-width', 'Usa Flexbox ou Grid para o layout, em vez de larguras fixas', 'Trata imagens (max-width: 100%) ou unidades relativas', 'Cita testar em telas estreitas e/ou com zoom'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
],
'htm-07': [
  { id: 'htm-07-e1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe cada princípio da WCAG ao seu significado.', pairs: [['Perceptível', 'A informação pode ser percebida, por exemplo com alternativas em texto e contraste'], ['Operável', 'A interface pode ser usada, por exemplo pelo teclado'], ['Compreensível', 'O conteúdo e o uso são claros e previsíveis'], ['Robusto', 'Funciona com diferentes navegadores e tecnologias assistivas']], explanation: 'São os quatro princípios, conhecidos pela sigla POUR.' },
  { id: 'htm-07-e2', type: 'tf', difficulty: 1, points: 5, prompt: 'Aplicar outline: none em links e botões, sem nenhum estilo alternativo, é aceitável se o design fica mais limpo.', answer: false, explanation: 'Quem navega pelo teclado precisa ver onde está o foco (critério 2.4.7, nível AA). Se o contorno padrão não agrada, substitua-o por um estilo visível, como :focus-visible com outline claro.' },
  { id: 'htm-07-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O menu abre com o mouse, mas quem usa teclado nem consegue chegar ao botão. Clique na linha responsável.', code: "<nav>\n  <div class=\"botao-menu\" onclick=\"abrir()\">Menu</div>\n  <ul id=\"menu\" hidden>\n    <li><a href=\"/\">Início</a></li>\n  </ul>\n</nav>", answer: 2, explanation: 'Um div não recebe foco nem tem papel de botão. O correto é um <button type="button" aria-expanded="false" aria-controls="menu">; o ARIA descreve o estado, mas o foco e o teclado vêm do elemento nativo.' },
  { id: 'htm-07-e4', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual afirmação sobre ARIA está correta?', options: ['aria-label torna qualquer div focável e acionável por teclado', 'Role="button" faz um div responder a Enter e Espaço automaticamente', 'ARIA só descreve; o comportamento e o foco precisam vir do HTML nativo ou de script, e ARIA incorreto é pior que nenhum', 'ARIA deve ser usado em todos os elementos para garantir acessibilidade'], answer: 2, explanation: 'ARIA acrescenta informação para tecnologias assistivas, mas não cria foco, teclado nem estilo. Por isso se prefere o elemento nativo e se usa ARIA para o que sobra.' },
  { id: 'htm-07-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §razaoContraste(a, b)§ e §passaAA(texto, fundo, grande)§. §razaoContraste§ recebe duas cores em hexadecimal (§#rgb§ ou §#rrggbb§) e devolve a razão de contraste da WCAG **arredondada para 2 casas**. §passaAA§ devolve §true§ se a razão (**sem arredondar**) for pelo menos 4,5, ou 3 quando §grande§ for §true§. A razão não depende da ordem das cores.', lang: 'javascript',
    starter: "function razaoContraste(a, b) {\n  // seu código aqui\n}\n\nfunction passaAA(texto, fundo, grande = false) {\n  // seu código aqui\n}\n",
    tests: [
      { name: 'preto sobre branco', code: R`assert.equal(razaoContraste('#000', '#fff'), 21);` },
      { name: 'mesma cor', code: R`assert.equal(razaoContraste('#336699', '#336699'), 1);` },
      { name: '#767676 sobre branco', code: R`assert.equal(razaoContraste('#767676', '#ffffff'), 4.54);` },
      { name: '#777 sobre branco', code: R`assert.equal(razaoContraste('#777', '#fff'), 4.48);` },
      { name: 'ordem não importa', code: R`assert.equal(razaoContraste('#fff', '#767676'), razaoContraste('#767676', '#fff'));` },
      { name: 'passaAA texto comum', code: R`assert.equal(passaAA('#767676', '#fff'), true);
assert.equal(passaAA('#777', '#fff'), false);` },
      { name: 'passaAA texto grande usa 3:1', code: R`assert.equal(passaAA('#777', '#fff', true), true);
assert.equal(passaAA('#aaa', '#fff', true), false);` }
    ],
    hints: ['Converta cada par de hexadecimal em 0–1 dividindo por 255 e linearize: c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4.', 'Luminância = 0.2126·R + 0.7152·G + 0.0722·B.', 'Razão = (maior + 0.05) / (menor + 0.05). Arredonde só em razaoContraste.'],
    solution: R`function luminancia(hex) {
  const h = hex.replace('#', '');
  const cheio = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(cheio.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function razaoBruta(a, b) {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior + 0.05) / (menor + 0.05);
}
function razaoContraste(a, b) {
  return Math.round(razaoBruta(a, b) * 100) / 100;
}
function passaAA(texto, fundo, grande = false) {
  return razaoBruta(texto, fundo) >= (grande ? 3 : 4.5);
}`, explanation: 'A luminância relativa pondera os canais lineares do sRGB. A razão usa sempre a cor mais clara no numerador. A decisão de passar ou não usa o valor sem arredondar, porque um 4,497 arredondado para 4,50 não cumpre o critério.' },
  { id: 'htm-07-e6', type: 'mc', difficulty: 2, points: 10, prompt: 'Segundo a WCAG 2.2 (critério 2.5.8, AA), qual é o tamanho mínimo de um alvo de ponteiro, sem considerar as exceções?', options: ['10 × 10 px CSS', '24 × 24 px CSS', '44 × 44 px CSS', '100 × 100 px CSS'], answer: 1, explanation: 'O mínimo é 24×24 px CSS, ou o espaçamento equivalente. Os 44 px são uma recomendação mais confortável, usada no nível AAA e em diretrizes de plataformas.' },
  { id: 'htm-07-e7', type: 'open', difficulty: 3, points: 15, prompt: 'Você terminou uma página e precisa dizer ao seu time que ela é acessível. Descreva uma rotina de teste com pelo menos quatro verificações e explique por que apenas rodar uma ferramenta automática não basta.', model: 'Rotina: (1) navegar só com o teclado (Tab, Shift+Tab, Enter, Espaço): chegar a tudo, foco visível e ordem lógica; (2) zoom de 200% e texto maior sem perder conteúdo; (3) verificar contraste dos pares de cores de texto, e tamanho dos alvos; (4) testar os fluxos principais com leitor de tela; (5) conferir estrutura: lang, títulos sem saltos, alt, rótulos de formulário e landmarks; (6) rodar verificadores automáticos; (7) se possível, testar com pessoas usuárias de tecnologias assistivas. Ferramentas automáticas detectam só parte dos problemas (por exemplo, ausência de alt, mas não se o alt faz sentido, nem se a ordem do foco é lógica), por isso não substituem o teste manual.', rubric: ['Inclui teste só com teclado, com foco visível e ordem lógica', 'Inclui zoom/texto ampliado ou contraste', 'Inclui leitor de tela ou conferência de estrutura (alt, rótulos, títulos)', 'Menciona ferramentas automáticas como parte da rotina', 'Explica que as automáticas só detectam parte dos problemas e não avaliam qualidade/ordem'], explanation: 'Compare com o modelo e marque os critérios atendidos.' }
]
};

export const assessment = {
  id: 'html-css-a11y', title: 'Avaliação final — HTML, CSS e acessibilidade', passPct: 70, minutes: 40,
  items: [
    { id: 'htm-av-01', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual par de elementos é mais adequado para o conteúdo principal e para o bloco de navegação?', options: ['§<div id="main">§ e §<div id="nav">§', '§<main>§ e §<nav>§', '§<section>§ e §<span>§', '§<article>§ e §<aside>§'], answer: 1, explanation: 'main e nav são elementos semânticos que criam marcos de navegação para leitores de tela.' },
    { id: 'htm-av-02', type: 'tf', difficulty: 1, points: 5, prompt: 'alt="" é válido e indica que a imagem é decorativa.', answer: true, explanation: 'O alt vazio faz o leitor de tela ignorar a imagem decorativa, o que é melhor que um alt inútil ou a ausência do atributo.' },
    { id: 'htm-av-03', type: 'bug', difficulty: 2, points: 10, prompt: 'Este formulário falha em acessibilidade. Clique na linha com o campo sem rótulo associado.', code: "<form>\n  <label for=\"email\">E-mail</label>\n  <input id=\"email\" type=\"email\">\n  <input id=\"senha\" type=\"password\" placeholder=\"Senha\">\n  <button type=\"submit\">Entrar</button>\n</form>", answer: 4, explanation: 'O campo de senha só tem placeholder. É preciso um <label for="senha">Senha</label>.' },
    { id: 'htm-av-04', type: 'match', difficulty: 2, points: 10, prompt: 'Associe cada seletor à sua especificidade (id–classe–tipo).', pairs: [['.menu a', '0–1–1'], ['#topo', '1–0–0'], ['nav ul li a', '0–0–4'], ['a:hover.ativo', '0–2–1']], explanation: 'Classes, atributos e pseudo-classes pesam na coluna do meio; tipos, na última.' },
    { id: 'htm-av-05', type: 'trace', difficulty: 2, points: 10, prompt: 'Calcule o tamanho de uma caixa.', code: ".card {\n  box-sizing: content-box;\n  width: 200px;\n  padding: 16px;\n  border: 2px solid;\n}", lang: 'css', steps: [ { q: 'Largura ocupada até a borda, em px', answers: ['236'] }, { q: 'Largura se box-sizing fosse border-box, em px', answers: ['200'] } ], explanation: 'content-box: 200 + 2×16 + 2×2 = 236. Em border-box o valor declarado já inclui padding e borda.' },
    { id: 'htm-av-06', type: 'mc', difficulty: 2, points: 10, prompt: 'Duas regras com especificidades diferentes disputam a cor de um elemento: .botao { color: white; } e button { color: black; }. Qual vence e por quê?', options: ['button, porque aparece depois', '.botao, porque classe pesa mais que tipo', 'Nenhuma, o navegador escolhe', 'button, porque é mais curto'], answer: 1, explanation: '.botao é 0-1-0 e button é 0-0-1: a classe vence, independentemente da ordem.' },
    { id: 'htm-av-07', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é o contraste mínimo exigido pela WCAG 2.2, nível AA, para texto comum?', options: ['3:1', '4.5:1', '7:1', '21:1'], answer: 1, explanation: 'O critério 1.4.3 exige 4,5:1 para texto comum e 3:1 para texto grande. 7:1 é o nível AAA.' },
    { id: 'htm-av-08', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o CSS mobile first de uma galeria que passa a ter 3 colunas a partir de 64rem.', code: ".galeria { display: grid; grid-template-columns: 1fr; gap: 1rem; }\n@media ([[0]]: 64rem) {\n  .galeria { grid-template-columns: [[1]](3, 1fr); }\n}", answers: [['min-width'], ['repeat']], explanation: 'No mobile first as regras de telas maiores usam min-width. repeat(3, 1fr) cria três colunas iguais.' },
    { id: 'htm-av-09', type: 'tf', difficulty: 2, points: 5, prompt: 'Um verificador automático de acessibilidade que não encontra erros garante que a página é acessível.', answer: false, explanation: 'Ferramentas automáticas cobrem apenas parte dos critérios. É preciso testar teclado, leitor de tela, zoom e a qualidade dos textos alternativos.' },
    { id: 'htm-av-10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual é a melhor solução para um botão que só tem um ícone de lixeira?', options: ['<button><svg>…</svg></button>', '<button aria-label="Excluir item"><svg aria-hidden="true">…</svg></button>', '<div onclick="excluir()"><svg>…</svg></div>', '<a href="#"><svg>…</svg></a>'], answer: 1, explanation: 'O button nativo traz foco e teclado; aria-label dá o nome acessível; aria-hidden esconde o ícone decorativo para não haver leitura duplicada.' },
    { id: 'htm-av-11', type: 'open', difficulty: 3, points: 15, prompt: 'Um cliente reclama que o site "não funciona no celular e não dá para usar sem mouse". Liste as verificações e correções que você faria, em HTML e CSS, cobrindo pelo menos quatro pontos.', model: 'Verificações e correções: (1) HTML: confirmar meta viewport e usar elementos semânticos e nativos (button, a, nav, main), eliminando divs clicáveis; (2) teclado: percorrer com Tab, garantir foco visível com :focus-visible (sem outline: none) e ordem lógica; (3) CSS: reescrever mobile first, com Flexbox/Grid, gap, unidades relativas e media queries min-width; (4) imagens com max-width: 100% e height: auto; (5) alvos de toque com pelo menos 24×24 px (idealmente cerca de 44 px) e espaçamento; (6) contraste mínimo de 4,5:1, e formulários com labels; (7) testar com zoom de 200%, em tela estreita e com leitor de tela.', rubric: ['Cita meta viewport e/ou layout mobile first com media queries', 'Cita elementos nativos/semânticos no lugar de divs clicáveis', 'Cita foco visível e uso completo por teclado', 'Cita Flexbox/Grid ou unidades relativas e imagens fluidas', 'Cita alvos de toque, contraste, labels ou testes com zoom/leitor de tela'], explanation: 'Compare com o modelo e marque os critérios atendidos.' },
    { id: 'htm-av-12', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual título está correto para um link que leva ao relatório anual em PDF?', options: ['<a href="relatorio.pdf">Clique aqui</a>', '<a href="relatorio.pdf">Relatório anual 2026 (PDF)</a>', '<a href="relatorio.pdf">Baixar</a>', '<a href="#">Relatório</a>'], answer: 1, explanation: 'O texto diz para onde o link vai e que o arquivo é um PDF, e funciona fora de contexto.' }
  ]
};

export const project = {
  id: 'auditor-acessibilidade', name: 'Auditor de acessibilidade de HTML', lv: 'M', stack: 'JavaScript (Node.js ou navegador)', ds: ['html', 'css', 'a11y'],
  desc: 'Equipes costumam rodar verificações automáticas de acessibilidade antes de publicar. Construa o núcleo de um auditor: recebe o HTML (texto) de uma página e devolve a lista de problemas encontrados nas regras básicas da WCAG vistas no curso, com uma pontuação.',
  rf: ['Verificar o atributo lang na tag html', 'Verificar a existência de um title não vazio', 'Detectar imagens sem alt e com alt igual a nome de arquivo', 'Verificar a hierarquia de títulos: sem h1, vários h1 e saltos de nível', 'Detectar campos de formulário sem rótulo', 'Detectar links com texto genérico (clique aqui, saiba mais…)', 'Devolver { problemas, pontuacao, aprovado }, em que aprovado é verdadeiro quando não há problemas'],
  rnf: ['Não executar nem renderizar o HTML recebido (é entrada não confiável); análise apenas por texto', 'Funções pequenas e testáveis, uma por regra', 'Complexidade linear no tamanho do HTML', 'Sem dependências externas'],
  ac: ['Todos os testes automatizados do laboratório passam', 'Cada problema traz o identificador da regra e um detalhe', 'A pontuação cai 10 pontos por problema, com mínimo de 0', 'Um README explica as limitações da análise por texto (comparada a analisar o DOM) e como evoluir para um verificador baseado em DOM'],
  ch: ['Tratar atributos com aspas simples ou duplas', 'Campos dentro de label sem for', 'Extensão: contraste de cores declaradas em atributos style inline', 'Extensão: relatório em Markdown'],
  lab: { lang: 'javascript',
    prompt: 'Implemente §auditarHtml(html)§. Devolva §{ problemas, pontuacao, aprovado }§. Cada problema é §{ regra, detalhe }§. Regras, **nesta ordem** (dentro de cada regra, na ordem do documento): §"html-sem-lang"§ (tag html sem lang preenchido; detalhe §""§), §"sem-title"§ (sem §<title>§ ou vazio; detalhe §""§), §"img-sem-alt"§ (detalhe: o src), §"img-alt-arquivo"§ (alt termina em .png, .jpg, .jpeg, .gif, .svg ou .webp; detalhe: o src), §"sem-h1"§, §"varios-h1"§, §"salto-titulo"§ (detalhe §"h2>h4"§; o primeiro título nunca é salto), §"campo-sem-rotulo"§ (input, select ou textarea sem rótulo; detalhe: id, ou name, ou §"(sem id)"§) e §"link-generico"§ (texto do link, sem tags, em minúsculas e com espaços normalizados, igual a clique aqui, aqui, saiba mais, leia mais, veja mais ou mais; detalhe: esse texto). Campos: um campo tem rótulo se seu id está em um §for§, se está dentro de um §<label>§ ou se tem §aria-label§/§aria-labelledby§ não vazio; ignore input hidden, submit, button, reset e image. §pontuacao§ = máx(0, 100 − 10 × problemas).',
    starter: "function auditarHtml(html) {\n  // 1) lang e title\n  // 2) imagens\n  // 3) títulos\n  // 4) campos\n  // 5) links\n  return { problemas: [], pontuacao: 100, aprovado: true };\n}\n",
    tests: [
      { name: 'página correta', code: R`const h = '<!doctype html><html lang="pt-BR"><head><title>Loja</title></head><body><h1>Loja</h1><h2>Produtos</h2><img src="a.png" alt="Caneca azul"><label for="q">Busca</label><input id="q"><a href="/p">Ver produtos</a></body></html>';
assert.deepEqual(auditarHtml(h), { problemas: [], pontuacao: 100, aprovado: true });` },
      { name: 'todas as regras na ordem', code: R`const h = '<html><head></head><body><h2>X</h2><h4>Y</h4><img src="a.png"><img src="b.png" alt="b.png"><input id="n"><a href="/x">Clique  Aqui</a></body></html>';
const r = auditarHtml(h);
assert.deepEqual(r.problemas.map((p) => p.regra), ['html-sem-lang', 'sem-title', 'img-sem-alt', 'img-alt-arquivo', 'sem-h1', 'salto-titulo', 'campo-sem-rotulo', 'link-generico']);
assert.equal(r.pontuacao, 20); assert.equal(r.aprovado, false);
const det = Object.fromEntries(r.problemas.map((p) => [p.regra, p.detalhe]));
assert.equal(det['img-sem-alt'], 'a.png'); assert.equal(det['img-alt-arquivo'], 'b.png'); assert.equal(det['salto-titulo'], 'h2>h4'); assert.equal(det['campo-sem-rotulo'], 'n'); assert.equal(det['link-generico'], 'clique aqui');` },
      { name: 'title vazio e lang vazio', code: R`const r = auditarHtml('<html lang=""><head><title>  </title></head><body><h1>A</h1></body></html>');
assert.deepEqual(r.problemas.map((p) => p.regra), ['html-sem-lang', 'sem-title']);` },
      { name: 'vários h1 e imagens decorativas', code: R`const r = auditarHtml('<html lang="pt"><head><title>T</title></head><body><h1>A</h1><h1>B</h1><img src="x.svg" alt=""></body></html>');
assert.deepEqual(r.problemas.map((p) => p.regra), ['varios-h1']);` },
      { name: 'campo dentro de label e links com tags', code: R`const r = auditarHtml('<html lang="pt"><head><title>T</title></head><body><h1>A</h1><label>Nome <input name="n"></label><a href="/y"><span>Saiba</span> mais</a><a href="/z">Ver o <b>relatório</b></a></body></html>');
assert.deepEqual(r.problemas.map((p) => [p.regra, p.detalhe]), [['link-generico', 'saiba mais']]);` },
      { name: 'a pontuação não fica negativa', code: R`let h = '<html lang="pt"><head><title>T</title></head><body><h1>A</h1>';
for (let i = 0; i < 15; i++) h += '<img src="i' + i + '.png">';
const r = auditarHtml(h + '</body></html>');
assert.equal(r.problemas.length, 15); assert.equal(r.pontuacao, 0);` },
      { name: 'não altera a entrada e é rápido', code: R`let h = '<html lang="pt"><head><title>T</title></head><body><h1>A</h1>';
for (let i = 0; i < 20000; i++) h += '<img src="i' + i + '.png" alt="Item ' + i + '">';
for (let i = 0; i < 3000; i++) h += '<label for="c' + i + '">C</label><input id="c' + i + '">';
h += '</body></html>';
const copia = h; const t = Date.now();
const r = auditarHtml(h);
assert.equal(h, copia); assert.equal(r.aprovado, true);
assert.ok(Date.now() - t < 1500, 'levou ' + (Date.now() - t) + ' ms');` }
    ],
    solution: R`function atributo(tag, nome) {
  const m = new RegExp('\\s' + nome + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i').exec(tag);
  return m ? (m[1] !== undefined ? m[1] : m[2]) : null;
}

function auditarHtml(html) {
  const problemas = [];
  const add = (regra, detalhe = '') => problemas.push({ regra, detalhe });

  const tagHtml = (/<html\b[^>]*>/i.exec(html) || [''])[0];
  if (!(atributo(tagHtml, 'lang') || '').trim()) add('html-sem-lang');
  const titulo = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!titulo || !titulo[1].trim()) add('sem-title');

  const semAlt = [], altArquivo = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const alt = atributo(tag, 'alt');
    const src = atributo(tag, 'src') || '';
    if (alt === null) semAlt.push(src);
    else if (/\.(png|jpe?g|gif|svg|webp)$/i.test(alt.trim())) altArquivo.push(src);
  }
  semAlt.forEach((s) => add('img-sem-alt', s));
  altArquivo.forEach((s) => add('img-alt-arquivo', s));

  const niveis = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1 = niveis.filter((n) => n === 1).length;
  if (h1 === 0) add('sem-h1');
  if (h1 > 1) add('varios-h1');
  for (let i = 1; i < niveis.length; i++) {
    if (niveis[i] > niveis[i - 1] + 1) add('salto-titulo', 'h' + niveis[i - 1] + '>h' + niveis[i]);
  }

  const paraIds = new Set();
  const faixas = [];
  const reL = /<label\b[^>]*>[\s\S]*?<\/label>/gi;
  let m;
  while ((m = reL.exec(html)) !== null) {
    faixas.push([m.index, m.index + m[0].length]);
    const f = atributo(m[0].slice(0, m[0].indexOf('>') + 1), 'for');
    if (f) paraIds.add(f);
  }
  const reT = /<(input|select|textarea)\b[^>]*>/gi;
  let j = 0;
  while ((m = reT.exec(html)) !== null) {
    const tag = m[0];
    const tipo = (atributo(tag, 'type') || 'text').toLowerCase();
    if (m[1].toLowerCase() === 'input' && ['hidden', 'submit', 'button', 'reset', 'image'].includes(tipo)) continue;
    while (j < faixas.length && faixas[j][1] <= m.index) j++;
    const dentro = j < faixas.length && faixas[j][0] <= m.index;
    const id = atributo(tag, 'id');
    const ok = dentro || (id && paraIds.has(id)) || atributo(tag, 'aria-label') || atributo(tag, 'aria-labelledby');
    if (!ok) add('campo-sem-rotulo', id || atributo(tag, 'name') || '(sem id)');
  }

  const genericos = ['clique aqui', 'aqui', 'saiba mais', 'leia mais', 'veja mais', 'mais'];
  const reA = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = reA.exec(html)) !== null) {
    const texto = m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (genericos.includes(texto)) add('link-generico', texto);
  }

  return { problemas, pontuacao: Math.max(0, 100 - 10 * problemas.length), aprovado: problemas.length === 0 };
}`
  }
};
