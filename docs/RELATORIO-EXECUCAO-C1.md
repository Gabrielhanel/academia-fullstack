# Relatório de execução da C1 — Academia Full Stack v2

Data: 2026-11-18. Escopo: produção dos 7 cursos da C1 (Linux/SO, Redes, Ferramentas e regex, Paradigmas, Web Platform, Fluxo e agilidade, Requisitos e domínio).
Status: **conteúdo pronto e validado, isolado em `seed/c1/`**. Nada foi integrado ao build, nada foi publicado e o banco real não foi alterado.

## 1. Resultado em números

| Curso | id | Disciplinas | Aulas | Exercícios (code) | Prova | Projeto | Horas de aula* |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1.1 Linux, terminal e sistemas operacionais | `linux-terminal-so` | linux, os | 9 | 51 (9) | 12 itens | `kit-operacao-servidor` | 10,4 |
| C1.2 Redes e HTTP | `redes-http` | net | 7 | 42 (7) | 12 itens | `diagnostico-de-url` | 8,4 |
| C1.3 Ferramentas do desenvolvedor e regex | `ferramentas-regex` | devtools, regex | 8 | 47 (10) | 12 itens | `toolkit-qualidade-e-logs` | 9,4 |
| C1.4 Paradigmas de programação | `paradigmas-programacao` | paradigms | 6 | 32 (8) | 12 itens | `pedidos-oop-vs-funcional` | 6,0 |
| C1.5 APIs do navegador e Web Platform | `web-platform` | browser | 7 | 41 (8) | 12 itens | `pwa-notas-offline` | 7,3 |
| C1.6 Fluxo profissional e agilidade | `fluxo-agilidade` | workflow, agile | 7 | 41 (8) | 12 itens | `guia-contribuicao-e-sprint` | 6,8 |
| C1.7 Requisitos e modelagem de domínio | `requisitos-dominio` | requirements, agile | 7 | 38 (7) | 12 itens | `especificacao-biblioteca-comunitaria` | 7,2 |
| **Total** | 7 cursos | 10 disciplinas | **51** | **292 (57)** | **84 itens** | **7** | **55,5** |

\* Soma dos minutos das aulas, sem contar exercícios, prova e projeto.

Outros números: 21 módulos; 7 suplementos (glossário, cheatsheet, mapa de pré-requisitos, referências oficiais, prática); 123 documentos de seed (21 + 17 + 19 + 15 + 17 + 17 + 17), cerca de 1,2 MB, o maior com 19,9 KB; 190 URLs distintas citadas.

Cobertura do catálogo: os 43 tópicos do catálogo nas 10 disciplinas (Linux, SO, Redes, Ferramentas, Regex, Paradigmas, Web Platform, Workflow, Agilidade, Requisitos; contados pelos `TOPICS` de cada curso, com o tópico de requisitos da disciplina Agilidade incluído no C1.7) têm ao menos uma aula (`validate.mjs` falha se faltar). "Levantamento de requisitos" (disciplina Agilidade) é ensinado na aula `req-07`, como previsto no plano; "Estimativas técnicas" está em `flx-07`.

## 2. O que foi verificado e como

| Verificação | Ferramenta | Resultado |
| --- | --- | --- |
| Estrutura, vínculos, ids únicos, caminhos sem colisão com a Onda 1, checklists de aula e curso, prova (12 itens, `passPct` 70, sem `code`), projeto, suplemento, cobertura de tópicos, cercas de código balanceadas, ausência de caracteres de controle | `node seed/c1/validate.mjs` | sem falhas nos 7 cursos |
| Soluções dos desafios `code` passam e o código inicial não passa em todos os testes | `validate.mjs` (Node `vm`) | 57 desafios, sem falhas |
| Os mesmos 57 desafios em Web Worker de um Chrome real (mesmo mecanismo do laboratório: Blob, Worker, `E.buildTestSource`, limite de 6 s) | `node seed/c1/browser-check.mjs` | 57 soluções passam; 57 códigos iniciais não passam em todos os testes (Chrome 157.0.8103.50) |
| Referências abertas com GET real (status 200 e título da página) | `node seed/c1/refs-check.mjs` | 190 de 190 (uma, `iso.org`, retornou 403 ao GET automático e foi aberta no navegador embutido, com o título conferido; registrada em `refs-cache.json`) |
| Testes do app não foram afetados | `npm test` | 125 de 125 passam; `seed/docs.json` e `seed/seed.json` com hash idêntico antes e depois |

