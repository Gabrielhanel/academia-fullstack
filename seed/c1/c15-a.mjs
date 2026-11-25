// C1.5 — APIs do navegador e Web Platform. Aulas 1 a 3 (DOM e eventos, Storage e cookies, IndexedDB e Cache API).
const R = String.raw;

export const REF = {
  mdnEvents: { title: 'MDN — Introdução a eventos', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events', kind: 'doc' },
  mdnBubbling: { title: 'MDN — Event bubbling', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling', kind: 'doc' },
  domSpec: { title: 'WHATWG — DOM Standard (Events)', url: 'https://dom.spec.whatwg.org/#events', kind: 'spec' },
  htmlSpec: { title: 'WHATWG — HTML Living Standard', url: 'https://html.spec.whatwg.org/multipage/', kind: 'spec' },
  mdnWebStorage: { title: 'MDN — Web Storage API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API', kind: 'doc' },
  mdnCookies: { title: 'MDN — Using HTTP cookies', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', kind: 'doc' },
  mdnQuotas: { title: 'MDN — Storage quotas and eviction criteria', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria', kind: 'doc' },
  mdnIdb: { title: 'MDN — IndexedDB API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API', kind: 'doc' },
  mdnUsingIdb: { title: 'MDN — Using IndexedDB', url: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB', kind: 'doc' },
  mdnCache: { title: 'MDN — Cache (API de cache)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Cache', kind: 'doc' },
  mdnStorageManager: { title: 'MDN — StorageManager (estimate e persist)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/StorageManager', kind: 'doc' },
  owaspHtml5: { title: 'OWASP — HTML5 Security Cheat Sheet (armazenamento local)', url: 'https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'web-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['DOM', 'eventos', 'delegação', 'bubbling'],
  title: 'DOM e eventos: propagação, delegação e ordem de execução',
  objectives: ['Descrever a árvore do DOM e selecionar, criar e alterar nós com segurança', 'Explicar as fases de propagação de um evento (captura, alvo e bolha) e a diferença entre target e currentTarget', 'Aplicar delegação de eventos para listas dinâmicas', 'Usar preventDefault, stopPropagation, once e passive corretamente', 'Criar eventos personalizados e entender a ordem entre microtarefas, tarefas e quadros de animação'],
  intro: `O **DOM** (Document Object Model) é a representação em objetos da página que o navegador mantém na memória, e os **eventos** são o mecanismo pelo qual a página reage ao usuário e ao sistema. Quase toda interface web é "montar nós do DOM e ligar ouvintes de eventos", mesmo quando um framework faz isso por baixo. Entender **como o evento viaja** pela árvore explica comportamentos que parecem mágica (um clique que "atravessa" elementos, uma lista que continua funcionando depois de receber itens novos) e evita bugs clássicos. Os exemplos desta aula foram executados no **Chrome 157** e no Chromium do ambiente de teste.`,
  theory: `### O DOM como árvore de objetos
O HTML é lido pelo navegador e transformado em uma **árvore de nós**: o §document§ na raiz, elementos (§<ul>§, §<li>§), textos e atributos. Cada nó é um objeto JavaScript com propriedades e métodos. As operações essenciais:
- **selecionar**: §document.querySelector(seletor)§ (primeiro) e §querySelectorAll§ (todos, lista estática);
- **criar e inserir**: §createElement§, §append§, §before§, §remove§, §replaceChildren§;
- **alterar**: §textContent§ (texto puro, seguro), atributos (§setAttribute§, §dataset§), classes (§classList.toggle§);
- **ler dados customizados**: atributos §data-id§ viram §el.dataset.id§.
**Segurança:** §innerHTML§ interpreta o texto como HTML e abre espaço para **XSS** se o conteúdo vier do usuário. Para exibir texto, use §textContent§; para HTML de fonte não confiável, use sanitização.

### O que é um evento
Um **evento** é um objeto (§Event§ e subtipos: §MouseEvent§, §KeyboardEvent§, §SubmitEvent§...) enviado a um **alvo** (§EventTarget§). Você registra um **ouvinte** com §addEventListener(tipo, função, opções)§. Prefira §addEventListener§ a atributos como §onclick=""§ no HTML: permite vários ouvintes, opções e remoção.

### As três fases da propagação
Quando algo acontece em um elemento (o **alvo**), o evento percorre a árvore em três fases:
1. **Captura**: da raiz (§window§) descendo até o pai do alvo;
2. **Alvo**: ouvintes do próprio elemento;
3. **Bolha** (*bubbling*): do alvo subindo de volta até a raiz.
Por padrão os ouvintes rodam na **bolha**; passar §true§ (ou §{ capture: true }§) registra na **captura**. No experimento, ao clicar em um botão dentro de um §<ul>§, a ordem registrada foi: §ul-captura§ → §ul-bolha§ (com §target§ = BUTTON e §currentTarget§ = UL) → §body-bolha§.

- **§event.target§**: o elemento onde o evento **começou** (o clicado);
- **§event.currentTarget§**: o elemento cujo ouvinte está **executando agora**.
Nem todo evento borbulha (§focus§, §blur§, §mouseenter§ não borbulham; use §focusin§, §focusout§, §mouseover§ quando precisar).

### Delegação de eventos
Em vez de um ouvinte por botão, registre **um** no contêiner e descubra o item com §event.target.closest(seletor)§:
- uma lista com 10 mil itens usa **um** ouvinte, não 10 mil;
- itens **adicionados depois** funcionam sem registrar nada. No teste, o botão de id 3, criado após o registro, foi tratado normalmente (§delegados: ["2","3"]§).
Cuidado com §closest§ cruzando limites do contêiner (confira §contem§) e com eventos que não borbulham.

### Controlando o evento
- **§preventDefault()§**: cancela a ação padrão (seguir um link, enviar um formulário). O evento ainda propaga. O link do teste não navegou e §defaultPrevented§ ficou §true§.
- **§stopPropagation()§**: impede que o evento continue para os próximos nós; use pouco, pois quebra delegação e analytics de quem está acima (no teste, o pai recebeu **0** cliques).
- **§stopImmediatePropagation()§**: também impede os demais ouvintes do mesmo nó.
- **Opções**: §{ once: true }§ (remove após a primeira execução; no teste, dois cliques executaram **1** vez), §{ passive: true }§ (promete não chamar §preventDefault§; essencial em §scroll§ e §touchmove§ para manter a rolagem fluida) e §{ signal }§ (remove vários ouvintes de uma vez com §AbortController§).

### Eventos personalizados
§new CustomEvent('pedido', { detail: { id: 7 } })§ e §target.dispatchEvent(evento)§ criam eventos próprios, úteis para desacoplar componentes (qualquer §EventTarget§ serve, não só elementos). O dado vai em §detail§.

### Ordem entre tarefas, microtarefas e quadros
O JavaScript do navegador roda em uma thread com um **laço de eventos**. A ordem típica após o código síncrono é: **microtarefas** (promises, §queueMicrotask§) → **tarefas** (§setTimeout§, eventos) → **renderização** com §requestAnimationFrame§ antes do próximo desenho. No teste, §Promise.then§ executou antes de §setTimeout(0)§, e em uma aba visível o §requestAnimationFrame§ veio depois deles. Em abas em segundo plano, o §requestAnimationFrame§ pode **não ser chamado** (observamos isso no navegador embutido do ambiente), então nunca dependa dele para lógica de negócio.

### Desempenho
Leituras de layout (§offsetHeight§, §getBoundingClientRect§) logo após escritas no DOM forçam o navegador a recalcular o layout (*layout thrashing*). Agrupe leituras e escritas, use §DocumentFragment§ ou §replaceChildren§ para inserir muitos nós e §IntersectionObserver§ no lugar de eventos de rolagem para observar visibilidade.`,
  concepts: [
    { term: 'DOM', def: 'Representação em árvore de objetos do documento, mantida pelo navegador.' },
    { term: 'Evento', def: 'Objeto enviado a um alvo para indicar que algo aconteceu (clique, tecla, envio).' },
    { term: 'Fases de propagação', def: 'Captura (raiz até o pai do alvo), alvo e bolha (do alvo até a raiz).' },
    { term: 'target / currentTarget', def: 'target é onde o evento começou; currentTarget é o nó cujo ouvinte está executando.' },
    { term: 'Delegação de eventos', def: 'Registrar um único ouvinte em um ancestral e identificar o item com closest().' },
    { term: 'preventDefault', def: 'Cancela a ação padrão do navegador para o evento, sem interromper a propagação.' },
    { term: 'Ouvinte passivo', def: 'Ouvinte que promete não chamar preventDefault, permitindo rolagem fluida.' },
    { term: 'CustomEvent', def: 'Evento criado pelo programa, com dados em detail.' },
    { term: 'Microtarefa', def: 'Tarefa de alta prioridade (promises) executada antes da próxima tarefa e da renderização.' },
    { term: 'XSS', def: 'Injeção de script por conteúdo não confiável interpretado como HTML.' }
  ],
  examples: R`**Analogia:** o evento é um **recado entregue em um prédio**. Primeiro o porteiro (captura) vê o recado descer da portaria até o andar; o morador (alvo) o recebe; depois o recado "sobe" de volta (bolha) passando por cada andar que pediu para ser avisado. A **delegação** é pedir ao porteiro que anote qualquer recado para o prédio inteiro em vez de instalar uma campainha em cada apartamento, inclusive nos apartamentos que ainda serão construídos.

**Resultados medidos (Chrome 157 e Chromium do ambiente):**
- ordem do clique em um botão dentro de uma lista: §ul-captura§, §ul-bolha:BUTTON/UL§, §body-bolha§ (target BUTTON, currentTarget UL);
- delegação: itens 2 e 3 tratados, inclusive o 3, adicionado depois;
- §preventDefault§: o link não navegou (§defaultPrevented§ verdadeiro) e a URL não ganhou hash;
- §once§: 2 cliques, 1 execução; §stopPropagation§: o pai recebeu 0 cliques;
- §CustomEvent§: §detail§ = §{ id: 7 }§;
- filas: §["microtask","timeout","raf"]§ no Chrome headless (no painel embutido o §raf§ não foi chamado).

**Caso real:** uma tabela de pedidos com botões "excluir" criados dinamicamente ao rolar a página. Um único ouvinte em §<tbody>§ com §closest('[data-acao="excluir"]')§ trata todas as linhas, antigas e novas, sem vazamento de ouvintes.`,
  code: [
    { title: 'Propagação, delegação e controle de eventos (executado em Chrome 157)', lang: 'javascript', code: R`const ul = document.getElementById('lista');
const ordem = [];
ul.addEventListener('click', (e) => ordem.push('ul-bolha:' + e.target.tagName + '/' + e.currentTarget.tagName));
ul.addEventListener('click', () => ordem.push('ul-captura'), true);       // captura
document.body.addEventListener('click', () => ordem.push('body-bolha'));

const removidos = [];
ul.addEventListener('click', (e) => {                                      // delegação
  const b = e.target.closest('.del');
  if (b && ul.contains(b)) removidos.push(b.dataset.id);
});
ul.querySelector('[data-id="2"]').click();
const li = document.createElement('li');
li.innerHTML = '<button class="del" data-id="3">x3</button>';             // item novo
ul.append(li); li.firstChild.click();
console.log(ordem.slice(0, 3), removidos);   // ['ul-captura', 'ul-bolha:BUTTON/UL', 'body-bolha'] ['2', '3']`, notes: [{ l: '4', t: 'O terceiro argumento true registra o ouvinte na fase de captura.' }, { l: '9', t: 'closest sobe a partir do alvo até achar o seletor; contains evita sair do contêiner.' }, { l: '12', t: 'O item criado depois também é tratado: o ouvinte está no ancestral.' }, { l: '15', t: 'Saída observada: [ul-captura, ul-bolha:BUTTON/UL, body-bolha] e [2, 3].' }] },
    { title: 'preventDefault, once, stopPropagation e CustomEvent (executado)', lang: 'javascript', code: R`const a = document.getElementById('lnk');          // <a href="#nao-navegar">
a.addEventListener('click', (e) => { e.preventDefault(); console.log(e.defaultPrevented); });
a.click();                                          // true, e location.hash continua vazio

let n = 0;
const b = document.createElement('button');
b.addEventListener('click', () => n++, { once: true });
b.click(); b.click();
console.log(n);                                     // 1

const pai = document.createElement('div'), filho = document.createElement('button');
pai.append(filho);
let recebeu = 0;
pai.addEventListener('click', () => recebeu++);
filho.addEventListener('click', (e) => e.stopPropagation());
filho.click(); console.log(recebeu);               // 0

const alvo = new EventTarget();
alvo.addEventListener('pedido', (e) => console.log(e.detail));
alvo.dispatchEvent(new CustomEvent('pedido', { detail: { id: 7 } }));   // { id: 7 }`, notes: [{ l: '2', t: 'preventDefault cancela a navegação, mas o evento continua propagando.' }, { l: '6', t: 'once remove o ouvinte depois da primeira execução.' }, { l: '15', t: 'stopPropagation impediu o pai de saber do clique: use com moderação.' }, { l: '20', t: 'Qualquer EventTarget pode emitir eventos: não é preciso ter um elemento.' }] }
  ],
  bestPractices: ['Use §textContent§ para texto e sanitize qualquer HTML vindo de fora.', 'Prefira delegação em listas, tabelas e conteúdo dinâmico.', 'Use §addEventListener§ com §{ once }§, §{ passive }§ e §{ signal }§ quando fizerem sentido.', 'Evite §stopPropagation§; use-o apenas quando houver motivo claro.', 'Em eventos de rolagem e toque, marque os ouvintes como passivos.', 'Nunca dependa de §requestAnimationFrame§ para lógica que precisa rodar em abas em segundo plano.'],
  mistakes: ['Registrar um ouvinte por item em listas grandes e esquecer de removê-los.', 'Usar §innerHTML§ com texto do usuário.', 'Confundir §target§ com §currentTarget§.', 'Chamar §stopPropagation§ e quebrar a delegação de outros componentes.', 'Esperar que §focus§ e §mouseenter§ borbulhem.', 'Ler medidas de layout dentro de laços que alteram o DOM (layout thrashing).'],
  market: `DOM e eventos são a base de qualquer front-end, mesmo com React, Vue ou Angular: sintomas como "o clique dispara duas vezes" ou "o item novo não responde" são problemas de propagação e registro de ouvintes. Entrevistas costumam pedir a explicação das fases do evento, a implementação de delegação e a ordem entre promises, timers e renderização.`,
  summary: `O DOM é uma árvore de objetos; eventos viajam por captura, alvo e bolha, com target (origem) e currentTarget (ouvinte atual). A delegação usa um ouvinte em um ancestral e closest() para tratar itens atuais e futuros. preventDefault cancela a ação padrão; stopPropagation interrompe a propagação (use pouco); once, passive e signal refinam ouvintes. CustomEvent desacopla componentes. Microtarefas rodam antes de tarefas, e requestAnimationFrame pertence ao ciclo de renderização.`,
  refs: [REF.mdnEvents, REF.mdnBubbling, REF.domSpec, REF.htmlSpec],
  cards: [
    { q: 'Quais são as fases de propagação de um evento?', a: 'Captura (da raiz ao pai do alvo), alvo e bolha (do alvo de volta à raiz).' },
    { q: 'Qual a diferença entre target e currentTarget?', a: 'target é o elemento onde o evento começou; currentTarget é o elemento cujo ouvinte está sendo executado.' },
    { q: 'Por que usar delegação de eventos?', a: 'Um único ouvinte trata muitos itens, inclusive os criados depois, e economiza memória.' },
    { q: 'O que preventDefault faz com a propagação?', a: 'Nada: cancela só a ação padrão (como seguir um link); o evento continua propagando.' }
  ]
},
{
  id: 'web-02', moduleId: 'm1', order: 2, minutes: 55, tags: ['localStorage', 'sessionStorage', 'cookies', 'segurança', 'quota'],
  title: 'Armazenamento no cliente: Web Storage e cookies',
  objectives: ['Escolher entre localStorage, sessionStorage e cookies para cada tipo de dado', 'Serializar dados com JSON e tratar valores ausentes e erros de quota', 'Explicar o escopo por origem e o evento storage entre abas', 'Configurar cookies com Secure, HttpOnly e SameSite e entender o que o JavaScript consegue ler', 'Identificar riscos de segurança de guardar dados sensíveis no navegador'],
  intro: `Aplicações web precisam **lembrar** coisas: preferências de tema, rascunhos de formulário, um carrinho, o estado de uma sessão. O navegador oferece vários lugares para isso, cada um com **limites e riscos** diferentes. Esta aula trata dos mais simples, **Web Storage** (§localStorage§ e §sessionStorage§) e **cookies**, e dá critérios para escolher. A aula seguinte cobre o armazenamento estruturado (IndexedDB e Cache API). Os comportamentos descritos foram medidos no Chrome 157.`,
  theory: `### Escopo por origem
Todo armazenamento do navegador é separado por **origem** (esquema + domínio + porta). §https://app.exemplo.com§ não enxerga os dados de §https://outro.exemplo.com§, nem os de §http://app.exemplo.com§ (esquema diferente) ou de §https://app.exemplo.com:8443§ (porta diferente). Isso é uma barreira de segurança, mas **qualquer script da mesma origem lê tudo** (inclusive scripts de terceiros que você incluiu).

### Web Storage: localStorage e sessionStorage
- **§localStorage§**: persiste até ser apagado (pelo código, pelo usuário ou pelo navegador sob pressão de espaço); compartilhado por todas as abas da origem.
- **§sessionStorage§**: dura enquanto a **aba** (o contexto de navegação) existir; cada aba tem o seu.
API **síncrona** e simples: §setItem(chave, valor)§, §getItem(chave)§ (devolve **§null§** se não existir), §removeItem§, §clear§, §key(i)§, §length§.

**Só guardam strings.** No teste, §setItem('n', 42)§ devolveu a string §"42"§ e §setItem('o2', {})§ gravou §"[object Object]"§ (o objeto foi convertido por §toString§). Para estruturas, use **JSON**: §JSON.stringify§ ao gravar e §JSON.parse§ ao ler, tratando o caso de **valor ausente ou corrompido** com §try/catch§.

**Limites e custos:**
- cota pequena: no Chrome 157, gravar blocos de 1 milhão de caracteres falhou com **§QuotaExceededError§** na quinta gravação (cerca de 5 milhões de caracteres no total); outros navegadores variam. **Sempre trate a exceção** de §setItem§;
- é **síncrono**: operações grandes **bloqueiam** a thread principal;
- não está disponível em **Workers**;
- pode estar **bloqueado** ou vazio (modo privado, política do usuário): envolva o acesso em §try/catch§ e tenha um valor padrão.

### Evento storage
Quando **outra aba** da mesma origem altera o §localStorage§, esta aba recebe o evento §storage§ (§key§, §oldValue§, §newValue§). Serve para sincronizar tema e logout entre abas. A aba que fez a mudança **não** recebe o evento.

### Cookies
Um **cookie** é um pequeno par nome=valor que o navegador **envia automaticamente** ao servidor em cada requisição (para o domínio e caminho correspondentes). Nasce de um cabeçalho §Set-Cookie§ do servidor ou de §document.cookie§ no cliente. Atributos importantes:
| Atributo | Efeito |
|---|---|
| §Max-Age§ / §Expires§ | duração; sem eles, é cookie de sessão |
| §Path§ / §Domain§ | onde é enviado |
| §Secure§ | só trafega por HTTPS |
| §HttpOnly§ | **invisível ao JavaScript**, só vai nas requisições (protege contra roubo por XSS) |
| §SameSite§ | §Strict§, §Lax§ ou §None§: controla envio em requisições entre sites (defesa contra CSRF); §None§ exige §Secure§ |
No teste, §document.cookie = "sess=abc; HttpOnly"§ **não criou o cookie**: o atributo §HttpOnly§ só pode ser definido pelo servidor, e §document.cookie§ listou apenas §tema=escuro§. O tamanho de um cookie é limitado (cerca de 4 KB) e eles **aumentam o tamanho de toda requisição**; não são para dados volumosos.

### Qual escolher?
| Necessidade | Escolha |
|---|---|
| Preferência de interface (tema, idioma) | §localStorage§ |
| Rascunho de um formulário durante a aba | §sessionStorage§ |
| Identificador de sessão enviado ao servidor | cookie §HttpOnly; Secure; SameSite§ definido pelo servidor |
| Dados estruturados e volumosos, busca | IndexedDB (aula 3) |
| Respostas de rede para uso offline | Cache API (aula 3) |

### Segurança
- **Nunca guarde segredos** (senhas, tokens de longa duração) em §localStorage§: qualquer XSS os lê. Tokens de sessão ficam melhor em cookies §HttpOnly§.
- Dados no cliente podem ser **alterados pelo usuário**: valide tudo de novo no servidor.
- Respeite a privacidade: cookies e armazenamento usados para rastreamento exigem **consentimento** em muitas jurisdições (LGPD, GDPR).
- Informe e permita apagar: o usuário pode limpar os dados do site a qualquer momento, e o código deve funcionar sem eles.

### Estimativa de uso
§navigator.storage.estimate()§ informa uso e cota aproximados da origem (somando IndexedDB, Cache API e outros), e §navigator.storage.persist()§ pede que o navegador **não** apague os dados sob pressão de espaço. No teste, §persisted()§ devolveu §false§ por padrão.`,
  concepts: [
    { term: 'Origem', def: 'Combinação de esquema, domínio e porta que delimita o acesso ao armazenamento e a outros recursos.' },
    { term: 'localStorage', def: 'Armazenamento chave-valor de strings, persistente e compartilhado entre abas da mesma origem.' },
    { term: 'sessionStorage', def: 'Armazenamento chave-valor limitado à aba (contexto de navegação).' },
    { term: 'QuotaExceededError', def: 'Exceção lançada quando a cota de armazenamento é excedida.' },
    { term: 'Evento storage', def: 'Evento disparado nas outras abas quando o localStorage muda.' },
    { term: 'Cookie', def: 'Par nome=valor enviado automaticamente ao servidor nas requisições correspondentes.' },
    { term: 'HttpOnly', def: 'Atributo que torna o cookie inacessível ao JavaScript.' },
    { term: 'SameSite', def: 'Atributo que controla o envio do cookie em requisições entre sites (Strict, Lax, None).' },
    { term: 'Secure', def: 'Atributo que restringe o cookie a conexões HTTPS.' },
    { term: 'StorageManager', def: 'API (navigator.storage) para estimar uso e cota e pedir armazenamento persistente.' }
  ],
  examples: R`**Analogia:** o §localStorage§ é uma **gaveta da sua casa** (fica lá até você esvaziar); o §sessionStorage§, um **bloco de notas do dia** (acaba quando a aba fecha); o cookie é um **crachá** que o porteiro (servidor) lê em toda entrada. Não guarde a chave do cofre na gaveta: qualquer visitante que entre (script injetado) a pega.

**Resultados medidos (Chrome 157):**
- §setItem('n', 42)§ → §typeof getItem('n')§ = string; §getItem('nada')§ = §null§;
- §setItem('o2', {})§ → §"[object Object]"§;
- cota: 4 gravações de 1 milhão de caracteres e **QuotaExceededError** na 5ª;
- §document.cookie = 'tema=escuro; path=/; max-age=60; SameSite=Lax'§ criou o cookie; o com §HttpOnly§ definido via JavaScript **não foi criado**;
- §navigator.storage.persisted()§ = §false§.

**Caso real:** um site guarda o tema em §localStorage§ e aplica a classe no §<html>§ **antes** do primeiro desenho (script inline curto) para evitar o "flash" de tema errado; a sessão do usuário fica em cookie §HttpOnly; Secure; SameSite=Lax§ emitido pelo servidor.`,
  code: [
    { title: 'Leitura e escrita seguras com JSON e tratamento de erros (executado em Chrome 157)', lang: 'javascript', code: R`const guardar = {
  ler(chave, padrao) {
    try {
      const bruto = localStorage.getItem(chave);        // null se não existir
      return bruto === null ? padrao : JSON.parse(bruto);
    } catch { return padrao; }                           // JSON inválido ou storage bloqueado
  },
  gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch (e) { if (e.name === 'QuotaExceededError') return false; throw e; }
  }
};
guardar.gravar('prefs', { tema: 'escuro', fonte: 16 });
console.log(guardar.ler('prefs', {}), guardar.ler('nada', { tema: 'claro' }));
localStorage.setItem('n', 42);
console.log(typeof localStorage.getItem('n'), localStorage.getItem('nada'));   // string null

window.addEventListener('storage', (e) => console.log(e.key, e.oldValue, '->', e.newValue)); // disparado nas OUTRAS abas`, notes: [{ l: '4', t: 'getItem devolve null quando a chave não existe.' }, { l: '6', t: 'JSON.parse lança em texto inválido; o padrão evita quebrar a página.' }, { l: '11', t: 'Trate a quota: false indica que não coube; outros erros são relançados.' }, { l: '14', t: 'Saída observada: { tema: \'escuro\', fonte: 16 } e { tema: \'claro\' }.' }, { l: '19', t: 'O evento não dispara na aba que alterou o valor.' }] },
    { title: 'Cookies: o que o JavaScript cria e enxerga (executado)', lang: 'javascript', code: R`document.cookie = 'tema=escuro; path=/; max-age=60; SameSite=Lax';
document.cookie = 'sess=abc; path=/; HttpOnly';          // ignorado: HttpOnly só vem do servidor
console.log(document.cookie);                             // 'tema=escuro'

// Cabeçalho que o SERVIDOR deve enviar para uma sessão:
// Set-Cookie: sessao=<id>; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Lax`, notes: [{ l: '2', t: 'O cookie com HttpOnly não foi criado pelo JavaScript no teste.' }, { l: '3', t: 'document.cookie lista apenas os cookies legíveis, sem atributos.' }, { l: '6', t: 'Apenas o servidor pode emitir HttpOnly; o exemplo de cabeçalho não foi executado aqui.' }] }
  ],
  bestPractices: ['Envolva o acesso ao Web Storage em §try/catch§ e ofereça valores padrão.', 'Serialize com JSON e valide o formato lido (ele pode ter sido alterado ou ser de uma versão antiga).', 'Versione o formato dos dados (por exemplo, uma chave §v§) para migrar no futuro.', 'Não guarde segredos nem dados pessoais sensíveis em §localStorage§.', 'Use cookies §HttpOnly; Secure; SameSite§ para sessão, emitidos pelo servidor.', 'Peça consentimento para armazenamento de rastreamento e permita limpar os dados.'],
  mistakes: ['Esperar que §setItem§ guarde objetos ou números com seus tipos.', 'Ignorar §QuotaExceededError§ e perder dados em silêncio.', 'Guardar token de acesso de longa duração em §localStorage§.', 'Usar Web Storage para grandes volumes e bloquear a interface.', 'Confiar em dados do cliente sem validar no servidor.', 'Tentar criar cookie §HttpOnly§ pelo JavaScript.'],
  market: `Sessão, preferências, carrinhos e rascunhos usam essas APIs em quase todo produto web. Perguntas de segurança (onde guardar tokens, XSS, CSRF, SameSite) aparecem em entrevistas e auditorias, e conformidade com LGPD e GDPR trata cookies e armazenamento como dados que exigem base legal e transparência.`,
  summary: `O armazenamento do navegador é isolado por origem. Web Storage guarda strings de forma síncrona (localStorage persistente; sessionStorage por aba), com cota pequena e QuotaExceededError; use JSON, try/catch e valores padrão, e o evento storage sincroniza abas. Cookies vão ao servidor em toda requisição; HttpOnly, Secure e SameSite protegem sessões. Nunca guarde segredos em localStorage; dados volumosos pedem IndexedDB.`,
  refs: [REF.mdnWebStorage, REF.mdnCookies, REF.mdnStorageManager, REF.owaspHtml5],
  cards: [
    { q: 'Que tipo de valor o Web Storage guarda?', a: 'Somente strings; outros valores são convertidos com toString (objetos viram "[object Object]"). Use JSON.' },
    { q: 'O que HttpOnly faz em um cookie?', a: 'Torna o cookie invisível ao JavaScript, reduzindo o roubo por XSS; só o servidor pode definir.' },
    { q: 'Por que tratar QuotaExceededError?', a: 'A cota é pequena (cerca de 5 milhões de caracteres no Chrome); sem tratamento, a gravação falha e o dado se perde.' },
    { q: 'Qual a diferença entre localStorage e sessionStorage?', a: 'localStorage persiste e é compartilhado entre abas da origem; sessionStorage dura só a aba.' }
  ]
},
{
  id: 'web-03', moduleId: 'm1', order: 3, minutes: 65, tags: ['IndexedDB', 'Cache API', 'transações', 'quota', 'persistência'],
  title: 'IndexedDB e Cache API: dados estruturados e respostas offline',
  objectives: ['Criar bancos IndexedDB com object stores, índices e versões (migrações)', 'Executar operações em transações, usando cursores e índices, e evitar o encerramento prematuro da transação', 'Tratar erros comuns (ConstraintError, TransactionInactiveError) e atomicidade com abort', 'Usar a Cache API para guardar e recuperar pares requisição/resposta', 'Estimar uso e pedir persistência de armazenamento e planejar a evicção de dados'],
  intro: `Quando o **localStorage** não basta (dados estruturados, milhares de registros, busca por campos, arquivos, uso offline), entram duas APIs: o **IndexedDB**, um banco de dados de objetos **assíncrono e transacional** dentro do navegador, e a **Cache API**, um armazém de pares **requisição → resposta** HTTP, base do funcionamento offline com Service Workers (aula 5). Os resultados desta aula foram medidos no Chrome 157 com o laboratório descrito no relatório de execução.`,
  theory: `### IndexedDB em uma frase
Um **banco de dados chave-valor orientado a objetos**, com **object stores** (parecidos com tabelas), **índices** para buscar por outros campos, **transações** (ACID, dentro de uma origem) e **versões** de esquema. É assíncrono (não bloqueia a interface), funciona em Workers e guarda objetos clonáveis (datas, mapas, blobs, arrays tipados).

### Abrir e criar o esquema
§indexedDB.open(nome, versão)§ devolve um pedido (§IDBRequest§) com eventos. **O esquema só pode ser alterado em §onupgradeneeded§**, que dispara quando a versão pedida é maior que a existente (ou o banco não existe). No teste: §upgrade de 0 para 1§ (criação) e depois §migração 1 -> 2§ (adição de um índice).
- §createObjectStore('produtos', { keyPath: 'id', autoIncrement: true })§;
- §createIndex('porCategoria', 'cat')§; com §{ unique: true }§ garante unicidade (§sku§).
**Migrações de versão** são a forma de evoluir o esquema com dados já guardados: escreva uma função por versão e execute em sequência (base do exercício desta aula).

### Transações
Toda leitura ou escrita acontece em uma **transação** (§'readonly'§ ou §'readwrite'§) sobre uma ou mais stores. Propriedades:
- **atomicidade**: se algo falhar ou chamar §abort()§, **nada** é gravado. Após um §abort§ de uma transação que tinha inserido um item, a contagem continuou **3**;
- **auto-commit**: a transação **encerra sozinha** quando não há mais pedidos pendentes e o controle volta ao laço de eventos. Se você fizer um §await§ de algo **que não é IndexedDB** (um §setTimeout§, um §fetch§) antes de usá-la, ela **já terá terminado**: no teste, o §put§ depois de 50 ms lançou **§TransactionInactiveError§**. Faça a busca de rede **antes** de abrir a transação, e abra a transação só para gravar;
- **erros**: inserir §sku§ repetido causou **§ConstraintError§** (o evento de erro cancela a transação a menos que você chame §preventDefault§).
**Operações:** §add§ (falha se a chave existe), §put§ (insere ou substitui), §get§, §getAll§, §delete§, §clear§, §count§, §openCursor§ (percorre registros em ordem) e consultas por intervalo com §IDBKeyRange§. Pelos índices: §index.getAll('papelaria')§ devolveu os dois itens da categoria.

### A API de eventos e as promises
A API nativa usa §onsuccess§ e §onerror§, não promises. Na prática, envolva em uma pequena função que devolve uma promise (como no exemplo) ou use uma biblioteca fina (como o **idb**). Cuidado ao envolver: o **auto-commit** continua valendo, então não deixe um §await§ estranho no meio da transação.

### Cache API
Guarda **respostas** associadas a **requisições**. Principais métodos de §caches§ (o gerenciador) e §cache§:
- §caches.open(nome)§, §caches.keys()§, §caches.delete(nome)§;
- §cache.put(requisicao, resposta)§, §cache.add(url)§ (busca e guarda), §cache.addAll(urls)§;
- §cache.match(requisicao)§ (devolve a resposta ou **§undefined§** se não houver), §cache.keys()§, §cache.delete()§.
**Pegadinha do corpo:** o corpo de uma §Response§ só pode ser lido **uma vez**: reler gerou **TypeError**. Use §response.clone()§ antes de guardar e devolver ao mesmo tempo.
A Cache API **não** considera cabeçalhos de expiração (§max-age§): **você** decide quando invalidar (por versão do nome do cache, por data guardada, por rotina de limpeza). Só guarda requisições **GET** e respostas completas (a resposta 206 parcial não pode ser guardada).

### Cota, persistência e evicção
IndexedDB, Cache API e outros compartilham uma **cota por origem**. §navigator.storage.estimate()§ informa uso e cota aproximados. Sob pressão de espaço, o navegador pode **apagar os dados de origens inteiras** (política "melhor esforço"). §navigator.storage.persist()§ pede armazenamento **persistente**, que só é apagado pelo usuário; o navegador pode negar. Projete a aplicação para **funcionar sem os dados** (recarregar do servidor) e para **sincronizar** com o back-end: o armazenamento local é um cache e uma fila, não a fonte da verdade.

### Boas escolhas
| Dado | Onde |
|---|---|
| Entidades do domínio com busca por campos | IndexedDB com índices |
| Arquivos e blobs grandes | IndexedDB ou Cache API |
| Respostas HTTP para modo offline | Cache API |
| Fila de operações pendentes de sincronização | IndexedDB |
| Preferências pequenas | localStorage |
| Algo que precisa ser lido por outros contextos (Worker, Service Worker) | IndexedDB ou Cache API (o localStorage não existe lá) |`,
  concepts: [
    { term: 'IndexedDB', def: 'Banco de dados de objetos do navegador, assíncrono e transacional.' },
    { term: 'Object store', def: 'Coleção de registros em um banco IndexedDB, equivalente a uma tabela.' },
    { term: 'Índice', def: 'Estrutura que permite buscar registros por outro campo além da chave.' },
    { term: 'onupgradeneeded', def: 'Evento em que o esquema do banco é criado ou alterado, ao aumentar a versão.' },
    { term: 'Transação', def: 'Conjunto de operações atômico; se falhar ou abortar, nada é gravado.' },
    { term: 'TransactionInactiveError', def: 'Erro de usar uma transação que já encerrou, geralmente após um await de algo que não é IndexedDB.' },
    { term: 'Cache API', def: 'Armazém de pares requisição/resposta HTTP usado por Service Workers.' },
    { term: 'Corpo de Response', def: 'Fluxo que só pode ser consumido uma vez; use clone() para ler duas vezes.' },
    { term: 'Evicção', def: 'Remoção de dados de uma origem pelo navegador quando falta espaço.' },
    { term: 'Armazenamento persistente', def: 'Modo em que o navegador só apaga os dados da origem a pedido do usuário (storage.persist).' }
  ],
  examples: R`**Analogia:** o IndexedDB é um **armário de arquivos com fichários e etiquetas** (stores e índices) com um **balcão de atendimento** (transações): você pega a ficha, faz tudo de uma vez e devolve; se o atendente sair para tomar café (um await externo), o balcão fecha. A Cache API é um **guarda-volumes de pedidos prontos**: guarda a resposta de um pedido (a URL) para entregar de novo sem refazê-lo.

**Resultados medidos (Chrome 157):**
- criação: §upgrade de 0 para 1§; busca por índice: §Caneta,Caderno§; §get(3)§: §Mouse§;
- §sku§ duplicado: **ConstraintError**; §put§ após espera externa: **TransactionInactiveError**;
- §abort()§: total permaneceu 3; migração: §1 -> 2§ com índices §porCategoria,porPreco,porSku§;
- Cache API: §match§ devolveu 200 e §{"x":1}§; reler o corpo: **TypeError**; §match§ de chave inexistente: §undefined§; §caches.keys()§: §v1§.

**Caso real:** um aplicativo de notas guarda cada nota em IndexedDB com índice por data, mostra a lista instantaneamente (mesmo offline) e mantém uma store §fila§ com as alterações ainda não enviadas; quando a rede volta, envia e remove da fila.`,
  code: [
    { title: 'IndexedDB: esquema, índices, transações e erros (executado em Chrome 157)', lang: 'javascript', code: R`const req2p = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

const db = await new Promise((res, rej) => {
  const r = indexedDB.open('loja', 1);
  r.onupgradeneeded = () => {                       // só aqui o esquema pode mudar
    const s = r.result.createObjectStore('produtos', { keyPath: 'id', autoIncrement: true });
    s.createIndex('porCategoria', 'cat');
    s.createIndex('porSku', 'sku', { unique: true });
  };
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});

let tx = db.transaction('produtos', 'readwrite');
const st = tx.objectStore('produtos');
st.add({ sku: 'A1', nome: 'Caneta', cat: 'papelaria', preco: 3 });
st.add({ sku: 'B2', nome: 'Caderno', cat: 'papelaria', preco: 15 });
st.add({ sku: 'C3', nome: 'Mouse', cat: 'info', preco: 40 });
await new Promise((r) => (tx.oncomplete = r));

const pap = await req2p(db.transaction('produtos').objectStore('produtos').index('porCategoria').getAll('papelaria'));
console.log(pap.map((p) => p.nome));               // ['Caneta', 'Caderno']

const t3 = db.transaction('produtos', 'readwrite');
await new Promise((r) => setTimeout(r, 50));       // espera externa: a transação encerra
try { t3.objectStore('produtos').put({ id: 1, sku: 'A1', nome: 'x', cat: 'p', preco: 1 }); }
catch (e) { console.log(e.name); }                 // TransactionInactiveError`, notes: [{ l: '4', t: 'open com versão 1 cria o banco; o upgrade só roda quando a versão aumenta.' }, { l: '8', t: 'unique: true rejeita sku repetido com ConstraintError.' }, { l: '18', t: 'oncomplete indica que a transação foi confirmada.' }, { l: '24', t: 'Saída observada: [ \'Caneta\', \'Caderno\' ].' }, { l: '29', t: 'O await de um timer deixa a transação sem pedidos pendentes: ela encerra.' }] },
    { title: 'Cache API: guardar, recuperar e a pegadinha do corpo (executado)', lang: 'javascript', code: R`const c = await caches.open('v1');
await c.put('/api/a', new Response('{"x":1}', { headers: { 'content-type': 'application/json' } }));
const hit = await c.match('/api/a');
console.log(hit.status, await hit.text());          // 200 {"x":1}
console.log(await c.match('/nao'));                  // undefined

const r = new Response('abc');
await r.text();
try { await r.text(); } catch (e) { console.log(e.name); }   // TypeError (corpo já consumido)

const original = new Response('abc');
const copia = original.clone();                      // clone ANTES de consumir
console.log(await original.text(), await copia.text());     // abc abc

console.log(await caches.keys());                    // ['v1']
const { usage, quota } = await navigator.storage.estimate();
console.log(quota > usage);                          // true`, notes: [{ l: '2', t: 'Qualquer par requisição/resposta pode ser guardado; a chave é a requisição.' }, { l: '5', t: 'match devolve undefined quando não há correspondência.' }, { l: '9', t: 'O corpo é um fluxo de leitura única.' }, { l: '12', t: 'clone antes de consumir permite guardar e devolver a mesma resposta.' }] }
  ],
  bestPractices: ['Faça chamadas de rede antes de abrir a transação e mantenha a transação curta.', 'Versione o esquema e escreva uma migração por versão, testada com dados antigos.', 'Use índices para as consultas que a interface realmente faz.', 'Trate §ConstraintError§, §QuotaExceededError§ e falhas de abertura (modo privado, bloqueio).', 'Use §response.clone()§ ao guardar e devolver uma resposta.', 'Nomeie caches com versão e apague os antigos; defina sua política de expiração.'],
  mistakes: ['Usar §await§ de rede ou timers no meio de uma transação.', 'Alterar o esquema fora de §onupgradeneeded§.', 'Esquecer de fechar a conexão antes de uma migração e travar outras abas (§onblocked§).', 'Ler o corpo de uma resposta duas vezes.', 'Tratar o armazenamento local como fonte da verdade e perder dados quando o navegador os apaga.', 'Guardar dados sensíveis sem pensar em criptografia e em dispositivos compartilhados.'],
  market: `Aplicativos offline-first (notas, campo, vendas, saúde, educação) dependem de IndexedDB e Cache API; bibliotecas como Dexie e idb e produtos como PWAs de e-commerce e de editores usam essas bases. Entender transações, migrações de esquema e evicção diferencia quem constrói uma "demonstração offline" de quem entrega um recurso offline confiável.`,
  summary: `IndexedDB é um banco de objetos assíncrono e transacional, com stores, índices e versões; o esquema muda em onupgradeneeded. Transações são atômicas e encerram sozinhas quando não há pedidos pendentes: nunca espere por rede ou timers dentro delas. A Cache API guarda respostas por requisição (corpo de leitura única, use clone) e não expira sozinha. A cota é por origem, a evicção é possível e storage.persist() pede persistência; o servidor continua sendo a fonte da verdade.`,
  refs: [REF.mdnIdb, REF.mdnUsingIdb, REF.mdnCache, REF.mdnQuotas, REF.mdnStorageManager],
  cards: [
    { q: 'Onde o esquema do IndexedDB pode ser alterado?', a: 'Somente no evento onupgradeneeded, disparado ao abrir o banco com uma versão maior.' },
    { q: 'Por que ocorre TransactionInactiveError?', a: 'A transação encerrou por não ter pedidos pendentes (por exemplo, após um await de algo que não é IndexedDB).' },
    { q: 'Por que clonar uma Response antes de guardá-la?', a: 'O corpo só pode ser lido uma vez; o clone permite guardar no cache e devolver ao cliente.' },
    { q: 'O que o navegador pode fazer com os dados do site sob pressão de espaço?', a: 'Apagá-los (evicção), a menos que o armazenamento persistente tenha sido concedido.' }
  ]
}
];
