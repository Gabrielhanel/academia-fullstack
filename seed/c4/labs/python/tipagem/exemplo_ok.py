from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol, TypedDict, TypeVar, Iterable, Callable

class Item(TypedDict):
    sku: str
    qtd: int

@dataclass(frozen=True)
class Pedido:
    id: int
    itens: list[Item]
    cupom: str | None = None

class Precificador(Protocol):
    def preco(self, sku: str) -> float: ...

class Tabela:
    def __init__(self, precos: dict[str, float]) -> None: self.precos = precos
    def preco(self, sku: str) -> float: return self.precos[sku]

def total(p: Pedido, prec: Precificador) -> float:
    bruto = sum(prec.preco(i['sku']) * i['qtd'] for i in p.itens)
    return round(bruto * 0.9, 2) if p.cupom == 'DEZ' else round(bruto, 2)

T = TypeVar('T')
def primeiro(itens: Iterable[T], padrao: T) -> T:
    for x in itens: return x
    return padrao

def aplicar(f: Callable[[int], int], xs: list[int]) -> list[int]: return [f(x) for x in xs]

print(total(Pedido(1, [{'sku': 'A', 'qtd': 2}], 'DEZ'), Tabela({'A': 50.0})), primeiro([], 0), aplicar(lambda n: n + 1, [1, 2]))
