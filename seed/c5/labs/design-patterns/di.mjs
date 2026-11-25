// Injeção de dependência: manual (raiz de composição) e um contêiner mínimo com ciclos de vida.
export class RepositorioMemoria { constructor() { this.itens = []; } salvar(x) { this.itens.push(x); return x; } todos() { return [...this.itens]; } }
export class ServicoCadastro {
  constructor({ repo, relogio, id }) { Object.assign(this, { repo, relogio, id }); }
  cadastrar(nome) { return this.repo.salvar({ id: this.id(), nome, em: this.relogio().toISOString() }); }
}
export function raizDeComposicao() { let n = 0; return new ServicoCadastro({ repo: new RepositorioMemoria(), relogio: () => new Date(), id: () => ++n }); }

export class Container {
  #registros = new Map(); #unicos = new Map(); criacoes = {};
  registrar(nome, fabrica, { ciclo = 'singleton' } = {}) { this.#registros.set(nome, { fabrica, ciclo }); return this; }
  resolver(nome, pilha = []) {
    if (pilha.includes(nome)) throw new Error('dependência circular: ' + [...pilha, nome].join(' → '));
    const r = this.#registros.get(nome); if (!r) throw new Error('não registrado: ' + nome);
    if (r.ciclo === 'singleton' && this.#unicos.has(nome)) return this.#unicos.get(nome);
    this.criacoes[nome] = (this.criacoes[nome] || 0) + 1;
    const obj = r.fabrica((n) => this.resolver(n, [...pilha, nome]));
    if (r.ciclo === 'singleton') this.#unicos.set(nome, obj);
    return obj;
  }
}
// Service locator (anti-padrão): dependência escondida em um registro global
export const registroGlobal = { servicos: {}, obter(n) { return this.servicos[n]; } };
export class ServicoComLocator { cadastrar(nome) { return registroGlobal.obter('repo').salvar({ nome }); } }
