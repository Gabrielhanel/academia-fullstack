# ADR-0005: Cache distribuído com Redis

## Status
Aceito

## Data
2026-09-14

## Contexto
A API passou a ter três réplicas e o cache em memória (ADR-0003) causava leituras divergentes e invalidações perdidas. Substitui ADR-0003.

## Decisão
Usar Redis 8 com padrão cache-aside, TTL de 60 segundos e invalidação explícita nas escritas do catálogo.

## Alternativas consideradas
- Manter o cache por processo com TTL menor: reduz a divergência, mas não elimina e aumenta a carga no banco.
- Cache no CDN: bom para conteúdo público, mas o catálogo depende do usuário e do preço negociado.

## Consequências
- Positiva: leitura consistente entre réplicas e menos carga no banco.
- Negativa: novo componente a operar e latência de rede em cada leitura.
- Risco: indisponibilidade do Redis; a API deve funcionar degradada lendo do banco.
