// C6.6 — Monitoramento. Aulas 1 e 2 (logs e métricas; Prometheus).
const R = String.raw;

export const REF = {
  sreMonitoring: { title: 'Google SRE Book — Monitoring Distributed Systems', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', kind: 'livro' },
  otelSignals: { title: 'OpenTelemetry — Signals (traces, metrics, logs)', url: 'https://opentelemetry.io/docs/concepts/signals/', kind: 'doc' },
  promOverview: { title: 'Prometheus — Overview', url: 'https://prometheus.io/docs/introduction/overview/', kind: 'doc' },
  promTypes: { title: 'Prometheus — Metric types', url: 'https://prometheus.io/docs/concepts/metric_types/', kind: 'doc' },
  promNaming: { title: 'Prometheus — Metric and label naming', url: 'https://prometheus.io/docs/practices/naming/', kind: 'guia' },
  promHistograms: { title: 'Prometheus — Histograms and summaries', url: 'https://prometheus.io/docs/practices/histograms/', kind: 'guia' },
  promExposition: { title: 'Prometheus — Exposition formats', url: 'https://prometheus.io/docs/instrumenting/exposition_formats/', kind: 'doc' },
  promQuery: { title: 'Prometheus — Querying basics (PromQL)', url: 'https://prometheus.io/docs/prometheus/latest/querying/basics/', kind: 'doc' },
  promFunctions: { title: 'Prometheus — Query functions', url: 'https://prometheus.io/docs/prometheus/latest/querying/functions/', kind: 'doc' },
  promRecording: { title: 'Prometheus — Recording rules', url: 'https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/', kind: 'doc' },
  promConfig: { title: 'Prometheus — Configuration', url: 'https://prometheus.io/docs/prometheus/latest/configuration/configuration/', kind: 'doc' },
  promInstrument: { title: 'Prometheus — Instrumentation best practices', url: 'https://prometheus.io/docs/practices/instrumentation/', kind: 'guia' }
};

export const lessonsA = [
{
  id: 'mon-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['observabilidade', 'logs', 'métricas', 'RED', 'USE', 'golden signals', 'cardinalidade', 'histograma', 'p95'],
  title: 'Logs e métricas: os sinais da observabilidade, o que cada um responde e o custo de cada escolha',
  objectives: ['Diferenciar monitoramento e observabilidade e os três sinais (logs, métricas, traces)', 'Estruturar logs em JSON e escolher campos úteis', 'Escolher o tipo de métrica (counter, gauge, histogram) e entender cardinalidade', 'Aplicar os modelos RED, USE e os quatro sinais dourados e interpretar a aproximação de um histograma'],
  intro: R`**Sem observação, produção é um palpite.** **Monitoramento** responde **"está bom?"** (**métricas e alertas para perguntas conhecidas**); **observabilidade** responde **"por que não está?"** (**dados ricos o bastante para investigar perguntas novas**). **Aqui você instrumenta uma aplicação de verdade** (**métricas e logs**), **gera tráfego** e **compara** **o que cada sinal diz** — **inclusive um p95 de histograma contra o p95 exato dos logs**. **Tudo foi executado localmente** (**Node 26.13.1, Prometheus 3.16.0**).`,
  theory: R`### Os três sinais
- **Logs:** **registros de eventos discretos** (**"o que aconteceu"**): **ricos em detalhe**, **caros em volume**, **bons para depurar um caso**.
- **Métricas:** **números agregados ao longo do tempo** (**"quanto"**): **baratas, compactas, boas para tendências e alertas**; **perdem o detalhe individual**.
- **Traces:** **o caminho de uma requisição entre serviços** (**"onde o tempo foi gasto"**): **essenciais em sistemas distribuídos**; **o OpenTelemetry** **padroniza coleta dos três sinais**. **Traces e OpenTelemetry não foram executados neste curso.**
**Uso combinado:** **a métrica avisa** (**taxa de erro subiu**), **o trace localiza** (**qual serviço**), **o log explica** (**qual erro**).

### Logs estruturados
**Texto livre** (**"deu erro no pedido 123"**) **é difícil de filtrar e agregar**. **Logs estruturados** (**JSON, uma linha por evento**) **permitem consultar por campos**. **O formato do laboratório:**
§§§
{"ts":"2026-11-26T00:38:12.101Z","nivel":"info","rota":"/ok","status":200,"duracao_ms":35.797,"id":412}
§§§
**Campos úteis:** **carimbo de tempo (UTC, ISO 8601)**, **nível** (§debug/info/warn/error§), **mensagem ou tipo do evento**, **identificador de correlação** (**ID de requisição/trace**), **rota, status, duração, usuário ou tenant (sem dados pessoais desnecessários)**. **Boas práticas:** **níveis consistentes**; **nunca registrar senhas, tokens ou dados pessoais** (**LGPD**); **logs vão para a saída padrão** (**em contêineres: o runtime coleta**); **amostragem ou limites** para **evitar custo e ruído**; **retenção definida**.
**Medido (laboratório):** **o app escreveu 1.310 linhas JSON** (**1.190 com status 200 e 120 com 500**) **e o Prometheus contou os mesmos 1.190 casos de §/ok 200§**: **métricas e logs concordam quando bem instrumentados**.

### Tipos de métricas
| Tipo | O que é | Exemplo | Como consultar |
|---|---|---|---|
| **Counter** | **só cresce** (reinicia em 0 ao reiniciar o processo) | §http_requests_total§ | **§rate()§ / §increase()§**; **nunca o valor bruto** |
| **Gauge** | **sobe e desce** | **memória em uso, fila, temperatura** | **valor atual, §avg_over_time§** |
| **Histogram** | **contagens por faixas (buckets) + soma + contagem** | §http_request_duration_seconds§ | **§histogram_quantile()§**, agregável entre instâncias |
| **Summary** | **quantis calculados no cliente** | **latência** | **não agregáveis entre instâncias**; **o histograma costuma ser preferível** |
**Convenções de nome (Prometheus):** **unidades base** (**segundos, bytes**) **no nome** (§_seconds§, §_bytes§), **sufixo §_total§ em counters**, **nomes no singular e sem unidades misturadas**, **o mesmo nome em todas as instâncias**.

### Cardinalidade: o custo escondido
**Cada combinação única de rótulos é uma série temporal.** **Rótulos com valores ilimitados** (**ID de usuário, URL completa, ID de pedido, e-mail**) **explodem a memória e o custo**. **Regra:** **rótulos com poucos valores (rota *template*, método, classe de status)**; **detalhe individual vai para logs/traces, não para métricas**. **No laboratório:** **2 rotas × 2 status = 4 séries de contador** (**e 9 por rota no histograma**): **pequeno e controlado**. **Usar §/pedidos/123§ como rótulo** **criaria uma série por pedido**.

### Modelos para escolher o que medir
- **RED** (**para serviços**): ***Rate*** (**requisições/s**), ***Errors*** (**% de falhas**), ***Duration*** (**latência**).
- **USE** (**para recursos**: **CPU, disco, rede**): ***Utilization***, ***Saturation***, ***Errors***.
- **Quatro sinais dourados (Google SRE):** **latência, tráfego, erros e saturação**. **Cuidado com a latência:** **separe o tempo de requisições com sucesso do de falhas** (**uma falha rápida "melhora" a média**).
**Percentis, não médias:** **a média esconde a cauda**; **o p95/p99** **mostra o que os usuários mais lentos sentem**. **No laboratório**, **o ciclo de latências de §/ok§ era 5, 8, 12, 20, 35, 50, 70, 90, 120 e 300 ms: média ≈ 71 ms (**o que parece ótimo**), p50 ≈ 36–50 ms e **p95 ≈ 300 ms**: **a cauda é 4 a 8 vezes maior que a mediana**.

### Histograma x valor exato (medido)
**O histograma guarda contagens por *bucket*** (**≤ 5 ms, ≤ 10 ms, ... ≤ 1 s, +Inf**) **e o quantil é interpolado linearmente dentro do bucket**. **Medido:**
| Fonte | p95 |
|---|---|
| **Logs (exato, 1.190 amostras de §/ok§)** | **300,172 ms** |
| **§histogram_quantile(0,95)§ no Prometheus** | **0,375 s** |
**Por quê:** **90% das amostras ficam em ≤ 0,25 s e o p95 cai no bucket (0,25 s; 0,5 s]**; **a interpolação supõe distribuição uniforme dentro dele**: **0,25 + 0,25 × (0,95−0,90)/(1,00−0,90) = 0,375**. **O erro de ~25% é do bucket largo, não do Prometheus.** **Soluções:** **buckets mais finos perto do limite de interesse (SLO)**, **histogramas nativos** (**recurso recente do Prometheus; não executado**) **ou cálculo a partir de logs/traces** para **análises pontuais**. **Lição prática:** **escolha os buckets em torno dos limites que importam** (**ex.: 100 ms, 250 ms, 500 ms**).

### Contador ausente não é zero
**Medido:** **antes do primeiro erro**, **a razão de erros (§5xx / total§) retornou "vazio"**: **a série com status 5xx ainda não existia**. **Armadilha de painéis e alertas:** **"sem série" ≠ 0**. **Soluções:** **inicializar os contadores com 0 na instrumentação** (**boa prática do cliente**), **ou §... or vector(0)§** **na consulta**, **ou usar §absent()§ de forma consciente**.

### Dois pontos de partida para a prática
1. **Instrumentar uma rota:** **contador por (rota, classe de status)** **e histograma de duração**.
2. **Log por requisição em JSON** com **ID de correlação**.
**Próxima aula:** **o Prometheus coleta e consulta estas métricas**.

### Executado e não executado
**Executado:** **instrumentação à mão**, **logs JSON**, **comparação histograma x exato**. **Não executado:** **bibliotecas cliente oficiais**, **traces e OpenTelemetry**, **Loki/ELK**, **histogramas nativos**.`,
  concepts: [
    { term: 'Observabilidade', def: 'Capacidade de entender o estado interno de um sistema a partir de seus sinais externos (logs, métricas e traces) e de investigar perguntas novas.' },
    { term: 'Log estruturado', def: 'Registro de evento em formato legível por máquina, como JSON, com campos consultáveis.' },
    { term: 'Counter', def: 'Métrica que só aumenta (e reinicia no restart), consultada por taxa e incremento.' },
    { term: 'Histogram', def: 'Métrica que conta observações por faixas (buckets) e permite estimar quantis, de forma agregável.' },
    { term: 'Cardinalidade', def: 'Número de séries temporais distintas geradas pelas combinações de valores de rótulos.' },
    { term: 'RED', def: 'Modelo de serviço: taxa de requisições, erros e duração.' },
    { term: 'USE', def: 'Modelo de recursos: utilização, saturação e erros.' },
    { term: 'Percentil (p95)', def: 'Valor abaixo do qual está 95% das observações, usado para descrever a cauda da latência.' }
  ],
  examples: R`**Analogia:** **o carro tem painel** (**métricas**: velocidade, temperatura), **diário de bordo** (**logs**: "às 10h12 parou no semáforo") **e GPS com o trajeto** (**traces**). **O painel avisa** que **a temperatura subiu**, **o GPS mostra por onde passou**, **o diário explica o evento**. **A cardinalidade é o painel ter um mostrador para cada passageiro**: **caro e ilegível**.

**Exemplo concreto (medido):** **o mesmo conjunto de 1.190 requisições tem p95 exato de 300,172 ms nos logs e 0,375 s no histograma**; **a média do ciclo (~71 ms) esconderia a cauda**; **e a razão de erros veio "vazio" antes do primeiro 500**.`,
  code: [
    { title: 'Instrumentação à mão no formato de exposição do Prometheus (laboratório, Node 26.13.1)', lang: 'javascript', code: R`const BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1];
const contadores = new Map(); const hist = new Map();
const inc = (rota, status) => contadores.set(rota + '|' + status, (contadores.get(rota + '|' + status) || 0) + 1);
function observar(rota, seg) {
  const h = hist.get(rota) || { b: BUCKETS.map(() => 0), soma: 0, cont: 0 };
  BUCKETS.forEach((le, i) => { if (seg <= le) h.b[i]++; });
  h.soma += seg; h.cont++; hist.set(rota, h);
}
// após responder:
//   inc('/ok', 200); observar('/ok', duracaoEmSegundos);
//   console.log(JSON.stringify({ ts: new Date().toISOString(), nivel: 'info', rota: '/ok', status: 200, duracao_ms: 35.8, id: 412 }));`, notes: [{ l: 1, t: 'Buckets em segundos; escolha-os em torno dos limites de interesse.' }, { l: 3, t: 'Rótulos: só rota e status, poucos valores.' }, { l: 5, t: 'Histograma acumulativo: cada observação conta em todos os buckets com le >= valor.' }] },
    { title: 'Saída em texto da exposição (trecho)', lang: 'text', code: R`# TYPE http_requests_total counter
http_requests_total{rota="/ok",status="200"} 1190
http_requests_total{rota="/erro",status="500"} 120
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{rota="/ok",le="0.25"} 1071
http_request_duration_seconds_bucket{rota="/ok",le="0.5"} 1190
http_request_duration_seconds_bucket{rota="/ok",le="+Inf"} 1190
http_request_duration_seconds_sum{rota="/ok"} 84.7
http_request_duration_seconds_count{rota="/ok"} 1190`, notes: [{ l: 2, t: 'Os valores de contadores são os medidos; os de buckets ilustram o formato.' }, { l: 6, t: 'O bucket +Inf contém todas as observações.' }] }
  ],
  bestPractices: ['Estruture os logs em JSON com tempo, nível, correlação e campos úteis, sem dados pessoais ou segredos.', 'Use counter com rate(), gauge para valores instantâneos e histograma para latência.', 'Mantenha os rótulos com poucos valores; detalhes individuais vão para logs e traces.', 'Siga RED para serviços e USE para recursos e acompanhe os quatro sinais dourados.', 'Use percentis em vez de médias e escolha buckets em torno dos limites de SLO.', 'Inicialize contadores em zero para que a ausência de série não pareça ausência de dados.', 'Combine os sinais: métrica avisa, trace localiza, log explica.'],
  mistakes: ['Logs em texto livre sem estrutura nem correlação.', 'Rótulos de alta cardinalidade (ID de usuário, URL completa).', 'Olhar médias de latência.', 'Usar o valor bruto de um counter em vez de rate.', 'Buckets de histograma distantes do SLO.', 'Registrar segredos ou dados pessoais em logs.', 'Tratar série ausente como zero.'],
  market: R`**Observabilidade** é **requisito de SRE e plataforma**; **explicar RED/USE, percentis, cardinalidade e o custo de logs** **é pergunta comum** em **entrevistas**.`,
  summary: R`Logs respondem o que aconteceu, métricas quanto e traces onde; a métrica avisa, o trace localiza e o log explica. Logs devem ser estruturados em JSON, com correlação e sem dados sensíveis. Counters, gauges e histogramas têm usos distintos, e rótulos de alta cardinalidade explodem o custo. RED e USE guiam o que medir, e percentis revelam a cauda. No laboratório, 1.190 requisições de /ok tiveram p95 exato de 300,172 ms nos logs e 0,375 s no histograma, por causa da largura dos buckets; as contagens de logs e métricas coincidiram e a razão de erros veio vazia antes do primeiro 500. Traces, OpenTelemetry, Loki e histogramas nativos não foram executados.`,
  refs: [REF.sreMonitoring, REF.otelSignals, REF.promTypes, REF.promNaming, REF.promHistograms, REF.promExposition, REF.promInstrument],
  cards: [
    { q: 'Qual a diferença entre monitoramento e observabilidade?', a: 'Monitoramento responde a perguntas conhecidas (está bom?); observabilidade permite investigar perguntas novas (por que não está?) com sinais ricos.' },
    { q: 'Por que evitar IDs de usuário como rótulo de métrica?', a: 'Cada valor único cria uma série; a cardinalidade explode memória e custo. Detalhe individual vai para logs ou traces.' },
    { q: 'Por que o p95 do histograma foi 0,375 s e o exato 300,172 ms?', a: 'O quantil é interpolado dentro do bucket (0,25 s a 0,5 s); buckets largos geram erro. Use buckets em torno dos limites de SLO.' },
    { q: 'O que significa a razão de erros vir vazia antes do primeiro erro?', a: 'A série com status 5xx ainda não existia; ausência não é zero. Inicialize contadores em 0 ou use or vector(0).' }
  ]
},
{
  id: 'mon-02', moduleId: 'm1', order: 2, minutes: 90, tags: ['Prometheus', 'PromQL', 'scrape', 'rate', 'histogram_quantile', 'recording rules', 'promtool', 'up', 'TSDB'],
  title: 'Prometheus: coleta, PromQL, regras de gravação e testes de regras, executados',
  objectives: ['Explicar o modelo de coleta por scrape, séries temporais e rótulos', 'Escrever consultas PromQL com rate, sum by e histogram_quantile', 'Criar regras de gravação e validá-las com promtool check e promtool test rules', 'Usar a métrica up e entender janelas de rate e a defasagem do scrape'],
  intro: R`O **Prometheus** **coleta métricas por *pull*** (**raspa o §/metrics§ dos alvos a cada intervalo**), **guarda como séries temporais** e **oferece a linguagem PromQL**. **É o padrão de fato em ambientes Kubernetes e contêineres.** **Nesta aula você executa** **o Prometheus 3.16.0** **contra o app do laboratório**, **mede a taxa de requisições**, **cria regras de gravação** e **testa regras com o promtool**.`,
  theory: R`### Modelo de coleta
**O Prometheus (servidor) chama os alvos** (***scrape***) **em um intervalo** (§scrape_interval§; **5 s no laboratório**, **15 s é comum em produção**) **e armazena cada amostra com o tempo**. **Vantagens do *pull*:** **detecta alvo fora do ar (a métrica §up§ vira 0)**, **configuração central**, **fácil de testar com §curl§**. **Para jobs efêmeros** (**batch**) **existe o Pushgateway** (**não executado**). **Descoberta de serviços** (**Kubernetes, DNS, arquivos, nuvem**) **substitui listas estáticas** (**no laboratório: lista estática**).
**Configuração mínima do laboratório** (§prometheus.yml§):
§§§
global:
  scrape_interval: 5s
  evaluation_interval: 5s
rule_files:
  - regras.yml
scrape_configs:
  - job_name: app
    static_configs:
      - targets: ['lab-mon-app:3000']
§§§
**A métrica §up§:** **o Prometheus gera §up{job="app"}§ = 1 quando o scrape funciona, 0 quando falha**. **Medido:** **depois da subida, §up{job="app"} = 1§**; **ao parar o contêiner**, **§up§ caiu para 0 e disparou §AppForaDoAr§** (**aula 4**).

### Dados: séries e rótulos
**Série = nome + conjunto de rótulos** (§http_requests_total{rota="/ok",status="200"}§). **Tipos de resultado em PromQL:** **vetor instantâneo** (**um valor por série em um instante**), **vetor de intervalo** (**vários valores por série em uma janela: §metrica[30s]§**), **escalar**. **Armazenamento:** **TSDB local** (**compressão eficiente; retenção padrão de 15 dias**; **no laboratório 1 h**) — **para longo prazo e alta disponibilidade, remote write com Thanos, Mimir ou VictoriaMetrics** (**não executado**).

### PromQL essencial
- **Taxa de um counter:** §rate(http_requests_total[30s])§ — **média por segundo na janela**, **trata reinícios do contador**. **Medido:** **com 10 rps de tráfego saudável: §sum(rate(http_requests_total[30s]))§ = 9,88 req/s**. **Janela mínima:** **pelo menos 4 vezes o intervalo de scrape** (**poucas amostras na janela → resultado instável**).
- **Agregação:** §sum by (rota) (...)§, §sum without (instancia) (...)§, §avg§, §max§, §count§.
- **Filtros por rótulo:** §{status=~"5.."}§ (**regex**), §{rota!="/metrics"}§.
- **Razão de erros:** §sum(rate(http_requests_total{status=~"5.."}[30s])) / sum(rate(http_requests_total[30s]))§.
- **Latência:** §histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[1m])))§ — **agregue por §le§ antes**.
- **Comparação e lógica:** §> 0.05§, §and§, §or§, §unless§; **§or vector(0)§ para tratar série ausente**.
- **Janelas de tempo:** §offset 1h§, §avg_over_time§, §increase(x[5m])§.
**Armadilhas:** (1) **§rate§ em gauge** (**use §deriv§ ou valor**); (2) **valor bruto de counter** (**sem sentido**); (3) **§histogram_quantile§ sem §sum by (le)§** (**quantis por instância não se somam**); (4) **"sem dados" ≠ 0**.
**Medido:** **a razão de erros retornou "vazio" antes do primeiro 500** (**mon-01**); **ao injetar 30% de erros, ela cruzou 5% em ~10 s**, porque **a janela de 30 s ainda continha tráfego saudável**: **a janela suaviza e atrasa**.

### Regras de gravação (recording rules)
**Pré-calculam consultas caras ou frequentes e guardam o resultado como nova série.** **Convenção de nome:** §nível:métrica:operações§. **No laboratório:**
§§§
- record: app:http_requests:taxa30s
  expr: sum(rate(http_requests_total[30s]))
- record: app:http_erros:razao30s
  expr: sum(rate(http_requests_total{status=~"5.."}[30s])) / sum(rate(http_requests_total[30s]))
§§§
**Benefícios:** **painéis rápidos**, **alertas simples** (**o alerta usa a série gravada**) **e consistência** (**a mesma definição em todo lugar**). **Custo:** **mais séries**.

### Validando com o promtool (medido, v3.16.0)
| Comando | Resultado |
|---|---|
| §promtool check config prometheus.yml§ | **SUCCESS**: **1 arquivo de regras**, **4 regras** |
| §promtool check rules regras-defeituosas.yml§ | **FAILED**: **"could not parse expression: 1:37: parse error: unclosed left parenthesis"** |
| §promtool test rules regras-teste.yml§ | **SUCCESS** |
| §promtool test rules regras-teste-falha.yml§ | **FAILED**: **o teste esperava o alerta aos 40 s; "got: []"** (**o alerta só dispara depois do §for§**) |
**Teste de regras:** **séries de entrada sintéticas** (§values: '0+50x40'§ = **começa em 0 e soma 50 a cada passo, 40 vezes**) **e asserções do tipo "em 120 s o alerta X deve estar disparando com estes rótulos e anotações"**. **Valor:** **as regras de alerta viram código testável, sem produção**. **Faça o promtool rodar no CI** (**curso C6.2**).
**Exemplo de entrada do teste do laboratório:**
§§§
input_series:
  - series: 'http_requests_total{rota="/ok",status="200"}'
    values: '0+50x40'
  - series: 'http_requests_total{rota="/erro",status="500"}'
    values: '0+0x10 25+25x30'
§§§

### Defasagens e janelas: pensando no tempo
- **O dado tem a idade do último scrape** (**até 5 s no laboratório**).
- **A regra é avaliada a cada §evaluation_interval§.**
- **A janela do §rate§ suaviza e atrasa** (**30 s no laboratório**).
- **A cláusula §for§** (**aula 4**) **adiciona espera**.
**Soma dos atrasos = tempo até o alerta.** **Medido (aula 4):** **o alerta de erro ficou pending em +10 s e firing em +25 s** **após o início dos erros**.

### Operação
**Capacidade:** **memória cresce com séries ativas** (**cardinalidade**); **disco com amostras × retenção**. **Monitore o próprio Prometheus** (**no laboratório o job §prometheus§ é raspado**). **Segurança:** **o §/metrics§ pode expor detalhes internos**: **proteja redes e autenticação**; **a API do Prometheus não deve ficar pública**. **Alta disponibilidade:** **dois Prometheus iguais raspando os mesmos alvos** (**não executado**).

### Executado e não executado
**Executado:** **scrape, §up§, PromQL, regras de gravação, promtool check e test**. **Não executado:** **service discovery, node_exporter/cAdvisor, Pushgateway, remote write, HA, histogramas nativos**.`,
  concepts: [
    { term: 'Scrape', def: 'Coleta periódica das métricas expostas por um alvo, em geral em /metrics.' },
    { term: 'Série temporal', def: 'Sequência de amostras de valor e tempo identificada por um nome de métrica e um conjunto de rótulos.' },
    { term: 'PromQL', def: 'Linguagem de consulta do Prometheus para selecionar, agregar e calcular sobre séries.' },
    { term: 'rate()', def: 'Função que calcula a taxa média por segundo de um counter em uma janela, tratando reinícios.' },
    { term: 'Recording rule', def: 'Regra que pré-calcula uma expressão e guarda o resultado como nova série.' },
    { term: 'up', def: 'Métrica gerada pelo Prometheus que vale 1 quando o scrape do alvo funciona e 0 quando falha.' },
    { term: 'promtool', def: 'Ferramenta do Prometheus para validar configurações e regras e executar testes unitários de regras.' },
    { term: 'TSDB', def: 'Banco de séries temporais local do Prometheus, com compressão e retenção configurável.' }
  ],
  examples: R`**Analogia:** **o Prometheus é um enfermeiro que passa de quarto em quarto a cada 15 minutos** **anotando os sinais vitais** (**scrape**); **se um quarto não responde, ele anota "sem resposta" (§up=0§)**. **PromQL é a ficha que resume** ("**média de batimentos na última hora**"), **e a regra de gravação é o gráfico que a equipe já deixa pronto na parede**.

**Exemplo concreto (medido):** **com o app recebendo 10 req/s, §sum(rate(http_requests_total[30s]))§ deu 9,88**; **o promtool recusou uma expressão com parêntese aberto**; **e um teste que esperava o alerta cedo demais falhou mostrando "got: []"**.`,
  code: [
    { title: 'Consultas PromQL do laboratório (executadas contra o Prometheus 3.16.0)', lang: 'promql', code: R`# Taxa de requisições (req/s) na janela de 30 s
sum(rate(http_requests_total[30s]))

# Razão de erros 5xx (retorna vazio se não existir série 5xx)
sum(rate(http_requests_total{status=~"5.."}[30s])) / sum(rate(http_requests_total[30s]))

# Mesma razão, tratando a ausência como zero
(sum(rate(http_requests_total{status=~"5.."}[30s])) or vector(0)) / sum(rate(http_requests_total[30s]))

# p95 de latência por histograma (agregue por le antes)
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[1m])))

# Saúde dos alvos
up{job="app"}`, notes: [{ l: 2, t: 'Medido: 9,88 req/s com 10 rps de carga.' }, { l: 5, t: 'Antes do primeiro 500 o resultado foi vazio.' }, { l: 8, t: 'or vector(0) converte ausência em zero.' }, { l: 11, t: 'Sem sum by (le) o quantil seria por instância.' }] },
    { title: 'Regras de gravação e alerta validadas pelo promtool', lang: 'yaml', code: R`groups:
  - name: app
    rules:
      - record: app:http_requests:taxa30s
        expr: sum(rate(http_requests_total[30s]))
      - record: app:http_erros:razao30s
        expr: sum(rate(http_requests_total{status=~"5.."}[30s])) / sum(rate(http_requests_total[30s]))
      - alert: TaxaDeErroAlta
        expr: app:http_erros:razao30s > 0.05
        for: 15s
        labels:
          severidade: critica
        annotations:
          resumo: Taxa de erro acima de 5%`, notes: [{ l: 4, t: 'Convenção nível:métrica:operações.' }, { l: 8, t: 'O alerta usa a série gravada.' }, { l: 9, t: 'for evita alertar por picos curtos.' }] }
  ],
  bestPractices: ['Use rate() em counters com janela de pelo menos 4 vezes o intervalo de scrape.', 'Agregue por le antes de histogram_quantile.', 'Crie regras de gravação para consultas usadas em painéis e alertas e siga a convenção de nomes.', 'Valide com promtool check e teste regras com promtool test rules no CI.', 'Trate série ausente (or vector(0)) quando fizer sentido e inicialize contadores em zero.', 'Monitore o próprio Prometheus e vigie a cardinalidade.', 'Proteja /metrics e a API do Prometheus e planeje retenção e alta disponibilidade.'],
  mistakes: ['Consultar o valor bruto de um counter.', 'histogram_quantile sem sum by (le).', 'Janela de rate muito curta, com poucas amostras.', 'Ignorar a defasagem do scrape e da janela no tempo até o alerta.', 'Regras de alerta sem testes.', 'Expor o Prometheus publicamente.', 'Tratar "vazio" como zero.'],
  market: R`**Prometheus e PromQL** são **o padrão em ambientes de contêineres**; **escrever consultas de taxa, erro e latência e testar regras** **é habilidade pedida em SRE e plataforma**.`,
  summary: R`O Prometheus coleta por scrape, guarda séries temporais identificadas por nome e rótulos e expõe a PromQL; a métrica up indica a saúde do alvo. rate() calcula a taxa de counters em uma janela (no laboratório 9,88 req/s com 10 rps), histogram_quantile exige sum by (le), e a ausência de série não é zero. Regras de gravação pré-calculam taxa e razão de erros, e o promtool valida a configuração (SUCCESS), recusa uma expressão quebrada (parse error) e testa regras: o teste correto passou e o que esperava o alerta cedo demais falhou. A janela e o scrape atrasam os alertas. Service discovery, exporters, Pushgateway, remote write e HA não foram executados.`,
  refs: [REF.promOverview, REF.promQuery, REF.promFunctions, REF.promRecording, REF.promConfig],
  cards: [
    { q: 'Para que serve a métrica up?', a: 'Indica se o último scrape do alvo funcionou (1) ou falhou (0); base do alerta de alvo fora do ar.' },
    { q: 'Por que histogram_quantile precisa de sum by (le)?', a: 'Para somar os buckets entre instâncias antes de interpolar; quantis por instância não se agregam.' },
    { q: 'Qual a janela mínima recomendada para rate()?', a: 'Pelo menos 4 vezes o intervalo de scrape, para ter amostras suficientes.' },
    { q: 'O que o promtool test rules valida?', a: 'Regras de gravação e alerta contra séries sintéticas, afirmando quais alertas devem estar ativos em instantes definidos.' }
  ]
}
];
