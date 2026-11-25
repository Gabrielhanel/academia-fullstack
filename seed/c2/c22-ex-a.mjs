// C2.2 — Tailwind CSS e Design Systems: exercícios das aulas 1 a 5.
// O Tailwind e o React não rodam no laboratório (só JavaScript puro): os desafios "code" modelam a lógica.
const R = String.raw;

export const exsetsA = {
'tdw-01': [
  { id: 'tdw-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a principal característica da abordagem utility-first?', options: ['Cada componente tem uma classe semântica com todo o seu CSS', 'A aparência é composta no próprio marcado com classes pequenas de uma única responsabilidade', 'O CSS é escrito em JavaScript e executado no navegador', 'Todo estilo é escrito com o atributo style'], answer: 1, explanation: 'Utilitários como §p-4§ e §flex§ fazem uma coisa cada e vêm de uma escala de design; o compilador gera só o CSS das classes encontradas.' },
  { id: 'tdw-01-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'Em produção a cor do selo "sumiu" para alguns status. Clique na linha que impede o Tailwind de gerar as classes.', code: 'function Selo({ cor }: { cor: "green" | "red" }) {\n  return (\n    <span className={`bg-${cor}-100 text-${cor}-900`}>ok</span>\n  );\n}', answer: 3, explanation: 'O Tailwind procura o **texto completo** das classes; nomes montados em tempo de execução (§bg-DOLAR{cor}-100§) não aparecem inteiros no código e não são gerados. Use um mapa com os nomes completos.' },
  { id: 'tdw-01-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o utilitário ao CSS gerado (Tailwind v4).', pairs: [['p-4', 'padding: calc(var(--spacing) * 4)'], ['hidden', 'display: none'], ['w-[37px]', 'width: 37px'], ['-mt-1', 'margin-top: calc(var(--spacing) * -1)']], explanation: 'No v4, os espaçamentos usam a variável §--spacing§ (0,25rem por padrão) multiplicada pelo número; valores arbitrários vão entre colchetes.' },
  { id: 'tdw-01-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'A variante §hover:§ do Tailwind v4 aplica o estilo mesmo em dispositivos de toque, sem nenhuma condição de mídia.', answer: false, explanation: 'O CSS gerado envolve o hover em §@media (hover: hover)§: o estilo só vale em dispositivos com hover real, evitando "hover preso" em telas de toque.' },
  { id: 'tdw-01-e5', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete as classes: foco visível por teclado e botão desabilitado com opacidade reduzida.', code: '<button className="[[0]]:outline-2 [[1]]:opacity-50">Salvar</button>', answers: [['focus-visible'], ['disabled']], explanation: '§focus-visible:§ aplica o estilo quando o navegador mostra o foco (uso por teclado); §disabled:§ aplica quando o botão está desabilitado.' },
  { id: 'tdw-01-e6', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §utilitarioParaCss(classe)§, que traduz um subconjunto de utilitários para a declaração CSS (como o Tailwind v4). Regras: **espaçamento** §p§, §px§, §py§, §pt§, §pr§, §pb§, §pl§, §m§, §mx§, §my§, §mt§, §mr§, §mb§, §ml§, §gap§, §w§, §h§ seguidos de §-N§ (inteiro ou decimal, com §-§ inicial opcional para negativo) viram §propriedade: calc(var(--spacing) * N)§; as propriedades são §padding§, §padding-inline§ (px), §padding-block§ (py), §padding-top§/§right§/§bottom§/§left§, as equivalentes de §margin§, §gap§, §width§ e §height§. **Arbitrário**: §w-[37px]§ → §width: 37px§ e §h-[2rem]§ → §height: 2rem§ (só para §w§ e §h§). **Fixos**: §flex§ → §display: flex§, §grid§ → §display: grid§, §block§ → §display: block§, §hidden§ → §display: none§. Qualquer outra entrada devolve §null§.', lang: 'javascript', starter: 'function utilitarioParaCss(classe) {\n  // seu código aqui\n}\n', hints: ['Use uma tabela prefixo → propriedade e uma regex para o número.', 'Para negativos, o sinal fica no começo da classe (-mt-1).'], tests: [{ name: 'espaçamentos', code: R`assert.equal(utilitarioParaCss('p-4'), 'padding: calc(var(--spacing) * 4)');
assert.equal(utilitarioParaCss('px-2.5'), 'padding-inline: calc(var(--spacing) * 2.5)');
assert.equal(utilitarioParaCss('-mt-1'), 'margin-top: calc(var(--spacing) * -1)');
assert.equal(utilitarioParaCss('gap-6'), 'gap: calc(var(--spacing) * 6)');
assert.equal(utilitarioParaCss('w-10'), 'width: calc(var(--spacing) * 10)');` }, { name: 'arbitrários e fixos', code: R`assert.equal(utilitarioParaCss('w-[37px]'), 'width: 37px');
assert.equal(utilitarioParaCss('h-[2rem]'), 'height: 2rem');
assert.equal(utilitarioParaCss('flex'), 'display: flex');
assert.equal(utilitarioParaCss('hidden'), 'display: none');` }, { name: 'desconhecidos', code: R`for (const c of ['p', 'p-', 'p-x', 'foo-4', 'p-4px', 'text-sm', 'p-[3px]', '', 'flex-1']) assert.equal(utilitarioParaCss(c), null, c);` }], solution: R`function utilitarioParaCss(classe) {
  const fixos = { flex: 'display: flex', grid: 'display: grid', block: 'display: block', hidden: 'display: none' };
  if (classe in fixos) return fixos[classe];
  const props = { p: 'padding', px: 'padding-inline', py: 'padding-block', pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left',
    m: 'margin', mx: 'margin-inline', my: 'margin-block', mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left', gap: 'gap', w: 'width', h: 'height' };
  let m = /^(-?)([a-z]+)-(\d+(?:\.\d+)?)$/.exec(classe);
  if (m && Object.hasOwn(props, m[2])) return props[m[2]] + ': calc(var(--spacing) * ' + m[1] + m[3] + ')';
  m = /^(w|h)-\[([^\]]+)\]$/.exec(classe);
  if (m) return props[m[1]] + ': ' + m[2];
  return null;
}
`, explanation: 'O Tailwind faz isto em escala: cada classe é uma "palavra" que o compilador entende (prefixo + valor) e traduz para CSS. Entender a tradução ajuda a depurar o CSS gerado e a criar utilitários próprios.' }
],
'tdw-02': [
  { id: 'tdw-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que a classe §flex-col md:flex-row§ faz?', options: ['Coluna em telas grandes e linha em telas pequenas', 'Coluna por padrão e linha a partir do breakpoint md (mobile-first)', 'Linha em todas as larguras', 'Aplica as duas direções ao mesmo tempo'], answer: 1, explanation: 'Mobile-first: o utilitário sem prefixo vale para todas as larguras e §md:§ aplica a partir da largura mínima do breakpoint (48rem por padrão).' },
  { id: 'tdw-02-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'A janela tem 800 px de largura (breakpoints padrão: sm 640, md 768, lg 1024, xl 1280).', code: '<div class="flex-col md:flex-row lg:grid p-2 md:p-4 lg:p-8">', lang: 'html', steps: [{ q: 'Qual utilitário de padding está ativo?', answers: ['md:p-4', 'p-4'] }, { q: 'A classe lg:grid está ativa? (sim ou não)', answers: ['não', 'nao'] }], explanation: 'A 800 px, valem as regras sem prefixo e as de sm e md; o §md:p-4§ vence o §p-2§ (maior breakpoint). O §lg:§ só vale a partir de 1024 px.' },
  { id: 'tdw-02-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O menu foi escrito de forma desktop-first: a regra vale para telas grandes e é desfeita nas pequenas. Clique na linha que usa essa abordagem.', code: '<nav class="flex max-md:hidden">\n  <!-- menu principal -->\n</nav>\n<button class="md:hidden">Menu</button>', answer: 1, explanation: '§max-md:hidden§ pensa no desktop e "desfaz" no celular. Em mobile-first, o padrão é para telas pequenas e §md:§ amplia: §hidden md:flex§ no menu e §md:hidden§ no botão.' },
  { id: 'tdw-02-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o recurso ao seu uso.', pairs: [['@container + @md:', 'Componente que reage ao tamanho do contêiner'], ['md:grid-cols-3', 'Três colunas a partir do breakpoint md'], ['dark: com @custom-variant', 'Modo escuro controlado por uma classe'], ['min-h-dvh', 'Altura mínima considerando a barra do navegador móvel']], explanation: 'Cada recurso resolve um problema distinto: contêiner, janela, tema e viewport móvel.' },
  { id: 'tdw-02-e5', type: 'tf', difficulty: 2, points: 5, prompt: 'Com §dark:§ configurado para classe, é suficiente colocar §class="dark"§ no §<html>§ para ativar os estilos escuros.', answer: true, explanation: 'Com §@custom-variant dark (&:where(.dark, .dark *))§, os estilos §dark:§ valem dentro de qualquer elemento com a classe §dark§, normalmente o §<html>§.' },
  { id: 'tdw-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a resolução mobile-first. Implemente §classesAtivas(classes, largura, tema)§, onde §classes§ é uma string de utilitários separados por espaço, §largura§ está em px e §tema§ é §"claro"§ ou §"escuro"§. Variantes aceitas (no máximo duas por classe, em qualquer ordem): §sm§ (640), §md§ (768), §lg§ (1024), §xl§ (1280) e §dark§. Uma classe está **ativa** se a largura é **maior ou igual** ao breakpoint e, para §dark§, o tema é §"escuro"§. Dois utilitários **conflitam** se tiverem o mesmo **grupo**: o nome sem o último segmento após o §-§ (§p-2§ e §p-4§ → §p§; §flex-col§ e §flex-row§ → §flex§; §bg-white§ e §bg-black§ → §bg§); classes sem §-§ formam grupo próprio. Entre conflitantes ativos vence a de **maior prioridade** (breakpoint maior; com o mesmo breakpoint, a com §dark§ vence; empate: a **última**). Devolva os utilitários vencedores (sem variantes), na ordem da primeira aparição de cada grupo.', lang: 'javascript', starter: 'function classesAtivas(classes, largura, tema) {\n  // seu código aqui\n}\n', hints: ['Separe as variantes pelo ":" — a última parte é o utilitário.', 'Calcule prioridade = índice do breakpoint * 2 + (dark ? 1 : 0).'], tests: [{ name: 'mobile-first', code: R`assert.deepEqual(classesAtivas('p-2 md:p-4 lg:p-8', 800, 'claro'), ['p-4']);
assert.deepEqual(classesAtivas('p-2 md:p-4 lg:p-8', 500, 'claro'), ['p-2']);
assert.deepEqual(classesAtivas('flex-col md:flex-row', 1200, 'claro'), ['flex-row']);
assert.deepEqual(classesAtivas('flex-col md:flex-row', 400, 'claro'), ['flex-col']);` }, { name: 'dark e combinações', code: R`assert.deepEqual(classesAtivas('bg-white dark:bg-black', 300, 'escuro'), ['bg-black']);
assert.deepEqual(classesAtivas('bg-white dark:bg-black', 300, 'claro'), ['bg-white']);
assert.deepEqual(classesAtivas('md:dark:bg-gray dark:bg-black bg-white', 900, 'escuro'), ['bg-gray']);
assert.deepEqual(classesAtivas('md:dark:bg-gray dark:bg-black bg-white', 500, 'escuro'), ['bg-black']);` }, { name: 'ordem, empates e classes sem grupo', code: R`assert.deepEqual(classesAtivas('hidden p-1 p-3 text-sm', 100, 'claro'), ['hidden', 'p-3', 'text-sm']);
assert.deepEqual(classesAtivas('lg:hidden xl:p-2', 1100, 'claro'), ['hidden']);
assert.deepEqual(classesAtivas('', 500, 'claro'), []);` }], solution: R`function classesAtivas(classes, largura, tema) {
  const bps = { sm: 640, md: 768, lg: 1024, xl: 1280 };
  const ordem = ['sm', 'md', 'lg', 'xl'];
  const grupos = new Map();
  const lista = classes.split(/\s+/).filter(Boolean);
  lista.forEach((c, i) => {
    const partes = c.split(':');
    const util = partes.pop();
    let bp = -1, dark = false, ok = true;
    for (const v of partes) {
      if (v === 'dark') { dark = true; if (tema !== 'escuro') ok = false; }
      else if (v in bps) { bp = Math.max(bp, ordem.indexOf(v)); if (largura < bps[v]) ok = false; }
      else ok = false;
    }
    if (!ok) return;
    const k = util.lastIndexOf('-');
    const grupo = k > 0 ? util.slice(0, k) : util;
    const prio = (bp + 1) * 2 + (dark ? 1 : 0);
    const atual = grupos.get(grupo);
    if (!atual) grupos.set(grupo, { util, prio, i });
    else if (prio >= atual.prio) grupos.set(grupo, { util, prio, i: atual.i });
  });
  return [...grupos.values()].sort((a, b) => a.i - b.i).map((g) => g.util);
}
`, explanation: 'É o essencial da cascata responsiva: cada utilitário traz uma condição e uma prioridade (breakpoint maior vence, depois o modo escuro). O CSS real usa a ordem das regras no arquivo gerado, mas o resultado prático é o mesmo.' }
],
'tdw-03': [
  { id: 'tdw-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'No Tailwind v4, onde se configura o tema (cores, fontes, breakpoints)?', options: ['Em um arquivo tailwind.config.js obrigatório', 'No CSS, com a diretiva @theme', 'No package.json', 'No HTML, com atributos data-theme'], answer: 1, explanation: 'O v4 é "CSS-first": as variáveis de §@theme§ com namespaces conhecidos (§--color-*§, §--font-*§, §--breakpoint-*§) geram os utilitários.' },
  { id: 'tdw-03-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a diretiva ao seu papel.', pairs: [['@theme', 'Declara tokens que geram utilitários'], ['@theme inline', 'Faz o utilitário apontar direto para uma variável dinâmica'], ['@utility', 'Cria um utilitário que aceita variantes'], ['@source', 'Inclui ou exclui arquivos na detecção de classes']], explanation: 'Essas quatro diretivas cobrem a maior parte da personalização do v4.' },
  { id: 'tdw-03-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O tema escuro não muda a cor de §bg-fundo§, que continua branca. Clique na linha que fixa o valor no momento da compilação.', code: '@import "tailwindcss";\n@theme { --color-fundo: var(--fundo-app); }\n:root { --fundo-app: white; }\n.dark { --fundo-app: #111; }', answer: 2, explanation: 'Variáveis de §@theme§ são resolvidas de forma estática; para seguir uma variável que muda em execução, use §@theme inline { --color-fundo: var(--fundo-app); }§, que faz o utilitário apontar direto para ela.' },
  { id: 'tdw-03-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'A detecção automática de classes do Tailwind v4 varre também a pasta §node_modules§, então bibliotecas de componentes funcionam sem configuração.', answer: false, explanation: 'A detecção ignora §node_modules§ e arquivos do §.gitignore§. Para bibliotecas, use §@source "../node_modules/biblioteca"§.' },
  { id: 'tdw-03-e5', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o CSS de entrada do Tailwind v4 com o plugin do Vite.', code: '/* estilos.css */\n[[0]] "tailwindcss";\n\n/* vite.config.ts */\nimport tailwindcss from "[[1]]";', answers: [['@import'], ['@tailwindcss/vite']], explanation: 'O v4 usa §@import "tailwindcss"§ (no lugar das três diretivas §@tailwind§) e o plugin §@tailwindcss/vite§.' },
  { id: 'tdw-03-e6', type: 'code', difficulty: 2, points: 20, prompt: 'Modele "só as variáveis usadas são emitidas". Implemente §variaveisEmitidas(tema, classes)§: §tema§ é um objeto §{ "--color-marca-500": "#0b5fff", ... }§ e §classes§ uma lista de utilitários. Uma classe usa uma variável se: §bg-X§, §text-X§, §border-X§ → §--color-X§ (somente se existir no tema); §font-X§ → §--font-X§; §text-X§ também pode ser tamanho: §--text-X§ (se §--color-X§ não existir mas §--text-X§ existir). Variantes (§hover:§, §md:§...) são ignoradas na busca (use a parte depois do último §:§). Devolva a lista **ordenada alfabeticamente** de nomes de variáveis emitidas, **sem repetição**. Variáveis não usadas não aparecem; classes sem variável no tema são ignoradas.', lang: 'javascript', starter: 'function variaveisEmitidas(tema, classes) {\n  // seu código aqui\n}\n', hints: ['Pegue a parte depois do último ":" de cada classe.', 'Teste os prefixos bg-, text-, border- e font- e procure as variáveis no tema.'], tests: [{ name: 'só as usadas', code: R`const tema = { '--color-marca-500': '#0b5fff', '--color-marca-600': '#0847c4', '--color-nao-usada': '#123456', '--font-display': 'Inter', '--text-lg': '1.125rem' };
assert.deepEqual(variaveisEmitidas(tema, ['bg-marca-500', 'hover:text-marca-600', 'font-display', 'p-4']), ['--color-marca-500', '--color-marca-600', '--font-display']);` }, { name: 'tamanho de texto e repetições', code: R`const tema = { '--text-lg': '1.125rem', '--color-lg': 'red' };
assert.deepEqual(variaveisEmitidas({ '--text-lg': '1.125rem' }, ['@md:text-lg', 'md:text-lg']), ['--text-lg']);
assert.deepEqual(variaveisEmitidas(tema, ['text-lg']), ['--color-lg']);
assert.deepEqual(variaveisEmitidas(tema, []), []);` }, { name: 'borda e inexistentes', code: R`const tema = { '--color-borda': '#ddd' };
assert.deepEqual(variaveisEmitidas(tema, ['border-borda', 'border-outra', 'bg-borda', 'sm:md:bg-borda']), ['--color-borda']);` }], solution: R`function variaveisEmitidas(tema, classes) {
  const usadas = new Set();
  for (const c of classes) {
    const u = c.slice(c.lastIndexOf(':') + 1);
    let m = /^(bg|text|border)-(.+)$/.exec(u);
    if (m) {
      const cor = '--color-' + m[2];
      if (cor in tema) usadas.add(cor);
      else if (m[1] === 'text' && ('--text-' + m[2]) in tema) usadas.add('--text-' + m[2]);
      continue;
    }
    m = /^font-(.+)$/.exec(u);
    if (m && ('--font-' + m[1]) in tema) usadas.add('--font-' + m[1]);
  }
  return [...usadas].sort();
}
`, explanation: 'No v4, o tema padrão tem centenas de variáveis, mas só as referenciadas pelas classes encontradas vão para o CSS final. O modelo reproduz a regra e mostra por que um token nunca usado não pesa no resultado.' }
],
'tdw-04': [
  { id: 'tdw-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Uma mesma sequência de 12 classes aparece em 30 botões. Qual é a melhor forma de reutilizá-la, segundo a documentação do Tailwind?', options: ['Criar a classe §.btn§ com §@apply§ em todos os casos', 'Extrair um componente (por exemplo, §<Botao>§) com variantes', 'Copiar e colar a sequência em cada arquivo', 'Usar o atributo style'], answer: 1, explanation: 'Componentes concentram as classes, tipam as props e permitem variantes; §@apply§ fica para HTML que você não controla.' },
  { id: 'tdw-04-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Considere §twMerge§ do tailwind-merge (medido).', code: "twMerge('p-2 p-4', 'text-sm text-lg', 'bg-red-500 bg-blue-500')\ncn('px-2 py-1', 'px-4')   // cn = twMerge(clsx(...))", lang: 'javascript', steps: [{ q: 'Resultado da primeira linha (classes separadas por espaço):', answers: ['p-4 text-lg bg-blue-500'] }, { q: 'Resultado do cn(...):', answers: ['py-1 px-4'] }], explanation: 'A última classe de cada grupo conflitante vence; no segundo caso, o §px-4§ do consumidor substitui o §px-2§ e a ordem resultante é §py-1 px-4§.' },
  { id: 'tdw-04-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O consumidor passa §className="h-12"§, mas o botão continua com §h-10§ em alguns casos. Clique na linha que impede a sobrescrita previsível.', code: 'export function Botao({ className, ...resto }: ComponentProps<"button">) {\n  return (\n    <button className={"h-10 px-4 " + className} {...resto} />\n  );\n}', answer: 3, explanation: 'Concatenar com §+§ deixa §h-10§ e §h-12§ no mesmo elemento: quem vence depende da ordem do CSS gerado. Use §cn("h-10 px-4", className)§ (clsx + tailwind-merge). Também trata §className§ indefinido.' },
  { id: 'tdw-04-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a biblioteca ao seu papel.', pairs: [['cva', 'Declara variantes e padrões do componente'], ['clsx', 'Monta a string de classes a partir de condicionais'], ['tailwind-merge', 'Resolve conflitos entre classes do Tailwind'], ['VariantProps', 'Deriva os tipos das props a partir das variantes']], explanation: 'Juntas formam o "kit" de componentes com Tailwind: variantes tipadas, condicionais e conflitos resolvidos.' },
  { id: 'tdw-04-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Explique por que é importante deixar o §className§ do consumidor por último em §cn()§ e que riscos existem ao permitir sobrescritas livres em um design system.', model: 'O tailwind-merge mantém a última classe de cada grupo conflitante; se o className do consumidor vier por último, ele vence a base do componente (por exemplo, h-12 substitui h-10), o que dá uma saída previsível para exceções. O risco de permitir sobrescritas livres é a erosão da consistência: cada produto altera cores, espaços e tamanhos e o design system deixa de garantir visual e acessibilidade (contraste, tamanho de alvo, foco). Mitigações: expor variantes e tokens para os casos previstos, revisar usos de className nas contribuições, linter para classes fora do sistema e tratar exceções recorrentes como pedidos de novas variantes.', rubric: ['Explica que o último valor do grupo vence no tailwind-merge', 'Cita o risco de inconsistência e de quebrar acessibilidade', 'Propõe variantes e tokens como caminho principal', 'Propõe revisão ou linter para sobrescritas'], explanation: 'A flexibilidade de className é um escape hatch: útil, mas deve ser exceção controlada.' },
  { id: 'tdw-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §cn(...entradas)§, uma versão simplificada de §twMerge(clsx(...))§. **clsx**: entradas podem ser strings, números (≠ 0), arrays (recursivos) e objetos §{ classe: condição }§; ignore §false§, §null§, §undefined§, §0§ e §""§. **Mescla**: separe as classes por espaço; o **grupo** de uma classe é §variantes + ":" + tipo§, onde as variantes são os prefixos antes do último §:§ (podem ser vazias) e o **tipo** é o texto antes do primeiro §-§ do utilitário (ou o utilitário inteiro, se não houver §-§) — **exceto** §text-§, que tem dois tipos: §"text-tamanho"§ se o resto for um de §xs§, §sm§, §base§, §lg§, §xl§, §2xl§, §3xl§ e §"text-cor"§ nos demais casos. Em cada grupo, **só a última ocorrência** permanece; as classes que sobram mantêm a **ordem em que aparecem** (pela posição de sua última ocorrência). Duplicatas exatas também se reduzem. Não trate a relação entre §p§ e §px§ (são tipos diferentes).', lang: 'javascript', starter: 'function cn(...entradas) {\n  // seu código aqui\n}\n', hints: ['Primeiro achate as entradas em uma lista de classes; depois percorra do fim para o início guardando o grupo já visto.', 'Para a ordem final, reverta a lista filtrada.'], tests: [{ name: 'clsx: strings, arrays e objetos', code: R`assert.equal(cn('a', false && 'b', { c: true, d: 0 }, ['e', null, 'f']), 'a c e f');
assert.equal(cn(), '');
assert.equal(cn('  a   b ', '', 0, undefined, ['c', ['d']]), 'a b c d');` }, { name: 'conflitos e ordem (exemplos da aula)', code: R`assert.equal(cn('p-2 p-4', 'text-sm text-lg', 'bg-red-500 bg-blue-500'), 'p-4 text-lg bg-blue-500');
assert.equal(cn('px-2 py-1', 'px-4'), 'py-1 px-4');
assert.equal(cn('px-4', 'px-2 py-1'), 'px-2 py-1');` }, { name: 'variantes e text-', code: R`assert.equal(cn('hover:bg-red-500 bg-blue-500 md:p-2 p-4'), 'hover:bg-red-500 bg-blue-500 md:p-2 p-4');
assert.equal(cn('md:p-2 md:p-4 p-1'), 'md:p-4 p-1');
assert.equal(cn('text-sm text-red-500'), 'text-sm text-red-500');
assert.equal(cn('text-red-500 text-blue-500 text-lg text-xl'), 'text-blue-500 text-xl');
assert.equal(cn('flex flex'), 'flex');
assert.equal(cn('btn-primary btn-secondary'), 'btn-secondary');` }], solution: R`function cn(...entradas) {
  const lista = [];
  const coletar = (e) => {
    if (!e) return;
    if (typeof e === 'string') lista.push(...e.split(/\s+/).filter(Boolean));
    else if (typeof e === 'number') lista.push(String(e));
    else if (Array.isArray(e)) e.forEach(coletar);
    else if (typeof e === 'object') for (const [k, v] of Object.entries(e)) if (v) lista.push(k);
  };
  entradas.forEach(coletar);
  const tamanhos = new Set(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']);
  const grupo = (c) => {
    const i = c.lastIndexOf(':');
    const variantes = i >= 0 ? c.slice(0, i) : '';
    const util = c.slice(i + 1);
    const d = util.indexOf('-');
    let tipo = d > 0 ? util.slice(0, d) : util;
    if (tipo === 'text') tipo = tamanhos.has(util.slice(d + 1)) ? 'text-tamanho' : 'text-cor';
    return variantes + ':' + tipo;
  };
  const vistos = new Set(); const saida = [];
  for (let i = lista.length - 1; i >= 0; i--) {
    const g = grupo(lista[i]);
    if (vistos.has(g)) continue;
    vistos.add(g); saida.push(lista[i]);
  }
  return saida.reverse().join(' ');
}
`, explanation: 'O tailwind-merge real conhece centenas de grupos (e relações como §p§ versus §px§), mas a ideia é a mesma: dentro de cada grupo, a última classe vence. Por isso o §className§ do consumidor deve vir por último.' }
],
'tdw-05': [
  { id: 'tdw-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual camada de tokens os componentes devem consumir?', options: ['Os primitivos (por exemplo, azul-600)', 'Os semânticos (por exemplo, acao-fundo)', 'Valores literais em hexadecimal', 'Qualquer um, indistintamente'], answer: 1, explanation: 'Tokens semânticos nomeiam a função. Trocar o tema muda o que o semântico aponta, sem alterar componentes.' },
  { id: 'tdw-05-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a camada ao exemplo.', pairs: [['Primitivo', 'cor.primitivo.azul.600 = #0847c4'], ['Semântico', 'cor.semantico.acao.fundo → {cor.primitivo.azul.600}'], ['De componente', 'botao.fundo → {cor.semantico.acao.fundo}'], ['Formato DTCG', '"$value" e "$type" em cada token']], explanation: 'As camadas separam valores brutos, funções e usos específicos; o DTCG padroniza o formato do arquivo.' },
  { id: 'tdw-05-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O tema escuro exigiu alterar dezenas de componentes. Clique na linha que viola a regra das camadas.', code: 'export function Botao() {\n  return (\n    <button className="bg-[#0847c4] text-white hover:bg-[#0b5fff]">\n      Salvar\n    </button>\n  );\n}', answer: 3, explanation: 'Valores literais (ou cores primitivas) nos componentes impedem o tema: mudar a aparência exige editar cada arquivo. Use tokens semânticos (§bg-acao-fundo§, §hover:bg-acao-fundo-hover§).' },
  { id: 'tdw-05-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Tokens: §primitivo.azul500 = #0b5fff§, §primitivo.azul600 = #0847c4§, §semantico.acao (claro) = {azul600}§, §semantico.acao (escuro) = {azul500}§.', code: 'tema claro  -> semantico.acao = ?\ntema escuro -> semantico.acao = ?', lang: 'text', steps: [{ q: 'Valor de semantico.acao no tema claro:', answers: ['#0847c4'] }, { q: 'Valor de semantico.acao no tema escuro:', answers: ['#0b5fff'] }], explanation: 'O componente usa sempre §semantico.acao§; o tema decide para qual primitivo ele aponta.' },
  { id: 'tdw-05-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Explique por que nomear um token de §azul-claro§ no nível semântico é uma má prática e dê dois nomes melhores.', model: 'Um nome que descreve a aparência amarra o token a um valor: se a marca mudar para verde ou o tema escuro exigir outra cor, "azul-claro" passa a mentir ou obriga a renomear (mudança incompatível). Nomes semânticos descrevem a função e sobrevivem à troca de valor: por exemplo, cor.fundo.suave, cor.acao.fundo, cor.texto.secundario, cor.borda.foco. Isso também facilita temas, pois o mesmo nome aponta para primitivos diferentes por tema.', rubric: ['Explica que o nome amarra o token à aparência', 'Cita problema com temas ou mudança de marca', 'Dá dois nomes semânticos válidos', 'Relaciona nomes por função à estabilidade da API'], explanation: 'Nomes por função mantêm a API estável enquanto os valores mudam.' },
  { id: 'tdw-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §resolverTema(tokens, tema)§. §tokens§ é um objeto plano nome → definição, onde a definição é uma string (valor literal, ou referência §"{outro.nome}"§ **inteira**) ou um objeto §{ claro, escuro }§ com uma string para cada tema. Devolva um objeto §{ nome: valorFinal }§ com **todos** os tokens resolvidos para o §tema§ pedido, seguindo referências em cadeia. Erros: §Error("referência inexistente: X")§ para uma referência a um nome que não existe; §Error("ciclo: a -> b -> a")§ ao detectar ciclo (liste o caminho percorrido, começando no primeiro token do ciclo visitado na resolução); §Error("tema sem valor: nome")§ se a definição for um objeto sem a chave do tema.', lang: 'javascript', starter: 'function resolverTema(tokens, tema) {\n  // seu código aqui\n}\n', hints: ['Resolva cada token com uma função recursiva que guarda o caminho.', 'Uma referência é uma string no formato /^\\{([^}]+)\\}$/.'], tests: [{ name: 'resolve por tema e em cadeia', code: R`const tokens = {
  'cor.azul.500': '#0b5fff', 'cor.azul.600': '#0847c4', 'cor.branco': '#ffffff',
  'acao.fundo': { claro: '{cor.azul.600}', escuro: '{cor.azul.500}' },
  'botao.fundo': '{acao.fundo}', 'botao.texto': '{cor.branco}'
};
assert.deepEqual(resolverTema(tokens, 'claro'), { 'cor.azul.500': '#0b5fff', 'cor.azul.600': '#0847c4', 'cor.branco': '#ffffff', 'acao.fundo': '#0847c4', 'botao.fundo': '#0847c4', 'botao.texto': '#ffffff' });
assert.equal(resolverTema(tokens, 'escuro')['botao.fundo'], '#0b5fff');` }, { name: 'erros', code: R`assert.throws(() => resolverTema({ a: '{b}' }, 'claro'), 'referência inexistente: b');
assert.throws(() => resolverTema({ a: '{b}', b: '{a}' }, 'claro'), 'ciclo: a -> b -> a');
assert.throws(() => resolverTema({ a: { claro: '#fff' } }, 'escuro'), 'tema sem valor: a');` }, { name: 'literais e vazio', code: R`assert.deepEqual(resolverTema({}, 'claro'), {});
assert.deepEqual(resolverTema({ x: '8px', y: '{x}' }, 'escuro'), { x: '8px', y: '8px' });
assert.deepEqual(resolverTema({ x: 'calc({y})' }, 'claro'), { x: 'calc({y})' });` }], solution: R`function resolverTema(tokens, tema) {
  const cache = {};
  const resolver = (nome, caminho) => {
    if (nome in cache) return cache[nome];
    if (!(nome in tokens)) throw new Error('referência inexistente: ' + nome);
    if (caminho.includes(nome)) throw new Error('ciclo: ' + [...caminho.slice(caminho.indexOf(nome)), nome].join(' -> '));
    const def = tokens[nome];
    let v = def;
    if (def && typeof def === 'object') {
      if (!(tema in def)) throw new Error('tema sem valor: ' + nome);
      v = def[tema];
    }
    const m = /^\{([^}]+)\}$/.exec(v);
    const final = m ? resolver(m[1], [...caminho, nome]) : v;
    cache[nome] = final;
    return final;
  };
  const out = {};
  for (const nome of Object.keys(tokens)) out[nome] = resolver(nome, []);
  return out;
}
`, explanation: 'É o que o Style Dictionary faz ao resolver referências, acrescido de tema: um token semântico aponta para primitivos diferentes por modo. Detectar ciclos e referências inexistentes evita tokens quebrados no pacote publicado.' },
  { id: 'tdw-05-e7', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §razaoContraste(corA, corB)§, a razão de contraste da WCAG entre duas cores hexadecimais (§"#rrggbb"§ ou §"#rgb"§, com ou sem maiúsculas). Calcule a **luminância relativa** de cada cor (canal sRGB: §c/255§; se §c <= 0.03928§ então §c/12.92§, senão §((c + 0.055) / 1.055) ** 2.4§; §L = 0.2126 R + 0.7152 G + 0.0722 B§) e devolva §(Lmaior + 0.05) / (Lmenor + 0.05)§ arredondada para **2 casas** (§Math.round(x * 100) / 100§). Lance §Error("cor inválida: X")§ para entradas fora do formato. Inclua também §passaAA(corTexto, corFundo, textoGrande)§, que devolve §true§ se a razão for ≥ 4.5 (ou ≥ 3 quando §textoGrande§ for verdadeiro).', lang: 'javascript', starter: 'function razaoContraste(corA, corB) {\n  // seu código aqui\n}\n\nfunction passaAA(corTexto, corFundo, textoGrande = false) {\n  // seu código aqui\n}\n', hints: ['Expanda "#abc" para "#aabbcc".', 'A razão usa a luminância maior no numerador.'], tests: [{ name: 'valores de referência', code: R`assert.equal(razaoContraste('#000000', '#ffffff'), 21);
assert.equal(razaoContraste('#fff', '#fff'), 1);
assert.equal(razaoContraste('#767676', '#ffffff'), 4.54);
assert.equal(razaoContraste('#FFFFFF', '#767676'), 4.54);` }, { name: 'AA', code: R`assert.equal(passaAA('#767676', '#ffffff'), true);
assert.equal(passaAA('#777777', '#ffffff'), false);
assert.equal(passaAA('#777777', '#ffffff', true), true);
assert.equal(passaAA('#0847c4', '#ffffff'), true);` }, { name: 'entradas inválidas', code: R`assert.throws(() => razaoContraste('azul', '#fff'), 'cor inválida: azul');
assert.throws(() => razaoContraste('#12345', '#fff'), 'cor inválida: #12345');
assert.throws(() => razaoContraste('#fff', 'rgb(0,0,0)'), 'cor inválida: rgb(0,0,0)');` }], solution: R`function luminancia(hex) {
  let h = String(hex).trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) throw new Error('cor inválida: ' + hex);
  h = h.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function razaoContraste(corA, corB) {
  const a = luminancia(corA), b = luminancia(corB);
  const [maior, menor] = a >= b ? [a, b] : [b, a];
  return Math.round(((maior + 0.05) / (menor + 0.05)) * 100) / 100;
}
function passaAA(corTexto, corFundo, textoGrande = false) {
  return razaoContraste(corTexto, corFundo) >= (textoGrande ? 3 : 4.5);
}
`, explanation: 'Contraste é uma propriedade de **pares** de tokens. Automatizar o cálculo em testes impede que uma mudança de cor ou de tema quebre a acessibilidade sem ninguém perceber. #767676 sobre branco é o cinza mais claro que passa em 4,5:1.' }
]
};
