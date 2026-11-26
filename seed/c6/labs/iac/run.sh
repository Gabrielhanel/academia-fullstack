#!/usr/bin/env bash
# Laboratório C6.5: Terraform local (provedores local e random), sem nuvem. Rode a partir desta pasta.
cd "$(dirname "$0")"
tf() { docker run --rm -v "$PWD":/work -w /work --user "$(id -u):$(id -g)" -e HOME=/tmp -e TF_IN_AUTOMATION=1 -e TF_CLI_ARGS="-no-color" hashicorp/terraform:latest "$@"; }
limpar() { rm -rf .terraform terraform.tfstate terraform.tfstate.backup plano saida feio.tf invalido.tf; }
limpar
sec() { echo; echo "=== $* ==="; }

sec "1. versão"; tf version
sec "2. fmt -check -diff em um arquivo mal formatado"
printf 'variable "x" {\ntype=string\n   default   =  "a"\n}\n' > feio.tf
tf fmt -check -diff; echo "exit=$?"; rm -f feio.tf
sec "3. init"; tf init 2>&1 | grep -E "Installing|Installed|installed|lock file|successfully"
sec "4. validate (válido)"; tf validate
sec "5. validate (referência a variável inexistente)"
printf 'output "x" { value = var.nao_existe }\n' > invalido.tf
tf validate; echo "exit=$?"; rm -f invalido.tf
sec "6. plan -out e resumo do plano em JSON"
tf plan -out=plano | grep -E "^Plan:|will be created|Changes to Outputs"
tf show -json plano > plano.json 2>/dev/null
node -e "const p=JSON.parse(require('fs').readFileSync('plano.json'));const c={};for(const r of p.resource_changes){const a=r.change.actions.join('+');c[a]=(c[a]||0)+1}console.log('recursos no plano:',p.resource_changes.length,JSON.stringify(c));console.log('endereços:',p.resource_changes.map(r=>r.address).join(', '))"; rm -f plano.json
sec "7. apply do plano salvo"; tf apply plano | grep -E "Apply complete|Outputs"
echo "-- arquivos gerados:"; ls saida; echo "-- conteúdo de api-dev.json:"; cat saida/api-dev.json; echo
echo "-- state list:"; tf state list
sec "8. plan novamente (idempotência) e código de saída com -detailed-exitcode"; tf plan | grep -E "No changes|Plan:"
tf plan -detailed-exitcode >/dev/null; echo "plan -detailed-exitcode sem mudanças: exit=$?"
sec "8b. segredo no state e na saída"
tf output | grep -E "senha_db"
echo "tf output -raw senha_db tem $(tf output -raw senha_db | wc -c) caracteres (valor não exibido aqui)"
node -e "const s=JSON.parse(require('fs').readFileSync('terraform.tfstate'));const r=s.resources.find(x=>x.type==='random_password');const v=r.instances[0].attributes.result;console.log('state em texto claro: random_password.db.result tem',v.length,'caracteres (primeiro e último ocultos:',v[0]+'…'+v.slice(-1)+')')"
sec "9. mudança de réplicas da api (2 -> 5)"
tf plan -var 'servicos={api={porta=3000,replicas=5},web={porta=8080,replicas=3}}' | grep -E "^Plan:|must be replaced|replicas|# module"
sec "10. validação de variável: ambiente inválido"; tf plan -var ambiente=teste 2>&1 | grep -E "Error|ambiente deve|Invalid"
sec "11. validação de variável: réplicas zero"; tf plan -var 'servicos={api={porta=3000,replicas=0}}' 2>&1 | grep -E "Error|cada serviço|Invalid"
sec "12. drift: arquivo alterado manualmente"
echo '{"adulterado":true}' > saida/api-dev.json
tf plan | grep -E "No changes|^Plan:|will be|must be replaced|drift|changed outside" | head -n 10
tf plan -detailed-exitcode >/dev/null; echo "plan -detailed-exitcode com drift: exit=$?"
sec "13. drift: arquivo apagado manualmente"
rm -f saida/web-dev.json
tf plan | grep -E "No changes|^Plan:|will be|must be replaced|changed outside|deleted" | head -n 10
sec "14. apply corrige o drift e o plan fica limpo"
tf apply -auto-approve | grep -E "Apply complete"; tf plan | grep -E "No changes|^Plan:"; cat saida/api-dev.json; echo
sec "15. trocar de ambiente (producao): efeito dos keepers"
tf plan -var ambiente=producao | grep -E "^Plan:|must be replaced|will be created|will be destroyed"
sec "16. destroy"; tf destroy -auto-approve | grep -E "Destroy complete"; ls saida 2>/dev/null | wc -l | sed 's/^/arquivos restantes em saida: /'
echo; echo "== lock file (versões dos provedores) =="; cat .terraform.lock.hcl | grep -E "provider|version"
rm -rf .terraform terraform.tfstate terraform.tfstate.backup plano saida
