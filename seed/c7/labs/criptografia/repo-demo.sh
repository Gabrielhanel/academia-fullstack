#!/usr/bin/env bash
# Segredo removido do código continua no histórico do git. Repositório 100% sintético; tokens gerados aleatoriamente (não são reais).
cd "$(dirname "$0")"; rm -rf demo-repo; mkdir demo-repo; cd demo-repo
git init -q; git config user.email lab@exemplo.test; git config user.name "Laboratório"
TOKEN="ghp_$(node -e "const c=require('node:crypto');let s='';while(s.length<36)s+=c.randomBytes(48).toString('base64').replace(/[^A-Za-z0-9]/g,'');console.log(s.slice(0,36))")"
SENHA="$(node -e "console.log(require('node:crypto').randomBytes(18).toString('base64url'))")"
printf 'const GITHUB_TOKEN = "%s";\nmodule.exports = { GITHUB_TOKEN };\n' "$TOKEN" > app.js
printf 'DB_PASSWORD=%s\n' "$SENHA" > .env
git add -A; git commit -qm "primeira versão (com segredos por engano)"
printf 'const GITHUB_TOKEN = process.env.GITHUB_TOKEN;\nmodule.exports = { GITHUB_TOKEN };\n' > app.js
git rm -q --cached .env; rm .env; printf '.env\n' > .gitignore; git add -A; git commit -qm "remove os segredos do código"
echo "commits: $(git rev-list --count HEAD)"
echo "== scanner próprio na árvore de trabalho atual (após a correção)"; cat app.js .gitignore | node ../scanner.mjs
echo "== scanner próprio no histórico (git log -p --all)"; git log -p --all | node ../scanner.mjs
echo "== o segredo ainda é recuperável do primeiro commit? $(git show HEAD~1:app.js | grep -c 'ghp_') linha(s) com o token"
cd ..
gl() { docker run --rm -v "$PWD/demo-repo":/repo zricethezav/gitleaks:latest detect --source /repo --no-banner --no-color --redact -v "$@" 2>&1; }
echo "== gitleaks (imagem zricethezav/gitleaks, v8.30.1) no histórico"; SAIDA=$(gl); echo "$SAIDA" | grep -E "^(RuleID|File|Line|Commit):" | paste - - - - | sed 's/\t/ | /g;s/^/  /' ; echo "$SAIDA" | grep -E "leaks found|no leaks"
echo "== gitleaks apenas na árvore de trabalho atual (--no-git)"; gl --no-git | grep -E "leaks found|no leaks"
rm -rf demo-repo
