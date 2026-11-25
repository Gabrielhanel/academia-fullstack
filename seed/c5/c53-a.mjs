// C5.3 — Documentação arquitetural. Aulas 1 e 2 (UML essencial; diagramas C4).
const R = String.raw;

export const REF = {
  umlSpec: { title: 'OMG — Unified Modeling Language (UML) specification', url: 'https://www.omg.org/spec/UML/', kind: 'especificação' },
  mermaid: { title: 'Mermaid — Documentation', url: 'https://mermaid.js.org/', kind: 'doc' },
  mermaidClass: { title: 'Mermaid — Class diagrams', url: 'https://mermaid.js.org/syntax/classDiagram.html', kind: 'doc' },
  mermaidSequence: { title: 'Mermaid — Sequence diagrams', url: 'https://mermaid.js.org/syntax/sequenceDiagram.html', kind: 'doc' },
  mermaidState: { title: 'Mermaid — State diagrams', url: 'https://mermaid.js.org/syntax/stateDiagram.html', kind: 'doc' },
  mermaidEr: { title: 'Mermaid — Entity relationship diagrams', url: 'https://mermaid.js.org/syntax/entityRelationshipDiagram.html', kind: 'doc' },
  mermaidC4: { title: 'Mermaid — C4 diagrams', url: 'https://mermaid.js.org/syntax/c4.html', kind: 'doc' },
  mermaidCli: { title: 'Mermaid CLI (mmdc)', url: 'https://github.com/mermaid-js/mermaid-cli', kind: 'ferramenta' },
  plantuml: { title: 'PlantUML — Documentation', url: 'https://plantuml.com/', kind: 'doc' },
  c4model: { title: 'The C4 model for visualising software architecture (Simon Brown)', url: 'https://c4model.com/', kind: 'guia' },
  structurizr: { title: 'Structurizr', url: 'https://structurizr.com/', kind: 'ferramenta' },
  docsAsCode: { title: 'Write the Docs — Docs as Code', url: 'https://www.writethedocs.org/guide/docs-as-code/', kind: 'guia' },
  arc42: { title: 'arc42 — Template for architecture documentation', url: 'https://arc42.org/', kind: 'guia' }
};

