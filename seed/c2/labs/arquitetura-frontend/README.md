# Laboratório da C2.8 (arquitetura frontend, monorepos e microfrontends)
Pacotes (npm, 2026-11-25): turbo 2.11.13, dependency-cruiser 18.9.0, semver 7.8.6, @module-federation/vite 1.25.0, vite 8.3.8, react 19.3.1. Node 26, Chrome 157.
- `monorepo/`: workspaces npm com `apps/web`, `apps/admin`, `packages/ui`, `packages/utils` e `turbo.json`; resultados de cache e "afetados" em `medicoes.txt`. Requer `git init` + um commit para o filtro `--filter='...[HEAD^1]'`.
- `dependency-cruiser/`: regras (sem ciclos, shared não importa features, feature só usa a API pública de outra) sobre um mini código com violações.
- `module-federation/`: host e remote com Vite e Module Federation; `serve.mjs` serve os `dist` nas portas 4173/4174 e `run.mjs` (Puppeteer) abre o host no Chrome.
Reexecutar: instalar os pacotes em pastas vazias, copiar os arquivos, `npx turbo run build` (duas vezes), `npx depcruise src --config .dependency-cruiser.cjs`, `npx vite build` no remote e no host.
Não executado: Nx, Turborepo com cache remoto, pnpm, changesets, conflito de versões em `shared`, tipos entre microfrontends, Web Components, iframes, CI, deploy independente.
