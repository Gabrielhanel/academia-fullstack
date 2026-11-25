# Laboratório da C2.3 (React avançado)

Evidência de execução das aulas `rav-01` a `rav-06` (2026-11-18): React 19.3.1, Vitest 5.1.1, jsdom 31.0.1, Testing Library (react 16.3.3, user-event 14.6) e TypeScript 7.0.2.

```
npm i react react-dom vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom typescript @types/react @types/react-dom
npx vitest run
```
Mede: ordem de render, efeitos de layout e efeitos (com e sem Strict Mode), quem renderiza, identidade (tipo, posição, chave, componente definido dentro de outro), Tabs composto x `cloneElement`, controlado e não controlado, state reducer, polimorfismo, `lazy`/`use`/Suspense/fronteira de erro (início das buscas em cascata e em paralelo) e `useTransition`/`useDeferredValue` (sequência de renderizações).

Observação: os tempos de revelação do Suspense em jsdom não foram usados como contrato; as aulas citam apenas contagens, ordem e o instante de início das buscas.
