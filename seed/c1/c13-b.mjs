// C1.3 — Ferramentas do desenvolvedor e expressões regulares. Aulas 4 e 5 (linters, formatadores, scripts e hooks).
import { REF as RA } from './c13-a.mjs';
const R = String.raw;

export const REF2 = {
  eslintDocs: { title: 'ESLint — Documentação (Use ESLint)', url: 'https://eslint.org/docs/latest/use/getting-started', kind: 'doc' },
  eslintConfig: { title: 'ESLint — Configuration Files (flat config)', url: 'https://eslint.org/docs/latest/use/configure/configuration-files', kind: 'doc' },
  eslintRules: { title: 'ESLint — Rules reference', url: 'https://eslint.org/docs/latest/rules/', kind: 'doc' },
  prettierDocs: { title: 'Prettier — Documentação', url: 'https://prettier.io/docs/', kind: 'doc' },
  prettierRationale: { title: 'Prettier — Rationale', url: 'https://prettier.io/docs/rationale', kind: 'doc' },
  prettierEslint: { title: 'Prettier — Integrating with Linters', url: 'https://prettier.io/docs/integrating-with-linters', kind: 'doc' },
  npmScripts: { title: 'npm Docs — scripts (package.json)', url: 'https://docs.npmjs.com/cli/v11/using-npm/scripts', kind: 'doc' },
  npmPkg: { title: 'npm Docs — package.json', url: 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json', kind: 'doc' },
  gitHooks: { title: 'Git — githooks (documentação oficial)', url: 'https://git-scm.com/docs/githooks', kind: 'doc' },
  gitConfigHooks: { title: 'Git — git-config (core.hooksPath)', url: 'https://git-scm.com/docs/git-config', kind: 'doc' },
  husky: { title: 'Husky — documentação', url: 'https://typicode.github.io/husky/', kind: 'doc' },
  lintStaged: { title: 'lint-staged — repositório e documentação', url: 'https://github.com/lint-staged/lint-staged', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'fer-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['eslint', 'prettier', 'lint', 'formatacao'],
  title: 'Linters e formatadores: ESLint e Prettier',
  objectives: ['Diferenciar linter, formatador e verificador de tipos e o papel de cada um', 'Configurar o ESLint com a configuração plana (eslint.config.js), regras, severidades e escopos por arquivo', 'Configurar e executar o Prettier (--check e --write) e entender seu modelo "opinativo"', 'Evitar conflitos entre ESLint e Prettier e introduzir as ferramentas em um projeto existente sem poluir o histórico', 'Interpretar a saída das ferramentas e decidir quando corrigir, ajustar uma regra ou justificar uma exceção'],
  intro: `Revisão de código é um recurso caro: gastá-la discutindo **espaços, aspas e ponto e vírgula** é desperdício. Ferramentas automáticas resolvem isso e ainda **encontram bugs** antes da execução (variável não usada, comparação com tipo errado, código inalcançável). O **ESLint** analisa o código em busca de problemas; o **Prettier** reescreve o código em um estilo único. Usados juntos, na máquina de cada pessoa e no CI, eles tiram o estilo da conversa e elevam a qualidade média do código.`,
  theory: `### Três ferramentas, três papéis
| Ferramenta | Pergunta | Exemplo |
|---|---|---|
| **Formatador** | "O código segue o estilo padrão?" | Prettier: indentação, aspas, quebras de linha |
| **Linter** | "Este código tem padrões **suspeitos ou perigosos**?" | ESLint: variável não usada, §==§ em vez de §===§, §var§ |
| **Verificador de tipos** | "Os tipos são coerentes?" | TypeScript (§tsc§), tema de outro curso |

Não se substituem: o formatador não encontra o bug do §==§; o linter não padroniza a largura de linha; e nenhum dos dois entende os tipos como o compilador.

### ESLint: configuração plana
A partir do ESLint 9, o formato padrão é a **configuração plana** (*flat config*): um arquivo §eslint.config.js§ que exporta **um array** de objetos de configuração, aplicados em ordem (os últimos têm precedência). Em nosso laboratório (ESLint 10.15, Node.js 26, projeto com §"type": "module"§), esta foi a configuração usada:
§§§javascript
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: { globals: { console: "readonly" } },
    rules: { eqeqeq: "error", "no-var": "error", "prefer-const": "warn" },
  },
];
§§§
- §js.configs.recommended§: conjunto de regras recomendadas pelo próprio ESLint (inclui §no-unused-vars§, §no-undef§).
- **§rules§**: cada regra tem uma **severidade**: §"off"§ (ou 0), §"warn"§ (1: avisa, não falha) ou §"error"§ (2: falha o comando). Regras podem receber opções: §["error", { "argsIgnorePattern": "^_" }]§.
- **§languageOptions§**: versão da linguagem, tipo de módulo e **globais** (§console§, §window§, §process§...). Sem declarar o ambiente, o ESLint acusa §no-undef§ para globais legítimos.
- **§files§ e §ignores§**: aplicam um bloco só a certos arquivos (§files: ["**/*.test.js"]§) ou ignoram pastas (§ignores: ["dist/**"]§). Assim, regras diferentes valem para testes, scripts e código do navegador.
- **Plugins**: ampliam o ESLint (por exemplo, §typescript-eslint§ para TypeScript, §eslint-plugin-react§, §eslint-plugin-n§ para Node.js).

Na prática, com este código de teste:
\`\`\`
var total = 0
function soma(a, b) { if (a == b) { return a + b } let naoUsada = 1; return total }
console.log(soma(1, 2))
\`\`\`
o comando §npx eslint src/app.js§ produziu: §no-var§ (erro), §eqeqeq§ (erro), §no-unused-vars§ (erro) e §prefer-const§ (aviso), e saiu com **código 1** (há erros). A opção §--fix§ aplica as correções **seguras** (aqui trocou §var§ e §let§ por §const§) e **mantém** o que exige decisão humana (§==§ e a variável não usada). Opções úteis: §--max-warnings 0§ (trata avisos como falha, bom para CI), §--cache§ (reanalisa só o que mudou) e §--format§.

**Princípios de configuração:** comece pelo conjunto recomendado; ative regras que **previnem bugs reais**; evite regras de estilo (deixe para o Prettier); desligue uma regra **globalmente** só se ela não serve ao time; use **comentários de exceção** (§// eslint-disable-next-line regra -- motivo§) com justificativa e escopo mínimo.

### Prettier: formatação sem discussão
O Prettier é **opinativo**: tem poucas opções de propósito (§printWidth§, §tabWidth§, §semi§, §singleQuote§, §trailingComma§...), reformata o código **a partir da árvore sintática** (ignora a formatação original) e garante o mesmo resultado em qualquer máquina. Configuração em §.prettierrc.json§:
§§§json
{ "singleQuote": true, "semi": true, "printWidth": 80 }
§§§
Comandos: §npx prettier --check .§ (apenas verifica; sai com **código 1** se algo estiver fora do padrão, ideal para o CI) e §npx prettier --write .§ (reescreve). Em nosso teste, o arquivo sem formatação falhou no §--check§, e o §--write§ adicionou os pontos e vírgulas e quebrou as linhas. §.prettierignore§ exclui pastas geradas (§dist§, §coverage§). Prettier também formata JSON, CSS, HTML, Markdown e YAML.

### ESLint e Prettier juntos
Regras de **formatação** do ESLint conflitam com o Prettier (dois programas "brigando" pelo mesmo espaço). A abordagem atual é a separação de responsabilidades: **Prettier formata; ESLint detecta problemas**. Se usar regras de estilo do ESLint, desative as que conflitam com a configuração de integração (§eslint-config-prettier§). Não rode o Prettier *dentro* do ESLint como regra: é lento e confuso; execute os dois como comandos separados (§prettier --check§ e §eslint§).

### Integração com o editor e o fluxo
- **No editor:** extensões do ESLint e do Prettier mostram erros enquanto você digita e formatam ao salvar (§"editor.formatOnSave": true§).
- **No projeto:** scripts no §package.json§ (próxima aula).
- **No CI:** o pipeline roda §eslint --max-warnings 0§ e §prettier --check§. O editor ajuda, **o CI garante**.

### Introduzindo em um projeto existente
Formatar um projeto inteiro de uma vez cria um *diff* gigantesco que atrapalha o histórico. Boas práticas: (1) faça a formatação em **um commit separado**, sem mudanças de lógica; (2) registre o *hash* em um arquivo §.git-blame-ignore-revs§ para que o §git blame§ ignore esse commit (§git config blame.ignoreRevsFile .git-blame-ignore-revs§); (3) comece as regras do linter como §warn§ e suba para §error§ gradualmente; (4) combine a mudança com o time antes.

### Como tratar um aviso
Perguntas, nesta ordem: (1) **o código está errado?** Corrija. (2) A regra faz sentido, mas este caso é legítimo? Use uma exceção local com justificativa. (3) A regra gera ruído em todo o projeto? Discuta e desative ou ajuste **no arquivo de configuração**, não com dezenas de comentários espalhados. Nunca desligue o linter inteiro para "passar o CI".`,
  concepts: [
    { term: 'Linter', def: 'Ferramenta de análise estática que encontra padrões suspeitos ou perigosos no código (ex.: ESLint).' },
    { term: 'Formatador', def: 'Ferramenta que reescreve o código em um estilo padrão (ex.: Prettier).' },
    { term: 'Flat config', def: 'Formato de configuração do ESLint (eslint.config.js) com um array de objetos aplicados em ordem.' },
    { term: 'Severidade', def: 'Nível de uma regra: off, warn (avisa) ou error (falha o comando).' },
    { term: '--fix', def: 'Opção que aplica correções automáticas seguras às violações.' },
    { term: 'Prettier --check', def: 'Verifica a formatação sem alterar arquivos; sai com 1 se algo estiver fora do padrão.' },
    { term: 'Opinativo', def: 'Ferramenta com poucas opções de configuração, que impõe decisões de estilo.' },
    { term: 'eslint-disable', def: 'Comentário que desativa uma regra em uma linha ou trecho; deve ser justificado.' },
    { term: '.git-blame-ignore-revs', def: 'Lista de commits (como formatações em massa) que o git blame deve ignorar.' }
  ],
  examples: R`**Analogia:** o **formatador** é o revisor ortográfico e o diagramador de um jornal: padroniza a aparência de toda matéria, independente de quem escreveu. O **linter** é o checador de fatos: não liga para a fonte, mas avisa "esta frase contradiz o parágrafo anterior" ou "você citou uma pessoa que não existe" (variável não declarada). O **verificador de tipos** é o auditor que confere se os números da tabela somam.

**Cenário real — o PR de 800 linhas só de estilo:** a pessoa nova formatou um arquivo com o estilo do seu editor, e o PR ficou impossível de revisar. Com Prettier no projeto (e o CI com §--check§), qualquer formatação é idêntica, e o PR mostra apenas mudanças de lógica.

**Cenário real — bug pego pelo linter:** o §eqeqeq§ apontou §if (id == valor)§ onde §id§ era número e §valor§, string. Com §==§, o JavaScript converteria os tipos e daria §true§ em casos inesperados (§0 == ""§); a correção para §===§ evitou um bug de produção.

**Cenário real — "passa na minha máquina, falha no CI":** versões diferentes do ESLint ou configuração fora do repositório. Fixe as versões em §devDependencies§ (e use §npm ci§ com o §package-lock.json§) para que local e CI usem as mesmas.`,
  code: [
    { title: 'ESLint e Prettier em ação (executado com ESLint 10.15 e Prettier 3.10 no Node.js 26)', lang: 'bash', code: R`npx eslint src/app.js
#  1:1   error    Unexpected var, use let or const instead             no-var
#  2:29  error    Expected '===' and instead saw '=='                  eqeqeq
#  2:56  error    'naoUsada' is assigned a value but never used        no-unused-vars
#  2:56  warning  'naoUsada' is never reassigned. Use 'const' instead  prefer-const
echo "exit=$?"                      # 1 (há erros)

npx prettier --check src/app.js    # [warn] src/app.js ... código fora do padrão (exit 1)
npx prettier --write src/app.js    # adiciona ';' e quebra linhas
npx eslint --fix src/app.js        # troca var por const; sobram eqeqeq e no-unused-vars`, notes: [{ l: '1-5', t: 'Cada linha mostra posição (linha:coluna), severidade, mensagem e a regra, que pode ser pesquisada na documentação.' }, { l: '6', t: 'Com erros, o ESLint sai com 1 (avisos sozinhos não falham, a menos que se use --max-warnings 0).' }, { l: '8', t: '--check não altera nada; o código de saída é a base do CI.' }, { l: '9', t: '--write reescreve o arquivo no estilo configurado.' }, { l: '10', t: '--fix corrige só o que é seguro: == e a variável não usada exigem decisão humana.' }] },
    { title: 'Configuração mínima dos dois (arquivos)', lang: 'javascript', code: R`// eslint.config.js  (ESM: "type": "module" no package.json)
import js from "@eslint/js";

export default [
  { ignores: ["dist/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: { globals: { console: "readonly", process: "readonly" } },
    rules: { eqeqeq: "error", "no-var": "error", "prefer-const": "warn" },
  },
];
// .prettierrc.json  ->  { "singleQuote": true, "semi": true, "printWidth": 80 }`, notes: [{ l: '5', t: 'Um objeto só com ignores vale como lista global de arquivos ignorados.' }, { l: '6', t: 'A configuração recomendada vem do pacote @eslint/js.' }, { l: '8-9', t: 'Declare os globais do ambiente (aqui, Node.js) para não receber falsos no-undef.' }, { l: '12', t: 'O Prettier tem arquivo próprio; mantenha poucas opções.' }] }
  ],
  bestPractices: ['Fixe as versões de §eslint§ e §prettier§ em §devDependencies§ e use §npm ci§ no CI.', 'Deixe o Prettier cuidar do estilo e o ESLint cuidar de bugs; não duplique responsabilidades.', 'Rode §eslint --max-warnings 0§ e §prettier --check§ no CI.', 'Formate o projeto existente em um commit separado e registre-o em §.git-blame-ignore-revs§.', 'Use exceções (§eslint-disable-next-line§) raramente, com justificativa e escopo mínimo.', 'Ative regras que previnem bugs reais e revise as que geram ruído, em vez de ignorar os avisos.'],
  mistakes: ['Misturar regras de estilo do ESLint com o Prettier e criar conflitos.', 'Desligar o linter inteiro para "passar" o CI.', 'Acumular centenas de avisos que ninguém lê.', 'Formatar o projeto junto com mudanças de lógica em um mesmo commit.', 'Versões diferentes das ferramentas entre máquinas e CI.', 'Esquecer de declarar os globais do ambiente e receber §no-undef§ por todo lado.'],
  market: `Praticamente toda equipe profissional de JavaScript e TypeScript usa ESLint e Prettier (ou equivalentes em outras linguagens: Ruff, gofmt, Checkstyle). Configurá-los, entender as mensagens e integrá-los ao CI são tarefas rotineiras de quem entra em um projeto, e a padronização reduz drasticamente o tempo de revisão.`,
  summary: `Formatador (Prettier) padroniza o estilo; linter (ESLint) encontra padrões perigosos; o verificador de tipos cuida da coerência de tipos. No ESLint, a configuração plana (§eslint.config.js§) é um array de blocos com §rules§ (§off§/§warn§/§error§), §languageOptions§, §files§ e §ignores§. §--fix§ corrige o seguro; §--max-warnings 0§ vale para CI. O Prettier é opinativo: §--check§ verifica e §--write§ reescreve. Separe as responsabilidades, fixe versões e introduza em projetos existentes com um commit de formatação isolado.`,
  refs: [REF2.eslintDocs, REF2.eslintConfig, REF2.eslintRules, REF2.prettierDocs, REF2.prettierRationale, REF2.prettierEslint],
  cards: [
    { q: 'Qual a diferença entre linter e formatador?', a: 'O formatador padroniza a aparência do código; o linter encontra padrões suspeitos ou perigosos (variável não usada, == etc.).' },
    { q: 'O que significa a severidade "warn" no ESLint?', a: 'A regra avisa, mas não faz o comando falhar (a menos que se use --max-warnings 0).' },
    { q: 'Como evitar que a formatação em massa polua o git blame?', a: 'Fazer a formatação em um commit isolado e registrar seu hash em .git-blame-ignore-revs.' },
    { q: 'Para que serve prettier --check no CI?', a: 'Falhar o pipeline (código 1) se algum arquivo estiver fora do padrão, sem alterá-lo.' }
  ]
},
{
  id: 'fer-05', moduleId: 'm2', order: 5, minutes: 70, tags: ['npm', 'scripts', 'git-hooks', 'automacao'],
  title: 'Automação com scripts npm e hooks de Git',
  objectives: ['Definir e executar scripts no package.json (npm run, argumentos com --, npx) e entender como o PATH e os códigos de saída funcionam', 'Compor scripts de qualidade (lint, formatação, testes) em um comando único reproduzível', 'Explicar o que são hooks de Git, onde ficam e como versioná-los com core.hooksPath', 'Criar um hook pre-commit que bloqueia commits com problemas e executar a verificação só nos arquivos modificados', 'Reconhecer limites dos hooks (podem ser pulados) e por que o CI precisa repetir as verificações'],
  intro: `A melhor verificação é a que **roda sozinha**, na hora certa e do mesmo jeito para todo o time. Os **scripts do package.json** dão um vocabulário comum de comandos (§npm test§, §npm run lint§), e os **hooks de Git** executam essas verificações automaticamente antes de um commit ou push, interrompendo erros evitáveis. Aqui você junta as ferramentas da aula anterior em um fluxo que protege o projeto sem depender da memória de ninguém.`,
  theory: `### Scripts no package.json
O campo §scripts§ associa **nomes** a **comandos de shell**:
§§§json
{
  "scripts": {
    "lint": "eslint src",
    "format": "prettier --write .",
    "check": "npm run lint && prettier --check .",
    "test": "node --test"
  }
}
§§§
- §npm run lint§ executa o script; §npm test§, §npm start§ e poucos outros dispensam o §run§.
- O npm adiciona §node_modules/.bin§ ao **PATH** durante o script; por isso o script chama §eslint§ sem caminho, e a versão usada é a instalada no projeto (não a global).
- **Argumentos extras** vão depois de §--§: §npm run lint -- --fix§ repassa §--fix§ ao §eslint§.
- §&&§ encadeia (para no primeiro erro); §||§ executa o seguinte em caso de falha; ambos usam o **código de saída** (aula de Linux). O código de saída do script é o do último comando: **se for diferente de zero, o npm falha**, e o CI também.
- **Ganchos §pre§ e §post§:** um script chamado §prelint§ executa antes de §lint§, e §postlint§ depois (comportamento legado, mas ainda ativo). Hoje se prefere ser explícito com §&&§.
- §npx comando§ executa um binário do projeto ou o baixa temporariamente (como fizemos com o ESLint no laboratório). Em scripts de projeto, prefira **dependências fixas** a downloads implícitos.
- **Portabilidade:** scripts rodam no shell do sistema. §rm -rf§, §cp§ e variáveis (§FOO=1 comando§) não funcionam do mesmo jeito no Windows; para scripts multiplataforma, prefira Node.js (§node scripts/limpar.mjs§) ou pacotes como §cross-env§.
- Mantenha scripts **curtos**; lógica complexa vai para arquivos em §scripts/§ (shell ou Node.js).

### Um comando único de verificação
Defina o que "o projeto está saudável" significa e dê um nome: §npm run check§ (lint + formatação + testes). Esse mesmo comando roda **na máquina**, **no hook** e **no CI**. Evita a situação em que cada lugar verifica uma coisa diferente.

### Hooks de Git
Os **hooks** são scripts que o Git executa em momentos específicos (documentação em §githooks§). Os mais usados:
| Hook | Quando roda | Uso típico |
|---|---|---|
| §pre-commit§ | antes de criar o commit | lint e formatação dos arquivos em *staging*; impedir segredos |
| §commit-msg§ | depois de escrever a mensagem | validar o padrão de mensagem (Conventional Commits) |
| §pre-push§ | antes de enviar ao remoto | rodar testes mais lentos |
| §post-merge§ / §post-checkout§ | depois de atualizar o repositório | reinstalar dependências se o lockfile mudou |

Um hook é um **arquivo executável** (qualquer linguagem, geralmente shell). Se sair com **código ≠ 0**, o Git **aborta** a operação (nos hooks que permitem isso, como o §pre-commit§).

### Onde ficam e como versioná-los
Por padrão os hooks ficam em §.git/hooks§, que **não é versionado**: cada pessoa teria de instalar manualmente. A solução nativa é guardar os hooks em uma pasta do repositório e apontar o Git para ela:
§§§bash
mkdir .githooks
printf '#!/usr/bin/env bash\\nset -e\\nnpx eslint src\\n' > .githooks/pre-commit
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
§§§
(§core.hooksPath§ é configuração **local** de cada clone; por isso o projeto costuma automatizar a instalação: um script §prepare§ no §package.json§ roda após §npm install§.) Em nosso laboratório, esse hook **impediu o commit**: o ESLint reportou 4 problemas, o hook saiu com código 1 e nenhum commit foi criado. Ferramentas como o **Husky** automatizam a instalação dos hooks, e o **lint-staged** executa comandos **apenas nos arquivos em *staging*** (rápido, mesmo em projetos grandes).

### Só os arquivos modificados
Um hook que roda o projeto inteiro em cada commit fica lento e as pessoas passam a evitá-lo. Para pegar apenas o que será commitado:
§§§bash
git diff --cached --name-only --diff-filter=ACM
§§§
Lista os arquivos em *staging* adicionados (A), copiados (C) ou modificados (M). O lint-staged agrupa por padrão de nome (§*.js§, §*.md§) e roda o comando certo em cada grupo (§eslint --fix§, §prettier --write§), e **adiciona de volta** ao staging o que foi corrigido.

### Limites e armadilhas
- **Hooks podem ser pulados:** §git commit --no-verify§ ignora o §pre-commit§. Portanto o hook é **conveniência**, e o **CI é a garantia**: repita lá as mesmas verificações e proteja a branch principal.
- **Rapidez:** mantenha o §pre-commit§ em poucos segundos (lint e formatação dos arquivos alterados); deixe testes demorados para o §pre-push§ ou o CI.
- **Segurança:** hooks são código executado na sua máquina. Em repositórios de terceiros, **leia o que o §core.hooksPath§ e os scripts §prepare§ farão** antes de instalar dependências. Dependências podem ter *scripts de instalação*; use §npm ci --ignore-scripts§ em ambientes sensíveis quando possível.
- **Ambiente:** hooks rodam com o PATH do momento do commit; se dependem de §node§ (por exemplo, via gerenciador de versões), podem falhar em interfaces gráficas do Git.
- **Não resolva tudo no hook:** evite alterações automáticas surpreendentes; se o hook reescrever arquivos, mostre o que fez.

### Fluxo recomendado
1. **Editor:** formata ao salvar e mostra erros do linter.
2. **§pre-commit§:** verifica os arquivos em staging.
3. **§pre-push§ (opcional):** testes rápidos.
4. **CI:** §npm ci§, depois §npm run check§ e testes completos; é a barreira obrigatória.`,
  concepts: [
    { term: 'Script npm', def: 'Comando nomeado no package.json executado com npm run; usa o PATH com node_modules/.bin.' },
    { term: 'npx', def: 'Executa um binário de pacote npm (local ou baixado temporariamente).' },
    { term: 'Hook de Git', def: 'Script executado pelo Git em eventos como pre-commit e pre-push; código ≠ 0 pode abortar a operação.' },
    { term: 'core.hooksPath', def: 'Configuração que aponta o Git para uma pasta de hooks versionada no repositório.' },
    { term: 'Staging (índice)', def: 'Área onde ficam as mudanças preparadas para o próximo commit.' },
    { term: 'lint-staged', def: 'Ferramenta que executa comandos apenas nos arquivos em staging, agrupados por padrão.' },
    { term: 'Husky', def: 'Ferramenta que instala e gerencia hooks de Git a partir do package.json.' },
    { term: '--no-verify', def: 'Opção do git commit/push que pula os hooks; razão pela qual o CI precisa repetir as verificações.' },
    { term: 'Script prepare', def: 'Script do npm executado após npm install; costuma instalar os hooks.' }
  ],
  examples: R`**Analogia:** os scripts npm são os **botões do painel de controle** da fábrica (cada um com um nome claro: "lint", "test", "check"). Os hooks do Git são **sensores na esteira**: antes de a peça sair (commit), um sensor confere o essencial e para a linha se algo estiver errado. O CI é a **inspeção final na expedição**: mesmo que alguém desligue o sensor, a peça defeituosa não passa.

**Cenário real — onboarding sem fricção:** a pessoa nova faz §git clone§ e §npm install§. O script §prepare§ configura o §core.hooksPath§, e o primeiro commit já passa pelo lint. Ninguém precisa lembrar de instalar nada.

**Cenário real — hook lento demais:** o §pre-commit§ roda os testes completos (90 s), e o time começa a usar §--no-verify§ "só dessa vez". A correção: no hook, só lint e formatação dos arquivos em staging (2 s); testes completos no CI.

**Cenário real — falha de verificação no CI, mas não local:** a pessoa usou §--no-verify§. Sem problema: o CI repetiu §npm run check§, falhou, e a branch protegida impediu o merge.`,
  code: [
    { title: 'Scripts e código de saída (executado com npm)', lang: 'bash', code: R`npm pkg set scripts.lint="eslint src" scripts.format="prettier --write ." scripts.check="npm run lint && prettier --check ."
npm run -s lint ; echo "lint exit=$?"      # 1 se houver erros de lint
npm run lint -- --max-warnings 0           # argumentos extras vão depois de --
node -e "console.log(Object.keys(require('./package.json').scripts))"`, notes: [{ l: '1', t: 'npm pkg set altera o package.json sem abrir o arquivo.' }, { l: '2', t: '-s silencia o ruído do npm; o código de saída é o do eslint (1 = falha).' }, { l: '3', t: 'O -- separa as opções do npm das opções que serão repassadas ao eslint.' }, { l: '4', t: 'Lista os scripts definidos; no laboratório apareceram test, lint, format e check.' }] },
    { title: 'Hook pre-commit versionado (executado em um repositório de teste)', lang: 'bash', code: R`mkdir .githooks
printf '#!/usr/bin/env bash\nset -e\nnpx eslint src\n' > .githooks/pre-commit
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
git add -A
git commit -m "teste"                     # o ESLint reporta problemas
echo "exit=$?"                            # != 0: commit abortado
git log --oneline                         # fatal: ainda não há commits`, notes: [{ l: '2', t: 'set -e faz o script abortar se o eslint falhar; o código de saída do hook decide o destino do commit.' }, { l: '4', t: 'Aponta o Git para a pasta versionada; precisa ser feito em cada clone (por isso o script prepare).' }, { l: '6', t: 'Com 4 problemas de lint, o hook saiu com 1 e o Git cancelou o commit (a mensagem de erro do ESLint aparece no terminal).' }, { l: '8', t: 'Prova de que nenhum commit foi criado: o repositório de teste continuou sem histórico.' }] },
    { title: 'Arquivos em staging (somente leitura)', lang: 'bash', code: R`git diff --cached --name-only --diff-filter=ACM
# src/app.js
# src/b.js`, notes: [{ l: '1', t: 'Lista os arquivos adicionados, copiados ou modificados no staging; é a entrada de ferramentas como o lint-staged.' }] }
  ],
  bestPractices: ['Padronize um comando único (§npm run check§) usado no editor, no hook e no CI.', 'Mantenha o §pre-commit§ rápido: só arquivos em staging.', 'Versione os hooks (§core.hooksPath§ ou Husky) e automatize a instalação com §prepare§.', 'Repita as verificações no CI e proteja a branch principal: o hook não é uma garantia.', 'Escreva scripts portáveis ou delegue a Node.js quando precisar rodar em Windows e Linux.', 'Revise scripts de instalação e hooks antes de rodar dependências de origem desconhecida.'],
  mistakes: ['Confiar apenas no hook local e não ter verificação no CI.', 'Hook lento que as pessoas passam a ignorar com §--no-verify§.', 'Esquecer que §.git/hooks§ não é versionado.', 'Scripts que dependem de pacotes instalados globalmente.', 'Scripts longos e ilegíveis dentro do package.json.', 'Hooks que alteram arquivos sem avisar e confundem o commit.'],
  market: `Pipelines de qualidade (lint, formatação, testes) acionados por scripts e hooks são o padrão de projetos profissionais. Saber montá-los reduz retrabalho em revisões, evita quebras na branch principal e é um tópico prático comum em entrevistas de times com maturidade de engenharia.`,
  summary: `Scripts npm dão nomes a comandos (§npm run lint§), usam §node_modules/.bin§ no PATH, repassam argumentos após §--§ e falham quando o código de saída é diferente de zero. Reúna as verificações em um comando (§npm run check§). Hooks de Git (§pre-commit§, §commit-msg§, §pre-push§) rodam scripts e podem abortar a operação; versione-os com §core.hooksPath§ ou Husky e rode só nos arquivos em staging (lint-staged). Hooks podem ser pulados: o CI repete tudo e é a garantia.`,
  refs: [REF2.npmScripts, REF2.npmPkg, REF2.gitHooks, REF2.gitConfigHooks, REF2.husky, REF2.lintStaged],
  cards: [
    { q: 'Como passar uma opção extra para o comando de um script npm?', a: 'Depois de --: npm run lint -- --fix.' },
    { q: 'Por que os hooks em .git/hooks não são compartilhados?', a: 'O diretório .git não é versionado; use core.hooksPath apontando para uma pasta do repositório (ou Husky).' },
    { q: 'O que acontece quando o pre-commit sai com código diferente de zero?', a: 'O Git aborta o commit.' },
    { q: 'Por que o CI precisa repetir as verificações do hook?', a: 'Porque o hook pode ser pulado com --no-verify ou não estar instalado; o CI é a barreira obrigatória.' }
  ]
}
];
