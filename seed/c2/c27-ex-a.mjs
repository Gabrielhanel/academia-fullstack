// C2.7 — Performance frontend: exercícios das aulas 1 a 4.
// Navegador, Lighthouse e React não rodam no laboratório (só JavaScript puro): os desafios "code" modelam a lógica (limiares, percentis, caminho crítico, pacote).
const R = String.raw;

export const exsetsA = {
'pfe-01': [
  { id: 'pfe-01-e1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a métrica ao que ela representa.', pairs: [['LCP', 'Carregamento percebido: quando o maior conteúdo visível aparece'], ['INP', 'Responsividade: latência das interações até a próxima pintura'], ['CLS', 'Estabilidade visual: mudanças inesperadas de layout'], ['TTFB', 'Tempo até o primeiro byte da resposta']], explanation: 'LCP, INP e CLS são os Core Web Vitals; o TTFB é uma métrica de apoio.' },
  { id: 'pfe-01-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que os Core Web Vitals são avaliados no percentil 75 dos dados de campo?', options: ['Porque a média sempre é maior', 'Porque reflete a experiência de quase todos sem ser dominado por extremos: 75% das visitas devem estar dentro do limiar', 'Porque o p75 é o melhor caso', 'Porque o laboratório não permite outro percentil'], answer: 1, explanation: 'O p75 evita que casos raros dominem e que a média esconda as caudas.' },
  { id: 'pfe-01-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do laboratório (Chrome 157, tela de 390 px).', code: 'imagem sem width/height (500 ms de atraso): CLS = ?\nmesma página com width e height:            CLS = ?\nmanipulador de clique com laço de 350 ms:   duração da interação = ? ms', lang: 'text', steps: [{ q: 'CLS sem dimensões:', answers: ['0,012', '0.012'] }, { q: 'CLS com dimensões:', answers: ['0'] }, { q: 'Duração da interação (ms):', answers: ['368'] }], explanation: 'A imagem sem dimensões deslocou o conteúdo (0,012); a interação de 368 ms excede o limite de 200 ms do INP.' },
  { id: 'pfe-01-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Se o notebook do desenvolvedor mostra LCP de 1,8 s, a experiência real dos usuários também é boa.', answer: false, explanation: 'Usuários reais têm aparelhos e redes variados; os dados de campo (p75) mostram a experiência real.' },
  { id: 'pfe-01-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Compare dados de laboratório e de campo: o que cada um mostra, suas limitações e como usar os dois em conjunto.', model: 'Dados de laboratório vêm de execuções controladas e reprodutíveis (Lighthouse, DevTools): permitem depurar, comparar versões antes do deploy e ver detalhes, mas não refletem a variedade de aparelhos, redes e comportamentos, e o INP depende de interações reais. Dados de campo vêm de pessoas reais (CrUX, RUM): mostram a experiência efetiva, incluindo o INP, e permitem priorizar, mas só indicam que há um problema, são atrasados e menos detalhados. Usa-se o campo para descobrir onde está o problema e medir o resultado, e o laboratório para reproduzir, achar a causa e prevenir regressões, validando a correção nos dois.', rubric: ['Descreve o laboratório como controlado e reprodutível', 'Descreve o campo como experiência real', 'Cita limitações de cada um', 'Explica o uso combinado (campo para priorizar, laboratório para diagnosticar)'], explanation: 'Os dois se complementam.' },
  { id: 'pfe-01-e6', type: 'code', difficulty: 1, points: 25, prompt: 'Implemente §classificarVital(metrica, valor)§. Limiares: §"LCP"§ (ms): bom até 2500 (inclusive), ruim acima de 4000; §"INP"§ (ms): bom até 200, ruim acima de 500; §"CLS"§ (sem unidade): bom até 0.1, ruim acima de 0.25. Devolva §"bom"§, §"precisa melhorar"§ (entre os limiares) ou §"ruim"§. Métrica desconhecida → §Error("métrica desconhecida: M")§; valor negativo ou não numérico → §Error("valor inválido")§.', lang: 'javascript', starter: 'function classificarVital(metrica, valor) {\n  // seu código aqui\n}\n', hints: ['Guarde os limiares em um objeto por métrica.', 'Compare com <= para o limite do "bom" e > para o limite do "ruim".'], tests: [{ name: 'LCP, INP e CLS', code: R`assert.equal(classificarVital('LCP', 2500), 'bom');
assert.equal(classificarVital('LCP', 2501), 'precisa melhorar');
assert.equal(classificarVital('LCP', 4000), 'precisa melhorar');
assert.equal(classificarVital('LCP', 4001), 'ruim');
assert.equal(classificarVital('INP', 200), 'bom');
assert.equal(classificarVital('INP', 368), 'precisa melhorar');
assert.equal(classificarVital('INP', 501), 'ruim');
assert.equal(classificarVital('CLS', 0.012), 'bom');
assert.equal(classificarVital('CLS', 0.1), 'bom');
assert.equal(classificarVital('CLS', 0.25), 'precisa melhorar');
assert.equal(classificarVital('CLS', 0.26), 'ruim');` }, { name: 'erros', code: R`assert.throws(() => classificarVital('FID', 10), 'métrica desconhecida: FID');
assert.throws(() => classificarVital('LCP', -1), 'valor inválido');
assert.throws(() => classificarVital('LCP', 'rápido'), 'valor inválido');
assert.throws(() => classificarVital('CLS', NaN), 'valor inválido');` }], solution: R`function classificarVital(metrica, valor) {
  const L = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25] };
  if (!L[metrica]) throw new Error('métrica desconhecida: ' + metrica);
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) throw new Error('valor inválido');
  const [bom, ruim] = L[metrica];
  return valor <= bom ? 'bom' : valor > ruim ? 'ruim' : 'precisa melhorar';
}
`, explanation: 'Os limiares dos Core Web Vitals definem as três faixas; o limite do "bom" é inclusivo e o do "ruim" é exclusivo.' }
],
'pfe-02': [
  { id: 'pfe-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'No laboratório, a página "ruim" teve nota 92-93 e a "bom", 100, mas o LCP foi 2,6-2,7 s contra 1,2 s. O que isso ensina?', options: ['A nota resume bem a diferença', 'A nota ponderada pode esconder diferenças grandes: leia as métricas', 'O Lighthouse está errado', 'LCP não importa'], answer: 1, explanation: 'A nota é uma combinação ponderada; o tempo de LCP diferiu mais de 2x.' },
  { id: 'pfe-02-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a pergunta à ferramenta.', pairs: [['Qual a experiência real das pessoas (28 dias)?', 'CrUX / PageSpeed Insights (campo)'], ['Por que esta página está lenta?', 'DevTools Performance e Lighthouse'], ['Esta mudança piorou o desempenho no pull request?', 'Lighthouse CI com orçamentos'], ['Qual rota e dispositivo sofrem mais, e qual elemento?', 'RUM com web-vitals e atribuição']], explanation: 'Cada ferramenta responde a uma pergunta diferente.' },
  { id: 'pfe-02-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Uma diferença de 4 pontos na nota do Lighthouse entre duas versões, quando a mesma versão varia 10 pontos entre execuções, indica melhoria real.', answer: false, explanation: 'Se a diferença é menor que a variação entre execuções, ela não é um resultado: repita e use a mediana.' },
  { id: 'pfe-02-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o envio de uma métrica de campo.', code: 'import { onLCP } from \'web-vitals\';\nonLCP((m) => navigator.[[0]](\'/api/vitals\', JSON.stringify({ nome: m.[[1]], valor: m.value })));', answers: [['sendBeacon'], ['name']], explanation: 'sendBeacon envia mesmo ao fechar a página; name identifica a métrica.' },
  { id: 'pfe-02-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §percentil(amostras, p)§ e §p75PorSegmento(amostras, minimo)§. §percentil§ usa o método do posto mais próximo: ordene (sem alterar a lista) e devolva o valor na posição §ceil(p/100 * n)§ (1 a n); lista vazia → §Error("sem amostras")§; §p§ fora de 0 a 100 → §Error("percentil inválido")§ (para §p = 0§ devolva o menor valor). §p75PorSegmento§ recebe amostras §{ rota, dispositivo, metrica, valor }§ e devolve um objeto cujas chaves são §"rota|dispositivo|metrica"§ e os valores §{ n, p75 }§, **omitindo** os segmentos com menos de §minimo§ amostras (padrão 5).', lang: 'javascript', starter: 'function percentil(amostras, p) {\n  // seu código aqui\n}\nfunction p75PorSegmento(amostras, minimo = 5) {\n  // seu código aqui\n}\n', hints: ['Posição = Math.ceil(p / 100 * n); use Math.max(1, ...) para p = 0.', 'Agrupe as amostras em um objeto por chave antes de calcular.'], tests: [{ name: 'percentil', code: R`const v = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
assert.equal(percentil(v, 75), 80);
assert.equal(percentil(v, 50), 50);
assert.equal(percentil(v, 100), 100);
assert.equal(percentil(v, 0), 10);
assert.equal(percentil([5, 1, 3], 75), 5);
const original = [3, 1, 2]; percentil(original, 50); assert.deepEqual(original, [3, 1, 2]);` }, { name: 'erros', code: R`assert.throws(() => percentil([], 75), 'sem amostras');
assert.throws(() => percentil([1], 101), 'percentil inválido');
assert.throws(() => percentil([1], -1), 'percentil inválido');` }, { name: 'agregação por segmento', code: R`const am = [];
for (const v of [1000, 1200, 1500, 2000, 4000]) am.push({ rota: '/', dispositivo: 'celular', metrica: 'LCP', valor: v });
for (const v of [900, 950, 1000, 1100, 1200]) am.push({ rota: '/', dispositivo: 'desktop', metrica: 'LCP', valor: v });
am.push({ rota: '/raro', dispositivo: 'celular', metrica: 'LCP', valor: 9000 });
const r = p75PorSegmento(am);
assert.deepEqual(r, { '/|celular|LCP': { n: 5, p75: 2000 }, '/|desktop|LCP': { n: 5, p75: 1100 } });
assert.deepEqual(Object.keys(p75PorSegmento(am, 1)).sort(), ['/raro|celular|LCP', '/|celular|LCP', '/|desktop|LCP']);` }], solution: R`function percentil(amostras, p) {
  if (!amostras.length) throw new Error('sem amostras');
  if (!(p >= 0 && p <= 100)) throw new Error('percentil inválido');
  const ord = [...amostras].sort((a, b) => a - b);
  const pos = Math.max(1, Math.ceil(p / 100 * ord.length));
  return ord[pos - 1];
}
function p75PorSegmento(amostras, minimo = 5) {
  const grupos = {};
  for (const a of amostras) (grupos[a.rota + '|' + a.dispositivo + '|' + a.metrica] = grupos[a.rota + '|' + a.dispositivo + '|' + a.metrica] || []).push(a.valor);
  const saida = {};
  for (const [k, v] of Object.entries(grupos)) if (v.length >= minimo) saida[k] = { n: v.length, p75: percentil(v, 75) };
  return saida;
}
`, explanation: 'O p75 por segmento (rota, dispositivo, métrica) é a agregação básica do RUM; um mínimo de amostras evita percentis instáveis.' }
],
'pfe-03': [
  { id: 'pfe-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a diferença entre §defer§ e §async§ em um script?', options: ['Nenhuma', 'defer executa depois da análise do HTML, em ordem; async executa assim que chega, sem ordem garantida', 'async é mais lento', 'defer bloqueia a análise do HTML'], answer: 1, explanation: 'Use defer para scripts da aplicação (ordem) e async para independentes (analytics).' },
  { id: 'pfe-03-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'O LCP é a imagem principal e está lento, embora a imagem seja leve. Clique na linha que atrasa exatamente o elemento do LCP.', code: '<head>\n  <link rel="stylesheet" href="/app.css">\n</head>\n<body>\n  <img src="/hero.webp" alt="Equipe" width="1200" height="630" loading="lazy">\n</body>', answer: 5, explanation: 'loading="lazy" na imagem do LCP atrasa o seu carregamento. Use loading="eager" (ou nada) e fetchpriority="high".' },
  { id: 'pfe-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a dica de recurso ao uso.', pairs: [['preload', 'Pedir já o recurso crítico (imagem do LCP, fonte) que seria descoberto tarde'], ['preconnect', 'Abrir DNS, TCP e TLS para uma origem que será usada'], ['fetchpriority="high"', 'Aumentar a prioridade da imagem do LCP'], ['loading="lazy"', 'Adiar imagens fora da primeira tela'], ['defer', 'Baixar o script em paralelo e executar depois da análise']], explanation: 'Cada dica atua em uma parte do caminho crítico.' },
  { id: 'pfe-03-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Uma imagem de destaque definida como §background-image§ em um arquivo CSS grande é descoberta tarde, depois de o CSS ser baixado e analisado.', answer: true, explanation: 'O pré-analisador do HTML descobre §<img>§ cedo; imagens de CSS só aparecem depois do CSS.' },
  { id: 'pfe-03-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §caminhoCritico(recursos, alvo)§. §recursos§ é uma lista de §{ id, duracao, depende? }§ (§duracao§ em ms: tempo para baixar e processar o recurso; §depende§: ids que precisam terminar **antes** de ele começar). O recurso termina em §max(término das dependências) + duracao§ (sem dependências, começa em 0). Devolva §{ tempo, caminho }§ com o instante em que §alvo§ termina e a **cadeia** de ids (da primeira dependência até o alvo) que determina esse instante (em empate, escolha a dependência que aparece **primeiro** na lista §depende§). Dependência inexistente → §Error("dependência inexistente: ID")§; alvo inexistente → §Error("alvo inexistente: ID")§; ciclo → §Error("ciclo em: ID")§.', lang: 'javascript', starter: 'function caminhoCritico(recursos, alvo) {\n  // seu código aqui\n}\n', hints: ['Use recursão com memoização (término e predecessor crítico por id).', 'Marque os ids em visita para detectar ciclos.'], tests: [{ name: 'cadeia mais longa', code: R`const r = [{ id: 'html', duracao: 100 }, { id: 'css', duracao: 300, depende: ['html'] }, { id: 'js', duracao: 300, depende: ['html'] }, { id: 'fonte', duracao: 200, depende: ['css'] }, { id: 'imagem', duracao: 400, depende: ['html'] }, { id: 'lcp', duracao: 0, depende: ['fonte', 'imagem', 'js'] }];
assert.deepEqual(caminhoCritico(r, 'lcp'), { tempo: 600, caminho: ['html', 'css', 'fonte', 'lcp'] });
assert.deepEqual(caminhoCritico(r, 'imagem'), { tempo: 500, caminho: ['html', 'imagem'] });` }, { name: 'preload encurta a cadeia', code: R`const sem = [{ id: 'html', duracao: 100 }, { id: 'css', duracao: 300, depende: ['html'] }, { id: 'img', duracao: 500, depende: ['css'] }];
const com = [{ id: 'html', duracao: 100 }, { id: 'css', duracao: 300, depende: ['html'] }, { id: 'img', duracao: 500, depende: ['html'] }];
assert.equal(caminhoCritico(sem, 'img').tempo, 900);
assert.equal(caminhoCritico(com, 'img').tempo, 600);
assert.deepEqual(caminhoCritico([{ id: 'a', duracao: 5 }], 'a'), { tempo: 5, caminho: ['a'] });` }, { name: 'erros', code: R`assert.throws(() => caminhoCritico([{ id: 'a', duracao: 1, depende: ['b'] }], 'a'), 'dependência inexistente: b');
assert.throws(() => caminhoCritico([{ id: 'a', duracao: 1 }], 'x'), 'alvo inexistente: x');
assert.throws(() => caminhoCritico([{ id: 'a', duracao: 1, depende: ['b'] }, { id: 'b', duracao: 1, depende: ['a'] }], 'a'), 'ciclo em:');` }], solution: R`function caminhoCritico(recursos, alvo) {
  const mapa = new Map(recursos.map((r) => [r.id, r]));
  if (!mapa.has(alvo)) throw new Error('alvo inexistente: ' + alvo);
  const termino = new Map(), anterior = new Map(), visita = new Set();
  const calcular = (id) => {
    if (termino.has(id)) return termino.get(id);
    if (visita.has(id)) throw new Error('ciclo em: ' + id);
    visita.add(id);
    const r = mapa.get(id);
    let melhor = 0, pred = null;
    for (const d of r.depende || []) {
      if (!mapa.has(d)) throw new Error('dependência inexistente: ' + d);
      const t = calcular(d);
      if (t > melhor || pred === null) { melhor = t; pred = d; }
    }
    visita.delete(id);
    const t = melhor + r.duracao;
    termino.set(id, t); anterior.set(id, pred);
    return t;
  };
  const tempo = calcular(alvo);
  const caminho = [];
  for (let id = alvo; id; id = anterior.get(id)) caminho.unshift(id);
  return { tempo, caminho };
}
`, explanation: 'O caminho crítico é a cadeia de dependências mais longa até o evento de interesse: só encurtá-la melhora o tempo, como mostra o efeito do preload.' }
],
'pfe-04': [
  { id: 'pfe-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'No laboratório (Vite), dividir um módulo de ~146 kB com §lazy§ reduziu o pacote inicial de 365 kB para 221 kB. E dividir um componente de 0,35 kB?', options: ['Reduziu ainda mais', 'Piorou o total (221,41 kB contra 219,96 kB): componentes minúsculos não compensam a divisão', 'Não mudou nada', 'Quebrou o build'], answer: 1, explanation: 'Divida o que é grande e raro e meça: chunks pequenos acrescentam código de carga e requisições.' },
  { id: 'pfe-04-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'O tree shaking funciona com módulos CommonJS (§require§) tão bem quanto com ES modules (§import§/§export§).', answer: false, explanation: 'O tree shaking depende da análise estática de ES modules; CommonJS é dinâmico e, em geral, impede a remoção.' },
  { id: 'pfe-04-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O pacote inclui uma biblioteca inteira de datas usada em uma única tela. Clique na linha que importa de forma pouco pontual.', code: 'import _ from "lodash";\nexport function ordenar(itens) {\n  return _.sortBy(itens, "nome");\n}', answer: 1, explanation: 'Importar o objeto inteiro traz a biblioteca toda. Importe a função de forma pontual (ESM, lodash-es ou lodash/sortBy) ou use a API nativa.' },
  { id: 'pfe-04-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a divisão por componente e o pré-carregamento na intenção.', code: 'const carregar = () => [[0]](\'./Relatorio.jsx\');\nconst Relatorio = [[1]](carregar);\n<button onMouseEnter={carregar}>Relatório</button>', answers: [['import'], ['lazy']], explanation: 'import() cria o chunk e lazy o liga ao React; chamar a mesma função no hover pré-carrega o módulo.' },
  { id: 'pfe-04-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §analisarPacote(modulos, entrada)§. §modulos§ é um objeto §{ nome: { tamanho, estaticos?, dinamicos? } }§ (§tamanho§ em bytes; §estaticos§ e §dinamicos§: listas de nomes importados por §import§ estático e por §import()§). O **pacote inicial** inclui a §entrada§ e tudo que ela importa **estaticamente**, de forma transitiva. Cada módulo importado **dinamicamente** (a partir de qualquer módulo do inicial ou de outro chunk) forma um **chunk** com ele e seus imports estáticos transitivos **que ainda não estão** no inicial nem em chunks anteriores (processe em ordem alfabética dos nomes dos chunks). Devolva §{ inicial, chunks, total }§: §inicial§ é a soma dos tamanhos do pacote inicial; §chunks§ um objeto §{ nomeDoChunk: tamanho }§ (ordenado por nome); §total§ a soma de tudo (cada módulo contado uma única vez). Módulo inexistente → §Error("módulo inexistente: M")§; ciclos devem ser tolerados.', lang: 'javascript', starter: 'function analisarPacote(modulos, entrada) {\n  // seu código aqui\n}\n', hints: ['Escreva uma função que coleta a fecho transitivo estático de um módulo.', 'Descubra os alvos dinâmicos dos módulos já incluídos, repetindo até não surgirem novos.'], tests: [{ name: 'inicial e chunk dinâmico', code: R`const m = { main: { tamanho: 100, estaticos: ['util'], dinamicos: ['relatorio'] }, util: { tamanho: 20 }, relatorio: { tamanho: 10, estaticos: ['grande', 'util'] }, grande: { tamanho: 146 } };
assert.deepEqual(analisarPacote(m, 'main'), { inicial: 120, chunks: { relatorio: 156 }, total: 276 });` }, { name: 'chunks aninhados, ciclos e sobreposição', code: R`const m = { a: { tamanho: 1, dinamicos: ['b', 'c'] }, b: { tamanho: 2, estaticos: ['comum'] }, c: { tamanho: 4, estaticos: ['comum', 'b'], dinamicos: ['d'] }, comum: { tamanho: 8, estaticos: ['b'] }, d: { tamanho: 16, estaticos: ['a'] } };
assert.deepEqual(analisarPacote(m, 'a'), { inicial: 1, chunks: { b: 10, c: 4, d: 16 }, total: 31 });` }, { name: 'sem divisão e inexistente', code: R`assert.deepEqual(analisarPacote({ x: { tamanho: 5 } }, 'x'), { inicial: 5, chunks: {}, total: 5 });
assert.throws(() => analisarPacote({ x: { tamanho: 5, estaticos: ['y'] } }, 'x'), 'módulo inexistente: y');
assert.throws(() => analisarPacote({ x: { tamanho: 5 } }, 'z'), 'módulo inexistente: z');` }], solution: R`function analisarPacote(modulos, entrada) {
  const get = (n) => { if (!modulos[n]) throw new Error('módulo inexistente: ' + n); return modulos[n]; };
  const fecho = (raiz, jaTem) => {
    const achados = new Set();
    const pilha = [raiz];
    while (pilha.length) {
      const n = pilha.pop();
      if (achados.has(n) || jaTem.has(n)) continue;
      achados.add(n);
      for (const e of get(n).estaticos || []) pilha.push(e);
    }
    return achados;
  };
  const incluidos = new Set();
  const inicial = fecho(entrada, incluidos);
  inicial.forEach((n) => incluidos.add(n));
  const chunks = {};
  const processados = new Set();
  for (;;) {
    const alvos = new Set();
    for (const n of incluidos) for (const d of get(n).dinamicos || []) { get(d); alvos.add(d); }
    const novos = [...alvos].filter((d) => !processados.has(d)).sort();
    if (!novos.length) break;
    const d = novos[0];
    processados.add(d);
    const f = fecho(d, incluidos);
    let tam = 0;
    f.forEach((n) => { tam += get(n).tamanho; incluidos.add(n); });
    chunks[d] = tam;
  }
  const soma = (conj) => [...conj].reduce((s, n) => s + get(n).tamanho, 0);
  return { inicial: soma(inicial), chunks: Object.fromEntries(Object.entries(chunks).sort(([a], [b]) => (a < b ? -1 : 1))), total: soma(incluidos) };
}
`, explanation: 'O pacote inicial contém só os imports estáticos transitivos; cada import() cria um chunk com o que ainda não foi incluído, o que mostra por que dividir só o que é grande e raro compensa.' }
]
};
