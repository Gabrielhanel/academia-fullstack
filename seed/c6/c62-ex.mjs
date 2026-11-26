// C6.2 — CI/CD e GitHub Actions: exercícios, avaliação final e projeto.
// Medições do laboratório: actionlint 1.7.12, nginx 1.31.10, Docker 29.9.3. Os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'cicd-01': [
  { id: 'cicd-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual prática descreve melhor a implantação contínua?', options: ['Todo commit é compilado', 'Toda mudança aprovada pelo pipeline vai à produção sem aprovação humana', 'Um humano aprova cada release', 'Os testes rodam à noite'], answer: 1, explanation: 'Na entrega contínua a decisão de publicar ainda é humana.' },
  { id: 'cicd-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Ter uma ferramenta de CI garante integração contínua, mesmo com ramos que vivem semanas.', answer: false, explanation: 'Ramos longos integram em lote; a prática é integrar com frequência.' },
  { id: 'cicd-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a métrica DORA ao que mede.', pairs: [['Frequência de implantação', 'Quantas vezes se publica'], ['Tempo de entrega', 'Do commit à produção'], ['Taxa de falha de mudança', 'Deploys que causam incidente ou rollback'], ['Tempo de recuperação', 'Quanto leva para restaurar o serviço']], explanation: 'As quatro métricas andam juntas.' },
  { id: 'cicd-01-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §metricasDora(deploys)§: §deploys§ é uma lista de §{ commitEm, implantadoEm, falhou, recuperadoEm? }§ (tempos em minutos; §recuperadoEm§ só quando §falhou§). Devolva §{ total, taxaFalha, leadTimeMedianoMin, mttrMedioMin }§: §taxaFalha§ = falhas/total arredondada a 2 casas; mediana de §implantadoEm − commitEm§ (média dos dois centrais se par); §mttrMedioMin§ = média de §recuperadoEm − implantadoEm§ das falhas arredondada ao inteiro, ou §null§ sem falhas. Lista vazia: §{ total: 0, taxaFalha: 0, leadTimeMedianoMin: null, mttrMedioMin: null }§.', lang: 'javascript', starter: 'function metricasDora(deploys) {\n  // seu código aqui\n}\n', hints: ['Ordene os lead times para a mediana.', 'Trate a lista vazia primeiro.'], tests: [{ name: 'exemplo', code: R`const d = [{ commitEm: 0, implantadoEm: 60, falhou: false }, { commitEm: 0, implantadoEm: 120, falhou: true, recuperadoEm: 150 }, { commitEm: 0, implantadoEm: 30, falhou: false }, { commitEm: 0, implantadoEm: 90, falhou: true, recuperadoEm: 100 }];
assert.equal(JSON.stringify(metricasDora(d)), '{"total":4,"taxaFalha":0.5,"leadTimeMedianoMin":75,"mttrMedioMin":20}');` }, { name: 'bordas', code: R`assert.equal(JSON.stringify(metricasDora([])), '{"total":0,"taxaFalha":0,"leadTimeMedianoMin":null,"mttrMedioMin":null}');
assert.equal(JSON.stringify(metricasDora([{ commitEm: 5, implantadoEm: 15, falhou: false }])), '{"total":1,"taxaFalha":0,"leadTimeMedianoMin":10,"mttrMedioMin":null}');
assert.equal(metricasDora([{ commitEm: 0, implantadoEm: 1, falhou: false }, { commitEm: 0, implantadoEm: 1, falhou: false }, { commitEm: 0, implantadoEm: 1, falhou: true, recuperadoEm: 2 }]).taxaFalha, 0.33);` }], solution: R`function metricasDora(deploys) {
  if (!deploys.length) return { total: 0, taxaFalha: 0, leadTimeMedianoMin: null, mttrMedioMin: null };
  const lt = deploys.map((d) => d.implantadoEm - d.commitEm).sort((a, b) => a - b);
  const m = lt.length >> 1;
  const mediana = lt.length % 2 ? lt[m] : (lt[m - 1] + lt[m]) / 2;
  const falhas = deploys.filter((d) => d.falhou);
  const mttr = falhas.length ? Math.round(falhas.reduce((s, d) => s + (d.recuperadoEm - d.implantadoEm), 0) / falhas.length) : null;
  return { total: deploys.length, taxaFalha: Math.round((falhas.length / deploys.length) * 100) / 100, leadTimeMedianoMin: mediana, mttrMedioMin: mttr };
}`, explanation: 'Mediana evita que um outlier distorça o lead time.' },
  { id: 'cicd-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique "construir uma vez e implantar em todo lugar" e por que lotes pequenos e frequentes costumam ser mais seguros, relacionando com as métricas DORA.', model: 'O artefato (imagem, pacote) é construído uma única vez e promovido entre ambientes, com a configuração separada do artefato, de modo que o que foi testado é exatamente o que vai à produção, sem diferenças de build. Lotes pequenos são mais fáceis de revisar, testar e reverter e têm raio de impacto menor, de modo que a frequência de implantação alta anda junto com menor taxa de falha de mudança e menor tempo de recuperação; o lead time também cai porque nada espera um lote grande. Métricas viram meta e perdem sentido (Goodhart): servem para melhorar o sistema, não para ranquear pessoas.', rubric: ['Artefato imutável e configuração separada', 'Lotes pequenos e raio de impacto', 'Relação entre as quatro métricas', 'Cuidado com metas e Goodhart'], explanation: 'Resumo da aula.' },
  { id: 'cicd-01-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §classificarPratica(p)§ com §p = { integraNoTronco, testesAutomaticos, artefatoPronto, aprovacaoHumana }§ (booleanos). Se não §integraNoTronco§ ou não §testesAutomaticos§ → §"sem CI"§; senão se não §artefatoPronto§ → §"CI"§; senão se §aprovacaoHumana§ → §"entrega contínua"§; senão §"implantação contínua"§.', lang: 'javascript', starter: 'function classificarPratica(p) {\n  // seu código aqui\n}\n', hints: ['Avalie na ordem do enunciado.'], tests: [{ name: 'níveis', code: R`assert.equal(classificarPratica({ integraNoTronco: false, testesAutomaticos: true, artefatoPronto: true, aprovacaoHumana: false }), 'sem CI');
assert.equal(classificarPratica({ integraNoTronco: true, testesAutomaticos: false, artefatoPronto: true, aprovacaoHumana: false }), 'sem CI');
assert.equal(classificarPratica({ integraNoTronco: true, testesAutomaticos: true, artefatoPronto: false, aprovacaoHumana: false }), 'CI');` }, { name: 'entrega e implantação', code: R`assert.equal(classificarPratica({ integraNoTronco: true, testesAutomaticos: true, artefatoPronto: true, aprovacaoHumana: true }), 'entrega contínua');
assert.equal(classificarPratica({ integraNoTronco: true, testesAutomaticos: true, artefatoPronto: true, aprovacaoHumana: false }), 'implantação contínua');` }], solution: R`function classificarPratica(p) {
  if (!p.integraNoTronco || !p.testesAutomaticos) return 'sem CI';
  if (!p.artefatoPronto) return 'CI';
  return p.aprovacaoHumana ? 'entrega contínua' : 'implantação contínua';
}`, explanation: 'Cada nível pressupõe o anterior.' }
],
'cicd-02': [
  { id: 'cicd-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Para que serve permissions: contents: read no topo do workflow?', options: ['Acelerar o job', 'Aplicar menor privilégio ao GITHUB_TOKEN', 'Habilitar cache', 'Criar um runner'], answer: 1, explanation: 'O token passa a só ler o conteúdo; jobs ampliam o que precisam.' },
  { id: 'cicd-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o actionlint aprovar o ci.yml prova que os testes passam no GitHub.', answer: false, explanation: 'Valida sintaxe e referências; nenhum workflow rodou.' },
  { id: 'cicd-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o achado do actionlint à categoria.', pairs: [['Chave branchs inexistente', 'syntax-check'], ['github.event.issue.title em script', 'expression (não confiável)'], ['needs: compilar inexistente', 'job-needs'], ['steps.inexistente indefinido', 'expression (propriedade)']], explanation: 'Quatro achados do arquivo defeituoso.' },
  { id: 'cicd-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §acharInjecao(linhasRun)§: recebe uma lista de linhas de §run:§ (strings) e devolve os índices das que interpolam, via §DOLAR{{ ... }}§ (escreva nos testes como §${{§), uma destas fontes não confiáveis: §github.event.issue.title§, §github.event.issue.body§, §github.event.pull_request.title§, §github.event.pull_request.body§, §github.head_ref§ ou §github.event.comment.body§. Linhas que usam apenas §$VAR§ (variável de ambiente) ou outras expressões (§github.sha§, §matrix.node§) não contam.', lang: 'javascript', starter: 'function acharInjecao(linhasRun) {\n  // seu código aqui\n}\n', hints: ['Procure expressões entre as chaves duplas e teste a fonte.', 'Use uma lista de fontes perigosas.'], tests: [{ name: 'perigosas', code: R`const L = [
  'echo "' + '$' + '{{ github.event.issue.title }}"',
  'echo "$TITULO"',
  'npm test -- --node ' + '$' + '{{ matrix.node }}',
  'git checkout ' + '$' + '{{ github.head_ref }}',
  'echo ' + '$' + '{{ github.sha }}'
];
assert.equal(JSON.stringify(acharInjecao(L)), '[0,3]');` }, { name: 'outras fontes', code: R`const a = '$' + '{{ github.event.pull_request.body }}';
const b = '$' + '{{github.event.comment.body}}';
assert.equal(JSON.stringify(acharInjecao(['x ' + a, 'y ' + b, 'echo ok'])), '[0,1]');
assert.equal(JSON.stringify(acharInjecao([])), '[]');` }], solution: R`function acharInjecao(linhasRun) {
  const fontes = ['github.event.issue.title', 'github.event.issue.body', 'github.event.pull_request.title', 'github.event.pull_request.body', 'github.head_ref', 'github.event.comment.body'];
  const re = new RegExp('\\$\\{\\{([^}]*)\\}\\}', 'g');
  const out = [];
  linhasRun.forEach((l, i) => {
    for (const m of l.matchAll(re)) {
      const expr = m[1].replace(/\s+/g, '');
      if (fontes.some((f) => expr.includes(f))) { out.push(i); break; }
    }
  });
  return out;
}`, explanation: 'O correto é passar o valor por env e usar a variável entre aspas.' },
  { id: 'cicd-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Liste cinco cuidados de segurança em workflows do GitHub Actions e explique o risco que cada um mitiga.', model: 'Menor privilégio com permissions (limita o dano de um token comprometido); não interpolar dados não confiáveis (título de issue, nome de ramo) em run, usando env (evita injeção de script, sinalizada pelo actionlint); fixar ações de terceiros pelo SHA (tags móveis podem ser trocadas, cadeia de suprimentos); cuidado com pull_request_target e workflow_run, que rodam com segredos do repositório base e nunca devem executar código de forks; segredos em secrets e credenciais efêmeras por OIDC em vez de chaves de longa duração; runners auto-hospedados só em repositórios privados ou isolados. Complementos: timeout e concurrency limitam custo e abuso.', rubric: ['Menor privilégio', 'Injeção de script com env', 'SHA das ações e supply chain', 'pull_request_target e forks', 'Segredos e OIDC'], explanation: 'Resumo da aula.' },
  { id: 'cicd-02-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §expandirMatriz(eixos, exclude, include)§: §eixos§ é um objeto nome → lista de valores; devolva a lista de combinações (objetos) na ordem do produto cartesiano (último eixo varia mais rápido), removendo as que contêm TODOS os pares de algum item de §exclude§ e acrescentando ao final os objetos de §include§ (como estão).', lang: 'javascript', starter: 'function expandirMatriz(eixos, exclude, include) {\n  // seu código aqui\n}\n', hints: ['Construa o produto cartesiano iterativamente.', 'Exclua se todos os pares de algum exclude estiverem na combinação.'], tests: [{ name: 'produto', code: R`const r = expandirMatriz({ so: ['ubuntu', 'windows'], node: [22, 24] }, [], []);
assert.equal(JSON.stringify(r), '[{"so":"ubuntu","node":22},{"so":"ubuntu","node":24},{"so":"windows","node":22},{"so":"windows","node":24}]');
assert.equal(r.length, 4);` }, { name: 'exclude e include', code: R`const r = expandirMatriz({ so: ['ubuntu', 'windows'], node: [22, 24] }, [{ so: 'windows', node: 22 }], [{ so: 'macos', node: 24 }]);
assert.equal(JSON.stringify(r), '[{"so":"ubuntu","node":22},{"so":"ubuntu","node":24},{"so":"windows","node":24},{"so":"macos","node":24}]');
assert.equal(expandirMatriz({ node: [22, 24] }, [], []).length, 2);
assert.equal(JSON.stringify(expandirMatriz({ so: ['a', 'b'], n: [1] }, [{ so: 'a' }], [])), '[{"so":"b","n":1}]');` }], solution: R`function expandirMatriz(eixos, exclude, include) {
  let combos = [{}];
  for (const [k, vals] of Object.entries(eixos)) combos = combos.flatMap((c) => vals.map((v) => ({ ...c, [k]: v })));
  combos = combos.filter((c) => !exclude.some((e) => Object.entries(e).every(([k, v]) => c[k] === v)));
  return [...combos, ...include];
}`, explanation: 'No Actions, exclude remove combinações e include acrescenta (ou estende) combinações.' }
],
'cicd-03': [
  { id: 'cicd-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que usar OIDC em deploys?', options: ['É mais rápido', 'Evita chaves de nuvem de longa duração, usando credenciais temporárias restritas', 'Dispensa permissões', 'Substitui o Git'], answer: 1, explanation: 'Credenciais efêmeras reduzem vazamento e facilitam auditoria.' },
  { id: 'cicd-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o job producao com needs: homologacao conseguia usar needs.publicar.outputs.', answer: false, explanation: 'O actionlint recusou; needs não é transitivo para o contexto.' },
  { id: 'cicd-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso ao propósito.', pairs: [['environment com revisores', 'Aprovação humana antes da produção'], ['concurrency sem cancelar', 'Deploys do mesmo ambiente em fila'], ['id-token: write', 'Permite pedir o token OIDC'], ['Teste de fumaça', 'Confirma que o serviço sobe e responde']], explanation: 'Elementos do deploy.yml.' },
  { id: 'cicd-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarJobs(jobs)§: §jobs§ é um objeto nome → §{ needs: [], usaSaidasDe: [] }§. Devolva a lista de erros (strings) nesta ordem: para cada job (ordem das chaves), para cada item de §needs§ inexistente §"job X needs Y que não existe"§; para cada item de §usaSaidasDe§ que não está em §needs§ §"job X usa saídas de Y sem listar em needs"§ (só se Y existir). Se não há erros acima e há ciclo, devolva §["ciclo de dependências"]§. Sem erros: §[]§.', lang: 'javascript', starter: 'function validarJobs(jobs) {\n  // seu código aqui\n}\n', hints: ['Primeiro colete erros de referência.', 'Detecte ciclo com busca em profundidade ou remoção iterativa.'], tests: [{ name: 'erro do laboratório', code: R`const j = { publicar: { needs: [], usaSaidasDe: [] }, homologacao: { needs: ['publicar'], usaSaidasDe: ['publicar'] }, producao: { needs: ['homologacao'], usaSaidasDe: ['publicar'] } };
assert.equal(JSON.stringify(validarJobs(j)), '["job producao usa saídas de publicar sem listar em needs"]');
j.producao.needs = ['publicar', 'homologacao'];
assert.equal(JSON.stringify(validarJobs(j)), '[]');` }, { name: 'inexistente e ciclo', code: R`assert.equal(JSON.stringify(validarJobs({ build: { needs: [], usaSaidasDe: [] }, deploy: { needs: ['compilar'], usaSaidasDe: [] } })), '["job deploy needs compilar que não existe"]');
assert.equal(JSON.stringify(validarJobs({ a: { needs: ['b'], usaSaidasDe: [] }, b: { needs: ['a'], usaSaidasDe: [] } })), '["ciclo de dependências"]');
assert.equal(JSON.stringify(validarJobs({})), '[]');` }], solution: R`function validarJobs(jobs) {
  const erros = [];
  for (const [nome, j] of Object.entries(jobs)) {
    for (const n of j.needs) if (!(n in jobs)) erros.push('job ' + nome + ' needs ' + n + ' que não existe');
    for (const u of j.usaSaidasDe) if (u in jobs && !j.needs.includes(u)) erros.push('job ' + nome + ' usa saídas de ' + u + ' sem listar em needs');
  }
  if (erros.length) return erros;
  const resto = new Set(Object.keys(jobs));
  let mudou = true;
  while (mudou && resto.size) {
    mudou = false;
    for (const n of [...resto]) if (jobs[n].needs.every((d) => !resto.has(d))) { resto.delete(n); mudou = true; }
  }
  return resto.size ? ['ciclo de dependências'] : [];
}`, explanation: 'Reproduz, em pequeno, as verificações do actionlint (job-needs e contexto needs).' },
  { id: 'cicd-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a verificação pós-deploy e o rollback de um serviço com banco de dados, incluindo a migração de esquema.', model: 'Depois do deploy, executar um teste de fumaça (saúde, uma consulta ao banco, rota crítica) antes de liberar tráfego e observar taxa de erros e latência por alguns minutos contra a linha de base, com rollback automático se passar dos limites, reimplantando o artefato anterior por tag imutável ou digest, ou trocando o tráfego/desligando a feature flag. Para o banco, usar expandir e contrair: adicionar colunas ou tabelas compatíveis com a versão antiga, implantar o código que escreve nos dois, migrar dados e remover o antigo só em um release posterior, de modo que o rollback do código nunca encontre esquema incompatível. Ensaiar o rollback e registrar auditoria (quem, o quê, quando, commit).', rubric: ['Teste de fumaça e métricas contra linha de base', 'Rollback ensaiado por artefato anterior ou troca de tráfego', 'Expandir e contrair', 'Auditoria e ensaio'], explanation: 'Resumo da aula.' },
  { id: 'cicd-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §proximaAcao(estado)§ para a verificação pós-deploy: §estado = { fumacaOk, taxaErro, taxaErroBase, p95, p95Base, minutos }§. Se não §fumacaOk§ → §"rollback"§; se §minutos < 5§ → §"aguardar"§; se §taxaErro > taxaErroBase * 2§ ou §taxaErro > 0.02§ ou §p95 > p95Base * 1.5§ → §"rollback"§; senão §"promover"§.', lang: 'javascript', starter: 'function proximaAcao(estado) {\n  // seu código aqui\n}\n', hints: ['Avalie nesta ordem: fumaça, tempo, limites.'], tests: [{ name: 'decisões', code: R`const b = { fumacaOk: true, taxaErro: 0.001, taxaErroBase: 0.001, p95: 200, p95Base: 190, minutos: 10 };
assert.equal(proximaAcao(b), 'promover');
assert.equal(proximaAcao({ ...b, fumacaOk: false }), 'rollback');
assert.equal(proximaAcao({ ...b, minutos: 2 }), 'aguardar');` }, { name: 'limites', code: R`const b = { fumacaOk: true, taxaErro: 0.001, taxaErroBase: 0.001, p95: 200, p95Base: 190, minutos: 10 };
assert.equal(proximaAcao({ ...b, taxaErro: 0.003 }), 'rollback');
assert.equal(proximaAcao({ ...b, taxaErro: 0.03, taxaErroBase: 0.03 }), 'rollback');
assert.equal(proximaAcao({ ...b, p95: 300 }), 'rollback');
assert.equal(proximaAcao({ ...b, p95: 285 }), 'promover');` }], solution: R`function proximaAcao(e) {
  if (!e.fumacaOk) return 'rollback';
  if (e.minutos < 5) return 'aguardar';
  if (e.taxaErro > e.taxaErroBase * 2 || e.taxaErro > 0.02 || e.p95 > e.p95Base * 1.5) return 'rollback';
  return 'promover';
}`, explanation: 'Critérios objetivos evitam decisões no calor do incidente.' }
],
'cicd-04': [
  { id: 'cicd-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual estratégia envia uma fração pequena do tráfego à nova versão e amplia conforme as métricas?', options: ['Recreate', 'Blue-green', 'Canary', 'Big bang'], answer: 2, explanation: 'Canary reduz o raio de impacto.' },
  { id: 'cicd-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: no nginx, weight=0 retira um servidor do rodízio e o reload aplica a mudança.', answer: false, explanation: 'O nginx recusou weight=0; o reload falhou e manteve a configuração antiga. Use down.' },
  { id: 'cicd-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o resultado medido à fase.', pairs: [['180 v1 e 20 v2 em 200', 'Canary 9:1'], ['300 respostas HTTP 200 sem erro', 'Troca blue-green sob carga'], ['50 de 50 em v1', 'Rollback para blue'], ['invalid parameter weight=0', 'Primeira tentativa de desligar o servidor']], explanation: 'Resultados do laboratório.' },
  { id: 'cicd-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §distribuir(servidores, n)§ (round-robin ponderado suave, como o nginx): §servidores§ é uma lista de §{ nome, peso, down? }§; ignore os §down§. Em cada rodada, some §peso§ ao contador de cada servidor, escolha o de maior contador (empate: o primeiro) e subtraia a soma dos pesos dele. Devolva um objeto nome → quantidade após §n§ requisições. Sem servidores ativos: lance §Error("sem servidores ativos")§.', lang: 'javascript', starter: 'function distribuir(servidores, n) {\n  // seu código aqui\n}\n', hints: ['Mantenha um contador por servidor.', 'A soma dos pesos só considera servidores ativos.'], tests: [{ name: 'canary 9:1', code: R`const r = distribuir([{ nome: 'blue', peso: 9 }, { nome: 'green', peso: 1 }], 200);
assert.equal(JSON.stringify(r), '{"blue":180,"green":20}');
assert.equal(JSON.stringify(distribuir([{ nome: 'a', peso: 1 }, { nome: 'b', peso: 1 }], 10)), '{"a":5,"b":5}');` }, { name: 'down e erro', code: R`assert.equal(JSON.stringify(distribuir([{ nome: 'blue', peso: 1, down: true }, { nome: 'green', peso: 1 }], 50)), '{"green":50}');
assert.throws(() => distribuir([{ nome: 'x', peso: 1, down: true }], 5), 'sem servidores ativos');
assert.equal(JSON.stringify(distribuir([{ nome: 'a', peso: 5 }, { nome: 'b', peso: 1 }, { nome: 'c', peso: 1 }], 7)), '{"a":5,"b":1,"c":1}');` }], solution: R`function distribuir(servidores, n) {
  const ativos = servidores.filter((s) => !s.down);
  if (!ativos.length) throw new Error('sem servidores ativos');
  const total = ativos.reduce((s, x) => s + x.peso, 0);
  const cur = Object.fromEntries(ativos.map((s) => [s.nome, 0]));
  const cont = Object.fromEntries(ativos.map((s) => [s.nome, 0]));
  for (let i = 0; i < n; i++) {
    for (const s of ativos) cur[s.nome] += s.peso;
    let melhor = ativos[0];
    for (const s of ativos) if (cur[s.nome] > cur[melhor.nome]) melhor = s;
    cur[melhor.nome] -= total;
    cont[melhor.nome]++;
  }
  return cont;
}`, explanation: 'A distribuição fica exata a cada ciclo da soma dos pesos; com tráfego real varia.' },
  { id: 'cicd-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare rolling, blue-green e canary (custo, velocidade de rollback, risco) e diga o que faltou no laboratório para um canary real.', model: 'Rolling substitui instâncias aos poucos sem capacidade dobrada, mas duas versões convivem e o rollback é lento. Blue-green mantém dois ambientes completos e troca o tráfego de uma vez: rollback instantâneo, mas capacidade dobrada e dados/esquema compartilhados exigindo compatibilidade. Canary envia uma fração pequena à nova versão, tem o menor raio de impacto e decide por dados, mas exige métricas e automação. No laboratório só se mediu a mecânica de divisão de tráfego (180/20 em 200, troca sem erros em 300, rollback), sem métricas comparativas, volume suficiente para significância nem automação de avanço e reversão (por exemplo, Argo Rollouts).', rubric: ['Custo e rollback de cada estratégia', 'Raio de impacto', 'Dados e compatibilidade', 'Limites do laboratório'], explanation: 'Resumo da aula.' },
  { id: 'cicd-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §proximoPeso(passo, metricas)§ para um canary em etapas §[1, 5, 25, 100]§ (percentual para a nova versão): §passo§ é o índice atual (0 a 3) e §metricas = { erroNovo, erroAntigo, amostras }§. Devolva §{ acao, percentual }§: se §amostras < 100§ → §"aguardar"§ mantendo o percentual atual; se §erroNovo > erroAntigo * 1.5 + 0.001§ → §"reverter"§ com percentual 0; senão se for o último passo → §"concluir"§ com 100; senão §"avançar"§ com o percentual do próximo passo.', lang: 'javascript', starter: 'function proximoPeso(passo, metricas) {\n  // seu código aqui\n}\n', hints: ['Percentuais: [1, 5, 25, 100].', 'Aguardar mantém o percentual do passo atual.'], tests: [{ name: 'avançar e aguardar', code: R`assert.equal(JSON.stringify(proximoPeso(0, { erroNovo: 0.001, erroAntigo: 0.001, amostras: 500 })), '{"acao":"avançar","percentual":5}');
assert.equal(JSON.stringify(proximoPeso(1, { erroNovo: 0.001, erroAntigo: 0.001, amostras: 50 })), '{"acao":"aguardar","percentual":5}');
assert.equal(JSON.stringify(proximoPeso(2, { erroNovo: 0.002, erroAntigo: 0.002, amostras: 1000 })), '{"acao":"avançar","percentual":100}');` }, { name: 'reverter e concluir', code: R`assert.equal(JSON.stringify(proximoPeso(1, { erroNovo: 0.05, erroAntigo: 0.001, amostras: 500 })), '{"acao":"reverter","percentual":0}');
assert.equal(JSON.stringify(proximoPeso(3, { erroNovo: 0.001, erroAntigo: 0.001, amostras: 500 })), '{"acao":"concluir","percentual":100}');
assert.equal(JSON.stringify(proximoPeso(0, { erroNovo: 0.0024, erroAntigo: 0.001, amostras: 200 })), '{"acao":"avançar","percentual":5}');` }], solution: R`function proximoPeso(passo, m) {
  const P = [1, 5, 25, 100];
  if (m.amostras < 100) return { acao: 'aguardar', percentual: P[passo] };
  if (m.erroNovo > m.erroAntigo * 1.5 + 0.001) return { acao: 'reverter', percentual: 0 };
  if (passo === P.length - 1) return { acao: 'concluir', percentual: 100 };
  return { acao: 'avançar', percentual: P[passo + 1] };
}`, explanation: 'O limite tem folga absoluta (0,001) para não reverter por ruído quando o erro base é minúsculo.' }
]
};

