#!/usr/bin/env bash
# Experimentos de isolamento e limites de recursos de contêineres (Linux). Uso: ./isolamento.sh
export LC_ALL=C
IMG=node:26-alpine
echo "== 1. kernel compartilhado"
echo "host:      $(uname -r)"; echo "contêiner: $(docker run --rm alpine uname -r)"
echo "== 2. namespace de PIDs"
echo "PID 1 no contêiner: $(docker run --rm alpine sh -c 'ps -o pid,comm | sed -n 2p')"
docker run -d --name lab-pid alpine sleep 60 >/dev/null; echo "PID do 'sleep' visto pelo host: $(pgrep -f 'sleep 60' | head -n 1) (no contêiner é o PID 1)"; docker rm -f lab-pid >/dev/null
echo "== 3. tempo para iniciar e encerrar um contêiner (10 execuções de 'docker run --rm alpine true')"
for i in $(seq 1 10); do s=$(date +%s%N); docker run --rm alpine true; e=$(date +%s%N); echo $(( (e - s) / 1000000 )); done | sort -n | awk '{a[NR]=$1} END {printf "mediana %d ms | mín %d ms | máx %d ms\n", a[int((NR+1)/2)], a[1], a[NR]}'
echo "== 4. limite de memória (32 MiB): o processo tenta alocar 200 MiB"
docker run --name lab-oom --memory=32m --memory-swap=32m $IMG node -e "const a=[]; for(let i=0;i<200;i++) a.push(Buffer.alloc(1024*1024,1)); console.log('alocou 200 MiB')" >/dev/null 2>&1; cod=$?
echo "código de saída: $cod | OOMKilled: $(docker inspect -f '{{.State.OOMKilled}}' lab-oom)"; docker rm lab-oom >/dev/null
echo "== 5. limite de CPU: mesmo trabalho (laço de 3e8 iterações) com --cpus=1 e --cpus=0.5"
for c in 1 0.5; do echo "--cpus=$c: $(docker run --rm --cpus=$c $IMG node -e "const t0=Date.now(); let s=0; for(let i=0;i<3e8;i++){s+=i%7} console.log(Date.now()-t0+' ms')")"; done
echo "== 6. sistema de arquivos: a camada gravável some com o contêiner; o volume persiste"
docker run --rm alpine sh -c 'echo dado > /tmp/arq && cat /tmp/arq' >/dev/null
echo "arquivo existe em um novo contêiner? $(docker run --rm alpine sh -c 'test -f /tmp/arq && echo sim || echo não')"
docker volume create lab-vol >/dev/null; docker run --rm -v lab-vol:/dados alpine sh -c 'echo persistente > /dados/arq'
echo "com volume, em um novo contêiner: $(docker run --rm -v lab-vol:/dados alpine cat /dados/arq)"; docker volume rm lab-vol >/dev/null
