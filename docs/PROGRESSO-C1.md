# Progresso da produção da C1 (missão noturna, 2026-11-18)

Regras: não alterar Onda 1 nem o piloto; não alterar `SEED_REV`, `seedPlan` ou o banco real; não publicar. Tudo fica em `seed/c1/` e **não está ligado** a `seed/build.mjs` (a integração é proposta em `REVISAO-OPUS-C1.md`).

Ferramentas: `node seed/c1/validate.mjs [curso]` (estrutura, checklists, execução dos desafios JS, cobertura de tópicos) e `node seed/c1/refs-check.mjs` (abre cada URL com GET real; cache em `refs-cache.json`).

| Curso | Arquivos | Estado |
| --- | --- | --- |
| C1.1 Linux, terminal e SO (`linux-terminal-so`) | `c11-a/b/c/ex/linux-so.mjs` | Validado (9 aulas, 51 exercícios, prova 12, projeto, suplemento; 29 URLs abertas) |
| C1.2 Redes e HTTP (`redes-http`) | `c12-a/b/ex/redes.mjs` | Validado (7 aulas, 42 exercícios, prova 12, projeto, suplemento; refs abertas) |
| C1.3 Ferramentas + regex (`ferramentas-regex`) | `c13-a/b/c/ex/ferramentas.mjs` | Validado (8 aulas, 47 exercícios, prova 12, projeto, suplemento; refs abertas) |
| C1.4 Paradigmas (`paradigmas-programacao`) | `c14-a/b/ex/paradigmas.mjs` | Validado (6 aulas, 32 exercícios incl. 8 `code`, prova 12, projeto, suplemento; 20 URLs abertas; exemplos executados em Node.js 26) |
| C1.5 Web Platform (`web-platform`) | `c15-a/b/c/ex/web-platform.mjs`, `web-lab/` | Validado (7 aulas, 41 exercícios incl. 8 `code`, prova 12, projeto, suplemento; 144 URLs abertas no total da C1; exemplos executados no Chrome 157) |
| C1.6 Fluxo e agilidade (`fluxo-agilidade`) | `c16-a/b/ex/fluxo.mjs` | Validado (7 aulas, 41 exercícios incl. 8 `code`, prova 12, projeto, suplemento; Git 2.53 e Node.js 26 executados; 168 URLs abertas no total da C1) |
| C1.7 Requisitos e modelagem de domínio (`requisitos-dominio`) | `c17-a/b/ex/requisitos.mjs` | Validado (7 aulas, 38 exercícios incl. 7 `code`, prova 12, projeto, suplemento; 190 URLs abertas no total da C1; cucumber-js 13.3.0 e Node.js 26 executados) |

## Premissas e decisões
- Convenções: ids de aula `lnx-NN`, `red-NN`, `fer-NN`, `par-NN`, `web-NN`, `flx-NN`, `req-NN`; prova `<curso>-pN`; `§` vira crase; `DOLAR{` vira `${`.
- Exemplos de shell foram executados em Bash 5 / Linux. Exceção: o ramo `rm` do `backup.sh` não foi executado (bloqueio de segurança do ambiente); testado via modo `-n`. Registrado na aula lnx-08.
- `gnu.org` não abre neste ambiente (conexão falha, inclusive pelo agente web-fetch). As referências GNU foram trocadas por equivalentes que abriram: página do mantenedor do Bash (case.edu) e POSIX (opengroup.org).
- Desafios `code` modelam a lógica dos comandos em JavaScript (único executável no laboratório).

## Fechamento (2026-11-18)
- Os 7 cursos estão validados (`node seed/c1/validate.mjs`: sem falhas) e as 190 URLs citadas abrem (`node seed/c1/refs-check.mjs`; uma, do iso.org, foi aberta no navegador porque o GET automático recebeu 403).
- Os 57 desafios `code` rodam em um Web Worker do Chrome 157 como no laboratório do app (`node seed/c1/browser-check.mjs`): todas as soluções passam e nenhum código inicial passa em todos os testes.
- Evidências de execução dos exemplos: `seed/c1/labs/` e `seed/c1/web-lab/`.
- Pendências: `REVISAO-OPUS-C1.md` (integração, SEED_REV e migração) e decisão do dono. Nada foi publicado e o banco real não foi alterado.
- Ajustes de conteúdo feitos por checagem de fonte: ISO/IEC 25010 passou a descrever a revisão de 2023 (nove características); o Kanban Guide (maio de 2025) e o Scrum Guide (2020) foram conferidos no site oficial.
