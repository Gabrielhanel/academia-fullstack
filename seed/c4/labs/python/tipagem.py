import subprocess, sys
print('Python', sys.version.split()[0])
v = subprocess.run([sys.executable, '-m', 'mypy', '--version'], capture_output=True, text=True).stdout.strip(); print(v)
print('== 1. mypy --strict em um arquivo correto')
r = subprocess.run([sys.executable, '-m', 'mypy', '--strict', 'tipagem/exemplo_ok.py'], capture_output=True, text=True); print(r.stdout.strip(), '(código', r.returncode, ')')
print('execução do mesmo arquivo:', subprocess.run([sys.executable, 'tipagem/exemplo_ok.py'], capture_output=True, text=True).stdout.strip())
print('\n== 2. mypy --strict em um arquivo com 6 erros de tipo')
r = subprocess.run([sys.executable, '-m', 'mypy', '--strict', '--no-color-output', '--no-error-summary', 'tipagem/exemplo_erros.py'], capture_output=True, text=True)
for l in r.stdout.strip().splitlines(): print(' ', l)
print('código de saída:', r.returncode, '(1 = erros encontrados; use no CI)')
print('\n== 3. em tempo de execução as anotações NÃO são verificadas')
r = subprocess.run([sys.executable, '-c', "x: int = 'texto'\nprint('Python executou sem reclamar: x =', repr(x), '| tipo real:', type(x).__name__)"], capture_output=True, text=True); print(r.stdout.strip() or r.stderr.strip())
print('\n== 4. Pydantic valida em tempo de execução')
from pydantic import BaseModel, ValidationError
class M(BaseModel): n: int
print('M(n="12") →', M(n='12'), '(coerção)')
try: M(n='doze')
except ValidationError as e: print('M(n="doze") →', e.errors()[0]['type'], '|', e.errors()[0]['msg'])
