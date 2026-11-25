import pino from 'pino';
const chunks = []; const log = pino({ level: 'info', redact: ['senha', 'req.headers.authorization'] }, { write: (s) => chunks.push(s) });
log.info({ rota: '/pedidos', ms: 12, senha: 'segredo', req: { headers: { authorization: 'Bearer abc' } } }, 'requisição concluída');
log.debug('não aparece com level info');
const o = JSON.parse(chunks[0]); console.log('linhas emitidas:', chunks.length, '| campos:', Object.keys(o).join(','), '| senha =', o.senha, '| authorization =', o.req.headers.authorization);
