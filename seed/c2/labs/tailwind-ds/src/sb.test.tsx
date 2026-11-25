import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useEffect, useId } from 'react';
import { fn } from 'storybook/test';

function Botao({ rotulo, perigo, onClick }: { rotulo: string; perigo?: boolean; onClick?: () => void }) { return <button className={perigo ? 'perigo' : 'primario'} onClick={onClick}>{rotulo}</button>; }
const meta = { title: 'DS/Botao', component: Botao, args: { rotulo: 'Salvar', onClick: fn() }, argTypes: { perigo: { control: 'boolean' } }, tags: ['autodocs'] };
const Primario = { args: {} };
const Perigo = { args: { perigo: true, rotulo: 'Excluir' } };
const ComClique = { args: {}, play: async ({ canvasElement, args }: any) => { const b = canvasElement.querySelector('button'); await userEvent.click(b); if (!(args.onClick as any).mock.calls.length) throw new Error('onClick não chamado'); } };

test('tdw-08 stories executadas (composeStories)', async () => {
  const { Primario: P, Perigo: Pe, ComClique: C } = composeStories({ default: meta, Primario, Perigo, ComClique } as any);
  const r1 = render(<P />); console.log('Primario:', r1.container.innerHTML); r1.unmount();
  const r2 = render(<Pe />); console.log('Perigo:', r2.container.innerHTML); r2.unmount();
  const r3 = render(<C />); await (C as any).play({ canvasElement: r3.container }); console.log('play: ok, cliques registrados');
  console.log('args padrão da meta:', Object.keys(meta.args).join(','), '| tags:', meta.tags.join(','));
});
function Dialogo({ aoFechar }: { aoFechar: () => void }) {
  const ref = useRef<HTMLDivElement>(null); const id = useId();
  useEffect(() => { ref.current?.focus(); }, []);
  return <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id} onKeyDown={(e) => e.key === 'Escape' && aoFechar()}><h2 id={id}>Confirmar</h2></div>;
}
test('tdw-06 diálogo com foco', async () => {
  let fechou = false; render(<Dialogo aoFechar={() => { fechou = true; }} />);
  console.log('foco no diálogo:', document.activeElement === screen.getByRole('dialog'));
  await userEvent.keyboard('{Escape}'); console.log('Esc fecha com foco:', fechou);
});
