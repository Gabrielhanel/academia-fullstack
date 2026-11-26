// Scanner didático de segredos: regras por padrão + entropia de Shannon. Uso: node scanner.mjs < texto   (lê stdin; imprime achados com valor mascarado)
import fs from 'node:fs';
export const REGRAS = [
  { id: 'aws-access-key-id', re: /\b(AKIA|ASIA)[A-Z2-7]{16}\b/g },
  { id: 'github-token', re: /\bgh[pousr]_[A-Za-z0-9]{36}\b/g },
  { id: 'chave-privada', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { id: 'atribuicao-generica', re: /\b[A-Za-z0-9_]*(?:api[_-]?key|secret|token|password|passwd|senha)[A-Za-z0-9_]*\s*[:=]\s*["']?([A-Za-z0-9\/+_\-=.]{12,})["']?/gi, grupo: 1 }
];
export const entropia = (s) => { const f = {}; for (const c of s) f[c] = (f[c] || 0) + 1; return -Object.values(f).reduce((a, n) => a + (n / s.length) * Math.log2(n / s.length), 0); };
export const mascarar = (v) => (v.length <= 8 ? '****' : v.slice(0, 4) + '…' + '*'.repeat(4) + ' (' + v.length + ' car.)');
export function varrer(texto, { limiteEntropia = 3.5 } = {}) {
  const achados = [];
  texto.split('\n').forEach((linha, i) => {
    for (const r of REGRAS) for (const m of linha.matchAll(r.re)) {
      const v = r.grupo ? m[r.grupo] : m[0];
      if (r.id === 'atribuicao-generica' && (entropia(v) < limiteEntropia || /process\.env|exemplo|changeme|placeholder/i.test(linha))) continue;
      achados.push({ linha: i + 1, regra: r.id, valor: mascarar(v), entropia: +entropia(v).toFixed(2) });
    }
  });
  return achados;
}
if (process.argv[1].endsWith('scanner.mjs')) { const a = varrer(fs.readFileSync(0, 'utf8')); a.forEach((x) => console.log(`  linha ${x.linha}: ${x.regra} ${x.valor} entropia=${x.entropia}`)); console.log(`  total: ${a.length} achado(s)`); }
