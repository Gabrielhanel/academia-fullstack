// C4.8 — Python para desenvolvedores. Aulas 3 e 4 (scripts e automação; APIs com FastAPI).
import { REF } from './c48-a.mjs';
const R = String.raw;

export const REF2 = {
  pyArgparse: { title: 'Python — argparse', url: 'https://docs.python.org/3/library/argparse.html', kind: 'doc' },
  pyPathlib: { title: 'Python — pathlib', url: 'https://docs.python.org/3/library/pathlib.html', kind: 'doc' },
  pyCsv: { title: 'Python — csv', url: 'https://docs.python.org/3/library/csv.html', kind: 'doc' },
  pyLogging: { title: 'Python — logging', url: 'https://docs.python.org/3/library/logging.html', kind: 'doc' },
  pySubprocess: { title: 'Python — subprocess (security considerations)', url: 'https://docs.python.org/3/library/subprocess.html#security-considerations', kind: 'doc' },
  pyTempfile: { title: 'Python — tempfile', url: 'https://docs.python.org/3/library/tempfile.html', kind: 'doc' },
  pytest: { title: 'pytest — documentação', url: 'https://docs.pytest.org/en/stable/', kind: 'doc' },
  fastapi: { title: 'FastAPI — documentação', url: 'https://fastapi.tiangolo.com/', kind: 'doc' },
  fastapiDeps: { title: 'FastAPI — Dependencies', url: 'https://fastapi.tiangolo.com/tutorial/dependencies/', kind: 'doc' },
  fastapiAsync: { title: 'FastAPI — Concurrency and async / await', url: 'https://fastapi.tiangolo.com/async/', kind: 'doc' },
  fastapiTesting: { title: 'FastAPI — Testing', url: 'https://fastapi.tiangolo.com/tutorial/testing/', kind: 'doc' },
  pydantic: { title: 'Pydantic — documentação', url: 'https://docs.pydantic.dev/latest/', kind: 'doc' },
  uvicorn: { title: 'Uvicorn', url: 'https://uvicorn.dev/', kind: 'doc' },
  owaspInjection: { title: 'OWASP — OS Command Injection Defense Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html', kind: 'guia' }
};

