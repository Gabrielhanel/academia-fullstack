#!/usr/bin/env bash
# Laboratório C6.3: nginx como proxy reverso, TLS e balanceador (somente recursos lab-ngx-*).
set -u
cd "$(dirname "$0")"
N=lab-ngx; H=38090; S=38443
cleanup() { docker rm -f ${N}-app1 ${N}-app2 ${N}-app3 ${N}-front >/dev/null 2>&1; docker network rm ${N}-net >/dev/null 2>&1; rm -rf certs; }
cleanup; docker network create ${N}-net >/dev/null
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 30 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" 2>/dev/null
for i in 1 2 3; do
  atraso=0; [ $i = 1 ] && atraso=400   # app1 é lenta só em /lento
  docker run -d --name ${N}-app$i --network ${N}-net --read-only --cap-drop ALL --user 1000:1000 -e NOME=app$i -e ATRASO=$atraso -v "$PWD/app":/app:ro node:26-alpine node /app/server.mjs >/dev/null
done
docker run -d --name ${N}-front --network ${N}-net -p 127.0.0.1:${H}:80 -p 127.0.0.1:${S}:443 -v "$PWD/nginx.conf":/etc/nginx/conf.d/default.conf:ro -v "$PWD/certs":/etc/nginx/certs:ro nginx:alpine >/dev/null
sleep 3
docker exec ${N}-front nginx -t 2>&1 | tail -n 2
C="curl -s --cacert certs/cert.pem"
dist() { for i in $(seq 1 $2); do $C "https://localhost:${S}$1"; echo; done | grep -o '"instancia":"[a-z0-9]*"' | sort | uniq -c; }

echo "== 1. Proxy reverso: cabeçalhos vistos pela aplicação =="
echo "-- com proxy_set_header:"; $C https://localhost:${S}/; echo
echo "-- sem proxy_set_header (padrão do nginx):"; $C https://localhost:${S}/sem-cabecalhos/; echo
echo "== 2. TLS =="
$C -o /dev/null -w 'HTTPS: código=%{http_code} versão_http=%{http_version} verificação=%{ssl_verify_result}\n' https://localhost:${S}/
curl -s -o /dev/null https://localhost:${S}/; echo "sem confiar no certificado: curl exit=$? (60 = certificado não verificado)"
curl -s -o /dev/null -D- http://127.0.0.1:${H}/caminho?x=1 | grep -iE '^(HTTP|location)'
$C -D- -o /dev/null https://localhost:${S}/ | grep -i strict-transport
openssl x509 -in certs/cert.pem -noout -subject -dates -ext subjectAltName 2>&1
for v in tls1_2 tls1_3; do echo | openssl s_client -connect 127.0.0.1:${S} -servername localhost -$v 2>/dev/null | grep -E '^(New, |    Protocol|    Cipher)' | tr '\n' ' '; echo "($v)"; done
echo "== 3. Balanceamento round-robin: 90 requisições =="; dist / 90
echo "== 3b. app1 lenta (400 ms em /lento): 120 requisições, 12 em paralelo =="
par() { seq 1 $2 | xargs -P 12 -I{} curl -s --cacert certs/cert.pem "https://localhost:${S}$1" | grep -o '"instancia":"[a-z0-9]*"' | sort | uniq -c; }
echo "-- round-robin (/lento):"; par /lento 120
echo "-- least_conn (/lc/lento):"; par /lc/lento 120
echo "== 4. Compressão gzip em /grande =="
curl -s --cacert certs/cert.pem -o /dev/null -w 'sem gzip: %{size_download} bytes\n' https://localhost:${S}/grande
curl -s --cacert certs/cert.pem --compressed -H 'Accept-Encoding: gzip' -o /dev/null -w 'com gzip (transferido): %{size_download} bytes\n' https://localhost:${S}/grande
echo "== 5. Rate limit 5 r/s, burst 5: 30 requisições seguidas =="
for i in $(seq 1 30); do $C -o /dev/null -w '%{http_code}\n' https://localhost:${S}/limitado/; done | sort | uniq -c
echo "== 6. Failover: app2 parado =="
docker stop ${N}-app2 >/dev/null
echo "-- com proxy_next_upstream (60 req) códigos:"; for i in $(seq 1 60); do $C -o /dev/null -w '%{http_code}\n' https://localhost:${S}/fo/; done | sort | uniq -c
echo "-- distribuição das respostas /fo/:"; dist /fo/ 60
echo "-- sem proxy_next_upstream (60 req) códigos:"; for i in $(seq 1 60); do $C -o /dev/null -w '%{http_code}\n' https://localhost:${S}/fo-sem/; done | sort | uniq -c
docker start ${N}-app2 >/dev/null; sleep 6
echo "-- após religar app2:"; dist /fo/ 30
cleanup
