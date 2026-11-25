// C2.1 — React essencial. Aulas 10 e 11 (hooks customizados e formulários avançados).
const R = String.raw;

export const REF4 = {
  customHooks: { title: 'React — Reusing Logic with Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', kind: 'doc' },
  rulesOfHooks: { title: 'React — Rules of Hooks', url: 'https://react.dev/reference/rules/rules-of-hooks', kind: 'doc' },
  eslintHooks: { title: 'React — eslint-plugin-react-hooks', url: 'https://react.dev/reference/eslint-plugin-react-hooks', kind: 'doc' },
  useSyncExternalStore: { title: 'React — useSyncExternalStore', url: 'https://react.dev/reference/react/useSyncExternalStore', kind: 'doc' },
  useActionState: { title: 'React — useActionState', url: 'https://react.dev/reference/react/useActionState', kind: 'doc' },
  useFormStatus: { title: 'React DOM — useFormStatus', url: 'https://react.dev/reference/react-dom/hooks/useFormStatus', kind: 'doc' },
  useId: { title: 'React — useId', url: 'https://react.dev/reference/react/useId', kind: 'doc' },
  zod: { title: 'Zod — documentação', url: 'https://zod.dev/', kind: 'doc' },
  waiForms: { title: 'W3C WAI — Forms Tutorial', url: 'https://www.w3.org/WAI/tutorials/forms/', kind: 'doc' },
  waiErrors: { title: 'W3C WAI — Form Validation and error messages', url: 'https://www.w3.org/WAI/tutorials/forms/validation/', kind: 'doc' },
  mdnAriaInvalid: { title: 'MDN — aria-invalid', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid', kind: 'doc' },
  rtlHooks: { title: 'Testing Library — renderHook', url: 'https://testing-library.com/docs/react-testing-library/api/#renderhook', kind: 'doc' }
};

export const lessonsD = [
{
  id: 'rea-10', moduleId: 'm4', order: 10, minutes: 60, tags: ['hooks customizados', 'regras dos hooks', 'useLocalStorage', 'useDebounce', 'reuso'],
  title: 'Hooks customizados: extrair lógica reutilizável e as regras dos hooks',
  objectives: ['Explicar as regras dos hooks e por que existem (ordem estável de chamadas)', 'Extrair lógica com estado e efeitos para um hook customizado e nomeá-lo com §use§', 'Implementar §useLocalStorage§ e §useDebounce§ com tratamento de erros e limpeza', 'Entender que cada chamada de um hook tem estado próprio (hooks compartilham lógica, não estado)', 'Testar hooks com §renderHook§ e temporizadores simulados'],
  intro: `Um **hook customizado** é uma função cujo nome começa com **§use§** e que chama outros hooks. É o mecanismo de **reuso de lógica com estado**: onde antes se usavam classes, mixins ou render props, hoje se extrai um hook. A ideia é simples; o cuidado está nas **regras dos hooks** (por que não se pode chamá-los dentro de §if§) e em não confundir **compartilhar lógica** com **compartilhar estado**. Os hooks desta aula (§useLocalStorage§, §useDebounce§) foram **executados e testados** com React 19.3 e Testing Library.`,
  theory: `### Regras dos hooks
1. **Chame hooks apenas no nível superior** do componente ou de outro hook: **nunca** dentro de §if§, laços, funções aninhadas, manipuladores de evento, §try/catch§ ou depois de um §return§ condicional;
2. **Chame hooks apenas em componentes de função ou hooks customizados** (não em funções comuns);
3. **O nome do hook começa com §use§** (permite ao linter e às ferramentas aplicarem as regras).
**Por quê:** o React identifica cada hook pela **ordem** em que é chamado em cada renderização (a "n-ésima chamada de §useState§" corresponde ao n-ésimo estado). Se a ordem muda de uma renderização para a outra (por causa de um §if§), os estados ficam **trocados**. Use o plugin **§eslint-plugin-react-hooks§**: ele aponta violações e dependências faltando.

### Extraindo um hook
Sinais de que vale extrair: o mesmo conjunto de §useState§ + §useEffect§ aparece em vários componentes; um componente mistura "o que mostrar" com "como sincronizar"; você quer **nomear** um conceito (§useOnline§, §useDebounce§). O hook devolve o que o componente precisa (valor, funções, objeto):
§§§tsx
function useLocalStorage<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try { const bruto = localStorage.getItem(chave); return bruto === null ? inicial : (JSON.parse(bruto) as T); }
    catch { return inicial; }                       // JSON inválido ou storage bloqueado
  });
  useEffect(() => {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* cota ou modo privado */ }
  }, [chave, valor]);
  return [valor, setValor] as const;
}
§§§
Resultados do teste: sem nada gravado, o valor inicial foi §claro§ e o storage passou a conter §"claro"§; depois de §set('escuro')§, o storage tinha §"escuro"§; ao **remontar** o hook, ele leu §escuro§; com um valor **corrompido** (§{ruim§) no storage, o hook usou o **padrão**.
Pontos de cuidado: a **inicialização preguiçosa** (função em §useState§) lê o storage **uma vez**; **trate erros** de JSON e do acesso ao storage; em **renderização no servidor** o §localStorage§ não existe (a leitura deve ficar em efeito ou em hook seguro para SSR; no Next.js, aula do C2.5); para **sincronizar entre abas**, ouça o evento §storage§ ou use §useSyncExternalStore§.

### useDebounce
Adia a atualização de um valor até o usuário **parar** de mudá-lo (busca enquanto digita):
§§§tsx
function useDebounce<T>(valor: T, ms: number) {
  const [d, setD] = useState(valor);
  useEffect(() => { const t = setTimeout(() => setD(valor), ms); return () => clearTimeout(t); }, [valor, ms]);
  return d;
}
§§§
Medido com temporizadores simulados: o valor passou de §a§ para §ab§ e §abc§ rapidamente; aos **299 ms** o valor debounced ainda era §a§ e aos **300 ms** passou a §abc§. O **cleanup** cancela o temporizador anterior: é isso que faz o "debounce".

### Hooks compartilham lógica, não estado
Cada **chamada** de um hook customizado cria **estado independente**: dois componentes que chamam §useLocalStorage('tema')§ têm duas variáveis de estado separadas (sincronizadas apenas pelo storage, ao remontar). Para **estado compartilhado ao vivo**, use Context ou uma biblioteca de estado.

### Boas práticas de design
- **Um hook, uma responsabilidade**: §useOnline§, §useDebounce§, §useMediaQuery§; evite "hooks-deus";
- **API estável e simples**: devolva tuplas para pares valor/setter (§as const§) e objetos para muitos campos;
- **Nomes que descrevem o propósito**, não o ciclo de vida (evite §useMount§);
- **Aceite argumentos reativos** (a chave, o atraso) e declare-os nas dependências;
- **Trate os efeitos colaterais** com cleanup (conexões, temporizadores, ouvintes);
- **Hooks de dados** (buscas, cache): use uma biblioteca em vez de reinventar (TanStack Query, SWR);
- **Compatibilidade com SSR**: evite acessar §window§ e §document§ durante a renderização.

### Testando hooks
§renderHook§ (Testing Library) renderiza o hook em um componente de teste e devolve §result.current§; §act§ envolve atualizações; §vi.useFakeTimers()§ controla o tempo. Também se testa o hook **por meio de um componente** que o usa, que é mais próximo do uso real.

### Exemplos úteis de hooks pequenos
§useOnline§ (assina §online§/§offline§ com §useSyncExternalStore§), §useMediaQuery§, §useEventListener§, §usePrevious§ (guarda o valor anterior em uma ref atualizada em efeito), §useToggle§, §useInterval§.`,
  concepts: [
    { term: 'Hook customizado', def: 'Função cujo nome começa com use e que chama outros hooks para reutilizar lógica com estado.' },
    { term: 'Regras dos hooks', def: 'Chamar hooks só no nível superior e só em componentes de função ou outros hooks.' },
    { term: 'Ordem dos hooks', def: 'Sequência de chamadas que o React usa para associar cada hook ao seu estado.' },
    { term: 'eslint-plugin-react-hooks', def: 'Plugin do ESLint que verifica as regras dos hooks e as dependências dos efeitos.' },
    { term: 'Debounce', def: 'Técnica que adia uma ação até que cesse uma sequência de eventos por um intervalo.' },
    { term: 'Inicialização preguiçosa', def: 'Função passada ao useState para calcular o valor inicial uma única vez.' },
    { term: 'renderHook', def: 'Função do Testing Library que renderiza um hook isoladamente para testes.' },
    { term: 'useSyncExternalStore', def: 'Hook para assinar fontes externas de dados de forma segura com a renderização concorrente.' },
    { term: 'Estado por chamada', def: 'Cada chamada de um hook customizado tem seu próprio estado; hooks não compartilham estado.' }
  ],
  examples: R`**Analogia:** um hook customizado é uma **ferramenta elétrica com bateria própria**: dois carpinteiros usam o mesmo modelo de furadeira (a **lógica** é a mesma), mas cada um tem **sua** bateria (o **estado** é de cada um). E as regras dos hooks são a **ordem de montagem de uma linha de produção**: se uma etapa é pulada em algumas peças, os componentes são encaixados nos lugares errados.

**Resultados medidos (React 19.3, Testing Library):**
§§§
useLocalStorage -> inicial: claro | gravado: "claro"
após set('escuro')  -> escuro    | gravado: "escuro"
remontado lê do storage: escuro
JSON inválido -> padrão: padrão
useDebounce -> antes: a | 299 ms: a | 300 ms: abc
§§§

**Caso real:** quatro telas tinham sua própria cópia do código "ler/gravar preferência no localStorage", cada uma tratando erros de um jeito (duas travavam em modo privado). Extraída para §useLocalStorage§ com tratamento de erros e testes, as quatro passaram a se comportar igual; uma correção em um só lugar resolveu o problema nos quatro.`,
  code: [
    { title: 'useLocalStorage e useDebounce (executados e testados com React 19.3)', lang: 'tsx', code: R`import { useState, useEffect } from 'react';

export function useLocalStorage<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const bruto = localStorage.getItem(chave);
      return bruto === null ? inicial : (JSON.parse(bruto) as T);
    } catch {
      return inicial;                                  // JSON inválido ou storage bloqueado
    }
  });
  useEffect(() => {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* cota excedida ou modo privado */ }
  }, [chave, valor]);
  return [valor, setValor] as const;
}

export function useDebounce<T>(valor: T, ms: number) {
  const [d, setD] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setD(valor), ms);
    return () => clearTimeout(t);                      // o cleanup cancela o temporizador anterior
  }, [valor, ms]);
  return d;
}`, notes: [{ l: '4', t: 'A função inicial roda só na primeira renderização.' }, { l: '12', t: 'O efeito sincroniza o valor com o storage; o try evita quebrar quando não há acesso.' }, { l: '18', t: 'Cada chamada de useDebounce tem seu próprio estado e temporizador.' }, { l: '22', t: 'Sem o cleanup não haveria debounce: cada mudança dispararia um set.' }] },
    { title: 'Testando os hooks com renderHook e temporizadores simulados (executado)', lang: 'tsx', code: R`import { renderHook, act } from '@testing-library/react';

test('useLocalStorage', () => {
  localStorage.clear();
  const { result, unmount } = renderHook(() => useLocalStorage('tema', 'claro'));
  expect(result.current[0]).toBe('claro');
  act(() => result.current[1]('escuro'));
  expect(localStorage.getItem('tema')).toBe('"escuro"');
  unmount();
  const outro = renderHook(() => useLocalStorage('tema', 'claro'));
  expect(outro.result.current[0]).toBe('escuro');          // remontado lê do storage
});

test('useDebounce', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });
  rerender({ v: 'ab' }); rerender({ v: 'abc' });
  act(() => { vi.advanceTimersByTime(299); });
  expect(result.current).toBe('a');
  act(() => { vi.advanceTimersByTime(1); });
  expect(result.current).toBe('abc');
  vi.useRealTimers();
});`, notes: [{ l: '6', t: 'renderHook devolve result.current com o valor atual do hook.' }, { l: '8', t: 'act garante que as atualizações e efeitos sejam aplicados antes da asserção.' }, { l: '17', t: 'Temporizadores simulados (Vitest) avançam o tempo sem esperar.' }] }
  ],
  bestPractices: ['Extraia um hook quando a mesma lógica com estado se repete ou precisa de um nome.', 'Siga as regras dos hooks e mantenha o plugin do ESLint ativo.', 'Faça hooks pequenos, com uma responsabilidade e API simples.', 'Trate erros, limpe efeitos e declare dependências corretamente.', 'Evite acessar §window§ durante a renderização para suportar renderização no servidor.', 'Teste hooks com §renderHook§ e cubra erros e limpeza.'],
  mistakes: ['Chamar hooks dentro de §if§, laços ou manipuladores de evento.', 'Achar que hooks customizados compartilham estado entre componentes.', 'Criar hooks gigantes que fazem de tudo.', 'Esquecer o cleanup de temporizadores e ouvintes.', 'Ler o storage no corpo do componente a cada renderização.', 'Reimplementar à mão buscas de dados em vez de usar uma biblioteca.'],
  market: `Hooks customizados são a unidade de reuso dos projetos React modernos e aparecem em testes práticos ("escreva um useDebounce/useFetch/useLocalStorage"). Bibliotecas inteiras (TanStack Query, React Hook Form, Zustand) são, no fundo, coleções de hooks bem projetados.`,
  summary: `Hooks só podem ser chamados no nível superior de componentes e hooks, porque o React os associa pela ordem das chamadas. Um hook customizado (nome com §use§) extrai lógica com estado e efeitos; cada chamada tem seu próprio estado. Projete hooks pequenos, trate erros, limpe efeitos, evite acesso a APIs do navegador na renderização e teste com §renderHook§.`,
  refs: [REF4.customHooks, REF4.rulesOfHooks, REF4.eslintHooks, REF4.useSyncExternalStore, REF4.rtlHooks],
  cards: [
    { q: 'Por que não se pode chamar hooks dentro de um if?', a: 'O React associa estados pela ordem das chamadas; se a ordem muda entre renderizações, os estados ficam trocados.' },
    { q: 'Dois componentes que usam o mesmo hook customizado compartilham estado?', a: 'Não: cada chamada cria estado independente; o hook compartilha lógica.' },
    { q: 'Como o useDebounce consegue adiar a atualização?', a: 'O cleanup do efeito cancela o temporizador anterior; só o último valor chega ao set após o intervalo.' },
    { q: 'Como testar um hook isoladamente?', a: 'Com renderHook do Testing Library, usando act para atualizações e temporizadores simulados.' }
  ]
},
{
  id: 'rea-11', moduleId: 'm4', order: 11, minutes: 70, tags: ['formulários', 'validação', 'zod', 'acessibilidade', 'useActionState'],
  title: 'Formulários avançados: validação por esquema, acessibilidade e ações do React 19',
  objectives: ['Validar dados com um esquema (Zod), coerção de tipos e mensagens de erro por campo', 'Construir formulários acessíveis (rótulos, §aria-invalid§, §aria-describedby§, §role="alert"§, foco)', 'Usar §useActionState§ e o atributo §action§ do §<form>§ do React 19 e entender estados pendentes', 'Combinar validação no cliente com validação no servidor, sem confiar apenas no cliente', 'Decidir quando adotar uma biblioteca de formulários (React Hook Form, TanStack Form)'],
  intro: `Um formulário sério precisa de quatro coisas além de campos: **validação confiável**, **mensagens de erro compreensíveis e acessíveis**, **estado de envio** (pendente, sucesso, falha) e **validação no servidor**, que é a que realmente protege o sistema. Esta aula fecha o módulo juntando o que você viu: estado, eventos, §useId§, hooks e, no **React 19**, as **ações de formulário** (§<form action={fn}>§ e §useActionState§). Todos os exemplos foram executados com React 19.3, Zod 4.6 e Testing Library.`,
  theory: `### Validação por esquema
Em vez de espalhar §if§ por todo manipulador, descreva a **forma válida dos dados** em um **esquema** (Zod, Valibot, Yup), que **valida, converte e tipa**:
§§§tsx
const Esquema = z.object({
  nome: z.string().trim().min(2, 'Informe ao menos 2 letras'),
  email: z.string().email('E-mail inválido'),
  idade: z.coerce.number().int().min(18, 'Maior de 18 anos')
});
type Cadastro = z.infer<typeof Esquema>;     // o tipo TypeScript vem do esquema
§§§
No teste, a entrada §{ nome: ' Ana ', email: 'a@b.co', idade: '20' }§ foi aceita e **transformada**: §{"nome":"Ana","email":"a@b.co","idade":20}§ (espaços aparados e a idade convertida de texto para número). Com §{ nome: 'A', email: 'x', idade: '7' }§, o resultado trouxe **três erros**, um por campo: §nome: Informe ao menos 2 letras§, §email: E-mail inválido§, §idade: Maior de 18 anos§. **§safeParse§** devolve o resultado sem lançar exceção (§success§ ou §error.issues§). **Os dados de formulário chegam sempre como texto**, por isso a coerção. O **mesmo esquema** deve ser usado no **servidor** (aula de Server Actions).

### Mensagens de erro acessíveis
Para que **leitores de tela** e **teclado** funcionem:
1. Todo campo tem um **rótulo** associado (§<label htmlFor={id}>§). Gere ids com **§useId§** (estáveis entre servidor e cliente);
2. Marque o campo inválido com **§aria-invalid="true"§** e ligue a mensagem com **§aria-describedby§** (id da mensagem);
3. A mensagem aparece perto do campo e é anunciada: **§role="alert"§** (ou §aria-live="polite"§);
4. Ao enviar com erros, **mova o foco** para o primeiro campo inválido ou para um resumo de erros;
5. **Não dependa só da cor** (use texto e ícone) e dê instruções antes (formato esperado, requisitos);
6. Use os tipos e atributos nativos: §type="email"§, §required§, §autoComplete§, §inputMode§. A validação nativa pode ficar ligada ou ser desligada com §noValidate§ para controlar as mensagens.
No teste: após enviar vazio, o campo Nome ficou com §aria-invalid=true§, o §aria-describedby§ **apontava para o alerta**, e o alerta mostrava "Informe ao menos 2 letras". Depois de corrigir os campos e reenviar, o alerta sumiu e apareceu "Enviado!".

### Ações de formulário no React 19
No React 19, o atributo **§action§** do §<form>§ aceita uma **função** (síncrona ou assíncrona) que recebe o **§FormData§**; o React a executa dentro de uma **transição** e **reseta** os campos não controlados após o sucesso. O hook **§useActionState(acao, estadoInicial)§** devolve **§[estado, formAction, pendente]§**: o **estado** é o último resultado da ação; §formAction§ vai no §action§; §pendente§ indica envio em andamento (para desabilitar o botão):
§§§tsx
async function acao(anterior: Estado, dados: FormData): Promise<Estado> {
  const r = Esquema.safeParse(Object.fromEntries(dados));
  if (!r.success) return { mensagem: 'Corrija os campos', erros: /* por campo */ };
  return { mensagem: 'Cadastrado: ' + r.data.nome };
}
const [estado, formAction, pendente] = useActionState(acao, { mensagem: '' });
// <form action={formAction}> ... <button disabled={pendente}>Salvar</button>
§§§
No teste, o clique em Salvar resultou em **"Cadastrado: Bia"**. **§useFormStatus§** (de §react-dom§) permite que um componente **filho** do formulário leia o estado de envio sem receber props (botões de envio reutilizáveis). Em frameworks como o Next.js, a ação pode ser uma **Server Action** (executa no servidor), o que habilita **melhoria progressiva** (o formulário funciona antes de o JavaScript carregar); veremos no curso do Next.js.

### Cliente e servidor: validar nos dois
A validação no cliente melhora a **experiência**; a do servidor garante a **segurança** (qualquer pessoa pode contornar o navegador e enviar dados arbitrários). **Nunca confie** em campos "desabilitados", em §maxLength§ ou em valores "ocultos". Use o **mesmo esquema** nos dois lados e devolva erros **por campo**. Cuidado também com **CSRF** (tokens ou cookies §SameSite§), **limitação de taxa** e **mensagens genéricas** em autenticação ("e-mail ou senha incorretos").

### Quando validar: momento e UX
- **No envio**: simples e sem ruído (ponto de partida);
- **Ao sair do campo** (§onBlur§): bom equilíbrio;
- **Enquanto digita**: só para ajudas (força da senha, contador de caracteres) ou depois que o campo já foi tocado e está inválido ("validar cedo, parabenizar rápido");
- **Cuidado com erros agressivos**: mostrar "e-mail inválido" na primeira letra irrita.

### Bibliotecas de formulário
**React Hook Form** (campos não controlados, poucas re-renderizações, integra com esquemas por resolvers), **TanStack Form** e **Formik** (mais antigo). Vale adotar quando há **muitos campos, campos dinâmicos (arrays), dependências entre campos** e a necessidade de desempenho. Para formulários pequenos, o §FormData§ + esquema + §useActionState§ bastam. Entender o que elas fazem (por baixo) é o objetivo deste módulo.

### Casos especiais
**Arquivos** (§type="file"§: sempre não controlado, validar tipo e tamanho no servidor), **máscaras** (CPF, telefone: controlado e com cuidado com o cursor), **autocompletar** (§autoComplete§) e **gerenciadores de senha**, **campos dependentes** (estado ou valor derivado), **desfazer envio duplo** (desabilite o botão ou use §pendente§).`,
  concepts: [
    { term: 'Esquema de validação', def: 'Descrição declarativa da forma válida dos dados, que valida, converte e gera tipos (por exemplo, Zod).' },
    { term: 'Coerção', def: 'Conversão automática de valores (texto para número, por exemplo) antes de validar.' },
    { term: 'aria-invalid', def: 'Atributo que indica que o valor do campo é inválido.' },
    { term: 'aria-describedby', def: 'Atributo que liga o campo ao elemento com sua descrição ou mensagem de erro.' },
    { term: 'role="alert"', def: 'Papel ARIA que faz leitores de tela anunciarem a mensagem imediatamente.' },
    { term: 'useId', def: 'Hook que gera identificadores únicos e estáveis entre servidor e cliente.' },
    { term: 'Ação de formulário', def: 'Função passada ao atributo action do form (React 19) que recebe o FormData.' },
    { term: 'useActionState', def: 'Hook que devolve o resultado da última ação, a função para o action e o estado pendente.' },
    { term: 'useFormStatus', def: 'Hook que informa a componentes dentro do form se há envio pendente.' },
    { term: 'Server Action', def: 'Função executada no servidor, chamada a partir de um formulário em frameworks como o Next.js.' },
    { term: 'Melhoria progressiva', def: 'Estratégia em que a funcionalidade básica funciona sem JavaScript e é aprimorada quando ele carrega.' }
  ],
  examples: R`**Analogia:** o esquema é o **porteiro com uma lista**: confere cada visitante (campo), corrige o que é só aparência (apara espaços, converte "20" em 20) e, se algo não confere, entrega uma **nota por campo** explicando o motivo. A validação no servidor é o **segundo porteiro**, na porta do cofre: o primeiro (no navegador) é uma cortesia; o segundo é a **segurança de verdade**.

**Resultados medidos (React 19.3, Zod 4.6, Testing Library):**
§§§
ok:    {"nome":"Ana","email":"a@b.co","idade":20}
erros: ["nome: Informe ao menos 2 letras","email: E-mail inválido","idade: Maior de 18 anos"]
aria-invalid: true | descrito pelo alerta: true | alerta: Informe ao menos 2 letras
após corrigir: alerta removido, "Enviado!"
useActionState: Cadastrado: Bia
§§§

**Caso real:** um formulário de cadastro validava só no navegador. Um usuário (ou um script) enviou direto à API uma idade negativa e um e-mail com 5 mil caracteres, o que gerou erros no banco. A correção foi o **mesmo esquema** rodando no servidor, com mensagens por campo; a experiência do navegador não mudou. Em outro caso, o botão "Enviar" não era desabilitado durante o envio e pedidos duplicados eram criados: o estado §pendente§ e uma **chave de idempotência** resolveram.`,
  code: [
    { title: 'Esquema, erros por campo e formulário acessível (executado com React 19.3, Zod e Testing Library)', lang: 'tsx', code: R`const Esquema = z.object({
  nome: z.string().trim().min(2, 'Informe ao menos 2 letras'),
  email: z.string().email('E-mail inválido'),
  idade: z.coerce.number().int().min(18, 'Maior de 18 anos')
});

function Formulario() {
  const [erros, setErros] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);
  const idNome = useId();
  return (
    <form noValidate onSubmit={(e) => {
      e.preventDefault();
      const r = Esquema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
      if (r.success) { setErros({}); setOk(true); }
      else { setOk(false); setErros(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))); }
    }}>
      <label htmlFor={idNome}>Nome</label>
      <input id={idNome} name="nome" aria-invalid={!!erros.nome} aria-describedby={erros.nome ? idNome + '-erro' : undefined} />
      {erros.nome && <p id={idNome + '-erro'} role="alert">{erros.nome}</p>}
      <input name="email" aria-label="E-mail" />
      <input name="idade" aria-label="Idade" />
      <button>Enviar</button>
      {ok && <output>Enviado!</output>}
    </form>
  );
}`, notes: [{ l: '10', t: 'useId gera um identificador estável para ligar rótulo, campo e mensagem.' }, { l: '12', t: 'noValidate desliga a validação nativa para o app controlar as mensagens.' }, { l: '14', t: 'safeParse não lança exceção: devolve success ou a lista de problemas.' }, { l: '19', t: 'aria-invalid e aria-describedby ligam o campo à mensagem; o role="alert" a anuncia.' }] },
    { title: 'Ação de formulário com useActionState (executado com React 19.3)', lang: 'tsx', code: R`type Estado = { mensagem: string; erros?: Record<string, string> };

async function acao(_anterior: Estado, dados: FormData): Promise<Estado> {
  const r = Esquema.safeParse(Object.fromEntries(dados));
  if (!r.success) {
    return { mensagem: 'Corrija os campos', erros: Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  return { mensagem: 'Cadastrado: ' + r.data.nome };      // aqui entraria a chamada ao servidor
}

function ComAcao() {
  const [estado, formAction, pendente] = useActionState(acao, { mensagem: '' });
  return (
    <form action={formAction}>
      <input name="nome" aria-label="n" defaultValue="Bia" />
      <input name="email" aria-label="e" defaultValue="b@c.de" />
      <input name="idade" aria-label="i" defaultValue="19" />
      <button disabled={pendente}>Salvar</button>
      <p role="status">{estado.mensagem}</p>
    </form>
  );
}
// Clicar em Salvar -> "Cadastrado: Bia"`, notes: [{ l: '3', t: 'A ação recebe o estado anterior e o FormData; devolve o novo estado.' }, { l: '9', t: 'Em produção, a validação precisa rodar também no servidor.' }, { l: '12', t: 'pendente permite desabilitar o botão durante o envio.' }, { l: '14', t: 'action aceita a função devolvida por useActionState.' }, { l: '23', t: 'role="status" anuncia a mensagem de forma discreta.' }] }
  ],
  bestPractices: ['Valide com esquema e use o mesmo esquema no cliente e no servidor.', 'Associe rótulos, §aria-invalid§, §aria-describedby§ e §role="alert"§ e gerencie o foco após erros.', 'Use §useActionState§ e §pendente§ para estados de envio e evite envios duplicados.', 'Mostre erros por campo, claros e sem culpar o usuário.', 'Use tipos, §autoComplete§ e §inputMode§ nativos.', 'Adote React Hook Form ou TanStack Form quando o formulário for grande ou dinâmico.'],
  mistakes: ['Validar só no navegador.', 'Mostrar erros só por cor, sem texto nem associação com o campo.', 'Esquecer a coerção de tipos (todo valor do §FormData§ é texto).', 'Não desabilitar o envio durante o processamento.', 'Mensagens genéricas ou agressivas ("Erro!") em cada tecla.', 'Reinventar uma biblioteca de formulários completa à mão.'],
  market: `Formulários, validação e acessibilidade são requisitos de qualquer produto web e de legislação de acessibilidade (WCAG, lei brasileira de inclusão). Conhecer esquemas de validação, ações de formulário do React 19 e segurança no servidor é um diferencial para vagas de front-end e full stack.`,
  summary: `Valide com esquema (Zod): ele converte, aponta erros por campo e gera tipos; repita a validação no servidor. Formulários acessíveis têm rótulos, §aria-invalid§, §aria-describedby§, §role="alert"§ e foco gerenciado. No React 19, §<form action>§ + §useActionState§ trazem estado da ação, mensagens e pendente; §useFormStatus§ lê o envio nos filhos. Para formulários grandes, use uma biblioteca.`,
  refs: [REF4.useActionState, REF4.useFormStatus, REF4.useId, REF4.zod, REF4.waiForms, REF4.waiErrors, REF4.mdnAriaInvalid],
  cards: [
    { q: 'Por que o esquema usa coerção em formulários?', a: 'Todo valor do FormData chega como texto; a coerção converte (por exemplo, "20" em 20) antes de validar.' },
    { q: 'Quais atributos ligam um campo inválido à sua mensagem?', a: 'aria-invalid no campo e aria-describedby apontando para o id da mensagem (com role="alert").' },
    { q: 'O que useActionState devolve?', a: 'O estado da última ação, a função para o atributo action do formulário e um indicador de envio pendente.' },
    { q: 'Por que validar também no servidor?', a: 'O cliente pode ser contornado; só a validação no servidor protege o sistema.' }
  ]
}
];
