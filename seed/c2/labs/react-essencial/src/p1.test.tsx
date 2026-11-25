import { useState, StrictMode, Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function Contador() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Cliques: {n}</button>;
}
test('rea-01 UI = f(estado)', async () => {
  console.log('SSR:', renderToString(<Contador />));
  render(<Contador />);
  const b = screen.getByRole('button');
  await userEvent.click(b); await userEvent.click(b);
  console.log('após 2 cliques:', b.textContent);
  const el = <Contador />;
  console.log('elemento é objeto:', typeof el, Object.keys(el).slice(0, 4).join(','), 'type===Contador:', el.type === Contador);
});
test('rea-02 JSX e XSS', () => {
  const entrada = '<img src=x onerror="alert(1)">';
  console.log('texto escapado:', renderToString(<p>{entrada}</p>));
  console.log('perigoso:', renderToString(<p dangerouslySetInnerHTML={{ __html: entrada }} />));
  console.log('atributos:', renderToString(<label htmlFor="x" className="rotulo" style={{ marginTop: 4, backgroundColor: 'red' }}>nome</label>));
  console.log('valores ignorados:', renderToString(<div>{null}{undefined}{false}{true}{0}{''}{[1, 2]}</div>));
  console.log('fragmento:', renderToString(<><li>a</li><li>b</li></>));
  console.log('href javascript:', renderToString(<a href={'javascript:alert(1)'}>x</a>));
});
type CartaoProps = { titulo: string; children?: React.ReactNode; destaque?: boolean };
function Cartao({ titulo, children, destaque = false }: CartaoProps) {
  return <section className={destaque ? 'cartao destaque' : 'cartao'}><h2>{titulo}</h2>{children}</section>;
}
test('rea-03 props e children', () => {
  console.log(renderToString(<Cartao titulo="Olá" destaque><p>corpo</p></Cartao>));
  console.log(renderToString(<Cartao titulo="Sem filhos" />));
  const props = Object.freeze({ titulo: 'x' });
  function Muta(p: { titulo: string }) { try { (p as any).titulo = 'y'; return <p>mutou</p>; } catch (e: any) { return <p>erro: {e.constructor.name}</p>; } }
  console.log(renderToString(<Muta {...props} />));
});
test('rea-04 estado: snapshot e atualização funcional', async () => {
  let renders = 0;
  function A() { const [n, setN] = useState(0); renders++; return <button onClick={() => { setN(n + 1); setN(n + 1); setN(n + 1); }}>{n}</button>; }
  function B() { const [n, setN] = useState(0); return <button onClick={() => { setN((x) => x + 1); setN((x) => x + 1); setN((x) => x + 1); }}>{n}</button>; }
  const { container } = render(<><A /><B /></>);
  const [a, b] = Array.from(container.querySelectorAll('button'));
  const r0 = renders; await userEvent.click(a); await userEvent.click(b);
  console.log('A (n+1 x3):', a.textContent, '| B (x=>x+1 x3):', b.textContent, '| renderizações de A por clique:', renders - r0);
  function C() { const [o, setO] = useState({ n: 0 }); return <button onClick={() => { o.n = 5; setO(o); }}>{o.n}</button>; }
  const r = render(<C />); const c = r.container.querySelector('button')!; await userEvent.click(c);
  console.log('mutar o objeto e reaplicar a mesma referência:', c.textContent, '(ainda 0)');
});
function Filho({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) { return <input aria-label="nome" value={valor} onChange={(e) => aoMudar(e.target.value)} />; }
function Pai() { const [v, setV] = useState('Ana'); return <><Filho valor={v} aoMudar={setV} /><p>Olá, {v}</p></>; }
test('rea-04 elevar estado', async () => {
  render(<Pai />); const i = screen.getByLabelText('nome');
  await userEvent.clear(i); await userEvent.type(i, 'Bia');
  console.log('texto do irmão:', screen.getByText(/Olá/).textContent);
});
test('rea-05 chaves e condicionais', async () => {
  const err = console.error; const msgs: string[] = []; console.error = (...a: any[]) => { msgs.push(String(a[0]).slice(0, 80)); };
  render(<ul>{['a', 'b'].map((x) => <li>{x}</li>)}</ul>);
  console.error = err; console.log('aviso sem key:', msgs[0]);
  function Lista({ itens, porIndice }: { itens: string[]; porIndice: boolean }) {
    return <ul>{itens.map((t, i) => <li key={porIndice ? i : t}><input defaultValue="" aria-label={t} /></li>)}</ul>;
  }
  for (const porIndice of [true, false]) {
    const { container, rerender, unmount } = render(<Lista itens={['A', 'B']} porIndice={porIndice} />);
    const inputs = container.querySelectorAll('input'); await userEvent.type(inputs[0], 'digitado');
    rerender(<Lista itens={['B', 'A']} porIndice={porIndice} />);
    const depois = Array.from(container.querySelectorAll('input')).map((i) => i.getAttribute('aria-label') + '=' + (i as HTMLInputElement).value);
    console.log(porIndice ? 'key=índice, após inverter:' : 'key=id, após inverter:', depois.join(' '));
    unmount();
  }
  const zero = renderToString(<div>{0 && <span>x</span>}|{[].length && <span>y</span>}|{!!0 && <span>z</span>}</div>);
  console.log('&& com 0:', zero);
});
