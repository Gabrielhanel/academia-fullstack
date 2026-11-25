import fs from 'node:fs';
import React from 'react';
import { render, act } from '@testing-library/react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const out = [];
const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.appendFileSync('out.txt', '=== EST3 ===\n' + out.join('\n') + '\n'));

test('store, seletores e re-renderização', async () => {
  const useS = create((set, get) => ({ n: 0, nome: 'a', inc: () => set((s) => ({ n: s.n + 1 })), setNome: (nome) => set({ nome }) }));
  const r = { tudo: 0, soN: 0, par: 0, parShallow: 0 };
  function Tudo() { r.tudo++; useS(); return null; }
  function SoN() { r.soN++; useS((s) => s.n); return null; }
  function ParRuim() { r.par++; useS((s) => ({ n: s.n, nome: s.nome })); return null; }
  function ParOk() { r.parShallow++; useS(useShallow((s) => ({ n: s.n, nome: s.nome }))); return null; }
  const spyE = vi.spyOn(console, 'error').mockImplementation(() => {});
  let errou = '';
  try { render(<><Tudo /><SoN /><ParOk /></>); } finally {}
  try { render(<ParRuim />); } catch (e) { errou = e.message.slice(0, 80); }
  spyE.mockRestore();
  log('seletor que devolve objeto novo (sem useShallow) em v5:', errou || 'sem erro lançado');
  const a = { ...r };
  await act(async () => useS.getState().setNome('b'));
  log('mudou só nome: Tudo +', r.tudo - a.tudo, ' SoN +', r.soN - a.soN, ' ParShallow +', r.parShallow - a.parShallow);
  const b = { ...r };
  await act(async () => useS.getState().inc());
  log('mudou só n: Tudo +', r.tudo - b.tudo, ' SoN +', r.soN - b.soN, ' ParShallow +', r.parShallow - b.parShallow);
  log('fora do React: getState().n =', useS.getState().n);
  const vistos = []; const un = useS.subscribe((s, ant) => vistos.push(ant.n + '->' + s.n)); useS.getState().inc(); un(); useS.getState().inc();
  log('subscribe viu:', vistos.join(','));
});

test('persist middleware e slices', () => {
  const mem = {}; const storage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; }, removeItem: (k) => { delete mem[k]; } };
  const sliceA = (set) => ({ a: 1, incA: () => set((s) => ({ a: s.a + 1 })) });
  const sliceB = (set, get) => ({ b: 10, somaAB: () => get().a + get().b });
  const use = create(persist((...x) => ({ ...sliceA(...x), ...sliceB(...x) }), { name: 'meu-store', storage: createJSONStorage(() => storage), partialize: (s) => ({ a: s.a }), version: 2 }));
  use.getState().incA();
  log('persistido:', mem['meu-store']);
  log('somaAB:', use.getState().somaAB());
});

test('subscribeWithSelector', () => {
  const use = create(subscribeWithSelector(() => ({ x: 0, y: 0 })));
  const v = []; use.subscribe((s) => s.x, (x, ant) => v.push(ant + '->' + x));
  use.setState({ y: 1 }); use.setState({ x: 5 }); use.setState({ x: 5 });
  log('só mudanças de x:', v.join(','));
});
