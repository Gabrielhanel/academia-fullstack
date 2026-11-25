// C2.3 — React avançado: exercícios das aulas 1 a 3.
// O React não roda no laboratório (só JavaScript puro): os desafios "code" modelam a lógica (ordem, identidade, teclado).
const R = String.raw;

export const exsetsA = {
'rav-01': [
  { id: 'rav-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a ordem correta das etapas quando o estado de um componente muda?', options: ['Efeitos, commit, render', 'Render (calcular a interface), commit (aplicar ao DOM), efeitos', 'Commit, render, efeitos', 'Render, efeitos, commit'], answer: 1, explanation: 'O render calcula a descrição da interface (puro), o commit aplica as diferenças ao DOM (e define refs e efeitos de layout) e os efeitos rodam depois.' },
  { id: 'rav-01-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Um pai renderiza um filho. Cada um tem um §useLayoutEffect§ e um §useEffect§ que registram o nome. Montagem inicial, **sem** Strict Mode.', code: 'function Filho() {\n  log("render filho");\n  useLayoutEffect(() => log("layout filho"));\n  useEffect(() => log("efeito filho"));\n  return <span />;\n}\nfunction Pai() {\n  log("render pai");\n  useLayoutEffect(() => log("layout pai"));\n  useEffect(() => log("efeito pai"));\n  return <Filho />;\n}', lang: 'tsx', steps: [{ q: 'Qual é a segunda mensagem registrada?', answers: ['render filho'] }, { q: 'Qual mensagem vem logo depois de "layout filho"?', answers: ['layout pai'] }, { q: 'Qual é a última mensagem?', answers: ['efeito pai'] }], explanation: 'Ordem medida: render pai, render filho, layout filho, layout pai, efeito filho, efeito pai (render de cima para baixo; efeitos de baixo para cima, com os de layout antes).' },
  { id: 'rav-01-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Quando o estado de um pai muda, um filho envolvido em §memo§ e que recebe as mesmas props renderiza de novo.', answer: false, explanation: '§memo§ compara as props de forma rasa e pula a renderização quando são iguais (medido: 0 renderizações extras). O filho comum, sem §memo§, renderiza.' },
  { id: 'rav-01-e4', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma tabela pesada re-renderiza a cada tecla de um campo de busca vizinho, e ambos estão no mesmo componente. Qual é a primeira correção a tentar?', options: ['Envolver tudo em §useEffect§', 'Mover o estado do campo para um componente próprio que recebe a tabela por §children§ (ou para perto de quem o usa)', 'Trocar o campo por um §<div contenteditable>§', 'Desligar o Strict Mode'], answer: 1, explanation: 'O elemento recebido por §children§ foi criado por outro pai e não muda quando o estado do campo muda (medido: 0 renderizações). Reorganizar costuma ser melhor que memoizar.' },
  { id: 'rav-01-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Explique por que o render de um componente precisa ser puro e dê dois exemplos de código impuro dentro do render e a correção de cada um.', model: 'O React pode chamar o componente mais de uma vez, interromper uma renderização, descartá-la e refazê-la (Strict Mode, transições, renderização concorrente), então o render não pode ter efeitos externos nem depender de coisas que mudam sozinhas. Exemplos impuros: (1) incrementar uma variável global ou alterar um objeto externo dentro do render (contador de renderizações usado para exibir algo): a correção é derivar o valor de props e estado ou mover a alteração para um evento ou efeito; (2) chamar Date.now() ou Math.random() para decidir o que mostrar, ou fazer fetch no corpo do componente: a correção é guardar o valor em estado (gerado em um evento ou efeito), usar uma biblioteca de dados e deixar o render apenas calcular JSX.', rubric: ['Explica que o React pode repetir, pausar ou descartar renderizações', 'Dá um exemplo de efeito externo no render (mutação, rede, aleatório ou tempo)', 'Propõe a correção (estado, evento, efeito ou biblioteca)', 'Relaciona a pureza ao Strict Mode ou à concorrência'], explanation: 'A pureza é o contrato que torna o React capaz de otimizar e priorizar o trabalho com segurança.' },
  { id: 'rav-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a ordem de execução. Implemente §ordemDeExecucao(arvore, opcoes)§. Um nó é §{ nome, filhos?, layout?, efeito?, cleanup? }§ (§layout§ e §efeito§ valem §true§ por padrão; §cleanup§ é §false§ por padrão e indica que o efeito do nó devolve uma limpeza). Devolva a lista de strings na ordem do React: (1) §"render NOME"§ de **todos** os nós, **de cima para baixo** (pai antes dos filhos, irmãos na ordem); (2) §"layout NOME"§ dos nós com §layout§, **de baixo para cima** (pós-ordem: filhos, em ordem, antes do pai); (3) se §opcoes.atualizacao§ for verdadeiro, §"cleanup NOME"§ dos nós com §cleanup§ (pós-ordem); (4) §"efeito NOME"§ dos nós com §efeito§ (pós-ordem). Sem §atualizacao§ (montagem) não há cleanups.', lang: 'javascript', starter: 'function ordemDeExecucao(arvore, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Escreva duas travessias: pré-ordem para o render e pós-ordem para os efeitos.', 'Filtre os nós de acordo com as flags antes de gerar as mensagens.'], tests: [{ name: 'montagem e atualização (medidas da aula)', code: R`const arv = { nome: 'pai', filhos: [{ nome: 'filho', cleanup: true }] };
assert.deepEqual(ordemDeExecucao(arv), ['render pai', 'render filho', 'layout filho', 'layout pai', 'efeito filho', 'efeito pai']);
assert.deepEqual(ordemDeExecucao(arv, { atualizacao: true }), ['render pai', 'render filho', 'layout filho', 'layout pai', 'cleanup filho', 'efeito filho', 'efeito pai']);` }, { name: 'irmãos e netos', code: R`const arv = { nome: 'app', filhos: [{ nome: 'a', filhos: [{ nome: 'c' }] }, { nome: 'b' }] };
assert.deepEqual(ordemDeExecucao(arv), ['render app', 'render a', 'render c', 'render b', 'layout c', 'layout a', 'layout b', 'layout app', 'efeito c', 'efeito a', 'efeito b', 'efeito app']);` }, { name: 'flags', code: R`const arv = { nome: 'x', layout: false, filhos: [{ nome: 'y', efeito: false }] };
assert.deepEqual(ordemDeExecucao(arv), ['render x', 'render y', 'layout y', 'efeito x']);
assert.deepEqual(ordemDeExecucao({ nome: 'solo' }), ['render solo', 'layout solo', 'efeito solo']);` }], solution: R`function ordemDeExecucao(arvore, opcoes = {}) {
  const pre = [], pos = [];
  (function visitar(n) { pre.push(n); (n.filhos || []).forEach(visitar); pos.push(n); })(arvore);
  const log = [];
  pre.forEach((n) => log.push('render ' + n.nome));
  pos.filter((n) => n.layout !== false).forEach((n) => log.push('layout ' + n.nome));
  if (opcoes.atualizacao) pos.filter((n) => n.cleanup === true).forEach((n) => log.push('cleanup ' + n.nome));
  pos.filter((n) => n.efeito !== false).forEach((n) => log.push('efeito ' + n.nome));
  return log;
}
`, explanation: 'O modelo reproduz a ordem medida: o render desce a árvore, os efeitos sobem (os de layout antes dos normais) e os cleanups dos efeitos antigos rodam antes dos novos. Em código real, nunca dependa de uma ordem entre irmãos além do que a documentação garante.' },
  { id: 'rav-01-e7', type: 'code', difficulty: 3, points: 25, prompt: 'Modele "o que re-renderiza". Implemente §quemRenderiza(arvore, idMudou)§: cada nó é §{ id, filhos?, memo?, viaChildren? }§. O nó cujo estado mudou (§id === idMudou§) **sempre** renderiza e **todos os seus descendentes** renderizam também, **exceto** os nós com §memo: true§ (props iguais) ou §viaChildren: true§ (elemento criado por um ancestral acima de quem mudou, recebido por §children§) — esses **não** renderizam e **sua subárvore inteira** também não. Devolva os ids que renderizam em **pré-ordem**, começando pelo nó que mudou. Se §idMudou§ não existir, lance §Error("nó inexistente: ID")§. (Só a subárvore do nó que mudou é afetada; nós fora dela não renderizam.)', lang: 'javascript', starter: 'function quemRenderiza(arvore, idMudou) {\n  // seu código aqui\n}\n', hints: ['Primeiro encontre o nó com id === idMudou.', 'Percorra a subárvore dele, pulando os nós memo ou viaChildren e tudo abaixo deles.'], tests: [{ name: 'pai muda: filhos comuns renderizam, memo e children não', code: R`const arv = { id: 'raiz', filhos: [{ id: 'pai', filhos: [{ id: 'comum' }, { id: 'memo', memo: true, filhos: [{ id: 'neto' }] }, { id: 'caixa', filhos: [{ id: 'dentroDeCaixa', viaChildren: true }] }] }, { id: 'irmao' }] };
assert.deepEqual(quemRenderiza(arv, 'pai'), ['pai', 'comum', 'caixa']);` }, { name: 'memo que muda o próprio estado renderiza', code: R`const arv = { id: 'p', filhos: [{ id: 'm', memo: true, filhos: [{ id: 'n' }, { id: 'o', memo: true }] }] };
assert.deepEqual(quemRenderiza(arv, 'm'), ['m', 'n']);
assert.deepEqual(quemRenderiza(arv, 'p'), ['p']);` }, { name: 'folha e inexistente', code: R`const arv = { id: 'a', filhos: [{ id: 'b' }] };
assert.deepEqual(quemRenderiza(arv, 'b'), ['b']);
assert.throws(() => quemRenderiza(arv, 'zzz'), 'nó inexistente: zzz');` }], solution: R`function quemRenderiza(arvore, idMudou) {
  const achar = (n) => {
    if (n.id === idMudou) return n;
    for (const f of n.filhos || []) { const r = achar(f); if (r) return r; }
    return null;
  };
  const alvo = achar(arvore);
  if (!alvo) throw new Error('nó inexistente: ' + idMudou);
  const out = [];
  const visitar = (n, raiz) => {
    if (!raiz && (n.memo || n.viaChildren)) return;
    out.push(n.id);
    (n.filhos || []).forEach((f) => visitar(f, false));
  };
  visitar(alvo, true);
  return out;
}
`, explanation: 'É o modelo que explica as medições: renderizar um pai renderiza os filhos comuns, §memo§ com props iguais corta a subárvore e um elemento recebido por §children§ continua o mesmo. Use o Profiler para confirmar o que realmente ocorre em seu código.' }
],
'rav-02': [
  { id: 'rav-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual combinação faz o React preservar o estado de um componente entre duas renderizações?', options: ['Mesmo tipo, mesma posição na árvore e mesma chave', 'Apenas o mesmo nome do componente', 'Apenas a mesma posição no arquivo-fonte', 'Sempre, independentemente do tipo'], answer: 0, explanation: 'Tipo, posição na árvore e chave definem a identidade; mudar qualquer um desmonta o antigo e monta um novo, descartando o estado.' },
  { id: 'rav-02-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'O contador dentro do componente perde o valor sempre que o pai re-renderiza (por exemplo, ao clicar em outro botão do pai). Clique na linha que causa isso.', code: 'function Pai() {\n  const [t, setT] = useState(0);\n  function Contador() {\n    const [n, setN] = useState(0);\n    return <button onClick={() => setN(n + 1)}>{n}</button>;\n  }\n  return <><button onClick={() => setT(t + 1)}>pai{t}</button><Contador /></>;\n}', answer: 3, explanation: 'Declarar §Contador§ **dentro** de §Pai§ cria um tipo novo a cada render do pai; o React o trata como outro componente, desmonta o antigo e perde o estado. Defina-o fora.' },
  { id: 'rav-02-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Uma lista de três contadores (a, b, c) usa §key={índice}§. O contador "a" é clicado 2 vezes (a:2). Depois a lista passa a ser [c, a, b].', code: 'antes:  a:2  b:0  c:0     (key = 0, 1, 2)\ndepois: ordem [c, a, b]   (key = 0, 1, 2)', lang: 'text', steps: [{ q: 'Qual item mostra o contador 2 depois da reordenação (a, b ou c)?', answers: ['c'] }, { q: 'Com key={id}, qual item mostraria o contador 2?', answers: ['a'] }], explanation: 'Com chave por índice o estado fica na posição: o primeiro item agora é o "c" com a contagem do "a" (medido: c:2 a:0 b:0). Com chave por id, o estado acompanha o item.' },
  { id: 'rav-02-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a mudança ao efeito no estado do componente.', pairs: [['Mesmo tipo, posição e chave', 'Estado preservado'], ['Tipo diferente na mesma posição', 'Estado descartado (desmonta e monta)'], ['Chave diferente', 'Estado reiniciado'], ['Componente definido dentro de outro', 'Estado perdido a cada render do pai']], explanation: 'A identidade (tipo, posição, chave) controla o ciclo de vida do estado.' },
  { id: 'rav-02-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Um formulário de edição de usuário deve limpar os campos sempre que o usuário selecionado mudar. Compare a solução com §key§ e a solução com §useEffect§.', model: 'Com key: <FormularioUsuario key={usuario.id} usuario={usuario} />; ao mudar o id, o React desmonta o formulário antigo e monta um novo, e todo o estado interno é reiniciado, sem código extra, sem renderização intermediária com dados velhos e sem efeito. Com useEffect: um efeito que observa usuario.id e chama os setters para limpar os campos; a renderização acontece primeiro com o estado antigo (flash de dados do usuário anterior), depois o efeito dispara outra renderização; é mais código, propenso a esquecer algum campo e a bugs de sincronização. A documentação recomenda usar key para resetar estado.', rubric: ['Descreve o uso de key com o id do usuário', 'Explica que a mudança de chave recria o componente', 'Aponta a renderização extra e o risco de esquecer campos com useEffect', 'Conclui que key é a solução recomendada'], explanation: 'Resetar por identidade é mais simples e mais robusto que sincronizar estado com efeitos.' },
  { id: 'rav-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a identidade com estado. Implemente §reconciliarEstado(antes, depois)§. Cada item é §{ tipo, chave?, estado? }§. Para cada item de §depois§, na ordem: se tiver §chave§, o par é o item de §antes§ com a **mesma chave e o mesmo tipo** (ainda não usado); se **não** tiver §chave§, o par é o item **sem chave** de §antes§ na **mesma posição entre os itens sem chave** (índice entre os não chaveados), desde que tenha o **mesmo tipo**. Se houver par, o item resultante herda o §estado§ do par; senão fica com §estado: null§ (componente novo). Devolva §{ itens, descartados }§: §itens§ é a lista de §{ tipo, chave, estado }§ na ordem de §depois§ (§chave§ ausente vira §null§) e §descartados§ são os itens de §antes§ sem par, na ordem de §antes§, no formato §{ tipo, chave, estado }§ (com §chave§ §null§ se ausente). Itens de §antes§ com a mesma chave e tipo duplicados: o primeiro não usado vence.', lang: 'javascript', starter: 'function reconciliarEstado(antes, depois) {\n  // seu código aqui\n}\n', hints: ['Marque quais itens de antes já foram usados.', 'Para os sem chave, monte a lista dos itens sem chave de antes e use o índice entre eles.'], tests: [{ name: 'mesma chave acompanha o item; tipo diferente descarta', code: R`const antes = [{ tipo: 'Contador', chave: 'a', estado: 2 }, { tipo: 'Contador', chave: 'b', estado: 0 }, { tipo: 'Contador', chave: 'c', estado: 5 }];
const depois = [{ tipo: 'Contador', chave: 'c' }, { tipo: 'Contador', chave: 'a' }, { tipo: 'Painel', chave: 'b' }];
assert.deepEqual(reconciliarEstado(antes, depois), {
  itens: [{ tipo: 'Contador', chave: 'c', estado: 5 }, { tipo: 'Contador', chave: 'a', estado: 2 }, { tipo: 'Painel', chave: 'b', estado: null }],
  descartados: [{ tipo: 'Contador', chave: 'b', estado: 0 }]
});` }, { name: 'sem chave: posição entre os sem chave', code: R`const antes = [{ tipo: 'A', estado: 'x' }, { tipo: 'B', estado: 'y' }];
const depois = [{ tipo: 'A' }, { tipo: 'B' }, { tipo: 'C' }];
assert.deepEqual(reconciliarEstado(antes, depois), { itens: [{ tipo: 'A', chave: null, estado: 'x' }, { tipo: 'B', chave: null, estado: 'y' }, { tipo: 'C', chave: null, estado: null }], descartados: [] });
assert.deepEqual(reconciliarEstado([{ tipo: 'A', estado: 1 }], [{ tipo: 'P' }]), { itens: [{ tipo: 'P', chave: null, estado: null }], descartados: [{ tipo: 'A', chave: null, estado: 1 }] });` }, { name: 'o índice como chave faz o estado seguir a posição', code: R`const antes = [{ tipo: 'C', chave: '0', estado: 2 }, { tipo: 'C', chave: '1', estado: 0 }, { tipo: 'C', chave: '2', estado: 0 }];
const depois = [{ tipo: 'C', chave: '0', rotulo: 'c' }, { tipo: 'C', chave: '1', rotulo: 'a' }, { tipo: 'C', chave: '2', rotulo: 'b' }];
const r = reconciliarEstado(antes, depois);
assert.deepEqual(r.itens.map((i) => i.estado), [2, 0, 0]);
assert.deepEqual(r.descartados, []);` }, { name: 'chave repetida em antes e mistura', code: R`const antes = [{ tipo: 'T', chave: 'k', estado: 1 }, { tipo: 'T', chave: 'k', estado: 2 }, { tipo: 'U', estado: 9 }];
const r = reconciliarEstado(antes, [{ tipo: 'T', chave: 'k' }, { tipo: 'U' }]);
assert.deepEqual(r.itens, [{ tipo: 'T', chave: 'k', estado: 1 }, { tipo: 'U', chave: null, estado: 9 }]);
assert.deepEqual(r.descartados, [{ tipo: 'T', chave: 'k', estado: 2 }]);` }], solution: R`function reconciliarEstado(antes, depois) {
  const usado = new Array(antes.length).fill(false);
  const semChave = antes.map((it, i) => i).filter((i) => antes[i].chave === undefined || antes[i].chave === null);
  let indiceSemChave = 0;
  const itens = depois.map((d) => {
    let par = -1;
    if (d.chave !== undefined && d.chave !== null) {
      par = antes.findIndex((a, i) => !usado[i] && a.chave === d.chave && a.tipo === d.tipo);
    } else {
      const i = semChave[indiceSemChave++];
      if (i !== undefined && !usado[i] && antes[i].tipo === d.tipo) par = i;
    }
    if (par >= 0) usado[par] = true;
    return { tipo: d.tipo, chave: d.chave === undefined ? null : d.chave, estado: par >= 0 ? (antes[par].estado === undefined ? null : antes[par].estado) : null };
  });
  const descartados = antes.filter((_, i) => !usado[i]).map((a) => ({ tipo: a.tipo, chave: a.chave === undefined ? null : a.chave, estado: a.estado === undefined ? null : a.estado }));
  return { itens, descartados };
}
`, explanation: 'O modelo reproduz as regras medidas: com chaves, o estado acompanha o item; sem chaves, vale a posição; tipos diferentes descartam. Mostra por que o índice como chave faz o estado "grudar" na posição e por que reordenar sem ids estáveis é perigoso.' }
],
'rav-03': [
  { id: 'rav-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a principal vantagem de um componente composto (§Tabs§, §Tabs.Tab§, §Tabs.Panel§) sobre §<Tabs tabs={[...]} />§?', options: ['Usa menos memória', 'Quem usa decide a estrutura e o conteúdo; a API tem menos props e o comportamento fica centralizado', 'Dispensa o React', 'Não precisa de acessibilidade'], answer: 1, explanation: 'A composição dá flexibilidade de layout e de conteúdo (inversão de controle) sem multiplicar props de configuração.' },
  { id: 'rav-03-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'O item "2" nunca é marcado como ativo porque está dentro de um §<div>§. Clique na linha da abordagem frágil.', code: 'function Grupo({ children }) {\n  const [i, setI] = useState(0);\n  return Children.map(children, (c, idx) =>\n    cloneElement(c, { ativo: idx === i, aoClicar: () => setI(idx) }));\n}\n// <Grupo><Item>1</Item><div><Item>2</Item></div></Grupo>', answer: 4, explanation: '§Children.map§ + §cloneElement§ só alcançam os filhos **diretos**: as props foram para o §<div>§. Use um contexto interno para compartilhar o estado com as partes, em qualquer profundidade.' },
  { id: 'rav-03-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o atributo ARIA ao papel no padrão de abas.', pairs: [['role="tablist"', 'Contêiner das abas'], ['aria-selected', 'Indica a aba ativa'], ['aria-controls', 'Aponta o painel controlado pela aba'], ['aria-labelledby (no painel)', 'Aponta a aba que dá nome ao painel']], explanation: 'Esses atributos, com o roving tabindex e as setas, formam o padrão de abas do ARIA Authoring Practices.' },
  { id: 'rav-03-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Renderizar apenas o painel ativo das abas é sempre a melhor opção, mesmo que isso descarte o estado dos painéis ocultos.', answer: false, explanation: 'Painéis desmontados perdem o estado (campos digitados, rolagem). Ofereça uma opção para manter painéis montados e ocultos, ou use a ocultação que preserva estado.' },
  { id: 'rav-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a API pública de um componente composto de Accordion (itens que abrem e fecham). Liste as partes, as props principais de cada uma, o contrato controlado e não controlado e três cuidados de acessibilidade.', model: 'Partes: Accordion (raiz, guarda quais itens estão abertos), Accordion.Item (value), Accordion.Trigger (botão do cabeçalho) e Accordion.Content (painel). Props da raiz: type ("single" ou "multiple"), value/onValueChange (controlado), defaultValue (não controlado), collapsible (permitir fechar o aberto no modo single). Item: value e disabled. Trigger e Content herdam as props nativas e aceitam className. Contrato: com value definido o pai controla e é avisado por onValueChange; sem value, o componente guarda o estado e aceita defaultValue; onValueChange é chamado nos dois modos. Acessibilidade: Trigger é um button dentro de um heading com aria-expanded e aria-controls apontando o Content; o Content tem role="region" e aria-labelledby apontando o Trigger; teclado: Enter e Espaço alternam, setas e Home/End movem o foco entre os Triggers; ids com useId e erro claro quando uma parte é usada fora da raiz.', rubric: ['Define as partes e o papel de cada uma', 'Define value/onValueChange e defaultValue (controlado e não controlado)', 'Cita aria-expanded/aria-controls e a relação com o conteúdo', 'Cita teclado ou ids com useId e erro fora da raiz'], explanation: 'Uma API composta bem projetada nomeia as partes, define o contrato de estado e trata acessibilidade como parte do componente.' },
  { id: 'rav-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente o teclado de Tabs. §proximaAba(abas, atual, tecla, opcoes)§ devolve o **valor** da aba que deve receber o foco. §abas§ é uma lista de §{ valor, desabilitada? }§; §atual§ é o valor da aba com foco; §tecla§ é §"ArrowRight"§, §"ArrowLeft"§, §"ArrowDown"§, §"ArrowUp"§, §"Home"§ ou §"End"§. §opcoes§: §orientacao§ (§"horizontal"§ padrão: usa Right/Left e ignora Down/Up; §"vertical"§: usa Down/Up e ignora Right/Left) e §circular§ (padrão §true§: passa do fim para o início e vice-versa; §false§: para nas pontas). **Abas desabilitadas são puladas.** §Home§/§End§ vão à primeira/última aba habilitada. Se não houver aba habilitada, a tecla for desconhecida ou ignorada pela orientação, ou o movimento não puder acontecer (sem circular, nas pontas), devolva §atual§. Lance §Error("aba inexistente: V")§ se §atual§ não estiver em §abas§.', lang: 'javascript', starter: 'function proximaAba(abas, atual, tecla, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Trabalhe com os índices das abas habilitadas.', 'Para circular, use módulo sobre a lista de habilitadas.'], tests: [{ name: 'setas, circular e Home/End', code: R`const abas = [{ valor: 'a' }, { valor: 'b' }, { valor: 'c' }];
assert.equal(proximaAba(abas, 'a', 'ArrowRight'), 'b');
assert.equal(proximaAba(abas, 'c', 'ArrowRight'), 'a');
assert.equal(proximaAba(abas, 'a', 'ArrowLeft'), 'c');
assert.equal(proximaAba(abas, 'b', 'Home'), 'a');
assert.equal(proximaAba(abas, 'b', 'End'), 'c');
assert.equal(proximaAba(abas, 'c', 'ArrowRight', { circular: false }), 'c');
assert.equal(proximaAba(abas, 'a', 'ArrowLeft', { circular: false }), 'a');` }, { name: 'desabilitadas e orientação', code: R`const abas = [{ valor: 'a' }, { valor: 'b', desabilitada: true }, { valor: 'c' }, { valor: 'd', desabilitada: true }];
assert.equal(proximaAba(abas, 'a', 'ArrowRight'), 'c');
assert.equal(proximaAba(abas, 'c', 'ArrowRight'), 'a');
assert.equal(proximaAba(abas, 'a', 'End'), 'c');
assert.equal(proximaAba(abas, 'c', 'ArrowLeft'), 'a');
assert.equal(proximaAba(abas, 'a', 'ArrowDown'), 'a');
assert.equal(proximaAba(abas, 'a', 'ArrowDown', { orientacao: 'vertical' }), 'c');
assert.equal(proximaAba(abas, 'a', 'ArrowRight', { orientacao: 'vertical' }), 'a');` }, { name: 'bordas e erros', code: R`assert.equal(proximaAba([{ valor: 'x', desabilitada: true }, { valor: 'y', desabilitada: true }], 'x', 'ArrowRight'), 'x');
assert.equal(proximaAba([{ valor: 'u' }], 'u', 'ArrowRight'), 'u');
assert.equal(proximaAba([{ valor: 'u' }, { valor: 'v' }], 'u', 'Enter'), 'u');
assert.throws(() => proximaAba([{ valor: 'u' }], 'zzz', 'Home'), 'aba inexistente: zzz');` }], solution: R`function proximaAba(abas, atual, tecla, opcoes = {}) {
  const { orientacao = 'horizontal', circular = true } = opcoes;
  if (!abas.some((a) => a.valor === atual)) throw new Error('aba inexistente: ' + atual);
  const hab = abas.filter((a) => !a.desabilitada).map((a) => a.valor);
  if (!hab.length) return atual;
  const prox = orientacao === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const ant = orientacao === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
  if (tecla === 'Home') return hab[0];
  if (tecla === 'End') return hab[hab.length - 1];
  if (tecla !== prox && tecla !== ant) return atual;
  let i = hab.indexOf(atual);
  if (i < 0) {
    // a aba atual está desabilitada: ache a posição relativa entre as habilitadas
    const idx = abas.findIndex((a) => a.valor === atual);
    const antes = abas.slice(0, idx).filter((a) => !a.desabilitada).length;
    i = tecla === prox ? antes - 1 : antes;
  }
  const alvo = tecla === prox ? i + 1 : i - 1;
  if (alvo < 0 || alvo >= hab.length) return circular ? hab[(alvo + hab.length) % hab.length] : atual;
  return hab[alvo];
}
`, explanation: 'O padrão ARIA de abas define esse teclado: setas movem o foco, Home e End vão às pontas, e abas desabilitadas são puladas. Isolar a regra em uma função pura a torna testável sem DOM; o componente só liga a função aos eventos de teclado.' }
]
};
