// C7.2 — Vulnerabilidades web. Aulas 1 a 3 (SQL Injection; XSS; CSRF).
const R = String.raw;

export const REF = {
  csSqli: { title: 'OWASP Cheat Sheet — SQL Injection Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', kind: 'guia' },
  csQueryParam: { title: 'OWASP Cheat Sheet — Query Parameterization', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html', kind: 'guia' },
  csXss: { title: 'OWASP Cheat Sheet — Cross Site Scripting Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html', kind: 'guia' },
  csCsp: { title: 'OWASP Cheat Sheet — Content Security Policy', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html', kind: 'guia' },
  csCsrf: { title: 'OWASP Cheat Sheet — Cross-Site Request Forgery Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html', kind: 'guia' },
  cwe89: { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html', kind: 'norma' },
  cwe79: { title: 'CWE-79: Cross-site Scripting', url: 'https://cwe.mitre.org/data/definitions/79.html', kind: 'norma' },
  cwe352: { title: 'CWE-352: Cross-Site Request Forgery', url: 'https://cwe.mitre.org/data/definitions/352.html', kind: 'norma' },
  mdnCsp: { title: 'MDN — Content Security Policy (CSP)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP', kind: 'doc' },
  mdnCookies: { title: 'MDN — Using HTTP cookies (SameSite, HttpOnly, Secure)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', kind: 'doc' },
  mdnSetCookie: { title: 'MDN — Set-Cookie header', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie', kind: 'doc' },
  portswigger: { title: 'PortSwigger — Web Security Academy (laboratórios gratuitos de treino)', url: 'https://portswigger.net/web-security', kind: 'guia' },
  chromeSamesite: { title: 'Chromium — SameSite Updates', url: 'https://www.chromium.org/updates/same-site/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'wsec-01', moduleId: 'm1', order: 1, minutes: 85, tags: ['SQL Injection', 'consultas parametrizadas', 'UNION', 'bypass de login', 'ORDER BY', 'menor privilégio'],
  title: 'SQL Injection: como a entrada vira consulta, o que ela extrai e como parametrizar de verdade',
  objectives: ['Explicar por que a concatenação de entrada em SQL permite injeção e distinguir suas variantes', 'Reproduzir (na aplicação demo) bypass de login, extração por UNION e vazamento por mensagem de erro', 'Corrigir com consultas parametrizadas e lista de permissão para identificadores', 'Aplicar defesas em profundidade: menor privilégio, erros genéricos e testes'],
  intro: R`**Injeção de SQL** **é uma das falhas mais antigas e mais devastadoras**: **o atacante escreve SQL onde a aplicação esperava um valor.** **A causa é uma só**: **misturar dados com código na mesma string.** **Nesta aula você vê três ataques acontecerem na aplicação de demonstração** (**127.0.0.1, dados sintéticos**) **e vê cada um falhar na versão parametrizada.** **Objetivo: defender.**`,
  theory: R`### A causa: dados e código na mesma string
**Código vulnerável (laboratório):**
§§§
db.prepare("select id,nome,preco from produtos where categoria='" + cat + "'")
§§§
**Se §cat§ = §livros§**, **funciona.** **Se §cat§ = §x' UNION SELECT id, email || ':' || senha, 0 FROM usuarios -- §**, **o banco recebe outra consulta:** **o aspas fecha o literal, o §UNION§ acrescenta uma consulta e o §--§ comenta o resto.** **O banco não consegue distinguir o que o programador escreveu do que o usuário enviou.**

### Três ataques medidos
1. **Bypass de autenticação:** **e-mail §ana@exemplo.test' OR '1'='1' -- §** **com qualquer senha**: **a condição vira sempre verdadeira.** **Medido:** **vulnerável §200§ (entrou); corrigida §401§.**
2. **Extração por UNION:** **a busca de produtos devolveu 2 linhas com §e-mail:senha§ dos usuários** (**as duas colunas do §SELECT§ casaram em número e tipo**); **corrigida: 0 linhas.** **O atacante descobre a estrutura por tentativa (número de colunas, tipos, nomes de tabelas) e extrai o que o banco permitir.**
3. **Vazamento por erro:** **§?ordem=coluna_inexistente§**: **vulnerável §500§ com a mensagem do banco §"no such column: coluna_inexistente"§** (**revela que a entrada vai direto ao SQL e ajuda o atacante**); **corrigida §400§ com mensagem própria.**

### Variantes (conceitos)
- **In-band** (**o resultado volta na resposta**): **UNION** e **baseada em erro** (**medidos**).
- **Cega (*blind*):** **a resposta só indica verdadeiro/falso** (**boolean**) **ou demora** (**time-based**): **o atacante extrai dados bit a bit, lentamente.** **Não executada neste curso.**
- **Fora de banda (*out-of-band*):** **o banco envia dados a um servidor do atacante** (**depende do SGBD**). **Não executada.**
- **De segunda ordem:** **o dado malicioso é gravado com segurança e usado depois em outra consulta concatenada** (**ex.: nome de usuário salvo e reutilizado**): **parametrize em TODA consulta, não só nas de entrada direta.** **Não executada.**
**Impacto:** **leitura de dados, alteração, exclusão, bypass de autenticação e, conforme o SGBD e as permissões, execução de comandos no servidor.** **Em SQLite (do laboratório) o alcance é limitado ao arquivo**; **em outros SGBDs, o impacto varia.**

### A defesa principal: consultas parametrizadas
**A consulta e os valores são enviados separadamente**; **o banco compila a consulta com *placeholders* e trata os valores apenas como dados**, **mesmo que contenham aspas ou §UNION§.**
§§§
db.prepare('select id,nome,preco from produtos where categoria=?').all(cat)
§§§
**Medido:** **o mesmo payload de UNION devolveu 0 linhas** **porque foi tratado como o valor da categoria**. **Regras:** **use parâmetros em todas as consultas**; **ORMs e *query builders* parametrizam por padrão, mas métodos "raw" voltam a ser concatenação**; **procedimentos armazenados só protegem se não concatenarem internamente.**

### O que parâmetros NÃO resolvem: identificadores
**Parâmetros substituem valores, não nomes de coluna, de tabela, direção de ordenação nem palavras-chave** (§order by ?§ **não funciona como se espera**). **Solução: lista de permissão (*allowlist*)** **mapeada no servidor:** **medido: §ordem=preco§ → 200; §ordem=coluna_inexistente§ → 400.** **Nunca escape manualmente "para ajudar"**: **escapes dependem do SGBD, do *charset* e do contexto, e falham.** **Validação de formato** (**número, UUID, enum**) **ajuda** **como camada adicional, não como substituta.**

### Defesa em profundidade
1. **Menor privilégio no banco:** **a conta da aplicação não deve ser dona do esquema nem ler tabelas desnecessárias** (**ex.: sem acesso a §usuarios§ numa API de catálogo**) **e não deve executar DDL.**
2. **Erros genéricos:** **mensagens do banco vão para o log, nunca para o cliente** (**medido: 500 com a mensagem x 400 próprio**).
3. **Senhas com hash** (**C7.3**): **mesmo com injeção, o atacante não lê as senhas em texto claro** (**no laboratório, a vulnerável guarda texto claro de propósito; a corrigida guarda scrypt**).
4. **WAF e filtros:** **ajudam a reduzir ruído, mas não corrigem** (**são contornáveis**).
5. **Testes:** **inclua testes de injeção** (**payloads clássicos**) **no CI**; **análise estática** (**Semgrep, CodeQL**) **para achar concatenação** (**não executada**).
6. **Monitoramento:** **picos de erros SQL e padrões de ataque nos logs** (**C6.6**).

### Ética e prática segura
**Pratique somente em ambientes seus ou de treino autorizado** (**este laboratório; o *Web Security Academy* da PortSwigger oferece laboratórios gratuitos**). **Testar um sistema alheio sem autorização é crime** (**no Brasil, Lei 12.737/2012 e o art. 154-A do Código Penal**; **consulte orientação jurídica**).

### Executado e não executado
**Executado:** **bypass, UNION, vazamento por erro e as correções**, **em SQLite, Node 26.13.1.** **Não executado:** **SQLi cega, de segunda ordem e fora de banda, ORMs, outros SGBDs, WAF, sqlmap, análise estática.**`,
  concepts: [
    { term: 'SQL Injection', def: 'Falha em que entrada do usuário é interpretada como parte de uma consulta SQL, alterando seu significado.' },
    { term: 'Consulta parametrizada', def: 'Consulta em que a estrutura SQL e os valores são enviados separadamente, de modo que os valores nunca são interpretados como código.' },
    { term: 'UNION', def: 'Operador SQL que combina resultados de consultas; usado em ataques para extrair dados de outras tabelas.' },
    { term: 'Injeção cega', def: 'Variante em que o atacante infere dados por respostas verdadeiras/falsas ou por atrasos, sem ver o resultado.' },
    { term: 'Lista de permissão', def: 'Conjunto fixo de valores aceitos; usada para identificadores que não podem ser parametrizados.' },
    { term: 'Segunda ordem', def: 'Injeção em que o dado malicioso é armazenado e executado depois, em outra consulta.' },
    { term: 'Menor privilégio (banco)', def: 'Conceder à conta da aplicação apenas as permissões estritamente necessárias.' },
    { term: 'ORM', def: 'Mapeamento objeto-relacional, que em geral parametriza consultas, exceto nos métodos de SQL bruto.' }
  ],
  examples: R`**Analogia:** **é um formulário em que o atendente lê em voz alta o que você escreveu e executa**: **se você escrever "fechar a conta de todos", ele executa.** **A consulta parametrizada é um formulário com campos delimitados**: **o que vai no campo é só dado, mesmo que pareça uma ordem.**

**Exemplo concreto (medido):** **o mesmo payload §' OR '1'='1' -- § no campo de e-mail** **fez o login vulnerável devolver §200§ e o corrigido §401§**; **e o §UNION§ extraiu 2 pares e-mail:senha só da vulnerável.**`,
  code: [
    { title: 'Vulnerável x corrigido (trecho de web.mjs)', lang: 'javascript', code: R`// VULNERÁVEL: concatenação
const user = db.prepare("select * from usuarios where email='" + corpo.email + "' and senha='" + corpo.senha + "'").get();

// CORRIGIDO: parâmetro + hash lento
const r = db.prepare('select * from usuarios where email=?').get(corpo.email);
const user = r && confere(String(corpo.senha ?? ''), r.senha) ? r : null;

// Identificadores: lista de permissão (não dá para parametrizar o nome da coluna)
if (ordem && !['nome', 'preco'].includes(ordem)) return send(400, { erro: 'ordem inválida' });
const sql = 'select id,nome,preco from produtos where categoria=?' + (ordem ? ' order by ' + ordem : '');`, notes: [{ l: 2, t: "Basta um ' para fechar o literal." }, { l: 5, t: 'O e-mail nunca é interpretado como SQL.' }, { l: 9, t: 'Só valores da lista chegam à string da consulta.' }] },
    { title: 'Teste de injeção (node:test)', lang: 'javascript', code: R`test('SQLi: bypass de login com OR 1=1', async () => {
  const p = { email: "ana@exemplo.test' OR '1'='1' -- ", senha: 'qualquer' };
  const v = await rq(bv, '/login', { m: 'POST', body: p });
  const s = await rq(bs, '/login', { m: 'POST', body: p });
  assert.equal(v.st, 200);  // o ataque funciona na vulnerável
  assert.equal(s.st, 401);  // a corrigida resiste
});`, notes: [{ l: 5, t: 'Se este teste falhar, a correção regrediu.' }] }
  ],
  bestPractices: ['Parametrize todas as consultas, inclusive as que parecem seguras.', 'Use lista de permissão para nomes de colunas, tabelas e direções de ordenação.', 'Não escape manualmente e não confie em filtros de caracteres.', 'Dê à aplicação uma conta de banco com o mínimo de privilégios.', 'Devolva erros genéricos e registre o detalhe no log.', 'Guarde senhas com hash lento e salt.', 'Inclua testes de injeção no CI e análise estática de código.'],
  mistakes: ['Concatenar "só um pouquinho" em consultas internas.', 'Achar que um ORM protege nos métodos de SQL bruto.', 'Tentar sanitizar aspas manualmente.', 'Mostrar a mensagem de erro do banco ao cliente.', 'Conta de banco com permissões de administrador.', 'Confiar apenas em WAF.', 'Parametrizar só as entradas diretas e esquecer as de segunda ordem.'],
  market: R`**SQL Injection** **segue entre as falhas mais cobradas em entrevistas e auditorias**; **saber parametrizar, tratar identificadores e aplicar defesa em profundidade** **é requisito de qualquer dev backend**.`,
  summary: R`A injeção de SQL ocorre quando entrada vira parte da consulta. Na aplicação demo, o bypass de login com OR 1=1 deu 200 na vulnerável e 401 na corrigida, o UNION extraiu 2 pares e-mail:senha contra 0 linhas, e uma coluna inexistente vazou a mensagem do banco (500) contra um 400 genérico. A defesa principal é a consulta parametrizada; identificadores exigem lista de permissão. Somam-se menor privilégio no banco, erros genéricos, hash de senhas, testes e análise estática. Variantes cega, de segunda ordem e fora de banda, ORMs, WAF e sqlmap não foram executados. Pratique apenas em ambientes próprios ou autorizados.`,
  refs: [REF.csSqli, REF.csQueryParam, REF.cwe89, REF.portswigger],
  cards: [
    { q: 'Qual a causa raiz da SQL Injection?', a: 'Misturar dados e código na mesma string de consulta, de modo que a entrada seja interpretada como SQL.' },
    { q: 'Por que parâmetros não resolvem ORDER BY dinâmico?', a: 'Parâmetros substituem valores, não identificadores; use uma lista de permissão de colunas (no laboratório, ordem=preco passou e coluna_inexistente deu 400).' },
    { q: 'O que faz um UNION em um ataque?', a: 'Acrescenta uma consulta ao resultado para ler outras tabelas; no laboratório extraiu e-mail:senha dos usuários.' },
    { q: 'Por que não devolver a mensagem de erro do banco?', a: 'Ela revela estrutura e confirma a injeção; registre no log e devolva erro genérico.' }
  ]
},
{
  id: 'wsec-02', moduleId: 'm1', order: 2, minutes: 90, tags: ['XSS', 'escape de saída', 'CSP', 'HttpOnly', 'DOM', 'armazenado', 'refletido', 'sanitização'],
  title: 'XSS: refletido, armazenado e DOM; escape por contexto, CSP e cookies HttpOnly, verificados em um navegador real',
  objectives: ['Distinguir XSS refletido, armazenado e baseado em DOM e explicar o impacto', 'Aplicar a codificação de saída correta por contexto e usar CSP e HttpOnly como defesa em profundidade', 'Verificar em Chrome real se o script executa e se o cookie é legível', 'Saber quando sanitizar HTML rico e quando evitar APIs perigosas'],
  intro: R`**XSS** (***Cross-Site Scripting***) **acontece quando a aplicação devolve entrada não confiável como HTML ou JavaScript.** **O script do atacante passa a rodar com a identidade do site**: **lê dados da página, faz requisições como o usuário e, se o cookie for legível, rouba a sessão.** **Aqui você verifica em um Chrome real (puppeteer-core) que o script executa na versão vulnerável e não executa na corrigida.**`,
  theory: R`### Três tipos
- **Refletido:** **a entrada da requisição volta na resposta** (§/ola?nome=<script>...§). **A vítima precisa abrir um link malicioso.**
- **Armazenado:** **a entrada é guardada** (**comentário, perfil**) **e exibida a outros usuários**: **o mais perigoso**, **pois não exige clique em link.**
- **Baseado em DOM:** **o JavaScript do cliente insere dados em §innerHTML§, §document.write§ ou similares** (**a resposta do servidor pode estar limpa**). **Não executado neste curso.**

### O que acontece no navegador (medido em Chrome 157)
**Página vulnerável (§<h1>Olá, ${'$'}{nome}</h1>§ sem tratamento):**
- **§/ola?nome=<script>alert(1)</script>§** → **o §alert§ executou 1 vez**;
- **comentário armazenado §<img src=x onerror=alert(2)>§** → **o §alert§ executou 1 vez ao abrir §/comentarios§.**
**Corrigida (escape + CSP):** **0 execuções nos dois casos.**
**Cookie:** **§document.cookie§ na vulnerável devolveu §sid=…§ (roubável por qualquer XSS)**; **na corrigida, vazio, porque o cookie é §HttpOnly§.** **Note:** **HttpOnly não impede o XSS de agir** (**ele ainda pode fazer requisições autenticadas pela página**), **só impede ler o cookie.**

### A correção principal: codificação de saída por contexto
**Regra: codifique no ponto de saída, conforme o contexto onde o dado será inserido.**
| Contexto | O que fazer |
|---|---|
| **Corpo HTML** | **escapar §& < > " '§** (**§esc()§ do laboratório**) |
| **Atributo HTML** | **escapar e sempre colocar o valor entre aspas** |
| **JavaScript** | **evitar inserir dados em scripts; se necessário, serializar como JSON e escapar §<§** |
| **URL** | **validar o esquema (só §http/https§; bloquear §javascript:§) e codificar** |
| **CSS** | **evitar dados do usuário em estilos** |
**Medido:** **§<script>alert(1)</script>§ virou §&lt;script&gt;alert(1)&lt;/script&gt;§** **e foi exibido como texto.** **Frameworks modernos** (**React, Angular, Vue**) **escapam por padrão**; **as saídas perigosas são as brechas explícitas** (§dangerouslySetInnerHTML§, §v-html§, §innerHTML§, §bypassSecurityTrust*§).
**Entrada x saída:** **validar a entrada ajuda (tipos, tamanhos, formatos)**, **mas a defesa contra XSS é a codificação na saída**: **o mesmo dado pode ir a vários contextos.**

### HTML rico: sanitizar, não escapar
**Quando o produto precisa aceitar HTML** (**editor de texto rico**), **use um sanitizador mantido** (**ex.: DOMPurify**) **com lista de tags e atributos permitidos**, **no cliente e/ou servidor, e mantenha-o atualizado.** **Não escreva o seu com expressões regulares.** **Não executado neste curso.** **Alternativa: Markdown renderizado com biblioteca segura.**

### Defesa em profundidade
1. **Content Security Policy (CSP):** **cabeçalho que restringe de onde scripts e recursos podem vir.** **No laboratório:** §default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'§. **Impede scripts inline e de outras origens** (**mitiga XSS que escapou da codificação**). **Evite §'unsafe-inline'§ e §'unsafe-eval'§; use *nonces* ou *hashes* quando precisar de scripts inline.** **Honestidade da medição:** **o escape sozinho já impediu a execução; o efeito isolado da CSP não foi medido.** **Teste a CSP com o modo *Report-Only* antes de aplicar.**
2. **Cookies §HttpOnly§, §Secure§ e §SameSite§** (**HttpOnly medido**).
3. **§X-Content-Type-Options: nosniff§** (**evita que o navegador "adivinhe" tipos e execute conteúdo como script**).
4. **Trusted Types** (**exigem que strings passem por políticas antes de ir a *sinks* perigosos**): **não executado.**
5. **Bibliotecas e componentes atualizados** (**XSS em dependências**).

### Armadilhas comuns
- **Escapar na entrada e esquecer outros contextos.**
- **Usar §innerHTML§ com dados do usuário em vez de §textContent§.**
- **Colocar a entrada em atributos sem aspas** (§<input value=${'$'}{x}>§).
- **Permitir URLs §javascript:§ em links.**
- **Confiar em "filtros de §<script>§"** (**há dezenas de formas de executar JavaScript sem essa tag, como o §onerror§ medido**).
- **XSS armazenado em painéis administrativos** (**o atacante mira quem tem privilégio**).

### Executado e não executado
**Executado:** **XSS refletido e armazenado em Chrome 157, leitura de cookie com e sem HttpOnly, escape e CSP (cabeçalho presente).** **Não executado:** **XSS baseado em DOM, CSP isolada, Trusted Types, sanitizadores, *mutation XSS*, bypass de CSP.**`,
  concepts: [
    { term: 'XSS', def: 'Falha em que entrada não confiável é inserida em páginas web de modo que seja executada como script no navegador de outros usuários.' },
    { term: 'XSS armazenado', def: 'Variante em que o conteúdo malicioso é guardado no servidor e exibido a outros usuários.' },
    { term: 'Codificação de saída', def: 'Transformação de dados em representação segura para o contexto onde serão inseridos (HTML, atributo, JavaScript, URL).' },
    { term: 'CSP', def: 'Content Security Policy: cabeçalho que restringe origens de scripts e outros recursos, mitigando XSS.' },
    { term: 'HttpOnly', def: 'Atributo de cookie que o torna inacessível ao JavaScript da página.' },
    { term: 'Sanitização', def: 'Remoção de partes perigosas de HTML permitido, feita com biblioteca baseada em lista de permissão.' },
    { term: 'DOM-based XSS', def: 'XSS em que o script do próprio cliente insere dados não confiáveis em pontos perigosos do DOM.' },
    { term: 'nosniff', def: 'Cabeçalho X-Content-Type-Options que impede o navegador de inferir tipos diferentes do declarado.' }
  ],
  examples: R`**Analogia:** **um mural de recados em que qualquer pessoa pode pregar um papel, e o porteiro lê em voz alta para quem passa**: **se um papel diz "entregue as chaves", o visitante obedece achando que veio do prédio.** **Escapar é o porteiro ler "o papel diz: entregue as chaves" (como texto)**; **a CSP é a regra do prédio de que ele só leia papéis do próprio escritório.**

**Exemplo concreto (medido no Chrome):** **o mesmo link com §<script>alert(1)</script>§** **executou o alert 1 vez na vulnerável e 0 na corrigida**; **e §document.cookie§ devolveu o §sid§ só na vulnerável.**`,
  code: [
    { title: 'Escape de HTML e cabeçalhos de defesa (web.mjs)', lang: 'javascript', code: R`export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// resposta corrigida
const html = '<!doctype html><h1>Olá, ' + esc(nome) + '</h1>';
const h = {
  'content-security-policy': "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'",
  'x-content-type-options': 'nosniff'
};
// cookie de sessão
'sid=' + sid + '; Path=/; HttpOnly; SameSite=Strict'`, notes: [{ l: 1, t: 'Cinco caracteres bastam para o corpo HTML e atributos entre aspas.' }, { l: 5, t: 'CSP: sem script inline e só da própria origem.' }, { l: 10, t: 'HttpOnly impede document.cookie de ler a sessão.' }] },
    { title: 'Verificação em Chrome real (puppeteer-core)', lang: 'javascript', code: R`page.on('dialog', async (d) => { dialogs++; await d.dismiss(); });
await page.goto(base + '/ola?nome=' + encodeURIComponent('<script>alert(1)</script>'));
console.log('alert executou', dialogs, 'x');          // vulnerável: 1 | corrigida: 0
const ck = await page.evaluate(() => document.cookie);
console.log(ck ? 'cookie legível' : 'vazio (HttpOnly)');`, notes: [{ l: 1, t: 'O evento dialog prova que o script executou.' }, { l: 4, t: 'Executado nos dois servidores do laboratório.' }] }
  ],
  bestPractices: ['Codifique a saída conforme o contexto e use as proteções padrão do framework.', 'Evite innerHTML e equivalentes; prefira textContent.', 'Use sanitizador mantido para HTML rico, com lista de permissão.', 'Aplique CSP restritiva (sem unsafe-inline) e teste em Report-Only primeiro.', 'Use cookies HttpOnly, Secure e SameSite e nosniff.', 'Valide esquemas de URL e evite dados do usuário em scripts e estilos.', 'Teste XSS no CI com payloads clássicos e em navegador real quando possível.'],
  mistakes: ['Confiar só em validação de entrada.', 'Escapar para um contexto e inserir em outro.', 'Filtrar a tag script e esquecer onerror e outros vetores.', 'Usar innerHTML com dados do usuário.', 'CSP com unsafe-inline.', 'Achar que HttpOnly resolve o XSS.', 'Ignorar XSS armazenado em telas administrativas.'],
  market: R`**XSS** é **tema recorrente em entrevistas de front e segurança**; **explicar tipos, codificação por contexto, CSP e HttpOnly (e seus limites)** **demonstra maturidade.**`,
  summary: R`XSS ocorre quando entrada não confiável vira script no navegador de outros usuários, em três formas: refletido, armazenado e baseado em DOM. No Chrome 157, a página vulnerável executou o alert refletido 1 vez e o armazenado 1 vez e expôs o cookie de sessão a document.cookie; a corrigida executou 0 vezes e o cookie HttpOnly não era legível. A defesa principal é a codificação de saída por contexto; CSP, HttpOnly, nosniff e sanitizadores (para HTML rico) são camadas adicionais. O efeito isolado da CSP não foi medido; XSS por DOM, Trusted Types e sanitizadores não foram executados.`,
  refs: [REF.csXss, REF.csCsp, REF.mdnCsp, REF.mdnSetCookie, REF.cwe79, REF.portswigger],
  cards: [
    { q: 'Qual a defesa principal contra XSS?', a: 'Codificar a saída conforme o contexto (HTML, atributo, JavaScript, URL); CSP e HttpOnly são camadas adicionais.' },
    { q: 'O HttpOnly impede o XSS?', a: 'Não: só impede ler o cookie por JavaScript; o script ainda pode agir como o usuário pela página.' },
    { q: 'Por que XSS armazenado é mais perigoso?', a: 'Atinge quem abrir a página sem precisar de um link malicioso, inclusive administradores.' },
    { q: 'Quando usar um sanitizador em vez de escape?', a: 'Quando o produto precisa aceitar HTML rico; use biblioteca mantida com lista de permissão, não regex próprias.' }
  ]
},
{
  id: 'wsec-03', moduleId: 'm2', order: 3, minutes: 90, tags: ['CSRF', 'SameSite', 'token anti-CSRF', 'Origin', 'cookies', 'same-site', 'cross-site', 'preflight'],
  title: 'CSRF: requisições forjadas com a sessão da vítima; SameSite, tokens e Origin, medidos em Chrome',
  objectives: ['Explicar por que o CSRF depende de autenticação automática por cookie', 'Reproduzir o ataque same-site e cross-site em Chrome e interpretar os resultados', 'Defender com token anti-CSRF, exigência de JSON/cabeçalho customizado, validação de Origin e cookies SameSite', 'Entender os limites do SameSite e de confiar nos padrões do navegador'],
  intro: R`**No CSRF** (***Cross-Site Request Forgery***) **a vítima, logada em um site, visita uma página do atacante**, **que faz o navegador enviar uma requisição ao site da vítima.** **O navegador anexa o cookie automaticamente**; **o servidor acha que foi o usuário.** **Aqui você vê isso acontecer em Chrome real e mede o que realmente protege.**`,
  theory: R`### Condições para o CSRF
1. **Há uma ação que muda estado** (**transferir, trocar e-mail, apagar**);
2. **a autenticação é automática** (**cookie de sessão que o navegador envia sozinho**);
3. **o atacante consegue prever todos os parâmetros** (**sem segredo imprevisível**).
**APIs que exigem um cabeçalho §Authorization§ definido por código** (**token em memória**) **não sofrem CSRF clássico**, **pois o navegador não o anexa sozinho.**

### O ataque no laboratório
**A vítima faz login no site (§localhost:PORTA§), recebendo o cookie §sid§.** **A página do atacante contém um formulário que se envia sozinho:**
§§§
<form id=f method=POST action="http://localhost:PORTA/transferir">
  <input name=para value=2><input name=valor value=100>
</form><script>f.submit()</script>
§§§
### Resultados medidos (Chrome 157, saldo inicial 1000)
| Versão | Atacante **same-site** (§localhost§, outra porta) | Atacante **cross-site** (§127.0.0.1§) |
|---|---|---|
| **Vulnerável** (cookie §sid=…; Path=/§, sem token) | **1000 → 900: transferência feita** | **900 → 800: transferência feita** |
| **Corrigida** (token + JSON + Origin + §SameSite=Strict§) | **1000 → 1000: sem efeito** | **1000 → 1000: sem efeito** |
**Dois pontos importantes:**
- **Same-site ≠ same-origin:** **"site" = esquema + domínio registrável; a porta não conta.** **Uma página em §localhost:9999§ é *cross-origin* mas *same-site* de §localhost:8080§**: **o cookie é enviado mesmo com §SameSite=Strict§**. **Logo, §SameSite§ não protege de atacantes no mesmo site** (**outra porta, subdomínio comprometido, aplicação irmã**). **É preciso o token.**
- **O ataque *cross-site* também funcionou na vulnerável**, **apesar de a maioria dos navegadores tratar cookies sem §SameSite§ como §Lax§.** **O resultado é consistente com a exceção "Lax+POST" do Chrome** (**cookies sem §SameSite§ explícito podem ser enviados em POSTs de navegação de nível superior logo após serem criados**), **mas a causa não foi isolada.** **Lição: não dependa de padrões do navegador; declare §SameSite§ explicitamente.**

### As defesas
1. **Token anti-CSRF (*synchronizer token*):** **valor imprevisível ligado à sessão, enviado em cabeçalho (§x-csrf-token§) ou campo oculto e verificado no servidor.** **No laboratório o login devolve §csrf§ e §/transferir§ compara.** **O atacante não consegue ler o token** (**a política de mesma origem impede**).
2. **Cabeçalho customizado + JSON:** **formulários HTML só enviam §application/x-www-form-urlencoded§, §multipart/form-data§ ou §text/plain§**; **exigir §application/json§ e um cabeçalho como §x-csrf-token§ força um *preflight* CORS** **que o servidor nega para origens estranhas.** **Medido:** **formulário → §415§; JSON sem token → §403§.**
3. **Validar §Origin§ (e §Referer§):** **medido: token correto + §Origin: http://evil.test§ → §403§; token correto sem Origin estranha → §200§.** **Útil como camada extra** (**cabeçalho ausente em alguns casos: decida a política**).
4. **Cookies §SameSite§:** **§Lax§ (padrão atual na maioria dos navegadores) bloqueia a maioria dos envios cross-site que não são navegação segura**; **§Strict§ bloqueia todos os cross-site**; **§None§ exige §Secure§.** **Camada valiosa, não substituta do token.**
5. **Reautenticação ou confirmação** (**senha, MFA, código**) **para ações sensíveis.**
6. **Métodos corretos:** **nunca mude estado com §GET§** (**é "seguro" por convenção; links e imagens disparam GETs**).

### CSRF em APIs e SPAs
**SPA com cookie de sessão** **precisa do mesmo cuidado**: **token enviado em cabeçalho por script (*double submit* ou sincronizado).** **SPA com token em cabeçalho §Authorization§** **evita CSRF, mas fica mais exposta a XSS se o token estiver em armazenamento acessível ao JavaScript** (**troca de risco: decida conscientemente**).

### Detecção e testes
**Teste cada rota que muda estado sem o token, com Origin estranha e com content-type de formulário** (**o laboratório faz isso: 415, 403, 403, 200**). **Registre falhas de CSRF (um pico indica ataque ou bug).** **Frameworks costumam trazer middleware pronto: use-o e teste.**

### Executado e não executado
**Executado:** **CSRF em Chrome 157 (same-site e cross-site) e testes HTTP de token, Origin e content-type.** **Não executado:** **outros navegadores (Firefox, Safari), HTTPS com §Secure§, *double submit cookie*, login CSRF, SPAs com cabeçalho Authorization.**`,
  concepts: [
    { term: 'CSRF', def: 'Ataque em que um site malicioso faz o navegador da vítima enviar requisições autenticadas por cookie a outro site.' },
    { term: 'SameSite', def: 'Atributo de cookie que controla se ele é enviado em requisições cross-site (Strict, Lax ou None).' },
    { term: 'Same-site x same-origin', def: 'Site considera esquema e domínio registrável; origem considera também a porta. Mesma site pode ter origens diferentes.' },
    { term: 'Token anti-CSRF', def: 'Valor imprevisível associado à sessão e exigido em requisições que mudam estado.' },
    { term: 'Preflight', def: 'Requisição OPTIONS enviada pelo navegador para pedir permissão antes de requisições cross-origin não simples.' },
    { term: 'Origin', def: 'Cabeçalho que informa a origem de uma requisição, útil para validar de onde ela veio.' },
    { term: 'Double submit', def: 'Técnica em que o token é enviado em cookie e em parâmetro/cabeçalho e o servidor compara os dois.' },
    { term: 'Login CSRF', def: 'Variante em que o atacante força a vítima a entrar na conta do atacante.' }
  ],
  examples: R`**Analogia:** **o cookie é o crachá que o navegador mostra automaticamente a cada porta do prédio.** **Um impostor pede à vítima que "assine este papel" na recepção**: **o crachá vai junto, e a recepção acha que a ordem veio dela.** **O token anti-CSRF é uma senha secreta do dia que só quem está dentro do prédio conhece**: **o impostor não a tem e a recepção recusa.**

**Exemplo concreto (medido):** **a mesma página do atacante tirou 100 da conta (1000 → 900) por um atacante same-site e (900 → 800) por um cross-site na versão vulnerável**; **na corrigida o saldo ficou em 1000 nas duas tentativas.**`,
  code: [
    { title: 'Validação anti-CSRF no servidor (trecho de web.mjs)', lang: 'javascript', code: R`if (path === '/transferir' && req.method === 'POST') {
  if (!s) return send(401, { erro: 'não autenticado' });
  // exige JSON (formulários HTML não conseguem enviar) — respondido antes com 415
  // token ligado à sessão + Origin na lista de permissão
  if (req.headers['x-csrf-token'] !== s.csrf || (origin && !app.origens.includes(origin))) {
    return send(403, { erro: 'CSRF' });
  }
  // ... executa a transferência
}`, notes: [{ l: 3, t: 'Formulário urlencoded foi recusado com 415 no laboratório.' }, { l: 5, t: 'O atacante não lê o token (mesma origem) e não controla o Origin.' }] },
    { title: 'Cookie de sessão com atributos explícitos', lang: 'text', code: R`Set-Cookie: sid=<aleatório>; Path=/; HttpOnly; SameSite=Strict
# em produção HTTPS: acrescente Secure e considere o prefixo __Host-
Set-Cookie: __Host-sid=<aleatório>; Path=/; Secure; HttpOnly; SameSite=Lax`, notes: [{ l: 1, t: 'Versão do laboratório (HTTP local).' }, { l: 3, t: 'Prefixo __Host- exige Secure, Path=/ e sem Domain (documentado na MDN).' }] }
  ],
  bestPractices: ['Proteja toda ação que muda estado com token anti-CSRF e nunca use GET para isso.', 'Exija JSON e cabeçalho customizado para forçar preflight e valide o Origin.', 'Declare SameSite explicitamente (Lax ou Strict) e use HttpOnly e Secure.', 'Não confie em SameSite contra atacantes no mesmo site.', 'Peça reautenticação em ações sensíveis.', 'Teste cada rota sem token, com Origin estranha e com content-type de formulário.', 'Use o middleware CSRF do framework e registre as falhas.'],
  mistakes: ['Achar que o padrão Lax do navegador basta.', 'Mudar estado com GET.', 'Token previsível ou compartilhado entre sessões.', 'Aceitar qualquer content-type no endpoint de escrita.', 'Validar Origin por substring ou expressão frouxa.', 'Esquecer que subdomínios e outras portas são same-site.', 'Não testar CSRF no CI.'],
  market: R`**CSRF** **é pergunta clássica de segurança web**; **diferenciar same-site de same-origin e explicar os limites do SameSite** **mostra domínio real do assunto.**`,
  summary: R`O CSRF explora a autenticação automática por cookie: uma página do atacante faz o navegador da vítima enviar uma requisição que muda estado. Em Chrome 157, um formulário auto-enviado tirou 100 da conta na versão vulnerável tanto de um atacante same-site (1000 para 900) quanto de um cross-site (900 para 800), enquanto a corrigida manteve o saldo em 1000. Os testes HTTP mostraram 415 para formulário, 403 sem token, 403 com Origin estranha e 200 com token legítimo. As defesas são token anti-CSRF, JSON com cabeçalho customizado (preflight), validação de Origin, cookies SameSite explícitos e reautenticação; SameSite não protege de atacantes do mesmo site. A causa do sucesso cross-site não foi isolada; outros navegadores e HTTPS não foram testados.`,
  refs: [REF.csCsrf, REF.cwe352, REF.mdnCookies, REF.chromeSamesite, REF.portswigger],
  cards: [
    { q: 'Quais as condições do CSRF?', a: 'Ação que muda estado, autenticação automática por cookie e parâmetros previsíveis pelo atacante.' },
    { q: 'Por que SameSite=Strict não impediu o ataque same-site?', a: 'Same-site considera esquema e domínio registrável, não a porta; outra porta de localhost é same-site e o cookie foi enviado. O token resolveu.' },
    { q: 'Por que exigir JSON e um cabeçalho customizado ajuda?', a: 'Formulários HTML não os enviam, e o cabeçalho customizado força um preflight CORS que o servidor nega a origens estranhas.' },
    { q: 'Por que declarar SameSite explicitamente?', a: 'Padrões variam por navegador e versão; no teste, o cookie sem SameSite deixou o ataque cross-site funcionar.' }
  ]
}
];
