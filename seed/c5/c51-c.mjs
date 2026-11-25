// C5.1 — Clean Code e SOLID. Aula 5 (Technical Debt) e projeto integrador.
import { REF } from './c51-a.mjs';
const R = String.raw;

export const lessonsC = [
{
  id: 'cln-05', moduleId: 'm3', order: 5, minutes: 75, tags: ['dívida técnica', 'juros', 'priorização', 'hotspots', 'planejamento', 'comunicação'],
  title: 'Technical Debt: tipos, juros e payback, como registrar, priorizar, pagar e comunicar ao negócio',
  objectives: ['Explicar a metáfora da dívida técnica (principal, juros) e o quadrante deliberada x inadvertida, prudente x imprudente', 'Reconhecer as formas de dívida (código, testes, arquitetura, documentação, dependências, infraestrutura)', 'Estimar juros e payback com um modelo simples e priorizar a dívida que realmente custa', 'Registrar a dívida de forma rastreável (backlog, ADR, TODO com tíquete)', 'Escolher estratégias de pagamento (escoteiro, capacidade fixa, Strangler) e prevenir novas dívidas', 'Comunicar dívida técnica em termos de risco, prazo e custo para quem decide'],
  intro: R`**Dívida técnica** é a metáfora de Ward Cunningham: pegar um **atalho** no design **acelera hoje** e **cobra juros depois**, na forma de **mudanças mais lentas e arriscadas**. Nem toda dívida é ruim (pode ser uma **decisão consciente**), mas **dívida invisível** e **sem plano** vira falência técnica. Nesta aula você vai **quantificar**: um modelo simples (dados **hipotéticos**) mostra que um módulo legado alterado **8 vezes por mês** com **90 min extras** por mudança **custa 12 h/mês** e se **paga em 2 meses**, enquanto um módulo feio **que ninguém altera** **nunca se paga**.`,
  theory: R`### A metáfora e seus limites
- **Principal**: o trabalho de **refazer** o que foi feito às pressas (esforço de pagar);
- **Juros**: o **custo recorrente** de conviver com ele (cada mudança fica **mais lenta**, mais **arriscada**, com mais **defeitos**);
- **Atraso na quitação** aumenta os juros: as mudanças **se acumulam** sobre a base ruim.
**Limites da metáfora:** a dívida financeira é **conhecida e contratada**; a técnica é muitas vezes **invisível** e **involuntária**. E o "principal" é **incerto** (não sabemos o esforço real até começar).

### O quadrante da dívida (Fowler)
| | **Imprudente** | **Prudente** |
|---|---|---|
| **Deliberada** | "Não temos tempo para design" (sem plano de pagar) | "Entregamos agora e **lidamos com as consequências**" (decisão consciente, com plano) |
| **Inadvertida** | "O que é camada?" (falta de conhecimento) | "Agora sabemos como deveríamos ter feito" (aprendizado) |
A **deliberada e prudente** é **ferramenta de negócio** legítima (um protótipo, uma janela de mercado), **desde que registrada e com plano**. A **inadvertida e prudente** é **inevitável**: o entendimento melhora com o tempo.

### Tipos de dívida
- **Código**: smells, duplicação, complexidade (aulas anteriores);
- **Testes**: cobertura baixa, testes frágeis ou lentos, falta de testes de integração;
- **Arquitetura/design**: acoplamento, módulos sem fronteira, **monólito sem modularidade**;
- **Documentação e conhecimento**: ausência de ADRs, "só o fulano sabe";
- **Dependências**: bibliotecas desatualizadas, **fim de vida** (Node, frameworks), vulnerabilidades conhecidas;
- **Infraestrutura e build**: pipelines lentos, ambientes manuais, deploy arriscado;
- **Dados**: esquemas legados, migrações adiadas.
**Dívida de dependências** tem **prazo externo** (fim de suporte): ela **vence** mesmo que você ignore.

### Medir: juros e payback
Medir dívida é **estimar o custo de mudar**, não contar avisos:
- **Sinais objetivos**: **frequência de mudança** (churn) do arquivo (Git), **complexidade**, **defeitos** ligados a ele, **tempo de ciclo** das tarefas que o tocam, **tempo de CI**, **incidentes**;
- **Hotspots** = **muita mudança × muita complexidade**: ali o juro é alto;
- **Modelo simples** (usado no laboratório): **juros/mês** = mudanças por mês × minutos extras por mudança ÷ 60; **payback (meses)** = esforço em horas ÷ juros por mês.
**Medido (laboratório, dados hipotéticos, 8 h por dia):**
| Item | Juros (h/mês) | Esforço (h) | Payback |
|---|---|---|---|
| §proc-legado-pedidos§ (3 dias; 8 mudanças/mês; 90 min extras) | **12** | 24 | **2 meses** |
| §testes-lentos-ci§ (2 dias; 60 mudanças/mês; 6 min extras) | **6** | 16 | **2,7 meses** |
| §relatorios-duplicados§ (1 dia; 3 mudanças/mês; 40 min extras) | **2** | 8 | **4 meses** |
| §modulo-estavel-feio§ (5 dias; **0** mudanças/mês) | **0** | 40 | **nunca** |
A ordem de pagamento sai do **payback**, **não da "feiura"**: o módulo mais feio **não vale** o esforço, porque **ninguém o altera**. **Atenção**: os números **são ilustrativos** (valores inventados para o exercício); em projetos reais, **calibre com dados** do seu repositório e do seu quadro de tarefas, e **trate o resultado como estimativa**.

### Registrar
- **Backlog**: cada dívida como **item** com **descrição, impacto, onde, esforço estimado, juros observados e gatilho** (qual mudança a traz de volta);
- **Marcador no código** (§// DÍVIDA(PROJ-123): ...§) **com tíquete**: **TODO sem dono** vira lixo;
- **ADR**: registre **por que** o atalho foi tomado e **quando revisar** (aula adr);
- **Visibilidade**: um painel simples (itens, juros, idade) que o time **revisa** a cada ciclo.

### Priorizar
1. **Juros altos** (hotspots, bugs recorrentes, bloqueio de entregas);
2. **Risco** (segurança, perda de dados, fim de suporte de dependência);
3. **Esforço baixo** primeiro quando o juro é parecido;
4. **Alinhar com o roadmap**: pagar **onde você vai mexer** (refatoração preparatória);
5. **Ignorar conscientemente** o que **não custa nada** (módulo estável): registre e **deixe**.

### Pagar
- **Regra do escoteiro** e **refatoração oportunista**: pague **ao passar** por ali;
- **Capacidade fixa** (por exemplo, **10% a 20%** de cada ciclo) para dívida, **como política** (valores usuais citados na prática, não regra: **ajuste** ao seu contexto);
- **Strangler Fig** para dívida **estrutural** (substituir aos poucos);
- **Atualizações contínuas** de dependências (bots como Renovate e Dependabot) para **evitar saltos grandes**;
- **Evite** o "sprint de refatoração" **sem resultado mensurável**: vira **reescrita** disfarçada e **frustra** o negócio.

### Prevenir
- **Definição de pronto** que inclui **testes, revisão, documentação mínima e linter**;
- **Portões de qualidade** no CI (aulas C5.6 e C5.8): **complexidade**, **duplicação**, **cobertura** em **código novo**;
- **Revisão de código** com foco em **design**, não só em estilo;
- **Decisões registradas** (ADR) e **revisadas** quando o contexto muda;
- **Planejamento realista**: pressão **constante** de prazos com **orçamento zero** para qualidade **garante** acúmulo.

### Comunicar ao negócio
Pessoas de produto e gestão **não compram "refatoração"**; compram **risco, prazo e custo**:
- **Traduza** juros em **tempo**: "cada mudança nesse módulo leva **90 minutos a mais**; são **12 horas por mês**";
- **Mostre o retorno**: "**3 dias** hoje, **payback em 2 meses**";
- **Conecte a metas**: velocidade de entrega, **incidentes**, **segurança**, **contratação** (novas pessoas levam semanas para entender o módulo);
- **Ofereça opções** (pagar tudo, pagar pela metade, conviver) com **consequências**;
- **Evite** ameaçar com catástrofe; **use dados** e **histórias reais** (um incidente que a dívida causou).

### Armadilhas
- **Dívida como desculpa** para qualquer código ruim (a **dívida real** é **escolha consciente**);
- **Contar** itens de dívida como meta;
- **Pagar a dívida errada** (a mais feia, não a mais cara);
- **Reescrever** quando bastaria **extrair e testar**;
- **Esquecer a dívida social**: conhecimento concentrado em uma pessoa (*bus factor*).`,
  concepts: [
    { term: 'Dívida técnica', def: 'Custo futuro de retrabalho causado por escolhas de design ou implementação que priorizaram a velocidade imediata.' },
    { term: 'Juros', def: 'Custo recorrente de conviver com a dívida: mudanças mais lentas, arriscadas e com mais defeitos.' },
    { term: 'Principal', def: 'Esforço necessário para eliminar a dívida (refazer corretamente).' },
    { term: 'Hotspot', def: 'Parte do código com muita mudança e alta complexidade, onde os juros da dívida são mais altos.' },
    { term: 'Payback', def: 'Tempo necessário para o esforço de pagar a dívida se compensar pela redução dos juros.' },
    { term: 'Quadrante da dívida', def: 'Classificação de Fowler da dívida em deliberada ou inadvertida e prudente ou imprudente.' },
    { term: 'Bus factor', def: 'Número de pessoas cuja saída paralisaria o projeto por concentrarem conhecimento crítico.' }
  ],
  examples: R`**Analogia:** a dívida técnica é o **encanamento improvisado de uma casa**: funciona e permite morar já, mas **cada reforma** nos cômodos vizinhos custa mais e **vaza** com frequência; a conta é **os juros**. Trocar o encanamento do **banheiro que se usa todo dia** compensa rápido; o do **quarto de visitas** que ninguém abre **não**.

**Exemplo 1: priorização.** O módulo de pedidos legado (12 h/mês de juros, 24 h de esforço) se paga em 2 meses; o módulo estável feio nunca se paga.

**Exemplo 2: comunicação.** "São 90 minutos a mais por mudança, 8 vezes por mês: 12 h/mês. Corrigir leva 3 dias e se paga em 2 meses."

**Exemplo 3: registro.** Um comentário DÍVIDA(PROJ-123) com tíquete e gatilho de revisão, mais um ADR com o porquê.`,
  code: [
    { title: 'Modelo de juros e payback da dívida técnica (JavaScript; dados hipotéticos; executado no laboratório)', lang: 'js', code: R`export function priorizar(itens, horasPorDia = 8) {
  return itens.map((i) => {
    const jurosHorasMes = (i.mudancasPorMes * i.minutosExtraPorMudanca) / 60;
    const esforcoHoras = i.esforcoDias * horasPorDia;
    const paybackMeses = jurosHorasMes === 0 ? Infinity : esforcoHoras / jurosHorasMes;
    return { id: i.id, jurosHorasMes: Math.round(jurosHorasMes * 100) / 100, esforcoHoras, paybackMeses: paybackMeses === Infinity ? null : Math.round(paybackMeses * 10) / 10 };
  }).sort((a, b) => (a.paybackMeses ?? Infinity) - (b.paybackMeses ?? Infinity) || a.id.localeCompare(b.id));
}
// Saída medida: proc-legado-pedidos 12 h/mês, 24 h, 2 meses | testes-lentos-ci 6, 16, 2.7 | relatorios-duplicados 2, 8, 4 | modulo-estavel-feio 0, 40, nunca`, notes: [{ l: '3', t: 'Juros = mudanças por mês × minutos extras ÷ 60.' }, { l: '5', t: 'Sem mudanças (juros zero) o payback é infinito: não vale pagar agora.' }] },
    { title: 'Registrando a dívida no código e no backlog (JavaScript e Markdown)', lang: 'js', code: R`// DÍVIDA(PEDIDOS-212): calcularFrete usa tabela fixa por UF; ao integrar a transportadora X
// (previsto para o 1º trimestre), trocar por consulta à API. Juros: ~90 min a cada mudança de regra.
// ADR-0007 explica por que a tabela fixa foi aceita (prazo da campanha). Revisar quando PEDIDOS-198 entrar.
export function calcularFrete(valor, uf) { /* ... */ }

/*
 Item de backlog (modelo)
 Título: Substituir tabela fixa de frete
 Impacto: cada mudança de regra de frete leva ~90 min a mais; 8 mudanças/mês
 Esforço: 3 dias | Juros: 12 h/mês | Payback: 2 meses
 Gatilho: integração com a transportadora X
*/`, notes: [{ l: '1', t: 'Marcador com tíquete e gatilho: não é um TODO anônimo.' }, { l: '3', t: 'O porquê da decisão mora em um ADR.' }] },
    { title: 'Mapa de hotspots com o Git (shell; mudança × tamanho; exemplo de comando, não executado neste laboratório)', lang: 'bash', code: R`# arquivos mais alterados nos últimos 6 meses (churn)
git log --since="6 months ago" --name-only --pretty=format: -- src | sort | uniq -c | sort -rn | head -20

# cruzar com a complexidade (ex.: ESLint com a regra complexity) para achar os hotspots
npx eslint src -f json | node -e "..."   # lista as funções acima do limite por arquivo`, notes: [{ l: '2', t: 'Churn é o primeiro sinal; combine com complexidade.' }, { l: '5', t: 'Pseudocomando: o laboratório não é um repositório Git.' }] }
  ],
  bestPractices: ['Registre cada dívida com impacto, esforço, juros e gatilho; marque o código com o tíquete.', 'Priorize por juros e payback (hotspots), não pela feiura.', 'Pague onde você vai mexer (refatoração preparatória) e reserve capacidade fixa no ciclo.', 'Use Strangler para dívida estrutural e atualize dependências continuamente.', 'Comunique em tempo, risco e custo, com opções e consequências.', 'Previna com definição de pronto, portões de qualidade e ADRs.', 'Aceite conscientemente a dívida que não custa nada.'],
  mistakes: ['Usar "dívida técnica" como desculpa para código ruim sem decisão consciente.', 'TODOs sem dono, tíquete ou gatilho.', 'Pagar a dívida mais feia em vez da mais cara.', 'Sprints de refatoração sem resultado mensurável.', 'Ignorar o fim de suporte de dependências.', 'Tratar números ilustrativos como verdade (calibrar com dados reais).'],
  market: R`Priorizar e **justificar** dívida técnica diante do produto é competência de **tech leads** e **engenheiras e engenheiros sênior**; fala-se de **juros, risco e payback** com gestão, e ferramentas como **SonarQube**, painéis de **DORA** e análise de **hotspots** apoiam a conversa.`,
  summary: R`Dívida técnica é o custo futuro de atalhos de design (principal e juros). O quadrante de Fowler separa dívida deliberada de inadvertida e prudente de imprudente. Meça por juros (mudanças × tempo extra) e payback, não por contagem de avisos; no modelo do laboratório (dados hipotéticos) o módulo de pedidos legado custa 12 h/mês e se paga em 2 meses, enquanto o módulo feio sem mudanças nunca se paga. Registre com tíquete e ADR, priorize hotspots, pague onde vai mexer e comunique em risco, prazo e custo. Os números são ilustrativos.`,
  refs: [REF.fowlerTechDebt, REF.fowlerDebtQuadrant, REF.fowlerRefactoring, REF.cleanCode, REF.legacyBook],
  cards: [
    { q: 'O que são juros e principal na dívida técnica?', a: 'Principal é o esforço de refazer corretamente; juros são o custo recorrente de conviver com a dívida em cada mudança.' },
    { q: 'Por que o módulo feio que ninguém altera pode ficar como está?', a: 'Seus juros são zero (nenhuma mudança paga o custo); o payback é infinito, então pagar a dívida não compensa.' },
    { q: 'Como pedir tempo para pagar dívida ao negócio?', a: 'Traduzindo juros em horas, risco e prazo, mostrando o payback e oferecendo opções com consequências.' },
    { q: 'O que significa dívida deliberada e prudente?', a: 'Decisão consciente de entregar agora com plano de lidar com as consequências, registrada para ser paga depois.' }
  ]
}
];
