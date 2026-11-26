# PLANO-C6 — Infra e entrega: Docker/Kubernetes, CI/CD, Nginx, Cloud, IaC e Monitoramento

Data: 2026-11-25. Fonte da verdade: `docs/PLANO-ACADEMIA-V2.md` (linha C6) e `seed/seed.json` (área `ops`, disciplinas `docker`, `cicd`, `nginx`, `cloud`, `iac`, `monitor`; `linux` e `git` pertencem a ondas anteriores). Produção isolada em `seed/c6/`; Onda 1, `seed/c1`–`c5`, `SEED_REV` (3), `seedPlan`, migração e `seed/build.mjs` não são alterados; nada é integrado, publicado ou gravado no banco real.

## Divergências registradas
- O plano estima 6, 4, 3, 6, 2 e 4 tópicos; os cursos seguem os tópicos do `seed.json` (6, 4, 3, 6, 2 e 4), um por aula quando faz sentido.
- Ambiente local: Docker 29.9.3 e Compose v5.7.1; **não há** `kubectl`, cluster Kubernetes, contas de nuvem nem chaves. Portanto: manifests Kubernetes e charts Helm são **validados estaticamente** (kubeconform, `helm lint` e `helm template` em contêineres) e **não executados em um cluster**; AWS, Azure e Google Cloud são **analisados** (sem execução na nuvem), com cálculos e emuladores locais quando cabível; Terraform roda **localmente** com provedores locais.
- Exercícios `code` rodam só em JavaScript (Worker); modelam a lógica (parsers de configuração, cálculos de custo, estratégias de rollout).

## Cursos, agrupamento e justificativa
| Curso | Arquivo | Disciplina | Tópicos | Aulas | Projeto |
|---|---|---|---|---|---|
| C6.1 Docker, Compose e Kubernetes | c61-docker-k8s | docker | Containers vs VMs; Dockerfile; Compose; Kubernetes (pods, deployments, services); Helm; Kubernetes em produção | 6 | app-conteinerizada |
| C6.2 CI/CD e GitHub Actions | c62-cicd | cicd | Conceitos; GitHub Actions; Pipelines de deploy; Blue-green e canary | 4 | pipeline-de-entrega |
| C6.3 Nginx, proxy reverso e deploy | c63-nginx | nginx | Proxy reverso; TLS e HTTPS; Load balancing | 3 | borda-nginx |
| C6.4 Cloud (AWS, Azure, Google Cloud) | c64-cloud | cloud | Conceitos; AWS; Azure; Google Cloud; Serverless; Custos e multi-cloud | 6 | arquitetura-cloud |
| C6.5 Infraestrutura como código | c65-iac | iac | Terraform; Módulos, state e boas práticas | 2 | infra-como-codigo |
| C6.6 Monitoramento | c66-monitoramento | monitor | Logs e métricas; Prometheus; Grafana; Alertas e on-call | 4 | observabilidade-operada |

## Estimativas
25 aulas; ~150 exercícios (6 por aula); ≥ 7 desafios `code` por curso; 6 provas de 12 itens; 6 projetos.

## Pré-requisitos
C4 (Node/Express, observabilidade), C5 (testes, CI), Linux e Git (ondas anteriores).

## Ferramentas (verificadas em 2026-11-25)
Docker Engine 29.9.3, Compose v5.7.1, imagens oficiais (nginx, node, prom/prometheus, grafana, hashicorp/terraform, hadolint, kubeconform, alpine/helm). Cada laboratório lista as versões exatas efetivamente executadas.

## Laboratórios (`seed/c6/labs/<curso>/`) e validação
README (ambiente, versões, comandos, resultados, limitações), arquivos executados e saídas registradas; separação em cada curso entre executado, analisado e não executado. Validação: `node seed/c6/validate.mjs`, `refs-check.mjs` e `browser-check.mjs`. Efeitos fora do repositório (imagens Docker baixadas, contêineres, redes) são removidos ao fim de cada curso.
