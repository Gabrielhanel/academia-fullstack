# Laboratório da C1.5 (Web Platform)

Evidência dos exemplos da C1.5: páginas de teste, servidor local (HTTP, SSE e WebSocket) e executores em Chrome.

Uso (fora do repositório do app, não faz parte do build):
1. `npm i ws@8 puppeteer-core@24` neste diretório.
2. `node server.mjs` (porta 8765).
3. `node run.mjs lab.html` (e `lab2.html`, `lab3.html`, `lab4.html`) executa a página em Google Chrome headless (`/usr/bin/google-chrome`) e imprime o resultado.
4. `node inst.mjs` consulta `Page.getInstallabilityErrors` para `manifest2.html`, `manifest-ruim.html` e `lab3.html`.

Resultados registrados em 2026-11-18 com Chrome 157.0.8103.50. O Chromium do painel embutido do app não registra Service Workers (erro "unknown error occurred when fetching the script"), por isso o laboratório 3 foi executado no Chrome instalado.
