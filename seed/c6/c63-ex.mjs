// C6.3 — Nginx, proxy reverso e deploy: exercícios, avaliação final e projeto.
// Medições do laboratório: nginx 1.31.10, Docker 29.9.3, OpenSSL 3.5.5, Node 26.13.1. Os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'ngx-01': [
  { id: 'ngx-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual Host a aplicação recebeu no laboratório SEM proxy_set_header Host?', options: ['localhost', 'O nome do upstream (app_rr)', '127.0.0.1', 'Vazio'], answer: 1, explanation: 'O padrão do nginx é $proxy_host (o nome do upstream).' },
  { id: 'ngx-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'O X-Forwarded-For medido (172.21.0.1) era o IP do cliente real.', answer: false, explanation: 'Era o gateway da rede Docker; em produção use realip com proxies confiáveis.' },
  { id: 'ngx-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a diretiva ao propósito.', pairs: [['proxy_connect_timeout', 'Tempo para conectar ao upstream'], ['gzip_types', 'Tipos de conteúdo que serão comprimidos'], ['server_tokens off', 'Oculta a versão do nginx'], ['nginx -t', 'Valida a configuração antes de aplicar']], explanation: 'Operação e ajuste básicos.' },
  { id: 'ngx-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §resolverProxyPass(prefixo, uriDoProxyPass, caminho)§: se §uriDoProxyPass§ for §""§ (proxy_pass sem URI), devolva §caminho§ sem alteração; senão devolva §uriDoProxyPass + caminho.slice(prefixo.length)§ (o prefixo casado é substituído).', lang: 'javascript', starter: 'function resolverProxyPass(prefixo, uriDoProxyPass, caminho) {\n  // seu código aqui\n}\n', hints: ['Sem URI, nada muda.', 'Com URI, troque o prefixo pelo URI.'], tests: [{ name: 'regra da barra', code: R`assert.equal(resolverProxyPass('/api/', '', '/api/x'), '/api/x');
assert.equal(resolverProxyPass('/lc/', '/', '/lc/lento'), '/lento');
assert.equal(resolverProxyPass('/app/', '/v2/', '/app/users?id=1'), '/v2/users?id=1');` }, { name: 'armadilha da barra', code: R`assert.equal(resolverProxyPass('/api', '/', '/api/x'), '//x');
assert.equal(resolverProxyPass('/api/', '/', '/api/'), '/');
assert.equal(resolverProxyPass('/a/', '/b/', '/a/'), '/b/');` }], solution: R`function resolverProxyPass(prefixo, uriDoProxyPass, caminho) {
  if (uriDoProxyPass === '') return caminho;
  return uriDoProxyPass + caminho.slice(prefixo.length);
}`, explanation: 'location /api sem barra e proxy_pass com / gera // no caminho: a armadilha clássica.' },
  { id: 'ngx-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que uma aplicação atrás de um proxy reverso precisa de Host, X-Forwarded-For e X-Forwarded-Proto e como obter o IP real do cliente com segurança.', model: 'Sem Host correto, URLs absolutas, cookies e multi-inquilino quebram (a aplicação viu app_rr em vez de localhost); sem X-Forwarded-For/X-Real-IP, logs, rate limit e auditoria da aplicação veem apenas o IP do proxy; sem X-Forwarded-Proto ela não sabe que o cliente usa HTTPS e gera redirecionamentos e cookies Secure errados. O IP 172.21.0.1 medido era o gateway Docker, não o cliente. Para obter o IP real com segurança, usar o módulo realip com set_real_ip_from restrito aos proxies confiáveis e real_ip_header X-Forwarded-For, nunca confiando no cabeçalho vindo da internet, que é falsificável.', rubric: ['Efeito de cada cabeçalho', 'Medição do laboratório (app_rr, 172.21.0.1)', 'realip com proxies confiáveis', 'Falsificação do X-Forwarded-For'], explanation: 'Resumo da aula.' },
  { id: 'ngx-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §escolherLocation(locations, caminho)§ (regras do nginx): cada location é §{ nome, tipo, padrao }§ com §tipo§ §"exato"§, §"prefixo"§, §"prefixo-forte"§ (§^~§) ou §"regex"§ (sensível a maiúsculas; §padrao§ é a fonte da expressão). Ordem: (1) exato igual ao caminho → seu nome; (2) o maior prefixo (tipos prefixo e prefixo-forte) que case no início; se for §prefixo-forte§, devolva-o; (3) a primeira regex (na ordem da lista) que case; (4) o maior prefixo guardado; (5) §null§.', lang: 'javascript', starter: 'function escolherLocation(locations, caminho) {\n  // seu código aqui\n}\n', hints: ['Guarde o maior prefixo ao varrer.', 'Regex só vale se o maior prefixo não for forte.'], tests: [{ name: 'exato e prefixo', code: R`const L = [{ nome: 'raiz', tipo: 'prefixo', padrao: '/' }, { nome: 'api', tipo: 'prefixo', padrao: '/api/' }, { nome: 'saude', tipo: 'exato', padrao: '/saude' }];
assert.equal(escolherLocation(L, '/saude'), 'saude');
assert.equal(escolherLocation(L, '/api/x'), 'api');
assert.equal(escolherLocation(L, '/outro'), 'raiz');
assert.equal(escolherLocation([{ nome: 'a', tipo: 'prefixo', padrao: '/a/' }], '/b'), null);` }, { name: 'regex e ^~', code: R`const L = [{ nome: 'img', tipo: 'regex', padrao: '\\.(png|jpg)$' }, { nome: 'static', tipo: 'prefixo', padrao: '/static/' }, { nome: 'fixo', tipo: 'prefixo-forte', padrao: '/fixo/' }];
assert.equal(escolherLocation(L, '/static/a.png'), 'img');
assert.equal(escolherLocation(L, '/fixo/a.png'), 'fixo');
assert.equal(escolherLocation(L, '/static/a.css'), 'static');` }], solution: R`function escolherLocation(locations, caminho) {
  const exato = locations.find((l) => l.tipo === 'exato' && l.padrao === caminho);
  if (exato) return exato.nome;
  let melhor = null;
  for (const l of locations) {
    if ((l.tipo === 'prefixo' || l.tipo === 'prefixo-forte') && caminho.startsWith(l.padrao)) {
      if (!melhor || l.padrao.length > melhor.padrao.length) melhor = l;
    }
  }
  if (melhor && melhor.tipo === 'prefixo-forte') return melhor.nome;
  const re = locations.find((l) => l.tipo === 'regex' && new RegExp(l.padrao).test(caminho));
  if (re) return re.nome;
  return melhor ? melhor.nome : null;
}`, explanation: 'Reproduz as regras documentadas de seleção de location.' }
],
'ngx-02': [
  { id: 'ngx-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que os navegadores verificam no certificado para saber se ele vale para o site?', options: ['O CN apenas', 'O SAN (nomes DNS e IP)', 'A cor do cadeado', 'O tamanho do arquivo'], answer: 1, explanation: 'O CN legado é ignorado.' },
  { id: 'ngx-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: curl sem confiar no certificado autoassinado terminou com exit 60.', answer: true, explanation: 'Certificado não verificado: o canal seria cifrado, mas sem autenticação.' },
  { id: 'ngx-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a verificação medida ao resultado.', pairs: [['curl --cacert https://...', '200, HTTP/2, verificação 0'], ['curl sem confiar', 'exit 60'], ['curl http://...:38090/caminho?x=1', '301 para HTTPS preservando caminho e consulta'], ['openssl s_client -tls1_3', 'TLS_AES_256_GCM_SHA384']], explanation: 'Resultados do laboratório.' },
  { id: 'ngx-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarCertificado(cert, host, agoraMs)§ com §cert = { san: [...], notBefore, notAfter, emissor, sujeito }§ (datas em ms). Devolva a lista de problemas, nesta ordem: §"nome não consta no SAN"§ (comparação sem diferenciar maiúsculas; §*.exemplo.com§ cobre exatamente um rótulo, como §a.exemplo.com§, mas não §exemplo.com§ nem §a.b.exemplo.com§), §"ainda não válido"§ (§agoraMs < notBefore§), §"expirado"§ (§agoraMs > notAfter§) e §"autoassinado"§ (§emissor === sujeito§).', lang: 'javascript', starter: 'function validarCertificado(cert, host, agoraMs) {\n  // seu código aqui\n}\n', hints: ['Trate o curinga comparando o restante após o primeiro rótulo.', 'Monte a lista na ordem do enunciado.'], tests: [{ name: 'laboratório', code: R`const c = { san: ['localhost', '127.0.0.1'], notBefore: 100, notAfter: 200, emissor: 'CN=localhost', sujeito: 'CN=localhost' };
assert.equal(JSON.stringify(validarCertificado(c, 'localhost', 150)), '["autoassinado"]');
assert.equal(JSON.stringify(validarCertificado(c, 'outro.com', 150)), '["nome não consta no SAN","autoassinado"]');
assert.equal(JSON.stringify(validarCertificado(c, 'LOCALHOST', 250)), '["expirado","autoassinado"]');` }, { name: 'curinga e datas', code: R`const c = { san: ['*.exemplo.com'], notBefore: 100, notAfter: 200, emissor: 'CN=CA', sujeito: 'CN=*.exemplo.com' };
assert.equal(JSON.stringify(validarCertificado(c, 'a.exemplo.com', 150)), '[]');
assert.equal(JSON.stringify(validarCertificado(c, 'exemplo.com', 150)), '["nome não consta no SAN"]');
assert.equal(JSON.stringify(validarCertificado(c, 'a.b.exemplo.com', 150)), '["nome não consta no SAN"]');
assert.equal(JSON.stringify(validarCertificado(c, 'a.exemplo.com', 50)), '["ainda não válido"]');` }], solution: R`function validarCertificado(cert, host, agoraMs) {
  const h = host.toLowerCase();
  const casa = (nome) => {
    const n = nome.toLowerCase();
    if (!n.startsWith('*.')) return n === h;
    const resto = n.slice(1);
    return h.endsWith(resto) && h.slice(0, h.length - resto.length).length > 0 && !h.slice(0, h.length - resto.length).includes('.');
  };
  const out = [];
  if (!cert.san.some(casa)) out.push('nome não consta no SAN');
  if (agoraMs < cert.notBefore) out.push('ainda não válido');
  if (agoraMs > cert.notAfter) out.push('expirado');
  if (cert.emissor === cert.sujeito) out.push('autoassinado');
  return out;
}`, explanation: 'Resume as verificações que um cliente faz (nome, validade e confiança).' },
  { id: 'ngx-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Planeje a emissão e a renovação automática de certificados para um site público, incluindo monitoramento e os cuidados com HSTS. O que o laboratório executou e o que não?', model: 'Usar um cliente ACME (certbot, acme.sh, Caddy ou cert-manager) com Let’s Encrypt: desafio HTTP-01 em /.well-known/acme-challenge/ ou DNS-01 (necessário para curingas), certificados de 90 dias renovados cerca de 30 dias antes, com reload do nginx após a renovação, teste em ambiente de teste (limites de taxa), alerta de validade com 14 a 21 dias e fullchain com as intermediárias. HSTS começa com max-age curto e cresce, evitando includeSubDomains e preload sem certeza, porque um certificado vencido ou um subdomínio sem HTTPS fica inacessível. O laboratório executou apenas um certificado autoassinado com openssl, HTTPS/HTTP2, redirecionamento, HSTS e verificação com curl e openssl s_client; ACME, OCSP stapling, mTLS e HTTP/3 não foram executados.', rubric: ['Cliente ACME e tipos de desafio', 'Renovação, reload e monitoramento', 'Cuidados com HSTS', 'Distinção entre executado e não executado'], explanation: 'Resumo da aula.' },
  { id: 'ngx-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §cabecalhoHsts(maxAge, incluirSub, preload)§: devolva §{ cabecalho, avisos }§. §cabecalho§ = §"max-age=N"§ mais §"; includeSubDomains"§ se §incluirSub§ mais §"; preload"§ se §preload§. §avisos§ (nesta ordem): §"includeSubDomains afeta todos os subdomínios"§ se §incluirSub§; §"preload exige includeSubDomains"§ se §preload && !incluirSub§; §"preload exige max-age de pelo menos 31536000"§ se §preload && maxAge < 31536000§; §"preload é praticamente irreversível"§ se §preload§.', lang: 'javascript', starter: 'function cabecalhoHsts(maxAge, incluirSub, preload) {\n  // seu código aqui\n}\n', hints: ['Monte o cabeçalho e os avisos separadamente.'], tests: [{ name: 'simples', code: R`assert.equal(JSON.stringify(cabecalhoHsts(31536000, false, false)), '{"cabecalho":"max-age=31536000","avisos":[]}');
assert.equal(JSON.stringify(cabecalhoHsts(300, true, false)), '{"cabecalho":"max-age=300; includeSubDomains","avisos":["includeSubDomains afeta todos os subdomínios"]}');` }, { name: 'preload', code: R`assert.equal(JSON.stringify(cabecalhoHsts(100, false, true)), '{"cabecalho":"max-age=100; preload","avisos":["preload exige includeSubDomains","preload exige max-age de pelo menos 31536000","preload é praticamente irreversível"]}');
assert.equal(JSON.stringify(cabecalhoHsts(63072000, true, true)), '{"cabecalho":"max-age=63072000; includeSubDomains; preload","avisos":["includeSubDomains afeta todos os subdomínios","preload é praticamente irreversível"]}');` }], solution: R`function cabecalhoHsts(maxAge, incluirSub, preload) {
  let cabecalho = 'max-age=' + maxAge;
  if (incluirSub) cabecalho += '; includeSubDomains';
  if (preload) cabecalho += '; preload';
  const avisos = [];
  if (incluirSub) avisos.push('includeSubDomains afeta todos os subdomínios');
  if (preload && !incluirSub) avisos.push('preload exige includeSubDomains');
  if (preload && maxAge < 31536000) avisos.push('preload exige max-age de pelo menos 31536000');
  if (preload) avisos.push('preload é praticamente irreversível');
  return { cabecalho, avisos };
}`, explanation: 'O HSTS é útil e perigoso: avise sobre os efeitos antes de ativar.' }
],
'ngx-03': [
  { id: 'ngx-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual algoritmo envia a requisição ao servidor com menos conexões ativas?', options: ['round-robin', 'least_conn', 'ip_hash', 'random'], answer: 1, explanation: 'No laboratório, com uma instância lenta, recebeu 14 requisições contra 39 do round-robin.' },
  { id: 'ngx-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: 90 requisições em round-robin deram exatamente 30, 30 e 30.', answer: false, explanation: 'Deram 30, 32 e 28 (repetido em duas execuções); o round-robin é aproximado.' },
  { id: 'ngx-03-e3', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §simularFailover(servidores, n, retentar)§: §servidores§ é uma lista de §{ nome, vivo }§ em rodízio; a cada requisição, toma-se o próximo servidor ativo; se ele não está vivo, é removido do rodízio (como §max_fails=1§) e, se §retentar§ for verdadeiro, tenta-se o próximo ativo na mesma requisição (cada um uma vez); sem §retentar§ a requisição falha. Se nenhum servidor ativo atende, conta como falha. Devolva §{ ok, falhas, porServidor }§ (porServidor na ordem do primeiro atendimento).', lang: 'javascript', starter: 'function simularFailover(servidores, n, retentar) {\n  // seu código aqui\n}\n', hints: ['Mantenha uma lista de ativos e um cursor.', 'Ao remover o servidor morto, o cursor aponta para o próximo.'], tests: [{ name: 'com e sem retentativa', code: R`const S = [{ nome: 'a', vivo: true }, { nome: 'b', vivo: false }, { nome: 'c', vivo: true }];
assert.equal(JSON.stringify(simularFailover(S, 6, true)), '{"ok":6,"falhas":0,"porServidor":{"a":3,"c":3}}');
assert.equal(JSON.stringify(simularFailover(S, 6, false)), '{"ok":5,"falhas":1,"porServidor":{"a":3,"c":2}}');` }, { name: 'bordas', code: R`assert.equal(JSON.stringify(simularFailover([{ nome: 'a', vivo: false }], 3, true)), '{"ok":0,"falhas":3,"porServidor":{}}');
assert.equal(JSON.stringify(simularFailover([{ nome: 'a', vivo: true }, { nome: 'b', vivo: true }], 4, false)), '{"ok":4,"falhas":0,"porServidor":{"a":2,"b":2}}');` }], solution: R`function simularFailover(servidores, n, retentar) {
  const ativos = servidores.slice();
  const porServidor = {};
  let ok = 0, falhas = 0, cursor = 0;
  for (let i = 0; i < n; i++) {
    const tentativas = retentar ? ativos.length : 1;
    let atendido = false;
    for (let t = 0; t < tentativas && ativos.length; t++) {
      const idx = cursor % ativos.length;
      const s = ativos[idx];
      if (s.vivo) { porServidor[s.nome] = (porServidor[s.nome] || 0) + 1; cursor = idx + 1; atendido = true; break; }
      ativos.splice(idx, 1);
      cursor = idx;
    }
    if (atendido) ok++; else falhas++;
  }
  return { ok, falhas, porServidor };
}`, explanation: 'Mostra por que a retentativa esconde a falha do cliente (no laboratório: 60 x 200 contra 56 x 200 e 4 x 504, pois cada worker descobre a falha separadamente).' },
  { id: 'ngx-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §simularLeastConn(servidores, n)§: §servidores§ é uma lista de §{ nome, duracaoMs }§; chega 1 requisição por ms (instantes 0 a n-1); cada uma vai ao servidor com MENOS requisições ainda ativas (uma requisição enviada em §t§ está ativa até §t + duracaoMs§, exclusive no instante final); empate → o primeiro da lista. Devolva a contagem por nome.', lang: 'javascript', starter: 'function simularLeastConn(servidores, n) {\n  // seu código aqui\n}\n', hints: ['Guarde, por servidor, os instantes de término.', 'Descarte os que já terminaram antes de comparar.'], tests: [{ name: 'instância lenta', code: R`assert.equal(JSON.stringify(simularLeastConn([{ nome: 'lenta', duracaoMs: 400 }, { nome: 'b', duracaoMs: 10 }, { nome: 'c', duracaoMs: 10 }], 120)), '{"lenta":5,"b":58,"c":57}');` }, { name: 'iguais', code: R`assert.equal(JSON.stringify(simularLeastConn([{ nome: 'a', duracaoMs: 1000 }, { nome: 'b', duracaoMs: 1000 }], 6)), '{"a":3,"b":3}');
assert.equal(JSON.stringify(simularLeastConn([{ nome: 'a', duracaoMs: 5 }], 3)), '{"a":3}');` }], solution: R`function simularLeastConn(servidores, n) {
  const fim = servidores.map(() => []);
  const cont = Object.fromEntries(servidores.map((s) => [s.nome, 0]));
  for (let t = 0; t < n; t++) {
    let melhor = 0, menor = Infinity;
    servidores.forEach((s, i) => {
      fim[i] = fim[i].filter((e) => e > t);
      if (fim[i].length < menor) { menor = fim[i].length; melhor = i; }
    });
    fim[melhor].push(t + servidores[melhor].duracaoMs);
    cont[servidores[melhor].nome]++;
  }
  return cont;
}`, explanation: 'Mostra o efeito do laboratório: a instância lenta acumula conexões e recebe menos.' },
  { id: 'ngx-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que retentar requisições automaticamente é perigoso e como configurar o failover com segurança, citando o que foi medido.', model: 'Retentativas escondem falhas (com a app2 parada, 60 x 200 com proxy_next_upstream e 56 x 200 mais 4 x 504 sem ele), mas podem repetir operações com efeito: POST e PATCH não são retentados por padrão depois de enviados, e habilitar non_idempotent exige chaves de idempotência; incluir http_500 repete até erros da aplicação. Configurar com max_fails e fail_timeout, proxy_connect_timeout curto (1 s), listar apenas erro, timeout e 502/503, limitar proxy_next_upstream_tries e _timeout para evitar tempestade de retentativas, usar zone para estado compartilhado entre workers, preferir health checks ativos quando o primeiro cliente não puder pagar o custo, e manter operações idempotentes.', rubric: ['Efeito medido da retentativa', 'Idempotência e non_idempotent', 'Limites de tentativas e timeouts', 'Passivo x ativo'], explanation: 'Resumo da aula.' },
  { id: 'ngx-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §simularLimitReq(chegadasMs, rate, burst)§ (leaky bucket do nginx com §nodelay§): a primeira requisição é aceita com excesso 0; para as demais, §excesso = max(excessoAnterior − (t − ultimo) * rate / 1000 + 1, 0)§; se §excesso > burst§ a requisição é rejeitada (e o estado NÃO muda); senão é aceita e o estado (§excesso§ e §ultimo = t§) é atualizado. Devolva §{ aceitas, rejeitadas }§.', lang: 'javascript', starter: 'function simularLimitReq(chegadasMs, rate, burst) {\n  // seu código aqui\n}\n', hints: ['Guarde excesso e último instante aceito.', 'Requisições rejeitadas não alteram o estado.'], tests: [{ name: 'rajada e espaçado', code: R`assert.equal(JSON.stringify(simularLimitReq(Array(10).fill(0), 5, 5)), '{"aceitas":6,"rejeitadas":4}');
assert.equal(JSON.stringify(simularLimitReq(Array.from({ length: 10 }, (_, i) => i * 200), 5, 5)), '{"aceitas":10,"rejeitadas":0}');` }, { name: 'laço rápido', code: R`assert.equal(JSON.stringify(simularLimitReq(Array.from({ length: 30 }, (_, i) => i * 50), 5, 5)), '{"aceitas":13,"rejeitadas":17}');
assert.equal(JSON.stringify(simularLimitReq([0, 0, 0], 5, 0)), '{"aceitas":1,"rejeitadas":2}');
assert.equal(JSON.stringify(simularLimitReq([], 5, 5)), '{"aceitas":0,"rejeitadas":0}');` }], solution: R`function simularLimitReq(chegadasMs, rate, burst) {
  let excesso = 0, ultimo = null, aceitas = 0, rejeitadas = 0;
  for (const t of chegadasMs) {
    if (ultimo === null) { ultimo = t; excesso = 0; aceitas++; continue; }
    const e = Math.max(excesso - ((t - ultimo) * rate) / 1000 + 1, 0);
    if (e > burst) { rejeitadas++; continue; }
    excesso = e; ultimo = t; aceitas++;
  }
  return { aceitas, rejeitadas };
}`, explanation: 'Explica por que 30 requisições rápidas deram 12 aceitas no laboratório (cada requisição levou ~dezenas de ms, reabastecendo o balde).' }
]
};

const P = 'nginx-p';
export const assessment = {
  id: 'nginx', title: 'Avaliação final — Nginx: proxy reverso, TLS e balanceamento', passPct: 70, minutes: 40,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que faz um proxy reverso?', options: ['Representa clientes na internet', 'Recebe requisições em nome da aplicação e as encaminha', 'Substitui o banco de dados', 'Compila o código'], answer: 1, explanation: 'Centraliza TLS, compressão, limites e logs.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Com proxy_pass http://app_lc/; em location /lc/, a requisição /lc/lento chega à aplicação como /lento.', answer: true, explanation: 'A barra (URI) substitui o prefixo casado.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Compressão medida no laboratório.', code: 'sem gzip: 20320 bytes\ncom gzip: 1565 bytes', lang: 'text', steps: [{ q: 'Quantos bytes foram economizados?', answers: ['18755'] }, { q: 'Aproximadamente que porcentagem (inteiro) foi economizada?', answers: ['92'] }], explanation: '20320 − 1565 = 18755; 18755/20320 ≈ 92%.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'O que significou o exit 60 do curl?', options: ['Erro de DNS', 'Certificado não verificado (não confiável)', 'Timeout', 'Porta fechada'], answer: 1, explanation: 'O certificado autoassinado não é confiado pelo cliente.' },
    { id: P + '5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a configuração do rate limit.', code: 'limit_req_zone $binary_remote_addr zone=lim:1m rate=5r/s;\nlimit_req zone=lim burst=5 [[0]];\nlimit_req_status [[1]];', answers: [['nodelay'], ['429']], explanation: 'nodelay atende o burst sem espaçar; 429 é Too Many Requests.' },
    { id: P + '6', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que faz a aplicação achar que o cliente usa HTTP mesmo quando ele usa HTTPS.', code: 'location / {\n  proxy_pass http://app_rr;\n  proxy_set_header Host $host;\n  proxy_set_header X-Forwarded-Proto http;\n}', answer: 4, explanation: 'O protocolo foi fixado em http; o correto é $scheme.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o resultado medido ao cenário.', pairs: [['14 contra 39 requisições', 'least_conn x round-robin com instância lenta'], ['60 x 200', 'Failover com proxy_next_upstream'], ['56 x 200 e 4 x 504', 'Failover sem retentativa'], ['12 x 200 e 18 x 429', 'Rate limit de 5 r/s com burst 5']], explanation: 'Resultados da aula 3.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que não confiar no X-Forwarded-For que vem da internet?', options: ['Porque é lento', 'Porque o cliente pode forjá-lo; use realip com proxies confiáveis', 'Porque o nginx o remove', 'Porque é criptografado'], answer: 1, explanation: 'O cabeçalho é falsificável.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'O laboratório emitiu certificados reais com Let’s Encrypt e testou health checks ativos.', answer: false, explanation: 'Usou certificado autoassinado e failover passivo; ACME e health checks ativos não foram executados.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual é o risco de um HSTS com max-age longo e includeSubDomains logo no começo?', options: ['Nenhum', 'Subdomínios sem HTTPS ou com certificado vencido ficam inacessíveis', 'O nginx para', 'O gzip é desligado'], answer: 1, explanation: 'O navegador recusa HTTP e exceções de certificado.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a borda nginx de uma API com três instâncias: proxy, cabeçalhos, TLS, redirecionamento, balanceamento, failover, rate limit e operação.', model: 'Upstream com três instâncias (least_conn se as durações variam, zone para estado compartilhado, max_fails e fail_timeout), proxy_pass com Host, X-Real-IP, X-Forwarded-For e X-Forwarded-Proto e realip com proxies confiáveis. HTTPS com certificado e fullchain emitidos por ACME e renovados automaticamente, TLS 1.2 e 1.3, http2 on, HSTS introduzido com max-age curto, redirecionamento 301 de HTTP para HTTPS e gzip para texto. Failover com proxy_connect_timeout curto, proxy_next_upstream restrito a erro, timeout, 502 e 503 com limite de tentativas e sem retentar não idempotentes; limit_req por chave adequada com 429 e Retry-After; mais de um balanceador para evitar ponto único de falha. Operação com nginx -t antes do reload e conferência do tráfego, logs com tempos de upstream, server_tokens off e stub_status protegido. Declarar o que não foi executado.', rubric: ['Proxy e cabeçalhos corretos', 'TLS, redirecionamento e HSTS', 'Balanceamento, failover e rate limit', 'Operação e limites do que foi testado'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual a principal limitação do failover passivo do nginx de código aberto?', options: ['Não existe', 'O primeiro cliente que encontra a instância ruim paga o custo', 'Só funciona com TLS', 'Exige Kubernetes'], answer: 1, explanation: 'Health checks ativos detectam antes (NGINX Plus, HAProxy, Envoy, nuvem).' }
  ]
};

export const project = {
  id: 'borda-nginx', name: 'Borda nginx: proxy reverso, HTTPS e balanceamento com falhas medidas', lv: 'M', stack: 'nginx, Docker, OpenSSL, Node.js, curl', ds: ['nginx'],
  desc: 'Monte a **borda de uma aplicação** com **nginx**: **proxy reverso** com **cabeçalhos corretos**, **HTTPS** com **certificado de teste (SAN)**, **redirecionamento**, **HSTS** e **HTTP/2**, **balanceamento** entre **três instâncias** com **failover**, **rate limit** e **compressão**; **meça** cada comportamento (**cabeçalhos vistos pela aplicação, protocolos negociados, distribuição, efeito de instância lenta, falha de instância, 429**) e **registre** os **achados e limites** (**o que foi executado e o que não foi**).',
  rf: ['Aplicação de teste que ecoa os cabeçalhos recebidos e identifica a instância', 'Proxy reverso com Host, X-Real-IP, X-Forwarded-For e X-Forwarded-Proto e comparação com a configuração padrão', 'Certificado de teste com SAN, HTTPS com TLS 1.2 e 1.3, HTTP/2, redirecionamento 301 e HSTS, verificados com curl e openssl s_client', 'Três instâncias com round-robin e least_conn, medindo a distribuição e o efeito de uma instância lenta', 'Failover passivo com e sem proxy_next_upstream, medindo os códigos com uma instância parada e após religá-la', 'Rate limit com rate e burst e medição de 200 e 429', 'Compressão gzip com tamanhos antes e depois', 'Script que cria e remove apenas os recursos do laboratório e gera o relatório'],
  rnf: ['Chave privada de teste gerada na execução e apagada ao final', 'Versões fixadas e registradas', 'nginx -t antes de cada aplicação de configuração', 'Comandos reproduzíveis e documentados'],
  ac: ['A aplicação mostra a diferença de cabeçalhos com e sem proxy_set_header', 'curl sem confiar no certificado retorna 60 e com --cacert retorna 200', 'A distribuição, o efeito do least_conn e o failover são medidos e reportados', 'O rate limit devolve 429 e a contagem é explicada', 'O relatório informa o que não foi executado (ACME, health checks ativos, cache, produção)'],
  ch: ['Adicionar zone ao upstream e repetir a medição da distribuição', 'Configurar OCSP stapling e testar com openssl s_client -status', 'Emitir um certificado real em um domínio de teste com ACME', 'Substituir o failover passivo por health checks ativos (Envoy ou HAProxy) e comparar']
};
