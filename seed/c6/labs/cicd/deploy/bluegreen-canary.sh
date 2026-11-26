#!/usr/bin/env bash
# Laboratório C6.2: blue-green e canary com nginx (somente contêineres lab-cicd-*).
set -u
cd "$(dirname "$0")"
N=lab-cicd; PORT=38081
cleanup() { docker rm -f ${N}-blue ${N}-green ${N}-front >/dev/null 2>&1; docker network rm ${N}-net >/dev/null 2>&1; }
cleanup; docker network create ${N}-net >/dev/null
mkdir -p html-blue html-green
echo '{"versao":"v1","cor":"blue"}' > html-blue/index.html
echo '{"versao":"v2","cor":"green"}' > html-green/index.html
for c in blue green; do
  docker run -d --name ${N}-$c --network ${N}-net -v "$PWD/html-$c":/usr/share/nginx/html:ro nginx:alpine >/dev/null
done
conf() { # $1 = pesos "blue green"; peso 0 vira "down" (weight=0 é inválido)
  set -- $1
  local b="weight=$1" g="weight=$2"
  [ "$1" = 0 ] && b=down; [ "$2" = 0 ] && g=down
  cat > front.conf <<CONF
upstream app {
  server ${N}-blue:80 $b;
  server ${N}-green:80 $g;
}
server { listen 80; location / { proxy_pass http://app; } }
CONF
}
conf "1 0"
docker run -d --name ${N}-front --network ${N}-net -p 127.0.0.1:${PORT}:80 -v "$PWD/front.conf":/etc/nginx/conf.d/default.conf:ro nginx:alpine >/dev/null
sleep 2
cont() { for i in $(seq 1 $1); do { curl -s -m 2 http://127.0.0.1:${PORT}/; echo; }; done | sort | uniq -c; }
echo "== Fase 1: 100% blue (v1) =="; cont 50
echo "== Fase 2: canary 90/10 =="
conf "9 1"; docker exec ${N}-front nginx -s reload 2>&1 | grep -E 'emerg|error' ; sleep 1; cont 200
echo "== Fase 3: blue-green, troca para green com reload durante carga =="
( for i in $(seq 1 300); do curl -s -o /dev/null -m 2 -w '%{http_code}\n' http://127.0.0.1:${PORT}/; done | sort | uniq -c > /tmp/lab-cicd-codes.txt ) &
sleep 0.3
conf "0 1"; docker exec ${N}-front nginx -s reload 2>&1 | grep -E 'emerg|error' 
wait; echo "códigos HTTP durante a troca (300 requisições):"; cat /tmp/lab-cicd-codes.txt; rm -f /tmp/lab-cicd-codes.txt
echo "após a troca:"; cont 50
echo "== Fase 4: rollback para blue =="
conf "1 0"; docker exec ${N}-front nginx -s reload 2>&1 | grep -E 'emerg|error' ; sleep 1; cont 50
cleanup; rm -rf html-blue html-green front.conf
