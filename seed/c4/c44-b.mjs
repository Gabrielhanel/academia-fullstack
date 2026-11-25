// C4.4 — Autenticação e autorização. Aulas 4 a 6 (OAuth2 e OpenID Connect; RBAC e ABAC; SSO, MFA e identidade em escala).
import { REF } from './c44-a.mjs';
const R = String.raw;

export const REF2 = {
  rfc6749: { title: 'RFC 6749 — The OAuth 2.0 Authorization Framework', url: 'https://www.rfc-editor.org/rfc/rfc6749', kind: 'especificação' },
  rfc7636: { title: 'RFC 7636 — Proof Key for Code Exchange (PKCE)', url: 'https://www.rfc-editor.org/rfc/rfc7636', kind: 'especificação' },
  rfc9700: { title: 'RFC 9700 — Best Current Practice for OAuth 2.0 Security', url: 'https://www.rfc-editor.org/rfc/rfc9700', kind: 'especificação' },
  oauth21: { title: 'OAuth 2.1 (rascunho) — oauth.net', url: 'https://oauth.net/2.1/', kind: 'doc' },
  oidcCore: { title: 'OpenID Connect Core 1.0', url: 'https://openid.net/specs/openid-connect-core-1_0.html', kind: 'especificação' },
  oidcDiscovery: { title: 'OpenID Connect Discovery 1.0', url: 'https://openid.net/specs/openid-connect-discovery-1_0.html', kind: 'especificação' },
  owaspAuthz: { title: 'OWASP — Authorization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', kind: 'guia' },
  owaspApi: { title: 'OWASP API Security Top 10', url: 'https://owasp.org/API-Security/', kind: 'guia' },
  nistAbac: { title: 'NIST SP 800-162 — Guide to ABAC', url: 'https://csrc.nist.gov/pubs/sp/800/162/upd2/final', kind: 'especificação' },
  opa: { title: 'Open Policy Agent — Documentation', url: 'https://www.openpolicyagent.org/docs', kind: 'doc' },
  casl: { title: 'CASL — Authorization library', url: 'https://casl.js.org/', kind: 'doc' },
  rfc6238: { title: 'RFC 6238 — TOTP: Time-Based One-Time Password', url: 'https://www.rfc-editor.org/rfc/rfc6238', kind: 'especificação' },
  rfc4226: { title: 'RFC 4226 — HOTP', url: 'https://www.rfc-editor.org/rfc/rfc4226', kind: 'especificação' },
  webauthn: { title: 'W3C — Web Authentication (WebAuthn)', url: 'https://www.w3.org/TR/webauthn-3/', kind: 'especificação' },
  samlOverview: { title: 'OASIS — SAML 2.0 Technical Overview', url: 'https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html', kind: 'especificação' },
  nist63b: { title: 'NIST SP 800-63B — Authentication and Authenticator Management', url: 'https://pages.nist.gov/800-63-4/sp800-63b.html', kind: 'especificação' }
};

