// C4.6 — Logs e observabilidade: exercícios, avaliação final e projeto.
// Medições reais em pino 10.4.0, prom-client 15.1.3, Prometheus 3.16.0, OpenTelemetry (API 1.10.0, sdk-trace 3.1.1) e Node.js 26.13.1 (laboratório); o experimento de SLO é uma simulação; os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsets = {
'obs-01': [
  { id: 'obs-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual pilar da observabilidade mostra o caminho de uma única requisição por vários serviços?', options: ['Logs', 'Métricas', 'Traces', 'Alertas'], answer: 2, explanation: 'Os traces formam a árvore de spans de uma requisição.' },
  { id: 'obs-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: com o nível warn, 200 mil chamadas info levaram só alguns milissegundos no pino.', answer: true, explanation: 'Chamadas desligadas são quase gratuitas (6,5 ms).' },
  { id: 'obs-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a prática ao benefício.', pairs: [['Mensagem constante e dados em campos', 'Agrupar eventos iguais'], ['Redação de segredos na fonte', 'Evitar vazamento em logs'], ['AsyncLocalStorage + mixin', 'Id de correlação em todas as linhas'], ['Amostragem de logs de sucesso', 'Reduzir volume e custo']], explanation: 'Boas práticas de logging.' },
  { id: 'obs-01-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §redigir(obj, caminhos)§, que devolve uma cópia profunda de §obj§ (objetos simples) em que cada caminho de §caminhos§ (texto com pontos, como §"req.headers.authorization"§) vale §"[REDIGIDO]"§, se existir. Não altere o original.', lang: 'javascript', starter: 'function redigir(obj, caminhos) {\n  // seu código aqui\n}\n', hints: ['Copie com JSON.parse(JSON.stringify(...)).', 'Percorra cada caminho até o penúltimo nível.'], tests: [{ name: 'caminhos aninhados', code: R`const o = { senha: 'abc', cliente: { token: 'xyz', nome: 'Ana' }, req: { headers: { authorization: 'Bearer 1', host: 'x' } } };
const r = redigir(o, ['senha', 'cliente.token', 'req.headers.authorization']);
assert.equal(JSON.stringify(r), '{"senha":"[REDIGIDO]","cliente":{"token":"[REDIGIDO]","nome":"Ana"},"req":{"headers":{"authorization":"[REDIGIDO]","host":"x"}}}');
assert.equal(o.senha, 'abc');` }, { name: 'caminhos ausentes', code: R`const r = redigir({ a: 1 }, ['b', 'c.d']);
assert.equal(JSON.stringify(r), '{"a":1}');` }], solution: R`function redigir(obj, caminhos) {
  const copia = JSON.parse(JSON.stringify(obj));
  for (const c of caminhos) {
    const partes = c.split('.'); let no = copia;
    for (let i = 0; i < partes.length - 1 && no; i++) no = no[partes[i]];
    const ultimo = partes[partes.length - 1];
    if (no && typeof no === 'object' && ultimo in no) no[ultimo] = '[REDIGIDO]';
  }
  return copia;
}`, explanation: 'Mesma ideia da opção redact do pino.' },
  { id: 'obs-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Como correlacionar todos os logs de uma requisição em Node.js sem passar o logger por todas as funções? Cite três cuidados com o conteúdo dos logs.', model: 'Gera-se (ou aceita-se do cabeçalho) um id na entrada e guarda-se em um AsyncLocalStorage; um mixin do logger injeta o id em cada linha, e o id é devolvido na resposta e propagado às chamadas a outros serviços. Cuidados: nunca registrar senhas, tokens, cartões ou corpos inteiros (redação na fonte e minimização de dados pessoais), usar mensagens constantes com campos, definir retenção e controle de acesso e evitar níveis inadequados que geram ruído.', rubric: ['AsyncLocalStorage', 'Mixin ou injeção do id', 'Três cuidados', 'Propagação a outros serviços'], explanation: 'Resumo da aula.' },
  { id: 'obs-01-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §agruparPorReqId(linhas)§, que recebe uma lista de textos JSON (linhas de log com §reqId§ e §msg§) e devolve um objeto §reqId → lista de msg§, preservando a ordem de chegada em cada grupo. Linhas sem §reqId§ vão para a chave §"sem-id"§.', lang: 'javascript', starter: 'function agruparPorReqId(linhas) {\n  // seu código aqui\n}\n', hints: ['Use JSON.parse em cada linha.', 'Crie o array do grupo na primeira ocorrência.'], tests: [{ name: 'agrupamento', code: R`const l = ['{"reqId":"r-1","msg":"início"}', '{"reqId":"r-2","msg":"início"}', '{"reqId":"r-1","msg":"fim"}', '{"msg":"boot"}'].map((x) => x);
assert.equal(JSON.stringify(agruparPorReqId(l)), '{"r-1":["início","fim"],"r-2":["início"],"sem-id":["boot"]}');` }, { name: 'vazio', code: R`assert.equal(JSON.stringify(agruparPorReqId([])), '{}');` }], solution: R`function agruparPorReqId(linhas) {
  const grupos = {};
  for (const l of linhas) {
    const o = JSON.parse(l); const id = o.reqId ?? 'sem-id';
    (grupos[id] ??= []).push(o.msg);
  }
  return grupos;
}`, explanation: 'É a consulta mais comum em uma investigação.' }
],
'obs-02': [
  { id: 'obs-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual tipo de métrica usar para a latência das requisições?', options: ['Counter', 'Gauge', 'Histogram', 'Nenhum'], answer: 2, explanation: 'O histograma permite estimar percentis e agregá-los entre instâncias.' },
  { id: 'obs-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Usar o id do usuário como label de uma métrica é seguro porque o Prometheus compacta as séries.', answer: false, explanation: 'Cada valor cria uma série: medido, 50 mil séries geraram 1,6 MiB por coleta e 426 ms para gerar.' },
  { id: 'obs-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o tipo de métrica ao exemplo.', pairs: [['Counter', 'http_requests_total'], ['Gauge', 'Jobs na fila agora'], ['Histogram', 'Duração das requisições em buckets'], ['Gauge (processo)', 'nodejs_eventloop_lag_seconds']], explanation: 'Escolha do tipo conforme o comportamento.' },
  { id: 'obs-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §estimarPercentil(limites, cumulativos, total, q)§, como o §histogram_quantile§. §limites§ são os limites superiores crescentes dos buckets, §cumulativos§ as contagens acumuladas (≤ limite) e §total§ o número total de observações. Encontre o primeiro bucket i com §cumulativos[i] >= q * total§ e interpole linearmente: §inf + (limites[i] - inf) * ((alvo - anterior) / (cumulativos[i] - anterior))§, em que §inf§ é §limites[i-1]§ (ou 0) e §anterior§ é §cumulativos[i-1]§ (ou 0).', lang: 'javascript', starter: 'function estimarPercentil(limites, cumulativos, total, q) {\n  // seu código aqui\n}\n', hints: ['alvo = q * total.', 'Trate o primeiro bucket com inf = 0 e anterior = 0.'], tests: [{ name: 'dados do curso', code: R`const limites = [0.05, 0.1, 0.25]; const cum = [741, 948, 1000];
assert.equal(estimarPercentil(limites, cum, 1000, 0.95).toFixed(4), '0.1058');
assert.equal(estimarPercentil(limites, cum, 1000, 0.5).toFixed(4), '0.0337');` }, { name: 'bordas', code: R`assert.equal(estimarPercentil([1, 2], [10, 20], 20, 0.25).toFixed(2), '0.50');
assert.equal(estimarPercentil([1, 2], [10, 20], 20, 1).toFixed(2), '2.00');` }], solution: R`function estimarPercentil(limites, cumulativos, total, q) {
  const alvo = q * total;
  const i = cumulativos.findIndex((c) => c >= alvo);
  const inf = i === 0 ? 0 : limites[i - 1], ant = i === 0 ? 0 : cumulativos[i - 1];
  return inf + (limites[i] - inf) * ((alvo - ant) / (cumulativos[i] - ant));
}`, explanation: 'A interpolação explica por que buckets largos dão estimativas imprecisas (p99: 221 ms x 164 ms).' },
  { id: 'obs-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique como um trace localiza o gargalo e como a amostragem mantém o custo sob controle.', model: 'O traceparent propaga o traceId e o spanId entre serviços, formando uma árvore de spans com durações: no laboratório, de 54 ms totais, a consulta SQL do estoque ocupava ~30 ms, apontando o gargalo que a métrica só mostraria como lento. A amostragem head-based (por exemplo 10%) com ParentBased mantém traces completos e reduz o custo; combina-se com a gravação de 100% dos erros (tail-based, via coletor) e o traceId nos logs.', rubric: ['Propagação do traceparent', 'Árvore de spans e durações', 'Amostragem e ParentBased', 'Ligação com logs'], explanation: 'Resumo da aula.' },
  { id: 'obs-02-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §seriesHistograma(valoresPorLabel, nBuckets)§: número de séries de um histograma. §valoresPorLabel§ é a lista de quantidades de valores distintos de cada label; as combinações são o produto delas (lista vazia = 1 combinação). Cada combinação gera §nBuckets + 1§ séries de bucket (incluindo +Inf) mais §_sum§ e §_count§.', lang: 'javascript', starter: 'function seriesHistograma(valoresPorLabel, nBuckets) {\n  // seu código aqui\n}\n', hints: ['Produto com reduce.', 'Séries por combinação = nBuckets + 1 + 2.'], tests: [{ name: 'exemplos', code: R`assert.equal(seriesHistograma([], 8), 11);
assert.equal(seriesHistograma([10, 4], 8), 440);` }, { name: 'explosão', code: R`assert.equal(seriesHistograma([1000], 10), 13000);
assert.equal(seriesHistograma([5, 5, 5], 0), 375);` }], solution: R`function seriesHistograma(valoresPorLabel, nBuckets) {
  const combinacoes = valoresPorLabel.reduce((a, b) => a * b, 1);
  return combinacoes * (nBuckets + 1 + 2);
}`, explanation: 'Labels multiplicam a cardinalidade.' }
],
'obs-03': [
  { id: 'obs-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual função do PromQL devolve a taxa por segundo de um counter?', options: ['sum()', 'rate()', 'avg()', 'absent()'], answer: 1, explanation: 'rate() é ajustada a reinícios do contador.' },
  { id: 'obs-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: a razão de erros acumulada (11,21%) mostrou bem o incidente de 30% de erros.', answer: false, explanation: 'O acumulado mascara o incidente; use taxas em janelas (2,4% → 31,4% → 2,1%).' },
  { id: 'obs-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o estado ao alerta.', pairs: [['inactive', 'A condição é falsa'], ['pending', 'A condição é verdadeira, aguardando o tempo do for'], ['firing', 'A condição persistiu pelo tempo do for'], ['resolvido', 'A condição voltou a ser falsa']], explanation: 'Ciclo de vida de um alerta do Prometheus.' },
  { id: 'obs-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §taxa(amostras)§: taxa por segundo de um counter. §amostras§ é uma lista ordenada §[tempoEmSegundos, valor]§. Some os incrementos entre amostras consecutivas (se o valor diminuir, houve reinício do contador: o incremento é o novo valor) e divida pelo intervalo entre a primeira e a última amostra. Menos de 2 amostras → §0§.', lang: 'javascript', starter: 'function taxa(amostras) {\n  // seu código aqui\n}\n', hints: ['Percorra os pares consecutivos.', 'Em reinício, incremento = v2.'], tests: [{ name: 'crescimento e reinício', code: R`assert.equal(taxa([[0, 0], [10, 100]]), 10);
assert.equal(taxa([[0, 100], [10, 200], [20, 50]]), 7.5);` }, { name: 'bordas', code: R`assert.equal(taxa([[0, 5]]), 0);
assert.equal(taxa([]), 0);
assert.equal(taxa([[0, 10], [5, 10]]), 0);` }], solution: R`function taxa(amostras) {
  if (amostras.length < 2) return 0;
  let inc = 0;
  for (let i = 1; i < amostras.length; i++) {
    const a = amostras[i - 1][1], b = amostras[i][1];
    inc += b >= a ? b - a : b;
  }
  return inc / (amostras[amostras.length - 1][0] - amostras[0][0]);
}`, explanation: 'É o que o rate() faz (sem a extrapolação).' },
  { id: 'obs-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Que alertas você criaria para uma API e por que alertar em sintomas e não em causas? Cite elementos de um bom alerta.', model: 'Alertas de sintomas: razão de erros 5xx acima do limite ou burn rate do SLO alto, latência p95/p99 acima do SLO e saturação que afeta usuários (fila crescendo, event loop atrasado). Eles refletem o impacto ao usuário e são acionáveis; causas como CPU alta viram painéis e diagnóstico, para evitar fadiga de alertas. Um bom alerta tem for/janelas, severidade, resumo claro, runbook, dono e foi testado simulando o incidente.', rubric: ['Alertas de erros e latência', 'Sintoma x causa', 'for e janelas', 'Runbook e teste'], explanation: 'Resumo da aula.' },
  { id: 'obs-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §estadoAlerta(historico, limiar, forSeg)§. §historico§ é uma lista ordenada §{ t, valor }§ (segundos). Estado no último ponto: §"inactive"§ se §valor <= limiar§; senão ache o início da sequência contínua mais recente com §valor > limiar§: se (§t_ultimo - t_inicio >= forSeg§) → §"firing"§, senão §"pending"§. Lista vazia → §"inactive"§.', lang: 'javascript', starter: 'function estadoAlerta(historico, limiar, forSeg) {\n  // seu código aqui\n}\n', hints: ['Percorra de trás para a frente enquanto valor > limiar.', 'O início é o primeiro ponto da sequência contínua.'], tests: [{ name: 'estados', code: R`const h = [{ t: 0, valor: 0.02 }, { t: 1, valor: 0.3 }, { t: 2, valor: 0.31 }];
assert.equal(estadoAlerta(h, 0.1, 3), 'pending');
assert.equal(estadoAlerta([...h, { t: 4, valor: 0.3 }], 0.1, 3), 'firing');
assert.equal(estadoAlerta([...h, { t: 5, valor: 0.02 }], 0.1, 3), 'inactive');` }, { name: 'sequência interrompida e vazio', code: R`const h = [{ t: 0, valor: 0.3 }, { t: 1, valor: 0.3 }, { t: 2, valor: 0.01 }, { t: 3, valor: 0.3 }];
assert.equal(estadoAlerta(h, 0.1, 2), 'pending');
assert.equal(estadoAlerta([], 0.1, 2), 'inactive');` }], solution: R`function estadoAlerta(historico, limiar, forSeg) {
  if (!historico.length) return 'inactive';
  const n = historico.length;
  if (!(historico[n - 1].valor > limiar)) return 'inactive';
  let i = n - 1;
  while (i > 0 && historico[i - 1].valor > limiar) i--;
  return historico[n - 1].t - historico[i].t >= forSeg ? 'firing' : 'pending';
}`, explanation: 'Modela o for das regras de alerta.' }
],
'obs-04': [
  { id: 'obs-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual a indisponibilidade permitida em 30 dias para um SLO de 99,9%?', options: ['4,3 minutos', '43,2 minutos', '7,2 horas', '72 horas'], answer: 1, explanation: '0,1% de 43.200 minutos = 43,2 minutos.' },
  { id: 'obs-04-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'O SLA é a meta interna de confiabilidade, e o SLO é o contrato com o cliente.', answer: false, explanation: 'O SLO é a meta; o SLA é o contrato com consequências, normalmente menos rígido que o SLO.' },
  { id: 'obs-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a taxa de erro ao burn rate para um SLO de 99,9%.', pairs: [['0,10%', '1x'], ['1,00%', '10x'], ['1,44%', '14,4x'], ['5,00%', '50x']], explanation: 'Burn rate = taxa observada ÷ 0,1%.' },
  { id: 'obs-04-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §orcamentoMinutos(slo, dias)§: minutos de indisponibilidade permitidos, §(1 - slo) * dias * 24 * 60§, arredondados para uma casa decimal (número).', lang: 'javascript', starter: 'function orcamentoMinutos(slo, dias) {\n  // seu código aqui\n}\n', hints: ['Converta dias em minutos.', 'Use Math.round(x * 10) / 10.'], tests: [{ name: 'tabela do curso', code: R`assert.equal(orcamentoMinutos(0.999, 30), 43.2);
assert.equal(orcamentoMinutos(0.99, 30), 432);
assert.equal(orcamentoMinutos(0.9999, 30), 4.3);` }, { name: 'outra janela', code: R`assert.equal(orcamentoMinutos(0.995, 7), 50.4);
assert.equal(orcamentoMinutos(1, 30), 0);` }], solution: R`function orcamentoMinutos(slo, dias) {
  return Math.round((1 - slo) * dias * 24 * 60 * 10) / 10;
}`, explanation: 'Cada nove a mais divide o orçamento por 10.' },
  { id: 'obs-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare um alerta de limiar fixo com alertas de burn rate de múltiplas janelas, usando a simulação do curso.', model: 'Na simulação de 3 horas, o limiar fixo (erro > 1% em 5 min) disparou nos minutos 30 e 92 (rápido, mas dispararia por qualquer pico e não mede o impacto no orçamento); o burn rate 14,4x (1 h e 5 min) disparou nos minutos 32 e 133 (rápido para o incidente severo, tardio para o lento de 2%); o 6x (3 h e 30 min) nos 30 e 99 e o 6x (1 h e 5 min) nos 30 e 108. Combinam-se pares rápidos e lentos; a janela curta garante que o problema ainda ocorre e permite resolver depressa. É um modelo: calibre com dados reais, tráfego e sazonalidade.', rubric: ['Resultados do limiar fixo', 'Resultados de pelo menos um burn rate', 'Por que combinar janelas', 'Ressalva de modelo'], explanation: 'Análise da simulação.' },
  { id: 'obs-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §paginar(razaoLonga, razaoCurta, slo, limiar)§: devolva §true§ se o burn rate da janela longa e o da janela curta forem ambos maiores que §limiar§. Burn rate = §razao / (1 - slo)§.', lang: 'javascript', starter: 'function paginar(razaoLonga, razaoCurta, slo, limiar) {\n  // seu código aqui\n}\n', hints: ['Calcule o orçamento (1 - slo).', 'Use && entre as duas comparações.'], tests: [{ name: 'dois casos', code: R`assert.equal(paginar(0.02, 0.03, 0.999, 14.4), true);
assert.equal(paginar(0.02, 0.0005, 0.999, 14.4), false);` }, { name: 'borda', code: R`assert.equal(paginar(0.0144, 0.0144, 0.999, 14.4), false);
assert.equal(paginar(0.0145, 0.0145, 0.999, 14.4), true);` }], solution: R`function paginar(razaoLonga, razaoCurta, slo, limiar) {
  const orcamento = 1 - slo;
  return razaoLonga / orcamento > limiar && razaoCurta / orcamento > limiar;
}`, explanation: 'A janela curta impede o alerta de durar além do problema.' }
]
};

