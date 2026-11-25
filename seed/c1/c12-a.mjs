// C1.2 — Redes de computadores e HTTP. Aulas 1 a 3 (camadas e IP, TCP e UDP, DNS).
const R = String.raw;

export const REF = {
  rfc791: { title: 'IETF — RFC 791: Internet Protocol', url: 'https://www.rfc-editor.org/rfc/rfc791.html', kind: 'spec' },
  rfc8200: { title: 'IETF — RFC 8200: Internet Protocol, Version 6 (IPv6) Specification', url: 'https://www.rfc-editor.org/rfc/rfc8200.html', kind: 'spec' },
  rfc4632: { title: 'IETF — RFC 4632: Classless Inter-domain Routing (CIDR)', url: 'https://www.rfc-editor.org/rfc/rfc4632.html', kind: 'spec' },
  rfc1918: { title: 'IETF — RFC 1918: Address Allocation for Private Internets', url: 'https://www.rfc-editor.org/rfc/rfc1918.html', kind: 'spec' },
  rfc9293: { title: 'IETF — RFC 9293: Transmission Control Protocol (TCP)', url: 'https://www.rfc-editor.org/rfc/rfc9293.html', kind: 'spec' },
  rfc768: { title: 'IETF — RFC 768: User Datagram Protocol', url: 'https://www.rfc-editor.org/rfc/rfc768.html', kind: 'spec' },
  rfc1035: { title: 'IETF — RFC 1035: Domain Names — Implementation and Specification', url: 'https://www.rfc-editor.org/rfc/rfc1035.html', kind: 'spec' },
  rfc1034: { title: 'IETF — RFC 1034: Domain Names — Concepts and Facilities', url: 'https://www.rfc-editor.org/rfc/rfc1034.html', kind: 'spec' },
  mdnDns: { title: 'MDN — What is a domain name?', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name', kind: 'doc' },
  mdnHowWeb: { title: 'MDN — How the web works', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works', kind: 'doc' },
  curlMan: { title: 'curl — man page (opções e variáveis de --write-out)', url: 'https://curl.se/docs/manpage.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'red-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['redes', 'tcp-ip', 'ip', 'cidr'],
  title: 'Camadas, endereços IP, portas e sub-redes',
  objectives: ['Descrever o modelo em camadas da internet (enlace, rede, transporte e aplicação) e o que cada camada resolve', 'Explicar o que são endereço IP, máscara, prefixo CIDR, gateway, NAT e porta', 'Calcular o endereço de rede, o de broadcast e o número de hosts de um bloco CIDR', 'Reconhecer os blocos privados (RFC 1918), loopback e a diferença entre IPv4 e IPv6', 'Usar ip, ping e ss para inspecionar a configuração de rede de uma máquina'],
  intro: `Toda requisição que o seu código faz, desde um §fetch§ até uma conexão com o banco de dados, atravessa várias camadas de rede antes de chegar ao destino. Você não precisa construir roteadores para trabalhar bem, mas precisa **entender o que está embaixo do seu código**: por que um serviço "não alcança" o outro, por que uma porta está bloqueada, o que significa \`10.0.3.0/24\` em uma configuração de nuvem. Esta aula monta o mapa mental que as próximas usam.`,
  theory: `### Por que camadas
Redes funcionam porque cada problema é resolvido por uma **camada** que depende apenas da de baixo e serve a de cima. O modelo prático da internet, chamado de **TCP/IP**, tem quatro camadas:

| Camada | Pergunta que responde | Exemplos |
|---|---|---|
| **Aplicação** | O que as duas pontas dizem uma à outra? | HTTP, DNS, SMTP, SSH, TLS (na fronteira) |
| **Transporte** | Como os dados chegam ao **programa** certo, e com que garantias? | TCP, UDP (portas) |
| **Rede (internet)** | Como os pacotes chegam à **máquina** certa, atravessando várias redes? | IP, ICMP (ping) |
| **Enlace** | Como os bits passam entre dois dispositivos **vizinhos**? | Ethernet, Wi-Fi |

O modelo teórico **OSI** tem sete camadas (física, enlace, rede, transporte, sessão, apresentação, aplicação) e aparece em provas e conversas ("problema de camada 7"), mas o que a internet realmente usa é o TCP/IP. Ao enviar dados, cada camada **encapsula**: a aplicação gera uma mensagem; o transporte acrescenta um cabeçalho com portas; a rede acrescenta o cabeçalho IP com origem e destino; o enlace acrescenta o seu. No destino, cada camada **desencapsula** e entrega para cima.

### Endereços IP
Um **endereço IP** identifica uma interface de rede. No **IPv4**, são 32 bits escritos em quatro números de 0 a 255 (§192.168.1.10§). No **IPv6** (RFC 8200), são 128 bits em hexadecimal (§2001:db8::1§), criado porque os endereços IPv4 se esgotaram; ambos convivem hoje.

Um endereço sempre vem com uma **máscara** (ou **prefixo**), que separa a parte da **rede** da parte do **host**. A notação **CIDR** (RFC 4632) escreve o tamanho do prefixo depois de uma barra: §192.168.1.0/24§ significa que os **24 primeiros bits** identificam a rede e os 8 restantes identificam o host. A máscara equivalente de /24 é §255.255.255.0§.

### Calculando um bloco CIDR
Seja §192.168.1.130/26§:
- O prefixo de 26 bits deixa **6 bits para hosts**: 2⁶ = 64 endereços por bloco, em saltos de 64 no último octeto (0, 64, 128, 192).
- §130§ cai no bloco que começa em §128§: **endereço de rede** §192.168.1.128§.
- O último endereço do bloco, §192.168.1.191§, é o **broadcast**.
- Hosts utilizáveis: do §.129§ ao §.190§, ou seja, 64 − 2 = **62**. A fórmula geral é 2^(32 − prefixo) − 2, descontando rede e broadcast (em /31 e /32 há convenções especiais: /31 é usado em enlaces ponto a ponto e /32 identifica um único host).

Regra prática de memória: /8 tem ~16,7 milhões de endereços; /16, 65 mil; /24, 256; /32, um.

### Blocos privados, loopback e NAT
O RFC 1918 reserva faixas **privadas**, que não são roteadas na internet pública: §10.0.0.0/8§, §172.16.0.0/12§ e §192.168.0.0/16§. Redes domésticas, empresas e **VPCs** de nuvem usam essas faixas. O **loopback** (§127.0.0.1§, nome §localhost§; em IPv6, §::1§) aponta para a própria máquina e nunca sai pela rede: é o que o seu servidor de desenvolvimento usa.

Como os endereços privados não circulam na internet, o roteador de borda faz **NAT** (*Network Address Translation*): troca o IP privado de origem pelo IP público e guarda uma tabela de correspondência (IP+porta), de modo que as respostas voltem ao dispositivo certo. Consequência prática: de fora, **não se alcança** uma máquina atrás de NAT sem uma regra de redirecionamento (*port forwarding*) ou um túnel.

### Gateway e roteamento
Para falar com um IP **na mesma rede** (mesmo prefixo), a máquina entrega diretamente. Para qualquer outro, envia o pacote ao **gateway padrão** (o roteador), que o encaminha salto a salto. A **tabela de rotas** (§ip route§) guarda essa decisão: "para 10.0.0.0/8, use este gateway; todo o resto (§default§), aquele". Cada roteador decrementa o campo **TTL** do pacote; quando chega a zero, o pacote é descartado, o que evita laços infinitos (é o que o §traceroute§ usa para descobrir o caminho).

### Portas
O IP leva o pacote até a máquina; a **porta** (número de 16 bits, 0 a 65535) leva ao **programa**. Um servidor "escuta" em uma porta; o cliente usa uma porta **efêmera** (alta, escolhida pelo sistema) como origem. Portas bem conhecidas: §80§ HTTP, §443§ HTTPS, §53§ DNS, §22§ SSH, §25§ SMTP, §5432§ PostgreSQL, §3306§ MySQL, §6379§ Redis. Uma **conexão** é identificada pela quádrupla *(IP origem, porta origem, IP destino, porta destino)*, por isso milhares de clientes falam com a porta 443 do mesmo servidor sem se confundir. Portas abaixo de 1024 exigem privilégio de administrador para escutar no Linux.

### Firewalls e segurança de rede
Um **firewall** permite ou bloqueia tráfego por origem, destino, protocolo e porta. Em nuvem, os **security groups** fazem isso por instância. Uma causa comum de "não conecta": o serviço escuta apenas em §127.0.0.1§ (só a própria máquina), em vez de §0.0.0.0§ (todas as interfaces), ou o firewall bloqueia a porta. O §ss -ltn§ mostra o endereço em que cada serviço escuta.

### Inspecionando uma máquina
§ip -br addr§ lista interfaces e endereços; §ip route§ mostra as rotas; §ping -c 3 host§ envia pacotes ICMP e mede o tempo de ida e volta (**RTT**); §ss -ltn§ lista portas em escuta. Em nossa máquina de teste, §ip -br addr§ listou a interface de loopback (§lo§) e uma interface Ethernet.`,
  concepts: [
    { term: 'Modelo TCP/IP', def: 'Modelo prático de quatro camadas da internet: enlace, rede, transporte e aplicação.' },
    { term: 'Encapsulamento', def: 'Cada camada acrescenta seu cabeçalho aos dados recebidos da camada de cima antes de enviar.' },
    { term: 'Endereço IP', def: 'Identificador de uma interface na camada de rede: 32 bits no IPv4, 128 no IPv6.' },
    { term: 'CIDR / prefixo', def: 'Notação endereço/N em que os N primeiros bits identificam a rede; /24 equivale à máscara 255.255.255.0.' },
    { term: 'Gateway padrão', def: 'Roteador para o qual a máquina envia pacotes cujo destino está fora da sua rede.' },
    { term: 'NAT', def: 'Tradução de endereços: troca IPs privados por um IP público e mantém a tabela de correspondência.' },
    { term: 'Porta', def: 'Número de 16 bits que identifica o programa de destino em uma máquina.' },
    { term: 'Loopback', def: 'Endereço (127.0.0.1 ou ::1) que aponta para a própria máquina e não sai pela rede.' },
    { term: 'TTL', def: 'Contador de saltos de um pacote IP; cai a cada roteador e, ao zerar, o pacote é descartado.' },
    { term: 'RTT', def: 'Tempo de ida e volta de um pacote entre dois pontos; medido pelo ping.' }
  ],
  examples: R`**Analogia:** a rede é o correio. O **enlace** é o carteiro que leva a carta entre duas agências vizinhas; a **rede (IP)** é o endereço completo que permite a carta atravessar várias agências até o prédio; o **transporte (porta)** é o número do apartamento; a **aplicação** é o idioma da carta. O **NAT** é a portaria de um condomínio: todos os moradores usam o mesmo endereço da rua, e o porteiro lembra quem enviou o quê para entregar as respostas.

**Cenário real — "o app não conecta no banco":** a aplicação roda em §10.0.1.15§ e o banco em §10.0.2.20§. Pergunte: (1) estão na mesma rede? §10.0.1.15/24§ e §10.0.2.20/24§ são redes **diferentes**, então depende do roteamento; (2) o banco escuta em §0.0.0.0:5432§ ou só em §127.0.0.1§? (§ss -ltn§); (3) o firewall/security group libera a porta 5432 para a origem? (4) §nc -vz 10.0.2.20 5432§ testa a conexão TCP de ponta a ponta.

**Cenário real — planejando uma VPC:** a rede §10.0.0.0/16§ tem 65.536 endereços. Dividida em quatro sub-redes /18 (16.384 endereços cada) ou em 256 sub-redes /24 (256 endereços cada). Em nuvem, alguns endereços de cada sub-rede são reservados pelo provedor; confira a documentação.`,
  code: [
    { title: 'Inspecionando a rede da máquina (executado em Linux)', lang: 'bash', code: R`ip -br addr                 # interfaces e endereços (lo = loopback)
ip route | head -3          # tabela de rotas; "default via ..." é o gateway
ss -ltn | head -5           # portas TCP em escuta e o endereço de cada uma
ping -c 2 127.0.0.1         # RTT para a própria máquina (sempre muito baixo)`, notes: [{ l: '1', t: '-br mostra uma linha por interface; lo é o loopback (127.0.0.1).' }, { l: '2', t: 'A rota "default via ..." indica o gateway padrão.' }, { l: '3', t: 'Veja se o serviço escuta em 127.0.0.1 (só local) ou em 0.0.0.0 / [::] (todas as interfaces).' }, { l: '4', t: '-c 2 envia dois pacotes ICMP e para; o tempo é o RTT.' }] },
    { title: 'Conta de CIDR no papel (192.168.1.130/26)', lang: 'text', code: R`prefixo 26  -> 32 - 26 = 6 bits de host -> 2^6 = 64 endereços por bloco
blocos no último octeto: 0, 64, 128, 192
130 está no bloco 128..191
rede      = 192.168.1.128
broadcast = 192.168.1.191
hosts     = 64 - 2 = 62  (192.168.1.129 até 192.168.1.190)`, notes: [{ l: '1', t: 'A parte de host tem 32 menos o prefixo bits.' }, { l: '3', t: 'O salto do bloco é o tamanho do bloco (64).' }, { l: '6', t: 'Descontam-se o endereço de rede e o de broadcast.' }] }
  ],
  bestPractices: ['Planeje faixas de endereços sem sobreposição entre ambientes (produção, homologação, VPN e escritórios).', 'Use faixas privadas (RFC 1918) internamente e exponha o mínimo para a internet.', 'Faça serviços internos escutarem apenas nas interfaces necessárias e libere portas com o menor escopo possível.', 'Teste conectividade em etapas: DNS, rota, porta (§nc -vz§) e aplicação (§curl§).', 'Documente sub-redes e prefixos; use ferramentas de cálculo de CIDR para conferir.', 'Prefira nomes (DNS) a IPs fixos em configurações.'],
  mistakes: ['Confundir /24 com 24 hosts (são 256 endereços, 254 utilizáveis).', 'Esquecer de descontar rede e broadcast na contagem de hosts.', 'Iniciar um servidor em §127.0.0.1§ e esperar que outras máquinas se conectem.', 'Sobrepor faixas de endereços entre redes que depois precisam se conectar por VPN ou peering.', 'Achar que o IP privado é alcançável pela internet.', 'Bloquear o ICMP inteiro e perder o diagnóstico (e a descoberta de MTU).'],
  market: `Cálculo de sub-redes, regras de firewall e o entendimento de NAT e gateway aparecem em qualquer projeto de nuvem (VPC, sub-redes, security groups), em Kubernetes e em entrevistas de backend e DevOps. Quem domina CIDR evita colisões de rede que são caríssimas de corrigir depois.`,
  summary: `A internet usa quatro camadas: enlace, rede (IP), transporte (portas) e aplicação. O IP leva o pacote à máquina; a porta, ao programa. CIDR define quantos bits identificam a rede: hosts utilizáveis = 2^(32 − prefixo) − 2. Faixas privadas (10/8, 172.16/12, 192.168/16) usam NAT para sair; §127.0.0.1§ é a própria máquina. Fora da rede local, o tráfego vai ao gateway. Diagnostique com §ip§, §ping§ e §ss§.`,
  refs: [REF.rfc791, REF.rfc4632, REF.rfc1918, REF.rfc8200, REF.mdnHowWeb],
  cards: [
    { q: 'Quantos hosts utilizáveis tem um bloco /24?', a: '254 (256 endereços menos rede e broadcast).' },
    { q: 'Qual a função da porta?', a: 'Identificar o programa de destino dentro da máquina; o IP leva até a máquina.' },
    { q: 'Quais são as faixas privadas do RFC 1918?', a: '10.0.0.0/8, 172.16.0.0/12 e 192.168.0.0/16.' },
    { q: 'O que significa um serviço escutar em 127.0.0.1?', a: 'Só aceita conexões da própria máquina; para aceitar de fora, deve escutar em 0.0.0.0 (e o firewall precisa liberar).' }
  ]
},
{
  id: 'red-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['redes', 'tcp', 'udp', 'sockets'],
  title: 'Transporte: TCP, UDP e sockets',
  objectives: ['Explicar o que o TCP garante (ordem, entrega, controle de fluxo e de congestionamento) e como estabelece e encerra uma conexão', 'Descrever o que é o UDP e quando ele é a melhor escolha', 'Relacionar sockets, portas e a quádrupla que identifica uma conexão', 'Interpretar sintomas de rede (timeout, connection refused, reset) em termos de TCP', 'Testar conexões com nc, curl e ss e medir latência'],
  intro: `O IP entrega pacotes "no melhor esforço": eles podem se perder, chegar fora de ordem ou duplicados. A camada de **transporte** decide o que fazer com isso. O **TCP** constrói, em cima do IP, um canal confiável e ordenado; o **UDP** entrega os datagramas sem garantias, mas com baixíssimo custo. Quase tudo que você usa no dia a dia (web, bancos de dados, SSH) roda sobre TCP; DNS, vídeo e jogos usam muito UDP. Entender essa diferença explica sintomas como "timeout", "connection refused" e "connection reset".`,
  theory: `### Sockets
Um **socket** é a abstração que o sistema operacional oferece ao programa para falar pela rede: um descritor de arquivo (aula 6 do curso de Linux) associado a um endereço IP e uma porta. O servidor faz §bind§ (reserva a porta), §listen§ (aceita conexões) e §accept§ (recebe uma conexão); o cliente faz §connect§. Cada conexão TCP aceita é um socket novo, identificado pela **quádrupla** (IP origem, porta origem, IP destino, porta destino).

### UDP: simples e rápido
O **UDP** (RFC 768) apenas adiciona portas e uma soma de verificação ao IP. **Não** estabelece conexão, **não** retransmite perdas, **não** garante ordem e **não** controla congestionamento. Vantagens: sem *handshake*, latência mínima, mensagens independentes (um datagrama perdido não atrasa os outros). Usos: DNS (consultas curtas), VoIP e vídeo ao vivo (melhor perder um quadro que esperá-lo), jogos, descoberta de serviços na rede local e, hoje, o **QUIC**, que constrói confiabilidade por cima do UDP (aula 7).

### TCP: o canal confiável
O **TCP** (RFC 9293) entrega um **fluxo de bytes** confiável e ordenado. Para isso:

**1. Conexão: o aperto de mãos em três vias (*three-way handshake*).**
1. O cliente envia **SYN** (quero conectar; meu número de sequência inicial é X).
2. O servidor responde **SYN-ACK** (aceito; o meu é Y; recebi X).
3. O cliente envia **ACK** (recebi Y). A conexão está estabelecida.

Isso custa **1 RTT** antes de qualquer dado, o que é um dos motivos de HTTPS e HTTP/3 se esforçarem para reduzir viagens.

**2. Confiabilidade.** Cada byte tem um **número de sequência**; o receptor confirma (**ACK**) o que recebeu. Se uma confirmação não chega a tempo, o remetente **retransmite**. O receptor reordena segmentos que chegaram fora de ordem e descarta duplicados, entregando à aplicação um fluxo contíguo.

**3. Controle de fluxo.** O receptor anuncia uma **janela** (quanto espaço livre tem no buffer). O remetente não pode enviar mais que isso sem ACK, evitando afogar um receptor lento.

**4. Controle de congestionamento.** O remetente começa devagar (*slow start*) e aumenta o ritmo até detectar perdas, quando reduz. Assim a rede compartilhada não colapsa. Por isso uma conexão nova é lenta no início e conexões longas e reutilizadas rendem melhor.

**5. Encerramento.** Cada lado envia **FIN** e recebe ACK; depois a conexão fica um tempo no estado §TIME_WAIT§ (para absorver pacotes atrasados). Um **RST** (reset) encerra abruptamente, quando, por exemplo, não há ninguém escutando.

### Garantias e limites
TCP é um **fluxo de bytes**, não de mensagens: se a aplicação envia 3 escritas, o receptor pode ler tudo de uma vez ou em pedaços diferentes. Por isso os protocolos de aplicação definem **delimitação** (HTTP usa linhas e §Content-Length§). Outro limite é o ***head-of-line blocking*** (bloqueio de cabeça de fila): se um segmento se perde, **todos os bytes seguintes** esperam a retransmissão, mesmo que já tenham chegado. Isso motivou o QUIC.

### Sintomas e o que significam
| Sintoma | Causa provável |
|---|---|
| **Connection refused** | O IP respondeu com RST: a máquina está viva, mas **ninguém escuta** nessa porta (serviço parado ou porta errada) |
| **Timeout** | Nenhuma resposta: firewall descartando pacotes (DROP), rota errada, máquina fora do ar ou serviço sobrecarregado |
| **Connection reset by peer** | O outro lado fechou abruptamente (RST): processo caiu, proxy fechou a conexão, limite excedido |
| **Muitas conexões em TIME_WAIT** | Muitas conexões curtas; considere reutilizar conexões (*keep-alive*, *pool*) |

### Latência e largura de banda
**Latência** é o tempo de ida e volta (RTT); **largura de banda** é o volume por segundo. Para páginas e APIs com muitas requisições pequenas, a **latência** domina: dez viagens de 100 ms são um segundo, não importa a banda. Isso explica por que **reutilizar conexões**, reduzir viagens e usar CDNs (que ficam perto do usuário) melhoram tanto o desempenho percebido.

### Ferramentas
- §nc -vz host porta§ tenta abrir uma conexão TCP e informa sucesso ou falha (*connection refused* ou *timed out*).
- §curl -sv http://host:porta/§ mostra a conexão e a conversa HTTP.
- §ss -tn§ lista conexões TCP e seus estados (§ESTAB§, §TIME-WAIT§); §ss -ltn§ lista só as portas em escuta.
- §ping§ mede RTT via ICMP (pode ser bloqueado); §curl -w§ mede tempos reais de conexão (aula 7).

### Escolhendo
Use **TCP** quando precisa de confiabilidade e ordem (web, bancos, arquivos). Use **UDP** quando prefere tempo real a confiabilidade perfeita, quando as mensagens são curtas e independentes, ou quando o protocolo de cima implementa suas próprias garantias (QUIC).`,
  concepts: [
    { term: 'Socket', def: 'Abstração do sistema operacional para comunicação em rede, ligada a um IP e uma porta.' },
    { term: 'Three-way handshake', def: 'Estabelecimento do TCP em três mensagens: SYN, SYN-ACK e ACK.' },
    { term: 'ACK e retransmissão', def: 'Confirmação de recebimento; se faltar, o remetente reenvia o dado.' },
    { term: 'Janela (controle de fluxo)', def: 'Quantidade de dados que o receptor aceita sem confirmar; evita sobrecarga do receptor.' },
    { term: 'Controle de congestionamento', def: 'Algoritmos que ajustam o ritmo de envio para não saturar a rede (slow start, redução em perdas).' },
    { term: 'UDP', def: 'Protocolo de datagramas sem conexão nem garantias; baixa latência.' },
    { term: 'Head-of-line blocking', def: 'Atraso de dados já recebidos porque um segmento anterior ainda não foi retransmitido.' },
    { term: 'RST', def: 'Segmento TCP que encerra a conexão abruptamente; causa de connection refused e reset.' },
    { term: 'TIME_WAIT', def: 'Estado em que a conexão aguarda antes de liberar de vez o par de portas.' }
  ],
  examples: R`**Analogia:** TCP é uma **ligação telefônica**: primeiro disca e espera o outro atender (handshake), ambos confirmam que entenderam, repetem o que não ouviram, e a conversa chega em ordem. UDP é **mandar cartões-postais**: rápido e simples, mas alguns podem se perder ou chegar embaralhados, e ninguém avisa.

**Cenário real — "connection refused" vs "timeout":** você tenta acessar §10.0.2.20:5432§. Com **refused**, a máquina respondeu: o banco não está escutando (ou escuta em outra porta). Com **timeout**, nada respondeu: provavelmente um firewall ou um *security group* está **descartando** os pacotes, ou a rota está errada. A diferença muda totalmente onde investigar. Em nosso teste local, §nc§ para uma porta sem serviço terminou imediatamente com falha, enquanto uma porta com servidor aceitou a conexão.

**Cenário real — latência:** uma tela dispara 40 requisições sequenciais a uma API com 80 ms de RTT: só de espera são 3,2 s, mesmo com uma banda enorme. A correção é reduzir viagens (agrupar chamadas, paralelizar, reutilizar conexões, usar HTTP/2).`,
  code: [
    { title: 'Aberta, fechada e o que cada resposta diz (executado em Linux)', lang: 'bash', code: R`python3 -m http.server 8765 --bind 127.0.0.1 > /dev/null 2>&1 & S=$!
sleep 1
nc -vz 127.0.0.1 8765          # Connection to 127.0.0.1 8765 port [tcp/*] succeeded!
nc -vz 127.0.0.1 8799          # falha imediata: ninguém escuta (connection refused)
ss -tn state established | head -3
kill $S`, notes: [{ l: '1', t: 'Sobe um servidor de teste somente no loopback.' }, { l: '3', t: '-z apenas testa a conexão, sem enviar dados; -v mostra o resultado.' }, { l: '4', t: 'Porta sem serviço: o sistema responde RST e a falha é imediata (connection refused), diferentemente de um timeout.' }, { l: '5', t: 'Lista conexões estabelecidas (pode estar vazia).' }] },
    { title: 'Medindo cada fase de uma conexão (executado com curl)', lang: 'bash', code: R`curl -s -o /dev/null -w "dns=%{time_namelookup}s tcp=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s\n" https://example.com`, notes: [{ l: '1', t: 'Os tempos são acumulados: tcp inclui o DNS, tls inclui o TCP. A diferença entre dois valores é o custo da fase. Os números variam a cada execução e com a rede.' }] }
  ],
  bestPractices: ['Reutilize conexões (keep-alive, pools) em vez de abrir uma por requisição.', 'Defina timeouts de conexão e de leitura em clientes; nunca espere indefinidamente.', 'Diferencie "refused" (serviço fora) de "timeout" (rede ou firewall) ao diagnosticar.', 'Use UDP só quando entender e aceitar a perda, ou quando um protocolo superior (QUIC) trata disso.', 'Monitore latência (RTT) e retransmissões, não apenas a largura de banda.', 'Nunca assuma que uma leitura TCP devolve uma mensagem inteira: delimite mensagens no protocolo.'],
  mistakes: ['Tratar "connection refused" e "timeout" como a mesma coisa.', 'Abrir uma nova conexão por requisição e pagar handshake e slow start toda vez.', 'Clientes sem timeout, que travam quando a rede falha.', 'Supor que TCP preserva as fronteiras das mensagens.', 'Escolher UDP "porque é mais rápido" sem tratar perdas e ordem.', 'Medir só a banda e ignorar a latência de uma API de muitas chamadas.'],
  market: `Timeouts mal configurados, esgotamento de conexões e latência são fontes constantes de incidentes. Entender TCP faz diferença ao configurar balanceadores, pools de conexão de bancos de dados, tempo limite de proxies e ao escolher entre HTTP/2, WebSockets e gRPC.`,
  summary: `Sockets ligam programas à rede. O UDP entrega datagramas sem garantias, com latência mínima. O TCP entrega um fluxo de bytes confiável e ordenado: handshake em três vias (SYN, SYN-ACK, ACK), números de sequência e ACKs com retransmissão, controle de fluxo (janela) e de congestionamento, e encerramento com FIN. Limites: sem fronteiras de mensagem e com bloqueio de cabeça de fila. "Refused" indica porta sem serviço; "timeout", descarte ou falta de rota.`,
  refs: [REF.rfc9293, REF.rfc768, REF.curlMan],
  cards: [
    { q: 'Quais mensagens formam o handshake do TCP?', a: 'SYN, SYN-ACK e ACK; custa 1 RTT antes de qualquer dado.' },
    { q: 'O que "connection refused" indica?', a: 'A máquina respondeu com RST: nenhum serviço escuta naquela porta.' },
    { q: 'O que é head-of-line blocking no TCP?', a: 'Dados que já chegaram aguardam a retransmissão de um segmento anterior perdido.' },
    { q: 'Quando preferir UDP?', a: 'Tempo real e mensagens curtas e independentes, em que perder um pacote é melhor que esperar (ou quando um protocolo superior cuida da confiabilidade).' }
  ]
},
{
  id: 'red-03', moduleId: 'm1', order: 3, minutes: 65, tags: ['redes', 'dns', 'dig', 'dominios'],
  title: 'DNS: nomes, registros, cache e diagnóstico',
  objectives: ['Explicar o que o DNS faz e a hierarquia raiz, TLD e servidores autoritativos', 'Descrever a diferença entre resolvedor recursivo e servidor autoritativo e o papel do cache e do TTL', 'Ler e escolher registros A, AAAA, CNAME, MX, NS, TXT e PTR', 'Diagnosticar problemas de DNS com dig e curl, incluindo propagação e cache', 'Aplicar boas práticas de TTL ao planejar mudanças de infraestrutura'],
  intro: `Pessoas usam nomes (§exemplo.com§); a rede usa endereços IP. O **DNS** (*Domain Name System*) é a "lista telefônica distribuída" da internet que traduz uns nos outros. Quase toda falha misteriosa do tipo "funcionava ontem" ou "só falha para alguns usuários" passa por DNS: cache, propagação, registro errado, TTL longo demais. Dominar o básico e saber usar o §dig§ economiza horas de investigação.`,
  theory: `### O que o DNS resolve
O DNS é um banco de dados **hierárquico e distribuído** (RFC 1034 e 1035) que mapeia **nomes** a **registros** (endereços IP, servidores de e-mail, textos de verificação...). Um nome completo, como §api.exemplo.com.§, é lido da direita para a esquerda: a raiz (o ponto final), o **TLD** (§com§), o domínio (§exemplo§) e o subdomínio (§api§).

### Quem participa de uma consulta
- **Cliente (*stub resolver*)**: o sistema do seu computador, que pergunta a um resolvedor configurado (§/etc/resolv.conf§, DHCP, DNS do navegador).
- **Resolvedor recursivo**: serviço do provedor ou público (por exemplo, 1.1.1.1) que **faz todo o trabalho** de achar a resposta e a **guarda em cache**.
- **Servidores raiz**: sabem quem cuida de cada TLD.
- **Servidores de TLD** (§.com§, §.br§): sabem quais servidores são **autoritativos** por cada domínio.
- **Servidor autoritativo**: tem a resposta **oficial** do domínio, configurada pelo dono.

Resolução de §www.exemplo.com§, com cache vazio: o resolvedor pergunta a um servidor raiz (que indica os servidores de §.com§), depois a um servidor de §.com§ (que indica os autoritativos de §exemplo.com§) e por fim ao autoritativo, que responde com o IP. A resposta volta ao cliente e fica em cache em todos os níveis.

### Tipos de registro
| Tipo | Para que serve | Exemplo |
|---|---|---|
| **A** | nome → endereço IPv4 | §exemplo.com → 93.184.216.34§ |
| **AAAA** | nome → endereço IPv6 | §exemplo.com → 2001:db8::1§ |
| **CNAME** | nome → **outro nome** (apelido) | §www → exemplo.com§ |
| **MX** | servidores de e-mail do domínio (com prioridade) | §10 mail.exemplo.com§ |
| **NS** | servidores autoritativos do domínio | §ns1.provedor.com§ |
| **TXT** | texto livre: verificações de domínio, SPF, DKIM | §"v=spf1 ..."§ |
| **PTR** | endereço → nome (DNS **reverso**) | §1.1.1.1 → one.one.one.one§ |
| **SOA** | metadados da zona (servidor primário, serial, tempos) | |

Regras importantes: um **CNAME** não pode coexistir com outros registros no mesmo nome, e por isso **não é permitido no apex** (§exemplo.com§ sem subdomínio) segundo o padrão; provedores oferecem soluções proprietárias (ALIAS/ANAME). Um CNAME encadeia: o resolvedor segue §www → app → lb.exemplo.net → IP§.

### Cache e TTL
Cada registro vem com um **TTL** (*time to live*), em segundos: quanto tempo os resolvedores podem guardá-lo. Um TTL de 300 permite reaproveitar a resposta por 5 minutos sem consultar o autoritativo. Cache é o que torna o DNS escalável e rápido, e também o que cria a "**propagação**": ao alterar um registro, resolvedores que já têm a resposta antiga continuam servindo-a até o TTL expirar. Não há "propagação" mágica: é **expiração de cache**.

**Boas práticas de migração:** (1) **reduza o TTL** (ex.: para 60 ou 300 s) pelo menos um TTL **antes** da mudança; (2) altere o registro; (3) valide; (4) depois, volte a um TTL maior para reduzir carga e latência. Além disso, também existe o **cache negativo** (a ausência de um nome, o NXDOMAIN, também fica em cache, por um tempo definido na SOA).

### Respostas e erros
- **NOERROR** com resposta: tudo certo; **NOERROR sem registros**: o nome existe, mas não tem aquele *tipo* de registro.
- **NXDOMAIN**: o nome **não existe**.
- **SERVFAIL**: o resolvedor não conseguiu obter a resposta (servidor autoritativo fora do ar, DNSSEC inválido).
- **Timeout**: nenhuma resposta (firewall, resolvedor fora).

### Transporte e privacidade
O DNS usa **UDP na porta 53** para consultas comuns e passa para **TCP** quando a resposta é grande ou para transferências de zona. Consultas tradicionais são em texto e visíveis na rede; **DoT** (DNS sobre TLS) e **DoH** (DNS sobre HTTPS) as criptografam. **DNSSEC** adiciona assinaturas digitais para autenticar as respostas (não criptografa).

### Ferramentas
- §dig exemplo.com A§ consulta um tipo; §+short§ simplifica; §+noall +answer§ mostra só a seção de resposta; §dig @1.1.1.1 exemplo.com§ pergunta a um resolvedor específico; §dig exemplo.com NS +short§ lista os autoritativos; §dig -x 1.1.1.1 +short§ faz a consulta reversa; §dig +trace exemplo.com§ percorre a hierarquia desde a raiz.
- O §/etc/hosts§ do Linux tem **prioridade** sobre o DNS para nomes ali listados: uma fonte clássica de "no meu computador funciona". O §getent hosts nome§ mostra o que o sistema realmente resolve.
- §curl --resolve nome:443:IP§ força um IP específico para testar um servidor sem mexer no DNS.`,
  concepts: [
    { term: 'DNS', def: 'Sistema hierárquico e distribuído que traduz nomes em registros (endereços, e-mail, textos).' },
    { term: 'Resolvedor recursivo', def: 'Servidor que busca a resposta no nome do cliente e a guarda em cache (ex.: o do provedor).' },
    { term: 'Servidor autoritativo', def: 'Servidor que detém a resposta oficial para um domínio.' },
    { term: 'TTL', def: 'Tempo, em segundos, que um registro pode ficar em cache.' },
    { term: 'Registro A / AAAA', def: 'Mapeiam um nome para um endereço IPv4 ou IPv6.' },
    { term: 'CNAME', def: 'Apelido: aponta um nome para outro nome; não convive com outros registros no mesmo nome.' },
    { term: 'MX, NS, TXT, PTR', def: 'Servidores de e-mail, servidores autoritativos, texto livre (SPF, verificações) e DNS reverso.' },
    { term: 'NXDOMAIN', def: 'Resposta que informa que o nome consultado não existe.' },
    { term: 'Propagação', def: 'Expiração gradual dos caches após uma mudança de registro; depende do TTL.' },
    { term: 'DoH / DoT', def: 'DNS sobre HTTPS e sobre TLS: consultas criptografadas.' }
  ],
  examples: R`**Analogia:** perguntar o endereço de alguém a uma **cadeia de secretárias**: você pergunta à da sua empresa (resolvedor); se ela não souber, liga para a telefonista central (raiz), que a manda ao diretório da cidade (TLD), que indica a recepção do prédio (autoritativo). A secretária anota a resposta no caderno (cache) por um prazo (TTL) e, nas próximas vezes, responde sem ligar para ninguém.

**Cenário real — migrando um site para outro servidor:** o registro A de §www.exemplo.com§ tem TTL 86400 (24 h). Se você trocar o IP hoje, parte dos usuários ainda vai ao servidor antigo por até um dia. Plano correto: reduzir o TTL para 300 com 24 h de antecedência, trocar o IP, monitorar e restaurar o TTL maior depois.

**Cenário real — "só falha no escritório":** o domínio resolve para o IP novo na internet, mas, no escritório, o resolvedor interno ainda devolve o IP antigo (cache) ou existe uma entrada em §/etc/hosts§. Compare §dig exemplo.com§ (resolvedor do sistema) com §dig @1.1.1.1 exemplo.com§ (resolvedor público) e com §dig exemplo.com NS +short§ seguido de uma pergunta direta ao autoritativo.`,
  code: [
    { title: 'Consultas com dig (executadas em Linux com acesso à internet)', lang: 'bash', code: R`dig example.com A +noall +answer          # nome, TTL, classe, tipo, valor
dig example.com NS +short                  # servidores autoritativos
dig example.com MX +short                  # e-mail (pode ser "0 ." = sem e-mail)
dig -x 1.1.1.1 +short                      # DNS reverso: one.one.one.one.
curl -s -o /dev/null -w "%{remote_ip}\n" https://example.com   # IP realmente usado pelo curl`, notes: [{ l: '1', t: 'A segunda coluna da resposta é o TTL restante no cache do resolvedor, que diminui a cada consulta repetida.' }, { l: '2', t: 'Nos testes, example.com tinha servidores NS da Cloudflare; o resultado depende do domínio e muda com o tempo.' }, { l: '4', t: '-x consulta o registro PTR do endereço (aqui, o DNS público da Cloudflare).' }, { l: '5', t: 'O curl mostra o IP escolhido; útil para comparar com o que o dig devolve.' }] },
    { title: 'Resolução local e teste com IP forçado', lang: 'bash', code: R`getent hosts localhost              # resolve como o sistema (usa /etc/hosts primeiro)
dig @1.1.1.1 example.com +short     # pergunta a um resolvedor específico
curl --resolve example.com:443:104.20.23.154 -sI https://example.com | head -1   # força o IP (use um IP atual do dig)`, notes: [{ l: '1', t: 'getent segue a ordem definida em /etc/nsswitch.conf (arquivos e depois DNS).' }, { l: '2', t: '@ escolhe o servidor consultado, ignorando o resolvedor do sistema.' }, { l: '3', t: '--resolve evita alterar o DNS ou o hosts; o certificado ainda é validado para o nome.' }] }
  ],
  bestPractices: ['Reduza o TTL antes de migrar e restaure depois.', 'Use CNAME para apontar subdomínios a serviços gerenciados e A/AAAA ou ALIAS no apex.', 'Mantenha pelo menos dois servidores de nomes autoritativos independentes.', 'Compare as respostas do resolvedor local, de um público e do autoritativo para localizar caches antigos.', 'Registre SPF, DKIM e DMARC (TXT) para o e-mail do domínio.', 'Prefira nomes a IPs em configurações; trate o DNS como parte do código de infraestrutura (versionado, revisado).'],
  mistakes: ['Esperar "propagação" imediata ao mudar um registro com TTL alto.', 'Criar um CNAME no apex do domínio ou ao lado de outros registros.', 'Esquecer que o /etc/hosts sobrepõe o DNS e perder tempo investigando.', 'Testar só pelo navegador, que tem cache de DNS próprio.', 'Ignorar o registro AAAA e quebrar clientes IPv6 quando o IPv4 muda.', 'Misturar ambientes: domínio de produção apontando para um IP de homologação.'],
  market: `Mudanças de DNS estão entre as causas mais frequentes de incidentes de disponibilidade (e entre as mais difíceis de reverter por causa do cache). Times de plataforma e SRE são cobrados por planejamento de TTL e por saber diagnosticar com dig. Também é um tema recorrente em entrevistas de system design.`,
  summary: `O DNS traduz nomes em registros por uma hierarquia (raiz → TLD → autoritativo) com um resolvedor recursivo no meio, e cache em todos os níveis controlado pelo TTL. Registros comuns: A, AAAA, CNAME, MX, NS, TXT e PTR. NXDOMAIN significa "não existe"; SERVFAIL, falha ao resolver. Propagação é expiração de cache: reduza o TTL antes de mudar. Diagnostique com §dig§ (resolvedor local, público e autoritativo), considerando §/etc/hosts§.`,
  refs: [REF.rfc1034, REF.rfc1035, REF.mdnDns],
  cards: [
    { q: 'Qual a diferença entre resolvedor recursivo e servidor autoritativo?', a: 'O recursivo busca e guarda em cache respostas para os clientes; o autoritativo tem a resposta oficial do domínio.' },
    { q: 'O que é TTL?', a: 'O tempo, em segundos, durante o qual um resolvedor pode reutilizar a resposta em cache.' },
    { q: 'Por que não se coloca CNAME no apex do domínio?', a: 'Porque o CNAME não pode coexistir com outros registros (como SOA e NS) que o apex precisa ter.' },
    { q: 'Como migrar um IP com o mínimo de impacto?', a: 'Reduzir o TTL com antecedência, alterar o registro, validar e depois restaurar o TTL maior.' }
  ]
}
];
