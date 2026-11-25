# Laboratório C5.1 — Clean Code e SOLID

Ambiente (2026-11-25): Node.js 26.13.1 (`node:test`), ESLint 10.15.0 e jscpd 5.4.3 (instalados fora do repositório; `package.json` lista só o ESLint; para repetir: `npm i eslint@10.15.0 jscpd@5.4.3`).

## Conteúdo
- `legado/pedido.mjs`: função `proc` propositalmente ruim (46 linhas).
- `refatorado/pedido.mjs`: mesma regra em funções pequenas, com adaptador `proc` de assinatura antiga.
- `pedido.test.mjs`: 17 testes de caracterização rodando contra as duas versões + 2 testes de unidades novas.
- `solid/solid.mjs` e `solid/solid.test.mjs`: um exemplo que viola e um que respeita cada princípio (SRP, OCP, LSP, ISP, DIP).
- `smells/`: código duplicado x função extraída, com teste de equivalência.
- `divida/priorizar.mjs` e teste: modelo de juros e payback da dívida técnica com **dados hipotéticos** (`saida-divida.txt`).
- `eslint.config.mjs`: regras `complexity` 5, `max-depth` 3, `max-params` 4, `max-lines-per-function` 20, `no-magic-numbers`, `eqeqeq` (todas como aviso).

## Comandos
```
node --test                       # 46 testes
npx eslint legado ; npx eslint refatorado
npx jscpd smells/duplicado.mjs --min-lines 3 --min-tokens 15 --reporters console
```

## Resultados medidos (arquivos `saida-*.txt`)
- Testes: 46 de 46 passam (36 de caracterização/unidades, 5 SOLID, 4 de smells, 1 de dívida).
- ESLint: legado 20 avisos (complexidade 14, aninhamento 4–5, 5 parâmetros, função de 45 linhas, 5 `==`, 8 números mágicos); refatorado 1 aviso (o adaptador de 5 parâmetros mantido por compatibilidade).
- Mutação manual (`>` trocado por `>=` em `aplicarDescontoFixo`): 1 teste de caracterização falhou (35 passam).
- jscpd: `duplicado.mjs` 4 clones, 21 linhas (75%) e 94 tokens (62,67%); `unificado.mjs` 0 clones. Sem informar limites (padrão da ferramenta), e também com 5 linhas e 20–50 tokens, ou 3–4 linhas e 50 tokens, nenhum clone foi detectado: os trechos diferem em um token (o campo somado) e ficam abaixo do mínimo, então o limite precisa ser ajustado.
- Caracterização revelou dois comportamentos não óbvios preservados na refatoração: o perfil `"1"` (texto) recebe o desconto por causa do `==`, e o frete só é somado com `true` estrito.

## Limitações
Os números do ESLint dependem da configuração escolhida (limites arbitrários didáticos); a mutação foi manual (uma única mudança), não uma ferramenta de mutação; não foram executados SonarQube, CodeScene nem análise de acoplamento. Os desafios `code` do curso modelam a lógica em JavaScript.
