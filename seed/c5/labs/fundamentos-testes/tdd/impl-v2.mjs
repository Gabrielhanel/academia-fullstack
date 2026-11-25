export function somar(t) { if (t === '') return 0; return t.split(',').reduce((s, n) => s + Number(n), 0); }
