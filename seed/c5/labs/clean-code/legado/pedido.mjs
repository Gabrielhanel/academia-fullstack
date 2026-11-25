// Código legado de propósito: nomes curtos, parâmetros demais, aninhamento, números mágicos, flags e comparação frouxa.
export function proc(d, t, f, c, x) {
  let r = 0;
  if (d) {
    if (d.length > 0) {
      for (let i = 0; i < d.length; i++) {
        if (d[i].q > 0) {
          if (t == 1) {
            r = r + d[i].p * d[i].q * 0.9;
          } else if (t == 2) {
            r = r + d[i].p * d[i].q * 0.8;
          } else {
            r = r + d[i].p * d[i].q;
          }
        }
      }
      if (r > 500) {
        r = r - 25;
      }
      if (f == true) {
        if (r > 1000) {
          r = r + 0;
        } else {
          if (c == 'SP') {
            r = r + 10;
          } else if (c == 'RJ') {
            r = r + 15;
          } else {
            r = r + 30;
          }
        }
      }
      if (x) {
        r = r - x;
      }
      if (r < 0) {
        r = 0;
      }
      return Math.round(r * 100) / 100;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}
