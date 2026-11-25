# language: pt
Funcionalidade: Frete e desconto no carrinho
  Para incentivar compras maiores
  Como loja virtual
  Quero oferecer frete grátis e cupom de primeira compra

  Regra: Frete grátis para subtotal a partir de R$ 200,00

    Cenário: Compra abaixo do limite paga frete
      Dado um carrinho com 1 item "Caneca" de R$ 50,00
      Quando eu calculo o total
      Então o frete é R$ 15,00
      E o total é R$ 65,00

    Esquema do Cenário: Limite do frete grátis
      Dado um carrinho com 1 item "Mochila" de R$ <preco>
      Quando eu calculo o total
      Então o frete é R$ <frete>

      Exemplos:
        | preco  | frete |
        | 199,99 | 15,00 |
        | 200,00 | 0,00  |
        | 350,00 | 0,00  |

  Regra: O cupom PRIMEIRA10 dá 10% de desconto no subtotal

    Cenário: Cupom aplicado antes do frete
      Dado um carrinho com 1 item "Tênis" de R$ 100,00
      Quando eu calculo o total com o cupom "PRIMEIRA10"
      Então o total é R$ 105,00

    Cenário: Cupom desconhecido é ignorado
      Dado um carrinho com 1 item "Tênis" de R$ 100,00
      Quando eu calculo o total com o cupom "NATAL50"
      Então o total é R$ 115,00
