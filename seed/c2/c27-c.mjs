// C2.7 — Performance frontend. Aulas 7 e 8 (memoização no React; orçamento de performance e RUM).
const R = String.raw;

export const REF3 = {
  memo: { title: 'React — memo (referência)', url: 'https://react.dev/reference/react/memo', kind: 'doc' },
  useMemo: { title: 'React — useMemo (referência)', url: 'https://react.dev/reference/react/useMemo', kind: 'doc' },
  useCallback: { title: 'React — useCallback (referência)', url: 'https://react.dev/reference/react/useCallback', kind: 'doc' },
  compiler: { title: 'React Compiler — Introdução', url: 'https://react.dev/learn/react-compiler/introduction', kind: 'doc' },
  profiler: { title: 'React — Profiler e DevTools', url: 'https://react.dev/learn/react-developer-tools', kind: 'doc' },
  virtualization: { title: 'web.dev — Virtualize large lists', url: 'https://web.dev/articles/virtualize-long-lists-react-window', kind: 'doc' },
  budgets: { title: 'web.dev — Performance budgets 101', url: 'https://web.dev/articles/performance-budgets-101', kind: 'doc' },
  lhci: { title: 'Lighthouse CI (GitHub)', url: 'https://github.com/GoogleChrome/lighthouse-ci', kind: 'doc' },
  lhBudgets: { title: 'Lighthouse CI — Configuração (asserções e orçamentos)', url: 'https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md', kind: 'doc' },
  sendBeacon: { title: 'MDN — Navigator.sendBeacon()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon', kind: 'doc' },
  slo: { title: 'Google SRE — Service Level Objectives', url: 'https://sre.google/sre-book/service-level-objectives/', kind: 'doc' },
  vitalsLib: { title: 'web-vitals (GitHub)', url: 'https://github.com/GoogleChrome/web-vitals', kind: 'doc' },
  inpGuide: { title: 'web.dev — Interaction to Next Paint', url: 'https://web.dev/articles/inp', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'pfe-07', moduleId: 'm3', order: 7, minutes: 70, tags: ['memo', 'useMemo', 'useCallback', 'React Compiler', 'virtualização', 'Profiler'],
  title: 'Memoização no React: memo, useMemo, useCallback, React Compiler e quando não usar',
  objectives: ['Explicar o que memo, useMemo e useCallback fazem e o que custam', 'Prever quantas renderizações e cálculos ocorrem com e sem memoização usando a identidade das props', 'Identificar quando a memoização não ajuda (props instáveis, componentes baratos) e alternativas melhores', 'Usar o Profiler para decidir e validar uma otimização', 'Descrever o papel do React Compiler e implementar uma memoização com cache limitado'],
  intro: `**Memoizar** é guardar o resultado de um cálculo para reaproveitá-lo quando as entradas não mudaram. No React há três ferramentas: **§memo§** (pular a renderização de um componente quando as props são iguais), **§useMemo§** (guardar um valor calculado) e **§useCallback§** (guardar a identidade de uma função). Elas **não são de graça**: guardam valores, comparam entradas a cada renderização e **complicam** o código. A pergunta certa é **"há um problema medido que isto resolve?"**. Esta aula usa **contagens medidas** no React 19.3.1 (renderizações e cálculos antes e depois), mostra **quando ajuda e quando não**, as alternativas (reorganizar, virtualizar) e o **React Compiler**. A aula de renderização (C2.3) explicou por que o React renderiza; aqui a otimização.`,
  theory: `### Relembrando o que dispara uma renderização
Um componente renderiza quando **seu estado** muda, **suas props** mudam (na prática, quando **o pai renderiza**, pois as props são recriadas) ou um **contexto** que ele lê muda (C2.3). Renderizar uma função é **barato**; o custo está em **trabalho pesado dentro do render** (filtros e ordenações grandes, muitos nós) e em **renderizações em cascata** de árvores grandes.

### memo
§memo(Componente)§ faz o React **pular** a renderização quando as **props são iguais** (comparação **rasa**, por §Object.is§ em cada prop). Só ajuda se as props **realmente permanecem iguais**: um **objeto**, um **array** ou uma **função** criados **dentro do pai** são **novos a cada render** e quebram a comparação. Medido (React 19.3.1, 5 cliques que mudam só o estado do pai):
§§§
filho sem memo:                 +5 renderizações
filho com memo e callback inline (função nova a cada render): +5  (o memo não ajudou)
filho com memo e useCallback:    +0
§§§

### useCallback e useMemo
- **§useCallback(fn, deps)§** mantém a **mesma função** entre renderizações enquanto as dependências não mudam: útil **só** para estabilizar uma **prop de componente memoizado** ou uma **dependência de efeito**; sozinho, não acelera nada;
- **§useMemo(() => valor, deps)§** guarda o **resultado** de um cálculo: útil para **cálculos caros** e para estabilizar a identidade de objetos passados a memoizados ou contextos.
Medido (lista de 1000 itens filtrada, 5 renderizações causadas por outro estado):
§§§
filtro sem useMemo: 1000 chamadas na montagem + 5000 nas 5 renderizações extras
filtro com useMemo (dependência: busca): 1000 na montagem + 0 nas renderizações extras
§§§
Mas **medir o custo real** é essencial: o filtro de 100.000 itens custou em média **~26 ms** (Node/jsdom); o de 1000 itens, uma fração de milissegundo, **barato demais** para justificar a memoização por velocidade (o ganho do exemplo é a **contagem**, não o tempo). Regra prática: **memoize quando o cálculo é caro (milissegundos) ou quando a identidade importa**.

### O custo da memoização
Cada memoização **guarda** o último resultado (memória), **compara** as dependências a cada renderização (CPU), **complica** a leitura e **pode ficar errada** (dependências esquecidas = valores desatualizados; o lint de §exhaustive-deps§ ajuda). Se as dependências mudam quase sempre, o cache **nunca acerta**: só custo. E o React **pode descartar** valores memoizados (não é uma garantia semântica): o código deve funcionar sem ela.

### Quando a memoização ajuda
- um componente **pesado** que renderiza **com frequência** por causa do pai e **recebe props estáveis** (use o Profiler para confirmar);
- **cálculos caros** derivados de estado ou props;
- **identidade estável** para §useEffect§, contextos e componentes memoizados;
- itens de **listas grandes** (cada linha em §memo§ com callbacks estáveis).

### Quando não ajuda (e o que fazer antes)
1. **Mover o estado para perto de quem usa** e passar conteúdo por §children§ (C2.3): a árvore pesada deixa de renderizar sem memoizar;
2. **Dividir o componente** para isolar a parte que muda;
3. **Reduzir o trabalho**: virtualizar listas (renderizar só o que está visível), paginar, simplificar o DOM;
4. **Adiar** com §useDeferredValue§ e §useTransition§ (C2.3);
5. **Mover cálculo pesado** para um Worker (aula 6);
6. **Medir** com o Profiler: "quem renderizou", "por quê" e quanto levou.
Memoizar um componente **barato** não traz ganho perceptível e acrescenta custo.

### React Compiler
O **React Compiler** (pacote §babel-plugin-react-compiler§, versão 1.0.0 no npm em 2026-11-25) é uma ferramenta de **build** que **memoiza automaticamente** componentes e valores que seguem as **regras do React** (render puro, regras dos hooks). Efeitos: **menos** §memo§, §useMemo§ e §useCallback§ manuais; **componentes que violam as regras são pulados**; ainda é preciso **entender** a arquitetura (onde vive o estado), pois o compilador não corrige renderizações causadas por **estado mal posicionado** nem reduz trabalho caro dentro do render. Recomendação: adote o compilador se a base seguir as regras e **mantenha** memoizações manuais apenas onde forem necessárias; **meça antes e depois**. O compilador foi **citado da documentação e não foi executado** neste laboratório.

### Memoização fora do React: cache limitado
Memoizar funções puras (§fn(a)§ → resultado) é útil, mas um cache **sem limite** vira **vazamento** (aula 6). Use um cache **limitado** com descarte do **menos recentemente usado** (LRU): ao exceder o limite, remove o item mais antigo não usado. O desafio de código implementa um §memoizarLimitado(fn, max)§. Chaves: para argumentos primitivos, o valor; para objetos, uma **chave estável** (ids); cuidado com **chaves complexas** (serializar custa).

### Listas grandes
Renderizar **10.000 linhas** é caro mesmo com memo. **Virtualização** (react-window, TanStack Virtual) renderiza só as ~20 linhas visíveis e reposiciona ao rolar, reduzindo DOM, memória, renderização e INP. Combine com **chaves estáveis** (C2.3) e linhas memoizadas.

### Roteiro de decisão
1) Há um problema **medido** (INP, quadros lentos, Profiler)? Se não, **pare**. 2) O Profiler mostra **quem** renderiza e **por quê**; 3) tente **reorganizar o estado**; 4) se o componente é pesado e as props são estáveis, **memo** (e estabilize funções/objetos); 5) se o cálculo é caro, **useMemo**; 6) se a lista é grande, **virtualize**; 7) **meça de novo** e **remova** memoizações que não deram resultado.`,
  concepts: [
    { term: 'Memoização', def: 'Guardar o resultado de um cálculo para reaproveitá-lo quando as entradas são iguais.' },
    { term: 'memo', def: 'Função do React que pula a renderização de um componente quando as props são iguais por comparação rasa.' },
    { term: 'useMemo', def: 'Hook que guarda um valor calculado enquanto as dependências não mudam.' },
    { term: 'useCallback', def: 'Hook que mantém a identidade de uma função enquanto as dependências não mudam.' },
    { term: 'Comparação rasa', def: 'Comparação das propriedades por identidade (Object.is), sem olhar o conteúdo aninhado.' },
    { term: 'React Compiler', def: 'Ferramenta de build que memoiza automaticamente componentes e valores que seguem as regras do React.' },
    { term: 'Virtualização', def: 'Renderizar apenas os itens visíveis de uma lista longa.' },
    { term: 'LRU', def: 'Política de cache que descarta o item menos recentemente usado.' },
    { term: 'Profiler', def: 'Ferramenta que registra renderizações do React e suas causas.' }
  ],
  examples: R`**Analogia:** memoizar é **anotar o resultado de uma conta no caderno** para não refazer. Vale a pena para a conta longa que se repete com os mesmos números; é perda de tempo para 2+2, e o caderno só ajuda se os números forem realmente os mesmos (identidade das props): se toda vez você escreve a conta em um papel novo (função inline), não reconhece que já fez.

**Resultados medidos (React 19.3.1, jsdom; 5 cliques que mudam só o estado n):**
§§§
montagem: cada filho 1 render; filtro 1000 chamadas (com e sem useMemo)
extras: sem memo +5 | memo com callback inline +5 | memo com useCallback +0
filtro sem useMemo +5000 chamadas | com useMemo +0
filtrar 100000 itens: ~26 ms por execução
§§§
O React Compiler não foi executado.

**Cenário ilustrativo (não medido):** um desenvolvedor cobriu todos os componentes de um formulário com §memo§ e §useCallback§ e o código ficou ilegível sem ganho perceptível, pois os componentes eram baratos. O Profiler mostrou que a lista de 5 mil itens era o problema: virtualizar a lista e mover o estado do campo de busca resolveram o INP; as memoizações extras foram removidas.`,
  code: [
    { title: 'Props estáveis para o memo funcionar (executado)', lang: 'jsx', code: R`const Linha = memo(function Linha({ item, aoClicar }) { return <li onClick={() => aoClicar(item.id)}>{item.nome}</li>; });

function Lista({ itens }) {
  const [busca, setBusca] = useState('');
  const [contador, setContador] = useState(0);
  const aoClicar = useCallback((id) => console.log(id), []);                       // identidade estável
  const visiveis = useMemo(() => itens.filter((i) => i.nome.includes(busca)), [itens, busca]);   // só recalcula se mudar
  return <>
    <button onClick={() => setContador(contador + 1)}>cliques {contador}</button>
    <input value={busca} onChange={(e) => setBusca(e.target.value)} />
    <ul>{visiveis.map((i) => <Linha key={i.id} item={i} aoClicar={aoClicar} />)}</ul>
  </>;
}`, notes: [{ l: '6', t: 'Sem useCallback, uma função nova a cada render anularia o memo (medido: +5).' }, { l: '7', t: 'O filtro só roda de novo quando itens ou busca mudam (medido: +0 nos cliques do contador).' }] },
    { title: 'Memoização de função pura com cache limitado (LRU)', lang: 'js', code: R`function memoizarLimitado(fn, max = 100) {
  const cache = new Map();
  return (chave) => {
    if (cache.has(chave)) { const v = cache.get(chave); cache.delete(chave); cache.set(chave, v); return v; }  // marca como usado
    const v = fn(chave); cache.set(chave, v);
    if (cache.size > max) cache.delete(cache.keys().next().value);                                            // descarta o mais antigo
    return v;
  };
}`, notes: [{ l: '4', t: 'Reinserir a chave a move para o fim: o Map mantém a ordem de inserção.' }, { l: '6', t: 'O limite evita o vazamento de memória de um cache que cresce sem fim.' }] }
  ],
  bestPractices: ['Meça antes de memoizar: Profiler, INP, contagens.', 'Reorganize o estado e use children antes de memo.', 'Estabilize props (useCallback, useMemo) ao usar memo; senão ele não adianta.', 'Virtualize listas grandes.', 'Memoize cálculos caros e identidades que importam, não tudo.', 'Remova memoizações que não deram resultado e meça com o React Compiler, se adotado.'],
  mistakes: ['Memoizar componentes baratos.', 'memo com props que mudam a cada render (função e objeto inline).', 'useCallback sem consumidor memoizado.', 'Dependências esquecidas (valores desatualizados).', 'Cache sem limite (vazamento).', 'Achar que o React Compiler dispensa pensar em arquitetura de estado.'],
  market: `Memoização é um dos temas mais debatidos em React e uma pergunta quase certa em entrevistas ("quando usar useMemo?"). Mostrar medições, explicar a comparação rasa e as alternativas (reorganizar, virtualizar, Compiler) demonstra senioridade.`,
  summary: `memo pula renderizações quando as props são iguais por comparação rasa; useMemo guarda valores e useCallback, funções, mas só ajudam com identidade estável e trabalho real. Medido no React 19.3.1: o filho com memo e callback inline renderizou +5 vezes, com useCallback +0; o filtro sem useMemo fez +5000 chamadas, com useMemo +0, embora o custo de um filtro de 1000 itens seja desprezível. Reorganize o estado, virtualize listas e use o Profiler; o React Compiler automatiza, sem dispensar a arquitetura.`,
  refs: [REF3.memo, REF3.useMemo, REF3.useCallback, REF3.compiler, REF3.profiler, REF3.virtualization],
  cards: [
    { q: 'Por que um memo com callback inline não adianta?', a: 'A função é nova a cada render do pai, então as props diferem por identidade e o componente renderiza de novo (medido: +5).' },
    { q: 'Quando useMemo vale a pena?', a: 'Para cálculos caros (milissegundos) ou para estabilizar a identidade de valores usados por memoizados, efeitos ou contextos.' },
    { q: 'O que tentar antes de memoizar?', a: 'Mover o estado para perto de quem usa, passar conteúdo por children, virtualizar listas e adiar com useDeferredValue.' },
    { q: 'O que o React Compiler faz?', a: 'Memoiza automaticamente componentes e valores que seguem as regras do React, sem substituir a boa arquitetura de estado.' }
  ]
},
{
  id: 'pfe-08', moduleId: 'm4', order: 8, minutes: 70, tags: ['orçamento', 'Lighthouse CI', 'RUM', 'SLO', 'alertas', 'web-vitals', 'regressão'],
  title: 'Orçamento de performance e RUM: orçamentos na CI, Lighthouse CI, monitoramento de usuários reais, SLOs e alertas',
  objectives: ['Definir um orçamento de performance (tamanhos, contagens e métricas) e verificá-lo automaticamente na CI', 'Configurar o Lighthouse CI e entender o que ele garante e o que não', 'Coletar dados de campo com web-vitals e agregá-los em p75 por rota e dispositivo', 'Definir SLOs de experiência e alertas sobre eles sem ruído', 'Montar o ciclo contínuo: medir, orçar, bloquear regressões, monitorar e investigar'],
  intro: `Otimizar uma vez não basta: **a performance regride** a cada nova dependência, imagem pesada ou script de terceiros. A defesa é **mantê-la como requisito**: um **orçamento** (limites objetivos), **verificações automáticas** na CI que **bloqueiam regressões**, **monitoramento de usuários reais (RUM)** para ver o resultado em campo e **SLOs** com alertas. Esta aula fecha o curso com esse ciclo. Os dados vêm das aulas anteriores (Lighthouse, web-vitals) e o desafio de código implementa o verificador de orçamento e a agregação de campo.`,
  theory: `### Orçamento de performance
Um **orçamento** é um conjunto de **limites** que a equipe se compromete a respeitar:
- **Tamanhos**: JavaScript inicial (bruto e comprimido) por rota, CSS, imagens, total da página, fontes;
- **Contagens**: número de requisições, de origens de terceiros, de scripts de terceiros;
- **Métricas de laboratório**: LCP, TBT, CLS, Speed Index (com margem por causa da variação, aula 2);
- **Métricas de campo (SLOs)**: p75 de LCP, INP e CLS por dispositivo.
Como definir: parta de **onde está hoje** e da **meta de campo** (por exemplo, "LCP p75 ≤ 2,5 s no celular"); converta em limites de laboratório com folga (laboratório mais rígido que o campo, pois o campo é pior); **fixe** os limites e **reduza** gradualmente. Cada limite tem um **dono** e um **motivo**.

### Verificação na CI
- **Tamanho do pacote**: ferramentas como §size-limit§ ou a verificação do build (por exemplo, falhar se o chunk inicial ultrapassar N kB comprimidos); o relatório do Vite/Next mostra os tamanhos (aula 4);
- **Lighthouse CI (LHCI)**: executa o Lighthouse a cada pull request, **várias vezes** (3 a 5, usa a mediana), compara com **asserções** (§assert§: por exemplo §largest-contentful-paint: ['error', { maxNumericValue: 2500 }]§) e com **orçamentos** (§budget.json§: tamanhos e contagens por tipo de recurso), e pode **comparar com a base** (a branch principal) e guardar os resultados;
- **Falhar o pipeline** quando o limite estoura (e exigir uma justificativa registrada para exceções).
Cuidados: a **variação** do laboratório (medido: o TBT da mesma página variou de 0 a 90 ms; a nota, 1 ponto) pede **repetições e margens**; use limites mais estáveis (**tamanhos**, **contagens**, LCP) como bloqueio e deixe métricas ruidosas (TBT) como **aviso**; rode em **ambiente fixo** (mesmo contêiner, perfil e rede simulada); teste **rotas importantes**, não só a home.
Exemplo de configuração (da documentação do LHCI, **não executada** neste laboratório):
§§§
{ "ci": { "collect": { "numberOfRuns": 5, "url": ["http://localhost:3000/", "http://localhost:3000/produtos"] },
          "assert": { "assertions": { "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }], "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }], "total-blocking-time": ["warn", { "maxNumericValue": 300 }] } } } }
§§§

### RUM: monitoramento de usuários reais
Com a biblioteca **web-vitals** (aula 2), envie as métricas ao seu backend (§navigator.sendBeacon§), com **contexto**: **rota** (modelo da URL, não a URL completa com ids), **tipo de dispositivo**, **conexão**, **versão do app** e, na build de atribuição, o **elemento e a fase** responsáveis. Boas práticas:
- **Amostragem** para controlar volume e custo (por exemplo, 10 a 100%, conforme o tráfego);
- **Privacidade**: sem dados pessoais, sem URLs com identificadores, respeite consentimento e leis aplicáveis;
- **Armazenamento**: guarde as **amostras** (ou histogramas) e calcule **percentis** por rota, dispositivo e versão; a **média** engana;
- **Acompanhe por versão**: uma publicação que piora o p75 deve ser detectada **horas** depois, não semanas;
- **Compare** com o CrUX para validar que o RUM representa os usuários.
Alternativas: serviços de RUM comerciais e de observabilidade, o painel de Core Web Vitals do Search Console e o PageSpeed Insights (campo).

### Percentis e agregação
Para um conjunto de amostras ordenadas, o **percentil p** (método do posto mais próximo) é o valor na posição §ceil(p/100 × n)§. O **p75** é a base dos Core Web Vitals; o **p95** mostra a cauda (quem sofre mais). O desafio de código calcula o p75 por rota e a classificação pelos limiares da aula 1. **Cuidados**: poucos dados dão percentis instáveis (defina um mínimo de amostras); misture dispositivos **não**: compare celulares com celulares.

### SLOs e alertas
Um **SLO (Service Level Objective)** de experiência diz, por exemplo: "**75% das visitas em celular têm LCP ≤ 2,5 s**" e "**INP p75 ≤ 200 ms**", medido em uma janela (28 dias, como o CrUX). O **orçamento de erro** é a fração tolerada fora do objetivo; consumi-lo rápido exige **ação** (congelar mudanças, priorizar correções). **Alertas** úteis (poucos e acionáveis): p75 por rota **piorou X%** após uma versão; SLO em risco; aumento de erros relacionados; picos de **tarefas longas**. Evite alertas por valores isolados ou ruidosos; inclua o **runbook** (o que investigar: o elemento e a fase da atribuição, a versão publicada, scripts de terceiros novos).

### O ciclo contínuo
1) **Medir** (laboratório e campo); 2) **orçar** (limites e SLOs); 3) **bloquear regressões** na CI; 4) **monitorar** em produção por versão e rota; 5) **investigar** com atribuição e perfis; 6) **corrigir** e **validar** (laboratório e campo); 7) **revisar** os orçamentos periodicamente. Faça da performance **responsabilidade de todos**: cada pull request que aumenta o pacote, adiciona um script de terceiros ou uma imagem pesada passa pelo mesmo crivo.

### Governança de terceiros
Scripts de terceiros (anúncios, analytics, chats) são a principal causa de regressões fora do seu controle. Mantenha um **inventário** com dono e justificativa, carregue com a estratégia mais tardia (C2.5), meça o custo de cada um (laboratório e RUM) e **remova** os que não se pagam.

### O que foi e o que não foi executado neste curso
Foram executados: Lighthouse 13.6, medições com PerformanceObserver, builds do Vite e contagens de memoização. **Não** foram executados: Lighthouse CI, size-limit, coleta web-vitals em produção, backend de RUM, alertas; esses itens seguem a documentação das ferramentas.`,
  concepts: [
    { term: 'Orçamento de performance', def: 'Conjunto de limites (tamanhos, contagens e métricas) que a equipe se compromete a respeitar.' },
    { term: 'Lighthouse CI', def: 'Ferramenta que roda o Lighthouse na CI, com asserções e orçamentos, e compara resultados.' },
    { term: 'Asserção', def: 'Regra do LHCI que verifica um valor máximo ou mínimo de uma métrica ou auditoria.' },
    { term: 'RUM', def: 'Monitoramento de desempenho com dados de usuários reais.' },
    { term: 'SLO', def: 'Service Level Objective: meta mensurável de qualidade, por exemplo p75 de LCP até 2,5 s.' },
    { term: 'Orçamento de erro', def: 'Fração tolerada de visitas fora do SLO em uma janela.' },
    { term: 'Percentil p75', def: 'Valor abaixo do qual está 75% das amostras.' },
    { term: 'Regressão de performance', def: 'Piora de desempenho introduzida por uma mudança no código ou nos terceiros.' },
    { term: 'Runbook', def: 'Roteiro do que verificar e fazer quando um alerta dispara.' }
  ],
  examples: R`**Analogia:** o orçamento é o **limite de peso da bagagem** da companhia aérea: sem a regra e a balança no check-in (a CI), a mala engorda um pouco a cada viagem até estourar. O RUM é a **pesquisa de satisfação** dos passageiros reais; o SLO é a **meta de pontualidade** ("75% dos voos no horário") e o alerta é o **aviso quando o mês está fugindo da meta**.

**Medidas do curso que sustentam os limites (laboratório):**
§§§
variação da mesma página no Lighthouse: nota 92 e 93; TBT 30 e 0 ms (ruim) | 90 e 30 ms (bom)  -> usar margem e repetições
JavaScript inicial do app de exemplo: 365,35 kB sem lazy; 221,41 kB com lazy (gzip 87,15 e 69,35 kB)  -> candidato a limite de tamanho
INP de uma interação de 350 ms: 368 ms (acima do limite de 200 ms)
§§§

**Exemplo de orçamento de uma loja (modelo, não executado):**
§§§
JS inicial por rota: <= 170 kB gzip | imagens por página: <= 800 kB | terceiros: <= 3 scripts
LCP lab: <= 2,5 s (5 execuções, mediana) | CLS lab: <= 0,1 | TBT lab: aviso > 300 ms
SLO de campo (celular, 28 dias): LCP p75 <= 2,5 s; INP p75 <= 200 ms; CLS p75 <= 0,1
§§§

**Cenário ilustrativo (não medido):** uma equipe de marketing adicionou um script de teste A/B no cabeçalho; sem orçamento, o LCP do p75 subiu 700 ms em duas semanas sem que ninguém notasse. Depois de adotar o LHCI com bloqueio, o RUM por versão e um inventário de terceiros, a mesma mudança teria sido barrada no pull request ou detectada no primeiro dia de publicação.`,
  code: [
    { title: 'Orçamento de tamanhos e métricas no Lighthouse CI (da documentação; não executado)', lang: 'json', code: R`{
  "ci": {
    "collect": { "numberOfRuns": 5, "url": ["http://localhost:3000/", "http://localhost:3000/produtos"] },
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 300 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 170000 }]
      }
    }
  }
}`, notes: [{ l: '3', t: 'Cinco execuções por URL: o LHCI usa a mediana para reduzir a variação.' }, { l: '7', t: 'TBT como aviso: é a métrica mais ruidosa (medido: de 0 a 90 ms na mesma página).' }, { l: '8', t: 'Limite de bytes de script por página (bloqueia o crescimento do pacote).' }] },
    { title: 'RUM com web-vitals: rota normalizada, amostragem e beacon', lang: 'js', code: R`import { onLCP, onINP, onCLS } from 'web-vitals/attribution';

const AMOSTRA = 0.2;                                         // 20% das visitas
if (Math.random() < AMOSTRA) {
  const rota = location.pathname.replace(/\/\d+/g, '/:id');  // sem identificadores na URL
  const enviar = ({ name, value, rating, attribution }) => navigator.sendBeacon('/api/rum', JSON.stringify({
    nome: name, valor: name === 'CLS' ? value : Math.round(value), avaliacao: rating, rota, versao: window.__APP_VERSAO__,
    celular: matchMedia('(max-width: 768px)').matches, alvo: attribution?.element ?? attribution?.interactionTarget
  }));
  onLCP(enviar); onINP(enviar); onCLS(enviar);
}`, notes: [{ l: '5', t: 'Normalizar a rota evita cardinalidade explosiva e dados pessoais na URL.' }, { l: '8', t: 'A versão permite detectar a publicação que piorou o p75.' }, { l: '9', t: 'O elemento responsável orienta o diagnóstico.' }] }
  ],
  bestPractices: ['Defina orçamentos de tamanho, contagem e métricas, com dono e motivo.', 'Bloqueie regressões na CI com repetições, mediana e margens; use métricas ruidosas só como aviso.', 'Colete RUM com contexto (rota normalizada, dispositivo, versão) e sem dados pessoais.', 'Agregue em percentis por rota, dispositivo e versão e exija um mínimo de amostras.', 'Defina SLOs e alertas poucos e acionáveis, com runbook.', 'Mantenha um inventário e um orçamento para scripts de terceiros.'],
  mistakes: ['Otimizar uma vez e não vigiar.', 'Limites de laboratório sem margem e com uma única execução.', 'Alertas por valores isolados e ruidosos.', 'RUM sem versão e sem rota normalizada.', 'Misturar dispositivos nos percentis.', 'Coletar dados pessoais ou URLs com identificadores.'],
  market: `Equipes maduras tratam performance como requisito contínuo: orçamentos na CI, RUM por versão e SLOs com alertas. Saber desenhar esse ciclo e justificá-lo com dados é característica de pessoas sêniores e de líderes técnicos, e aparece em entrevistas de design de frontend.`,
  summary: `Um orçamento fixa limites de tamanhos, contagens e métricas; a CI os verifica (size-limit, Lighthouse CI com várias execuções e asserções) e bloqueia regressões, com margem pela variação do laboratório (medido: TBT de 0 a 90 ms). O RUM com web-vitals envia métricas com rota normalizada, dispositivo, versão e atribuição, agregadas em p75 por segmento. SLOs de campo e alertas acionáveis fecham o ciclo: medir, orçar, bloquear, monitorar, investigar e corrigir.`,
  refs: [REF3.budgets, REF3.lhBudgets, REF3.lhci, REF3.vitalsLib, REF3.sendBeacon, REF3.slo],
  cards: [
    { q: 'O que é um orçamento de performance?', a: 'Um conjunto de limites objetivos (tamanhos, contagens e métricas) que a equipe se compromete a respeitar e que a CI verifica.' },
    { q: 'Por que rodar o Lighthouse CI várias vezes?', a: 'A variação entre execuções é grande; a mediana de 3 a 5 execuções torna a verificação mais estável.' },
    { q: 'Que contexto enviar no RUM?', a: 'Rota normalizada, tipo de dispositivo, conexão, versão do app e a atribuição (elemento e fase), sem dados pessoais.' },
    { q: 'O que é um SLO de experiência?', a: 'Uma meta de campo, como "p75 de LCP até 2,5 s no celular em 28 dias", acompanhada de alertas.' }
  ]
}
];
