// Sobe o servidor de teste em uma porta fixa para Playwright e Cypress (PORT, padrão 4571).
import { criarServidor } from './src/servidor.mjs';
const s = criarServidor({ relogio: () => new Date('2026-11-25T10:00:00Z') });
const porta = Number(process.env.PORT || 4571);
s.server.listen(porta, '127.0.0.1', () => console.log('servidor de teste em http://127.0.0.1:' + porta));
process.on('SIGTERM', () => s.server.close(() => process.exit(0)));
