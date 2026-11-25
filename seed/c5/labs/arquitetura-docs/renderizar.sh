#!/usr/bin/env bash
# Renderiza todos os diagramas Mermaid em SVG com o mermaid-cli (mmdc 12.2.0) usando o Chrome instalado.
# Pré-requisito: npm i @mermaid-js/mermaid-cli@12.2.0 (PUPPETEER_SKIP_DOWNLOAD=1) e o Google Chrome em /usr/bin/google-chrome.
set -u
MMDC="${MMDC:-npx mmdc}"; OUT="${OUT:-renders}"; mkdir -p "$OUT"
for f in classes sequencia estados er c4-contexto c4-containers implantacao invalido; do
  inicio=$(date +%s.%N)
  $MMDC -p puppeteer-config.json -i "diagramas/$f.mmd" -o "$OUT/$f.svg" -q > "$OUT/$f.log" 2>&1; cod=$?
  printf '%s exit=%s %.1f s\n' "$f" "$cod" "$(echo "$(date +%s.%N) - $inicio" | bc)"
done
