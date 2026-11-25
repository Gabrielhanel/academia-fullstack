// C4.4 — Autenticação e autorização. Aulas 1 a 3 (sessões x tokens; JWT; hash de senhas).
const R = String.raw;

export const REF = {
  owaspAuth: { title: 'OWASP — Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', kind: 'guia' },
  owaspSession: { title: 'OWASP — Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html', kind: 'guia' },
  owaspCsrf: { title: 'OWASP — Cross-Site Request Forgery Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html', kind: 'guia' },
  owaspPassword: { title: 'OWASP — Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', kind: 'guia' },
  owaspJwt: { title: 'OWASP — JSON Web Token Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html', kind: 'guia' },
  mdnCookies: { title: 'MDN — HTTP cookies', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', kind: 'doc' },
  mdnSetCookie: { title: 'MDN — Set-Cookie', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie', kind: 'doc' },
  expressSession: { title: 'express-session', url: 'https://github.com/expressjs/session', kind: 'doc' },
  rfc7519: { title: 'RFC 7519 — JSON Web Token (JWT)', url: 'https://www.rfc-editor.org/rfc/rfc7519', kind: 'especificação' },
  rfc8725: { title: 'RFC 8725 — JWT Best Current Practices', url: 'https://www.rfc-editor.org/rfc/rfc8725', kind: 'especificação' },
  rfc7517: { title: 'RFC 7517 — JSON Web Key (JWK)', url: 'https://www.rfc-editor.org/rfc/rfc7517', kind: 'especificação' },
  jose: { title: 'jose (panva) — JWT, JWS, JWE, JWK', url: 'https://github.com/panva/jose', kind: 'doc' },
  rfc9106: { title: 'RFC 9106 — Argon2', url: 'https://www.rfc-editor.org/rfc/rfc9106', kind: 'especificação' },
  nodeCrypto: { title: 'Node.js — crypto', url: 'https://nodejs.org/api/crypto.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'aut-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['autenticação', 'sessões', 'cookies', 'tokens', 'CSRF', 'SameSite', 'revogação'],
  title: 'Sessões x tokens: cookies seguros, fixação de sessão, CSRF e revogação',
  objectives: ['Distinguir autenticação de autorização e explicar sessões com estado e tokens sem estado', 'Configurar cookies de sessão seguros (HttpOnly, Secure, SameSite) e interpretar o Set-Cookie', 'Prevenir fixação de sessão e CSRF', 'Comparar a revogação em sessões e em tokens', 'Escolher entre sessão e token para um caso de uso'],
  intro: R`**Autenticação** responde "**quem é você?**"; **autorização**, "**o que você pode fazer?**". Depois do login, o servidor precisa **reconhecer o cliente** nas próximas requisições (o HTTP é sem estado): por uma **sessão** (identificador opaco, **estado no servidor**) ou por um **token** (credencial autocontida, **estado no cliente**). Aqui você mede, com **express-session 1.19.0**: o **cookie** emitido, a **troca de id no login**, o **CSRF** (403 sem token), o **cookie forjado** (401) e a **revogação imediata** no logout.`,
  theory: R`### Autenticação e autorização
- **Autenticação (AuthN)**: provar a identidade (senha, chave, biometria, **MFA**, federação).
- **Autorização (AuthZ)**: decidir **permissões** do usuário autenticado (aula aut-05).
- **Contabilização** (*accounting*/auditoria): registrar quem fez o quê.
Falhas de autenticação (**credenciais fracas, sessões mal gerenciadas, ausência de MFA**) e de autorização (**BOLA, funções sem checagem**) estão no topo do **OWASP Top 10** e do **OWASP API Security Top 10**.

### Sessões (stateful)
1. O usuário envia credenciais; o servidor **valida**.
2. O servidor cria um **registro de sessão** (no **servidor**: memória, Redis, banco) com um **id aleatório e imprevisível** e o devolve em um **cookie**.
3. Nas requisições seguintes o navegador **envia o cookie**; o servidor **procura** a sessão.
Medido (**express-session 1.19.0**, §MemoryStore§):
- **Sem login**: **401**, e **nenhum** §Set-Cookie§ foi emitido (com §saveUninitialized: false§: não criar sessão para anônimos);
- **Senha errada**: **401** "credenciais inválidas";
- **Login**: **200**, e o **id da sessão mudou** em relação ao anterior (§req.session.regenerate()§);
- **Cookie assinado**: §Set-Cookie: sid=<valor assinado>; Path=/; Expires=<data>; HttpOnly; SameSite=Lax§; um cookie com **assinatura forjada** → **401**.
**Vantagens**: **revogação imediata** (apagar a sessão), **controle total** no servidor, **tamanho pequeno** do cookie. **Custos**: **estado compartilhado** (Redis/banco) para escalar em várias instâncias; **latência** da consulta.
Medido: depois do **logout**, as sessões no servidor foram de **1 para 0** e **reutilizar o cookie antigo → 401**.

### Atributos do cookie
- **§HttpOnly§**: o JavaScript da página **não lê** o cookie (mitiga roubo por **XSS**);
- **§Secure§**: só vai por **HTTPS** (**ligue em produção**; o laboratório rodou em HTTP e por isso o deixou desligado);
- **§SameSite§**: **Strict** (nunca em requisições entre sites), **Lax** (padrão dos navegadores; vai em navegação **GET** top-level) ou **None** (exige **Secure**; para cenários entre sites);
- **§Max-Age§/§Expires§**: validade; **§Path§/§Domain§**: escopo (evite domínios amplos);
- **Prefixos** §__Host-§ (exige Secure, Path=/ e sem Domain) e §__Secure-§ endurecem o cookie;
- **Expiração**: **ociosa** (inatividade) e **absoluta** (máxima), **renovação** com cuidado; **sessões concorrentes** e **listagem/encerramento** de dispositivos.

### Fixação de sessão
O atacante **define** o id da sessão da vítima (por URL, cookie) **antes do login** e, depois, **usa o mesmo id** já autenticado. Defesa: **gerar um novo id no login** (e em mudanças de privilégio), **invalidando o anterior**: o experimento confirmou §regenerate§ (id mudou: **true**). Nunca aceite ids vindos da URL.

### CSRF (Cross-Site Request Forgery)
Como o navegador **anexa cookies automaticamente**, um site malicioso pode fazer o navegador da vítima **enviar uma requisição** (formulário, imagem) para o seu servidor **com o cookie de sessão**. Defesas, **em camadas**:
1. **§SameSite=Lax/Strict§** (barra a maioria dos casos modernos);
2. **Token CSRF** (sincronizador ou *double submit*): medido, §POST /transferir§ **sem** o §x-csrf-token§ → **403 "token CSRF inválido"**; **com** o token (guardado na sessão e devolvido no login) → **200**;
3. **Verificar §Origin§/§Referer§** e usar **cabeçalhos personalizados** (JSON com §Content-Type§ que exige pré-voo);
4. **Operações que mudam estado nunca em GET**.
(Testado só no servidor: **sem navegador entre sites**, portanto o efeito do SameSite **não foi executado**.) **APIs consumidas só por tokens em cabeçalho** (não cookies) **não sofrem CSRF**, mas **sofrem XSS** se o token ficar em local acessível ao JavaScript.

### Tokens (stateless)
O servidor emite uma **credencial assinada** (JWT, aula aut-02) com **identidade e validade**; as APIs **validam a assinatura** sem consultar um armazenamento. **Vantagens**: **escala horizontal simples**, **APIs entre serviços**, **mobile**. **Custos**: **revogação difícil** (o token vale até expirar), **tamanho** maior, **armazenamento no cliente** (onde guardar? **cookie HttpOnly** x memória x *localStorage*, este exposto a XSS), dados do token **ficam obsoletos**.

### Qual usar?
| Cenário | Recomendação |
|---|---|
| **Aplicação web própria** (mesmo site) | **sessão em cookie** (HttpOnly, Secure, SameSite) — simples e revogável |
| **SPA + API do mesmo domínio** | cookie de sessão (ou token em cookie HttpOnly) com CSRF |
| **Mobile / terceiros / entre serviços** | **tokens** (OAuth2, aula aut-04), **curtos** + refresh |
| **Revogação imediata exigida** | sessão, ou token **curto** + lista de revogação |
**Híbrido comum**: **access token curto (5–15 min)** + **refresh token** rotativo (aula aut-04). **Não** invente o seu protocolo: use **bibliotecas e padrões** (OWASP).

### Boas práticas
Ids **aleatórios** (≥ 128 bits, **CSPRNG**), **HTTPS** sempre, **regenerar** no login, **expirar** (ociosa e absoluta), **encerrar** de verdade no logout (servidor), **limitar** tentativas de login, **registrar** eventos de autenticação, **MFA** para contas sensíveis, **mensagens genéricas** de erro (não revele se o usuário existe), **não** colocar dados sensíveis em cookies.`,
  concepts: [
    { term: 'Autenticação', def: 'Verificação da identidade de quem acessa o sistema.' },
    { term: 'Autorização', def: 'Decisão sobre o que um usuário autenticado pode fazer.' },
    { term: 'Sessão', def: 'Registro de estado no servidor associado a um identificador enviado ao cliente.' },
    { term: 'HttpOnly', def: 'Atributo de cookie que impede a leitura pelo JavaScript da página.' },
    { term: 'SameSite', def: 'Atributo de cookie que restringe o envio em requisições entre sites.' },
    { term: 'Fixação de sessão', def: 'Ataque que impõe um identificador de sessão conhecido antes do login.' },
    { term: 'CSRF', def: 'Ataque que induz o navegador da vítima a enviar requisições autenticadas por cookies.' },
    { term: 'Token CSRF', def: 'Valor imprevisível exigido nas requisições que alteram estado para provar a origem legítima.' },
    { term: 'Token stateless', def: 'Credencial autocontida validada pela assinatura, sem consulta a um armazenamento.' },
    { term: 'Expiração absoluta', def: 'Prazo máximo de uma sessão, independente da atividade.' }
  ],
  examples: R`**Analogia:** a **sessão** é uma **pulseira numerada** de um parque: o número só significa algo para o **parque**, que consulta seu cadastro; se a pulseira for roubada, o parque **a desativa na hora**. O **token** é um **ingresso com selo holográfico** que qualquer portaria **confere sozinha**, mas que **vale até a data impressa** mesmo se alguém o perder. A **fixação de sessão** é **entregar a pulseira já numerada ao visitante** antes de ele se cadastrar; o **CSRF** é **enganar o visitante para assinar um pedido enquanto ele usa a pulseira**.

**Exemplo 1: login.** O id da sessão mudou (regenerate); o cookie saiu HttpOnly e SameSite=Lax.

**Exemplo 2: CSRF.** 403 sem token, 200 com token.

**Exemplo 3: logout.** Sessões 1 → 0 e o cookie antigo recebeu 401.`,
  code: [
    { title: 'Sessão segura com regenerate e CSRF (JavaScript, express-session 1.19.0; saídas medidas)', lang: 'js', code: R`import express from 'express';
import session from 'express-session';
import crypto from 'node:crypto';

const app = express(); app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, name: 'sid',
  cookie: { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 30 * 60_000 }     // secure: true em produção (HTTPS)
}));
app.post('/login', (req, res, next) => {
  if (!credenciaisValidas(req.body)) return res.status(401).json({ erro: 'credenciais inválidas' });   // mensagem genérica
  req.session.regenerate((err) => {                                                  // novo id: evita a fixação de sessão
    if (err) return next(err);
    req.session.usuario = req.body.usuario; req.session.csrf = crypto.randomBytes(16).toString('hex');
    res.json({ ok: true, csrf: req.session.csrf });
  });
});
app.post('/transferir', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ erro: 'não autenticado' });
  if (req.get('x-csrf-token') !== req.session.csrf) return res.status(403).json({ erro: 'token CSRF inválido' });   // 403 sem token
  res.json({ ok: true });
});
app.post('/logout', (req, res) => req.session.destroy(() => res.clearCookie('sid').json({ ok: true })));`, notes: [{ l: '14', t: 'regenerate muda o id e invalida o anterior.' }, { l: '20', t: 'O token CSRF vem do estado da sessão, não do cookie.' }] },
    { title: 'Cookie bem configurado (cabeçalho, medido no laboratório sem HTTPS)', lang: 'text', code: R`Set-Cookie: sid=s%3A<id>.<assinatura>; Path=/; Expires=<data>; HttpOnly; SameSite=Lax
# em produção acrescente: Secure; e considere o prefixo __Host-sid (Secure + Path=/ + sem Domain)`, notes: [{ l: '1', t: 'HttpOnly e SameSite=Lax apareceram no cabeçalho medido.' }] }
  ],
  bestPractices: ['Use cookies HttpOnly, Secure e SameSite e ids aleatórios.', 'Regenere o id no login e em mudanças de privilégio.', 'Aplique expiração ociosa e absoluta e destrua a sessão no servidor no logout.', 'Combine SameSite com token CSRF e verificação de Origin.', 'Não crie sessões para anônimos sem necessidade.', 'Prefira sessão em web própria e tokens curtos para APIs, mobile e terceiros.'],
  mistakes: ['Aceitar o id de sessão vindo da URL.', 'Não regenerar o id no login.', 'Cookie sem HttpOnly e Secure.', 'Confiar só no cookie para operações que mudam estado, sem CSRF.', 'Logout que só apaga o cookie no cliente.', 'Mensagens de erro que revelam se o usuário existe.'],
  market: R`Gestão de sessão é parte do dia a dia de toda aplicação web, e os erros (fixação, CSRF, cookies sem atributos) são achados frequentes em testes de intrusão e auditorias.`,
  summary: R`Sessões guardam estado no servidor e permitem revogação imediata; tokens são autocontidos e escalam, mas são difíceis de revogar. Medido no express-session 1.19.0: sem login, 401 e nenhum cookie; o login regenerou o id; o cookie saiu com HttpOnly e SameSite=Lax; cookie forjado deu 401; o token CSRF barrou o POST (403) e o aceitou com o token (200); o logout removeu a sessão (1 → 0) e o cookie antigo deu 401. Use Secure em produção e combine SameSite, token CSRF e Origin.`,
  refs: [REF.owaspSession, REF.owaspCsrf, REF.owaspAuth, REF.mdnCookies, REF.mdnSetCookie, REF.expressSession],
  cards: [
    { q: 'Qual a diferença entre autenticação e autorização?', a: 'Autenticação verifica quem é; autorização decide o que pode fazer.' },
    { q: 'Por que regenerar o id da sessão no login?', a: 'Para impedir a fixação de sessão (medido: o id mudou).' },
    { q: 'O que o atributo HttpOnly faz?', a: 'Impede que o JavaScript da página leia o cookie, mitigando o roubo por XSS.' },
    { q: 'Como defender de CSRF?', a: 'SameSite, token CSRF, verificação de Origin e nunca mudar estado em GET.' },
    { q: 'Qual a principal vantagem da sessão sobre o token?', a: 'Revogação imediata: o servidor apaga a sessão (medido: o cookie antigo deu 401).' }
  ]
},
{
  id: 'aut-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['JWT', 'JWS', 'JWKS', 'jose', 'alg none', 'rotação de chaves', 'revogação'],
  title: 'JWT: estrutura, assinatura, validações obrigatórias, ataques conhecidos e rotação de chaves',
  objectives: ['Descrever a estrutura de um JWT e por que o payload não é secreto', 'Assinar e verificar tokens com jose e validar iss, aud e exp', 'Reconhecer e bloquear os ataques alg=none e confusão de algoritmo', 'Usar JWKS e kid para rotacionar chaves', 'Comparar HS256, RS256 e EdDSA em tamanho e custo, e tratar a revogação'],
  intro: R`O **JWT** (*JSON Web Token*, RFC 7519) é um formato **compacto e assinado** para carregar **afirmações** (*claims*). É muito usado e muito **mal usado**. Aqui, com **jose 6.2.18**, você mede o **tamanho** (293 B em HS256, 592 B em RS256), vê cada **validação** falhar com um **código de erro** específico, constata que **alg=none** e a **confusão de algoritmo** são recusados, faz uma **rotação de chaves** por JWKS e compara o **custo** de assinar e verificar.`,
  theory: R`### Estrutura
§cabeçalho.payload.assinatura§, cada parte em **base64url**:
- **Cabeçalho**: §{"alg":"HS256","typ":"JWT"}§ (+ §kid§: qual chave);
- **Payload (claims)**: §sub§ (sujeito), §iss§ (emissor), §aud§ (audiência), §exp§ (expiração), §nbf§, §iat§, §jti§ (id) + claims próprias (§role§);
- **Assinatura**: sobre §cabeçalho.payload§ (HMAC, RSA, ECDSA ou EdDSA).
**O payload NÃO é criptografado**: qualquer um decodifica (medido: o payload apareceu em texto claro com §sub§, §role§, §iss§, §aud§, §exp§, §jti§). **Nunca** coloque **segredos** ou **dados pessoais sensíveis**; para sigilo existe o **JWE** (não executado). A assinatura garante **integridade e origem**, **não confidencialidade**.
Tamanhos medidos (mesmos claims): **HS256 293 bytes**, **EdDSA 336 bytes**, **RS256 592 bytes** — o JWT **viaja em toda requisição** (cabeçalho §Authorization: Bearer§); não o engorde com claims desnecessárias.

### Algoritmos
- **HS256** (HMAC, **segredo compartilhado**): **quem verifica também pode assinar** → ok quando **emissor e verificador são o mesmo sistema**;
- **RS256** (RSA) e **EdDSA/ES256** (curvas elípticas): **chave privada assina, chave pública verifica** → ideal quando **muitos serviços verificam** sem poder emitir; as chaves públicas são publicadas em um **JWKS** (RFC 7517);
- Escolha de projeto novo: **EdDSA** ou **ES256**; **RS256** é o mais compatível.

### Validações obrigatórias (medidas, jose 6.2.18)
Sempre **verifique**, e **fixe** o que espera:
§§§
await jwtVerify(token, chave, { issuer: 'https://auth.exemplo.com', audience: 'api-pedidos', algorithms: ['HS256'] });
§§§
| Caso | Resultado medido |
|---|---|
| token válido | aceito |
| **expirado** | **ERR_JWT_EXPIRED** ("exp" claim timestamp check failed) |
| expirado há 60 s com §clockTolerance: 120§ | aceito (a tolerância absorve diferença de relógio; mantenha-a **pequena**) |
| **audiência errada** | **ERR_JWT_CLAIM_VALIDATION_FAILED** (unexpected "aud" claim value) |
| **emissor errado** | **ERR_JWT_CLAIM_VALIDATION_FAILED** (unexpected "iss" claim value) |
| payload alterado (role=superadmin) | **ERR_JWS_SIGNATURE_VERIFICATION_FAILED** |
Sem conferir **§aud§**, um token emitido para **outra API** seria aceito (ataque de **substituição de token**). Sem **§iss§**, aceita-se um emissor qualquer. Sem **§exp§**, o token **nunca expira**.

### Ataques clássicos
1. **§alg: none§**: o atacante troca o cabeçalho para "sem assinatura". Medido: o token sem assinatura foi **recusado**: **ERR_JOSE_NOT_SUPPORTED** (alg none is not supported). Em bibliotecas antigas ou mal configuradas, **já foi aceito**: **sempre fixe os algoritmos** (§algorithms: [...]§).
2. **Confusão de algoritmo**: o servidor espera **RS256** e o atacante envia um **HS256** assinado **usando a chave pública como segredo HMAC** (a chave pública é pública!). Medido: com §algorithms: ['RS256']§ → **ERR_JOSE_ALG_NOT_ALLOWED**; mesmo sem a lista, a **chave RSA** foi recusada para HS256 ("CryptoKey instances must be of type 'secret' for the HS256 algorithm"): o **tipo da chave** protege. **Nunca** deixe o **cabeçalho do token decidir o algoritmo** de verificação.
3. **§kid§ malicioso** (injeção/traversal): trate o §kid§ como **chave de busca** em um **conjunto conhecido**, nunca como caminho de arquivo ou consulta SQL concatenada.
4. **Segredos HS256 fracos**: use **≥ 256 bits aleatórios**.
5. **Armazenamento**: *localStorage* é lido por XSS; prefira **cookie HttpOnly** ou memória com tokens **curtos**.
(RFC 8725, *JWT Best Current Practices*.)

### JWKS e rotação de chaves
O emissor publica um **JWKS** (§/.well-known/jwks.json§) com as **chaves públicas** (§kid§, §alg§, §use§). Os verificadores **buscam e cacheiam**. **Rotação**: 1) publica a **nova** chave (k2) **ao lado** da antiga (k1); 2) o emissor passa a **assinar com k2**; 3) depois da **vida máxima dos tokens antigos**, **remove k1**. Medido: com **k1 e k2** no JWKS, tokens de ambas as chaves foram **aceitos**; **depois de retirar k1**, o token de k1 → **ERR_JWKS_NO_MATCHING_KEY** e o de k2 → aceito. O §kid§ no cabeçalho indica qual chave usar.

### Custo: assinar e verificar (mediana de 200, µs)
| Operação | HS256 | RS256 (2048) | EdDSA |
|---|---|---|---|
| assinar | 633 | **3.381** | 696 |
| verificar | 585 | 650 | 1.156 |
(Inclui a montagem dos claims; **uma máquina**.) RS256 **assina** devagar e **verifica** rápido (perfil bom: **poucos emissores, muitos verificadores**). Em todos os casos, o custo é **bem menor** que uma **consulta a um banco** (milissegundos), o que sustenta a validação sem estado.

### Revogação e vida curta
O JWT **vale até §exp§**; revogá-lo antes exige **estado**: uma **lista de §jti§ revogados** (medido: antes, aceito; **depois de revogar o §jti§, recusado** por uma verificação adicional), **versão do usuário** no token vs banco, ou **tokens muito curtos (5–15 min)** + **refresh token** (aula aut-04). Não é "sem estado" se você precisa revogar: **decida o trade-off**.

### Quando NÃO usar JWT
Como **sessão de login** de uma aplicação web simples (cookies de sessão resolvem melhor e são revogáveis); para **guardar dados** do usuário (ficam obsoletos); com **dados sensíveis** no payload. Use JWT quando **vários serviços** precisam validar identidade **sem consultar um servidor central**, com **vida curta** e **audiência** bem definida.`,
  concepts: [
    { term: 'JWT', def: 'Formato compacto de token com cabeçalho, payload de claims e assinatura, em base64url.' },
    { term: 'Claim', def: 'Afirmação contida no payload do token, como sub, iss, aud e exp.' },
    { term: 'aud', def: 'Audiência: para quem o token foi emitido, validada pela API que o recebe.' },
    { term: 'exp', def: 'Momento de expiração do token.' },
    { term: 'JWKS', def: 'Conjunto publicado de chaves públicas em formato JWK usado para verificar tokens.' },
    { term: 'kid', def: 'Identificador da chave usada para assinar, presente no cabeçalho.' },
    { term: 'alg=none', def: 'Ataque que declara um token sem assinatura para burlar a verificação.' },
    { term: 'Confusão de algoritmo', def: 'Ataque que troca RS256 por HS256 usando a chave pública como segredo.' },
    { term: 'jti', def: 'Identificador único do token, útil para revogação e prevenção de reuso.' },
    { term: 'JWE', def: 'JSON Web Encryption: formato para tokens criptografados.' }
  ],
  examples: R`**Analogia:** o JWT é um **cartão de acesso com selo holográfico**: qualquer um **lê** o que está impresso (o payload não é secreto), mas **só quem emite faz o selo**. A portaria confere **o selo** (assinatura), **a data** (exp), **de que prédio é** (iss) e **para qual andar** (aud). O ataque **alg=none** é um **cartão sem selo que diz "dispense o selo"**; a **confusão de algoritmo** é **pegar o carimbo público da portaria e usá-lo como se fosse a chave secreta**. A **rotação** é **trocar o holograma** sem invalidar de uma vez todos os cartões em circulação.

**Exemplo 1: tamanhos.** 293 B (HS256), 336 B (EdDSA), 592 B (RS256).

**Exemplo 2: ataques.** alg=none recusado; HS256 com a chave pública recusado.

**Exemplo 3: rotação.** Com k1 fora do JWKS, o token de k1 falhou com ERR_JWKS_NO_MATCHING_KEY.`,
  code: [
    { title: 'Assinar e verificar com jose, fixando algoritmo, emissor e audiência (JavaScript; erros medidos)', lang: 'js', code: R`import { SignJWT, jwtVerify } from 'jose';
const segredo = new TextEncoder().encode(process.env.JWT_SEGREDO);     // >= 32 bytes aleatórios

const token = await new SignJWT({ role: 'admin' })
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setIssuer('https://auth.exemplo.com').setAudience('api-pedidos').setSubject('u1')
  .setIssuedAt().setExpirationTime('15m').setJti(crypto.randomUUID())
  .sign(segredo);

try {
  const { payload } = await jwtVerify(token, segredo, { issuer: 'https://auth.exemplo.com', audience: 'api-pedidos', algorithms: ['HS256'] });
} catch (e) {
  // e.code: ERR_JWT_EXPIRED | ERR_JWT_CLAIM_VALIDATION_FAILED | ERR_JWS_SIGNATURE_VERIFICATION_FAILED | ERR_JOSE_ALG_NOT_ALLOWED ...
  return res.status(401).json({ erro: 'token inválido' });          // não revele o motivo ao cliente
}`, notes: [{ l: '13', t: 'algorithms fixa o que o servidor aceita, bloqueando alg=none e confusão de algoritmo.' }, { l: '15', t: 'O motivo exato fica no log, não na resposta.' }] },
    { title: 'JWKS local e rotação de chaves (JavaScript, jose; resultado medido)', lang: 'js', code: R`import { createLocalJWKSet, createRemoteJWKSet, jwtVerify, exportJWK, generateKeyPair, SignJWT } from 'jose';
const k1 = await generateKeyPair('EdDSA'), k2 = await generateKeyPair('EdDSA');
const jwk1 = { ...(await exportJWK(k1.publicKey)), kid: 'k1', alg: 'EdDSA', use: 'sig' };
const jwk2 = { ...(await exportJWK(k2.publicKey)), kid: 'k2', alg: 'EdDSA', use: 'sig' };
const t1 = await new SignJWT({}).setProtectedHeader({ alg: 'EdDSA', kid: 'k1' }).setIssuer('i').setAudience('a').setExpirationTime('10m').sign(k1.privateKey);

await jwtVerify(t1, createLocalJWKSet({ keys: [jwk1, jwk2] }), { issuer: 'i', audience: 'a' });   // aceito
await jwtVerify(t1, createLocalJWKSet({ keys: [jwk2] }), { issuer: 'i', audience: 'a' });          // ERR_JWKS_NO_MATCHING_KEY
// em produção: createRemoteJWKSet(new URL('https://auth.exemplo.com/.well-known/jwks.json')) com cache`, notes: [{ l: '8', t: 'Depois de retirar k1, os tokens dele deixam de valer.' }, { l: '9', t: 'O conjunto remoto cacheia e atualiza as chaves.' }] }
  ],
  bestPractices: ['Fixe algoritmos, emissor e audiência na verificação.', 'Use tokens curtos e refresh tokens; revogue por jti quando necessário.', 'Nunca coloque segredos ou dados sensíveis no payload.', 'Rotacione chaves com JWKS e kid.', 'Não deixe o cabeçalho decidir o algoritmo.', 'Responda 401 sem detalhar o motivo e registre o código do erro.'],
  mistakes: ['Verificar a assinatura e esquecer aud e iss.', 'Aceitar alg none ou qualquer algoritmo do cabeçalho.', 'Usar HS256 com segredo fraco.', 'Tokens de longa duração sem revogação.', 'Guardar o token em localStorage em apps vulneráveis a XSS.', 'Tratar o payload como confidencial.'],
  market: R`JWT está em quase todas as APIs modernas, e a validação incorreta (alg=none, falta de aud) é um achado recorrente em auditorias; a RFC 8725 é referência obrigatória para quem o usa.`,
  summary: R`O JWT assina (não criptografa) claims: HS256 293 B, EdDSA 336 B, RS256 592 B. Medido com jose 6.2.18: expirado, aud e iss errados e payload adulterado falharam com códigos específicos; alg=none (ERR_JOSE_NOT_SUPPORTED) e a confusão RS256/HS256 (ERR_JOSE_ALG_NOT_ALLOWED) foram recusados; a rotação por JWKS invalidou o token da chave retirada (ERR_JWKS_NO_MATCHING_KEY); RS256 assina em ~3,4 ms e verifica em ~0,65 ms; a revogação exige uma lista de jti. Fixe algoritmos, emissor e audiência e use vida curta.`,
  refs: [REF.rfc7519, REF.rfc8725, REF.rfc7517, REF.jose, REF.owaspJwt],
  cards: [
    { q: 'O payload do JWT é secreto?', a: 'Não: é só base64url; a assinatura dá integridade, não confidencialidade.' },
    { q: 'Como bloquear alg=none e a confusão de algoritmo?', a: 'Fixando algorithms na verificação e usando chaves do tipo correto (medido: ambos recusados).' },
    { q: 'Por que validar aud e iss?', a: 'Para impedir o uso de tokens emitidos para outra API ou por outro emissor.' },
    { q: 'Como rotacionar chaves?', a: 'Publicar a nova no JWKS ao lado da antiga, assinar com a nova e remover a antiga após a vida máxima dos tokens.' },
    { q: 'Como revogar um JWT antes de expirar?', a: 'Com uma lista de jti revogados, versão do usuário ou tokens muito curtos.' }
  ]
},
{
  id: 'aut-03', moduleId: 'm1', order: 3, minutes: 80, tags: ['senhas', 'argon2', 'bcrypt', 'scrypt', 'sal', 'timingSafeEqual', 'rehash'],
  title: 'Hash de senhas: argon2id, scrypt e bcrypt, sal, custo, comparação em tempo constante e migração',
  objectives: ['Explicar por que SHA-256 simples não serve para senhas e o que torna um hash de senha adequado', 'Escolher e configurar argon2id, scrypt ou bcrypt medindo o custo', 'Usar sal, formato auto-contido e verificação em tempo constante', 'Conhecer o truncamento do bcrypt em 72 bytes', 'Planejar a migração de parâmetros (rehash no login)'],
  intro: R`Quando um banco de dados **vaza**, o que protege as senhas é **o custo de testar um palpite**. Um **SHA-256** testa **~78 mil palpites por segundo por núcleo** (medido); um **argon2id** com 64 MiB, só **~4**. Esta aula mede **scrypt, argon2id e bcrypt**, mostra o **sal**, o **truncamento do bcrypt**, a **comparação em tempo constante** e como **atualizar os parâmetros** sem pedir nova senha.`,
  theory: R`### O problema
Guardar senhas em **texto** é inaceitável; guardar **SHA-256(senha)** é quase o mesmo: funções de hash comuns são **rápidas por projeto**, e GPUs testam **bilhões por segundo**. Precisamos de **funções de derivação de chave lentas e custosas em memória**, com **sal** (valor aleatório **por usuário**) para impedir **tabelas pré-computadas** (*rainbow tables*) e **ataques em massa** (dois usuários com a mesma senha têm hashes diferentes).

### Custo medido (por verificação, mediana, uma máquina)
| Função | Parâmetros | Tempo | Palpites/s por núcleo |
|---|---|---|---|
| SHA-256 simples (**não use**) | 1 hash | ~0,013 ms | **~78.180** |
| **scrypt** | N=2^15, r=8, p=1 (~32 MiB = 128·N·r bytes) | **370,5 ms** | 2,7 |
| **argon2id** | m=64 MiB, t=3, p=4 (padrão do pacote) | **242,7 ms** | 4,1 |
| **argon2id** | m=19 MiB, t=2, p=1 (mínimo da OWASP) | **112,1 ms** | 8,9 |
| **bcrypt** (bcryptjs, puro JS) | custo 10 | 355,8 ms | 2,8 |
| **bcrypt** | custo 12 | **1.437,3 ms** | 0,7 |
Uma diferença de **~19.000x** entre SHA-256 e argon2id (m=64 MiB): 78.180 ÷ 4,1. **Ressalvas**: números **de CPU, por núcleo, de uma máquina**; atacantes usam **GPUs/ASICs** e **muitos núcleos**, e funções **duras em memória** (argon2, scrypt) **encarecem** esse hardware; o **bcryptjs** é **JavaScript puro** (mais lento que o bcrypt nativo).

### Qual escolher (OWASP)
1. **Argon2id** (RFC 9106; vencedor da *Password Hashing Competition*): **primeira escolha**. Mínimo recomendado pela OWASP: **m=19 MiB, t=2, p=1** (ou configurações equivalentes com mais memória e menos iterações).
2. **scrypt** (N=2^17, r=8, p=1 como referência da OWASP) quando argon2 não estiver disponível.
3. **bcrypt** (custo ≥ 10; **limite de 72 bytes**) para **sistemas legados** ou onde só ele existe.
4. **PBKDF2** (≥ 600.000 iterações com HMAC-SHA-256) quando **conformidade FIPS** exigir.
**Calibre pelo tempo**: escolha o custo que dê **~100–500 ms** na **sua** infraestrutura sob a carga esperada de logins (**login é um alvo de negação de serviço**: o custo é pago pelo **servidor** a cada tentativa: **limite a taxa** de tentativas, aula api-06) e **reavalie** a cada poucos anos.

### Sal e formato
O argon2 (e bcrypt) **gera o sal** e devolve um **texto autodescritivo**: §$argon2id$v=19$m=65536,t=3,p=4$<sal>$<hash>§ (97 caracteres), que traz **algoritmo, versão, parâmetros e sal**. Medido: **dois hashes da mesma senha são diferentes** (false), e **ambos verificam** a senha. Basta guardar **uma coluna de texto**; **verifique** com a função da biblioteca (§argon2.verify(hash, senha)§), nunca comparando strings à mão. Senha errada → **false**.
**Pimenta** (*pepper*): um segredo **fora do banco** (HSM/cofre) combinado à senha (HMAC antes do hash) — **camada extra** se o banco vazar sozinho; **complica a rotação** (não executado aqui).

### O truncamento do bcrypt (72 bytes)
O bcrypt só usa os **primeiros 72 bytes**. Medido: uma senha de **72 caracteres + "parte-final-1"** foi hasheada, e uma senha com **sufixo diferente** (**"parte-final-2"**) **também verificou: true** — o sufixo foi **ignorado**. Consequências: **senhas longas** (ou frases) perdem entropia; **pré-hash** (SHA-256 em base64 antes do bcrypt) é um remédio comum, com cuidados (**bytes nulos**, *password shucking*); com **argon2id** o problema não existe.

### Comparação em tempo constante
Compare **segredos** (tokens, HMACs, códigos) com §crypto.timingSafeEqual§: o tempo **não depende** de onde a diferença ocorre (evita **ataques de temporização**). Medido: iguais → **true**, diferentes → **false**; **tamanhos diferentes lançam** §ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH§ (compare **hashes de tamanho fixo** ou verifique o comprimento antes). Para **senhas**, a própria função de verificação do argon2/bcrypt já cuida.

### Migração: rehash no login
Parâmetros **envelhecem**; algoritmos também. A estratégia:
1. no **login bem-sucedido**, a senha em texto está **em memória**: verifique com o hash antigo; se §needsRehash§ for **true** (medido: hash com m=19 MiB **precisa de rehash** para a política m=64 MiB), **gere o novo hash** e **grave**;
2. para **hashes muito fracos/legados** (MD5, SHA-1), **envolva**: guarde §argon2(md5_antigo)§ e marque a versão, migrando para o hash direto no próximo login (**cobre quem não loga**);
3. **versione** o esquema (o próprio formato do hash já traz o algoritmo).

### Outras práticas de credenciais
- **Política**: **comprimento mínimo ≥ 8** (**≥ 15** sem MFA, NIST 800-63B), **permitir senhas longas e todos os caracteres**, **sem regras de composição forçadas**, **sem expiração periódica** obrigatória; **verificar contra senhas vazadas** (Have I Been Pwned, k-anonimato) e listas comuns;
- **MFA** (aula aut-06) e **passkeys/WebAuthn** como evolução;
- **Recuperação de senha**: **token aleatório de uso único e curta duração**, **hash do token** no banco, resposta **igual** para e-mails existentes e inexistentes;
- **Limite de tentativas**, **bloqueio gradual**, **detecção** de ataques e **alertas**;
- **Nunca registre** senhas em logs; **não envie** senhas por e-mail;
- **Erros genéricos** ("credenciais inválidas").
(Itens de política e recuperação **descritos** a partir de OWASP/NIST; **não executados**.)`,
  concepts: [
    { term: 'Hash de senha', def: 'Função lenta e unidirecional projetada para armazenar senhas de forma segura.' },
    { term: 'Sal (salt)', def: 'Valor aleatório por senha que impede tabelas pré-computadas e hashes iguais para senhas iguais.' },
    { term: 'Argon2id', def: 'Função de hash de senha dura em memória, recomendada como primeira escolha.' },
    { term: 'scrypt', def: 'Função de derivação de chave dura em memória, parametrizada por N, r e p.' },
    { term: 'bcrypt', def: 'Função de hash de senha baseada em Blowfish com fator de custo e limite de 72 bytes.' },
    { term: 'Pimenta (pepper)', def: 'Segredo guardado fora do banco e combinado à senha antes do hash.' },
    { term: 'Comparação em tempo constante', def: 'Comparação cujo tempo não depende de onde ocorre a diferença.' },
    { term: 'needsRehash', def: 'Verificação de que o hash armazenado usa parâmetros inferiores à política atual.' },
    { term: 'Rainbow table', def: 'Tabela pré-computada de hashes de senhas comuns.' },
    { term: 'Ataque de temporização', def: 'Dedução de segredos a partir de diferenças no tempo de resposta.' }
  ],
  examples: R`**Analogia:** guardar senhas com SHA-256 é trancar o cofre com uma **fechadura que abre com mil tentativas por segundo**; o argon2id é uma fechadura que **leva um quarto de segundo e uma mesa inteira de memória por tentativa**: o ladrão que roubou o cofre (o banco) precisaria de **anos** para testar as senhas comuns de todos. O **sal** é **uma chave-mestra diferente para cada gaveta**: o ladrão não reaproveita o trabalho de uma gaveta na outra. O **truncamento do bcrypt** é **a fechadura que só lê os primeiros 72 dígitos da sua senha**.

**Exemplo 1: custo.** SHA-256 ~78 mil/s; argon2id (64 MiB) ~4/s.

**Exemplo 2: sal.** Dois hashes da mesma senha são diferentes e ambos verificam.

**Exemplo 3: truncamento.** Sufixo diferente além de 72 bytes ainda verificou.`,
  code: [
    { title: 'Cadastro e login com argon2id e rehash (JavaScript, argon2 0.45.2)', lang: 'js', code: R`import argon2 from 'argon2';
const POLITICA = { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 };   // 64 MiB, ~243 ms (medido)

export async function cadastrar(db, email, senha) {
  const hash = await argon2.hash(senha, POLITICA);              // sal gerado e embutido no texto
  await db.query('insert into usuarios (email, senha_hash) values ($1, $2)', [email, hash]);
}
export async function entrar(db, email, senha) {
  const { rows: [u] } = await db.query('select id, senha_hash from usuarios where email = $1', [email]);
  // HASH_FALSO: um hash real calculado na partida com a mesma política (const HASH_FALSO = await argon2.hash('x', POLITICA)); verificá-lo
  // mesmo quando o usuário não existe iguala o tempo de resposta (um hash em formato inválido falharia rápido e denunciaria o usuário)
  const ok = await argon2.verify(u ? u.senha_hash : HASH_FALSO, senha).catch(() => false);
  if (!u || !ok) return null;                                    // mensagem genérica para o cliente
  if (argon2.needsRehash(u.senha_hash, POLITICA)) await db.query('update usuarios set senha_hash = $2 where id = $1', [u.id, await argon2.hash(senha, POLITICA)]);
  return { id: u.id };
}`, notes: [{ l: '11', t: 'Verificar mesmo sem usuário iguala o tempo de resposta (resistência à enumeração por temporização).' }, { l: '13', t: 'Rehash no login atualiza hashes antigos.' }] },
    { title: 'Comparação em tempo constante e o limite do bcrypt (JavaScript, resultados medidos)', lang: 'js', code: R`import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
const a = crypto.createHash('sha256').update('x').digest(), b = crypto.createHash('sha256').update('y').digest();
crypto.timingSafeEqual(a, a);   // true
crypto.timingSafeEqual(a, b);   // false
// Buffers de tamanhos diferentes lançam ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH

const longa = 'A'.repeat(72); const hb = await bcrypt.hash(longa + 'parte-final-1', 4);
await bcrypt.compare(longa + 'parte-final-2', hb);   // true: o sufixo além de 72 bytes foi ignorado`, notes: [{ l: '6', t: 'Compare hashes de tamanho fixo ou confira o comprimento antes.' }, { l: '9', t: 'bcrypt trunca em 72 bytes.' }] }
  ],
  bestPractices: ['Use argon2id (ou scrypt/bcrypt em legados) com parâmetros calibrados para ~100–500 ms.', 'Deixe a biblioteca gerar o sal e guardar o formato completo do hash.', 'Compare segredos com timingSafeEqual e use a função verify para senhas.', 'Faça rehash no login quando os parâmetros mudarem.', 'Limite tentativas de login e igualize o tempo para usuários inexistentes.', 'Verifique senhas contra listas vazadas e ofereça MFA.'],
  mistakes: ['Guardar SHA-256, MD5 ou texto puro.', 'Usar um sal global ou nenhum.', 'Ignorar o limite de 72 bytes do bcrypt.', 'Comparar hashes com ===.', 'Custo tão alto que facilita a negação de serviço no login.', 'Registrar senhas em logs ou enviá-las por e-mail.'],
  market: R`Vazamentos de bancos de dados são rotina; o hash de senhas correto é o que separa um incidente contido de um desastre. Perguntas sobre argon2, sal e rehash são clássicas em entrevistas de segurança.`,
  summary: R`Senhas exigem hashes lentos e duros em memória com sal. Medido (por núcleo, uma máquina): SHA-256 ~78 mil palpites/s; scrypt N=2^15 370,5 ms; argon2id 64 MiB 242,7 ms (4,1/s) e 19 MiB 112,1 ms; bcryptjs custo 10 355,8 ms e custo 12 1,4 s. Dois hashes da mesma senha diferem e ambos verificam; o bcrypt ignora o que passa de 72 bytes; timingSafeEqual lança para tamanhos diferentes; needsRehash detecta parâmetros antigos. Prefira argon2id, calibre o custo, limite tentativas e migre no login.`,
  refs: [REF.owaspPassword, REF.rfc9106, REF.nodeCrypto, REF.owaspAuth],
  cards: [
    { q: 'Por que SHA-256 não serve para senhas?', a: 'É rápido por projeto: medido ~78 mil palpites/s por núcleo contra ~4/s do argon2id (64 MiB).' },
    { q: 'Qual a primeira escolha da OWASP?', a: 'Argon2id (mínimo m=19 MiB, t=2, p=1), com scrypt, bcrypt e PBKDF2 como alternativas.' },
    { q: 'O que é o sal e por que dois hashes da mesma senha diferem?', a: 'Um valor aleatório por senha, gerado pela biblioteca e embutido no formato do hash.' },
    { q: 'Qual o limite do bcrypt?', a: '72 bytes: o que vem depois é ignorado (medido: sufixo diferente ainda verificou).' },
    { q: 'Como migrar parâmetros sem pedir nova senha?', a: 'Fazendo rehash no login bem-sucedido quando needsRehash for verdadeiro.' }
  ]
}
];
