import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import axe from 'axe-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, useId, type ComponentProps } from 'react';

const cn = (...c: Parameters<typeof clsx>) => twMerge(clsx(...c));
test('tdw-04 cn: conflitos e condicionais', () => {
  console.log('twMerge conflito:', twMerge('p-2 p-4', 'text-sm text-lg', 'bg-red-500 bg-blue-500'));
  console.log('sem conflito (variantes diferentes):', twMerge('hover:bg-red-500 bg-blue-500 md:p-2 p-4'));
  console.log('clsx:', clsx('a', false && 'b', { c: true, d: 0 }, ['e', null, 'f']));
  console.log('cn ordem importa:', cn('px-2 py-1', 'px-4'), '|', cn('px-4', 'px-2 py-1'));
  console.log('custom nao reconhecida:', twMerge('btn-primary btn-secondary'));
});
const botao = cva('inline-flex items-center rounded-md font-medium focus-visible:outline-2 disabled:opacity-50', {
  variants: { variante: { primario: 'bg-marca-600 text-white', perigo: 'bg-red-600 text-white', fantasma: 'bg-transparent' }, tamanho: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' } },
  compoundVariants: [{ variante: 'perigo', tamanho: 'sm', class: 'uppercase' }],
  defaultVariants: { variante: 'primario', tamanho: 'md' }
});
type BotaoProps = ComponentProps<'button'> & VariantProps<typeof botao>;
function Botao({ variante, tamanho, className, ...r }: BotaoProps) { return <button className={cn(botao({ variante, tamanho }), className)} {...r} />; }
test('tdw-04 cva', () => {
  console.log('padrão:', botao());
  console.log('perigo sm:', botao({ variante: 'perigo', tamanho: 'sm' }));
  console.log('className do consumidor vence:', render(<Botao className="h-12">x</Botao>).container.querySelector('button')!.className);
  // @ts-expect-error variante inválida
  console.log('variante inválida (ignorada):', botao({ variante: 'xyz' }));
});
function Dialogo({ aberto, aoFechar, titulo, children }: { aberto: boolean; aoFechar: () => void; titulo: string; children: React.ReactNode }) {
  const id = useId();
  if (!aberto) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby={id} onKeyDown={(e) => e.key === 'Escape' && aoFechar()}><h2 id={id}>{titulo}</h2>{children}<button onClick={aoFechar}>Fechar</button></div>;
}
test('tdw-06 acessibilidade com axe', async () => {
  const bom = render(<main><label htmlFor="e">E-mail</label><input id="e" /><Botao>Salvar</Botao></main>);
  const r1 = await axe.run(bom.container); console.log('axe bom:', r1.violations.length, 'violações');
  bom.unmount();
  const ruim = render(<main><input /><button></button><img src="x" /></main>);
  const r2 = await axe.run(ruim.container); console.log('axe ruim:', r2.violations.map((v) => v.id).sort().join(','));
  ruim.unmount();
  let aberto = true; const { rerender } = render(<Dialogo aberto titulo="Confirmar" aoFechar={() => { aberto = false; }}><p>Tem certeza?</p></Dialogo>);
  console.log('diálogo nomeado:', screen.getByRole('dialog', { name: 'Confirmar' }) !== null);
  await userEvent.type(screen.getByRole('dialog'), '{Escape}'); console.log('Esc fecha:', aberto === false);
});
