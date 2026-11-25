import express from 'express';
const a = express(); a.use(express.json());
a.post('/p', (req, res) => res.json({ tipo: typeof req.body, ehUndefined: req.body === undefined }));
const b = express(); b.post('/p', (req, res) => res.json({ tipo: typeof req.body, ehUndefined: req.body === undefined }));
for (const [rot, app] of [['com express.json(), POST sem corpo', a], ['sem parser, POST com JSON', b]]) {
  const s = await new Promise((ok) => { const x = app.listen(0, '127.0.0.1', () => ok(x)); });
  const r = await fetch('http://127.0.0.1:' + s.address().port + '/p', { method: 'POST', headers: { 'content-type': 'application/json' }, body: rot.startsWith('sem') ? '{"a":1}' : undefined });
  console.log(rot.padEnd(36), await r.text()); s.close();
}
