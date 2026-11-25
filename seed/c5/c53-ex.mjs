// C5.3 — Documentação arquitetural: exercícios, avaliação final e projeto.
// Medições reais do laboratório (mermaid-cli 12.2.0, PlantUML 1.2026.10, Node 26.13.1); os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'adr-01': [
  { id: 'adr-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual diagrama UML é o mais indicado para mostrar a ordem das chamadas entre a API, o estoque e o pagamento, incluindo o fluxo de recusa?', options: ['Diagrama de classes', 'Diagrama de sequência', 'Diagrama ER', 'Diagrama de estados'], answer: 1, explanation: 'A sequência mostra mensagens no tempo e blocos alt/else.' },
  { id: 'adr-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Se o mermaid-cli renderiza um diagrama com exit 0, isso garante que o diagrama está correto e atualizado.', answer: false, explanation: 'A renderização valida só a sintaxe; um diagrama inválido saiu com exit 1 no laboratório, mas nada detecta desatualização.' },
  { id: 'adr-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a notação do diagrama de classes ao significado.', pairs: [['*--', 'Composição (ciclo de vida da parte depende do todo)'], ['<|..', 'Realização de interface'], ['..>', 'Dependência'], ['-->', 'Associação']], explanation: 'Notações essenciais usadas no laboratório.' },
  { id: 'adr-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §lerSequencia(texto)§ para um diagrama de sequência do Mermaid. Devolva §{ participantes, mensagens, temAlt }§: §participantes§ é a lista (sem repetição, na ordem em que aparecem) dos nomes (ids) declarados com §participant§ ou §actor§ (ex.: §participant A as API§ → §"A"§); §mensagens§ é o número de linhas com §->>§ ou §-->>§; §temAlt§ é §true§ se alguma linha começar (após espaços) com §alt §.', lang: 'javascript', starter: 'function lerSequencia(texto) {\n  // seu código aqui\n}\n', hints: ['Percorra as linhas com trim().', 'Use uma expressão regular para participant/actor.'], tests: [{ name: 'checkout', code: R`const t = ['sequenceDiagram', '  autonumber', '  actor U as Cliente', '  participant A as API', '  participant E as Estoque', '  U->>A: POST /pedidos', '  A->>E: reservar', '  E-->>A: ok', '  alt aprovado', '    A-->>U: 201', '  end'].join('\n');
const r = lerSequencia(t);
assert.equal(JSON.stringify(r.participantes), '["U","A","E"]');
assert.equal(r.mensagens, 4);
assert.equal(r.temAlt, true);` }, { name: 'sem alt e repetidos', code: R`const r = lerSequencia('sequenceDiagram\nparticipant X\nparticipant X as Outro\nX->>X: auto');
assert.equal(JSON.stringify(r.participantes), '["X"]');
assert.equal(r.mensagens, 1);
assert.equal(r.temAlt, false);
assert.equal(JSON.stringify(lerSequencia('')), '{"participantes":[],"mensagens":0,"temAlt":false}');` }], solution: R`function lerSequencia(texto) {
  const participantes = []; let mensagens = 0; let temAlt = false;
  for (const bruta of texto.split('\n')) {
    const l = bruta.trim();
    const m = /^(?:participant|actor)\s+(\S+)/.exec(l);
    if (m && !participantes.includes(m[1])) participantes.push(m[1]);
    if (/-{1,2}>>/.test(l)) mensagens++;
    if (/^alt\s/.test(l)) temAlt = true;
  }
  return { participantes, mensagens, temAlt };
}`, explanation: 'Um leitor mínimo ajuda a conferir diagramas no CI (por exemplo, participantes sem mensagens).' },
  { id: 'adr-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que escrever diagramas como código e que verificações automáticas você colocaria no CI? O que elas não detectam?', model: 'Diagramas como código (Mermaid, PlantUML) ficam no repositório, são revisados na mesma PR da mudança de comportamento, têm histórico no Git e não envelhecem fora do projeto. No CI renderiza-se cada diagrama (o mmdc devolveu exit 1 em um diagrama inválido e o PlantUML exit 200 em erro de sintaxe), publica-se o SVG e, quando possível, gera-se ou valida-se o diagrama a partir da fonte (esquema do banco, OpenAPI). Essas verificações não detectam se o diagrama está correto ou atualizado (o PlantUML aceitou um loop sem fim) nem se responde a uma pergunta útil; isso exige revisão humana.', rubric: ['Versionamento e revisão junto ao código', 'Renderização no CI e códigos de saída', 'Gerar a partir da fonte', 'Limite: sintaxe não prova correção'], explanation: 'Resumo da aula.' },
  { id: 'adr-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §tabelaDeTransicoes(texto)§ para um §stateDiagram-v2§ do Mermaid. Cada linha §origem --> destino§ (opcionalmente §: evento§) vira uma transição; ignore as linhas com §[*]§ como origem ou destino. Devolva um objeto estado → lista de destinos (sem repetição, ordenada alfabeticamente), com chave para todo estado citado em transição (lista vazia para quem só é destino); as chaves ficam na ordem da primeira aparição do estado (como origem ou destino).', lang: 'javascript', starter: 'function tabelaDeTransicoes(texto) {\n  // seu código aqui\n}\n', hints: ['Use uma regex como /^(\\S+)\\s*-->\\s*([^\\s:]+)/ em cada linha com trim().', 'Garanta a chave do destino.'], tests: [{ name: 'pedido', code: R`const t = 'stateDiagram-v2\n  [*] --> novo\n  novo --> pago: pagamento aprovado\n  novo --> cancelado: cancelar\n  pago --> enviado: despachar\n  pago --> cancelado: estornar\n  enviado --> entregue: confirmar\n  entregue --> [*]\n  cancelado --> [*]';
assert.equal(JSON.stringify(tabelaDeTransicoes(t)), '{"novo":["cancelado","pago"],"pago":["cancelado","enviado"],"cancelado":[],"enviado":["entregue"],"entregue":[]}');` }, { name: 'repetidos e vazio', code: R`assert.equal(JSON.stringify(tabelaDeTransicoes('stateDiagram-v2\na --> b\na --> b: de novo')), '{"a":["b"],"b":[]}');
assert.equal(JSON.stringify(tabelaDeTransicoes('stateDiagram-v2\n[*] --> a')), '{}');
assert.equal(JSON.stringify(tabelaDeTransicoes('')), '{}');` }], solution: R`function tabelaDeTransicoes(texto) {
  const t = {};
  for (const bruta of texto.split('\n')) {
    const m = /^(\S+)\s*-->\s*([^\s:]+)/.exec(bruta.trim());
    if (!m || m[1] === '[*]' || m[2] === '[*]') continue;
    const [, de, para] = m;
    t[de] = t[de] || []; t[para] = t[para] || [];
    if (!t[de].includes(para)) t[de].push(para);
  }
  for (const k of Object.keys(t)) t[k].sort();
  return t;
}`, explanation: 'O diagrama de estados é a vista humana da tabela de transições testada na aula de State.' }
],
'adr-02': [
  { id: 'adr-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'No modelo C4, o que é um "contêiner"?', options: ['Sempre um contêiner Docker', 'Uma unidade executável ou de armazenamento (SPA, API, banco, fila)', 'Uma classe', 'Um servidor físico'], answer: 1, explanation: 'Contêiner no C4 não está ligado ao Docker.' },
  { id: 'adr-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'O diagrama de contexto deve listar as tecnologias internas do sistema (bancos e frameworks).', answer: false, explanation: 'O contexto mostra o sistema como uma caixa, pessoas e sistemas externos, sem detalhes tecnológicos.' },
  { id: 'adr-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o nível do C4 à pergunta.', pairs: [['Contexto', 'Quem usa o sistema e com quem ele se integra?'], ['Contêineres', 'Que aplicações e armazenamentos o compõem?'], ['Componentes', 'Como um contêiner é decomposto?'], ['Código', 'Como um componente é implementado?']], explanation: 'Zoom progressivo.' },
  { id: 'adr-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarRelacoes(relacoes)§: cada relação é §{ de, para, rotulo, tecnologia }§. Devolva a lista de problemas (texto), na ordem das relações e, dentro de cada uma, na ordem: §"rótulo ausente: de → para"§ (se §rotulo§ vazio ou ausente), §"tecnologia ausente: de → para"§ e §"relação para si mesmo: de"§ (se §de === para§).', lang: 'javascript', starter: 'function verificarRelacoes(relacoes) {\n  // seu código aqui\n}\n', hints: ['Use trim() para tratar textos só com espaços como vazios.', 'Acumule os problemas em um array.'], tests: [{ name: 'problemas', code: R`const r = [{ de: 'spa', para: 'api', rotulo: 'Chama', tecnologia: 'JSON/HTTPS' }, { de: 'api', para: 'db', rotulo: '', tecnologia: 'SQL' }, { de: 'api', para: 'fila', rotulo: 'Enfileira' }, { de: 'x', para: 'x', rotulo: ' ', tecnologia: ' ' }];
assert.equal(JSON.stringify(verificarRelacoes(r)), JSON.stringify(['rótulo ausente: api → db', 'tecnologia ausente: api → fila', 'rótulo ausente: x → x', 'tecnologia ausente: x → x', 'relação para si mesmo: x']));` }, { name: 'sem problemas', code: R`assert.equal(JSON.stringify(verificarRelacoes([{ de: 'a', para: 'b', rotulo: 'Usa', tecnologia: 'HTTPS' }])), '[]');
assert.equal(JSON.stringify(verificarRelacoes([])), '[]');` }], solution: R`function verificarRelacoes(relacoes) {
  const p = [];
  for (const r of relacoes) {
    if (!r.rotulo || !r.rotulo.trim()) p.push('rótulo ausente: ' + r.de + ' → ' + r.para);
    if (!r.tecnologia || !r.tecnologia.trim()) p.push('tecnologia ausente: ' + r.de + ' → ' + r.para);
    if (r.de === r.para) p.push('relação para si mesmo: ' + r.de);
  }
  return p;
}`, explanation: 'Setas sem verbo e sem protocolo são o defeito mais comum dos diagramas C4.' },
  { id: 'adr-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Você precisa documentar a arquitetura de um sistema existente para quem está chegando na equipe. Que diagramas C4 faria primeiro, que boas práticas de notação seguiria e que ferramentas usaria?', model: 'Começo com o diagrama de contexto (uma página, poucas pessoas e sistemas externos, sem tecnologias internas) e o de contêineres (SPA, API, banco, fila, com tecnologia e protocolo em cada seta e responsabilidade em uma frase), e só detalho componentes dos contêineres que precisam. Cada diagrama tem título com nível e escopo, legenda, um único nível, nomes consistentes e setas com verbo; o que é planejado é marcado com outro estilo. Uso Mermaid (renderizável e versionado no Markdown; a documentação lista legenda, tags, links e sprites como não suportados) e considero o Structurizr quando houver muitas vistas a manter coerentes. Ligo os contêineres aos ADRs que explicam as decisões e valido a sintaxe no CI.', rubric: ['Contexto e contêineres primeiro', 'Notação: título, legenda, verbo e tecnologia', 'Ferramentas e limites do Mermaid', 'Ligação com ADRs e CI'], explanation: 'Resumo da aula.' },
  { id: 'adr-02-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §elementosOrfaos(elementos, relacoes)§: §elementos§ é uma lista de nomes; §relacoes§ é uma lista de §{ de, para }§. Devolva, em ordem alfabética, os elementos que não participam de nenhuma relação (nem como origem nem como destino).', lang: 'javascript', starter: 'function elementosOrfaos(elementos, relacoes) {\n  // seu código aqui\n}\n', hints: ['Monte um Set com todos os nomes usados nas relações.', 'Ordene o resultado.'], tests: [{ name: 'órfãos', code: R`const rel = [{ de: 'spa', para: 'api' }, { de: 'api', para: 'db' }];
assert.equal(JSON.stringify(elementosOrfaos(['spa', 'api', 'db', 'fila', 'cache'], rel)), '["cache","fila"]');` }, { name: 'bordas', code: R`assert.equal(JSON.stringify(elementosOrfaos([], [])), '[]');
assert.equal(JSON.stringify(elementosOrfaos(['b', 'a'], [])), '["a","b"]');
assert.equal(JSON.stringify(elementosOrfaos(['a'], [{ de: 'a', para: 'a' }])), '[]');` }], solution: R`function elementosOrfaos(elementos, relacoes) {
  const usados = new Set();
  for (const r of relacoes) { usados.add(r.de); usados.add(r.para); }
  return elementos.filter((e) => !usados.has(e)).sort();
}`, explanation: 'Elementos sem relações costumam ser restos de diagramas desatualizados.' }
],
'adr-03': [
  { id: 'adr-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que um ADR registra?', options: ['O código-fonte de uma decisão', 'Uma decisão arquitetural significativa, com contexto, alternativas e consequências', 'O histórico de commits', 'A lista de bugs'], answer: 1, explanation: 'Responde "por que é assim?".' },
  { id: 'adr-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Quando a decisão de um ADR aceito muda, o correto é reescrever o ADR antigo.', answer: false, explanation: 'Crie um ADR novo que o substitui e atualize só o status do antigo (ligação recíproca).' },
  { id: 'adr-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o defeito do ADR ao exemplo do laboratório.', pairs: [['Sem alternativas reais', 'Lista com apenas "Nenhuma"'], ['Consequências só positivas', '"Tudo ótimo."'], ['Status inválido', '"Talvez"'], ['Substituição inexistente', 'Substituído por ADR-0099']], explanation: 'Os três ADRs defeituosos acumularam 9 problemas (exit 1).' },
  { id: 'adr-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §secao(texto, nome)§: devolve o conteúdo (sem espaços nas pontas) da seção §## nome§ de um Markdown, que vai até a próxima linha que comece com §## § ou até o fim; devolve §null§ se a seção não existir.', lang: 'javascript', starter: 'function secao(texto, nome) {\n  // seu código aqui\n}\n', hints: ['Percorra as linhas procurando "## " + nome.', 'Pare ao encontrar a próxima linha "## ".'], tests: [{ name: 'seções', code: R`const t = '# ADR-0001: x\n\n## Status\nAceito\n\n## Contexto\nLinha 1\nLinha 2\n\n## Decisão\nFazer';
assert.equal(secao(t, 'Status'), 'Aceito');
assert.equal(secao(t, 'Contexto'), 'Linha 1\nLinha 2');
assert.equal(secao(t, 'Decisão'), 'Fazer');` }, { name: 'ausente e vazia', code: R`const t = '## A\n\n## B\ntexto';
assert.equal(secao(t, 'C'), null);
assert.equal(secao(t, 'A'), '');
assert.equal(secao('## Decisão extra\nx', 'Decisão'), null);` }], solution: R`function secao(texto, nome) {
  const linhas = texto.split('\n'); const buf = []; let dentro = false; let achou = false;
  for (const l of linhas) {
    if (/^## /.test(l)) {
      if (dentro) break;
      if (l.trim() === '## ' + nome) { dentro = true; achou = true; }
      continue;
    }
    if (dentro) buf.push(l);
  }
  return achou ? buf.join('\n').trim() : null;
}`, explanation: 'Base do verificador de ADRs do laboratório (que usa uma expressão regular).' },
  { id: 'adr-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique quando escrever um ADR, o que o torna bom e como tratar a mudança de uma decisão antiga. Use o exemplo do cache em memória e do Redis.', model: 'Escreve-se um ADR para decisões significativas, difíceis de reverter ou de impacto amplo (estrutura, tecnologias, interfaces, requisitos não funcionais, convenções) e também para decisões de não fazer. Um bom ADR é curto, trata uma decisão, traz contexto factual, pelo menos duas alternativas reais com o porquê de não escolhê-las, consequências positivas e negativas com riscos e um gatilho de revisão. Se o contexto muda, não se reescreve o ADR: no exemplo, o cache em memória (ADR-0003, uma instância) foi substituído pelo cache com Redis (ADR-0005) quando surgiram três réplicas; o novo declara que substitui o antigo e o antigo passa a "Substituído por ADR-0005", preservando o histórico.', rubric: ['Quando escrever', 'Alternativas reais e consequências negativas', 'Imutabilidade e substituição', 'Exemplo do cache'], explanation: 'Resumo da aula.' },
  { id: 'adr-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarSubstituicoes(adrs)§: cada ADR é §{ numero, status, substitui }§ (§substitui§ é uma lista de números como §"0003"§). Para cada ADR cujo status seja §"Substituído por ADR-XXXX"§, na ordem da lista: se §XXXX§ não existir, devolva §"ADR-<numero>: ADR-XXXX inexistente"§; se existir mas seu §substitui§ não contiver o número, devolva §"ADR-<numero>: ADR-XXXX não declara a substituição"§. Devolva a lista de mensagens.', lang: 'javascript', starter: 'function verificarSubstituicoes(adrs) {\n  // seu código aqui\n}\n', hints: ['Monte um mapa numero → adr.', 'Extraia XXXX com uma regex do status.'], tests: [{ name: 'válido', code: R`const adrs = [{ numero: '0003', status: 'Substituído por ADR-0005', substitui: [] }, { numero: '0005', status: 'Aceito', substitui: ['0003'] }];
assert.equal(JSON.stringify(verificarSubstituicoes(adrs)), '[]');` }, { name: 'problemas', code: R`const adrs = [{ numero: '0001', status: 'Substituído por ADR-0099', substitui: [] }, { numero: '0002', status: 'Substituído por ADR-0004', substitui: [] }, { numero: '0004', status: 'Aceito', substitui: [] }, { numero: '0005', status: 'Aceito', substitui: [] }];
assert.equal(JSON.stringify(verificarSubstituicoes(adrs)), JSON.stringify(['ADR-0001: ADR-0099 inexistente', 'ADR-0002: ADR-0004 não declara a substituição']));` }], solution: R`function verificarSubstituicoes(adrs) {
  const porNumero = Object.fromEntries(adrs.map((a) => [a.numero, a]));
  const msgs = [];
  for (const a of adrs) {
    const m = /^Substituído por ADR-(\d{4})$/.exec(a.status);
    if (!m) continue;
    const alvo = porNumero[m[1]];
    if (!alvo) msgs.push('ADR-' + a.numero + ': ADR-' + m[1] + ' inexistente');
    else if (!alvo.substitui.includes(a.numero)) msgs.push('ADR-' + a.numero + ': ADR-' + m[1] + ' não declara a substituição');
  }
  return msgs;
}`, explanation: 'A reciprocidade garante que o histórico pode ser percorrido nos dois sentidos.' }
],
'adr-04': [
  { id: 'adr-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que significa começar um documento com BLUF?', options: ['Listar toda a história do projeto', 'Abrir com a decisão ou o pedido ao leitor', 'Começar pelas tecnologias', 'Esconder as alternativas'], answer: 1, explanation: 'Quem lê só o primeiro parágrafo ainda entende o essencial.' },
  { id: 'adr-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Uma matriz de decisão ponderada com notas de 1 a 5 produz um resultado objetivo e indiscutível.', answer: false, explanation: 'Notas e pesos são subjetivos e pesos diferentes podem mudar o vencedor: faça análise de sensibilidade.' },
  { id: 'adr-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o tipo de documentação (Diátaxis) ao exemplo.', pairs: [['Tutorial', 'Construindo sua primeira API passo a passo'], ['Guia prático', 'Como rotacionar um segredo'], ['Referência', 'Tabela de códigos de erro da API'], ['Explicação', 'Por que escolhemos o Redis (ADR)']], explanation: 'Quatro tipos com objetivos diferentes.' },
  { id: 'adr-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §avaliar(criterios, alternativas)§: §criterios§ é uma lista de §{ nome, peso }§ (os pesos devem somar 100; senão lance §Error("os pesos devem somar 100")§); §alternativas§ é um objeto nome → { criterio: nota } com notas inteiras de 1 a 5 (nota fora disso: §Error("nota inválida")§). Devolva a lista §[{ nome, total }]§ ordenada por total decrescente (empate: nome), com §total = soma(nota * peso / 100)§ arredondado a 2 casas.', lang: 'javascript', starter: 'function avaliar(criterios, alternativas) {\n  // seu código aqui\n}\n', hints: ['Valide os pesos antes de calcular.', 'Arredonde com Math.round(x * 100) / 100.'], tests: [{ name: 'ranking', code: R`const crit = [{ nome: 'operação', peso: 40 }, { nome: 'consistência', peso: 35 }, { nome: 'custo', peso: 25 }];
const r = avaliar(crit, { monolito: { operação: 5, consistência: 5, custo: 4 }, microsservicos: { operação: 2, consistência: 3, custo: 2 }, hibrido: { operação: 4, consistência: 4, custo: 3 } });
assert.equal(JSON.stringify(r), '[{"nome":"monolito","total":4.75},{"nome":"hibrido","total":3.75},{"nome":"microsservicos","total":2.35}]');` }, { name: 'validações e empate', code: R`assert.throws(() => avaliar([{ nome: 'a', peso: 50 }], { x: { a: 3 } }), 'os pesos devem somar 100');
assert.throws(() => avaliar([{ nome: 'a', peso: 100 }], { x: { a: 6 } }), 'nota inválida');
assert.throws(() => avaliar([{ nome: 'a', peso: 100 }], { x: { a: 2.5 } }), 'nota inválida');
const r = avaliar([{ nome: 'a', peso: 100 }], { zeta: { a: 3 }, alfa: { a: 3 } });
assert.equal(JSON.stringify(r.map((x) => x.nome)), '["alfa","zeta"]');` }], solution: R`function avaliar(criterios, alternativas) {
  if (criterios.reduce((s, c) => s + c.peso, 0) !== 100) throw new Error('os pesos devem somar 100');
  return Object.entries(alternativas).map(([nome, notas]) => {
    let total = 0;
    for (const c of criterios) {
      const n = notas[c.nome];
      if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('nota inválida');
      total += (n * c.peso) / 100;
    }
    return { nome, total: Math.round(total * 100) / 100 };
  }).sort((a, b) => b.total - a.total || (a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0));
}`, explanation: 'É o cálculo da matriz do laboratório (dados hipotéticos).' },
  { id: 'adr-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Você precisa convencer a liderança a adotar um cache distribuído. Como estruturaria a comunicação (documento e apresentação), que dados levaria e como evitaria a pseudo-objetividade de uma matriz de decisão?', model: 'Abro com o pedido e o prazo (BLUF), explico o que mudou (três réplicas e leituras divergentes), apresento duas a quatro opções com prós, contras, custos e riscos, a recomendação, o plano de reversão e o gatilho de revisão, em linguagem de efeitos (menos risco em promoções) e não de siglas. Levo evidências (medições de p95 e carga, protótipo com tempo limitado). Se usar uma matriz ponderada, explicito critérios e pesos, mostro que as notas são opiniões, faço análise de sensibilidade variando os pesos para ver se o vencedor muda, uso a matriz para expor desacordos e anexo-a ao ADR com a data. O resultado é registrado como ADR no mesmo dia.', rubric: ['Pedido e contexto primeiro (BLUF)', 'Opções, riscos, reversão e gatilho', 'Evidências e linguagem adequada', 'Análise de sensibilidade e registro'], explanation: 'Resumo da aula.' },
  { id: 'adr-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §vencedorSem(criterios, alternativas, nome)§: remove o critério §nome§, reescala os pesos restantes para somarem 100 (proporcionalmente) e devolve o nome da alternativa de maior total (empate: ordem alfabética). Notas são de 1 a 5; não precisa validar. Use para ver se o resultado muda sem um critério (análise de sensibilidade).', lang: 'javascript', starter: 'function vencedorSem(criterios, alternativas, nome) {\n  // seu código aqui\n}\n', hints: ['Some os pesos dos critérios restantes e divida cada peso por essa soma.', 'Calcule o total de cada alternativa e ordene.'], tests: [{ name: 'muda o vencedor', code: R`const crit = [{ nome: 'x', peso: 60 }, { nome: 'y', peso: 40 }];
const alt = { A: { x: 5, y: 1 }, B: { x: 2, y: 5 } };
assert.equal(vencedorSem(crit, alt, 'inexistente'), 'A');
assert.equal(vencedorSem(crit, alt, 'x'), 'B');
assert.equal(vencedorSem(crit, alt, 'y'), 'A');` }, { name: 'empate', code: R`const crit = [{ nome: 'x', peso: 50 }, { nome: 'y', peso: 50 }];
assert.equal(vencedorSem(crit, { zeta: { x: 3, y: 3 }, alfa: { x: 3, y: 3 } }, 'x'), 'alfa');
assert.equal(vencedorSem([{ nome: 'x', peso: 50 }, { nome: 'y', peso: 20 }, { nome: 'z', peso: 30 }], { P: { x: 1, y: 5, z: 5 }, Q: { x: 5, y: 2, z: 2 } }, 'x'), 'P');` }], solution: R`function vencedorSem(criterios, alternativas, nome) {
  const resto = criterios.filter((c) => c.nome !== nome);
  const soma = resto.reduce((s, c) => s + c.peso, 0);
  const totais = Object.entries(alternativas).map(([n, notas]) => ({ n, t: resto.reduce((s, c) => s + notas[c.nome] * (c.peso / soma), 0) }));
  totais.sort((a, b) => b.t - a.t || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0));
  return totais[0].n;
}`, explanation: 'Se o vencedor muda ao remover um critério, a decisão depende fortemente dele: discuta o peso.' }
]
};

const P = 'arquitetura-docs-p';
export const assessment = {
  id: 'arquitetura-docs', title: 'Avaliação final — Documentação arquitetural', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual nível do C4 mostra as aplicações e os armazenamentos que compõem o sistema, com tecnologias?', options: ['Contexto', 'Contêineres', 'Código', 'Panorama'], answer: 1, explanation: 'O nível 2 (contêineres) traz SPA, API, banco e fila com tecnologia e protocolo.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Um ADR aceito deve ser reescrito quando a decisão muda.', answer: false, explanation: 'Substitui-se por um novo ADR e só o status do antigo muda.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Verificador de ADRs do laboratório aplicado aos exemplos.', code: 'node adr-lint.mjs adrs               -> ADRs OK\nnode adr-lint.mjs exemplos-invalidos -> 9 problema(s)', lang: 'text', steps: [{ q: 'Qual o código de saída para o diretório de exemplos inválidos (use um número)?', answers: ['1'] }, { q: 'Quantos problemas ele reportou (use um número)?', answers: ['9'] }], explanation: 'O verificador devolve exit 1 quando há problemas.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'O que a renderização bem-sucedida de um diagrama Mermaid no CI garante?', options: ['Que ele está correto e atualizado', 'Que a sintaxe é válida', 'Que o sistema funciona', 'Nada'], answer: 1, explanation: 'Valida só a sintaxe; o mmdc devolveu exit 1 em um diagrama inválido.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que viola uma boa prática de ADR.', code: '## Status\nAceito\n## Alternativas consideradas\n- Nenhuma\n## Consequências\nTudo ótimo.', answer: 4, explanation: 'Alternativas reais são obrigatórias (pelo menos duas) para um ADR aceito.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a regra de imutabilidade.', code: 'O ADR antigo passa a "[[0]] por ADR-0005" e o novo declara "[[1]] ADR-0003".', answers: [['Substituído'], ['Substitui']], explanation: 'A ligação é recíproca.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o documento ao uso.', pairs: [['ADR', 'Registro de uma decisão'], ['Design doc', 'Solução completa de um projeto'], ['RFC', 'Proposta debatida com prazo e decisores'], ['Diagrama de contexto', 'Sistema, pessoas e sistemas externos']], explanation: 'Cada documento com um propósito.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido: o PlantUML aceitou (exit 0) qual arquivo defeituoso?', options: ['Um arquivo com classe sem fechar e seta sem destino final', 'Um arquivo com loop sem fim e seta sem destino', 'Um arquivo vazio', 'Nenhum'], answer: 1, explanation: 'O PlantUML é tolerante: valide visualmente. O arquivo com sintaxe quebrada de verdade deu exit 200.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Pesos diferentes em uma matriz de decisão podem mudar o vencedor, por isso é recomendável uma análise de sensibilidade.', answer: true, explanation: 'Os números parecem objetivos, mas notas e pesos são opiniões.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual prática mantém a documentação viva?', options: ['Wiki sem donos', 'Markdown no repositório, revisão em PR e CI que valida ADRs e diagramas', 'Documento único gigante', 'Diagramas em apresentações antigas'], answer: 1, explanation: 'Docs as code com verificações automáticas e donos.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Monte o plano de documentação arquitetural de um sistema de pedidos (diagramas, ADRs, processo, CI e manutenção).', model: 'Diagrama de contexto e de contêineres como base (e componentes só do contêiner central), mais sequência para o fluxo de pagamento com compensação e estados do pedido, todos como código (Mermaid) no repositório, com título, legenda e relações rotuladas. ADRs numerados em docs/adr para decisões significativas (banco, estilo de API, cache, estrutura), incluindo as rejeitadas, com alternativas, consequências e gatilhos; substituição recíproca. Design docs e RFCs para mudanças grandes, com BLUF, prazo e decisores. CI que renderiza os diagramas, verifica os ADRs, checa links e gera o índice; donos e datas de revisão; referência gerada de OpenAPI e do esquema; organização por Diátaxis (ou arc42 como checklist).', rubric: ['Diagramas C4/UML como código', 'ADRs com alternativas e substituição', 'Design doc e RFC', 'CI e manutenção (donos, geração a partir da fonte)'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual limitação do C4 no Mermaid foi apontada na aula?', options: ['Não renderiza nada', 'Recursos como legenda, tags, links e sprites não são suportados e o layout é automático', 'Só funciona em Windows', 'Exige Java'], answer: 1, explanation: 'Segundo a documentação do Mermaid; Structurizr é uma alternativa com modelo único (não executada).' }
  ]
};

export const project = {
  id: 'dossie-arquitetural', name: 'Dossiê arquitetural: C4, UML, ADRs e comunicação com documentação como código', lv: 'M', stack: 'Markdown, Mermaid, PlantUML (opcional), Node.js', ds: ['adr'],
  desc: 'Produza o **dossiê arquitetural** de um sistema (real ou fictício): **diagramas C4** (contexto e contêineres, componentes do contêiner central), **UML essencial** (sequência do fluxo crítico, estados do ciclo de vida, ER do dados), **ADRs** das decisões principais (incluindo uma **rejeitada** e uma **substituída**), um **design doc** curto com **BLUF** e uma **matriz de decisão** com **análise de sensibilidade**, tudo como **código no repositório** com **verificação em CI**.',
  rf: ['Diagrama de contexto e de contêineres (C4) com título, legenda, tecnologia e protocolo em cada relação', 'Diagrama de sequência do fluxo crítico com o caminho de falha e diagrama de estados do ciclo de vida', 'Pelo menos 5 ADRs numerados (um rejeitado e um substituído com ligação recíproca) com alternativas reais e consequências negativas', 'Um design doc de uma funcionalidade com objetivos, não objetivos, alternativas, riscos, plano e reversão', 'Uma matriz de decisão ponderada com pesos que somam 100, notas justificadas e análise de sensibilidade', 'Script de verificação de ADRs, geração do índice e renderização dos diagramas executáveis em CI', 'README que aponta para contexto, contêineres, ADRs e design doc', 'Registro do que foi renderizado e validado e do que não foi (limitações)'],
  rnf: ['Diagramas e ADRs em texto no repositório, revisáveis em PR', 'Nenhum dado sensível nem topologia interna em diagramas publicados', 'Um nível por diagrama e nomes consistentes (glossário)', 'Dono e data de revisão em cada documento'],
  ac: ['O CI falha se um diagrama tiver sintaxe inválida ou um ADR violar o formato', 'Cada contêiner relevante aponta para o ADR que justifica sua escolha', 'Uma pessoa nova entende o sistema em 15 minutos a partir do contexto e dos contêineres', 'A matriz tem anexo de sensibilidade mostrando se o vencedor muda', 'As decisões rejeitadas e substituídas preservam o histórico'],
  ch: ['Modelar o sistema no Structurizr e gerar as vistas a partir de um único modelo', 'Gerar o diagrama ER a partir do esquema do banco no CI', 'Publicar o dossiê como site (Docusaurus, MkDocs) com busca', 'Adicionar testes de arquitetura (dependency-cruiser) que verifiquem as fronteiras dos diagramas']
};
