# ADR-0003: Cache em memória no processo da API

## Status
Substituído por ADR-0005

## Data
2026-03-16

## Contexto
O catálogo é lido em quase toda requisição e muda poucas vezes por dia. Havia uma única instância da API.

## Decisão
Manter um cache em memória (Map com TTL de 60 segundos) dentro de cada processo.

## Alternativas consideradas
- Sem cache: simples, mas sobrecarrega o banco no pico.
- Redis desde já: mais um componente a operar para uma única instância.

## Consequências
- Positiva: implementação trivial e latência mínima.
- Negativa: com várias réplicas cada processo teria um cache diferente e invalidações inconsistentes.
