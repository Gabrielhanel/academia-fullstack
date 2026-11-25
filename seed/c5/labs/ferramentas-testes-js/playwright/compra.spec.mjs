import { test, expect } from '@playwright/test';

test('compra com sucesso (locators por rótulo e papel, com auto-espera)', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cliente').fill('ana');
  await page.getByLabel('Qtd').fill('2');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByRole('status')).toHaveText(/Pedido \d+ pago: R\$ 20\.00/);
});

test('cupom desconhecido mostra o erro', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cupom').fill('XYZ');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByRole('status')).toHaveText('Erro: cupom desconhecido');
});

test('cupom válido aplica 10% de desconto', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cupom').fill('BEMVINDO10');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByRole('status')).toContainText('R$ 18.00');
});

// A mesma página com resposta atrasada de 0 a 300 ms: sem sleep, a auto-espera do expect cobre todos os casos
for (const atraso of [0, 50, 100, 150, 200, 250, 300]) {
  test('auto-espera com resposta atrasada em ' + atraso + ' ms', async ({ page }) => {
    await page.goto('/?atraso=' + atraso);
    await page.getByRole('button', { name: 'Comprar' }).click();
    await expect(page.getByRole('status')).toHaveText(/^Pedido \d+ pago/);
  });
}

test('intercepta a rede (mock de API) para simular uma falha do servidor', async ({ page }) => {
  await page.route('**/pedidos', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ erro: 'estoque indisponível' }) }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByRole('status')).toHaveText('Erro: estoque indisponível');
});
