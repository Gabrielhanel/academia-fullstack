import fs from 'node:fs';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useInfiniteQuery, useQueryClient, dehydrate, hydrate, hashKey } from '@tanstack/react-query';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const out = [];
const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.appendFileSync('out.txt', '=== EST4 ===\n' + out.join('\n') + '\n'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const novo = (o = {}) => new QueryClient({ defaultOptions: { queries: { retry: false, ...o } } });
const wrap = (qc) => ({ children }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

test('chaves: hash estrutural e deduplicação', async () => {
  log('hash de chaves iguais com ordem de props diferente:', hashKey(['t', { a: 1, b: 2 }]) === hashKey(['t', { b: 2, a: 1 }]), '| array em ordem diferente:', hashKey(['t', 1, 2]) === hashKey(['t', 2, 1]));
  const qc = novo(); let busca = 0;
  const f = async () => { busca++; await sleep(20); return 'ok'; };
  function A() { useQuery({ queryKey: ['k'], queryFn: f }); return null; }
  function B() { useQuery({ queryKey: ['k'], queryFn: f }); return null; }
  render(<A />, { wrapper: wrap(qc) }); render(<B />, { wrapper: wrap(qc) });
  await act(async () => { await sleep(60); });
  log('dois componentes, mesma chave: buscas =', busca);
});

test('staleTime e gcTime', async () => {
  let busca = 0; const f = async () => { busca++; return busca; };
  const qc = novo({ staleTime: 100 });
  function Q() { const q = useQuery({ queryKey: ['s'], queryFn: f }); return <i>{q.data}</i>; }
  const w = wrap(qc);
  const r1 = render(<Q />, { wrapper: w });
  await act(async () => { await sleep(20); });
  r1.unmount();
  render(<Q />, { wrapper: w });
  await act(async () => { await sleep(20); });
  log('staleTime 100ms: remontar em 20ms refaz busca? buscas =', busca);
  await act(async () => { await sleep(120); });
  const r3 = render(<Q />, { wrapper: w });
  await act(async () => { await sleep(30); });
  log('após 120ms (dado velho): buscas =', busca);
  r3.unmount();
  const qc2 = novo({ staleTime: 0, gcTime: 50 });
  const key = ['g'];
  function G() { useQuery({ queryKey: key, queryFn: async () => 1 }); return null; }
  const r = render(<G />, { wrapper: wrap(qc2) });
  await act(async () => { await sleep(20); });
  const antes = !!qc2.getQueryCache().find({ queryKey: key });
  r.unmount();
  await act(async () => { await sleep(100); });
  log('gcTime 50ms: no cache antes de desmontar =', antes, '| 100ms após desmontar =', !!qc2.getQueryCache().find({ queryKey: key }));
  const pad = new QueryClient();
  log('padrões: staleTime =', pad.getDefaultOptions().queries?.staleTime ?? 0, '| gcTime padrão (ms) =', 5 * 60 * 1000, '(documentação)');
});

test('invalidação refaz só consultas ativas e marcadas', async () => {
  const qc = novo({ staleTime: 60000 }); const c = { lista: 0, item1: 0, outra: 0 };
  function L() { useQuery({ queryKey: ['todos', 'lista'], queryFn: async () => ++c.lista }); return null; }
  function I() { useQuery({ queryKey: ['todos', 'item', 1], queryFn: async () => ++c.item1 }); return null; }
  function O() { useQuery({ queryKey: ['outra'], queryFn: async () => ++c.outra }); return null; }
  render(<><L /><I /><O /></>, { wrapper: wrap(qc) });
  await act(async () => { await sleep(30); });
  await act(async () => { await qc.invalidateQueries({ queryKey: ['todos'] }); });
  log('invalidar ["todos"]:', JSON.stringify(c));
  await act(async () => { await qc.invalidateQueries({ queryKey: ['todos', 'lista'], exact: true }); });
  log('invalidar ["todos","lista"] exact:', JSON.stringify(c));
});

test('atualização otimista com rollback', async () => {
  const qc = novo({ staleTime: 60000 });
  let servidor = ['a']; let falhar = false;
  const hist = [];
  function L() {
    const q = useQuery({ queryKey: ['itens'], queryFn: async () => [...servidor] });
    hist.push(JSON.stringify(q.data));
    return null;
  }
  let mut;
  function M() {
    const qcl = useQueryClient();
    mut = useMutation({
      mutationFn: async (x) => { await sleep(20); if (falhar) throw new Error('falhou'); servidor.push(x); return x; },
      onMutate: async (x) => {
        await qcl.cancelQueries({ queryKey: ['itens'] });
        const anterior = qcl.getQueryData(['itens']);
        qcl.setQueryData(['itens'], (v) => [...v, x]);
        return { anterior };
      },
      onError: (e, x, ctx) => qcl.setQueryData(['itens'], ctx.anterior),
      onSettled: () => qcl.invalidateQueries({ queryKey: ['itens'] })
    });
    return null;
  }
  render(<><L /><M /></>, { wrapper: wrap(qc) });
  await act(async () => { await sleep(30); });
  await act(async () => { mut.mutate('b'); await sleep(5); });
  log('durante a mutação (otimista):', JSON.stringify(qc.getQueryData(['itens'])));
  await act(async () => { await sleep(60); });
  log('após sucesso:', JSON.stringify(qc.getQueryData(['itens'])), '| servidor:', JSON.stringify(servidor));
  falhar = true;
  await act(async () => { mut.mutate('c'); await sleep(5); });
  log('falha, durante:', JSON.stringify(qc.getQueryData(['itens'])));
  await act(async () => { await sleep(60); });
  log('falha, depois do rollback:', JSON.stringify(qc.getQueryData(['itens'])));
});

test('paginação infinita', async () => {
  const qc = novo();
  const paginas = { 0: { itens: [1, 2], prox: 1 }, 1: { itens: [3, 4], prox: 2 }, 2: { itens: [5], prox: null } };
  let q;
  function P() { q = useInfiniteQuery({ queryKey: ['p'], initialPageParam: 0, queryFn: async ({ pageParam }) => paginas[pageParam], getNextPageParam: (u) => u.prox ?? undefined }); return null; }
  render(<P />, { wrapper: wrap(qc) });
  await act(async () => { await sleep(20); });
  await act(async () => { await q.fetchNextPage(); });
  await act(async () => { await q.fetchNextPage(); });
  log('páginas:', JSON.stringify(q.data.pages.map((p) => p.itens)), '| tem próxima?', q.hasNextPage, '| pageParams:', JSON.stringify(q.data.pageParams));
});

test('prefetch e hidratação', async () => {
  const servidor = novo(); await servidor.prefetchQuery({ queryKey: ['u', 1], queryFn: async () => ({ nome: 'Ana' }) });
  const estado = dehydrate(servidor);
  log('dehydrate (resumo):', JSON.stringify(estado.queries.map((q) => ({ key: q.queryKey, data: q.state.data, status: q.state.status }))));
  const cliente = novo({ staleTime: 60000 }); hydrate(cliente, JSON.parse(JSON.stringify(estado)));
  let busca = 0; let dado;
  function U() { const q = useQuery({ queryKey: ['u', 1], queryFn: async () => { busca++; return { nome: 'novo' }; } }); dado = q.data; return null; }
  render(<U />, { wrapper: wrap(cliente) });
  await act(async () => { await sleep(20); });
  log('hidratado: dado =', JSON.stringify(dado), '| buscas no cliente =', busca);
});

test('retry padrão e estado de erro', async () => {
  const qc = new QueryClient(); let n = 0; let q;
  function E() { q = useQuery({ queryKey: ['e'], queryFn: async () => { n++; throw new Error('x'); }, retryDelay: 1 }); return null; }
  render(<E />, { wrapper: wrap(qc) });
  await act(async () => { await sleep(80); });
  log('retry padrão (cliente novo): tentativas =', n, '| status =', q.status);
});
