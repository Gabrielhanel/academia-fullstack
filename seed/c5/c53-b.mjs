// C5.3 — Documentação arquitetural. Aulas 3 e 4 (ADR; comunicação de decisões técnicas).
import { REF } from './c53-a.mjs';
const R = String.raw;

export const REF2 = {
  nygard: { title: 'Michael Nygard — Documenting Architecture Decisions', url: 'https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions', kind: 'artigo' },
  adrSite: { title: 'Architectural Decision Records (adr.github.io)', url: 'https://adr.github.io/', kind: 'guia' },
  madr: { title: 'MADR — Markdown Architectural Decision Records', url: 'https://adr.github.io/madr/', kind: 'template' },
  adrTools: { title: 'adr-tools (Nat Pryce)', url: 'https://github.com/npryce/adr-tools', kind: 'ferramenta' },
  log4brains: { title: 'Log4brains', url: 'https://github.com/thomvaill/log4brains', kind: 'ferramenta' },
  radarAdr: { title: 'Thoughtworks Technology Radar — Lightweight Architecture Decision Records', url: 'https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records', kind: 'artigo' },
  designDocs: { title: 'Malte Ubl — Design Docs at Google', url: 'https://www.industrialempathy.com/posts/design-docs-at-google/', kind: 'artigo' },
  diataxis: { title: 'Diátaxis — A systematic approach to technical documentation', url: 'https://diataxis.fr/', kind: 'guia' },
  decisionMatrix: { title: 'Wikipedia — Decision-matrix method', url: 'https://en.wikipedia.org/wiki/Decision-matrix_method', kind: 'referência' },
  atam: { title: 'Wikipedia — Architecture tradeoff analysis method', url: 'https://en.wikipedia.org/wiki/Architecture_tradeoff_analysis_method', kind: 'referência' },
  rustRfcs: { title: 'Rust RFCs — o processo de RFC do Rust', url: 'https://github.com/rust-lang/rfcs', kind: 'exemplo' }
};

