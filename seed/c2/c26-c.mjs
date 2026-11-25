// C2.6 — Testes de frontend. Aulas 7 e 8 (testes visuais e E2E; estratégia de testes no frontend).
const R = String.raw;

export const REF3 = {
  pwIntro: { title: 'Playwright — Introdução', url: 'https://playwright.dev/docs/intro', kind: 'doc' },
  pwSnap: { title: 'Playwright — Visual comparisons', url: 'https://playwright.dev/docs/test-snapshots', kind: 'doc' },
  pwBest: { title: 'Playwright — Best practices', url: 'https://playwright.dev/docs/best-practices', kind: 'doc' },
  pwRetries: { title: 'Playwright — Retries', url: 'https://playwright.dev/docs/test-retries', kind: 'doc' },
  pwLocators: { title: 'Playwright — Locators', url: 'https://playwright.dev/docs/locators', kind: 'doc' },
  sbTesting: { title: 'Storybook — Testing', url: 'https://storybook.js.org/docs/writing-tests', kind: 'doc' },
  sbInteraction: { title: 'Storybook — Interaction tests', url: 'https://storybook.js.org/docs/writing-tests/interaction-testing', kind: 'doc' },
  pixelmatch: { title: 'pixelmatch (GitHub)', url: 'https://github.com/mapbox/pixelmatch', kind: 'doc' },
  vitestCov: { title: 'Vitest — Coverage (limiares)', url: 'https://vitest.dev/guide/coverage', kind: 'doc' },
  ghActions: { title: 'GitHub Actions — Documentação', url: 'https://docs.github.com/pt/actions', kind: 'doc' },
  fowlerFlaky: { title: 'Martin Fowler — Eradicating Non-Determinism in Tests', url: 'https://martinfowler.com/articles/nonDeterminism.html', kind: 'doc' },
  testingTrophy: { title: 'Kent C. Dodds — The Testing Trophy and Testing Classifications', url: 'https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'tfe-07', moduleId: 'm3', order: 7, minutes: 70, tags: ['testes visuais', 'regressão visual', 'E2E', 'Playwright', 'Storybook', 'pixelmatch'],
  title: 'Testes visuais e de ponta a ponta: stories com interação, capturas de tela e regressão visual',
  objectives: ['Explicar o que o jsdom não consegue verificar (layout, cores, tipografia, imagens) e como os testes visuais complementam', 'Descrever o fluxo de um teste de regressão visual (linha de base, captura, comparação, aprovação)', 'Configurar limiares de comparação e tratar ruído (fontes, animações, dados dinâmicos)', 'Usar stories com função play como testes de interação e a base dos testes visuais', 'Escrever um teste E2E com localizadores robustos, esperas automáticas e isolamento, e saber quando um E2E vale o custo'],
  intro: `O jsdom não desenha nada: não tem **layout**, **cores calculadas**, **fontes** ou **imagens**. Um componente pode passar em todos os testes de comportamento e estar **com a cor errada, sobreposto a outro ou quebrado no celular**. Os **testes visuais** comparam **capturas de tela** com uma **linha de base** e acusam mudanças, e os testes **E2E (ponta a ponta)** conduzem um **navegador real** por fluxos completos. São os níveis mais caros do troféu, por isso usados com parcimônia. Esta aula mostra o fluxo, o algoritmo de comparação (**medido** com a biblioteca pixelmatch sobre matrizes de pixels sintéticas) e as boas práticas; Playwright e Storybook são descritos conforme a documentação e **não foram executados** neste laboratório.`,
  theory: `### O que cada nível enxerga
- **jsdom (componentes)**: estrutura, texto, atributos, eventos, foco; **não** vê CSS aplicado, tamanho, posição ou aparência;
- **Testes visuais**: aparência (cores, espaçamentos, quebras de linha, estados de hover/foco, temas claro e escuro, larguras de tela);
- **E2E**: o sistema integrado de verdade (navegador, rotas, rede, às vezes backend e banco), os **fluxos críticos** (cadastro, login, compra).

### Regressão visual: o fluxo
1. **Linha de base**: capturas aprovadas, versionadas com o código;
2. **Captura nova** a cada execução, em ambiente **idêntico** (mesmo navegador, sistema operacional, resolução, fontes);
3. **Comparação** pixel a pixel (ou perceptual) com um **limiar de tolerância**;
4. **Diferença**: o teste falha e mostra uma imagem de diferença; a pessoa **revisa**: se foi bug, corrige; se foi mudança intencional, **aprova** a nova linha de base.
Ferramentas: o **§toHaveScreenshot()§** do Playwright (linha de base em arquivos, comparação integrada), serviços de revisão visual (Chromatic, Percy) e bibliotecas de comparação como o **pixelmatch**.

### Como a comparação funciona (pixelmatch, medido)
O pixelmatch compara duas imagens de mesmo tamanho (matrizes RGBA) e devolve o **número de pixels diferentes**; o parâmetro §threshold§ (0 a 1) define a **sensibilidade de cor** (maior = mais tolerante). Medido em imagens sintéticas de 20x20 pixels (400 pixels):
§§§
duas imagens brancas iguais:                  0 pixels diferentes
um quadrado preto de 5x5 em uma imagem branca:  25 pixels diferentes
ruído leve (255 contra 250), threshold 0,1:      0 pixels diferentes
mesmo ruído com threshold 0:                  400 pixels diferentes
§§§
Lições: (1) **zero tolerância** acusa até diferenças imperceptíveis (suavização de fontes, compressão): **ruído**; (2) tolerância demais **esconde** mudanças reais; (3) a decisão final costuma combinar **limiar de cor** e **porcentagem máxima de pixels diferentes** (por exemplo, falha se mais de 0,1% dos pixels mudar). O desafio de código da aula implementa essa comparação.

### Fontes de ruído e instabilidade visual
Fontes e renderização diferentes entre máquinas (rode no **mesmo contêiner** da CI), **animações e transições** (desligue com §animations: 'disabled'§ ou CSS de teste), **conteúdo dinâmico** (datas, aleatórios, anúncios: fixe com dados simulados e máscara de regiões), **carregamento de imagens e fontes** (espere por elas), cursor piscando, rolagem. Capture **componentes isolados** (histórias do Storybook) em vez de páginas inteiras: menos variáveis, mais precisão, falhas mais fáceis de entender.

### Storybook: histórias como testes
Cada **história** (§story§) descreve um estado de um componente (padrão, carregando, erro, vazio, longo, tema escuro). Com uma função **§play§**, a história **interage** (clica, digita) e verifica asserções, funcionando como **teste de interação** no navegador (testando o componente **em um navegador real**, algo que o jsdom não faz). As mesmas histórias alimentam a **documentação**, os **testes visuais** (uma captura por história e por largura) e, com **MSW**, simulam dados e erros (aula 6). É a base do trabalho de design system (C2.2). Também é possível reaproveitar as histórias em testes unitários (§composeStories§), como na C2.2. O ambiente do Storybook não foi executado neste laboratório.

### E2E: o que e quando
Cubra com E2E os **poucos fluxos críticos** em que uma quebra tem alto custo: login, cadastro, compra, pagamento. Custo: lento, mais instável, difícil de depurar. Regra: **mais testes de componente com MSW, menos E2E**. Boas práticas (Playwright):
- **localizadores acessíveis**: §page.getByRole('button', { name: 'Comprar' })§, §getByLabel§, §getByText§ (mesma filosofia da Testing Library);
- **esperas automáticas**: as ações esperam o elemento estar visível, estável e habilitado; **asserções com nova tentativa** (§await expect(locator).toBeVisible()§); **nunca** pausas fixas;
- **isolamento**: cada teste com **contexto de navegador novo**, dados próprios (criados por API ou banco de teste) e **sem depender da ordem**; autenticação reaproveitada por um estado salvo, não repetindo o login pela interface em todo teste;
- **dados e ambiente**: backend de teste ou rede simulada para cenários difíceis; **não** teste contra produção;
- **artefatos**: vídeo, trace e captura em caso de falha para depurar na CI;
- **repetição controlada** (§retries§ só na CI) para **detectar** instabilidade, não para escondê-la (aula 8).

### Acessibilidade e responsividade
Verifique em navegador real o que o jsdom não vê: **contraste**, **foco visível**, **zoom a 200%**, **larguras de tela** (celular, tablet, desktop) e **tema escuro**. Com Playwright é possível rodar o axe-core em páginas reais e capturar diferentes viewports.

### Custos e decisões
Cada captura aumenta o armazenamento e a revisão. Capture **estados que importam** (componentes do design system e páginas-chave), em poucas larguras; evite capturar tudo "por segurança". Faça da **revisão visual** parte do pull request (a diferença é anexada) e trate a atualização da linha de base como mudança de código revisada.

### O que não foi executado aqui
Playwright, Storybook, serviços de revisão visual e testes em navegador real **não** foram executados neste laboratório (não há download de navegadores nem Storybook configurado). A comparação de imagens foi verificada com o pixelmatch em matrizes sintéticas, e os testes de componente rodaram em jsdom.`,
  concepts: [
    { term: 'Regressão visual', def: 'Mudança indesejada na aparência detectada comparando capturas com uma linha de base.' },
    { term: 'Linha de base', def: 'Conjunto de capturas aprovadas usado como referência de comparação.' },
    { term: 'Limiar (threshold)', def: 'Tolerância de cor usada na comparação de pixels.' },
    { term: 'story', def: 'Descrição de um estado de um componente no Storybook.' },
    { term: 'função play', def: 'Função de uma história que simula interações e verifica asserções no navegador.' },
    { term: 'E2E', def: 'Teste de ponta a ponta que conduz o sistema integrado como a pessoa faria.' },
    { term: 'Localizador', def: 'Forma de encontrar elementos em um teste E2E, de preferência por papel e rótulo.' },
    { term: 'Espera automática', def: 'Comportamento em que as ações esperam o elemento estar pronto antes de agir.' },
    { term: 'Trace', def: 'Registro detalhado de uma execução E2E para depuração.' }
  ],
  examples: R`**Analogia:** o teste de componente confere se a **receita** foi seguida (ingredientes e passos); o teste visual **fotografa o prato** e compara com a foto aprovada; o E2E é **o cliente real fazendo o pedido do início ao fim**. Fotografar com luz diferente a cada dia (ambiente instável) gera alarmes falsos.

**Resultados medidos (pixelmatch 8.0.0, matrizes 20x20):**
§§§
iguais: 0 pixels diferentes
quadrado preto 5x5: 25 pixels diferentes
ruído 255/250 com threshold 0.1: 0 | com threshold 0: 400
§§§
Playwright, Storybook e navegador real: não executados (conforme a documentação).

**Exemplo de teste visual e E2E (Playwright, da documentação; não executado):**
§§§
await page.goto('/produtos');
await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible();
await expect(page).toHaveScreenshot('produtos.png', { maxDiffPixelRatio: 0.001, animations: 'disabled' });
§§§

**Cenário ilustrativo (não medido):** uma mudança de CSS "inofensiva" no botão primário alterou o espaçamento em doze telas e todos os testes de componente continuaram verdes. O teste visual do design system mostrou a diferença no pull request, e a equipe corrigiu antes da publicação.`,
  code: [
    { title: 'Comparar capturas com pixelmatch (executado em matrizes sintéticas)', lang: 'js', code: R`import pixelmatch from 'pixelmatch';

const diferentes = pixelmatch(base, nova, null, largura, altura, { threshold: 0.1 });
const proporcao = diferentes / (largura * altura);
if (proporcao > 0.001) throw new Error('regressão visual: ' + (proporcao * 100).toFixed(2) + '% dos pixels mudaram');`, notes: [{ l: '3', t: 'threshold controla a sensibilidade de cor; 0,1 ignorou o ruído leve (medido).' }, { l: '4', t: 'Combinar o limiar de cor com uma proporção máxima de pixels diferentes.' }] },
    { title: 'Fluxo E2E crítico com localizadores acessíveis e história com play (da documentação; não executado)', lang: 'js', code: R`// e2e/compra.spec.js (Playwright)
test('compra um produto', async ({ page }) => {
  await page.goto('/produtos/camiseta');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('link', { name: 'Carrinho' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button', { name: 'Finalizar compra' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible();
});

// Botao.stories.jsx (Storybook): estado com interação
export const Enviando = { play: async ({ canvas, userEvent }) => { await userEvent.click(canvas.getByRole('button', { name: 'Enviar' })); await expect(canvas.getByText('Enviando...')).toBeVisible(); } };`, notes: [{ l: '4', t: 'Localizadores por papel e nome, como na Testing Library.' }, { l: '8', t: 'Asserções com nova tentativa esperam sem pausa fixa.' }, { l: '13', t: 'A função play interage e verifica no navegador real.' }] }
  ],
  bestPractices: ['Use testes visuais para o que o jsdom não vê: aparência, temas e larguras.', 'Capture componentes isolados e fixe dados e animações.', 'Rode as capturas no mesmo ambiente (contêiner) da linha de base.', 'Combine limiar de cor e proporção máxima de pixels diferentes.', 'Mantenha poucos E2E, nos fluxos críticos, com localizadores acessíveis e isolamento.', 'Trate a atualização da linha de base como mudança revisada.'],
  mistakes: ['Zero de tolerância e alarmes falsos constantes.', 'Tolerância excessiva escondendo regressões.', 'Capturar tudo, com dados e animações variáveis.', 'Comparar capturas feitas em máquinas diferentes.', 'E2E demais, lentos e instáveis.', 'Pausas fixas e dependência de ordem nos E2E.'],
  market: `Equipes com design systems e produtos visuais usam testes visuais e Storybook como rede de segurança, e os fluxos críticos são cobertos por E2E (Playwright domina novos projetos). Saber o que cada nível enxerga e quando cada um vale o custo é a base de qualquer estratégia de qualidade de frontend.`,
  summary: `O jsdom não vê layout, cores e imagens: testes visuais comparam capturas com uma linha de base (medido com pixelmatch: 0 pixels diferentes em imagens iguais, 25 para um quadrado 5x5, e o ruído leve só aparece com threshold 0). Controle o ruído (ambiente, animações, dados) e combine limiar e proporção. Histórias com play são testes de interação em navegador real. E2E cobre poucos fluxos críticos com localizadores acessíveis, esperas automáticas e isolamento. Playwright e Storybook não foram executados aqui.`,
  refs: [REF3.pwIntro, REF3.pwSnap, REF3.pwBest, REF3.pwLocators, REF3.sbTesting, REF3.sbInteraction, REF3.pixelmatch],
  cards: [
    { q: 'O que o jsdom não consegue verificar?', a: 'Layout, cores calculadas, fontes, imagens e responsividade, pois não renderiza visualmente.' },
    { q: 'Como funciona um teste de regressão visual?', a: 'Compara capturas novas com uma linha de base aprovada, com tolerância, e uma pessoa revisa as diferenças.' },
    { q: 'Por que a tolerância zero é um problema?', a: 'Acusa diferenças imperceptíveis (fontes, compressão): ruído que gera alarmes falsos (medido: 400 pixels com threshold 0).' },
    { q: 'Quando vale um teste E2E?', a: 'Nos poucos fluxos críticos em que uma quebra tem custo alto, pois é lento, caro e mais instável.' }
  ]
},
{
  id: 'tfe-08', moduleId: 'm4', order: 8, minutes: 70, tags: ['estratégia', 'CI', 'flaky', 'cobertura', 'pipeline', 'qualidade'],
  title: 'Estratégia de testes no frontend: níveis, CI, testes instáveis e cobertura útil',
  objectives: ['Desenhar uma estratégia de testes por tipo de código e risco, com a distribuição entre os níveis', 'Organizar a execução na CI (ordem, paralelismo, cache, artefatos, tempo)', 'Diagnosticar e tratar testes instáveis (flaky) em vez de repeti-los às cegas', 'Usar a cobertura como ferramenta de diagnóstico e definir limiares razoáveis', 'Escrever e manter um plano de testes e métricas de saúde da suíte'],
  intro: `Uma boa suíte não é a que tem mais testes, é a que **a equipe confia e roda sempre**. Esta aula fecha o curso com a **estratégia**: quais níveis de teste usar em cada tipo de código, como organizá-los em um **pipeline de integração contínua (CI)** que dê **feedback rápido**, como tratar **testes instáveis (flaky)** e como usar a **cobertura** sem cair em armadilhas. A teoria geral de testes (TDD, dublês, cobertura, testes de API) pertence à C5; aqui o foco é o frontend. O laboratório mediu a cobertura (100% nos componentes testados) e o desafio de código modela a análise de instabilidade a partir do histórico de execuções.`,
  theory: `### Estratégia por tipo de código
| Tipo de código | Nível principal | Ferramentas |
|---|---|---|
| Lógica pura (validação, formatação, reducers, seletores) | Unitário | Vitest |
| Componentes e fluxos curtos de UI | Integração de componentes | Testing Library + MSW |
| Acessibilidade básica | Componentes + estático | jest-axe, ESLint a11y |
| Design system, aparência | Histórias + visuais | Storybook, capturas |
| Fluxos críticos de negócio | E2E (poucos) | Playwright |
| Contratos de API | Testes de contrato / MSW alinhado | esquemas, OpenAPI |
| Tipos e erros comuns | Estático | TypeScript, ESLint |
Regra de ouro: **o teste mais barato que dá confiança suficiente**. Para cada bug que chega à produção, pergunte "que teste teria pego isto, no menor nível?" e escreva-o.

### Um plano de testes (uma página)
Registre: (1) **o que protege** (riscos principais do produto); (2) **níveis e ferramentas** adotados; (3) **convenções** (nomes, local, fábricas, render personalizado, MSW); (4) **o que é obrigatório** num pull request (testes para código novo, teste que reproduz o bug corrigido); (5) **fluxos E2E críticos** listados; (6) **política para testes instáveis**; (7) **metas de saúde** (tempo, taxa de falhas). Revise a cada trimestre.

### Pipeline de CI
Ordem sugerida, do mais barato ao mais caro, **falhando cedo**: 1) **instalação** (§npm ci§ com cache); 2) **análise estática** (tipos, lint, formatação); 3) **testes unitários e de componentes** em paralelo (§vitest run§, com **fragmentação** em várias máquinas se a suíte for grande); 4) **build**; 5) **testes visuais** (Storybook); 6) **E2E** contra o build (ou ambiente de teste), possivelmente só em ramos principais e *pull requests* relevantes; 7) **relatórios** (cobertura, artefatos de falha: traces, capturas, vídeos).
Metas práticas: **feedback em poucos minutos** para o pull request (a suíte lenta deixa de ser rodada); **resultado determinístico** (mesma versão do Node e dependências travadas); **cache** de dependências e de builds; **artefatos** para depurar falhas sem reproduzir localmente. Exemplo de configuração de CI no GitHub Actions: instalar, rodar lint e testes, publicar a cobertura. A **proteção de branch** exige o pipeline verde para mesclar.

### Testes instáveis (flaky)
Um teste **instável** passa e falha sem mudança de código. Efeitos: ninguém confia, repete-se a CI "até ficar verde", bugs reais se escondem. Causas comuns:
- **assincronia** mal esperada (pausas fixas, §waitFor§ com efeitos);
- **ordem e estado compartilhado** (cache, store global, banco);
- **tempo e aleatoriedade** (relógio real, §Math.random§, fusos horários);
- **rede e serviços reais**; **animações**; **recursos limitados** da CI (máquina lenta);
- **concorrência** entre testes (portas e arquivos compartilhados);
- no E2E: seletores frágeis, dados não isolados.
**Tratamento**: (1) **medir**: registre o histórico de cada teste (passou/falhou em quantas execuções do mesmo código); (2) **isolar** rapidamente: **quarentena** (marcar e tirar do caminho crítico, com prazo e responsável, não "para sempre"); (3) **reproduzir** repetindo o teste em laço, em ordem aleatória e com CPU limitada; (4) **corrigir a causa** (esperar a condição, isolar estado, fixar o tempo); (5) **não** "consertar" com mais repetições (§retries§ servem para **detectar**, não para esconder). O desafio de código classifica testes a partir de um histórico de execuções (estável, quebrado, instável).

### Cobertura útil
- **Meça** com o provedor v8 (medido no laboratório: 100% de statements, branches, functions e lines, 38/38 e 15/15);
- **Use** para encontrar **código nunca exercitado** (ramos de erro esquecidos), comparando com o risco;
- **Limiares** (§coverage.thresholds§) podem **impedir queda**, por exemplo, "não reduzir a cobertura de arquivos novos", mais do que exigir 100%;
- **Armadilhas**: cobertura mede **execução**, não **verificação**; metas altas incentivam testes sem asserções; código gerado e arquivos de configuração distorcem; **cobertura de ramos** é mais informativa que de linhas;
- **Complemente** com **testes de mutação** (alterar o código e ver se os testes percebem), usado de forma pontual em lógica crítica.

### Métricas de saúde da suíte
Tempo total e por etapa; taxa de falha **sem mudança de código** (instabilidade); tempo para a primeira falha; bugs que escaparam (e em que nível teriam sido pegos); proporção de testes por nível; testes em quarentena. **Poucas métricas, olhadas com regularidade.**

### Cultura e processo
Testes são **código de primeira classe** (revisados, refatorados). **Quem quebra o teste conserta**; teste falhando na principal é **prioridade**. Trate o teste como **documentação executável**. Ao escrever um bug, escreva primeiro o teste que o reproduz. Remova testes obsoletos e redundantes: uma suíte menor e confiável vale mais que uma enorme e ignorada.

### Fronteiras
TDD, dublês em profundidade, testes de API e E2E avançado estão na C5 (Fundamentos de testes e Ferramentas JS); a integração contínua e os pipelines (C6) detalham a automação; segurança (C7) adiciona testes de segurança. Esta aula conecta os níveis de **UI** a esse todo.`,
  concepts: [
    { term: 'Estratégia de testes', def: 'Decisão documentada sobre quais níveis, ferramentas e convenções usar para proteger o produto.' },
    { term: 'Integração contínua', def: 'Prática de rodar automaticamente testes e verificações a cada mudança de código.' },
    { term: 'Pipeline', def: 'Sequência automatizada de etapas de verificação e entrega.' },
    { term: 'Teste instável (flaky)', def: 'Teste que passa e falha sem mudança de código.' },
    { term: 'Quarentena', def: 'Isolamento temporário de um teste instável, com prazo e responsável para corrigi-lo.' },
    { term: 'Cobertura de ramos', def: 'Proporção dos caminhos de decisão (if, else) executados pelos testes.' },
    { term: 'Limiar de cobertura', def: 'Valor mínimo de cobertura exigido pelo pipeline.' },
    { term: 'Teste de mutação', def: 'Técnica que altera o código e verifica se os testes detectam a mudança.' },
    { term: 'Proteção de branch', def: 'Regra que exige verificações aprovadas antes de mesclar o código.' }
  ],
  examples: R`**Analogia:** a estratégia é o **plano de segurança de um prédio**: detectores de fumaça em todo lugar (análise estática, baratos), extintores nos corredores (testes de componente), alarme e brigada nos pontos críticos (E2E), e simulados raros. Um alarme que dispara à toa (teste instável) leva todos a ignorarem o sinal: é preciso consertá-lo ou isolá-lo, não "tentar de novo".

**Resultados medidos (laboratório, Vitest 5.1.1 com cobertura v8):**
§§§
15 testes em 4 arquivos passaram | cobertura dos componentes: statements 100% (38/38), branches 100% (15/15), functions 100% (16/16), lines 100% (10/10)
(a cobertura mede execução: um teste sem asserção também a aumentaria)
§§§

**Exemplo de pipeline (GitHub Actions, esboço):**
§§§
- run: npm ci
- run: npm run lint && npm run typecheck
- run: npx vitest run --coverage
- run: npm run build
- run: npx playwright test        # somente em ramos principais
§§§
O pipeline acima é um esboço da documentação; não foi executado.

**Cenário ilustrativo (não medido):** uma equipe repetia a CI até ficar verde porque 3 testes E2E falhavam "às vezes". Ao registrar o histórico por teste, viu que dois dependiam do relógio e um de um dado compartilhado. A correção (fixar o tempo e criar dados por teste) eliminou a repetição e o tempo da CI caiu.`,
  code: [
    { title: 'Limiares de cobertura que impedem queda (configuração do Vitest)', lang: 'js', code: R`// vitest.config.mjs
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/*.stories.*'],
      thresholds: { branches: 80, functions: 80 }       // falha o pipeline abaixo do mínimo
    }
  }
});`, notes: [{ l: '6', t: 'Exclua testes e histórias para não distorcer o número.' }, { l: '7', t: 'Cobertura de ramos e funções informa mais que a de linhas; o limiar evita a queda, não busca 100%.' }] },
    { title: 'Pipeline de CI (esboço, GitHub Actions)', lang: 'yaml', code: R`name: ci
on: [pull_request]
jobs:
  testes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint && npm run typecheck
      - run: npx vitest run --coverage
      - run: npm run build`, notes: [{ l: '9', t: 'Cache de dependências e versão do Node fixa tornam a execução reprodutível.' }, { l: '10', t: 'Falhar cedo: análise estática antes dos testes.' }] }
  ],
  bestPractices: ['Escolha o teste mais barato que dá confiança suficiente e documente a estratégia.', 'Organize a CI do mais barato ao mais caro, falhando cedo e com feedback rápido.', 'Meça a instabilidade e trate a causa; use quarentena com prazo.', 'Use a cobertura (de ramos) para achar lacunas e evitar quedas, não como meta.', 'Escreva o teste que reproduz cada bug antes de corrigi-lo.', 'Revise e remova testes obsoletos e redundantes.'],
  mistakes: ['Repetir a CI até ficar verde.', 'Meta de 100% de cobertura como objetivo.', 'Suíte lenta que ninguém roda.', 'Quarentena sem prazo nem responsável.', 'E2E demais e dados compartilhados entre testes.', 'Estratégia só na cabeça de uma pessoa.'],
  market: `Em equipes sênior a conversa sobre testes é sobre estratégia: quais níveis, quanto custa, como manter a CI rápida e como tratar instabilidade. Descrever e defender essa estratégia, com métricas, é diferencial claro em entrevistas e funções de liderança técnica.`,
  summary: `A estratégia combina o nível mais barato que dá confiança para cada tipo de código (estático, unitário, componentes com MSW, visual, poucos E2E) e a documenta em um plano. Na CI, execute do mais barato ao mais caro, com cache e feedback rápido. Trate testes instáveis medindo, isolando, corrigindo a causa (nunca só repetindo). Use a cobertura para achar lacunas (medido: 100% nos componentes do laboratório) e limiares para evitar quedas, ciente de que mede execução e não verificação.`,
  refs: [REF3.testingTrophy, REF3.fowlerFlaky, REF3.vitestCov, REF3.pwRetries, REF3.ghActions],
  cards: [
    { q: 'Qual é a regra de ouro da estratégia de testes?', a: 'Usar o teste mais barato que dê confiança suficiente para cada risco.' },
    { q: 'Como tratar um teste instável?', a: 'Medir o histórico, colocar em quarentena com prazo, reproduzir, corrigir a causa (espera, estado, tempo) e não apenas repetir.' },
    { q: 'Por que a cobertura alta não prova qualidade?', a: 'Mede a execução das linhas, não a verificação do comportamento; testes sem asserções também a aumentam.' },
    { q: 'Em que ordem rodar as etapas da CI?', a: 'Da mais barata à mais cara, falhando cedo: instalar, análise estática, testes, build, visuais, E2E.' }
  ]
}
];
