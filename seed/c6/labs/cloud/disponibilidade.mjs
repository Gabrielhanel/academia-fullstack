// Modelo de disponibilidade: tempo de indisponibilidade por SLA e composição serial/paralela.
const MIN_MES = 30 * 24 * 60;
const indisp = (pct) => +(MIN_MES * (1 - pct / 100)).toFixed(2);
console.log('Indisponibilidade permitida em 30 dias (minutos):');
for (const s of [99, 99.5, 99.9, 99.95, 99.99, 99.999]) console.log(`  ${s}% -> ${indisp(s)} min`);
const serie = (...a) => a.reduce((x, y) => x * y, 1);
const paralelo = (...a) => 1 - a.reduce((x, y) => x * (1 - y), 1);
const f = (x) => +(x * 100).toFixed(7);
console.log('Composição (disponibilidades hipotéticas):');
console.log('  serial 99,9% x 99,9% x 99,95% (app, banco, balanceador):', f(serie(0.999, 0.999, 0.9995)) + '%');
console.log('  paralelo 2 instâncias de 99,9% (independentes):', f(paralelo(0.999, 0.999)) + '%');
console.log('  paralelo 3 instâncias de 99,9% (independentes):', f(paralelo(0.999, 0.999, 0.999)) + '%');
console.log('  2 instâncias (99,9%) em paralelo, seguidas de banco 99,95% em série:', f(serie(paralelo(0.999, 0.999), 0.9995)) + '%');