export const lessonsB = [
{
  id: 'pyt-03', moduleId: 'm2', order: 3, minutes: 85, tags: ['scripts', 'automação', 'argparse', 'pathlib', 'csv', 'logging', 'subprocess', 'pytest'],
  title: 'Scripts e automação: CLI com argparse, arquivos com pathlib, logging, subprocess seguro e testes com pytest',
  objectives: ['Escrever um script de linha de comando com argparse, códigos de saída e logging', 'Manipular arquivos com pathlib, csv e json', 'Executar comandos externos com subprocess sem expor injeção de comandos', 'Testar scripts com pytest (fixtures, tmp_path, parametrize, caplog)', 'Estimar o custo de iniciar processos e importar módulos'],
  intro: R`Python é a linguagem da **automação**: relatórios, migrações, integrações, tarefas de operação. Um bom script é **parametrizável** (§argparse§), **seguro** (sem injeção de comandos), **observável** (§logging§, **código de saída**) e **testável** (§pytest§). Aqui você executa um script real (**301 CSVs**, **658 ms**), seus **6 testes** (**6 passed**), e mede o **custo de iniciar um interpretador** (**~46 ms**) e a **injeção via shell=True**.`,
  theory: R`### Anatomia de um bom script
O laboratório tem §relatorio.py§: lê CSVs de uma pasta, soma por loja e emite um JSON.
§§§
def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('pasta', type=Path); p.add_argument('--saida', type=Path); p.add_argument('-v', '--verbose', action='store_true')
    a = p.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if a.verbose else logging.WARNING, format='%(levelname)s %(message)s', stream=sys.stderr)
    if not a.pasta.is_dir(): log.error('pasta inexistente: %s', a.pasta); return 2
    ...
if __name__ == '__main__': raise SystemExit(main())
§§§
Princípios:
- **§main(argv)§ recebe os argumentos** (testável sem subprocesso) e **devolve o código de saída** (0 = ok; **≠ 0 = erro**; convenção: 2 para uso incorreto);
- **Resultado em stdout, mensagens em stderr** (permite **pipes**: §python relatorio.py pasta | jq§);
- **§argparse§** gera **ajuda** (§--help§), valida **tipos** (§type=Path§), define **opções** e **flags**. Medido: §--help§ começa com §usage: relatorio.py [-h] [--saida SAIDA] [-v] pasta§;
- **§logging§** (**não** §print§) para diagnóstico: **níveis**, **formato**, **destino**; **configure só no ponto de entrada**, nos módulos use §log = logging.getLogger(__name__)§; mensagens com **§%s§ lazy** (§log.warning('arquivo %s', nome)§);
- **Falhas esperadas** (arquivo inválido) **não derrubam** o processamento: registre e continue; **falhas fatais** retornam código ≠ 0.

### Executado de verdade (medido)
Subprocesso com **300 CSVs de 200 linhas + 1 inválido** (§ruim.csv§): **código de saída 0**, **301 arquivos**, **1 inválido**, **total 2.907.759,0**, **5 lojas** (L0 a L4), **658 ms** (**§-v§** ligado); o **stderr** trouxe §WARNING arquivo inválido ruim.csv: could not convert string to float: 'abc'§. **Pasta inexistente** → **código 2** e §ERROR pasta inexistente: ...§. Isso mostra o contrato: **dados no stdout, avisos no stderr, status no código**.

### Arquivos e dados
- **§pathlib.Path§** (em vez de §os.path§ e concatenação de strings): §pasta / 'a.csv'§, §.glob('*.csv')§, §.read_text(encoding='utf-8')§, §.write_text(...)§, §.exists()§, §.is_dir()§, §.mkdir(parents=True, exist_ok=True)§, §.suffix§, §.stem§.
- **§csv.DictReader§** com §newline=''§ (**obrigatório** ao abrir CSV) e **§encoding='utf-8'§**; **§json.dumps(..., ensure_ascii=False, indent=2)§**.
- **§with§** (gerenciador de contexto) **fecha** arquivos mesmo com exceção; **§tempfile§** cria arquivos e diretórios **temporários seguros** (medido: usados no laboratório para os 301 CSVs).
- **Arquivos grandes**: itere **linha a linha** (geradores, aula pyt-02), nunca §read()§ do arquivo todo.
- **Escrita segura**: escreva em um arquivo **temporário** e **renomeie** (§Path.replace§ é atômico no mesmo sistema de arquivos), para não deixar arquivos pela metade.

### subprocess: executar programas externos com segurança
- **Use lista de argumentos** e **§shell=False§** (padrão): §subprocess.run(['echo', 'processando', entrada])§. Medido com **entrada maliciosa** §'a; echo INJETADO'§:
  - **§shell=True§ com texto interpolado** (§f'echo processando {entrada}'§) → saída **§'processando a\nINJETADO'§**: **o comando extra executou** (**injeção de comandos**);
  - **lista de argumentos** → **§'processando a; echo INJETADO'§**: **tratado como texto**.
- **§capture_output=True, text=True§**, **§check=True§** (lança §CalledProcessError§ se o código ≠ 0), **§timeout=§** (evita travar), **§cwd=§** e **§env=§** explícitos; **nunca** passe segredos na linha de comando (aparecem em §ps§).
- **Custo**: iniciar um interpretador vazio (§python -c "pass"§) levou **~46 ms** por processo (mediana de 5); importar §json§, §csv§ e §argparse§ elevou para **~90 ms**: **evite iniciar processos em laços** quando uma função resolve; **meça** (o tempo varia: uma primeira medição deu 59 e 107 ms).
- Para **programas de linha de comando**, prefira **bibliotecas Python** (§shutil§, §zipfile§, §sqlite3§) a chamar utilitários externos.

### Testes com pytest
O laboratório tem 6 testes (**6 passed**, 0,09 s) usando:
- **fixture** (§@pytest.fixture§): §pasta(tmp_path)§ cria arquivos de teste em um **diretório temporário** (§tmp_path§ é um **§Path§**, descartado depois);
- **asserts simples** (§assert r == {...}§: o pytest **mostra a diferença** nas falhas);
- **§caplog§** para verificar **logs** (§'arquivo inválido c.csv' in caplog.text§);
- **§@pytest.mark.parametrize§** (dois casos de CSV → soma esperada);
- **testar §main(argv)§** diretamente: sucesso (escreve o JSON e devolve 0) e **erro** (pasta inexistente → **2**).
**Estratégia**: **funções puras** testadas sem E/S; **E/S** com §tmp_path§; **subprocessos** com **poucos** testes de fumaça; **cobertura** (§pytest-cov§) como indicador (**não executado**).

### Agendamento e operação
**cron/systemd timers** (Linux), **agendadores de contêiner** (Kubernetes CronJob), **Airflow/Prefect** (orquestração de pipelines; **não executados**): scripts devem ser **idempotentes** (repetir não duplica efeitos), **registrar** início, fim e erros, ter **timeout**, **travas** contra execuções simultâneas e **alertas** em falha (curso C4.6). **Segredos** por variáveis de ambiente ou cofre, **nunca** no código.

### Segurança
**Injeção de comandos** (acima), **path traversal** (§Path(base) / entrada§ pode escapar com §..§: valide com §resolve()§ e §is_relative_to§), **desserialização insegura** (§pickle§ de fontes não confiáveis **executa código**: use JSON), **arquivos temporários previsíveis** (use §tempfile§), **permissões** dos arquivos criados.`,
  concepts: [
    { term: 'argparse', def: 'Biblioteca padrão para interpretar argumentos de linha de comando e gerar a ajuda.' },
    { term: 'Código de saída', def: 'Número devolvido por um processo ao terminar; 0 indica sucesso.' },
    { term: 'pathlib', def: 'Módulo que representa caminhos de arquivos como objetos.' },
    { term: 'Gerenciador de contexto', def: 'Objeto usado com with que prepara e libera recursos automaticamente.' },
    { term: 'subprocess', def: 'Módulo para executar programas externos a partir do Python.' },
    { term: 'Injeção de comandos', def: 'Execução de comandos indesejados por interpolar entrada não confiável em uma linha de shell.' },
    { term: 'Fixture', def: 'Função do pytest que prepara dados ou recursos usados pelos testes.' },
    { term: 'parametrize', def: 'Marcador do pytest que executa o mesmo teste com vários conjuntos de dados.' },
    { term: 'Idempotência', def: 'Propriedade de uma tarefa que pode ser repetida sem duplicar efeitos.' },
    { term: 'Path traversal', def: 'Ataque que usa .. em caminhos para acessar arquivos fora da pasta prevista.' }
  ],
  examples: R`**Analogia:** um **script bem-feito** é uma **ferramenta de oficina**: tem **cabo** (argumentos), **luz de status** (código de saída: verde 0, vermelho ≠ 0), **caderno de ocorrências** (logging no stderr) e **entrega a peça pronta** (stdout) para o próximo posto da linha (pipe). O **shell=True com entrada do usuário** é **ditar ordens por um megafone**: se alguém grita "e mais isto!" junto, **o operador faz também**; a **lista de argumentos** é entregar a **ordem por escrito, em campos separados**.

**Exemplo 1: script.** 301 arquivos, 1 inválido, código 0, 658 ms; pasta inexistente → código 2.

**Exemplo 2: injeção.** shell=True executou o comando extra; a lista de argumentos não.

**Exemplo 3: testes.** 6 passed, incluindo caplog e parametrize.`,
  code: [
    { title: 'Script com argparse, pathlib, csv, logging e código de saída (Python 3.14.4)', lang: 'python', code: R`"""Lê CSVs de vendas de um diretório e gera um resumo JSON."""
from __future__ import annotations
import argparse, csv, json, logging, sys
from collections import defaultdict
from pathlib import Path

log = logging.getLogger('relatorio')

def ler_vendas(arquivo: Path) -> list[dict]:
    with arquivo.open(newline='', encoding='utf-8') as f:
        return [{**linha, 'valor': float(linha['valor'])} for linha in csv.DictReader(f)]

def resumir(pasta: Path) -> dict:
    por_loja: dict[str, float] = defaultdict(float); invalidas = 0; arquivos = 0
    for arq in sorted(pasta.glob('*.csv')):
        arquivos += 1
        try:
            for v in ler_vendas(arq): por_loja[v['loja']] += v['valor']
        except (KeyError, ValueError) as e:
            invalidas += 1; log.warning('arquivo inválido %s: %s', arq.name, e)
    return {'arquivos': arquivos, 'invalidos': invalidas, 'total': round(sum(por_loja.values()), 2), 'por_loja': dict(sorted(por_loja.items()))}

def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('pasta', type=Path); p.add_argument('--saida', type=Path); p.add_argument('-v', '--verbose', action='store_true')
    a = p.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if a.verbose else logging.WARNING, format='%(levelname)s %(message)s', stream=sys.stderr)
    if not a.pasta.is_dir(): log.error('pasta inexistente: %s', a.pasta); return 2
    texto = json.dumps(resumir(a.pasta), ensure_ascii=False, indent=2)
    (a.saida.write_text(texto, encoding='utf-8') if a.saida else print(texto)); return 0

if __name__ == '__main__': raise SystemExit(main())`, notes: [{ l: '9', t: 'newline="" é exigido ao abrir CSVs.' }, { l: '20', t: 'Falhas esperadas viram avisos; o processamento continua.' }, { l: '32', t: 'main devolve o código; SystemExit o repassa ao sistema.' }] },
    { title: 'Testes com pytest e subprocess seguro (Python 3.14.4; resultados medidos)', lang: 'python', code: R`import json, subprocess
from pathlib import Path
import pytest
from relatorio import main, resumir

@pytest.fixture
def pasta(tmp_path: Path) -> Path:
    (tmp_path / 'a.csv').write_text('loja,valor\nPOA,10.5\nSP,20\nPOA,4.5\n', encoding='utf-8')
    (tmp_path / 'b.csv').write_text('loja,valor\nSP,5\n', encoding='utf-8')
    return tmp_path

def test_resumo_soma_por_loja(pasta):
    assert resumir(pasta) == {'arquivos': 2, 'invalidos': 0, 'total': 40.0, 'por_loja': {'POA': 15.0, 'SP': 25.0}}

def test_main_pasta_inexistente(tmp_path):
    assert main([str(tmp_path / 'nao-existe')]) == 2

@pytest.mark.parametrize('csv_texto,esperado', [('loja,valor\nA,1\nA,2\n', 3.0), ('loja,valor\n', 0.0)])
def test_parametrizado(tmp_path, csv_texto, esperado):
    (tmp_path / 'x.csv').write_text(csv_texto, encoding='utf-8'); assert resumir(tmp_path)['total'] == esperado

entrada = 'a; echo INJETADO'
subprocess.run(f'echo processando {entrada}', shell=True, capture_output=True, text=True).stdout     # 'processando a\nINJETADO'  (PERIGOSO)
subprocess.run(['echo', 'processando', entrada], capture_output=True, text=True).stdout              # 'processando a; echo INJETADO'  (seguro)
# pytest: 6 passed in 0.09s`, notes: [{ l: '7', t: 'tmp_path entrega um diretório temporário isolado por teste.' }, { l: '21', t: 'Com shell=True a entrada é interpretada como comandos.' }] }
  ],
  bestPractices: ['Estruture scripts com main(argv) que devolve o código de saída e proteja com __name__ == "__main__".', 'Use stdout para dados e stderr para logs e avisos.', 'Use pathlib, with e tempfile e itere arquivos grandes linha a linha.', 'Nunca use shell=True com entrada não confiável: passe uma lista de argumentos e um timeout.', 'Teste com pytest: funções puras, tmp_path, caplog e parametrize.', 'Torne as automações idempotentes, com logs, timeout e alerta em falha.'],
  mistakes: ['Usar print em vez de logging e misturar dados com mensagens.', 'Concatenar caminhos como texto e esquecer o encoding.', 'shell=True com interpolação de entrada do usuário.', 'Ler arquivos enormes com read().', 'Executar código no import sem proteção de __main__.', 'Scripts que não devolvem código de saída em falhas.'],
  market: R`Automação e scripts de operação são o primeiro contato de muitas pessoas com Python profissional; a injeção de comandos via shell=True é um achado clássico de revisão de segurança.`,
  summary: R`Um bom script Python usa argparse, main(argv) com código de saída, logging no stderr, pathlib/csv/json e é testado com pytest. Medido: 301 CSVs processados (1 inválido) em 658 ms com código 0; pasta inexistente deu código 2; 6 testes passaram em 0,09 s; iniciar um interpretador vazio custa ~46 ms (~90 ms com json, csv e argparse); com shell=True a entrada 'a; echo INJETADO' executou o comando extra, enquanto a lista de argumentos a tratou como texto.`,
  refs: [REF2.pyArgparse, REF2.pyPathlib, REF2.pyCsv, REF2.pyLogging, REF2.pySubprocess, REF2.pytest, REF2.owaspInjection, REF2.pyTempfile],
  cards: [
    { q: 'Onde ficam os dados e os logs de um script?', a: 'Dados no stdout e logs/avisos no stderr; o status vai no código de saída.' },
    { q: 'Por que evitar shell=True com entrada do usuário?', a: 'Permite injeção de comandos (medido: o comando extra executou).' },
    { q: 'Para que serve tmp_path no pytest?', a: 'Entrega um diretório temporário isolado para cada teste.' },
    { q: 'Qual o custo de iniciar um processo Python?', a: 'Cerca de 46 ms para um interpretador vazio e ~90 ms importando json, csv e argparse (medido).' },
    { q: 'Como testar main sem subprocesso?', a: 'Fazendo main receber argv e devolver o código de saída.' }
  ]
},
{
  id: 'pyt-04', moduleId: 'm2', order: 4, minutes: 90, tags: ['FastAPI', 'Pydantic', 'validação', 'dependências', 'OpenAPI', 'async', 'uvicorn', 'TestClient'],
  title: 'APIs com FastAPI: validação com Pydantic, dependências, OpenAPI automático e o custo de bloquear o event loop',
  objectives: ['Construir uma API FastAPI com modelos Pydantic, validação e response_model', 'Interpretar os erros 422 e a coerção de tipos', 'Usar injeção de dependências e substituí-las em testes', 'Usar a documentação OpenAPI gerada automaticamente', 'Distinguir rotas async def e def e medir o efeito de bloquear o event loop'],
  intro: R`O **FastAPI** gera **validação, serialização e documentação OpenAPI** a partir de **type hints** e modelos **Pydantic**. Aqui (FastAPI **0.165.0**, Pydantic **2.14.4**, Python **3.14.4**) você mede: os **422** com localização e tipo do erro, o **§response_model§** que **não devolve a senha**, as **dependências substituíveis em testes**, o **OpenAPI 3.1** gerado e o **desempenho de três formas de esperar 50 ms** (**261**, **197** e **18,9 req/s**).`,
  theory: R`### O mínimo
§§§
class NovoUsuario(BaseModel):
    nome: str = Field(min_length=3, max_length=50)
    email: str = Field(pattern=r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
    idade: int = Field(ge=18, le=120)
    senha: str = Field(min_length=8)

class UsuarioSaida(BaseModel): id: int; nome: str; email: str; idade: int     # a senha NUNCA sai

@app.post('/usuarios', response_model=UsuarioSaida, status_code=201)
def criar(u: NovoUsuario): ...
§§§
Os **type hints** viram **validação de entrada**, **conversão**, **documentação** e **autocompletar**. Rodar: §uvicorn app:app§ (servidor **ASGI**); §/docs§ (Swagger UI) e §/openapi.json§ **gerados**.

### Validação (Pydantic v2) — medido
- **Válido** (§Ana§, e-mail, 30, senha de 8): **201** e o corpo **sem a senha** (§'senha' in resposta§ → **False**: o §response_model§ **filtra** os campos);
- **Inválido** (§nome='A'§, §email='x'§, §idade=10§, §senha='1'§): **422** com **uma entrada por erro**, cada uma com §loc§ (caminho: §['body', 'nome']§) e §type§: §string_too_short§, §string_pattern_mismatch§, §greater_than_equal§, §string_too_short§ — **todos de uma vez**;
- **Coerção**: §idade: "30"§ (texto) → **aceito como 30** (modo "lax" padrão; use §strict§ quando a coerção for indesejada); **campo extra** (§admin: true§) → **ignorado** (padrão §extra='ignore'§; use §extra='forbid'§ para recusar e **evitar mass assignment** silencioso, aula nst-03);
- **Query**: §q§ com §min_length=2§ → **422** "String should have at least 2 characters"; §limite=500§ com §le=100§ → **422** §less_than_equal§; válido → §{'q': 'ab', 'limite': 5}§.
- **Validadores** (§@field_validator§), **tipos específicos** (§EmailStr§ exige o pacote **email-validator**, **não executado**; usamos regex), **modelos aninhados**, **enums**, **datas**, §model_dump()§/§model_validate()§.
**Segurança**: **response_model** como **lista de permissão** de saída; **limites de tamanho** nos campos (§max_length§); **não** logar senhas; hash de senha (curso C4.4).

### Dependências (injeção)
§Depends(...)§ injeta **autenticação**, **sessão de banco**, **configuração**, **paginação**:
§§§
def obter_usuario_atual(token: str | None = None):
    if token != 'segredo': raise HTTPException(status_code=401, detail='não autenticado')
    return {'id': 1, 'papel': 'admin'}
@app.get('/usuarios/{uid}', response_model=UsuarioSaida)
def obter(uid: int, atual: Annotated[dict, Depends(obter_usuario_atual)]): ...
§§§
Medido: **sem token → 401**; **com token → 200**; **inexistente → 404**; com **§app.dependency_overrides[obter_usuario_atual] = lambda: {...}§** o teste **dispensa a autenticação** (**200 sem token**): **a DI torna as rotas testáveis** (como no Nest, aula nst-07). **Dependências com §yield§** abrem e fecham recursos (conexão ao banco) por requisição.

### OpenAPI automático (medido)
§GET /openapi.json§ → **OpenAPI 3.1.0** com título e versão, **rotas** (§/busca§, §/usuarios§, §/usuarios/{uid}§ e as três de espera), **schemas** (§NovoUsuario§, §UsuarioSaida§, §HTTPValidationError§, §ValidationError§); o schema de §NovoUsuario§ lista **§required§** (§nome, email, idade, senha§) e para §idade§ **§minimum 18§**, **§maximum 120§**, **§type integer§**; §/docs§ → **200**. O contrato **nasce do código** (code-first, aula api-03): **valide-o** em CI e **detecte mudanças incompatíveis**.

### Testes com TestClient
§from fastapi.testclient import TestClient§; §TestClient(app)§ chama as rotas **sem rede**: §c.post('/usuarios', json=...)§. Nesta versão, o §fastapi.testclient§ emitiu o **aviso** "*Using httpx with starlette.testclient is deprecated; install httpx2 instead*" (**achado do laboratório**: acompanhe as notas de versão). Para **async**, §httpx.AsyncClient(transport=ASGITransport(app))§ (**não executado**). Combine com **pytest** (aula pyt-03).

### async def x def: o ponto crítico (medido)
O FastAPI roda em **ASGI** (Starlette/uvicorn): **um event loop**.
- **§async def§**: executa **no event loop**; use **§await§** (§asyncio.sleep§, **drivers assíncronos**, §httpx.AsyncClient§). **Qualquer chamada bloqueante** (§time.sleep§, driver síncrono, cálculo longo) **trava o loop inteiro**.
- **§def§ comum**: o FastAPI a executa em um **pool de threads** (padrão do AnyIO: ~**40 threads**), **sem travar o loop**: **seguro para código bloqueante**, com limite de threads.
Medido (uvicorn 0.54.0, **1 worker**, **200 requisições**, **20 simultâneas**, cada rota "espera" **50 ms**, **cliente Node em outro processo**):
| Rota | Tempo total | Vazão | p50 | p95 |
|---|---|---|---|---|
| §async def§ + **§await asyncio.sleep§** | **0,77 s** | **261,0 req/s** | 61 ms | 131 ms |
| **§def§** + §time.sleep§ (thread) | **1,01 s** | **197,1 req/s** | 95 ms | 156 ms |
| §async def§ + **§time.sleep§** (**bloqueia o loop**) | **10,56 s** | **18,9 req/s** | **1.054 ms** | 1.059 ms |
O erro "**async def com chamada bloqueante**" derrubou a vazão **~14x** (18,9 contra 261): ~**1/0,05 s** = **20 req/s**, **uma de cada vez**. E **atrasa as outras rotas**: **§/busca§** (instantânea) levou **54 ms enquanto uma rota bloqueante rodava**, contra **5 ms** ocioso (**o servidor inteiro fica indisponível**).
(**Correção de laboratório**: a primeira medição, com cliente **httpx em Python** no mesmo tipo de máquina, deu 77,1, 72,0 e 19,0 req/s: **o cliente era o gargalo**; refeita com um cliente Node em outro processo.)
**Regras**: **I/O com drivers assíncronos** → §async def§; **código síncrono/bloqueante** → §def§ (ou §await asyncio.to_thread(...)§/§run_in_threadpool§ dentro de §async def§); **CPU pesada** → **processos** ou **fila** (aula pyt-06 e curso de filas). **Mais capacidade**: **vários workers** (§uvicorn --workers N§ / Gunicorn com UvicornWorker; **não executado**) e **réplicas**.

### Produção
**Gunicorn/uvicorn workers**, **proxy reverso**, **limites de corpo e de tempo**, **CORS** configurado, **autenticação** (OAuth2/JWT com as dependências de segurança do FastAPI; curso C4.4), **observabilidade** (curso C4.6), **migrações** (Alembic) e **ORM** (SQLAlchemy/SQLModel) — **não executados** aqui. **Versione** a API e **teste o contrato** (aulas api-03 e api-07).`,
  concepts: [
    { term: 'FastAPI', def: 'Framework web Python assíncrono que gera validação e documentação OpenAPI a partir de type hints.' },
    { term: 'Pydantic', def: 'Biblioteca de validação e serialização de dados baseada em type hints.' },
    { term: 'response_model', def: 'Modelo que define e filtra os campos devolvidos por uma rota.' },
    { term: 'ASGI', def: 'Interface padrão entre servidores e aplicações web assíncronas em Python.' },
    { term: 'Depends', def: 'Mecanismo de injeção de dependências do FastAPI.' },
    { term: 'dependency_overrides', def: 'Dicionário que substitui dependências em testes.' },
    { term: 'Erro 422', def: 'Resposta com os detalhes de falhas de validação de entrada.' },
    { term: 'Event loop bloqueado', def: 'Situação em que uma chamada síncrona demorada em async def impede o servidor de atender outras requisições.' },
    { term: 'Pool de threads', def: 'Conjunto de threads que executa as rotas def comuns sem travar o event loop.' },
    { term: 'Coerção de tipos', def: 'Conversão automática de valores, como "30" em 30, feita pelo Pydantic no modo lax.' }
  ],
  examples: R`**Analogia:** o FastAPI é um **balcão de atendimento com uma fiscal de documentos** (Pydantic) que **confere cada campo** e devolve **a lista completa de problemas** (422), e que **só entrega ao cliente os campos autorizados** (response_model). O **event loop** é **um único atendente muito rápido**: se você o põe para **esperar parado** (time.sleep em async def), **a fila inteira para**; as rotas **def** são **atendentes extras de um banco de reservas** (threads) que podem esperar à vontade, e o **await** é o atendente que **anota o pedido, atende o próximo e volta quando o prato fica pronto**.

**Exemplo 1: validação.** 422 com quatro erros (loc e type); "30" aceito como 30; campo extra ignorado.

**Exemplo 2: dependências.** 401 sem token, 200 com token e 200 com dependency_overrides.

**Exemplo 3: event loop.** 261 req/s (await), 197 (def), 18,9 (async def bloqueante).`,
  code: [
    { title: 'API FastAPI com validação, response_model e dependências (Python 3.14.4, FastAPI 0.165.0)', lang: 'python', code: R`from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

app = FastAPI(title='API de Pedidos (laboratório)', version='1.0.0')
BANCO: dict[int, dict] = {}

class NovoUsuario(BaseModel):
    nome: str = Field(min_length=3, max_length=50)
    email: str = Field(pattern=r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
    idade: int = Field(ge=18, le=120)
    senha: str = Field(min_length=8)
    @field_validator('nome')
    @classmethod
    def sem_espacos_nas_pontas(cls, v: str) -> str: return v.strip()

class UsuarioSaida(BaseModel):
    id: int; nome: str; email: str; idade: int

def obter_usuario_atual(token: str | None = None):
    if token != 'segredo': raise HTTPException(status_code=401, detail='não autenticado')
    return {'id': 1, 'papel': 'admin'}

@app.post('/usuarios', response_model=UsuarioSaida, status_code=201)
def criar(u: NovoUsuario):
    novo = {'id': len(BANCO) + 1, **u.model_dump()}; BANCO[novo['id']] = novo; return novo

@app.get('/usuarios/{uid}', response_model=UsuarioSaida)
def obter(uid: int, atual: Annotated[dict, Depends(obter_usuario_atual)]):
    if uid not in BANCO: raise HTTPException(404, 'usuário não encontrado')
    return BANCO[uid]

@app.get('/busca')
def busca(q: Annotated[str, Query(min_length=2)], limite: Annotated[int, Query(ge=1, le=100)] = 10): return {'q': q, 'limite': limite}`, notes: [{ l: '18', t: 'response_model filtra os campos: a senha não sai.' }, { l: '27', t: 'Depends injeta a dependência, que pode ser substituída nos testes.' }] },
    { title: 'Três formas de esperar 50 ms e os testes (Python 3.14.4; medidas do laboratório)', lang: 'python', code: R`import asyncio, time
from fastapi.testclient import TestClient

@app.get('/espera/async-bloqueante')
async def async_bloqueante(): time.sleep(0.05); return {'ok': True}      # ERRO: trava o event loop (18,9 req/s)
@app.get('/espera/async-correta')
async def async_correta(): await asyncio.sleep(0.05); return {'ok': True}  # 261,0 req/s
@app.get('/espera/sync')
def sync_def(): time.sleep(0.05); return {'ok': True}                      # pool de threads: 197,1 req/s

c = TestClient(app)
assert c.post('/usuarios', json={'nome': 'A', 'email': 'x', 'idade': 10, 'senha': '1'}).status_code == 422
app.dependency_overrides[obter_usuario_atual] = lambda: {'id': 7, 'papel': 'teste'}      # sem autenticação nos testes
assert c.get('/usuarios/1').status_code in (200, 404)
app.dependency_overrides.clear()`, notes: [{ l: '5', t: 'time.sleep dentro de async def bloqueia todas as requisições.' }, { l: '14', t: 'dependency_overrides substitui a dependência apenas nos testes.' }] }
  ],
  bestPractices: ['Declare modelos Pydantic com limites e use response_model como lista de permissão de saída.', 'Use extra="forbid" quando campos desconhecidos devam ser recusados.', 'Injete dependências com Depends e substitua-as nos testes.', 'Use async def só com await e drivers assíncronos; use def para código bloqueante.', 'Nunca chame time.sleep ou drivers síncronos dentro de async def (use to_thread).', 'Valide o OpenAPI gerado e use vários workers e proxy reverso em produção.'],
  mistakes: ['Chamadas bloqueantes dentro de async def.', 'Devolver o modelo de entrada com a senha em vez de um response_model.', 'Confiar na coerção sem perceber (strings viram números).', 'Esquecer limites de tamanho nos campos.', 'Não testar os erros 422 e as dependências.', 'Medir a carga com um cliente que é o próprio gargalo.'],
  market: R`FastAPI é hoje o framework mais popular para APIs Python modernas e serviços de IA; entender a diferença entre async def e def é pergunta recorrente de entrevistas e causa de incidentes de desempenho.`,
  summary: R`O FastAPI valida e documenta a API a partir de type hints e modelos Pydantic. Medido (0.165.0, Pydantic 2.14.4): 422 com loc e type para cada erro, "30" coerido para 30, campo extra ignorado, response_model que oculta a senha, 401/200/404 com dependências e override nos testes, OpenAPI 3.1.0 com schemas e limites. Com 20 requisições simultâneas e 50 ms de espera: async+await 261 req/s, def em threads 197 req/s e async+time.sleep 18,9 req/s (e /busca levou 54 ms contra 5 ms): não bloqueie o event loop.`,
  refs: [REF2.fastapi, REF2.fastapiDeps, REF2.fastapiAsync, REF2.fastapiTesting, REF2.pydantic, REF2.uvicorn],
  cards: [
    { q: 'O que o response_model faz?', a: 'Define e filtra os campos devolvidos (medido: a senha não saiu na resposta).' },
    { q: 'O que significa um 422 do FastAPI?', a: 'Falha de validação, com uma entrada por erro (loc, type, msg).' },
    { q: 'Quando usar async def e quando def?', a: 'async def com await e drivers assíncronos; def para código bloqueante (roda em threads).' },
    { q: 'Qual o efeito de time.sleep em async def?', a: 'Bloqueia o event loop: medido 18,9 req/s contra 261 e atraso nas demais rotas.' },
    { q: 'Como testar sem autenticar?', a: 'Com app.dependency_overrides substituindo a dependência de autenticação.' }
  ]
}
];
