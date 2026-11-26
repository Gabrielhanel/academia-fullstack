// C7.1 — OWASP. Aulas 1 e 2 (Top 10:2025; API Security Top 10:2023).
const R = String.raw;

export const REF = {
  top10: { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/2025/', kind: 'doc' },
  top10a01: { title: 'OWASP Top 10:2025 — A01 Broken Access Control', url: 'https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/', kind: 'doc' },
  top10intro: { title: 'OWASP Top 10:2025 — Introduction', url: 'https://owasp.org/Top10/2025/0x00_2025-Introduction/', kind: 'doc' },
  apiTop10: { title: 'OWASP API Security Top 10 (2023)', url: 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/', kind: 'doc' },
  asvs: { title: 'OWASP Application Security Verification Standard (ASVS)', url: 'https://owasp.org/www-project-application-security-verification-standard/', kind: 'norma' },
  cheatsheets: { title: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/', kind: 'guia' },
  csAuthz: { title: 'OWASP Cheat Sheet — Authorization', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', kind: 'guia' },
  csAuthn: { title: 'OWASP Cheat Sheet — Authentication', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', kind: 'guia' },
  csPassword: { title: 'OWASP Cheat Sheet — Password Storage', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', kind: 'guia' },
  csErrors: { title: 'OWASP Cheat Sheet — Error Handling', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html', kind: 'guia' },
  csRest: { title: 'OWASP Cheat Sheet — REST Security', url: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html', kind: 'guia' },
  csMass: { title: 'OWASP Cheat Sheet — Mass Assignment', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html', kind: 'guia' },
  nodeSqlite: { title: 'Node.js — SQLite (node:sqlite)', url: 'https://nodejs.org/api/sqlite.html', kind: 'doc' },
  nodeTest: { title: 'Node.js — Test runner', url: 'https://nodejs.org/api/test.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'owasp-01', moduleId: 'm1', order: 1, minutes: 90, tags: ['OWASP', 'Top 10:2025', 'controle de acesso', 'injeção', 'autenticação', 'configuração', 'logging', 'ASVS'],
  title: 'OWASP Top 10:2025: os riscos mais críticos de aplicações web, demonstrados em uma loja vulnerável e corrigida',
  objectives: ['Explicar o que é o OWASP Top 10, o que ele é e não é, e a lista de 2025', 'Reconhecer, em código, falhas de controle de acesso, autenticação, injeção e configuração', 'Aplicar a correção correta de cada falha e provar a correção com um teste', 'Usar ASVS e cheat sheets como complemento e priorizar riscos'],
  intro: R`**Segurança não é um recurso que se acrescenta no fim**: é **uma propriedade de cada decisão de código**. O **OWASP Top 10** **é a lista de consenso dos riscos mais críticos em aplicações web**, **e a porta de entrada para o tema**. Nesta aula você **vê cada risco acontecer** **numa loja de demonstração que escrevemos de propósito vulnerável** (**só em 127.0.0.1, dados sintéticos**) **e vê o mesmo teste falhar na versão corrigida**. **Objetivo: aprender a defender**, **nunca atacar sistemas de terceiros.**`,
  theory: R`### O que é o OWASP Top 10
**OWASP** (***Open Worldwide Application Security Project***) **é uma comunidade aberta de segurança de aplicações.** **O Top 10 é um documento de conscientização**: **consenso sobre os riscos mais críticos**, **com base em dados de organizações e em pesquisa**, **revisado a cada alguns anos**. **A edição vigente (conferida na fonte oficial) é o OWASP Top 10:2025.** **O que ele não é:** **não é uma norma de conformidade**, **não é uma lista completa** (**só dez categorias**) **e não substitui testes**. **Para verificação use o ASVS** (***Application Security Verification Standard***: **requisitos testáveis por nível**) **e as *Cheat Sheets* do OWASP** (**guias de implementação**).

### A lista de 2025
| # | Categoria | Em uma frase |
|---|---|---|
| **A01** | **Broken Access Control** | **o usuário faz o que não deveria** (**IDOR/BOLA, funções sem verificação de papel, SSRF e CSRF entram aqui**) |
| **A02** | **Security Misconfiguration** | **padrões inseguros, erros verbosos, serviços expostos** |
| **A03** | **Software Supply Chain Failures** | **dependências, build e distribuição comprometidos** (**expande a antiga "componentes vulneráveis"**) |
| **A04** | **Cryptographic Failures** | **dados sensíveis sem proteção adequada** (**senha em texto claro, algoritmos fracos**) |
| **A05** | **Injection** | **entrada interpretada como código** (**SQL, comandos, XSS**) |
| **A06** | **Insecure Design** | **faltam controles por desenho** (**ameaças não modeladas**) |
| **A07** | **Authentication Failures** | **login frágil** (**enumeração, força bruta, sessões previsíveis**) |
| **A08** | **Software or Data Integrity Failures** | **código e dados aceitos sem verificar integridade** |
| **A09** | **Security Logging and Alerting Failures** | **ataques passam sem registro nem alerta** |
| **A10** | **Mishandling of Exceptional Conditions** | **erros e condições excepcionais tratados de forma insegura** (**categoria nova**) |
**Mudanças notáveis frente a 2021** (**segundo a introdução oficial**): **cadeia de suprimentos de software virou categoria própria (A03)**, **tratamento de condições excepcionais é novo (A10)**, **configuração insegura subiu para A02**, **injeção desceu para A05** e **o SSRF foi incorporado ao A01**. **Lição:** **a lista muda; os princípios não** (**negar por padrão, validar entradas, não confiar no cliente, registrar eventos**).

### O laboratório: uma loja em duas versões
O arquivo §app.mjs§ **contém a loja com um parâmetro §seguro§**: **§false§ = versão vulnerável**, **§true§ = corrigida**, **mesmo contrato HTTP**. **Os testes (§node --test§) provam o ataque em uma e a defesa na outra.** **Resultados (9 testes, 9 passam):**

**A07 Authentication Failures**
- **Enumeração de usuários:** **a vulnerável responde §404 "usuário não existe"§ para e-mail desconhecido e §401 "senha incorreta"§ para senha errada**: **permite descobrir contas válidas**. **A corrigida responde §401§ com a mesma mensagem nos dois casos** (**e executa o mesmo trabalho de hash mesmo para usuário inexistente, para não vazar por tempo**).
- **Força bruta:** **8 tentativas erradas**: **vulnerável §401×8§** (**nenhum limite**); **corrigida §401×5 e §429×3§** (**bloqueio após 5 falhas por minuto**), **com 10 eventos registrados** (**A09**).
- **Token previsível:** **o token vulnerável é §token-<id>§**: **forjar §token-3§ dá acesso de administrador** (**200 e lista de usuários com senhas em texto claro**); **na corrigida o token é aleatório (24 bytes) e o forjado dá §401§**.

**A01 Broken Access Control**
- **IDOR/BOLA** (***Broken Object Level Authorization***): **a Ana lê o pedido 2 (da Bia)**: **vulnerável §200§; corrigida §404§** (**e §200§ no pedido 1, da própria Ana**). **A verificação é "este objeto pertence a quem pergunta?"**, **no servidor, a cada acesso**.
- **Função administrativa:** **usuário comum em §/admin/usuarios§**: **corrigida §403§** (**a vulnerável só exigia login**).

**A05 Injection**
- **SQL por concatenação:** **a busca vulnerável monta §... like '%DOLAR{q}%'§**; **o termo §zzz' UNION SELECT id, senha FROM usuarios -- §** **devolveu 3 linhas incluindo as senhas**. **A corrigida usa parâmetro (§like ?§) e devolveu 0 linhas.** (**Aula de SQL Injection no curso C7.2.**)

**A02 / A10 Misconfiguration e exceções**
- **§/erro§ vulnerável devolve a pilha (6 linhas) e §x-powered-by§** (**revela tecnologia e caminhos**); **a corrigida devolve só um id de correlação** (**o detalhe vai para o log, não para o cliente**).

**A04 Cryptographic Failures**
- **A versão vulnerável guarda senhas em texto claro** (**vazadas na resposta de §/admin/usuarios§ e na injeção SQL**); **a corrigida guarda §salt:hash scrypt§** (**C7.3**).

**A09 Logging**
- **A corrigida registrou 10 eventos (§falha_login§, §bloqueio§)**; **a vulnerável não registra nada**: **um ataque de força bruta passaria despercebido**.

### Como priorizar
**Risco = probabilidade × impacto** (**e custo de corrigir**). **Comece por:** **controle de acesso e autenticação** (**A01, A07**), **injeção**, **segredos e criptografia**, **dependências** e **registro/monitoramento**. **Use ASVS para virar requisitos** (**ex.: "toda requisição verifica autorização no servidor"**), **cheat sheets para implementar** e **modelagem de ameaças** (**STRIDE**: ***Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege***) **para tratar A06 (design inseguro) antes do código**.

### Princípios que valem para todas as categorias
1. **Negar por padrão** (**sem permissão explícita, nada**).
2. **Nunca confiar no cliente** (**papel, preço, id de dono: tudo vem do servidor**).
3. **Validar a entrada e codificar a saída.**
4. **Menor privilégio** (**contas de banco, tokens, papéis**).
5. **Defesa em profundidade** (**uma falha não pode abrir tudo**).
6. **Falhar de forma segura e sem vazar detalhes.**
7. **Registrar e alertar.**
8. **Manter dependências e configurações atualizadas.**

### Executado e não executado
**Executado:** **9 testes sobre a loja em duas versões** (**Node 26.13.1**). **Não executado:** **scanners (ZAP, Semgrep, Trivy), análise de dependências (A03), integridade de artefatos (A08), modelagem de ameaças com ferramenta, WAF.**`,
  concepts: [
    { term: 'OWASP Top 10', def: 'Documento de conscientização com os dez riscos mais críticos de segurança de aplicações web, revisado periodicamente.' },
    { term: 'Broken Access Control', def: 'Falha em que usuários acessam dados ou funções além de suas permissões; categoria A01 em 2025.' },
    { term: 'IDOR/BOLA', def: 'Acesso a objeto de outra pessoa pela troca de um identificador, por falta de verificação de propriedade no servidor.' },
    { term: 'Injeção', def: 'Falha em que dados não confiáveis são interpretados como parte de um comando ou consulta.' },
    { term: 'ASVS', def: 'Padrão do OWASP com requisitos de segurança verificáveis por níveis de rigor.' },
    { term: 'Defesa em profundidade', def: 'Uso de várias camadas de controles de modo que a falha de uma não comprometa o sistema.' },
    { term: 'Menor privilégio', def: 'Princípio de conceder somente as permissões necessárias para a tarefa.' },
    { term: 'STRIDE', def: 'Modelo de classificação de ameaças: falsificação, adulteração, repúdio, divulgação, negação de serviço e elevação de privilégio.' }
  ],
  examples: R`**Analogia:** **o Top 10 é a lista dos defeitos mais comuns em prédios** (**incêndio, estrutura, fiação**): **não é o código de obras completo** (**ASVS**), **mas é por onde o vistoriador começa**. **A loja vulnerável é um prédio-modelo com as falhas de propósito**, **para treinar o olhar** **sem pôr ninguém em risco**.

**Exemplo concreto (medido):** **o mesmo pedido §GET /pedidos/2§ feito pela Ana** **devolveu 200 na versão vulnerável e 404 na corrigida**; **8 tentativas de login erradas passaram todas na vulnerável e foram bloqueadas a partir da 6ª na corrigida**; **e uma busca com §UNION§ extraiu senhas só da vulnerável**.`,
  code: [
    { title: 'Controle de acesso: vulnerável x corrigido (trecho de app.mjs)', lang: 'javascript', code: R`// VULNERÁVEL: autenticado, mas sem checar o dono do objeto
const ped = db.prepare('select * from pedidos where id=?').get(Number(id));
return json(res, 200, ped);

// CORRIGIDO: o servidor decide; recurso alheio responde 404
if (!ped || ped.usuario_id !== eu.id) return json(res, 404, { erro: 'não encontrado' });
return json(res, 200, ped);`, notes: [{ l: 1, t: 'Estar logado não significa poder ver tudo.' }, { l: 6, t: '404 (e não 403) evita confirmar que o recurso existe.' }] },
    { title: 'Teste que prova ataque e defesa (node:test)', lang: 'javascript', code: R`test('BOLA: ler pedido de outra pessoa', async () => {
  const v = await r(bv, '/pedidos/2', { token: tokenAna });   // vulnerável
  const s = await r(bs, '/pedidos/2', { token: tokenAnaSeg }); // corrigida
  assert.equal(v.st, 200);   // o ataque funciona
  assert.equal(s.st, 404);   // a defesa funciona
});`, notes: [{ l: 4, t: 'Testar a vulnerabilidade evita regressões da correção.' }] }
  ],
  bestPractices: ['Trate o Top 10 como ponto de partida e use o ASVS para requisitos verificáveis.', 'Verifique autorização no servidor a cada acesso a objeto e a função.', 'Use mensagens de autenticação genéricas, limite de tentativas e registro de eventos.', 'Nunca monte consultas por concatenação; use parâmetros.', 'Guarde senhas com hash lento e salt e tokens aleatórios.', 'Devolva erros genéricos com id de correlação e oculte tecnologia e pilha.', 'Escreva testes que provem cada correção de segurança.'],
  mistakes: ['Achar que autenticar basta e esquecer a autorização por objeto.', 'Mensagens de erro que revelam se a conta existe.', 'Tokens previsíveis ou sem expiração.', 'Concatenar entrada em SQL.', 'Senhas em texto claro ou com hash rápido.', 'Pilha de erro devolvida ao cliente.', 'Nenhum registro de falhas de login.'],
  market: R`**OWASP Top 10** **é vocabulário obrigatório** em **desenvolvimento, revisão de código e entrevistas**; **explicar IDOR, injeção e falhas de autenticação com exemplo** **é pergunta frequente**.`,
  summary: R`O OWASP Top 10:2025 lista A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures e A10 Mishandling of Exceptional Conditions, com SSRF incorporado ao A01. É documento de conscientização; ASVS e cheat sheets complementam. Em uma loja de demonstração em duas versões, 9 testes provaram: enumeração (404/401 contra 401/401), força bruta (401 x 8 contra 401 x 5 e 429 x 3), token forjado (200 contra 401), BOLA (200 contra 404), UNION SQL (senhas vazadas contra 0 linhas), erro com pilha contra id de correlação e 10 eventos registrados. Scanners, supply chain e integridade não foram executados.`,
  refs: [REF.top10, REF.top10intro, REF.top10a01, REF.asvs, REF.cheatsheets, REF.csAuthz, REF.csAuthn, REF.csErrors, REF.nodeTest],
  cards: [
    { q: 'O OWASP Top 10 é uma norma de conformidade?', a: 'Não: é um documento de conscientização sobre os riscos mais críticos; para verificação use o ASVS e testes.' },
    { q: 'O que é IDOR/BOLA e como corrigir?', a: 'Acessar o objeto de outra pessoa trocando o identificador; verifique no servidor, a cada acesso, se o objeto pertence a quem pergunta.' },
    { q: 'Por que a mensagem de login deve ser genérica?', a: 'Para não permitir enumerar contas: usuário inexistente e senha errada devem responder igual (no laboratório 404/401 virou 401/401).' },
    { q: 'O que mudou em 2025?', a: 'Cadeia de suprimentos de software virou A03, tratamento de condições excepcionais entrou como A10, configuração insegura subiu para A02 e o SSRF foi incorporado ao A01.' }
  ]
},
{
  id: 'owasp-02', moduleId: 'm2', order: 2, minutes: 85, tags: ['API', 'OWASP API Security', 'BOLA', 'BOPLA', 'mass assignment', 'rate limit', 'BFLA', 'inventário', 'REST'],
  title: 'OWASP API Security Top 10 (2023): riscos específicos de APIs, medidos na loja demo',
  objectives: ['Listar os dez riscos do API Security Top 10:2023 e diferenciá-los do Top 10 web', 'Detectar e corrigir BOLA, BOPLA (atribuição em massa), BFLA e consumo irrestrito de recursos', 'Projetar APIs com autorização por objeto, esquemas de resposta e limites', 'Reconhecer riscos de inventário, fluxos de negócio e consumo inseguro de APIs externas'],
  intro: R`**APIs são a superfície mais atacada**: **expõem objetos e funções diretamente**, **sem a "interface" que esconde campos**. **O OWASP mantém uma lista própria** para elas. **Aqui você repete, na mesma loja de demonstração, os ataques específicos de API e mede o antes e o depois.** **Defesa apenas: tudo em 127.0.0.1, dados sintéticos.**`,
  theory: R`### A lista (API Security Top 10:2023)
| # | Risco | Ideia central |
|---|---|---|
| **API1** | **Broken Object Level Authorization (BOLA)** | **o id de outro objeto funciona** |
| **API2** | **Broken Authentication** | **autenticação fraca ou mal implementada** |
| **API3** | **Broken Object Property Level Authorization** | **campos que não deveriam ser lidos ou escritos** (**inclui atribuição em massa**) |
| **API4** | **Unrestricted Resource Consumption** | **sem limites de tamanho, taxa ou custo** |
| **API5** | **Broken Function Level Authorization (BFLA)** | **funções administrativas acessíveis a qualquer usuário** |
| **API6** | **Unrestricted Access to Sensitive Business Flows** | **fluxos de negócio abusados em escala** (**cambismo, spam de cadastro**) |
| **API7** | **Server Side Request Forgery** | **a API busca URL controlada pelo atacante** |
| **API8** | **Security Misconfiguration** | **cabeçalhos, CORS, erros e padrões inseguros** |
| **API9** | **Improper Inventory Management** | **versões antigas e endpoints esquecidos expostos** |
| **API10** | **Unsafe Consumption of APIs** | **confiar cegamente em dados de APIs de terceiros** |
**Diferença para o Top 10 web:** **em APIs o cliente é código** (**não uma tela**): **o atacante envia qualquer campo, em qualquer ordem, em grande volume.** **Por isso o foco em autorização por objeto e por propriedade, limites e inventário.**

### API1 BOLA — o risco número 1 em APIs (medido)
**Padrão:** §GET /pedidos/{id}§ **sem checar o dono**. **Medido:** **a Ana (id 1) leu o pedido 2 (da Bia): vulnerável §200§, corrigida §404§** (**e §200§ no próprio pedido**). **Correção:** **verificação de propriedade na camada de dados** (**consultar já filtrando por dono: §where id=? and usuario_id=?§**), **centralizada** (**um único ponto de autorização, não espalhado por cada rota**). **IDs não sequenciais** (**UUID**) **dificultam adivinhar, mas não substituem a verificação.**

### API3 BOPLA e atribuição em massa (medido)
**O erro:** **gravar no banco tudo o que o cliente envia** (§Object.assign§, **ORMs com *bind* automático**). **Medido:** §PATCH /perfil {"nome":"Ana","papel":"admin"}§ → **vulnerável: o papel virou §admin§**; **corrigida (lista de campos permitidos): continuou §usuario§**. **O inverso (exposição excessiva):** **devolver a linha inteira do banco** (**a rota §/admin/usuarios§ vulnerável devolveu §senha§**) — **use DTOs/esquemas de resposta com lista de campos**. **Boas práticas:** **lista de permissão de campos por rota**, **esquemas de entrada e saída** (**OpenAPI/JSON Schema**), **rejeitar campos desconhecidos**, **campos sensíveis nunca em respostas**.

### API5 BFLA
**Função administrativa só exigia estar logado.** **Corrigida: §403§ para usuário comum.** **Padrões:** **verificar papel/permissão em todo endpoint** (**negar por padrão: um *middleware* exige permissão declarada**), **separar rotas administrativas** (**prefixo, rede ou serviço próprios**), **testar cada rota com cada papel (matriz de autorização)**.

### API4 Consumo irrestrito (medido)
**§GET /pedidos?limite=100000§:** **vulnerável devolveu 300 linhas (todas); corrigida 50 (teto) e só os do próprio usuário.** **Limites a considerar:** **tamanho de página, tamanho do corpo, número de itens em listas enviadas, taxa de requisições por cliente (rate limit), tempo máximo, custo de operações caras (relatórios, exportações), cobranças de serviços externos** (**SMS, e-mail**). **Resposta padrão:** **§429 Too Many Requests§ com §Retry-After§**. **No laboratório:** **a corrigida bloqueou o login após 5 falhas por minuto (§429§ ×3 nas 8 tentativas)**.

### API2 Autenticação em APIs
**Mesmos problemas do web, com agravantes:** **tokens previsíveis** (**o §token-3§ forjado deu acesso de admin: 200 contra 401**), **chaves de API sem rotação**, **tokens sem expiração**, **JWT mal validado** (**C7.4**), **credenciais na URL**. **Use padrões** (**OAuth 2.0/OIDC**), **tokens aleatórios ou JWT bem validado com expiração curta**, **limite de tentativas** e **mensagens genéricas**.

### API6, API7, API8, API9, API10 (análise e referências)
- **API6 fluxos de negócio:** **o endpoint está "correto", mas pode ser abusado em volume** (**compra de todo o estoque, cadastro em massa**): **defenda no nível do fluxo** (**limites por conta/dispositivo, verificação humana em pontos críticos, detecção de comportamento**). **Não executado.**
- **API7 SSRF:** **aula do C7.2** (**com laboratório**).
- **API8 configuração:** **erros genéricos, sem cabeçalhos de tecnologia** (**medido: pilha de 6 linhas e §x-powered-by§ só na vulnerável**), **CORS restritivo (C7.2), TLS (C6.3), métodos HTTP limitados**.
- **API9 inventário:** **mantenha catálogo de APIs e versões** (**OpenAPI como fonte da verdade**), **desligue versões antigas e ambientes de teste expostos**, **gateway como ponto único de entrada**. **Não executado.**
- **API10 consumo inseguro:** **trate respostas de terceiros como entrada não confiável** (**validação de esquema, limites de tamanho, *timeouts*, sem seguir redirecionamentos às cegas**). **Não executado.**

### Checklist de revisão de uma rota de API
1. **Quem pode chamar?** (**autenticação**) 2. **O que pode fazer?** (**papel/função**) 3. **Com quais objetos?** (**dono**) 4. **Quais campos pode ler e escrever?** (**propriedades**) 5. **Quanto e com que frequência?** (**limites**) 6. **O que devolve em caso de erro?** (**genérico**) 7. **Está registrada e monitorada?** (**logs e alertas**) 8. **Está no inventário e documentada?**

### Executado e não executado
**Executado:** **testes de BOLA, BOPLA, BFLA, limite de recursos, token e login na loja demo.** **Não executado:** **gateway de APIs, OAuth/OIDC, validação OpenAPI automática, testes de fluxos de negócio, inventário real.**`,
  concepts: [
    { term: 'BOLA', def: 'Falha de autorização em nível de objeto: a API aceita o identificador de um objeto que não pertence ao usuário.' },
    { term: 'BOPLA', def: 'Falha de autorização em nível de propriedade: leitura ou escrita de campos que o usuário não deveria acessar.' },
    { term: 'Atribuição em massa', def: 'Gravação direta de todos os campos enviados pelo cliente em um objeto, permitindo alterar campos sensíveis.' },
    { term: 'BFLA', def: 'Falha de autorização em nível de função: operações privilegiadas acessíveis a quem não deveria.' },
    { term: 'Rate limiting', def: 'Limitação da quantidade de requisições por cliente em um intervalo, com resposta 429 ao exceder.' },
    { term: 'DTO', def: 'Objeto de transferência de dados que define explicitamente os campos de entrada e saída de uma rota.' },
    { term: 'Inventário de APIs', def: 'Catálogo atualizado de APIs, versões e ambientes expostos.' },
    { term: 'Idempotency key', def: 'Chave enviada pelo cliente para que repetições de uma operação não gerem efeitos duplicados.' }
  ],
  examples: R`**Analogia:** **uma API é um balcão de atendimento sem tela**: **o cliente pode pedir qualquer documento pelo número**; **BOLA é o atendente entregar o prontuário de outra pessoa só porque o número foi dito**; **atribuição em massa é aceitar que o cliente escreva "cargo: diretor" na ficha**; **BFLA é o guichê "restrito" sem fiscal**; **consumo irrestrito é permitir pedir todos os 300 prontuários de uma vez**.

**Exemplo concreto (medido):** **o mesmo §PATCH /perfil§ com §"papel":"admin"§** **promoveu a Ana na vulnerável (§admin§) e foi ignorado na corrigida (§usuario§)**; **e §limite=100000§ devolveu 300 linhas na vulnerável contra 50 na corrigida**.`,
  code: [
    { title: 'Lista de permissão de campos (anti atribuição em massa) e teto de página', lang: 'javascript', code: R`// VULNERÁVEL: grava tudo que o cliente envia
const campos = Object.keys(corpo).filter((k) => ['nome', 'papel', 'email', 'senha'].includes(k));

// CORRIGIDO: o servidor decide quais campos esta rota aceita
const permitidos = ['nome'];
for (const c of permitidos) if (corpo[c] !== undefined) atualizar(c, corpo[c]);

// Teto de paginação
let lim = Number(u.searchParams.get('limite') || 20);
lim = Math.min(Math.max(1, lim | 0), 50);`, notes: [{ l: 2, t: 'papel nunca deveria ser editável pelo próprio usuário.' }, { l: 5, t: 'Lista de permissão por rota.' }, { l: 10, t: 'Limites impedem varredura e consumo excessivo.' }] },
    { title: 'Matriz de autorização como teste (esboço)', lang: 'javascript', code: R`const matriz = [
  { rota: '/admin/usuarios', papel: 'usuario', esperado: 403 },
  { rota: '/admin/usuarios', papel: 'admin', esperado: 200 },
  { rota: '/pedidos/2', papel: 'dono-do-pedido', esperado: 200 },
  { rota: '/pedidos/2', papel: 'outro-usuario', esperado: 404 }
];
for (const c of matriz) test(c.rota + ' como ' + c.papel, async () => assert.equal((await chamar(c)).st, c.esperado));`, notes: [{ l: 1, t: 'Cada rota é testada com cada papel.' }, { l: 7, t: 'Regressões de autorização aparecem no CI.' }] }
  ],
  bestPractices: ['Centralize a autorização por objeto e por função e negue por padrão.', 'Defina esquemas de entrada e de saída e rejeite campos desconhecidos.', 'Nunca devolva a linha inteira do banco; use DTOs.', 'Aplique limites de página, tamanho, taxa e custo, com 429 e Retry-After.', 'Use tokens aleatórios ou JWT bem validado, com expiração e padrões OAuth/OIDC.', 'Mantenha inventário de APIs e desligue versões antigas.', 'Teste a matriz de autorização no CI.'],
  mistakes: ['Confiar que ids difíceis de adivinhar dispensam a checagem de dono.', 'Gravar o corpo da requisição direto no modelo.', 'Devolver campos sensíveis (senha, tokens) nas respostas.', 'Rotas administrativas sem verificação de papel.', 'Paginação sem teto e listas sem limite de itens.', 'Versões antigas esquecidas expostas.', 'Confiar em dados de APIs de terceiros sem validar.'],
  market: R`**Segurança de APIs** é **área em alta**: **a maioria dos sistemas modernos é uma API**; **explicar BOLA, atribuição em massa e limites de recursos** **é diferencial** em **vagas de backend e segurança**.`,
  summary: R`O API Security Top 10:2023 lista BOLA, autenticação quebrada, BOPLA, consumo irrestrito de recursos, BFLA, fluxos de negócio sensíveis, SSRF, configuração insegura, inventário inadequado e consumo inseguro de APIs. Na loja demo, a Ana leu o pedido da Bia na vulnerável (200 contra 404), promoveu-se a admin por atribuição em massa (admin contra usuario), listou 300 linhas com limite=100000 (contra 50) e acessou a função administrativa com um token forjado (200 contra 401); a versão corrigida usa verificação de dono, lista de campos permitidos, teto de paginação, papéis por função e limite de tentativas (429). Gateway, OAuth/OIDC, inventário real e fluxos de negócio não foram executados.`,
  refs: [REF.apiTop10, REF.csRest, REF.csMass, REF.csAuthz, REF.cheatsheets],
  cards: [
    { q: 'Qual a diferença entre BOLA e BFLA?', a: 'BOLA é acessar o objeto de outra pessoa (nível de objeto); BFLA é chamar uma função privilegiada sem permissão (nível de função).' },
    { q: 'Como evitar atribuição em massa?', a: 'Aceitar somente uma lista de permissão de campos por rota e rejeitar o restante; no laboratório o papel enviado foi ignorado.' },
    { q: 'Por que UUIDs não resolvem o BOLA?', a: 'Dificultam adivinhar ids, mas vazamentos e logs expõem ids; a verificação de propriedade no servidor continua obrigatória.' },
    { q: 'O que é consumo irrestrito de recursos?', a: 'Falta de limites de página, tamanho, taxa ou custo; no laboratório limite=100000 devolveu 300 linhas contra 50 com teto.' }
  ]
}
];
