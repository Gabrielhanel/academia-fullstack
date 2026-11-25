import StyleDictionary from 'style-dictionary';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
mkdirSync('tokens', { recursive: true });
const tokens = { cor: { primitivo: { azul: { 500: { $value: '#0b5fff', $type: 'color' }, 600: { $value: '#0847c4', $type: 'color' } }, branco: { $value: '#ffffff', $type: 'color' }, cinza: { 900: { $value: '#111827', $type: 'color' } } },
  semantico: { acao: { fundo: { $value: '{cor.primitivo.azul.600}', $type: 'color' }, texto: { $value: '{cor.primitivo.branco}', $type: 'color' } }, texto: { padrao: { $value: '{cor.primitivo.cinza.900}', $type: 'color' } } } },
  espaco: { 1: { $value: '4px', $type: 'dimension' }, 2: { $value: '8px', $type: 'dimension' } } };
writeFileSync('tokens/base.json', JSON.stringify(tokens, null, 1));
const sd = new StyleDictionary({ source: ['tokens/base.json'], platforms: { css: { transformGroup: 'css', buildPath: 'build/', files: [{ destination: 'tokens.css', format: 'css/variables' }] } }, log: { verbosity: 'silent' } });
await sd.buildAllPlatforms();
console.log(readFileSync('build/tokens.css', 'utf8'));
