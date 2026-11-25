import fs from 'node:fs';
import pixelmatch from 'pixelmatch';
const out = []; const log = (...a) => out.push(a.join(' '));
afterAll(() => fs.appendFileSync('out.txt', '=== TFE3 ===\n' + out.join('\n') + '\n'));
const img = (w, h, f) => { const b = new Uint8Array(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, bl] = f(x, y); const i = (y * w + x) * 4; b[i] = r; b[i + 1] = g; b[i + 2] = bl; b[i + 3] = 255; } return b; };
test('pixelmatch: capturas iguais, com ruído e com mudança', () => {
  const a = img(20, 20, () => [255, 255, 255]);
  const b = img(20, 20, () => [255, 255, 255]);
  log('iguais: pixels diferentes =', pixelmatch(a, b, null, 20, 20));
  const c = img(20, 20, (x, y) => (x < 5 && y < 5 ? [0, 0, 0] : [255, 255, 255]));
  log('quadrado 5x5 preto: pixels diferentes =', pixelmatch(a, c, null, 20, 20));
  const d = img(20, 20, () => [250, 250, 250]);
  log('ruído leve (250 vs 255), threshold 0.1: =', pixelmatch(a, d, null, 20, 20, { threshold: 0.1 }), '| threshold 0: =', pixelmatch(a, d, null, 20, 20, { threshold: 0 }));
});
test('flaky: dependência de relógio e ordem', () => {
  const t = []; for (let i = 0; i < 3; i++) t.push(Date.now() % 2);
  log('valores dependentes do relógio variam entre execuções (exemplo ilustrativo):', t.length);
});
