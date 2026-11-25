import { versao, Botao } from '@acme/ds';
import { Botao as B2 } from '@acme/ds/botao';
console.log('raiz:', versao, Botao(), '| subcaminho exportado:', B2());
try { await import('@acme/ds/dist/botao/index.js'); } catch (e) { console.log('caminho profundo:', e.code); }
try { await import('@acme/ds/src/interno.js'); } catch (e) { console.log('src:', e.code); }
console.log('css resolvido:', import.meta.resolve('@acme/ds/tokens.css').endsWith('dist/tokens.css'));
