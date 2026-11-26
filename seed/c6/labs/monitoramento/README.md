# Laboratório C6.6 — Monitoramento: métricas, Prometheus, Grafana e alertas

Executado em 2026-11-25/26: Docker 29.9.3, **Prometheus 3.16.0** (promtool 3.16.0), **Alertmanager 0.35.1** (amtool), **Grafana 13.3.2**, Node 26.13.1 (app e receptor de webhook, imagem `node:26-alpine`). Tráfego sintético gerado por `loadgen.mjs`. A pilha roda em uma rede Docker própria (`lab-mon-net`) com portas apenas em 127.0.0.1; o script cria só recursos `lab-mon-*` e os remove ao fim. O Grafana usa **acesso anônimo como Admin somente neste laboratório local**; não é uma configuração para uso real.

## Arquivos
`app/server.mjs` (métricas no formato de exposição do Prometheus escritas à mão; logs JSON; `/ok` com latências determinísticas em ciclo de 10: 5, 8, 12, 20, 35, 50, 70, 90, 120 e 300 ms; `/erro` devolve 500), `hook/server.mjs` (receptor de webhook), `loadgen.mjs`, `prometheus/` (configuração, regras de gravação e alerta, regras defeituosas, testes de regras certo e errado), `alertmanager/`, `grafana/` (provisionamento de datasource e dashboard), `q.mjs` e `linha.mjs` (consultas e linha do tempo), `run.sh`, `saida-monitoramento.txt`.

## Resultados medidos (`saida-monitoramento.txt`)
- `promtool check config`: válido (1 arquivo de regras, 4 regras); `check rules` na regra defeituosa: **FAILED**, `parse error: unclosed left parenthesis`.
- `promtool test rules`: teste correto **SUCCESS**; teste que espera o alerta aos 40 s (cedo demais) **FAILED**, com `exp` e `got:[]`. `amtool check-config`: SUCCESS.
- Tráfego saudável (35 s, 10 rps): taxa em 30 s = **9,88 req/s**; razão de erros = **vazio** (não existe ainda série com status 5xx: ausência não é zero).
- Injeção de erros (40 s, 30%: 278 respostas 200 e 120 respostas 500) e recuperação (60 s, 567 respostas 200): `TaxaDeErroAlta` **pending a +10 s, firing a +25 s**, webhook (firing) a **+30 s** do início dos erros; na recuperação, última amostra firing a **+24 s** e webhook `resolved` a **+30 s** do início da recuperação. O atraso de +10 s para o pending vem da janela de 30 s da razão de erros (a proporção de erros só passa de 5% depois de alguns segundos). Alertmanager sem alertas ativos ao final.
- **p95: histograma x logs** (rota `/ok`, 1.190 requisições): `histogram_quantile(0,95)` = **0,375 s** contra p95 exato nos logs = **300,172 ms** (p50 exato 35,797 ms; p99 exato 300,824 ms). A diferença vem da resolução dos buckets (0,25 e 0,5); contador `/ok 200` no Prometheus = 1.190 (igual às linhas de log).
- `AppForaDoAr` (`docker stop`): **pending a +14 s, firing a +24 s**, webhook firing a **+30 s**; após `docker start`, webhook `resolved` a **+9 s**.
- Grafana: health `database: ok`, versão 13.3.2; **1 dashboard provisionado com 3 painéis**; saúde do datasource `OK`; `up{job="app"}` via Grafana = 1 = Prometheus.

## Observações
- O log do webhook mostra uma lacuna de ~34 minutos entre o episódio de `TaxaDeErroAlta` e o de `AppForaDoAr` (relógio da máquina; causa não investigada, possivelmente suspensão). Os tempos relativos foram medidos dentro de cada fase, com marcas de tempo e `query_range`, e não são afetados.
- Uma primeira versão do script media os tempos por polling a cada segundo e subestimava/atrasava as observações (cada consulta custava mais de 1 s e houve uma amostra `up=0` antes da primeira coleta); foi reescrita com medição posterior, por isso as medições finais usam `query_range`.

## Não executado
Loki, Elasticsearch/OpenSearch, Tempo/Jaeger e OpenTelemetry; node_exporter e cAdvisor; Pushgateway; Alertmanager em alta disponibilidade; silences e inibição; roteamento por severidade e integrações reais (e-mail, Slack, PagerDuty); alertas do Grafana; variáveis de dashboard; remote write, Thanos e Mimir; alertas de burn rate por SLO (apenas modelados nos exercícios); armazenamento de longo prazo.

## Limitações
Tráfego sintético, uma máquina, uma aplicação pequena, latências determinísticas; os tempos dependem de `scrape_interval` e `evaluation_interval` de 5 s (valores didáticos; em produção costumam ser 15 s ou mais) e de `group_wait` de 5 s.

## Reprodução
```bash
bash run.sh
```
