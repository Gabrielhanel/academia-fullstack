import fs from 'node:fs';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Contador } from './Contador.jsx';
import { Cadastro } from './Cadastro.jsx';
import { Relogio } from './Relogio.jsx';
import { axe } from 'jest-axe';
const out = []; const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.appendFileSync('out.txt', '=== TFE1 ===\n' + out.join('\n') + '\n'));

test('consultas: getBy lança, queryBy devolve null, findBy espera', async () => {
  render(<Contador />);
  try { screen.getByText('não existe'); } catch (e) { log('getBy ausente lança:', e.message.split('\n')[0]); }
  log('queryBy ausente:', screen.queryByText('não existe'));
  log('getByRole button:', screen.getByRole('button', { name: 'Incrementar' }).tagName);
  log('getAllByRole count:', screen.getAllByRole('button').length);
});
test('userEvent x fireEvent', async () => {
  const user = userEvent.setup();
  render(<Contador />);
  await user.click(screen.getByRole('button', { name: 'Incrementar' }));
  log('após userEvent.click:', screen.getByText(/Contagem/).textContent);
  fireEvent.click(screen.getByRole('button', { name: 'Incrementar' }));
  log('após fireEvent.click:', screen.getByText(/Contagem/).textContent);
  expect(screen.getByText('Contagem: 2')).toBeInTheDocument();
});
test('formulário: validação e envio, espião com vi.fn', async () => {
  const user = userEvent.setup(); const onEnviar = vi.fn().mockResolvedValue();
  render(<Cadastro onEnviar={onEnviar} />);
  await user.type(screen.getByLabelText('Nome'), 'Ana');
  await user.type(screen.getByLabelText('E-mail'), 'invalido');
  await user.click(screen.getByRole('button', { name: 'Enviar' }));
  log('erro visível:', screen.getByRole('alert').textContent, '| chamadas:', onEnviar.mock.calls.length);
  await user.clear(screen.getByLabelText('E-mail')); await user.type(screen.getByLabelText('E-mail'), 'ana@x.com');
  await user.click(screen.getByRole('button', { name: 'Enviar' }));
  log('após válido: chamadas', onEnviar.mock.calls.length, JSON.stringify(onEnviar.mock.calls[0][0]), '| alerta:', screen.queryByRole('alert'));
});
test('timers falsos', async () => {
  vi.useFakeTimers();
  const { act } = await import('react');
  render(<Relogio />);
  log('t=0:', screen.getByText(/s$/).textContent);
  await act(async () => { vi.advanceTimersByTime(3000); });
  log('após avançar 3000 ms (relógio falso):', screen.getByText(/s$/).textContent);
  vi.useRealTimers();
});
test('acessibilidade com axe', async () => {
  const { container } = render(<Cadastro onEnviar={() => {}} />);
  const r = await axe(container); log('violações axe no formulário rotulado:', r.violations.length);
  const { container: c2 } = render(<form><input name="x" /></form>);
  const r2 = await axe(c2); log('violações axe sem rótulo:', r2.violations.map((v) => v.id).join(','));
});
