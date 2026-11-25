# Laboratório C5.3 — Documentação arquitetural (UML, C4 e ADRs)

Ambiente (2026-11-25): Node.js 26.13.1; `@mermaid-js/mermaid-cli` 12.2.0 (mmdc, com o Google Chrome do sistema); PlantUML 1.2026.10 (imagem Docker `plantuml/plantuml`); verificador de ADRs próprio (`adr-lint.mjs`, sem dependências).

## Conteúdo
- `diagramas/*.mmd`: classes, sequência, estados, entidade-relacionamento, C4 contexto, C4 contêineres e implantação (flowchart), mais `invalido.mmd`.
- `plantuml/*.puml`: classes, sequência, componentes e `invalido.puml`.
- `adrs/`: 5 ADRs de exemplo (Aceito, Substituído por, Rejeitado). `exemplos-invalidos/`: 3 ADRs com defeitos propositais.
- `adr-lint.mjs`, `gerar-indice.mjs`, `matriz.mjs`, `adr.test.mjs` (5 testes).
- `renderizar.sh`, `puppeteer-config.json`, `renders/` (3 SVGs do Mermaid e 2 do PlantUML) e `saida-*.txt`.

## Comandos
```
node --test                                  # 5 testes
node adr-lint.mjs adrs                       # ADRs OK
node adr-lint.mjs exemplos-invalidos         # 9 problemas, exit 1
node gerar-indice.mjs adrs
./renderizar.sh                              # mmdc em cada .mmd
docker run --rm -i plantuml/plantuml -tsvg -pipe -failonerror < plantuml/classes.puml > classes.svg
```

## Resultados medidos
- Mermaid (mmdc 12.2.0): 7 diagramas renderizados com exit 0 (3,7 a 8,2 s cada; SVGs de ~200 KB, os C4 de ~387 KB); `invalido.mmd` falhou com exit 1 e a mensagem "Parse error on line 3 ... Expecting 'TXT', got 'NEWLINE'". Os diagramas C4 do Mermaid (`C4Context`, `C4Container`) renderizaram, mas a documentação do Mermaid lista como não suportados (curto prazo) sprites, tags, links e legenda, e o posicionamento é automático.
- PlantUML 1.2026.10: classes, sequência e componentes renderizados com exit 0 (3 a 4 s); um arquivo com sintaxe quebrada saiu com exit 200 e "Syntax Error?". Uma primeira versão de `classes.puml` com `\n` literal no corpo da classe falhou da mesma forma; um arquivo com `loop` sem fim e seta sem destino foi aceito com exit 0 (o PlantUML é tolerante).
- ADRs: os 5 exemplos passam; os 3 inválidos acumulam 9 problemas (alternativas insuficientes, consequências sem riscos, status e data inválidos, lacuna de numeração, substituição para ADR inexistente).
- Matriz de decisão de exemplo: monólito 4,75, híbrido 3,75, microsserviços 2,35 (margem 1,00) com pesos 40/35/25 e notas de 1 a 5 (dados hipotéticos).

## Limitações
Não executados: Structurizr (DSL e Lite), C4-PlantUML (depende de includes remotos), draw.io, adr-tools e Log4brains (analisados apenas na aula). Os diagramas são exemplos didáticos de um sistema fictício; as notas da matriz são hipotéticas. O verificador de ADRs impõe um formato próprio (seções em português), não um padrão universal.
