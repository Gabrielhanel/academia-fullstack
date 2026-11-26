// Curso C6.1 da C6: Docker, Compose e Kubernetes (disciplina: docker).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c61-a.mjs';
import { REF2, lessonsB } from './c61-b.mjs';
import { REF3, lessonsC } from './c61-c.mjs';
import { exsets, assessment, project } from './c61-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Containers vs máquinas virtuais', 'Dockerfile', 'Docker Compose', 'Kubernetes: pods, deployments e services', 'Helm', 'Kubernetes em produção'];
export const COVER = {
  'Containers vs máquinas virtuais': ['dk-01'],
  'Dockerfile': ['dk-02'],
  'Docker Compose': ['dk-03'],
  'Kubernetes: pods, deployments e services': ['dk-04'],
  'Helm': ['dk-05'],
  'Kubernetes em produção': ['dk-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Imagem OCI', def: 'Pacote imutável em camadas, com metadados, definido pela especificação da Open Container Initiative.' },
  { term: 'Registro', def: 'Serviço que armazena e distribui imagens de contêiner (Docker Hub, GHCR, ECR).' },
  { term: 'Digest', def: 'Hash de conteúdo (sha256) que identifica uma imagem de forma imutável, ao contrário de uma tag.' },
  { term: 'Volume', def: 'Armazenamento gerenciado fora da camada gravável do contêiner, que sobrevive à sua remoção.' },
  { term: 'ConfigMap', def: 'Objeto do Kubernetes que guarda configuração não sensível para pods.' },
  { term: 'Namespace (Kubernetes)', def: 'Agrupamento lógico de recursos de um cluster, usado para isolamento e cotas.' },
  { term: 'Node', def: 'Máquina (física ou virtual) do cluster onde os pods executam.' },
  { term: 'Kubelet', def: 'Agente de cada nó que executa os pods e as probes.' },
  { term: 'Selector', def: 'Conjunto de labels usado por um Service ou Deployment para escolher pods.' },
  { term: 'kubeconform', def: 'Ferramenta que valida manifestos Kubernetes contra os esquemas JSON da API, sem cluster.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'docker-k8s', disciplineId: 'docker', areaId: 'ops', requires: [],
  title: 'Docker, Compose e Kubernetes: contêineres, orquestração e Helm em produção',
  description: 'Empacotar, executar e operar aplicações em contêineres, com experimentos executados em um laboratório real: contêineres x VMs (mesmo kernel 7.0.0-43-generic, início mediano 883 ms, --memory=32m → OOMKilled 137, --cpus=0,5 ≈ 2x mais lento); Dockerfile ingênuo x otimizado (355 MB e 29,1 s de reconstrução x 260 MB e 3,4 s, usuário não root, hadolint 2.15.1); Docker Compose com PostgreSQL e Redis (saudável em 11,2 s, volumes que persistem, defeito de queda do banco corrigido: 0 reinícios, /pronto 503 e retorno em ~2 s); Kubernetes (Deployment, Service, HPA, PDB e Ingress validados com kubeconform 0.8.0: 6 recursos válidos, esquema que não pega protocol TCPP); Helm 4.3.2 (lint, template, values por ambiente e esquema de valores) e Kubernetes em produção (recursos, QoS, segurança, GitOps). Projeto: aplicação conteinerizada. Não havia cluster: Kubernetes foi validado estaticamente.',
  objectives: ['Explicar contêineres com namespaces e cgroups e comparar com VMs com números', 'Escrever Dockerfiles seguros, pequenos e com bom uso de cache', 'Orquestrar serviços locais com Compose, healthchecks e persistência', 'Descrever e validar manifestos Kubernetes e entender probes e rollout', 'Empacotar com Helm e validar charts na CI', 'Aplicar práticas de produção: recursos, disponibilidade, segurança e entrega'],
  level: 'M', prereqs: ['Linha de comando Linux e noções de redes (Onda 1)', 'JavaScript e Node.js básico', 'Docker 29 ou superior (o curso usa 29.9.3)'], hours: 12,
  syllabus: 'Contêineres e VMs; Dockerfile; Compose; Kubernetes; Helm; Kubernetes em produção; projeto de aplicação conteinerizada.',
  versions: 'Docker 29.9.3, Compose 5.7.1, Node 26.13.1 (imagem node:26-alpine), PostgreSQL 17, Redis 8, hadolint 2.15.1, kubeconform 0.8.0 (Kubernetes 1.34.0) e Helm 4.3.2, em 2026-11-25 (laboratório em seed/c6/labs/docker-k8s/). Medidas de uma execução em uma máquina (tempos e tamanhos variam). Achados: o hadolint aprovou o Dockerfile ingênuo; o kubeconform aprovou protocol TCPP; o primeiro Compose derrubava a aplicação ao parar o banco (corrigido). Os desafios de código são em JavaScript e modelam a lógica. Não executados: cluster Kubernetes (kubectl, kind, minikube), probes e rollout reais, HPA, NetworkPolicy, RBAC, Ingress, Argo CD/Flux, Trivy e assinatura de imagens, registros remotos.',
  skills: ['Conteinerização de aplicações', 'Dockerfile e otimização de imagens', 'Docker Compose', 'Manifestos Kubernetes', 'Helm', 'Práticas de produção em Kubernetes'],
  modules: [
    { id: 'm1', title: 'Contêineres e imagens', lessons: ['dk-01', 'dk-02'] },
    { id: 'm2', title: 'Compose e Kubernetes', lessons: ['dk-03', 'dk-04'] },
    { id: 'm3', title: 'Helm e produção', lessons: ['dk-05', 'dk-06'] }
  ],
  materials: [REF.dockerOverview, REF.dockerBest, REF2.composeDocs, REF2.k8sConcepts, REF3.helmDocs].map((r) => ({ ...r })),
  projectIds: ['app-conteinerizada'],
  supplement: {
    glossary,
    cheatsheet: R`### Contêineres
Processo isolado por namespaces + limitado por cgroups · kernel do host compartilhado · --memory estoura → 137 OOMKilled · --cpus limita por throttling

### Dockerfile
Manifestos antes do código (cache) · multi-estágio · npm ci --omit=dev · USER numérico · HEALTHCHECK e CMD em forma exec · .dockerignore · segredos com --mount=type=secret · hadolint no CI

### Compose
depends_on + service_healthy · volume nomeado persiste (down -v apaga) · portas em 127.0.0.1 · read_only, cap_drop ALL · /saude (liveness) ≠ /pronto (readiness) · trate db.on("error")

### Kubernetes
Pod < ReplicaSet < Deployment · Service por selector + readiness · rolling update maxSurge/maxUnavailable · probes: startup, liveness, readiness · requests e limits · HPA (razão, tolerância 10%) · PDB (disrupção voluntária)

### Helm
Chart.yaml · values + values por ambiente + values.schema.json · helm lint · helm template | kubeconform · sem segredos nos values · rollback por release

### Produção
QoS (BestEffort/Burstable/Guaranteed) · Pod Security restricted · NetworkPolicy negar-por-padrão · RBAC mínimo · imagens por digest · GitOps · validação estática ≠ execução em cluster`,
    mistakes: ['Copiar o código antes de instalar dependências e perder o cache.', 'Executar como root e com devDependencies na imagem final.', 'Usar a mesma verificação para liveness e readiness.', 'Não tratar erros dos clientes de banco e derrubar o processo.', 'Aceitar a validação de esquema como prova de que o manifesto funciona.', 'Definir limites sem medir ou sem requests (HPA depende deles).', 'Colocar segredos em values.yaml versionado.', 'Usar a tag latest em produção.'],
    prereqMap: R`**Antes deste curso:** terminal Linux, redes básicas e uma aplicação simples em Node.

| Este curso prepara para | Por quê |
|---|---|
| CI/CD (C6.2) | construir, validar e entregar imagens e manifestos automaticamente |
| Nginx (C6.3) | proxy reverso e balanceamento à frente dos contêineres |
| Cloud (C6.4) | serviços gerenciados de contêineres e Kubernetes |
| Monitoramento (C6.6) | probes, métricas e alertas dos serviços |

Ordem interna: aulas 1 e 2 (contêineres e imagens) → 3 e 4 (Compose e Kubernetes) → 5 e 6 (Helm e produção) → projeto.`,
    officialRefs: [REF.dockerOverview, REF.dockerBest, REF.dockerMulti, REF.dockerCache, REF.dockerSecurity, REF.dockerResources, REF.namespaces, REF.cgroups, REF.oci, REF.hadolint, REF.twelveFactor, REF2.composeDocs, REF2.composeStartup, REF2.composeFile, REF2.k8sPods, REF2.k8sDeployments, REF2.k8sServices, REF2.k8sProbes, REF2.k8sConcepts, REF2.kubeconform, REF3.helmDocs, REF3.helmBest, REF3.helmSchema, REF3.k8sBest, REF3.k8sResources, REF3.k8sHpa, REF3.k8sPdb, REF3.k8sPss, REF3.k8sNetpol, REF3.k8sRbac, REF3.k8sSecrets, REF3.argocd],
    practice: ['Meça o tamanho e a reconstrução de um Dockerfile antes e depois de otimizar.', 'Rode um contêiner com --memory pequeno e leia o código 137.', 'Suba API, banco e cache com Compose e teste a queda do banco.', 'Valide manifestos com kubeconform e provoque erros.', 'Crie um chart com esquema de valores e renderize para dois ambientes.', 'Calcule réplicas do HPA e a classe de QoS de um pod.', 'Faça o projeto integrador: aplicação conteinerizada.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
