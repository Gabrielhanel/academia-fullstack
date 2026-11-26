# Laboratório C6.3 — nginx: proxy reverso, TLS e balanceamento

Executado em 2026-11-25: Docker 29.9.3, nginx 1.31.10 (`nginx:alpine`, com módulos ssl, v2 e v3 compilados), Node 26.13.1 (`node:26-alpine`), OpenSSL 3.5.5 (host), curl do host. Máquina com 8 núcleos (`worker_processes auto` → 8 workers).

## Arquivos
`app/server.mjs` (aplicação que ecoa o que recebeu; `/lento` atrasa 400 ms só na instância 1), `nginx.conf` (proxy, TLS, 3 upstreams, rate limit, gzip), `run.sh` (cria só recursos `lab-ngx-*`, gera certificado de teste em `certs/` e apaga tudo ao final), `saida-nginx.txt` (saída completa).

## Resultados medidos (duas execuções, mesmos números nas seções 1–3)
- **Proxy:** com `proxy_set_header`, a aplicação vê `Host: localhost`, `X-Forwarded-For`/`X-Real-IP` = 172.21.0.1 (gateway da rede Docker, não o cliente real) e `X-Forwarded-Proto: https`; sem eles vê `Host: app_rr` (nome do upstream) e nenhum cabeçalho de encaminhamento.
- **TLS:** certificado autoassinado (CN=localhost, SAN localhost e 127.0.0.1, 30 dias); `curl --cacert` → 200, HTTP/2, verificação 0; sem confiar no certificado → exit 60; HTTP → 301 com `Location: https://localhost:38443/...`; HSTS `max-age=31536000`; TLS 1.2 (ECDHE-RSA-AES256-GCM-SHA384) e TLS 1.3 (TLS_AES_256_GCM_SHA384) negociados.
- **Round-robin:** 90 requisições → 30, 32 e 28 (não exatamente 30/30/30). A documentação diz que, sem `zone`, o estado do upstream não é compartilhado entre workers, o que é compatível com o desvio; a causa não foi isolada experimentalmente.
- **least_conn:** 120 requisições com 12 em paralelo e app1 lenta (400 ms): round-robin 39/40/41; least_conn 14/56/50 (a instância lenta recebeu menos).
- **gzip:** `/grande` 20.320 bytes → 1.565 bytes transferidos (−92%).
- **Rate limit (5 r/s, burst 5):** 30 requisições seguidas → 12 × 200 e 18 × 429 (o laço levou algum tempo, durante o qual o balde se reabasteceu).
- **Failover (app2 parada):** com `proxy_next_upstream` 60 × 200 (app1 31, app3 29); sem ele 56 × 200 e 4 × 504 (timeout de conexão de 1 s à instância parada); após religar, as três voltaram a responder (10/8/12).

## Não executado
Let's Encrypt/ACME e certbot, OCSP stapling, mTLS, HTTP/3, varredura de cifras (testssl.sh, SSL Labs), recusa de TLS 1.1, health checks ativos (recurso do NGINX Plus), cache de proxy, WebSocket, Ingress Controller, produção real.

## Limitações
Tráfego sintético de curl na mesma máquina, certificado de teste, aplicação mínima, uma execução (com repetição das seções 1–3). Os 504 do failover dependem do `proxy_connect_timeout` e do estado de falha por worker.

## Reprodução
```bash
bash run.sh
```
