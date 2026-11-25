import sys, timeit, functools, time, statistics, tempfile, os, importlib
print('Python', sys.version.split()[0])

print('== 1. argumentos: posicionais, nomeados, *args e **kwargs, somente-nomeados')
def f(a, b=2, /, c=3, *args, d, **kw): return (a, b, c, args, d, kw)
print(f(1, d=4), '|', f(1, 5, 6, 7, 8, d=9, extra=True))
try: f(1, 2, 3)
except TypeError as e: print('sem o argumento obrigatório "d":', e)

print('\n== 2. closures e a armadilha da ligação tardia')
fs = [lambda: i for i in range(3)]; print('lambdas em laço:', [g() for g in fs], '(todas veem o último i)')
fs2 = [lambda i=i: i for i in range(3)]; print('com valor padrão capturado:', [g() for g in fs2])

print('\n== 3. decoradores com functools.wraps')
def cronometrar(fn):
    @functools.wraps(fn)
    def interno(*a, **k):
        t0 = time.perf_counter(); r = fn(*a, **k); interno.ultimo_ms = (time.perf_counter() - t0) * 1000; return r
    return interno
@cronometrar
def soma_quadrados(n):
    """soma de quadrados"""
    return sum(i * i for i in range(n))
print('resultado:', soma_quadrados(100_000), '| nome preservado:', soma_quadrados.__name__, '| docstring:', soma_quadrados.__doc__, '| tempo registrado: %.1f ms' % soma_quadrados.ultimo_ms)

print('\n== 4. geradores: memória constante')
n = 1_000_000
lista = [i for i in range(n)]; gerador = (i for i in range(n))
print('lista com 1.000.000 de inteiros: %.1f MiB (só a lista de ponteiros) | gerador: %d bytes' % (sys.getsizeof(lista) / 1048576, sys.getsizeof(gerador)))
print('soma pela lista:', sum(lista), '| pelo gerador:', sum(i for i in range(n)))
def lendo(): 
    for i in range(3): print('  (produziu', i, ')', end=''); yield i
print('geradores são preguiçosos:'); [print(' consumiu', v) for v in lendo()]

print('\n== 5. cache com functools.lru_cache (fibonacci recursivo de 32)')
def fib(n): return n if n < 2 else fib(n - 1) + fib(n - 2)
@functools.lru_cache(maxsize=None)
def fib_c(n): return n if n < 2 else fib_c(n - 1) + fib_c(n - 2)
t0 = time.perf_counter(); r1 = fib(32); t1 = (time.perf_counter() - t0) * 1000
t0 = time.perf_counter(); r2 = fib_c(32); t2 = (time.perf_counter() - t0) * 1000
print('sem cache: %.0f ms | com lru_cache: %.3f ms | iguais: %s | acertos/falhas: %s' % (t1, t2, r1 == r2, fib_c.cache_info()))

print('\n== 6. módulos e pacotes: criar um pacote temporário, importar e ver o cache de importação')
with tempfile.TemporaryDirectory() as d:
    os.makedirs(os.path.join(d, 'loja', 'precos')); open(os.path.join(d, 'loja', '__init__.py'), 'w').write("print('  [loja/__init__ executado]')\nVERSAO = '1.0'\n")
    open(os.path.join(d, 'loja', 'precos', '__init__.py'), 'w').write(''); open(os.path.join(d, 'loja', 'precos', 'calculo.py'), 'w').write("def com_imposto(v, taxa=0.1): return round(v * (1 + taxa), 2)\nif __name__ == '__main__': print('rodando como script')\n")
    sys.path.insert(0, d)
    from loja.precos import calculo; import loja
    print('loja.VERSAO =', loja.VERSAO, '| com_imposto(100) =', calculo.com_imposto(100), '| __name__ do módulo:', calculo.__name__, '| arquivo:', os.path.relpath(calculo.__file__, d))
    antes = id(sys.modules['loja']); import loja as loja2; print('segundo import devolve o mesmo objeto (cache em sys.modules):', id(loja2) == antes)
    importlib.reload(loja); sys.path.remove(d)

print('\n== 7. ambiente: onde estão os pacotes')
print('sys.prefix != sys.base_prefix (dentro de um venv):', sys.prefix != sys.base_prefix)
