// Exemplos mínimos de cada princípio: versão que viola e versão que respeita.

// SRP — uma classe com três motivos para mudar x três responsabilidades separadas
export class RelatorioMonolito {
  constructor(vendas) { this.vendas = vendas; this.salvos = []; }
  gerar() { const total = this.vendas.reduce((s, v) => s + v, 0); const texto = 'Total: R$ ' + total.toFixed(2); this.salvos.push(texto); return texto; }
}
export const somar = (vendas) => vendas.reduce((s, v) => s + v, 0);
export const formatarTotal = (total) => 'Total: R$ ' + total.toFixed(2);
export class ArmazemEmMemoria { constructor() { this.itens = []; } salvar(t) { this.itens.push(t); } }

// OCP — switch que cresce x registro extensível
export function descontoSwitch(tipo, valor) {
  switch (tipo) { case 'vip': return valor * 0.8; case 'func': return valor * 0.7; default: return valor; }
}
export function criarDescontos(inicial = {}) {
  const regras = { ...inicial };
  return { registrar(tipo, fn) { regras[tipo] = fn; }, aplicar(tipo, valor) { return (regras[tipo] ?? ((v) => v))(valor); } };
}

// LSP — Quadrado herda de Retangulo e quebra a expectativa x formas imutáveis com a mesma interface
export class Retangulo { constructor(l, a) { this.l = l; this.a = a; } setLargura(l) { this.l = l; } setAltura(a) { this.a = a; } area() { return this.l * this.a; } }
export class Quadrado extends Retangulo { setLargura(l) { this.l = l; this.a = l; } setAltura(a) { this.l = a; this.a = a; } }
export const retangulo = (l, a) => ({ area: () => l * a });
export const quadrado = (lado) => ({ area: () => lado * lado });

// ISP — interface gorda x interfaces pequenas
export class Humano { trabalhar() { return 'trabalhando'; } comer() { return 'comendo'; } }
export class RoboGordo { trabalhar() { return 'trabalhando'; } comer() { throw new Error('robô não come'); } }
export const funcionarioQueTrabalha = (x) => x.trabalhar();
export const comedor = (x) => x.comer();
export class Robo { trabalhar() { return 'trabalhando'; } }

// DIP — dependência concreta (relógio e banco globais) x dependências injetadas
export class LembreteAcoplado {
  lembretesDeHoje(lista) { const hoje = new Date().toISOString().slice(0, 10); return lista.filter((l) => l.data === hoje); }
}
export class ServicoLembrete {
  constructor({ relogio, repositorio }) { this.relogio = relogio; this.repositorio = repositorio; }
  deHoje() { const hoje = this.relogio().toISOString().slice(0, 10); return this.repositorio.todos().filter((l) => l.data === hoje); }
}
