import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { calcularTotal, validarCupom } from '../src/dominio.mjs';
import { ServicoPedidos } from '../src/servico.mjs';

describe('calcularTotal', () => {
  test('soma e aplica desconto', () => {
    expect(calcularTotal([{ sku: 'A', preco: 10, qtd: 2 }, { sku: 'B', preco: 5.5, qtd: 1 }], { desconto: 0.1 })).toBe(22.95);
  });
  test.each([
    ['sem desconto', [{ sku: 'A', preco: 10, qtd: 3 }], {}, 30],
    ['desconto acima de 100% é limitado', [{ sku: 'A', preco: 10, qtd: 1 }], { desconto: 5 }, 0],
    ['arredondamento em centavos', [{ sku: 'A', preco: 0.1, qtd: 3 }], {}, 0.3]
  ])('%s', (_nome, itens, opcoes, esperado) => { expect(calcularTotal(itens, opcoes)).toBe(esperado); });
  test.each([[[], /pedido sem itens/], [[{ sku: 'X', preco: -1, qtd: 1 }], /preço inválido: X/], [[{ sku: 'Y', preco: 1, qtd: 1.5 }], /quantidade inválida: Y/]])('erro %#', (itens, msg) => {
    expect(() => calcularTotal(itens)).toThrow(msg);
  });
  test('toMatchInlineSnapshot do cupom', () => {
    expect(validarCupom('natal20', '2026-12-01')).toMatchInlineSnapshot(`
{
  "desconto": 0.2,
  "valido": true,
}
`);
  });
  test('toMatchObject ignora campos extras', () => { expect(validarCupom('X', '2026-12-01')).toMatchObject({ valido: false }); });
});

describe('ServicoPedidos com mocks do Jest', () => {
  const relogio = () => new Date('2026-11-25T10:00:00Z');
  let repo, pagamento, notificador, servico;
  beforeEach(() => {
    repo = { salvar: vi.fn(() => 7), marcarPago: vi.fn(() => 1) };
    pagamento = { cobrar: vi.fn(async () => ({ aprovado: true })) };
    notificador = { enviar: vi.fn(async () => {}) };
    servico = new ServicoPedidos({ repo, pagamento, notificador, relogio });
  });
  test('cobra o valor com desconto e notifica', async () => {
    await expect(servico.criar({ cliente: 'ana', itens: [{ sku: 'A', preco: 10, qtd: 2 }], cupom: 'BEMVINDO10' })).resolves.toEqual({ id: 7, status: 'pago', total: 18 });
    expect(pagamento.cobrar).toHaveBeenCalledWith({ pedidoId: 7, valor: 18 });
    expect(notificador.enviar).toHaveBeenCalledTimes(1);
    expect(notificador.enviar).toHaveBeenLastCalledWith('ana', 'Pedido 7 pago: R$ 18.00');
  });
  test('cupom expirado rejeita sem efeitos colaterais', async () => {
    const s = new ServicoPedidos({ repo, pagamento, notificador, relogio: () => new Date('2026-12-30T00:00:00Z') });
    await expect(s.criar({ cliente: 'ana', itens: [{ sku: 'A', preco: 10, qtd: 1 }], cupom: 'NATAL20' })).rejects.toThrow('cupom expirado');
    expect(repo.salvar).not.toHaveBeenCalled();
    expect(pagamento.cobrar).not.toHaveBeenCalled();
  });
  test('spyOn restaura o original', () => {
    const obj = { f: () => 'real' };
    const espiao = vi.spyOn(obj, 'f').mockReturnValue('falso');
    expect(obj.f()).toBe('falso');
    espiao.mockRestore();
    expect(obj.f()).toBe('real');
  });
});

describe('timers falsos', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  test('avança 60 s sem esperar', () => {
    const cb = vi.fn();
    setTimeout(cb, 60000);
    vi.advanceTimersByTime(59999); expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('recursos específicos do Vitest', () => {
  test('expect.soft acumula falhas sem interromper o teste', () => {
    expect.soft(1 + 1).toBe(2);
    expect.soft('a').toBe('a');
  });
  test.concurrent('concorrente A', async () => { await new Promise((r) => setTimeout(r, 30)); expect(1).toBe(1); });
  test.concurrent('concorrente B', async () => { await new Promise((r) => setTimeout(r, 30)); expect(2).toBe(2); });
  test('vi.stubGlobal e vi.stubEnv', () => {
    vi.stubEnv('MODO', 'teste');
    expect(process.env.MODO).toBe('teste');
    vi.unstubAllEnvs();
    expect(process.env.MODO).toBeUndefined();
  });
});
