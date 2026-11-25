// C1.5 — APIs do navegador e Web Platform. Aulas 6 e 7 (PWA e comunicação em tempo real).
const R = String.raw;

export const REF3 = {
  mdnPwa: { title: 'MDN — Progressive web apps', url: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps', kind: 'doc' },
  mdnInstallable: { title: 'MDN — Making PWAs installable', url: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable', kind: 'doc' },
  mdnManifest: { title: 'MDN — Web app manifest', url: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest', kind: 'doc' },
  webdevPwa: { title: 'web.dev — Learn PWA', url: 'https://web.dev/learn/pwa', kind: 'doc' },
  w3cManifest: { title: 'W3C — Web Application Manifest (especificação)', url: 'https://www.w3.org/TR/appmanifest/', kind: 'spec' },
  mdnWebSockets: { title: 'MDN — WebSockets API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', kind: 'doc' },
  rfc6455: { title: 'RFC 6455 — The WebSocket Protocol', url: 'https://www.rfc-editor.org/rfc/rfc6455', kind: 'spec' },
  mdnSse: { title: 'MDN — Using server-sent events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events', kind: 'doc' },
  htmlSse: { title: 'WHATWG — Server-sent events (HTML Standard)', url: 'https://html.spec.whatwg.org/multipage/server-sent-events.html', kind: 'spec' },
  mdnEventSource: { title: 'MDN — EventSource', url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventSource', kind: 'doc' },
  mdnBackground: { title: 'MDN — Background Synchronization API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'web-06', moduleId: 'm3', order: 6, minutes: 60, tags: ['PWA', 'manifest', 'instalação', 'offline', 'sincronização'],
  title: 'PWA: manifesto, instalação, modo offline e sincronização',
  objectives: ['Definir PWA e o que ela entrega em relação a um site comum e a um aplicativo nativo', 'Escrever um manifesto válido e conhecer os critérios de instalabilidade do Chrome', 'Projetar a arquitetura "casca + dados" para funcionar offline', 'Planejar sincronização de operações feitas offline (fila, idempotência e conflitos)', 'Avaliar uma PWA com DevTools e Lighthouse e reconhecer as limitações por plataforma'],
  intro: `Uma **Progressive Web App (PWA)** é um site construído com as APIs da Web Platform para ter **comportamento de aplicativo**: pode ser **instalado**, abre em sua própria janela, **funciona offline** ou com rede ruim e continua útil mesmo quando o servidor está fora do ar. Não é uma tecnologia nova, e sim a **combinação** do que você viu nas aulas anteriores: **manifesto**, **Service Worker**, **Cache API**, **IndexedDB** e HTTPS. Esta aula junta as peças, mostra o que o Chrome realmente exige para instalar e como projetar o offline e a sincronização.`,
  theory: `### O que torna um site uma PWA
Não existe um "selo" único: é um conjunto de capacidades, aplicadas **progressivamente** (quem tem navegador moderno ganha mais recursos; os demais continuam usando o site comum):
1. **Instalável**: manifesto válido servido por HTTPS (ou localhost);
2. **Confiável**: carrega rápido e funciona com rede ruim ou sem rede (Service Worker e armazenamento local);
3. **Integrada**: janela própria, ícone, tela de abertura, atalhos, notificações, compartilhamento.

### O manifesto
É um arquivo JSON ligado à página por §<link rel="manifest" href="/manifest.webmanifest">§. Membros principais:
| Membro | Função |
|---|---|
| §name§, §short_name§ | nome completo e nome curto (sob o ícone) |
| §start_url§ | URL aberta ao iniciar o app |
| §scope§ | URLs consideradas "dentro do app" |
| §display§ | §standalone§ (janela sem barra do navegador), §fullscreen§, §minimal-ui§ ou §browser§ |
| §background_color§, §theme_color§ | cores da abertura e da barra de título |
| §icons§ | lista de ícones (PNG ou SVG), com §sizes§, §type§ e §purpose§ (§any§, §maskable§) |
| §shortcuts§, §screenshots§, §id§ | atalhos no ícone, imagens para a loja de instalação, identidade estável do app |
Aplicar §theme-color§ com §<meta>§ e usar ícones **maskable** (com área segura) evita ícones cortados no Android.

### Critérios de instalabilidade (Chromium)
Segundo o MDN, navegadores baseados em Chromium exigem: §name§ ou §short_name§; ícones (192 px e 512 px); §start_url§; §display§ (ou §display_override§); e §prefer_related_applications§ não verdadeiro; mais **HTTPS** (ou §localhost§). **Service Worker não é requisito de instalação**, embora seja a forma de entregar o offline. Verificamos no Chrome 157 com o protocolo de depuração (§Page.getInstallabilityErrors§):
- manifesto completo (nome, ícones 192 e 512, §start_url§, §display: standalone§) e **sem Service Worker**: **sem erros de instalabilidade**;
- manifesto sem §start_url§ e com §display: browser§: erros §start-url-not-valid§ e §manifest-display-not-supported§;
- manifesto cujo único ícone era SVG sem tamanho aceito: §no-acceptable-icon§ (o Chrome pede ao menos 144 px).
Na prática, forneça ícones 192 e 512 (PNG), mais um maskable. Em iOS e Safari a instalação é feita pelo menu "Adicionar à Tela de Início" e vários recursos (notificações, sincronização) têm suporte diferente: **teste em cada plataforma-alvo**.

### Arquitetura offline: casca + dados
- **Casca do app** (*app shell*): HTML, CSS, JS e imagens essenciais. É **pré-cacheada** e carregada instantaneamente (cache-first com versão).
- **Dados**: vêm da API; guarde uma cópia local (IndexedDB ou resposta em cache) para mostrar o último estado conhecido (network-first ou stale-while-revalidate).
- **Estados da interface**: "carregando", "sem conexão — mostrando dados de 10:32", "sincronizando", "falhou, tentar de novo". Sem esses estados, o usuário não sabe o que está acontecendo.
- **Página offline** de contingência para rotas não guardadas.
Detectar conexão: §navigator.onLine§ e os eventos §online§/§offline§ são **dicas**, não garantias (um valor "true" não garante acesso à internet). A confirmação real é a requisição falhar (e tratar o erro).

### Sincronização de operações offline
Quando o usuário **cria ou altera** dados sem rede, o app deve:
1. gravar **localmente** (IndexedDB) e mostrar o resultado otimista;
2. colocar a operação em uma **fila** (\`{ id, tipo, payload, tentativas }\`);
3. **reenviar** quando a conexão voltar, com **backoff** em caso de falha;
4. garantir **idempotência** no servidor (um **identificador único** por operação, para que reenviar duas vezes não crie dois pedidos);
5. tratar **conflitos** (alguém alterou o mesmo registro): regra de "o último vence", versão por campo, ou pedir decisão ao usuário.
A **Background Sync API** permite ao Service Worker reenviar em segundo plano quando a rede volta, mas o suporte é **limitado a alguns navegadores**; mantenha um plano de contingência (reenviar ao abrir o app e ao receber o evento §online§).

### Notificações e outras capacidades (visão geral)
Push (notificações com o app fechado, exigem permissão e um serviço de push), badging, compartilhamento (Web Share), acesso a arquivos, atalhos. Cada uma exige **consentimento** e tem suporte desigual. Peça permissão **no contexto certo** (após uma ação do usuário que explique o benefício), nunca no carregamento da página.

### Avaliar e medir
- DevTools → **Application → Manifest** mostra problemas de instalação; **Service Workers** e **Storage** mostram o estado;
- **Lighthouse** (DevTools) mede desempenho, acessibilidade e boas práticas; as verificações de PWA mudam entre versões, então leia o relatório em vez de perseguir uma pontuação;
- teste com a rede em **Offline** e em **Slow 4G**, com cache limpo e com cache populado, e em aparelhos reais.

### Quando uma PWA é (ou não) a escolha certa
**Boa para:** conteúdo e serviços com uso intermitente, orçamento limitado, uma base de código para web e instalação, distribuição sem loja. **Limitada para:** integração profunda com o sistema (certos sensores, Bluetooth em iOS, tarefas contínuas em segundo plano), requisitos de loja ou de desempenho gráfico extremo. Também é possível **empacotar** uma PWA para lojas de aplicativos.`,
  concepts: [
    { term: 'PWA', def: 'Aplicação web com manifesto, HTTPS e (normalmente) Service Worker, instalável e com comportamento de aplicativo.' },
    { term: 'Web app manifest', def: 'Arquivo JSON que descreve nome, ícones, URL inicial e modo de exibição do app.' },
    { term: 'Instalabilidade', def: 'Conjunto de critérios para o navegador oferecer a instalação do app.' },
    { term: 'App shell', def: 'Interface mínima (HTML, CSS e JS) carregada do cache para abrir o app instantaneamente.' },
    { term: 'display: standalone', def: 'Modo em que o app abre em janela própria, sem a barra do navegador.' },
    { term: 'Ícone maskable', def: 'Ícone com área segura para ser recortado em formatos diferentes pelo sistema.' },
    { term: 'Fila de sincronização', def: 'Lista local de operações pendentes a enviar quando houver conexão.' },
    { term: 'Idempotência', def: 'Propriedade de repetir uma operação sem alterar o resultado final além da primeira execução.' },
    { term: 'Background Sync', def: 'API para que o Service Worker reenvie dados em segundo plano quando a rede volta (suporte limitado).' },
    { term: 'Atualização progressiva', def: 'Estratégia de oferecer recursos avançados só onde o navegador os suporta.' }
  ],
  examples: R`**Analogia:** uma PWA é uma **loja que pode abrir uma filial dentro da casa do cliente** (instalação), com **estoque de balcão** (casca em cache) e um **caderno de pedidos** (fila) que é entregue à matriz quando a estrada reabre. O cliente não precisa saber se a estrada está fechada, só se o pedido foi anotado ou já chegou.

**Resultados medidos (Chrome 157, via protocolo de depuração):**
- manifesto completo, sem Service Worker: **sem erros de instalabilidade**;
- manifesto sem §start_url§ e com §display: browser§: §start-url-not-valid§ e §manifest-display-not-supported§;
- manifesto só com ícone SVG: §no-acceptable-icon§.

**Manifesto aprovado no teste:**
§§§json
{ "name": "Lab PWA", "short_name": "Lab", "start_url": "/lab5.html", "scope": "/", "display": "standalone",
  "background_color": "#ffffff", "theme_color": "#0b5fff",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }] }
§§§

**Caso real:** um aplicativo de vistoria usado em campo com sinal fraco. A casca abre instantaneamente; a lista de vistorias vem do IndexedDB; cada nova vistoria é gravada localmente com um UUID e entra em uma fila; ao voltar o sinal, o app envia, o servidor ignora UUIDs repetidos (idempotência) e a interface mostra "sincronizado às 14:07".`,
  code: [
    { title: 'Link do manifesto e verificação no navegador (executado em Chrome 157)', lang: 'javascript', code: R`// <link rel="manifest" href="/manifest2.webmanifest"> no <head>
const href = document.querySelector('link[rel="manifest"]').href;
const m = await (await fetch(href)).json();
console.log(m.name, m.display, m.start_url, m.icons.length);   // Lab PWA standalone /lab5.html 2

console.log(matchMedia('(display-mode: standalone)').matches); // false no navegador; true no app instalado
console.log(typeof navigator.onLine);                          // 'boolean' (dica, não garantia)
window.addEventListener('offline', () => console.log('sem conexão (dica do navegador)'));
window.addEventListener('online', () => console.log('de volta (confirme com uma requisição)'));`, notes: [{ l: '3', t: 'O manifesto é um JSON comum, acessível por fetch.' }, { l: '6', t: 'display-mode detecta se o app está rodando instalado.' }, { l: '7', t: 'onLine verdadeiro não garante acesso à internet.' }] },
    { title: 'Fila de operações offline com idempotência (padrão em JavaScript puro, testado na lógica com um armazenamento simulado no exercício da aula)', lang: 'javascript', code: R`function criarFila({ enviar, armazenamento = new Map(), maxTentativas = 5, gerarId = () => crypto.randomUUID() }) {
  return {
    adicionar(tipo, payload) {
      const op = { id: gerarId(), tipo, payload, tentativas: 0 };   // id único = chave de idempotência
      armazenamento.set(op.id, op);
      return op.id;
    },
    async sincronizar() {
      const resultado = { enviadas: [], falhas: [], descartadas: [] };
      for (const op of [...armazenamento.values()]) {                // ordem de inserção
        try {
          await enviar(op);                                          // o servidor deve ignorar ids repetidos
          armazenamento.delete(op.id); resultado.enviadas.push(op.id);
        } catch {
          op.tentativas++;
          if (op.tentativas >= maxTentativas) { armazenamento.delete(op.id); resultado.descartadas.push(op.id); }
          else resultado.falhas.push(op.id);
          break;                                                     // preserva a ordem: pára na primeira falha
        }
      }
      return resultado;
    },
    pendentes: () => armazenamento.size
  };
}`, notes: [{ l: '4', t: 'O id gerado no cliente permite ao servidor reconhecer reenvios.' }, { l: '11', t: 'Enviar na ordem evita que uma alteração antiga sobrescreva uma nova.' }, { l: '15', t: 'Depois de muitas tentativas, a operação é descartada (e deveria ir para uma lista de erros visível ao usuário).' }, { l: '20', t: 'Este código é um padrão ilustrativo; o exercício desta aula verifica a lógica com testes automáticos.' }] }
  ],
  bestPractices: ['Sirva tudo por HTTPS e valide o manifesto no painel Application das DevTools.', 'Forneça ícones 192 e 512 (PNG) e um maskable, e as cores do tema.', 'Projete a casca para abrir sem rede e mostre estados claros de conexão e sincronização.', 'Use identificadores únicos por operação para tornar o reenvio idempotente no servidor.', 'Peça permissões (notificações) no contexto certo, depois de uma ação do usuário.', 'Teste em Offline, Slow 4G, cache limpo e em aparelhos reais de cada plataforma.'],
  mistakes: ['Achar que "PWA = ter um Service Worker" sem manifesto válido e HTTPS.', 'Confiar em §navigator.onLine§ como prova de conexão.', 'Reenviar operações sem idempotência e criar registros duplicados.', 'Não oferecer um caminho de atualização e deixar usuários em versões antigas.', 'Pedir permissão de notificação ao carregar a página.', 'Ignorar diferenças entre Android, iOS e desktop.'],
  market: `PWAs são adotadas por e-commerce, mídia, bancos e ferramentas internas para reduzir o custo de manter versões nativas e melhorar a conversão em redes móveis lentas. Profissionais que dominam manifesto, Service Worker, armazenamento local e sincronização offline são procurados para projetos de aplicativos de campo, vendas e educação.`,
  summary: `PWA combina manifesto, HTTPS, Service Worker e armazenamento local para dar instalação, janela própria e funcionamento offline. O Chrome exige nome, ícones, start_url e display válidos (Service Worker não é requisito de instalação). Projete casca + dados, estados de conexão claros e uma fila de sincronização com ids únicos (idempotência) e tratamento de conflitos. onLine é apenas uma dica. Teste por plataforma, pois o suporte varia.`,
  refs: [REF3.mdnPwa, REF3.mdnInstallable, REF3.mdnManifest, REF3.webdevPwa, REF3.w3cManifest, REF3.mdnBackground],
  cards: [
    { q: 'Quais membros o Chrome exige no manifesto para instalar?', a: 'Nome (name ou short_name), ícones (192 e 512), start_url e display (ou display_override); mais HTTPS ou localhost.' },
    { q: 'Service Worker é necessário para instalar uma PWA?', a: 'Não para a instalação, mas é a forma de entregar o funcionamento offline.' },
    { q: 'Por que usar um id único em cada operação offline?', a: 'Para o servidor reconhecer reenvios e não duplicar o resultado (idempotência).' },
    { q: 'navigator.onLine === true garante internet?', a: 'Não; é só uma dica. A confirmação é a requisição ter sucesso.' }
  ]
},
{
  id: 'web-07', moduleId: 'm3', order: 7, minutes: 65, tags: ['WebSocket', 'SSE', 'polling', 'tempo real', 'reconexão'],
  title: 'Tempo real na web: polling, Server-Sent Events e WebSocket',
  objectives: ['Comparar polling, long polling, SSE e WebSocket por direção, custo, proxies e reconexão', 'Usar EventSource: formato do fluxo, eventos nomeados, id, retry e reconexão automática com Last-Event-ID', 'Usar WebSocket: handshake, mensagens de texto e binárias, estados e códigos de fechamento', 'Implementar reconexão com backoff exponencial e jitter, além de heartbeat', 'Escolher o mecanismo adequado e considerar escala, autenticação e segurança'],
  intro: `Para a página saber de algo **que aconteceu no servidor** (chegou uma mensagem, o preço mudou, a build terminou), o HTTP clássico não ajuda: o cliente pergunta, o servidor responde. Existem quatro abordagens: **polling**, **long polling**, **Server-Sent Events (SSE)** e **WebSocket**. A escolha errada custa dinheiro (conexões, bateria) ou complexidade. Esta aula compara as quatro, com experimentos reais no Chrome 157 contra um servidor local de Node.js (§ws§ 8).`,
  theory: `### Quatro abordagens
| | Direção | Como funciona | Observações |
|---|---|---|---|
| **Polling** | cliente→servidor | o cliente pergunta a cada N segundos | simples, mas gasta requisições e tem atraso de até N s |
| **Long polling** | cliente→servidor | o servidor **segura** a resposta até haver dado ou timeout; o cliente pergunta de novo | menos atraso; uma conexão ociosa por cliente |
| **SSE** | **servidor→cliente** | **uma** requisição HTTP que fica aberta; o servidor envia eventos em texto | reconexão automática, funciona sobre HTTP comum |
| **WebSocket** | **bidirecional** | HTTP "faz upgrade" para um protocolo de mensagens sobre TCP | texto e binário, baixa latência, mais infraestrutura |
Perguntas para decidir: o **cliente também precisa enviar** com frequência? (WebSocket); só precisa **receber** atualizações? (SSE costuma bastar); a frequência é baixa e a tolerância a atraso é alta? (polling).

### Server-Sent Events (SSE)
O cliente usa §new EventSource(url)§. A resposta tem §Content-Type: text/event-stream§ e é uma sequência de **blocos de texto** separados por linha em branco, com campos:
\`\`\`
id: 3
event: tick
data: {"n":3}
retry: 200
\`\`\`
- §data§: o conteúdo (várias linhas §data§ são unidas);
- §event§: o nome (padrão §message§); ouça com §es.addEventListener('tick', ...)§;
- §id§: identificador; o navegador o guarda e, ao **reconectar**, envia o cabeçalho **§Last-Event-ID§** para o servidor retomar de onde parou;
- §retry§: espera em ms antes de reconectar;
- linhas iniciadas por §:§ são comentários (usadas como **heartbeat** para manter a conexão viva em proxies).
**Reconexão automática**: no teste, o servidor encerrou o fluxo após 5 eventos; o cliente **reconectou sozinho**, enviou §Last-Event-ID: 5§ e recebeu 6, 7, 8, 9, 10. O estado §readyState§ foi §0§ (CONNECTING) durante a reconexão. §es.close()§ encerra de vez.
**Limites:** só texto (UTF-8), só servidor→cliente, sem cabeçalhos personalizados em §EventSource§ (para autenticação use cookies, ou um parâmetro/token com cuidado, ou uma biblioteca baseada em §fetch§ e streams) e, em HTTP/1.1, o navegador limita conexões simultâneas por domínio (cerca de 6; HTTP/2 resolve).

### WebSocket
Começa com uma requisição HTTP §GET§ com §Upgrade: websocket§; o servidor responde §101 Switching Protocols§ e a conexão passa a trocar **mensagens** (quadros) nos dois sentidos (RFC 6455). Esquemas: §ws://§ e **§wss://§** (TLS: use sempre em produção).
- §new WebSocket(url, protocolos?)§; estados: §0§ CONNECTING, §1§ OPEN, §2§ CLOSING, §3§ CLOSED;
- eventos: §open§, §message§, §error§, §close§; §ws.send(texto | ArrayBuffer | Blob)§;
- no teste, o servidor devolveu os ecos §eco:olá§, §eco:{"a":1}§ e uma mensagem **binária de 3 bytes** (§binaryType = 'arraybuffer'§);
- **fechamento**: §ws.close(codigo, motivo)§; o código **1000** é normal, **1001** é "saindo", **1006** é queda anormal (sem quadro de fechamento) e **4000-4999** são códigos da aplicação. No teste o servidor fechou com **4001 "pedido do cliente"** e §wasClean§ foi verdadeiro.
**O WebSocket não reconecta sozinho** e não tem retomada: **você** implementa reconexão, reenvio e ordenação. Também não há **contrapressão** nativa no navegador (use §bufferedAmount§ para ver o que está na fila de envio).

### Reconexão com backoff e jitter
Se milhares de clientes caem e reconectam **no mesmo instante**, derrubam o servidor ("rebanho trovejante"). Use **backoff exponencial com jitter**: espera = aleatório(0, min(teto, base × 2^tentativa)). Zere o contador após uma conexão estável. Exemplo: base 500 ms, teto 30 s.

### Heartbeat e detecção de conexões mortas
Redes e proxies derrubam conexões ociosas e uma conexão "morta" pode parecer aberta. Envie **pings** periódicos (no WebSocket, o protocolo tem quadros ping/pong tratados pelo servidor; na aplicação, mensagens §ping§/§pong§ próprias) e feche e reconecte se não houver resposta dentro de um limite.

### Escala e infraestrutura
- Cada cliente mantém uma **conexão aberta**: dimensione descritores de arquivo, memória e balanceadores (timeouts de ociosidade, afinidade de sessão).
- Para várias instâncias do servidor, use um **barramento** (Redis Pub/Sub, NATS, Kafka) para entregar mensagens ao servidor que segura a conexão do destinatário.
- Serviços gerenciados e bibliotecas (Socket.IO, ws, SignalR) acrescentam reconexão, salas e fallbacks, ao custo de protocolo próprio.

### Segurança
- Use **§wss://§** e **valide a origem** (§Origin§) no servidor: WebSockets **não** seguem a política de mesma origem (risco de *cross-site WebSocket hijacking* se a autenticação for só por cookie).
- **Autentique** na conexão e **autorize** cada mensagem/canal no servidor; **valide e limite** o tamanho das mensagens e a taxa por cliente; escape o conteúdo antes de inserir no DOM.
- Não coloque tokens secretos na URL se puder evitar (ficam em logs).

### Escolha rápida
Notificações e feeds → **SSE**; chat, jogos, edição colaborativa → **WebSocket**; verificar status de um job a cada 10 s → **polling**; comunicação entre serviços internos com contratos → gRPC (aula de Redes).`,
  concepts: [
    { term: 'Polling', def: 'Consultar o servidor periodicamente para saber se há novidades.' },
    { term: 'Long polling', def: 'O servidor retém a requisição até haver dado ou timeout, e o cliente repete.' },
    { term: 'SSE', def: 'Server-Sent Events: fluxo de eventos em texto do servidor ao cliente sobre uma requisição HTTP aberta.' },
    { term: 'EventSource', def: 'API do navegador para consumir SSE, com reconexão automática.' },
    { term: 'Last-Event-ID', def: 'Cabeçalho enviado ao reconectar o SSE para o servidor retomar do último evento recebido.' },
    { term: 'WebSocket', def: 'Protocolo de mensagens bidirecional sobre uma conexão TCP iniciada por HTTP Upgrade.' },
    { term: 'Código de fechamento', def: 'Número que informa o motivo do fim da conexão WebSocket (1000 normal, 1006 anormal, 4000+ da aplicação).' },
    { term: 'Backoff exponencial com jitter', def: 'Espera crescente e aleatória entre tentativas de reconexão.' },
    { term: 'Heartbeat', def: 'Mensagens periódicas para manter e verificar a conexão.' },
    { term: 'Cross-site WebSocket hijacking', def: 'Ataque em que outra origem abre um WebSocket usando o cookie da vítima; mitigado validando Origin.' }
  ],
  examples: R`**Analogia:** **polling** é ir à caixa do correio de hora em hora; **long polling** é pedir ao carteiro que espere na porta até chegar algo; **SSE** é uma **linha de rádio** em que a central fala e você só ouve (e, se o sinal cai, o rádio religa sozinho e a central retoma do último aviso que você ouviu); **WebSocket** é uma **ligação telefônica**: os dois lados falam quando quiserem, mas, se a ligação cair, **você** precisa ligar de novo.

**Resultados medidos (Chrome 157 e servidor local):**
- WebSocket: §readyState§ 1; recebeu §["eco:olá","eco:{\"a\":1}","bin:3"]§; fechamento §4001 pedido do cliente limpo=true§;
- SSE: §1:1 2:2 3:3 4:4 5:5§, reconexão automática (§readyState§ 0) e depois §6:6 7:7 8:8 9:9 10:10§ (o cliente reenviou §Last-Event-ID§ e o servidor continuou do 6), com §retry§ de 200 ms.

**Caso real:** o painel de status de uma operação. Os eventos "pedido criado", "em preparo" e "entregue" são **unidirecionais** e baratos: **SSE** com §id§ por evento, retomada por §Last-Event-ID§ e um comentário de heartbeat a cada 20 s. Já o chat de suporte do mesmo produto, em que usuário e atendente enviam mensagens, usa **WebSocket** autenticado, com reconexão com backoff e fila local de mensagens ainda não confirmadas.`,
  code: [
    { title: 'EventSource com eventos nomeados e reconexão (executado em Chrome 157)', lang: 'javascript', code: R`// Servidor (Node.js): resposta text/event-stream que fecha após cada 5 eventos
// res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
// res.write('retry: 200\n\n');  // a cada 30 ms: res.write('id: ' + id + '\nevent: tick\ndata: {"n":' + id + '}\n\n');

const vistos = [];
await new Promise((resolve) => {
  const es = new EventSource('/sse');
  es.addEventListener('tick', (e) => vistos.push(e.lastEventId + ':' + JSON.parse(e.data).n));
  es.onerror = () => {                       // dispara a cada queda; o navegador reconecta sozinho
    vistos.push('reconectando(readyState=' + es.readyState + ')');
    if (vistos.length > 8) { es.close(); resolve(); }
  };
});
console.log(vistos.join(' '));
// 1:1 2:2 3:3 4:4 5:5 reconectando(readyState=0) 6:6 7:7 8:8 9:9 10:10 reconectando(readyState=0)`, notes: [{ l: '7', t: 'Eventos nomeados exigem addEventListener (onmessage só recebe os sem nome).' }, { l: '8', t: 'e.lastEventId traz o id enviado pelo servidor.' }, { l: '9', t: 'onerror não significa fim: o navegador tenta reconectar com Last-Event-ID.' }, { l: '12', t: 'Chame close() para encerrar de vez.' }] },
    { title: 'WebSocket: abrir, enviar texto e binário, receber e fechar (executado em Chrome 157)', lang: 'javascript', code: R`const ws = await new Promise((res, rej) => {
  const s = new WebSocket('ws://127.0.0.1:8765/ws');      // em produção, use wss://
  s.onopen = () => res(s); s.onerror = () => rej(new Error('falhou'));
});
const recebidas = [];
ws.binaryType = 'arraybuffer';
ws.onmessage = (e) => recebidas.push(typeof e.data === 'string' ? e.data : 'bin:' + e.data.byteLength);
ws.send('olá'); ws.send(JSON.stringify({ a: 1 })); ws.send(new Uint8Array([1, 2, 3]));
await new Promise((r) => setTimeout(r, 150));
console.log(ws.readyState, recebidas);                    // 1 ['eco:olá', 'eco:{"a":1}', 'bin:3']

const fim = new Promise((res) => (ws.onclose = (e) => res(e.code + ' ' + e.reason + ' limpo=' + e.wasClean)));
ws.send('fechar');                                         // o servidor fecha com 4001
console.log(await fim);                                    // 4001 pedido do cliente limpo=true`, notes: [{ l: '2', t: 'Em produção, use wss:// e valide Origin no servidor.' }, { l: '6', t: 'Com arraybuffer, mensagens binárias chegam como ArrayBuffer (o padrão é Blob).' }, { l: '12', t: 'O servidor de teste fecha com o código 4001 (faixa de aplicação).' }] },
    { title: 'Backoff exponencial com jitter (padrão em JavaScript puro, verificado por testes no exercício da aula)', lang: 'javascript', code: R`function proximaEspera(tentativa, { base = 500, teto = 30000, aleatorio = Math.random } = {}) {
  const maximo = Math.min(teto, base * 2 ** tentativa);   // 500, 1000, 2000, ... até o teto
  return Math.floor(aleatorio() * maximo);                 // jitter total: 0 a maximo
}
console.log(proximaEspera(0, { aleatorio: () => 1 }), proximaEspera(3, { aleatorio: () => 1 }), proximaEspera(20, { aleatorio: () => 1 }));
// 500 4000 30000`, notes: [{ l: '2', t: 'O expoente cresce com as tentativas, limitado pelo teto.' }, { l: '3', t: 'O jitter espalha as reconexões no tempo.' }, { l: '5', t: 'Saída esperada com aleatorio fixo em 1: 500, 4000 e 30000.' }] }
  ],
  bestPractices: ['Escolha SSE para fluxos só do servidor para o cliente e WebSocket quando a comunicação for bidirecional e frequente.', 'Atribua §id§ a cada evento SSE e retome por §Last-Event-ID§; envie comentários como heartbeat.', 'No WebSocket, implemente reconexão com backoff e jitter, heartbeat e confirmação de mensagens.', 'Use §wss://§, valide §Origin§, autentique na conexão e autorize cada ação no servidor.', 'Limite tamanho e taxa das mensagens e escape o conteúdo antes de exibir.', 'Planeje a escala: conexões abertas, balanceador, barramento entre instâncias.'],
  mistakes: ['Usar polling a cada segundo para tudo e sobrecarregar o servidor.', 'Esperar que o WebSocket reconecte sozinho.', 'Reconectar todos os clientes ao mesmo tempo, sem jitter.', 'Confiar só no cookie para autenticar um WebSocket sem validar a origem.', 'Tentar enviar cabeçalhos personalizados com §EventSource§.', 'Ignorar mensagens perdidas durante a queda, sem ids nem retomada.'],
  market: `Notificações, painéis, chats, cotações, jogos, edição colaborativa e acompanhamento de pedidos dependem desses mecanismos. Equipes de plataforma e backend precisam dimensionar conexões abertas e escolher entre SSE, WebSocket e serviços gerenciados; é um tema recorrente em desenhos de sistemas (chat, feed, notificações) em entrevistas.`,
  summary: `Polling e long polling usam requisições comuns; SSE é um fluxo de texto servidor→cliente com reconexão automática e retomada por Last-Event-ID; WebSocket é bidirecional, binário ou texto, sem reconexão automática. Use backoff exponencial com jitter, heartbeat e confirmação. Segurança: wss, validar Origin, autenticar e autorizar no servidor, limitar mensagens. Escolha por direção, frequência e infraestrutura.`,
  refs: [REF3.mdnWebSockets, REF3.rfc6455, REF3.mdnSse, REF3.htmlSse, REF3.mdnEventSource],
  cards: [
    { q: 'Quando preferir SSE a WebSocket?', a: 'Quando só o servidor envia dados ao cliente (notificações, feeds): é mais simples, usa HTTP comum e reconecta sozinho.' },
    { q: 'O que o cabeçalho Last-Event-ID faz?', a: 'Informa ao servidor o último evento recebido para ele retomar o fluxo na reconexão do SSE.' },
    { q: 'O WebSocket reconecta sozinho?', a: 'Não; a aplicação precisa reconectar (com backoff e jitter) e tratar mensagens perdidas.' },
    { q: 'Por que validar Origin em um WebSocket?', a: 'WebSockets não seguem a política de mesma origem; sem a validação, outro site pode abrir a conexão usando os cookies da vítima.' }
  ]
}
];
