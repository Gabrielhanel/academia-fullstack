# Checklist de revisão de código (modelo)

**Antes de abrir o PR (autoria):** descrição com contexto e motivação; mudança pequena e focada (ver `pr-tamanho.mjs`); testes novos ou alterados; autoverificação do diff; nada de segredos; capturas de tela quando houver UI.

**Ao revisar:** 1) entendo o objetivo? 2) o design é coerente com o sistema (acoplamento, fronteiras)? 3) a lógica está correta nos casos de borda e de erro? 4) há testes que verificam o comportamento (e não só executam linhas)? 5) nomes, comentários e legibilidade; 6) segurança e dados pessoais; 7) desempenho óbvio (N+1, laços sobre I/O); 8) observabilidade (logs, métricas) e documentação (ADR quando houver decisão).

**Comentários:** prefixe a intenção (`nit:`, `sugestão:`, `pergunta:`, `bloqueante:`), explique o porquê, proponha alternativa, elogie o que está bom.

**Decisão:** aprove quando o código melhora a saúde do sistema, mesmo que não seja como você faria; bloqueie por correção, segurança ou dívida séria, com justificativa.
