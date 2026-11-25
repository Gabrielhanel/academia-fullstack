import { useState, useRef, useId, createContext, useContext, Children, isValidElement, cloneElement, type ElementType, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function Contador({ nome }: { nome: string }) { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>{nome}:{n}</button>; }
test('rav-02 identidade: posição, tipo e chave', async () => {
  function A({ trocar, mesmoTipo, chave }: { trocar: boolean; mesmoTipo: boolean; chave?: string }) {
    return <div>{trocar ? (mesmoTipo ? <Contador key={chave} nome="x" /> : <p>outro</p>) : <Contador key={chave} nome="x" />}</div>;
  }
  const r = render(<A trocar={false} mesmoTipo />); await userEvent.click(screen.getByRole('button')); await userEvent.click(screen.getByRole('button'));
  r.rerender(<A trocar mesmoTipo />); console.log('mesmo tipo e posição (estado mantido):', screen.getByRole('button').textContent);
  r.rerender(<A trocar mesmoTipo={false} />); r.rerender(<A trocar={false} mesmoTipo />); console.log('tipo diferente no meio (desmontou):', screen.getByRole('button').textContent);
  await userEvent.click(screen.getByRole('button')); r.rerender(<A trocar mesmoTipo chave="b" />); console.log('chave diferente (reset):', screen.getByRole('button').textContent);
});
test('rav-02 componente definido dentro de outro', async () => {
  let montagens = 0;
  function Pai() {
    const [t, setT] = useState(0);
    function Interno() { const [n, setN] = useState(0); const ref = useRef(false); if (!ref.current) { ref.current = true; } return <button onClick={() => setN(n + 1)}>i:{n}</button>; }
    return <><button onClick={() => setT(t + 1)}>pai{t}</button><Interno /></>;
  }
  render(<Pai />); await userEvent.click(screen.getByText('i:0')); await userEvent.click(screen.getByText('i:1'));
  console.log('antes de re-renderizar o pai:', screen.getByText(/^i:/).textContent);
  await userEvent.click(screen.getByText('pai0')); console.log('depois que o pai re-renderiza (Interno recriado):', screen.getByText(/^i:/).textContent);
  function Interno2() { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>j:{n}</button>; }
  function Pai2() { const [t, setT] = useState(0); return <><button onClick={() => setT(t + 1)}>pai2-{t}</button><Interno2 /></>; }
  render(<Pai2 />); await userEvent.click(screen.getByText('j:0')); await userEvent.click(screen.getByText('pai2-0')); console.log('definido fora do pai (estado mantido):', screen.getByText(/^j:/).textContent);
});
test('rav-02 lista com e sem chave estável; estado em posições', async () => {
  function Lista({ itens, chave }: { itens: string[]; chave: (s: string, i: number) => string }) { return <ul>{itens.map((s, i) => <li key={chave(s, i)}><Contador nome={s} /></li>)}</ul>; }
  const r = render(<Lista itens={['a', 'b', 'c']} chave={(s) => s} />);
  await userEvent.click(screen.getByText('a:0')); await userEvent.click(screen.getByText('a:1'));
  r.rerender(<Lista itens={['c', 'a', 'b']} chave={(s) => s} />); console.log('key=id, a vai ao meio:', screen.getAllByRole('button').map((b) => b.textContent).join(' '));
  cleanup(); const r2 = render(<Lista itens={['a', 'b', 'c']} chave={(_, i) => String(i)} />);
  await userEvent.click(screen.getByText('a:0')); await userEvent.click(screen.getByText('a:1'));
  r2.rerender(<Lista itens={['c', 'a', 'b']} chave={(_, i) => String(i)} />); console.log('key=índice, mesma troca:', screen.getAllByRole('button').map((b) => b.textContent).join(' '));
});
// compound components
type Ctx = { ativo: string; setAtivo: (v: string) => void; base: string };
const TabsCtx = createContext<Ctx | null>(null);
const useTabs = () => { const c = useContext(TabsCtx); if (!c) throw new Error('Tabs.* fora de <Tabs>'); return c; };
function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) { const [ativo, setAtivo] = useState(defaultValue); const base = useId(); return <TabsCtx value={{ ativo, setAtivo, base }}>{children}</TabsCtx>; }
Tabs.List = function List({ children }: { children: ReactNode }) { return <div role="tablist">{children}</div>; };
Tabs.Tab = function Tab({ value, children }: { value: string; children: ReactNode }) { const { ativo, setAtivo, base } = useTabs(); const sel = ativo === value; return <button role="tab" id={base + '-t-' + value} aria-selected={sel} aria-controls={base + '-p-' + value} tabIndex={sel ? 0 : -1} onClick={() => setAtivo(value)}>{children}</button>; };
Tabs.Panel = function Panel({ value, children }: { value: string; children: ReactNode }) { const { ativo, base } = useTabs(); return ativo === value ? <div role="tabpanel" id={base + '-p-' + value} aria-labelledby={base + '-t-' + value}>{children}</div> : null; };
test('rav-03 compound components', async () => {
  render(<Tabs defaultValue="a"><Tabs.List><Tabs.Tab value="a">A</Tabs.Tab><div><Tabs.Tab value="b">B</Tabs.Tab></div></Tabs.List><Tabs.Panel value="a">painel A</Tabs.Panel><Tabs.Panel value="b">painel B</Tabs.Panel></Tabs>);
  console.log('tab B (embrulhada em div) funciona:', await (async () => { await userEvent.click(screen.getByRole('tab', { name: 'B' })); return screen.getByRole('tabpanel').textContent; })());
  console.log('selecionada:', screen.getAllByRole('tab').map((t) => t.textContent + '=' + t.getAttribute('aria-selected')).join(' '), '| painel rotulado por:', screen.getByRole('tabpanel', { name: 'B' }) !== null);
  const err = console.error; console.error = () => {}; try { render(<Tabs.Tab value="x">x</Tabs.Tab>); } catch (e: any) { console.log('fora do Tabs:', e.message); } console.error = err;
  // alternativa frágil: cloneElement/Children
  function TabsFragil({ children }: { children: ReactNode }) { const [i, setI] = useState(0); return <div>{Children.map(children, (c, idx) => (isValidElement(c) ? cloneElement(c as any, { ativo: idx === i, aoClicar: () => setI(idx) }) : c))}</div>; }
  const Item = ({ ativo, aoClicar, children }: any) => <button aria-pressed={!!ativo} onClick={aoClicar}>{children}</button>;
  render(<TabsFragil><Item>1</Item><div><Item>2</Item></div></TabsFragil>);
  await userEvent.click(screen.getByText('2')); console.log('Children.map + cloneElement com item embrulhado: pressed =', screen.getByText('2').getAttribute('aria-pressed'));
});
