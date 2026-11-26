# Laboratório C7.2 — Vulnerabilidades web: SQLi, XSS, CSRF, CORS e SSRF

Executado em 2026-11-26: Node 26.13.1 (`node:http`, `node:sqlite`, `node:crypto`, `node:test`) e Chrome 157.0.8103.50 (via puppeteer-core). **Uso educacional**: `web.mjs` é uma aplicação de demonstração em duas versões (vulnerável e corrigida), escutando só em 127.0.0.1, dados sintéticos; `ssrf.mjs` é a defesa de SSRF. O código vulnerável não deve ser reutilizado.

## Testes HTTP (`saida-web.txt`, 10 testes, 10 passam)
- **SQLi:** bypass de login `' OR '1'='1' --` → vulnerável 200 / corrigida 401; UNION → 2 linhas com e-mail:senha / 0; `ORDER BY` inválido → 500 com a mensagem do banco ("no such column") / 400 (lista de permissão).
- **XSS:** payload `<script>` cru na vulnerável; escapado (`&lt;script&gt;`) e com `Content-Security-Policy: script-src 'self'` e `nosniff` na corrigida; idem para comentário armazenado.
- **Cookies:** vulnerável `sid=…; Path=/`; corrigida `…; HttpOnly; SameSite=Strict`.
- **CSRF:** vulnerável 200; corrigida: formulário 415, JSON sem token 403, token com Origin estranha 403, token legítimo 200.
- **CORS:** vulnerável reflete `http://evil.test` com `Allow-Credentials: true`; corrigida não envia cabeçalho para origem estranha, permite a própria origem e nega o preflight.
- **SSRF:** vulnerável leu `SEGREDO-SINTETICO-123` do serviço interno (direto e via `/redir`); corrigida 400 (`host fora da lista de permissão`). 13 casos de classificação de IP corretos; formas ofuscadas (`2130706433`, `0x7f.0.0.1`, `127.1`, `[::1]`), `file:` e credenciais na URL recusadas; redirecionamento para `169.254.169.254` bloqueado na revalidação.

## Chrome real (`saida-navegador.txt`)
- **XSS:** vulnerável executou o alert refletido 1x e o armazenado 1x; corrigida 0x e 0x. `document.cookie`: vulnerável expõe `sid`; corrigida vazio (HttpOnly). O efeito isolado da CSP não foi medido (o escape sozinho já impediu a execução).
- **CSRF** (vítima logada em `localhost`, página atacante auto-enviando um formulário): vulnerável perdeu 100 com atacante *same-site* (1000→900) **e** *cross-site* (900→800); corrigida: saldo inalterado nos dois. O sucesso cross-site é consistente com a exceção "Lax+POST" do Chrome para cookies sem `SameSite` explícito; **a causa não foi isolada**.
- **CORS** (página de outra origem lendo `/api/saldo` com credenciais): vulnerável, same-site: leu `{"saldo":800}`; vulnerável, cross-site: leu `{"erro":"não autenticado"}` (o cookie não foi enviado, mas a resposta era legível porque o CORS estava aberto); corrigida: BLOQUEADO nos dois.

## Não executado
XSS baseado em DOM, Trusted Types, sanitizadores (DOMPurify), SQLi cega por tempo, SQLi de segunda ordem, ORMs, WAF, DNS rebinding, metadados de nuvem reais (169.254.169.254), scanners (ZAP, sqlmap), HTTPS e cookies `Secure`.

## Limitações
Aplicação mínima, uma execução, um navegador (Chrome 157); resultados de cookies dependem das políticas do Chrome da versão testada. A defesa de SSRF não fixa o IP resolvido (não protege contra DNS rebinding).

## Reprodução
```bash
node --test web.test.mjs
PUPPETEER_PATH=<caminho do puppeteer-core> node navegador.mjs
```
