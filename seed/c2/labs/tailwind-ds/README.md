# Laboratório da C2.2 (Tailwind e Design Systems)

Evidência de execução dos exemplos das aulas `tdw-01` a `tdw-09` (2026-11-18). Não faz parte do build do app.

Pacotes: `tailwindcss` e `@tailwindcss/cli` 4.3.5, `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.7.1, `style-dictionary` 5.8.0, `axe-core` 4.14.1, `@storybook/react` 10.6.8, `react`/`react-dom` 19.3.1, `vitest` 5.1.1, `jsdom` 31.0.1, `esbuild` 0.28.2.

- `tw/`: `npx @tailwindcss/cli -i in.css -o out.css` e `in2.css` (@utility, @theme inline, camadas). Os CSS gerados foram inspecionados (hover dentro de `@media (hover: hover)`, breakpoints, container query, variáveis só usadas).
- `src/ds.test.tsx` e `src/sb.test.tsx`: `npx vitest run` (cva, tailwind-merge, clsx, axe-core, diálogo com foco, stories com `composeStories` e `play`).
- `sd.mjs` e `sd2.mjs`: Style Dictionary (DTCG), `outputReferences` e tema escuro.
- `lib/` + `consumo/`: pacote com `exports` ligado por link simbólico em `node_modules/@acme/ds`; `npm pack --dry-run` lista os arquivos publicados.
- `tree-shaking/`: `esbuild a.mjs --bundle --minify --format=esm` com `sideEffects: false` (36 bytes) e sem o campo (68 bytes).

O Storybook com interface web e a publicação no registro npm não foram executados.
