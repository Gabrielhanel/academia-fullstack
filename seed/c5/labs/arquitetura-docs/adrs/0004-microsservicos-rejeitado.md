# ADR-0004: Dividir o sistema em microsserviços desde o início

## Status
Rejeitado

## Data
2026-04-01

## Contexto
Havia interesse em separar pedidos, estoque e pagamentos em serviços independentes. A equipe tem 5 pessoas e um único domínio em evolução rápida.

## Decisão
Não dividir agora. Manter um monólito modular com fronteiras explícitas e reavaliar quando houver gargalo de equipe ou de escala.

## Alternativas consideradas
- Microsserviços desde o início: independência de implantação, porém custo de operação, consistência e observabilidade desproporcional ao tamanho da equipe.
- Monólito sem modularização: mais rápido hoje, mas dificultaria uma futura extração.

## Consequências
- Positiva: operação e depuração simples; uma só implantação.
- Negativa: acoplamento por banco compartilhado precisa ser controlado com disciplina e testes de arquitetura.
- Risco: a decisão deve ser reavaliada se uma segunda equipe entrar no domínio.
