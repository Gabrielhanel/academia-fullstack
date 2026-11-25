import fs from 'node:fs';
import React, { createContext, useContext, useReducer, memo } from 'react';
import { render, screen, act } from '@testing-library/react';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const out = [];
const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.appendFileSync('out.txt', '=== EST1 ===\n' + out.join('\n') + '\n'));

test('useReducer+Context: consumidores renderizam quando qualquer parte do valor muda', async () => {
  const Ctx = createContext(null);
  const reducer = (s, a) => a.type === 'a' ? { ...s, a: s.a + 1 } : { ...s, b: s.b + 1 };
  const r = { A: 0, B: 0 };
  const LeA = memo(function LeA() { r.A++; const { state } = useContext(Ctx); return <i>{state.a}</i>; });
  const LeB = memo(function LeB() { r.B++; const { state } = useContext(Ctx); return <i>{state.b}</i>; });
  let dispatch;
  function Prov({ children }) { const [state, d] = useReducer(reducer, { a: 0, b: 0 }); dispatch = d; return <Ctx.Provider value={{ state }}>{children}</Ctx.Provider>; }
  render(<Prov><LeA /><LeB /></Prov>);
  log('montagem', JSON.stringify(r));
  await act(async () => dispatch({ type: 'a' }));
  log('depois de mudar só a', JSON.stringify(r));
});

test('useReducer+Context: valor memoizado vs objeto novo a cada render do provider', async () => {
  const Ctx = createContext(null);
  const r = { C: 0 };
  const Consumidor = memo(function C() { r.C++; useContext(Ctx); return <i />; });
  let force;
  function ProvNovo({ children }) { const [n, set] = React.useState(0); force = () => set((x) => x + 1); return <Ctx.Provider value={{ n: 1 }}>{children}</Ctx.Provider>; }
  render(<ProvNovo><Consumidor /></ProvNovo>);
  const antes = r.C;
  await act(async () => force());
  log('objeto novo no value: renders extras do consumidor =', r.C - antes);
  const Ctx2 = createContext(null);
  const r2 = { C: 0 };
  const Cons2 = memo(function C2() { r2.C++; useContext(Ctx2); return <i />; });
  let force2;
  function ProvMemo({ children }) { const [n, set] = React.useState(0); force2 = () => set((x) => x + 1); const v = React.useMemo(() => ({ n: 1 }), []); return <Ctx2.Provider value={v}>{children}</Ctx2.Provider>; }
  render(<ProvMemo><Cons2 /></ProvMemo>);
  const a2 = r2.C;
  await act(async () => force2());
  log('value memoizado: renders extras do consumidor =', r2.C - a2);
});
