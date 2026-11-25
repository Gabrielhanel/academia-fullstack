// Curso 3 da Onda 1: HTML, CSS e acessibilidade.
import { makeCourse } from './_lib.mjs';
import { REF, lessonsA } from './htm-a.mjs';
import { lessonsB } from './htm-b.mjs';
import { exsets, assessment, project } from './htm-ex.mjs';

const lessons = [...lessonsA, ...lessonsB];
const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'DOM', def: 'Representação em árvore do documento HTML, usada pelo navegador e por tecnologias assistivas.' },
  { term: 'Tecnologia assistiva', def: 'Software ou dispositivo que ajuda pessoas com deficiência a usar o computador, como leitores de tela.' },
  { term: 'Nome acessível', def: 'Texto pelo qual uma tecnologia assistiva identifica um controle (do label, do conteúdo ou do aria-label).' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'html-css-a11y', disciplineId: 'html', disciplineIds: ['css', 'a11y'], areaId: 'front', requires: [],
  title: 'HTML, CSS e acessibilidade',
  description: 'A base de toda interface web: HTML semântico, formulários, CSS (cascata, box model, Flexbox, Grid e responsividade) e acessibilidade segundo a WCAG 2.2. Os exercícios de código analisam HTML e CSS como texto e são corrigidos por testes automáticos, sem executar código do aluno no DOM.',
  objectives: ['Escrever documentos HTML semânticos, com títulos, links, imagens, tabelas e formulários corretos', 'Prever qual regra CSS vence, usando cascata e especificidade', 'Calcular tamanhos com o box model e escolher unidades adequadas', 'Montar layouts responsivos com Flexbox, Grid e media queries mobile first', 'Aplicar a WCAG 2.2: contraste, teclado, foco, alvos e ARIA, e testar a acessibilidade'],
  level: 'I', prereqs: ['Saber usar um editor de texto e um navegador', 'Não exige programação; os exemplos em JavaScript são lidos e explicados'], hours: 24,
  syllabus: 'Estrutura e semântica do HTML; texto, links, imagens, mídia e tabelas; formulários e validação nativa; seletores, cascata, herança e especificidade; box model, unidades, cores e tipografia; Flexbox, Grid, posicionamento e responsividade; WCAG 2.2, contraste, teclado, foco, ARIA e testes de acessibilidade.',
  versions: 'HTML e CSS conforme as páginas atuais da MDN. Acessibilidade conforme a WCAG 2.2 (W3C Recommendation, publicada em outubro de 2023 e atualizada em dezembro de 2024). Os exemplos executáveis da plataforma usam JavaScript e analisam o HTML como texto.',
  skills: ['HTML semântico', 'Formulários acessíveis', 'Cascata e especificidade', 'Box model', 'Layout com Flexbox e Grid', 'Design responsivo', 'Contraste e cores', 'Acessibilidade por teclado', 'ARIA', 'Testes de acessibilidade'],
  modules: [
    { id: 'm1', title: 'HTML semântico', lessons: ['htm-01', 'htm-02', 'htm-03'] },
    { id: 'm2', title: 'CSS e layout', lessons: ['htm-04', 'htm-05', 'htm-06'] },
    { id: 'm3', title: 'Acessibilidade', lessons: ['htm-07'] }
  ],
  materials: [REF.mdnHtml, REF.mdnLayout, REF.wcag22, REF.wcagOverview, REF.mdnA11yHtml],
  projectIds: ['auditor-acessibilidade'],
  supplement: {
    glossary,
    cheatsheet: `### Estrutura mínima
§<!doctype html>§, §<html lang="pt-BR">§, §<meta charset="utf-8">§, §<meta name="viewport" content="width=device-width, initial-scale=1">§, §<title>§.

### Semântica
| Preciso de… | Use |
|---|---|
| Navegação principal | §<nav>§ |
| Conteúdo principal | §<main>§ (um por página) |
| Conteúdo independente | §<article>§ |
| Ação na página | §<button>§ |
| Ir a outro lugar | §<a href>§ |
| Título | §<h1>§–§<h6>§ sem saltos |

### Especificidade (id–classe–tipo)
| Seletor | Peso |
|---|---|
| §#a§ | 1-0-0 |
| §.a§, §[x]§, §:hover§ | 0-1-0 |
| §p§, §::before§ | 0-0-1 |
| §*§, combinadores, §:where()§ | 0-0-0 |

Empate: vence o último. Inline vence seletores; !important inverte.

### Box model
content-box: largura = width + 2×padding + 2×borda. border-box: largura = width. Margem fica fora.

### Layout
- Flexbox (uma dimensão): §display:flex; gap; justify-content; align-items; flex-wrap§.
- Grid (duas): §display:grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap§.
- Mobile first: base para o celular + §@media (min-width: 40rem)§.

### Acessibilidade (WCAG 2.2 AA)
- Contraste: texto comum 4,5:1; grande 3:1.
- Alvo de ponteiro: pelo menos 24×24 px CSS (com exceções).
- Todo conteúdo operável por teclado, com foco visível.
- Imagens com alt; decorativas com alt="".
- Todo campo com label; ARIA só quando o HTML nativo não basta.`,
    mistakes: ['div e span no lugar de elementos semânticos.', 'Escolher o nível do título pelo tamanho da fonte.', 'Imagens sem alt ou com alt igual ao nome do arquivo.', 'Placeholder no lugar de label.', '"Clique aqui" como texto de link.', 'outline: none sem alternativa de foco.', 'Resolver conflito de estilos com !important.', 'Esquecer meta viewport e box-sizing.', 'Texto cinza claro sobre fundo branco.', 'ARIA incorreto ou aria-hidden em elementos focáveis.', 'Confiar só em verificadores automáticos.'],
    prereqMap: `**Este curso não tem pré-requisitos obrigatórios.** Funciona bem logo depois de Lógica e Git, mas pode ser feito primeiro.

| Este curso prepara para | Por quê |
|---|---|
| JavaScript: fundamentos, DOM e módulos | o DOM é a árvore do HTML que você vai manipular |
| TypeScript e frameworks (React, Next.js) | componentes geram HTML e CSS que precisam ser semânticos e acessíveis |
| Testes de interface | seletores e rótulos acessíveis são a base dos testes (por exemplo, buscar por papel e nome) |
| Qualidade e revisão de código | acessibilidade é item comum de revisão |

Ordem recomendada: HTML (aulas 1 a 3) → CSS (4 a 6) → acessibilidade (7). A aula 7 retoma contraste, foco e rótulos vistos antes.`,
    officialRefs: [REF.mdnHtml, REF.mdnA11yHtml, REF.mdnLayout, REF.mdnSpec, REF.mdnBox, REF.mdnGrid, REF.wcagOverview, REF.wcag22, REF.target, REF.apg],
    practice: ['Refaça uma página sua trocando todos os divs por elementos semânticos e confira o resultado sem CSS.', 'Navegue pelo seu projeto só com o teclado e anote cada ponto em que o foco some ou a ordem não faz sentido.', 'Meça o contraste de todas as cores de texto do seu site e corrija as que ficam abaixo de 4,5:1.', 'Monte o mesmo layout duas vezes: com Flexbox e com Grid, e compare.', 'Aumente o zoom para 200% em cinco sites que você usa e observe o que quebra.', 'No projeto Auditor de acessibilidade, rode a função contra o HTML de uma página real sua e corrija o que ela apontar.']
  }
};

export const HTMCSS = makeCourse({ course, lessons, exsets, assessment, project });
