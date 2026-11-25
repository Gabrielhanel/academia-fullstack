// Curso 5 — TypeScript: fundamentos e recursos avançados. Aulas 1 a 4.
// Nos exemplos de TypeScript, "// ❌" marca uma linha que o compilador rejeita (verificado com tsc --strict).
const R = String.raw;

export const REF = {
  scratch: { title: 'TypeScript Handbook — TypeScript for the Absolute Beginner / The Basics', url: 'https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html', kind: 'doc' },
  everyday: { title: 'TypeScript Handbook — Everyday Types', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html', kind: 'doc' },
  narrowing: { title: 'TypeScript Handbook — Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html', kind: 'doc' },
  functions: { title: 'TypeScript Handbook — More on Functions', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html', kind: 'doc' },
  objects: { title: 'TypeScript Handbook — Object Types', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html', kind: 'doc' },
  classes: { title: 'TypeScript Handbook — Classes', url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html', kind: 'doc' },
  generics: { title: 'TypeScript Handbook — Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', kind: 'doc' },
  utility: { title: 'TypeScript Handbook — Utility Types', url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html', kind: 'doc' },
  mapped: { title: 'TypeScript Handbook — Mapped Types', url: 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html', kind: 'doc' },
  conditional: { title: 'TypeScript Handbook — Conditional Types', url: 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html', kind: 'doc' },
  indexed: { title: 'TypeScript Handbook — Indexed Access Types', url: 'https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html', kind: 'doc' },
  modules: { title: 'TypeScript Handbook — Modules', url: 'https://www.typescriptlang.org/docs/handbook/2/modules.html', kind: 'doc' },
  tsconfig: { title: 'TypeScript — TSConfig Reference', url: 'https://www.typescriptlang.org/tsconfig/', kind: 'doc' },
  satisfies: { title: 'TypeScript 4.9 — o operador satisfies (release notes)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'ts-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['typescript', 'tipos', 'inferencia', 'strict'],
  title: 'O que é TypeScript e os tipos básicos',
  objectives: ['Explicar que TypeScript verifica tipos antes de rodar e que os tipos somem na compilação', 'Usar tipos primitivos, arrays, tuplas e funções tipadas', 'Deixar o compilador inferir tipos e anotar só onde é necessário', 'Escolher unknown em vez de any e tratar null e undefined com segurança'],
  intro: `JavaScript descobre seus erros de tipo quando o código roda, muitas vezes na tela de um usuário. TypeScript antecipa essa descoberta: o compilador lê o código, aponta os erros no editor e só depois gera JavaScript comum. Esta aula mostra como esse sistema funciona e onde ele deixa de ajudar.`,
  theory: `### O que é TypeScript
TypeScript é um superconjunto de JavaScript: todo JavaScript válido é TypeScript válido, e a linguagem acrescenta **regras sobre como cada valor pode ser usado**. O compilador confere essas regras e depois **apaga os tipos**. O resultado é JavaScript puro, sem nenhuma informação de tipo. Segundo o Handbook, o TypeScript nunca muda o comportamento do código em execução.
Consequência prática: **tipos não existem em runtime**. Você não pode fazer §if (x instanceof Usuario)§ com uma interface, nem esperar que o TypeScript valide o JSON que chegou de uma API.

### Tipos primitivos e arrays
Use §string§, §number§ e §boolean§ (minúsculos). Não existe §int§ nem §float§: todo número é §number§. Também existem §bigint§, §symbol§, §null§ e §undefined§.
Arrays: §number[]§ e §Array<number>§ são equivalentes. **Tuplas** descrevem arrays de tamanho e tipos fixos por posição: §[string, number]§.

### Inferência: anote menos
O compilador deduz o tipo pelo valor inicial. §let nome = 'Ana'§ já é §string§. O Handbook recomenda usar menos anotações do que você imagina. Anote onde a inferência não alcança: **parâmetros de funções**, valores iniciais vazios (§const itens: string[] = []§) e fronteiras públicas de módulos.
Com §const§, o tipo é o valor literal: §const n = 30§ tem tipo §30§. Com §let§, o tipo é alargado para §number§.

### Funções
Anote os parâmetros e, quando útil, o retorno: §function somar(a: number, b: number): number§. Parâmetro opcional usa §?§ e vira §T | undefined§ dentro da função. Em callbacks como §[1,2].map(n => n * 2)§, o tipo de §n§ vem do contexto (*contextual typing*).

### any versus unknown
§any§ desliga a verificação: qualquer operação é aceita e o erro aparece só em runtime. §unknown§ também aceita qualquer valor, mas **não permite fazer nada com ele** até você estreitar o tipo (com §typeof§, §Array.isArray§ e outros testes). Para dados de fora do programa, use §unknown§. A opção §noImplicitAny§ transforma os casos em que o compilador cairia em §any§ em erro.

### null, undefined e strictNullChecks
Com §strictNullChecks§ ligado, §null§ e §undefined§ têm tipo próprio e você precisa tratá-los antes de usar o valor. Desligada, qualquer variável aceita os dois, e o erro clássico "cannot read properties of undefined" volta. O operador §!§ (non-null assertion) remove §null§ e §undefined§ **sem verificar**; use só quando tiver certeza.

### Modo strict
No §tsconfig.json§, §"strict": true§ liga uma família de verificações, entre elas §noImplicitAny§, §strictNullChecks§, §strictFunctionTypes§, §strictPropertyInitialization§ e §useUnknownInCatchVariables§. Comece projetos novos sempre com strict.

### O limite: o compilador confia nas suas anotações
§JSON.parse§ devolve §any§. Escrever §JSON.parse(texto) as Usuario§ não valida nada: apenas **afirma** ao compilador que o valor tem aquele formato. Se o JSON vier diferente, o erro aparece depois, longe da origem. A defesa é validar na fronteira, como você fará no desafio desta aula.`,
  concepts: [
    { term: 'Superconjunto', def: 'TypeScript aceita todo JavaScript e acrescenta tipos; o código gerado é JavaScript comum.' },
    { term: 'Apagamento de tipos', def: 'Depois da checagem, o compilador remove as anotações; em runtime não há informação de tipo.' },
    { term: 'Inferência de tipos', def: 'O compilador deduz o tipo de uma expressão pelo valor ou pelo contexto, sem anotação explícita.' },
    { term: 'any', def: 'Tipo que desliga a verificação de tipos do valor.' },
    { term: 'unknown', def: 'Tipo seguro para "qualquer valor": exige estreitamento antes de qualquer uso.' },
    { term: 'strictNullChecks', def: 'Opção que dá a null e undefined tipos próprios e obriga a tratá-los.' },
    { term: 'Tupla', def: 'Array com número de elementos e tipo por posição conhecidos, como [string, number].' }
  ],
  examples: `**Analogia:** o TypeScript é um revisor que lê seu texto antes da publicação. Ele marca erros e depois entrega o texto limpo, sem as marcações. Quem lê o texto publicado (o runtime) não vê o revisor, e ele não impede erros que só aparecem com dados de fora.

**Antes e depois:**

    // JavaScript: o erro aparece em runtime
    function somar(a, b) { return a + b; }
    somar(1, '2');   // '12'

    // TypeScript: o editor acusa antes de rodar
    function somar(a: number, b: number): number { return a + b; }
    somar(1, '2');   // erro: '"2"' não é atribuível a number`,
  code: [
    { title: 'Inferência, anotações, arrays e tuplas', lang: 'typescript', code: R`let nome = 'Ana';
const idade = 30;
const itens: string[] = [];
itens.push('a');
const par: [string, number] = ['pontos', 10];

nome = 42; // ❌
itens.push(7); // ❌
const [rotulo, valor] = par;
console.log(rotulo.toUpperCase(), valor.toFixed(1), idade);`,
      notes: [ { l: '1-2', t: 'O tipo vem do valor: nome é string; idade (const) tem o tipo literal 30.' }, { l: '3', t: 'Um array vazio precisa de anotação, senão o compilador não sabe o que ele guardará.' }, { l: '5', t: 'A tupla fixa o tipo de cada posição.' }, { l: '7-8', t: 'Atribuir número a uma variável string, ou número a string[], é erro de compilação.' }, { l: '9-10', t: 'A desestruturação preserva os tipos: rotulo é string e valor é number.' } ] },
    { title: 'Funções tipadas e callbacks', lang: 'typescript', code: R`function somar(a: number, b: number): number {
  return a + b;
}
function saudar(nome: string, titulo?: string): string {
  return titulo ? titulo + ' ' + nome : nome;
}

somar(1, '2'); // ❌
saudar('Ana');
saudar('Ana', 'Dra.');
const dobros = [1, 2, 3].map((n) => n * 2);
const textos = [1, 2, 3].map((n) => n.toUpperCase()); // ❌`,
      notes: [ { l: '4', t: 'titulo?: string significa string | undefined dentro da função.' }, { l: '8', t: 'Um argumento do tipo errado é rejeitado antes de rodar.' }, { l: '11-12', t: 'No map, n é number por contextual typing; toUpperCase não existe em number.' } ] },
    { title: 'unknown, any e o limite da checagem', lang: 'typescript', code: R`function tamanho(x: unknown): number {
  if (typeof x === 'string') return x.length;
  if (Array.isArray(x)) return x.length;
  return 0;
}

function inseguro(x: any) {
  return x.naoExiste.foo;
}

function seguro(x: unknown) {
  return x.naoExiste; // ❌
}

interface Usuario { nome: string }
const dados = JSON.parse('{"nome": 1}') as Usuario;
console.log(typeof dados.nome);`,
      notes: [ { l: '1-5', t: 'Com unknown, só depois do typeof e do Array.isArray o valor pode ser usado.' }, { l: '7-9', t: 'Com any, o compilador aceita; em runtime isso lança TypeError.' }, { l: '12', t: 'Com unknown, o mesmo acesso vira erro de compilação.' }, { l: '16-17', t: 'O "as Usuario" só afirma o tipo. O JSON tem um número em nome e o TypeScript não percebe: imprime "number".' } ] }
  ],
  bestPractices: ['Ative "strict": true em todo projeto novo.', 'Deixe o compilador inferir variáveis locais e anote parâmetros e fronteiras públicas.', 'Use unknown para dados externos (JSON, entrada do usuário) e estreite antes de usar.', 'Evite any; quando for inevitável, isole-o em uma função pequena e comente o motivo.', 'Evite o operador ! sem uma garantia clara; prefira verificar null e undefined.', 'Lembre que tipos não validam dados em runtime: valide na fronteira do sistema.'],
  mistakes: ['Achar que o TypeScript valida o formato do JSON recebido.', 'Usar "as" para fazer o erro de tipo desaparecer.', 'Escrever String, Number ou Boolean (maiúsculos) em vez de string, number e boolean.', 'Anotar tudo, inclusive o que o compilador já infere.', 'Deixar o strict desligado e continuar tendo erros de null.', 'Usar any em callbacks de eventos e perder a ajuda do editor.'],
  market: `A maioria das vagas de front-end e Node.js hoje pede TypeScript. Em revisões de código, a pergunta "isso é any ou unknown?" separa quem só silencia o compilador de quem entende o que o sistema de tipos garante e o que ele não garante.`,
  summary: `TypeScript é JavaScript com um verificador de tipos que roda antes da execução e depois apaga os tipos. Use os primitivos em minúsculas, deixe a inferência trabalhar e anote parâmetros e fronteiras. Prefira unknown a any, ligue strict e lembre que o compilador confia nas suas anotações: dados externos precisam de validação em runtime.`,
  refs: [REF.scratch, REF.everyday, REF.tsconfig],
  cards: [
    { q: 'O que acontece com os tipos depois da compilação?', a: 'São apagados. O JavaScript gerado não tem informação de tipo.' },
    { q: 'Qual a diferença entre any e unknown?', a: 'any aceita qualquer operação sem checar; unknown aceita qualquer valor, mas exige estreitamento antes de usá-lo.' },
    { q: 'JSON.parse(texto) as Usuario valida o JSON?', a: 'Não. O "as" só afirma o tipo ao compilador; a validação precisa ser escrita em runtime.' },
    { q: 'Qual o tipo de "const n = 30"? E de "let n = 30"?', a: 'const: o literal 30. let: number.' }
  ]
},
{
  id: 'ts-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['typescript', 'objetos', 'interface', 'type', 'readonly'],
  title: 'Tipos de objeto: interface, type, opcionais e readonly',
  objectives: ['Descrever objetos com interface e type e escolher entre os dois', 'Usar propriedades opcionais, readonly e index signatures', 'Combinar tipos com extends e interseção', 'Explicar tipagem estrutural, as const, as e satisfies'],
  intro: `Quase todo dado de uma aplicação é um objeto: usuário, pedido, resposta de API. Descrever o formato desses objetos é o uso mais comum do TypeScript. Esta aula mostra as ferramentas para isso e o princípio que as une: o TypeScript compara a **forma** dos objetos, não o nome dos tipos.`,
  theory: `### interface e type
As duas nomeiam um tipo de objeto:

    interface Usuario { id: number; nome: string }
    type Produto = { id: number; preco: number }

Segundo o Handbook, quase tudo que uma §interface§ faz o §type§ também faz. A diferença principal: uma §interface§ pode ser **reaberta** (declarar o mesmo nome duas vezes soma os membros), e um §type§ não. Um §type§ também nomeia uniões, tuplas e tipos primitivos. A heurística da documentação: use §interface§ até precisar de algo que só o §type§ oferece.

### Tipagem estrutural
O TypeScript é *structurally typed*: um valor serve para um tipo se **tiver os campos exigidos**, mesmo sem declarar que o implementa. Dois tipos com a mesma forma são compatíveis. Isso difere de linguagens como Java, em que o nome da classe importa.
Ao escrever um objeto literal direto onde se espera um tipo, o compilador também checa **propriedades em excesso**: campos que o tipo não prevê viram erro, o que pega muitos erros de digitação.

### Propriedades opcionais e readonly
- §?§ permite omitir a propriedade. Ao ler, o tipo inclui §undefined§: verifique antes de usar ou use §?.§ e §??§. Em desestruturação, dá para definir padrão: §{ xPos = 0 }§.
- §readonly§ impede **reatribuir** a propriedade, apenas na checagem de tipos. Não altera o runtime e não protege o conteúdo interno (um objeto dentro de um campo readonly ainda pode mudar). §readonly string[]§ (ou §ReadonlyArray§) descreve arrays sem §push§ e similares.

### Index signatures
Quando os nomes das chaves não são conhecidos, mas o formato dos valores é: §{ [chave: string]: number }§. Todas as propriedades nomeadas precisam ser compatíveis com o tipo da assinatura. Para um dicionário, o utility type §Record<string, number>§ é equivalente e mais legível.

### Extensão e interseção
- §interface Admin extends Usuario { permissoes: string[] }§ copia os membros e acrescenta novos; uma interface pode estender várias.
- §type A = B & C§ (interseção) combina tipos. Se as duas partes definem a mesma propriedade com tipos incompatíveis, ela vira §never§.

### as const, as e satisfies
- §as const§ congela o literal: o objeto vira §readonly§ e os valores mantêm tipos literais (§'GET'§ em vez de §string§). Em arrays, produz tuplas somente leitura.
- §valor as Tipo§ é **afirmação**: o compilador passa a tratar o valor como esse tipo, sem verificar em runtime. Conversões "impossíveis" (§"a" as number§) são bloqueadas.
- §expressao satisfies Tipo§ (TypeScript 4.9) **valida** que a expressão respeita o tipo e **mantém o tipo mais específico** dela. Uma anotação (§const x: Tipo§) também valida, mas alarga o tipo para o declarado.`,
  concepts: [
    { term: 'interface', def: 'Nomeia um tipo de objeto; pode ser estendida e reaberta (declaration merging).' },
    { term: 'type alias', def: 'Dá nome a qualquer tipo: objetos, uniões, tuplas, primitivos; não pode ser reaberto.' },
    { term: 'Tipagem estrutural', def: 'Compatibilidade decidida pela forma (campos e tipos), não pelo nome declarado.' },
    { term: 'Propriedade opcional', def: 'Campo com ? que pode ser omitido; seu tipo inclui undefined.' },
    { term: 'readonly', def: 'Impede reatribuir uma propriedade na checagem de tipos, sem efeito em runtime.' },
    { term: 'Index signature', def: 'Descreve objetos com chaves desconhecidas e valores de um tipo conhecido.' },
    { term: 'satisfies', def: 'Valida que um valor respeita um tipo sem apagar o tipo específico inferido.' }
  ],
  examples: `**Analogia:** o tipo estrutural é um formulário com campos obrigatórios. Qualquer pessoa que traga todos os campos preenchidos é aceita, não importa de onde veio. Já a checagem de excesso é o atendente que estranha um campo que não existe no formulário: provavelmente é erro de digitação.

    interface Ponto { x: number; y: number }
    const p3d = { x: 1, y: 2, z: 3 };
    const ok: Ponto = p3d;          // aceito: tem x e y
    const e: Ponto = { x: 1, y: 2, z: 3 }; // erro: literal com campo a mais`,
  code: [
    { title: 'interface, opcionais, readonly e extends', lang: 'typescript', code: R`interface Usuario {
  readonly id: number;
  nome: string;
  email?: string;
}
interface Admin extends Usuario {
  permissoes: string[];
}

function descrever(u: Usuario): string {
  const contato = u.email ?? 'sem e-mail';
  return u.nome + ' (' + contato + ')';
}

const admin: Admin = { id: 1, nome: 'Bia', permissoes: ['tudo'] };
descrever(admin);
admin.id = 2; // ❌
const x: Usuario = { id: 3, nome: 'Caio', idade: 20 }; // ❌`,
      notes: [ { l: '2', t: 'readonly: o id não pode ser reatribuído depois de criado.' }, { l: '3-4', t: 'email é opcional; ler u.email dá string | undefined.' }, { l: '11', t: '?? trata a ausência com um valor padrão.' }, { l: '16', t: 'Admin é compatível com Usuario porque tem todos os campos de Usuario.' }, { l: '17-18', t: 'Reatribuir um readonly é erro; o literal com "idade" falha na checagem de excesso.' } ] },
    { title: 'Index signature, interseção e readonly em arrays', lang: 'typescript', code: R`const notas: { [aluno: string]: number } = { ana: 9, bia: 8 };
notas.caio = 7;
notas.dani = 'dez'; // ❌

type ComId = { id: number };
type ComNome = { nome: string };
type Registro = ComId & ComNome;
const r: Registro = { id: 1, nome: 'Eva' };

function somar(valores: readonly number[]): number {
  valores.push(1); // ❌
  return valores.reduce((a, v) => a + v, 0);
}
somar([1, 2, 3]);`,
      notes: [ { l: '1-3', t: 'Qualquer chave string é aceita, mas o valor precisa ser number.' }, { l: '7-8', t: 'A interseção exige os campos dos dois tipos.' }, { l: '10-11', t: 'readonly number[] não tem push: a função promete não alterar o array recebido.' }, { l: '13', t: 'Um number[] comum pode ser passado onde se espera readonly number[].' } ] },
    { title: 'as const, as e satisfies', lang: 'typescript', code: R`const metodos = ['GET', 'POST'] as const;
type Metodo = typeof metodos[number];
const m: Metodo = 'PUT'; // ❌

type Cor = 'red' | 'green' | 'blue';
const paleta = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255]
} satisfies Record<Cor, string | number[]>;
const verde = paleta.green.toUpperCase();

const anotada: Record<Cor, string | number[]> = paleta;
anotada.green.toUpperCase(); // ❌
console.log(m, verde);`,
      notes: [ { l: '1', t: 'as const transforma o array em tupla somente leitura com literais.' }, { l: '2', t: 'typeof metodos[number] extrai a união "GET" | "POST".' }, { l: '6-10', t: 'satisfies confere que todas as cores existem, sem apagar que green é string.' }, { l: '11', t: 'Como o tipo de green foi preservado, toUpperCase() funciona.' }, { l: '13-14', t: 'Uma anotação alarga o tipo para string | number[], e toUpperCase deixa de existir.' } ] }
  ],
  bestPractices: ['Use interface para formatos de objeto públicos e type para uniões, tuplas e tipos calculados.', 'Marque como readonly o que não deve ser reatribuído e receba arrays como readonly T[] quando não os altera.', 'Prefira Record<K, V> a index signatures soltas quando as chaves forem conhecidas.', 'Use satisfies para validar configurações sem perder os tipos literais.', 'Use as const para listas de valores fixos e derive a união com typeof lista[number].', 'Evite "as" para silenciar erros; se precisar, comente por que a afirmação é segura.'],
  mistakes: ['Achar que readonly protege o conteúdo interno do objeto em runtime.', 'Esquecer que propriedade opcional pode ser undefined ao ler.', 'Usar as para "converter" dados que não têm aquela forma.', 'Esperar que duas interfaces com nomes diferentes e a mesma forma sejam incompatíveis.', 'Usar index signature com um tipo de valor que não cobre as propriedades nomeadas.', 'Copiar a lista de literais em dois lugares em vez de derivar o tipo com as const.'],
  market: `Descrever respostas de API e entidades do domínio com interfaces claras é a tarefa diária em projetos TypeScript. Entrevistas costumam perguntar a diferença entre interface e type, o que é tipagem estrutural e quando usar satisfies em vez de uma anotação.`,
  summary: `interface e type descrevem objetos; a primeira é extensível e reaberta, o segundo é mais geral. A compatibilidade é estrutural. ? cria campos opcionais, readonly impede reatribuição só na checagem, e index signatures cobrem chaves desconhecidas. extends e & combinam tipos. as const preserva literais, as afirma sem verificar e satisfies valida mantendo o tipo específico.`,
  refs: [REF.objects, REF.everyday, REF.satisfies],
  cards: [
    { q: 'Quando uma interface e um type deixam de ser intercambiáveis?', a: 'Quando você precisa de uniões, tuplas ou tipos primitivos nomeados (só type) ou de reabrir o tipo com declaration merging (só interface).' },
    { q: 'O que significa tipagem estrutural?', a: 'Um valor serve para um tipo se tiver os campos exigidos, independentemente do nome declarado.' },
    { q: 'readonly impede a mutação em runtime?', a: 'Não. Só a checagem de tipos o respeita, e o conteúdo interno do campo ainda pode mudar.' },
    { q: 'Qual a diferença entre anotar com ": Tipo" e usar "satisfies Tipo"?', a: 'Ambos validam; a anotação alarga o tipo da variável para o declarado, o satisfies mantém o tipo específico inferido.' }
  ]
},
{
  id: 'ts-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['typescript', 'union', 'narrowing', 'type-guards', 'never'],
  title: 'Uniões, literais e narrowing',
  objectives: ['Modelar alternativas com uniões e tipos literais', 'Estreitar uniões com typeof, in, instanceof e igualdade', 'Escrever type predicates e discriminated unions', 'Garantir exaustividade com never'],
  intro: `Dados reais têm várias formas: um pedido está pendente, pago ou cancelado; uma resposta é sucesso ou erro. Uniões descrevem essas alternativas e o *narrowing* (estreitamento) diz ao compilador qual alternativa está valendo em cada trecho. É a parte do TypeScript que mais evita bugs.`,
  theory: `### Uniões e tipos literais
Uma união §A | B§ aceita qualquer um dos membros. Uma operação só é permitida se for válida para **todos** os membros. Tipos literais fixam valores: §'GET'§, §404§, §true§. Uma união de literais funciona como uma enumeração leve:

    type Status = 'pendente' | 'pago' | 'cancelado';

### Narrowing
Para usar um valor de um tipo união você o **estreita**. O compilador acompanha o fluxo do código (*control flow analysis*) e reduz o tipo dentro de cada ramo. As técnicas do Handbook:
- §typeof§: §typeof x === 'string'§.
- **Truthiness**: remove §null§, §undefined§, §0§ e §""§ (cuidado: remove também o 0 e a string vazia válidos).
- **Igualdade**: §x === y§, §x !== null§; §x != null§ remove §null§ e §undefined§.
- §in§: §'nadar' in animal§ separa membros que têm a propriedade.
- §instanceof§: §x instanceof Date§.
- **Atribuição** e **retorno antecipado** (§if (!x) return§) também estreitam o código seguinte.

### Type predicates
Uma função com retorno §x is Tipo§ vira um guard reutilizável. Quando devolve §true§, o compilador estreita o argumento:

    function ehTexto(v: unknown): v is string { return typeof v === 'string'; }

Atenção: o compilador **confia** no predicado. Se o corpo estiver errado, o tipo mente. Escreva e teste guards com cuidado.

### Discriminated unions
Dê a cada membro uma propriedade literal em comum (a *tag*, geralmente §kind§ ou §tipo§). Testar essa propriedade estreita para o membro certo:

    type Forma = { kind: 'circulo'; raio: number } | { kind: 'quadrado'; lado: number };

É o padrão ideal para estados (§carregando§, §sucesso§, §erro§), mensagens e resultados de operações.

### never e exaustividade
§never§ é o tipo de "nada sobrou". Dentro de um §switch§ sobre a tag, se todos os casos foram tratados, o valor do §default§ tem tipo §never§. Atribuí-lo a uma variável §never§ faz o compilador **acusar erro quando alguém acrescenta um novo membro** sem tratá-lo. Em runtime, lance um erro no §default§ para não passar em silêncio.`,
  concepts: [
    { term: 'União', def: 'Tipo A | B que aceita valores de qualquer um dos membros.' },
    { term: 'Tipo literal', def: 'Tipo que representa um único valor, como "GET" ou 404.' },
    { term: 'Narrowing', def: 'Redução do tipo de um valor em um trecho de código, com base em testes feitos pelo programa.' },
    { term: 'Type predicate', def: 'Retorno "x is T" que transforma uma função em guard de tipo.' },
    { term: 'Discriminated union', def: 'União cujos membros compartilham uma propriedade literal (tag) usada para distingui-los.' },
    { term: 'never', def: 'Tipo sem valores possíveis; aparece quando o narrowing elimina todas as alternativas.' },
    { term: 'Exaustividade', def: 'Garantia de que todos os membros de uma união foram tratados, verificada com never.' }
  ],
  examples: `**Analogia:** uma união é uma caixa fechada com etiqueta "pode ser carta ou pacote". Você só pode usar o que vale para os dois (o endereço). Para abrir o pacote, antes confere a etiqueta (a tag): dentro desse ramo, o compilador sabe o que você tem nas mãos.

    type Resultado =
      | { ok: true; valor: number }
      | { ok: false; erro: string };

    function mostrar(r: Resultado) {
      if (r.ok) return r.valor;    // aqui r tem valor
      return r.erro;               // aqui r tem erro
    }`,
  code: [
    { title: 'Narrowing com typeof, in e instanceof', lang: 'typescript', code: R`function formatar(v: string | number | Date | null): string {
  if (v === null) return '-';
  if (typeof v === 'string') return v.trim();
  if (v instanceof Date) return v.toISOString();
  return v.toFixed(2);
}

interface Peixe { nadar(): void }
interface Passaro { voar(): void }
function mover(a: Peixe | Passaro) {
  if ('nadar' in a) a.nadar();
  else a.voar();
}

function tamanho(v: string | string[]) {
  return v.length;
}
function maiuscula(v: string | string[]) {
  return v.toUpperCase(); // ❌
}`,
      notes: [ { l: '2-5', t: 'Cada teste elimina um membro da união; no fim sobra number.' }, { l: '11-12', t: 'O operador in separa os membros pela presença de uma propriedade.' }, { l: '15-17', t: 'length existe nos dois membros, então é permitido sem estreitar.' }, { l: '18-20', t: 'toUpperCase só existe em string; sem estreitar, é erro.' } ] },
    { title: 'Type predicate e discriminated union', lang: 'typescript', code: R`function ehTexto(v: unknown): v is string {
  return typeof v === 'string';
}
function juntar(valores: unknown[]): string {
  return valores.filter(ehTexto).map((t) => t.trim()).join(' ');
}

type Forma =
  | { kind: 'circulo'; raio: number }
  | { kind: 'quadrado'; lado: number }
  | { kind: 'retangulo'; largura: number; altura: number };

function area(f: Forma): number {
  switch (f.kind) {
    case 'circulo':
      return Math.PI * f.raio ** 2;
    case 'quadrado':
      return f.lado ** 2;
    case 'retangulo':
      return f.largura * f.altura;
    default: {
      const nunca: never = f;
      throw new Error('forma desconhecida: ' + JSON.stringify(nunca));
    }
  }
}`,
      notes: [ { l: '1-3', t: 'O predicado "v is string" estreita o argumento quando devolve true.' }, { l: '5', t: 'filter com um type predicate devolve string[] (e não unknown[]).' }, { l: '8-11', t: 'A tag kind é a propriedade literal que identifica cada forma.' }, { l: '14-26', t: 'Dentro de cada case, f já tem o formato do membro correspondente.' }, { l: '22-25', t: 'Se alguém acrescentar um novo kind à união, "const nunca: never = f" deixa de compilar.' } ] },
    { title: 'Estados de uma requisição', lang: 'typescript', code: R`type Estado<T> =
  | { status: 'carregando' }
  | { status: 'erro'; mensagem: string }
  | { status: 'sucesso'; dados: T };

function texto(e: Estado<string[]>): string {
  if (e.status === 'carregando') return 'Carregando...';
  if (e.status === 'erro') return 'Falhou: ' + e.mensagem;
  return e.dados.join(', ');
}

const e: Estado<string[]> = { status: 'sucesso', dados: ['a', 'b'] };
console.log(texto(e));
const invalido: Estado<string[]> = { status: 'sucesso' }; // ❌`,
      notes: [ { l: '1-4', t: 'Cada estado carrega só os campos que fazem sentido para ele.' }, { l: '7-9', t: 'Depois de eliminar os outros dois estados, sobra "sucesso" e dados existe.' }, { l: '14', t: 'O compilador impede um "sucesso" sem dados, um estado impossível em uniões mal modeladas.' } ] }
  ],
  bestPractices: ['Modele estados como discriminated unions em vez de vários campos opcionais.', 'Use uma tag literal comum (kind, status, tipo) e dê o mesmo nome a ela em todos os membros.', 'Feche switches sobre uniões com um default que atribui a never e lança erro.', 'Escreva type predicates pequenos, com testes, porque o compilador confia neles.', 'Prefira estreitar com === null ou == null a testes de truthiness quando 0 e "" são valores válidos.', 'Derive uniões de literais de uma lista as const quando houver uma fonte única.'],
  mistakes: ['Estreitar por truthiness e descartar 0 e string vazia sem querer.', 'Modelar um estado com { carregando: boolean; erro?: string; dados?: T }, que permite combinações impossíveis.', 'Escrever um type predicate cujo corpo não confere o que o tipo promete.', 'Esquecer o default exaustivo e deixar um caso novo passar em silêncio.', 'Usar "as" para estreitar em vez de testar o valor.', 'Esperar que typeof distinga arrays de objetos (ambos dão "object").'],
  market: `Estados e resultados modelados com uniões discriminadas são a base de código de interface e de back-end bem tipados, e aparecem em bibliotecas como Redux Toolkit, React Query e Zod. É um assunto frequente em entrevistas de TypeScript.`,
  summary: `Uniões descrevem alternativas e literais fixam valores. O compilador estreita o tipo conforme typeof, igualdade, in, instanceof e retornos antecipados. Type predicates criam guards reutilizáveis, discriminated unions identificam o membro por uma tag, e never no default garante que todos os casos sejam tratados.`,
  refs: [REF.narrowing, REF.everyday],
  cards: [
    { q: 'Quando uma operação é permitida em um tipo união?', a: 'Quando é válida para todos os membros da união.' },
    { q: 'O que é uma discriminated union?', a: 'Uma união cujos membros têm uma propriedade literal em comum (a tag), usada para estreitar para o membro certo.' },
    { q: 'Para que serve atribuir o valor a uma variável never no default?', a: 'Para o compilador acusar erro quando um novo membro for adicionado à união sem ser tratado.' },
    { q: 'Qual o risco de um type predicate?', a: 'O compilador confia nele: se o corpo estiver errado, o tipo mente.' }
  ]
},
{
  id: 'ts-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['typescript', 'funcoes', 'classes', 'overloads', 'this'],
  title: 'Funções avançadas e classes',
  objectives: ['Tipar funções com opcionais, rest, callbacks e this', 'Usar overloads quando a saída depende da entrada e preferir uniões quando possível', 'Declarar classes com modificadores, readonly e parameter properties', 'Diferenciar private do TypeScript de #private do JavaScript'],
  intro: `Funções e classes estruturam o código. O TypeScript acrescenta contratos a elas: o que entra, o que sai, o que cada membro de uma classe deixa os outros ver. Esta aula mostra como usar esses contratos sem exagero e onde eles terminam, porque parte deles só existe na compilação.`,
  theory: `### Tipos de função e callbacks
Um tipo de função se escreve §(a: number, b: number) => number§. Parâmetros opcionais (§x?: T§) têm tipo §T | undefined§; parâmetros com valor padrão (§x = 10§) são §T§ dentro da função. Segundo o Handbook, em tipos de callback **não declare um parâmetro opcional a menos que a função realmente possa ser chamada sem ele**: caso contrário o compilador exige verificar §undefined§ em quem implementa o callback.
Parâmetros rest se tipam como array: §...nums: number[]§. Para espalhar um array fixo em uma chamada, use uma tupla ou §as const§.

### O tipo do this
Declare §this§ como primeiro parâmetro (ele não existe em runtime):

    function marcar(this: HTMLElement, cor: string) { this.style.color = cor; }

Use §function§ e não arrow, porque arrow functions capturam o §this§ de fora.

### Overloads
Quando o tipo de retorno depende do tipo do argumento, escreva **assinaturas de overload** seguidas de uma implementação:

    function dobrar(x: number): number;
    function dobrar(x: string): string;
    function dobrar(x: number | string) { return typeof x === 'number' ? x * 2 : x + x; }

Regras do Handbook: a assinatura de implementação **não é visível** para quem chama, e precisa ser compatível com todos os overloads. Quando for possível, prefira **um parâmetro com tipo união** a overloads, pois uniões aceitam um valor cujo tipo é "um ou outro" e overloads separados, não.

### Classes
Campos declarados criam propriedades. Com §strictPropertyInitialization§, cada campo precisa ser inicializado no construtor (ou receber um inicializador).
Modificadores de acesso:
- §public§ (padrão), §protected§ (classe e subclasses), §private§ (só a própria classe).
- §readonly§: só pode ser atribuído na declaração ou no construtor.
- **Parameter properties**: §constructor(private readonly id: number)§ declara e atribui o campo de uma vez.
§implements Interface§ só **confere** que a classe cumpre o contrato, sem herdar nada; §extends§ herda campos e métodos, e a subclasse precisa continuar compatível com a base.

### private do TypeScript versus #private
§private§ do TypeScript é "privacidade suave": só existe na checagem. Depois da compilação o campo é acessível em JavaScript puro, e a notação §obj['campo']§ também o alcança. Já §#campo§ é **privacidade real do JavaScript**: nada fora da classe lê o valor. Se o objetivo é proteger o dado em runtime, use §#§.`,
  concepts: [
    { term: 'Overload', def: 'Conjunto de assinaturas que descrevem diferentes formas de chamar uma mesma função.' },
    { term: 'Assinatura de implementação', def: 'Assinatura da função real; não é visível para quem chama.' },
    { term: 'Parameter property', def: 'Parâmetro do construtor com modificador que também declara e atribui um campo.' },
    { term: 'protected', def: 'Membro visível na classe e nas subclasses, mas não de fora.' },
    { term: 'implements', def: 'Verifica que a classe cumpre uma interface, sem herdar implementação.' },
    { term: '#private', def: 'Campo privado de verdade do JavaScript, inacessível fora da classe em runtime.' },
    { term: 'strictPropertyInitialization', def: 'Opção que exige que todo campo de classe seja inicializado no construtor.' }
  ],
  examples: `**Analogia:** os modificadores de acesso são placas em portas. \`private\` do TypeScript é uma placa "só funcionários": o compilador respeita, mas a porta não está trancada, e quem ignora a placa entra. \`#private\` é a porta trancada de verdade.

    class Cofre {
      private senhaTS = '123';   // placa: ainda acessível via cofre['senhaTS']
      #senhaReal = '456';        // trancado: inacessível de fora
    }`,
  code: [
    { title: 'Funções: opcionais, rest, callbacks e overloads', lang: 'typescript', code: R`function arredondar(n: number, casas = 2): number {
  const f = 10 ** casas;
  return Math.round(n * f) / f;
}
function somar(base: number, ...resto: number[]): number {
  return resto.reduce((a, v) => a + v, base);
}
function paraCada(lista: number[], fn: (valor: number, i: number) => void) {
  lista.forEach(fn);
}

function dobrar(x: number): number;
function dobrar(x: string): string;
function dobrar(x: number | string): number | string {
  return typeof x === 'number' ? x * 2 : x + x;
}

dobrar(2).toFixed(1);
dobrar('ab').toUpperCase();
dobrar(true); // ❌
somar(1, 2, 3);`,
      notes: [ { l: '1', t: 'casas = 2 vira number dentro da função e torna o argumento opcional para quem chama.' }, { l: '5-7', t: 'O rest reúne os argumentos restantes em um number[].' }, { l: '13-18', t: 'Duas assinaturas de overload e uma implementação com união.' }, { l: '20-21', t: 'O tipo de retorno acompanha o argumento: number no primeiro caso, string no segundo.' }, { l: '22', t: 'Nenhum overload aceita boolean.' } ] },
    { title: 'Classes: modificadores, readonly e parameter properties', lang: 'typescript', code: R`class Conta {
  #saldo = 0;
  constructor(public readonly titular: string, protected limite = 0) {}

  depositar(valor: number): void {
    if (valor <= 0) throw new RangeError('valor deve ser positivo');
    this.#saldo += valor;
  }
  get saldo(): number {
    return this.#saldo;
  }
}

class Poupanca extends Conta {
  taxa(): number {
    return this.limite * 0.01;
  }
}

const c = new Conta('Ana');
c.depositar(50);
c.titular = 'Bia'; // ❌
c.limite; // ❌
c.#saldo; // ❌`,
      notes: [ { l: '2', t: '#saldo é privado de verdade: some do objeto para qualquer código de fora.' }, { l: '3', t: 'Parameter properties: titular é público e readonly; limite é protected, com valor padrão.' }, { l: '9-11', t: 'Um getter expõe o saldo para leitura sem permitir escrita.' }, { l: '14-18', t: 'A subclasse enxerga o campo protected.' }, { l: '23-25', t: 'Reatribuir readonly, ler protected e acessar #campo de fora são erros.' } ] },
    { title: 'implements e o limite do private', lang: 'typescript', code: R`interface Identificavel {
  id: number;
  rotulo(): string;
}

class Produto implements Identificavel {
  constructor(public id: number, private nome: string) {}
  rotulo(): string {
    return '#' + this.id + ' ' + this.nome;
  }
}

const p = new Produto(1, 'Caneta');
console.log(p['nome']);
p.nome; // ❌`,
      notes: [ { l: '6', t: 'implements confere o contrato; a classe continua sendo uma classe comum.' }, { l: '14', t: 'A notação de colchetes escapa da checagem do private do TypeScript e funciona (e funciona sempre em runtime).' }, { l: '15', t: 'O acesso direto é rejeitado, mas só na compilação.' } ] }
  ],
  bestPractices: ['Prefira um parâmetro com tipo união a overloads quando a saída não depende da entrada.', 'Use overloads só quando o tipo de retorno realmente muda conforme o argumento.', 'Evite parâmetros opcionais em tipos de callback.', 'Use parameter properties para classes simples e readonly para o que não muda.', 'Use #campo quando a privacidade precisar valer em runtime.', 'Prefira composição e interfaces a hierarquias profundas com extends.'],
  mistakes: ['Achar que private do TypeScript protege o dado depois da compilação.', 'Escrever overloads cuja implementação não é compatível com todos.', 'Esquecer de inicializar campos e ligar o ! para calar o erro.', 'Passar um método como callback e perder o this.', 'Usar arrow function onde o tipo this: T era necessário.', 'Herdar de uma classe apenas para reaproveitar uma função.'],
  market: `Classes tipadas dominam frameworks como NestJS e Angular, e o uso correto de overloads, genéricos e modificadores aparece em bibliotecas e em entrevistas. Saber que private é só checagem evita falhas de segurança por suposição errada.`,
  summary: `Tipos de função cobrem opcionais, padrões, rest e this. Overloads descrevem retornos que dependem dos argumentos, mas uma união costuma bastar. Classes ganham modificadores, readonly e parameter properties; implements confere contratos e extends herda. private do TypeScript é suave, #private é real em runtime.`,
  refs: [REF.functions, REF.classes],
  cards: [
    { q: 'A assinatura de implementação de um overload é visível para quem chama?', a: 'Não. Só as assinaturas de overload contam, e a implementação precisa ser compatível com todas.' },
    { q: 'Qual a diferença entre private e #private?', a: 'private só existe na checagem de tipos e pode ser contornado; #private é privacidade real do JavaScript.' },
    { q: 'O que faz "constructor(private readonly id: number)"?', a: 'Declara o campo id (privado e somente leitura) e o atribui com o argumento recebido.' },
    { q: 'implements herda código?', a: 'Não. Ele só confere que a classe cumpre a interface; quem herda é o extends.' }
  ]
}
];
