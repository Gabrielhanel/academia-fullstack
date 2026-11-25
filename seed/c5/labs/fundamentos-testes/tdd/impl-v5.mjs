export function somar(t) {
  if (t === '') return 0;
  let sep = /[,\n]/;
  if (t.startsWith('//')) { const i = t.indexOf('\n'); sep = new RegExp('[' + t.slice(2, i).replace(/[\\\]^-]/g, '\\$&') + '\\n]'); t = t.slice(i + 1); }
  const nums = t.split(sep).map(Number);
  const neg = nums.filter((n) => n < 0);
  if (neg.length) throw new Error('negativos não permitidos: ' + neg.join(','));
  return nums.reduce((s, n) => s + n, 0);
}
