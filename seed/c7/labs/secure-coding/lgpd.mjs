// Laboratório C7.4 (parte 4): privacidade por design para desenvolvedores. 100% dados sintéticos (gerador determinístico). Não é aconselhamento jurídico.
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
const prng = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rnd = prng(2026);
const digitoCpf = (d) => { let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * (d.length + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
export const cpfDe = (base9) => { const d = String(base9).padStart(9, '0').split('').map(Number); const a = digitoCpf(d), b = digitoCpf([...d, a]); return d.join('') + a + b; };
export const cpfValido = (c) => { const s = String(c).replace(/\D/g, ''); if (s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false; return cpfDe(s.slice(0, 9)) === s; };
export const mascararCpf = (c) => { const s = String(c).replace(/\D/g, ''); return s.slice(0, 3) + '.***.***-' + s.slice(9); };

console.log('== 1. CPF: validação e mascaramento');
const exemplo = cpfDe(123456789); console.log('CPF sintético:', exemplo, '| válido:', cpfValido(exemplo), '| alterado válido:', cpfValido(exemplo.slice(0, 10) + (exemplo[10] === '0' ? '1' : '0')), '| mascarado para logs:', mascararCpf(exemplo));

console.log('\n== 2. Pseudonimização: SHA-256 sem chave x HMAC com chave (CPF tem só 10^9 possibilidades)');
const alvo = cpfDe(123456789), hAlvo = crypto.createHash('sha256').update(alvo).digest('hex');
const chave = crypto.randomBytes(32), token = crypto.createHmac('sha256', chave).update(alvo).digest('hex');
let t0 = performance.now(), achou = null, n = 0;
for (let i = 123000000; i < 124000000 && !achou; i++) { n++; const c = cpfDe(i); if (crypto.hash('sha256', c) === hAlvo) achou = c; }   // espaço de 10^6 (os 3 primeiros dígitos já conhecidos)
const dt = performance.now() - t0; const taxa = n / (dt / 1000);
console.log(`hash simples: CPF recuperado = ${achou === alvo} após ${n} tentativas em ${dt.toFixed(0)} ms (${(taxa / 1000).toFixed(0)} mil/s, com o cálculo do dígito verificador, em Node)`);
console.log(`extrapolação para TODO o espaço de 10^9 CPFs: ≈ ${(1e9 / taxa / 60).toFixed(0)} min em 1 núcleo, sem salt (GPUs são ordens de grandeza mais rápidas; não medido aqui)`);
let acharam = 0; for (let i = 123000000; i < 123050000; i++) { if (crypto.createHmac('sha256', crypto.randomBytes(32)).update(cpfDe(i)).digest('hex') === token) acharam++; }
console.log(`HMAC com chave secreta: o atacante sem a chave não consegue validar candidatos (50.000 tentativas com chaves aleatórias: ${acharam} acertos); o controlador, com a chave, gera o mesmo token para o mesmo CPF: ${crypto.createHmac('sha256', chave).update(alvo).digest('hex') === token}`);

console.log('\n== 3. k-anonimato em um conjunto sintético de 2.000 pessoas');
const faixaCep = ['01', '02', '03', '04', '05', '20', '21', '22', '30', '31', '40', '41', '50', '51', '60', '70', '80', '81', '90', '91'];
const diag = ['hipertensão', 'diabetes', 'asma', 'depressão', 'nenhum', 'cardiopatia'];
const pessoas = Array.from({ length: 2000 }, (_, i) => ({ id: i, idade: 18 + Math.floor(rnd() * 63), cep: faixaCep[Math.floor(rnd() * faixaCep.length)] + String(Math.floor(rnd() * 1000)).padStart(3, '0'), sexo: rnd() < 0.5 ? 'F' : 'M', diagnostico: diag[Math.floor(rnd() * diag.length)] }));
const classes = (lista, qid) => { const m = new Map(); for (const p of lista) { const k = qid(p); m.set(k, (m.get(k) || 0) + 1); } return m; };
const resumo = (m) => ({ k: Math.min(...m.values()), unicos: [...m.values()].filter((v) => v === 1).length, classes: m.size });
const antes = resumo(classes(pessoas, (p) => `${p.idade}|${p.cep}|${p.sexo}`));
console.log(`quase-identificadores (idade, CEP completo, sexo): k mínimo = ${antes.k}; ${antes.unicos} de ${pessoas.length} pessoas são ÚNICAS (reidentificáveis combinando as 3 informações); ${antes.classes} classes`);
const gen = (p) => `${Math.floor(p.idade / 10) * 10}s|${p.cep.slice(0, 2)}|${p.sexo}`;
const mg = classes(pessoas, gen); const dep = resumo(mg);
console.log(`generalizando (faixa de 10 anos, 2 primeiros dígitos do CEP, sexo): k mínimo = ${dep.k}; únicos = ${dep.unicos}; ${dep.classes} classes`);
const pequenas = [...mg.values()].filter((v) => v < 5).reduce((a, b) => a + b, 0);
console.log(`para k ≥ 5: ${pequenas} registros em classes menores que 5 seriam suprimidos (${((pequenas / pessoas.length) * 100).toFixed(1)}% dos dados)`);
console.log('limite: k-anonimato não impede inferência por atributo (todos de uma classe podem ter o mesmo diagnóstico): checar diversidade (l-diversidade)');
const divMin = Math.min(...[...new Set(pessoas.map(gen))].map((c) => new Set(pessoas.filter((p) => gen(p) === c).map((p) => p.diagnostico)).size));
console.log('menor número de diagnósticos distintos por classe generalizada:', divMin);

console.log('\n== 4. Minimização: campos sem finalidade declarada');
const esquema = { nome: ['cadastro'], cpf: ['nota fiscal'], email: ['cadastro', 'comunicação'], data_nascimento: [], diagnostico: ['atendimento'], localizacao_gps: [], cor_favorita: [] };
const sensiveis = new Set(['diagnostico', 'biometria', 'religiao', 'orientacao_sexual']);
const sem = Object.keys(esquema).filter((c) => !esquema[c].length), sens = Object.keys(esquema).filter((c) => sensiveis.has(c));
console.log('campos sem finalidade (candidatos a remover ou justificar):', sem.join(', '));
console.log('campos sensíveis (exigem hipótese do art. 11 e cuidado reforçado):', sens.join(', '));

console.log('\n== 5. Retenção e direitos do titular (modelo)');
const hoje = new Date('2026-11-26T00:00:00Z'), dias = (n) => new Date(hoje.getTime() - n * 86400000);
const base = [{ id: 1, tipo: 'carrinho', criado: dias(400) }, { id: 2, tipo: 'carrinho', criado: dias(10) }, { id: 3, tipo: 'log-acesso', criado: dias(200) }, { id: 4, tipo: 'log-acesso', criado: dias(100) }, { id: 5, tipo: 'nota-fiscal', criado: dias(900) }];
const retencaoDias = { carrinho: 90, 'log-acesso': 180, 'nota-fiscal': 1825 };
const expurgar = (lista) => lista.filter((r) => (hoje - r.criado) / 86400000 > retencaoDias[r.tipo]).map((r) => r.id);
console.log('política (dias): carrinho 90, log-acesso 180, nota-fiscal 1825 (exemplo; prazos reais dependem de lei e finalidade)');
console.log('registros vencidos a eliminar:', JSON.stringify(expurgar(base)));
const stores = { cadastro: [{ titular: 'T1', nome: 'Pessoa 1' }, { titular: 'T2', nome: 'Pessoa 2' }], pedidos: [{ titular: 'T1', item: 'x', obrigacaoLegal: true }, { titular: 'T1', item: 'y', obrigacaoLegal: false }], marketing: [{ titular: 'T1', email: 't1@exemplo.test' }], logs: [{ titular: 'T1', ip: '192.0.2.10' }] };
const exportar = (id) => Object.fromEntries(Object.entries(stores).map(([k, v]) => [k, v.filter((r) => r.titular === id)]));
const eliminar = (id) => { const rel = {}; for (const [k, v] of Object.entries(stores)) { const mant = v.filter((r) => r.titular === id && r.obrigacaoLegal), rem = v.filter((r) => r.titular === id && !r.obrigacaoLegal).length; stores[k] = v.filter((r) => r.titular !== id || r.obrigacaoLegal); rel[k] = { removidos: rem, mantidosPorObrigacaoLegal: mant.length }; } return rel; };
console.log('exportação (acesso/portabilidade) do titular T1: registros por fonte', JSON.stringify(Object.fromEntries(Object.entries(exportar('T1')).map(([k, v]) => [k, v.length]))));
console.log('eliminação do titular T1:', JSON.stringify(eliminar('T1')));
console.log('estado depois:', JSON.stringify(Object.fromEntries(Object.entries(stores).map(([k, v]) => [k, v.length]))), '(backups e terceiros também precisam ser tratados: não modelado)');
