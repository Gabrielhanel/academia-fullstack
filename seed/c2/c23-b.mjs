// C2.3 — React avançado. Aulas 3 e 4 (componentes compostos; render props, headless, controlados e não controlados).
const R = String.raw;

export const REF2 = {
  passingProps: { title: 'React — Passing Props to a Component (children)', url: 'https://react.dev/learn/passing-props-to-a-component', kind: 'doc' },
  context: { title: 'React — Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context', kind: 'doc' },
  children: { title: 'React — Children (referência e alternativas)', url: 'https://react.dev/reference/react/Children', kind: 'doc' },
  cloneElement: { title: 'React — cloneElement (referência e alternativas)', url: 'https://react.dev/reference/react/cloneElement', kind: 'doc' },
  apgTabs: { title: 'W3C APG — Tabs Pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/', kind: 'doc' },
  apgCombobox: { title: 'W3C APG — Combobox Pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/', kind: 'doc' },
  apgAccordion: { title: 'W3C APG — Accordion Pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/', kind: 'doc' },
  radixComposition: { title: 'Radix Primitives — Composition (asChild)', url: 'https://www.radix-ui.com/primitives/docs/guides/composition', kind: 'doc' },
  radixIntro: { title: 'Radix Primitives — Introdução', url: 'https://www.radix-ui.com/primitives/docs/overview/introduction', kind: 'doc' },
  reactAria: { title: 'React Aria — documentação', url: 'https://react-spectrum.adobe.com/react-aria/index.html', kind: 'doc' },
  input: { title: 'React DOM — <input> (controlado e não controlado)', url: 'https://react.dev/reference/react-dom/components/input', kind: 'doc' },
  extractingLogic: { title: 'React — Extracting State Logic into a Reducer', url: 'https://react.dev/learn/extracting-state-logic-into-a-reducer', kind: 'doc' },
  tsGenerics: { title: 'TypeScript Handbook — Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'rav-03', moduleId: 'm2', order: 3, minutes: 70, tags: ['componentes compostos', 'compound components', 'contexto', 'acessibilidade', 'tabs'],
  title: 'Componentes compostos: children, slots, contexto interno e acessibilidade (Tabs)',
  objectives: ['Explicar o padrão de componentes compostos (§<Tabs>§, §<Tabs.List>§, §<Tabs.Tab>§, §<Tabs.Panel>§) e as vantagens sobre uma API de props de configuração', 'Implementar o estado compartilhado entre as partes com contexto interno e hooks que lançam erro fora do componente pai', 'Mostrar por que §Children.map§ e §cloneElement§ são frágeis e quando o contexto os substitui', 'Gerar ids e relações ARIA (§aria-controls§, §aria-labelledby§) e seguir o padrão de teclado de Tabs', 'Projetar a API pública, tipos e documentação de um componente composto'],
  intro: `Um componente com 15 props de configuração (§tabs={[...]}§, §renderTab={...}§, §panelClassName§...) é difícil de usar e de estender. A alternativa, muito usada em bibliotecas como Radix, React Aria e Reach UI, é o **componente composto**: um **conjunto de partes que trabalham juntas** e compartilham estado de forma implícita. Quem usa escreve a **estrutura** que quer (§<Tabs><Tabs.List>...§), e o componente cuida do **comportamento e da acessibilidade**. Esta aula implementa um §Tabs§ completo, **executado** com React 19.3 e Testing Library, e compara com a abordagem frágil de §Children.map§ + §cloneElement§.`,
  theory: `### A ideia
Em vez de uma API **configurável por dados**:
§§§tsx
<Tabs tabs={[{ id: 'a', titulo: 'A', conteudo: <Painel /> }, ...]} aoTrocar={...} />
§§§
oferecemos **partes componíveis**:
§§§tsx
<Tabs defaultValue="a">
  <Tabs.List>
    <Tabs.Tab value="a">A</Tabs.Tab>
    <Tabs.Tab value="b">B</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="a">painel A</Tabs.Panel>
  <Tabs.Panel value="b">painel B</Tabs.Panel>
</Tabs>
§§§
Vantagens: **flexibilidade de layout** (colocar a lista em outro lugar, envolver partes em §<div>§, adicionar ícones), **menos props** no componente raiz, **inversão de controle** (quem usa decide o conteúdo) e **API legível**. Custos: mais partes para documentar, e o risco de uso incorreto (usar §Tabs.Tab§ fora de §Tabs§), mitigado com erros claros.

### Estado compartilhado por contexto interno
O componente raiz guarda o estado e o **fornece por contexto** às partes, que o consomem com um **hook de uso interno**:
§§§tsx
const TabsCtx = createContext<{ ativo: string; setAtivo: (v: string) => void; base: string } | null>(null);
const useTabs = () => { const c = useContext(TabsCtx); if (!c) throw new Error('Tabs.* fora de <Tabs>'); return c; };

function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [ativo, setAtivo] = useState(defaultValue);
  const base = useId();                                   // ids únicos e estáveis
  return <TabsCtx value={{ ativo, setAtivo, base }}>{children}</TabsCtx>;
}
§§§
O hook lança uma mensagem clara quando falta o pai; no teste, §<Tabs.Tab>§ solto produziu §Tabs.* fora de <Tabs>§. As partes ficam como **propriedades estáticas** (§Tabs.List = ...§) ou como **exports separados** (§TabsList§, §TabsTab§), que facilitam o *tree-shaking*.
Pontos de atenção: o valor do contexto deve ser **estável** (§useMemo§) quando houver muitos consumidores (C2.1, aula 9); e **evite estado de contexto volátil** (digitação) em componentes compostos grandes.

### Por que não Children.map e cloneElement
A abordagem antiga injetava props nos filhos: §Children.map(children, (c, i) => cloneElement(c, { ativo: i === atual }))§. É **frágil**: só funciona para filhos **diretos** e do tipo esperado. Medido: ao envolver um item em um §<div>§ (ou em um fragmento, um componente intermediário, ou renderizar condicionalmente), o React passou as props §ativo§ e §aoClicar§ para o **§<div>§** (com avisos de atributos desconhecidos) e o item **não** recebeu nada: o botão continuou com §aria-pressed=false§. Com **contexto**, a tab dentro de um §<div>§ funcionou: clicar em "B" mostrou o §painel B§. A documentação do React lista §Children§ e §cloneElement§ como **alternativas desaconselhadas**. Use-os só em casos muito controlados.

### Acessibilidade: o padrão ARIA de Tabs
Segundo o **ARIA Authoring Practices Guide**:
- contêiner §role="tablist"§; cada aba §role="tab"§ com §aria-selected§ e §aria-controls§ (id do painel); cada painel §role="tabpanel"§ com §aria-labelledby§ (id da aba);
- **tabulação**: só a aba **selecionada** entra na sequência de Tab (§tabIndex=0§; as demais §-1§); o painel pode ser focável se não tiver conteúdo focável;
- **teclado**: setas esquerda e direita movem o foco entre as abas (e **circulam** nas pontas); §Home§ e §End§ vão à primeira e à última; a ativação pode ser **automática** (foco ativa) ou **manual** (Enter/Espaço);
- rótulo acessível para a lista (§aria-label§) quando necessário.
No teste, o estado selecionado foi §A=false B=true§ após o clique e o painel ficou rotulado pela aba (§aria-labelledby§ apontando para o id da aba, gerado com §useId§). Os ids vêm de **§useId§** (estáveis entre servidor e cliente, ao contrário de contadores globais).

### Projeto da API
- **Nomes e papéis**: raiz (estado), lista, item e painel; um **valor** (§value§) liga aba e painel;
- **Controlado e não controlado** (aula 4): §value§/§onValueChange§ **e** §defaultValue§;
- **Parâmetros pelo contexto**, não pelas props de cada parte: orientação, ativação (automática ou manual), direção do idioma;
- **Composição com o DOM**: aceitar §className§ e §...resto§ em cada parte; permitir trocar o elemento (§as§ ou §asChild§, aula 4);
- **Erros claros** quando o uso estiver incorreto (valor sem painel correspondente, em desenvolvimento);
- **Tipos** para todas as partes, com os mesmos nomes de §value§;
- **Documentação** com exemplo mínimo, exemplo com ícones, controlado e teclado.

### Desafios do padrão
- **Estado de painéis**: renderizar só o painel ativo (como no exemplo) **desmonta** os outros e perde seu estado; ofereça uma opção para manter os painéis montados e ocultos (§forceMount§ em Radix) ou use a solução de ocultação do React (aula 2);
- **Tabs dinâmicas** (adicionar e remover): precisam de §key§ estável e gestão do valor ativo quando a aba atual some;
- **Associação por ordem**: componentes que registram filhos por ordem (Menu, Accordion, listas de seleção) usam **registro por contexto** (cada item se registra com um id e o pai mantém a lista); evite depender da posição.
- **Servidor**: ids com §useId§ e ausência de acesso a §window§ no render.

### Outros componentes compostos
**Accordion** (itens com §Trigger§ e §Content§), **Select/Combobox** (§Trigger§, §Content§, §Item§), **Menu**, **Dialog** (§Trigger§, §Content§, §Title§), **Card** (§Header§, §Body§, §Footer§), **Form** (§Field§, §Label§, §Error§). Em todos o padrão se repete: **raiz com estado + contexto + partes**.

### Composição x configuração: quando usar cada um
**Configuração por dados** (§<Tabela colunas={...} dados={...} />§) é boa quando a estrutura é **uniforme** e gerada; **composição** é melhor quando o **layout e o conteúdo variam**. Muitos componentes oferecem as duas: a versão composta como base e uma versão configurável construída **em cima** dela.`,
  concepts: [
    { term: 'Componente composto', def: 'Conjunto de componentes que compartilham estado implícito e formam uma API por composição (Tabs, Tabs.List, Tabs.Tab).' },
    { term: 'Contexto interno', def: 'Contexto usado só entre as partes de um componente composto para compartilhar estado e ids.' },
    { term: 'Slot', def: 'Ponto de composição em que quem usa o componente fornece o conteúdo.' },
    { term: 'role="tablist" / "tab" / "tabpanel"', def: 'Papéis ARIA do padrão de abas.' },
    { term: 'Roving tabindex', def: 'Técnica em que só um item do grupo tem tabIndex=0 e as setas movem o foco entre eles.' },
    { term: 'useId', def: 'Hook que gera ids únicos e estáveis entre servidor e cliente.' },
    { term: 'forceMount', def: 'Opção (como em Radix) para manter o conteúdo montado mesmo quando oculto.' },
    { term: 'Inversão de controle', def: 'Quem usa o componente decide a estrutura e o conteúdo; o componente fornece o comportamento.' },
    { term: 'Registro por contexto', def: 'Padrão em que cada item se registra no pai para que este conheça a lista sem depender da ordem dos filhos.' }
  ],
  examples: R`**Analogia:** um componente composto é um **kit de montar estante**: as peças (prateleira, lateral, gaveta) se encaixam por um **conector invisível** (o contexto), e quem monta decide a disposição. A API por configuração é a **estante pronta**: boa se o modelo servir, mas cada necessidade nova exige outro modelo. A abordagem §cloneElement§ é a **fita colada nas peças**: funciona só quando elas estão nas posições esperadas.

**Resultados medidos (React 19.3, Testing Library):**
§§§
tab B embrulhada em <div> (contexto):      clique mostra "painel B"
selecionada:                               A=false B=true
painel rotulado pela aba (aria-labelledby): true
<Tabs.Tab> fora de <Tabs>:                 erro "Tabs.* fora de <Tabs>"
Children.map + cloneElement, item dentro de <div>:  aria-pressed = false  (as props foram para o div; avisos de atributos)
§§§

**Caso real:** uma biblioteca interna tinha §<Tabs items={...} />§ e, em um ano, recebeu 11 props novas (ícone, contador, desabilitar, tooltip...). Reescrita como componente composto (Tabs, Tabs.List, Tabs.Tab, Tabs.Panel), os casos novos viraram **composição** (colocar um ícone ou um selo dentro de §Tabs.Tab§); as props caíram para 4 e a acessibilidade foi centralizada em um só lugar.`,
  code: [
    { title: 'Tabs composto com contexto interno e relações ARIA (executado com React 19.3)', lang: 'tsx', code: R`import { createContext, useContext, useId, useState, type ReactNode } from 'react';

type Ctx = { ativo: string; setAtivo: (v: string) => void; base: string };
const TabsCtx = createContext<Ctx | null>(null);
const useTabs = () => {
  const c = useContext(TabsCtx);
  if (!c) throw new Error('Tabs.* fora de <Tabs>');
  return c;
};

export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [ativo, setAtivo] = useState(defaultValue);
  const base = useId();
  return <TabsCtx value={{ ativo, setAtivo, base }}>{children}</TabsCtx>;
}
Tabs.List = function List({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
};
Tabs.Tab = function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { ativo, setAtivo, base } = useTabs();
  const sel = ativo === value;
  return (
    <button role="tab" id={base + '-t-' + value} aria-selected={sel} aria-controls={base + '-p-' + value}
            tabIndex={sel ? 0 : -1} onClick={() => setAtivo(value)}>{children}</button>
  );
};
Tabs.Panel = function Panel({ value, children }: { value: string; children: ReactNode }) {
  const { ativo, base } = useTabs();
  return ativo === value ? <div role="tabpanel" id={base + '-p-' + value} aria-labelledby={base + '-t-' + value}>{children}</div> : null;
};`, notes: [{ l: '6', t: 'O hook lança um erro claro quando as partes são usadas fora do pai.' }, { l: '13', t: 'useId gera a base dos ids que ligam aba e painel.' }, { l: '24', t: 'Só a aba selecionada entra na tabulação (roving tabindex); falta ainda o teclado de setas.' }, { l: '31', t: 'O painel inativo é desmontado e perde o estado; ofereça uma opção de manter montado.' }, { l: '1', t: 'Este exemplo não implementa as setas, Home e End do padrão ARIA; o exercício e o projeto da aula completam.' }] },
    { title: 'A abordagem frágil com Children.map e cloneElement (executado: falha com item embrulhado)', lang: 'tsx', code: R`function TabsFragil({ children }: { children: ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div>
      {Children.map(children, (c, idx) =>
        isValidElement(c) ? cloneElement(c as any, { ativo: idx === i, aoClicar: () => setI(idx) }) : c
      )}
    </div>
  );
}
const Item = ({ ativo, aoClicar, children }: any) => <button aria-pressed={!!ativo} onClick={aoClicar}>{children}</button>;

// <TabsFragil><Item>1</Item><div><Item>2</Item></div></TabsFragil>
// clicar em 2 -> aria-pressed = false : as props foram injetadas no <div>, não no Item`, notes: [{ l: '5', t: 'Só os filhos diretos recebem as props injetadas.' }, { l: '12', t: 'Resultado observado no teste; o React também avisou sobre atributos desconhecidos no div.' }, { l: '1', t: 'A documentação do React desaconselha Children e cloneElement e recomenda contexto ou composição.' }] }
  ],
  bestPractices: ['Prefira partes componíveis com contexto interno a props de configuração em excesso.', 'Lance erros claros quando as partes forem usadas fora do componente pai.', 'Use §useId§ e siga o padrão ARIA (papéis, §aria-controls§, §aria-labelledby§, teclado).', 'Ofereça uso controlado e não controlado e um jeito de manter painéis montados.', 'Aceite §className§ e o restante das props nativas em cada parte.', 'Evite §Children.map§ e §cloneElement§ para injetar props.'],
  mistakes: ['Injetar props nos filhos com §cloneElement§ e quebrar quando algo envolve o filho.', 'Esquecer o estado dos painéis desmontados.', 'Ignorar o teclado do padrão ARIA (setas, Home e End).', 'Gerar ids com contadores globais e quebrar a hidratação.', 'Contexto com valor novo a cada render e muitos consumidores.', 'Depender da posição dos filhos para registrar itens.'],
  market: `Componentes compostos são o formato de quase toda biblioteca de componentes moderna (Radix, React Aria, shadcn/ui, Headless UI) e aparecem em testes práticos ("implemente Tabs/Accordion reutilizáveis"). Saber combinar contexto, composição e acessibilidade é característica de pessoas de nível pleno e sênior em design systems.`,
  summary: `Componentes compostos oferecem partes (§Tabs§, §Tabs.List§, §Tabs.Tab§, §Tabs.Panel§) que compartilham estado por um contexto interno, com hooks que lançam erro fora do pai e ids de §useId§. Superam §Children.map§ e §cloneElement§, que falham quando os filhos são embrulhados. A API deve seguir o padrão ARIA, aceitar uso controlado e não controlado, repassar props e documentar casos como manter painéis montados.`,
  refs: [REF2.passingProps, REF2.context, REF2.children, REF2.cloneElement, REF2.apgTabs, REF2.radixIntro],
  cards: [
    { q: 'Qual a vantagem de um componente composto sobre props de configuração?', a: 'Flexibilidade de estrutura e de conteúdo, menos props na raiz e uma API legível, com o comportamento e a acessibilidade centralizados.' },
    { q: 'Por que cloneElement falha com itens embrulhados em um div?', a: 'Ele injeta props apenas nos filhos diretos; o item embrulhado não as recebe (e o div recebe atributos desconhecidos).' },
    { q: 'Como as partes de um componente composto compartilham estado?', a: 'Por um contexto interno fornecido pela raiz e consumido por um hook que lança erro se a raiz estiver ausente.' },
    { q: 'O que é roving tabindex?', a: 'Só o item ativo do grupo tem tabIndex=0 e as setas movem o foco, de modo que o grupo entra uma única vez na sequência de Tab.' }
  ]
},
{
  id: 'rav-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['render props', 'headless', 'controlado', 'state reducer', 'polimorfismo'],
  title: 'Render props, componentes headless, controlados e não controlados, state reducer e polimorfismo (as)',
  objectives: ['Implementar um hook §useControllableState§ e usar o contrato controlado e não controlado (§value§, §defaultValue§, §onChange§)', 'Aplicar render props e componentes headless para separar comportamento de aparência', 'Usar o padrão state reducer para permitir que quem usa personalize as transições de estado', 'Construir componentes polimórficos tipados (§as§) e conhecer o §asChild§ da Radix', 'Decidir entre hooks, render props e componentes compostos em cada caso'],
  intro: `Em design systems, o mesmo **comportamento** (abrir/fechar, selecionar, navegar por teclado) precisa servir a **aparências** muito diferentes. Os padrões desta aula resolvem esse problema de formas complementares: o **contrato controlado × não controlado** (quem é dono do estado?), as **render props** e os **componentes headless** (lógica sem visual), o **state reducer** (personalizar transições) e o **polimorfismo** (§as§: trocar o elemento renderizado). Todos foram **executados** (React 19.3, Testing Library, renderização no servidor).`,
  theory: `### Controlado e não controlado
Um componente de interface com estado (disclosure, tabs, seleção, campo) deve aceitar os **dois modos**, como o §<input>§ nativo:
- **não controlado**: o componente guarda o estado; você dá só o valor inicial (§defaultOpen§) e escuta mudanças (§onOpenChange§);
- **controlado**: quem usa guarda o estado e o passa por §open§ + §onOpenChange§; o componente **só reflete** e **pede** mudanças.
A decisão de modo é o **valor ser definido ou não** (§open !== undefined§). Um hook reutilizável:
§§§tsx
function useControllableState<T>({ value, defaultValue, onChange }: { value?: T; defaultValue: T; onChange?: (v: T) => void }) {
  const [interno, setInterno] = useState(defaultValue);
  const controlado = value !== undefined;
  const atual = controlado ? (value as T) : interno;
  const definir = useCallback((proximo: T) => {
    if (!controlado) setInterno(proximo);   // não controlado: atualiza o próprio estado
    onChange?.(proximo);                     // sempre avisa
  }, [controlado, onChange]);
  return [atual, definir] as const;
}
§§§
Medido: no modo não controlado, o clique abriu o painel (§aberto§). No controlado, o pai recebeu §onChange§ três vezes (§[true,false,true]§), **aceitou** as duas primeiras e **recusou** a terceira, e o componente continuou mostrando §false§ (o valor do pai): **o pai pode vetar mudanças**, algo impossível no modo não controlado. Regras: **não mude de modo** durante a vida do componente (o React avisa nos inputs); documente os dois modos; chame §onChange§ **em ambos**.

### Render props
Uma **render prop** é uma prop (muitas vezes §children§) que é uma **função** que devolve JSX: o componente fornece **dados e comportamento**, quem usa decide a **aparência**:
§§§tsx
<Disclosure>{({ aberto, alternar }) => (<><button onClick={alternar}>{aberto ? 'Fechar' : 'Abrir'}</button>{aberto && <p>Conteúdo</p>}</>)}</Disclosure>
§§§
Antes dos hooks, era o principal meio de reuso de lógica; **hoje, um hook** (§useDisclosure§) costuma ser mais simples. As render props continuam úteis quando o componente **precisa controlar onde** a parte renderizada aparece (listas virtualizadas, portais, itens de menu) e quando se quer **inversão de controle** sem hooks. Cuidado: uma função criada a cada render (comum) não afeta a correção, mas pode **impedir §memo§** do filho.

### Componentes headless
Um componente (ou hook) **headless** implementa **comportamento e acessibilidade** (estado, teclado, foco, ARIA) e **não impõe visual**. Variações: **hooks** (§useCombobox§, §useTabs§: devolvem **prop getters**, funções que entregam as props certas para cada elemento: §getTriggerProps()§), **componentes sem estilo** (Radix Primitives, Headless UI) e **render props**. Vantagens: a **mesma lógica** serve a vários designs, e a acessibilidade (a parte mais difícil) fica em **um** lugar testado. É a base de design systems com Tailwind (C2.2): comportamento headless + estilos próprios.
Um **prop getter** típico junta props do componente com as do consumidor:
§§§tsx
const getTriggerProps = (extra = {}) => ({ 'aria-expanded': aberto, 'aria-controls': id, ...extra, onClick: (e) => { extra.onClick?.(e); alternar(); } });
§§§
Combine os **manipuladores** (o do consumidor roda **antes**, e pode ser cancelado com §preventDefault§) em vez de simplesmente sobrescrever.

### State reducer
O padrão **state reducer** deixa quem usa **interceptar** as transições de estado do hook ou componente: o hook usa um **reducer padrão** e aceita um **reducer opcional** que recebe o **estado atual e a ação** e devolve o **próximo estado**; assim o consumidor pode **bloquear ou alterar** mudanças sem forkar o código. Medido: um §useToggle§ com um reducer personalizado que **impede fechar** (§alternar§ quando aberto devolve o estado atual) terminou em §true§ depois de dois cliques em "alternar". Use quando os consumidores pedirem "não deixe fechar se...", "limite a N itens" etc. É mais **poderoso e mais difícil** que callbacks (§onChange§); prefira callbacks para casos simples.

### Polimorfismo: a prop as
Muitos componentes precisam ser **renderizados como outro elemento** (um §Botao§ que é um §<a>§, um §Texto§ que é §h1§ ou §p§, um §Link§ do roteador):
§§§tsx
type PropsComo<C extends ElementType> = { as?: C; children?: ReactNode } & Omit<ComponentPropsWithoutRef<C>, 'as' | 'children'>;
function Caixa<C extends ElementType = 'div'>({ as, children, ...resto }: PropsComo<C>) {
  const Comp: ElementType = as ?? 'div';
  return <Comp {...resto}>{children}</Comp>;
}
§§§
Resultados (renderização no servidor): §<Caixa>a</Caixa>§ → §<div>a</div>§; §<Caixa as="a" href="/x">§ → §<a href="/x">b</a>§; §<Caixa as="button" type="submit" disabled>§ → §<button type="submit" disabled="">c</button>§; com um **componente** (§as={Link}§ e §to="/p"§) → §<a href="/p" data-router="true">d</a>§. O tipo genérico faz o **TypeScript exigir as props do elemento escolhido** (§href§ só em §a§). **Limitações:** tipagem complexa, mensagens de erro difíceis, custo de compilação em grandes bibliotecas e problemas de ref e de variantes de estilo. **Alternativa:** §asChild§ (Radix) — o componente **não renderiza elemento próprio** e **fornece suas props ao filho** (§<Botao asChild><a href="/x">...</a></Botao>§), usando um utilitário §Slot§. Comporta-se bem com roteadores e evita a tipagem polimórfica, ao custo de exigir **um único filho** e a mesclagem de props e refs.
**Semântica:** escolher o elemento certo importa (acessibilidade): um §<div role="button">§ exige mais trabalho que um §<button>§; o polimorfismo não deve virar desculpa para usar elementos inadequados.

### Escolhendo o padrão
| Necessidade | Padrão |
|---|---|
| Reusar lógica com estado entre componentes | **hook** (e prop getters) |
| Dar ao consumidor controle sobre o estado | **controlado/não controlado** |
| Personalizar a aparência de partes repetidas ou renderizadas pelo componente | **render prop** |
| Estrutura flexível com partes que se coordenam | **componentes compostos** (aula 3) |
| Permitir alterar as transições de estado | **state reducer** |
| Trocar o elemento ou o componente renderizado | **as** ou **asChild** |
Comece pelo **mais simples** (um hook e props) e adote os padrões mais sofisticados quando a necessidade aparecer, não antes.`,
  concepts: [
    { term: 'Componente controlado', def: 'Componente cujo estado pertence a quem o usa (value e onChange).' },
    { term: 'Componente não controlado', def: 'Componente que guarda seu próprio estado e aceita só o valor inicial (defaultValue).' },
    { term: 'Render prop', def: 'Prop (geralmente children) que é uma função devolvendo JSX, com dados e comportamento do componente.' },
    { term: 'Componente headless', def: 'Componente ou hook que implementa comportamento e acessibilidade sem impor visual.' },
    { term: 'Prop getter', def: 'Função de um hook headless que devolve as props corretas (ARIA, eventos) para um elemento.' },
    { term: 'State reducer', def: 'Padrão em que o consumidor fornece um reducer que intercepta as transições de estado do componente.' },
    { term: 'Polimorfismo (as)', def: 'Técnica que permite escolher o elemento ou componente renderizado, com tipos que seguem a escolha.' },
    { term: 'asChild', def: 'Padrão da Radix em que o componente entrega suas props ao único filho em vez de renderizar um elemento próprio.' },
    { term: 'useControllableState', def: 'Hook que unifica os modos controlado e não controlado de um valor de estado.' }
  ],
  examples: R`**Analogia:** o componente **headless** é o **motor e o painel de instrumentos de um carro**: comportamento e segurança prontos; a **carroceria** (visual) é sua. O contrato controlado × não controlado é "**quem dirige**": o próprio carro (não controlado) ou você pelo volante (controlado), com o direito de **recusar** uma manobra. O **state reducer** é o **regulador de velocidade**: você não troca o motor, só define limites às transições.

**Resultados medidos (React 19.3):**
§§§
não controlado, um clique:          aberto
controlado: onChange recebeu [true,false,true]; o pai aceitou 2 e recusou a 3ª -> exibido: false
state reducer que impede fechar, 2 cliques em "alternar":  true
<Caixa>a</Caixa>                      -> <div>a</div>
<Caixa as="a" href="/x">b</Caixa>     -> <a href="/x">b</a>
<Caixa as="button" type="submit" disabled>c</Caixa>  -> <button type="submit" disabled="">c</button>
<Caixa as={Link} to="/p">d</Caixa>    -> <a href="/p" data-router="true">d</a>
§§§

**Caso real:** a biblioteca de componentes de uma empresa só aceitava §<Botao href>§ para links; o roteador do app exigia seu próprio §<Link>§ para navegação sem recarregar. Com a prop §as§ (e, depois, §asChild§), o mesmo §Botao§ passou a ser renderizado como §<Link>§ do roteador, sem duplicar o componente nem perder o visual.`,
  code: [
    { title: 'useControllableState e Disclosure com render prop (executado com React 19.3)', lang: 'tsx', code: R`import { useCallback, useState, type ReactNode } from 'react';

function useControllableState<T>({ value, defaultValue, onChange }: { value?: T; defaultValue: T; onChange?: (v: T) => void }) {
  const [interno, setInterno] = useState(defaultValue);
  const controlado = value !== undefined;
  const atual = controlado ? (value as T) : interno;
  const definir = useCallback((proximo: T) => {
    if (!controlado) setInterno(proximo);
    onChange?.(proximo);
  }, [controlado, onChange]);
  return [atual, definir] as const;
}

export function Disclosure({ open, defaultOpen = false, onOpenChange, children }: {
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (o: boolean) => void;
  children: (p: { aberto: boolean; alternar: () => void }) => ReactNode;
}) {
  const [aberto, setAberto] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  return <>{children({ aberto, alternar: () => setAberto(!aberto) })}</>;
}
// <Disclosure>{({ aberto, alternar }) => <button onClick={alternar}>{aberto ? 'Fechar' : 'Abrir'}</button>}</Disclosure>`, notes: [{ l: '5', t: 'O modo é decidido por value estar definido.' }, { l: '8', t: 'No modo controlado o componente apenas avisa: o pai decide se aceita.' }, { l: '19', t: 'A render prop devolve o JSX; o componente fornece só estado e ação.' }] },
    { title: 'State reducer e componente polimórfico (executado)', lang: 'tsx', code: R`type Acao = { tipo: 'alternar' } | { tipo: 'abrir' } | { tipo: 'fechar' };
const reducerPadrao = (e: boolean, a: Acao) => (a.tipo === 'alternar' ? !e : a.tipo === 'abrir');

function useToggle(reducer = reducerPadrao) {
  const [aberto, dispatch] = useReducer(reducer, false);
  return { aberto, alternar: () => dispatch({ tipo: 'alternar' }) };
}
// consumidor: impede fechar depois de aberto
const travado = (e: boolean, a: Acao) => (a.tipo === 'alternar' && e ? e : reducerPadrao(e, a));
// useToggle(travado): dois cliques em "alternar" -> true

type PropsComo<C extends ElementType> = { as?: C; children?: ReactNode } & Omit<ComponentPropsWithoutRef<C>, 'as' | 'children'>;
function Caixa<C extends ElementType = 'div'>({ as, children, ...resto }: PropsComo<C>) {
  const Comp: ElementType = as ?? 'div';
  return <Comp {...resto}>{children}</Comp>;
}
// <Caixa as="a" href="/x">b</Caixa>  ->  <a href="/x">b</a>   (href só é aceito quando as="a")`, notes: [{ l: '1', t: 'O reducer padrão pode ser substituído por quem usa o hook.' }, { l: '9', t: 'O consumidor intercepta a ação e devolve o estado atual para impedir o fechamento.' }, { l: '12', t: 'O tipo genérico C faz o TypeScript exigir as props do elemento escolhido.' }] }
  ],
  bestPractices: ['Aceite os modos controlado e não controlado, com §value§, §defaultValue§ e §onChange§ em ambos.', 'Prefira hooks a render props para reutilizar lógica; use render props quando precisar controlar onde a parte aparece.', 'Em componentes headless, mescle manipuladores e props do consumidor em vez de sobrescrever.', 'Ofereça state reducer apenas quando callbacks não bastarem.', 'Use §as§ ou §asChild§ com cuidado e preserve a semântica do elemento.', 'Comece simples (hook e props) e adote os padrões sofisticados conforme a necessidade.'],
  mistakes: ['Trocar de controlado para não controlado durante a vida do componente.', 'Esquecer de chamar §onChange§ no modo não controlado.', 'Sobrescrever §onClick§ do consumidor em vez de combiná-lo.', 'Tipagem polimórfica complexa sem necessidade.', 'Usar §as="div"§ com §role="button"§ no lugar de um §<button>§.', 'Adotar render props e state reducer em tudo, tornando a API difícil de entender.'],
  market: `Os padrões desta aula estão na base de bibliotecas como Radix, React Aria, Headless UI e TanStack (Table, Form), e de qualquer design system sério. Em entrevistas e revisões, a pergunta "como tornar esse componente controlável e personalizável sem duplicar código?" separa quem só consome bibliotecas de quem as projeta.`,
  summary: `Componentes de interface devem suportar os modos controlado (value e onChange) e não controlado (defaultValue), unificados por um hook como §useControllableState§. Render props e componentes headless separam comportamento de aparência (prop getters, mesclando manipuladores). O state reducer permite personalizar transições. §as§ torna o elemento renderizado polimórfico (com tipos genéricos), e §asChild§ entrega as props ao filho. Escolha o padrão mais simples que resolve o problema.`,
  refs: [REF2.input, REF2.extractingLogic, REF2.radixComposition, REF2.reactAria, REF2.tsGenerics, REF2.apgCombobox, REF2.apgAccordion],
  cards: [
    { q: 'Como saber se um componente está em modo controlado?', a: 'Quando a prop value (ou open) é definida; o componente apenas reflete o valor e pede mudanças por onChange.' },
    { q: 'O que o state reducer permite?', a: 'Que o consumidor intercepte as ações do estado e devolva o próximo estado, bloqueando ou alterando transições sem forkar o componente.' },
    { q: 'O que é um componente headless?', a: 'Um componente ou hook que implementa comportamento e acessibilidade sem estilos, deixando o visual para quem o usa.' },
    { q: 'Qual a diferença entre as e asChild?', a: 'as troca o elemento ou componente que o componente renderiza; asChild faz o componente entregar suas props ao filho único em vez de renderizar um elemento próprio.' }
  ]
}
];