### Exemplos executados (resumo por curso)
- **C1.1 (Linux e SO):** comandos de shell executados em Bash 5 / Linux, com saídas registradas nas aulas. **Não executado:** o ramo real de `rm` do `backup.sh` (bloqueio de segurança do ambiente); foi testado pelo modo `-n` e a aula `lnx-08` informa isso.
- **C1.2 (Redes):** `curl`, `dig`, `nc`, `openssl` e `ss` executados. O `curl` do ambiente não tem suporte a HTTP/3 (informado na aula); o `example.com` não enviou `alt-svc`, por isso o exemplo usa `www.cloudflare.com`. As referências do GNU foram substituídas porque `gnu.org` não abre neste ambiente.
- **C1.3 (Ferramentas e regex):** Node.js 26, ESLint 10 e Prettier 3 executados; tempos de ReDoS medidos.
- **C1.4 (Paradigmas):** todos os exemplos executados em Node.js 26 (`labs/paradigmas-lab/`): classes com campos privados, fragilidade da herança (total 6 para 3 itens), composição, `toSorted`/`with`, `Object.freeze` raso, closures, memoização (`fib(50)`), `RangeError` de recursão, Worker Threads (3 esperas de 200 ms em ~200 ms contra ~600 ms em sequência), corrida com `SharedArrayBuffer` (sem `Atomics` perde atualizações; com `Atomics.add`, 400 000), mutex assíncrono, pool com limite e deadlock.
- **C1.5 (Web Platform):** executado no Chrome 157 com servidor local (`web-lab/`): propagação e delegação de eventos, Web Storage e cota (4 gravações de 1 milhão de caracteres e `QuotaExceededError` na 5ª), cookie `HttpOnly` ignorado ao ser definido por JavaScript, IndexedDB (esquema, índice único, `TransactionInactiveError`, `abort`, migração), Cache API (corpo de leitura única), Workers (transferência zera o `byteLength`, `DataCloneError`, atrasos de timer com e sem Worker), Service Worker (ciclo de vida, três estratégias, correção do network-first para HTTP 503), instalabilidade via `Page.getInstallabilityErrors`, WebSocket (eco, binário, fechamento 4001) e SSE (reconexão com `Last-Event-ID`). **Registro importante:** o Chromium do painel embutido do app não registra Service Workers ("unknown error occurred when fetching the script"); por isso os testes de Service Worker foram feitos no Google Chrome instalado, via `puppeteer-core`. Os resultados do primeiro teste (o 503 servido pelo network-first) foram mantidos como material didático.
- **C1.6 (Fluxo e agilidade):** históricos reais de Git 2.53 (merge, squash, rebase com hashes novos, Git Flow, `request-pull`), Conventional Commits, feature flag determinística (243 de 1000 usuários a 25 %), verificador de links Markdown, CODEOWNERS simplificado, Lei de Little (3,9 × 0,5 = 1,95, exata), percentis, Monte Carlo com semente fixa (p50 8, p85 9, p95 9 semanas), PERT e capacidade de Sprint.
- **C1.7 (Requisitos e domínio):** feature Gherkin em português executada com cucumber-js 13.3.0 (6 cenários e 19 passos passam; ao quebrar o limite do frete de propósito, o cenário de R$ 200,00 falhou e a regra foi restaurada), agregado `Pedido` em JavaScript (invariantes, eventos, repositório) e funções de triagem de requisitos e de priorização.

### Itens não executados (e informados nas aulas)
- Recursos específicos de plataforma (GitHub: proteção de ramo, CODEOWNERS real, modelos de PR, fila de merge): seguem a documentação oficial, sem conta nem remoto.
- Event Storming, mapa de contextos, renderização de Mermaid e ADRs: práticas de workshop ou notação, apresentadas como exemplo.
- Alguns trechos marcados como "padrão ilustrativo" (por exemplo, o serviço de aplicação `ConfirmarPedido` da aula `req-06`) não foram executados separadamente; a lógica correspondente é treinada nos exercícios `code`.

