// C2.5 — Next.js. Aulas 9 a 11 (Proxy e autenticação; imagens, fontes e scripts; deploy e produção).
const R = String.raw;
const D = 'https://nextjs.org/docs/app/';

export const REF3 = {
  proxy: { title: 'Next.js — Proxy', url: D + 'getting-started/proxy', kind: 'doc' },
  auth: { title: 'Next.js — Guia de autenticação', url: D + 'guides/authentication', kind: 'doc' },
  authCache: { title: 'Next.js — Autenticação com Cache Components', url: D + 'guides/authentication-with-cache-components', kind: 'doc' },
  redirecting: { title: 'Next.js — Redirecionamentos', url: D + 'guides/redirecting', kind: 'doc' },
  owaspSession: { title: 'OWASP — Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html', kind: 'doc' },
  images: { title: 'Next.js — Image Optimization', url: D + 'getting-started/images', kind: 'doc' },
  fonts: { title: 'Next.js — Font Optimization', url: D + 'getting-started/fonts', kind: 'doc' },
  scripts: { title: 'Next.js — Guia de scripts', url: D + 'guides/scripts', kind: 'doc' },
  lazy: { title: 'Next.js — Lazy Loading', url: D + 'guides/lazy-loading', kind: 'doc' },
  deploying: { title: 'Next.js — Deploying', url: D + 'getting-started/deploying', kind: 'doc' },
  selfHosting: { title: 'Next.js — Self-Hosting', url: D + 'guides/self-hosting', kind: 'doc' },
  envVars: { title: 'Next.js — Variáveis de ambiente', url: D + 'guides/environment-variables', kind: 'doc' },
  checklist: { title: 'Next.js — Production checklist', url: D + 'guides/production-checklist', kind: 'doc' },
  instrumentation: { title: 'Next.js — Instrumentation', url: D + 'guides/instrumentation', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'nxt-09', moduleId: 'm3', order: 9, minutes: 75, tags: ['Proxy', 'middleware', 'autenticação', 'sessão', 'cookies', 'autorização'],
  title: 'Proxy (antigo middleware) e autenticação: sessões, cookies, camada de acesso a dados e autorização',
  objectives: ['Escrever um proxy com matcher e entender o que ele pode e não pode fazer', 'Distinguir autenticação, sessão e autorização e escolher entre sessão sem estado e sessão em banco', 'Configurar cookies de sessão seguros (HttpOnly, Secure, SameSite)', 'Aplicar verificações em camadas: otimista no proxy, definitiva na camada de acesso a dados', 'Implementar autorização por papéis e por propriedade do recurso como função pura'],
  intro: `Autenticação é saber **quem** é a pessoa; **autorização** é saber **o que** ela pode fazer. Em Next.js há vários pontos de verificação (proxy, layout, página, Server Action, Route Handler, camada de dados), e o erro mais comum é proteger apenas um deles. A regra desta aula: o **proxy** (antigo *middleware*, renomeado no Next 16) serve para **verificações otimistas e baratas** (redirecionar quem claramente não tem sessão), enquanto a **verificação definitiva** acontece **perto do dado**, em uma **camada de acesso a dados**. Os resultados do proxy foram medidos no laboratório (redirecionamento 307 e cabeçalho); a parte de sessão e criptografia segue a documentação e as práticas da OWASP, e a lógica de autorização é praticada em funções puras.`,
  theory: `### Proxy: o que é
§proxy.js§ (na raiz ou em §src/§) exporta uma função §proxy(request)§ executada **antes** de a requisição ser concluída, para **redirecionar, reescrever, alterar cabeçalhos ou responder diretamente**. No Next 16 ele **substitui o antigo *middleware*** (mesma funcionalidade, nome mais claro). A documentação da versão alerta: o proxy **não é para busca lenta de dados** nem para gerenciamento de sessão completo; é para **checagens otimistas**. Diretivas como §use cache§ e §use server§ não têm efeito nele, e opções de cache do §fetch§ também não.

### Matcher
O §export const config = { matcher: [...] }§ limita as rotas em que o proxy roda (padrões de caminho como §'/painel/:path*'§). Sem matcher, ele roda em **todas** as requisições, inclusive de arquivos estáticos: sempre restrinja. Medido no laboratório (matcher §['/painel/:path*', '/blog/:path*']§):
§§§
GET /painel sem cookie de sessão   -> 307 redirecionando para http://localhost:3111/
GET /painel com cookie sessao=1     -> segue; cabeçalho de resposta x-lab: 1 adicionado pelo proxy
§§§
O código usou §NextResponse.redirect(new URL('/', req.url))§ e §NextResponse.next()§ com §headers.set§. Redirecionamentos estáticos simples devem ir em §next.config§ (§redirects§), e o proxy é para lógica que depende da requisição.

### Sessão e cookies
Depois do login, o servidor precisa **lembrar** a pessoa:
- **Sessão sem estado (stateless)**: o cookie contém os dados da sessão **assinados e criptografados** (por exemplo, um JWT ou token selado); sem consulta ao banco por requisição; **difícil revogar** antes de expirar;
- **Sessão em banco**: o cookie guarda só um **id opaco** (criptografado), e o estado (usuário, expiração, dispositivo) fica no banco ou em um armazenamento rápido; permite **revogar**, listar dispositivos e encerrar sessões; custa uma consulta (cacheável na requisição).
Escolha em banco quando precisar de revogação imediata (contas sensíveis) e sem estado quando a simplicidade importar e o tempo de vida for curto.
Atributos do cookie de sessão (OWASP): **§HttpOnly§** (JavaScript não lê, reduz o roubo por XSS), **§Secure§** (só HTTPS), **§SameSite=Lax§ ou §Strict§** (reduz CSRF), **§Path=/§**, **expiração** curta com renovação, e o prefixo **§__Host-§** quando possível. **Nunca** guarde a sessão em §localStorage§ (legível por qualquer script).
§§§
(await cookies()).set('sessao', valorAssinado, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
§§§

### Senhas e identidade
Guarde **hash lento com sal** (argon2id, scrypt ou bcrypt), nunca a senha; limite tentativas; mensagens de erro **iguais** para usuário inexistente e senha errada; recuperação por link de uso único e curta duração; prefira **provedores de identidade** (OAuth/OIDC, passkeys) ou bibliotecas consolidadas de autenticação em vez de implementar tudo à mão (C4 e C7 aprofundam). Esta aula trata do **uso da sessão** no Next.js.

### Verificação em camadas
1. **Proxy**: checagem otimista (existe um cookie de sessão plausível? senão, redirecione para o login). É barata, mas **não é a segurança final** (um cookie falso passaria desta camada);
2. **Camada de acesso a dados (DAL)**: um módulo §server-only§ com funções como §verificarSessao()§ e §getPedido(id)§ que **sempre** validam a sessão e a permissão **antes de devolver o dado**. Todo acesso a dados passa por ela; páginas, Actions e Route Handlers chamam a DAL;
3. **Interface**: esconder botões é conveniência, não proteção.
Em um layout, a verificação **não protege** as páginas filhas em navegações no cliente (layouts não renderizam de novo): **a checagem tem de estar onde o dado é lido**. Com Cache Components, o acesso a §cookies()§ fica **fora** do escopo cacheado e dentro de Suspense (consulte o guia "autenticação com Cache Components").

### Autorização
- **Papéis (RBAC)**: papel → permissões (§admin§, §editor§, §leitor§);
- **Propriedade**: o recurso pertence a alguém (§pedido.donoId === sessao.usuarioId§);
- **Atributos/políticas (ABAC)**: regras combinadas (departamento, estado do documento, horário);
- **Negar por padrão**: sem regra explícita, a resposta é "não";
- retornar **404** em vez de 403 quando revelar a existência do recurso for um risco.
A autorização é uma **função pura** da pessoa, da ação e do recurso: fácil de testar (é o desafio de código desta aula).

### Fluxo completo (resumo)
Login (Action) → valida credenciais → cria sessão → define cookie seguro → redireciona; requisições seguintes: proxy (otimista) → página (chama DAL) → DAL valida sessão + autorização → dado; logout: apaga o cookie e a sessão no banco.

### Armadilhas
Confiar só no proxy; matcher amplo demais; checagem no layout; cookie sem HttpOnly/Secure; guardar token em localStorage; autorizar apenas pelo papel e esquecer o recurso (IDOR: trocar o id na URL e ver dado de outra pessoa); segredo de assinatura fraco ou no repositório; sessões que nunca expiram; mensagens que revelam se o e-mail existe.

### Testando
Teste a função pura de autorização com muitos casos (papéis, dono, negar por padrão); teste o matcher com URLs de exemplo (é o segundo desafio de código); em integração, use §curl§ contra o servidor de produção com e sem cookie.`,
  concepts: [
    { term: 'Proxy', def: 'Arquivo do Next.js 16 (antigo middleware) que executa antes da requisição para redirecionar, reescrever ou alterar cabeçalhos.' },
    { term: 'Matcher', def: 'Configuração que limita as rotas em que o proxy executa.' },
    { term: 'Autenticação', def: 'Verificação de quem é a pessoa.' },
    { term: 'Autorização', def: 'Verificação do que a pessoa pode fazer sobre determinado recurso.' },
    { term: 'Sessão sem estado', def: 'Sessão cujos dados vão assinados no próprio cookie, sem armazenamento no servidor.' },
    { term: 'Sessão em banco', def: 'Sessão guardada no servidor, referenciada por um id opaco no cookie.' },
    { term: 'HttpOnly', def: 'Atributo do cookie que impede a leitura por JavaScript.' },
    { term: 'DAL', def: 'Camada de acesso a dados que centraliza as verificações de sessão e permissão.' },
    { term: 'IDOR', def: 'Falha em que trocar um identificador permite acessar o recurso de outra pessoa.' },
    { term: 'RBAC', def: 'Controle de acesso baseado em papéis.' }
  ],
  examples: R`**Analogia:** o proxy é o **porteiro do prédio** (olha o crachá de longe: "tem crachá?"); a camada de dados é a **fechadura de cada sala** (confere de verdade se aquele crachá abre aquela sala). Confiar só no porteiro é deixar as salas sem tranca: alguém com um crachá falso passa pela portaria se o porteiro for enganado.

**Resultados medidos (Next 16.4.6):**
§§§
tabela do build: ƒ Proxy (Middleware)
/painel sem cookie:  HTTP 307 -> http://localhost:3111/
/painel com cookie:  segue, com o cabeçalho x-lab: 1 e Cache-Control no-store
§§§
Não foram executados: criação de sessão criptografada, login real nem as bibliotecas de autenticação; as recomendações de cookies seguem a documentação do Next.js e a OWASP.

**Cenário ilustrativo (não medido):** um painel protegia a rota §/admin§ só no layout. A navegação dentro do app funcionava, mas uma Server Action chamada diretamente devolvia dados de qualquer pedido. A correção moveu a verificação de sessão e permissão para a camada de dados, chamada por páginas, Actions e Route Handlers.`,
  code: [
    { title: 'Proxy com matcher: checagem otimista (executado)', lang: 'jsx', code: R`import { NextResponse } from 'next/server';

export function proxy(req) {
  const temSessao = Boolean(req.cookies.get('sessao'));
  if (req.nextUrl.pathname.startsWith('/painel') && !temSessao) {
    return NextResponse.redirect(new URL('/', req.url));       // medido: 307
  }
  const r = NextResponse.next();
  r.headers.set('x-lab', '1');
  return r;
}
export const config = { matcher: ['/painel/:path*', '/blog/:path*'] };`, notes: [{ l: '4', t: 'Só verifica a presença do cookie: é otimista; a validação real fica na DAL.' }, { l: '12', t: 'O matcher evita rodar o proxy em estáticos e rotas irrelevantes.' }] },
    { title: 'Camada de acesso a dados com sessão e autorização', lang: 'jsx', code: R`// lib/dal.js
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const verificarSessao = cache(async () => {
  const valor = (await cookies()).get('sessao')?.value;
  const sessao = valor ? await decifrarEVerificar(valor) : null;       // assinatura, expiração, revogação
  if (!sessao) redirect('/login');
  return sessao;                                                       // { usuarioId, papel }
});

export async function getPedido(id) {
  const sessao = await verificarSessao();
  const pedido = await db.pedidos.buscar(id);
  if (!pedido || !podeVer(sessao, pedido)) return null;               // 404 em vez de revelar a existência
  return { id: pedido.id, total: pedido.total, cliente: pedido.cliente };   // DTO mínimo
}`, notes: [{ l: '7', t: 'cache() do React evita repetir a verificação dentro da mesma renderização.' }, { l: '16', t: 'podeVer é uma função pura: papel, dono e negar por padrão.' }] }
  ],
  bestPractices: ['Use o proxy só para checagens otimistas e com matcher restrito.', 'Centralize a verificação de sessão e permissão em uma camada de acesso a dados server-only.', 'Cookies de sessão: HttpOnly, Secure, SameSite e expiração curta.', 'Negue por padrão e verifique a propriedade do recurso, não só o papel.', 'Devolva DTOs mínimos e 404 quando a existência for sensível.', 'Prefira provedores e bibliotecas de autenticação consolidados.'],
  mistakes: ['Confiar só no proxy ou só no layout.', 'Guardar o token de sessão em localStorage.', 'Autorizar por papel e esquecer o dono do recurso (IDOR).', 'Matcher que cobre arquivos estáticos e deixa o site lento.', 'Mensagens de login que revelam se o e-mail existe.', 'Chamar o banco no proxy para tudo.'],
  market: `Autenticação e autorização corretas são requisitos de segurança em qualquer produto, e falhas de controle de acesso lideram as listas de riscos. Explicar o papel do proxy, a camada de dados e o IDOR é pergunta frequente em entrevistas full stack e em revisões de segurança.`,
  summary: `O proxy (antigo middleware, Next 16) roda antes da requisição e serve a checagens otimistas com matcher restrito (medido: 307 sem cookie, cabeçalho adicionado com cookie). A verificação definitiva fica em uma camada de acesso a dados que valida sessão e autorização perto do dado. Sessões usam cookies HttpOnly, Secure e SameSite, sem estado ou em banco conforme a necessidade de revogar. Autorize por papel e propriedade, negando por padrão.`,
  refs: [REF3.proxy, REF3.auth, REF3.authCache, REF3.redirecting, REF3.owaspSession],
  cards: [
    { q: 'Como o middleware se chama no Next 16?', a: 'Proxy (arquivo proxy.js), com a mesma funcionalidade.' },
    { q: 'Por que o proxy não basta para proteger dados?', a: 'Ele faz checagens otimistas (por exemplo, presença do cookie); a verificação definitiva deve ocorrer perto do dado, na camada de acesso.' },
    { q: 'Quais atributos um cookie de sessão deve ter?', a: 'HttpOnly, Secure, SameSite (Lax ou Strict), Path e expiração curta.' },
    { q: 'O que é IDOR?', a: 'Acessar o recurso de outra pessoa trocando um identificador, por falta de verificação de propriedade.' }
  ]
},
{
  id: 'nxt-10', moduleId: 'm4', order: 10, minutes: 60, tags: ['next/image', 'next/font', 'next/script', 'lazy loading', 'CLS', 'LCP'],
  title: 'Imagens, fontes e scripts: as otimizações embutidas do Next.js',
  objectives: ['Usar next/image com dimensões, sizes e preload e evitar mudança de layout', 'Configurar imagens remotas com remotePatterns e entender o custo do otimizador', 'Carregar fontes com next/font sem mudança de layout e sem requisição a terceiros em tempo de execução', 'Controlar scripts de terceiros com next/script e suas estratégias', 'Carregar componentes pesados sob demanda com next/dynamic'],
  intro: `Imagens, fontes e scripts de terceiros costumam ser os maiores responsáveis por páginas lentas e instáveis. O Next.js traz componentes que aplicam as boas práticas por padrão: **§next/image§** (dimensões, formatos modernos, carregamento tardio e tamanhos responsivos), **§next/font§** (fontes hospedadas por você, sem mudança de layout) e **§next/script§** (estratégias de carregamento). Esta aula mostra como usar cada um e o que eles resolvem, usando a documentação da versão 16.4.6 do pacote. Não foram executadas medições de imagem no laboratório; a análise de Core Web Vitals fica para a C2.7.`,
  theory: `### next/image
O componente §Image§ resolve vários problemas de uma vez:
- exige **§width§ e §height§** (ou §fill§ com um contêiner posicionado) para **reservar o espaço** e evitar **mudança cumulativa de layout (CLS)**;
- serve **formatos modernos** (WebP por padrão; AVIF configurável em §images.formats§) e **tamanhos adequados** ao dispositivo, gerando versões redimensionadas sob demanda e guardando-as em cache;
- aplica **carregamento tardio** por padrão (§loading="lazy"§): a imagem só é baixada perto de aparecer;
- aceita **§placeholder="blur"§** para uma pré-visualização.
Atributos essenciais: **§sizes§** (diz ao navegador quanto da tela a imagem ocupa, para escolher a versão certa; sem ele, o navegador pode baixar uma versão muito maior que a necessária em imagens que preenchem o contêiner), **§alt§** (obrigatório e significativo; vazio quando decorativa) e **§quality§**.
**Imagem principal (LCP)**: a imagem acima da dobra que é o maior conteúdo deve carregar **cedo**, não de forma tardia. No Next 16, a propriedade §priority§ foi **depreciada** em favor de **§preload§** (insere um §<link rel="preload">§ no §<head>§); a documentação recomenda, na maioria dos casos, usar §loading="eager"§ ou §fetchPriority="high"§ em vez de §preload§ (que se destina a cenários específicos). Não marque várias imagens como prioritárias.

### Imagens remotas e segurança do otimizador
Imagens de outros domínios precisam ser **autorizadas** em §next.config§ com §images.remotePatterns§ (protocolo, host, caminho): isso impede que qualquer pessoa use seu servidor para otimizar imagens arbitrárias (custo e abuso). Seja **específico** (host e caminho). O otimizador consome CPU e memória e tem cache próprio: em hospedagem própria considere o ajuste de memória (biblioteca §sharp§ em Linux com glibc) e, se preciso, um **loader** externo (CDN de imagens). Imagens estáticas importadas (§import foto from './foto.jpg'§) já trazem dimensões e *blur*.

### next/font
§next/font§ **baixa e hospeda as fontes junto com o app** no build (Google Fonts ou arquivos locais): **nenhuma requisição ao Google em tempo de execução**, melhor privacidade e desempenho, e **ajuste automático de métricas** do fallback para evitar mudança de layout. Uso:
§§§
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
export default function Layout({ children }) { return <html lang="pt-BR" className={inter.className}><body>{children}</body></html>; }
§§§
As fontes têm escopo do componente em que são usadas; para o app todo, aplique no layout raiz. Escolha **subconjuntos** (§subsets§) e **pesos** necessários (fontes variáveis reduzem arquivos). Fontes locais usam §next/font/local§.

### next/script
Scripts de terceiros (analytics, chat, anúncios) atrasam e bloqueiam a página. O componente §Script§ define a **estratégia**:
- **§afterInteractive§** (padrão): depois de a página ficar interativa (analytics);
- **§lazyOnload§**: no ocioso, depois do carregamento (chat, widgets);
- **§beforeInteractive§**: antes da hidratação, apenas para o que é indispensável (raro);
- **§worker§**: experimental, fora da thread principal (a documentação avisa que ainda não é estável no App Router).
Avalie **se** o script é necessário, carregue-o **só nas rotas que usam** e prefira alternativas leves. Cada script de terceiros é também um **risco de segurança** (execução de código externo): use *Content-Security-Policy* e integridade quando possível.

### Carregamento sob demanda de componentes
§next/dynamic§ (ou §React.lazy§ com Suspense) divide o pacote e carrega o componente **quando necessário** (editor, mapa, gráfico, modal). Em Client Components, §dynamic(() => import('./Mapa'), { ssr: false })§ evita renderizar no servidor um componente que depende do navegador. A divisão por **rota** já é automática no App Router.

### CSS e outras otimizações embutidas
Módulos CSS, Tailwind (C2.2) e CSS global são suportados; o Next extrai o CSS crítico por rota. **§Link§** pré-busca rotas (aula 1); **metadados** e §sitemap§ (aula 2); **pré-busca parcial** reduz o tempo de navegação. Ferramentas de análise (analisador de pacotes) mostram o peso por rota.

### Verificação
Rode o Lighthouse e observe LCP, CLS e INP (C2.7); inspecione a aba Rede para ver formatos e tamanhos; confira se não há requisições a domínios de fontes; use o relatório do build para o tamanho do JavaScript por rota.`,
  concepts: [
    { term: 'next/image', def: 'Componente que serve imagens redimensionadas, em formatos modernos e com carregamento tardio, reservando espaço.' },
    { term: 'CLS', def: 'Cumulative Layout Shift: métrica de instabilidade visual causada por elementos que mudam de tamanho.' },
    { term: 'sizes', def: 'Atributo que informa a largura que a imagem ocupa para o navegador escolher a versão adequada.' },
    { term: 'remotePatterns', def: 'Configuração que autoriza os domínios e caminhos de imagens remotas.' },
    { term: 'preload', def: 'Propriedade (Next 16) que insere um link de preload para a imagem; substitui priority.' },
    { term: 'next/font', def: 'Módulo que hospeda fontes no build e evita mudança de layout.' },
    { term: 'next/script', def: 'Componente que controla quando um script externo é carregado.' },
    { term: 'next/dynamic', def: 'Função que carrega componentes sob demanda, dividindo o pacote.' },
    { term: 'LCP', def: 'Largest Contentful Paint: tempo de exibição do maior conteúdo visível.' }
  ],
  examples: R`**Analogia:** o next/image é uma **fotógrafa que revela a foto no tamanho do porta-retratos** (não manda o poster de dois metros para um espaço de 10 cm) e **reserva a moldura** antes de a foto chegar (sem pulo de layout). O next/font é a **gráfica interna** que imprime as fontes antes da festa em vez de pedir à gráfica de fora durante o evento.

**Uso típico (documentação 16.4.6):**
§§§
<Image src="/hero.jpg" alt="Equipe no escritório" width={1200} height={630} sizes="(max-width: 768px) 100vw, 1200px" loading="eager" fetchPriority="high" />
images: { remotePatterns: [new URL('https://cdn.exemplo.com/conta123/**')] }
const inter = Inter({ subsets: ['latin'], display: 'swap' })
<Script src="https://analytics.exemplo/a.js" strategy="afterInteractive" />
§§§
Nenhuma imagem, fonte ou script foi executado no laboratório (sem navegador de medição); o que é afirmado vem da documentação do pacote 16.4.6.

**Cenário ilustrativo (não medido):** a página inicial usava uma imagem de herói de 3 MB em §<img>§ sem dimensões, a fonte vinha do Google em tempo de execução e três scripts bloqueavam a hidratação. Trocar por §Image§ com §sizes§ e dimensões, §next/font§ e §afterInteractive§/§lazyOnload§ nos scripts reduziu o peso da página e removeu o salto de layout; as métricas devem ser confirmadas no Lighthouse (C2.7).`,
  code: [
    { title: 'Imagem acima da dobra, imagem de lista e fonte no layout', lang: 'jsx', code: R`import Image from 'next/image';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function Layout({ children }) {
  return <html lang="pt-BR" className={inter.className}><body>{children}</body></html>;
}

export function Hero() {
  return <Image src="/hero.jpg" alt="Equipe no escritório" width={1200} height={630} sizes="(max-width: 768px) 100vw, 1200px" loading="eager" fetchPriority="high" />;
}

export function Miniatura({ produto }) {
  return <Image src={produto.imagem} alt={produto.nome} width={320} height={320} sizes="(max-width: 768px) 50vw, 320px" />;   // lazy por padrão
}`, notes: [{ l: '12', t: 'A imagem do LCP não deve ser lazy; indique prioridade de busca.' }, { l: '16', t: 'Miniaturas ficam com carregamento tardio e sizes adequado.' }] },
    { title: 'Script de terceiros com estratégia e componente sob demanda', lang: 'jsx', code: R`import Script from 'next/script';
import dynamic from 'next/dynamic';

const Mapa = dynamic(() => import('./mapa'), { ssr: false, loading: () => <p>Carregando mapa...</p> });

export function Rodape() {
  return (
    <>
      <Script src="https://chat.exemplo/widget.js" strategy="lazyOnload" />
      <Mapa />
    </>
  );
}`, notes: [{ l: '4', t: 'ssr: false só vale em Client Components e para código que depende do navegador.' }, { l: '9', t: 'lazyOnload carrega no ocioso: bom para chat e widgets.' }] }
  ],
  bestPractices: ['Sempre informe dimensões e sizes nas imagens.', 'Não deixe a imagem do LCP em carregamento tardio.', 'Autorize imagens remotas com remotePatterns específicos.', 'Use next/font com subsets e pesos mínimos.', 'Carregue scripts de terceiros só onde necessários e com a estratégia mais tardia possível.', 'Divida componentes pesados com next/dynamic e meça o efeito.'],
  mistakes: ['Imagens sem dimensões (mudança de layout).', 'Omitir sizes e baixar imagens enormes no celular.', 'Marcar tudo como prioritário.', 'remotePatterns amplos demais.', 'Carregar fontes de terceiros em tempo de execução.', 'Scripts de terceiros em beforeInteractive sem necessidade.'],
  market: `Desempenho e estabilidade visual influenciam conversão e SEO, e as otimizações embutidas do Next.js são o caminho mais curto para ganhá-las. Saber configurar imagens, fontes e scripts, e justificar com as métricas, é esperado em vagas de frontend e full stack.`,
  summary: `next/image reserva espaço, serve formatos e tamanhos adequados e carrega tardiamente; use sizes, alt e remotePatterns, e trate a imagem do LCP com carregamento antecipado (no Next 16, preload substitui priority). next/font hospeda as fontes e evita mudança de layout; next/script controla o momento de scripts de terceiros; next/dynamic carrega componentes sob demanda. Confirme os ganhos com Lighthouse (C2.7).`,
  refs: [REF3.images, REF3.fonts, REF3.scripts, REF3.lazy],
  cards: [
    { q: 'Por que o next/image exige width e height?', a: 'Para reservar o espaço da imagem e evitar a mudança de layout (CLS).' },
    { q: 'Qual a vantagem do next/font sobre um link de fonte do Google?', a: 'As fontes são hospedadas com o app (sem requisição de terceiros em execução) e o ajuste de métricas evita mudança de layout.' },
    { q: 'O que substitui a propriedade priority no Next 16?', a: 'A propriedade preload (e, na maioria dos casos, loading="eager" ou fetchPriority="high").' },
    { q: 'Qual estratégia de next/script é indicada para um widget de chat?', a: 'lazyOnload, que carrega no ocioso depois do carregamento.' }
  ]
},
{
  id: 'nxt-11', moduleId: 'm4', order: 11, minutes: 70, tags: ['deploy', 'standalone', 'Docker', 'variáveis de ambiente', 'observabilidade', 'produção'],
  title: 'Deploy e produção: servidor Node, standalone e contêiner, variáveis de ambiente, cache e observabilidade',
  objectives: ['Escolher entre servidor Node, contêiner, plataforma gerenciada e exportação estática', 'Gerar e executar a saída standalone e escrever um Dockerfile multiestágio', 'Gerenciar variáveis de ambiente de build e de execução sem vazar segredos', 'Preparar cache, cabeçalhos e CDN e entender os limites do cache em memória com várias instâncias', 'Configurar observabilidade (instrumentação, logs, métricas, health checks) e um checklist de produção'],
  intro: `Um app Next.js pode rodar de formas muito diferentes: em uma **plataforma gerenciada**, em um **servidor Node** próprio (§next start§), em um **contêiner** (Docker/Kubernetes) ou como **arquivos estáticos** (§output: 'export'§, sem recursos de servidor). Cada escolha muda o que funciona (cache, proxy, ISR, otimização de imagens), os custos e o trabalho operacional. Esta aula mostra o caminho **self-hosting** com a saída **standalone** (medida no laboratório), as variáveis de ambiente (a fonte clássica de vazamentos), o cache e a observabilidade, e termina com um checklist de produção. O build e o servidor de produção foram executados; o contêiner Docker e o deploy real **não** foram executados aqui.`,
  theory: `### Opções de deploy
- **Servidor Node** (§next build && next start§): suporta **todos** os recursos (proxy, ISR, Server Actions, otimização de imagens); você gerencia o processo, a escala e o proxy reverso;
- **Contêiner**: o mesmo servidor Node empacotado (Docker), recomendado para orquestradores; a saída **standalone** reduz o tamanho;
- **Plataforma gerenciada**: cuida de CDN, escala e cache, com limites e custos próprios; consulte a documentação de adaptadores e o guia de plataformas;
- **Exportação estática** (§output: 'export'§): só HTML/JS/CSS em qualquer servidor de arquivos, **sem** recursos que exigem servidor (proxy, Server Actions, Route Handlers dinâmicos, ISR); imagens exigem um loader personalizado.
O guia "self-hosting" lista, para cada recurso, o que exige um servidor Node.

### Saída standalone
Com §output: 'standalone'§ em §next.config§, o §next build§ cria §.next/standalone§ com um **servidor mínimo** (§server.js§) e **apenas as dependências necessárias**, copiadas por rastreamento de arquivos. Medido no laboratório (Next 16.4.6):
§§§
.next/standalone/ -> node_modules/, package.json, server.js     (39 MB no total)
§§§
Para executar: §node .next/standalone/server.js§ (porta pela variável §PORT§, endereço por §HOSTNAME§). **Lembre**: os diretórios §public/§ e §.next/static/§ **não são copiados** automaticamente: copie-os para o local correto na imagem ou sirva-os por um CDN.

### Dockerfile multiestágio (modelo)
§§§
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
§§§
Boas práticas: imagem base **fixada por versão**, **usuário não root**, sem segredos na imagem (§.dockerignore§ com §.env*§), estágios separados para reduzir o tamanho, §HEALTHCHECK§ ou sonda do orquestrador, encerramento gracioso por §SIGTERM§. (Docker, CI/CD e orquestração são aprofundados na C6.)

### Variáveis de ambiente
- **Servidor**: lidas em tempo de execução (§process.env.X§ em código de servidor); **não** vão ao navegador;
- **§NEXT_PUBLIC_*§**: **substituídas no build** pelo valor literal e incluídas no JavaScript do cliente: **qualquer pessoa as vê** e **não mudam** sem novo build; **nunca** coloque segredos nelas;
- no servidor, para ler uma variável **em tempo de execução** (e não congelada no build) em uma rota estática, use uma API de requisição como §connection()§ antes do acesso (a documentação de self-hosting detalha o caso);
- arquivos §.env§: §.env.local§ **fora do Git**; ambientes diferentes usam valores diferentes via a plataforma ou o orquestrador (segredos em um **gerenciador de segredos**, não no repositório nem na imagem);
- **valide** as variáveis na inicialização (esquema) e falhe cedo se faltar uma obrigatória.

### Cache, cabeçalhos e CDN
- Ativos em §/_next/static§ têm hash e recebem cache **imutável** de um ano (a documentação indica que isso não pode ser sobrescrito);
- páginas estáticas saem com §s-maxage§ longo (medido: §31536000§) para CDN e invalidação sob demanda no servidor;
- páginas dinâmicas com §no-store§ (medido);
- com **várias instâncias**, o cache em memória do Next **não é compartilhado**; use um **cache handler** compartilhado (documentado em §cacheHandler§) ou depende da CDN; defina a chave de criptografia das Server Actions de forma consistente (§NEXT_SERVER_ACTIONS_ENCRYPTION_KEY§);
- proxy reverso (Nginx, balanceador): desative buffering para **streaming** funcionar, repasse §Host§ e §X-Forwarded-*§, e configure §serverActions.allowedOrigins§ quando o domínio externo diferir.

### Observabilidade
- **Logs estruturados** (JSON) com id de requisição; não registre dados pessoais nem segredos;
- **Instrumentação**: o arquivo §instrumentation.js§ registra OpenTelemetry (traces) na inicialização do servidor;
- **Métricas**: latência (p50/p95/p99), taxa de erros, uso de CPU e memória, tempo de renderização, acertos de cache;
- **Monitoramento de usuários reais (RUM)** e Web Vitals (C2.7);
- **Health checks**: uma rota simples (§/api/saude§) para o orquestrador, **sem** depender de serviços externos lentos;
- **Alertas** sobre taxa de erros e latência (SLOs).

### Checklist de produção (resumo do guia oficial)
1) tabela de rotas revisada (○ ● ◐ ƒ); 2) variáveis e segredos corretos; 3) cabeçalhos de segurança (CSP, HSTS, X-Content-Type-Options, Referrer-Policy); 4) imagens com remotePatterns; 5) fontes e scripts otimizados; 6) metadados e sitemap; 7) tratamento de erros (error.js, global-error, not-found); 8) autenticação e autorização na camada de dados; 9) limites de tamanho de corpo e taxa; 10) logs e métricas; 11) estratégia de cache e invalidação; 12) teste de carga e plano de retorno (rollback).

### Estratégia de lançamento
Pipeline: instalar com §npm ci§, testes, §next build§, imagem versionada, deploy gradual (canário ou azul-verde), verificação de saúde e **rollback** rápido. Mantenha as versões do Next e do React fixadas e leia as notas de atualização antes de subir de versão (as convenções mudam entre versões maiores).`,
  concepts: [
    { term: 'next start', def: 'Comando que inicia o servidor Node de produção do Next.js.' },
    { term: 'standalone', def: 'Saída do build com um servidor mínimo e apenas as dependências necessárias.' },
    { term: 'Exportação estática', def: 'Geração de arquivos HTML/JS/CSS sem servidor Node.' },
    { term: 'Dockerfile multiestágio', def: 'Dockerfile com estágios separados de instalação, build e execução para reduzir a imagem final.' },
    { term: 'NEXT_PUBLIC_', def: 'Prefixo de variáveis incluídas no cliente no build.' },
    { term: 'Cache handler', def: 'Implementação de cache compartilhado entre instâncias do servidor.' },
    { term: 'Health check', def: 'Endpoint que informa se a instância está saudável para receber tráfego.' },
    { term: 'Instrumentation', def: 'Arquivo do Next.js que registra observabilidade (como OpenTelemetry) na inicialização do servidor.' },
    { term: 'Rollback', def: 'Retorno rápido a uma versão anterior após um deploy com problema.' }
  ],
  examples: R`**Analogia:** o build é a **cozinha industrial** que prepara as marmitas; o standalone é a **marmita já embalada com só o necessário**; o contêiner é a **caixa térmica padronizada**; o CDN é o **entregador de bairro** que guarda cópias; o health check é o **termômetro** que diz se a marmita ainda está boa; o rollback é **trocar pela marmita de ontem** quando a de hoje estraga.

**Resultados medidos (Next 16.4.6, output standalone):**
§§§
.next/standalone: node_modules, package.json, server.js | 39 MB
rota estática: s-maxage=31536000, x-nextjs-prerender: 1, x-nextjs-cache: HIT
rota dinâmica: Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
§§§
**Não executado:** a construção da imagem Docker, a execução do servidor standalone fora do diretório de build, o proxy reverso, o cache compartilhado e a instrumentação OpenTelemetry (descritos conforme a documentação).

**Cenário ilustrativo (não medido):** uma equipe colocou a URL e a chave de um serviço em §NEXT_PUBLIC_API_KEY§ "para facilitar". Depois do build, a chave estava legível no JavaScript do site. A correção moveu a chamada para um Server Component/Action e a variável para o servidor, rotacionou a chave e adicionou uma verificação de variáveis no pipeline.`,
  code: [
    { title: 'next.config e verificação das variáveis na inicialização', lang: 'jsx', code: R`// next.config.mjs
export default { output: 'standalone' };

// lib/env.js  (import 'server-only')
const obrigatorias = ['DATABASE_URL', 'SESSAO_SEGREDO'];
const faltando = obrigatorias.filter((k) => !process.env[k]);
if (faltando.length) throw new Error('Variáveis ausentes: ' + faltando.join(', '));
export const env = { dbUrl: process.env.DATABASE_URL, segredo: process.env.SESSAO_SEGREDO };`, notes: [{ l: '2', t: 'Gera .next/standalone com server.js (medido: 39 MB).' }, { l: '7', t: 'Falhar cedo evita descobrir a variável ausente só na primeira requisição.' }] },
    { title: 'Rota de saúde e comandos de execução', lang: 'bash', code: R`# app/api/saude/route.js  ->  export async function GET() { return Response.json({ ok: true }); }
npm ci && npx next build
cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
curl -s localhost:3000/api/saude`, notes: [{ l: '3', t: 'public e .next/static não são copiados automaticamente para o standalone.' }, { l: '4', t: 'O servidor standalone usa PORT e HOSTNAME.' }] }
  ],
  bestPractices: ['Escolha o modo de deploy pelos recursos que o app usa.', 'Use standalone e Docker multiestágio com usuário não root e imagem fixada.', 'Mantenha segredos fora da imagem e do repositório e nunca em NEXT_PUBLIC_.', 'Valide variáveis na inicialização.', 'Planeje cache compartilhado e chave de criptografia estável com várias instâncias.', 'Tenha health check, logs estruturados, métricas, alertas e rollback.'],
  mistakes: ['Colocar segredos em variáveis NEXT_PUBLIC_.', 'Esquecer de copiar public e .next/static para o standalone.', 'Exportação estática em um app que usa Server Actions.', 'Cache em memória com várias instâncias sem cache compartilhado.', 'Proxy reverso que faz buffering e quebra o streaming.', 'Imagem com .env e segredos embutidos.'],
  market: `Levar o app à produção com segurança e observabilidade é o que separa um projeto de um produto. Saber discutir standalone, contêiner, variáveis, cache com várias instâncias e rollback é esperado em vagas full stack e de plataforma, e conecta o curso à C6 (Docker, CI/CD) e à C7 (segurança).`,
  summary: `O Next.js roda em servidor Node, contêiner, plataforma gerenciada ou como estático (sem recursos de servidor). A saída standalone gera um servidor mínimo (medido: 39 MB), mas exige copiar public e .next/static. Variáveis NEXT_PUBLIC_ vão ao cliente no build; segredos ficam no servidor e fora da imagem. Com várias instâncias, use cache compartilhado e chave estável das Actions. Observabilidade (logs, métricas, instrumentação, health check) e um checklist de produção completam o ciclo.`,
  refs: [REF3.deploying, REF3.selfHosting, REF3.envVars, REF3.checklist, REF3.instrumentation],
  cards: [
    { q: 'O que contém .next/standalone?', a: 'Um servidor mínimo (server.js) com as dependências necessárias; public e .next/static precisam ser copiados à parte.' },
    { q: 'Por que não colocar segredos em NEXT_PUBLIC_?', a: 'Elas são substituídas no build e ficam legíveis no JavaScript do cliente.' },
    { q: 'O que quebra com várias instâncias do servidor?', a: 'O cache em memória não é compartilhado e a chave de criptografia das Server Actions pode divergir; use cache handler e chave estável.' },
    { q: 'Por que um proxy reverso pode quebrar o streaming?', a: 'Se fizer buffering da resposta, o shell e os trechos não chegam progressivamente.' }
  ]
}
];
