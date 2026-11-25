import { useState, useEffect, useLayoutEffect, useRef, StrictMode, memo, createContext, useContext } from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('rav-01 ordem de render, commit e efeitos', async () => {
  const log: string[] = [];
  function Filho({ n }: { n: number }) {
    log.push('render filho'); const r = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => { log.push('layout filho ref=' + (r.current ? 'DOM' : 'null')); });
    useEffect(() => { log.push('efeito filho'); return () => log.push('cleanup filho'); });
    return <span ref={r}>{n}</span>;
  }
  function Pai() {
    log.push('render pai'); const [n, setN] = useState(0);
    useLayoutEffect(() => { log.push('layout pai'); });
    useEffect(() => { log.push('efeito pai'); });
    return <><button onClick={() => setN(n + 1)}>+</button><Filho n={n} /></>;
  }
  render(<Pai />); console.log('montagem:', log.join(' > ')); log.length = 0;
  await userEvent.click(screen.getByText('+')); console.log('atualização:', log.join(' > '));
  cleanup(); log.length = 0; render(<StrictMode><Pai /></StrictMode>); console.log('Strict (montagem):', log.join(' > '));
});
test('rav-01 o que dispara re-render', async () => {
  const c = { pai: 0, filhoProps: 0, filhoMemo: 0, filhoChildren: 0, ctx: 0 };
  const Ctx = createContext(0);
  const Plain = ({ x }: { x: number }) => { c.filhoProps++; return <i>{x}</i>; };
  const Memo = memo(({ x }: { x: number }) => { c.filhoMemo++; return <i>{x}</i>; });
  const ComChildren = ({ children }: { children: React.ReactNode }) => { const [t, setT] = useState(0); return <div><button onClick={() => setT(t + 1)}>t{t}</button>{children}</div>; };
  const Leitor = () => { useContext(Ctx); c.ctx++; return null; };
  const Estavel = () => { c.filhoChildren++; return <u />; };
  function Pai() { const [n, setN] = useState(0); c.pai++; return <Ctx value={0}><button onClick={() => setN(n + 1)}>n{n}</button><Plain x={1} /><Memo x={1} /><ComChildren><Estavel /></ComChildren><Leitor /></Ctx>; }
  render(<Pai />); const base = { ...c };
  await userEvent.click(screen.getByText('n0'));
  console.log('após estado do pai: pai', c.pai - base.pai, '| filho com mesma prop', c.filhoProps - base.filhoProps, '| memo', c.filhoMemo - base.filhoMemo, '| children passado como elemento', c.filhoChildren - base.filhoChildren, '| consumidor de contexto (valor igual)', c.ctx - base.ctx);
  const b2 = { ...c }; await userEvent.click(screen.getByText('t0'));
  console.log('após estado do ComChildren: Estavel (children)', c.filhoChildren - b2.filhoChildren, '| pai', c.pai - b2.pai);
  let r = 0; function Z() { const [n, setN] = useState(0); r++; return <button onClick={() => setN(0)}>z</button>; }
  render(<Z />); const r0 = r; await userEvent.click(screen.getByText('z')); await userEvent.click(screen.getByText('z'));
  console.log('setState com o mesmo valor: renders extras', r - r0);
});
test('rav-01 Strict Mode renderiza duas vezes', () => {
  let n = 0; function C() { n++; return <p>x</p>; }
  render(<C />); const sem = n; n = 0; cleanup(); render(<StrictMode><C /></StrictMode>);
  console.log('chamadas da função do componente: sem Strict', sem, '| com Strict', n);
});
