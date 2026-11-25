# Laboratório da C2.6 (testes de frontend)
Pacotes (npm, 2026-11-25): react 19.3.1, vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.13, @testing-library/jest-dom 8.0.0, msw 3.0.7, @vitest/coverage-v8 5.1.1, pixelmatch 8.0.0, jest-axe 11.0.0 (axe-core 4.14.1). Node 26.
`src/`: componentes (Contador, Cadastro, Usuarios, Relogio) e 4 arquivos de teste (15 testes, todos passaram; cobertura v8 (nos 11 primeiros): 100%). Resultados em `medicoes.txt`.
Reexecutar: diretório vazio, `npm init -y`, `npm pkg set type=module`, instalar os pacotes acima, copiar `src/` e `vitest.config.mjs`, `npx vitest run --coverage`.
Não executado: Jest, Playwright/E2E (exige download de navegadores), Storybook e testes visuais em navegador real (pixelmatch foi usado só com matrizes sintéticas), CI.
