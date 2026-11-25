# ADR-0001: Usar PostgreSQL como banco principal de pedidos

## Status
Aceito

## Data
2026-03-02

## Contexto
Pedidos exigem transações entre pedido, itens e estoque e consultas relacionais com agregações. A equipe conhece SQL e já opera PostgreSQL em outros serviços.

## Decisão
Armazenar pedidos, itens e clientes em um PostgreSQL 17 gerenciado, com migrações versionadas.

## Alternativas consideradas
- MongoDB: modelo flexível, mas transações multidocumento e junções seriam mais frequentes e a equipe tem pouca experiência.
- MySQL: viável, mas sem vantagem sobre o que a equipe já opera e com menos recursos de consulta que usaremos.

## Consequências
- Positiva: transações ACID e integridade referencial entre pedido, itens e estoque.
- Positiva: ferramentas e conhecimento da equipe reaproveitados.
- Negativa: escala de escrita vertical no início; particionamento exigirá trabalho futuro.
- Risco: migrações em tabelas grandes precisam de janelas e planejamento.
