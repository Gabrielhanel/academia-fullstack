// C1.5 — APIs do navegador e Web Platform: exercícios, prova final e projeto integrador.
// As APIs do navegador não rodam no laboratório (Worker sem DOM): os itens usam mc, tf, fill, match, trace, bug e open;
// os desafios "code" modelam a lógica pura (propagação, cookies, migrações, RPC, estratégias, manifesto, SSE).
const R = String.raw;

export const exsets = {
'web-01': [
  { id: 'web-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em uma lista §<ul>§ com um ouvinte de clique registrado **sem** o terceiro argumento, o usuário clica em um §<button>§ dentro de um §<li>§. Em que fase o ouvinte do §<ul>§ executa?', options: ['Captura', 'Alvo', 'Bolha', 'Antes de qualquer evento'], answer: 2, explanation: 'Sem §true§ ou §{ capture: true }§ o ouvinte é registrado na fase de **bolha**: o evento sobe do alvo até a raiz e executa os ouvintes dos ancestrais.' },
  { id: 'web-01-e2', type: 'tf', difficulty: 2, points: 5, prompt: '§event.preventDefault()§ impede que o evento continue propagando para os elementos ancestrais.', answer: false, explanation: 'Ele cancela apenas a **ação padrão** (como seguir um link). A propagação é interrompida por §stopPropagation()§.' },
  { id: 'web-01-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Os botões "excluir" criados depois da carga da página não respondem ao clique. Clique na linha que causa o problema.', code: 'const lista = document.getElementById("lista");\n\nlista.querySelectorAll(".del").forEach((b) => {\n  b.addEventListener("click", () => excluir(b.dataset.id));\n});\n\nfunction adicionar(id) {\n  lista.insertAdjacentHTML("beforeend", `<li><button class="del" data-id="${id}">x</button></li>`);\n}', answer: 3, explanation: 'O §querySelectorAll§ registra ouvintes só nos botões que **já existem**. Use delegação: um ouvinte em §lista§ com §e.target.closest(".del")§ atende os botões atuais e os futuros.' },
  { id: 'web-01-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a delegação para tratar cliques em qualquer botão com a classe §del§ dentro da lista.', code: 'lista.addEventListener("click", (e) => {\n  const b = e.target.[[0]](".del");\n  if (b && lista.contains(b)) excluir(b.[[1]].id);\n});', answers: [['closest'], ['dataset']], explanation: '§closest§ sobe da origem do evento até um elemento que case com o seletor; §dataset§ dá acesso aos atributos §data-*§.' },
  { id: 'web-01-e5', type: 'trace', difficulty: 2, points: 10, prompt: 'Execute mentalmente a ordem das saídas.', code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nqueueMicrotask(() => console.log("D"));\nconsole.log("E");', lang: 'javascript', steps: [{ q: 'Qual é a primeira letra impressa depois de A?', answers: ['E'] }, { q: 'Qual é a última letra impressa?', answers: ['B'] }, { q: 'Qual microtarefa aparece primeiro, C ou D?', answers: ['C'] }], explanation: 'Ordem: A, E (código síncrono), depois as microtarefas na ordem de enfileiramento (C, D) e, por fim, a tarefa do §setTimeout§ (B).' },
  { id: 'web-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ordemDeExecucao(alvo, ouvintes)§, que devolve os **nomes** dos ouvintes na ordem em que o navegador os executaria para um evento disparado em §alvo§. Os nós são objetos §{ id, pai }§ (§pai§ é §null§ na raiz). Cada ouvinte é §{ no, captura, nome }§ (§no§ é o id do nó), na ordem de registro. Regras: (1) **captura**: dos ancestrais, da raiz até o pai do alvo, só ouvintes com §captura: true§; (2) **alvo**: primeiro os de captura e depois os de bolha, cada grupo na ordem de registro; (3) **bolha**: dos ancestrais, do pai do alvo até a raiz, só ouvintes com §captura: false§. Ouvintes de nós fora do caminho são ignorados.', lang: 'javascript', starter: 'function ordemDeExecucao(alvo, ouvintes) {\n  // seu código aqui\n}\n', hints: ['Monte o caminho subindo por pai: [alvo, pai, avô, ...].', 'Os ancestrais são o caminho sem o primeiro item; percorra-o do fim para o início na captura.'], tests: [{ name: 'captura, alvo e bolha', code: R`const html = { id: 'html', pai: null }, body = { id: 'body', pai: html }, ul = { id: 'ul', pai: body }, li = { id: 'li', pai: ul };
const o = [
  { no: 'body', captura: false, nome: 'body-bolha' }, { no: 'ul', captura: true, nome: 'ul-captura' }, { no: 'ul', captura: false, nome: 'ul-bolha' },
  { no: 'li', captura: false, nome: 'li-bolha' }, { no: 'li', captura: true, nome: 'li-captura' }, { no: 'html', captura: true, nome: 'html-captura' }
];
assert.deepEqual(ordemDeExecucao(li, o), ['html-captura', 'ul-captura', 'li-captura', 'li-bolha', 'ul-bolha', 'body-bolha']);` }, { name: 'ignora nós fora do caminho e preserva a ordem de registro', code: R`const raiz = { id: 'r', pai: null }, a = { id: 'a', pai: raiz }, b = { id: 'b', pai: raiz };
const o = [{ no: 'b', captura: false, nome: 'irmão' }, { no: 'a', captura: false, nome: 'a1' }, { no: 'a', captura: false, nome: 'a2' }, { no: 'r', captura: false, nome: 'raiz' }];
assert.deepEqual(ordemDeExecucao(a, o), ['a1', 'a2', 'raiz']);` }, { name: 'alvo sem pai e sem ouvintes', code: R`const solo = { id: 's', pai: null };
assert.deepEqual(ordemDeExecucao(solo, []), []);
assert.deepEqual(ordemDeExecucao(solo, [{ no: 's', captura: false, nome: 'x' }, { no: 's', captura: true, nome: 'y' }]), ['y', 'x']);` }], solution: R`function ordemDeExecucao(alvo, ouvintes) {
  const caminho = [];
  for (let n = alvo; n; n = n.pai) caminho.push(n.id);
  const ancestrais = caminho.slice(1);                 // do pai até a raiz
  const em = (id, captura) => ouvintes.filter((l) => l.no === id && l.captura === captura).map((l) => l.nome);
  const out = [];
  for (let i = ancestrais.length - 1; i >= 0; i--) out.push(...em(ancestrais[i], true));   // captura: raiz -> pai
  out.push(...em(caminho[0], true), ...em(caminho[0], false));                             // alvo
  for (const id of ancestrais) out.push(...em(id, false));                                 // bolha: pai -> raiz
  return out;
}
`, explanation: 'O caminho do evento é a cadeia de pais. A captura desce da raiz, o alvo executa primeiro os ouvintes de captura e depois os de bolha, e a bolha sobe. É a mesma lógica que explica por que um ouvinte de captura no ancestral executa antes de qualquer outro.' }
],
'web-02': [
  { id: 'web-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual armazenamento é compartilhado entre todas as abas da mesma origem e persiste após fechar o navegador?', options: ['sessionStorage', 'localStorage', 'Uma variável JavaScript global', 'Cookie sem Max-Age (de sessão)'], answer: 1, explanation: '§localStorage§ persiste e é compartilhado entre as abas da origem. §sessionStorage§ vale por aba e cookies de sessão somem ao encerrar o navegador.' },
  { id: 'web-02-e2', type: 'tf', difficulty: 2, points: 5, prompt: '§localStorage.setItem("config", { tema: "escuro" })§ guarda o objeto com a estrutura preservada.', answer: false, explanation: 'O Web Storage guarda **strings**: o objeto é convertido em §"[object Object]"§. Use §JSON.stringify§ ao gravar e §JSON.parse§ ao ler.' },
  { id: 'web-02-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'A página trava com um erro quando o usuário nunca salvou preferências. Clique na linha que causa o erro.', code: 'function lerPrefs() {\n  const bruto = localStorage.getItem("prefs");\n  const prefs = JSON.parse(bruto);\n  return prefs.tema ?? "claro";\n}', answer: 4, explanation: 'Sem a chave, §getItem§ devolve §null§; §JSON.parse(null)§ devolve §null§, e então §prefs.tema§ lança TypeError. Verifique §null§ (e use §try/catch§ para JSON inválido), com valor padrão.' },
  { id: 'web-02-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o atributo do cookie ao efeito.', pairs: [['HttpOnly', 'Cookie invisível ao JavaScript'], ['Secure', 'Só é enviado por HTTPS'], ['SameSite=Lax', 'Limita o envio em requisições entre sites'], ['Max-Age', 'Define a duração em segundos']], explanation: 'HttpOnly protege contra o roubo por XSS; Secure impede o envio em HTTP; SameSite reduz CSRF; Max-Age ou Expires tornam o cookie persistente.' },
  { id: 'web-02-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Uma equipe quer guardar o token de acesso (JWT de 7 dias) em §localStorage§ "porque é mais simples". Dê dois riscos e uma alternativa.', model: 'Qualquer script da mesma origem lê o localStorage; uma falha de XSS (ou uma biblioteca de terceiros comprometida) permite roubar o token e usá-lo de outro lugar durante sete dias. Também não há como o servidor revogar facilmente um token já copiado, e o armazenamento é legível por extensões. Alternativa: manter a sessão em um cookie emitido pelo servidor com HttpOnly, Secure e SameSite (inacessível ao JavaScript), com expiração curta e renovação; combinar com defesas contra CSRF e uma política de segurança de conteúdo (CSP) para reduzir o XSS.', rubric: ['Cita o roubo por XSS ou script de terceiros', 'Cita a longa validade/dificuldade de revogar', 'Propõe cookie HttpOnly, Secure e SameSite emitido pelo servidor', 'Menciona defesas complementares (CSP, CSRF, expiração curta)'], explanation: 'A resposta forte liga o risco (XSS lê qualquer coisa do localStorage) à mitigação (cookie HttpOnly) e reconhece que a solução vem em camadas.' },
  { id: 'web-02-e6', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §serializarCookie(nome, valor, opcoes)§, que devolve a string do cabeçalho §Set-Cookie§. O valor deve ser codificado com §encodeURIComponent§. Opções (todas opcionais): §maxAge§ (inteiro ≥ 0 em segundos), §path§, §domain§, §secure§ (booleano), §httpOnly§ (booleano) e §sameSite§ (§"Strict"§, §"Lax"§ ou §"None"§, aceitando qualquer caixa e normalizando). Ordem de saída: §nome=valor§, §Max-Age§, §Path§, §Domain§, §Secure§, §HttpOnly§, §SameSite§, separados por §"; "§. Lance §Error("nome inválido")§ se o nome estiver vazio ou contiver espaço, §=§, §;§ ou vírgula; §Error("SameSite inválido")§ para outro valor; §Error("maxAge inválido")§ se não for inteiro ≥ 0; e §Error("SameSite=None exige Secure")§ quando §sameSite§ for None sem §secure§.', lang: 'javascript', starter: 'function serializarCookie(nome, valor, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Valide o nome com uma regex como /^[^\\s=;,]+$/.', 'Monte um array de partes e una com "; ".'], tests: [{ name: 'cookie simples e codificação', code: R`assert.equal(serializarCookie('tema', 'escuro'), 'tema=escuro');
assert.equal(serializarCookie('q', 'a b&c'), 'q=a%20b%26c');` }, { name: 'todos os atributos na ordem', code: R`assert.equal(serializarCookie('sid', 'x1', { maxAge: 3600, path: '/', domain: 'exemplo.com', secure: true, httpOnly: true, sameSite: 'lax' }), 'sid=x1; Max-Age=3600; Path=/; Domain=exemplo.com; Secure; HttpOnly; SameSite=Lax');
assert.equal(serializarCookie('a', 'b', { maxAge: 0 }), 'a=b; Max-Age=0');` }, { name: 'SameSite=None exige Secure', code: R`assert.equal(serializarCookie('a', 'b', { sameSite: 'NONE', secure: true }), 'a=b; Secure; SameSite=None');
assert.throws(() => serializarCookie('a', 'b', { sameSite: 'None' }), 'SameSite=None exige Secure');` }, { name: 'validações', code: R`assert.throws(() => serializarCookie('', 'x'), 'nome inválido');
assert.throws(() => serializarCookie('a b', 'x'), 'nome inválido');
assert.throws(() => serializarCookie('a=b', 'x'), 'nome inválido');
assert.throws(() => serializarCookie('a', 'x', { sameSite: 'Talvez' }), 'SameSite inválido');
assert.throws(() => serializarCookie('a', 'x', { maxAge: -1 }), 'maxAge inválido');
assert.throws(() => serializarCookie('a', 'x', { maxAge: 1.5 }), 'maxAge inválido');` }], solution: R`function serializarCookie(nome, valor, opcoes = {}) {
  if (typeof nome !== 'string' || !/^[^\s=;,]+$/.test(nome)) throw new Error('nome inválido');
  const { maxAge, path, domain, secure, httpOnly, sameSite } = opcoes;
  const partes = [nome + '=' + encodeURIComponent(valor)];
  if (maxAge !== undefined) {
    if (!Number.isInteger(maxAge) || maxAge < 0) throw new Error('maxAge inválido');
    partes.push('Max-Age=' + maxAge);
  }
  if (path) partes.push('Path=' + path);
  if (domain) partes.push('Domain=' + domain);
  let ss;
  if (sameSite !== undefined) {
    ss = { strict: 'Strict', lax: 'Lax', none: 'None' }[String(sameSite).toLowerCase()];
    if (!ss) throw new Error('SameSite inválido');
    if (ss === 'None' && !secure) throw new Error('SameSite=None exige Secure');
  }
  if (secure) partes.push('Secure');
  if (httpOnly) partes.push('HttpOnly');
  if (ss) partes.push('SameSite=' + ss);
  return partes.join('; ');
}
`, explanation: 'Montar o cabeçalho com validação evita cookies mal formados e combina regras reais: navegadores rejeitam §SameSite=None§ sem §Secure§. Em produção, bibliotecas de cookies fazem isso, mas o servidor continua sendo quem emite cookies de sessão.' }
],
'web-03': [
  { id: 'web-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Onde o esquema de um banco IndexedDB (stores e índices) pode ser alterado?', options: ['Em qualquer transação §readwrite§', 'Somente no evento §onupgradeneeded§, ao abrir o banco com uma versão maior', 'Apenas apagando o banco', 'No Service Worker, com §caches.open§'], answer: 1, explanation: 'Criar stores e índices só é permitido durante a transação de atualização de versão (§onupgradeneeded§). É o ponto das migrações.' },
  { id: 'web-03-e2', type: 'bug', difficulty: 3, points: 10, prompt: 'A gravação falha às vezes com §TransactionInactiveError§. Clique na linha que causa o erro.', code: 'async function salvar(db, produto) {\n  const tx = db.transaction("produtos", "readwrite");\n  const store = tx.objectStore("produtos");\n  const info = await fetch("/api/enriquecer/" + produto.id).then((r) => r.json());\n  store.put({ ...produto, ...info });\n  return new Promise((res) => (tx.oncomplete = res));\n}', answer: 4, explanation: 'A transação foi aberta e, durante o §await§ da rede, ficou sem pedidos pendentes e **encerrou**. Faça o §fetch§ antes de abrir a transação e use-a só para gravar.' },
  { id: 'web-03-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Chamar §await resposta.text()§ duas vezes na mesma §Response§ devolve o mesmo texto nas duas.', answer: false, explanation: 'O corpo é um fluxo de leitura única: a segunda leitura lança TypeError. Use §resposta.clone()§ antes de consumir.' },
  { id: 'web-03-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a necessidade à API de armazenamento mais adequada.', pairs: [['Resposta HTTP para uso offline', 'Cache API'], ['Milhares de registros buscáveis por campo', 'IndexedDB com índices'], ['Preferência de tema (uma string)', 'localStorage'], ['Dados da aba, descartados ao fechá-la', 'sessionStorage']], explanation: 'Escolha pelo formato e pela vida do dado: respostas de rede na Cache API; dados estruturados no IndexedDB; preferências pequenas no localStorage; dados efêmeros da aba no sessionStorage.' },
  { id: 'web-03-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Um app offline guarda notas no IndexedDB e o navegador, por falta de espaço, apaga os dados do site. Como o projeto deveria se proteger e comunicar isso ao usuário?', model: 'Tratar o armazenamento local como cache e fila, não como fonte da verdade: manter os dados no servidor e sincronizar assim que possível; avisar quando há alterações ainda não sincronizadas; pedir armazenamento persistente com navigator.storage.persist(); monitorar uso e cota com storage.estimate() e limpar o que não é essencial; ao abrir e encontrar o banco vazio, reconstruir a partir do servidor e informar o usuário. Oferecer exportação/backup para dados que só existam no cliente.', rubric: ['Reconhece que o servidor é a fonte da verdade', 'Cita storage.persist() e/ou storage.estimate()', 'Prevê a recuperação (recarregar do servidor)', 'Comunica ao usuário o que está pendente ou perdido'], explanation: 'O ponto central é projetar para a perda: o navegador pode apagar os dados, então sincronização e recuperação são parte da funcionalidade.' },
  { id: 'web-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §migrar(registro, de, para, migracoes)§, que reproduz a lógica de §onupgradeneeded§ para um registro. §migracoes§ é um objeto cuja chave §n§ guarda a função que leva um registro da versão §n-1§ para §n§. Aplique, em ordem, as migrações de §de+1§ até §para§, **sem alterar o registro original**, e devolva §{ versao: para, dados }§. Se §para < de§, lance §RangeError§; se faltar a migração §n§, lance §Error("migração ausente: n")§. Se §de === para§, devolva uma cópia profunda inalterada.', lang: 'javascript', starter: 'function migrar(registro, de, para, migracoes) {\n  // seu código aqui\n}\n', hints: ['Comece com structuredClone(registro).', 'Cada migração recebe os dados e devolve os novos dados.'], tests: [{ name: 'aplica migrações em ordem', code: R`const m = { 2: (d) => ({ ...d, nome: d.nome.trim() }), 3: (d) => ({ ...d, tags: [] }), 4: (d) => ({ ...d, preco: Math.round(d.preco * 100) }) };
const r = migrar({ nome: ' Caneta ', preco: 3.5 }, 1, 4, m);
assert.deepEqual(r, { versao: 4, dados: { nome: 'Caneta', preco: 350, tags: [] } });` }, { name: 'parte de uma versão intermediária', code: R`const m = { 2: () => { throw new Error('não deveria rodar'); }, 3: (d) => ({ ...d, v3: true }) };
assert.deepEqual(migrar({ a: 1 }, 2, 3, m), { versao: 3, dados: { a: 1, v3: true } });` }, { name: 'não altera o original e mesma versão devolve cópia', code: R`const orig = { itens: [1, 2] };
const r = migrar(orig, 1, 1, {}); assert.deepEqual(r, { versao: 1, dados: { itens: [1, 2] } });
r.dados.itens.push(3); assert.deepEqual(orig, { itens: [1, 2] });
const m = { 2: (d) => { d.itens.push(9); return d; } };
const r2 = migrar(orig, 1, 2, m); assert.deepEqual(orig, { itens: [1, 2] }); assert.deepEqual(r2.dados.itens, [1, 2, 9]);` }, { name: 'erros', code: R`assert.throws(() => migrar({}, 3, 2, {}), '');
assert.throws(() => migrar({}, 1, 3, { 2: (d) => d }), 'migração ausente: 3');` }], solution: R`function migrar(registro, de, para, migracoes) {
  if (para < de) throw new RangeError('versão de destino menor que a de origem');
  let dados = structuredClone(registro);
  for (let n = de + 1; n <= para; n++) {
    if (typeof migracoes[n] !== 'function') throw new Error('migração ausente: ' + n);
    dados = migracoes[n](dados);
  }
  return { versao: para, dados };
}
`, explanation: 'Migrar em sequência, versão a versão, é o que o §onupgradeneeded§ faz com o esquema e o que você deve fazer com os dados existentes. Partir de uma cópia protege o original e testar com dados antigos evita surpresas em produção.' }
],
'web-04': [
  { id: 'web-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual destes recursos **não** existe dentro de um Web Worker dedicado?', options: ['§fetch§', '§indexedDB§', '§document§', '§setTimeout§'], answer: 2, explanation: 'O Worker não tem acesso ao DOM (§document§ e §window§). Ele pode usar fetch, IndexedDB, temporizadores e comunicar-se por mensagens.' },
  { id: 'web-04-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Depois de §postMessage(dados, [buffer])§, a página continua podendo ler §buffer.byteLength§ com o tamanho original.', answer: false, explanation: 'O §ArrayBuffer§ foi **transferido**: o remetente perde o acesso e §byteLength§ passa a ser 0.' },
  { id: 'web-04-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Ao enviar a configuração ao Worker, ocorre §DataCloneError§. Clique na linha que causa o erro.', code: 'const w = new Worker("calc.js");\nconst config = {\n  limite: 100,\n  filtro: (x) => x > 10,\n};\nw.postMessage(config);', answer: 6, explanation: 'Funções não podem ser clonadas pelo algoritmo de clonagem estruturada. Envie só dados (por exemplo, §minimo: 10§) e deixe o código do filtro dentro do Worker.' },
  { id: 'web-04-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o Worker: ele recebe um número, calcula o dobro e responde à página.', code: 'self.[[0]] = (e) => {\n  self.[[1]](e.data * 2);\n};', answers: [['onmessage'], ['postMessage']], explanation: 'O Worker escuta mensagens com §onmessage§ (ou §addEventListener("message")§) e responde com §postMessage§.' },
  { id: 'web-04-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Um editor de fotos congela ao aplicar um filtro em imagens de 20 megapixels. Explique como usaria um Worker para resolver e que cuidados teria com os dados da imagem.', model: 'Enviar o processamento para um Worker dedicado, para que a thread principal continue respondendo. Os pixels (ImageData/ArrayBuffer) devem ser transferidos, não copiados, para evitar o custo da cópia; a página perde temporariamente o acesso ao buffer e o recebe de volta com o resultado. Usar OffscreenCanvas quando possível, enviar progresso por mensagens, permitir cancelamento (terminate ou um sinal) e tratar erros do Worker. Reaproveitar o Worker em vez de criar um por filtro e atualizar a interface somente na thread principal.', rubric: ['Move o processamento para um Worker', 'Usa objetos transferíveis para os buffers grandes', 'Prevê progresso/cancelamento ou tratamento de erros', 'Lembra que o DOM só é atualizado na thread principal'], explanation: 'A resposta forte une a ideia (Worker) a um detalhe que decide o desempenho (transferência em vez de cópia).' },
  { id: 'web-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarRpc(worker, opcoes)§, que transforma mensagens em chamadas com promise. §worker§ tem §postMessage(m)§ e você deve atribuir §worker.onmessage§ (que recebe §{ data }§). §chamar(metodo, ...args)§ envia §{ id, metodo, args }§ com um §id§ crescente (começando em 1) e devolve uma promise. O Worker responde §{ id, resultado }§ ou §{ id, erro }§ (string). Resolva com §resultado§ ou rejeite com §new Error(erro)§. Se não houver resposta em §opcoes.timeoutMs§ (padrão 1000), rejeite com §Error("timeout")§ e ignore uma resposta tardia. §pendentes()§ devolve quantos pedidos aguardam resposta.', lang: 'javascript', starter: 'function criarRpc(worker, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Guarde os pendentes em um Map por id e limpe o timer ao responder.', 'Atribua worker.onmessage uma única vez, ao criar o RPC.'], tests: [{ name: 'resolve por id, mesmo fora de ordem', code: R`const w = { postMessage(m) { this.msgs.push(m); }, msgs: [] };
const rpc = criarRpc(w);
const p1 = rpc.chamar('soma', 1, 2), p2 = rpc.chamar('dobro', 5);
assert.deepEqual(w.msgs, [{ id: 1, metodo: 'soma', args: [1, 2] }, { id: 2, metodo: 'dobro', args: [5] }]);
assert.equal(rpc.pendentes(), 2);
w.onmessage({ data: { id: 2, resultado: 10 } }); w.onmessage({ data: { id: 1, resultado: 3 } });
assert.deepEqual(await Promise.all([p1, p2]), [3, 10]); assert.equal(rpc.pendentes(), 0);` }, { name: 'rejeita com a mensagem de erro do worker', code: R`const w = { postMessage(m) { setTimeout(() => w.onmessage({ data: { id: m.id, erro: 'falhou feio' } }), 1); } };
const rpc = criarRpc(w);
await assert.rejects(rpc.chamar('x'), 'falhou feio');` }, { name: 'timeout e resposta tardia ignorada', code: R`const w = { postMessage() {} };
const rpc = criarRpc(w, { timeoutMs: 20 });
const p = rpc.chamar('lento');
await assert.rejects(p, 'timeout'); assert.equal(rpc.pendentes(), 0);
w.onmessage({ data: { id: 1, resultado: 'tarde' } });
assert.equal(rpc.pendentes(), 0);` }, { name: 'ids continuam crescendo', code: R`const w = { postMessage(m) { setTimeout(() => w.onmessage({ data: { id: m.id, resultado: m.id } }), 1); } };
const rpc = criarRpc(w);
assert.equal(await rpc.chamar('a'), 1); assert.equal(await rpc.chamar('b'), 2);` }], solution: R`function criarRpc(worker, opcoes = {}) {
  const { timeoutMs = 1000 } = opcoes;
  let proximo = 1;
  const pendentes = new Map();
  worker.onmessage = (e) => {
    const { id, resultado, erro } = e.data;
    const p = pendentes.get(id);
    if (!p) return;
    pendentes.delete(id);
    clearTimeout(p.timer);
    if (erro !== undefined) p.rej(new Error(erro)); else p.res(resultado);
  };
  return {
    chamar(metodo, ...args) {
      const id = proximo++;
      return new Promise((res, rej) => {
        const timer = setTimeout(() => { pendentes.delete(id); rej(new Error('timeout')); }, timeoutMs);
        pendentes.set(id, { res, rej, timer });
        worker.postMessage({ id, metodo, args });
      });
    },
    pendentes: () => pendentes.size
  };
}
`, explanation: 'O id liga cada resposta ao seu pedido, permitindo respostas fora de ordem. O timeout evita promises eternamente pendentes e a verificação no mapa descarta respostas tardias. Bibliotecas como Comlink automatizam esse padrão.' }
],
'web-05': [
  { id: 'web-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em que evento do Service Worker se faz, tipicamente, o **pré-cache** dos arquivos essenciais?', options: ['§fetch§', '§install§', '§activate§', '§message§'], answer: 1, explanation: 'No §install§ guarda-se a casca do app com §cache.addAll§; no §activate§ apagam-se os caches de versões antigas.' },
  { id: 'web-05-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Se o servidor responde 503, a promise de §fetch()§ é rejeitada e o §catch§ é executado.', answer: false, explanation: '§fetch§ só rejeita em falhas de rede. Uma resposta 503 é uma promise **resolvida** com §response.ok === false§; é preciso verificar §ok§.' },
  { id: 'web-05-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O network-first deveria usar o cache quando o servidor está fora do ar (HTTP 503), mas entrega o erro ao usuário. Clique na linha que causa o problema.', code: 'self.addEventListener("fetch", (e) => {\n  e.respondWith(\n    fetch(e.request)\n      .then((res) => res)\n      .catch(() => caches.match(e.request))\n  );\n});', answer: 4, explanation: 'O §.then((res) => res)§ devolve qualquer resposta, inclusive 503, e o §catch§ só cobre falhas de rede. Troque por §if (!res.ok) throw new Error(res.status); ...; return res;§ para cair no cache.' },
  { id: 'web-05-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a estratégia ao caso de uso mais adequado.', pairs: [['Cache-first', 'Arquivos JS e CSS com hash no nome'], ['Network-first', 'Dados de uma API que mudam com frequência'], ['Stale-while-revalidate', 'Avatares e listas que toleram atraso'], ['Network-only', 'Requisições de pagamento e autenticação']], explanation: 'Cada estratégia troca frescor por velocidade e disponibilidade; operações sensíveis não devem ser servidas de cache.' },
  { id: 'web-05-e5', type: 'trace', difficulty: 2, points: 10, prompt: 'Um worker novo (v2) é registrado enquanto o v1 está ativo e há uma aba aberta. O v2 **não** chama §skipWaiting()§.', code: 'v1: activated (controla a aba 1)\nregister(sw.js v2)\n -> install do v2 ...', lang: 'text', steps: [{ q: 'Em que estado fica o v2 depois de instalado (installed, waiting ou activated)?', answers: ['waiting', 'installed'] }, { q: 'O que precisa acontecer para o v2 ser ativado sem skipWaiting?', answers: ['fechar as abas', 'fechar todas as abas', 'fechar a aba', 'todas as abas serem fechadas'] }], explanation: 'O v2 fica em **waiting** até que todas as páginas controladas pelo v1 sejam fechadas (ou até chamar §skipWaiting§). Isso evita trocar o worker "por baixo" de uma página aberta.' },
  { id: 'web-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarEstrategias(cache)§ com §cache§ sendo um §Map§ de chave para resposta. Devolva §{ cacheFirst, networkFirst, staleWhileRevalidate, aguardarAtualizacoes }§. Cada estratégia é §async (chave, buscar)§, onde §buscar()§ devolve uma promise de §{ ok, status, corpo }§ (pode **rejeitar** em falha de rede). Respostas com §ok§ falso **nunca** são guardadas. §cacheFirst§: devolve o cache; senão busca (e guarda se ok). §networkFirst§: busca; se rejeitar **ou** vier com §ok§ falso, devolve o cache; se não houver cache, devolve §{ ok: false, status: 503, corpo: "offline" }§; se ok, guarda e devolve. §staleWhileRevalidate§: se houver cache, devolve-o **imediatamente** e dispara a atualização em segundo plano (erros ignorados); se não houver, busca e devolve (guarda se ok; a falha de rede propaga). §aguardarAtualizacoes()§ devolve uma promise que espera as atualizações em segundo plano pendentes.', lang: 'javascript', starter: 'function criarEstrategias(cache) {\n  // seu código aqui\n}\n', hints: ['Guarde as promises de revalidação em um array para aguardarAtualizacoes.', 'Em networkFirst, trate "não ok" como falha, igual a uma rejeição.'], tests: [{ name: 'cache-first', code: R`const c = new Map(); const e = criarEstrategias(c); let rede = 0;
const buscar = async () => { rede++; return { ok: true, status: 200, corpo: 'v' + rede }; };
assert.equal((await e.cacheFirst('/a', buscar)).corpo, 'v1');
assert.equal((await e.cacheFirst('/a', buscar)).corpo, 'v1'); assert.equal(rede, 1);
const erro = async () => ({ ok: false, status: 500, corpo: 'x' });
assert.equal((await e.cacheFirst('/b', erro)).status, 500); assert.equal(c.has('/b'), false);` }, { name: 'network-first: usa cache em falha de rede e em erro HTTP', code: R`const c = new Map(); const e = criarEstrategias(c);
await e.networkFirst('/a', async () => ({ ok: true, status: 200, corpo: 'novo' }));
assert.equal(c.get('/a').corpo, 'novo');
const cai = async () => { throw new TypeError('rede'); };
assert.equal((await e.networkFirst('/a', cai)).corpo, 'novo');
assert.equal((await e.networkFirst('/a', async () => ({ ok: false, status: 503, corpo: 'fora' }))).corpo, 'novo');
assert.deepEqual(await e.networkFirst('/zzz', cai), { ok: false, status: 503, corpo: 'offline' });
assert.equal(c.get('/a').corpo, 'novo');` }, { name: 'stale-while-revalidate', code: R`const c = new Map(); const e = criarEstrategias(c); let n = 0;
const buscar = async () => ({ ok: true, status: 200, corpo: 'v' + (++n) });
assert.equal((await e.staleWhileRevalidate('/a', buscar)).corpo, 'v1');
const r2 = await e.staleWhileRevalidate('/a', buscar);
assert.equal(r2.corpo, 'v1');
await e.aguardarAtualizacoes();
assert.equal(c.get('/a').corpo, 'v2');
assert.equal((await e.staleWhileRevalidate('/a', buscar)).corpo, 'v2');
await e.aguardarAtualizacoes();` }, { name: 'SWR ignora falhas em segundo plano e propaga a primeira falha sem cache', code: R`const c = new Map(); const e = criarEstrategias(c);
c.set('/a', { ok: true, status: 200, corpo: 'guardado' });
const cai = async () => { throw new Error('rede'); };
assert.equal((await e.staleWhileRevalidate('/a', cai)).corpo, 'guardado');
await e.aguardarAtualizacoes();
await assert.rejects(e.staleWhileRevalidate('/b', cai), 'rede');` }], solution: R`function criarEstrategias(cache) {
  const pendentes = [];
  const guardarSeOk = (chave, r) => { if (r && r.ok) cache.set(chave, r); return r; };
  return {
    async cacheFirst(chave, buscar) {
      if (cache.has(chave)) return cache.get(chave);
      return guardarSeOk(chave, await buscar());
    },
    async networkFirst(chave, buscar) {
      try {
        const r = await buscar();
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return guardarSeOk(chave, r);
      } catch {
        return cache.has(chave) ? cache.get(chave) : { ok: false, status: 503, corpo: 'offline' };
      }
    },
    async staleWhileRevalidate(chave, buscar) {
      if (cache.has(chave)) {
        pendentes.push(Promise.resolve().then(buscar).then((r) => guardarSeOk(chave, r)).catch(() => {}));
        return cache.get(chave);
      }
      return guardarSeOk(chave, await buscar());
    },
    aguardarAtualizacoes: () => Promise.all(pendentes.splice(0)).then(() => undefined)
  };
}
`, explanation: 'As três estratégias diferem em quem tem prioridade (cache ou rede) e se a atualização acontece em segundo plano. O ponto mais traiçoeiro é tratar resposta §ok§ falsa como falha: §fetch§ só rejeita em falha de rede.' }
],
'web-06': [
  { id: 'web-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Segundo os critérios de instalabilidade do Chromium, qual item **não** é requisito para o navegador oferecer a instalação?', options: ['Manifesto com §start_url§', 'Servir por HTTPS (ou localhost)', 'Um Service Worker com tratamento de §fetch§', 'Ícones adequados no manifesto'], answer: 2, explanation: 'O Service Worker não é requisito de instalação (embora seja a forma de entregar o offline). Os requisitos são manifesto (nome, ícones, start_url, display) e HTTPS ou localhost.' },
  { id: 'web-06-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Se §navigator.onLine§ é §true§, o aplicativo tem garantia de que consegue alcançar o servidor.', answer: false, explanation: '§onLine§ indica apenas se há alguma interface de rede conectada. A conexão real só se confirma com uma requisição bem-sucedida.' },
  { id: 'web-06-e3', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o manifesto para abrir o app em janela própria, sem a barra do navegador.', code: '{\n  "name": "Vistoria",\n  "start_url": "/",\n  "[[0]]": "[[1]]"\n}', answers: [['display'], ['standalone']], explanation: '§display: standalone§ abre o app em janela própria. Outras opções: §fullscreen§, §minimal-ui§ e §browser§ (aba comum, que o Chrome não considera instalável).' },
  { id: 'web-06-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Um app de campo permite registrar vistorias sem internet e enviá-las depois. Descreva como evitaria registros duplicados e como trataria conflitos ao sincronizar.', model: 'Cada vistoria nasce com um identificador único gerado no cliente (UUID) e fica em uma fila no IndexedDB; ao reenviar, o servidor trata o id como chave de idempotência e ignora repetições, devolvendo o mesmo resultado. A fila é enviada em ordem, com backoff em falhas e confirmação por operação. Para conflitos (o registro foi alterado no servidor), usar versão ou data de modificação: se a versão do servidor for maior que a base da edição local, aplicar uma regra definida (o último vence, mesclagem por campo) ou apresentar ao usuário as duas versões. Mostrar na interface o estado (pendente, sincronizado, em conflito).', rubric: ['Usa id único por operação para idempotência', 'Usa fila local com reenvio, ordem e backoff', 'Define uma estratégia de conflito (versão, último vence, mesclagem ou decisão do usuário)', 'Mostra o estado de sincronização ao usuário'], explanation: 'Offline-first é um problema de dados distribuídos: identidade das operações, ordem e conflitos importam mais do que o cache.' },
  { id: 'web-06-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §validarManifest(m)§, que devolve a **lista de problemas** (strings, nesta ordem fixa, sem repetir) de um manifesto segundo os critérios do Chromium: §"nome ausente"§ (nem §name§ nem §short_name§ preenchidos); §"start_url ausente"§; §"display inválido"§ (§display§ deve ser §standalone§, §fullscreen§ ou §minimal-ui§, ou haver §display_override§ não vazio); §"ícone 192 ausente"§ e §"ícone 512 ausente"§ (algum ícone com um dos tamanhos §WxH§ de §sizes§ com largura e altura ≥ 192 ou 512, respectivamente; o tamanho §any§ vale para ambos); §"prefer_related_applications verdadeiro"§. Um manifesto válido devolve §[]§. Entrada que não seja objeto devolve §["manifesto inválido"]§.', lang: 'javascript', starter: 'function validarManifest(m) {\n  // seu código aqui\n}\n', hints: ['Para cada ícone, separe sizes por espaço e interprete "192x192".', 'Crie uma função auxiliar temIcone(minimo).'], tests: [{ name: 'manifesto válido', code: R`const m = { name: 'App', start_url: '/', display: 'standalone', icons: [{ src: 'a.png', sizes: '192x192' }, { src: 'b.png', sizes: '512x512' }] };
assert.deepEqual(validarManifest(m), []);` }, { name: 'vários problemas, na ordem fixa', code: R`const m = { display: 'browser', icons: [{ src: 'a.png', sizes: '144x144' }] };
assert.deepEqual(validarManifest(m), ['nome ausente', 'start_url ausente', 'display inválido', 'ícone 192 ausente', 'ícone 512 ausente']);` }, { name: 'any, vários tamanhos e display_override', code: R`const m = { short_name: 'A', start_url: '/x', display_override: ['window-controls-overlay'], display: 'browser', icons: [{ src: 'i.svg', sizes: 'any' }] };
assert.deepEqual(validarManifest(m), []);
const m2 = { name: 'B', start_url: '/', display: 'fullscreen', icons: [{ src: 'i.png', sizes: '48x48 192x192 512x512' }] };
assert.deepEqual(validarManifest(m2), []);` }, { name: 'aplicativo relacionado e entrada inválida', code: R`const m = { name: 'A', start_url: '/', display: 'minimal-ui', prefer_related_applications: true, icons: [{ sizes: '192x192' }] };
assert.deepEqual(validarManifest(m), ['ícone 512 ausente', 'prefer_related_applications verdadeiro']);
assert.deepEqual(validarManifest(null), ['manifesto inválido']);
assert.deepEqual(validarManifest('x'), ['manifesto inválido']);` }], solution: R`function validarManifest(m) {
  if (!m || typeof m !== 'object' || Array.isArray(m)) return ['manifesto inválido'];
  const p = [];
  if (!(String(m.name || '').trim() || String(m.short_name || '').trim())) p.push('nome ausente');
  if (!String(m.start_url || '').trim()) p.push('start_url ausente');
  const okDisplay = ['standalone', 'fullscreen', 'minimal-ui'].includes(m.display) || (Array.isArray(m.display_override) && m.display_override.length > 0);
  if (!okDisplay) p.push('display inválido');
  const tamanhos = (Array.isArray(m.icons) ? m.icons : []).flatMap((i) => String((i && i.sizes) || '').split(/\s+/).filter(Boolean));
  const tem = (min) => tamanhos.some((s) => {
    if (s.toLowerCase() === 'any') return true;
    const mt = /^(\d+)x(\d+)$/i.exec(s);
    return !!mt && Number(mt[1]) >= min && Number(mt[2]) >= min;
  });
  if (!tem(192)) p.push('ícone 192 ausente');
  if (!tem(512)) p.push('ícone 512 ausente');
  if (m.prefer_related_applications === true) p.push('prefer_related_applications verdadeiro');
  return p;
}
`, explanation: 'Validar o manifesto no build evita descobrir o problema só quando o botão de instalar não aparece. As DevTools (aba Application) e o Lighthouse fazem verificações equivalentes, e as regras podem mudar entre versões do navegador.' }
],
'web-07': [
  { id: 'web-07-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Um painel só precisa **receber** atualizações do servidor (status de pedidos), sem enviar nada ao servidor. Qual é, em geral, a escolha mais simples?', options: ['WebSocket com protocolo próprio', 'Server-Sent Events (EventSource)', 'Polling a cada 100 ms', 'Um iframe recarregando a página'], answer: 1, explanation: 'SSE é unidirecional, usa HTTP comum e reconecta sozinho com §Last-Event-ID§. WebSocket compensa quando o cliente também envia com frequência.' },
  { id: 'web-07-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Um §WebSocket§ do navegador reconecta automaticamente quando a conexão cai.', answer: false, explanation: 'Quem reconecta sozinho é o §EventSource§ (SSE). No WebSocket, a aplicação implementa a reconexão, preferencialmente com backoff exponencial e jitter.' },
  { id: 'web-07-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o campo do formato SSE à sua função.', pairs: [['id:', 'Identifica o evento; reenviado como Last-Event-ID ao reconectar'], ['event:', 'Nome do evento, ouvido com addEventListener'], ['data:', 'Conteúdo da mensagem'], ['retry:', 'Espera, em milissegundos, antes de reconectar']], explanation: 'Esses quatro campos e os comentários iniciados por §:§ (heartbeat) formam o protocolo de texto do SSE.' },
  { id: 'web-07-e4', type: 'open', difficulty: 2, points: 10, prompt: 'Explique o risco de um servidor WebSocket que autentica apenas pelo cookie de sessão e como mitigá-lo. Cite também duas medidas de proteção contra clientes abusivos.', model: 'WebSockets não seguem a política de mesma origem: uma página maliciosa em outro site pode abrir uma conexão com o servidor e o navegador enviará os cookies da vítima (cross-site WebSocket hijacking), executando ações em seu nome. Mitigação: validar o cabeçalho Origin no handshake contra uma lista de origens permitidas, usar um token de curta duração específico para a conexão (obtido por uma chamada autenticada) e usar wss. Contra abusos: limitar o tamanho das mensagens e a taxa por conexão/cliente, definir tempo máximo de ociosidade com heartbeat e autorizar cada ação/canal no servidor, validando o conteúdo.', rubric: ['Explica o sequestro entre sites e o envio automático de cookies', 'Propõe validar Origin e/ou token específico na conexão', 'Cita limite de tamanho/taxa de mensagens', 'Cita autorização por mensagem/canal ou validação de conteúdo'], explanation: 'A resposta forte identifica que a política de mesma origem não protege WebSockets e que a defesa é feita no servidor, no handshake e em cada mensagem.' },
  { id: 'web-07-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §parseSSE(texto)§, que interpreta um trecho de fluxo §text/event-stream§ e devolve a lista de eventos **completos**. Regras: normalize §\\r\\n§ e §\\r§ para §\\n§; um evento termina em uma **linha em branco** (blocos sem a linha em branco final são ignorados); linhas iniciadas por §:§ são comentários; cada linha é §campo: valor§ (remova **um** espaço inicial do valor; sem §:§, o campo é a linha inteira e o valor é vazio); campos: §id§, §event§, §data§ (várias linhas §data§ são unidas por §\\n§) e §retry§ (só inteiros não negativos; outro valor é ignorado). Cada evento é §{ id, event, data }§ (§event§ padrão §"message"§, §id§ padrão §""§) e, se houver §retry§, também §retry§ (número). Blocos sem nenhuma linha §data§ **não geram evento**.', lang: 'javascript', starter: 'function parseSSE(texto) {\n  // seu código aqui\n}\n', hints: ['Separe os blocos por \\n\\n e descarte o último pedaço se o texto não terminar com linha em branco.', 'Para cada linha, ache o primeiro ":" com indexOf.'], tests: [{ name: 'evento simples e nomeado', code: R`const t = 'id: 1\nevent: tick\ndata: {"n":1}\n\ndata: oi\n\n';
assert.deepEqual(parseSSE(t), [{ id: '1', event: 'tick', data: '{"n":1}' }, { id: '', event: 'message', data: 'oi' }]);` }, { name: 'várias linhas data, comentário, CRLF e retry', code: R`const t = ': heartbeat\r\nretry: 200\r\ndata: linha1\r\ndata: linha2\r\n\r\n';
assert.deepEqual(parseSSE(t), [{ id: '', event: 'message', data: 'linha1\nlinha2', retry: 200 }]);
assert.deepEqual(parseSSE('retry: abc\ndata: x\n\n'), [{ id: '', event: 'message', data: 'x' }]);` }, { name: 'bloco incompleto e bloco sem data', code: R`assert.deepEqual(parseSSE('data: a\n\ndata: incompleto'), [{ id: '', event: 'message', data: 'a' }]);
assert.deepEqual(parseSSE('event: x\nid: 9\n\n'), []);
assert.deepEqual(parseSSE(''), []);` }, { name: 'espaço inicial e campo sem dois-pontos', code: R`assert.deepEqual(parseSSE('data:sem espaço\n\n'), [{ id: '', event: 'message', data: 'sem espaço' }]);
assert.deepEqual(parseSSE('data:  dois espaços\n\n'), [{ id: '', event: 'message', data: ' dois espaços' }]);
assert.deepEqual(parseSSE('data\n\n'), [{ id: '', event: 'message', data: '' }]);` }], solution: R`function parseSSE(texto) {
  const t = String(texto).replace(/\r\n|\r/g, '\n');
  const partes = t.split('\n\n');
  partes.pop();                                   // o último pedaço não foi terminado por linha em branco
  const eventos = [];
  for (const bloco of partes) {
    let id = '', event = '', retry, temData = false; const data = [];
    for (const linha of bloco.split('\n')) {
      if (!linha || linha.startsWith(':')) continue;
      const i = linha.indexOf(':');
      const campo = i === -1 ? linha : linha.slice(0, i);
      let valor = i === -1 ? '' : linha.slice(i + 1);
      if (valor.startsWith(' ')) valor = valor.slice(1);
      if (campo === 'id') id = valor;
      else if (campo === 'event') event = valor;
      else if (campo === 'data') { data.push(valor); temData = true; }
      else if (campo === 'retry' && /^\d+$/.test(valor)) retry = Number(valor);
    }
    if (!temData) continue;
    const ev = { id, event: event || 'message', data: data.join('\n') };
    if (retry !== undefined) ev.retry = retry;
    eventos.push(ev);
  }
  return eventos;
}
`, explanation: 'O formato SSE é simples e por isso mesmo cheio de detalhes (espaço inicial, comentários, CRLF, bloco sem data). Conhecer o protocolo ajuda a depurar o fluxo no painel Network e a implementar clientes com §fetch§ quando é preciso enviar cabeçalhos.' },
  { id: 'web-07-e6', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §proximaEspera(tentativa, opcoes)§ para reconexão com **backoff exponencial e jitter total**: o máximo da tentativa é §min(teto, base * 2 ** tentativa)§ e a espera é §Math.floor(aleatorio() * maximo)§, onde §aleatorio§ devolve um número em [0, 1) (padrão §Math.random§). Padrões: §base = 500§, §teto = 30000§. Lance §RangeError§ se §tentativa§ não for inteiro ≥ 0.', lang: 'javascript', starter: 'function proximaEspera(tentativa, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Desestruture opcoes com valores padrão.', 'Valide com Number.isInteger.'], tests: [{ name: 'crescimento exponencial limitado pelo teto', code: R`const um = { aleatorio: () => 0.999999 };
assert.equal(proximaEspera(0, um), 499); assert.equal(proximaEspera(3, um), 3999); assert.equal(proximaEspera(20, um), 29999);` }, { name: 'jitter e opções', code: R`assert.equal(proximaEspera(2, { aleatorio: () => 0 }), 0);
assert.equal(proximaEspera(2, { base: 100, aleatorio: () => 0.5 }), 200);
assert.equal(proximaEspera(10, { base: 100, teto: 1000, aleatorio: () => 0.5 }), 500);` }, { name: 'sempre dentro dos limites com Math.random', code: R`for (let t = 0; t < 12; t++) { const v = proximaEspera(t); assert.ok(v >= 0 && v < Math.min(30000, 500 * 2 ** t)); }` }, { name: 'tentativa inválida', code: R`assert.throws(() => proximaEspera(-1), '');
assert.throws(() => proximaEspera(1.5), '');
assert.throws(() => proximaEspera('2'), '');` }], solution: R`function proximaEspera(tentativa, opcoes = {}) {
  const { base = 500, teto = 30000, aleatorio = Math.random } = opcoes;
  if (!Number.isInteger(tentativa) || tentativa < 0) throw new RangeError('tentativa inválida');
  const maximo = Math.min(teto, base * 2 ** tentativa);
  return Math.floor(aleatorio() * maximo);
}
`, explanation: 'O jitter espalha as reconexões no tempo e evita o "rebanho trovejante" depois de uma queda geral do servidor. Zere o contador de tentativas após uma conexão estável.' }
]
};

const P = 'web-platform-p';
export const assessment = {
  id: 'web-platform', title: 'Avaliação final — APIs do navegador e Web Platform', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Para tratar cliques em itens de uma lista que recebe elementos novos o tempo todo, qual técnica evita registrar um ouvinte por item?', options: ['Delegação de eventos em um ancestral', 'Usar §setInterval§ para procurar botões', 'Atributos §onclick§ no HTML de cada item', 'Recarregar a página a cada item'], answer: 0, explanation: 'Um único ouvinte no ancestral, com §closest§, atende itens atuais e futuros.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Um §<input>§ digitado pelo usuário e exibido com §innerHTML§ é seguro contra XSS porque o navegador escapa o conteúdo.', answer: false, explanation: '§innerHTML§ interpreta o texto como HTML. Use §textContent§ para texto ou sanitize o HTML.' },
    { id: P + '3', type: 'bug', difficulty: 2, points: 10, prompt: 'O app lança erro para usuários novos (sem dados salvos). Clique na linha problemática.', code: 'function carregarCarrinho() {\n  const itens = JSON.parse(localStorage.getItem("carrinho"));\n  return itens.map((i) => i.id);\n}', answer: 3, explanation: 'Sem dados, §getItem§ devolve §null§ e §JSON.parse(null)§ resulta em §null§; §itens.map§ lança TypeError. Use um valor padrão (§?? []§) e §try/catch§ para JSON inválido.' },
    { id: P + '4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a API à sua principal função.', pairs: [['IndexedDB', 'Banco de objetos assíncrono com transações e índices'], ['Cache API', 'Pares requisição/resposta HTTP para uso offline'], ['Web Worker', 'JavaScript em outra thread, sem DOM'], ['EventSource', 'Fluxo de eventos do servidor com reconexão automática']], explanation: 'Cada API resolve um problema diferente; muitos apps combinam as quatro.' },
    { id: P + '5', type: 'trace', difficulty: 2, points: 10, prompt: 'Considere o código.', code: 'const buf = new ArrayBuffer(1024);\nworker.postMessage({ buf }, [buf]);\nconsole.log(buf.byteLength);', lang: 'javascript', steps: [{ q: 'O que é impresso?', answers: ['0'] }, { q: 'O buffer foi copiado ou transferido?', answers: ['transferido', 'transferida', 'transferencia', 'transferência'] }], explanation: 'O segundo argumento do §postMessage§ transfere o buffer; o remetente o perde e §byteLength§ passa a 0.' },
    { id: P + '6', type: 'mc', difficulty: 2, points: 10, prompt: 'Em um Service Worker, o §fetch§ de uma API devolve 503 e o código usa network-first com §.catch(() => caches.match(req))§. O que o usuário recebe?', options: ['Os dados do cache, pois houve erro', 'A resposta 503, pois §fetch§ resolveu normalmente', 'Uma página de erro do navegador', 'Nada: o evento é cancelado'], answer: 1, explanation: '§fetch§ só rejeita em falha de rede. É preciso tratar §!res.ok§ (por exemplo, lançando erro) para cair no §catch§ e usar o cache.' },
    { id: P + '7', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o Service Worker: pré-cache na instalação e apagamento de caches antigos na ativação.', code: 'self.addEventListener("[[0]]", (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL))));\nself.addEventListener("[[1]]", (e) => e.waitUntil(limparCachesAntigos()));', answers: [['install'], ['activate']], explanation: 'O pré-cache é feito no §install§ e a limpeza no §activate§.' },
    { id: P + '8', type: 'open', difficulty: 2, points: 10, prompt: 'Compare SSE e WebSocket e diga qual escolheria para (a) um feed de notícias ao vivo e (b) um chat com envio e recebimento frequentes. Justifique.', model: '(a) SSE: o fluxo é só do servidor para o cliente, usa HTTP comum (passa bem por proxies e balanceadores), tem reconexão automática e retomada por Last-Event-ID, e o formato de texto é simples. (b) WebSocket: o chat é bidirecional e de baixa latência, com mensagens frequentes nos dois sentidos, e o WebSocket evita abrir uma requisição por envio; exige implementar reconexão com backoff e jitter, heartbeat, confirmação de mensagens, autenticação e validação de Origin, além de dimensionar as conexões abertas.', rubric: ['SSE para (a), citando a direção unidirecional', 'WebSocket para (b), citando a comunicação bidirecional', 'Menciona reconexão automática do SSE x implementação manual no WebSocket', 'Cita ao menos um cuidado de produção (backoff, heartbeat, Origin ou escala)'], explanation: 'A escolha deve partir da direção dos dados e da frequência de envio, e reconhecer o custo operacional de cada opção.' },
    { id: P + '9', type: 'tf', difficulty: 2, points: 10, prompt: 'Um Service Worker é requisito obrigatório para que o Chrome ofereça a instalação de uma PWA.', answer: false, explanation: 'O Chrome exige manifesto válido (nome, ícones, start_url, display) e HTTPS ou localhost. O Service Worker é a forma de oferecer o modo offline.' },
    { id: P + '10', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que operações feitas offline devem ter um identificador único gerado no cliente?', options: ['Para deixar o JSON menor', 'Para o servidor reconhecer reenvios e não duplicar o efeito (idempotência)', 'Para evitar usar IndexedDB', 'Para trocar o código de status HTTP'], answer: 1, explanation: 'O id permite reenviar com segurança após falhas de rede, pois o servidor ignora operações já processadas.' },
    { id: P + '11', type: 'trace', difficulty: 2, points: 10, prompt: 'O EventSource recebe o fluxo abaixo; o servidor encerra a conexão depois do evento 5 e o cliente reconecta.', code: 'id: 4\nevent: tick\ndata: {"n":4}\n\nid: 5\nevent: tick\ndata: {"n":5}\n\n(conexão encerrada; reconexão automática)', lang: 'text', steps: [{ q: 'Qual cabeçalho o navegador envia ao reconectar?', answers: ['last-event-id', 'last event id', 'lasteventid'] }, { q: 'Qual valor ele carrega?', answers: ['5'] }], explanation: 'O navegador guarda o último §id§ recebido e o envia em §Last-Event-ID§ para o servidor retomar do evento seguinte (6).' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Um IndexedDB lança §TransactionInactiveError§ ao gravar após um §await fetch(...)§ feito dentro da transação. Qual é a correção?', options: ['Aumentar o tempo da transação com §setTimeout§', 'Fazer o fetch antes de abrir a transação e usar a transação só para gravar', 'Trocar IndexedDB por localStorage', 'Chamar §tx.abort()§ no início'], answer: 1, explanation: 'A transação encerra quando não há pedidos pendentes; aguarde a rede antes de abri-la e mantenha-a curta.' }
  ]
};

export const project = {
  id: 'pwa-notas-offline', name: 'PWA de notas offline-first com sincronização', lv: 'A', stack: 'HTML, CSS e JavaScript (módulos), IndexedDB, Cache API, Service Worker, Web Worker e SSE ou WebSocket; servidor Node.js mínimo', ds: ['browser'],
  desc: 'Construa um aplicativo web de **notas** que funciona **sem internet**, pode ser **instalado** e **sincroniza** com um servidor pequeno quando a conexão volta. A casca do app é pré-cacheada por um Service Worker; as notas ficam no IndexedDB; as alterações offline vão para uma **fila** com identificadores únicos; a busca de texto em muitas notas roda em um **Web Worker**; e um canal em tempo real (SSE ou WebSocket) avisa de mudanças feitas em outro dispositivo. O projeto exercita todas as APIs do curso e termina com um relatório de testes feitos em um navegador real.',
  rf: ['Interface com lista, criação, edição e exclusão de notas, usando delegação de eventos (um ouvinte na lista)', 'Manifesto válido (nome, ícones 192 e 512, §start_url§, §display: standalone§) servido por HTTPS ou §localhost§, instalável sem erros no painel Application', 'Service Worker com pré-cache da casca (§install§), limpeza de versões antigas (§activate§), cache-first para arquivos versionados e network-first (tratando §!res.ok§) para a API', 'Notas e fila de operações pendentes em IndexedDB, com versão de esquema e uma migração de teste (v1 → v2)', 'Cada operação offline com um id único; o servidor ignora ids repetidos (idempotência) e o app mostra o estado: pendente, sincronizado, em conflito', 'Busca por texto em um Web Worker, com mensagens de pedido e resposta por id e timeout', 'Canal em tempo real (SSE com §Last-Event-ID§ ou WebSocket com reconexão com backoff e jitter) que atualiza a lista quando outra aba ou dispositivo altera uma nota', 'Aviso "nova versão disponível" quando houver um Service Worker em espera, com botão para atualizar'],
  rnf: ['Nenhum segredo no armazenamento do navegador; dados do usuário apenas no necessário', 'Todo texto exibido com §textContent§ (sem §innerHTML§ com dados do usuário)', 'O app abre e permite criar notas com a rede desligada (DevTools em Offline)', 'Tratamento de §QuotaExceededError§, falhas de abertura do IndexedDB e do Service Worker', 'README com decisões, versões testadas e instruções para executar o servidor'],
  ac: ['Em um navegador real, o painel Application não mostra erros de instalabilidade do manifesto', 'Com a rede em Offline, o app recarrega e mostra as notas do IndexedDB; ao criar uma nota offline ela entra na fila e aparece como "pendente"', 'Ao reativar a rede, a fila é enviada em ordem e o servidor não cria duplicatas, mesmo reenviando a mesma operação duas vezes (teste documentado)', 'Um 503 do servidor não é exibido ao usuário quando existe resposta em cache (network-first corrigido)', 'A busca em um conjunto de 10 mil notas não congela a interface (medição do maior atraso de timer com e sem Worker)', 'Uma alteração feita em outra aba aparece sem recarregar, e após derrubar o servidor o cliente reconecta com backoff', 'O relatório lista, por requisito, o navegador, a versão e o resultado do teste manual ou automatizado'],
  ch: ['Detectar conflitos por versão e oferecer ao usuário a escolha entre as duas versões', 'Adicionar Background Sync (onde houver suporte) mantendo a contingência para os demais navegadores', 'Medir com o Lighthouse e explicar cada recomendação aplicada ou ignorada', 'Armazenar anexos (imagens) em IndexedDB como Blob e limpá-los quando a cota apertar', 'Extensão: criptografar as notas no cliente com a Web Crypto API e discutir os limites dessa proteção']
};
