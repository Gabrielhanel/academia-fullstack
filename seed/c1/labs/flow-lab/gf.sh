set -e
git init -q -b main gf2; cd gf2
n=0; c() { n=$((n+1)); echo "$1" > "f$n.txt"; git add .; git commit -qm "$1"; }
c "v1.0.0 em producao"; git tag v1.0.0
git switch -q -c develop; c "dev: feature A"; git switch -q -c feature/b; c "feature B"; git switch -q develop; git merge -q --no-ff feature/b -m "merge feature/b"
git switch -q -c release/1.1; c "release: ajustes finais 1.1"
git switch -q main; git switch -q -c hotfix/1.0.1; c "hotfix: corrige falha critica"; git switch -q main; git merge -q --no-ff hotfix/1.0.1 -m "merge hotfix/1.0.1"; git tag v1.0.1
git switch -q develop; git merge -q --no-ff hotfix/1.0.1 -m "hotfix de volta em develop"
git switch -q main; git merge -q --no-ff release/1.1 -m "merge release/1.1"; git tag v1.1.0
git log --oneline --graph --all --decorate