export const lessonsB = [
{
  id: 'aut-04', moduleId: 'm2', order: 4, minutes: 90, tags: ['OAuth2', 'OpenID Connect', 'PKCE', 'código de autorização', 'id_token', 'refresh token', 'rotação'],
  title: 'OAuth 2.0 e OpenID Connect: código de autorização com PKCE, id_token e refresh tokens rotativos',
  objectives: ['Distinguir OAuth 2.0 (autorização delegada) de OpenID Connect (autenticação)', 'Percorrer o fluxo de código de autorização com PKCE e verificar state, nonce, redirect_uri e o id_token', 'Diferenciar access token, id_token e refresh token e as audiências de cada um', 'Aplicar rotação de refresh tokens com detecção de reuso', 'Reconhecer os ataques que cada controle impede'],
  intro: R`**OAuth 2.0** permite que um aplicativo acesse recursos **em nome do usuário** sem conhecer a **senha** dele: é **autorização delegada**. **OpenID Connect (OIDC)** acrescenta a **identidade**: o **id_token** diz **quem** é o usuário. Aqui você executa, em localhost, um **servidor de autorização didático** (jose 6.2.18 + Express) e percorre o **código de autorização + PKCE**, os **ataques** (reuso de código, verifier errado, redirect_uri) e a **rotação de refresh token com detecção de reuso**. Nenhum provedor real foi usado.`,
  theory: R`### Papéis (RFC 6749)
- **Dono do recurso** (usuário); **cliente** (aplicativo); **servidor de autorização** (emite tokens: Keycloak, Auth0, Entra, Google...); **servidor de recursos** (a API).
- **Escopos** (§scope=pedidos:ler§): o que o cliente pede e o usuário **consente**.
- **OAuth 2.0 não é autenticação**: um *access token* diz "**este portador pode** X", não "**quem** é o usuário". Para login, use **OIDC**.

### Fluxos: use o código de autorização com PKCE
- **Authorization Code + PKCE** (S256): **o fluxo recomendado para quase tudo** (web, SPA, mobile). A RFC 9700 (*Security BCP*) e o **OAuth 2.1** o tornam padrão.
- **Client Credentials**: **máquina para máquina** (sem usuário).
- **Device Code**: TVs e CLIs.
- **Evite**: **Implicit** (token na URL) e **Resource Owner Password** (o app recebe a senha): **obsoletos**.

### O fluxo (como medido no laboratório)
1. O cliente gera um **§code_verifier§** aleatório e o **§code_challenge§** = §BASE64URL(SHA256(verifier))§, mais **§state§** (anti-CSRF) e **§nonce§** (anti-replay do id_token).
2. Redireciona o usuário a §/authorize?response_type=code&client_id&redirect_uri&scope=openid profile&state&nonce&code_challenge&code_challenge_method=S256§.
3. O servidor autentica o usuário, pede consentimento e **redireciona** para a **§redirect_uri§ registrada** com §?code=...&state=...§. Medido: **302**, e o §state§ voltou **igual**.
4. O cliente confere o §state§ e troca o código em §POST /token§ (com o **§code_verifier§**). Medido: **200** com §token_type, access_token, id_token, refresh_token, expires_in§.
5. O cliente **valida o id_token** e usa o **access token** na API.

### Por que cada controle
- **PKCE** (RFC 7636): se alguém **intercepta o código** (app malicioso no celular, log), **não consegue trocá-lo** sem o §code_verifier§. Medido: um **verifier errado** → **400 invalid_grant ("PKCE falhou")**; **sem PKCE** na autorização → **400**.
- **Código de uso único e curto** (60 s no laboratório): medido, **reutilizar o código** → **400 invalid_grant**.
- **redirect_uri exata e registrada**: um desvio permitiria **enviar o código a um site do atacante**. Medido: URI **não registrada** em §/authorize§ → **400** (e **nunca redirecione** para URIs não registradas); **diferente na troca** → **invalid_grant**.
- **§state§**: o cliente **gera, guarda** e **compara** na volta (impede **CSRF de login** e associa a resposta ao pedido).
- **§nonce§**: vai no id_token; o cliente confere que é o mesmo (impede **replay** de tokens).
- **Cliente público** (SPA/mobile) **não guarda segredo**: PKCE o protege; **cliente confidencial** (backend) autentica-se no §/token§ (**client secret**, **mTLS** ou **private_key_jwt**; **não executado** aqui).

### OpenID Connect: o id_token
É um **JWT assinado** com claims de **autenticação**: §iss§, §sub§ (id **estável** do usuário **naquele emissor**; use §iss+sub§ como chave de identidade, **não o e-mail**), §aud§ (**o client_id**), §exp§, §iat§, §nonce§, §auth_time§, §acr/amr§ (nível e métodos). Medido: o id_token válido trouxe §sub = u-1§, **nonce conferiu**, §aud = app1§; verificado contra o **JWKS** obtido do **discovery** (§/.well-known/openid-configuration§: §issuer, authorization_endpoint, token_endpoint, jwks_uri, code_challenge_methods_supported, id_token_signing_alg_values_supported§).
**Validações do cliente**: assinatura (JWKS), §iss§, §aud§ = meu client_id, §exp§, **§nonce§**. O **§UserInfo§** retorna claims adicionais.

### Três tokens, três audiências
| Token | Para quem | Conteúdo/uso |
|---|---|---|
| **id_token** | o **cliente** (§aud = app1§) | quem é o usuário; **não** envie à API |
| **access token** | a **API** (§aud = api-pedidos§, §scope§) | autoriza chamadas; **curto** (5–15 min) |
| **refresh token** | o **servidor de autorização** | obtém novos access tokens; **longo** e **sensível** |
Medido: o **access token** tinha §aud = api-pedidos§ e §scope = pedidos:ler§; usá-lo como **id_token** (§aud = app1§) falhou com **ERR_JWT_CLAIM_VALIDATION_FAILED**: **valide sempre a audiência** (aula aut-02). A **API** valida o **access token** (JWT assinado ou **introspecção**, RFC 7662, **não executada**).

### Refresh tokens com rotação
O refresh token permite sessões longas sem guardar o access token por muito tempo. **Rotação**: a cada uso, o servidor **emite um novo** e **invalida o anterior**; o **reuso** de um token antigo indica **roubo** e **revoga a família inteira**. Medido: usar §rt1§ → **200** e **novo token**; **reusar §rt1§** → **400 invalid_grant ("reuso detectado: família revogada")**; e o §rt2§ **legítimo**, depois disso → **400**: a família foi revogada (o usuário precisa **entrar de novo**). Armazene refresh tokens **em cookie HttpOnly** (web), **cofre do SO** (mobile), **nunca** em *localStorage*; **hash** no servidor.

### Erros comuns e ataques
- **Aceitar qualquer redirect_uri** ou usar **curingas**; **não validar state/nonce**; **access token na URL** (vaza em logs/Referer); **escopos amplos demais**; **tokens longos sem revogação**; **confiar no §email§** sem §email_verified§ e usar como chave (**tomada de conta** por provedores que não verificam); **validar só a assinatura** do id_token; **usar o id_token como access token**; **clientes confidenciais** com segredo no front; **mix-up** entre vários provedores (valide o §iss§ por provedor).
- **Logout**: encerrar a sessão **local** e, se necessário, no **provedor** (*RP-Initiated Logout*, **não executado**).

### Não escreva o servidor de autorização
O laboratório é **didático**. Em produção use **Keycloak, Auth0, Okta, Cognito, Entra ID, ZITADEL** ou bibliotecas certificadas (**openid-client**, **Passport**; **não executados** aqui): o protocolo tem **muitos detalhes de segurança** que um produto maduro já trata.`,
  concepts: [
    { term: 'OAuth 2.0', def: 'Framework de autorização delegada que emite tokens de acesso a clientes em nome do usuário.' },
    { term: 'OpenID Connect', def: 'Camada de identidade sobre o OAuth 2.0 que fornece o id_token.' },
    { term: 'PKCE', def: 'Extensão que vincula o código de autorização a um verificador secreto do cliente.' },
    { term: 'code_verifier / code_challenge', def: 'Segredo aleatório do cliente e seu hash SHA-256 enviado na autorização.' },
    { term: 'state', def: 'Valor aleatório que associa a resposta ao pedido e previne CSRF no fluxo.' },
    { term: 'nonce', def: 'Valor aleatório incluído no id_token para impedir replay.' },
    { term: 'id_token', def: 'JWT que afirma a autenticação do usuário, destinado ao cliente.' },
    { term: 'Access token', def: 'Credencial curta que autoriza chamadas a uma API, com audiência e escopos.' },
    { term: 'Refresh token rotativo', def: 'Refresh token substituído a cada uso, com revogação da família se houver reuso.' },
    { term: 'redirect_uri', def: 'URI registrada para onde o servidor devolve o usuário com o código de autorização.' }
  ],
  examples: R`**Analogia:** o OAuth é o **manobrista**: você entrega **uma chave que só abre o carro e só dirige 2 km** (token com escopo e validade), **sem dar as chaves de casa** (a senha). O **OIDC** é **o crachá que o manobrista confere na entrada** para saber **quem** está entregando. O **PKCE** é um **canhoto que só você tem**: mesmo que alguém pegue o **ticket de retirada** (o código), **sem o canhoto não leva o carro**. O **refresh rotativo** é **trocar o ticket de renovação a cada uso**: se alguém usa um ticket **já trocado**, o estacionamento **cancela todos os tickets** daquela família.

**Exemplo 1: ataques.** Código reutilizado e verifier errado: invalid_grant; redirect_uri não registrada: 400.

**Exemplo 2: audiências.** O access token como id_token falhou na validação de aud.

**Exemplo 3: refresh.** Reuso do rt1 revogou a família inteira.`,
  code: [
    { title: 'Cliente: iniciar o fluxo com PKCE, state e nonce (JavaScript; trecho do laboratório)', lang: 'js', code: R`import crypto from 'node:crypto';
const sha256b64 = (v) => crypto.createHash('sha256').update(v).digest('base64url');

const verifier = crypto.randomBytes(32).toString('base64url');          // segredo do cliente (guarde na sessão)
const state = crypto.randomBytes(8).toString('hex'), nonce = crypto.randomBytes(8).toString('hex');
const url = ISS + '/authorize?' + new URLSearchParams({
  response_type: 'code', client_id: 'app1', redirect_uri: 'http://127.0.0.1:9999/callback', scope: 'openid profile',
  state, nonce, code_challenge: sha256b64(verifier), code_challenge_method: 'S256'
});
// o navegador vai a url; na volta: confira "state" e troque o código:
const r = await fetch(ISS + '/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: 'app1', redirect_uri: 'http://127.0.0.1:9999/callback', code_verifier: verifier }) });`, notes: [{ l: '4', t: 'O verifier nunca vai ao navegador do atacante: só o challenge.' }, { l: '12', t: 'A troca exige o verifier, vinculando o código a este cliente.' }] },
    { title: 'Validar o id_token e o access token (JavaScript, jose 6.2.18; resultados medidos)', lang: 'js', code: R`import { jwtVerify, createRemoteJWKSet } from 'jose';
const disc = await (await fetch(ISS + '/.well-known/openid-configuration')).json();
const jwks = createRemoteJWKSet(new URL(disc.jwks_uri));

const id = await jwtVerify(tokens.id_token, jwks, { issuer: ISS, audience: 'app1' });
if (id.payload.nonce !== nonce) throw new Error('nonce não confere');             // anti-replay
const identidade = id.payload.iss + '|' + id.payload.sub;                          // chave estável: emissor + sub (não o e-mail)

// na API: o access token tem outra audiência
await jwtVerify(tokens.access_token, jwks, { issuer: ISS, audience: 'api-pedidos' });         // ok; scope = pedidos:ler
await jwtVerify(tokens.access_token, jwks, { issuer: ISS, audience: 'app1' });                // ERR_JWT_CLAIM_VALIDATION_FAILED`, notes: [{ l: '7', t: 'Use iss e sub como identidade.' }, { l: '11', t: 'Access token não vale como id_token.' }] }
  ],
  bestPractices: ['Use código de autorização com PKCE S256 e redirect_uris exatas.', 'Valide state, nonce, iss, aud, exp e a assinatura do id_token.', 'Mantenha access tokens curtos e use refresh tokens rotativos com detecção de reuso.', 'Use iss+sub como identidade, não o e-mail.', 'Peça escopos mínimos e valide-os na API.', 'Use um servidor de autorização maduro em vez de escrever o seu.'],
  mistakes: ['Usar OAuth como autenticação sem OIDC.', 'Fluxos implícito ou de senha.', 'redirect_uri com curingas ou sem registro.', 'Não verificar state e nonce.', 'Aceitar o id_token como access token.', 'Guardar tokens em localStorage ou na URL.'],
  market: R`Quase todo login social e todo SSO empresarial usam OAuth 2.0 e OIDC; entender PKCE, audiências e rotação de refresh tokens é pré-requisito em vagas de backend e segurança.`,
  summary: R`OAuth 2.0 delega autorização; OIDC acrescenta o id_token com a identidade. Medido em um servidor didático local: o código de autorização + PKCE devolveu access_token, id_token e refresh_token; state e nonce conferiram; o access token tinha aud da API e não valeu como id_token; código reutilizado, verifier errado e redirect_uri diferente deram invalid_grant; URI não registrada e ausência de PKCE deram 400; o reuso de um refresh token revogou a família. Use servidores maduros, PKCE, audiências corretas e tokens curtos.`,
  refs: [REF2.rfc6749, REF2.rfc7636, REF2.rfc9700, REF2.oauth21, REF2.oidcCore, REF2.oidcDiscovery],
  cards: [
    { q: 'OAuth 2.0 é autenticação?', a: 'Não: é autorização delegada; o OpenID Connect acrescenta a autenticação com o id_token.' },
    { q: 'O que o PKCE impede?', a: 'Que um código de autorização interceptado seja trocado por tokens sem o code_verifier.' },
    { q: 'Para quem é o id_token e para quem é o access token?', a: 'O id_token é para o cliente (aud = client_id); o access token é para a API (aud = a API).' },
    { q: 'O que é a rotação de refresh token?', a: 'Cada uso emite um novo token e invalida o anterior; o reuso revoga a família.' },
    { q: 'Qual a chave de identidade recomendada?', a: 'iss + sub, não o e-mail.' }
  ]
},
{
  id: 'aut-05', moduleId: 'm2', order: 5, minutes: 80, tags: ['autorização', 'RBAC', 'ABAC', 'IDOR', 'BOLA', 'negar por padrão', 'políticas'],
  title: 'Autorização: RBAC, ABAC, verificação de propriedade (IDOR/BOLA) e políticas',
  objectives: ['Modelar permissões com RBAC e reconhecer seus limites', 'Aplicar ABAC (atributos do usuário, recurso e contexto) e verificação de propriedade', 'Medir a diferença entre RBAC puro e ABAC em uma matriz de decisões e identificar o IDOR', 'Aplicar negar por padrão, menor privilégio e centralização das decisões', 'Testar a autorização com uma matriz'],
  intro: R`**Autorização** é onde mais se erra: o **OWASP API Security** coloca a **autorização por objeto (BOLA/IDOR)** em **primeiro lugar**. Papéis (**RBAC**) são ótimos para "**o que a função pode fazer**", mas **não sabem de quem é o recurso**. Aqui você mede: em **36 decisões** (4 usuários × 3 pedidos × 3 ações), o RBAC puro permitiria **6 acessos indevidos** a pedidos de **outros clientes** e o ABAC os nega.`,
  theory: R`### Modelos
- **ACL**: lista de quem pode o quê **por objeto**; simples, **difícil de administrar** em escala.
- **RBAC** (*Role-Based*): **usuários → papéis → permissões**. Fácil de entender e auditar. **Limites**: não expressa **"só os seus pedidos"**, **"só da sua loja"**, **"apenas em horário comercial"**; sofre **explosão de papéis**.
- **ABAC** (*Attribute-Based*): decisões por **atributos** do **sujeito** (papel, loja), do **recurso** (dono, status, loja) e do **ambiente** (hora, IP): **mais expressivo**; exige **modelagem e testes** cuidadosos (NIST SP 800-162).
- **ReBAC** (*Relationship-Based*): permissões por **relações** (dono, membro da equipe, "compartilhado com"); usado por sistemas de compartilhamento (Zanzibar/OpenFGA, **não executado**).
**Na prática, combine**: **RBAC** para a **ação** e **ABAC/propriedade** para o **objeto**.

### RBAC no laboratório
Papéis: §admin§ (ler, editar, apagar pedido; ler relatório), §gerente§ (ler, editar pedido; relatório), §cliente§ (ler e editar pedido). A função §rbac(usuario, permissão)§ só consulta a tabela do **papel**.

### ABAC/propriedade no laboratório
§abac(u, permissão, recurso)§: **1)** o papel precisa conceder a ação; **2)** **admin** vê tudo; **3)** **gerente**: só a **própria loja**; **4)** **cliente**: só o **próprio pedido** e **editar só se estiver "aberto"**.
**Matriz medida** (4 usuários × 3 pedidos × 3 ações = **36 decisões**):
- onde **RBAC permite e ABAC nega**: **9**;
- **acessos de clientes a pedidos de outros** que o **RBAC puro permitiria (IDOR)**: **6** (ex.: o usuário 1 lê e edita o pedido 11, que é do usuário 2);
- **cliente 1** edita o **próprio pedido aberto (10)**: **true**; o **próprio pedido pago (12)**: **false** (regra de estado); lê o **pedido do cliente 2**: **false**;
- **gerente de POA** lê pedido de **POA**: **true**; de **SP**: **false**; **apagar** (sem a permissão no papel): **false**;
- **papel desconhecido** (visitante): **false** → **negar por padrão**.
**Explosão de papéis** (cálculo): com **5 lojas × 4 departamentos**, um papel por combinação exigiria **20 papéis**; **uma regra** ABAC (§usuario.loja == recurso.loja && usuario.depto == recurso.depto§) cobre todas.

### BOLA/IDOR: o erro mais comum
Um endpoint §GET /pedidos/{id}§ que **busca pelo id** e devolve **sem conferir o dono** permite que **qualquer usuário autenticado** leia **qualquer pedido** trocando o número. Defesas:
1. **Carregue o recurso com o contexto do usuário**: §SELECT ... WHERE id = $1 AND dono_id = $2§ (ou **escopo do tenant**), devolvendo **404** quando não achar (**não revela** a existência);
2. **Verifique a propriedade** no **serviço**, **depois** de carregar, antes de agir (**em toda operação**, inclusive **editar/apagar** e **listas**);
3. **Ids não sequenciais** (UUIDs) **ajudam**, mas **não substituem** a verificação (segurança por obscuridade);
4. **Testes automatizados**: para cada rota, **dois usuários** — o dono acessa; o outro **não**;
5. **Segurança em nível de linha** no banco (RLS do PostgreSQL, curso C3; **não executado** aqui) como **defesa em profundidade**.
Também: **BFLA** (função sem checagem, ex.: rota de admin acessível a qualquer usuário), **propriedades** (campos que o usuário não deveria alterar: **mass assignment**, aula nst-03).

### Princípios
- **Negar por padrão**; **menor privilégio**; **separação de funções**; **defesa em profundidade** (gateway, serviço, banco);
- **Centralizar** as decisões em **um módulo/serviço de políticas** (ou **OPA/Rego**, **CASL**; **não executados**) em vez de espalhar §if (user.role === ...)§ pelo código;
- **Decisão com contexto**: **quem** (sujeito), **o quê** (ação), **em quê** (recurso), **quando/onde** (ambiente);
- **Auditoria**: registre **decisões negadas** e **ações sensíveis**;
- **Revogação** e **expiração** de permissões (acesso temporário);
- **Permissões no token**? Escopos/papéis **no token são fotografias** (podem ficar **obsoletos**): para decisões **sensíveis**, **consulte o estado atual**.

### Testando a autorização
**Matriz** usuário × recurso × ação com o resultado **esperado** (como no experimento): documenta a **política** e protege contra regressões. **Testes negativos** (o que **não** deve ser permitido) valem **mais** que os positivos. Combine com **testes de contrato** (aula api-03) e **revisões** de segurança.`,
  concepts: [
    { term: 'RBAC', def: 'Controle de acesso baseado em papéis atribuídos aos usuários.' },
    { term: 'ABAC', def: 'Controle de acesso baseado em atributos do sujeito, do recurso e do ambiente.' },
    { term: 'ReBAC', def: 'Controle de acesso baseado em relações entre sujeitos e recursos.' },
    { term: 'BOLA/IDOR', def: 'Acesso a objetos de outros usuários por falta de verificação de propriedade.' },
    { term: 'BFLA', def: 'Acesso a funções privilegiadas por falta de verificação de autorização na função.' },
    { term: 'Explosão de papéis', def: 'Crescimento excessivo do número de papéis para cobrir combinações de atributos.' },
    { term: 'Negar por padrão', def: 'Política em que o acesso só é concedido por regra explícita.' },
    { term: 'Menor privilégio', def: 'Princípio de conceder apenas as permissões estritamente necessárias.' },
    { term: 'Matriz de autorização', def: 'Tabela de testes usuário × recurso × ação com o resultado esperado.' },
    { term: 'RLS', def: 'Segurança em nível de linha aplicada pelo próprio banco de dados.' }
  ],
  examples: R`**Analogia:** o **RBAC** é o **crachá de função** do hospital ("enfermeiro pode ver prontuários"); mas o crachá **não diz de quais pacientes**. O **ABAC/propriedade** é a **regra do plantão**: "enfermeiro vê **os pacientes da sua ala**, **durante o seu turno**". Sem ela, qualquer enfermeiro abre **o prontuário de qualquer paciente** só trocando o número da cama — é o **IDOR**. **Negar por padrão** é a **porta trancada por padrão**; abrir exige uma **autorização escrita**.

**Exemplo 1: matriz.** 36 decisões: 9 divergem entre RBAC e ABAC.

**Exemplo 2: IDOR.** 6 acessos a pedidos alheios que o RBAC puro permitiria.

**Exemplo 3: estado.** O cliente edita o pedido aberto (true) mas não o pago (false).`,
  code: [
    { title: 'RBAC + ABAC com negar por padrão (JavaScript; decisões medidas)', lang: 'js', code: R`const papeis = {
  admin:   ['pedido:ler', 'pedido:editar', 'pedido:apagar', 'relatorio:ler'],
  gerente: ['pedido:ler', 'pedido:editar', 'relatorio:ler'],
  cliente: ['pedido:ler', 'pedido:editar']
};
const rbac = (u, perm) => (papeis[u.papel] ?? []).includes(perm);

function abac(u, perm, rec) {
  if (!rbac(u, perm)) return false;                                        // 1) o papel concede a ação (e papel desconhecido nega)
  if (u.papel === 'admin') return true;
  if (u.papel === 'gerente') return rec.loja === u.loja;                   // 2) gerente: só a própria loja
  return rec.donoId === u.id && (perm !== 'pedido:editar' || rec.status === 'aberto');   // 3) cliente: só o seu e editar só se aberto
}
// 36 decisões: RBAC permite e ABAC nega em 9; 6 delas são IDOR (cliente acessando pedido de outro)`, notes: [{ l: '8', t: 'Papel desconhecido não está na tabela: nega.' }, { l: '13', t: 'A regra de propriedade e de estado vive no ABAC.' }] },
    { title: 'Carregar o recurso já com o escopo do usuário (SQL e Node)', lang: 'js', code: R`app.get('/pedidos/:id', async (req, res) => {
  const { rows: [p] } = await db.query('select * from pedidos where id = $1 and cliente_id = $2', [req.params.id, req.usuario.id]);
  if (!p) return res.status(404).json({ type: 'about:blank', title: 'Não encontrado', status: 404 });   // não revela se existe de outro dono
  res.json(p);
});
// teste: com o usuário B, GET /pedidos/<id de A> deve devolver 404 (e o dono A recebe 200)`, notes: [{ l: '2', t: 'A consulta já inclui o dono: não há pedido alheio para vazar.' }] }
  ],
  bestPractices: ['Combine RBAC (ação) com ABAC/propriedade (objeto).', 'Negue por padrão e aplique o menor privilégio.', 'Verifique a propriedade em toda operação, inclusive listas, editar e apagar.', 'Centralize as decisões em um módulo de políticas.', 'Teste uma matriz usuário × recurso × ação, com casos negativos.', 'Use RLS e escopo de tenant como defesa em profundidade.'],
  mistakes: ['Checar só o papel e esquecer o dono do recurso.', 'Confiar em ids não sequenciais como proteção.', 'Espalhar if de papéis pelo código.', 'Tratar permissões no token como sempre atuais.', 'Devolver 403 que revela a existência de recursos alheios quando 404 seria mais adequado.', 'Não testar os casos que devem ser negados.'],
  market: R`BOLA/IDOR e BFLA lideram os incidentes de API; revisões de segurança cobram matrizes de autorização e prova de que o dono é verificado em toda rota.`,
  summary: R`RBAC define a ação permitida por papel; ABAC e a verificação de propriedade restringem o objeto. Na matriz medida (4 usuários × 3 pedidos × 3 ações = 36 decisões), o RBAC puro e o ABAC divergiram em 9, e 6 eram acessos de clientes a pedidos de outros (IDOR); o cliente edita o pedido aberto mas não o pago, o gerente só vê a própria loja e papéis desconhecidos são negados. Negue por padrão, centralize as políticas e teste a matriz.`,
  refs: [REF2.owaspAuthz, REF2.owaspApi, REF2.nistAbac, REF2.opa, REF2.casl],
  cards: [
    { q: 'Qual o limite do RBAC?', a: 'Não sabe de quem é o recurso nem expressa atributos; leva a IDOR e à explosão de papéis.' },
    { q: 'O que é BOLA/IDOR e como evitar?', a: 'Acessar objetos de outros; carregar o recurso com o escopo do dono e testar com dois usuários.' },
    { q: 'Por que negar por padrão?', a: 'Porque esquecer uma regra deixa a porta fechada, não aberta (medido: papel desconhecido → false).' },
    { q: 'Quando devolver 404 em vez de 403?', a: 'Quando não se quer revelar a existência de recursos de outros usuários.' },
    { q: 'Como testar a autorização?', a: 'Com uma matriz usuário × recurso × ação, com os resultados esperados e casos negativos.' }
  ]
},
{
  id: 'aut-06', moduleId: 'm3', order: 6, minutes: 90, tags: ['SSO', 'MFA', 'TOTP', 'WebAuthn', 'SAML', 'federação', 'identidade', 'projeto'],
  title: 'SSO, MFA e identidade em escala: TOTP verificado, federação e o projeto de autenticação completa',
  objectives: ['Explicar SSO e federação (OIDC e SAML) e como uma aplicação delega o login', 'Implementar TOTP (RFC 6238) conferido por vetores oficiais, com janela e proteção contra reuso', 'Comparar os fatores de MFA e conhecer passkeys/WebAuthn', 'Tratar identidade em escala: provisionamento, ciclo de vida, recuperação e auditoria', 'Planejar o projeto integrador "Autenticação completa"'],
  intro: R`Em empresas, ninguém quer **uma senha por sistema**: o **SSO** (*Single Sign-On*) delega o login a um **provedor de identidade** (IdP) por **OIDC** ou **SAML**. E uma senha **sozinha** é fraca: o **MFA** acrescenta um **segundo fator**. Aqui você **implementa o TOTP** com **node:crypto** e o **confere com os 6 vetores de teste da RFC 6238** (todos **ok**), com **janela de ±1 passo** e **recusa de reuso**.`,
  theory: R`### SSO e federação
**SSO**: autenticar **uma vez** no IdP e acessar **várias aplicações** (provedores de serviço, *RP/SP*). Protocolos:
- **OpenID Connect** (aula aut-04): moderno, **JSON/JWT**, ótimo para **web, SPA, mobile e APIs**;
- **SAML 2.0**: **XML**, muito presente em **SaaS corporativo** (**não executado** aqui);
- **Kerberos/LDAP**: redes corporativas legadas.
**Fluxo OIDC de SSO**: a aplicação redireciona ao IdP; se o usuário **já tem sessão no IdP**, o IdP **emite o código sem pedir senha**; a aplicação cria **sua sessão local**. **Duas sessões** existem: a do **IdP** e a de **cada aplicação**; o **logout** exige decidir se encerra **só a local** ou **a global** (*single logout*, **difícil** de acertar; **não executado**).
**Federação**: **confiança entre domínios** (o IdP da empresa A autentica usuários que acessam o serviço da empresa B); **login social** (Google, Microsoft) é federação para consumidores.
**Cuidados**: identidade = §iss + sub§ (**não o e-mail**); **vincular contas** só com e-mail **verificado** e **confirmação**; validar o **§iss§ por provedor** (*mix-up*); **mapeamento de grupos/papéis** do IdP para **papéis** da aplicação (**revisão regular**).

### MFA: fatores
| Fator | Exemplo | Observação |
|---|---|---|
| **Conhecimento** | senha, PIN | roubável por *phishing*, vazamento |
| **Posse** | **TOTP** (app), chave de segurança, SMS | **SMS é o mais fraco** (troca de SIM, SS7); preferir app ou chave |
| **Inerência** | biometria | geralmente **local ao dispositivo** |
**Phishing-resistant**: **passkeys/WebAuthn (FIDO2)**: **par de chaves por site**, a chave privada **fica no dispositivo/gerenciador**, e a **origem** é vinculada: **o phishing não funciona**. É a **direção** (substituir senhas); **não executado** aqui (exige navegador/autenticador).

### TOTP (RFC 6238) — implementado e verificado
O **TOTP** é o **HOTP** (RFC 4226) com o **contador = tempo**: §contador = floor(T / 30)§; §HMAC-SHA1(segredo, contador 8 bytes big-endian)§; **truncamento dinâmico** → **6 dígitos**.
§§§
const hotp = (segredo, contador, digitos = 6) => {
  const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(contador));
  const h = crypto.createHmac('sha1', segredo).update(buf).digest(); const o = h[h.length - 1] & 0xf;
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** digitos).padStart(digitos, '0');
};
§§§
**Medido contra os vetores oficiais** (segredo §"12345678901234567890"§, SHA-1, 8 dígitos): T=**59** → **94287082**; **1111111109** → **07081804**; **1111111111** → **14050471**; **1234567890** → **89005924**; **2000000000** → **69279037**; **20000000000** → **65353130**: **os 6 conferiram**. Conferir contra **vetores publicados** é **a forma correta** de validar criptografia implementada à mão (em produção, **prefira uma biblioteca** madura).
**Verificação segura**:
- **Janela** de **±1 passo** (tolera relógios dessincronizados): medido, o código do **passo atual** → **aceito (deslocamento 0)**; o do **passo anterior** → **aceito (-1)**; o de **3 passos atrás (90 s)** → **recusado**; um código errado → **recusado**;
- **Impedir reuso** no mesmo passo: medido, o **mesmo código de novo** → **"recusado: código já usado"** (guarde o **último passo aceito** por usuário);
- **Limitar tentativas** (espaço de 10^6): com **5 tentativas** a chance de adivinhar é **0,0005%** (cálculo); com **janela ±1** (3 códigos válidos) **0,0015%** (cálculo): **bloqueie** após poucas falhas;
- **Comparação em tempo constante**; **guardar o segredo criptografado** (é um segredo equivalente a uma senha) e **mostrá-lo uma só vez** (QR code com §otpauth://totp/Emissor:conta?secret=BASE32&issuer=...&algorithm=SHA1&digits=6&period=30§);
- **Códigos de recuperação** de uso único (**guardados com hash**) e processo de **recuperação** seguro (a recuperação de conta é **o elo mais fraco**).

### Identidade em escala
- **Não construa o seu IdP** (a menos que seja o seu negócio): Keycloak, Auth0, Okta, Entra ID, Cognito, ZITADEL.
- **Ciclo de vida**: **provisionamento** e **desprovisionamento** automáticos (**SCIM**), **revisão periódica** de acessos, **contas de serviço** com credenciais **curtas** e **rotacionadas**;
- **Sessões**: **idade máxima**, **reautenticação** para ações sensíveis (*step-up*, claim §acr§), **dispositivos confiáveis**;
- **Detecção**: **tentativas anômalas**, **login impossível** (viagem impossível), **credenciais vazadas**, **limitação de taxa** (aula api-06) e **bloqueio gradual**;
- **Auditoria** e **conformidade** (LGPD: **minimização** de dados, base legal, direitos dos titulares; **não é aconselhamento jurídico**);
- **Segredos**: **cofres** (Vault, KMS), **rotação**, nada em repositórios.

### Projeto integrador: autenticação completa
**Cenário**: uma **API de pedidos** com **login por senha + TOTP**, **sessão** para o painel web e **tokens** para a API.
**Entregáveis**:
1. **Cadastro e login** com **argon2id** (parâmetros calibrados, **rehash** no login, **resposta e tempo iguais** para usuário inexistente);
2. **Sessão** segura (cookie HttpOnly/Secure/SameSite, **regenerate**, **CSRF**, expiração ociosa e absoluta, logout real);
3. **Access token JWT curto** (EdDSA/RS256, **iss/aud/exp validados**, **JWKS com kid e rotação**) e **refresh token rotativo** com **detecção de reuso**;
4. **MFA TOTP** (segredo cifrado, janela ±1, **sem reuso**, tentativas limitadas, **códigos de recuperação**);
5. **Autorização**: **matriz RBAC+ABAC** testada (inclusive IDOR) e **negar por padrão**;
6. **Login federado** (OIDC com um IdP de **laboratório** local/Keycloak em contêiner): **state, nonce, PKCE**, validação do id_token e identidade **iss+sub**;
7. **Limite de taxa** e **bloqueio gradual** no login; **auditoria** dos eventos;
8. **Testes**: caminhos de sucesso e **ataques** (alg=none, reuso de código, CSRF, fixação, IDOR) e **ADR** com as decisões.
**Critérios**: nenhuma senha em log; tokens validados com **audiência**; **vetores** de TOTP conferidos; matriz de autorização verde; reuso de refresh token **revoga a família**.`,
  concepts: [
    { term: 'SSO', def: 'Single Sign-On: autenticar uma vez em um provedor e acessar várias aplicações.' },
    { term: 'IdP', def: 'Provedor de identidade que autentica usuários e emite asserções ou tokens.' },
    { term: 'Federação', def: 'Confiança entre domínios de identidade para autenticar usuários de outra organização.' },
    { term: 'SAML 2.0', def: 'Protocolo baseado em XML para troca de asserções de autenticação, comum em SaaS corporativo.' },
    { term: 'MFA', def: 'Autenticação multifator: combina mais de um tipo de fator.' },
    { term: 'TOTP', def: 'Senha de uso único baseada no tempo, calculada com HMAC sobre um contador de 30 s.' },
    { term: 'Passkey (WebAuthn)', def: 'Credencial de chave pública vinculada à origem, resistente a phishing.' },
    { term: 'SCIM', def: 'Padrão para provisionamento e desprovisionamento automático de identidades.' },
    { term: 'Step-up', def: 'Exigência de autenticação mais forte para uma ação sensível.' },
    { term: 'Código de recuperação', def: 'Código de uso único que permite acessar a conta ao perder o segundo fator.' }
  ],
  examples: R`**Analogia:** o **SSO** é o **crachá único do prédio comercial**: a portaria (IdP) confere você uma vez e **cada escritório** (aplicação) confia no crachá. O **TOTP** é um **cadeado de combinação que muda a cada 30 segundos** e que **só você e a portaria** sabem calcular — por isso o **mesmo número não pode ser usado duas vezes** e **o relógio dos dois precisa estar quase certo** (a janela). As **passkeys** são o **cadeado que só abre na porta certa**: um golpista com uma **porta falsa** não consegue usá-lo.

**Exemplo 1: vetores.** Os 6 códigos da RFC 6238 conferiram.

**Exemplo 2: janela.** Passo atual e anterior aceitos; 90 s atrás recusado.

**Exemplo 3: reuso.** O mesmo código de novo foi recusado.`,
  code: [
    { title: 'HOTP/TOTP com node:crypto, conferido pelos vetores da RFC 6238 (JavaScript; resultados medidos)', lang: 'js', code: R`import crypto from 'node:crypto';
const hotp = (segredo, contador, digitos = 6, alg = 'sha1') => {
  const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(contador));
  const h = crypto.createHmac(alg, segredo).update(buf).digest(); const o = h[h.length - 1] & 0xf;
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** digitos).padStart(digitos, '0');
};
const totp = (segredo, t = Date.now() / 1000, passo = 30, digitos = 6) => hotp(segredo, Math.floor(t / passo), digitos);

const seg = Buffer.from('12345678901234567890');
totp(seg, 59, 30, 8);           // '94287082' (RFC 6238)
totp(seg, 1111111109, 30, 8);   // '07081804'
totp(seg, 20000000000, 30, 8);  // '65353130'`, notes: [{ l: '4', t: 'O truncamento dinâmico usa os 4 últimos bits do HMAC como deslocamento.' }, { l: '11', t: 'Os vetores oficiais validam a implementação.' }] },
    { title: 'Verificação com janela e proteção contra reuso (JavaScript)', lang: 'js', code: R`const ultimoPasso = new Map();                                    // por usuário (em produção: no banco/Redis)
function verificar(usuario, segredo, codigo, t = Date.now() / 1000, janela = 1) {
  const passo = Math.floor(t / 30);
  for (let d = -janela; d <= janela; d++) {
    const esperado = hotp(segredo, passo + d);
    if (crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(codigo.padStart(6, '0').slice(0, 6)))) {
      if ((ultimoPasso.get(usuario) ?? -1) >= passo + d) return 'recusado: código já usado';
      ultimoPasso.set(usuario, passo + d); return 'aceito';
    }
  }
  return 'recusado';
}
// atual: aceito | mesmo código de novo: recusado (reuso) | passo anterior: aceito | 90 s atrás: recusado`, notes: [{ l: '3', t: 'A janela tolera relógios levemente dessincronizados.' }, { l: '8', t: 'Guardar o último passo impede o reuso do mesmo código.' }] }
  ],
  bestPractices: ['Delegue o login a um IdP maduro por OIDC e identifique usuários por iss+sub.', 'Ofereça MFA, preferindo TOTP, chaves de segurança e passkeys ao SMS.', 'Valide implementações de criptografia com vetores de teste oficiais e prefira bibliotecas.', 'Aplique janela pequena, recusa de reuso e limite de tentativas no TOTP.', 'Proteja a recuperação de conta e guarde códigos de recuperação com hash.', 'Automatize o provisionamento e a revisão de acessos.'],
  mistakes: ['Vincular contas pelo e-mail sem verificação.', 'MFA por SMS como única proteção de contas críticas.', 'TOTP sem limite de tentativas ou sem recusa de reuso.', 'Guardar o segredo do TOTP em texto puro.', 'Recuperação de conta fraca que anula o MFA.', 'Escrever o próprio IdP sem necessidade.'],
  market: R`SSO e MFA são requisitos de segurança em quase toda empresa; saber implementar e verificar um TOTP e projetar um login federado seguro é diferencial em vagas de backend e plataforma.`,
  summary: R`O SSO delega o login a um IdP por OIDC ou SAML; a identidade é iss+sub. O MFA acrescenta fatores (TOTP, chaves, passkeys). O TOTP implementado com node:crypto conferiu os 6 vetores da RFC 6238; com janela de ±1 passo, o passo atual (0) e o anterior (-1) foram aceitos, 90 s atrás foi recusado e o reuso do mesmo código também; as chances de adivinhar com 5 tentativas são ~0,0005% (cálculo), por isso o limite de tentativas. O projeto integra senha, sessão, tokens, MFA, autorização e federação.`,
  refs: [REF2.rfc6238, REF2.rfc4226, REF2.webauthn, REF2.samlOverview, REF2.nist63b, REF2.oidcCore],
  cards: [
    { q: 'O que é SSO?', a: 'Autenticar uma vez em um IdP e acessar várias aplicações que confiam nele (OIDC ou SAML).' },
    { q: 'Como o TOTP é calculado?', a: 'HMAC-SHA1 do segredo sobre floor(T/30) em 8 bytes, com truncamento dinâmico para 6 dígitos.' },
    { q: 'Como validar um TOTP implementado?', a: 'Com os vetores de teste da RFC 6238 (medido: os 6 conferiram).' },
    { q: 'Como evitar o reuso de um código TOTP?', a: 'Guardando o último passo aceito por usuário e recusando passos iguais ou anteriores.' },
    { q: 'Por que passkeys resistem a phishing?', a: 'A chave privada fica no dispositivo e a credencial é vinculada à origem do site legítimo.' }
  ]
}
];
