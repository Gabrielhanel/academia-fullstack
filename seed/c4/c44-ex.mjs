// C4.4 — Autenticação e autorização: exercícios, avaliação final e projeto.
// Medições reais em Node.js 26.13.1, express-session 1.19.0, jose 6.2.18, argon2 0.45.2, bcryptjs 3.0.3 (laboratório); os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsets = {
'aut-01': [
  { id: 'aut-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual atributo de cookie impede que o JavaScript da página leia o cookie de sessão?', options: ['Secure', 'HttpOnly', 'SameSite', 'Path'], answer: 1, explanation: 'HttpOnly mitiga o roubo do cookie por XSS.' },
  { id: 'aut-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: depois do logout, reutilizar o cookie antigo ainda era aceito pelo servidor.', answer: false, explanation: 'A sessão foi destruída no servidor (1 → 0) e o cookie antigo recebeu 401.' },
  { id: 'aut-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o ataque à defesa.', pairs: [['Fixação de sessão', 'Regenerar o id no login'], ['CSRF', 'SameSite e token CSRF'], ['Roubo do cookie por XSS', 'HttpOnly'], ['Interceptação na rede', 'Secure e HTTPS']], explanation: 'Defesas em camadas.' },
  { id: 'aut-01-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §estadoSessao(s, limites, agora)§. §s§ é §{ criada, ultimoAcesso }§ (ms), §limites§ é §{ ociosaMs, absolutaMs }§. Devolva §"absoluta"§ se §agora - s.criada > absolutaMs§; senão §"ociosa"§ se §agora - s.ultimoAcesso > ociosaMs§; senão §"ok"§ (a expiração absoluta vem primeiro).', lang: 'javascript', starter: 'function estadoSessao(s, limites, agora) {\n  // seu código aqui\n}\n', hints: ['Compare as duas diferenças com os limites.', 'Verifique a absoluta antes da ociosa.'], tests: [{ name: 'estados', code: R`const lim = { ociosaMs: 1800000, absolutaMs: 28800000 };
assert.equal(estadoSessao({ criada: 0, ultimoAcesso: 1000 }, lim, 2000), 'ok');
assert.equal(estadoSessao({ criada: 0, ultimoAcesso: 1000 }, lim, 1000 + 1800001), 'ociosa');` }, { name: 'absoluta primeiro', code: R`const lim = { ociosaMs: 1800000, absolutaMs: 28800000 };
assert.equal(estadoSessao({ criada: 0, ultimoAcesso: 28800000 }, lim, 28800001), 'absoluta');
assert.equal(estadoSessao({ criada: 0, ultimoAcesso: 28000000 }, lim, 28900000), 'absoluta');` }], solution: R`function estadoSessao(s, limites, agora) {
  if (agora - s.criada > limites.absolutaMs) return 'absoluta';
  if (agora - s.ultimoAcesso > limites.ociosaMs) return 'ociosa';
  return 'ok';
}`, explanation: 'Sessões devem ter expiração ociosa e absoluta.' },
  { id: 'aut-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare sessão com estado no servidor e token autocontido quanto à revogação, escala e armazenamento no cliente.', model: 'A sessão guarda o estado no servidor: a revogação é imediata (medido: o cookie antigo deu 401 após o logout), mas exige armazenamento compartilhado para escalar. O token autocontido (JWT) é validado pela assinatura sem consulta, escala bem e serve a APIs e mobile, porém só expira no prazo, exigindo tokens curtos, refresh e lista de revogação; no cliente, o cookie HttpOnly é preferível ao localStorage, exposto a XSS.', rubric: ['Revogação da sessão', 'Escala do token', 'Necessidade de tokens curtos ou lista de revogação', 'Armazenamento no cliente'], explanation: 'Escolha pelo contexto.' },
  { id: 'aut-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §setCookie(c)§, que monta o cabeçalho §Set-Cookie§. §c§ = §{ nome, valor, path?, maxAge?, httpOnly?, secure?, sameSite? }§. Formato: §nome=valor§, depois §; Path=<path>§ (padrão §/§), §; Max-Age=<n>§ se houver, §; HttpOnly§ se verdadeiro, §; Secure§ se verdadeiro, §; SameSite=<valor>§ se houver. Lance §Error("SameSite=None exige Secure")§ se §sameSite§ for §"None"§ sem §secure§.', lang: 'javascript', starter: 'function setCookie(c) {\n  // seu código aqui\n}\n', hints: ['Monte uma lista de partes e junte com "; ".', 'Valide a combinação None + Secure primeiro.'], tests: [{ name: 'formato', code: R`assert.equal(setCookie({ nome: 'sid', valor: 'abc', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 1800 }), 'sid=abc; Path=/; Max-Age=1800; HttpOnly; Secure; SameSite=Lax');
assert.equal(setCookie({ nome: 'a', valor: '1' }), 'a=1; Path=/');` }, { name: 'regra do None', code: R`assert.throws(() => setCookie({ nome: 'a', valor: '1', sameSite: 'None' }), 'SameSite=None exige Secure');
assert.equal(setCookie({ nome: 'a', valor: '1', sameSite: 'None', secure: true, path: '/api' }), 'a=1; Path=/api; Secure; SameSite=None');` }], solution: R`function setCookie(c) {
  if (c.sameSite === 'None' && !c.secure) throw new Error('SameSite=None exige Secure');
  const partes = [c.nome + '=' + c.valor, 'Path=' + (c.path ?? '/')];
  if (c.maxAge !== undefined) partes.push('Max-Age=' + c.maxAge);
  if (c.httpOnly) partes.push('HttpOnly');
  if (c.secure) partes.push('Secure');
  if (c.sameSite) partes.push('SameSite=' + c.sameSite);
  return partes.join('; ');
}`, explanation: 'Os atributos definem a segurança do cookie.' }
],
'aut-02': [
  { id: 'aut-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O payload de um JWT assinado é confidencial?', options: ['Sim, é criptografado', 'Não: é apenas base64url, legível por qualquer um', 'Só se usar HS256', 'Só se usar RS256'], answer: 1, explanation: 'A assinatura dá integridade, não confidencialidade; medido: o payload apareceu em texto claro.' },
  { id: 'aut-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: um token com alg=none foi recusado pelo jose com ERR_JOSE_NOT_SUPPORTED.', answer: true, explanation: 'Mesmo assim, fixe os algoritmos na verificação.' },
  { id: 'aut-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o erro do jose à causa.', pairs: [['ERR_JWT_EXPIRED', 'Token vencido'], ['ERR_JWT_CLAIM_VALIDATION_FAILED', 'iss ou aud diferentes do esperado'], ['ERR_JWS_SIGNATURE_VERIFICATION_FAILED', 'Payload ou assinatura adulterados'], ['ERR_JWKS_NO_MATCHING_KEY', 'kid sem chave correspondente no JWKS']], explanation: 'Códigos medidos.' },
  { id: 'aut-02-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Tamanhos medidos dos tokens com os mesmos claims.', code: 'HS256: 293 bytes\nEdDSA: 336 bytes\nRS256: 592 bytes', lang: 'text', steps: [{ q: 'Qual algoritmo gerou o maior token?', answers: ['RS256', 'rs256'] }, { q: 'Qual algoritmo assina mais devagar (mediana de ~3,4 ms)?', answers: ['RS256', 'rs256'] }], explanation: 'RSA gera assinaturas maiores e assina mais devagar; verifica rápido.' },
  { id: 'aut-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva o ataque de confusão de algoritmo e como bloqueá-lo.', model: 'O servidor espera RS256 e o atacante envia um token HS256 assinado usando a chave pública (que é pública) como segredo HMAC; se a biblioteca aceitar o algoritmo do cabeçalho, ela verifica com a chave pública como segredo e aceita. Bloqueia-se fixando os algoritmos permitidos na verificação (medido: ERR_JOSE_ALG_NOT_ALLOWED) e usando chaves do tipo correto (a chave RSA foi recusada para HS256).', rubric: ['Descreve o ataque', 'Cita a chave pública como segredo', 'Cita a lista de algoritmos', 'Cita o tipo da chave'], explanation: 'RFC 8725.' },
  { id: 'aut-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarClaims(p, esperado, agora, tolerancia)§ (§agora§ e §exp§ em segundos). Devolva um código de erro ou §null§, nesta ordem: §p.exp§ ausente → §"ERR_NO_EXP"§; §agora > p.exp + tolerancia§ → §"ERR_JWT_EXPIRED"§; §p.iss !== esperado.iss§ → §"ERR_ISS"§; §esperado.aud§ não presente em §p.aud§ (texto ou lista) → §"ERR_AUD"§; senão §null§.', lang: 'javascript', starter: 'function validarClaims(p, esperado, agora, tolerancia) {\n  // seu código aqui\n}\n', hints: ['p.aud pode ser texto ou lista.', 'Siga a ordem do enunciado.'], tests: [{ name: 'ordem', code: R`const esp = { iss: 'https://auth', aud: 'api' };
assert.equal(validarClaims({ iss: 'https://auth', aud: 'api' }, esp, 100, 0), 'ERR_NO_EXP');
assert.equal(validarClaims({ iss: 'x', aud: 'y', exp: 50 }, esp, 100, 0), 'ERR_JWT_EXPIRED');
assert.equal(validarClaims({ iss: 'x', aud: 'y', exp: 500 }, esp, 100, 0), 'ERR_ISS');
assert.equal(validarClaims({ iss: 'https://auth', aud: 'outra', exp: 500 }, esp, 100, 0), 'ERR_AUD');` }, { name: 'tolerância e aud em lista', code: R`const esp = { iss: 'https://auth', aud: 'api' };
assert.equal(validarClaims({ iss: 'https://auth', aud: ['web', 'api'], exp: 40 }, esp, 100, 60), null);
assert.equal(validarClaims({ iss: 'https://auth', aud: 'api', exp: 40 }, esp, 100, 59), 'ERR_JWT_EXPIRED');` }], solution: R`function validarClaims(p, esperado, agora, tolerancia) {
  if (p.exp === undefined) return 'ERR_NO_EXP';
  if (agora > p.exp + tolerancia) return 'ERR_JWT_EXPIRED';
  if (p.iss !== esperado.iss) return 'ERR_ISS';
  const auds = Array.isArray(p.aud) ? p.aud : [p.aud];
  if (!auds.includes(esperado.aud)) return 'ERR_AUD';
  return null;
}`, explanation: 'As validações de claims que o jose faz.' }
],
'aut-03': [
  { id: 'aut-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual a primeira escolha para armazenar senhas, segundo a OWASP?', options: ['SHA-256 com sal', 'MD5 com pimenta', 'Argon2id', 'Base64'], answer: 2, explanation: 'Argon2id, com scrypt, bcrypt e PBKDF2 como alternativas.' },
  { id: 'aut-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o bcrypt verificou como igual duas senhas que diferiam apenas depois do byte 72.', answer: true, explanation: 'O bcrypt trunca a entrada em 72 bytes.' },
  { id: 'aut-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o valor medido à função (por núcleo, mediana).', pairs: [['~78 mil palpites/s', 'SHA-256 simples'], ['~4 palpites/s', 'argon2id com 64 MiB, t=3, p=4'], ['~1.437 ms por hash', 'bcrypt com custo 12'], ['~370 ms por hash', 'scrypt N=2^15, r=8, p=1']], explanation: 'Medições do laboratório.' },
  { id: 'aut-03-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Dois hashes argon2id da mesma senha.', code: 'h1 === h2 ?\nargon2.verify(h1, senha) ?\nargon2.verify(h2, senha) ?', lang: 'text', steps: [{ q: 'h1 é igual a h2 (true ou false)?', answers: ['false'] }, { q: 'Ambos verificam a senha (true ou false)?', answers: ['true'] }], explanation: 'O sal aleatório torna os hashes diferentes.' },
  { id: 'aut-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como migrar de bcrypt custo 10 para argon2id sem forçar os usuários a trocar a senha?', model: 'No login bem-sucedido, a senha em texto está disponível: verifica-se com o hash antigo (o formato do hash identifica o algoritmo) e, se o algoritmo ou os parâmetros estão abaixo da política (needsRehash), gera-se um novo hash argon2id e grava-se. Para usuários que não entram, pode-se envolver o hash antigo em argon2 e marcar a versão. Limita-se a taxa de login para evitar a negação de serviço pelo custo.', rubric: ['Rehash no login', 'Identifica o algoritmo pelo formato', 'Cita a opção de envolver hashes legados', 'Cita o custo no login'], explanation: 'Migração gradual.' },
  { id: 'aut-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §precisaRehash(hash, politica)§. §hash§ é um texto no formato §$argon2id$v=19$m=65536,t=3,p=4$<sal>$<hash>§; §politica§ é §{ m, t, p }§. Devolva §true§ se o algoritmo não for §argon2id§ (por exemplo §$2b$§ do bcrypt) ou se §m§, §t§ ou §p§ do hash forem menores que os da política; senão §false§.', lang: 'javascript', starter: 'function precisaRehash(hash, politica) {\n  // seu código aqui\n}\n', hints: ['Separe o texto por "$".', 'Os parâmetros ficam em "m=...,t=...,p...".'], tests: [{ name: 'argon2', code: R`const pol = { m: 65536, t: 3, p: 4 };
assert.equal(precisaRehash('$argon2id$v=19$m=65536,t=3,p=4$c2Fs$aGFzaA', pol), false);
assert.equal(precisaRehash('$argon2id$v=19$m=19456,t=2,p=1$c2Fs$aGFzaA', pol), true);
assert.equal(precisaRehash('$argon2id$v=19$m=131072,t=3,p=4$c2Fs$aGFzaA', pol), false);` }, { name: 'outros algoritmos', code: R`const pol = { m: 65536, t: 3, p: 4 };
assert.equal(precisaRehash('$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234', pol), true);
assert.equal(precisaRehash('$argon2i$v=19$m=65536,t=3,p=4$c2Fs$aGFzaA', pol), true);
assert.equal(precisaRehash('$argon2id$v=19$m=65536,t=2,p=4$c2Fs$aGFzaA', pol), true);` }], solution: R`function precisaRehash(hash, politica) {
  const partes = hash.split('$');
  if (partes[1] !== 'argon2id') return true;
  const par = Object.fromEntries(partes[3].split(',').map((x) => x.split('=')));
  return Number(par.m) < politica.m || Number(par.t) < politica.t || Number(par.p) < politica.p;
}`, explanation: 'É o needsRehash do argon2.' }
],
'aut-04': [
  { id: 'aut-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o PKCE impede?', options: ['XSS', 'A troca de um código de autorização interceptado sem o code_verifier', 'Injeção de SQL', 'O uso de HTTP'], answer: 1, explanation: 'Medido: um verifier errado resultou em invalid_grant.' },
  { id: 'aut-04-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: reutilizar o mesmo código de autorização na troca por tokens funciona uma segunda vez.', answer: false, explanation: 'O código é de uso único: invalid_grant.' },
  { id: 'aut-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o token à audiência/uso.', pairs: [['id_token', 'Cliente (aud = client_id): quem é o usuário'], ['Access token', 'API (aud = a API) com escopos'], ['Refresh token', 'Servidor de autorização para renovar'], ['state', 'Associa a resposta ao pedido (anti-CSRF)']], explanation: 'Três tokens, três audiências.' },
  { id: 'aut-04-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Rotação de refresh token medida.', code: 'usar rt1 -> 200, novo rt2\nreusar rt1 -> ?\nusar rt2 -> ?', lang: 'text', steps: [{ q: 'O que acontece ao reusar o rt1 (código de erro)?', answers: ['invalid_grant'] }, { q: 'O rt2 legítimo ainda funciona depois do reuso (sim ou não)?', answers: ['não', 'nao'] }], explanation: 'O reuso revoga a família inteira.' },
  { id: 'aut-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a diferença entre OAuth 2.0 e OpenID Connect e por que usar iss+sub como identidade.', model: 'OAuth 2.0 é autorização delegada: o access token diz o que o portador pode fazer, não quem é. O OpenID Connect acrescenta o id_token assinado com claims de autenticação (iss, sub, aud, exp, nonce). O sub é estável apenas dentro do emissor, então a identidade é o par iss+sub; o e-mail pode mudar, ser reutilizado ou não ser verificado, permitindo a tomada de contas.', rubric: ['Diferencia autorização e autenticação', 'Cita o id_token e os claims', 'Cita iss+sub', 'Cita o risco do e-mail'], explanation: 'Resumo da aula.' },
  { id: 'aut-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §renovar(loja, token, gerar)§ com rotação e detecção de reuso. §loja§ é um §Map§ token → §{ familia, usado }§. Token desconhecido → §{ ok: false, motivo: "invalido" }§. Token já usado → revogue (apague) todos os tokens da mesma §familia§ e devolva §{ ok: false, motivo: "reuso" }§. Senão marque §usado = true§, crie §novo = gerar()§ na mesma família (§usado: false§) e devolva §{ ok: true, novo }§.', lang: 'javascript', starter: 'function renovar(loja, token, gerar) {\n  // seu código aqui\n}\n', hints: ['Percorra a loja para apagar a família.', 'Não esqueça de marcar o token antigo como usado.'], tests: [{ name: 'rotação normal', code: R`const loja = new Map([['rt1', { familia: 'F', usado: false }]]); let n = 1; const gerar = () => 'rt' + (++n);
const r = renovar(loja, 'rt1', gerar);
assert.equal(JSON.stringify(r), '{"ok":true,"novo":"rt2"}');
assert.equal(loja.get('rt1').usado, true);
assert.equal(loja.get('rt2').usado, false);` }, { name: 'reuso e inválido', code: R`const loja = new Map([['rt1', { familia: 'F', usado: false }], ['outro', { familia: 'G', usado: false }]]); let n = 1; const gerar = () => 'rt' + (++n);
renovar(loja, 'rt1', gerar);
const r = renovar(loja, 'rt1', gerar);
assert.equal(JSON.stringify(r), '{"ok":false,"motivo":"reuso"}');
assert.equal(loja.has('rt2'), false);
assert.equal(loja.has('outro'), true);
assert.equal(JSON.stringify(renovar(loja, 'nada', gerar)), '{"ok":false,"motivo":"invalido"}');` }], solution: R`function renovar(loja, token, gerar) {
  const r = loja.get(token);
  if (!r) return { ok: false, motivo: 'invalido' };
  if (r.usado) {
    for (const [k, v] of [...loja]) if (v.familia === r.familia) loja.delete(k);
    return { ok: false, motivo: 'reuso' };
  }
  r.usado = true;
  const novo = gerar();
  loja.set(novo, { familia: r.familia, usado: false });
  return { ok: true, novo };
}`, explanation: 'Rotação com revogação da família.' }
],
'aut-05': [
  { id: 'aut-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual falha permite que um usuário autenticado leia pedidos de outros trocando o id?', options: ['XSS', 'BOLA/IDOR', 'CSRF', 'Injeção de SQL'], answer: 1, explanation: 'Falta de verificação de propriedade do objeto.' },
  { id: 'aut-05-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Usar UUIDs como ids dispensa a verificação de propriedade do recurso.', answer: false, explanation: 'Ids não adivinháveis ajudam, mas segurança por obscuridade não substitui a autorização.' },
  { id: 'aut-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o resultado medido ao cenário.', pairs: [['36 decisões', '4 usuários × 3 pedidos × 3 ações'], ['9', 'Decisões em que RBAC permite e ABAC nega'], ['6', 'Acessos de clientes a pedidos alheios que o RBAC puro permitiria'], ['false', 'Visitante com papel desconhecido']], explanation: 'Matriz do laboratório.' },
  { id: 'aut-05-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que causa o IDOR.', code: 'app.get("/pedidos/:id", async (req, res) => {\n  const { rows: [p] } = await db.query("select * from pedidos where id = $1", [req.params.id]);\n  if (!p) return res.sendStatus(404);\n  res.json(p);\n});', answer: 2, explanation: 'A consulta não restringe ao dono; use "and cliente_id = $2" com o usuário autenticado.' },
  { id: 'aut-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Combine RBAC e ABAC para um sistema de pedidos e explique como testar.', model: 'O RBAC define, por papel, as ações possíveis (cliente lê e edita pedido; gerente também vê relatório; admin tudo). O ABAC restringe o objeto: o cliente só o próprio pedido e só edita se estiver aberto; o gerente só a própria loja; admin sem restrição; papel desconhecido é negado. Testa-se com uma matriz usuário × recurso × ação com resultados esperados, incluindo casos negativos e IDOR, executada no CI.', rubric: ['RBAC para a ação', 'ABAC para o objeto', 'Negar por padrão', 'Matriz de testes com casos negativos'], explanation: 'Como no laboratório.' },
  { id: 'aut-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §permitir(u, acao, rec, papeis)§. §papeis§ mapeia papel → lista de ações. Nega (§false§) se o papel não conceder a ação. §admin§ → §true§. §gerente§ → §rec.loja === u.loja§. §cliente§ → §rec.donoId === u.id§ e, se a ação for §"editar"§, §rec.status === "aberto"§. Qualquer outro papel → §false§.', lang: 'javascript', starter: 'function permitir(u, acao, rec, papeis) {\n  // seu código aqui\n}\n', hints: ['Primeiro confira o papel e a ação.', 'Trate cada papel separadamente e termine com false.'], tests: [{ name: 'papéis', code: R`const papeis = { admin: ['ler', 'editar', 'apagar'], gerente: ['ler', 'editar'], cliente: ['ler', 'editar'] };
const rec = { donoId: 1, loja: 'POA', status: 'aberto' };
assert.equal(permitir({ id: 1, papel: 'cliente' }, 'ler', rec, papeis), true);
assert.equal(permitir({ id: 2, papel: 'cliente' }, 'ler', rec, papeis), false);
assert.equal(permitir({ id: 3, papel: 'gerente', loja: 'POA' }, 'editar', rec, papeis), true);
assert.equal(permitir({ id: 3, papel: 'gerente', loja: 'SP' }, 'ler', rec, papeis), false);` }, { name: 'estado e padrão', code: R`const papeis = { admin: ['ler', 'editar', 'apagar'], gerente: ['ler', 'editar'], cliente: ['ler', 'editar'] };
assert.equal(permitir({ id: 1, papel: 'cliente' }, 'editar', { donoId: 1, status: 'pago' }, papeis), false);
assert.equal(permitir({ id: 1, papel: 'cliente' }, 'apagar', { donoId: 1, status: 'aberto' }, papeis), false);
assert.equal(permitir({ id: 4, papel: 'admin' }, 'apagar', { donoId: 9 }, papeis), true);
assert.equal(permitir({ id: 9, papel: 'visitante' }, 'ler', { donoId: 9 }, papeis), false);` }], solution: R`function permitir(u, acao, rec, papeis) {
  if (!(papeis[u.papel] || []).includes(acao)) return false;
  if (u.papel === 'admin') return true;
  if (u.papel === 'gerente') return rec.loja === u.loja;
  if (u.papel === 'cliente') return rec.donoId === u.id && (acao !== 'editar' || rec.status === 'aberto');
  return false;
}`, explanation: 'RBAC para a ação, ABAC para o objeto, negar por padrão.' }
],
'aut-06': [
  { id: 'aut-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual fator de MFA é considerado mais fraco entre os citados?', options: ['TOTP em aplicativo', 'Chave de segurança FIDO2', 'SMS', 'Passkey'], answer: 2, explanation: 'SMS sofre com troca de SIM e interceptação; prefira app, chave ou passkey.' },
  { id: 'aut-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'No laboratório, as 6 saídas do TOTP conferiram com os vetores de teste da RFC 6238.', answer: true, explanation: 'Validar com vetores oficiais é a forma correta de conferir uma implementação.' },
  { id: 'aut-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o termo à definição.', pairs: [['SSO', 'Um login para várias aplicações via IdP'], ['SCIM', 'Provisionamento automático de identidades'], ['Step-up', 'Autenticação mais forte para ação sensível'], ['WebAuthn', 'Credenciais de chave pública resistentes a phishing']], explanation: 'Vocabulário de identidade.' },
  { id: 'aut-06-e4', type: 'trace', difficulty: 3, points: 10, prompt: 'Verificação TOTP com janela ±1 medida.', code: 'código do passo atual -> aceito\nmesmo código de novo -> ?\ncódigo de 90 s atrás -> ?', lang: 'text', steps: [{ q: 'O mesmo código de novo foi aceito (sim ou não)?', answers: ['não', 'nao'] }, { q: 'O código de 90 s atrás (3 passos) foi aceito (sim ou não)?', answers: ['não', 'nao'] }], explanation: 'Reuso e passos fora da janela são recusados.' },
  { id: 'aut-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Liste cinco cuidados ao implementar MFA por TOTP e SSO por OIDC em uma aplicação.', model: 'TOTP: segredo guardado cifrado e exibido uma vez, janela pequena, recusa de reuso do mesmo passo, limite de tentativas e códigos de recuperação com hash, com recuperação de conta segura. SSO/OIDC: PKCE, state e nonce, validação do id_token (iss, aud, exp, assinatura), identidade por iss+sub, vincular contas só com e-mail verificado e confirmação, mapear grupos para papéis com revisão e decidir o comportamento do logout.', rubric: ['Cinco cuidados', 'Janela e reuso do TOTP', 'Limite de tentativas ou recuperação', 'Validação do id_token', 'iss+sub'], explanation: 'Resumo da aula.' },
  { id: 'aut-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarTotp(gerar, ultimoPasso, passoAtual, codigo, janela)§. §gerar(passo)§ devolve o código esperado do passo. Teste os passos de §passoAtual - janela§ até §passoAtual + janela§ (nessa ordem, do menor ao maior). No primeiro cujo código seja igual a §codigo§: se esse passo for menor ou igual a §ultimoPasso§, devolva §{ ok: false, motivo: "reuso" }§; senão §{ ok: true, passo }§. Se nenhum conferir, §{ ok: false, motivo: "invalido" }§.', lang: 'javascript', starter: 'function verificarTotp(gerar, ultimoPasso, passoAtual, codigo, janela) {\n  // seu código aqui\n}\n', hints: ['Percorra d de -janela a +janela.', 'Compare com o último passo aceito para detectar o reuso.'], tests: [{ name: 'janela', code: R`const gerar = (p) => String(100000 + p);
assert.equal(JSON.stringify(verificarTotp(gerar, -1, 50, gerar(50), 1)), '{"ok":true,"passo":50}');
assert.equal(JSON.stringify(verificarTotp(gerar, -1, 50, gerar(49), 1)), '{"ok":true,"passo":49}');
assert.equal(JSON.stringify(verificarTotp(gerar, -1, 50, gerar(47), 1)), '{"ok":false,"motivo":"invalido"}');` }, { name: 'reuso', code: R`const gerar = (p) => String(100000 + p);
assert.equal(JSON.stringify(verificarTotp(gerar, 50, 50, gerar(50), 1)), '{"ok":false,"motivo":"reuso"}');
assert.equal(JSON.stringify(verificarTotp(gerar, 50, 51, gerar(50), 1)), '{"ok":false,"motivo":"reuso"}');
assert.equal(JSON.stringify(verificarTotp(gerar, 50, 51, gerar(51), 1)), '{"ok":true,"passo":51}');` }], solution: R`function verificarTotp(gerar, ultimoPasso, passoAtual, codigo, janela) {
  for (let d = -janela; d <= janela; d++) {
    const passo = passoAtual + d;
    if (gerar(passo) === codigo) return passo <= ultimoPasso ? { ok: false, motivo: 'reuso' } : { ok: true, passo };
  }
  return { ok: false, motivo: 'invalido' };
}`, explanation: 'Janela para o relógio e último passo para impedir o reuso.' }
]
};

