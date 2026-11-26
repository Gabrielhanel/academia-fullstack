#!/usr/bin/env bash
# Laboratório C6.6: Prometheus, Alertmanager, Grafana, app instrumentado e webhook (somente recursos lab-mon-*).
cd "$(dirname "$0")"
N=lab-mon; NET=${N}-net; PA=38100; PP=38101; PM=38102; PG=38103
limpar() { docker rm -f ${N}-app ${N}-hook ${N}-prom ${N}-am ${N}-graf >/dev/null 2>&1; docker network rm $NET >/dev/null 2>&1; }
sec() { echo; echo "=== $* ==="; }
q() { node q.mjs $PP "$1"; }
agora() { date +%s; }
espera_alerta() { # nome estado limite
  local i=0; while [ $i -lt $3 ]; do
    [ "$(q "ALERTS{alertname=\"$1\",alertstate=\"$2\"}")" != "vazio" ] && { echo "$1 $2 após $(( $(agora) - T0 )) s"; return 0; }
    sleep 1; i=$((i+1)); done; echo "$1 $2 NÃO observado em $3 s"; return 1; }
espera_hook() { # padrão limite
  local i=0; while [ $i -lt $2 ]; do
    docker logs ${N}-hook 2>&1 | grep -q "$1" && { echo "webhook recebeu '$1' após $(( $(agora) - T0 )) s"; return 0; }
    sleep 1; i=$((i+1)); done; echo "webhook NÃO recebeu '$1' em $2 s"; return 1; }
PT="docker run --rm --entrypoint promtool -v $PWD/prometheus:/p:ro prom/prometheus:latest"
limpar

sec "1. promtool: configuração, regras e regras defeituosas"
$PT check config /p/prometheus.yml 2>&1 | grep -E "SUCCESS|FAILED"
$PT check rules /p/regras-defeituosas.yml 2>&1 | grep -E "FAILED|parse error"
sec "2. promtool test rules: teste correto e teste que espera alerta cedo demais"
$PT test rules /p/regras-teste.yml 2>&1 | grep -E "SUCCESS|FAILED"
$PT test rules /p/regras-teste-falha.yml 2>&1 | grep -E "FAILED|alertname|got:"
sec "3. amtool check-config"
docker run --rm --entrypoint amtool -v $PWD/alertmanager:/a:ro prom/alertmanager:latest check-config /a/alertmanager.yml 2>&1 | grep -E "SUCCESS|FAILED"

sec "4. subindo a pilha"
docker network create $NET >/dev/null
RO="--read-only --cap-drop ALL --user 1000:1000"
docker run -d --name ${N}-hook --network $NET $RO -v "$PWD/hook":/app:ro node:26-alpine node /app/server.mjs >/dev/null
docker run -d --name ${N}-app --network $NET $RO -p 127.0.0.1:$PA:3000 -v "$PWD/app":/app:ro node:26-alpine node /app/server.mjs >/dev/null
docker run -d --name ${N}-am --network $NET -p 127.0.0.1:$PM:9093 -v "$PWD/alertmanager":/etc/alertmanager:ro prom/alertmanager:latest --config.file=/etc/alertmanager/alertmanager.yml >/dev/null
docker run -d --name ${N}-prom --network $NET -p 127.0.0.1:$PP:9090 -v "$PWD/prometheus":/etc/prometheus:ro prom/prometheus:latest --config.file=/etc/prometheus/prometheus.yml --storage.tsdb.retention.time=1h >/dev/null
docker run -d --name ${N}-graf --network $NET -p 127.0.0.1:$PG:3000 -e GF_AUTH_ANONYMOUS_ENABLED=true -e GF_AUTH_ANONYMOUS_ORG_ROLE=Admin -e GF_AUTH_DISABLE_LOGIN_FORM=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_ANALYTICS_CHECK_FOR_UPDATES=false -v "$PWD/grafana/provisioning":/etc/grafana/provisioning:ro -v "$PWD/grafana/dashboards":/var/lib/grafana/dashboards-lab:ro grafana/grafana:latest >/dev/null
ms() { date +%s%3N; }
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PP/-/ready && curl -s -o /dev/null http://127.0.0.1:$PM/-/ready && break; sleep 1; done
for i in $(seq 1 60); do curl -s "http://127.0.0.1:$PP/api/v1/query?query=up%7Bjob%3D%22app%22%7D" | grep -q '"1"\]' && break; sleep 1; done
echo "alvos: up{job=\"app\"} = $(q 'up{job="app"}')"

sec "5. tráfego saudável: 35 s a 10 rps, 0% de erro"
node loadgen.mjs $PA 35 10 0
sleep 6
echo "taxa de requisições (30 s) = $(q 'app:http_requests:taxa30s') req/s"
echo "razão de erros (30 s) = $(q 'app:http_erros:razao30s')  (vazio: ainda não existe série com status 5xx)"
echo "alertas ativos: $(q 'count(ALERTS)')"

sec "6. injeção de erros (40 s, 10 rps, 30% de erro) seguida de recuperação (60 s, 10 rps, 0% de erro)"
E0=$(ms); node loadgen.mjs $PA 40 10 30
E1=$(ms); node loadgen.mjs $PA 60 10 0
sleep 15
echo "-- Alertmanager (API v2) agora:"; curl -s http://127.0.0.1:$PM/api/v2/alerts | node -e "const a=JSON.parse(require('fs').readFileSync(0));console.log(a.length?a.map(x=>x.labels.alertname+' '+x.status.state).join('; '):'nenhum alerta ativo')"

sec "7. p95: histograma x logs (acumulado desde o início do app, rota /ok)"
sleep 3
H=$(q 'histogram_quantile(0.95, sum by (le) (http_request_duration_seconds_bucket{rota="/ok"}))')
echo "histogram_quantile(0.95) do Prometheus = $H s"
docker logs ${N}-app 2>/dev/null | node -e "
const l=require('fs').readFileSync(0,'utf8').trim().split('\n').map(x=>JSON.parse(x));
const ok=l.filter(x=>x.rota==='/ok').map(x=>x.duracao_ms).sort((a,b)=>a-b);
const p=(q)=>ok[Math.ceil(q*ok.length)-1];
const por={};for(const x of l){por[x.status]=(por[x.status]||0)+1}
console.log('linhas de log:',l.length,'por status:',JSON.stringify(por));
console.log('/ok: n =',ok.length,'| p50 exato =',p(0.5),'ms | p95 exato =',p(0.95),'ms | p99 exato =',p(0.99),'ms');"
echo "contador /ok 200 no Prometheus: $(q 'sum(http_requests_total{rota="/ok",status="200"})')"

sec "8. app fora do ar: docker stop por ~30 s"
E3=$(ms); docker stop ${N}-app >/dev/null; sleep 30
E4=$(ms); docker start ${N}-app >/dev/null; sleep 30

sec "9. Grafana (API local, acesso anônimo apenas no laboratório)"
for i in $(seq 1 60); do curl -s http://127.0.0.1:$PG/api/health | grep -q '"database": "ok"' && break; sleep 1; done
curl -s http://127.0.0.1:$PG/api/health | node -e "const h=JSON.parse(require('fs').readFileSync(0));console.log('health: database =',h.database,'| version =',h.version)"
curl -s "http://127.0.0.1:$PG/api/search?type=dash-db" | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log('dashboards provisionados:',d.length,d.map(x=>x.title).join(', '))"
curl -s http://127.0.0.1:$PG/api/dashboards/uid/app-lab | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log('painéis do dashboard:',d.dashboard.panels.length,'|',d.dashboard.panels.map(p=>p.title).join(' / '))"
curl -s http://127.0.0.1:$PG/api/datasources/uid/prom/health | node -e "const h=JSON.parse(require('fs').readFileSync(0));console.log('saúde do datasource:',h.status,'-',h.message)"
G=$(curl -s "http://127.0.0.1:$PG/api/datasources/proxy/uid/prom/api/v1/query?query=up%7Bjob%3D%22app%22%7D" | node -e "const r=JSON.parse(require('fs').readFileSync(0));console.log(r.data.result.map(x=>x.value[1]).join(','))")
echo "up{job=\"app\"} via Grafana = $G | direto no Prometheus = $(q 'up{job="app"}')"

sec "10. linha do tempo dos alertas (consultas query_range e log do webhook)"
docker logs ${N}-hook 2>&1 | node linha.mjs $PP $E0 $E1 $E3 $E4

sec "11. versões"
docker run --rm --entrypoint promtool prom/prometheus:latest --version 2>&1 | head -n 1
docker run --rm --entrypoint amtool prom/alertmanager:latest --version 2>&1 | head -n 1
echo "grafana: $(curl -s http://127.0.0.1:$PG/api/health | node -e "console.log(JSON.parse(require('fs').readFileSync(0)).version)")"
echo "-- log do webhook (todos os alertas recebidos):"; docker logs ${N}-hook 2>&1
limpar
