// C4.8 — Python para desenvolvedores. Aulas 5 e 6 (type hints e mypy; asyncio, concorrência e o projeto).
import { REF } from './c48-a.mjs';
const R = String.raw;

export const REF3 = {
  pyTyping: { title: 'Python — typing', url: 'https://docs.python.org/3/library/typing.html', kind: 'doc' },
  pep484: { title: 'PEP 484 — Type Hints', url: 'https://peps.python.org/pep-0484/', kind: 'especificação' },
  pep544: { title: 'PEP 544 — Protocols: Structural subtyping', url: 'https://peps.python.org/pep-0544/', kind: 'especificação' },
  pep649: { title: 'PEP 649 — Deferred evaluation of annotations', url: 'https://peps.python.org/pep-0649/', kind: 'especificação' },
  mypy: { title: 'mypy — documentação', url: 'https://mypy.readthedocs.io/en/stable/', kind: 'doc' },
  typingSpec: { title: 'Python typing specification', url: 'https://typing.python.org/en/latest/spec/', kind: 'especificação' },
  pyAsyncio: { title: 'Python — asyncio', url: 'https://docs.python.org/3/library/asyncio.html', kind: 'doc' },
  pyAsyncioTask: { title: 'Python — Coroutines and Tasks (TaskGroup, timeout)', url: 'https://docs.python.org/3/library/asyncio-task.html', kind: 'doc' },
  pyConcurrent: { title: 'Python — concurrent.futures', url: 'https://docs.python.org/3/library/concurrent.futures.html', kind: 'doc' },
  pyMultiprocessing: { title: 'Python — multiprocessing (contexts and start methods)', url: 'https://docs.python.org/3/library/multiprocessing.html#contexts-and-start-methods', kind: 'doc' },
  pyGilFaq: { title: 'Python — Global Interpreter Lock (FAQ)', url: 'https://docs.python.org/3/faq/library.html#what-kinds-of-global-value-mutation-are-thread-safe', kind: 'doc' },
  pyFreeThreading: { title: 'Python — Python support for free threading', url: 'https://docs.python.org/3/howto/free-threading-python.html', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'pyt-05', moduleId: 'm3', order: 5, minutes: 85, tags: ['type hints', 'mypy', 'Protocol', 'TypedDict', 'genéricos', 'Optional', 'Pydantic'],
  title: 'Tipagem com type hints: mypy --strict, Protocol, TypedDict, None seguro e o que é verificado em execução',
  objectives: ['Anotar funções, classes e coleções com type hints modernos (list[int], X | None)', 'Rodar o mypy em modo estrito e interpretar suas mensagens', 'Usar Protocol, TypedDict, TypeVar e Callable', 'Entender que as anotações não são verificadas em execução e quando usar Pydantic', 'Adotar a tipagem gradualmente em um projeto'],
  intro: R`Os **type hints** documentam e **permitem verificar estaticamente** o código **sem mudar a execução**. Com o **mypy 2.4.1** em modo **§--strict§** você mede o que ele **encontra** (**6 erros** em um arquivo, em **7 mensagens**), e vê que **o Python executa normalmente** código com tipos errados (**as anotações não são verificadas em tempo de execução**), ao contrário do **Pydantic**, que **valida** dados em execução.`,
  theory: R`### Type hints modernos (Python 3.9+/3.10+)
§§§
def total(itens: list[Item], prec: Precificador) -> float: ...        # list[int], dict[str, int], tuple[int, ...]
def buscar(id: int) -> str | None: ...                                 # união com | (em vez de Optional[str])
@dataclass(frozen=True)
class Pedido: id: int; itens: list[Item]; cupom: str | None = None
§§§
- **Embutidos genéricos**: §list[int]§, §dict[str, float]§, §set[str]§, §tuple[int, str]§; **união**: §int | str§; **opcional**: §str | None§; **qualquer**: §Any§ (evite); **chamável**: §Callable[[int], int]§; **iteráveis**: §Iterable[T]§, §Sequence[T]§ (aceite o tipo **mais geral**, devolva o **mais específico**).
- **§TypedDict§**: **dicionário com chaves tipadas** (ótimo para JSON); **§dataclass§**: classes de dados; **§NamedTuple§**; **§Literal['a', 'b']§**; **§Final§**; **§Self§** (3.11+).
- **§TypeVar§/genéricos**: §def primeiro(itens: Iterable[T], padrao: T) -> T§ (o tipo de saída **acompanha** o de entrada); sintaxe nova §def primeiro[T](...)§ (3.12+).
- **§Protocol§** (**tipagem estrutural**, PEP 544): "**qualquer objeto que tenha este método serve**", **sem herança**:
§§§
class Precificador(Protocol):
    def preco(self, sku: str) -> float: ...
class Tabela:                                  # não herda de Precificador, mas "cumpre"
    def preco(self, sku: str) -> float: return self.precos[sku]
§§§
É o **duck typing verificável** (como as interfaces estruturais do TypeScript; aula nst-02).
- **Anotações adiadas**: no Python 3.14 as anotações são **avaliadas de forma preguiçosa** (PEP 649); §from __future__ import annotations§ ainda aparece em código compatível com versões anteriores.

### O mypy em ação (medido: mypy 2.4.1)
**Arquivo correto** (§exemplo_ok.py§: TypedDict, dataclass congelada, Protocol, TypeVar, Callable): **§Success: no issues found in 1 source file§** (código **0**); **executa** e imprime §90.0 0 [2, 3]§.
**Arquivo com erros** (§mypy --strict§): **7 mensagens** para **6 problemas** (a linha 19 e a 21 acumulam dois):
| Linha | Mensagem do mypy | Código |
|---|---|---|
| 18 | §Incompatible types in assignment (expression has type "str", variable has type "int")§ | §assignment§ |
| 19 | §Incompatible types (expression has type "str", TypedDict item "qtd" has type "int")§ | §typeddict-item§ |
| 19 | §Argument 2 to "total" has incompatible type "SemMetodo"; expected "Precificador"§ | §arg-type§ |
| 20 | §Item "None" of "str \| None" has no attribute "upper"§ | §union-attr§ |
| 21 | §Missing key "qtd" for TypedDict "Item"§ | §typeddict-item§ |
| 21 | §Argument 2 to "total" has incompatible type "None"; expected "Precificador"§ | §arg-type§ |
| 22 | §Incompatible return value type (got "int", expected "str")§ | §return-value§ |
**Código de saída 1** (erros): **use no CI** para **barrar** regressões. O erro **§union-attr§** é o "**erro de um bilhão de dólares**" (*null reference*) pego **antes** de rodar: o mypy exige tratar o §None§ (§if x is not None:§ ou §x and x.upper()§) — **narrowing**.

### Em tempo de execução, as anotações NÃO são verificadas (medido)
§x: int = 'texto'; print(x)§ → o Python **executa sem reclamar**: §x = 'texto'§, **tipo real §str§**. Os hints são **metadados** (usados por mypy, IDEs, **FastAPI** e **Pydantic**). Para **validar dados externos** (JSON de requisições, arquivos, variáveis de ambiente) use **validação em execução**: **Pydantic**: §M(n='12')§ → §n=12§ (coerção) e §M(n='doze')§ → **§int_parsing§: "Input should be a valid integer, unable to parse string as an integer"** (medido). **Divisão de responsabilidades**: **mypy** garante **coerência interna** do código; **Pydantic** protege **a fronteira** com o mundo externo.

### Adoção gradual
1. Comece pelas **funções públicas** e pelos **modelos de dados**; use §--strict§ em **módulos novos** e **relaxe** por módulo no §pyproject.toml§ (§[[tool.mypy.overrides]]§);
2. **Evite §Any§** e §# type: ignore§ sem justificativa (use **códigos**: §# type: ignore[arg-type]§);
3. **Bibliotecas sem tipos**: pacotes §types-*§ (stubs) ou §ignore_missing_imports§ **pontual**;
4. **CI**: §mypy --strict src§ + testes; **editor** com Pylance/pyright (**não executado**) para feedback imediato;
5. **Tipos como documentação**: §TypedDict§/§Protocol§ no limite entre módulos; **testes** continuam necessários (tipos não provam regras de negócio).

### Pydantic x dataclass x TypedDict
| | Valida em execução? | Uso |
|---|---|---|
| **TypedDict** | não (só estático) | formato de dicts/JSON já validados |
| **dataclass** | não | modelos internos leves |
| **Pydantic BaseModel** | **sim** (coerção e erros) | entradas externas, configuração, APIs |
**Pydantic Settings** (**não executado**) valida **variáveis de ambiente** na partida (falhar rápido: aula nex-07).

### Armadilhas
**Variância** (§list[int]§ **não** é §list[float]§: listas são mutáveis; use §Sequence[float]§), **mutáveis em padrões** (aula pyt-01), **§Optional§ ≠ opcional** (§Optional[int]§ **aceita None**, mas o argumento ainda é obrigatório sem padrão), **tipos recursivos** e **import circular** só para tipos (§if TYPE_CHECKING:§).`,
  concepts: [
    { term: 'Type hint', def: 'Anotação de tipo em código Python usada por ferramentas estáticas, sem efeito na execução.' },
    { term: 'mypy', def: 'Verificador estático de tipos para Python.' },
    { term: 'Protocol', def: 'Tipo estrutural: qualquer objeto com os métodos exigidos satisfaz o protocolo.' },
    { term: 'TypedDict', def: 'Dicionário com chaves e tipos de valores declarados para verificação estática.' },
    { term: 'TypeVar', def: 'Variável de tipo que relaciona os tipos de entrada e de saída em funções e classes genéricas.' },
    { term: 'Narrowing', def: 'Refinamento do tipo de uma variável após uma verificação, como is not None.' },
    { term: 'Tipagem gradual', def: 'Adoção de tipos aos poucos, misturando código tipado e não tipado.' },
    { term: 'Pydantic', def: 'Biblioteca que valida e converte dados em tempo de execução a partir de anotações.' },
    { term: 'Stub', def: 'Arquivo com as anotações de tipos de uma biblioteca sem tipos.' },
    { term: 'Variância', def: 'Regra que define quando um tipo genérico pode ser substituído por outro (list[int] não é list[float]).' }
  ],
  examples: R`**Analogia:** os **type hints** são **etiquetas de "frágil", "este lado para cima" nas caixas**: o **mypy** é o **conferente do depósito** que **barra** a caixa mal etiquetada **antes** de sair; mas se você passa por fora do conferente, o **caminhão (o Python) leva a caixa do mesmo jeito**. O **Pydantic** é o **fiscal na portaria da fábrica**, que abre a caixa que **vem de fora** e **confere o conteúdo**. O **Protocol** é "**qualquer fornecedor que entregue peças com este encaixe serve**", sem exigir que seja da mesma marca.

**Exemplo 1: mypy.** 6 problemas em 7 mensagens, código de saída 1.

**Exemplo 2: execução.** x: int = 'texto' roda sem reclamar (tipo real str).

**Exemplo 3: Pydantic.** n='12' vira 12; n='doze' dá int_parsing.`,
  code: [
    { title: 'Tipos modernos, Protocol e TypedDict (Python 3.14.4; mypy --strict sem problemas)', lang: 'python', code: R`from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol, TypedDict, TypeVar, Iterable, Callable

class Item(TypedDict):
    sku: str
    qtd: int

@dataclass(frozen=True)
class Pedido:
    id: int
    itens: list[Item]
    cupom: str | None = None

class Precificador(Protocol):
    def preco(self, sku: str) -> float: ...

class Tabela:
    def __init__(self, precos: dict[str, float]) -> None: self.precos = precos
    def preco(self, sku: str) -> float: return self.precos[sku]

def total(p: Pedido, prec: Precificador) -> float:
    bruto = sum(prec.preco(i['sku']) * i['qtd'] for i in p.itens)
    return round(bruto * 0.9, 2) if p.cupom == 'DEZ' else round(bruto, 2)

T = TypeVar('T')
def primeiro(itens: Iterable[T], padrao: T) -> T:
    for x in itens: return x
    return padrao

print(total(Pedido(1, [{'sku': 'A', 'qtd': 2}], 'DEZ'), Tabela({'A': 50.0})), primeiro([], 0))   # 90.0 0`, notes: [{ l: '17', t: 'Protocol: qualquer objeto com preco(sku) -> float serve.' }, { l: '30', t: 'O tipo de saída acompanha o de entrada.' }] },
    { title: 'Erros que o mypy pega e a validação em execução do Pydantic (saídas medidas)', lang: 'python', code: R`x: int = 'texto'                                   # mypy: Incompatible types in assignment ... [assignment]
print(buscar(1).upper())                           # mypy: Item "None" of "str | None" has no attribute "upper"  [union-attr]
total([{'sku': 'A', 'qtd': '2'}], SemMetodo())     # mypy: TypedDict item "qtd" ... [typeddict-item]  e  Argument 2 ... "Precificador" [arg-type]
# $ python -m mypy --strict exemplo_erros.py  ->  7 mensagens, código de saída 1

from pydantic import BaseModel, ValidationError
class M(BaseModel): n: int
print(M(n='12'))                                   # n=12  (coerção)
try: M(n='doze')
except ValidationError as e: print(e.errors()[0]['type'])      # int_parsing`, notes: [{ l: '2', t: 'O mypy exige tratar o None antes de chamar o método.' }, { l: '10', t: 'Pydantic valida em execução; mypy valida antes.' }] }
  ],
  bestPractices: ['Anote funções públicas e modelos de dados e rode mypy --strict no CI.', 'Use X | None, list[int] e Protocol e evite Any e type: ignore sem código.', 'Trate o None explicitamente (narrowing).', 'Use Pydantic para validar entradas externas e TypedDict ou dataclass para estruturas internas.', 'Adote tipos gradualmente, módulo a módulo.', 'Lembre que tipos não substituem testes.'],
  mistakes: ['Achar que os type hints são verificados em execução.', 'Usar Any para silenciar o mypy.', 'Ignorar o None e receber AttributeError em produção.', 'Usar TypedDict ou dataclass para validar dados externos.', 'type: ignore genérico sem justificativa.', 'Não rodar o verificador no CI.'],
  market: R`Código Python tipado e verificado é o padrão em equipes de médio e grande porte e em projetos de IA e dados; mypy e pyright aparecem em pipelines e em entrevistas.`,
  summary: R`Os type hints modernos (list[int], X | None, Protocol, TypedDict, TypeVar) documentam e permitem verificação estática. Medido com o mypy 2.4.1 --strict: o arquivo correto passou (código 0) e executou; o arquivo com problemas gerou 7 mensagens (assignment, typeddict-item, arg-type, union-attr, return-value) e código 1. Em execução as anotações não são verificadas (x: int = 'texto' roda); o Pydantic valida dados externos (n='12' vira 12; n='doze' dá int_parsing). Adote os tipos gradualmente e rode o mypy no CI.`,
  refs: [REF3.pyTyping, REF3.pep484, REF3.pep544, REF3.mypy, REF3.typingSpec, REF3.pep649],
  cards: [
    { q: 'O Python verifica os type hints em execução?', a: 'Não: são metadados; x: int = "texto" executa sem erro (medido).' },
    { q: 'O que o Protocol permite?', a: 'Tipagem estrutural: qualquer objeto com os métodos exigidos satisfaz o tipo, sem herança.' },
    { q: 'O que o mypy --strict devolve com erros?', a: 'Mensagens com códigos como [arg-type] e código de saída 1, ideal para o CI.' },
    { q: 'Quando usar Pydantic em vez de TypedDict?', a: 'Para validar e converter dados externos em execução.' },
    { q: 'Como tratar o erro union-attr com None?', a: 'Fazendo narrowing: if x is not None antes de usar o valor.' }
  ]
},
{
  id: 'pyt-06', moduleId: 'm3', order: 6, minutes: 95, tags: ['asyncio', 'concorrência', 'GIL', 'threads', 'processos', 'TaskGroup', 'to_thread', 'projeto'],
  title: 'asyncio e concorrência em Python: gather, TaskGroup, timeouts, to_thread, o GIL e o projeto',
  objectives: ['Escrever programas assíncronos com asyncio (corrotinas, tasks, gather, TaskGroup, timeout)', 'Evitar bloquear o event loop e usar asyncio.to_thread', 'Explicar o GIL e escolher entre threads, processos e asyncio', 'Usar ProcessPoolExecutor corretamente (guarda __main__ e forkserver)', 'Planejar o projeto integrador "Serviço Python"'],
  intro: R`**asyncio** permite milhares de operações de **E/S** concorrentes em **uma thread**: **100 tarefas de 50 ms** levaram **0,054 s** (contra **5,04 s** em sequência: **~93x**). Mas o **GIL** impede que **threads** acelerem **CPU**: com **4 tarefas de cálculo** em 8 núcleos, **4 threads: 1,03x**; **4 processos: 3,66x**. Aqui você mede tudo isso no **Python 3.14.4** e fecha o curso com o projeto.`,
  theory: R`### asyncio: o essencial
- **Corrotina**: função §async def§; chamar **não executa** — devolve um objeto que precisa ser **aguardado** (§await§) ou **agendado**.
- **Event loop**: roda as corrotinas **cooperativamente**: cada §await§ **cede o controle** enquanto espera E/S.
- §asyncio.run(principal())§ é o **ponto de entrada**; **uma tarefa** (§asyncio.create_task§) roda **concorrentemente**.
Medido — 100 tarefas de **50 ms**:
| Estratégia | Tempo |
|---|---|
| **sequencial** (§await§ uma a uma) | **5,04 s** |
| **§asyncio.gather§** | **0,054 s** (**~93x** mais rápido) |
O §gather§ **preservou a ordem** dos resultados (True). O ganho é **de concorrência de espera**, **não** de CPU.

### TaskGroup, timeout e cancelamento (3.11+) — medido
- **§asyncio.TaskGroup§** (**concorrência estruturada**): se **uma tarefa falha**, as **irmãs são canceladas** e a exceção sai (§except*§: **ExceptionGroup**). Medido: §falha()§ lançou §ValueError('boom')§ → "**tarefa irmã cancelada**" e o grupo propagou §ValueError('boom')§.
- **§gather(..., return_exceptions=True)§**: **isola** falhas (devolve as exceções como resultados): medido §[ValueError('boom'), 1]§.
- **§asyncio.timeout(0.1)§**: medido **TimeoutError após 101 ms**, **cancelando** a tarefa interna. **Todo** I/O de rede precisa de **timeout** (aula api-08).
- **Cancelamento** é uma **exceção** (§CancelledError§): **não a engula**; use §try/finally§ para **liberar recursos**.

### Nunca bloqueie o event loop (medido)
Um "batimento" a cada 10 ms mede o **atraso do loop** (aula nex-01: o mesmo problema do Node):
- §time.sleep(0.1)§ **dentro do loop** → maior atraso do batimento: **101 ms** (**tudo parou**);
- §await asyncio.to_thread(time.sleep, 0.1)§ → **2 ms** (a espera foi para **outra thread**).
Regras: **E/S** → **bibliotecas assíncronas** (§httpx.AsyncClient§, §asyncpg§, §aiofiles§...); **código bloqueante** → §asyncio.to_thread(...)§ ou §loop.run_in_executor§; **CPU pesada** → **processos** (abaixo). **Não misture** drivers síncronos em §async def§ (aula pyt-04: 18,9 req/s contra 261).

### O GIL e a escolha entre threads, processos e asyncio
O **GIL** (*Global Interpreter Lock*) do CPython permite **uma thread executando bytecode por vez**: **threads não paralelizam CPU em Python puro**; liberam o GIL **durante E/S** e em algumas extensões em C. Medido (**8 núcleos**, **GIL ativo: True**; **4 tarefas** de **12 milhões** de iterações cada):
| Estratégia | Tempo | Ganho |
|---|---|---|
| sequencial | 13,51 s | 1,00x |
| **4 threads** (§ThreadPoolExecutor§) | **13,12 s** | **1,03x** (o GIL serializa) |
| **4 processos** (§ProcessPoolExecutor§) | **3,69 s** | **3,66x** |
E para **E/S**: **100 esperas de 50 ms** com **20 threads** → **0,27 s** (ideal 0,25 s; sequencial seria 5,0 s): **threads funcionam bem para E/S**.
**Guia**: **muita E/S, muitas conexões** → **asyncio**; **E/S com bibliotecas síncronas** → **threads**; **CPU pesada** → **processos** (ou **extensões nativas**: NumPy, Rust/C; ou **filas** com workers: curso C4.5); **isolamento** → processos.
**Python sem GIL**: as versões recentes têm uma **compilação "free-threaded"** (PEP 703; **não executada** aqui: nosso interpretador tinha o GIL **ativo**); leia as notas da versão e o *how-to* oficial antes de adotar (compatibilidade de extensões).

### Processos: a armadilha do forkserver (medido)
No **Python 3.14 para Linux**, o método de início padrão de processos é **§forkserver§**, que **reimporta o módulo principal** nos filhos. **Sem** o §if __name__ == '__main__':§, o primeiro teste **falhou** com **§RuntimeError: An attempt has been made to start a new process before the current process has finished its bootstrapping phase§** e **duplicou a saída** (o módulo foi executado de novo no filho). Correção: **proteger o ponto de entrada**, definir as **funções-alvo no nível do módulo** (precisam ser **importáveis e serializáveis por pickle**) e passar **argumentos pequenos**. **Custo**: iniciar processos e **serializar dados** (pickle) — **compensa para tarefas de segundos**, não de milissegundos; **reutilize** o §ProcessPoolExecutor§.

### Padrões úteis
- **Limitar a concorrência**: §asyncio.Semaphore(20)§ (não dispare 10.000 requisições de uma vez);
- **Filas assíncronas**: §asyncio.Queue§ (produtor/consumidor);
- **Contexto assíncrono**: §async with§/§async for§;
- **Retry com backoff e jitter** (aula fil-03) em chamadas externas; **idempotência** (aula api-07);
- **Testes**: §pytest-asyncio§ ou §anyio§ (**não executados**); **depuração**: §asyncio.run(..., debug=True)§ avisa de corrotinas "esquecidas" e de callbacks lentos.

### Projeto integrador: serviço Python
**Cenário**: um **serviço de relatórios** em **FastAPI** que recebe pedidos de relatório, processa CSVs e devolve resultados.
**Entregáveis**:
1. **Pacote** com §pyproject.toml§, **venv**, dependências **fixadas** e **estrutura §src/§ + §tests/§**;
2. **API FastAPI** com **modelos Pydantic** (limites e §extra='forbid'§), **response_model**, **dependências** (autenticação simulada, configuração via variáveis de ambiente validadas), **erros em formato padronizado** e **OpenAPI** conferido no CI;
3. **Processamento** com a lógica do script (aula pyt-03) em **funções puras** e **tipadas** (§mypy --strict§ limpo), com **geradores** para arquivos grandes;
4. **Rota assíncrona** correta (§await§) para chamadas externas e **§to_thread§** para código bloqueante; **trabalho de CPU em processos** (com guarda de §__main__§) ou **fila**;
5. **Testes**: pytest com **TestClient**, **dependency_overrides**, **tmp_path**, **parametrize** e **caplog**; cobertura dos erros **422/401/404**;
6. **Medições**: vazão com e sem bloqueio do loop (cliente em outro processo), custo de iniciar processos, ganho de processos sobre threads em CPU e **comparação com a versão Node** (curso C4.1);
7. **Logs estruturados** com id de correlação, **/saude** e **desligamento ordenado** (curso C4.6 e aula nex-07);
8. **ADR** com as decisões (async x threads x processos, tipos, validação) e **limitações**.
**Critérios**: nenhuma chamada bloqueante em §async def§ (testada medindo o atraso do loop); **mypy --strict** passando; **testes** verdes; **sem segredos** no repositório; documentação do que **não** foi executado.`,
  concepts: [
    { term: 'Corrotina', def: 'Função async def cuja execução é suspensa e retomada nos pontos de await.' },
    { term: 'Event loop (asyncio)', def: 'Laço que agenda e executa corrotinas de forma cooperativa.' },
    { term: 'gather', def: 'Função que executa várias corrotinas concorrentemente e devolve seus resultados em ordem.' },
    { term: 'TaskGroup', def: 'Escopo de concorrência estruturada que cancela as tarefas irmãs se uma falhar.' },
    { term: 'to_thread', def: 'Função que executa uma chamada bloqueante em outra thread sem travar o event loop.' },
    { term: 'GIL', def: 'Trava global do CPython que permite apenas uma thread executando bytecode por vez.' },
    { term: 'ProcessPoolExecutor', def: 'Pool de processos para tarefas de CPU em paralelo.' },
    { term: 'forkserver', def: 'Método de início de processos que reimporta o módulo principal nos filhos.' },
    { term: 'Semaphore', def: 'Primitiva que limita quantas tarefas executam ao mesmo tempo.' },
    { term: 'Free-threaded', def: 'Compilação experimental do CPython sem o GIL.' }
  ],
  examples: R`**Analogia:** o **asyncio** é **um garçom habilidoso**: anota o pedido da mesa 1, **não espera o prato** e atende a mesa 2; **100 mesas em 0,054 s**. Se o garçom **para para descascar batatas** (time.sleep no loop), **todas as mesas esperam 101 ms**; **chamar um ajudante** (to_thread) resolve. O **GIL** é **uma única faca na cozinha**: quatro cozinheiros (threads) **revezam a faca**, então **cortar legumes (CPU) não acelera (1,03x)**; **quatro cozinhas separadas (processos)** cortam em paralelo (**3,66x**), ao custo de **montar cada cozinha** e **passar os ingredientes por pacote** (pickle). Enquanto **esperam o forno (E/S)**, os cozinheiros podem **largar a faca** — por isso threads funcionam bem para espera.

**Exemplo 1: gather.** 5,04 s sequencial; 0,054 s com gather.

**Exemplo 2: bloqueio.** 101 ms de atraso com time.sleep no loop; 2 ms com to_thread.

**Exemplo 3: GIL.** 13,51 s (seq), 13,12 s (4 threads), 3,69 s (4 processos).`,
  code: [
    { title: 'gather, TaskGroup, timeout e to_thread (Python 3.14.4; resultados medidos)', lang: 'python', code: R`import asyncio, time

async def trabalho(i: int, ms: int = 50): await asyncio.sleep(ms / 1000); return i

async def principal():
    r = await asyncio.gather(*[trabalho(i) for i in range(100)])        # 0,054 s (sequencial: 5,04 s); ordem preservada

    async def falha(): await asyncio.sleep(0.02); raise ValueError('boom')
    async def longa():
        try: await asyncio.sleep(1)
        except asyncio.CancelledError: print('irmã cancelada'); raise
    try:
        async with asyncio.TaskGroup() as tg: tg.create_task(falha()); tg.create_task(longa())
    except* ValueError as eg: print([repr(e) for e in eg.exceptions])    # ["ValueError('boom')"]
    print(await asyncio.gather(falha(), trabalho(1, 10), return_exceptions=True))   # [ValueError('boom'), 1]

    try:
        async with asyncio.timeout(0.1): await asyncio.sleep(1)           # TimeoutError após ~101 ms
    except TimeoutError: pass

    await asyncio.to_thread(time.sleep, 0.1)                              # a espera sai do loop: atraso de ~2 ms (no loop seriam 101 ms)

asyncio.run(principal())`, notes: [{ l: '6', t: 'Todas as esperas se sobrepõem.' }, { l: '12', t: 'except* trata o ExceptionGroup do TaskGroup.' }, { l: '20', t: 'to_thread mantém o loop livre para as outras tarefas.' }] },
    { title: 'CPU: threads x processos e a guarda do __main__ (Python 3.14.4; medidas)', lang: 'python', code: R`import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def cpu(n):                                    # no nível do módulo: os processos filhos precisam importá-la
    s = 0
    for i in range(n): s += i * i
    return s

if __name__ == '__main__':                     # OBRIGATÓRIO (forkserver reimporta o módulo)
    N = 12_000_000
    t0 = time.perf_counter(); [cpu(N) for _ in range(4)]; print('sequencial', time.perf_counter() - t0)           # 13,51 s
    with ThreadPoolExecutor(4) as ex:
        t0 = time.perf_counter(); list(ex.map(cpu, [N] * 4)); print('4 threads', time.perf_counter() - t0)     # 13,12 s (GIL)
    with ProcessPoolExecutor(4) as ex:
        list(ex.map(cpu, [1000] * 4)); t0 = time.perf_counter(); list(ex.map(cpu, [N] * 4)); print('4 processos', time.perf_counter() - t0)   # 3,69 s`, notes: [{ l: '9', t: 'Sem esta guarda o script falha com RuntimeError e duplica a saída.' }, { l: '15', t: 'O aquecimento do pool evita medir a criação dos processos.' }] }
  ],
  bestPractices: ['Use asyncio para muita E/S concorrente, com timeouts e semáforos para limitar a concorrência.', 'Nunca bloqueie o event loop: use bibliotecas assíncronas ou asyncio.to_thread.', 'Use TaskGroup para concorrência estruturada e não engula CancelledError.', 'Use processos (ou filas e extensões nativas) para CPU; threads não aceleram CPU por causa do GIL.', 'Proteja scripts com multiprocessing usando if __name__ == "__main__" e funções no nível do módulo.', 'Meça com clientes fora do processo e documente as limitações.'],
  mistakes: ['Esperar que threads acelerem cálculo em Python puro.', 'time.sleep e drivers síncronos em async def.', 'Disparar milhares de tarefas sem limite.', 'Esquecer a guarda __main__ com ProcessPoolExecutor.', 'Engolir CancelledError e TimeoutError.', 'Medir concorrência com um cliente que é o gargalo.'],
  market: R`Escolher entre asyncio, threads e processos e explicar o GIL são perguntas clássicas de vagas Python; serviços de IA e de dados dependem dessas decisões para escalar.`,
  summary: R`O asyncio sobrepõe esperas de E/S: 100 tarefas de 50 ms levaram 0,054 s com gather contra 5,04 s em sequência (~93x); o TaskGroup cancelou a tarefa irmã na falha, o timeout disparou em 101 ms e time.sleep no loop atrasou tudo em 101 ms contra 2 ms com to_thread. Pelo GIL, 4 threads deram 1,03x em CPU (13,12 s contra 13,51 s) e 4 processos 3,66x (3,69 s); no 3.14 o forkserver exige a guarda __main__. O projeto reúne FastAPI, tipos, testes e medições.`,
  refs: [REF3.pyAsyncio, REF3.pyAsyncioTask, REF3.pyConcurrent, REF3.pyMultiprocessing, REF3.pyFreeThreading],
  cards: [
    { q: 'Quando o asyncio acelera?', a: 'Em E/S concorrente: 100 esperas de 50 ms em 0,054 s (medido), mas não em CPU.' },
    { q: 'O que o TaskGroup faz quando uma tarefa falha?', a: 'Cancela as irmãs e propaga a exceção em um ExceptionGroup.' },
    { q: 'Por que threads não aceleram CPU em Python?', a: 'O GIL permite uma thread executando bytecode por vez (medido: 1,03x com 4 threads).' },
    { q: 'Como paralelizar CPU em Python?', a: 'Com processos (ProcessPoolExecutor: 3,66x medido), extensões nativas ou filas com workers.' },
    { q: 'Por que a guarda __main__ é obrigatória com processos?', a: 'O forkserver reimporta o módulo principal; sem a guarda ocorre RuntimeError e a saída se duplica.' }
  ]
}
];
