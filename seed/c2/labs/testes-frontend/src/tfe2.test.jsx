import fs from 'node:fs';
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { Usuarios } from './Usuarios.jsx';
const out = []; const log = (...a) => out.push(a.join(' '));
const server = setupServer(http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nome: 'Ana' }, { id: 2, nome: 'Bia' }])));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => { server.close(); fs.appendFileSync('out.txt', '=== TFE2 ===\n' + out.join('\n') + '\n'); });

test('MSW: sucesso, com findBy', async () => {
  render(<Usuarios />);
  log('inicial:', screen.getByText('Carregando...').textContent);
  const itens = await screen.findAllByRole('listitem');
  log('itens após resposta:', itens.map((i) => i.textContent).join(','));
});
test('MSW: erro 500 por teste com server.use', async () => {
  server.use(http.get('/api/usuarios', () => new HttpResponse(null, { status: 500 })));
  render(<Usuarios />);
  log('alerta de erro:', (await screen.findByRole('alert')).textContent);
});
test('MSW: lento e waitFor', async () => {
  server.use(http.get('/api/usuarios', async () => { await delay(150); return HttpResponse.json([]); }));
  render(<Usuarios />);
  const t0 = Date.now();
  await waitFor(() => expect(screen.queryByText('Carregando...')).not.toBeInTheDocument());
  log('espera por resposta de 150 ms: >= 140ms?', Date.now() - t0 >= 140);
});
test('MSW: requisição sem handler com onUnhandledRequest error', async () => {
  const spy = []; const orig = console.error; console.error = (...a) => spy.push(String(a[0]).slice(0, 80));
  server.use(http.get('/api/usuarios', () => HttpResponse.error()));
  render(<Usuarios />);
  await screen.findByRole('alert'); console.error = orig;
  log('erro de rede simulado -> UI:', screen.getByRole('alert').textContent);
});
