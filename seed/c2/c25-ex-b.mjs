// C2.5 — Next.js: exercícios das aulas 7 a 11, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'nxt-07': [
  { id: 'nxt-07-e1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o símbolo da tabela do §next build§ ao significado.', pairs: [['○', 'Estática: prerenderizada como conteúdo estático'], ['●', 'SSG: prerenderizada com generateStaticParams'], ['◐', 'Partial Prerender: shell estático e conteúdo dinâmico transmitido'], ['ƒ', 'Dinâmica: renderizada sob demanda']], explanation: 'A tabela do build é a primeira ferramenta para ver como cada rota é servida.' },
  { id: 'nxt-07-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do laboratório (servidor de produção, rota ◐ com um Suspense que espera 1,5 s).', code: 'tempo até o primeiro byte: 0,017 s\ntempo total: 1,53 s\nHTML inicial contém: <h1>Shell</h1> e o fallback', lang: 'text', steps: [{ q: 'O shell chega antes ou depois do conteúdo lento (antes/depois)?', answers: ['antes'] }, { q: 'A rota inteira esperou 1,5 s para começar a responder (sim/não)?', answers: ['não', 'nao'] }], explanation: 'O streaming envia o shell imediatamente (17 ms) e a parte lenta chega depois (1,53 s no total).' },
  { id: 'nxt-07-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O site inteiro virou dinâmico e lento depois de uma mudança no layout. Clique na linha da causa.', code: 'export default async function Layout({ children }) {\n  const c = await cookies();\n  const tema = c.get("tema")?.value ?? "claro";\n  return <html data-tema={tema}><body>{children}</body></html>;\n}', answer: 2, explanation: 'Ler cookies() no layout torna dinâmicas todas as rotas abaixo. Isole a leitura em um componente pequeno dentro de Suspense (ou resolva o tema no cliente).' },
  { id: 'nxt-07-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Escolha a estratégia de renderização para: (a) página "Sobre"; (b) catálogo com 50 mil produtos atualizados por um CMS; (c) painel do usuário; (d) página de produto com estoque em tempo real e recomendações personalizadas. Justifique cada uma.', model: '(a) Estática: o conteúdo muda raramente e é igual para todos, então SSG com cache longo e CDN. (b) Cache com tags: pré-gerar os mais acessados com generateStaticParams, deixar os demais sob demanda e invalidar por tag com webhook do CMS (ISR por eventos); o build não cresce com o catálogo. (c) Dinâmica por requisição, pois depende da sessão: dados pessoais lidos fora de caches compartilhados, com Suspense e loading para a interface aparecer logo. (d) Parcial: descrição e imagens no shell estático ou em cache, preço com cache de vida curta, estoque e recomendações dinâmicos em Suspense com fallbacks de altura reservada, para a pessoa ver o essencial imediatamente.', rubric: ['Escolhe estático para a página institucional', 'Usa pré-geração parcial, tags e webhook para o catálogo', 'Usa dinâmico sem cache compartilhado para o painel', 'Usa shell estático com ilhas dinâmicas para o produto'], explanation: 'A estratégia certa combina o frescor necessário com o menor trabalho por requisição.' },
  { id: 'nxt-07-e5', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §classificarRota(info)§ devolvendo o símbolo da tabela do build. §info§: §{ usaApiRequisicao, buscaSemCacheForaDeSuspense, temGenerateStaticParams, temSuspenseDinamico, temCache }§ (todos booleanos opcionais). Regras, nesta ordem: (1) §buscaSemCacheForaDeSuspense§ verdadeiro → lance §Error("rota bloqueante")§; (2) §usaApiRequisicao§ **fora de Suspense** (ou seja, §usaApiRequisicao§ verdadeiro e §temSuspenseDinamico§ falso) → §"ƒ"§; (3) §temSuspenseDinamico§ verdadeiro → §"◐"§; (4) §temGenerateStaticParams§ verdadeiro → §"●"§; (5) caso contrário §"○"§.', lang: 'javascript', starter: 'function classificarRota(info) {\n  // seu código aqui\n}\n', hints: ['Avalie as condições na ordem do enunciado.', 'Trate info indefinido como objeto vazio.'], tests: [{ name: 'casos principais', code: R`assert.equal(classificarRota({}), '○');
assert.equal(classificarRota({ temCache: true }), '○');
assert.equal(classificarRota({ temGenerateStaticParams: true }), '●');
assert.equal(classificarRota({ usaApiRequisicao: true }), 'ƒ');
assert.equal(classificarRota({ temSuspenseDinamico: true, temCache: true }), '◐');` }, { name: 'precedências', code: R`assert.equal(classificarRota({ usaApiRequisicao: true, temSuspenseDinamico: true }), '◐');
assert.equal(classificarRota({ temGenerateStaticParams: true, usaApiRequisicao: true }), 'ƒ');
assert.equal(classificarRota({ temGenerateStaticParams: true, temSuspenseDinamico: true }), '◐');` }, { name: 'rota bloqueante', code: R`assert.throws(() => classificarRota({ buscaSemCacheForaDeSuspense: true, temSuspenseDinamico: true }), 'rota bloqueante');
assert.equal(classificarRota(undefined), '○');` }], solution: R`function classificarRota(info) {
  const i = info || {};
  if (i.buscaSemCacheForaDeSuspense) throw new Error('rota bloqueante');
  if (i.usaApiRequisicao && !i.temSuspenseDinamico) return 'ƒ';
  if (i.temSuspenseDinamico) return '◐';
  if (i.temGenerateStaticParams) return '●';
  return '○';
}
`, explanation: 'O modelo mostra como Suspense isola o dinâmico (◐), enquanto uma API de requisição fora de Suspense deixa a rota inteira dinâmica (ƒ).' }
],
'nxt-08': [
  { id: 'nxt-08-e1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a situação ao código HTTP mais adequado.', pairs: [['JSON de entrada inválido', '400'], ['Pessoa sem sessão', '401'], ['Pessoa logada sem permissão', '403'], ['Recurso criado com sucesso', '201'], ['Muitas requisições em pouco tempo', '429']], explanation: 'Os códigos comunicam o resultado ao cliente e orientam repetições e tratamento.' },
  { id: 'nxt-08-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Um Route Handler herda a proteção de autenticação colocada em um layout da mesma pasta.', answer: false, explanation: 'Route Handlers não passam por layouts; autentique e autorize em cada handler (ou na camada de dados).' },
  { id: 'nxt-08-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'A verificação de assinatura do webhook falha mesmo com o segredo certo. Clique na linha da causa.', code: 'export async function POST(req) {\n  const corpo = await req.json();\n  const assinatura = req.headers.get("x-assinatura");\n  const esperada = hmac(JSON.stringify(corpo), SEGREDO);\n  if (assinatura !== esperada) return new Response("x", { status: 401 });\n  return new Response(null, { status: 204 });\n}', answer: 2, explanation: 'O HMAC deve ser calculado sobre o corpo bruto (req.text()); parsear e reserializar o JSON muda os bytes (espaços, ordem). Além disso, compare em tempo constante.' },
  { id: 'nxt-08-e4', type: 'mc', difficulty: 2, points: 10, prompt: 'Quando usar Route Handler em vez de Server Action?', options: ['Para formulários da própria interface', 'Para webhooks, aplicativos móveis e integrações que precisam de uma API HTTP com contrato próprio', 'Sempre que houver banco de dados', 'Nunca'], answer: 1, explanation: 'Actions servem à própria UI; Route Handlers entregam APIs públicas, com métodos, cabeçalhos e status controlados.' },
  { id: 'nxt-08-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarWebhook(opcoes)§: §opcoes§ = §{ corpo, assinatura, timestamp, idEvento, agora, assinar, tolerancia, vistos }§. §corpo§ é o texto bruto; §assinar(texto)§ é uma função injetada que devolve a assinatura esperada (hexadecimal) de um texto; §vistos§ é um §Set§ de ids já processados; §tolerancia§ em segundos (padrão 300). Devolva §{ status, motivo? }§: (1) §assinatura§ ausente → §401§, motivo §"sem assinatura"§; (2) §|agora - timestamp| > tolerancia§ (ambos em segundos) → §401§, §"timestamp fora da janela"§; (3) assinatura calculada sobre §timestamp + "." + corpo§ comparada **em tempo constante** (percorra todos os caracteres, acumulando diferenças com OU bit a bit, e considere o comprimento) diferente → §401§, §"assinatura inválida"§; (4) §vistos.has(idEvento)§ → §200§, §"duplicado"§ (idempotência: não processar de novo); (5) senão adicione o id a §vistos§ e devolva §{ status: 204 }§.', lang: 'javascript', starter: 'function verificarWebhook(opcoes) {\n  // seu código aqui\n}\n', hints: ['A função assinar recebe o texto timestamp + "." + corpo.', 'Implemente a comparação com um laço que acumula (a.charCodeAt(i) ^ b.charCodeAt(i)).'], tests: [{ name: 'fluxo feliz e duplicado', code: R`const assinar = (t) => 'sig:' + t.length + ':' + t.slice(0, 5);
const vistos = new Set();
const base = { corpo: '{"id":1}', timestamp: 1000, idEvento: 'e1', agora: 1100, assinar, vistos };
const ass = assinar('1000.{"id":1}');
assert.deepEqual(verificarWebhook({ ...base, assinatura: ass }), { status: 204 });
assert.ok(vistos.has('e1'));
assert.deepEqual(verificarWebhook({ ...base, assinatura: ass }), { status: 200, motivo: 'duplicado' });` }, { name: 'rejeições', code: R`const assinar = (t) => 'x' + t;
const base = { corpo: 'abc', timestamp: 1000, idEvento: 'e', agora: 1000, assinar, vistos: new Set() };
assert.deepEqual(verificarWebhook({ ...base }), { status: 401, motivo: 'sem assinatura' });
assert.deepEqual(verificarWebhook({ ...base, assinatura: 'errada' }), { status: 401, motivo: 'assinatura inválida' });
assert.deepEqual(verificarWebhook({ ...base, assinatura: assinar('1000.abc'), agora: 2000 }), { status: 401, motivo: 'timestamp fora da janela' });
assert.deepEqual(verificarWebhook({ ...base, assinatura: assinar('1000.abc'), agora: 1600, tolerancia: 600 }), { status: 204 });
assert.equal(base.vistos.size, 1);` }, { name: 'comprimentos diferentes e mesmo prefixo', code: R`const assinar = (t) => 'abcdef';
const base = { corpo: 'c', timestamp: 1, idEvento: 'z', agora: 1, assinar, vistos: new Set() };
assert.equal(verificarWebhook({ ...base, assinatura: 'abcde' }).motivo, 'assinatura inválida');
assert.equal(verificarWebhook({ ...base, assinatura: 'abcdefg' }).motivo, 'assinatura inválida');
assert.equal(base.vistos.size, 0);` }], solution: R`function verificarWebhook({ corpo, assinatura, timestamp, idEvento, agora, assinar, tolerancia = 300, vistos }) {
  if (!assinatura) return { status: 401, motivo: 'sem assinatura' };
  if (Math.abs(agora - timestamp) > tolerancia) return { status: 401, motivo: 'timestamp fora da janela' };
  const esperada = assinar(timestamp + '.' + corpo);
  let dif = esperada.length ^ assinatura.length;
  const n = Math.max(esperada.length, assinatura.length);
  for (let i = 0; i < n; i++) dif |= (esperada.charCodeAt(i) || 0) ^ (assinatura.charCodeAt(i) || 0);
  if (dif !== 0) return { status: 401, motivo: 'assinatura inválida' };
  if (vistos.has(idEvento)) return { status: 200, motivo: 'duplicado' };
  vistos.add(idEvento);
  return { status: 204 };
}
`, explanation: 'O verificador segue a ordem de um webhook seguro: assinatura presente, janela de tempo, comparação em tempo constante sobre o corpo bruto e processamento idempotente.' }
],
'nxt-09': [
  { id: 'nxt-09-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é o papel adequado do proxy (antigo middleware) na autenticação?', options: ['Ser a única verificação de segurança do app', 'Fazer checagens otimistas (por exemplo, redirecionar quem não tem cookie de sessão); a verificação definitiva fica perto do dado', 'Consultar o banco a cada requisição para validar permissões', 'Substituir as Server Actions'], answer: 1, explanation: 'A documentação adverte contra usar o proxy para busca lenta e gerenciamento completo de sessão; ele é uma camada otimista.' },
  { id: 'nxt-09-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o atributo do cookie de sessão ao seu objetivo.', pairs: [['HttpOnly', 'Impedir a leitura por JavaScript (reduz roubo por XSS)'], ['Secure', 'Enviar apenas por HTTPS'], ['SameSite', 'Reduzir CSRF restringindo o envio entre sites'], ['maxAge/expires', 'Limitar o tempo de vida da sessão']], explanation: 'Os atributos reduzem os riscos do cookie que carrega a identidade.' },
  { id: 'nxt-09-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Uma pessoa autenticada consegue ver o pedido de outra apenas trocando o id na URL. Clique na linha que falta verificar a propriedade.', code: 'export async function getPedido(id) {\n  const sessao = await verificarSessao();\n  const pedido = await db.pedidos.buscar(id);\n  return pedido;\n}', answer: 4, explanation: 'Falta checar se o pedido pertence à pessoa (ou se ela tem papel que permita). Esse é o IDOR; devolva null (404) quando não for permitido e retorne um DTO.' },
  { id: 'nxt-09-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Verificar a sessão apenas no layout protege as páginas filhas mesmo nas navegações no cliente.', answer: false, explanation: 'Layouts não renderizam de novo na navegação entre filhas, e Actions e Route Handlers não passam por eles: verifique onde o dado é lido.' },
  { id: 'nxt-09-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §autorizar(sessao, acao, recurso)§ (função pura) que devolve §true§ ou §false§, **negando por padrão**. §sessao§: §{ usuarioId, papel }§ ou nula. §acao§: §"ler"§, §"editar"§, §"excluir"§ ou §"publicar"§. §recurso§: §{ donoId, estado? }§. Regras: sem sessão → §false§; §admin§ → §true§ para qualquer ação em qualquer recurso; §editor§ → §ler§ e §editar§ qualquer recurso e §publicar§ recursos com §estado: "revisado"§; §usuario§ → §ler§ e §editar§ só os próprios (§donoId === usuarioId§), §excluir§ só os próprios com §estado§ diferente de §"publicado"§; papéis ou ações desconhecidos → §false§.', lang: 'javascript', starter: 'function autorizar(sessao, acao, recurso) {\n  // seu código aqui\n}\n', hints: ['Comece com return false e abra exceções explícitas por papel.', 'Compare donoId com sessao.usuarioId.'], tests: [{ name: 'admin, editor e sem sessão', code: R`assert.equal(autorizar(null, 'ler', { donoId: 1 }), false);
assert.equal(autorizar({ usuarioId: 9, papel: 'admin' }, 'excluir', { donoId: 1, estado: 'publicado' }), true);
assert.equal(autorizar({ usuarioId: 2, papel: 'editor' }, 'editar', { donoId: 1 }), true);
assert.equal(autorizar({ usuarioId: 2, papel: 'editor' }, 'excluir', { donoId: 1 }), false);
assert.equal(autorizar({ usuarioId: 2, papel: 'editor' }, 'publicar', { donoId: 1, estado: 'revisado' }), true);
assert.equal(autorizar({ usuarioId: 2, papel: 'editor' }, 'publicar', { donoId: 1, estado: 'rascunho' }), false);` }, { name: 'usuário comum', code: R`const u = { usuarioId: 5, papel: 'usuario' };
assert.equal(autorizar(u, 'ler', { donoId: 5 }), true);
assert.equal(autorizar(u, 'ler', { donoId: 6 }), false);
assert.equal(autorizar(u, 'excluir', { donoId: 5, estado: 'rascunho' }), true);
assert.equal(autorizar(u, 'excluir', { donoId: 5, estado: 'publicado' }), false);
assert.equal(autorizar(u, 'publicar', { donoId: 5, estado: 'revisado' }), false);` }, { name: 'negar por padrão', code: R`assert.equal(autorizar({ usuarioId: 1, papel: 'visitante' }, 'ler', { donoId: 1 }), false);
assert.equal(autorizar({ usuarioId: 1, papel: 'usuario' }, 'teletransportar', { donoId: 1 }), false);
assert.equal(autorizar({ usuarioId: 1, papel: 'usuario' }, 'ler', null), false);` }], solution: R`function autorizar(sessao, acao, recurso) {
  if (!sessao || !recurso) return false;
  const proprio = recurso.donoId === sessao.usuarioId;
  switch (sessao.papel) {
    case 'admin': return ['ler', 'editar', 'excluir', 'publicar'].includes(acao);
    case 'editor': return acao === 'ler' || acao === 'editar' || (acao === 'publicar' && recurso.estado === 'revisado');
    case 'usuario':
      if (acao === 'ler' || acao === 'editar') return proprio;
      if (acao === 'excluir') return proprio && recurso.estado !== 'publicado';
      return false;
    default: return false;
  }
}
`, explanation: 'A autorização é uma função pura do papel, da ação e do recurso, e nega por padrão: fácil de testar e de aplicar na camada de dados.' },
  { id: 'nxt-09-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §casaMatcher(matchers, caminho)§: devolve §true§ se o caminho casa com algum padrão da lista (como o §config.matcher§ do proxy). Padrões: literais (§"/sobre"§) casam o caminho exato; §"/painel/:path*"§ casa §/painel§ **e** qualquer subcaminho (§/painel/a/b§); §"/blog/:slug"§ casa **um** segmento; §":path+"§ no fim casa **um ou mais** segmentos. Ignore a barra final do caminho. Padrão que não comece com §/§ → §Error("padrão inválido: P")§.', lang: 'javascript', starter: 'function casaMatcher(matchers, caminho) {\n  // seu código aqui\n}\n', hints: ['Transforme cada padrão em uma lista de segmentos.', 'Trate :nome*, :nome+ e :nome como casos distintos do último segmento.'], tests: [{ name: 'literais e um segmento', code: R`assert.equal(casaMatcher(['/sobre'], '/sobre'), true);
assert.equal(casaMatcher(['/sobre'], '/sobre/x'), false);
assert.equal(casaMatcher(['/blog/:slug'], '/blog/a'), true);
assert.equal(casaMatcher(['/blog/:slug'], '/blog'), false);
assert.equal(casaMatcher(['/blog/:slug'], '/blog/a/b'), false);` }, { name: 'asterisco e mais', code: R`const m = ['/painel/:path*'];
assert.equal(casaMatcher(m, '/painel'), true);
assert.equal(casaMatcher(m, '/painel/'), true);
assert.equal(casaMatcher(m, '/painel/a/b/c'), true);
assert.equal(casaMatcher(m, '/painelx'), false);
assert.equal(casaMatcher(['/docs/:p+'], '/docs'), false);
assert.equal(casaMatcher(['/docs/:p+'], '/docs/a/b'), true);` }, { name: 'lista e inválido', code: R`assert.equal(casaMatcher(['/a', '/b/:x*'], '/b/1'), true);
assert.equal(casaMatcher(['/a', '/b/:x*'], '/c'), false);
assert.throws(() => casaMatcher(['painel'], '/painel'), 'padrão inválido: painel');` }], solution: R`function casaMatcher(matchers, caminho) {
  const seg = (s) => s.split('/').filter(Boolean);
  const c = seg(caminho);
  return matchers.some((p) => {
    if (!p.startsWith('/')) throw new Error('padrão inválido: ' + p);
    const ps = seg(p);
    for (let i = 0; i < ps.length; i++) {
      const s = ps[i];
      if (/^:\w+\*$/.test(s)) return true;
      if (/^:\w+\+$/.test(s)) return c.length > i;
      if (c[i] === undefined) return false;
      if (!s.startsWith(':') && s !== c[i]) return false;
    }
    return c.length === ps.length;
  });
}
`, explanation: 'O matcher decide em quais rotas o proxy executa; restringi-lo evita rodar o código em arquivos estáticos e em rotas irrelevantes.' }
],
'nxt-10': [
  { id: 'nxt-10-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que o §next/image§ pede §width§ e §height§?', options: ['Para recortar a imagem', 'Para reservar o espaço e evitar a mudança de layout (CLS)', 'Para escolher o formato', 'É apenas decorativo'], answer: 1, explanation: 'Com as dimensões o navegador reserva o espaço antes de a imagem chegar.' },
  { id: 'nxt-10-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'A maior imagem da página (herói) demora a aparecer e prejudica o LCP. Clique na linha da causa.', code: '<Image\n  src="/hero.jpg" alt="Equipe"\n  width={1200} height={630}\n  loading="lazy"\n/>', answer: 4, explanation: 'A imagem acima da dobra que é o maior conteúdo não deve ter carregamento tardio: use loading="eager" e fetchPriority="high".' },
  { id: 'nxt-10-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'No Next 16 a propriedade §priority§ do §Image§ foi depreciada em favor de §preload§.', answer: true, explanation: 'Segundo a documentação do pacote 16.4.6; para a maioria dos casos recomenda-se loading="eager" ou fetchPriority="high".' },
  { id: 'nxt-10-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a configuração e o uso de scripts de terceiros.', code: 'images: { [[0]]: [new URL("https://cdn.exemplo.com/conta123/**")] }\n<Script src="https://chat.exemplo/widget.js" strategy="[[1]]" />', answers: [['remotePatterns'], ['lazyOnload']], explanation: 'remotePatterns autoriza imagens remotas específicas; lazyOnload carrega o widget no ocioso.' },
  { id: 'nxt-10-e5', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §escolherImagem(larguras, larguraCss, dpr)§, que simula a escolha de uma versão do §srcset§. §larguras§ é a lista de larguras disponíveis em pixels (qualquer ordem); a largura necessária é §larguraCss * dpr§ (arredondada para cima). Devolva a **menor** largura disponível **maior ou igual** à necessária; se todas forem menores, devolva a **maior** disponível. Lista vazia ou §larguraCss <= 0§ → §Error("entrada inválida")§. §dpr§ padrão 1.', lang: 'javascript', starter: 'function escolherImagem(larguras, larguraCss, dpr) {\n  // seu código aqui\n}\n', hints: ['Ordene uma cópia da lista (sem alterar a original).', 'Use Math.ceil(larguraCss * dpr).'], tests: [{ name: 'escolha da menor suficiente', code: R`const L = [640, 1080, 384, 1920, 828];
assert.equal(escolherImagem(L, 300), 384);
assert.equal(escolherImagem(L, 300, 2), 640);
assert.equal(escolherImagem(L, 414, 2), 828);
assert.equal(escolherImagem(L, 384), 384);
assert.deepEqual(L, [640, 1080, 384, 1920, 828]);` }, { name: 'maior disponível quando todas são menores', code: R`assert.equal(escolherImagem([320, 640], 1000, 2), 640);
assert.equal(escolherImagem([100], 50.2, 1), 100);` }, { name: 'entrada inválida', code: R`assert.throws(() => escolherImagem([], 100), 'entrada inválida');
assert.throws(() => escolherImagem([100], 0), 'entrada inválida');` }], solution: R`function escolherImagem(larguras, larguraCss, dpr = 1) {
  if (!Array.isArray(larguras) || !larguras.length || !(larguraCss > 0)) throw new Error('entrada inválida');
  const ord = [...larguras].sort((a, b) => a - b);
  const precisa = Math.ceil(larguraCss * dpr);
  return ord.find((l) => l >= precisa) ?? ord[ord.length - 1];
}
`, explanation: 'O atributo sizes e o srcset permitem ao navegador escolher a menor versão que atende à largura necessária (largura CSS vezes a densidade de pixels).' }
],
'nxt-11': [
  { id: 'nxt-11-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'O que NÃO é copiado automaticamente para §.next/standalone§ e precisa ser copiado à parte?', options: ['server.js', 'As dependências necessárias', 'public/ e .next/static/', 'package.json'], answer: 2, explanation: 'O standalone traz o servidor e as dependências rastreadas; public e .next/static devem ser copiados (ou servidos por um CDN).' },
  { id: 'nxt-11-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'É seguro colocar a chave de um serviço pago em §NEXT_PUBLIC_CHAVE§ se o repositório for privado.', answer: false, explanation: 'Variáveis NEXT_PUBLIC_ são substituídas no build e ficam legíveis no JavaScript do cliente para qualquer pessoa, independentemente de o repositório ser privado.' },
  { id: 'nxt-11-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a opção de deploy à característica.', pairs: [['next start em servidor Node', 'Suporta todos os recursos (proxy, ISR, Actions, imagens)'], ['Contêiner com standalone', 'Servidor Node empacotado, adequado a orquestradores'], ['output: "export"', 'Arquivos estáticos sem recursos de servidor'], ['Plataforma gerenciada', 'CDN, escala e cache administrados pelo provedor']], explanation: 'A escolha depende dos recursos usados e do trabalho operacional aceitável.' },
  { id: 'nxt-11-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Liste cinco itens de um checklist de produção para um app Next.js em contêiner e explique o motivo de cada um.', model: 'Exemplos: (1) segredos fora da imagem e do repositório, com variáveis injetadas em tempo de execução e nunca em NEXT_PUBLIC_, para evitar vazamentos; (2) usuário não root e imagem base fixada por versão, para reduzir a superfície de ataque e garantir reprodutibilidade; (3) health check e encerramento gracioso com SIGTERM, para o orquestrador reiniciar ou desviar tráfego sem perdas; (4) cache compartilhado e chave de criptografia das Server Actions estável com várias instâncias, para consistência; (5) logs estruturados, métricas e alertas (taxa de erros e latência), para detectar e diagnosticar problemas; (6) cabeçalhos de segurança (CSP, HSTS) e limites de tamanho de corpo e de taxa, para reduzir abusos; (7) plano de rollback e deploy gradual.', rubric: ['Lista ao menos cinco itens pertinentes', 'Explica o motivo de cada item', 'Inclui segredos e variáveis de ambiente', 'Inclui observabilidade ou health check'], explanation: 'Produção exige segurança, resiliência e visibilidade, não só um build que compila.' },
  { id: 'nxt-11-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarEnv(env, esquema)§. §esquema§ é uma lista de §{ nome, obrigatoria?, tipo?, publica? }§ (§tipo§: §"string"§, §"numero"§ ou §"url"§; padrão §"string"§). Devolva a lista (ordenada) de **problemas** (strings): §"NOME ausente"§ para obrigatórias ausentes ou vazias; §"NOME deve ser número"§ e §"NOME deve ser URL"§ para valores inválidos (só se presentes; URL válida: começa com §http://§ ou §https://§ e tem host); §"NOME é pública mas parece segredo"§ se §publica§ for verdadeiro e o nome (sem o prefixo §NEXT_PUBLIC_§) contiver §SECRET§, §TOKEN§, §PASSWORD§, §PRIVATE§ ou §KEY§ (sem distinguir maiúsculas); §"NOME pública precisa do prefixo NEXT_PUBLIC_"§ se §publica§ for verdadeiro e o nome não começar com o prefixo. Variáveis fora do esquema são ignoradas.', lang: 'javascript', starter: 'function validarEnv(env, esquema) {\n  // seu código aqui\n}\n', hints: ['Cada regra gera uma string; ao final ordene com sort().', 'Para a URL basta uma expressão regular simples (protocolo e host).'], tests: [{ name: 'ausentes e tipos', code: R`const esq = [{ nome: 'DATABASE_URL', obrigatoria: true, tipo: 'url' }, { nome: 'PORT', tipo: 'numero' }, { nome: 'SEGREDO', obrigatoria: true }];
assert.deepEqual(validarEnv({ DATABASE_URL: 'postgres://x', PORT: 'abc', SEGREDO: '' }, esq), ['DATABASE_URL deve ser URL', 'PORT deve ser número', 'SEGREDO ausente']);
assert.deepEqual(validarEnv({ DATABASE_URL: 'https://db.exemplo.com/x', PORT: '3000', SEGREDO: 's' }, esq), []);
assert.deepEqual(validarEnv({}, [{ nome: 'A', obrigatoria: true }, { nome: 'B' }]), ['A ausente']);` }, { name: 'variáveis públicas', code: R`const esq = [{ nome: 'NEXT_PUBLIC_API_KEY', publica: true }, { nome: 'NEXT_PUBLIC_SITE', publica: true, tipo: 'url' }, { nome: 'SITE_URL', publica: true }];
assert.deepEqual(validarEnv({ NEXT_PUBLIC_API_KEY: 'x', NEXT_PUBLIC_SITE: 'https://a.com', SITE_URL: 'https://a.com' }, esq), ['NEXT_PUBLIC_API_KEY é pública mas parece segredo', 'SITE_URL pública precisa do prefixo NEXT_PUBLIC_']);` }, { name: 'ignora o que está fora do esquema', code: R`assert.deepEqual(validarEnv({ QUALQUER: '1' }, []), []);
assert.deepEqual(validarEnv({ N: '12.5' }, [{ nome: 'N', tipo: 'numero' }]), []);` }], solution: R`function validarEnv(env, esquema) {
  const p = [];
  for (const { nome, obrigatoria, tipo = 'string', publica } of esquema) {
    const v = env[nome];
    const presente = v !== undefined && v !== '';
    if (obrigatoria && !presente) p.push(nome + ' ausente');
    if (presente && tipo === 'numero' && !(v.trim() !== '' && Number.isFinite(Number(v)))) p.push(nome + ' deve ser número');
    if (presente && tipo === 'url' && !/^https?:\/\/[^\s/]+/.test(v)) p.push(nome + ' deve ser URL');
    if (publica) {
      if (!nome.startsWith('NEXT_PUBLIC_')) p.push(nome + ' pública precisa do prefixo NEXT_PUBLIC_');
      else if (/SECRET|TOKEN|PASSWORD|PRIVATE|KEY/i.test(nome.slice('NEXT_PUBLIC_'.length))) p.push(nome + ' é pública mas parece segredo');
    }
  }
  return p.sort();
}
`, explanation: 'Validar as variáveis na inicialização evita descobrir configurações ausentes em produção e ajuda a flagrar segredos expostos por engano com NEXT_PUBLIC_.' }
]
};

const P = 'nextjs-p';
export const assessment = {
  id: 'nextjs', title: 'Avaliação final — Next.js: aplicações full stack com React', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o arquivo de convenção do App Router ao papel.', pairs: [['page', 'Torna a rota pública e define sua interface'], ['layout', 'Interface compartilhada que preserva estado'], ['loading', 'Fronteira de Suspense do segmento'], ['route', 'Endpoint HTTP em vez de página']], explanation: 'Convenções de arquivos montam a árvore de interface de cada segmento.' },
    { id: P + '2', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual das opções NÃO atravessa a fronteira de um Server Component para um Client Component como prop?', options: ['Um objeto simples com strings e números', 'Uma função comum (arrow function)', 'Um Date', 'Um array de objetos simples'], answer: 1, explanation: 'Funções comuns não são serializáveis (apenas Server Actions).' },
    { id: P + '3', type: 'tf', difficulty: 2, points: 10, prompt: 'Com §cacheComponents§, dados que dependem da requisição devem ficar dentro de um §<Suspense>§ para que o shell estático seja enviado de imediato.', answer: true, explanation: 'O fallback faz parte do shell e a parte dinâmica é transmitida depois (medido: primeiro byte em 17 ms).' },
    { id: P + '4', type: 'bug', difficulty: 3, points: 10, prompt: 'Pessoas diferentes veem o carrinho umas das outras. Clique na linha da causa.', code: 'async function getCarrinho() {\n  "use cache";\n  cacheLife("minutes");\n  return db.carrinhos.buscar(usuarioAtual());\n}', answer: 4, explanation: 'O cache é compartilhado e a entrada não inclui o usuário; dados pessoais não devem ser cacheados assim (ou o id deve entrar como argumento).' },
    { id: P + '5', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas de um servidor de produção.', code: 'GET /api/ola?n=Ana          -> {"ola":"Ana"}\nPOST /api/ola (corpo inválido) -> ? \nPOST /api/ola {"a":1}        -> ?', lang: 'text', steps: [{ q: 'Código HTTP do POST com corpo inválido:', answers: ['400'] }, { q: 'Código HTTP do POST válido (recurso criado):', answers: ['201'] }], explanation: 'O handler devolveu 400 para JSON inválido e 201 para o recebido.' },
    { id: P + '6', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a invalidação depois de uma mutação em uma Server Action, com leitura imediata da própria escrita.', code: "'use server';\nimport { updateTag } from 'next/cache';\nexport async function criar(fd) { await db.criar(fd); [[0]]('posts'); }", answers: [['updateTag']], explanation: 'updateTag expira a tag imediatamente em Server Actions, para a pessoa ver a própria escrita.' },
    { id: P + '7', type: 'mc', difficulty: 3, points: 10, prompt: 'SEGURANÇA — Uma Server Action §excluirPedido(id)§ só tem o botão visível para administradores. Qual é a correção correta?', options: ['Nenhuma: o botão escondido já protege', 'Dentro da Action, autenticar, verificar a autorização sobre aquele pedido e validar o id, pois ela é alcançável por POST direto', 'Mover o botão para um Client Component', 'Desativar o proxy'], answer: 1, explanation: 'Actions são endpoints públicos; autenticação, autorização e validação precisam estar dentro de cada uma.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'SEGURANÇA — Uma chave de API de um serviço pago foi colocada em §NEXT_PUBLIC_API_KEY§ e a aplicação foi publicada. O que ocorre?', options: ['Nada: variáveis NEXT_PUBLIC_ ficam só no servidor', 'A chave foi inserida no JavaScript do cliente no build e está visível a qualquer pessoa; é preciso rotacionar a chave e mover o uso para o servidor', 'A chave é criptografada automaticamente', 'Só administradores veem a chave'], answer: 1, explanation: 'NEXT_PUBLIC_ é substituída no build e fica no pacote do cliente.' },
    { id: P + '9', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a situação à solução.', pairs: [['Modal de foto com URL compartilhável', 'Rota paralela com rota interceptada'], ['Atualizar o conteúdo ao receber um webhook do CMS', 'Route Handler com revalidateTag'], ['Componente de mapa pesado e raro', 'next/dynamic'], ['Fonte sem mudança de layout e sem terceiros em execução', 'next/font']], explanation: 'Cada recurso resolve um problema específico.' },
    { id: P + '10', type: 'tf', difficulty: 2, points: 10, prompt: 'No Next 16, o arquivo §middleware§ passou a se chamar §proxy§ e deve ser usado principalmente para verificações otimistas e leves.', answer: true, explanation: 'Conforme a documentação do pacote 16.4.6; a verificação definitiva fica perto do dado.' },
    { id: P + '11', type: 'mc', difficulty: 3, points: 10, prompt: 'DECISÃO — Um catálogo com 80 mil produtos é editado em um CMS e precisa publicar mudanças em segundos, sem aumentar muito o tempo de build. Qual a estratégia mais adequada?', options: ['Renderizar tudo por requisição (SSR) sem cache', 'Gerar tudo no build a cada mudança', 'Cache com tags (use cache + cacheTag), pré-gerar os mais acessados, deixar o resto sob demanda e invalidar por webhook com revalidateTag', 'Exportação estática do catálogo inteiro'], answer: 2, explanation: 'Tags e webhook dão frescor em segundos, e a geração sob demanda mantém o build curto.' },
    { id: P + '12', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva como proteger uma área administrativa em um app Next.js (proxy, camada de dados, cookies e Server Actions), apontando o erro mais comum.', model: 'O proxy faz uma checagem otimista (se não houver cookie de sessão, redireciona para o login) com matcher restrito às rotas da área. A verificação definitiva ocorre em uma camada de acesso a dados server-only, chamada por páginas, Server Actions e Route Handlers, que valida a sessão (assinatura, expiração, revogação) e autoriza a ação sobre o recurso, negando por padrão e devolvendo DTOs mínimos. O cookie de sessão usa HttpOnly, Secure, SameSite e expiração curta, e nunca fica em localStorage. Cada Server Action autentica, autoriza e valida a entrada, pois é um endpoint público. O erro mais comum é confiar só no proxy ou só no layout, deixando Actions e Route Handlers desprotegidos e permitindo IDOR por troca de id.', rubric: ['Descreve o proxy como checagem otimista com matcher', 'Descreve a camada de dados com sessão e autorização', 'Cita atributos do cookie e Server Actions seguras', 'Aponta o erro comum (proteger só proxy ou layout, IDOR)'], explanation: 'A segurança em camadas, com a verificação definitiva perto do dado, evita as falhas mais frequentes.' }
  ]
};

export const project = {
  id: 'loja-full-stack', name: 'Loja (ou blog) full stack com App Router, Server Actions, autenticação, cache com revalidação e deploy em contêiner', lv: 'A', stack: 'Next.js 16, React 19, TypeScript, banco de dados à escolha, Docker', ds: ['next'],
  desc: 'Construa uma **loja (ou blog) full stack** com o **App Router**: catálogo e páginas de produto com **cache e revalidação por tags**, **busca e filtros pela URL**, **área autenticada** com sessão em cookie seguro, **Server Actions** para carrinho e cadastro, **Route Handler** com webhook assinado, **imagens e fontes otimizadas** e **deploy em contêiner** com a saída standalone (documentado). O projeto exercita rotas, Server e Client Components, cache, mutações, segurança e produção.',
  rf: ['Rotas: página inicial, listagem com filtros e página na URL, página de produto dinâmica com generateStaticParams para os mais acessados e generateMetadata, rota not-found, loading e error por segmento', 'Server Components para catálogo e produto; Client Components só nas folhas interativas (carrinho, filtros) e provedores profundos', 'Cache Components: funções use cache com cacheLife e cacheTag (produtos), partes dinâmicas (estoque, recomendações) em Suspense com fallbacks de altura reservada', 'Server Actions para adicionar ao carrinho, finalizar pedido e cadastrar, com autenticação, autorização do recurso, validação no servidor, erros por campo, useActionState e botão pendente', 'Autenticação: login e logout, sessão em cookie HttpOnly, Secure e SameSite, camada de acesso a dados server-only e proxy com matcher para checagem otimista', 'Route Handler de webhook (CMS ou pagamento) com verificação HMAC do corpo bruto, janela de tempo, idempotência e revalidateTag', 'next/image com dimensões, sizes e remotePatterns, next/font e um script de terceiros com estratégia lazyOnload', 'Dockerfile multiestágio com standalone, usuário não root, rota de saúde, validação de variáveis na inicialização e README de deploy'],
  rnf: ['Nenhum segredo em variáveis NEXT_PUBLIC_ nem na imagem ou no repositório', 'Nenhum dado pessoal em funções use cache sem o id na chave', 'Todas as Actions e handlers verificam sessão e permissão; sem confiar em campos ocultos', 'Props de servidor para cliente serializáveis e mínimas (DTOs)', 'TypeScript estrito e validação de entrada por esquema', 'README com a tabela de rotas do build, a estratégia de cache e a árvore de decisão aplicada'],
  ac: ['A tabela do next build mostra as rotas esperadas (○, ●, ◐, ƒ) e o README explica cada símbolo', 'curl comprova Cache-Control de uma rota estática e de uma dinâmica e o tempo até o primeiro byte do shell', 'Um teste prova que a Action rejeita pessoa não autenticada (401) e pessoa sem permissão sobre o pedido (404)', 'Um teste prova que o webhook com assinatura inválida ou timestamp antigo é rejeitado e o evento duplicado não é reprocessado', 'O proxy redireciona /conta sem cookie e não roda em arquivos estáticos (matcher)', 'A imagem do herói usa carregamento antecipado e as demais são lazy, sem mudança de layout', 'O contêiner sobe, responde à rota de saúde e roda como usuário não root; o relatório lista o que não foi testado'],
  ch: ['Adicionar paginação infinita no catálogo com Client Component e TanStack Query hidratado (C2.4)', 'Adicionar internacionalização e mensagens de erro localizadas', 'Medir o projeto com Lighthouse e web-vitals e registrar antes e depois (C2.7)', 'Adicionar testes de componente e um fluxo E2E de compra (C2.6)', 'Extensão: trocar o armazenamento do cache por um cache handler compartilhado e testar com duas instâncias']
};
