// C5.6 — Contrato, carga e análise estática. Aulas 3 e 4 (testes de estresse; coverage e análise estática).
import { REF } from './c56-a.mjs';
const R = String.raw;

export const REF2 = {
  c8: { title: 'c8 — code coverage using V8', url: 'https://github.com/bcoe/c8', kind: 'ferramenta' },
  stryker: { title: 'Stryker Mutator — Documentation', url: 'https://stryker-mutator.io/docs/', kind: 'doc' },
  tsJs: { title: 'TypeScript — Type checking JavaScript files', url: 'https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html', kind: 'doc' },
  depCruiser: { title: 'dependency-cruiser', url: 'https://github.com/sverweij/dependency-cruiser', kind: 'ferramenta' },
  eslint: { title: 'ESLint — Getting Started', url: 'https://eslint.org/docs/latest/use/getting-started', kind: 'doc' },
  sloWorkbook: { title: 'Google SRE Workbook — Implementing SLOs', url: 'https://sre.google/workbook/implementing-slos/', kind: 'livro' }
};

export const lessonsB = [
{
  id: 'tav-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['estresse', 'saturação', 'fila', 'ramping-arrival-rate', 'iterações descartadas', 'gargalo'],
  title: 'Testes de estresse: achar o ponto de saturação, entender a degradação por fila e planejar a proteção',
  objectives: ['Distinguir teste de estresse de teste de carga e definir o que se procura (joelho da curva, modo de falha, recuperação)', 'Executar um estresse em taxa crescente com k6 (ramping-arrival-rate)', 'Interpretar sinais de saturação: vazão estagnada, latência explodindo, iterações descartadas e a lei de Little', 'Diferenciar degradação por fila de erros HTTP e entender por que o Node de uma thread satura', 'Escolher respostas: reduzir o custo, escalar, aplicar backpressure, rate limit e load shedding', 'Definir critérios de aceitação e testar a recuperação'],
  intro: R`O **teste de estresse** leva o sistema **além da carga esperada** para descobrir **onde ele satura**, **como degrada** e **se se recupera**. No laboratório, o **estresse** aumentou a taxa de chegada **de 10 até 100 iterações/s** sobre um endpoint de **~24 ms de CPU** em um **Node de thread única**: a **vazão estagnou em 35,5 req/s**, o **p95 foi a 4,59 s** (máximo **6,69 s**), **119 iterações foram descartadas**, **0% das respostas falharam** (todas foram **200**) e o **k6 saiu com código 99** (threshold violado). **O sistema não "quebrou": ele enfileirou.**`,
  theory: R`### O que se procura
- **Ponto de saturação (joelho da curva):** **até** onde a **latência** fica **estável**; **depois**, **cresce rápido** com a **carga**;
- **Modo de falha:** **como** o sistema se comporta **além do limite**: **fila e latência** (degradação **graciosa**), **erros 5xx/timeouts** (degradação **brusca**), **travamento**, **perda de dados**, **efeito cascata**;
- **Recuperação:** **voltando** a carga ao normal, **o sistema se recupera sozinho** (**sem reinício**)?
- **Gargalo:** **qual recurso** satura **primeiro** (CPU, memória, conexões de banco, threads, rede, **fila**, serviço **externo**).

### O cenário do laboratório
§carga/estresse.js§: **§ramping-arrival-rate§** (**modelo aberto**, aula tav-02) com §startRate: 10§ e estágios: **10/s por 5 s**, **30/s por 5 s**, **60/s por 8 s**, **100/s por 8 s** (**26 s**), §preAllocatedVUs: 50§, §maxVUs: 150§, **todas** as requisições a §GET /relatorio?n=200000§ (**~24 ms** de CPU **síncrona**: medido por §curl§ em **0,024 s** depois do aquecimento) e **threshold** §p(95)<500§ ms.
**Capacidade teórica:** **uma thread**: **1 / 0,024 s ≈ 41 req/s**. **Medido:** **vazão total 35,5 req/s** (**média sobre 29 s**, incluindo a **fase de rampa** com **menos** de 41 e o **escoamento da fila** no fim): **coerente** com **a capacidade**.

### Medido
| Métrica | Valor |
|---|---|
| Requisições concluídas | **1.030** |
| **Vazão média** | **35,5 req/s** |
| Latência **média** | **875,5 ms** |
| **Mediana** | 327,0 ms |
| **p95** | **4.588,8 ms** |
| **Máximo** | **6.690,2 ms** |
| Falhas HTTP | **0,00%** (todas **200**) |
| Iterações **descartadas** | **119** |
| VUs máximos | **150** (o **teto** configurado) |
| Saída do k6 | **99** (threshold §p(95)<500§ violado) |
**Leitura:**
1. **Nenhuma falha de HTTP:** o **Node aceitou todas** as conexões e **enfileirou** o trabalho (**o *event loop* executa um relatório por vez**); a **degradação** apareceu **só como latência**: **sem monitorar latência**, um **painel de "taxa de erro"** diria que **"está tudo bem"**;
2. **Vazão estagnada** (~35 a 41 req/s) **enquanto a carga chegou a 100/s**: **sinal clássico** de **saturação**: **mais carga não vira mais trabalho feito**;
3. **Latência explode:** com **chegada > capacidade**, **a fila cresce linearmente** e a **latência** é **fila / capacidade**: **a 100 req/s** (59 acima de ~41/s) **a fila acumula ~59 req/s** e **cada requisição espera** o **resto da fila**: **segundos**;
4. **Iterações descartadas (119):** o **k6** **não pôde iniciar** iterações porque **os 150 VUs** ficaram **ocupados esperando respostas** (**lei de Little:** **concorrência = taxa × latência**; com **latência de ~4 s** e **taxa de 100/s**, **precisaria de ~400 VUs**). **Descartar** é **sinal do gerador** de que **o serviço não acompanha**; **aumentar §maxVUs§ só mudaria quantas requisições ficam presas**;
5. **p95 ≫ mediana** (4,6 s x 0,33 s): **cauda enorme**: as requisições **do fim** da rampa **esperaram a fila**.
**Ressalva honesta:** **gerador e servidor no mesmo host** e **uma execução**: **os números absolutos mudam** em outro ambiente; **o padrão** (vazão estagnada, latência explodindo, **0% de erros**) **é robusto**.

### Por que o Node satura assim
O **Node** executa **JavaScript em uma thread** (C4.1): **trabalho síncrono** (laços de CPU, JSON gigantes, regex catastrófica, criptografia síncrona) **bloqueia** **todas** as requisições. **I/O assíncrono** (banco, rede) **não bloqueia**. **Consequências:** **um endpoint pesado** **piora o p95 de todos os outros** (no laboratório o §/saude§ também espera). **Respostas:** **mover** CPU para **worker threads**/**processos** (C4.1), **cluster** (vários processos), **otimizar** o algoritmo, **cache**, **fila** para trabalho longo (C4.5).

### Respostas à saturação
| Estratégia | Como | Efeito |
|---|---|---|
| **Reduzir o custo por requisição** | otimizar o código, **cache**, índices, evitar trabalho síncrono | **sobe a capacidade** |
| **Escalar** | **mais processos/instâncias** + balanceador (**horizontal**) ou **máquina maior** (**vertical**) | **sobe a capacidade** (custo) |
| **Backpressure** | **limitar** a fila (**tamanho máximo**), **recusar** com **503** e **Retry-After** quando cheia | **protege** o serviço e **a latência** de quem entra |
| **Rate limit** (C4.3) | **por cliente/chave** (token bucket) | **evita** que **um** cliente **sature** todos |
| **Load shedding** | **descartar** trabalho **de baixa prioridade** sob carga | **preserva** o **essencial** |
| **Timeouts e circuit breakers** | **limitar espera** e **cortar** chamadas a dependências **doentes** (C4.7) | **evita cascata** |
| **Autoscaling** | **escalar** por **CPU/latência/fila** (C6) | **acompanha a demanda** (com **atraso de partida**) |
**Importante:** **fila ilimitada** **parece** estável, mas **só transforma** erro em **latência infinita** e **memória crescente**. **Falhar rápido** (**503** em ms) **costuma ser melhor** que **responder em 30 s** **tarde demais** (o **cliente já desistiu**).

### Conduzindo um estresse com método
1. **Hipótese** ("**a 60 req/s o p95 passa de 500 ms**") e **critérios** de aceitação;
2. **Escada** (**estágios** que **sobem** e **mantêm**) para **achar o joelho**; **observar** CPU, memória, GC, *event loop lag*, conexões (C4.6);
3. **Parar** cedo (§abortOnFail§) quando a **meta** foi **violada** **e** o **ponto** foi **achado**;
4. **Teste de recuperação:** **após o pico**, **volte** à carga **normal** e **meça** o **tempo** para a latência **voltar**;
5. **Pico (*spike*):** **salto** súbito (**10 → 200**/s) para **testar autoscaling, filas e backpressure**;
6. **Resistência (*soak*):** **carga moderada por horas** (**vazamentos**: memória, descritores, conexões);
7. **Registrar** (versão, ambiente, configuração) e **repetir**;
8. **Ambiente isolado** e **avisado** (**sem afetar** outros serviços/usuários; **nunca** estresse **em produção** sem **plano**);
9. **Segurança:** **estresse não é DDoS**: **teste só** o **que é seu** e **com autorização**.

### Como usar o resultado
- **Capacidade por instância** (~**41 req/s** nesse endpoint): **dimensionar** com **folga** (**meta de 60% de utilização**: **latência** sobe **rápido** perto de **100%**: **teoria das filas**);
- **Metas de SLO** (**p95 < X** a **Y req/s**) e **alertas** **por latência e saturação** (**não só erros**);
- **Orçamento de erro** e **política de proteção** (**backpressure/limites**) **decididos antes** do pico;
- **Plano de escala** (**gatilhos** e **limites** de custo).

### Armadilhas
- **Concluir que "não houve erros, está tudo bem"** (**fila** escondeu a **latência**);
- **Aumentar §maxVUs§ para "resolver"** os **descartes** (**mascara** o problema do **servidor**);
- **Testar com um endpoint só** (**mistura real** muda a **capacidade**);
- **Gerador no mesmo host** (**competição de CPU**);
- **Ignorar a recuperação** e **o aquecimento**;
- **Estressar dependências de terceiros** (**cobranças**, **limites** de API).`,
  concepts: [
    { term: 'Teste de estresse', def: 'Teste que leva o sistema além da carga esperada para achar o ponto de saturação, o modo de falha e a recuperação.' },
    { term: 'Saturação', def: 'Estado em que um recurso atinge sua capacidade máxima e a vazão deixa de crescer com a carga.' },
    { term: 'Joelho da curva', def: 'Ponto em que a latência deixa de ser estável e passa a crescer rapidamente com a carga.' },
    { term: 'Backpressure', def: 'Mecanismo que sinaliza a quem envia para reduzir a taxa, limitando filas e recusando trabalho excedente.' },
    { term: 'Load shedding', def: 'Descarte deliberado de trabalho de baixa prioridade sob sobrecarga para preservar o essencial.' },
    { term: 'Iteração descartada', def: 'Iteração do k6 que não pôde começar no modelo aberto por falta de VUs disponíveis.' },
    { term: 'Teste de pico (spike)', def: 'Teste com aumento súbito e curto de carga para verificar elasticidade e proteções.' }
  ],
  examples: R`**Analogia:** a **cozinha com um único cozinheiro** (thread) que leva **24 ms por prato**: até ~41 pratos por segundo, tudo bem; **chegando 100 pedidos por segundo**, ninguém é **recusado** na porta, mas **a fila de comandas cresce** e o último cliente **espera segundos**: **nenhum prato sai errado**, e mesmo assim **o restaurante falhou** na experiência.

**Exemplo 1: vazão estagnada.** Com 100 it/s de chegada, a vazão ficou em 35,5 req/s.

**Exemplo 2: erro invisível.** 0% de falhas HTTP, mas p95 de 4,59 s: só a latência mostrou o problema.

**Exemplo 3: iterações descartadas.** 119 iterações não puderam começar porque os 150 VUs estavam presos esperando respostas.`,
  code: [
    { title: 'Estresse em taxa crescente com k6 (JavaScript do k6; resultado medido: p95 de 4,59 s e saída 99)', lang: 'js', code: R`import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: { estresse: {
    executor: 'ramping-arrival-rate', startRate: 10, timeUnit: '1s', preAllocatedVUs: 50, maxVUs: 150,
    stages: [{ target: 10, duration: '5s' }, { target: 30, duration: '5s' }, { target: 60, duration: '8s' }, { target: 100, duration: '8s' }]
  } },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500'] }
};

export default function () {
  const r = http.get('http://127.0.0.1:4580/relatorio?n=200000', { timeout: '30s' });
  check(r, { 'status 200': (x) => x.status === 200 });
}
// 1030 req | 35,5 req/s | média 875,5 ms | mediana 327 ms | p95 4588,8 ms | máx 6690,2 ms | falhas 0% | descartadas 119 | exit 99`, notes: [{ l: '5', t: 'Taxa de chegada crescente: o gerador não desacelera quando o servidor atrasa.' }, { l: '10', t: 'O threshold de p95 é violado enquanto a taxa de erro continua em zero.' }] },
    { title: 'Backpressure no servidor: recusar cedo em vez de enfileirar sem limite (JavaScript, Express; conceitual, não executado nesta aula)', lang: 'js', code: R`import express from 'express';
const app = express();

const MAX_EM_ANDAMENTO = 8;     // concorrência máxima do endpoint pesado
let emAndamento = 0;

app.get('/relatorio', (req, res) => {
  if (emAndamento >= MAX_EM_ANDAMENTO) {
    res.set('Retry-After', '1');
    return res.status(503).json({ erro: 'sobrecarga: tente novamente' });   // falha rápida, protege a latência
  }
  emAndamento++;
  setImmediate(() => {                       // cede o event loop entre requisições
    try { res.json(calcularRelatorio(Number(req.query.n) || 200000)); }
    finally { emAndamento--; }
  });
});`, notes: [{ l: '8', t: 'Ao atingir o limite, responde 503 em milissegundos em vez de acumular fila.' }, { l: '14', t: 'O contador sempre é decrementado, mesmo com erro.' }] },
    { title: 'Lei de Little e dimensionamento (JavaScript; cálculo)', lang: 'js', code: R`// L = λ × W: concorrência = taxa de chegada × tempo de resposta
const concorrencia = (taxaPorSegundo, latenciaSegundos) => taxaPorSegundo * latenciaSegundos;

concorrencia(50, 0.0039);   // ≈ 0,2 VU em média: a carga de 50 it/s com 3,9 ms de média cabe em poucos VUs
concorrencia(100, 4);       // ≈ 400 VUs: com latência de ~4 s e 100 it/s, os 150 VUs configurados não bastam

// capacidade de uma thread com 24 ms por requisição
const capacidade = 1 / 0.024;                              // ≈ 41,7 req/s
const utilizacao = (taxa) => taxa / capacidade;            // 60% é uma meta comum; perto de 100% a fila explode`, notes: [{ l: '5', t: 'Explica as iterações descartadas: faltaram VUs porque a latência subiu.' }, { l: '10', t: 'Perto de 100% de utilização, pequenas variações causam filas enormes.' }] }
  ],
  bestPractices: ['Procure o joelho da curva com uma escada de taxa e registre o modo de falha e a recuperação.', 'Monitore latência e saturação além da taxa de erro; erros zero não significam saúde.', 'Use o modelo aberto no estresse e interprete as iterações descartadas como sinal do servidor.', 'Escolha entre reduzir custo, escalar, backpressure, rate limit e load shedding e prefira falhar rápido a enfileirar sem limite.', 'Dimensione com folga (por exemplo, 60% de utilização) e defina alertas por latência.', 'Rode em ambiente isolado e autorizado, com gerador em outra máquina e repetição.', 'Teste o pico e a recuperação, não só a rampa.'],
  mistakes: ['Concluir que está tudo bem por não haver erros.', 'Aumentar maxVUs para esconder descartes.', 'Testar um único endpoint e generalizar.', 'Fila ilimitada tratada como solução.', 'Gerador e servidor no mesmo host sem declarar.', 'Estressar produção ou terceiros sem autorização.'],
  market: R`**Saber conduzir e interpretar estresse e pico** (saturação, filas, backpressure) é **competência de SRE, backend sênior e arquitetura**; **"o que acontece com seu serviço a 3x o tráfego?"** é **pergunta clássica** de **entrevista**.`,
  summary: R`O teste de estresse procura o joelho da curva, o modo de falha e a recuperação. No laboratório, uma taxa crescente de 10 a 100 it/s sobre um endpoint de ~24 ms em Node de uma thread resultou em vazão estagnada em 35,5 req/s (capacidade teórica ~41), p95 de 4,59 s, máximo de 6,69 s, 119 iterações descartadas, 0% de falhas HTTP e saída 99: degradou por fila, não por erro. Responda com redução de custo, escala, backpressure, rate limit e load shedding; prefira falhar rápido; use a lei de Little e metas de utilização. Os números vêm de um host e uma execução.`,
  refs: [REF.k6TestTypes, REF.k6Scenarios, REF.k6OpenClosed, REF2.sloWorkbook, REF.k6Docs],
  cards: [
    { q: 'Qual foi o sinal de saturação no laboratório?', a: 'A vazão estagnou em 35,5 req/s (capacidade ~41) enquanto a taxa de chegada subia a 100/s e o p95 foi a 4,59 s.' },
    { q: 'Por que 0% de erros não significa saúde?', a: 'O Node enfileirou o trabalho: a degradação apareceu só como latência; monitore latência e saturação, não só erros.' },
    { q: 'O que explicam as 119 iterações descartadas?', a: 'Os 150 VUs ficaram presos esperando respostas lentas (lei de Little); o servidor, e não o gerador, é o limite.' },
    { q: 'Por que falhar rápido pode ser melhor que enfileirar?', a: 'Uma fila ilimitada só troca erro por latência e memória crescentes; recusar cedo (503 com Retry-After) protege quem está sendo atendido.' }
  ]
},
{
  id: 'tav-04', moduleId: 'm2', order: 4, minutes: 85, tags: ['cobertura', 'c8', 'mutação', 'Stryker', 'análise estática', 'TypeScript', 'ESLint', 'dependency-cruiser'],
  title: 'Code coverage e análise estática: c8, mutação com Stryker, tipos com tsc, lint e regras de arquitetura',
  objectives: ['Medir cobertura com c8 e interpretar linhas, ramos e funções', 'Executar teste de mutação com Stryker, ler a pontuação e reconhecer mutantes equivalentes', 'Usar o TypeScript para checar JavaScript com JSDoc (checkJs e strict)', 'Aplicar ESLint e dependency-cruiser para qualidade e fronteiras de arquitetura', 'Combinar as ferramentas em portões de CI sem virar meta cega', 'Saber o que a análise estática não encontra (e o que ficou sem execução: SAST e SonarQube)'],
  intro: R`**Cobertura** diz o que os testes **executam**; **mutação** diz se eles **verificam**; **análise estática** encontra **defeitos sem executar** o código. No laboratório: o **c8** deu **100% das linhas**, **92,85% dos ramos** e **75% das funções**; o **Stryker 10.1.1** deu **69,44%** de pontuação de mutação (**6 sobreviventes e 5 sem cobertura**) e, **após testes de fronteira**, **97,22%** (**1 sobrevivente**, que é **equivalente**); o **TypeScript 7.0.2** achou **6 erros** em JavaScript com JSDoc, o **dependency-cruiser 18.9.0**, **2 violações** de arquitetura (saída 2) e o **ESLint**, **7 problemas**.`,
  theory: R`### Cobertura com c8
O **c8** usa a **cobertura nativa do V8** (**sem instrumentar** o código): §c8 node --test ...§. **Métricas:** **linhas** (quais **foram executadas**), **ramos** (**cada lado** de um §if§, §?:§, §&&§), **funções** (**foram chamadas?**), **instruções**. **Medido** (§analise/calculos.mjs§ com **testes dos casos "felizes"**): **100% das linhas**, **92,85% dos ramos**, **75% das funções** (§formatarMoeda§ **nunca chamada**; **linha 10** com um **ramo não coberto**). **Relatórios:** texto, **HTML**, **lcov** (para **CI/painéis**). **Limiares** (§--check-coverage --lines 90 --branches 85§) **falham** o job.
**Lembrete (tst-06):** **cobertura ≠ qualidade**: **mede execução**, **não verificação**; **100%** é **fácil** com testes **sem asserções**. **Uso saudável:** **achar código sem teste**, **alarme para código novo**.

### Teste de mutação com Stryker
O **Stryker** **altera** o código (**mutantes**: trocar §>=§ por §>§, remover um §if§, inverter um booleano, trocar §+§ por §-§) e **roda os testes**: se **algum falha**, o mutante **morreu** (bom); se **todos passam**, **sobreviveu** (**falta verificação**); se **nenhum teste cobre** a linha, é **"sem cobertura"**. **Pontuação** = **mortos ÷ total** (**ou mortos ÷ cobertos**, nas duas colunas).
**Medido (§analise/calculos.mjs§: 36 mutantes, runner Vitest, §coverageAnalysis: perTest§, 16 s):**
| Execução | Pontuação | Mortos | Sobreviveram | Sem cobertura |
|---|---|---|---|---|
| **Testes "felizes"** | **69,44%** | 25 | **6** | **5** |
| **+ testes de fronteira** | **97,22%** | **35** | **1** | **0** |
**Sobreviventes típicos antes:** §idade >= 18§ → §idade > 18§ (**ninguém testou 18**), §peso <= 0§ → §peso < 0§ (**peso 0**), **remover o §throw§**. **Depois** dos testes de fronteira (**1000, 999,99, 500, 499,99, 0,01, 18, 17, peso 0 e -1, 5 e 6**), **sobrou 1**: **§peso <= 5§ → §peso < 5§**: **mutante equivalente**: **para §peso = 5§** **os dois lados dão o mesmo frete** (§10 + (5-5)*2 = 10§): **nenhum teste pode distingui-lo**. **Mutantes equivalentes** **existem**: **analise** e **ignore** (§// Stryker disable§) **com justificativa**; **100% raramente é a meta**.
**Custos:** **lento** (roda a suíte **por mutante**: use §perTest§, **incremental**, **só código alterado**, **módulos críticos**); **ruído** (equivalentes); **configuração**. **Quando usar:** **regras de negócio críticas** (preços, impostos, autorização), **bibliotecas**; **não** em **todo** o código **em todo PR**.

### TypeScript como verificador de JavaScript
§tsc --noEmit --allowJs --checkJs --strict§ **verifica tipos** em **JavaScript com JSDoc** (§/** @param {number} preco */§) **sem migrar** o projeto; §// @ts-check§ **por arquivo**. **Medido** (§analise/tipos.js§, **TypeScript 7.0.2**, **6 erros**):
- §TS18048: 'cliente.email' is possibly 'undefined'§ (**campo opcional** acessado **sem verificar**: **bug real** que **só quebraria em execução**);
- §TS2345: Argument of type 'string' is not assignable to parameter of type 'number'§ (§subtotal('10', 2)§);
- §TS2322: Type 'number' is not assignable to type 'string'§ **×3** (§contar([1, 2, 3])§ onde se esperava §string[]§);
- §TS2322: Type 'string' is not assignable to type 'number'§ (§@type {number}§ recebendo §'trinta'§).
**Vantagens:** **pega erros de tipo e de nulos** **antes** de executar; **documenta** contratos. **Limites:** **não** garante **dados externos** (**JSON** de uma API continua precisando de **validação em execução**: Zod/Pydantic); **tipos podem mentir** (§any§, asserções §as§). **Adoção gradual:** **estrito em arquivos novos**.

### Lint: ESLint
**Regras** que **encontram erros** (§no-undef§, §no-unused-vars§, §eqeqeq§, §no-unreachable§), **más práticas** (§no-var§, §prefer-const§, §no-nested-ternary§) e **complexidade** (§complexity§, cln-01). **Medido** (§analise/lint-alvo.mjs§): **7 problemas** (**5 erros** e **2 avisos**): §no-var§, §prefer-const§, §no-unused-vars§, §eqeqeq§, §no-undef§ (**§valorInexistente§: um bug real, **ReferenceError** em execução), §complexity§ (**10 > 5**) e §no-nested-ternary§; **2 corrigíveis** com §--fix§. **Prática:** **erros** quebram o CI; **avisos** são **dívida acompanhada**; **formatação** fica com **Prettier**; **regras por pasta**; **plugins** (§eslint-plugin-security§, §n§, §import§) — **não executados** aqui.

### Regras de arquitetura: dependency-cruiser
**Dependências** entre módulos **são arquitetura**; **sem verificação** elas **apodrecem**. O **dependency-cruiser** **lê os imports** e **aplica regras** (§forbidden§): **camadas** (§dominio§ **não** importa §infra§), **ciclos** (§circular§), **módulos órfãos**, **dependências de dev em produção**. **Medido** (§arq/§: 4 módulos, 4 dependências): **2 violações**, **saída 2**:
- §no-circular§: §arq/app/notificacao.mjs → arq/app/servico.mjs → arq/app/notificacao.mjs§ (**ciclo**);
- §dominio-nao-depende-de-infra§: §arq/dominio/pedido.mjs → arq/infra/banco.mjs§ (**viola a inversão de dependência**: SOLID/DIP, cln-02 e pat-04).
**Uso:** **portão de CI** (**falha** em **nova** violação), **gerar o grafo** (§--output-type dot§) para **documentar** (C5.3), **evolução**: **registrar violações existentes** (baseline) e **impedir novas**. **Em Java:** ArchUnit; **em Python:** import-linter.

### Juntando: portões de qualidade
| Portão | Ferramenta | Critério sugerido |
|---|---|---|
| **Estilo e erros** | ESLint (+ Prettier) | **0 erros**; avisos **acompanhados** |
| **Tipos** | tsc §--checkJs§ ou TypeScript | **0 erros** em arquivos marcados |
| **Arquitetura** | dependency-cruiser | **0 violações novas** |
| **Cobertura** | c8/Vitest | **alarme** para código **novo** (ex.: ≥ 80%), **não** meta global |
| **Mutação** | Stryker | **nos módulos críticos** (ex.: ≥ 80%), **noturno/incremental** |
| **Segurança** | SAST, dependências (C7) | **sem críticos** |
**Princípios:** **automatize**, **falhe rápido** (estáticos **primeiro**: **segundos**), **meça tendência** (**não** só o número), **evite que a métrica vire meta** (**Goodhart**, tst-06), **trate resultados como sinais** (**revisão humana**).

### O que a análise estática não encontra
**Defeitos de lógica** (a regra **errada** mas **bem tipada**), **desempenho** (o §/relatorio§ passou em **todos** os verificadores e **satura a 41 req/s**), **integração** (contratos: tav-01), **concorrência**, **requisitos mal entendidos**, **vulnerabilidades** que **dependem de dados em execução** (**SAST** ajuda, **DAST** e **testes** completam).
**Não executados neste laboratório:** **SonarQube/SonarCloud**, **CodeQL/Semgrep (SAST)**, **análise de licenças e vulnerabilidades de dependências** (**C7**), **mutação** em **todo** o código.

### Boas práticas
1. **Comece** por **ESLint e tipos** (**baratos**); **depois** **arquitetura**; **mutação** **só** onde **importa**;
2. **Baseline** em código legado (**não bloqueie** pelo passado; **bloqueie novos** problemas);
3. **Configuração versionada** e **versões fixas** das ferramentas;
4. **Justifique** exceções (§eslint-disable§, §Stryker disable§, §@ts-expect-error§) com **comentário e tíquete**;
5. **Relatórios** como **artefatos** (HTML/lcov/JSON) e **tendências**;
6. **Revise** os **mutantes sobreviventes**: **cada um** é **uma pergunta** ("**o que acontece se...?**") que **vira um teste**.`,
  concepts: [
    { term: 'Cobertura de ramos', def: 'Medida de quantos lados de cada decisão (if, ternário, &&) foram executados pelos testes.' },
    { term: 'Mutante', def: 'Versão do código com uma pequena alteração proposital, usada para verificar se os testes a detectam.' },
    { term: 'Mutante equivalente', def: 'Mutante que não muda o comportamento observável e, portanto, nenhum teste consegue matá-lo.' },
    { term: 'Pontuação de mutação', def: 'Percentual de mutantes mortos pelos testes sobre o total (ou sobre os cobertos).' },
    { term: 'checkJs', def: 'Opção do TypeScript que verifica tipos em arquivos JavaScript usando JSDoc.' },
    { term: 'Regra de arquitetura', def: 'Restrição automatizada sobre dependências entre módulos, como domínio não importar infraestrutura.' },
    { term: 'Baseline', def: 'Registro das violações existentes para que o portão bloqueie apenas problemas novos.' }
  ],
  examples: R`**Analogia:** **cobertura** é a **lista de presença** (quem esteve na sala), **mutação** é a **prova surpresa** (quem aprendeu), **tipos e lint** são o **corretor ortográfico** (erros evidentes antes de entregar) e o **dependency-cruiser** é o **fiscal da planta** (ninguém liga o encanamento do banheiro na tomada da cozinha).

**Exemplo 1: cobertura enganosa.** 100% das linhas e 75% das funções: formatarMoeda nunca foi chamada.

**Exemplo 2: mutação.** 69,44% com testes felizes; 97,22% com testes de fronteira; o sobrevivente restante é equivalente.

**Exemplo 3: arquitetura.** Domínio importando infraestrutura e um ciclo entre módulos foram barrados (exit 2).`,
  code: [
    { title: 'c8 e Stryker no módulo-alvo (JavaScript e JSON; resultados medidos)', lang: 'js', code: R`// analise/calculos.mjs (trecho)
export function faixaDeDesconto(total) {
  if (total >= 1000) return 0.15;
  if (total >= 500) return 0.1;
  if (total > 0) return 0.05;
  return 0;
}
export function ehMaiorDeIdade(idade) { return idade >= 18; }

// stryker.config.json
// { "testRunner": "vitest", "mutate": ["analise/calculos.mjs"], "coverageAnalysis": "perTest", "concurrency": 2,
//   "vitest": { "configFile": "vitest.stryker.config.mjs" }, "reporters": ["clear-text", "json"] }

// c8 --include analise/calculos.mjs node --test analise/calculos.node.test.mjs
//   All files | 100 stmts | 92.85 branch | 75 funcs | 100 lines
// stryker run
//   testes felizes:  69.44% (25 mortos, 6 sobreviveram, 5 sem cobertura)
//   + fronteiras  :  97.22% (35 mortos, 1 sobreviveu: peso <= 5 -> peso < 5, equivalente)`, notes: [{ l: '8', t: 'Sobrevivente típico: ninguém testou exatamente 18.' }, { l: '16', t: 'O último sobrevivente é equivalente: peso 5 dá o mesmo frete nas duas versões.' }] },
    { title: 'Testes de fronteira que matam os mutantes (JavaScript, Vitest; testado)', lang: 'js', code: R`import { test } from 'vitest';
import { strict as assert } from 'node:assert';
import { faixaDeDesconto, ehMaiorDeIdade, frete } from './calculos.mjs';

test('fronteiras do desconto', () => {
  assert.equal(faixaDeDesconto(1000), 0.15); assert.equal(faixaDeDesconto(999.99), 0.1);
  assert.equal(faixaDeDesconto(500), 0.1);   assert.equal(faixaDeDesconto(499.99), 0.05);
  assert.equal(faixaDeDesconto(0.01), 0.05); assert.equal(faixaDeDesconto(-1), 0);
});
test('fronteira da maioridade', () => { assert.equal(ehMaiorDeIdade(18), true); assert.equal(ehMaiorDeIdade(17), false); });
test('fronteiras do frete', () => {
  assert.throws(() => frete(0, false), /peso inválido/); assert.throws(() => frete(-1, true), /peso inválido/);
  assert.equal(frete(5, false), 10); assert.equal(frete(6, false), 12); assert.equal(frete(0.5, true), 20);
});`, notes: [{ l: '5', t: 'Cada valor de fronteira mata um mutante de operador de comparação.' }, { l: '13', t: 'peso 0 e -1 matam os mutantes que removem ou afrouxam a validação.' }] },
    { title: 'tsc, dependency-cruiser e ESLint: configuração e resultados (shell e JavaScript; resultados medidos)', lang: 'js', code: R`// tsc --noEmit --allowJs --checkJs --strict --target es2022 --module nodenext analise/tipos.js   -> 6 erros
//   TS18048 'cliente.email' is possibly 'undefined' | TS2345 string -> number | TS2322 (4x)

// .dependency-cruiser.cjs
module.exports = { forbidden: [
  { name: 'dominio-nao-depende-de-infra', severity: 'error', from: { path: '^arq/dominio' }, to: { path: '^arq/infra' } },
  { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } }
] };
// depcruise arq --config .dependency-cruiser.cjs  -> 2 violações, saída 2

// eslint.config.mjs (trecho)
export default [{ files: ['analise/lint-alvo.mjs'], languageOptions: { ecmaVersion: 2026, sourceType: 'module' },
  rules: { 'no-unused-vars': 'error', 'no-undef': 'error', eqeqeq: 'error', 'no-var': 'error', 'prefer-const': 'error', complexity: ['warn', 5], 'no-nested-ternary': 'warn' } }];
// eslint analise/lint-alvo.mjs -> 7 problemas (5 erros, 2 avisos)`, notes: [{ l: '8', t: 'A regra de arquitetura vira um teste automatizado de dependências.' }, { l: '13', t: 'no-undef pegou uma variável inexistente que quebraria só em execução.' }] }
  ],
  bestPractices: ['Use a cobertura como alarme (código novo) e a mutação nos módulos críticos para verificar se os testes realmente verificam.', 'Analise cada mutante sobrevivente: vire um teste de fronteira ou marque como equivalente com justificativa.', 'Adote tipos gradualmente com checkJs e JSDoc e valide dados externos em execução.', 'Automatize ESLint, tipos e regras de arquitetura como portões rápidos e use baseline em código legado.', 'Fixe versões das ferramentas, versione as configurações e guarde relatórios como artefatos.', 'Justifique toda supressão (eslint-disable, ts-expect-error, Stryker disable) com comentário e tíquete.', 'Lembre que análise estática não pega desempenho, integração nem lógica errada.'],
  mistakes: ['Perseguir 100% de cobertura ou de mutação como meta.', 'Rodar mutação em todo o código em todo PR, sem incremental.', 'Ignorar mutantes equivalentes ou sobreviventes sem análise.', 'Confiar nos tipos para dados externos.', 'Bloquear o CI por violações antigas sem baseline.', 'Suprimir avisos sem justificativa.'],
  market: R`**Portões de qualidade** (lint, tipos, arquitetura, cobertura e **mutação**) são **parte do dia a dia** de **plataformas de engenharia**; saber **interpretar a mutação** e **definir regras de arquitetura executáveis** **distingue** quem **mantém a qualidade** de quem **só mede**.`,
  summary: R`Cobertura (c8) mede execução; mutação (Stryker) mede verificação; tipos (tsc com checkJs), lint (ESLint) e regras de arquitetura (dependency-cruiser) encontram defeitos sem executar. Medido: c8 com 100% das linhas, 92,85% dos ramos e 75% das funções; Stryker 69,44% com testes felizes e 97,22% após testes de fronteira (1 mutante equivalente); tsc 7.0.2 com 6 erros; dependency-cruiser com 2 violações (domínio → infra e ciclo, saída 2); ESLint com 7 problemas. Use portões automáticos, baseline e revisão humana; SAST e SonarQube não foram executados.`,
  refs: [REF2.c8, REF2.stryker, REF2.tsJs, REF2.depCruiser, REF2.eslint],
  cards: [
    { q: 'O que é um mutante equivalente?', a: 'Um mutante que não altera o comportamento observável (como peso <= 5 por peso < 5 no frete do laboratório) e que nenhum teste consegue matar.' },
    { q: 'Por que 100% de cobertura de linhas não basta?', a: 'Mede execução, não verificação: no laboratório 100% das linhas conviveu com 6 mutantes sobreviventes e 5 sem cobertura.' },
    { q: 'O que o tsc --checkJs encontrou que só quebraria em execução?', a: 'Acesso a cliente.email possivelmente undefined (TS18048), além de argumentos e atribuições de tipos incompatíveis.' },
    { q: 'Que regra de arquitetura o dependency-cruiser aplicou?', a: 'Domínio não pode depender de infraestrutura e não pode haver ciclos; ambas foram violadas no exemplo (saída 2).' }
  ]
}
];
