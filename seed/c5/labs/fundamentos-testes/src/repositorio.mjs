// Repositório sobre node:sqlite (SQLite em memória ou arquivo).
import { DatabaseSync } from 'node:sqlite';
export class RepositorioPedidos {
  constructor(caminho = ':memory:') {
    this.db = new DatabaseSync(caminho);
    this.db.exec('PRAGMA foreign_keys = ON');
    this.db.exec(`CREATE TABLE IF NOT EXISTS pedidos (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente TEXT NOT NULL, total REAL NOT NULL CHECK (total >= 0), status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','pago','cancelado')), criado_em TEXT NOT NULL)`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS itens (pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE, sku TEXT NOT NULL, qtd INTEGER NOT NULL CHECK (qtd > 0), preco REAL NOT NULL)`);
  }
  salvar({ cliente, itens, total, criadoEm }) {
    this.db.exec('BEGIN');
    try {
      const r = this.db.prepare('INSERT INTO pedidos (cliente, total, criado_em) VALUES (?, ?, ?)').run(cliente, total, criadoEm);
      const id = Number(r.lastInsertRowid);
      const ins = this.db.prepare('INSERT INTO itens (pedido_id, sku, qtd, preco) VALUES (?, ?, ?, ?)');
      for (const i of itens) ins.run(id, i.sku, i.qtd, i.preco);
      this.db.exec('COMMIT');
      return id;
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  buscar(id) {
    const p = this.db.prepare('SELECT id, cliente, total, status, criado_em AS criadoEm FROM pedidos WHERE id = ?').get(id);
    if (!p) return null;
    const itens = this.db.prepare('SELECT sku, qtd, preco FROM itens WHERE pedido_id = ? ORDER BY rowid').all(id);
    return { ...p, itens: itens.map((i) => ({ ...i })) };
  }
  marcarPago(id) { return Number(this.db.prepare("UPDATE pedidos SET status = 'pago' WHERE id = ? AND status = 'novo'").run(id).changes); }
  contarPorStatus() { return Object.fromEntries(this.db.prepare('SELECT status, COUNT(*) AS n FROM pedidos GROUP BY status ORDER BY status').all().map((r) => [r.status, Number(r.n)])); }
}
