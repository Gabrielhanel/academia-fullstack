// C2.6 — Testes de frontend: exercícios das aulas 1 a 4.
// O React e a Testing Library não rodam no laboratório (só JavaScript puro): os desafios "code" modelam a lógica (risco, dublês, tempo, consultas, esperas).
const R = String.raw;

export const exsetsA = {
'tfe-01': [
  { id: 'tfe-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual descreve melhor um bom teste de frontend?', options: ['Cobre todas as linhas do componente', 'Falha quando o comportamento visível quebra e continua passando em refatorações que não mudam o comportamento', 'Verifica o estado interno de cada componente', 'Roda sempre em navegador real'], answer: 1, explanation: 'Testes devem ser sensíveis a defeitos reais e indiferentes a detalhes de implementação.' },
  { id: 'tfe-01-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o nível de teste ao que ele cobre melhor.', pairs: [['Análise estática (tipos e lint)', 'Erros de tipo e padrões inseguros sem executar o código'], ['Unitário', 'Lógica pura (validação, formatação, reducers)'], ['Integração de componentes', 'Fluxos de UI interagindo como a pessoa usuária'], ['E2E', 'Poucos fluxos críticos no sistema integrado']], explanation: 'Cada nível dá um tipo de confiança a um custo diferente; o troféu valoriza análise estática e integração de componentes.' },
  { id: 'tfe-01-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Este teste quebra sempre que o componente é refatorado, mesmo sem mudança de comportamento. Clique na linha que o acopla à implementação.', code: 'test("incrementa", () => {\n  const { container } = render(<Contador />);\n  container.querySelector(".btn-primary").click();\n  expect(container.children[0].children[0].textContent).toBe("Contagem: 1");\n});', answer: 3, explanation: 'A consulta por classe CSS acopla o teste a um detalhe visual; use getByRole("button", { name: "Incrementar" }). (A linha 4 também acopla à posição no DOM; use getByText.)' },
  { id: 'tfe-01-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Cobertura de 100% das linhas garante que o comportamento do componente está verificado.', answer: false, explanation: 'A cobertura mede execução, não verificação: um teste sem asserções também a aumenta.' },
  { id: 'tfe-01-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Explique a diferença entre testar comportamento e testar implementação, com um exemplo de cada para um contador, e por que a primeira é preferível.', model: 'Testar comportamento é verificar o que a pessoa vê e faz: clicar em "Incrementar" e ver "Contagem: 1". Testar implementação é verificar detalhes internos: que o estado n vale 1, que setN foi chamada ou que um elemento tem a classe btn-primary. Os testes de implementação quebram em refatorações que preservam o comportamento (trocar useState por useReducer, renomear funções, reorganizar o HTML) e podem passar mesmo com a interface errada (o estado muda, mas a tela não atualiza). Os de comportamento só quebram quando a promessa ao usuário quebra, dão confiança para refatorar e custam menos manutenção.', rubric: ['Define comportamento como o que a pessoa vê e faz', 'Dá um exemplo de implementação (estado, chamada interna ou classe CSS)', 'Explica a fragilidade diante de refatorações', 'Conclui que o comportamento dá confiança com menos manutenção'], explanation: 'A Testing Library foi desenhada em torno desse princípio.' },
  { id: 'tfe-01-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §priorizarRiscos(itens)§. Cada item é §{ nome, probabilidade, impacto, custo }§ (§probabilidade§ de 0 a 1, §impacto§ e §custo§ de 1 a 5). A pontuação é §probabilidade * impacto / custo§. Devolva a lista de **nomes** ordenada pela pontuação **decrescente**; empates em ordem alfabética do nome. Valores fora das faixas (ou não numéricos) devem lançar §Error("valor inválido em NOME")§. Não altere a lista original.', lang: 'javascript', starter: 'function priorizarRiscos(itens) {\n  // seu código aqui\n}\n', hints: ['Valide cada item antes de calcular.', 'Use uma cópia com a pontuação e sort com desempate pelo nome.'], tests: [{ name: 'ordena pela pontuação', code: R`const itens = [{ nome: 'rotulo', probabilidade: 0.1, impacto: 1, custo: 1 }, { nome: 'pagamento', probabilidade: 0.3, impacto: 5, custo: 3 }, { nome: 'login', probabilidade: 0.2, impacto: 5, custo: 2 }];
assert.deepEqual(priorizarRiscos(itens), ['login', 'pagamento', 'rotulo']);
assert.equal(itens[0].nome, 'rotulo');` }, { name: 'empates e lista vazia', code: R`const itens = [{ nome: 'b', probabilidade: 0.5, impacto: 2, custo: 2 }, { nome: 'a', probabilidade: 0.25, impacto: 4, custo: 2 }];
assert.deepEqual(priorizarRiscos(itens), ['a', 'b']);
assert.deepEqual(priorizarRiscos([]), []);` }, { name: 'valores inválidos', code: R`assert.throws(() => priorizarRiscos([{ nome: 'x', probabilidade: 2, impacto: 1, custo: 1 }]), 'valor inválido em x');
assert.throws(() => priorizarRiscos([{ nome: 'y', probabilidade: 0.5, impacto: 6, custo: 1 }]), 'valor inválido em y');
assert.throws(() => priorizarRiscos([{ nome: 'z', probabilidade: 0.5, impacto: 3, custo: 0 }]), 'valor inválido em z');
assert.throws(() => priorizarRiscos([{ nome: 'w', probabilidade: 'alta', impacto: 3, custo: 1 }]), 'valor inválido em w');` }], solution: R`function priorizarRiscos(itens) {
  const ok = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
  const pontuados = itens.map((i) => {
    if (!ok(i.probabilidade, 0, 1) || !ok(i.impacto, 1, 5) || !ok(i.custo, 1, 5)) throw new Error('valor inválido em ' + i.nome);
    return { nome: i.nome, pontos: i.probabilidade * i.impacto / i.custo };
  });
  return pontuados.sort((a, b) => b.pontos - a.pontos || (a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0)).map((p) => p.nome);
}
`, explanation: 'Priorizar por risco (probabilidade e impacto) dividido pelo custo coloca os testes de maior retorno primeiro, como pagamento e login.' }
],
'tfe-02': [
  { id: 'tfe-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Onde um dublê (§vi.fn()§) é mais adequado em um teste de componente?', options: ['Nos detalhes internos do próprio componente', 'Nas fronteiras: rede, relógio e callbacks recebidos por props', 'Em todas as funções, para isolar tudo', 'Nunca'], answer: 1, explanation: 'Dublês substituem fronteiras; mockar o interior do que se testa acopla o teste à implementação.' },
  { id: 'tfe-02-e2', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a configuração do ambiente e dos temporizadores.', code: 'export default defineConfig({ test: { environment: \'[[0]]\', setupFiles: [\'./src/setup.js\'] } });\nvi.[[1]]();            // troca setTimeout, setInterval e Date\nvi.advanceTimersByTime(3000);', answers: [['jsdom'], ['useFakeTimers']], explanation: 'O ambiente jsdom simula o DOM e useFakeTimers permite avançar o tempo instantaneamente.' },
  { id: 'tfe-02-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do laboratório (Vitest 5.1.1).', code: 'onEnviar = vi.fn().mockResolvedValue()\ne-mail inválido, clique em Enviar: onEnviar.mock.calls.length = ?\ne-mail válido, clique em Enviar:   onEnviar.mock.calls.length = ?\nrelógio com setInterval(1000), advanceTimersByTime(3000): exibe ?s', lang: 'text', steps: [{ q: 'Chamadas com e-mail inválido:', answers: ['0'] }, { q: 'Chamadas com e-mail válido:', answers: ['1'] }, { q: 'Segundos exibidos no relógio:', answers: ['3'] }], explanation: 'O callback só é chamado quando a validação passa, e o relógio falso avançou 3 s sem esperar.' },
  { id: 'tfe-02-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'O jsdom calcula o layout, então §getBoundingClientRect()§ devolve as dimensões reais dos elementos.', answer: false, explanation: 'O jsdom não faz layout: as dimensões são zero. Verificações de aparência pedem navegador real (testes visuais).' },
  { id: 'tfe-02-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarEspiao(implementacao)§ (modelo de §vi.fn§). Devolve uma função §espiao§ que, ao ser chamada com argumentos: (1) registra os argumentos (array) em §espiao.calls§; (2) executa a implementação atual (§implementacao§, se existir; ou a definida por §mockImplementation§; ou devolve o valor de §mockReturnValue§ se definido, que tem **prioridade** sobre as demais); (3) registra em §espiao.results§ um objeto §{ tipo: "retorno", valor }§ ou, se a implementação lançar, §{ tipo: "erro", valor: erro }§ e **relança** o erro. Métodos: §mockReturnValue(v)§ e §mockImplementation(f)§ (ambos devolvem o próprio espião, para encadear) e §reset()§ (zera §calls§ e §results§ e remove retorno e implementação programados, voltando à implementação original). O espião também preserva o §this§ da chamada na implementação. Além disso, implemente §espiar(objeto, nome)§, que substitui §objeto[nome]§ por um espião da função original e devolve o espião com o método §restaurar()§ que reinstala a função original.', lang: 'javascript', starter: 'function criarEspiao(implementacao) {\n  // seu código aqui\n}\nfunction espiar(objeto, nome) {\n  // seu código aqui\n}\n', hints: ['A função espião deve ser uma function (não arrow) para ler this.', 'Use uma variável para o retorno programado e outra para a implementação atual; compare com undefined por uma flag.'], tests: [{ name: 'registro de chamadas e resultados', code: R`const soma = criarEspiao((a, b) => a + b);
assert.equal(soma(1, 2), 3);
assert.equal(soma(5, 5), 10);
assert.deepEqual(soma.calls, [[1, 2], [5, 5]]);
assert.deepEqual(soma.results, [{ tipo: 'retorno', valor: 3 }, { tipo: 'retorno', valor: 10 }]);
assert.equal(criarEspiao()(1), undefined);` }, { name: 'retorno e implementação programados, reset', code: R`const f = criarEspiao(() => 'original');
assert.equal(f.mockReturnValue('fixo'), f);
assert.equal(f(), 'fixo');
f.mockImplementation(() => 'outra');
assert.equal(f(), 'fixo', 'mockReturnValue tem prioridade');
f.reset();
assert.deepEqual(f.calls, []);
assert.equal(f(), 'original');
f.mockImplementation((x) => x * 2);
assert.equal(f(4), 8);` }, { name: 'erros e this', code: R`const g = criarEspiao(() => { throw new Error('falhou'); });
assert.throws(() => g(), 'falhou');
assert.equal(g.results[0].tipo, 'erro');
assert.equal(g.results[0].valor.message, 'falhou');
const obj = { nome: 'x', ler: criarEspiao(function () { return this.nome; }) };
assert.equal(obj.ler(), 'x');` }, { name: 'espiar e restaurar', code: R`const o = { dobro(n) { return n * 2; } };
const original = o.dobro;
const e = espiar(o, 'dobro');
assert.equal(o.dobro(4), 8);
assert.deepEqual(e.calls, [[4]]);
e.restaurar();
assert.ok(o.dobro === original);` }], solution: R`function criarEspiao(implementacao) {
  let impl = implementacao, temRetorno = false, retorno;
  const espiao = function (...args) {
    espiao.calls.push(args);
    try {
      const valor = temRetorno ? retorno : impl ? impl.apply(this, args) : undefined;
      espiao.results.push({ tipo: 'retorno', valor });
      return valor;
    } catch (e) {
      espiao.results.push({ tipo: 'erro', valor: e });
      throw e;
    }
  };
  espiao.calls = []; espiao.results = [];
  espiao.mockReturnValue = (v) => { temRetorno = true; retorno = v; return espiao; };
  espiao.mockImplementation = (f) => { impl = f; return espiao; };
  espiao.reset = () => { espiao.calls = []; espiao.results = []; temRetorno = false; retorno = undefined; impl = implementacao; };
  return espiao;
}
function espiar(objeto, nome) {
  const original = objeto[nome];
  const e = criarEspiao(function (...args) { return original.apply(this, args); });
  objeto[nome] = e;
  e.restaurar = () => { objeto[nome] = original; };
  return e;
}
`, explanation: 'Um espião é uma função que registra chamadas e resultados e delega a uma implementação trocável; o reset e a restauração evitam vazamento entre testes.' },
  { id: 'tfe-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarRelogioFalso()§ (modelo dos temporizadores falsos). Devolve um objeto com §agora()§ (começa em §0§), §setTimeout(fn, ms)§, §setInterval(fn, ms)§, §clearTimeout(id)§, §clearInterval(id)§, §avancar(ms)§ e §pendentes()§. §setTimeout§/§setInterval§ devolvem um id numérico crescente a partir de §1§. §avancar(ms)§ executa, **em ordem de instante** (empates na ordem de criação), todos os temporizadores vencidos até §agora() + ms§, e deixa §agora()§ no valor final; durante a execução de cada callback, §agora()§ vale o instante do temporizador. Intervalos se repetem; temporizadores criados por callbacks dentro da janela também executam se vencerem nela. §pendentes()§ devolve o número de temporizadores ativos (timeouts não executados e intervalos ativos). Um §setInterval§ com §ms <= 0§ deve lançar §Error("intervalo inválido")§.', lang: 'javascript', starter: 'function criarRelogioFalso() {\n  // seu código aqui\n}\n', hints: ['Mantenha uma lista de temporizadores com instante, id e intervalo.', 'Em avancar, escolha repetidamente o próximo temporizador cujo instante <= alvo.'], tests: [{ name: 'timeout e ordem', code: R`const r = criarRelogioFalso(); const log = [];
r.setTimeout(() => log.push('b@' + r.agora()), 200);
r.setTimeout(() => log.push('a@' + r.agora()), 100);
r.setTimeout(() => log.push('c@' + r.agora()), 100);
assert.equal(r.pendentes(), 3);
r.avancar(99); assert.deepEqual(log, []);
r.avancar(1); assert.deepEqual(log, ['a@100', 'c@100']);
r.avancar(500); assert.deepEqual(log, ['a@100', 'c@100', 'b@200']);
assert.equal(r.agora(), 600); assert.equal(r.pendentes(), 0);` }, { name: 'intervalo e cancelamento', code: R`const r = criarRelogioFalso(); let n = 0;
const id = r.setInterval(() => { n++; }, 1000);
r.avancar(3000); assert.equal(n, 3);
assert.equal(r.pendentes(), 1);
r.clearInterval(id); r.avancar(5000); assert.equal(n, 3);
assert.equal(r.pendentes(), 0);
const t = r.setTimeout(() => { n = 99; }, 10); r.clearTimeout(t); r.avancar(100); assert.equal(n, 3);` }, { name: 'timers encadeados e inválidos', code: R`const r = criarRelogioFalso(); const log = [];
r.setTimeout(() => { log.push('1@' + r.agora()); r.setTimeout(() => log.push('2@' + r.agora()), 50); }, 100);
r.avancar(200); assert.deepEqual(log, ['1@100', '2@150']);
assert.throws(() => r.setInterval(() => {}, 0), 'intervalo inválido');
const a = r.setTimeout(() => {}, 1), b = r.setTimeout(() => {}, 1); assert.ok(b === a + 1);` }], solution: R`function criarRelogioFalso() {
  let tempo = 0, proximoId = 1, ordem = 0;
  let timers = [];
  const agendar = (fn, ms, repetir) => {
    const id = proximoId++;
    timers.push({ id, fn, em: tempo + ms, ms, repetir, ordem: ordem++ });
    return id;
  };
  const cancelar = (id) => { timers = timers.filter((t) => t.id !== id); };
  return {
    agora: () => tempo,
    setTimeout: (fn, ms) => agendar(fn, ms, false),
    setInterval: (fn, ms) => { if (!(ms > 0)) throw new Error('intervalo inválido'); return agendar(fn, ms, true); },
    clearTimeout: cancelar,
    clearInterval: cancelar,
    pendentes: () => timers.length,
    avancar(ms) {
      const alvo = tempo + ms;
      for (;;) {
        const candidatos = timers.filter((t) => t.em <= alvo).sort((a, b) => a.em - b.em || a.ordem - b.ordem);
        if (!candidatos.length) break;
        const t = candidatos[0];
        tempo = t.em;
        if (t.repetir) { t.em += t.ms; t.ordem = ordem++; } else cancelar(t.id);
        t.fn();
      }
      tempo = alvo;
    }
  };
}
`, explanation: 'Os temporizadores falsos substituem o relógio real por uma fila ordenada por instante, o que torna testes de tempo rápidos e determinísticos.' }
],
'tfe-03': [
  { id: 'tfe-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual consulta usar para afirmar que um elemento NÃO está na tela?', options: ['getBy...', 'queryBy... com not.toBeInTheDocument()', 'findBy...', 'getAllBy...'], answer: 1, explanation: 'queryBy devolve null sem lançar; getBy lançaria erro ao não encontrar (medido).' },
  { id: 'tfe-03-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o elemento HTML ao papel implícito.', pairs: [['<button>', 'button'], ['<a href>', 'link'], ['<h2>', 'heading'], ['<ul>', 'list'], ['<nav>', 'navigation']], explanation: 'getByRole usa os papéis ARIA, implícitos nos elementos semânticos.' },
  { id: 'tfe-03-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O teste passa, mas a tela deixou de ser acessível ao teclado depois de trocar botões por §<div onClick>§. Clique na linha cuja consulta não detecta o problema.', code: 'test("salva", async () => {\n  render(<Formulario />);\n  await user.click(screen.getByTestId("botao-salvar"));\n  expect(screen.getByText("Salvo")).toBeInTheDocument();\n});', answer: 3, explanation: 'getByTestId encontra o div qualquer que seja o papel. Com getByRole("button", { name: "Salvar" }) o teste falharia no ponto certo, denunciando o problema de acessibilidade.' },
  { id: 'tfe-03-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'O jest-axe garante que a interface é totalmente acessível.', answer: false, explanation: 'O axe verifica regras automáticas (medido: acusou a falta de rótulo); não garante foco coerente, leitor de tela nem contraste real.' },
  { id: 'tfe-03-e5', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete as consultas pela ordem de preferência.', code: 'screen.[[0]](\'button\', { name: \'Enviar\' });   // botão\nscreen.[[1]](\'E-mail\');                       // campo com rótulo', answers: [['getByRole'], ['getByLabelText']], explanation: 'getByRole valida papel e nome acessível; getByLabelText encontra campos pelo rótulo associado.' },
  { id: 'tfe-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §buscarPorPapel(arvore, papel, opcoes)§ (modelo do §getByRole§). Um nó é §{ tag, texto?, ariaLabel?, tipo?, href?, oculto?, filhos? }§. Papéis implícitos: §button§→§"button"§; §a§ com §href§→§"link"§; §h1§ a §h6§→§"heading"§; §input§ com §tipo: "checkbox"§→§"checkbox"§, demais §input§→§"textbox"§; §ul§→§"list"§; §li§→§"listitem"§; §nav§→§"navigation"§. O **nome acessível** é §ariaLabel§ se existir; senão o texto do nó e dos descendentes concatenados, separados por um espaço e com espaços normalizados (trim). Nós com §oculto: true§ e seus descendentes são ignorados. §opcoes.name§ (string: igualdade exata; ou §RegExp§: teste) filtra pelo nome. Devolve o **único** nó que casa. Se nenhum: §Error("Nenhum elemento com papel P")§ (com §" e nome N"§ se houver filtro, usando §String(name)§); se mais de um: §Error("Múltiplos elementos com papel P (N)")§.', lang: 'javascript', starter: 'function buscarPorPapel(arvore, papel, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Percorra a árvore em profundidade pulando os nós ocultos.', 'Calcule o papel de cada nó e o nome acessível; filtre e conte os resultados.'], tests: [{ name: 'encontra pelo papel e nome', code: R`const dom = { tag: 'main', filhos: [{ tag: 'h1', texto: 'Cadastro' }, { tag: 'button', texto: 'Enviar' }, { tag: 'button', texto: 'Cancelar' }, { tag: 'a', href: '/x', texto: 'Sair' }, { tag: 'input', tipo: 'checkbox', ariaLabel: 'Aceito' }] };
assert.equal(buscarPorPapel(dom, 'button', { name: 'Enviar' }).texto, 'Enviar');
assert.equal(buscarPorPapel(dom, 'heading').texto, 'Cadastro');
assert.equal(buscarPorPapel(dom, 'link').href, '/x');
assert.equal(buscarPorPapel(dom, 'checkbox', { name: 'Aceito' }).tipo, 'checkbox');
assert.equal(buscarPorPapel(dom, 'button', { name: /cancel/i }).texto, 'Cancelar');` }, { name: 'nome por descendentes e ariaLabel', code: R`const dom = { tag: 'div', filhos: [{ tag: 'button', filhos: [{ tag: 'span', texto: 'Salvar' }, { tag: 'span', texto: 'rascunho' }] }, { tag: 'button', texto: 'X', ariaLabel: 'Fechar' }] };
assert.ok(buscarPorPapel(dom, 'button', { name: 'Salvar rascunho' }));
assert.ok(buscarPorPapel(dom, 'button', { name: 'Fechar' }));
assert.throws(() => buscarPorPapel(dom, 'button', { name: 'X' }), 'Nenhum elemento com papel button e nome X');` }, { name: 'ausente, múltiplos, oculto e a sem href', code: R`const dom = { tag: 'div', filhos: [{ tag: 'li', texto: 'a' }, { tag: 'li', texto: 'b' }, { tag: 'a', texto: 'sem href' }, { tag: 'div', oculto: true, filhos: [{ tag: 'button', texto: 'Escondido' }] }] };
assert.throws(() => buscarPorPapel(dom, 'listitem'), 'Múltiplos elementos com papel listitem (2)');
assert.throws(() => buscarPorPapel(dom, 'link'), 'Nenhum elemento com papel link');
assert.throws(() => buscarPorPapel(dom, 'button'), 'Nenhum elemento com papel button');` }], solution: R`function buscarPorPapel(arvore, papel, opcoes = {}) {
  const papelDe = (n) => {
    if (n.tag === 'button') return 'button';
    if (n.tag === 'a' && n.href) return 'link';
    if (/^h[1-6]$/.test(n.tag)) return 'heading';
    if (n.tag === 'input') return n.tipo === 'checkbox' ? 'checkbox' : 'textbox';
    if (n.tag === 'ul') return 'list';
    if (n.tag === 'li') return 'listitem';
    if (n.tag === 'nav') return 'navigation';
    return null;
  };
  const textoDe = (n) => [n.texto, ...(n.filhos || []).map(textoDe)].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const nomeDe = (n) => n.ariaLabel !== undefined ? n.ariaLabel : textoDe(n);
  const achados = [];
  (function visitar(n) {
    if (n.oculto) return;
    if (papelDe(n) === papel) {
      const f = opcoes.name;
      const nome = nomeDe(n);
      if (f === undefined || (f instanceof RegExp ? f.test(nome) : nome === f)) achados.push(n);
    }
    (n.filhos || []).forEach(visitar);
  })(arvore);
  if (achados.length === 0) throw new Error('Nenhum elemento com papel ' + papel + (opcoes.name !== undefined ? ' e nome ' + String(opcoes.name) : ''));
  if (achados.length > 1) throw new Error('Múltiplos elementos com papel ' + papel + ' (' + achados.length + ')');
  return achados[0];
}
`, explanation: 'O getByRole considera o papel implícito e o nome acessível, ignora o que está fora da árvore de acessibilidade e falha com mensagens claras quando não há exatamente um resultado.' }
],
'tfe-04': [
  { id: 'tfe-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a melhor forma de esperar o texto "Salvo com sucesso" depois de clicar em Salvar?', options: ['await new Promise((r) => setTimeout(r, 1000))', 'await screen.findByText("Salvo com sucesso")', 'Repetir o clique até aparecer', 'getByText imediatamente'], answer: 1, explanation: 'findBy espera a condição (padrão 1000 ms) sem pausa fixa; é mais rápido e estável.' },
  { id: 'tfe-04-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'O teste às vezes passa e às vezes falha. Clique na linha da causa.', code: 'test("envia", () => {\n  const user = userEvent.setup();\n  render(<Cadastro onEnviar={onEnviar} />);\n  user.click(screen.getByRole("button", { name: "Enviar" }));\n  expect(onEnviar).toHaveBeenCalled();\n});', answer: 4, explanation: 'user.click é assíncrono e falta o await (e o teste deveria ser async): a asserção pode rodar antes do efeito.' },
  { id: 'tfe-04-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do laboratório (user-event 14.6.13).', code: 'Tab x3 em <Cadastro>: foco em ? > ? > ?\nEnter no botão Enviar com e-mail vazio: alerta visível = ?\ncomponente que aparece após 100 ms: queryByText devolve ?', lang: 'text', steps: [{ q: 'Primeiro campo a receber o foco:', answers: ['nome'] }, { q: 'Último elemento focado:', answers: ['botão', 'botao', 'enviar', 'button'] }, { q: 'queryByText logo após o render devolve:', answers: ['null'] }], explanation: 'O foco percorreu nome, e-mail e o botão; queryBy devolve null enquanto o elemento não existe.' },
  { id: 'tfe-04-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'É correto colocar um §user.click§ dentro do callback do §waitFor§ para repetir o clique até funcionar.', answer: false, explanation: 'O waitFor repete o callback várias vezes; efeitos colaterais dentro dele (cliques) se repetem. Coloque só asserções.' },
  { id: 'tfe-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Um teste do formulário de cadastro falha de vez em quando na CI, com o aviso "not wrapped in act". Descreva a causa provável e a correção, sem usar esperas fixas.', model: 'O aviso indica que uma atualização de estado aconteceu depois que o teste terminou de esperar, normalmente porque o formulário envia de forma assíncrona (chama o callback e atualiza a tela depois) e o teste verifica antes de a atualização terminar, ou porque falta um await em uma interação. A correção é esperar o resultado visível: usar await em todas as ações do user-event, e depois await screen.findByText(...) ou waitFor(() => expect(...)) com a asserção do resultado (mensagem de sucesso ou chamada do callback). Não se silencia o aviso nem se coloca setTimeout: a espera pela condição torna o teste determinístico e mais rápido, e a CI lenta deixa de causar falhas.', rubric: ['Identifica a atualização assíncrona após o fim do teste ou o await ausente', 'Propõe await nas interações', 'Propõe findBy ou waitFor para o resultado visível', 'Rejeita pausas fixas e silenciar o aviso'], explanation: 'Esperar a condição certa é a correção; pausas e silenciamento só escondem a instabilidade.' },
  { id: 'tfe-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §esperarPor(condicao, opcoes)§ (modelo do §waitFor§), **assíncrona**. §condicao§ é uma função síncrona: considera-se **satisfeita** quando **não lança** e **não devolve §false§**; devolve então o valor retornado (§undefined§ conta como satisfeita). §opcoes§: §timeout§ (padrão 1000 ms) e §intervalo§ (padrão 50 ms). A condição é avaliada **imediatamente**; se falhar, tenta de novo a cada §intervalo§ até esgotar o §timeout§ (medido por §Date.now()§). Ao esgotar, rejeita com §Error("tempo esgotado: MENSAGEM")§ em que MENSAGEM é a mensagem do último erro lançado, ou §"condição falsa"§ se a última tentativa devolveu §false§. §condicao§ que não é função → §Error("condição inválida")§.', lang: 'javascript', starter: 'async function esperarPor(condicao, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Use um laço com await new Promise((r) => setTimeout(r, intervalo)).', 'Guarde a última falha para montar a mensagem final.'], tests: [{ name: 'satisfeita de imediato e depois de um tempo', code: R`assert.equal(await esperarPor(() => 42), 42);
assert.equal(await esperarPor(() => {}), undefined);
let pronto = false; setTimeout(() => { pronto = true; }, 60);
const v = await esperarPor(() => { if (!pronto) throw new Error('ainda não'); return 'ok'; }, { timeout: 500, intervalo: 10 });
assert.equal(v, 'ok');` }, { name: 'tempo esgotado com a última mensagem', code: R`const t0 = Date.now();
await assert.rejects(esperarPor(() => { throw new Error('não achou X'); }, { timeout: 100, intervalo: 20 }), 'tempo esgotado: não achou X');
const dt = Date.now() - t0;
assert.ok(dt >= 90 && dt < 400, 'esperou ~100 ms, esperou ' + dt);
await assert.rejects(esperarPor(() => false, { timeout: 50, intervalo: 10 }), 'tempo esgotado: condição falsa');` }, { name: 'validação e número de tentativas', code: R`await assert.rejects(esperarPor('x'), 'condição inválida');
let n = 0;
await assert.rejects(esperarPor(() => { n++; throw new Error('x'); }, { timeout: 100, intervalo: 25 }), 'tempo esgotado');
assert.ok(n >= 3 && n <= 6, 'tentativas: ' + n);` }], solution: R`async function esperarPor(condicao, opcoes = {}) {
  if (typeof condicao !== 'function') throw new Error('condição inválida');
  const { timeout = 1000, intervalo = 50 } = opcoes;
  const inicio = Date.now();
  let ultima = 'condição falsa';
  for (;;) {
    try {
      const v = condicao();
      if (v !== false) return v;
      ultima = 'condição falsa';
    } catch (e) {
      ultima = e && e.message ? e.message : String(e);
    }
    if (Date.now() - inicio >= timeout) throw new Error('tempo esgotado: ' + ultima);
    await new Promise((r) => setTimeout(r, intervalo));
  }
}
`, explanation: 'O waitFor repete a verificação em intervalos até passar ou esgotar o tempo e reporta o último erro, o que torna a espera determinística e informativa.' }
]
};
