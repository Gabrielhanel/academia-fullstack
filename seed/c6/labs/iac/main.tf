terraform {
  required_version = ">= 1.9"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

variable "ambiente" {
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
  default = {
    api = { porta = 3000, replicas = 2 }
    web = { porta = 8080, replicas = 3 }
  }
  validation {
    condition     = alltrue([for k, s in var.servicos : s.replicas >= 1 && s.porta > 1023])
    error_message = "cada serviço precisa de replicas >= 1 e porta > 1023."
  }
}

resource "random_pet" "sufixo" {
  length = 2
  keepers = {
    ambiente = var.ambiente
  }
}

resource "random_password" "db" {
  length  = 16
  special = false
}

module "servico" {
  for_each = var.servicos
  source   = "./modules/servico"
  nome     = each.key
  porta    = each.value.porta
  replicas = each.value.replicas
  ambiente = var.ambiente
  sufixo   = random_pet.sufixo.id
  destino  = "${path.module}/saida"
}

output "arquivos" {
  value = { for k, m in module.servico : k => m.arquivo }
}

output "total_replicas" {
  value = sum([for s in var.servicos : s.replicas])
}

output "senha_db" {
  value     = random_password.db.result
  sensitive = true
}
