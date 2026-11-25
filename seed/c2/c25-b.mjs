// C2.5 — Next.js. Aulas 5 a 8 (data fetching e cache; Server Actions; estratégias de renderização; Route Handlers).
const R = String.raw;
const D = 'https://nextjs.org/docs/app/';

export const REF2 = {
  fetching: { title: 'Next.js — Fetching Data', url: D + 'getting-started/fetching-data', kind: 'doc' },
  caching: { title: 'Next.js — Caching', url: D + 'getting-started/caching', kind: 'doc' },
  revalidating: { title: 'Next.js — Revalidating', url: D + 'getting-started/revalidating', kind: 'doc' },
  useCache: { title: 'Next.js — directiva use cache', url: D + 'api-reference/directives/use-cache', kind: 'doc' },
  mutating: { title: 'Next.js — Mutating Data', url: D + 'getting-started/mutating-data', kind: 'doc' },
  serverActions: { title: 'Next.js — Guia de Server Actions', url: D + 'guides/server-actions', kind: 'doc' },
  forms: { title: 'Next.js — Guia de formulários', url: D + 'guides/forms', kind: 'doc' },
  dataSecurity: { title: 'Next.js — Segurança de dados', url: D + 'guides/data-security', kind: 'doc' },
  streaming: { title: 'Next.js — Streaming', url: D + 'guides/streaming', kind: 'doc' },
  isr: { title: 'Next.js — Incremental Static Regeneration', url: D + 'guides/incremental-static-regeneration', kind: 'doc' },
  routeHandlers: { title: 'Next.js — Route Handlers', url: D + 'getting-started/route-handlers', kind: 'doc' },
  mdnHmac: { title: 'MDN — SubtleCrypto.sign (HMAC)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign', kind: 'doc' },
  mdnCors: { title: 'MDN — CORS', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'nxt-05', moduleId: 'm2', order: 5, minutes: 75, tags: ['data fetching', 'use cache', 'cacheLife', 'cacheTag', 'revalidateTag', 'Suspense'],
  title: 'Busca de dados e cache: use cache, cacheLife, cacheTag e revalidação por tempo e por tag',
  objectives: ['Buscar dados em Server Components e escolher entre fetch, banco e bibliotecas', 'Explicar o modelo de Cache Components: shell estático, partes em cache e partes dinâmicas em Suspense', 'Aplicar use cache com cacheLife e cacheTag e entender que argumentos viram a chave do cache', 'Invalidar por tempo e por tag (revalidateTag, updateTag, revalidatePath) e escolher o apropriado', 'Prever o que fica no shell estático, o que é transmitido por streaming e o que a rota exibe na tabela do build'],
  intro: `Cache em Next.js é o assunto que mais mudou entre versões. Na versão **16.4** o modelo recomendado é o de **Cache Components**: você ativa §cacheComponents: true§ e **diz explicitamente** o que é cacheado com a diretiva §'use cache'§; o que **não** é cacheado e depende de dados do momento é envolvido em §<Suspense>§ e transmitido na hora. O resultado é um **shell estático** (instantâneo) com ilhas dinâmicas. Esta aula explica o modelo, as funções de vida e de invalidação e mostra medições reais: a rota que mistura cache e dinâmico, o tempo até o primeiro byte contra o total e a invalidação por tag. As convenções vêm da documentação do pacote 16.4.6; modelos anteriores (fetch com §next.revalidate§) estão no guia de "caching sem Cache Components".`,
  theory: `### Buscar dados no servidor
Em um Server Component assíncrono, busque **diretamente**: §await fetch(url)§, uma consulta ao banco, uma biblioteca de ORM, o sistema de arquivos. Não é preciso uma API intermediária para a própria interface. Para **dados do cliente** (interação contínua), use uma biblioteca de cache de cliente (C2.4). Boas práticas de busca (aulas 3 e 5): iniciar buscas independentes **em paralelo**, colocar o código de acesso em uma **camada de dados** (§server-only§) e devolver **DTOs**.

### O modelo de Cache Components
Com §cacheComponents: true§ (padrão em apps novos criados pelo §create-next-app§, segundo a documentação; no laboratório foi ativado explicitamente junto com §partialPrefetching: true§), cada rota é pré-renderizada em três tipos de conteúdo:
1. **estático**: não depende de requisição nem de dados externos (entra no shell);
2. **em cache**: resultado de funções ou componentes com §'use cache'§ (também pode entrar no shell, com tempo de vida);
3. **dinâmico**: depende da requisição (§cookies()§, §headers()§, §searchParams§) ou de busca sem cache; **precisa estar dentro de §<Suspense>§**, cujo §fallback§ faz parte do shell, e é transmitido por **streaming** quando fica pronto.
No laboratório o build exibiu a rota como §◐ (Partial Prerender): prerendered as static HTML with dynamic server-streamed content§. Medido em servidor de produção:
§§§
GET /  (shell estático + Suspense com 1,5 s de espera)
  tempo até o primeiro byte: 0,017 s | tempo total: 1,53 s
  o HTML inicial já contém <h1>Shell</h1> e o fallback "carregando agora..."
§§§
O navegador recebe e pinta o shell em milissegundos, e a parte lenta chega depois, sem bloquear a página inteira. Se você acessa dados dinâmicos **fora** de um Suspense, o Next acusa um erro de "blocking route" em desenvolvimento e no build.

### A diretiva use cache
§§§
import { cacheLife, cacheTag } from 'next/cache';
export async function getPosts() {
  'use cache';
  cacheLife('hours');
  cacheTag('posts');
  return db.posts.listar();
}
§§§
- vale para **funções** (cache de dados) ou **componentes/páginas** (cache de UI) e, no topo de um arquivo, para todas as exportações;
- os **argumentos** e os valores **capturados** do escopo viram parte da **chave do cache**: chamadas com argumentos diferentes geram entradas diferentes; argumentos precisam ser **serializáveis**;
- **não** pode ler APIs de requisição (§cookies()§, §headers()§) **dentro** do escopo cacheado: leia fora e passe o valor como argumento (assim ele entra na chave);
- o cache é **compartilhado entre pessoas**: nunca cacheie dados específicos de um usuário em uma entrada sem o identificador na chave;
- o resultado deve ser serializável e a função, **idempotente** (a mesma entrada, o mesmo resultado dentro da vida do cache).
Medido (função com contador de chamadas, servidor de produção): as páginas foram servidas da pré-renderização e **a função não foi chamada** nas requisições (contador 0 no processo do servidor, depois de três GET).

### cacheLife: o tempo de vida
Perfis prontos (valores da documentação): §seconds§ (stale 30 s, revalidate 1 s, expire 60 s), §minutes§ (5 min, 1 min, 1 h), §hours§ (5 min, 1 h, 1 d), §days§, §weeks§, §max§ e §default§ (5 min, 15 min, nunca). Também aceita objeto §{ stale, revalidate, expire }§. Interpretação:
- **stale**: por quanto tempo o **cliente** pode usar o dado sem consultar o servidor;
- **revalidate**: depois desse tempo, a próxima requisição serve o dado antigo e **regenera em segundo plano** (stale-while-revalidate);
- **expire**: depois disso, o dado não é mais servido; a próxima requisição **espera** a regeneração.
A documentação recomenda **sempre** declarar um §cacheLife§. Caches de vida muito curta (perfil §seconds§, §revalidate: 0§ ou §expire§ abaixo de 5 min) são **excluídos do shell**, pois envelheceriam antes de servir.

### cacheTag e a invalidação sob demanda
§cacheTag('posts')§ etiqueta a entrada. Depois de uma mutação, invalide:
- **§updateTag('posts')§**: expira **imediatamente**, para "ler o que acabei de escrever"; só em **Server Actions**;
- **§revalidateTag('posts', 'max')§**: **stale-while-revalidate**: serve o antigo enquanto regenera; funciona em Actions e **Route Handlers** (webhooks de CMS); o segundo argumento define por quanto tempo o conteúdo antigo pode ser servido;
- **§revalidatePath('/blog')§**: invalida o que está associado a uma rota, sem saber as tags; prefira tags, que são mais precisas.
No laboratório, um Route Handler que chamou §revalidateTag('posts', 'max')§ fez a função cacheada ser executada **uma vez** para regenerar (contador 1). Observação honesta: nesse teste o conteúdo antes e depois foi idêntico (o contador reinicia por processo), então a **troca de conteúdo** não foi demonstrada; o efeito é o descrito na documentação.

### O que cachear (e o que não)
Cacheie dados que **não dependem do usuário** e toleram alguma idade (catálogo, posts, configurações); **não** cacheie carrinho, sessão ou saldos. Dados que mudam a cada requisição vão em Suspense, sem cache. Para páginas com conteúdo de CMS, use §cacheTag§ com §cacheLife('max')§ e acione o §revalidateTag§ por webhook.

### Ambientes sem memória compartilhada
Em ambientes serverless ou com várias instâncias, o cache em memória não é compartilhado; a documentação trata de **cache handlers** personalizados e do cache em CDN. Considere isso no deploy (aula 11).

### Modelo anterior (sem Cache Components)
Em apps sem a opção, o padrão era **estático por padrão**, com §fetch(url, { next: { revalidate, tags } })§, §export const revalidate§ e §dynamic§. Se você mantém uma base antiga, consulte o guia "caching sem Cache Components" e o de migração; a ideia de tempo e tags é a mesma, mas as APIs e os padrões diferem.

### Testando e depurando
Verifique a tabela do build (símbolos ○ ● ◐ ƒ), os cabeçalhos §Cache-Control§ e §x-nextjs-*§ com §curl -I§ e use contadores ou logs nas funções cacheadas para ver quando executam. Em desenvolvimento, o overlay aponta rotas bloqueantes.`,
  concepts: [
    { term: 'Cache Components', def: 'Modelo do Next.js em que o cache é explícito (use cache) e o conteúdo dinâmico é transmitido dentro de Suspense.' },
    { term: 'Shell estático', def: 'Parte da página pré-renderizada, enviada imediatamente, que inclui os fallbacks de Suspense.' },
    { term: 'Partial Prerender', def: 'Rota com shell estático e partes dinâmicas transmitidas depois.' },
    { term: 'use cache', def: 'Diretiva que armazena o resultado de uma função ou componente assíncrono, com argumentos na chave.' },
    { term: 'cacheLife', def: 'Função que define stale, revalidate e expire de uma entrada de cache.' },
    { term: 'cacheTag', def: 'Função que etiqueta uma entrada de cache para invalidação sob demanda.' },
    { term: 'revalidateTag', def: 'Invalida por tag com stale-while-revalidate; usável em Actions e Route Handlers.' },
    { term: 'updateTag', def: 'Expira a tag imediatamente em Server Actions, para ler a própria escrita.' },
    { term: 'Streaming', def: 'Envio progressivo do HTML e do payload à medida que cada parte fica pronta.' }
  ],
  examples: R`**Analogia:** a página é uma **vitrine de loja**: o expositor fixo (shell) está montado antes de abrir; os produtos de catálogo (use cache) são reposicionados conforme um cronograma (cacheLife) ou quando o fornecedor avisa (cacheTag e revalidateTag); a vitrine "ao vivo" (dinâmico) mostra um cartaz "carregando" (fallback) até a mercadoria chegar.

**Resultados medidos (Next 16.4.6, cacheComponents, next build e next start):**
§§§
tabela do build: ◐ /  (Partial Prerender)  revalidate 1h, expire 1d
tempo até o primeiro byte 0,017 s | total 1,53 s (Suspense com 1,5 s)
HTML inicial: <h1>Shell</h1> e fallback "carregando agora..."
função cacheada (3 GET): chamadas 0 no servidor (servida da pré-renderização)
revalidateTag('posts','max') via Route Handler: 1 regeneração (contador 1)
§§§

**Cenário ilustrativo (não medido):** um blog servia 100% das páginas de CMS por requisição. Com §use cache§, §cacheLife('max')§ e §cacheTag('posts')§, mais um webhook do CMS que chama §revalidateTag§, as páginas passaram a ser servidas do cache, e o conteúdo publicado aparece logo após o webhook, sem novo deploy.`,
  code: [
    { title: 'Função em cache com vida e tag; página com shell e parte dinâmica (executado)', lang: 'jsx', code: R`// lib.js
import { cacheLife, cacheTag } from 'next/cache';
export async function getPosts() {
  'use cache';
  cacheLife('hours');
  cacheTag('posts');
  return db.posts.listar();
}

// app/page.js
import { Suspense } from 'react';
import { getPosts } from '../lib';
async function Posts() { const p = await getPosts(); return <ul>{p.map((x) => <li key={x.id}>{x.titulo}</li>)}</ul>; }
async function Agora() { const r = await fetch('https://api.exemplo/agora', { cache: 'no-store' }); return <p>{(await r.json()).hora}</p>; }
export default function Home() {
  return <><h1>Shell</h1><Posts /><Suspense fallback={<p>carregando agora...</p>}><Agora /></Suspense></>;
}`, notes: [{ l: '3', t: 'Argumentos e valores capturados formam a chave do cache.' }, { l: '16', t: 'O fallback faz parte do shell estático; a parte dinâmica é transmitida depois (medido: primeiro byte em 0,017 s).' }] },
    { title: 'Invalidação em Server Action e em Route Handler', lang: 'jsx', code: R`// app/posts/actions.js
'use server';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
export async function criarPost(formData) {
  const titulo = String(formData.get('titulo') ?? '').trim();
  if (!titulo) return { erro: 'Informe o título' };
  const post = await db.posts.criar({ titulo });
  updateTag('posts');                       // o autor vê o post na hora
  redirect('/posts/' + post.id);
}

// app/api/revalidar/route.js  (webhook do CMS)
import { revalidateTag } from 'next/cache';
export async function POST() { revalidateTag('posts', 'max'); return Response.json({ ok: true }); }`, notes: [{ l: '9', t: 'updateTag só em Server Actions: expira imediatamente.' }, { l: '16', t: 'revalidateTag em Route Handler (medido: acionou 1 regeneração). Proteja o webhook (aula 8).' }] }
  ],
  bestPractices: ['Busque no servidor, em paralelo, por uma camada de dados server-only.', 'Declare sempre cacheLife junto de use cache.', 'Leia cookies e headers fora do escopo cacheado e passe o valor como argumento.', 'Prefira tags a caminhos para invalidar.', 'Use updateTag para ler a própria escrita e revalidateTag para atualizações em segundo plano.', 'Envolva o que é dinâmico em Suspense com fallback útil.'],
  mistakes: ['Cachear dados específicos de um usuário sem o id na chave.', 'Ler cookies() dentro de uma função com use cache.', 'Deixar dados dinâmicos fora de Suspense e bloquear a rota.', 'Usar revalidatePath em tudo e invalidar demais.', 'Não proteger o webhook de revalidação.', 'Assumir o cache de versões antigas (fetch estático por padrão) em um app com Cache Components.'],
  market: `Cache é o tema que mais gera dúvidas e bugs em Next.js (dados velhos, rotas lentas, builds estranhos). Explicar o modelo de shell estático, use cache, tempos de vida e tags, e saber distinguir o modelo antigo do novo, é diferencial claro em vagas full stack.`,
  summary: `Com Cache Components a rota é pré-renderizada com shell estático, partes em cache (use cache, cacheLife e cacheTag) e partes dinâmicas em Suspense transmitidas por streaming (medido: primeiro byte em 17 ms, total 1,53 s). Argumentos viram a chave; cookies e headers ficam fora do escopo cacheado. Invalide com updateTag (imediato, Actions), revalidateTag (stale-while-revalidate, Actions e Route Handlers) ou revalidatePath, preferindo tags.`,
  refs: [REF2.fetching, REF2.caching, REF2.revalidating, REF2.useCache],
  cards: [
    { q: 'O que o uso de Suspense garante na rota com Cache Components?', a: 'Que o conteúdo dinâmico seja transmitido depois do shell estático, cujo fallback é enviado imediatamente.' },
    { q: 'O que forma a chave de uma entrada use cache?', a: 'Os argumentos (serializáveis) e os valores capturados do escopo.' },
    { q: 'Qual a diferença entre updateTag e revalidateTag?', a: 'updateTag expira imediatamente (só em Server Actions); revalidateTag serve o antigo enquanto regenera (Actions e Route Handlers).' },
    { q: 'Por que não ler cookies() dentro de uma função com use cache?', a: 'O cache é compartilhado e deve depender só de argumentos; leia fora e passe o valor.' }
  ]
},
{
  id: 'nxt-06', moduleId: 'm2', order: 6, minutes: 75, tags: ['Server Actions', 'formulários', 'validação', 'segurança', 'useActionState'],
  title: 'Server Actions e formulários: validação, estado pendente, revalidação e segurança',
  objectives: ['Escrever Server Actions com use server e ligá-las a formulários e a eventos', 'Validar e normalizar a entrada no servidor, devolvendo erros de campo', 'Mostrar estado pendente e resultado com useActionState e useFormStatus', 'Atualizar o cache e a navegação depois da mutação', 'Tratar Server Actions como endpoints públicos: autenticar, autorizar e limitar'],
  intro: `Uma **Server Action** é uma função assíncrona que roda **no servidor** e pode ser chamada de formulários e eventos do cliente, sem você escrever a rota, o §fetch§ e a serialização. É o caminho padrão de **mutação** no App Router, e funciona **antes da hidratação** (formulários são HTML). Mas a conveniência esconde o ponto mais importante: **uma Server Action é um endpoint HTTP público**. Qualquer pessoa pode enviar um POST a ela, com dados que não vieram do seu formulário. Esta aula cobre o uso e, principalmente, a segurança: validar, autenticar, autorizar e não confiar em nada que veio do cliente. O HTML do formulário foi inspecionado no laboratório.`,
  theory: `### Declarando e usando
§§§
// app/acoes/actions.js
'use server';
export async function salvar(formData) { const nome = formData.get('nome'); /* ... */ }

// app/acoes/page.js (Server Component)
<form action={salvar}><input name="nome" /><button>ok</button></form>
§§§
- §'use server'§ no topo do arquivo marca **todas as exportações** como Actions (ou dentro de uma função, para uma só);
- em §<form action={fn}>§ a função recebe o **§FormData§**; fora de formulários, o cliente a chama como função (dentro de §startTransition§ ou eventos);
- medido: o HTML do formulário saiu como §<form action="" encType="multipart/form-data" method="POST">§ com um campo oculto §$ACTION_ID_…§: o navegador consegue **enviar o formulário sem JavaScript**, e o React o transforma em chamada sem recarga depois de hidratar (melhoria progressiva);
- Actions só usam **POST** e podem **redirecionar** (§redirect()§), **invalidar cache** (§updateTag§, §revalidateTag§, §revalidatePath§) e definir cookies.

### Segurança: o essencial
A documentação de segurança de dados do Next.js explica que:
- uma Action exportada é **alcançável por POST direto**, mesmo que a interface não a mostre; os IDs são **criptografados e não determinísticos**, e Actions não usadas são **eliminadas** do cliente, mas **isso não substitui verificações**: valide **autenticação e autorização dentro de cada Action**;
- variáveis **capturadas por closures** (Action definida dentro de um componente) são **criptografadas** ao serem enviadas ao cliente e de volta, mas a documentação **não recomenda depender só disso** para esconder valores sensíveis. Em self-hosting com várias instâncias, defina a chave de criptografia de forma estável (§NEXT_SERVER_ACTIONS_ENCRYPTION_KEY§);
- proteção contra **CSRF**: apenas POST é aceito e o Next compara os cabeçalhos **Origin** e **Host**; em cenários com proxies reversos, configure §serverActions.allowedOrigins§; ainda assim cookies de sessão devem usar §SameSite§;
- limite o **tamanho** do corpo (§serverActions.bodySizeLimit§) e **arquivos enviados**;
- **não confie** em campos ocultos nem em ids vindos do formulário: o servidor deve refazer a checagem ("este usuário pode editar **este** pedido?").
Ordem recomendada dentro de uma Action: **1) autenticar, 2) autorizar o recurso, 3) validar e normalizar a entrada, 4) executar, 5) invalidar cache, 6) devolver resultado ou redirecionar**.

### Validação no servidor
A validação do navegador (§required§, máscara) é conforto, **não segurança**. No servidor, valide **tipos, tamanhos, formatos e regras** com um esquema (por exemplo, uma biblioteca de esquemas como a Zod, ou funções próprias) e devolva **erros por campo**:
§§§
export async function criarContato(_estadoAnterior, formData) {
  const email = String(formData.get('email') ?? '').trim();
  const erros = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) erros.email = 'E-mail inválido';
  if (Object.keys(erros).length) return { ok: false, erros, valores: { email } };
  await salvarContato(email);
  return { ok: true };
}
§§§
Retorne **dados simples** (não lance exceções para erros esperados) e **devolva os valores** digitados para reexibir o formulário. Exceções inesperadas vão para o §error.js§. A aula inclui um desafio de código com a função pura de validação.

### Estado e pendência
- **§useActionState(action, estadoInicial)§** (React 19): devolve §[estado, formAction, pendente]§; a Action recebe o estado anterior como **primeiro** argumento e o §FormData§ como segundo;
- **§useFormStatus()§**: dentro de um componente filho do formulário, informa §pending§ para desabilitar o botão;
- **§useOptimistic§**: mostra o resultado esperado antes da resposta (C2.4, otimismo);
- desabilite o botão enquanto pendente para evitar **envio duplo**; torne a Action **idempotente** quando possível (chave de idempotência para pagamentos).

### Depois da mutação
Invalide o cache afetado (§updateTag('posts')§ para ler a própria escrita), **redirecione** (§redirect§ lança uma exceção interna: chame **fora** de §try/catch§ ou relance) e, se a UI cliente tiver cache próprio (TanStack Query), invalide-o também.

### Server Actions x Route Handlers
Actions são para mutações **disparadas pela sua interface**; **Route Handlers** (aula 8) para **APIs consumidas por terceiros** (webhooks, apps móveis, integrações), com métodos, cabeçalhos e códigos de estado sob seu controle. Actions não são uma API pública versionada.

### Arquivos enviados e outros cuidados
Valide **tipo e tamanho** de arquivos (o tipo declarado pode ser forjado), grave com **nomes gerados** (nunca o nome original em um caminho), guarde fora de pastas servidas diretamente e use armazenamento de objetos com URLs assinadas quando possível. Aplique **limitação de taxa** em Actions sensíveis (login, recuperação de senha) e registre eventos de segurança.

### Testando
Teste a **função pura de validação** e a lógica de autorização; teste a Action chamando-a diretamente com um §FormData§ e um usuário simulado; no navegador, confirme o fluxo sem JavaScript (formulário HTML) e com ele.`,
  concepts: [
    { term: 'Server Action', def: 'Função assíncrona que executa no servidor, marcada com use server e chamável de formulários e eventos.' },
    { term: 'use server', def: 'Diretiva que marca funções ou exportações de um arquivo como Server Actions.' },
    { term: 'FormData', def: 'Estrutura que representa os campos enviados por um formulário.' },
    { term: 'useActionState', def: 'Hook que liga uma Action ao estado do formulário e informa se está pendente.' },
    { term: 'useFormStatus', def: 'Hook que informa o estado de envio do formulário pai.' },
    { term: 'Melhoria progressiva', def: 'Funcionar com HTML puro e ganhar interatividade quando o JavaScript carrega.' },
    { term: 'CSRF', def: 'Ataque que induz o navegador autenticado a enviar uma requisição indesejada.' },
    { term: 'Autorização', def: 'Verificação de que a pessoa autenticada pode executar a operação sobre aquele recurso.' },
    { term: 'Idempotência', def: 'Propriedade de repetir a operação sem mudar o resultado além da primeira vez.' }
  ],
  examples: R`**Analogia:** a Server Action é um **guichê com campainha para fora da loja**: a porta bonita (o formulário) leva ao guichê, mas **qualquer pessoa que souber o endereço pode tocar a campainha**. Por isso o atendente sempre confere o documento (autenticação), a procuração (autorização) e preenche de novo o formulário em vez de confiar no que veio escrito (validação).

**Medido no laboratório (Next 16.4.6):**
§§§
HTML da página com a Action: <form action="" encType="multipart/form-data" method="POST">
campo oculto: <input type="hidden" name="$ACTION_ID_4007514d...">
(funciona como HTML puro, antes de a hidratação ocorrer)
§§§
Não foi executada a invocação de uma Action pelo navegador nem por POST manual; os comportamentos de criptografia, Origin e allowedOrigins são da documentação do pacote 16.4.6.

**Cenário ilustrativo (não medido):** uma Action §excluirPedido(id)§ só checava se a pessoa estava logada. Alguém copiou o POST e trocou o id por o de outro cliente. A correção verificou, dentro da Action, que o pedido pertencia à pessoa autenticada e passou a registrar tentativas negadas.`,
  code: [
    { title: 'Action segura com autenticação, autorização, validação e cache', lang: 'jsx', code: R`'use server';
import { updateTag } from 'next/cache';
import { verificarSessao } from '../lib/dal';          // camada de acesso a dados (aula 9)

export async function renomearPedido(_anterior, formData) {
  const sessao = await verificarSessao();                // 1) autenticar (lança/redireciona se não houver)
  const id = Number(formData.get('id'));
  const nome = String(formData.get('nome') ?? '').trim();
  if (!Number.isInteger(id) || nome.length < 2 || nome.length > 80) return { ok: false, erro: 'Dados inválidos' };   // 3) validar
  const pedido = await db.pedidos.buscar(id);
  if (!pedido || pedido.donoId !== sessao.usuarioId) return { ok: false, erro: 'Não permitido' };                  // 2) autorizar
  await db.pedidos.renomear(id, nome);                   // 4) executar
  updateTag('pedidos');                                  // 5) invalidar
  return { ok: true };
}`, notes: [{ l: '6', t: 'Nunca confie em "a interface só mostra para quem pode": o POST pode ser feito à mão.' }, { l: '11', t: 'A checagem usa o dono do recurso, não só o login.' }] },
    { title: 'Formulário com useActionState e botão pendente', lang: 'jsx', code: R`'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { renomearPedido } from './actions';

function Botao() { const { pending } = useFormStatus(); return <button disabled={pending}>{pending ? 'Salvando...' : 'Salvar'}</button>; }

export function FormRenomear({ id }) {
  const [estado, acao] = useActionState(renomearPedido, { ok: false });
  return (
    <form action={acao}>
      <input type="hidden" name="id" value={id} />
      <label>Nome <input name="nome" required minLength={2} /></label>
      <Botao />
      {estado.erro && <p role="alert">{estado.erro}</p>}
    </form>
  );
}`, notes: [{ l: '9', t: 'A Action recebe o estado anterior como primeiro argumento (por isso _anterior no servidor).' }, { l: '12', t: 'O id oculto é conveniência: o servidor revalida o dono.' }, { l: '16', t: 'role="alert" anuncia o erro a leitores de tela.' }] }
  ],
  bestPractices: ['Em toda Action: autenticar, autorizar o recurso, validar, executar, invalidar.', 'Valide no servidor mesmo com validação no cliente.', 'Devolva erros esperados como dados, com os valores digitados.', 'Desabilite o botão durante o envio e torne a operação idempotente.', 'Proteja arquivos enviados (tipo, tamanho, nome gerado).', 'Use Route Handlers para APIs de terceiros.'],
  mistakes: ['Achar que uma Action sem botão na interface está protegida.', 'Confiar em ids e campos ocultos do formulário.', 'Validar só no navegador.', 'Chamar redirect dentro de try/catch e engolir a exceção.', 'Depender só da criptografia de closures para esconder segredos.', 'Esquecer a invalidação de cache depois da mutação.'],
  market: `Server Actions concentram os incidentes de segurança de apps Next.js recentes (autorização ausente, validação insuficiente). Sua capacidade de descrever o checklist de uma Action e de explicar por que ela é um endpoint público é muito valorizada em vagas full stack e em revisões de segurança.`,
  summary: `Server Actions são funções de servidor ligadas a formulários, que funcionam antes da hidratação (medido: form com ID oculto e POST multipart). São endpoints públicos: dentro de cada uma autentique, autorize o recurso, valide e normalize a entrada, execute, invalide o cache e devolva dados ou redirecione. useActionState e useFormStatus mostram estado e pendência. Use Route Handlers para APIs de terceiros.`,
  refs: [REF2.mutating, REF2.serverActions, REF2.forms, REF2.dataSecurity],
  cards: [
    { q: 'Por que uma Server Action precisa checar autorização mesmo que a interface esconda o botão?', a: 'Porque é um endpoint alcançável por POST direto; a interface não é uma barreira de segurança.' },
    { q: 'Qual a ordem recomendada dentro de uma Action?', a: 'Autenticar, autorizar o recurso, validar, executar, invalidar o cache e devolver resultado ou redirecionar.' },
    { q: 'O que o useActionState devolve?', a: 'O estado atual, a action para o formulário e o indicador de pendência.' },
    { q: 'Quando usar Route Handler em vez de Server Action?', a: 'Para APIs consumidas por terceiros (webhooks, apps móveis), com controle de métodos, cabeçalhos e status.' }
  ]
},
{
  id: 'nxt-07', moduleId: 'm2', order: 7, minutes: 70, tags: ['SSR', 'SSG', 'ISR', 'streaming', 'prerender', 'renderização parcial'],
  title: 'Estratégias de renderização: SSG, SSR, ISR, streaming e pré-renderização parcial',
  objectives: ['Distinguir SSG, SSR, ISR e streaming e relacioná-los ao que o Next.js 16 faz na tabela do build', 'Escolher a estratégia por rota de acordo com a frequência de mudança e a personalização', 'Explicar a pré-renderização parcial (shell estático + ilhas dinâmicas) e o papel do Suspense', 'Medir tempo até o primeiro byte e total para validar a escolha', 'Evitar tornar a rota inteira dinâmica sem querer'],
  intro: `A pergunta "como esta página é renderizada?" tem mais de uma resposta correta, e a escolha afeta velocidade, custo e frescor. As siglas clássicas ainda ajudam a pensar: **SSG** (HTML gerado no build), **SSR** (HTML gerado a cada requisição), **ISR** (HTML estático regenerado de tempos em tempos) e **streaming** (enviar a página em pedaços). No Next.js 16 com Cache Components essas ideias se combinam na **pré-renderização parcial**: uma rota tem um **shell estático** instantâneo e **ilhas** dinâmicas ou regeneradas. Esta aula mostra como ler o que o framework decidiu, como escolher e como medir, com resultados do servidor de produção do laboratório.`,
  theory: `### As quatro ideias
- **SSG (geração estática)**: o HTML é produzido **no build** (ou na primeira requisição, com cache) e servido de um CDN. Mais rápido e barato; o conteúdo só muda quando regenerado;
- **SSR (renderização por requisição)**: o HTML é produzido **a cada requisição** com dados do momento (e da pessoa). Necessário para conteúdo personalizado, ao custo de um servidor e mais latência;
- **ISR (regeneração incremental)**: a página estática é **regenerada** depois de um tempo (§revalidate§) ou sob demanda (tags), sem novo build. É o §cacheLife§ + §cacheTag§ da aula 5, com a mesma lógica de stale-while-revalidate;
- **Streaming**: o servidor envia o HTML **em partes**: o shell primeiro, os trechos lentos depois (Suspense). Melhora o tempo até o primeiro conteúdo e a percepção de velocidade.

### O que o Next.js 16 faz de fato
Na tabela do §next build§, cada rota recebe um símbolo:
- **○ Static**: pré-renderizada como conteúdo estático;
- **● SSG**: pré-renderizada com §generateStaticParams§;
- **◐ Partial Prerender**: shell estático com conteúdo dinâmico transmitido (requer Cache Components);
- **ƒ Dynamic**: renderizada sob demanda.
Medido no servidor de produção do laboratório:
§§§
rota estática (/):   Cache-Control: s-maxage=31536000 | x-nextjs-prerender: 1 | x-nextjs-cache: HIT
rota dinâmica (cookies()): Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
rota ◐ com Suspense de 1,5 s: primeiro byte 0,017 s | total 1,53 s
§§§
Um HTML estático é servido pronto; o dinâmico exige trabalho do servidor a cada pedido (duas chamadas seguidas devolveram horários diferentes, 1,09 s de diferença); o parcial entrega o shell imediatamente.

### O que torna uma rota dinâmica
APIs de requisição (§cookies()§, §headers()§, §searchParams§, §connection()§), busca sem cache **fora de Suspense** (no modelo novo, gera erro de rota bloqueante), e, no modelo antigo, configurações como §export const dynamic = 'force-dynamic'§. Dica: leia §cookies()§ **só no componente que precisa**, dentro de Suspense, para o resto da página continuar estático.

### Pré-renderização parcial na prática
A página de produto, por exemplo: o título, a descrição e as imagens (estático ou em cache), o preço (cache com vida curta), o estoque (dinâmico) e as recomendações personalizadas (dinâmico, em Suspense). A pessoa vê o essencial **na hora**, e o estoque e as recomendações chegam em seguida. Para o shell ser útil, os **fallbacks** devem ter o mesmo tamanho do conteúdo (evitando mudança de layout, C2.7).

### Como escolher
| Conteúdo | Estratégia |
|---|---|
| Páginas institucionais, documentação | Estático (○/●) |
| Blog, catálogo com CMS | Cache com tag e regeneração (ISR por tags) |
| Painel de usuário, carrinho | Dinâmico, em Suspense; sem cache compartilhado |
| Página de produto com estoque | Parcial: shell + ilhas |
| Busca com filtros na URL | Dinâmico (searchParams) com cache por chave onde possível |

### Streaming e SEO
Rastreadores recebem o HTML completo ao final do fluxo; conteúdo crítico para SEO deve estar no shell ou chegar rápido. Códigos de status e cabeçalhos são enviados **antes** do corpo: decisões como 404 ou redirecionamento devem ocorrer **antes** de começar a transmitir (por isso §notFound()§ no topo do componente).

### Pré-busca e navegação
Em produção, §Link§ pré-busca rotas visíveis; com pré-busca parcial, o shell estático de uma rota pode ser carregado antecipadamente, tornando a navegação quase instantânea. Dados dinâmicos continuam chegando depois da navegação.

### Custos e riscos
Mais rotas dinâmicas exigem mais servidor e escalonamento; regenerações em segundo plano consomem computação; cache desatualizado pode confundir (defina vida e invalide por evento); estáticos grandes aumentam o tempo de build (use §dynamicParams§, aula 2).

### Verificando uma decisão
1) leia a tabela do build; 2) §curl -I§ e observe §Cache-Control§ e §x-nextjs-*§; 3) meça primeiro byte e total; 4) teste com e sem JavaScript; 5) confira no Lighthouse (C2.7). A estratégia certa é a que combina frescor necessário com o menor trabalho por requisição.`,
  concepts: [
    { term: 'SSG', def: 'Geração do HTML no build, servido como arquivo estático.' },
    { term: 'SSR', def: 'Geração do HTML no servidor a cada requisição.' },
    { term: 'ISR', def: 'Regeneração de páginas estáticas por tempo ou sob demanda sem novo build.' },
    { term: 'Streaming', def: 'Envio progressivo da resposta, com o shell antes dos trechos lentos.' },
    { term: 'Pré-renderização parcial', def: 'Rota com shell estático e conteúdo dinâmico transmitido depois.' },
    { term: 'TTFB', def: 'Tempo até o primeiro byte da resposta.' },
    { term: 'Rota bloqueante', def: 'Rota que acessa dados dinâmicos fora de Suspense, impedindo o shell estático.' },
    { term: 'force-dynamic', def: 'Configuração do modelo anterior que força a renderização por requisição.' }
  ],
  examples: R`**Analogia:** SSG é **comida congelada** (pronta, barata, igual para todos); SSR é **à la carte** (feita na hora, personalizada, mais lenta e cara); ISR é **congelada com reposição programada**; streaming é o **couvert** que chega à mesa enquanto o prato principal é preparado; a pré-renderização parcial é o **menu fixo** com um prato do dia feito na hora.

**Resultados medidos (Next 16.4.6, servidor de produção, curl):**
§§§
/ (estática):                  s-maxage=31536000, x-nextjs-prerender: 1, x-nextjs-cache: HIT
/painel (cookies()):           private, no-cache, no-store, must-revalidate
/painel duas chamadas, 1 s depois: 1795586909328 e 1795586910418 (conteúdo gerado a cada requisição)
/ (◐ com Suspense de 1,5 s):   TTFB 0,017 s | total 1,53 s
§§§

**Cenário ilustrativo (não medido):** uma página de produto era toda dinâmica por causa de um bloco de recomendações personalizadas. Mover as recomendações para um componente dentro de Suspense permitiu que a descrição e as imagens saíssem no shell estático; o tempo até o conteúdo principal caiu e o servidor passou a trabalhar só no bloco personalizado.`,
  code: [
    { title: 'Isolando o dinâmico em Suspense para manter o shell estático', lang: 'jsx', code: R`import { Suspense } from 'react';
import { cookies } from 'next/headers';

async function Recomendacoes() {
  const c = await cookies();                              // API de requisição: só este componente é dinâmico
  const id = c.get('usuario')?.value;
  const itens = id ? await getRecomendacoes(id) : [];
  return <ul>{itens.map((i) => <li key={i.id}>{i.nome}</li>)}</ul>;
}

export default async function Produto({ params }) {
  const { id } = await params;
  const p = await getProduto(id);                         // use cache (aula 5)
  return (
    <article>
      <h1>{p.nome}</h1><p>{p.descricao}</p>
      <Suspense fallback={<p style={{ minHeight: 120 }}>Carregando sugestões...</p>}><Recomendacoes /></Suspense>
    </article>
  );
}`, notes: [{ l: '5', t: 'cookies() torna apenas este componente dinâmico.' }, { l: '17', t: 'O fallback reserva altura para evitar mudança de layout.' }] },
    { title: 'Conferindo a estratégia pelos cabeçalhos', lang: 'bash', code: R`next build && next start -p 3111
curl -sI localhost:3111/            | grep -i "cache-control\|x-nextjs-prerender"
curl -sI -H 'cookie: sessao=1' localhost:3111/painel | grep -i "cache-control"
curl -s -o /dev/null -w 'ttfb=%{time_starttransfer}s total=%{time_total}s\n' localhost:3111/`, notes: [{ l: '2', t: 'Estática: s-maxage longo e x-nextjs-prerender: 1 (medido).' }, { l: '3', t: 'Dinâmica: no-store (medido).' }, { l: '4', t: 'Compare o primeiro byte com o total para confirmar o streaming.' }] }
  ],
  bestPractices: ['Comece estático e adicione dinamismo só onde necessário.', 'Isole o dinâmico em componentes dentro de Suspense.', 'Reserve o espaço dos fallbacks.', 'Decida 404 e redirecionamentos antes de transmitir.', 'Defina vida e invalidação por evento para conteúdo regenerado.', 'Valide a estratégia com cabeçalhos e medições.'],
  mistakes: ['Ler cookies() no layout e tornar o site inteiro dinâmico.', 'Usar SSR para conteúdo que nunca muda.', 'Fallbacks que mudam o layout ao carregar.', 'Cache longo sem plano de invalidação.', 'Não olhar a tabela do build.', 'Esperar SEO de conteúdo que só chega via JavaScript do cliente.'],
  market: `Escolher e justificar a estratégia de renderização por rota é uma competência de pessoas seniores em Next.js e uma pergunta quase certa em entrevistas de design de frontend. Mostrar medições (TTFB, cabeçalhos) em vez de opinião sustenta a decisão.`,
  summary: `SSG gera no build, SSR por requisição, ISR regenera por tempo ou tag e streaming envia em partes. O Next.js 16 mostra o resultado na tabela do build (○, ●, ◐, ƒ). A pré-renderização parcial combina um shell estático com ilhas dinâmicas em Suspense (medido: primeiro byte 17 ms, total 1,53 s). Isole APIs de requisição, reserve o espaço dos fallbacks e valide por cabeçalhos e medições.`,
  refs: [REF2.streaming, REF2.isr, REF2.caching, REF2.revalidating],
  cards: [
    { q: 'O que o símbolo ◐ da tabela do build indica?', a: 'Rota pré-renderizada parcialmente: shell estático com conteúdo dinâmico transmitido.' },
    { q: 'O que torna uma rota dinâmica?', a: 'Uso de cookies(), headers(), searchParams ou connection(), ou busca sem cache fora de Suspense.' },
    { q: 'Como o streaming melhora a experiência?', a: 'O shell é enviado e pintado de imediato e as partes lentas chegam depois, sem bloquear a página.' },
    { q: 'Por que decidir o 404 antes de transmitir?', a: 'O status HTTP e os cabeçalhos são enviados antes do corpo e não podem mudar depois.' }
  ]
},
{
  id: 'nxt-08', moduleId: 'm3', order: 8, minutes: 70, tags: ['Route Handlers', 'API', 'webhooks', 'streaming', 'CORS', 'HMAC'],
  title: 'Route Handlers: APIs, webhooks, streaming e CORS',
  objectives: ['Criar endpoints com route.js usando os métodos HTTP e a API padrão de Request e Response', 'Validar o corpo e devolver códigos de estado corretos (400, 401, 403, 404, 201)', 'Receber webhooks verificando a assinatura HMAC com comparação em tempo constante', 'Enviar respostas em streaming e configurar CORS e cabeçalhos', 'Escolher entre Route Handler e Server Action e entender a interação com o cache'],
  intro: `Quando a interface não é a única cliente (aplicativos móveis, integrações, webhooks de pagamento, sistemas internos), você precisa de uma **API HTTP** de verdade, com métodos, cabeçalhos, códigos de estado e versionamento controlados por você. No App Router isso é o **Route Handler**: um arquivo §route.js§ que exporta funções nomeadas pelo método HTTP e usa as APIs **Web padrão** (§Request§, §Response§). Esta aula cobre o básico medido no laboratório, validação, **webhooks com assinatura**, streaming e CORS, e a fronteira com as Server Actions.`,
  theory: `### O arquivo route.js
§§§
// app/api/ola/route.js
export async function GET(req) { const n = new URL(req.url).searchParams.get('n') ?? 'mundo'; return Response.json({ ola: n }); }
export async function POST(req) { const corpo = await req.json().catch(() => null); if (!corpo) return Response.json({ erro: 'json inválido' }, { status: 400 }); return Response.json({ recebido: corpo }, { status: 201 }); }
§§§
- exporte §GET§, §POST§, §PUT§, §PATCH§, §DELETE§, §HEAD§ e §OPTIONS§; métodos não exportados respondem **405**;
- um §route.js§ **não pode coexistir** com um §page.js§ no mesmo segmento;
- as funções recebem a §Request§ (com extensões do Next, como §nextUrl§) e um contexto com §params§ (assíncrono nas versões recentes);
- retorne uma §Response§ (§Response.json(...)§ é o atalho).
Medido no laboratório:
§§§
GET /api/ola?n=Ana            -> {"ola":"Ana","t":1}
POST (corpo "x", inválido)     -> {"erro":"json inválido"} [400]
POST {"a":1} application/json  -> {"recebido":{"a":1}} [201]
§§§

### Códigos de estado que importam
**200** OK; **201** criado; **204** sem conteúdo; **400** requisição inválida (formato, validação); **401** não autenticado; **403** autenticado sem permissão; **404** não encontrado; **409** conflito; **422** entidade não processável (validação semântica); **429** muitas requisições; **500** erro do servidor (sem expor detalhes internos). Devolva um corpo de erro **estável** (§{ erro, codigo, detalhes? }§).

### Validação e segurança
- **Valide** corpo, parâmetros e cabeçalhos como em Actions (aula 6): tipos, tamanhos, formato e limites (limite de tamanho do corpo, número de itens);
- **Autentique e autorize** em cada handler: Route Handlers **não** herdam proteção de layouts nem de páginas;
- **Não** reflita entrada sem escapar; **não** exponha mensagens de exceção;
- limite taxa em endpoints sensíveis;
- trate §GET§ como **seguro** (sem efeitos colaterais); mudanças de estado em POST/PUT/PATCH/DELETE.

### Webhooks: verificar a assinatura
Serviços externos (pagamentos, repositórios, CMS) enviam eventos por POST e **assinam** o corpo com um segredo compartilhado (HMAC). Receba o **corpo bruto** (§await req.text()§, não parseie antes), calcule o HMAC-SHA-256 com o segredo, compare em **tempo constante** com o cabeçalho de assinatura e **só então** interprete o JSON:
§§§
import { createHmac, timingSafeEqual } from 'node:crypto';
export async function POST(req) {
  const bruto = await req.text();
  const recebida = req.headers.get('x-assinatura') ?? '';
  const esperada = createHmac('sha256', process.env.WEBHOOK_SEGREDO).update(bruto).digest('hex');
  const a = Buffer.from(recebida), b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response('assinatura inválida', { status: 401 });
  const evento = JSON.parse(bruto);
  // processar de forma idempotente (o provedor reenvia em caso de falha) e responder 2xx rápido
  return new Response(null, { status: 204 });
}
§§§
Pontos: **comparação em tempo constante** (§timingSafeEqual§) evita ataques de temporização; verifique um **carimbo de tempo** assinado para rejeitar repetições antigas; seja **idempotente** (use o id do evento); responda 2xx **rápido** e processe em segundo plano; guarde o segredo em variável de ambiente do servidor. O mesmo handler pode chamar §revalidateTag§ para atualizar o cache a partir de um webhook de CMS (aula 5). A aula traz o desafio de código com a lógica de verificação.

### Streaming e eventos
Um handler pode devolver um §ReadableStream§ para enviar dados aos poucos (arquivos grandes, exportações, respostas de IA, **Server-Sent Events** com §content-type: text/event-stream§). Trate o cancelamento do cliente (§req.signal§) para liberar recursos.

### CORS e cabeçalhos
O navegador bloqueia chamadas de **outra origem** sem permissão. Para uma API pública ou usada por outros sites, responda ao **preflight** (§OPTIONS§) e inclua §Access-Control-Allow-Origin§ (**a origem específica**, nunca §*§ com credenciais), §-Methods§ e §-Headers§. Para o seu próprio site (mesma origem) nenhuma configuração é necessária. CORS **não é autenticação**: protege o navegador, não o servidor.

### Cache e Route Handlers
Com Cache Components, handlers §GET§ seguem o mesmo modelo de **pré-renderização** das páginas: um GET que não usa dados da requisição pode ser pré-renderizado; para dados de cada requisição, acesse §connection()§, §headers()§ ou §cookies()§, e funções cacheadas com §use cache§ funcionam dentro do handler (consulte a seção "Route Handlers with Cache Components" da documentação). No laboratório o handler de contagem usou §await connection()§ para ser dinâmico (§ƒ§ na tabela).

### Route Handler x Server Action
| | Server Action | Route Handler |
|---|---|---|
| Consumidor | Sua interface | Qualquer cliente HTTP |
| Contrato | Interno, muda com o código | Público e versionado |
| Método e status | POST, opaco | Você controla |
| Uso típico | Formulários e mutações da UI | Webhooks, apps móveis, integrações, arquivos |

### Testando
Teste a lógica pura (validação de entrada, verificação de assinatura) e chame o handler diretamente com um §Request§ construído; em integração, use §curl§ contra o servidor de produção (como no laboratório).`,
  concepts: [
    { term: 'Route Handler', def: 'Arquivo route.js que exporta funções por método HTTP e responde com a API Response.' },
    { term: 'Webhook', def: 'Requisição enviada por um serviço externo para notificar um evento.' },
    { term: 'HMAC', def: 'Código de autenticação de mensagem baseado em hash e em segredo compartilhado.' },
    { term: 'Comparação em tempo constante', def: 'Comparação cujo tempo não depende de onde os valores diferem, evitando ataques de temporização.' },
    { term: 'CORS', def: 'Mecanismo do navegador que controla chamadas entre origens diferentes.' },
    { term: 'Preflight', def: 'Requisição OPTIONS que o navegador envia para verificar se a chamada entre origens é permitida.' },
    { term: 'Server-Sent Events', def: 'Protocolo de envio contínuo de eventos do servidor ao navegador sobre HTTP.' },
    { term: 'Idempotência', def: 'Processar o mesmo evento mais de uma vez sem efeitos duplicados.' },
    { term: 'Código de estado HTTP', def: 'Número que indica o resultado da requisição (200, 400, 401, 404...).' }
  ],
  examples: R`**Analogia:** o Route Handler é o **balcão público** da empresa, com horário, regras e protocolos de atendimento; a Server Action é o **ramal interno** entre departamentos. O webhook é a **entrega com selo lacrado**: o carteiro entrega a caixa e você confere o lacre (assinatura) antes de abrir; se o lacre não bater, devolve.

**Resultados medidos (Next 16.4.6, servidor de produção, curl):**
§§§
GET  /api/ola?n=Ana              -> {"ola":"Ana","t":1}
POST /api/ola (corpo inválido)   -> {"erro":"json inválido"} [400]
POST /api/ola {"a":1}            -> {"recebido":{"a":1}} [201]
tabela do build: ƒ /api/ola (Dynamic)
§§§
A verificação de assinatura do webhook foi modelada como função pura no desafio de código (JavaScript puro); o handler com HMAC real em Node não foi exercitado no laboratório.

**Cenário ilustrativo (não medido):** uma loja recebia webhooks de pagamento sem verificar a assinatura; alguém enviou um POST forjado "pagamento aprovado" para um pedido. A verificação do HMAC com o corpo bruto, o carimbo de tempo e o id do evento idempotente fechou a brecha.`,
  code: [
    { title: 'Handler com validação e códigos de estado (executado)', lang: 'jsx', code: R`export async function GET(req) {
  const n = new URL(req.url).searchParams.get('n') ?? 'mundo';
  return Response.json({ ola: n, t: 1 });
}

export async function POST(req) {
  const corpo = await req.json().catch(() => null);
  if (!corpo) return Response.json({ erro: 'json inválido' }, { status: 400 });
  return Response.json({ recebido: corpo }, { status: 201 });
}`, notes: [{ l: '7', t: 'catch evita lançar 500 quando o corpo não é JSON (medido: 400).' }, { l: '9', t: '201 indica recurso criado (medido).' }] },
    { title: 'CORS com origem permitida e preflight', lang: 'jsx', code: R`const PERMITIDAS = new Set(['https://app.exemplo.com']);

function cors(req) {
  const o = req.headers.get('origin') ?? '';
  return PERMITIDAS.has(o) ? { 'access-control-allow-origin': o, vary: 'Origin', 'access-control-allow-methods': 'GET,POST', 'access-control-allow-headers': 'content-type' } : {};
}
export async function OPTIONS(req) { return new Response(null, { status: 204, headers: cors(req) }); }
export async function GET(req) { return Response.json({ ok: true }, { headers: cors(req) }); }`, notes: [{ l: '1', t: 'Lista explícita de origens: nada de * com credenciais.' }, { l: '5', t: 'Vary: Origin evita que o cache misture respostas de origens diferentes.' }] }
  ],
  bestPractices: ['Autentique e autorize em cada handler.', 'Valide entrada e devolva códigos de estado e corpos de erro estáveis.', 'Verifique a assinatura de webhooks com o corpo bruto e comparação em tempo constante.', 'Torne o processamento de eventos idempotente.', 'Use CORS com lista de origens e lembre que não é autenticação.', 'Use Server Actions para a própria UI e Route Handlers para terceiros.'],
  mistakes: ['Parsear o JSON antes de verificar a assinatura.', 'Comparar assinaturas com === (vazamento por tempo).', 'Usar Access-Control-Allow-Origin * com credenciais.', 'Expor mensagens de exceção ao cliente.', 'Achar que proteção em layout cobre o route handler.', 'Fazer efeitos colaterais em GET.'],
  market: `APIs em Route Handlers e integrações por webhook são trabalho diário de desenvolvimento full stack. Saber desenhar respostas com códigos corretos, verificar assinaturas e configurar CORS evita incidentes de segurança e é tema comum de entrevistas.`,
  summary: `Route Handlers exportam funções por método HTTP e respondem com Response (medido: GET, 400 e 201). Valide entradas, autentique em cada handler e devolva códigos de estado estáveis. Webhooks exigem verificação HMAC do corpo bruto com comparação em tempo constante e processamento idempotente. Streaming usa ReadableStream; CORS usa lista de origens e não é autenticação. Use Server Actions para a UI e Route Handlers para clientes externos.`,
  refs: [REF2.routeHandlers, REF2.dataSecurity, REF2.mdnHmac, REF2.mdnCors],
  cards: [
    { q: 'Qual código HTTP indica não autenticado e qual indica sem permissão?', a: '401 para não autenticado; 403 para autenticado sem permissão.' },
    { q: 'Por que verificar a assinatura do webhook com o corpo bruto?', a: 'Porque o HMAC é calculado sobre os bytes originais; reserializar o JSON mudaria o resultado.' },
    { q: 'Por que usar comparação em tempo constante?', a: 'Para evitar que o tempo de resposta revele quantos caracteres da assinatura estão corretos.' },
    { q: 'CORS protege o servidor?', a: 'Não: protege o navegador; a autenticação continua necessária.' }
  ]
}
];
