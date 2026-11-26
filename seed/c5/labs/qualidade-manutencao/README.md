# Laboratório C5.8 — Qualidade e manutenção de software

Ambiente (2026-11-25): Node.js 26.13.1 e Git; sem dependências externas.

> **Importante:** todos os dados deste laboratório são **sintéticos** (histórico Git gerado por script e dados de entrega e de incidentes inventados). Eles ilustram os cálculos; não representam nenhuma equipe real.

## Conteúdo
- `criar-historia.mjs`: cria um repositório Git determinístico (43 commits, 3 autores, datas fixas) com arquivos de perfis diferentes; `hotspots.mjs`: churn × complexidade, autores por arquivo e concentração.
- `dora.mjs` + `dados/entrega-sintetica.json`: frequência, lead time, taxa de falha e tempo de restauração.
- `slo.mjs`: orçamento de erro, taxa de queima e alertas de múltiplas janelas; `pr-tamanho.mjs`: tamanho de PR.
- `revisao-checklist.md` e `postmortem-modelo.md` (modelos). `qualidade.test.mjs`: 5 testes.

## Comandos
```
node --test
node criar-historia.mjs /tmp/hist && node hotspots.mjs /tmp/hist
node dora.mjs
```

## Resultados medidos (arquivos `saida-*.txt`)
- Testes: 5 de 5 passam (inclui um erro de ponto flutuante encontrado: `1 - 0.999` = `0.0010000000000000009`, que deixava a taxa de queima em `0.9999999999999991`; a função passou a arredondar a 6 casas).
- Hotspots (histórico sintético): `src/pedido.js` 25 commits × complexidade 301 = 7.525 pontos, 1 autor (100% de concentração: risco de fator de ônibus); `src/config.js` e `src/legado.js` são complexos (25 e 13) mas quase não mudam (2 e 1 commit): pontuações 50 e 13; `src/util.js` muda muito (15 commits, 3 autores) mas tem complexidade 1: 15 pontos.
- DORA (12 implantações em 28 dias, 2 incidentes sintéticos): 3 implantações por semana, lead time mediano de 6,5 h, taxa de falha de 16,7% e tempo mediano de restauração de 3,8 h.
- SLO: 99,9% em 30 dias = 43,2 min de orçamento (99% = 432 min; 99,99% = 4,32 min); queima de 14,4x por 1 h consome 2% e de 6x por 6 h consome 5% do orçamento; 1 erro em 1.000 requisições com SLO de 99,9% equivale a queima 1.
- Tamanho de PR: 8 linhas = XS, 30 = S, 160 = M, 400 = L, 700 = XL (limites de heurística: 10, 50, 200 e 500 linhas).

## Limitações
Dados sintéticos; a complexidade usa uma contagem simples de palavras-chave (não é a métrica do ESLint nem a complexidade cognitiva); não foram executados SonarQube, CodeScene, ferramentas de revisão assistida, plataformas de incidentes, Prometheus/alertmanager reais nem medições em equipes reais.
