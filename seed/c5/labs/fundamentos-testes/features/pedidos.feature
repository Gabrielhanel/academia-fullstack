# language: pt
Funcionalidade: Finalizar pedido
  Para comprar com segurança
  Como cliente da loja
  Quero que meu pedido seja cobrado corretamente, com cupom quando houver

  Contexto:
    Dado que hoje é "2026-11-25"
    E o gateway de pagamento aprova as cobranças

  Cenário: Compra simples
    Quando a cliente "ana" compra 2 unidades de "A1" a R$ 10,00
    Então o pedido fica "pago" com total de R$ 20,00
    E a cliente recebe a notificação "Pedido 1 pago: R$ 20.00"

  Cenário: Compra com cupom válido
    Quando a cliente "ana" compra 2 unidades de "A1" a R$ 10,00 com o cupom "BEMVINDO10"
    Então o pedido fica "pago" com total de R$ 18,00

  Cenário: Cupom expirado é recusado antes de cobrar
    Dado que hoje é "2026-12-30"
    Quando a cliente "ana" compra 1 unidades de "A1" a R$ 10,00 com o cupom "NATAL20"
    Então a compra é recusada com a mensagem "cupom expirado"
    E nenhuma cobrança é feita

  Esquema do Cenário: Totais com diferentes quantidades
    Quando a cliente "ana" compra <qtd> unidades de "A1" a R$ 10,00
    Então o pedido fica "pago" com total de R$ <total>

    Exemplos:
      | qtd | total  |
      | 1   | 10,00  |
      | 3   | 30,00  |
      | 12  | 120,00 |

  Cenário: Pagamento recusado mantém o pedido como novo
    Dado o gateway de pagamento recusa as cobranças
    Quando a cliente "ana" compra 1 unidades de "A1" a R$ 10,00
    Então o pedido fica "novo" com total de R$ 10,00
    E nenhuma notificação é enviada
