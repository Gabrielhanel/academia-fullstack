# Laboratório C7.3 — Criptografia, hashing e segredos

Executado em 2026-11-26: Node 26.13.1 (`node:crypto`; OpenSSL 3.5.9 embutido), OpenSSL 3.5.5 do host, Docker 29.9.3 com `zricethezav/gitleaks` v8.30.1, git 2.53.0. Todos os dados, chaves e "segredos" são sintéticos (tokens gerados aleatoriamente a cada execução, nunca reais). A máquina de 8 núcleos estava sob carga de outros contêineres: os **valores absolutos de tempo variam; as razões são o que importa**.

## Hashing e senhas (`hashing.mjs` → `saida-hashing.txt`)
- SHA-256("abc") confere com o vetor conhecido; avalanche: **49,9%** dos bits da saída mudam ao inverter 1 bit (1.000 entradas).
- Custo por tentativa (1 núcleo): SHA-256 simples ≈ **713 mil/s** (OpenSSL; o `createHash` do Node dá ≈ 80 mil/s por sobrecarga de objeto e não serve de taxa de quebra); scrypt N=2^14 **157 ms**; scrypt N=2^17 **1,44 s**; PBKDF2-SHA256 600.000 **1,19 s**; Argon2id (19 MiB, t=2, p=1) **139 ms**. Razão SHA-256 simples/scrypt(2^14) ≈ **1,1×10⁵**.
- Estimativa para esgotar o espaço em 1 núcleo: 8 minúsculas — SHA-256 3,4 dias, scrypt 2^14 ~1.000 anos; 8 alfanuméricas — SHA-256 ~9,7 anos, scrypt ~1,1×10⁶ anos (GPUs/ASICs são ordens de grandeza mais rápidos; as razões, não os números absolutos, são a lição).
- Dicionário de 120.000 senhas sintéticas: **sem salt**, tabela montada em 1,96 s e **3/3 senhas** recuperadas em 0,2 ms; **com salt + scrypt**, 157,6 ms por tentativa (60 tentativas em 9,5 s; os 120.000 candidatos x 3 usuários levariam ≈ 15,7 h).
- HMAC confere o original e rejeita a mensagem adulterada.
- **Atenção:** o scrypt padrão do Node (N=2^14) está **abaixo** do mínimo do OWASP (N=2^17).

## Cifras e assinaturas (`cifras.mjs` → `saida-cifras.txt`)
- AES-256-GCM: 38 B → 38 B + nonce 12 B + tag 16 B; 1 bit alterado ou AAD diferente → falha de autenticação.
- **Nonce reutilizado:** `c1 XOR c2 == p1 XOR p2` (verdadeiro); com nonce novo, falso. **ECB:** 10 blocos iguais → 1 bloco cifrado distinto (GCM: 10).
- Assinaturas (1 núcleo): Ed25519 (pública 44 B, assinatura 64 B, ~3,5 mil assinaturas/s), ECDSA P-256 (91 B, 72 B, ~5,7 mil/s), RSA-PSS 2048 (294 B, 256 B, ~355 assinaturas/s e ~6,6 mil verificações/s), ML-DSA-65 (1.974 B, 3.309 B, ~197/s); assinatura sobre mensagem adulterada é inválida.
- RSA-OAEP 2048 cifra 190 B e recusa 191 B (`ERR_OSSL_RSA_DATA_TOO_LARGE_FOR_KEY_SIZE`). X25519 + HKDF + AES-GCM funciona nos dois lados. ML-KEM-768: pública 1.206 B (DER), encapsulamento 1.088 B, segredo 32 B (X25519: 44 B).

## Cadeia de certificados (`cadeia.sh` → `saida-cadeia.txt`, OpenSSL 3.5.5)
Folha assinada por CA de teste: `OK`; contra outra CA: `unable to get local issuer certificate`; daqui a 20 dias (folha vale 10): `certificate has expired`; nome errado: `hostname mismatch`; 1 byte alterado na assinatura: `certificate signature failure`. (Uma primeira alteração em outra posição do certificado caiu no nome do emissor e deu `unable to get local issuer certificate`, não falha de assinatura.)

## Segredos (`scanner.mjs`, `envelope.mjs`, `repo-demo.sh` → `saida-segredos.txt`)
- Repositório git sintético com 2 commits (segredos por engano e depois removidos): o token continua no primeiro commit (`git show HEAD~1:app.js`). Scanner próprio: árvore atual **0** achados; histórico **6** (2 segredos, cada um adicionado e removido no diff, e duas regras para o token). A **primeira versão do scanner achou só os tokens (2) e perdeu o `DB_PASSWORD`** porque `\b` não separa `_` de `PASSWORD`; corrigido com prefixo `[A-Za-z0-9_]*`.
- **gitleaks v8.30.1:** histórico **2 achados** (`generic-api-key` em `.env`, `github-pat` em `app.js`); árvore atual (`--no-git`) **0** — varrer só a árvore perde o que ficou no histórico. (Uma primeira chamada com `--report-path /dev/stdout` devolveu relatório vazio; trocada pela saída verbosa.)
- Envelope encryption: rotação da KEK reembrulhando as DEKs sem tocar nos dados — 10.000 x 1 KiB: 768 ms contra 1.087 ms recifrando tudo (**1,4x**); 200 x 1 MiB: 63 ms contra 992 ms (**15,9x**); destruir a KEK torna os dados ilegíveis (*crypto shredding*).

## Não executado
KMS/HSM e cofres reais (Vault, AWS KMS, Key Vault), reescrita de histórico (`git filter-repo`, BFG), proteção de push do GitHub, TLS completo com revogação (OCSP/CRL), PKI de produção, ataques a implementações (canais laterais), avaliação criptográfica formal, hardware dedicado (GPU) para quebra de senhas.

## Limitações
Medições de um processo em uma máquina sob carga; estimativas de quebra extrapolam a taxa de 1 núcleo; ML-KEM/ML-DSA dependem do suporte da versão do Node/OpenSSL; não é aconselhamento de conformidade.

## Reprodução
```bash
node hashing.mjs && node cifras.mjs && bash cadeia.sh
node envelope.mjs 10000x1024 && node envelope.mjs 200x1048576 && bash repo-demo.sh
```
