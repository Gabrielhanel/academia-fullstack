module.exports = { forbidden: [
  { name: 'sem-ciclos', severity: 'error', from: {}, to: { circular: true } },
  { name: 'shared-nao-importa-features', severity: 'error', from: { path: '^src/shared' }, to: { path: '^src/features' } },
  { name: 'feature-so-usa-api-publica', severity: 'error', from: { path: '^src/features/([^/]+)/' }, to: { path: '^src/features/(?!$1)[^/]+/(?!index\\.js)' } }
] };
