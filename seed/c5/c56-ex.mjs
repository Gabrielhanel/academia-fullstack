// C5.6 — Contrato, carga e análise estática: exercícios, avaliação final e projeto.
// Medições reais do laboratório (Pact 17.1.4, k6 em Docker, c8 12.0.0, Stryker 10.1.1, TypeScript 7.0.2, dependency-cruiser 18.9.0, ESLint 10.15.0); os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'tav-01': [
  { id: 'tav-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em um contrato orientado ao consumidor, o que o arquivo de contrato descreve?', options: ['Todo o schema do provedor', 'O que o consumidor realmente usa das respostas do provedor', 'O código-fonte do consumidor', 'Apenas os códigos de status'], answer: 1, explanation: 'O provedor pode evoluir livremente o que ninguém usa.' },
  { id: 'tav-01-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o campo extra vip devolvido pelo provedor quebrou a verificação do contrato.', answer: false, explanation: 'Campos adicionais são compatíveis; o que quebrou foi renomear nome para name ("missing the following keys: nome").' },
  { id: 'tav-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a mudança no provedor à compatibilidade com os consumidores.', pairs: [['Adicionar um campo à resposta', 'Compatível com os consumidores'], ['Renomear um campo usado', 'Incompatível: o campo some'], ['Mudar o tipo de um campo usado', 'Incompatível: o tipo diverge'], ['Criar um novo endpoint', 'Compatível: ninguém o usa ainda']], explanation: 'Mudanças aditivas costumam ser seguras.' },
  { id: 'tav-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarResposta(contrato, resposta)§ (verificação simplificada): §contrato§ é um objeto campo → tipo (§"number"§, §"string"§ ou §"boolean"§); §resposta§ é o corpo devolvido. Devolva a lista de problemas, na ordem das chaves do contrato: §"faltando: campo"§ se a chave não existir e §"tipo: campo esperado T mas veio U"§ se o tipo (§typeof§) for diferente. Campos extras da resposta são ignorados.', lang: 'javascript', starter: 'function verificarResposta(contrato, resposta) {\n  // seu código aqui\n}\n', hints: ['Use Object.hasOwn para a presença.', 'Compare typeof resposta[campo] com o tipo esperado.'], tests: [{ name: 'compatível e extra', code: R`const c = { id: 'number', nome: 'string', email: 'string' };
assert.equal(JSON.stringify(verificarResposta(c, { id: 1, nome: 'Ana', email: 'a@x.com', vip: true })), '[]');` }, { name: 'quebras', code: R`const c = { id: 'number', nome: 'string', email: 'string' };
assert.equal(JSON.stringify(verificarResposta(c, { id: 1, name: 'Ana', email: 'a@x.com' })), '["faltando: nome"]');
assert.equal(JSON.stringify(verificarResposta(c, { id: '1', nome: 'Ana' })), JSON.stringify(['tipo: id esperado number mas veio string', 'faltando: email']));` }], solution: R`function verificarResposta(contrato, resposta) {
  const problemas = [];
  for (const [campo, tipo] of Object.entries(contrato)) {
    if (!Object.hasOwn(resposta, campo)) problemas.push('faltando: ' + campo);
    else if (typeof resposta[campo] !== tipo) problemas.push('tipo: ' + campo + ' esperado ' + tipo + ' mas veio ' + typeof resposta[campo]);
  }
  return problemas;
}`, explanation: 'O Pact faz isso com matchers, regras e estados; a ideia central é a mesma.' },
  { id: 'tav-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare testes de contrato, de integração e E2E. Quando adotar Pact e quando não? Use o experimento nome → name.', model: 'O teste de contrato verifica o acordo de interface entre consumidor e provedor, cada lado isolado, sem ambiente conjunto; a integração verifica o seu código com o seu banco ou HTTP; o E2E verifica jornadas com tudo no ar. No experimento o provedor correto passou (200 e 404), e ao renomear nome para name a verificação falhou com "Actual map is missing the following keys: nome", barrando a mudança no CI do provedor antes do deploy, enquanto o campo extra vip não quebrou. Pact vale com vários consumidores ou times, deploys independentes (can-i-deploy) e apps com versões antigas em campo; não vale com um consumidor e um provedor no mesmo time e repositório, nem para APIs públicas com consumidores desconhecidos (OpenAPI e versionamento).', rubric: ['Diferença entre os três testes', 'Experimento nome → name e campo extra', 'Quando adotar', 'Quando não adotar'], explanation: 'Resumo da aula.' },
  { id: 'tav-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §classificarMudanca(antes, depois)§: §antes§ e §depois§ são objetos campo → tipo (schemas do provedor). Devolva §{ tipo, adicionados, removidos, alterados }§ com as listas de campos em ordem alfabética: §adicionados§ (só em §depois§), §removidos§ (só em §antes§) e §alterados§ (nos dois com tipos diferentes). §tipo§ é §"compatível"§ se não houver removidos nem alterados; senão §"incompatível"§.', lang: 'javascript', starter: 'function classificarMudanca(antes, depois) {\n  // seu código aqui\n}\n', hints: ['Compare as chaves dos dois objetos.', 'Ordene cada lista.'], tests: [{ name: 'aditiva', code: R`const r = classificarMudanca({ id: 'number', nome: 'string' }, { id: 'number', nome: 'string', vip: 'boolean' });
assert.equal(JSON.stringify(r), '{"tipo":"compatível","adicionados":["vip"],"removidos":[],"alterados":[]}');` }, { name: 'quebras', code: R`const r = classificarMudanca({ id: 'number', nome: 'string', email: 'string' }, { id: 'string', name: 'string', email: 'string' });
assert.equal(JSON.stringify(r), '{"tipo":"incompatível","adicionados":["name"],"removidos":["nome"],"alterados":["id"]}');
assert.equal(classificarMudanca({}, {}).tipo, 'compatível');` }], solution: R`function classificarMudanca(antes, depois) {
  const ka = Object.keys(antes); const kd = Object.keys(depois);
  const adicionados = kd.filter((k) => !(k in antes)).sort();
  const removidos = ka.filter((k) => !(k in depois)).sort();
  const alterados = ka.filter((k) => k in depois && antes[k] !== depois[k]).sort();
  const tipo = removidos.length || alterados.length ? 'incompatível' : 'compatível';
  return { tipo, adicionados, removidos, alterados };
}`, explanation: 'Uma ferramenta de diff de OpenAPI usa a mesma lógica, com regras para requisição e resposta.' }
],
'tav-02': [
  { id: 'tav-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é o tipo de teste que deve vir sempre primeiro?', options: ['Estresse', 'Resistência', 'Smoke', 'Pico'], answer: 2, explanation: 'O smoke confirma que o script e o serviço funcionam antes de gerar carga.' },
  { id: 'tav-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: na carga de 50 it/s a média foi 3,9 ms e o p95 foi 13,0 ms, mostrando que a média esconde a cauda.', answer: true, explanation: 'As requisições do relatório (~12 ms) só aparecem no percentil.' },
  { id: 'tav-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o conceito do k6 à descrição.', pairs: [['constant-arrival-rate', 'Modelo aberto: taxa de chegada fixa'], ['threshold', 'Critério de passa/falha sobre uma métrica'], ['check', 'Asserção que não interrompe o teste'], ['dropped_iterations', 'Iterações que não puderam começar por falta de VUs']], explanation: 'Conceitos da aula.' },
  { id: 'tav-02-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §percentil(valores, p)§ pelo método do posto mais próximo: ordene crescentemente (sem alterar o original), calcule §posto = Math.ceil(p / 100 * n)§ (mínimo 1) e devolva §ordenado[posto - 1]§. Lista vazia → §null§.', lang: 'javascript', starter: 'function percentil(valores, p) {\n  // seu código aqui\n}\n', hints: ['Ordene uma cópia com comparador numérico.', 'Garanta posto >= 1.'], tests: [{ name: 'de 1 a 100', code: R`const v = Array.from({ length: 100 }, (_, i) => i + 1).reverse();
assert.equal(percentil(v, 50), 50);
assert.equal(percentil(v, 95), 95);
assert.equal(percentil(v, 99), 99);
assert.equal(percentil(v, 100), 100);
assert.equal(v[0], 100);` }, { name: 'bordas', code: R`assert.equal(percentil([], 95), null);
assert.equal(percentil([7], 95), 7);
assert.equal(percentil([10, 2, 30], 0), 2);
assert.equal(percentil([1, 2, 3, 4], 50), 2);
assert.equal(percentil([1, 1, 1, 100], 95), 100);` }], solution: R`function percentil(valores, p) {
  if (!valores.length) return null;
  const o = [...valores].sort((a, b) => a - b);
  const posto = Math.max(1, Math.ceil((p / 100) * o.length));
  return o[posto - 1];
}`, explanation: 'O k6 interpola entre amostras; o método do posto é uma definição comum e simples.' },
  { id: 'tav-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique o modelo aberto x fechado, a omissão coordenada e como você desenharia um teste de carga confiável.', model: 'No modelo fechado, N usuários virtuais esperam a resposta antes de repetir; quando o servidor fica lento a taxa cai e a degradação é mascarada (omissão coordenada). No aberto, as iterações chegam em taxa fixa independentemente da latência, como tráfego real, e a fila aparece como latência e iterações descartadas. Um teste confiável define SLOs antes, usa perfil realista (80% leitura e 20% relatório no laboratório), ambiente semelhante à produção, gerador em outra máquina, aquecimento, dados variados, repetição e observabilidade do serviço, reporta percentis (p95 de 13,0 ms contra média de 3,9 ms) e usa thresholds para falhar o CI. Resultados de laptop não generalizam.', rubric: ['Aberto x fechado e omissão coordenada', 'SLO e perfil realista', 'Gerador separado, aquecimento e repetição', 'Percentis e thresholds'], explanation: 'Resumo da aula.' },
  { id: 'tav-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §avaliarThresholds(metricas, thresholds)§ (modelo do k6): §metricas§ é um objeto nome → valor; §thresholds§ é uma lista de textos como §"p95<150"§ ou §"falhas<=0.01"§ (operadores §<§, §<=§, §>§, §>=§). Devolva §{ codigoDeSaida, violados }§: §violados§ lista os textos que NÃO são satisfeitos (na ordem) e §codigoDeSaida§ é §0§ se nenhum violado, senão §99§. Métrica ausente conta como violada.', lang: 'javascript', starter: 'function avaliarThresholds(metricas, thresholds) {\n  // seu código aqui\n}\n', hints: ['Use uma regex para separar nome, operador e limite.', 'Cuide da ordem das alternativas na regex (<= antes de <).'], tests: [{ name: 'passa', code: R`const r = avaliarThresholds({ p95: 13, falhas: 0 }, ['p95<150', 'falhas<0.01']);
assert.equal(JSON.stringify(r), '{"codigoDeSaida":0,"violados":[]}');` }, { name: 'viola', code: R`const r = avaliarThresholds({ p95: 4588.8, falhas: 0, rps: 35.5 }, ['p95<500', 'falhas<0.01', 'rps>=40', 'fantasma<1']);
assert.equal(JSON.stringify(r), '{"codigoDeSaida":99,"violados":["p95<500","rps>=40","fantasma<1"]}');
assert.equal(avaliarThresholds({ a: 5 }, ['a<=5']).codigoDeSaida, 0);
assert.equal(avaliarThresholds({ a: 5 }, ['a>5']).codigoDeSaida, 99);` }], solution: R`function avaliarThresholds(metricas, thresholds) {
  const violados = [];
  for (const t of thresholds) {
    const m = /^(\w+)(<=|>=|<|>)([\d.]+)$/.exec(t);
    const v = m ? metricas[m[1]] : undefined;
    const lim = m ? Number(m[3]) : 0;
    const ok = v !== undefined && ({ '<': v < lim, '<=': v <= lim, '>': v > lim, '>=': v >= lim })[m[2]];
    if (!ok) violados.push(t);
  }
  return { codigoDeSaida: violados.length ? 99 : 0, violados };
}`, explanation: 'O k6 sai com 99 quando thresholds são violados, o que quebra o pipeline.' }
],
'tav-03': [
  { id: 'tav-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o teste de estresse procura?', options: ['Apenas erros de sintaxe', 'O ponto de saturação, o modo de falha e a recuperação', 'A cobertura de código', 'O número de testes'], answer: 1, explanation: 'Leva o sistema além da carga esperada.' },
  { id: 'tav-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: no estresse, 0% das respostas falharam, embora o p95 tenha chegado a 4,59 s e o k6 tenha saído com código 99.', answer: true, explanation: 'O Node enfileirou o trabalho: a degradação apareceu só como latência.' },
  { id: 'tav-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a resposta à saturação ao seu efeito.', pairs: [['Backpressure', 'Recusar cedo (503) em vez de enfileirar sem limite'], ['Rate limit', 'Impedir que um cliente sature todos'], ['Load shedding', 'Descartar trabalho de baixa prioridade'], ['Escala horizontal', 'Aumentar a capacidade com mais instâncias']], explanation: 'Estratégias da aula.' },
  { id: 'tav-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §simularFila(taxa, servicoMs, duracaoS)§: chegadas igualmente espaçadas a cada §1000 / taxa§ ms durante §duracaoS§ segundos (total §n = taxa * duracaoS§, a primeira em 0 ms), um único servidor FIFO com tempo de serviço fixo §servicoMs§. A latência de cada requisição é §fim - chegada§. Devolva §{ n, media, max }§ com §media§ arredondada a 1 casa decimal.', lang: 'javascript', starter: 'function simularFila(taxa, servicoMs, duracaoS) {\n  // seu código aqui\n}\n', hints: ['inicio = max(chegada, fim da anterior).', 'Acumule a soma das latências.'], tests: [{ name: 'abaixo da capacidade', code: R`const r = simularFila(10, 24, 10);
assert.equal(JSON.stringify(r), '{"n":100,"media":24,"max":24}');` }, { name: 'acima da capacidade', code: R`const r = simularFila(100, 24, 10);
assert.equal(JSON.stringify(r), '{"n":1000,"media":7017,"max":14010}');
assert.equal(simularFila(1, 5, 3).max, 5);` }], solution: R`function simularFila(taxa, servicoMs, duracaoS) {
  const n = taxa * duracaoS; const passo = 1000 / taxa;
  let fimAnterior = 0; let soma = 0; let max = 0;
  for (let i = 0; i < n; i++) {
    const chegada = i * passo;
    const inicio = Math.max(chegada, fimAnterior);
    const fim = inicio + servicoMs;
    const lat = fim - chegada;
    soma += lat; if (lat > max) max = lat;
    fimAnterior = fim;
  }
  return { n, media: Math.round((soma / n) * 10) / 10, max };
}`, explanation: 'Mostra por que a latência explode quando a chegada supera a capacidade (24 ms → ~41 req/s).' },
  { id: 'tav-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Interprete o resultado do estresse do laboratório (vazão 35,5 req/s, p95 4,59 s, 119 descartadas, 0% de falhas) e proponha ações.', model: 'O servidor Node de uma thread, com ~24 ms de CPU síncrona por requisição, tem capacidade de ~41 req/s; com chegada de até 100/s a vazão estagnou em 35,5 req/s, a fila cresceu e a latência explodiu (p95 de 4,59 s, máximo de 6,69 s), sem erros HTTP: a degradação foi por fila, invisível a um painel de taxa de erro. As 119 iterações descartadas indicam que os 150 VUs ficaram presos esperando (lei de Little: 100/s × ~4 s ≈ 400 VUs); aumentar maxVUs só mascararia. Ações: reduzir o custo do relatório (algoritmo, cache), mover CPU para workers ou processos e escalar horizontalmente, aplicar backpressure (503 com Retry-After acima de um limite de concorrência), rate limit por cliente, load shedding, alertas por latência e saturação e dimensionar com ~60% de utilização; ressalvar que o gerador estava no mesmo host.', rubric: ['Capacidade e vazão estagnada', 'Degradação por fila e invisibilidade nos erros', 'Lei de Little e descartes', 'Ações concretas e ressalvas'], explanation: 'Resumo da aula.' },
  { id: 'tav-03-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §instanciasNecessarias(taxa, servicoMs, utilizacaoPct)§: número mínimo de instâncias de uma thread para atender §taxa§ req/s com tempo de serviço §servicoMs§ sem passar de §utilizacaoPct§ por cento de utilização. Use §Math.ceil(taxa * servicoMs * 100 / (1000 * utilizacaoPct))§ (mínimo 1).', lang: 'javascript', starter: 'function instanciasNecessarias(taxa, servicoMs, utilizacaoPct) {\n  // seu código aqui\n}\n', hints: ['A utilização de uma instância é taxa × tempo de serviço (em segundos).', 'Divida pela meta de utilização.'], tests: [{ name: 'laboratório', code: R`assert.equal(instanciasNecessarias(100, 24, 60), 4);
assert.equal(instanciasNecessarias(50, 24, 60), 2);
assert.equal(instanciasNecessarias(41, 24, 100), 1);` }, { name: 'bordas', code: R`assert.equal(instanciasNecessarias(0, 24, 60), 1);
assert.equal(instanciasNecessarias(1000, 10, 50), 20);
assert.equal(instanciasNecessarias(10, 24, 100), 1);` }], solution: R`function instanciasNecessarias(taxa, servicoMs, utilizacaoPct) {
  return Math.max(1, Math.ceil((taxa * servicoMs * 100) / (1000 * utilizacaoPct)));
}`, explanation: 'Capacidade por instância e meta de utilização (por exemplo, 60%) dimensionam a frota.' }
],
'tav-04': [
  { id: 'tav-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que a pontuação de mutação mede?', options: ['Quantas linhas foram executadas', 'A fração de mutantes que os testes detectaram (mataram)', 'A velocidade dos testes', 'O número de commits'], answer: 1, explanation: 'Mutantes sobreviventes indicam verificações faltantes.' },
  { id: 'tav-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o último mutante sobrevivente do Stryker (peso <= 5 → peso < 5) era equivalente, pois para peso 5 o frete é o mesmo.', answer: true, explanation: 'Nenhum teste consegue matá-lo; analise e ignore com justificativa.' },
  { id: 'tav-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a ferramenta ao resultado do laboratório.', pairs: [['c8', '100% de linhas e 75% de funções'], ['Stryker', '69,44% → 97,22% de pontuação'], ['dependency-cruiser', '2 violações (ciclo e domínio → infra)'], ['tsc --checkJs', '6 erros de tipo em JSDoc']], explanation: 'Resultados medidos.' },
  { id: 'tav-04-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §pontuacao(mortos, sobreviventes, semCobertura)§: devolva §{ total, pontuacao, pontuacaoDosCobertos }§ onde §total = mortos + sobreviventes + semCobertura§, §pontuacao = mortos / total * 100§ e §pontuacaoDosCobertos = mortos / (mortos + sobreviventes) * 100§, ambas arredondadas a 2 casas decimais (§0§ se o denominador for 0).', lang: 'javascript', starter: 'function pontuacao(mortos, sobreviventes, semCobertura) {\n  // seu código aqui\n}\n', hints: ['Crie uma função auxiliar de arredondamento.', 'Trate a divisão por zero.'], tests: [{ name: 'laboratório', code: R`assert.equal(JSON.stringify(pontuacao(25, 6, 5)), '{"total":36,"pontuacao":69.44,"pontuacaoDosCobertos":80.65}');
assert.equal(JSON.stringify(pontuacao(35, 1, 0)), '{"total":36,"pontuacao":97.22,"pontuacaoDosCobertos":97.22}');` }, { name: 'bordas', code: R`assert.equal(JSON.stringify(pontuacao(0, 0, 0)), '{"total":0,"pontuacao":0,"pontuacaoDosCobertos":0}');
assert.equal(pontuacao(0, 0, 4).pontuacaoDosCobertos, 0);
assert.equal(pontuacao(10, 0, 0).pontuacao, 100);` }], solution: R`function pontuacao(mortos, sobreviventes, semCobertura) {
  const r2 = (x) => Math.round(x * 100) / 100;
  const total = mortos + sobreviventes + semCobertura;
  const cobertos = mortos + sobreviventes;
  return { total, pontuacao: total ? r2((mortos / total) * 100) : 0, pontuacaoDosCobertos: cobertos ? r2((mortos / cobertos) * 100) : 0 };
}`, explanation: 'O Stryker mostra as duas colunas: total e cobertos.' },
  { id: 'tav-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Monte os portões de qualidade de um serviço Node (estilo, tipos, arquitetura, cobertura, mutação, segurança) e explique o que cada um garante e não garante, usando os resultados do laboratório.', model: 'ESLint (e Prettier) pega erros evidentes e más práticas em segundos (no laboratório 7 problemas, incluindo um no-undef que seria ReferenceError); o tsc com checkJs ou TypeScript pega erros de tipo e nulos (6 erros, como cliente.email possivelmente undefined), mas não valida dados externos; o dependency-cruiser executa regras de arquitetura (2 violações: ciclo e domínio → infra), com baseline no legado; a cobertura (c8) é alarme para código novo, não meta (100% das linhas e 75% das funções); a mutação (Stryker) nos módulos críticos mostra se os testes verificam (69,44% → 97,22% com testes de fronteira, 1 equivalente); SAST e auditoria de dependências cobrem segurança. Nada disso encontra erro de lógica bem tipada, desempenho (o relatório passa em tudo e satura a ~41 req/s) nem integração (contratos).', rubric: ['Portões e critérios por ferramenta', 'Uso de números medidos', 'Cobertura como alarme e mutação nos módulos críticos', 'Limites da análise estática'], explanation: 'Resumo da aula.' },
  { id: 'tav-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarArquitetura(dependencias, proibidas)§: §dependencias§ é uma lista de §{ de, para }§ (caminhos); §proibidas§ é uma lista de §{ de, para }§ com prefixos de caminho. Devolva a lista de mensagens: primeiro as violações proibidas, na ordem das dependências, no formato §"proibida: de → para"§ (quando §de§ começa com o prefixo §de§ e §para§ com o prefixo §para§ de alguma regra); depois, se existir ciclo, UMA mensagem §"ciclo: a → b → a"§ (percorra os módulos em ordem alfabética, em profundidade; reporte o primeiro ciclo encontrado, começando no módulo em que o ciclo foi detectado).', lang: 'javascript', starter: 'function verificarArquitetura(dependencias, proibidas) {\n  // seu código aqui\n}\n', hints: ['Monte um mapa módulo → vizinhos.', 'Na DFS guarde o caminho atual; ao achar um vizinho no caminho, recorte a partir dele.'], tests: [{ name: 'violações proibidas', code: R`const deps = [{ de: 'arq/dominio/pedido.mjs', para: 'arq/infra/banco.mjs' }, { de: 'arq/app/servico.mjs', para: 'arq/dominio/pedido.mjs' }];
const r = verificarArquitetura(deps, [{ de: 'arq/dominio', para: 'arq/infra' }]);
assert.equal(JSON.stringify(r), '["proibida: arq/dominio/pedido.mjs → arq/infra/banco.mjs"]');` }, { name: 'ciclo', code: R`const deps = [{ de: 'arq/app/servico.mjs', para: 'arq/app/notificacao.mjs' }, { de: 'arq/app/notificacao.mjs', para: 'arq/app/servico.mjs' }];
assert.equal(JSON.stringify(verificarArquitetura(deps, [])), '["ciclo: arq/app/notificacao.mjs → arq/app/servico.mjs → arq/app/notificacao.mjs"]');
assert.equal(JSON.stringify(verificarArquitetura([{ de: 'a', para: 'b' }], [])), '[]');
assert.equal(JSON.stringify(verificarArquitetura([{ de: 'a', para: 'a' }], [])), '["ciclo: a → a"]');` }], solution: R`function verificarArquitetura(dependencias, proibidas) {
  const msgs = [];
  for (const d of dependencias) {
    if (proibidas.some((p) => d.de.startsWith(p.de) && d.para.startsWith(p.para))) msgs.push('proibida: ' + d.de + ' → ' + d.para);
  }
  const viz = {};
  for (const { de, para } of dependencias) { (viz[de] = viz[de] || []).push(para); viz[para] = viz[para] || []; }
  const estado = {}; let ciclo = null;
  const visita = (n, caminho) => {
    if (ciclo) return;
    estado[n] = 1; caminho.push(n);
    for (const v of viz[n]) {
      if (ciclo) break;
      if (estado[v] === 1) { ciclo = [...caminho.slice(caminho.indexOf(v)), v]; break; }
      if (!estado[v]) visita(v, caminho);
    }
    caminho.pop(); estado[n] = 2;
  };
  for (const n of Object.keys(viz).sort()) if (!estado[n]) visita(n, []);
  if (ciclo) msgs.push('ciclo: ' + ciclo.join(' → '));
  return msgs;
}`, explanation: 'É o essencial das regras forbidden e no-circular do dependency-cruiser.' }
]
};

