#!/usr/bin/env bash
# Sobe o provedor, roda um cenário do k6 no Docker (rede do host) e exporta o resumo em JSON.
set -u; ESC="${1:-smoke}"; OUT="${OUT:-resultados}"; mkdir -p "$OUT"
node servidor-carga.mjs > /dev/null 2>&1 & PID=$!; sleep 1
docker run --rm --user "$(id -u):$(id -g)" --network host -v "$PWD/carga:/scripts:ro" -v "$PWD/$OUT:/out" grafana/k6:latest run --quiet --summary-export="/out/$ESC.json" "/scripts/$ESC.js" > "$OUT/$ESC.txt" 2>&1; COD=$?
kill $PID 2>/dev/null; echo "$ESC exit=$COD"
