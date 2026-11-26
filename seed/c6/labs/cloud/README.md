# Laboratório C6.4 — Cloud: modelos locais (sem conta de nuvem)

Executado em 2026-11-25 com Node 26.13.1 no host. **Nenhum recurso de AWS, Azure ou Google Cloud foi criado**: não havia contas nem chaves. O conteúdo dos provedores é **análise da documentação oficial** (referências abertas e verificadas); o que foi **executado** são **modelos locais** que ilustram conceitos.

## Executado (modelos, `saida-cloud.txt`)
- `disponibilidade.mjs`: indisponibilidade permitida em 30 dias (99% → 432 min; 99,9% → 43,2; 99,95% → 21,6; 99,99% → 4,32; 99,999% → 0,43) e composição serial/paralela com disponibilidades **hipotéticas** (série 99,9 × 99,9 × 99,95 → 99,7502%; duas instâncias em paralelo → 99,9999%, supondo falhas independentes).
- `iam-avaliador.mjs`: modelo da lógica **negação explícita > permissão > negação implícita** com curingas em Action e Resource (6 casos). **Simplificado**: sem condições, permission boundaries, SCPs, políticas de recurso ou de sessão.
- `serverless-modelo.mjs`: cold start x ambiente quente (inicialização simulada por carga de CPU: ~460 ms na primeira invocação e na primeira após reciclar (469,5 e 459,9 ms na execução registrada); ~0,006–0,01 ms nas quentes) e idempotência com entrega repetida (com chave, saldo 70; sem chave, saldo 10 após três entregas). **Não é a AWS Lambda**: os tempos refletem o modelo, não um provedor.
- `custos.mjs`: **preços fictícios** (não são de nenhum provedor) para comparar VM fixa e serverless: ponto de equilíbrio ≈ 10,87 milhões de requisições por mês no modelo; egress fictício de 5 TB = 400.

## Analisado (documentação, não executado)
Serviços e conceitos de AWS, Azure e Google Cloud (identidade, redes, computação, armazenamento, bancos, serverless, custos). Limites e preços dos provedores mudam: consulte as páginas oficiais.

## Não executado
Qualquer chamada de API de nuvem, criação de contas, VPCs, funções, bancos, balanceadores, orçamentos ou migrações; emuladores (LocalStack, Azurite, emuladores do Google); comparação real de desempenho ou de preço entre provedores.

## Limitações
Modelos simplificados; disponibilidades e preços são hipotéticos; tempos de uma execução em uma máquina.

## Reprodução
```bash
node disponibilidade.mjs && node iam-avaliador.mjs && node serverless-modelo.mjs && node custos.mjs
```
