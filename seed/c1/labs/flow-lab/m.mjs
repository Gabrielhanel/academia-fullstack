// Conventional Commits
const re = /^(?<tipo>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\((?<escopo>[\w./-]+)\))?(?<quebra>!)?: (?<descricao>.+)$/;
const exemplos = ['feat(api): adiciona filtro por data', 'fix!: remove campo obsoleto', 'docs: atualiza README', 'ajuste de coisas', 'feat: ', 'perf(ui): reduz re-renderizações'];
for (const e of exemplos) { const m = re.exec(e.split('\n')[0]); console.log(JSON.stringify(e), '->', m ? JSON.stringify({ ...m.groups, quebra: !!m.groups.quebra }) : 'inválido'); }
// SemVer a partir dos commits
const bump = (cs) => cs.some((c) => /^\w+(\(.+\))?!:/.test(c) || /BREAKING CHANGE/.test(c)) ? 'major' : cs.some((c) => c.startsWith('feat')) ? 'minor' : cs.some((c) => c.startsWith('fix')) ? 'patch' : 'nenhum';
console.log(bump(['fix: a', 'docs: b']), bump(['feat: a', 'fix: b']), bump(['fix!: a']), bump(['docs: a']));
