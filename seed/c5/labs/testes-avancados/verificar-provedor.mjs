// Verifica o contrato (pacts/*.json) contra o provedor real. Uso: node verificar-provedor.mjs [nome|name]
import { Verifier } from '@pact-foundation/pact';
import { criarProvedor } from './src/provedor.mjs';
const campo = process.argv[2] || 'nome';
const app = criarProvedor({ campoNome: campo });
const server = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
const porta = server.address().port;
try {
  const saida = await new Verifier({
    provider: 'api-clientes', providerBaseUrl: 'http://127.0.0.1:' + porta,
    pactUrls: [new URL('./pacts/loja-web-api-clientes.json', import.meta.url).pathname],
    stateHandlers: { 'o cliente 1 existe': async () => {}, 'o cliente 999 não existe': async () => {} },
    logLevel: 'warn'
  }).verifyProvider();
  console.log('VERIFICAÇÃO OK com campo "' + campo + '":', String(saida).slice(0, 80));
  process.exitCode = 0;
} catch (e) {
  console.log('VERIFICAÇÃO FALHOU com campo "' + campo + '"');
  console.log(String(e.message || e).split('\n').filter((l) => /nome|name|Missing|missing|Expected|expected|FAIL|Failures|body/i.test(l)).slice(0, 8).join('\n'));
  process.exitCode = 1;
} finally { server.close(); }
