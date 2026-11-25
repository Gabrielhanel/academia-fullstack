import StyleDictionary from 'style-dictionary';
import { readFileSync, writeFileSync } from 'node:fs';
const base = JSON.parse(readFileSync('tokens/base.json', 'utf8'));
// modo escuro: só os semânticos mudam
writeFileSync('tokens/escuro.json', JSON.stringify({ cor: { semantico: { acao: { fundo: { $value: '{cor.primitivo.azul.500}', $type: 'color' } }, texto: { padrao: { $value: '{cor.primitivo.branco}', $type: 'color' } } } } }));
const sd = new StyleDictionary({ source: ['tokens/base.json'], platforms: { css: { transformGroup: 'css', buildPath: 'build/', files: [{ destination: 'refs.css', format: 'css/variables', options: { outputReferences: true } }] } }, log: { verbosity: 'silent' } });
await sd.buildAllPlatforms();
console.log(readFileSync('build/refs.css', 'utf8').split('\n').filter((l) => l.includes('semantico')).join('\n'));
const sdE = new StyleDictionary({ include: ['tokens/base.json'], source: ['tokens/escuro.json'], platforms: { css: { transformGroup: 'css', buildPath: 'build/', files: [{ destination: 'escuro.css', format: 'css/variables', options: { selector: '.dark', outputReferences: true }, filter: (t) => t.filePath.endsWith('escuro.json') }] } }, log: { verbosity: 'silent' } });
await sdE.buildAllPlatforms();
console.log(readFileSync('build/escuro.css', 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('/') && !l.startsWith(' *')).join('\n'));
