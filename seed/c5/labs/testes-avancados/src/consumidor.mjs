// Consumidor (front-end/BFF): depende dos campos id, nome e email da resposta de /clientes/:id.
export async function buscarCliente(base, id) {
  const r = await fetch(base + '/clientes/' + id);
  if (r.status === 404) throw new Error('cliente não encontrado');
  if (!r.ok) throw new Error('falha ao buscar cliente: ' + r.status);
  const c = await r.json();
  return { id: c.id, nome: c.nome, email: c.email, saudacao: 'Olá, ' + c.nome.split(' ')[0] + '!' };
}
