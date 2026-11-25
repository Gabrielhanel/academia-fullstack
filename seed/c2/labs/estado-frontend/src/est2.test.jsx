import fs from 'node:fs';
import React from 'react';
import { render, act } from '@testing-library/react';
import { configureStore, createSlice, createSelector, createAsyncThunk, createEntityAdapter, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { Provider, useSelector } from 'react-redux';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const out = [];
const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.appendFileSync('out.txt', '=== EST2 ===\n' + out.join('\n') + '\n'));

test('slice, Immer, tipos de action e imutabilidade', () => {
  const s = createSlice({ name: 'carrinho', initialState: { itens: [], total: 0 }, reducers: {
    adicionado(state, a) { state.itens.push(a.payload); state.total += a.payload.preco; },
    limpo: () => ({ itens: [], total: 0 })
  } });
  log('actions:', s.actions.adicionado.type, JSON.stringify(s.actions.adicionado({ id: 1, preco: 5 })));
  const e0 = s.getInitialState();
  const e1 = s.reducer(e0, s.actions.adicionado({ id: 1, preco: 5 }));
  log('estado novo?', e1 !== e0, '| array antigo intacto?', e0.itens.length === 0, '| congelado?', Object.isFrozen(e1));
  const store = configureStore({ reducer: { carrinho: s.reducer } });
  log('estado inicial da store:', JSON.stringify(store.getState()));
  let ok = true; try { store.getState().carrinho.itens.push(1); } catch (e) { ok = false; log('mutação fora do reducer lança:', e.constructor.name); }
});

test('seletores: useSelector, createSelector e memoização', async () => {
  const s = createSlice({ name: 'x', initialState: { lista: [1, 2, 3, 4], filtro: 'par', outro: 0 }, reducers: { outro(st) { st.outro++; }, filtro(st, a) { st.filtro = a.payload; } } });
  const store = configureStore({ reducer: { x: s.reducer } });
  let calc = 0;
  const sel = createSelector([(st) => st.x.lista, (st) => st.x.filtro], (l, f) => { calc++; return l.filter((n) => (f === 'par' ? n % 2 === 0 : n % 2 === 1)); });
  const r = { novoArray: 0, estavel: 0 };
  function Ruim() { r.novoArray++; useSelector((st) => st.x.lista.filter((n) => n % 2 === 0)); return null; }
  function Bom() { r.estavel++; useSelector(sel); return null; }
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const spyE = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<Provider store={store}><Ruim /><Bom /></Provider>);
  const avisos = spy.mock.calls.map((c) => String(c[0]).slice(0, 80)).concat(spyE.mock.calls.map((c) => String(c[0]).slice(0, 80)));
  log('avisos do react-redux (dev):', avisos.length ? avisos.join(' || ') : 'nenhum');
  spy.mockRestore(); spyE.mockRestore();
  const a = { ...r }; const c0 = calc;
  await act(async () => store.dispatch(s.actions.outro()));
  log('ação em outra parte do estado: Ruim +', r.novoArray - a.novoArray, ' Bom +', r.estavel - a.estavel, ' recálculos do createSelector +', calc - c0);
  const c1 = calc;
  await act(async () => store.dispatch(s.actions.filtro('impar')));
  log('mudou o filtro: recálculos do createSelector +', calc - c1);
});

test('createAsyncThunk: ciclo de vida das actions', async () => {
  const seen = [];
  const t = createAsyncThunk('usuarios/carregar', async (id, { rejectWithValue }) => { if (id === 0) return rejectWithValue('inválido'); return { id }; });
  const s = createSlice({ name: 'usuarios', initialState: { status: 'idle', dados: null, erro: null }, reducers: {}, extraReducers: (b) => b
    .addCase(t.pending, (st) => { st.status = 'carregando'; })
    .addCase(t.fulfilled, (st, a) => { st.status = 'ok'; st.dados = a.payload; })
    .addCase(t.rejected, (st, a) => { st.status = 'erro'; st.erro = a.payload ?? a.error.message; }) });
  const logger = () => (next) => (a) => { seen.push(a.type); return next(a); };
  const store = configureStore({ reducer: { u: s.reducer }, middleware: (g) => g().concat(logger) });
  await store.dispatch(t(7));
  log('sucesso:', seen.join(' > '), '|', JSON.stringify(store.getState().u));
  seen.length = 0;
  await store.dispatch(t(0));
  log('rejeição:', seen.join(' > '), '|', JSON.stringify(store.getState().u));
});

test('entity adapter: normalização', () => {
  const ad = createEntityAdapter({ selectId: (p) => p.id, sortComparer: (a, b) => a.nome.localeCompare(b.nome) });
  let st = ad.getInitialState();
  st = ad.setAll(st, [{ id: 2, nome: 'Bia' }, { id: 1, nome: 'Ana' }]);
  log('estado normalizado:', JSON.stringify(st));
  st = ad.updateOne(st, { id: 2, changes: { nome: 'Zé' } });
  const sels = ad.getSelectors((x) => x);
  log('selectAll:', JSON.stringify(sels.selectAll(st)), '| selectById(2):', JSON.stringify(sels.selectById(st, 2)));
});

test('listener middleware: efeito reagindo a action', async () => {
  const lm = createListenerMiddleware();
  const s = createSlice({ name: 'c', initialState: { n: 0 }, reducers: { inc(st) { st.n++; } } });
  const efeitos = [];
  lm.startListening({ actionCreator: s.actions.inc, effect: async (a, api) => { efeitos.push('n=' + api.getState().c.n); } });
  const store = configureStore({ reducer: { c: s.reducer }, middleware: (g) => g().prepend(lm.middleware) });
  store.dispatch(s.actions.inc()); store.dispatch(s.actions.inc());
  await new Promise((r) => setTimeout(r, 10));
  log('efeitos do listener:', efeitos.join(', '));
});