const P = 'auth-p';
export const assessment = {
  id: 'auth', title: 'Avaliação final — Autenticação e autorização', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que fazer com o id da sessão no momento do login?', options: ['Mantê-lo igual', 'Regenerá-lo para evitar a fixação de sessão', 'Enviá-lo na URL', 'Reduzi-lo'], answer: 1, explanation: 'Medido: o id mudou com regenerate.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Verificar apenas a assinatura de um JWT é suficiente; iss e aud são opcionais.', answer: false, explanation: 'Sem aud e iss, tokens de outras APIs ou emissores seriam aceitos.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Custo medido por núcleo.', code: 'SHA-256 simples: ~78.180 palpites/s\nargon2id (64 MiB, t=3, p=4): ~4,1 palpites/s', lang: 'text', steps: [{ q: 'Qual a razão aproximada (em milhares, arredondada)?', answers: ['19', '19 mil', '19000'] }, { q: 'Qual função deve guardar senhas?', answers: ['argon2id', 'argon2'] }], explanation: '78.180 / 4,1 ≈ 19.000.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual validação do cliente protege o id_token contra replay?', options: ['A assinatura apenas', 'O nonce', 'O sal', 'O Secure do cookie'], answer: 1, explanation: 'O nonce enviado na autorização deve voltar igual no id_token.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna a verificação do JWT vulnerável a alg=none e à confusão de algoritmo.', code: 'const { payload } = await jwtVerify(token, chave, {\n  issuer: "https://auth.exemplo.com",\n  audience: "api-pedidos"\n});', answer: 1, explanation: 'Falta fixar algorithms (por exemplo, algorithms: ["RS256"]) nas opções.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a comparação de segredos em tempo constante.', code: 'crypto.[[0]](bufferA, bufferB)', answers: [['timingSafeEqual']], explanation: 'Evita ataques de temporização; exige buffers de mesmo tamanho.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a medição do laboratório à lição.', pairs: [['Código de autorização reutilizado: invalid_grant', 'Códigos são de uso único'], ['Reuso de refresh token revogou a família', 'Rotação com detecção de reuso'], ['Sufixo após 72 bytes ignorado no bcrypt', 'Limite do bcrypt'], ['TOTP de 90 s atrás recusado', 'Janela pequena']], explanation: 'Experimentos das aulas 3, 4 e 6.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual abordagem evita o IDOR em GET /pedidos/{id}?', options: ['Usar ids sequenciais', 'Consultar com o id e o dono autenticado e devolver 404 se não achar', 'Esconder a rota', 'Confiar no papel apenas'], answer: 1, explanation: 'Escopo de propriedade na consulta.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Um access token com aud = api-pedidos deve ser aceito como id_token por um cliente com client_id app1.', answer: false, explanation: 'Medido: ERR_JWT_CLAIM_VALIDATION_FAILED; as audiências diferem.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual a identidade recomendada de um usuário federado por OIDC?', options: ['O e-mail', 'O nome', 'O par iss + sub', 'O IP'], answer: 2, explanation: 'O sub é estável por emissor; o e-mail pode mudar ou não ser verificado.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a autenticação e a autorização de uma API de pedidos: senhas, sessão ou tokens, MFA, federação e autorização por objeto.', model: 'Senhas com argon2id calibrado e rehash no login, resposta e tempo iguais para usuário inexistente e limite de tentativas; sessão em cookie HttpOnly/Secure/SameSite com regenerate, CSRF, expiração ociosa e absoluta para o painel web; access token JWT curto (EdDSA/RS256, iss/aud/exp validados, JWKS com rotação) e refresh token rotativo com detecção de reuso para clientes de API; MFA TOTP (janela ±1, sem reuso, tentativas limitadas, códigos de recuperação); login federado OIDC com PKCE, state, nonce e identidade iss+sub; autorização por RBAC+ABAC com negar por padrão e verificação do dono, testada em matriz; auditoria e ADR.', rubric: ['Senhas com argon2id', 'Sessão e tokens bem configurados', 'MFA TOTP', 'OIDC com PKCE e iss+sub', 'RBAC+ABAC com matriz de testes'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que guardar o último passo aceito no TOTP?', options: ['Para economizar memória', 'Para impedir o reuso do mesmo código', 'Para sincronizar relógios', 'Para trocar o segredo'], answer: 1, explanation: 'Medido: o mesmo código de novo foi recusado.' }
  ]
};

