# Laboratório C6.2 — CI/CD, GitHub Actions e estratégias de deploy

Executado em 2026-11-25 (Docker 29.9.3, actionlint 1.7.12 via `rhysd/actionlint`, nginx 1.31.10 via `nginx:alpine`).

## Executado
- `actionlint` sobre `.github/workflows/ci.yml` (válido: saída vazia, exit 0) e `defeituoso.yml` (exit 1, 4 achados: chave `branchs` inexistente, `github.event.issue.title` potencialmente não confiável em script inline, `steps.inexistente` indefinido, `needs: compilar` sem job). Saídas: `saida-actionlint-*.txt`.
- `deploy.yml` (publicar → homologação → produção com ambientes e OIDC): a primeira versão tinha um erro real, achado pelo actionlint (`needs.publicar` inacessível no job `producao`, que só dependia de `homologacao`); corrigido com `needs: [publicar, homologacao]` e aprovado (exit 0). Saídas: `saida-actionlint-deploy-primeira-tentativa.txt` e `saida-actionlint-deploy.txt`.
- `deploy/bluegreen-canary.sh`: dois nginx (blue = v1, green = v2) atrás de um nginx de borda.
  - 100% blue: 50/50 respostas v1.
  - Canary pesos 9:1: 200 requisições → 180 v1 e 20 v2 (round-robin ponderado do nginx, determinístico; com tráfego real a proporção varia).
  - Blue-green: troca de upstream com `nginx -s reload` durante 300 requisições seguidas: 300 × HTTP 200, sem erros; depois da troca 50/50 v2.
  - Rollback para blue: 50/50 v1.
  - Saída: `saida-bluegreen-canary.txt`.
- Achado: a primeira tentativa usou `weight=0`, que o nginx **recusa** (`invalid parameter "weight=0"`); o reload falhou, o nginx **manteve a configuração antiga** e a "troca" não ocorreu (`saida-bluegreen-primeira-tentativa-weight0.txt`). Corrigido com a flag `down`.

## Analisado (não executado)
Os workflows não rodaram no GitHub (não há runner nem repositório remoto): foram apenas verificados estaticamente pelo actionlint. Nenhum job, cache, matriz, segredo, OIDC, ambiente protegido ou artefato foi exercitado.

## Não executado
GitHub Actions real, GitLab CI, Jenkins, Argo Rollouts/Flagger, deploy em nuvem, migrações de banco em blue-green, canary com métricas automáticas.

## Limitações
Tráfego sintético com curl, aplicações estáticas, uma máquina; o nginx de borda é ponto único de falha no laboratório. Tempos e proporções são de uma execução.

## Reprodução
```bash
docker run --rm -v "$PWD":/repo -w /repo rhysd/actionlint:latest .github/workflows/ci.yml
bash deploy/bluegreen-canary.sh
```
O script cria só recursos `lab-cicd-*` e os remove ao final.
