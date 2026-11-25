// C5.1 — Clean Code e SOLID. Aulas 3 e 4 (refatoração; code smells).
import { REF } from './c51-a.mjs';
const R = String.raw;

export const lessonsB = [
{
  id: 'cln-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['refatoração', 'testes de caracterização', 'extrair função', 'parameter object', 'strangler', 'mutação'],
  title: 'Refatoração: mudar a estrutura sem mudar o comportamento, em passos pequenos e com rede de segurança',
  objectives: ['Definir refatoração e distinguir de reescrita e de correção de bugs', 'Aplicar as refatorações básicas: renomear, extrair função e variável, constante nomeada, guard clause e objeto de parâmetros', 'Montar a rede de segurança com testes de caracterização e verificar sua força com uma mutação', 'Migrar chamadores aos poucos com um adaptador (assinatura antiga) em vez de uma troca em massa', 'Trabalhar em passos pequenos, com testes verdes e commits frequentes (dois chapéus)', 'Saber quando não refatorar (e quando é preferível substituir)'],
  intro: R`**Refatorar** é **melhorar a estrutura interna** do código **sem alterar o comportamento observável**. Não é "reescrever tudo": é uma sequência de **passos pequenos e seguros**, cada um mantendo os **testes verdes**. Neste laboratório a função legada §proc§ virou quatro funções pequenas, com **17 casos de caracterização** passando **nas duas versões**, **20 avisos** do ESLint caindo para **1** e uma **mutação** (§>§ trocado por §>=§) detectada por **1 teste**: é isso que dá confiança para mexer.`,
  theory: R`### O que é e o que não é
Para Martin Fowler, refatoração é "uma mudança na estrutura interna do software para torná-lo **mais fácil de entender e mais barato de modificar**, **sem alterar seu comportamento observável**". Por isso:
- **Corrigir um bug** ou **adicionar funcionalidade** **não** é refatorar (mudam o comportamento). Use **dois chapéus**: em cada momento você **adiciona função** (testes novos) **ou refatora** (testes inalterados), nunca os dois no mesmo passo/commit.
- **Reescrever do zero** troca **tudo** de uma vez e perde o conhecimento embutido no código legado (incluindo os "defeitos" de que alguém depende). Refatorar **preserva** esse conhecimento.
- **Otimizar desempenho** pode ser refatoração (se o comportamento observável é o mesmo), mas **meça antes e depois**.

### Por que e quando
- **Preparatória**: "faça a mudança fácil, depois faça a mudança fácil" (Kent Beck): antes de adicionar uma regra, **reestruture** para que ela caiba em um lugar só.
- **Oportunista** (a regra do escoteiro): deixe o código **um pouco melhor** do que encontrou, **ao passar por ele**.
- **Para entender**: renomear e extrair enquanto lê é uma forma de **registrar** o que entendeu.
- **Na revisão de código**: apontar smells e propor passos.
Evite **"projetos de refatoração"** longos sem entrega: viram **grandes reescritas** disfarçadas. Prefira **fatias** ligadas ao trabalho de produto.

### A rede de segurança: testes
Refatorar sem testes é **apostar**. Opções:
1. **Testes existentes** (rápidos, determinísticos, que verificam comportamento e **não** a implementação);
2. **Testes de caracterização** (Feathers) para código **sem testes**: registre **o que o código faz hoje**, **inclusive o estranho**, em tabelas de entrada e saída; é o **"golden master"** quando a saída é grande (compare com uma saída gravada);
3. **Costuras (*seams*)**: pontos onde se pode **trocar** uma dependência sem editar o código (parâmetro, módulo, injeção), para isolar o trecho em teste.
**Como saber se a rede é forte?** Faça uma **mutação**: altere **uma** condição e veja se **algum teste falha**. No laboratório, trocar §>§ por §>=§ no limite de 500 **derrubou 1 teste** (o de "exatamente 500"); se nada falhasse, **faltaria um caso de fronteira**. Ferramentas de **teste de mutação** (Stryker, aula C5.6) automatizam isso.
**Caracterização revela o inesperado**: o perfil §"1"§ (texto) recebia desconto por causa do §==§; o frete só era somado com §true§ **estrito**. O teste **fixa** esses comportamentos para você **decidir conscientemente** se mantém ou muda (em outro passo, outro commit).

### Catálogo básico (Fowler)
| Refatoração | Quando | No laboratório |
|---|---|---|
| **Renomear** | nome não revela a intenção | §d, t, f, c, x§ → §itens, perfil, comFrete, uf, cupom§ |
| **Extrair função** | bloco com um propósito nomeável | §subtotalDosItens§, §aplicarDescontoFixo§, §calcularFrete§ |
| **Extrair variável** | expressão complexa | §comDesconto§, §comEntrega§ |
| **Substituir literal mágico por constante** | número sem nome | §LIMITE_DESCONTO_FIXO§ = 500 |
| **Substituir condicional aninhada por guard clauses** | pirâmide de §if§ | retorno antecipado para lista vazia |
| **Substituir condicional por tabela/polimorfismo** | cadeia de §if/else§ por tipo | §FRETE_POR_UF§ e §FATOR_POR_PERFIL§ |
| **Introduzir objeto de parâmetros** | 4+ parâmetros | §calcularTotal({ itens, perfil, comFrete, uf, cupom })§ |
| **Mover função** | a função usa mais dados de outro módulo | (aula cln-04: feature envy) |
| **Remover código morto** | nada chama | §r = r + 0§ no legado |
Cada passo é **pequeno** (segundos a minutos): rode os testes **a cada passo**. IDEs (VS Code, WebStorm) fazem **renomear/extrair** de forma **automática e segura**; **prefira-as** a editar à mão.

### Migrar os chamadores: o adaptador (Strangler em pequena escala)
Mudar a **assinatura** de §proc§ quebraria **todos os chamadores** de uma vez. A solução do laboratório: **manter** §proc(d, t, f, c, x)§ como **adaptador** que chama a API nova (§calcularTotal§). Os chamadores migram **um a um**; quando não houver mais usos, **remova** o adaptador (a única advertência restante do ESLint: 5 parâmetros, **intencional**). É o mesmo princípio do **Strangler Fig** em escala de sistemas: **a nova implementação cresce ao redor** da antiga até substituí-la (aula de microsserviços e C5.8).

### Ritmo e hábitos
- **Passos minúsculos**, **testes verdes** a cada um; se quebrar, **desfaça** (Git) em vez de depurar por horas.
- **Commits** pequenos com mensagens "refatora: ..." (revisão fácil e **reversão** simples); **não misture** refatoração com mudança de comportamento no mesmo commit.
- **Métricas** (complexidade, tamanho, duplicação) ajudam a **escolher onde olhar**, **não** são meta: no laboratório, 20 → 1 avisos é um **sinal**, não o objetivo (o objetivo é mudar com segurança).
- **Combine** com o time (revisões menores, **feature flags** para mudanças maiores).

### Riscos e quando NÃO refatorar
- **Sem testes e sem como criá-los** a custo razoável: reduza o risco com **mudanças mecânicas** (renomear/extrair automáticos) e **observabilidade**.
- **Prazo e dependências externas**: refatorar **o que você vai mexer agora**; código estável que ninguém altera **não precisa** de refatoração.
- **Código descartável** ou prestes a ser substituído.
- **Reescrita** é aceitável quando o código é **pequeno**, o comportamento está **bem especificado e testado**, ou a **tecnologia** é inviável; caso contrário, o **Strangler** costuma ser mais seguro.

### Sequência usada no laboratório (analisada; o antes e o depois foram executados)
1. Escrever **17 casos de caracterização** contra o §proc§ legado (todos passam);
2. **Extrair** o cálculo de subtotal por perfil (→ §subtotalDosItens§) e **trocar** a cadeia de §if/else§ por tabela;
3. **Extrair** o desconto fixo e o frete (→ §aplicarDescontoFixo§, §calcularFrete§) e **nomear** os literais;
4. **Introduzir** o objeto de parâmetros (§calcularTotal§) e **guard clause** para lista vazia;
5. **Manter** o adaptador §proc§ (assinatura antiga);
6. **Rodar** os mesmos 17 casos contra as **duas** versões; **mutação** de uma condição → **1 falha**.
O laboratório executou os testes e o ESLint **no início e no fim**; **cada passo intermediário** não foi rodado separadamente: em um trabalho real, **rode a cada passo**.`,
  concepts: [
    { term: 'Refatoração', def: 'Mudança na estrutura interna do código para melhorar sua legibilidade e manutenção sem alterar o comportamento observável.' },
    { term: 'Teste de caracterização', def: 'Teste que registra o comportamento atual de um código legado para protegê-lo durante a refatoração.' },
    { term: 'Golden master', def: 'Técnica de comparar a saída atual com uma saída gravada de referência para detectar mudanças de comportamento.' },
    { term: 'Costura (seam)', def: 'Ponto do código onde se pode alterar o comportamento ou trocar uma dependência sem editar o trecho em teste.' },
    { term: 'Objeto de parâmetros', def: 'Refatoração que agrupa muitos parâmetros em um objeto com campos nomeados.' },
    { term: 'Adaptador de migração', def: 'Função ou camada que mantém a assinatura antiga delegando à nova, para migrar os chamadores aos poucos.' },
    { term: 'Strangler Fig', def: 'Estratégia em que a nova implementação cresce ao redor da antiga até substituí-la gradualmente.' }
  ],
  examples: R`**Analogia:** refatorar é **reformar uma casa morando nela**: troca-se um cômodo de cada vez, **testando o chuveiro** (a rede de testes) a cada passo; reescrever é **demolir e reconstruir** com a família na rua.

**Exemplo 1: rede de segurança.** 17 casos de caracterização passam contra o legado e contra o refatorado; a mutação >=: 1 falha.

**Exemplo 2: adaptador.** proc mantém a assinatura antiga e chama calcularTotal; os chamadores migram aos poucos.

**Exemplo 3: caracterização revela.** O texto "1" recebe desconto; o frete exige true estrito.`,
  code: [
    { title: 'Passos de refatoração sobre o mesmo teste (JavaScript; extrair função, tabela e objeto de parâmetros)', lang: 'js', code: R`// 1) cadeia de if/else por tipo -> tabela (substituir condicional por dados)
//    antes:  if (t == 1) fator = 0.9; else if (t == 2) fator = 0.8; else fator = 1;
const FATOR_POR_PERFIL = { 1: 0.9, 2: 0.8 };
const fator = FATOR_POR_PERFIL[String(perfil)] ?? 1;   // String(): preserva o "1" (texto) que o == aceitava

// 2) bloco com propósito -> função extraída
export function subtotalDosItens(itens, perfil) {
  const fator = FATOR_POR_PERFIL[String(perfil)] ?? 1;
  return itens.filter((i) => i.q > 0).reduce((soma, i) => soma + i.p * i.q * fator, 0);
}

// 3) muitos parâmetros -> objeto nomeado + adaptador com a assinatura antiga
export function calcularTotal({ itens, perfil, comFrete, uf, cupom }) { /* ... */ }
export const proc = (d, t, f, c, x) => calcularTotal({ itens: d, perfil: t, comFrete: f, uf: c, cupom: x });`, notes: [{ l: '5', t: 'String() mantém o comportamento observável do ==.' }, { l: '14', t: 'O adaptador permite migrar os chamadores um a um.' }] },
    { title: 'Mutação manual para testar os testes (shell; resultado medido: 1 falha)', lang: 'bash', code: R`# copia o laboratório e troca > por >= no limite do desconto fixo
sed -i 's/valor > LIMITE_DESCONTO_FIXO/valor >= LIMITE_DESCONTO_FIXO/' refatorado/pedido.mjs
node --test pedido.test.mjs
# ✖ refatorado (mesmo comportamento): exatamente 500 não desconta
# ℹ tests 36 / pass 35 / fail 1`, notes: [{ l: '2', t: 'Uma única alteração de fronteira.' }, { l: '4', t: 'O teste de limite detectou a mutação; sem ele, nada falharia.' }] },
    { title: 'Teste golden master para saídas grandes (JavaScript, Node.js test runner)', lang: 'js', code: R`import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gerarRelatorio } from './relatorio.mjs';

test('relatório igual ao golden master gravado', () => {
  const atual = gerarRelatorio({ ano: 2026, mes: 11 });
  const esperado = readFileSync(new URL('./golden/relatorio-2026-11.txt', import.meta.url), 'utf8');
  assert.equal(atual, esperado);
});
// 1) grave o golden master com o código ATUAL (aprove a saída conscientemente);
// 2) refatore; 3) qualquer diferença aparece como falha para você inspecionar.`, notes: [{ l: '7', t: 'Compara a saída inteira com a gravada.' }, { l: '12', t: 'Aprovar a saída é decisão humana; diferenças intencionais atualizam o arquivo.' }] }
  ],
  bestPractices: ['Garanta testes (ou caracterização) antes de qualquer refatoração.', 'Verifique a força dos testes com uma mutação rápida das condições de fronteira.', 'Faça passos pequenos, rode os testes a cada passo e faça commits separados de refatoração.', 'Use as refatorações automáticas da IDE para renomear e extrair.', 'Migre chamadores com um adaptador e remova-o ao final.', 'Refatore o que você vai alterar agora e deixe o código estável em paz.', 'Trate métricas como sinal para investigar, não como meta.'],
  mistakes: ['Refatorar sem testes ou com testes que verificam a implementação.', 'Misturar refatoração com mudança de comportamento no mesmo commit.', 'Reescrever do zero perdendo regras escondidas no legado.', '"Corrigir" comportamentos estranhos durante a refatoração sem decisão explícita.', 'Projetos de refatoração longos e sem entrega ao produto.', 'Perseguir métricas como meta (complexidade, número de avisos).'],
  market: R`Refatorar com segurança é a **habilidade central de quem herda código**: vagas de manutenção, modernização e plataforma pedem **testes de caracterização, Strangler e revisões incrementais**; "como você refatora sem testes?" é pergunta frequente de **entrevistas** sênior.`,
  summary: R`Refatorar é mudar a estrutura mantendo o comportamento observável, em passos pequenos com testes verdes. Para código sem testes, escreva testes de caracterização (golden master quando a saída é grande) e verifique sua força com uma mutação. Medido: 17 casos passaram nas duas versões (36 testes), 20 avisos do ESLint viraram 1, e trocar > por >= derrubou 1 teste. Use um adaptador para migrar chamadores aos poucos, separe refatoração de mudança de comportamento e trate métricas como sinais. Cada passo intermediário não foi executado separadamente no laboratório; só o antes e o depois.`,
  refs: [REF.fowlerRefactoring, REF.legacyBook, REF.cleanCode, REF.nodeTest, REF.eslintComplexity],
  cards: [
    { q: 'O que diferencia refatorar de reescrever?', a: 'Refatorar muda a estrutura em passos pequenos preservando o comportamento observável e o conhecimento embutido; reescrever troca tudo de uma vez.' },
    { q: 'Como saber se os testes protegem a refatoração?', a: 'Faça uma mutação (por exemplo, > por >=): se nenhum teste falhar, falta cobertura de fronteira; no laboratório 1 teste falhou.' },
    { q: 'Para que serve o adaptador com a assinatura antiga?', a: 'Permite migrar os chamadores aos poucos em vez de quebrar todos de uma vez; é removido quando não houver mais usos.' },
    { q: 'O que são os dois chapéus?', a: 'Em cada passo você ou adiciona funcionalidade (testes novos) ou refatora (testes inalterados), nunca os dois juntos.' }
  ]
},
{
  id: 'cln-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['code smells', 'duplicação', 'jscpd', 'acoplamento', 'catálogo'],
  title: 'Code smells: reconhecer sinais de problema de design, medir duplicação e decidir o que fazer',
  objectives: ['Definir code smell e distinguir de bug', 'Reconhecer as cinco famílias do catálogo (bloaters, abusadores de OO, impedidores de mudança, dispensáveis e acopladores)', 'Mapear cada smell à refatoração que o trata', 'Medir duplicação com jscpd e entender o efeito dos limites de detecção', 'Distinguir duplicação acidental de duplicação de conhecimento (DRY x Yagni)', 'Priorizar smells por custo de mudança, não por contagem'],
  intro: R`**Code smell** é um **sinal** de que o design pode ter um problema, **não um erro** em si: o código funciona, mas **custa caro de mudar**. Aqui você vai **medir**: três funções copiadas e coladas deram **4 clones, 21 linhas (75%) e 94 tokens (62,67%)** no **jscpd**, e a versão com função extraída deu **0 clones**, com resultados idênticos nos testes. E vai ver por que com os **limites padrão** o jscpd **não detectou nada**.`,
  theory: R`### O que é um smell
O termo (Kent Beck e Martin Fowler) descreve **indícios superficiais** que **apontam para um problema mais profundo** no design. Um smell **não é bug**: o programa roda. É um **convite à investigação**: às vezes o diagnóstico é "está ótimo assim" (**contexto** importa: um §switch§ em um parser pode ser a melhor solução).

### Catálogo (resumo por família)
**1. Bloaters (inchaços)**: código que **cresce demais**.
- **Método longo**: o §proc§ de 45 linhas → **extrair função**;
- **Classe grande** (muitas responsabilidades) → **extrair classe/módulo** (SRP);
- **Lista longa de parâmetros** (5 em §proc§) → **objeto de parâmetros**;
- **Obsessão por primitivos**: usar §string§/§number§ para conceitos de domínio (CPF, dinheiro, e-mail) → **objetos de valor** (§Dinheiro§, §Cpf§);
- **Grupos de dados** que sempre andam juntos (§rua, cidade, cep§) → **um objeto** (§Endereco§).
**2. Abusadores de orientação a objetos**:
- **§switch§/§if§ em cadeia por tipo** repetido em vários lugares → **tabela, polimorfismo** (OCP);
- **Campo temporário** (só usado em alguns fluxos); **herança recusada** (subclasse ignora o que herdou: LSP).
**3. Impedidores de mudança**:
- **Mudança divergente**: **uma** classe muda por **motivos diferentes** (viola SRP);
- **Cirurgia de espingarda** (*shotgun surgery*): **uma** mudança exige editar **muitos** lugares → **mover/agrupar**.
**4. Dispensáveis**: o que **sobra**.
- **Código duplicado**; **código morto** (no legado, §r = r + 0§); **generalidade especulativa** (abstração "para o futuro" sem uso: **Yagni**); **classe preguiçosa** (faz quase nada); **comentários** que **compensam** código confuso; **dados** que só carregam valores sem comportamento (às vezes OK).
**5. Acopladores**: **dependência demais** entre módulos.
- **Inveja de recurso** (*feature envy*): uma função usa mais dados de **outro** objeto do que dos seus → **mover função**;
- **Cadeias de mensagens** (§a.b().c().d()§, **Lei de Deméter**): o cliente conhece a **estrutura interna**;
- **Intermediário** (apenas delega) e **intimidade inapropriada** (acessa o interno de outro módulo).

### Duplicação: o smell mais medido
**DRY** (*Don't Repeat Yourself*) trata de **conhecimento**: **a mesma regra de negócio** em dois lugares **divergirá**. Mas **duplicação de código ≠ duplicação de conhecimento**:
- **Duplicação de conhecimento** (a regra "só pedidos pagos entram no total, em centavos") → **unifique**;
- **Duplicação acidental** (dois trechos parecidos **hoje** por coincidência, com **razões diferentes para mudar**) → **tolere**: unificar cria **acoplamento falso** e abstrações cheias de parâmetros. A **regra dos três**: duplique **duas** vezes; na **terceira**, abstraia.

### Medido: jscpd 5.4.3 em três funções copiadas
Os arquivos §duplicado.mjs§ (três funções §totalVendas§, §totalFretes§ e §totalImpostos§, idênticas **exceto o campo somado**) e §unificado.mjs§ (uma §somarPagos(pedidos, campo)§ e três linhas):
| Arquivo | Linhas | Clones | Linhas duplicadas | Tokens duplicados |
|---|---|---|---|---|
| §duplicado.mjs§ | 28 | **4** | **21 (75,00%)** | **94 (62,67%)** |
| §unificado.mjs§ | 5 | **0** | 0 | 0 |
Os testes confirmaram que as duas versões dão **o mesmo resultado** (§30.3§ e §1.75§ nos exemplos) e **4 testes passaram**.
**Surpresa instrutiva:** com o jscpd **sem informar limites** (padrão da ferramenta) **nenhum clone** foi detectado (e também com mínimo de 5 linhas e de 20 a 50 tokens, ou 3 a 4 linhas e 50 tokens), porque cada trecho difere em **um token** (§p.valor§ x §p.frete§) e os blocos iguais ficam **abaixo do mínimo**. Só ao reduzir para §--min-lines 3 --min-tokens 15§ os **4 clones** apareceram. **Lição:** **ferramenta com configuração padrão pode deixar passar o problema**; calibre os limites com **exemplos conhecidos** e **revise os achados**. Limites **baixos demais** geram **ruído** (trechos curtos e triviais).

### Detectar na prática
- **Linters** (ESLint): §complexity§, §max-lines-per-function§, §max-params§, §max-depth§, §no-magic-numbers§, §no-unused-vars§ (código morto);
- **jscpd** ou análise do SonarQube para **duplicação**;
- **Análise de dependências** (dependency-cruiser) para acoplamento e ciclos (C5.6);
- **Histórico do Git**: arquivos que **mudam juntos** e **mudam sempre** (hotspots) indicam divergência e cirurgia de espingarda;
- **Revisão de código** e **testes difíceis de escrever** (muito preparo = acoplamento).

### Do smell à ação
| Smell | Tratamento |
|---|---|
| Método longo / aninhamento | Extrair função, guard clauses |
| Parâmetros demais | Objeto de parâmetros |
| Duplicação (de conhecimento) | Extrair função/módulo |
| §switch§ por tipo repetido | Tabela de regras ou polimorfismo |
| Inveja de recurso | Mover função |
| Obsessão por primitivos | Objeto de valor |
| Código morto | Remover (o Git guarda o histórico) |
| Mudança divergente | Separar responsabilidades |
**Priorize por custo**: um smell em código **estável** e **raramente tocado** não vale o esforço; em um **hotspot** (muito alterado, com defeitos) vale. Combine **frequência de mudança** x **complexidade** (aula C5.8).

### Smells em testes
Também existem **smells de teste**: testes **frágeis** (acoplados à implementação), **lentos**, **com lógica** (§if§ no teste), **dependentes de ordem**, **assertions demais**, **dados misteriosos**; trate-os como código de produção.

### Cuidados
- **Não é caça às bruxas**: smells são **hipóteses**; decida com o **custo de mudança** na mão.
- **Cheiros contextuais**: um §switch§ de **máquina de estados** ou de **tradução de formatos** pode ser **o design correto**.
- **Ferramentas** acusam **sintoma**; o diagnóstico (SRP? Yagni? acoplamento?) é **humano**.`,
  concepts: [
    { term: 'Code smell', def: 'Indício superficial no código que sugere um problema de design mais profundo, sem ser necessariamente um erro.' },
    { term: 'Bloater', def: 'Família de smells em que o código cresce demais (método longo, classe grande, parâmetros demais).' },
    { term: 'Obsessão por primitivos', def: 'Uso de tipos primitivos para conceitos de domínio que mereceriam objetos de valor.' },
    { term: 'Shotgun surgery', def: 'Smell em que uma única mudança exige editar muitos lugares.' },
    { term: 'Feature envy', def: 'Smell em que uma função usa mais dados de outro objeto do que dos seus.' },
    { term: 'DRY', def: 'Princípio de não repetir conhecimento: cada regra deve ter uma única representação.' },
    { term: 'Clone de código', def: 'Trecho de código duplicado detectado por ferramentas como o jscpd, conforme limites de linhas e tokens.' }
  ],
  examples: R`**Analogia:** um smell é o **cheiro de gás**: não é o vazamento nem o incêndio, mas **pede investigação** (às vezes é só o fogão recém-aceso). Ignorar sempre sai caro; **evacuar o prédio por qualquer cheiro** também.

**Exemplo 1: duplicação medida.** Três funções quase iguais: 4 clones, 21 linhas (75%). Com uma função de campo parametrizado: 0 clones.

**Exemplo 2: ferramenta silenciosa.** Com os limites padrão do jscpd nenhum clone aparece; ajustar para 3 linhas e 15 tokens os revela.

**Exemplo 3: sinais no legado.** O proc tinha método longo, 5 parâmetros, números mágicos, aninhamento, código morto (r = r + 0) e comparações frouxas.`,
  code: [
    { title: 'Código duplicado e a refatoração por extração (JavaScript; jscpd: 4 clones x 0)', lang: 'js', code: R`// Antes: a mesma regra copiada três vezes (só muda o campo somado)
export function totalVendas(pedidos) {
  let total = 0;
  for (const p of pedidos) { if (p.status === 'pago') { total += p.valor; } }
  return Math.round(total * 100) / 100;
}
export function totalFretes(pedidos) { /* idêntica, com p.frete */ }
export function totalImpostos(pedidos) { /* idêntica, com p.imposto */ }

// Depois: o conhecimento "só pedidos pagos, em centavos" mora em um lugar
export const somarPagos = (pedidos, campo) =>
  Math.round(pedidos.filter((p) => p.status === 'pago').reduce((t, p) => t + p[campo], 0) * 100) / 100;
export const totalVendas = (pedidos) => somarPagos(pedidos, 'valor');
export const totalFretes = (pedidos) => somarPagos(pedidos, 'frete');
export const totalImpostos = (pedidos) => somarPagos(pedidos, 'imposto');`, notes: [{ l: '11', t: 'A regra de negócio (pagos e centavos) agora existe uma só vez.' }, { l: '13', t: 'As funções antigas continuam existindo como casos de uso nomeados.' }] },
    { title: 'Medindo duplicação com o jscpd (shell; limites ajustados)', lang: 'bash', code: R`# sem informar limites (padrão da ferramenta): 0 clones (os trechos diferem em um token)
npx jscpd smells/duplicado.mjs --reporters console

# limites reduzidos: 4 clones, 21 linhas (75%), 94 tokens (62,67%)
npx jscpd smells/duplicado.mjs --min-lines 3 --min-tokens 15 --reporters console

# versão com função extraída: 0 clones
npx jscpd smells/unificado.mjs --min-lines 3 --min-tokens 15 --reporters console`, notes: [{ l: '1', t: 'Padrão silencioso: calibre antes de confiar.' }, { l: '5', t: 'Medido no laboratório (jscpd 5.4.3).' }] },
    { title: 'Inveja de recurso e a função movida (JavaScript)', lang: 'js', code: R`// Smell: calcularTotalDoCliente usa mais dados de "pedido" do que do próprio cliente
function calcularTotalDoCliente(cliente) {
  return cliente.pedidos.reduce((t, p) => t + p.itens.reduce((s, i) => s + i.preco * i.qtd, 0) - p.desconto, 0);
}

// Refatoração: mover o cálculo para quem tem os dados
const totalDoPedido = (p) => p.itens.reduce((s, i) => s + i.preco * i.qtd, 0) - p.desconto;
const totalDoCliente = (cliente) => cliente.pedidos.reduce((t, p) => t + totalDoPedido(p), 0);`, notes: [{ l: '2', t: 'A função navega nos detalhes internos de pedido (cadeia de acessos).' }, { l: '7', t: 'O cálculo do pedido vive junto do pedido.' }] }
  ],
  bestPractices: ['Trate smells como hipóteses e avalie o custo de mudança antes de agir.', 'Unifique duplicação de conhecimento, mas tolere duplicação acidental (regra dos três).', 'Calibre ferramentas com exemplos conhecidos (limites do jscpd) e revise os achados.', 'Priorize hotspots: código muito alterado e complexo.', 'Associe cada smell a uma refatoração do catálogo e faça passos pequenos com testes.', 'Remova código morto; o Git guarda o histórico.', 'Aplique o mesmo cuidado aos smells dos testes.'],
  mistakes: ['Confundir smell com bug ou perseguir contagem de avisos.', 'Unificar duplicação acidental criando abstrações cheias de parâmetros.', 'Confiar em uma ferramenta com limites padrão sem verificar se ela detecta algo conhecido.', 'Refatorar código estável e sem alterações em vez de hotspots.', 'Introduzir generalidade especulativa "para o futuro".', 'Usar herança só para reaproveitar código (herança recusada).'],
  market: R`Identificar smells e **justificar** a refatoração é o que se pratica em **code review**; ferramentas como **SonarQube**, **CodeClimate** e **jscpd** entram em **pipelines de qualidade**, e a capacidade de **priorizar** (hotspots, custo de mudança) distingue seniores.`,
  summary: R`Smells são sinais de problema de design (não bugs), agrupados em bloaters, abusadores de OO, impedidores de mudança, dispensáveis e acopladores, cada qual com refatorações associadas. Medido (jscpd 5.4.3): três funções copiadas tiveram 4 clones, 21 linhas (75%) e 94 tokens (62,67%); a versão extraída teve 0, com os mesmos resultados (4 testes). Sem informar limites o jscpd não detectou nada, porque os trechos diferem em um token: calibre as ferramentas. Distinga duplicação de conhecimento (unificar) de duplicação acidental (tolerar) e priorize hotspots.`,
  refs: [REF.refGuruSmells, REF.fowlerCodeSmell, REF.fowlerRefactoring, REF.jscpd, REF.fowlerYagni, REF.eslintMaxDepth],
  cards: [
    { q: 'O que é um code smell?', a: 'Um indício superficial de problema de design que pede investigação; o código funciona, mas custa mais para mudar.' },
    { q: 'Por que o jscpd não detectou clones com os limites padrão?', a: 'Os trechos diferem em um token e os blocos iguais ficam abaixo do mínimo padrão; reduzir para 3 linhas e 15 tokens revelou 4 clones.' },
    { q: 'Quando não unificar código parecido?', a: 'Quando a semelhança é acidental e as razões de mudança são diferentes; unificar cria acoplamento falso (regra dos três).' },
    { q: 'Como priorizar smells?', a: 'Pela frequência de mudança e complexidade (hotspots); smells em código estável raramente valem o esforço.' }
  ]
}
];
