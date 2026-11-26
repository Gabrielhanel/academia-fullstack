# Laboratório C7.1 — OWASP: loja vulnerável x corrigida

Executado em 2026-11-26 com Node 26.13.1 (`node:http`, `node:crypto`, `node:sqlite`, `node:test`), sem dependências externas. **Uso educacional**: `app.mjs` contém uma loja de demonstração em duas versões (`seguro:false` e `seguro:true`), escutando apenas em 127.0.0.1 em portas efêmeras, com dados 100% sintéticos (3 usuários, 300 pedidos, senhas de teste). O código vulnerável não deve ser reutilizado.

## Resultados (`saida-owasp.txt`, 9 testes, 9 passam)
| Teste | Categoria | Vulnerável | Corrigida |
|---|---|---|---|
| Enumeração de usuários | A07:2025 / API2:2023 | 404 e 401 (mensagens distintas) | 401 e 401 (iguais) |
| Força bruta (8 tentativas) | A07 / API2 | 401 ×8 | 401 ×5 e 429 ×3; 10 eventos registrados (A09) |
| Token previsível (`token-3`) | A07 | 200, lista de usuários com senhas em texto claro | 401 |
| BOLA: pedido 2 lido pela Ana | A01 / API1 | 200 | 404 (e 200 no pedido da própria Ana) |
| SQL Injection (UNION) | A05 | 3 linhas incluindo senhas | 0 linhas |
| Atribuição em massa (`papel=admin`) | API3 | papel vira `admin` | continua `usuario` |
| Função administrativa por usuário comum | A01 / API5 | (visto no teste do token) | 403 |
| `limite=100000` | API4 | 300 linhas | 50 (teto) e só os próprios pedidos |
| `/erro` | A02 / A10 | stack de 6 linhas e `x-powered-by` | só id de correlação |

## Não executado
Scanners (OWASP ZAP, Semgrep, Trivy), verificação de dependências (A03 cadeia de suprimentos), integridade de artefatos (A08), SSRF (C7.2), gateways de API, WAF, autenticação OAuth/OIDC real.

## Limitações
Aplicação mínima e sintética; cada correção mostra um princípio, não um produto completo; tempos de uma execução (scrypt padrão do Node).

## Reprodução
```bash
node --test owasp.test.mjs
```
