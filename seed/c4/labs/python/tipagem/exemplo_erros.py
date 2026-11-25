from typing import Protocol, TypedDict

class Item(TypedDict):
    sku: str
    qtd: int

class Precificador(Protocol):
    def preco(self, sku: str) -> float: ...

class SemMetodo: pass

def total(itens: list[Item], prec: Precificador) -> float:
    return sum(prec.preco(i['sku']) * i['qtd'] for i in itens)

def buscar(id: int) -> str | None:
    return None if id < 0 else 'ok'

x: int = 'texto'                                   # 1) tipo errado
total([{'sku': 'A', 'qtd': '2'}], SemMetodo())     # 2) qtd como str; 3) objeto não cumpre o Protocol
print(buscar(1).upper())                           # 4) None não tratado
total([{'sku': 'A'}], None)                        # 5) chave faltando e None
def f(a: int) -> str: return a                     # 6) retorno errado
