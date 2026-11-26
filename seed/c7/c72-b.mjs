// C7.2 — Vulnerabilidades web. Aulas 4 e 5 (CORS; SSRF).
import { REF } from './c72-a.mjs';
const R = String.raw;

export const REF2 = {
  mdnCors: { title: 'MDN — Cross-Origin Resource Sharing (CORS)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS', kind: 'doc' },
  mdnSop: { title: 'MDN — Same-origin policy', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy', kind: 'doc' },
  fetchCors: { title: 'WHATWG Fetch — CORS protocol', url: 'https://fetch.spec.whatwg.org/#http-cors-protocol', kind: 'norma' },
  cwe942: { title: 'CWE-942: Permissive Cross-domain Policy with Untrusted Domains', url: 'https://cwe.mitre.org/data/definitions/942.html', kind: 'norma' },
  csSsrf: { title: 'OWASP Cheat Sheet — Server-Side Request Forgery Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html', kind: 'guia' },
  cwe918: { title: 'CWE-918: Server-Side Request Forgery (SSRF)', url: 'https://cwe.mitre.org/data/definitions/918.html', kind: 'norma' },
  rfc1918: { title: 'RFC 1918 — Address Allocation for Private Internets', url: 'https://datatracker.ietf.org/doc/html/rfc1918', kind: 'rfc' },
  rfc3986: { title: 'RFC 3986 — URI Generic Syntax', url: 'https://datatracker.ietf.org/doc/html/rfc3986', kind: 'rfc' },
  whatwgUrl: { title: 'WHATWG URL Standard', url: 'https://url.spec.whatwg.org/', kind: 'norma' },
  awsImds: { title: 'AWS — Instance metadata service (IMDSv2)', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'wsec-04', moduleId: 'm2', order: 4, minutes: 85, tags: ['CORS', 'same-origin policy', 'Access-Control-Allow-Origin', 'credenciais', 'preflight', 'allowlist', 'Vary'],
  title: 'CORS: o que a política de mesma origem protege, o que o CORS relaxa e como configurá-lo sem abrir a porta',
  objectives: ['Explicar a política de mesma origem e o papel do CORS como relaxamento controlado', 'Distinguir CORS de proteção contra CSRF', 'Configurar CORS com lista de permissão de origens, credenciais e preflight corretos', 'Reconhecer e medir as configurações perigosas: origem refletida com credenciais, null e curingas'],
  intro: R`**CORS** **é o recurso mais mal compreendido da web**: **muita gente "resolve" o erro de CORS refletindo qualquer origem e abre um buraco de segurança.** **Aqui você entende o que a política de mesma origem protege, o que o CORS libera** **e mede, em Chrome real, a diferença entre uma configuração aberta e uma com lista de permissão.**`,
  theory: R`### A política de mesma origem (SOP)
**Origem = esquema + host + porta** (§http://localhost:8080§ ≠ §http://localhost:9090§ ≠ §https://localhost:8080§). **Por padrão, o JavaScript de uma origem pode enviar requisições a outras, mas NÃO pode ler as respostas.** **Isso impede que a página do atacante leia seus e-mails abertos em outra aba.**
**O CORS (*Cross-Origin Resource Sharing*)** **é o mecanismo pelo qual o servidor de destino autoriza explicitamente que uma origem leia suas respostas**, **via cabeçalhos §Access-Control-Allow-*§.** **CORS não é um controle de acesso do servidor**: **é uma permissão para o navegador; clientes que não são navegadores ignoram.**

### Requisições simples e preflight
- **Simples** (**GET, HEAD, POST com content-type de formulário e sem cabeçalhos customizados**): **o navegador envia direto**; **o servidor responde e o navegador decide se entrega a resposta ao script** (**conforme §Access-Control-Allow-Origin§**). **O efeito colateral no servidor já aconteceu**: **CORS não impede CSRF.**
- **Com *preflight*:** **métodos como PUT/DELETE, JSON em POST, cabeçalhos customizados (§x-csrf-token§)**: **o navegador antes envia §OPTIONS§ perguntando se pode**; **só se o servidor autorizar (§Access-Control-Allow-Methods/Headers§) a requisição real é enviada.** **Medido:** **a corrigida não respondeu §Allow-Headers§ ao preflight de §http://evil.test§** (**a vulnerável autorizou**).

### Credenciais
**Para o navegador enviar cookies em requisições cross-origin, o script usa §credentials: 'include'§ e o servidor deve responder §Access-Control-Allow-Credentials: true§ com uma origem EXPLÍCITA** (**o curinga §*§ é proibido com credenciais**). **Além disso, cookies cross-site esbarram em §SameSite§ (aula 3).**

### A configuração perigosa (medida)
**Código vulnerável: devolver a origem que chegou, com credenciais:**
§§§
Access-Control-Allow-Origin: <valor do cabeçalho Origin da requisição>
Access-Control-Allow-Credentials: true
§§§
**Medido (HTTP):** **para §Origin: http://evil.test§ a vulnerável devolveu §Access-Control-Allow-Origin: http://evil.test§ e §Allow-Credentials: true§**; **a corrigida não enviou cabeçalho CORS, e para a origem própria enviou §Allow-Origin§ igual a ela.**
**Medido (Chrome 157), a página do atacante tenta ler §/api/saldo§ da vítima logada:**
| Cenário | Resultado |
|---|---|
| **Vulnerável, atacante same-site** | **LIDO: §{"saldo":800}§** — **a resposta autenticada foi lida pelo atacante** |
| **Vulnerável, atacante cross-site** | **LIDO: §{"erro":"não autenticado"}§** — **o cookie não foi enviado (SameSite), mas a resposta era legível; se houvesse sessão, vazaria** |
| **Corrigida (qualquer atacante)** | **BLOQUEADO** (**erro de CORS**) |
**Lição:** **refletir a origem com credenciais equivale a desligar a política de mesma origem para esse endpoint.** **A segurança do cross-site dependeu, na vulnerável, só do SameSite do cookie**: **uma camada acidental.**

### Como configurar corretamente
1. **Lista de permissão de origens exatas** (**comparação por igualdade de string com esquema+host+porta**), **vinda de configuração.** **Nunca use §endsWith§, §includes§ ou regex frouxa** (§evil-exemplo.com§ **e** §exemplo.com.evil.com§ **passam em validações ingênuas**).
2. **Não aceite §null§** (**origem de páginas locais e iframes *sandbox*: atacantes podem forjar**).
3. **Credenciais só para origens confiáveis** (**e sem curinga**).
4. **Envie §Vary: Origin§** **quando a resposta depende da origem** (**evita cache poluído**).
5. **Limite métodos e cabeçalhos** **do preflight ao necessário** **e use §Access-Control-Max-Age§ com moderação.**
6. **APIs públicas sem credenciais** **podem usar §*§** **(dados realmente públicos).**
7. **Não use CORS como controle de acesso**: **autentique e autorize no servidor** (**aulas de OWASP**).
8. **Redes internas:** **CORS permissivo em serviços internos é abusado a partir do navegador do funcionário** (**ataques a *intranets* e *localhost*** ).

### Erros típicos de "corrigir o CORS"
- **"Funcionou com §*§, deixa."** (**depois alguém adiciona credenciais**)
- **Refletir a origem para "suportar vários clientes".**
- **Liberar CORS no *proxy* e esquecer a aplicação, ou o contrário**: **cabeçalhos duplicados quebram.**
- **Achar que erro de CORS é bug do servidor**: **muitas vezes é o navegador bloqueando a leitura**; **o servidor pode ter processado a requisição.**

### Executado e não executado
**Executado:** **testes HTTP de cabeçalhos CORS e preflight, e leitura cross-origin em Chrome 157 (same-site e cross-site).** **Não executado:** **outros navegadores, HTTPS, origem §null§, cache e §Vary§, cabeçalhos expostos (§Expose-Headers§), PNA/Private Network Access.**`,
  concepts: [
    { term: 'Política de mesma origem', def: 'Regra do navegador que impede scripts de uma origem de ler respostas de outra origem, a menos que autorizado.' },
    { term: 'CORS', def: 'Mecanismo pelo qual um servidor autoriza que outras origens leiam suas respostas, por cabeçalhos Access-Control-Allow-*.' },
    { term: 'Preflight', def: 'Requisição OPTIONS que o navegador envia para verificar se uma requisição cross-origin não simples é permitida.' },
    { term: 'Origem', def: 'Combinação de esquema, host e porta de uma URL.' },
    { term: 'Allow-Credentials', def: 'Cabeçalho CORS que permite o envio de cookies e credenciais; exige origem explícita, não curinga.' },
    { term: 'Origem refletida', def: 'Configuração insegura que devolve em Allow-Origin o valor do cabeçalho Origin recebido, sem validação.' },
    { term: 'Vary: Origin', def: 'Cabeçalho que informa a caches que a resposta varia conforme a origem da requisição.' },
    { term: 'Lista de permissão de origens', def: 'Conjunto fixo de origens exatas autorizadas a ler respostas.' }
  ],
  examples: R`**Analogia:** **a política de mesma origem é a regra do prédio: cada empresa só abre as próprias portas.** **O CORS é o crachá de visitante que a empresa A emite para a empresa B**: **se a empresa A emite crachá a qualquer um que se apresente** (**origem refletida**), **a regra deixa de existir.** **Lista de permissão é um crachá só para as empresas conhecidas.**

**Exemplo concreto (medido):** **na vulnerável, a página do atacante same-site leu §{"saldo":800}§ da vítima logada; na corrigida, o navegador bloqueou a leitura nos dois casos.**`,
  code: [
    { title: 'CORS com lista de permissão (trecho de web.mjs)', lang: 'javascript', code: R`// origens permitidas vêm de configuração: igualdade exata de string
app.origens = ['http://localhost:8080'];

const h = { /* ... */ };
if (origin && app.origens.includes(origin)) {
  h['access-control-allow-origin'] = origin;
  h['access-control-allow-credentials'] = 'true';
  h.vary = 'Origin';
}

// preflight: só para origens permitidas, com métodos e cabeçalhos mínimos
if (req.method === 'OPTIONS') {
  const ok = app.origens.includes(origin);
  return send(204, '', 'text/plain', ok ? { 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type, x-csrf-token' } : {});
}`, notes: [{ l: 2, t: 'Nunca use endsWith ou includes de texto para validar origens.' }, { l: 8, t: 'Respostas dependem da origem: Vary evita cache incorreto.' }, { l: 14, t: 'Origem estranha: sem cabeçalhos, o navegador nega.' }] },
    { title: 'Leitura cross-origin tentada pela página do atacante', lang: 'javascript', code: R`fetch(alvo + '/api/saldo', { credentials: 'include' })
  .then((r) => r.text())
  .then((t) => { document.title = 'LIDO:' + t; })     // vulnerável: lê a resposta
  .catch(() => { document.title = 'BLOQUEADO'; });     // corrigida: erro de CORS`, notes: [{ l: 1, t: 'credentials: include envia cookies quando o SameSite permitir.' }, { l: 4, t: 'O navegador impede a leitura mesmo que a requisição tenha chegado ao servidor.' }] }
  ],
  bestPractices: ['Use lista de permissão de origens exatas e nunca reflita o cabeçalho Origin.', 'Não use curinga com credenciais e rejeite a origem null.', 'Envie Vary: Origin e limite métodos e cabeçalhos do preflight.', 'Trate CORS como permissão de leitura do navegador e autorize no servidor.', 'Proteja endpoints que mudam estado contra CSRF independentemente do CORS.', 'Teste origens estranhas, null e variações de domínio no CI.', 'Evite CORS permissivo em serviços internos e em localhost.'],
  mistakes: ['Refletir a origem com Allow-Credentials true.', 'Validar a origem com endsWith, includes ou regex frouxa.', 'Aceitar a origem null.', 'Achar que CORS protege contra CSRF.', 'Resolver o erro de CORS com curinga e esquecer.', 'Duplicar cabeçalhos CORS entre proxy e aplicação.', 'Deixar CORS aberto em APIs internas.'],
  market: R`**CORS** **é fonte constante de dúvidas e de falhas reais**; **entender SOP, preflight e credenciais** **é diferencial** em **vagas de front, backend e segurança.**`,
  summary: R`A política de mesma origem impede que scripts leiam respostas de outras origens; o CORS é a autorização explícita do servidor para isso, e não protege contra CSRF. Credenciais exigem origem explícita. Nos testes, a versão vulnerável refletiu Origin http://evil.test com Allow-Credentials true e autorizou o preflight; em Chrome 157 a página atacante same-site leu {"saldo":800} e a cross-site leu a resposta de erro (o cookie não foi enviado pelo SameSite), enquanto a corrigida foi BLOQUEADA nos dois casos. Use lista de permissão exata, rejeite null, envie Vary e limite o preflight. Outros navegadores, HTTPS, null e cache não foram testados.`,
  refs: [REF2.mdnCors, REF2.mdnSop, REF2.fetchCors, REF2.cwe942, REF.csCsrf],
  cards: [
    { q: 'O CORS protege contra CSRF?', a: 'Não: requisições simples chegam ao servidor de qualquer forma; o CORS só controla se o script lê a resposta.' },
    { q: 'Por que refletir a origem com credenciais é perigoso?', a: 'Equivale a desligar a política de mesma origem: qualquer site pode ler respostas autenticadas (no laboratório, a página atacante leu {"saldo":800}).' },
    { q: 'Como validar origens permitidas?', a: 'Por igualdade exata com uma lista de permissão (esquema, host e porta); nunca endsWith, includes ou regex frouxa, e rejeite null.' },
    { q: 'Para que serve Vary: Origin?', a: 'Para avisar caches que a resposta depende da origem, evitando entregar cabeçalhos CORS errados a outras origens.' }
  ]
},
{
  id: 'wsec-05', moduleId: 'm2', order: 5, minutes: 95, tags: ['SSRF', 'lista de permissão', 'IP privado', 'redirecionamento', 'metadados de nuvem', 'DNS rebinding', 'egress'],
  title: 'SSRF: o servidor como proxy do atacante, e as defesas em camadas (URL, IP, redirecionamentos e rede)',
  objectives: ['Explicar o SSRF, seus alvos típicos e por que a nuvem aumenta o impacto', 'Reproduzir (na aplicação demo) a leitura de um serviço interno e via redirecionamento', 'Implementar validação de URL com lista de permissão, classificação de IPs e revalidação de redirecionamentos', 'Reconhecer os limites (DNS rebinding) e a defesa de rede (egress, IMDSv2)'],
  intro: R`**No SSRF** (***Server-Side Request Forgery***) **o atacante faz o servidor da vítima buscar uma URL que ele escolheu** (**um "preview" de link, um importador, um *webhook*).** **O servidor tem acesso a recursos que o atacante não tem**: **serviços internos, §localhost§, painéis administrativos e, na nuvem, o serviço de metadados com credenciais.** **Em 2025 o SSRF foi incorporado ao A01 do OWASP Top 10.** **Aqui você reproduz o ataque contra um serviço interno sintético e implementa a defesa.**`,
  theory: R`### O cenário do laboratório
**A rota §/preview?url=...§ "gera uma prévia" buscando a URL.** **Existe um serviço interno (§127.0.0.1:PORTA§, inalcançável de fora) com §/interno/segredo§ → §SEGREDO-SINTETICO-123§.** **Medido:**
- **Vulnerável:** **§/preview?url=<interno>/interno/segredo§ devolveu §SEGREDO-SINTETICO-123§**; **e também por redirecionamento** (§/redir?to=<interno>/...§): **mesmo uma "URL permitida" que redireciona leva o servidor ao alvo interno.**
- **Corrigida:** **§400§ com motivo §host fora da lista de permissão§.**

### Alvos típicos e impacto
- **Serviços internos sem autenticação** (**admin de bancos, painéis, Redis, Elasticsearch**), **§localhost§ (§127.0.0.1§, §[::1]§).**
- **Metadados da nuvem:** **§http://169.254.169.254/§ (endereço *link-local*)**, **que em VMs de nuvem pode entregar credenciais temporárias do papel da instância.** **A AWS oferece o IMDSv2** (**exige um token obtido por PUT e dificulta o SSRF simples**); **ative-o e limite os saltos** (**não executado: sem conta**).
- **Portas e serviços da rede interna** (**varredura por diferença de resposta/tempo**).
- **Arquivos locais** (§file://§) **e outros protocolos** (§gopher://§, §ftp://§) **se a biblioteca os aceitar.**
**Impacto:** **leitura de dados internos, roubo de credenciais, pivô para RCE.** **É famoso por incidentes de vazamento em nuvem.**

### Por que é difícil
**A URL é sintaxe complexa** (**RFC 3986, WHATWG URL**): **o mesmo endereço tem muitas grafias.** **Medido: o *parser* normaliza §2130706433§, §0x7f.0.0.1§ e §127.1§ para §127.0.0.1§**; **por isso a validação deve usar a URL já interpretada, não a string.** **Outras armadilhas:** **credenciais embutidas** (§http://exemplo.test@evil.test§), **subdomínios enganosos** (§exemplo.test.evil.test§), **IPv6 e IPv4 mapeado** (§::ffff:127.0.0.1§), **redirecionamentos** e **DNS que muda entre a validação e o uso (*rebinding*)**.

### A defesa em camadas (módulo ssrf.mjs)
1. **Lista de permissão de hosts** **(exata)**: **medido: as formas ofuscadas de loopback, §[::1]§ e §exemplo.test.evil.test§ caíram em "host fora da lista de permissão".** **Prefira allowlist a blocklist** (**blocklists falham por variantes**).
2. **Esquemas permitidos: só §http§ e §https§** (**medido: §file:///etc/passwd§ → "protocolo não permitido"**).
3. **Sem credenciais na URL** (**medido: §http://user:pw@exemplo.test/§ recusado**).
4. **Resolver o nome e bloquear IPs internos:** **loopback (§127/8§, §::1§), privados (RFC 1918: §10/8§, §172.16/12§, §192.168/16§), *link-local* (§169.254/16§, §fe80::/10§), CGNAT (§100.64/10§), ULA IPv6 (§fc00::/7§), multicast/reservados e IPv4 mapeado.** **Medido: 13 casos de classificação corretos.** **Mesmo um nome na lista que resolva para IP interno é recusado** (**medido: §rebind.test§ → "endereço interno"**).
5. **Redirecionamentos:** **não os siga automaticamente** (§redirect: 'manual'§); **revalide cada destino** (**medido: um redirecionamento de host permitido para §169.254.169.254§ foi bloqueado na revalidação**) **e limite o número de saltos.**
6. **Tempo limite e tamanho máximo da resposta; não devolver o corpo bruto ao usuário** (**só dados que a funcionalidade precisa: título, imagem**).
7. **Isolar a funcionalidade:** **rodar o "buscador" em um serviço separado, sem acesso à rede interna ou a credenciais.**
8. **Defesa de rede (a mais forte):** **bloquear no *firewall*/*security group* o tráfego de saída do servidor para redes internas e metadados (*egress filtering*)**, **proxy de saída com lista de permissão, IMDSv2 e políticas de menor privilégio no papel da instância.**
**Limite declarado da implementação do laboratório:** **o IP validado não é "fixado" na conexão**: **um atacante que controle o DNS pode responder com um IP público na validação e outro interno na conexão (*DNS rebinding*).** **Mitigações:** **conectar-se ao IP já validado** (**definindo o cabeçalho Host/SNI**), **e/ou egress filtering.** **Não executado.**

### SSRF cego e outros contextos
**Mesmo sem ver a resposta, o SSRF "cego" revela portas (por tempo) ou dispara ações** (**requisições GET que mudam estado em serviços internos**). **Entradas indiretas:** **importar de URL, *webhooks*, geração de PDF/imagem a partir de HTML, parsers de XML (XXE), SVG, integrações OAuth** — **todas que fazem o servidor buscar algo.** **Revise todo lugar onde o servidor faz requisições com dados do usuário.**

### Checklist rápido
**Preciso mesmo buscar URLs do usuário?** **Se sim:** **allowlist de hosts, só http(s), resolve + bloqueia IP interno, sem redirects automáticos, timeout e limite de tamanho, serviço isolado, egress filtering, IMDSv2, resposta mínima, testes com variantes ofuscadas e redirecionamento.**

### Executado e não executado
**Executado:** **ataque e defesa contra o serviço interno sintético (direto e por redirecionamento), classificação de IPs, formas ofuscadas, redirecionamento revalidado (com *mocks*), Node 26.13.1.** **Não executado:** **DNS rebinding, metadados reais de nuvem, IMDSv2, egress filtering, SSRF cego, XXE, gopher.**`,
  concepts: [
    { term: 'SSRF', def: 'Falha em que o servidor é induzido a fazer requisições a destinos escolhidos pelo atacante, acessando recursos internos.' },
    { term: 'Metadados de nuvem', def: 'Serviço local da instância (169.254.169.254) que fornece informações e credenciais temporárias do papel associado.' },
    { term: 'IMDSv2', def: 'Versão do serviço de metadados da AWS que exige token de sessão, dificultando o abuso por SSRF.' },
    { term: 'Egress filtering', def: 'Controle de rede que restringe o tráfego de saída do servidor a destinos autorizados.' },
    { term: 'DNS rebinding', def: 'Técnica em que um nome resolve para IPs diferentes entre a validação e o uso, contornando verificações.' },
    { term: 'Link-local', def: 'Faixa de endereços (169.254.0.0/16 e fe80::/10) válida apenas na rede local, usada pelos metadados de nuvem.' },
    { term: 'Lista de permissão', def: 'Conjunto fixo de destinos aceitos; mais robusta que listas de bloqueio.' },
    { term: 'SSRF cego', def: 'SSRF em que o atacante não vê a resposta, mas infere informações por tempo ou efeitos colaterais.' }
  ],
  examples: R`**Analogia:** **você pede a um estagiário com crachá da empresa que "vá buscar este documento em tal endereço".** **Se o endereço for a sala do cofre, ele vai** **(o crachá abre a porta)** **e traz o conteúdo.** **A defesa é dar ao estagiário uma lista de endereços permitidos, **e** impedir fisicamente que ele entre nas salas internas** (**firewall**).

**Exemplo concreto (medido):** **a vulnerável leu §SEGREDO-SINTETICO-123§ do serviço interno direto e por redirecionamento; a corrigida recusou com 400 e, nos testes de unidade, bloqueou 13 classes de IP, formas ofuscadas e um redirecionamento para §169.254.169.254§.**`,
  code: [
    { title: 'Classificação de IPs e validação de URL (ssrf.mjs, trecho)', lang: 'javascript', code: R`export function ipv4Privado(ip) {
  const [a, b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
         (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
         (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
export async function validarUrl(entrada, { permitidos, resolver }) {
  const u = new URL(entrada);                       // interpreta e normaliza a URL
  if (!['http:', 'https:'].includes(u.protocol)) return { ok: false, motivo: 'protocolo não permitido' };
  if (u.username || u.password) return { ok: false, motivo: 'credenciais na URL' };
  if (!permitidos.includes(u.hostname)) return { ok: false, motivo: 'host fora da lista de permissão' };
  const ips = await resolver(u.hostname);
  if (ips.some(ipPrivado)) return { ok: false, motivo: 'endereço interno' };
  return { ok: true, url: u.href, ips };
}`, notes: [{ l: 7, t: 'Validar sobre a URL interpretada, não sobre o texto.' }, { l: 10, t: 'Allowlist exata de hosts.' }, { l: 12, t: 'Mesmo um nome permitido pode resolver para IP interno.' }] },
    { title: 'Busca segura com redirecionamentos revalidados', lang: 'javascript', code: R`let url = entrada;
for (let i = 0; i <= maxRedirects; i++) {
  const v = await validarUrl(url, { permitidos, resolver });
  if (!v.ok) return { ok: false, motivo: v.motivo, url };
  const r = await fetch(v.url, { redirect: 'manual', signal: AbortSignal.timeout(3000) });
  if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { url = new URL(r.headers.get('location'), v.url).href; continue; }
  return { ok: true, status: r.status, corpo: (await r.text()).slice(0, 2000) };
}`, notes: [{ l: 5, t: 'redirect: manual impede seguir o destino sem validar.' }, { l: 7, t: 'Corpo limitado em tamanho e tempo.' }] }
  ],
  bestPractices: ['Evite buscar URLs fornecidas pelo usuário; se necessário, use lista de permissão de hosts.', 'Valide sobre a URL interpretada, só http e https, sem credenciais embutidas.', 'Resolva o nome e bloqueie loopback, privados, link-local, CGNAT, ULA e IPv4 mapeado.', 'Não siga redirecionamentos automaticamente: revalide cada salto.', 'Limite tempo e tamanho da resposta e devolva só o necessário.', 'Isole a função de busca e aplique egress filtering, IMDSv2 e menor privilégio.', 'Teste variantes ofuscadas, redirecionamentos e nomes que resolvem para IP interno.'],
  mistakes: ['Usar lista de bloqueio de "localhost" e "127.0.0.1".', 'Validar a string em vez da URL interpretada.', 'Seguir redirecionamentos automaticamente.', 'Validar o DNS uma vez e usar outro IP na conexão.', 'Devolver o corpo bruto da resposta ao usuário.', 'Servidor com acesso irrestrito à rede interna e aos metadados.', 'Ignorar SSRF em importadores, webhooks e geradores de PDF.'],
  market: R`**SSRF** **ganhou destaque após grandes vazamentos em nuvem e entrou no A01 do Top 10:2025**; **saber implementar defesas em camadas** **é diferencial em backend, cloud e segurança.**`,
  summary: R`No SSRF o servidor busca uma URL escolhida pelo atacante e acessa recursos internos, inclusive metadados de nuvem (169.254.169.254). Na demo, a versão vulnerável leu SEGREDO-SINTETICO-123 do serviço interno, direto e por redirecionamento; a corrigida respondeu 400. A defesa combina lista de permissão de hosts, somente http e https, sem credenciais, resolução de nomes com bloqueio de IPs internos (13 casos de classificação corretos), redirecionamentos revalidados, limites de tempo e tamanho, isolamento e egress filtering com IMDSv2. O DNS rebinding não é coberto pelo laboratório; SSRF cego, metadados reais e egress não foram executados.`,
  refs: [REF2.csSsrf, REF2.cwe918, REF2.whatwgUrl, REF2.rfc3986, REF2.rfc1918, REF2.awsImds],
  cards: [
    { q: 'Por que lista de permissão e não de bloqueio?', a: 'Porque o mesmo destino tem muitas grafias (decimal, hexadecimal, IPv6, redirecionamentos); o parser normaliza 2130706433 para 127.0.0.1, e bloquear strings falha.' },
    { q: 'Por que revalidar redirecionamentos?', a: 'Uma URL permitida pode redirecionar para um destino interno; no laboratório um salto para 169.254.169.254 foi bloqueado na revalidação.' },
    { q: 'Qual a defesa de rede mais forte contra SSRF?', a: 'Egress filtering: o servidor não deve alcançar redes internas e metadados; na AWS, IMDSv2 e papéis de menor privilégio.' },
    { q: 'O que o laboratório não cobre?', a: 'DNS rebinding (o IP validado não é fixado na conexão), metadados reais, SSRF cego e egress filtering.' }
  ]
}
];
