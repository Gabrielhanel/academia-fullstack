// C2.6 — Testes de frontend. Aulas 4 a 6 (interações e assincronia; contexto, hooks e roteamento; MSW).
const R = String.raw;

export const REF2 = {
  userEvent: { title: 'Testing Library — user-event', url: 'https://testing-library.com/docs/user-event/intro/', kind: 'doc' },
  asyncMethods: { title: 'Testing Library — Async Methods', url: 'https://testing-library.com/docs/dom-testing-library/api-async/', kind: 'doc' },
  reactAct: { title: 'React — act (referência)', url: 'https://react.dev/reference/react/act', kind: 'doc' },
  renderHook: { title: 'Testing Library — renderHook', url: 'https://testing-library.com/docs/react-testing-library/api/#renderhook', kind: 'doc' },
  tlWrapper: { title: 'Testing Library — Setup (wrapper e provedores)', url: 'https://testing-library.com/docs/react-testing-library/setup/', kind: 'doc' },
  commonMistakes: { title: 'Kent C. Dodds — Common mistakes with React Testing Library', url: 'https://kentcdodds.com/blog/common-mistakes-with-react-testing-library', kind: 'doc' },
  mswIntro: { title: 'MSW — Introdução', url: 'https://mswjs.io/docs/', kind: 'doc' },
  mswNode: { title: 'MSW — Integração com Node.js', url: 'https://mswjs.io/docs/integrations/node', kind: 'doc' },
  mswBrowser: { title: 'MSW — Integração com o navegador', url: 'https://mswjs.io/docs/integrations/browser', kind: 'doc' },
  mswBest: { title: 'MSW — Boas práticas', url: 'https://mswjs.io/docs/best-practices', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'tfe-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['user-event', 'assincronia', 'findBy', 'waitFor', 'act', 'formulários', 'teclado'],
  title: 'Testing Library II: interações com user-event, assincronia (findBy, waitFor), formulários e teclado',
  objectives: ['Simular interações com user-event (click, type, tab, keyboard) e explicar por que ele é preferível a fireEvent', 'Esperar resultados assíncronos com findBy e waitFor sem usar esperas fixas', 'Entender o papel do act e evitar os avisos de atualização fora do act', 'Testar formulários completos: preenchimento, validação, envio e erros', 'Testar a navegação por teclado e o foco'],
  intro: `Interações reais não são um evento isolado. Ao clicar, o navegador move o foco, dispara §pointerdown§, §mousedown§, §focus§, §mouseup§ e §click§; ao digitar, dispara §keydown§, §keypress§, §input§ e §keyup§ **por tecla**. A biblioteca **user-event** reproduz essas sequências, enquanto §fireEvent§ dispara **um único evento**. Esta aula ensina a interagir como a pessoa, a lidar com tudo o que é **assíncrono** (respostas, animações, temporizadores) **sem** colocar pausas fixas, e a testar formulários e teclado. Os resultados foram medidos no laboratório (user-event 14.6.13, Testing Library React 16.3.3).`,
  theory: `### user-event
§§§
const user = userEvent.setup();     // uma instância por teste
await user.click(elemento);
await user.type(campo, 'texto');    // digita tecla a tecla (clica no campo antes)
await user.clear(campo);
await user.selectOptions(select, 'opcao');
await user.keyboard('{Enter}');
await user.tab();                   // Shift+Tab: user.tab({ shift: true })
§§§
- chame §userEvent.setup()§ **antes** de renderizar e use §await§ em **todas** as ações (são assíncronas);
- ele respeita regras do navegador: **não clica** em elemento **desabilitado** ou com §pointer-events: none§, move o **foco**, digita respeitando §maxlength§ e a seleção atual;
- **fireEvent** dispara um evento DOM cru (útil para eventos sem equivalente, como §scroll§ ou §resize§); para interações de pessoas use user-event. No laboratório os dois funcionaram no botão simples (§Contagem: 1§ e §Contagem: 2§), mas só o user-event garante a mesma sequência de eventos do navegador;
- com **timers falsos**, configure §userEvent.setup({ advanceTimers: vi.advanceTimersByTime })§.

### Assincronia: não use esperas fixas
Um teste que faz §await sleep(500)§ é **lento** quando sobra tempo e **instável** quando falta. Use as ferramentas que **esperam a condição**:
- **§await screen.findByText(...)§** (ou §findByRole§): espera o elemento **aparecer** (padrão **1000 ms**). Medido: um componente que mostra "pronto" após 100 ms: §queryByText§ imediatamente devolveu §null§ e §await findByText§ devolveu "pronto";
- **§await waitFor(() => expect(...))§**: repete a asserção até passar ou esgotar o tempo (§timeout§, §interval§). Medido: com §timeout: 200§ e §interval: 50§ a falha ocorreu após cerca de **200 ms** com a mensagem do erro da última tentativa ("Unable to find an element with the text: tchau...");
- **§waitForElementToBeRemoved§**: espera um elemento **sumir** (carregando…);
- regras do §waitFor§: coloque **uma** asserção (ou poucas) no callback; **não** coloque efeitos colaterais (§click§) dentro dele (rodaria várias vezes); **não** use para esperar algo que o §findBy§ resolve.

### act e o aviso "not wrapped in act"
O React agrupa atualizações; o **§act§** garante que **todas as atualizações de estado e efeitos** foram aplicadas antes de seguir. A Testing Library e o user-event **já envolvem** as ações em §act§; você usa §act§ **manualmente** ao fazer algo fora delas (avançar timers falsos, chamar uma função que atualiza estado). Se aparecer o aviso "an update to X inside a test was not wrapped in act(...)", é sinal de que uma atualização ocorreu **depois** de o teste terminar de esperar: normalmente falta um §await findBy…§ ou §waitFor§ para o resultado. **Não** silencie o aviso: espere o resultado visível.

### Testando formulários
Roteiro: (1) **estado inicial** (campos vazios, botão habilitado ou não); (2) **preencher** com §type§; (3) **enviar** com §click§ no botão ou §keyboard('{Enter}')§; (4) **verificar** mensagens, chamadas do callback (§onEnviar§) e estado final. Medido no cadastro do laboratório:
§§§
e-mail inválido -> alerta "E-mail inválido" visível | onEnviar chamado 0 vezes
corrige o e-mail e envia -> onEnviar chamado 1 vez com {"nome":"Ana","email":"ana@x.com"} | alerta ausente
§§§
Cubra: obrigatórios, formatos, limites, **mensagens de erro acessíveis** (§role="alert"§, §aria-describedby§), **envio em andamento** (botão desabilitado), **erro do servidor** (aula 6) e **sucesso**. Para campos inválidos use também §toBeInvalid()§ do jest-dom.

### Teclado e foco
A navegação por teclado é parte do comportamento. Medido: três chamadas de §user.tab()§ moveram o foco na ordem **nome → e-mail → botão Enviar** (§INPUT:nome > INPUT:email > BUTTON:Enviar§), e pressionar **Enter** com o foco no botão enviou o formulário (alerta visível). Verifique: ordem lógica do foco, §toHaveFocus()§ no elemento esperado após abrir/fechar um diálogo, **Esc** que fecha, setas em listas e abas (padrões ARIA, C2.3), e que elementos interativos são alcançáveis (se o teste não consegue focá-los com §tab§, a pessoa também não consegue).

### Padrões úteis
- **Fábricas de dados** e **funções de ajuda** (§preencherCadastro(user, { nome, email })§) deixam os testes legíveis, **sem** esconder as asserções;
- **Um teste por comportamento**, mesmo que repita a preparação;
- **Evite** testar passos intermediários irrelevantes (cliques em abas só para chegar ao ponto);
- **Isolamento**: cada teste cria sua própria instância de user-event e limpa o DOM.

### Estados intermediários
Para ver "Carregando..." antes da resposta, assegure-se de que o teste **verifica o estado antes** de aguardar o próximo (medido: §getByText('Carregando...')§ presente logo após o render e a lista aparece com §findAllByRole('listitem')§). Para estados transitórios muito curtos use **timers falsos** ou controle a resolução da promessa do teste.

### Erros comuns
§await§ ausente em §user.click§ (a asserção roda antes); §waitFor§ com efeitos colaterais; §findBy§ para algo que já existe; esperas fixas; asserções fora do §waitFor§ para algo assíncrono; "corrigir" instabilidade com timeouts maiores em vez de esperar a condição certa.`,
  concepts: [
    { term: 'user-event', def: 'Biblioteca que simula interações de pessoas (clique, digitação, teclado) com a sequência de eventos do navegador.' },
    { term: 'fireEvent', def: 'Função que dispara um único evento DOM, sem as demais etapas da interação real.' },
    { term: 'findBy', def: 'Consulta assíncrona que espera o elemento aparecer.' },
    { term: 'waitFor', def: 'Função que repete uma asserção até passar ou esgotar o tempo.' },
    { term: 'act', def: 'Função do React que aplica todas as atualizações e efeitos pendentes antes de continuar.' },
    { term: 'Espera fixa', def: 'Pausa de duração arbitrária em um teste, causa de lentidão e instabilidade.' },
    { term: 'Foco', def: 'Elemento que recebe as entradas do teclado em um momento.' },
    { term: 'toHaveFocus', def: 'Matcher do jest-dom que verifica se o elemento tem o foco.' },
    { term: 'Função de ajuda de teste', def: 'Função que encapsula passos repetidos de preparação ou interação em testes.' }
  ],
  examples: R`**Analogia:** user-event é o **ator** que vive a cena inteira (chega, olha, estende a mão, pega); fireEvent é a **foto** de um único instante. O findBy é o **garçom que espera o prato sair da cozinha**, e o waitFor, o **fiscal que volta a conferir** até estar certo ou o prazo vencer. A espera fixa é "voltar daqui a cinco minutos, haja o que houver".

**Resultados medidos (user-event 14.6.13, Testing Library React 16.3.3, jsdom 31):**
§§§
Tab x3: INPUT:nome > INPUT:email > BUTTON:Enviar | Enter no botão: alerta visível = true
componente que aparece após 100 ms: queryByText = null | await findByText = "pronto"
waitFor(timeout 200, interval 50) falhando: ~200 ms e mensagem "Unable to find an element with the text: tchau..."
fluxo da lista: "Carregando..." -> findAllByRole('listitem') = Ana,Bia
§§§

**Cenário ilustrativo (não medido):** um teste usava §await new Promise(r => setTimeout(r, 1000))§ após clicar em salvar. Na CI mais lenta falhava às vezes e, no resto do tempo, perdia um segundo. Trocar por §await screen.findByText('Salvo com sucesso')§ tornou o teste mais rápido e estável.`,
  code: [
    { title: 'Formulário completo com validação, envio e teclado (executado)', lang: 'jsx', code: R`test('valida, corrige e envia o cadastro', async () => {
  const user = userEvent.setup();
  const onEnviar = vi.fn().mockResolvedValue();
  render(<Cadastro onEnviar={onEnviar} />);

  await user.type(screen.getByLabelText('Nome'), 'Ana');
  await user.type(screen.getByLabelText('E-mail'), 'invalido');
  await user.click(screen.getByRole('button', { name: 'Enviar' }));
  expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido');
  expect(onEnviar).not.toHaveBeenCalled();

  await user.clear(screen.getByLabelText('E-mail'));
  await user.type(screen.getByLabelText('E-mail'), 'ana@x.com');
  await user.keyboard('{Enter}');                                  // enviar pelo teclado
  await waitFor(() => expect(onEnviar).toHaveBeenCalledWith({ nome: 'Ana', email: 'ana@x.com' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});`, notes: [{ l: '2', t: 'Uma instância de user-event por teste, criada antes do render.' }, { l: '15', t: 'O envio é assíncrono: waitFor espera a chamada sem pausa fixa.' }] },
    { title: 'Esperar o assíncrono e testar a ordem do foco (executado)', lang: 'jsx', code: R`test('mostra a lista depois da resposta', async () => {
  render(<Usuarios />);
  expect(screen.getByText('Carregando...')).toBeInTheDocument();       // estado intermediário
  const itens = await screen.findAllByRole('listitem');                // espera, sem sleep
  expect(itens.map((i) => i.textContent)).toEqual(['Ana', 'Bia']);
});

test('o foco percorre os campos em ordem', async () => {
  const user = userEvent.setup();
  render(<Cadastro onEnviar={() => {}} />);
  await user.tab(); expect(screen.getByLabelText('Nome')).toHaveFocus();
  await user.tab(); expect(screen.getByLabelText('E-mail')).toHaveFocus();
  await user.tab(); expect(screen.getByRole('button', { name: 'Enviar' })).toHaveFocus();
});`, notes: [{ l: '4', t: 'findAllBy espera pelo menos um item (medido: Ana,Bia).' }, { l: '12', t: 'Medido: Tab percorreu nome, e-mail e botão, nessa ordem.' }] }
  ],
  bestPractices: ['Use user-event com setup e await em toda interação.', 'Espere condições (findBy, waitFor), nunca tempos fixos.', 'Coloque no waitFor apenas asserções, sem efeitos colaterais.', 'Não silencie avisos de act: espere o resultado visível.', 'Teste a ordem do foco e o uso do teclado.', 'Use funções de ajuda sem esconder as asserções.'],
  mistakes: ['Esquecer o await em user.click ou user.type.', 'Pausas fixas com setTimeout.', 'Colocar cliques dentro de waitFor.', 'Usar findBy para algo que já existe.', 'Usar fireEvent para interações de pessoas.', 'Aumentar timeouts em vez de esperar a condição correta.'],
  market: `Testes assíncronos mal escritos são a principal fonte de instabilidade nas suítes de frontend. Dominar user-event, findBy e waitFor e saber explicar o act é o que torna uma suíte confiável e aparece em quase toda conversa técnica sobre testes de UI.`,
  summary: `user-event simula interações completas (setup, await, click, type, tab, keyboard) e fireEvent só eventos isolados. Espere resultados assíncronos com findBy e waitFor (medido: findBy aguardou 100 ms; waitFor falhou em cerca de 200 ms com mensagem clara), nunca com pausas fixas. O act é aplicado automaticamente pelas ações da biblioteca; avisos de act pedem uma espera pelo resultado. Teste formulários em todos os estados e a navegação por teclado, com a ordem do foco (medido: nome, e-mail, botão).`,
  refs: [REF2.userEvent, REF2.asyncMethods, REF2.reactAct, REF2.commonMistakes],
  cards: [
    { q: 'Por que preferir user-event a fireEvent?', a: 'Porque reproduz a sequência completa de eventos do navegador (foco, teclado, ponteiro) e respeita regras como elementos desabilitados.' },
    { q: 'Quando usar findBy e quando waitFor?', a: 'findBy para esperar um elemento aparecer; waitFor para repetir uma asserção qualquer até passar.' },
    { q: 'O que fazer ao ver o aviso de update fora do act?', a: 'Esperar o resultado visível com findBy ou waitFor, em vez de silenciar o aviso.' },
    { q: 'Por que não usar esperas fixas?', a: 'São lentas quando sobra tempo e instáveis quando falta; esperar a condição é mais rápido e confiável.' }
  ]
},
{
  id: 'tfe-05', moduleId: 'm2', order: 5, minutes: 65, tags: ['provedores', 'wrapper', 'renderHook', 'roteamento', 'Context', 'hooks customizados'],
  title: 'Testing Library III: componentes com contexto, provedores, hooks customizados e roteamento',
  objectives: ['Renderizar componentes que dependem de provedores com uma função de render personalizada', 'Testar hooks customizados com renderHook e um wrapper', 'Testar componentes que usam roteamento com um roteador em memória', 'Isolar a store e o cache entre testes (Redux, Zustand, TanStack Query)', 'Decidir quando testar um hook isolado e quando testá-lo pelo componente'],
  intro: `Componentes reais raramente vivem sozinhos: precisam do **tema**, da **sessão**, do **cache de dados**, do **roteador**, da **store**. Testar um componente sem seus provedores falha (erro de contexto ausente); testar com **provedores reais** demais torna o teste lento e frágil. Esta aula mostra o padrão **"render com provedores de teste"**, o teste de **hooks customizados** (§renderHook§), o roteamento em **memória** e o **isolamento** de estado entre testes. Medimos no laboratório um hook com e sem provedor de contexto.`,
  theory: `### O problema
Um componente que usa §useContext(Tema)§, §useQuery§, §useNavigate§ ou §useSelector§ lança erro sem o provedor correspondente. A solução: envolver o componente nos provedores **na hora do render**, de preferência com **valores de teste simples** e **previsíveis**.

### A opção wrapper
§render(<Componente />, { wrapper })§ envolve o componente em um componente de provedores:
§§§
function Provedores({ children }) {
  return <Tema.Provider value="escuro"><Roteador>{children}</Roteador></Tema.Provider>;
}
render(<Painel />, { wrapper: Provedores });
§§§
Para reutilizar, crie uma **função de render personalizada** em um módulo de suporte:
§§§
// test-utils.jsx
export function renderComProvedores(ui, { tema = 'claro', rota = '/', ...opcoes } = {}) {
  return { user: userEvent.setup(), ...render(ui, { wrapper: ({ children }) => <Provedores tema={tema} rota={rota}>{children}</Provedores>, ...opcoes }) };
}
§§§
Ela devolve também o §user§ pronto, e cada teste personaliza apenas o que importa (tema, rota, dados iniciais), **deixando visível** o que o teste exige.

### Testando hooks customizados
Hooks só funcionam dentro de componentes; o §renderHook§ (da Testing Library) cria um componente de teste invisível:
§§§
const { result } = renderHook(() => useContagem(5));
result.current.n;                       // valor atual
act(() => result.current.inc());       // chamadas que atualizam estado: dentro de act
§§§
Medido no laboratório (§useContagem§ com §useState§, §useCallback§ e §useContext§):
§§§
sem provedor:  n = 5 | tema = "claro" (valor padrão do contexto)
com provedor escuro (wrapper): após inc(): n = 1 | tema = "escuro"
§§§
Boas práticas: **teste o hook isolado** quando ele é **reutilizado**, tem **lógica** própria (máquina de estados, debounce, paginação) e uma **API clara**; **teste pelo componente** quando o hook só existe para aquele componente (testar a interface visível já o cobre e é menos frágil). Use §rerender§ do §renderHook§ para mudar os argumentos; §unmount§ para verificar a limpeza de efeitos (assinaturas, temporizadores).

### Roteamento
Componentes que leem a rota ou navegam precisam de um **roteador em memória** (não usam a barra de endereço): na React Router, §createMemoryRouter(rotas, { initialEntries: ['/produtos/42'] })§ e §<RouterProvider router={...} />§; no Next.js, os hooks de navegação são **simulados** (§vi.mock('next/navigation')§ devolvendo §usePathname§, §useRouter§ com §vi.fn()§) porque o roteador real depende do servidor. O padrão geral: **renderize a rota inicial**, **interaja** (clique em um link) e **verifique o resultado visível** (a nova tela) em vez do objeto de navegação. Os desafios de código desta aula modelam um histórico em memória (§push§, §replace§, §back§, §forward§).

### Store e cache: isole entre testes
- **TanStack Query**: crie um §QueryClient§ **novo por teste** com §retry: false§ e §gcTime: Infinity§ opcional; um cliente compartilhado vaza cache de um teste para outro;
- **Redux Toolkit**: crie a store **por teste** com um estado inicial (§preloadedState§), usando a mesma função §configureStore§ da aplicação;
- **Zustand**: zere a store em §beforeEach§ com §useStore.setState(estadoInicial, true)§ (C2.4);
- **Context**: forneça o valor desejado no teste, sem depender de um provedor global.
O objetivo é que **cada teste seja independente** e rode em qualquer ordem.

### O que mockar em componentes
Mocke **fronteiras** (rede, relógio, geolocalização, §window.matchMedia§, §IntersectionObserver§ que o jsdom não implementa), **não** os seus próprios componentes filhos. Se um filho pesado (um mapa, um editor) atrapalha, mocke **só ele** e verifique a integração por contrato (as props que recebe). Evite §jest.mock§ de módulos internos amplos: dificulta refatorar.

### Páginas e Server Components (Next.js)
Server Components assíncronos não são renderizados diretamente pelo Testing Library (que renderiza no cliente). Estratégias (C2.5): testar a **lógica** em funções puras e na camada de dados; testar **Client Components** com a Testing Library; cobrir o **fluxo completo** da página com **E2E** (aula 7). Server Actions são funções: teste-as diretamente com §FormData§ e uma sessão simulada.

### Quando algo é difícil de testar
Dificuldade de teste costuma indicar **acoplamento**: um componente que chama a rede, lê o relógio e formata dados tudo junto. Separe: um **hook ou função** para a lógica, um **componente de apresentação** que recebe dados por props, e uma **casca** que conecta. Cada parte fica fácil de testar.

### Pegadinhas
Provedor com valor criado a cada render (re-renders desnecessários); esquecer o wrapper em §rerender§; compartilhar um §QueryClient§ entre testes; testar o roteador em vez da tela; mocks globais que vazam (restaure); usar §act§ manual quando uma ação da biblioteca já o envolve.`,
  concepts: [
    { term: 'wrapper', def: 'Opção do render que envolve o componente em provedores de contexto.' },
    { term: 'Render personalizado', def: 'Função de suporte que renderiza com os provedores padrão de teste.' },
    { term: 'renderHook', def: 'Função que executa um hook dentro de um componente de teste e expõe seu resultado.' },
    { term: 'Roteador em memória', def: 'Roteador que guarda o histórico na memória, usado em testes.' },
    { term: 'preloadedState', def: 'Estado inicial passado à store do Redux em um teste.' },
    { term: 'Isolamento de teste', def: 'Garantia de que cada teste cria e descarta o próprio estado, sem vazar para os outros.' },
    { term: 'Teste de hook isolado', def: 'Teste de um hook sem um componente de interface específico.' },
    { term: 'Fronteira mockada', def: 'Dependência externa (rede, relógio, APIs do navegador) substituída por um dublê.' }
  ],
  examples: R`**Analogia:** testar um componente com provedores é montar uma **maquete de cenário**: o ator (componente) precisa de luz, som e cenário (contexto, rota, dados). Você monta só o necessário, **com peças simples e previsíveis**, e desmonta tudo ao final para o próximo ator não tropeçar nos objetos do anterior.

**Resultados medidos (Testing Library React 16.3.3, React 19.3.1):**
§§§
renderHook sem provedor:  n = 5 | tema = claro
renderHook com wrapper (Tema escuro), após inc(): n = 1 | tema = escuro
§§§
O teste de roteamento com React Router e o isolamento de QueryClient, Redux e Zustand foram descritos conforme a documentação e a C2.4: não foram executados neste laboratório (React Router não foi instalado).

**Cenário ilustrativo (não medido):** testes de um painel compartilhavam um §QueryClient§ de módulo; um teste de erro deixava o cache sujo e outro, mais adiante, passava ou falhava conforme a ordem. Criar o cliente dentro da função de render personalizada (um por teste, §retry: false§) eliminou a dependência da ordem.`,
  code: [
    { title: 'Render personalizado com provedores de teste', lang: 'jsx', code: R`// test-utils.jsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tema } from './tema';

export function renderComProvedores(ui, { tema = 'claro', ...opcoes } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });   // novo por teste
  const wrapper = ({ children }) => <QueryClientProvider client={client}><Tema.Provider value={tema}>{children}</Tema.Provider></QueryClientProvider>;
  return { user: userEvent.setup(), client, ...render(ui, { wrapper, ...opcoes }) };
}`, notes: [{ l: '8', t: 'Cliente novo e retry desligado: o erro aparece rápido e o cache não vaza entre testes.' }, { l: '10', t: 'Devolve o user pronto para o teste usar.' }] },
    { title: 'renderHook com wrapper (executado)', lang: 'jsx', code: R`test('hook usa o tema do provedor e atualiza a contagem', () => {
  const wrapper = ({ children }) => <Tema.Provider value="escuro">{children}</Tema.Provider>;
  const { result } = renderHook(() => useContagem(), { wrapper });
  act(() => result.current.inc());
  expect(result.current.n).toBe(1);          // medido
  expect(result.current.tema).toBe('escuro');
});`, notes: [{ l: '4', t: 'Chamadas que atualizam estado vão dentro de act.' }, { l: '5', t: 'Medido: n = 1 e tema = escuro.' }] }
  ],
  bestPractices: ['Use uma função de render personalizada com provedores de teste simples.', 'Crie QueryClient e store novos a cada teste.', 'Teste hooks isolados só quando reutilizáveis e com lógica própria.', 'Mocke fronteiras, não seus próprios componentes.', 'Verifique o resultado visível da navegação, não o objeto do roteador.', 'Separe lógica, apresentação e conexão para facilitar o teste.'],
  mistakes: ['Compartilhar cache ou store entre testes.', 'Testar componentes sem os provedores e "consertar" com mocks do contexto.', 'Mockar módulos internos amplos.', 'Testar o roteador em vez da tela.', 'Testar um hook usado por um só componente separadamente, duplicando cobertura.', 'Provedores reais completos (rede, banco) em testes de componente.'],
  market: `Testar componentes com contexto, dados e rotas é o dia a dia de uma suíte real. A função de render personalizada e o isolamento de estado entre testes são práticas esperadas em revisões de código e fazem a diferença entre uma suíte estável e uma dependente de ordem.`,
  summary: `Componentes dependentes de contexto são testados com a opção wrapper ou uma função de render personalizada com provedores de teste simples. renderHook testa hooks isolados (medido: valor padrão sem provedor e tema escuro com wrapper). Roteamento usa roteador em memória e verificações visíveis. Crie QueryClient e store novos por teste e zere stores globais; mocke só as fronteiras.`,
  refs: [REF2.tlWrapper, REF2.renderHook, REF2.commonMistakes, REF2.reactAct],
  cards: [
    { q: 'Para que serve a opção wrapper do render?', a: 'Envolver o componente em provedores (tema, dados, rotas) necessários para ele funcionar no teste.' },
    { q: 'Quando testar um hook com renderHook?', a: 'Quando é reutilizável, tem lógica própria e API clara; se serve a um só componente, teste pelo componente.' },
    { q: 'Por que criar um QueryClient novo por teste?', a: 'Para o cache não vazar entre testes e o resultado não depender da ordem.' },
    { q: 'Como testar navegação?', a: 'Com um roteador em memória: renderize a rota inicial, interaja e verifique o resultado visível.' }
  ]
},
{
  id: 'tfe-06', moduleId: 'm3', order: 6, minutes: 70, tags: ['MSW', 'mock de rede', 'handlers', 'cenários de erro', 'contrato'],
  title: 'MSW: simulando a rede com manipuladores, cenários de erro e reuso no navegador',
  objectives: ['Explicar por que simular a rede na fronteira (MSW) em vez de mockar fetch ou módulos', 'Configurar o servidor MSW em testes com handlers padrão e sobrescritas por teste', 'Simular sucesso, erro HTTP, falha de rede e lentidão', 'Impedir requisições não tratadas e manter os handlers alinhados ao contrato da API', 'Reusar os handlers no navegador (desenvolvimento) e em testes visuais e E2E'],
  intro: `Um componente que busca dados faz requisições HTTP. Para testá-lo, é preciso **controlar a resposta**. A opção ingênua é **mockar o §fetch§** (ou o módulo da API) no teste: rápido, mas o teste passa a depender de **como** você chama a rede (qual função, quais argumentos) e deixa de exercitar o código real de requisição, cabeçalhos e tratamento de erros. O **MSW (Mock Service Worker)** intercepta as requisições **na fronteira da rede**: o código da aplicação faz o §fetch§ de verdade e o MSW responde. Os resultados abaixo foram medidos com **MSW 3.0.7** em Node (Vitest 5.1.1).`,
  theory: `### Ideia
Em vez de substituir uma função, o MSW **simula o servidor**. O app usa §fetch('/api/usuarios')§ normalmente; um **handler** declara "para GET /api/usuarios responda este JSON". Vantagens:
- o teste é **independente da biblioteca de rede** (fetch, axios, TanStack Query): troque o cliente HTTP e os testes continuam válidos;
- exercita **de verdade** o código de requisição (URL, método, cabeçalhos, corpo, tratamento de status);
- **os mesmos handlers** servem a testes, desenvolvimento (sem backend pronto), Storybook e testes visuais/E2E;
- descreve o **contrato** da API em um único lugar.

### Configuração (Node, Vitest)
§§§
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';

export const server = setupServer(
  http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nome: 'Ana' }, { id: 2, nome: 'Bia' }]))
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
§§§
- **handlers padrão** (caminho feliz) ficam no §setupServer§; os testes de **erro** sobrescrevem com §server.use(...)§;
- **§resetHandlers§** em §afterEach§ remove as sobrescritas: um teste não afeta o outro;
- **§onUnhandledRequest: 'error'§** faz o teste **falhar** se o código chamar uma rota sem handler (evita que uma chamada real escape ou que uma rota esquecida passe despercebida); o padrão é só avisar.
Em jsdom, URLs **relativas** (§/api/usuarios§) precisam de uma base (o §location§ do jsdom, ou use URLs absolutas nos handlers e no cliente); configure conforme o ambiente.

### Cenários (medidos)
§§§
sucesso:       HttpResponse.json([...])                      -> lista Ana,Bia na tela
erro HTTP:     new HttpResponse(null, { status: 500 })       -> alerta "Falha ao carregar"
rede:          HttpResponse.error()                          -> alerta "Falha ao carregar"
lentidão:      await delay(150); return HttpResponse.json([]) -> "Carregando..." até a resposta (>= 140 ms)
§§§
Para cada tela, cubra: **sucesso**, **vazio**, **carregando**, **erro do servidor (500)**, **erro de validação (400/422)**, **não autorizado (401)**, **falha de rede**, **timeout** e, quando relevante, **paginação** e **repetição**. Handlers podem **ler a requisição** (§request.json()§, §params§, §new URL(request.url).searchParams§) e **responder conforme a entrada**, validar o corpo (como o servidor real) e **guardar estado** em uma variável do teste para simular criação e leitura.

### Verificar a requisição enviada
Para verificar **o que o app enviou**, capture no handler (§let corpo; http.post('/api/pedidos', async ({ request }) => { corpo = await request.json(); return HttpResponse.json({ id: 1 }, { status: 201 }); })§) e afirme sobre §corpo§ no teste. Assim você testa o **contrato de envio** (campos, formato) sem mockar a função de requisição.

### Boas práticas
- **Mantenha os handlers próximos do contrato real**: gerados a partir de um esquema OpenAPI ou compartilhados com um servidor de verdade; handlers que divergem do backend dão **falsa segurança**;
- **Fábricas de dados** (§criarUsuario()§) para respostas;
- **Um handler padrão por rota** e sobrescritas **pontuais** por teste;
- Não **mocke o que está testando**; use MSW para a fronteira da rede e dublês só para o resto;
- **Cuidado com cache**: com TanStack Query use um cliente novo por teste (aula 5);
- **Teste de contrato** (CDC, schemas) e **E2E** com backend de teste complementam o MSW, que **não** prova que o backend real responde assim.

### No navegador: desenvolvimento, Storybook, visual e E2E
Com §setupWorker§ e o **Service Worker** do navegador, os mesmos handlers respondem em desenvolvimento (a interface funciona sem backend) e em **Storybook** (histórias com dados e erros, base dos testes visuais da aula 7). No E2E, prefira o backend de teste para fluxos críticos e o MSW para **cenários difíceis** (falhas, lentidão). A integração com o navegador exige o arquivo do Service Worker (§mockServiceWorker.js§) e só vale para o navegador: o ambiente de testes em Node usa o servidor. **Não foi executado** neste laboratório o Service Worker no navegador (o navegador embutido não registra Service Workers).

### Armadilhas
- Esquecer §resetHandlers§ (handlers de erro vazam);
- URLs relativas sem base no jsdom;
- Respostas sem os cabeçalhos que o código lê (§content-type§);
- Teste que passa por causa do handler padrão, sem a sobrescrita funcionar;
- Handlers divergentes do contrato;
- Esperar a resposta com pausa fixa (use §findBy§/§waitFor§).

### Quando não usar o MSW
Para testar **lógica pura**, não é preciso rede; para **componentes que recebem dados por props**, passe os dados. Reserve o MSW aos componentes e fluxos que **fazem requisições**.`,
  concepts: [
    { term: 'MSW', def: 'Mock Service Worker: biblioteca que intercepta requisições HTTP e responde com dados simulados.' },
    { term: 'Handler', def: 'Regra que associa um método e um caminho a uma resposta simulada.' },
    { term: 'setupServer', def: 'Função do MSW que cria o servidor de interceptação no Node.' },
    { term: 'onUnhandledRequest', def: 'Opção que define o que fazer com requisições sem handler (avisar, ignorar ou falhar).' },
    { term: 'server.use', def: 'Sobrescrita temporária de handlers em um teste.' },
    { term: 'resetHandlers', def: 'Remove as sobrescritas e volta aos handlers padrão.' },
    { term: 'HttpResponse', def: 'Classe do MSW para construir respostas (json, erro de rede, status).' },
    { term: 'Teste de contrato', def: 'Verificação de que cliente e servidor respeitam o mesmo formato de requisições e respostas.' },
    { term: 'Service Worker', def: 'Script do navegador que intercepta requisições, usado pelo MSW no navegador.' }
  ],
  examples: R`**Analogia:** mockar o fetch é **combinar com o ator o que ele vai dizer** (o teste só confere o script); o MSW é **montar um cenário com um balcão de atendimento falso**: o ator pede como pediria de verdade, e o atendente falso responde conforme a situação (tudo certo, sem estoque, linha caída, atendimento lento).

**Resultados medidos (MSW 3.0.7, Node 26, Vitest 5.1.1):**
§§§
sucesso: "Carregando..." -> itens Ana,Bia
erro 500 (server.use): alerta "Falha ao carregar"
resposta lenta (delay 150 ms): carregamento >= 140 ms? true
erro de rede (HttpResponse.error()): alerta "Falha ao carregar"
onUnhandledRequest: 'error' e resetHandlers em afterEach: 4 testes passaram
§§§
Não foi executado o MSW no navegador (Service Worker).

**Cenário ilustrativo (não medido):** a equipe de frontend esperava o backend ficar pronto para testar a tela de pedidos. Com handlers MSW baseados no contrato combinado (e depois comparados com a API real), a tela e os testes de erro (500, 422, rede) foram feitos em paralelo; quando o backend chegou, divergências do contrato foram corrigidas nos dois lados.`,
  code: [
    { title: 'Servidor MSW com handler padrão e sobrescrita de erro (executado)', lang: 'jsx', code: R`import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';

const server = setupServer(
  http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nome: 'Ana' }, { id: 2, nome: 'Bia' }]))
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('mostra o erro quando o servidor responde 500', async () => {
  server.use(http.get('/api/usuarios', () => new HttpResponse(null, { status: 500 })));
  render(<Usuarios />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');
});`, notes: [{ l: '7', t: 'Falha se o código chamar uma rota sem handler.' }, { l: '8', t: 'Remove a sobrescrita de erro depois de cada teste.' }, { l: '12', t: 'A sobrescrita vale só neste teste (medido: alerta "Falha ao carregar").' }] },
    { title: 'Verificar o corpo enviado e simular lentidão', lang: 'jsx', code: R`test('envia o pedido com os campos esperados', async () => {
  let corpo;
  server.use(http.post('/api/pedidos', async ({ request }) => { corpo = await request.json(); await delay(100); return HttpResponse.json({ id: 7 }, { status: 201 }); }));
  const { user } = renderComProvedores(<NovoPedido />);
  await user.type(screen.getByLabelText('Cliente'), 'Ana');
  await user.click(screen.getByRole('button', { name: 'Criar pedido' }));
  expect(await screen.findByText('Pedido 7 criado')).toBeInTheDocument();
  expect(corpo).toEqual({ cliente: 'Ana' });                    // contrato de envio
});`, notes: [{ l: '3', t: 'O handler captura o corpo e responde 201 depois de 100 ms.' }, { l: '8', t: 'Verifica o que o app enviou sem mockar a função de requisição.' }] }
  ],
  bestPractices: ['Simule a rede na fronteira com MSW, não o fetch nem módulos internos.', 'Use onUnhandledRequest: error e resetHandlers em afterEach.', 'Mantenha handlers padrão para o caminho feliz e sobrescreva pontualmente os cenários de erro.', 'Cubra sucesso, vazio, carregando, 4xx, 5xx e falha de rede.', 'Alinhe os handlers ao contrato real (esquema, testes de contrato).', 'Reuse os handlers em Storybook, desenvolvimento e testes visuais.'],
  mistakes: ['Esquecer resetHandlers e vazar sobrescritas.', 'Handlers que divergem do backend real e dão falsa segurança.', 'Mockar fetch e testar só os mocks.', 'URLs relativas sem base no jsdom.', 'Esperar a resposta com pausa fixa.', 'Usar MSW para componentes que não fazem requisições.'],
  market: `Simular a rede com MSW tornou-se prática padrão em equipes de frontend maduras porque permite testar erros e lentidão de forma determinística e trabalhar sem backend pronto. Saber explicar por que isso é melhor do que mockar o fetch é pergunta comum em entrevistas.`,
  summary: `O MSW intercepta as requisições na fronteira da rede, de modo que o código real de requisição é exercitado e os testes independem do cliente HTTP. Configure o servidor com handlers padrão, onUnhandledRequest: error e resetHandlers em afterEach, e sobrescreva com server.use para erros e lentidão (medido: sucesso, 500, rede e atraso de 150 ms). Mantenha os handlers alinhados ao contrato e reuse-os no navegador, em Storybook e em testes visuais.`,
  refs: [REF2.mswIntro, REF2.mswNode, REF2.mswBrowser, REF2.mswBest],
  cards: [
    { q: 'Qual a vantagem do MSW sobre mockar o fetch?', a: 'Exercita o código real de requisição e independe do cliente HTTP; os mesmos handlers servem a testes, Storybook e desenvolvimento.' },
    { q: 'Para que servem onUnhandledRequest: error e resetHandlers?', a: 'O primeiro faz o teste falhar em rotas sem handler; o segundo remove as sobrescritas entre testes.' },
    { q: 'Como testar o que o app enviou ao servidor?', a: 'Capturar o corpo no handler e afirmar sobre ele no teste.' },
    { q: 'O MSW prova que o backend real responde assim?', a: 'Não: complemente com testes de contrato e E2E com backend de teste.' }
  ]
}
];
