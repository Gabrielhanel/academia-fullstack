import { describe, test, expect } from 'vitest';
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import { buscarCliente } from '../src/consumidor.mjs';

const { like, integer, string, regex } = MatchersV3;
const pact = new PactV4({ consumer: 'loja-web', provider: 'api-clientes', dir: new URL('../pacts', import.meta.url).pathname, spec: 4 });

describe('contrato loja-web ⇄ api-clientes (consumidor)', () => {
  test('cliente existente: o consumidor usa id, nome e email', async () => {
    await pact.addInteraction().given('o cliente 1 existe').uponReceiving('uma busca do cliente 1')
      .withRequest('GET', '/clientes/1')
      .willRespondWith(200, (b) => b.headers({ 'Content-Type': 'application/json' }).jsonBody({ id: integer(1), nome: string('Ana Souza'), email: regex(/^[^@\s]+@[^@\s]+$/, 'ana@exemplo.com') }))
      .executeTest(async (mock) => {
        const c = await buscarCliente(mock.url, 1);
        expect(c).toEqual({ id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com', saudacao: 'Olá, Ana!' });
      });
  });
  test('cliente inexistente: 404 com mensagem', async () => {
    await pact.addInteraction().given('o cliente 999 não existe').uponReceiving('uma busca do cliente 999')
      .withRequest('GET', '/clientes/999')
      .willRespondWith(404, (b) => b.headers({ 'Content-Type': 'application/json' }).jsonBody({ erro: like('cliente não encontrado') }))
      .executeTest(async (mock) => {
        await expect(buscarCliente(mock.url, 999)).rejects.toThrow('cliente não encontrado');
      });
  });
});
