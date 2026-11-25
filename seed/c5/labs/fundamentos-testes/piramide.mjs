// Executa cada camada de testes separadamente e mede quantidade e duração (processo isolado por camada).
import { spawnSync } from 'node:child_process';
const camadas = [['unitários', ['test/unitarios.test.mjs']], ['mocks do serviço', ['test/servico.mock.test.mjs']], ['integração (SQLite)', ['test/repositorio.integracao.test.mjs']], ['integração (HTTP+SQLite)', ['test/api.integracao.test.mjs']], ['E2E (Chrome)', ['test/e2e.test.mjs']]];
console.log('camada'.padEnd(28), 'testes'.padStart(7), 'duração (ms)'.padStart(14), 'ms por teste'.padStart(14));
for (const [nome, arqs] of camadas) {
  const r = spawnSync(process.execPath, ['--test', ...arqs], { encoding: 'utf8' });
  const n = Number(/ℹ tests (\d+)/.exec(r.stdout)[1]); const d = Number(/ℹ duration_ms ([\d.]+)/.exec(r.stdout)[1]);
  console.log(nome.padEnd(28), String(n).padStart(7), d.toFixed(0).padStart(14), (d / n).toFixed(1).padStart(14), r.status === 0 ? '' : ' FALHOU');
}
