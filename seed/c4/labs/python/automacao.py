import subprocess, sys, tempfile, time, json, os, statistics
from pathlib import Path
print('Python', sys.version.split()[0])
with tempfile.TemporaryDirectory() as d:
    pasta = Path(d)
    for i in range(300): (pasta / f'v{i:03d}.csv').write_text('loja,valor\n' + ''.join(f'L{j % 5},{(i + j) % 97}.5\n' for j in range(200)), encoding='utf-8')
    (pasta / 'ruim.csv').write_text('loja,valor\nX,abc\n', encoding='utf-8')
    print('== 1. o script real em um subprocesso (300 CSVs de 200 linhas + 1 inválido)')
    t0 = time.perf_counter(); r = subprocess.run([sys.executable, 'auto/relatorio.py', str(pasta), '-v'], capture_output=True, text=True); ms = (time.perf_counter() - t0) * 1000
    saida = json.loads(r.stdout); print('código de saída:', r.returncode, '| arquivos:', saida['arquivos'], '| inválidos:', saida['invalidos'], '| total:', saida['total'], '| lojas:', list(saida['por_loja']), '| tempo: %.0f ms' % ms)
    print('stderr (log):', r.stderr.strip())
    r2 = subprocess.run([sys.executable, 'auto/relatorio.py', str(pasta / 'nao-existe')], capture_output=True, text=True); print('pasta inexistente → código', r2.returncode, '| stderr:', r2.stderr.strip())
    r3 = subprocess.run([sys.executable, 'auto/relatorio.py', '--help'], capture_output=True, text=True); print('--help começa com:', r3.stdout.splitlines()[0])
print('\n== 2. custo de iniciar um interpretador Python (subprocess) x chamar uma função')
t = []; 
for _ in range(5):
    t0 = time.perf_counter(); subprocess.run([sys.executable, '-c', 'pass']); t.append((time.perf_counter() - t0) * 1000)
print('python -c "pass": mediana %.0f ms por processo' % statistics.median(t))
t = []
for _ in range(5):
    t0 = time.perf_counter(); subprocess.run([sys.executable, '-c', 'import json, csv, argparse']); t.append((time.perf_counter() - t0) * 1000)
print('importando json, csv e argparse: mediana %.0f ms por processo' % statistics.median(t))
print('\n== 3. segurança no subprocess: lista de argumentos x shell=True com entrada do usuário')
entrada = 'a; echo INJETADO'
r = subprocess.run(f'echo processando {entrada}', shell=True, capture_output=True, text=True); print('shell=True com texto interpolado →', repr(r.stdout.strip()), '(o comando extra executou)')
r = subprocess.run(['echo', 'processando', entrada], capture_output=True, text=True); print('lista de argumentos →', repr(r.stdout.strip()), '(tratado como texto)')
