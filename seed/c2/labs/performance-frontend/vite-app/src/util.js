export function usada(n) { return n * 2; }
export function naoUsada(n) { return Array.from({ length: 200 }, (_, i) => 'texto grande numero ' + i + ' ' + n).join('|'); }
