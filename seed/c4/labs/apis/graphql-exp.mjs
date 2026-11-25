import { buildSchema, graphql, parse, validate, specifiedRules, GraphQLError, introspectionFromSchema, getIntrospectionQuery } from 'graphql';
import DataLoader from 'dataloader';
import { createServer } from 'node:http';
import { createYoga, createSchema } from 'graphql-yoga';

const autores = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, nome: 'Autor ' + (i + 1) }));
const posts = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, titulo: 'Post ' + (i + 1), autorId: (i % 20) + 1 }));
const sdl = `
  type Autor { id: ID! nome: String! posts: [Post!]! }
  type Post { id: ID! titulo: String! autor: Autor! }
  type Query { posts(limite: Int = 10): [Post!]! autor(id: ID!): Autor falha: String }
`;
let consultasAutor = 0, consultasPosts = 0;
const buscarAutores = async (ids) => { consultasAutor++; return ids.map((id) => autores.find((a) => a.id === Number(id))); };
const resolversIngenuos = { Query: { posts: (_, { limite }) => posts.slice(0, limite), autor: (_, { id }) => buscarAutores([id]).then((r) => r[0]), falha: () => { throw new Error('falha de propósito'); } }, Post: { autor: (p) => buscarAutores([p.autorId]).then((r) => r[0]) }, Autor: { posts: (a) => { consultasPosts++; return posts.filter((p) => p.autorId === a.id); } } };
const resolversLoader = { ...resolversIngenuos, Post: { autor: (p, _, ctx) => ctx.autores.load(p.autorId) } };
const schemaDe = (r) => createSchema({ typeDefs: sdl, resolvers: r });
const consulta = '{ posts(limite: 50) { titulo autor { nome } } }';
import { execute } from 'graphql';
console.log('graphql', (await import('graphql')).version);
console.log('== 1. N+1 e DataLoader (50 posts de 20 autores)');
consultasAutor = 0; let r = await execute({ schema: schemaDe(resolversIngenuos), document: parse(consulta), contextValue: {} });
console.log('sem DataLoader: consultas a autores =', consultasAutor, '| posts devolvidos =', r.data.posts.length);
consultasAutor = 0; r = await execute({ schema: schemaDe(resolversLoader), document: parse(consulta), contextValue: { autores: new DataLoader(buscarAutores) } });
console.log('com DataLoader: consultas a autores =', consultasAutor, '(uma por lote) | posts devolvidos =', r.data.posts.length);

console.log('\n== 2. erros parciais e status HTTP (GraphQL Yoga)');
const yoga = createYoga({ schema: schemaDe(resolversIngenuos), logging: false, graphiql: false });
const srv = createServer(yoga); await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/graphql';
const post = async (query) => { const x = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }) }); return { s: x.status, j: await x.json() }; };
let x = await post('{ posts(limite: 2) { titulo } falha }'); console.log('um campo falha:', x.s, JSON.stringify(x.j).slice(0, 170));
x = await post('{ posts { campoInexistente } }'); console.log('consulta inválida:', x.s, x.j.errors[0].message.slice(0, 80));
x = await fetch(url + '?query=%7Bposts%7Btitulo%7D%7D'); console.log('GET com query:', x.status);
srv.close();

console.log('\n== 3. profundidade: consulta cíclica e limite');
const profundidade = (doc) => { let max = 0; const visita = (sel, d) => { for (const s of sel.selectionSet?.selections ?? []) { max = Math.max(max, d + 1); visita(s, d + 1); } }; for (const def of doc.definitions) if (def.kind === 'OperationDefinition') visita(def, 0); return max; };
const profunda = '{ posts(limite: 1) { autor { posts { autor { posts { autor { posts { titulo } } } } } } } }';
console.log('profundidade da consulta cíclica:', profundidade(parse(profunda)), '| da simples:', profundidade(parse(consulta)));
const regraProfundidade = (limite) => (ctx) => ({ OperationDefinition(node) { const p = profundidade({ definitions: [node] }); if (p > limite) ctx.reportError(new GraphQLError('profundidade ' + p + ' excede o limite ' + limite)); } });
const schema = schemaDe(resolversIngenuos);
for (const q of [consulta, profunda]) { const erros = validate(schema, parse(q), [...specifiedRules, regraProfundidade(5)]); console.log(q.slice(0, 40).padEnd(42), erros.length ? 'recusada: ' + erros[0].message : 'aceita'); }
const ciclica = (n) => { let q = 'titulo'; for (let i = 0; i < n; i++) q = i % 2 === 0 ? 'autor { nome posts { ' + q + ' } }' : q; return '{ posts(limite: 20) { ' + q + ' } }'; };
for (const n of [1, 3, 5, 7]) { const q = ciclica(n); const t0 = performance.now(); const rr = await execute({ schema, document: parse(q), contextValue: {} }); console.log('níveis autor->posts =', n, '| profundidade', profundidade(parse(q)), '| tempo', (performance.now() - t0).toFixed(1), 'ms | resposta', JSON.stringify(rr).length, 'bytes'); }

console.log('\n== 4. introspecção');
const intro = introspectionFromSchema(schema); console.log('tipos no schema (inclui os internos):', intro.__schema.types.length, '| tipos do domínio:', intro.__schema.types.filter((t) => !t.name.startsWith('__') && ['Autor', 'Post', 'Query'].includes(t.name)).map((t) => t.name).join(', '));
