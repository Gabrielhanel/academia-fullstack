import { Suspense, lazy, use, useState, useTransition, useDeferredValue, memo, Component, type ReactNode } from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
test('rav-05 lazy + Suspense', async () => {
  const t0 = performance.now();
  const Preguicoso = lazy(async () => { await espera(80); return { default: () => <p>carregado</p> }; });
  render(<Suspense fallback={<p>carregando…</p>}><Preguicoso /></Suspense>);
  console.log('imediato:', screen.getByText(/carregando|carregado/).textContent);
  await screen.findByText('carregado'); console.log('depois:', screen.getByText('carregado').textContent, '| ms ~', Math.round((performance.now() - t0) / 10) * 10);
});
test('rav-05 use(promise): cascata x paralelo (momento em que cada busca começa)', async () => {
  const inicios: Record<string, number> = {}; let t0 = 0; const cache = new Map<string, Promise<string>>();
  const buscar = (k: string, ms: number) => { if (!cache.has(k)) { inicios[k] = Math.round((performance.now() - t0) / 50) * 50; cache.set(k, espera(ms).then(() => 'dado ' + k)); } return cache.get(k)!; };
  function Item({ k, ms, filho }: { k: string; ms: number; filho?: ReactNode }) { const v = use(buscar(k, ms)); return <div><span>{v}</span>{filho}</div>; }
  t0 = performance.now();
  await act(async () => { render(<Suspense fallback={<i>…</i>}><Item k="pai1" ms={100} filho={<Suspense fallback="…"><Item k="filho1" ms={100} /></Suspense>} /></Suspense>); });
  await screen.findByText('dado filho1', {}, { timeout: 3000 }); cleanup();
  t0 = performance.now(); buscar('pai2', 100); buscar('filho2', 100);
  await act(async () => { render(<Suspense fallback={<i>…</i>}><Item k="pai2" ms={100} filho={<Suspense fallback="…"><Item k="filho2" ms={100} /></Suspense>} /></Suspense>); });
  await screen.findByText('dado filho2', {}, { timeout: 3000 });
  console.log('início das buscas (ms desde o render; arredondado a 50):', JSON.stringify(inicios));
});
test('rav-05 fronteira de erro', async () => {
  class Fronteira extends Component<{ children: ReactNode }, { erro: string | null }> {
    state = { erro: null as string | null };
    static getDerivedStateFromError(e: Error) { return { erro: e.message }; }
    render() { return this.state.erro ? <p role="alert">falhou: {this.state.erro}</p> : this.props.children; }
  }
  const rejeita = Promise.reject(new Error('rede caiu')); rejeita.catch(() => {});
  function Item() { const v = use(rejeita as Promise<string>); return <p>{v}</p>; }
  const err = console.error; console.error = () => {};
  await act(async () => { render(<Fronteira><Suspense fallback="…"><Item /></Suspense></Fronteira>); });
  await screen.findByRole('alert'); console.error = err; console.log('promise rejeitada vai à fronteira de erro:', screen.getByRole('alert').textContent);
});
function Lento({ texto }: { texto: string }) { const ini = performance.now(); while (performance.now() - ini < 15) {} return <li>{texto}</li>; }
test('rav-06 useTransition e useDeferredValue', async () => {
  const pares: string[] = [];
  const Lista = memo(function Lista({ q }: { q: string }) { return <ul>{Array.from({ length: 6 }, (_, i) => <Lento key={i} texto={q + i} />)}</ul>; });
  function App() { const [q, setQ] = useState(''); const adiado = useDeferredValue(q); pares.push(`q=${q || "''"} adiado=${adiado || "''"}`); return <><input aria-label="q" value={q} onChange={(e) => setQ(e.target.value)} /><Lista q={adiado} /></>; }
  render(<App />); pares.length = 0;
  await userEvent.type(screen.getByLabelText('q'), 'ab');
  console.log('renders do App ao digitar "ab":', pares.join(' | '));
  cleanup();
  const marcas: string[] = [];
  function B() { const [aba, setAba] = useState('a'); const [pend, iniciar] = useTransition(); marcas.push(`aba=${aba} pend=${pend}`); return <><button onClick={() => iniciar(() => setAba('b'))}>ir</button><p>{aba}</p></>; }
  render(<B />); marcas.length = 0; await userEvent.click(screen.getByText('ir'));
  console.log('useTransition:', marcas.join(' | '));
});
