Cruzamento entre alertas de fim de vida (EOL) do Radar e o texto dos cursos. Só entram alertas de relevância alta (já em EOL ou a até 180 dias). Cada linha é um trecho que cita a tecnologia **e** a versão do alerta; é uma sugestão de revisão, não uma correção automática. Gerado em 2026-11-26.

**16** alertas de EOL analisados; **4** com trechos a revisar; **12** sem menção nos cursos.

## Node.js 20 sem suporte de segurança desde 30/04/2026 (alta)

3 trecho(s) em 2 curso(s).

| Curso | Onde | Trecho |
|---|---|---|
| js-async | versões do curso | …m a versão 18 ou superior; AbortSignal.any requer Node.js 20 ou superior. |
| logica-algoritmos | versões do curso | … é do ES2024. Funciona em navegadores atuais e em Node.js 20 ou superior; o laboratório da plataforma executa os exemplo… |
| js-async | jsa-07 — Padrões de produção: timeout, cancelamento, retry e limite de concorrência | … qualquer um abortar. Requer navegador moderno ou Node.js 20+; em ambientes antigos, combine manualmente. 6-10 fetch não… |

## Kubernetes 1.34 chegou ao fim de vida (EOL) em 27/10/2026 (alta)

7 trecho(s) em 1 curso(s).

| Curso | Onde | Trecho |
|---|---|---|
| docker-k8s | versões do curso | … 17, Redis 8, hadolint 2.15.1, kubeconform 0.8.0 (Kubernetes 1.34.0) e Helm 4.3.2, em 2026-11-25 (laboratório em seed/c6/labs… |
| docker-k8s | dk-04 — Kubernetes: pods, deployments e services, com manifestos declarativos validados estaticamente | …ente** com o **kubeconform 0.8.0** (esquemas do **K8s 1.34.0**, modo estrito): **6 recursos válidos** (`ConfigMap`, `D… |
| docker-k8s | dk-04 — Kubernetes: pods, deployments e services, com manifestos declarativos validados estaticamente | …ado:** **validação estática** (kubeconform 0.8.0, K8s 1.34.0). **Não executado:** **qualquer aplicação em cluster** (*… |
| docker-k8s | dk-04 — Kubernetes: pods, deployments e services, com manifestos declarativos validados estaticamente | …readiness (/pronto). Medido: o kubeconform 0.8.0 (K8s 1.34.0, estrito) validou 6 recursos, recusou um arquivo com cont… |
| docker-k8s | dk-05 — Helm: charts, valores e templates para empacotar e parametrizar aplicações Kubernetes | …VEL: "info"` \| \| **`... \| kubeconform -strict`** (K8s 1.34.0) \| **4 recursos válidos** \| **Padrão para CI:** **`helm l… |
| docker-k8s | dk-06 — Kubernetes em produção: recursos, escalabilidade, disrupções, segurança, entrega por GitOps e operação | …ca** do manifesto de produção (kubeconform 0.8.0, K8s 1.34.0). **Medidos em outro contexto:** OOM e throttling (dk-01)… |
| docker-k8s | dk-06 — Kubernetes em produção: recursos, escalabilidade, disrupções, segurança, entrega por GitOps e operação | …file # 2) manifestos puros: validação de esquema (K8s 1.34.0) docker run --rm -v "$PWD/k8s:/k8s:ro" ghcr.io/yannh/kube… |

## Node.js 22 perde suporte de segurança em 30/04/2027 (alta)

4 trecho(s) em 2 curso(s).

| Curso | Onde | Trecho |
|---|---|---|
| node-express | nex-07 — Profiling e Node.js em produção: diagnóstico, desligamento ordenado, saúde, configuração e o projeto | … (esquema Zod) e **falhe rápido** se faltar algo. Node 22+: `node --env-file=.env` carrega um arquivo (**não** versio… |
| cicd | cicd-02 — GitHub Actions: workflows, jobs, matriz, cache e segurança, verificados com o actionlint | … (ci.yml) **Dois jobs**: `test` (**matriz** com **Node 22 e 24**: **2 execuções em paralelo**) e `build` (`needs: tes… |
| cicd | cicd-02 — GitHub Actions: workflows, jobs, matriz, cache e segurança, verificados com o actionlint | … antiga da mesma ref. Duas execuções em paralelo (Node 22 e 24). build só roda se test passar. Forma segura de usar u… |
| cicd | cicd-02 — GitHub Actions: workflows, jobs, matriz, cache e segurança, verificados com o actionlint | …ssos e ações. O ci.yml do laboratório usa matriz (Node 22 e 24), cache, concurrency com cancelamento, timeout e permi… |

## PostgreSQL 14 chegou ao fim de vida (EOL) em 12/11/2026 (alta)

1 trecho(s) em 1 curso(s).

| Curso | Onde | Trecho |
|---|---|---|
| sql-essencial | sqe-08 — CTEs: WITH, consultas em etapas, CTEs recursivas e hierarquias | … o nó já foi visitado, ou com a cláusula `CYCLE` (PostgreSQL 14 ou superior; consulte a documentação). `UNION` (sem `ALL`) … |

## Sem menção nos cursos

- RabbitMQ 4.2 chegou ao fim de vida (EOL) em 31/07/2026
- Redis 8.4 chegou ao fim de vida (EOL) em 10/08/2026
- React Native 0.84 chegou ao fim de vida (EOL) em 11/08/2026
- React Native 0.85 chegou ao fim de vida (EOL) em 12/10/2026
- Next.js 15 perde suporte de segurança em 31/01/2027
- Redis 8.6 chegou ao fim de vida (EOL) em 25/11/2026
- Redis 8.0 chega ao fim de vida (EOL) em 01/12/2026
- Docker Engine 25.0 chega ao fim de vida (EOL) em 04/12/2026
- Redis 8.8 chega ao fim de vida (EOL) em 29/01/2027
- RabbitMQ 4.3 chega ao fim de vida (EOL) em 31/01/2027
- Kubernetes 1.35 chega ao fim de vida (EOL) em 28/02/2027
- Redis 6.2 chega ao fim de vida (EOL) em 01/04/2027
