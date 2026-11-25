// Padrões criacionais em JavaScript: Factory, Builder, Singleton (e o problema de estado global).
export class Pdf { constructor(d) { this.tipo = 'pdf'; this.d = d; } render() { return 'PDF:' + this.d; } }
export class Html { constructor(d) { this.tipo = 'html'; this.d = d; } render() { return '<p>' + this.d + '</p>'; } }
export function criarDocumento(tipo, dados) {
  const fabricas = { pdf: Pdf, html: Html };
  const C = fabricas[tipo];
  if (!C) throw new Error('tipo desconhecido: ' + tipo);
  return new C(dados);
}

export class ConsultaBuilder {
  #tabela; #filtros = []; #ordem = null; #limite = null;
  static de(tabela) { const b = new ConsultaBuilder(); b.#tabela = tabela; return b; }
  onde(campo, valor) { this.#filtros.push([campo, valor]); return this; }
  ordenarPor(campo) { this.#ordem = campo; return this; }
  limitar(n) { this.#limite = n; return this; }
  construir() {
    if (!this.#tabela) throw new Error('tabela obrigatória');
    const w = this.#filtros.length ? ' WHERE ' + this.#filtros.map(([c]) => c + ' = ?').join(' AND ') : '';
    const o = this.#ordem ? ' ORDER BY ' + this.#ordem : '';
    const l = this.#limite != null ? ' LIMIT ' + this.#limite : '';
    return { sql: 'SELECT * FROM ' + this.#tabela + w + o + l, params: this.#filtros.map(([, v]) => v) };
  }
}

// Singleton por módulo: o cache de módulos do ESM garante uma instância por processo
export const configuracaoGlobal = { contador: 0, incrementar() { return ++this.contador; } };
export class Contador { constructor() { this.valor = 0; } inc() { return ++this.valor; } }
export const criarContador = () => new Contador();
