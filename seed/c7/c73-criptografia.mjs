// Curso C7.3 da C7: Criptografia, hashing e segredos (disciplina: crypto).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c73-a.mjs';
import { exsets, assessment, project } from './c73-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA]);
const ex = dolar(exsets);

export const TOPICS = ['Hashing', 'Criptografia simétrica e assimétrica', 'Secrets management'];
export const COVER = { 'Hashing': ['crip-01'], 'Criptografia simétrica e assimétrica': ['crip-02'], 'Secrets management': ['crip-03'] };

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'CSPRNG', def: 'Gerador de números pseudoaleatórios criptograficamente seguro, como crypto.randomBytes.' },
  { term: 'KDF', def: 'Função de derivação de chaves, como HKDF, scrypt e Argon2id.' },
  { term: 'PKI', def: 'Infraestrutura de chaves públicas: CAs, certificados, revogação e políticas de confiança.' },
  { term: 'Sigilo futuro', def: 'Propriedade em que o comprometimento de chaves de longo prazo não permite decifrar sessões passadas.' },
  { term: 'Agilidade criptográfica', def: 'Capacidade de trocar algoritmos e parâmetros sem reescrever o sistema.' },
  { term: 'Padding oracle', def: 'Ataque que explora diferenças nas respostas de validação de preenchimento para decifrar dados.' },
  { term: 'HSM', def: 'Módulo de segurança de hardware que guarda chaves e executa operações criptográficas sem expô-las.' },
  { term: 'Rainbow table', def: 'Tabela pré-calculada de hashes usada para reverter hashes sem salt.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'crypto', disciplineId: 'crypto', areaId: 'sec', requires: [],
  title: 'Criptografia, hashing e segredos: senhas, cifras autenticadas, assinaturas, certificados e gestão de segredos',
  description: 'Usar criptografia corretamente e gerenciar segredos, com experimentos executados (Node 26.13.1, OpenSSL 3.5.x, gitleaks 8.30.1; dados sintéticos): hashing (avalanche de 49,9%; SHA-256 simples ≈ 713 mil/s contra scrypt padrão 157 ms, scrypt 2^17 1,44 s, PBKDF2 600.000 1,19 s e Argon2id 139 ms, razão ≈ 10⁵; sem salt 3/3 senhas em 0,2 ms contra 157,6 ms por tentativa com salt); cifras e assinaturas (AES-256-GCM e adulteração, nonce repetido c1 XOR c2 == p1 XOR p2, ECB 1 bloco contra 10, Ed25519/ECDSA/RSA-PSS/ML-DSA com tamanhos e taxas, X25519 híbrido, ML-KEM-768, cadeia de certificados com OpenSSL); e segredos (token que permanece no histórico git, scanner próprio com falso negativo corrigido, gitleaks 2 achados no histórico e 0 na árvore, envelope encryption com rotação 15,9x mais rápida em 1 MiB). Projeto: cofre de segredos. KMS/HSM, bcrypt, GPUs, TLS completo, reescrita de histórico e cofres reais não foram executados.',
  objectives: ['Distinguir hash, criptografia e codificação e escolher hash de senhas com parâmetros adequados', 'Usar AEAD, assinaturas e troca de chaves corretamente e evitar nonce repetido e ECB', 'Validar certificados e entender o papel das cadeias de confiança', 'Detectar, prevenir e responder a vazamentos de segredos', 'Aplicar envelope encryption, rotação e destruição de chaves'],
  level: 'M', prereqs: ['OWASP e vulnerabilidades web (C7.1 e C7.2)', 'Node.js 24.7 ou superior para crypto.argon2 (o curso usa 26.13.1)', 'Git básico'], hours: 5,
  syllabus: 'Hashing e senhas; criptografia simétrica e assimétrica; secrets management; projeto de cofre de segredos.',
  versions: 'Node.js 26.13.1 (node:crypto com OpenSSL 3.5.9 embutido), OpenSSL 3.5.5 do host, git 2.53.0, Docker 29.9.3 com zricethezav/gitleaks v8.30.1, em 2026-11-26 (laboratório em seed/c7/labs/criptografia/). Máquina de 8 núcleos sob carga: valores absolutos variam, as razões importam. Parâmetros conferidos no OWASP Password Storage Cheat Sheet. Achados: scrypt padrão do Node abaixo do mínimo do OWASP; a primeira versão do scanner perdeu DB_PASSWORD; uma primeira chamada do gitleaks com --report-path /dev/stdout devolveu relatório vazio. Os desafios de código são em JavaScript e modelam a lógica. Não executados: KMS/HSM, Vault, bcrypt, GPUs, TLS completo com OCSP/CRL, canais laterais, reescrita de histórico (git filter-repo/BFG), push protection, TruffleHog.',
  skills: ['Hash de senhas', 'Cifras autenticadas', 'Assinaturas e certificados', 'Troca de chaves', 'Gestão de segredos', 'Envelope encryption'],
  modules: [
    { id: 'm1', title: 'Hashing e criptografia', lessons: ['crip-01', 'crip-02'] },
    { id: 'm2', title: 'Segredos', lessons: ['crip-03'] }
  ],
  materials: [REF.csPassword, REF.nodeCrypto, REF.csSecrets, REF.gitleaks].map((r) => ({ ...r })),
  projectIds: ['cofre-de-segredos'],
  supplement: {
    glossary,
    cheatsheet: R`### Hash e senhas
Hash ≠ criptografia ≠ Base64 · MD5/SHA-1 quebrados · SHA-2/SHA-3/BLAKE2 · senhas: Argon2id (19 MiB, t=2, p=1), scrypt N=2^17, bcrypt custo ≥ 10, PBKDF2-SHA256 ≥ 600.000 · salt único por senha · parâmetros no hash · rehash on login · 100–500 ms por hash · HMAC + timingSafeEqual

### Cifras
AEAD (AES-256-GCM, ChaCha20-Poly1305) · nonce único (96 bits) nunca repetido · AAD · nunca ECB · HKDF para subchaves · CSPRNG (crypto.randomBytes), nunca Math.random

### Assimétrica
Ed25519/ECDSA para assinar · X25519 para trocar chaves · híbrido: X25519 + HKDF + AES-GCM · RSA-OAEP só para chaves (≤ 190 B em 2048) · autenticar chaves públicas com certificados (cadeia, validade, nome, uso) · pós-quântica: ML-KEM (FIPS 203), ML-DSA (FIPS 204), em modo híbrido

### Segredos
Fora do código; .env no .gitignore · exposto = comprometido: revogar e rotacionar primeiro · varrer histórico e árvore (pre-commit, CI, push protection) · credenciais de curta duração e menor privilégio · cofres/KMS · Secrets do Kubernetes são Base64 · envelope encryption: DEK por registro, KEK no KMS, rotação reembrulha DEKs, destruir KEK = crypto shredding`,
    mistakes: ['Guardar senhas com SHA-256 ou MD5.', 'Salt ausente ou repetido.', 'Reutilizar nonce no GCM e usar ECB.', 'Cifrar sem autenticar.', 'Usar Math.random para segredos.', 'Confiar em chaves públicas sem autenticar.', 'Achar que remover o segredo do último commit resolve.', 'Varrer só a árvore atual e confiar em uma única ferramenta.'],
    prereqMap: R`**Antes deste curso:** OWASP e vulnerabilidades web (C7.1 e C7.2).

| Este curso prepara para | Por quê |
|---|---|
| Secure coding e LGPD (C7.4) | proteção de dados pessoais, pseudonimização e retenção |
| Arquitetura (C8) | segurança entre serviços, chaves e segredos |
| Cloud e IaC (C6) | KMS, cofres e credenciais efêmeras |

Ordem interna: hashing → criptografia simétrica e assimétrica → segredos → projeto.`,
    officialRefs: [REF.nodeCrypto, REF.csPassword, REF.csCryptoStorage, REF.csSecrets, REF.nist63b, REF.fips180, REF.fips203, REF.fips204, REF.sp80038d, REF.rfc9106, REF.rfc7914, REF.rfc2104, REF.rfc5869, REF.rfc8032, REF.rfc7748, REF.shattered, REF.gitleaks, REF.ghSecretScan, REF.opensslVerify, REF.vaultDocs, REF.k8sSecretsGood],
    practice: ['Meça o custo por tentativa de scrypt, PBKDF2 e Argon2id na sua máquina e calibre.', 'Reproduza o nonce repetido e o ECB e explique o que vaza.', 'Gere uma cadeia de certificados e provoque cada erro de verificação.', 'Faça um repositório sintético, remova o segredo e varra o histórico.', 'Implemente envelope encryption e rotacione a KEK.', 'Faça o projeto integrador: cofre de segredos.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
