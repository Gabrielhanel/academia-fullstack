// C4.6 — Logs e observabilidade. Aulas 3 e 4 (Prometheus e Grafana; SLI, SLO e alertas, e o projeto).
import { REF } from './c46-a.mjs';
const R = String.raw;

export const REF2 = {
  promOverview: { title: 'Prometheus — Overview', url: 'https://prometheus.io/docs/introduction/overview/', kind: 'doc' },
  promQuerying: { title: 'Prometheus — Querying basics (PromQL)', url: 'https://prometheus.io/docs/prometheus/latest/querying/basics/', kind: 'doc' },
  promRules: { title: 'Prometheus — Recording rules', url: 'https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/', kind: 'doc' },
  promAlerting: { title: 'Prometheus — Alerting rules', url: 'https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/', kind: 'doc' },
  alertmanager: { title: 'Prometheus — Alertmanager', url: 'https://prometheus.io/docs/alerting/latest/alertmanager/', kind: 'doc' },
  promApi: { title: 'Prometheus — HTTP API', url: 'https://prometheus.io/docs/prometheus/latest/querying/api/', kind: 'doc' },
  grafanaDocs: { title: 'Grafana — Documentation', url: 'https://grafana.com/docs/grafana/latest/', kind: 'doc' },
  sreSlo: { title: 'Google SRE Book — Service Level Objectives', url: 'https://sre.google/sre-book/service-level-objectives/', kind: 'livro' },
  sreWorkbookAlerting: { title: 'Google SRE Workbook — Alerting on SLOs', url: 'https://sre.google/workbook/alerting-on-slos/', kind: 'livro' },
  sreMonitoring: { title: 'Google SRE Book — Monitoring Distributed Systems', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', kind: 'livro' },
  sreEmbracing: { title: 'Google SRE Book — Embracing Risk', url: 'https://sre.google/sre-book/embracing-risk/', kind: 'livro' }
};

export const lessonsB = [
{
  id: 'obs-03', moduleId: 'm2', order: 3, minutes: 85, tags: ['Prometheus', 'PromQL', 'scrape', 'rate', 'histogram_quantile', 'regras', 'alertas', 'Grafana'],
  title: 'Prometheus e Grafana: coleta, PromQL, regras de gravação e alertas, e dashboards',
  objectives: ['Explicar o modelo de coleta por scrape (pull) do Prometheus e a configuração mínima', 'Escrever consultas PromQL com rate, sum, razão de erros e histogram_quantile', 'Criar regras de gravação e regras de alerta e acompanhar seus estados', 'Reconhecer os limites do Prometheus e o papel do Alertmanager e do Grafana', 'Montar um dashboard útil (RED) e evitar dashboards enganosos'],
  intro: R`O **Prometheus** coleta métricas por **pull**: a cada intervalo ele faz um **GET /metrics** nos alvos, guarda **séries temporais** e permite consultá-las com **PromQL**, gerar **regras** e disparar **alertas**. Aqui você usa o **Prometheus 3.16.0 de verdade** (contêiner oficial): uma API Express com **~74 req/s** é coletada a cada **1 s**; você consulta a **taxa**, a **razão de erros** e o **p95**, e vê um **alerta** disparar durante um incidente simulado (**31,4%** de erros) e **resolver** depois (**2,1%**).`,
  theory: R`### O modelo do Prometheus
- **Pull**: o servidor **busca** (§scrape§) as métricas dos alvos; o alvo só **expõe** §/metrics§. Vantagens: **detecta alvos fora do ar** (a métrica sintética §up§ vale 0), controle central da frequência e **depuração fácil** (abra /metrics no navegador). Para **jobs curtos** que morrem antes da coleta, existe o **Pushgateway** (uso restrito; **não executado**).
- **TSDB** local (série temporal = **nome + labels**, amostras com tempo e valor); **retenção** configurável (padrão **15 dias**); **não é armazenamento de longo prazo** (use *remote write* para Thanos/Mimir/Cortex; **não executados**).
- **Descoberta de serviços**: estática, DNS, **Kubernetes**, Consul, EC2 (**não executados**; o laboratório usou alvos estáticos).
Configuração mínima do laboratório (§prometheus.yml§):
§§§
global: { scrape_interval: 1s, evaluation_interval: 1s }     # 1 s só para o laboratório; produção: 15 s a 30 s
rule_files: [/etc/prometheus/regras.yml]
scrape_configs:
  - job_name: api-pedidos
    static_configs: [{ targets: ['127.0.0.1:59100'] }]
§§§

### PromQL: o essencial
- **Seletor**: §http_requests_total{rota="/pedidos", status=~"5.."}§ (§=§, §!=§, §=~§, §!~§).
- **Vetor de intervalo**: §http_requests_total[10s]§ (amostras dos últimos 10 s).
- **§rate(contador[janela])§**: **taxa por segundo** média na janela, **ajustada a reinícios** do contador. **A janela deve conter ≥ 2–4 coletas** (com scrape de 15 s, use ≥ 1 min).
- **Agregações**: §sum§, §avg§, §max§, **§by (rótulo)§** / **§without§**.
- **Razão de erros**: §sum(rate(http_requests_total{status=~"5.."}[10s])) / sum(rate(http_requests_total[10s]))§.
- **Percentil**: §histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[10s])))§ (**sempre agregue por §le§** e aplique §rate§ aos buckets).
- **Atenção**: §increase§, §irate§ (taxa instantânea, **voláteis**), §offset§, §absent()§ (detecta métrica sumida), §predict_linear§ (previsão de esgotamento de disco).
Medido (API em Express 5.3.0 com carga de **~74 req/s** — a meta era 100; o gerador de carga não chegou lá — e coleta a cada 1 s):
| Consulta | Resultado |
|---|---|
| §sum(rate(http_requests_total[10s]))§ | **74,2 req/s** |
| razão de erros (fase 1, **2%** configurados) | **2,4%** |
| §histogram_quantile(0.95, ...)§ | **128 ms** (p50: **37 ms**) |
| razão de erros (fase 2, **30%** configurados) | **31,4%** |
| razão de erros (fase 3, recuperação) | **2,1%** |
| contadores acumulados | **3.720** requisições, **417** erros (**11,21%**) |
**Observe**: a razão **acumulada** (11,21%) **mascara** o incidente; por isso se usa **taxa em janelas**, não o contador bruto.

### Regras de gravação (recording rules)
**Pré-calculam** consultas caras/frequentes e **dão nome** a elas:
§§§
- record: api:erros:razao_10s
  expr: sum(rate(http_requests_total{status=~"5.."}[10s])) / sum(rate(http_requests_total[10s]))
§§§
Benefícios: **dashboards e alertas rápidos**, **uma definição única** (convenção §nivel:metrica:operacao§).

### Regras de alerta
§§§
- alert: TaxaDeErrosAlta
  expr: api:erros:razao_10s > 0.10
  for: 3s                       # só dispara se a condição persistir (evita falsos positivos por picos)
  labels: { severidade: pagina }
  annotations: { resumo: "Mais de 10% das requisições com erro 5xx" }
§§§
Estados: **inactive** → **pending** (condição verdadeira, aguardando o §for§) → **firing**. Medido: na **fase 1** (2,4%): **nenhum alerta**; na **fase 2** (31,4%): **TaxaDeErrosAlta → firing** ("Mais de 10% das requisições com erro 5xx"); na **fase 3** (2,1%): **nenhum (resolvido)**. A API §/api/v1/alerts§ lista os ativos. O **Alertmanager** (**não executado** aqui) **agrupa**, **deduplica**, **silencia**, **roteia** (Slack, e-mail, PagerDuty) e **inibe** alertas dependentes.

### Alertas que funcionam
- **Alerte em sintomas** (erros, latência, saturação que **afetam usuários**), não em **causas** (CPU a 80%) — causas viram **painéis**/diagnóstico;
- **Todo alerta que acorda alguém deve ser acionável e urgente**; senão, **ticket** ou **dashboard**;
- Use **§for§**, **janelas** e **SLOs** (aula obs-04); inclua **runbook** (link com os passos) e **resumo** claro;
- **Teste** os alertas (simule o incidente, como na fase 2) e **revise** os que disparam em vão (**fadiga de alertas**).

### Grafana
O **Grafana** (**não executado** aqui) **visualiza** (Prometheus, Loki, Tempo, bancos...): **painéis**, **variáveis**, **alertas** próprios e **dashboards como código** (JSON/Jsonnet, provisionamento). Um bom dashboard **RED** por serviço: **taxa**, **erros (%)**, **latência p50/p95/p99** (+ saturação e dependências). **Armadilhas**: gráficos com **média** em vez de percentis; **eixos Y enganosos**; **dezenas de painéis sem hierarquia**; **janelas de rate incoerentes com o scrape**; **falta de anotações** de deploy. **Prometheus** consulta via **API HTTP** (§/api/v1/query§), usada pelo laboratório.

### Operação do Prometheus
**Capacidade** ~ **séries × coletas × bytes por amostra** (≈ 1–2 bytes/amostra compactada; **cardinalidade** é o fator, aula obs-02); **alta disponibilidade** (duas réplicas coletando os mesmos alvos); **segurança** (§/metrics§ **não** exposto à internet; autenticação/rede interna); **monitorar o monitor** (§up§, falhas de coleta, regras lentas).`,
  concepts: [
    { term: 'Scrape', def: 'Coleta periódica de métricas pelo Prometheus no endpoint /metrics dos alvos.' },
    { term: 'PromQL', def: 'Linguagem de consulta do Prometheus para séries temporais.' },
    { term: 'rate()', def: 'Função que calcula a taxa por segundo de um contador em uma janela.' },
    { term: 'histogram_quantile', def: 'Função que estima um percentil a partir dos buckets de um histograma.' },
    { term: 'Regra de gravação', def: 'Consulta pré-calculada e nomeada, gravada como uma nova série.' },
    { term: 'Regra de alerta', def: 'Condição PromQL que, mantida por um tempo, gera um alerta.' },
    { term: 'for', def: 'Tempo mínimo em que a condição de um alerta deve persistir antes de disparar.' },
    { term: 'Alertmanager', def: 'Componente que agrupa, deduplica, silencia e roteia alertas do Prometheus.' },
    { term: 'Alerta de sintoma', def: 'Alerta sobre o que o usuário percebe (erros, latência), em vez de causas internas.' },
    { term: 'Runbook', def: 'Documento com os passos para diagnosticar e resolver um alerta.' }
  ],
  examples: R`**Analogia:** o Prometheus é o **zelador que passa a cada 15 segundos lendo o hidrômetro de cada apartamento** (pull) e anotando num caderno com data e hora (TSDB). O **rate()** é calcular **litros por minuto** a partir de duas leituras do hidrômetro (que só sobe); o **histogram_quantile** é estimar "**95% dos banhos duram menos de X minutos**" a partir de faixas. A **regra de alerta com "for"** é o zelador que **só avisa o síndico se o vazamento durar 3 minutos**, não por uma gota. O **Alertmanager** é a **central** que decide **quem acordar** e agrupa vários avisos em um. O **Grafana** é o **painel na parede da portaria**.

**Exemplo 1: razão acumulada x janela.** 11,21% acumulado; 2,4% → 31,4% → 2,1% por janela.

**Exemplo 2: alerta.** Firing durante a fase 2 e resolvido na fase 3.

**Exemplo 3: p95.** 128 ms (p50: 37 ms) via histogram_quantile.`,
  code: [
    { title: 'Regras de gravação e de alerta (YAML do Prometheus 3.16.0; usadas no laboratório)', lang: 'yaml', code: R`groups:
  - name: api
    rules:
      - record: api:erros:razao_10s
        expr: sum(rate(http_requests_total{status=~"5.."}[10s])) / sum(rate(http_requests_total[10s]))
      - alert: TaxaDeErrosAlta
        expr: api:erros:razao_10s > 0.10
        for: 3s
        labels: { severidade: pagina }
        annotations:
          resumo: "Mais de 10% das requisições com erro 5xx"
          runbook: "https://wiki.exemplo.com/runbooks/erros-5xx"`, notes: [{ l: '4', t: 'A regra de gravação dá um nome estável à consulta.' }, { l: '8', t: 'for evita alertas por picos curtos.' }] },
    { title: 'Consultando a API do Prometheus a partir do Node (JavaScript; resultados medidos)', lang: 'js', code: R`const q = async (expr) => (await (await fetch('http://127.0.0.1:59090/api/v1/query?query=' + encodeURIComponent(expr))).json()).data.result;
const v = (r) => (r.length ? Number(r[0].value[1]) : null);

await q('sum(rate(http_requests_total[10s]))');                  // 74,2 req/s
await q('api:erros:razao_10s');                                  // 2,4% -> 31,4% -> 2,1% nas três fases
await q('histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[10s])))');   // 128 ms
const alertas = (await (await fetch('http://127.0.0.1:59090/api/v1/alerts')).json()).data.alerts;   // TaxaDeErrosAlta: firing`, notes: [{ l: '6', t: 'Sempre agregue por le antes do histogram_quantile.' }, { l: '7', t: 'O endpoint de alertas mostra os estados pending e firing.' }] }
  ],
  bestPractices: ['Alerte em sintomas que afetam usuários e use for e janelas coerentes com o scrape.', 'Use regras de gravação para consultas caras e frequentes.', 'Aplique rate aos counters e agregue por le antes de histogram_quantile.', 'Inclua runbook e resumo nos alertas e teste-os simulando incidentes.', 'Monitore o próprio Prometheus e proteja o /metrics.', 'Construa dashboards RED com percentis e anotações de deploy.'],
  mistakes: ['Consultar o valor bruto de um counter.', 'Janela de rate menor que o intervalo do scrape.', 'Alertas por causas (CPU) que não afetam o usuário.', 'Percentis calculados a partir de médias.', 'Dashboards sem hierarquia, com eixos enganosos.', 'Expor /metrics sem controle de rede.'],
  market: R`Prometheus e Grafana são o padrão de fato de monitoramento em Kubernetes e em muitas empresas; saber escrever PromQL e alertas acionáveis é cobrado em vagas de backend, SRE e DevOps.`,
  summary: R`O Prometheus coleta por pull, guarda séries e permite PromQL, regras e alertas. Medido com o Prometheus 3.16.0 real: ~74 req/s coletados a cada 1 s; razão de erros 2,4% (fase 1), 31,4% (fase 2) e 2,1% (fase 3); p95 de 128 ms e p50 de 37 ms; o alerta TaxaDeErrosAlta ficou firing na fase 2 e foi resolvido depois; o acumulado (11,21%) mascara o incidente, por isso use taxas em janelas. Alerte em sintomas, com for e runbook; o Grafana visualiza (não executado).`,
  refs: [REF2.promOverview, REF2.promQuerying, REF2.promRules, REF2.promAlerting, REF2.alertmanager, REF2.promApi, REF2.grafanaDocs],
  cards: [
    { q: 'Por que usar rate() em counters?', a: 'O valor bruto só cresce; a taxa por janela mostra o comportamento atual e é ajustada a reinícios.' },
    { q: 'Como estimar o p95 no PromQL?', a: 'histogram_quantile(0.95, sum by (le) (rate(..._bucket[janela]))).' },
    { q: 'Para que serve o "for" em um alerta?', a: 'Exige que a condição persista antes de disparar, evitando falsos positivos por picos curtos.' },
    { q: 'O que o Alertmanager faz?', a: 'Agrupa, deduplica, silencia e roteia os alertas do Prometheus.' },
    { q: 'Por que alertar em sintomas?', a: 'Porque refletem o impacto no usuário; causas viram diagnóstico e painéis.' }
  ]
},
{
  id: 'obs-04', moduleId: 'm2', order: 4, minutes: 90, tags: ['SLI', 'SLO', 'SLA', 'orçamento de erro', 'burn rate', 'alertas', 'incidentes', 'projeto'],
  title: 'SLI, SLO e alertas: orçamento de erro, burn rate, alertas de múltiplas janelas e o projeto',
  objectives: ['Definir SLI, SLO e SLA e escolher SLIs que refletem a experiência do usuário', 'Calcular o orçamento de erro e o burn rate', 'Comparar alertas por limiar fixo e por burn rate de múltiplas janelas em uma simulação', 'Usar o orçamento de erro para decisões de engenharia', 'Planejar o projeto integrador "Observabilidade de uma API"'],
  intro: R`"Quão confiável precisa ser?" **100% é o alvo errado**: custa **uma fortuna** e os usuários não percebem a diferença para 99,9%. **SLI/SLO** transformam confiabilidade em **número acordado**, e o **orçamento de erro** diz **quanto de falha ainda podemos gastar**. Aqui você **calcula** o orçamento (**99,9% = 43,2 min/mês**) e **simula** alertas: o **limiar fixo** e o **burn rate de múltiplas janelas** (resultados de uma **simulação determinística**, **não de um sistema real**).`,
  theory: R`### Definições
- **SLI** (*Service Level Indicator*): uma **medida** da qualidade, como **proporção de boas requisições**: §boas / válidas§ (**disponibilidade**: respostas não-5xx; **latência**: respostas < 300 ms).
- **SLO** (*Objective*): a **meta** do SLI numa **janela** (ex.: **99,9% das requisições com sucesso em 30 dias**; **95% das respostas em < 300 ms**).
- **SLA** (*Agreement*): **contrato** com o cliente, com **consequências** (créditos) se violado; **menos rígido** que o SLO interno.
**Bons SLIs** refletem **a experiência do usuário** e são medidos **o mais perto possível dele** (balanceador, cliente). Escolha **poucos** (disponibilidade, latência, e, por tipo de serviço: **frescor** para pipelines, **durabilidade** para armazenamento, **atraso máximo** para filas). **Exclua** o que não conta (requisições inválidas 4xx do cliente; verificações de saúde).

### Orçamento de erro (cálculo)
**Orçamento = 1 − SLO.** Em **30 dias (43.200 min)**:
| SLO | Indisponibilidade permitida |
|---|---|
| 99,0% | **432 min (7,2 h)** |
| 99,5% | **216 min (3,6 h)** |
| **99,9%** | **43,2 min** |
| 99,99% | **4,3 min** |
Cada "nove" a mais **divide o orçamento por 10** e **multiplica o custo**. Uma API com 99,9% que só tem **dependências a 99,9%** já **estoura** (dependências multiplicam: 0,999 × 0,999 ≈ 99,8%).
**Uso do orçamento**: se **sobra**, **arrisque** (lance recursos, faça experimentos, deploys frequentes); se **acabou**, **congele mudanças** e **invista em confiabilidade**. Isso **alinha** produto e engenharia (SRE Book, *Embracing Risk*).

### Burn rate
**Burn rate = taxa de erro observada ÷ taxa de erro permitida** (§1 − SLO§). Com SLO 99,9% (permitido **0,1%**), cálculo:
| Taxa de erro | Burn rate | Esgota o orçamento de 30 dias em |
|---|---|---|
| 0,05% | **0,5x** | 60 dias |
| 0,10% | **1,0x** | 30 dias |
| 1,00% | **10x** | 3 dias |
| 1,44% | **14,4x** | 2,1 dias |
| 5,00% | **50x** | 0,6 dia |
**14,4x durante 1 h consome 2% do orçamento mensal** (14,4 × 1 h ÷ 720 h): limite clássico para **"acordar alguém"**; **6x em 6 h consome 5%**; **1x em 3 dias consome 10%** (ticket).

### Alertas: limiar fixo x burn rate (simulação)
Cenário **simulado** (determinístico; 300 req/min por **3 h**): **incidente A** nos minutos 30–32 (**20%** de erros por 3 min); **incidente B** nos minutos 90–139 (**2%** por 50 min); erro de fundo **0,05%**. Quando cada regra **disparou**:
| Regra | Minutos de disparo |
|---|---|
| **limiar fixo** (erro > 1% em 5 min) | **30, 92** |
| **burn rate 14,4x** (janela de 1 h **E** de 5 min) | **32, 133** |
| **burn rate 6x** (3 h **E** 30 min) | **30, 99** |
| **burn rate 6x** (1 h **E** 5 min) | **30, 108** |
**Leitura**: o **limiar fixo** reage **rápido** (min 30 e 92), mas **dispararia por qualquer pico** curto e **não sabe o impacto no orçamento**; o **14,4x/1 h** foi **rápido para o incidente A** (min 32, severo) mas **tardio para o B** (min **133**): com **2%** de erros (burn de ~20x), a **razão da janela de 1 h** só ultrapassa **1,44%** quando ~**43 minutos** do incidente já entraram na janela (cálculo: 2% × 43/60 ≈ 1,44%); — por isso o SRE Workbook recomenda **combinar vários pares** (**rápido**: 14,4x com 1 h/5 min; **lento**: 6x com 6 h/30 min; **ticket**: 1x com 3 dias/6 h). A **janela curta** (5 min, 30 min) **evita alertas que continuam muito depois do fim** do incidente e permite **resolver** rápido. **Cuidado**: é um **modelo**; calibre com **dados reais**, o **tráfego** (poucas requisições = taxa ruidosa) e a **sazonalidade**.
**Consumo total da simulação**: SLI de **99,111%** nas 3 h (**480 erros** de **54.000**) = **3,7% do orçamento mensal** (se o tráfego se mantivesse).

### Do SLO ao alerta no Prometheus
§§§
# SLI de disponibilidade (razão de sucesso) por janela
1 - ( sum(rate(http_requests_total{status=~"5.."}[1h])) / sum(rate(http_requests_total[1h])) )
# burn rate 1 h e 5 min (ambos acima de 14,4 => página)
( razão_erros_1h / 0.001 > 14.4 ) and ( razão_erros_5m / 0.001 > 14.4 )
§§§
Use **regras de gravação** para as razões por janela (1 h, 5 min, 6 h, 30 min...) e **uma regra por severidade**.

### Cultura de incidentes
**Severidades** definidas; **comandante** do incidente; **comunicação** (status page); **linha do tempo** ("quem fez o quê quando"); **post-mortem sem culpados** (*blameless*): **causas contribuintes**, **o que funcionou**, **ações com dono e prazo**; **medir** MTTD (detecção), MTTR (recuperação); **não** punir quem errou; **corrigir o sistema**. **Game days**/**caos** para praticar.

### Projeto integrador: observabilidade de uma API
**Cenário**: uma API Express 5 (pedidos) com PostgreSQL e uma fila BullMQ.
**Entregáveis**:
1. **Logs** estruturados com **reqId** (AsyncLocalStorage), **redação**, **uma linha por requisição** e **nível por ambiente**;
2. **Métricas** RED + saturação (**event loop**, fila: tamanho e idade) com **rotas padronizadas**, **buckets em volta do SLO** e **cardinalidade controlada** (testes que contam séries);
3. **Traces** OpenTelemetry com propagação **HTTP e para jobs** (traceparent nos dados do job), **amostragem** (10% + 100% de erros) e **traceId nos logs**;
4. **Prometheus** coletando a API, **regras de gravação** e **alertas** de **burn rate** (rápido e lento) para um **SLO de 99,5%** e de **latência (p95 < 300 ms)**, testados com **incidente simulado**;
5. **Dashboard RED** (JSON do Grafana versionado ou documento descrevendo os painéis);
6. **Runbooks** para cada alerta e **checklist de incidente**; **post-mortem** de um incidente simulado;
7. **ADR** com SLIs, SLOs, janelas e limiares justificados.
**Critérios**: um incidente injetado é **detectado pelo alerta de burn rate** e **diagnosticado** com métrica → trace → log; **nenhum segredo nos logs**; **cardinalidade** abaixo de um limite definido; documentação do que **não** foi coberto.`,
  concepts: [
    { term: 'SLI', def: 'Indicador de nível de serviço: medida da qualidade percebida, como a proporção de requisições bem-sucedidas.' },
    { term: 'SLO', def: 'Objetivo de nível de serviço: meta para um SLI em uma janela de tempo.' },
    { term: 'SLA', def: 'Acordo de nível de serviço: contrato com consequências caso o nível não seja cumprido.' },
    { term: 'Orçamento de erro', def: 'Quantidade de falha permitida pelo SLO (1 − SLO) em uma janela.' },
    { term: 'Burn rate', def: 'Velocidade de consumo do orçamento: taxa de erro observada dividida pela permitida.' },
    { term: 'Alerta de múltiplas janelas', def: 'Alerta que exige burn rate alto em uma janela longa e em uma curta ao mesmo tempo.' },
    { term: 'MTTD / MTTR', def: 'Tempo médio de detecção e de recuperação de incidentes.' },
    { term: 'Post-mortem sem culpados', def: 'Análise de incidente focada em causas sistêmicas e ações de melhoria, sem punir pessoas.' },
    { term: 'Fadiga de alertas', def: 'Perda de atenção causada por excesso de alertas não acionáveis.' },
    { term: 'Quatro sinais de ouro', def: 'Latência, tráfego, erros e saturação.' }
  ],
  examples: R`**Analogia:** o **SLO** é a **nota mínima para passar** (99,9%) e o **orçamento de erro** é **quantas questões você pode errar** na prova (43 minutos de indisponibilidade por mês). O **burn rate** é **o ritmo com que você está errando**: errar 1,44% das questões é queimar o orçamento **14 vezes mais rápido** do que o permitido — em 2 dias você reprovou. O **alerta de limiar fixo** é o **professor que grita a cada erro**; o de **burn rate** é o que **avisa quando o ritmo de erros ameaça a aprovação**, e só considera uma crise quando o ritmo é alto **agora** (janela curta) **e** se mantém há um tempo (janela longa).

**Exemplo 1: orçamento.** 99,9% = 43,2 min; 99,99% = 4,3 min.

**Exemplo 2: burn.** 1,44% de erros = 14,4x = 2% do orçamento em 1 h.

**Exemplo 3: simulação.** O limiar fixo disparou nos min 30 e 92; o burn 14,4x, nos 32 e 133.`,
  code: [
    { title: 'Orçamento de erro e burn rate (JavaScript; cálculos do laboratório)', lang: 'js', code: R`const slo = 0.999, orcamento = 1 - slo, minutosJanela = 30 * 24 * 60;
console.log(((1 - slo) * minutosJanela).toFixed(1), 'min de indisponibilidade permitida');       // 43.2

const burnRate = (taxaDeErro) => taxaDeErro / orcamento;
console.log(burnRate(0.0144).toFixed(1) + 'x', '→ esgota em', (30 / burnRate(0.0144)).toFixed(1), 'dias');   // 14.4x → 2.1 dias
console.log((14.4 * 1 / (30 * 24) * 100).toFixed(1) + '% do orçamento mensal em 1 h a 14,4x');            // 2.0%

// alerta de múltiplas janelas: página se o burn rate é alto na janela longa E na curta
const pagina = (r1h, r5m) => r1h / orcamento > 14.4 && r5m / orcamento > 14.4;`, notes: [{ l: '4', t: 'Burn rate 1 = consumir exatamente o orçamento no prazo.' }, { l: '9', t: 'A janela curta evita alertas que persistem após a recuperação.' }] },
    { title: 'Burn rate no PromQL (regras de gravação e alerta; modelo)', lang: 'yaml', code: R`groups:
  - name: slo-disponibilidade
    rules:
      - record: sli:erros:razao_5m
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
      - record: sli:erros:razao_1h
        expr: sum(rate(http_requests_total{status=~"5.."}[1h])) / sum(rate(http_requests_total[1h]))
      - alert: ErroBudgetQueimaRapida
        expr: sli:erros:razao_1h > (14.4 * 0.001) and sli:erros:razao_5m > (14.4 * 0.001)
        labels: { severidade: pagina }
        annotations: { resumo: "Consumindo o orçamento 14,4x mais rápido que o permitido", runbook: "https://wiki.exemplo.com/runbooks/slo" }`, notes: [{ l: '8', t: '0,001 é o orçamento de um SLO de 99,9%.' }] }
  ],
  bestPractices: ['Defina poucos SLIs que reflitam a experiência do usuário e SLOs realistas.', 'Use o orçamento de erro para decidir entre lançar e estabilizar.', 'Alerte por burn rate com múltiplas janelas (rápido e lento) em vez de limiares fixos.', 'Todo alerta que acorda alguém deve ter runbook e ser acionável.', 'Faça post-mortems sem culpados com ações e donos.', 'Revise SLOs e alertas periodicamente com dados reais.'],
  mistakes: ['Prometer 100% de disponibilidade.', 'SLIs que não refletem o que o usuário percebe.', 'Alertas de limiar fixo que disparam por picos curtos.', 'Ignorar o impacto das dependências no SLO.', 'Alertas sem runbook nem dono.', 'Culpar pessoas em vez de corrigir o sistema.'],
  market: R`SLI/SLO e burn rate são a linguagem de SRE; entrevistas de sistemas e de plataforma costumam pedir para definir SLOs, calcular o orçamento e justificar alertas.`,
  summary: R`SLI mede, SLO define a meta e o orçamento de erro (1 − SLO) quantifica a falha permitida: 99,9% em 30 dias são 43,2 min. O burn rate (taxa observada ÷ permitida) mostra a velocidade de consumo: 14,4x por 1 h gasta 2% do orçamento. Na simulação de 3 h, o limiar fixo disparou nos minutos 30 e 92, o burn 14,4x (1 h/5 min) nos 32 e 133, o 6x (3 h/30 min) nos 30 e 99 e o 6x (1 h/5 min) nos 30 e 108; o SLI foi 99,111% e consumiu 3,7% do orçamento mensal. Combine janelas rápidas e lentas, com runbooks e post-mortems.`,
  refs: [REF2.sreSlo, REF2.sreWorkbookAlerting, REF2.sreMonitoring, REF2.sreEmbracing, REF2.promAlerting],
  cards: [
    { q: 'O que é o orçamento de erro?', a: '1 − SLO: a quantidade de falha permitida (99,9% em 30 dias = 43,2 min).' },
    { q: 'O que é burn rate?', a: 'A taxa de erro observada dividida pela permitida; 14,4x por 1 h consome 2% do orçamento mensal.' },
    { q: 'Por que alertas de múltiplas janelas?', a: 'A janela longa confirma o impacto no orçamento e a curta garante que o problema ainda ocorre, evitando alertas atrasados.' },
    { q: 'Qual a diferença entre SLO e SLA?', a: 'O SLO é a meta interna; o SLA é o contrato com consequências, normalmente menos rígido.' },
    { q: 'O que fazer quando o orçamento acaba?', a: 'Congelar mudanças de risco e investir em confiabilidade.' }
  ]
}
];
