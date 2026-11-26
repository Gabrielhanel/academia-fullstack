// C7.3 — Criptografia, hashing e segredos. Aulas 1 a 3.
const R = String.raw;

export const REF = {
  nodeCrypto: { title: 'Node.js — Crypto', url: 'https://nodejs.org/api/crypto.html', kind: 'doc' },
  csPassword: { title: 'OWASP Cheat Sheet — Password Storage', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', kind: 'guia' },
  csCryptoStorage: { title: 'OWASP Cheat Sheet — Cryptographic Storage', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html', kind: 'guia' },
  csSecrets: { title: 'OWASP Cheat Sheet — Secrets Management', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html', kind: 'guia' },
  nist63b: { title: 'NIST SP 800-63B — Digital Identity Guidelines: Authentication and Lifecycle Management', url: 'https://pages.nist.gov/800-63-4/sp800-63b.html', kind: 'norma' },
  fips180: { title: 'NIST FIPS 180-4 — Secure Hash Standard', url: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final', kind: 'norma' },
  fips203: { title: 'NIST FIPS 203 — ML-KEM', url: 'https://csrc.nist.gov/pubs/fips/203/final', kind: 'norma' },
  fips204: { title: 'NIST FIPS 204 — ML-DSA', url: 'https://csrc.nist.gov/pubs/fips/204/final', kind: 'norma' },
  sp80038d: { title: 'NIST SP 800-38D — GCM e GMAC', url: 'https://csrc.nist.gov/pubs/sp/800/38/d/final', kind: 'norma' },
  rfc9106: { title: 'RFC 9106 — Argon2', url: 'https://datatracker.ietf.org/doc/html/rfc9106', kind: 'rfc' },
  rfc7914: { title: 'RFC 7914 — scrypt', url: 'https://datatracker.ietf.org/doc/html/rfc7914', kind: 'rfc' },
  rfc2104: { title: 'RFC 2104 — HMAC', url: 'https://datatracker.ietf.org/doc/html/rfc2104', kind: 'rfc' },
  rfc5869: { title: 'RFC 5869 — HKDF', url: 'https://datatracker.ietf.org/doc/html/rfc5869', kind: 'rfc' },
  rfc8032: { title: 'RFC 8032 — EdDSA (Ed25519)', url: 'https://datatracker.ietf.org/doc/html/rfc8032', kind: 'rfc' },
  rfc7748: { title: 'RFC 7748 — X25519', url: 'https://datatracker.ietf.org/doc/html/rfc7748', kind: 'rfc' },
  shattered: { title: 'SHAttered — a primeira colisão prática do SHA-1', url: 'https://shattered.io/', kind: 'artigo' },
  gitleaks: { title: 'gitleaks — Find secrets with Gitleaks', url: 'https://github.com/gitleaks/gitleaks', kind: 'ferramenta' },
  ghSecretScan: { title: 'GitHub Docs — About secret scanning', url: 'https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning', kind: 'doc' },
  opensslVerify: { title: 'OpenSSL — openssl-verify', url: 'https://docs.openssl.org/master/man1/openssl-verify/', kind: 'doc' },
  vaultDocs: { title: 'HashiCorp Vault — Documentation', url: 'https://developer.hashicorp.com/vault/docs', kind: 'doc' },
  k8sSecretsGood: { title: 'Kubernetes — Good practices for Kubernetes Secrets', url: 'https://kubernetes.io/docs/concepts/security/secrets-good-practices/', kind: 'guia' }
};

export const lessonsA = [
{
  id: 'crip-01', moduleId: 'm1', order: 1, minutes: 90, tags: ['hash', 'SHA-256', 'senhas', 'salt', 'scrypt', 'Argon2id', 'PBKDF2', 'HMAC', 'avalanche'],
  title: 'Hashing: integridade, hash de senhas e o custo de quebrar, medidos na prática',
  objectives: ['Explicar as propriedades de uma função de hash e distinguir hash, criptografia e codificação', 'Escolher e configurar o hash de senhas (Argon2id, scrypt, PBKDF2, bcrypt) com salt e parâmetros adequados', 'Interpretar medições de custo por tentativa e estimar o esforço de quebra offline', 'Usar HMAC e comparação em tempo constante'],
  intro: R`**Hash não é criptografia**: **não tem chave e não se "decifra"**; **serve para integridade, identificação e, com cuidado, para guardar senhas.** **A diferença entre um hash adequado e um inadequado para senhas é a diferença entre o vazamento ser um incidente ou um desastre.** **Nesta aula você mede** (**Node 26.13.1 e OpenSSL**) **quantas tentativas por segundo um atacante faz contra cada algoritmo.**`,
  theory: R`### O que é uma função de hash
**Recebe dados de qualquer tamanho e devolve um resumo de tamanho fixo.** **Propriedades desejadas:** **determinística**, **rápida de calcular**, **resistente à pré-imagem** (**não dá para achar a entrada pela saída**), **resistente à segunda pré-imagem e a colisões** (**não dá para achar duas entradas com o mesmo hash**) **e com efeito avalanche.** **Medido:** **SHA-256("abc") = §ba7816bf…15ad§ (confere com o vetor padrão)**; **inverter 1 bit de 1.000 entradas aleatórias mudou, em média, 127,9 dos 256 bits da saída (49,9%)**: **o ideal é ≈ 50%.** **Tamanhos de saída (bytes):** **MD5 16, SHA-1 20, SHA-256 32, SHA3-256 32, BLAKE2b-512 64.**
**Algoritmos:** **MD5 e SHA-1 estão quebrados para colisões** (**o ataque *SHAttered* de 2017 produziu a primeira colisão prática no SHA-1**): **não use para assinaturas ou integridade em contextos adversariais.** **Use SHA-256/SHA-512 (família SHA-2), SHA-3 ou BLAKE2/BLAKE3.**
**Hash x criptografia x codificação:** **Base64 é codificação (reversível sem chave)**; **criptografia é reversível com chave**; **hash é de mão única.**
**Usos legítimos:** **checksums de arquivos e downloads**, **endereçamento por conteúdo (git, Docker)**, **HMAC**, **assinaturas digitais (assina-se o hash)** **e, em forma especial, senhas.**

### Por que SHA-256 simples é errado para senhas (medido)
**Hashes de uso geral são projetados para serem rápidos**; **para quebrar senhas, rapidez é o que o atacante quer.** **Medidas (1 núcleo, máquina sob carga; valores absolutos variam, as razões importam):**
| Algoritmo | Custo por tentativa | Tentativas/s |
|---|---|---|
| **SHA-256 simples** (OpenSSL) | **~1,4 µs** | **~713 mil** |
| **scrypt N=2^14, r=8, p=1** (padrão do Node) | **157 ms** | **6,4** |
| **scrypt N=2^17, r=8, p=1** | **1,44 s** | **0,7** |
| **PBKDF2-SHA256, 600.000 iterações** | **1,19 s** | **0,8** |
| **Argon2id, 19 MiB, t=2, p=1** | **139 ms** | **7,2** |
**Razão SHA-256 simples ÷ scrypt(2^14) ≈ 1,1×10⁵**: **o atacante testa cem mil vezes mais senhas por segundo com o hash rápido.** **Nota de método:** **o §createHash§ do Node, em laço, deu só ~80 mil/s por sobrecarga de criar objetos**: **não use isso como taxa de ataque; a taxa real vem de bibliotecas otimizadas (OpenSSL), e de GPUs/ASICs, muito mais velozes.**

### Estimativa de esforço (1 núcleo; GPUs são ordens de grandeza mais rápidas)
| Espaço de senhas | SHA-256 simples | scrypt 2^14 | Argon2id |
|---|---|---|---|
| **8 minúsculas** (26⁸ ≈ 2,1×10¹¹) | **3,4 dias** | **~1.040 anos** | **~920 anos** |
| **8 alfanuméricas** (62⁸ ≈ 2,2×10¹⁴) | **~9,7 anos** | **~1,1×10⁶ anos** | **~9,6×10⁵ anos** |
| **12 alfanuméricas** (62¹² ≈ 3,2×10²¹) | **~1,4×10⁸ anos** | **~1,6×10¹³ anos** | **~1,4×10¹³ anos** |
**Leituras:** (1) **o hash lento transforma "dias" em "séculos"**; (2) **o tamanho/entropia da senha importa mais que tudo** (**12 caracteres aleatórios aguentam até o hash rápido em 1 núcleo**; **mas pessoas escolhem senhas previsíveis: o ataque real é por dicionário e padrões, não por força bruta pura**); (3) **hardware especializado reduz esses tempos em 10³–10⁶ vezes**: **use a razão, não o valor.**

### Salt: o que muda (medido)
**Salt = valor aleatório único por senha, guardado junto do hash.** **Impede tabelas pré-calculadas e que usuários com a mesma senha tenham o mesmo hash.** **Medido (120.000 candidatos sintéticos, 3 senhas fracas):**
- **SEM salt (SHA-256):** **tabela montada em 1,96 s, reutilizável para TODOS os usuários; 3/3 senhas recuperadas em 0,2 ms de consulta.**
- **COM salt + scrypt:** **157,6 ms por tentativa (60 tentativas em 9,5 s); cada usuário exige trabalho próprio; testar os 120.000 candidatos × 3 usuários levaria ≈ 15,7 h em 1 núcleo.**
**Pepper** (**segredo global fora do banco, ex.: em KMS/HSM**) **é uma camada extra opcional**; **não substitui salt e exige gestão de chave.**

### O que usar (OWASP Password Storage Cheat Sheet, conferido na fonte)
1. **Argon2id**, **no mínimo 19 MiB de memória, 2 iterações, paralelismo 1** (**Node 24.7+ tem §crypto.argon2()§; o laboratório usou exatamente esses parâmetros**).
2. **scrypt** (**se Argon2id não estiver disponível**): **custo mínimo N=2^17, r=8, p=1.** **Atenção: o padrão do Node (N=2^14) está abaixo do mínimo recomendado**: **configure.**
3. **bcrypt** (**legado**): **fator de custo ≥ 10 e limite de 72 bytes na senha.**
4. **PBKDF2-HMAC-SHA256** (**quando FIPS-140 é exigido**): **≥ 600.000 iterações.**
**Ajuste de custo:** **busque ~100–500 ms por hash no seu hardware** **(equilíbrio entre segurança e carga de login)**, **e aumente com o tempo.** **Guarde os parâmetros no próprio hash** (**formato PHC: §$argon2id$v=19$m=19456,t=2,p=1$salt$hash§**) **para atualizar depois: reidrate o hash no próximo login bem-sucedido** (***rehash on login***).
**Outros cuidados:** **limitar tentativas e registrar falhas (C7.1)**, **MFA**, **bloquear senhas vazadas e comuns** (**recomendação do NIST SP 800-63B: priorizar tamanho, verificar contra listas de senhas comprometidas e não impor regras de composição arbitrárias nem expiração periódica sem motivo**), **não limitar o tamanho máximo a valores baixos** (**exceto o limite técnico do bcrypt**), **tratar o armazenamento de dados de recuperação com o mesmo rigor.**

### HMAC e comparação em tempo constante
**HMAC** (**RFC 2104**) **usa uma chave secreta para autenticar uma mensagem**: **só quem tem a chave gera a etiqueta válida.** **Medido: o HMAC conferiu para a mensagem original e foi rejeitado para a adulterada (§valor=100§ → §valor=900§).** **SHA-256 puro com a chave concatenada (§H(chave‖msg)§) tem o problema da extensão de comprimento** (**por isso se usa HMAC**; **conceito; o laboratório não demonstra o ataque**). **Compare etiquetas e tokens com §crypto.timingSafeEqual§** (**comparar com §===§ pode vazar informação pelo tempo**; **o laboratório não mediu esse vazamento**).

### Executado e não executado
**Executado:** **vetor padrão, avalanche, custos de SHA-256/scrypt/PBKDF2/Argon2id, estimativas, dicionário com e sem salt, HMAC.** **Não executado:** **bcrypt, GPUs, ataque por extensão de comprimento, vazamento por tempo, verificação contra listas de senhas vazadas, migração de hashes.**`,
  concepts: [
    { term: 'Função de hash', def: 'Função que mapeia dados de tamanho arbitrário para um resumo de tamanho fixo, de mão única e com efeito avalanche.' },
    { term: 'Salt', def: 'Valor aleatório único por senha, armazenado com o hash, que impede tabelas pré-calculadas e hashes iguais para senhas iguais.' },
    { term: 'Argon2id', def: 'Função de derivação de chaves e hash de senhas resistente a memória e a GPUs, recomendada para novos sistemas.' },
    { term: 'Fator de custo', def: 'Parâmetro que controla o tempo e a memória gastos por um hash de senha.' },
    { term: 'HMAC', def: 'Código de autenticação de mensagem baseado em hash e chave secreta.' },
    { term: 'Pepper', def: 'Segredo global, mantido fora do banco, combinado às senhas como defesa adicional.' },
    { term: 'Efeito avalanche', def: 'Propriedade em que uma pequena mudança na entrada altera cerca de metade dos bits da saída.' },
    { term: 'Rehash on login', def: 'Atualização do hash de senha com parâmetros mais fortes após um login bem-sucedido.' }
  ],
  examples: R`**Analogia:** **o hash é uma impressão digital**: **fácil de tirar de um dedo, impossível de reconstruir o dedo a partir dela.** **Para senhas queremos uma impressão digital *lenta e cara de tirar*: se ela custa 150 ms e 19 MiB, o atacante que precisa de bilhões de tentativas desiste.** **O salt é um carimbo exclusivo em cada impressão**: **o catálogo de impressões prontas deixa de servir.**

**Exemplo concreto (medido):** **o hash rápido permitiu ≈ 713 mil tentativas por segundo por núcleo contra ≈ 6 do scrypt padrão do Node (razão ≈ 10⁵)**; **sem salt, 3 de 3 senhas fracas caíram em 0,2 ms consultando uma tabela; com salt+scrypt, cada tentativa custou 157 ms.**`,
  code: [
    { title: 'Hash de senha com Argon2id (Node 24.7+; parâmetros mínimos do OWASP)', lang: 'javascript', code: R`import crypto from 'node:crypto';
const params = { parallelism: 1, tagLength: 32, memory: 19456, passes: 2 }; // 19 MiB, t=2, p=1

export function hashSenha(senha) {
  const nonce = crypto.randomBytes(16);                       // salt único
  const tag = crypto.argon2Sync('argon2id', { message: senha, nonce, ...params });
  return ['argon2id', params.memory, params.passes, params.parallelism, nonce.toString('base64'), tag.toString('base64')].join('$');
}
export function confere(senha, guardado) {
  const [alg, m, t, p, nonce, tag] = guardado.split('$');
  const novo = crypto.argon2Sync(alg, { message: senha, nonce: Buffer.from(nonce, 'base64'), parallelism: +p, tagLength: 32, memory: +m, passes: +t });
  return crypto.timingSafeEqual(novo, Buffer.from(tag, 'base64'));
}`, notes: [{ l: 2, t: 'Valores mínimos do OWASP para Argon2id.' }, { l: 5, t: 'Salt aleatório por senha.' }, { l: 6, t: 'Os parâmetros viajam no próprio valor guardado.' }, { l: 13, t: 'Comparação em tempo constante.' }] },
    { title: 'Medindo o custo por tentativa (trecho de hashing.mjs)', lang: 'javascript', code: R`const ms = (f, n = 1) => { const t = performance.now(); for (let i = 0; i < n; i++) f(i); return (performance.now() - t) / n; };
const scryptMs = ms(() => crypto.scryptSync('senha', 'salt-sintetico-16b', 32), 20);   // N=2^14 (padrão do Node)
const forte = ms(() => crypto.scryptSync('senha', 'salt-sintetico-16b', 32, { N: 2 ** 17, maxmem: 256 * 1024 * 1024 }), 3);
console.log(scryptMs.toFixed(1), 'ms →', (1000 / scryptMs).toFixed(1), 'tentativas/s por núcleo');`, notes: [{ l: 3, t: 'N=2^17 exige aumentar maxmem.' }, { l: 4, t: 'A taxa de tentativas é o que o atacante também alcança, por núcleo.' }] }
  ],
  bestPractices: ['Use Argon2id (19 MiB, t=2, p=1 no mínimo), scrypt N=2^17 ou bcrypt custo ≥ 10; PBKDF2 ≥ 600.000 só se FIPS for exigido.', 'Salt único e aleatório por senha e parâmetros guardados no hash.', 'Calibre o custo para ~100–500 ms e aumente com o tempo (rehash on login).', 'Nunca use MD5, SHA-1 ou SHA-256 simples para senhas.', 'Use HMAC para autenticar mensagens e timingSafeEqual para comparar.', 'Combine com limite de tentativas, MFA e bloqueio de senhas vazadas.', 'Considere pepper em KMS/HSM como camada adicional.'],
  mistakes: ['Guardar senhas com SHA-256 ou MD5.', 'Usar o mesmo salt (ou nenhum) para todos os usuários.', 'Usar o padrão scrypt N=2^14 do Node sem avaliar.', 'Confundir Base64 ou hash com criptografia.', 'Comparar tokens e etiquetas com ===.', 'Expor mensagens de login que distinguem usuário e senha.', 'Impor regras de composição e expiração arbitrárias em vez de checar listas de senhas vazadas.'],
  market: R`**Armazenamento de senhas** **é pergunta clássica de entrevista e de auditoria**; **explicar salt, custo e por que SHA-256 não serve** **mostra entendimento prático.**`,
  summary: R`Hash é de mão única e serve a integridade e identificação; para senhas é preciso um hash lento, com salt e parâmetros ajustáveis. Medido: avalanche de 49,9% dos bits; SHA-256 simples ≈ 713 mil/s por núcleo contra scrypt 2^14 em 157 ms, scrypt 2^17 em 1,44 s, PBKDF2 600.000 em 1,19 s e Argon2id (19 MiB, t=2, p=1) em 139 ms, razão ≈ 10⁵; sem salt, 3 de 3 senhas fracas caíram em 0,2 ms consultando uma tabela, com salt e scrypt cada tentativa custou 157,6 ms. O OWASP recomenda Argon2id, scrypt N=2^17, bcrypt custo ≥ 10 ou PBKDF2 ≥ 600.000; o scrypt padrão do Node está abaixo do mínimo. HMAC e timingSafeEqual autenticam e comparam com segurança. GPUs, bcrypt e listas de senhas vazadas não foram executados.`,
  refs: [REF.csPassword, REF.nodeCrypto, REF.rfc9106, REF.rfc7914, REF.rfc2104, REF.fips180, REF.shattered, REF.nist63b],
  cards: [
    { q: 'Por que SHA-256 simples não serve para senhas?', a: 'É rápido demais: ≈ 713 mil tentativas/s por núcleo contra ≈ 6 do scrypt padrão do Node (razão ≈ 10⁵), o que facilita a quebra offline.' },
    { q: 'O que o salt resolve?', a: 'Impede tabelas pré-calculadas e hashes iguais para senhas iguais; no laboratório, sem salt 3/3 senhas caíram em 0,2 ms.' },
    { q: 'Quais são os parâmetros mínimos do Argon2id segundo o OWASP?', a: '19 MiB de memória, 2 iterações e paralelismo 1.' },
    { q: 'Por que usar HMAC e não SHA-256(chave || mensagem)?', a: 'Evita o problema da extensão de comprimento dos hashes Merkle-Damgård e é o padrão para autenticar com chave.' }
  ]
},
{
  id: 'crip-02', moduleId: 'm1', order: 2, minutes: 95, tags: ['AES-GCM', 'nonce', 'ECB', 'RSA', 'ECDSA', 'Ed25519', 'X25519', 'certificados', 'pós-quântica', 'ML-KEM'],
  title: 'Criptografia simétrica e assimétrica: AEAD, assinaturas, troca de chaves, certificados e o que muda com a pós-quântica',
  objectives: ['Usar cifras autenticadas (AES-GCM) corretamente e reconhecer os erros fatais (nonce repetido, ECB)', 'Escolher entre RSA, ECDSA e Ed25519 e entender limites e custos medidos', 'Combinar troca de chaves e cifra simétrica (híbrido) e explicar o papel dos certificados', 'Situar a criptografia pós-quântica (ML-KEM, ML-DSA) e seus custos de tamanho'],
  intro: R`**Criptografia bem escolhida e mal usada falha.** **O erro costuma estar no uso**: **nonce repetido, modo errado, chave mal gerada, falta de autenticação das chaves.** **Aqui você executa cada primitiva no Node 26 e no OpenSSL**, **provoca os erros de propósito** (**dados sintéticos**) **e vê o que acontece.** **Regra de ouro: não invente algoritmos nem protocolos; use bibliotecas de alto nível.**`,
  theory: R`### Simétrica: uma chave para cifrar e decifrar
**AES** **é o padrão.** **O modo importa mais que o tamanho da chave.** **Use cifras autenticadas (AEAD)**, **como AES-GCM** ou **ChaCha20-Poly1305**: **dão confidencialidade e integridade juntas.** **Medido (AES-256-GCM):**
- **38 bytes de claro → 38 B cifrados + nonce de 12 B + etiqueta de 16 B** (**sobrecarga de 28 B**).
- **Alterar 1 bit do cifrado → falha: "Unsupported state or unable to authenticate data"**; **mudar o AAD** (**dados associados autenticados, como versão ou contexto**) **→ a mesma falha.** **A integridade protege contra adulteração, não só leitura.**

### Os erros fatais (medidos)
1. **Reutilizar o nonce com a mesma chave (GCM/CTR):** **medido: §c1 XOR c2 == p1 XOR p2§ → verdadeiro**; **quem conhece um dos textos recupera o outro, e no GCM a repetição também compromete a autenticidade.** **Com nonce novo a igualdade deixou de valer.** **Gere nonces aleatórios de 96 bits com CSPRNG** (**para volumes enormes, cuidado com colisão: ~2³² mensagens por chave com nonce aleatório de 96 bits é o limite prático recomendado pelo NIST SP 800-38D**) **ou use contadores únicos.**
2. **Modo ECB:** **blocos iguais viram blocos cifrados iguais**: **medido: 10 blocos idênticos → 1 bloco cifrado distinto (ECB) contra 10 (GCM)**: **o padrão dos dados vaza.** **Nunca use ECB.**
3. **Cifrar sem autenticar** (**CBC/CTR sem MAC**): **permite adulteração e ataques de *padding oracle*.**
4. **Chaves fracas ou mal derivadas:** **gere com §crypto.randomBytes§**; **derive subchaves com HKDF** (**RFC 5869; medido: rótulos diferentes geram chaves diferentes**) ou, **de senhas, com Argon2id/scrypt (aula 1).**
5. **Aleatoriedade insegura:** **nunca use §Math.random()§ para segredos**; **use o CSPRNG do sistema.**

### Assimétrica: par de chaves pública/privada
**Resolve distribuição de chaves e assinatura**, **mas é mais lenta e cifra pouco volume**; **por isso se usa em conjunto com a simétrica (híbrido).**
**Medido (1 núcleo, máquina sob carga):**
| Algoritmo | Chave pública | Assinatura | Assinar /s | Verificar /s |
|---|---|---|---|---|
| **Ed25519** | **44 B** | **64 B** | **~3.500** | **~1.700** |
| **ECDSA P-256** | **91 B** | **72 B** | **~5.700** | **~2.500** |
| **RSA-PSS 2048** | **294 B** | **256 B** | **~355** | **~6.600** |
| **ML-DSA-65** (pós-quântica) | **1.974 B** | **3.309 B** | **~197** | **~1.040** |
**Leituras:** **RSA assina devagar e verifica rápido, com chaves e assinaturas grandes**; **curvas elípticas (Ed25519, P-256) dão chaves/assinaturas pequenas e boa velocidade**; **Ed25519 é simples de usar com segurança** (**determinístico**); **ECDSA exige bom nonce por assinatura**. **(As taxas variam com a máquina e a carga.)** **Medido também: assinatura sobre mensagem adulterada é inválida.**
**RSA-OAEP:** **cifra no máximo 190 bytes com chave de 2048 bits e SHA-256 (256 − 2×32 − 2); com 191 bytes o OpenSSL recusou §ERR_OSSL_RSA_DATA_TOO_LARGE_FOR_KEY_SIZE§.** **Por isso se cifra uma chave simétrica, não os dados.** **Evite o *padding* PKCS#1 v1.5 para cifrar.**

### Híbrido: troca de chaves + cifra simétrica (medido)
**X25519** (**RFC 7748**): **Alice e Bob trocam chaves públicas e chegam ao mesmo segredo de 32 bytes (medido: iguais).** **Derive a chave com HKDF e cifre com AES-GCM** (**é a base de TLS 1.3, Signal e do ECIES**). **Sem autenticar as chaves públicas, um intermediário pode trocá-las** (***man-in-the-middle***): **daí as assinaturas e os certificados.**

### Certificados: autenticando chaves públicas
**Um certificado liga um nome a uma chave pública e é assinado por uma CA.** **Medido com OpenSSL 3.5.5 (CA de teste e folha §api.exemplo.test§):**
| Verificação | Resultado |
|---|---|
| **contra a CA correta** | **OK** |
| **contra outra CA** | **unable to get local issuer certificate** |
| **daqui a 20 dias (a folha vale 10)** | **certificate has expired** |
| **nome errado** | **hostname mismatch** |
| **1 byte alterado na assinatura** | **certificate signature failure** |
**Lição:** **validar certificado é verificar assinatura, cadeia, validade, nome e uso** (**curso C6.3 aplicou isso ao TLS do nginx**). **Chaves privadas: permissões restritas, rotação, armazenamento em HSM/KMS.**

### Pós-quântica (o que o Node 26 já oferece)
**Um computador quântico suficientemente grande quebraria RSA, ECDSA e troca de chaves em curvas elípticas** (**algoritmo de Shor**); **a simétrica e os hashes sofrem menos** (**dobrar o tamanho da chave compensa**). **Ameaça imediata: *harvest now, decrypt later*** (**coletar tráfego hoje para decifrar no futuro**). **O NIST padronizou ML-KEM (FIPS 203) e ML-DSA (FIPS 204).** **Medido no Node 26.13.1:**
- **ML-KEM-768:** **chave pública 1.206 B (DER; X25519: 44 B), texto de encapsulamento 1.088 B, segredo 32 B, iguais nos dois lados.**
- **ML-DSA-65:** **assinatura de 3.309 B (contra 64 B do Ed25519).**
**Custo: tamanhos 10–50 vezes maiores.** **Abordagem de transição: híbrida** (**clássica + pós-quântica juntas**, **como já fazem navegadores e TLS**). **Não executado:** **TLS pós-quântico ponta a ponta.**

### Boas práticas de uso
- **Use bibliotecas de alto nível** (**libsodium/NaCl, Tink, age, WebCrypto**); **não componha primitivas se puder evitar.**
- **Prefira AEAD, Ed25519/ECDSA, X25519, SHA-256+.**
- **Gerencie o ciclo de vida das chaves** (**geração, armazenamento, rotação, revogação, destruição**; **aula 3**).
- **Documente o algoritmo e a versão junto do dado cifrado** (**agilidade criptográfica**: **dá para migrar**).
- **Criptografia não substitui controle de acesso**: **proteja os dados em trânsito (TLS), em repouso e, quando fizer sentido, em uso.**

### Executado e não executado
**Executado:** **AES-GCM, adulteração, nonce repetido, ECB, HKDF, Ed25519/ECDSA/RSA/ML-DSA, RSA-OAEP, X25519 híbrido, cadeia de certificados, ML-KEM.** **Não executado:** **ChaCha20-Poly1305, curvas P-384/P-521, CBC e padding oracle, HSM/KMS, TLS completo, OCSP/CRL, criptografia de disco, ataques de canal lateral.**`,
  concepts: [
    { term: 'AEAD', def: 'Cifra autenticada com dados associados, que fornece confidencialidade e integridade (como AES-GCM e ChaCha20-Poly1305).' },
    { term: 'Nonce', def: 'Valor usado uma única vez com a mesma chave; sua repetição quebra a segurança de modos como GCM e CTR.' },
    { term: 'Modo ECB', def: 'Modo de cifra de blocos em que blocos iguais geram saídas iguais, vazando padrões; não deve ser usado.' },
    { term: 'Criptografia híbrida', def: 'Uso de troca de chaves assimétrica para estabelecer uma chave simétrica que cifra os dados.' },
    { term: 'Assinatura digital', def: 'Valor produzido com a chave privada que prova autoria e integridade e é verificado com a chave pública.' },
    { term: 'Certificado X.509', def: 'Documento assinado por uma CA que associa um nome a uma chave pública.' },
    { term: 'ML-KEM', def: 'Mecanismo de encapsulamento de chaves pós-quântico padronizado pelo NIST (FIPS 203).' },
    { term: 'Harvest now, decrypt later', def: 'Estratégia de coletar dados cifrados hoje para decifrá-los quando houver computadores quânticos.' }
  ],
  examples: R`**Analogia:** **a simétrica é uma chave de casa que todos os moradores têm cópia**: **rápida, mas como entregar a cópia sem que alguém a duplique? A assimétrica é uma caixa de correio**: **qualquer um deposita (chave pública), só o dono abre (privada).** **O híbrido é trocar uma chave de casa pela caixa de correio e depois conversar com a chave de casa.** **O certificado é o cartório que atesta que a caixa pertence mesmo a quem diz.**

**Exemplo concreto (medido):** **dois textos cifrados com o mesmo nonce deram §c1 XOR c2 == p1 XOR p2§**; **10 blocos idênticos geraram apenas 1 bloco distinto em ECB**; **um byte alterado na assinatura do certificado derrubou a verificação com "certificate signature failure".**`,
  code: [
    { title: 'AES-256-GCM com AAD (trecho de cifras.mjs)', lang: 'javascript', code: R`const chave = crypto.randomBytes(32), nonce = crypto.randomBytes(12);   // nonce novo a cada mensagem
const c = crypto.createCipheriv('aes-256-gcm', chave, nonce);
c.setAAD(Buffer.from('v1'));                                           // contexto autenticado
const ct = Buffer.concat([c.update(claro), c.final()]), tag = c.getAuthTag();
// guarde/transmita: versão + nonce (12 B) + tag (16 B) + ct

const d = crypto.createDecipheriv('aes-256-gcm', chave, nonce);
d.setAAD(Buffer.from('v1')); d.setAuthTag(tag);
const claroOk = Buffer.concat([d.update(ct), d.final()]);              // lança erro se algo foi alterado`, notes: [{ l: 1, t: 'Nunca repita (chave, nonce).' }, { l: 3, t: 'O AAD também é verificado; mudá-lo faz a decifragem falhar.' }, { l: 9, t: 'final() lança se a etiqueta não confere.' }] },
    { title: 'Troca de chaves híbrida X25519 + HKDF + AES-GCM', lang: 'javascript', code: R`const alice = crypto.generateKeyPairSync('x25519'), bob = crypto.generateKeyPairSync('x25519');
const sa = crypto.diffieHellman({ privateKey: alice.privateKey, publicKey: bob.publicKey });
const sb = crypto.diffieHellman({ privateKey: bob.privateKey, publicKey: alice.publicKey });
// sa e sb são iguais (32 B). Derive a chave da sessão com HKDF:
const k = Buffer.from(crypto.hkdfSync('sha256', sa, Buffer.alloc(0), 'canal-v1', 32));
// e cifre com AES-GCM. As chaves públicas precisam ser autenticadas (assinatura/certificado).`, notes: [{ l: 4, t: 'O rótulo "canal-v1" separa usos da mesma chave.' }, { l: 6, t: 'Sem autenticar as chaves públicas, há risco de intermediário.' }] }
  ],
  bestPractices: ['Use AEAD (AES-GCM ou ChaCha20-Poly1305) e nunca repita o nonce com a mesma chave.', 'Nunca use ECB; não cifre sem autenticar.', 'Gere chaves e nonces com o CSPRNG e derive subchaves com HKDF.', 'Cifre chaves simétricas com a assimétrica, não os dados; evite RSA PKCS#1 v1.5.', 'Prefira Ed25519 ou ECDSA P-256 para assinar e X25519 para trocar chaves.', 'Autentique chaves públicas com certificados e valide cadeia, validade, nome e uso.', 'Use bibliotecas de alto nível e planeje a agilidade criptográfica e a transição pós-quântica híbrida.'],
  mistakes: ['Reutilizar nonce no GCM/CTR.', 'Usar ECB ou cifrar sem autenticação.', 'Usar Math.random() para chaves e tokens.', 'Cifrar dados grandes diretamente com RSA.', 'Confiar em chaves públicas recebidas sem autenticá-las.', 'Inventar o próprio algoritmo ou protocolo.', 'Guardar chaves privadas sem controle de acesso e sem rotação.'],
  market: R`**Saber escolher e usar corretamente as primitivas** (**AEAD, assinatura, troca de chaves, certificados**) **é requisito de segurança de aplicações**; **a pós-quântica é tema crescente em arquitetura e conformidade.**`,
  summary: R`Cifras autenticadas (AES-256-GCM) protegem confidencialidade e integridade: 38 B viraram 38 B mais nonce de 12 B e etiqueta de 16 B, e 1 bit alterado ou AAD diferente derrubou a decifragem. Os erros fatais foram medidos: nonce repetido (c1 XOR c2 == p1 XOR p2) e ECB (1 bloco distinto contra 10). Assinaturas: Ed25519 (44 B, 64 B), ECDSA P-256 (91 B, 72 B), RSA-PSS 2048 (294 B, 256 B) e ML-DSA-65 (1.974 B, 3.309 B). RSA-OAEP cifra no máximo 190 B; a troca X25519 + HKDF + AES-GCM funcionou e certificados autenticam chaves públicas (verificação OK, CA errada, expirado, nome divergente e assinatura adulterada). ML-KEM-768 tem chave pública de 1.206 B. Canais laterais, HSM/KMS e TLS completo não foram executados.`,
  refs: [REF.nodeCrypto, REF.sp80038d, REF.rfc5869, REF.rfc8032, REF.rfc7748, REF.fips203, REF.fips204, REF.opensslVerify, REF.csCryptoStorage],
  cards: [
    { q: 'O que acontece se o nonce for repetido no GCM?', a: 'A segurança quebra: c1 XOR c2 == p1 XOR p2 (medido), vazando relações entre os textos e comprometendo a autenticidade.' },
    { q: 'Por que ECB é inseguro?', a: 'Blocos iguais geram blocos cifrados iguais: 10 blocos idênticos deram 1 bloco cifrado distinto, vazando o padrão dos dados.' },
    { q: 'Por que cifrar uma chave simétrica com RSA em vez dos dados?', a: 'RSA-OAEP 2048 cifra no máximo 190 bytes e é lento; o híbrido usa a assimétrica só para a chave.' },
    { q: 'Qual o custo da pós-quântica medido?', a: 'Tamanho: chave pública ML-KEM-768 de 1.206 B contra 44 B do X25519, e assinatura ML-DSA-65 de 3.309 B contra 64 B do Ed25519.' }
  ]
},
{
  id: 'crip-03', moduleId: 'm2', order: 3, minutes: 90, tags: ['segredos', 'gitleaks', 'histórico git', 'envelope encryption', 'KMS', 'rotação', 'Vault', 'variáveis de ambiente'],
  title: 'Secrets management: onde segredos vazam, como detectá-los e como armazená-los, rotacioná-los e destruí-los',
  objectives: ['Reconhecer onde segredos vazam (código, histórico git, logs, imagens, CI) e por que remover o commit não basta', 'Detectar segredos com regras e entropia e com gitleaks, e interpretar falsos negativos', 'Aplicar envelope encryption, rotação de chaves e crypto shredding', 'Escolher onde guardar segredos (cofres, variáveis, KMS) e seus riscos'],
  intro: R`**Segredo** (**senha, token, chave de API, chave privada, string de conexão**) **é a credencial que o código precisa e que ninguém deve ver.** **A maioria dos vazamentos acontece por descuido**: **um token no repositório que "removemos depois".** **Aqui você prova, num repositório sintético, que o segredo continua no histórico, detecta-o com um scanner próprio e com o gitleaks (v8.30.1) e mede a rotação de chaves com envelope encryption.**`,
  theory: R`### Onde os segredos vazam
**Código-fonte e histórico do git**, **arquivos §.env§ versionados**, **logs e mensagens de erro**, **imagens de contêiner** (**camadas guardam o que foi copiado**), **logs de CI e variáveis impressas**, **tíquetes e chats**, **dumps de memória e de processos**, **backups**, **dispositivos de desenvolvedores** e **repositórios públicos** (**robôs varrem o GitHub em minutos**). **Regra: um segredo exposto deve ser considerado comprometido.**

### A prova: remover não apaga (medido)
**Repositório sintético com 2 commits:** **(1) §app.js§ com um token estilo GitHub (gerado aleatoriamente) e §.env§ com uma senha de banco**; **(2) commit que "remove os segredos" (usa §process.env§ e ignora §.env§).**
- **§git show HEAD~1:app.js§ ainda mostra o token (1 linha).**
- **Varredura da árvore atual (scanner próprio): 0 achados.**
- **Varredura do histórico (§git log -p --all§): 6 achados** (**2 segredos: cada um aparece adicionado e removido no diff, e o token casa com duas regras**).
- **gitleaks v8.30.1 no histórico: 2 achados** (**§generic-api-key§ em §.env§ e §github-pat§ em §app.js§); **com §--no-git§ (só a árvore): 0 achados.**
**Lições:** (1) **varrer só o estado atual perde o que ficou no histórico**; (2) **a correção real é REVOGAR/ROTACIONAR o segredo**; **só depois, se necessário, reescrever o histórico** (§git filter-repo§ ou BFG: **não executado**; **exige *force push* e que todos refaçam os clones, e não alcança *forks*, caches e clones alheios**); (3) **repositórios públicos: assuma que já foi copiado.**

### Detecção: regras + entropia (e suas falhas)
**O scanner didático do laboratório combina:** **regras por padrão** (**chave de acesso AWS, token GitHub, cabeçalho de chave privada**) **e uma regra genérica** (**atribuição de §password§, §secret§, §token§, §api_key§**) **filtrada por entropia de Shannon** (**≥ 3,5 bits/caractere**), **para descartar valores óbvios** (**§changeme§, §exemplo§, §process.env§**). **Medido:** **o token tem entropia ≈ 4,7; a senha aleatória ≈ 4,1.**
**Achado de qualidade (falso negativo):** **a primeira versão da regra usava §\b§ antes de §password§ e NÃO pegou §DB_PASSWORD=...§** (**o sublinhado é caractere de palavra, então não há fronteira**): **só 2 achados em vez de 6.** **Corrigida com prefixo §[A-Za-z0-9_]*§ e testada.** **Moral: scanners têm falsos negativos e falsos positivos; teste as regras com casos reais e use mais de uma ferramenta.**
**Ferramentas reais:** **gitleaks**, **TruffleHog**, **detect-secrets** e **GitHub secret scanning com *push protection*** (**bloqueia o push com segredos conhecidos**; **disponibilidade por plano**). **Onde rodar:** ***pre-commit* no computador, **CI em cada pull request** e **varredura periódica do histórico completo.** **Atenção:** **chaves de exemplo da documentação (como as da AWS) costumam estar em listas de exceção**: **teste com tokens sintéticos válidos no formato.**

### Prevenção
1. **Não ponha segredos no código**: **leia de variáveis de ambiente, arquivos montados ou de um cofre.**
2. **§.gitignore§ para §.env§**, **com um §.env.example§ sem valores reais.**
3. **Credenciais de curta duração** (**OIDC no CI, curso C6.2; papéis e identidades gerenciadas na nuvem, C6.4**) **em vez de chaves de longa duração.**
4. **Menor privilégio e escopo mínimo** **em cada token** (**um token por finalidade**).
5. **Detecção automática** (**pre-commit, CI, push protection**).
6. **Rotação periódica e imediata após suspeita.**
7. **Auditoria de acesso** (**quem leu qual segredo e quando**).

### Onde guardar e entregar
| Opção | Pontos fortes | Cuidados |
|---|---|---|
| **Variáveis de ambiente** | **simples; padrão 12-factor** | **visíveis a quem acessa o processo (§/proc§, dumps), herdadas por processos filhos, aparecem em logs e §docker inspect§** |
| **Arquivos montados (secrets de contêiner/orquestrador)** | **permissões de arquivo; atualizáveis** | **o Secret do Kubernetes é só Base64, não criptografia, a menos que se ative criptografia em repouso e RBAC rígido (curso C6.1)** |
| **Cofres (Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)** | **controle de acesso, auditoria, rotação, segredos dinâmicos** | **configuração e dependência operacional; protegem o acesso ao cofre (identidade)** |
| **SOPS/sealed secrets** | **segredos criptografados no repositório (GitOps)** | **gestão da chave de cifra (KMS)** |
| **KMS/HSM** | **chaves nunca saem; cifra/assina por API** | **custo e latência; políticas de acesso** |
**Não executado:** **cofres, KMS, HSM e SOPS reais.**

### Envelope encryption e rotação (medido)
**Em vez de cifrar tudo com uma chave mestra, cada registro tem sua DEK** (***data encryption key***) **e a DEK é "embrulhada" (cifrada) pela KEK** (***key encryption key***, **que fica no KMS e nunca sai**). **Benefícios:** **rotacionar a KEK = reembrulhar as DEKs, sem tocar nos dados**; **o dado cifrado é inalterado (medido: o hash do conjunto de dados cifrados permaneceu igual)**; **o KMS vê só chaves pequenas.**
**Medido (modelo local):**
| Cenário | Reembrulhar DEKs | Decifrar e recifrar tudo | Vantagem |
|---|---|---|---|
| **10.000 registros × 1 KiB** | **768 ms** | **1.087 ms** | **1,4×** |
| **200 registros × 1 MiB** | **63 ms** | **992 ms** | **15,9×** |
**Leitura:** **o ganho cresce com o tamanho dos dados**, **pois o reembrulho só mexe em ~60 bytes por registro.** **Após a rotação os dados decifram com a KEK nova.**
**Crypto shredding:** **destruir a KEK torna ilegíveis todos os dados que dependiam dela** (**medido: a DEK não pôde mais ser desembrulhada**). **Útil para "apagar" dados em backups, e relevante ao direito de eliminação (aula de LGPD).** **Planeje a retenção de versões antigas da KEK para decifrar dados antigos até migrá-los.**

### Procedimento de resposta a um vazamento
1. **Revogar/rotacionar imediatamente** (**e criar um novo segredo com escopo mínimo**).
2. **Avaliar o uso indevido** (**logs de acesso do provedor desde a exposição**).
3. **Remover do código e, se justificável, do histórico.**
4. **Corrigir a causa** (**scanner no CI, push protection, treinamento**).
5. **Comunicar** (**incidente; LGPD quando houver dados pessoais**).
6. **Documentar o aprendizado** (**postmortem sem culpa**).

### Executado e não executado
**Executado:** **repositório sintético com segredo no histórico, scanner próprio, gitleaks v8.30.1, envelope encryption, rotação e crypto shredding.** **Não executado:** **reescrita de histórico, Vault/KMS/HSM reais, push protection, TruffleHog, secrets do Kubernetes em produção, rotação automática de segredos dinâmicos.**`,
  concepts: [
    { term: 'Segredo', def: 'Credencial ou chave cuja revelação compromete um sistema: senhas, tokens, chaves de API, chaves privadas.' },
    { term: 'Envelope encryption', def: 'Técnica em que dados são cifrados por chaves de dados (DEK) que, por sua vez, são cifradas por uma chave mestra (KEK).' },
    { term: 'KEK', def: 'Chave de cifra de chaves, que protege as chaves de dados e fica em um KMS ou HSM.' },
    { term: 'Crypto shredding', def: 'Tornar dados irrecuperáveis destruindo a chave que os cifra.' },
    { term: 'Rotação de chaves', def: 'Substituição periódica ou sob demanda de chaves e segredos por novos valores.' },
    { term: 'Push protection', def: 'Bloqueio de um push que contém segredos reconhecidos, feito pelo provedor de código.' },
    { term: 'Entropia de Shannon', def: 'Medida da imprevisibilidade de uma sequência, usada para identificar strings aleatórias como segredos.' },
    { term: 'Segredo dinâmico', def: 'Credencial gerada sob demanda, com tempo de vida curto, por um cofre.' }
  ],
  examples: R`**Analogia:** **o segredo no commit é a chave de casa deixada embaixo do capacho e depois "tirada de lá"**: **quem tirou foto do capacho antes ainda sabe onde estava e talvez tenha copiado a chave.** **A única solução é trocar a fechadura (revogar/rotacionar).** **Envelope encryption é guardar cada pertence em um cofrinho com chave própria e trancar todas as chaves em um cofre central**: **trocar a chave do cofre central não exige abrir os cofrinhos.**

**Exemplo concreto (medido):** **depois do commit que "removeu" os segredos, a varredura da árvore deu 0 achados, mas o gitleaks no histórico deu 2 (§generic-api-key§ e §github-pat§)**; **e a rotação da KEK de 200 registros de 1 MiB levou 63 ms contra 992 ms recifrando tudo.**`,
  code: [
    { title: 'Scanner didático de segredos: regras + entropia (scanner.mjs, trecho)', lang: 'javascript', code: R`export const REGRAS = [
  { id: 'github-token', re: /\bgh[pousr]_[A-Za-z0-9]{36}\b/g },
  { id: 'aws-access-key-id', re: /\b(AKIA|ASIA)[A-Z2-7]{16}\b/g },
  // prefixo [A-Za-z0-9_]* é essencial: sem ele DB_PASSWORD não casa (o "_" não é fronteira de palavra)
  { id: 'atribuicao-generica', re: /\b[A-Za-z0-9_]*(?:api[_-]?key|secret|token|password|passwd|senha)[A-Za-z0-9_]*\s*[:=]\s*["']?([A-Za-z0-9\/+_\-=.]{12,})["']?/gi, grupo: 1 }
];
export const entropia = (s) => { const f = {}; for (const c of s) f[c] = (f[c] || 0) + 1; return -Object.values(f).reduce((a, n) => a + (n / s.length) * Math.log2(n / s.length), 0); };
// ignora valores de baixa entropia ou placeholders: entropia(v) < 3.5 || /exemplo|changeme|process\.env/i.test(linha)`, notes: [{ l: 3, t: 'A primeira versão não achou DB_PASSWORD por causa do \\b.' }, { l: 6, t: 'Entropia de Shannon em bits por caractere.' }] },
    { title: 'Envelope encryption: reembrulhar a DEK na rotação (envelope.mjs, trecho)', lang: 'javascript', code: R`const embrulhar = (dek) => ({ ver: kms.atual, blob: gcm(kms.kek[kms.atual], dek) });
const desembrulhar = (w) => ungcm(kms.kek[w.ver], w.blob);

// rotação: só as DEKs (≈ 60 bytes cada) são reembrulhadas; os dados cifrados não mudam
kms.kek.v2 = crypto.randomBytes(32);
for (const r of registros) { const dek = desembrulhar(r.chaveEmbrulhada); kms.atual = 'v2'; r.chaveEmbrulhada = embrulhar(dek); kms.atual = 'v1'; }
kms.atual = 'v2';
delete kms.kek.v1; delete kms.kek.v2;   // crypto shredding: sem a KEK, as DEKs não abrem`, notes: [{ l: 2, t: 'A versão da KEK vai junto da DEK embrulhada.' }, { l: 5, t: 'Os dados (r.dado) não são tocados.' }] }
  ],
  bestPractices: ['Nunca versione segredos; use variáveis, arquivos montados ou cofres e mantenha .env no .gitignore.', 'Trate segredo exposto como comprometido: revogue e rotacione primeiro.', 'Varra o histórico completo e o estado atual, com pre-commit, CI e push protection.', 'Use credenciais de curta duração e menor privilégio por finalidade.', 'Use envelope encryption com KMS e planeje a rotação e a retenção de versões da KEK.', 'Lembre que Secrets do Kubernetes são Base64: ative criptografia em repouso e RBAC.', 'Audite o acesso e tenha um procedimento de resposta.'],
  mistakes: ['Achar que remover o segredo do último commit resolve.', 'Varrer apenas o working tree.', 'Confiar em uma única ferramenta de varredura.', 'Segredos em imagens de contêiner e logs de CI.', 'Tokens com escopo amplo e sem expiração.', 'Rotação adiada porque "ninguém viu".', 'Cifrar tudo com uma única chave sem plano de rotação.'],
  market: R`**Gestão de segredos** **é tema central de DevSecOps**; **perguntas sobre "o que fazer quando um token vaza no git" e sobre envelope encryption** **são comuns em entrevistas de segurança e nuvem.**`,
  summary: R`Segredos vazam por código, histórico git, logs, imagens e CI; remover o segredo do último commit não basta: no repositório sintético o token continuou no primeiro commit, o scanner próprio deu 0 achados na árvore e 6 no histórico, e o gitleaks v8.30.1 deu 2 achados no histórico e 0 na árvore. A primeira versão do scanner perdeu DB_PASSWORD por causa de uma fronteira de palavra, mostrando falsos negativos. A correção real é revogar e rotacionar, com prevenção por cofres, credenciais de curta duração, pre-commit e push protection. Envelope encryption (DEK e KEK) permite rotacionar sem recifrar dados: 63 ms contra 992 ms em 200 x 1 MiB (15,9x) e 768 ms contra 1.087 ms em 10.000 x 1 KiB (1,4x); destruir a KEK torna os dados ilegíveis. Cofres, KMS, HSM e reescrita de histórico não foram executados.`,
  refs: [REF.csSecrets, REF.gitleaks, REF.ghSecretScan, REF.vaultDocs, REF.k8sSecretsGood, REF.csCryptoStorage],
  cards: [
    { q: 'Por que remover o segredo do último commit não resolve?', a: 'O segredo continua no histórico (git show HEAD~1) e pode ter sido copiado; é preciso revogar e rotacionar.' },
    { q: 'O que mostrou a diferença entre varrer a árvore e o histórico?', a: 'A árvore atual deu 0 achados; o histórico, 6 no scanner próprio e 2 no gitleaks.' },
    { q: 'Qual a vantagem do envelope encryption na rotação?', a: 'Rotaciona-se a KEK reembrulhando só as DEKs, sem recifrar os dados (200 x 1 MiB: 63 ms contra 992 ms).' },
    { q: 'O Secret do Kubernetes é criptografado?', a: 'Por padrão é apenas Base64; ative criptografia em repouso, RBAC rígido e considere cofres ou SOPS.' }
  ]
}
];
