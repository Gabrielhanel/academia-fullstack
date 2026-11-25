import { useState, useReducer, useCallback, type ElementType, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';

function useControllableState<T>({ value, defaultValue, onChange }: { value?: T; defaultValue: T; onChange?: (v: T) => void }) {
  const [interno, setInterno] = useState(defaultValue);
  const controlado = value !== undefined;
  const atual = controlado ? (value as T) : interno;
  const definir = useCallback((proximo: T) => { if (!controlado) setInterno(proximo); onChange?.(proximo); }, [controlado, onChange]);
  return [atual, definir] as const;
}
function Disclosure({ open, defaultOpen = false, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (o: boolean) => void; children: (p: { aberto: boolean; alternar: () => void }) => ReactNode }) {
  const [aberto, setAberto] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  return <>{children({ aberto, alternar: () => setAberto(!aberto) })}</>;
}
test('rav-04 controlado e não controlado + render prop', async () => {
  render(<Disclosure>{({ aberto, alternar }) => <><button onClick={alternar}>nc</button><p>{aberto ? 'aberto' : 'fechado'}</p></>}</Disclosure>);
  await userEvent.click(screen.getByText('nc')); console.log('não controlado:', screen.getByText(/aberto|fechado/).textContent);
  const log: boolean[] = [];
  function Pai() { const [o, setO] = useState(false); return <Disclosure open={o} onOpenChange={(v) => { log.push(v); if (log.length < 3) setO(v); }}>{({ aberto, alternar }) => <><button onClick={alternar}>c</button><span data-testid="c">{String(aberto)}</span></>}</Disclosure>; }
  render(<Pai />); await userEvent.click(screen.getByText('c')); await userEvent.click(screen.getByText('c')); await userEvent.click(screen.getByText('c'));
  console.log('controlado: pai aceitou 2 mudanças e recusou a 3ª ->', screen.getByTestId('c').textContent, '| onChange recebeu', JSON.stringify(log));
});
type Acao = { tipo: 'alternar' } | { tipo: 'abrir' } | { tipo: 'fechar' };
const reducerPadrao = (e: boolean, a: Acao) => (a.tipo === 'alternar' ? !e : a.tipo === 'abrir' ? true : false);
function useToggle(reducer = reducerPadrao) { const [aberto, dispatch] = useReducer(reducer, false); return { aberto, alternar: () => dispatch({ tipo: 'alternar' }), abrir: () => dispatch({ tipo: 'abrir' }) }; }
test('rav-04 state reducer', async () => {
  function C({ reducer }: { reducer?: typeof reducerPadrao }) { const t = useToggle(reducer); return <><button onClick={t.alternar}>alt</button><i>{String(t.aberto)}</i></>; }
  const travado = (e: boolean, a: Acao) => (a.tipo === 'alternar' && e ? e : reducerPadrao(e, a));
  render(<C reducer={travado} />); await userEvent.click(screen.getByText('alt')); await userEvent.click(screen.getByText('alt'));
  console.log('state reducer que impede fechar:', screen.getByText(/true|false/).textContent);
});
test('rav-04 polimorfismo as', () => {
  type PropsComo<C extends ElementType> = { as?: C; children?: ReactNode } & Omit<ComponentPropsWithoutRef<C>, 'as' | 'children'>;
  function Caixa<C extends ElementType = 'div'>({ as, children, ...resto }: PropsComo<C>) { const Comp: ElementType = as ?? 'div'; return <Comp {...resto}>{children}</Comp>; }
  console.log(renderToString(<Caixa>a</Caixa>), renderToString(<Caixa as="a" href="/x">b</Caixa>), renderToString(<Caixa as="button" type="submit" disabled>c</Caixa>));
  const Link = ({ to, children }: { to: string; children?: ReactNode }) => <a href={to} data-router>{children}</a>;
  console.log(renderToString(<Caixa as={Link} to="/p">d</Caixa>));
});
