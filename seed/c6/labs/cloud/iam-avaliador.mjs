// Modelo didático da avaliação de políticas estilo AWS IAM: negação explícita > permissão > negação implícita.
// Simplificação: só Effect, Action e Resource com curingas (*); sem condições, boundaries, SCPs ou políticas de recurso.
const casa = (padrao, valor) => new RegExp('^' + padrao.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$').test(valor);
const lista = (x) => (Array.isArray(x) ? x : [x]);
export function avaliar(politicas, acao, recurso) {
  let permitido = false;
  for (const p of politicas) for (const s of lista(p.Statement)) {
    if (lista(s.Action).some((a) => casa(a, acao)) && lista(s.Resource).some((r) => casa(r, recurso))) {
      if (s.Effect === 'Deny') return { decisao: 'NEGADO', motivo: 'negação explícita' };
      if (s.Effect === 'Allow') permitido = true;
    }
  }
  return permitido ? { decisao: 'PERMITIDO', motivo: 'permissão explícita' } : { decisao: 'NEGADO', motivo: 'negação implícita' };
}
if (process.argv[1].endsWith('iam-avaliador.mjs')) {
  const leitura = { Statement: [{ Effect: 'Allow', Action: ['s3:GetObject', 's3:ListBucket'], Resource: ['arn:aws:s3:::dados', 'arn:aws:s3:::dados/*'] }] };
  const negaSegredo = { Statement: [{ Effect: 'Deny', Action: 's3:*', Resource: 'arn:aws:s3:::dados/segredo/*' }] };
  const casos = [
    [[leitura], 's3:GetObject', 'arn:aws:s3:::dados/relatorio.csv'],
    [[leitura], 's3:PutObject', 'arn:aws:s3:::dados/relatorio.csv'],
    [[leitura], 's3:GetObject', 'arn:aws:s3:::outro/x'],
    [[leitura, negaSegredo], 's3:GetObject', 'arn:aws:s3:::dados/segredo/chave.txt'],
    [[leitura, negaSegredo], 's3:GetObject', 'arn:aws:s3:::dados/publico/a.txt'],
    [[], 's3:GetObject', 'arn:aws:s3:::dados/a']
  ];
  for (const [pol, a, r] of casos) console.log(a.padEnd(14), r.padEnd(40), JSON.stringify(avaliar(pol, a, r)));
}
