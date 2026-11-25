import express from 'express';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const doc = {
  openapi: '3.1.0', info: { title: 'API de Pedidos', version: '1.0.0' },
  paths: {
    '/pedidos': {
      post: { operationId: 'criarPedido', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/NovoPedido' } } } },
        responses: { '201': { description: 'criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pedido' } } } }, '422': { description: 'inválido' } } }
    },
    '/pedidos/{id}': { get: { operationId: 'obterPedido', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }], responses: { '200': { description: 'ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pedido' } } } }, '404': { description: 'não encontrado' } } } }
  },
  components: { schemas: {
    NovoPedido: { type: 'object', required: ['cliente', 'itens'], additionalProperties: false, properties: { cliente: { type: 'string', minLength: 3 }, email: { type: 'string', format: 'email' }, itens: { type: 'array', minItems: 1, maxItems: 50, items: { type: 'object', required: ['sku', 'qtd'], additionalProperties: false, properties: { sku: { type: 'string', pattern: '^[A-Z]{2}-\\d{3}$' }, qtd: { type: 'integer', minimum: 1, maximum: 100 } } } } } },
    Pedido: { type: 'object', required: ['id', 'cliente', 'total', 'status'], properties: { id: { type: 'integer' }, cliente: { type: 'string' }, total: { type: 'number' }, status: { enum: ['aberto', 'pago', 'cancelado'] } } }
  } }
};
console.log('== 1. validar a própria especificação');
const valido = await SwaggerParser.validate(structuredClone(doc)); console.log('OpenAPI', valido.openapi, 'válida:', Object.keys(valido.paths).join(', '));
const ruim = structuredClone(doc); ruim.paths['/pedidos'].post.responses['201'].content['application/json'].schema = { $ref: '#/components/schemas/NaoExiste' };
try { await SwaggerParser.validate(ruim); console.log('(ruim aceito)'); } catch (e) { console.log('referência quebrada recusada:', String(e.message).split('\n')[0].slice(0, 110)); }

console.log('\n== 2. validar requisições com Ajv a partir do schema');
const ajv = new Ajv2020({ allErrors: true, strict: false }); addFormats(ajv);
ajv.addSchema({ $id: 'doc', components: doc.components });
const validaNovo = ajv.compile({ $ref: 'doc#/components/schemas/NovoPedido' });
const casos = { 'válido': { cliente: 'Ana', itens: [{ sku: 'AB-123', qtd: 2 }] }, 'campo extra': { cliente: 'Ana', itens: [{ sku: 'AB-123', qtd: 2 }], admin: true }, 'sku fora do padrão e qtd 0': { cliente: 'Ana', itens: [{ sku: 'x', qtd: 0 }] }, 'email inválido e itens vazios': { cliente: 'Ana', email: 'x', itens: [] }, 'sem cliente': { itens: [{ sku: 'AB-123', qtd: 1 }] } };
for (const [nome, corpo] of Object.entries(casos)) { const ok = validaNovo(corpo); console.log(nome.padEnd(30), ok ? 'válido' : 'inválido: ' + validaNovo.errors.map((e) => (e.instancePath || '/') + ' ' + e.message).join(' | ')); }

console.log('\n== 3. teste de contrato da resposta (deriva do schema)');
const validaPedido = ajv.compile({ $ref: 'doc#/components/schemas/Pedido' });
const app = express(); app.use(express.json());
let versaoApi = 'boa';
app.get('/pedidos/:id', (req, res) => { if (versaoApi === 'boa') return res.json({ id: Number(req.params.id), cliente: 'Ana', total: 59.9, status: 'aberto' }); if (versaoApi === 'campo-removido') return res.json({ id: Number(req.params.id), cliente: 'Ana', status: 'aberto' }); if (versaoApi === 'tipo-mudou') return res.json({ id: String(req.params.id), cliente: 'Ana', total: 59.9, status: 'aberto' }); return res.json({ id: Number(req.params.id), cliente: 'Ana', total: 59.9, status: 'pendente' }); });
const srv = await new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok(s)); }); const base = 'http://127.0.0.1:' + srv.address().port;
for (const v of ['boa', 'campo-removido', 'tipo-mudou', 'valor-novo']) { versaoApi = v; const corpo = await (await fetch(base + '/pedidos/7')).json(); const ok = validaPedido(corpo); console.log(v.padEnd(15), ok ? 'respeita o contrato' : 'VIOLA o contrato: ' + validaPedido.errors.map((e) => (e.instancePath || '/') + ' ' + e.message).join(' | ')); }
srv.close();
