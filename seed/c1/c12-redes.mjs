// Curso C1.2 da C1: Redes de computadores e HTTP (disciplina: net).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c12-a.mjs';
import { REF2, lessonsB } from './c12-b.mjs';
import { exsets, assessment, project } from './c12-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['TCP/IP', 'DNS', 'HTTP e HTTPS', 'Protocolos de comunicação', 'HTTP/2 e HTTP/3'];
export const COVER = {
  'TCP/IP': ['red-01', 'red-02'],
  'DNS': ['red-03'],
  'HTTP e HTTPS': ['red-04', 'red-05'],
  'Protocolos de comunicação': ['red-06'],
  'HTTP/2 e HTTP/3': ['red-07']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Pacote', def: 'Unidade de dados da camada de rede (IP), com cabeçalho de origem e destino.' },
  { term: 'Latência', def: 'Tempo que uma mensagem leva para ir e voltar (RTT); independe da largura de banda.' },
  { term: 'Largura de banda', def: 'Volume de dados que um enlace transmite por segundo.' },
  { term: 'Proxy reverso', def: 'Servidor que recebe as requisições dos clientes e as encaminha aos servidores de aplicação (Nginx, CDN).' },
  { term: 'CDN', def: 'Rede de servidores distribuídos que entrega conteúdo a partir de pontos próximos do usuário.' },
  { term: 'Keep-alive', def: 'Reutilização da mesma conexão TCP para várias requisições HTTP.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'redes-http', disciplineId: 'net', disciplineIds: [], areaId: 'cs', requires: ['logica-algoritmos'],
  title: 'Redes de computadores e HTTP',
  description: 'Como os dados viajam do seu código até outro computador e voltam: o modelo de camadas, endereços IP, CIDR e portas; TCP e UDP; DNS; HTTP à mão (métodos, status, cabeçalhos, cache e cookies); HTTPS e TLS; técnicas de comunicação em tempo real (polling, SSE, WebSocket, gRPC); e as diferenças entre HTTP/1.1, HTTP/2 e HTTP/3, com medições e um roteiro de diagnóstico de ponta a ponta. Os exemplos foram executados com curl, dig, nc e openssl.',
  objectives: ['Explicar o modelo de camadas e calcular blocos CIDR, portas e rotas básicas', 'Diferenciar TCP e UDP e interpretar timeout, refused e reset', 'Descrever a resolução de DNS, os registros principais e o papel do TTL', 'Ler, escrever e depurar requisições e respostas HTTP, com status, cache e cookies corretos', 'Explicar o handshake do TLS, certificados e erros comuns de HTTPS', 'Escolher entre polling, SSE, WebSocket e gRPC conforme os requisitos', 'Comparar HTTP/1.1, HTTP/2 e HTTP/3 e diagnosticar desempenho com medições por fase'],
  level: 'I', prereqs: ['Lógica de programação básica', 'Uso elementar do terminal (recomendado: o curso Linux, terminal e sistemas operacionais)', 'Noções de como um navegador acessa um site (não é necessário saber programar rede)'], hours: 22,
  syllabus: 'Camadas TCP/IP, endereços IP, CIDR, NAT e portas; TCP, UDP e sockets; DNS (registros, cache e TTL); HTTP/1.1 (métodos, status, cabeçalhos, cache, cookies); HTTPS e TLS (certificados, SNI, ALPN, HSTS); polling, SSE, WebSocket e gRPC; HTTP/2, HTTP/3 e QUIC; diagnóstico com ip, ss, nc, dig, curl e openssl.',
  versions: 'Especificações vigentes em 2026-11-18: HTTP Semantics (RFC 9110), HTTP/1.1 (RFC 9112), HTTP/2 (RFC 9113), HTTP/3 (RFC 9114), QUIC (RFC 9000), TLS 1.3 (RFC 8446) e TCP (RFC 9293). Exemplos executados com curl 8.x (sem suporte a HTTP/3 no ambiente de teste), OpenSSL 3.x, dig (BIND) e netcat em Linux. Os resultados de consultas à internet (IPs, certificados, tempos) variam com o momento e o local.',
  skills: ['Modelo de camadas', 'Endereçamento IP e CIDR', 'TCP, UDP e sockets', 'DNS', 'HTTP e APIs', 'HTTPS e TLS', 'Comunicação em tempo real', 'Desempenho de rede', 'Diagnóstico de conectividade'],
  modules: [
    { id: 'm1', title: 'Camadas, IP, TCP e DNS', lessons: ['red-01', 'red-02', 'red-03'] },
    { id: 'm2', title: 'HTTP e HTTPS', lessons: ['red-04', 'red-05'] },
    { id: 'm3', title: 'Comunicação em tempo real e HTTP moderno', lessons: ['red-06', 'red-07'] }
  ],
  materials: [REF.mdnHowWeb, REF2.rfc9110, REF2.mdnHttp, REF2.rfc8446, REF.rfc9293].map((r) => ({ ...r })),
  projectIds: ['diagnostico-de-url'],
  supplement: {
    glossary,
    cheatsheet: R`### Camadas e endereços
Aplicação (HTTP, DNS, SSH) · Transporte (TCP, UDP: portas) · Rede (IP) · Enlace (Ethernet, Wi-Fi). Privadas: §10/8§, §172.16/12§, §192.168/16§. Loopback: §127.0.0.1§, §::1§.
**CIDR:** hosts = 2^(32 − prefixo) − 2. §/24§ = 254 · §/16§ = 65.534 · §/8§ = 16.777.214 · §/32§ = 1 host.

### Portas
§22§ SSH · §25§ SMTP · §53§ DNS · §80§ HTTP · §443§ HTTPS · §3306§ MySQL · §5432§ PostgreSQL · §6379§ Redis

### TCP x UDP
TCP: handshake (SYN, SYN-ACK, ACK), ordem, retransmissão, controle de fluxo e de congestionamento. UDP: sem conexão nem garantias, latência mínima. **Refused** = nada escuta; **timeout** = nada respondeu (firewall/rota).

### DNS
§A§ IPv4 · §AAAA§ IPv6 · §CNAME§ apelido · §MX§ e-mail · §NS§ autoritativos · §TXT§ texto · §PTR§ reverso. TTL = prazo de cache. §dig nome +short§ · §dig @1.1.1.1 nome§ · §dig -x IP +short§ · §dig nome NS +short§.

### HTTP
Métodos: GET/HEAD seguros; GET/PUT/DELETE idempotentes; POST nem um nem outro.
Status: 2xx ok · 3xx redirecionamento (§Location§) · 4xx erro do cliente (401 sem credencial, 403 sem permissão) · 5xx erro do servidor (502/504 = proxy).
Cache: §Cache-Control: max-age=N§, §no-store§ (não guardar), §no-cache§ (revalidar), ETag + §If-None-Match§ → 304.
Cookie de sessão: §HttpOnly; Secure; SameSite=Lax§.

### TLS e HTTPS
Certificado (SAN, emissor, validade) assinado por CA · SNI escolhe o certificado · ALPN negocia h2 · HSTS força HTTPS · wildcard cobre **um** nível · TLS 1.3 = 1 RTT. Nunca desligue a verificação em produção.

### Tempo real
Short polling · long polling · **SSE** (servidor → cliente, HTTP, reconecta sozinho) · **WebSocket** (bidirecional, 101 Switching Protocols, wss) · **gRPC** (HTTP/2 + protobuf, entre serviços). Heartbeats contra idle timeout.

### HTTP/2 e HTTP/3
HTTP/2: multiplexação, HPACK, ainda sobre TCP (bloqueio de cabeça de fila no TCP). HTTP/3: QUIC sobre UDP/443, streams independentes, TLS 1.3 embutido, migração de conexão; anunciado por §Alt-Svc§, com fallback.

### Diagnóstico
§ip -br addr§ · §ip route§ · §ss -ltn§ · §nc -vz host porta§ · §dig§ · §openssl s_client -connect h:443 -servername h§ · §curl -sv URL§ · §curl -w '%{time_namelookup} %{time_connect} %{time_appconnect} %{time_starttransfer} %{time_total}'§ (tempos acumulados).`,
    mistakes: ['Confundir "connection refused" com "timeout".', 'Usar 127.0.0.1 como endereço de escuta e esperar acesso externo.', 'Esperar que a "propagação" de DNS seja imediata com TTL alto.', 'Devolver 200 com erro no corpo.', 'Confundir 401 com 403 e no-cache com no-store.', 'Desligar a verificação de certificados para "resolver" um erro.', 'Usar WebSocket onde SSE ou polling bastam, e esquecer heartbeats e reconexão.', 'Otimizar a rede quando o gargalo é o tempo do servidor.'],
    prereqMap: R`**Antes deste curso:** lógica de programação e noções básicas de terminal (veja Linux, terminal e sistemas operacionais). Não é preciso programar redes.

| Este curso prepara para | Por quê |
|---|---|
| APIs do navegador e Web Platform | fetch, cookies, CORS, WebSockets e SSE se apoiam no HTTP |
| APIs REST, GraphQL e WebSockets (Backend) | semântica de métodos, status e cache |
| Nginx, proxy reverso e deploy | terminação TLS, HTTP/2, balanceamento |
| Docker e Kubernetes | redes de contêineres, portas, DNS interno |
| Segurança e OWASP | TLS, cookies, cabeçalhos de segurança |
| System Design | latência, DNS, CDN, balanceadores |

Ordem interna: aulas 1 a 3 (IP, TCP/UDP e DNS) → 4 e 5 (HTTP e HTTPS) → 6 e 7 (tempo real e HTTP moderno, com diagnóstico).`,
    officialRefs: [REF.rfc791, REF.rfc4632, REF.rfc1918, REF.rfc9293, REF.rfc768, REF.rfc1035, REF2.rfc9110, REF2.rfc9111, REF2.rfc9112, REF2.rfc9113, REF2.rfc9114, REF2.rfc9000, REF2.rfc8446, REF2.rfc6265, REF2.rfc6455, REF2.sse, REF2.mdnHttp, REF.curlMan],
    practice: ['Calcule à mão três blocos CIDR e confira com o seu código do exercício.', 'Suba um servidor HTTP local, envie uma requisição crua com nc e identifique cada parte da resposta.', 'Use dig para listar A, NS, MX e TXT de um domínio seu e anote os TTLs.', 'Compare o resultado de curl -sI com --http1.1 e --http2 em um site público.', 'Meça as fases de uma requisição HTTPS com curl -w e diga qual domina.', 'Inspecione o certificado de um site com openssl s_client e anote emissor, SAN e validade.', 'Implemente um endpoint SSE simples (Node.js ou Python) e consuma com EventSource, depois derrube a conexão e observe a reconexão.', 'Faça o projeto integrador: o diagnóstico-url.sh.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
