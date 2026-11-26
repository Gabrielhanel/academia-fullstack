# Laboratório C6.5 — Infraestrutura como código com Terraform (local)

Executado em 2026-11-25: Docker 29.9.3, **Terraform v1.17.2** (`hashicorp/terraform:latest`), provedores **hashicorp/local 2.9.1** e **hashicorp/random 3.9.1** (fixados em `.terraform.lock.hcl`). **Nenhuma nuvem foi usada**: os "recursos" são arquivos JSON locais e valores aleatórios, o que basta para exercitar o ciclo, o estado, o drift e os módulos.

## Arquivos
`main.tf` (variáveis com validação, `random_pet`, `random_password`, módulo com `for_each`, saídas, uma saída sensível), `modules/servico/main.tf` (um `local_file` por serviço), `run.sh` (executa tudo e limpa), `saida-terraform.txt` (saída), `.terraform.lock.hcl` (versões dos provedores).

## Resultados medidos (`saida-terraform.txt`)
- `fmt -check -diff` em arquivo mal formatado: mostra o diff e sai com **3**; `validate` aceita a configuração e recusa a referência a variável inexistente (exit 1).
- `init` instalou local 2.9.1 e random 3.9.1 e criou o lock file.
- `plan -out`: **4 to add** (random_password, random_pet e 2 arquivos, via `for_each` no módulo); JSON do plano: 4 `create`. `apply` do plano salvo: 4 adicionados; arquivos `api-dev.json` e `web-dev.json`.
- Segunda `plan`: **No changes** e `-detailed-exitcode` → **exit 0**.
- Segredo: a saída `senha_db` aparece como `<sensitive>`, mas o **state guarda a senha de 16 caracteres em texto claro**.
- Alterar réplicas da api de 2 para 5: `local_file` **must be replaced** (1 to add, 1 to destroy); `total_replicas` 5 → 8.
- Validação de variável: `ambiente=teste` e `replicas=0` recusados com as mensagens definidas.
- Drift: arquivo alterado à mão → "Objects have changed outside of Terraform" e plano para **recriar** o recurso (1 to add), `-detailed-exitcode` → **exit 2**; arquivo apagado → "has been deleted" e 2 to add; `apply` corrige e o plano volta a **No changes**.
- Trocar `ambiente` para `producao`: **3 to add, 3 to destroy** (keepers do `random_pet` e nomes de arquivo mudam); a senha não é afetada.
- `destroy` removeu tudo; limpeza final de `.terraform`, state e saída.

## Não executado
Provedores de nuvem (aws, azurerm, google), backends remotos (S3, GCS, Azure, HCP Terraform), bloqueio de state, workspaces, `import`/`moved`, `terraform test`, OpenTofu, tflint/checkov, OPA/Sentinel, CI real, módulos do registry.

## Limitações
Os provedores `local` e `random` não têm APIs remotas, latência, permissões ou custos; o comportamento de drift de `local_file` (tratar alteração de conteúdo como recurso a recriar) é específico desse provedor. Uma execução em uma máquina.

## Reprodução
```bash
bash run.sh
```
