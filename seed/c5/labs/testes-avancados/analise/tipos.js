// @ts-check
/** @param {number} preco @param {number} qtd @returns {number} */
export function subtotal(preco, qtd) { return preco * qtd; }

/** @param {{ nome: string, email?: string }} cliente @returns {string} */
export function dominioDoEmail(cliente) { return cliente.email.split('@')[1]; }

/** @param {string[]} itens @returns {number} */
export function contar(itens) { return itens.length; }

export const total = subtotal('10', 2);
export const n = contar([1, 2, 3]);
export const d = dominioDoEmail({ nome: 'Ana' });
/** @type {number} */
export let idade = 'trinta';
