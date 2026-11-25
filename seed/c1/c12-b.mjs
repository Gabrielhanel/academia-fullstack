// C1.2 — Redes de computadores e HTTP. Aulas 4 a 7 (HTTP, HTTPS/TLS, protocolos de comunicação, HTTP/2 e HTTP/3).
import { REF as RA } from './c12-a.mjs';
const R = String.raw;

export const REF2 = {
  rfc9110: { title: 'IETF — RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', kind: 'spec' },
  rfc9111: { title: 'IETF — RFC 9111: HTTP Caching', url: 'https://www.rfc-editor.org/rfc/rfc9111.html', kind: 'spec' },
  rfc9112: { title: 'IETF — RFC 9112: HTTP/1.1', url: 'https://www.rfc-editor.org/rfc/rfc9112.html', kind: 'spec' },
  rfc9113: { title: 'IETF — RFC 9113: HTTP/2', url: 'https://www.rfc-editor.org/rfc/rfc9113.html', kind: 'spec' },
  rfc9114: { title: 'IETF — RFC 9114: HTTP/3', url: 'https://www.rfc-editor.org/rfc/rfc9114.html', kind: 'spec' },
  rfc9000: { title: 'IETF — RFC 9000: QUIC, a UDP-Based Multiplexed and Secure Transport', url: 'https://www.rfc-editor.org/rfc/rfc9000.html', kind: 'spec' },
  rfc8446: { title: 'IETF — RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3', url: 'https://www.rfc-editor.org/rfc/rfc8446.html', kind: 'spec' },
  rfc6265: { title: 'IETF — RFC 6265: HTTP State Management Mechanism (cookies)', url: 'https://www.rfc-editor.org/rfc/rfc6265.html', kind: 'spec' },
  rfc6455: { title: 'IETF — RFC 6455: The WebSocket Protocol', url: 'https://www.rfc-editor.org/rfc/rfc6455.html', kind: 'spec' },
  rfc7838: { title: 'IETF — RFC 7838: HTTP Alternative Services (Alt-Svc)', url: 'https://www.rfc-editor.org/rfc/rfc7838.html', kind: 'spec' },
  mdnHttp: { title: 'MDN — HTTP (visão geral e guias)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', kind: 'doc' },
  mdnStatus: { title: 'MDN — HTTP response status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status', kind: 'doc' },
  mdnCaching: { title: 'MDN — HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching', kind: 'doc' },
  mdnWs: { title: 'MDN — The WebSocket API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', kind: 'doc' },
  sse: { title: 'WHATWG — HTML Living Standard: Server-sent events', url: 'https://html.spec.whatwg.org/multipage/server-sent-events.html', kind: 'spec' },
  letsencrypt: { title: "Let's Encrypt — Documentation", url: 'https://letsencrypt.org/docs/', kind: 'doc' },
  grpc: { title: 'gRPC — Introduction and core concepts', url: 'https://grpc.io/docs/what-is-grpc/core-concepts/', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'red-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['http', 'web', 'api', 'cache'],
  title: 'HTTP: mensagens, métodos, status, cabeçalhos e cache',
  objectives: ['Ler e escrever uma requisição e uma resposta HTTP/1.1 à mão', 'Escolher o método certo (GET, POST, PUT, PATCH, DELETE) e explicar segurança e idempotência', 'Interpretar as famílias de códigos de status e os mais comuns (200, 201, 204, 301, 304, 400, 401, 403, 404, 429, 500, 503)', 'Usar cabeçalhos de conteúdo, autenticação e cache (Content-Type, Authorization, Cache-Control, ETag)', 'Explicar cookies e seus atributos de segurança e depurar requisições com curl'],
  intro: `O **HTTP** é o protocolo de aplicação da web: é a linguagem que navegadores, APIs, aplicativos móveis e microsserviços usam para conversar. Ele parece simples, apenas texto de pedido e resposta, mas por trás há decisões que afetam correção, segurança e desempenho: qual método usar, qual status devolver, como cachear, como identificar o usuário. Dominar a **semântica do HTTP** torna suas APIs previsíveis e depuráveis.`,
  theory: `### Modelo: cliente e servidor, requisição e resposta
O cliente envia uma **requisição**; o servidor devolve uma **resposta**. O HTTP é **sem estado** (*stateless*): cada requisição é independente, e quem precisa de "sessão" (login, carrinho) usa cookies, tokens ou armazenamento no servidor. A semântica está no **RFC 9110**; o formato de texto do HTTP/1.1, no **RFC 9112**.

### Anatomia de uma requisição HTTP/1.1
\`\`\`
GET /ola HTTP/1.1
Host: localhost
Accept: application/json
Connection: close

\`\`\`
- **Linha de requisição**: método, caminho (com query string) e versão.
- **Cabeçalhos**: pares §Nome: valor§. O §Host§ é obrigatório no HTTP/1.1 (permite vários sites no mesmo IP).
- **Linha em branco** e, se houver, o **corpo**. As linhas terminam em §\\r\\n§ (CRLF).

A resposta correspondente (obtida de verdade com um servidor local de teste):
\`\`\`
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 13
Cache-Control: max-age=60
ETag: "v1"

{"msg":"ola"}
\`\`\`
**Linha de status** (versão, código e frase), cabeçalhos e corpo. O §Content-Length§ diz quantos bytes tem o corpo; sem ele, o HTTP/1.1 usa codificação em pedaços (§Transfer-Encoding: chunked§) ou fecha a conexão ao final.

### Métodos
| Método | Uso | Seguro* | Idempotente** |
|---|---|---|---|
| §GET§ | obter um recurso | sim | sim |
| §HEAD§ | só os cabeçalhos do GET | sim | sim |
| §POST§ | criar ou executar uma ação | não | **não** |
| §PUT§ | substituir um recurso por completo | não | sim |
| §PATCH§ | alterar parcialmente | não | depende |
| §DELETE§ | remover | não | sim |
| §OPTIONS§ | descobrir o que é permitido (e pré-voo de CORS) | sim | sim |

*Seguro: não altera o estado do servidor. **Idempotente: repetir a mesma requisição tem o mesmo efeito de executá-la uma vez. Isso decide o que um cliente ou proxy pode **repetir automaticamente** após uma falha: repetir um §PUT§ é seguro; repetir um §POST§ pode criar duas compras. Uma consequência prática: **nunca** altere dados em um §GET§ (robôs, pré-carregamento e links podem disparar GETs).

### Códigos de status
| Faixa | Significado | Exemplos |
|---|---|---|
| **1xx** | informativo | 101 Switching Protocols (usado por WebSocket) |
| **2xx** | sucesso | 200 OK · 201 Created · 204 No Content |
| **3xx** | redirecionamento | 301 Moved Permanently · 302 Found · 304 Not Modified |
| **4xx** | erro do **cliente** | 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 422 Unprocessable Content · 429 Too Many Requests |
| **5xx** | erro do **servidor** | 500 Internal Server Error · 502 Bad Gateway · 503 Service Unavailable · 504 Gateway Timeout |

Pontos que costumam confundir: **401** significa "não autenticado" (falta ou é inválida a credencial); **403** é "autenticado, mas sem permissão". **502/504** vêm de um proxy ou balanceador que não conseguiu uma resposta válida do servidor de trás. Em um redirecionamento (§301§, §302§, §307§, §308§), o destino vem no cabeçalho §Location§. Em nosso servidor de teste, §/velho§ respondeu §301§ com §Location: /ola§ e o §curl -L§ seguiu até o §200§; um caminho inexistente respondeu §404§.

### Cabeçalhos importantes
- **Conteúdo:** §Content-Type§ (formato do corpo, ex.: §application/json; charset=utf-8§), §Content-Length§, §Content-Encoding§ (§gzip§, §br§), §Accept§ (o que o cliente aceita), §Accept-Language§.
- **Autenticação:** §Authorization: Bearer <token>§; o servidor pode pedir credenciais com §WWW-Authenticate§.
- **Identificação:** §Host§, §User-Agent§, §Origin§, §Referer§.
- **Redirecionamento:** §Location§.
- **Cache:** §Cache-Control§, §ETag§, §Last-Modified§, §Vary§.

### Cache HTTP
O cache evita refazer trabalho. Os dois mecanismos principais (RFC 9111):
- **Frescor** — §Cache-Control: max-age=60§ diz que a resposta pode ser reutilizada por 60 s **sem perguntar ao servidor**. §no-store§ proíbe armazenar (dados sensíveis); §no-cache§ permite guardar, mas **exige revalidação** a cada uso; §private§ restringe ao cache do navegador do usuário; §public§ permite caches compartilhados (CDN, proxies); §immutable§ indica que o conteúdo nunca muda (ótimo para arquivos com hash no nome).
- **Validação** — o servidor devolve um **validador** (§ETag: "v1"§ ou §Last-Modified§). Depois, o cliente pergunta com §If-None-Match: "v1"§ (ou §If-Modified-Since§); se nada mudou, o servidor responde **§304 Not Modified§ sem corpo**, economizando banda. (Nosso servidor de teste não implementa o 304; o exemplo é conceitual.)
- §Vary: Accept-Encoding§ avisa aos caches que a resposta depende desses cabeçalhos da requisição.

Estratégia comum para sites: HTML com validação (§no-cache§ + ETag) e arquivos estáticos com nome contendo o hash do conteúdo e §max-age=31536000, immutable§.

### Cookies
O servidor define um cookie com §Set-Cookie: sessao=abc; ...§ e o navegador o devolve em requisições futuras no cabeçalho §Cookie§ (RFC 6265). Atributos de segurança essenciais: **§HttpOnly§** (JavaScript da página não lê, reduz o roubo por XSS), **§Secure§** (só enviado por HTTPS), **§SameSite=Lax|Strict§** (limita o envio em requisições entre sites, reduzindo CSRF), além de §Path§, §Domain§ e §Max-Age§/§Expires§. Para sessões de usuário, o conjunto padrão é §HttpOnly; Secure; SameSite=Lax§ (ou §Strict§).

### Depurando com curl
§curl -i URL§ mostra cabeçalhos e corpo; §curl -I URL§ faz um HEAD; §curl -v URL§ mostra toda a conversa (incluindo a conexão e TLS); §-X POST -H 'Content-Type: application/json' -d '{"a":1}'§ envia um corpo; §-L§ segue redirecionamentos; §-o /dev/null -w '%{http_code}\\n'§ extrai só o código. Para conhecer o protocolo de verdade, envie uma requisição **à mão** com §nc§: o que o navegador faz é só isso, com mais cabeçalhos.`,
  concepts: [
    { term: 'Requisição e resposta', def: 'Par de mensagens HTTP: o cliente pede um recurso e o servidor devolve status, cabeçalhos e corpo.' },
    { term: 'Stateless', def: 'O servidor não guarda estado entre requisições; sessões usam cookies, tokens ou armazenamento externo.' },
    { term: 'Método seguro e idempotente', def: 'Seguro não altera estado; idempotente produz o mesmo efeito se repetido.' },
    { term: 'Código de status', def: 'Número de três dígitos que resume o resultado: 2xx sucesso, 3xx redirecionamento, 4xx erro do cliente, 5xx erro do servidor.' },
    { term: '401 x 403', def: '401: faltam credenciais válidas; 403: o usuário é conhecido, mas não tem permissão.' },
    { term: 'Cache-Control', def: 'Cabeçalho que controla frescor e quem pode armazenar a resposta (max-age, no-store, no-cache, public, private).' },
    { term: 'ETag e 304', def: 'Validador de versão; com If-None-Match, o servidor responde 304 sem corpo se nada mudou.' },
    { term: 'Cookie HttpOnly, Secure, SameSite', def: 'Atributos que limitam leitura por JavaScript, envio por HTTP simples e envio entre sites.' },
    { term: 'Content negotiation', def: 'Escolha do formato ou idioma da resposta com base em Accept e Accept-Language.' }
  ],
  examples: R`**Analogia:** o HTTP é um **balcão de atendimento por formulários**. A requisição é o formulário (o que quero, quem sou, o que aceito receber); a resposta é o formulário devolvido (resultado, observações, o documento). O atendente **não lembra de você** entre uma visita e outra (sem estado): por isso você mostra seu crachá (cookie ou token) toda vez. O cache é a **fotocópia** que você guarda em casa: dentro do prazo (max-age) você nem vai ao balcão; depois do prazo, você pergunta "mudou desde a versão 1?" (ETag) e o atendente apenas responde "não mudou" (304).

**Cenário real — qual status devolver?** Criar um pedido: §POST /pedidos§ válido → **201** com §Location: /pedidos/123§. JSON malformado → **400**. Falta o token → **401**. Token de um usuário sem permissão → **403**. Pedido inexistente → **404**. Estoque insuficiente (conflito de estado) → **409** ou **422**. Excesso de requisições → **429** com §Retry-After§. Banco indisponível → **503**. Usar 200 com "erro" no corpo confunde clientes, caches, monitoramento e proxies.

**Cenário real — requisição à mão:** em nosso laboratório, o comando abaixo enviou uma requisição HTTP/1.1 crua a um servidor local pelo §nc§ e recebeu a resposta completa com cabeçalhos e corpo.`,
  code: [
    { title: 'Requisição HTTP escrita à mão (executado com nc e um servidor de teste local)', lang: 'bash', code: R`printf 'GET /ola HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' | nc 127.0.0.1 8766
# HTTP/1.1 200 OK
# Content-Type: application/json
# Content-Length: 13
# Cache-Control: max-age=60
# ETag: "v1"
#
# {"msg":"ola"}`, notes: [{ l: '1', t: 'Cada linha termina em \\r\\n; a linha em branco final encerra os cabeçalhos. Connection: close pede ao servidor que feche a conexão depois de responder.' }, { l: '2', t: 'Linha de status: versão, código e frase.' }, { l: '4-5', t: 'Cabeçalhos de tamanho, cache e validador.' }, { l: '7', t: 'Corpo com exatamente os 13 bytes anunciados em Content-Length. O servidor Python de teste também enviava Server e Date, omitidos aqui.' }] },
    { title: 'Códigos, redirecionamento e tempos com curl (executado)', lang: 'bash', code: R`curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8766/x                    # 404
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://127.0.0.1:8766/velho   # 301 -> .../ola
curl -sL -o /dev/null -w "%{http_code} final=%{url_effective}\n" http://127.0.0.1:8766/velho   # 200 final=.../ola
curl -sI https://example.com | head -3                                              # cabeçalhos reais (HTTP/2)`, notes: [{ l: '1', t: '-w extrai variáveis da resposta; -o /dev/null descarta o corpo.' }, { l: '2', t: 'Sem -L, o curl mostra o 301 e o destino em Location.' }, { l: '3', t: 'Com -L segue o redirecionamento até o 200.' }, { l: '4', t: '-I envia um HEAD e mostra só os cabeçalhos; o servidor usou HTTP/2 nos testes.' }] }
  ],
  bestPractices: ['Use o método e o status que descrevem a semântica; não devolva 200 com erro no corpo.', 'Mantenha §GET§ sem efeitos colaterais e torne §PUT§ e §DELETE§ idempotentes.', 'Responda 401 sem credenciais e 403 sem permissão; não vaze se um recurso existe quando for sensível.', 'Defina §Content-Type§ correto e inclua §charset§ em texto.', 'Cacheie ativos estáticos com hash no nome e §immutable§; revalide HTML com ETag.', 'Marque cookies de sessão com §HttpOnly§, §Secure§ e §SameSite§, e nunca coloque dados sensíveis em URLs.'],
  mistakes: ['Alterar dados em GET.', 'Devolver 200 para tudo e esconder erros no JSON.', 'Confundir 401 com 403.', 'Usar §no-cache§ achando que ele "não guarda" (ele guarda, mas revalida; o que proíbe guardar é §no-store§).', 'Cachear respostas personalizadas em CDN sem §Vary§ ou §private§.', 'Repetir POSTs automaticamente após timeout sem chave de idempotência.'],
  market: `Todo desenvolvedor web e backend lida com HTTP diariamente. Entrevistas perguntam sobre métodos idempotentes, 401 x 403, cache e cookies de sessão; em produção, status corretos alimentam monitoramento (taxas de 4xx e 5xx), CDNs e balanceadores, e cabeçalhos de cache bem planejados reduzem custo e latência.`,
  summary: `HTTP é um protocolo de requisição e resposta sem estado: linha de início, cabeçalhos, linha em branco e corpo. Métodos têm semântica (GET seguro; PUT e DELETE idempotentes; POST nem seguro nem idempotente). Status por faixa: 2xx sucesso, 3xx redirecionamento, 4xx erro do cliente (401 sem credencial, 403 sem permissão), 5xx erro do servidor. Cache: §Cache-Control§ para frescor e ETag com 304 para validação. Cookies de sessão: §HttpOnly; Secure; SameSite§. Depure com §curl§.`,
  refs: [REF2.rfc9110, REF2.rfc9111, REF2.rfc9112, REF2.rfc6265, REF2.mdnHttp, REF2.mdnStatus, REF2.mdnCaching],
  cards: [
    { q: 'Qual a diferença entre 401 e 403?', a: '401: faltam credenciais válidas (não autenticado). 403: o usuário é conhecido, mas não tem permissão.' },
    { q: 'Quais métodos são idempotentes?', a: 'GET, HEAD, PUT, DELETE e OPTIONS (POST não é).' },
    { q: 'O que faz Cache-Control: no-store?', a: 'Proíbe qualquer cache de armazenar a resposta (dados sensíveis). no-cache permite guardar, mas exige revalidação.' },
    { q: 'O que significa um 304?', a: 'Não modificado: o cliente pode reutilizar a cópia em cache; a resposta não tem corpo.' },
    { q: 'Quais atributos tornam um cookie de sessão mais seguro?', a: 'HttpOnly, Secure e SameSite (Lax ou Strict).' }
  ]
},
{
  id: 'red-05', moduleId: 'm2', order: 5, minutes: 70, tags: ['https', 'tls', 'certificados', 'seguranca'],
  title: 'HTTPS e TLS: criptografia, certificados e confiança',
  objectives: ['Explicar o que o TLS garante (confidencialidade, integridade e autenticação do servidor) e o que não garante', 'Descrever em alto nível o handshake TLS 1.3, o papel do certificado e da cadeia de confiança', 'Interpretar nome do certificado (SAN, wildcard), validade, emissor e erros comuns', 'Explicar SNI, ALPN, HSTS e redirecionamento HTTP para HTTPS', 'Inspecionar uma conexão TLS com openssl e curl e emitir certificados com ACME'],
  intro: `Sem proteção, o HTTP trafega em texto puro: qualquer um no caminho (Wi-Fi público, provedor, proxy) pode **ler** e **alterar** o que passa, e nada prova que você está falando com o servidor verdadeiro. O **HTTPS** é o HTTP dentro de um túnel **TLS** (*Transport Layer Security*), que resolve esses três problemas. Hoje é o padrão da web: navegadores marcam sites HTTP como "não seguros" e vários recursos (Service Workers, geolocalização, câmera) só funcionam em HTTPS.`,
  theory: `### O que o TLS garante
1. **Confidencialidade**: o conteúdo é criptografado; quem intercepta vê apenas dados ilegíveis (e metadados como IP e, às vezes, o nome do site).
2. **Integridade**: qualquer alteração no caminho é detectada.
3. **Autenticação do servidor**: o certificado prova que o servidor é mesmo o dono do nome acessado (e, opcionalmente, o cliente também se autentica: **mTLS**, comum entre serviços).

O que o TLS **não** garante: que o site seja honesto (um site de golpe também pode ter HTTPS válido), que o servidor esteja livre de falhas, nem esconde por completo o destino da conexão.

### Duas criptografias em uma
- **Assimétrica** (par de chaves pública e privada): lenta, resolve a **troca segura de chaves** e a **assinatura**, sem segredo prévio entre as partes.
- **Simétrica** (a mesma chave nos dois lados): rápida, usada para criptografar o **volume de dados** depois que as pontas combinaram uma chave de sessão.

O TLS usa a assimétrica no início para combinar chaves e a simétrica durante a conversa. O **TLS 1.3** (RFC 8446) é a versão atual: remove algoritmos fracos e reduz o handshake a **1 RTT** (e 0-RTT em retomadas, com ressalvas de segurança). Versões antigas (SSL, TLS 1.0 e 1.1) são consideradas inseguras e foram desativadas.

### O handshake em alto nível (TLS 1.3)
1. **ClientHello**: o cliente informa as versões e cifras que aceita, o nome do servidor (**SNI**), os protocolos de aplicação desejados (**ALPN**, ex.: §h2§ ou §http/1.1§) e sua parte da troca de chaves.
2. **ServerHello + certificado**: o servidor escolhe os parâmetros, devolve sua parte da troca de chaves, o **certificado** e uma **assinatura** que prova que possui a chave privada.
3. O cliente **valida** o certificado; ambos derivam as chaves de sessão e passam a trocar dados criptografados.

Em nosso teste com §openssl s_client§, o servidor negociou **TLSv1.3** e a verificação do certificado foi bem-sucedida (§Verification: OK§).

### Certificados e cadeia de confiança
Um **certificado X.509** liga um **nome** a uma **chave pública** e é **assinado por uma autoridade certificadora (CA)**. Campos importantes:
- **Subject / SAN** (*Subject Alternative Name*): os nomes válidos (§example.com§, §*.example.com§). Os navegadores olham o **SAN**.
- **Emissor** (*issuer*), **validade** (§notBefore§, §notAfter§: certificados públicos modernos duram meses, não anos) e **chave pública**.
- **Wildcard** (§*.exemplo.com§): cobre **um** nível (§api.exemplo.com§), mas **não** §exemplo.com§ nem §a.b.exemplo.com§.

O cliente confia em um conjunto de **CAs raiz** instaladas no sistema ou navegador. O servidor envia o certificado dele e os **intermediários**; o cliente monta a **cadeia** até uma raiz confiável. Se faltar um intermediário, alguns clientes falham com "unable to get local issuer certificate" mesmo com o navegador funcionando (que busca o que falta). Em nosso teste, o certificado de §example.com§ tinha emissor "Cloudflare TLS Issuing ECC CA 3" e validade de cerca de três meses.

### Erros de certificado: o que cada um diz
| Erro | Causa típica |
|---|---|
| **Nome não corresponde** (*hostname mismatch*) | acesso por um nome que não está no SAN (ou por IP) |
| **Expirado** | renovação automática falhou |
| **Emissor não confiável / autoassinado** | CA desconhecida, certificado de desenvolvimento, falta de intermediário |
| **Relógio errado** | data do cliente fora da validade |
| **Revogado** | a CA invalidou o certificado |

Nunca "resolva" ignorando a verificação em produção (§curl -k§, §verify=False§, §NODE_TLS_REJECT_UNAUTHORIZED=0§): isso desliga justamente a autenticação do servidor e permite ataques de interceptação (*man-in-the-middle*). Para desenvolvimento local, use CAs locais (ferramentas como o §mkcert§) confiadas na sua máquina.

### SNI, ALPN e vários sites por IP
Como o certificado depende do nome, e muitos sites dividem o mesmo IP, o cliente envia o **SNI** no início do handshake para o servidor escolher o certificado certo. O **ALPN** negocia o protocolo de aplicação (HTTP/2, por exemplo) dentro do próprio handshake, sem viagens extras.

### HTTPS na prática
- **Redirecione** HTTP para HTTPS (§301§) e use **HSTS** (§Strict-Transport-Security: max-age=31536000; includeSubDomains§), que instrui o navegador a **só usar HTTPS** naquele domínio por um período, evitando downgrade.
- **Emissão e renovação automáticas** com o protocolo **ACME** e a CA gratuita **Let's Encrypt** (clientes como §certbot§ e §acme.sh§; servidores como Caddy fazem isso sozinhos). Monitore a data de expiração; certificados expirados derrubam sistemas inteiros.
- **Terminação TLS**: balanceadores e proxies reversos (Nginx, CDN) costumam terminar o TLS e falar HTTP (ou novo TLS) com os servidores internos. Saiba onde o tráfego está em texto puro dentro da sua arquitetura.
- **Conteúdo misto**: uma página HTTPS que carrega recursos por HTTP é bloqueada pelos navegadores.

### Ferramentas
§openssl s_client -connect host:443 -servername host§ mostra o handshake, a cadeia e o protocolo; §openssl x509 -noout -dates -subject -issuer§ lê um certificado; §curl -v https://host§ exibe a negociação TLS; §curl -w '%{time_appconnect}'§ mede o custo do TLS.`,
  concepts: [
    { term: 'TLS', def: 'Protocolo que cria um canal criptografado e autenticado sobre TCP; base do HTTPS.' },
    { term: 'Certificado X.509', def: 'Documento assinado por uma CA que liga um nome (SAN) a uma chave pública.' },
    { term: 'CA e cadeia de confiança', def: 'Autoridade que assina certificados; o cliente valida a cadeia até uma raiz confiável.' },
    { term: 'SAN e wildcard', def: 'SAN lista os nomes válidos; *.exemplo.com cobre apenas um nível de subdomínio.' },
    { term: 'SNI', def: 'Extensão do TLS em que o cliente informa o nome do site para o servidor escolher o certificado.' },
    { term: 'ALPN', def: 'Negociação do protocolo de aplicação (h2, http/1.1) durante o handshake.' },
    { term: 'HSTS', def: 'Cabeçalho que obriga o navegador a usar HTTPS no domínio por um período.' },
    { term: 'mTLS', def: 'TLS em que o cliente também apresenta um certificado; comum entre serviços.' },
    { term: 'ACME / Let\'s Encrypt', def: 'Protocolo e CA para emissão e renovação automáticas e gratuitas de certificados.' }
  ],
  examples: R`**Analogia:** o HTTPS é um **envio por transportadora com lacre e identidade verificada**. A **criptografia** é a caixa lacrada; a **integridade** é o lacre (se foi violado, você percebe); a **autenticação** é o documento de identidade do entregador emitido por um órgão em que você confia (a CA). O handshake é o momento em que as partes se identificam e combinam a "chave do cadeado" que só elas conhecem.

**Cenário real — o certificado expirou à meia-noite:** o monitor de uptime mostra "SSL error", e o navegador mostra "Sua conexão não é particular". Verifique: §echo | openssl s_client -connect site.com:443 -servername site.com 2>/dev/null | openssl x509 -noout -dates§. A causa é falha na renovação automática. Correção imediata: renovar; correção definitiva: **alerta** 30, 14 e 7 dias antes da expiração.

**Cenário real — "unable to get local issuer certificate" só no servidor:** o navegador funciona, mas o seu serviço Node.js falha. O servidor de destino não envia o certificado **intermediário**; navegadores o buscam, bibliotecas não. A solução é configurar o servidor para enviar a cadeia completa (§fullchain§).`,
  code: [
    { title: 'Inspecionando o TLS de um site real (executado)', lang: 'bash', code: R`echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | grep -E "^(subject|issuer)|Protocol|Verification"
# subject=CN=example.com
# issuer=C=US, O=SSL Corporation, CN=Cloudflare TLS Issuing ECC CA 3
# Protocol: TLSv1.3
# Verification: OK
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -dates
# notBefore=...  notAfter=...   (validade de cerca de 90 dias)`, notes: [{ l: '1', t: '-servername envia o SNI; sem ele o servidor pode devolver outro certificado.' }, { l: '2', t: 'Filtra as linhas relevantes do resultado.' }, { l: '4', t: 'Emissor e protocolo mostrados dependem do site e da data do teste.' }, { l: '7', t: 'O openssl x509 lê as datas de validade do certificado recebido.' }] },
    { title: 'Cabeçalhos e tempos de uma conexão HTTPS (executado)', lang: 'bash', code: R`curl -sI --http2 https://example.com | head -1        # HTTP/2 200
curl -sI --http1.1 https://example.com | head -1      # HTTP/1.1 200 OK
curl -s -o /dev/null -w "tls=%{time_appconnect}s total=%{time_total}s versão=%{http_version}\n" https://example.com`, notes: [{ l: '1', t: 'O ALPN negociou h2 durante o handshake.' }, { l: '2', t: 'Forçando HTTP/1.1, o mesmo servidor responde em outra versão do protocolo.' }, { l: '3', t: 'time_appconnect marca o fim do handshake TLS (acumulado desde o início).' }] }
  ],
  bestPractices: ['Use HTTPS em tudo, inclusive em ambientes internos sensíveis, e ative HSTS depois de validar.', 'Automatize a emissão e a renovação (ACME) e **monitore a expiração** com alertas.', 'Desabilite TLS 1.0 e 1.1 e prefira TLS 1.2 como mínimo e TLS 1.3 quando possível.', 'Envie a cadeia completa de certificados (§fullchain§).', 'Guarde chaves privadas com permissão restrita e nunca as versione no repositório.', 'Nunca desative a verificação de certificados em produção; use uma CA local para desenvolvimento.'],
  mistakes: ['Ignorar erros de certificado com §-k§ ou §verify=False§ "só para funcionar".', 'Acessar um serviço por IP e esperar que o nome do certificado case.', 'Esquecer a renovação do certificado e causar uma queda geral.', 'Esperar que um wildcard cubra o domínio raiz e subníveis profundos.', 'Achar que HTTPS significa que o site é confiável.', 'Carregar recursos HTTP em páginas HTTPS (conteúdo misto).'],
  market: `Certificados expirados, cadeias incompletas e misconfigurações de TLS estão entre as causas mais comuns de indisponibilidade e de falhas em integrações. Também fazem parte de requisitos de conformidade e de revisões de segurança (HSTS, versões mínimas, mTLS entre microsserviços).`,
  summary: `HTTPS é o HTTP sobre TLS: confidencialidade, integridade e autenticação do servidor via certificado assinado por uma CA em uma cadeia de confiança. O handshake do TLS 1.3 leva 1 RTT e usa SNI (nome do site) e ALPN (protocolo). Valide nome (SAN), emissor e validade; wildcard cobre um nível. Redirecione para HTTPS, use HSTS e automatize a renovação com ACME. Nunca desligue a verificação em produção.`,
  refs: [REF2.rfc8446, REF2.letsencrypt, REF2.mdnHttp],
  cards: [
    { q: 'O que o TLS garante?', a: 'Confidencialidade, integridade e autenticação do servidor (e, com mTLS, do cliente).' },
    { q: 'O que o SNI resolve?', a: 'Permite ao servidor escolher o certificado certo quando vários sites compartilham o mesmo IP.' },
    { q: 'Um certificado *.exemplo.com cobre exemplo.com?', a: 'Não. O wildcard cobre um nível (api.exemplo.com), mas não o domínio raiz nem a.b.exemplo.com.' },
    { q: 'O que faz o HSTS?', a: 'Obriga o navegador a usar apenas HTTPS naquele domínio pelo tempo informado, evitando downgrade.' }
  ]
},
{
  id: 'red-06', moduleId: 'm3', order: 6, minutes: 75, tags: ['protocolos', 'websocket', 'sse', 'grpc', 'tempo-real'],
  title: 'Protocolos de comunicação: polling, SSE, WebSockets, gRPC e outros',
  objectives: ['Comparar short polling, long polling, Server-Sent Events e WebSockets em direção, custo e complexidade', 'Explicar o upgrade de HTTP para WebSocket (101) e o formato básico de eventos do SSE', 'Reconhecer gRPC, SMTP, SSH e outros protocolos de aplicação e seus casos de uso', 'Escolher um protocolo a partir de requisitos (latência, direção, escala, infraestrutura)', 'Identificar problemas operacionais: proxies, timeouts ociosos, reconexão e escala de conexões persistentes'],
  intro: `O HTTP clássico é pergunta e resposta: o cliente sempre começa. Mas muitos produtos precisam que o **servidor avise primeiro**: chat, notificações, cotações ao vivo, progresso de um processamento, edição colaborativa. Existem várias técnicas para isso, cada uma com um custo. Escolher bem evita tanto o excesso de requisições inúteis quanto a complexidade desnecessária de manter milhares de conexões abertas.`,
  theory: `### O problema: o servidor precisa avisar
No HTTP puro, o servidor só responde quando o cliente pergunta. Quatro estratégias resolvem "como o cliente descobre que algo mudou":

**1. Short polling (consulta periódica).** O cliente pergunta a cada N segundos: "tem novidade?". Simples, funciona em qualquer infraestrutura e com cache/CDN. Desperdiça requisições (a maioria volta vazia) e tem **latência de até N segundos**. Bom para dados que mudam devagar e quando "um pouco atrasado" é aceitável.

**2. Long polling.** O cliente faz uma requisição e o servidor a **segura** até haver novidade (ou um tempo limite), responde e o cliente pergunta de novo. Reduz requisições vazias e a latência, mas cada espera ocupa uma conexão e o cliente reconecta o tempo todo. Foi muito usado antes de WebSockets e ainda serve como *fallback*.

**3. Server-Sent Events (SSE).** Uma **única** requisição HTTP de longa duração em que o servidor envia um fluxo de eventos de texto (§Content-Type: text/event-stream§). É **unidirecional** (servidor → cliente), usa HTTP comum (passa por proxies e HTTP/2), e o navegador oferece §EventSource§ com **reconexão automática** e retomada via §Last-Event-ID§. Ideal para notificações, painéis e progresso. Formato (definido na especificação HTML): linhas §campo: valor§, eventos separados por **linha em branco**:
\`\`\`
id: 7
event: preco
data: {"par":"BTC","valor":101}

: comentário (mantém a conexão viva)

data: primeira linha
data: segunda linha

\`\`\`
Campos: §data§ (várias linhas de §data§ são unidas com quebra de linha), §event§ (nome do evento; padrão "message"), §id§ e §retry§ (tempo de reconexão). Linhas iniciadas por §:§ são comentários.

**4. WebSockets.** Uma conexão **bidirecional e persistente** sobre TCP, iniciada como HTTP e **promovida** por um *upgrade* (RFC 6455). Depois disso, os dois lados enviam **mensagens** a qualquer momento, com pouquíssimo cabeçalho. O handshake é uma requisição §GET§ com §Upgrade: websocket§, §Connection: Upgrade§ e §Sec-WebSocket-Key§; o servidor responde **§101 Switching Protocols§**. As URLs usam §ws://§ e §wss://§ (§wss§ é WebSocket sobre TLS: use sempre). Ideal para chat, jogos, colaboração e qualquer coisa com tráfego frequente nos dois sentidos.

### Comparativo
| | Short polling | Long polling | SSE | WebSocket |
|---|---|---|---|---|
| Direção | cliente → servidor | cliente → servidor (espera) | servidor → cliente | **bidirecional** |
| Latência | até o intervalo | baixa | baixa | **mínima** |
| Conexões abertas | nenhuma | muitas, longas | uma, longa | uma, longa |
| Reconexão | n/a | do cliente | **automática** (EventSource) | **você implementa** |
| Infraestrutura | trivial | média | boa (HTTP) | exige suporte a *upgrade* e conexões longas |
| Formato | qualquer | qualquer | **texto** | texto ou binário |

### Efeitos operacionais de conexões longas
- **Timeouts ociosos** de proxies, balanceadores e firewalls derrubam conexões sem tráfego: envie *heartbeats* (comentários SSE, *ping/pong* no WebSocket).
- **Escala**: cada conexão consome um descritor e memória. Servidores orientados a eventos lidam com dezenas de milhares, mas é preciso ajustar limites (§ulimit -n§) e planejar como **distribuir mensagens** entre vários servidores (um *broker* como Redis Pub/Sub ou um serviço dedicado).
- **Reconexão e perda de mensagens**: conexões caem. Defina como o cliente **retoma** (ids de evento, "último visto") e como evita duplicatas. Não assuma entrega exatamente uma vez.
- **Autenticação**: o WebSocket do navegador não permite cabeçalhos personalizados no handshake; use cookies de sessão ou um token de curta duração na URL/primeira mensagem, validando a origem (§Origin§).
- **Segurança**: valide o §Origin§, aplique limites de taxa e tamanho de mensagem, e trate mensagens como entrada não confiável.

### Outros protocolos de aplicação que você vai encontrar
- **gRPC**: chamadas de procedimento remoto sobre **HTTP/2** com **Protocol Buffers** (formato binário com esquema). Gera clientes e servidores a partir de um contrato; suporta *streaming* nos dois sentidos. Excelente para comunicação **entre serviços**; menos amigável diretamente no navegador (exige um proxy gRPC-Web).
- **REST/JSON sobre HTTP**: o padrão para APIs públicas pelo suporte universal.
- **GraphQL**: uma linguagem de consulta sobre HTTP em que o cliente escolhe os campos.
- **SMTP / IMAP / POP3**: envio e leitura de e-mail. **SSH**: acesso remoto e túneis, porta 22. **MQTT**: mensagens leves publicar/assinar para IoT. **AMQP** (RabbitMQ) e o protocolo do Kafka: mensageria entre sistemas (curso de mensageria).

### Como escolher
Pergunte: **quem fala primeiro?** (só o servidor → SSE; os dois → WebSocket); **qual o ritmo?** (um evento por minuto não precisa de WebSocket); **qual a infraestrutura?** (proxies antigos favorecem polling ou SSE); **qual o custo operacional?** (conexões persistentes exigem monitoramento e escala diferentes); **quem consome?** (navegador x serviço interno). Comece pelo mais simples que atende ao requisito.`,
  concepts: [
    { term: 'Short polling', def: 'Cliente consulta o servidor a cada intervalo fixo; simples, mas com latência e requisições vazias.' },
    { term: 'Long polling', def: 'Requisição mantida aberta até haver novidade; reduz latência, mas reconecta continuamente.' },
    { term: 'SSE', def: 'Fluxo unidirecional de eventos de texto do servidor ao cliente sobre HTTP, com reconexão automática.' },
    { term: 'WebSocket', def: 'Conexão bidirecional persistente, iniciada por upgrade HTTP (101) e usada com ws:// ou wss://.' },
    { term: '101 Switching Protocols', def: 'Resposta que confirma a troca de protocolo em um upgrade (como WebSocket).' },
    { term: 'Heartbeat', def: 'Mensagem periódica para manter a conexão viva e detectar quedas.' },
    { term: 'gRPC', def: 'Framework de RPC sobre HTTP/2 com Protocol Buffers, com suporte a streaming.' },
    { term: 'Protocol Buffers', def: 'Formato binário compacto com esquema para serialização de dados.' },
    { term: 'Pub/Sub', def: 'Padrão em que publicadores enviam mensagens a tópicos e assinantes as recebem.' }
  ],
  examples: R`**Analogia:** *short polling* é **ligar para a pizzaria a cada 2 minutos** para perguntar se a pizza saiu. *Long polling* é ligar e **ficar na linha** até avisarem. *SSE* é **receber mensagens de texto** da pizzaria: só eles falam, e o celular reconecta sozinho se o sinal cair. *WebSocket* é **uma ligação telefônica aberta**: os dois falam a qualquer momento.

**Cenário real — qual escolher?**
- Painel que mostra o status de um deploy: eventos só do servidor, ritmo baixo → **SSE** (ou polling a cada 5 s).
- Chat com indicador de "digitando": tráfego nos dois sentidos, baixa latência → **WebSocket**.
- Atualização de um relatório pronto em alguns minutos → **polling** com intervalo crescente.
- Comunicação entre microsserviços com contratos tipados e *streaming* → **gRPC**.

**Cenário real — "o WebSocket cai a cada 60 s":** a conexão ocioso é cortada por um balanceador com *idle timeout* de 60 s. Solução: heartbeats a cada 25 a 30 s e/ou aumentar o timeout do balanceador; no cliente, reconexão com **backoff** exponencial.`,
  code: [
    { title: 'Aperto de mãos do WebSocket e fluxo SSE (formato dos dados)', lang: 'http', code: R`GET /chat HTTP/1.1
Host: exemplo.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`, notes: [{ l: '3-4', t: 'Pedido de upgrade: o cliente quer trocar HTTP por WebSocket na mesma conexão TCP.' }, { l: '5', t: 'Chave aleatória em base64; o servidor a transforma em Sec-WebSocket-Accept para provar que entendeu o protocolo.' }, { l: '8', t: '101 confirma a troca; a partir daqui a conexão passa a trocar quadros WebSocket, não mais mensagens HTTP.' }, { l: '11', t: 'Valores do exemplo são os do RFC 6455 (seção 1.3); conferimos que sha1(chave + GUID do protocolo) em base64 resulta no Accept mostrado. Não foi executado contra um servidor WebSocket.' }] },
    { title: 'Consumindo SSE no navegador (JavaScript; exemplo de uso, não executado)', lang: 'javascript', code: R`const origem = new EventSource('/eventos');
origem.addEventListener('preco', (e) => {
  const dado = JSON.parse(e.data);
  console.log('novo preço', dado.valor);
});
origem.onerror = () => console.log('conexão perdida; o navegador tenta reconectar sozinho');`, notes: [{ l: '1', t: 'EventSource abre a requisição de longa duração e cuida da reconexão e do Last-Event-ID.' }, { l: '2', t: 'Eventos com "event: preco" chegam neste listener; sem nome, chegam em "message".' }, { l: '6', t: 'Este trecho depende de um servidor SSE e de um navegador; foi apresentado como exemplo e não foi executado nesta etapa.' }] }
  ],
  bestPractices: ['Comece pelo mais simples (polling ou SSE) e adote WebSocket quando precisar de comunicação bidirecional.', 'Use sempre §wss://§ (TLS) e valide o §Origin§ e a autenticação.', 'Envie heartbeats e configure os timeouts de proxies e balanceadores.', 'Reconecte com backoff exponencial e jitter; projete a retomada com ids de evento.', 'Projete a distribuição de mensagens entre instâncias (broker ou serviço de mensageria).', 'Limite o tamanho e a taxa de mensagens e meça conexões ativas.'],
  mistakes: ['Usar WebSocket para tudo, inclusive para um evento por hora.', 'Esquecer o idle timeout do balanceador e ver conexões caindo no minuto.', 'Não tratar reconexão nem duplicatas e perder ou repetir mensagens.', 'Aceitar conexões WebSocket sem validar a origem e a autenticação.', 'Escalar para vários servidores sem um mecanismo para entregar a mensagem ao servidor que tem o cliente.', 'Fazer short polling agressivo (a cada 500 ms) e sobrecarregar o servidor.'],
  market: `Notificações, painéis em tempo real, colaboração e chat são requisitos comuns de produto. Saber escolher entre polling, SSE, WebSocket e gRPC (e prever o custo operacional) é uma pergunta clássica de entrevistas de system design e de decisões reais de arquitetura.`,
  summary: `Quando o servidor precisa avisar primeiro: short polling (simples, atrasado), long polling (reduz latência), SSE (unidirecional, sobre HTTP, com reconexão automática) e WebSocket (bidirecional, upgrade com 101, wss). Conexões longas exigem heartbeats, atenção a timeouts, reconexão com backoff e um plano de escala. gRPC (HTTP/2 + Protocol Buffers) serve a comunicação entre serviços. Escolha pelo mais simples que atende direção, ritmo e infraestrutura.`,
  refs: [REF2.rfc6455, REF2.sse, REF2.mdnWs, REF2.grpc],
  cards: [
    { q: 'Qual a principal diferença entre SSE e WebSocket?', a: 'SSE é unidirecional (servidor → cliente) sobre HTTP, com reconexão automática; WebSocket é bidirecional e exige upgrade e tratamento próprio de reconexão.' },
    { q: 'O que significa a resposta 101 em um handshake WebSocket?', a: 'Switching Protocols: o servidor aceitou trocar de HTTP para WebSocket na mesma conexão.' },
    { q: 'Por que enviar heartbeats?', a: 'Para evitar que proxies e balanceadores derrubem a conexão por inatividade e para detectar quedas.' },
    { q: 'Quando usar gRPC?', a: 'Em comunicação entre serviços que se beneficia de contrato tipado, formato binário e streaming sobre HTTP/2.' }
  ]
},
{
  id: 'red-07', moduleId: 'm3', order: 7, minutes: 75, tags: ['http2', 'http3', 'quic', 'desempenho', 'diagnostico'],
  title: 'HTTP/2, HTTP/3 e diagnóstico de desempenho',
  objectives: ['Explicar os problemas do HTTP/1.1 (conexões, bloqueio de cabeça de fila, cabeçalhos repetidos) e como o HTTP/2 os atenua', 'Descrever o que o HTTP/3 e o QUIC mudam: UDP, streams independentes, TLS embutido e migração de conexão', 'Entender a negociação (ALPN e Alt-Svc) e o fallback entre versões', 'Medir as fases de uma requisição com curl e interpretar DNS, TCP, TLS e TTFB', 'Aplicar um roteiro de diagnóstico de desempenho e conectividade de ponta a ponta'],
  intro: `A web de hoje carrega dezenas de recursos por página. O HTTP/1.1 foi desenhado para uma web bem mais simples e passou a ser um gargalo. O **HTTP/2** e o **HTTP/3** reorganizam o **transporte** da mesma semântica (métodos, status, cabeçalhos) para ser mais eficiente. O código da sua aplicação quase não muda, mas entender o que acontece por baixo ajuda a decidir sobre CDN, balanceador, número de conexões e a diagnosticar "por que está lento?".`,
  theory: `### A semântica é a mesma; o transporte muda
Métodos, códigos de status e cabeçalhos (RFC 9110) são idênticos em todas as versões. O que muda é **como as mensagens são carregadas**: texto sobre TCP no HTTP/1.1 (RFC 9112), **quadros binários multiplexados** sobre TCP no HTTP/2 (RFC 9113) e **quadros sobre QUIC (UDP)** no HTTP/3 (RFC 9114).

### Limites do HTTP/1.1
- **Uma resposta por vez por conexão.** Para paralelizar, navegadores abrem até ~6 conexões por origem. Cada conexão paga DNS (uma vez), TCP, TLS e *slow start*.
- **Bloqueio de cabeça de fila na camada HTTP:** em uma conexão, uma resposta lenta atrasa as seguintes.
- **Cabeçalhos repetidos** em texto (cookies grandes enviados a cada requisição).
- Contornos antigos (*domain sharding*, *sprites*, concatenação de arquivos) existiam por causa dessas limitações e hoje são, em geral, desnecessários ou prejudiciais.

### HTTP/2
Mantém a **mesma conexão TCP** (normalmente com TLS, negociado por ALPN: §h2§) e traz:
- **Multiplexação:** várias requisições e respostas em **streams** simultâneos e intercalados na mesma conexão. Uma única conexão basta por origem.
- **Formato binário** de quadros, mais eficiente de processar que texto.
- **Compressão de cabeçalhos (HPACK):** cabeçalhos repetidos viram referências a uma tabela compartilhada.
- **Priorização de streams** e controle de fluxo por stream.
- O **server push** foi proposto, mas na prática foi **abandonado** (navegadores removeram o suporte); prefira §preload§ e §103 Early Hints§.

**Limite que sobra:** o HTTP/2 ainda roda sobre **TCP**, que entrega um fluxo único de bytes. Se **um** segmento TCP se perde, **todos os streams** esperam a retransmissão (bloqueio de cabeça de fila na camada de transporte). Em redes com perdas (celular, Wi-Fi), isso reduz o benefício.

### HTTP/3 e QUIC
O **QUIC** (RFC 9000) é um transporte novo construído sobre **UDP** e implementado no espaço do usuário:
- **Streams independentes:** a perda de um pacote afeta apenas o stream a que ele pertence; os outros seguem.
- **TLS 1.3 integrado:** o handshake de transporte e o de criptografia acontecem **juntos** (1 RTT para a primeira conexão; 0-RTT possível para servidores já conhecidos, com cuidados com repetição de requisições).
- **Migração de conexão:** a conexão é identificada por um **ID**, não pela quádrupla IP/porta; trocar de Wi-Fi para dados móveis não derruba a sessão.
- **Sempre criptografado** e evolui sem depender de atualizações do kernel ou de equipamentos intermediários.

O **HTTP/3** é o HTTP mapeado sobre QUIC. Observação operacional: o tráfego é **UDP/443**, que alguns firewalls corporativos bloqueiam; por isso o navegador sempre precisa de **fallback** para HTTP/2 ou 1.1.

### Como o cliente descobre qual versão usar
- **ALPN** (dentro do handshake TLS): negocia §h2§ ou §http/1.1§ sem custo extra de viagem.
- **HTTP/3**: o servidor anuncia que o suporta por um cabeçalho **§Alt-Svc§** (RFC 7838), por exemplo §Alt-Svc: h3=":443"; ma=86400§ ("há HTTP/3 na porta 443, válido por 86400 s"), ou por registros DNS HTTPS. O navegador tenta HTTP/3 nas próximas visitas e, se falhar, volta ao TCP.
- Em nossa máquina de teste, o §curl§ usado **não tinha suporte a HTTP/3** (não listava o recurso), então o HTTP/3 aparece aqui como conceito; o HTTP/2 e o HTTP/1.1 foram testados de verdade contra §https://example.com§ (a mesma resposta veio como §HTTP/2 200§ e, com §--http1.1§, como §HTTP/1.1 200 OK§).

### Comparativo
| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transporte | TCP | TCP | **QUIC sobre UDP** |
| Formato | texto | binário | binário |
| Multiplexação | não (várias conexões) | sim | sim, **sem** bloqueio entre streams |
| Compressão de cabeçalhos | não | HPACK | QPACK |
| TLS | opcional | na prática, sim | **sempre** (embutido) |
| Handshake até o 1º byte | TCP + TLS | TCP + TLS | **1 RTT** (0-RTT possível) |

### Medindo onde o tempo vai
O §curl -w§ expõe os **tempos acumulados** de cada fase (em segundos desde o início):
- §time_namelookup§: DNS.
- §time_connect§: fim do handshake TCP. O custo do TCP é §connect − namelookup§.
- §time_appconnect§: fim do handshake TLS. Custo do TLS: §appconnect − connect§.
- §time_starttransfer§: primeiro byte da resposta (**TTFB**). O tempo de processamento do servidor é aproximadamente §starttransfer − appconnect§.
- §time_total§: fim do download.

Um roteiro de interpretação: **DNS lento** → resolvedor/TTL; **TCP lento** → distância (RTT) ou firewall; **TLS lento** → distância, sessão não reutilizada, certificado/cadeia grandes; **TTFB alto** → servidor ou banco lentos; **download lento** → tamanho da resposta (compressão, imagens) ou banda.

### Reduzindo o custo
- **Reutilize conexões** (keep-alive, HTTP/2) e mantenha pools de conexões a bancos e APIs.
- **CDN**: aproxima o conteúdo do usuário (menos RTT) e termina TLS na borda.
- **Compressão** (§gzip§, §br§) de texto; formatos de imagem eficientes; carregamento sob demanda.
- **Cache** correto (aula 4) elimina viagens inteiras.
- **Menos viagens**: agrupe chamadas, use paginação e campos selecionados.

### Roteiro de diagnóstico de ponta a ponta
1. **DNS:** §dig nome +short§ resolve para o IP esperado? Compare com um resolvedor público.
2. **Rota e porta:** §nc -vz IP 443§ conecta? "Refused" ou "timeout" (aula 2)?
3. **TLS:** §openssl s_client§ valida cadeia, nome e data?
4. **HTTP:** §curl -sv§ devolve o status esperado? Cabeçalhos de cache, redirecionamentos?
5. **Tempos:** §curl -w§ aponta qual fase domina?
6. **Servidor:** logs e métricas do proxy e da aplicação (aula 9 do curso de Linux).
Sempre registre o que mudou e compare com uma referência saudável.`,
  concepts: [
    { term: 'Multiplexação', def: 'Várias requisições e respostas intercaladas na mesma conexão, em streams independentes.' },
    { term: 'HPACK / QPACK', def: 'Compressão de cabeçalhos do HTTP/2 e do HTTP/3.' },
    { term: 'Head-of-line blocking', def: 'Atraso de dados prontos por causa de um item anterior pendente; no TCP, afeta todos os streams.' },
    { term: 'QUIC', def: 'Transporte sobre UDP com TLS 1.3 integrado, streams independentes e migração de conexão.' },
    { term: 'HTTP/3', def: 'HTTP sobre QUIC; mesma semântica de HTTP/1.1 e 2.' },
    { term: 'ALPN', def: 'Extensão do TLS que negocia o protocolo de aplicação (h2, http/1.1).' },
    { term: 'Alt-Svc', def: 'Cabeçalho que anuncia um serviço alternativo, como h3 na porta 443.' },
    { term: 'TTFB', def: 'Tempo até o primeiro byte da resposta; reflete rede e processamento no servidor.' },
    { term: 'Migração de conexão', def: 'Capacidade do QUIC de manter a conexão ao mudar de rede, pois ela é identificada por um ID.' }
  ],
  examples: R`**Analogia:** o HTTP/1.1 é um **caixa de supermercado que atende um cliente por vez em cada fila**; para ir mais rápido, abrem-se várias filas (conexões). O HTTP/2 é **uma única fila com pedidos intercalados**: o atendente anota vários pedidos em paralelo; mas, se o fornecedor atrasa uma entrega no balcão compartilhado (perda de pacote no TCP), tudo espera. O HTTP/3 dá **a cada pedido uma esteira própria**: se um atrasa, os outros seguem.

**Cenário real — "a página abre rápido no escritório e lenta no celular":** a rede móvel tem mais perda e RTT maior. Com HTTP/2 sobre TCP, cada perda trava todos os streams; com HTTP/3, só o stream afetado. Medir com §curl -w§ de ambientes diferentes mostra que o **TCP+TLS** dominam o tempo; uma CDN com HTTP/3 reduz a distância e as viagens.

**Cenário real — lido de uma medição:** §dns=0,03 tcp=0,05 tls=0,11 ttfb=0,45 total=0,52§ (valores ilustrativos). Fases: DNS 30 ms; TCP 20 ms (0,05−0,03); TLS 60 ms (0,11−0,05); servidor ≈ 340 ms (0,45−0,11) e download 70 ms. O gargalo é o **servidor**, não a rede: investigue a aplicação e o banco.`,
  code: [
    { title: 'Fases de uma requisição e versões do protocolo (executado contra example.com)', lang: 'bash', code: R`curl -s -o /dev/null -w "dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} http=%{http_version}\n" https://example.com
curl -sI --http2   https://example.com | head -1     # HTTP/2 200
curl -sI --http1.1 https://example.com | head -1     # HTTP/1.1 200 OK
curl -V | grep -o HTTP3 || echo "este curl não tem HTTP/3"`, notes: [{ l: '1', t: 'Tempos acumulados em segundos; subtraia para achar o custo de cada fase. Os números mudam a cada execução.' }, { l: '2', t: '--http2 pede h2 via ALPN.' }, { l: '3', t: '--http1.1 força a versão anterior no mesmo servidor.' }, { l: '4', t: 'Verifica se o curl instalado suporta HTTP/3; no nosso ambiente não suportava (saída: "este curl não tem HTTP/3").' }] },
    { title: 'Procurando o anúncio de HTTP/3 (executado contra www.cloudflare.com)', lang: 'bash', code: R`curl -sI https://www.cloudflare.com | grep -i alt-svc
# alt-svc: h3=":443"; ma=86400
curl -sI https://example.com | grep -i alt-svc || echo "example.com não anunciou Alt-Svc neste teste"`, notes: [{ l: '1', t: 'Se o cabeçalho aparecer, o servidor oferece HTTP/3; navegadores o usarão nas próximas conexões. O resultado depende do site e do momento do teste.' }, { l: '3', t: 'No nosso teste, example.com não enviou o cabeçalho; já o www.cloudflare.com anunciou h3 na porta 443 por 86400 s.' }] }
  ],
  bestPractices: ['Habilite HTTP/2 (e HTTP/3 quando fizer sentido) no proxy, CDN ou balanceador; mantenha fallback.', 'Elimine contornos do HTTP/1.1 (sharding de domínio, sprites) ao migrar; meça antes e depois.', 'Meça com §curl -w§ e métricas reais de usuários (RUM), não só testes locais.', 'Use CDN e cache para reduzir RTT e carga.', 'Reutilize conexões (keep-alive, pools) em cliente HTTP e banco de dados.', 'Libere UDP/443 nos firewalls se quiser HTTP/3 e monitore a taxa de fallback.'],
  mistakes: ['Achar que HTTP/2 elimina todo bloqueio de cabeça de fila (ele persiste no TCP).', 'Manter práticas do HTTP/1.1 que atrapalham no HTTP/2.', 'Medir uma única vez e concluir; os tempos variam e precisam de várias amostras.', 'Ignorar o TTFB e otimizar só o tamanho dos arquivos.', 'Bloquear UDP/443 e não perceber que os usuários caem para HTTP/2.', 'Confiar no navegador para diagnosticar sem separar DNS, TCP, TLS e servidor.'],
  market: `Desempenho e latência afetam diretamente conversão e retenção. Times de plataforma configuram HTTP/2 e HTTP/3 em CDNs e proxies, e engenheiros de backend e frontend usam medições por fase para localizar gargalos. É um assunto frequente em entrevistas ("o que acontece quando digito uma URL?").`,
  summary: `A semântica HTTP é a mesma; muda o transporte. O HTTP/1.1 usa texto e uma resposta por vez por conexão. O HTTP/2 multiplexa streams binários em uma conexão TCP com HPACK, mas sofre bloqueio de cabeça de fila no TCP. O HTTP/3 roda sobre QUIC (UDP), com TLS embutido, streams independentes e migração de conexão; é anunciado via §Alt-Svc§, com fallback. Meça DNS, TCP, TLS, TTFB e download com §curl -w§ e atue na fase dominante.`,
  refs: [REF2.rfc9113, REF2.rfc9114, REF2.rfc9000, REF2.rfc7838, RA.curlMan],
  cards: [
    { q: 'O que o HTTP/2 muda em relação ao HTTP/1.1?', a: 'Multiplexação de streams binários em uma conexão, compressão de cabeçalhos (HPACK) e priorização; a semântica é a mesma.' },
    { q: 'Por que o HTTP/3 usa UDP?', a: 'O QUIC, sobre UDP, implementa confiabilidade por stream e TLS embutido, evitando o bloqueio de cabeça de fila do TCP e permitindo evoluir no espaço do usuário.' },
    { q: 'Como um navegador descobre que um site tem HTTP/3?', a: 'Pelo cabeçalho Alt-Svc (ou por registros DNS HTTPS); ele tenta h3 nas próximas conexões e volta ao TCP se falhar.' },
    { q: 'Como saber o custo do TLS em uma requisição?', a: 'time_appconnect menos time_connect no curl -w.' }
  ]
}
];
