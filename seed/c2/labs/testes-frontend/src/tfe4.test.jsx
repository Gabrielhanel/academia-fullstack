import fs from 'node:fs';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tema, useContagem } from './useContagem.js';
import { Cadastro } from './Cadastro.jsx';
const out = []; const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.appendFileSync('out.txt', '=== TFE4 ===\n' + out.join('\n') + '\n'));

test('renderHook com e sem provedor', () => {
  const sem = renderHook(() => useContagem(5));
  log('hook sem provedor: n =', sem.result.current.n, '| tema =', sem.result.current.tema);
  const com = renderHook(() => useContagem(), { wrapper: ({ children }) => <Tema.Provider value="escuro">{children}</Tema.Provider> });
  act(() => com.result.current.inc());
  log('hook com provedor escuro: n =', com.result.current.n, '| tema =', com.result.current.tema);
});
test('teclado: tab percorre os campos em ordem', async () => {
  const user = userEvent.setup();
  render(<Cadastro onEnviar={() => {}} />);
  const ordem = [];
  for (let i = 0; i < 3; i++) { await user.tab(); ordem.push(document.activeElement.tagName + ':' + (document.activeElement.name || document.activeElement.textContent)); }
  log('ordem do foco com Tab:', ordem.join(' > '));
  await user.keyboard('{Enter}');
  log('Enter no botão enviou o formulário (alerta visível):', !!screen.queryByRole('alert'));
});
test('waitFor esgota o tempo com mensagem', async () => {
  render(<p>oi</p>);
  const t0 = Date.now();
  try { await waitFor(() => expect(screen.getByText('tchau')).toBeInTheDocument(), { timeout: 200, interval: 50 }); }
  catch (e) { log('waitFor falhou após ~', Math.round((Date.now() - t0) / 100) * 100, 'ms com:', e.message.split('\n')[0].slice(0, 60)); }
});
test('findBy espera o aparecimento', async () => {
  function Tardio() { const [v, setV] = require('react').useState(false); require('react').useEffect(() => { const t = setTimeout(() => setV(true), 100); return () => clearTimeout(t); }, []); return v ? <p>pronto</p> : null; }
  render(<Tardio />);
  log('antes: queryByText ->', screen.queryByText('pronto'));
  log('findByText ->', (await screen.findByText('pronto')).textContent);
});
