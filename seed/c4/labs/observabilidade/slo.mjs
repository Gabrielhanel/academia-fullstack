// Cálculo e SIMULAÇÃO determinística (não é medição de um sistema real): orçamento de erro, burn rate e alertas.
const slo = 0.999, janelaDias = 30; const orcamento = 1 - slo;
const minutosJanela = janelaDias * 24 * 60;
console.log('== 1. orçamento de erro (cálculo)');
for (const s of [0.99, 0.995, 0.999, 0.9999]) console.log('SLO', (s * 100).toFixed(2) + '%', '→ indisponibilidade permitida em 30 dias:', ((1 - s) * minutosJanela).toFixed(1), 'min (' + ((1 - s) * minutosJanela / 60).toFixed(2) + ' h)');
console.log('\n== 2. burn rate = taxa de erro observada ÷ taxa de erro permitida (SLO 99,9% → 0,1%)');
for (const taxa of [0.0005, 0.001, 0.01, 0.0144, 0.05]) { const br = taxa / orcamento; console.log('taxa de erro', (taxa * 100).toFixed(2) + '%', '→ burn rate', br.toFixed(1) + 'x', '→ esgota o orçamento de 30 dias em', (janelaDias / br).toFixed(1), 'dias'); }
console.log('burn rate 14,4x durante 1 h consome', (14.4 * 1 / (janelaDias * 24) * 100).toFixed(1) + '% do orçamento mensal (cálculo: 14,4 × 1 h ÷ 720 h)');

console.log('\n== 3. simulação: 3 horas de tráfego (300 req/min); taxa de erro por minuto');
const R = 300; const taxaNoMinuto = (m) => { if (m >= 30 && m < 33) return 0.20; if (m >= 90 && m < 140) return 0.02; return 0.0005; };
const erros = Array.from({ length: 180 }, (_, m) => Math.round(R * taxaNoMinuto(m)));
const razao = (m, janela) => { let e = 0, t = 0; for (let i = Math.max(0, m - janela + 1); i <= m; i++) { e += erros[i]; t += R; } return e / t; };
const alertas = { 'limiar fixo (erro > 1% em 5 min)': (m) => razao(m, 5) > 0.01, 'burn rate 14,4x (1 h) E (5 min)': (m) => razao(m, 60) / orcamento > 14.4 && razao(m, 5) / orcamento > 14.4, 'burn rate 6x (3 h) E (30 min)': (m) => razao(m, 180) / orcamento > 6 && razao(m, 30) / orcamento > 6, 'burn rate 6x (1 h) E (5 min)': (m) => razao(m, 60) / orcamento > 6 && razao(m, 5) / orcamento > 6 };
for (const [nome, f] of Object.entries(alertas)) { const disparos = []; let ativo = false; for (let m = 0; m < 180; m++) { const a = f(m); if (a && !ativo) disparos.push(m); ativo = a; } console.log(nome.padEnd(36), 'disparou nos minutos:', disparos.length ? disparos.join(', ') : 'nunca'); }
const total = erros.reduce((a, b) => a + b, 0), reqs = R * 180;
console.log('\nSLI de disponibilidade nas 3 h:', ((1 - total / reqs) * 100).toFixed(3) + '%', '| erros:', total, 'de', reqs, '| orçamento mensal total:', Math.round(orcamento * R * minutosJanela), 'erros (se o tráfego se mantivesse) → consumido nestas 3 h:', (total / (orcamento * R * minutosJanela) * 100).toFixed(1) + '%');
console.log('incidente A: minutos 30-32 (20% de erros por 3 min) | incidente B: minutos 90-139 (2% por 50 min)');
