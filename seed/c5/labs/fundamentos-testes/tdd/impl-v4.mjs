export function somar(t) {
  if (t === '') return 0;
  let sep = /[,\n]/;
  if (t.startsWith('//')) { const i = t.indexOf('\n'); sep = new RegExp('[' + t.slice(2, i).replace(/[\\\]^-]/g, '\\$&') + '\\n]'); t = t.slice(i + 1); }
  return t.split(sep).reduce((s, n) => s + Number(n), 0);
}
