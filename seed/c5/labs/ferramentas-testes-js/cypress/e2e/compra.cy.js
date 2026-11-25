describe('Compra (Cypress, com retentativa automática de comandos e asserções)', () => {
  it('compra com sucesso', () => {
    cy.visit('/');
    cy.get('#qtd').clear().type('2');
    cy.contains('button', 'Comprar').click();
    cy.get('[role=status]').invoke('text').should('match', /Pedido \d+ pago: R\$ 20\.00/);
  });
  it('cupom desconhecido mostra o erro', () => {
    cy.visit('/');
    cy.get('#cupom').type('XYZ');
    cy.contains('button', 'Comprar').click();
    cy.get('[role=status]').should('have.text', 'Erro: cupom desconhecido');
  });
  [0, 100, 200, 300].forEach((atraso) => {
    it('espera automática com resposta atrasada em ' + atraso + ' ms', () => {
      cy.visit('/?atraso=' + atraso);
      cy.contains('button', 'Comprar').click();
      cy.get('[role=status]').invoke('text').should('match', /^Pedido \d+ pago/);
    });
  });
  it('cy.intercept simula falha do servidor', () => {
    cy.intercept('POST', '/pedidos', { statusCode: 422, body: { erro: 'estoque indisponível' } }).as('pedido');
    cy.visit('/');
    cy.contains('button', 'Comprar').click();
    cy.wait('@pedido');
    cy.get('[role=status]').should('have.text', 'Erro: estoque indisponível');
  });
});