const P = 'testes-avancados-p';
export const assessment = {
  id: 'testes-avancados', title: 'Avaliação final — Contrato, carga e análise estática', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Que mudança do provedor quebrou a verificação do contrato no laboratório?', options: ['Adicionar o campo vip', 'Renomear nome para name', 'Criar um novo endpoint', 'Nenhuma'], answer: 1, explanation: '"Actual map is missing the following keys: nome".' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'No modelo aberto do k6, a taxa de chegada independe da latência do servidor.', answer: true, explanation: 'Por isso a fila aparece como latência e iterações descartadas.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Resultados medidos do estresse no laboratório.', code: 'requisições: 1030 | vazão média: 35,5 req/s\np95: 4588,8 ms | falhas HTTP: 0,00%\niterações descartadas: 119 | saída do k6: 99', lang: 'text', steps: [{ q: 'Qual foi o código de saída do k6 (use um número)?', answers: ['99'] }, { q: 'Qual foi a porcentagem de falhas HTTP (use um número, sem %)?', answers: ['0', '0,00', '0.00'] }], explanation: 'O threshold p(95)<500 foi violado, sem erros HTTP.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que reportar p95 e não só a média?', options: ['Porque a média é proibida', 'Porque a média esconde a cauda (3,9 ms de média contra 13,0 ms de p95 no laboratório)', 'Porque o p95 é sempre menor', 'Porque o k6 só calcula p95'], answer: 1, explanation: 'Distribuições de latência são assimétricas.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna este teste de carga enganoso sobre a degradação do servidor (modelo fechado sem taxa fixa).', code: "export const options = {\n  vus: 10, duration: '30s',\n  thresholds: { http_req_duration: ['p(95)<150'] }\n};\nexport default function () { http.get(url + '/relatorio'); }", answer: 2, explanation: 'Com VUs fixos, o gerador desacelera quando o servidor atrasa (omissão coordenada); use um executor de taxa de chegada.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a regra de dimensionamento.', code: 'Pela lei de [[0]], a concorrência é a taxa de chegada multiplicada pelo tempo de [[1]]. Com 100 it/s e ~4 s de latência são necessários cerca de 400 VUs.', answers: [['Little', 'little'], ['resposta', 'respostas']], explanation: 'L = λ × W.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a ferramenta à pergunta que ela responde.', pairs: [['Pact', 'Consumidor e provedor concordam sobre a interface?'], ['k6', 'O sistema atende a carga dentro do SLO?'], ['Stryker', 'Os testes detectam alterações no código?'], ['dependency-cruiser', 'As dependências respeitam as regras de arquitetura?']], explanation: 'Cada ferramenta com um papel.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido: a pontuação de mutação passou de qual valor para qual após os testes de fronteira?', options: ['50% para 60%', '69,44% para 97,22%', '97,22% para 100%', '80% para 90%'], answer: 1, explanation: '25 → 35 mutantes mortos de 36.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Contratos orientados ao consumidor substituem totalmente os testes de integração e E2E.', answer: false, explanation: 'Cobrem só a interface entre times; integração e E2E cobrem outras coisas.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual resposta à saturação evita que uma fila ilimitada transforme erro em latência infinita?', options: ['Aumentar maxVUs', 'Backpressure: recusar cedo com 503 e Retry-After', 'Remover os thresholds', 'Ignorar a cauda'], answer: 1, explanation: 'Falhar rápido protege quem está sendo atendido.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Desenhe a estratégia de testes avançados de um serviço de clientes consumido por três times: contratos, carga, estresse e portões estáticos (o que roda quando, critérios e limites).', model: 'Contratos Pact: cada consumidor publica seu contrato (matchers por tipo, estados claros, inclusive 404/422), o provedor verifica a cada PR e usa can-i-deploy antes do deploy, com expandir e contrair para mudanças. Carga e estresse: SLOs definidos, smoke a cada PR, carga noturna em modelo aberto com perfil realista e thresholds de p95 e taxa de falhas, estresse com ramping para achar o joelho e testar a recuperação, em ambiente isolado com gerador separado, e backpressure, rate limit e alertas de latência e saturação. Portões estáticos: ESLint e tipos em todo PR, dependency-cruiser com baseline, cobertura como alarme para código novo e mutação nos módulos críticos (regras de preço), com análise dos mutantes equivalentes; SAST e auditoria de dependências à parte. Limites: análise estática não encontra desempenho nem lógica errada bem tipada.', rubric: ['Contratos e can-i-deploy', 'Carga e estresse com SLO e thresholds', 'Portões estáticos e mutação', 'Limites e ambiente'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual ferramenta do laboratório encontrou "possibly undefined" em cliente.email sem executar o código?', options: ['c8', 'k6', 'tsc com --checkJs', 'Pact'], answer: 2, explanation: 'TS18048 em JavaScript com JSDoc.' }
  ]
};

