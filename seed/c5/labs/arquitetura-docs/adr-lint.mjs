// Verificador de ADRs (formato: título, status, data, contexto, decisão, alternativas, consequências).
// Uso: node adr-lint.mjs <diretório>   (código de saída 1 se houver problemas)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const STATUS = ['Proposto', 'Aceito', 'Rejeitado', 'Obsoleto'];
const SECOES = ['Status', 'Data', 'Contexto', 'Decisão', 'Alternativas consideradas', 'Consequências'];

export function secao(texto, nome) {
  const m = new RegExp('^## ' + nome + '\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm').exec(texto);
  return m ? m[1].trim() : null;
}

export function verificarAdr(arquivo, texto) {
  const erros = []; const num = /^(\d{4})-[a-z0-9-]+\.md$/.exec(arquivo);
  if (!num) erros.push('nome do arquivo fora do padrão NNNN-slug.md');
  const titulo = /^# ADR-(\d{4}): .+/m.exec(texto);
  if (!titulo) erros.push('título ausente (esperado "# ADR-NNNN: ...")');
  else if (num && titulo[1] !== num[1]) erros.push('número do título diferente do arquivo');
  for (const s of SECOES) if (secao(texto, s) === null) erros.push('seção ausente: ' + s);
  const status = secao(texto, 'Status');
  let substituidoPor = null;
  if (status) {
    const sub = /^Substituído por ADR-(\d{4})$/.exec(status);
    if (sub) substituidoPor = sub[1];
    else if (!STATUS.includes(status)) erros.push('status inválido: ' + status);
  }
  const data = secao(texto, 'Data');
  if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) erros.push('data fora do formato AAAA-MM-DD');
  const alt = secao(texto, 'Alternativas consideradas');
  if (alt !== null && status === 'Aceito' && (alt.match(/^- /gm) || []).length < 2) erros.push('ADR aceito precisa de ao menos 2 alternativas (itens com "- ")');
  const cons = secao(texto, 'Consequências');
  if (cons !== null && !(/positiv/i.test(cons) && /(negativ|risco)/i.test(cons))) erros.push('consequências devem citar efeitos positivos e negativos/riscos');
  const substitui = [...texto.matchAll(/Substitui ADR-(\d{4})/g)].map((m) => m[1]);
  return { numero: num ? num[1] : null, status, substituidoPor, substitui, erros };
}

export function verificarDiretorio(dir) {
  const arquivos = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  const res = arquivos.map((f) => ({ arquivo: f, ...verificarAdr(f, readFileSync(join(dir, f), 'utf8')) }));
  const globais = [];
  res.forEach((r, i) => { if (r.numero && Number(r.numero) !== i + 1) globais.push('numeração com lacuna ou repetição em ' + r.arquivo + ' (esperado ' + String(i + 1).padStart(4, '0') + ')'); });
  const porNumero = Object.fromEntries(res.filter((r) => r.numero).map((r) => [r.numero, r]));
  for (const r of res) {
    if (r.substituidoPor) {
      const alvo = porNumero[r.substituidoPor];
      if (!alvo) globais.push(r.arquivo + ': substituído por ADR-' + r.substituidoPor + ' inexistente');
      else if (!alvo.substitui.includes(r.numero)) globais.push(r.arquivo + ': ADR-' + r.substituidoPor + ' não declara "Substitui ADR-' + r.numero + '"');
    }
  }
  return { adrs: res, globais, total: res.reduce((s, r) => s + r.erros.length, 0) + globais.length };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const dir = process.argv[2] || 'adrs';
  const r = verificarDiretorio(dir);
  for (const a of r.adrs) console.log((a.erros.length ? '✖ ' : '✔ ') + a.arquivo + ' [' + (a.status || '?') + ']' + a.erros.map((e) => '\n    - ' + e).join(''));
  for (const g of r.globais) console.log('✖ ' + g);
  console.log(r.total ? r.total + ' problema(s)' : 'ADRs OK');
  process.exit(r.total ? 1 : 0);
}
