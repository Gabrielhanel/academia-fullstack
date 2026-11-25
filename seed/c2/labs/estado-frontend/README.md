# Laboratório da C2.4 (estado no frontend)
Pacotes (npm, 2026-11-25): react 19.3.1, @reduxjs/toolkit 2.15.0, react-redux 9.3.1, zustand 5.1.0, @tanstack/react-query 5.108.4, vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3.
Testes em src/ (est1: reducer+Context; est2: RTK; est3: Zustand; est4: TanStack Query). Resultados medidos em medicoes.txt (todos os 17 testes passaram). Não executado: SSR/hidratação com um framework real (só dehydrate/hydrate entre dois QueryClient), persistência em localStorage real (usado armazenamento em memória), DevTools.
Para reexecutar: npm i dos pacotes acima num diretório vazio, copiar src/ e vitest.config.mjs, `npx vitest run`.
