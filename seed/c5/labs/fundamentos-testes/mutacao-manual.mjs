// Mutação manual: aplica pequenas alterações ao código de produção e verifica se a suíte (sem E2E) as detecta.
import { cpSync, mkdtempSync, readFileSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const comExtras = process.argv.includes('--com-extras');
const mutantes = [
  ['dominio.mjs', 'Math.min(Math.max(desconto, 0), 1)', 'desconto', 'sem limitar o desconto entre 0 e 1'],
  ['dominio.mjs', "hoje > r.ate", "hoje >= r.ate", 'cupom expira no próprio último dia'],
  ['dominio.mjs', 'i.qtd < 1', 'i.qtd < 0', 'aceita quantidade 0'],
  ['dominio.mjs', 'i.preco < 0', 'i.preco < -1', 'aceita preço levemente negativo'],
  ['dominio.mjs', 'bruto * (1 - d)', 'bruto * (1 + d)', 'desconto vira acréscimo'],
  ['servico.mjs', 'if (!cobranca.aprovado)', 'if (cobranca.aprovado)', 'inverte a decisão do pagamento'],
  ['repositorio.mjs', "AND status = 'novo'", '', 'marcarPago deixa de exigir status novo']
];
let mortos = 0; const linhas = [];
for (const [arq, de, para, desc] of mutantes) {
  const dir = mkdtempSync(join(tmpdir(), 'mut-')); cpSync('src', join(dir, 'src'), { recursive: true }); cpSync('test', join(dir, 'test'), { recursive: true }); if (comExtras) cpSync('extras', join(dir, 'extras'), { recursive: true });
  symlinkSync(join(process.cwd(), 'node_modules'), join(dir, 'node_modules'));
  const f = join(dir, 'src', arq); const orig = readFileSync(f, 'utf8'); if (!orig.includes(de)) throw new Error('trecho não encontrado: ' + de);
  writeFileSync(f, orig.replace(de, para));
  const r = spawnSync(process.execPath, ['--test', 'test/unitarios.test.mjs', 'test/repositorio.integracao.test.mjs', 'test/api.integracao.test.mjs', 'test/servico.mock.test.mjs', ...(comExtras ? ['extras/fronteiras.test.mjs'] : [])], { cwd: dir, encoding: 'utf8' });
  const morto = r.status !== 0; if (morto) mortos++;
  linhas.push((morto ? 'MORTO     ' : 'SOBREVIVEU ') + desc);
}
console.log(linhas.join('\n')); console.log('mutantes mortos:', mortos + '/' + mutantes.length);
