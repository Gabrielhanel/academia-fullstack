// Curso 2 da Onda 1: Git e GitHub na prática.
import { makeCourse } from './_lib.mjs';
import { REF } from './git-a.mjs';
import { lessonsA } from './git-a.mjs';
import { lessonsB } from './git-b.mjs';
import { exsets, assessment, project } from './git-ex.mjs';

const lessons = [...lessonsA, ...lessonsB];
const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Merge commit', def: 'Commit com dois pais que registra a junção de duas linhas de trabalho.' },
  { term: 'Fork', def: 'Cópia de um repositório na sua conta do GitHub, usada para contribuir com projetos de terceiros.' },
  { term: 'Issue', def: 'Registro de tarefa, bug ou ideia em um repositório do GitHub.' },
  { term: 'CODEOWNERS', def: 'Arquivo que define quem deve revisar cada parte do código.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'git-github', disciplineId: 'git', disciplineIds: [], areaId: 'ops', requires: [],
  title: 'Git e GitHub na prática',
  description: 'Do primeiro commit ao fluxo de equipe: o modelo mental do Git, commits atômicos, branches, merge e conflitos, repositórios remotos, desfazer e recuperar, rebase, pull requests, versionamento semântico e segurança de repositórios. Exercícios de código corrigidos por testes automáticos.',
  objectives: ['Explicar o Git como instantâneos encadeados, com branch e HEAD como ponteiros', 'Fazer commits pequenos e bem descritos, com .gitignore correto e mensagens no padrão Conventional Commits', 'Criar branches, mesclar e resolver conflitos com segurança', 'Sincronizar com o GitHub (fetch, pull, push) e autenticar com SSH ou token', 'Desfazer e recuperar trabalho com restore, reset, revert e reflog', 'Conduzir o fluxo de pull requests, calcular versões com SemVer e proteger o repositório'],
  level: 'I', prereqs: ['Saber usar um terminal básico (abrir, navegar entre pastas)', 'Ter o Git 2.23 ou superior instalado e uma conta no GitHub (gratuita)'], hours: 22,
  syllabus: 'Controle de versão e modelo de dados do Git; status, diff, log e .gitignore; mensagens de commit e Conventional Commits; branches, merge e conflitos; remotos, fetch, pull, push, SSH e tokens; restore, reset, revert e reflog; stash, rebase, cherry-pick, tags e bisect; GitHub flow, pull requests, proteção de branches, SemVer e segurança.',
  versions: 'Comandos conforme a documentação do Git 2.x (git switch e git restore exigem 2.23 ou superior). Recursos do GitHub conforme a documentação oficial; menus e rótulos da interface podem mudar. Os exemplos de código executáveis da plataforma usam JavaScript.',
  skills: ['Modelo mental do Git', 'Commits atômicos e mensagens', 'Branching e merge', 'Resolução de conflitos', 'Repositórios remotos', 'Desfazer e recuperar', 'Reescrita de histórico', 'Pull requests e revisão', 'Versionamento semântico', 'Segurança de repositórios'],
  modules: [
    { id: 'm1', title: 'Fundamentos e commits', lessons: ['git-01', 'git-02'] },
    { id: 'm2', title: 'Branches, merge e remotos', lessons: ['git-03', 'git-04'] },
    { id: 'm3', title: 'Desfazer, recuperar e reescrever', lessons: ['git-05', 'git-06'] },
    { id: 'm4', title: 'Colaboração, versões e segurança', lessons: ['git-07'] }
  ],
  materials: [REF.progit, REF.docs, REF.ghFlow, REF.conventional, REF.semver],
  projectIds: ['gerador-release'],
  supplement: {
    glossary,
    cheatsheet: `### Dia a dia
| Quero… | Comando |
|---|---|
| Ver o estado | §git status -sb§ |
| Ver o que mudou | §git diff§ (não preparado), §git diff --staged§ (preparado) |
| Preparar | §git add arquivo§, §git add -p§ |
| Gravar | §git commit -m "tipo(escopo): descrição"§ |
| Ver histórico | §git log --oneline --graph --decorate --all§ |
| Quem mudou a linha | §git blame arquivo§ |

### Branches e merge
| Quero… | Comando |
|---|---|
| Criar e trocar | §git switch -c nome§ |
| Trocar | §git switch nome§ |
| Mesclar | §git merge nome§ (§--abort§ cancela) |
| Apagar | §git branch -d nome§ |

### Remotos
| Quero… | Comando |
|---|---|
| Baixar sem integrar | §git fetch§ |
| Baixar e integrar | §git pull§ (§--rebase§) |
| Enviar | §git push§, primeira vez §git push -u origin nome§ |
| Corrigir uma branch minha reescrita | §git push --force-with-lease§ |

### Desfazer
| Situação | Comando |
|---|---|
| Descartar alterações do arquivo | §git restore arquivo§ |
| Tirar da preparação | §git restore --staged arquivo§ |
| Corrigir o último commit (local) | §git commit --amend§ |
| Voltar commits locais | §git reset --soft/--mixed/--hard HEAD~n§ |
| Desfazer commit compartilhado | §git revert commit§ |
| Recuperar | §git reflog§ |

### Versões
- SemVer: MAJOR.MINOR.PATCH. Breaking → MAJOR; feat → MINOR; fix → PATCH.
- Tag anotada: §git tag -a v1.2.0 -m "..."§ e §git push origin v1.2.0§.`,
    mistakes: ['git add . sem olhar o status e commitar .env, builds ou logs.', 'Colocar no .gitignore um arquivo já rastreado e esperar que ele saia do repositório.', 'Commitar com marcadores de conflito (<<<<<<<) esquecidos.', 'git push --force em branch compartilhada.', 'reset --hard sem lembrar que alterações não commitadas se perdem.', 'Rebasear commits já enviados.', 'Esquecer de enviar as tags.', 'Resolver segredo vazado apenas apagando o arquivo em um novo commit.', 'Pull requests gigantes e sem descrição.', 'Mensagens como "ajustes" e "wip".'],
    prereqMap: `**Pré-requisitos leves:** terminal básico e conta no GitHub. Este curso não depende de nenhum outro da trilha.

| Este curso prepara para | Por quê |
|---|---|
| CI/CD e GitHub Actions | pipelines são disparados por push, pull request e tag |
| Projetos em equipe (todos os cursos seguintes) | todo projeto da trilha é versionado e entregue por pull requests |
| Docker e deploy | versões e tags identificam as imagens publicadas |
| Qualidade e revisão de código | a revisão acontece nos pull requests |

Dentro do curso: aulas 1 e 2 (local) → 3 e 4 (branches e remotos) → 5 e 6 (histórico) → 7 (processo de equipe). A aula 1 reaproveita grafos do curso de Lógica, e a aula 6 reaproveita a busca binária, mas ambos podem ser estudados em qualquer ordem.`,
    officialRefs: [REF.progit, REF.docs, REF.gitignore, REF.merge, REF.switch, REF.restore, REF.reset, REF.revert, REF.reflog, REF.push, REF.bisect, REF.conventional, REF.semver, REF.ghFlow, REF.ghProtected, REF.ghMerge, REF.ghToken, REF.ghSecret],
    practice: ['Crie um repositório de treino e simule um conflito de propósito: duas branches editando a mesma linha, e resolva sem olhar a aula.', 'Faça um reset --hard em um repositório de teste e recupere o commit com o reflog.', 'Escreva a próxima semana de commits do seu projeto no padrão Conventional Commits e confira se o histórico se lê como um changelog.', 'Contribua com um repositório próprio de estudos usando o GitHub flow completo: branch, PR, revisão por você mesmo, squash.', 'Gere um par de chaves SSH, cadastre a pública e clone um repositório por SSH.', 'No projeto Gerador de release, rode a função contra o histórico real de um projeto seu.']
  }
};

export const GIT = makeCourse({ course, lessons, exsets, assessment, project });
