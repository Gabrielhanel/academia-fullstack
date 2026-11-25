// C1.3 — Ferramentas do desenvolvedor e expressões regulares. Aulas 6 a 8 (expressões regulares em JavaScript).
const R = String.raw;

export const REF3 = {
  mdnRegexGuide: { title: 'MDN — Regular expressions (guia de JavaScript)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions', kind: 'doc' },
  mdnRegexRef: { title: 'MDN — RegExp (referência)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp', kind: 'doc' },
  mdnCheatsheet: { title: 'MDN — Regular expression syntax cheatsheet', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet', kind: 'doc' },
  mdnClasses: { title: 'MDN — Character classes', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes', kind: 'doc' },
  mdnQuantifiers: { title: 'MDN — Quantifiers', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers', kind: 'doc' },
  mdnGroups: { title: 'MDN — Groups and backreferences', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Groups_and_backreferences', kind: 'doc' },
  mdnAssertions: { title: 'MDN — Assertions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions', kind: 'doc' },
  mdnReplace: { title: 'MDN — String.prototype.replace()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace', kind: 'doc' },
  mdnMatchAll: { title: 'MDN — String.prototype.matchAll()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll', kind: 'doc' },
  owaspRedos: { title: 'OWASP — Regular expression Denial of Service (ReDoS)', url: 'https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS', kind: 'doc' },
  ecmaRegexp: { title: 'ECMAScript Language Specification (TC39) — Regular expression objects', url: 'https://tc39.es/ecma262/#sec-regexp-regular-expression-objects', kind: 'spec' },
};

export const lessonsC = [
{
  id: 'fer-06', moduleId: 'm3', order: 6, minutes: 75, tags: ['regex', 'javascript', 'texto', 'validacao'],
  title: 'Expressões regulares: literais, classes e quantificadores',
  objectives: ['Ler e escrever padrões com literais, metacaracteres, classes de caracteres e atalhos (\\d, \\w, \\s)', 'Usar quantificadores (*, +, ?, {n,m}) e entender a diferença entre guloso e preguiçoso', 'Combinar alternativas com | e usar as flags g, i, m, s e u', 'Aplicar os métodos de JavaScript test, match, matchAll, replace e split e evitar o armadilha do lastIndex com a flag g', 'Escapar corretamente texto vindo do usuário ao montar um padrão'],
  intro: `Uma **expressão regular** (regex) é uma pequena linguagem para **descrever padrões de texto**: "três letras, um hífen, quatro dígitos". Com ela você valida entradas, extrai pedaços de logs, faz buscas e substituições sofisticadas no editor e no terminal. É uma das ferramentas de maior retorno para o esforço: algumas dezenas de símbolos resolvem uma enorme quantidade de tarefas. Também é fácil escrever regex ilegível ou perigosa; por isso esta primeira aula foca no **vocabulário essencial** e em hábitos saudáveis, e as próximas tratam de grupos, âncoras e desempenho. Os exemplos são em **JavaScript**, e os conceitos valem para quase todas as linguagens (com pequenas diferenças).`,
  theory: `### Criando uma regex em JavaScript
- **Literal**: §/padrao/flags§, por exemplo §/ola/i§. É compilado uma vez, ideal para padrões fixos.
- **Construtor**: §new RegExp("padrao", "flags")§, para padrões montados em tempo de execução. Como o padrão vem de uma **string**, cada barra invertida precisa ser **escrita em dobro**: §new RegExp("\\\\d+")§ equivale a §/\\d+/§. (Strings brutas ajudam: §String.raw§.)

### Literais e metacaracteres
A maioria dos caracteres casa **consigo mesma**: §/gato/§ casa a sequência "gato". Doze caracteres têm sentido especial (**metacaracteres**): §. ^ $ * + ? ( ) [ ] { } | \\§. Para casá-los literalmente, **escape** com barra invertida: §/3\\.14/§ casa "3.14" (sem a barra, o ponto casaria qualquer caractere).

### Classes de caracteres
- §.§ — **qualquer** caractere, exceto quebra de linha (com a flag §s§, inclui quebras).
- §[abc]§ — um caractere **dentre** a, b ou c; §[a-z]§ — um intervalo; §[A-Za-z0-9_]§ — combinação; §[^abc]§ — qualquer um **exceto** estes.
- Atalhos: §\\d§ dígito (0-9); §\\w§ letra ASCII, dígito ou sublinhado; §\\s§ espaço em branco (espaço, tabela, quebra de linha); e as versões negadas §\\D§, §\\W§, §\\S§.
- Dentro de §[...]§, a maioria dos metacaracteres perde o significado (§[.*+]§ casa um desses três símbolos); o hífen no meio indica intervalo (coloque-o no início ou no fim para casá-lo literalmente) e §^§ no início nega.
- **Unicode:** §\\w§ **não** cobre acentos (§"ç"§, §"é"§). Com a flag §u§, use propriedades: §\\p{L}§ (qualquer letra), §\\p{Lu}§ (maiúscula), §\\p{N}§ (número). Confirmamos: §"ÁÉ".match(/\\p{Lu}/gu)§ encontra 2 letras. Para nomes e textos em português, §\\p{L}§ é o caminho.

### Quantificadores
Dizem **quantas vezes** o item anterior se repete:
| Símbolo | Significado |
|---|---|
| §*§ | zero ou mais |
| §+§ | uma ou mais |
| §?§ | zero ou uma (opcional) |
| §{n}§ | exatamente n |
| §{n,}§ | n ou mais |
| §{n,m}§ | de n a m |

Exemplo: §/\\d{3}-\\d{4}/§ casa "555-1234". O quantificador age sobre **um item** (um caractere, uma classe ou um grupo): §/ab+/§ é "a" seguido de um ou mais "b", não "ab" repetido.

### Guloso (greedy) e preguiçoso (lazy)
Por padrão, os quantificadores são **gulosos**: consomem o **máximo possível** e só devolvem se a regex falhar. Acrescentando §?§ ficam **preguiçosos** (consomem o mínimo). Sobre o texto §"<b>a</b><b>b</b>"§, o padrão §/<b>.*<\\/b>/§ casa **tudo** ("<b>a</b><b>b</b>"), enquanto §/<b>.*?<\\/b>/§ casa só "<b>a</b>" (executamos ambos). O preguiçoso resolve muitos casos, mas uma classe negada costuma ser **mais clara e mais rápida**: §/<b>[^<]*<\\/b>/§.

### Alternância
§|§ separa alternativas: §/gato|cachorro/§. A alternância tem a **menor precedência**: §/^gato|cachorro$/§ significa "começa com gato **ou** termina com cachorro". Para delimitar, agrupe (aula 7): §/^(gato|cachorro)$/§.

### Flags
| Flag | Efeito |
|---|---|
| §g§ | **global**: encontra todas as ocorrências (e mantém estado em §lastIndex§) |
| §i§ | ignora maiúsculas e minúsculas |
| §m§ | §^§ e §$§ casam em **cada linha** |
| §s§ | o ponto casa também quebras de linha |
| §u§ | modo Unicode (habilita §\\p{...}§ e trata pares substitutos) |
| §y§ | *sticky*: só casa na posição exata de §lastIndex§ |
| §d§ | devolve os índices de início e fim dos grupos |

### Os métodos de JavaScript
- §regex.test(texto)§ → **booleano**. Use para validar.
- §texto.match(regex)§ → sem §g§: o primeiro casamento com grupos; com §g§: **lista** de todos os casamentos (sem os grupos).
- §texto.matchAll(regex)§ → iterador de **todos** os casamentos com grupos e índices (exige §g§). Exemplo: §[..."a1b22".matchAll(/\\d+/g)]§ produziu "1" na posição 1 e "22" na posição 3.
- §texto.replace(regex, substituto)§ e §replaceAll§ → trocas; o substituto pode usar §$1§, §$&§ ou uma função (aula 7).
- §texto.split(regex)§ → divide por padrão: §"a, b;c".split(/[,;]\\s*/)§ → §["a","b","c"]§.
- §texto.search(regex)§ → posição do primeiro casamento.

**Armadilha do §lastIndex§:** uma regex **com a flag §g§** (ou §y§) guarda a posição do último casamento em §regex.lastIndex§ e **continua dali** na próxima chamada de §test§ ou §exec§. Ao reutilizar a mesma regex global, o resultado muda: em nosso teste, o mesmo §test("aa")§ devolveu §true§, §true§ e depois §false§ (e o §lastIndex§ passou por 1, 2 e voltou a 0). Para validação use regex **sem §g§**, ou crie uma nova a cada uso.

### Escapando texto do usuário
Se o padrão inclui texto digitado por alguém (por exemplo, uma busca), **escape os metacaracteres**, ou o texto será interpretado como regex (e pode quebrar ou ser explorado, aula 8):
§§§javascript
const escapar = (s) => s.replace(/[.*+?^DOLAR{}()|[\\]\\\\]/g, "\\\\$&");
§§§
A forma padronizada §RegExp.escape§ está sendo incluída na linguagem; verifique o suporte do seu ambiente antes de depender dela.

### Boas práticas de leitura
Regex é **código denso**. Dê **nomes** (constantes bem nomeadas), **comente** o que cada parte faz, **monte** padrões longos a partir de partes e **teste** com entradas válidas e inválidas. E lembre que casar o formato não prova que o dado é **válido**: §/^\\d{11}$/§ aceita um CPF inexistente; a validação real (dígitos verificadores) é código. Validar **e-mail** com uma regex "perfeita" é uma armadilha; uma verificação simples de formato mais o envio de uma confirmação por e-mail é o caminho profissional.`,
  concepts: [
    { term: 'Metacaractere', def: 'Caractere com significado especial em regex (. ^ $ * + ? ( ) [ ] { } | \\); precisa de escape para ser literal.' },
    { term: 'Classe de caracteres', def: 'Conjunto de caracteres aceitos em uma posição, como [a-z] ou \\d.' },
    { term: 'Quantificador', def: 'Define quantas vezes o item anterior se repete (*, +, ?, {n,m}).' },
    { term: 'Guloso x preguiçoso', def: 'Gulosos consomem o máximo possível; com ? depois do quantificador, consomem o mínimo.' },
    { term: 'Flag', def: 'Modificador do comportamento da regex: g, i, m, s, u, y, d.' },
    { term: 'lastIndex', def: 'Posição em que uma regex global ou sticky continua a busca; fonte de bugs ao reutilizar a mesma regex.' },
    { term: 'Alternância (|)', def: 'Operador "ou" de baixa precedência entre alternativas.' },
    { term: '\\p{L} (Unicode)', def: 'Propriedade Unicode que casa qualquer letra; exige a flag u.' },
    { term: 'Escape', def: 'Prefixar um metacaractere com \\ para que seja tratado como literal.' }
  ],
  examples: R`**Analogia:** uma regex é um **molde de biscoito**: descreve a *forma* de um texto, não um texto específico. As classes são **fôrmas com várias opções** ("aqui vai um dígito"), os quantificadores dizem **quantas vezes repetir** e o guloso é o cortador que corta **o máximo de massa** que conseguir, enquanto o preguiçoso corta **o mínimo**.

**Receitas rápidas:**
- Horário 24 h: §/^([01]\d|2[0-3]):[0-5]\d$/§.
- Placa Mercosul ou antiga: §/^[A-Z]{3}(-\d{4}|\d[A-Z]\d{2})$/§.
- Remover espaços extras: §texto.replace(/\s+/g, " ").trim()§.
- Extrair todos os números inteiros: §texto.match(/\d+/g) ?? []§.

**Cenário real — "validar e-mail":** uma regex ingênua como §/^\S+@\S+\.\S+$/§ aceita "a@b.co" e rejeita "a b@c.d" (executamos os dois), mas também aceita "a@b..co". O padrão RFC é tão complexo que ninguém o usa. Faça a checagem simples (há um §@§ e algo antes e depois) e **confirme** enviando uma mensagem.

**Cenário real — busca no editor:** no VS Code, ative "usar expressão regular" (§Alt+R§) e busque §console\.log\(.*\);?§ para achar todos os logs esquecidos antes de publicar.`,
  code: [
    { title: 'Classes, quantificadores e flags (executado com Node.js 26)', lang: 'javascript', code: R`console.log("<b>a</b><b>b</b>".match(/<b>.*<\/b>/)[0]);    // <b>a</b><b>b</b>  (guloso)
console.log("<b>a</b><b>b</b>".match(/<b>.*?<\/b>/)[0]);   // <b>a</b>           (preguiçoso)
console.log("A\nb".match(/^b/m) !== null);                  // true  (m: ^ em cada linha)
console.log(/a.b/s.test("a\nb"));                           // true  (s: o ponto casa a quebra)
console.log("ÁÉ".match(/\p{Lu}/gu).length);                 // 2     (u: propriedades Unicode)
console.log("a, b;c".split(/[,;]\s*/));                     // [ 'a', 'b', 'c' ]
console.log([..."a1b22".matchAll(/\d+/g)].map((m) => m[0] + "@" + m.index));  // [ '1@1', '22@3' ]`, notes: [{ l: '1-2', t: 'O ponto de interrogação depois de .* torna o quantificador preguiçoso: para no primeiro </b>.' }, { l: '3', t: 'Sem a flag m, ^ só casaria no início de todo o texto e o resultado seria false.' }, { l: '5', t: 'Cada letra maiúscula acentuada é uma "letra" Unicode; \\w não a cobriria.' }, { l: '7', t: 'matchAll devolve índices; precisa da flag g.' }] },
    { title: 'A armadilha do lastIndex com a flag g (executado)', lang: 'javascript', code: R`const r = /a/g;
console.log(r.test("aa"), r.lastIndex);   // true 1
console.log(r.test("aa"), r.lastIndex);   // true 2
console.log(r.test("aa"), r.lastIndex);   // false 0   (acabou; o índice volta a zero)
const v = /a/;                            // para validar, use regex sem g
console.log(v.test("aa"), v.test("aa"));  // true true`, notes: [{ l: '2-4', t: 'A mesma regex global continua de onde parou: o terceiro teste falha e zera o lastIndex.' }, { l: '5', t: 'Sem a flag g não há estado: o resultado é sempre o mesmo.' }] },
    { title: 'Escapando texto do usuário (executado)', lang: 'javascript', code: R`const escapar = (s) => s.replace(/[.*+?^DOLAR{}()|[\]\\]/g, "\\$&");
const busca = "a.b (1+1)";
const re = new RegExp(escapar(busca), "i");
console.log(re.source);                       // a\.b \(1\+1\)
console.log(re.test("A.B (1+1)"), re.test("axb (1+1)"));   // true false`, notes: [{ l: '1', t: '$& insere o trecho casado; a barra dupla antes dele produz uma barra de escape na saída.' }, { l: '4', t: 'Sem o escape, o ponto casaria "x" e os parênteses formariam um grupo.' }] }
  ],
  bestPractices: ['Teste a regex com entradas válidas, inválidas e vazias (e com textos longos).', 'Prefira classes negadas (§[^<]*§) a §.*?§ quando fizer sentido: mais claro e mais rápido.', 'Use §\\p{L}§ com a flag §u§ para letras em português em vez de §[a-z]§.', 'Evite reutilizar uma regex com §g§ em §test§/§exec§; crie uma nova ou remova a flag.', 'Escape texto externo antes de montar padrões dinâmicos.', 'Nomeie e comente padrões longos; prefira montar a partir de partes.'],
  mistakes: ['Esquecer de escapar o ponto (§3.14§ casa "3x14").', 'Usar §.*§ guloso e capturar muito mais do que o desejado.', 'Reutilizar uma regex global em §test§ e obter resultados alternados.', 'Montar um padrão a partir de texto do usuário sem escapar.', 'Usar §\\w§ para nomes com acentos.', 'Tentar validar e-mail, HTML ou CPF "completos" apenas com regex.'],
  market: `Regex aparece diariamente em validações, buscas em editores e logs, scripts de migração e ferramentas como §grep§, §sed§ e §ripgrep§. Saber ler e escrever padrões rapidamente (e saber quando **não** usá-las) é uma habilidade prática que economiza horas e é testada em entrevistas e exercícios de código.`,
  summary: `Regex descreve padrões de texto. Literais casam consigo mesmos; metacaracteres (§. ^ $ * + ? ( ) [ ] { } | \\§) precisam de escape. Classes (§[a-z]§, §\\d§, §\\w§, §\\s§, §\\p{L}§ com §u§) e quantificadores (§* + ? {n,m}§) formam o núcleo; gulosos consomem o máximo, preguiçosos (§?§) o mínimo. Flags: §g§, §i§, §m§, §s§, §u§. Use §test§ para validar, §matchAll§ para extrair, §replace§ e §split§ para transformar; cuidado com §lastIndex§ e escape texto externo.`,
  refs: [REF3.mdnRegexGuide, REF3.mdnRegexRef, REF3.mdnCheatsheet, REF3.mdnClasses, REF3.mdnQuantifiers],
  cards: [
    { q: 'Qual a diferença entre /<b>.*<\\/b>/ e /<b>.*?<\\/b>/?', a: 'O primeiro é guloso e casa até o último </b>; o segundo é preguiçoso e para no primeiro.' },
    { q: 'Por que uma regex com flag g pode dar resultados diferentes em chamadas seguidas de test?', a: 'Porque guarda lastIndex e continua da posição anterior; para validar, use regex sem g.' },
    { q: 'Como casar um ponto literal?', a: 'Com escape: \\. (sem ele, o ponto casa qualquer caractere).' },
    { q: 'Por que usar \\p{L} em vez de \\w para nomes em português?', a: '\\w cobre só letras ASCII; \\p{L} (com a flag u) cobre letras acentuadas.' }
  ]
},
{
  id: 'fer-07', moduleId: 'm3', order: 7, minutes: 75, tags: ['regex', 'grupos', 'ancoras', 'lookaround'],
  title: 'Grupos, âncoras e lookarounds',
  objectives: ['Usar grupos de captura, grupos sem captura e grupos nomeados para extrair partes de um texto', 'Aplicar retrovisores (backreferences) e substituições com $1, $<nome> e funções', 'Usar âncoras (^, $, \\b, \\B) para delimitar e evitar casamentos parciais', 'Escrever lookaheads e lookbehinds (positivos e negativos) para impor condições sem consumir texto', 'Combinar as peças para validar senhas, converter datas e extrair valores com segurança'],
  intro: `Na aula anterior você descreveu **sequências**. Agora vai **estruturar** os padrões: capturar partes ("o ano, o mês e o dia"), exigir posições ("o texto inteiro, nada além"), repetir o que já foi visto ("a mesma palavra duas vezes") e impor **condições sobre o contexto** ("um número precedido de R$", "uma senha que tenha ao menos um dígito"). São os recursos que transformam regex de "encontrar" em **extrair e transformar** dados com precisão.`,
  theory: `### Grupos de captura
Parênteses fazem duas coisas: **agrupam** (para aplicar quantificador ou alternância ao conjunto) e **capturam** o trecho casado, numerado a partir de 1 (§$1§, §$2§...). Exemplo:
§§§javascript
const m = "18/11/2026".match(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/);
// m[0] = "18/11/2026" (casamento completo); m[1] = "18"; m[2] = "11"; m[3] = "2026"
§§§

### Grupos sem captura
§(?:...)§ agrupa **sem capturar**: útil para quantificar ou alternar sem poluir a numeração. §/^(?:www\\.)?exemplo\\.com$/§ torna o prefixo opcional sem criar um grupo extra.

### Grupos nomeados
§(?<nome>...)§ dá nome ao grupo, e o resultado fica em §match.groups§. Muito mais legível que números:
§§§javascript
const { ano, mes, dia } = "2026-11-18".match(/(?<ano>\\d{4})-(?<mes>\\d{2})-(?<dia>\\d{2})/).groups;
// ano = "2026", mes = "11", dia = "18"   (executado)
§§§
Em substituições, use §$<nome>§; em retrovisores, §\\k<nome>§.

### Retrovisores (backreferences)
§\\1§ (ou §\\k<nome>§) casa **exatamente o mesmo texto** que o grupo capturou antes. §/(\\w+) \\1/§ casa palavras repetidas ("o o"). §/(["'])(.*?)\\1/§ casa texto entre aspas simples **ou** duplas, com a mesma aspa abrindo e fechando.

### Substituição com grupos
No §replace§, o texto de substituição pode referenciar os grupos:
- §$1§, §$2§, ... e §$<nome>§: o conteúdo do grupo; §$&§: o casamento inteiro; §$$§: um cifrão literal.
- Também pode ser uma **função**: §texto.replace(/\\d+/g, (n) => Number(n) * 2)§ recebe o casamento e os grupos e devolve o novo texto. É a forma de fazer lógica durante a troca.
Conversão de data (executada): §"18/11/2026 e 01/02/2025".replace(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/g, "$3-$2-$1")§ → §"2026-11-18 e 2025-02-01"§.

### Âncoras
Âncoras **não consomem caracteres**; casam **posições**:
- §^§ início do texto (ou de cada linha com a flag §m§); §$§ fim.
- §\\b§ **fronteira de palavra** (entre um caractere de palavra e um que não seja); §\\B§ o oposto. §/\\bgato\\b/§ casa "gato" mas não "gatos" nem "agato".
Para **validar** um formato completo, ancore nas duas pontas (§/^\\d{4}$/§); sem §^§ e §$§, a regex casa em **qualquer parte** do texto ("abc1234xyz" passaria). Cuidado com §\\b§ e acentos: como §\\w§ não cobre letras acentuadas, §\\b§ pode se comportar de forma inesperada em palavras como "ação"; nesses casos, use lookarounds com §\\p{L}§ e a flag §u§.

### Lookarounds
Verificam o **contexto** sem incluí-lo no casamento:
| Sintaxe | Nome | Significado |
|---|---|---|
| §(?=...)§ | lookahead positivo | o que vem **a seguir** casa com ... |
| §(?!...)§ | lookahead negativo | o que vem a seguir **não** casa com ... |
| §(?<=...)§ | lookbehind positivo | o que vem **antes** casa com ... |
| §(?<!...)§ | lookbehind negativo | o que vem antes **não** casa com ... |

Exemplos (executados): §"R$10 e US$20".match(/(?<=R\\$)\\d+/g)§ → §["10"]§ (só o número precedido de "R$"); §"price".match(/(?<!x)p/g)§ → §["p"]§.

**Senha forte com lookaheads encadeados.** Cada lookahead exige uma condição **a partir do início**, sem avançar:
§§§javascript
const forte = /^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
forte.test("Abcdef12");   // true   (dígito, minúscula, maiúscula, 8+ caracteres)
forte.test("abcdef12");   // false  (sem maiúscula)
§§§
Funciona, mas a política de senha moderna prefere **comprimento** e verificação contra listas de senhas vazadas a regras de composição (consulte as recomendações atuais do NIST); a regex é aqui um exercício de técnica.

### Quando o padrão fica complexo
- **Monte** a regex a partir de partes nomeadas (§const ano = "\\\\d{4}"§) e documente.
- **Teste** com tabelas de casos (válidos e inválidos).
- Prefira **dividir o problema**: uma regex para extrair o formato e código para validar o significado (por exemplo, a data 31/02 tem formato válido, mas não existe).
- Se o padrão exige **aninhamento** (parênteses balanceados, HTML, JSON), regex **não** é a ferramenta: use um *parser*.

### Exemplo completo: extraindo dados de logs
Linha: §2026-11-18T10:15:00Z ERROR [api] Falha ao salvar pedido=1234§. Com §/^(?<quando>\\S+) (?<nivel>[A-Z]+) \\[(?<modulo>\\w+)\\] (?<msg>.*)$/§, o §groups§ separa momento, nível, módulo e mensagem. Daí em diante, o trabalho é com objetos, não com texto.`,
  concepts: [
    { term: 'Grupo de captura', def: 'Parênteses que agrupam e guardam o trecho casado, numerado a partir de 1.' },
    { term: 'Grupo sem captura', def: '(?:...): agrupa sem guardar o trecho.' },
    { term: 'Grupo nomeado', def: '(?<nome>...): captura acessível em match.groups.nome.' },
    { term: 'Retrovisor', def: '\\1 ou \\k<nome>: casa o mesmo texto que o grupo capturou.' },
    { term: 'Âncora', def: 'Casa uma posição, não caracteres: ^, $, \\b, \\B.' },
    { term: 'Fronteira de palavra (\\b)', def: 'Posição entre um caractere de palavra e outro que não seja.' },
    { term: 'Lookahead', def: '(?=...) ou (?!...): exige ou proíbe um padrão logo a seguir, sem consumi-lo.' },
    { term: 'Lookbehind', def: '(?<=...) ou (?<!...): exige ou proíbe um padrão logo antes, sem consumi-lo.' },
    { term: 'Substituição com função', def: 'Passar uma função ao replace para calcular o texto novo a partir do casamento e dos grupos.' }
  ],
  examples: R`**Analogia:** os **grupos** são **marcadores amarelos** em um texto impresso: você destaca as partes que quer levar (dia, mês, ano). As **âncoras** são as **margens da página**: "o texto começa aqui e termina ali". Os **lookarounds** são **olhar para os lados antes de atravessar a rua**: você confere o que há antes ou depois, mas não sai do lugar (não consome texto).

**Cenário real — migrar datas em um arquivo:** um CSV tem datas no formato brasileiro e o banco exige ISO. Em uma única passagem: §texto.replace(/(?<d>\d{2})\/(?<m>\d{2})\/(?<a>\d{4})/g, "$<a>-$<m>-$<d>")§. Depois, valide as datas com código (o dia 31/02 também casa com o padrão).

**Cenário real — achar valores em reais:** §/(?<=R\$\s?)\d+(?:,\d{2})?/g§ extrai "10" e "15,50" de "pague R$ 10 ou R$15,50", sem trazer o "R$" junto. (O lookbehind de largura variável é aceito em JavaScript.)

**Cenário real — palavras repetidas por descuido:** §/\b(\p{L}+)\s+\1\b/giu§ encontra "de de" e "a a" em um texto, bom para um revisor ortográfico simples.`,
  code: [
    { title: 'Grupos nomeados e substituição (executado com Node.js 26)', lang: 'javascript', code: R`const iso = "2026-11-18".match(/(?<ano>\d{4})-(?<mes>\d{2})-(?<dia>\d{2})/);
console.log(iso.groups);   // [Object: null prototype] { ano: '2026', mes: '11', dia: '18' }

const br = "18/11/2026 e 01/02/2025";
console.log(br.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, "$3-$2-$1"));  // 2026-11-18 e 2025-02-01

console.log("ana e bia".replace(/\b(\p{L})(\p{L}*)/gu, (_, a, resto) => a.toUpperCase() + resto));  // Ana E Bia`, notes: [{ l: '1', t: 'Os nomes viram propriedades de groups.' }, { l: '5', t: '$3-$2-$1 reordena os grupos: ano, mês e dia.' }, { l: '7', t: 'A função recebe o casamento e os grupos; aqui capitaliza a primeira letra de cada palavra. Observação: "e" também vira "E".' }] },
    { title: 'Lookarounds e senha forte (executado)', lang: 'javascript', code: R`console.log("R$10 e US$20".match(/(?<=R\$)\d+/g));           // [ '10' ]
const forte = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
console.log(forte.test("Abcdef12"), forte.test("abcdef12")); // true false`, notes: [{ l: '1', t: 'O lookbehind exige "R$" antes, mas não o inclui no resultado.' }, { l: '2', t: 'Três lookaheads exigem dígito, minúscula e maiúscula em qualquer ponto do texto; .{8,}$ exige 8 ou mais caracteres.' }] },
    { title: 'Extração estruturada de uma linha de log (executado)', lang: 'javascript', code: R`const linha = "2026-11-18T10:15:00Z ERROR [api] Falha ao salvar pedido=1234";
const re = /^(?<quando>\S+) (?<nivel>[A-Z]+) \[(?<modulo>\w+)\] (?<msg>.*)$/;
const { quando, nivel, modulo, msg } = linha.match(re).groups;
console.log(nivel, modulo, "|", msg);   // ERROR api | Falha ao salvar pedido=1234`, notes: [{ l: '2', t: 'Cada parte do log vira um grupo nomeado; ^ e $ garantem que a linha inteira segue o formato.' }, { l: '3', t: 'A desestruturação transforma o resultado em variáveis.' }] }
  ],
  bestPractices: ['Use grupos nomeados em vez de números quando houver mais de dois grupos.', 'Use grupos sem captura quando só precisa agrupar.', 'Ancore (§^§ e §$§) padrões de validação.', 'Use lookarounds para impor contexto sem consumir texto, mas com moderação (podem custar caro).', 'Separe "formato" (regex) de "significado" (código): datas, CPF, cartões.', 'Quando o formato é recursivo ou aninhado, use um parser em vez de regex.'],
  mistakes: ['Esquecer as âncoras e validar "abc1234xyz" como se fosse um número.', 'Misturar grupos de captura e sem captura e errar a numeração.', 'Usar §\\b§ com texto acentuado sem perceber o comportamento.', 'Escrever regex gigantes sem nomes nem comentários.', 'Validar "31/02" apenas pelo formato.', 'Tentar casar HTML ou parênteses balanceados com regex.'],
  market: `Extração e transformação de texto estruturado (logs, CSVs, datas, URLs) é rotina em backend, dados e DevOps. Dominar grupos nomeados, substituição com função e lookarounds permite resolver em uma linha o que, de outro modo, exigiria laços e condicionais complexos, e é um conteúdo clássico de testes técnicos.`,
  summary: `Grupos capturam trechos (§(...)§), grupos nomeados (§(?<nome>...)§) os expõem em §groups§, e §(?:...)§ agrupa sem capturar. Retrovisores (§\\1§, §\\k<nome>§) repetem o capturado. No §replace§, use §$1§, §$<nome>§ ou uma função. Âncoras (§^ $ \\b§) casam posições, e lookarounds (§(?= ) (?! ) (?<= ) (?<! )§) impõem contexto sem consumir. Separe formato (regex) de significado (código) e use parsers para estruturas aninhadas.`,
  refs: [REF3.mdnGroups, REF3.mdnAssertions, REF3.mdnReplace, REF3.mdnMatchAll, REF3.mdnRegexRef],
  cards: [
    { q: 'Para que serve um grupo nomeado?', a: 'Capturar um trecho acessível por nome em match.groups, tornando o código mais legível que índices numéricos.' },
    { q: 'O que é um lookahead?', a: 'Uma condição sobre o que vem a seguir ((?=...) positivo, (?!...) negativo) que não consome caracteres.' },
    { q: 'Por que ancorar com ^ e $ ao validar?', a: 'Sem âncoras a regex casa em qualquer parte do texto e aceitaria entradas com lixo antes ou depois.' },
    { q: 'Como converter dd/mm/aaaa para aaaa-mm-dd em um replace?', a: 'Capturar os três grupos e usar "$3-$2-$1" como substituição.' }
  ]
},
{
  id: 'fer-08', moduleId: 'm3', order: 8, minutes: 70, tags: ['regex', 'desempenho', 'redos', 'backtracking'],
  title: 'Desempenho, backtracking catastrófico (ReDoS) e boas práticas',
  objectives: ['Explicar como o motor de regex faz backtracking e por que alguns padrões ficam exponencialmente lentos', 'Reconhecer padrões vulneráveis (quantificadores aninhados e alternâncias sobrepostas) e reescrevê-los de forma linear', 'Explicar o ataque ReDoS e como mitigá-lo (limitar entrada, simplificar o padrão, evitar regex fornecida pelo usuário, usar motores lineares)', 'Medir o tempo de uma regex e testá-la com entradas adversárias', 'Decidir quando não usar regex e adotar um checklist de revisão'],
  intro: `Uma regex errada não só dá o resultado errado: ela pode **travar o seu servidor**. Há padrões, aparentemente inocentes como §/^(a+)+$/§, cujo tempo de execução **dobra a cada caractere** adicionado à entrada. Uma entrada de 30 caracteres escolhida por um atacante pode ocupar a CPU por minutos. Isso é o **ReDoS** (*Regular expression Denial of Service*), uma vulnerabilidade real que já derrubou serviços grandes. Esta aula explica por que acontece e como escrever padrões seguros.`,
  theory: `### Como o motor casa: backtracking
O JavaScript (assim como Java, Python, PCRE e outros) usa um motor **por retrocesso** (*backtracking*): tenta uma alternativa; se falhar adiante, **volta** e tenta a próxima. É poderoso (suporta retrovisores e lookarounds), mas, em certos padrões, o número de caminhos possíveis **explode**.

Exemplo: §/^(a+)+$/§ testado contra §"aaaa…ab"§. Para decidir que "aaaab" **não** casa, o motor tenta todas as formas de repartir os "a" entre o grupo interno e o externo: com n letras, existem cerca de **2ⁿ** repartições. Cada falha no final (o "b" impede o §$§) o leva a testar a próxima. Medimos em Node.js 26: com 20 a 24 letras o teste leva da ordem de **0,1 a 0,6 s**; com **26 letras, cerca de 2,8 s**; com **28, cerca de 11 s** (cresce ~4× a cada 2 letras). Em contraste, o padrão equivalente §/^a+$/§ examina **100.000 caracteres em cerca de 1 ms**.

### Padrões perigosos: o que procurar
1. **Quantificadores aninhados** sobre o mesmo tipo de caractere: §(a+)+§, §(a*)*§, §(\\w+\\s?)+§, §(.*)*§.
2. **Alternâncias sobrepostas** dentro de um quantificador: §(a|aa)+§, §(a|a?)+§.
3. **Quantificadores adjacentes que competem** pelos mesmos caracteres: §\\d+\\d+§, §.*.*§ seguido de algo que falha.
4. **Âncora final que pode falhar** depois de muito trabalho: o problema aparece justamente quando a entrada **quase** casa.

Sintoma típico: a regex é rápida com entradas válidas e **congela** com uma entrada longa quase válida.

### O ataque ReDoS
Em JavaScript no servidor (Node.js), a regex roda na **thread única**: enquanto ela calcula, **nenhuma outra requisição** é atendida. Um atacante envia uma string pequena e o serviço fica indisponível. Locais comuns: validação de e-mail, de URL, de cabeçalhos, *parsers* de texto, regras de WAF e filtros de entrada. A OWASP descreve o ataque e os padrões de risco.

### Como mitigar
1. **Reescreva sem ambiguidade.** Cada caractere deve poder ser consumido de **uma única forma**. Troque §(a+)+§ por §a+§; troque §(\\w+\\s?)+§ por §\\w+(?:\\s\\w+)*§ (cada palavra separada por um espaço obrigatório); troque §.*§ por classes negadas (§[^;]*§).
2. **Limite o tamanho da entrada ANTES** de aplicar a regex (por exemplo, 256 caracteres para um e-mail). Mesmo padrões ruins têm custo limitado em entradas pequenas.
3. **Use âncoras e delimitadores claros** e evite partes opcionais encadeadas.
4. **Emule grupos atômicos** (que impedem o retrocesso) com lookahead e retrovisor: §(?=(a+))\\1§ consome "a+" **uma só vez**, sem devolver caracteres. É um recurso avançado, e vale testar.
5. **Não aceite regex digitada por usuários** (ou limite-a drasticamente). Se for necessário, use um **motor de tempo linear** (como o RE2, com bindings para várias linguagens), que não suporta retrovisores, mas garante tempo proporcional à entrada.
6. **Isole e imponha tempo-limite**: processar entradas arriscadas em um *worker* ou processo separado com *timeout*, para que um caso patológico não congele o servidor.
7. **Teste com entradas adversárias**: repita o caractere comum muitas vezes e termine com um caractere que quebre o casamento (§"a".repeat(30) + "!"§), e meça.
8. **Analise automaticamente**: linters de segurança e ferramentas dedicadas detectam padrões vulneráveis em revisão e no CI.

### Medindo
§§§javascript
const t0 = process.hrtime.bigint();
/^a+$/.test("a".repeat(100000) + "b");
console.log(Number(process.hrtime.bigint() - t0) / 1e6, "ms");   // ~1 ms
§§§
Meça com **entradas piores que a esperada**; não conclua pela média. Em produção, registre o tempo de validação e alerte para picos.

### Outras dicas de desempenho
- **Compile uma vez**: defina a regex fora de laços e funções chamadas com frequência (os literais são reutilizados, mas o construtor §new RegExp§ dentro de um laço recompila).
- **Ancore** o início quando souber que o padrão começa ali (§^§): permite descartar posições rapidamente.
- **Prefira operações simples** quando bastam: §texto.includes("x")§, §startsWith§, §split§ ou §indexOf§ são mais claros e rápidos que uma regex.
- Lookarounds e retrovisores não são "grátis": use quando valerem a pena.

### Quando NÃO usar regex
- **Estruturas aninhadas** (HTML, XML, JSON, parênteses balanceados, expressões matemáticas): use um **parser** da linguagem (§JSON.parse§, §DOMParser§, bibliotecas de HTML).
- **Validações com regras complexas** (e-mail completo, CPF, cartão de crédito): regex para o **formato**, código para as **regras** (dígitos verificadores, algoritmo de Luhn).
- **Quando a clareza se perde**: se ninguém do time entende o padrão, prefira código explícito com testes.

### Checklist de revisão de uma regex
1. O padrão tem ancoragem adequada e delimita o que precisa?
2. Há quantificadores aninhados ou alternâncias sobrepostas?
3. A entrada tem **limite de tamanho**?
4. Foi testada com válidos, inválidos, vazios e **adversários**?
5. É legível (nomes, comentários, partes)?
6. Existe alternativa mais simples (métodos de string, parser)?
7. Se vem de usuário, está escapada ou executada com motor linear e tempo-limite?`,
  concepts: [
    { term: 'Backtracking', def: 'Estratégia do motor de regex que volta atrás para tentar outras alternativas quando uma falha.' },
    { term: 'Backtracking catastrófico', def: 'Explosão exponencial de tentativas em padrões ambíguos, principalmente quando a entrada quase casa.' },
    { term: 'ReDoS', def: 'Negação de serviço explorando regex vulnerável a backtracking catastrófico.' },
    { term: 'Quantificadores aninhados', def: 'Padrões como (a+)+ que permitem muitas formas de repartir a mesma entrada.' },
    { term: 'Grupo atômico', def: 'Grupo que não devolve caracteres ao retroceder; em JavaScript é emulado com (?=(...))\\1.' },
    { term: 'Motor de tempo linear', def: 'Motor (como o RE2) que garante tempo proporcional ao tamanho da entrada, sem retrovisores.' },
    { term: 'Entrada adversária', def: 'Texto escolhido para provocar o pior caso de um algoritmo.' },
    { term: 'Timeout', def: 'Limite de tempo que interrompe um processamento descontrolado.' },
    { term: 'Parser', def: 'Analisador que entende a estrutura de um formato (JSON, HTML); a ferramenta certa para dados aninhados.' }
  ],
  examples: R`**Analogia:** o motor de regex é um **explorador em um labirinto** que, ao chegar a um beco sem saída, volta ao último cruzamento e tenta outro caminho. Em um labirinto simples, tudo bem. Em um labirinto com **milhões de cruzamentos equivalentes** (quantificadores aninhados), ele tenta todos antes de desistir. O ReDoS é o atacante que **projeta uma entrada** que leva o explorador exatamente a esse labirinto.

**Cenário real — o servidor que "congelava":** uma API validava um campo com §/^([a-zA-Z0-9]+\s?)+$/§. Entradas normais passavam em microssegundos. Um cliente enviou 40 caracteres alfanuméricos seguidos de §"!"§ e o processo ficou 100% de CPU, derrubando a API. A correção foi §/^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/§ (sem ambiguidade) **mais** limite de 100 caracteres na entrada.

**Cenário real — "validar HTML com regex":** a pessoa tenta remover tags com §/<.*>/§ e acaba removendo texto legítimo entre tags. Mesmo versões complexas falham com HTML real. Use um *parser* (no navegador, §DOMParser§; no Node.js, bibliotecas como §parse5§/§cheerio§) e, em geral, **sanitize** com uma biblioteca especializada.`,
  code: [
    { title: 'Medindo o crescimento exponencial (executado com Node.js 26; tempos variam)', lang: 'javascript', code: R`for (const n of [20, 22, 24, 26, 28]) {
  const t0 = process.hrtime.bigint();
  /^(a+)+$/.test("a".repeat(n) + "b");     // vulnerável: a entrada quase casa
  console.log(n, (Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1) + " ms");
}
// medimos aproximadamente: 24 -> 0,6 s | 26 -> 2,8 s | 28 -> 11 s (cresce ~4x a cada 2 letras)

const t1 = process.hrtime.bigint();
/^a+$/.test("a".repeat(100000) + "b");     // equivalente sem ambiguidade
console.log("seguro:", (Number(process.hrtime.bigint() - t1) / 1e6).toFixed(2) + " ms");   // ~1 ms`, notes: [{ l: '3', t: 'O "b" no final faz o teste falhar só depois de tentar todas as repartições dos "a".' }, { l: '6', t: 'Os números são do nosso computador; o importante é o padrão de crescimento, não o valor absoluto. Evite rodar com n grande: leva minutos.' }, { l: '8', t: '/^a+$/ aceita exatamente as mesmas cadeias que /^(a+)+$/ (uma ou mais letras "a"), com custo linear.' }] },
    { title: 'Reescrevendo sem ambiguidade (conceito; reescrita testada nos exercícios)', lang: 'javascript', code: R`// Vulnerável: palavras com espaço opcional dentro de um grupo repetido
const ruim = /^([a-zA-Z0-9]+\s?)+$/;
// Seguro: cada palavra, e um espaço obrigatório entre elas
const bom = /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/;

function validar(texto) {
  if (texto.length > 100) return false;     // limite ANTES de aplicar a regex
  return bom.test(texto);
}
console.log(validar("ana maria"), validar("a".repeat(101)));   // true false`, notes: [{ l: '2', t: 'O \\s? opcional faz o grupo poder consumir o mesmo texto de várias formas.' }, { l: '4', t: 'Com o espaço obrigatório, só há uma forma de repartir a entrada.' }, { l: '8', t: 'Limitar o tamanho é a defesa mais barata e eficaz.' }] }
  ],
  bestPractices: ['Elimine ambiguidade: cada trecho da entrada deve poder casar de uma única forma.', 'Limite o tamanho da entrada antes de aplicar a regex.', 'Teste com entradas adversárias e meça o tempo.', 'Não execute regex fornecida por usuário no processo principal; use um motor linear ou isole com tempo-limite.', 'Prefira métodos de string e parsers quando forem suficientes.', 'Inclua verificação de regex vulnerável na revisão e no CI.'],
  mistakes: ['Usar §(...+)+§ e §(...*)*§ "porque funciona nos testes".', 'Testar só com entradas válidas e curtas.', 'Usar regex para validar e-mail, HTML ou JSON completos.', 'Aplicar regex em entradas sem limite de tamanho no servidor.', 'Achar que "só afeta quem digitou": no servidor, afeta todos (thread única).', 'Copiar regexes da internet sem entender o que fazem.'],
  market: `ReDoS é uma classe de vulnerabilidade conhecida, catalogada em CVEs de bibliotecas populares e citada pela OWASP. Times de segurança e revisão de código procuram padrões vulneráveis; saber reescrevê-los e limitar a entrada é uma habilidade valorizada em backend, e uma pergunta frequente em entrevistas.`,
  summary: `O motor faz backtracking: padrões ambíguos, como §(a+)+§, crescem de forma exponencial quando a entrada quase casa (medimos 2,8 s com 26 letras e 11 s com 28, contra 1 ms para o equivalente §a+§ em 100 mil caracteres). No servidor, isso trava a thread única (ReDoS). Mitigue: reescreva sem ambiguidade, limite o tamanho da entrada, evite regex de usuário, use motor linear ou isolamento com timeout, teste com entradas adversárias. Use parsers para estruturas aninhadas.`,
  refs: [REF3.owaspRedos, REF3.mdnQuantifiers, REF3.mdnRegexRef, REF3.ecmaRegexp],
  cards: [
    { q: 'O que causa o backtracking catastrófico?', a: 'Quantificadores aninhados ou alternâncias sobrepostas que permitem muitas formas de repartir a mesma entrada, explorado quando a entrada quase casa.' },
    { q: 'Qual a defesa mais simples contra ReDoS?', a: 'Limitar o tamanho da entrada antes de aplicar a regex e reescrever o padrão sem ambiguidade.' },
    { q: 'Por que ReDoS é grave em Node.js?', a: 'A regex roda na thread única do servidor; enquanto ela calcula, nenhuma outra requisição é atendida.' },
    { q: 'Quando não usar regex?', a: 'Para estruturas aninhadas (HTML, JSON) e validações com regras (CPF, e-mail completo); use parser e código.' }
  ]
}
];
