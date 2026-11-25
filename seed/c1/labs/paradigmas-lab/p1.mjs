class ContaBancaria {
  #saldo = 0;
  #historico = [];
  constructor(titular) { this.titular = titular; }
  depositar(v) {
    if (!(v > 0)) throw new RangeError('valor deve ser positivo');
    this.#saldo += v; this.#historico.push({ tipo: 'deposito', v });
    return this;
  }
  sacar(v) {
    if (v > this.#saldo) throw new Error('saldo insuficiente');
    this.#saldo -= v; this.#historico.push({ tipo: 'saque', v });
    return this;
  }
  get saldo() { return this.#saldo; }
  extrato() { return this.#historico.map((h) => `${h.tipo}:${h.v}`); }
}
const c = new ContaBancaria('Ana').depositar(100).sacar(30);
console.log(c.saldo, c.extrato());
try { c.sacar(500); } catch (e) { console.log(e.message); }
console.log(c.saldo === 70, Object.keys(c), typeof c.saldo);
try { eval('c.#saldo'); } catch (e) { console.log(e.name); }
c.saldo = 999; console.log(c.saldo);