export const project = {
  id: 'auth-completa', name: 'Autenticação completa: senhas, sessão, JWT, refresh rotativo, MFA TOTP, OIDC e autorização RBAC+ABAC', lv: 'M', stack: 'Node.js, Express 5, express-session, jose, argon2, PostgreSQL ou Redis (sessões), IdP de laboratório (Keycloak em contêiner)', ds: ['auth'],
  desc: 'Construa a **autenticação e a autorização** de uma **API de pedidos**: **senhas com argon2id**, **sessão segura** para o painel web, **access token JWT curto** e **refresh token rotativo** para a API, **MFA por TOTP**, **login federado por OIDC** (com um IdP de laboratório) e **autorização RBAC+ABAC** testada por matriz. Inclua **testes de ataque** e um **ADR**.',
  rf: ['Cadastro e login com argon2id calibrado, rehash no login, resposta e tempo iguais para usuário inexistente e limite de tentativas', 'Sessão com cookie HttpOnly, Secure e SameSite, regenerate no login, CSRF, expiração ociosa e absoluta e logout real', 'JWT curto assinado com EdDSA ou RS256, validação de iss, aud, exp e algoritmos, JWKS com kid e rotação', 'Refresh token rotativo com detecção de reuso e revogação da família', 'MFA TOTP com segredo cifrado, janela ±1, recusa de reuso, tentativas limitadas e códigos de recuperação com hash', 'Login OIDC com PKCE, state, nonce, validação do id_token e identidade iss+sub', 'Autorização RBAC+ABAC que nega por padrão e verifica a propriedade do recurso', 'Auditoria dos eventos de autenticação e autorização'],
  rnf: ['Nenhuma senha, token ou segredo em logs ou no repositório', 'Versões fixas das bibliotecas registradas', 'README com medições, decisões e limitações', 'Testes automatizados de sucesso e de ataque'],
  ac: ['Testes provam: alg=none e a confusão de algoritmo são recusados; código de autorização reutilizado e verifier errado falham; CSRF sem token é barrado; a fixação de sessão não funciona', 'A matriz de autorização (inclusive IDOR) passa', 'O TOTP confere os vetores da RFC 6238 e recusa o reuso', 'O reuso de um refresh token revoga a família', 'O ADR justifica sessão x token, a política de senhas e a modelagem de autorização'],
  ch: ['Adicionar WebAuthn/passkeys', 'Integrar um IdP real de laboratório (Keycloak) e comparar com o servidor didático', 'Implementar bloqueio gradual e detecção de anomalias', 'Adicionar segurança em nível de linha (RLS) no PostgreSQL', 'Implementar o logout federado e o provisionamento SCIM']
};
