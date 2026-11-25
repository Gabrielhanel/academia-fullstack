// C1.3 — Ferramentas do desenvolvedor e expressões regulares. Aulas 1 a 3 (editor, terminal, depuração).
const R = String.raw;

export const REF = {
  vscodeTips: { title: 'Visual Studio Code — Tips and Tricks', url: 'https://code.visualstudio.com/docs/getstarted/tips-and-tricks', kind: 'doc' },
  vscodeNav: { title: 'Visual Studio Code — Code Navigation', url: 'https://code.visualstudio.com/docs/editing/editingevolved', kind: 'doc' },
  editorconfig: { title: 'EditorConfig — documentação', url: 'https://editorconfig.org/', kind: 'doc' },
  lsp: { title: 'Microsoft — Language Server Protocol', url: 'https://microsoft.github.io/language-server-protocol/', kind: 'spec' },
  bashReadline: { title: 'Bash Reference Manual — Command Line Editing (Readline)', url: 'https://tiswww.case.edu/php/chet/bash/bashref.html#Command-Line-Editing', kind: 'doc' },
  devtools: { title: 'Chrome for Developers — Chrome DevTools', url: 'https://developer.chrome.com/docs/devtools', kind: 'doc' },
  devtoolsJs: { title: 'Chrome for Developers — Debug JavaScript', url: 'https://developer.chrome.com/docs/devtools/javascript', kind: 'doc' },
  devtoolsNetwork: { title: 'Chrome for Developers — Network features reference', url: 'https://developer.chrome.com/docs/devtools/network/reference', kind: 'doc' },
  mdnConsole: { title: 'MDN — console (API)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/console', kind: 'doc' },
  mdnDebugger: { title: 'MDN — debugger statement', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger', kind: 'doc' },
  nodeDebug: { title: 'Node.js — Debugging Node.js', url: 'https://nodejs.org/en/learn/getting-started/debugging', kind: 'doc' },
  nodeCli: { title: 'Node.js — Command-line API', url: 'https://nodejs.org/api/cli.html', kind: 'doc' },
  nodeProcess: { title: 'Node.js — process (eventos uncaughtException e unhandledRejection)', url: 'https://nodejs.org/api/process.html', kind: 'doc' },
  vscodeNodeDebug: { title: 'Visual Studio Code — Debugging', url: 'https://code.visualstudio.com/docs/debugtest/debugging', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'fer-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['editor', 'terminal', 'produtividade', 'atalhos'],
  title: 'Editor, terminal e atalhos: produtividade com ferramentas',
  objectives: ['Navegar, buscar e refatorar código com os recursos de um editor moderno (paleta de comandos, busca, múltiplos cursores, ir para definição, renomear símbolo)', 'Explicar o que o Language Server Protocol e o EditorConfig resolvem', 'Usar o terminal com eficiência: histórico, atalhos de edição de linha, aliases e funções', 'Organizar a configuração pessoal (dotfiles) de forma versionada e reproduzível', 'Escolher ferramentas por critérios (padronização do time, custo de aprendizado, extensibilidade)'],
  intro: `Um desenvolvedor passa a maior parte do dia no **editor** e no **terminal**. Dominar essas duas ferramentas não é vaidade: é a diferença entre renomear um símbolo em 40 arquivos com segurança em dois segundos e fazê-lo "na mão" com medo de errar. Esta aula não ensina um editor específico, e sim **as capacidades que valem a pena aprender em qualquer um** (VS Code, JetBrains, Vim, Zed) e como montar um ambiente rápido, previsível e compartilhável com o time.`,
  theory: `### O que um bom editor entrega
Um editor moderno é uma combinação de **edição de texto**, **inteligência de código** e **integração com ferramentas** (terminal, depurador, Git). Os recursos que mais economizam tempo:

- **Paleta de comandos** (§Ctrl+Shift+P§ no VS Code): acessa *qualquer* comando por nome, sem decorar atalhos. É a primeira porta para descobrir recursos.
- **Abrir arquivo por nome** (§Ctrl+P§): navegação por busca difusa; elimina a árvore de pastas para o trabalho do dia a dia.
- **Busca e substituição** no arquivo e no projeto (§Ctrl+F§, §Ctrl+Shift+F§), com suporte a **expressões regulares** (aulas 6 a 8) e pré-visualização das mudanças.
- **Múltiplos cursores** (§Alt+clique§ ou §Ctrl+D§ para selecionar a próxima ocorrência): edita várias posições de uma vez.
- **Ir para definição** (§F12§), **ver referências** (§Shift+F12§) e **renomear símbolo** (§F2§): operam sobre o **significado** do código, não sobre texto. Renomear um símbolo com §F2§ atualiza apenas as referências corretas; uma busca textual por "id" mudaria também comentários e variáveis sem relação.
- **Formatação ao salvar** e **correções rápidas** (a "lâmpada"): aplicam as regras do projeto (aula 4).
- **Terminal integrado**, **controle de versão** e **depurador** na mesma janela (aulas 2, 3 e 5).
- **Snippets**: modelos de código expandidos por abreviações (por exemplo, §clg§ vira §console.log()§).

### Como o editor "entende" o código: LSP
O **Language Server Protocol (LSP)** define como um editor conversa com um **servidor de linguagem** (um programa separado que conhece a linguagem): autocompletar, erros em tempo real, ir para definição, renomear, formatar. Antes dele, cada editor precisava de um plugin por linguagem; com o LSP, um servidor (por exemplo, o do TypeScript ou o do Python) funciona em vários editores. Consequência prática: a qualidade da "inteligência" depende de o servidor da linguagem estar **instalado, configurado e vendo o projeto certo** (versão do TypeScript do projeto, ambiente virtual do Python). Se o autocompletar parece "burro", verifique primeiro isso.

### Padronizando o time: EditorConfig e configuração do projeto
Times têm pessoas com editores diferentes. O **EditorConfig** (arquivo §.editorconfig§ na raiz) padroniza o básico em praticamente qualquer editor:
§§§ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
§§§
Regras de estilo mais amplas (aspas, ponto e vírgula, largura) ficam em formatadores como o Prettier (aula 4). Versione as configurações **do projeto** (§.editorconfig§, §.vscode/settings.json§ compartilhável, configuração de linter) e deixe as preferências **pessoais** (tema, fonte, atalhos) fora do repositório.

### Extensões: poucas e confiáveis
Cada extensão roda código com acesso ao seu computador. Instale de editoras confiáveis, revise as permissões, desative as que não usa e prefira as oficiais da linguagem ou da ferramenta (ESLint, Prettier, Docker, GitLens, etc.). Em editores com "modo restrito" para pastas não confiáveis, use-o ao abrir repositórios desconhecidos: um projeto pode definir tarefas e configurações que executam comandos.

### Terminal: edição de linha e histórico
O Bash usa a biblioteca **Readline**. Atalhos que mais compensam:
| Atalho | Efeito |
|---|---|
| §Ctrl+R§ | busca **incremental no histórico** (digite parte do comando; §Ctrl+R§ de novo vai ao anterior) |
| §Ctrl+A§ / §Ctrl+E§ | início / fim da linha |
| §Alt+B§ / §Alt+F§ | volta / avança uma palavra |
| §Ctrl+W§ | apaga a palavra anterior; §Ctrl+U§ apaga até o início; §Ctrl+K§ até o fim |
| §Ctrl+L§ | limpa a tela |
| §Tab§ (duas vezes) | completa nomes de arquivos, comandos e opções |
| §!!§ | repete o último comando (§sudo !!§ repete com sudo) |
| §Alt+.§ | insere o último argumento do comando anterior |
| §cd -§ | volta ao diretório anterior |

O comando §history§ lista o histórico (guardado em §~/.bash_history§). Atenção: **segredos digitados na linha de comando ficam no histórico** (senhas, tokens em parâmetros). Prefira variáveis de ambiente, arquivos protegidos ou entrada interativa; comandos iniciados com um espaço podem ser ignorados do histórico quando a variável §HISTCONTROL§ inclui §ignorespace§.

### Aliases e funções
§§§bash
alias ll='ls -lah'
alias gs='git status -sb'
mkcd() { mkdir -p "$1" && cd "$1"; }
§§§
Aliases são atalhos de texto; **funções** aceitam argumentos e lógica. Coloque-os em §~/.bashrc§ (ou no arquivo do seu shell). Evite aliases que **alteram o comportamento** de comandos padrão em scripts (por exemplo, §alias rm='rm -rf'§ é perigoso): scripts não carregam aliases interativos, mas o hábito pode traí-lo em outras máquinas.

### Dotfiles versionados
Seus arquivos de configuração (§.bashrc§, §.gitconfig§, §.editorconfig§ global, configurações do editor) formam seus **dotfiles**. Guardá-los em um repositório Git (sem segredos!) permite reconstruir seu ambiente em minutos em uma máquina nova. Uma técnica simples: manter o repositório em §~/dotfiles§ e criar **links simbólicos** (§ln -s§) para os locais esperados.

### Escolhendo ferramentas
Critérios sensatos: **padronização do time** (o mesmo formatador e linter para todos), **ecossistema da linguagem**, **custo de aprendizado**, **desempenho** em projetos grandes, **acessibilidade** e **licença**. O melhor editor é o que você domina e que o time consegue padronizar o suficiente para a revisão de código não virar disputa de estilo.`,
  concepts: [
    { term: 'Paleta de comandos', def: 'Campo de busca que executa qualquer comando do editor pelo nome.' },
    { term: 'Múltiplos cursores', def: 'Edição simultânea de várias posições do texto.' },
    { term: 'Renomear símbolo', def: 'Refatoração que atualiza todas as referências de um identificador com base no significado do código.' },
    { term: 'LSP', def: 'Language Server Protocol: padrão de comunicação entre editores e servidores de linguagem (autocompletar, erros, navegação).' },
    { term: 'EditorConfig', def: 'Arquivo .editorconfig que padroniza codificação, indentação e finais de linha entre editores.' },
    { term: 'Readline', def: 'Biblioteca de edição de linha do Bash, com atalhos como Ctrl+R e Ctrl+A.' },
    { term: 'Alias', def: 'Apelido de texto para um comando; funções aceitam argumentos e lógica.' },
    { term: 'Dotfiles', def: 'Arquivos de configuração pessoais (.bashrc, .gitconfig) que podem ser versionados.' },
    { term: 'Snippet', def: 'Modelo de código expandido por uma abreviação.' }
  ],
  examples: R`**Analogia:** o editor é a **bancada de um marceneiro**. Quem domina as ferramentas (serra, plaina, esquadro) faz em minutos o que outro faz em horas e erra menos. A **paleta de comandos** é a parede com todas as ferramentas etiquetadas; o **renomear símbolo** é uma ferramenta de precisão que só mexe nas peças certas, ao contrário de uma busca textual, que "lixa tudo".

**Cenário real — renomear com segurança:** o parâmetro §usr§ de uma função é usado em 12 arquivos e você quer chamá-lo §usuario§. Com **busca e substituição textual**, você também alteraria §usrAgent§ e comentários. Com **renomear símbolo** (§F2§), o LSP troca apenas as referências ao símbolo real e mostra a pré-visualização.

**Cenário real — histórico salvando o dia:** "Qual era aquele comando §docker run§ de semana passada?" → §Ctrl+R§ + "docker run" encontra, e §Ctrl+R§ de novo passa ao anterior. Para consultar sem executar, §history | grep docker§.

**Cenário real — onboarding em 10 minutos:** repositório com §.editorconfig§, configurações compartilhadas do editor (extensões recomendadas, formatação ao salvar) e um §README§ com os comandos. A pessoa nova abre o projeto e o ambiente já tem as regras do time.`,
  code: [
    { title: 'Atalhos úteis e funções no Bash (executado em bash 5)', lang: 'bash', code: R`mkcd() { mkdir -p "$1" && cd "$1"; }
mkcd /tmp/projeto-teste/src
pwd                       # /tmp/projeto-teste/src
cd -                      # volta ao diretório anterior
echo 'olá' > a.txt
history | tail -3         # em shell interativo mostra os últimos comandos`, notes: [{ l: '1', t: 'A função recebe o argumento em $1; && só entra no diretório se o mkdir deu certo.' }, { l: '3', t: 'pwd mostra o diretório atual; cd - alterna com o anterior.' }, { l: '6', t: 'O comando history só mostra o histórico em um shell interativo; em um script ele costuma estar vazio.' }] },
    { title: '.editorconfig do projeto', lang: 'ini', code: R`root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false`, notes: [{ l: '1', t: 'root = true impede a busca por arquivos .editorconfig em pastas acima.' }, { l: '3', t: '[*] aplica as regras a todos os arquivos.' }, { l: '11', t: 'Em Markdown, dois espaços no fim da linha podem significar quebra de linha, por isso não se remove o espaço final.' }] }
  ],
  bestPractices: ['Aprenda a paleta de comandos, a busca por arquivo, o renomear símbolo e o ir para definição antes de qualquer outro atalho.', 'Versione §.editorconfig§ e as configurações do projeto; deixe preferências pessoais fora.', 'Instale poucas extensões, de fontes confiáveis, e revise-as periodicamente.', 'Mantenha seus dotfiles em um repositório (sem segredos).', 'Não digite segredos na linha de comando; eles ficam no histórico.', 'Padronize formatação e lint no projeto para não discutir estilo em revisões.'],
  mistakes: ['Usar busca e substituição textual para refatorar em vez de renomear o símbolo.', 'Instalar dezenas de extensões sem critério e abrir projetos desconhecidos fora do modo restrito.', 'Cada pessoa do time com configurações de indentação e finais de linha diferentes, gerando diffs ruidosos.', 'Colocar senhas e tokens em comandos e deixá-los no histórico.', 'Configurar aliases que mudam o comportamento de comandos perigosos (rm, mv, cp).', 'Reinventar toda a configuração a cada máquina nova, sem versionar os dotfiles.'],
  market: `Produtividade com ferramentas aparece em avaliações práticas e em pair programming: quem domina atalhos, busca, refatoração e depuração integrada trabalha visivelmente mais rápido e com menos erros. Padronização de formatação e configuração de projeto reduz atrito em revisões e integração de novas pessoas.`,
  summary: `Domine a paleta de comandos, a busca por arquivo e no projeto, múltiplos cursores, ir para definição e renomear símbolo (que opera por significado, via LSP). Padronize o time com §.editorconfig§ e configurações versionadas; instale poucas extensões confiáveis. No terminal, use §Ctrl+R§, atalhos de edição de linha, aliases e funções, e cuide para não deixar segredos no histórico. Versione seus dotfiles sem segredos.`,
  refs: [REF.vscodeTips, REF.vscodeNav, REF.editorconfig, REF.lsp, REF.bashReadline],
  cards: [
    { q: 'Qual a vantagem de renomear símbolo (F2) sobre substituir texto?', a: 'O renomear atua pelo significado do código (via LSP) e só altera as referências reais, evitando mudar nomes parecidos e comentários.' },
    { q: 'O que o LSP resolve?', a: 'Padroniza a comunicação entre editores e servidores de linguagem, de modo que um servidor serve a vários editores.' },
    { q: 'Para que serve o .editorconfig?', a: 'Padronizar charset, indentação e finais de linha entre editores diferentes do time.' },
    { q: 'Por que evitar segredos na linha de comando?', a: 'Eles ficam no histórico do shell e podem aparecer na lista de processos.' }
  ]
},
{
  id: 'fer-02', moduleId: 'm1', order: 2, minutes: 75, tags: ['depuracao', 'devtools', 'navegador', 'console'],
  title: 'Depuração no navegador com as ferramentas de desenvolvedor',
  objectives: ['Usar os painéis Elements, Console, Sources, Network e Application do DevTools para investigar problemas', 'Depurar JavaScript com breakpoints (de linha, condicionais, logpoints e de eventos), passos e inspeção de escopo', 'Ler uma pilha de chamadas (stack trace) e localizar a origem de um erro', 'Usar o painel Network para analisar requisições, cache, tempos e reproduzir chamadas', 'Aplicar um método de depuração em vez de "console.log por tentativa e erro"'],
  intro: `Depurar não é "olhar o código até ver o erro": é um **processo científico**. Você observa o comportamento, formula uma hipótese, testa e confirma. O navegador oferece um laboratório completo para isso, as **ferramentas de desenvolvedor** (DevTools), com as quais é possível parar o programa no meio da execução, ver o valor de cada variável, inspecionar o DOM, analisar a rede e medir desempenho. Esta aula mostra como transformar essas ferramentas em hábito.`,
  theory: `### Um método de depuração
1. **Reproduza** o problema de forma confiável (passos exatos, dados de entrada, ambiente). Sem reprodução não há como saber se corrigiu.
2. **Reduza**: isole o menor trecho que ainda falha.
3. **Observe** (valores, ordem de execução, requisições) antes de mudar qualquer coisa.
4. **Formule uma hipótese** ("o array chega vazio porque a resposta chegou depois do render").
5. **Teste** a hipótese com um breakpoint, um log dirigido ou um teste automatizado.
6. **Corrija a causa**, não o sintoma, e **escreva um teste** que impeça a regressão.

### O painel Elements
Mostra o **DOM vivo** (o estado atual da página, não o HTML original) e o **CSS aplicado**. Permite editar atributos e estilos ao vivo, ver a **cascata** (regras riscadas foram sobrescritas), inspecionar o *box model* e forçar estados (§:hover§, §:focus§). Dica: o **"Inspecionar"** (seta no canto) seleciona um elemento clicando na página. O resultado é útil para testar um ajuste antes de colocá-lo no código.

### O painel Console
Além de exibir mensagens e erros, permite **executar JavaScript** no contexto da página. A API §console§ vai além de §log§:
- §console.log§ / §info§ / §warn§ / §error§: níveis de mensagem (filtráveis).
- §console.table(array)§: dados em tabela, ótimo para listas de objetos.
- §console.group()§ / §groupEnd()§: agrupa mensagens relacionadas.
- §console.time('rotulo')§ / §timeEnd('rotulo')§: mede trechos.
- §console.assert(condição, mensagem)§: só escreve se a condição for falsa.
- §console.trace()§: imprime a pilha de chamadas até aquele ponto.
- §console.dir(obj)§: mostra a estrutura de um objeto.
Cuidado: **remova logs de depuração** antes de publicar (o ESLint pode avisar com a regra §no-console§) e jamais registre dados sensíveis.

### O painel Sources: parando o programa
Um **breakpoint** pausa a execução em uma linha. Estando pausado, você vê o **escopo** (variáveis locais, de closure e globais), a **pilha de chamadas** (quem chamou quem) e pode avaliar expressões (**Watch**). Tipos úteis:
- **Breakpoint de linha**: clique no número da linha.
- **Breakpoint condicional**: só para quando uma expressão é verdadeira (§item.id === 42§). Evita parar mil vezes em um laço.
- **Logpoint**: imprime uma mensagem no console **sem alterar o código** (substitui o §console.log§ temporário).
- **Breakpoints de evento e de DOM**: parar quando um listener de §click§ dispara, quando um atributo muda, ou em uma requisição §fetch§/XHR.
- **Pausar em exceções**: para onde o erro foi lançado, não onde ele foi capturado.
- A instrução §debugger;§ no código equivale a um breakpoint quando o DevTools está aberto (remova antes de publicar).

**Passos de execução:** *Resume* (continuar até o próximo breakpoint), *Step over* (executa a linha e não entra em chamadas), *Step into* (entra na função chamada), *Step out* (sai da função atual). A **pilha de chamadas** permite subir os quadros e ver os valores em cada nível, o que é essencial para descobrir **de onde veio um valor errado**.

**Source maps:** código minificado ou transpilado (TypeScript, JSX) é difícil de ler; um **source map** liga o código executado ao original, e o DevTools mostra seus arquivos de origem nos breakpoints e nas mensagens de erro.

### Lendo um stack trace
\`\`\`
TypeError: Cannot read properties of undefined (reading 'nome')
    at formatarUsuario (app.js:12:20)
    at renderLista (app.js:30:9)
    at HTMLButtonElement.<anonymous> (app.js:48:5)
\`\`\`
Leia **de cima para baixo**: a primeira linha diz **o que** deu errado e o primeiro quadro, **onde** estourou (§formatarUsuario§, linha 12, coluna 20); os seguintes mostram **quem chamou**. A causa raiz costuma estar em um quadro **abaixo** do que estourou: quem passou o valor §undefined§? Em chamadas assíncronas, os quadros indicam §async§ quando o motor reconstrói a pilha.

### O painel Network
Lista cada requisição: método, URL, **status**, tipo, tamanho e **tempo** (uma "cascata" por fase: DNS, conexão, TLS, espera, download). Recursos importantes:
- Filtros por tipo (§Fetch/XHR§, §JS§, §CSS§, §Img§) e busca por texto.
- Aba **Headers** (cabeçalhos da requisição e da resposta, inclusive cache e cookies), **Payload** (corpo enviado), **Response** e **Timing**.
- **Disable cache** (com o DevTools aberto) para testar sem cache; **Throttling** para simular redes lentas e **Offline**.
- **"Copy as cURL"**: reproduz a requisição no terminal (aula de HTTP do curso de redes).
- Campos úteis: um **CORS** que falha aparece no Console como erro de política de mesma origem, e no Network como requisição bloqueada ou sem resposta legível.

### Application, Performance e outros
- **Application**: inspeciona *cookies*, *localStorage*, *IndexedDB*, *Service Workers* e cache (aula de Web Platform).
- **Performance**: grava a atividade (CPU, renderização, rede) e mostra onde o tempo vai; o **Lighthouse** gera auditorias de desempenho, acessibilidade e boas práticas.
- **Memory**: *heap snapshots* ajudam a achar vazamentos.
- Em celulares, o DevTools remoto e o modo de dispositivos simulam telas e toques.

### Depuração de problemas comuns
| Sintoma | Onde olhar |
|---|---|
| "Cannot read properties of undefined" | stack trace + breakpoint na linha; suba a pilha para achar quem passou o valor |
| A tela não atualiza | valor do estado no momento do render (breakpoint ou logpoint); ordem de chamadas assíncronas |
| Estilo não aplica | Elements → regras riscadas, especificidade, herança |
| Dados vazios ou errados | Network → status, payload, resposta; cache |
| Funciona local e falha em produção | versões, variáveis de ambiente, HTTPS/CORS, source maps |
| Página lenta | Network (cascata) e Performance |`,
  concepts: [
    { term: 'Breakpoint', def: 'Ponto em que a execução pausa para inspeção; pode ser de linha, condicional, logpoint ou de evento.' },
    { term: 'Logpoint', def: 'Breakpoint que imprime uma mensagem no console sem pausar nem alterar o código.' },
    { term: 'Stack trace', def: 'Lista de chamadas ativas no momento de um erro, da mais recente para a mais antiga.' },
    { term: 'Step over / into / out', def: 'Controles de passo: executar a linha, entrar na função chamada e sair da função atual.' },
    { term: 'Source map', def: 'Arquivo que mapeia código transpilado ou minificado de volta para o original.' },
    { term: 'DOM vivo', def: 'Estado atual da página no navegador, que pode diferir do HTML recebido.' },
    { term: 'Throttling', def: 'Simulação de redes ou CPU mais lentas no DevTools.' },
    { term: 'console.table / console.time', def: 'Métodos do console para tabelas e medição de tempo.' },
    { term: 'Pausar em exceções', def: 'Opção do depurador que para no ponto em que o erro foi lançado.' }
  ],
  examples: R`**Analogia:** depurar é **investigar um acidente**: o stack trace é a lista de testemunhas (quem estava onde); o breakpoint é a **pausa na câmera de segurança** no instante do problema; o painel de escopo mostra o estado da cena; e o logpoint é uma **câmera extra** instalada sem mexer no prédio.

**Cenário real — "Cannot read properties of undefined (reading 'nome')":** (1) Reproduza clicando no botão. (2) A pilha mostra o erro em §formatarUsuario§, linha 12. (3) Breakpoint na linha: o parâmetro §usuario§ é §undefined§. (4) Suba a pilha até §renderLista§: ele chama §formatarUsuario(lista[i])§ com §i§ passando do tamanho do array (erro de limite, "off by one"). (5) Corrija o laço e escreva um teste com lista vazia e com um item.

**Cenário real — requisição "some":** no Network, o §fetch§ aparece com status §404§: a URL tem uma barra duplicada. Com "Copy as cURL" você reproduz no terminal, confirma o status e corrige a montagem da URL.`,
  code: [
    { title: 'Console: ferramentas além do log (executado com Node.js; o navegador tem a mesma API)', lang: 'javascript', code: R`const itens = [{ id: 1, nome: 'caneta', preco: 2.5 }, { id: 2, nome: 'caderno', preco: 15 }];
console.table(itens);
console.time('soma');
const total = itens.reduce((s, i) => s + i.preco, 0);
console.timeEnd('soma');        // soma: 0.0xx ms (o valor varia)
console.assert(total === 17.5, 'total inesperado');   // não imprime nada (condição verdadeira)
console.assert(total === 18, 'total inesperado:', total); // imprime "Assertion failed: ..."
console.group('detalhes'); console.log('itens:', itens.length); console.groupEnd();`, notes: [{ l: '2', t: 'console.table desenha uma tabela com as colunas id, nome e preco.' }, { l: '3-5', t: 'time e timeEnd medem o intervalo entre as chamadas com o mesmo rótulo.' }, { l: '6-7', t: 'assert só escreve quando a condição é falsa; a segunda linha falha de propósito para mostrar a mensagem.' }, { l: '8', t: 'group indenta as mensagens até groupEnd.' }] },
    { title: 'Depurando uma função com erro (leia a pilha de baixo para cima)', lang: 'javascript', code: R`function formatarUsuario(u) {
  return u.nome.toUpperCase();      // estoura se u for undefined
}
function renderLista(lista) {
  const saida = [];
  for (let i = 0; i <= lista.length; i++) {   // <= : erro de limite
    saida.push(formatarUsuario(lista[i]));
  }
  return saida;
}
renderLista([{ nome: 'ana' }]);`, notes: [{ l: '2', t: 'O erro estoura aqui (TypeError), mas o defeito não está aqui.' }, { l: '6', t: 'A causa raiz: <= faz i ir além do último índice e passar undefined adiante. Um breakpoint na linha 2 mostra u === undefined e a pilha leva a renderLista.' }, { l: '11', t: 'Executado com Node.js, o stack trace mostra "at formatarUsuario" e "at renderLista"; o navegador exibe o mesmo formato.' }] }
  ],
  bestPractices: ['Reproduza e reduza o problema antes de mexer no código.', 'Use breakpoints condicionais e logpoints no lugar de espalhar §console.log§ pelo código.', 'Leia o stack trace do primeiro quadro (onde estourou) para baixo (quem chamou).', 'Corrija a causa raiz e acrescente um teste de regressão.', 'Use "Disable cache" e a limitação de rede para reproduzir problemas de carregamento.', 'Remova §debugger§ e logs temporários antes de publicar e não registre dados sensíveis.'],
  mistakes: ['Alterar o código por tentativa e erro sem entender a causa.', 'Corrigir o sintoma (um §if§ para esconder o §undefined§) em vez da origem do valor.', 'Esquecer que o DevTools mostra o DOM atual, não o HTML recebido.', 'Testar com cache ligado e não ver a versão nova do arquivo.', 'Deixar §debugger§ ou §console.log§ de dados pessoais em produção.', 'Não usar source maps e depurar código minificado.'],
  market: `Depurar com método é uma das habilidades mais valorizadas e visíveis em entrevistas práticas e em plantões. Quem usa breakpoints, pilha e o painel de rede resolve em minutos o que outros levam horas, e escreve testes que evitam que o problema volte.`,
  summary: `Depure com método: reproduzir, reduzir, observar, hipotetizar, testar e corrigir a causa. Use Elements (DOM e CSS), Console (§table§, §time§, §assert§, §trace§), Sources (breakpoints de linha, condicionais, logpoints, de evento, passos e escopo), Network (status, cabeçalhos, cache, tempos, "Copy as cURL") e Application. Leia o stack trace de cima para baixo e procure a origem do valor errado nos quadros anteriores.`,
  refs: [REF.devtools, REF.devtoolsJs, REF.devtoolsNetwork, REF.mdnConsole, REF.mdnDebugger],
  cards: [
    { q: 'O que é um logpoint?', a: 'Um breakpoint que escreve uma mensagem no console sem pausar a execução nem alterar o código.' },
    { q: 'Como ler um stack trace?', a: 'A primeira linha diz o erro; o primeiro quadro, onde estourou; os seguintes, quem chamou. A causa costuma estar em quem passou o valor errado.' },
    { q: 'Para que serve um breakpoint condicional?', a: 'Para pausar só quando uma expressão for verdadeira, evitando parar a cada iteração de um laço.' },
    { q: 'Como reproduzir uma requisição do navegador no terminal?', a: 'No Network, "Copy as cURL" gera o comando equivalente.' }
  ]
},
{
  id: 'fer-03', moduleId: 'm1', order: 3, minutes: 70, tags: ['depuracao', 'nodejs', 'inspector', 'erros'],
  title: 'Depuração no Node.js: inspector, VS Code e tratamento de erros',
  objectives: ['Iniciar um programa Node.js com o inspector (--inspect e --inspect-brk) e conectá-lo ao DevTools e ao VS Code', 'Configurar uma sessão de depuração no VS Code (launch.json) com breakpoints, watch e pilha', 'Usar --watch, --enable-source-maps e --stack-trace-limit no dia a dia', 'Diferenciar erros síncronos, assíncronos e não tratados e usar os eventos uncaughtException e unhandledRejection corretamente', 'Aplicar cuidados de segurança ao expor o inspector'],
  intro: `No servidor não há uma janela para clicar e inspecionar, mas o Node.js usa o **mesmo motor (V8)** e o **mesmo protocolo de depuração** que o Chrome. Ou seja: tudo que você aprendeu sobre breakpoints, escopo e pilha vale também para APIs, scripts e testes rodando no terminal. Esta aula mostra como conectar essas ferramentas ao Node.js e como entender e tratar corretamente os erros do seu processo.`,
  theory: `### O inspector do Node.js
Ao iniciar o Node.js com a opção §--inspect§, ele abre um **servidor do protocolo de inspeção** (WebSocket) que depuradores usam para pausar, inspecionar e avaliar código. Em nosso teste, §node --inspect a.js§ imprimiu "Debugger listening on ws://127.0.0.1:9229/..." e a dica de documentação.
- §node --inspect app.js§: ativa o inspector na porta **9229** (padrão) e **segue executando**.
- §node --inspect-brk app.js§: ativa e **pausa na primeira linha**, esperando o depurador (ideal para depurar a inicialização).
- §node --inspect=127.0.0.1:9230 app.js§ (ou §--inspect=9230§): define o endereço e a porta, útil quando há vários processos.
- §node inspect app.js§: depurador de linha de comando embutido, útil sem interface gráfica.

### Conectando ao DevTools e ao VS Code
- **Chrome/Edge:** abra §chrome://inspect§, clique em *Open dedicated DevTools for Node* ou *inspect* no alvo listado. A interface é a mesma do navegador (Sources, Console, Memory).
- **VS Code:** o depurador embutido do Node funciona sem instalar nada. Há três modos: (1) o **JavaScript Debug Terminal** (qualquer comando §node§ iniciado nele já vem depurável); (2) o botão **Run and Debug** com configuração automática; (3) um arquivo §.vscode/launch.json§:
§§§json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Executar app",
      "program": "DOLAR{workspaceFolder}/src/index.js",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Anexar (9229)",
      "port": 9229
    }
  ]
}
§§§
O modo **launch** inicia o programa; o **attach** conecta a um processo já iniciado com §--inspect§ (útil em contêineres, com a porta mapeada). §skipFiles§ evita entrar no código interno do Node ao dar *step into*.

### Segurança do inspector
O inspector permite **executar código arbitrário** no processo. Regras:
- Mantenha o padrão **§127.0.0.1§**; **nunca** use §--inspect=0.0.0.0§ em um servidor exposto (qualquer pessoa na rede teria controle do processo).
- Em contêineres, mapeie a porta somente para o *loopback* do host ou use um túnel SSH (§ssh -L 9229:127.0.0.1:9229 servidor§).
- Não deixe §--inspect§ ativado em produção por padrão; ative-o de forma pontual e controlada (por exemplo, enviando o sinal §SIGUSR1§ a um processo Node em execução, que ativa o inspector).

### Opções do dia a dia
- §node --watch app.js§: **reinicia** automaticamente quando os arquivos mudam; em nosso teste, ele rodou o script, aguardou e reiniciou ao detectar a alteração.
- §node --enable-source-maps app.js§: faz os stack traces apontarem para o código original (TypeScript, transpilados).
- §node --stack-trace-limit=50 app.js§: aumenta a profundidade da pilha (o padrão é 10 quadros).
- §NODE_OPTIONS="--enable-source-maps"§: aplica opções a todos os processos Node do ambiente (por exemplo, em scripts npm).
- §console.trace('rotulo')§ imprime a pilha em qualquer ponto; §util.inspect(obj, { depth: null })§ mostra objetos inteiros (o §console.log§ limita a profundidade).

### Erros em Node.js: síncronos, assíncronos e não tratados
- **Síncronos:** §try/catch§ captura §throw§ na mesma pilha.
- **Callbacks:** o padrão *error-first* (§(err, dados) => ...§). Um §throw§ dentro de um callback assíncrono **não** é capturado por um §try/catch§ ao redor da chamada original.
- **Promises e async/await:** erros viram **rejeições**; use §try/catch§ com §await§ ou §.catch()§.
- **Eventos de último recurso:**
  - §process.on('uncaughtException', handler)§: disparado por uma exceção que ninguém capturou.
  - §process.on('unhandledRejection', handler)§: disparado por uma promise rejeitada sem tratamento. Desde o Node.js 15, o comportamento padrão é **encerrar o processo** com erro (modo §throw§).
  Esses eventos servem para **registrar o erro e encerrar de forma controlada** (fechar conexões, gravar log e sair com código diferente de zero), não para "ignorar e continuar", pois o processo pode estar em estado inconsistente.
- **Códigos de saída:** um processo que termina por erro deve sair com código ≠ 0 (§process.exitCode = 1§), para que scripts, CI e orquestradores percebam a falha. A aula 4 do curso de Linux explica os códigos 137 e 143.

### Depurando testes e scripts
- Teste com o runner nativo: §node --test§ (e §--test-name-pattern='trecho'§ para rodar um só).
- Com §--inspect-brk§ você depura um teste: §node --inspect-brk --test arquivo.test.js§.
- Em aplicações com *clusters* ou *workers*, cada processo ou thread tem seu próprio alvo de inspeção; use portas diferentes.

### Logs e observabilidade (primeiro contato)
Em produção não se depura com breakpoints: depende-se de **logs estruturados** (JSON com nível, mensagem, identificador de requisição), **métricas** e **traces**. Logue o suficiente para reconstruir o que aconteceu (contexto, ids), sem dados sensíveis, e use níveis (§debug§, §info§, §warn§, §error§). Isso é aprofundado no curso de Logs e observabilidade.`,
  concepts: [
    { term: 'Inspector', def: 'Interface de depuração do Node.js, acessada por WebSocket por ferramentas como o DevTools e o VS Code.' },
    { term: '--inspect-brk', def: 'Inicia o inspector e pausa na primeira linha, aguardando o depurador.' },
    { term: 'launch e attach', def: 'No VS Code, iniciar o programa sob o depurador ou conectar a um processo já em execução.' },
    { term: '--watch', def: 'Reinicia o programa automaticamente quando os arquivos mudam.' },
    { term: 'Source map (Node)', def: 'Com --enable-source-maps, as pilhas apontam para o código original.' },
    { term: 'uncaughtException', def: 'Evento disparado por exceção não capturada; deve registrar e encerrar de forma controlada.' },
    { term: 'unhandledRejection', def: 'Evento disparado por promise rejeitada sem tratamento; por padrão encerra o processo.' },
    { term: 'Código de saída', def: 'Número devolvido pelo processo; diferente de zero indica falha.' },
    { term: 'Log estruturado', def: 'Registro em formato de dados (JSON) com campos como nível, mensagem e identificadores.' }
  ],
  examples: R`**Analogia:** o **inspector** é uma **janela de observação** instalada em uma sala fechada (o processo): você só olha de fora do prédio, por segurança, e controla quem tem a chave. Abrir a janela para a rua inteira (§0.0.0.0§) seria deixar qualquer um entrar e mexer nas máquinas.

**Cenário real — depurar a inicialização:** o servidor falha ao ler a configuração antes de qualquer requisição. Use §node --inspect-brk src/index.js§, abra §chrome://inspect§ ou use o VS Code (*attach*) e passe linha a linha pela leitura do arquivo. Sem o §brk§, o programa terminaria antes de você conectar.

**Cenário real — "unhandledRejection derrubou a API":** um §fetch§ sem §await§ nem §.catch§ rejeitou e, no Node.js moderno, a promise sem tratamento encerra o processo. A correção não é "silenciar o evento": é **tratar a rejeição** no ponto certo e, no último recurso, registrar e sair com código ≠ 0 para que o orquestrador reinicie o serviço de forma limpa.`,
  code: [
    { title: 'Pilha de erro e opções do Node (executado com Node.js 26)', lang: 'bash', code: R`cat > e.js <<'EOF'
function interna() { throw new Error('falhou'); }
function externa() { interna(); }
try { externa(); } catch (e) { console.log(e.stack.split('\n').slice(0, 3).join('\n')); }
EOF
node e.js
# Error: falhou
#     at interna (/caminho/e.js:1:28)
#     at externa (/caminho/e.js:2:22)
node --stack-trace-limit=1 -e "try { (function f() { throw new Error('x') })() } catch (e) { console.log(e.stack.split('\n').length) }"   # 2 linhas: mensagem + 1 quadro`, notes: [{ l: '6-8', t: 'O primeiro quadro (interna) é onde estourou; o segundo (externa) é quem chamou. Linha:coluna são posições no arquivo.' }, { l: '9', t: '--stack-trace-limit=1 mantém só um quadro: a pilha completa tem a mensagem mais 1 quadro.' }] },
    { title: 'Iniciando o inspector e o modo watch (executado)', lang: 'bash', code: R`node --inspect a.js                 # Debugger listening on ws://127.0.0.1:9229/<id>
node --inspect=127.0.0.1:9333 a.js  # outra porta
echo "console.log('v1')" > w.js
node --watch w.js                   # imprime v1, aguarda e reinicia quando w.js mudar`, notes: [{ l: '1', t: 'O endereço padrão é 127.0.0.1:9229; o identificador no final da URL muda a cada execução.' }, { l: '2', t: 'Mudar a porta permite depurar vários processos ao mesmo tempo.' }, { l: '4', t: 'Ao detectar a alteração, o Node mostra "Restarting w.js" e executa de novo.' }] },
    { title: 'Último recurso para erros não tratados (exemplo de uso)', lang: 'javascript', code: R`process.on('unhandledRejection', (motivo) => {
  console.error('rejeição não tratada:', motivo);
  process.exitCode = 1;   // sinaliza falha para CI e orquestradores
  // fechar conexões e sair de forma controlada
  setImmediate(() => process.exit());
});`, notes: [{ l: '2', t: 'Registre o erro com contexto; em produção, use um logger estruturado.' }, { l: '3', t: 'Um código diferente de zero faz o orquestrador reiniciar o serviço e o CI falhar.' }, { l: '5', t: 'Exemplo de padrão; não foi executado como parte desta lição. O ideal é tratar a rejeição no ponto de origem.' }] }
  ],
  bestPractices: ['Mantenha o inspector em §127.0.0.1§ e use túneis SSH para depurar remotamente.', 'Use §--inspect-brk§ para depurar a inicialização e §--watch§ para ciclos rápidos em desenvolvimento.', 'Habilite §--enable-source-maps§ em projetos TypeScript ou transpilados.', 'Trate rejeições onde elas ocorrem; use §unhandledRejection§ só como rede de segurança que registra e encerra.', 'Termine com código diferente de zero em caso de falha.', 'Em produção, invista em logs estruturados e métricas, não em breakpoints.'],
  mistakes: ['Expor o inspector em §0.0.0.0§ ou deixá-lo ligado em produção.', 'Usar §uncaughtException§ para "ignorar" erros e continuar rodando com estado inconsistente.', 'Esperar que um §try/catch§ capture erro lançado dentro de um callback assíncrono.', 'Esquecer o §await§ e deixar promises rejeitadas sem tratamento.', 'Depurar código transpilado sem source maps.', 'Registrar objetos de erro sem a pilha ou com dados sensíveis.'],
  market: `Servidores Node.js são parte central de muitos produtos. Saber depurar uma API localmente, anexar a um contêiner com segurança, tratar rejeições e produzir logs úteis são competências exigidas de quem trabalha com backend e full stack, e reduzem o tempo de resolução de incidentes.`,
  summary: `O Node.js usa o protocolo de inspeção do V8: §--inspect§ (segue) e §--inspect-brk§ (pausa no início), porta 9229 em §127.0.0.1§, acessível por §chrome://inspect§ ou pelo VS Code (launch ou attach). Nunca exponha o inspector. §--watch§ reinicia a cada mudança; §--enable-source-maps§ e §--stack-trace-limit§ melhoram as pilhas. Trate erros síncronos, callbacks e promises onde ocorrem; §uncaughtException§ e §unhandledRejection§ servem para registrar e encerrar com código ≠ 0.`,
  refs: [REF.nodeDebug, REF.nodeCli, REF.nodeProcess, REF.vscodeNodeDebug],
  cards: [
    { q: 'Qual a diferença entre --inspect e --inspect-brk?', a: '--inspect ativa o inspector e segue executando; --inspect-brk pausa na primeira linha até um depurador conectar.' },
    { q: 'Por que não usar --inspect=0.0.0.0 em servidores?', a: 'O inspector permite executar código arbitrário; expô-lo à rede dá controle total do processo a qualquer um que o alcance.' },
    { q: 'O que acontece, por padrão, com uma promise rejeitada sem tratamento no Node.js moderno?', a: 'O processo é encerrado com erro (modo throw, desde o Node.js 15).' },
    { q: 'O que --watch faz?', a: 'Reinicia o programa automaticamente quando os arquivos observados mudam.' }
  ]
}
];
