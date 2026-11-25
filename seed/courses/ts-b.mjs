// Curso 5 — TypeScript: fundamentos e recursos avançados. Aulas 5 a 7.
// "DOLAR{" marca ${ nos exemplos em String.raw (convertido em ts.mjs).
import { REF } from './ts-a.mjs';
const R = String.raw;

export const lessonsB = [
{
  id: 'ts-05', moduleId: 'm3', order: 5, minutes: 85, tags: ['typescript', 'generics', 'constraints', 'keyof'],
  title: 'Generics',
  objectives: ['Escrever funções e tipos genéricos e deixar o compilador inferir o argumento de tipo', 'Restringir parâmetros de tipo com extends e relacioná-los com keyof', 'Criar interfaces, aliases e classes genéricos, com tipos padrão', 'Aplicar generics em padrões comuns, como Result e coleções tipadas'],
  intro: `Uma função que devolve o primeiro item de um array serve para números, textos e usuários. Sem generics, você teria de escolher entre repetir a função para cada tipo ou usar any e perder a segurança. Generics resolvem isso: o tipo vira um parâmetro da função, capturado em cada chamada.`,
  theory: `### O problema e a solução
Com §any§, §function primeiro(lista: any[]): any§ devolve algo sem tipo: o compilador não ajuda mais. Com um **parâmetro de tipo**:

    function primeiro<T>(lista: T[]): T | undefined { return lista[0]; }

§T§ é um nome para "o tipo dos elementos". Em §primeiro([1, 2])§, §T§ vira §number§; em §primeiro(['a'])§, vira §string§. O tipo de entrada **chega até o tipo de saída**.

### Inferência
Na maioria das chamadas você **não escreve** o argumento de tipo: o compilador o infere dos argumentos. Escreva-o explicitamente (§primeiro<string>([])§) só quando a inferência não alcançar, como em listas vazias.

### Restrições com extends
Dentro da função, o compilador só sabe o que o parâmetro de tipo promete. Para usar §.length§, por exemplo, restrinja:

    function comprimento<T extends { length: number }>(x: T): number { return x.length; }

Aceita strings, arrays e qualquer objeto com §length§; rejeita §number§.

### keyof e chaves seguras
§keyof T§ é a união das chaves de §T§. Com dois parâmetros de tipo relacionados, a função só aceita chaves que existem:

    function pegar<T, K extends keyof T>(obj: T, chave: K): T[K] { return obj[chave]; }

O retorno §T[K]§ é o tipo exato da propriedade escolhida (veja *indexed access types*).

### Tipos e classes genéricos
Interfaces, aliases e classes aceitam parâmetros: §interface Caixa<T> { conteudo: T }§, §type OuNulo<T> = T | null§, §class Pilha<T> { ... }§. Parâmetros podem ter **tipo padrão** (§<T = string>§) e **restrição** juntos. Membros §static§ de uma classe não usam o parâmetro de tipo da instância.

### Padrão Result
Um uso clássico combina generics e uniões discriminadas:

    type Result<T, E> = { ok: true; valor: T } | { ok: false; erro: E };

Funções devolvem o sucesso ou o erro como valor, e o chamador é obrigado a tratar os dois casos (por estreitamento de §ok§).

### Quando não usar
Se o parâmetro de tipo aparece **uma única vez**, ele provavelmente não está relacionando nada: use o tipo direto. Uma assinatura como §function f<T>(x: T): void§ não ganha nada sobre §(x: unknown)§. Generics existem para **ligar tipos** (entrada com saída, chave com valor).`,
  concepts: [
    { term: 'Parâmetro de tipo', def: 'Variável de tipo (como T) que a função ou o tipo recebe a cada uso.' },
    { term: 'Inferência de generics', def: 'Dedução automática do argumento de tipo a partir dos argumentos da chamada.' },
    { term: 'Restrição (extends)', def: 'Limita quais tipos um parâmetro de tipo aceita e quais membros ele garante.' },
    { term: 'keyof', def: 'Operador que gera a união das chaves de um tipo.' },
    { term: 'Tipo padrão', def: 'Valor usado por um parâmetro de tipo quando nenhum é informado nem inferido.' },
    { term: 'Result', def: 'União discriminada que representa sucesso ou falha como valor.' }
  ],
  examples: `**Analogia:** um generic é uma caixa com etiqueta em branco. Quem usa a caixa preenche a etiqueta ("tomates", "parafusos"), e tudo o que sai dela vem com a mesma etiqueta. Sem generics, a caixa fica etiquetada "coisas" (any) e você precisa adivinhar o que tirou.

    function primeiro<T>(lista: T[]): T | undefined { return lista[0]; }
    const a = primeiro([1, 2, 3]);      // number | undefined
    const b = primeiro(['x']);          // string | undefined`,
  code: [
    { title: 'Funções genéricas, inferência e restrições', lang: 'typescript', code: R`function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}
const a = primeiro([1, 2, 3]);
const b = primeiro<string>([]);

function comprimento<T extends { length: number }>(x: T): number {
  return x.length;
}
comprimento('abc');
comprimento([1, 2]);
comprimento(10); // ❌

function pegar<T, K extends keyof T>(obj: T, chave: K): T[K] {
  return obj[chave];
}
const pessoa = { nome: 'Ana', idade: 30 };
const nome = pegar(pessoa, 'nome');
const idade = pegar(pessoa, 'idade');
pegar(pessoa, 'email'); // ❌
console.log(a, b, nome.toUpperCase(), idade.toFixed(0));`,
      notes: [ { l: '4-5', t: 'T é inferido como number no primeiro caso; no segundo, a lista vazia pede o argumento explícito.' }, { l: '7-9', t: 'A restrição garante que x.length existe.' }, { l: '12', t: 'number não tem length: rejeitado.' }, { l: '14-16', t: 'K só pode ser uma chave de T, e o retorno é o tipo exato da propriedade.' }, { l: '20', t: '"email" não é chave de pessoa.' } ] },
    { title: 'Tipos e classes genéricos', lang: 'typescript', code: R`interface Caixa<T> {
  conteudo: T;
}
type OuNulo<T> = T | null;
type Par<A, B = A> = [A, B];

class Pilha<T> {
  #itens: T[] = [];
  empilhar(item: T): void {
    this.#itens.push(item);
  }
  desempilhar(): T | undefined {
    return this.#itens.pop();
  }
  get tamanho(): number {
    return this.#itens.length;
  }
}

const numeros = new Pilha<number>();
numeros.empilhar(1);
numeros.empilhar('2'); // ❌
const topo = numeros.desempilhar();
const caixa: Caixa<string[]> = { conteudo: ['a'] };
const p: Par<number> = [1, 2];
const nulo: OuNulo<string> = null;
console.log(topo, caixa, p, nulo);`,
      notes: [ { l: '5', t: 'B = A é um tipo padrão: Par<number> equivale a [number, number].' }, { l: '7-18', t: 'A mesma classe serve para qualquer tipo de item, mantendo a segurança.' }, { l: '22', t: 'Pilha<number> rejeita texto.' }, { l: '23', t: 'desempilhar devolve number | undefined, porque a pilha pode estar vazia.' } ] },
    { title: 'Result: sucesso ou erro como valor', lang: 'typescript', code: R`type Result<T, E> = { ok: true; valor: T } | { ok: false; erro: E };

function ok<T>(valor: T): Result<T, never> {
  return { ok: true, valor };
}
function falha<E>(erro: E): Result<never, E> {
  return { ok: false, erro };
}

function dividir(a: number, b: number): Result<number, string> {
  if (b === 0) return falha('divisão por zero');
  return ok(a / b);
}

function mapear<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return r.ok ? ok(fn(r.valor)) : r;
}

const r = mapear(dividir(10, 2), (n) => n * 10);
if (r.ok) console.log(r.valor.toFixed(1));
else console.log(r.erro.toUpperCase());
console.log(r.valor); // ❌`,
      notes: [ { l: '3-8', t: 'ok devolve Result<T, never> e falha devolve Result<never, E>: cada um preenche só o lado que conhece.' }, { l: '15-17', t: 'mapear aplica fn apenas no sucesso e repassa o erro intacto.' }, { l: '20-22', t: 'Depois de testar r.ok, o compilador sabe se existe valor ou erro.' }, { l: '23', t: 'Sem estreitar, valor pode não existir.' } ] }
  ],
  bestPractices: ['Use generics para ligar tipos (entrada e saída, chave e valor), não por reflexo.', 'Deixe o compilador inferir; escreva o argumento de tipo só quando necessário.', 'Dê nomes descritivos quando houver vários parâmetros (TItem, TChave) em vez de só T.', 'Restrinja o parâmetro com extends em vez de usar casts dentro da função.', 'Use keyof para aceitar apenas chaves válidas de um objeto.', 'Prefira Result ou uniões discriminadas a lançar exceções para erros esperados.'],
  mistakes: ['Usar um parâmetro de tipo que aparece uma única vez e não relaciona nada.', 'Usar any dentro da função genérica e perder a segurança que o generic daria.', 'Escrever T extends object e depois acessar propriedades que a restrição não garante.', 'Esquecer que listas vazias exigem anotação para a inferência.', 'Declarar membros static com o parâmetro de tipo da classe.', 'Criar generics aninhados demais, difíceis de ler e de depurar.'],
  market: `Generics estão em tudo o que é reutilizável: hooks do React, clientes de API, repositórios e bibliotecas de validação. Ler e escrever assinaturas genéricas é uma habilidade que separa quem usa TypeScript de quem constrói bibliotecas e utilitários com ele.`,
  summary: `Generics tornam o tipo um parâmetro: T liga a entrada à saída sem perder precisão, e a inferência cuida da maioria das chamadas. extends restringe o que T aceita, keyof limita chaves, e interfaces, aliases e classes também podem ser genéricos, com tipos padrão. O padrão Result usa generics com uniões discriminadas.`,
  refs: [REF.generics, REF.indexed],
  cards: [
    { q: 'Quando usar um parâmetro de tipo?', a: 'Quando ele relaciona tipos, como a entrada com a saída ou uma chave com seu valor. Se aparece uma única vez, provavelmente não é necessário.' },
    { q: 'O que "K extends keyof T" garante?', a: 'Que K seja uma das chaves de T, permitindo devolver T[K] com o tipo exato da propriedade.' },
    { q: 'Quando é preciso escrever o argumento de tipo?', a: 'Quando a inferência não consegue deduzi-lo, como em um array vazio.' },
    { q: 'O que é o padrão Result?', a: 'Uma união discriminada que representa sucesso ou erro como valor, forçando o chamador a tratar os dois casos.' }
  ]
},
{
  id: 'ts-06', moduleId: 'm3', order: 6, minutes: 90, tags: ['typescript', 'utility-types', 'mapped-types', 'conditional-types', 'keyof'],
  title: 'Utility types, mapped types e conditional types',
  objectives: ['Usar Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, NonNullable, ReturnType, Parameters e Awaited', 'Obter tipos com keyof, typeof e indexed access', 'Escrever mapped types com modificadores e remapeamento de chaves', 'Ler e escrever conditional types simples com infer'],
  intro: `Em projetos reais, você raramente escreve um tipo do zero: deriva um tipo de outro. "O mesmo usuário, mas sem a senha", "todos os campos opcionais para uma atualização parcial", "o tipo que esta função devolve". O TypeScript oferece operadores e tipos prontos para isso, e a vantagem é que, mudando o tipo original, os derivados mudam junto.`,
  theory: `### Operadores de tipo
- §keyof T§: união das chaves. §keyof {a: 1; b: 2}§ é §'a' | 'b'§.
- §typeof valor§ (em posição de tipo): o tipo inferido de um valor existente.
- **Indexed access**: §T['chave']§ é o tipo da propriedade; §T[keyof T]§ é a união de todos os valores; §T[number]§ é o tipo dos elementos de um array. O índice precisa ser um **tipo**, não uma variável.

### Utility types essenciais
Segundo o Handbook:
- §Partial<T>§: todas as propriedades opcionais. §Required<T>§: o oposto. §Readonly<T>§: todas somente leitura.
- §Pick<T, K>§: só as propriedades §K§. §Omit<T, K>§: tudo, menos §K§.
- §Record<K, V>§: objeto com chaves §K§ e valores §V§.
- §Exclude<U, M>§: remove de uma união os membros atribuíveis a §M§. §Extract<T, U>§: mantém só esses membros. §NonNullable<T>§: remove §null§ e §undefined§.
- §ReturnType<F>§ e §Parameters<F>§: tipo de retorno e tupla de parâmetros de uma função. §Awaited<T>§: o valor que uma Promise entrega.

### Mapped types
Um mapped type percorre as chaves de outro tipo e gera um novo:

    type Flags<T> = { [K in keyof T]: boolean };

Modificadores: §+§ ou §-§ antes de §readonly§ e §?§. §-?§ torna as propriedades obrigatórias; §-readonly§ remove a imutabilidade. A cláusula §as§ (TypeScript 4.1) **renomeia ou filtra chaves**; combinada com *template literal types* gera nomes como §getNome§.

### Conditional types
§T extends U ? X : Y§ escolhe o tipo conforme a relação. Dentro do ramo verdadeiro, §infer§ captura uma parte do tipo:

    type Elemento<T> = T extends Array<infer Item> ? Item : T;

São **distributivos**: aplicados a uma união, valem para cada membro. §Exclude§ e §Extract§ são conditional types assim.

### Moderação
Tipos muito elaborados são difíceis de ler, de depurar e deixam a compilação lenta. Regra prática: use os utility types do Handbook primeiro, escreva um mapped ou conditional type só quando isso eliminar duplicação real e dê um nome claro ao resultado.`,
  concepts: [
    { term: 'keyof', def: 'Produz a união das chaves de um tipo.' },
    { term: 'Indexed access type', def: 'T["chave"]: o tipo de uma propriedade de T.' },
    { term: 'Utility type', def: 'Tipo genérico pronto da biblioteca padrão que transforma outro tipo, como Partial e Pick.' },
    { term: 'Mapped type', def: 'Tipo que percorre as chaves de outro tipo e gera um novo, com [K in keyof T].' },
    { term: 'Conditional type', def: 'Tipo que escolhe entre dois outros com T extends U ? X : Y.' },
    { term: 'infer', def: 'Palavra usada em conditional types para capturar um pedaço do tipo comparado.' },
    { term: 'Tipo distributivo', def: 'Conditional type que, aplicado a uma união, é calculado para cada membro.' }
  ],
  examples: `**Analogia:** utility types são como filtros de planilha sobre uma tabela original: "só estas colunas" (Pick), "todas, menos estas" (Omit), "tudo opcional" (Partial). Quando a tabela original ganha uma coluna, os filtros já refletem isso, sem edição manual.

    interface Usuario { id: number; nome: string; senha: string; email?: string }
    type Publico  = Omit<Usuario, 'senha'>;
    type Edicao   = Partial<Omit<Usuario, 'id'>>;
    type Resumo   = Pick<Usuario, 'id' | 'nome'>;`,
  code: [
    { title: 'Utility types sobre um tipo de domínio', lang: 'typescript', code: R`interface Usuario {
  id: number;
  nome: string;
  senha: string;
  email?: string;
}

type Publico = Omit<Usuario, 'senha'>;
type Edicao = Partial<Omit<Usuario, 'id'>>;
type Resumo = Pick<Usuario, 'id' | 'nome'>;
type Completo = Required<Usuario>;
type Papel = 'admin' | 'editor' | 'leitor';
type Permissoes = Record<Papel, string[]>;

function atualizar(u: Usuario, mudancas: Edicao): Usuario {
  return { ...u, ...mudancas };
}

const resumo: Resumo = { id: 1, nome: 'Ana' };
const publico: Publico = { id: 1, nome: 'Ana', senha: 'x' }; // ❌
const permissoes: Permissoes = { admin: ['*'], editor: ['ler'] }; // ❌
console.log(resumo, atualizar({ id: 1, nome: 'A', senha: 's' }, { nome: 'B' }));
const c: Completo | undefined = undefined;
console.log(c);`,
      notes: [ { l: '8-12', t: 'Cada alias deriva do tipo original; se Usuario mudar, todos acompanham.' }, { l: '14-16', t: 'Edicao permite enviar só os campos a alterar.' }, { l: '20', t: 'Publico não tem senha: o literal com esse campo é rejeitado.' }, { l: '21', t: 'Record<Papel, ...> exige as três chaves; falta "leitor".' } ] },
    { title: 'keyof, typeof, indexed access e funções', lang: 'typescript', code: R`const config = {
  host: 'localhost',
  porta: 5432,
  ssl: false
};
type Config = typeof config;
type Chave = keyof Config;
type Valor = Config[Chave];

const niveis = ['info', 'aviso', 'erro'] as const;
type Nivel = typeof niveis[number];

function criarUsuario(nome: string, idade: number) {
  return { nome, idade, criadoEm: new Date() };
}
type Novo = ReturnType<typeof criarUsuario>;
type Args = Parameters<typeof criarUsuario>;

async function buscar() {
  return [{ id: 1 }];
}
type Resposta = Awaited<ReturnType<typeof buscar>>;

type SemNulo = NonNullable<string | null | undefined>;
type Letras = Exclude<'a' | 'b' | 'c', 'a'>;
const v: Valor = true;
const n: Nivel = 'debug'; // ❌
console.log(v, n);
const exemplo: [Novo?, Args?, Resposta?, SemNulo?, Letras?] = [];`,
      notes: [ { l: '6-8', t: 'typeof config dá o tipo do objeto; keyof, as chaves; Config[Chave], a união dos valores (string | number | boolean).' }, { l: '10-11', t: 'as const + typeof niveis[number] gera a união "info" | "aviso" | "erro" a partir de uma lista só.' }, { l: '17-18', t: 'ReturnType e Parameters derivam tipos de uma função existente.' }, { l: '22', t: 'Awaited entrega o que a Promise resolve: { id: number }[].' }, { l: '25', t: 'Exclude remove "a", sobrando "b" | "c".' } ] },
    { title: 'Mapped types e conditional types', lang: 'typescript', code: R`type Flags<T> = { [K in keyof T]: boolean };
type Mutavel<T> = { -readonly [K in keyof T]: T[K] };
type Obrigatorio<T> = { [K in keyof T]-?: T[K] };

type Getters<T> = {
  [K in keyof T as §getDOLAR{Capitalize<string & K>}§]: () => T[K];
};

interface Pessoa {
  nome: string;
  idade: number;
}
type Acessores = Getters<Pessoa>;
const g: Acessores = { getNome: () => 'Ana', getIdade: () => 30 };

type Elemento<T> = T extends Array<infer Item> ? Item : T;
type A = Elemento<string[]>;
type B = Elemento<number>;

type RetornoDe<F> = F extends (...args: never[]) => infer Ret ? Ret : never;
type C = RetornoDe<() => boolean[]>;

type ParaLista<T> = T extends unknown ? T[] : never;
type D = ParaLista<string | number>;
const d: D = ['a'];
const e: D = [1];
const f: D = [true]; // ❌
const todos: [A, B, C, Flags<Pessoa>, Mutavel<Pessoa>, Obrigatorio<Pessoa>] | undefined = undefined;
console.log(g.getNome(), d, e, todos);`,
      notes: [ { l: '1-3', t: 'Mapped types: trocar o tipo de cada valor, remover readonly e remover a opcionalidade.' }, { l: '5-7', t: 'A cláusula "as" cria novos nomes de chave: nome vira getNome.' }, { l: '17-19', t: 'infer captura o tipo dos elementos do array; para tipos que não são arrays, devolve o próprio T.' }, { l: '21-22', t: 'infer também extrai o retorno de uma função.' }, { l: '24-29', t: 'O conditional type é distributivo: D vira string[] | number[].' } ] }
  ],
  bestPractices: ['Procure primeiro um utility type pronto antes de escrever um mapped type.', 'Derive tipos da fonte única (typeof, keyof, ReturnType) em vez de copiá-los.', 'Dê nomes claros aos tipos derivados e documente os mais elaborados.', 'Use as const com typeof lista[number] para uniões de valores fixos.', 'Evite conditional types aninhados: eles pioram mensagens de erro e o tempo de compilação.', 'Prefira Omit e Pick com chaves digitadas, para que renomeações acusem erro.'],
  mistakes: ['Esperar que Omit<T, "x"> acuse erro quando "x" não existe em T (ele aceita chaves quaisquer).', 'Usar const como índice de tipo (precisa ser um tipo).', 'Esquecer que conditional types distribuem sobre uniões.', 'Escrever tipos tão sofisticados que ninguém da equipe consegue manter.', 'Usar Partial para tipos de entrada que na verdade exigem alguns campos.', 'Confundir typeof de valor (posição de tipo) com typeof de runtime.'],
  market: `Derivar tipos de uma fonte única reduz bugs de sincronização entre código, API e validação. Bibliotecas modernas (Zod, tRPC, Prisma, React Query) dependem desses recursos, e entender suas mensagens de tipo exige conhecer mapped e conditional types.`,
  summary: `keyof, typeof e indexed access extraem tipos de valores e de outros tipos. Utility types como Partial, Pick, Omit, Record, ReturnType e Awaited cobrem a maior parte das transformações. Mapped types percorrem chaves, com modificadores e remapeamento com as; conditional types escolhem tipos com extends e infer, e distribuem sobre uniões. Use com moderação.`,
  refs: [REF.utility, REF.mapped, REF.conditional, REF.indexed],
  cards: [
    { q: 'Como criar um tipo "usuário sem senha"?', a: 'Omit<Usuario, "senha">.' },
    { q: 'Como obter a união dos valores de uma lista as const?', a: 'typeof lista[number].' },
    { q: 'O que faz o infer?', a: 'Captura, dentro do ramo verdadeiro de um conditional type, um pedaço do tipo comparado, como o item de um array ou o retorno de uma função.' },
    { q: 'O que significa um conditional type ser distributivo?', a: 'Aplicado a uma união, ele é calculado separadamente para cada membro e as respostas são unidas.' }
  ]
},
{
  id: 'ts-07', moduleId: 'm3', order: 7, minutes: 80, tags: ['typescript', 'tsconfig', 'strict', 'modulos', 'validacao'],
  title: 'Configuração, módulos e a fronteira com dados reais',
  objectives: ['Configurar o tsconfig.json com strict e escolher module e moduleResolution', 'Usar import type e entender o que o compilador emite', 'Tratar erros com unknown no catch', 'Validar dados externos em runtime antes de tratá-los como um tipo'],
  intro: `Boa parte do valor do TypeScript depende de como o projeto é configurado e de onde ficam os limites da checagem. Esta última aula fecha o curso com os dois assuntos: o tsconfig e os módulos, e o ponto em que o mundo de fora (JSON, formulários, bancos) entra no programa e os tipos deixam de ser garantia.`,
  theory: `### tsconfig.json
O arquivo diz ao compilador **como** checar e **o que** emitir. Opções que importam desde o primeiro dia (conforme a referência oficial):
- §strict§: liga a família de verificações estritas (§noImplicitAny§, §strictNullChecks§, §strictFunctionTypes§, §strictBindCallApply§, §strictPropertyInitialization§, §noImplicitThis§, §useUnknownInCatchVariables§, §alwaysStrict§). Versões novas do TypeScript podem acrescentar verificações a ele.
- §noUncheckedIndexedAccess§: **não** faz parte do strict. Acrescenta §undefined§ aos acessos por index signature (e por índice em arrays), o que obriga a tratar o "pode não existir".
- §target§: qual versão do JavaScript é emitida. §module§ e §moduleResolution§: como os módulos são gerados e encontrados (§nodenext§ para Node.js moderno; §bundler§ ou §preserve§ para código empacotado, sem exigir extensões nos imports relativos).
- §noEmit§: só checa, sem gerar arquivos; comum quando outra ferramenta (bundler, Babel, swc) faz a transpilação.

### Módulos e import type
Qualquer arquivo com §import§ ou §export§ no topo é um módulo; sem eles, é um script de escopo global (§export {}§ força módulo). §import type { Usuario } from './tipos'§ importa **só o tipo** e some do JavaScript emitido; usar o valor assim é erro. Tipos e valores usam a mesma sintaxe de export. Transpiladores que só removem tipos, como Babel, swc e esbuild, usam o §type§ para saber o que descartar com segurança.

### Erros em catch
Com §useUnknownInCatchVariables§ (parte do strict), a variável do §catch§ é §unknown§: qualquer coisa pode ser lançada em JavaScript, não só objetos §Error§. Estreite com §err instanceof Error§ antes de ler §err.message§.

### A fronteira: tipos não validam dados
Tudo o que entra por fora (§JSON.parse§, §fetch§, formulários, variáveis de ambiente, mensagens de fila) chega **sem garantia**, e o TypeScript não verifica em runtime. O padrão seguro:
1. receba como §unknown§;
2. **valide** a forma com guards (ou uma biblioteca de validação);
3. só então use como o tipo esperado.
Isso é "parse, não só valide": a função devolve o dado já no formato certo ou um erro descrito, e o resto do código não precisa duvidar.

### Adoção gradual e bibliotecas JavaScript
Projetos JavaScript migram aos poucos, arquivo por arquivo. Bibliotecas escritas em JavaScript chegam com tipos próprios ou por pacotes de declarações (arquivos §.d.ts§, geralmente publicados como §@types/nome§). Ao tipar uma API externa sem tipos, comece com §unknown§ e estreite.

### Checklist de revisão
Antes de dar o código por tipado: sem §any§ desnecessário; sem §as§ que silenciam erros; §null§ e §undefined§ tratados; uniões com default exaustivo; dados externos validados; §tsc --noEmit§ passando no CI.`,
  concepts: [
    { term: 'tsconfig.json', def: 'Arquivo de configuração que define como o compilador checa e emite o projeto.' },
    { term: 'noUncheckedIndexedAccess', def: 'Opção que acrescenta undefined aos acessos por índice, forçando a tratar a ausência.' },
    { term: 'moduleResolution', def: 'Estratégia usada para encontrar os arquivos importados (nodenext, bundler, etc.).' },
    { term: 'import type', def: 'Importação que traz apenas tipos e não gera código JavaScript.' },
    { term: 'noEmit', def: 'Opção que faz o compilador apenas checar, sem gerar arquivos.' },
    { term: 'Fronteira de validação', def: 'Ponto onde dados externos entram no programa e precisam ser verificados em runtime.' },
    { term: 'Arquivo .d.ts', def: 'Arquivo de declarações que descreve os tipos de código JavaScript.' }
  ],
  examples: `**Analogia:** o tsconfig é o regulamento de uma obra: define o rigor da inspeção (strict) e o que sai do canteiro (emitir ou não). A fronteira é a portaria: o fiscal (compilador) confere tudo o que foi construído dentro, mas o material que chega de fora precisa ser inspecionado na entrada, caso contrário o fiscal confia na etiqueta do caminhão.

    {
      "compilerOptions": {
        "target": "es2022",
        "module": "nodenext",
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noEmit": true
      }
    }`,
  code: [
    { title: 'catch com unknown e acesso indexado', lang: 'typescript', code: R`function mensagemDe(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'erro desconhecido';
}

try {
  JSON.parse('{ inválido');
} catch (err) {
  console.log(mensagemDe(err));
  console.log(err.message); // ❌
}

const dias: string[] = ['seg', 'ter'];
const primeiro: string = dias[0];
console.log(primeiro, dias.length);`,
      notes: [ { l: '1-5', t: 'Qualquer valor pode ser lançado; por isso o catch é unknown e precisa ser estreitado.' }, { l: '11', t: 'Com strict, err.message direto é erro.' }, { l: '14-15', t: 'Sem noUncheckedIndexedAccess, dias[0] é string (mesmo se o array estiver vazio). Com a opção, passaria a ser string | undefined.' } ] },
    { title: 'Validar na fronteira: de unknown para um tipo', lang: 'typescript', code: R`interface Usuario {
  nome: string;
  idade: number;
}

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function ehUsuario(v: unknown): v is Usuario {
  return ehObjeto(v) && typeof v.nome === 'string' && typeof v.idade === 'number' && Number.isFinite(v.idade);
}

type Lido = { ok: true; usuario: Usuario } | { ok: false; erro: string };

function lerUsuario(texto: string): Lido {
  let dado: unknown;
  try {
    dado = JSON.parse(texto);
  } catch {
    return { ok: false, erro: 'JSON inválido' };
  }
  if (!ehUsuario(dado)) return { ok: false, erro: 'formato inesperado' };
  return { ok: true, usuario: dado };
}

const r = lerUsuario('{"nome":"Ana","idade":30}');
if (r.ok) console.log(r.usuario.nome.toUpperCase());`,
      notes: [ { l: '6-8', t: 'Primeiro guard: é um objeto que não é nulo nem array.' }, { l: '10-12', t: 'Segundo guard: confere cada campo em runtime antes de afirmar que é um Usuario.' }, { l: '17-25', t: 'JSON.parse falha ou devolve qualquer coisa; só depois do guard o dado vira Usuario.' }, { l: '28', t: 'O resto do programa recebe um Usuario confiável ou um erro descrito.' } ] },
    { title: 'import type e módulos', lang: 'typescript', code: R`import type { Dirent } from 'node:fs';
import { type Stats } from 'node:fs';

export interface Opcoes {
  verboso: boolean;
}

export function descrever(d: Dirent, s: Stats, o: Opcoes): string {
  return o.verboso ? d.name + ' ' + s.size : d.name;
}`,
      notes: [ { l: '1', t: 'import type traz apenas o tipo; a linha desaparece do JavaScript emitido.' }, { l: '2', t: 'A forma inline marca só um item como tipo.' }, { l: '4-6', t: 'Tipos e valores são exportados com a mesma sintaxe.' } ] }
  ],
  bestPractices: ['Comece todo projeto com strict e considere noUncheckedIndexedAccess.', 'Use unknown no catch e para qualquer dado externo.', 'Valide JSON, formulários e variáveis de ambiente em um único ponto de entrada e passe tipos confiáveis adiante.', 'Use import type para importar apenas tipos.', 'Rode tsc --noEmit no CI, mesmo que o bundler transpile.', 'Migre código JavaScript aos poucos, começando pelos módulos de domínio e pelas fronteiras.'],
  mistakes: ['Confiar em "as Tipo" para dados vindos de API ou JSON.', 'Desligar strict para "resolver" erros em vez de corrigi-los.', 'Ler err.message sem checar que err é um Error.', 'Achar que o bundler com transpilação também checa tipos.', 'Esquecer extensões nos imports quando module e moduleResolution exigem.', 'Escrever guards incompletos que conferem só um campo.'],
  market: `Toda equipe com TypeScript em produção tem uma política de tsconfig e de validação de dados externos, e erros de configuração (módulos, strict desligado, as em respostas de API) estão entre as causas mais frequentes de bugs de tipo "que passou no compilador". Saber validar na fronteira é um critério de senioridade.`,
  summary: `O tsconfig define o rigor da checagem: comece com strict e avalie noUncheckedIndexedAccess; escolha module e moduleResolution conforme Node.js ou bundler, e use noEmit quando outra ferramenta transpila. import type importa só tipos. No catch use unknown. Dados externos entram como unknown e são validados em runtime antes de virarem um tipo.`,
  refs: [REF.tsconfig, REF.modules, REF.narrowing],
  cards: [
    { q: 'Por que a variável do catch é unknown com strict?', a: 'Porque em JavaScript qualquer valor pode ser lançado; é preciso estreitar (por exemplo, com instanceof Error) antes de usá-lo.' },
    { q: 'O que o noUncheckedIndexedAccess faz?', a: 'Acrescenta undefined aos acessos por índice e por index signature, forçando a tratar o caso de a posição não existir. Não faz parte do strict.' },
    { q: 'O que o import type muda no JavaScript gerado?', a: 'Nada é emitido para essa importação: ela só existe para a checagem de tipos.' },
    { q: 'Por que validar JSON em runtime se há um tipo?', a: 'Porque tipos são apagados na compilação e o compilador não verifica o conteúdo recebido em execução.' }
  ]
}
];
