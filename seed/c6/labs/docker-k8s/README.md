# Laboratório C6.1 — Docker, Compose e Kubernetes

Ambiente (2026-11-25): Docker Engine 29.9.3, Compose v5.7.1, Linux 7.0 (kernel 7.0.0-43), `node:26-alpine` (Node 26.13.1, npm 11.20.0), postgres:17, redis:8, hadolint 2.15.1, kubeconform 0.8.0 e Helm 4.3.2 (imagens oficiais). **Não há cluster Kubernetes nem `kubectl` neste ambiente.**

## Conteúdo
- `app/`: API Express 5.3.0 com pg 8.23.1 e ioredis 6.1.0 (`/saude`, `/pronto`, `/visitas`), `Dockerfile.ingenuo` e `Dockerfile` (multi-estágio, usuário não root, HEALTHCHECK) e `.dockerignore`.
- `isolamento.sh`: kernel, PIDs, tempo de início, limites de memória e CPU, camada gravável x volume.
- `compose.yaml`: app + PostgreSQL + Redis com healthchecks, `depends_on` com `service_healthy`, volume nomeado, sistema de arquivos somente leitura e capacidades removidas.
- `k8s/app.yaml` (ConfigMap, Deployment, Service, HPA, PDB, Ingress) e `k8s/invalido.yaml`; `chart/` (Helm: valores, esquema, templates).

## Comandos
```
docker build -f app/Dockerfile.ingenuo -t lab-ingenuo app ; docker build -f app/Dockerfile -t lab-otimizado app
./isolamento.sh
docker compose up -d --wait ; docker compose down [-v]
docker run --rm -i hadolint/hadolint hadolint - < app/Dockerfile
docker run --rm -v "$PWD/k8s:/k8s:ro" ghcr.io/yannh/kubeconform:latest -strict -summary -kubernetes-version 1.34.0 /k8s/app.yaml
docker run --rm -v "$PWD/chart:/chart" alpine/helm lint /chart ; ... template meu /chart -f /chart/values-producao.yaml
```

## Resultados medidos (arquivos `saida-*.txt`; uma máquina, uma execução)
- Imagens: ingênua 355 MB (root, devDependencies, 39,1 s sem cache e 29,1 s ao alterar só `server.mjs`) x otimizada 260 MB (usuário 1000, 20,6 s sem cache e 3,4 s na reconstrução).
- hadolint: o Dockerfile ingênuo passou (exit 0) e o otimizado recebeu DL3066 (usuário não numérico) e DL3025 (CMD do HEALTHCHECK fora da forma JSON); corrigidos, ambos passam. O lint não detecta root nem devDependencies: não substitui a revisão.
- Isolamento: mesmo kernel no host e no contêiner (7.0.0-43-generic); PID 1 no contêiner; início e término de `docker run --rm alpine true`: mediana de 883 ms (mín. 845, máx. 929), incluindo CLI, daemon e rede; `--memory=32m` com alocação de 200 MiB: saída 137 e `OOMKilled: true`; laço de 3e8 iterações: 3.802 ms com `--cpus=1` e 7.758 ms com `--cpus=0.5`; a camada gravável some e o volume persiste.
- Compose: tudo saudável em 11,2 s; 3 visitas no Redis e no banco; usuário 1000, `/app` somente leitura e `/tmp` gravável; `down` mantém os dados (3) e `down -v` os apaga (0). Achado real: ao parar o banco, a aplicação **caiu** (erro `Unhandled 'error' event` do pool do pg; 1 reinício); com ouvintes de erro no pool e no Redis, 0 reinícios, `/pronto` devolve 503 e `/saude` 200, e a prontidão volta em ~2 s com o banco.
- kubeconform (K8s 1.34.0, `-strict`): `k8s/app.yaml` 6 recursos válidos; `k8s/invalido.yaml` inválido (`containerPort` como texto, propriedade `imagem` desconhecida), mas o `protocol: TCPP` do Service passou: o esquema não valida tudo.
- Helm: `lint` ok; `template` com `values-producao.yaml` gera Service, Deployment, HPA (4 a 12) e Ingress, sem `replicas` no Deployment (o HPA assume); `replicaCount=0` e `pullPolicy=Talvez` são recusados pelo `values.schema.json`; o resultado renderizado passa no kubeconform (4 recursos válidos).

## Limitações
Nenhum recurso foi aplicado a um cluster: probes, HPA, PDB, rollouts, Ingress e NetworkPolicy foram apenas validados estaticamente. Não foram executados kind/minikube/k3s, kubectl, Helm install/upgrade/rollback, registries privados, varredura de vulnerabilidades (Trivy/Scout) nem Podman/BuildKit avançado. O tempo de início de contêiner inclui o overhead do CLI.
