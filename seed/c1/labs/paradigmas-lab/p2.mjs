// herança x composição
class Animal { constructor(n){this.nome=n;} falar(){ return `${this.nome} faz um som`; } }
class Cachorro extends Animal { falar(){ return `${super.falar()}: au`; } }
console.log(new Cachorro('Rex').falar());
const podeVoar = (s) => ({ voar: () => `${s.nome} voa` });
const podeNadar = (s) => ({ nadar: () => `${s.nome} nada` });
const pato = { nome: 'Pato' }; Object.assign(pato, podeVoar(pato), podeNadar(pato));
console.log(pato.voar(), pato.nadar());
// polimorfismo por contrato (duck typing)
const formas = [{ area: () => 3 * 3 }, { area: () => Math.PI * 2 ** 2 }];
console.log(formas.map((f) => f.area().toFixed(2)));
// injeção de dependência
class Notificador { constructor(canal){this.canal=canal;} avisar(m){ return this.canal.enviar(m); } }
const fake = { enviado: [], enviar(m){ this.enviado.push(m); return true; } };
new Notificador(fake).avisar('oi'); console.log(fake.enviado);
// fragile base: mutação compartilhada
class Lista { constructor(){this.itens=[];} add(x){this.itens.push(x);} addTodos(xs){ xs.forEach((x)=>this.add(x)); } }
class Contada extends Lista { total=0; add(x){ this.total++; super.add(x);} addTodos(xs){ this.total+=xs.length; super.addTodos(xs);} }
const l = new Contada(); l.addTodos([1,2,3]); console.log(l.total, l.itens.length);
