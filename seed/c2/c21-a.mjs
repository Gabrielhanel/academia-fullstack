// C2.1 — React essencial. Aulas 1 a 3 (pensar em React: UI declarativa, JSX, componentes e props).
const R = String.raw;

export const REF = {
  learn: { title: 'React — Learn React', url: 'https://react.dev/learn', kind: 'doc' },
  thinking: { title: 'React — Thinking in React', url: 'https://react.dev/learn/thinking-in-react', kind: 'doc' },
  describing: { title: 'React — Describing the UI', url: 'https://react.dev/learn/describing-the-ui', kind: 'doc' },
  startProject: { title: 'React — Start a New React Project', url: 'https://react.dev/learn/start-a-new-react-project', kind: 'doc' },
  vite: { title: 'Vite — Getting Started', url: 'https://vite.dev/guide/', kind: 'doc' },
  jsx: { title: 'React — Writing Markup with JSX', url: 'https://react.dev/learn/writing-markup-with-jsx', kind: 'doc' },
  curly: { title: 'React — JavaScript in JSX with Curly Braces', url: 'https://react.dev/learn/javascript-in-jsx-with-curly-braces', kind: 'doc' },
  props: { title: 'React — Passing Props to a Component', url: 'https://react.dev/learn/passing-props-to-a-component', kind: 'doc' },
  pure: { title: 'React — Keeping Components Pure', url: 'https://react.dev/learn/keeping-components-pure', kind: 'doc' },
  tsReact: { title: 'React — Using TypeScript', url: 'https://react.dev/learn/typescript', kind: 'doc' },
  xss: { title: 'OWASP — Cross Site Scripting Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html', kind: 'doc' },
  rtl: { title: 'Testing Library — React Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'rea-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['react', 'declarativo', 'componentes', 'vite'],
  title: 'O que é React: interface declarativa, componentes e a árvore de elementos',
  objectives: ['Explicar a ideia central de React: a interface é uma função do estado (UI = f(estado))', 'Distinguir programação imperativa (manipular o DOM) de declarativa (descrever o resultado)', 'Descrever o que é um componente, um elemento React e a árvore de componentes', 'Criar um projeto com Vite, TypeScript e React e reconhecer sua estrutura', 'Entender o papel do React DOM, da renderização no servidor e do navegador'],
  intro: `**React** é uma biblioteca JavaScript para construir interfaces a partir de peças reutilizáveis chamadas **componentes**. Sua ideia central é simples e poderosa: você **descreve como a tela deve ficar para um dado estado**, e o React cuida de **atualizar o DOM** quando o estado muda. Em vez de escrever "ache este elemento, mude este texto, remova aquela classe", você escreve "se há 3 itens, a lista tem 3 linhas". Esta aula constrói o modelo mental que sustenta todo o curso. Os exemplos foram executados com **React 19.3**, Vitest 5.1 e jsdom (laboratório em \`labs/react-essencial/\`).`,
  theory: `### O problema que o React resolve
No DOM puro, você **muda a tela passo a passo**: localiza elementos, altera texto, adiciona e remove nós, e precisa lembrar de **todas** as combinações de estado ("se o usuário está logado **e** o carrinho está vazio **e** há erro, esconda isto"). Quanto maior a interface, mais estados possíveis e mais chance de a tela ficar **inconsistente com os dados**. A abordagem **imperativa** descreve *como* mudar; a **declarativa** descreve *o que* mostrar.

### UI = f(estado)
Em React, um componente é (essencialmente) uma **função** que recebe dados (**props**) e usa **estado** para devolver a descrição da interface. Quando o estado muda, o React **chama a função de novo**, compara a descrição nova com a anterior e **aplica apenas as diferenças** no DOM. Você nunca escreve "atualize o botão": escreve o botão para cada valor possível do estado.
§§§tsx
function Contador() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Cliques: {n}</button>;
}
§§§
No teste, a renderização no servidor (§renderToString§) devolveu §<button>Cliques: <!-- -->0</button>§ e, depois de **dois cliques simulados**, o botão exibia §Cliques: 2§. Os comentários §<!-- -->§ separam nós de texto adjacentes e ajudam a hidratação (aula do Next.js).

### Componentes e elementos
- **Componente**: função (em letra **maiúscula**) que devolve JSX. Reutilizável e **composta** de outros componentes (§<Contador />§).
- **Elemento React**: um **objeto simples e leve** que **descreve** o que se quer na tela (tipo, props, filhos). No teste, §<Contador />§ era um objeto com §$$typeof§, §type§, §key§ e §props§, e §el.type === Contador§ foi §true§: o elemento **aponta** para a função, mas não é a interface em si.
- **Árvore de componentes**: componentes dentro de componentes formam uma árvore (App → Cabecalho, Lista → Item...). O React mantém essa árvore e a reconcilia com o DOM.
Nomes de componente em **maiúscula** são tratados como componentes; minúscula (§<button>§) são elementos nativos do DOM.

### Pensando em React (5 passos)
1. **Divida a interface em componentes** (um componente, uma responsabilidade; o desenho costuma refletir a estrutura dos dados);
2. **Construa uma versão estática** (só props, sem estado);
3. **Encontre a representação mínima do estado** (o que muda e não pode ser calculado de outro valor);
4. **Identifique onde o estado deve viver** (no componente pai comum mais próximo);
5. **Adicione o fluxo de dados inverso** (funções passadas por props para os filhos avisarem o pai).

### Ferramentas: Vite, TypeScript e React DOM
Para começar um projeto **sem framework**, a ferramenta mais comum é o **Vite** (servidor de desenvolvimento rápido e empacotador): §npm create vite@latest meu-app -- --template react-ts§. O modelo traz §index.html§, §src/main.tsx§ (que chama §createRoot(document.getElementById('root')!).render(<App />)§), §src/App.tsx§ e a configuração do TypeScript. Quem precisa de roteamento, dados no servidor e renderização no servidor usa um **framework** (como o Next.js, curso C2.5); a documentação oficial recomenda considerar um framework para aplicações completas. **React** define componentes e estado; **React DOM** os conecta ao navegador (§createRoot§, §hydrateRoot§) e ao servidor (§renderToString§, §renderToPipeableStream§).

### Regras que o React supõe (componentes puros)
Dados as mesmas props, estado e contexto, um componente deve devolver **o mesmo JSX**, sem alterar variáveis externas durante a renderização. Efeitos (buscar dados, mexer no DOM, temporizadores) ficam em **eventos** e em **§useEffect§** (aula 7). Esta pureza é o que permite ao React renderizar de novo, pausar, descartar e reutilizar resultados com segurança. O **Strict Mode** (em desenvolvimento) renderiza duas vezes para ajudar a achar impurezas.

### Mitos comuns
- "React é um framework completo": é uma biblioteca de interface; roteamento, dados e build vêm de outras ferramentas.
- "O DOM virtual é o que torna o React rápido": ele é um **mecanismo** para aplicar diferenças; o ganho principal é o **modelo declarativo** e a atualização mínima, não mágica de desempenho.
- "Componentes de classe são obrigatórios para estado": desde os Hooks (2019) o padrão são **funções**.

### Quando React é uma boa escolha
Interfaces com **muito estado e interação**, equipes que querem **componentes reutilizáveis** e um grande **ecossistema** (roteamento, formulários, testes, design systems). Para páginas estáticas simples, HTML e um pouco de JavaScript bastam.`,
  concepts: [
    { term: 'React', def: 'Biblioteca JavaScript para construir interfaces com componentes e um modelo declarativo.' },
    { term: 'UI declarativa', def: 'Estilo em que se descreve como a interface deve ser para cada estado, em vez de manipular o DOM passo a passo.' },
    { term: 'Componente', def: 'Função (nome em maiúscula) que recebe props e devolve JSX.' },
    { term: 'Elemento React', def: 'Objeto leve que descreve o que renderizar (tipo, props e filhos).' },
    { term: 'Árvore de componentes', def: 'Hierarquia de componentes que o React mantém e reconcilia com o DOM.' },
    { term: 'Reconciliação', def: 'Processo de comparar a descrição nova com a anterior e aplicar só as diferenças.' },
    { term: 'React DOM', def: 'Pacote que conecta o React ao navegador (createRoot) e ao servidor (renderToString).' },
    { term: 'Vite', def: 'Ferramenta de desenvolvimento e empacotamento usada para iniciar projetos React sem framework.' },
    { term: 'Componente puro', def: 'Componente que, para as mesmas entradas, devolve o mesmo JSX e não altera nada externo ao renderizar.' },
    { term: 'Strict Mode', def: 'Modo de desenvolvimento que renderiza duas vezes e repete efeitos para expor impurezas e vazamentos.' }
  ],
  examples: R`**Analogia:** o React é um **arquiteto que redesenha a planta a cada mudança** e entrega aos pedreiros só a lista do que mudou. No jeito imperativo, você é o pedreiro e precisa lembrar de cada parede que já derrubou. No declarativo, você só diz "a casa com 3 quartos", e o arquiteto descobre o que mexer.

**Comparação (contador):**
§§§
Imperativo:  btn = document.querySelector('button'); n = 0; btn.onclick = () => { n++; btn.textContent = 'Cliques: ' + n; }
Declarativo: <button onClick={() => setN(n + 1)}>Cliques: {n}</button>
§§§
No imperativo, **você** garante que o texto acompanha o número em todos os lugares. No declarativo, o texto **é** o número.

**Resultados medidos (React 19.3, Vitest e jsdom):**
- §renderToString(<Contador />)§ → §<button>Cliques: <!-- -->0</button>§;
- depois de dois cliques → §Cliques: 2§;
- §typeof <Contador />§ → §object§ (chaves §$$typeof§, §type§, §key§, §props§), com §type === Contador§.

**Caso real:** um painel de pedidos com filtros, ordenação, seleção em lote e atualização em tempo real tinha centenas de linhas de código DOM e bugs de "tela desatualizada". Reescrito com componentes e um único estado (lista, filtro, seleção), cada tela passou a ser derivada desse estado, e os bugs de inconsistência desapareceram (cenário ilustrativo).`,
  code: [
    { title: 'Um componente e a mesma interface em HTML (executado com React 19.3 e Vitest)', lang: 'tsx', code: R`import { useState } from 'react';
import { renderToString } from 'react-dom/server';

function Contador() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Cliques: {n}</button>;
}

console.log(renderToString(<Contador />));
// <button>Cliques: <!-- -->0</button>

const el = <Contador />;
console.log(typeof el, Object.keys(el).slice(0, 4).join(','), el.type === Contador);
// object $$typeof,type,key,props true`, notes: [{ l: '4', t: 'O nome começa com maiúscula: o React o trata como componente.' }, { l: '5', t: 'useState devolve o valor atual e uma função para alterá-lo.' }, { l: '9', t: 'renderToString gera HTML no servidor; os comentários <!-- --> separam textos vizinhos.' }, { l: '13', t: 'O elemento é um objeto que aponta para a função; ainda não é DOM.' }] },
    { title: 'Ponto de entrada do projeto Vite (padrão do modelo react-ts; não executado aqui)', lang: 'tsx', code: R`// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
// Criar o projeto: npm create vite@latest meu-app -- --template react-ts`, notes: [{ l: '6', t: 'createRoot conecta o React ao elemento #root do index.html.' }, { l: '7', t: 'StrictMode ajuda a achar impurezas em desenvolvimento e não afeta a produção.' }, { l: '11', t: 'O comando e o modelo mudam entre versões do Vite; consulte a documentação. O trecho segue o modelo da documentação e não foi gerado neste ambiente.' }] }
  ],
  bestPractices: ['Pense a interface como função do estado e derive o que puder de valores existentes.', 'Divida a interface em componentes pequenos com uma responsabilidade clara.', 'Mantenha a renderização pura: sem mudanças externas, sem buscas de dados durante o render.', 'Use TypeScript desde o início para tipar props e estado.', 'Comece com Vite para estudar a biblioteca e considere um framework para aplicações completas.', 'Leia a documentação oficial (react.dev), que é atualizada com as versões.'],
  mistakes: ['Manipular o DOM manualmente dentro de componentes e brigar com o React.', 'Nomear componentes com letra minúscula.', 'Guardar em estado o que pode ser calculado de outros valores.', 'Achar que o DOM virtual dispensa pensar em desempenho.', 'Fazer chamadas de rede e mutações no corpo do componente.', 'Confundir React (biblioteca) com Next.js (framework).'],
  market: `React é a biblioteca de interface mais pedida em vagas de front-end e full stack, usada de aplicações web a mobile (React Native). Dominar o modelo declarativo e o fluxo de dados é o que separa quem "usa hooks" de quem entende o porquê dos bugs. A maioria das vagas pede React com TypeScript, testes e um framework (Next.js).`,
  summary: `React descreve a interface como função do estado: o componente (função em maiúscula) devolve JSX, e o React reconcilia a descrição com o DOM. Elementos são objetos leves; componentes formam uma árvore. Pense em React: componentes, versão estática, estado mínimo, onde ele vive e fluxo inverso. Vite inicia projetos; React DOM conecta ao navegador e ao servidor. Mantenha componentes puros e efeitos em eventos ou §useEffect§.`,
  refs: [REF.learn, REF.thinking, REF.describing, REF.startProject, REF.vite, REF.pure],
  cards: [
    { q: 'O que significa UI = f(estado)?', a: 'A interface é o resultado de uma função do estado: para o mesmo estado, a mesma interface.' },
    { q: 'O que é um elemento React?', a: 'Um objeto leve que descreve o que renderizar (tipo, props, filhos); não é o nó do DOM.' },
    { q: 'Por que componentes devem ser puros?', a: 'Para o React poder renderizar de novo, pausar ou descartar resultados com segurança.' },
    { q: 'Qual a diferença entre React e React DOM?', a: 'React define componentes e estado; React DOM conecta a árvore ao navegador (createRoot) e ao servidor (renderToString).' }
  ]
},
{
  id: 'rea-02', moduleId: 'm1', order: 2, minutes: 55, tags: ['jsx', 'xss', 'fragmentos', 'expressões'],
  title: 'JSX em profundidade: expressões, atributos, fragmentos e segurança',
  objectives: ['Explicar que JSX é açúcar sintático para criar elementos (não é HTML nem string)', 'Usar expressões JavaScript em JSX e conhecer as regras de atributos (className, htmlFor, style, camelCase)', 'Retornar vários elementos com fragmentos e entender quais valores o React não renderiza', 'Explicar por que o React escapa o texto e quando §dangerouslySetInnerHTML§ é perigoso', 'Reconhecer o risco de URLs §javascript:§ e saber sanitizar HTML de fonte externa'],
  intro: `**JSX** é a sintaxe que mistura marcação parecida com HTML e JavaScript. Não é HTML, não é uma string e não é um modelo de texto: o compilador (Vite, SWC, esbuild) a transforma em chamadas de função que **criam elementos React**. Entender essa tradução explica as regras que parecem arbitrárias (§className§, um único pai, chaves, fechar todas as tags) e, mais importante, **por que React protege contra XSS por padrão** e onde você pode desligar essa proteção sem querer. Os resultados abaixo foram medidos com **React 19.3** (renderização no servidor).`,
  theory: `### JSX vira elementos
§<h1 className="titulo">Oi</h1>§ é compilado para uma chamada que cria o elemento (no modelo moderno, §jsx("h1", { className: "titulo", children: "Oi" })§, importada de §react/jsx-runtime§ automaticamente). Por isso:
- **JSX é uma expressão**: pode ser guardado em variável, devolvido por função e passado como argumento;
- um componente devolve **um único valor** (um elemento): para vários irmãos use um **fragmento** §<>...</>§ (não gera nó extra no DOM). No teste, §<><li>a</li><li>b</li></>§ renderizou §<li>a</li><li>b</li>§ sem pai;
- toda tag deve ser **fechada** (§<input />§, §<br />§).

### Chaves: JavaScript dentro do JSX
Entre chaves vai uma **expressão** (algo que produz valor): variáveis, chamadas, ternários, §map§. **Não** vão instruções (§if§, §for§). Duas posições: como **filho** (§<p>{nome}</p>§) e como **valor de atributo** (§<img src={url} alt={texto} />§). Para condições use ternário ou §&&§ (aula 5).

### Atributos: nomes e tipos
Os atributos seguem a **API do DOM** em camelCase, não o HTML:
| HTML | JSX |
|---|---|
| §class§ | §className§ |
| §for§ | §htmlFor§ |
| §onclick§ | §onClick§ (recebe uma **função**) |
| §tabindex§ | §tabIndex§ |
| §style="margin-top:4px"§ | §style={{ marginTop: 4 }}§ (**objeto**; números viram §px§ onde fizer sentido) |
O teste confirmou: §<label htmlFor="x" className="rotulo" style={{ marginTop: 4, backgroundColor: 'red' }}>§ virou §<label for="x" class="rotulo" style="margin-top:4px;background-color:red">§. Atributos §aria-*§ e §data-*§ mantêm o hífen. Booleanos: §disabled§ (equivale a §disabled={true}§).

### O que é (e o que não é) renderizado
- **Textos e números**: renderizados (incluindo §0§);
- §null§, §undefined§, §true§, §false§ e §""§: **não produzem nada**;
- **Arrays**: cada item é renderizado (precisam de chaves, aula 5);
- **Objetos comuns**: erro ("Objects are not valid as a React child").
No teste, §<div>{null}{undefined}{false}{true}{0}{''}{[1, 2]}</div>§ gerou §<div>0<!-- -->1<!-- -->2</div>§: só o §0§ e o array apareceram. Cuidado: §{contador && <Aviso />}§ com §contador = 0§ mostra um **"0"** na tela (veja a aula 5).

### Segurança: o React escapa texto
Valores colocados entre chaves como **texto** são **escapados**: caracteres como §<§, §>§ e §"§ viram entidades. Com a entrada §<img src=x onerror="alert(1)">§, a renderização produziu §<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>§: o navegador mostra o texto, não executa nada. Esta é a principal defesa contra **XSS** em interfaces React.

**Onde a proteção acaba:**
1. §dangerouslySetInnerHTML={{ __html: texto }}§: o nome é um aviso. Com a mesma entrada, a saída foi §<p><img src=x onerror="alert(1)"></p>§, **HTML ativo**. Só use com HTML **sanitizado** (por exemplo com DOMPurify) ou conteúdo **seu**;
2. **URLs** em §href§/§src§: §javascript:§ executa código ao clicar. O React 19 **bloqueia** §href="javascript:..."§ (o teste mostrou o atributo substituído por uma chamada que lança um erro explicando o bloqueio), mas **valide URLs** vindas de usuários (aceite só §http:§, §https:§, §mailto:§);
3. **Estilos e CSS** montados com texto de usuário, **ligações a bibliotecas** que escrevem HTML (editores, gráficos) e **renderização no servidor** que injeta JSON em §<script>§ (escape de §</script>§);
4. Acesso direto a §ref.current.innerHTML§.
A regra: **nunca trate dados de usuário como HTML ou como URL confiável**; prefira texto, e sanitize no servidor e no cliente quando HTML for indispensável.

### Comentários, condicionais e listas em JSX
Comentários: §{/* assim */}§. Condicionais e listas são **expressões** (§cond ? <A/> : <B/>§; §itens.map(...)§). Tags de componentes aceitam **namespaces** e membros (§<Menu.Item />§).

### TypeScript e JSX
Arquivos §.tsx§. Props são tipadas; o tipo do JSX é §React.ReactNode§ (qualquer coisa renderizável) e §React.ReactElement§ (um elemento). Eventos têm tipos (§React.ChangeEvent<HTMLInputElement>§).`,
  concepts: [
    { term: 'JSX', def: 'Sintaxe que mistura marcação e JavaScript, compilada para chamadas que criam elementos React.' },
    { term: 'Expressão em JSX', def: 'Código JavaScript entre chaves que produz um valor (não aceita instruções como if e for).' },
    { term: 'Fragmento', def: 'Agrupador <>...</> que devolve vários elementos sem criar um nó extra no DOM.' },
    { term: 'className / htmlFor', def: 'Nomes JSX dos atributos class e for do HTML.' },
    { term: 'ReactNode', def: 'Tipo TypeScript de qualquer coisa que o React sabe renderizar.' },
    { term: 'Escape de texto', def: 'Conversão de caracteres especiais em entidades para que texto não seja interpretado como HTML.' },
    { term: 'dangerouslySetInnerHTML', def: 'Propriedade que insere HTML bruto no elemento, desligando a proteção contra XSS.' },
    { term: 'XSS', def: 'Injeção de script em uma página por meio de conteúdo não confiável interpretado como HTML ou URL.' },
    { term: 'Sanitização', def: 'Remoção de elementos e atributos perigosos de um HTML antes de exibi-lo.' }
  ],
  examples: R`**Analogia:** JSX é uma **receita escrita em linguagem de cozinha** que o compilador traduz para **ordens de serviço** (as chamadas que criam elementos). O escape é o **filtro da cozinha**: tudo que entra como "ingrediente" (texto) é tratado como comida, nunca como ordem de serviço. O §dangerouslySetInnerHTML§ é uma porta dos fundos por onde qualquer um pode entregar uma **ordem** à cozinha.

**Resultados medidos (React 19.3, renderização no servidor):**
§§§
texto escapado: <p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>
perigoso:       <p><img src=x onerror="alert(1)"></p>
atributos:      <label for="x" class="rotulo" style="margin-top:4px;background-color:red">nome</label>
valores ignorados: <div>0<!-- -->1<!-- -->2</div>
fragmento:      <li>a</li><li>b</li>
href javascript: <a href="javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')">x</a>
§§§

**Caso real:** um site de comentários exibia o texto com §dangerouslySetInnerHTML§ "para permitir negrito". Um comentário com §<img onerror=...>§ roubou sessões de outros leitores. A correção: renderizar texto puro, aceitar um subconjunto de Markdown convertido em elementos React e, onde HTML fosse necessário, sanitizar no servidor com uma lista de tags permitidas (cenário ilustrativo, baseado em incidentes comuns).`,
  code: [
    { title: 'Escape de texto, HTML perigoso, atributos e valores ignorados (executado com React 19.3)', lang: 'tsx', code: R`import { renderToString } from 'react-dom/server';

const entrada = '<img src=x onerror="alert(1)">';
console.log(renderToString(<p>{entrada}</p>));
// <p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>
console.log(renderToString(<p dangerouslySetInnerHTML={{ __html: entrada }} />));
// <p><img src=x onerror="alert(1)"></p>   <- HTML ativo!

console.log(renderToString(
  <label htmlFor="x" className="rotulo" style={{ marginTop: 4, backgroundColor: 'red' }}>nome</label>
));
console.log(renderToString(<div>{null}{undefined}{false}{true}{0}{''}{[1, 2]}</div>));
// <div>0<!-- -->1<!-- -->2</div>
console.log(renderToString(<><li>a</li><li>b</li></>));
// <li>a</li><li>b</li>`, notes: [{ l: '4', t: 'Texto entre chaves é escapado: o navegador exibirá o código, sem executá-lo.' }, { l: '6', t: 'dangerouslySetInnerHTML escreve HTML bruto: nunca com dados não confiáveis.' }, { l: '11', t: 'style recebe um objeto; as chaves viram propriedades CSS.' }, { l: '13', t: 'null, undefined, booleanos e a string vazia não geram saída; o 0 aparece.' }] },
    { title: 'Validação de URL antes de usar em href (padrão em TypeScript; testado como função pura)', lang: 'tsx', code: R`const PROTOCOLOS_SEGUROS = new Set(['http:', 'https:', 'mailto:']);

export function urlSegura(texto: string): string | null {
  try {
    const u = new URL(texto, 'https://exemplo.com');   // base permite caminhos relativos
    return PROTOCOLOS_SEGUROS.has(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

function LinkDoUsuario({ url, texto }: { url: string; texto: string }) {
  const seguro = urlSegura(url);
  return seguro ? <a href={seguro} rel="noopener noreferrer">{texto}</a> : <span>{texto}</span>;
}
// urlSegura('javascript:alert(1)') -> null   urlSegura('/perfil') -> 'https://exemplo.com/perfil'`, notes: [{ l: '5', t: 'new URL interpreta e normaliza; protocolos fora da lista são rejeitados.' }, { l: '14', t: 'Em caso de URL insegura, mostre só o texto.' }, { l: '16', t: 'Lógica equivalente é treinada no exercício da aula.' }] }
  ],
  bestPractices: ['Renderize dados de usuário como texto (entre chaves); evite §dangerouslySetInnerHTML§.', 'Sanitize HTML externo (por exemplo, com DOMPurify) e valide URLs antes de usá-las em §href§ e §src§.', 'Use §className§, §htmlFor§ e camelCase nos eventos e atributos.', 'Prefira fragmentos a §div§ vazios que quebram a semântica (listas, tabelas).', 'Lembre que §0§ e §NaN§ aparecem; converta para booleano em condicionais.', 'Mantenha JSX legível: extraia trechos grandes em componentes.'],
  mistakes: ['Usar §class§ e §for§ no JSX.', 'Passar uma string a §style§ em vez de um objeto.', 'Usar instruções (§if§, §for§) dentro de chaves.', 'Colocar §dangerouslySetInnerHTML§ com texto de usuário.', 'Aceitar qualquer URL do usuário em §href§.', 'Esquecer de fechar tags (§<input>§ sem barra).'],
  market: `Segurança de interface (XSS) é tópico de revisão de código e de auditorias; saber onde o React protege e onde não protege é cobrado em entrevistas de front-end. Equipes de segurança olham para §dangerouslySetInnerHTML§, URLs dinâmicas e bibliotecas que escrevem HTML como pontos de revisão.`,
  summary: `JSX compila para chamadas que criam elementos; é uma expressão, com um único valor por retorno (use fragmentos). Chaves aceitam expressões; atributos usam camelCase (className, htmlFor, style como objeto). null, undefined, booleanos e '' não renderizam; 0 sim. O React escapa texto (defesa contra XSS); §dangerouslySetInnerHTML§, URLs não validadas e bibliotecas que escrevem HTML desligam essa proteção: sanitize e valide.`,
  refs: [REF.jsx, REF.curly, REF.xss, REF.tsReact],
  cards: [
    { q: 'O que o JSX vira depois da compilação?', a: 'Chamadas de função (jsx/createElement) que criam elementos React.' },
    { q: 'Por que o React protege contra XSS por padrão?', a: 'Porque escapa o texto entre chaves; só HTML bruto (dangerouslySetInnerHTML) e URLs perigosas desligam a proteção.' },
    { q: 'Quais valores o React não renderiza?', a: 'null, undefined, true, false e a string vazia; o número 0 é renderizado.' },
    { q: 'Como retornar vários elementos irmãos?', a: 'Com um fragmento <>...</>, que não cria nó extra no DOM.' }
  ]
},
{
  id: 'rea-03', moduleId: 'm1', order: 3, minutes: 60, tags: ['props', 'children', 'composição', 'typescript', 'imutabilidade'],
  title: 'Componentes e props: composição, children e tipagem',
  objectives: ['Definir componentes com props tipadas em TypeScript, com valores padrão e props opcionais', 'Usar §children§ e composição em vez de herança e configuração excessiva', 'Explicar que props são somente leitura e o que acontece ao tentar alterá-las', 'Escolher entre passar dados por props, compor com §children§ e usar slots (props que recebem JSX)', 'Reconhecer prop drilling e quando extrair ou compor componentes'],
  intro: `**Props** são os argumentos de um componente: é por elas que o pai passa dados e comportamento aos filhos. O desenho das props define se um componente é **fácil de usar e de reutilizar** ou um emaranhado de opções. Esta aula trata das props como **contrato** (tipado com TypeScript), da **composição** com §children§ (a ferramenta de reuso preferida do React em vez de herança) e das regras de **imutabilidade** que o React assume. Os resultados foram medidos com React 19.3.`,
  theory: `### Props: o contrato do componente
Um componente é uma função que recebe **um objeto de props**:
§§§tsx
type CartaoProps = { titulo: string; destaque?: boolean; children?: React.ReactNode };
function Cartao({ titulo, destaque = false, children }: CartaoProps) {
  return <section className={destaque ? 'cartao destaque' : 'cartao'}><h2>{titulo}</h2>{children}</section>;
}
§§§
- **Desestruture** no parâmetro e dê **valores padrão** (§destaque = false§);
- o **tipo das props** documenta e verifica o uso: faltar §titulo§ é erro de compilação;
- **props opcionais** (§?§) e **uniões literais** (§variante: 'primario' | 'perigo'§) evitam valores inválidos;
- passar um **valor booleano** como atributo sem valor (§<Cartao destaque />§) equivale a §true§;
- espalhar props (§{...resto}§) repassa o restante para um elemento nativo; use com cuidado, para não vazar atributos inesperados.
Medimos: §<Cartao titulo="Olá" destaque><p>corpo</p></Cartao>§ → §<section class="cartao destaque"><h2>Olá</h2><p>corpo</p></section>§ e, sem filhos, §<section class="cartao"><h2>Sem filhos</h2></section>§.

### children e composição
§children§ é a prop especial com o que foi colocado **entre** as tags. Ela permite criar **contêineres** (cartão, modal, layout) sem que eles conheçam o conteúdo: **composição**. Para várias "aberturas", passe JSX em props com nome (**slots**): §<Layout cabecalho={<Menu />} lateral={<Filtros />}>conteúdo</Layout>§. O React recomenda **composição em vez de herança**: não há caso de uso em que seja necessário herdar de um componente.
- **Especialização** por props: §<BotaoPerigo>§ renderiza §<Botao variante="perigo">§;
- **Inversão**: o pai decide o conteúdo, o filho decide a moldura;
- **Render props / funções como filho**: em padrões avançados (aula do curso de React avançado).

### Props são somente leitura
Um componente **nunca altera suas props** nem o que veio por elas (objetos e arrays inclusive). Mudar dados é papel do **estado** (do dono do dado), com funções passadas por props. No teste, tentar §p.titulo = 'y'§ em um objeto de props congelado lançou **TypeError** (em modo estrito); em desenvolvimento, o React congela as props para expor esse erro.

### Fluxo de dados: de cima para baixo
Os dados fluem **pai → filho** por props; os eventos fluem **filho → pai** por funções recebidas como props (§aoMudar§, §onSelect§). Uma convenção útil: nomear os **manipuladores recebidos** com §on§ + verbo (§onSalvar§) e os **internos** com §handle§ (§handleClick§).

### Prop drilling e quando agir
Passar uma prop por vários níveis só para chegar ao neto é **prop drilling**. Em 2 ou 3 níveis, aceitável; acima disso, avalie: (1) **composição** (passar o componente já pronto como §children§ evita intermediários); (2) **Context** (aula 9) para dados realmente globais (tema, usuário); (3) uma **biblioteca de estado** (curso de estado). Não use Context por reflexo.

### Boas práticas de desenho de props
- Poucas props, nomes claros; **objetos grandes** escondem dependências: passe só o que o filho usa;
- evite props **booleanas em excesso** (§<Botao grande vermelho redondo />§): prefira §variante§ e §tamanho§;
- **não** copie props para o estado inicial sem motivo (o estado ignora mudanças posteriores da prop);
- componentes de **apresentação** (recebem dados e eventos) são fáceis de testar; componentes **de contêiner** buscam e preparam dados;
- tipos: use §React.ReactNode§ para conteúdo, §React.ComponentProps<'button'>§ para estender um elemento nativo, §ReactNode | (() => ReactNode)§ com cuidado.

### Componentes como funções puras
Dado o mesmo conjunto de props, o resultado deve ser o mesmo. Nada de §Math.random()§ ou §Date.now()§ no corpo para decidir o que mostrar (use estado e efeitos). Isso facilita testes: renderizar e conferir.`,
  concepts: [
    { term: 'Props', def: 'Objeto de argumentos de um componente, somente leitura, passado pelo pai.' },
    { term: 'children', def: 'Prop especial com o conteúdo colocado entre as tags de abertura e fechamento.' },
    { term: 'Composição', def: 'Reutilizar comportamento combinando componentes, em vez de herança.' },
    { term: 'Slot', def: 'Prop que recebe JSX para um ponto específico de um componente (cabecalho, lateral).' },
    { term: 'Prop drilling', def: 'Passar uma prop por vários níveis de componentes que não a usam, só para alcançar o destino.' },
    { term: 'União literal', def: 'Tipo que restringe a um conjunto de valores, como "primario" | "perigo".' },
    { term: 'Componente de apresentação', def: 'Componente que recebe dados e eventos por props, sem buscar dados nem guardar regras de negócio.' },
    { term: 'Fluxo unidirecional', def: 'Dados descem por props; eventos sobem por funções passadas como props.' }
  ],
  examples: R`**Analogia:** um componente é uma **moldura de quadro**: a moldura (Cartao) decide borda e sombra; o **quadro** (children) é colocado pelo cliente. Mudar o quadro não exige construir outra moldura. As props são as **instruções de encomenda** (cor, tamanho), entregues ao marceneiro e **nunca rabiscadas por ele**.

**Resultados medidos (React 19.3):**
§§§
<section class="cartao destaque"><h2>Olá</h2><p>corpo</p></section>
<section class="cartao"><h2>Sem filhos</h2></section>
props congeladas, tentativa de alterar: TypeError
§§§

**Exemplo de composição (layout com slots):**
§§§tsx
<Pagina
  cabecalho={<Menu itens={itens} />}
  lateral={<Filtros valor={filtro} aoMudar={setFiltro} />}
>
  <ListaDeProdutos produtos={visiveis} />
</Pagina>
§§§
O componente §Pagina§ não sabe nada de produtos nem de filtros: só **organiza espaços**.

**Caso real:** uma biblioteca interna tinha §<Modal>§ com 18 props (§titulo§, §mostrarRodape§, §textoBotaoOk§, §corBotao§...). Cada nova necessidade pedia mais uma prop. Refatorada para composição (§<Modal><Modal.Titulo/>...<Modal.Rodape/></Modal>§), passou a cobrir casos novos sem alterar o componente (cenário ilustrativo).`,
  code: [
    { title: 'Componente com props tipadas, valores padrão e children (executado com React 19.3)', lang: 'tsx', code: R`import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

type CartaoProps = { titulo: string; destaque?: boolean; children?: ReactNode };

function Cartao({ titulo, destaque = false, children }: CartaoProps) {
  return (
    <section className={destaque ? 'cartao destaque' : 'cartao'}>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

console.log(renderToString(<Cartao titulo="Olá" destaque><p>corpo</p></Cartao>));
// <section class="cartao destaque"><h2>Olá</h2><p>corpo</p></section>
console.log(renderToString(<Cartao titulo="Sem filhos" />));
// <section class="cartao"><h2>Sem filhos</h2></section>`, notes: [{ l: '4', t: 'O tipo documenta o contrato e é verificado pelo compilador.' }, { l: '6', t: 'Desestruturação com valor padrão para a prop opcional.' }, { l: '10', t: 'children recebe o conteúdo entre as tags.' }, { l: '14', t: 'destaque sem valor equivale a true.' }] },
    { title: 'Dados descem, eventos sobem: elevando o estado (executado com Testing Library)', lang: 'tsx', code: R`import { useState } from 'react';

function Filho({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) {
  return <input aria-label="nome" value={valor} onChange={(e) => aoMudar(e.target.value)} />;
}

function Pai() {
  const [v, setV] = useState('Ana');           // o estado vive no pai
  return (
    <>
      {/* dados descem; o evento sobe por aoMudar */}
      <Filho valor={v} aoMudar={setV} />
      <p>Olá, {v}</p>
    </>
  );
}
// Após limpar o campo e digitar "Bia", o parágrafo mostrou: "Olá, Bia"`, notes: [{ l: '8', t: 'Estado compartilhado por irmãos sobe para o pai comum.' }, { l: '11', t: 'aoMudar é uma prop do tipo função: o fluxo inverso.' }, { l: '15', t: 'Resultado observado no teste: "Olá, Bia".' }] }
  ],
  bestPractices: ['Tipe as props e use valores padrão e uniões literais para evitar estados inválidos.', 'Prefira composição (§children§ e slots) a props de configuração em excesso.', 'Nunca altere props; mude dados no dono do estado.', 'Nomeie funções recebidas com §on§ e as internas com §handle§.', 'Passe ao filho só o que ele usa e evite copiar props para o estado sem necessidade.', 'Considere composição antes de Context quando houver prop drilling.'],
  mistakes: ['Alterar props ou objetos recebidos.', 'Copiar uma prop para o estado inicial e esperar que ela acompanhe o pai.', 'Criar dezenas de props booleanas que se combinam mal.', 'Passar o objeto inteiro quando o filho usa um campo.', 'Usar herança entre componentes.', 'Resolver prop drilling com Context para todo e qualquer dado.'],
  market: `Desenho de componentes reutilizáveis (props, composição e tipagem) é o núcleo de design systems e bibliotecas internas, e costuma ser avaliado em exercícios práticos de React: "faça um Modal/Tabs/Dropdown reutilizável". Quem domina composição produz componentes menores e mais estáveis.`,
  summary: `Props são o contrato somente leitura de um componente: tipe-as, use padrões e uniões literais. §children§ e slots permitem composição, a forma de reuso recomendada. Os dados descem por props e os eventos sobem por funções. Evite alterar props, copiá-las para o estado sem motivo e resolver prop drilling com Context por reflexo; prefira componentes pequenos e de apresentação.`,
  refs: [REF.props, REF.pure, REF.tsReact, REF.thinking],
  cards: [
    { q: 'Props podem ser alteradas pelo componente que as recebe?', a: 'Não: são somente leitura; mudanças de dados cabem ao dono do estado.' },
    { q: 'O que é children?', a: 'A prop especial com o conteúdo colocado entre as tags do componente.' },
    { q: 'Como evitar um componente com dezenas de props de configuração?', a: 'Compondo-o: children e slots no lugar de flags e textos de configuração.' },
    { q: 'Como um filho avisa o pai que algo mudou?', a: 'Chamando uma função recebida por props (por exemplo, aoMudar ou onSalvar).' }
  ]
}
];
