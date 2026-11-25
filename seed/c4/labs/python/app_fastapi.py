import asyncio, time
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field, field_validator

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

class UsuarioSaida(BaseModel):          # response_model: a senha NUNCA sai
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
def busca(q: Annotated[str, Query(min_length=2)], limite: Annotated[int, Query(ge=1, le=100)] = 10): return {'q': q, 'limite': limite}

# três formas de uma rota que "espera" 50 ms
@app.get('/espera/async-bloqueante')
async def async_bloqueante(): time.sleep(0.05); return {'ok': True}          # ERRO clássico: bloqueia o event loop
@app.get('/espera/async-correta')
async def async_correta(): await asyncio.sleep(0.05); return {'ok': True}
@app.get('/espera/sync')
def sync_def(): time.sleep(0.05); return {'ok': True}                          # def comum: roda em um pool de threads
