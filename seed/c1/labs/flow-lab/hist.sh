set -e
base() { git init -q -b main "$1"; cd "$1"; echo 1 > a.txt; git add .; git commit -qm "c0: inicio"; echo 2 >> a.txt; git commit -qam "c1: main avanca"; git switch -q -c feat/x; echo x1 > x.txt; git add .; git commit -qm "x1: feature parte 1"; echo x2 >> x.txt; git commit -qam "x2: feature parte 2"; git switch -q main; echo 3 >> a.txt; git commit -qam "c2: main avanca de novo"; }
echo "=== merge commit"; (base m; git merge -q --no-ff feat/x -m "Merge feat/x"; git log --oneline --graph --all)
echo "=== squash"; (base s; git merge -q --squash feat/x; git commit -qm "feat: x (squash)"; git log --oneline --graph --all)
echo "=== rebase + fast-forward"; (base r; git switch -q feat/x; git rebase -q main; git switch -q main; git merge -q --ff-only feat/x; git log --oneline --graph --all)