const P = 'observabilidade-p';
export const assessment = {
  id: 'observabilidade', title: 'Avaliação final — Logs e observabilidade', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual campo permite ligar os logs, as métricas e os traces de uma mesma requisição?', options: ['O nível do log', 'O id de correlação (traceId ou reqId)', 'O nome do host', 'O timestamp'], answer: 1, explanation: 'O id de correlação acompanha a requisição.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: 50 mil valores distintos de um label geraram uma resposta de /metrics de ~1,6 MiB e ~426 ms para gerar.', answer: true, explanation: 'Cardinalidade alta é um risco de custo e desempenho.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Trace medido: 54 ms no total; a consulta SQL do estoque levou 30 ms.', code: 'HTTP GET (cliente) 54,1 ms\n└ GET /x (pedidos) 47,3 ms\n   └ GET /x (estoque) 32,3 ms\n      └ consulta SQL 30,0 ms', lang: 'text', steps: [{ q: 'Onde está o gargalo?', answers: ['consulta SQL', 'sql', 'estoque'] }, { q: 'Quantos traceIds distintos há nesse trace?', answers: ['1', 'um'] }], explanation: 'Um trace localiza o gargalo.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual consulta PromQL estima o p95 a partir de um histograma?', options: ['rate(http_request_duration_seconds_sum[5m])', 'histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))', 'avg(http_request_duration_seconds)', 'max(http_requests_total)'], answer: 1, explanation: 'Aplique rate aos buckets e agregue por le.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que cria uma explosão de cardinalidade.', code: 'const c = new client.Counter({ name: "acessos_total", help: "x", labelNames: ["usuario", "url"] });\napp.use((req, res, next) => {\n  res.on("finish", () => c.inc({ usuario: req.user.id, url: req.originalUrl }));\n  next();\n});', answer: 3, explanation: 'userId e a URL completa são ilimitados; use rota padronizada e sem ids.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a condição de um alerta que só dispara se persistir por 3 segundos.', code: 'alert: TaxaDeErrosAlta\nexpr: api:erros:razao_10s > 0.10\n[[0]]: 3s', answers: [['for']], explanation: 'O for evita alertas por picos curtos.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o fato medido ao tema.', pairs: [['p99 estimado 221 ms x exato 164 ms', 'Escolha dos buckets'], ['203 de 2.000 traces com razão 0,1', 'Amostragem head-based'], ['TaxaDeErrosAlta: firing na fase 2 e resolvido na 3', 'Alerta de sintoma com for'], ['99,9% em 30 dias = 43,2 minutos', 'Orçamento de erro']], explanation: 'Experimentos das aulas 2 a 4.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual o burn rate de uma taxa de erro de 1% para um SLO de 99,9%?', options: ['1x', '10x', '100x', '0,1x'], answer: 1, explanation: '1% ÷ 0,1% = 10x: esgota o orçamento de 30 dias em 3 dias.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Alertar quando a CPU passa de 80% é, em geral, melhor que alertar em erros e latência percebidos pelo usuário.', answer: false, explanation: 'Alertas devem ser de sintomas acionáveis; a CPU alta é causa e vira painel de diagnóstico.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'O que fazer quando o orçamento de erro de um serviço se esgota?', options: ['Ignorar', 'Congelar mudanças de risco e investir em confiabilidade', 'Aumentar o SLO sem mudar nada', 'Desligar o monitoramento'], answer: 1, explanation: 'O orçamento alinha produto e engenharia.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a observabilidade de uma API (logs, métricas, traces, alertas por SLO e runbooks) e diga como diagnosticaria um incidente.', model: 'Logs JSON com reqId (AsyncLocalStorage), redação e uma linha por requisição; métricas RED com rotas padronizadas, buckets perto do SLO e saturação (event loop, fila); traces OpenTelemetry com propagação por HTTP e jobs, amostragem com 100% de erros e traceId nos logs; Prometheus com regras de gravação e alertas de burn rate (rápido e lento) para SLOs de disponibilidade e latência, com runbooks; dashboard RED. No incidente: o alerta de burn rate dispara, a métrica mostra o serviço e o intervalo, o trace localiza o span lento e o log com o mesmo traceId explica a causa; depois, post-mortem sem culpados com ações.', rubric: ['Logs com correlação', 'Métricas RED e cardinalidade', 'Traces e amostragem', 'Alertas de burn rate e runbooks', 'Fluxo de diagnóstico'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que o Prometheus coleta por pull?', options: ['Porque é mais rápido que push', 'Porque detecta alvos fora do ar e facilita a depuração do /metrics', 'Porque não precisa de rede', 'Porque dispensa configuração'], answer: 1, explanation: 'A métrica up e o /metrics legível são vantagens do modelo pull.' }
  ]
};

