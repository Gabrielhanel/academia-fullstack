// C2.7 — Performance frontend. Aulas 1 a 3 (Core Web Vitals; ferramentas de medição; caminho crítico e prioridades).
const R = String.raw;

export const REF = {
  vitals: { title: 'web.dev — Web Vitals', url: 'https://web.dev/articles/vitals', kind: 'doc' },
  lcp: { title: 'web.dev — Largest Contentful Paint (LCP)', url: 'https://web.dev/articles/lcp', kind: 'doc' },
  inp: { title: 'web.dev — Interaction to Next Paint (INP)', url: 'https://web.dev/articles/inp', kind: 'doc' },
  cls: { title: 'web.dev — Cumulative Layout Shift (CLS)', url: 'https://web.dev/articles/cls', kind: 'doc' },
  lighthouse: { title: 'Chrome for Developers — Lighthouse (visão geral)', url: 'https://developer.chrome.com/docs/lighthouse/overview', kind: 'doc' },
  crux: { title: 'Chrome for Developers — Chrome UX Report (CrUX)', url: 'https://developer.chrome.com/docs/crux', kind: 'doc' },
  webVitalsLib: { title: 'web-vitals (GitHub)', url: 'https://github.com/GoogleChrome/web-vitals', kind: 'doc' },
  devtoolsPerf: { title: 'Chrome DevTools — Performance', url: 'https://developer.chrome.com/docs/devtools/performance', kind: 'doc' },
  fieldLab: { title: 'web.dev — Lab and field data', url: 'https://web.dev/articles/lab-and-field-data-differences', kind: 'doc' },
  critical: { title: 'MDN — Critical rendering path', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path', kind: 'doc' },
  fetchPriority: { title: 'web.dev — Fetch Priority', url: 'https://web.dev/articles/fetch-priority', kind: 'doc' },
  preload: { title: 'MDN — rel=preload', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload', kind: 'doc' },
  preconnect: { title: 'MDN — rel=preconnect', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preconnect', kind: 'doc' },
  renderBlocking: { title: 'web.dev — Eliminate render-blocking resources', url: 'https://developer.chrome.com/docs/lighthouse/performance/render-blocking-resources', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'pfe-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['Core Web Vitals', 'LCP', 'INP', 'CLS', 'laboratório', 'campo', 'p75'],
  title: 'Core Web Vitals: LCP, INP e CLS, e a diferença entre dados de laboratório e de campo',
  objectives: ['Definir LCP, INP e CLS, seus limiares (bom, precisa melhorar, ruim) e o que cada um representa para a pessoa usuária', 'Explicar por que os Core Web Vitals são avaliados no percentil 75 dos dados de campo', 'Distinguir dados de laboratório (sintéticos, reprodutíveis) de dados de campo (usuários reais, variados)', 'Identificar as causas típicas de cada métrica ruim e o primeiro passo de diagnóstico', 'Interpretar valores medidos em um navegador (CLS e duração de interação)'],
  intro: `"O site está lento" não é um diagnóstico. Desempenho precisa ser **medido**, com **métricas** que correspondam à **experiência** de quem usa. O Google e a comunidade web convergiram em três **Core Web Vitals**: **LCP** (quando o conteúdo principal aparece), **INP** (quão rápido a página responde às interações) e **CLS** (quanto o layout "pula"). Elas têm **limiares** públicos e influenciam a experiência e a busca. Esta aula define cada uma, mostra como são avaliadas e **mede** duas delas em Chrome 157 (CLS e duração de interação) em páginas de teste do laboratório.`,
  theory: `### As três métricas
- **LCP (Largest Contentful Paint)**: tempo até o **maior elemento visível** (geralmente imagem de destaque ou bloco de texto) ser desenhado. Representa o **carregamento percebido**. Limiares (web.dev): **bom ≤ 2,5 s**, **ruim > 4 s**;
- **INP (Interaction to Next Paint)**: **latência das interações** (clique, toque, tecla) ao longo da visita: do gesto até a **próxima pintura** que reflete o resultado. Considera **todas** as interações e reporta aproximadamente a **pior** (ou o percentil 98 em visitas com muitas). Representa a **responsividade**. Limiares: **bom ≤ 200 ms**, **ruim > 500 ms**. Substituiu o FID como métrica de responsividade;
- **CLS (Cumulative Layout Shift)**: soma de **mudanças inesperadas de layout** (pontuadas pela fração da tela afetada vezes a distância movida), agrupadas em **janelas de sessão**; vale a **pior janela**. Representa a **estabilidade visual** (clicar no botão errado porque algo se moveu). Limiares: **bom ≤ 0,1**, **ruim > 0,25**.
Outras métricas úteis (não são "core"): **TTFB** (primeiro byte), **FCP** (primeiro conteúdo), **TBT** (tempo total de bloqueio, proxy de laboratório para a responsividade), **Speed Index**.

### Percentil 75 e dados de campo
A avaliação oficial usa **dados de campo** (usuários reais) no **percentil 75**: para ser "bom", **75% das visitas** devem estar dentro do limiar, por tipo de dispositivo (celular e computador). A média esconde as caudas e os extremos puxam; o p75 reflete a experiência de **quase todos** sem ser dominado por casos raros. O desafio de código da aula classifica uma métrica por limiares e outro (aula 2) calcula o percentil.

### Laboratório x campo
| | Laboratório | Campo |
|---|---|---|
| Origem | execução controlada (Lighthouse, DevTools) | pessoas reais (CrUX, RUM) |
| Vantagens | reprodutível, depurável, antes do deploy, rico em detalhes | reflete rede, aparelhos e comportamento reais, mede INP |
| Limites | não vê a variedade real; INP depende de interação; configuração artificial | só diz **que** há problema, menos **por quê**; atrasado; exige volume |
| Uso | **encontrar causas e prevenir regressões** | **medir o resultado e priorizar** |
Os dois se complementam: o campo diz onde está o problema; o laboratório ajuda a reproduzir e consertar.

### O que foi medido (Chrome 157, páginas de teste do laboratório)
§§§
imagem sem width/height (carrega depois do texto, tela de 390 px): CLS = 0,012 | LCP = 628 ms
mesma página com width e height na imagem:                         CLS = 0     | LCP = 592 ms
clique cujo manipulador ocupa a thread por 350 ms:                 duração da interação = 368 ms (> 200 ms: ruim para INP)
clique com manipulador curto e trabalho em fatias de 50 ms:        nenhum evento acima de 16 ms
§§§
O CLS pequeno (0,012) corresponde a uma imagem que empurra um parágrafo e um botão em uma tela estreita; telas reais com anúncios e conteúdo injetado chegam a valores muito maiores. A interação de 368 ms **fica ruim para INP** porque o navegador só pode **pintar** a resposta depois que o manipulador termina.

### Causas típicas e primeiros passos
- **LCP alto**: servidor lento (TTFB), **recursos que bloqueiam a renderização** (CSS e scripts), imagem principal descoberta tarde ou sem prioridade, imagem pesada, renderização no cliente que espera JavaScript (aulas 3 a 5). Passo 1: descobrir **qual elemento** é o LCP e **em que fase** o tempo se perde (TTFB, atraso de carregamento, duração, atraso de renderização);
- **INP alto**: **tarefas longas** na thread principal (JavaScript pesado, renderização de listas grandes), manipuladores que fazem muito trabalho, hidratação, scripts de terceiros (aula 6). Passo 1: gravar a interação no DevTools e ver as **três fases** (atraso de entrada, processamento, atraso de apresentação);
- **CLS alto**: imagens, anúncios e iframes **sem dimensões**, **fontes** que trocam e mudam o texto, conteúdo inserido **acima** do que já está na tela, animações que alteram o layout (aula 5). Passo 1: ativar o destaque de mudanças de layout e identificar os elementos que se moveram.

### Medir na prática
Lighthouse e DevTools (laboratório, aula 2), a biblioteca **web-vitals** no seu site (campo, aula 8) e o **CrUX** (dados públicos de campo do Chrome) para comparar. Em ambiente de desenvolvimento, o **PerformanceObserver** expõe as entradas de §layout-shift§, §largest-contentful-paint§ e §event§ usadas nas medições acima.

### Cuidados com a interpretação
- Valores de laboratório **variam** entre execuções (a mesma página rodou com TBT de 0 a 90 ms): use várias execuções e mediana;
- Uma métrica boa **não garante** uma boa experiência (e vice-versa): olhe também erros, acessibilidade e conversão;
- Desempenho é **por dispositivo e rede**: um celular modesto em rede 4G é o cenário comum de usuários reais, não o seu notebook;
- Defina **metas** (orçamento e SLO, aula 8) em vez de perseguir uma nota.

### Relação com negócio e SEO
Páginas mais rápidas **convertem melhor** e retêm mais; a experiência de página entra como sinal na busca. Mas o conteúdo e a relevância pesam mais do que a nota: otimize para as pessoas.`,
  concepts: [
    { term: 'LCP', def: 'Largest Contentful Paint: tempo até o maior elemento de conteúdo visível ser desenhado (bom até 2,5 s).' },
    { term: 'INP', def: 'Interaction to Next Paint: latência das interações até a próxima pintura (bom até 200 ms).' },
    { term: 'CLS', def: 'Cumulative Layout Shift: soma de mudanças inesperadas de layout (bom até 0,1).' },
    { term: 'Percentil 75 (p75)', def: 'Valor abaixo do qual está 75% das amostras; base da avaliação dos Core Web Vitals.' },
    { term: 'Dados de laboratório', def: 'Medições em ambiente controlado e reprodutível.' },
    { term: 'Dados de campo', def: 'Medições coletadas de pessoas reais usando o site.' },
    { term: 'TTFB', def: 'Time to First Byte: tempo até o primeiro byte da resposta.' },
    { term: 'TBT', def: 'Total Blocking Time: soma do tempo que excede 50 ms nas tarefas longas, proxy de laboratório para a responsividade.' },
    { term: 'PerformanceObserver', def: 'API do navegador que entrega entradas de desempenho (layout-shift, LCP, eventos).' }
  ],
  examples: R`**Analogia:** os Core Web Vitals são como o **atendimento de um restaurante**: o LCP é "quanto demorou até o prato principal chegar"; o INP é "quão rápido o garçom reage quando você faz um sinal"; o CLS é "quantas vezes trocaram sua mesa de lugar enquanto você comia". O p75 é a avaliação de 3 em cada 4 clientes, não a média nem o cliente mais exigente.

**Resultados medidos (Chrome 157, viewport de 390 px, PerformanceObserver):**
§§§
cls-ruim.html:   CLS 0,012 | LCP 628 ms     (imagem sem dimensões)
cls-bom.html:    CLS 0     | LCP 592 ms     (width e height informados)
inp-lento.html:  eventos de interação: 368 ms (laço de 350 ms no clique)
inp-dividido.html: nenhum evento acima do limiar de 16 ms
§§§

**Cenário ilustrativo (não medido):** o p75 de LCP de um site era 3,9 s em celulares, embora a equipe medisse 1,8 s no notebook. Os dados de campo mostraram o problema (rede e aparelho reais); o laboratório, configurado com o perfil móvel, reproduziu a causa (imagem principal descoberta tarde) e a correção foi validada nos dois.`,
  code: [
    { title: 'Medindo CLS e interações com PerformanceObserver (executado no Chrome)', lang: 'js', code: R`let cls = 0;
new PerformanceObserver((lista) => {
  for (const e of lista.getEntries()) if (!e.hadRecentInput) cls += e.value;   // ignora mudanças após interação
}).observe({ type: 'layout-shift', buffered: true });

const duracoes = [];
new PerformanceObserver((lista) => {
  for (const e of lista.getEntries()) if (e.interactionId) duracoes.push(Math.round(e.duration));
}).observe({ type: 'event', durationThreshold: 16, buffered: true });`, notes: [{ l: '3', t: 'Mudanças causadas por interação recente da pessoa não contam para o CLS.' }, { l: '9', t: 'event com interactionId: as interações que compõem o INP (medido: 368 ms).' }] },
    { title: 'Registrando LCP no laboratório', lang: 'js', code: R`new PerformanceObserver((lista) => {
  const ultima = lista.getEntries().at(-1);              // o candidato mais recente
  console.log('LCP', Math.round(ultima.startTime), 'ms', ultima.element);
}).observe({ type: 'largest-contentful-paint', buffered: true });`, notes: [{ l: '2', t: 'O LCP pode mudar enquanto a página carrega: vale o último candidato antes da interação.' }, { l: '3', t: 'element mostra qual elemento é o LCP: primeiro passo do diagnóstico.' }] }
  ],
  bestPractices: ['Defina metas por métrica e por tipo de dispositivo.', 'Use o p75 de dados de campo para avaliar e o laboratório para diagnosticar.', 'Descubra o elemento e a fase responsáveis antes de otimizar.', 'Faça várias medições e use a mediana.', 'Teste em perfil de celular modesto e rede lenta.', 'Acompanhe as métricas depois de cada publicação.'],
  mistakes: ['Avaliar pela média em vez do p75.', 'Confiar só no notebook do desenvolvedor.', 'Otimizar a nota do Lighthouse e não a experiência.', 'Comparar uma execução de laboratório com outra sem repetir.', 'Ignorar o INP por ser difícil de medir em laboratório.', 'Deixar imagens e anúncios sem dimensões.'],
  market: `Core Web Vitals aparecem em pautas de produto, SEO e engenharia, e perguntas sobre LCP, INP e CLS (e a diferença entre laboratório e campo) são comuns em entrevistas de frontend. Pessoas que medem antes de otimizar e sabem diagnosticar a fase responsável entregam resultados verificáveis.`,
  summary: `Os Core Web Vitals são LCP (carregamento, bom até 2,5 s), INP (responsividade, bom até 200 ms) e CLS (estabilidade visual, bom até 0,1), avaliados no p75 de dados de campo. Dados de laboratório são reprodutíveis e servem ao diagnóstico; dados de campo mostram a experiência real e priorizam o trabalho. Medido no Chrome 157: imagem sem dimensões gerou CLS 0,012; um manipulador de 350 ms gerou uma interação de 368 ms. Descubra o elemento e a fase antes de otimizar.`,
  refs: [REF.vitals, REF.lcp, REF.inp, REF.cls, REF.fieldLab],
  cards: [
    { q: 'Quais são os limiares "bom" de LCP, INP e CLS?', a: 'LCP até 2,5 s; INP até 200 ms; CLS até 0,1.' },
    { q: 'Por que usar o percentil 75?', a: 'Reflete a experiência de quase todos sem ser dominado por extremos; 75% das visitas devem estar dentro do limiar.' },
    { q: 'Qual a diferença entre dados de laboratório e de campo?', a: 'Laboratório é controlado e reprodutível (diagnóstico); campo vem de pessoas reais (resultado e prioridade).' },
    { q: 'O que causa um INP ruim?', a: 'Tarefas longas na thread principal: JavaScript pesado, manipuladores lentos, hidratação e scripts de terceiros.' }
  ]
},
{
  id: 'pfe-02', moduleId: 'm1', order: 2, minutes: 65, tags: ['Lighthouse', 'CrUX', 'web-vitals', 'DevTools', 'medição', 'variação'],
  title: 'Ferramentas de medição: Lighthouse, CrUX, a biblioteca web-vitals e como interpretar a variação',
  objectives: ['Executar e interpretar o Lighthouse (nota, métricas e oportunidades) e reconhecer seus limites', 'Usar o CrUX e a biblioteca web-vitals para obter dados de campo', 'Explicar a variação entre execuções e como reduzi-la (repetição, mediana, ambiente fixo)', 'Escolher a ferramenta certa para cada pergunta (diagnóstico, regressão, campo)', 'Calcular percentis (p75) e classificar métricas a partir de amostras'],
  intro: `Ferramentas diferentes respondem a perguntas diferentes: o **Lighthouse** audita uma página em condições simuladas (laboratório); o **CrUX** (Chrome UX Report) publica dados de campo de pessoas reais que usam o Chrome; a biblioteca **web-vitals** mede as métricas **no seu site** e as envia ao seu backend; o **DevTools** deixa investigar a causa. Esta aula ensina a usar e **interpretar** cada uma, com resultados reais: executamos o Lighthouse 13.6 quatro vezes em duas páginas e registramos as notas, as métricas e a **variação** entre execuções.`,
  theory: `### Lighthouse
O Lighthouse (DevTools, linha de comando, módulo Node ou Lighthouse CI) carrega a página em um Chrome controlado, com **perfil móvel e throttling simulado** por padrão, e produz: a **nota de desempenho (0 a 100)**, as métricas (FCP, LCP, TBT, CLS, Speed Index), **diagnósticos** e **oportunidades** com estimativa de ganho. Pontos importantes:
- é **laboratório**: não mede INP real (usa o TBT como proxy) e vê só o carregamento inicial (a menos que use o modo de **intervalo de tempo** ou de **navegação por etapas**);
- a nota é uma **combinação ponderada** das métricas: serve de **resumo**, não de meta;
- o **throttling simulado** calcula o resultado a partir de um carregamento rápido e de um modelo, o que dá resultados reprodutíveis e **diferentes** dos de rede real;
- extensões do navegador, aba aberta e CPU ocupada **alteram** o resultado: use perfil limpo ou a linha de comando.
Medido neste curso (Lighthouse 13.6.0, Chrome 157 sem interface, perfil móvel padrão), duas páginas e quatro execuções:
§§§
ruim | nota 92  | FCP 2,7 s | LCP 2,7 s | CLS 0 | TBT 30 ms | Speed Index 2,7 s
bom  | nota 100 | FCP 0,6 s | LCP 1,2 s | CLS 0 | TBT 90 ms | Speed Index 1,2 s
ruim | nota 93  | FCP 2,6 s | LCP 2,6 s | CLS 0 | TBT 0 ms  | Speed Index 2,6 s
bom  | nota 100 | FCP 0,6 s | LCP 1,2 s | CLS 0 | TBT 30 ms | Speed Index 1,1 s
§§§
Observações: (1) a página "ruim" (CSS e script bloqueantes e imagem sem prioridade) teve FCP/LCP de **2,6 a 2,7 s** contra **0,6 e 1,2 s** na "boa"; (2) a **nota** quase não diferiu (92-93 contra 100), mas o **tempo** diferiu mais de **2x**: a nota ponderada esconde a diferença: leia as **métricas**; (3) o **TBT** da mesma página variou de **30 para 90 ms** (e de 0 para 30) entre execuções: **ruído**; (4) o CLS foi 0 nas duas, provavelmente porque, nessa página, a imagem chegou antes da primeira pintura (o bloqueio atrasou tudo; a causa não foi isolada); mudanças de layout só contam **depois** do primeiro desenho.

### CrUX (dados de campo públicos)
O **Chrome UX Report** reúne métricas de visitas reais ao seu **origem** ou **URL** (para sites com tráfego suficiente), no período de 28 dias, por dispositivo e conexão, com distribuição em **bom / precisa melhorar / ruim** e o **p75**. Acesso: **PageSpeed Insights** (mostra campo e laboratório lado a lado), **API do CrUX**, **BigQuery** e o painel do **Search Console**. Limitação: sites pequenos não têm dados; é **atrasado** (28 dias) e agregado; cobre só o Chrome.

### A biblioteca web-vitals (campo no seu site)
§§§
import { onLCP, onINP, onCLS } from 'web-vitals';
function enviar(metrica) { navigator.sendBeacon('/api/vitals', JSON.stringify({ nome: metrica.name, valor: metrica.value, id: metrica.id, avaliacao: metrica.rating })); }
onLCP(enviar); onINP(enviar); onCLS(enviar);
§§§
Cada callback recebe §name§, §value§, §rating§ (bom, precisa melhorar, ruim), §id§, e a build **de atribuição** (§web-vitals/attribution§) informa o **elemento** e a **fase** responsáveis. §sendBeacon§ envia mesmo ao fechar a página. Envie com **amostragem**, inclua **contexto** (rota, dispositivo, versão do app) e respeite a **privacidade** (sem dados pessoais). A aula 8 usa isso como RUM.

### DevTools
- **Performance**: grava a atividade (linha do tempo, tarefas longas, LCP e CLS marcados, o que a thread principal fez);
- **Network**: cascata de requisições, prioridade, tempo de cada fase, simulação de rede e CPU (§throttling§);
- **Lighthouse** integrado; **Coverage** (código não usado); **Rendering** (destaque de mudanças de layout);
- Use o **throttling de CPU** (4x ou 6x) para simular aparelhos modestos.

### Outras ferramentas
**WebPageTest** (cascata e filmstrip em dispositivos e redes reais), **Lighthouse CI** (regressões no pull request, aula 8), analisadores de pacote (aula 4), **Profiler do React** (aula 7), serviços de **RUM** comerciais.

### Reduzir a variação
Rode **várias vezes** (3 a 5) e use a **mediana**; mantenha **o mesmo ambiente** (mesma máquina, perfil, versão do Chrome); evite concorrência na máquina; compare **antes e depois no mesmo método**; use dados de campo para tendências. Se a diferença é menor que a **variação entre execuções**, ela **não** é um resultado.

### Percentis
Para resumir amostras de campo (p75, p95): ordene e escolha o valor na posição §ceil(p/100 * n)§ (método do posto mais próximo). Com 10 amostras ordenadas, o p75 é o 8º valor. A **média** pode estar distante (as caudas a puxam). O desafio de código implementa o percentil e a classificação por limiares.

### Qual ferramenta para qual pergunta
| Pergunta | Ferramenta |
|---|---|
| Qual a experiência real das pessoas? | CrUX, PageSpeed Insights (campo), RUM |
| Por que esta página está lenta? | DevTools, Lighthouse, WebPageTest |
| Esta mudança piorou o desempenho? | Lighthouse CI com orçamentos |
| Quem sofre mais (rota, país, dispositivo)? | RUM com web-vitals e atribuição |
| O pacote cresceu? | analisador de pacote e limite de tamanho |`,
  concepts: [
    { term: 'Lighthouse', def: 'Ferramenta de auditoria que mede desempenho, acessibilidade e boas práticas em laboratório.' },
    { term: 'Throttling simulado', def: 'Modelo que estima o carregamento em rede e CPU lentas a partir de uma execução rápida.' },
    { term: 'CrUX', def: 'Chrome UX Report: dados públicos de campo de visitas reais no Chrome.' },
    { term: 'PageSpeed Insights', def: 'Serviço que mostra dados de campo (CrUX) e de laboratório (Lighthouse) de uma URL.' },
    { term: 'web-vitals', def: 'Biblioteca que mede LCP, INP, CLS e outras métricas no navegador das pessoas usuárias.' },
    { term: 'RUM', def: 'Real User Monitoring: monitoramento de desempenho com dados de usuários reais.' },
    { term: 'sendBeacon', def: 'API que envia dados ao servidor de forma assíncrona, inclusive ao fechar a página.' },
    { term: 'Atribuição', def: 'Informação sobre o elemento e a fase responsáveis por uma métrica ruim.' },
    { term: 'Mediana', def: 'Valor central de uma lista ordenada, menos sensível a extremos que a média.' }
  ],
  examples: R`**Analogia:** o Lighthouse é o **teste de direção** na pista da autoescola (condições controladas, repetíveis); o CrUX é a **estatística de acidentes** da cidade (o que acontece de verdade, com atraso); o web-vitals é o **registro do seu próprio carro**; o DevTools é a **oficina** onde você abre o motor. Um teste na pista não prova que a rua real é segura, e a estatística não diz qual peça quebrou.

**Resultados medidos (Lighthouse 13.6.0, Chrome 157, 4 execuções):**
§§§
ruim: nota 92 e 93 | LCP 2,7 s e 2,6 s | TBT 30 ms e 0 ms
bom:  nota 100 e 100 | LCP 1,2 s e 1,2 s | TBT 90 ms e 30 ms
§§§
A nota variou 1 ponto, o tempo de LCP diferiu mais de 2x entre as páginas e o TBT variou 60 ms na mesma página: leia as métricas e repita as execuções.

**Cenário ilustrativo (não medido):** uma equipe comemorou subir a nota de 71 para 78 depois de uma mudança, mas a variação entre execuções da mesma versão era de 10 pontos. Repetir cinco vezes, usar a mediana e conferir o p75 de campo duas semanas depois mostrou que não houve melhora real; a próxima otimização foi validada com esse método.`,
  code: [
    { title: 'Lighthouse pela linha de comando e pelo módulo Node (executado)', lang: 'js', code: R`import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
const r = await lighthouse('http://localhost:3120/bom.html', { port: chrome.port, onlyCategories: ['performance'], output: 'json', logLevel: 'error' });
const a = r.lhr.audits;
console.log('nota', Math.round(r.lhr.categories.performance.score * 100), '| LCP', a['largest-contentful-paint'].displayValue, '| TBT', a['total-blocking-time'].displayValue);
await chrome.kill();`, notes: [{ l: '5', t: 'Perfil móvel e throttling simulado são os padrões.' }, { l: '7', t: 'Compare as métricas, não só a nota (medido: nota 92 contra 100, LCP 2,7 s contra 1,2 s).' }] },
    { title: 'Coleta de campo com web-vitals e envio com beacon', lang: 'js', code: R`import { onLCP, onINP, onCLS } from 'web-vitals/attribution';

function enviar({ name, value, rating, id, attribution }) {
  const corpo = JSON.stringify({ nome: name, valor: Math.round(name === 'CLS' ? value * 1000 : value), avaliacao: rating, id, rota: location.pathname, alvo: attribution?.element ?? attribution?.interactionTarget });
  (navigator.sendBeacon && navigator.sendBeacon('/api/vitals', corpo)) || fetch('/api/vitals', { method: 'POST', body: corpo, keepalive: true });
}
onLCP(enviar); onINP(enviar); onCLS(enviar);`, notes: [{ l: '1', t: 'A build de atribuição informa o elemento e a fase responsáveis.' }, { l: '5', t: 'sendBeacon sobrevive ao fechamento da página; keepalive é a alternativa com fetch.' }] }
  ],
  bestPractices: ['Combine laboratório (diagnóstico) e campo (resultado).', 'Repita as medições e use a mediana; registre o ambiente.', 'Leia as métricas, não só a nota.', 'Use throttling de CPU e rede para simular o público real.', 'Colete web-vitals com atribuição, amostragem e sem dados pessoais.', 'Compare antes e depois com o mesmo método.'],
  mistakes: ['Perseguir a nota do Lighthouse.', 'Tirar conclusões de uma única execução.', 'Medir com extensões e abas abertas.', 'Achar que o laboratório prevê o campo.', 'Ignorar a variação ao comparar versões.', 'Coletar dados de campo sem contexto (rota, dispositivo).'],
  market: `Saber escolher e interpretar ferramentas de medição, e distinguir variação de melhoria real, é o que torna um trabalho de performance confiável. Perguntas sobre Lighthouse, CrUX e web-vitals aparecem em entrevistas de frontend e em discussões de produto e SEO.`,
  summary: `O Lighthouse audita em laboratório com throttling simulado (medido: nota 92-93 contra 100, mas LCP 2,6-2,7 s contra 1,2 s, e TBT variando 60 ms na mesma página); o CrUX traz dados de campo públicos (28 dias, p75); a biblioteca web-vitals mede e envia as métricas do seu próprio site, com atribuição; o DevTools investiga a causa. Repita as medições, use a mediana e não confunda variação com melhoria.`,
  refs: [REF.lighthouse, REF.crux, REF.webVitalsLib, REF.devtoolsPerf, REF.fieldLab],
  cards: [
    { q: 'Por que não perseguir a nota do Lighthouse?', a: 'É uma combinação ponderada que esconde diferenças relevantes (medido: nota 92 contra 100, mas LCP mais de 2x) e varia entre execuções.' },
    { q: 'O que o CrUX oferece?', a: 'Dados de campo públicos do Chrome por origem ou URL, em janela de 28 dias, com distribuição e p75.' },
    { q: 'Para que serve a build de atribuição do web-vitals?', a: 'Informa o elemento e a fase responsáveis por uma métrica ruim, para diagnosticar.' },
    { q: 'Como reduzir a variação nas medições de laboratório?', a: 'Repetir 3 a 5 vezes, usar a mediana, manter o mesmo ambiente e comparar com o mesmo método.' }
  ]
},
{
  id: 'pfe-03', moduleId: 'm2', order: 3, minutes: 70, tags: ['caminho crítico', 'render-blocking', 'preload', 'preconnect', 'fetchpriority', 'prioridades'],
  title: 'Caminho crítico de renderização e prioridades de recursos: preload, preconnect e fetchpriority',
  objectives: ['Descrever o caminho crítico (HTML, CSS, JavaScript, árvore de renderização, layout e pintura)', 'Identificar recursos que bloqueiam a renderização e reduzir seu impacto', 'Aplicar preload, preconnect, fetchpriority, defer e async com critério', 'Ler uma cascata de requisições e achar o gargalo do LCP', 'Calcular a duração do caminho crítico a partir das dependências e das durações dos recursos'],
  intro: `Entre a requisição do HTML e o primeiro pixel há uma **cadeia de dependências**: o navegador precisa do HTML, que revela o CSS e os scripts, que revelam fontes e imagens. Cada elo **espera o anterior**, e alguns recursos **bloqueiam a pintura** até chegar. Otimizar o **caminho crítico** é **encurtar essa cadeia** e **dizer ao navegador o que importa primeiro**. A aula mede o efeito no laboratório: uma página com CSS e script bloqueantes e imagem sem prioridade teve **FCP e LCP de 2,6 a 2,7 s**; a versão com CSS inline, imagem com preload e prioridade alta, **0,6 s e 1,2 s** (Lighthouse 13.6, Chrome 157).`,
  theory: `### O caminho crítico
1. O navegador baixa o **HTML** e o **analisa** em um **DOM**;
2. encontra **CSS** (§<link rel="stylesheet">§): baixa e constrói o **CSSOM**. **O CSS bloqueia a renderização**: o navegador não pinta enquanto o CSS da página não chegar (para evitar mostrar sem estilo);
3. encontra **scripts** (§<script src>§ comum): **bloqueia o analisador do HTML** até baixar e executar (e espera o CSS anterior, pois o script pode consultar estilos);
4. combina DOM e CSSOM na **árvore de renderização**, faz o **layout** e a **pintura**.
Cada recurso que bloqueia **atrasa o FCP e o LCP**. Medido na página "ruim" (CSS com 300 ms de atraso, script síncrono com 300 ms, imagem com 500 ms): o primeiro conteúdo só apareceu em ~2,7 s no perfil móvel simulado.

### Reduzir o bloqueio
- **CSS**: entregue só o **essencial** no caminho crítico (CSS crítico **inline** no §<head>§ ou um arquivo pequeno), carregue o restante sem bloquear (§media§ condicional, ou carregamento assíncrono), **minifique** e comprima (gzip/brotli); evite §@import§ em cascata;
- **JavaScript**: use **§defer§** (baixa em paralelo, executa depois da análise, **na ordem**) ou **§async§** (executa assim que chega, **fora de ordem**; para scripts independentes como analytics); módulos ES (§type="module"§) já são adiados; **evite** scripts síncronos no §<head>§; **divida** o pacote (aula 4);
- **Fontes**: aula 5; **imagens**: aula 5.
Medido: a página "boa" tinha CSS **inline**, script §defer§ e nenhum bloqueio: FCP de **0,6 s**.

### Descoberta tardia e prioridades
O navegador só pede um recurso quando **o descobre**. Uma imagem de destaque definida em **CSS** (§background-image§) ou inserida por **JavaScript** é descoberta **tarde**; no HTML (§<img src>§) é descoberta pelo **pré-analisador** logo no início. As **dicas de recurso** corrigem isso:
- **§<link rel="preload" as="image" href="..." fetchpriority="high">§**: pede o recurso **já**, antes de descobri-lo no HTML ou no CSS (use para o **recurso do LCP**, fontes críticas); só vale se o recurso **será usado logo**, senão desperdiça banda e gera aviso;
- **§<link rel="preconnect" href="https://cdn.exemplo.com">§**: abre **DNS, TCP e TLS** antecipadamente para uma origem que você **vai** usar (CDN de imagens, API); use com moderação (poucas origens);
- **§dns-prefetch§**: só a resolução de DNS (mais leve);
- **§fetchpriority="high"§** (ou §low§) em §<img>§, §<link>§ e §fetch§: ajusta a **prioridade relativa**; coloque **alta** na imagem do LCP e **baixa** em imagens fora da tela e recursos secundários;
- **§loading="lazy"§** só para o que está **fora** da primeira tela; **nunca** na imagem do LCP;
- **103 Early Hints** e **prefetch** (para a próxima navegação) são recursos avançados.
Medido: a página "boa" usou preload da imagem WebP com prioridade alta e dimensões; o LCP foi **1,2 s** contra **2,6-2,7 s**. Parte do ganho vem do **formato** (66 kB contra 184 kB; aula 5) e da remoção dos bloqueios; os efeitos isolados de cada técnica **não** foram separados neste laboratório.

### Ler uma cascata (waterfall)
Na aba Rede (ou no WebPageTest) cada linha é uma requisição no tempo. Procure: (1) o **TTFB** do HTML; (2) **cadeias** (HTML → CSS → fonte → texto visível; HTML → JS → API → imagem); (3) recursos do LCP que **começam tarde**; (4) bloqueios (CSS e script síncronos antes do primeiro desenho); (5) **requisições demais** de uma só origem ou **origens demais**; (6) tamanhos excessivos. O **caminho crítico** é a **cadeia mais longa** que precisa terminar antes do evento de interesse; **encurtar qualquer outro caminho não adianta**. O desafio de código desta aula calcula esse caminho.

### Renderização no cliente x servidor
Em uma SPA que renderiza no cliente, o HTML inicial é quase vazio: o conteúdo só aparece depois de baixar, analisar e executar o JavaScript e buscar os dados (uma **cascata** longa). Renderização no servidor, geração estática e streaming (C2.5) **encurtam** a cadeia para o primeiro conteúdo. O LCP de uma SPA costuma ser dominado por esse atraso.

### Compressão, cache e protocolo
**Brotli/gzip** reduzem texto; **cache HTTP** (§Cache-Control§ com §immutable§ para arquivos com hash) evita novas requisições; **HTTP/2 e HTTP/3** multiplexam requisições; uma **CDN** reduz a latência (C6). Esses itens melhoram o TTFB e a transferência de **todos** os recursos.

### Processo de otimização
1) **Meça** (aula 2) e identifique o elemento do LCP e a fase; 2) **elimine bloqueios** do caminho; 3) **antecipe** o recurso do LCP (descoberta cedo, prioridade alta); 4) **reduza o tamanho** do que é necessário; 5) **adie** o resto; 6) **meça de novo**. Mude **uma coisa por vez** quando possível.`,
  concepts: [
    { term: 'Caminho crítico de renderização', def: 'Sequência de etapas e recursos que precisam concluir antes do primeiro desenho.' },
    { term: 'Recurso bloqueante', def: 'Recurso (CSS ou script síncrono) que impede a renderização ou a análise do HTML até ser processado.' },
    { term: 'defer', def: 'Atributo que baixa o script em paralelo e o executa depois da análise do HTML, em ordem.' },
    { term: 'async', def: 'Atributo que executa o script assim que chega, sem garantir a ordem.' },
    { term: 'preload', def: 'Dica que pede um recurso imediatamente, antes de ele ser descoberto.' },
    { term: 'preconnect', def: 'Dica que abre antecipadamente a conexão com uma origem.' },
    { term: 'fetchpriority', def: 'Atributo que ajusta a prioridade relativa de um recurso.' },
    { term: 'CSS crítico', def: 'Estilos necessários para a primeira tela, entregues no caminho crítico.' },
    { term: 'Cascata (waterfall)', def: 'Visualização das requisições ao longo do tempo.' }
  ],
  examples: R`**Analogia:** o caminho crítico é a **fila do caixa de um mercado**: se o caixa só abre depois de o gerente buscar a chave (CSS), assinar um formulário (script bloqueante) e esperar a caixa de sacolas (imagem), todo mundo espera por cada etapa em sequência. Antecipar o pedido da caixa de sacolas (preload) e tirar etapas desnecessárias encurta a fila.

**Resultados medidos (Lighthouse 13.6.0, Chrome 157):**
§§§
ruim: CSS (300 ms) e script síncrono (300 ms) bloqueantes, imagem JPEG 184 kB (500 ms), sem preload -> FCP 2,6-2,7 s | LCP 2,6-2,7 s
bom:  CSS inline, script defer, imagem WebP 66 kB com preload e fetchpriority=high e dimensões   -> FCP 0,6 s | LCP 1,2 s
§§§
Os efeitos individuais (inline, preload, formato) não foram isolados.

**Cenário ilustrativo (não medido):** a imagem de destaque de uma página era um §background-image§ definido em um arquivo CSS grande e só era baixada depois do CSS. Trocar por um §<img>§ no HTML com §fetchpriority="high"§ e um preload fez o LCP cair; o ganho foi confirmado no Lighthouse e no p75 de campo uma semana depois.`,
  code: [
    { title: 'HTML com o caminho crítico enxuto (executado como a página "bom")', lang: 'html', code: R`<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
  <link rel="preconnect" href="https://cdn.exemplo.com">
  <style>/* CSS crítico inline */ body{font-family:sans-serif} img{max-width:100%;height:auto}</style>
  <script src="/app.js" defer></script>
</head>
<body>
  <img src="/hero.webp" alt="Equipe" width="1200" height="630" fetchpriority="high">
</body>`, notes: [{ l: '3', t: 'Antecipa o recurso do LCP com prioridade alta.' }, { l: '5', t: 'CSS crítico inline: nenhuma requisição bloqueante antes da pintura.' }, { l: '6', t: 'defer não bloqueia a análise do HTML.' }, { l: '9', t: 'Dimensões evitam mudança de layout; a imagem do LCP não é lazy.' }] },
    { title: 'Imagens fora da primeira tela e script independente', lang: 'html', code: R`<img src="/galeria-1.webp" alt="Foto 1" width="400" height="300" loading="lazy" fetchpriority="low">
<script src="https://analytics.exemplo/a.js" async></script>`, notes: [{ l: '1', t: 'lazy e prioridade baixa para o que está abaixo da dobra.' }, { l: '2', t: 'async para um script independente (ordem não importa).' }] }
  ],
  bestPractices: ['Identifique o elemento do LCP e antecipe seu recurso (descoberta cedo e prioridade alta).', 'Elimine CSS e scripts bloqueantes do caminho crítico.', 'Use defer para scripts da aplicação e async para independentes.', 'Use preconnect só para poucas origens realmente usadas.', 'Nunca use loading="lazy" na imagem do LCP.', 'Mude uma coisa por vez e meça.'],
  mistakes: ['Imagem de destaque em background-image (descoberta tardia).', 'Script síncrono no head.', 'preload de recursos que não serão usados logo.', 'preconnect para muitas origens.', 'Otimizar um caminho que não é o crítico.', 'SPA que só mostra conteúdo depois de várias requisições encadeadas.'],
  market: `O caminho crítico e as dicas de recurso são os ganhos mais rápidos de LCP e aparecem em auditorias de performance e entrevistas. Pessoas que leem uma cascata e priorizam o recurso certo resolvem problemas que "otimizações" genéricas não resolvem.`,
  summary: `CSS bloqueia a renderização e scripts síncronos bloqueiam a análise do HTML: mantenha o caminho crítico enxuto (CSS crítico inline, scripts com defer ou async). Recursos descobertos tarde (background-image, JavaScript) atrasam o LCP: use img no HTML, preload e fetchpriority=high para o recurso do LCP, lazy só fora da primeira tela e preconnect com moderação. Medido: FCP 2,6-2,7 s e LCP 2,6-2,7 s na página com bloqueios contra 0,6 s e 1,2 s na página otimizada.`,
  refs: [REF.critical, REF.renderBlocking, REF.fetchPriority, REF.preload, REF.preconnect, REF.lcp],
  cards: [
    { q: 'Qual a diferença entre defer e async?', a: 'defer executa depois da análise do HTML, em ordem; async executa assim que chega, sem ordem garantida.' },
    { q: 'Quando usar preload?', a: 'Para o recurso crítico (como a imagem do LCP) que o navegador só descobriria tarde e que será usado logo.' },
    { q: 'Por que não usar loading="lazy" na imagem do LCP?', a: 'Atrasaria exatamente o elemento que define o LCP.' },
    { q: 'O que é o caminho crítico?', a: 'A cadeia mais longa de dependências que precisa concluir antes do evento de interesse (como o primeiro desenho).' }
  ]
}
];
