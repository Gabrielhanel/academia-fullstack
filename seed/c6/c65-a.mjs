// C6.5 — Infraestrutura como código. Aulas 1 e 2 (Terraform; módulos, state e boas práticas).
const R = String.raw;

export const REF = {
  tfDocs: { title: 'Terraform — Documentation', url: 'https://developer.hashicorp.com/terraform/docs', kind: 'doc' },
  tfWorkflow: { title: 'Terraform — The core Terraform workflow', url: 'https://developer.hashicorp.com/terraform/intro/core-workflow', kind: 'doc' },
  tfLang: { title: 'Terraform — Configuration language', url: 'https://developer.hashicorp.com/terraform/language', kind: 'doc' },
  tfVariables: { title: 'Terraform — Input variables (validation)', url: 'https://developer.hashicorp.com/terraform/language/values/variables', kind: 'doc' },
  tfState: { title: 'Terraform — State', url: 'https://developer.hashicorp.com/terraform/language/state', kind: 'doc' },
  tfSensitive: { title: 'Terraform — Sensitive data in state', url: 'https://developer.hashicorp.com/terraform/language/state/sensitive-data', kind: 'doc' },
  tfModules: { title: 'Terraform — Modules', url: 'https://developer.hashicorp.com/terraform/language/modules', kind: 'doc' },
  tfForEach: { title: 'Terraform — The for_each meta-argument', url: 'https://developer.hashicorp.com/terraform/language/meta-arguments/for_each', kind: 'doc' },
  tfBackend: { title: 'Terraform — Backends', url: 'https://developer.hashicorp.com/terraform/language/backend', kind: 'doc' },
  tfLock: { title: 'Terraform — Dependency lock file', url: 'https://developer.hashicorp.com/terraform/language/files/dependency-lock', kind: 'doc' },
  tfPlanCmd: { title: 'Terraform — terraform plan (-detailed-exitcode)', url: 'https://developer.hashicorp.com/terraform/cli/commands/plan', kind: 'doc' },
  tfProviderLocal: { title: 'Terraform Registry — hashicorp/local provider', url: 'https://registry.terraform.io/providers/hashicorp/local/latest/docs', kind: 'doc' },
  tfProviderRandom: { title: 'Terraform Registry — hashicorp/random provider', url: 'https://registry.terraform.io/providers/hashicorp/random/latest/docs', kind: 'doc' },
  opentofu: { title: 'OpenTofu — Documentation', url: 'https://opentofu.org/docs/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'iac-01', moduleId: 'm1', order: 1, minutes: 90, tags: ['Terraform', 'IaC', 'HCL', 'plan', 'apply', 'idempotência', 'drift', 'variáveis', 'validação', 'lock file'],
  title: 'Terraform: configuração declarativa, ciclo plan/apply, idempotência e drift, executados localmente',
  objectives: ['Explicar infraestrutura como código e o modelo declarativo do Terraform', 'Executar o ciclo init, fmt, validate, plan, apply e destroy e interpretar o plano', 'Escrever variáveis tipadas com validação e saídas', 'Demonstrar idempotência e detectar drift, entendendo o que o plano mostra'],
  intro: R`**Clicar em consoles** cria **infraestrutura que ninguém consegue reproduzir, revisar ou auditar**. **Infraestrutura como código (IaC)** descreve **o estado desejado em arquivos versionados**, e **uma ferramenta** **calcula e aplica a diferença**. **Terraform** é **a ferramenta mais difundida**. **Aqui você executa o ciclo completo de verdade** (**Terraform v1.17.2**), mas **sem nuvem**: **os provedores §local§ e §random§** **criam arquivos e valores**, o que **basta para aprender o ciclo, o estado e o drift**. **Aviso:** **nenhum recurso de nuvem foi criado**; **os provedores de nuvem são análise**.`,
  theory: R`### Por que IaC
**Reprodutibilidade** (**o mesmo código gera o mesmo ambiente**), **revisão** (**pull request em vez de "quem mexeu?"**), **auditoria** (**histórico no Git**), **automação** (**pipelines**), **recuperação** (**recriar após desastre**) e **detecção de drift** (**o real divergiu do desejado**). **Declarativo x imperativo:** **no estilo declarativo você descreve o resultado** (**"existem 3 servidores"**) **e a ferramenta descobre os passos**; **no imperativo você escreve os passos** (**"crie um servidor" × 3**), **que não são idempotentes por natureza**.

### Os blocos da linguagem (HCL)
- §terraform { required_version, required_providers }§: **versão da ferramenta e dos provedores**;
- §provider§: **configura o acesso** (**região, credenciais; nunca no código**);
- §resource "tipo" "nome" { ... }§: **um objeto gerenciado**; §data§: **leitura de algo existente**;
- §variable§ (**entrada**, com §type§, §default§, §validation§, §sensitive§), §output§ (**saída**), §locals§ (**valores calculados**);
- §module§: **reuso** (aula 2);
- **meta-argumentos:** §count§, §for_each§, §depends_on§, §lifecycle§ (§prevent_destroy§, §create_before_destroy§, §ignore_changes§).
**Referências criam dependências:** §local_file.config.filename§ **faz o Terraform criar o arquivo antes** de quem o usa; **o grafo de dependências** **define a ordem e o paralelismo**.

### O ciclo (medido, Terraform v1.17.2)
| Passo | Comando | O que mostra |
|---|---|---|
| **1. Formatar** | §terraform fmt -check -diff§ | **diff** do que ficaria diferente; **exit 3** em arquivo mal formatado |
| **2. Inicializar** | §terraform init§ | **instalou §hashicorp/local v2.9.1§ e §hashicorp/random v3.9.1§** e **criou o §.terraform.lock.hcl§** |
| **3. Validar** | §terraform validate§ | **"configuration is valid"**; **com referência a variável inexistente: erro e exit 1** |
| **4. Planejar** | §terraform plan -out=plano§ | **"Plan: 4 to add, 0 to change, 0 to destroy"** |
| **5. Aplicar** | §terraform apply plano§ | **"Apply complete! Resources: 4 added"** |
| **6. Repetir** | §terraform plan§ | **"No changes. Your infrastructure matches the configuration."** |
| **7. Destruir** | §terraform destroy§ | **"Destroy complete! Resources: 4 destroyed"** |
**O arquivo de lock** (**§.terraform.lock.hcl§**) **fixa as versões e os *hashes* dos provedores**: **versione-o** para **builds reproduzíveis**. **Planos salvos** (**§-out§**) **garantem que o apply execute exatamente o que foi revisado**.

### Lendo um plano
Cada recurso aparece com **um símbolo**: **§+§ create**, **§~§ update in-place**, **§-§ destroy** e **§-/+§ replace** (**"must be replaced"**: **destruir e criar**). **Medido:**
- **criação:** 4 recursos (**§random_password.db§**, **§random_pet.sufixo§** **e 2 §local_file§ do módulo com §for_each§**);
- **alterar as réplicas da api de 2 para 5**: **§local_file.config must be replaced§ → "1 to add, 0 to change, 1 to destroy"** (**para esse tipo de recurso, mudar o conteúdo força a substituição**); **a saída §total_replicas§ muda de 5 para 8**;
- **trocar o ambiente para §producao§**: **"3 to add, 0 to change, 3 to destroy"** (**os §keepers§ do §random_pet§ e os nomes dos arquivos mudam**; **a senha não é afetada**).
**Regra de ouro:** **leia o plano, principalmente os "destroy" e "replace"**: **em recursos reais, "replace" de um banco apaga dados**. **Use §lifecycle { prevent_destroy = true }§** **em recursos críticos**.

### Idempotência
**Aplicar de novo não muda nada**: **o segundo §plan§ mostrou "No changes" e o §-detailed-exitcode§ devolveu **0**. **Idempotência** **é o que permite rodar o pipeline várias vezes sem risco**.

### Drift
**Drift** é **a divergência entre o real e o declarado** (**alguém mexeu pelo console**). **O Terraform atualiza o estado ("refresh") ao planejar e mostra:** **"Objects have changed outside of Terraform"**. **Medido (dois casos):**
1. **arquivo alterado à mão** → **o provedor §local§ tratou o conteúdo diferente como drift** e **o plano propõe recriar o recurso ("1 to add")**; **§-detailed-exitcode§ → 2**;
2. **arquivo apagado à mão** → **"has been deleted"** e **"2 to add"** (**os dois arquivos que sumiram**); **o apply recriou e o plano voltou a "No changes"**.
**§plan -detailed-exitcode§** devolve **0 (sem mudanças), 1 (erro) ou 2 (há mudanças)**: **base de um *job* agendado de detecção de drift**. **Cuidado:** **o comportamento exato do drift depende do provedor**: **neste laboratório é do §local_file§**; **em nuvem**, **atributos computados e alterações de ordem geram "ruído"**, **tratado com §ignore_changes§ quando legítimo**.

### Variáveis e validação (medido)
**Variáveis tipadas** (**§map(object({ porta = number, replicas = number }))§**) **e blocos §validation§** **barram erros antes do plano**: **§ambiente=teste§ →** **"ambiente deve ser dev, homologacao ou producao."**; **§replicas=0§ →** **"cada serviço precisa de replicas >= 1 e porta > 1023."** **Boas práticas:** **tipos explícitos**, **validações com mensagens úteis**, **§sensitive = true§ para segredos (que só oculta a saída; aula 2)**, **valores por ambiente em arquivos §*.tfvars§**.

### Provedores e registros
**Provedores** (**plugins**) **falam com APIs** (**AWS, Azure, Google, Kubernetes, GitHub, Cloudflare...**) **e são baixados do registro**; **fixe versões** (**§~> 2.5§**) **e versione o lock file**. **Neste laboratório:** **§local§ e §random§** (**sem APIs, sem custo, sem riscos**). **Em nuvem real:** **credenciais por papéis/OIDC** (**curso C6.2**), **nunca chaves no código**.

### Terraform x OpenTofu x outras
**Terraform** passou, em 2023, de **licença de código aberto para a BSL** (***Business Source License***); **OpenTofu** é **um *fork* de código aberto mantido pela Linux Foundation**, **compatível na maior parte**. **Alternativas:** **Pulumi** (**linguagens gerais**), **CloudFormation/Bicep/ARM** (**específicos de provedor**), **Crossplane** (**no Kubernetes**), **Ansible** (**configuração e orquestração, mais imperativo**). **Esta aula usa o Terraform**; **OpenTofu não foi executado**.

### Executado e não executado
**Executado:** **o ciclo completo e o drift** com **§local§ e §random§**. **Não executado:** **qualquer provedor de nuvem**, **backends remotos**, **OpenTofu**, **CI**.`,
  concepts: [
    { term: 'Infraestrutura como código', def: 'Prática de definir e gerenciar infraestrutura por arquivos versionados e automatizáveis.' },
    { term: 'Declarativo', def: 'Estilo em que se descreve o estado desejado e a ferramenta calcula os passos para alcançá-lo.' },
    { term: 'Plan', def: 'Comparação entre a configuração, o state e o real que lista o que será criado, alterado, substituído ou destruído.' },
    { term: 'Idempotência', def: 'Propriedade de aplicar a mesma configuração várias vezes sem mudanças adicionais após a primeira.' },
    { term: 'Drift', def: 'Divergência entre a infraestrutura real e o estado ou a configuração declarada.' },
    { term: 'Provider', def: 'Plugin do Terraform que implementa os recursos de uma plataforma ou API.' },
    { term: 'Lock file', def: 'Arquivo .terraform.lock.hcl que fixa as versões e os hashes dos provedores usados.' },
    { term: 'Replace', def: 'Ação do plano que destrói e recria um recurso quando uma mudança não pode ser feita no lugar.' }
  ],
  examples: R`**Analogia:** **a configuração é a planta de uma casa**; **o state é o registro do que já foi construído**; **o plan é o orçamento da reforma** ("**derrubar esta parede e construir aquela**"), **que você aprova antes de o pedreiro começar**. **Drift é o morador que derrubou uma parede por conta própria**: **a planta e a casa deixaram de bater**, e **o inspetor (§plan§) percebe**.

**Exemplo concreto (medido):** **o primeiro §plan§ previu 4 recursos; o §apply§ criou os 4; o segundo §plan§ mostrou "No changes"**; **ao adulterar um arquivo, o plano avisou "Objects have changed outside of Terraform" e propôs recriá-lo**, **e o §-detailed-exitcode§ devolveu 2**.`,
  code: [
    { title: 'Variáveis com validação e saída (lab, Terraform v1.17.2)', lang: 'hcl', code: R`variable "ambiente" {
  type    = string
  default = "dev"
  validation {
    condition     = contains(["dev", "homologacao", "producao"], var.ambiente)
    error_message = "ambiente deve ser dev, homologacao ou producao."
  }
}

variable "servicos" {
  type = map(object({
    porta    = number
    replicas = number
  }))
  validation {
    condition     = alltrue([for k, s in var.servicos : s.replicas >= 1 && s.porta > 1023])
    error_message = "cada serviço precisa de replicas >= 1 e porta > 1023."
  }
}

output "total_replicas" {
  value = sum([for s in var.servicos : s.replicas])
}`, notes: [{ l: 4, t: 'A validação barra o valor antes do plano.' }, { l: 12, t: 'Tipo estruturado: erros de forma aparecem cedo.' }, { l: 22, t: 'Saída calculada a partir da entrada.' }] },
    { title: 'Ciclo completo e códigos de saída (executado)', lang: 'bash', code: R`terraform fmt -check -diff        # exit 3 se algo mudaria
terraform init                    # instala provedores e cria .terraform.lock.hcl
terraform validate                # sintaxe e referências
terraform plan -out=plano         # Plan: 4 to add, 0 to change, 0 to destroy
terraform apply plano             # aplica exatamente o plano revisado
terraform plan -detailed-exitcode # 0 sem mudanças, 2 com mudanças, 1 erro
terraform destroy                 # remove tudo o que o state gerencia`, notes: [{ l: 4, t: 'O plano salvo evita surpresas entre revisão e aplicação.' }, { l: 6, t: 'Base para o job agendado de drift.' }] }
  ],
  bestPractices: ['Versione a configuração e o lock file e fixe as versões de provedores.', 'Sempre revise o plano e dê atenção a destroy e replace; proteja recursos críticos com prevent_destroy.', 'Use planos salvos (-out) para aplicar exatamente o que foi revisado.', 'Tipifique variáveis e valide entradas com mensagens claras.', 'Use fmt e validate em todo commit e plan -detailed-exitcode para drift agendado.', 'Nunca coloque credenciais no código; use papéis e OIDC.', 'Mantenha a infraestrutura mudando apenas pelo código e trate alterações manuais como incidentes de drift.'],
  mistakes: ['Aplicar sem ler o plano e destruir recursos por replace.', 'Alterar recursos pelo console e deixar o código divergente.', 'Não versionar o lock file e obter versões diferentes de provedores.', 'Variáveis sem tipo e sem validação.', 'Segredos em defaults de variáveis ou em arquivos versionados.', 'Usar -auto-approve sem plano revisado em produção.'],
  market: R`**Terraform** **é uma das habilidades mais pedidas** em **DevOps, SRE e plataforma**; **explicar o ciclo, o state e o drift** **é pergunta básica** de entrevista.`,
  summary: R`IaC descreve a infraestrutura em arquivos declarativos versionados; o Terraform calcula a diferença entre a configuração, o state e o real. O ciclo init, fmt, validate, plan, apply e destroy foi executado (Terraform v1.17.2, provedores local 2.9.1 e random 3.9.1): o plano previu 4 recursos (incluindo 2 arquivos via for_each em um módulo), o segundo plan mostrou No changes (exit 0), mudar réplicas substituiu um arquivo (1 to add, 1 to destroy), validações de variável recusaram ambiente inválido e replicas zero, e o drift (arquivo alterado ou apagado) apareceu como Objects have changed outside of Terraform, com exit 2 no plan -detailed-exitcode. Nenhuma nuvem foi usada.`,
  refs: [REF.tfDocs, REF.tfWorkflow, REF.tfLang, REF.tfVariables, REF.tfLock, REF.tfPlanCmd, REF.tfProviderLocal, REF.tfProviderRandom],
  cards: [
    { q: 'O que significa idempotência no Terraform?', a: 'Aplicar de novo a mesma configuração não gera mudanças: o segundo plan mostra No changes (exit 0 em -detailed-exitcode).' },
    { q: 'O que é drift e como detectá-lo?', a: 'A divergência entre o real e o declarado; o plan atualiza o state e mostra Objects have changed outside of Terraform; plan -detailed-exitcode devolve 2 quando há mudanças.' },
    { q: 'O que significa must be replaced no plano?', a: 'O recurso será destruído e recriado porque a mudança não pode ser feita no lugar; em recursos reais pode apagar dados.' },
    { q: 'Por que versionar o .terraform.lock.hcl?', a: 'Fixa as versões e os hashes dos provedores, tornando as execuções reproduzíveis.' }
  ]
},
{
  id: 'iac-02', moduleId: 'm2', order: 2, minutes: 90, tags: ['módulos', 'state', 'backend remoto', 'bloqueio', 'segredos', 'for_each', 'workspaces', 'CI', 'moved', 'import'],
  title: 'Módulos, state e boas práticas: reuso, segredos no state, ambientes e pipeline',
  objectives: ['Criar e consumir módulos com for_each e entender os endereços dos recursos', 'Explicar o que é o state, por que usar backend remoto com bloqueio e quais segredos ele expõe', 'Separar ambientes e componentes para limitar o raio de impacto', 'Desenhar um pipeline de IaC com fmt, validate, plan na revisão e apply controlado'],
  intro: R`**O código Terraform cresce**: **sem módulos**, **vira cópia e cola**; **sem cuidado com o state**, **o time se pisa** e **segredos vazam**. Esta aula **usa o módulo do laboratório** (**um serviço por §for_each§**), **mostra o que o state realmente contém** (**inclusive uma senha em texto claro, mesmo marcada como sensível**) e **desenha o pipeline de IaC**. **Aviso:** **backends remotos, workspaces, §import§ e CI não foram executados**: **são análise da documentação**.`,
  theory: R`### Módulos: reuso com interface
**Módulo** = **pasta com §.tf§** **que expõe entradas (§variable§) e saídas (§output§)**. **O diretório raiz já é um módulo** (**"módulo raiz"**); **os demais são "módulos filhos"**. **No laboratório:** §modules/servico§ **recebe §nome§, §porta§, §replicas§, §ambiente§, §sufixo§ e §destino§**, **cria um §local_file§** **e devolve §arquivo§**. **Chamado com §for_each§ sobre o mapa §servicos§:**
§§§
module "servico" {
  for_each = var.servicos
  source   = "./modules/servico"
  nome     = each.key
  porta    = each.value.porta
  ...
}
§§§
**Endereços resultantes** (**medidos no §state list§**): §module.servico["api"].local_file.config§ **e** §module.servico["web"].local_file.config§. **Adicionar um serviço** (**uma entrada no mapa**) **cria só o novo recurso**; **remover** **apaga só o dele**: **é por isso que se prefere §for_each§ a §count§** (**com §count§, remover o item do meio reindexa e recria os seguintes**).
**Boas práticas de módulos:** **uma responsabilidade clara**, **poucas entradas com bons padrões e validação**, **saídas só do necessário**, **versionamento** (**tags no Git ou registro, com a versão fixada: §version = "~> 1.2"§**), **documentação e exemplos**, **testes** (§terraform test§, **não executado aqui**). **Evite módulos "faz-tudo"** **e profundidade excessiva de módulos aninhados**.

### O state
**O state** (**§terraform.tfstate§, JSON**) **mapeia cada recurso da configuração ao objeto real** (**IDs, atributos**). **Sem ele**, **o Terraform não sabe o que já criou**. **Medido:** §state list§ **mostrou 4 recursos** (§random_password.db§, §random_pet.sufixo§ **e os dois arquivos**).
**Riscos e regras:**
- **Contém dados sensíveis em texto claro.** **Medido:** **a saída §senha_db§ aparece como §<sensitive>§**, **mas o state guarda §random_password.db.result§ (16 caracteres) legível**. **§sensitive = true§ só oculta na tela e nos logs**; **não criptografa o state**. **Consequências:** **proteja o state como um segredo** (**acesso restrito, criptografia em repouso, nunca no Git**); **evite colocar segredos no Terraform** (**prefira que a aplicação os leia de um gerenciador de segredos**, **ou crie-os fora e passe apenas referências**).
- **Nunca edite o state à mão**; **use §terraform state mv/rm§, blocos §moved§ e §import§**.
- **Local x remoto:** **o state local no laptop** **não serve para equipes** (**perda, divergência, sem bloqueio**).

### Backends remotos e bloqueio (análise)
**Backend remoto** (**S3, Azure Blob, GCS, HCP Terraform, PostgreSQL...**) **guarda o state fora da máquina**, **com versionamento e criptografia**, e **bloqueio (*locking*)** **impede dois §apply§ simultâneos** **(corrupção)**. **Requisitos:** **o bucket do state é criado fora do código que ele gerencia** (**o "ovo e a galinha"**), **acesso mínimo e auditado**, **versionamento ligado** (**para recuperar um state ruim**). **Não executado:** **nenhum backend remoto**.

### Separando ambientes e componentes
**Raio de impacto:** **um state grande = um §apply§ que pode mexer em tudo**. **Padrões:** (1) **diretórios (ou repositórios) por ambiente e por componente** (**rede, dados, aplicação**), **cada um com seu state**: **explícito e seguro** (**o mais recomendado**); (2) **workspaces** (**mesmo código, vários states**): **úteis para ambientes efêmeros**, **arriscados para produção** (**fácil esquecer em qual está**); (3) **ferramentas de orquestração** (**Terragrunt**, **Terraform Stacks**) **para reduzir repetição**. **Dependências entre componentes** **por saídas** (§terraform_remote_state§ **ou melhor: pelo registro de parâmetros/DNS**), **evitando acoplamento forte**.
**Efeito medido de trocar o ambiente em um mesmo state:** **"3 to add, 3 to destroy"**: **trocar a variável não "move" o ambiente**: **substitui os recursos**. **Por isso ambientes devem ter states separados, não uma variável que alterna**.

### Refatorar sem destruir
- **Bloco §moved§:** **informa que um recurso mudou de endereço** (**renomear, mover para um módulo**) **sem recriá-lo**.
- **§import§:** **traz para o state um recurso criado fora do Terraform**.
- **§terraform state mv/rm§:** **ajustes manuais pontuais, com cuidado**.
**Não executados** aqui.

### Pipeline de IaC (análise)
1. **Pull request:** §fmt -check§, §validate§, **linters** (**tflint**), **varreduras de segurança** (**checkov, trivy config**), **§plan§ com o resultado comentado no PR**.
2. **Revisão humana do plano** (**principalmente destroy/replace**) **e políticas como código** (**OPA/Conftest, Sentinel**).
3. **Merge → §apply§** **do plano salvo**, **com aprovação para produção** (**ambientes protegidos, curso C6.2**) **e credenciais efêmeras (OIDC)**.
4. **Job agendado de drift:** §plan -detailed-exitcode§ **(exit 2 = há divergência) com alerta**.
5. **Um *apply* por vez por state** (**bloqueio e fila de execuções**).
**Princípios:** **todo mudança pelo código**; **menor privilégio no papel de execução**; **planos revisados são os aplicados**; **destruição protegida**; **segredos fora do código e do repositório**.

### Executado e não executado
**Executado:** **módulo com §for_each§**, **§state list§**, **segredo no state**, **troca de ambiente com 3 add/3 destroy**. **Não executado:** **backend remoto e bloqueio, workspaces, §moved§/§import§, §terraform test§, tflint/checkov, OPA/Sentinel, pipeline real, provedores de nuvem, OpenTofu**.`,
  concepts: [
    { term: 'Módulo', def: 'Conjunto reutilizável de configuração Terraform com entradas, saídas e recursos.' },
    { term: 'State', def: 'Arquivo que mapeia a configuração aos objetos reais gerenciados e guarda seus atributos.' },
    { term: 'Backend remoto', def: 'Armazenamento do state fora da máquina local, com bloqueio, versionamento e controle de acesso.' },
    { term: 'State locking', def: 'Mecanismo que impede execuções simultâneas sobre o mesmo state.' },
    { term: 'for_each', def: 'Meta-argumento que cria uma instância por chave de um mapa ou conjunto, com endereços estáveis.' },
    { term: 'Bloco moved', def: 'Declaração de que um recurso mudou de endereço, evitando recriação em refatorações.' },
    { term: 'Raio de impacto', def: 'Extensão do que pode ser afetado por uma única execução ou falha.' },
    { term: 'Policy as code', def: 'Regras de conformidade e segurança expressas em código e verificadas automaticamente no pipeline.' }
  ],
  examples: R`**Analogia:** **o módulo é uma receita de bolo com ingredientes parametrizados** (**"bolo de §nome§ com §replicas§ camadas"**), **e o §for_each§ é a encomenda de vários bolos de uma vez**. **O state é o caderno de entregas**: **quem perde o caderno não sabe o que já foi entregue**; **e se o caderno tem a senha do cofre anotada**, **ele precisa ficar trancado**.

**Exemplo concreto (medido):** **dois serviços (api e web) viraram dois recursos §module.servico["api"]§ e §module.servico["web"]§**; **a senha do banco aparecia como §<sensitive>§ na saída, mas estava legível no §terraform.tfstate§**; **e trocar a variável de ambiente no mesmo state substituiu 3 recursos**.`,
  code: [
    { title: 'Módulo filho do laboratório (um arquivo de configuração por serviço)', lang: 'hcl', code: R`variable "nome"     { type = string }
variable "porta"    { type = number }
variable "replicas" { type = number }
variable "ambiente" { type = string }
variable "sufixo"   { type = string }
variable "destino"  { type = string }

resource "local_file" "config" {
  filename        = "DOLAR{var.destino}/DOLAR{var.nome}-DOLAR{var.ambiente}.json"
  content         = jsonencode({ nome = var.nome, ambiente = var.ambiente, porta = var.porta, replicas = var.replicas, sufixo = var.sufixo })
  file_permission = "0644"
}

output "arquivo" {
  value = local_file.config.filename
}`, notes: [{ l: 1, t: 'Entradas do módulo: a interface.' }, { l: 8, t: 'O nome do arquivo inclui o ambiente: trocar o ambiente recria o recurso.' }, { l: 14, t: 'Saída usada pelo módulo raiz.' }] },
    { title: 'Backend remoto com bloqueio (exemplo analisado, não executado)', lang: 'hcl', code: R`terraform {
  backend "s3" {
    bucket       = "minha-empresa-tfstate"   # criado fora deste código
    key          = "producao/rede/terraform.tfstate"
    region       = "sa-east-1"
    encrypt      = true
    use_lockfile = true                      # bloqueio do state
  }
}`, notes: [{ l: 3, t: 'O bucket e a conta são fictícios.' }, { l: 4, t: 'Um state por componente e ambiente: raio de impacto menor.' }, { l: 7, t: 'Verifique a opção de bloqueio da versão do Terraform em uso.' }] }
  ],
  bestPractices: ['Use módulos com interface pequena, validação, saídas mínimas e versões fixadas.', 'Prefira for_each a count para endereços estáveis.', 'Use backend remoto com criptografia, versionamento, acesso mínimo e bloqueio.', 'Trate o state como segredo e evite segredos no Terraform.', 'Separe states por ambiente e componente, não por uma variável que alterna.', 'Refatore com moved e import em vez de recriar.', 'Automatize fmt, validate, plan na revisão, apply do plano salvo com aprovação e detecção de drift agendada.'],
  mistakes: ['State local ou no Git com segredos.', 'Achar que sensitive criptografa o state.', 'Um state gigante para tudo.', 'Alternar ambientes por variável no mesmo state.', 'count em listas que mudam de ordem.', 'Editar o state à mão.', 'Módulos faz-tudo com dezenas de variáveis.'],
  market: R`**Módulos, state remoto e pipelines de IaC** **são o que separam** **quem escreve .tf** **de quem opera infraestrutura em equipe**; **perguntas sobre "segredos no state" e "como evitar dois applies simultâneos"** **são clássicas**.`,
  summary: R`Módulos dão reuso com interface; com for_each cada serviço vira uma instância de endereço estável (module.servico["api"]). O state mapeia a configuração ao real e contém dados sensíveis em texto claro: no laboratório a saída da senha aparecia como sensitive, mas a senha de 16 caracteres estava legível no state, então ele deve ser protegido como segredo e armazenado em backend remoto criptografado, versionado e com bloqueio. Separe states por ambiente e componente: trocar a variável de ambiente no mesmo state substituiu 3 recursos (3 to add, 3 to destroy). Refatore com moved e import e automatize fmt, validate, plan na revisão, apply do plano salvo e detecção de drift. Backends remotos, workspaces e CI não foram executados.`,
  refs: [REF.tfModules, REF.tfForEach, REF.tfState, REF.tfSensitive, REF.tfBackend, REF.opentofu],
  cards: [
    { q: 'Por que for_each é preferível a count?', a: 'Cada instância tem uma chave estável; remover um item não reindexa nem recria os demais, como acontece com count.' },
    { q: 'O sensitive = true protege o state?', a: 'Não: só oculta o valor na saída e nos logs; o state guarda o valor em texto claro (medido: senha de 16 caracteres legível).' },
    { q: 'Para que serve o bloqueio do state?', a: 'Impedir que duas execuções alterem o mesmo state ao mesmo tempo, evitando corrupção.' },
    { q: 'Por que não alternar ambientes por variável no mesmo state?', a: 'Porque a mudança substitui os recursos (medido: 3 to add, 3 to destroy); ambientes devem ter states separados.' }
  ]
}
];
