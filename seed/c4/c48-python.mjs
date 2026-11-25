// Curso C4.8 da C4: Python para desenvolvedores (disciplina: python).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c48-a.mjs';
import { REF2, lessonsB } from './c48-b.mjs';
import { REF3, lessonsC } from './c48-c.mjs';
import { exsets, assessment, project } from './c48-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Sintaxe e tipos', 'Funções e módulos', 'Scripts e automação', 'APIs com FastAPI', 'Tipagem com type hints', 'Programação assíncrona com asyncio'];
export const COVER = {
  'Sintaxe e tipos': ['pyt-01'],
  'Funções e módulos': ['pyt-02'],
  'Scripts e automação': ['pyt-03'],
  'APIs com FastAPI': ['pyt-04'],
  'Tipagem com type hints': ['pyt-05'],
  'Programação assíncrona com asyncio': ['pyt-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'CPython', def: 'Implementação de referência do Python, escrita em C.' },
  { term: 'PEP', def: 'Python Enhancement Proposal: documento que propõe e descreve mudanças e padrões da linguagem.' },
  { term: 'pip', def: 'Instalador de pacotes do Python.' },
  { term: 'Ruff / Black', def: 'Ferramentas de lint e de formatação automática de código Python.' },
  { term: 'ASGI', def: 'Interface entre servidores e aplicações web assíncronas em Python.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'python-dev', disciplineId: 'python', areaId: 'back', requires: [],
  title: 'Python para desenvolvedores: tipos, módulos, automação, FastAPI, type hints e asyncio',
  description: 'Python 3.14 para quem já programa, com experimentos executados: sintaxe e tipos (tipagem dinâmica e forte, float x Decimal, identidade, argumento padrão mutável, cópias, estruturas: in set 10.771x mais rápido que em list, compreensões); funções e módulos (argumentos, closures e a ligação tardia, decoradores com wraps, geradores: 8,1 MiB x 200 bytes, lru_cache 1.220 ms → 0,061 ms, pacotes, sys.modules e venv); scripts e automação (argparse, pathlib, csv, logging e código de saída, 301 CSVs em 658 ms, 6 testes pytest, subprocess seguro contra a injeção com shell=True); APIs com FastAPI 0.165.0 e Pydantic 2.14.4 (422, response_model, dependências, OpenAPI 3.1 e o efeito de bloquear o event loop: 261, 197 e 18,9 req/s); type hints com mypy 2.4.1 --strict (7 mensagens, Protocol, TypedDict, anotações não verificadas em execução); e asyncio com o GIL (100 tarefas de 50 ms em 0,054 s, to_thread, TaskGroup, 4 threads 1,03x e 4 processos 3,66x, forkserver), além do projeto Serviço Python. Django, SQLAlchemy, Celery, Ruff, uv/Poetry e o Python free-threaded não foram executados.',
  objectives: ['Evitar as armadilhas clássicas de tipos, identidade, mutabilidade e float', 'Escrever funções, decoradores, geradores e pacotes e isolar dependências com venv', 'Construir e testar scripts de automação seguros', 'Construir APIs FastAPI com validação, dependências e concorrência correta', 'Usar type hints e mypy e distinguir verificação estática de validação em execução', 'Escolher entre asyncio, threads e processos considerando o GIL'],
  level: 'M', prereqs: ['Lógica de programação e uma linguagem anterior (por exemplo, JavaScript da Onda 1)', 'Python 3.12 ou superior instalado (o curso usa 3.14.4)', 'Noções de HTTP e de linha de comando'], hours: 24,
  syllabus: 'Sintaxe e tipos; funções e módulos; scripts e automação; FastAPI; type hints e mypy; asyncio, GIL e concorrência; projeto.',
  versions: 'Python 3.14.4 (venv, GIL ativo, forkserver), FastAPI 0.165.0, Starlette 1.10.0, Pydantic 2.14.4, uvicorn 0.54.0, httpx 0.28.1, pytest 9.2.0 e mypy 2.4.1, mais Node.js 26.13.1 como cliente de carga, em 2026-11-25 (laboratório em seed/c4/labs/python/). Medidas de uma execução em uma máquina de 8 núcleos (medianas quando indicado). Correções e achados: o primeiro teste de carga com cliente httpx em Python era limitado pelo cliente (77,1, 72,0 e 19,0 req/s) e foi refeito com um cliente Node em outro processo; o ProcessPoolExecutor exige a guarda __main__ no Python 3.14 por causa do forkserver; o TestClient emitiu um aviso de depreciação do uso do httpx. Os desafios de código são em JavaScript (modelam a lógica; o Worker só executa JS) e o código Python real foi executado no laboratório. Não executados: Django, Flask, SQLAlchemy/Alembic, Celery, pyright, Ruff, uv/Poetry, Docker de aplicações Python, NumPy/pandas e o build free-threaded.',
  skills: ['Fundamentos de Python', 'Funções, decoradores e geradores', 'Pacotes e ambientes virtuais', 'Automação e subprocess seguro', 'FastAPI e Pydantic', 'Type hints e mypy', 'asyncio, threads e processos', 'Testes com pytest'],
  modules: [
    { id: 'm1', title: 'Fundamentos da linguagem', lessons: ['pyt-01', 'pyt-02'] },
    { id: 'm2', title: 'Automação e APIs', lessons: ['pyt-03', 'pyt-04'] },
    { id: 'm3', title: 'Tipos e concorrência', lessons: ['pyt-05', 'pyt-06'] }
  ],
  materials: [REF.pyTutorial, REF.pep8, REF2.fastapi, REF2.pytest, REF3.mypy, REF3.pyAsyncio].map((r) => ({ ...r })),
  projectIds: ['servico-python'],
  supplement: {
    glossary,
    cheatsheet: R`### Tipos e armadilhas
tipagem dinâmica + forte (1 + "1" = TypeError) · 0.1+0.2 ≠ 0.3 → Decimal (de texto) · -7 // 2 = -4, 7 % -3 = -2 · is só para None · arg padrão mutável: use None · cópia rasa x copy.deepcopy · in set 10.771x mais rápido que in list · compreensões · "".join · UTF-8 + normalização

### Funções e módulos
*args/**kwargs/somente-nomeados · ligação tardia: lambda i=i · @functools.wraps · geradores (8,1 MiB x 200 B) · lru_cache (1.220 → 0,061 ms) · pacotes + __init__ + sys.modules · if __name__ == "__main__" · venv por projeto + versões fixas

### Scripts
main(argv) -> int · argparse · stdout dados, stderr logs · pathlib/csv/json/with/tempfile · subprocess com lista (nunca shell=True com entrada) + timeout · pytest: fixture, tmp_path, caplog, parametrize · idempotência

### FastAPI
Pydantic: Field limites, extra=forbid, 422 (loc/type) · response_model oculta campos · Depends + dependency_overrides · OpenAPI 3.1 automático · async def só com await (261 req/s); def em threads (197); async+time.sleep (18,9) trava o loop

### Tipos
list[int], X | None, Protocol, TypedDict, TypeVar · mypy --strict (código 1 com erros) · anotações NÃO verificadas em execução · Pydantic valida dados externos · adoção gradual

### asyncio e GIL
gather (5,04 s → 0,054 s) · TaskGroup cancela irmãs · asyncio.timeout · to_thread (2 ms x 101 ms) · GIL: threads 1,03x, processos 3,66x em CPU · threads ok para E/S · forkserver exige guarda __main__ · Semaphore`,
    mistakes: ['Comparar números e textos com is.', 'Argumento padrão mutável e cópia rasa em estruturas aninhadas.', 'float para dinheiro.', 'Decorador sem wraps e lambdas em laço esperando valores diferentes.', 'shell=True com entrada do usuário.', 'time.sleep ou drivers síncronos em async def.', 'Esperar ganho de CPU com threads por causa do GIL.', 'Esquecer a guarda __main__ com multiprocessing.', 'Achar que type hints são verificados em execução.', 'Instalar pacotes no Python do sistema.'],
    prereqMap: R`**Antes deste curso:** uma linguagem de programação anterior (por exemplo JavaScript da Onda 1) e noções de HTTP; o curso é independente do restante da C4, mas dialoga com Node/Express (C4.1), APIs (C4.3), filas (C4.5) e observabilidade (C4.6).

| Este curso prepara para | Por quê |
|---|---|
| IA aplicada (C11) | Python é a linguagem dominante em IA e dados |
| Dados e analytics | pandas, NumPy e notebooks sobre a base da linguagem |
| Automação e DevOps (C6) | scripts, CI e ferramentas de operação |
| Backend em outras stacks (C9) | comparação de modelos de concorrência e tipagem |

Ordem interna: aulas 1 e 2 (linguagem) → 3 e 4 (automação e FastAPI) → 5 e 6 (tipos, asyncio e GIL).`,
    officialRefs: [REF.pyTutorial, REF.pyDatamodel, REF.pyBuiltinTypes, REF.pyDecimal, REF.pyCopy, REF.pep8, REF.pep20, REF.pyDefineFunctions, REF.pyFunctools, REF.pyModules, REF.pyImport, REF.pyVenv, REF.pyPyproject, REF.pyDataclasses, REF2.pyArgparse, REF2.pyPathlib, REF2.pyCsv, REF2.pyLogging, REF2.pySubprocess, REF2.pytest, REF2.fastapi, REF2.fastapiDeps, REF2.fastapiAsync, REF2.fastapiTesting, REF2.pydantic, REF2.uvicorn, REF2.owaspInjection, REF3.pyTyping, REF3.pep484, REF3.pep544, REF3.mypy, REF3.typingSpec, REF3.pyAsyncio, REF3.pyAsyncioTask, REF3.pyConcurrent, REF3.pyMultiprocessing, REF3.pyFreeThreading],
    practice: ['Reproduza as armadilhas de float, identidade e argumento padrão mutável.', 'Escreva um decorador com wraps e use lru_cache e geradores.', 'Crie um script com argparse, pathlib e logging e teste-o com pytest.', 'Construa uma API FastAPI com Pydantic, dependências e response_model.', 'Meça a vazão de uma rota async que bloqueia o loop e a corrija.', 'Rode o mypy --strict em um arquivo com erros e corrija-os.', 'Compare threads e processos em uma tarefa de CPU e explique o GIL.', 'Faça o projeto integrador: serviço Python de relatórios.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
