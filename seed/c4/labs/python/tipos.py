import sys, timeit, copy, statistics
print('Python', sys.version.split()[0])

print('== 1. tipagem dinâmica e forte')
x = 10; print('x =', x, type(x).__name__); x = 'dez'; print('x =', x, type(x).__name__, '(o nome pode apontar para outro tipo)')
try: 1 + '1'
except TypeError as e: print('1 + "1" ->', type(e).__name__ + ':', e)
print('"1" * 3 =', '1' * 3, '| True + True =', True + True, '(bool é subclasse de int)')

print('\n== 2. números')
print('0.1 + 0.2 =', 0.1 + 0.2, '| == 0.3?', 0.1 + 0.2 == 0.3, '| round(...) == 0.3?', round(0.1 + 0.2, 10) == 0.3)
from decimal import Decimal; print('Decimal("0.1") + Decimal("0.2") =', Decimal('0.1') + Decimal('0.2'))
print('2**100 =', 2 ** 100, '(inteiros sem limite) | 7 // 2 =', 7 // 2, '| -7 // 2 =', -7 // 2, '| 7 % -3 =', 7 % -3, '| 7 / 2 =', 7 / 2)

print('\n== 3. identidade x igualdade e cache de inteiros pequenos')
a = 256; b = 256; c = int('1000'); d = int('1000')
print('256 is 256:', a is b, '| int("1000") is int("1000"):', c is d, '| == :', c == d, '(use == para valores; "is" só para None)')

print('\n== 4. mutabilidade: argumento padrão mutável (armadilha clássica)')
def adicionar(item, lista=[]): lista.append(item); return lista
print('adicionar(1) =', adicionar(1)); print('adicionar(2) =', adicionar(2), '(a lista padrão é criada uma vez e compartilhada entre as chamadas)')
def adicionar_ok(item, lista=None):
    if lista is None: lista = []
    lista.append(item); return lista
print('versão corrigida:', adicionar_ok(1), '|', adicionar_ok(2))

print('\n== 5. cópia rasa x profunda')
orig = [[1, 2], [3, 4]]; rasa = orig.copy(); funda = copy.deepcopy(orig); orig[0].append(99)
print('original:', orig, '| cópia rasa (compartilha as listas internas):', rasa, '| cópia profunda:', funda)

print('\n== 6. estruturas e complexidade: membership em lista x set (100.000 elementos, 200 buscas)')
n = 100_000; lista = list(range(n)); conj = set(lista); alvo = n - 1
tl = timeit.timeit(lambda: alvo in lista, number=200); ts = timeit.timeit(lambda: alvo in conj, number=200)
print('in list: %.3f ms | in set: %.5f ms | razão: %.0fx' % (tl * 1000, ts * 1000, tl / ts))

print('\n== 7. compreensão x laço e concatenação de strings (mediana de 5, 200.000 itens)')
def mediana(f, r=5): t = []; [t.append(timeit.timeit(f, number=1)) for _ in range(r)]; return statistics.median(t) * 1000
N = 200_000
def laco(): r = []; [r.append(i * 2) for i in range(N)]; return r
def laco_for():
    r = []
    for i in range(N): r.append(i * 2)
    return r
def compreensao(): return [i * 2 for i in range(N)]
print('laço for com append: %.1f ms | compreensão de lista: %.1f ms' % (mediana(laco_for), mediana(compreensao)))
def concat_mais():
    s = ''
    for i in range(50_000): s += str(i)
    return s
def concat_join(): return ''.join(str(i) for i in range(50_000))
print('s += str(i) (50.000): %.1f ms | "".join(...): %.1f ms' % (mediana(concat_mais), mediana(concat_join)))

print('\n== 8. valores "falsos" e comparação com None')
print([bool(v) for v in (0, 0.0, '', [], {}, set(), None, '0', [0])], '← 0, 0.0, "", [], {}, set(), None, "0", [0]')
print('dicionários mantêm a ordem de inserção:', list({'b': 1, 'a': 2, 'c': 3}))

print('\n== 9. f-strings, bytes e Unicode')
nome = 'João'; print(f'olá, {nome!r}, {3.14159:.2f}, {1234567:,}', '| len("João") =', len(nome), '| bytes em UTF-8:', len(nome.encode()), '| "é" == "e\\u0301":', 'é' == 'é')
