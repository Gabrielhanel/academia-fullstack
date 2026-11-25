// C1.7 — Requisitos e modelagem de domínio. Aulas 1 a 3 (requisitos, histórias e critérios, Event Storming).
const R = String.raw;

export const REF = {
  iso25010: { title: 'ISO/IEC 25010 — Modelo de qualidade de produto (iso25000.com)', url: 'https://iso25000.com/index.php/en/iso-25000-standards/iso-25010', kind: 'doc' },
  iso29148: { title: 'ISO/IEC/IEEE 29148 — Engenharia de requisitos', url: 'https://www.iso.org/standard/72089.html', kind: 'spec' },
  cohnStories: { title: 'Mike Cohn — User Stories', url: 'https://www.mountaingoatsoftware.com/agile/user-stories', kind: 'article' },
  invest: { title: 'Bill Wake — INVEST in Good Stories, and SMART Tasks', url: 'https://xp123.com/invest-in-good-stories-and-smart-tasks/', kind: 'article' },
  givenWhenThen: { title: 'Martin Fowler — Given When Then', url: 'https://martinfowler.com/bliki/GivenWhenThen.html', kind: 'article' },
  eventStorming: { title: 'EventStorming (Alberto Brandolini)', url: 'https://www.eventstorming.com/', kind: 'doc' },
  eventStormingBook: { title: 'Brandolini — Introducing EventStorming', url: 'https://leanpub.com/introducing_eventstorming', kind: 'doc' },
  swebok: { title: 'IEEE Computer Society — SWEBOK (corpo de conhecimento de engenharia de software)', url: 'https://www.computer.org/education/bodies-of-knowledge/software-engineering', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'req-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['requisitos', 'funcionais', 'não funcionais', 'qualidade', 'ISO 25010'],
  title: 'Requisitos funcionais e não funcionais: o que o sistema faz e como deve ser',
  objectives: ['Distinguir requisitos de negócio, de usuário, funcionais, não funcionais e restrições', 'Escrever requisitos claros, verificáveis e rastreáveis, evitando ambiguidade', 'Quantificar requisitos não funcionais (desempenho, disponibilidade, segurança, usabilidade) com métricas e condições', 'Usar o modelo de qualidade ISO/IEC 25010 como lista de verificação', 'Reconhecer requisitos mal formulados e conflitos entre requisitos e decidir os trade-offs'],
  intro: `A maioria dos projetos de software que fracassam não falha por falta de código, e sim por **construir a coisa errada** ou por **não deixar claro o que significa "pronto"**. **Requisitos** são o contrato de entendimento entre quem precisa e quem constrói: dizem **o que o sistema deve fazer** (funcionais) e **como deve se comportar** (não funcionais: velocidade, segurança, disponibilidade, usabilidade). Os requisitos não funcionais são os mais esquecidos e os mais caros de corrigir depois: um sistema que faz tudo certo, mas leva 12 segundos para responder, não serve. Esta aula ensina a escrevê-los de forma **verificável**.`,
  theory: `### Níveis de requisitos
- **Requisitos de negócio**: por que o projeto existe e que resultado se espera ("reduzir em 30 % o tempo de atendimento do suporte em 6 meses");
- **Requisitos de usuário/de stakeholders**: o que as pessoas precisam conseguir fazer ("o atendente precisa ver o histórico do cliente na tela de chamado");
- **Requisitos de sistema**: o comportamento detalhado que o software deve ter (funcionais e não funcionais);
- **Restrições**: limitações impostas (usar a nuvem X, linguagem Y, prazo, orçamento, legislação como LGPD).
A rastreabilidade liga os níveis: cada requisito de sistema deve poder ser **explicado** por uma necessidade de negócio e **verificado** por um teste.

### Requisitos funcionais (RF)
Descrevem **funções**: entradas, processamento e saídas. Exemplos: "O sistema deve permitir que o cliente cancele um pedido enquanto o status for *Aguardando pagamento*"; "O sistema deve enviar um e-mail de confirmação em até 1 minuto após o pagamento aprovado". Um bom RF é **específico**, indica **condições** e o **resultado observável**.

### Requisitos não funcionais (RNF) e atributos de qualidade
Descrevem **qualidades** e **restrições** sobre como as funções são entregues. O modelo **ISO/IEC 25010** (revisão de 2023) organiza a qualidade de produto em **nove características**, boas como lista de verificação. (A edição de 2011 tinha oito: a *usabilidade* passou a ser a **capacidade de interação**, a *portabilidade* foi incorporada à **flexibilidade** e a **segurança operacional** (*safety*) é nova; o catálogo de 25010 em iso25000.com descreve o modelo atual.)
| Característica | Pergunta-chave | Exemplo mensurável |
|---|---|---|
| **Adequação funcional** | faz o que deve, corretamente e completamente? | 100 % dos cálculos de frete batem com a tabela da transportadora nos 200 casos de teste |
| **Eficiência de desempenho** | quão rápido e com quantos recursos? | 95 % das buscas respondem em até 300 ms com 500 usuários simultâneos |
| **Compatibilidade** | convive com outros sistemas? | integra com a API de pagamentos v3 e exporta CSV compatível com o Excel |
| **Capacidade de interação** (usabilidade) | é fácil de aprender, de operar e inclusivo? | 90 % dos novos usuários concluem uma compra em até 3 minutos; atende WCAG 2.2 nível AA |
| **Confiabilidade** | funciona sem falhar e se recupera? | disponibilidade de 99,9 % ao mês; recuperação em até 15 minutos |
| **Segurança** | protege os dados e controla acessos? | senhas com hash forte; acesso a dados pessoais registrado em log; sem vulnerabilidades críticas no OWASP Top 10 |
| **Manutenibilidade** | é fácil de alterar e testar? | cobertura de testes de 80 % nos módulos de regra de negócio; correções de severidade alta em até 2 dias |
| **Flexibilidade** | adapta-se, escala, instala e é substituível? | funciona nos dois últimos navegadores principais e em Android 12 ou superior; escala para 3 vezes a carga atual sem mudança de arquitetura |
| **Segurança operacional** (*safety*) | evita danos a pessoas, ao negócio ou ao ambiente? | em falha do sensor, o equipamento entra em estado seguro em até 1 segundo e emite alerta |
Atenção ao vocabulário: em português, "segurança" traduz tanto *security* (proteção contra ameaças) quanto *safety* (proteção contra danos); deixe claro qual você quer dizer. A norma também trata de **qualidade em uso** (satisfação, eficácia). Nem toda característica importa em todo projeto: **escolha as poucas que decidem o sucesso** e quantifique.

### Como escrever um requisito verificável
Um bom requisito é **necessário, claro, consistente, completo, único, viável e verificável**. Técnicas:
- **Quantifique**: troque "rápido" por "p95 ≤ 300 ms" e "muitos usuários" por "2 000 usuários simultâneos";
- **Defina as condições de medição**: ambiente, carga, dados, rede ("em 4G, em um aparelho de 2022 com 4 GB de memória");
- **Use "deve" para obrigatório**, "deveria" para desejável, "pode" para opcional (padronize);
- **Um requisito, uma ideia**: se tiver "e" ligando duas funções, divida;
- **Evite palavras vagas**: "amigável", "robusto", "eficiente", "flexível", "etc.", "adequado", "rápido";
- **Voz ativa e sujeito claro**: "O sistema deve..." ou "O atendente deve conseguir...";
- **Identificador estável** (RF-012, RNF-004) e **origem** (quem pediu), **prioridade** e **critério de aceitação**.
Exemplo ruim: "O sistema deve ser rápido e seguro." Exemplo bom: "RNF-004: O sistema deve responder a 95 % das requisições da API de busca em até 300 ms, com 500 usuários simultâneos, em ambiente equivalente ao de produção (verificado por teste de carga em cada release)."

### Requisitos que quase todo sistema esquece
Autenticação e autorização, auditoria e logs, proteção de dados pessoais (LGPD), backup e recuperação, **acessibilidade**, internacionalização (idioma, fuso, moeda), limites e quotas, comportamento offline ou degradado, observabilidade, migração de dados, retenção e exclusão de dados e **custos operacionais**.

### Conflitos e trade-offs
Requisitos competem: **segurança** x **usabilidade** (autenticação em dois fatores), **desempenho** x **custo**, **flexibilidade** x **simplicidade**, **tempo de entrega** x **qualidade**. Registre o **trade-off decidido** (idealmente em um ADR) e **quem decidiu**: sem isso, o conflito volta a cada reunião.

### Dos requisitos ao teste
Todo requisito deve ser **testável**: RF por testes funcionais e de aceitação (próximas aulas); RNF por testes de **carga**, **segurança**, **acessibilidade**, **usabilidade** e **monitoramento em produção** (SLOs). Se você não sabe como verificar, o requisito ainda não está pronto.

### Mudança de requisitos
Mudam sempre. Em vez de fingir que não, **gerencie**: versione os requisitos, registre o motivo e o impacto de cada mudança, priorize e comunique. Em métodos ágeis, o backlog é o registro vivo dos requisitos.

### Armadilhas
- Descrever **solução** em vez de **necessidade** ("usar um banco NoSQL" em vez de "suportar 10 mil gravações por segundo");
- Requisitos vagos que cada pessoa entende de um jeito;
- RNF "tratados no fim" ou ignorados;
- **Requisitos-fantasma**: expectativas implícitas que ninguém escreveu;
- Misturar prioridade com ordem de escrita.`,
  concepts: [
    { term: 'Requisito', def: 'Condição ou capacidade que o sistema deve satisfazer para atender a uma necessidade.' },
    { term: 'Requisito funcional', def: 'Descreve o que o sistema deve fazer: funções, entradas, processamento e saídas.' },
    { term: 'Requisito não funcional', def: 'Descreve uma qualidade ou restrição sobre como o sistema opera (desempenho, segurança, usabilidade).' },
    { term: 'Restrição', def: 'Limitação imposta ao projeto ou à solução, como legislação, tecnologia, prazo ou orçamento.' },
    { term: 'ISO/IEC 25010', def: 'Modelo de qualidade de produto de software; a revisão de 2023 tem nove características (a de 2011 tinha oito).' },
    { term: 'Rastreabilidade', def: 'Capacidade de ligar um requisito à sua origem e aos artefatos que o implementam e verificam.' },
    { term: 'Requisito verificável', def: 'Requisito escrito de modo que se possa provar objetivamente se foi atendido.' },
    { term: 'SLO', def: 'Service Level Objective: meta mensurável de qualidade do serviço, como disponibilidade ou latência.' },
    { term: 'Trade-off', def: 'Escolha entre qualidades que competem, em que ganhar em uma implica perder em outra.' },
    { term: 'Requisito-fantasma', def: 'Expectativa implícita que ninguém registrou, mas que será cobrada na entrega.' }
  ],
  examples: R`**Analogia:** requisitos são o **pedido detalhado em uma obra**: "uma casa" (vago) não é o mesmo que "3 quartos, uma suíte, 120 m², estrutura que suporte mais um andar, acessível para cadeira de rodas, entrega em 8 meses, custo máximo R$ 600 mil". Os **funcionais** são os cômodos e as instalações; os **não funcionais** são a resistência da estrutura, o conforto térmico e a acessibilidade, que **ninguém vê** até faltarem.

**Exemplo: loja virtual (trecho de uma especificação):**
§§§
RF-021  O cliente deve poder cancelar um pedido enquanto o status for "Aguardando pagamento" ou "Em separação".
RF-022  Ao cancelar um pedido pago, o sistema deve iniciar o estorno em até 1 hora.
RNF-004 95 % das buscas por produto devem responder em até 300 ms com 500 usuários simultâneos (teste de carga por release).
RNF-009 O sistema deve ter disponibilidade mensal de 99,9 % (medida pelo monitoramento externo, excluindo manutenção programada).
RNF-013 As telas de compra devem atender ao WCAG 2.2 nível AA (verificação automatizada e revisão manual).
RNF-017 Dados pessoais devem ser excluídos em até 30 dias após o pedido formal de exclusão do titular (LGPD).
§§§

**Reescrevendo requisitos ruins:**
- "O sistema deve ser fácil de usar." → "90 % de um grupo de 10 pessoas novas conseguem concluir a primeira compra em até 3 minutos, sem ajuda, em teste de usabilidade."
- "O site deve ser seguro." → "Todas as comunicações usam TLS 1.2 ou superior; senhas são armazenadas com hash e sal (Argon2id ou equivalente); testes de segurança não podem apontar vulnerabilidades críticas antes de cada release."
- "Suportar muitos usuários." → "Suportar 2 000 usuários simultâneos com p95 ≤ 500 ms nas páginas de listagem."

**Caso real:** a primeira versão de um aplicativo de agendamento "funcionava", mas travava toda sexta-feira às 17h, quando 3 000 pessoas marcavam horário. Ninguém tinha escrito o requisito de carga. Depois do incidente, a equipe passou a registrar para cada funcionalidade o pico esperado e a testá-lo antes do lançamento.`,
  code: [
    { title: 'Lista de verificação de requisitos escrita como código (padrão em JavaScript; a lógica é treinada no exercício da aula)', lang: 'javascript', code: R`const VAGAS = ['rápido', 'rápida', 'fácil', 'amigável', 'robusto', 'flexível', 'eficiente', 'seguro', 'adequado', 'etc'];

function revisarRequisito(texto) {
  const problemas = [];
  const t = texto.toLowerCase();
  const vagas = VAGAS.filter((p) => new RegExp('\\b' + p + '\\b', 'i').test(t));
  if (vagas.length) problemas.push('termos vagos: ' + vagas.join(', '));
  if (!/\b(deve|devem)\b/.test(t)) problemas.push('sem "deve"');
  if (/\be\b.*\b(deve|devem)\b|\bdeve\b.*\be\b.*\bdeve\b/.test(t)) problemas.push('possível mais de uma ideia');
  if (!/\d/.test(t)) problemas.push('sem número ou limite verificável');
  return problemas;
}
console.log(revisarRequisito('O sistema deve ser rápido e seguro.'));
console.log(revisarRequisito('O sistema deve responder a 95 % das buscas em até 300 ms com 500 usuários simultâneos.'));`, notes: [{ l: '1', t: 'Lista curta de palavras vagas em português; em projetos reais, mantenha uma lista da própria equipe.' }, { l: '12', t: 'A primeira chamada acusa termos vagos e a falta de número; a segunda não aponta problemas.' }, { l: '16', t: 'É uma heurística para triagem: não substitui a leitura por pessoas.' }] }
  ],
  bestPractices: ['Escreva requisitos como necessidades verificáveis, não como soluções técnicas.', 'Quantifique os não funcionais com métrica, limite, carga e ambiente de medição.', 'Use identificadores, origem, prioridade e critério de aceitação para cada requisito.', 'Use a ISO/IEC 25010 como lista de verificação e escolha as características que decidem o projeto.', 'Registre os trade-offs decididos e quem os decidiu.', 'Trate a mudança de requisitos como parte do processo: versione e comunique o impacto.'],
  mistakes: ['Palavras vagas ("rápido", "amigável") sem número.', 'Esquecer os requisitos não funcionais até o fim do projeto.', 'Descrever a solução em vez da necessidade.', 'Requisitos com várias ideias misturadas em uma frase.', 'Não registrar quem pediu e por quê.', 'Ignorar conflitos entre requisitos e deixar cada pessoa decidir sozinha.'],
  market: `Requisitos mal definidos estão entre as causas mais citadas de retrabalho e estouro de prazo em projetos de software. Analistas de requisitos, de negócio, de produto e engenheiros de qualidade usam essas técnicas diariamente, e arquitetos dependem de RNF mensuráveis para tomar decisões (banco, cache, redundância). Saber quantificar um RNF é um diferencial em entrevistas de arquitetura e produto.`,
  summary: `Requisitos funcionais dizem o que o sistema faz; os não funcionais, como ele se comporta (ISO/IEC 25010, revisão de 2023: adequação funcional, eficiência de desempenho, compatibilidade, capacidade de interação, confiabilidade, segurança, manutenibilidade, flexibilidade e segurança operacional). Escreva-os verificáveis: específicos, quantificados, com condições de medição, um por vez e rastreáveis. Registre trade-offs, trate mudanças e traduza cada requisito em teste.`,
  refs: [REF.iso25010, REF.iso29148, REF.swebok],
  cards: [
    { q: 'Qual a diferença entre requisito funcional e não funcional?', a: 'O funcional descreve o que o sistema faz; o não funcional descreve uma qualidade ou restrição sobre como ele opera (desempenho, segurança, usabilidade).' },
    { q: 'Como tornar "o sistema deve ser rápido" verificável?', a: 'Quantificando com métrica, limite, carga e ambiente: "p95 ≤ 300 ms com 500 usuários simultâneos".' },
    { q: 'Para que serve a ISO/IEC 25010?', a: 'Como lista de características de qualidade (nove, na revisão de 2023) para não esquecer requisitos não funcionais.' },
    { q: 'O que é rastreabilidade de requisitos?', a: 'A ligação entre cada requisito, sua origem (necessidade) e os testes e artefatos que o implementam e verificam.' }
  ]
},
{
  id: 'req-02', moduleId: 'm1', order: 2, minutes: 60, tags: ['histórias de usuário', 'INVEST', 'critérios de aceitação', 'Given-When-Then', 'divisão'],
  title: 'Histórias de usuário e critérios de aceitação',
  objectives: ['Escrever histórias de usuário no formato "Como..., quero..., para..." com foco em valor', 'Aplicar o checklist INVEST para avaliar a qualidade de uma história', 'Escrever critérios de aceitação verificáveis (lista de regras e formato Dado-Quando-Então)', 'Dividir histórias grandes verticalmente, preservando valor de ponta a ponta', 'Diferenciar história, tarefa, épico, critério de aceitação e Definição de Pronto'],
  intro: `Uma **história de usuário** é uma descrição curta de uma necessidade **do ponto de vista de quem a tem**, usada como **lembrete para uma conversa**, e não como especificação completa. Mike Cohn resume com os **três C**: **Card** (o cartão curto), **Conversation** (a conversa que detalha) e **Confirmation** (os critérios de aceitação que confirmam). Uma história boa cabe em uma Sprint, entrega valor visível e vem com exemplos que todo mundo entende da mesma forma. Esta aula mostra como escrevê-las, avaliá-las e dividi-las.`,
  theory: `### O formato
> **Como** [tipo de usuário], **quero** [capacidade], **para** [benefício].
Exemplo: "**Como** cliente da loja, **quero** acompanhar o status do meu pedido, **para** saber quando devo estar em casa para receber." A parte "**para**" é a mais importante: explica o **valor** e abre alternativas. Se o único benefício é "para ter o recurso", a história não está pensada. O formato é uma ajuda, não uma regra: o essencial é **usuário, necessidade e valor** claros.

### Os três C (Ron Jeffries)
1. **Card**: o cartão (ou item no backlog) com a frase curta, que lembra a conversa;
2. **Conversation**: a conversa entre o negócio (PO, usuários) e o time, em que se descobrem detalhes, regras, exceções e riscos;
3. **Confirmation**: os **critérios de aceitação**, que dizem como saberemos que a história está atendida.

### INVEST: uma história boa é...
| Letra | Característica | Pergunta |
|---|---|---|
| **I**ndependente | pode ser desenvolvida em qualquer ordem, sem depender de outras | dá para entregar sem esperar por outra história? |
| **N**egociável | não é um contrato; detalhes são conversados | o *como* ainda está aberto? |
| **V**aliosa | entrega valor ao usuário ou ao negócio | quem ganha o quê quando isso estiver pronto? |
| **E**stimável | o time entende o bastante para estimar | sabemos o suficiente para dar um tamanho? |
| **S**mall (pequena) | cabe em poucos dias, dentro de uma Sprint | está pequena o bastante para terminar de ponta a ponta? |
| **T**estável | existem critérios para saber se está pronta | como vamos demonstrar que funciona? |
O checklist INVEST (Bill Wake) serve para **revisar o backlog**: histórias que falham em E, S ou T precisam de refinamento.

### Critérios de aceitação
Descrevem as **condições** para a história ser considerada atendida do ponto de vista do negócio. Formatos comuns:
- **Lista de regras** (simples e rápida):
  - o cliente vê o status em uma das etapas: *Pago*, *Em separação*, *Enviado*, *Entregue*;
  - ao mudar o status, o cliente recebe um e-mail em até 5 minutos;
  - pedidos de outro cliente não podem ser vistos.
- **Dado-Quando-Então** (Given-When-Then), em cenários concretos: **Dado** o contexto inicial, **Quando** a ação ocorre, **Então** o resultado esperado:
  - **Dado** que meu pedido foi enviado há 2 dias, **Quando** abro a página "Meus pedidos", **Então** vejo o status "Enviado" e o código de rastreio.
Bons critérios são **específicos, independentes de implementação, verificáveis (passa ou falha)** e cobrem o **caminho feliz, as exceções e os limites** (valores de fronteira, listas vazias, permissões, erros).
A **Definição de Pronto** (do time) é diferente: vale para **todas** as histórias (código revisado, testes, documentação...), enquanto os critérios de aceitação são **específicos de cada história**.

### Termos próximos
- **Épico**: uma história muito grande, que precisa ser dividida (ex.: "gerenciar pedidos");
- **Tema/iniciativa**: agrupamento de épicos em torno de um objetivo;
- **Tarefa**: trabalho técnico para realizar a história (criar a tabela, escrever o endpoint). Não é entregável por si só;
- **Spike**: investigação com limite de tempo para reduzir uma incerteza;
- **Caso de uso** e **requisito tradicional**: formas mais detalhadas, ainda úteis em domínios regulados.

### Dividir histórias (fatiamento vertical)
Uma história deve atravessar **todas as camadas** (interface, regra, dados) e entregar **uma fatia fina de valor utilizável**; dividir por **camada** ("só o banco", "só a tela") cria itens que nada entregam sozinhos. Padrões de divisão (por exemplo, SPIDR):
- **S**pike: separar a investigação;
- **P**aths (caminhos): um caminho do fluxo por vez (pagar com cartão, depois com Pix);
- **I**nterfaces: primeiro um canal (web), depois outros (aplicativo);
- **D**ata (dados): um subconjunto (um tipo de produto, uma moeda);
- **R**ules (regras): a regra simples primeiro, as complexas depois (desconto fixo, depois por categoria).
Outros critérios: **operações** (CRUD: criar, depois editar, depois excluir), **casos de erro** depois do caminho feliz, **desempenho** depois da funcionalidade (com um critério claro de "bom o bastante").
Exemplo: "Como cliente, quero pagar meu pedido" → (1) pagar com cartão, caminho feliz; (2) pagamento recusado: mostrar o motivo e permitir tentar de novo; (3) pagar com Pix; (4) parcelar em 3 vezes.

### Armadilhas
- **História técnica disfarçada**: "Como desenvolvedor, quero migrar para PostgreSQL" não tem valor para o usuário; trate como tarefa/tech debt com o valor de negócio explicado.
- **Histórias que são tarefas** ("criar tabela") ou **épicos** ("gerenciar clientes").
- **Critérios que descrevem a implementação** ("usar Redis") ou **vagos** ("funcionar bem").
- **Esquecer os usuários secundários** (administrador, suporte, auditoria).
- **Escrever tudo antes da conversa**: a história é o início do diálogo, não o fim.`,
  concepts: [
    { term: 'História de usuário', def: 'Descrição curta de uma necessidade do ponto de vista do usuário, usada para iniciar uma conversa.' },
    { term: 'Os três C', def: 'Card (cartão), Conversation (conversa) e Confirmation (confirmação por critérios).' },
    { term: 'INVEST', def: 'Checklist: Independente, Negociável, Valiosa, Estimável, Pequena e Testável.' },
    { term: 'Critério de aceitação', def: 'Condição verificável que define quando uma história específica está atendida.' },
    { term: 'Given-When-Then', def: 'Formato Dado-Quando-Então para descrever cenários de comportamento.' },
    { term: 'Épico', def: 'História grande demais para uma Sprint, que precisa ser dividida.' },
    { term: 'Fatiamento vertical', def: 'Dividir uma história em fatias que atravessam todas as camadas e entregam valor.' },
    { term: 'Spike', def: 'Investigação com limite de tempo para reduzir uma incerteza antes da implementação.' },
    { term: 'Definição de Pronto', def: 'Critérios de qualidade comuns a todas as histórias do time.' }
  ],
  examples: R`**Analogia:** a história é a **anotação no verso de um guardanapo** durante um almoço: "ele quer ver onde está o pedido". Ela só funciona porque as pessoas **conversam** depois. Os critérios de aceitação são o que vocês combinam **antes de pagar a conta**, para ninguém se surpreender na entrega.

**História bem formada:**
§§§
Como cliente da loja,
quero acompanhar o status do meu pedido,
para saber quando devo estar em casa para receber.

Critérios de aceitação
1. Dado um pedido enviado há 2 dias, quando abro "Meus pedidos", então vejo o status "Enviado" e o código de rastreio.
2. Dado um pedido de outro cliente, quando tento abrir sua página, então recebo "pedido não encontrado" (sem revelar que ele existe).
3. Dado um status que muda, quando a mudança ocorre, então recebo um e-mail em até 5 minutos.
4. Dado que a transportadora está fora do ar, quando abro "Meus pedidos", então vejo o último status conhecido e a hora da última atualização.
§§§

**Avaliando com INVEST:** "Como administrador, quero um dashboard completo" falha em **S** (grande), **E** (vago) e **T** (o que é "completo"?). Reescrita em fatias: "ver o total de vendas do dia", "filtrar por loja", "exportar para CSV".

**Caso real:** uma equipe dividia histórias por camada ("API de pedidos", "tela de pedidos") e só via valor depois de 3 Sprints. Ao fatiar verticalmente ("cliente vê o status do pedido, só do último pedido, só em web"), entregou valor na primeira Sprint e recebeu feedback real.`,
  code: [
    { title: 'Estrutura de uma história com critérios, e verificação básica de INVEST (padrão em JavaScript; a lógica é treinada no exercício da aula)', lang: 'javascript', code: R`const historia = {
  id: 'US-042',
  como: 'cliente da loja',
  quero: 'acompanhar o status do meu pedido',
  para: 'saber quando devo estar em casa para receber',
  pontos: 3,
  criterios: [
    { dado: 'um pedido enviado há 2 dias', quando: 'abro "Meus pedidos"', entao: 'vejo o status "Enviado" e o código de rastreio' },
    { dado: 'um pedido de outro cliente', quando: 'tento abri-lo', entao: 'recebo "pedido não encontrado"' }
  ]
};

function revisarHistoria(h, maxPontos = 5) {
  const p = [];
  if (!h.como || !h.quero || !h.para) p.push('faltam como/quero/para');
  if (!h.criterios || h.criterios.length < 2) p.push('menos de 2 critérios (testável)');
  else if (h.criterios.some((c) => !c.dado || !c.quando || !c.entao)) p.push('critério incompleto');
  if (!(h.pontos > 0)) p.push('sem estimativa');
  else if (h.pontos > maxPontos) p.push('grande demais: dividir');
  return p;
}
console.log(revisarHistoria(historia));                      // []
console.log(revisarHistoria({ ...historia, pontos: 13, criterios: [] }));`, notes: [{ l: '3', t: 'O "para" é a justificativa de valor.' }, { l: '9', t: 'Cada critério vira, mais tarde, um cenário automatizável (aula de BDD).' }, { l: '16', t: 'Heurística de triagem do INVEST (T, E, S): não substitui a conversa.' }] }
  ],
  bestPractices: ['Foque no usuário e no valor ("para...") e converse antes de detalhar.', 'Aplique o INVEST para revisar o backlog e refine as histórias que falham.', 'Escreva critérios verificáveis, com exemplos concretos, cobrindo exceções e limites.', 'Divida verticalmente e entregue a menor fatia que gera feedback.', 'Distinga critérios de aceitação (da história) da Definição de Pronto (do time).', 'Inclua os diferentes tipos de usuário, inclusive administração e suporte.'],
  mistakes: ['História que na verdade é uma tarefa técnica ou um épico.', 'Critérios vagos ("deve funcionar bem") ou que descrevem a implementação.', 'Dividir por camadas e não entregar valor até o fim.', 'Escrever as histórias sem conversar com quem tem a necessidade.', 'Misturar critérios de aceitação com a Definição de Pronto.', 'Ignorar casos de erro e de fronteira nos critérios.'],
  market: `Histórias de usuário e critérios de aceitação são o formato mais usado de requisitos em times ágeis; PMs, POs, analistas e desenvolvedores são avaliados pela qualidade do backlog. Saber fatiar verticalmente e escrever critérios testáveis acelera a entrega e reduz retrabalho, além de ser uma habilidade que aparece em casos de produto e entrevistas de PO.`,
  summary: `Uma história descreve usuário, necessidade e valor, e inicia uma conversa (os três C). O INVEST avalia sua qualidade; critérios de aceitação em lista ou Dado-Quando-Então tornam-na verificável, cobrindo caminhos felizes, exceções e limites. Divida verticalmente (padrões como SPIDR) para entregar valor em fatias pequenas. A Definição de Pronto é do time; os critérios, da história.`,
  refs: [REF.cohnStories, REF.invest, REF.givenWhenThen],
  cards: [
    { q: 'Quais são os três C das histórias de usuário?', a: 'Card (cartão), Conversation (conversa) e Confirmation (critérios de aceitação).' },
    { q: 'O que significa INVEST?', a: 'Independente, Negociável, Valiosa, Estimável, Pequena (Small) e Testável.' },
    { q: 'Qual a diferença entre critério de aceitação e Definição de Pronto?', a: 'Critérios são específicos de cada história; a Definição de Pronto vale para todas as histórias do time.' },
    { q: 'Por que dividir verticalmente em vez de por camada?', a: 'Cada fatia vertical atravessa as camadas e entrega valor utilizável, gerando feedback cedo.' }
  ]
},
{
  id: 'req-03', moduleId: 'm2', order: 3, minutes: 60, tags: ['event storming', 'eventos de domínio', 'workshop', 'modelagem colaborativa', 'DDD'],
  title: 'Event Storming: descobrindo o domínio com eventos',
  objectives: ['Explicar o objetivo do Event Storming e quando usar cada nível (Big Picture, Process Modeling, Software Design)', 'Conduzir a descoberta de eventos de domínio em ordem cronológica e identificar gargalos e conflitos', 'Usar a notação de elementos (evento, comando, ator, política, agregado, sistema externo, ponto de atenção)', 'Derivar contextos candidatos e agregados a partir do modelo coletivo', 'Planejar a facilitação: participantes, materiais, tempo, regras e artefatos de saída'],
  intro: `**Event Storming** é um workshop de **modelagem colaborativa** criado por Alberto Brandolini para **explorar um domínio de negócio** juntando, na mesma sala, **quem entende do negócio** e **quem constrói o software**. Em vez de começar com diagramas de classes ou tabelas, o grupo cobre uma parede longa com **notas adesivas laranja** que dizem **"o que acontece"** (eventos, sempre no passado) e vai refinando. É rápido, visual e expõe **conflitos de entendimento** que meses de documentação escondem. Esta aula é conceitual e prática: ao final você consegue planejar e conduzir uma sessão e ler o resultado.`,
  theory: `### A ideia central
O estado do negócio muda por **eventos**: "Pedido realizado", "Pagamento aprovado", "Estoque reservado". Perguntar **"o que acontece?"** é mais fácil para especialistas de negócio do que desenhar classes. Ao colocar todos os eventos em **ordem cronológica** em uma parede, surgem **lacunas**, **contradições** e **perguntas** que ninguém tinha feito. O Event Storming usa isso como motor da descoberta, e prepara o terreno para **DDD** (Domain-Driven Design): contextos, agregados e a linguagem comum.

### Quem participa
Pessoas de **negócio** (operação, vendas, suporte, jurídico, finanças), **produto**, **desenvolvimento**, **dados**, **UX** e quem tiver dúvidas sobre o processo: de **6 a 15 pessoas**, com decisores e quem realmente faz o trabalho. Um **facilitador** conduz (não decide o conteúdo). **Quem sabe de verdade** o domínio tem de estar na sala: o evento só funciona com a **diversidade de visões**.

### Materiais
Uma **parede grande** (ou quadro virtual) com **papel de rolo**, notas adesivas em várias cores e **canetas grossas** (para ler à distância), **sem cadeiras** (as pessoas ficam de pé e circulam), tempo (de algumas horas a dois dias) e **café**.

### Os níveis
1. **Big Picture**: visão ampla de um negócio ou processo longo. Só **eventos** (laranja), pontos de atenção e atores. Objetivo: **entendimento comum**, achar gargalos e dividir em **áreas/linhas de tempo**.
2. **Process Modeling**: detalha **um processo**: acrescenta **comandos**, **atores**, **políticas**, **modelos de leitura** e **sistemas externos**, mostrando o fluxo de "decisão → efeito".
3. **Software Design**: leva ao desenho do software: **agregados** (quem mantém a consistência e atende o comando), **limites de contexto** e **contratos** entre eles.

### Notação mais difundida
(As cores variam por equipe; o importante é **combinar uma legenda** e mantê-la visível.)
| Elemento | Cor usual | Significa | Escrita |
|---|---|---|---|
| **Evento de domínio** | laranja | algo que **aconteceu** e importa ao negócio | verbo no passado: "Pedido pago" |
| **Comando** | azul | a **intenção** que causa o evento | verbo no imperativo: "Pagar pedido" |
| **Ator** | amarelo pequeno | quem emite o comando | "Cliente", "Atendente" |
| **Política** | lilás | regra "**sempre que X acontecer, faça Y**" | "Quando pagamento aprovado, reservar estoque" |
| **Agregado** | amarelo grande | quem processa o comando e garante as regras | "Pedido" |
| **Sistema externo** | rosa | serviço fora do escopo | "Gateway de pagamento" |
| **Modelo de leitura** | verde | informação necessária para decidir | "Lista de pedidos do cliente" |
| **Ponto de atenção** | rosa/vermelho forte | dúvida, conflito, risco, oportunidade | "Quem autoriza estorno? ninguém sabe!" |

### Como conduzir (Big Picture em 5 passos)
1. **Explosão de eventos (caos)**: cada pessoa escreve eventos no passado e os cola, **sem ordem** e **sem censura**, por 15 a 30 minutos;
2. **Linha do tempo**: reorganiza-se em **ordem cronológica**, **removendo duplicatas** e **abrindo discussão** sobre divergências ("quem mais acontece primeiro?");
3. **Pontos de atenção**: marcam-se dúvidas, contradições e gargalos com adesivos fortes (**o que mais aparece aqui?**);
4. **Atores e sistemas**: coloca-se quem faz o quê e os sistemas externos;
5. **Linhas de tempo paralelas e áreas**: agrupa-se por **fases** e **pivôs** (eventos que dividem o processo), o que sugere **fronteiras** de contexto.
Para **Process Modeling**, para cada evento pergunte: **"Que comando causou isto? Quem o emitiu? Que regra ou política o dispara? Que informação foi necessária?"** E, depois: **"Que outros eventos isso provoca?"**

### Da parede ao software
- **Agregados**: grupos de comandos e eventos que giram em torno da mesma regra de consistência ("Pedido" aceita *Adicionar item*, *Confirmar*, *Cancelar* e emite os eventos correspondentes);
- **Contextos candidatos**: onde a linguagem muda de sentido ("cliente" em Vendas x em Faturamento), onde há **transferência de responsabilidade** e **equipes diferentes**;
- **Políticas** viram **processos reativos** (assinatura de eventos, mensageria, sagas);
- **Pontos de atenção** viram **backlog de perguntas** e de investigação, e **histórias de usuário** saem dos fluxos.
O **resultado** é um modelo compartilhado, fotografado e transcrito, e uma lista de **decisões, perguntas e próximos passos**.

### Boas práticas e armadilhas
- **Facilite, não dirija**; faça as pessoas escreverem; peça para **quem está quieto** opinar.
- **Evite** discutir tecnologia cedo ("usaremos Kafka"): primeiro o negócio.
- **Eventos no passado**, **na linguagem do negócio**, não "CRUD" ("Registro atualizado" é inútil).
- **Não force consenso falso**: registre as divergências como pontos de atenção.
- **Sala errada** (só TI, ou só chefes) produz modelo parcial.
- **Foto e documento no mesmo dia**: o valor se perde se ninguém registra.
- **É uma ferramenta de descoberta**, não uma especificação completa; complemente com histórias, exemplos (BDD) e protótipos.
- **Remoto**: use quadros virtuais, regras claras de cores e turnos de fala; sessões mais curtas.`,
  concepts: [
    { term: 'Event Storming', def: 'Workshop colaborativo para descobrir um domínio modelando eventos em ordem cronológica.' },
    { term: 'Evento de domínio', def: 'Fato relevante ao negócio que ocorreu, escrito no passado.' },
    { term: 'Comando', def: 'Intenção de realizar uma ação que, se aceita, provoca um ou mais eventos.' },
    { term: 'Política', def: 'Regra do tipo "sempre que ocorrer X, faça Y".' },
    { term: 'Agregado', def: 'Conjunto de objetos tratados como uma unidade de consistência que processa comandos.' },
    { term: 'Ponto de atenção (hotspot)', def: 'Marca de dúvida, conflito, risco ou oportunidade encontrada na sessão.' },
    { term: 'Big Picture', def: 'Nível do Event Storming que mapeia o negócio todo apenas com eventos e pontos de atenção.' },
    { term: 'Pivotal event', def: 'Evento que marca uma mudança de fase no processo e ajuda a delimitar áreas.' },
    { term: 'Facilitador', def: 'Pessoa que conduz o workshop sem ditar o conteúdo.' }
  ],
  examples: R`**Analogia:** é montar **a linha do tempo de um crime** com todos os investigadores na sala: cada um escreve o que sabe que aconteceu, cola na parede, e logo se percebe que dois discordam sobre quem chegou primeiro, que falta uma peça entre 14h e 15h e que ninguém sabe quem abriu a porta. Os buracos viram perguntas; as perguntas viram o plano.

**Trecho de uma parede (Big Picture de uma loja virtual), em ordem:**
§§§
[Carrinho criado] -> [Item adicionado] -> [Pedido realizado] -> [Pagamento aprovado]
   -> [Estoque reservado] -> [Pedido separado] -> [Pedido enviado] -> [Pedido entregue]
Pontos de atenção:
- "Pagamento recusado": o que acontece com o estoque? (ninguém soube responder)
- "Pedido cancelado depois de enviado": quem decide o estorno do frete?
- "Cliente" aparece com sentidos diferentes em Vendas e em Financeiro.
§§§

**Process Modeling do evento "Pedido realizado":**
§§§
Ator: Cliente  ->  Comando: Realizar pedido  ->  Agregado: Pedido  ->  Evento: Pedido realizado
Política: quando Pedido realizado, solicitar pagamento      (sistema externo: gateway de pagamento)
Política: quando Pagamento aprovado, reservar estoque
Modelo de leitura necessário: itens do carrinho, endereço, frete calculado
§§§

**Resultados típicos de uma sessão:** (1) vocabulário comum ("pedido" x "venda"); (2) 3 contextos candidatos: Catálogo, Vendas, Logística; (3) 18 pontos de atenção priorizados; (4) 12 histórias iniciais; (5) a decisão de começar pelo fluxo "do pedido ao pagamento".

**Caso real:** uma empresa tinha dois sistemas de faturamento com regras divergentes. Em um Event Storming de um dia, a equipe de financeiro e a de operações descobriram que "pedido faturado" significava coisas diferentes para cada uma, o que explicava as divergências mensais. A decisão de separar os dois contextos e definir um evento de integração resolveu o problema que meses de reuniões não resolveram (cenário ilustrativo, sem medições reais).`,
  code: [
    { title: 'Representando uma parede de Event Storming como dados e procurando lacunas (padrão em JavaScript; a lógica é treinada no exercício da aula)', lang: 'javascript', code: R`const notas = [
  { tipo: 'ator', nome: 'Cliente' },
  { tipo: 'comando', nome: 'Realizar pedido', ator: 'Cliente', causa: ['Pedido realizado'] },
  { tipo: 'evento', nome: 'Pedido realizado' },
  { tipo: 'politica', nome: 'Solicitar pagamento', quando: 'Pedido realizado', dispara: 'Cobrar pagamento' },
  { tipo: 'comando', nome: 'Cobrar pagamento', ator: null, causa: ['Pagamento aprovado', 'Pagamento recusado'] },
  { tipo: 'evento', nome: 'Pagamento aprovado' },
  { tipo: 'evento', nome: 'Pagamento recusado' },
  { tipo: 'evento', nome: 'Estoque reservado' }
];

function lacunas(notas) {
  const eventos = notas.filter((n) => n.tipo === 'evento').map((n) => n.nome);
  const comEvento = new Set(notas.filter((n) => n.tipo === 'comando').flatMap((n) => n.causa));
  const disparados = new Set(notas.filter((n) => n.tipo === 'politica').map((n) => n.dispara));
  return {
    eventosSemCausa: eventos.filter((e) => !comEvento.has(e)),
    comandosSemOrigem: notas.filter((n) => n.tipo === 'comando' && !n.ator && !disparados.has(n.nome)).map((n) => n.nome)
  };
}
console.log(lacunas(notas));   // { eventosSemCausa: [ 'Estoque reservado' ], comandosSemOrigem: [] }`, notes: [{ l: '9', t: 'Cada comando declara os eventos que pode causar.' }, { l: '15', t: 'Um evento que nenhum comando causa é uma lacuna do modelo (falta comando, ator ou política).' }, { l: '16', t: 'Um comando sem ator e sem política que o dispare não tem origem explicada.' }, { l: '23', t: 'Saída esperada: "Estoque reservado" não tem comando causador.' }] }
  ],
  bestPractices: ['Convide quem conhece o negócio e quem constrói o software, e reserve o tempo necessário.', 'Escreva eventos no passado e na linguagem do negócio, sem se prender a tecnologia.', 'Marque pontos de atenção em vez de forçar um consenso falso.', 'Avance por níveis: Big Picture, depois Process Modeling e só então Software Design.', 'Registre a parede (fotos e transcrição) e derive histórias, contextos e perguntas no mesmo dia.', 'Use o resultado como ponto de partida para DDD, BDD e o backlog.'],
  mistakes: ['Fazer a sessão só com a equipe técnica ou só com gestores.', 'Escrever eventos como operações de banco ("registro atualizado").', 'Discutir ferramentas e arquitetura antes de entender o fluxo.', 'Ignorar divergências para "chegar logo ao consenso".', 'Não documentar o resultado e perder o aprendizado.', 'Tratar o Event Storming como especificação completa.'],
  market: `Event Storming é usado por times que fazem DDD, microsserviços e modernização de sistemas legados para alinhar negócio e tecnologia rapidamente, e por consultorias de arquitetura. Facilitar uma sessão e converter a parede em contextos, agregados e histórias é uma habilidade de arquitetos, analistas de negócio e líderes técnicos.`,
  summary: `Event Storming mapeia o domínio com eventos no passado em ordem cronológica, em workshops com negócio e tecnologia. Níveis: Big Picture (eventos e pontos de atenção), Process Modeling (comandos, atores, políticas, modelos de leitura, sistemas externos) e Software Design (agregados e contextos). A notação mais comum usa laranja para eventos, azul para comandos, lilás para políticas e amarelo para atores e agregados. O resultado alimenta contextos, histórias e o backlog; as divergências viram pontos de atenção.`,
  refs: [REF.eventStorming, REF.eventStormingBook],
  cards: [
    { q: 'Como se escreve um evento de domínio?', a: 'No passado e na linguagem do negócio: "Pedido pago", e não "Atualizar registro".' },
    { q: 'O que é uma política no Event Storming?', a: 'Uma regra do tipo "sempre que ocorrer o evento X, execute o comando Y".' },
    { q: 'Quais níveis o Event Storming tem?', a: 'Big Picture, Process Modeling e Software Design.' },
    { q: 'Que valor têm os pontos de atenção?', a: 'Registram dúvidas, conflitos e riscos descobertos, que viram perguntas, decisões e histórias.' }
  ]
}
];
