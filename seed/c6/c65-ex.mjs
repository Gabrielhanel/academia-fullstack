// C6.5 — Infraestrutura como código: exercícios, avaliação final e projeto.
// Medições do laboratório: Terraform v1.17.2 com provedores local 2.9.1 e random 3.9.1 (sem nuvem). Os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'iac-01': [
  { id: 'iac-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que significa "No changes. Your infrastructure matches the configuration."?', options: ['O terraform falhou', 'O real já corresponde à configuração (idempotência)', 'Não há state', 'O provedor não existe'], answer: 1, explanation: 'No laboratório, o segundo plan mostrou isso e -detailed-exitcode devolveu 0.' },
  { id: 'iac-01-e2', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §resumirPlano(linha)§: para uma linha como §"Plan: 3 to add, 0 to change, 1 to destroy."§ devolva §{ add, change, destroy, semMudancas: false, destrutivo }§ (§destrutivo§ é §destroy > 0§). Para §"No changes. Your infrastructure matches the configuration."§ devolva zeros com §semMudancas: true§ e §destrutivo: false§. Qualquer outra linha: lance §Error("linha desconhecida")§.', lang: 'javascript', starter: 'function resumirPlano(linha) {\n  // seu código aqui\n}\n', hints: ['Use uma expressão regular com três grupos numéricos.', 'Trate "No changes" antes.'], tests: [{ name: 'linhas do laboratório', code: R`assert.equal(JSON.stringify(resumirPlano('Plan: 4 to add, 0 to change, 0 to destroy.')), '{"add":4,"change":0,"destroy":0,"semMudancas":false,"destrutivo":false}');
assert.equal(JSON.stringify(resumirPlano('Plan: 3 to add, 0 to change, 3 to destroy.')), '{"add":3,"change":0,"destroy":3,"semMudancas":false,"destrutivo":true}');
assert.equal(JSON.stringify(resumirPlano('No changes. Your infrastructure matches the configuration.')), '{"add":0,"change":0,"destroy":0,"semMudancas":true,"destrutivo":false}');` }, { name: 'erro', code: R`assert.throws(() => resumirPlano('Apply complete!'), 'linha desconhecida');
assert.equal(resumirPlano('Plan: 0 to add, 2 to change, 0 to destroy.').change, 2);` }], solution: R`function resumirPlano(linha) {
  if (linha.startsWith('No changes.')) return { add: 0, change: 0, destroy: 0, semMudancas: true, destrutivo: false };
  const m = /^Plan: (\d+) to add, (\d+) to change, (\d+) to destroy\.$/.exec(linha);
  if (!m) throw new Error('linha desconhecida');
  const [add, change, destroy] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return { add, change, destroy, semMudancas: false, destrutivo: destroy > 0 };
}`, explanation: 'Um pipeline pode usar a linha de resumo para exigir aprovação extra quando há destroy.' },
  { id: 'iac-01-e3', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §calcularPlano(desejado, estado, forcaNova)§: §desejado§ e §estado§ mapeiam endereço → objeto de atributos; §forcaNova§ é a lista de atributos cuja mudança força substituição. Devolva, ordenada por endereço, uma lista de §{ endereco, acao }§ com §"create"§ (só no desejado), §"destroy"§ (só no estado), §"replace"§ (algum atributo de §forcaNova§ difere) ou §"update"§ (atributos diferem, nenhum força substituição). Recursos iguais não aparecem.', lang: 'javascript', starter: 'function calcularPlano(desejado, estado, forcaNova) {\n  // seu código aqui\n}\n', hints: ['Una as chaves dos dois mapas.', 'Compare atributos com JSON.stringify.'], tests: [{ name: 'create e destroy', code: R`const r = calcularPlano({ a: { x: 1 }, b: { x: 2 } }, { a: { x: 1 }, c: { x: 3 } }, []);
assert.equal(JSON.stringify(r), '[{"endereco":"b","acao":"create"},{"endereco":"c","acao":"destroy"}]');
assert.equal(JSON.stringify(calcularPlano({}, {}, [])), '[]');` }, { name: 'update e replace', code: R`const d = { a: { x: 2, y: 1 } }; const e = { a: { x: 1, y: 1 } };
assert.equal(JSON.stringify(calcularPlano(d, e, [])), '[{"endereco":"a","acao":"update"}]');
assert.equal(JSON.stringify(calcularPlano(d, e, ['x'])), '[{"endereco":"a","acao":"replace"}]');
assert.equal(JSON.stringify(calcularPlano({ a: { y: 2 } }, { a: { y: 1 } }, ['x'])), '[{"endereco":"a","acao":"update"}]');` }], solution: R`function calcularPlano(desejado, estado, forcaNova) {
  const enderecos = [...new Set([...Object.keys(desejado), ...Object.keys(estado)])].sort();
  const out = [];
  for (const e of enderecos) {
    if (!(e in estado)) { out.push({ endereco: e, acao: 'create' }); continue; }
    if (!(e in desejado)) { out.push({ endereco: e, acao: 'destroy' }); continue; }
    const attrs = [...new Set([...Object.keys(desejado[e]), ...Object.keys(estado[e])])];
    const diff = attrs.filter((a) => JSON.stringify(desejado[e][a]) !== JSON.stringify(estado[e][a]));
    if (!diff.length) continue;
    out.push({ endereco: e, acao: diff.some((a) => forcaNova.includes(a)) ? 'replace' : 'update' });
  }
  return out;
}`, explanation: 'No laboratório, mudar o conteúdo de local_file forçou a substituição (1 to add, 1 to destroy).' },
  { id: 'iac-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarVariaveis(valores, regras)§: §regras§ mapeia nome → §{ tipo, obrigatoria?, enum?, min?, max? }§ (§tipo§ §"string"§, §"number"§ ou §"bool"§). Percorra as regras na ordem e acrescente mensagens: §"N: obrigatória"§ se obrigatória e ausente (pare as demais regras desta variável); §"N: tipo esperado T"§ se o tipo não confere (pare); §"N: valor inválido (permitidos: a, b)"§ se há §enum§ e o valor não está nele; §"N: deve ser >= MIN"§ e §"N: deve ser <= MAX"§ para números. Variáveis ausentes e não obrigatórias são ignoradas.', lang: 'javascript', starter: 'function validarVariaveis(valores, regras) {\n  // seu código aqui\n}\n', hints: ['Use typeof para o tipo.', 'Respeite a ordem das chaves de regras.'], tests: [{ name: 'regras do laboratório', code: R`const regras = { ambiente: { tipo: 'string', obrigatoria: true, enum: ['dev', 'homologacao', 'producao'] }, replicas: { tipo: 'number', min: 1, max: 10 } };
assert.equal(JSON.stringify(validarVariaveis({ ambiente: 'teste', replicas: 0 }, regras)), '["ambiente: valor inválido (permitidos: dev, homologacao, producao)","replicas: deve ser >= 1"]');
assert.equal(JSON.stringify(validarVariaveis({ ambiente: 'dev', replicas: 3 }, regras)), '[]');` }, { name: 'ausente, tipo e máximo', code: R`const regras = { ambiente: { tipo: 'string', obrigatoria: true }, replicas: { tipo: 'number', min: 1, max: 10 } };
assert.equal(JSON.stringify(validarVariaveis({}, regras)), '["ambiente: obrigatória"]');
assert.equal(JSON.stringify(validarVariaveis({ ambiente: 'dev', replicas: 'dois' }, regras)), '["replicas: tipo esperado number"]');
assert.equal(JSON.stringify(validarVariaveis({ ambiente: 'dev', replicas: 11 }, regras)), '["replicas: deve ser <= 10"]');` }], solution: R`function validarVariaveis(valores, regras) {
  const out = [];
  for (const [nome, r] of Object.entries(regras)) {
    const v = valores[nome];
    if (v === undefined) { if (r.obrigatoria) out.push(nome + ': obrigatória'); continue; }
    if (typeof v !== r.tipo.replace('bool', 'boolean')) { out.push(nome + ': tipo esperado ' + r.tipo); continue; }
    if (r.enum && !r.enum.includes(v)) out.push(nome + ': valor inválido (permitidos: ' + r.enum.join(', ') + ')');
    if (r.min !== undefined && v < r.min) out.push(nome + ': deve ser >= ' + r.min);
    if (r.max !== undefined && v > r.max) out.push(nome + ': deve ser <= ' + r.max);
  }
  return out;
}`, explanation: 'As validações do Terraform barram erros antes do plano, com mensagens úteis.' },
  { id: 'iac-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique o ciclo do Terraform e como o plano, o state e o drift se relacionam, usando os resultados do laboratório.', model: 'O ciclo é init (instala provedores e cria o lock file), fmt e validate, plan (compara a configuração, o state e o real e lista create, update, destroy e replace), apply (idealmente do plano salvo revisado) e destroy. No laboratório (Terraform v1.17.2, provedores local e random) o primeiro plan previu 4 recursos e o apply os criou; o segundo plan mostrou No changes (idempotência, exit 0). O state mapeia a configuração aos objetos reais. Drift é a divergência do real: ao alterar ou apagar um arquivo à mão, o plan avisou Objects have changed outside of Terraform e propôs recriar (exit 2 em -detailed-exitcode); o apply corrigiu e o plano voltou a No changes. Mudar o conteúdo de um local_file o substituiu (1 to add, 1 to destroy), por isso se lê atentamente destroy e replace.', rubric: ['Ciclo init, validate, plan, apply, destroy', 'Papel do state', 'Idempotência medida', 'Drift e códigos de saída'], explanation: 'Resumo da aula.' },
  { id: 'iac-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ordemDeAplicacao(recursos)§: §recursos§ mapeia endereço → lista de dependências. Devolva §{ aplicar, destruir }§: §aplicar§ é uma ordem topológica (dependências primeiro; entre os prontos, ordem alfabética a cada passo) e §destruir§ é o inverso. Lance §Error("dependência inexistente: X")§ ou §Error("ciclo de dependências")§.', lang: 'javascript', starter: 'function ordemDeAplicacao(recursos) {\n  // seu código aqui\n}\n', hints: ['Algoritmo de Kahn com lista de prontos ordenada.', 'Valide as dependências antes.'], tests: [{ name: 'ordem', code: R`const r = { 'arquivo': ['pasta', 'sufixo'], 'pasta': [], 'sufixo': [], 'saida': ['arquivo'] };
assert.equal(JSON.stringify(ordemDeAplicacao(r)), '{"aplicar":["pasta","sufixo","arquivo","saida"],"destruir":["saida","arquivo","sufixo","pasta"]}');
assert.equal(JSON.stringify(ordemDeAplicacao({})), '{"aplicar":[],"destruir":[]}');` }, { name: 'erros', code: R`assert.throws(() => ordemDeAplicacao({ a: ['x'] }), 'dependência inexistente: x');
assert.throws(() => ordemDeAplicacao({ a: ['b'], b: ['a'] }), 'ciclo de dependências');
assert.equal(JSON.stringify(ordemDeAplicacao({ b: ['a'], a: [] }).aplicar), '["a","b"]');` }], solution: R`function ordemDeAplicacao(recursos) {
  const nomes = Object.keys(recursos);
  for (const n of nomes) for (const d of recursos[n]) if (!(d in recursos)) throw new Error('dependência inexistente: ' + d);
  const feitos = new Set(); const aplicar = [];
  while (aplicar.length < nomes.length) {
    const prontos = nomes.filter((n) => !feitos.has(n) && recursos[n].every((d) => feitos.has(d))).sort();
    if (!prontos.length) throw new Error('ciclo de dependências');
    feitos.add(prontos[0]); aplicar.push(prontos[0]);
  }
  return { aplicar, destruir: aplicar.slice().reverse() };
}`, explanation: 'O Terraform monta o grafo das referências e destrói na ordem inversa.' }
],
'iac-02': [
  { id: 'iac-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que preferir for_each a count em módulos?', options: ['É mais rápido', 'Cada instância tem uma chave estável; remover um item não recria os demais', 'count não existe mais', 'for_each cria menos recursos'], answer: 1, explanation: 'Com count, remover o item do meio reindexa os seguintes.' },
  { id: 'iac-02-e2', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §enderecosDoModulo(modulo, chaves, recursos)§: para cada chave e cada recurso (como §"local_file.config"§), gere §module.<modulo>[<chave>].<recurso>§; chaves de texto entre aspas duplas (§["api"]§) e numéricas sem aspas (§[0]§). Devolva a lista ordenada alfabeticamente.', lang: 'javascript', starter: 'function enderecosDoModulo(modulo, chaves, recursos) {\n  // seu código aqui\n}\n', hints: ['Use typeof chave === "number".', 'Ordene o resultado.'], tests: [{ name: 'for_each', code: R`assert.equal(JSON.stringify(enderecosDoModulo('servico', ['web', 'api'], ['local_file.config'])), '["module.servico[\\"api\\"].local_file.config","module.servico[\\"web\\"].local_file.config"]');` }, { name: 'count e vários recursos', code: R`assert.equal(JSON.stringify(enderecosDoModulo('vm', [0, 1], ['aws_instance.app', 'aws_eip.ip'])), '["module.vm[0].aws_eip.ip","module.vm[0].aws_instance.app","module.vm[1].aws_eip.ip","module.vm[1].aws_instance.app"]');
assert.equal(JSON.stringify(enderecosDoModulo('x', [], ['a.b'])), '[]');` }], solution: R`function enderecosDoModulo(modulo, chaves, recursos) {
  const out = [];
  for (const c of chaves) for (const r of recursos) {
    const k = typeof c === 'number' ? '[' + c + ']' : '["' + c + '"]';
    out.push('module.' + modulo + k + '.' + r);
  }
  return out.sort();
}`, explanation: 'Os endereços do state list: module.servico["api"].local_file.config.' },
  { id: 'iac-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o mecanismo ao propósito.', pairs: [['Backend remoto com bloqueio', 'Evitar dois apply simultâneos e perda do state'], ['Bloco moved', 'Renomear ou mover um recurso sem recriá-lo'], ['import', 'Trazer ao state um recurso criado fora do Terraform'], ['plan -detailed-exitcode', 'Detectar drift em um job agendado']], explanation: 'Operação de Terraform em equipe.' },
  { id: 'iac-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §detectarDrift(estado, real)§: ambos mapeiam endereço → atributos. Devolva §{ removidos, alterados }§: §removidos§ são os endereços do §estado§ ausentes em §real§ (ordenados); §alterados§ é uma lista ordenada por endereço de §{ endereco, atributos }§ com os nomes (ordenados) dos atributos que diferem (comparando com §JSON.stringify§). Recursos só em §real§ são ignorados.', lang: 'javascript', starter: 'function detectarDrift(estado, real) {\n  // seu código aqui\n}\n', hints: ['Percorra os endereços do state.', 'Una os nomes de atributos dos dois lados.'], tests: [{ name: 'removido e alterado', code: R`const estado = { a: { x: 1, y: 2 }, b: { x: 1 }, c: { z: 1 } };
const real = { a: { x: 9, y: 2 }, c: { z: 1 }, d: { k: 1 } };
assert.equal(JSON.stringify(detectarDrift(estado, real)), '{"removidos":["b"],"alterados":[{"endereco":"a","atributos":["x"]}]}');` }, { name: 'sem drift e atributos', code: R`assert.equal(JSON.stringify(detectarDrift({ a: { x: 1 } }, { a: { x: 1 } })), '{"removidos":[],"alterados":[]}');
assert.equal(JSON.stringify(detectarDrift({ a: { x: 1, y: 1 } }, { a: { y: 2, w: 3 } })), '{"removidos":[],"alterados":[{"endereco":"a","atributos":["w","x","y"]}]}');` }], solution: R`function detectarDrift(estado, real) {
  const removidos = [], alterados = [];
  for (const e of Object.keys(estado).sort()) {
    if (!(e in real)) { removidos.push(e); continue; }
    const attrs = [...new Set([...Object.keys(estado[e]), ...Object.keys(real[e])])].sort();
    const diff = attrs.filter((a) => JSON.stringify(estado[e][a]) !== JSON.stringify(real[e][a]));
    if (diff.length) alterados.push({ endereco: e, atributos: diff });
  }
  return { removidos, alterados };
}`, explanation: 'No laboratório: arquivo apagado = removido; arquivo adulterado = alterado.' },
  { id: 'iac-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a estrutura de state e o pipeline de IaC de uma empresa com três ambientes e componentes de rede, dados e aplicação. Inclua segredos, bloqueio, drift e revisão.', model: 'Um state por ambiente e por componente (rede, dados, aplicação), em diretórios ou repositórios separados, com raio de impacto pequeno; trocar uma variável de ambiente no mesmo state substitui recursos (medido: 3 to add, 3 to destroy). Backend remoto criptografado, versionado e com bloqueio, bucket criado fora do código e acesso mínimo; o state é tratado como segredo porque sensitive não o criptografa (senha legível no state do laboratório) e segredos ficam em gerenciadores, não no Terraform. Pipeline: fmt, validate, tflint e varreduras de segurança no pull request, plan comentado e revisado (atenção a destroy e replace), políticas como código, apply do plano salvo após merge com aprovação em produção e credenciais OIDC, um apply por state por vez, job agendado com plan -detailed-exitcode para drift e alerta. Módulos com for_each e versões fixadas; refatoração com moved e import. Backends e CI não foram executados no curso.', rubric: ['Separação de states por ambiente e componente', 'State remoto, bloqueio e segredos', 'Pipeline com revisão do plano', 'Drift agendado e módulos versionados'], explanation: 'Resumo da aula.' },
  { id: 'iac-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §acharSegredosNoState(estado)§: §estado.resources§ é uma lista de §{ type, name, instances: [{ attributes }] }§. Devolva a lista ordenada e sem repetições de §"tipo.nome.atributo"§ para atributos de nível superior cujo nome contém (sem diferenciar maiúsculas) §password§, §secret§, §token§, §key§, §senha§ ou §result§ ao lado de tipo §random_password§ (para este tipo, qualquer atributo §result§ conta), e cujo valor é uma string não vazia. Mostra por que o state é sensível.', lang: 'javascript', starter: 'function acharSegredosNoState(estado) {\n  // seu código aqui\n}\n', hints: ['Para random_password, o atributo result entra na regra.', 'Ignore valores vazios ou que não sejam texto.'], tests: [{ name: 'senha e chave', code: R`const estado = { resources: [
  { type: 'random_password', name: 'db', instances: [{ attributes: { length: 16, result: 'abc123XYZ' } }] },
  { type: 'aws_db_instance', name: 'pg', instances: [{ attributes: { password: 'hunter2', username: 'app', api_key: 'k-1' } }] },
  { type: 'local_file', name: 'cfg', instances: [{ attributes: { content: 'x', filename: 'a.json' } }] }
] };
assert.equal(JSON.stringify(acharSegredosNoState(estado)), '["aws_db_instance.pg.api_key","aws_db_instance.pg.password","random_password.db.result"]');` }, { name: 'vazios e repetidos', code: R`const estado = { resources: [
  { type: 'x', name: 'a', instances: [{ attributes: { token: '' } }, { attributes: { token: 'abc' } }, { attributes: { token: 'def' } }] },
  { type: 'y', name: 'b', instances: [{ attributes: { secret: 5 } }] }
] };
assert.equal(JSON.stringify(acharSegredosNoState(estado)), '["x.a.token"]');
assert.equal(JSON.stringify(acharSegredosNoState({ resources: [] })), '[]');` }], solution: R`function acharSegredosNoState(estado) {
  const re = /(password|secret|token|key|senha)/i;
  const out = new Set();
  for (const r of estado.resources) for (const inst of r.instances) {
    for (const [k, v] of Object.entries(inst.attributes)) {
      if (typeof v !== 'string' || v === '') continue;
      if (re.test(k) || (r.type === 'random_password' && k === 'result')) out.add(r.type + '.' + r.name + '.' + k);
    }
  }
  return [...out].sort();
}`, explanation: 'No laboratório a senha de 16 caracteres estava legível no state, embora a saída fosse <sensitive>.' }
]
};

const P = 'iac-p';
export const assessment = {
  id: 'iac', title: 'Avaliação final — Infraestrutura como código com Terraform', passPct: 70, minutes: 35,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que diferencia IaC declarativo do imperativo?', options: ['Usa mais memória', 'Descreve o estado desejado e a ferramenta calcula os passos', 'Só funciona em nuvem', 'Dispensa versionamento'], answer: 1, explanation: 'A ferramenta calcula a diferença para chegar ao estado desejado.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'O segundo terraform plan, sem alterações, mostrou No changes e -detailed-exitcode devolveu 0.', answer: true, explanation: 'Idempotência medida no laboratório.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Resultados do laboratório ao trocar o ambiente para producao.', code: 'Plan: 3 to add, 0 to change, 3 to destroy.', lang: 'text', steps: [{ q: 'Quantos recursos serão substituídos (inteiro)?', answers: ['3'] }, { q: 'A senha random_password foi afetada? (sim ou nao)', answers: ['nao', 'não'] }], explanation: 'Os três recursos mudaram de keepers ou de nome; a senha não.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'O que o sensitive = true faz com um valor?', options: ['Criptografa o state', 'Oculta o valor na saída e nos logs, mas o state o guarda em texto claro', 'Impede o apply', 'Apaga o valor'], answer: 1, explanation: 'Medido: a senha estava legível no state.' },
    { id: P + '5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o comando de detecção de drift em CI.', code: 'terraform plan -[[0]]\n# exit 0 = sem mudanças; exit 2 = há [[1]]', answers: [['detailed-exitcode'], ['mudanças', 'mudancas', 'drift']], explanation: 'Exit code 2 indica diferenças.' },
    { id: P + '6', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna a remoção do item do meio perigosa (recria os seguintes).', code: 'module "servico" {\n  count  = length(var.lista)\n  source = "./modules/servico"\n  nome   = var.lista[count.index]\n}', answer: 2, explanation: 'count indexa por posição; for_each usa chaves estáveis.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a medição do laboratório ao significado.', pairs: [['fmt -check exit 3', 'Arquivo mal formatado'], ['validate exit 1', 'Referência a variável inexistente'], ['plan -detailed-exitcode exit 2', 'Drift ou mudanças pendentes'], ['must be replaced', 'Destruir e recriar o recurso']], explanation: 'Códigos e mensagens da aula 1.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que ambientes devem ter states separados?', options: ['Para gastar mais', 'Trocar uma variável de ambiente no mesmo state substitui recursos (3 add, 3 destroy)', 'Porque o Terraform exige', 'Para evitar módulos'], answer: 1, explanation: 'Uma variável que alterna não move o ambiente.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'O laboratório criou recursos reais em AWS, Azure ou Google Cloud com o Terraform.', answer: false, explanation: 'Usou os provedores local e random; nuvem foi análise.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Para que serve o bloqueio (locking) do state?', options: ['Acelerar o plan', 'Impedir execuções simultâneas sobre o mesmo state', 'Criptografar variáveis', 'Gerar módulos'], answer: 1, explanation: 'Evita corrupção do state.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva como adotar IaC em uma equipe: estrutura de código e states, segredos, pipeline, revisão do plano e detecção de drift. O que o curso executou e o que não?', model: 'Código versionado com módulos pequenos (for_each, versões fixadas) e lock file; states separados por ambiente e componente em backend remoto criptografado, versionado e com bloqueio. Segredos fora do Terraform sempre que possível, state protegido como segredo (sensitive não o criptografa). Pipeline: fmt, validate, linters e varreduras no pull request, plan salvo e revisado (atenção a destroy e replace), políticas como código, apply do plano aprovado com OIDC e job agendado com plan -detailed-exitcode para drift. Proteger recursos críticos com prevent_destroy, refatorar com moved e import e mudar a infraestrutura só pelo código. O curso executou o ciclo, o módulo com for_each, o drift e o segredo no state com provedores local e random; não executou nuvem, backends remotos, workspaces, CI, OpenTofu nem políticas.', rubric: ['Estrutura de módulos e states', 'Segredos e proteção do state', 'Pipeline e revisão do plano', 'Honestidade sobre o executado'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual a relação entre plan -out e apply?', options: ['Nenhuma', 'O apply executa exatamente o plano revisado e salvo', 'O apply ignora o plano', 'O plano é recalculado e pode mudar'], answer: 1, explanation: 'Evita surpresas entre revisão e aplicação.' }
  ]
};

export const project = {
  id: 'infra-como-codigo', name: 'Infraestrutura como código: módulos, state, drift e pipeline com Terraform local', lv: 'M', stack: 'Terraform, provedores local e random, Docker, Node.js (verificação)', ds: ['iac'],
  desc: 'Construa uma **configuração Terraform** com **módulo reutilizável (§for_each§)**, **variáveis tipadas com validação**, **saídas**, **lock file** e **ambiente por diretório**; **execute o ciclo completo** (**fmt, validate, plan salvo, apply, plan idempotente, destroy**), **provoque e detecte drift** (**alterar e apagar**), **demonstre o segredo no state** e **desenhe o pipeline de IaC** (**revisão do plano, apply controlado, drift agendado**). **Relate** o que foi **executado localmente** e o que seria **necessário em nuvem real** (**backend remoto, OIDC, políticas**), que **não foi executado**.',
  rf: ['Módulo com entradas, saídas e validação, consumido com for_each', 'Variáveis tipadas com validação e mensagens úteis, com casos válidos e inválidos testados', 'Plano salvo revisado e aplicado, com segunda execução idempotente (exit 0)', 'Drift provocado (alteração e remoção) e detectado com plan -detailed-exitcode (exit 2), corrigido por apply', 'Demonstração de que um valor sensitive fica legível no state, com a mitigação proposta', 'Estrutura de states por ambiente e componente e comparação com o efeito de alternar ambiente por variável', 'Descrição do pipeline: fmt, validate, linters, plan comentado, aprovação, apply do plano salvo e job de drift', 'Relatório com resultados, achados e limites'],
  rnf: ['Versões do Terraform e dos provedores fixadas e lock file versionado', 'Nenhum segredo real; senhas de teste geradas e destruídas', 'Limpeza dos arquivos gerados, state e diretório .terraform ao final', 'Reprodução por um script documentado'],
  ac: ['O primeiro plan lista os recursos esperados e o segundo mostra No changes', 'Valores inválidos de variáveis são recusados antes do plano', 'O drift aparece no plan e o apply restaura o estado desejado', 'O relatório mostra o segredo no state sem expor seu valor', 'O relatório declara que nenhum recurso de nuvem foi criado'],
  ch: ['Executar o mesmo módulo contra um provedor de nuvem em conta de teste com orçamento e destruir ao final', 'Configurar um backend remoto com bloqueio em um armazenamento S3-compatível local', 'Adicionar tflint, checkov e políticas OPA ao pipeline', 'Refatorar com moved e import e comparar com OpenTofu']
};