## 3. Correções feitas por checagem de fonte (nesta missão)
- **ISO/IEC 25010:** a aula `req-01` descrevia 8 características (modelo de 2011). A fonte citada descreve a revisão com **nove** características (inclui capacidade de interação, flexibilidade e segurança operacional). Aula, exercício, glossário, cheatsheet e metadados foram corrigidos, com nota sobre a diferença entre as edições.
- **Kanban Guide:** a descrição das práticas estava incorreta. O guia de maio de 2025 tem **três práticas** (definir e visualizar o fluxo, gerenciar ativamente os itens, melhorar o fluxo) e quatro métricas (WIP, Throughput, Work Item Age, Cycle Time). A aula `flx-06` foi corrigida e separa as práticas clássicas do Método Kanban.
- **Scrum Guide:** confirmados no site oficial a versão de novembro de 2020, os limites de tempo (8, 4 e 3 horas para Sprint de um mês; Daily de 15 minutos) e "um mês ou menos".
- **Git Flow e DORA:** confirmados a nota de reflexão do autor (2020) e a definição de desenvolvimento baseado em tronco do DORA.
- **Chrome:** o critério de instalabilidade foi confrontado com o MDN e com `Page.getInstallabilityErrors`; o MDN lista ícones de 192 e 512 px e o Chrome 157 acusou apenas a ausência de ícone aceitável (≥ 144 px) no teste; a aula informa as duas coisas.
- **Validador:** passou a incluir `structuredClone` no contexto (existe no Worker do navegador), a checar `requires` entre todos os cursos da C1 e a verificar o balanceamento de cercas de código.

## 4. Integridade (o que não foi tocado)
- **Onda 1 e piloto `js-async`:** nenhum arquivo foi alterado. Os únicos arquivos modificados fora de `seed/c1/` nesta etapa foram documentos de relatório (`PROGRESSO-C1.md`, `RELATORIO-PLANO-C2.md`).
- **`SEED_REV`, `seedPlan`, motor de migração:** inalterados (`SEED_REV = 3` em `src/app.html:952`, `seed/docs.mjs:6` e `seed/build.mjs:43`).
- **Banco real:** nenhuma leitura ou escrita feita nesta etapa (nenhum `ArtifactData`).
- **Publicação:** nenhuma. O artefato `4b19ba2b-…` permanece na versão 10.
- **Segurança do conteúdo:** nenhuma ocorrência de `<script` ou `<iframe` nas aulas; trechos com `onerror =` aparecem apenas dentro de blocos de código. O renderizador de Markdown do app (`md()` em `src/app.html:340`) aplica `esc()` ao texto e ao código; a revisão do Opus deve confirmar isso (veja `REVISAO-OPUS-C1.md`).

## 5. Limitações conhecidas
1. **Versões e preços mudam.** Os exemplos registram as versões (Node.js 26, Chrome 157, ESLint 10, Prettier 3, cucumber-js 13.3, Git 2.53); medições de tempo dependem da máquina.
2. **Revisão pedagógica humana pendente.** A produção foi técnica (execução e checagem de fontes). Um revisor humano ainda deve avaliar ritmo, tom e dificuldade, principalmente nas aulas mais longas (a maior tem cerca de 6,2 mil caracteres de teoria; duas passam de 6 mil).
3. **Os exercícios `code` testam lógica pura em JavaScript.** Shell, redes, DOM e Service Worker não rodam no laboratório; os exercícios dessas partes usam mc, tf, fill, trace, bug, match e open, com correção determinística.
4. **Aulas e exercícios de C1.1 a C1.3** foram produzidos na etapa anterior (noite) e seguem o mesmo molde; as verificações automáticas foram repetidas nesta etapa para os sete cursos.
5. **A fórmula de pontuação e os limites didáticos** (por exemplo, 60 % para o Must, o desvio PERT) são convenções de ensino, não normas.

## 6. Próximos passos recomendados
1. Revisão do Opus: `REVISAO-OPUS-C1.md` (integração ao build, `SEED_REV`, testes de upgrade e publicação em lotes).
2. Decisão do dono sobre os itens listados em `REVISAO-OPUS-C1.md`, seção 6.
3. Só depois: integração, `SEED_REV` novo, testes e2e de upgrade, publicação e releitura do banco real.
4. A planilha de revisão pedagógica (opcional): uma pessoa lê 2 aulas por curso (a primeira e uma intermediária) e preenche objetivos atingidos, erros encontrados e dificuldade percebida.
