# ADR-0002: Expor a API pública como REST com OpenAPI

## Status
Aceito

## Data
2026-03-09

## Contexto
Os consumidores são a SPA e parceiros externos com integrações simples. Precisamos de cache HTTP, contratos documentados e baixa curva de entrada.

## Decisão
API REST com OpenAPI 3.1 como contrato, versionada na URL (/v1).

## Alternativas consideradas
- GraphQL: flexível para clientes móveis, mas cache e limitação de custo por consulta exigem infraestrutura que ainda não temos.
- gRPC: eficiente entre serviços, porém ruim para parceiros e navegadores sem proxy.

## Consequências
- Positiva: cache HTTP e ferramentas de documentação e testes prontos.
- Negativa: clientes que precisam de dados agregados farão mais chamadas ou exigirão endpoints específicos.