export const project = {
  id: 'observabilidade-api', name: 'Observabilidade de uma API: logs, métricas, traces, Prometheus, alertas por SLO e runbooks', lv: 'A', stack: 'Node.js, Express 5, pino, prom-client, OpenTelemetry, Prometheus 3, Grafana (opcional), PostgreSQL, BullMQ', ds: ['obs'],
  desc: 'Instrumente uma **API Express** com **logs estruturados** (reqId, redação), **métricas RED e de saturação** (rotas padronizadas, buckets em volta do SLO, cardinalidade controlada), **traces OpenTelemetry** (HTTP e jobs, amostragem, traceId nos logs), **Prometheus** com **regras de gravação** e **alertas de burn rate** para um **SLO de 99,5%** e de latência, **runbooks** e um **post-mortem** de um incidente injetado.',
  rf: ['Logs JSON com serviço, versão, reqId (AsyncLocalStorage), redação de segredos e uma linha por requisição', 'Métricas RED, event loop e fila (tamanho e idade) com rota padronizada, buckets perto do SLO e teste que limita a cardinalidade', 'Traces com propagação por HTTP e para jobs, amostragem (10% mais 100% de erros) e traceId nos logs', 'Prometheus coletando a API, com regras de gravação e alertas de burn rate (rápido e lento) e de latência p95', 'Dashboard RED (JSON versionado ou descrição dos painéis)', 'Runbooks por alerta e checklist de incidente', 'Incidente injetado (taxa de erros e lentidão) detectado pelo alerta e diagnosticado por métrica, trace e log', 'Post-mortem sem culpados com ações, donos e prazos e um ADR com SLIs, SLOs e janelas'],
  rnf: ['Nenhum segredo ou dado pessoal desnecessário nos logs', 'Versões fixas (pino, prom-client, OpenTelemetry, Prometheus) registradas', 'README com medições e o que não foi coberto', 'Testes automatizados da redação, das métricas e dos alertas simulados'],
  ac: ['O alerta de burn rate dispara no incidente injetado e resolve após a recuperação', 'O número de séries fica abaixo do limite definido com tráfego realista', 'Dado um traceId, é possível ir do alerta ao trace e ao log', 'O custo de logs e traces é estimado e a retenção definida', 'O ADR justifica os SLOs e os limiares com cálculo do orçamento de erro'],
  ch: ['Adicionar Grafana com provisionamento do dashboard', 'Rodar o OpenTelemetry Collector com amostragem tail-based', 'Adicionar exemplars às métricas ligando ao trace', 'Configurar o Alertmanager com roteamento e silenciamento', 'Implementar SLOs de latência e de frescor de jobs']
};
