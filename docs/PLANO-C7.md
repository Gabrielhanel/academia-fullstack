# PLANO-C7 — Segurança: OWASP, vulnerabilidades web, criptografia, secure coding e LGPD

Data: 2026-11-26. Fonte da verdade: `docs/PLANO-ACADEMIA-V2.md` (linha C7) e `seed/seed.json` (área `sec`; disciplinas `owasp`, `websec`, `crypto`, `secure`). Produção isolada em `seed/c7/`; Onda 1, `seed/c1`–`c6`, `SEED_REV` (3), `seedPlan`, migração e `seed/build.mjs` não são alterados; nada é integrado, publicado ou gravado no banco real.

## Divergências e restrições
- Tópicos do catálogo: OWASP (2), Vulnerabilidades web (5), Criptografia (3), Secure coding e LGPD (4) = 14 aulas, uma por tópico.
- **Uso ético:** todo exemplo ofensivo roda **apenas contra aplicações escritas por este curso, em 127.0.0.1**, com dados sintéticos, para ensinar a defesa; cada vulnerabilidade vem com a correção e um teste que a comprova. Não há alvos de terceiros, varredura de redes nem ferramentas de ataque em massa.
- Ambiente: Node 26.13.1 (`node:crypto`, `node:sqlite`, `node:test`), OpenSSL 3.5.5, Docker 29.9.3. Sem contas, dispositivos móveis nem consultoria jurídica: **segurança mobile é analisada** (OWASP MASVS) e **LGPD é conteúdo técnico, não aconselhamento jurídico**.
- Exercícios `code` rodam só em JavaScript (Worker, sem Buffer/TextEncoder): modelam validadores, sanitização, avaliação de políticas, entropia e minimização de dados.
- Referências (OWASP, NIST, RFCs, MDN, ANPD/planalto) só entram depois de abertas pelo `refs-check`.

## Cursos
| Curso | Arquivo | Disciplina | Aulas | Projeto |
|---|---|---|---|---|
| C7.1 OWASP | c71-owasp | owasp | Top 10; API Security Top 10 (2) | `auditoria-owasp` |
| C7.2 Vulnerabilidades web | c72-vulnerabilidades-web | websec | SQL Injection; XSS; CSRF; CORS; SSRF (5) | `app-web-endurecida` |
| C7.3 Criptografia, hashing e segredos | c73-criptografia | crypto | Hashing; simétrica e assimétrica; secrets management (3) | `cofre-de-segredos` |
| C7.4 Secure coding e LGPD | c74-secure-coding | secure | Secure coding; segurança de APIs; mobile; LGPD (4) | `privacidade-por-design` |

## Laboratórios (`seed/c7/labs/<curso>/`)
Aplicação demo vulnerável e sua versão corrigida (mesmo contrato), testes `node:test` que provam o ataque antes e a defesa depois, medições (tempos de hash, tamanhos, taxas), README com ambiente, versões, comandos, resultados, não executado e limitações.

## Validação
`node seed/c7/validate.mjs`, `refs-check.mjs` e `browser-check.mjs` (mesmo molde da C6); progresso em `docs/PROGRESSO-C2-C11.md`.
