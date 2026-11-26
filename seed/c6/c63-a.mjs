// C6.3 — Nginx, proxy reverso e deploy. Aulas 1 e 2 (proxy reverso; TLS e HTTPS).
const R = String.raw;

export const REF = {
  nginxBeginners: { title: 'nginx — Beginner’s Guide', url: 'https://nginx.org/en/docs/beginners_guide.html', kind: 'doc' },
  nginxProxy: { title: 'nginx — ngx_http_proxy_module', url: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html', kind: 'doc' },
  nginxLocation: { title: 'nginx — Server names and location (http core)', url: 'https://nginx.org/en/docs/http/ngx_http_core_module.html#location', kind: 'doc' },
  nginxGzip: { title: 'nginx — ngx_http_gzip_module', url: 'https://nginx.org/en/docs/http/ngx_http_gzip_module.html', kind: 'doc' },
  nginxRealip: { title: 'nginx — ngx_http_realip_module', url: 'https://nginx.org/en/docs/http/ngx_http_realip_module.html', kind: 'doc' },
  nginxSsl: { title: 'nginx — ngx_http_ssl_module', url: 'https://nginx.org/en/docs/http/ngx_http_ssl_module.html', kind: 'doc' },
  nginxHttps: { title: 'nginx — Configuring HTTPS servers', url: 'https://nginx.org/en/docs/http/configuring_https_servers.html', kind: 'guia' },
  nginxV2: { title: 'nginx — ngx_http_v2_module', url: 'https://nginx.org/en/docs/http/ngx_http_v2_module.html', kind: 'doc' },
  mozillaSsl: { title: 'Mozilla — SSL Configuration Generator', url: 'https://ssl-config.mozilla.org/', kind: 'ferramenta' },
  rfc8446: { title: 'RFC 8446 — TLS 1.3', url: 'https://datatracker.ietf.org/doc/html/rfc8446', kind: 'rfc' },
  rfc6797: { title: 'RFC 6797 — HTTP Strict Transport Security (HSTS)', url: 'https://datatracker.ietf.org/doc/html/rfc6797', kind: 'rfc' },
  letsencrypt: { title: 'Let’s Encrypt — How it works', url: 'https://letsencrypt.org/how-it-works/', kind: 'doc' },
  opensslSclient: { title: 'OpenSSL — openssl-s_client', url: 'https://docs.openssl.org/master/man1/openssl-s_client/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'ngx-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['nginx', 'proxy reverso', 'proxy_pass', 'location', 'cabeçalhos', 'gzip', 'timeouts', 'nginx -t'],
  title: 'Nginx como proxy reverso: location, proxy_pass, cabeçalhos, compressão e operação',
  objectives: ['Explicar o papel do proxy reverso e do nginx na borda de uma aplicação', 'Configurar location e proxy_pass e entender a regra do URI com e sem barra final', 'Repassar Host, IP do cliente e protocolo com proxy_set_header e interpretar o efeito medido', 'Aplicar gzip, timeouts e operar com nginx -t e reload'],
  intro: R`Entre o **navegador** e a **aplicação Node** quase sempre existe um **nginx**. Ele **termina TLS**, **comprime**, **protege**, **distribui** e **isola** a aplicação da internet. Nesta aula você **configura um proxy reverso** de verdade (**nginx 1.31.10** com **3 instâncias Node** em contêineres) e **mede** o que a aplicação **enxerga** com e **sem** os cabeçalhos certos.`,
  theory: R`### O que é um proxy reverso
**Proxy direto** representa **clientes** (sai para a internet); **proxy reverso** representa **servidores** (**recebe** as requisições **em nome** da aplicação). Vantagens: **ponto único** de **TLS**, **compressão**, **cache**, **limites**, **logs**; **a aplicação fica numa rede privada**; **permite trocar, escalar e liberar versões** sem mudar o endereço público (aula 4 do curso anterior). **Alternativas:** **Caddy**, **Traefik**, **HAProxy**, **Envoy** (**há um Envoy** de imagem no ambiente, **não usado** aqui), **balanceadores de nuvem**, **Ingress Controllers**.

### Estrutura da configuração
**Contextos:** §events§ → §http§ → §server§ (**host virtual**) → §location§ (**por caminho**). **Diretivas herdam** para dentro. **No contêiner oficial**, **arquivos em §/etc/nginx/conf.d/*.conf§** **entram dentro do §http§**.
**Escolha da §location§** (regras da documentação): (1) **prefixo exato** §= /caminho§; (2) **maior prefixo** (§^~§ **impede** regex); (3) **expressões regulares** (§~§ sensível, §~*§ insensível) **na ordem do arquivo**; (4) **usa o maior prefixo guardado**. **Dica:** **prefixos simples bastam** na maioria dos casos; **regex é fonte de surpresas**.

### proxy_pass e a regra da barra
- §location /api/ { proxy_pass http://app; }§ (**sem URI**): **repassa o caminho original** (§/api/x§ → §/api/x§).
- §location /lc/ { proxy_pass http://app_lc/; }§ (**com URI, a barra**): **substitui o prefixo casado** (§/lc/lento§ → §/lento§). **Usado no laboratório** para **ter caminhos de teste diferentes** com **a mesma aplicação**.
**Erro clássico:** **esquecer ou sobrar uma barra** muda **o caminho** recebido **sem aviso**; **teste com §curl§ e leia o que a aplicação recebeu**.

### Cabeçalhos: o que a aplicação enxerga (medido)
**Sem configuração**, o nginx **troca** o §Host§ pelo **nome do upstream** (§$proxy_host§). **Medido** (aplicação que **ecoa** os cabeçalhos):
| Cenário | §Host§ | §X-Forwarded-For§ | §X-Real-IP§ | §X-Forwarded-Proto§ |
|---|---|---|---|---|
| **Com** §proxy_set_header§ | §localhost§ | §172.21.0.1§ | §172.21.0.1§ | §https§ |
| **Sem** (padrão) | §app_rr§ (**nome do upstream**) | **ausente** | **ausente** | **ausente** |
**Consequências:** **sem §Host§ correto**, **URLs absolutas, cookies e multi-inquilino quebram**; **sem §X-Forwarded-For§, os logs e o rate limit da aplicação veem só o IP do proxy**; **sem §X-Forwarded-Proto§**, **a aplicação não sabe que o cliente usa HTTPS** (**redirecionamentos e cookies §Secure§ falham**). **Observação do laboratório:** **o IP §172.21.0.1§ é o gateway da rede Docker** (**o mapeamento de porta do Docker** **mascara o cliente**), **não** um cliente real: **em produção** use **o IP real** (**§ngx_http_realip_module§**: §set_real_ip_from§ **só para proxies confiáveis** e §real_ip_header X-Forwarded-For§). **Nunca confie** em §X-Forwarded-For§ **vindo da internet** sem **a lista de proxies confiáveis**: **é falsificável**.
**Cabeçalhos do cliente repassados:** **§X-Forwarded-For§ acumula** (§$proxy_add_x_forwarded_for§) **a cadeia**; **a aplicação deve ler o primeiro valor confiável**, **não o primeiro da lista bruta**.

### Compressão (medido)
§gzip on; gzip_min_length 1024; gzip_types application/json;§ — **um JSON repetitivo de §/grande§** passou de **20.320 bytes para 1.565 bytes** transferidos (**−92%**). **Cuidados:** **só comprima texto** (**JSON, HTML, CSS, JS, SVG**); **imagens e vídeos já são comprimidos**; **comprimir respostas com segredos misturados a dados do atacante** pode abrir **ataques de compressão (BREACH)**: **atenção em respostas que refletem entrada**; **consome CPU** (**nível 4–6** costuma bastar).

### Timeouts, buffers e conexões
- §proxy_connect_timeout§ (**tempo para conectar ao upstream**): **1 s no laboratório**; **padrão 60 s** é **longo demais** para **detectar falhas**.
- §proxy_read_timeout§ / §proxy_send_timeout§ (**60 s** por padrão): **entre leituras/escritas, não o total**; **ajuste para endpoints lentos** **sem** afrouxar tudo.
- §proxy_buffering§ (**ligado**): **lê a resposta do upstream e entrega ao cliente lento**, **liberando a aplicação**; **desligue** para **streaming** (SSE).
- **Conexões persistentes ao upstream:** §upstream { keepalive 32; }§ + §proxy_http_version 1.1;§ + §proxy_set_header Connection "";§ **reduzem o custo de conexões**.
- **WebSocket:** §proxy_http_version 1.1;§ + §Upgrade§ e §Connection "upgrade"§.
- §client_max_body_size§ (**1 MB por padrão**): **uploads maiores retornam 413**.

### Operação segura
- **Valide antes:** §nginx -t§ (**no laboratório: "syntax is ok / test is successful"**). **Aplique:** §nginx -s reload§ (**graciosa**). **Se a configuração é inválida, o reload falha e a antiga continua** (**aprendido na aula de blue-green**): **confira o efeito**.
- **Logs:** §access_log§ e §error_log§ (**no contêiner, para stdout/stderr**); **inclua** §$request_time§ e §$upstream_response_time§ **para diagnosticar lentidão**.
- **Endurecimento:** §server_tokens off;§ (**oculta a versão**), **cabeçalhos de segurança** (**§X-Content-Type-Options§, §Content-Security-Policy§, HSTS (aula 2)**), **limites de tamanho e taxa** (aula 3), **não exponha §stub_status§** ao público.
- **Arquivos estáticos:** §root§/§try_files§, **cache do navegador** (§expires§/§Cache-Control§), **arquivos com hash no nome** **com cache longo**.

### Executado e não executado
**Executado:** **proxy com e sem cabeçalhos**, **gzip**, **§nginx -t§**. **Não executado:** **cache de proxy** (§proxy_cache§), **WebSocket**, **realip com cadeia de proxies**, **Ingress Controller**, **tráfego real**.`,
  concepts: [
    { term: 'Proxy reverso', def: 'Servidor que recebe as requisições em nome da aplicação e as encaminha, ocultando e protegendo os servidores internos.' },
    { term: 'location', def: 'Bloco do nginx que define o tratamento de requisições cujo caminho casa com um prefixo ou expressão.' },
    { term: 'proxy_pass', def: 'Diretiva que encaminha a requisição a um servidor ou grupo upstream; um URI após o endereço substitui o prefixo casado.' },
    { term: 'X-Forwarded-For', def: 'Cabeçalho que acumula os endereços IP pelos quais a requisição passou; é falsificável se vier de fonte não confiável.' },
    { term: 'X-Forwarded-Proto', def: 'Cabeçalho que informa o protocolo original do cliente (http ou https) à aplicação.' },
    { term: 'Reload gracioso', def: 'Recarga de configuração em que novos workers assumem e os antigos terminam as conexões em andamento.' },
    { term: 'gzip', def: 'Compressão de respostas de texto que reduz bytes transferidos ao custo de CPU.' },
    { term: 'Keepalive (upstream)', def: 'Reutilização de conexões entre o proxy e a aplicação para reduzir o custo de abrir novas.' }
  ],
  examples: R`**Analogia:** o nginx é **a recepção de um prédio comercial**: **recebe os visitantes**, **confere a identidade** (TLS), **anota quem entrou e de onde veio** (cabeçalhos), **encaminha ao andar certo** (location/proxy_pass) e **evita que estranhos andem pelos corredores** (a aplicação em rede privada). **Sem o crachá do visitante** (X-Forwarded-For), **o escritório só sabe que "a recepção ligou"**.

**Exemplo concreto (medido):** **a mesma aplicação**, **atrás do mesmo nginx**, **respondeu §Host: localhost§ e cabeçalhos de encaminhamento** no caminho §/§ e **§Host: app_rr§ sem nenhum cabeçalho** em §/sem-cabecalhos/§; **e um JSON de 20.320 bytes** chegou ao cliente com **1.565 bytes** graças ao gzip.`,
  code: [
    { title: 'Proxy reverso com cabeçalhos corretos (laboratório, nginx 1.31.10)', lang: 'nginx', code: R`upstream app_rr {
  server lab-ngx-app1:3000;
  server lab-ngx-app2:3000;
  server lab-ngx-app3:3000;
}
gzip on; gzip_min_length 1024; gzip_types application/json;

server {
  listen 443 ssl;
  server_name localhost;
  proxy_connect_timeout 1s;

  location / {
    proxy_pass http://app_rr;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  location /sem-cabecalhos/ { proxy_pass http://app_rr/; }  # a barra troca o prefixo
}`, notes: [{ l: 6, t: 'Medido: 20.320 bytes viram 1.565 bytes.' }, { l: 11, t: 'O padrão (60 s) demora a detectar um servidor fora do ar.' }, { l: 14, t: 'Sem este cabeçalho a aplicação vê o nome do upstream.' }, { l: 19, t: 'Com URI no proxy_pass, /sem-cabecalhos/x vira /x.' }] },
    { title: 'Conferindo o que a aplicação recebe', lang: 'bash', code: R`curl -s --cacert certs/cert.pem https://localhost:38443/
# {"instancia":"app1","host":"localhost","xff":"172.21.0.1",...,"xproto":"https"}
curl -s --cacert certs/cert.pem https://localhost:38443/sem-cabecalhos/
# {"instancia":"app1","host":"app_rr","xff":null,...}
docker exec lab-ngx-front nginx -t`, notes: [{ l: 2, t: 'IP é o gateway da rede Docker, não o cliente real.' }, { l: 4, t: 'Sem proxy_set_header, o Host vira o nome do upstream.' }] }
  ],
  bestPractices: ['Repasse Host, X-Real-IP, X-Forwarded-For e X-Forwarded-Proto e teste o que a aplicação recebe.', 'Valide com nginx -t, aplique com reload e confira o efeito.', 'Use timeouts de conexão curtos e keepalive para o upstream.', 'Comprima apenas texto e atente para segredos refletidos (BREACH).', 'Configure o realip só com proxies confiáveis e nunca confie em X-Forwarded-For da internet.', 'Prefira locations por prefixo e evite regex desnecessário.', 'Oculte a versão (server_tokens off) e não exponha o stub_status.'],
  mistakes: ['Esquecer o proxy_set_header Host e quebrar URLs e cookies.', 'Barra sobrando ou faltando no proxy_pass e caminho errado na aplicação.', 'Confiar em X-Forwarded-For sem lista de proxies confiáveis.', 'Aplicar reload sem nginx -t e sem conferir.', 'Deixar o proxy_connect_timeout padrão de 60 s.', 'Comprimir imagens ou usar nível de gzip excessivo.'],
  market: R`**Configurar nginx como proxy reverso** é **tarefa diária** de **DevOps e backend**; **diagnosticar "a aplicação não vê o IP/host certo"** é **pergunta clássica** de **entrevistas**.`,
  summary: R`Um proxy reverso recebe requisições em nome da aplicação, centralizando TLS, compressão, limites e logs. No nginx, location escolhe o tratamento e proxy_pass encaminha, com a barra final substituindo o prefixo casado. Medido (nginx 1.31.10): com proxy_set_header a aplicação viu Host localhost, X-Forwarded-For e X-Real-IP 172.21.0.1 (gateway Docker) e proto https; sem eles viu Host app_rr e nenhum cabeçalho. O gzip reduziu um JSON de 20.320 para 1.565 bytes. Opera-se com nginx -t, reload gracioso, timeouts curtos e endurecimento. Cache de proxy, WebSocket e realip com cadeia de proxies não foram executados.`,
  refs: [REF.nginxBeginners, REF.nginxProxy, REF.nginxLocation, REF.nginxGzip, REF.nginxRealip],
  cards: [
    { q: 'O que o nginx envia como Host ao upstream por padrão?', a: 'O nome do upstream ($proxy_host); no laboratório a aplicação viu app_rr. Use proxy_set_header Host $host.' },
    { q: 'O que a barra final no proxy_pass faz?', a: 'Com URI no proxy_pass, o prefixo casado da location é substituído (/lc/lento vira /lento); sem URI o caminho original é repassado.' },
    { q: 'Por que o X-Forwarded-For medido era 172.21.0.1?', a: 'É o gateway da rede Docker (mascara o cliente pelo mapeamento de porta); em produção use o realip com proxies confiáveis.' },
    { q: 'O que acontece se o reload tem configuração inválida?', a: 'O reload falha e o nginx mantém a configuração antiga; valide com nginx -t e confira o efeito.' }
  ]
},
{
  id: 'ngx-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['TLS', 'HTTPS', 'certificado', 'SAN', 'HSTS', 'HTTP/2', 'Let’s Encrypt', 'openssl', 'redirecionamento'],
  title: 'TLS e HTTPS no nginx: certificados, protocolos, HSTS e HTTP/2, verificados com openssl e curl',
  objectives: ['Explicar o que o TLS garante (confidencialidade, integridade, autenticação) e como a cadeia de certificados funciona', 'Gerar um certificado de teste com SAN e configurar HTTPS, redirecionamento, HSTS e HTTP/2 no nginx', 'Verificar o resultado com curl e openssl s_client e interpretar os códigos de saída', 'Planejar certificados reais (ACME, renovação) e reconhecer os riscos de HSTS e de chaves privadas'],
  intro: R`Sem **TLS**, **senhas e cookies** **trafegam em texto claro**. O **HTTPS** é **hoje o mínimo**, e **errar a configuração** (**certificado sem o nome certo**, **protocolo antigo**, **HSTS mal usado**) **derruba o site ou o expõe**. Aqui você **gera um certificado**, **configura o nginx** e **verifica com ferramentas**: **TLS 1.2 e 1.3**, **HTTP/2**, **redirecionamento 301**, **HSTS** e **a falha de confiança** (**exit 60**).`,
  theory: R`### O que o TLS garante
- **Confidencialidade:** **criptografia** do tráfego;
- **Integridade:** **detecta alteração**;
- **Autenticação do servidor:** **o certificado prova** que **a chave pertence ao nome** acessado, **assinado por uma CA em que o cliente confia**.
**Não garante:** **que o site seja honesto**, **proteção da aplicação** (injeção, XSS) **nem anonimato**.

### Certificados e cadeia de confiança
**Certificado X.509:** **nome(s)** (**SAN**: *Subject Alternative Name*), **chave pública**, **validade**, **emissor** e **assinatura**. **Os navegadores validam o SAN** (**o CN legado é ignorado**). **Cadeia:** **folha** (**seu servidor**) → **intermediária(s)** → **raiz** (**no repositório de confiança do cliente**); **o servidor deve enviar a folha + intermediárias** (§ssl_certificate§ com **fullchain**). **Autoassinado:** **emissor = o próprio certificado**: **ninguém confia por padrão** (**ótimo para laboratório**, **errado para produção pública**).
**No laboratório** (§openssl 3.5.5§):
§§§
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem \
  -days 30 -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
§§§
**Resultado:** §subject=CN=localhost§, **SAN §DNS:localhost, IP Address:127.0.0.1§**, **validade de 30 dias**. **Dados de teste:** **a chave foi gerada na hora e apagada ao final**; **nunca versione chaves privadas**.

### A configuração HTTPS do laboratório
- §listen 443 ssl; http2 on;§ (**a diretiva §http2 on§** **substitui** o antigo §listen ... http2§);
- §ssl_certificate§ / §ssl_certificate_key§;
- §ssl_protocols TLSv1.2 TLSv1.3;§ (**exclua TLS 1.0/1.1 e SSL**);
- §add_header Strict-Transport-Security "max-age=31536000" always;§ (**HSTS**);
- **servidor HTTP na porta 80** **apenas com** §return 301 https://localhost:38443$request_uri;§ (**o caminho e a consulta são preservados**).
**Recomendação:** **gere a configuração** pelo **Mozilla SSL Configuration Generator** (**perfis "intermediate" e "modern"**) **e revise-a quando os perfis mudarem**.

### Verificação (medida)
| Verificação | Resultado |
|---|---|
| §curl --cacert cert.pem https://localhost:38443/§ | **200**, **HTTP/2**, §ssl_verify_result=0§ |
| §curl https://localhost:38443/§ (**sem confiar no certificado**) | **exit 60** (**certificado não verificado**) |
| §curl http://127.0.0.1:38090/caminho?x=1§ | **301** com §Location: https://localhost:38443/caminho?x=1§ |
| **Cabeçalho** | §strict-transport-security: max-age=31536000§ |
| §openssl s_client -tls1_2§ | **TLSv1.2**, **ECDHE-RSA-AES256-GCM-SHA384** |
| §openssl s_client -tls1_3§ | **TLSv1.3**, **TLS_AES_256_GCM_SHA384** |
**Interpretação do exit 60:** **o canal estaria criptografado, mas o cliente não pode saber com quem fala**: **é exatamente o que o certificado autoassinado produz**. **Nunca "resolva" com §curl -k§ em produção** (**desliga a verificação**).
**TLS 1.3 x 1.2:** **1.3 tem *handshake* mais curto (1 ida e volta)**, **só cifras modernas (AEAD)** e **sigilo futuro obrigatório**; **1.2 ainda é necessário para clientes antigos**.

### HSTS: poderoso e perigoso
O cabeçalho §Strict-Transport-Security§ **instrui o navegador** a **usar HTTPS por §max-age§ segundos**, **recusando exceções de certificado**. **Cuidados:** (1) **comece com §max-age§ curto** (**minutos/dias**) **e aumente**; (2) **§includeSubDomains§ afeta todos os subdomínios** (**um subdomínio só com HTTP quebra**); (3) **§preload§ é praticamente irreversível**; (4) **em §localhost§ com certificado autoassinado**, **um HSTS longo** **trava o navegador** (**sem botão de exceção**) — **no laboratório usamos curl**, **não navegador**.

### HTTP/2 e HTTP/3
**HTTP/2** (**medido: §versão_http=2§**): **multiplexação** de **requisições** em **uma conexão**, **compressão de cabeçalhos**; **exige TLS na prática**. **HTTP/3** (**QUIC sobre UDP**): **o nginx da imagem foi compilado com §http_v3_module§**, **mas não foi configurado nem testado**.

### Certificados reais: ACME e renovação (análise, não executada)
**Let's Encrypt** emite **certificados gratuitos de 90 dias** pelo **protocolo ACME**; **clientes** (**certbot**, **acme.sh**, **Caddy**, **cert-manager** no Kubernetes) **provam o controle do domínio** (**desafio HTTP-01** em §/.well-known/acme-challenge/§ **ou DNS-01**, **este permite curingas**) **e renovam automaticamente** (**cerca de 30 dias antes do vencimento**). **Operação:** **monitore a validade** (**alerta com 14–21 dias**), **teste a renovação em ambiente de teste** (**limites de taxa**) **e recarregue o nginx** (§nginx -s reload§) **após cada renovação**. **Serviços de nuvem** (**ACM**, **Cloud Load Balancer**) **gerenciam isso**. **Não executado aqui:** **sem domínio público nem acesso à internet de entrada**.

### Outros itens de uma configuração madura (não executados)
- **OCSP stapling** (§ssl_stapling on§): **o servidor entrega a prova de não revogação**;
- **§ssl_session_cache§ e tempo de sessão**: **reduzem o custo de handshakes repetidos**;
- **mTLS** (§ssl_verify_client§): **o cliente também apresenta certificado** (**serviço a serviço**);
- **varredura da configuração** (**testssl.sh**, **SSL Labs**): **fora do escopo do laboratório**;
- **rotação de chaves** e **armazenamento seguro da chave privada** (§chmod 600§, **cofre/KMS**).

### Pontos de atenção
**Terminar o TLS no proxy** **deixa o tráfego interno em HTTP**: **aceitável em uma rede privada confiável**, **inadequado** quando **a rede não é confiável** (**considere TLS ou mTLS até a aplicação**). **Informe o protocolo original** (§X-Forwarded-Proto§, aula 1) **para que a aplicação gere URLs e cookies §Secure§ corretos**.`,
  concepts: [
    { term: 'TLS', def: 'Protocolo que fornece confidencialidade, integridade e autenticação do servidor para comunicações na rede.' },
    { term: 'Certificado X.509', def: 'Documento assinado que associa nomes (SAN) a uma chave pública, com validade e emissor.' },
    { term: 'SAN', def: 'Campo do certificado com os nomes (DNS e IP) para os quais ele é válido; é o que os clientes verificam.' },
    { term: 'Cadeia de certificados', def: 'Sequência folha, intermediárias e raiz usada para validar a confiança no certificado do servidor.' },
    { term: 'HSTS', def: 'Cabeçalho que instrui o navegador a usar apenas HTTPS durante um período, recusando exceções de certificado.' },
    { term: 'ACME', def: 'Protocolo de automação de emissão e renovação de certificados usado pelo Let’s Encrypt.' },
    { term: 'HTTP/2', def: 'Versão do HTTP com multiplexação em uma única conexão e compressão de cabeçalhos.' },
    { term: 'mTLS', def: 'TLS mútuo em que cliente e servidor apresentam certificados.' }
  ],
  examples: R`**Analogia:** o **certificado** é **um documento de identidade com foto, emitido por um cartório** (a CA) em que **você confia**; **autoassinado** é **uma identidade que a própria pessoa fez em casa**: **a foto pode ser verdadeira**, mas **o porteiro** (o cliente) **não tem como saber**, e **recusa** (**exit 60**). **HSTS** é **o porteiro decorar "esta empresa só atende com documento oficial por 1 ano"**: **ótimo**, **mas se o documento vencer, ninguém entra**.

**Exemplo concreto (medido):** **o mesmo endereço** respondeu **200 por HTTP/2 com §--cacert§**, **exit 60 sem confiar no certificado**, **301 para HTTPS na porta 80** e **negociou TLS 1.2 e 1.3** conforme a opção do cliente.`,
  code: [
    { title: 'Servidor HTTPS com redirecionamento e HSTS (laboratório, nginx 1.31.10)', lang: 'nginx', code: R`server {
  listen 80;
  return 301 https://localhost:38443$request_uri;
}
server {
  listen 443 ssl;
  http2 on;
  server_name localhost;
  ssl_certificate /etc/nginx/certs/cert.pem;
  ssl_certificate_key /etc/nginx/certs/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  add_header Strict-Transport-Security "max-age=31536000" always;
  location / { proxy_pass http://app_rr; }
}`, notes: [{ l: 3, t: '301 preserva caminho e consulta ($request_uri).' }, { l: 7, t: 'A diretiva http2 on substitui o parâmetro antigo do listen.' }, { l: 11, t: 'Exclui TLS 1.0 e 1.1.' }, { l: 12, t: 'Em produção comece com max-age curto.' }] },
    { title: 'Verificando com curl e openssl (resultados medidos nos comentários)', lang: 'bash', code: R`curl -s --cacert certs/cert.pem -o /dev/null -w '%{http_code} %{http_version} %{ssl_verify_result}\n' https://localhost:38443/
# 200 2 0
curl -s -o /dev/null https://localhost:38443/; echo $?
# 60  (certificado não verificado)
curl -sI http://127.0.0.1:38090/caminho?x=1 | grep -iE '^(HTTP|location)'
# HTTP/1.1 301 ... Location: https://localhost:38443/caminho?x=1
echo | openssl s_client -connect 127.0.0.1:38443 -servername localhost -tls1_3 2>/dev/null | grep -E 'Protocol|Cipher'
# TLSv1.3  TLS_AES_256_GCM_SHA384`, notes: [{ l: 2, t: 'Verificação 0 e HTTP/2.' }, { l: 4, t: 'Sem confiar no certificado, o curl recusa.' }, { l: 8, t: 'Troque -tls1_3 por -tls1_2 para ver o outro protocolo.' }] }
  ],
  bestPractices: ['Use certificados com SAN para todos os nomes e valide a cadeia completa (fullchain).', 'Restrinja os protocolos a TLS 1.2 e 1.3 e gere a configuração pelo Mozilla SSL Configuration Generator.', 'Redirecione HTTP para HTTPS com 301 preservando o caminho e a consulta.', 'Introduza o HSTS com max-age curto e aumente gradualmente; cuidado com includeSubDomains e preload.', 'Automatize a emissão e a renovação por ACME, monitore a validade e recarregue o nginx.', 'Proteja a chave privada (permissões, cofre) e nunca a versione.', 'Informe o protocolo original à aplicação por X-Forwarded-Proto.'],
  mistakes: ['Certificado sem o nome (SAN) acessado.', 'Esquecer a cadeia intermediária e quebrar clientes que não a têm.', 'Usar curl -k ou desativar a verificação para fazer funcionar.', 'HSTS com max-age enorme e includeSubDomains logo no começo.', 'Certificado vencido por falta de renovação automática e alerta.', 'Versionar a chave privada.'],
  market: R`**Configurar e depurar TLS** (**cadeia, SAN, renovação, HSTS**) é **tarefa recorrente** de **DevOps, SRE e segurança**; **"o site caiu porque o certificado venceu"** é **incidente clássico**.`,
  summary: R`O TLS fornece confidencialidade, integridade e autenticação do servidor por uma cadeia de certificados com SAN. No laboratório (nginx 1.31.10, OpenSSL 3.5.5), um certificado autoassinado de 30 dias para localhost e 127.0.0.1 permitiu HTTPS com HTTP/2 (200 com --cacert; exit 60 sem confiar), redirecionamento 301 preservando caminho e consulta, HSTS de 1 ano e negociação de TLS 1.2 (ECDHE-RSA-AES256-GCM-SHA384) e TLS 1.3 (TLS_AES_256_GCM_SHA384). HSTS exige cautela; certificados reais usam ACME com renovação monitorada. Let's Encrypt, OCSP stapling, mTLS, HTTP/3 e varreduras de cifras não foram executados.`,
  refs: [REF.nginxSsl, REF.nginxHttps, REF.nginxV2, REF.mozillaSsl, REF.rfc8446, REF.rfc6797, REF.letsencrypt, REF.opensslSclient],
  cards: [
    { q: 'O que significou o exit 60 do curl no laboratório?', a: 'O certificado autoassinado não foi verificado; o canal seria cifrado, mas o cliente não confirma com quem fala. Não use -k em produção.' },
    { q: 'Por que usar SAN?', a: 'Os clientes validam o SAN (nomes DNS e IP); o CN legado é ignorado.' },
    { q: 'Qual o risco do HSTS com max-age longo e includeSubDomains?', a: 'O navegador recusa HTTP e exceções de certificado em todos os subdomínios; um subdomínio sem HTTPS ou com certificado vencido fica inacessível.' },
    { q: 'Como se automatiza o certificado real?', a: 'Por ACME (Let’s Encrypt) com certbot, acme.sh, Caddy ou cert-manager, com renovação cerca de 30 dias antes do vencimento, monitoramento e reload do nginx.' }
  ]
}
];
