// C6.6 — Monitoramento: exercícios, avaliação final e projeto.
// Medições do laboratório: Prometheus 3.16.0, Alertmanager 0.35.1, Grafana 13.3.2, Node 26.13.1. Os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'mon-01': [
  { id: 'mon-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual tipo de métrica só cresce (e reinicia em 0 quando o processo reinicia) e deve ser consultada com rate()?', options: ['Gauge', 'Counter', 'Summary', 'Label'], answer: 1, explanation: 'Counter: taxa e incremento, nunca o valor bruto.' },
  { id: 'mon-01-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o p95 do histograma (0,375 s) foi igual ao p95 exato dos logs (300,172 ms).', answer: false, explanation: 'Diferem pela largura do bucket (0,25 a 0,5 s).' },
  { id: 'mon-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o modelo ao que descreve.', pairs: [['RED', 'Taxa, erros e duração de um serviço'], ['USE', 'Utilização, saturação e erros de recursos'], ['Quatro sinais dourados', 'Latência, tráfego, erros e saturação'], ['Cardinalidade', 'Número de séries geradas por combinações de rótulos']], explanation: 'Modelos de monitoramento.' },
  { id: 'mon-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §parsearExposicao(texto)§: lê o formato de exposição do Prometheus. Ignore linhas vazias e as que começam com §#§. Cada linha de amostra é §nome§ ou §nome{rotulos}§ seguido de espaço e valor. Devolva uma lista de §{ nome, rotulos, valor }§ com os rótulos como objeto (§chave="valor"§ separados por vírgula) e o valor numérico (§+Inf§ vira §Infinity§, §-Inf§ vira §-Infinity§, §NaN§ vira §NaN§). Linhas que não casam: lance §Error("linha inválida: ...")§ com a linha.', lang: 'javascript', starter: 'function parsearExposicao(texto) {\n  // seu código aqui\n}\n', hints: ['Use uma expressão regular para nome, rótulos opcionais e valor.', 'Extraia os rótulos com outra regex global.'], tests: [{ name: 'laboratório', code: R`const t = '# TYPE http_requests_total counter\nhttp_requests_total{rota="/ok",status="200"} 1190\nhttp_requests_total{rota="/erro",status="500"} 120\n\nup 1\n';
assert.equal(JSON.stringify(parsearExposicao(t)), '[{"nome":"http_requests_total","rotulos":{"rota":"/ok","status":"200"},"valor":1190},{"nome":"http_requests_total","rotulos":{"rota":"/erro","status":"500"},"valor":120},{"nome":"up","rotulos":{},"valor":1}]');` }, { name: 'infinitos e erro', code: R`const r = parsearExposicao('latencia_bucket{le="+Inf"} 7\nx +Inf\ny NaN');
assert.equal(r[0].rotulos.le, '+Inf');
assert.equal(r[1].valor, Infinity);
assert.equal(Number.isNaN(r[2].valor), true);
assert.throws(() => parsearExposicao('isto nao e uma amostra valida'), 'linha inválida');` }], solution: R`function parsearExposicao(texto) {
  const out = [];
  for (const bruta of texto.split('\n')) {
    const l = bruta.trim();
    if (!l || l.startsWith('#')) continue;
    const m = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]*)\})? (\S+)$/.exec(l);
    if (!m) throw new Error('linha inválida: ' + l);
    const rotulos = {};
    if (m[2]) for (const r of m[2].matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="([^"]*)"/g)) rotulos[r[1]] = r[2];
    const valor = m[3] === '+Inf' ? Infinity : m[3] === '-Inf' ? -Infinity : Number(m[3]);
    out.push({ nome: m[1], rotulos, valor });
  }
  return out;
}`, explanation: 'É o que o Prometheus faz a cada scrape, em versão simplificada.' },
  { id: 'mon-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que médias escondem problemas de latência e por que o p95 do histograma pode diferir do exato, usando os números do laboratório. Como reduzir o erro?', model: 'A média do ciclo de latências de /ok era cerca de 71 ms (5, 8, 12, 20, 35, 50, 70, 90, 120 e 300 ms), o que parece ótimo, mas o p95 exato era 300,172 ms: 10% das requisições são 4 a 8 vezes mais lentas que a mediana, e a média as esconde. O histograma guarda contagens por bucket e interpola linearmente dentro do bucket em que cai o quantil: 90% das amostras ficaram em até 0,25 s e o p95 caiu no bucket (0,25 s; 0,5 s], dando 0,25 + 0,25 x (0,95 − 0,90)/(1,00 − 0,90) = 0,375 s, ou cerca de 25% acima do exato. Reduz-se o erro com buckets mais finos em torno dos limites de SLO, histogramas nativos ou cálculo pontual a partir de logs e traces.', rubric: ['Média x cauda com números', 'Interpolação por bucket', 'Cálculo 0,375 s', 'Mitigação (buckets, nativos, logs)'], explanation: 'Resumo da aula.' },
  { id: 'mon-01-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §percentilExato(valores, q)§ (postos mais próximos): ordene uma cópia e devolva o elemento de índice §Math.ceil(q * n) - 1§, para §0 < q <= 1§. Lista vazia: lance §Error("sem amostras")§; §q§ fora do intervalo: §Error("q inválido")§.', lang: 'javascript', starter: 'function percentilExato(valores, q) {\n  // seu código aqui\n}\n', hints: ['Não altere o array original.', 'Valide q antes de calcular.'], tests: [{ name: 'ciclo do laboratório', code: R`const v = [300, 5, 8, 12, 20, 35, 50, 70, 90, 120];
assert.equal(percentilExato(v, 0.95), 300);
assert.equal(percentilExato(v, 0.5), 35);
assert.equal(percentilExato(v, 1), 300);
assert.equal(v[0], 300);` }, { name: 'erros', code: R`assert.throws(() => percentilExato([], 0.5), 'sem amostras');
assert.throws(() => percentilExato([1], 0), 'q inválido');
assert.throws(() => percentilExato([1], 1.5), 'q inválido');
assert.equal(percentilExato([7], 0.99), 7);` }], solution: R`function percentilExato(valores, q) {
  if (!valores.length) throw new Error('sem amostras');
  if (!(q > 0 && q <= 1)) throw new Error('q inválido');
  const o = valores.slice().sort((a, b) => a - b);
  return o[Math.ceil(q * o.length) - 1];
}`, explanation: 'Mostra a mediana (35) e a cauda (300) do ciclo de latências.' }
],
'mon-02': [
  { id: 'mon-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que o Prometheus faz com uma regra de gravação?', options: ['Dispara alertas', 'Pré-calcula uma expressão e guarda o resultado como nova série', 'Apaga séries antigas', 'Cria dashboards'], answer: 1, explanation: 'Painéis e alertas ficam mais simples e consistentes.' },
  { id: 'mon-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: antes do primeiro status 500, a razão de erros retornou 0.', answer: false, explanation: 'Retornou vazio: a série 5xx ainda não existia; ausência não é zero.' },
  { id: 'mon-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o resultado do promtool ao comando.', pairs: [['SUCCESS: 4 rules found', 'check config'], ['parse error: unclosed left parenthesis', 'check rules na regra quebrada'], ['SUCCESS (teste correto)', 'test rules'], ['got: []', 'test rules esperando alerta cedo demais']], explanation: 'Saídas do laboratório.' },
  { id: 'mon-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §taxaDeCounter(amostras)§: §amostras§ é uma lista de §{ t, v }§ ordenada por §t§ (segundos). O incremento é a soma, para cada par consecutivo, de §v − anterior§ se §v >= anterior§; se o contador reiniciou (§v < anterior§), o incremento é o próprio §v§. Devolva §{ incremento, taxa }§ com §taxa = incremento / (ultimo.t − primeiro.t)§. Com menos de 2 amostras ou intervalo zero, lance §Error("amostras insuficientes")§.', lang: 'javascript', starter: 'function taxaDeCounter(amostras) {\n  // seu código aqui\n}\n', hints: ['Percorra os pares consecutivos.', 'Reinício: v menor que o anterior.'], tests: [{ name: 'crescimento e reinício', code: R`assert.equal(JSON.stringify(taxaDeCounter([{ t: 0, v: 0 }, { t: 5, v: 50 }, { t: 10, v: 100 }])), '{"incremento":100,"taxa":10}');
assert.equal(JSON.stringify(taxaDeCounter([{ t: 0, v: 0 }, { t: 5, v: 50 }, { t: 10, v: 10 }])), '{"incremento":60,"taxa":6}');` }, { name: 'erros', code: R`assert.throws(() => taxaDeCounter([{ t: 0, v: 1 }]), 'amostras insuficientes');
assert.throws(() => taxaDeCounter([{ t: 3, v: 1 }, { t: 3, v: 2 }]), 'amostras insuficientes');
assert.equal(taxaDeCounter([{ t: 0, v: 5 }, { t: 10, v: 5 }]).taxa, 0);` }], solution: R`function taxaDeCounter(amostras) {
  if (amostras.length < 2) throw new Error('amostras insuficientes');
  const dt = amostras[amostras.length - 1].t - amostras[0].t;
  if (dt <= 0) throw new Error('amostras insuficientes');
  let inc = 0;
  for (let i = 1; i < amostras.length; i++) {
    const a = amostras[i - 1].v, v = amostras[i].v;
    inc += v >= a ? v - a : v;
  }
  return { incremento: inc, taxa: inc / dt };
}`, explanation: 'O rate() do Prometheus faz isso com extrapolação nas bordas da janela; este modelo é simplificado.' },
  { id: 'mon-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique como o intervalo de scrape, a janela do rate e a avaliação das regras se somam no tempo até um alerta, e como a razão de erros demorou ~10 s para passar de 5% no laboratório.', model: 'O dado tem a idade do último scrape (até 5 s no laboratório), a regra só é avaliada a cada evaluation_interval (5 s), a janela do rate (30 s) suaviza e atrasa, e a cláusula for adiciona espera; a soma desses atrasos é o tempo até o alerta. Ao injetar 30% de erros, a janela de 30 s ainda continha cerca de 25 s de tráfego saudável, então a proporção de erros só passou de 5% depois de uns 10 s (pending a +10 s); o firing veio a +25 s e o webhook a +30 s. A janela deve ter pelo menos 4 vezes o intervalo de scrape; janelas curtas dão resultados instáveis e janelas longas atrasam a detecção.', rubric: ['Soma dos atrasos', 'Efeito da janela de 30 s', 'Números medidos', 'Janela mínima de 4 vezes o scrape'], explanation: 'Resumo da aula.' },
  { id: 'mon-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §quantilHistograma(q, buckets)§ (como o histogram_quantile): §buckets§ é uma lista ordenada de §{ le, c }§ com contagens CUMULATIVAS (o último tem §le: Infinity§). §rank = q * total§ (total = contagem do último). Ache o primeiro bucket com §c >= rank§. Se for o de §Infinity§, devolva o §le§ do bucket anterior; senão interpole: §inferior + (le − inferior) * (rank − cAnterior) / (c − cAnterior)§ (inferior e cAnterior são 0 no primeiro bucket). Total 0: devolva §null§.', lang: 'javascript', starter: 'function quantilHistograma(q, buckets) {\n  // seu código aqui\n}\n', hints: ['Guarde o bucket anterior ao percorrer.', 'O bucket +Inf não tem limite superior para interpolar.'], tests: [{ name: 'p95 do laboratório', code: R`const b = [{ le: 0.1, c: 50 }, { le: 0.25, c: 90 }, { le: 0.5, c: 100 }, { le: Infinity, c: 100 }];
assert.equal(quantilHistograma(0.95, b), 0.375);
assert.equal(quantilHistograma(0.5, b), 0.1);
assert.equal(Math.round(quantilHistograma(0.7, b) * 1e6) / 1e6, 0.175);` }, { name: 'bordas', code: R`assert.equal(quantilHistograma(0.9, [{ le: 0.1, c: 10 }, { le: Infinity, c: 20 }]), 0.1);
assert.equal(quantilHistograma(0.5, [{ le: 1, c: 0 }, { le: Infinity, c: 0 }]), null);
assert.equal(quantilHistograma(1, [{ le: 1, c: 4 }, { le: 2, c: 8 }, { le: Infinity, c: 8 }]), 2);` }], solution: R`function quantilHistograma(q, buckets) {
  const total = buckets[buckets.length - 1].c;
  if (total === 0) return null;
  const rank = q * total;
  let inf = 0, cAnt = 0;
  for (let i = 0; i < buckets.length; i++) {
    const b = buckets[i];
    if (b.c >= rank) {
      if (b.le === Infinity) return inf;
      return inf + ((b.le - inf) * (rank - cAnt)) / (b.c - cAnt);
    }
    inf = b.le; cAnt = b.c;
  }
  return null;
}`, explanation: 'Reproduz a estimativa de 0,375 s do laboratório.' }
],
'mon-03': [
  { id: 'mon-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que provisionar dashboards por arquivos?', options: ['É mais bonito', 'Permite versionar, revisar e reproduzir os dashboards em qualquer ambiente', 'Dispensa o Prometheus', 'Torna o Grafana mais rápido'], answer: 1, explanation: 'Dashboards como código.' },
  { id: 'mon-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'O acesso anônimo como Admin usado no laboratório é adequado para produção.', answer: false, explanation: 'Foi usado só no ambiente local isolado; produção exige SSO, papéis e rede privada.' },
  { id: 'mon-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a verificação por API ao resultado medido.', pairs: [['/api/health', 'database ok, versão 13.3.2'], ['/api/search?type=dash-db', '1 dashboard provisionado'], ['/api/dashboards/uid/app-lab', '3 painéis'], ['/api/datasources/uid/prom/health', 'OK']], explanation: 'Verificações do laboratório.' },
  { id: 'mon-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarDashboard(d)§ e devolva a lista de problemas, nesta ordem: §"sem uid"§ e §"sem título"§ (se faltarem); depois, para cada painel (§i§ a partir de 1, na ordem), §"painel i sem título"§, §"painel i sem datasource"§ (sem §datasource.uid§), §"painel i sem consultas"§ (§targets§ vazio ou ausente) e §"painel i: consulta vazia"§ (algum §expr§ vazio ou ausente); por fim §"id de painel repetido: N"§ para cada id repetido (uma vez, em ordem de primeira repetição).', lang: 'javascript', starter: 'function validarDashboard(d) {\n  // seu código aqui\n}\n', hints: ['Percorra os painéis com índice.', 'Controle os ids vistos e os já reportados.'], tests: [{ name: 'dashboard do laboratório', code: R`const d = { uid: 'app-lab', title: 'App', panels: [
  { id: 1, title: 'RPS', datasource: { uid: 'prom' }, targets: [{ expr: 'app:http_requests:taxa30s' }] },
  { id: 2, title: 'Erros', datasource: { uid: 'prom' }, targets: [{ expr: 'app:http_erros:razao30s' }] }
] };
assert.equal(JSON.stringify(validarDashboard(d)), '[]');` }, { name: 'problemas', code: R`const d = { panels: [
  { id: 1, datasource: {}, targets: [] },
  { id: 1, title: 'B', datasource: { uid: 'prom' }, targets: [{ expr: '' }] },
  { id: 1, title: 'C', datasource: { uid: 'prom' }, targets: [{ expr: 'up' }] }
] };
assert.equal(JSON.stringify(validarDashboard(d)), JSON.stringify(['sem uid', 'sem título', 'painel 1 sem título', 'painel 1 sem datasource', 'painel 1 sem consultas', 'painel 2: consulta vazia', 'id de painel repetido: 1']));` }], solution: R`function validarDashboard(d) {
  const out = [];
  if (!d.uid) out.push('sem uid');
  if (!d.title) out.push('sem título');
  const vistos = new Set(), repetidos = [];
  (d.panels || []).forEach((p, k) => {
    const i = k + 1;
    if (!p.title) out.push('painel ' + i + ' sem título');
    if (!p.datasource || !p.datasource.uid) out.push('painel ' + i + ' sem datasource');
    if (!p.targets || !p.targets.length) out.push('painel ' + i + ' sem consultas');
    else if (p.targets.some((t) => !t.expr)) out.push('painel ' + i + ': consulta vazia');
    if (vistos.has(p.id) && !repetidos.includes(p.id)) repetidos.push(p.id);
    vistos.add(p.id);
  });
  for (const id of repetidos) out.push('id de painel repetido: ' + id);
  return out;
}`, explanation: 'Um linter de dashboards no CI evita painéis sem consulta e ids duplicados.' },
  { id: 'mon-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Projete um dashboard de visão geral de um serviço e o fluxo de dashboards como código. O que a verificação por API do laboratório não prova?', model: 'Visão geral com poucos painéis RED (taxa, razão de erros, latência p95/p99 com a linha do SLO), anotações de deploy, variáveis de serviço e ambiente e links para dashboards por serviço e por recurso (USE). Fluxo: desenhar na interface, exportar o JSON, versionar no Git, revisar por pull request, publicar por provisionamento (ou API/Terraform), com datasource por uid fixo e segredos fora dos arquivos; verificar no CI por API (saúde, dashboard existente, datasource saudável, consulta com dados). A API do laboratório não prova a renderização visual, a legibilidade, as variáveis, a atualização ao vivo nem o desempenho das consultas; o p95 do histograma também é uma estimativa por buckets e deve ser rotulado como tal.', rubric: ['Painéis RED e SLO', 'Dashboards como código', 'Verificação por API', 'Limites do que foi verificado'], explanation: 'Resumo da aula.' },
  { id: 'mon-03-e6', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual prática torna um dashboard mais útil?', options: ['Muitos painéis para ter tudo', 'Começar por perguntas, usar percentis e mostrar o SLO como limite', 'Cores diferentes para cada gráfico sem significado', 'Atualização a cada 100 ms'], answer: 1, explanation: 'Dashboards devem responder a perguntas.' }
],
'mon-04': [
  { id: 'mon-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que a cláusula for faz em uma regra de alerta?', options: ['Define o receiver', 'Exige que a condição se mantenha por um tempo antes de disparar (pending e depois firing)', 'Remove o alerta', 'Cria um silêncio'], answer: 1, explanation: 'Evita alertas por picos curtos.' },
  { id: 'mon-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o webhook recebeu o alerta TaxaDeErroAlta cerca de 30 s depois do início dos erros.', answer: true, explanation: 'pending +10 s, firing +25 s e webhook +30 s (group_wait de 5 s).' },
  { id: 'mon-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a função do Alertmanager ao propósito.', pairs: [['Agrupamento (group_by)', 'Uma notificação para alertas semelhantes'], ['Inibição', 'Suprimir sintomas quando a causa já alertou'], ['Silêncio', 'Suprimir temporariamente, com prazo e motivo'], ['Roteamento', 'Enviar para o receiver conforme os rótulos']], explanation: 'Funções do Alertmanager.' },
  { id: 'mon-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §estadosDoAlerta(valores, limite, forS, passoS)§: para cada avaliação (a cada §passoS§ segundos), a condição é §valor > limite§. Devolva a lista de estados: §"inativo"§ se a condição é falsa (e reinicia a contagem); §"pending"§ enquanto a condição está verdadeira há menos de §forS§ segundos (a primeira avaliação verdadeira conta como 0 s); §"firing"§ quando há pelo menos §forS§ segundos. Com §forS = 0§ dispara na primeira avaliação verdadeira.', lang: 'javascript', starter: 'function estadosDoAlerta(valores, limite, forS, passoS) {\n  // seu código aqui\n}\n', hints: ['Guarde há quanto tempo a condição está verdadeira.', 'Zere a contagem quando a condição falhar.'], tests: [{ name: 'pending e firing', code: R`assert.equal(JSON.stringify(estadosDoAlerta([0, 1, 1, 1, 1, 0], 0.5, 15, 5)), '["inativo","pending","pending","pending","firing","inativo"]');
assert.equal(JSON.stringify(estadosDoAlerta([1, 1], 0.5, 0, 5)), '["firing","firing"]');` }, { name: 'reinício da contagem', code: R`assert.equal(JSON.stringify(estadosDoAlerta([1, 1, 0, 1, 1, 1, 1], 0.5, 10, 5)), '["pending","pending","inativo","pending","pending","firing","firing"]');
assert.equal(JSON.stringify(estadosDoAlerta([], 1, 10, 5)), '[]');` }], solution: R`function estadosDoAlerta(valores, limite, forS, passoS) {
  const out = [];
  let desde = null;
  valores.forEach((v, i) => {
    if (!(v > limite)) { desde = null; out.push('inativo'); return; }
    if (desde === null) desde = i;
    out.push((i - desde) * passoS >= forS ? 'firing' : 'pending');
  });
  return out;
}`, explanation: 'No laboratório: pending a +10 s, firing a +25 s (a condição só passou a valer depois de alguns segundos).' },
  { id: 'mon-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a estratégia de alertas e on-call de um serviço: o que alertar, tempos, agrupamento, severidades, runbooks, SLOs e postmortem. Relacione com as medições do laboratório.', model: 'Alertar por sintomas (taxa de erro e latência, alvo fora do ar) com for para evitar picos e exigir ação humana; o que não exige ação vira painel ou ticket. Escolher os tempos sabendo que o atraso soma janela do rate, scrape, avaliação, for e group_wait (no laboratório, +30 s do início dos erros ao webhook, com resolved a +30 s da recuperação). Alertmanager com agrupamento, roteamento por severidade (crítica acorda, aviso em horário comercial), inibição, silêncios com prazo e motivo, e alerta watchdog para testar o caminho. SLOs com alertas de burn rate em múltiplas janelas (14,4 em 1 h e 5 min; 6 em 6 h; 1 em 3 dias) alinhados ao impacto. Runbooks nas anotações, rotação e escalonamento justos, resposta a incidentes com mitigação primeiro e postmortem sem culpa com ações e donos. Receivers reais e burn rate não foram executados no curso.', rubric: ['Sintoma, for e ação clara', 'Atraso total medido', 'Alertmanager e SLO/burn rate', 'On-call, runbook e postmortem'], explanation: 'Resumo da aula.' },
  { id: 'mon-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §agruparAlertas(alertas, chaves)§: §alertas§ é uma lista de §{ labels }§; §chaves§ é a lista de rótulos do §group_by§. O grupo de um alerta é §chave=valor§ juntando as chaves com vírgula, na ordem de §chaves§ (rótulo ausente = texto vazio). Devolva uma lista ordenada pelo nome do grupo de §{ grupo, quantidade, alertas }§, em que §alertas§ são os §alertname§ ordenados (com repetições).', lang: 'javascript', starter: 'function agruparAlertas(alertas, chaves) {\n  // seu código aqui\n}\n', hints: ['Monte a chave do grupo para cada alerta.', 'Ordene os grupos e os nomes.'], tests: [{ name: 'agrupar por alertname', code: R`const a = [{ labels: { alertname: 'TaxaDeErroAlta', instancia: 'a' } }, { labels: { alertname: 'AppForaDoAr', instancia: 'a' } }, { labels: { alertname: 'TaxaDeErroAlta', instancia: 'b' } }];
assert.equal(JSON.stringify(agruparAlertas(a, ['alertname'])), '[{"grupo":"alertname=AppForaDoAr","quantidade":1,"alertas":["AppForaDoAr"]},{"grupo":"alertname=TaxaDeErroAlta","quantidade":2,"alertas":["TaxaDeErroAlta","TaxaDeErroAlta"]}]');` }, { name: 'duas chaves e ausente', code: R`const a = [{ labels: { alertname: 'X', cluster: 'c1' } }, { labels: { alertname: 'Y', cluster: 'c1' } }, { labels: { alertname: 'Z' } }];
assert.equal(JSON.stringify(agruparAlertas(a, ['cluster'])), '[{"grupo":"cluster=","quantidade":1,"alertas":["Z"]},{"grupo":"cluster=c1","quantidade":2,"alertas":["X","Y"]}]');
assert.equal(JSON.stringify(agruparAlertas([], ['alertname'])), '[]');` }], solution: R`function agruparAlertas(alertas, chaves) {
  const m = new Map();
  for (const a of alertas) {
    const g = chaves.map((k) => k + '=' + (a.labels[k] ?? '')).join(',');
    if (!m.has(g)) m.set(g, []);
    m.get(g).push(a.labels.alertname);
  }
  return [...m.entries()].sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)).map(([grupo, nomes]) => ({ grupo, quantidade: nomes.length, alertas: nomes.sort() }));
}`, explanation: 'Agrupar evita 100 mensagens na queda de um cluster.' }
]
};

const P = 'monitoramento-p';
export const assessment = {
  id: 'monitoramento', title: 'Avaliação final — Monitoramento: métricas, Prometheus, Grafana e alertas', passPct: 70, minutes: 40,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual sinal responde "onde o tempo foi gasto" em um sistema distribuído?', options: ['Logs', 'Traces', 'Gauge', 'Counter'], answer: 1, explanation: 'Traces mostram o caminho de uma requisição.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Rótulos como ID de usuário são uma boa escolha para métricas do Prometheus.', answer: false, explanation: 'Alta cardinalidade explode a memória; use logs ou traces.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Medições de p95 do laboratório.', code: 'p95 exato (logs): 300,172 ms\np95 histograma: 375 ms', lang: 'text', steps: [{ q: 'Diferença em ms (inteiro, arredondando)?', answers: ['75'] }, { q: 'O histograma superestima ou subestima? (palavra)', answers: ['superestima', 'superestimou'] }], explanation: '375 − 300,172 ≈ 75 ms; superestima pela largura do bucket.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que histogram_quantile deve ser aplicado sobre sum by (le)?', options: ['Para acelerar a consulta', 'Para somar os buckets entre instâncias antes de interpolar', 'Para remover rótulos', 'Para converter em gauge'], answer: 1, explanation: 'Quantis por instância não se agregam.' },
    { id: P + '5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a consulta da razão de erros 5xx.', code: 'sum(rate(http_requests_total{status=~"[[0]]"}[30s])) / sum([[1]](http_requests_total[30s]))', answers: [['5..'], ['rate']], explanation: 'Regex 5.. casa com 500 a 599.' },
    { id: P + '6', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna o alerta sujeito a disparar por picos curtos.', code: '- alert: TaxaDeErroAlta\n  expr: app:http_erros:razao30s > 0.05\n  for: 0s\n  labels:\n    severidade: critica', answer: 3, explanation: 'for: 0s dispara na primeira avaliação verdadeira; use um tempo que filtre picos.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a medição do laboratório ao significado.', pairs: [['pending +10 s, firing +25 s', 'Alerta de erros após o início da injeção'], ['webhook +30 s', 'Notificação com group_wait de 5 s'], ['webhook resolved +9 s após docker start', 'Resolução do alvo fora do ar'], ['got: []', 'Teste de regra que esperava o alerta cedo demais']], explanation: 'Resultados das aulas 2 e 4.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Com SLO de 99,9% e razão de erros de 1%, qual o burn rate?', options: ['1', '10', '100', '0,1'], answer: 1, explanation: '0,01 / 0,001 = 10: esgota o orçamento em 3 dias.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'O laboratório verificou visualmente a renderização do dashboard no navegador.', answer: false, explanation: 'Foi verificado apenas pela API; a renderização visual não foi verificada.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual é a melhor definição de alerta acionável?', options: ['Qualquer métrica acima da média', 'Avisa de um sintoma que exige ação humana, com runbook', 'Dispara a cada minuto', 'Envia e-mail para todos'], answer: 1, explanation: 'Alertas devem ter ação clara.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete o monitoramento de uma API: instrumentação, coleta, regras, dashboard e alertas, com SLO e on-call. Informe o que o curso mediu e o que não executou.', model: 'Instrumentar contador por rota e classe de status e histograma de duração com buckets em torno dos limites de SLO, logs JSON com correlação e sem dados pessoais. Prometheus com scrape adequado, regras de gravação para taxa e razão de erros, regras de alerta com for e testes com promtool no CI. Grafana com dashboards como código (datasource por uid, JSON versionado), painéis RED com SLO e anotações de deploy, verificados por API. Alertas por sintoma e por burn rate em múltiplas janelas, Alertmanager com agrupamento, severidades, inibição, silêncios e watchdog, runbooks e postmortem sem culpa. O curso mediu: p95 do histograma 0,375 s contra 300,172 ms exatos, pending +10 s, firing +25 s e webhook +30 s, 1 dashboard com 3 painéis e testes de regras. Não executou: traces, Loki, receivers reais, inibição, silêncios, burn rate, HA e alertas do Grafana.', rubric: ['Instrumentação e cardinalidade', 'Regras testadas e dashboards como código', 'Alertas por sintoma e SLO', 'Honestidade sobre o que foi executado'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual a relação entre janela do rate e tempo até o alerta?', options: ['Nenhuma', 'A janela suaviza e atrasa a detecção: faz parte da soma dos atrasos', 'A janela acelera o alerta', 'Só importa para gauges'], answer: 1, explanation: 'Scrape, avaliação, janela, for e group_wait somam.' }
  ]
};

export const project = {
  id: 'observabilidade-operada', name: 'Observabilidade operada: métricas, regras testadas, dashboard como código e alertas até o webhook', lv: 'M', stack: 'Prometheus, Alertmanager, Grafana, Docker, Node.js, promtool/amtool', ds: ['monitor'],
  desc: 'Instrumente uma **aplicação** (**contadores, histograma, logs JSON**), **colete com o Prometheus**, crie **regras de gravação e de alerta com testes (§promtool test rules§)**, provisione **Grafana como código** (**datasource e dashboard RED**), configure o **Alertmanager com um webhook** e **execute o experimento completo**: **tráfego saudável, erros injetados, recuperação e queda do app**, **medindo o tempo de cada etapa** (**pending, firing, notificação, resolução**) **e comparando o p95 do histograma com o exato dos logs**. **Relate** o que foi **medido** e o que **não foi executado** (**traces, receivers reais, inibição, burn rate**).',
  rf: ['Aplicação com contadores por rota e status, histograma de duração e logs JSON com correlação', 'Prometheus coletando a aplicação e a si mesmo, com regras de gravação de taxa e de razão de erros', 'Regras de alerta com for e rótulos de severidade, validadas com promtool check e testadas com promtool test rules (um teste que passa e um que falha de propósito)', 'Alertmanager com agrupamento e um receiver webhook, validado com amtool', 'Grafana com datasource e dashboard provisionados por arquivos e verificados por API', 'Experimento com tráfego saudável, injeção de erros, recuperação e parada da aplicação, com a linha do tempo medida por consultas query_range e carimbos de tempo', 'Comparação entre o p95 do histograma e o exato dos logs, com explicação da diferença', 'Relatório com resultados, achados e limites'],
  rnf: ['Versões das ferramentas registradas', 'Acesso do Grafana restrito ao laboratório local (127.0.0.1) e identificado como não adequado a produção', 'Recursos do laboratório com prefixo próprio e removidos ao final', 'Medições reproduzíveis por um script'],
  ac: ['O promtool aprova a configuração e as regras e recusa a regra quebrada', 'A linha do tempo mostra pending, firing, webhook e resolved para os dois alertas', 'O p95 do histograma e o exato são reportados e a diferença é explicada', 'A API do Grafana confirma o dashboard e o datasource', 'O relatório informa que traces, receivers reais, inibição e burn rate não foram executados'],
  ch: ['Adicionar node_exporter e cAdvisor e dashboards USE', 'Implementar alertas de burn rate multijanela e testá-los com promtool', 'Adicionar Loki e correlacionar logs e métricas no Grafana', 'Configurar inibição e silêncios e documentar um runbook por alerta']
};
