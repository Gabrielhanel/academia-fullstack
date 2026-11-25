// C1.4 — Paradigmas de programação. Aulas 1 a 3 (orientação a objetos e início de programação funcional).
const R = String.raw;

export const REF = {
  mdnClasses: { title: 'MDN — Classes (JavaScript)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes', kind: 'doc' },
  mdnPrivate: { title: 'MDN — Private elements (campos e métodos privados)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements', kind: 'doc' },
  mdnInherit: { title: 'MDN — Inheritance and the prototype chain', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain', kind: 'doc' },
  tsClasses: { title: 'TypeScript Handbook — Classes', url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html', kind: 'doc' },
  mdnFreeze: { title: 'MDN — Object.freeze()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze', kind: 'doc' },
  mdnStructuredClone: { title: 'MDN — structuredClone()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone', kind: 'doc' },
  mdnArray: { title: 'MDN — Array (métodos map, filter, reduce, toSorted, with)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array', kind: 'doc' },
  mdnFirstClass: { title: 'MDN — First-class Function (glossário)', url: 'https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function', kind: 'doc' },
  designPatterns: { title: 'Gamma, Helm, Johnson, Vlissides — Design Patterns (GoF, 1994)', kind: 'book' },
  cleanCode: { title: 'Martin — Clean Code (2008)', kind: 'book' }
};

export const lessonsA = [
{
  id: 'par-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['oop', 'classes', 'encapsulamento', 'abstração'],
  title: 'Orientação a objetos: objetos, classes e encapsulamento',
  objectives: ['Explicar objeto, classe, estado, comportamento e mensagem', 'Aplicar encapsulamento com campos privados (#) e invariantes validadas nos métodos', 'Distinguir abstração, interface pública e detalhe de implementação', 'Escrever classes em JavaScript com construtor, métodos, getters e métodos estáticos', 'Reconhecer quando um objeto é só um saco de dados e quando é um objeto de verdade'],
  intro: `A **orientação a objetos (OOP)** organiza o programa como um conjunto de **objetos** que guardam **estado** e oferecem **comportamento**, conversando por **mensagens** (chamadas de método). A ideia central não é "usar classes": é **proteger o estado** atrás de uma interface pequena para que o resto do sistema não dependa dos detalhes. Esta aula usa JavaScript (classes e campos privados) porque o código é executável em qualquer lugar, mas os conceitos valem para Java, Kotlin, C#, Python e TypeScript.`,
  theory: `### O que é um objeto
Um **objeto** junta dois tipos de coisa que, na programação procedural, ficam separadas:
- **estado**: os dados que ele guarda (saldo de uma conta, itens de um carrinho);
- **comportamento**: o que ele sabe fazer com esses dados (depositar, sacar, adicionar item).

Uma **classe** é a descrição de um tipo de objeto (a "forma"); cada objeto criado a partir dela é uma **instância**. Em JavaScript, §class§ é uma sintaxe sobre protótipos (aula seguinte), mas o modelo mental é o mesmo.

### Encapsulamento: o pilar que importa
**Encapsulamento** é esconder o estado interno e expor só operações que preservam as **invariantes** (regras que sempre devem ser verdade, como "o saldo nunca fica negativo por um saque"). Se qualquer parte do código pode fazer §conta.saldo = -50§, a regra vira uma convenção que alguém vai quebrar. Se o saldo é privado e só muda por §depositar§ e §sacar§, a regra fica **em um lugar só**.

Em JavaScript moderno:
- campos e métodos **privados** usam o prefixo §#§ (§#saldo§). O acesso de fora é um **erro de sintaxe**, não só uma convenção;
- **getters** (§get saldo()§) expõem leitura sem permitir escrita (em módulos, que são estritos, atribuir a um getter sem setter lança §TypeError§);
- §static§ declara membros da classe, não da instância (fábricas, constantes).

### Abstração e interface pública
**Abstração** é mostrar o essencial e esconder o resto. A **interface pública** de uma classe é o contrato com quem a usa: nomes, parâmetros, erros possíveis. O restante (campos, algoritmos) pode mudar sem quebrar ninguém. Perguntas úteis ao projetar uma classe:
1. Qual é a **responsabilidade** dela, em uma frase?
2. Que **invariantes** ela garante?
3. Quais operações o mundo externo precisa **de verdade**? (menos é melhor)
4. Dá para trocar a implementação sem alterar quem usa?

### "Tell, don't ask"
Em vez de **perguntar** o estado e decidir fora (§if (conta.saldo >= v) conta.saldo -= v§), **peça** a operação ao objeto (§conta.sacar(v)§). A regra fica junto dos dados e não se espalha por todos os chamadores. Isso também evita a **lógica duplicada** em cada tela ou serviço que mexe na conta.

### Objeto x estrutura de dados
Nem tudo precisa ser um objeto com métodos. Um **registro de dados** (por exemplo, o JSON de uma resposta HTTP, ou §{ x, y }§) expõe os dados e não tem regras. Um **objeto** esconde os dados e expõe comportamento. Misturar os dois produz classes com getters e setters para tudo ("modelo anêmico"), que têm o custo das classes sem o benefício do encapsulamento. Regra prática: se a classe não protege nenhuma invariante, talvez seja só um registro.

### Mensagens, identidade e igualdade
Objetos têm **identidade** (dois objetos com os mesmos dados ainda são dois objetos; §===§ compara referências) e, se precisar de igualdade por valor, você define um método §equals§ ou usa **objetos de valor** imutáveis (dinheiro, datas, coordenadas). Objetos de valor são ótimos: sem identidade, sem mutação, fáceis de testar.

### Exemplo de decisão de projeto
Imagine um carrinho de compras. Se qualquer parte do código pode alterar §carrinho.itens§ diretamente, a regra "quantidade máxima por item" precisa ser repetida em cada tela. Se o carrinho expõe §adicionar(produto, qtd)§ e §remover(produto)§ e mantém a lista privada, a regra mora em um método, os testes ficam pequenos e a tela só precisa saber **o que** pedir, não **como** o carrinho se organiza. Quando o carrinho precisar de um limite novo, só a classe muda.

### Custos e cuidados
- Estado mutável compartilhado complica o raciocínio e a concorrência (aula 5).
- Hierarquias profundas são difíceis de mudar (aula 2).
- Em JavaScript, métodos perdem o §this§ quando passados como callback (§botao.onclick = obj.metodo§); use função de seta ou §bind§.
- Campos privados com §#§ não aparecem em §Object.keys§ nem em §JSON.stringify§, o que ajuda a não vazar estado, mas exige expor uma representação explícita (§toJSON§).`,
  concepts: [
    { term: 'Objeto', def: 'Entidade que agrupa estado (dados) e comportamento (métodos) e responde a mensagens.' },
    { term: 'Classe', def: 'Descrição de um tipo de objeto; as instâncias são criadas a partir dela.' },
    { term: 'Encapsulamento', def: 'Esconder o estado interno e expor operações que preservam as invariantes.' },
    { term: 'Invariante', def: 'Regra que deve ser sempre verdadeira para o estado válido de um objeto.' },
    { term: 'Abstração', def: 'Expor o essencial por uma interface pública e ocultar os detalhes de implementação.' },
    { term: 'Campo privado (#)', def: 'Membro de classe acessível só dentro da própria classe; acesso externo é erro de sintaxe.' },
    { term: 'Tell, don\'t ask', def: 'Pedir ao objeto que execute a operação em vez de consultar o estado e decidir fora dele.' },
    { term: 'Objeto de valor', def: 'Objeto imutável comparado pelos valores, sem identidade própria (dinheiro, coordenada).' },
    { term: 'Modelo anêmico', def: 'Classes só com dados e getters/setters, com a lógica espalhada em serviços.' }
  ],
  examples: R`**Analogia:** uma conta bancária é um **cofre com guichê**. Você não abre o cofre: pede ao atendente (métodos) para depositar ou sacar, e ele aplica as regras (saldo suficiente, valor positivo). Se qualquer pessoa pudesse mexer direto no cofre, as regras seriam só avisos na parede.

**Caso 1: a regra "saque não passa do saldo" em um lugar só.** Na classe abaixo o saldo é privado. O código executado em Node.js 26 imprimiu:
§§§
70 [ 'deposito:100', 'saque:30' ]
saldo insuficiente
true [ 'titular' ] number
SyntaxError
TypeError
§§§
- o saldo ficou 70 depois de depositar 100 e sacar 30;
- sacar 500 lançou "saldo insuficiente" e o estado não mudou;
- §Object.keys§ só mostra §titular§ (o campo privado não aparece);
- ler §c.#saldo§ de fora é **SyntaxError** (testado com §eval§);
- atribuir §c.saldo = 999§ lançou **TypeError** (getter sem setter, em módulo).

**Caso 2: "tell, don't ask".** O chamador não verifica o saldo; só pede §sacar§ e trata a exceção. Quando a regra mudar (limite de cheque especial), só a classe muda.

**Caso 3: objeto de valor.** §Dinheiro§ com §centavos§ inteiros, método §somar§ que devolve um **novo** objeto, evita erros de ponto flutuante (§0.1 + 0.2§) e mutação acidental.`,
  code: [
    { title: 'Classe com campos privados e invariantes (executado com Node.js 26)', lang: 'javascript', code: R`class ContaBancaria {
  #saldo = 0;
  #historico = [];
  constructor(titular) { this.titular = titular; }
  depositar(v) {
    if (!(v > 0)) throw new RangeError('valor deve ser positivo');
    this.#saldo += v; this.#historico.push({ tipo: 'deposito', v });
    return this;
  }
  sacar(v) {
    if (v > this.#saldo) throw new Error('saldo insuficiente');
    this.#saldo -= v; this.#historico.push({ tipo: 'saque', v });
    return this;
  }
  get saldo() { return this.#saldo; }
  extrato() { return this.#historico.map((h) => §DOLAR{h.tipo}:DOLAR{h.v}§); }
}
const c = new ContaBancaria('Ana').depositar(100).sacar(30);
console.log(c.saldo, c.extrato());
try { c.sacar(500); } catch (e) { console.log(e.message); }
console.log(c.saldo === 70, Object.keys(c), typeof c.saldo);`, notes: [{ l: '2', t: 'O prefixo # torna o campo privado; só métodos da classe o alteram.' }, { l: '6', t: 'A invariante (valor positivo) é validada na entrada; o estado nunca fica inválido.' }, { l: '8', t: 'Retornar this permite encadear chamadas (interface fluente).' }, { l: '15', t: 'O getter expõe leitura sem permitir escrita direta.' }, { l: '21', t: 'Saída observada: 70 [ \'deposito:100\', \'saque:30\' ].' }] },
    { title: 'Objeto de valor imutável (centavos inteiros)', lang: 'javascript', code: R`class Dinheiro {
  #centavos;
  constructor(centavos) {
    if (!Number.isInteger(centavos)) throw new TypeError('use centavos inteiros');
    this.#centavos = centavos; Object.freeze(this);
  }
  static deReais(r) { return new Dinheiro(Math.round(r * 100)); }
  somar(o) { return new Dinheiro(this.#centavos + o.#centavos); }
  equals(o) { return o instanceof Dinheiro && o.#centavos === this.#centavos; }
  toString() { return 'R$ ' + (this.#centavos / 100).toFixed(2); }
}
console.log(0.1 + 0.2, String(Dinheiro.deReais(0.1).somar(Dinheiro.deReais(0.2))));
console.log(Dinheiro.deReais(1).equals(new Dinheiro(100)));`, notes: [{ l: '5', t: 'Object.freeze(this) impede adicionar propriedades; o valor privado já não muda.' }, { l: '7', t: 'Método estático como fábrica nomeada.' }, { l: '8', t: 'somar devolve um novo objeto (imutabilidade).' }, { l: '13', t: 'Saída observada: 0.30000000000000004 e R$ 0.30; depois true.' }] }
  ],
  bestPractices: ['Torne privado tudo o que não precisa ser público e proteja as invariantes nos métodos.', 'Prefira "tell, don\'t ask": peça a operação ao objeto em vez de decidir fora com base no estado.', 'Use objetos de valor imutáveis para dinheiro, datas e coordenadas.', 'Mantenha a interface pública pequena e estável; esconda a representação interna.', 'Valide na fronteira (construtor e métodos) e falhe cedo com erros claros.', 'Escreva testes pela interface pública, não pelos campos internos.'],
  mistakes: ['Expor todos os campos com getters e setters, sem proteger nenhuma regra.', 'Duplicar a regra de negócio em cada chamador em vez de colocá-la no objeto.', 'Usar classes para tudo, inclusive registros de dados simples.', 'Perder o §this§ ao passar um método como callback.', 'Guardar dinheiro em número de ponto flutuante.', 'Retornar a lista interna mutável em vez de uma cópia ou de uma visão somente leitura.'],
  market: `Entrevistas e revisões de código perguntam sobre encapsulamento, responsabilidade única e quando usar (ou não) classes. Java, Kotlin, C# e TypeScript dominam backends corporativos e usam esse modelo diariamente; frameworks como Spring, NestJS e Angular são construídos sobre objetos e injeção de dependência. Saber projetar uma interface pública pequena e proteger invariantes é a base de bom design em qualquer linguagem.`,
  summary: `Objeto = estado + comportamento. Encapsulamento esconde o estado e expõe operações que preservam invariantes; em JavaScript, use campos §#§ e getters. Abstração é uma interface pública pequena e estável. Prefira "tell, don't ask", use objetos de valor imutáveis e não transforme registros de dados em classes sem regras. Cuidado com o §this§ em callbacks e com estruturas internas mutáveis expostas.`,
  refs: [REF.mdnClasses, REF.mdnPrivate, REF.tsClasses, REF.cleanCode],
  cards: [
    { q: 'O que o encapsulamento protege?', a: 'As invariantes do estado: o objeto só muda por operações que garantem que as regras continuem verdadeiras.' },
    { q: 'O que significa "tell, don\'t ask"?', a: 'Pedir ao objeto que faça a operação em vez de consultar seu estado e decidir fora dele.' },
    { q: 'Como tornar um campo privado em JavaScript?', a: 'Prefixando o nome com # (por exemplo, #saldo); o acesso externo é erro de sintaxe.' },
    { q: 'Quando preferir um objeto de valor?', a: 'Quando o conceito não tem identidade e é definido pelos valores: dinheiro, datas, coordenadas. Deve ser imutável.' }
  ]
},
{
  id: 'par-02', moduleId: 'm1', order: 2, minutes: 60, tags: ['oop', 'herança', 'composição', 'polimorfismo'],
  title: 'Herança, composição, polimorfismo e injeção de dependência',
  objectives: ['Explicar herança, polimorfismo e a cadeia de protótipos do JavaScript', 'Escolher entre herança e composição com critérios (é-um x tem-um)', 'Usar polimorfismo por contrato (interfaces e duck typing) para eliminar condicionais por tipo', 'Aplicar injeção de dependência para trocar implementações e testar', 'Reconhecer o problema da classe base frágil e os acoplamentos da herança'],
  intro: `Com objetos encapsulados, a pergunta seguinte é: **como reutilizar e variar comportamento**? A resposta clássica é a **herança**, mas a experiência de décadas mostra que, na maioria dos casos, **composição** e **polimorfismo por contrato** dão sistemas mais fáceis de mudar. Esta aula mostra as duas abordagens com código executado, explica por que a herança "quebra" em certas situações e como a **injeção de dependência** liga as peças sem acoplá-las.`,
  theory: `### Herança e a cadeia de protótipos
**Herança** (§class B extends A§) faz B reutilizar e especializar o comportamento de A. Em JavaScript, cada objeto tem um **protótipo**: se uma propriedade não existe no objeto, a busca continua no protótipo, e assim por diante (a **cadeia de protótipos**). §class§ e §extends§ configuram essa cadeia. §super.metodo()§ chama a versão do pai.

Use herança quando existe uma relação **é-um** genuína **e** o filho pode ser usado em todo lugar onde o pai é esperado sem surpresas (princípio de substituição de Liskov, que a C5 aprofunda). Um §Cachorro§ **é um** §Animal§; mas uma §Pilha§ que herda de §Array§ **não** deveria permitir §splice§ no meio.

### Os problemas da herança
1. **Acoplamento forte**: o filho depende dos detalhes do pai. Mudar o pai pode quebrar todos os filhos.
2. **Classe base frágil**: no exemplo executado, §Contada§ herda de §Lista§ e sobrescreve §add§ e §addTodos§ para contar itens. Como §addTodos§ do pai chama §this.add§, o filho conta cada item **duas vezes**: o resultado foi **total 6 para 3 itens**.
3. **Hierarquias profundas** e **explosão de combinações** (§AnimalVoadorNadador§...): cada nova variação pede uma nova subclasse.
4. **Reuso de implementação** disfarçado de relação de tipo: herdar só para aproveitar código cria "é-um" falsos.

### Composição: "tem-um" e "faz-uso-de"
**Composição** monta comportamento combinando objetos menores, cada um com uma responsabilidade. No exemplo, §podeVoar§ e §podeNadar§ são funções que produzem comportamento e o §pato§ as combina com §Object.assign§. A combinação é decidida em tempo de montagem, sem hierarquia. A diretriz clássica do livro *Design Patterns* é **"prefira composição a herança"**.

### Polimorfismo
**Polimorfismo** é tratar objetos diferentes pela **mesma interface**. Há dois jeitos comuns:
- **por herança** (subclasses sobrescrevem um método);
- **por contrato** (qualquer objeto que tenha os métodos esperados serve; em JavaScript é o *duck typing*; em TypeScript, §interface§; em Java/Kotlin, §interface§).

Ele elimina cadeias de §if (tipo === ...)§: em vez de perguntar o tipo e decidir, **cada objeto sabe como executar a operação**. Exemplo: uma lista de formas com método §area()§ é somada sem saber quais são círculos ou quadrados. Adicionar uma forma nova **não** altera o código que soma.

### Injeção de dependência (DI)
Uma classe que cria suas próprias dependências (§new SmtpMailer()§ dentro do construtor) fica presa a elas. Na **injeção de dependência**, quem usa **recebe** a dependência de fora (construtor ou parâmetro), conhecendo só o **contrato**. Benefícios:
- **testabilidade**: no teste, injeta-se um *fake* (no exemplo, §fake.enviado§ guardou a mensagem);
- **troca de implementação** sem mexer na classe (e-mail por SMS);
- **fronteiras claras** entre módulos.
DI não exige framework: passar argumentos já é DI. Contêineres (Spring, NestJS) automatizam a montagem em sistemas grandes.

### Como decidir
| Pergunta | Se sim |
|---|---|
| O filho pode substituir o pai em qualquer lugar sem quebrar? | herança é aceitável |
| Só quero reaproveitar código? | composição ou função auxiliar |
| O comportamento varia por tipo? | polimorfismo por contrato |
| A dependência é externa (banco, e-mail, relógio)? | injete-a |
| A hierarquia passaria de 2 ou 3 níveis? | reveja o desenho |

### Em TypeScript
§interface§ e §abstract class§ declaram contratos checados em compilação; §implements§ garante que a classe cumpre a interface. Os tipos não existem em tempo de execução, mas evitam muitos erros de integração.`,
  concepts: [
    { term: 'Herança', def: 'Mecanismo em que uma classe reutiliza e especializa outra (extends).' },
    { term: 'Cadeia de protótipos', def: 'Sequência de objetos consultados quando uma propriedade não é encontrada no objeto.' },
    { term: 'Polimorfismo', def: 'Tratar objetos diferentes pela mesma interface, cada um com sua implementação.' },
    { term: 'Composição', def: 'Montar comportamento combinando objetos menores (relação tem-um).' },
    { term: 'Classe base frágil', def: 'Problema em que mudanças na classe pai quebram filhos que dependem de seus detalhes.' },
    { term: 'Duck typing', def: 'Aceitar qualquer objeto que tenha os métodos esperados, sem checar o tipo declarado.' },
    { term: 'Injeção de dependência', def: 'Receber as dependências de fora (construtor ou parâmetro) em vez de criá-las internamente.' },
    { term: 'Fake / test double', def: 'Implementação simplificada usada em testes no lugar da dependência real.' },
    { term: 'Princípio de substituição de Liskov', def: 'Um subtipo deve poder ser usado onde o tipo base é esperado sem alterar a correção do programa.' }
  ],
  examples: R`**Analogia:** herança é **herdar a receita da família**: você recebe tudo, inclusive o que não queria, e qualquer mudança da avó afeta todos. Composição é **montar um prato** escolhendo ingredientes: troca-se um item sem refazer a receita inteira.

**Caso 1: classe base frágil (executado).** O resultado impresso foi §6 3§: o filho contou 6 itens para uma lista de 3. A correção é **compor** em vez de herdar (guardar uma §Lista§ dentro de §Contada§ e delegar), assim a contagem não depende de como o pai chama seus próprios métodos.

**Caso 2: composição.** §Object.assign(pato, podeVoar(pato), podeNadar(pato))§ produziu "Pato voa" e "Pato nada" sem hierarquia.

**Caso 3: polimorfismo.** Duas formas com §area()§ foram tratadas igualmente: §9.00§ e §12.57§.

**Caso 4: DI.** O §Notificador§ recebeu um canal falso e o teste conferiu §['oi']§ sem enviar nada de verdade.`,
  code: [
    { title: 'Herança, super e a armadilha da classe base frágil (executado com Node.js 26)', lang: 'javascript', code: R`class Animal { constructor(n) { this.nome = n; } falar() { return §DOLAR{this.nome} faz um som§; } }
class Cachorro extends Animal { falar() { return §DOLAR{super.falar()}: au§; } }
console.log(new Cachorro('Rex').falar());

class Lista {
  constructor() { this.itens = []; }
  add(x) { this.itens.push(x); }
  addTodos(xs) { xs.forEach((x) => this.add(x)); }
}
class Contada extends Lista {
  total = 0;
  add(x) { this.total++; super.add(x); }
  addTodos(xs) { this.total += xs.length; super.addTodos(xs); }
}
const l = new Contada(); l.addTodos([1, 2, 3]);
console.log(l.total, l.itens.length);`, notes: [{ l: '2', t: 'super.falar() chama a versão da classe pai.' }, { l: '5', t: 'addTodos do pai chama this.add, que no filho já conta.' }, { l: '12', t: 'addTodos do filho também soma xs.length: contagem em dobro.' }, { l: '16', t: 'Saída observada: "Rex faz um som: au" e depois 6 3.' }] },
    { title: 'Composição, polimorfismo por contrato e injeção de dependência (executado)', lang: 'javascript', code: R`const podeVoar = (s) => ({ voar: () => §DOLAR{s.nome} voa§ });
const podeNadar = (s) => ({ nadar: () => §DOLAR{s.nome} nada§ });
const pato = { nome: 'Pato' };
Object.assign(pato, podeVoar(pato), podeNadar(pato));
console.log(pato.voar(), pato.nadar());

const formas = [{ area: () => 3 * 3 }, { area: () => Math.PI * 2 ** 2 }];
console.log(formas.map((f) => f.area().toFixed(2)));

class Notificador {
  constructor(canal) { this.canal = canal; }
  avisar(m) { return this.canal.enviar(m); }
}
const fake = { enviado: [], enviar(m) { this.enviado.push(m); return true; } };
new Notificador(fake).avisar('oi');
console.log(fake.enviado);`, notes: [{ l: '4', t: 'Comportamentos combinados sem hierarquia de classes.' }, { l: '8', t: 'Qualquer objeto com area() serve: polimorfismo por contrato.' }, { l: '11', t: 'O Notificador depende só do contrato enviar(m).' }, { l: '15', t: 'Saídas observadas: "Pato voa Pato nada", [ \'9.00\', \'12.57\' ] e [ \'oi\' ].' }] }
  ],
  bestPractices: ['Prefira composição; use herança só para relações é-um estáveis e substituíveis.', 'Mantenha hierarquias rasas (no máximo 2 ou 3 níveis) e documente os métodos que podem ser sobrescritos.', 'Substitua condicionais por tipo por polimorfismo.', 'Injete dependências externas (rede, banco, relógio, aleatoriedade) para poder testar.', 'Programe para contratos (interfaces), não para implementações concretas.', 'Evite que a classe pai chame métodos sobrescritíveis nos seus próprios fluxos sem documentar.'],
  mistakes: ['Herdar só para reaproveitar código, criando relações é-um falsas.', 'Sobrescrever vários métodos que se chamam entre si sem entender a implementação do pai.', 'Criar dependências com §new§ dentro das classes de negócio.', 'Usar §instanceof§ em cadeia no lugar de polimorfismo.', 'Hierarquias profundas com muitas subclasses para combinações de recursos.', 'Injetar tudo via contêiner global (service locator), escondendo as dependências.'],
  market: `Em revisões de código e entrevistas, "herança ou composição?" e "como você testaria isso?" aparecem com frequência. Frameworks populares (Spring, NestJS, Angular, ASP.NET) dependem de injeção de dependência; projetos legados sofrem com hierarquias profundas. Quem sabe justificar a escolha e refatorar herança para composição é valorizado.`,
  summary: `Herança reutiliza e especializa, mas acopla o filho ao pai e sofre com classe base frágil; use para relações é-um substituíveis. Composição monta comportamentos com objetos pequenos e é, em geral, mais flexível. Polimorfismo por contrato substitui condicionais por tipo. Injeção de dependência recebe as dependências de fora, permitindo trocar implementações e testar com fakes.`,
  refs: [REF.mdnInherit, REF.mdnClasses, REF.tsClasses, REF.designPatterns],
  cards: [
    { q: 'Qual o risco da "classe base frágil"?', a: 'Mudanças ou detalhes de implementação do pai quebram os filhos que dependem deles (por exemplo, métodos que chamam uns aos outros).' },
    { q: 'Quando a herança é aceitável?', a: 'Quando há relação é-um e o filho pode substituir o pai em qualquer uso sem surpresas.' },
    { q: 'O que a injeção de dependência facilita?', a: 'Testar com fakes e trocar implementações sem alterar a classe que usa a dependência.' },
    { q: 'Como o polimorfismo elimina condicionais por tipo?', a: 'Cada objeto implementa a operação; quem chama usa a interface comum sem checar o tipo.' }
  ]
},
{
  id: 'par-03', moduleId: 'm2', order: 3, minutes: 60, tags: ['funcional', 'funções puras', 'imutabilidade', 'map', 'reduce'],
  title: 'Programação funcional: funções puras, imutabilidade e transformação de dados',
  objectives: ['Definir função pura e efeito colateral e identificar os dois no código', 'Aplicar imutabilidade com cópia, spread e métodos não destrutivos (toSorted, with)', 'Transformar dados com map, filter, reduce e agrupamentos', 'Explicar transparência referencial e por que ela facilita testes e raciocínio', 'Conhecer os limites de Object.freeze (superficial) e quando clonar (structuredClone)'],
  intro: `A **programação funcional (FP)** constrói programas combinando **funções** que recebem dados e devolvem dados, evitando alterar o que já existe. Em vez de uma sequência de mudanças de estado, o programa é uma **cadeia de transformações**. Isso reduz bugs de estado compartilhado, facilita testes e combina bem com concorrência (aula 5). JavaScript não é puramente funcional, mas suporta o estilo muito bem: funções são valores, e arrays têm §map§, §filter§ e §reduce§.`,
  theory: `### Função pura
Uma função é **pura** quando:
1. com as **mesmas entradas devolve sempre a mesma saída**; e
2. **não tem efeitos colaterais** (não altera variáveis externas, não escreve em disco, não imprime, não muda os argumentos).

No exemplo executado, §pura(n)§ devolveu §2 2§ para duas chamadas com 1, enquanto a impura que incrementa um contador externo devolveu §1 2§: a saída dependeu do histórico.

**Efeitos colaterais** (rede, arquivo, data atual, aleatoriedade, console) são inevitáveis; a prática funcional é **empurrá-los para as bordas** e manter o miolo do programa puro. O núcleo calcula; a casca executa.

### Transparência referencial
Uma expressão é **referencialmente transparente** se puder ser substituída pelo seu valor sem mudar o programa. Funções puras têm essa propriedade, e é ela que permite **memoização** (guardar resultados), testes sem preparação e raciocínio local ("só preciso ler esta função").

### Imutabilidade
**Imutável** = não se altera depois de criado; "mudanças" geram **novos valores**. Técnicas em JavaScript:
- **spread** (§{ ...obj, campo: novo }§, §[...lista, x]§): cópia rasa com alteração;
- métodos **não destrutivos** de array: §toSorted§, §toReversed§, §toSpliced§, §with§ (os destrutivos, como §sort§, §reverse§ e §splice§, mudam o original);
- **§Object.freeze§**: impede alterar o objeto, mas é **superficial**. No exemplo, o campo §a§ não mudou (atribuição em módulo estrito lançou **TypeError**), porém §aninhado.b§ foi alterado para 99;
- **§structuredClone§**: cópia **profunda** de dados simples (não copia funções).
Cuidado: cópia rasa compartilha objetos aninhados. Alterar um item aninhado da "cópia" muda o original.

Por que imutabilidade ajuda: bugs de "quem mudou isso?" desaparecem, comparar versões fica barato (compara-se a referência, base de bibliotecas de estado de interface) e dados compartilhados entre tarefas concorrentes ficam seguros.

### Transformar dados: map, filter, reduce
- §map(f)§: transforma cada item (mesmo tamanho);
- §filter(p)§: mantém os itens que satisfazem o predicado;
- §reduce(f, inicial)§: acumula tudo em um valor (soma, objeto, mapa). **Sempre passe o valor inicial**; sem ele, array vazio lança erro.
Com os números 1 a 6, §filter(par).map(quadrado).reduce(soma)§ deu **56** (4 + 16 + 36).
Outros úteis: §flatMap§, §some§, §every§, §find§, §Object.groupBy§ (agrupar, no Node.js 22 ou superior; devolve objeto sem protótipo), §Map§ e §Set§.

### Declarativo x imperativo
**Imperativo**: diz **como** (laço, índice, acumulador mutável). **Declarativo**: diz **o que** se quer (§itens.filter(...).map(...)§). O declarativo costuma ser mais curto e legível, mas não é sempre melhor: um laço simples pode ser mais claro e rápido que uma cadeia de cinco funções. Meça antes de otimizar; cadeias criam arrays intermediários.

### Um exemplo completo de refatoração
Uma função impura que "aplica desconto" altera o preço de cada item da lista recebida e imprime uma mensagem. Para torná-la pura: (1) receba a lista e a regra como argumentos; (2) devolva uma **nova** lista com os preços novos (§itens.map((i) => ({ ...i, preco: regra(i.preco) }))§); (3) deixe a impressão para quem chamou. O resultado é testável com uma simples comparação de valores, pode ser chamado em qualquer ordem e não depende do estado do programa.

### Dados primeiro
FP trabalha bem com **estruturas simples** (objetos, arrays, mapas) e funções que as transformam, em vez de objetos com muito estado escondido. Isso aproxima FP de **modelar o domínio com tipos de dados** (uniões discriminadas em TypeScript) e funções sobre eles.

### Limites e custos
- Imutabilidade tem custo de cópia; para estruturas enormes, use estruturas persistentes (bibliotecas) ou mutação local controlada (dentro de uma função, desde que não vaze).
- Pureza total é impossível: o programa precisa ler e escrever no mundo.
- Em JavaScript nada impede mutação; imutabilidade é **disciplina** (e TypeScript ajuda com §readonly§ e §as const§).`,
  concepts: [
    { term: 'Função pura', def: 'Função que, para as mesmas entradas, devolve a mesma saída e não produz efeitos colaterais.' },
    { term: 'Efeito colateral', def: 'Qualquer interação com o mundo externo ou mudança de estado fora da função.' },
    { term: 'Transparência referencial', def: 'Propriedade de poder substituir a expressão pelo seu valor sem alterar o programa.' },
    { term: 'Imutabilidade', def: 'Dados que não são alterados após criados; mudanças geram novos valores.' },
    { term: 'Cópia rasa', def: 'Cópia que duplica só o primeiro nível; objetos aninhados continuam compartilhados.' },
    { term: 'map / filter / reduce', def: 'Transformar cada item, selecionar itens e acumular em um valor, respectivamente.' },
    { term: 'Declarativo', def: 'Estilo que descreve o que se quer obter, em vez de como calcular passo a passo.' },
    { term: 'structuredClone', def: 'Função que cria uma cópia profunda de dados serializáveis.' }
  ],
  examples: R`**Analogia:** uma função pura é uma **máquina de suco**: coloca a fruta, sai o suco; a máquina não muda de estado nem a cozinha. Uma função impura é um **garçom que anota pedidos num caderno compartilhado**: o resultado depende do que os outros escreveram antes.

**Caso 1: carrinho sem mutação.** Dois itens custam 10×2 + 5×1 = **25**. Ao criar §novo§ com um terceiro item (1×3), o pedido original continuou com **2 itens** e o novo tem **3** (total **28**). Quem guardou o pedido original não foi surpreendido.

**Caso 2: freeze superficial.** §congelado.aninhado.b = 99§ funcionou: o resultado impresso foi §1 99§. Para imutabilidade profunda, congele recursivamente, use §structuredClone§ para copiar ou trate os dados como somente leitura por convenção e tipos.

**Caso 3: ordenar sem alterar.** §nums.toSorted((a, b) => b - a)§ devolveu §[6,5,4,3,2,1]§ e o original ficou §[1,...,6]§; §nums.with(0, 100)§ trocou o primeiro item só na cópia.

**Caso 4: agrupar.** Agrupar por resto da divisão por 3 deu §{ '0': [3,6], '1': [1,4], '2': [2,5] }§.`,
  code: [
    { title: 'Transformações e imutabilidade (executado com Node.js 26)', lang: 'javascript', code: R`const pedido = { id: 1, itens: [{ n: 'a', p: 10, q: 2 }, { n: 'b', p: 5, q: 1 }] };
const total = (it) => it.reduce((s, i) => s + i.p * i.q, 0);
console.log(total(pedido.itens));                                  // 25
const novo = { ...pedido, itens: [...pedido.itens, { n: 'c', p: 1, q: 3 }] };
console.log(pedido.itens.length, novo.itens.length, total(novo.itens)); // 2 3 28

const nums = [1, 2, 3, 4, 5, 6];
console.log(nums.filter((n) => n % 2 === 0).map((n) => n * n).reduce((a, b) => a + b, 0)); // 56
console.log(nums.toSorted((a, b) => b - a), nums, nums.with(0, 100));

const agrupar = (xs, f) => xs.reduce((m, x) => { const k = f(x); (m[k] ??= []).push(x); return m; }, {});
console.log(agrupar(nums, (n) => n % 3));`, notes: [{ l: '2', t: 'Sempre informe o valor inicial do reduce (0).' }, { l: '4', t: 'Spread cria um novo objeto e uma nova lista; o pedido original não muda.' }, { l: '9', t: 'toSorted e with devolvem novas listas (Node.js 20 ou superior).' }, { l: '11', t: 'O operador ??= cria a lista do grupo na primeira vez.' }] },
    { title: 'Pura x impura e os limites do freeze (executado)', lang: 'javascript', code: R`let c = 0;
const impura = () => ++c;
const pura = (n) => n + 1;
console.log(impura(), impura());   // 1 2
console.log(pura(1), pura(1));     // 2 2

const congelado = Object.freeze({ a: 1, aninhado: { b: 2 } });
try { congelado.a = 9; } catch (e) { console.log(e.constructor.name); } // TypeError (módulo estrito)
congelado.aninhado.b = 99;
console.log(congelado.a, congelado.aninhado.b);  // 1 99
const copia = structuredClone(congelado); copia.aninhado.b = 0;
console.log(congelado.aninhado.b, copia.aninhado.b);  // 99 0`, notes: [{ l: '4', t: 'A impura depende do histórico de chamadas.' }, { l: '8', t: 'Em módulos (modo estrito), atribuir a propriedade congelada lança TypeError; fora do modo estrito falha em silêncio.' }, { l: '9', t: 'O freeze é superficial: o objeto aninhado continua mutável.' }, { l: '11', t: 'structuredClone gera uma cópia profunda e independente (e sem o freeze).' }] }
  ],
  bestPractices: ['Mantenha o núcleo do programa puro e empurre efeitos colaterais para as bordas.', 'Não altere argumentos recebidos; devolva novos valores.', 'Use §toSorted§, §with§ e spread em vez de §sort§ e atribuições diretas em dados compartilhados.', 'Sempre passe valor inicial ao §reduce§.', 'Use §structuredClone§ para cópias profundas de dados simples; saiba que o freeze é raso.', 'Escolha o estilo mais legível: nem tudo precisa virar cadeia de funções.'],
  mistakes: ['Chamar §sort§ ou §reverse§ em estado compartilhado e alterar o original sem perceber.', 'Esperar que §Object.freeze§ proteja objetos aninhados.', 'Usar §reduce§ sem valor inicial em listas que podem estar vazias.', 'Cadeias enormes de §map§/§filter§ em arrays grandes sem medir o custo.', 'Misturar leitura de relógio, aleatoriedade e rede dentro da lógica de cálculo.', 'Copiar com spread e achar que a cópia é profunda.'],
  market: `Estilo funcional está em tudo: Array.prototype em JavaScript, streams em Java e Kotlin, LINQ em C#, Rust e Scala. Bibliotecas de estado de interface (React e outras) assumem imutabilidade para comparar referências. Funções puras são a forma mais barata de ter testes confiáveis, o que equipes procuram.`,
  summary: `Função pura: mesma entrada, mesma saída, sem efeitos colaterais. Isso dá transparência referencial, testes fáceis e raciocínio local. Imutabilidade: crie novos valores com spread e métodos não destrutivos; o freeze é raso. Transforme dados com map, filter, reduce e agrupamentos, com valor inicial no reduce. Efeitos colaterais ficam nas bordas; o estilo declarativo é uma ferramenta, não uma obrigação.`,
  refs: [REF.mdnArray, REF.mdnFreeze, REF.mdnStructuredClone, REF.mdnFirstClass],
  cards: [
    { q: 'O que é uma função pura?', a: 'Para as mesmas entradas devolve sempre a mesma saída e não produz efeitos colaterais.' },
    { q: 'Object.freeze protege objetos aninhados?', a: 'Não; é superficial. Só o primeiro nível fica congelado.' },
    { q: 'Qual a diferença entre sort e toSorted?', a: 'sort altera o array original; toSorted devolve uma nova lista ordenada e preserva o original.' },
    { q: 'Por que passar valor inicial ao reduce?', a: 'Define o tipo do acumulador e evita erro em listas vazias.' }
  ]
}
];