export const project = {
  id: 'qualidade-automatizada', name: 'Qualidade automatizada: contratos, carga e estresse, mutação e portões estáticos', lv: 'A', stack: 'Node.js, Express 5, Pact, k6, Vitest, c8, Stryker, TypeScript (checkJs), ESLint, dependency-cruiser', ds: ['test-adv'],
  desc: 'Para um **serviço de clientes** e um **consumidor**, monte a **malha de qualidade avançada**: **contratos Pact** (consumidor e verificação do provedor, com uma mudança incompatível barrada), **testes de carga e estresse com k6** (thresholds, modelo aberto, joelho da curva e recuperação), **cobertura e mutação** (c8 e Stryker, com análise dos mutantes) e **portões estáticos** (tipos, ESLint e regras de arquitetura), tudo documentado em um **relatório de medições**.',
  rf: ['Pelo menos 3 interações Pact (sucesso, 404 e um erro de validação) com matchers por tipo e estados do provedor', 'Verificação do provedor no CI e demonstração de uma mudança incompatível barrada e de uma aditiva aceita', 'Scripts k6 de smoke, carga (modelo aberto) e estresse (taxa crescente) com thresholds e exportação do resumo', 'Relatório com vazão, média e percentis, falhas, iterações descartadas e o ponto de saturação encontrado', 'Uma proteção implementada (backpressure ou rate limit) e o estresse repetido mostrando o efeito', 'Cobertura (c8) e mutação (Stryker) de um módulo de regras de negócio, com os mutantes sobreviventes analisados (testes novos ou marcados como equivalentes)', 'Tipos (checkJs), ESLint e dependency-cruiser com regras de arquitetura e baseline', 'README com versões, comandos, limitações (gerador no mesmo host, o que não foi executado)'],
  rnf: ['Versões exatas das ferramentas e configurações versionadas', 'Gerador de carga separado do serviço ou a limitação declarada', 'Nenhum teste de carga contra ambientes de terceiros ou de produção', 'Resultados repetidos ao menos 3 vezes (mediana) e registrados com versão do código'],
  ac: ['A renomeação de um campo usado quebra a verificação e o campo adicional não quebra', 'O estresse mostra o joelho da curva e o efeito da proteção (latência estável com 503 rápidos)', 'A pontuação de mutação sobe após os testes de fronteira e os equivalentes são justificados', 'Os portões falham o CI em violações novas e aceitam o baseline', 'O relatório separa o que foi medido do que foi estimado'],
  ch: ['Publicar contratos em um Pact Broker e usar can-i-deploy', 'Rodar o k6 em outra máquina e comparar com o resultado no mesmo host', 'Adicionar contratos de mensageria (eventos) para uma fila', 'Executar uma ferramenta SAST (Semgrep ou CodeQL) e comparar com o lint']
};
