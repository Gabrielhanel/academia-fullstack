import fs from 'node:fs';
import { memo, useCallback, useMemo, useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
const out = []; const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.writeFileSync('out-pfe7.txt', '=== PFE7 ===\n' + out.join('\n') + '\n'));
test('memo, useCallback e useMemo: contagem de renders e de cálculos', async () => {
  const user = userEvent.setup(); const c = { filhoSemMemo: 0, filhoMemoCallbackNovo: 0, filhoMemoCallbackEstavel: 0, calculoSemMemo: 0, calculoComMemo: 0 };
  const FilhoSemMemo = ({ onX }) => { c.filhoSemMemo++; return <i />; };
  const FilhoMemoNovo = memo(({ onX }) => { c.filhoMemoCallbackNovo++; return <i />; });
  const FilhoMemoEstavel = memo(({ onX }) => { c.filhoMemoCallbackEstavel++; return <i />; });
  const lista = Array.from({ length: 1000 }, (_, i) => i);
  function Pai() {
    const [n, setN] = useState(0); const [busca] = useState('1');
    const aoClicar = useCallback(() => {}, []);
    const semMemo = lista.filter((x) => { c.calculoSemMemo++; return String(x).includes(busca); });
    const comMemo = useMemo(() => lista.filter((x) => { c.calculoComMemo++; return String(x).includes(busca); }), [busca]);
    return <div><button onClick={() => setN(n + 1)}>+{n}</button><FilhoSemMemo onX={() => {}} /><FilhoMemoNovo onX={() => {}} /><FilhoMemoEstavel onX={aoClicar} />{semMemo.length + comMemo.length}</div>;
  }
  render(<Pai />);
  const ini = { ...c };
  for (let i = 0; i < 5; i++) await user.click(screen.getByRole('button'));
  log('após 5 cliques que só mudam o estado n (extras):', JSON.stringify(Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v - ini[k]]))));
  log('montagem:', JSON.stringify(ini));
});
test('custo: filtrar 100000 itens', () => {
  const lista = Array.from({ length: 100000 }, (_, i) => i); const t0 = performance.now();
  for (let i = 0; i < 10; i++) lista.filter((x) => String(x).includes('99'));
  log('10 filtros de 100000 itens (jsdom/Node): ~', Math.round((performance.now() - t0) / 10), 'ms por filtro');
});
