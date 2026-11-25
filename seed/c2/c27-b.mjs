// C2.7 — Performance frontend. Aulas 4 a 6 (lazy loading e code splitting; imagens e fontes; profiling com DevTools).
import { REF } from './c27-a.mjs';
const R = String.raw;

export const REF2 = {
  viteBuild: { title: 'Vite — Building for Production', url: 'https://vite.dev/guide/build', kind: 'doc' },
  dynamicImport: { title: 'MDN — import() dinâmico', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import', kind: 'doc' },
  treeShaking: { title: 'MDN — Tree shaking', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking', kind: 'doc' },
  reactLazy: { title: 'React — lazy (referência)', url: 'https://react.dev/reference/react/lazy', kind: 'doc' },
  codeSplitting: { title: 'web.dev — Reduce JavaScript payloads with code splitting', url: 'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting', kind: 'doc' },
  responsiveImages: { title: 'MDN — Imagens responsivas', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images', kind: 'doc' },
  imageFormats: { title: 'MDN — Tipos e formatos de imagem', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types', kind: 'doc' },
  fontBest: { title: 'web.dev — Best practices for fonts', url: 'https://web.dev/articles/font-best-practices', kind: 'doc' },
  optimizeCls: { title: 'web.dev — Optimize Cumulative Layout Shift', url: 'https://web.dev/articles/optimize-cls', kind: 'doc' },
  fontDisplay: { title: 'MDN — font-display', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display', kind: 'doc' },
  longTasks: { title: 'web.dev — Optimize long tasks', url: 'https://web.dev/articles/optimize-long-tasks', kind: 'doc' },
  optimizeInp: { title: 'web.dev — Optimize Interaction to Next Paint', url: 'https://web.dev/articles/optimize-inp', kind: 'doc' },
  devtoolsMemory: { title: 'Chrome DevTools — Memory', url: 'https://developer.chrome.com/docs/devtools/memory-problems', kind: 'doc' },
  scheduler: { title: 'MDN — Prioritized Task Scheduling API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'pfe-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['code splitting', 'lazy loading', 'import dinâmico', 'tree shaking', 'bundle', 'analisador'],
  title: 'Lazy loading e code splitting: import dinâmico, divisão por rota, análise do pacote e tree shaking',
  objectives: ['Explicar por que o JavaScript é o recurso mais caro por byte e o que é o custo de análise e execução', 'Dividir o código com import() dinâmico e React.lazy, por rota e por componente pesado', 'Ler a saída de um build e um analisador de pacote para achar dependências grandes', 'Entender o tree shaking e as condições para ele funcionar', 'Decidir o que dividir e o que não dividir, medindo o ganho'],
  intro: `Um byte de JavaScript custa mais que um byte de imagem: além de **baixar**, o navegador precisa **analisar, compilar e executar** o código, na **thread principal**, e isso atrasa a interatividade (INP e TBT). A estratégia central é **enviar menos JavaScript no carregamento inicial** e **carregar o resto sob demanda**: **divisão de código (code splitting)**, **carregamento tardio (lazy loading)** e **remoção de código morto (tree shaking)**. A aula mostra como fazer, como **ler** o resultado e como **medir**; os números vêm de builds reais com **Vite 8.3.8** e React 19.3.1 no laboratório.`,
  theory: `### Por que o JavaScript é caro
- **Transferência**: bytes pela rede (comprimidos com gzip/brotli);
- **Análise e compilação**: o navegador transforma o texto em código executável;
- **Execução**: roda na **thread principal**, bloqueando interações e pintura;
- em celulares modestos, o custo de CPU é várias vezes maior que no notebook.
A regra prática: **cada kilobyte de JavaScript inicial deve se justificar**. Os maiores ganhos vêm de **não enviar** o que a tela atual não usa.

### Divisão de código com import() dinâmico
O §import('./modulo.js')§ (dinâmico) devolve uma **promessa** do módulo e faz o empacotador criar um **chunk** separado, baixado **quando a linha executa**. No React, §lazy§ + §Suspense§ (C2.3):
§§§
const Relatorio = lazy(() => import('./Relatorio.jsx'));
<Suspense fallback={<p>Carregando...</p>}>{ver && <Relatorio />}</Suspense>
§§§
Onde dividir:
- **por rota** (padrão em frameworks como o Next.js, que já separam cada página): a tela de login não carrega o código do relatório;
- **por componente pesado e raro**: editor de texto, mapa, gráficos, modais, painéis de administração;
- **por funcionalidade condicional**: recursos para um plano pago ou um papel específico;
- **bibliotecas grandes** usadas em poucos lugares (§import('biblioteca')§ dentro do manipulador que a usa).
Onde **não** dividir: componentes pequenos (a requisição extra custa mais que o ganho), código necessário na **primeira tela** (atrasaria o LCP), e muitas divisões minúsculas (cada chunk é uma requisição e uma cascata possível).

### O que foi medido (Vite 8.3.8, build de produção)
Um app com um botão que mostra um relatório que importa um módulo de dados de ~146 kB:
§§§
sem divisão:  index.js 365,35 kB (gzip 87,15 kB)
com lazy:     index.js 221,41 kB (gzip 69,35 kB) + chunk Relatorio 145,74 kB (gzip 16,93 kB) carregado só no clique
inicial: -143,94 kB (-17,8 kB comprimidos)
§§§
E o contraexemplo: quando o componente dividido era **minúsculo** (0,35 kB), o pacote inicial foi **221,41 kB com lazy contra 219,96 kB sem**: a divisão **piorou** o total. Moral: **divida o que é grande e raro**, e **meça**. (Os dados de texto compactam muito bem, por isso o ganho comprimido foi menor que o bruto.)

### Prefetch e pré-carregamento do chunk
Para evitar o atraso ao clicar, **pré-carregue** quando a intenção aparece: no §onMouseEnter§/§onFocus§ do botão, chame o mesmo §import()§ (o navegador guarda o módulo); ou use §<link rel="prefetch">§ para a **próxima** navegação provável; os frameworks fazem **prefetch** de rotas visíveis (§Link§ no Next.js, C2.5). Combine com **estados de carregamento** (esqueletos) e **fronteiras de erro** para falhas de rede ao baixar o chunk.

### Tree shaking
O **tree shaking** remove do pacote o **código exportado e nunca usado**. Funciona quando:
- os módulos são **ES modules** (§import§/§export§ estáticos), não CommonJS (§require§);
- o código **não tem efeitos colaterais** ao ser importado (o campo §"sideEffects": false§ do §package.json§ avisa o empacotador);
- você importa **só o que usa** (§import { debounce } from 'lib/debounce'§ ou da biblioteca em ESM, não o objeto inteiro §import _ from 'lodash'§).
Medido: em §util.js§ com §usada§ e §naoUsada§ (esta com um texto grande), o pacote final **não continha** §naoUsada§ (0 ocorrências). Bibliotecas que não são modulares (ou exportam um objeto único) **anulam** o efeito: prefira versões ESM e importações pontuais, e considere alternativas menores (§date-fns§, §dayjs§ no lugar de bibliotecas de data enormes).

### Analisar o pacote
Sempre que o JavaScript crescer, **olhe dentro**:
- a **saída do build** (Vite/Rollup mostra cada chunk e o tamanho, bruto e comprimido);
- **visualizadores**: §rollup-plugin-visualizer§ (Vite/Rollup), §webpack-bundle-analyzer§, §source-map-explorer§: mostram **quais módulos ocupam o quê**;
- no Next.js, o analisador de pacote integrado e o relatório do build por rota;
- procure: **duplicatas** (duas versões da mesma biblioteca), **bibliotecas enormes** para uso pequeno, **polyfills** desnecessários, **dados** embutidos que deveriam vir da rede, código de **desenvolvimento** em produção.
O **DevTools → Coverage** mostra a porcentagem de JavaScript e CSS **não usada** na página carregada: ponto de partida para decidir o que dividir.

### Outras reduções
- **Minificação** e **compressão** (brotli) no servidor/CDN;
- **Alvos de navegador modernos** (menos transformações e polyfills);
- **Remover dependências** ou trocar por APIs nativas (§fetch§, §structuredClone§, §Intl§);
- **Server Components** (C2.5): código que roda só no servidor **não vai** ao cliente;
- **Scripts de terceiros**: carregue com estratégia (aula de Next, C2.5), avalie o custo e remova os desnecessários;
- **Cache de longo prazo** com nomes de arquivo com hash: um chunk que não mudou **não é baixado de novo** entre versões, o que favorece **dividir bibliotecas estáveis** (vendor) de código da aplicação.

### Orçamento e prevenção
Defina um **orçamento de JavaScript** por rota (aula 8) e **falhe a CI** quando passar. O desafio de código desta aula calcula o tamanho **inicial** de um grafo de módulos, contando apenas as importações estáticas.`,
  concepts: [
    { term: 'Code splitting', def: 'Dividir o pacote em partes (chunks) carregadas sob demanda.' },
    { term: 'Lazy loading', def: 'Carregar um recurso ou componente só quando ele for necessário.' },
    { term: 'import()', def: 'Importação dinâmica que devolve uma promessa e cria um chunk separado.' },
    { term: 'Chunk', def: 'Arquivo de JavaScript gerado pelo empacotador, carregado sob demanda ou na entrada.' },
    { term: 'Tree shaking', def: 'Remoção, no build, do código exportado e nunca usado.' },
    { term: 'sideEffects', def: 'Campo do package.json que indica se importar o módulo causa efeitos colaterais.' },
    { term: 'Analisador de pacote', def: 'Ferramenta que mostra quais módulos ocupam espaço em cada chunk.' },
    { term: 'Prefetch', def: 'Baixar um recurso antecipadamente para uma navegação provável.' },
    { term: 'Coverage', def: 'Recurso do DevTools que mostra o código carregado e não executado.' }
  ],
  examples: R`**Analogia:** o pacote inicial é a **mala de mão** do voo: tudo o que está nela precisa passar pela inspeção na saída (analisar e executar). Levar o relatório de 146 kB "por precaução" é como embarcar com a mala de despacho na cabine. O lazy loading deixa a mala grande no **guarda-volumes do destino**, buscada só se for usada; o tree shaking é tirar da mala o que você nunca vai vestir.

**Resultados medidos (Vite 8.3.8, React 19.3.1):**
§§§
tree shaking: a função naoUsada de util.js não aparece no bundle (0 ocorrências)
sem lazy:  index 365,35 kB (gzip 87,15 kB)
com lazy:  index 221,41 kB (gzip 69,35 kB) + chunk Relatorio 145,74 kB (gzip 16,93 kB)
componente de 0,35 kB com lazy: index 221,41 kB contra 219,96 kB sem lazy (piorou)
§§§

**Cenário ilustrativo (não medido):** um painel carregava a biblioteca de gráficos (a maior do pacote) em todas as páginas, embora só uma tela a usasse. Dividir a tela de gráficos com §lazy§ e pré-carregar o chunk no hover do menu reduziu o JavaScript inicial; a equipe confirmou no analisador de pacote e na queda do TBT em laboratório.`,
  code: [
    { title: 'Divisão por rota e pré-carregamento na intenção (executado como o app do laboratório)', lang: 'jsx', code: R`import { lazy, Suspense, useState } from 'react';

const carregarRelatorio = () => import('./Relatorio.jsx');
const Relatorio = lazy(carregarRelatorio);

export function App() {
  const [ver, setVer] = useState(false);
  return (
    <div>
      <button onClick={() => setVer(true)} onMouseEnter={carregarRelatorio} onFocus={carregarRelatorio}>Relatório</button>
      {ver && <Suspense fallback={<p>Carregando...</p>}><Relatorio /></Suspense>}
    </div>
  );
}`, notes: [{ l: '3', t: 'A mesma função serve ao lazy e ao pré-carregamento: o navegador guarda o módulo.' }, { l: '10', t: 'Pré-carregar no hover e no foco reduz a espera ao clicar.' }] },
    { title: 'Configuração do Vite com visualizador de pacote (executado)', lang: 'js', code: R`// vite.config.mjs
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [react(), visualizer({ filename: 'stats.html', template: 'treemap' })],
  build: { reportCompressedSize: true }          // mostra o tamanho comprimido de cada chunk
};`, notes: [{ l: '6', t: 'O visualizador gera um mapa de árvore com o espaço de cada módulo.' }, { l: '7', t: 'A saída do build lista cada chunk em kB, bruto e gzip (medido).' }] }
  ],
  bestPractices: ['Divida o que é grande e raro (rotas, editores, gráficos, modais); não divida o minúsculo.', 'Pré-carregue o chunk na intenção (hover, foco) e trate carregamento e erro.', 'Importe só o que usa e prefira bibliotecas ESM com sideEffects declarado.', 'Analise o pacote a cada crescimento e use o Coverage para achar código não usado.', 'Defina um orçamento de JavaScript por rota na CI.', 'Meça o antes e o depois, bruto e comprimido.'],
  mistakes: ['Dividir componentes pequenos e piorar o total (medido).', 'Dividir o que é necessário na primeira tela.', 'Importar bibliotecas inteiras por uma função.', 'Usar CommonJS e perder o tree shaking.', 'Não tratar erro de rede ao carregar o chunk.', 'Otimizar o tamanho bruto e ignorar o custo de execução.'],
  market: `Reduzir e dividir o JavaScript é uma das competências mais pedidas em vagas de performance: perguntas sobre code splitting, tree shaking e como analisar um bundle são comuns. A habilidade de medir (bruto, comprimido e execução) separa ajustes reais de "otimizações" que não mudam nada.`,
  summary: `JavaScript custa baixar, analisar e executar na thread principal. Divida o código com import() e React.lazy por rota e por componente grande e raro; pré-carregue na intenção; trate carregamento e erro. O tree shaking exige ES modules sem efeitos colaterais e importações pontuais. Medido no Vite: dividir um módulo de 146 kB reduziu o pacote inicial de 365 para 221 kB (87,15 para 69,35 kB comprimidos), mas dividir um componente de 0,35 kB piorou o total. Analise o pacote e use orçamentos.`,
  refs: [REF2.viteBuild, REF2.dynamicImport, REF2.treeShaking, REF2.reactLazy, REF2.codeSplitting],
  cards: [
    { q: 'O que o import() dinâmico faz?', a: 'Carrega o módulo sob demanda e cria um chunk separado, devolvendo uma promessa.' },
    { q: 'Quando dividir o código não compensa?', a: 'Para componentes pequenos (a requisição extra custa mais), para o que a primeira tela precisa e quando há divisões demais.' },
    { q: 'Que condições o tree shaking exige?', a: 'ES modules, ausência de efeitos colaterais na importação (sideEffects) e importações pontuais.' },
    { q: 'Como achar o que ocupa espaço no pacote?', a: 'Com a saída do build, um visualizador (treemap) e o Coverage do DevTools.' }
  ]
},
{
  id: 'pfe-05', moduleId: 'm2', order: 5, minutes: 70, tags: ['imagens', 'fontes', 'srcset', 'sizes', 'font-display', 'CLS', 'AVIF', 'WebP'],
  title: 'Imagens e fontes: formatos, srcset e sizes, dimensões, font-display, subsetting e estabilidade do layout',
  objectives: ['Escolher formatos de imagem (JPEG, WebP, AVIF, SVG) e tamanhos adequados e usar srcset, sizes e picture', 'Reservar o espaço das imagens e evitar mudanças de layout', 'Configurar o carregamento de fontes com font-display, preload e subsetting', 'Calcular o CLS a partir de mudanças de layout e janelas de sessão', 'Escolher a estratégia de imagem do LCP versus imagens abaixo da dobra'],
  intro: `Imagens costumam ser a maior parte dos bytes de uma página e **o elemento do LCP** em muitas delas; fontes web **bloqueiam ou trocam o texto** e causam mudanças de layout. Cuidar de **formato**, **tamanho**, **dimensões** e **carregamento** dessas duas coisas rende ganhos grandes e baratos. Os números abaixo foram medidos no laboratório: a mesma imagem 1200x630 em JPEG, WebP e AVIF (com uma **ressalva importante**: o conteúdo foi um gradiente sintético, não uma fotografia), e o **CLS** de uma imagem sem dimensões no Chrome 157.`,
  theory: `### Formatos
- **JPEG**: fotos, compatibilidade universal; **PNG**: sem perdas e transparência (gráficos, capturas); **SVG**: vetores e ícones, escalável e leve, estilizável por CSS; **WebP**: boa compressão para fotos e gráficos, com transparência, amplamente suportado; **AVIF**: compressão ainda melhor, com mais custo de codificação e suporte amplo nos navegadores atuais;
- Medido na imagem sintética de 1200x630 (sharp 0.35.5): JPEG q92 = **184.054 bytes**; WebP q70 = **65.894 bytes**; AVIF q50 = **52.168 bytes**; WebP redimensionada para 600 px de largura = **24.138 bytes**. **Ressalva**: o conteúdo era um gradiente liso e comprime de forma muito diferente de uma foto; os **valores absolutos não valem** para fotografias, só a **ordem** e a lição "formato e tamanho importam". Meça com **as suas imagens** e compare qualidade visual, não só bytes;
- Use §<picture>§ com §<source type="image/avif">§ e §<source type="image/webp">§ e um §<img>§ de fallback quando precisar de compatibilidade; frameworks (C2.5, §next/image§) geram os formatos automaticamente.

### Tamanho certo: srcset e sizes
Enviar uma imagem de 2400 px a um celular de 390 px desperdiça bytes. Com §srcset§ o navegador **escolhe** a versão adequada:
§§§
<img src="/hero-800.webp" alt="Equipe"
     srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1600.webp 1600w"
     sizes="(max-width: 600px) 100vw, 800px" width="1600" height="840">
§§§
- **§srcset§** com descritores de largura (§w§) lista as versões e suas larguras reais;
- **§sizes§** diz quanta largura a imagem ocupa **no layout** (a expressão considera a largura da tela); o navegador combina com a densidade de pixels (dispositivos 2x pedem versão com o dobro de largura). **Sem §sizes§** (ou com um valor errado) ele pode baixar uma versão **maior que a necessária**;
- escolha das versões: o desafio de código da C2.5 simulou a regra "menor versão ≥ largura necessária"; use **3 a 5** larguras, não dezenas;
- **Direção de arte** (recortes diferentes por tela): §<picture>§ com §media§.

### Dimensões e CLS
Sem §width§ e §height§ (ou o CSS §aspect-ratio§), o navegador **não sabe** o espaço da imagem até ela chegar e o conteúdo abaixo **pula**: **mudança de layout**. Medido (tela de 390 px, imagem de 500 ms de atraso): sem dimensões **CLS = 0,012**; com §width§/§height§ e §img { max-width: 100%; height: auto }§, **CLS = 0** (o navegador calcula a proporção e reserva a altura). Vale também para **iframes**, **anúncios** e **vídeos** (reserve com §min-height§ ou §aspect-ratio§), e para conteúdo **injetado acima** do que já está na tela (evite; reserve o espaço).

### Como o CLS é calculado
Cada mudança de layout tem uma **pontuação** = fração de impacto (área afetada) × fração de distância (quanto se moveu). As mudanças são agrupadas em **janelas de sessão**: uma nova janela começa quando passa **mais de 1 s** sem mudanças ou quando a janela excede **5 s**; o CLS é a **soma da pior janela**. Mudanças logo após uma **interação** da pessoa (§hadRecentInput§) **não contam**. O desafio de código desta aula implementa essa regra.

### Carregamento: LCP x resto
- **Imagem do LCP**: **no HTML** (§<img>§, não §background-image§), **sem §loading="lazy"§**, com §fetchpriority="high"§ e, se for preciso, um **preload**; tamanho e formato otimizados;
- **Imagens abaixo da dobra**: §loading="lazy"§ (e §decoding="async"§); prioridade baixa;
- **Placeholders** (cor dominante, versão borrada) melhoram a percepção sem custo alto;
- **CDN de imagens** e cache de longo prazo (nomes com hash);
- **Acessibilidade**: §alt§ significativo (ou vazio se decorativa).

### Fontes web
Cada arquivo de fonte é uma requisição (e frequentemente descoberta **tarde**: só depois do CSS). Efeitos: **FOIT** (texto invisível até a fonte chegar) ou **FOUT** (texto com fonte alternativa que **troca**, causando mudança de layout). Controles:
- **§font-display§**: §swap§ (mostra a alternativa e troca: sem texto invisível, com risco de CLS), §optional§ (usa a fonte só se chegar rápido: **sem troca**), §fallback§ (compromisso);
- **Ajuste de métricas da alternativa** (§size-adjust§, §ascent-override§...) faz a fonte alternativa ocupar o **mesmo espaço**, reduzindo o CLS; o §next/font§ (C2.5) faz isso automaticamente;
- **§preload§ da fonte crítica** (§as="font" type="font/woff2" crossorigin§) para descobri-la cedo; só das **poucas** fontes da primeira tela;
- **Formato**: **WOFF2** (melhor compressão);
- **Subsetting**: incluir só os **caracteres** (latim) e **pesos** necessários; **fontes variáveis** reduzem o número de arquivos;
- **Hospede você mesmo** (sem conexão extra a terceiros, melhor cache e privacidade);
- **Fontes do sistema** (§system-ui§) são a opção mais rápida e sem mudança de layout.
O laboratório **não** executou testes de fontes; as recomendações seguem a documentação de MDN e da web.dev.

### Outros itens de mídia
Vídeos: **poster** com dimensões, §preload="none"§ ou §metadata§, formatos eficientes; **GIFs animados** substituídos por vídeo (menores); **ícones** em SVG ou sprites; **CSS** de efeitos no lugar de imagens quando possível.

### Verificação
Lighthouse (imagens sem dimensões, formatos, tamanhos, "elemento do LCP"), a aba Rede (tamanhos reais e formatos) e a depuração de mudanças de layout do DevTools (Rendering); CrUX/RUM para confirmar o p75 do CLS e do LCP.`,
  concepts: [
    { term: 'WebP e AVIF', def: 'Formatos modernos de imagem com compressão melhor que JPEG e PNG.' },
    { term: 'srcset', def: 'Atributo que lista versões da imagem e suas larguras para o navegador escolher.' },
    { term: 'sizes', def: 'Atributo que informa a largura que a imagem ocupa no layout.' },
    { term: 'picture', def: 'Elemento que permite escolher a fonte da imagem por formato ou condição de mídia.' },
    { term: 'aspect-ratio', def: 'Propriedade CSS (ou proporção de width/height) que reserva o espaço antes do carregamento.' },
    { term: 'Janela de sessão (CLS)', def: 'Grupo de mudanças de layout separadas por menos de 1 s e com até 5 s; o CLS é a pior janela.' },
    { term: 'font-display', def: 'Regra que define como o texto é exibido enquanto a fonte web carrega.' },
    { term: 'FOIT e FOUT', def: 'Texto invisível até a fonte chegar (FOIT) ou texto com fonte alternativa que depois troca (FOUT).' },
    { term: 'Subsetting', def: 'Reduzir uma fonte aos caracteres necessários.' }
  ],
  examples: R`**Analogia:** a imagem sem dimensões é uma **cadeira que chega depois de a mesa já estar posta**: todos os pratos são empurrados. Reservar o espaço (width e height) é **marcar o lugar na mesa**. O srcset é a **loja que manda a cadeira no tamanho do cômodo**, não sempre a maior do estoque. A fonte web é o **cardápio impresso em outra gráfica**: enquanto não chega, ou ninguém lê nada (FOIT) ou lê com outra letra que depois muda (FOUT).

**Resultados medidos (sharp 0.35.5; Chrome 157, 390 px):**
§§§
imagem 1200x630 sintética: JPEG q92 184.054 B | WebP q70 65.894 B | AVIF q50 52.168 B | WebP 600 px 24.138 B  (gradiente: valores não representam fotos)
sem width/height (atraso de 500 ms): CLS 0,012 | com width/height: CLS 0
§§§
Fontes e srcset em navegador não foram medidos no laboratório.

**Cenário ilustrativo (não medido):** uma loja trocou as fotos de produto de JPEG original (3 MB) para versões com 3 larguras em WebP, adicionou §sizes§ e dimensões e manteve a primeira imagem sem §lazy§ com prioridade alta; o LCP e o CLS do p75 melhoraram, validados no PageSpeed Insights duas semanas depois.`,
  code: [
    { title: 'Imagem responsiva com formatos modernos e dimensões', lang: 'html', code: R`<picture>
  <source type="image/avif" srcset="/hero-600.avif 600w, /hero-1200.avif 1200w" sizes="(max-width: 700px) 100vw, 1200px">
  <source type="image/webp" srcset="/hero-600.webp 600w, /hero-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 1200px">
  <img src="/hero-1200.jpg" alt="Equipe no escritório" width="1200" height="630" fetchpriority="high">
</picture>
<style>img { max-width: 100%; height: auto; }</style>`, notes: [{ l: '2', t: 'O navegador escolhe o primeiro formato que suporta e a largura adequada ao sizes.' }, { l: '4', t: 'width e height reservam a proporção (CLS 0 medido); fetchpriority alta para a imagem do LCP.' }] },
    { title: 'Fonte web com font-display, métricas ajustadas e preload', lang: 'css', code: R`@font-face {
  font-family: 'Texto';
  src: url('/fonts/texto-latin.woff2') format('woff2');
  font-weight: 400 700;           /* fonte variável: um arquivo, vários pesos */
  font-display: swap;
}
@font-face {
  font-family: 'Texto Fallback';
  src: local('Arial');
  size-adjust: 104%; ascent-override: 92%; descent-override: 24%;   /* mesma ocupação de espaço */
}
body { font-family: 'Texto', 'Texto Fallback', sans-serif; }
/* <link rel="preload" as="font" type="font/woff2" href="/fonts/texto-latin.woff2" crossorigin> */`, notes: [{ l: '5', t: 'swap evita texto invisível; o ajuste de métricas da alternativa reduz a mudança de layout na troca.' }, { l: '9', t: 'Valores de ajuste dependem das fontes; ferramentas os calculam (o next/font faz isso).' }, { l: '13', t: 'Preload só da fonte crítica da primeira tela; crossorigin é obrigatório para fontes.' }] }
  ],
  bestPractices: ['Sempre informe width e height (ou aspect-ratio) em imagens, iframes e anúncios.', 'Use WebP ou AVIF (com fallback) e versões em poucas larguras com srcset e sizes.', 'Imagem do LCP no HTML, sem lazy, com fetchpriority alta; o resto com lazy.', 'Hospede fontes em WOFF2, com subsetting e font-display; ajuste as métricas da alternativa.', 'Faça preload apenas das fontes críticas.', 'Meça com suas imagens e confirme a qualidade visual.'],
  mistakes: ['Imagens sem dimensões.', 'Enviar a mesma imagem enorme a todos os dispositivos.', 'loading="lazy" na imagem do LCP.', 'Esquecer sizes e baixar versões maiores que o necessário.', 'Carregar fontes de terceiros em tempo de execução e muitos pesos.', 'Generalizar tamanhos de formato a partir de uma imagem sintética.'],
  market: `Imagens e fontes são os ganhos mais visíveis de LCP e CLS e aparecem em todo trabalho de performance. Dominar srcset, sizes, dimensões e font-display, e saber medir o efeito com as próprias imagens, é conhecimento pedido em entrevistas e auditorias de frontend.`,
  summary: `Escolha formatos modernos (WebP, AVIF, SVG) e versões em poucas larguras com srcset e sizes; reserve o espaço com width e height (medido: CLS 0,012 sem dimensões, 0 com), e trate a imagem do LCP no HTML, sem lazy e com prioridade alta. O CLS é a pior janela de sessão (gap de 1 s, máximo de 5 s) e ignora mudanças após interação. Fontes: WOFF2, subsetting, hospedagem própria, font-display e ajuste de métricas da alternativa, com preload só das críticas. Os tamanhos medidos de formatos vieram de um gradiente sintético, não de fotos.`,
  refs: [REF2.responsiveImages, REF2.imageFormats, REF2.optimizeCls, REF2.fontBest, REF2.fontDisplay],
  cards: [
    { q: 'Por que informar width e height em uma imagem?', a: 'Para o navegador reservar o espaço antes do carregamento e evitar mudança de layout (medido: CLS 0,012 sem, 0 com).' },
    { q: 'Para que serve o sizes?', a: 'Informa quanto da largura a imagem ocupa para o navegador escolher a versão do srcset; sem ele pode baixar uma maior que a necessária.' },
    { q: 'Como o CLS agrupa as mudanças?', a: 'Em janelas de sessão (separadas por mais de 1 s ou com mais de 5 s); vale a pior janela e mudanças após interação são ignoradas.' },
    { q: 'O que muda entre font-display swap e optional?', a: 'swap mostra a alternativa e troca depois (risco de CLS); optional só usa a fonte se chegar rápido, sem troca.' }
  ]
},
{
  id: 'pfe-06', moduleId: 'm3', order: 6, minutes: 75, tags: ['profiling', 'DevTools', 'tarefas longas', 'INP', 'TBT', 'memória', 'scheduler'],
  title: 'Profiling com DevTools: flame chart, tarefas longas, depuração de INP e memória',
  objectives: ['Gravar e ler um perfil no painel Performance (linha do tempo, flame chart, tarefas longas)', 'Decompor uma interação em atraso de entrada, processamento e atraso de apresentação', 'Dividir tarefas longas e ceder a thread principal para melhorar o INP', 'Calcular o TBT e o INP a partir de tarefas e interações', 'Reconhecer vazamentos de memória e usar o painel Memory'],
  intro: `Quando a página trava ao clicar, o **profiler** mostra **o que a thread principal estava fazendo**. O JavaScript no navegador roda em **uma thread** que também cuida de eventos, estilo, layout e pintura; uma **tarefa longa** (mais de **50 ms**) impede tudo o mais. Esta aula ensina a **gravar e ler** um perfil, a **decompor o INP**, a **dividir o trabalho** e a achar **vazamentos de memória**. O exemplo medido: um manipulador de clique que ocupa a thread por 350 ms gerou uma **interação de 368 ms**; com o trabalho dividido em fatias de 50 ms, **nenhum evento passou de 16 ms** (Chrome 157).`,
  theory: `### A thread principal e as tarefas
O navegador executa **tarefas** em fila na thread principal: eventos, scripts, estilo, layout, pintura. Enquanto uma tarefa roda, **nada mais acontece** (o clique espera, a pintura espera). Uma tarefa é **longa** quando passa de **50 ms**; esse é o limite que o **TBT** usa: cada tarefa longa contribui com **(duração − 50 ms)** ao bloqueio. Em geral, mantenha o trabalho em **blocos curtos**.

### Gravar e ler um perfil (DevTools → Performance)
1) abra uma janela **anônima** (sem extensões); 2) ative **throttling de CPU** (4x ou 6x) para simular aparelhos modestos; 3) clique em **gravar**, faça **a interação** que está lenta, pare; 4) leia:
- **Linha do tempo** no topo (CPU, FPS, rede) com marcadores de **LCP**, **CLS**, **FCP** e **interações**; tarefas longas aparecem com um **triângulo vermelho**;
- **Main (thread principal)**: o **flame chart**: eixo X é o tempo, cada barra é uma função, **altura** é a pilha de chamadas e a **largura** é o tempo; as barras mais **largas** são os candidatos; cores: amarelo (JavaScript), roxo (estilo e layout), verde (pintura);
- **Resumo** (aba "Bottom-Up" e "Call Tree"): tempo **próprio** (self) e **total** por função: ordene por **self time**;
- **Interactions**: cada interação com as **três fases**.

### Decompondo o INP
Uma interação tem três fases (web.dev):
1. **Atraso de entrada**: o tempo até o manipulador **começar** (a thread estava ocupada com outra tarefa, como hidratação ou um timer);
2. **Tempo de processamento**: a execução dos **manipuladores** (e do trabalho de renderização que disparam);
3. **Atraso de apresentação**: do fim dos manipuladores até a **próxima pintura** (layout e pintura pesados, DOM enorme).
No experimento medido, o manipulador ocupava a thread por 350 ms e a **duração da interação foi 368 ms** (processamento de 350 ms mais o resto). **Diagnóstico por fase**: atraso de entrada alto → algo mais ocupa a thread (divida ou adie esse trabalho); processamento alto → o manipulador faz demais; apresentação alta → reduza o trabalho de layout/pintura e o tamanho do DOM.

### Reduzir o trabalho e ceder a thread
- **Faça menos**: remova cálculo desnecessário, **memoize** (aula 7), **virtualize** listas longas (renderize só o que está visível), simplifique o DOM, use seletores CSS simples;
- **Divida tarefas longas** e **ceda a thread** para o navegador pintar e tratar eventos:
§§§
async function processarEmFatias(itens, processar) {
  for (let i = 0; i < itens.length; i++) {
    processar(itens[i]);
    if (i % 100 === 99) await new Promise((r) => setTimeout(r, 0));   // cede a thread
  }
}
§§§
  Alternativas modernas: §scheduler.yield()§ (cede e **retoma com prioridade**, onde houver suporte), §scheduler.postTask()§ com prioridades, §requestIdleCallback§ para trabalho não essencial, §requestAnimationFrame§ para o que depende da pintura;
- **Mova trabalho pesado para um Web Worker**: cálculo, análise de dados, parsing; a thread principal fica livre;
- **Responda primeiro, calcule depois**: atualize a interface com o feedback imediato (estado de carregamento) e **adie** o trabalho pesado;
- no **React**: transições e valores adiados (§useTransition§, §useDeferredValue§, C2.3) mantêm a digitação responsiva; evite renderizações grandes síncronas.
Medido: com o trabalho dividido em **7 fatias de 50 ms** cedendo a thread entre elas (e o feedback imediato), nenhum evento de interação excedeu **16 ms**; o **trabalho total** continuou o mesmo (≈350 ms): a melhoria é de **responsividade**, não de custo total.

### TBT e INP como cálculo
O **TBT** é a soma de §(duração − 50)§ das tarefas longas **entre o FCP e o TTI**. O **INP** é a **pior** duração de interação da visita, mas, em visitas com muitas interações (50 ou mais), ignora a pior a cada 50 (aproximando o **percentil 98**). Os dois desafios de código da aula calculam essas métricas a partir de listas de tarefas e interações.

### Memória e vazamentos
Um **vazamento** ocorre quando objetos que não são mais necessários continuam **referenciados** (listeners não removidos, timers sem §clearInterval§, caches que crescem sem limite, closures que retêm DOM, variáveis globais), e a memória cresce com o uso até a página ficar lenta ou travar. No DevTools:
- **Memory → Heap snapshot**: capture antes e depois de repetir uma ação e **compare** (objetos que só crescem);
- **Allocation timeline** e a visão **Performance** com "Memory" ativada mostram a curva de memória (o **serrilhado** que volta ao patamar é saudável; a **escada** que só sobe é vazamento);
- causas comuns em React: efeitos sem **limpeza**, assinaturas não canceladas, **listas e caches sem limite** (aula 7: cache limitado), referências em §useRef§ para nós removidos.

### Perfil em produção
O **Chrome** permite registrar perfis em campo (a API **Long Animation Frames** informa quadros lentos e **scripts responsáveis**) e a atribuição do **web-vitals** aponta o elemento e a fase do INP: use no RUM (aula 8) para saber **quais interações** são lentas para pessoas reais.

### Roteiro de investigação
1) reproduza com **throttling**; 2) grave; 3) ache as **tarefas longas** perto da interação; 4) identifique a **fase** (entrada, processamento, apresentação); 5) no flame chart, a função mais **larga** (self time); 6) corrija (menos trabalho, fatias, worker, adiamento); 7) **grave de novo** e compare; 8) acompanhe em campo.`,
  concepts: [
    { term: 'Thread principal', def: 'Thread única do navegador que executa JavaScript, eventos, estilo, layout e pintura.' },
    { term: 'Tarefa longa', def: 'Tarefa que ocupa a thread principal por mais de 50 ms.' },
    { term: 'Flame chart', def: 'Gráfico de chamadas ao longo do tempo no profiler; a largura da barra é o tempo gasto.' },
    { term: 'Atraso de entrada', def: 'Tempo entre o gesto e o início do manipulador, quando a thread está ocupada.' },
    { term: 'Atraso de apresentação', def: 'Tempo entre o fim dos manipuladores e a próxima pintura.' },
    { term: 'scheduler.yield', def: 'API que cede a thread principal e retoma a tarefa com prioridade.' },
    { term: 'Web Worker', def: 'Thread secundária para executar JavaScript fora da thread principal.' },
    { term: 'Virtualização', def: 'Renderizar apenas os itens visíveis de uma lista longa.' },
    { term: 'Vazamento de memória', def: 'Memória que continua retida por referências a objetos que não são mais usados.' }
  ],
  examples: R`**Analogia:** a thread principal é o **único caixa de uma loja**: enquanto ele confere uma sacola enorme (tarefa longa), a fila inteira espera, inclusive quem só quer perguntar um preço (clique). Dividir a sacola em partes pequenas deixa o caixa atender quem chegou entre uma parte e outra.

**Resultados medidos (Chrome 157, PerformanceObserver de eventos):**
§§§
manipulador de clique com laço de 350 ms:         duração da interação = 368 ms
manipulador curto + 7 fatias de 50 ms com setTimeout(0): nenhum evento acima de 16 ms (trabalho total ≈ 350 ms, igual)
Lighthouse: TBT da mesma página varia entre 0 e 90 ms entre execuções (ruído)
§§§
O painel Performance, o Memory e a API Long Animation Frames não foram operados neste laboratório (conforme a documentação do Chrome).

**Cenário ilustrativo (não medido):** um filtro com 20 mil linhas travava 600 ms a cada tecla. O perfil mostrou uma tarefa longa de renderização e uma função de filtro com grande tempo próprio. Virtualizar a lista, mover o filtro para um Web Worker e usar §useDeferredValue§ para a lista (C2.3) reduziu a interação para poucas dezenas de milissegundos.`,
  code: [
    { title: 'Dividir uma tarefa longa e ceder a thread (executado: fatias de 50 ms)', lang: 'js', code: R`b.addEventListener('click', () => {
  b.textContent = 'feito';                       // feedback imediato (a pintura vem logo)
  setTimeout(async () => {
    for (let i = 0; i < 7; i++) {
      const t = performance.now();
      while (performance.now() - t < 50) {}       // simula 50 ms de trabalho
      await new Promise((r) => setTimeout(r, 0)); // cede a thread entre as fatias
    }
  }, 0);
});`, notes: [{ l: '2', t: 'A resposta visual vem antes do trabalho pesado.' }, { l: '7', t: 'Entre as fatias o navegador pinta e trata outros eventos (medido: nenhum evento acima de 16 ms).' }] },
    { title: 'Mover cálculo pesado para um Web Worker', lang: 'js', code: R`// principal.js
const worker = new Worker(new URL('./calculo.js', import.meta.url), { type: 'module' });
botao.addEventListener('click', () => {
  botao.disabled = true; resultado.textContent = 'Calculando...';
  worker.postMessage({ itens: dados });
});
worker.onmessage = (e) => { resultado.textContent = e.data.total; botao.disabled = false; };

// calculo.js
self.onmessage = (e) => { const total = e.data.itens.reduce((s, x) => s + x.valor, 0); self.postMessage({ total }); };`, notes: [{ l: '2', t: 'O Worker roda em outra thread: a principal continua livre.' }, { l: '4', t: 'Feedback imediato enquanto o trabalho acontece fora da thread principal.' }] }
  ],
  bestPractices: ['Reproduza com throttling de CPU em janela anônima e grave só a interação lenta.', 'Decomponha o INP em fases antes de agir.', 'Dê feedback imediato e adie o trabalho pesado.', 'Divida tarefas longas e use scheduler.yield, setTimeout ou Workers.', 'Virtualize listas longas e simplifique o DOM.', 'Compare perfis antes e depois e acompanhe o campo.'],
  mistakes: ['Perfilar com extensões e sem throttling.', 'Otimizar a função errada sem olhar o tempo próprio.', 'Medir o tempo total e ignorar a responsividade.', 'Executar cálculo pesado no manipulador de evento.', 'Cachês e listeners que nunca são liberados.', 'Esperar que o React.memo resolva uma tarefa longa de outro tipo.'],
  market: `Depurar interações lentas com o painel Performance é a habilidade que mais distingue pessoas sêniores de frontend em performance: o INP virou métrica central, e explicar fases, tarefas longas e como ceder a thread é pergunta comum em entrevistas.`,
  summary: `A thread principal executa tudo em tarefas; as longas (mais de 50 ms) bloqueiam cliques e pintura. O painel Performance mostra a linha do tempo, o flame chart (barras largas = tempo) e as interações em três fases: atraso de entrada, processamento e atraso de apresentação. Reduza o trabalho, divida em fatias cedendo a thread, mova cálculo para Workers e dê feedback imediato. Medido: um manipulador de 350 ms gerou interação de 368 ms; em fatias de 50 ms, nenhum evento passou de 16 ms. Vazamentos aparecem como memória que só sobe (heap snapshots).`,
  refs: [REF2.longTasks, REF2.optimizeInp, REF.devtoolsPerf, REF2.devtoolsMemory, REF2.scheduler],
  cards: [
    { q: 'O que é uma tarefa longa?', a: 'Uma tarefa que ocupa a thread principal por mais de 50 ms, atrasando eventos e pintura.' },
    { q: 'Quais são as três fases de uma interação (INP)?', a: 'Atraso de entrada, tempo de processamento dos manipuladores e atraso de apresentação até a próxima pintura.' },
    { q: 'Como dividir uma tarefa longa?', a: 'Em fatias que cedem a thread entre si (setTimeout, scheduler.yield) ou movendo o trabalho para um Web Worker.' },
    { q: 'Como o TBT é calculado?', a: 'Somando (duração − 50 ms) de cada tarefa longa entre o FCP e o TTI.' }
  ]
}
];