const P = 'cicd-p';
export const assessment = {
  id: 'cicd', title: 'Avaliação final — CI/CD, GitHub Actions e estratégias de deploy', passPct: 70, minutes: 40,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que significa "construir uma vez e implantar em todo lugar"?', options: ['Compilar em cada servidor', 'O mesmo artefato é promovido entre ambientes; só a configuração muda', 'Usar um único ambiente', 'Nunca testar'], answer: 1, explanation: 'Preserva a reprodutibilidade.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Na entrega contínua, a publicação em produção é automática e sem aprovação.', answer: false, explanation: 'Isso descreve a implantação contínua.' },
    { id: P + '3', type: 'mc', difficulty: 3, points: 10, prompt: 'Como evitar injeção de script em um run?', options: ['Interpolar a expressão direto', 'Passar o valor por env e usar a variável entre aspas', 'Desligar o shell', 'Usar sudo'], answer: 1, explanation: 'O shell trata o valor como dado.' },
    { id: P + '4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede o workflow de disparar nos pushes para main (achado do actionlint).', code: 'on:\n  push:\n    branchs: [main]\njobs:\n  build:\n    runs-on: ubuntu-24.04', answer: 3, explanation: 'A chave correta é branches; o actionlint apontou na linha 3.' },
    { id: P + '5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para que producao enxergue as saídas de publicar.', code: 'producao:\n  needs: [[[0]], homologacao]', answers: [['publicar']], explanation: 'needs não é transitivo para o contexto.' },
    { id: P + '6', type: 'trace', difficulty: 3, points: 10, prompt: 'Medições do canary 9:1 do laboratório (200 requisições).', code: 'blue (v1): 180\ngreen (v2): 20', lang: 'text', steps: [{ q: 'Que porcentagem do tráfego foi para a v2?', answers: ['10', '10%'] }, { q: 'Quantas respostas v1 a mais que v2?', answers: ['160'] }], explanation: '20/200 = 10%; 180 − 20 = 160.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a estratégia à característica.', pairs: [['Blue-green', 'Troca e rollback instantâneos, capacidade dobrada'], ['Canary', 'Fração pequena do tráfego e decisão por métricas'], ['Rolling', 'Substituição gradual de instâncias'], ['Feature flag', 'Separa implantação de liberação']], explanation: 'Resumo da aula 4.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'O que aconteceu quando o laboratório usou weight=0 no nginx?', options: ['O servidor saiu do rodízio', 'O nginx recusou, o reload falhou e a configuração antiga continuou ativa', 'O nginx caiu', 'O tráfego foi duplicado'], answer: 1, explanation: 'Use down e valide com nginx -t.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'O laboratório executou os workflows em um GitHub real e testou OIDC com uma conta de nuvem.', answer: false, explanation: 'Foram apenas verificados pelo actionlint; OIDC foi análise.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual padrão permite reverter o código sem reverter o esquema do banco?', options: ['Apagar tabelas antes do deploy', 'Expandir e contrair (parallel change)', 'Congelar o banco', 'Usar apenas um ambiente'], answer: 1, explanation: 'Mudanças compatíveis em etapas.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Desenhe o pipeline de uma API: estágios, artefato, ambientes, segurança, estratégia de liberação, verificação e rollback.', model: 'Estágios baratos primeiro (lint, tipos, actionlint), build do artefato uma vez (imagem com tag do SHA e digest), testes em paralelo (unitários, integração com banco em contêiner), varreduras de dependências, segredos e imagem, publicação no registro e promoção do mesmo artefato por homologação (teste de fumaça) e produção (ambiente protegido com revisores). Workflow com permissions mínimas, ações fixadas por SHA, valores não confiáveis por env e OIDC em vez de chaves de longa duração. Liberação progressiva por canary ou blue-green com métricas comparadas à linha de base, critérios objetivos e rollback automático, migrações em expandir e contrair, marcadores de deploy na observabilidade e medição DORA. Declarar o que não foi executado.', rubric: ['Estágios e artefato imutável', 'Segurança do workflow', 'Estratégia de liberação e verificação', 'Rollback e migrações'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que cancel-in-progress deve ser falso em workflows de deploy?', options: ['Para gastar mais minutos', 'Cancelar um deploy em andamento pode deixar o ambiente em estado parcial', 'O GitHub proíbe', 'Para acelerar'], answer: 1, explanation: 'Deploys do mesmo ambiente devem se enfileirar.' }
  ]
};

export const project = {
  id: 'pipeline-de-entrega', name: 'Pipeline de entrega: workflows verificados e liberação gradual com nginx', lv: 'M', stack: 'GitHub Actions (YAML), actionlint, Docker, nginx', ds: ['cicd'],
  desc: 'Projete e verifique o **pipeline de entrega** de uma API: **workflows** de **CI** (**matriz, cache, concorrência, permissões mínimas**) e de **deploy** (**publicar, homologação e produção com ambientes e OIDC**), **validados estaticamente com o actionlint** (incluindo um **arquivo de prova defeituoso** que **deve falhar**), e **um experimento executado de liberação** (**canary e blue-green** com nginx) que **mede** a distribuição, a **troca sem erros** e o **rollback**. **Relatório** que **separa o que foi executado do que foi só analisado** (os workflows **não rodaram** no GitHub).',
  rf: ['Workflow de CI com matriz, cache, concurrency, timeout e permissions mínimas', 'Workflow de deploy com jobs encadeados, ambientes, URL e needs corretos', 'Arquivo defeituoso de prova com pelo menos três tipos de erro e saída do actionlint registrada', 'Script de liberação com dois backends e um proxy nginx: canary com pesos, troca blue-green e rollback', 'Medição da distribuição (requisições por versão) e dos códigos HTTP durante a troca', 'Validação da configuração (nginx -t) e conferência do tráfego após cada reload', 'Plano de verificação pós-deploy com critérios objetivos de promoção ou rollback', 'Relatório com resultados, achados e limites'],
  rnf: ['Nenhum segredo real versionado', 'Versões fixadas das ferramentas e imagens', 'Script que cria e remove apenas recursos próprios (prefixo do laboratório)', 'Comandos documentados para reproduzir'],
  ac: ['O actionlint aprova os workflows corretos (exit 0) e recusa o defeituoso (exit 1)', 'A distribuição do canary é medida e confere com os pesos', 'A troca blue-green sob carga não produz erros HTTP', 'O reload inválido é detectado e não passa despercebido', 'O relatório diz o que não foi executado (GitHub real, OIDC, métricas de canary)'],
  ch: ['Rodar os workflows em um repositório de teste no GitHub e comparar com a análise', 'Automatizar o avanço do canary com métricas do Prometheus', 'Adicionar varredura de imagem e de segredos ao pipeline', 'Implementar o mesmo experimento em Kubernetes com Argo Rollouts']
};
