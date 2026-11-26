variable "nome" { type = string }
variable "porta" { type = number }
variable "replicas" { type = number }
variable "ambiente" { type = string }
variable "sufixo" { type = string }
variable "destino" { type = string }

resource "local_file" "config" {
  filename        = "${var.destino}/${var.nome}-${var.ambiente}.json"
  content         = jsonencode({ nome = var.nome, ambiente = var.ambiente, porta = var.porta, replicas = var.replicas, sufixo = var.sufixo })
  file_permission = "0644"
}

output "arquivo" {
  value = local_file.config.filename
}
