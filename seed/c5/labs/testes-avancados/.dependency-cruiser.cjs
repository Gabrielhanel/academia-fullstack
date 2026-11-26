module.exports = { forbidden: [
  { name: 'dominio-nao-depende-de-infra', severity: 'error', from: { path: '^arq/dominio' }, to: { path: '^arq/infra' } },
  { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } }
] };
