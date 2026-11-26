// C7.2 — Vulnerabilidades web: exercícios, avaliação final e projeto. Medições: testes HTTP (Node 26.13.1) e Chrome 157. Os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'wsec-01': [
  { id: 'wsec-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a defesa principal contra SQL Injection?', options: ['Escapar aspas manualmente', 'Consultas parametrizadas', 'Um WAF', 'Ocultar mensagens de erro apenas'], answer: 1, explanation: 'Parâmetros separam código e dados; os demais são camadas adicionais.' },
  { id: 'wsec-01-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: com ordem=coluna_inexistente a versão vulnerável devolveu 500 com a mensagem do banco, e a corrigida 400.', answer: true, explanation: 'A mensagem "no such column" revela que a entrada vai ao SQL.' },
  { id: 'wsec-01-e3', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §montarWhere(filtros, permitidas)§: para cada chave de §filtros§ (na ordem), se não estiver em §permitidas§ lance §Error("coluna não permitida: X")§; devolva §{ sql, params }§ com §sql§ como §"where a=? and b=?"§ (vazio §""§ se não houver filtros) e §params§ com os valores. Os valores nunca entram na string SQL.', lang: 'javascript', starter: 'function montarWhere(filtros, permitidas) {\n  // seu código aqui\n}\n', hints: ['Valide cada chave antes de montar.', 'Junte as condições com " and ".'], tests: [{ name: 'filtros válidos', code: R`assert.equal(JSON.stringify(montarWhere({ categoria: 'livros' }, ['categoria', 'preco'])), '{"sql":"where categoria=?","params":["livros"]}');
assert.equal(JSON.stringify(montarWhere({ categoria: 'x', preco: 10 }, ['categoria', 'preco'])), '{"sql":"where categoria=? and preco=?","params":["x",10]}');
assert.equal(JSON.stringify(montarWhere({}, ['categoria'])), '{"sql":"","params":[]}');` }, { name: 'chave maliciosa e valor malicioso', code: R`assert.throws(() => montarWhere({ '1=1; --': 'x' }, ['categoria']), 'coluna não permitida: 1=1; --');
const r = montarWhere({ categoria: "x' OR '1'='1" }, ['categoria']);
assert.equal(r.sql, 'where categoria=?');
assert.equal(r.params[0], "x' OR '1'='1");` }], solution: R`function montarWhere(filtros, permitidas) {
  const chaves = Object.keys(filtros);
  for (const k of chaves) if (!permitidas.includes(k)) throw new Error('coluna não permitida: ' + k);
  if (!chaves.length) return { sql: '', params: [] };
  return { sql: 'where ' + chaves.map((k) => k + '=?').join(' and '), params: chaves.map((k) => filtros[k]) };
}`, explanation: 'Valores vão em parâmetros; nomes de colunas só entram se estiverem na lista de permissão.' },
  { id: 'wsec-01-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §clausulaOrdem(coluna, direcao, permitidas)§: devolva §{ ok: true, sql: "order by <coluna> <dir>" }§ se a coluna estiver em §permitidas§ e a direção (padrão §"asc"§ se §undefined§; comparação sem diferenciar maiúsculas) for §asc§ ou §desc§ (§dir§ em minúsculas na saída). Se a coluna não for permitida: §{ ok: false, erro: "ordem inválida" }§; se a direção for inválida: §{ ok: false, erro: "direção inválida" }§.', lang: 'javascript', starter: 'function clausulaOrdem(coluna, direcao, permitidas) {\n  // seu código aqui\n}\n', hints: ['Valide a coluna primeiro.', 'Normalize a direção com toLowerCase.'], tests: [{ name: 'válidas', code: R`assert.equal(JSON.stringify(clausulaOrdem('preco', undefined, ['nome', 'preco'])), '{"ok":true,"sql":"order by preco asc"}');
assert.equal(JSON.stringify(clausulaOrdem('nome', 'DESC', ['nome', 'preco'])), '{"ok":true,"sql":"order by nome desc"}');` }, { name: 'inválidas', code: R`assert.equal(JSON.stringify(clausulaOrdem('coluna_inexistente', 'asc', ['nome'])), '{"ok":false,"erro":"ordem inválida"}');
assert.equal(JSON.stringify(clausulaOrdem('nome', 'asc; drop table x', ['nome'])), '{"ok":false,"erro":"direção inválida"}');
assert.equal(JSON.stringify(clausulaOrdem('nome); --', 'asc', ['nome'])), '{"ok":false,"erro":"ordem inválida"}');` }], solution: R`function clausulaOrdem(coluna, direcao, permitidas) {
  if (!permitidas.includes(coluna)) return { ok: false, erro: 'ordem inválida' };
  const d = (direcao === undefined ? 'asc' : String(direcao)).toLowerCase();
  if (d !== 'asc' && d !== 'desc') return { ok: false, erro: 'direção inválida' };
  return { ok: true, sql: 'order by ' + coluna + ' ' + d };
}`, explanation: 'Identificadores não são parametrizáveis: use lista de permissão.' },
  { id: 'wsec-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique os três ataques de SQL Injection vistos no laboratório, por que cada um funcionou e como a versão corrigida os impediu. Cite as medições.', model: 'O bypass de login usou e-mail com OR 1=1 e comentário (--) para tornar a condição sempre verdadeira: vulnerável 200, corrigida 401, porque o e-mail passou a ser parâmetro e a senha é comparada por hash. O UNION acrescentou uma consulta ao resultado e extraiu 2 linhas e-mail:senha, enquanto a corrigida devolveu 0 linhas porque o payload virou apenas o valor da categoria. O vazamento por erro (ordem=coluna_inexistente) devolveu 500 com a mensagem do banco, revelando que a entrada vai ao SQL, e a corrigida devolveu 400 genérico por usar lista de permissão para identificadores. A causa comum é misturar dados e código; a correção é parâmetros, lista de permissão para nomes, erros genéricos, menor privilégio e hash de senhas.', rubric: ['Três ataques com causa', 'Medições (200/401, 2 linhas/0, 500/400)', 'Parâmetros e lista de permissão', 'Camadas adicionais'], explanation: 'Resumo da aula.' },
  { id: 'wsec-01-e6', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que "escapar aspas" manualmente não é recomendado?', options: ['Porque aspas são seguras', 'Porque o escape depende do SGBD, do charset e do contexto e costuma falhar; parâmetros são mais seguros', 'Porque é lento demais', 'Porque o banco proíbe'], answer: 1, explanation: 'Use consultas parametrizadas.' }
],
'wsec-02': [
  { id: 'wsec-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual XSS exige que a vítima abra um link com o payload na URL?', options: ['Armazenado', 'Refletido', 'Nenhum', 'Somente o de DOM'], answer: 1, explanation: 'O armazenado atinge quem abrir a página com o conteúdo gravado.' },
  { id: 'wsec-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido no Chrome: na versão corrigida document.cookie devolveu vazio porque o cookie é HttpOnly, e isso impede qualquer ação do XSS.', answer: false, explanation: 'HttpOnly só impede ler o cookie; o script ainda age como o usuário.' },
  { id: 'wsec-02-e3', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §escaparHtml(valor)§: converta para texto (§null§ e §undefined§ viram vazio) e substitua §&§ por §&amp;§, §<§ por §&lt;§, §>§ por §&gt;§, §"§ por §&quot;§ e §\'§ por §&#39;§. Não escape duas vezes: o §&§ de uma entidade produzida não deve ser reescapado.', lang: 'javascript', starter: 'function escaparHtml(valor) {\n  // seu código aqui\n}\n', hints: ['Use um único replace com mapa.', 'Um replace por vez reescaparia o &.'], tests: [{ name: 'payloads do laboratório', code: R`assert.equal(escaparHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
assert.equal(escaparHtml('<img src=x onerror=alert(2)>'), '&lt;img src=x onerror=alert(2)&gt;');` }, { name: 'aspas, e comercial e nulos', code: R`assert.equal(escaparHtml("O'Brien & \"x\""), 'O&#39;Brien &amp; &quot;x&quot;');
assert.equal(escaparHtml('&lt;'), '&amp;lt;');
assert.equal(escaparHtml(null), '');
assert.equal(escaparHtml(undefined), '');
assert.equal(escaparHtml(42), '42');` }], solution: R`function escaparHtml(valor) {
  if (valor === null || valor === undefined) return '';
  const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(valor).replace(/[&<>"']/g, (c) => m[c]);
}`, explanation: 'Mesma função esc() do laboratório.' },
  { id: 'wsec-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §urlSegura(url)§ para links fornecidos por usuários. Remova todos os caracteres de controle e espaços (§/[\\u0000-\\u0020]/g§) para detectar o esquema. Se houver esquema (§letras:§), só são seguros §http§, §https§ e §mailto§ (sem diferenciar maiúsculas); sem esquema (caminho relativo, §#ancora§, §?q=§) é seguro. Devolva booleano.', lang: 'javascript', starter: 'function urlSegura(url) {\n  // seu código aqui\n}\n', hints: ['O navegador ignora tabs e quebras de linha dentro do esquema.', 'Use uma expressão regular para o esquema.'], tests: [{ name: 'seguras', code: R`assert.equal(urlSegura('https://exemplo.test/a'), true);
assert.equal(urlSegura('mailto:a@b.test'), true);
assert.equal(urlSegura('/caminho?x=1'), true);
assert.equal(urlSegura('#ancora'), true);` }, { name: 'perigosas e ofuscadas', code: R`assert.equal(urlSegura('javascript:alert(1)'), false);
assert.equal(urlSegura('  JaVaScRiPt:alert(1)'), false);
assert.equal(urlSegura('java\nscript:alert(1)'), false);
assert.equal(urlSegura('java\tscript:alert(1)'), false);
assert.equal(urlSegura('data:text/html,<script>alert(1)</script>'), false);
assert.equal(urlSegura('vbscript:x'), false);` }], solution: R`function urlSegura(url) {
  const limpa = String(url).replace(/[\u0000- ]/g, '');
  const m = /^([a-z][a-z0-9+.-]*):/i.exec(limpa);
  if (!m) return true;
  return ['http', 'https', 'mailto'].includes(m[1].toLowerCase());
}`, explanation: 'Lista de permissão de esquemas; javascript: e data: nunca.' },
  { id: 'wsec-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a defesa contra XSS de uma página de comentários que aceita texto simples e, depois, HTML rico. Inclua codificação, CSP, cookies, sanitização e testes, e indique o que o laboratório mediu.', model: 'Para texto simples, codificar a saída por contexto (escape de & < > " \' no corpo e nos atributos entre aspas) e preferir textContent no cliente. Para HTML rico, usar um sanitizador mantido (como DOMPurify) com lista de tags e atributos, ou Markdown seguro, e validar esquemas de URL. Camadas: CSP restritiva (default-src self, script-src self, sem unsafe-inline, object-src none, base-uri none), testada antes em Report-Only; cookies HttpOnly, Secure e SameSite; nosniff; componentes atualizados. Testes automatizados com payloads clássicos e em navegador real. O laboratório mediu, em Chrome 157, 1 execução do alert refletido e 1 do armazenado na versão vulnerável contra 0 e 0 na corrigida, e document.cookie legível só na vulnerável; o efeito isolado da CSP, o DOM XSS e os sanitizadores não foram executados.', rubric: ['Codificação por contexto', 'Sanitização para HTML rico', 'CSP e cookies', 'Medições e limites'], explanation: 'Resumo da aula.' },
  { id: 'wsec-02-e6', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual API é mais segura para inserir texto do usuário em um elemento no navegador?', options: ['innerHTML', 'document.write', 'textContent', 'outerHTML'], answer: 2, explanation: 'textContent insere como texto, sem interpretar HTML.' }
],
'wsec-03': [
  { id: 'wsec-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual condição é essencial para o CSRF clássico?', options: ['O site usa HTTPS', 'A autenticação é enviada automaticamente pelo navegador (cookie)', 'O servidor usa Node', 'O usuário tem JavaScript desativado'], answer: 1, explanation: 'Sem autenticação automática, o atacante não consegue forjar a ação.' },
  { id: 'wsec-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: SameSite=Strict impediu o ataque vindo de outra porta do mesmo host (same-site), por isso o token era dispensável.', answer: false, explanation: 'Outra porta é same-site; o cookie é enviado. No laboratório, quem barrou foi o token (e o 415).' },
  { id: 'wsec-03-e3', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarCsrf(req, sessao, origens)§: §req = { metodo, contentType, headers, origin }§ (cabeçalhos em minúsculas), §sessao = { csrf } ou null§. Devolva o código HTTP: §401§ se não há sessão; §200§ para §GET§, §HEAD§ e §OPTIONS§; §415§ se o §contentType§ não contém §"json"§; §403§ se §headers["x-csrf-token"]§ ≠ §sessao.csrf§ ou se §origin§ existir e não estiver em §origens§; senão §200§.', lang: 'javascript', starter: 'function validarCsrf(req, sessao, origens) {\n  // seu código aqui\n}\n', hints: ['Siga a ordem do enunciado.', 'Origin ausente é aceito.'], tests: [{ name: 'casos do laboratório', code: R`const s = { csrf: 'tok' };
const O = ['http://localhost:8080'];
const base = { metodo: 'POST', contentType: 'application/json', headers: { 'x-csrf-token': 'tok' } };
assert.equal(validarCsrf({ ...base, contentType: 'application/x-www-form-urlencoded' }, s, O), 415);
assert.equal(validarCsrf({ ...base, headers: {} }, s, O), 403);
assert.equal(validarCsrf({ ...base, origin: 'http://evil.test' }, s, O), 403);
assert.equal(validarCsrf(base, s, O), 200);
assert.equal(validarCsrf({ ...base, origin: 'http://localhost:8080' }, s, O), 200);` }, { name: 'sem sessão e métodos seguros', code: R`assert.equal(validarCsrf({ metodo: 'POST', contentType: 'application/json', headers: {} }, null, []), 401);
assert.equal(validarCsrf({ metodo: 'GET', contentType: '', headers: {} }, { csrf: 'x' }, []), 200);
assert.equal(validarCsrf({ metodo: 'OPTIONS', contentType: '', headers: {} }, { csrf: 'x' }, []), 200);` }], solution: R`function validarCsrf(req, sessao, origens) {
  if (!sessao) return 401;
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.metodo)) return 200;
  if (!String(req.contentType || '').includes('json')) return 415;
  if (req.headers['x-csrf-token'] !== sessao.csrf) return 403;
  if (req.origin && !origens.includes(req.origin)) return 403;
  return 200;
}`, explanation: 'Reproduz os códigos medidos: 415, 403, 403 e 200.' },
  { id: 'wsec-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §cookieDeSessao(op)§ com §op = { nome, valor, path, domain, secure, httpOnly, sameSite }§ (§path§ padrão §"/"§, §sameSite§ padrão §"Lax"§). Valide: §sameSite§ deve ser §Strict§, §Lax§ ou §None§ (senão §Error("SameSite inválido")§); §None§ exige §secure§ (§Error("SameSite=None exige Secure")§); nomes começando com §__Host-§ exigem §secure§, §path "/"§ e nenhum §domain§ (§Error("__Host- exige Secure, Path=/ e sem Domain")§). Monte §"nome=valor; Path=...; [Domain=...; ][Secure; ][HttpOnly; ]SameSite=..."§.', lang: 'javascript', starter: 'function cookieDeSessao(op) {\n  // seu código aqui\n}\n', hints: ['Normalize os padrões primeiro.', 'Monte um array de partes e junte com "; ".'], tests: [{ name: 'montagem', code: R`assert.equal(cookieDeSessao({ nome: 'sid', valor: 'abc', httpOnly: true, sameSite: 'Strict' }), 'sid=abc; Path=/; HttpOnly; SameSite=Strict');
assert.equal(cookieDeSessao({ nome: '__Host-sid', valor: 'x', secure: true, httpOnly: true }), '__Host-sid=x; Path=/; Secure; HttpOnly; SameSite=Lax');
assert.equal(cookieDeSessao({ nome: 'a', valor: 'b', domain: 'exemplo.test', secure: true, sameSite: 'None' }), 'a=b; Path=/; Domain=exemplo.test; Secure; SameSite=None');` }, { name: 'erros', code: R`assert.throws(() => cookieDeSessao({ nome: 'a', valor: 'b', sameSite: 'None' }), 'SameSite=None exige Secure');
assert.throws(() => cookieDeSessao({ nome: 'a', valor: 'b', sameSite: 'Talvez' }), 'SameSite inválido');
assert.throws(() => cookieDeSessao({ nome: '__Host-a', valor: 'b', secure: true, domain: 'x.test' }), '__Host- exige Secure, Path=/ e sem Domain');
assert.throws(() => cookieDeSessao({ nome: '__Host-a', valor: 'b' }), '__Host- exige Secure, Path=/ e sem Domain');` }], solution: R`function cookieDeSessao(op) {
  const path = op.path || '/';
  const sameSite = op.sameSite || 'Lax';
  if (!['Strict', 'Lax', 'None'].includes(sameSite)) throw new Error('SameSite inválido');
  if (sameSite === 'None' && !op.secure) throw new Error('SameSite=None exige Secure');
  if (op.nome.startsWith('__Host-') && !(op.secure && path === '/' && !op.domain)) throw new Error('__Host- exige Secure, Path=/ e sem Domain');
  const p = [op.nome + '=' + op.valor, 'Path=' + path];
  if (op.domain) p.push('Domain=' + op.domain);
  if (op.secure) p.push('Secure');
  if (op.httpOnly) p.push('HttpOnly');
  p.push('SameSite=' + sameSite);
  return p.join('; ');
}`, explanation: 'Declarar os atributos evita depender dos padrões do navegador.' },
  { id: 'wsec-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique os resultados do ataque CSRF em Chrome (same-site e cross-site) e por que o token foi a defesa decisiva. O que não foi isolado?', model: 'Na versão vulnerável (cookie sid sem SameSite explícito e sem token) o formulário auto-enviado tirou 100 da conta com atacante same-site (outra porta de localhost: 1000 para 900) e com atacante cross-site (127.0.0.1: 900 para 800); na corrigida o saldo ficou em 1000 nos dois. Same-site considera esquema e domínio registrável, não a porta, então SameSite=Strict não protege de atacantes do mesmo site; o token anti-CSRF (mais JSON obrigatório e validação de Origin) barrou o ataque (415 para formulário, 403 sem token e com Origin estranha, 200 legítimo). O sucesso cross-site é consistente com a exceção Lax+POST do Chrome para cookies sem SameSite explícito, mas a causa não foi isolada, nem outros navegadores ou HTTPS foram testados.', rubric: ['Resultados nos dois cenários', 'Same-site x same-origin', 'Token, JSON e Origin', 'Limites do teste'], explanation: 'Resumo da aula.' },
  { id: 'wsec-03-e6', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que exigir Content-Type application/json e um cabeçalho customizado ajuda contra CSRF?', options: ['Porque JSON é criptografado', 'Porque formulários HTML não enviam esse tipo e o cabeçalho customizado força um preflight que o servidor nega a origens estranhas', 'Porque acelera a requisição', 'Porque troca o cookie'], answer: 1, explanation: 'Medido: formulário → 415.' }
],
'wsec-04': [
  { id: 'wsec-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o CORS faz?', options: ['Impede que requisições cheguem ao servidor', 'Autoriza o navegador a entregar respostas cross-origin ao script', 'Criptografa as respostas', 'Substitui a autenticação'], answer: 1, explanation: 'É uma permissão de leitura para o navegador, não um controle de acesso do servidor.' },
  { id: 'wsec-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: na versão vulnerável, a página de outra origem same-site leu {"saldo":800} da vítima logada.', answer: true, explanation: 'A origem refletida com credenciais permitiu a leitura.' },
  { id: 'wsec-04-e3', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §politicaCors(origin, permitidas)§: se §origin§ for ausente, §"null"§ ou não estiver (igualdade exata) em §permitidas§, devolva §{}§; senão §{ "access-control-allow-origin": origin, "access-control-allow-credentials": "true", vary: "Origin" }§.', lang: 'javascript', starter: 'function politicaCors(origin, permitidas) {\n  // seu código aqui\n}\n', hints: ['Igualdade exata, nunca endsWith.', 'A origem "null" é sempre recusada.'], tests: [{ name: 'origem permitida', code: R`const P = ['http://app.test'];
assert.equal(JSON.stringify(politicaCors('http://app.test', P)), '{"access-control-allow-origin":"http://app.test","access-control-allow-credentials":"true","vary":"Origin"}');` }, { name: 'ataques de validação ingênua', code: R`const P = ['http://app.test'];
assert.equal(JSON.stringify(politicaCors('http://app.test.evil.test', P)), '{}');
assert.equal(JSON.stringify(politicaCors('http://evil-app.test', P)), '{}');
assert.equal(JSON.stringify(politicaCors('null', P)), '{}');
assert.equal(JSON.stringify(politicaCors(undefined, P)), '{}');
assert.equal(JSON.stringify(politicaCors('http://evil.test', ['null', '*'])), '{}');` }], solution: R`function politicaCors(origin, permitidas) {
  if (!origin || origin === 'null' || !permitidas.includes(origin)) return {};
  return { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true', vary: 'Origin' };
}`, explanation: 'Lista de permissão por igualdade exata: a corrigida do laboratório fez isto.' },
  { id: 'wsec-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §relacao(urlA, urlB)§: devolva §{ mesmaOrigem, mesmoSite }§. §mesmaOrigem§: mesmo §URL.origin§. §mesmoSite§: mesmo esquema (protocolo) e mesmo "domínio registrável", definido de forma simplificada como o próprio host se for IP ou não tiver ponto (como §localhost§), senão os dois últimos rótulos do host.', lang: 'javascript', starter: 'function relacao(urlA, urlB) {\n  // seu código aqui\n}\n', hints: ['Use new URL(...).', 'Host IPv4 é composto só de dígitos e pontos.'], tests: [{ name: 'localhost', code: R`assert.equal(JSON.stringify(relacao('http://localhost:8080/a', 'http://localhost:9090/b')), '{"mesmaOrigem":false,"mesmoSite":true}');
assert.equal(JSON.stringify(relacao('http://127.0.0.1:1', 'http://localhost:1')), '{"mesmaOrigem":false,"mesmoSite":false}');
assert.equal(JSON.stringify(relacao('http://localhost:8080/x', 'http://localhost:8080/y')), '{"mesmaOrigem":true,"mesmoSite":true}');` }, { name: 'domínios e esquemas', code: R`assert.equal(JSON.stringify(relacao('https://app.exemplo.com', 'https://api.exemplo.com:8443')), '{"mesmaOrigem":false,"mesmoSite":true}');
assert.equal(JSON.stringify(relacao('https://app.exemplo.com', 'http://app.exemplo.com')), '{"mesmaOrigem":false,"mesmoSite":false}');
assert.equal(JSON.stringify(relacao('https://exemplo.com', 'https://evil.com')), '{"mesmaOrigem":false,"mesmoSite":false}');` }], solution: R`function relacao(urlA, urlB) {
  const a = new URL(urlA), b = new URL(urlB);
  const reg = (h) => (/^[\d.]+$/.test(h) || !h.includes('.') ? h : h.split('.').slice(-2).join('.'));
  return { mesmaOrigem: a.origin === b.origin, mesmoSite: a.protocol === b.protocol && reg(a.hostname) === reg(b.hostname) };
}`, explanation: 'Simplificação didática: o navegador usa a Public Suffix List para o domínio registrável.' },
  { id: 'wsec-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Revise uma configuração que reflete o cabeçalho Origin e responde Allow-Credentials true. Explique o risco usando as medições e proponha a configuração correta, incluindo preflight e Vary.', model: 'Refletir a origem equivale a desligar a política de mesma origem para o endpoint: no laboratório a resposta devolvia Access-Control-Allow-Origin igual a http://evil.test com Allow-Credentials true e autorizava o preflight, e no Chrome a página atacante same-site leu {"saldo":800} da vítima logada (a cross-site leu a resposta de erro porque o cookie não foi enviado pelo SameSite, mas a resposta era legível). A configuração correta usa lista de permissão de origens exatas vinda de configuração, rejeita null, nunca usa curinga com credenciais, responde o preflight apenas para origens permitidas com métodos e cabeçalhos mínimos, envia Vary: Origin e não trata CORS como controle de acesso: o servidor continua autenticando e autorizando e protege as ações contra CSRF. Na corrigida a leitura foi BLOQUEADA nos dois cenários.', rubric: ['Risco da origem refletida', 'Medições no Chrome', 'Lista de permissão, null e curinga', 'Preflight, Vary e CSRF separado'], explanation: 'Resumo da aula.' },
  { id: 'wsec-04-e6', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual validação de origem é INSEGURA?', options: ['permitidas.includes(origin)', 'origin.endsWith("exemplo.com")', 'comparação por igualdade com a lista', 'rejeitar null'], answer: 1, explanation: 'endsWith aceita evil-exemplo.com e similares.' }
],
'wsec-05': [
  { id: 'wsec-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que é SSRF?', options: ['O navegador da vítima envia uma requisição forjada', 'O servidor é induzido a requisitar destinos escolhidos pelo atacante', 'Um tipo de injeção SQL', 'Um ataque de força bruta'], answer: 1, explanation: 'O servidor acessa recursos que o atacante não alcança.' },
  { id: 'wsec-05-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'A implementação de SSRF do laboratório protege contra DNS rebinding.', answer: false, explanation: 'Limite declarado: o IP validado não é fixado na conexão.' },
  { id: 'wsec-05-e3', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ipPrivado(ip)§: verdadeiro para IPv4 que seja §0.x§, §10.x§, §127.x§, §169.254.x§, §172.16–31.x§, §192.168.x§, §100.64–127.x§ ou §>= 224§ no primeiro octeto, ou inválido; para IPv6 (com §:§): §::§, §::1§, §fc..§/§fd..§, §fe8..§–§feb..§ e IPv4 mapeado (§::ffff:a.b.c.d§, avaliando o IPv4). Colchetes externos são ignorados. Os demais: falso.', lang: 'javascript', starter: 'function ipPrivado(ip) {\n  // seu código aqui\n}\n', hints: ['Trate IPv4 e IPv6 separadamente.', 'Para o mapeado, reaproveite a função de IPv4.'], tests: [{ name: 'IPv4', code: R`const casos = { '127.0.0.1': true, '10.1.2.3': true, '172.16.0.1': true, '172.32.0.1': false, '192.168.1.1': true, '169.254.169.254': true, '100.64.0.1': true, '93.184.216.34': false, '0.0.0.0': true, '224.0.0.1': true };
for (const [ip, esp] of Object.entries(casos)) assert.equal(ipPrivado(ip), esp, ip);` }, { name: 'IPv6 e inválidos', code: R`const casos = { '::1': true, '::': true, 'fd00::1': true, 'fe80::1': true, '::ffff:127.0.0.1': true, '::ffff:8.8.8.8': false, '2606:4700::1111': false, '[::1]': true };
for (const [ip, esp] of Object.entries(casos)) assert.equal(ipPrivado(ip), esp, ip);
assert.equal(ipPrivado('999.1.1.1'), true);
assert.equal(ipPrivado('abc'), true);` }], solution: R`function ipPrivado(ip) {
  const v4 = (s) => {
    const o = s.split('.').map(Number);
    if (o.length !== 4 || o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
    const [a, b] = o;
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  };
  const x = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (!x.includes(':')) return v4(x);
  if (x === '::' || x === '::1') return true;
  const m = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(x);
  if (m) return v4(m[1]);
  return /^f[cd]/.test(x) || /^fe[89ab]/.test(x);
}`, explanation: 'Mesma classificação do ssrf.mjs (13 casos medidos).' },
  { id: 'wsec-05-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarUrlSsrf(entrada, permitidos, dns)§ (síncrona; §dns§ mapeia host → lista de IPs). Devolva §{ ok: false, motivo }§ com, nesta ordem: §"URL inválida"§ (não interpretável), §"protocolo não permitido"§ (fora de http/https), §"credenciais na URL"§, §"host fora da lista de permissão"§ (hostname sem colchetes não está em §permitidas§), §"sem resolução"§ (host que não é IP e não está em §dns§) e §"endereço interno"§ (algum IP privado; use §ipPrivado(ip)§, já disponível); senão §{ ok: true }§.', lang: 'javascript', starter: 'function validarUrlSsrf(entrada, permitidos, dns) {\n  // seu código aqui\n}\n', hints: ['A classe URL normaliza a entrada.', 'Para IP literal, os "ips" são o próprio host.'], tests: [{ name: 'motivos do laboratório', code: R`const dns = { 'exemplo.test': ['93.184.216.34'], 'rebind.test': ['127.0.0.1'] };
const P = ['exemplo.test', 'rebind.test'];
const m = (u) => validarUrlSsrf(u, P, dns).motivo;
assert.equal(m('nao-e-url'), 'URL inválida');
assert.equal(m('file:///etc/passwd'), 'protocolo não permitido');
assert.equal(m('http://user:pw@exemplo.test/'), 'credenciais na URL');
assert.equal(m('http://2130706433/'), 'host fora da lista de permissão');
assert.equal(m('http://exemplo.test.evil.test/'), 'host fora da lista de permissão');
assert.equal(m('http://rebind.test/'), 'endereço interno');` }, { name: 'permitida e sem resolução', code: R`const dns = { 'exemplo.test': ['93.184.216.34'] };
assert.equal(JSON.stringify(validarUrlSsrf('https://exemplo.test/a?b=1', ['exemplo.test'], dns)), '{"ok":true}');
assert.equal(validarUrlSsrf('http://sumiu.test/', ['sumiu.test'], dns).motivo, 'sem resolução');
assert.equal(validarUrlSsrf('http://[::1]/', ['::1'], {}).motivo, 'endereço interno');` }], solution: R`function validarUrlSsrf(entrada, permitidos, dns) {
  function ipPrivado(ip) {
    const v4 = (s) => { const o = s.split('.').map(Number); if (o.length !== 4 || o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true; const [a, b] = o; return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224; };
    const x = ip.toLowerCase().replace(/^\[|\]$/g, '');
    if (!x.includes(':')) return v4(x);
    if (x === '::' || x === '::1') return true;
    const m = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(x); if (m) return v4(m[1]);
    return /^f[cd]/.test(x) || /^fe[89ab]/.test(x);
  }
  let u; try { u = new URL(entrada); } catch (e) { return { ok: false, motivo: 'URL inválida' }; }
  if (!['http:', 'https:'].includes(u.protocol)) return { ok: false, motivo: 'protocolo não permitido' };
  if (u.username || u.password) return { ok: false, motivo: 'credenciais na URL' };
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (!permitidos.includes(host)) return { ok: false, motivo: 'host fora da lista de permissão' };
  const ehIp = /^[\d.]+$/.test(host) || host.includes(':');
  const ips = ehIp ? [host] : dns[host];
  if (!ips || !ips.length) return { ok: false, motivo: 'sem resolução' };
  if (ips.some(ipPrivado)) return { ok: false, motivo: 'endereço interno' };
  return { ok: true };
}`, explanation: 'Versão síncrona do validarUrl do laboratório (a solução repete ipPrivado para ser autocontida).' },
  { id: 'wsec-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Desenhe as defesas de um recurso "importar imagem por URL", em camadas, do código à rede. Relacione com as medições e declare o que não foi coberto.', model: 'No código: aceitar somente http e https, interpretar a URL com o parser (que normaliza formas como 2130706433 e 0x7f.0.0.1), recusar credenciais embutidas, usar lista de permissão de hosts, resolver o nome e bloquear IPs loopback, privados (RFC 1918), link-local (169.254/16, inclusive metadados), CGNAT, ULA IPv6 e IPv4 mapeado (13 casos medidos), não seguir redirecionamentos automaticamente e revalidar cada salto (um redirecionamento para 169.254.169.254 foi bloqueado), limitar tempo e tamanho, validar o tipo de conteúdo e devolver só a imagem processada, não o corpo bruto. Na arquitetura: executar a busca em um serviço isolado, sem credenciais nem acesso à rede interna. Na rede: egress filtering, proxy de saída com lista de permissão e, na nuvem, IMDSv2 e papéis de menor privilégio. Medido: a vulnerável leu SEGREDO-SINTETICO-123 direto e via redirecionamento e a corrigida respondeu 400. Não coberto: DNS rebinding (o IP validado não é fixado), SSRF cego, metadados reais e egress.', rubric: ['Validação de URL e IP', 'Redirecionamentos e limites', 'Isolamento e egress', 'Limites declarados'], explanation: 'Resumo da aula.' },
  { id: 'wsec-05-e6', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual é a defesa de rede mais forte contra SSRF?', options: ['Ocultar mensagens de erro', 'Egress filtering: o servidor não alcança redes internas nem metadados', 'Usar HTTPS', 'Aumentar o timeout'], answer: 1, explanation: 'Mesmo que a validação de aplicação falhe, a rede bloqueia o acesso.' }
]
};

const P = 'websec-p';
export const assessment = {
  id: 'websec', title: 'Avaliação final — Vulnerabilidades web: SQLi, XSS, CSRF, CORS e SSRF', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual a causa raiz da SQL Injection?', options: ['Usar SQLite', 'Misturar dados e código na mesma string de consulta', 'Senhas fracas', 'Falta de HTTPS'], answer: 1, explanation: 'Parâmetros separam código e dados.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'A codificação de saída por contexto é a defesa principal contra XSS.', answer: true, explanation: 'CSP, HttpOnly e sanitização são camadas adicionais.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Ataque CSRF na versão vulnerável (Chrome 157).', code: 'same-site: saldo 1000 -> 900\ncross-site: saldo 900 -> 800', lang: 'text', steps: [{ q: 'Quanto foi transferido em cada ataque?', answers: ['100'] }, { q: 'Quanto saiu da conta no total (inteiro)?', answers: ['200'] }], explanation: 'Dois ataques de 100.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que SameSite=Strict não bastou contra o atacante em outra porta do mesmo host?', options: ['Porque Strict não existe', 'Porque a porta não faz parte do "site": a requisição é same-site e o cookie é enviado', 'Porque o cookie expirou', 'Porque o navegador ignorou'], answer: 1, explanation: 'Same-site considera esquema e domínio registrável.' },
    { id: P + '5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a defesa de SQL.', code: "db.prepare('select id from produtos where categoria=[[0]]').all([[1]])", answers: [['?'], ['cat']], explanation: 'Placeholder e valor separados.' },
    { id: P + '6', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que reflete qualquer origem com credenciais.', code: "const origin = req.headers.origin;\nres.setHeader('Access-Control-Allow-Origin', origin);\nres.setHeader('Access-Control-Allow-Credentials', 'true');\nnext();", answer: 2, explanation: 'Origem refletida sem validação equivale a desligar a política de mesma origem.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a defesa ao ataque.', pairs: [['Consulta parametrizada', 'SQL Injection'], ['Escape de saída e CSP', 'XSS'], ['Token anti-CSRF', 'CSRF'], ['Lista de permissão de hosts e egress filtering', 'SSRF']], explanation: 'Defesas principais.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual validação de URL é a mais robusta contra SSRF?', options: ['Bloquear a string localhost', 'Lista de permissão de hosts, resolução do nome, bloqueio de IPs internos e revalidação de redirecionamentos', 'Aceitar só URLs https', 'Limitar o tamanho da URL'], answer: 1, explanation: 'Listas de bloqueio falham por variantes e redirecionamentos.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'O laboratório executou DNS rebinding e acessou metadados reais de nuvem.', answer: false, explanation: 'Não: o rebinding é limite declarado e metadados foram apenas analisados.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'O CORS protege contra CSRF?', options: ['Sim, totalmente', 'Não: requisições simples chegam ao servidor; o CORS só controla a leitura da resposta', 'Só em HTTPS', 'Só com cookies'], answer: 1, explanation: 'Use token e SameSite contra CSRF.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a revisão de segurança de uma aplicação web (login, busca, comentários, transferências, API e importação por URL) cobrindo SQLi, XSS, CSRF, CORS e SSRF: o que verificar, como testar e que correções esperar. Declare o que o curso mediu e não mediu.', model: 'Login e busca: consultas parametrizadas, lista de permissão para identificadores, erros genéricos, menor privilégio no banco e hash de senha, com testes de bypass e UNION. Comentários: codificação de saída por contexto, sanitizador para HTML rico, CSP restritiva, cookies HttpOnly e nosniff, com testes em navegador real do alert refletido e armazenado. Transferências: token anti-CSRF, JSON com cabeçalho customizado, validação de Origin e SameSite explícito, testando same-site e cross-site. API: CORS com lista de origens exatas, sem credenciais com curinga, preflight mínimo e Vary. Importação por URL: lista de hosts, bloqueio de IPs internos, redirecionamentos revalidados, serviço isolado e egress filtering. Medições do curso: 10 testes HTTP e verificações em Chrome 157 (XSS 1x contra 0x, CSRF 100+100 contra 0, CORS lido contra bloqueado, SSRF segredo lido contra 400). Não medido: SQLi cega, DOM XSS, outros navegadores, DNS rebinding, metadados reais.', rubric: ['Cobertura dos cinco riscos', 'Métodos de teste', 'Correções esperadas', 'Honestidade sobre o medido'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual cookie é mais seguro para sessão em produção HTTPS?', options: ['sid=abc', 'sid=abc; Path=/; SameSite=None', '__Host-sid=abc; Path=/; Secure; HttpOnly; SameSite=Lax', 'sid=abc; Domain=exemplo.com'], answer: 2, explanation: '__Host-, Secure, HttpOnly e SameSite explícito.' }
  ]
};

export const project = {
  id: 'app-web-endurecida', name: 'App web endurecida: cinco vulnerabilidades provadas e corrigidas, em navegador real', lv: 'M', stack: 'Node.js, node:sqlite, node:test, Chrome (puppeteer-core), OWASP Cheat Sheets', ds: ['websec'],
  desc: 'Construa uma **aplicação web de demonstração em duas versões** (**vulnerável e corrigida**, **127.0.0.1, dados sintéticos**) com **SQL Injection, XSS, CSRF, CORS permissivo e SSRF**; para cada uma, **escreva o teste que prova o ataque e o que prova a defesa** (**HTTP e, onde preciso, em Chrome real**), implemente **as defesas em camadas** (**parâmetros e lista de permissão, escape e CSP, token e SameSite, lista de origens, validação de URL e IP**) e **produza o relatório com medições, limites e o que não foi coberto**.',
  rf: ['Aplicação em duas versões com os cinco vetores, em 127.0.0.1 e com dados sintéticos', 'Testes HTTP de ataque e defesa para cada vetor, com variantes ofuscadas para SSRF e XSS', 'Verificação em navegador real da execução de XSS, da leitura de cookies, do CSRF same-site e cross-site e da leitura via CORS', 'Defesas: consultas parametrizadas e allowlist de identificadores, escape de saída, CSP, cookies HttpOnly/SameSite, token anti-CSRF com JSON e Origin, CORS com lista exata, SSRF com allowlist, IP e redirecionamentos', 'Módulos reutilizáveis testados (escape, URL segura, validação CSRF, política CORS, validação SSRF)', 'Relatório com medições e comparações, e explicação de resultados inesperados', 'Seção de limites: o que não foi executado e por quê', 'Plano de regressão: testes executáveis no CI'],
  rnf: ['Escuta apenas em 127.0.0.1; nenhum alvo de terceiros', 'Sem dependências externas além do puppeteer-core para a parte de navegador', 'Código vulnerável identificado como não reutilizável', 'Testes reproduzíveis por comandos documentados'],
  ac: ['Cada ataque funciona na vulnerável e falha na corrigida', 'O relatório explica o sucesso do CSRF cross-site e do CORS lido, sem afirmar causas não verificadas', 'Os validadores de SSRF cobrem formas ofuscadas, esquemas e redirecionamentos', 'O CI executa os testes de ataque e defesa', 'O relatório declara os limites (DNS rebinding, outros navegadores, SQLi cega)'],
  ch: ['Adicionar um segundo navegador (Firefox) e comparar o CSRF cross-site', 'Medir o efeito isolado da CSP removendo o escape', 'Implementar SSRF com IP fixado na conexão contra DNS rebinding', 'Executar OWASP ZAP em modo baseline contra a versão vulnerável local']
};
