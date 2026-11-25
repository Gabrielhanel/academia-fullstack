const papeis = { admin: ['pedido:ler', 'pedido:editar', 'pedido:apagar', 'relatorio:ler'], gerente: ['pedido:ler', 'pedido:editar', 'relatorio:ler'], cliente: ['pedido:ler', 'pedido:editar'] };
const rbac = (u, perm) => (papeis[u.papel] ?? []).includes(perm);
const abac = (u, perm, rec) => {
  if (!rbac(u, perm)) return false;                                  // 1) o papel concede a ação
  if (u.papel === 'admin') return true;
  if (u.papel === 'gerente') return rec.loja === u.loja;             // 2) gerente: só a própria loja
  return rec.donoId === u.id && (perm !== 'pedido:editar' || rec.status === 'aberto');   // 3) cliente: só o próprio pedido, e editar só se aberto
};
const users = [{ id: 1, papel: 'cliente' }, { id: 2, papel: 'cliente' }, { id: 3, papel: 'gerente', loja: 'POA' }, { id: 4, papel: 'admin' }];
const pedidos = [{ id: 10, donoId: 1, loja: 'POA', status: 'aberto' }, { id: 11, donoId: 2, loja: 'POA', status: 'aberto' }, { id: 12, donoId: 1, loja: 'SP', status: 'pago' }];
const acoes = ['pedido:ler', 'pedido:editar', 'pedido:apagar'];
let total = 0, difRbacAbac = 0; const idor = [];
for (const u of users) for (const p of pedidos) for (const a of acoes) { total++; const r = rbac(u, a), b = abac(u, a, p); if (r !== b) { difRbacAbac++; if (u.papel === 'cliente' && p.donoId !== u.id) idor.push('usuário ' + u.id + ' ' + a + ' pedido ' + p.id); } }
console.log('decisões avaliadas:', total, '| onde RBAC permite e ABAC nega:', difRbacAbac);
console.log('acessos que o RBAC puro permitiria a pedidos de outros clientes (IDOR):', idor.length, '→', idor.slice(0, 4).join('; ') + (idor.length > 4 ? '; ...' : ''));
console.log('cliente 1 edita o próprio pedido aberto (10):', abac(users[0], 'pedido:editar', pedidos[0]), '| edita o próprio pedido pago (12):', abac(users[0], 'pedido:editar', pedidos[2]), '| lê o pedido do cliente 2 (11):', abac(users[0], 'pedido:ler', pedidos[1]));
console.log('gerente de POA lê pedido de POA (11):', abac(users[2], 'pedido:ler', pedidos[1]), '| lê pedido de SP (12):', abac(users[2], 'pedido:ler', pedidos[2]), '| apaga (sem a permissão no papel):', abac(users[2], 'pedido:apagar', pedidos[0]));
console.log('papel desconhecido (negar por padrão):', abac({ id: 9, papel: 'visitante' }, 'pedido:ler', pedidos[0]));
const lojas = 5, deptos = 4; console.log('explosão de papéis (cálculo): com', lojas, 'lojas e', deptos, 'departamentos, um papel por combinação exigiria', lojas * deptos, 'papéis; uma regra ABAC "usuario.loja == recurso.loja && usuario.depto == recurso.depto" cobre todos');
