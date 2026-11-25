import json, sys
import fastapi, pydantic
from fastapi.testclient import TestClient
from app_fastapi import app, BANCO, obter_usuario_atual
print('Python', sys.version.split()[0], '| FastAPI', fastapi.__version__, '| Pydantic', pydantic.VERSION)
c = TestClient(app)
print('== 1. validação automática (Pydantic) e erros 422')
r = c.post('/usuarios', json={'nome': 'Ana', 'email': 'ana@x.com', 'idade': 30, 'senha': '12345678'}); print('válido →', r.status_code, r.json(), '| a senha saiu na resposta?', 'senha' in r.json())
r = c.post('/usuarios', json={'nome': 'A', 'email': 'x', 'idade': 10, 'senha': '1'}); print('inválido →', r.status_code, [(e['loc'], e['type']) for e in r.json()['detail']])
r = c.post('/usuarios', json={'nome': 'Ana', 'email': 'ana@x.com', 'idade': '30', 'senha': '12345678', 'admin': True}); print('idade como texto "30" (coerção) e campo extra ignorado →', r.status_code, r.json())
r = c.get('/busca?q=a'); print('query curta →', r.status_code, r.json()['detail'][0]['msg']); r = c.get('/busca?q=ab&limite=500'); print('limite 500 →', r.status_code, r.json()['detail'][0]['type']); r = c.get('/busca?q=ab&limite=5'); print('ok →', r.json())
print('\n== 2. injeção de dependências e autenticação')
print('sem token →', c.get('/usuarios/1').status_code, '| com token →', c.get('/usuarios/1?token=segredo').status_code, c.get('/usuarios/1?token=segredo').json(), '| inexistente →', c.get('/usuarios/99?token=segredo').status_code)
app.dependency_overrides[obter_usuario_atual] = lambda: {'id': 7, 'papel': 'teste'}; print('com dependency_overrides (sem token) →', c.get('/usuarios/1').status_code); app.dependency_overrides.clear()
print('\n== 3. documentação OpenAPI gerada a partir dos tipos')
o = c.get('/openapi.json').json(); print('openapi', o['openapi'], '| título:', o['info']['title'], '| rotas:', sorted(o['paths']), '| schemas:', sorted(o['components']['schemas']))
print('NovoUsuario.required:', o['components']['schemas']['NovoUsuario']['required'], '| idade:', {k: v for k, v in o['components']['schemas']['NovoUsuario']['properties']['idade'].items() if k in ('minimum', 'maximum', 'type')}, '| /docs →', c.get('/docs').status_code)
