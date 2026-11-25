import { useState, useEffect, useRef, useMemo, useCallback, memo, StrictMode, createContext, useContext, useActionState } from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('rea-06 controlado x não controlado', async () => {
  function Controlado() { const [v, setV] = useState(''); return <><input aria-label="c" value={v} onChange={(e) => setV(e.target.value.toUpperCase())} /><output>{v.length}</output></>; }
  render(<Controlado />); const i = screen.getByLabelText('c'); await userEvent.type(i, 'abc');
  console.log('controlado (transforma):', (i as HTMLInputElement).value, 'tamanho', screen.getByRole('status').textContent);
  let enviado: any = null;
  function NaoControlado() { return <form onSubmit={(e) => { e.preventDefault(); enviado = Object.fromEntries(new FormData(e.currentTarget)); }}><input name="email" defaultValue="a@b.c" /><input type="checkbox" name="aceito" defaultChecked /><button>Enviar</button></form>; }
  render(<NaoControlado />); await userEvent.click(screen.getByText('Enviar'));
  console.log('FormData:', JSON.stringify(enviado));
  const err = console.error; const m: string[] = []; console.error = (...a: any[]) => m.push(String(a[0]).slice(0, 90));
  function SemOnChange() { return <input aria-label="x" value="fixo" />; } render(<SemOnChange />);
  console.error = err; console.log('aviso value sem onChange:', m[0]);
});
test('rea-07 efeitos', async () => {
  const log: string[] = [];
  function Rel({ id }: { id: number }) { useEffect(() => { log.push('conecta ' + id); return () => { log.push('desconecta ' + id); }; }, [id]); return <p>{id}</p>; }
  const { rerender, unmount } = render(<Rel id={1} />); rerender(<Rel id={2} />); rerender(<Rel id={2} />); unmount();
  console.log('sem Strict:', log.join(' | '));
  log.length = 0; const r = render(<StrictMode><Rel id={1} /></StrictMode>); console.log('Strict (montagem):', log.join(' | ')); r.unmount();
  // closure velha
  function Velho() { const [n, setN] = useState(0); useEffect(() => { const t = setInterval(() => setN(n + 1), 10); return () => clearInterval(t); }, []); return <p>{n}</p>; }
  function Novo() { const [n, setN] = useState(0); useEffect(() => { const t = setInterval(() => setN((x) => x + 1), 10); return () => clearInterval(t); }, []); return <p>{n}</p>; }
  const a = render(<Velho />); const b = render(<Novo />);
  await act(async () => { await new Promise((r) => setTimeout(r, 120)); });
  console.log('closure velha:', a.container.textContent, '| atualização funcional:', Number(b.container.textContent) > 3 ? '>3' : b.container.textContent);
  // corrida de requisições
  const respostas: Record<string, number> = { a: 50, b: 5 };
  function Busca({ q }: { q: string }) {
    const [res, setRes] = useState('');
    useEffect(() => { let ignorar = false; new Promise<string>((ok) => setTimeout(() => ok('resultado ' + q), respostas[q])).then((r) => { if (!ignorar) setRes(r); }); return () => { ignorar = true; }; }, [q]);
    return <p data-testid="res">{res}</p>;
  }
  const rr = render(<Busca q="a" />); rr.rerender(<Busca q="b" />);
  await act(async () => { await new Promise((r) => setTimeout(r, 100)); });
  console.log('com ignorar:', screen.getAllByTestId('res').at(-1)!.textContent);
});
test('rea-08 ref, memo e callback', async () => {
  function Foco() { const r = useRef<HTMLInputElement>(null); return <><input ref={r} aria-label="f" /><button onClick={() => r.current?.focus()}>foco</button></>; }
  render(<Foco />); await userEvent.click(screen.getByText('foco')); console.log('foco no input:', document.activeElement === screen.getByLabelText('f'));
  cleanup();
  function Contagem() { const r = useRef(0); const [, f] = useState(0); r.current++; return <button onClick={() => f((x) => x + 1)}>{r.current}</button>; }
  const c = render(<Contagem />); await userEvent.click(c.getByRole('button')); console.log('ref persiste entre renders (sem re-render ao mudar):', c.getByRole('button').textContent);
  cleanup();
  const rends = { semMemo: 0, comMemo: 0 };
  const Sem = ({ f }: { f: () => void }) => { rends.semMemo++; return <i onClick={f} />; };
  const Com = memo(({ f }: { f: () => void }) => { rends.comMemo++; return <i onClick={f} />; });
  function Pai() { const [n, setN] = useState(0); const estavel = useCallback(() => {}, []); const instavel = () => {}; return <><button onClick={() => setN(n + 1)}>{n}</button><Sem f={estavel} /><Com f={estavel} /><Com f={instavel} /></>; }
  const p = render(<Pai />); const antes = { ...rends }; await userEvent.click(p.getByRole('button')); await userEvent.click(p.getByRole('button'));
  console.log('renders extras após 2 cliques -> Sem memo:', rends.semMemo - antes.semMemo, '| memo+callback estável & instável (soma):', rends.comMemo - antes.comMemo);
  cleanup();
  let calc = 0; function M({ xs }: { xs: number[] }) { const [t, setT] = useState(0); const soma = useMemo(() => { calc++; return xs.reduce((a, b) => a + b, 0); }, [xs]); return <button onClick={() => setT(t + 1)}>{soma}</button>; }
  const xs = [1, 2, 3]; const m = render(<M xs={xs} />); await userEvent.click(m.getByRole('button')); await userEvent.click(m.getByRole('button'));
  console.log('useMemo recalculou', calc, 'vez(es) em 3 renders');
});
test('rea-09 context', async () => {
  const Tema = createContext('claro');
  let leituras = 0; function Cons() { const t = useContext(Tema); leituras++; return <b>{t}</b>; }
  const Ignora = memo(function Ignora() { return <Cons />; });
  function App() { const [t, setT] = useState('claro'); const [n, setN] = useState(0); return <Tema value={t}><button onClick={() => setT(t === 'claro' ? 'escuro' : 'claro')}>tema</button><button onClick={() => setN(n + 1)}>n{n}</button><Ignora /></Tema>; }
  const a = render(<App />); const r0 = leituras;
  await userEvent.click(a.getByText('n0')); const depoisOutroEstado = leituras - r0;
  await userEvent.click(a.getByText('tema')); console.log('Consumidor re-renderiza ao mudar outro estado (memo bloqueia):', depoisOutroEstado, '| ao mudar o valor do contexto:', leituras - r0 - depoisOutroEstado, '->', a.container.querySelector('b')!.textContent);
  let rs = 0; const Obj = createContext({ a: 1 }); function C2() { useContext(Obj); rs++; return null; } const M2 = memo(C2);
  function P2() { const [n, setN] = useState(0); return <Obj value={{ a: 1 }}><button onClick={() => setN(n + 1)}>x</button><M2 /></Obj>; }
  const q = render(<P2 />); const r1 = rs; await userEvent.click(q.getByText('x')); await userEvent.click(q.getByText('x'));
  console.log('valor objeto novo a cada render -> re-renderizações do consumidor em 2 cliques:', rs - r1);
});
