import http from 'node:http'; import fs from 'node:fs';
const atrasos = { '/hero.jpg': 500, '/slow.css': 300, '/slow.js': 300, '/hero.webp': 500 };
const tipos = { '.jpg': 'image/jpeg', '.webp': 'image/webp', '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };
const ruim = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ruim</title>
<link rel="stylesheet" href="/slow.css"><script src="/slow.js"></script></head><body>
<h1>Loja</h1><p>Texto acima da imagem.</p><img src="/hero.jpg" alt="Equipe"><p id="abaixo">Texto abaixo da imagem que será empurrado.</p><button id="b">Clique</button>
<script>document.getElementById('b').addEventListener('click',()=>{const t=performance.now();while(performance.now()-t<350){}document.getElementById('b').textContent='feito';});
const t=performance.now();while(performance.now()-t<400){}</script></body></html>`;
const bom = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bom</title>
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high"><style>body{font-family:sans-serif}h1{margin:8px 0}img{max-width:100%;height:auto}</style></head><body>
<h1>Loja</h1><p>Texto acima da imagem.</p><img src="/hero.webp" alt="Equipe" width="1200" height="630" fetchpriority="high"><p id="abaixo">Texto abaixo da imagem, sem empurrão.</p><button id="b">Clique</button>
<script defer>document.getElementById('b').addEventListener('click',()=>{document.getElementById('b').textContent='feito';});</script></body></html>`;
const cls = (img) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CLS</title><style>body{font-family:sans-serif;margin:0}img{max-width:100%;height:auto}</style></head><body><h1>Loja</h1><p>Texto acima da imagem.</p>${img}<p id="abaixo">Texto abaixo da imagem.</p><button id="b">Clique</button>
<script>document.getElementById('b').addEventListener('click',()=>{const t=performance.now();while(performance.now()-t<350){}document.getElementById('b').textContent='feito';});</script></body></html>`;
const lento = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>INP</title></head><body><button id="b">Clique</button>
<script>
const b=document.getElementById('b');
b.addEventListener('click',()=>{const t=performance.now();while(performance.now()-t<350){}b.textContent='feito';});
</script></body></html>`;
const quebrado = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>INP2</title></head><body><button id="b">Clique</button>
<script>
const b=document.getElementById('b');
b.addEventListener('click',()=>{b.textContent='feito';setTimeout(async()=>{for(let i=0;i<7;i++){const t=performance.now();while(performance.now()-t<50){}await new Promise(r=>setTimeout(r,0));}},0);});
</script></body></html>`;
http.createServer((req, res) => {
  const u = req.url.split('?')[0];
  const enviar = () => {
    if (u === '/ruim.html') { res.setHeader('content-type', tipos['.html']); return res.end(ruim); }
    if (u === '/bom.html') { res.setHeader('content-type', tipos['.html']); return res.end(bom); }
    if (u === '/cls-ruim.html') { res.setHeader('content-type', tipos['.html']); return res.end(cls('<img src="/hero.jpg" alt="Equipe">')); }
    if (u === '/cls-bom.html') { res.setHeader('content-type', tipos['.html']); return res.end(cls('<img src="/hero.jpg" alt="Equipe" width="1200" height="630">')); }
    if (u === '/inp-lento.html') { res.setHeader('content-type', tipos['.html']); return res.end(lento); }
    if (u === '/inp-dividido.html') { res.setHeader('content-type', tipos['.html']); return res.end(quebrado); }
    if (u === '/slow.css') { res.setHeader('content-type', tipos['.css']); return res.end('body{font-family:sans-serif}'); }
    if (u === '/slow.js') { res.setHeader('content-type', tipos['.js']); return res.end('window.__x=1;'); }
    const f = 'pub' + u; if (fs.existsSync(f)) { res.setHeader('content-type', tipos[f.slice(f.lastIndexOf('.'))]); return res.end(fs.readFileSync(f)); }
    res.statusCode = 404; res.end('x');
  };
  setTimeout(enviar, atrasos[u] || 0);
}).listen(3120, () => console.log('ok'));
