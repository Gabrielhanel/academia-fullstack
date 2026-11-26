// Curso C6.3 da C6: Nginx, proxy reverso e deploy (disciplina: nginx).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c63-a.mjs';
import { REF2, lessonsB } from './c63-b.mjs';
import { exsets, assessment, project } from './c63-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Proxy reverso', 'TLS e HTTPS', 'Load balancing'];
export const COVER = {
  'Proxy reverso': ['ngx-01'],
  'TLS e HTTPS': ['ngx-02'],
  'Load balancing': ['ngx-03']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Upstream', def: 'Grupo de servidores de aplicação para os quais o nginx encaminha requisições.' },
  { term: 'Worker', def: 'Processo do nginx que atende conexões; o estado de upstream sem zone não é compartilhado entre workers.' },
  { term: 'Fullchain', def: 'Arquivo com o certificado do servidor seguido das intermediárias.' },
  { term: 'OCSP stapling', def: 'Técnica em que o servidor entrega a resposta de revogação do certificado junto ao handshake.' },
  { term: 'HTTP 429', def: 'Código Too Many Requests, usado quando o cliente excede o limite de taxa.' },
  { term: 'Health check ativo', def: 'Sonda periódica que verifica a saúde dos servidores antes de o tráfego chegar a eles.' },
  { term: 'Afinidade de sessão', def: 'Direcionar o mesmo cliente à mesma instância, por IP ou cookie.' },
  { term: 'Leaky bucket', def: 'Algoritmo de limite de taxa em que requisições escoam a uma taxa fixa e o excesso acima do burst é rejeitado.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'nginx', disciplineId: 'nginx', areaId: 'ops', requires: [],
  title: 'Nginx: proxy reverso, TLS e HTTPS, balanceamento de carga e rate limit',
  description: 'Configurar e operar a borda de uma aplicação com o nginx, com experimentos executados em um laboratório (nginx 1.31.10, três instâncias Node 26, OpenSSL 3.5.5): proxy reverso e cabeçalhos (a aplicação viu Host app_rr sem proxy_set_header e Host localhost com X-Forwarded-For/Proto com ele; gzip de 20.320 para 1.565 bytes); TLS e HTTPS (certificado autoassinado com SAN, HTTP/2, 301, HSTS, TLS 1.2 e 1.3, exit 60 sem confiar no certificado); balanceamento (round-robin 30/32/28 em 90 requisições, least_conn com instância lenta 14 contra 39 requisições, failover com e sem proxy_next_upstream 60 x 200 contra 56 x 200 e 4 x 504, rate limit 5 r/s burst 5 com 12 x 200 e 18 x 429). Projeto: borda nginx. Let’s Encrypt/ACME, OCSP stapling, mTLS, HTTP/3, health checks ativos, cache de proxy e Ingress não foram executados.',
  objectives: ['Configurar o nginx como proxy reverso com cabeçalhos corretos e operá-lo com nginx -t e reload', 'Habilitar HTTPS com certificados válidos, redirecionamento, HSTS e HTTP/2 e verificá-los', 'Balancear carga com algoritmos adequados e configurar failover e retentativas com segurança', 'Aplicar rate limit e compressão e medir seus efeitos', 'Distinguir o que foi medido do que foi apenas analisado'],
  level: 'M', prereqs: ['Redes e HTTP básicos (Onda 1)', 'Docker (C6.1)', 'Docker 29 ou superior (o curso usa 29.9.3)'], hours: 7,
  syllabus: 'Proxy reverso; TLS e HTTPS; load balancing, failover e rate limit; projeto de borda nginx.',
  versions: 'Docker 29.9.3, nginx 1.31.10 (nginx:alpine), Node 26.13.1 (node:26-alpine) e OpenSSL 3.5.5, em 2026-11-25 (laboratório em seed/c6/labs/nginx/), máquina de 8 núcleos (8 workers). Medidas de execuções com tráfego sintético de curl na mesma máquina. Achados: distribuição do round-robin não exata (30/32/28, causa não isolada; documentação sugere estado por worker sem zone); X-Forwarded-For medido era o gateway Docker. Os desafios de código são em JavaScript e modelam a lógica. Não executados: ACME/Let’s Encrypt, OCSP stapling, mTLS, HTTP/3, ip_hash, hash consistente, pesos, health checks ativos (NGINX Plus), zone, cache de proxy, WebSocket, Ingress Controller e produção.',
  skills: ['Proxy reverso nginx', 'HTTPS e certificados', 'Balanceamento de carga', 'Failover e rate limit', 'Diagnóstico com curl e openssl', 'Operação segura de configuração'],
  modules: [
    { id: 'm1', title: 'Proxy reverso e TLS', lessons: ['ngx-01', 'ngx-02'] },
    { id: 'm2', title: 'Balanceamento e resiliência', lessons: ['ngx-03'] }
  ],
  materials: [REF.nginxBeginners, REF.nginxProxy, REF.nginxHttps, REF.mozillaSsl, REF2.nginxUpstream].map((r) => ({ ...r })),
  projectIds: ['borda-nginx'],
  supplement: {
    glossary,
    cheatsheet: R`### Proxy reverso
location por prefixo (^~ bloqueia regex; exato com =) · proxy_pass sem URI repassa o caminho, com URI troca o prefixo (cuidado com a barra) · proxy_set_header Host $host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto · realip só com proxies confiáveis · gzip só para texto · proxy_connect_timeout curto · nginx -t, reload e conferir

### TLS
SAN obrigatório · fullchain · TLSv1.2 e TLSv1.3 · http2 on · return 301 https://... · HSTS com max-age curto no início · ACME + renovação + alerta + reload · curl exit 60 = certificado não confiável (nunca -k em produção) · openssl s_client -tls1_3

### Balanceamento
round-robin (aproximado) · least_conn (durações variáveis) · ip_hash/hash (afinidade) · weight · down (nunca weight=0) · backup · zone (estado compartilhado) · max_fails/fail_timeout · proxy_next_upstream (sem retentar não idempotentes) · health check ativo = NGINX Plus/HAProxy/Envoy

### Rate limit
limit_req_zone chave+rate · limit_req burst nodelay · limit_req_status 429 · Retry-After · limit_conn · não substitui WAF/CDN

### Operação
server_tokens off · stub_status protegido · logs com $request_time/$upstream_response_time · mais de um balanceador`,
    mistakes: ['Esquecer proxy_set_header Host e X-Forwarded-Proto.', 'Barra sobrando ou faltando no proxy_pass.', 'Confiar em X-Forwarded-For da internet.', 'Usar curl -k para contornar certificado.', 'HSTS longo com includeSubDomains logo no início.', 'Esperar divisão exata do round-robin.', 'proxy_next_upstream com http_500 em operações com efeito.', 'Um único nginx como balanceador.'],
    prereqMap: R`**Antes deste curso:** HTTP e redes básicos, Docker (C6.1) e noções de TLS.

| Este curso prepara para | Por quê |
|---|---|
| Cloud (C6.4) | balanceadores e certificados gerenciados |
| Monitoramento (C6.6) | logs e métricas da borda (stub_status, tempos de upstream) |
| Segurança (C7) | TLS, cabeçalhos e limites de taxa na prática |

Ordem interna: proxy reverso → TLS → balanceamento → projeto.`,
    officialRefs: [REF.nginxBeginners, REF.nginxProxy, REF.nginxLocation, REF.nginxGzip, REF.nginxRealip, REF.nginxSsl, REF.nginxHttps, REF.nginxV2, REF.mozillaSsl, REF.rfc8446, REF.rfc6797, REF.letsencrypt, REF.opensslSclient, REF2.nginxUpstream, REF2.nginxLb, REF2.nginxLimitReq, REF2.nginxProxyNext, REF2.rfc9110, REF2.rfc6585],
    practice: ['Compare os cabeçalhos recebidos com e sem proxy_set_header.', 'Gere um certificado com SAN e sirva HTTPS com HTTP/2.', 'Verifique com curl --cacert, curl sem confiar e openssl s_client.', 'Meça a distribuição do round-robin e do least_conn com uma instância lenta.', 'Pare uma instância e compare o failover com e sem proxy_next_upstream.', 'Aplique um rate limit e explique a contagem de 429.', 'Faça o projeto integrador: borda nginx.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