export const lessonsB = [
{
  id: 'adr-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['ADR', 'decisões', 'MADR', 'status', 'consequências', 'adr-tools', 'lint'],
  title: 'ADR: registrar decisões de arquitetura com contexto, alternativas e consequências',
  objectives: ['Explicar o que é um ADR, quando escrever um e o que ele não é', 'Escrever um ADR completo (título, status, data, contexto, decisão, alternativas, consequências)', 'Gerir o ciclo de vida (proposto, aceito, rejeitado, obsoleto, substituído) preservando o histórico', 'Distinguir ADR de design doc e de RFC', 'Automatizar verificações de ADRs (formato, numeração, reciprocidade da substituição) e gerar o índice', 'Evitar os defeitos comuns (sem alternativas, sem consequências negativas, decisão já tomada disfarçada)'],
  intro: R`Um **ADR** (*Architecture Decision Record*) é um **documento curto** que registra **uma decisão arquitetural significativa**, com o **contexto** que a motivou, as **alternativas** consideradas e as **consequências**. Ele responde à pergunta que o código **não responde**: **"por que é assim?"**. No laboratório, **5 ADRs** de exemplo passaram no verificador, **3 ADRs defeituosos** acumularam **9 problemas** (exit 1), e um gerador montou o **índice** automaticamente; a cadeia **ADR-0003 (cache em memória) → substituído por ADR-0005 (Redis)** preserva o **histórico** da mudança.`,
  theory: R`### O que é e por que existe
Equipes **esquecem por quê**: quem decidiu usar PostgreSQL, por que não GraphQL, por que o cache é distribuído? Sem registro, novas pessoas **refazem a discussão** ou **desfazem** uma decisão **sem saber** o que ela protegia (a **"cerca de Chesterton"**). Michael Nygard propôs ADRs **curtos**, **numerados**, **versionados com o código** e **imutáveis** (uma decisão nova **substitui**, **não reescreve**). O **valor** está em **contexto + alternativas + consequências**, não no formato.

### Quando escrever
Escreva um ADR quando a decisão for **significativa** para a arquitetura, ou seja, **difícil de reverter** ou com **impacto amplo**:
- **Estrutura** (monólito modular x microsserviços), **tecnologias principais** (banco, fila, linguagem, framework);
- **Interfaces e contratos** (REST x GraphQL, versionamento, formatos de eventos);
- **Requisitos não funcionais** (consistência, latência, disponibilidade, segurança, custos);
- **Padrões e convenções** que **muitos times** seguirão (logs, autenticação);
- **Decisões de "não fazer"** (**rejeitadas**): tão valiosas quanto as aceitas, pois **evitam reabrir** a discussão.
**Não escreva** para escolhas **triviais** e **reversíveis** (nome de variável, biblioteca de datas pontual). **Regra prática:** "se uma pessoa nova perguntar 'por que vocês fazem assim?' e a resposta exigir contexto, **registre**".

### Anatomia de um ADR (formato do laboratório)
| Seção | Conteúdo |
|---|---|
| **Título** | §# ADR-0005: Cache distribuído com Redis§: **número sequencial** + **decisão em frase** |
| **Status** | **Proposto**, **Aceito**, **Rejeitado**, **Obsoleto** ou **Substituído por ADR-NNNN** |
| **Data** | §AAAA-MM-DD§ da **decisão** |
| **Contexto** | **Forças** em jogo: requisitos, restrições, equipe, prazos, **o que mudou** (neutro, factual) |
| **Decisão** | **O que faremos**, em voz **ativa** ("Usar Redis 8 com cache-aside e TTL de 60 s") |
| **Alternativas consideradas** | **Pelo menos duas** reais, com **por que não** (honestas, **não "espantalhos"**) |
| **Consequências** | **Positivas e negativas/riscos**, incluindo **o que fica mais difícil** e **como mitigar** |
Variações: **MADR** (*Markdown Architectural Decision Records*: seções de **drivers de decisão**, **opções** e **prós/contras**), **Y-statements** ("No contexto de X, enfrentando Y, decidimos Z para alcançar A, aceitando B"), **formato Nygard** (contexto, decisão, status, consequências).

### Ciclo de vida e imutabilidade
**Proposto** → (revisão em PR) → **Aceito** (ou **Rejeitado**, **mantido** como registro) → mais tarde **Obsoleto** (a decisão **deixou de valer** sem substituta) ou **Substituído por ADR-NNNN**. **Regras:**
- **Não reescreva** um ADR aceito: **crie um novo** que o **substitui** e **atualize só o status** do antigo;
- **Reciprocidade:** o ADR novo declara **"Substitui ADR-0003"** e o antigo, **"Substituído por ADR-0005"**; **o verificador do laboratório confere essa ligação**;
- **Histórico conta uma história**: no laboratório, o **cache em memória** (uma única instância, ADR-0003) foi **substituído** pelo **Redis** (três réplicas, ADR-0005) quando o **contexto mudou**: nenhuma decisão foi "errada", **o contexto mudou**.
- **Erros factuais** podem ser **corrigidos** no próprio ADR (commit com nota).

### Onde e como
- **No repositório** (§docs/adr/§ ou §docs/decisions/§), em **Markdown**, **junto do código** que afeta; **numeração** com **zeros à esquerda** (§0001-slug.md§);
- **Revisão em PR** (a **discussão** acontece **ali** e fica **registrada**); **decisor(es)** identificados;
- **Índice** gerado (o laboratório gerou a **tabela** com número, título, status e data);
- **Referencie** o ADR **no código** (comentário DÍVIDA/ADR) e **nos diagramas** (aula adr-02).

### Boas e más características
**Bom ADR:** **curto** (uma página), **uma decisão**, **contexto factual** (números), **alternativas reais**, **consequências honestas** (incluindo **riscos** e **condições de revisão**), **escrito no momento da decisão**.
**Defeitos comuns:**
- **Sem alternativas** ("decisão já tomada" escrita **depois**: ADR de **justificativa**, não de **decisão**);
- **Só consequências positivas** (propaganda);
- **Contexto vago** ("precisamos de escalabilidade");
- **Romance** (cinco páginas que ninguém lê);
- **Vários assuntos** em um ADR;
- **Sem dono** e sem **data**;
- **Status mentiroso** ("Aceito" para o que **nunca foi implementado**).

### ADR, design doc e RFC
| | **ADR** | **Design doc** | **RFC** |
|---|---|---|---|
| **Foco** | **uma decisão** | **uma solução completa** (como construir) | **uma proposta** a ser **debatida** por muita gente |
| **Tamanho** | 1 página | 3 a 15 páginas | variável |
| **Quando** | decisão significativa | projeto/funcionalidade grande | mudança com **impacto amplo** ou **entre equipes** |
| **Resultado** | **registro permanente** | guia de implementação | **decisão** (que vira ADR) |
Um **design doc** costuma **gerar vários ADRs**; uma **RFC aceita** vira **ADR** (aula adr-04).

### Medido: verificador de ADRs do laboratório
**Regras implementadas** (script próprio, §adr-lint.mjs§): nome §NNNN-slug.md§; título §# ADR-NNNN: ...§ coerente com o arquivo; **seções obrigatórias**; **status** válido (ou §Substituído por ADR-NNNN§); **data** em §AAAA-MM-DD§; **aceito exige ≥ 2 alternativas**; **consequências citam positivo e negativo/risco**; **numeração sequencial sem lacunas**; **substituição recíproca**.
- **5 ADRs** de exemplo (§Aceito§, §Aceito§, §Substituído por ADR-0005§, §Rejeitado§, §Aceito§): **todos válidos**, **exit 0**;
- **3 ADRs defeituosos** (sem alternativas e sem riscos; status "Talvez" e data §10/01/2026§ e seções ausentes; substituição para **ADR-0099 inexistente**): **9 problemas**, **exit 1**;
- **Índice gerado:** tabela de **5 linhas** (número com link, título, status, data);
- **5 testes** (§node --test§) cobrem as regras individuais, o **índice** e a **matriz de decisão** da aula adr-04.
**Limite:** o verificador checa **forma**, **não qualidade**: um ADR com **duas "alternativas" falsas** passa. A **revisão humana** continua necessária.

### Ferramentas (analisadas, não executadas)
- **adr-tools** (scripts shell: §adr new§, §adr supersede§), **Log4brains** (site navegável e publicação), **MADR** (templates), **Backstage** (catálogo de documentação). Escolha **a que o time manterá**: um **template em Markdown** e **um script de verificação** (como o do laboratório) **bastam**.

### Quando revisar
- **Gatilho** no próprio ADR (**"reavaliar quando a segunda equipe entrar"**, **"quando passar de 10k req/s"**);
- **Revisão periódica** de ADRs **aceitos** antigos (a decisão **ainda** vale?);
- **Ao detectar** dívida ligada (cln-05): o **marcador** DÍVIDA(PEDIDOS-212) aponta o ADR.`,
  concepts: [
    { term: 'ADR', def: 'Architecture Decision Record: documento curto que registra uma decisão arquitetural, seu contexto, alternativas e consequências.' },
    { term: 'Status do ADR', def: 'Estado da decisão: proposto, aceito, rejeitado, obsoleto ou substituído por outro ADR.' },
    { term: 'Imutabilidade do ADR', def: 'Prática de não reescrever ADRs aceitos: novas decisões os substituem e apenas o status do antigo muda.' },
    { term: 'MADR', def: 'Markdown Architectural Decision Records: template de ADR com drivers, opções e prós e contras.' },
    { term: 'Y-statement', def: 'Formato compacto de decisão: no contexto de X, enfrentando Y, decidimos Z para alcançar A, aceitando B.' },
    { term: 'Design doc', def: 'Documento que descreve uma solução completa para um projeto (objetivos, design, alternativas, riscos, plano).' },
    { term: 'RFC (processo)', def: 'Proposta escrita submetida à discussão ampla antes de uma decisão com grande impacto.' }
  ],
  examples: R`**Analogia:** um ADR é o **diário de bordo do navio**: não conta toda a viagem, mas **registra cada mudança de rota importante**, **por que** (tempestade, vento) e **o que se esperava**; quem assume o leme depois **entende o caminho** e **sabe quando voltar** ao rumo antigo.

**Exemplo 1: decisão substituída.** ADR-0003 (cache em memória) → ADR-0005 (Redis) quando surgiram 3 réplicas.

**Exemplo 2: decisão rejeitada.** ADR-0004 rejeita microsserviços para uma equipe de 5 pessoas, com gatilho de revisão.

**Exemplo 3: ADR defeituoso.** Uma única alternativa ("Nenhuma") e consequências "Tudo ótimo" são barradas pelo verificador.`,
  code: [
    { title: 'Um ADR completo (Markdown; formato usado e validado no laboratório)', lang: 'md', code: R`# ADR-0005: Cache distribuído com Redis

## Status
Aceito

## Data
2026-09-14

## Contexto
A API passou a ter três réplicas e o cache em memória (ADR-0003) causava leituras divergentes e invalidações perdidas. Substitui ADR-0003.

## Decisão
Usar Redis 8 com padrão cache-aside, TTL de 60 segundos e invalidação explícita nas escritas do catálogo.

## Alternativas consideradas
- Manter o cache por processo com TTL menor: reduz a divergência, mas não elimina e aumenta a carga no banco.
- Cache no CDN: bom para conteúdo público, mas o catálogo depende do usuário e do preço negociado.

## Consequências
- Positiva: leitura consistente entre réplicas e menos carga no banco.
- Negativa: novo componente a operar e latência de rede em cada leitura.
- Risco: indisponibilidade do Redis; a API deve funcionar degradada lendo do banco.`, notes: [{ l: '8', t: 'O contexto traz fatos que mudaram (3 réplicas) e a ligação com o ADR substituído.' }, { l: '19', t: 'Consequências negativas e risco explícitos, com mitigação.' }] },
    { title: 'Verificador de ADRs: regras principais (JavaScript; testado, exit 0 nos válidos e 1 nos inválidos)', lang: 'js', code: R`export const STATUS = ['Proposto', 'Aceito', 'Rejeitado', 'Obsoleto'];
const SECOES = ['Status', 'Data', 'Contexto', 'Decisão', 'Alternativas consideradas', 'Consequências'];

export function verificarAdr(arquivo, texto) {
  const erros = []; const num = /^(\d{4})-[a-z0-9-]+\.md$/.exec(arquivo);
  if (!num) erros.push('nome do arquivo fora do padrão NNNN-slug.md');
  for (const s of SECOES) if (secao(texto, s) === null) erros.push('seção ausente: ' + s);
  const status = secao(texto, 'Status');
  if (status && !/^Substituído por ADR-\d{4}$/.test(status) && !STATUS.includes(status)) erros.push('status inválido: ' + status);
  const alt = secao(texto, 'Alternativas consideradas');
  if (alt !== null && status === 'Aceito' && (alt.match(/^- /gm) || []).length < 2) erros.push('ADR aceito precisa de ao menos 2 alternativas');
  const cons = secao(texto, 'Consequências');
  if (cons !== null && !(/positiv/i.test(cons) && /(negativ|risco)/i.test(cons))) erros.push('consequências devem citar efeitos positivos e negativos/riscos');
  return { erros };
}
// node adr-lint.mjs adrs               -> ADRs OK (exit 0)
// node adr-lint.mjs exemplos-invalidos -> 9 problema(s) (exit 1)`, notes: [{ l: '5', t: 'Valida a forma do nome e a numeração do arquivo.' }, { l: '12', t: 'Regras de qualidade mínimas: alternativas e riscos obrigatórios.' }] },
    { title: 'Y-statement e gatilho de revisão (Markdown)', lang: 'md', code: R`No contexto de uma equipe de 5 pessoas em um único domínio em evolução rápida,
enfrentando o custo de operar vários serviços,
decidimos manter um monólito modular com fronteiras explícitas,
para alcançar entregas simples e depuração fácil,
aceitando acoplamento por banco compartilhado que exige disciplina e testes.

Gatilho de revisão: reavaliar quando uma segunda equipe entrar no domínio ou o pico passar de 10 mil req/s.`, notes: [{ l: '1', t: 'Estrutura compacta: contexto, problema, decisão, objetivo e custo aceito.' }, { l: '7', t: 'O gatilho torna a revisão explícita (valores de exemplo).' }] }
  ],
  bestPractices: ['Escreva um ADR por decisão significativa e curta, no momento da decisão, com contexto factual.', 'Liste ao menos duas alternativas reais com o motivo de não escolhê-las.', 'Seja honesto nas consequências negativas e nos riscos e defina gatilhos de revisão.', 'Não reescreva ADRs aceitos: substitua e mantenha a ligação recíproca.', 'Guarde os ADRs no repositório e revise-os em PR com decisores identificados.', 'Automatize a verificação de forma e a geração do índice, mas mantenha a revisão humana.', 'Registre também as decisões rejeitadas.'],
  mistakes: ['ADR escrito depois da decisão como justificativa, sem alternativas.', 'Apenas consequências positivas.', 'Contexto vago e vários assuntos em um mesmo ADR.', 'Editar ADRs antigos em vez de criar substitutos.', 'Status mentiroso (Aceito para o que nunca foi implementado).', 'Ferramentas e templates complexos que ninguém mantém.'],
  market: R`ADRs são **prática padrão** em equipes maduras (citados no **Technology Radar** da Thoughtworks) e **pedidos em entrevistas** de **tech lead e arquitetura**: **explicar uma decisão com contexto, alternativas e consequências** é a **habilidade central**.`,
  summary: R`Um ADR registra uma decisão arquitetural significativa com título numerado, status, data, contexto, decisão, alternativas e consequências, curto e versionado com o código; os aceitos são imutáveis e substituídos por novos ADRs com ligação recíproca. Medido no laboratório: 5 ADRs válidos (exit 0), 3 defeituosos com 9 problemas (exit 1), índice gerado e 5 testes; o verificador valida a forma, não a qualidade. Distinga ADR (uma decisão), design doc (uma solução) e RFC (proposta debatida). Ferramentas (adr-tools, Log4brains, MADR) foram só analisadas.`,
  refs: [REF2.nygard, REF2.adrSite, REF2.madr, REF2.adrTools, REF2.log4brains, REF2.radarAdr, REF.arc42],
  cards: [
    { q: 'Por que ADRs aceitos são imutáveis?', a: 'Para preservar o histórico das decisões e do contexto; mudanças viram novos ADRs que substituem os antigos, com ligação recíproca.' },
    { q: 'O que torna um ADR de má qualidade?', a: 'Sem alternativas reais, só consequências positivas, contexto vago, vários assuntos e escrito depois como justificativa.' },
    { q: 'Qual a diferença entre ADR e design doc?', a: 'O ADR registra uma decisão (uma página); o design doc descreve uma solução completa e costuma gerar vários ADRs.' },
    { q: 'O que o verificador do laboratório não garante?', a: 'A qualidade do conteúdo: valida seções, status, datas, numeração e alternativas, mas não se as alternativas são reais.' }
  ]
},
{
  id: 'adr-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['comunicação', 'design doc', 'RFC', 'trade-offs', 'matriz de decisão', 'docs as code', 'Diátaxis', 'arc42'],
  title: 'Comunicação de decisões técnicas: design docs, RFCs, trade-offs e documentação que se mantém viva',
  objectives: ['Adaptar a comunicação à audiência (equipe, liderança, produto, outras equipes)', 'Estruturar um design doc e um processo de RFC com prazos, decisores e resultado registrado', 'Explicitar trade-offs com critérios, pesos e uma matriz de decisão (e conhecer suas limitações)', 'Organizar a documentação (Diátaxis, arc42) e mantê-la viva com documentação como código', 'Apresentar decisões de forma clara (resumo primeiro, opções, recomendação e riscos)', 'Evitar armadilhas: documentos que ninguém lê, decisões escondidas em chats e pseudo-objetividade'],
  intro: R`Decidir bem **não basta**: a decisão precisa ser **entendida**, **debatida** e **lembrada** por quem a vai **implementar, operar e financiar**. Esta aula junta o **design doc**, o **processo de RFC**, a **análise de trade-offs** e a **documentação como código**. No laboratório, uma **matriz de decisão ponderada** (pesos 40/35/25, notas de 1 a 5, **dados hipotéticos**) ranqueou **monólito 4,75**, **híbrido 3,75** e **microsserviços 2,35** (margem **1,00**), e **o índice dos ADRs foi gerado automaticamente**: a conversa muda quando os **critérios** ficam **explícitos**.`,
  theory: R`### Comunicação por audiência
Cada audiência precisa de **uma coisa diferente**:
| Audiência | Quer saber | Formato |
|---|---|---|
| **Equipe que implementa** | **como** construir e **o que evitar** | design doc, diagramas C4 nível 2/3, ADRs |
| **Liderança técnica** | **riscos**, **alternativas**, **custo de reverter** | ADR + resumo de trade-offs |
| **Produto e negócio** | **prazo**, **custo**, **risco**, **benefício** | resumo de uma página, **sem jargão** |
| **Outras equipes** | **contrato** (APIs, eventos), **impacto**, **migração** | RFC, OpenAPI, guia de migração |
| **Operação/segurança** | **implantação**, **observabilidade**, **dados** | diagrama de implantação, runbook |
**Princípio (resumo primeiro / BLUF):** abra com **a decisão e o que se pede ao leitor** ("**Precisamos de aprovação até 12/12 para adotar Redis**"), depois **contexto**, **opções** e **detalhes**. Quem lê só o primeiro parágrafo **ainda entende**.

### Design doc
Documento de **3 a 15 páginas** (referência: o artigo de Malte Ubl sobre design docs no Google) escrito **antes** de construir algo **grande**. Estrutura típica:
1. **Contexto e objetivo** (problema, **por que agora**);
2. **Objetivos e não objetivos** (os **não objetivos** evitam **escopo implícito**);
3. **Design proposto** (diagramas C4 e de sequência da aula adr-01/02, **APIs**, **dados**);
4. **Alternativas consideradas** (e **por que não**);
5. **Riscos e mitigação**; **segurança, privacidade, observabilidade, custos**;
6. **Plano** (marcos, **migração**, **reversão**, testes);
7. **Perguntas abertas** e **decisores**.
**Para que serve:** **pensar** (escrever força clareza), **alinhar** (revisão assíncrona), **registrar** (gera ADRs). **Cuidados:** **não** é **contrato imutável** nem **especificação completa** (detalhe cresce no código); **curto o bastante para ser lido**.

### RFC (processo de proposta)
Quando a mudança tem **impacto amplo** ou **cruza equipes**, use um **processo de RFC**: **autor** publica a proposta; **revisores** comentam por **prazo definido** (por exemplo, 5 dias úteis); **decisores** nomeados **decidem** (**aprovada**, **rejeitada**, **adiada**); **resultado** e **justificativa** ficam **registrados** (viram **ADR**). Exemplos públicos de processos abertos: **Rust RFCs** (repositório público com **template**, **discussão** e **estado**). **Boas práticas:** **prazo** e **decisor** claros (**evita** discussão infinita), **separar** *feedback* (informativo) de **veto**, **registrar** **discordâncias** ("discordo, mas apoio"), **proposta curta** com **um resumo no topo**.

### Trade-offs e critérios
Arquitetura é **escolher entre atributos de qualidade conflitantes** (desempenho x simplicidade, consistência x disponibilidade, custo x resiliência). **Torne explícito:**
- **Critérios** relevantes **para este contexto** (operação, consistência, custo, prazo, habilidades da equipe, risco de fornecedor);
- **Pesos** (o que importa **mais**);
- **Evidências** (medições: aulas anteriores medem **p95**, **throughput**, **memória**; **protótipos**/*spikes* com **limite de tempo**);
- **Reversibilidade:** decisões **fáceis de reverter** (portas de ida e volta) merecem **menos análise**; **difíceis de reverter** (**banco**, **fornecedor**, **fronteiras de serviços**) merecem **mais**;
- **Cenários de qualidade** (método ATAM, resumido): **"se o tráfego triplicar em 30 minutos, o sistema deve ..."**.

### Matriz de decisão ponderada
Ferramenta **simples**: critérios com **pesos que somam 100**, **notas de 1 a 5** por alternativa, **total = soma(nota × peso/100)**. **Medido no laboratório (dados hipotéticos):**
| Critério (peso) | Monólito | Microsserviços | Híbrido |
|---|---|---|---|
| Operação (40) | 5 | 2 | 4 |
| Consistência (35) | 5 | 3 | 4 |
| Custo (25) | 4 | 2 | 3 |
| **Total** | **4,75** | **2,35** | **3,75** |
O **script** (§matriz.mjs§) **rejeita pesos que não somam 100** e **notas fora de 1 a 5** (testes). **Margem de 1,00** entre o 1º e o 2º. **Limitações importantes:**
- **Pseudo-objetividade:** os **números** parecem **científicos**, mas as **notas** são **opiniões**; **pesos** diferentes **mudam o vencedor**. **Faça análise de sensibilidade** (varie os pesos);
- **Critérios correlacionados** contam duas vezes;
- **Não substitui** **protótipo** e **conversa**: use para **estruturar a discussão** e **expor desacordos** ("por que você deu 2 em operação?");
- **Registre** a matriz **no ADR** como **anexo**, **com a data**.

### Documentação que se mantém viva
**Estrutura (Diátaxis):** quatro tipos **com objetivos diferentes**: **tutoriais** (aprender fazendo), **guias práticos** (*how-to*, resolver um problema), **referência** (informação precisa: APIs, configuração) e **explicação** (por que, contexto: **ADRs** e **design docs** vivem aqui). **Misturar** os tipos **piora** todos.
**Modelo arc42:** **template** de **12 seções** (contexto, restrições, **visão de blocos** [C4], **visão de implantação**, conceitos transversais, **decisões** [ADRs], **requisitos de qualidade**, **riscos**, glossário). Use como **checklist**: **não preencha** o que **não precisa**.
**Documentação como código (*docs as code*):**
- **Markdown no repositório**, **revisão em PR**, **versionamento** com o código;
- **CI**: renderizar diagramas (aula adr-01: **exit 1** na falha), **verificar ADRs** (aula adr-03), **checar links quebrados**, **gerar o índice**;
- **Donos** (CODEOWNERS) e **data de revisão**;
- **Fonte única:** **gere** referência de API a partir do **OpenAPI** e o ER do **esquema**; **não duplique**;
- **Descoberta:** um **README** que **aponta** para contexto, contêineres, ADRs e *runbooks*.
**Sinais de documentação morta:** ninguém sabe **quem** a mantém; **datas antigas**; diagramas **contradizem** o código; **onboarding** exige "**pergunte ao fulano**".

### Apresentar uma decisão
1. **Uma frase** com a **decisão** (ou o **pedido**);
2. **Por que agora** (o que mudou);
3. **Opções** (2 a 4) com **prós e contras** (e a **matriz**, se ajudar);
4. **Recomendação** e **riscos** (e **como saberemos se erramos**: **gatilho de revisão**);
5. **Próximos passos** e **responsáveis**.
**Para pessoas não técnicas:** troque **tecnologias** por **efeitos** ("**reduz o risco de indisponibilidade em promoções**"), use **números** e **analogias**, **evite siglas**.
**Reuniões de decisão:** **leitura prévia**, **tempo limitado**, **decisor claro**, **registro** (ADR) **no mesmo dia**.

### Armadilhas
- **Decisão em chat**/reunião **sem registro**: **some em semanas**;
- **Big design up front:** documento enorme que **nasce velho**;
- **Documentar depois** para "cumprir tabela" (**sem alternativas**);
- **HiPPO** (a opinião da pessoa mais bem paga): critérios **explícitos** equilibram;
- **Análise infinita**: prazo e **decisor**; **"discordar e comprometer-se"** após a decisão;
- **Esconder o negativo**: **riscos** omitidos **voltam** como **incidentes**.`,
  concepts: [
    { term: 'BLUF', def: 'Bottom line up front: começar o documento pela decisão ou pelo pedido ao leitor, antes do contexto.' },
    { term: 'Design doc', def: 'Documento escrito antes de construir algo grande, com objetivos, design, alternativas, riscos e plano.' },
    { term: 'RFC', def: 'Processo de proposta escrita com prazo de comentários e decisores definidos, cujo resultado é registrado.' },
    { term: 'Matriz de decisão ponderada', def: 'Técnica que pontua alternativas por critérios com pesos, expondo trade-offs; depende de notas subjetivas.' },
    { term: 'Análise de sensibilidade', def: 'Verificação de quanto o resultado de uma análise muda ao variar pesos e premissas.' },
    { term: 'Diátaxis', def: 'Modelo que organiza a documentação técnica em tutoriais, guias práticos, referência e explicação.' },
    { term: 'Documentação como código', def: 'Prática de manter a documentação em texto no repositório, com revisão, versionamento e verificações automáticas.' }
  ],
  examples: R`**Analogia:** comunicar uma decisão é **guiar uma expedição**: o **mapa geral** (contexto C4) orienta todos, o **diário de bordo** (ADR) registra cada bifurcação, o **plano de rota** (design doc) detalha a próxima etapa e a **reunião antes de partir** (RFC) garante que o grupo concorda com o caminho.

**Exemplo 1: matriz.** Monólito 4,75, híbrido 3,75, microsserviços 2,35 com pesos 40/35/25 (hipotéticos); a conversa passa a ser sobre os pesos e as notas.

**Exemplo 2: BLUF.** "Precisamos de aprovação até 12/12 para adotar Redis; o cache em memória diverge com 3 réplicas."

**Exemplo 3: documentação viva.** O CI renderiza os diagramas, valida os ADRs e gera o índice.`,
  code: [
    { title: 'Matriz de decisão ponderada com validação (JavaScript; testado: 4,75, 3,75 e 2,35)', lang: 'js', code: R`export function avaliar(criterios, alternativas) {
  const soma = criterios.reduce((s, c) => s + c.peso, 0);
  if (soma !== 100) throw new Error('os pesos devem somar 100 (soma atual: ' + soma + ')');
  const ranking = Object.entries(alternativas).map(([nome, notas]) => {
    let total = 0;
    for (const c of criterios) {
      const n = notas[c.nome];
      if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('nota inválida para ' + nome + ' em ' + c.nome);
      total += (n * c.peso) / 100;
    }
    return { nome, total: Math.round(total * 100) / 100 };
  }).sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
  return { ranking, margem: ranking.length > 1 ? Math.round((ranking[0].total - ranking[1].total) * 100) / 100 : null };
}
const criterios = [{ nome: 'operação', peso: 40 }, { nome: 'consistência', peso: 35 }, { nome: 'custo', peso: 25 }];
avaliar(criterios, { monolito: { operação: 5, consistência: 5, custo: 4 }, microsservicos: { operação: 2, consistência: 3, custo: 2 }, hibrido: { operação: 4, consistência: 4, custo: 3 } });
// ranking: monolito 4.75, hibrido 3.75, microsservicos 2.35; margem 1`, notes: [{ l: '3', t: 'Pesos que não somam 100 são rejeitados.' }, { l: '16', t: 'Dados hipotéticos: mude os pesos e observe se o vencedor muda (sensibilidade).' }] },
    { title: 'Esqueleto de design doc (Markdown)', lang: 'md', code: R`# Design doc: Cache distribuído para o catálogo
Decisão pedida: aprovar o uso de Redis até 12/12 (decisor: tech lead de plataforma).

## Contexto e objetivo
Três réplicas da API divergem no cache em memória; o p95 do catálogo dobrou em picos.

## Objetivos / Não objetivos
- Objetivo: leitura consistente entre réplicas; p95 < 80 ms.
- Não objetivo: cache de dados por usuário.

## Design proposto
Diagrama de contêineres (C4) e sequência de leitura (cache-aside).

## Alternativas consideradas
TTL menor por processo; cache no CDN.

## Riscos e mitigação
Indisponibilidade do Redis: leitura degradada no banco.

## Plano e reversão
Feature flag; rollout por réplica; reversão desligando a flag.

## Perguntas abertas
Política de invalidação em lote?`, notes: [{ l: '2', t: 'BLUF: o pedido ao leitor e o prazo vêm primeiro.' }, { l: '8', t: 'Os não objetivos delimitam o escopo.' }] },
    { title: 'CI de documentação (YAML de exemplo, não executado em nuvem)', lang: 'yaml', code: R`name: docs
on: [pull_request]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 26 }
      - run: node adr-lint.mjs docs/adr            # forma, numeração e substituição dos ADRs
      - run: ./renderizar.sh                       # falha se algum diagrama tiver sintaxe inválida
      - run: node gerar-indice.mjs docs/adr > docs/adr/README.md && git diff --exit-code   # índice sempre atualizado`, notes: [{ l: '10', t: 'Comandos do laboratório rodando em cada PR (YAML de exemplo, não executado em um runner real).' }, { l: '12', t: 'git diff --exit-code falha se o índice commitado estiver desatualizado.' }] }
  ],
  bestPractices: ['Comece pela decisão ou pelo pedido e adapte profundidade e vocabulário à audiência.', 'Escreva design docs curtos com objetivos, não objetivos, alternativas, riscos e plano de reversão.', 'Defina prazo e decisor em RFCs e registre o resultado como ADR.', 'Explicite critérios e pesos, faça análise de sensibilidade e trate a matriz como apoio à conversa.', 'Organize a documentação por tipo (Diátaxis) e mantenha-a no repositório com revisão e CI.', 'Gere o que puder da fonte (OpenAPI, esquema do banco) e atribua donos e datas de revisão.', 'Registre decisões no mesmo dia, nunca só em chats ou reuniões.'],
  mistakes: ['Decisões que vivem só em chat ou reunião.', 'Matriz de decisão tratada como verdade objetiva.', 'Documento enorme escrito antes de qualquer protótipo (big design up front).', 'Documentar depois, sem alternativas reais.', 'Misturar tutorial, referência e explicação no mesmo texto.', 'Esconder riscos ou usar jargão com público de negócio.'],
  market: R`**Escrever e conduzir design docs e RFCs** é uma competência-chave de **engenharia sênior** (promoções e entrevistas de **staff/lead** avaliam isso); **comunicar trade-offs** para **produto e liderança** diferencia quem **decide** de quem **executa**.`,
  summary: R`Adapte a comunicação à audiência e comece pelo pedido (BLUF). Design docs organizam objetivos, não objetivos, design, alternativas, riscos e plano; RFCs têm prazo, decisores e resultado registrado como ADR. Torne os trade-offs explícitos: critérios, pesos, evidências e reversibilidade; a matriz ponderada do laboratório (hipotética) deu monólito 4,75, híbrido 3,75 e microsserviços 2,35, mas depende de notas subjetivas, então faça análise de sensibilidade. Mantenha a documentação viva com Diátaxis/arc42 e docs as code (CI que valida ADRs, renderiza diagramas e gera o índice).`,
  refs: [REF2.designDocs, REF2.diataxis, REF.arc42, REF.docsAsCode, REF2.decisionMatrix, REF2.atam, REF2.rustRfcs, REF2.nygard],
  cards: [
    { q: 'O que é BLUF e por que usar?', a: 'Começar pela decisão ou pelo pedido ao leitor; quem lê só o primeiro parágrafo ainda entende o essencial.' },
    { q: 'Qual o principal risco da matriz de decisão ponderada?', a: 'A pseudo-objetividade: notas e pesos são opiniões e mudar os pesos pode mudar o vencedor; faça análise de sensibilidade.' },
    { q: 'Quais são os quatro tipos de documentação da Diátaxis?', a: 'Tutoriais, guias práticos, referência e explicação; misturá-los piora todos.' },
    { q: 'Que verificações automáticas manter em CI de documentação?', a: 'Validar os ADRs, renderizar os diagramas (falhar na sintaxe), checar links e gerar o índice, falhando se estiver desatualizado.' }
  ]
}
];
