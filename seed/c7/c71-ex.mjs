// C7.1 — OWASP: exercícios, avaliação final e projeto. Medições: loja demo em duas versões (Node 26.13.1, 9 testes). Os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'owasp-01': [
  { id: 'owasp-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual categoria do OWASP Top 10:2025 cobre IDOR/BOLA e funções sem verificação de papel?', options: ['A05 Injection', 'A01 Broken Access Control', 'A04 Cryptographic Failures', 'A09 Logging'], answer: 1, explanation: 'A01 também incorpora SSRF e CSRF entre seus CWEs.' },
  { id: 'owasp-01-e2', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §autorizarAcesso(usuario, recurso, acao, politica)§ (negar por padrão). §usuario = { id, papel }§, §recurso = { donoId }§, §politica§ é uma lista de regras §{ papel, acao, escopo }§ com §escopo§ §"proprio"§ (só se §recurso.donoId === usuario.id§) ou §"todos"§. Devolva §{ permitido, motivo }§: §"permitido pela regra X"§ não é necessário — use §motivo§ §"regra"§ quando alguma regra aplicável permitir e §"negado por padrão"§ caso contrário.', lang: 'javascript', starter: 'function autorizarAcesso(usuario, recurso, acao, politica) {\n  // seu código aqui\n}\n', hints: ['Procure uma regra com o mesmo papel e a mesma ação.', 'Para escopo "proprio", compare o dono.'], tests: [{ name: 'dono e admin', code: R`const pol = [{ papel: 'usuario', acao: 'ler', escopo: 'proprio' }, { papel: 'admin', acao: 'ler', escopo: 'todos' }];
assert.equal(JSON.stringify(autorizarAcesso({ id: 1, papel: 'usuario' }, { donoId: 1 }, 'ler', pol)), '{"permitido":true,"motivo":"regra"}');
assert.equal(JSON.stringify(autorizarAcesso({ id: 1, papel: 'usuario' }, { donoId: 2 }, 'ler', pol)), '{"permitido":false,"motivo":"negado por padrão"}');
assert.equal(autorizarAcesso({ id: 3, papel: 'admin' }, { donoId: 2 }, 'ler', pol).permitido, true);` }, { name: 'ação não prevista', code: R`const pol = [{ papel: 'usuario', acao: 'ler', escopo: 'proprio' }];
assert.equal(autorizarAcesso({ id: 1, papel: 'usuario' }, { donoId: 1 }, 'apagar', pol).permitido, false);
assert.equal(autorizarAcesso({ id: 1, papel: 'visitante' }, { donoId: 1 }, 'ler', pol).permitido, false);
assert.equal(autorizarAcesso({ id: 1, papel: 'usuario' }, { donoId: 1 }, 'ler', []).motivo, 'negado por padrão');` }], solution: R`function autorizarAcesso(usuario, recurso, acao, politica) {
  const ok = politica.some((r) => r.papel === usuario.papel && r.acao === acao && (r.escopo === 'todos' || (r.escopo === 'proprio' && recurso.donoId === usuario.id)));
  return ok ? { permitido: true, motivo: 'regra' } : { permitido: false, motivo: 'negado por padrão' };
}`, explanation: 'É o modelo do BOLA/BFLA corrigido: sem regra explícita, nada.' },
  { id: 'owasp-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a medição do laboratório à categoria.', pairs: [['404 e 401 com mensagens diferentes', 'A07 Enumeração de usuários'], ['Pedido de outra pessoa lido (200)', 'A01 BOLA/IDOR'], ['UNION devolveu senhas', 'A05 Injeção'], ['Pilha de erro e x-powered-by', 'A02 Configuração insegura']], explanation: 'Resultados dos 9 testes.' },
  { id: 'owasp-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §limitadorDeTentativas(falhasMs, agoraMs, max, janelaMs)§: considere só as falhas com §agoraMs − t < janelaMs§. Devolva §{ bloqueado, restantes, retryAfterS }§: §bloqueado§ se as falhas recentes forem §>= max§; §restantes§ = §max(0, max − recentes)§; §retryAfterS§ = segundos (arredondados para cima) até a falha mais antiga sair da janela, quando bloqueado, ou 0.', lang: 'javascript', starter: 'function limitadorDeTentativas(falhasMs, agoraMs, max, janelaMs) {\n  // seu código aqui\n}\n', hints: ['Filtre as falhas recentes.', 'A mais antiga sai em t + janela.'], tests: [{ name: 'laboratório (5 por minuto)', code: R`const f = [0, 1000, 2000, 3000, 4000];
assert.equal(JSON.stringify(limitadorDeTentativas(f, 5000, 5, 60000)), '{"bloqueado":true,"restantes":0,"retryAfterS":55}');
assert.equal(JSON.stringify(limitadorDeTentativas(f.slice(0, 3), 5000, 5, 60000)), '{"bloqueado":false,"restantes":2,"retryAfterS":0}');` }, { name: 'janela expirada', code: R`assert.equal(JSON.stringify(limitadorDeTentativas([0, 1000, 2000, 3000, 4000], 62000, 5, 60000)), '{"bloqueado":false,"restantes":3,"retryAfterS":0}');
assert.equal(JSON.stringify(limitadorDeTentativas([], 0, 5, 60000)), '{"bloqueado":false,"restantes":5,"retryAfterS":0}');` }], solution: R`function limitadorDeTentativas(falhasMs, agoraMs, max, janelaMs) {
  const rec = falhasMs.filter((t) => agoraMs - t < janelaMs);
  const bloqueado = rec.length >= max;
  const restantes = Math.max(0, max - rec.length);
  const retry = bloqueado ? Math.ceil((Math.min(...rec) + janelaMs - agoraMs) / 1000) : 0;
  return { bloqueado, restantes, retryAfterS: retry };
}`, explanation: 'No laboratório: 5 falhas por minuto e depois 429.' },
  { id: 'owasp-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Escolha três categorias do Top 10:2025 e, para cada uma, descreva a falha vista na loja demo, o impacto e a correção. Diga o que o laboratório não cobriu.', model: 'A01 Broken Access Control: a vulnerável devolvia o pedido da Bia à Ana (200) por não checar o dono; o impacto é vazamento de dados de terceiros; a correção é autorização por objeto no servidor, centralizada, que devolveu 404. A05 Injection: a busca concatenava a entrada na consulta e um UNION extraiu as senhas (3 linhas); a correção é consulta parametrizada, que devolveu 0 linhas. A07 Authentication Failures: mensagens distintas permitiam enumerar contas, não havia limite de tentativas (401 x 8) e o token era previsível (token-3 virou admin); a correção são mensagens genéricas, bloqueio após 5 falhas (429), tokens aleatórios e registro de eventos (10 eventos). O laboratório não cobriu supply chain (A03), integridade (A08), design inseguro (A06) com modelagem de ameaças nem scanners.', rubric: ['Três categorias com falha, impacto e correção', 'Números medidos', 'Princípios (negar por padrão, parametrizar, mensagens genéricas)', 'O que não foi coberto'], explanation: 'Resumo da aula.' },
  { id: 'owasp-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §auditarSql(linhas)§: devolva os índices (0-based) das linhas de código que parecem montar SQL por concatenação ou interpolação: a linha contém uma palavra SQL (§select§, §insert§, §update§ ou §delete§, sem diferenciar maiúsculas) E (a sequência §${§ OU uma aspa seguida de §+§ ou §+§ seguido de aspa). Linhas com parâmetros (§?§) e sem concatenação não contam. Seja uma heurística de linter, não prova.', lang: 'javascript', starter: 'function auditarSql(linhas) {\n  // seu código aqui\n}\n', hints: ['Use duas expressões regulares.', 'A busca de ${ deve ser literal.'], tests: [{ name: 'linhas do laboratório', code: R`const L = [
  "db.prepare('select id from pedidos where item like ?').all(q)",
  "db.prepare(\"select id from pedidos where item like '%\" + q + \"%'\").all()",
  'const sql = §SELECT * FROM usuarios WHERE id = ' + '$' + '{id}§;',
  "console.log('atualizando cadastro')",
  "db.prepare('update usuarios set ' + campo + '=? where id=?')"
];
assert.equal(JSON.stringify(auditarSql(L)), '[1,2,4]');` }, { name: 'sem SQL', code: R`assert.equal(JSON.stringify(auditarSql(["x = 'a' + b", 'return 1'])), '[]');
assert.equal(JSON.stringify(auditarSql([])), '[]');` }], solution: R`function auditarSql(linhas) {
  const sql = /\b(select|insert|update|delete)\b/i;
  const conc = /(\$\{|['"]\s*\+|\+\s*['"])/;
  const out = [];
  linhas.forEach((l, i) => { if (sql.test(l) && conc.test(l)) out.push(i); });
  return out;
}`, explanation: 'Heurística: a linha 4 (nome de coluna concatenado) também merece revisão; ferramentas reais (Semgrep, CodeQL) analisam o fluxo de dados.' }
],
'owasp-02': [
  { id: 'owasp-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual risco do API Security Top 10:2023 é o número 1?', options: ['Broken Object Level Authorization', 'Injection', 'SSRF', 'Unsafe Consumption of APIs'], answer: 0, explanation: 'API1:2023 é BOLA.' },
  { id: 'owasp-02-e2', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §filtrarCampos(corpo, permitidos)§ (lista de permissão): devolva §{ aceitos, rejeitados }§, em que §aceitos§ é um objeto só com as chaves de §corpo§ presentes em §permitidos§ e §rejeitados§ é a lista (ordem de §corpo§) das chaves não permitidas. Não altere §corpo§.', lang: 'javascript', starter: 'function filtrarCampos(corpo, permitidos) {\n  // seu código aqui\n}\n', hints: ['Percorra Object.keys(corpo).', 'Use includes na lista de permitidos.'], tests: [{ name: 'papel é rejeitado', code: R`const c = { nome: 'Ana', papel: 'admin' };
assert.equal(JSON.stringify(filtrarCampos(c, ['nome'])), '{"aceitos":{"nome":"Ana"},"rejeitados":["papel"]}');
assert.equal(c.papel, 'admin');` }, { name: 'vazio e tudo permitido', code: R`assert.equal(JSON.stringify(filtrarCampos({}, ['nome'])), '{"aceitos":{},"rejeitados":[]}');
assert.equal(JSON.stringify(filtrarCampos({ a: 1, b: 2 }, ['a', 'b'])), '{"aceitos":{"a":1,"b":2},"rejeitados":[]}');
assert.equal(JSON.stringify(filtrarCampos({ x: 1 }, [])), '{"aceitos":{},"rejeitados":["x"]}');` }], solution: R`function filtrarCampos(corpo, permitidos) {
  const aceitos = {}, rejeitados = [];
  for (const k of Object.keys(corpo)) { if (permitidos.includes(k)) aceitos[k] = corpo[k]; else rejeitados.push(k); }
  return { aceitos, rejeitados };
}`, explanation: 'Mesmo princípio da correção do PATCH /perfil.' },
  { id: 'owasp-02-e3', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §paginar(limite, padrao, max)§: converta §limite§ para número; se não for finito, for menor que 1 ou vier vazio, use §padrao§; trunque para inteiro (§Math.floor§); limite o resultado a §max§. Devolva o inteiro.', lang: 'javascript', starter: 'function paginar(limite, padrao, max) {\n  // seu código aqui\n}\n', hints: ['Number("abc") é NaN.', 'Aplique o teto no final.'], tests: [{ name: 'laboratório', code: R`assert.equal(paginar('100000', 20, 50), 50);
assert.equal(paginar(undefined, 20, 50), 20);
assert.equal(paginar('10', 20, 50), 10);` }, { name: 'entradas ruins', code: R`assert.equal(paginar('abc', 20, 50), 20);
assert.equal(paginar('-5', 20, 50), 20);
assert.equal(paginar('0', 20, 50), 20);
assert.equal(paginar('7.9', 20, 50), 7);
assert.equal(paginar('', 20, 50), 20);
assert.equal(paginar('Infinity', 20, 50), 20);` }], solution: R`function paginar(limite, padrao, max) {
  const n = Number(limite);
  if (limite === undefined || limite === '' || !Number.isFinite(n) || n < 1) return Math.min(padrao, max);
  return Math.min(Math.floor(n), max);
}`, explanation: 'Evita limite=100000 (300 linhas na vulnerável, 50 na corrigida).' },
  { id: 'owasp-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §projetar(objeto, campos)§: devolva §{ publico, omitidosSensiveis }§; §publico§ contém só as chaves listadas em §campos§ (se existirem no objeto); §omitidosSensiveis§ é a lista ordenada de chaves do objeto que casam com §/senha|token|secret|segredo/i§ e NÃO foram incluídas em §campos§.', lang: 'javascript', starter: 'function projetar(objeto, campos) {\n  // seu código aqui\n}\n', hints: ['Primeiro monte o objeto público.', 'Depois detecte as chaves sensíveis ausentes dele.'], tests: [{ name: 'linha de usuário', code: R`const u = { id: 1, nome: 'Ana', email: 'a@x.test', senha: 'x', papel: 'usuario', apiToken: 't' };
assert.equal(JSON.stringify(projetar(u, ['id', 'nome', 'email'])), '{"publico":{"id":1,"nome":"Ana","email":"a@x.test"},"omitidosSensiveis":["apiToken","senha"]}');` }, { name: 'sem sensíveis', code: R`assert.equal(JSON.stringify(projetar({ id: 1, nome: 'B' }, ['id', 'nome', 'x'])), '{"publico":{"id":1,"nome":"B"},"omitidosSensiveis":[]}');
assert.equal(JSON.stringify(projetar({ senha: 's' }, ['senha'])), '{"publico":{"senha":"s"},"omitidosSensiveis":[]}');` }], solution: R`function projetar(objeto, campos) {
  const publico = {};
  for (const c of campos) if (c in objeto) publico[c] = objeto[c];
  const omitidosSensiveis = Object.keys(objeto).filter((k) => /senha|token|secret|segredo/i.test(k) && !(k in publico)).sort();
  return { publico, omitidosSensiveis };
}`, explanation: 'DTOs de saída evitam devolver a linha inteira do banco (a senha vazou em /admin/usuarios).' },
  { id: 'owasp-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Faça a revisão de segurança de uma rota PATCH /usuarios/{id} que atualiza o perfil, usando o checklist de rotas de API e os riscos BOLA, BOPLA, BFLA e consumo de recursos.', model: 'Quem pode chamar: exigir autenticação com token aleatório e expiração. O que pode fazer e com quais objetos: verificar no servidor que {id} é o próprio usuário (BOLA) ou que o papel admin tem permissão explícita (BFLA), negando por padrão. Quais campos: aceitar só uma lista de permissão (nome, telefone) e rejeitar papel, email verificado ou saldo (BOPLA, atribuição em massa), com esquema de entrada que recusa campos desconhecidos, e devolver um DTO sem campos sensíveis. Quanto: limite de tamanho do corpo e de taxa por usuário com 429. Erros: respostas genéricas com id de correlação. Registro: logar tentativas negadas e alertar varreduras de ids. Inventário: documentar a rota no OpenAPI. Testar com a matriz de autorização no CI.', rubric: ['BOLA e BFLA', 'Lista de campos permitidos', 'Limites e erros genéricos', 'Registro e testes'], explanation: 'Resumo da aula.' },
  { id: 'owasp-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §detectarVarredura(registros, limite)§: §registros§ é uma lista de §{ usuario, status }§. Devolva a lista, ordenada alfabeticamente, de usuários com §limite§ ou mais respostas de status 403 ou 404 (possível varredura de ids/BOLA). Mostra o valor do registro de eventos (A09).', lang: 'javascript', starter: 'function detectarVarredura(registros, limite) {\n  // seu código aqui\n}\n', hints: ['Conte por usuário apenas 403 e 404.', 'Ordene o resultado.'], tests: [{ name: 'varredura', code: R`const r = [];
for (let i = 0; i < 6; i++) r.push({ usuario: 'mallory', status: 404 });
r.push({ usuario: 'ana', status: 200 }, { usuario: 'ana', status: 404 }, { usuario: 'bia', status: 403 }, { usuario: 'bia', status: 403 });
assert.equal(JSON.stringify(detectarVarredura(r, 5)), '["mallory"]');
assert.equal(JSON.stringify(detectarVarredura(r, 2)), '["bia","mallory"]');` }, { name: 'sem registros', code: R`assert.equal(JSON.stringify(detectarVarredura([], 3)), '[]');
assert.equal(JSON.stringify(detectarVarredura([{ usuario: 'x', status: 200 }, { usuario: 'x', status: 500 }], 1)), '[]');` }], solution: R`function detectarVarredura(registros, limite) {
  const c = {};
  for (const r of registros) if (r.status === 403 || r.status === 404) c[r.usuario] = (c[r.usuario] || 0) + 1;
  return Object.keys(c).filter((u) => c[u] >= limite).sort();
}`, explanation: 'Um alerta simples sobre muitos 403/404 pega varreduras de ids.' }
]
};

const P = 'owasp-p';
export const assessment = {
  id: 'owasp', title: 'Avaliação final — OWASP: Top 10 e API Security', passPct: 70, minutes: 40,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'O OWASP Top 10 é melhor descrito como:', options: ['Norma de conformidade obrigatória', 'Documento de conscientização sobre os riscos mais críticos', 'Ferramenta de varredura', 'Lista completa de todas as vulnerabilidades'], answer: 1, explanation: 'Para verificação use o ASVS.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Em 2025, o SSRF foi incorporado à categoria A01 Broken Access Control.', answer: true, explanation: 'CWE-918 consta entre os CWEs do A01:2025.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Força bruta no laboratório (8 tentativas erradas).', code: 'vulnerável: 401,401,401,401,401,401,401,401\ncorrigida:  401,401,401,401,401,429,429,429', lang: 'text', steps: [{ q: 'Quantas tentativas a corrigida bloqueou (429)?', answers: ['3'] }, { q: 'A partir de qual tentativa (número) começou o bloqueio?', answers: ['6'] }], explanation: 'Limite de 5 falhas por minuto.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que a corrigida responde 404 (e não 403) ao pedido de outra pessoa?', options: ['Por erro', 'Para não confirmar que o recurso existe', 'Porque 403 não existe', 'Para acelerar a resposta'], answer: 1, explanation: 'Evita enumeração de recursos.' },
    { id: P + '5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a correção da injeção SQL.', code: "db.prepare('select id, item from pedidos where item like [[0]]').all('%' + q + '%')", answers: [['?']], explanation: 'Parâmetro em vez de concatenação.' },
    { id: P + '6', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que permite atribuição em massa.', code: "app.patch('/perfil', (req, res) => {\n  const eu = usuarioAtual(req);\n  atualizar(eu.id, req.body);\n  res.json(carregar(eu.id));\n});", answer: 3, explanation: 'O corpo inteiro é gravado; use lista de campos permitidos.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o risco de API ao exemplo.', pairs: [['BOLA', 'Ler pedido de outro usuário trocando o id'], ['BOPLA', 'Enviar papel=admin no perfil'], ['BFLA', 'Usuário comum chamando /admin/usuarios'], ['Consumo irrestrito', 'limite=100000 sem teto']], explanation: 'Medições da aula 2.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'O que o teste de segurança deve provar?', options: ['Só que o ataque funciona', 'Que o ataque funciona na versão vulnerável e falha na corrigida', 'Que o código compila', 'Que o log existe'], answer: 1, explanation: 'Evita regressões da correção.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'O laboratório executou scanners como OWASP ZAP e análise de dependências.', answer: false, explanation: 'Não: foram 9 testes próprios; scanners e supply chain não foram executados.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual princípio resume a correção de BOLA, BFLA e BOPLA?', options: ['Confiar no cliente', 'Negar por padrão e decidir no servidor', 'Usar ids longos', 'Esconder a API'], answer: 1, explanation: 'Autorização explícita no servidor.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Desenhe um plano de auditoria OWASP para uma API de pedidos: escopo, categorias a verificar, método, evidências, priorização e relatório. O que o curso executou e o que não?', model: 'Escopo: inventário das rotas e dos papéis. Verificar A01/API1/API3/API5 com uma matriz de autorização (cada rota com cada papel e objeto próprio e alheio), A07/API2 (mensagens, limites, tokens), A05 (consultas parametrizadas, linter e revisão), A02/A10 (erros e cabeçalhos), A04 (armazenamento de senhas), API4 (limites), A09 (logs e alertas de falhas) e A03 (dependências). Método: revisão de código, testes automatizados que provam ataque e defesa e, quando autorizado, varredura dinâmica. Evidências: requisições e respostas, saídas de teste. Priorização por probabilidade x impacto x custo, com ASVS para requisitos. Relatório com achado, prova, impacto, correção e teste de regressão. O curso executou 9 testes na loja demo; não executou scanners, análise de dependências nem gateway.', rubric: ['Escopo e matriz de autorização', 'Categorias verificadas', 'Priorização', 'Honestidade sobre o executado'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que UUIDs não eliminam o risco de BOLA?', options: ['Porque são lentos', 'Porque dificultam adivinhar, mas a verificação de propriedade continua necessária', 'Porque não existem em SQL', 'Porque são criptografados'], answer: 1, explanation: 'Ids vazam em logs, e-mails e respostas.' }
  ]
};

export const project = {
  id: 'auditoria-owasp', name: 'Auditoria OWASP: vulnerabilidades provadas e corrigidas em uma API demo', lv: 'M', stack: 'Node.js, node:test, node:sqlite, OWASP Top 10:2025, API Security Top 10:2023', ds: ['owasp'],
  desc: 'Faça a **auditoria de uma API de demonstração própria** (**dados sintéticos, apenas em 127.0.0.1**): escreva **uma versão com falhas deliberadas** e **uma corrigida** e, para **pelo menos seis categorias** do **Top 10:2025** e do **API Security Top 10:2023** (**BOLA, BOPLA, BFLA, injeção, autenticação, configuração, consumo de recursos, registro**), **crie testes que provam o ataque na primeira e a defesa na segunda**; monte a **matriz de autorização**, o **relatório** (**achado, prova, impacto, correção, teste de regressão**) e a **priorização por risco**, **declarando o que não foi coberto**.',
  rf: ['API demo em duas versões com o mesmo contrato HTTP e dados sintéticos', 'Seis ou mais categorias com teste de ataque (vulnerável) e teste de defesa (corrigida)', 'Matriz de autorização de rotas x papéis x objetos com resultados esperados e obtidos', 'Autenticação com mensagens genéricas, limite de tentativas e registro de eventos', 'Respostas por DTO e lista de campos permitidos nas escritas', 'Relatório com achados, evidências, impacto, correção e priorização por risco', 'Mapeamento de cada achado para categorias OWASP e para requisitos ASVS', 'Seção de limites: o que não foi auditado (supply chain, integridade, scanners)'],
  rnf: ['Escuta apenas em 127.0.0.1 e dados sintéticos', 'Sem dependências externas ou versões fixadas', 'Testes reproduzíveis por um comando', 'Código vulnerável identificado como não reutilizável'],
  ac: ['Cada teste de ataque passa na vulnerável e falha na corrigida', 'A matriz de autorização é executada no CI e cobre todos os papéis', 'O relatório prioriza achados com probabilidade e impacto', 'Nenhum alvo externo é usado', 'O relatório informa o que não foi executado'],
  ch: ['Rodar OWASP ZAP em modo baseline contra a versão vulnerável local e comparar com os testes', 'Adicionar verificação de dependências e SBOM', 'Escrever requisitos ASVS verificáveis para cada achado', 'Modelar ameaças com STRIDE antes de implementar a versão corrigida']
};
