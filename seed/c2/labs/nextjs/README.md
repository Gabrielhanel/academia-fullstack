# Laboratório da C2.5 (Next.js)
Pacotes (npm, 2026-11-25): next 16.4.6, react e react-dom 19.3.1. Node.js 26.
- `app-classico/`: App Router com layout, loading, rota dinâmica com generateStaticParams e generateMetadata, página dinâmica com cookies(), route handler (GET/POST), Server Action com Client Component e `proxy.js` (matcher), `output: "standalone"`.
- `app-cache-components/`: `cacheComponents: true` e `partialPrefetching: true`, funções com `'use cache'`, cacheLife, cacheTag, Suspense e route handler com `revalidateTag`.
Como reexecutar: diretório vazio, `npm init -y`, `npm pkg set type=module`, `npm i next@16.4.6 react@19.3.1 react-dom@19.3.1`, copiar os arquivos de uma das pastas, `npx next build && npx next start -p 3111`. Resultados em `medicoes.txt`.
Não executado: Server Action invocada pelo navegador (apenas o HTML do formulário foi inspecionado), `updateTag` (citado da documentação 16.4.6, que vem no pacote em `node_modules/next/dist/docs`), imagens/fontes otimizadas, deploy em contêiner (apenas o diretório `standalone` foi gerado e listado), autenticação real.
