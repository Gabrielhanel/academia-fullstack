// Curso 4 — JavaScript: fundamentos, DOM e módulos. Aulas 5 a 7.
import { REF } from './js-a.mjs';
const R = String.raw;

export const lessonsB = [
{
  id: 'js-05', moduleId: 'm2', order: 5, minutes: 85, tags: ['javascript', 'assincrono', 'promises', 'async-await', 'fetch'],
  title: 'Assincronia: event loop, Promises, async/await e fetch',
  objectives: ['Explicar o event loop, a pilha de chamadas e a fila de microtarefas', 'Criar e encadear Promises e tratar erros', 'Usar async/await com try/catch', 'Fazer requisições com fetch e tratar respostas com erro', 'Escolher entre Promise.all, allSettled e execução em série'],
  intro: `JavaScript executa seu código em **uma linha só**, mas precisa lidar com coisas lentas: rede, timers, cliques. A solução é a assincronia: o programa pede o trabalho, segue em frente e é avisado quando o resultado chega. Entender como isso funciona explica a ordem dos \`console.log\` que confunde tanta gente.`,
  theory: `### Um fio, uma tarefa por vez
Segundo a MDN, a **pilha de chamadas** (*call stack*) é do tipo último a entrar, primeiro a sair, e cada tarefa é processada **até o fim** antes de qualquer outra (*run-to-completion*). Uma tarefa longa **bloqueia** a página: cliques e animações esperam. Callbacks de timers, eventos e I/O entram na **fila de tarefas** e só rodam quando a pilha esvazia.

### Microtarefas
Há uma segunda fila, a de **microtarefas**, com prioridade maior: ela é esvaziada antes de a próxima tarefa da fila principal ser executada. Os callbacks de Promises (§then§, §catch§, §finally§) são microtarefas; os de §setTimeout§ são tarefas. Por isso:

    setTimeout(() => console.log('timeout'), 0);
    Promise.resolve().then(() => console.log('promise'));
    console.log('sync');
    // sync, promise, timeout

### Promises
Uma Promise representa a conclusão (ou falha) eventual de uma operação assíncrona. Ela fica **pendente** (*pending*) e depois se **resolve** (*fulfilled*, com um valor) ou é **rejeitada** (*rejected*, com um erro); isso se chama *settle*, e depois não muda mais.
- §new Promise((resolve, reject) => { ... })§ cria uma. §Promise.resolve(x)§ e §Promise.reject(e)§ criam já resolvidas.
- §then(fn)§ devolve **uma nova Promise**, o que permite encadear. O valor devolvido por §fn§ alimenta o próximo §then§.
- Segundo a MDN, **sempre retorne as promises** dentro dos callbacks do §then§; sem o §return§ a cadeia não espera e o próximo passo recebe §undefined§.
- Erros caminham pela cadeia até o primeiro §catch§, que cobre tanto rejeições quanto exceções lançadas. Um §catch§ pode ser seguido de mais §then§s.
- §finally§ roda de qualquer jeito, para limpezas.
- Rejeições **não tratadas** viram o evento §unhandledrejection§ no navegador (e §unhandledRejection§ no Node.js).

### async e await
§async function§ sempre devolve uma Promise. Dentro dela, §await promessa§ **pausa apenas aquela função** até a promise se resolver e devolve o valor; se for rejeitada, lança o erro, que você trata com §try/catch§. A semântica de concorrência é a mesma das cadeias de promises.

    async function carregar(id) {
      try {
        const resposta = await fetch('/api/usuarios/' + id);
        if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
        return await resposta.json();
      } catch (erro) {
        console.error('falhou:', erro.message);
        return null;
      }
    }

### fetch
§fetch(url, opcoes)§ devolve uma Promise da resposta. **Armadilha:** §fetch§ só rejeita em falhas de **rede**; respostas de erro HTTP (404, 500) **resolvem normalmente**. Por isso verifique §resposta.ok§ (ou §resposta.status§). Para enviar JSON: §method: 'POST'§, §headers: { 'Content-Type': 'application/json' }§ e §body: JSON.stringify(dados)§.

### Várias operações ao mesmo tempo
- **Em paralelo e esperar todas:** §Promise.all([a(), b(), c()])§ resolve com um array de resultados. Segundo a MDN, se **qualquer uma** rejeitar, o §all§ rejeita imediatamente (as outras seguem rodando, mas os resultados são descartados).
- **Esperar todas, com sucesso ou falha:** §Promise.allSettled§.
- **A primeira que terminar:** §Promise.race§ (e §Promise.any§ para a primeira que **cumprir**).
- **Em série:** um §await§ após o outro dentro de um §for...of§. Cuidado: §await§ dentro de §forEach§ **não** espera.
Se as operações são independentes, rodar em série desperdiça tempo; se uma depende da anterior, rode em série.

### Boas práticas
Defina **tempo limite** (timeout) para operações de rede, trate todos os erros, não misture estilos (§then§ e §await§ no mesmo trecho) sem necessidade, e nunca bloqueie a linha principal com laços longos: divida o trabalho ou use Web Workers.`,
  concepts: [
    { term: 'Event loop', def: 'Mecanismo que pega tarefas da fila e as executa quando a pilha de chamadas está vazia.' },
    { term: 'Run-to-completion', def: 'Cada tarefa é executada até o fim antes de outra começar.' },
    { term: 'Microtarefa', def: 'Tarefa de maior prioridade, como o callback de uma Promise, executada antes da próxima tarefa normal.' },
    { term: 'Promise', def: 'Objeto que representa o resultado eventual (sucesso ou falha) de uma operação assíncrona.' },
    { term: 'async/await', def: 'Sintaxe que permite escrever código assíncrono com aparência síncrona, com try/catch para erros.' },
    { term: 'Promise.all', def: 'Espera várias promises em paralelo; rejeita imediatamente se alguma rejeitar.' },
    { term: 'fetch', def: 'API de requisições HTTP que devolve uma Promise e só rejeita em falhas de rede.' }
  ],
  examples: `**Analogia:** você pede um café e recebe uma senha (a Promise). Em vez de ficar parado no balcão, vai ler o jornal (o código segue). Quando o café fica pronto, o painel chama a senha (o then). Await é dizer "só prossigo com esta tarefa quando minha senha for chamada", sem impedir que a cafeteria atenda os outros.

**Ordem de execução:**

    console.log('1');
    setTimeout(() => console.log('4'), 0);
    Promise.resolve().then(() => console.log('3'));
    console.log('2');
    // 1, 2, 3, 4`,
  code: [
    { title: 'Ordem de execução', lang: 'javascript', code: R`console.log('A');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise 1')).then(() => console.log('promise 2'));
(async () => {
  console.log('B');
  await null;
  console.log('depois do await');
})();
console.log('C');`,
      notes: [ { l: '1', t: 'Síncrono: A é impresso na hora.' }, { l: '4-8', t: 'O corpo da async roda de forma síncrona até o primeiro await: B sai antes de C.' }, { l: '9', t: 'C encerra o trecho síncrono. Depois vêm, nesta ordem, as microtarefas (promise 1, depois do await, promise 2) e só então o timeout. Saída: A, B, C, promise 1, depois do await, promise 2, timeout.' } ] },
    { title: 'async/await com tratamento de erro e fetch', lang: 'javascript', code: R`async function buscarJson(url, { tempoMs = 5000 } = {}) {
  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), tempoMs);
  try {
    const resposta = await fetch(url, { signal: controlador.signal });
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
    return await resposta.json();
  } finally {
    clearTimeout(timer);
  }
}

buscarJson('/api/produtos')
  .then((produtos) => console.log(produtos.length))
  .catch((erro) => console.log('erro:', erro.message));`,
      notes: [ { l: '2-3', t: 'AbortController permite cancelar o fetch se passar do tempo limite.' }, { l: '6', t: 'fetch não rejeita em 404 ou 500: o código verifica resposta.ok e lança.' }, { l: '9', t: 'finally garante a limpeza do timer, com sucesso ou erro.' }, { l: '13-14', t: 'Quem chama trata o erro com catch.' } ] },
    { title: 'Paralelo versus série', lang: 'javascript', code: R`const esperar = (ms, valor) => new Promise((resolve) => setTimeout(() => resolve(valor), ms));

async function serie() {
  const t = Date.now();
  const a = await esperar(100, 'a');
  const b = await esperar(100, 'b');
  console.log(a + b, 'série', Date.now() - t >= 200);
}

async function paralelo() {
  const t = Date.now();
  const [a, b] = await Promise.all([esperar(100, 'a'), esperar(100, 'b')]);
  console.log(a + b, 'paralelo', Date.now() - t < 190);
}

serie().then(paralelo);`,
      notes: [ { l: '5-6', t: 'Em série, o segundo só começa depois do primeiro: cerca de 200 ms no total.' }, { l: '12', t: 'Com Promise.all as duas esperas correm ao mesmo tempo: cerca de 100 ms.' } ] }
  ],
  bestPractices: ['Sempre trate erros em operações assíncronas (catch ou try/catch).', 'Verifique resposta.ok depois do fetch.', 'Use Promise.all para tarefas independentes e série para dependentes.', 'Retorne as promises nos then e use await sem esquecer.', 'Defina tempo limite e permita cancelamento em requisições.', 'Não bloqueie a linha principal com cálculos longos.'],
  mistakes: ['Esquecer o await e trabalhar com a Promise em vez do valor.', 'Achar que fetch rejeita em erros HTTP.', 'Usar await dentro de forEach esperando que ele aguarde.', 'Rodar em série operações independentes.', 'Esquecer o return no then e receber undefined.', 'Deixar rejeições sem tratamento.'],
  market: `Praticamente toda aplicação real faz chamadas de rede, e erros de assincronia estão entre as causas mais comuns de bugs em produção (condições de corrida, requisições sem tratamento, telas que não atualizam). A ordem de execução de Promises e timers é pergunta fixa de entrevistas de JavaScript.`,
  summary: `JavaScript roda uma tarefa por vez até o fim; a fila de microtarefas (Promises) é esvaziada antes da próxima tarefa (timers). Promises encadeiam com then, propagam erros até o catch. async/await escreve isso de forma linear com try/catch. fetch só rejeita em falha de rede: verifique ok. Promise.all roda em paralelo e rejeita se alguma falhar.`,
  refs: [REF.promises, REF.eventLoop, REF.scripting],
  cards: [
    { q: 'Qual a ordem: setTimeout 0, Promise.then e console.log síncrono?', a: 'Primeiro o síncrono, depois o then (microtarefa) e por último o setTimeout (tarefa).' },
    { q: 'fetch rejeita em um erro 404?', a: 'Não. Só em falha de rede; verifique resposta.ok.' },
    { q: 'O que Promise.all faz se uma promise rejeitar?', a: 'Rejeita imediatamente; as demais continuam, mas seus resultados não são devolvidos.' },
    { q: 'await dentro de forEach espera?', a: 'Não. Use for...of (série) ou Promise.all com map (paralelo).' }
  ]
},
{
  id: 'js-06', moduleId: 'm3', order: 6, minutes: 80, tags: ['javascript', 'dom', 'eventos', 'seguranca'],
  title: 'DOM e eventos',
  objectives: ['Explicar o DOM como uma árvore de nós', 'Selecionar, criar, alterar e remover elementos', 'Tratar eventos com addEventListener, preventDefault e delegação', 'Evitar XSS escolhendo textContent em vez de innerHTML com dados externos', 'Manter a página acessível ao manipulá-la'],
  intro: `O DOM é a ponte entre o seu JavaScript e a página. Cada tag vira um objeto que você pode ler e modificar, e cada ação do usuário vira um evento que você pode escutar. É também onde mora um dos erros de segurança mais comuns da web: inserir texto de fora como se fosse HTML.`,
  theory: `### O DOM é uma árvore
Segundo a MDN, o Document Object Model representa o documento em memória como uma árvore, em que cada ramo termina em um **nó**. Há nós de elemento, de texto e de atributo; é comum chamá-los de "elementos", embora nem todo nó seja um elemento. A árvore preserva espaços em branco, então não é idêntica ao HTML-fonte.

### Selecionando
- §document.querySelector('.cartao')§: o **primeiro** elemento que casa com o seletor CSS (ou §null§).
- §document.querySelectorAll('li.ativo')§: **todos**, em uma lista estática (NodeList), que aceita §forEach§ e §for...of§.
- §getElementById('id')§ é rápido e direto. Sempre confira se o resultado não é §null§ antes de usar.
- Navegação: §elemento.parentElement§, §children§, §nextElementSibling§, §closest('seletor')§ (sobe até o ancestral que casa).

### Lendo e alterando
- Texto: §elemento.textContent = 'valor'§ define **texto puro**.
- HTML: §elemento.innerHTML = '<b>x</b>'§ interpreta o valor como HTML.
- Atributos: §getAttribute§, §setAttribute§, §removeAttribute§; propriedades diretas (§input.value§, §a.href§).
- Classes: §elemento.classList.add/remove/toggle/contains('ativo')§. Prefira mudar **classes** a mexer em §style§ linha a linha.
- Dados: atributos §data-*§ aparecem em §elemento.dataset§ (§data-id="7"§ vira §dataset.id§).

### Criando e removendo
    const li = document.createElement('li');
    li.textContent = 'Novo item';
    lista.appendChild(li);        // ou lista.append(li) / lista.prepend(li)
    li.remove();                   // remove da página

Para criar muitos elementos, monte tudo em um §DocumentFragment§ ou em uma string de dados e insira de uma vez, para evitar reflows repetidos.

### Segurança: textContent versus innerHTML
Com §innerHTML§, qualquer texto que vier do usuário, de uma URL ou de uma API e contiver tags (por exemplo, um §<img src=x onerror=...>§) é **executado como HTML**: isso é um ataque de **XSS** (*cross-site scripting*). Regra: para texto, use §textContent§; se precisar mesmo de HTML com dados externos, **escape** os caracteres especiais (§&§, §<§, §>§, §"§, §'§) ou use uma biblioteca de sanitização consolidada. Nunca confie em dados de fora.

### Eventos
Segundo a MDN, §addEventListener§ é a forma recomendada de registrar tratadores de eventos:

    botao.addEventListener('click', (e) => { ... });

- O tratador recebe um **objeto de evento**; §e.target§ é o elemento onde o evento ocorreu e §e.currentTarget§ é o elemento em que o tratador foi registrado.
- §e.preventDefault()§ impede o comportamento padrão (por exemplo, o envio de um formulário ou a navegação de um link).
- É possível registrar vários tratadores para o mesmo evento. §removeEventListener§ remove um tratador, desde que você passe a **mesma referência de função**.
- Eventos comuns: §click§, §input§, §change§, §submit§, §keydown§, §focus§, §blur§, §DOMContentLoaded§.
- §keydown§ traz §e.key§ (o valor da tecla).

### Propagação e delegação
Eventos **sobem** (*bubbling*) do elemento clicado até seus ancestrais: um clique em um §<li>§ também passa pelo §<ul>§. §e.stopPropagation()§ interrompe essa subida (use com cautela). A **delegação de eventos** aproveita isso: em vez de registrar um tratador em cada item de uma lista, registre **um** no pai e descubra o item com §e.target.closest('li')§. Funciona também para itens criados depois.

### Formulários
Escute o evento §submit§ do **form** (não o clique do botão): ele cobre o envio por Enter também. Use §new FormData(form)§ para ler os campos e §preventDefault()§ para tratar com JavaScript.

### Acessibilidade ao manipular o DOM
Use §button§ para ações; ao inserir conteúdo dinâmico importante, anuncie com uma região §aria-live§; gerencie o **foco** ao abrir e fechar diálogos; e mantenha o conteúdo operável por teclado.

### Desempenho
Leitura e escrita alternadas de medidas e estilos forçam o navegador a recalcular o layout várias vezes. Agrupe leituras e escritas, use classes, e limite o trabalho em eventos de alta frequência (§scroll§, §input§) com **debounce** (esperar uma pausa) ou **throttle** (no máximo uma vez a cada intervalo).`,
  concepts: [
    { term: 'DOM', def: 'Representação do documento em memória como árvore de nós que o JavaScript pode ler e alterar.' },
    { term: 'querySelector', def: 'Devolve o primeiro elemento que casa com um seletor CSS, ou null.' },
    { term: 'XSS', def: 'Ataque em que texto de fora é interpretado como HTML ou script pela página.' },
    { term: 'Event bubbling', def: 'Subida do evento do elemento alvo até seus ancestrais.' },
    { term: 'Delegação de eventos', def: 'Um único tratador no ancestral atende os eventos de vários descendentes.' },
    { term: 'preventDefault', def: 'Impede o comportamento padrão do navegador para o evento.' },
    { term: 'Debounce', def: 'Técnica que adia a execução até que não haja novas chamadas por um intervalo.' }
  ],
  examples: `**Analogia da delegação:** em vez de dar um interfone a cada apartamento, você coloca um porteiro na entrada que recebe os chamados e descobre para qual apartamento é. Funciona até para os apartamentos construídos depois.

**Exemplo de XSS:** se um comentário "<img src=x onerror=alert(1)>" for inserido com innerHTML, o navegador cria uma imagem quebrada e **executa** o código do atributo. Com textContent, o texto aparece literalmente na tela, sem perigo.`,
  code: [
    { title: 'Lista dinâmica com delegação e textContent', lang: 'html', code: R`<form id="form-tarefa">
  <label for="nova">Nova tarefa</label>
  <input id="nova" name="nova" required>
  <button type="submit">Adicionar</button>
</form>
<ul id="lista"></ul>

<script>
  const form = document.querySelector('#form-tarefa');
  const lista = document.querySelector('#lista');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = new FormData(form).get('nova').trim();
    if (!texto) return;
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = texto;          // texto puro: sem XSS
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = 'Remover';
    li.append(span, ' ', botao);
    lista.append(li);
    form.reset();
  });

  lista.addEventListener('click', (e) => {
    const botao = e.target.closest('button');
    if (botao) botao.closest('li').remove();
  });
</script>`,
      notes: [ { l: '13', t: 'Escuta o submit do formulário (cobre Enter) e impede o recarregamento da página.' }, { l: '14', t: 'FormData lê os campos pelo name.' }, { l: '19', t: 'textContent trata o valor como texto, mesmo que tenha tags.' }, { l: '28-31', t: 'Delegação: um só tratador na lista atende botões de qualquer item, até os criados depois.' } ] },
    { title: 'Escapando HTML (JavaScript)', lang: 'javascript', code: R`const MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => MAPA[c]);
}

console.log(escaparHtml('<img src=x onerror="alert(1)">'));
// &lt;img src=x onerror=&quot;alert(1)&quot;&gt;`,
      notes: [ { l: '1', t: 'Mapa dos cinco caracteres que precisam ser escapados.' }, { l: '4', t: 'O & vem na mesma expressão: a substituição é feita em uma única passada, então não escapa duas vezes.' } ] },
    { title: 'Debounce com closure', lang: 'javascript', code: R`function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const buscar = debounce((termo) => console.log('buscando', termo), 200);
buscar('j'); buscar('ja'); buscar('jav');
// só 'buscando jav' é impresso, 200 ms depois do último toque`,
      notes: [ { l: '2', t: 'timer vive no closure e é compartilhado entre as chamadas.' }, { l: '4-5', t: 'Cada chamada cancela a anterior e agenda uma nova.' }, { l: '10', t: 'Aplicações: busca ao digitar, ajuste ao redimensionar a janela.' } ] }
  ],
  bestPractices: ['Use textContent para texto e escape ou sanitize antes de qualquer innerHTML com dados externos.', 'Registre tratadores com addEventListener e use delegação em listas dinâmicas.', 'Escute o submit do formulário e não o clique do botão.', 'Mude classes em vez de estilos em linha.', 'Confira se querySelector não devolveu null.', 'Mantenha o foco, o teclado e os anúncios acessíveis ao alterar a tela.'],
  mistakes: ['Inserir texto do usuário com innerHTML.', 'Usar onclick no HTML em vez de addEventListener.', 'Registrar a mesma função anônima para remover depois (não se consegue remover).', 'Esquecer preventDefault em formulários tratados por JavaScript.', 'Criar elementos em laço um a um sem necessidade, forçando muitos reflows.', 'Fazer botões com div sem foco nem teclado.'],
  market: `Mesmo quem trabalha com frameworks precisa entender o DOM: React, Vue e outros o manipulam por baixo. XSS aparece de forma recorrente nas listas de vulnerabilidades mais comuns da web, e escolher textContent em vez de innerHTML é uma das primeiras exigências em revisões de segurança de front-end.`,
  summary: `O DOM é uma árvore de nós. Selecione com querySelector, altere com textContent e classList, crie com createElement. Use textContent para texto de fora (XSS). Eventos: addEventListener, e.target, preventDefault e delegação por bubbling. Escute o submit do form e mantenha a página acessível.`,
  refs: [REF.dom, REF.events, REF.scripting],
  cards: [
    { q: 'Qual a diferença de segurança entre textContent e innerHTML?', a: 'textContent trata o valor como texto puro; innerHTML o interpreta como HTML, o que abre espaço para XSS com dados externos.' },
    { q: 'O que é delegação de eventos?', a: 'Registrar um tratador no ancestral e usar e.target.closest para saber qual descendente originou o evento.' },
    { q: 'Para que serve preventDefault?', a: 'Impede o comportamento padrão do navegador, como enviar o formulário ou seguir o link.' },
    { q: 'Qual evento escutar para tratar um formulário?', a: 'submit, no form, porque cobre também o envio por Enter.' }
  ]
},
{
  id: 'js-07', moduleId: 'm3', order: 7, minutes: 70, tags: ['javascript', 'modulos', 'npm', 'organizacao', 'testes'],
  title: 'Módulos, organização de código e primeiros testes',
  objectives: ['Dividir um programa em módulos ES com import e export', 'Diferenciar export nomeado e padrão', 'Explicar o escopo de módulo, o modo estrito e as dependências circulares', 'Carregar código sob demanda com import() dinâmico', 'Escrever funções testáveis e um teste simples'],
  intro: `Um arquivo de mil linhas é difícil de entender, de testar e de reaproveitar. Módulos permitem dividir o código em partes pequenas com fronteiras claras: cada arquivo mostra só o que quer mostrar e declara do que depende. É a forma padrão de organizar JavaScript moderno, no navegador e no Node.js.`,
  theory: `### Módulos ES
Segundo a MDN, módulos rodam em **modo estrito** automaticamente e têm o **seu próprio escopo**, não o global: o que for declarado em um módulo só fica visível fora dele se for exportado. Só módulos usam §import§ e §export§. No navegador, declare com §<script type="module" src="main.js"></script>§.

### Exportando e importando
**Exportações nomeadas** (quantas quiser por arquivo):

    // matematica.js
    export const PI2 = Math.PI * 2;
    export function soma(a, b) { return a + b; }

    // main.js
    import { soma, PI2 } from './matematica.js';
    import { soma as somar } from './matematica.js';   // renomeando
    import * as mat from './matematica.js';            // namespace: mat.soma

**Exportação padrão** (uma por módulo), que quem importa nomeia como quiser:

    // formatador.js
    export default function formatar(valor) { /* ... */ }

    // main.js
    import formatar from './formatador.js';

Nomeadas e padrão podem conviver no mesmo módulo. Muitos times preferem as **nomeadas**: o nome fica igual em todo o projeto e as ferramentas de refatoração funcionam melhor.

### Detalhes importantes
- Os caminhos relativos precisam da **extensão** e de §./§ no navegador (§'./util.js'§).
- Imports são **estáticos** e ficam no topo: o navegador resolve as dependências antes de executar.
- Um módulo é executado **uma vez**, mesmo que importado de vários lugares; todos compartilham a mesma instância.
- Imports são **vínculos de leitura**: você não pode reatribuir o que importou.
- O servidor precisa entregar os módulos com o tipo MIME de JavaScript, e é recomendado usar um servidor local para testar (abrir o arquivo direto no navegador costuma esbarrar em restrições de segurança).
- **Dependência circular** (a importa b e b importa a) pode deixar valores ainda não inicializados. Reorganize o código para extrair a parte comum para um terceiro módulo.

### import() dinâmico
§import('./pesado.js')§ carrega um módulo **sob demanda**, em tempo de execução, e devolve uma Promise do objeto do módulo. Serve para carregar código apenas quando necessário (uma tela rara, uma biblioteca grande). Funciona também em scripts comuns.

    botao.addEventListener('click', async () => {
      const { desenhar } = await import('./grafico.js');
      desenhar();
    });

### Módulos no Node.js
O Node.js suporta módulos ES: use a extensão §.mjs§ ou defina §"type": "module"§ no §package.json§. O formato mais antigo, CommonJS (§require()§ e §module.exports§), ainda existe em muitos projetos; ao ler código, reconheça os dois.

### npm e dependências
O §npm§ instala pacotes: §npm install pacote§ registra a dependência no §package.json§ e as versões exatas no §package-lock.json§ (que deve ir para o Git). §devDependencies§ são ferramentas de desenvolvimento (testes, formatação). Cada dependência é código de terceiros: avalie a manutenção, o tamanho e a segurança, e mantenha-as atualizadas.

### Organização de código
- Uma responsabilidade por módulo: separar **lógica pura** (cálculos, regras) de **efeitos** (DOM, rede, armazenamento). A lógica pura é fácil de testar.
- Nomes claros, pastas por funcionalidade, um §index.js§ que reexporta a API pública.
- Evite variáveis globais e estado compartilhado escondido.

### Primeiros testes
Funções puras são fáceis de testar: entradas, resultado esperado, comparação. O Node.js traz um executor de testes embutido (§node --test§) e o módulo §assert§:

    import test from 'node:test';
    import assert from 'node:assert/strict';
    import { soma } from './matematica.js';

    test('soma dois números', () => {
      assert.equal(soma(2, 3), 5);
    });

Os exercícios desta plataforma funcionam do mesmo jeito: cada teste monta uma entrada e usa §assert§ para comparar com o esperado. Escreva testes para os casos normais, os limites (lista vazia, zero) e os erros.

### Formatação e qualidade
Ferramentas como **ESLint** (encontra problemas) e **Prettier** (formata) automatizam consistência. Configure-as no projeto e rode no commit ou na integração contínua.`,
  concepts: [
    { term: 'Módulo ES', def: 'Arquivo JavaScript com escopo próprio que usa import e export.' },
    { term: 'Export nomeado', def: 'Exportação com nome fixo; pode haver várias por módulo.' },
    { term: 'Export padrão', def: 'Única exportação default de um módulo, importada com o nome que o importador escolher.' },
    { term: 'import()', def: 'Importação dinâmica que carrega um módulo sob demanda e devolve uma Promise.' },
    { term: 'Dependência circular', def: 'Situação em que dois módulos importam um ao outro.' },
    { term: 'package.json', def: 'Arquivo que descreve o projeto Node.js, seus scripts e dependências.' },
    { term: 'Função pura', def: 'Função sem efeitos colaterais, que devolve o mesmo resultado para as mesmas entradas, fácil de testar.' }
  ],
  examples: `**Analogia:** módulos são as peças de um jogo de montar. Cada peça tem encaixes definidos (exports) e só se liga às outras pelos encaixes (imports). Você troca ou testa uma peça sem desmontar o brinquedo.

**Organização típica:**

    src/
      regras/desconto.js     ← lógica pura (testável)
      api/produtos.js        ← rede
      ui/lista.js            ← DOM
      main.js                ← junta tudo`,
  code: [
    { title: 'Módulos nomeados e padrão', lang: 'javascript', code: R`// regras/desconto.js
export const LIMITE = 0.5;

export function aplicarDesconto(preco, percentual) {
  if (percentual < 0 || percentual > LIMITE) throw new RangeError('desconto fora do limite');
  return Math.round(preco * (1 - percentual) * 100) / 100;
}

export default function descricao(preco, percentual) {
  return 'de ' + preco + ' por ' + aplicarDesconto(preco, percentual);
}

// main.js
import descricao, { aplicarDesconto, LIMITE } from './regras/desconto.js';
console.log(descricao(100, 0.1), aplicarDesconto(80, 0.25), LIMITE);`,
      notes: [ { l: '2-3', t: 'Exportações nomeadas.' }, { l: '9', t: 'A exportação padrão pode usar as funções do próprio módulo.' }, { l: '15', t: 'Importa a padrão (sem chaves) e as nomeadas (entre chaves) na mesma linha.' } ] },
    { title: 'Página com módulo e carregamento sob demanda', lang: 'html', code: R`<button id="grafico">Ver gráfico</button>
<script type="module">
  import { iniciar } from './app.js';
  iniciar();

  document.querySelector('#grafico').addEventListener('click', async () => {
    const { desenhar } = await import('./grafico.js');
    desenhar();
  });
</script>`,
      notes: [ { l: '2', t: 'type="module" liga o modo de módulo (estrito e com escopo próprio).' }, { l: '3', t: 'import estático no topo.' }, { l: '7', t: 'import() dinâmico: grafico.js só é baixado quando o usuário clica.' } ] },
    { title: 'Ordem de carregamento de módulos (grafo de dependências)', lang: 'javascript', code: R`const dependencias = {
  'main.js': ['ui.js', 'api.js'],
  'ui.js': ['util.js'],
  'api.js': ['util.js'],
  'util.js': []
};

function ordem(mapa, raiz) {
  const pronto = new Set();
  const emAndamento = new Set();
  const saida = [];
  function visitar(m) {
    if (pronto.has(m)) return;
    if (emAndamento.has(m)) throw new Error('dependência circular em ' + m);
    emAndamento.add(m);
    for (const d of mapa[m] || []) visitar(d);
    emAndamento.delete(m);
    pronto.add(m);
    saida.push(m);
  }
  visitar(raiz);
  return saida;
}

console.log(ordem(dependencias, 'main.js'));
// ['util.js', 'ui.js', 'api.js', 'main.js']`,
      notes: [ { l: '8-22', t: 'Busca em profundidade: um módulo só entra na saída depois de todas as suas dependências, que é a ordem em que o navegador os executa.' }, { l: '14', t: 'Se um módulo é encontrado enquanto ainda está sendo visitado, há um ciclo.' }, { l: '12', t: 'util.js é compartilhado, mas entra uma vez só.' } ] }
  ],
  bestPractices: ['Um módulo, uma responsabilidade; separe lógica pura de efeitos.', 'Prefira exportações nomeadas.', 'Evite dependências circulares: extraia o que é comum.', 'Use import() para carregar partes pesadas sob demanda.', 'Versione o package.json e o lockfile e revise cada dependência nova.', 'Escreva testes para os casos normais, os limites e os erros.', 'Automatize ESLint e Prettier.'],
  mistakes: ['Esquecer a extensão ou o ./ nos caminhos do navegador.', 'Abrir o HTML direto do disco e estranhar os erros de módulo.', 'Criar dependências circulares.', 'Tentar reatribuir uma variável importada.', 'Misturar require e import sem entender a diferença.', 'Colocar toda a lógica no mesmo arquivo da interface, o que impede testar.'],
  market: `Todo projeto moderno de JavaScript é composto por módulos, e ferramentas como Vite, Webpack e frameworks partem desse formato. Saber estruturar código em módulos testáveis é o que separa um protótipo de um código mantido por equipes.`,
  summary: `Módulos ES têm escopo próprio e modo estrito; export nomeado (várias) e padrão (uma). import() carrega sob demanda. Evite ciclos, separe lógica pura de efeitos e escreva testes. npm gerencia dependências, que também são risco e custo.`,
  refs: [REF.modules, REF.scripting],
  cards: [
    { q: 'Qual a diferença entre export nomeado e padrão?', a: 'Nomeado tem nome fixo e pode haver vários por módulo; o padrão é único e quem importa escolhe o nome.' },
    { q: 'Para que serve import()?', a: 'Carregar um módulo sob demanda, em tempo de execução, devolvendo uma Promise.' },
    { q: 'O que um módulo tem de diferente de um script comum?', a: 'Escopo próprio (não global), modo estrito automático e suporte a import/export.' },
    { q: 'Por que separar lógica pura dos efeitos?', a: 'Porque a lógica pura é fácil de testar e reaproveitar.' }
  ]
}
];
