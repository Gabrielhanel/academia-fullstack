// Curso C4.4 da C4: Autenticação e autorização (disciplina: auth).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c44-a.mjs';
import { REF2, lessonsB } from './c44-b.mjs';
import { exsets, assessment, project } from './c44-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Sessões vs tokens', 'JWT', 'Hash de senhas', 'OAuth2', 'OpenID Connect', 'RBAC e ABAC', 'SSO e identidade em escala'];
export const COVER = {
  'Sessões vs tokens': ['aut-01'],
  'JWT': ['aut-02'],
  'Hash de senhas': ['aut-03'],
  'OAuth2': ['aut-04'],
  'OpenID Connect': ['aut-04'],
  'RBAC e ABAC': ['aut-05'],
  'SSO e identidade em escala': ['aut-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Credencial', def: 'Informação usada para provar uma identidade, como senha, token ou chave.' },
  { term: 'Entropia', def: 'Medida de imprevisibilidade de um segredo.' },
  { term: 'CSPRNG', def: 'Gerador de números aleatórios criptograficamente seguro.' },
  { term: 'Phishing', def: 'Golpe que induz a vítima a entregar credenciais em um site falso.' },
  { term: 'Escopo (OAuth)', def: 'Permissão específica solicitada por um cliente e consentida pelo usuário.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'auth', disciplineId: 'auth', areaId: 'back', requires: ['node-express'],
  title: 'Autenticação e autorização: sessões, JWT, senhas, OAuth2/OIDC, RBAC/ABAC, MFA e SSO',
  description: 'Identidade e acesso em APIs Node.js, com experimentos medidos em express-session 1.19.0, jose 6.2.18, argon2 0.45.2 e bcryptjs 3.0.3: sessões com cookies HttpOnly, regenerate contra fixação, CSRF por token e revogação imediata; JWT (estrutura, claims, 293 B em HS256 e 592 B em RS256, erros por claim, alg=none e confusão de algoritmo recusados, JWKS com rotação, custos de assinar e verificar e revogação por jti); hash de senhas (SHA-256 a ~78 mil palpites/s contra ~4/s do argon2id, scrypt, bcrypt e seu limite de 72 bytes, sal, timingSafeEqual e rehash); OAuth 2.0 e OpenID Connect em um servidor didático local (código de autorização com PKCE, state, nonce, id_token, audiências e rotação de refresh tokens com detecção de reuso); autorização RBAC e ABAC com a matriz de IDOR (36 decisões, 6 acessos indevidos do RBAC puro); MFA com TOTP conferido pelos vetores da RFC 6238, SSO e federação e o projeto Autenticação completa. Provedores reais, SAML, WebAuthn e Passport não foram executados.',
  objectives: ['Escolher entre sessões e tokens e configurar cookies, CSRF e expiração', 'Emitir e validar JWT com algoritmos, emissor e audiência fixados e rotacionar chaves', 'Armazenar senhas com argon2id, calibrar o custo e migrar parâmetros', 'Implementar e validar os fluxos OAuth2/OIDC com PKCE e refresh tokens rotativos', 'Projetar autorização com RBAC, ABAC e verificação de propriedade e testá-la em matriz', 'Implementar MFA TOTP e planejar SSO e identidade em escala'],
  level: 'A', prereqs: ['Node.js e Express (curso C4.1)', 'APIs REST (curso C4.3)', 'JavaScript e HTTP (Onda 1)'], hours: 20,
  syllabus: 'Sessões e tokens; JWT; hash de senhas; OAuth2 e OIDC; RBAC e ABAC; MFA, SSO e identidade em escala; projeto.',
  versions: 'Node.js 26.13.1, Express 5.3.0, express-session 1.19.0, jose 6.2.18, argon2 0.45.2, bcryptjs 3.0.3 e node:crypto, em 2026-11-25 (laboratório em seed/c4/labs/auth/). Os tempos são de uma máquina, por núcleo e de medianas curtas; as tentativas por segundo não representam GPUs ou ASICs; o bcryptjs é JavaScript puro; o cookie foi testado sem HTTPS; CSRF foi testado só no servidor; o servidor OAuth2/OIDC é um laboratório didático em localhost (não um produto). Correções feitas no laboratório: chaves do jose (exportSPKI), rótulo de memória do scrypt (32 MiB) e o teste sem PKCE. Não executados: provedores reais (Auth0, Keycloak, Entra), SAML, SSO e logout federado, WebAuthn e passkeys, Passport e @nestjs/jwt, DPoP e mTLS, limites e bloqueio de login, JWE, RLS e auditoria.',
  skills: ['Sessões e cookies seguros', 'JWT e JWKS', 'Hash de senhas', 'OAuth2 e OIDC', 'Autorização RBAC e ABAC', 'MFA e TOTP', 'SSO e federação', 'Testes de segurança de autenticação'],
  modules: [
    { id: 'm1', title: 'Credenciais, sessões e tokens', lessons: ['aut-01', 'aut-02', 'aut-03'] },
    { id: 'm2', title: 'Delegação e autorização', lessons: ['aut-04', 'aut-05'] },
    { id: 'm3', title: 'MFA, SSO e identidade em escala', lessons: ['aut-06'] }
  ],
  materials: [REF.owaspAuth, REF.owaspSession, REF.rfc8725, REF.owaspPassword, REF2.rfc9700, REF2.oidcCore, REF2.owaspAuthz].map((r) => ({ ...r })),
  projectIds: ['auth-completa'],
  supplement: {
    glossary,
    cheatsheet: R`### Sessão
cookie HttpOnly + Secure + SameSite · regenerate no login (fixação) · CSRF: token + SameSite + Origin · expiração ociosa e absoluta · logout destrói no servidor (1 → 0; cookie antigo 401)

### JWT
payload NÃO é secreto · HS256 293 B, EdDSA 336 B, RS256 592 B · jwtVerify: algorithms + issuer + audience · alg=none e RS/HS confusão recusados · JWKS + kid rotação · vida curta + refresh · revogação por jti

### Senhas
argon2id (19 MiB t2 p1 mínimo; 64 MiB t3 p4 ~243 ms) · scrypt · bcrypt (72 bytes) · SHA-256 ~78 mil/s ≠ senhas · sal automático · timingSafeEqual · needsRehash no login · limite de tentativas

### OAuth2 / OIDC
código + PKCE S256 · state · nonce · redirect_uri exata · código de uso único · id_token (aud = client) x access token (aud = API) · iss+sub · refresh rotativo + reuso revoga família

### Autorização
RBAC (ação) + ABAC (objeto) · IDOR/BOLA: carregar com o dono, 404 · negar por padrão · matriz usuário × recurso × ação (36: 9 divergem, 6 IDOR)

### MFA e SSO
TOTP = HOTP(floor(T/30)) · vetores RFC 6238 · janela ±1 · recusar reuso · recuperação · SMS é o mais fraco · passkeys/WebAuthn · SSO: OIDC/SAML · IdP maduro · SCIM · step-up`,
    mistakes: ['Cookie de sessão sem HttpOnly, Secure e SameSite.', 'Não regenerar o id no login.', 'Verificar JWT sem aud, iss e lista de algoritmos.', 'Armazenar senhas com SHA-256 ou MD5.', 'Confiar no e-mail como identidade federada.', 'Fluxos OAuth sem PKCE, state e nonce.', 'Autorizar só por papel e esquecer o dono do recurso.', 'TOTP sem limite de tentativas e sem recusa de reuso.', 'Escrever o próprio servidor de identidade.', 'Guardar tokens em localStorage.'],
    prereqMap: R`**Antes deste curso:** Node.js e Express (C4.1) e APIs REST (C4.3, principalmente idempotência, rate limit e erros).

| Este curso prepara para | Por quê |
|---|---|
| Filas e processamento assíncrono (C4.5) | autenticação entre serviços e idempotência |
| Observabilidade (C4.6) | auditoria e métricas de autenticação |
| Microsserviços (C4.7) | identidade entre serviços, tokens e gateways |
| Segurança (C7) | OWASP, ameaças e testes de intrusão |
| Mobile (C10) | OAuth2 com PKCE e armazenamento seguro de tokens |

Ordem interna: aulas 1 a 3 (sessões, JWT e senhas) → 4 e 5 (OAuth2/OIDC e autorização) → 6 (MFA, SSO e projeto).`,
    officialRefs: [REF.owaspAuth, REF.owaspSession, REF.owaspCsrf, REF.owaspPassword, REF.owaspJwt, REF.mdnCookies, REF.mdnSetCookie, REF.expressSession, REF.rfc7519, REF.rfc8725, REF.rfc7517, REF.jose, REF.rfc9106, REF.nodeCrypto, REF2.rfc6749, REF2.rfc7636, REF2.rfc9700, REF2.oauth21, REF2.oidcCore, REF2.oidcDiscovery, REF2.owaspAuthz, REF2.owaspApi, REF2.nistAbac, REF2.opa, REF2.casl, REF2.rfc6238, REF2.rfc4226, REF2.webauthn, REF2.samlOverview, REF2.nist63b],
    practice: ['Configure uma sessão com regenerate e CSRF e teste o logout.', 'Assine e verifique JWT e reproduza alg=none, confusão de algoritmo e rotação de chaves.', 'Meça o custo de scrypt, argon2id e bcrypt e calibre para ~100–500 ms.', 'Percorra o fluxo de código com PKCE e os ataques de reuso e verifier.', 'Implemente a rotação de refresh token com detecção de reuso.', 'Monte a matriz RBAC x ABAC e encontre os IDORs.', 'Implemente o TOTP e confira os vetores da RFC 6238.', 'Faça o projeto integrador: autenticação completa.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
