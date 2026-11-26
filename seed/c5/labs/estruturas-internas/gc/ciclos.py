"""Contagem de referências x coletor de ciclos do CPython. Uso: python3 gc/ciclos.py"""
import gc, sys, weakref, tracemalloc, time

class No:
    def __init__(self, nome): self.nome = nome; self.outro = None
    def __del__(self): print('  __del__', self.nome)

print('Python', sys.version.split()[0], '| gc ligado:', gc.isenabled(), '| limiares:', gc.get_threshold())

print('1) sem ciclo: liberado na hora pela contagem de referências')
a = No('a'); print('  refcount de a:', sys.getrefcount(a) - 1)   # -1: a chamada a getrefcount segura uma referência
del a; print('  depois do del a')

print('2) com ciclo: a contagem nunca chega a zero')
gc.disable()
x, y = No('x'), No('y'); x.outro, y.outro = y, x
w = weakref.ref(x)
del x, y
print('  depois de del x, y: objeto ainda vivo?', w() is not None)
n = gc.collect(); print('  gc.collect() encontrou', n, 'objetos inalcançáveis; vivo?', w() is not None)

print('3) memória com 300.000 ciclos, com e sem o coletor')
def ciclos(q):
    for _ in range(q):
        p, q2 = [], []; p.append(q2); q2.append(p)
for ligado in (False, True):
    gc.enable() if ligado else gc.disable(); gc.collect()
    tracemalloc.start(); t0 = time.perf_counter()
    ciclos(300000); atual, pico = tracemalloc.get_traced_memory(); dt = (time.perf_counter() - t0) * 1000
    tracemalloc.stop()
    print('  gc', 'ligado ' if ligado else 'desligado', '| 300.000 ciclos em %.0f ms | memória retida ao fim %.1f MiB | pico %.1f MiB' % (dt, atual / 1048576, pico / 1048576))
    gc.enable(); gc.collect()
print('4) estatísticas por geração:', [(s['collections'], s['collected']) for s in gc.get_stats()])
