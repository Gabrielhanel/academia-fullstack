import { useState, useEffect, useActionState, useId } from 'react';
import { render, screen, act, cleanup, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';

function useLocalStorage<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try { const bruto = localStorage.getItem(chave); return bruto === null ? inicial : (JSON.parse(bruto) as T); } catch { return inicial; }
  });
  useEffect(() => { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* cota ou modo privado */ } }, [chave, valor]);
  return [valor, setValor] as const;
}
function useDebounce<T>(valor: T, ms: number) {
  const [d, setD] = useState(valor);
  useEffect(() => { const t = setTimeout(() => setD(valor), ms); return () => clearTimeout(t); }, [valor, ms]);
  return d;
}
test('rea-10 hooks customizados', async () => {
  localStorage.clear(); localStorage.setItem('quebrado', '{ruim');
  const { result, unmount } = renderHook(() => useLocalStorage('tema', 'claro'));
  console.log('inicial:', result.current[0], '| gravado:', localStorage.getItem('tema'));
  act(() => result.current[1]('escuro'));
  console.log('após set:', result.current[0], '| gravado:', localStorage.getItem('tema')); unmount();
  const outro = renderHook(() => useLocalStorage('tema', 'claro')); console.log('remontado lê do storage:', outro.result.current[0]);
  const q = renderHook(() => useLocalStorage('quebrado', 'padrão')); console.log('JSON inválido -> padrão:', q.result.current[0]);
  vi.useFakeTimers();
  const { result: r, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });
  rerender({ v: 'ab' }); rerender({ v: 'abc' });
  const antes = r.current; act(() => { vi.advanceTimersByTime(299); }); const quase = r.current; act(() => { vi.advanceTimersByTime(1); });
  console.log('debounce: antes', antes, '| 299ms', quase, '| 300ms', r.current);
  vi.useRealTimers();
});
const Esquema = z.object({ nome: z.string().trim().min(2, 'Informe ao menos 2 letras'), email: z.string().email('E-mail inválido'), idade: z.coerce.number().int().min(18, 'Maior de 18 anos') });
test('rea-11 validação por esquema', () => {
  const ok = Esquema.safeParse({ nome: ' Ana ', email: 'a@b.co', idade: '20' });
  console.log('ok:', JSON.stringify(ok.success && ok.data));
  const ruim = Esquema.safeParse({ nome: 'A', email: 'x', idade: '7' });
  console.log('erros:', JSON.stringify(!ruim.success && ruim.error.issues.map((i) => i.path.join('.') + ': ' + i.message)));
});
function Formulario() {
  const [erros, setErros] = useState<Record<string, string>>({}); const [ok, setOk] = useState(false);
  const idNome = useId();
  return <form noValidate onSubmit={(e) => { e.preventDefault(); const r = Esquema.safeParse(Object.fromEntries(new FormData(e.currentTarget))); if (r.success) { setErros({}); setOk(true); } else { setOk(false); setErros(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))); } }}>
    <label htmlFor={idNome}>Nome</label>
    <input id={idNome} name="nome" aria-invalid={!!erros.nome} aria-describedby={erros.nome ? idNome + '-erro' : undefined} />
    {erros.nome && <p id={idNome + '-erro'} role="alert">{erros.nome}</p>}
    <input name="email" aria-label="E-mail" /><input name="idade" aria-label="Idade" /><button>Enviar</button>{ok && <output>Enviado!</output>}
  </form>;
}
test('rea-11 formulário acessível', async () => {
  render(<Formulario />);
  await userEvent.click(screen.getByText('Enviar'));
  const campo = screen.getByLabelText('Nome');
  console.log('aria-invalid:', campo.getAttribute('aria-invalid'), '| descrito por:', campo.getAttribute('aria-describedby') === screen.getByRole('alert').id, '| alerta:', screen.getByRole('alert').textContent);
  await userEvent.type(campo, 'Ana'); await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.co'); await userEvent.type(screen.getByLabelText('Idade'), '30'); await userEvent.click(screen.getByText('Enviar'));
  console.log('após corrigir:', screen.queryByRole('alert') === null, screen.getByText('Enviado!').textContent);
});
type Estado = { mensagem: string; erros?: Record<string, string> };
async function acao(_prev: Estado, dados: FormData): Promise<Estado> {
  const r = Esquema.safeParse(Object.fromEntries(dados)); if (!r.success) return { mensagem: 'Corrija os campos', erros: Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])) };
  return { mensagem: 'Cadastrado: ' + r.data.nome };
}
function ComAcao() {
  const [estado, formAction, pendente] = useActionState(acao, { mensagem: '' });
  return <form action={formAction}><input name="nome" aria-label="n" defaultValue="Bia" /><input name="email" aria-label="e" defaultValue="b@c.de" /><input name="idade" aria-label="i" defaultValue="19" /><button disabled={pendente}>Salvar</button><p role="status">{estado.mensagem}</p></form>;
}
test('rea-11 useActionState', async () => {
  render(<ComAcao />); await userEvent.click(screen.getByText('Salvar'));
  await screen.findByText(/Cadastrado/);
  console.log('useActionState:', screen.getByRole('status').textContent);
  console.log('react-dom form action em jsdom ok');
});
