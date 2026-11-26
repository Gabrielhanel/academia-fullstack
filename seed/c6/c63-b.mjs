// C6.3 — Nginx, proxy reverso e deploy. Aula 3 (load balancing, failover e rate limit).
const R = String.raw;

export const REF2 = {
  nginxUpstream: { title: 'nginx — ngx_http_upstream_module', url: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html', kind: 'doc' },
  nginxLb: { title: 'nginx — HTTP Load Balancing (guia do NGINX)', url: 'https://nginx.org/en/docs/http/load_balancing.html', kind: 'guia' },
  nginxLimitReq: { title: 'nginx — ngx_http_limit_req_module', url: 'https://nginx.org/en/docs/http/ngx_http_limit_req_module.html', kind: 'doc' },
  nginxProxyNext: { title: 'nginx — proxy_next_upstream', url: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream', kind: 'doc' },
  rfc9110: { title: 'RFC 9110 — HTTP Semantics (métodos idempotentes)', url: 'https://datatracker.ietf.org/doc/html/rfc9110#name-idempotent-methods', kind: 'rfc' },
  rfc6585: { title: 'RFC 6585 — 429 Too Many Requests', url: 'https://datatracker.ietf.org/doc/html/rfc6585#section-4', kind: 'rfc' }
};

export const lessonsB = [
{
  id: 'ngx-03', moduleId: 'm2', order: 3, minutes: 90, tags: ['load balancing', 'upstream', 'round-robin', 'least_conn', 'failover', 'max_fails', 'rate limit', '429', 'proxy_next_upstream'],
  title: 'Load balancing no nginx: algoritmos, failover e rate limit, medidos com instâncias reais',
  objectives: ['Comparar round-robin, least_conn, ip_hash e pesos e escolher por carga e estado', 'Configurar failover passivo com max_fails, fail_timeout e proxy_next_upstream e medir seu efeito', 'Aplicar rate limit com limit_req (rate e burst) e interpretar o 429', 'Reconhecer os limites: estado por worker, health checks ativos, requisições não idempotentes e ponto único de falha'],
  intro: R`**Uma instância só** é **um ponto único de falha** e **um teto de capacidade**. O **balanceador** **distribui** as requisições entre **várias instâncias**, **tira do ar** as que **falham** e **protege** a aplicação de **excesso de tráfego**. Aqui você **mede** com **3 instâncias Node reais** atrás do **nginx 1.31.10**: **distribuição**, **efeito de uma instância lenta**, **falha de uma instância** e **limite de taxa**.`,
  theory: R`### Algoritmos de distribuição (open source)
| Algoritmo | Diretiva | Quando usar | Cuidados |
|---|---|---|---|
| **Round-robin** (padrão) | — (com §weight§ opcional) | **instâncias iguais e requisições parecidas** | **ignora a carga real** |
| **Menos conexões** | §least_conn;§ | **requisições de duração muito variável** | **conta conexões ativas, não custo** |
| **Hash do IP do cliente** | §ip_hash;§ | **afinidade simples** (**sessão em memória**) | **muitos clientes atrás de um NAT desbalanceiam** |
| **Hash genérico** | §hash $request_uri consistent;§ | **cache por URL**, **afinidade por chave** | **remover servidor realoca parte das chaves** |
| **Aleatório** | §random two least_conn;§ | **vários balanceadores sem estado compartilhado** | **menos previsível** |
**Pesos:** §server a:3000 weight=3;§ (**instâncias de capacidades diferentes**). **Desligar:** **§down§** (**nunca §weight=0§**: **aprendido na aula 4 de CI/CD**). **Reserva:** §backup§ (**só recebe se todas as outras falharem**). **Observação:** **o health check ativo (sonda periódica) é recurso do NGINX Plus**; **no nginx de código aberto a detecção de falha é passiva** (**abaixo**).

### O laboratório
**3 instâncias Node** (§lab-ngx-app1..3§) **e 3 grupos de upstream**: §app_rr§ (**round-robin**), §app_lc§ (§least_conn§) e §app_fo§ (**com §max_fails=1 fail_timeout=5s§**). **A aplicação** **ecoa o nome da instância**; **em §/lento§ a instância 1 atrasa 400 ms**.

### Medição 1: round-robin
**90 requisições** → **app1 30, app2 32, app3 28** (**repetido em duas execuções, mesmos números**). **Observação importante:** **não deu 30/30/30**. **A documentação** diz que, **sem a diretiva §zone§ no upstream**, **o estado do grupo não é compartilhado entre os *workers*** (**aqui 8**), **o que é compatível com o desvio**; **a causa não foi isolada experimentalmente**. **Lição:** **round-robin é "aproximadamente igual"**, **não um contador exato**; **use §zone§** (**memória compartilhada**) **quando precisar de estado consistente** (**falhas, contadores**).

### Medição 2: instância lenta (round-robin x least_conn)
**120 requisições, 12 em paralelo, em §/lento§** (**app1 leva 400 ms; as demais respondem na hora**):
| Algoritmo | app1 (lenta) | app2 | app3 |
|---|---|---|---|
| **Round-robin** | **39** | **40** | **41** |
| **least_conn** | **14** | **56** | **50** |
**Leitura:** **o round-robin manda a mesma fatia à instância lenta** (**e as requisições se acumulam nela**); **o least_conn percebe as conexões abertas** e **envia ~3,5 vezes menos** a ela. **Limite:** **é uma simulação** (**atraso artificial fixo**, **tráfego sintético**): **o ganho real depende da carga**.

### Failover passivo e proxy_next_upstream (medido)
**Cenário:** **app2 parada** (§docker stop§).
- §max_fails=1 fail_timeout=5s§: **após 1 falha, o servidor é considerado indisponível por 5 s**, **e volta a ser testado** depois.
- §proxy_next_upstream error timeout http_502 http_503§: **se a tentativa falha, o nginx tenta o próximo servidor** **na mesma requisição**.
**Resultados (60 requisições cada):**
| Configuração | Respostas |
|---|---|
| **com** §proxy_next_upstream§ | **60 × 200** (**app1 31, app3 29**) |
| **sem** (§proxy_next_upstream off§) | **56 × 200 e 4 × 504** |
**Os 504** são **timeouts de conexão** (§proxy_connect_timeout 1s§) **ao IP do contêiner parado**; **com a retentativa, o cliente nem percebeu**. **Depois de religar a app2**, **as três voltaram a responder** (**10/8/12 em 30**).
**Cuidados com a retentativa:**
- **requisições não idempotentes** (**POST**, **PATCH**) **não são retentadas por padrão** depois de **enviadas** (**risco de duplicar pagamento**); **só habilite §non_idempotent§ se a aplicação tiver chaves de idempotência**;
- **limite as tentativas** (§proxy_next_upstream_tries§, §proxy_next_upstream_timeout§) **para evitar tempestade de retentativas**;
- **"falha" para o nginx é erro de conexão/timeout** (**e os códigos listados**), **não uma resposta 500 da aplicação** (**a menos que você a inclua com §http_500§**: **perigoso**, **pode repetir uma operação com efeito**).
**Limite do passivo:** **o primeiro cliente a topar com a instância ruim paga o custo** (**aqui 1 s**). **Health checks ativos** (**NGINX Plus**, **HAProxy**, **Envoy**, **balanceadores de nuvem**) **detectam antes**.

### Rate limit (medido)
§limit_req_zone $binary_remote_addr zone=lim:1m rate=5r/s;§ (**chave: IP; 5 requisições/s; 1 MB de memória guarda ~16 mil estados**) **e** §limit_req zone=lim burst=5 nodelay; limit_req_status 429;§. **Algoritmo:** ***leaky bucket***: **a taxa** é **o esvaziamento**; **o *burst*** **é o balde** (**5 de folga**); **§nodelay§** **atende o burst na hora** (**sem espaçar**); **excedeu → 429 (*Too Many Requests*)**.
**Resultado:** **30 requisições seguidas → 12 × 200 e 18 × 429**. **Por que 12 e não 6?** **O laço levou algum tempo** (**cada requisição faz um handshake TLS**), **durante o qual o balde se reabasteceu a 5/s**: **o resultado depende da duração**, **não é um valor fixo**.
**Boas práticas:** **escolha a chave certa** (**IP, usuário, chave de API**; **atrás de NAT, o IP agrupa muita gente**); **diferencie rotas** (**login mais restrito**); **devolva §Retry-After§**; **limite também conexões** (§limit_conn§); **rate limit no proxy não substitui limites na aplicação** (**e não é proteção contra DDoS volumétrico**: **use CDN/WAF**).

### Estado, sessões e o balanceador como ponto único
- **Sem estado:** **o ideal** (**sessão em Redis/JWT**), **qualquer instância atende**. **Com afinidade (§ip_hash§ ou cookie)**, **o escalonamento fica desigual e o failover perde sessões**.
- **Conexões longas** (**WebSocket**): **o least_conn ajuda**, **mas o desligamento de uma instância derruba as conexões**: **planeje a reconexão**.
- **O nginx também é ponto único de falha**: **dois ou mais balanceadores** (**keepalived/VRRP**, **IP flutuante**, **DNS**, **balanceador de nuvem**). **No laboratório havia um só.**
- **Drenagem:** **ao tirar uma instância** (**deploy**), **marque-a §down§, recarregue e espere as conexões acabarem** (**ou use a recarga graciosa**).

### Kubernetes e nuvem
**Em Kubernetes**, **o Service** **balanceia entre pods prontos** (**readiness**, curso anterior) **e o Ingress Controller** (**frequentemente nginx**) **faz o balanceamento HTTP**; **na nuvem**, **ALB/NLB/Cloud Load Balancing** **trazem health checks ativos e integração com autoescalonamento**. **Nada disso foi executado aqui.**

### Executado e não executado
**Executado:** **round-robin, least_conn, failover com e sem retentativa, rate limit, religamento**. **Não executado:** **ip_hash, hash consistente, pesos, backup, health checks ativos, zone compartilhada, limit_conn, balanceador redundante, balanceadores de nuvem**.`,
  concepts: [
    { term: 'Round-robin', def: 'Distribuição que alterna as requisições entre os servidores em ordem, opcionalmente ponderada por pesos.' },
    { term: 'least_conn', def: 'Algoritmo que envia a requisição ao servidor com menos conexões ativas.' },
    { term: 'Failover passivo', def: 'Detecção de falha pela observação de erros reais de tráfego (max_fails e fail_timeout), sem sondas periódicas.' },
    { term: 'proxy_next_upstream', def: 'Diretiva que define em que condições o nginx tenta o próximo servidor na mesma requisição.' },
    { term: 'Rate limit', def: 'Limite da taxa de requisições por chave (como IP); o nginx usa o algoritmo leaky bucket com rate e burst.' },
    { term: 'Burst', def: 'Folga de requisições acima da taxa que o limit_req aceita antes de rejeitar.' },
    { term: 'Idempotência', def: 'Propriedade de uma operação poder ser repetida sem efeito adicional; GET e PUT são idempotentes, POST não.' },
    { term: 'Ponto único de falha', def: 'Componente cuja falha derruba o sistema inteiro, como um único balanceador.' }
  ],
  examples: R`**Analogia:** o balanceador é **o maître de um restaurante com três garçons**: **round-robin** é **distribuir as mesas na ordem** (**mesmo que um garçom esteja atolado**); **least_conn** é **mandar a próxima mesa a quem tem menos mesas abertas**; **failover** é **quando um garçom some e o maître passa a mesa ao próximo**; **rate limit** é **a fila na porta** quando **chega gente demais de uma vez**.

**Exemplo concreto (medido):** **com a app2 parada**, **60 requisições deram 60 × 200 com a retentativa e 56 × 200 + 4 × 504 sem ela**; **com a app1 lenta**, **o least_conn mandou 14 requisições a ela contra 39 do round-robin**; **e o rate limit rejeitou 18 de 30 requisições com 429**.`,
  code: [
    { title: 'Upstreams do laboratório: round-robin, least_conn e failover passivo (nginx 1.31.10)', lang: 'nginx', code: R`upstream app_rr { server lab-ngx-app1:3000; server lab-ngx-app2:3000; server lab-ngx-app3:3000; }
upstream app_lc {
  least_conn;
  server lab-ngx-app1:3000; server lab-ngx-app2:3000; server lab-ngx-app3:3000;
}
upstream app_fo {
  server lab-ngx-app1:3000 max_fails=1 fail_timeout=5s;
  server lab-ngx-app2:3000 max_fails=1 fail_timeout=5s;
  server lab-ngx-app3:3000 max_fails=1 fail_timeout=5s;
}
# location /fo/ { proxy_pass http://app_fo/; proxy_next_upstream error timeout http_502 http_503; }
# location /fo-sem/ { proxy_pass http://app_fo/; proxy_next_upstream off; }`, notes: [{ l: 3, t: 'Medido: com app1 lenta, recebeu 14 requisições contra 39 do round-robin.' }, { l: 7, t: 'Após 1 falha o servidor sai do rodízio por 5 s.' }, { l: 11, t: 'Com retentativa: 60 x 200. Sem: 56 x 200 e 4 x 504.' }] },
    { title: 'Rate limit com leaky bucket (medido: 12 x 200 e 18 x 429 em 30 requisições)', lang: 'nginx', code: R`limit_req_zone $binary_remote_addr zone=lim:1m rate=5r/s;

location /limitado/ {
  limit_req zone=lim burst=5 nodelay;
  limit_req_status 429;
  proxy_pass http://app_rr/;
}`, notes: [{ l: 1, t: 'Chave por IP, 5 requisições por segundo, 1 MB de estado.' }, { l: 4, t: 'burst=5 aceita 5 requisições de folga; nodelay as atende sem espaçar.' }, { l: 5, t: 'Código 429 em vez do 503 padrão.' }] },
    { title: 'Medindo a distribuição e os códigos', lang: 'bash', code: R`# distribuição em 90 requisições (resultado medido: 30, 32 e 28)
for i in $(seq 1 90); do curl -s --cacert certs/cert.pem https://localhost:38443/; echo; done | grep -o '"instancia":"[a-z0-9]*"' | sort | uniq -c
# 120 requisições, 12 em paralelo, na rota lenta
seq 1 120 | xargs -P 12 -I{} curl -s --cacert certs/cert.pem https://localhost:38443/lc/lento | grep -o '"instancia":"[a-z0-9]*"' | sort | uniq -c
# códigos do rate limit
for i in $(seq 1 30); do curl -s --cacert certs/cert.pem -o /dev/null -w '%{http_code}\n' https://localhost:38443/limitado/; done | sort | uniq -c`, notes: [{ l: 2, t: 'uniq -c conta as respostas por instância.' }, { l: 4, t: 'xargs -P cria concorrência para o least_conn ter o que contar.' }, { l: 6, t: 'O resultado depende de quanto tempo o laço levou.' }] }
  ],
  bestPractices: ['Escolha o algoritmo pela variação da duração das requisições e pela necessidade de afinidade.', 'Prefira aplicações sem estado e coloque a sessão fora das instâncias.', 'Combine max_fails, fail_timeout, proxy_connect_timeout curto e proxy_next_upstream com limites de tentativas.', 'Não retente requisições não idempotentes sem chave de idempotência.', 'Use rate limit com chave adequada, rotas diferenciadas, 429 e Retry-After.', 'Use zone para estado compartilhado entre workers e health checks ativos quando a falha precisar ser detectada antes do cliente.', 'Elimine o ponto único de falha do balanceador e planeje a drenagem em deploys.'],
  mistakes: ['Esperar divisão exata do round-robin.', 'Usar weight=0 em vez de down.', 'proxy_next_upstream com http_500 em operações com efeito colateral.', 'Rate limit por IP atrás de NAT corporativo.', 'Um único nginx como balanceador de tudo.', 'Achar que o rate limit do proxy protege de DDoS volumétrico.'],
  market: R`**Balanceamento, failover e limites de taxa** são **assunto central** em **entrevistas de SRE e arquitetura**; **explicar a diferença entre falha passiva e ativa** **e os riscos da retentativa** **distingue candidatos sêniores**.`,
  summary: R`O nginx distribui por round-robin (padrão, com pesos), least_conn, ip_hash, hash e random, detecta falhas passivamente (max_fails e fail_timeout) e retenta com proxy_next_upstream; health checks ativos são do NGINX Plus. Medido com 3 instâncias Node: 90 requisições deram 30/32/28; com uma instância lenta o least_conn enviou 14 requisições a ela contra 39 do round-robin (120 requisições, 12 em paralelo); com uma instância parada, 60 x 200 com retentativa e 56 x 200 mais 4 x 504 sem ela; o rate limit de 5 r/s com burst 5 rejeitou 18 de 30 requisições com 429. Cuidados: estado por worker, requisições não idempotentes e balanceador único. ip_hash, pesos, health checks ativos, zone e redundância do balanceador não foram executados.`,
  refs: [REF2.nginxUpstream, REF2.nginxLb, REF2.nginxLimitReq, REF2.nginxProxyNext, REF2.rfc9110, REF2.rfc6585],
  cards: [
    { q: 'Quando preferir least_conn ao round-robin?', a: 'Quando a duração das requisições varia muito; no laboratório, com uma instância lenta, ela recebeu 14 requisições contra 39 no round-robin.' },
    { q: 'O que os 504 sem proxy_next_upstream mostraram?', a: 'Que a falha passiva custa ao cliente que encontra a instância parada (timeout de conexão); com a retentativa, as 60 requisições deram 200.' },
    { q: 'Por que não retentar POST automaticamente?', a: 'Porque pode duplicar efeitos (como um pagamento); o nginx não retenta não idempotentes depois de enviados, salvo non_idempotent.' },
    { q: 'O que são rate, burst e nodelay no limit_req?', a: 'Rate é a taxa sustentada, burst é a folga acima dela e nodelay atende o burst sem espaçar; o excedente recebe o status configurado (429).' }
  ]
}
];
