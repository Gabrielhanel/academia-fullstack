import { criarProvedor } from './src/provedor.mjs';
const s = criarProvedor().listen(Number(process.env.PORT || 4580), '127.0.0.1', () => console.log('provedor em http://127.0.0.1:' + s.address().port));
process.on('SIGTERM', () => s.close(() => process.exit(0)));