export const lessonsA = [
{
  id: 'adr-01', moduleId: 'm1', order: 1, minutes: 75, tags: ['UML', 'diagramas', 'classes', 'sequência', 'estados', 'ER', 'Mermaid', 'PlantUML'],
  title: 'UML essencial: classes, sequência, estados e entidade-relacionamento com diagramas como código',
  objectives: ['Escolher o diagrama certo para a pergunta (estrutura, interação, ciclo de vida, dados)', 'Ler e escrever diagramas de classes, sequência, estados e ER nas notações essenciais', 'Escrever diagramas como código (Mermaid e PlantUML) versionados junto ao projeto', 'Renderizar e validar diagramas em linha de comando e entender o que a validação não cobre', 'Evitar os erros comuns: diagrama gigante, sem legenda, desatualizado ou sem pergunta a responder', 'Relacionar cada diagrama ao código e aos testes que ele descreve'],
  intro: R`**UML** (Unified Modeling Language) é uma **linguagem gráfica padronizada** (OMG) para **descrever software**. Hoje poucos times usam os **14 tipos de diagrama**: o que vale é o **núcleo essencial**, escrito como **código** (texto em Git) para **não envelhecer fora do repositório**. Aqui você usa **Mermaid** e **PlantUML**: no laboratório **7 diagramas Mermaid** renderizaram (3,7 a 8,2 s cada; mmdc 12.2.0), um diagrama inválido **falhou com exit 1** e **3 diagramas PlantUML** renderizaram (1.2026.10), com um erro de sintaxe devolvendo **exit 200**.`,
  theory: R`### Para que serve (e para que não serve)
Um diagrama é **bom** quando **responde a uma pergunta** de **alguém específico**: "como o pedido chega ao pagamento?", "que estados um pedido tem?", "quem depende de quem?". **Mau**: o diagrama **gigante** que tenta mostrar **tudo**, o **gerado do código** sem curadoria (ruído), o **que ninguém atualiza** (pior que nenhum: **desinforma**). **Regras:**
- **Uma pergunta por diagrama**; **título** e **escopo** claros;
- **Poucos elementos** (cerca de 5 a 10 por diagrama é uma boa referência de leitura, não regra);
- **Nomes do domínio** (cln-01), **legenda** quando houver cor/forma com significado;
- **Versionado** com o código e **revisado** nas mesmas PRs.
**UML é meio, não fim**: a **conversa** que o diagrama provoca vale mais que o desenho.

### Diagramas como código: Mermaid e PlantUML
- **Mermaid**: sintaxe **simples**, renderizada **no navegador** e **em Markdown** (GitHub, GitLab, Docusaurus, Obsidian). **CLI** (§mmdc§) gera **SVG/PNG/PDF**. **Medido:** **7 diagramas** válidos renderizaram com **exit 0** (3,7 a 8,2 s); um inválido saiu com **exit 1** e a mensagem **§Parse error on line 3: ... Expecting 'TXT', got 'NEWLINE'§**. O §mmdc§ usa um **navegador** (Puppeteer): no CI exige **Chrome** e §--no-sandbox§ em contêineres (**configuração** no §puppeteer-config.json§).
- **PlantUML**: **mais completo** (todos os diagramas UML, C4 com biblioteca, layout controlável), exige **Java** (ou a **imagem Docker**). **Medido (1.2026.10):** 3 diagramas renderizaram (exit 0, 3 a 4 s); **§-failonerror§** não era necessário para um **erro de sintaxe** ser sinalizado (**exit 200**, "Syntax Error?"), **mas** um arquivo com **§loop§ sem fim** e **seta sem destino** foi **aceito** (exit 0): o PlantUML é **tolerante**, **valide visualmente**.
- **Outras:** **draw.io** (arquivos XML versionáveis), **Excalidraw**, **Structurizr** (C4, aula adr-02), **D2**. **Escolha** pela **integração** com o seu fluxo (Markdown no repositório, revisão em PR). **Atenção à segurança:** **não envie** diagramas internos a **servidores públicos de renderização** (kroki.io, plantuml.com/plantuml) sem avaliar: **o texto do diagrama é enviado** ao servidor.
- **Limite da validação automática:** o renderizador diz que a **sintaxe** é válida, **não** que o diagrama está **correto** nem **atualizado**.

### Diagrama de classes (estrutura)
Mostra **tipos**, **atributos**, **operações** e **relacionamentos**. Notação essencial:
- **Associação** (§-->§): "conhece/usa"; **multiplicidade** (§1§, §0..*§, §1..*§);
- **Agregação** (§o--§): todo-parte **fraca**; **composição** (§*--§): todo-parte **forte** (o ciclo de vida da parte depende do todo): §Pedido *-- Item§;
- **Herança/generalização** (§<|--§) e **realização** de interface (§<|..§): §Pagamento <|.. GatewayPix§;
- **Dependência** (§..>§): usa **temporariamente** (parâmetro, variável local): §Pedido ..> Pagamento§;
- **Estereótipos** (§<<interface>>§), **visibilidade** (§+§ público, §-§ privado, §#§ protegido).
**Uso:** **modelo de domínio**, **contratos** entre módulos, **padrões** (aula de patterns). **Cuidado:** **não desenhe todas as classes** do sistema; **modele conceitos**, não arquivos. Em JavaScript/TypeScript, **funções e módulos** também são elementos (use "componente" quando não há classes).

### Diagrama de sequência (interação no tempo)
Mostra **quem fala com quem**, **em que ordem**, incluindo **respostas e alternativas**. Elementos: **participantes/atores**, **mensagens síncronas** (§->>§) e **respostas** (§-->>§), **blocos** §alt§/§else§, §opt§, §loop§, §par§, **ativação**. No laboratório: **checkout** com §POST /pedidos§ → **reservar estoque** → **cobrar** → **§alt§ aprovado: 201** / **§else§ recusado: liberar estoque + 402**: o diagrama **expõe a compensação** que o código da Facade (aula pat-02) implementa. **Uso:** **fluxos de API**, **autenticação** (OAuth: C4.4), **falhas e retentativas**, **integrações**. **Cuidado:** **não** desenhe **cada chamada de função**; mostre **fronteiras** (serviços, camadas) e **decisões**.

### Diagrama de estados (ciclo de vida)
Estados, **transições** (eventos e condições) e estados **inicial** e **final**. No laboratório, o pedido: §novo → pago/cancelado§, §pago → enviado/cancelado§, §enviado → entregue§. É **o mesmo** conteúdo da **tabela de transições** da aula **pat-03** (State): o diagrama é a **vista humana**, a tabela é a **fonte executável**. **Uso:** **pedidos**, **pagamentos**, **assinaturas**, **documentos em revisão**, **conexões**. **Dica:** **cada transição inválida** do diagrama deve ter um **teste** (§transição inválida: novo → enviado§).

### Entidade-relacionamento (dados)
**Entidades**, **atributos**, **chaves** (§PK§, §FK§, §UK§) e **cardinalidades** (§||--o{§ = "um para zero ou muitos"). No laboratório: **CLIENTE faz PEDIDO**, **PEDIDO contém ITEM_PEDIDO**, **PRODUTO aparece em ITEM_PEDIDO**. **Uso:** **modelagem de dados** (curso de SQL/modelagem: C3.1/C3.2), **migrações**, **documentação do esquema**. **Cuidado:** o ER **desatualiza** com migrações: **gere** a partir do banco (ferramentas como SchemaSpy, Prisma ERD) **ou** valide no CI.

### Outros diagramas úteis
- **Casos de uso** (quem faz o quê, **fronteira do sistema**): bom para **requisitos** iniciais (aula de requisitos);
- **Atividades/fluxograma** (processos e **fluxos de decisão**): Mermaid **§flowchart§**: no laboratório, o **diagrama de implantação** (balanceador, 2 réplicas, worker, PostgreSQL, Redis);
- **Componentes/implantação**: **estrutura física** e lógica (aula adr-02 aprofunda).

### Fluxo recomendado
1. **Formule a pergunta** e a **audiência**;
2. **Esboce** (papel ou quadro) antes de digitar;
3. **Escreva em Mermaid** (padrão do repositório, Markdown) e **PlantUML** só se precisar de **mais recursos**;
4. **Renderize no CI** (falha se a sintaxe quebrar) e **publique** (site de documentação);
5. **Revise** o diagrama **na mesma PR** que muda o comportamento;
6. **Remova** diagramas **mortos** (como código morto: cln-04).

### Ligação com código e testes
- **Classes** ↔ **tipos/interfaces** (TypeScript); **sequência** ↔ **testes de integração/contrato** (C5.4/C5.6); **estados** ↔ **tabela de transições** testada; **ER** ↔ **migrações**.
- **Documentação viva**: sempre que possível, **gere ou verifique** o diagrama a partir da **fonte** (esquema do banco, OpenAPI) em vez de **redesenhá-lo**.`,
  concepts: [
    { term: 'UML', def: 'Linguagem de modelagem gráfica padronizada para descrever estrutura e comportamento de sistemas de software.' },
    { term: 'Diagrama de classes', def: 'Diagrama estrutural com tipos, atributos, operações e relacionamentos (associação, composição, herança, dependência).' },
    { term: 'Diagrama de sequência', def: 'Diagrama de interação que mostra mensagens trocadas entre participantes ao longo do tempo.' },
    { term: 'Diagrama de estados', def: 'Diagrama que descreve os estados de um objeto e as transições entre eles.' },
    { term: 'Diagrama ER', def: 'Diagrama de entidades, atributos e relacionamentos usado para modelar dados.' },
    { term: 'Diagrama como código', def: 'Diagrama escrito em texto (Mermaid, PlantUML) versionado e renderizado automaticamente.' },
    { term: 'Composição', def: 'Relacionamento todo-parte forte em que o ciclo de vida da parte depende do todo.' }
  ],
  examples: R`**Analogia:** os diagramas UML são **vistas de uma planta de casa**: a planta baixa (classes) mostra **onde ficam as paredes**; o **fluxo de pessoas** (sequência) mostra **como se circula**; o **ciclo do chuveiro** (estados) mostra **o que acontece ao abrir e fechar**; e a **instalação hidráulica** (ER) mostra **o que se conecta a quê**. Nenhuma vista basta sozinha, e **nenhuma deve tentar mostrar tudo**.

**Exemplo 1: sequência com compensação.** Em caso de pagamento recusado, a API libera o estoque e responde 402.

**Exemplo 2: estados do pedido.** O mesmo conteúdo da tabela de transições testada na aula de State.

**Exemplo 3: validação no CI.** Um diagrama com erro de sintaxe falhou com exit 1 na renderização; a ferramenta não detecta um diagrama desatualizado.`,
  code: [
    { title: 'Sequência do checkout em Mermaid (renderizado no laboratório com mmdc 12.2.0, exit 0)', lang: 'mermaid', code: R`sequenceDiagram
  autonumber
  actor U as Cliente
  participant W as Web
  participant A as API de Pedidos
  participant E as Estoque
  participant P as Pagamento
  U->>W: finalizar compra
  W->>A: POST /pedidos
  A->>E: reservar(itens)
  E-->>A: ok
  A->>P: cobrar(valor)
  alt aprovado
    P-->>A: aprovado
    A-->>W: 201 Created
  else recusado
    P-->>A: recusado
    A->>E: liberar(itens)
    A-->>W: 402 Payment Required
  end`, notes: [{ l: '13', t: 'Bloco alt/else: o fluxo alternativo mostra a compensação do estoque.' }, { l: '2', t: 'autonumber numera as mensagens para referenciá-las na revisão.' }] },
    { title: 'Classes e estados em Mermaid (renderizados no laboratório)', lang: 'mermaid', code: R`classDiagram
  class Pedido {
    +string id
    +total() number
    +pagar() void
  }
  class Item { +string sku +number qtd }
  class Pagamento { <<interface>> +cobrar(valor) Resultado }
  Cliente "1" --> "0..*" Pedido : faz
  Pedido "1" *-- "1..*" Item : contém
  Pedido ..> Pagamento : usa
  Pagamento <|.. GatewayPix

stateDiagram-v2
  [*] --> novo
  novo --> pago: pagamento aprovado
  novo --> cancelado: cancelar
  pago --> enviado: despachar
  enviado --> entregue: confirmar entrega
  entregue --> [*]`, notes: [{ l: '10', t: 'Composição (*--): o Item não existe sem o Pedido.' }, { l: '12', t: 'Realização de interface: o gateway implementa Pagamento.' }] },
    { title: 'Renderizar e validar no CI (shell; resultado medido: 7 OK e 1 com exit 1)', lang: 'bash', code: R`# Mermaid: um SVG por diagrama; falha (exit != 0) se a sintaxe for inválida
for f in diagramas/*.mmd; do
  npx mmdc -p puppeteer-config.json -i "$f" -o "renders/$(basename "$f" .mmd).svg" -q || echo "FALHOU: $f"
done
# puppeteer-config.json: { "executablePath": "/usr/bin/google-chrome", "args": ["--no-sandbox", "--disable-gpu"] }

# PlantUML via Docker (sem instalar Java): exit 200 para erro de sintaxe
docker run --rm -i plantuml/plantuml -tsvg -pipe -failonerror < plantuml/classes.puml > classes.svg`, notes: [{ l: '3', t: 'O mmdc devolve exit 1 em erro de sintaxe: ideal para falhar o CI.' }, { l: '8', t: 'A renderização não valida o conteúdo, só a sintaxe.' }] }
  ],
  bestPractices: ['Responda uma pergunta por diagrama, com título, escopo e poucos elementos.', 'Escreva diagramas como código no repositório e revise-os junto com a mudança de comportamento.', 'Renderize no CI para detectar sintaxe quebrada e publique os SVGs.', 'Relacione cada diagrama ao código: tabela de transições, tipos, testes de integração e migrações.', 'Gere ou valide a partir da fonte (banco, OpenAPI) sempre que possível.', 'Não envie diagramas internos a servidores públicos de renderização sem avaliar o risco.', 'Remova diagramas desatualizados.'],
  mistakes: ['Diagrama gigante que tenta mostrar o sistema inteiro.', 'Desenhar cada classe ou chamada de função em vez de conceitos e fronteiras.', 'Diagramas fora do repositório, sem dono e desatualizados.', 'Achar que a renderização bem-sucedida prova que o diagrama está correto.', 'Usar notação UML sem legenda para quem não a conhece.', 'Colar o texto de diagramas internos em renderizadores públicos.'],
  market: R`Saber **ler e produzir** diagramas de sequência, estados e classes é cobrado em **entrevistas de design**, **RFCs** e **revisões de arquitetura**; **diagramas como código** (Mermaid) já são padrão em **READMEs** e **sites de documentação** (GitHub, Docusaurus).`,
  summary: R`UML essencial: classes (estrutura: associação, composição, herança, dependência), sequência (interação, com blocos alt/loop), estados (ciclo de vida) e ER (dados). Escreva-os como código (Mermaid, PlantUML), versione e renderize no CI. Medido: 7 diagramas Mermaid renderizaram com exit 0 (3,7 a 8,2 s; mmdc 12.2.0) e um inválido saiu com exit 1; 3 diagramas PlantUML renderizaram (1.2026.10) e um erro de sintaxe deu exit 200, mas um loop sem fim foi aceito. A renderização valida a sintaxe, não a correção. Uma pergunta por diagrama e documentação viva.`,
  refs: [REF.umlSpec, REF.mermaid, REF.mermaidSequence, REF.mermaidClass, REF.mermaidState, REF.mermaidEr, REF.mermaidCli, REF.plantuml, REF.docsAsCode],
  cards: [
    { q: 'Qual a diferença entre composição e agregação?', a: 'Na composição o ciclo de vida da parte depende do todo (Pedido *-- Item); na agregação a parte existe independentemente.' },
    { q: 'O que a renderização em CI valida e o que não valida?', a: 'Valida a sintaxe (o mmdc devolveu exit 1 em um diagrama inválido); não valida se o diagrama está correto ou atualizado.' },
    { q: 'Quando usar diagrama de sequência?', a: 'Para fluxos entre fronteiras (serviços, camadas), incluindo falhas e compensações, não para cada chamada de função.' },
    { q: 'Por que cuidado com renderizadores públicos?', a: 'O texto do diagrama é enviado ao servidor; diagramas internos podem expor arquitetura e nomes sensíveis.' }
  ]
},
{
  id: 'adr-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['C4', 'contexto', 'contêineres', 'componentes', 'código', 'implantação', 'Structurizr'],
  title: 'Diagramas C4: contexto, contêineres, componentes e código — zoom progressivo da arquitetura',
  objectives: ['Descrever os quatro níveis do modelo C4 e a pergunta que cada um responde', 'Escolher o nível certo para cada audiência', 'Escrever diagramas C4 de contexto e de contêineres em Mermaid e saber os limites da sintaxe do Mermaid para C4', 'Complementar com diagramas de implantação e dinâmicos', 'Aplicar as boas práticas de notação (títulos, legenda, rótulos de relação com tecnologia, um nível por diagrama)', 'Identificar o que o laboratório executou e o que foi apenas analisado (Structurizr, C4-PlantUML)'],
  intro: R`O **modelo C4** (Simon Brown) organiza a documentação de arquitetura em **quatro níveis de zoom**: **Contexto** (o sistema e seus vizinhos), **Contêineres** (aplicações e armazenamentos que o compõem), **Componentes** (as partes internas de um contêiner) e **Código** (opcional). A ideia: **cada diagrama para uma audiência**, com **vocabulário simples** ("pessoa", "sistema", "contêiner", "componente"). No laboratório, os diagramas **C4Context** e **C4Container** do Mermaid **renderizaram** com **exit 0** (3,9 s cada), com a ressalva de que a documentação do Mermaid lista recursos **ainda não suportados** (sprites, tags, links e legenda).`,
  theory: R`### Por que C4
Diagramas "caixas e setas" costumam ter **notação inconsistente**, **sem legenda**, **sem nível definido** (misturam **sistemas**, **servidores** e **classes**). O C4 propõe: **abstrações comuns** (pessoa, sistema de software, contêiner, componente), **níveis hierárquicos** (como mapas: do **mundo** à **rua**) e **notação livre**, mas **com disciplina** (título, legenda, tecnologia nas caixas e rótulos nas setas).
**Atenção ao termo "contêiner":** no C4 é **qualquer unidade executável/armazenamento** (SPA, API, banco, fila, função serverless), **não** necessariamente **Docker**.

### Nível 1: Diagrama de contexto (sistema)
**Pergunta:** "**O que é o sistema, quem o usa e com quem ele se integra?**" **Audiência:** **todos** (negócio, produto, equipe, operação). **Elementos:** **pessoas** (cliente, atendente), **o sistema** (uma caixa) e **sistemas externos** (gateway de pagamento, transportadora). **Sem detalhes tecnológicos** (nem bancos, nem frameworks). No laboratório (§C4Context§): **Cliente** e **Atendente** usam a **Loja Online**, que **cobra** no **Gateway de Pagamento** e **cota frete** na **Transportadora**; cada **relação** tem **verbo** e **protocolo** (§Rel(loja, gateway, "Cobra", "HTTPS/JSON")§).
**Dica:** o diagrama de contexto é o **primeiro** que todo repositório deveria ter: **uma página**, **5 a 10 caixas**.

### Nível 2: Diagrama de contêineres
**Pergunta:** "**Que aplicações e armazenamentos compõem o sistema e como se comunicam?**" **Audiência:** **equipe técnica** (desenvolvimento, operações, arquitetos). **Elementos:** **SPA**, **API**, **banco**, **fila/cache**, **jobs**, com **tecnologia** (§React§, §Node.js, Express§, §PostgreSQL§, §Redis, BullMQ§). No laboratório (§C4Container§): **SPA** → **API de Pedidos** (§JSON/HTTPS§) → **Banco de Pedidos** (§SQL§) e **Fila de Jobs** (§Redis§) e → **Gateway** (§HTTPS§).
**Aqui nascem as decisões** que os **ADRs** (aula adr-03) justificam: **por que PostgreSQL**, **por que REST**, **por que uma fila**. Um diagrama de contêineres **sem ADRs** mostra **o que existe**, não **por quê**.

### Nível 3: Diagrama de componentes
**Pergunta:** "**Como um contêiner é decomposto em partes principais e quais são suas responsabilidades?**" **Audiência:** **quem trabalha naquele contêiner**. **Elementos:** **controllers**, **serviços**, **repositórios**, **módulos Nest** (§PedidosModule§, §PagamentosModule§), **adaptadores** (aula pat-02). **Quando fazer:** para contêineres **complexos** e **centrais**; **não** para todos. **Dica:** pode ser **gerado** do código (módulos/pacotes) **com curadoria** (ferramentas como dependency-cruiser: C5.6), para **não desatualizar**.

### Nível 4: Código
**Pergunta:** "**Como um componente é implementado?**" Normalmente **dispensável** (o **código** já é a documentação e **diagramas de classes** gerados pela IDE servem): use **só** para uma **parte crítica** ou **didática** (aula adr-01).

### Diagramas complementares
- **Implantação (deployment):** **onde cada contêiner roda** (nós, réplicas, regiões, balanceador, serviços gerenciados). No laboratório (§flowchart§): **balanceador** → **2 réplicas da API** e **worker**, com **PostgreSQL** e **Redis**; **medido:** renderizou com **exit 0** (5,6 s);
- **Dinâmico:** uma **sequência numerada** de **interações** entre elementos C4 para um **caso de uso** (parecido com o diagrama de sequência da aula adr-01);
- **Panorama do sistema (landscape):** **vários sistemas** da organização.

### Ferramentas e o que foi executado
| Ferramenta | Como | Status neste curso |
|---|---|---|
| **Mermaid C4** (§C4Context§, §C4Container§, §C4Component§) | texto em Markdown | **Executado:** 2 diagramas renderizados (exit 0). A documentação do Mermaid lista como **não suportados** (curto prazo) **sprites, tags, links e legenda**; o **layout é automático**, **sem controle fino** |
| **Structurizr DSL / Lite** | **um modelo** textual gera **várias vistas** consistentes | **Não executado** (analisado): separa **modelo** de **vistas**, evitando **inconsistência entre diagramas** |
| **C4-PlantUML** | biblioteca de **includes** | **Não executado** (depende de **includes remotos**); PlantUML foi executado com **diagramas UML simples** |
| **draw.io / Excalidraw** | desenho livre | **Não executado** |
**Modelo único x desenhos soltos:** em ferramentas como o Structurizr, o **modelo** (pessoas, sistemas, contêineres, relações) é **definido uma vez** e **vistas** são **projeções**; renomear algo **atualiza todas**. Em Mermaid, **cada diagrama é independente**: **mais simples**, **menos consistente**.

### Notação e boas práticas
- **Título** com **nível e escopo** ("Contêineres: Loja Online");
- **Cada caixa:** **nome**, **tipo** (pessoa, sistema, contêiner), **tecnologia** e **responsabilidade em uma frase**;
- **Cada seta:** **verbo no ativo** e **tecnologia/protocolo** ("Cobra, HTTPS/JSON"); **setas unidirecionais** (a **direção** é a da **dependência/iniciativa**);
- **Legenda** (cores/formas) **sempre**; **não dependa só de cor** (acessibilidade);
- **Um nível por diagrama**: **não misture** sistemas e componentes;
- **Consistência:** o **mesmo nome** em todos os diagramas (um **glossário**);
- **Evite** sistemas externos em excesso e **setas para tudo** (use **agrupamentos** e **limites**: §System_Boundary§).

### Como começar em um projeto
1. **Contexto** (1 página) com **pessoas e sistemas externos**;
2. **Contêineres** (1 página) com **tecnologias** e **protocolos**;
3. **ADRs** para as **decisões** destacadas nos contêineres (aula adr-03);
4. **Componentes** só dos contêineres que **precisam**;
5. **Revise** a cada **mudança arquitetural** (junto da PR) e **ao integrar pessoas** novas (**teste de onboarding**: alguém novo entende em 15 minutos?);
6. **CI** valida a sintaxe (aula adr-01).

### Armadilhas
- **Misturar níveis** (um "contêiner" que é uma classe);
- **Desenhar o ideal** em vez do **real** (documente o **existente**, e **marque** o **planejado** com outro estilo);
- **Diagrama sem dono** e sem data de revisão;
- **Detalhe demais** no contexto (tecnologias, bancos);
- **Confundir "contêiner" do C4 com Docker**;
- **Segurança:** diagramas de **implantação** podem expor **topologia** e **redes**: **controle o acesso** à documentação.`,
  concepts: [
    { term: 'Modelo C4', def: 'Método de documentação de arquitetura em quatro níveis de abstração: contexto, contêineres, componentes e código.' },
    { term: 'Diagrama de contexto', def: 'Nível 1 do C4: o sistema, seus usuários e os sistemas externos com os quais interage.' },
    { term: 'Contêiner (C4)', def: 'Unidade executável ou de armazenamento que compõe o sistema (SPA, API, banco, fila), não necessariamente Docker.' },
    { term: 'Componente (C4)', def: 'Agrupamento de código com responsabilidade coesa dentro de um contêiner.' },
    { term: 'Diagrama de implantação', def: 'Diagrama que mostra onde cada contêiner executa (nós, réplicas, serviços gerenciados).' },
    { term: 'Structurizr', def: 'Ferramenta com DSL textual que mantém um modelo único e gera várias vistas C4 consistentes.' },
    { term: 'Fronteira do sistema', def: 'Limite que separa o que pertence ao sistema do que é externo a ele.' }
  ],
  examples: R`**Analogia:** o C4 é o **Google Maps**: o **contexto** é a visão do país (que cidades se ligam), os **contêineres** são a visão da cidade (bairros e avenidas), os **componentes** são a visão do bairro (prédios) e o **código** é a planta do apartamento: você **dá zoom** conforme a pergunta, e **nenhuma visão tenta mostrar tudo**.

**Exemplo 1: contexto.** Loja Online, 2 pessoas e 2 sistemas externos, relações com verbo e protocolo.

**Exemplo 2: contêineres.** SPA → API de Pedidos → PostgreSQL e Redis/BullMQ, e API → Gateway.

**Exemplo 3: implantação.** Balanceador, 2 réplicas da API, 1 worker, PostgreSQL e Redis, renderizado como flowchart.`,
  code: [
    { title: 'C4 nível 1: contexto em Mermaid (renderizado no laboratório, exit 0; sem suporte a legenda, tags e sprites)', lang: 'mermaid', code: R`C4Context
  title Contexto: Loja Online
  Person(cliente, "Cliente", "Compra produtos pelo site")
  Person(atendente, "Atendente", "Resolve problemas de pedidos")
  System(loja, "Loja Online", "Catálogo, carrinho, pedidos e pagamentos")
  System_Ext(gateway, "Gateway de Pagamento", "Processa cartão e Pix")
  System_Ext(correios, "Transportadora", "Calcula frete e rastreia entregas")
  Rel(cliente, loja, "Compra", "HTTPS")
  Rel(atendente, loja, "Consulta e ajusta pedidos", "HTTPS")
  Rel(loja, gateway, "Cobra", "HTTPS/JSON")
  Rel(loja, correios, "Cota frete", "HTTPS/JSON")`, notes: [{ l: '5', t: 'O sistema aparece como uma única caixa: sem detalhes internos.' }, { l: '10', t: 'Cada relação tem verbo no ativo e protocolo.' }] },
    { title: 'C4 nível 2: contêineres em Mermaid (renderizado no laboratório, exit 0)', lang: 'mermaid', code: R`C4Container
  title Contêineres: Loja Online
  Person(cliente, "Cliente")
  System_Boundary(loja, "Loja Online") {
    Container(spa, "SPA", "React", "Interface de compra")
    Container(api, "API de Pedidos", "Node.js, Express", "Regras de pedido e pagamento")
    ContainerDb(db, "Banco de Pedidos", "PostgreSQL", "Pedidos, itens e clientes")
    Container(fila, "Fila de Jobs", "Redis, BullMQ", "E-mails e relatórios")
  }
  System_Ext(gateway, "Gateway de Pagamento")
  Rel(cliente, spa, "Usa", "HTTPS")
  Rel(spa, api, "Chama", "JSON/HTTPS")
  Rel(api, db, "Lê e grava", "SQL")
  Rel(api, fila, "Enfileira", "Redis")
  Rel(api, gateway, "Cobra", "HTTPS")`, notes: [{ l: '4', t: 'System_Boundary delimita o que pertence ao sistema.' }, { l: '7', t: 'ContainerDb marca um armazenamento, com tecnologia e responsabilidade.' }] },
    { title: 'Implantação em Mermaid flowchart e DSL do Structurizr (a segunda parte é conceitual, não executada)', lang: 'text', code: R`# Mermaid (executado)
flowchart LR
  U[Usuário] --> LB[Balanceador]
  LB --> A1[API réplica 1]
  LB --> A2[API réplica 2]
  A1 --> DB[(PostgreSQL)]
  A2 --> DB
  W[Worker] --> R[(Redis)]

# Structurizr DSL (não executado): um modelo, várias vistas
workspace {
  model {
    cliente = person "Cliente"
    loja = softwareSystem "Loja Online" {
      api = container "API de Pedidos" "Regras de pedido" "Node.js"
      db  = container "Banco" "Pedidos" "PostgreSQL"
    }
    cliente -> api "Compra" "HTTPS"
    api -> db "Lê e grava" "SQL"
  }
  views { container loja { include * autolayout lr } }
}`, notes: [{ l: '2', t: 'Mermaid flowchart serve bem para implantação simples.' }, { l: '12', t: 'No Structurizr o modelo é definido uma vez e as vistas são projeções.' }] }
  ],
  bestPractices: ['Comece pelo contexto e pelos contêineres e só detalhe componentes onde fizer falta.', 'Dê título, legenda e rótulos com verbo e protocolo; um nível por diagrama.', 'Documente o real e marque o planejado com outro estilo.', 'Ligue os contêineres às decisões registradas em ADRs.', 'Revise os diagramas junto das mudanças arquiteturais e valide a sintaxe no CI.', 'Considere um modelo único (Structurizr) quando houver muitos diagramas a manter coerentes.', 'Controle o acesso a diagramas de implantação por expor topologia.'],
  mistakes: ['Misturar níveis (classes ao lado de sistemas).', 'Confundir contêiner do C4 com contêiner Docker.', 'Setas sem rótulo, protocolo ou direção clara.', 'Diagrama sem legenda que depende só de cor.', 'Detalhar tecnologias no diagrama de contexto.', 'Documentar apenas o ideal e deixar o real desatualizado.'],
  market: R`O **C4** virou o **vocabulário comum** de arquitetura em muitas empresas (**design docs**, **RFCs**, **onboarding**); saber desenhar **contexto** e **contêineres** em **uma página** é pedido em **entrevistas** de **tech lead** e **arquitetura**.`,
  summary: R`O modelo C4 dá zoom em quatro níveis: contexto (sistema, pessoas e externos), contêineres (aplicações e armazenamentos com tecnologia e protocolo), componentes (partes internas de um contêiner) e código (raramente). Um nível por diagrama, com título, legenda e relações rotuladas; complemente com implantação e diagramas dinâmicos. No laboratório os diagramas C4Context e C4Container do Mermaid renderizaram (exit 0, ~3,9 s), mas a documentação lista legenda, tags, links e sprites como não suportados e o layout é automático; Structurizr e C4-PlantUML não foram executados. Ligue os contêineres a ADRs.`,
  refs: [REF.c4model, REF.mermaidC4, REF.structurizr, REF.plantuml, REF.arc42, REF.docsAsCode],
  cards: [
    { q: 'Que pergunta responde o diagrama de contexto?', a: 'O que é o sistema, quem o usa e com quais sistemas externos ele se integra, sem detalhes tecnológicos.' },
    { q: 'O contêiner do C4 é o mesmo que um contêiner Docker?', a: 'Não: é qualquer unidade executável ou de armazenamento (SPA, API, banco, fila), independentemente de Docker.' },
    { q: 'Por que usar um modelo único como o Structurizr?', a: 'Define pessoas, sistemas, contêineres e relações uma vez e gera várias vistas consistentes, evitando diagramas contraditórios.' },
    { q: 'Qual a limitação do C4 no Mermaid?', a: 'Faltam recursos como legenda, tags, links e sprites (listados como não suportados na documentação), o layout é automático e há pouco controle fino sobre o posicionamento.' }
  ]
}
];
