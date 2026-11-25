// C4.8 — Python para desenvolvedores. Aulas 1 e 2 (sintaxe e tipos; funções e módulos).
const R = String.raw;

export const REF = {
  pyTutorial: { title: 'Python — The Python Tutorial', url: 'https://docs.python.org/3/tutorial/index.html', kind: 'doc' },
  pyDatamodel: { title: 'Python — Data model', url: 'https://docs.python.org/3/reference/datamodel.html', kind: 'doc' },
  pyBuiltinTypes: { title: 'Python — Built-in Types', url: 'https://docs.python.org/3/library/stdtypes.html', kind: 'doc' },
  pyDecimal: { title: 'Python — decimal', url: 'https://docs.python.org/3/library/decimal.html', kind: 'doc' },
  pyCopy: { title: 'Python — copy', url: 'https://docs.python.org/3/library/copy.html', kind: 'doc' },
  pep8: { title: 'PEP 8 — Style Guide for Python Code', url: 'https://peps.python.org/pep-0008/', kind: 'especificação' },
  pep20: { title: 'PEP 20 — The Zen of Python', url: 'https://peps.python.org/pep-0020/', kind: 'especificação' },
  pyFunctools: { title: 'Python — functools', url: 'https://docs.python.org/3/library/functools.html', kind: 'doc' },
  pyDefineFunctions: { title: 'Python — More on Defining Functions', url: 'https://docs.python.org/3/tutorial/controlflow.html#more-on-defining-functions', kind: 'doc' },
  pyModules: { title: 'Python — Modules', url: 'https://docs.python.org/3/tutorial/modules.html', kind: 'doc' },
  pyImport: { title: 'Python — The import system', url: 'https://docs.python.org/3/reference/import.html', kind: 'doc' },
  pyVenv: { title: 'Python — venv', url: 'https://docs.python.org/3/library/venv.html', kind: 'doc' },
  pyPackaging: { title: 'Python Packaging User Guide', url: 'https://packaging.python.org/en/latest/', kind: 'doc' },
  pyPyproject: { title: 'Python Packaging — Writing your pyproject.toml', url: 'https://packaging.python.org/en/latest/guides/writing-pyproject-toml/', kind: 'doc' },
  pyDataclasses: { title: 'Python — dataclasses', url: 'https://docs.python.org/3/library/dataclasses.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'pyt-01', moduleId: 'm1', order: 1, minutes: 85, tags: ['Python', 'tipos', 'mutabilidade', 'identidade', 'compreensões', 'Decimal', 'strings'],
  title: 'Python: sintaxe e tipos, mutabilidade, identidade e as armadilhas que mais pegam desenvolvedores',
  objectives: ['Explicar a tipagem dinâmica e forte do Python e os tipos embutidos', 'Evitar as armadilhas de float, identidade (is x ==) e argumento padrão mutável', 'Distinguir cópia rasa e profunda e escolher a estrutura de dados certa', 'Usar compreensões, f-strings e valores "falsos" com segurança', 'Entender bytes, Unicode e o cuidado com a normalização'],
  intro: R`**Python** (aqui, **3.14.4**) é uma linguagem de **sintaxe enxuta** e **tipagem dinâmica e forte**, usada em **backend, automação, dados e IA**. Para quem vem do JavaScript, as diferenças que mais importam são: **inteiros sem limite**, **identidade x igualdade**, **mutabilidade** (listas e dicionários são compartilhados por referência) e o famoso **argumento padrão mutável**. Todos os exemplos abaixo foram **executados** e as saídas são as medidas no laboratório.`,
  theory: R`### Tipagem dinâmica e forte
- **Dinâmica**: variáveis são **nomes** que apontam para objetos; o **tipo está no objeto**, não no nome: medido, §x = 10§ (§int§) e depois §x = 'dez'§ (§str§).
- **Forte**: Python **não converte tipos silenciosamente** em operações incompatíveis: §1 + '1'§ → **TypeError: unsupported operand type(s) for +: 'int' and 'str'** (medido). Compare com o JavaScript, onde §1 + '1'§ vale §'11'§.
- §'1' * 3§ = §'111'§ (repetição de texto) e §True + True§ = **2** (**§bool§ é subclasse de §int§**).
- **Indentação é sintaxe** (blocos); **PEP 8** define o estilo (4 espaços, nomes §snake_case§, classes §PascalCase§); **PEP 20** ("*The Zen of Python*") resume a filosofia.

### Números
- **§int§ sem limite**: medido, **2**100 = 1267650600228229401496703205376**; não há *overflow*.
- **§float§** é ponto flutuante binário (IEEE 754): §0.1 + 0.2 = 0.30000000000000004§ e **§== 0.3§ é False** (medido). Use **§round§**/§math.isclose§ para comparar ou **§Decimal§** para **dinheiro**: §Decimal('0.1') + Decimal('0.2')§ = **0.3** (medido; **crie Decimal a partir de texto**, não de float).
- **Divisão**: §7 / 2 = 3.5§ (sempre float), **§7 // 2 = 3§** (piso), **§-7 // 2 = -4§** (**piso, não truncamento**) e **§7 % -3 = -2§ (o sinal segue o divisor)** — medido.

### Identidade x igualdade
- **§==§** compara **valores**; **§is§** compara **identidade** (mesmo objeto). Medido: **§256 is 256§ → True** e **§int('1000') is int('1000')§ → False**, embora **§==§ seja True**: o CPython **reutiliza** inteiros pequenos (um detalhe de implementação). **Regra**: **§is§ só para §None§** (§x is None§) e **singletons**; **nunca** para números ou textos.

### Mutabilidade e a armadilha do argumento padrão
Tipos **imutáveis**: §int§, §float§, §str§, §tuple§, §frozenset§, §bytes§. **Mutáveis**: §list§, §dict§, §set§, objetos comuns. Atribuir **não copia**: duas variáveis podem apontar para a **mesma** lista.
**Argumento padrão mutável**: o valor padrão é **criado uma vez, na definição da função**. Medido:
§§§
def adicionar(item, lista=[]): lista.append(item); return lista
adicionar(1)   # [1]
adicionar(2)   # [1, 2]   <- a lista padrão foi compartilhada entre as chamadas
§§§
**Correção**: §lista=None§ e §if lista is None: lista = []§ (resultado: **[1]** e **[2]**). Vale para §dict§, §set§ e objetos.

### Cópia rasa x profunda
§orig = [[1, 2], [3, 4]]§; §rasa = orig.copy()§ (ou §list(orig)§, §orig[:]§) copia **só o contêiner externo**; §funda = copy.deepcopy(orig)§ copia **tudo**. Após §orig[0].append(99)§: **original e rasa** mostram §[[1, 2, 99], [3, 4]]§ (compartilham a lista interna) e a **profunda** continua §[[1, 2], [3, 4]]§ (medido). Prefira **estruturas imutáveis** e **funções puras** para evitar efeitos colaterais.

### Estruturas de dados e custo (medido)
- §list§ (sequência dinâmica), §tuple§ (imutável, chave de dict), §dict§ (**mapa hash, ordem de inserção garantida**: medido §['b','a','c']§), §set§ (únicos, busca O(1)), §collections.deque§, §heapq§, §dataclass§.
- **Busca em lista × conjunto** (100.000 elementos, 200 buscas do último): **§in list§ 630,3 ms** × **§in set§ 0,059 ms**: **~10.771 vezes**: escolha a estrutura pelo **padrão de acesso** (O(n) × O(1)).

### Compreensões, geradores e strings
- **Compreensão de lista** (§[i * 2 for i in range(N)]§): medido **41,1 ms** × laço §for§ com §append§ **46,4 ms** (200.000 itens): ~**11%** mais rápida e **mais legível**; existem de **dict**, **set** e **geradoras** (§(... for ...)§).
- **Strings**: §s += str(i)§ em laço (50.000) levou **26,1 ms** e §''.join(...)§ **22,8 ms**: o CPython **otimiza** o §+=§ em casos simples, mas **§join§ é o idioma seguro** (não dependa da otimização).
- **f-strings**: §f'olá, {nome!r}, {3.14159:.2f}, {1234567:,}'§ → §olá, 'João', 3.14, 1,234,567§ (medido).
- **Bytes e Unicode**: §len('João')§ = **4** caracteres, **5 bytes** em UTF-8; §'é' == 'é'§ → **False** (mesmo texto visível, **normalização** diferente): use §unicodedata.normalize('NFC', s)§ ao comparar entrada de usuários. **Sempre** indique §encoding='utf-8'§ ao abrir arquivos.

### Valores "falsos" (*falsy*)
Medido: §bool(v)§ é **False** para §0§, §0.0§, §''§, §[]§, §{}§, §set()§, §None§; **True** para §'0'§ e §[0]§ (**texto "0" e lista não vazia são verdadeiros**). Para distinguir "vazio" de "None", compare **explicitamente** (§if x is None§).

### Boas práticas
Siga a **PEP 8** (e um formatador como **Ruff/Black**, não executados aqui); **nomes claros**; **funções pequenas**; **sem efeitos colaterais ocultos**; **§Decimal§ para dinheiro**; **§is None§**; **sem argumentos padrão mutáveis**; **copie conscientemente**; **escolha a estrutura certa**.`,
  concepts: [
    { term: 'Tipagem dinâmica', def: 'O tipo pertence ao objeto em tempo de execução, não ao nome da variável.' },
    { term: 'Tipagem forte', def: 'Operações entre tipos incompatíveis geram erro em vez de conversão silenciosa.' },
    { term: 'Imutável', def: 'Objeto que não pode ser alterado depois de criado, como int, str e tuple.' },
    { term: 'is x ==', def: 'is compara identidade de objetos; == compara valores.' },
    { term: 'Argumento padrão mutável', def: 'Valor padrão criado uma única vez na definição da função e compartilhado entre chamadas.' },
    { term: 'Cópia rasa', def: 'Cópia que duplica só o contêiner externo e compartilha os objetos internos.' },
    { term: 'Compreensão', def: 'Sintaxe concisa para construir listas, dicionários, conjuntos ou geradores.' },
    { term: 'Decimal', def: 'Tipo de decimais exatos, adequado a valores monetários.' },
    { term: 'Falsy', def: 'Valor considerado falso em contexto booleano, como 0, "", [] e None.' },
    { term: 'Normalização Unicode', def: 'Representação canônica de caracteres equivalentes, como NFC.' }
  ],
  examples: R`**Analogia:** em Python, uma variável é uma **etiqueta colada em um objeto**, não uma caixa com conteúdo: **duas etiquetas no mesmo objeto** (listas) enxergam as **mesmas mudanças**; **copiar a lista** é **fazer uma segunda caixa** mas, se dentro há **outras caixas** (listas internas), a cópia rasa **leva as mesmas caixas internas**. O **argumento padrão mutável** é **uma caderneta deixada na porta da função**: todo mundo que chama **escreve na mesma caderneta**. A **identidade** é "**é a mesma coisa física?**"; a igualdade, "**tem o mesmo conteúdo?**".

**Exemplo 1: float.** 0.1 + 0.2 = 0.30000000000000004; Decimal dá 0.3.

**Exemplo 2: padrão mutável.** [1] e depois [1, 2]; corrigido: [1] e [2].

**Exemplo 3: estrutura.** in list 630 ms x in set 0,059 ms.`,
  code: [
    { title: 'Armadilhas clássicas (Python 3.14.4; saídas medidas)', lang: 'python', code: R`print(0.1 + 0.2, 0.1 + 0.2 == 0.3)                    # 0.30000000000000004 False
from decimal import Decimal; print(Decimal('0.1') + Decimal('0.2'))   # 0.3
print(7 // 2, -7 // 2, 7 % -3, 2 ** 100)               # 3 -4 -2 1267650600228229401496703205376

def adicionar(item, lista=[]):                          # ARMADILHA: a lista padrão é criada uma vez
    lista.append(item); return lista
print(adicionar(1)); print(adicionar(2))                # [1]  e  [1, 2]

def adicionar_ok(item, lista=None):
    if lista is None: lista = []
    lista.append(item); return lista
print(adicionar_ok(1), adicionar_ok(2))                 # [1] [2]

import copy
orig = [[1, 2], [3, 4]]; rasa = orig.copy(); funda = copy.deepcopy(orig); orig[0].append(99)
print(orig, rasa, funda)                                # [[1, 2, 99], [3, 4]] [[1, 2, 99], [3, 4]] [[1, 2], [3, 4]]`, notes: [{ l: '4', t: 'O valor padrão existe uma única vez, na definição.' }, { l: '16', t: 'A cópia rasa compartilha as listas internas.' }] },
    { title: 'Estruturas e idiomas (Python 3.14.4; custos medidos)', lang: 'python', code: R`import timeit
n = 100_000; lista = list(range(n)); conj = set(lista); alvo = n - 1
print(timeit.timeit(lambda: alvo in lista, number=200) * 1000, 'ms')   # ~630 ms
print(timeit.timeit(lambda: alvo in conj, number=200) * 1000, 'ms')    # ~0,059 ms (cerca de 10.000x)

quadrados = [i * i for i in range(10) if i % 2 == 0]                   # compreensão com filtro
por_tamanho = {len(p): p for p in ['a', 'bb', 'ccc']}                  # compreensão de dicionário
texto = ''.join(str(i) for i in range(5))                              # concatenação idiomática
x = None
if x is None: print('use "is None" para comparar com None')`, notes: [{ l: '3', t: 'Busca linear em lista: O(n).' }, { l: '4', t: 'Busca por hash em set: O(1).' }] }
  ],
  bestPractices: ['Use is None para None e == para valores.', 'Evite argumentos padrão mutáveis: use None e crie dentro da função.', 'Use Decimal (de texto) para dinheiro e math.isclose para floats.', 'Escolha list, dict ou set pelo padrão de acesso e use compreensões.', 'Copie conscientemente (rasa x profunda) e prefira dados imutáveis.', 'Abra arquivos com encoding explícito e normalize Unicode ao comparar entradas.'],
  mistakes: ['Comparar números ou textos com is.', 'Argumento padrão mutável compartilhado entre chamadas.', 'Comparar floats com == ou usar float para dinheiro.', 'Achar que copy() copia objetos internos.', 'Testar pertencimento em listas grandes em laços.', 'Confundir texto "0" e lista não vazia com valores falsos.'],
  market: R`As armadilhas de mutabilidade, identidade e float são perguntas clássicas de entrevistas de Python e causas frequentes de bugs sutis em produção.`,
  summary: R`Python é dinâmico e forte: 1 + '1' lança TypeError e inteiros não têm limite. Medido no 3.14.4: 0.1 + 0.2 ≠ 0.3 (Decimal resolve); -7 // 2 = -4; is não serve para números (int('1000') is int('1000') é False); o argumento padrão mutável deu [1] e depois [1, 2]; a cópia rasa compartilhou a lista interna; in em set foi ~10.771x mais rápido que em list; a compreensão (41,1 ms) venceu o laço (46,4 ms) em 200 mil itens; len('João') é 4, mas são 5 bytes.`,
  refs: [REF.pyTutorial, REF.pyDatamodel, REF.pyBuiltinTypes, REF.pyDecimal, REF.pyCopy, REF.pep8, REF.pep20],
  cards: [
    { q: 'O Python converte 1 + "1" automaticamente?', a: 'Não: lança TypeError (tipagem forte), ao contrário do JavaScript.' },
    { q: 'Por que is não serve para comparar números?', a: 'Compara identidade; o CPython só reutiliza inteiros pequenos (medido: int("1000") is int("1000") é False).' },
    { q: 'Qual a armadilha do argumento padrão mutável?', a: 'O valor padrão é criado uma vez e compartilhado entre as chamadas (medido: [1] e depois [1, 2]).' },
    { q: 'O que a cópia rasa compartilha?', a: 'Os objetos internos: alterá-los afeta o original e a cópia.' },
    { q: 'Quando usar Decimal?', a: 'Para valores monetários e cálculos decimais exatos, criado a partir de texto.' }
  ]
},
{
  id: 'pyt-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['funções', 'args e kwargs', 'closures', 'decoradores', 'geradores', 'módulos', 'pacotes', 'venv'],
  title: 'Funções e módulos: argumentos, closures, decoradores, geradores, pacotes e ambientes virtuais',
  objectives: ['Usar argumentos posicionais, nomeados, *args, **kwargs e somente-nomeados', 'Evitar a armadilha da ligação tardia em closures', 'Escrever decoradores com functools.wraps e usar lru_cache', 'Usar geradores para processar dados com memória constante', 'Organizar código em módulos e pacotes e isolar dependências com venv'],
  intro: R`Funções em Python são **objetos de primeira classe**: podem ser passadas, retornadas e **decoradas**. Aqui você mede: **geradores** (lista de 1 milhão = **8,1 MiB**; gerador = **200 bytes**), **§lru_cache§** (fibonacci de 32: **1.220 ms → 0,061 ms**), e vê o **sistema de módulos** (pacote criado e importado em tempo de execução, **cache de importação** em §sys.modules§) e o papel do **ambiente virtual**.`,
  theory: R`### Argumentos
§§§
def f(a, b=2, /, c=3, *args, d, **kw): ...
§§§
- §a, b§ antes do §/§: **somente posicionais**; §c§: posicional **ou** nomeado; §*args§: **os demais posicionais** em uma tupla; §d§ (depois de §*args§): **somente nomeado** e **obrigatório**; §**kw§: **nomeados extras** em um dict.
Medido: §f(1, d=4)§ → §(1, 2, 3, (), 4, {})§; §f(1, 5, 6, 7, 8, d=9, extra=True)§ → §(1, 5, 6, (7, 8), 9, {'extra': True})§; sem o §d§: **TypeError: f() missing 1 required keyword-only argument: 'd'**. **Prefira argumentos nomeados** em chamadas com vários parâmetros (legibilidade e evolução da API); use **§*§** para forçar nomes.
**Desempacotamento**: §f(*lista, **dicionario)§; §a, *resto = lista§.

### Closures e a ligação tardia
Uma **closure** captura **variáveis** do escopo, **não valores**. Medido: §[lambda: i for i in range(3)]§ → chamadas devolvem **§[2, 2, 2]§** (todas veem o **último** §i§); com **valor padrão capturado** (§lambda i=i: i§) → **§[0, 1, 2]§**. Para modificar uma variável do escopo externo use **§nonlocal§** (e **§global§**, com parcimônia).

### Decoradores
Um decorador é uma **função que recebe uma função e devolve outra**:
§§§
def cronometrar(fn):
    @functools.wraps(fn)                  # preserva __name__ e __doc__
    def interno(*a, **k):
        t0 = time.perf_counter(); r = fn(*a, **k); interno.ultimo_ms = (time.perf_counter() - t0) * 1000; return r
    return interno
@cronometrar
def soma_quadrados(n): """soma de quadrados"""; return sum(i * i for i in range(n))
§§§
Medido: resultado §333328333350000§, **nome preservado** (§soma_quadrados§), **docstring** preservada e tempo registrado (~22 ms). **Sem §wraps§**, a função "vira" §interno§ (perde nome, docstring e dicas de tipo). Usos: **log**, **tempo**, **cache**, **autorização**, **retry**, **registro de rotas** (FastAPI: aula pyt-04).

### Geradores e iteradores
Uma função com **§yield§** produz valores **sob demanda** (**preguiçosa**). Medido (1 milhão de inteiros):
- **lista** (§[i for i in range(n)]§): **8,1 MiB** (§sys.getsizeof§, só o contêiner de ponteiros; os objetos inteiros ocupam mais);
- **gerador** (§(i for i in range(n))§): **200 bytes**; as duas soluções somam **499.999.500.000**.
O experimento com §print§ mostrou a **intercalação**: "produziu 0 / consumiu 0 / produziu 1 / consumiu 1 ...": **cada valor é produzido só quando pedido**. Use **geradores** para **arquivos grandes**, **fluxos** e **pipelines**; **§itertools§** (§islice§, §chain§, §groupby§) compõe iteradores. **Cuidado**: um gerador **se esgota** (só pode ser consumido uma vez).

### Cache com functools.lru_cache
§@functools.lru_cache(maxsize=None)§ guarda resultados por **argumentos (hashable)**. Medido (fibonacci recursivo de 32): **sem cache 1.220 ms** × **com cache 0,061 ms**; §fib_c.cache_info()§ → §CacheInfo(hits=30, misses=33, maxsize=None, currsize=33)§. **Cuidados**: funções **puras** (mesmo argumento, mesmo resultado); **memória** (use §maxsize§); **argumentos não hashable** (listas) não funcionam; em **métodos**, o §self§ entra na chave (vazamento de instâncias): considere §cached_property§ ou cache externo (aula cch).

### Módulos e pacotes
- **Módulo** = um arquivo §.py§; **pacote** = diretório com §__init__.py§ (opcional em *namespace packages*). Importe com §import pacote.modulo§ ou §from pacote.modulo import nome§; **evite** §from x import *§.
- Medido: criamos §loja/§ com §__init__.py§ (que imprime ao ser carregado e define §VERSAO = '1.0'§) e §loja/precos/calculo.py§: **o §__init__§ executa na primeira importação**; §calculo.com_imposto(100)§ → **110.0**; §calculo.__name__§ = §loja.precos.calculo§; um **segundo import devolve o mesmo objeto** (**cache em §sys.modules§**: True); §importlib.reload§ **reexecuta** o módulo.
- **§if __name__ == '__main__':§**: o bloco só roda quando o arquivo é **executado**, não importado (essencial em scripts; aula pyt-03 e **obrigatório para multiprocessing**, aula pyt-06).
- **Importações circulares**: reorganize (extraia um terceiro módulo) ou importe dentro da função.
- **Estrutura** recomendada: §src/pacote/...§, §tests/§, §pyproject.toml§ (aula abaixo).

### Ambientes virtuais e dependências
**§python -m venv .venv§** cria um **ambiente isolado** (cópia/ligação do interpretador e um §site-packages§ próprio); medido: **§sys.prefix != sys.base_prefix§ → True** dentro do venv. Instale com §pip install -r requirements.txt§; **fixe versões** (§pip freeze§: o laboratório usa FastAPI 0.165.0, Pydantic 2.14.4 etc.). **Projetos modernos** declaram metadados e dependências no **§pyproject.toml§** (PEP 621) e usam ferramentas como **uv**, **Poetry** ou **pip-tools** com **lockfile** (**não executados** aqui). **Nunca** instale pacotes no Python do sistema (§--break-system-packages§); **um venv por projeto**; **não versione** §.venv§.
**Supply chain**: confira nomes (*typosquatting*), use **hashes** (§pip install --require-hashes§), **auditoria** (§pip-audit§, **não executado**) e atualizações controladas (aula nex-02, mesmos riscos do npm).

### Dados estruturados: dataclasses
§@dataclass(frozen=True)§ gera **§__init__§, §__repr__§, §__eq__§** e (com §frozen§) **imutabilidade e hash**: **modelo de dados leve** (aula pyt-05 liga com tipos; a validação em execução é do **Pydantic**, aula pyt-04).`,
  concepts: [
    { term: '*args e **kwargs', def: 'Parâmetros que coletam argumentos posicionais extras em uma tupla e nomeados extras em um dict.' },
    { term: 'Argumento somente nomeado', def: 'Parâmetro que só pode ser passado por nome, declarado após *args ou *.' },
    { term: 'Closure', def: 'Função que captura variáveis do escopo em que foi definida.' },
    { term: 'Ligação tardia', def: 'Comportamento em que closures veem o valor atual da variável quando chamadas, não o do momento da criação.' },
    { term: 'Decorador', def: 'Função que recebe uma função e devolve outra, estendendo seu comportamento.' },
    { term: 'Gerador', def: 'Função com yield que produz valores sob demanda, de forma preguiçosa.' },
    { term: 'lru_cache', def: 'Decorador que memoriza resultados de funções puras com política de menos usados recentemente.' },
    { term: 'sys.modules', def: 'Cache dos módulos já importados, que evita reexecutar a importação.' },
    { term: 'Ambiente virtual', def: 'Diretório com um interpretador e pacotes isolados para um projeto.' },
    { term: 'pyproject.toml', def: 'Arquivo padrão com metadados, dependências e configurações de um projeto Python.' }
  ],
  examples: R`**Analogia:** um **decorador** é **embalar um presente**: o presente (a função) é o mesmo, mas a embalagem acrescenta algo (cronômetro, cache, autorização) — e o **wraps** é **colar a etiqueta original** na embalagem, para ninguém perder o nome. O **gerador** é um **garçom que traz um prato por vez** conforme você pede; a lista é **trazer todos os 1.000.000 de pratos para a mesa de uma vez**. O **venv** é uma **bancada de oficina própria** para cada projeto: as ferramentas de um não se misturam com as do outro.

**Exemplo 1: closures.** Lambdas em laço: [2, 2, 2]; com valor padrão: [0, 1, 2].

**Exemplo 2: gerador.** 8,1 MiB para a lista e 200 bytes para o gerador.

**Exemplo 3: cache.** fib(32): 1.220 ms sem cache e 0,061 ms com lru_cache.`,
  code: [
    { title: 'Argumentos, closures e decoradores (Python 3.14.4; saídas medidas)', lang: 'python', code: R`import functools, time

def f(a, b=2, /, c=3, *args, d, **kw): return (a, b, c, args, d, kw)
print(f(1, d=4))                                  # (1, 2, 3, (), 4, {})
print(f(1, 5, 6, 7, 8, d=9, extra=True))          # (1, 5, 6, (7, 8), 9, {'extra': True})

fs = [lambda: i for i in range(3)]; print([g() for g in fs])             # [2, 2, 2]  (ligação tardia)
fs2 = [lambda i=i: i for i in range(3)]; print([g() for g in fs2])       # [0, 1, 2]

def cronometrar(fn):
    @functools.wraps(fn)                                                  # preserva nome e docstring
    def interno(*a, **k):
        t0 = time.perf_counter(); r = fn(*a, **k); interno.ultimo_ms = (time.perf_counter() - t0) * 1000; return r
    return interno

@cronometrar
def soma_quadrados(n):
    """soma de quadrados"""
    return sum(i * i for i in range(n))
print(soma_quadrados(100_000), soma_quadrados.__name__, soma_quadrados.__doc__)`, notes: [{ l: '6', t: 'Todas as lambdas leem o mesmo i, já no valor final.' }, { l: '10', t: 'wraps copia __name__, __doc__ e outros metadados.' }] },
    { title: 'Geradores e lru_cache (Python 3.14.4; resultados medidos)', lang: 'python', code: R`import sys, functools

n = 1_000_000
lista = [i for i in range(n)]; gerador = (i for i in range(n))
print(sys.getsizeof(lista) / 1048576, 'MiB', sys.getsizeof(gerador), 'bytes')      # 8.1 MiB  200 bytes
print(sum(lista), sum(i for i in range(n)))                                          # 499999500000 499999500000

def fib(n): return n if n < 2 else fib(n - 1) + fib(n - 2)                           # ~1220 ms para n = 32
@functools.lru_cache(maxsize=None)
def fib_c(n): return n if n < 2 else fib_c(n - 1) + fib_c(n - 2)                     # ~0,061 ms
fib_c(32); print(fib_c.cache_info())                                                  # CacheInfo(hits=30, misses=33, maxsize=None, currsize=33)`, notes: [{ l: '4', t: 'getsizeof mede só o contêiner, não os objetos internos.' }, { l: '10', t: 'A recursão repetida vira consulta ao cache.' }] }
  ],
  bestPractices: ['Use argumentos nomeados e somente-nomeados para APIs claras.', 'Evite a ligação tardia capturando valores ou usando funções auxiliares.', 'Use functools.wraps em todos os decoradores.', 'Processe dados grandes com geradores e cache apenas funções puras.', 'Organize em pacotes com __init__ enxuto e proteja scripts com __name__ == "__main__".', 'Use um venv por projeto, fixe versões e não instale no Python do sistema.'],
  mistakes: ['Lambdas em laço esperando valores diferentes.', 'Decorador sem wraps, perdendo nome e docstring.', 'Consumir um gerador duas vezes.', 'lru_cache em funções com efeitos colaterais ou argumentos mutáveis.', 'Executar código no import (sem proteção de __main__).', 'Instalar dependências globalmente.'],
  market: R`Decoradores, geradores, closures e a gestão de ambientes e dependências aparecem em toda base de código Python profissional e em entrevistas.`,
  summary: R`Os argumentos do Python (posicionais, nomeados, *args, **kwargs e somente-nomeados) permitem APIs claras; closures capturam variáveis (lambdas em laço deram [2, 2, 2]); decoradores precisam de functools.wraps. Medido: a lista de 1 milhão ocupou 8,1 MiB e o gerador 200 bytes; lru_cache reduziu fib(32) de 1.220 ms para 0,061 ms; o import criou o pacote, executou o __init__ uma vez e reutilizou o módulo em sys.modules; o venv isolou o ambiente (sys.prefix ≠ sys.base_prefix).`,
  refs: [REF.pyDefineFunctions, REF.pyFunctools, REF.pyModules, REF.pyImport, REF.pyVenv, REF.pyPyproject, REF.pyDataclasses],
  cards: [
    { q: 'Qual a armadilha da ligação tardia?', a: 'Closures veem o valor atual da variável: lambdas em laço devolvem o último valor ([2, 2, 2]).' },
    { q: 'Para que serve functools.wraps?', a: 'Preservar nome, docstring e metadados da função decorada.' },
    { q: 'Quando usar geradores?', a: 'Para processar dados grandes ou fluxos com memória constante (medido: 8,1 MiB x 200 bytes).' },
    { q: 'O que sys.modules faz?', a: 'Guarda os módulos já importados, de modo que o segundo import devolve o mesmo objeto.' },
    { q: 'Por que usar um venv por projeto?', a: 'Para isolar dependências e versões, sem alterar o Python do sistema.' }
  ]
}
];
