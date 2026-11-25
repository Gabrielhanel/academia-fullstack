// C2.1 — React essencial: exercícios das aulas 1 a 6.
// Os componentes não rodam no laboratório (Worker sem DOM nem React): os desafios "code" modelam a lógica pura.
const R = String.raw;

export const exsetsA = {
'rea-01': [
  { id: 'rea-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual frase descreve melhor a ideia central do React?', options: ['O desenvolvedor altera o DOM passo a passo a cada evento', 'A interface é descrita como função do estado, e o React atualiza o DOM quando o estado muda', 'O React substitui o HTML e o CSS', 'O React é um framework completo com roteamento e servidor'], answer: 1, explanation: 'UI = f(estado): você descreve a tela para cada estado; o React compara a descrição nova com a anterior e aplica só as diferenças. Roteamento e servidor vêm de frameworks (como o Next.js).' },
  { id: 'rea-01-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Um elemento React (§<Contador />§) é um nó do DOM já criado na página.', answer: false, explanation: 'É um **objeto leve** que descreve o que renderizar (tipo, props, filhos). O React usa essa descrição para criar ou atualizar os nós do DOM.' },
  { id: 'rea-01-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o termo à descrição.', pairs: [['Componente', 'Função em maiúscula que devolve JSX'], ['Elemento', 'Objeto leve que descreve a interface'], ['React DOM', 'Conecta a árvore ao navegador e ao servidor'], ['Strict Mode', 'Em desenvolvimento, monta, desmonta e remonta para expor impurezas']], explanation: 'Esses quatro termos aparecem em toda conversa sobre React; o Strict Mode não afeta a produção.' },
  { id: 'rea-01-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'O componente não aparece: o React o trata como um elemento HTML desconhecido. Clique na linha com o erro.', code: 'function contador() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>{n}</button>;\n}\n\nconst app = <contador />;', answer: 6, explanation: 'Nomes em **minúscula** são tratados como elementos nativos do DOM. O componente deve começar com maiúscula (§Contador§) e ser usado como §<Contador />§.' },
  { id: 'rea-01-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Explique, com suas palavras, a diferença entre programar a interface de forma imperativa (DOM) e declarativa (React), usando como exemplo um contador de cliques.', model: 'No estilo imperativo, o código seleciona o botão, guarda o número em uma variável e, a cada clique, altera manualmente o texto do elemento; é o desenvolvedor quem garante que a tela acompanhe o dado em todos os pontos. No estilo declarativo, descreve-se o botão para qualquer valor do estado: <button>Cliques: {n}</button>; ao clicar, atualiza-se o estado (setN(n + 1)) e o React recalcula a descrição, compara com a anterior e altera apenas o texto necessário. A tela é sempre consequência do estado, o que elimina uma classe inteira de inconsistências.', rubric: ['Descreve o estilo imperativo como manipulação passo a passo do DOM', 'Descreve o declarativo como descrever a tela para cada estado', 'Cita que o React reconcilia e atualiza o DOM', 'Relaciona o declarativo a menos inconsistências entre dados e tela'], explanation: 'A resposta forte ancora a diferença em quem é responsável por manter a tela sincronizada com os dados.' },
  { id: 'rea-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o JSX em JavaScript puro. Implemente §h(tipo, props, ...filhos)§, que devolve §{ tipo, props, filhos }§ (§props§ vira §{}§ se for §null§), e §renderParaString(no)§. Em §h§, os filhos são **achatados** (arrays aninhados) e **descartam** §null§, §undefined§, §true§, §false§ e §""§; números e textos viram strings (o §0§ **fica**). Em §renderParaString§: texto é **escapado** (§&§, §<§, §>§, §"§, §\'§ viram §&amp;§, §&lt;§, §&gt;§, §&quot;§, §&#39;§); tipo **função** é um componente: chame §tipo({ ...props, children: filhos })§ e renderize o resultado (que pode ser um nó, texto, array ou §null§); tipo texto gera §<tipo atributos>filhos</tipo>§. Atributos: §className§ vira §class§ e §htmlFor§ vira §for§; valor §true§ gera só o nome; §false§, §null§ e §undefined§ são omitidos; outros valores vão entre aspas **escapados**; mantenha a ordem das props. Tags void (§br§, §hr§, §img§, §input§) não têm fechamento nem filhos.', lang: 'javascript', starter: 'function h(tipo, props, ...filhos) {\n  // seu código aqui\n}\n\nfunction renderParaString(no) {\n  // seu código aqui\n}\n', hints: ['Para achatar os filhos use filhos.flat(Infinity) e filter.', 'Trate os nós: string, array, null, elemento de componente (função) e elemento nativo.'], tests: [{ name: 'h normaliza os filhos', code: R`const el = h('p', null, 'a', null, 0, [false, 'b', [1, undefined]], true, '');
assert.deepEqual(el, { tipo: 'p', props: {}, filhos: ['a', '0', 'b', '1'] });` }, { name: 'texto escapado e atributos', code: R`assert.equal(renderParaString(h('p', { className: 'x', hidden: true, title: 'a"b', ausente: false }, '<b>', 1)), '<p class="x" hidden title="a&quot;b">&lt;b&gt;1</p>');
assert.equal(renderParaString(h('label', { htmlFor: 'n' }, "O'Neil & Cia")), '<label for="n">O&#39;Neil &amp; Cia</label>');` }, { name: 'tags void e aninhamento', code: R`assert.equal(renderParaString(h('br')), '<br>');
assert.equal(renderParaString(h('input', { value: 'x', disabled: false })), '<input value="x">');
assert.equal(renderParaString(h('ul', null, ['a', 'b'].map((t) => h('li', { key: t }, t)))), '<ul><li key="a">a</li><li key="b">b</li></ul>');` }, { name: 'componentes são funções', code: R`const Cartao = ({ titulo, children }) => h('section', null, h('h2', null, titulo), children);
const html = renderParaString(h(Cartao, { titulo: 'Olá' }, h('p', null, 'corpo'), 'fim'));
assert.equal(html, '<section><h2>Olá</h2><p>corpo</p>fim</section>');
const Nada = () => null;
assert.equal(renderParaString(h('div', null, h(Nada))), '<div></div>');` }], solution: R`function h(tipo, props, ...filhos) {
  const achatados = filhos.flat(Infinity).filter((f) => f !== null && f !== undefined && f !== true && f !== false && f !== '');
  return { tipo, props: props || {}, filhos: achatados.map((f) => (typeof f === 'object' ? f : String(f))) };
}
const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const VOID = new Set(['br', 'hr', 'img', 'input']);
function renderParaString(no) {
  if (no === null || no === undefined || no === false || no === true) return '';
  if (Array.isArray(no)) return no.map(renderParaString).join('');
  if (typeof no === 'string' || typeof no === 'number') return escapar(no);
  if (typeof no.tipo === 'function') return renderParaString(no.tipo({ ...no.props, children: no.filhos }));
  const attrs = Object.entries(no.props).map(([k, v]) => {
    if (v === false || v === null || v === undefined) return '';
    const nome = k === 'className' ? 'class' : k === 'htmlFor' ? 'for' : k;
    return v === true ? ' ' + nome : ' ' + nome + '="' + escapar(v) + '"';
  }).join('');
  if (VOID.has(no.tipo)) return '<' + no.tipo + attrs + '>';
  return '<' + no.tipo + attrs + '>' + no.filhos.map(renderParaString).join('') + '</' + no.tipo + '>';
}
`, explanation: 'É um modelo mínimo do que o JSX e o React DOM fazem: JSX vira chamadas que criam objetos (§h§), componentes são funções chamadas na renderização e o texto é **escapado** na saída, que é a defesa padrão contra XSS (aula 2). Atenção: a chave §key§ aparece como atributo neste modelo, o que o React real não faz.' }
],
'rea-02': [
  { id: 'rea-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a forma correta de aplicar a classe §destaque§ a um §<div>§ em JSX?', options: ['<div class="destaque">', '<div className="destaque">', '<div classname=destaque>', '<div style="destaque">'], answer: 1, explanation: 'O JSX usa os nomes da API do DOM em camelCase: §className§ (e §htmlFor§ no lugar de §for§).' },
  { id: 'rea-02-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Renderizar §<p>{comentario}</p>§ com um comentário que contém §<script>§ executa o script, a menos que seja sanitizado.', answer: false, explanation: 'Texto entre chaves é **escapado** pelo React: o navegador exibe o código como texto. O risco existe com §dangerouslySetInnerHTML§, URLs perigosas e bibliotecas que escrevem HTML.' },
  { id: 'rea-02-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O código exibe o HTML do comentário do usuário sem escape e permite XSS. Clique na linha que desliga a proteção do React.', code: 'function Comentario({ html }: { html: string }) {\n  return (\n    <article>\n      <div dangerouslySetInnerHTML={{ __html: html }} />\n    </article>\n  );\n}', answer: 4, explanation: '§dangerouslySetInnerHTML§ insere HTML bruto e desliga o escape. Renderize o texto (§{texto}§) ou sanitize o HTML (por exemplo, com DOMPurify) antes.' },
  { id: 'rea-02-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Quais itens aparecem na saída? (O React 19.3 foi medido com este exato JSX.)', code: '<div>{null}{undefined}{false}{true}{0}{\'\'}{[1, 2]}</div>', lang: 'tsx', steps: [{ q: 'Quantos caracteres de conteúdo (sem tags e sem comentários) aparecem?', answers: ['3'] }, { q: 'Qual é o primeiro valor visível?', answers: ['0'] }], explanation: 'O React ignora §null§, §undefined§, booleanos e §""§; renderiza o §0§ e os itens do array: "0", "1" e "2" (três caracteres).' },
  { id: 'rea-02-e5', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete para devolver dois itens irmãos sem criar um nó extra no DOM.', code: 'function Itens() {\n  return (\n    [[0]]\n      <li>a</li>\n      <li>b</li>\n    [[1]]\n  );\n}', answers: [['<>'], ['</>']], explanation: 'O fragmento §<>...</>§ agrupa irmãos sem gerar elemento no DOM (útil em listas e tabelas).' },
  { id: 'rea-02-e6', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §urlSegura(texto)§: devolve a URL **normalizada** (§href§) se o protocolo for §http:§, §https:§ ou §mailto:§, e §null§ caso contrário. Aceite caminhos relativos resolvendo-os contra §https://exemplo.com§. Texto vazio (depois de §trim§), URL inválida e qualquer outro protocolo (§javascript:§, §data:§, §ftp:§) devolvem §null§. Atenção a variações como §"  JavaScript:alert(1)"§ e §"java\\nscript:alert(1)"§: devem ser recusadas.', lang: 'javascript', starter: 'function urlSegura(texto) {\n  // seu código aqui\n}\n', hints: ['Use new URL(texto, base) dentro de try/catch.', 'Compare u.protocol com um conjunto de protocolos permitidos.'], tests: [{ name: 'aceita protocolos seguros', code: R`assert.equal(urlSegura('https://exemplo.org/a?b=1'), 'https://exemplo.org/a?b=1');
assert.equal(urlSegura('HTTP://Site.com/x'), 'http://site.com/x');
assert.equal(urlSegura('mailto:a@b.co'), 'mailto:a@b.co');
assert.equal(urlSegura('/perfil'), 'https://exemplo.com/perfil');` }, { name: 'recusa protocolos perigosos e variações', code: R`for (const t of ['javascript:alert(1)', '  JavaScript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,<b>x</b>', 'ftp://x.com', 'vbscript:x']) assert.equal(urlSegura(t), null, t);` }, { name: 'vazio e inválido', code: R`assert.equal(urlSegura(''), null);
assert.equal(urlSegura('   '), null);
assert.equal(urlSegura('http://'), null);` }], solution: R`function urlSegura(texto) {
  if (typeof texto !== 'string' || !texto.trim()) return null;
  try {
    const u = new URL(texto, 'https://exemplo.com');
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}
`, explanation: 'O construtor §URL§ aplica as regras do navegador (espaços, maiúsculas, quebras de linha no meio do protocolo), então é mais seguro que testar o texto com expressões regulares. O React 19 também bloqueia §javascript:§ em §href§, mas validar na origem continua sendo boa prática.' }
],
'rea-03': [
  { id: 'rea-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Para reutilizar uma moldura (cartão, modal, layout) com conteúdos diferentes, qual é o recurso do React?', options: ['Herança de componentes', 'A prop children (composição)', 'Variáveis globais', 'Copiar o componente para cada uso'], answer: 1, explanation: '§children§ (e slots) permitem compor: o pai decide o conteúdo e o filho decide a moldura. O React recomenda composição em vez de herança.' },
  { id: 'rea-03-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Um componente pode alterar o objeto de props que recebeu, desde que chame o set do estado em seguida.', answer: false, explanation: 'Props são **somente leitura**. Quem possui o dado (o dono do estado) o altera, e o componente filho avisa por uma função recebida por props.' },
  { id: 'rea-03-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O contador do filho "congela": ele mostra o valor inicial da prop e ignora as mudanças do pai. Clique na linha com o problema.', code: 'function Filho({ inicial }: { inicial: number }) {\n  const [n, setN] = useState(inicial);\n  return <p>{n}</p>;\n}\n// Pai: <Filho inicial={contagem} />  (contagem muda)', answer: 2, explanation: 'O §useState§ usa o valor inicial **só na primeira renderização**. Copiar a prop para o estado "congela" o valor; use a prop diretamente (ou §key§ para reiniciar).' },
  { id: 'rea-03-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o padrão ao seu uso.', pairs: [['children', 'Conteúdo entre as tags do componente'], ['Slot (prop com JSX)', 'Vários pontos de encaixe nomeados'], ['Função recebida por prop', 'Fluxo de eventos do filho para o pai'], ['União literal', 'Restringir uma prop a valores válidos']], explanation: 'Esses padrões formam o vocabulário de design de componentes reutilizáveis.' },
  { id: 'rea-03-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Um §<Modal>§ da sua equipe tem 14 props (§titulo§, §mostrarRodape§, §textoOk§, §corBotao§...). Como você o redesenharia com composição e que ganhos isso traria?', model: 'Em vez de configurar cada parte por props, o Modal passa a ser uma moldura que aceita partes por composição: <Modal><Modal.Titulo>...</Modal.Titulo><Modal.Corpo>...</Modal.Corpo><Modal.Rodape>...</Modal.Rodape></Modal>, ou slots nomeados (cabecalho, rodape). O componente só controla o comportamento (abrir e fechar, foco, tecla Esc, acessibilidade) e o layout; os consumidores escolhem o conteúdo e os botões. Ganhos: menos props e menos casos especiais, novos usos sem alterar o componente, melhor tipagem, testes mais simples e menor acoplamento entre o Modal e o conteúdo.', rubric: ['Propõe children ou slots no lugar de props de configuração', 'Mantém no Modal apenas comportamento e moldura', 'Cita redução de props e extensibilidade', 'Menciona acessibilidade ou testes'], explanation: 'Composição desloca decisões de conteúdo para quem usa o componente e mantém o componente pequeno e estável.' },
  { id: 'rea-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o contrato de props. Implemente §normalizarProps(props, esquema)§. §esquema§ é um objeto §{ [nome]: { tipo, obrigatoria, padrao, opcoes } }§ (§tipo§: §"string"§, §"number"§, §"boolean"§ ou §"function"§). Devolva um **novo objeto congelado** (§Object.freeze§) com os padrões aplicados, **sem alterar** §props§. Erros (lance §Error§ com estas mensagens): §"prop desconhecida: nome"§ para uma prop fora do esquema; §"prop obrigatória: nome"§ se §obrigatoria§ e o valor estiver ausente (§undefined§) e sem §padrao§; §"tipo inválido em nome: esperado tipo"§ se o valor existir e o tipo for diferente; §"valor inválido em nome: deve ser um de a, b"§ se houver §opcoes§ e o valor não estiver nelas. A ordem das verificações: desconhecidas (na ordem das props), depois cada campo do esquema na ordem do esquema (obrigatória, tipo, opções).', lang: 'javascript', starter: 'function normalizarProps(props, esquema) {\n  // seu código aqui\n}\n', hints: ['Verifique as props desconhecidas primeiro.', 'Para cada campo do esquema: aplique o padrão, depois valide tipo e opções.'], tests: [{ name: 'aplica padrões e congela', code: R`const esq = { titulo: { tipo: 'string', obrigatoria: true }, destaque: { tipo: 'boolean', padrao: false }, variante: { tipo: 'string', padrao: 'primario', opcoes: ['primario', 'perigo'] } };
const entrada = { titulo: 'Olá' };
const r = normalizarProps(entrada, esq);
assert.deepEqual(r, { titulo: 'Olá', destaque: false, variante: 'primario' });
assert.ok(Object.isFrozen(r)); assert.deepEqual(entrada, { titulo: 'Olá' });` }, { name: 'erros de contrato', code: R`const esq = { titulo: { tipo: 'string', obrigatoria: true }, n: { tipo: 'number' }, variante: { tipo: 'string', opcoes: ['a', 'b'] } };
assert.throws(() => normalizarProps({}, esq), 'prop obrigatória: titulo');
assert.throws(() => normalizarProps({ titulo: 'x', extra: 1 }, esq), 'prop desconhecida: extra');
assert.throws(() => normalizarProps({ titulo: 'x', n: '3' }, esq), 'tipo inválido em n: esperado number');
assert.throws(() => normalizarProps({ titulo: 'x', variante: 'c' }, esq), 'valor inválido em variante: deve ser um de a, b');` }, { name: 'obrigatória com padrão e função', code: R`const esq = { aoSalvar: { tipo: 'function', obrigatoria: true, padrao: () => 'ok' } };
const r = normalizarProps({}, esq); assert.equal(r.aoSalvar(), 'ok');
assert.throws(() => normalizarProps({ aoSalvar: 'x' }, esq), 'tipo inválido em aoSalvar: esperado function');` }], solution: R`function normalizarProps(props, esquema) {
  for (const nome of Object.keys(props)) if (!(nome in esquema)) throw new Error('prop desconhecida: ' + nome);
  const out = {};
  for (const [nome, regra] of Object.entries(esquema)) {
    let v = props[nome];
    if (v === undefined && 'padrao' in regra) v = regra.padrao;
    if (v === undefined) {
      if (regra.obrigatoria) throw new Error('prop obrigatória: ' + nome);
      continue;
    }
    if (typeof v !== regra.tipo) throw new Error('tipo inválido em ' + nome + ': esperado ' + regra.tipo);
    if (regra.opcoes && !regra.opcoes.includes(v)) throw new Error('valor inválido em ' + nome + ': deve ser um de ' + regra.opcoes.join(', '));
    out[nome] = v;
  }
  return Object.freeze(out);
}
`, explanation: 'É a versão em JavaScript do que o TypeScript faz em compilação (e o antigo PropTypes fazia em execução): o contrato das props é explícito, os padrões são aplicados e o objeto resultante é somente leitura, como o React espera.' }
],
'rea-04': [
  { id: 'rea-04-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'O botão abaixo começa com §n = 0§ e é clicado **uma vez**.', code: 'const [n, setN] = useState(0);\n<button onClick={() => {\n  setN(n + 1);\n  setN(n + 1);\n  setN(n + 1);\n}}>{n}</button>', lang: 'tsx', steps: [{ q: 'Que valor o botão mostra depois do clique?', answers: ['1'] }, { q: 'Quantas vezes o componente re-renderiza por causa do clique (batching)?', answers: ['1'] }], explanation: 'As três chamadas usam o mesmo snapshot (§n = 0§), então o resultado é 1. As atualizações são agrupadas em uma única renderização. Com §setN(x => x + 1)§ o resultado seria 3.' },
  { id: 'rea-04-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'Ao clicar em "Concluir", o item muda no array mas a tela não atualiza. Clique na linha que muta o estado.', code: 'function concluir(i: number) {\n  const novo = tarefas;\n  novo[i].feita = true;\n  setTarefas(novo);\n}', answer: 3, explanation: '§novo§ é a **mesma referência** de §tarefas§, e a linha 3 a muta. Crie cópias: §setTarefas(ts => ts.map((t, j) => j === i ? { ...t, feita: true } : t))§.' },
  { id: 'rea-04-e3', type: 'mc', difficulty: 2, points: 10, prompt: 'Você guarda §itens§ e §total§ em dois estados. Qual é o problema e a melhor solução?', options: ['Nenhum: é a prática recomendada', 'Estado duplicado: calcule §total§ a partir de §itens§ na renderização', 'Falta usar §useEffect§ para sincronizar os dois', 'Falta transformar tudo em um objeto no Context'], answer: 1, explanation: 'Valores derivados não devem ser estado: duplicá-los cria inconsistências. Guarde só §itens§ e calcule o total em cada render (com §useMemo§ apenas se for caro).' },
  { id: 'rea-04-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a atualização que adiciona um item **sem mutar** a lista e usando o valor mais recente.', code: 'setItens([[0]] => [[1]]);', answers: [['ts', 'itens', 'lista', 'atual'], ['[...ts, novo]', '[...itens, novo]', '[...lista, novo]', '[...atual, novo]']], explanation: 'A forma funcional recebe o valor mais recente da fila; o spread cria uma nova lista com o item acrescentado.' },
  { id: 'rea-04-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente o reducer §reducerTarefas(estado, acao)§ (**função pura**, sem mutar). §estado§ é uma lista de §{ id, titulo, feita }§. Ações: §{ tipo: "adicionar", id, titulo }§ (acrescenta ao fim com §feita: false§; lance §Error("id repetido")§ se o id já existir); §{ tipo: "alternar", id }§ (inverte §feita§ do item; se o id não existir, devolva **o mesmo** §estado§, a mesma referência); §{ tipo: "remover", id }§; §{ tipo: "limparConcluidas" }§ (remove as feitas). Qualquer outro tipo lança §Error("ação desconhecida: TIPO")§. Os testes congelam o estado recursivamente.', lang: 'javascript', starter: 'function reducerTarefas(estado, acao) {\n  // seu código aqui\n}\n', hints: ['Use switch na ação e devolva sempre novos arrays/objetos.', 'Para "alternar" inexistente, devolva o próprio estado (o React não re-renderiza com a mesma referência).'], tests: [{ name: 'adicionar, alternar e remover sem mutar', code: R`const deep = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === 'object') deep(v); }); return Object.freeze(o); };
let s = deep([]);
s = reducerTarefas(s, { tipo: 'adicionar', id: 'a', titulo: 'Comprar pão' }); s = deep(s);
s = reducerTarefas(s, { tipo: 'adicionar', id: 'b', titulo: 'Estudar' }); s = deep(s);
s = reducerTarefas(s, { tipo: 'alternar', id: 'a' }); s = deep(s);
assert.deepEqual(s, [{ id: 'a', titulo: 'Comprar pão', feita: true }, { id: 'b', titulo: 'Estudar', feita: false }]);
s = reducerTarefas(s, { tipo: 'remover', id: 'b' });
assert.deepEqual(s.map((t) => t.id), ['a']);` }, { name: 'mesma referência quando nada muda', code: R`const s = Object.freeze([Object.freeze({ id: 'a', titulo: 'x', feita: false })]);
assert.ok(reducerTarefas(s, { tipo: 'alternar', id: 'zzz' }) === s);` }, { name: 'limpar concluídas e erros', code: R`const s = [{ id: 'a', titulo: 'x', feita: true }, { id: 'b', titulo: 'y', feita: false }, { id: 'c', titulo: 'z', feita: true }];
assert.deepEqual(reducerTarefas(s, { tipo: 'limparConcluidas' }), [{ id: 'b', titulo: 'y', feita: false }]);
assert.throws(() => reducerTarefas(s, { tipo: 'adicionar', id: 'a', titulo: 'dup' }), 'id repetido');
assert.throws(() => reducerTarefas(s, { tipo: 'pular' }), 'ação desconhecida: pular');` }], solution: R`function reducerTarefas(estado, acao) {
  switch (acao.tipo) {
    case 'adicionar':
      if (estado.some((t) => t.id === acao.id)) throw new Error('id repetido');
      return [...estado, { id: acao.id, titulo: acao.titulo, feita: false }];
    case 'alternar':
      if (!estado.some((t) => t.id === acao.id)) return estado;
      return estado.map((t) => (t.id === acao.id ? { ...t, feita: !t.feita } : t));
    case 'remover':
      return estado.filter((t) => t.id !== acao.id);
    case 'limparConcluidas':
      return estado.filter((t) => !t.feita);
    default:
      throw new Error('ação desconhecida: ' + acao.tipo);
  }
}
`, explanation: 'Reducers puros são fáceis de testar sem React e são a base do §useReducer§ e de bibliotecas como o Redux. Devolver a mesma referência quando nada muda evita renderizações desnecessárias.' }
],
'rea-05': [
  { id: 'rea-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a melhor chave para os itens de uma lista que pode ser reordenada e filtrada?', options: ['O índice do item', '§Math.random()§', 'O id estável vindo dos dados', 'O texto do item, sempre'], answer: 2, explanation: 'Um id estável e único identifica o item entre renderizações. O índice identifica a posição, §Math.random()§ recria o componente em todo render e o texto pode se repetir ou mudar.' },
  { id: 'rea-05-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Mudar a §key§ de um componente faz o React desmontá-lo e montar um novo, o que reseta seu estado.', answer: true, explanation: 'A chave faz parte da identidade do componente. Mudá-la é a forma recomendada de reiniciar o estado (por exemplo, um formulário quando o usuário muda).' },
  { id: 'rea-05-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Uma lista de dois campos (A e B) usa §key={índice}§. Digita-se "oi" no campo do item A e a lista é invertida (B, A).', code: '<ul>\n  {itens.map((t, i) => (\n    <li key={i}><input aria-label={t} /></li>\n  ))}\n</ul>\n// itens: [\'A\', \'B\']  ->  [\'B\', \'A\']', lang: 'tsx', steps: [{ q: 'Após a inversão, em qual item o texto "oi" aparece (A ou B)?', answers: ['b'] }, { q: 'Com key={t} (o próprio item), em qual item ficaria?', answers: ['a'] }], explanation: 'Com chave por índice, o estado (o texto no DOM) segue a **posição**: o primeiro campo, que agora é o B. Com chave por identidade, segue o item A.' },
  { id: 'rea-05-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'Quando §contagem§ é 0, a tela mostra um "0" solto. Clique na linha que causa isso.', code: 'function Selo({ contagem }: { contagem: number }) {\n  return (\n    <div>\n      {contagem && <span className="selo">{contagem}</span>}\n    </div>\n  );\n}', answer: 4, explanation: '§0 && <span>§ avalia para §0§, que o React renderiza. Use §{contagem > 0 && ...}§ ou um ternário com §null§.' },
  { id: 'rea-05-e5', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a situação à técnica de renderização condicional mais adequada.', pairs: [['Mostrar um aviso só quando há erro', 'temErro && <Aviso />'], ['Escolher entre duas telas', 'logado ? <Painel /> : <Entrar />'], ['Tratar o caso sem usuário logo no início', 'if (!usuario) return <Entrar />'], ['Escolher entre várias telas por modo', 'Objeto/mapa de componentes']], explanation: 'Cada forma tem seu lugar; o retorno antecipado evita aninhamento, e o mapa evita cadeias de ternários.' },
  { id: 'rea-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a reconciliação por chave. Implemente §reconciliar(antes, depois)§, onde as duas listas contêm **chaves** (strings). Se alguma lista tiver chave repetida, lance §Error("chave repetida: K")§ (verifique §antes§ primeiro, depois §depois§, na ordem). Devolva §{ mantidas, adicionadas, removidas, reordenou }§: §mantidas§ são as chaves presentes nas duas, **na ordem de §depois§**; §adicionadas§ estão só em §depois§ (ordem de §depois§); §removidas§ estão só em §antes§ (ordem de §antes§); §reordenou§ é §true§ quando a ordem relativa das §mantidas§ difere da que elas tinham em §antes§.', lang: 'javascript', starter: 'function reconciliar(antes, depois) {\n  // seu código aqui\n}\n', hints: ['Use Set para detectar repetidas e para os cálculos de pertinência.', 'Compare mantidas com as chaves de antes filtradas pelas que continuam em depois.'], tests: [{ name: 'adicionar, remover e manter', code: R`assert.deepEqual(reconciliar(['a', 'b', 'c'], ['b', 'c', 'd']), { mantidas: ['b', 'c'], adicionadas: ['d'], removidas: ['a'], reordenou: false });
assert.deepEqual(reconciliar([], ['x']), { mantidas: [], adicionadas: ['x'], removidas: [], reordenou: false });` }, { name: 'reordenação', code: R`assert.deepEqual(reconciliar(['a', 'b', 'c'], ['c', 'a', 'b']), { mantidas: ['c', 'a', 'b'], adicionadas: [], removidas: [], reordenou: true });
assert.equal(reconciliar(['a', 'b', 'c'], ['a', 'x', 'c']).reordenou, false);` }, { name: 'chave repetida', code: R`assert.throws(() => reconciliar(['a', 'a'], ['a']), 'chave repetida: a');
assert.throws(() => reconciliar(['a'], ['b', 'c', 'b']), 'chave repetida: b');` }], solution: R`function reconciliar(antes, depois) {
  const unicas = (lista) => { const v = new Set(); for (const k of lista) { if (v.has(k)) throw new Error('chave repetida: ' + k); v.add(k); } return v; };
  const sAntes = unicas(antes), sDepois = unicas(depois);
  const mantidas = depois.filter((k) => sAntes.has(k));
  const adicionadas = depois.filter((k) => !sAntes.has(k));
  const removidas = antes.filter((k) => !sDepois.has(k));
  const ordemAntes = antes.filter((k) => sDepois.has(k));
  const reordenou = mantidas.some((k, i) => k !== ordemAntes[i]);
  return { mantidas, adicionadas, removidas, reordenou };
}
`, explanation: 'É o essencial do que o React faz com listas: itens com a mesma chave **mantêm identidade e estado**, chaves novas montam componentes, chaves ausentes desmontam. Chaves repetidas são ambíguas e geram erro (no React, um aviso e comportamento imprevisível).' }
],
'rea-06': [
  { id: 'rea-06-e1', type: 'bug', difficulty: 1, points: 10, prompt: 'O botão dispara §salvar§ assim que a tela é renderizada, e não ao clicar. Clique na linha com o erro.', code: 'function Tela() {\n  return (\n    <button onClick={salvar()}>Salvar</button>\n  );\n}', answer: 3, explanation: '§salvar()§ **chama** a função durante a renderização. Passe a função (§onClick={salvar}§) ou uma seta (§onClick={() => salvar(id)}§).' },
  { id: 'rea-06-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Um campo recebe §value={texto}§ mas não tem §onChange§. O que acontece?', options: ['Funciona normalmente', 'O campo fica travado (somente leitura de fato) e o React avisa no console', 'O campo vira não controlado', 'O React cria um §onChange§ automático'], answer: 1, explanation: 'O valor vem do estado e nada o atualiza: o campo não aceita digitação. O React avisa para usar §onChange§, §readOnly§ ou §defaultValue§.' },
  { id: 'rea-06-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Em um formulário lido com §FormData§, um checkbox **desmarcado** aparece com o valor §false§.', answer: false, explanation: 'Campos desmarcados **não aparecem** no §FormData§ (e os marcados valem §"on"§ se não houver §value§). Trate a ausência como falso.' },
  { id: 'rea-06-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a necessidade à abordagem de campo.', pairs: [['Formatar e validar a cada tecla', 'Controlado'], ['Formulário grande validado no envio', 'Não controlado com FormData'], ['Campo de arquivo', 'Sempre não controlado'], ['Valor inicial de um campo não controlado', 'defaultValue']], explanation: 'A escolha depende de quem deve ser a fonte da verdade e do custo de renderizar a cada tecla.' },
  { id: 'rea-06-e5', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o manipulador que cancela o envio nativo e lê os campos do formulário.', code: '<form onSubmit={(e) => {\n  e.[[0]]();\n  const dados = Object.fromEntries(new [[1]](e.currentTarget));\n}}>', answers: [['preventDefault'], ['FormData']], explanation: '§preventDefault()§ evita recarregar a página; §FormData§ lê os campos pelo atributo §name§.' },
  { id: 'rea-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o §FormData§. Implemente §serializarFormulario(campos)§, onde cada campo é §{ name, type, value, checked, disabled }§ (§type§ padrão §"text"§). Regras: ignore campos sem §name§ (ou vazio), §disabled§ e os tipos §button§, §submit§, §reset§, §image§ e §file§; §checkbox§ e §radio§ só entram se §checked§ e o valor é §value§ (ou §"on"§ se §value§ for §undefined§); os demais usam §value§ (ou §""§ se §undefined§). Nomes repetidos viram **lista** (na ordem de aparição); um nome que aparece uma vez fica como string. Devolva um objeto simples.', lang: 'javascript', starter: 'function serializarFormulario(campos) {\n  // seu código aqui\n}\n', hints: ['Percorra os campos e acumule em um objeto; ao repetir o nome, converta para array.', 'Cuidado: um valor de texto que é um array não ocorre; só os nomes repetidos viram array.'], tests: [{ name: 'texto, checkbox e rádio', code: R`const campos = [
  { name: 'email', value: 'a@b.c' }, { name: 'aceito', type: 'checkbox', checked: true }, { name: 'newsletter', type: 'checkbox', checked: false },
  { name: 'plano', type: 'radio', value: 'basico', checked: false }, { name: 'plano', type: 'radio', value: 'pro', checked: true }, { name: 'obs' }
];
assert.deepEqual(serializarFormulario(campos), { email: 'a@b.c', aceito: 'on', plano: 'pro', obs: '' });` }, { name: 'ignora desabilitados, sem nome e botões', code: R`const campos = [{ name: 'a', value: '1', disabled: true }, { value: 'sem nome' }, { name: '', value: 'x' }, { name: 'ok', type: 'submit', value: 'Enviar' }, { name: 'f', type: 'file' }, { name: 'b', value: '2' }];
assert.deepEqual(serializarFormulario(campos), { b: '2' });` }, { name: 'nomes repetidos viram lista', code: R`const campos = [{ name: 'tag', value: 'a' }, { name: 'x', value: '1' }, { name: 'tag', value: 'b' }, { name: 'tag', value: 'c' }];
assert.deepEqual(serializarFormulario(campos), { tag: ['a', 'b', 'c'], x: '1' });` }], solution: R`function serializarFormulario(campos) {
  const ignorados = new Set(['button', 'submit', 'reset', 'image', 'file']);
  const out = {};
  for (const c of campos) {
    const tipo = c.type || 'text';
    if (!c.name || c.disabled || ignorados.has(tipo)) continue;
    let valor;
    if (tipo === 'checkbox' || tipo === 'radio') {
      if (!c.checked) continue;
      valor = c.value === undefined ? 'on' : c.value;
    } else valor = c.value === undefined ? '' : c.value;
    if (c.name in out) out[c.name] = Array.isArray(out[c.name]) ? [...out[c.name], valor] : [out[c.name], valor];
    else out[c.name] = valor;
  }
  return out;
}
`, explanation: 'Isto resume as regras do §FormData§ do navegador: só campos nomeados e habilitados participam, caixas desmarcadas somem e nomes repetidos acumulam. Conhecer essas regras explica por que formulários "perdem" campos.' }
]
};
